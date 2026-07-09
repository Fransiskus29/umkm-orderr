"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase";
import { formatRupiah, KATEGORI_OPTIONS, type MenuItem } from "@/lib/types";
import { ImagePlus } from "lucide-react";

export default function MenuPage() {
  const supabase = createClient();
  const [umkmId, setUmkmId] = useState<string | null>(null);
  const [items, setItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);

  const [nama, setNama] = useState("");
  const [deskripsi, setDeskripsi] = useState("");
  const [harga, setHarga] = useState("");
  const [kategori, setKategori] = useState<string>(KATEGORI_OPTIONS[0]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [fotoFile, setFotoFile] = useState<File | null>(null);
  const [fotoPreview, setFotoPreview] = useState<string | null>(null);
  const [existingFotoUrl, setExistingFotoUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function loadItems(uid: string) {
    const { data } = await supabase
      .from("menu_items")
      .select("*")
      .eq("umkm_id", uid)
      .order("created_at", { ascending: false });
    setItems((data ?? []) as MenuItem[]);
  }

  useEffect(() => {
    async function init() {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;
      const { data: umkm } = await supabase
        .from("umkm")
        .select("id")
        .eq("user_id", user.id)
        .single();
      if (umkm) {
        setUmkmId(umkm.id);
        await loadItems(umkm.id);
      }
      setLoading(false);
    }
    init();
  }, []);

  function resetForm() {
    setNama("");
    setDeskripsi("");
    setHarga("");
    setKategori(KATEGORI_OPTIONS[0]);
    setEditingId(null);
    setFotoFile(null);
    setFotoPreview(null);
    setExistingFotoUrl(null);
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      setError("Ukuran foto maksimal 5MB.");
      return;
    }
    setFotoFile(file);
    setFotoPreview(URL.createObjectURL(file));
  }

  async function uploadFoto(): Promise<string | null> {
    if (!fotoFile || !umkmId) return existingFotoUrl;
    setUploading(true);
    const ext = fotoFile.name.split(".").pop();
    const path = `${umkmId}/${crypto.randomUUID()}.${ext}`;
    const { error: uploadError } = await supabase.storage
      .from("menu-photos")
      .upload(path, fotoFile, { upsert: true });
    setUploading(false);
    if (uploadError) {
      setError(`Gagal upload foto: ${uploadError.message}`);
      return existingFotoUrl;
    }
    const { data } = supabase.storage.from("menu-photos").getPublicUrl(path);
    return data.publicUrl;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!umkmId) return;
    const hargaNum = parseInt(harga, 10);
    if (isNaN(hargaNum) || hargaNum < 0) {
      setError("Harga tidak valid.");
      return;
    }

    const foto_url = await uploadFoto();

    if (editingId) {
      const { error } = await supabase
        .from("menu_items")
        .update({ nama, deskripsi, harga: hargaNum, kategori, foto_url })
        .eq("id", editingId);
      if (error) return setError(error.message);
    } else {
      const { error } = await supabase.from("menu_items").insert({
        umkm_id: umkmId,
        nama,
        deskripsi,
        harga: hargaNum,
        kategori,
        foto_url,
        tersedia: true,
      });
      if (error) return setError(error.message);
    }

    resetForm();
    await loadItems(umkmId);
  }

  function startEdit(item: MenuItem) {
    setEditingId(item.id);
    setNama(item.nama);
    setDeskripsi(item.deskripsi ?? "");
    setHarga(String(item.harga));
    setKategori(item.kategori || KATEGORI_OPTIONS[0]);
    setExistingFotoUrl(item.foto_url);
    setFotoPreview(item.foto_url);
    setFotoFile(null);
  }

  async function toggleTersedia(item: MenuItem) {
    await supabase.from("menu_items").update({ tersedia: !item.tersedia }).eq("id", item.id);
    if (umkmId) await loadItems(umkmId);
  }

  async function handleDelete(id: string) {
    if (!confirm("Hapus menu ini?")) return;
    await supabase.from("menu_items").delete().eq("id", id);
    if (umkmId) await loadItems(umkmId);
  }

  if (loading) return <p>Memuat...</p>;

  return (
    <div>
      <h1 className="mb-4 text-2xl font-bold">Kelola Menu</h1>

      <form onSubmit={handleSubmit} className="mb-6 max-w-2xl space-y-3 rounded-xl bg-white p-4 shadow-card">
        <h2 className="font-semibold">{editingId ? "Edit Menu" : "Tambah Menu Baru"}</h2>

        <div>
          <label className="mb-1 block text-sm font-medium">Foto Produk</label>
          <label className="flex h-32 cursor-pointer flex-col items-center justify-center gap-1 rounded-lg border-2 border-dashed border-outline-variant bg-surface-low text-secondary hover:bg-surface-container">
            {fotoPreview ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={fotoPreview} alt="Preview" className="h-full w-full rounded-lg object-cover" />
            ) : (
              <>
                <ImagePlus className="h-6 w-6" />
                <span className="text-xs">Klik untuk unggah foto (PNG/JPG, maks 5MB)</span>
              </>
            )}
            <input type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
          </label>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <label className="mb-1 block text-sm font-medium">Nama Menu</label>
            <input
              required
              value={nama}
              onChange={(e) => setNama(e.target.value)}
              className="w-full rounded-lg border border-outline-variant px-3 py-2"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">Harga (Rp)</label>
            <input
              required
              type="number"
              min={0}
              value={harga}
              onChange={(e) => setHarga(e.target.value)}
              className="w-full rounded-lg border border-outline-variant px-3 py-2"
            />
          </div>
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium">Kategori</label>
          <select
            value={kategori}
            onChange={(e) => setKategori(e.target.value)}
            className="w-full rounded-lg border border-outline-variant px-3 py-2"
          >
            {KATEGORI_OPTIONS.map((k) => (
              <option key={k} value={k}>
                {k}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium">Deskripsi</label>
          <input
            value={deskripsi}
            onChange={(e) => setDeskripsi(e.target.value)}
            className="w-full rounded-lg border border-outline-variant px-3 py-2"
          />
        </div>
        {error && <p className="text-sm text-red-600">{error}</p>}
        <div className="flex gap-2">
          <button
            disabled={uploading}
            className="rounded-lg bg-brand-500 px-4 py-2 text-sm font-medium text-white hover:bg-brand-600 disabled:opacity-50"
          >
            {uploading ? "Mengunggah..." : editingId ? "Simpan Perubahan" : "Tambah Menu"}
          </button>
          {editingId && (
            <button
              type="button"
              onClick={resetForm}
              className="rounded-lg border border-outline-variant px-4 py-2 text-sm"
            >
              Batal
            </button>
          )}
        </div>
      </form>

      <h2 className="mb-3 font-semibold">Daftar Menu</h2>
      <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
        {items.map((item) => (
          <div key={item.id} className="overflow-hidden rounded-xl bg-white shadow-card">
            {item.foto_url && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={item.foto_url} alt={item.nama} className="h-32 w-full object-cover" />
            )}
            <div className="flex items-center justify-between p-4">
              <div>
                <p className="font-medium">
                  {item.nama}{" "}
                  <span className="ml-1 rounded-full bg-surface-container px-2 py-0.5 text-xs text-brand-600">
                    {item.kategori}
                  </span>{" "}
                  {!item.tersedia && (
                    <span className="ml-2 rounded-full bg-surface-highest px-2 py-0.5 text-xs text-secondary">
                      Nonaktif
                    </span>
                  )}
                </p>
                <p className="text-sm text-secondary">{item.deskripsi}</p>
                <p className="font-medium text-brand-500">{formatRupiah(item.harga)}</p>
              </div>
              <div className="flex flex-col items-end gap-1 text-sm">
                <button onClick={() => toggleTersedia(item)} className="text-secondary hover:underline">
                  {item.tersedia ? "Nonaktifkan" : "Aktifkan"}
                </button>
                <button onClick={() => startEdit(item)} className="text-brand-500 hover:underline">
                  Edit
                </button>
                <button onClick={() => handleDelete(item.id)} className="text-red-600 hover:underline">
                  Hapus
                </button>
              </div>
            </div>
          </div>
        ))}
        {items.length === 0 && <p className="text-secondary">Belum ada menu.</p>}
      </div>
    </div>
  );
}

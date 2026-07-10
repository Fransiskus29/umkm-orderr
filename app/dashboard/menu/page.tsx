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

  if (loading) return <div className="flex h-40 items-center justify-center"><div className="h-8 w-8 animate-spin rounded-full border-4 border-sf-red border-t-transparent" /></div>;

  return (
    <div>
      <h1 className="mb-4 text-lg font-extrabold text-sf-text">Kelola Menu</h1>

      <form onSubmit={handleSubmit} className="mb-5 space-y-3 rounded-2xl bg-white p-4 shadow-card">
        <h2 className="text-sm font-bold text-sf-text">{editingId ? "Edit Menu" : "Tambah Menu Baru"}</h2>

        <div>
          <label className="mb-1.5 block text-xs font-medium text-sf-text">Foto Produk</label>
          <label className="flex h-28 cursor-pointer flex-col items-center justify-center gap-1 rounded-xl border-2 border-dashed border-sf-border bg-sf-bg text-sf-text-secondary hover:border-sf-red/40">
            {fotoPreview ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={fotoPreview} alt="Preview" className="h-full w-full rounded-xl object-cover" />
            ) : (
              <>
                <ImagePlus className="h-6 w-6" />
                <span className="text-[11px]">Klik unggah foto (maks 5MB)</span>
              </>
            )}
            <input type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
          </label>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <input required value={nama} onChange={(e) => setNama(e.target.value)} placeholder="Nama menu" className="w-full rounded-xl border border-sf-border bg-sf-bg px-3.5 py-2.5 text-sm outline-none focus:border-sf-red" />
          <input required type="number" min={0} value={harga} onChange={(e) => setHarga(e.target.value)} placeholder="Harga (Rp)" className="w-full rounded-xl border border-sf-border bg-sf-bg px-3.5 py-2.5 text-sm outline-none focus:border-sf-red" />
        </div>
        <select value={kategori} onChange={(e) => setKategori(e.target.value)} className="w-full rounded-xl border border-sf-border bg-sf-bg px-3.5 py-2.5 text-sm outline-none focus:border-sf-red">
          {KATEGORI_OPTIONS.map((k) => <option key={k} value={k}>{k}</option>)}
        </select>
        <input value={deskripsi} onChange={(e) => setDeskripsi(e.target.value)} placeholder="Deskripsi (opsional)" className="w-full rounded-xl border border-sf-border bg-sf-bg px-3.5 py-2.5 text-sm outline-none focus:border-sf-red" />
        {error && <p className="rounded-lg bg-sf-red/10 px-3 py-2 text-xs text-sf-red">{error}</p>}
        <div className="flex gap-2">
          <button disabled={uploading} className="rounded-xl bg-sf-red px-4 py-2.5 text-xs font-bold text-white disabled:opacity-50">
            {uploading ? "Mengunggah..." : editingId ? "Simpan" : "Tambah Menu"}
          </button>
          {editingId && <button type="button" onClick={resetForm} className="rounded-xl border border-sf-border px-4 py-2.5 text-xs text-sf-text-secondary">Batal</button>}
        </div>
      </form>

      <h2 className="mb-3 text-sm font-bold text-sf-text">Daftar Menu</h2>
      <div className="space-y-3">
        {items.map((item) => (
          <div key={item.id} className="flex gap-3 rounded-2xl bg-white p-3 shadow-card">
            {item.foto_url && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={item.foto_url} alt={item.nama} className="h-16 w-16 shrink-0 rounded-xl object-cover" />
            )}
            <div className="min-w-0 flex-1">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="text-sm font-bold text-sf-text">{item.nama}</p>
                  <p className="text-[11px] text-sf-text-secondary">{item.kategori}{!item.tersedia && " · Nonaktif"}</p>
                </div>
              </div>
              <p className="mt-0.5 text-xs font-extrabold text-sf-red">{formatRupiah(item.harga)}</p>
              <div className="mt-1.5 flex gap-2 text-[11px]">
                <button onClick={() => toggleTersedia(item)} className="text-sf-text-secondary underline">{item.tersedia ? "Nonaktifkan" : "Aktifkan"}</button>
                <button onClick={() => startEdit(item)} className="text-sf-red font-medium">Edit</button>
                <button onClick={() => handleDelete(item.id)} className="text-red-500">Hapus</button>
              </div>
            </div>
          </div>
        ))}
        {items.length === 0 && <div className="rounded-2xl bg-white p-8 text-center shadow-card"><p className="text-3xl">🍽️</p><p className="mt-2 text-sm text-sf-text-secondary">Belum ada menu.</p></div>}
      </div>
    </div>
  );
}

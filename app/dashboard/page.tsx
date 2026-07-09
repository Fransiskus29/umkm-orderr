"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase";
import type { Umkm } from "@/lib/types";
import { UtensilsCrossed, ShoppingBag, Clock, Copy, Check, Pencil, Download } from "lucide-react";

export default function DashboardHome() {
  const supabase = createClient();
  const [umkm, setUmkm] = useState<Umkm | null>(null);
  const [loading, setLoading] = useState(true);
  const [storeUrl, setStoreUrl] = useState("");
  const [copied, setCopied] = useState(false);
  const [stats, setStats] = useState({ totalMenu: 0, totalPesanan: 0, pesananMenunggu: 0 });

  const [editing, setEditing] = useState(false);
  const [namaUsaha, setNamaUsaha] = useState("");
  const [deskripsi, setDeskripsi] = useState("");
  const [noHp, setNoHp] = useState("");
  const [jamOperasional, setJamOperasional] = useState("");
  const [saving, setSaving] = useState(false);

  async function loadData() {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;
    const { data } = await supabase.from("umkm").select("*").eq("user_id", user.id).single();
    setUmkm(data as Umkm);

    if (data) {
      if (typeof window !== "undefined") {
        setStoreUrl(`${window.location.origin}/toko/${data.slug}`);
      }
      setNamaUsaha(data.nama_usaha);
      setDeskripsi(data.deskripsi ?? "");
      setNoHp(data.no_hp ?? "");
      setJamOperasional(data.jam_operasional ?? "");

      const [{ count: totalMenu }, { count: totalPesanan }, { count: pesananMenunggu }] =
        await Promise.all([
          supabase
            .from("menu_items")
            .select("*", { count: "exact", head: true })
            .eq("umkm_id", data.id),
          supabase
            .from("orders")
            .select("*", { count: "exact", head: true })
            .eq("umkm_id", data.id),
          supabase
            .from("orders")
            .select("*", { count: "exact", head: true })
            .eq("umkm_id", data.id)
            .eq("status", "pending"),
        ]);
      setStats({
        totalMenu: totalMenu ?? 0,
        totalPesanan: totalPesanan ?? 0,
        pesananMenunggu: pesananMenunggu ?? 0,
      });
    }
    setLoading(false);
  }

  useEffect(() => {
    loadData();
  }, []);

  function copyLink() {
    navigator.clipboard.writeText(storeUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  async function handleSaveProfile(e: React.FormEvent) {
    e.preventDefault();
    if (!umkm) return;
    setSaving(true);
    await supabase
      .from("umkm")
      .update({ nama_usaha: namaUsaha, deskripsi, no_hp: noHp, jam_operasional: jamOperasional })
      .eq("id", umkm.id);
    setSaving(false);
    setEditing(false);
    await loadData();
  }

  if (loading) return <p>Memuat...</p>;
  if (!umkm) return <p>Data toko tidak ditemukan.</p>;

  const qrUrl = storeUrl
    ? `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(storeUrl)}`
    : "";

  return (
    <div>
      <div className="mb-1 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Informasi Toko</h1>
        {!editing && (
          <button
            onClick={() => setEditing(true)}
            className="flex items-center gap-1 rounded-lg bg-brand-500 px-3 py-1.5 text-sm font-medium text-white hover:bg-brand-600"
          >
            <Pencil className="h-4 w-4" /> Edit Profil
          </button>
        )}
      </div>
      <p className="mb-6 text-secondary">Ringkasan performa dan profil publik Anda.</p>

      <div className="mb-6 grid gap-4 sm:grid-cols-3">
        <div className="rounded-xl bg-white p-5 shadow-card">
          <UtensilsCrossed className="mb-2 h-5 w-5 text-brand-500" />
          <p className="text-sm text-secondary">Total Menu</p>
          <p className="text-2xl font-bold">{stats.totalMenu}</p>
        </div>
        <div className="rounded-xl bg-white p-5 shadow-card">
          <ShoppingBag className="mb-2 h-5 w-5 text-brand-500" />
          <p className="text-sm text-secondary">Total Pesanan</p>
          <p className="text-2xl font-bold">{stats.totalPesanan}</p>
        </div>
        <div className="rounded-xl bg-white p-5 shadow-card">
          <Clock className="mb-2 h-5 w-5 text-brand-500" />
          <p className="text-sm text-secondary">Menunggu Konfirmasi</p>
          <p className="text-2xl font-bold">{stats.pesananMenunggu}</p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_260px]">
        <div className="rounded-xl bg-white p-5 shadow-card">
          {editing ? (
            <form onSubmit={handleSaveProfile} className="space-y-3">
              <div>
                <label className="mb-1 block text-sm font-medium">Nama Usaha</label>
                <input
                  required
                  value={namaUsaha}
                  onChange={(e) => setNamaUsaha(e.target.value)}
                  className="w-full rounded-lg border border-outline-variant px-3 py-2"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium">Deskripsi</label>
                <textarea
                  value={deskripsi}
                  onChange={(e) => setDeskripsi(e.target.value)}
                  rows={2}
                  className="w-full rounded-lg border border-outline-variant px-3 py-2"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium">No. HP / WhatsApp</label>
                <input
                  value={noHp}
                  onChange={(e) => setNoHp(e.target.value)}
                  className="w-full rounded-lg border border-outline-variant px-3 py-2"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium">Jam Operasional</label>
                <input
                  value={jamOperasional}
                  onChange={(e) => setJamOperasional(e.target.value)}
                  placeholder="Contoh: Senin-Jumat 08:00-20:00, Sabtu 09:00-21:00"
                  className="w-full rounded-lg border border-outline-variant px-3 py-2"
                />
              </div>
              <div className="flex gap-2">
                <button
                  disabled={saving}
                  className="rounded-lg bg-brand-500 px-4 py-2 text-sm font-medium text-white hover:bg-brand-600 disabled:opacity-50"
                >
                  {saving ? "Menyimpan..." : "Simpan"}
                </button>
                <button
                  type="button"
                  onClick={() => setEditing(false)}
                  className="rounded-lg border border-outline-variant px-4 py-2 text-sm"
                >
                  Batal
                </button>
              </div>
            </form>
          ) : (
            <>
              <p className="text-sm text-secondary">Nama Usaha</p>
              <p className="mb-3 font-medium">{umkm.nama_usaha}</p>
              <p className="text-sm text-secondary">Deskripsi</p>
              <p className="mb-3 font-medium">{umkm.deskripsi || "-"}</p>
              <p className="text-sm text-secondary">No. HP / WhatsApp</p>
              <p className="mb-3 font-medium">{umkm.no_hp || "-"}</p>
              <p className="text-sm text-secondary">Jam Operasional</p>
              <p className="mb-3 font-medium">{umkm.jam_operasional || "Belum diatur"}</p>
              <p className="mb-1 text-sm text-secondary">Link Toko Publik (bagikan ke pelanggan)</p>
              <div className="flex items-center gap-2">
                <a href={storeUrl} target="_blank" className="break-all font-medium text-brand-500 underline">
                  {storeUrl}
                </a>
                <button
                  onClick={copyLink}
                  className="shrink-0 rounded-lg border border-outline-variant p-1.5 hover:bg-surface-container"
                  title="Salin link"
                >
                  {copied ? <Check className="h-4 w-4 text-green-600" /> : <Copy className="h-4 w-4" />}
                </button>
              </div>
            </>
          )}
        </div>

        <div className="flex flex-col items-center rounded-xl bg-white p-5 text-center shadow-card">
          <p className="mb-2 text-sm font-medium text-secondary">QR Code Toko</p>
          {qrUrl && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={qrUrl} alt="QR Code toko" className="mb-3 h-40 w-40" />
          )}
          <p className="mb-3 text-xs text-secondary">Scan untuk lihat menu lengkap</p>
          {qrUrl && (
            <a
              href={qrUrl}
              download={`qr-${umkm.slug}.png`}
              className="flex items-center gap-1 text-sm font-medium text-brand-500 hover:underline"
            >
              <Download className="h-4 w-4" /> Unduh QR Code
            </a>
          )}
        </div>
      </div>
    </div>
  );
}

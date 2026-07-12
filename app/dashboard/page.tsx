"use client";

import { useEffect, useRef, useState } from "react";
import { createClient } from "@/lib/supabase";
import type { Umkm, InfoPembayaran } from "@/lib/types";
import { UtensilsCrossed, ShoppingBag, Clock, Copy, Check, Pencil, Download, Camera, CreditCard, Upload } from "lucide-react";

const DEFAULT_INFO: InfoPembayaran = { bank_nama: "", bank_rekening: "", bank_atas_nama: "", ewallet_nama: "", ewallet_nomor: "", qris_url: "" };

export default function DashboardHome() {
  const supabase = createClient();
  const [umkm, setUmkm] = useState<Umkm | null>(null);
  const [loading, setLoading] = useState(true);
  const [storeUrl, setStoreUrl] = useState("");
  const [copied, setCopied] = useState(false);
  const [stats, setStats] = useState({ totalMenu: 0, totalPesanan: 0, pesananMenunggu: 0 });
  const [editing, setEditing] = useState(false);
  const [namaUsaha, setNamaUsaha] = useState(""); const [deskripsi, setDeskripsi] = useState("");
  const [noHp, setNoHp] = useState(""); const [jamOperasional, setJamOperasional] = useState("");
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const [editingBayar, setEditingBayar] = useState(false);
  const [infoBayar, setInfoBayar] = useState<InfoPembayaran>(DEFAULT_INFO);
  const [uploadingQris, setUploadingQris] = useState(false);
  const qrisRef = useRef<HTMLInputElement>(null);

  async function loadData() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const { data } = await supabase.from("umkm").select("*").eq("user_id", user.id).single();
    setUmkm(data as Umkm);
    if (data) {
      if (typeof window !== "undefined") setStoreUrl(`${window.location.origin}/toko/${data.slug}`);
      setNamaUsaha(data.nama_usaha); setDeskripsi(data.deskripsi ?? ""); setNoHp(data.no_hp ?? ""); setJamOperasional(data.jam_operasional ?? "");
      setInfoBayar({ ...DEFAULT_INFO, ...(data.info_pembayaran as any || {}) });
      const [{ count: a }, { count: b }, { count: c }] = await Promise.all([
        supabase.from("menu_items").select("*", { count: "exact", head: true }).eq("umkm_id", data.id),
        supabase.from("orders").select("*", { count: "exact", head: true }).eq("umkm_id", data.id),
        supabase.from("orders").select("*", { count: "exact", head: true }).eq("umkm_id", data.id).eq("status", "pending"),
      ]);
      setStats({ totalMenu: a ?? 0, totalPesanan: b ?? 0, pesananMenunggu: c ?? 0 });
    }
    setLoading(false);
  }

  useEffect(() => { loadData(); }, []);
  function copyLink() { navigator.clipboard.writeText(storeUrl); setCopied(true); setTimeout(() => setCopied(false), 1500); }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault(); if (!umkm) return; setSaving(true);
    await supabase.from("umkm").update({ nama_usaha: namaUsaha, deskripsi, no_hp: noHp, jam_operasional: jamOperasional }).eq("id", umkm.id);
    setSaving(false); setEditing(false); await loadData();
  }

  async function handleUploadFoto(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]; if (!file || !umkm) return;
    setUploading(true);
    const ext = file.name.split(".").pop() ?? "jpg";
    const path = `${umkm.id}/${Date.now()}.${ext}`;
    const { error: uploadErr } = await supabase.storage.from("toko-avatars").upload(path, file, { upsert: true });
    if (!uploadErr) {
      const { data: urlData } = supabase.storage.from("toko-avatars").getPublicUrl(path);
      await supabase.from("umkm").update({ foto_url: urlData.publicUrl }).eq("id", umkm.id);
      await loadData();
    }
    setUploading(false);
  }

  async function handleSaveBayar(e: React.FormEvent) {
    e.preventDefault(); if (!umkm) return; setSaving(true);
    await supabase.from("umkm").update({ info_pembayaran: infoBayar }).eq("id", umkm.id);
    setSaving(false); setEditingBayar(false); await loadData();
  }

  async function handleUploadQris(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]; if (!file || !umkm) return;
    setUploadingQris(true);
    const ext = file.name.split(".").pop() ?? "png";
    const path = `qris/${umkm.id}/${Date.now()}.${ext}`;
    const { error: uploadErr } = await supabase.storage.from("toko-avatars").upload(path, file, { upsert: true });
    if (!uploadErr) {
      const { data: urlData } = supabase.storage.from("toko-avatars").getPublicUrl(path);
      setInfoBayar((p) => ({ ...p, qris_url: urlData.publicUrl }));
    }
    setUploadingQris(false);
  }

  if (loading) return <div className="flex h-40 items-center justify-center"><div className="h-8 w-8 animate-spin rounded-full border-4 border-sf-red border-t-transparent" /></div>;
  if (!umkm) return <p className="text-sm text-sf-text-secondary">Data tidak ditemukan.</p>;

  const qrUrl = storeUrl ? `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(storeUrl)}` : "";

  return (
    <div>
      <h1 className="mb-4 text-lg font-extrabold text-sf-text">Toko Saya</h1>

      {/* Stats */}
      <div className="mb-4 grid grid-cols-3 gap-3">
        {[
          { icon: UtensilsCrossed, label: "Menu", value: stats.totalMenu },
          { icon: ShoppingBag, label: "Pesanan", value: stats.totalPesanan },
          { icon: Clock, label: "Menunggu", value: stats.pesananMenunggu },
        ].map(({ icon: Icon, label, value }) => (
          <div key={label} className="rounded-2xl bg-white p-4 shadow-card text-center">
            <Icon className="mx-auto mb-1 h-5 w-5 text-sf-red" />
            <p className="text-xl font-extrabold text-sf-text">{value}</p>
            <p className="text-[11px] text-sf-text-secondary">{label}</p>
          </div>
        ))}
      </div>

      {/* Profile */}
      <div className="rounded-2xl bg-white p-4 shadow-card">
        <div className="mb-4 flex justify-center">
          <div className="relative">
            {umkm.foto_url ? (
              <img src={umkm.foto_url} alt="Foto Toko" className="h-20 w-20 rounded-full object-cover ring-4 ring-sf-red/10" />
            ) : (
              <div className="flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-sf-red/10 to-sf-orange/10 text-2xl font-extrabold text-sf-red/30 ring-4 ring-sf-red/10">
                {umkm.nama_usaha.charAt(0)}
              </div>
            )}
            <button onClick={() => fileRef.current?.click()} disabled={uploading} className="absolute -bottom-1 -right-1 flex h-8 w-8 items-center justify-center rounded-full bg-sf-red text-white shadow-lg transition hover:bg-sf-red-dark disabled:opacity-50">
              <Camera className="h-4 w-4" />
            </button>
            <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleUploadFoto} />
          </div>
        </div>

        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-sm font-bold text-sf-text">Profil Toko</h2>
          {!editing && (
            <button onClick={() => setEditing(true)} className="flex items-center gap-1 rounded-lg bg-sf-bg px-3 py-1.5 text-xs font-medium text-sf-text-secondary">
              <Pencil className="h-3.5 w-3.5" /> Edit
            </button>
          )}
        </div>
        {editing ? (
          <form onSubmit={handleSave} className="space-y-2.5">
            <input required value={namaUsaha} onChange={(e) => setNamaUsaha(e.target.value)} placeholder="Nama usaha" className="w-full rounded-xl border border-sf-border bg-sf-bg px-3.5 py-2.5 text-sm outline-none focus:border-sf-red" />
            <textarea value={deskripsi} onChange={(e) => setDeskripsi(e.target.value)} placeholder="Deskripsi" rows={2} className="w-full rounded-xl border border-sf-border bg-sf-bg px-3.5 py-2.5 text-sm outline-none focus:border-sf-red" />
            <input value={noHp} onChange={(e) => setNoHp(e.target.value)} placeholder="No. HP" className="w-full rounded-xl border border-sf-border bg-sf-bg px-3.5 py-2.5 text-sm outline-none focus:border-sf-red" />
            <input value={jamOperasional} onChange={(e) => setJamOperasional(e.target.value)} placeholder="Jam operasional" className="w-full rounded-xl border border-sf-border bg-sf-bg px-3.5 py-2.5 text-sm outline-none focus:border-sf-red" />
            <div className="flex gap-2">
              <button disabled={saving} className="rounded-xl bg-sf-red px-4 py-2 text-xs font-bold text-white disabled:opacity-50">{saving ? "..." : "Simpan"}</button>
              <button type="button" onClick={() => setEditing(false)} className="rounded-xl border border-sf-border px-4 py-2 text-xs text-sf-text-secondary">Batal</button>
            </div>
          </form>
        ) : (
          <div className="space-y-2 text-sm">
            <div><p className="text-[11px] text-sf-text-secondary">Nama Usaha</p><p className="font-medium">{umkm.nama_usaha}</p></div>
            <div><p className="text-[11px] text-sf-text-secondary">Deskripsi</p><p className="font-medium">{umkm.deskripsi || "-"}</p></div>
            <div><p className="text-[11px] text-sf-text-secondary">No. HP</p><p className="font-medium">{umkm.no_hp || "-"}</p></div>
            <div><p className="text-[11px] text-sf-text-secondary">Jam Operasional</p><p className="font-medium">{umkm.jam_operasional || "-"}</p></div>
            <div>
              <p className="text-[11px] text-sf-text-secondary">Link Toko</p>
              <div className="flex items-center gap-2">
                <a href={storeUrl} target="_blank" className="break-all text-xs font-medium text-sf-red underline">{storeUrl}</a>
                <button onClick={copyLink} className="shrink-0 p-1">{copied ? <Check className="h-3.5 w-3.5 text-sf-green" /> : <Copy className="h-3.5 w-3.5 text-sf-text-secondary" />}</button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Info Pembayaran */}
      <div className="mt-3 rounded-2xl bg-white p-4 shadow-card">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-sm font-bold text-sf-text flex items-center gap-1.5"><CreditCard className="h-4 w-4 text-sf-red" /> Info Pembayaran</h2>
          {!editingBayar && (
            <button onClick={() => setEditingBayar(true)} className="flex items-center gap-1 rounded-lg bg-sf-bg px-3 py-1.5 text-xs font-medium text-sf-text-secondary">
              <Pencil className="h-3.5 w-3.5" /> Edit
            </button>
          )}
        </div>

        {editingBayar ? (
          <form onSubmit={handleSaveBayar} className="space-y-3">
            {/* Transfer Bank */}
            <div className="rounded-xl bg-sf-bg p-3">
              <p className="mb-2 text-xs font-bold text-sf-text">Transfer Bank</p>
              <input value={infoBayar.bank_nama} onChange={(e) => setInfoBayar((p) => ({ ...p, bank_nama: e.target.value }))} placeholder="Nama Bank (BCA, Mandiri, BRI...)" className="mb-1.5 w-full rounded-lg border border-sf-border bg-white px-3 py-2 text-sm outline-none focus:border-sf-red" />
              <input value={infoBayar.bank_rekening} onChange={(e) => setInfoBayar((p) => ({ ...p, bank_rekening: e.target.value }))} placeholder="Nomor Rekening" className="mb-1.5 w-full rounded-lg border border-sf-border bg-white px-3 py-2 text-sm outline-none focus:border-sf-red" />
              <input value={infoBayar.bank_atas_nama} onChange={(e) => setInfoBayar((p) => ({ ...p, bank_atas_nama: e.target.value }))} placeholder="Atas Nama" className="w-full rounded-lg border border-sf-border bg-white px-3 py-2 text-sm outline-none focus:border-sf-red" />
            </div>

            {/* E-Wallet */}
            <div className="rounded-xl bg-sf-bg p-3">
              <p className="mb-2 text-xs font-bold text-sf-text">E-Wallet</p>
              <input value={infoBayar.ewallet_nama} onChange={(e) => setInfoBayar((p) => ({ ...p, ewallet_nama: e.target.value }))} placeholder="Nama E-Wallet (GoPay, OVO, Dana...)" className="mb-1.5 w-full rounded-lg border border-sf-border bg-white px-3 py-2 text-sm outline-none focus:border-sf-red" />
              <input value={infoBayar.ewallet_nomor} onChange={(e) => setInfoBayar((p) => ({ ...p, ewallet_nomor: e.target.value }))} placeholder="Nomor HP / ID" className="w-full rounded-lg border border-sf-border bg-white px-3 py-2 text-sm outline-none focus:border-sf-red" />
            </div>

            {/* QRIS */}
            <div className="rounded-xl bg-sf-bg p-3">
              <p className="mb-2 text-xs font-bold text-sf-text">QRIS</p>
              {infoBayar.qris_url && (
                <div className="mb-2 text-center">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={infoBayar.qris_url} alt="QRIS" className="mx-auto h-32 w-32 rounded-lg object-contain" />
                </div>
              )}
              <button type="button" onClick={() => qrisRef.current?.click()} disabled={uploadingQris} className="flex w-full items-center justify-center gap-1.5 rounded-lg border border-dashed border-sf-border bg-white px-3 py-2.5 text-sm text-sf-text-secondary transition hover:border-sf-red hover:text-sf-red">
                <Upload className="h-4 w-4" />
                {uploadingQris ? "Mengunggah..." : infoBayar.qris_url ? "Ganti Gambar QRIS" : "Upload Gambar QRIS"}
              </button>
              <input ref={qrisRef} type="file" accept="image/*" className="hidden" onChange={handleUploadQris} />
            </div>

            <div className="flex gap-2">
              <button disabled={saving} className="rounded-xl bg-sf-red px-4 py-2 text-xs font-bold text-white disabled:opacity-50">{saving ? "..." : "Simpan"}</button>
              <button type="button" onClick={() => setEditingBayar(false)} className="rounded-xl border border-sf-border px-4 py-2 text-xs text-sf-text-secondary">Batal</button>
            </div>
          </form>
        ) : (
          <div className="space-y-2 text-sm">
            {infoBayar.bank_nama ? (
              <div className="rounded-xl bg-sf-bg p-3">
                <p className="text-[11px] text-sf-text-secondary">Transfer Bank</p>
                <p className="font-medium">{infoBayar.bank_nama} - {infoBayar.bank_rekening}</p>
                <p className="text-xs text-sf-text-secondary">a.n. {infoBayar.bank_atas_nama}</p>
              </div>
            ) : null}
            {infoBayar.ewallet_nama ? (
              <div className="rounded-xl bg-sf-bg p-3">
                <p className="text-[11px] text-sf-text-secondary">E-Wallet</p>
                <p className="font-medium">{infoBayar.ewallet_nama} - {infoBayar.ewallet_nomor}</p>
              </div>
            ) : null}
            {infoBayar.qris_url ? (
              <div className="rounded-xl bg-sf-bg p-3 text-center">
                <p className="mb-1 text-[11px] text-sf-text-secondary">QRIS</p>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={infoBayar.qris_url} alt="QRIS" className="mx-auto h-32 w-32 rounded-lg object-contain" />
              </div>
            ) : null}
            {!infoBayar.bank_nama && !infoBayar.ewallet_nama && !infoBayar.qris_url && (
              <p className="text-xs text-sf-text-secondary">Belum ada info pembayaran. Klik Edit untuk menambahkan.</p>
            )}
          </div>
        )}
      </div>

      {/* QR Code */}
      <div className="mt-3 rounded-2xl bg-white p-4 shadow-card text-center">
        <p className="mb-2 text-xs font-bold text-sf-text">QR Code Toko</p>
        {qrUrl && <img src={qrUrl} alt="QR" className="mx-auto mb-2 h-32 w-32" />}
        {qrUrl && (
          <a href={qrUrl} download={`qr-${umkm.slug}.png`} className="text-xs font-medium text-sf-red">
            <Download className="mr-1 inline h-3.5 w-3.5" />Unduh QR
          </a>
        )}
      </div>
    </div>
  );
}

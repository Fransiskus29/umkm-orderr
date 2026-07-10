"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase";
import Link from "next/link";

function slugify(t: string) { return t.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)+/g, ""); }

export default function RegisterPage() {
  const router = useRouter(); const supabase = createClient();
  const [namaUsaha, setNamaUsaha] = useState(""); const [email, setEmail] = useState("");
  const [password, setPassword] = useState(""); const [noHp, setNoHp] = useState("");
  const [deskripsi, setDeskripsi] = useState(""); const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault(); setError(null); setLoading(true);
    const { data, error: ae } = await supabase.auth.signUp({ email, password });
    if (ae || !data.user) { setError(ae?.message || "Gagal."); setLoading(false); return; }
    const slug = slugify(namaUsaha) || "umkm";
    const { error: ue } = await supabase.from("umkm").insert({ user_id: data.user.id, nama_usaha: namaUsaha, slug, deskripsi, no_hp: noHp });
    if (ue) { setError(ue.message); setLoading(false); return; }
    router.push("/dashboard"); router.refresh();
  }

  return (
    <main className="min-h-screen bg-white flex flex-col items-center justify-center px-5">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-sf-red text-2xl font-extrabold text-white">P</div>
          <h1 className="text-xl font-extrabold text-sf-text">Daftarkan UMKM</h1>
          <p className="mt-1 text-sm text-sf-text-secondary">Mulai terima pesanan online</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-3">
          <input required value={namaUsaha} onChange={(e) => setNamaUsaha(e.target.value)} placeholder="Nama Usaha" className="w-full rounded-xl border border-sf-border bg-sf-bg px-4 py-3 text-sm outline-none focus:border-sf-red" />
          <input value={deskripsi} onChange={(e) => setDeskripsi(e.target.value)} placeholder="Deskripsi singkat" className="w-full rounded-xl border border-sf-border bg-sf-bg px-4 py-3 text-sm outline-none focus:border-sf-red" />
          <input required value={noHp} onChange={(e) => setNoHp(e.target.value)} placeholder="No. HP / WhatsApp" className="w-full rounded-xl border border-sf-border bg-sf-bg px-4 py-3 text-sm outline-none focus:border-sf-red" />
          <input required type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" className="w-full rounded-xl border border-sf-border bg-sf-bg px-4 py-3 text-sm outline-none focus:border-sf-red" />
          <input required type="password" minLength={6} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password (min 6 karakter)" className="w-full rounded-xl border border-sf-border bg-sf-bg px-4 py-3 text-sm outline-none focus:border-sf-red" />
          {error && <p className="rounded-lg bg-sf-red/10 px-3 py-2 text-xs text-sf-red">{error}</p>}
          <button disabled={loading} className="w-full rounded-xl bg-sf-red py-3 text-sm font-bold text-white transition hover:bg-sf-red-dark disabled:opacity-50">
            {loading ? "Mendaftarkan..." : "Daftar Sekarang"}
          </button>
        </form>
        <p className="mt-5 text-center text-sm text-sf-text-secondary">
          Sudah punya toko? <Link href="/login" className="font-medium text-sf-red">Masuk</Link>
        </p>
      </div>
    </main>
  );
}

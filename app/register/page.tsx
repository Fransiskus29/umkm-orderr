"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase";
import Link from "next/link";

function slugify(text: string) {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");
}

export default function RegisterPage() {
  const router = useRouter();
  const supabase = createClient();
  const [namaUsaha, setNamaUsaha] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [noHp, setNoHp] = useState("");
  const [deskripsi, setDeskripsi] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
    });

    if (authError || !authData.user) {
      setError(authError?.message || "Gagal mendaftar. Coba lagi.");
      setLoading(false);
      return;
    }

    const slug = slugify(namaUsaha) || "umkm";

    const { error: umkmError } = await supabase.from("umkm").insert({
      user_id: authData.user.id,
      nama_usaha: namaUsaha,
      slug,
      deskripsi,
      no_hp: noHp,
    });

    if (umkmError) {
      setError(umkmError.message);
      setLoading(false);
      return;
    }

    router.push("/dashboard");
    router.refresh();
  }

  return (
    <main className="min-h-screen bg-[#FAF6ED] lg:flex">
      <div className="relative hidden overflow-hidden bg-[#1C1410] px-14 py-16 lg:flex lg:w-1/2 lg:flex-col lg:justify-between">
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.18]"
          style={{
            backgroundImage: "radial-gradient(circle, #E8A33D 1px, transparent 1px)",
            backgroundSize: "18px 18px",
          }}
        />
        <div className="pointer-events-none absolute -left-24 -top-24 h-72 w-72 rounded-full bg-[#C1440E] opacity-20 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-32 right-0 h-80 w-80 rounded-full bg-[#E8A33D] opacity-10 blur-3xl" />

        <div className="relative">
          <span className="inline-flex items-center gap-2 rounded-full border border-[#E8A33D]/30 px-3 py-1 text-xs font-medium tracking-wide text-[#E8A33D]">
            Mulai Sekarang
          </span>
          <h1 className="mt-8 max-w-sm font-serif text-4xl font-semibold leading-[1.15] text-[#FAF6ED]">
            Daftarkan UMKM-mu, mulai terima pesanan.
          </h1>
          <p className="mt-4 max-w-xs text-sm leading-relaxed text-[#FAF6ED]/60">
            GRATIS, tanpa ribet. Kelola menu dan pesanan dari satu dashboard yang mudah dipakai.
          </p>
        </div>

        <div className="relative flex items-center gap-3 border-t border-[#FAF6ED]/10 pt-6 text-sm text-[#FAF6ED]/50">
          <span className="h-1.5 w-1.5 rounded-full bg-[#E8A33D]" />
          Gratis untuk semua UMKM kuliner
        </div>
      </div>

      <div className="flex flex-1 items-center justify-center px-6 py-16">
        <div className="w-full max-w-sm">
          <Link href="/" className="mb-8 inline-flex items-center gap-2 text-lg font-bold text-[#1C1410]">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#C1440E] text-sm font-bold text-white">P</span>
            PesanUMKM
          </Link>
          <div className="mb-8">
            <h2 className="font-serif text-2xl font-semibold text-[#1C1410]">Daftarkan UMKM Kamu</h2>
            <p className="mt-1.5 text-sm text-[#1C1410]/55">
              Isi data tokomu untuk mulai menerima pesanan online.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-3.5">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-[#1C1410]">Nama Usaha</label>
              <input
                required
                value={namaUsaha}
                onChange={(e) => setNamaUsaha(e.target.value)}
                className="w-full rounded-xl border border-[#1C1410]/12 bg-white px-3.5 py-2.5 text-sm text-[#1C1410] outline-none transition placeholder:text-[#1C1410]/30 focus:border-[#C1440E] focus:ring-4 focus:ring-[#C1440E]/10"
                placeholder="Contoh: Warung Nasi Bu Sri"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-[#1C1410]">Deskripsi Singkat</label>
              <textarea
                value={deskripsi}
                onChange={(e) => setDeskripsi(e.target.value)}
                className="w-full rounded-xl border border-[#1C1410]/12 bg-white px-3.5 py-2.5 text-sm text-[#1C1410] outline-none transition placeholder:text-[#1C1410]/30 focus:border-[#C1440E] focus:ring-4 focus:ring-[#C1440E]/10"
                rows={2}
                placeholder="Contoh: Menyediakan nasi rumahan sejak 2015"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-[#1C1410]">No. HP / WhatsApp</label>
              <input
                required
                value={noHp}
                onChange={(e) => setNoHp(e.target.value)}
                className="w-full rounded-xl border border-[#1C1410]/12 bg-white px-3.5 py-2.5 text-sm text-[#1C1410] outline-none transition placeholder:text-[#1C1410]/30 focus:border-[#C1440E] focus:ring-4 focus:ring-[#C1440E]/10"
                placeholder="08xxxxxxxxxx"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-[#1C1410]">Email</label>
              <input
                required
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-xl border border-[#1C1410]/12 bg-white px-3.5 py-2.5 text-sm text-[#1C1410] outline-none transition placeholder:text-[#1C1410]/30 focus:border-[#C1440E] focus:ring-4 focus:ring-[#C1440E]/10"
                placeholder="nama@email.com"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-[#1C1410]">Password</label>
              <input
                required
                type="password"
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-xl border border-[#1C1410]/12 bg-white px-3.5 py-2.5 text-sm text-[#1C1410] outline-none transition placeholder:text-[#1C1410]/30 focus:border-[#C1440E] focus:ring-4 focus:ring-[#C1440E]/10"
                placeholder="Minimal 6 karakter"
              />
            </div>
            {error && (
              <p className="rounded-lg bg-[#C1440E]/8 px-3 py-2 text-sm text-[#C1440E]">{error}</p>
            )}
            <button
              disabled={loading}
              className="w-full rounded-xl bg-[#C1440E] py-2.5 font-medium text-[#FAF6ED] transition hover:bg-[#a83a0c] disabled:opacity-50"
            >
              {loading ? "Mendaftarkan..." : "Daftar Sekarang"}
            </button>
          </form>
          <p className="mt-6 text-center text-sm text-[#1C1410]/50">
            Sudah punya toko?{" "}
            <a href="/login" className="font-medium text-[#C1440E] hover:underline">Masuk di sini</a>
          </p>
        </div>
      </div>
    </main>
  );
}

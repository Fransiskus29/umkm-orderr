"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase";
import Link from "next/link";

export default function PelangganDaftarPage() {
  const router = useRouter();
  const supabase = createClient();
  const [nama, setNama] = useState("");
  const [noHp, setNoHp] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const { data, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { role: "pelanggan", nama, no_hp: noHp },
      },
    });

    if (authError || !data.user) {
      setError(authError?.message || "Gagal mendaftar. Coba lagi.");
      setLoading(false);
      return;
    }

    const redirect = new URLSearchParams(window.location.search).get("redirect") || "/";
    router.push(redirect);
    router.refresh();
  }

  return (
    <main className="min-h-screen bg-[#FAF6ED] flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <Link href="/" className="mb-8 inline-flex items-center gap-2 text-lg font-bold text-[#1C1410]">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#C1440E] text-sm font-bold text-white">P</span>
          PesanUMKM
        </Link>
        <div className="mb-8">
          <h2 className="font-serif text-2xl font-semibold text-[#1C1410]">Daftar Akun Pelanggan</h2>
          <p className="mt-1.5 text-sm text-[#1C1410]/55">
            Buat akun untuk mulai memesan dari UMKM favoritmu.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3.5">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-[#1C1410]">Nama Lengkap</label>
            <input
              required
              value={nama}
              onChange={(e) => setNama(e.target.value)}
              className="w-full rounded-xl border border-[#1C1410]/12 bg-white px-3.5 py-2.5 text-sm text-[#1C1410] outline-none transition placeholder:text-[#1C1410]/30 focus:border-[#C1440E] focus:ring-4 focus:ring-[#C1440E]/10"
              placeholder="Nama kamu"
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
            {loading ? "Mendaftarkan..." : "Daftar"}
          </button>
        </form>
        <p className="mt-6 text-center text-sm text-[#1C1410]/50">
          Sudah punya akun?{" "}
          <Link href="/pelanggan/login" className="font-medium text-[#C1440E] hover:underline">Masuk di sini</Link>
        </p>
      </div>
    </main>
  );
}

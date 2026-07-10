"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase";
import Link from "next/link";

export default function PelangganLoginPage() {
  const router = useRouter();
  const supabase = createClient();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      setError(error.message);
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
          <h2 className="font-serif text-2xl font-semibold text-[#1C1410]">Masuk Akun Pelanggan</h2>
          <p className="mt-1.5 text-sm text-[#1C1410]/55">
            Masuk untuk melanjutkan pesananmu.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-[#1C1410]">Email</label>
            <input
              required
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="nama@email.com"
              className="w-full rounded-xl border border-[#1C1410]/12 bg-white px-3.5 py-2.5 text-[#1C1410] outline-none transition placeholder:text-[#1C1410]/30 focus:border-[#C1440E] focus:ring-4 focus:ring-[#C1440E]/10"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-[#1C1410]">Password</label>
            <input
              required
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full rounded-xl border border-[#1C1410]/12 bg-white px-3.5 py-2.5 text-[#1C1410] outline-none transition placeholder:text-[#1C1410]/30 focus:border-[#C1440E] focus:ring-4 focus:ring-[#C1440E]/10"
            />
          </div>

          {error && (
            <p className="rounded-lg bg-[#C1440E]/8 px-3 py-2 text-sm text-[#C1440E]">{error}</p>
          )}

          <button
            disabled={loading}
            className="w-full rounded-xl bg-[#C1440E] py-2.5 font-medium text-[#FAF6ED] transition hover:bg-[#a83a0c] disabled:opacity-50"
          >
            {loading ? "Masuk..." : "Masuk"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-[#1C1410]/50">
          Belum punya akun?{" "}
          <Link href="/pelanggan/daftar" className="font-medium text-[#C1440E] hover:underline">Daftar di sini</Link>
        </p>
      </div>
    </main>
  );
}

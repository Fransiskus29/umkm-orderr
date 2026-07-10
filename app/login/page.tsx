"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase";
import Link from "next/link";

export default function LoginPage() {
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
            Dashboard UMKM
          </span>
          <h1 className="mt-8 max-w-sm font-serif text-4xl font-semibold leading-[1.15] text-[#FAF6ED]">
            Dari dapur kecil, ke meja pelanggan.
          </h1>
          <p className="mt-4 max-w-xs text-sm leading-relaxed text-[#FAF6ED]/60">
            Kelola menu, pantau pesanan, dan urus tokomu — semua dari satu tempat, tanpa ribet.
          </p>
        </div>

        <div className="relative flex items-center gap-3 border-t border-[#FAF6ED]/10 pt-6 text-sm text-[#FAF6ED]/50">
          <span className="h-1.5 w-1.5 rounded-full bg-[#C1440E]" />
          Dipercaya oleh UMKM kuliner di seluruh Indonesia
        </div>
      </div>

      <div className="flex flex-1 items-center justify-center px-6 py-16">
        <div className="w-full max-w-sm">
          <Link href="/" className="mb-8 inline-flex items-center gap-2 text-lg font-bold text-[#1C1410]">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#C1440E] text-sm font-bold text-white">P</span>
            PesanUMKM
          </Link>
          <div className="mb-8">
            <h2 className="font-serif text-2xl font-semibold text-[#1C1410]">Masuk ke tokomu</h2>
            <p className="mt-1.5 text-sm text-[#1C1410]/55">
              Masukkan email dan kata sandi untuk membuka dashboard.
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
            Belum punya toko?{" "}
            <a href="/register" className="font-medium text-[#C1440E] hover:underline">Daftar di sini</a>
          </p>
        </div>
      </div>
    </main>
  );
}

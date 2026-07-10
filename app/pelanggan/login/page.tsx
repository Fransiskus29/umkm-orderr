"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase";
import Link from "next/link";

export default function PelangganLoginPage() {
  const router = useRouter(); const supabase = createClient();
  const [email, setEmail] = useState(""); const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null); const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault(); setError(null); setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) { setError(error.message); setLoading(false); return; }
    const redirect = new URLSearchParams(window.location.search).get("redirect") || "/";
    router.push(redirect); router.refresh();
  }

  return (
    <main className="min-h-screen bg-white flex flex-col items-center justify-center px-5">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-sf-red text-2xl font-extrabold text-white">P</div>
          <h1 className="text-xl font-extrabold text-sf-text">Masuk Pelanggan</h1>
          <p className="mt-1 text-sm text-sf-text-secondary">Login untuk mulai pesan</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-3">
          <input required type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" className="w-full rounded-xl border border-sf-border bg-sf-bg px-4 py-3 text-sm outline-none focus:border-sf-red" />
          <input required type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password" className="w-full rounded-xl border border-sf-border bg-sf-bg px-4 py-3 text-sm outline-none focus:border-sf-red" />
          {error && <p className="rounded-lg bg-sf-red/10 px-3 py-2 text-xs text-sf-red">{error}</p>}
          <button disabled={loading} className="w-full rounded-xl bg-sf-red py-3 text-sm font-bold text-white transition hover:bg-sf-red-dark disabled:opacity-50">
            {loading ? "Masuk..." : "Masuk"}
          </button>
        </form>
        <p className="mt-5 text-center text-sm text-sf-text-secondary">
          Belum punya akun? <Link href="/pelanggan/daftar" className="font-medium text-sf-red">Daftar</Link>
        </p>
      </div>
    </main>
  );
}

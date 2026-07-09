"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase";
import Navbar from "@/components/Navbar";

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
    <>
      <Navbar />
      <main className="mx-auto max-w-md px-4 py-10">
        <h1 className="mb-6 text-2xl font-bold">Masuk ke Dashboard UMKM</h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium">Email</label>
            <input
              required
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-lg border border-neutral-300 px-3 py-2"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">Password</label>
            <input
              required
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-lg border border-neutral-300 px-3 py-2"
            />
          </div>
          {error && <p className="text-sm text-red-600">{error}</p>}
          <button
            disabled={loading}
            className="w-full rounded-lg bg-brand-600 py-2.5 font-medium text-white hover:bg-brand-700 disabled:opacity-50"
          >
            {loading ? "Masuk..." : "Masuk"}
          </button>
        </form>
        <p className="mt-4 text-center text-sm text-neutral-500">
          Belum punya toko?{" "}
          <a href="/register" className="text-brand-600 underline">
            Daftar di sini
          </a>
        </p>
      </main>
    </>
  );
}

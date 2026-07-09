"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase";
import Navbar from "@/components/Navbar";

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

    const baseSlug = slugify(namaUsaha) || "umkm";
    const slug = `${baseSlug}-${Math.random().toString(36).slice(2, 6)}`;

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
    <>
      <Navbar />
      <main className="mx-auto max-w-md px-4 py-10">
        <h1 className="mb-6 text-2xl font-bold">Daftarkan UMKM Kamu</h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium">Nama Usaha</label>
            <input
              required
              value={namaUsaha}
              onChange={(e) => setNamaUsaha(e.target.value)}
              className="w-full rounded-lg border border-neutral-300 px-3 py-2"
              placeholder="Contoh: Warung Nasi Bu Sri"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">Deskripsi Singkat</label>
            <textarea
              value={deskripsi}
              onChange={(e) => setDeskripsi(e.target.value)}
              className="w-full rounded-lg border border-neutral-300 px-3 py-2"
              rows={2}
              placeholder="Contoh: Menyediakan nasi rumahan sejak 2015"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">No. HP / WhatsApp</label>
            <input
              required
              value={noHp}
              onChange={(e) => setNoHp(e.target.value)}
              className="w-full rounded-lg border border-neutral-300 px-3 py-2"
              placeholder="08xxxxxxxxxx"
            />
          </div>
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
              minLength={6}
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
            {loading ? "Mendaftarkan..." : "Daftar"}
          </button>
        </form>
        <p className="mt-4 text-center text-sm text-neutral-500">
          Sudah punya toko?{" "}
          <a href="/login" className="text-brand-600 underline">
            Masuk di sini
          </a>
        </p>
      </main>
    </>
  );
}

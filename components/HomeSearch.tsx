"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Search } from "lucide-react";
import type { Umkm } from "@/lib/types";

export default function HomeSearch({ list }: { list: Umkm[] }) {
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return list;
    return list.filter(
      (u) =>
        u.nama_usaha.toLowerCase().includes(q) ||
        (u.deskripsi ?? "").toLowerCase().includes(q)
    );
  }, [list, query]);

  return (
    <main className="mx-auto max-w-container px-4 py-8 md:py-10 lg:px-6">
      <section className="mb-10 rounded-2xl bg-gradient-to-br from-brand-500 to-brand-700 p-6 text-white md:p-10 lg:p-14">
        <h1 className="max-w-2xl text-2xl font-bold leading-tight md:text-4xl lg:text-5xl">
          Pesan Makanan Langsung dari UMKM Favoritmu
        </h1>
        <p className="mt-3 max-w-xl text-sm text-brand-50 md:text-base lg:text-lg">
          Platform SaaS yang membantu UMKM kuliner menerima pesanan online tanpa ribet,
          dan memudahkan pelanggan memesan langsung tanpa perlu daftar akun.
        </p>
        <div className="mt-5 flex max-w-md items-center gap-2 rounded-xl bg-white p-2 shadow-card">
          <Search className="ml-2 h-5 w-5 text-secondary" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Mau makan apa hari ini?"
            className="w-full bg-transparent px-1 py-1.5 text-sm text-ink outline-none"
          />
        </div>
      </section>

      <h2 className="mb-4 text-lg font-semibold md:text-xl">
        {query ? `Hasil pencarian "${query}"` : "UMKM Terdaftar"}
      </h2>
      {list.length === 0 ? (
        <p className="rounded-xl border border-dashed border-outline-variant bg-white p-8 text-center text-ink-variant">
          Belum ada UMKM terdaftar. Jadilah yang pertama{" "}
          <Link href="/register" className="text-brand-500 underline">
            daftarkan usahamu
          </Link>
          .
        </p>
      ) : filtered.length === 0 ? (
        <p className="rounded-xl border border-dashed border-outline-variant bg-white p-8 text-center text-ink-variant">
          Tidak ada UMKM yang cocok dengan pencarianmu.
        </p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {filtered.map((u) => (
            <Link
              key={u.id}
              href={`/toko/${u.slug}`}
              className="rounded-xl bg-white p-5 shadow-card transition hover:shadow-hover"
            >
              <h3 className="font-semibold text-ink">{u.nama_usaha}</h3>
              <p className="mt-1 line-clamp-2 text-sm text-secondary">
                {u.deskripsi || "Kuliner UMKM"}
              </p>
              <span className="mt-3 inline-block text-sm font-medium text-brand-500">
                Lihat menu &rarr;
              </span>
            </Link>
          ))}
        </div>
      )}
    </main>
  );
}

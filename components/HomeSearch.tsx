"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Search, Store, ArrowRight } from "lucide-react";
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
      {/* Hero Section */}
      <section className="relative mb-10 overflow-hidden rounded-3xl bg-gradient-to-br from-[#1C1410] via-[#2a1f18] to-[#1C1410] p-8 md:p-12 lg:p-16">
        {/* Decorative dots */}
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.12]"
          style={{
            backgroundImage: "radial-gradient(circle, #E8A33D 1px, transparent 1px)",
            backgroundSize: "24px 24px",
          }}
        />
        {/* Warm glows */}
        <div className="pointer-events-none absolute -right-20 -top-20 h-72 w-72 rounded-full bg-[#C1440E] opacity-20 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-32 left-1/3 h-80 w-80 rounded-full bg-[#E8A33D] opacity-10 blur-3xl" />

        <div className="relative">
          <span className="inline-flex items-center gap-2 rounded-full border border-[#E8A33D]/30 px-3 py-1 text-xs font-medium tracking-wide text-[#E8A33D]">
            <Store className="h-3 w-3" />
            Platform UMKM Kuliner
          </span>
          <h1 className="mt-6 max-w-2xl text-3xl font-bold leading-tight text-[#FAF6ED] md:text-4xl lg:text-5xl">
            Pesan Makanan Langsung dari
            <span className="text-[#E8A33D]"> UMKM Favoritmu</span>
          </h1>
          <p className="mt-4 max-w-xl text-sm leading-relaxed text-[#FAF6ED]/50 md:text-base lg:text-lg">
            Temukan UMKM kuliner terdekat, lihat menu lengkapnya, dan pesan langsung tanpa ribet. Tanpa perlu daftar akun.
          </p>

          {/* Search Bar */}
          <div className="mt-6 flex max-w-lg items-center gap-2 rounded-2xl bg-white/95 p-2 shadow-xl backdrop-blur-sm">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#C1440E]/10">
              <Search className="h-5 w-5 text-[#C1440E]" />
            </div>
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Mau makan apa hari ini?"
              className="w-full bg-transparent px-1 py-2 text-sm text-[#1C1410] outline-none placeholder:text-[#1C1410]/30"
            />
          </div>

          {/* Stats */}
          <div className="mt-6 flex gap-6 text-sm text-[#FAF6ED]/40">
            <span className="flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-[#C1440E]" />
              {list.length} UMKM Terdaftar
            </span>
            <span className="flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-[#E8A33D]" />
              Pesan Langsung
            </span>
          </div>
        </div>
      </section>

      {/* UMKM List */}
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-[#1C1410] md:text-xl">
          {query ? `Hasil pencarian "${query}"` : "UMKM Terdaftar"}
        </h2>
        {!query && list.length > 0 && (
          <span className="rounded-full bg-[#C1440E]/10 px-3 py-1 text-xs font-medium text-[#C1440E]">
            {list.length} toko
          </span>
        )}
      </div>

      {list.length === 0 ? (
        <div className="rounded-2xl border-2 border-dashed border-[#1C1410]/10 bg-white p-12 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-[#1C1410]/5">
            <Store className="h-8 w-8 text-[#1C1410]/30" />
          </div>
          <p className="text-[#1C1410]/50">Belum ada UMKM terdaftar.</p>
          <Link
            href="/register"
            className="mt-3 inline-flex items-center gap-1 text-sm font-medium text-[#C1440E] hover:underline"
          >
            Jadilah yang pertama <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      ) : filtered.length === 0 ? (
        <div className="rounded-2xl border-2 border-dashed border-[#1C1410]/10 bg-white p-12 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-[#1C1410]/5">
            <Search className="h-8 w-8 text-[#1C1410]/30" />
          </div>
          <p className="text-[#1C1410]/50">Tidak ada UMKM yang cocok dengan pencarianmu.</p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {filtered.map((u) => (
            <Link
              key={u.id}
              href={`/toko/${u.slug}`}
              className="group rounded-2xl border border-[#1C1410]/6 bg-white p-5 shadow-card transition hover:border-[#C1440E]/20 hover:shadow-lg"
            >
              <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-[#C1440E] to-[#a83a0c] text-lg font-bold text-white shadow-sm">
                {u.nama_usaha.charAt(0).toUpperCase()}
              </div>
              <h3 className="font-semibold text-[#1C1410] group-hover:text-[#C1440E]">{u.nama_usaha}</h3>
              <p className="mt-1 line-clamp-2 text-sm text-[#1C1410]/50">
                {u.deskripsi || "Kuliner UMKM"}
              </p>
              <span className="mt-3 inline-flex items-center gap-1 text-sm font-medium text-[#C1440E]">
                Lihat menu <ArrowRight className="h-3.5 w-3.5 transition group-hover:translate-x-0.5" />
              </span>
            </Link>
          ))}
        </div>
      )}
    </main>
  );
}

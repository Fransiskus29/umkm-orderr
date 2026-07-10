"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Search, MapPin, Star, Clock, ChevronRight } from "lucide-react";
import type { Umkm } from "@/lib/types";

const KATEGORI_ICON: Record<string, string> = {
  "Semua": "🍽️",
  "Makanan Utama": "🍚",
  "Camilan": "🥟",
  "Minuman": "🧋",
  "Lainnya": "📦",
};

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
    <main className="mx-auto max-w-container pb-24 md:pb-8">
      {/* Search Header */}
      <div className="sticky top-0 z-20 bg-white px-4 pt-3 pb-3 shadow-sm md:px-6">
        <div className="flex items-center gap-2">
          <div className="flex h-10 flex-1 items-center gap-2 rounded-xl bg-sf-bg px-3">
            <Search className="h-4 w-4 shrink-0 text-sf-text-secondary" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Mau makan apa hari ini?"
              className="w-full bg-transparent py-2.5 text-sm text-sf-text outline-none placeholder:text-sf-text-light"
            />
          </div>
          <Link href="/pelanggan/login" className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-sf-bg">
            <svg className="h-5 w-5 text-sf-text-secondary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </Link>
        </div>
        <div className="mt-2 flex items-center gap-1 text-xs text-sf-text-secondary">
          <MapPin className="h-3 w-3 text-sf-red" />
          <span>Seluruh Indonesia</span>
        </div>
      </div>

      <div className="px-4 md:px-6">
        {/* Promo Banner */}
        <div className="mt-4 overflow-hidden rounded-2xl bg-gradient-to-r from-sf-red to-sf-orange p-5 text-white">
          <p className="text-xs font-medium uppercase tracking-wide text-white/70">Promo Spesial</p>
          <h2 className="mt-1 text-xl font-extrabold leading-tight">Pesan Sekarang,<br />Antar Langsung ke Rumah!</h2>
          <p className="mt-2 text-xs text-white/80">Gratis ongkir untuk pesanan pertama</p>
          <div className="mt-3 h-1 w-16 rounded-full bg-white/40" />
        </div>

        {/* Quick Categories */}
        <div className="mt-5">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-bold text-sf-text">Kategori</h3>
          </div>
          <div className="flex gap-3 overflow-x-auto scrollbar-none pb-1 -mx-4 px-4 md:-mx-6 md:px-6">
            {Object.entries(KATEGORI_ICON).map(([label, icon]) => (
              <button
                key={label}
                onClick={() => setQuery(label === "Semua" ? "" : label)}
                className="flex shrink-0 flex-col items-center gap-1.5"
              >
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white shadow-card text-2xl transition hover:shadow-hover">
                  {icon}
                </div>
                <span className="text-[11px] font-medium text-sf-text-secondary">{label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Nearby Restaurants */}
        <div className="mt-6">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="text-sm font-bold text-sf-text">UMKM Terdekat</h3>
            {filtered.length > 0 && (
              <span className="text-xs text-sf-text-secondary">{filtered.length} toko</span>
            )}
          </div>

          {list.length === 0 ? (
            <div className="rounded-2xl bg-white p-10 text-center shadow-card">
              <p className="text-4xl">🏪</p>
              <p className="mt-3 text-sm text-sf-text-secondary">Belum ada UMKM terdaftar.</p>
              <Link href="/register" className="mt-2 inline-block text-sm font-medium text-sf-red">Jadilah yang pertama →</Link>
            </div>
          ) : filtered.length === 0 ? (
            <div className="rounded-2xl bg-white p-10 text-center shadow-card">
              <p className="text-4xl">🔍</p>
              <p className="mt-3 text-sm text-sf-text-secondary">Tidak ada yang cocok.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {filtered.map((u) => (
                <Link
                  key={u.id}
                  href={`/toko/${u.slug}`}
                  className="flex overflow-hidden rounded-2xl bg-white shadow-card transition active:scale-[0.98]"
                >
                  {/* Store Image / Placeholder */}
                  <div className="relative h-28 w-28 shrink-0 bg-gradient-to-br from-sf-red/10 to-sf-orange/10 flex items-center justify-center">
                    <span className="text-4xl font-extrabold text-sf-red/20">{u.nama_usaha.charAt(0)}</span>
                    {/* Promo badge */}
                    <div className="absolute bottom-0 left-0 rounded-tr-lg bg-sf-red px-2 py-0.5 text-[10px] font-bold text-white">
                      PROMO
                    </div>
                  </div>

                  {/* Store Info */}
                  <div className="flex flex-1 flex-col justify-between p-3">
                    <div>
                      <h4 className="text-sm font-bold text-sf-text line-clamp-1">{u.nama_usaha}</h4>
                      <p className="mt-0.5 text-xs text-sf-text-secondary line-clamp-1">{u.deskripsi || "Kuliner UMKM"}</p>
                    </div>
                    <div className="flex items-center gap-3 text-xs text-sf-text-secondary">
                      <span className="flex items-center gap-0.5">
                        <Star className="h-3 w-3 fill-sf-star text-sf-star" />
                        4.8
                      </span>
                      <span className="flex items-center gap-0.5">
                        <Clock className="h-3 w-3" />
                        15-25 min
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center pr-3">
                    <ChevronRight className="h-4 w-4 text-sf-text-light" />
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* How it works */}
        <div className="mt-8 rounded-2xl bg-white p-5 shadow-card">
          <h3 className="mb-4 text-sm font-bold text-sf-text text-center">Cara Pesan</h3>
          <div className="grid grid-cols-3 gap-3 text-center">
            <div>
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-sf-red/10 text-xl">🏪</div>
              <p className="mt-2 text-[11px] font-medium text-sf-text-secondary">Pilih Toko</p>
            </div>
            <div>
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-sf-red/10 text-xl">🛒</div>
              <p className="mt-2 text-[11px] font-medium text-sf-text-secondary">Pesan Menu</p>
            </div>
            <div>
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-sf-red/10 text-xl">🛵</div>
              <p className="mt-2 text-[11px] font-medium text-sf-text-secondary">Terima Pesanan</p>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Nav Mobile */}
      <nav className="fixed inset-x-0 bottom-0 z-30 border-t border-sf-border bg-white safe-bottom md:hidden">
        <div className="flex items-center justify-around py-2">
          <Link href="/" className="flex flex-col items-center gap-0.5 px-3 py-1">
            <svg className="h-6 w-6 text-sf-red" fill="currentColor" viewBox="0 0 24 24"><path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"/></svg>
            <span className="text-[10px] font-bold text-sf-red">Beranda</span>
          </Link>
          <Link href="/pelanggan/login" className="flex flex-col items-center gap-0.5 px-3 py-1">
            <svg className="h-6 w-6 text-sf-text-light" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/></svg>
            <span className="text-[10px] font-medium text-sf-text-light">Pesanan</span>
          </Link>
          <Link href="/login" className="flex flex-col items-center gap-0.5 px-3 py-1">
            <svg className="h-6 w-6 text-sf-text-light" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/></svg>
            <span className="text-[10px] font-medium text-sf-text-light">Toko</span>
          </Link>
          <Link href="/pelanggan/login" className="flex flex-col items-center gap-0.5 px-3 py-1">
            <svg className="h-6 w-6 text-sf-text-light" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/></svg>
            <span className="text-[10px] font-medium text-sf-text-light">Akun</span>
          </Link>
        </div>
      </nav>
    </main>
  );
}

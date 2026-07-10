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
      (u) => u.nama_usaha.toLowerCase().includes(q) || (u.deskripsi ?? "").toLowerCase().includes(q)
    );
  }, [list, query]);

  return (
    <main className="mx-auto max-w-container pb-24 md:pb-8">
      {/* Search Header */}
      <div className="sticky top-0 z-20 bg-white px-4 pt-3 pb-3 shadow-sm md:px-6 md:pt-4 md:pb-4">
        <div className="flex items-center gap-2 md:gap-3">
          <div className="flex h-10 md:h-11 flex-1 items-center gap-2 rounded-xl bg-sf-bg px-3 md:px-4">
            <Search className="h-4 w-4 shrink-0 text-sf-text-secondary" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Mau makan apa hari ini?"
              className="w-full bg-transparent py-2 md:py-2.5 text-sm md:text-[15px] text-sf-text outline-none placeholder:text-sf-text-light"
            />
          </div>
          <Link href="/pelanggan/login" className="flex h-10 w-10 md:h-11 md:w-11 shrink-0 items-center justify-center rounded-xl bg-sf-bg">
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
        <div className="mt-4 overflow-hidden rounded-2xl bg-gradient-to-r from-sf-red to-sf-orange p-5 text-white md:p-8 md:rounded-3xl">
          <p className="text-xs font-medium uppercase tracking-wide text-white/70 md:text-sm">Promo Spesial</p>
          <h2 className="mt-1 text-xl font-extrabold leading-tight md:text-3xl">Pesan Sekarang,<br />Antar Langsung ke Rumah!</h2>
          <p className="mt-2 text-xs text-white/80 md:text-sm">Gratis ongkir untuk pesanan pertama</p>
          <div className="mt-3 h-1 w-16 rounded-full bg-white/40 md:w-24" />
        </div>

        {/* Quick Categories */}
        <div className="mt-5 md:mt-6">
          <h3 className="mb-3 text-sm font-bold text-sf-text md:text-base">Kategori</h3>
          <div className="flex gap-3 md:gap-5 overflow-x-auto scrollbar-none pb-1 -mx-4 px-4 md:-mx-6 md:px-6">
            {Object.entries(KATEGORI_ICON).map(([label, icon]) => (
              <button key={label} onClick={() => setQuery(label === "Semua" ? "" : label)} className="flex shrink-0 flex-col items-center gap-1.5">
                <div className="flex h-14 w-14 md:h-16 md:w-16 items-center justify-center rounded-2xl bg-white shadow-card text-2xl md:text-3xl transition hover:shadow-hover active:scale-95">{icon}</div>
                <span className="text-[11px] md:text-xs font-medium text-sf-text-secondary">{label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Restaurant List */}
        <div className="mt-6 md:mt-8">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="text-sm font-bold text-sf-text md:text-base">UMKM Terdekat</h3>
            {filtered.length > 0 && <span className="text-xs text-sf-text-secondary">{filtered.length} toko</span>}
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
            <>
              {/* Mobile: list view */}
              <div className="space-y-3 md:hidden">
                {filtered.map((u) => (
                  <Link key={u.id} href={`/toko/${u.slug}`} className="flex overflow-hidden rounded-2xl bg-white shadow-card transition active:scale-[0.98]">
                    <div className="relative h-28 w-28 shrink-0 bg-gradient-to-br from-sf-red/10 to-sf-orange/10 flex items-center justify-center overflow-hidden">
                      {u.foto_url ? (
                        <img src={u.foto_url} alt={u.nama_usaha} className="h-full w-full object-cover" />
                      ) : (
                        <span className="text-4xl font-extrabold text-sf-red/20">{u.nama_usaha.charAt(0)}</span>
                      )}
                      <div className="absolute bottom-0 left-0 rounded-tr-lg bg-sf-red px-2 py-0.5 text-[10px] font-bold text-white">PROMO</div>
                    </div>
                    <div className="flex flex-1 flex-col justify-between p-3">
                      <div>
                        <h4 className="text-sm font-bold text-sf-text line-clamp-1">{u.nama_usaha}</h4>
                        <p className="mt-0.5 text-xs text-sf-text-secondary line-clamp-1">{u.deskripsi || "Kuliner UMKM"}</p>
                      </div>
                      <div className="flex items-center gap-3 text-xs text-sf-text-secondary">
                        <span className="flex items-center gap-0.5"><Star className="h-3 w-3 fill-sf-star text-sf-star" />4.8</span>
                        <span className="flex items-center gap-0.5"><Clock className="h-3 w-3" />15-25 min</span>
                      </div>
                    </div>
                    <div className="flex items-center pr-3"><ChevronRight className="h-4 w-4 text-sf-text-light" /></div>
                  </Link>
                ))}
              </div>

              {/* Desktop: grid view */}
              <div className="hidden md:grid md:grid-cols-2 lg:grid-cols-3 md:gap-4">
                {filtered.map((u) => (
                  <Link key={u.id} href={`/toko/${u.slug}`} className="group overflow-hidden rounded-2xl bg-white shadow-card transition hover:shadow-hover active:scale-[0.98]">
                    <div className="relative h-40 bg-gradient-to-br from-sf-red/10 to-sf-orange/10 flex items-center justify-center overflow-hidden">
                      {u.foto_url ? (
                        <img src={u.foto_url} alt={u.nama_usaha} className="h-full w-full object-cover" />
                      ) : (
                        <span className="text-5xl font-extrabold text-sf-red/20">{u.nama_usaha.charAt(0)}</span>
                      )}
                      <div className="absolute bottom-0 left-0 rounded-tr-lg bg-sf-red px-2.5 py-1 text-xs font-bold text-white">PROMO</div>
                    </div>
                    <div className="p-4">
                      <h4 className="text-base font-bold text-sf-text group-hover:text-sf-red line-clamp-1">{u.nama_usaha}</h4>
                      <p className="mt-0.5 text-sm text-sf-text-secondary line-clamp-1">{u.deskripsi || "Kuliner UMKM"}</p>
                      <div className="mt-2 flex items-center gap-4 text-xs text-sf-text-secondary">
                        <span className="flex items-center gap-1"><Star className="h-3.5 w-3.5 fill-sf-star text-sf-star" />4.8</span>
                        <span className="flex items-center gap-1"><Clock className="h-3.5 w-3.5" />15-25 min</span>
                      </div>
                      <p className="mt-2 text-xs font-medium text-sf-red">Lihat Menu →</p>
                    </div>
                  </Link>
                ))}
              </div>
            </>
          )}
        </div>

        {/* How it works */}
        <div className="mt-8 rounded-2xl bg-white p-5 shadow-card md:p-8">
          <h3 className="mb-4 text-sm font-bold text-sf-text text-center md:text-base">Cara Pesan</h3>
          <div className="grid grid-cols-3 gap-3 md:gap-6 text-center">
            <div>
              <div className="mx-auto flex h-12 w-12 md:h-14 md:w-14 items-center justify-center rounded-full bg-sf-red/10 text-xl md:text-2xl">🏪</div>
              <p className="mt-2 text-[11px] md:text-xs font-medium text-sf-text-secondary">Pilih Toko</p>
            </div>
            <div>
              <div className="mx-auto flex h-12 w-12 md:h-14 md:w-14 items-center justify-center rounded-full bg-sf-red/10 text-xl md:text-2xl">🛒</div>
              <p className="mt-2 text-[11px] md:text-xs font-medium text-sf-text-secondary">Pesan Menu</p>
            </div>
            <div>
              <div className="mx-auto flex h-12 w-12 md:h-14 md:w-14 items-center justify-center rounded-full bg-sf-red/10 text-xl md:text-2xl">🛵</div>
              <p className="mt-2 text-[11px] md:text-xs font-medium text-sf-text-secondary">Terima Pesanan</p>
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

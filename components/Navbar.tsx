"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase";
import { LogOut, User } from "lucide-react";

export default function Navbar() {
  const supabase = createClient();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => { setUser(data.user); setLoading(false); });
    const { data: l } = supabase.auth.onAuthStateChange((_e, s) => setUser(s?.user ?? null));
    return () => l.subscription.unsubscribe();
  }, []);

  async function logout() { await supabase.auth.signOut(); setUser(null); window.location.href = "/"; }

  return (
    <header className="sticky top-0 z-30 bg-white shadow-sm md:hidden">
      <div className="flex items-center justify-between px-4 py-3">
        <Link href="/" className="text-lg font-extrabold text-sf-red">PesanUMKM</Link>
        <div className="flex items-center gap-2">
          {!loading && user ? (
            <>
              <Link href="/dashboard" className="rounded-lg bg-sf-red/10 px-3 py-1.5 text-xs font-medium text-sf-red">Dashboard</Link>
              <button onClick={logout} className="rounded-lg bg-sf-bg p-1.5"><LogOut className="h-4 w-4 text-sf-text-secondary" /></button>
            </>
          ) : !loading ? (
            <Link href="/pelanggan/login" className="rounded-lg bg-sf-red px-3 py-1.5 text-xs font-medium text-white">Masuk</Link>
          ) : null}
        </div>
      </div>
    </header>
  );
}

export function DesktopNavbar() {
  const supabase = createClient();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => { setUser(data.user); setLoading(false); });
    const { data: l } = supabase.auth.onAuthStateChange((_e, s) => setUser(s?.user ?? null));
    return () => l.subscription.unsubscribe();
  }, []);

  async function logout() { await supabase.auth.signOut(); setUser(null); window.location.href = "/"; }

  return (
    <header className="sticky top-0 z-30 hidden border-b border-sf-border bg-white md:block">
      <div className="mx-auto flex max-w-container items-center justify-between px-6 py-3">
        <Link href="/" className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-sf-red text-base font-extrabold text-white">P</div>
          <span className="text-lg font-extrabold text-sf-red">PesanUMKM</span>
        </Link>

        <div className="flex items-center gap-3">
          <Link href="/" className="rounded-lg px-3 py-2 text-sm font-medium text-sf-text-secondary transition hover:bg-sf-bg hover:text-sf-text">
            Beranda
          </Link>
          {!loading && user ? (
            <>
              <Link href="/dashboard" className="rounded-lg px-3 py-2 text-sm font-medium text-sf-text-secondary transition hover:bg-sf-bg hover:text-sf-text">Dashboard</Link>
              <button onClick={logout} className="flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm text-sf-text-secondary transition hover:bg-sf-bg">
                <LogOut className="h-4 w-4" /> Keluar
              </button>
            </>
          ) : !loading ? (
            <>
              <Link href="/pelanggan/login" className="rounded-lg px-3 py-2 text-sm font-medium text-sf-text-secondary transition hover:bg-sf-bg">Masuk</Link>
              <Link href="/register" className="rounded-xl bg-sf-red px-5 py-2 text-sm font-bold text-white transition hover:bg-sf-red-dark">
                Daftarkan UMKM
              </Link>
            </>
          ) : null}
        </div>
      </div>
    </header>
  );
}

"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase";
import { LogOut, Menu, X } from "lucide-react";

export default function Navbar() {
  const supabase = createClient();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user);
      setLoading(false);
    });
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });
    return () => listener.subscription.unsubscribe();
  }, []);

  async function handleLogout() {
    await supabase.auth.signOut();
    setUser(null);
    setMobileOpen(false);
    window.location.href = "/";
  }

  function closeMobile() { setMobileOpen(false); }

  return (
    <header className="sticky top-0 z-30 border-b border-[#1C1410]/8 bg-white/80 backdrop-blur-md">
      <div className="mx-auto flex max-w-container items-center justify-between px-4 py-3 lg:px-6">
        <Link href="/" className="flex items-center gap-2 text-lg font-bold text-[#1C1410]" onClick={closeMobile}>
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#C1440E] text-sm font-bold text-white">P</span>
          PesanUMKM
        </Link>

        {/* Desktop nav */}
        <nav className="hidden items-center gap-2 text-sm font-medium md:flex md:gap-3">
          <Link href="/" className="rounded-lg px-3 py-2 text-[#1C1410]/60 transition hover:bg-[#1C1410]/5 hover:text-[#1C1410]">
            Jelajahi UMKM
          </Link>
          {!loading && user ? (
            <>
              <Link href="/dashboard" className="rounded-lg px-3 py-2 text-[#1C1410]/60 transition hover:bg-[#1C1410]/5 hover:text-[#1C1410]">Dashboard</Link>
              <button onClick={handleLogout} className="flex items-center gap-1.5 rounded-lg px-3 py-2 text-[#1C1410]/60 transition hover:bg-[#1C1410]/5 hover:text-[#1C1410]">
                <LogOut className="h-4 w-4" /> Keluar
              </button>
            </>
          ) : !loading ? (
            <>
              <Link href="/pelanggan/login" className="rounded-lg px-3 py-2 text-[#1C1410]/60 transition hover:bg-[#1C1410]/5 hover:text-[#1C1410]">Masuk</Link>
              <Link href="/register" className="rounded-xl bg-[#C1440E] px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-[#a83a0c]">Daftarkan UMKM</Link>
            </>
          ) : null}
        </nav>

        {/* Mobile hamburger */}
        <button onClick={() => setMobileOpen(!mobileOpen)} className="flex h-10 w-10 items-center justify-center rounded-lg text-[#1C1410] md:hidden">
          {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="border-t border-[#1C1410]/8 bg-white px-4 pb-4 pt-2 md:hidden">
          <nav className="flex flex-col gap-1 text-sm font-medium">
            <Link href="/" className="rounded-lg px-3 py-2.5 text-[#1C1410]/60 transition hover:bg-[#1C1410]/5" onClick={closeMobile}>Jelajahi UMKM</Link>
            {!loading && user ? (
              <>
                <Link href="/dashboard" className="rounded-lg px-3 py-2.5 text-[#1C1410]/60 transition hover:bg-[#1C1410]/5" onClick={closeMobile}>Dashboard</Link>
                <button onClick={handleLogout} className="flex items-center gap-2 rounded-lg px-3 py-2.5 text-left text-[#1C1410]/60 transition hover:bg-[#1C1410]/5">
                  <LogOut className="h-4 w-4" /> Keluar
                </button>
              </>
            ) : !loading ? (
              <>
                <Link href="/pelanggan/login" className="rounded-lg px-3 py-2.5 text-[#1C1410]/60 transition hover:bg-[#1C1410]/5" onClick={closeMobile}>Masuk</Link>
                <Link href="/register" className="mt-1 rounded-xl bg-[#C1440E] px-4 py-2.5 text-center text-sm font-medium text-white" onClick={closeMobile}>Daftarkan UMKM</Link>
              </>
            ) : null}
          </nav>
        </div>
      )}
    </header>
  );
}

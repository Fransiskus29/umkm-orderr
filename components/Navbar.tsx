"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase";
import { User, LogOut } from "lucide-react";

export default function Navbar() {
  const supabase = createClient();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

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
    window.location.href = "/";
  }

  return (
    <header className="sticky top-0 z-30 border-b border-[#1C1410]/8 bg-white/80 backdrop-blur-md">
      <div className="mx-auto flex max-w-container items-center justify-between px-4 py-3.5 lg:px-6">
        <Link href="/" className="flex items-center gap-2.5 text-lg font-bold text-[#1C1410]">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#C1440E] text-sm font-bold text-white shadow-sm">P</span>
          PesanUMKM
        </Link>
        <nav className="flex items-center gap-2 text-sm font-medium md:gap-3">
          <Link href="/" className="rounded-lg px-3 py-2 text-[#1C1410]/60 transition hover:bg-[#1C1410]/5 hover:text-[#1C1410] md:inline-flex">
            Jelajahi UMKM
          </Link>

          {!loading && user ? (
            <>
              <Link href="/dashboard" className="rounded-lg px-3 py-2 text-[#1C1410]/60 transition hover:bg-[#1C1410]/5 hover:text-[#1C1410]">
                Dashboard
              </Link>
              <button
                onClick={handleLogout}
                className="flex items-center gap-1.5 rounded-lg px-3 py-2 text-[#1C1410]/60 transition hover:bg-[#1C1410]/5 hover:text-[#1C1410]"
              >
                <LogOut className="h-4 w-4" />
                Keluar
              </button>
            </>
          ) : !loading ? (
            <>
              <Link href="/pelanggan/login" className="rounded-lg px-3 py-2 text-[#1C1410]/60 transition hover:bg-[#1C1410]/5 hover:text-[#1C1410]">
                Masuk
              </Link>
              <Link href="/register" className="rounded-xl bg-[#C1440E] px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-[#a83a0c] hover:shadow-md">
                Daftarkan UMKM
              </Link>
            </>
          ) : null}
        </nav>
      </div>
    </header>
  );
}

"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase";
import { Store, UtensilsCrossed, ShoppingBag, LogOut } from "lucide-react";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClient();

  async function handleLogout() {
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  }

  const linkClass = (href: string) =>
    `flex items-center gap-2 rounded-xl px-3 py-2.5 text-sm font-medium whitespace-nowrap transition ${
      pathname === href
        ? "bg-[#C1440E] text-white shadow-sm"
        : "text-[#1C1410]/50 hover:bg-[#1C1410]/5 hover:text-[#1C1410]"
    }`;

  return (
    <div className="flex min-h-screen flex-col md:flex-row">
      <aside className="w-full shrink-0 border-b border-[#1C1410]/8 bg-white p-4 md:w-56 md:border-b-0 md:border-r md:border-[#1C1410]/8">
        <Link href="/" className="mb-5 flex items-center gap-2 text-lg font-bold text-[#1C1410] md:mb-6">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#C1440E] text-sm font-bold text-white">
            P
          </span>
          PesanUMKM
        </Link>
        <nav className="flex gap-1 overflow-x-auto md:flex-col md:space-y-1 md:overflow-visible">
          <Link href="/dashboard" className={linkClass("/dashboard")}>
            <Store className="h-4 w-4 shrink-0" />
            Toko Saya
          </Link>
          <Link href="/dashboard/menu" className={linkClass("/dashboard/menu")}>
            <UtensilsCrossed className="h-4 w-4 shrink-0" />
            Kelola Menu
          </Link>
          <Link href="/dashboard/orders" className={linkClass("/dashboard/orders")}>
            <ShoppingBag className="h-4 w-4 shrink-0" />
            Pesanan Masuk
          </Link>
        </nav>
        <button
          onClick={handleLogout}
          className="mt-4 flex w-full items-center gap-2 rounded-xl border border-[#1C1410]/10 px-3 py-2.5 text-sm text-[#1C1410]/50 transition hover:bg-[#1C1410]/5 hover:text-[#1C1410] md:mt-6"
        >
          <LogOut className="h-4 w-4" />
          Keluar
        </button>
      </aside>
      <main className="flex-1 bg-[#FAF6ED] p-4 md:p-8">
        <div className="mx-auto max-w-container">{children}</div>
      </main>
    </div>
  );
}

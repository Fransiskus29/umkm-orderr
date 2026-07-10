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

  const mobileLinkClass = (href: string) =>
    `flex flex-col items-center gap-0.5 rounded-lg px-2 py-1 text-[10px] font-medium transition ${
      pathname === href ? "text-[#C1440E]" : "text-[#1C1410]/35"
    }`;

  return (
    <div className="flex min-h-screen flex-col pb-16 md:pb-0 md:flex-row">
      {/* Desktop sidebar */}
      <aside className="hidden shrink-0 border-r border-[#1C1410]/8 bg-white md:block md:w-56">
        <div className="sticky top-0 flex h-screen flex-col p-4">
          <Link href="/" className="mb-6 flex items-center gap-2 text-lg font-bold text-[#1C1410]">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#C1440E] text-sm font-bold text-white">P</span>
            PesanUMKM
          </Link>
          <nav className="flex flex-col space-y-1">
            <Link href="/dashboard" className={linkClass("/dashboard")}>
              <Store className="h-4 w-4 shrink-0" /> Toko Saya
            </Link>
            <Link href="/dashboard/menu" className={linkClass("/dashboard/menu")}>
              <UtensilsCrossed className="h-4 w-4 shrink-0" /> Kelola Menu
            </Link>
            <Link href="/dashboard/orders" className={linkClass("/dashboard/orders")}>
              <ShoppingBag className="h-4 w-4 shrink-0" /> Pesanan Masuk
            </Link>
          </nav>
          <button onClick={handleLogout} className="mt-auto flex items-center gap-2 rounded-xl border border-[#1C1410]/10 px-3 py-2.5 text-sm text-[#1C1410]/50 transition hover:bg-[#1C1410]/5">
            <LogOut className="h-4 w-4" /> Keluar
          </button>
        </div>
      </aside>

      {/* Mobile bottom nav */}
      <nav className="fixed inset-x-0 bottom-0 z-40 flex items-center justify-around border-t border-[#1C1410]/8 bg-white px-2 py-1.5 md:hidden">
        <Link href="/dashboard" className={mobileLinkClass("/dashboard")}>
          <Store className="h-5 w-5" /> Toko
        </Link>
        <Link href="/dashboard/menu" className={mobileLinkClass("/dashboard/menu")}>
          <UtensilsCrossed className="h-5 w-5" /> Menu
        </Link>
        <Link href="/dashboard/orders" className={mobileLinkClass("/dashboard/orders")}>
          <ShoppingBag className="h-5 w-5" /> Pesanan
        </Link>
        <button onClick={handleLogout} className="flex flex-col items-center gap-0.5 rounded-lg px-2 py-1 text-[10px] font-medium text-[#1C1410]/35">
          <LogOut className="h-5 w-5" /> Keluar
        </button>
      </nav>

      <main className="flex-1 bg-[#FAF6ED] p-4 md:p-8">
        <div className="mx-auto max-w-container">{children}</div>
      </main>
    </div>
  );
}

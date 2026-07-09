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
    `flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium whitespace-nowrap ${
      pathname === href ? "bg-brand-500 text-white" : "text-secondary hover:bg-surface-container"
    }`;

  return (
    <div className="flex min-h-screen flex-col md:flex-row">
      <aside className="w-full shrink-0 border-b border-surface-high bg-white p-4 md:w-56 md:border-b-0 md:border-r">
        <Link href="/" className="mb-4 block text-lg font-bold text-brand-500 md:mb-6">
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
          className="mt-4 flex w-full items-center gap-2 rounded-lg border border-outline-variant px-3 py-2 text-sm text-secondary hover:bg-surface-container md:mt-6"
        >
          <LogOut className="h-4 w-4" />
          Keluar
        </button>
      </aside>
      <main className="flex-1 bg-surface p-4 md:p-8">
        <div className="mx-auto max-w-container">{children}</div>
      </main>
    </div>
  );
}

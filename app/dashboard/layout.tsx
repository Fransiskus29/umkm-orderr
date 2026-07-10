"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase";
import { Store, UtensilsCrossed, ShoppingBag, LogOut } from "lucide-react";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname(); const router = useRouter(); const supabase = createClient();
  async function logout() { await supabase.auth.signOut(); router.push("/"); router.refresh(); }

  const deskLink = (href: string, label: string, Icon: any) => (
    <Link href={href} className={`flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-medium transition ${pathname === href ? "bg-sf-red text-white shadow-sm" : "text-sf-text-secondary hover:bg-sf-bg hover:text-sf-text"}`}>
      <Icon className="h-4.5 w-4.5 shrink-0" />{label}
    </Link>
  );

  const mobLink = (href: string, label: string, Icon: any) => (
    <Link href={href} className={`flex flex-1 flex-col items-center gap-0.5 py-1.5 ${pathname === href ? "text-sf-red" : "text-sf-text-light"}`}>
      <Icon className="h-5 w-5" /><span className="text-[10px] font-medium">{label}</span>
    </Link>
  );

  return (
    <div className="min-h-screen bg-sf-bg pb-16 md:pb-0">
      {/* Desktop sidebar */}
      <aside className="hidden md:fixed md:inset-y-0 md:left-0 md:z-40 md:flex md:w-60 md:flex-col md:border-r md:border-sf-border md:bg-white">
        <div className="flex h-full flex-col p-5">
          <Link href="/" className="mb-8 flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-sf-red text-sm font-extrabold text-white">P</div>
            <span className="text-lg font-extrabold text-sf-red">PesanUMKM</span>
          </Link>
          <nav className="flex flex-col space-y-1">
            {deskLink("/dashboard", "Toko Saya", Store)}
            {deskLink("/dashboard/menu", "Kelola Menu", UtensilsCrossed)}
            {deskLink("/dashboard/orders", "Pesanan Masuk", ShoppingBag)}
          </nav>
          <button onClick={logout} className="mt-auto flex items-center gap-2.5 rounded-xl border border-sf-border px-3 py-2.5 text-sm text-sf-text-secondary transition hover:bg-sf-bg">
            <LogOut className="h-4 w-4" /> Keluar
          </button>
        </div>
      </aside>

      {/* Mobile bottom nav */}
      <nav className="fixed inset-x-0 bottom-0 z-40 flex items-center border-t border-sf-border bg-white safe-bottom md:hidden">
        {mobLink("/dashboard", "Toko", Store)}
        {mobLink("/dashboard/menu", "Menu", UtensilsCrossed)}
        {mobLink("/dashboard/orders", "Pesanan", ShoppingBag)}
        <button onClick={logout} className="flex flex-1 flex-col items-center gap-0.5 py-1.5 text-sf-text-light">
          <LogOut className="h-5 w-5" /><span className="text-[10px] font-medium">Keluar</span>
        </button>
      </nav>

      <main className="md:ml-60">
        <div className="mx-auto max-w-container px-4 py-4 md:px-8 md:py-6">{children}</div>
      </main>
    </div>
  );
}

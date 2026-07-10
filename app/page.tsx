import Navbar from "@/components/Navbar";
import HomeSearch from "@/components/HomeSearch";
import { createServerSupabase } from "@/lib/supabase-server";
import type { Umkm } from "@/lib/types";
import Link from "next/link";

export const revalidate = 0;

export default async function HomePage() {
  const supabase = createServerSupabase();
  const { data } = await supabase
    .from("umkm")
    .select("*")
    .order("created_at", { ascending: false });

  const list = (data ?? []) as Umkm[];

  return (
    <>
      <Navbar />
      <HomeSearch list={list} />

      <footer className="border-t border-[#1C1410]/8 bg-[#FAF6ED]">
        <div className="mx-auto max-w-container px-4 py-10 lg:px-6">
          <div className="grid gap-8 md:grid-cols-3">
            <div>
              <div className="mb-3 flex items-center gap-2 text-lg font-bold text-[#1C1410]">
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#C1440E] text-sm font-bold text-white">P</span>
                PesanUMKM
              </div>
              <p className="text-sm leading-relaxed text-[#1C1410]/50">
                Platform pemesanan online untuk UMKM kuliner. Pesan langsung dari UMKM favoritmu tanpa ribet.
              </p>
            </div>
            <div>
              <h3 className="mb-3 font-semibold text-[#1C1410]">Tautan</h3>
              <div className="space-y-2 text-sm">
                <Link href="/login" className="block text-[#1C1410]/50 hover:text-[#C1440E]">Masuk UMKM</Link>
                <Link href="/register" className="block text-[#1C1410]/50 hover:text-[#C1440E]">Daftarkan UMKM</Link>
              </div>
            </div>
            <div>
              <h3 className="mb-3 font-semibold text-[#1C1410]">Tentang</h3>
              <p className="text-sm leading-relaxed text-[#1C1410]/50">
                PesanUMKM membantu UMKM kuliner menerima pesanan online dan memudahkan pelanggan memesan langsung.
              </p>
            </div>
          </div>
          <div className="mt-8 border-t border-[#1C1410]/8 pt-6 text-center text-xs text-[#1C1410]/40">
            &copy; {new Date().getFullYear()} PesanUMKM. Dibuat untuk tugas UAS.
          </div>
        </div>
      </footer>
    </>
  );
}

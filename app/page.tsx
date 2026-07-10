import { DesktopNavbar } from "@/components/Navbar";
import HomeSearch from "@/components/HomeSearch";
import { createServerSupabase } from "@/lib/supabase-server";
import type { Umkm } from "@/lib/types";

export const revalidate = 0;

export default async function HomePage() {
  const supabase = createServerSupabase();
  const { data } = await supabase
    .from("umkm")
    .select("*")
    .or("kategori_usaha.eq.Kuliner,kategori_usaha.is.null")
    .order("created_at", { ascending: false });

  const list = (data ?? []) as Umkm[];

  return (
    <>
      <DesktopNavbar />
      <HomeSearch list={list} />
    </>
  );
}

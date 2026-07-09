import { createServerSupabase } from "@/lib/supabase-server";
import Navbar from "@/components/Navbar";
import type { Umkm } from "@/lib/types";
import HomeSearch from "@/components/HomeSearch";

export const revalidate = 0;

export default async function HomePage() {
  const supabase = createServerSupabase();
  const { data: umkmList } = await supabase
    .from("umkm")
    .select("*")
    .order("created_at", { ascending: false });

  const list = (umkmList ?? []) as Umkm[];

  return (
    <>
      <Navbar />
      <HomeSearch list={list} />
    </>
  );
}

import { createServerSupabase } from "@/lib/supabase-server";
import { notFound } from "next/navigation";
import type { MenuItem, Umkm } from "@/lib/types";
import StoreClient from "./StoreClient";

export const revalidate = 0;

export default async function StorePage({ params }: { params: { slug: string } }) {
  const supabase = createServerSupabase();

  const { data: umkm } = await supabase
    .from("umkm")
    .select("*")
    .eq("slug", params.slug)
    .single();

  if (!umkm) return notFound();

  const { data: menu } = await supabase
    .from("menu_items")
    .select("*")
    .eq("umkm_id", umkm.id)
    .eq("tersedia", true)
    .order("created_at", { ascending: true });

  return <StoreClient umkm={umkm as Umkm} menu={(menu ?? []) as MenuItem[]} />;
}

import { createServerSupabase } from "@/lib/supabase-server";
import { notFound } from "next/navigation";
import type { Order, OrderItem } from "@/lib/types";
import OrderTrackingClient from "@/components/OrderTrackingClient";

export const revalidate = 0;

export default async function OrderStatusPage({ params }: { params: { id: string } }) {
  const supabase = createServerSupabase();

  const { data: order } = await supabase.from("orders").select("*").eq("id", params.id).single();
  if (!order) return notFound();

  const { data: items } = await supabase
    .from("order_items")
    .select("*")
    .eq("order_id", order.id);

  const o = order as Order;
  const orderItems = (items ?? []) as OrderItem[];

  return (
    <OrderTrackingClient
      orderId={o.id}
      initialOrder={{
        id: o.id,
        nama_pelanggan: o.nama_pelanggan,
        no_hp: o.no_hp,
        alamat: o.alamat,
        metode: o.metode,
        catatan: o.catatan,
        status: o.status,
        total: o.total,
      }}
      initialItems={orderItems.map((it) => ({
        id: it.id,
        qty: it.qty,
        nama: it.nama,
        harga: it.harga,
      }))}
    />
  );
}

"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase";
import { formatRupiah, shortOrderCode, type Order, type OrderItem, type OrderStatus } from "@/lib/types";
import { Check, X } from "lucide-react";

const statusLabel: Record<string, string> = {
  pending: "Menunggu",
  diproses: "Diproses",
  selesai: "Selesai",
  dibatalkan: "Dibatalkan",
};

const statusColor: Record<string, string> = {
  pending: "bg-amber-100 text-amber-700",
  diproses: "bg-blue-100 text-blue-700",
  selesai: "bg-green-100 text-green-700",
  dibatalkan: "bg-red-100 text-red-700",
};

export default function OrdersPage() {
  const supabase = createClient();
  const [umkmId, setUmkmId] = useState<string | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [itemsByOrder, setItemsByOrder] = useState<Record<string, OrderItem[]>>({});
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<OrderStatus | "semua">("semua");

  async function loadOrders(uid: string) {
    const { data: orderData } = await supabase
      .from("orders")
      .select("*")
      .eq("umkm_id", uid)
      .order("created_at", { ascending: false });

    const list = (orderData ?? []) as Order[];
    setOrders(list);

    if (list.length > 0) {
      const { data: itemsData } = await supabase
        .from("order_items")
        .select("*")
        .in("order_id", list.map((o) => o.id));
      const grouped: Record<string, OrderItem[]> = {};
      (itemsData ?? []).forEach((it: OrderItem) => {
        grouped[it.order_id] = grouped[it.order_id] || [];
        grouped[it.order_id].push(it);
      });
      setItemsByOrder(grouped);
    }
  }

  useEffect(() => {
    async function init() {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;
      const { data: umkm } = await supabase
        .from("umkm")
        .select("id")
        .eq("user_id", user.id)
        .single();
      if (umkm) {
        setUmkmId(umkm.id);
        await loadOrders(umkm.id);
      }
      setLoading(false);
    }
    init();
  }, []);

  async function updateStatus(orderId: string, status: OrderStatus) {
    await supabase.from("orders").update({ status }).eq("id", orderId);
    if (umkmId) await loadOrders(umkmId);
  }

  const visibleOrders = filter === "semua" ? orders : orders.filter((o) => o.status === filter);

  if (loading) return <p>Memuat...</p>;

  return (
    <div>
      <h1 className="mb-4 text-2xl font-bold">Pesanan Masuk</h1>

      <div className="mb-4 flex flex-wrap gap-2 text-sm">
        {(["semua", "pending", "diproses", "selesai", "dibatalkan"] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`rounded-full px-3 py-1 ${
              filter === f ? "bg-brand-500 text-white" : "bg-surface-container text-secondary"
            }`}
          >
            {f === "semua" ? "Semua" : statusLabel[f]}
          </button>
        ))}
      </div>

      <div className="grid gap-3 lg:grid-cols-2">
        {visibleOrders.map((order) => (
          <div key={order.id} className="rounded-xl bg-white p-4 shadow-card">
            <div className="mb-2 flex items-center justify-between">
              <div>
                <p className="font-mono text-xs text-secondary">{shortOrderCode(order.id)}</p>
                <p className="font-medium">{order.nama_pelanggan}</p>
                <p className="text-sm text-secondary">
                  {order.no_hp} &middot; {order.metode === "pickup" ? "Ambil Sendiri" : "Antar"}
                </p>
              </div>
              <span className={`rounded-full px-3 py-1 text-xs font-medium ${statusColor[order.status]}`}>
                {statusLabel[order.status]}
              </span>
            </div>

            <div className="mb-2 space-y-0.5 text-sm text-neutral-700">
              {(itemsByOrder[order.id] ?? []).map((it) => (
                <div key={it.id} className="flex justify-between">
                  <span>
                    {it.qty}x {it.nama}
                  </span>
                  <span>{formatRupiah(it.harga * it.qty)}</span>
                </div>
              ))}
            </div>
            <div className="mb-3 flex justify-between border-t border-neutral-100 pt-2 font-semibold">
              <span>Total</span>
              <span>{formatRupiah(order.total)}</span>
            </div>
            {order.catatan && (
              <p className="mb-3 text-sm italic text-neutral-500">Catatan: {order.catatan}</p>
            )}

            {order.status === "pending" && (
              <div className="flex gap-2">
                <button
                  onClick={() => updateStatus(order.id, "diproses")}
                  className="flex items-center gap-1 rounded-lg bg-brand-500 px-3 py-1.5 text-sm font-medium text-white hover:bg-brand-600"
                >
                  <Check className="h-4 w-4" /> Terima
                </button>
                <button
                  onClick={() => updateStatus(order.id, "dibatalkan")}
                  className="flex items-center gap-1 rounded-lg border border-outline-variant px-3 py-1.5 text-sm hover:bg-surface-container"
                >
                  <X className="h-4 w-4" /> Tolak
                </button>
              </div>
            )}
            {order.status === "diproses" && (
              <div className="flex gap-2">
                <button
                  onClick={() => updateStatus(order.id, "selesai")}
                  className="rounded-lg border border-outline-variant px-3 py-1.5 text-sm hover:bg-surface-container"
                >
                  Tandai Selesai
                </button>
                <button
                  onClick={() => updateStatus(order.id, "dibatalkan")}
                  className="rounded-lg border border-red-200 px-3 py-1.5 text-sm text-red-600 hover:bg-red-50"
                >
                  Batalkan
                </button>
              </div>
            )}
          </div>
        ))}
        {visibleOrders.length === 0 && <p className="text-neutral-500">Tidak ada pesanan.</p>}
      </div>
    </div>
  );
}

"use client";

import { useEffect, useState, useCallback } from "react";
import { createClient } from "@/lib/supabase";
import OrderProgressTracker from "./OrderProgressTracker";
import { formatRupiah, shortOrderCode, type OrderStatus } from "@/lib/types";

const statusLabel: Record<string, string> = {
  pending: "Menunggu",
  diproses: "Diproses",
  selesai: "Selesai",
  dibatalkan: "Dibatalkan",
};

const statusColor: Record<string, string> = {
  pending: "bg-amber-100 text-amber-700",
  diproses: "bg-blue-100 text-blue-700",
  selesai: "bg-emerald-100 text-emerald-700",
  dibatalkan: "bg-red-100 text-red-600",
};

type OrderData = {
  id: string;
  nama_pelanggan: string;
  no_hp: string;
  alamat: string | null;
  metode: string;
  catatan: string | null;
  status: OrderStatus;
  total: number;
};

type OrderItemData = {
  id: string;
  qty: number;
  nama: string;
  harga: number;
};

export default function OrderTrackingClient({
  orderId,
  initialOrder,
  initialItems,
}: {
  orderId: string;
  initialOrder: OrderData;
  initialItems: OrderItemData[];
}) {
  const supabase = createClient();
  const [order, setOrder] = useState<OrderData>(initialOrder);
  const [items] = useState<OrderItemData[]>(initialItems);

  const refreshOrder = useCallback(async () => {
    const { data } = await supabase
      .from("orders")
      .select("id, nama_pelanggan, no_hp, alamat, metode, catatan, status, total")
      .eq("id", orderId)
      .single();
    if (data) setOrder((prev) => ({ ...prev, ...data }));
  }, [orderId]);

  useEffect(() => {
    const channel = supabase
      .channel(`order-${orderId}`)
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "orders", filter: `id=eq.${orderId}` },
        (payload) => {
          setOrder((prev) => ({ ...prev, ...(payload.new as Partial<OrderData>) }));
        }
      )
      .subscribe();

    const poll = setInterval(refreshOrder, 5000);

    return () => {
      supabase.removeChannel(channel);
      clearInterval(poll);
    };
  }, [orderId, refreshOrder]);

  const o = order;

  return (
    <main className="min-h-screen bg-sf-bg pb-8">
      <div className="mx-auto max-w-container px-4 py-6">
        <a href="/" className="mb-4 inline-flex items-center gap-1 text-sm text-sf-text-secondary">
          &larr; Beranda
        </a>

        <div className="mb-5 text-center">
          <div className="mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-full bg-sf-red/10 text-3xl">
            {o.status === "selesai" ? "✅" : o.status === "dibatalkan" ? "❌" : "⏳"}
          </div>
          <h1 className="text-xl font-extrabold text-sf-text">Status Pesanan</h1>
          <p className="mt-1 text-sm text-sf-text-secondary">Pantau pesananmu di sini</p>
        </div>

        <div className="mb-3 flex items-center justify-between rounded-2xl bg-white p-3 shadow-card">
          <span className="font-mono text-[11px] text-sf-text-light">{shortOrderCode(o.id)}</span>
          <span className={`rounded-full px-2.5 py-0.5 text-[11px] font-medium ${statusColor[o.status]}`}>{statusLabel[o.status]}</span>
        </div>

        <div className="mb-3 rounded-2xl bg-white p-4 shadow-card">
          <OrderProgressTracker status={o.status} />
        </div>

        <div className="rounded-2xl bg-white p-4 shadow-card text-sm">
          <div className="mb-2"><p className="text-[11px] text-sf-text-light">Atas nama</p><p className="font-medium">{o.nama_pelanggan}</p></div>
          <div className="mb-2"><p className="text-[11px] text-sf-text-light">Metode</p><p className="font-medium">{o.metode === "pickup" ? "Ambil Sendiri" : "Antar ke " + o.alamat}</p></div>
          <div className="mt-3 space-y-1 border-t border-sf-border pt-3">
            {items.map((it) => (
              <div key={it.id} className="flex justify-between text-xs"><span className="text-sf-text-secondary">{it.qty}x {it.nama}</span><span className="font-medium">{formatRupiah(it.harga * it.qty)}</span></div>
            ))}
          </div>
          <div className="mt-2 flex justify-between border-t border-sf-border pt-2 font-extrabold"><span>Total</span><span className="text-sf-red">{formatRupiah(o.total)}</span></div>
        </div>

        <p className="mt-3 text-center text-[11px] text-sf-text-light">Simpan link ini untuk cek status pesananmu.</p>
      </div>
    </main>
  );
}

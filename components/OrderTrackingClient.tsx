"use client";

import { useEffect, useState, useCallback } from "react";
import { createClient } from "@/lib/supabase";
import OrderProgressTracker from "./OrderProgressTracker";
import { formatRupiah, shortOrderCode, type OrderStatus } from "@/lib/types";

const statusLabel: Record<string, string> = {
  pending: "Menunggu Konfirmasi",
  diproses: "Sedang Diproses",
  selesai: "Selesai",
  dibatalkan: "Dibatalkan",
};

const statusColor: Record<string, string> = {
  pending: "bg-amber-100 text-amber-700",
  diproses: "bg-blue-100 text-blue-700",
  selesai: "bg-green-100 text-green-700",
  dibatalkan: "bg-red-100 text-red-700",
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
    <main className="min-h-screen bg-[#FAF6ED]">
      <div className="mx-auto max-w-md px-4 py-6 sm:py-10">
        <a href="/" className="mb-4 sm:mb-6 inline-flex items-center gap-1.5 rounded-lg px-2 py-1 text-sm text-[#1C1410]/50 transition hover:bg-[#1C1410]/5 hover:text-[#1C1410]">
          &larr; Kembali
        </a>

        <div className="mb-5 sm:mb-6 text-center">
          <div className="mx-auto mb-3 sm:mb-4 flex h-14 w-14 sm:h-16 sm:w-16 items-center justify-center rounded-2xl bg-[#C1440E]/10 text-2xl sm:text-3xl">
            {o.status === "selesai" ? "✅" : o.status === "dibatalkan" ? "❌" : "⏳"}
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-[#1C1410]">Terima Kasih!</h1>
          <p className="mt-1 text-xs sm:text-sm text-[#1C1410]/50">
            Pesanan Anda telah kami terima dan sedang diproses oleh penjual.
          </p>
        </div>

        <div className="mb-3 sm:mb-4 flex items-center justify-between rounded-xl bg-white p-3 shadow-card">
          <span className="font-mono text-xs text-[#1C1410]/40">{shortOrderCode(o.id)}</span>
          <span className={`inline-block rounded-full px-2.5 sm:px-3 py-1 text-xs font-medium ${statusColor[o.status]}`}>
            {statusLabel[o.status]}
          </span>
        </div>

        <div className="mb-3 sm:mb-4 rounded-2xl bg-white p-4 sm:p-5 shadow-card">
          <OrderProgressTracker status={o.status} />
        </div>

        <div className="rounded-2xl bg-white p-4 sm:p-5 shadow-card">
          <div className="mb-3">
            <p className="text-xs text-[#1C1410]/40">Atas nama</p>
            <p className="font-medium text-[#1C1410]">{o.nama_pelanggan}</p>
          </div>
          <div className="mb-3">
            <p className="text-xs text-[#1C1410]/40">Metode</p>
            <p className="font-medium text-[#1C1410] capitalize">
              {o.metode === "pickup" ? "Ambil Sendiri" : "Antar ke " + o.alamat}
            </p>
          </div>

          <div className="mt-3 sm:mt-4 space-y-1.5 border-t border-[#1C1410]/8 pt-3 sm:pt-4 text-xs sm:text-sm">
            {items.map((it) => (
              <div key={it.id} className="flex justify-between">
                <span className="text-[#1C1410]/60">{it.qty}x {it.nama}</span>
                <span className="font-medium text-[#1C1410]">{formatRupiah(it.harga * it.qty)}</span>
              </div>
            ))}
          </div>
          <div className="mt-2.5 sm:mt-3 flex justify-between border-t border-[#1C1410]/8 pt-2.5 sm:pt-3 font-bold text-[#1C1410]">
            <span>Total</span>
            <span>{formatRupiah(o.total)}</span>
          </div>
        </div>

        <p className="mt-3 sm:mt-4 text-center text-xs text-[#1C1410]/35">
          Simpan link halaman ini untuk memantau status pesananmu.
        </p>
      </div>
    </main>
  );
}

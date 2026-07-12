"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase";
import { formatRupiah, shortOrderCode, type Order, type OrderItem, type OrderStatus, type MetodeBayar, METODE_BAYAR_LABEL } from "@/lib/types";
import { Check, X } from "lucide-react";

const sLabel: Record<string, string> = { pending: "Menunggu", diproses: "Diproses", selesai: "Selesai", dibatalkan: "Dibatalkan" };
const sColor: Record<string, string> = { pending: "bg-amber-100 text-amber-700", diproses: "bg-blue-100 text-blue-700", selesai: "bg-emerald-100 text-emerald-700", dibatalkan: "bg-red-100 text-red-600" };

export default function OrdersPage() {
  const supabase = createClient();
  const [umkmId, setUmkmId] = useState<string | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [itemsByOrder, setItemsByOrder] = useState<Record<string, OrderItem[]>>({});
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<OrderStatus | "semua">("semua");

  async function load(uid: string) {
    const { data: od } = await supabase.from("orders").select("*").eq("umkm_id", uid).order("created_at", { ascending: false });
    const list = (od ?? []) as Order[]; setOrders(list);
    if (list.length > 0) {
      const { data: id } = await supabase.from("order_items").select("*").in("order_id", list.map((o) => o.id));
      const g: Record<string, OrderItem[]> = {}; (id ?? []).forEach((it: OrderItem) => { g[it.order_id] = g[it.order_id] || []; g[it.order_id].push(it); });
      setItemsByOrder(g);
    }
  }

  useEffect(() => {
    let ch: any;
    (async () => {
      const { data: { user } } = await supabase.auth.getUser(); if (!user) return;
      const { data: u } = await supabase.from("umkm").select("id").eq("user_id", user.id).single();
      if (u) { setUmkmId(u.id); await load(u.id); ch = supabase.channel("ord-rt").on("postgres_changes", { event: "*", schema: "public", table: "orders", filter: `umkm_id=eq.${u.id}` }, () => load(u.id)).subscribe(); }
      setLoading(false);
    })();
    return () => { if (ch) supabase.removeChannel(ch); };
  }, []);

  async function updateStatus(id: string, status: OrderStatus) { await supabase.from("orders").update({ status }).eq("id", id); if (umkmId) await load(umkmId); }

  const visible = filter === "semua" ? orders : orders.filter((o) => o.status === filter);

  if (loading) return <div className="flex h-40 items-center justify-center"><div className="h-8 w-8 animate-spin rounded-full border-4 border-sf-red border-t-transparent" /></div>;

  return (
    <div>
      <h1 className="mb-3 text-lg font-extrabold text-sf-text">Pesanan Masuk</h1>

      <div className="mb-4 flex gap-1.5 overflow-x-auto scrollbar-none">
        {(["semua", "pending", "diproses", "selesai", "dibatalkan"] as const).map((f) => (
          <button key={f} onClick={() => setFilter(f)} className={`shrink-0 rounded-full px-3.5 py-1.5 text-xs font-medium transition ${filter === f ? "bg-sf-red text-white" : "bg-white text-sf-text-secondary shadow-card"}`}>
            {f === "semua" ? "Semua" : sLabel[f]}
          </button>
        ))}
      </div>

      <div className="space-y-3">
        {visible.map((o) => (
          <div key={o.id} className="rounded-2xl bg-white p-4 shadow-card">
            <div className="mb-2 flex items-center justify-between">
              <div>
                <p className="text-[11px] font-mono text-sf-text-light">{shortOrderCode(o.id)}</p>
                <p className="text-sm font-bold text-sf-text">{o.nama_pelanggan}</p>
                <p className="text-[11px] text-sf-text-secondary">{o.no_hp} · {o.metode === "pickup" ? "Ambil" : "Antar"} · {METODE_BAYAR_LABEL[((o as any).metode_bayar || "cash") as MetodeBayar]}</p>
              </div>
              <span className={`rounded-full px-2.5 py-0.5 text-[11px] font-medium ${sColor[o.status]}`}>{sLabel[o.status]}</span>
            </div>
            <div className="mb-2 space-y-0.5 text-xs">
              {(itemsByOrder[o.id] ?? []).map((it) => (
                <div key={it.id} className="flex justify-between"><span className="text-sf-text-secondary">{it.qty}x {it.nama}</span><span className="font-medium">{formatRupiah(it.harga * it.qty)}</span></div>
              ))}
            </div>
            <div className="mb-2 flex justify-between border-t border-sf-border pt-2 text-sm font-bold"><span>Total</span><span>{formatRupiah(o.total)}</span></div>
            {o.catatan && <p className="mb-2 text-[11px] italic text-sf-text-light">Catatan: {o.catatan}</p>}

            <div className="flex gap-2">
              {o.status === "pending" && (
                <>
                  <button onClick={() => updateStatus(o.id, "diproses")} className="flex flex-1 items-center justify-center gap-1 rounded-xl bg-sf-red py-2 text-xs font-bold text-white"><Check className="h-3.5 w-3.5" /> Terima</button>
                  <button onClick={() => updateStatus(o.id, "dibatalkan")} className="flex flex-1 items-center justify-center gap-1 rounded-xl border border-sf-border py-2 text-xs font-medium text-sf-text-secondary"><X className="h-3.5 w-3.5" /> Tolak</button>
                </>
              )}
              {o.status === "diproses" && (
                <>
                  <button onClick={() => updateStatus(o.id, "selesai")} className="flex flex-1 items-center justify-center rounded-xl bg-sf-green py-2 text-xs font-bold text-white">Selesai</button>
                  <button onClick={() => updateStatus(o.id, "dibatalkan")} className="rounded-xl border border-red-200 px-4 py-2 text-xs text-red-500">Batal</button>
                </>
              )}
            </div>
          </div>
        ))}
        {visible.length === 0 && <div className="rounded-2xl bg-white p-10 text-center shadow-card"><p className="text-3xl">📦</p><p className="mt-2 text-sm text-sf-text-secondary">Tidak ada pesanan.</p></div>}
      </div>
    </div>
  );
}

import { createServerSupabase } from "@/lib/supabase-server";
import { notFound } from "next/navigation";
import { formatRupiah, shortOrderCode, type Order, type OrderItem } from "@/lib/types";
import Link from "next/link";
import OrderProgressTracker from "@/components/OrderProgressTracker";

export const revalidate = 0;

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
    <main className="min-h-screen bg-[#FAF6ED]">
      <div className="mx-auto max-w-md px-4 py-10">
        <Link
          href="/"
          className="mb-6 inline-flex items-center gap-1.5 rounded-lg px-2 py-1 text-sm text-[#1C1410]/50 transition hover:bg-[#1C1410]/5 hover:text-[#1C1410]"
        >
          &larr; Kembali
        </Link>

        <div className="mb-6 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-[#C1440E]/10 text-3xl">
            {o.status === "selesai" ? "✅" : o.status === "dibatalkan" ? "❌" : "⏳"}
          </div>
          <h1 className="text-2xl font-bold text-[#1C1410]">Terima Kasih!</h1>
          <p className="mt-1 text-sm text-[#1C1410]/50">
            Pesanan Anda telah kami terima dan sedang diproses oleh penjual.
          </p>
        </div>

        <div className="mb-4 flex items-center justify-between rounded-xl bg-white p-3 shadow-card">
          <span className="font-mono text-xs text-[#1C1410]/40">{shortOrderCode(o.id)}</span>
          <span className={`inline-block rounded-full px-3 py-1 text-xs font-medium ${statusColor[o.status]}`}>
            {statusLabel[o.status]}
          </span>
        </div>

        <div className="mb-4 rounded-2xl bg-white p-5 shadow-card">
          <OrderProgressTracker status={o.status} />
        </div>

        <div className="rounded-2xl bg-white p-5 shadow-card">
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

          <div className="mt-4 space-y-1.5 border-t border-[#1C1410]/8 pt-4 text-sm">
            {orderItems.map((it) => (
              <div key={it.id} className="flex justify-between">
                <span className="text-[#1C1410]/60">
                  {it.qty}x {it.nama}
                </span>
                <span className="font-medium text-[#1C1410]">{formatRupiah(it.harga * it.qty)}</span>
              </div>
            ))}
          </div>
          <div className="mt-3 flex justify-between border-t border-[#1C1410]/8 pt-3 font-bold text-[#1C1410]">
            <span>Total</span>
            <span>{formatRupiah(o.total)}</span>
          </div>
        </div>

        <p className="mt-4 text-center text-xs text-[#1C1410]/35">
          Simpan link halaman ini untuk memantau status pesananmu.
        </p>
      </div>
    </main>
  );
}

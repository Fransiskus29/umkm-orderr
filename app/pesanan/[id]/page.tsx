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
    <main className="mx-auto max-w-md px-4 py-10">
      <Link href="/" className="text-sm text-brand-500">
        &larr; Kembali
      </Link>
      <h1 className="mt-2 text-2xl font-bold">Terima Kasih!</h1>
      <p className="mt-1 text-sm text-secondary">
        Pesanan Anda telah kami terima dan sedang diproses oleh penjual.
      </p>

      <div className="mt-4 flex items-center justify-between">
        <span className="text-xs font-mono text-secondary">{shortOrderCode(o.id)}</span>
        <span className={`inline-block rounded-full px-3 py-1 text-xs font-medium ${statusColor[o.status]}`}>
          {statusLabel[o.status]}
        </span>
      </div>

      <div className="mt-4 rounded-xl bg-white p-5 shadow-card">
        <OrderProgressTracker status={o.status} />
      </div>

      <div className="mt-4 rounded-xl bg-white p-4 shadow-card">
        <p className="text-sm text-secondary">Atas nama</p>
        <p className="font-medium">{o.nama_pelanggan}</p>
        <p className="mt-2 text-sm text-secondary">Metode</p>
        <p className="font-medium capitalize">{o.metode === "pickup" ? "Ambil Sendiri" : "Antar ke " + o.alamat}</p>

        <div className="mt-4 space-y-1 border-t border-surface-high pt-4 text-sm">
          {orderItems.map((it) => (
            <div key={it.id} className="flex justify-between">
              <span>
                {it.qty}x {it.nama}
              </span>
              <span>{formatRupiah(it.harga * it.qty)}</span>
            </div>
          ))}
        </div>
        <div className="mt-3 flex justify-between border-t border-surface-high pt-3 font-semibold">
          <span>Total</span>
          <span>{formatRupiah(o.total)}</span>
        </div>
      </div>

      <p className="mt-4 text-center text-xs text-secondary">
        Simpan link halaman ini untuk memantau status pesananmu.
      </p>
    </main>
  );
}

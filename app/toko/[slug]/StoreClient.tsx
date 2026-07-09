"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase";
import { formatRupiah, type MenuItem, type Umkm } from "@/lib/types";
import Link from "next/link";
import { ShoppingCart } from "lucide-react";

type CartLine = { item: MenuItem; qty: number };

export default function StoreClient({ umkm, menu }: { umkm: Umkm; menu: MenuItem[] }) {
  const router = useRouter();
  const supabase = createClient();
  const [cart, setCart] = useState<Record<string, CartLine>>({});
  const [activeKategori, setActiveKategori] = useState<string>("Semua");
  const [showCheckout, setShowCheckout] = useState(false);
  const [nama, setNama] = useState("");
  const [noHp, setNoHp] = useState("");
  const [alamat, setAlamat] = useState("");
  const [metode, setMetode] = useState<"pickup" | "delivery">("pickup");
  const [catatan, setCatatan] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const lines = Object.values(cart);
  const total = useMemo(
    () => lines.reduce((sum, l) => sum + l.item.harga * l.qty, 0),
    [lines]
  );
  const itemCount = lines.reduce((sum, l) => sum + l.qty, 0);

  const kategoriList = useMemo(() => {
    const set = new Set(menu.map((m) => m.kategori || "Lainnya"));
    return ["Semua", ...Array.from(set)];
  }, [menu]);

  const filteredMenu = activeKategori === "Semua" ? menu : menu.filter((m) => m.kategori === activeKategori);

  function addToCart(item: MenuItem) {
    setCart((prev) => {
      const existing = prev[item.id];
      return {
        ...prev,
        [item.id]: { item, qty: (existing?.qty ?? 0) + 1 },
      };
    });
  }

  function changeQty(itemId: string, delta: number) {
    setCart((prev) => {
      const existing = prev[itemId];
      if (!existing) return prev;
      const newQty = existing.qty + delta;
      const next = { ...prev };
      if (newQty <= 0) {
        delete next[itemId];
      } else {
        next[itemId] = { ...existing, qty: newQty };
      }
      return next;
    });
  }

  async function handleCheckout(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (lines.length === 0) {
      setError("Keranjang masih kosong.");
      return;
    }
    setLoading(true);

    const { data: order, error: orderError } = await supabase
      .from("orders")
      .insert({
        umkm_id: umkm.id,
        nama_pelanggan: nama,
        no_hp: noHp,
        alamat: metode === "delivery" ? alamat : null,
        metode,
        catatan,
        status: "pending",
        total,
      })
      .select()
      .single();

    if (orderError || !order) {
      setError(orderError?.message || "Gagal membuat pesanan.");
      setLoading(false);
      return;
    }

    const orderItemsPayload = lines.map((l) => ({
      order_id: order.id,
      menu_item_id: l.item.id,
      nama: l.item.nama,
      harga: l.item.harga,
      qty: l.qty,
    }));

    const { error: itemsError } = await supabase.from("order_items").insert(orderItemsPayload);

    if (itemsError) {
      setError(itemsError.message);
      setLoading(false);
      return;
    }

    router.push(`/pesanan/${order.id}`);
  }

  return (
    <main className="min-h-screen bg-surface pb-28">
      <header className="border-b border-surface-high bg-white">
        <div className="mx-auto max-w-container px-4 py-6 lg:px-6">
          <Link href="/" className="text-sm text-brand-500">
            &larr; Semua UMKM
          </Link>
          <h1 className="mt-2 text-2xl font-bold md:text-3xl">{umkm.nama_usaha}</h1>
          {umkm.deskripsi && <p className="mt-1 text-secondary">{umkm.deskripsi}</p>}
          {umkm.jam_operasional && (
            <p className="mt-1 text-sm text-secondary">🕒 {umkm.jam_operasional}</p>
          )}
        </div>
      </header>

      <div className="mx-auto max-w-container px-4 py-6 lg:px-6">
        <h2 className="mb-4 text-lg font-semibold">Menu</h2>
        {menu.length === 0 ? (
          <p className="text-secondary">Belum ada menu tersedia saat ini.</p>
        ) : (
          <>
            <div className="mb-4 flex gap-2 overflow-x-auto text-sm">
              {kategoriList.map((k) => (
                <button
                  key={k}
                  onClick={() => setActiveKategori(k)}
                  className={`shrink-0 rounded-full px-4 py-1.5 font-medium ${
                    activeKategori === k
                      ? "bg-brand-500 text-white"
                      : "bg-surface-container text-secondary"
                  }`}
                >
                  {k}
                </button>
              ))}
            </div>
            <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
              {filteredMenu.map((item) => {
              const qtyInCart = cart[item.id]?.qty ?? 0;
              return (
                <div
                  key={item.id}
                  className="flex items-center justify-between overflow-hidden rounded-xl bg-white shadow-card"
                >
                  {item.foto_url && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={item.foto_url}
                      alt={item.nama}
                      className="h-20 w-20 shrink-0 object-cover"
                    />
                  )}
                  <div className="flex flex-1 items-center justify-between p-4">
                  <div>
                    <h3 className="font-medium">{item.nama}</h3>
                    {item.deskripsi && (
                      <p className="text-sm text-secondary">{item.deskripsi}</p>
                    )}
                    <p className="mt-1 font-semibold text-brand-500">
                      {formatRupiah(item.harga)}
                    </p>
                  </div>
                  {qtyInCart === 0 ? (
                    <button
                      onClick={() => addToCart(item)}
                      className="rounded-lg bg-brand-500 px-4 py-2 text-sm font-medium text-white hover:bg-brand-600"
                    >
                      Tambah
                    </button>
                  ) : (
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => changeQty(item.id, -1)}
                        className="h-8 w-8 rounded-full border border-outline-variant font-bold"
                      >
                        -
                      </button>
                      <span className="w-5 text-center">{qtyInCart}</span>
                      <button
                        onClick={() => changeQty(item.id, 1)}
                        className="h-8 w-8 rounded-full border border-outline-variant font-bold"
                      >
                        +
                      </button>
                    </div>
                  )}
                  </div>
                </div>
              );
            })}
            </div>
          </>
        )}
      </div>

      {itemCount > 0 && !showCheckout && (
        <div className="fixed inset-x-0 bottom-0 border-t border-surface-high bg-white p-4 shadow-overlay">
          <div className="mx-auto flex max-w-container items-center justify-between px-2 lg:px-6">
            <div className="flex items-center gap-2">
              <ShoppingCart className="h-5 w-5 text-secondary" />
              <div>
                <p className="text-sm text-secondary">{itemCount} item</p>
                <p className="font-semibold">{formatRupiah(total)}</p>
              </div>
            </div>
            <button
              onClick={() => setShowCheckout(true)}
              className="rounded-lg bg-brand-500 px-6 py-3 font-medium text-white hover:bg-brand-600"
            >
              Checkout
            </button>
          </div>
        </div>
      )}

      {showCheckout && (
        <div className="fixed inset-0 z-10 flex items-end bg-black/40 sm:items-center sm:justify-center">
          <div className="max-h-[90vh] w-full overflow-y-auto rounded-t-2xl bg-white p-6 sm:max-w-md sm:rounded-2xl">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold">Konfirmasi Pesanan</h2>
              <button onClick={() => setShowCheckout(false)} className="text-neutral-400">
                &times;
              </button>
            </div>

            <div className="mb-4 space-y-1 rounded-lg bg-neutral-50 p-3 text-sm">
              {lines.map((l) => (
                <div key={l.item.id} className="flex justify-between">
                  <span>
                    {l.qty}x {l.item.nama}
                  </span>
                  <span>{formatRupiah(l.item.harga * l.qty)}</span>
                </div>
              ))}
              <div className="mt-2 flex justify-between border-t border-neutral-200 pt-2 font-semibold">
                <span>Total</span>
                <span>{formatRupiah(total)}</span>
              </div>
            </div>

            <form onSubmit={handleCheckout} className="space-y-3">
              <div>
                <label className="mb-1 block text-sm font-medium">Nama</label>
                <input
                  required
                  value={nama}
                  onChange={(e) => setNama(e.target.value)}
                  className="w-full rounded-lg border border-neutral-300 px-3 py-2"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium">No. HP / WhatsApp</label>
                <input
                  required
                  value={noHp}
                  onChange={(e) => setNoHp(e.target.value)}
                  className="w-full rounded-lg border border-neutral-300 px-3 py-2"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium">Metode</label>
                <div className="flex gap-3">
                  <label className="flex items-center gap-1 text-sm">
                    <input
                      type="radio"
                      checked={metode === "pickup"}
                      onChange={() => setMetode("pickup")}
                    />
                    Ambil Sendiri
                  </label>
                  <label className="flex items-center gap-1 text-sm">
                    <input
                      type="radio"
                      checked={metode === "delivery"}
                      onChange={() => setMetode("delivery")}
                    />
                    Antar
                  </label>
                </div>
              </div>
              {metode === "delivery" && (
                <div>
                  <label className="mb-1 block text-sm font-medium">Alamat</label>
                  <textarea
                    required
                    value={alamat}
                    onChange={(e) => setAlamat(e.target.value)}
                    className="w-full rounded-lg border border-neutral-300 px-3 py-2"
                    rows={2}
                  />
                </div>
              )}
              <div>
                <label className="mb-1 block text-sm font-medium">Catatan (opsional)</label>
                <input
                  value={catatan}
                  onChange={(e) => setCatatan(e.target.value)}
                  className="w-full rounded-lg border border-neutral-300 px-3 py-2"
                />
              </div>
              {error && <p className="text-sm text-red-600">{error}</p>}
              <button
                disabled={loading}
                className="w-full rounded-lg bg-brand-600 py-2.5 font-medium text-white hover:bg-brand-700 disabled:opacity-50"
              >
                {loading ? "Mengirim..." : "Buat Pesanan"}
              </button>
            </form>
          </div>
        </div>
      )}
    </main>
  );
}

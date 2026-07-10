"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase";
import { formatRupiah, type MenuItem, type Umkm } from "@/lib/types";
import Link from "next/link";
import { ShoppingCart, ArrowLeft, Clock, Phone, Minus, Plus, X, ChevronDown } from "lucide-react";

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
    <main className="min-h-screen bg-[#FAF6ED] pb-28">
      {/* Header */}
      <header className="relative overflow-hidden border-b border-[#1C1410]/8 bg-white">
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.06]"
          style={{
            backgroundImage: "radial-gradient(circle, #E8A33D 1px, transparent 1px)",
            backgroundSize: "20px 20px",
          }}
        />
        <div className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-[#C1440E] opacity-10 blur-3xl" />

        <div className="relative mx-auto max-w-container px-4 py-6 lg:px-6">
          <Link
            href="/"
            className="mb-4 inline-flex items-center gap-1.5 rounded-lg px-2 py-1 text-sm text-[#1C1410]/50 transition hover:bg-[#1C1410]/5 hover:text-[#1C1410]"
          >
            <ArrowLeft className="h-4 w-4" />
            Semua UMKM
          </Link>

          <div className="flex items-start gap-4">
            <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-[#C1440E] to-[#a83a0c] text-2xl font-bold text-white shadow-lg">
              {umkm.nama_usaha.charAt(0).toUpperCase()}
            </div>
            <div>
              <h1 className="text-2xl font-bold text-[#1C1410] md:text-3xl">{umkm.nama_usaha}</h1>
              {umkm.deskripsi && (
                <p className="mt-1 text-sm text-[#1C1410]/50">{umkm.deskripsi}</p>
              )}
              <div className="mt-2 flex flex-wrap gap-3 text-xs text-[#1C1410]/40">
                {umkm.jam_operasional && (
                  <span className="flex items-center gap-1">
                    <Clock className="h-3.5 w-3.5" />
                    {umkm.jam_operasional}
                  </span>
                )}
                {umkm.no_hp && (
                  <span className="flex items-center gap-1">
                    <Phone className="h-3.5 w-3.5" />
                    {umkm.no_hp}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Menu Section */}
      <div className="mx-auto max-w-container px-4 py-6 lg:px-6">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-[#1C1410]">Menu Tersedia</h2>
          <span className="rounded-full bg-[#C1440E]/10 px-3 py-1 text-xs font-medium text-[#C1440E]">
            {menu.length} item
          </span>
        </div>

        {menu.length === 0 ? (
          <div className="rounded-2xl border-2 border-dashed border-[#1C1410]/10 bg-white p-12 text-center">
            <p className="text-[#1C1410]/40">Belum ada menu tersedia saat ini.</p>
          </div>
        ) : (
          <>
            {/* Category Filter */}
            <div className="mb-5 flex gap-2 overflow-x-auto pb-1">
              {kategoriList.map((k) => (
                <button
                  key={k}
                  onClick={() => setActiveKategori(k)}
                  className={`shrink-0 rounded-full px-4 py-1.5 text-sm font-medium transition ${
                    activeKategori === k
                      ? "bg-[#C1440E] text-white shadow-sm"
                      : "bg-white text-[#1C1410]/50 hover:bg-[#1C1410]/5"
                  }`}
                >
                  {k}
                </button>
              ))}
            </div>

            {/* Menu Grid */}
            <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
              {filteredMenu.map((item) => {
                const qtyInCart = cart[item.id]?.qty ?? 0;
                return (
                  <div
                    key={item.id}
                    className="group overflow-hidden rounded-2xl border border-[#1C1410]/6 bg-white shadow-card transition hover:shadow-lg"
                  >
                    {item.foto_url && (
                      <div className="relative h-40 overflow-hidden">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={item.foto_url}
                          alt={item.nama}
                          className="h-full w-full object-cover transition group-hover:scale-105"
                        />
                        {qtyInCart > 0 && (
                          <div className="absolute right-2 top-2 flex h-7 w-7 items-center justify-center rounded-full bg-[#C1440E] text-xs font-bold text-white shadow-md">
                            {qtyInCart}
                          </div>
                        )}
                      </div>
                    )}
                    <div className="p-4">
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0 flex-1">
                          <h3 className="font-semibold text-[#1C1410]">{item.nama}</h3>
                          {item.deskripsi && (
                            <p className="mt-0.5 line-clamp-2 text-sm text-[#1C1410]/45">{item.deskripsi}</p>
                          )}
                        </div>
                      </div>
                      <div className="mt-3 flex items-center justify-between">
                        <p className="text-lg font-bold text-[#C1440E]">
                          {formatRupiah(item.harga)}
                        </p>
                        {qtyInCart === 0 ? (
                          <button
                            onClick={() => addToCart(item)}
                            className="rounded-xl bg-[#C1440E] px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-[#a83a0c] hover:shadow-md"
                          >
                            Tambah
                          </button>
                        ) : (
                          <div className="flex items-center gap-1.5">
                            <button
                              onClick={() => changeQty(item.id, -1)}
                              className="flex h-9 w-9 items-center justify-center rounded-xl border border-[#1C1410]/10 text-[#1C1410] transition hover:bg-[#1C1410]/5"
                            >
                              <Minus className="h-4 w-4" />
                            </button>
                            <span className="w-8 text-center text-sm font-bold text-[#1C1410]">{qtyInCart}</span>
                            <button
                              onClick={() => changeQty(item.id, 1)}
                              className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#C1440E] text-white transition hover:bg-[#a83a0c]"
                            >
                              <Plus className="h-4 w-4" />
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>

      {/* Floating Cart Bar */}
      {itemCount > 0 && !showCheckout && (
        <div className="fixed inset-x-0 bottom-0 border-t border-[#1C1410]/8 bg-white/95 p-4 shadow-[0_-4px_20px_rgba(0,0,0,0.08)] backdrop-blur-md">
          <div className="mx-auto flex max-w-container items-center justify-between px-2 lg:px-6">
            <div className="flex items-center gap-3">
              <div className="relative">
                <ShoppingCart className="h-6 w-6 text-[#C1440E]" />
                <span className="absolute -right-2 -top-2 flex h-5 w-5 items-center justify-center rounded-full bg-[#C1440E] text-[10px] font-bold text-white">
                  {itemCount}
                </span>
              </div>
              <div>
                <p className="text-xs text-[#1C1410]/40">{itemCount} item</p>
                <p className="font-bold text-[#1C1410]">{formatRupiah(total)}</p>
              </div>
            </div>
            <button
              onClick={() => setShowCheckout(true)}
              className="rounded-xl bg-[#C1440E] px-6 py-3 font-medium text-white shadow-md transition hover:bg-[#a83a0c] hover:shadow-lg"
            >
              Checkout
            </button>
          </div>
        </div>
      )}

      {/* Checkout Modal */}
      {showCheckout && (
        <div className="fixed inset-0 z-10 flex items-end bg-black/40 sm:items-center sm:justify-center">
          <div className="max-h-[90vh] w-full overflow-y-auto rounded-t-3xl bg-white p-6 sm:max-w-md sm:rounded-3xl">
            <div className="mb-5 flex items-center justify-between">
              <h2 className="text-lg font-bold text-[#1C1410]">Konfirmasi Pesanan</h2>
              <button
                onClick={() => setShowCheckout(false)}
                className="flex h-8 w-8 items-center justify-center rounded-full bg-[#1C1410]/5 text-[#1C1410]/40 transition hover:bg-[#1C1410]/10"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="mb-5 space-y-1.5 rounded-2xl bg-[#FAF6ED] p-4 text-sm">
              {lines.map((l) => (
                <div key={l.item.id} className="flex justify-between">
                  <span className="text-[#1C1410]/70">
                    {l.qty}x {l.item.nama}
                  </span>
                  <span className="font-medium text-[#1C1410]">{formatRupiah(l.item.harga * l.qty)}</span>
                </div>
              ))}
              <div className="mt-2 flex justify-between border-t border-[#1C1410]/8 pt-2 font-bold text-[#1C1410]">
                <span>Total</span>
                <span>{formatRupiah(total)}</span>
              </div>
            </div>

            <form onSubmit={handleCheckout} className="space-y-3">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-[#1C1410]">Nama</label>
                <input
                  required
                  value={nama}
                  onChange={(e) => setNama(e.target.value)}
                  placeholder="Nama kamu"
                  className="w-full rounded-xl border border-[#1C1410]/12 bg-[#FAF6ED] px-3.5 py-2.5 text-sm text-[#1C1410] outline-none placeholder:text-[#1C1410]/25 focus:border-[#C1440E] focus:ring-4 focus:ring-[#C1440E]/10"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-[#1C1410]">No. HP / WhatsApp</label>
                <input
                  required
                  value={noHp}
                  onChange={(e) => setNoHp(e.target.value)}
                  placeholder="08xxxxxxxxxx"
                  className="w-full rounded-xl border border-[#1C1410]/12 bg-[#FAF6ED] px-3.5 py-2.5 text-sm text-[#1C1410] outline-none placeholder:text-[#1C1410]/25 focus:border-[#C1440E] focus:ring-4 focus:ring-[#C1440E]/10"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-[#1C1410]">Metode</label>
                <div className="flex gap-3">
                  <label className="flex flex-1 cursor-pointer items-center gap-2 rounded-xl border border-[#1C1410]/12 bg-[#FAF6ED] px-3 py-2.5 text-sm transition has-[:checked]:border-[#C1440E] has-[:checked]:bg-[#C1440E]/5 has-[:checked]:text-[#C1440E]">
                    <input type="radio" checked={metode === "pickup"} onChange={() => setMetode("pickup")} className="accent-[#C1440E]" />
                    Ambil Sendiri
                  </label>
                  <label className="flex flex-1 cursor-pointer items-center gap-2 rounded-xl border border-[#1C1410]/12 bg-[#FAF6ED] px-3 py-2.5 text-sm transition has-[:checked]:border-[#C1440E] has-[:checked]:bg-[#C1440E]/5 has-[:checked]:text-[#C1440E]">
                    <input type="radio" checked={metode === "delivery"} onChange={() => setMetode("delivery")} className="accent-[#C1440E]" />
                    Antar
                  </label>
                </div>
              </div>
              {metode === "delivery" && (
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-[#1C1410]">Alamat</label>
                  <textarea
                    required
                    value={alamat}
                    onChange={(e) => setAlamat(e.target.value)}
                    placeholder="Alamat lengkap pengantaran"
                    className="w-full rounded-xl border border-[#1C1410]/12 bg-[#FAF6ED] px-3.5 py-2.5 text-sm text-[#1C1410] outline-none placeholder:text-[#1C1410]/25 focus:border-[#C1440E] focus:ring-4 focus:ring-[#C1440E]/10"
                    rows={2}
                  />
                </div>
              )}
              <div>
                <label className="mb-1.5 block text-sm font-medium text-[#1C1410]">Catatan (opsional)</label>
                <input
                  value={catatan}
                  onChange={(e) => setCatatan(e.target.value)}
                  placeholder="Contoh: Pedas level 3"
                  className="w-full rounded-xl border border-[#1C1410]/12 bg-[#FAF6ED] px-3.5 py-2.5 text-sm text-[#1C1410] outline-none placeholder:text-[#1C1410]/25 focus:border-[#C1440E] focus:ring-4 focus:ring-[#C1440E]/10"
                />
              </div>
              {error && (
                <p className="rounded-lg bg-[#C1440E]/8 px-3 py-2 text-sm text-[#C1440E]">{error}</p>
              )}
              <button
                disabled={loading}
                className="w-full rounded-xl bg-[#C1440E] py-3 font-medium text-white shadow-md transition hover:bg-[#a83a0c] disabled:opacity-50"
              >
                {loading ? "Mengirim..." : `Buat Pesanan — ${formatRupiah(total)}`}
              </button>
            </form>
          </div>
        </div>
      )}
    </main>
  );
}

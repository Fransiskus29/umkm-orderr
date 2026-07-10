"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase";
import { formatRupiah, type MenuItem, type Umkm } from "@/lib/types";
import Link from "next/link";
import { ShoppingCart, ArrowLeft, Clock, Phone, Minus, Plus, X } from "lucide-react";

type CartLine = { item: MenuItem; qty: number };

export default function StoreClient({ umkm, menu }: { umkm: Umkm; menu: MenuItem[] }) {
  const router = useRouter();
  const supabase = createClient();
  const [cart, setCart] = useState<Record<string, CartLine>>({});
  const [activeKategori, setActiveKategori] = useState("Semua");
  const [showCheckout, setShowCheckout] = useState(false);
  const [nama, setNama] = useState("");
  const [noHp, setNoHp] = useState("");
  const [alamat, setAlamat] = useState("");
  const [metode, setMetode] = useState<"pickup" | "delivery">("pickup");
  const [catatan, setCatatan] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [user, setUser] = useState<any>(null);

  useEffect(() => { supabase.auth.getUser().then(({ data }) => setUser(data.user)); }, []);

  const lines = Object.values(cart);
  const total = useMemo(() => lines.reduce((s, l) => s + l.item.harga * l.qty, 0), [lines]);
  const itemCount = lines.reduce((s, l) => s + l.qty, 0);

  const kategoriList = useMemo(() => {
    const set = new Set(menu.map((m) => m.kategori || "Lainnya"));
    return ["Semua", ...Array.from(set)];
  }, [menu]);

  const filteredMenu = activeKategori === "Semua" ? menu : menu.filter((m) => m.kategori === activeKategori);

  function addToCart(item: MenuItem) {
    setCart((prev) => ({ ...prev, [item.id]: { item, qty: (prev[item.id]?.qty ?? 0) + 1 } }));
  }
  function changeQty(itemId: string, delta: number) {
    setCart((prev) => {
      const ex = prev[itemId]; if (!ex) return prev;
      const n = ex.qty + delta; const next = { ...prev };
      if (n <= 0) delete next[itemId]; else next[itemId] = { ...ex, qty: n };
      return next;
    });
  }
  function handleCheckoutClick() {
    if (!user) { router.push(`/pelanggan/login?redirect=${encodeURIComponent(window.location.pathname)}`); return; }
    setShowCheckout(true);
  }
  async function handleCheckout(e: React.FormEvent) {
    e.preventDefault(); setError(null);
    if (!lines.length) { setError("Keranjang kosong."); return; }
    setLoading(true);
    const { data: order, error: oe } = await supabase.from("orders").insert({
      umkm_id: umkm.id, nama_pelanggan: nama, no_hp: noHp,
      alamat: metode === "delivery" ? alamat : null, metode, catatan, status: "pending", total, user_id: user?.id || null,
    }).select().single();
    if (oe || !order) { setError(oe?.message || "Gagal."); setLoading(false); return; }
    const payload = lines.map((l) => ({ order_id: order.id, menu_item_id: l.item.id, nama: l.item.nama, harga: l.item.harga, qty: l.qty }));
    const { error: ie } = await supabase.from("order_items").insert(payload);
    if (ie) { setError(ie.message); setLoading(false); return; }
    fetch("/api/telegram", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ umkm_nama: umkm.nama_usaha, order_id: order.id, nama_pelanggan: nama, total, items: lines.map((l) => ({ qty: l.qty, nama: l.item.nama, harga: l.item.harga })), catatan }) }).catch(() => {});
    router.push(`/pesanan/${order.id}`);
  }

  return (
    <main className="min-h-screen bg-sf-bg pb-24 md:pb-8">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="mx-auto max-w-container px-4 py-3 md:px-6">
          <Link href="/" className="inline-flex items-center gap-1 text-sm text-sf-text-secondary hover:text-sf-text">
            <ArrowLeft className="h-4 w-4" /> Beranda
          </Link>
        </div>
        <div className="mx-auto max-w-container flex items-start gap-4 px-4 pb-4 md:px-6">
          <div className="flex h-16 w-16 md:h-20 md:w-20 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-sf-red to-sf-orange text-2xl md:text-3xl font-extrabold text-white shadow-lg">
            {umkm.nama_usaha.charAt(0).toUpperCase()}
          </div>
          <div className="min-w-0 flex-1 pt-1">
            <h1 className="text-lg md:text-2xl font-extrabold text-sf-text">{umkm.nama_usaha}</h1>
            {umkm.deskripsi && <p className="mt-0.5 text-sm text-sf-text-secondary line-clamp-1">{umkm.deskripsi}</p>}
            <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-sf-text-secondary">
              {umkm.jam_operasional && <span className="flex items-center gap-1"><Clock className="h-3.5 w-3.5" />{umkm.jam_operasional}</span>}
              {umkm.no_hp && <span className="flex items-center gap-1"><Phone className="h-3.5 w-3.5" />{umkm.no_hp}</span>}
            </div>
          </div>
        </div>
      </div>

      {/* Category Tabs */}
      {menu.length > 0 && (
        <div className="sticky top-0 z-10 bg-white shadow-sm">
          <div className="mx-auto max-w-container flex gap-0 overflow-x-auto scrollbar-none md:px-6">
            {kategoriList.map((k) => (
              <button key={k} onClick={() => setActiveKategori(k)} className={`shrink-0 border-b-2 px-4 py-3 text-sm font-medium transition ${activeKategori === k ? "border-sf-red text-sf-red" : "border-transparent text-sf-text-secondary"}`}>
                {k}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Menu */}
      <div className="mx-auto max-w-container px-4 pt-4 md:px-6">
        {menu.length === 0 ? (
          <div className="rounded-2xl bg-white p-10 text-center shadow-card">
            <p className="text-4xl">🍽️</p>
            <p className="mt-3 text-sm text-sf-text-secondary">Belum ada menu tersedia.</p>
          </div>
        ) : (
          <div className="space-y-3 md:grid md:grid-cols-2 md:gap-4 md:space-y-0">
            {filteredMenu.map((item) => {
              const qty = cart[item.id]?.qty ?? 0;
              return (
                <div key={item.id} className="flex gap-3 rounded-2xl bg-white p-3 shadow-card md:p-0 md:overflow-hidden">
                  {item.foto_url && (
                    <div className="relative h-20 w-20 md:h-full md:w-full md:max-h-44 shrink-0 overflow-hidden rounded-xl md:rounded-none md:rounded-t-2xl">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={item.foto_url} alt={item.nama} className="h-full w-full object-cover" />
                      {qty > 0 && <div className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-sf-red text-[10px] font-bold text-white shadow">{qty}</div>}
                    </div>
                  )}
                  <div className="min-w-0 flex-1 md:p-4">
                    <h3 className="text-sm font-bold text-sf-text line-clamp-1 md:text-base">{item.nama}</h3>
                    {item.deskripsi && <p className="mt-0.5 text-xs text-sf-text-secondary line-clamp-2">{item.deskripsi}</p>}
                    <div className="mt-2 flex items-center justify-between md:mt-3">
                      <p className="text-sm md:text-base font-extrabold text-sf-red">{formatRupiah(item.harga)}</p>
                      {qty === 0 ? (
                        <button onClick={() => addToCart(item)} className="rounded-lg border border-sf-red px-3 py-1.5 text-xs font-bold text-sf-red transition hover:bg-sf-red hover:text-white">Tambah</button>
                      ) : (
                        <div className="flex items-center gap-2 rounded-lg border border-sf-red bg-sf-red/5">
                          <button onClick={() => changeQty(item.id, -1)} className="flex h-8 w-8 items-center justify-center text-sf-red"><Minus className="h-3.5 w-3.5" /></button>
                          <span className="min-w-[20px] text-center text-sm font-bold text-sf-red">{qty}</span>
                          <button onClick={() => changeQty(item.id, 1)} className="flex h-8 w-8 items-center justify-center text-sf-red"><Plus className="h-3.5 w-3.5" /></button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Floating Cart */}
      {itemCount > 0 && !showCheckout && (
        <div className="fixed inset-x-0 bottom-0 z-20 bg-white border-t border-sf-border p-3 shadow-overlay safe-bottom md:bottom-0 md:shadow-bottom">
          <div className="mx-auto max-w-container flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="relative">
                <ShoppingCart className="h-6 w-6 text-sf-red" />
                <span className="absolute -right-2 -top-2 flex h-5 w-5 items-center justify-center rounded-full bg-sf-red text-[10px] font-bold text-white">{itemCount}</span>
              </div>
              <p className="text-sm font-extrabold text-sf-text">{formatRupiah(total)}</p>
            </div>
            <button onClick={handleCheckoutClick} className="rounded-xl bg-sf-red px-5 md:px-6 py-3 text-sm font-bold text-white transition hover:bg-sf-red-dark">
              {user ? "Pesan Sekarang" : "Login untuk Pesan"}
            </button>
          </div>
        </div>
      )}

      {/* Checkout Modal */}
      {showCheckout && (
        <div className="fixed inset-0 z-30 flex items-end bg-black/40 sm:items-center sm:justify-center">
          <div className="max-h-[85vh] w-full overflow-y-auto rounded-t-3xl bg-white sm:max-w-md sm:rounded-3xl">
            <div className="sticky top-0 flex items-center justify-between border-b border-sf-border bg-white px-5 py-4 rounded-t-3xl sm:rounded-t-3xl">
              <h2 className="text-base font-bold text-sf-text">Konfirmasi Pesanan</h2>
              <button onClick={() => setShowCheckout(false)} className="flex h-8 w-8 items-center justify-center rounded-full bg-sf-bg"><X className="h-4 w-4 text-sf-text-secondary" /></button>
            </div>
            <div className="px-5 pb-6 pt-4">
              <div className="mb-1 rounded-xl bg-sf-red/5 px-3 py-2 text-xs font-medium text-sf-red">{user?.user_metadata?.nama || user?.email}</div>
              <div className="mb-4 space-y-1.5 rounded-xl bg-sf-bg p-3 text-xs">
                {lines.map((l) => (
                  <div key={l.item.id} className="flex justify-between"><span className="text-sf-text-secondary">{l.qty}x {l.item.nama}</span><span className="font-medium">{formatRupiah(l.item.harga * l.qty)}</span></div>
                ))}
                <div className="mt-1.5 flex justify-between border-t border-sf-border pt-1.5 text-sm font-bold"><span>Total</span><span>{formatRupiah(total)}</span></div>
              </div>
              <form onSubmit={handleCheckout} className="space-y-3">
                <input required value={nama} onChange={(e) => setNama(e.target.value)} placeholder="Nama lengkap" className="w-full rounded-xl border border-sf-border bg-sf-bg px-3.5 py-2.5 text-sm outline-none focus:border-sf-red" />
                <input required value={noHp} onChange={(e) => setNoHp(e.target.value)} placeholder="No. HP / WhatsApp" className="w-full rounded-xl border border-sf-border bg-sf-bg px-3.5 py-2.5 text-sm outline-none focus:border-sf-red" />
                <div className="flex gap-3">
                  <label className={`flex flex-1 cursor-pointer items-center justify-center gap-1.5 rounded-xl border px-3 py-2.5 text-sm font-medium transition ${metode === "pickup" ? "border-sf-red bg-sf-red/5 text-sf-red" : "border-sf-border bg-sf-bg text-sf-text-secondary"}`}>
                    <input type="radio" checked={metode === "pickup"} onChange={() => setMetode("pickup")} className="sr-only" /> Ambil Sendiri
                  </label>
                  <label className={`flex flex-1 cursor-pointer items-center justify-center gap-1.5 rounded-xl border px-3 py-2.5 text-sm font-medium transition ${metode === "delivery" ? "border-sf-red bg-sf-red/5 text-sf-red" : "border-sf-border bg-sf-bg text-sf-text-secondary"}`}>
                    <input type="radio" checked={metode === "delivery"} onChange={() => setMetode("delivery")} className="sr-only" /> Antar
                  </label>
                </div>
                {metode === "delivery" && <textarea required value={alamat} onChange={(e) => setAlamat(e.target.value)} placeholder="Alamat pengantaran" className="w-full rounded-xl border border-sf-border bg-sf-bg px-3.5 py-2.5 text-sm outline-none focus:border-sf-red" rows={2} />}
                <input value={catatan} onChange={(e) => setCatatan(e.target.value)} placeholder="Catatan (opsional)" className="w-full rounded-xl border border-sf-border bg-sf-bg px-3.5 py-2.5 text-sm outline-none focus:border-sf-red" />
                {error && <p className="rounded-lg bg-sf-red/10 px-3 py-2 text-xs text-sf-red">{error}</p>}
                <button disabled={loading} className="w-full rounded-xl bg-sf-red py-3 text-sm font-bold text-white transition hover:bg-sf-red-dark disabled:opacity-50">
                  {loading ? "Mengirim..." : `Bayar ${formatRupiah(total)}`}
                </button>
              </form>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}

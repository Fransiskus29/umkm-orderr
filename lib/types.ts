export type Umkm = {
  id: string;
  user_id: string;
  nama_usaha: string;
  slug: string;
  deskripsi: string | null;
  no_hp: string | null;
  jam_operasional: string | null;
  created_at: string;
};

export type MenuItem = {
  id: string;
  umkm_id: string;
  nama: string;
  deskripsi: string | null;
  harga: number;
  kategori: string;
  foto_url: string | null;
  tersedia: boolean;
  created_at: string;
};

export const KATEGORI_OPTIONS = ["Makanan Utama", "Camilan", "Minuman", "Lainnya"] as const;

export const shortOrderCode = (id: string) =>
  `#ORD-${id.replace(/-/g, "").slice(0, 6).toUpperCase()}`;

export type OrderStatus = "pending" | "diproses" | "selesai" | "dibatalkan";

export type Order = {
  id: string;
  umkm_id: string;
  nama_pelanggan: string;
  no_hp: string;
  alamat: string | null;
  metode: "pickup" | "delivery";
  catatan: string | null;
  status: OrderStatus;
  total: number;
  created_at: string;
};

export type OrderItem = {
  id: string;
  order_id: string;
  menu_item_id: string | null;
  nama: string;
  harga: number;
  qty: number;
};

export const formatRupiah = (n: number) =>
  new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(n);

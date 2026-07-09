-- ============================================================
-- Skema Database: SaaS Pemesanan Online UMKM Kuliner
-- Jalankan di Supabase SQL Editor
-- ============================================================

create extension if not exists "uuid-ossp";

-- Tabel UMKM (profil toko, terhubung ke auth.users)
create table umkm (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users(id) on delete cascade not null unique,
  nama_usaha text not null,
  slug text unique not null,
  deskripsi text,
  no_hp text,
  jam_operasional text,
  created_at timestamptz default now()
);

-- Tabel Menu
create table menu_items (
  id uuid primary key default uuid_generate_v4(),
  umkm_id uuid references umkm(id) on delete cascade not null,
  nama text not null,
  deskripsi text,
  harga integer not null check (harga >= 0),
  kategori text not null default 'Makanan Utama',
  foto_url text,
  tersedia boolean default true,
  created_at timestamptz default now()
);

-- Tabel Pesanan
create table orders (
  id uuid primary key default uuid_generate_v4(),
  umkm_id uuid references umkm(id) on delete cascade not null,
  nama_pelanggan text not null,
  no_hp text not null,
  alamat text,
  metode text not null default 'pickup' check (metode in ('pickup','delivery')),
  catatan text,
  status text not null default 'pending' check (status in ('pending','diproses','selesai','dibatalkan')),
  total integer not null default 0,
  created_at timestamptz default now()
);

-- Tabel Detail Item Pesanan
create table order_items (
  id uuid primary key default uuid_generate_v4(),
  order_id uuid references orders(id) on delete cascade not null,
  menu_item_id uuid references menu_items(id) on delete set null,
  nama text not null,
  harga integer not null,
  qty integer not null check (qty > 0)
);

-- ============================================================
-- Row Level Security
-- ============================================================
alter table umkm enable row level security;
alter table menu_items enable row level security;
alter table orders enable row level security;
alter table order_items enable row level security;

-- UMKM: publik boleh baca (untuk halaman menu publik), hanya pemilik boleh ubah
create policy "umkm_select_public" on umkm for select using (true);
create policy "umkm_insert_own" on umkm for insert with check (auth.uid() = user_id);
create policy "umkm_update_own" on umkm for update using (auth.uid() = user_id);
create policy "umkm_delete_own" on umkm for delete using (auth.uid() = user_id);

-- Menu: publik boleh baca, hanya pemilik UMKM boleh CRUD
create policy "menu_select_public" on menu_items for select using (true);
create policy "menu_insert_owner" on menu_items for insert with check (
  umkm_id in (select id from umkm where user_id = auth.uid())
);
create policy "menu_update_owner" on menu_items for update using (
  umkm_id in (select id from umkm where user_id = auth.uid())
);
create policy "menu_delete_owner" on menu_items for delete using (
  umkm_id in (select id from umkm where user_id = auth.uid())
);

-- Orders: siapa saja boleh insert pesanan baru (checkout tanpa login) dan
-- melihat pesanannya sendiri via link status (id acak/unik cukup aman untuk skala tugas ini);
-- hanya pemilik UMKM boleh update status pesanan
create policy "orders_insert_public" on orders for insert with check (true);
create policy "orders_select_public" on orders for select using (true);
create policy "orders_update_owner" on orders for update using (
  umkm_id in (select id from umkm where user_id = auth.uid())
);

-- Order items: publik boleh insert (saat checkout) dan baca (status pesanan)
create policy "order_items_insert_public" on order_items for insert with check (true);
create policy "order_items_select_public" on order_items for select using (true);

-- Index untuk performa
create index idx_menu_items_umkm on menu_items(umkm_id);
create index idx_orders_umkm on orders(umkm_id);
create index idx_order_items_order on order_items(order_id);

-- ============================================================
-- Storage: bucket untuk foto produk menu
-- ============================================================
insert into storage.buckets (id, name, public)
values ('menu-photos', 'menu-photos', true)
on conflict (id) do nothing;

create policy "menu_photos_public_read" on storage.objects
  for select using (bucket_id = 'menu-photos');

create policy "menu_photos_auth_insert" on storage.objects
  for insert with check (bucket_id = 'menu-photos' and auth.role() = 'authenticated');

create policy "menu_photos_auth_update" on storage.objects
  for update using (bucket_id = 'menu-photos' and auth.role() = 'authenticated');

create policy "menu_photos_auth_delete" on storage.objects
  for delete using (bucket_id = 'menu-photos' and auth.role() = 'authenticated');

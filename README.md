# PesanUMKM — SaaS Pemesanan Online untuk UMKM Kuliner

Platform SaaS multi-tenant: setiap UMKM kuliner bisa daftar, punya halaman
menu online sendiri, dan menerima pesanan tanpa pelanggan perlu bikin akun.

## Fitur

- Landing page berisi daftar semua UMKM terdaftar (marketplace)
- Registrasi & login UMKM (Supabase Auth)
- Dashboard UMKM: kelola menu (tambah/edit/hapus/nonaktifkan), kelola
  pesanan masuk (ubah status: pending → diproses → selesai / dibatalkan)
- Halaman menu publik per UMKM (`/toko/[slug]`): pelanggan pilih menu,
  masukkan keranjang, checkout tanpa login
- Halaman status pesanan (`/pesanan/[id]`) untuk pelanggan memantau pesanan

## Tech Stack

- Next.js 14 (App Router) + TypeScript
- Tailwind CSS
- Supabase (Postgres + Auth) — lewat `@supabase/supabase-js` & `@supabase/ssr`
- Deploy: Vercel

## Setup Lokal

1. Install dependency:
   ```
   npm install
   ```
2. Buat project baru di [supabase.com](https://supabase.com) (gratis).
3. Buka **SQL Editor** di Supabase, jalankan isi file `supabase/schema.sql`.
   (Ini juga otomatis membuat storage bucket `menu-photos` untuk foto produk.)
4. Di Supabase, buka **Project Settings → API**, salin `Project URL` dan
   `anon public key`.
5. Salin `.env.example` menjadi `.env.local`, isi dengan URL & key tadi:
   ```
   NEXT_PUBLIC_SUPABASE_URL=https://xxxxxxxx.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJxxxxxxxxxxxxxxxxxxxxx
   ```
6. (Opsional tapi disarankan) Di Supabase → **Authentication → Providers →
   Email**, matikan "Confirm email" agar akun UMKM langsung aktif setelah
   daftar (memudahkan demo/penilaian).
7. Jalankan:
   ```
   npm run dev
   ```
   Buka `http://localhost:3000`.

## Deploy ke Vercel

1. Push project ini ke GitHub.
2. Buka [vercel.com](https://vercel.com) → New Project → import repo GitHub.
3. Saat konfigurasi, tambahkan Environment Variables:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
4. Deploy. Setelah selesai, website bisa diakses via `https://nama-project.vercel.app`.

## Alur Pemakaian (untuk demo/video)

1. **Daftar UMKM** di `/register` → otomatis masuk ke dashboard.
2. Di **Kelola Menu**, tambahkan beberapa menu makanan.
3. Buka **Toko Saya** di dashboard, salin link toko publik.
4. Buka link toko publik (bisa di tab/incognito lain) → pilih menu →
   checkout sebagai pelanggan → dapat halaman status pesanan.
5. Kembali ke dashboard → **Pesanan Masuk** → ubah status pesanan
   (Diproses → Selesai) dan lihat status ikut berubah di halaman
   pelanggan tadi (refresh).

## Struktur Database

- `umkm` — profil toko UMKM (terhubung ke `auth.users`)
- `menu_items` — daftar menu tiap UMKM
- `orders` — pesanan pelanggan
- `order_items` — rincian item per pesanan

Lihat `supabase/schema.sql` untuk detail kolom & Row Level Security.

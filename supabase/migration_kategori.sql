-- ============================================================
-- Migrasi: tambah kolom kategori ke menu_items
-- Jalankan ini di SQL Editor Supabase HANYA JIKA kamu sudah
-- pernah menjalankan schema.sql sebelumnya (project lama).
-- Kalau baru mulai dari nol, cukup jalankan schema.sql saja
-- (kolom ini sudah termasuk di dalamnya).
-- ============================================================

alter table menu_items
  add column if not exists kategori text not null default 'Makanan Utama';

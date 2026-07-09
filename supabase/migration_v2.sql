-- ============================================================
-- Migrasi tambahan: foto produk, jam operasional
-- Jalankan ini di SQL Editor Supabase (project yang sudah ada
-- data-nya). Kalau baru mulai dari nol, cukup jalankan
-- schema.sql saja (kolom & bucket ini sudah termasuk).
-- ============================================================

alter table menu_items
  add column if not exists foto_url text;

alter table umkm
  add column if not exists jam_operasional text;

-- Storage bucket untuk foto produk menu
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

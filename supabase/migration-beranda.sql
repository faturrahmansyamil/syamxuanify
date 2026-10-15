-- Beranda: produk unggulan dan hitungan klik WhatsApp.
-- Jalankan file ini sekali di Supabase SQL Editor.
-- "Success. No rows returned" artinya berhasil.
--
-- Yang ditambah (bukan tabel baru):
-- - products.is_unggulan : produk yang dipilih admin untuk kartu di hero
-- - products.klik_wa     : jumlah klik tombol Chat WhatsApp
--
-- Pengumuman TIDAK ditambah kolom baru.
-- Pakai site_settings.pengumuman_teks dan pengumuman_aktif yang sudah ada
-- (halaman Admin → Pengumuman).
--
-- RLS:
-- Policy SELECT products yang sudah ada tetap dipakai. Pengunjung hanya
-- membaca produk berstatus approved dari toko approved, termasuk dua kolom baru.
-- Policy UPDATE yang sudah ada tetap: pemilik boleh mengubah produknya, admin boleh semua.
-- Trigger di bawah mengembalikan is_unggulan dan klik_wa ke nilai lama jika
-- yang mengubah bukan admin. Penjual tidak bisa menandai unggulan atau mengutak-atik klik.
-- Tambah klik hanya lewat fungsi tambah_klik_wa. Fungsi itu security definer,
-- hanya menambah 1 pada produk approved milik toko approved, dan boleh dipanggil
-- pengunjung (anon) maupun pengguna yang masuk.

alter table public.products
  add column if not exists is_unggulan boolean not null default false;

alter table public.products
  add column if not exists klik_wa integer not null default 0;

alter table public.products drop constraint if exists products_klik_wa_batas;
alter table public.products
  add constraint products_klik_wa_batas
  check (klik_wa >= 0 and klik_wa <= 10000000);

create index if not exists products_klik_wa_idx
  on public.products (klik_wa desc, created_at desc);

create or replace function public.tambah_klik_wa(produk_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $fn$
begin
  if produk_id is null then
    return;
  end if;

  perform set_config('syam.klik_wa', '1', true);

  update public.products as p
  set klik_wa = p.klik_wa + 1
  from public.shops as s
  where p.id = produk_id
    and s.id = p.shop_id
    and p.status = 'approved'
    and s.status = 'approved'
    and p.klik_wa < 10000000;
end;
$fn$;

revoke all on function public.tambah_klik_wa(uuid) from public;
grant execute on function public.tambah_klik_wa(uuid) to anon, authenticated;

create or replace function public.jaga_unggulan_klik()
returns trigger
language plpgsql
set search_path = public
as $fn$
begin
  if auth.uid() is null or public.is_admin() then
    return new;
  end if;

  if current_setting('syam.klik_wa', true) = '1'
     and new.klik_wa = old.klik_wa + 1
     and new.is_unggulan is not distinct from old.is_unggulan then
    return new;
  end if;

  new.is_unggulan := old.is_unggulan;
  new.klik_wa := old.klik_wa;
  return new;
end;
$fn$;

drop trigger if exists jaga_unggulan_klik on public.products;
create trigger jaga_unggulan_klik
  before update on public.products
  for each row
  execute function public.jaga_unggulan_klik();

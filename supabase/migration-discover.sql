-- Discover: klik WhatsApp per hari, untuk "Terlaris hari ini" dan panah peringkat.
-- Jalankan SETELAH supabase/migration-beranda.sql di SQL Editor Supabase.
-- "Success. No rows returned" artinya berhasil.
--
-- Yang ditambah:
-- - tabel public.klik_harian (product_id, tanggal, jumlah)
--   satu baris = jumlah klik Chat WhatsApp sebuah produk pada tanggal itu (WIB)
-- - fungsi tambah_klik_wa tetap menambah products.klik_wa (total),
--   dan sekarang juga menambah klik_harian untuk hari ini
--
-- RLS:
-- - Pengunjung (anon dan pengguna yang masuk) hanya boleh MEMBACA baris
--   milik produk approved dari toko approved.
-- - Tidak ada policy INSERT/UPDATE/DELETE untuk pengunjung.
--   Tulisan hanya lewat tambah_klik_wa (security definer).
-- - Penjual tidak bisa mengisi atau mengubah angka harian.
-- - products.klik_wa dan is_unggulan tetap dijaga trigger dari migration-beranda.sql.

create table if not exists public.klik_harian (
  product_id uuid not null references public.products (id) on delete cascade,
  tanggal date not null,
  jumlah integer not null default 0,
  primary key (product_id, tanggal),
  constraint klik_harian_jumlah_batas check (jumlah >= 0 and jumlah <= 10000000)
);

create index if not exists klik_harian_tanggal_idx
  on public.klik_harian (tanggal, jumlah desc);

alter table public.klik_harian enable row level security;

drop policy if exists klik_harian_baca on public.klik_harian;
create policy klik_harian_baca
  on public.klik_harian
  for select
  to anon, authenticated
  using (
    exists (
      select 1
      from public.products as p
      join public.shops as s on s.id = p.shop_id
      where p.id = klik_harian.product_id
        and p.status = 'approved'
        and s.status = 'approved'
    )
  );

revoke all on table public.klik_harian from anon, authenticated;
grant select on table public.klik_harian to anon, authenticated;

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

  insert into public.klik_harian (product_id, tanggal, jumlah)
  select p.id, (timezone('Asia/Jakarta', now()))::date, 1
  from public.products as p
  join public.shops as s on s.id = p.shop_id
  where p.id = produk_id
    and p.status = 'approved'
    and s.status = 'approved'
  on conflict (product_id, tanggal)
  do update
    set jumlah = public.klik_harian.jumlah + 1
    where public.klik_harian.jumlah < 10000000;
end;
$fn$;

revoke all on function public.tambah_klik_wa(uuid) from public;
grant execute on function public.tambah_klik_wa(uuid) to anon, authenticated;

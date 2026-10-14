-- Tahap 4.5
-- Jalankan file ini sekali di Supabase SQL Editor.
-- "Success. No rows returned" artinya berhasil.
--
-- Yang ditambah:
-- - shops.rejection_reason dan products.rejection_reason
-- - products.is_available (true = tersedia, false = habis)
--
-- RLS tidak dilonggarkan. Penjual tetap hanya boleh mengubah toko dan produk miliknya.
-- Trigger di bawah yang menjaga status: penjual tidak bisa menyetujui sendiri,
-- tidak bisa mengubah label terverifikasi, dan tidak bisa mengisi alasan penolakan.
-- Penjual boleh mengajukan ulang barang yang ditolak (status rejected kembali ke pending).

alter table public.shops
  add column if not exists rejection_reason text;

alter table public.products
  add column if not exists rejection_reason text;

alter table public.products
  add column if not exists is_available boolean not null default true;

alter table public.shops drop constraint if exists shops_alasan_tolak;
alter table public.shops
  add constraint shops_alasan_tolak
  check (rejection_reason is null or char_length(rejection_reason) between 3 and 500);

alter table public.products drop constraint if exists products_alasan_tolak;
alter table public.products
  add constraint products_alasan_tolak
  check (rejection_reason is null or char_length(rejection_reason) between 3 and 500);

create or replace function public.jaga_status_toko()
returns trigger
language plpgsql
security definer
set search_path = public
as $fn$
begin
  if auth.uid() is null or public.is_admin() then
    return new;
  end if;

  if tg_op = 'INSERT' then
    new.status := 'pending';
    new.terverifikasi := false;
    new.rejection_reason := null;

    update public.profiles
    set role = 'seller'
    where id = new.owner_id
      and role = 'buyer';

    return new;
  end if;

  new.terverifikasi := old.terverifikasi;
  new.owner_id := old.owner_id;

  if old.status = 'rejected' and new.status = 'pending' then
    new.rejection_reason := null;
  else
    new.status := old.status;
    new.rejection_reason := old.rejection_reason;
  end if;

  return new;
end;
$fn$;

create or replace function public.jaga_status_produk()
returns trigger
language plpgsql
security definer
set search_path = public
as $fn$
begin
  if auth.uid() is null or public.is_admin() then
    return new;
  end if;

  if tg_op = 'INSERT' then
    new.status := 'pending';
    new.rejection_reason := null;
    return new;
  end if;

  new.shop_id := old.shop_id;

  if old.status = 'rejected' and new.status = 'pending' then
    new.rejection_reason := null;
  else
    new.status := old.status;
    new.rejection_reason := old.rejection_reason;
  end if;

  return new;
end;
$fn$;

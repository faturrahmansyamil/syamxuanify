-- Tahap 4.9: stok, foto banyak, dan varian produk.
-- Jalankan sekali di Supabase SQL Editor. Aman dijalankan ulang.

alter table public.products
  add column if not exists stock integer,
  add column if not exists sold_count integer not null default 0,
  add column if not exists condition text not null default 'baru',
  add column if not exists preorder_days integer,
  add column if not exists weight_or_size text;

alter table public.products drop constraint if exists products_stock_check;
alter table public.products
  add constraint products_stock_check
  check (stock is null or (stock >= 0 and stock <= 100000));

alter table public.products drop constraint if exists products_sold_count_check;
alter table public.products
  add constraint products_sold_count_check
  check (sold_count >= 0 and sold_count <= 1000000);

alter table public.products drop constraint if exists products_condition_check;
alter table public.products
  add constraint products_condition_check
  check (condition in ('baru', 'bekas'));

alter table public.products drop constraint if exists products_preorder_days_check;
alter table public.products
  add constraint products_preorder_days_check
  check (preorder_days is null or (preorder_days >= 1 and preorder_days <= 60));

alter table public.products drop constraint if exists products_weight_or_size_check;
alter table public.products
  add constraint products_weight_or_size_check
  check (weight_or_size is null or char_length(weight_or_size) <= 40);

create table if not exists public.product_images (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products (id) on delete cascade,
  url text not null,
  urutan smallint not null default 0,
  constraint product_images_urutan_check check (urutan >= 0 and urutan <= 4),
  constraint product_images_unik unique (product_id, urutan)
);

create index if not exists product_images_produk_idx on public.product_images (product_id, urutan);

create table if not exists public.product_variants (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products (id) on delete cascade,
  nama text not null,
  harga integer,
  stock integer,
  urutan smallint not null default 0,
  constraint product_variants_nama_check check (char_length(nama) between 1 and 40),
  constraint product_variants_harga_check check (harga is null or (harga >= 0 and harga <= 100000000)),
  constraint product_variants_stock_check check (stock is null or (stock >= 0 and stock <= 100000)),
  constraint product_variants_urutan_check check (urutan >= 0 and urutan <= 9),
  constraint product_variants_unik unique (product_id, urutan)
);

create index if not exists product_variants_produk_idx on public.product_variants (product_id, urutan);

create or replace function public.batas_foto_produk()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  if (
    select count(*)
    from public.product_images
    where product_id = new.product_id
  ) >= 5 then
    raise exception 'Maksimal 5 foto';
  end if;
  return new;
end;
$$;

drop trigger if exists batas_foto_produk on public.product_images;
create trigger batas_foto_produk
  before insert on public.product_images
  for each row
  execute function public.batas_foto_produk();

create or replace function public.pemilik_produk(produk uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select public.is_admin()
    or exists (
      select 1
      from public.products as p
      join public.shops as s on s.id = p.shop_id
      where p.id = produk
        and s.owner_id = auth.uid()
    );
$$;

revoke all on function public.pemilik_produk(uuid) from public;
grant execute on function public.pemilik_produk(uuid) to authenticated;

alter table public.product_images enable row level security;
alter table public.product_variants enable row level security;

drop policy if exists "Foto produk terlihat" on public.product_images;
create policy "Foto produk terlihat"
  on public.product_images for select
  using (
    exists (
      select 1
      from public.products as p
      join public.shops as s on s.id = p.shop_id
      where p.id = product_images.product_id
        and (
          (p.status = 'approved' and s.status = 'approved')
          or s.owner_id = auth.uid()
          or public.is_admin()
        )
    )
  );

drop policy if exists "Penjual menambah foto produk" on public.product_images;
create policy "Penjual menambah foto produk"
  on public.product_images for insert
  to authenticated
  with check (public.pemilik_produk(product_id));

drop policy if exists "Penjual mengubah foto produk" on public.product_images;
create policy "Penjual mengubah foto produk"
  on public.product_images for update
  to authenticated
  using (public.pemilik_produk(product_id))
  with check (public.pemilik_produk(product_id));

drop policy if exists "Penjual menghapus foto produk" on public.product_images;
create policy "Penjual menghapus foto produk"
  on public.product_images for delete
  to authenticated
  using (public.pemilik_produk(product_id));

drop policy if exists "Varian produk terlihat" on public.product_variants;
create policy "Varian produk terlihat"
  on public.product_variants for select
  using (
    exists (
      select 1
      from public.products as p
      join public.shops as s on s.id = p.shop_id
      where p.id = product_variants.product_id
        and (
          (p.status = 'approved' and s.status = 'approved')
          or s.owner_id = auth.uid()
          or public.is_admin()
        )
    )
  );

drop policy if exists "Penjual menambah varian" on public.product_variants;
create policy "Penjual menambah varian"
  on public.product_variants for insert
  to authenticated
  with check (public.pemilik_produk(product_id));

drop policy if exists "Penjual mengubah varian" on public.product_variants;
create policy "Penjual mengubah varian"
  on public.product_variants for update
  to authenticated
  using (public.pemilik_produk(product_id))
  with check (public.pemilik_produk(product_id));

drop policy if exists "Penjual menghapus varian" on public.product_variants;
create policy "Penjual menghapus varian"
  on public.product_variants for delete
  to authenticated
  using (public.pemilik_produk(product_id));

grant select on public.product_images to anon, authenticated;
grant insert, update, delete on public.product_images to authenticated;
grant select on public.product_variants to anon, authenticated;
grant insert, update, delete on public.product_variants to authenticated;

insert into public.product_images (product_id, url, urutan)
select p.id, p.gambar_url, 0
from public.products as p
where p.gambar_url is not null
  and not exists (
    select 1
    from public.product_images as f
    where f.product_id = p.id
  );

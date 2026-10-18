-- Syamxuanify — skema database
-- Jalankan SELURUH file ini sekali di Supabase → SQL Editor → Run.
-- Aman dijalankan ulang: tabel yang sudah ada tidak dihapus, data contoh tidak diduplikasi.
--
-- Jangan tempel kunci service_role ke website. Website hanya memakai anon key.
-- Admin dibuat SETELAH kamu daftar, dengan perintah di bagian paling bawah (masih berupa komentar).

-- ------------------------------------------------------------
-- 0. Ekstensi
-- ------------------------------------------------------------

create extension if not exists pgcrypto with schema extensions;

-- ------------------------------------------------------------
-- 1. Tipe
-- ------------------------------------------------------------

do $enum$
begin
  create type public.user_role as enum ('admin', 'seller', 'buyer');
exception
  when duplicate_object then null;
end
$enum$;

do $enum$
begin
  create type public.moderation_status as enum ('pending', 'approved', 'rejected');
exception
  when duplicate_object then null;
end
$enum$;

-- ------------------------------------------------------------
-- 2. Tabel
-- ------------------------------------------------------------

create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  nama text not null default '',
  no_wa text,
  role public.user_role not null default 'buyer',
  constraint profiles_nama_panjang check (char_length(nama) <= 80),
  constraint profiles_wa_panjang check (no_wa is null or char_length(no_wa) between 10 and 15)
);

create table if not exists public.shops (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references public.profiles (id) on delete cascade,
  nama_toko text not null,
  slug text not null unique,
  deskripsi text,
  no_wa text not null,
  qris_url text,
  logo_url text,
  status public.moderation_status not null default 'pending',
  terverifikasi boolean not null default false,
  rejection_reason text,
  created_at timestamptz not null default now(),
  constraint shops_slug_format check (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'),
  constraint shops_wa_panjang check (char_length(no_wa) between 10 and 15),
  constraint shops_alasan_tolak check (rejection_reason is null or char_length(rejection_reason) between 3 and 500)
);

create table if not exists public.categories (
  id uuid primary key default gen_random_uuid(),
  nama text not null unique,
  slug text not null unique,
  constraint categories_slug_format check (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$')
);

create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  shop_id uuid not null references public.shops (id) on delete cascade,
  category_id uuid not null references public.categories (id),
  judul text not null,
  slug text not null,
  deskripsi text,
  harga integer not null,
  gambar_url text,
  status public.moderation_status not null default 'pending',
  is_available boolean not null default true,
  rejection_reason text,
  created_at timestamptz not null default now(),
  constraint products_slug_unik unique (shop_id, slug),
  constraint products_slug_format check (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'),
  constraint products_harga_nonnegatif check (harga >= 0),
  constraint products_alasan_tolak check (rejection_reason is null or char_length(rejection_reason) between 3 and 500)
);

-- Database yang sudah ada: jalankan juga supabase/migration-4-5.sql.
alter table public.shops add column if not exists rejection_reason text;
alter table public.products add column if not exists rejection_reason text;
alter table public.products add column if not exists is_available boolean not null default true;
alter table public.shops drop constraint if exists shops_alasan_tolak;
alter table public.shops
  add constraint shops_alasan_tolak
  check (rejection_reason is null or char_length(rejection_reason) between 3 and 500);
alter table public.products drop constraint if exists products_alasan_tolak;
alter table public.products
  add constraint products_alasan_tolak
  check (rejection_reason is null or char_length(rejection_reason) between 3 and 500);

create table if not exists public.reports (
  id uuid primary key default gen_random_uuid(),
  product_id uuid references public.products (id) on delete cascade,
  shop_id uuid references public.shops (id) on delete cascade,
  pelapor_id uuid not null references public.profiles (id) on delete cascade,
  alasan text not null,
  created_at timestamptz not null default now(),
  constraint reports_punya_sasaran check (product_id is not null or shop_id is not null),
  constraint reports_alasan_isi check (char_length(trim(alasan)) > 0)
);

create index if not exists shops_owner_id_idx on public.shops (owner_id);
create index if not exists shops_status_idx on public.shops (status);
create index if not exists products_shop_id_idx on public.products (shop_id);
create index if not exists products_category_id_idx on public.products (category_id);
create index if not exists products_status_idx on public.products (status);
create index if not exists reports_product_id_idx on public.reports (product_id);
create index if not exists reports_shop_id_idx on public.reports (shop_id);

-- ------------------------------------------------------------
-- 3. Fungsi pembantu
-- ------------------------------------------------------------

-- security definer: membaca profiles tanpa terkena RLS, supaya kebijakan tidak memanggil dirinya sendiri.
create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $fn$
  select exists (
    select 1
    from public.profiles
    where id = auth.uid()
      and role = 'admin'
  );
$fn$;

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $fn$
begin
  insert into public.profiles (id, nama, no_wa)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'nama', ''),
    nullif(new.raw_user_meta_data ->> 'no_wa', '')
  )
  on conflict (id) do nothing;

  return new;
end;
$fn$;

-- Pengguna biasa tidak bisa mengangkat dirinya menjadi admin lewat API.
create or replace function public.cegah_ubah_role()
returns trigger
language plpgsql
security definer
set search_path = public
as $fn$
begin
  if new.role is not distinct from old.role then
    return new;
  end if;

  if auth.uid() is null or public.is_admin() then
    return new;
  end if;

  if old.role = 'buyer' and new.role = 'seller' then
    return new;
  end if;

  raise exception 'Hanya admin yang boleh mengubah role ini';
end;
$fn$;

-- Penjual tidak bisa menyetujui tokonya sendiri. SQL Editor (tanpa auth.uid) dan admin boleh.
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

-- ------------------------------------------------------------
-- 4. Trigger
-- ------------------------------------------------------------

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

drop trigger if exists cegah_ubah_role on public.profiles;
create trigger cegah_ubah_role
  before update on public.profiles
  for each row execute function public.cegah_ubah_role();

drop trigger if exists jaga_status_toko on public.shops;
create trigger jaga_status_toko
  before insert or update on public.shops
  for each row execute function public.jaga_status_toko();

drop trigger if exists jaga_status_produk on public.products;
create trigger jaga_status_produk
  before insert or update on public.products
  for each row execute function public.jaga_status_produk();

-- ------------------------------------------------------------
-- 5. Row Level Security
-- ------------------------------------------------------------

alter table public.profiles enable row level security;
alter table public.shops enable row level security;
alter table public.categories enable row level security;
alter table public.products enable row level security;
alter table public.reports enable row level security;

drop policy if exists "Pemilik dan admin melihat profil" on public.profiles;
create policy "Pemilik dan admin melihat profil"
  on public.profiles for select
  using (id = auth.uid() or public.is_admin());

drop policy if exists "Pengguna membuat profil sendiri" on public.profiles;
create policy "Pengguna membuat profil sendiri"
  on public.profiles for insert
  with check (id = auth.uid() and role = 'buyer');

drop policy if exists "Pemilik dan admin mengubah profil" on public.profiles;
create policy "Pemilik dan admin mengubah profil"
  on public.profiles for update
  using (id = auth.uid() or public.is_admin())
  with check (id = auth.uid() or public.is_admin());

drop policy if exists "Toko disetujui terlihat semua orang" on public.shops;
create policy "Toko disetujui terlihat semua orang"
  on public.shops for select
  using (status = 'approved' or owner_id = auth.uid() or public.is_admin());

drop policy if exists "Pengguna membuat toko sendiri" on public.shops;
create policy "Pengguna membuat toko sendiri"
  on public.shops for insert
  to authenticated
  with check (owner_id = auth.uid() or public.is_admin());

drop policy if exists "Pemilik dan admin mengubah toko" on public.shops;
create policy "Pemilik dan admin mengubah toko"
  on public.shops for update
  using (owner_id = auth.uid() or public.is_admin())
  with check (owner_id = auth.uid() or public.is_admin());

drop policy if exists "Pemilik dan admin menghapus toko" on public.shops;
create policy "Pemilik dan admin menghapus toko"
  on public.shops for delete
  using (owner_id = auth.uid() or public.is_admin());

drop policy if exists "Semua orang melihat kategori" on public.categories;
create policy "Semua orang melihat kategori"
  on public.categories for select
  using (true);

drop policy if exists "Admin mengelola kategori" on public.categories;
create policy "Admin mengelola kategori"
  on public.categories for all
  using (public.is_admin())
  with check (public.is_admin());

drop policy if exists "Produk disetujui terlihat semua orang" on public.products;
create policy "Produk disetujui terlihat semua orang"
  on public.products for select
  using (
    public.is_admin()
    or exists (
      select 1
      from public.shops as toko
      where toko.id = products.shop_id
        and toko.owner_id = auth.uid()
    )
    or (
      status = 'approved'
      and exists (
        select 1
        from public.shops as toko
        where toko.id = products.shop_id
          and toko.status = 'approved'
      )
    )
  );

drop policy if exists "Pemilik dan admin menambah produk" on public.products;
create policy "Pemilik dan admin menambah produk"
  on public.products for insert
  to authenticated
  with check (
    public.is_admin()
    or exists (
      select 1
      from public.shops as toko
      where toko.id = shop_id
        and toko.owner_id = auth.uid()
    )
  );

drop policy if exists "Pemilik dan admin mengubah produk" on public.products;
create policy "Pemilik dan admin mengubah produk"
  on public.products for update
  using (
    public.is_admin()
    or exists (
      select 1
      from public.shops as toko
      where toko.id = shop_id
        and toko.owner_id = auth.uid()
    )
  )
  with check (
    public.is_admin()
    or exists (
      select 1
      from public.shops as toko
      where toko.id = shop_id
        and toko.owner_id = auth.uid()
    )
  );

drop policy if exists "Pemilik dan admin menghapus produk" on public.products;
create policy "Pemilik dan admin menghapus produk"
  on public.products for delete
  using (
    public.is_admin()
    or exists (
      select 1
      from public.shops as toko
      where toko.id = shop_id
        and toko.owner_id = auth.uid()
    )
  );

drop policy if exists "Pelapor membuat laporan" on public.reports;
create policy "Pelapor membuat laporan"
  on public.reports for insert
  to authenticated
  with check (pelapor_id = auth.uid());

drop policy if exists "Pelapor dan admin melihat laporan" on public.reports;
create policy "Pelapor dan admin melihat laporan"
  on public.reports for select
  using (pelapor_id = auth.uid() or public.is_admin());

drop policy if exists "Admin menghapus laporan" on public.reports;
create policy "Admin menghapus laporan"
  on public.reports for delete
  using (public.is_admin());

grant select, insert, update on public.profiles to authenticated;
grant select on public.shops to anon, authenticated;
grant insert, update, delete on public.shops to authenticated;
grant select on public.categories to anon, authenticated;
grant insert, update, delete on public.categories to authenticated;
grant select on public.products to anon, authenticated;
grant insert, update, delete on public.products to authenticated;
grant select, insert, delete on public.reports to authenticated;
grant execute on function public.is_admin() to anon, authenticated;

-- ------------------------------------------------------------
-- 6. Storage publik: logos, produk, qris
--    Unggah nanti ke folder bernama id pengguna, contoh:
--    logos/<user-id>/logo.png
-- ------------------------------------------------------------

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values
  ('logos', 'logos', true, 2097152, array['image/jpeg', 'image/png', 'image/webp']),
  ('produk', 'produk', true, 2097152, array['image/jpeg', 'image/png', 'image/webp']),
  ('qris', 'qris', true, 2097152, array['image/jpeg', 'image/png', 'image/webp'])
on conflict (id) do update
set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "Gambar etalase bisa dilihat semua orang" on storage.objects;
create policy "Gambar etalase bisa dilihat semua orang"
  on storage.objects for select
  using (bucket_id in ('logos', 'produk', 'qris'));

drop policy if exists "Pengguna mengunggah file sendiri" on storage.objects;
create policy "Pengguna mengunggah file sendiri"
  on storage.objects for insert
  to authenticated
  with check (
    bucket_id in ('logos', 'produk', 'qris')
    and (
      public.is_admin()
      or (storage.foldername(name))[1] = auth.uid()::text
    )
  );

drop policy if exists "Pengguna mengubah file sendiri" on storage.objects;
create policy "Pengguna mengubah file sendiri"
  on storage.objects for update
  to authenticated
  using (
    bucket_id in ('logos', 'produk', 'qris')
    and (
      public.is_admin()
      or (storage.foldername(name))[1] = auth.uid()::text
    )
  )
  with check (
    bucket_id in ('logos', 'produk', 'qris')
    and (
      public.is_admin()
      or (storage.foldername(name))[1] = auth.uid()::text
    )
  );

drop policy if exists "Pengguna menghapus file sendiri" on storage.objects;
create policy "Pengguna menghapus file sendiri"
  on storage.objects for delete
  to authenticated
  using (
    bucket_id in ('logos', 'produk', 'qris')
    and (
      public.is_admin()
      or (storage.foldername(name))[1] = auth.uid()::text
    )
  );

-- ------------------------------------------------------------
-- 7. Kategori
--    Data contoh (toko/produk/akun demo) sudah dipindah ke
--    supabase/seed-demo.sql dan TIDAK ikut dijalankan di sini.
-- ------------------------------------------------------------

insert into public.categories (nama, slug)
values
  ('Makanan & Jajanan', 'makanan-jajanan'),
  ('Produk Digital', 'produk-digital'),
  ('Jasa', 'jasa'),
  ('Fashion', 'fashion'),
  ('Lainnya', 'lainnya')
on conflict (slug) do nothing;


-- ------------------------------------------------------------
-- 8. Menjadikan akunmu admin
--    Daftar dulu lewat http://localhost:3000/daftar
--    lalu jalankan perintah di bawah SETELAH mengganti emailnya.
--    Jangan hapus tanda komentar pada baris lain.
--
-- update public.profiles
-- set role = 'admin'
-- where id = (
--   select id from auth.users where email = 'email-kamu@gmail.com'
-- );
--
-- Cek hasilnya:
-- select u.email, p.nama, p.role
-- from public.profiles as p
-- join auth.users as u on u.id = p.id
-- where u.email = 'email-kamu@gmail.com';
-- ------------------------------------------------------------

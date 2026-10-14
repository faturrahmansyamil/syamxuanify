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
-- 7. Data contoh: 3 toko, 2–3 produk per toko
--    Akun contoh (bukan akunmu):
--    siti@contoh.syamxuanify.biz.id
--    raka@contoh.syamxuanify.biz.id
--    mila@contoh.syamxuanify.biz.id
--    Kata sandi ketiganya: DemoToko123
-- ------------------------------------------------------------

do $seed$
declare
  siti uuid := 'a1111111-1111-4111-8111-111111111111';
  raka uuid := 'a2222222-2222-4222-8222-222222222222';
  mila uuid := 'a3333333-3333-4333-8333-333333333333';
begin
  if not exists (select 1 from auth.users where id = siti) then
    insert into auth.users (
      instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
      raw_app_meta_data, raw_user_meta_data, created_at, updated_at,
      confirmation_token, recovery_token, email_change_token_new, email_change
    ) values (
      '00000000-0000-0000-0000-000000000000',
      siti,
      'authenticated',
      'authenticated',
      'siti@contoh.syamxuanify.biz.id',
      extensions.crypt('DemoToko123', extensions.gen_salt('bf')),
      now(),
      '{"provider":"email","providers":["email"]}'::jsonb,
      jsonb_build_object('nama', 'Siti Aminah', 'no_wa', '628123450001'),
      now(), now(),
      encode(extensions.gen_random_bytes(16), 'hex'),
      encode(extensions.gen_random_bytes(16), 'hex'),
      encode(extensions.gen_random_bytes(16), 'hex'),
      ''
    );

    insert into auth.identities (
      id, user_id, identity_data, provider, provider_id, last_sign_in_at, created_at, updated_at
    ) values (
      gen_random_uuid(),
      siti,
      jsonb_build_object('sub', siti::text, 'email', 'siti@contoh.syamxuanify.biz.id', 'email_verified', true),
      'email',
      siti::text,
      now(), now(), now()
    );
  end if;

  if not exists (select 1 from auth.users where id = raka) then
    insert into auth.users (
      instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
      raw_app_meta_data, raw_user_meta_data, created_at, updated_at,
      confirmation_token, recovery_token, email_change_token_new, email_change
    ) values (
      '00000000-0000-0000-0000-000000000000',
      raka,
      'authenticated',
      'authenticated',
      'raka@contoh.syamxuanify.biz.id',
      extensions.crypt('DemoToko123', extensions.gen_salt('bf')),
      now(),
      '{"provider":"email","providers":["email"]}'::jsonb,
      jsonb_build_object('nama', 'Raka Pratama', 'no_wa', '628123450002'),
      now(), now(),
      encode(extensions.gen_random_bytes(16), 'hex'),
      encode(extensions.gen_random_bytes(16), 'hex'),
      encode(extensions.gen_random_bytes(16), 'hex'),
      ''
    );

    insert into auth.identities (
      id, user_id, identity_data, provider, provider_id, last_sign_in_at, created_at, updated_at
    ) values (
      gen_random_uuid(),
      raka,
      jsonb_build_object('sub', raka::text, 'email', 'raka@contoh.syamxuanify.biz.id', 'email_verified', true),
      'email',
      raka::text,
      now(), now(), now()
    );
  end if;

  if not exists (select 1 from auth.users where id = mila) then
    insert into auth.users (
      instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
      raw_app_meta_data, raw_user_meta_data, created_at, updated_at,
      confirmation_token, recovery_token, email_change_token_new, email_change
    ) values (
      '00000000-0000-0000-0000-000000000000',
      mila,
      'authenticated',
      'authenticated',
      'mila@contoh.syamxuanify.biz.id',
      extensions.crypt('DemoToko123', extensions.gen_salt('bf')),
      now(),
      '{"provider":"email","providers":["email"]}'::jsonb,
      jsonb_build_object('nama', 'Mila Sari', 'no_wa', '628123450003'),
      now(), now(),
      encode(extensions.gen_random_bytes(16), 'hex'),
      encode(extensions.gen_random_bytes(16), 'hex'),
      encode(extensions.gen_random_bytes(16), 'hex'),
      ''
    );

    insert into auth.identities (
      id, user_id, identity_data, provider, provider_id, last_sign_in_at, created_at, updated_at
    ) values (
      gen_random_uuid(),
      mila,
      jsonb_build_object('sub', mila::text, 'email', 'mila@contoh.syamxuanify.biz.id', 'email_verified', true),
      'email',
      mila::text,
      now(), now(), now()
    );
  end if;

  insert into public.profiles (id, nama, no_wa, role)
  values
    (siti, 'Siti Aminah', '628123450001', 'seller'),
    (raka, 'Raka Pratama', '628123450002', 'seller'),
    (mila, 'Mila Sari', '628123450003', 'seller')
  on conflict (id) do update
  set
    nama = excluded.nama,
    no_wa = excluded.no_wa,
    role = excluded.role;
end
$seed$;

insert into public.categories (nama, slug)
values
  ('Makanan & Jajanan', 'makanan-jajanan'),
  ('Produk Digital', 'produk-digital'),
  ('Jasa', 'jasa'),
  ('Fashion', 'fashion'),
  ('Lainnya', 'lainnya')
on conflict (slug) do nothing;

insert into public.shops (
  id, owner_id, nama_toko, slug, deskripsi, no_wa, status, terverifikasi, created_at
)
values
  (
    'b1111111-1111-4111-8111-111111111111',
    'a1111111-1111-4111-8111-111111111111',
    'Dapur Bu Siti',
    'dapur-bu-siti',
    'Nasi goreng, risoles, dan minuman dingin buat teman kampus.',
    '628123450001',
    'approved',
    true,
    timestamptz '2026-09-01 08:00:00+07'
  ),
  (
    'b2222222-2222-4222-8222-222222222222',
    'a2222222-2222-4222-8222-222222222222',
    'Kaos Kampus Raka',
    'kaos-kampus-raka',
    'Kaos dan totebag pesanan mahasiswa.',
    '628123450002',
    'approved',
    true,
    timestamptz '2026-09-02 08:00:00+07'
  ),
  (
    'b3333333-3333-4333-8333-333333333333',
    'a3333333-3333-4333-8333-333333333333',
    'Studio Mila',
    'studio-mila',
    'Desain poster organisasi, edit CV, dan cetak stiker.',
    '628123450003',
    'approved',
    true,
    timestamptz '2026-09-03 08:00:00+07'
  )
on conflict (id) do nothing;

insert into public.products (
  id, shop_id, category_id, judul, slug, deskripsi, harga, status, created_at
)
select
  v.id,
  v.shop_id,
  c.id,
  v.judul,
  v.slug,
  v.deskripsi,
  v.harga,
  'approved'::public.moderation_status,
  v.created_at
from (
  values
    (
      'c1111111-1111-4111-8111-111111111111'::uuid,
      'b1111111-1111-4111-8111-111111111111'::uuid,
      'makanan-jajanan'::text,
      'Nasi Goreng Kampus'::text,
      'nasi-goreng-kampus'::text,
      'Nasi goreng porsi mahasiswa. Tingkat pedas bisa diminta.'::text,
      18000,
      timestamptz '2026-09-01 09:00:00+07'
    ),
    (
      'c1111111-1111-4111-8111-111111111112'::uuid,
      'b1111111-1111-4111-8111-111111111111'::uuid,
      'makanan-jajanan',
      'Es Teh Jumbo',
      'es-teh-jumbo',
      'Es teh manis, porsi gelas besar.',
      5000,
      timestamptz '2026-09-01 09:10:00+07'
    ),
    (
      'c1111111-1111-4111-8111-111111111113'::uuid,
      'b1111111-1111-4111-8111-111111111111'::uuid,
      'makanan-jajanan',
      'Risoles Mayo',
      'risoles-mayo',
      'Risoles isi mayo dan sosis, digoreng saat dipesan.',
      8000,
      timestamptz '2026-09-01 09:20:00+07'
    ),
    (
      'c2222222-2222-4222-8222-222222222221'::uuid,
      'b2222222-2222-4222-8222-222222222222'::uuid,
      'fashion',
      'Kaos Syamxuanify',
      'kaos-syamxuanify',
      'Kaos katun ukuran S–XL. Warna bisa ditanyakan lewat WhatsApp.',
      75000,
      timestamptz '2026-09-02 09:00:00+07'
    ),
    (
      'c2222222-2222-4222-8222-222222222222'::uuid,
      'b2222222-2222-4222-8222-222222222222'::uuid,
      'fashion',
      'Totebag Kuliah',
      'totebag-kuliah',
      'Totebag kanvas untuk buku dan laptop.',
      45000,
      timestamptz '2026-09-02 09:10:00+07'
    ),
    (
      'c3333333-3333-4333-8333-333333333331'::uuid,
      'b3333333-3333-4333-8333-333333333333'::uuid,
      'jasa',
      'Desain Poster',
      'desain-poster',
      'Poster kegiatan organisasi, revisi satu kali.',
      35000,
      timestamptz '2026-09-03 09:00:00+07'
    ),
    (
      'c3333333-3333-4333-8333-333333333332'::uuid,
      'b3333333-3333-4333-8333-333333333333'::uuid,
      'jasa',
      'Edit CV',
      'edit-cv',
      'Rapikan CV satu halaman, siap dikirim lamaran.',
      25000,
      timestamptz '2026-09-03 09:10:00+07'
    ),
    (
      'c3333333-3333-4333-8333-333333333333'::uuid,
      'b3333333-3333-4333-8333-333333333333'::uuid,
      'produk-digital',
      'Paket Stiker Digital',
      'paket-stiker-digital',
      'File stiker PNG siap cetak. Dikirim lewat WhatsApp.',
      15000,
      timestamptz '2026-09-03 09:20:00+07'
    )
) as v(id, shop_id, kategori_slug, judul, slug, deskripsi, harga, created_at)
join public.categories as c on c.slug = v.kategori_slug
on conflict (id) do nothing;

update public.products
set gambar_url = case slug
  when 'nasi-goreng-kampus' then 'https://images.unsplash.com/photo-1603133872878-684f208fb84b?auto=format&fit=crop&w=1200&q=80'
  when 'es-teh-jumbo' then 'https://images.unsplash.com/photo-1556679343-c7306c1976bc?auto=format&fit=crop&w=1200&q=80'
  when 'risoles-mayo' then 'https://images.unsplash.com/photo-1747045142479-8c29f86307cd?auto=format&fit=crop&w=1200&q=80'
  when 'kaos-syamxuanify' then 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=1200&q=80'
  when 'totebag-kuliah' then 'https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=1200&q=80'
  when 'desain-poster' then 'https://images.unsplash.com/photo-1561070791-2526d30994b5?auto=format&fit=crop&w=1200&q=80'
  when 'edit-cv' then 'https://images.unsplash.com/photo-1586281380349-632531db7ed4?auto=format&fit=crop&w=1200&q=80'
  when 'paket-stiker-digital' then 'https://images.unsplash.com/photo-1572375992501-4b0892d50c69?auto=format&fit=crop&w=1200&q=80'
end
where slug in (
  'nasi-goreng-kampus',
  'es-teh-jumbo',
  'risoles-mayo',
  'kaos-syamxuanify',
  'totebag-kuliah',
  'desain-poster',
  'edit-cv',
  'paket-stiker-digital'
)
and gambar_url is null;

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

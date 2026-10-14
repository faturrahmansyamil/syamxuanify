-- Syamxuanify — pengaturan admin, penjual, dan pembeli.
-- Jalankan SELURUH file ini sekali di Supabase → SQL Editor → Run.
-- Aman dijalankan ulang.

-- ------------------------------------------------------------
-- 1. Kolom baru
-- ------------------------------------------------------------

alter table public.profiles add column if not exists foto_url text;
alter table public.profiles add column if not exists email text;
alter table public.profiles add column if not exists is_blocked boolean not null default false;

alter table public.shops add column if not exists is_closed boolean not null default false;

alter table public.categories add column if not exists ikon text not null default 'lainnya';
alter table public.categories add column if not exists urutan integer not null default 0;
alter table public.categories add column if not exists aktif boolean not null default true;

alter table public.reports add column if not exists status text not null default 'baru';
alter table public.reports drop constraint if exists reports_status;
alter table public.reports
  add constraint reports_status check (status in ('baru', 'diperiksa', 'selesai'));

update public.categories
set
  ikon = slug,
  urutan = case slug
    when 'makanan-jajanan' then 1
    when 'produk-digital' then 2
    when 'jasa' then 3
    when 'fashion' then 4
    when 'lainnya' then 5
    else urutan
  end
where ikon = 'lainnya' or urutan = 0;

update public.profiles as profil
set email = pengguna.email
from auth.users as pengguna
where pengguna.id = profil.id
  and (profil.email is null or profil.email = '');

-- ------------------------------------------------------------
-- 2. Pengaturan situs (satu baris)
-- ------------------------------------------------------------

create table if not exists public.site_settings (
  id integer primary key default 1,
  nama_situs text not null default 'Syamxuanify',
  tagline text not null default 'Etalase mahasiswa kampus. Hubungi penjual lewat WhatsApp dan bayar ke QRIS penjual.',
  logo_url text,
  no_wa text,
  email_kontak text not null default 'syamilfatur@gmail.com',
  produk_wajib_disetujui boolean not null default true,
  pengumuman_aktif boolean not null default false,
  pengumuman_teks text,
  constraint site_settings_satu_baris check (id = 1),
  constraint site_settings_nama check (char_length(nama_situs) between 2 and 40),
  constraint site_settings_tagline check (char_length(tagline) between 2 and 180),
  constraint site_settings_email check (char_length(email_kontak) between 3 and 120),
  constraint site_settings_wa check (no_wa is null or char_length(no_wa) between 10 and 15),
  constraint site_settings_pengumuman check (pengumuman_teks is null or char_length(pengumuman_teks) <= 240)
);

insert into public.site_settings (id)
values (1)
on conflict (id) do nothing;

-- ------------------------------------------------------------
-- 3. Favorit dan riwayat lihat
-- ------------------------------------------------------------

create table if not exists public.favorites (
  user_id uuid not null references public.profiles (id) on delete cascade,
  product_id uuid not null references public.products (id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, product_id)
);

create table if not exists public.riwayat_lihat (
  user_id uuid not null references public.profiles (id) on delete cascade,
  product_id uuid not null references public.products (id) on delete cascade,
  dilihat_pada timestamptz not null default now(),
  primary key (user_id, product_id)
);

create index if not exists favorites_user_idx on public.favorites (user_id, created_at desc);
create index if not exists riwayat_lihat_user_idx on public.riwayat_lihat (user_id, dilihat_pada desc);

-- ------------------------------------------------------------
-- 4. Fungsi
-- ------------------------------------------------------------

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $fn$
begin
  insert into public.profiles (id, nama, no_wa, email)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'nama', ''),
    nullif(new.raw_user_meta_data ->> 'no_wa', ''),
    new.email
  )
  on conflict (id) do update
  set email = excluded.email
  where public.profiles.email is null;

  return new;
end;
$fn$;

create or replace function public.cegah_ubah_profil_sensitif()
returns trigger
language plpgsql
security definer
set search_path = public
as $fn$
begin
  if auth.uid() is null or public.is_admin() then
    return new;
  end if;

  new.is_blocked := old.is_blocked;
  new.email := old.email;

  if not (old.role = 'buyer' and new.role = 'seller') then
    new.role := old.role;
  end if;

  return new;
end;
$fn$;

drop trigger if exists cegah_ubah_profil_sensitif on public.profiles;
create trigger cegah_ubah_profil_sensitif
  before update on public.profiles
  for each row execute function public.cegah_ubah_profil_sensitif();

create or replace function public.jaga_status_produk()
returns trigger
language plpgsql
security definer
set search_path = public
as $fn$
declare
  wajib boolean;
begin
  if auth.uid() is null or public.is_admin() then
    return new;
  end if;

  if tg_op = 'INSERT' then
    select produk_wajib_disetujui into wajib
    from public.site_settings
    where id = 1;

    if wajib is false then
      new.status := 'approved';
    else
      new.status := 'pending';
    end if;

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

create or replace function public.hapus_akun_sendiri()
returns void
language plpgsql
security definer
set search_path = public
as $fn$
begin
  if auth.uid() is null then
    raise exception 'Masuk dulu';
  end if;

  delete from auth.users where id = auth.uid();
end;
$fn$;

revoke all on function public.hapus_akun_sendiri() from public;
grant execute on function public.hapus_akun_sendiri() to authenticated;

-- ------------------------------------------------------------
-- 5. RLS
-- ------------------------------------------------------------

alter table public.site_settings enable row level security;
alter table public.categories enable row level security;
alter table public.favorites enable row level security;
alter table public.riwayat_lihat enable row level security;

drop policy if exists "Pengaturan situs bisa dibaca" on public.site_settings;
create policy "Pengaturan situs bisa dibaca"
  on public.site_settings for select
  using (true);

drop policy if exists "Admin mengubah pengaturan situs" on public.site_settings;
create policy "Admin mengubah pengaturan situs"
  on public.site_settings for update
  using (public.is_admin())
  with check (public.is_admin());

drop policy if exists "Kategori tampil" on public.categories;
create policy "Kategori tampil"
  on public.categories for select
  using (aktif or public.is_admin());

drop policy if exists "Admin menambah kategori" on public.categories;
create policy "Admin menambah kategori"
  on public.categories for insert
  with check (public.is_admin());

drop policy if exists "Admin mengubah kategori" on public.categories;
create policy "Admin mengubah kategori"
  on public.categories for update
  using (public.is_admin())
  with check (public.is_admin());

drop policy if exists "Admin menghapus kategori" on public.categories;
create policy "Admin menghapus kategori"
  on public.categories for delete
  using (public.is_admin());

drop policy if exists "Favorit milik sendiri" on public.favorites;
create policy "Favorit milik sendiri"
  on public.favorites for select
  using (user_id = auth.uid());

drop policy if exists "Menambah favorit sendiri" on public.favorites;
create policy "Menambah favorit sendiri"
  on public.favorites for insert
  with check (user_id = auth.uid());

drop policy if exists "Menghapus favorit sendiri" on public.favorites;
create policy "Menghapus favorit sendiri"
  on public.favorites for delete
  using (user_id = auth.uid());

drop policy if exists "Riwayat milik sendiri" on public.riwayat_lihat;
create policy "Riwayat milik sendiri"
  on public.riwayat_lihat for select
  using (user_id = auth.uid());

drop policy if exists "Menulis riwayat sendiri" on public.riwayat_lihat;
create policy "Menulis riwayat sendiri"
  on public.riwayat_lihat for insert
  with check (user_id = auth.uid());

drop policy if exists "Mengubah riwayat sendiri" on public.riwayat_lihat;
create policy "Mengubah riwayat sendiri"
  on public.riwayat_lihat for update
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

drop policy if exists "Menghapus riwayat sendiri" on public.riwayat_lihat;
create policy "Menghapus riwayat sendiri"
  on public.riwayat_lihat for delete
  using (user_id = auth.uid());

drop policy if exists "Admin mengubah status laporan" on public.reports;
create policy "Admin mengubah status laporan"
  on public.reports for update
  using (public.is_admin())
  with check (public.is_admin());

grant select on public.site_settings to anon, authenticated;
grant update on public.site_settings to authenticated;
grant select, insert, update, delete on public.favorites to authenticated;
grant select, insert, update, delete on public.riwayat_lihat to authenticated;
grant update on public.reports to authenticated;

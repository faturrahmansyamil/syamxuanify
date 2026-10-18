-- ============================================================
-- DATA CONTOH / DEMO SAJA. JANGAN dijalankan di database produksi.
-- Membuat 3 akun, 3 toko, dan 8 produk palsu (WA 62812345000x).
-- Butuh kategori dari schema.sql sudah ada.
-- ============================================================

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

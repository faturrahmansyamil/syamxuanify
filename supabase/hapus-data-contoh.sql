-- Hapus data contoh Syamxuanify. Jalankan di Supabase > SQL Editor.
-- LANGKAH 1 (backup): jalankan blok SELECT ini dulu, klik hasilnya, lalu
-- Download/Copy JSON-nya dan simpan sebagai syamxuanify-seed-backup-2026-10-18.json
with
 u as (select id from auth.users where email like '%@contoh.syamxuanify.biz.id'
       or id in ('a1111111-1111-4111-8111-111111111111','a2222222-2222-4222-8222-222222222222','a3333333-3333-4333-8333-333333333333')),
 s as (select id from public.shops where owner_id in (select id from u)
       or id in ('b1111111-1111-4111-8111-111111111111','b2222222-2222-4222-8222-222222222222','b3333333-3333-4333-8333-333333333333')),
 p as (select id from public.products where shop_id in (select id from s))
select jsonb_build_object(
 'users',(select jsonb_agg(to_jsonb(x)-'encrypted_password') from auth.users x where id in (select id from u)),
 'profiles',(select jsonb_agg(x) from public.profiles x where id in (select id from u)),
 'shops',(select jsonb_agg(x) from public.shops x where id in (select id from s)),
 'products',(select jsonb_agg(x) from public.products x where id in (select id from p)),
 'product_images',(select jsonb_agg(x) from public.product_images x where product_id in (select id from p)),
 'product_variants',(select jsonb_agg(x) from public.product_variants x where product_id in (select id from p)),
 'favorites',(select jsonb_agg(x) from public.favorites x where product_id in (select id from p)),
 'riwayat_lihat',(select jsonb_agg(x) from public.riwayat_lihat x where product_id in (select id from p)),
 'klik_harian',(select jsonb_agg(x) from public.klik_harian x where product_id in (select id from p)),
 'reports',(select jsonb_agg(x) from public.reports x where product_id in (select id from p) or shop_id in (select id from s)),
 'cek_jumlah',jsonb_build_object('akun',(select count(*) from u),'toko',(select count(*) from s),'produk',(select count(*) from p))
) as backup;
-- Harusnya akun=3, toko=3, produk=8. Kalau angkanya beda, STOP dan kabari dulu.

-- LANGKAH 2 (hapus): jalankan setelah backup tersimpan.
begin;
create temp table _u on commit drop as
 select id from auth.users where email like '%@contoh.syamxuanify.biz.id'
  and id in ('a1111111-1111-4111-8111-111111111111','a2222222-2222-4222-8222-222222222222','a3333333-3333-4333-8333-333333333333');
create temp table _s on commit drop as
 select id from public.shops where id in ('b1111111-1111-4111-8111-111111111111','b2222222-2222-4222-8222-222222222222','b3333333-3333-4333-8333-333333333333');
create temp table _p on commit drop as select id from public.products where shop_id in (select id from _s);
delete from public.reports where product_id in (select id from _p) or shop_id in (select id from _s);
delete from public.klik_harian where product_id in (select id from _p);
delete from public.riwayat_lihat where product_id in (select id from _p);
delete from public.favorites where product_id in (select id from _p);
delete from public.product_variants where product_id in (select id from _p);
delete from public.product_images where product_id in (select id from _p);
delete from public.products where id in (select id from _p);
delete from public.shops where id in (select id from _s);
delete from public.profiles where id in (select id from _u);
delete from auth.identities where user_id in (select id from _u);
delete from auth.users where id in (select id from _u);
select (select count(*) from public.shops where no_wa like '62812345000%') as sisa_toko_demo,
       (select count(*) from auth.users where email like '%@contoh.syamxuanify.biz.id') as sisa_akun_demo;
commit;
-- Kategori, akun asli, toko/produk asli, dan admin TIDAK disentuh.

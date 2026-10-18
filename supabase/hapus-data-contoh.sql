-- LANGKAH 1: BACKUP
with
 u as (select id from auth.users where id in ('a1111111-1111-4111-8111-111111111111','a2222222-2222-4222-8222-222222222222','a3333333-3333-4333-8333-333333333333')),
 s as (select id from public.shops where id in ('b1111111-1111-4111-8111-111111111111','b2222222-2222-4222-8222-222222222222','b3333333-3333-4333-8333-333333333333')),
 p as (select id from public.products where shop_id in (select id from s))
select jsonb_build_object(
 'users',(select jsonb_agg(to_jsonb(x)-'encrypted_password') from auth.users x where id in (select id from u)),
 'profiles',(select jsonb_agg(x) from public.profiles x where id in (select id from u)),
 'shops',(select jsonb_agg(x) from public.shops x where id in (select id from s)),
 'products',(select jsonb_agg(x) from public.products x where id in (select id from p)),
 'reports',(select jsonb_agg(x) from public.reports x where product_id in (select id from p) or shop_id in (select id from s)),
 'riwayat_lihat',(select jsonb_agg(x) from public.riwayat_lihat x where product_id in (select id from p)),
 'cek_jumlah',jsonb_build_object('akun',(select count(*) from u),'toko',(select count(*) from s),'produk',(select count(*) from p))
) as backup;

-- LANGKAH 2: HAPUS
do $$
declare
  u_ids uuid[] := array['a1111111-1111-4111-8111-111111111111','a2222222-2222-4222-8222-222222222222','a3333333-3333-4333-8333-333333333333']::uuid[];
  s_ids uuid[] := array['b1111111-1111-4111-8111-111111111111','b2222222-2222-4222-8222-222222222222','b3333333-3333-4333-8333-333333333333']::uuid[];
  p_ids uuid[];
  r record;
begin
  select coalesce(array_agg(id), '{}') into p_ids from public.products where shop_id = any(s_ids);
  for r in
    select c.table_name, c.column_name from information_schema.columns c
    join information_schema.tables t on t.table_schema = c.table_schema and t.table_name = c.table_name and t.table_type = 'BASE TABLE'
    where c.table_schema = 'public' and c.table_name not in ('products','shops','profiles')
      and c.column_name in ('product_id','shop_id','user_id','pelapor_id')
  loop
    if r.column_name = 'product_id' then
      execute format('delete from public.%I where %I = any($1)', r.table_name, r.column_name) using p_ids;
    elsif r.column_name = 'shop_id' then
      execute format('delete from public.%I where %I = any($1)', r.table_name, r.column_name) using s_ids;
    else
      execute format('delete from public.%I where %I = any($1)', r.table_name, r.column_name) using u_ids;
    end if;
  end loop;
  delete from public.products where id = any(p_ids);
  delete from public.shops where id = any(s_ids);
  delete from public.profiles where id = any(u_ids);
  delete from auth.identities where user_id = any(u_ids);
  delete from auth.users where id = any(u_ids);
end $$;

select (select count(*) from public.shops where nama_toko in ('Dapur Bu Siti','Kaos Kampus Raka','Studio Mila')) as sisa_toko_demo,
       (select count(*) from public.products where slug in ('nasi-goreng-kampus','es-teh-jumbo','risoles-mayo','kaos-syamxuanify','totebag-kuliah','desain-poster','edit-cv','paket-stiker-digital')) as sisa_produk_demo,
       (select count(*) from auth.users where email like '%@contoh.syamxuanify.biz.id') as sisa_akun_demo;

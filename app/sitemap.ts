import type { MetadataRoute } from "next";
import { createClient } from "@supabase/supabase-js";
import { getSupabaseEnv, hasSupabaseEnv } from "@/lib/supabase/env";

const DASAR = "https://syamxuanify.biz.id";

const TETAP = ["", "/produk", "/toko", "/cari", "/jadi-penjual", "/tentang", "/syarat"];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const daftar: MetadataRoute.Sitemap = TETAP.map((jalur) => ({
    url: `${DASAR}${jalur}`,
    changeFrequency: "daily",
    priority: jalur === "" ? 1 : 0.7,
  }));

  if (!hasSupabaseEnv()) return daftar;
  const { url, key } = getSupabaseEnv();
  const supabase = createClient(url, key, { auth: { persistSession: false } });

  const [kategori, toko, produk] = await Promise.all([
    supabase.from("categories").select("slug"),
    supabase.from("shops").select("slug, created_at").eq("status", "approved"),
    supabase.from("products").select("slug, created_at, shops!inner(status)").eq("status", "approved").eq("shops.status", "approved"),
  ]);

  for (const baris of kategori.data ?? []) {
    daftar.push({ url: `${DASAR}/kategori/${baris.slug}`, changeFrequency: "daily", priority: 0.6 });
  }
  for (const baris of toko.data ?? []) {
    daftar.push({ url: `${DASAR}/toko/${baris.slug}`, lastModified: baris.created_at ?? undefined, priority: 0.6 });
  }
  for (const baris of produk.data ?? []) {
    daftar.push({ url: `${DASAR}/produk/${baris.slug}`, lastModified: baris.created_at ?? undefined, priority: 0.8 });
  }
  return daftar;
}

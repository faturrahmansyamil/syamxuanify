import { connection } from "next/server";
import { hasSupabaseEnv } from "@/lib/supabase/env";
import { createClient } from "@/lib/supabase/server";

export type StatusModerasi = "pending" | "approved" | "rejected";

export type TokoDasbor = {
  id: string;
  nama_toko: string;
  slug: string;
  deskripsi: string | null;
  no_wa: string;
  qris_url: string | null;
  logo_url: string | null;
  status: StatusModerasi;
  terverifikasi: boolean;
  rejection_reason: string | null;
};

export type ProdukDasbor = {
  id: string;
  judul: string;
  slug: string;
  deskripsi: string | null;
  harga: number;
  gambar_url: string | null;
  status: StatusModerasi;
  is_available: boolean;
  rejection_reason: string | null;
  category_id: string;
  kategori: string;
};

export type KategoriPilihan = {
  id: string;
  nama: string;
  slug: string;
};

const URUTAN = ["makanan-jajanan", "produk-digital", "jasa", "fashion", "lainnya"];

export async function ambilDasbor() {
  await connection();
  if (!hasSupabaseEnv()) {
    return { ok: false as const, masuk: false, pesan: "Supabase belum dihubungkan." };
  }

  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();
  const userId = typeof data?.claims?.sub === "string" ? data.claims.sub : "";
  if (!userId) return { ok: false as const, masuk: false, pesan: "Masuk dulu." };

  const [tokoRes, kategoriRes] = await Promise.all([
    supabase
      .from("shops")
      .select("id, nama_toko, slug, deskripsi, no_wa, qris_url, logo_url, status, terverifikasi, rejection_reason")
      .eq("owner_id", userId)
      .order("created_at", { ascending: true })
      .limit(1),
    supabase.from("categories").select("id, nama, slug"),
  ]);

  if (tokoRes.error || kategoriRes.error) {
    return { ok: false as const, masuk: true, pesan: pesanKolom(tokoRes.error?.message ?? kategoriRes.error?.message ?? "") };
  }

  const toko = ((tokoRes.data ?? [])[0] ?? null) as TokoDasbor | null;
  const kategori = urutkan((kategoriRes.data ?? []) as KategoriPilihan[]);
  if (!toko) return { ok: true as const, masuk: true, toko: null, produk: [] as ProdukDasbor[], kategori };

  const produkRes = await supabase
    .from("products")
    .select("id, judul, slug, deskripsi, harga, gambar_url, status, is_available, rejection_reason, category_id, categories(nama)")
    .eq("shop_id", toko.id)
    .order("created_at", { ascending: false });

  if (produkRes.error) {
    return { ok: false as const, masuk: true, pesan: pesanKolom(produkRes.error.message) };
  }

  const produk = ((produkRes.data ?? []) as BarisProduk[]).map((baris) => ({
    id: baris.id,
    judul: baris.judul,
    slug: baris.slug,
    deskripsi: baris.deskripsi,
    harga: baris.harga,
    gambar_url: baris.gambar_url,
    status: baris.status,
    is_available: baris.is_available,
    rejection_reason: baris.rejection_reason,
    category_id: baris.category_id,
    kategori: satu(baris.categories)?.nama ?? "Lainnya",
  }));

  return { ok: true as const, masuk: true, toko, produk, kategori };
}

type BarisProduk = {
  id: string;
  judul: string;
  slug: string;
  deskripsi: string | null;
  harga: number;
  gambar_url: string | null;
  status: StatusModerasi;
  is_available: boolean;
  rejection_reason: string | null;
  category_id: string;
  categories: { nama: string } | { nama: string }[] | null;
};

function pesanKolom(pesan: string) {
  const rendah = pesan.toLowerCase();
  if (rendah.includes("is_available") || rendah.includes("rejection_reason")) {
    return "Database belum punya kolom baru. Jalankan supabase/migration-4-5.sql di SQL Editor Supabase, lalu muat ulang halaman.";
  }
  return "Data dashboard gagal dimuat. Muat ulang halaman.";
}

function satu<T>(nilai: T | T[] | null) {
  if (!nilai) return null;
  return Array.isArray(nilai) ? (nilai[0] ?? null) : nilai;
}

function urutkan(daftar: KategoriPilihan[]) {
  return [...daftar].sort((a, b) => {
    const urutanA = URUTAN.indexOf(a.slug);
    const urutanB = URUTAN.indexOf(b.slug);
    return (urutanA === -1 ? 99 : urutanA) - (urutanB === -1 ? 99 : urutanB);
  });
}

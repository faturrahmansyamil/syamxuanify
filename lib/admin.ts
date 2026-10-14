import { connection } from "next/server";
import { peranPengguna } from "@/lib/peran";
import { hasSupabaseEnv } from "@/lib/supabase/env";
import { createClient } from "@/lib/supabase/server";
import type { StatusModerasi } from "@/lib/dasbor";

export type { StatusModerasi };

export type BagianAdmin = "toko" | "produk" | "laporan";

export type TokoAdmin = {
  id: string;
  nama_toko: string;
  slug: string;
  no_wa: string;
  status: StatusModerasi;
  terverifikasi: boolean;
  rejection_reason: string | null;
};

export type ProdukAdmin = {
  id: string;
  judul: string;
  slug: string;
  harga: number;
  gambar_url: string | null;
  status: StatusModerasi;
  rejection_reason: string | null;
  toko: string;
  slugToko: string;
};

export type LaporanAdmin = {
  id: string;
  alasan: string;
  created_at: string;
  produk: { judul: string; slug: string } | null;
  toko: { nama_toko: string; slug: string } | null;
  pelapor: string;
  product_id: string | null;
  shop_id: string | null;
};

export function bagianAdmin(nilai: string | undefined): BagianAdmin {
  if (nilai === "produk" || nilai === "laporan") return nilai;
  return "toko";
}

export function statusAdmin(nilai: string | undefined): StatusModerasi {
  if (nilai === "approved" || nilai === "rejected") return nilai;
  return "pending";
}

export async function ambilPanel(bagianMentah: string | undefined, statusMentah: string | undefined) {
  await connection();
  if (!hasSupabaseEnv()) {
    return { ok: false as const, admin: false, pesan: "Supabase belum dihubungkan." };
  }

  const supabase = await createClient();
  const peran = await peranPengguna(supabase);
  if (peran !== "admin") return { ok: false as const, admin: false, pesan: "" };

  const bagian = bagianAdmin(bagianMentah);
  const status = statusAdmin(statusMentah);
  const [tokoHitung, produkHitung, laporanHitung] = await Promise.all([
    supabase.from("shops").select("id", { count: "exact", head: true }).eq("status", "pending"),
    supabase.from("products").select("id", { count: "exact", head: true }).eq("status", "pending"),
    supabase.from("reports").select("id", { count: "exact", head: true }),
  ]);

  if (tokoHitung.error || produkHitung.error || laporanHitung.error) {
    return { ok: false as const, admin: true, pesan: "Ringkasan gagal dimuat. Muat ulang halaman." };
  }

  const ringkasan = {
    toko: tokoHitung.count ?? 0,
    produk: produkHitung.count ?? 0,
    laporan: laporanHitung.count ?? 0,
  };

  if (bagian === "toko") {
    const { data, error } = await supabase
      .from("shops")
      .select("id, nama_toko, slug, no_wa, status, terverifikasi, rejection_reason")
      .eq("status", status)
      .order("created_at", { ascending: false });
    if (error) return { ok: false as const, admin: true, pesan: pesanKolom(error.message, "Daftar toko gagal dimuat.") };
    return {
      ok: true as const,
      admin: true,
      bagian: "toko" as const,
      status,
      ringkasan,
      toko: (data ?? []) as TokoAdmin[],
    };
  }

  if (bagian === "produk") {
    const { data, error } = await supabase
      .from("products")
      .select("id, judul, slug, harga, gambar_url, status, rejection_reason, shops(nama_toko, slug)")
      .eq("status", status)
      .order("created_at", { ascending: false });
    if (error) return { ok: false as const, admin: true, pesan: pesanKolom(error.message, "Daftar produk gagal dimuat.") };
    const produk = ((data ?? []) as BarisProdukAdmin[]).map((baris) => {
      const toko = satu(baris.shops);
      return {
        id: baris.id,
        judul: baris.judul,
        slug: baris.slug,
        harga: baris.harga,
        gambar_url: baris.gambar_url,
        status: baris.status,
        rejection_reason: baris.rejection_reason,
        toko: toko?.nama_toko ?? "Toko",
        slugToko: toko?.slug ?? "",
      };
    });
    return { ok: true as const, admin: true, bagian: "produk" as const, status, ringkasan, produk };
  }

  const { data, error } = await supabase
    .from("reports")
    .select(
      "id, alasan, created_at, product_id, shop_id, products(judul, slug), shops(nama_toko, slug), profiles!reports_pelapor_id_fkey(nama)",
    )
    .order("created_at", { ascending: false });
  if (error) return { ok: false as const, admin: true, pesan: "Daftar laporan gagal dimuat." };

  const laporan = ((data ?? []) as BarisLaporan[]).map((baris) => ({
    id: baris.id,
    alasan: baris.alasan,
    created_at: baris.created_at,
    product_id: baris.product_id,
    shop_id: baris.shop_id,
    produk: satu(baris.products),
    toko: satu(baris.shops),
    pelapor: satu(baris.profiles)?.nama || "Pembeli",
  }));

  return { ok: true as const, admin: true, bagian: "laporan" as const, status, ringkasan, laporan };
}

type BarisProdukAdmin = {
  id: string;
  judul: string;
  slug: string;
  harga: number;
  gambar_url: string | null;
  status: StatusModerasi;
  rejection_reason: string | null;
  shops: { nama_toko: string; slug: string } | { nama_toko: string; slug: string }[] | null;
};

type BarisLaporan = {
  id: string;
  alasan: string;
  created_at: string;
  product_id: string | null;
  shop_id: string | null;
  products: { judul: string; slug: string } | { judul: string; slug: string }[] | null;
  shops: { nama_toko: string; slug: string } | { nama_toko: string; slug: string }[] | null;
  profiles: { nama: string } | { nama: string }[] | null;
};

function pesanKolom(pesan: string, umum: string) {
  const rendah = pesan.toLowerCase();
  if (rendah.includes("is_available") || rendah.includes("rejection_reason")) {
    return "Database belum punya kolom baru. Jalankan supabase/migration-4-5.sql di SQL Editor Supabase, lalu muat ulang halaman.";
  }
  return umum;
}

function satu<T>(nilai: T | T[] | null) {
  if (!nilai) return null;
  return Array.isArray(nilai) ? (nilai[0] ?? null) : nilai;
}

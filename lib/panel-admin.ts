import { connection } from "next/server";
import { redirect } from "next/navigation";
import { peranPengguna } from "@/lib/peran";
import { hasSupabaseEnv } from "@/lib/supabase/env";
import { createClient } from "@/lib/supabase/server";
import type { StatusModerasi } from "@/lib/dasbor";

export async function klienAdmin() {
  await connection();
  if (!hasSupabaseEnv()) return { ok: false as const, pesan: "Supabase belum dihubungkan." };
  const supabase = await createClient();
  if ((await peranPengguna(supabase)) !== "admin") redirect("/");
  return { ok: true as const, supabase };
}

export async function angkaMenu(supabase: Awaited<ReturnType<typeof createClient>>) {
  const [toko, produk, laporanBaru] = await Promise.all([
    supabase.from("shops").select("id", { count: "exact", head: true }).eq("status", "pending"),
    supabase.from("products").select("id", { count: "exact", head: true }).eq("status", "pending"),
    supabase.from("reports").select("id", { count: "exact", head: true }).eq("status", "baru"),
  ]);

  let laporan = laporanBaru.count ?? 0;
  if (laporanBaru.error) {
    const semua = await supabase.from("reports").select("id", { count: "exact", head: true });
    laporan = semua.count ?? 0;
  }

  return {
    persetujuan: (toko.count ?? 0) + (produk.count ?? 0),
    laporan,
  };
}

export function kataCari(nilai: string | undefined) {
  return (nilai ?? "").replace(/[%_,().\\]/g, " ").replace(/\s+/g, " ").trim().slice(0, 80);
}

export function labelStatus(status: string) {
  if (status === "approved") return "Disetujui";
  if (status === "rejected") return "Ditolak";
  if (status === "selesai") return "Selesai";
  if (status === "baru") return "Baru";
  return "Menunggu";
}

export type Aktivitas = { id: string; teks: string; href: string; waktu: string };

export async function ambilRingkasan(supabase: Awaited<ReturnType<typeof createClient>>) {
  const [toko, produk, pengguna, tokoTunggu, produkTunggu, laporanBaru, tokoBaru, produkBaru, laporanBaruDaftar] =
    await Promise.all([
      supabase.from("shops").select("id", { count: "exact", head: true }),
      supabase.from("products").select("id", { count: "exact", head: true }),
      supabase.from("profiles").select("id", { count: "exact", head: true }),
      supabase.from("shops").select("id", { count: "exact", head: true }).eq("status", "pending"),
      supabase.from("products").select("id", { count: "exact", head: true }).eq("status", "pending"),
      supabase.from("reports").select("id", { count: "exact", head: true }).eq("status", "baru"),
      supabase.from("shops").select("id, nama_toko, status, created_at").order("created_at", { ascending: false }).limit(5),
      supabase.from("products").select("id, judul, status, created_at").order("created_at", { ascending: false }).limit(5),
      supabase.from("reports").select("id, created_at, products(judul), shops(nama_toko)").order("created_at", { ascending: false }).limit(5),
    ]);

  let laporan = laporanBaru.count ?? 0;
  if (laporanBaru.error) {
    const semua = await supabase.from("reports").select("id", { count: "exact", head: true });
    laporan = semua.count ?? 0;
  }

  const aktivitas: Aktivitas[] = [
    ...(tokoBaru.data ?? []).map((item) => ({
      id: `toko-${item.id}`,
      teks: `Toko ${item.nama_toko} · ${labelStatus(item.status)}`,
      href: item.status === "pending" ? "/admin/persetujuan?tab=toko" : "/admin/toko",
      waktu: item.created_at as string,
    })),
    ...(produkBaru.data ?? []).map((item) => ({
      id: `produk-${item.id}`,
      teks: `Produk ${item.judul} · ${labelStatus(item.status)}`,
      href: item.status === "pending" ? "/admin/persetujuan?tab=produk" : "/admin/produk",
      waktu: item.created_at as string,
    })),
    ...(laporanBaruDaftar.data ?? []).map((item) => {
      const produk = satu(item.products as { judul: string } | { judul: string }[] | null);
      const tokoItem = satu(item.shops as { nama_toko: string } | { nama_toko: string }[] | null);
      return {
        id: `laporan-${item.id}`,
        teks: `Laporan ${produk?.judul || tokoItem?.nama_toko || "baru"}`,
        href: "/admin/laporan",
        waktu: item.created_at as string,
      };
    }),
  ]
    .sort((a, b) => b.waktu.localeCompare(a.waktu))
    .slice(0, 5);

  return {
    toko: toko.count ?? 0,
    produk: produk.count ?? 0,
    pengguna: pengguna.count ?? 0,
    tokoTunggu: tokoTunggu.count ?? 0,
    produkTunggu: produkTunggu.count ?? 0,
    laporan,
    aktivitas,
  };
}

export function satu<T>(nilai: T | T[] | null | undefined) {
  if (!nilai) return null;
  return Array.isArray(nilai) ? (nilai[0] ?? null) : nilai;
}

export function statusAman(nilai: string | undefined): StatusModerasi | "" {
  if (nilai === "pending" || nilai === "approved" || nilai === "rejected") return nilai;
  return "";
}

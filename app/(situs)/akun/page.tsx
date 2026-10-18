import { Tombol } from "@/components/tombol";
import type { Metadata } from "next";
import Link from "next/link";
import { connection } from "next/server";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { keluar } from "@/app/actions/auth";
import { FormBukaToko } from "@/components/form-buka-toko";
import { Muncul } from "@/components/muncul";
import { FormGantiSandi } from "@/components/form-ganti-sandi";
import { FormHapusAkun } from "@/components/form-hapus-akun";
import { FormProfil } from "@/components/form-profil";
import { ambilProdukId, type ProdukPublik } from "@/lib/katalog";
import { peranPengguna } from "@/lib/peran";
import { urlGambarAman } from "@/lib/wa";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = { title: "Akun Saya" };


export default function HalamanAkun() {
  return (
    <Suspense fallback={<p className="text-sm text-hof">Memuat akun...</p>}>
      <Isi />
    </Suspense>
  );
}

async function Isi() {
  await connection();
  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();
  const id = typeof data?.claims?.sub === "string" ? data.claims.sub : "";
  if (!id) redirect("/masuk?selanjutnya=/akun");

  const peran = await peranPengguna(supabase);
  const profil = await muatProfil(supabase, id);
  const riwayat = await muatRiwayat(supabase, id);
  const laporan = await muatLaporan(supabase, id);

  return (
    <div className="mx-auto max-w-3xl space-y-[32px]">
      <header className="space-y-2">
        <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">Akun Saya</h1>
        <p className="text-sm leading-6 text-foggy">Profil, favorit, riwayat, laporan, dan keamanan.</p>
      </header>

      <FormProfil nama={profil.nama} noWa={profil.no_wa} foto={urlGambarAman(profil.foto_url)} />

      <Muncul>
      <section className="rounded-[12px] border border-bebe bg-card p-5">
        <h2 className="text-xl font-semibold">Favorit</h2>
        <p className="mt-2 text-sm leading-6 text-foggy">Produk yang kamu simpan dengan tombol hati.</p>
        <Tombol href="/akun/favorit" varian="secondary" ukuran="lg" className="mt-[16px]">
          Lihat favorit
        </Tombol>
      </section>
      </Muncul>

      <Muncul urut={1}>
      <section className="space-y-3 rounded-[12px] border border-bebe bg-card p-5">
        <h2 className="text-xl font-semibold">Riwayat dilihat</h2>
        {riwayat.pesan ? <p className="text-sm leading-6 text-foggy">{riwayat.pesan}</p> : null}
        {riwayat.produk.length === 0 && !riwayat.pesan ? (
          <p className="text-sm leading-6 text-foggy">Belum ada produk yang dilihat.</p>
        ) : (
          <ul className="space-y-2">
            {riwayat.produk.map((produk) => (
              <li key={produk.id}>
                <TautanProduk produk={produk} />
              </li>
            ))}
          </ul>
        )}
      </section>
      </Muncul>

      <Muncul urut={2}>
      <section className="space-y-3 rounded-[12px] border border-bebe bg-card p-5">
        <h2 className="text-xl font-semibold">Laporan saya</h2>
        {laporan.pesan ? <p className="text-sm leading-6 text-foggy">{laporan.pesan}</p> : null}
        {laporan.daftar.length === 0 && !laporan.pesan ? (
          <p className="text-sm leading-6 text-foggy">Belum ada laporan.</p>
        ) : (
          <ul className="space-y-3">
            {laporan.daftar.map((item) => (
              <li key={item.id} className="rounded-lg bg-faint px-3 py-2 text-sm leading-6 text-hof">
                <span className="font-medium">{item.judul}</span>
                <span className="text-foggy"> · {item.status}</span>
                <span className="block text-foggy">{item.alasan}</span>
              </li>
            ))}
          </ul>
        )}
      </section>
      </Muncul>

      {peran === "buyer" ? (
        <Muncul urut={3}>
        <section className="space-y-[16px]">
          <h2 className="text-xl font-semibold">Mulai jualan</h2>
          <FormBukaToko />
        </section>
        </Muncul>
      ) : null}

      <Muncul urut={4}>
      <section className="space-y-[16px] rounded-[12px] border border-bebe bg-card p-5">
        <h2 className="text-xl font-semibold">Keamanan</h2>
        <FormGantiSandi />
        <form action={keluar}>
          <Tombol type="submit" varian="secondary" ukuran="lg">
            Keluar
          </Tombol>
        </form>
      </section>
      </Muncul>

      <FormHapusAkun />
    </div>
  );
}

function TautanProduk({ produk }: { produk: ProdukPublik }) {
  return (
    <Link href={`/produk/${produk.slug}`} className="block truncate text-sm font-medium text-hof hover:underline">
      {produk.judul}
      {produk.toko ? <span className="font-normal text-foggy"> · {produk.toko.nama_toko}</span> : null}
    </Link>
  );
}

async function muatProfil(supabase: Awaited<ReturnType<typeof createClient>>, id: string) {
  const lengkap = await supabase.from("profiles").select("nama, no_wa, foto_url").eq("id", id).maybeSingle();
  if (!lengkap.error && lengkap.data) return lengkap.data;
  const dasar = await supabase.from("profiles").select("nama, no_wa").eq("id", id).maybeSingle();
  return { nama: dasar.data?.nama ?? "", no_wa: dasar.data?.no_wa ?? null, foto_url: null as string | null };
}

async function muatRiwayat(supabase: Awaited<ReturnType<typeof createClient>>, id: string) {
  const { data, error } = await supabase
    .from("riwayat_lihat")
    .select("product_id")
    .eq("user_id", id)
    .order("dilihat_pada", { ascending: false })
    .limit(10);
  if (error) {
    return { produk: [] as ProdukPublik[], pesan: "Riwayat belum siap. Jalankan migration-4-7.sql, lalu muat ulang." };
  }
  const produk = await ambilProdukId((data ?? []).map((baris) => baris.product_id as string));
  return { produk, pesan: "" };
}

async function muatLaporan(supabase: Awaited<ReturnType<typeof createClient>>, id: string) {
  const lengkap = await supabase
    .from("reports")
    .select("id, alasan, status, created_at, products(judul), shops(nama_toko)")
    .eq("pelapor_id", id)
    .order("created_at", { ascending: false });

  const sumber = lengkap.error
    ? await supabase
        .from("reports")
        .select("id, alasan, created_at, products(judul), shops(nama_toko)")
        .eq("pelapor_id", id)
        .order("created_at", { ascending: false })
    : lengkap;

  if (sumber.error) return { daftar: [] as Laporan[], pesan: "Laporan belum bisa dimuat." };

  const daftar = (sumber.data ?? []).map((baris) => {
    const produk = satu(baris.products as { judul: string } | { judul: string }[] | null);
    const toko = satu(baris.shops as { nama_toko: string } | { nama_toko: string }[] | null);
    const status = "status" in baris && typeof baris.status === "string" ? labelStatus(baris.status) : "Baru";
    return {
      id: baris.id as string,
      alasan: (baris.alasan as string) || "Tanpa alasan",
      status,
      judul: produk?.judul || toko?.nama_toko || "Laporan",
    };
  });
  return { daftar, pesan: "" };
}

type Laporan = { id: string; alasan: string; status: string; judul: string };

function labelStatus(status: string) {
  if (status === "selesai") return "Selesai";
  if (status === "diperiksa") return "Diperiksa";
  return "Baru";
}

function satu<T>(nilai: T | T[] | null) {
  if (!nilai) return null;
  return Array.isArray(nilai) ? (nilai[0] ?? null) : nilai;
}

import { Tombol } from "@/components/tombol";
import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { ubahVerifikasiToko } from "@/app/actions/admin";
import { Muncul } from "@/components/muncul";
import { TombolAksi } from "@/components/tombol-aksi";
import { klienAdmin } from "@/lib/panel-admin";

export const metadata: Metadata = { title: "Verifikasi Toko" };


export default function HalamanVerifikasi({ searchParams }: { searchParams: Promise<{ saring?: string }> }) {
  return (
    <Suspense fallback={<p className="text-sm text-hof">Memuat verifikasi...</p>}>
      <Isi searchParams={searchParams} />
    </Suspense>
  );
}

async function Isi({ searchParams }: { searchParams: Promise<{ saring?: string }> }) {
  const params = await searchParams;
  const sudah = params.saring === "sudah";
  const hasil = await klienAdmin();
  if (!hasil.ok) return <p className="rounded-[12px] bg-card p-[16px] text-sm">{hasil.pesan}</p>;
  const kembali = sudah ? "/admin/verifikasi?saring=sudah" : "/admin/verifikasi?saring=belum";
  const { data } = await hasil.supabase
    .from("shops")
    .select("id, nama_toko, slug, terverifikasi")
    .eq("terverifikasi", sudah)
    .order("nama_toko");

  return (
    <div className="space-y-[16px]">
      <header>
        <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">Verifikasi Toko</h1>
        <p className="mt-2 text-sm leading-[1.6] text-foggy">Label Terverifikasi hanya untuk toko.</p>
      </header>
      <div className="flex gap-2">
        <Saring href="/admin/verifikasi?saring=belum" aktif={!sudah}>Belum</Saring>
        <Saring href="/admin/verifikasi?saring=sudah" aktif={sudah}>Sudah</Saring>
      </div>
      <ul className="space-y-3">
        {(data ?? []).length === 0 ? <li className="rounded-[12px] bg-card p-[16px] text-sm text-foggy">Tidak ada toko di filter ini.</li> : null}
        {(data ?? []).map((toko, indeks) => (
          <li key={toko.id}>
            <Muncul urut={indeks}>
            <div className="kartu flex flex-wrap items-center justify-between gap-3 p-[16px]">
            <div>
              <p className="font-medium">{toko.nama_toko}</p>
              <Link href={`/toko/${toko.slug}`} className="text-sm text-foggy hover:underline">Lihat toko</Link>
            </div>
            <TombolAksi
              aksi={ubahVerifikasiToko}
              bidang={{ id: toko.id, terverifikasi: toko.terverifikasi ? "tidak" : "ya", kembali }}
             
            >
              {toko.terverifikasi ? "Cabut" : "Beri verifikasi"}
            </TombolAksi>
            </div>
            </Muncul>
          </li>
        ))}
      </ul>
    </div>
  );
}

function Saring({ href, aktif, children }: { href: string; aktif: boolean; children: string }) {
  return (
    <Tombol href={href} chip varian={aktif ? "primary" : "secondary"}>
      {children}
    </Tombol>
  );
}

import { Tombol } from "@/components/tombol";
import type { Metadata } from "next";
import { Suspense } from "react";
import { simpanModerasi } from "@/app/actions/pengaturan";
import { klienAdmin } from "@/lib/panel-admin";
import { ambilSitus } from "@/lib/situs";

export const metadata: Metadata = { title: "Moderasi" };

export default function HalamanModerasi({ searchParams }: { searchParams: Promise<{ tersimpan?: string; galat?: string }> }) {
  return (
    <Suspense fallback={<p className="text-sm text-hof">Memuat moderasi...</p>}>
      <Isi searchParams={searchParams} />
    </Suspense>
  );
}

async function Isi({ searchParams }: { searchParams: Promise<{ tersimpan?: string; galat?: string }> }) {
  const params = await searchParams;
  const hasil = await klienAdmin();
  if (!hasil.ok) return <p className="rounded-[12px] bg-card p-[16px] text-sm">{hasil.pesan}</p>;
  const situs = await ambilSitus();

  return (
    <form action={simpanModerasi} className="mx-auto max-w-2xl space-y-[16px] rounded-[12px] border border-bebe bg-card p-5">
      <div>
        <h1 className="text-2xl font-semibold">Moderasi</h1>
        <p className="mt-2 text-sm leading-6 text-foggy">Atur apakah produk baru harus disetujui dulu.</p>
      </div>
      {params.tersimpan ? <p className="rounded-xl bg-faint px-3 py-2 text-sm font-medium text-hof">Tersimpan</p> : null}
      {params.galat ? <p className="rounded-xl bg-canvas-mist px-3 py-2 text-sm text-ink-black">Pengaturan belum tersimpan.</p> : null}
      <label className="flex items-center gap-2 text-sm font-medium">
        <input type="checkbox" name="wajib" value="ya" defaultChecked={situs.produk_wajib_disetujui} />
        Produk baru wajib disetujui admin
      </label>
      <div className="flex justify-end">
        <Tombol type="submit" varian="secondary" ukuran="lg">
          Simpan
        </Tombol>
      </div>
    </form>
  );
}

import { Tombol } from "@/components/tombol";
import type { Metadata } from "next";
import { Suspense } from "react";
import { simpanPengumuman } from "@/app/actions/pengaturan";
import { klienAdmin } from "@/lib/panel-admin";
import { ambilSitus } from "@/lib/situs";

export const metadata: Metadata = { title: "Pengumuman" };

const bidang = "w-full rounded-lg border border-bebe bg-card px-3 py-3 text-base outline-none";

export default function HalamanPengumuman({ searchParams }: { searchParams: Promise<{ tersimpan?: string; galat?: string }> }) {
  return (
    <Suspense fallback={<p className="text-sm text-hof">Memuat pengumuman...</p>}>
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
    <form action={simpanPengumuman} className="mx-auto max-w-2xl space-y-[16px] rounded-[12px] border border-bebe bg-card p-5">
      <div>
        <h1 className="text-2xl font-semibold">Pengumuman</h1>
        <p className="mt-2 text-sm leading-6 text-foggy">Banner opsional di atas beranda.</p>
      </div>
      {params.tersimpan ? <p className="rounded-xl bg-faint px-3 py-2 text-sm font-medium text-hof">Tersimpan</p> : null}
      {params.galat ? <p className="rounded-xl bg-canvas-mist px-3 py-2 text-sm text-ink-black">Pengumuman belum tersimpan.</p> : null}
      <label className="block space-y-1.5 text-sm font-medium">
        Teks banner
        <textarea name="pengumuman_teks" maxLength={240} defaultValue={situs.pengumuman_teks ?? ""} className={`${bidang} min-h-[96px]`} />
      </label>
      <label className="flex items-center gap-2 text-sm font-medium">
        <input type="checkbox" name="nyala" value="ya" defaultChecked={situs.pengumuman_aktif} />
        Tampilkan di beranda
      </label>
      <div className="flex justify-end">
        <Tombol type="submit" varian="secondary" ukuran="lg">
          Simpan
        </Tombol>
      </div>
    </form>
  );
}

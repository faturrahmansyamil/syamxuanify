import { Suspense } from "react";
import Link from "next/link";
import { KatalogProduk } from "@/components/katalog-produk";
import { KerangkaProduk } from "@/components/kartu-produk";
import { TokoPilihan } from "@/components/toko-pilihan";
import { ambilSitus } from "@/lib/situs";

export default function Home({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; kategori?: string; urut?: string }>;
}) {
  return (
    <div>
      <h1 className="sr-only">Jualan teman kampus, dalam satu katalog.</h1>
      <section className="relative mb-8 mt-10 overflow-visible rounded-2xl bg-accent px-4 py-5 text-white sm:px-6 md:mt-16 md:px-10 md:py-8">
        <div className="pointer-events-none absolute inset-0 overflow-hidden rounded-2xl">
          <span className="absolute top-1 right-0 h-44 w-44 rounded-full bg-white/15 md:top-4 md:right-6 md:h-96 md:w-96" />
        </div>
        <div className="relative pr-[11rem] md:max-w-[540px] md:pr-0">
          <h2 className="text-[1.65rem] font-extrabold leading-tight text-white sm:text-5xl">Belanja dari sesama mahasiswa.</h2>
          <p className="mt-3 text-sm font-bold leading-6 text-white sm:text-lg">
            Chat langsung ke penjual, bayar ke QRIS penjual.
          </p>
          <div className="mt-5 flex flex-wrap gap-2">
            <Link href="#daftar-produk" className="tombol-tekan tombol-banner-isi inline-flex h-12 items-center justify-center px-4 text-sm whitespace-nowrap">
              Mulai belanja
            </Link>
            <Link href="/akun" className="tombol-tekan tombol-banner-garis inline-flex h-12 items-center justify-center px-4 text-sm whitespace-nowrap">
              Buka toko
            </Link>
          </div>
        </div>
        <div className="pointer-events-none absolute -top-4 right-0 md:-top-14 md:right-4">
          <img
            src="/maskot.png"
            alt=""
            className="relative h-[140px] w-[140px] object-contain md:h-[310px] md:w-[310px]"
          />
        </div>
      </section>
      <Suspense fallback={null}>
        <BannerPengumuman />
      </Suspense>
      <Suspense fallback={<KerangkaProduk />}>
        <KatalogProduk searchParams={searchParams} />
      </Suspense>
      <Suspense fallback={null}>
        <TokoPilihan />
      </Suspense>
      <section className="mt-10 rounded-2xl border-2 border-bebe bg-langit px-5 py-8 md:px-10">
        <h2 className="max-w-xl text-2xl font-extrabold leading-tight text-hof sm:text-4xl">
          Punya usaha? Buka toko gratis di Syamxuanify.
        </h2>
        <p className="mt-3 max-w-xl text-sm font-bold leading-6 text-hof sm:text-lg">
          Jualan ke teman sekampus, pembeli langsung chat WhatsApp kamu.
        </p>
        <Link
          href="/daftar"
          className="mt-5 inline-flex h-12 items-center justify-center bg-accent px-5 text-sm font-bold whitespace-nowrap text-white"
        >
          Buka toko
        </Link>
      </section>
    </div>
  );
}

async function BannerPengumuman() {
  const situs = await ambilSitus();
  if (!situs.pengumuman_aktif || !situs.pengumuman_teks) return null;
  return (
    <p className="mb-6 rounded-2xl border-2 border-bebe bg-langit px-4 py-3 text-sm font-bold leading-6 text-hof">
      {situs.pengumuman_teks}
    </p>
  );
}

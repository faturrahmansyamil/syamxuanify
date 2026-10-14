import { Suspense } from "react";
import Link from "next/link";
import { KatalogProduk } from "@/components/katalog-produk";
import { KerangkaProduk } from "@/components/kartu-produk";
import { Muncul } from "@/components/muncul";
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
      <Muncul>
      <section className="card-duo relative mb-8 mt-10 overflow-visible p-5 sm:p-6 md:mt-16 md:min-h-[300px] md:p-10">
        <div className="pointer-events-none absolute inset-0 overflow-hidden rounded-xl">
          <span className="absolute top-1 right-0 h-44 w-44 rounded-full bg-white/15 md:top-4 md:right-6 md:h-96 md:w-96" />
        </div>
        <div className="relative z-10 pr-[11rem] md:max-w-[calc(100%-18rem)] md:pr-0 xl:max-w-[calc(100%-21rem)]">
          <h2 className="text-[1.65rem] font-black leading-tight tracking-tight sm:text-5xl">Belanja dari sesama mahasiswa.</h2>
          <p className="mt-3 text-sm leading-6 sm:text-lg">
            Chat langsung ke penjual, bayar ke QRIS penjual.
          </p>
          <div className="mt-5 flex flex-wrap gap-2">
            <Link href="#daftar-produk" className="btn-duo-white inline-flex items-center justify-center whitespace-nowrap">
              Mulai belanja
            </Link>
            <Link href="/akun" className="btn-duo inline-flex items-center justify-center whitespace-nowrap">
              Buka toko
            </Link>
          </div>
        </div>
        <div className="pointer-events-none absolute -top-4 right-0 z-0 md:-top-10 md:right-2 xl:-top-14 xl:right-4">
          <img
            src="/maskot.png"
            alt=""
            className="maskot-layang relative h-[140px] w-[140px] object-contain md:h-[230px] md:w-[230px] xl:h-[310px] xl:w-[310px]"
          />
        </div>
      </section>
      </Muncul>
      <Suspense fallback={null}>
        <BannerPengumuman />
      </Suspense>
      <Suspense fallback={<KerangkaProduk />}>
        <KatalogProduk searchParams={searchParams} />
      </Suspense>
      <Suspense fallback={null}>
        <TokoPilihan />
      </Suspense>
      <Muncul>
      <section className="card-duo mt-10 p-5 md:p-10">
        <h2 className="max-w-xl text-2xl font-black leading-tight tracking-tight text-[#042c60] sm:text-4xl">
          Punya usaha? Buka toko gratis di Syamxuanify.
        </h2>
        <p className="mt-3 max-w-xl text-sm font-bold leading-6 text-eel sm:text-lg">
          Jualan ke teman sekampus, pembeli langsung chat WhatsApp kamu.
        </p>
        <Link
          href="/daftar"
          className="btn-duo mt-5 inline-flex items-center justify-center whitespace-nowrap"
        >
          Buka toko
        </Link>
      </section>
      </Muncul>
    </div>
  );
}

async function BannerPengumuman() {
  const situs = await ambilSitus();
  if (!situs.pengumuman_aktif || !situs.pengumuman_teks) return null;
  return (
    <Muncul>
      <p className="card-duo mb-6 p-4 text-sm leading-6 text-[#042c60]">
        {situs.pengumuman_teks}
      </p>
    </Muncul>
  );
}

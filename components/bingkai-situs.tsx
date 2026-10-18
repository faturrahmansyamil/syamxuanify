import type { ReactNode } from "react";
import { Suspense } from "react";
import Link from "next/link";
import { AuthNav } from "@/components/auth-nav";
import { BarPengumuman } from "@/components/bar-pengumuman";
import { CariGlobal } from "@/components/cari-global";
import { CariProduk } from "@/components/cari-produk";
import { LatarHidup } from "@/components/latar-hidup";
import { KulitRelSamping, RelSamping } from "@/components/rel-samping";
import { WordmarkGeser } from "@/components/wordmark-geser";
import { ambilSitus } from "@/lib/situs";

export function BingkaiSitus({ children }: { children: ReactNode }) {
  return (
    <>
      <LatarHidup />
      <Suspense fallback={null}>
        <PengumumanAtas />
      </Suspense>
      <Suspense fallback={<KulitRelSamping />}>
        <RelSamping />
      </Suspense>
      <a href="#isi" className="loncat-isi">
        Loncat ke isi
      </a>
      <div className="flex min-h-dvh flex-col md:pl-[64px]">
        <header className="sticky top-0 z-40 bg-[#f2f4f5]">
          <div className="relative mx-auto flex min-h-[48px] w-full max-w-[1200px] items-center justify-end px-[16px] md:px-[24px]">
            <Suspense fallback={null}>
              <WordmarkGeser />
            </Suspense>
            <Suspense fallback={<span className="label-kecil text-muted-gray">Memuat…</span>}>
              <AuthNav />
            </Suspense>
          </div>
        </header>
        <main id="isi" className="mx-auto w-full max-w-[1200px] flex-1 px-[16px] pb-[80px] md:px-[24px]">
          <Suspense fallback={null}>
            <CariGlobal>
              <Suspense fallback={<div className="cari-pill h-[56px]" />}>
                <CariProduk />
              </Suspense>
            </CariGlobal>
          </Suspense>
          {children}
        </main>
        <footer className="bg-ink-black pb-[72px] text-white md:pb-0">
          <Suspense fallback={<p className="px-[16px] py-[48px] text-[14px]">Memuat…</p>}>
            <IsiFooter />
          </Suspense>
        </footer>
      </div>
    </>
  );
}

async function PengumumanAtas() {
  const situs = await ambilSitus();
  const teks = situs.pengumuman_aktif && situs.pengumuman_teks?.trim() ? situs.pengumuman_teks.trim() : null;
  return <BarPengumuman teks={teks} />;
}

async function IsiFooter() {
  const situs = await ambilSitus();
  const wa = situs.no_wa ? `https://wa.me/${situs.no_wa}` : null;
  return (
    <div className="mx-auto grid w-full max-w-[1200px] items-start gap-x-[32px] gap-y-[32px] px-[16px] py-[48px] md:grid-cols-3 md:px-[24px]">
      <div>
        <p className="text-[20px] font-semibold tracking-[-0.05em]">
          Syamxuanify<span className="text-shop-violet">.</span>
        </p>
        <p className="mt-[12px] text-[14px] leading-[1.4] text-white/70">{situs.tagline}</p>
      </div>
      <div className="flex flex-col gap-[4px] text-[14px]">
        <Link href="/tentang" className="inline-flex py-[8px] text-white">
          Tentang
        </Link>
        <Link href="/syarat" className="inline-flex py-[8px] text-white">
          Syarat
        </Link>
        <Link href="/daftar" className="inline-flex py-[8px] text-white">
          Buka toko gratis
        </Link>
      </div>
      <div className="flex flex-col gap-[4px] text-[14px] text-white/70">
        <a href="mailto:syamxuanify@gmail.com" className="inline-flex py-[8px]">
          syamxuanify@gmail.com
        </a>
        {wa ? (
          <a href={wa} className="inline-flex py-[8px]">
            WhatsApp admin
          </a>
        ) : null}
        <p className="mt-[8px] leading-[1.4]">
          Transaksi dilakukan langsung dengan penjual. {situs.nama_situs} tidak memproses pembayaran.
        </p>
        <p className="mt-[12px] text-[12px] font-medium">© 2026 Syamxuanify</p>
      </div>
    </div>
  );
}

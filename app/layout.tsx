import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Suspense } from "react";
import Link from "next/link";
import { AuthNav } from "@/components/auth-nav";
import { BarPengumuman } from "@/components/bar-pengumuman";
import { CariGlobal } from "@/components/cari-global";
import { CariProduk } from "@/components/cari-produk";
import { RelSamping } from "@/components/rel-samping";
import { ambilSitus } from "@/lib/situs";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], weight: ["400", "500", "600"], variable: "--font-inter" });

const deskripsiSitus =
  "Etalase mahasiswa kampus. Hubungi penjual lewat WhatsApp dan bayar ke QRIS penjual.";

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "https://syamxuanify.biz.id"),
  title: {
    default: "Syamxuanify",
    template: "%s · Syamxuanify",
  },
  description: deskripsiSitus,
  openGraph: {
    title: "Syamxuanify",
    description: deskripsiSitus,
    siteName: "Syamxuanify",
    locale: "id_ID",
    type: "website",
    images: [{ url: "/og.jpg", width: 1200, height: 630, alt: "Syamxuanify" }],
  },
  icons: {
    icon: "/logo.png",
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="id" className={`${inter.variable} h-full antialiased`} suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{document.documentElement.classList.add("js")}catch(e){}})();`,
          }}
        />
      </head>
      <body className={`${inter.className} min-h-full bg-canvas-mist text-ink-black`}>
        <RelSamping />
        <div className="flex min-h-full flex-col md:pl-[64px]">
          <Suspense fallback={null}>
            <PengumumanAtas />
          </Suspense>
          <div className="mx-auto flex w-full max-w-[1200px] justify-end px-[16px] py-[12px]">
            <Suspense fallback={<span className="label-kecil text-muted-gray">Memuat...</span>}>
              <AuthNav />
            </Suspense>
          </div>
          <main className="mx-auto w-full max-w-[1200px] flex-1 px-[16px] pb-[96px] md:px-[24px] md:pb-[64px]">
            <CariGlobal>
              <Suspense fallback={<div className="cari-pill h-[56px]" />}>
                <CariProduk />
              </Suspense>
            </CariGlobal>
            {children}
          </main>
          <footer className="bg-ink-black text-white">
            <Suspense fallback={<p className="px-[16px] py-[48px] text-[14px]">Memuat...</p>}>
              <IsiFooter />
            </Suspense>
          </footer>
        </div>
      </body>
    </html>
  );
}

async function PengumumanAtas() {
  const situs = await ambilSitus();
  const teks = situs.pengumuman_teks?.trim() ?? "";
  const isi = situs.pengumuman_aktif && teks ? teks : "Gratis buka toko untuk mahasiswa. Chat penjual langsung via WhatsApp.";
  return <BarPengumuman teks={isi} />;
}

async function IsiFooter() {
  const situs = await ambilSitus();
  const wa = situs.no_wa ? `https://wa.me/${situs.no_wa}` : null;
  return (
    <div className="mx-auto grid w-full max-w-[1200px] gap-[32px] px-[16px] py-[48px] md:grid-cols-3 md:px-[24px]">
      <div>
        <p className="text-[20px] font-semibold tracking-[-0.05em]">
          Syamxuanify<span className="text-shop-violet">.</span>
        </p>
        <p className="mt-[12px] max-w-sm text-[14px] leading-[1.4] text-white/70">{situs.tagline}</p>
      </div>
      <div className="flex flex-col gap-[8px] text-[14px]">
        <Link href="/tentang" className="inline-flex min-h-[44px] items-center text-white">
          Tentang
        </Link>
        <Link href="/syarat" className="inline-flex min-h-[44px] items-center text-white">
          Syarat
        </Link>
        <Link href="/daftar" className="inline-flex min-h-[44px] items-center text-white">
          Jadi Penjual
        </Link>
      </div>
      <div className="flex flex-col gap-[8px] text-[14px] text-white/70">
        <a href="mailto:syamxuanify@gmail.com" className="inline-flex min-h-[44px] items-center">
          syamxuanify@gmail.com
        </a>
        {wa ? (
          <a href={wa} className="inline-flex min-h-[44px] items-center">
            WhatsApp admin
          </a>
        ) : null}
        <p className="mt-[12px] leading-[1.4]">
          Transaksi dilakukan langsung dengan penjual. {situs.nama_situs} tidak memproses pembayaran.
        </p>
        <p className="mt-[16px] text-[12px] font-medium">© 2026 Syamxuanify</p>
      </div>
    </div>
  );
}

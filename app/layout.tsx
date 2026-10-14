import type { Metadata } from "next";
import { Nunito } from "next/font/google";
import { Suspense } from "react";
import Link from "next/link";
import { AuthNav } from "@/components/auth-nav";
import { BingkaiHeader } from "@/components/bingkai-header";
import { CariProduk } from "@/components/cari-produk";
import { ambilSitus } from "@/lib/situs";
import "./globals.css";

const nunito = Nunito({ subsets: ["latin"], weight: ["500", "700", "800", "900"], variable: "--font-nunito" });

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
    <html lang="id" className={`${nunito.variable} h-full antialiased`} suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{document.documentElement.classList.add("js")}catch(e){}})();`,
          }}
        />
      </head>
      <body className={`${nunito.className} flex min-h-full flex-col overflow-x-clip bg-white font-medium text-[#3c3c3c]`}>
        <header className="sticky top-0 z-20 border-b-2 border-[#e5e5e5] bg-white">
          <Suspense fallback={<KerangkaHeader />}>
            <BingkaiHeader
              logo={
                <Suspense fallback={<Link href="/" className="shrink-0"><img src="/logo.png" alt="Syamxuanify" className="h-9 w-9 rounded-full object-cover" /></Link>}>
                  <LogoSitus />
                </Suspense>
              }
              cari={
                <Suspense fallback={<div className="h-14 rounded-xl border-2 border-[#e5e5e5] bg-[#f7f7f7]" />}>
                  <CariProduk />
                </Suspense>
              }
              akun={
                <Suspense fallback={<span className="text-sm text-foggy">Memuat...</span>}>
                  <AuthNav />
                </Suspense>
              }
            />
          </Suspense>
        </header>
        <main className="mx-auto w-full max-w-[1200px] flex-1 px-4 py-8 md:px-10">{children}</main>
        <footer className="border-t-2 border-bebe bg-card">
          <Suspense fallback={<p className="px-4 py-12 text-sm font-bold">Memuat...</p>}>
            <IsiFooter />
          </Suspense>
        </footer>
      </body>
    </html>
  );
}

function KerangkaHeader() {
  return (
    <div className="mx-auto grid w-full max-w-[1200px] grid-cols-[auto_minmax(0,1fr)] items-center gap-x-3 gap-y-3 px-4 py-3 md:grid-cols-[auto_minmax(0,36rem)_auto] md:gap-6 md:px-10">
      <Link href="/" className="shrink-0">
        <img src="/logo.png" alt="Syamxuanify" className="h-9 w-9 rounded-full object-cover" />
      </Link>
      <div className="col-span-2 row-start-2 h-14 rounded-xl border-2 border-[#e5e5e5] bg-[#f7f7f7] md:col-span-1 md:col-start-2 md:row-start-1" />
    </div>
  );
}

async function LogoSitus() {
  const situs = await ambilSitus();
  return (
    <Link href="/" className="col-start-1 row-start-1 shrink-0">
      <img src="/logo.png" alt={situs.nama_situs} className="h-9 w-9 rounded-full object-cover" />
    </Link>
  );
}

async function IsiFooter() {
  const situs = await ambilSitus();
  const wa = situs.no_wa ? `https://wa.me/${situs.no_wa}` : null;
  return (
    <div className="mx-auto w-full max-w-[1200px] px-4 py-10 text-hof md:px-10">
      <h2 className="text-3xl font-black tracking-tight text-accent">Syamxuanify</h2>
      <div className="mt-6 flex max-w-xl flex-wrap gap-x-6 gap-y-2 text-sm font-bold">
        <Link href="/tentang" className="text-accent hover:underline">
          Tentang
        </Link>
        <Link href="/syarat" className="text-accent hover:underline">
          Syarat
        </Link>
        <Link href="/daftar" className="text-accent hover:underline">
          Jadi Penjual
        </Link>
        <a href="mailto:syamxuanify@gmail.com" className="text-accent hover:underline">
          syamxuanify@gmail.com
        </a>
        {wa ? (
          <a href={wa} className="text-accent hover:underline">
            WhatsApp admin
          </a>
        ) : null}
      </div>
      <p className="mt-6 max-w-xl text-sm leading-6 text-foggy">{situs.tagline}</p>
      <p className="mt-3 max-w-xl text-sm leading-6 text-foggy">
        Transaksi dilakukan langsung dengan penjual. {situs.nama_situs} tidak memproses pembayaran.
      </p>
      <p className="mt-8 border-t border-bebe pt-4 text-xs text-foggy">© 2026 Syamxuanify</p>
    </div>
  );
}

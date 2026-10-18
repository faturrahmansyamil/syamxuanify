import type { Metadata } from "next";
import { Suspense } from "react";
import { Inter } from "next/font/google";
import { PenandaMuat } from "@/components/penanda-muat";
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
        <Suspense fallback={null}>
          <PenandaMuat />
        </Suspense>
        {children}
      </body>
    </html>
  );
}

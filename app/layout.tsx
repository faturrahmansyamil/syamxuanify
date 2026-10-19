import type { Metadata } from "next";
import { Suspense } from "react";
import { Bricolage_Grotesque, Plus_Jakarta_Sans, Courier_Prime } from "next/font/google";
import { PenandaMuat } from "@/components/penanda-muat";
import "./globals.css";

const jakarta = Plus_Jakarta_Sans({ subsets: ["latin"], weight: ["400", "500", "600", "700"], variable: "--font-jakarta" });
const bricolage = Bricolage_Grotesque({ subsets: ["latin"], weight: ["600", "800"], variable: "--font-bricolage" });
const bon = Courier_Prime({ subsets: ["latin"], weight: ["400", "700"], variable: "--font-bon", display: "swap" });

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
    <html lang="id" className={`${jakarta.variable} ${bricolage.variable} ${bon.variable} h-full antialiased`} suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{document.documentElement.classList.add("js")}catch(e){}})();`,
          }}
        />
      </head>
      <body className={`${jakarta.className} min-h-full bg-canvas-mist text-ink-black`}>
        <Suspense fallback={null}>
          <PenandaMuat />
        </Suspense>
        {children}
      </body>
    </html>
  );
}

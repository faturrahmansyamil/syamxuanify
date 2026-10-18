"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, useReducedMotion } from "framer-motion";
import { Heart, House, LayoutGrid, Search, UserRound } from "lucide-react";

const TRANSISI_TITIK = { duration: 0.2, ease: "easeOut" as const };
const TRANSISI_DIAM = { duration: 0 };

const ITEM = [
  { href: "/", label: "Beranda", ikon: House, cocok: (jalur: string) => jalur === "/" },
  { href: "/cari", label: "Cari", ikon: Search, cocok: (jalur: string) => jalur === "/cari" },
  { href: "/produk", label: "Kategori", ikon: LayoutGrid, cocok: (jalur: string) => jalur === "/produk" || jalur.startsWith("/kategori") },
  { href: "/akun/favorit", label: "Favorit", ikon: Heart, cocok: (jalur: string) => jalur.startsWith("/akun/favorit") },
  { href: "/akun", label: "Akun", ikon: UserRound, cocok: (jalur: string) => jalur === "/akun" || jalur === "/masuk" || jalur === "/daftar" },
];

export function KulitRelSamping() {
  return <Nav jalur="" />;
}

export function RelSamping() {
  const jalur = usePathname();
  return <Nav jalur={jalur} />;
}

function Nav({ jalur }: { jalur: string }) {
  return (
    <>
      <nav aria-label="Utama" className="fixed bottom-0 left-0 z-30 hidden w-[64px] flex-col items-center bg-white py-[16px] md:flex" style={{ top: "var(--tinggi-pengumuman, 0px)" }}>
        <Link href="/" aria-label="Syamxuanify" translate="no" className="mb-[16px] flex h-[48px] w-[48px] items-center justify-center text-[20px] font-semibold tracking-[-0.05em]">
          S<span className="text-shop-violet">.</span>
        </Link>
        <Daftar mode="samping" jalur={jalur} />
      </nav>
      <nav aria-label="Utama" className="fixed inset-x-0 bottom-0 z-30 border-t border-faint-border bg-white px-2 pb-[max(8px,env(safe-area-inset-bottom))] md:hidden">
        <Daftar mode="bawah" jalur={jalur} />
      </nav>
    </>
  );
}

function Daftar({ mode, jalur }: { mode: "samping" | "bawah"; jalur: string }) {
  const diam = useReducedMotion();
  return (
    <ul className={mode === "samping" ? "flex flex-1 flex-col items-center gap-[8px]" : "grid grid-cols-5"}>
      {ITEM.map((item) => {
        const aktif = item.cocok(jalur);
        const Ikon = item.ikon;
        return (
          <li key={item.label}>
            <Link
              href={item.href}
              aria-current={aktif ? "page" : undefined}
              className={`flex flex-col items-center justify-center gap-[4px] text-ink-black ${mode === "bawah" ? "min-h-[56px] py-[4px]" : "h-[44px] w-[44px]"}`}
            >
              <span className={`relative grid h-[44px] w-[44px] place-items-center rounded-full text-ink-black ${aktif ? "bg-[#f2f4f5]" : ""}`}>
                <Ikon className="block h-[24px] w-[24px]" strokeWidth={1.75} aria-hidden="true" />
                {aktif ? (
                  <motion.span
                    layoutId={mode === "samping" ? "titik-syam-samping" : "titik-syam-bawah"}
                    className="titik-syam"
                    transition={diam ? TRANSISI_DIAM : TRANSISI_TITIK}
                  />
                ) : null}
              </span>
              {mode === "bawah" ? (
                <span className={`label-kecil ${aktif ? "text-ink-black" : "text-muted-gray"}`}>{item.label}</span>
              ) : (
                <span className="sr-only">{item.label}</span>
              )}
            </Link>
          </li>
        );
      })}
    </ul>
  );
}

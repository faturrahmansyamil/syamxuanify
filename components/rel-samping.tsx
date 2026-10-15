"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Heart, House, LayoutGrid, Search, UserRound } from "lucide-react";

const ITEM = [
  { href: "/", label: "Beranda", ikon: House, cocok: (jalur: string) => jalur === "/" },
  { href: "/#cari", label: "Cari", ikon: Search, cocok: (jalur: string) => jalur.startsWith("/produk") && jalur.includes("q=") },
  { href: "/#daftar-produk", label: "Kategori", ikon: LayoutGrid, cocok: (jalur: string) => jalur === "/produk" },
  { href: "/akun/favorit", label: "Favorit", ikon: Heart, cocok: (jalur: string) => jalur.startsWith("/akun/favorit") },
  { href: "/akun", label: "Akun", ikon: UserRound, cocok: (jalur: string) => jalur === "/akun" || jalur === "/masuk" || jalur === "/daftar" },
];

export function RelSamping() {
  return (
    <>
      <nav aria-label="Utama" className="fixed top-0 bottom-0 left-0 z-30 hidden w-[64px] flex-col items-center bg-white py-4 md:flex">
        <Link href="/" aria-label="Syamxuanify" className="mb-[16px] flex h-[48px] w-[48px] items-center justify-center text-[20px] font-semibold tracking-[-0.05em]">
          S<span className="text-shop-violet">.</span>
        </Link>
        <Daftar mode="samping" />
      </nav>
      <nav aria-label="Utama" className="fixed inset-x-0 bottom-0 z-30 border-t border-faint-border bg-white px-2 pb-[max(8px,env(safe-area-inset-bottom))] md:hidden">
        <Daftar mode="bawah" />
      </nav>
    </>
  );
}

function Daftar({ mode }: { mode: "samping" | "bawah" }) {
  const jalur = usePathname();
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
              className={`flex flex-col items-center justify-center gap-[4px] text-ink-black ${mode === "bawah" ? "min-h-[56px] py-[4px]" : "h-[48px] w-[48px]"}`}
            >
              <span className={`inline-flex h-[48px] w-[48px] items-center justify-center rounded-[20px] ${aktif ? "bg-canvas-mist" : ""}`}>
                <Ikon className="h-[24px] w-[24px]" strokeWidth={1.75} aria-hidden="true" />
              </span>
              {mode === "bawah" ? <span className="label-kecil text-muted-gray">{item.label}</span> : <span className="sr-only">{item.label}</span>}
            </Link>
          </li>
        );
      })}
    </ul>
  );
}

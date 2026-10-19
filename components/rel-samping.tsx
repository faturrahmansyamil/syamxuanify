"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Heart, House, LayoutGrid, Search, UserRound } from "lucide-react";


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
      <nav aria-label="Utama" className="fixed bottom-0 left-0 z-30 hidden w-[64px] flex-col items-center border-r-[1.5px] border-[#141210] bg-[#fff4dc] py-[16px] md:flex" style={{ top: "var(--tinggi-pengumuman, 0px)" }}>
        <span className="mb-[16px] h-[48px] w-[48px]" aria-hidden="true" />
        <Daftar mode="samping" jalur={jalur} />
      </nav>
      <nav aria-label="Utama" className="fixed inset-x-0 bottom-0 z-30 border-t-[1.5px] border-[#141210] bg-[#fff4dc] px-2 pb-[max(8px,env(safe-area-inset-bottom))] md:hidden">
        <Daftar mode="bawah" jalur={jalur} />
      </nav>
    </>
  );
}

function Daftar({ mode, jalur }: { mode: "samping" | "bawah"; jalur: string }) {
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
              <span className={`relative grid h-[44px] w-[44px] place-items-center rounded-[12px] text-ink-black ${aktif ? "border-[1.5px] border-[#141210] bg-[#ffd60a]" : ""}`}>
                <Ikon className="block h-[24px] w-[24px]" strokeWidth={1.75} aria-hidden="true" />
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

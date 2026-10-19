"use client";

import Link from "next/link";
import { ChevronRight, X } from "lucide-react";
import { useEffect, useState } from "react";
import { Tombol } from "@/components/tombol";

const KUNCI = "syamxuanify.pengumuman.tutup";
const TEKS_AWAL = "Buka toko gratis di Syamxuanify";
const TEKS_BAWAH = "Khusus mahasiswa · Chat via WhatsApp";

export function BarPengumuman({
  teks,
  tautan = "/jadi-penjual",
}: {
  teks?: string | null;
  tautan?: string;
}) {
  const isi = teks?.trim() || TEKS_AWAL;
  const [tampil, setTampil] = useState(true);

  useEffect(() => {
    try {
      if (localStorage.getItem(KUNCI) === isi) setTampil(false);
    } catch {
      /* penyimpanan peramban tidak tersedia */
    }
  }, [isi]);

  function tutup() {
    try {
      localStorage.setItem(KUNCI, isi);
    } catch {
      /* abaikan kalau penyimpanan ditolak */
    }
    setTampil(false);
  }

  if (!tampil) return null;

  return (
    <>
      <style>{":root { --tinggi-pengumuman: 48px; }"}</style>
      <div className="relative h-[48px] w-full bg-[#2d5bff]">
        <Link
          href={tautan}
          className="group flex h-full w-full items-center justify-center gap-[10px] px-[48px]"
        >
          <span className="font-display flex h-[24px] shrink-0 items-center justify-center rounded-[6px] border-2 border-[#141210] bg-[#ffd60a] px-[6px] text-[11px] font-extrabold leading-none text-[#141210]">
            GRATIS
          </span>
          <span className="min-w-0">
            <span className="block truncate text-[14px] font-bold leading-[1.2] text-white group-hover:underline md:overflow-visible md:whitespace-nowrap">
              {isi}
            </span>
            <span className="hidden text-[10px] leading-[1.2] text-white/70 group-hover:underline md:block">
              {TEKS_BAWAH}
            </span>
          </span>
          <ChevronRight className="h-[16px] w-[16px] shrink-0 text-white" aria-hidden="true" />
        </Link>
        <Tombol
          type="button"
          onClick={tutup}
          aria-label="Tutup pengumuman"
          ikon
          ukuran="sm"
          varian="ghost"
          terang
          className="absolute top-[8px] right-[12px]"
        >
          <X strokeWidth={1.75} aria-hidden="true" />
        </Tombol>
      </div>
    </>
  );
}

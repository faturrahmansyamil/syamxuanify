"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { Tombol } from "@/components/tombol";
import { gerakHalus, langkahKartu } from "@/components/langkah-kartu";

export function JalurChip({ children, className = "" }: { children: ReactNode; className?: string }) {
  const jalur = useRef<HTMLDivElement>(null);
  const [awal, setAwal] = useState(true);
  const [akhir, setAkhir] = useState(true);
  const [muat, setMuat] = useState(true);

  function cek() {
    const el = jalur.current;
    if (!el) return;
    const muatSemua = el.scrollWidth <= el.clientWidth + 2;
    setMuat(muatSemua);
    setAwal(el.scrollLeft <= 1);
    setAkhir(muatSemua || el.scrollLeft + el.clientWidth >= el.scrollWidth - 2);
  }

  useEffect(() => {
    cek();
    window.addEventListener("resize", cek);
    return () => window.removeEventListener("resize", cek);
  }, []);

  function geser(arah: number) {
    const el = jalur.current;
    if (!el) return;
    el.scrollBy({ left: arah * Math.max(langkahKartu(el), 160), behavior: gerakHalus() });
  }

  return (
    <div className={`flex items-center gap-[8px] ${className}`}>
      {muat || awal ? null : (
        <Tombol type="button" ikon ukuran="sm" varian="secondary" onClick={() => geser(-1)} aria-label="Geser ke kiri">
          <ChevronLeft strokeWidth={1.75} aria-hidden="true" />
        </Tombol>
      )}
      <div ref={jalur} onScroll={cek} className="jalur-geser min-w-0 flex-1 overflow-x-auto scroll-px-[16px] py-[4px]">
        <div className={`flex w-max min-w-full flex-nowrap items-center gap-[8px] px-[16px] ${muat ? "mx-auto justify-center" : ""}`}>{children}</div>
      </div>
      {muat || akhir ? null : (
        <Tombol type="button" ikon ukuran="sm" varian="secondary" onClick={() => geser(1)} aria-label="Geser ke kanan">
          <ChevronRight strokeWidth={1.75} aria-hidden="true" />
        </Tombol>
      )}
    </div>
  );
}

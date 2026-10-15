"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { useRef, type ReactNode } from "react";
import { KELAS_JALUR, gerakHalus, langkahKartu } from "@/components/langkah-kartu";

export function GeserKartu({ judul, children }: { judul: string; children: ReactNode }) {
  const jalur = useRef<HTMLDivElement>(null);

  function geser(arah: number) {
    const el = jalur.current;
    if (!el) return;
    el.scrollBy({ left: arah * langkahKartu(el), behavior: gerakHalus() });
  }

  return (
    <section>
      <div className="mb-[24px] flex items-center justify-between gap-[12px]">
        <h2 className="inline-flex min-w-0 items-center gap-[4px]">
          <span className="truncate">{judul}</span>
          <ChevronRight className="h-[16px] w-[16px] shrink-0" aria-hidden="true" />
        </h2>
        <div className="flex shrink-0 gap-[8px]">
          <button type="button" onClick={() => geser(-1)} className="panah-geser" aria-label="Geser ke kiri">
            <ChevronLeft className="h-[16px] w-[16px]" aria-hidden="true" />
          </button>
          <button type="button" onClick={() => geser(1)} className="panah-geser" aria-label="Geser ke kanan">
            <ChevronRight className="h-[16px] w-[16px]" aria-hidden="true" />
          </button>
        </div>
      </div>
      <div ref={jalur} className={KELAS_JALUR}>
        {children}
      </div>
    </section>
  );
}

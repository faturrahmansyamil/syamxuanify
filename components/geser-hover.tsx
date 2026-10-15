"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { useRef, type ReactNode } from "react";
import { KELAS_JALUR, gerakHalus, langkahKartu } from "@/components/langkah-kartu";

export function GeserHover({ judul, children }: { judul: string; children: ReactNode }) {
  const jalur = useRef<HTMLDivElement>(null);
  const tarik = useRef({ aktif: false, x: 0, kiri: 0, pindah: false });

  function geser(arah: number) {
    const el = jalur.current;
    if (!el) return;
    el.scrollBy({ left: arah * langkahKartu(el), behavior: gerakHalus() });
  }

  return (
    <section>
      <div className="mb-[24px] flex items-center justify-between gap-[12px]">
        <h2 className="inline-flex min-w-0 items-center gap-[4px]">
          {judul}
          <ChevronRight className="h-[16px] w-[16px]" aria-hidden="true" />
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
      <div className="relative">
        <div
          ref={jalur}
          className={`${KELAS_JALUR} cursor-grab active:cursor-grabbing`}
          onPointerDown={(event) => {
            if (event.pointerType !== "mouse" || !jalur.current) return;
            tarik.current = { aktif: true, x: event.clientX, kiri: jalur.current.scrollLeft, pindah: false };
            jalur.current.setPointerCapture(event.pointerId);
          }}
          onPointerMove={(event) => {
            if (!tarik.current.aktif || !jalur.current) return;
            const jarak = event.clientX - tarik.current.x;
            if (Math.abs(jarak) > 4) tarik.current.pindah = true;
            jalur.current.scrollLeft = tarik.current.kiri - jarak;
          }}
          onPointerUp={() => {
            tarik.current.aktif = false;
          }}
          onClickCapture={(event) => {
            if (!tarik.current.pindah) return;
            event.preventDefault();
            event.stopPropagation();
            tarik.current.pindah = false;
          }}
        >
          {children}
        </div>
      </div>
    </section>
  );
}

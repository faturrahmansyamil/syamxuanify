"use client";

import { useRef, type ReactNode } from "react";
import { JudulBagian } from "@/components/judul-bagian";
import { KELAS_JALUR, gerakHalus, langkahKartu, useDiAwal, useTarikJalur } from "@/components/langkah-kartu";
import { PanahGeser } from "@/components/panah-geser";

export function GeserKartu({ judul, href, children, celah = "gap-3" }: { judul: string; href?: string; children: ReactNode; celah?: string }) {
  const jalur = useRef<HTMLDivElement>(null);
  const tarik = useTarikJalur(jalur);
  const awal = useDiAwal(jalur);

  function geser(arah: number) {
    const el = jalur.current;
    if (!el) return;
    el.scrollBy({ left: arah * langkahKartu(el), behavior: gerakHalus() });
  }

  return (
    <section>
      <div className="mb-[24px] flex items-center justify-between gap-[12px]">
        <JudulBagian judul={judul} href={href} className="mb-0" />
        <PanahGeser awal={awal} geser={geser} />
      </div>
      <div
        ref={jalur}
        className={`${KELAS_JALUR} ${celah} cursor-grab active:cursor-grabbing`}
        onPointerDown={tarik.onPointerDown}
        onPointerMove={tarik.onPointerMove}
        onPointerUp={tarik.lepas}
        onPointerCancel={tarik.lepas}
        onClickCapture={tarik.onClickCapture}
      >
        {children}
      </div>
    </section>
  );
}

"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { Tombol } from "@/components/tombol";

export function PanahGeser({ awal, geser }: { awal: boolean; geser: (arah: number) => void }) {
  return (
    <div className="flex shrink-0 items-center gap-[8px] p-[4px]">
      {awal ? null : (
        <Tombol type="button" ikon ukuran="sm" varian="secondary" onClick={() => geser(-1)} aria-label="Geser ke kiri">
          <ChevronLeft strokeWidth={1.75} aria-hidden="true" />
        </Tombol>
      )}
      <Tombol type="button" ikon ukuran="sm" varian="secondary" onClick={() => geser(1)} aria-label="Geser ke kanan">
        <ChevronRight strokeWidth={1.75} aria-hidden="true" />
      </Tombol>
    </div>
  );
}

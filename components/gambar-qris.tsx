"use client";

import { Tombol } from "@/components/tombol";
import { useState } from "react";

export function GambarQris({ url }: { url: string }) {
  const [terbuka, setTerbuka] = useState(false);

  return (
    <div>
      <Tombol
        type="button"
        onClick={() => setTerbuka(true)} varian="secondary" ukuran="lg">
        <span className="block text-base font-medium">Lihat QRIS</span>
      </Tombol>
      {terbuka ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-[16px]">
          <div
            role="dialog"
            aria-modal="true"
            aria-label="QRIS diperbesar"
            className="w-full max-w-md rounded-[12px] bg-card p-[16px]"
          >
            <img src={url} alt="QRIS penjual diperbesar" className="max-h-[70vh] w-full object-contain" />
            <Tombol
              type="button"
              onClick={() => setTerbuka(false)} varian="secondary" ukuran="lg" className="mt-[16px]">
              Tutup
            </Tombol>
          </div>
        </div>
      ) : null}
    </div>
  );
}

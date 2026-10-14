"use client";

import { useState } from "react";

export function GambarQris({ url }: { url: string }) {
  const [terbuka, setTerbuka] = useState(false);

  return (
    <div>
      <button
        type="button"
        onClick={() => setTerbuka(true)}
        className="inline-flex h-12 items-center rounded-xl border-2 border-accent bg-card px-4 text-sm font-bold text-accent"
      >
        <span className="block text-base font-bold">Lihat QRIS</span>
      </button>
      {terbuka ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
          <div
            role="dialog"
            aria-modal="true"
            aria-label="QRIS diperbesar"
            className="w-full max-w-md rounded-[12px] bg-card p-4"
          >
            <img src={url} alt="QRIS penjual diperbesar" className="max-h-[70vh] w-full object-contain" />
            <button
              type="button"
              onClick={() => setTerbuka(false)}
              className="mt-4 h-11 w-full rounded-full bg-fill font-medium text-on-fill"
            >
              Tutup
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}

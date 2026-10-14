"use client";

import { useState } from "react";

export function GambarQris({ url }: { url: string }) {
  const [terbuka, setTerbuka] = useState(false);

  return (
    <div>
      <button
        type="button"
        onClick={() => setTerbuka(true)}
        className="btn-duo-white inline-flex items-center"
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
              className="btn-duo mt-4 w-full"
            >
              Tutup
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}

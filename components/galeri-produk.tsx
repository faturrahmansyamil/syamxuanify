"use client";

import { useState } from "react";

export function GaleriProduk({ foto, judul }: { foto: string[]; judul: string }) {
  const [aktif, setAktif] = useState(0);
  const [besar, setBesar] = useState(false);
  const sekarang = foto[aktif] ?? foto[0];

  return (
    <div className="space-y-3">
      <div
        className="flex snap-x snap-mandatory gap-3 overflow-x-auto md:hidden"
        onScroll={(event) => {
          const kotak = event.currentTarget;
          const indeks = Math.round(kotak.scrollLeft / Math.max(kotak.clientWidth, 1));
          if (foto[indeks]) setAktif(indeks);
        }}
      >
        {foto.map((src, indeks) => (
          <button
            key={src}
            type="button"
            className="w-full shrink-0 snap-center"
            onClick={() => {
              setAktif(indeks);
              setBesar(true);
            }}
          >
            <img src={src} alt="" className="aspect-square w-full rounded-2xl bg-card object-cover" />
          </button>
        ))}
      </div>
      <button type="button" className="hidden w-full md:block" onClick={() => setBesar(true)}>
        <img src={sekarang} alt={judul} className="aspect-square w-full rounded-2xl bg-card object-cover" />
      </button>
      {foto.length > 1 ? (
        <div className="flex gap-2 overflow-x-auto">
          {foto.map((src, indeks) => (
            <button
              key={`${src}-kecil`}
              type="button"
              aria-label={`Foto ${indeks + 1}`}
              aria-pressed={indeks === aktif}
              onClick={() => setAktif(indeks)}
              className={`h-16 w-16 shrink-0 overflow-hidden rounded-[12px] border-2 ${
                indeks === aktif ? "border-hof" : "border-transparent"
              }`}
            >
              <img src={src} alt="" className="h-full w-full object-cover" />
            </button>
          ))}
        </div>
      ) : null}
      {besar ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4" onClick={() => setBesar(false)}>
          <div role="dialog" aria-modal="true" aria-label={judul} className="w-full max-w-3xl" onClick={(event) => event.stopPropagation()}>
            <img src={sekarang} alt={judul} className="max-h-[80vh] w-full rounded-[12px] object-contain" />
            <button
              type="button"
              onClick={() => setBesar(false)}
              className="mt-4 h-11 w-full rounded-full bg-card font-medium text-hof"
            >
              Tutup
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}

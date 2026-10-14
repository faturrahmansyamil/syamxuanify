"use client";

import { useSearchParams } from "next/navigation";

export function CariProduk() {
  const params = useSearchParams();
  const kata = params.get("q") ?? "";
  const kategori = params.get("kategori") ?? "";

  return (
    <form
      key={`${kata}:${kategori}`}
      action="/"
      method="get"
      className="flex h-14 w-full items-center gap-1 rounded-xl border-2 border-bebe bg-card px-1.5"
    >
      <label htmlFor="q" className="sr-only">
        Cari produk
      </label>
      <input
        id="q"
        name="q"
        defaultValue={kata}
        placeholder="Cari jajanan, jasa, fashion..."
        className="h-full min-w-0 flex-1 bg-transparent px-4 text-base text-hof outline-none placeholder:text-foggy"
      />
      {kategori ? <input type="hidden" name="kategori" value={kategori} /> : null}
      <button
        type="submit"
        aria-label="Cari"
        className="polos flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-accent text-white hover:bg-accent-pressed"
      >
        <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="2.2">
          <circle cx="11" cy="11" r="6.5" />
          <path d="M16 16l4 4" strokeLinecap="round" />
        </svg>
      </button>
    </form>
  );
}

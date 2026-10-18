"use client";

import { usePathname } from "next/navigation";

export function WordmarkGeser() {
  const jalur = usePathname();
  const beranda = jalur === "/";

  return (
    <div
      id="slot-wordmark"
      className={`wordmark-slot pointer-events-none absolute top-1/2 left-[16px] flex max-w-[calc(100%-180px)] -translate-y-1/2 items-center gap-[8px] md:left-[24px] ${beranda ? "di-beranda" : ""}`}
    >
      <p className="wordmark-teks truncate text-[16px] font-semibold tracking-[-0.05em] text-ink-black" style={{ opacity: 0 }}>
        <span translate="no">Syamxuanify</span>
        <span className="text-shop-violet">.</span>
      </p>
      <span className="titik-denyut" aria-hidden="true" />
    </div>
  );
}

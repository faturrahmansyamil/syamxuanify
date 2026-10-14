"use client";

import { useSyncExternalStore } from "react";

function gelapSekarang() {
  return document.documentElement.classList.contains("dark");
}

function langganan(ubah: () => void) {
  const pengamat = new MutationObserver(ubah);
  pengamat.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
  return () => pengamat.disconnect();
}

export function ModeGelap() {
  const gelap = useSyncExternalStore(langganan, gelapSekarang, () => false);

  function ganti() {
    const berikutnya = !document.documentElement.classList.contains("dark");
    document.documentElement.classList.toggle("dark", berikutnya);
    localStorage.setItem("tema", berikutnya ? "gelap" : "terang");
  }

  return (
    <button
      type="button"
      onClick={ganti}
      aria-label={gelap ? "Mode terang" : "Mode gelap"}
      className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-hof hover:bg-faint"
    >
      {gelap ? (
        <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1.8">
          <circle cx="12" cy="12" r="4" />
          <path strokeLinecap="round" d="M12 3v2M12 19v2M3 12h2M19 12h2M5.6 5.6l1.4 1.4M17 17l1.4 1.4M18.4 5.6 17 7M7 17l-1.4 1.4" />
        </svg>
      ) : (
        <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1.8">
          <path strokeLinecap="round" strokeLinejoin="round" d="M20 14.5A7.5 7.5 0 0 1 9.5 4 7 7 0 1 0 20 14.5Z" />
        </svg>
      )}
    </button>
  );
}

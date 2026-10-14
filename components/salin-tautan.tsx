"use client";

import { useState } from "react";

export function SalinTautan({ path }: { path: string }) {
  const [pesan, setPesan] = useState("");

  return (
    <div className="space-y-2">
      <button
        type="button"
        onClick={async () => {
          const tautan = `${window.location.origin}${path}`;
          try {
            await navigator.clipboard.writeText(tautan);
            setPesan("Link toko tersalin.");
          } catch {
            setPesan(tautan);
          }
        }}
        className="inline-flex h-11 items-center rounded-lg border border-hof px-4 text-sm font-semibold text-hof"
      >
        Salin link toko
      </button>
      {pesan ? <p className="text-sm text-hof">{pesan}</p> : null}
    </div>
  );
}

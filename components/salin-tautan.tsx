"use client";

import { Tombol } from "@/components/tombol";
import { useState } from "react";

export function SalinTautan({ path }: { path: string }) {
  const [pesan, setPesan] = useState("");

  return (
    <div className="space-y-2">
      <Tombol
        type="button"
        onClick={async () => {
          const tautan = `${window.location.origin}${path}`;
          try {
            await navigator.clipboard.writeText(tautan);
            setPesan("Link toko tersalin.");
          } catch {
            setPesan(tautan);
          }
        }} varian="secondary" ukuran="lg">
        Salin link toko
      </Tombol>
      {pesan ? <p className="text-sm text-hof">{pesan}</p> : null}
    </div>
  );
}

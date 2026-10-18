"use client";

import { Tombol } from "@/components/tombol";
import { useState } from "react";

export function Bagikan({ judul }: { judul: string }) {
  const [pesan, setPesan] = useState("");

  return (
    <div className="flex shrink-0 items-center gap-2">
      <Tombol
        type="button"
        onClick={() => {
          void navigator.clipboard.writeText(window.location.href).then(() => {
            setPesan("Tautan disalin");
          });
        }} varian="secondary" ukuran="lg">
        {pesan ? "Disalin" : "Salin"}
      </Tombol>
      <Tombol
        href="#bagikan"
        onClick={(event) => {
          event.preventDefault();
          const teks = `${judul} ${window.location.href}`;
          window.open(`https://wa.me/?text=${encodeURIComponent(teks)}`, "_blank", "noopener,noreferrer");
        }} varian="secondary" ukuran="lg">
        WhatsApp
      </Tombol>
    </div>
  );
}

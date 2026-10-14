"use client";

import { useState } from "react";

export function Bagikan({ judul }: { judul: string }) {
  const [pesan, setPesan] = useState("");

  return (
    <div className="flex shrink-0 items-center gap-2">
      <button
        type="button"
        onClick={() => {
          void navigator.clipboard.writeText(window.location.href).then(() => {
            setPesan("Tautan disalin");
          });
        }}
        className="btn-duo-white inline-flex items-center"
      >
        {pesan ? "Disalin" : "Salin"}
      </button>
      <a
        href="#bagikan"
        onClick={(event) => {
          event.preventDefault();
          const teks = `${judul} ${window.location.href}`;
          window.open(`https://wa.me/?text=${encodeURIComponent(teks)}`, "_blank", "noopener,noreferrer");
        }}
        className="btn-duo inline-flex items-center"
      >
        WA
      </a>
    </div>
  );
}

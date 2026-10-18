"use client";

import type { ReactNode } from "react";
import { Tombol } from "@/components/tombol";

export function TombolAksi({
  aksi,
  bidang,
  konfirmasi,
  children,
}: {
  aksi: (formData: FormData) => void | Promise<void>;
  bidang: Record<string, string>;
  konfirmasi?: string;
  children: ReactNode;
}) {
  return (
    <form
      action={aksi}
      className="inline"
      onSubmit={(event) => {
        if (konfirmasi && !window.confirm(konfirmasi)) event.preventDefault();
      }}
    >
      {Object.entries(bidang).map(([nama, nilai]) => (
        <input key={nama} type="hidden" name={nama} value={nilai} />
      ))}
      <Tombol type="submit" varian="secondary" ukuran="sm">
        {children}
      </Tombol>
    </form>
  );
}

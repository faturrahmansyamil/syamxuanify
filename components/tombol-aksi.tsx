"use client";

import type { ReactNode } from "react";

export function TombolAksi({
  aksi,
  bidang,
  konfirmasi,
  className,
  children,
}: {
  aksi: (formData: FormData) => void | Promise<void>;
  bidang: Record<string, string>;
  konfirmasi?: string;
  className: string;
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
      <button type="submit" className={className}>
        {children}
      </button>
    </form>
  );
}

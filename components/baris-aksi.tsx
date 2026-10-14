"use client";

import { useState, type ReactNode } from "react";

export function BarisAksi({ children }: { children: ReactNode }) {
  const [buka, setBuka] = useState(false);

  return (
    <div className="relative flex justify-end">
      <button
        type="button"
        aria-expanded={buka}
        aria-label="Aksi"
        onClick={() => setBuka((nilai) => !nilai)}
        className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-fill text-lg leading-none text-on-fill sm:hidden"
      >
        ···
      </button>
      <div
        className={`${
          buka
            ? "absolute right-0 top-11 z-20 flex min-w-44 flex-col gap-2 rounded-[12px] border border-bebe bg-card p-3"
            : "hidden"
        } sm:static sm:flex sm:min-w-0 sm:flex-row sm:items-center sm:gap-2 sm:border-0 sm:bg-transparent sm:p-0`}
      >
        {children}
      </div>
    </div>
  );
}

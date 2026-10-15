"use client";

import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

export function CariGlobal({ children }: { children: ReactNode }) {
  const jalur = usePathname();
  if (jalur === "/" || jalur === "/masuk" || jalur === "/daftar") return null;
  return <div className="mb-[32px]">{children}</div>;
}

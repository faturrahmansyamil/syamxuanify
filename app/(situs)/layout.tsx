import type { ReactNode } from "react";
import { BingkaiSitus } from "@/components/bingkai-situs";

export default function LayoutSitus({ children }: { children: ReactNode }) {
  return <BingkaiSitus>{children}</BingkaiSitus>;
}

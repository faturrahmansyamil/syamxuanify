import { urlGambarAman } from "@/lib/wa";

const CONTOH: Record<string, string> = {
  "dapur-bu-siti": "/contoh/penjual-dapur-bu-siti.jpg",
  "kaos-kampus-raka": "/contoh/penjual-kaos-kampus-raka.jpg",
  "studio-mila": "/contoh/penjual-studio-mila.jpg",
};

export function fotoPenjual(slug: string | null | undefined, logoUrl: string | null | undefined) {
  const unggahan = urlGambarAman(logoUrl);
  if (unggahan) return unggahan;
  if (!slug) return null;
  return CONTOH[slug] ?? null;
}

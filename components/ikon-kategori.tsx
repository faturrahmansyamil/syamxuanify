import { Circle, Ellipsis, Monitor, Pencil, Shirt, Utensils, type LucideIcon } from "lucide-react";

const IKON: Record<string, LucideIcon> = {
  semua: Circle,
  "makanan-jajanan": Utensils,
  "produk-digital": Monitor,
  jasa: Pencil,
  fashion: Shirt,
  lainnya: Ellipsis,
};

export function IkonKategori({ slug, className }: { slug: string; className?: string }) {
  const Ikon = IKON[slug] ?? IKON.lainnya;
  return <Ikon className={className ?? "h-[16px] w-[16px]"} strokeWidth={1.75} aria-hidden="true" />;
}

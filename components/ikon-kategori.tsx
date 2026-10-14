import { Ellipsis, LayoutGrid, Monitor, Pencil, Shirt, Utensils } from "lucide-react";

export function IkonKategori({
  slug,
  className = "h-4 w-4",
}: {
  slug?: string | null;
  className?: string;
}) {
  const Ikon = pilihIkon(slug);
  return <Ikon className={className} aria-hidden="true" strokeWidth={2.5} />;
}

function pilihIkon(slug?: string | null) {
  if (slug === "makanan-jajanan") return Utensils;
  if (slug === "produk-digital") return Monitor;
  if (slug === "jasa") return Pencil;
  if (slug === "fashion") return Shirt;
  if (slug === "semua") return LayoutGrid;
  return Ellipsis;
}

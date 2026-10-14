import { IkonKategori } from "@/components/ikon-kategori";

export function PlaceholderProduk({ kategori }: { judul?: string; kategori?: string | null }) {
  return (
    <div className="flex aspect-square w-full items-center justify-center rounded-xl bg-deco text-hof">
      <IkonKategori slug={kategori} className="h-10 w-10" />
    </div>
  );
}

export function InisialToko({
  nama,
  className = "h-12 w-12 text-base",
}: {
  nama: string;
  className?: string;
}) {
  const huruf = nama.trim().slice(0, 1).toUpperCase() || "S";
  return (
    <span
      className={`inline-flex shrink-0 items-center justify-center rounded-full bg-fill font-medium text-on-fill ${className}`}
    >
      {huruf}
    </span>
  );
}

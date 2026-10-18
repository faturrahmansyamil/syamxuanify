import { IkonKategori } from "@/components/ikon-kategori";

export function PlaceholderProduk({ kategori }: { judul?: string; kategori?: string | null }) {
  return (
    <div className="flex aspect-square w-full items-center justify-center rounded-[20px] bg-canvas-mist text-ink-black">
      <IkonKategori slug={kategori ?? "lainnya"} className="h-[40px] w-[40px]" />
    </div>
  );
}

export function InisialToko({
  nama,
  className = "h-[48px] w-[48px] text-base",
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

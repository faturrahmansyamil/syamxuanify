import Link from "next/link";
import { ArrowDown, ArrowUp } from "lucide-react";
import type { ArahPeringkat } from "@/lib/temukan";
import { formatRupiah } from "@/lib/rupiah";

export function BarisNomor({
  n,
  href,
  gambar,
  judul,
  toko,
  harga,
  habis = false,
  arah = null,
}: {
  n: number;
  href: string;
  gambar: string | null;
  judul: string;
  toko: string;
  harga: number;
  habis?: boolean;
  arah?: ArahPeringkat;
}) {
  return (
    <Link href={href} className="flex min-w-0 items-center gap-[12px] rounded-[20px] px-[4px] py-[8px]">
      <span className="relative shrink-0">
        {gambar ? (
          <img src={gambar} alt="" className="aspect-square h-[56px] w-[56px] rounded-[20px] object-cover" />
        ) : (
          <span className="block aspect-square h-[56px] w-[56px] rounded-[20px] bg-canvas-mist" />
        )}
        <span className="label-kecil absolute bottom-[4px] left-[4px] inline-flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-ink-black px-[4px] text-white">
          {n}
        </span>
      </span>
      <span className="min-w-0 flex-1 leading-tight">
        <span className="flex min-w-0 items-center gap-[4px]">
          <span className="min-w-0 truncate text-[14px] font-semibold tracking-[-0.014em]">{judul}</span>
          {habis ? (
            <span className="label-kecil inline-flex h-[22px] shrink-0 items-center rounded-full bg-ink-black px-[8px] text-white">
              Habis
            </span>
          ) : null}
          {arah === "naik" ? <ArrowUp className="h-[16px] w-[16px] shrink-0" aria-label="Naik" /> : null}
          {arah === "turun" ? <ArrowDown className="h-[16px] w-[16px] shrink-0 text-muted-gray" aria-label="Turun" /> : null}
        </span>
        <span className="label-kecil block truncate text-muted-gray">{toko}</span>
        <span className="block text-[14px]">{formatRupiah(harga)}</span>
      </span>
    </Link>
  );
}

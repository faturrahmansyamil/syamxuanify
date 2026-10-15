import Link from "next/link";
import { GeserHover } from "@/components/geser-hover";
import { Muncul } from "@/components/muncul";
import { PlaceholderProduk } from "@/components/tampilan";
import type { KartuBaru } from "@/lib/temukan";
import { formatRupiah } from "@/lib/rupiah";

export function BaruMendarat({ produk }: { produk: KartuBaru[] }) {
  if (produk.length === 0) return null;

  return (
    <Muncul>
      <GeserHover judul="Baru mendarat">
        {produk.map((item) => (
          <article key={item.id} className="kartu flex h-full w-[220px] shrink-0 snap-start flex-col md:w-[260px]">
            <Link href={`/produk/${item.slug}`} className="flex h-full flex-col">
              <span className="bingkai-foto block overflow-hidden rounded-[20px]">
                {item.gambar ? (
                  <img src={item.gambar} alt="" className="foto-kartu" />
                ) : (
                  <PlaceholderProduk />
                )}
              </span>
              <span className="flex flex-1 flex-col gap-[12px] px-[12px] pb-[16px]">
                <span className="line-clamp-2 min-h-[2.4em] text-[14px] font-semibold tracking-[-0.014em]">{item.judul}</span>
                <span className="text-[14px]">{formatRupiah(item.harga)}</span>
                <span className="label-kecil mt-auto truncate text-muted-gray">{item.toko}</span>
              </span>
            </Link>
          </article>
        ))}
      </GeserHover>
    </Muncul>
  );
}

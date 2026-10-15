import Link from "next/link";
import { BadgeCheck } from "lucide-react";
import { TombolFavorit } from "@/components/tombol-favorit";
import { PlaceholderProduk } from "@/components/tampilan";
import { fotoPenjual } from "@/lib/contoh-penjual";
import { formatRupiah } from "@/lib/rupiah";
import { urlGambarAman } from "@/lib/wa";
import type { ProdukPublik } from "@/lib/katalog";

export function KartuProduk({
  produk,
  disukai = false,
  kembali = "/",
  peringkat,
}: {
  produk: ProdukPublik;
  disukai?: boolean;
  kembali?: string;
  peringkat?: number;
}) {
  const gambar = urlGambarAman(produk.gambar_url);

  return (
    <article className="kartu flex h-full flex-col">
      <div className="bingkai-foto relative">
        <Link href={`/produk/${produk.slug}`} prefetch={true} className="block overflow-hidden rounded-[20px]">
          {gambar ? (
            <img src={gambar} alt="" className="foto-kartu" />
          ) : (
            <PlaceholderProduk kategori={produk.kategori?.slug} />
          )}
        </Link>
        <LencanaStatus produk={produk} />
        {typeof peringkat === "number" ? (
          <span className="label-kecil absolute bottom-[12px] left-[12px] z-20 inline-flex h-[22px] min-w-[22px] items-center justify-center rounded-full bg-white px-[6px] text-ink-black">
            {peringkat}
          </span>
        ) : null}
        <div className="absolute top-[12px] right-[12px] z-20">
          <TombolFavorit id={produk.id} slug={produk.slug} disukai={disukai} kembali={kembali} />
        </div>
      </div>
      <Link href={`/produk/${produk.slug}`} prefetch={true} className="flex min-h-0 flex-1 flex-col gap-[12px] px-[12px] pb-[16px]">
        <h3 className="line-clamp-2 min-h-[2.4em] text-[14px] font-semibold tracking-[-0.014em] text-ink-black">{produk.judul}</h3>
        <p className="text-[14px] text-ink-black">{formatRupiah(produk.harga)}</p>
        <div className="mt-auto">
          {produk.toko ? (
            <BarisToko
              nama={produk.toko.nama_toko}
              slug={produk.toko.slug}
              logo={produk.toko.logo_url}
              terverifikasi={produk.toko.terverifikasi}
            />
          ) : null}
        </div>
      </Link>
    </article>
  );
}

export function BarisToko({
  nama,
  slug,
  logo,
  terverifikasi = false,
}: {
  nama: string;
  slug: string;
  logo: string | null;
  terverifikasi?: boolean;
}) {
  const foto = fotoPenjual(slug, logo);
  const huruf = nama.trim().slice(0, 1).toUpperCase() || "S";

  return (
    <p className="label-kecil flex min-w-0 items-center gap-[8px] text-muted-gray">
      {foto ? (
        <img src={foto} alt="" className="aspect-square h-[16px] w-[16px] shrink-0 rounded-full object-cover" />
      ) : (
        <span className="inline-flex aspect-square h-[16px] w-[16px] shrink-0 items-center justify-center rounded-full bg-canvas-mist text-[11px] font-medium text-ink-black">
          {huruf}
        </span>
      )}
      <span className="min-w-0 truncate">{nama}</span>
      {terverifikasi ? <BadgeCheck className="h-[14px] w-[14px] shrink-0 text-ink-black" aria-label="Terverifikasi" /> : null}
    </p>
  );
}

export function LencanaStatus({ produk }: { produk: ProdukPublik }) {
  const lencana = labelLencana(produk);
  if (!lencana) return null;
  return (
    <span className="label-kecil absolute top-[12px] left-[12px] z-20 inline-flex h-[22px] items-center rounded-full bg-white px-[8px] text-ink-black">
      {lencana}
    </span>
  );
}

function labelLencana(produk: ProdukPublik) {
  if (produk.is_available === false || produk.stock === 0) return "Habis";
  if (produk.baru) return "Baru";
  if (produk.punyaVarian) return "Varian baru";
  return null;
}

export function KerangkaProduk() {
  return (
    <div>
      <p className="sr-only">Memuat produk</p>
      <div className="grid grid-cols-2 gap-[12px] md:grid-cols-3 lg:grid-cols-4">
        {[0, 1, 2, 3, 4, 5, 6, 7].map((item) => (
          <div key={item} className="kartu aspect-square" />
        ))}
      </div>
    </div>
  );
}

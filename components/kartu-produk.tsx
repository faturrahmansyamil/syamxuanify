import Link from "next/link";
import { BadgeCheck } from "lucide-react";
import { AngkaNaik } from "@/components/angka-naik";
import { Tombol } from "@/components/tombol";
import { GambarIsi } from "@/components/gambar-isi";
import { TombolFavorit } from "@/components/tombol-favorit";
import { PlaceholderProduk } from "@/components/tampilan";
import { fotoPenjual } from "@/lib/contoh-penjual";
import { formatRupiah } from "@/lib/rupiah";
import { pesanToko, tautanWhatsApp, urlGambarAman } from "@/lib/wa";
import type { ProdukPublik } from "@/lib/katalog";

export function KartuProduk({
  produk,
  disukai = false,
  kembali = "/",
  prioritas = false,
  peringkat,
}: {
  produk: ProdukPublik;
  disukai?: boolean;
  kembali?: string;
  prioritas?: boolean;
  peringkat?: number;
}) {
  const gambar = urlGambarAman(produk.gambar_url);
  const chat = produk.toko ? tautanWhatsApp(produk.toko.no_wa, pesanToko(produk.toko.nama_toko)) : null;
  const foto = (
    <>
      <Link href={`/produk/${produk.slug}`} className="relative block overflow-hidden rounded-[20px]">
        {gambar ? (
          <span className="relative block aspect-square">
            <GambarIsi src={gambar} alt={produk.judul} sizes="(max-width: 768px) 46vw, 240px" priority={prioritas} className="foto-kartu" />
          </span>
        ) : (
          <PlaceholderProduk kategori={produk.kategori?.slug} />
        )}
      </Link>
      <LencanaStatus produk={produk} />
      <div className="absolute top-[12px] right-[12px] z-30 h-[32px] w-[32px]">
        <TombolFavorit id={produk.id} slug={produk.slug} disukai={disukai} kembali={kembali} />
      </div>
      {chat ? (
        <Tombol href={chat} varian="primary" ukuran="sm" target="_blank" rel="noopener noreferrer" className="chat-penjual">
          Chat penjual
        </Tombol>
      ) : null}
    </>
  );
  const teks = (
    <Link href={`/produk/${produk.slug}`} className="flex min-h-0 flex-1 flex-col gap-[12px] px-[12px] pb-[16px]">
      <p className="line-clamp-2 min-h-[2.4em] text-[14px] font-semibold tracking-[-0.014em] text-ink-black">{produk.judul}</p>
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
  );

  if (peringkat) {
    return (
      <div className="flex shrink-0 items-start">
        <span className="angka-peringkat relative z-0 h-[240px] md:h-[320px]">
          <AngkaNaik n={peringkat} />
        </span>
        <article className="kartu relative z-[1] -ml-[18px] w-[240px] md:w-[320px]">
          <div className="relative">{foto}</div>
          {teks}
        </article>
      </div>
    );
  }

  return (
    <article className="kartu flex h-full flex-col">
      <div className="relative">{foto}</div>
      {teks}
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
        <span className="relative aspect-square h-[16px] w-[16px] shrink-0 overflow-hidden rounded-full">
          <GambarIsi src={foto} sizes="16px" />
        </span>
      ) : (
        <span className="inline-flex aspect-square h-[16px] w-[16px] shrink-0 items-center justify-center rounded-full bg-ink-black text-[11px] font-medium text-white">
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
  return <span className="lencana-baru">{lencana}</span>;
}

function labelLencana(produk: ProdukPublik) {
  if (produk.is_available === false || produk.stock === 0) return "Habis";
  if (produk.baru) return "Baru";
  if (produk.punyaVarian) return "Varian baru";
  return null;
}

export function KerangkaProduk() {
  return (
    <div data-kerangka="1">
      <p className="sr-only">Memuat produk</p>
      <div className="grid grid-cols-2 gap-[12px] lg:grid-cols-4" aria-hidden="true">
        {[0, 1, 2, 3].map((item) => (
          <div key={item} className="h-[300px] rounded-[28px] bg-[#ebebeb]" />
        ))}
      </div>
    </div>
  );
}

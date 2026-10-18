import { GeserHover } from "@/components/geser-hover";
import { KartuProduk } from "@/components/kartu-produk";
import { Muncul } from "@/components/muncul";
import type { ProdukPublik } from "@/lib/katalog";
import type { KartuBaru } from "@/lib/temukan";

export function BaruMendarat({ produk }: { produk: KartuBaru[] }) {
  if (produk.length === 0) return null;

  return (
    <Muncul>
      <GeserHover judul="Baru mendarat" href="/produk">
        {produk.map((item, indeks) => (
          <Muncul key={item.id} urut={indeks} dekat className="w-[220px] shrink-0 snap-start md:w-[260px]">
            <KartuProduk produk={jadiProduk(item)} />
          </Muncul>
        ))}
      </GeserHover>
    </Muncul>
  );
}

function jadiProduk(item: KartuBaru): ProdukPublik {
  return {
    id: item.id,
    judul: item.judul,
    slug: item.slug,
    deskripsi: null,
    harga: item.harga,
    gambar_url: item.gambar,
    kategori: null,
    toko: {
      id: item.slugToko || item.slug,
      nama_toko: item.toko,
      slug: item.slugToko,
      deskripsi: null,
      no_wa: item.wa,
      qris_url: null,
      logo_url: null,
      terverifikasi: false,
    },
    baru: true,
  };
}

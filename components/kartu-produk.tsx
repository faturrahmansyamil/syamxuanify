import Link from "next/link";
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
}: {
  produk: ProdukPublik;
  disukai?: boolean;
  kembali?: string;
}) {
  const gambar = urlGambarAman(produk.gambar_url);
  const foto = fotoPenjual(produk.toko?.slug, produk.toko?.logo_url);

  return (
    <article className="card-duo h-full p-2">
      <div className="relative">
        <Link href={`/produk/${produk.slug}`} prefetch={true} className="block">
          {gambar ? (
            <img src={gambar} alt="" className="aspect-square w-full rounded-xl object-cover" />
          ) : (
            <PlaceholderProduk kategori={produk.kategori?.slug} />
          )}
          {produk.toko?.terverifikasi ? (
            <span className="absolute left-2 top-2 rounded-xl bg-langit px-2 py-1 text-[11px] font-bold text-accent">
              Terverifikasi
            </span>
          ) : null}
          {labelStok(produk) ? (
            <span className="absolute right-2 top-2 rounded-xl bg-black px-2 py-1 text-[11px] font-bold text-white">
              {labelStok(produk)}
            </span>
          ) : null}
        </Link>
        <div className="absolute bottom-2 right-2">
          <TombolFavorit id={produk.id} slug={produk.slug} disukai={disukai} kembali={kembali} />
        </div>
      </div>
      <Link href={`/produk/${produk.slug}`} prefetch={true} className="block px-1 pt-3">
        <h3 className="truncate text-sm font-bold text-hof">{produk.judul}</h3>
        {produk.toko ? (
          <p className="mt-0.5 flex items-center gap-1.5 text-xs text-foggy">
            {foto ? <img src={foto} alt="" className="h-4 w-4 shrink-0 rounded-full object-cover" /> : null}
            <span className="truncate">{produk.toko.nama_toko}</span>
          </p>
        ) : null}
        <p className="mt-1 text-sm font-extrabold text-accent">{formatRupiah(produk.harga)}</p>
        {typeof produk.sold_count === "number" ? (
          <p className="mt-0.5 text-xs text-foggy">{produk.sold_count} terjual</p>
        ) : null}
      </Link>
    </article>
  );
}

function labelStok(produk: ProdukPublik) {
  if (produk.is_available === false || produk.stock === 0) return "Habis";
  if (typeof produk.stock === "number" && produk.stock <= 5) return `Sisa ${produk.stock}`;
  return null;
}

export function KerangkaProduk() {
  return (
    <div className="grid grid-cols-2 gap-4 md:grid-cols-3 md:gap-6 lg:grid-cols-5">
      {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map((item) => (
        <div key={item} className="card-duo aspect-square animate-pulse" />
      ))}
    </div>
  );
}

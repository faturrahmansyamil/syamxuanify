import { Tombol } from "@/components/tombol";
import { JudulBagian } from "@/components/judul-bagian";
import { BarisNomor } from "@/components/baris-nomor";
import { Muncul } from "@/components/muncul";
import type { KolomTren } from "@/lib/temukan";

export function LagiTren({ kolom }: { kolom: KolomTren[] }) {
  const tampil = kolom.filter((item) => item.produk.length >= 3);
  if (tampil.length === 0) return null;
  const grid =
    tampil.length === 1
      ? "mt-[16px] grid grid-cols-1 gap-[12px]"
      : tampil.length === 2
        ? "mt-[16px] grid grid-cols-1 gap-[12px] md:grid-cols-2"
        : "mt-[16px] grid grid-cols-1 gap-[12px] md:grid-cols-2 lg:grid-cols-3";

  return (
    <Muncul>
      <section>
        <JudulBagian judul="Lagi tren" />
        <div className={grid}>
          {tampil.map((item) => (
            <div key={item.slug} className="min-w-0">
              <h3 className="text-lg font-semibold text-[#000000]">{item.judul}</h3>
              <div className="kartu mt-3 p-2">
                {item.produk.map((produk, indeks) => (
                  <BarisNomor
                    key={produk.id}
                    n={indeks + 1}
                    href={`/produk/${produk.slug}`}
                    gambar={produk.gambar}
                    judul={produk.judul}
                    toko={produk.toko}
                    harga={produk.harga}
                  />
                ))}
                <Tombol
                  href={`/produk?kategori=${item.slug}`} varian="secondary" ukuran="sm" className="mt-[8px]">
                  Semua {item.judul}
                </Tombol>
              </div>
            </div>
          ))}
        </div>
      </section>
    </Muncul>
  );
}

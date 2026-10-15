import Link from "next/link";
import { ChevronRight } from "lucide-react";
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
        <h2 className="mb-[24px] inline-flex items-center gap-[4px]">
          Lagi tren
          <ChevronRight className="h-[16px] w-[16px]" aria-hidden="true" />
        </h2>
        <div className={grid}>
          {tampil.map((item) => (
            <div key={item.slug} className="min-w-0">
              <h3 className="text-lg font-black text-[#042c60]">{item.judul}</h3>
              <div className="card-duo mt-3 p-2">
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
                <Link
                  href={`/produk?kategori=${item.slug}`}
                  className="btn-duo-white mt-2 flex w-full items-center justify-center"
                >
                  Semua {item.judul}
                </Link>
              </div>
            </div>
          ))}
        </div>
      </section>
    </Muncul>
  );
}

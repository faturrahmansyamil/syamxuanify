import { KartuProduk } from "@/components/kartu-produk";
import { GeserKartu } from "@/components/geser-kartu";
import { Muncul } from "@/components/muncul";
import type { ProdukPublik } from "@/lib/katalog";

export function TopTerlaris({ produk }: { produk: ProdukPublik[] }) {
  if (produk.length === 0) return null;

  return (
    <Muncul>
      <GeserKartu judul="Top 10 Terlaris">
        {produk.map((item, indeks) => (
          <div key={item.id} className="flex w-[220px] shrink-0 snap-start md:w-[260px]">
            <Muncul urut={indeks} className="flex h-full w-full flex-col">
              <KartuProduk produk={item} peringkat={indeks + 1} />
            </Muncul>
          </div>
        ))}
      </GeserKartu>
    </Muncul>
  );
}

import { AngkaNaik } from "@/components/angka-naik";
import { GeserKartu } from "@/components/geser-kartu";
import { KartuProduk } from "@/components/kartu-produk";
import { Muncul } from "@/components/muncul";
import type { ProdukPublik } from "@/lib/katalog";

const CELAH_JALUR =
  "gap-[24px] pl-[16px] pr-[16px] scroll-pl-[16px] scroll-pr-[16px] md:gap-[32px] md:pl-[24px] md:pr-[24px] md:scroll-pl-[24px] md:scroll-pr-[24px]";

export function TopTerlaris({ produk }: { produk: ProdukPublik[] }) {
  if (produk.length === 0) return null;

  return (
    <Muncul>
      <GeserKartu judul="Top 10 Terlaris" href="/produk?urut=terlaris" celah={CELAH_JALUR}>
        {produk.map((item, indeks) => {
          const n = indeks + 1;
          return (
            <Muncul key={item.id} urut={indeks} dekat className="flex shrink-0 snap-start items-center gap-[12px] md:gap-[16px]">
              <span className="inline-flex w-[52px] shrink-0 items-center justify-end overflow-hidden md:w-[72px]">
                <span
                  className={`text-right text-[64px] leading-none font-medium whitespace-nowrap text-[#000000] tabular-nums md:text-[96px] ${n === 10 ? "origin-right scale-x-[0.7] tracking-[-0.08em] md:scale-x-[0.64]" : "tracking-[-0.04em]"}`}
                >
                  <AngkaNaik n={n} />
                </span>
              </span>
              <div className="w-[240px] shrink-0 md:w-[320px]">
                <KartuProduk produk={item} />
              </div>
            </Muncul>
          );
        })}
      </GeserKartu>
    </Muncul>
  );
}

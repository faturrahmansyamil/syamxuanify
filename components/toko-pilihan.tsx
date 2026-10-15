import Link from "next/link";
import { BadgeCheck, ChevronRight } from "lucide-react";
import { Muncul } from "@/components/muncul";
import { InisialToko } from "@/components/tampilan";
import { fotoPenjual } from "@/lib/contoh-penjual";
import { ambilTokoPilihan } from "@/lib/katalog";

export async function TokoPilihan() {
  const toko = await ambilTokoPilihan();
  if (toko.length === 0) return null;

  return (
    <Muncul>
    <section>
      <h2 className="mb-[24px] inline-flex items-center gap-[4px]">
        Toko Pilihan
        <ChevronRight className="h-[16px] w-[16px]" aria-hidden="true" />
      </h2>
      <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {toko.map((item, indeks) => {
          const foto = fotoPenjual(item.slug, item.logo_url);
          return (
            <Muncul key={item.id} urut={indeks}>
            <Link
              href={`/toko/${item.slug}`}
              className="card-duo flex h-full min-w-0 items-center gap-3 p-3"
            >
              {foto ? (
                <img src={foto} alt="" className="h-14 w-14 shrink-0 rounded-full object-cover" />
              ) : (
                <InisialToko nama={item.nama_toko} className="h-14 w-14 text-lg" />
              )}
              <span className="min-w-0">
                <span className="block truncate text-sm font-extrabold text-hof">{item.nama_toko}</span>
                <span className="mt-1 flex flex-wrap items-center gap-2">
                  {item.terverifikasi ? (
                    <span className="inline-flex min-h-6 items-center gap-1 rounded-xl bg-langit px-2 py-0.5 text-xs font-bold text-[#1e40af]">
                      <BadgeCheck className="h-3.5 w-3.5" aria-hidden="true" strokeWidth={2.5} />
                      Terverifikasi
                    </span>
                  ) : null}
                  <span className="text-xs font-bold text-[#4b4b4b]">{item.jumlah} produk</span>
                </span>
              </span>
            </Link>
            </Muncul>
          );
        })}
      </div>
    </section>
    </Muncul>
  );
}

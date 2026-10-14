import Link from "next/link";
import { BadgeCheck } from "lucide-react";
import { InisialToko } from "@/components/tampilan";
import { fotoPenjual } from "@/lib/contoh-penjual";
import { ambilTokoPilihan } from "@/lib/katalog";

export async function TokoPilihan() {
  const toko = await ambilTokoPilihan();
  if (toko.length === 0) return null;

  return (
    <section className="mt-10">
      <h2 className="text-2xl font-extrabold text-hof">Toko Pilihan</h2>
      <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {toko.map((item) => {
          const foto = fotoPenjual(item.slug, item.logo_url);
          return (
            <Link
              key={item.id}
              href={`/toko/${item.slug}`}
              className="flex min-w-0 items-center gap-3 rounded-2xl border-2 border-bebe bg-card p-3"
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
                    <span className="inline-flex items-center gap-1 rounded-xl bg-langit px-2 py-0.5 text-[11px] font-bold text-accent">
                      <BadgeCheck className="h-3.5 w-3.5" aria-hidden="true" strokeWidth={2.5} />
                      Verified
                    </span>
                  ) : null}
                  <span className="text-xs font-bold text-foggy">{item.jumlah} produk</span>
                </span>
              </span>
            </Link>
          );
        })}
      </div>
    </section>
  );
}

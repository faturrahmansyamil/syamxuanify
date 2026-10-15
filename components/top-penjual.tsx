import Link from "next/link";
import { BadgeCheck, ChevronRight } from "lucide-react";
import { InisialToko } from "@/components/tampilan";
import { Muncul } from "@/components/muncul";
import type { PenjualTop } from "@/lib/temukan";

export function TopPenjual({ toko, semua = false }: { toko: PenjualTop[]; semua?: boolean }) {
  if (toko.length === 0) return null;

  return (
    <Muncul>
      <section>
        {semua ? null : (
          <h2 className="mb-[24px] inline-flex items-center gap-[4px]">
            Top Penjual
            <ChevronRight className="h-[16px] w-[16px]" aria-hidden="true" />
          </h2>
        )}
        <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3">
          {toko.map((item, indeks) => (
            <Link key={item.id} href={`/toko/${item.slug}`} className="card-duo flex min-w-0 items-center gap-3 p-3">
              {semua ? null : (
                <span className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-xl border-2 border-[#e5e5e5] text-sm font-black text-[#2563eb]">
                  {indeks + 1}
                </span>
              )}
              {item.logo ? (
                <img src={item.logo} alt="" className="h-10 w-10 shrink-0 rounded-full object-cover" />
              ) : (
                <InisialToko nama={item.nama} className="h-10 w-10 text-sm" />
              )}
              <span className="min-w-0 flex-1">
                <span className="flex min-w-0 items-center gap-1">
                  <span className="truncate text-sm font-black text-[#3c3c3c]">{item.nama}</span>
                  {item.terverifikasi ? <BadgeCheck className="h-4 w-4 shrink-0 text-[#2563eb]" aria-label="Terverifikasi" /> : null}
                </span>
                <span className="block truncate text-xs font-bold text-[#4b4b4b]">{item.jumlah} produk</span>
              </span>
            </Link>
          ))}
        </div>
        {semua ? null : (
          <Link href="/toko" className="btn-duo-white mt-4 flex w-full items-center justify-center">
            Lihat semua toko
          </Link>
        )}
      </section>
    </Muncul>
  );
}

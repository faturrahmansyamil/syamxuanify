import { Tombol } from "@/components/tombol";
import Link from "next/link";
import { BadgeCheck } from "lucide-react";
import { JudulBagian } from "@/components/judul-bagian";
import { InisialToko } from "@/components/tampilan";
import { Muncul } from "@/components/muncul";
import type { PenjualTop } from "@/lib/temukan";

export function TopPenjual({ toko, semua = false }: { toko: PenjualTop[]; semua?: boolean }) {
  if (toko.length === 0) return null;

  return (
    <Muncul>
      <section>
        {semua ? null : (
          <JudulBagian judul="Top Penjual" href="/toko" />
        )}
        <div className="mt-[16px] grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3">
          {toko.map((item, indeks) => (
            <Link key={item.id} href={`/toko/${item.slug}`} className="kartu flex min-w-0 items-center gap-[12px]" style={{ padding: 16 }}>
              {semua ? null : <span className="w-[20px] shrink-0 text-[16px] font-medium tracking-[-0.03em] text-ink-black">{indeks + 1}</span>}
              {item.logo ? (
                <img src={item.logo} alt="" className="h-[40px] w-[40px] shrink-0 rounded-full object-cover" />
              ) : (
                <InisialToko nama={item.nama} className="h-[40px] w-[40px] text-sm" />
              )}
              <span className="min-w-0 flex-1">
                <span className="flex min-w-0 items-center gap-1">
                  <span className="truncate text-sm font-semibold text-[#000000]">{item.nama}</span>
                  {item.terverifikasi ? <BadgeCheck className="h-[16px] w-[16px] shrink-0 text-[#000000]" aria-label="Terverifikasi" /> : null}
                </span>
                <span className="block truncate text-xs font-medium text-[#787574]">{item.jumlah} produk</span>
              </span>
            </Link>
          ))}
        </div>
        {semua ? null : (
          <Tombol href="/toko" varian="secondary" ukuran="sm" className="mt-[16px]">
            Lihat semua toko
          </Tombol>
        )}
      </section>
    </Muncul>
  );
}

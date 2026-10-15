import Link from "next/link";
import { BadgeCheck, ChevronRight } from "lucide-react";
import { BarisNomor } from "@/components/baris-nomor";
import { InisialToko } from "@/components/tampilan";
import { Muncul } from "@/components/muncul";
import type { BarisPeringkat, PenjualBaru } from "@/lib/temukan";

export function PapanHarian({
  hariIni,
  penjualBaru,
  favorit,
}: {
  hariIni: BarisPeringkat[];
  penjualBaru: PenjualBaru | null;
  favorit: BarisPeringkat[];
}) {
  if (hariIni.length === 0 && !penjualBaru && favorit.length === 0) return null;

  return (
    <Muncul>
      <section className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {hariIni.length > 0 ? <Kolom judul="Terlaris hari ini" baris={hariIni} /> : null}
        {penjualBaru ? <KartuPenjual toko={penjualBaru} /> : null}
        {favorit.length > 0 ? <Kolom judul="Favorit sepanjang masa" baris={favorit} /> : null}
      </section>
    </Muncul>
  );
}

function Kolom({ judul, baris }: { judul: string; baris: BarisPeringkat[] }) {
  return (
    <div className="min-w-0">
      <h2 className="mb-[24px] inline-flex items-center gap-[4px]">
        {judul}
        <ChevronRight className="h-[16px] w-[16px]" aria-hidden="true" />
      </h2>
      <div className="card-duo mt-3 p-2">
        {baris.map((item, indeks) => (
          <BarisNomor
            key={item.id}
            n={indeks + 1}
            href={`/produk/${item.slug}`}
            gambar={item.gambar}
            judul={item.judul}
            toko={item.toko}
            harga={item.harga}
            habis={item.habis}
            arah={item.arah}
          />
        ))}
      </div>
    </div>
  );
}

function KartuPenjual({ toko }: { toko: PenjualBaru }) {
  return (
    <div className="flex min-w-0 flex-col">
      <h2 className="mb-[24px] inline-flex items-center gap-[4px]">
        Penjual baru
        <ChevronRight className="h-[16px] w-[16px]" aria-hidden="true" />
      </h2>
      <article className="card-duo mt-3 p-4">
        <div className="flex items-center gap-3">
          {toko.logo ? (
            <img src={toko.logo} alt="" className="aspect-square h-16 w-16 shrink-0 rounded-full object-cover" />
          ) : (
            <InisialToko nama={toko.nama} className="aspect-square h-16 w-16 text-xl" />
          )}
          <div className="min-w-0">
            <p className="flex items-center gap-1 truncate text-lg font-black text-[#3c3c3c]">
              <span className="truncate">{toko.nama}</span>
              {toko.terverifikasi ? <BadgeCheck className="h-4 w-4 shrink-0 text-[#2563eb]" aria-label="Terverifikasi" /> : null}
            </p>
            <p className="text-xs font-bold text-[#4b4b4b]">Toko yang baru disetujui</p>
          </div>
        </div>
        {toko.deskripsi ? <p className="mt-3 line-clamp-4 text-sm font-bold leading-6 text-[#4b4b4b]">{toko.deskripsi}</p> : null}
        <Link href={`/toko/${toko.slug}`} className="btn-duo mt-4 inline-flex w-auto items-center justify-center">
          Kunjungi toko
        </Link>
      </article>
    </div>
  );
}

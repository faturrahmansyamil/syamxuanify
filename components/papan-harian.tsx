import { Tombol } from "@/components/tombol";
import { BadgeCheck } from "lucide-react";
import { BarisNomor } from "@/components/baris-nomor";
import { JudulBagian } from "@/components/judul-bagian";
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
      <section className="grid grid-cols-1 gap-[16px] md:grid-cols-2 lg:grid-cols-3">
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
      <JudulBagian judul={judul} />
      <div className="kartu mt-3 p-2">
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
      <JudulBagian judul="Penjual baru" />
      <article className="kartu mt-3 p-[16px]">
        <div className="flex items-center gap-3">
          {toko.logo ? (
            <img src={toko.logo} alt="" className="aspect-square h-[64px] w-[64px] shrink-0 rounded-full object-cover" />
          ) : (
            <InisialToko nama={toko.nama} className="aspect-square h-[64px] w-[64px] text-xl" />
          )}
          <div className="min-w-0">
            <p className="flex items-center gap-1 truncate text-lg font-semibold text-[#000000]">
              <span className="truncate">{toko.nama}</span>
              {toko.terverifikasi ? <BadgeCheck className="h-[16px] w-[16px] shrink-0 text-[#000000]" aria-label="Terverifikasi" /> : null}
            </p>
            <p className="text-xs font-medium text-[#787574]">Toko yang baru disetujui</p>
          </div>
        </div>
        {toko.deskripsi ? <p className="mt-3 line-clamp-4 text-sm font-medium leading-6 text-[#787574]">{toko.deskripsi}</p> : null}
        <Tombol href={`/toko/${toko.slug}`} varian="secondary" ukuran="lg" className="mt-[16px]">
          Kunjungi toko
        </Tombol>
      </article>
    </div>
  );
}

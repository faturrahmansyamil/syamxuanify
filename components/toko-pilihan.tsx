import Link from "next/link";
import { GambarIsi } from "@/components/gambar-isi";
import { JudulBagian } from "@/components/judul-bagian";
import { InisialToko } from "@/components/tampilan";
import { fotoPenjual } from "@/lib/contoh-penjual";
import type { TokoPilihan } from "@/lib/katalog";

export function TokoPilihan({ toko }: { toko: TokoPilihan[] }) {
  const daftar = toko.slice(0, 4);
  if (!daftar.length) return null;

  return (
    <section>
      <JudulBagian judul="Toko Pilihan" href="/toko" />
      <div className="grid grid-cols-1 gap-[12px] sm:grid-cols-2 lg:grid-cols-4">
        {daftar.map((item) => {
          const foto = fotoPenjual(item.slug, item.logo_url);
          return (
            <Link key={item.id} href={`/toko/${item.slug}`} className="kartu kartu-toko flex flex-col">
              <span className="flex min-w-0 items-center gap-[8px]">
                {foto ? (
                  <span className="relative h-[32px] w-[32px] shrink-0 overflow-hidden rounded-full">
                    <GambarIsi src={foto} sizes="32px" />
                  </span>
                ) : (
                  <InisialToko nama={item.nama_toko} className="h-[32px] w-[32px] text-[12px]" />
                )}
                <span className="min-w-0 truncate text-[14px] font-semibold leading-[1.3]">{item.nama_toko}</span>
              </span>
              <span className="mt-[12px] grid grid-cols-3 gap-[8px]">
                {[0, 1, 2].map((indeks) => {
                  const src = item.foto[indeks];
                  return (
                    <span key={`${item.id}-${indeks}`} className="relative aspect-square overflow-hidden rounded-[16px]">
                      {src ? <GambarIsi src={src} alt={`Produk dari ${item.nama_toko}`} sizes="(max-width: 640px) 28vw, 120px" /> : null}
                    </span>
                  );
                })}
              </span>
            </Link>
          );
        })}
      </div>
    </section>
  );
}

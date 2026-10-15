import { Suspense } from "react";
import Link from "next/link";
import { CariProduk } from "@/components/cari-produk";
import { IkonKategori } from "@/components/ikon-kategori";
import { KatalogProduk } from "@/components/katalog-produk";
import { KerangkaProduk } from "@/components/kartu-produk";
import { Muncul } from "@/components/muncul";
import { PlaceholderProduk } from "@/components/tampilan";
import { TokoPilihan } from "@/components/toko-pilihan";
import { ambilKatalog, ambilTerlaris, bersihkanKata, slugAman, urutanAman, type UrutanKatalog } from "@/lib/katalog";
import { formatRupiah } from "@/lib/rupiah";
import { urlGambarAman } from "@/lib/wa";

const POSISI = [
  "left-[0%] top-[8%] z-[1]",
  "left-[12%] top-[48%] z-[2]",
  "right-[0%] top-[10%] z-[1]",
  "right-[14%] top-[50%] z-[3]",
  "left-[34%] top-[0%] z-[2]",
  "right-[32%] top-[2%] z-[2]",
];

export default function Home({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; kategori?: string; urut?: string }>;
}) {
  return (
    <div className="space-y-[72px]">
      <h1 className="sr-only">Jualan teman kampus, dalam satu katalog.</h1>
      <Suspense fallback={<div className="h-[420px]"><p className="sr-only">Memuat beranda</p></div>}>
        <Hero searchParams={searchParams} />
      </Suspense>
      <Suspense fallback={<KerangkaProduk />}>
        <KatalogProduk searchParams={searchParams} beranda />
      </Suspense>
      <Suspense fallback={null}>
        <TokoPilihan />
      </Suspense>
      <Muncul>
        <section className="kartu px-[24px] py-[32px]">
          <h2>Punya usaha? Buka toko gratis di Syamxuanify.</h2>
          <p className="mt-[12px] max-w-xl text-[16px] text-muted-gray">
            Jualan ke teman sekampus, pembeli langsung chat WhatsApp kamu.
          </p>
          <Link href="/daftar" className="btn-sekunder mt-[20px]">
            Buka toko
          </Link>
        </section>
      </Muncul>
    </div>
  );
}

async function Hero({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; kategori?: string; urut?: string }>;
}) {
  const params = await searchParams;
  const kata = bersihkanKata(params.q);
  const kategori = slugAman(params.kategori) ? params.kategori : "";
  const urutan = urutanAman(params.urut);
  const hasil = await ambilKatalog(kata, kategori, urutan);
  const kartu = (await ambilTerlaris(6)).slice(0, 6);

  return (
    <section>
      <div className="relative hidden h-[460px] md:block">
        <p className="pointer-events-none absolute top-1/2 left-1/2 z-10 -translate-x-1/2 -translate-y-1/2 text-center text-[72px] leading-none font-semibold tracking-[-0.05em] text-ink-black">
          Syamxuanify<span className="text-shop-violet">.</span>
        </p>
        {kartu.map((item, indeks) => (
          <KartuMelayang key={item.id} item={item} indeks={indeks} />
        ))}
      </div>
      <div className="md:hidden">
        <p className="text-center text-[40px] leading-none font-semibold tracking-[-0.05em]">
          Syamxuanify<span className="text-shop-violet">.</span>
        </p>
        <div className="mt-[20px] flex gap-[12px] overflow-x-auto pb-[8px]">
          {kartu.map((item) => (
            <div key={item.id} className="w-[168px] shrink-0">
              <KartuIsi item={item} />
            </div>
          ))}
        </div>
      </div>
      <div id="cari" className="mx-auto mt-[28px] max-w-[640px] scroll-mt-28">
        <CariProduk />
      </div>
      {hasil.ok ? (
        <div className="mt-[16px] flex gap-[12px] overflow-x-auto pb-[4px]">
          <Chip href={tautanFilter("/", "", kata, hasil.urutan)} aktif={!hasil.kategoriAktif} slug="semua">
            Semua
          </Chip>
          {hasil.kategori.map((item) => (
            <Chip
              key={item.slug}
              href={tautanFilter("/", item.slug, kata, hasil.urutan)}
              aktif={hasil.kategoriAktif === item.slug}
              slug={item.slug}
            >
              {item.nama}
            </Chip>
          ))}
        </div>
      ) : null}
    </section>
  );
}

function KartuMelayang({
  item,
  indeks,
}: {
  item: Awaited<ReturnType<typeof ambilTerlaris>>[number];
  indeks: number;
}) {
  return (
    <div
      className={`melayang absolute w-[168px] ${POSISI[indeks] ?? POSISI[0]}`}
      style={{ animationDuration: `${4 + (indeks % 3) * 0.8}s`, animationDelay: `${indeks * 0.45}s` }}
    >
      <KartuIsi item={item} />
    </div>
  );
}

function KartuIsi({ item }: { item: Awaited<ReturnType<typeof ambilTerlaris>>[number] }) {
  const gambar = urlGambarAman(item.gambar_url);
  return (
    <article className="kartu">
      <Link href={`/produk/${item.slug}`} className="block">
        <div className="bingkai-foto">
          {gambar ? (
            <img src={gambar} alt="" className="foto-kartu" />
          ) : (
            <PlaceholderProduk kategori={item.kategori?.slug} />
          )}
        </div>
        <span className="flex flex-col gap-[12px] px-[12px] pb-[16px]">
          <span className="line-clamp-2 min-h-[2.4em] text-[14px] font-semibold tracking-[-0.014em]">{item.judul}</span>
          <span className="text-[14px]">{formatRupiah(item.harga)}</span>
          <span className="label-kecil truncate text-muted-gray">{item.toko?.nama_toko}</span>
        </span>
      </Link>
    </article>
  );
}

function Chip({
  href,
  aktif,
  slug,
  children,
}: {
  href: string;
  aktif: boolean;
  slug: string;
  children: string;
}) {
  return (
    <Link href={href} data-active={aktif ? "true" : "false"} className="chip-kategori shrink-0">
      <span className="inline-flex h-[16px] w-[16px] items-center justify-center rounded-full bg-canvas-mist">
        <IkonKategori slug={slug} className="h-[12px] w-[12px]" />
      </span>
      {children}
    </Link>
  );
}

function tautanFilter(dasar: string, kategori: string, kata: string, urutan: UrutanKatalog = "terbaru") {
  const params = new URLSearchParams();
  if (kata) params.set("q", kata);
  if (kategori) params.set("kategori", kategori);
  if (urutan !== "terbaru") params.set("urut", urutan);
  const query = params.toString();
  return query ? `${dasar}?${query}` : dasar;
}

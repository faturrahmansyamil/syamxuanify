import Link from "next/link";
import { BaruMendarat } from "@/components/baru-mendarat";
import { IkonKategori } from "@/components/ikon-kategori";
import { ambilKatalog, ambilTerlaris, bersihkanKata, slugAman, urutanAman, type UrutanKatalog } from "@/lib/katalog";
import { KisiProduk } from "@/components/kisi-produk";
import { LagiTren } from "@/components/lagi-tren";
import { Muncul } from "@/components/muncul";
import { PapanHarian } from "@/components/papan-harian";
import { TopPenjual } from "@/components/top-penjual";
import { TopTerlaris } from "@/components/top-terlaris";
import { ambilTemukan } from "@/lib/temukan";

export async function KatalogProduk({
  searchParams,
  beranda = false,
  dasar = "/",
}: {
  searchParams: Promise<{ q?: string; kategori?: string; urut?: string }>;
  beranda?: boolean;
  dasar?: string;
}) {
  const params = await searchParams;
  const kata = bersihkanKata(params.q);
  const kategori = slugAman(params.kategori) ? params.kategori : "";
  const urutan = urutanAman(params.urut);
  const hasil = await ambilKatalog(kata, kategori, urutan);
  const terlaris = beranda ? await ambilTerlaris(10) : [];
  const temukan = beranda ? await ambilTemukan() : null;

  if (!hasil.ok) {
    return <Kotak judul="Katalog belum bisa dimuat">{hasil.pesan}</Kotak>;
  }

  const kategoriFilter = (
      <div id={beranda ? undefined : "saringan"} className="flex gap-[12px] overflow-x-auto pb-[4px]">
        <Filter href={tautanFilter(dasar, "", kata, hasil.urutan)} aktif={!hasil.kategoriAktif} slug="semua">
          Semua
        </Filter>
        {hasil.kategori.map((item) => (
          <Filter
            key={item.slug}
            href={tautanFilter(dasar, item.slug, kata, hasil.urutan)}
            aktif={hasil.kategoriAktif === item.slug}
            slug={item.slug}
          >
            {item.nama}
          </Filter>
        ))}
      </div>
  );

  const daftar = (
      <section className="space-y-[16px]">
        {beranda ? (
          <h2 className="mb-[24px] inline-flex items-center gap-[4px]">
            Produk Terbaru
          </h2>
        ) : null}
        <div className="flex gap-[12px] overflow-x-auto">
          {URUTAN.map((item) => (
            <Link
              key={item.id}
              href={tautanFilter(dasar, kategori, kata, item.id)}
              data-active={hasil.urutan === item.id ? "true" : "false"}
              className="chip-kategori shrink-0"
            >
              {item.nama}
            </Link>
          ))}
        </div>
        {hasil.produk.length === 0 ? (
          <Kotak judul="Tidak ada produk">
            {kata || hasil.kategoriAktif
              ? "Tidak ada produk yang cocok. Coba kata lain atau pilih kategori Semua."
              : "Belum ada produk yang disetujui."}
          </Kotak>
        ) : (
          <KisiProduk
            produk={hasil.produk}
            kembali={tautanFilter(dasar, kategori, kata, hasil.urutan)}
            kolom={beranda ? "beranda" : "padat"}
          />
        )}
        {beranda ? (
          <Link href="/produk" className="btn-sekunder">
            Lihat semua produk
          </Link>
        ) : null}
      </section>
  );

  if (beranda) {
    return (
      <div id="daftar-produk" className="scroll-mt-28 space-y-[64px]">
        <TopTerlaris produk={terlaris} />
        {temukan ? (
          <PapanHarian hariIni={temukan.hariIni} penjualBaru={temukan.penjualBaru} favorit={temukan.favorit} />
        ) : null}
        {temukan ? <LagiTren kolom={temukan.tren} /> : null}
        {temukan ? <BaruMendarat produk={temukan.baruMendarat} /> : null}
        <Muncul>{daftar}</Muncul>
        {temukan ? <TopPenjual toko={temukan.topPenjual} /> : null}
      </div>
    );
  }

  return (
    <Muncul>
      <div className="scroll-mt-28 space-y-4">
        <h1>Semua produk</h1>
        {kategoriFilter}
        {daftar}
      </div>
    </Muncul>
  );
}

const URUTAN: Array<{ id: UrutanKatalog; nama: string }> = [
  { id: "terbaru", nama: "Terbaru" },
  { id: "terlaris", nama: "Terlaris" },
  { id: "murah", nama: "Harga termurah" },
  { id: "mahal", nama: "Harga termahal" },
];

function tautanFilter(dasar: string, kategori: string, kata: string, urutan: UrutanKatalog = "terbaru") {
  const params = new URLSearchParams();
  if (kata) params.set("q", kata);
  if (kategori) params.set("kategori", kategori);
  if (urutan !== "terbaru") params.set("urut", urutan);
  const query = params.toString();
  return query ? `${dasar}?${query}` : dasar;
}

function Filter({
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
    <Link
      href={href}
      prefetch={true}
      data-active={aktif ? "true" : "false"}
      className="chip-kategori shrink-0"
    >
      <span className="inline-flex h-[16px] w-[16px] items-center justify-center rounded-full bg-canvas-mist">
        <IkonKategori slug={slug} className="h-[12px] w-[12px]" />
      </span>
      {children}
    </Link>
  );
}

function Kotak({ judul, children }: { judul: string; children: string }) {
  return (
    <Muncul>
      <div className="kartu px-[20px] py-[16px]">
        <h3>{judul}</h3>
        <p className="mt-[8px] text-[14px] leading-[1.4] text-muted-gray">{children}</p>
      </div>
    </Muncul>
  );
}

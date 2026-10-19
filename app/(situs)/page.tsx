import { Suspense } from "react";
import { redirect } from "next/navigation";
import { CariProduk } from "@/components/cari-produk";
import { AjakJualan, HeroLapak, JudulLapak, LapakBuka, PapanLaris, UbinKategori } from "@/components/beranda-lapak";
import { KerangkaHalaman } from "@/components/kerangka";
import { KisiProduk } from "@/components/kisi-produk";
import { ambilKatalog, ambilTerlaris, ambilTokoPilihan, ambilUnggulan, type ProdukPublik } from "@/lib/katalog";

export default function Home({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; kategori?: string; urut?: string }>;
}) {
  return (
    <div className="space-y-[48px] md:space-y-[64px]">
      <Suspense fallback={<KerangkaHalaman />}>
        <IsiBeranda searchParams={searchParams} />
      </Suspense>
    </div>
  );
}

async function IsiBeranda({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; kategori?: string; urut?: string }>;
}) {
  const params = await searchParams;
  const query = new URLSearchParams();
  if (params.q) query.set("q", params.q);
  if (params.kategori) query.set("kategori", params.kategori);
  if (params.urut) query.set("urut", params.urut);
  const saring = query.toString();
  if (params.q) {
    const cari = new URLSearchParams();
    cari.set("q", params.q);
    if (params.kategori) cari.set("kategori", params.kategori);
    if (params.urut) cari.set("urut", params.urut);
    redirect(`/cari?${cari.toString()}`);
  }
  if (saring) redirect(`/produk?${saring}`);

  const [katalog, terlaris, toko, unggulan] = await Promise.all([
    ambilKatalog(undefined, undefined, "terbaru"),
    ambilTerlaris(10),
    ambilTokoPilihan(),
    ambilUnggulan(),
  ]);
  const konstelasi = susunKonstelasi(unggulan, katalog.ok ? katalog.produk : []);
  const kosong = katalog.ok && katalog.produk.length === 0;
  const terlarisAsli = terlaris.filter((item) => (item.klikWa ?? 0) > 0);

  const semua = katalog.ok ? katalog.produk : [];

  return (
    <>
      <HeroLapak produk={konstelasi}>
        <CariProduk hidup />
      </HeroLapak>
      {katalog.ok ? <UbinKategori kategori={katalog.kategori} /> : null}
      {semua.length ? (
        <section>
          <JudulLapak judul="Baru dipajang" href="/produk" />
          <KisiProduk produk={semua.slice(0, 8)} kembali="/" kolom="empat" />
        </section>
      ) : null}
      <PapanLaris produk={terlarisAsli} />
      <LapakBuka toko={toko} />
      <AjakJualan kosong={kosong} />
    </>
  );
}

function susunKonstelasi(unggulan: ProdukPublik | null, terbaru: ProdukPublik[]) {
  const dasar: ProdukPublik[] = [];
  if (unggulan) dasar.push(unggulan);
  for (const item of terbaru) {
    if (!dasar.some((ada) => ada.id === item.id)) dasar.push(item);
  }
  return dasar.slice(0, 3);
}

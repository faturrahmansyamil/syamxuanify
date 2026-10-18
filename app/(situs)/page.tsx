import { Suspense } from "react";
import { redirect } from "next/navigation";
import { BaruMendarat } from "@/components/baru-mendarat";
import { CariProduk } from "@/components/cari-produk";
import { EtalaseKosong } from "@/components/etalase-kosong";
import { HeroHidup, type KartuHidup } from "@/components/hero-hidup";
import { IkonKategori } from "@/components/ikon-kategori";
import { JalurChip } from "@/components/jalur-chip";
import { Tombol } from "@/components/tombol";
import { JudulBagian } from "@/components/judul-bagian";
import { KerangkaHalaman } from "@/components/kerangka";
import { KisiProduk } from "@/components/kisi-produk";
import { Muncul } from "@/components/muncul";
import { TopTerlaris } from "@/components/top-terlaris";
import { TokoPilihan } from "@/components/toko-pilihan";
import { ambilKatalog, ambilTerlaris, ambilTokoPilihan, ambilUnggulan, type ProdukPublik } from "@/lib/katalog";
import { ambilTemukan } from "@/lib/temukan";

const BARIS = [
  { slug: "makanan-jajanan", nama: "Makanan & Jajanan" },
  { slug: "produk-digital", nama: "Produk Digital" },
  { slug: "jasa", nama: "Jasa" },
  { slug: "fashion", nama: "Fashion" },
] as const;

const SLOT = [
  { ukuran: "besar", atas: 36, tepi: 0, sisi: "kiri", depth: 0.4, angkat: "-6px", durasi: "5.6s", jeda: "0s", sebarX: -120, sebarY: -50 },
  { ukuran: "sedang", atas: 312, tepi: 8, sisi: "kiri", depth: 0.85, angkat: "-10px", durasi: "4.8s", jeda: "0.7s", sebarX: -180, sebarY: 24 },
  { ukuran: "kecil", atas: 478, tepi: 16, sisi: "kiri", depth: 0.2, angkat: "-8px", durasi: "6.2s", jeda: "1.3s", sebarX: -80, sebarY: 90 },
  { ukuran: "kecil", atas: 36, tepi: 12, sisi: "kanan", depth: 1, angkat: "-7px", durasi: "4.4s", jeda: "0.3s", sebarX: 150, sebarY: -70 },
  { ukuran: "besar", atas: 166, tepi: 0, sisi: "kanan", depth: 0.55, angkat: "-9px", durasi: "5.9s", jeda: "0.9s", sebarX: 190, sebarY: 16 },
  { ukuran: "sedang", atas: 442, tepi: 8, sisi: "kanan", depth: 0.3, angkat: "-6px", durasi: "6.4s", jeda: "1.6s", sebarX: 90, sebarY: 80 },
] as const;

export default function Home({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; kategori?: string; urut?: string }>;
}) {
  return (
    <div className="space-y-[72px]">
      <h1 className="sr-only">Jualan teman kampus, dalam satu katalog.</h1>
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

  const [katalog, terlaris, temukan, toko, unggulan] = await Promise.all([
    ambilKatalog(undefined, undefined, "terbaru"),
    ambilTerlaris(10),
    ambilTemukan(),
    ambilTokoPilihan(),
    ambilUnggulan(),
  ]);
  const konstelasi = susunKonstelasi(unggulan, katalog.ok ? katalog.produk : []);
  const kosong = katalog.ok && katalog.produk.length === 0;
  const terlarisAsli = terlaris.filter((item) => (item.klikWa ?? 0) > 0);

  return (
    <>
      <HeroHidup kartu={susunHero(konstelasi)}>
        <div className="mt-[24px]">
          <CariProduk hidup />
        </div>
        {katalog.ok ? (
          <JalurChip className="mt-[16px]">
            <Tombol href="/produk" chip varian="secondary" className="shrink-0">
              <IkonKategori slug="semua" />
              Semua
            </Tombol>
            {katalog.kategori.map((item) => (
              <Tombol key={item.slug} href={`/kategori/${item.slug}`} chip varian="secondary" className="shrink-0">
                <IkonKategori slug={item.slug} />
                {item.nama}
              </Tombol>
            ))}
          </JalurChip>
        ) : null}
      </HeroHidup>
      {kosong ? (
        <EtalaseKosong
          judul="Belum ada yang jualan. Jadi penjual pertama di kampusmu."
          isi="Buka toko gratis, pasang produk, dan pembeli langsung chat kamu lewat WhatsApp."
          langkah
        />
      ) : null}
      <TopTerlaris produk={terlarisAsli} />
      {katalog.ok
        ? BARIS.map((baris) => {
            const produk = katalog.produk.filter((item) => item.kategori?.slug === baris.slug).slice(0, 4);
            if (produk.length < 4) return null;
            return (
              <Muncul key={baris.slug}>
                <section>
                  <JudulBagian judul={baris.nama} href={`/kategori/${baris.slug}`} />
                  <KisiProduk produk={produk} kembali={`/kategori/${baris.slug}`} kolom="empat" />
                </section>
              </Muncul>
            );
          })
        : null}
      <BaruMendarat produk={temukan.baruMendarat} />
      <Muncul>
        <TokoPilihan toko={toko} />
      </Muncul>
    </>
  );
}

function susunKonstelasi(unggulan: ProdukPublik | null, terbaru: ProdukPublik[]) {
  const dasar: ProdukPublik[] = [];
  if (unggulan) dasar.push(unggulan);
  for (const item of terbaru) {
    if (!dasar.some((ada) => ada.id === item.id)) dasar.push(item);
  }
  if (!dasar.length) return [];
  return Array.from({ length: SLOT.length }, (_, indeks) => dasar[indeks % dasar.length]);
}

function susunHero(daftar: ProdukPublik[]): KartuHidup[] {
  return daftar.map((item, indeks) => {
    const slot = SLOT[indeks] ?? SLOT[0];
    return {
      id: item.id,
      slug: item.slug,
      judul: item.judul,
      gambar: item.gambar_url,
      toko: item.toko?.nama_toko ?? "",
      harga: item.harga,
      kategori: item.kategori?.slug ?? null,
      ukuran: slot.ukuran,
      atas: slot.atas,
      tepi: slot.tepi,
      sisi: slot.sisi,
      depth: slot.depth,
      angkat: slot.angkat,
      durasi: slot.durasi,
      jeda: slot.jeda,
      sebarX: slot.sebarX,
      sebarY: slot.sebarY,
    };
  });
}

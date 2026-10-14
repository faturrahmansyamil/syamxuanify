import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { Bagikan } from "@/components/bagikan";
import { CatatLihat } from "@/components/catat-lihat";
import { GaleriProduk } from "@/components/galeri-produk";
import { GambarQris } from "@/components/gambar-qris";
import { KisiProduk } from "@/components/kisi-produk";
import { LaporRingkas } from "@/components/lapor-ringkas";
import { PanelBeli } from "@/components/panel-beli";
import { PeringatanTransaksi } from "@/components/peringatan-transaksi";
import { TombolFavorit } from "@/components/tombol-favorit";
import { InisialToko, PlaceholderProduk } from "@/components/tampilan";
import { idFavorit } from "@/lib/favorit";
import { ambilProduk, ambilTetangga, penggunaMasuk, type ProdukPublik, type TetanggaProduk } from "@/lib/katalog";
import { createClient } from "@/lib/supabase/server";
import { metadataBagikan, ringkasTeks } from "@/lib/og";
import { fotoPenjual } from "@/lib/contoh-penjual";
import { pesanPesan, tautanWhatsApp, urlGambarAman } from "@/lib/wa";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const hasil = await ambilProduk(slug);
  const produk = hasil.ok && hasil.produk.length === 1 ? hasil.produk[0] : null;
  return metadataBagikan(
    produk?.judul ?? "Produk",
    ringkasTeks(produk?.deskripsi, "Lihat produk ini di Syamxuanify, lalu chat penjual lewat WhatsApp."),
    produk?.gambar_url,
  );
}

export default function HalamanProduk({ params }: { params: Promise<{ slug: string }> }) {
  return (
    <Suspense fallback={<p className="text-sm text-hof">Memuat produk...</p>}>
      <DataProduk params={params} />
    </Suspense>
  );
}

async function DataProduk({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const hasil = await ambilProduk(slug, { lihatAdmin: true });

  if (!hasil.ok) {
    return <p className="rounded-[12px] bg-card p-4 text-sm">{hasil.pesan}</p>;
  }
  if (hasil.produk.length === 0) notFound();

  let disukai = false;
  let tetangga: TetanggaProduk = { foto: [], varian: [], lain: [], serupa: [], jumlahToko: 0 };
  let masuk = false;
  if (hasil.produk.length === 1) {
    const supabase = await createClient();
    const { data } = await supabase.auth.getClaims();
    const userId = typeof data?.claims?.sub === "string" ? data.claims.sub : "";
    const produk = hasil.produk[0];
    const [suka, sekitar, sesi] = await Promise.all([
      idFavorit(supabase, userId, [produk.id]),
      ambilTetangga(produk),
      penggunaMasuk(),
    ]);
    disukai = suka.has(produk.id);
    tetangga = sekitar;
    masuk = sesi;
  }

  return <IsiProduk daftar={hasil.produk} disukai={disukai} tetangga={tetangga} masuk={masuk} />;
}

function IsiProduk({
  daftar,
  disukai,
  tetangga,
  masuk,
}: {
  daftar: ProdukPublik[];
  disukai: boolean;
  tetangga: TetanggaProduk;
  masuk: boolean;
}) {
  if (daftar.length > 1) {
    return (
      <div className="space-y-3">
        <h1 className="text-2xl font-semibold">Ada beberapa produk dengan nama ini</h1>
        {daftar.map((produk) => (
          <Link
            key={produk.id}
            href={`/toko/${produk.toko?.slug ?? ""}`}
            className="block rounded-[12px] bg-card p-4"
          >
            {produk.judul} — {produk.toko?.nama_toko}
          </Link>
        ))}
      </div>
    );
  }

  const produk = daftar[0];
  const toko = produk.toko;
  const qris = toko ? urlGambarAman(toko.qris_url) : null;
  const logo = toko ? fotoPenjual(toko.slug, toko.logo_url) : null;
  const tanya = toko
    ? tautanWhatsApp(toko.no_wa, pesanPesan(toko.nama_toko, produk.judul, 1, produk.harga))
    : null;
  const foto = tetangga.foto;

  return (
    <div className="space-y-10 pb-24 md:pb-0">
      <nav aria-label="Jejak" className="flex flex-wrap items-center gap-1 text-sm text-foggy">
        <Link href="/" className="hover:text-hof">
          Beranda
        </Link>
        <span aria-hidden="true">›</span>
        {produk.kategori ? (
          <Link href={`/?kategori=${produk.kategori.slug}`} className="hover:text-hof">
            {produk.kategori.nama}
          </Link>
        ) : (
          <span>Produk</span>
        )}
        <span aria-hidden="true">›</span>
        <span className="truncate text-hof">{produk.judul}</span>
      </nav>
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)]">
        {foto.length ? <GaleriProduk foto={foto} judul={produk.judul} /> : <PlaceholderProduk kategori={produk.kategori?.slug} />}
        <div className="space-y-4">
          {produk.status && produk.status !== "approved" ? (
            <p className="rounded-[12px] bg-card px-4 py-3 text-sm leading-6 text-hof">
              Produk ini belum tampil di beranda sampai admin menyetujuinya.
            </p>
          ) : null}
          {produk.status === "approved" ? <CatatLihat id={produk.id} /> : null}
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <h1 className="min-w-0 break-words text-[28px] font-bold leading-[1.43] sm:flex-1">{produk.judul}</h1>
            <div className="flex items-center gap-2">
              <TombolFavorit id={produk.id} slug={produk.slug} disukai={disukai} kembali={`/produk/${produk.slug}`} />
              <Bagikan judul={produk.judul} />
            </div>
          </div>
          <PanelBeli
            judul={produk.judul}
            harga={produk.harga}
            terjual={produk.sold_count}
            kondisi={produk.condition}
            stok={produk.stock}
            preorder={produk.preorder_days}
            ukuran={produk.weight_or_size}
            habis={produk.is_available === false}
            varian={tetangga.varian}
            nomor={toko?.no_wa ?? ""}
            namaToko={toko?.nama_toko ?? ""}
          />
          <p className="whitespace-pre-wrap text-sm leading-6 text-hof">
            {produk.deskripsi || "Penjual belum menulis deskripsi."}
          </p>
          {toko ? (
            <div className="rounded-2xl border-2 border-bebe bg-card p-4">
              <div className="flex items-center gap-3">
                {logo ? (
                  <img src={logo} alt="" className="h-12 w-12 rounded-full border-2 border-bebe object-cover" />
                ) : (
                  <InisialToko nama={toko.nama_toko} />
                )}
                <div>
                  <p className="font-extrabold">{toko.nama_toko}</p>
                  <p className="mt-1 flex flex-wrap items-center gap-2 text-sm text-foggy">
                    {toko.terverifikasi ? (
                      <span className="inline-flex rounded-xl bg-langit px-2 py-0.5 text-[11px] font-extrabold text-accent">
                        Terverifikasi
                      </span>
                    ) : null}
                    <span>{tetangga.jumlahToko} produk</span>
                  </p>
                </div>
              </div>
              <div className="mt-4 grid grid-cols-2 gap-2">
                <Link
                  href={`/toko/${toko.slug}`}
                  className="flex h-11 items-center justify-center rounded-full border border-hof text-sm font-semibold text-hof"
                >
                  Lihat Toko
                </Link>
                {tanya ? (
                  <a
                    href={tanya}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex h-11 items-center justify-center rounded-full border border-hof text-sm font-semibold text-hof"
                  >
                    Chat
                  </a>
                ) : (
                  <span className="flex h-11 items-center justify-center text-sm text-foggy">WA belum ada</span>
                )}
              </div>
            </div>
          ) : null}
          {qris ? (
            <GambarQris url={qris} />
          ) : (
            <p className="text-sm font-bold text-foggy">QRIS belum dipasang.</p>
          )}
          <PeringatanTransaksi />
          {toko ? (
            masuk ? (
              <LaporRingkas productId={produk.id} shopId={toko.id} />
            ) : (
              <Link href={`/masuk?selanjutnya=${encodeURIComponent(`/produk/${produk.slug}`)}`} className="text-sm text-foggy underline">
                Laporkan
              </Link>
            )
          ) : null}
        </div>
      </div>
      {tetangga.lain.length > 0 ? (
        <section className="space-y-4">
          <h2 className="text-xl font-semibold">Produk lain dari toko ini</h2>
          <KisiProduk produk={tetangga.lain} kembali={`/produk/${produk.slug}`} />
        </section>
      ) : null}
      {tetangga.serupa.length > 0 ? (
        <section className="space-y-4">
          <h2 className="text-xl font-semibold">Produk serupa</h2>
          <KisiProduk produk={tetangga.serupa} kembali={`/produk/${produk.slug}`} />
        </section>
      ) : null}
    </div>
  );
}

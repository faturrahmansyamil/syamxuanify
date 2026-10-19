import { Tombol } from "@/components/tombol";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { BlokLaporan } from "@/components/blok-laporan";
import { KisiProduk } from "@/components/kisi-produk";
import { Muncul } from "@/components/muncul";
import { InisialToko } from "@/components/tampilan";
import { ambilToko } from "@/lib/katalog";
import { metadataBagikan, ringkasTeks } from "@/lib/og";
import { fotoPenjual } from "@/lib/contoh-penjual";
import { pesanToko, tautanWhatsApp } from "@/lib/wa";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const hasil = await ambilToko(slug);
  const toko = hasil.ok ? hasil.toko : null;
  return metadataBagikan(
    toko?.nama_toko ?? "Toko",
    ringkasTeks(toko?.deskripsi, "Lihat toko ini di Syamxuanify, lalu chat penjual lewat WhatsApp."),
    toko?.logo_url,
  );
}

export default function HalamanToko({ params }: { params: Promise<{ slug: string }> }) {
  return (
    <Suspense fallback={<p className="text-sm text-hof">Memuat toko...</p>}>
      <DataToko params={params} />
    </Suspense>
  );
}

async function DataToko({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const hasil = await ambilToko(slug, { lihatMilik: true, lihatAdmin: true });

  if (!hasil.ok) {
    return <p className="rounded-[12px] bg-card p-[16px] text-sm">{hasil.pesan}</p>;
  }
  if (!hasil.toko) notFound();

  const toko = hasil.toko;
  const logo = fotoPenjual(toko.slug, toko.logo_url);
  const whatsapp = tautanWhatsApp(toko.no_wa, pesanToko(toko.nama_toko));

  return (
    <div className="space-y-[24px]">
      {toko.status !== "approved" ? (
        <p className="rounded-[12px] bg-card px-[16px] py-3 text-sm leading-[1.6] text-hof">
          {toko.status === "rejected"
            ? "Toko ini ditolak dan belum tampil untuk pembeli."
            : "Toko ini belum tampil untuk pembeli. Statusnya masih menunggu persetujuan admin."}
        </p>
      ) : null}
      <Muncul>
      <section className="overflow-hidden rounded-[22px] border-[1.5px] border-[#141210] bg-[#2d5bff] text-white">
        <div className="tenda" aria-hidden="true" />
        <div className="p-[20px] md:p-[32px]">
        <div className="flex items-start gap-[16px]">
          {logo ? (
            <img src={logo} alt={`Foto ${toko.nama_toko}`} className="h-[72px] w-[72px] rounded-[16px] border-[1.5px] border-[#141210] object-cover" />
          ) : (
            <InisialToko nama={toko.nama_toko} className="h-[72px] w-[72px] border-[1.5px] border-[#141210] bg-[#ffd60a]! text-2xl text-[#141210]!" />
          )}
          <div className="min-w-0">
            <h1 className="break-words text-[38px] text-white md:text-[56px]">{toko.nama_toko}</h1>
          </div>
        </div>
        <p className="mt-[16px] max-w-[560px] text-[16px] leading-[1.5] text-white">
          {toko.deskripsi || "Toko ini belum menulis deskripsi."}
        </p>
        {whatsapp ? (
          <Tombol
            href={whatsapp}
            target="_blank"
            rel="noopener noreferrer" varian="primary" ukuran="lg" className="mt-[20px] border-[#141210]! bg-[#00a859]! text-white! shadow-[0_6px_18px_rgba(20,18,16,0.14)] hover:bg-[#141210]!">
            Chat penjual di WhatsApp
          </Tombol>
        ) : null}
        </div>
      </section>
      </Muncul>
      {toko.is_closed ? (
        <p className="rounded-[12px] bg-card px-[16px] py-3 text-sm leading-[1.6] text-hof">Toko ini sedang tutup sementara.</p>
      ) : null}
      <Muncul>
      <section className="space-y-3">
        <h2 className="border-b-[1.5px] border-[#141210] pb-[10px] text-[30px]">Dagangan di lapak ini</h2>
        {hasil.produk.length === 0 ? (
          <p className="rounded-[12px] bg-card p-[16px] text-sm text-foggy">
            Belum ada produk yang disetujui di toko ini.
          </p>
        ) : (
          <KisiProduk produk={hasil.produk} kembali={`/toko/${toko.slug}`} />
        )}
      </section>
      </Muncul>
      <BlokLaporan shopId={toko.id} kembali={`/toko/${toko.slug}`} />
      <Tombol href="/" varian="secondary" ukuran="lg">
        Kembali ke beranda
      </Tombol>
    </div>
  );
}

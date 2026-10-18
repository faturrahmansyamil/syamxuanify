import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { KatalogProduk } from "@/components/katalog-produk";
import { KerangkaProduk } from "@/components/kartu-produk";
import { slugAman } from "@/lib/katalog";

const JUDUL: Record<string, string> = {
  "makanan-jajanan": "Makanan & Jajanan",
  "produk-digital": "Produk Digital",
  jasa: "Jasa",
  fashion: "Fashion",
};

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const nama = JUDUL[slug] ?? "Kategori";
  return {
    title: nama,
    description: `${nama} di Syamxuanify. Chat penjual lewat WhatsApp.`,
  };
}

export default function HalamanKategori({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ q?: string; kategori?: string; urut?: string }>;
}) {
  return (
    <Suspense fallback={<KerangkaProduk />}>
      <IsiKategori params={params} searchParams={searchParams} />
    </Suspense>
  );
}

async function IsiKategori({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ q?: string; kategori?: string; urut?: string }>;
}) {
  const { slug } = await params;
  if (!slugAman(slug)) notFound();
  const gabung = searchParams.then((nilai) => ({ ...nilai, kategori: slug }));
  return <KatalogProduk searchParams={gabung} dasar={`/kategori/${slug}`} />;
}

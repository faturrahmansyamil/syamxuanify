import type { Metadata } from "next";
import { metadataBagikan } from "@/lib/og";
import { Suspense } from "react";
import { KatalogProduk } from "@/components/katalog-produk";
import { KerangkaKatalog } from "@/components/kerangka";

export const metadata: Metadata = metadataBagikan("Cari", "Cari jajanan, produk digital, jasa, dan fashion dari mahasiswa di Syamxuanify.");

export default function HalamanCari({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; kategori?: string; urut?: string }>;
}) {
  return (
    <Suspense fallback={<KerangkaKatalog />}>
      <KatalogProduk searchParams={searchParams} dasar="/cari" />
    </Suspense>
  );
}

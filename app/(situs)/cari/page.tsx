import type { Metadata } from "next";
import { Suspense } from "react";
import { KatalogProduk } from "@/components/katalog-produk";
import { KerangkaKatalog } from "@/components/kerangka";

export const metadata: Metadata = {
  title: "Cari",
  description: "Cari jajanan, jasa, dan fashion di Syamxuanify. Tidak perlu masuk.",
};

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

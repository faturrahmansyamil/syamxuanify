import type { Metadata } from "next";
import { metadataBagikan } from "@/lib/og";
import { Suspense } from "react";
import { KatalogProduk } from "@/components/katalog-produk";
import { KerangkaProduk } from "@/components/kartu-produk";

export const metadata: Metadata = metadataBagikan("Semua produk", "Jajanan, produk digital, jasa, dan fashion dari mahasiswa. Chat penjual lewat WhatsApp, bayar langsung ke penjual.");

export default function HalamanProduk({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; kategori?: string; urut?: string }>;
}) {
  return (
    <Suspense fallback={<KerangkaProduk />}>
      <KatalogProduk searchParams={searchParams} dasar="/produk" />
    </Suspense>
  );
}

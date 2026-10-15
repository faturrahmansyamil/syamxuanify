import type { Metadata } from "next";
import { Suspense } from "react";
import { KatalogProduk } from "@/components/katalog-produk";
import { KerangkaProduk } from "@/components/kartu-produk";

export const metadata: Metadata = {
  title: "Semua produk",
  description: "Daftar produk yang disetujui di Syamxuanify. Chat penjual lewat WhatsApp dan bayar ke QRIS penjual.",
};

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

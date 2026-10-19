import type { Metadata } from "next";
import { metadataBagikan } from "@/lib/og";
import { Suspense } from "react";
import { EtalaseKosong } from "@/components/etalase-kosong";
import { TopPenjual } from "@/components/top-penjual";
import { ambilSemuaToko } from "@/lib/temukan";

export const metadata: Metadata = metadataBagikan("Semua toko", "Daftar toko mahasiswa di Syamxuanify. Buka tokonya, lihat produk, lalu chat penjual lewat WhatsApp.");

export default function HalamanToko() {
  return (
    <Suspense fallback={<p className="text-sm font-medium text-[#000000]">Memuat toko...</p>}>
      <Daftar />
    </Suspense>
  );
}

async function Daftar() {
  const toko = await ambilSemuaToko();
  return (
    <div>
      <h1 className="border-b-[1.5px] border-[#141210] pb-[12px]">Semua lapak</h1>
      {toko.length === 0 ? (
        <div className="mt-[16px]">
          <EtalaseKosong judul="Belum ada toko yang buka." isi="Toko mahasiswa akan muncul di sini. Mau jadi yang pertama?" />
        </div>
      ) : (
        <TopPenjual toko={toko} semua />
      )}
    </div>
  );
}

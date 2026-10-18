import type { Metadata } from "next";
import { Suspense } from "react";
import { TopPenjual } from "@/components/top-penjual";
import { ambilSemuaToko } from "@/lib/temukan";

export const metadata: Metadata = {
  title: "Semua toko",
  description: "Toko mahasiswa yang sudah disetujui di Syamxuanify.",
};

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
      <h1 className="text-2xl font-semibold text-[#000000]">Semua toko</h1>
      {toko.length === 0 ? (
        <p className="kartu mt-[16px] p-5 text-sm font-medium text-[#787574]">Belum ada toko yang disetujui.</p>
      ) : (
        <TopPenjual toko={toko} semua />
      )}
    </div>
  );
}

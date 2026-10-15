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
    <Suspense fallback={<p className="text-sm font-bold text-[#3c3c3c]">Memuat toko...</p>}>
      <Daftar />
    </Suspense>
  );
}

async function Daftar() {
  const toko = await ambilSemuaToko();
  return (
    <div>
      <h1 className="text-2xl font-black text-[#3c3c3c]">Semua toko</h1>
      {toko.length === 0 ? (
        <p className="card-duo mt-4 p-5 text-sm font-bold text-[#777777]">Belum ada toko yang disetujui.</p>
      ) : (
        <TopPenjual toko={toko} semua />
      )}
    </div>
  );
}

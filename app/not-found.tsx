import { Tombol } from "@/components/tombol";
import { BingkaiSitus } from "@/components/bingkai-situs";

export default function TidakDitemukan() {
  return (
    <BingkaiSitus>
      <div className="mx-auto max-w-md rounded-[12px] bg-card p-[24px] text-center">
        <h1 className="text-2xl font-semibold">Halaman tidak ditemukan</h1>
        <p className="mt-2 text-sm leading-6 text-foggy">
          Produk atau toko itu belum ada, atau belum disetujui.
        </p>
        <Tombol href="/" varian="secondary" ukuran="lg" className="mt-5">
          Ke beranda
        </Tombol>
      </div>
    </BingkaiSitus>
  );
}

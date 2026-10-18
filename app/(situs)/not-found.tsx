import { Tombol } from "@/components/tombol";

export default function TidakDitemukan() {
  return (
    <div className="mx-auto max-w-md rounded-[12px] bg-card p-[24px] text-center">
      <h1 className="text-2xl font-semibold">Halaman tidak ditemukan</h1>
      <p className="mt-2 text-sm leading-6 text-foggy">
        Produk atau toko itu belum ada, atau belum disetujui.
      </p>
      <Tombol
        href="/" varian="secondary" ukuran="lg" className="mt-5">
        Ke beranda
      </Tombol>
    </div>
  );
}

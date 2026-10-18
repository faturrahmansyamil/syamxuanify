import { Tombol } from "@/components/tombol";
import type { Metadata } from "next";
import { metadataBagikan } from "@/lib/og";

export const metadata: Metadata = metadataBagikan("Jadi penjual", "Buka toko gratis di Syamxuanify. Pasang produk dan nomor WhatsApp, pembeli langsung chat kamu.");

export default function HalamanJadiPenjual() {
  return (
    <section className="mx-auto max-w-[560px] py-[48px]">
      <h1>Buka toko gratis</h1>
      <p className="mt-[12px] text-[14px] leading-[1.4] text-[#787574]">
        Akun baru mulai sebagai pembeli. Setelah masuk, toko dibuka dari halaman akun.
      </p>
      <div className="mt-[24px] flex flex-wrap gap-[12px]">
        <Tombol href="/daftar" varian="primary" ukuran="lg">
          Daftar
        </Tombol>
        <Tombol href="/akun" varian="secondary" ukuran="lg">
          Sudah punya akun
        </Tombol>
      </div>
    </section>
  );
}

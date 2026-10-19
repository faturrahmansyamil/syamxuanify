import { Tombol } from "@/components/tombol";
import type { Metadata } from "next";
import { metadataBagikan } from "@/lib/og";

export const metadata: Metadata = metadataBagikan("Jadi penjual", "Buka toko gratis di Syamxuanify. Pasang produk dan nomor WhatsApp, pembeli langsung chat kamu.");

const LANGKAH = [
  ["01", "Daftar akun", "Pakai Google atau email. Akun baru mulai sebagai pembeli."],
  ["02", "Buka toko dari halaman akun", "Isi nama toko, nomor WhatsApp, dan QRIS kalau ada."],
  ["03", "Pasang produk", "Foto, harga, deskripsi singkat. Pembeli langsung chat kamu."],
];

export default function HalamanJadiPenjual() {
  return (
    <section className="mx-auto grid max-w-[1040px] items-center gap-[32px] py-[32px] md:grid-cols-[1.1fr_1fr] md:py-[56px]">
      <div>
        <p className="font-bon text-[13px] tracking-[0.16em] text-[#6b645c]">JUALAN DI KAMPUS</p>
        <h1 className="mt-[8px] text-[44px] leading-[1.02] md:text-[60px]">Buka toko gratis.</h1>
        <p className="mt-[16px] max-w-[460px] text-[16px] leading-[1.6] text-[#4a443d]">
          Titip jualan ke teman sekelas sudah biasa. Di sini etalasenya online: pembeli lihat produkmu, lalu chat langsung
          ke WhatsApp kamu. Pembayaran langsung ke kamu, bukan lewat kami.
        </p>
        <div className="mt-[24px] flex flex-wrap gap-[12px]">
          <Tombol href="/daftar" varian="primary" ukuran="lg" className="border-[#141210]! bg-[#ff3b1f]! text-white! hover:bg-[#141210]!">
            Daftar sekarang
          </Tombol>
          <Tombol href="/akun" varian="secondary" ukuran="lg">
            Sudah punya akun
          </Tombol>
        </div>
      </div>
      <div className="harga-besar w-full max-w-[420px] justify-self-center md:justify-self-end">
        <ol className="bon gap-0!">
          <li className="bon-baris">
            <span>LANGKAH</span>
            <span>GRATIS</span>
          </li>
          {LANGKAH.map(([no, judul, isi]) => (
            <li key={no} className="flex gap-[12px] border-b-[1.5px] border-dashed border-[#1c1a17] py-[12px] last:border-b-0">
              <span className="text-[13px] font-normal text-[#6b645c]">{no}</span>
              <span>
                <span className="block text-[17px]">{judul}</span>
                <span className="mt-[2px] block text-[13px] leading-[1.45] font-normal">{isi}</span>
              </span>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

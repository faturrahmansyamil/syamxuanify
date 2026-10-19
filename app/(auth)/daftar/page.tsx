import { metadataBagikan } from "@/lib/og";
import Link from "next/link";
import { KartuAuth } from "@/components/kartu-auth";
import { FormDaftar } from "@/components/form-daftar";

export const metadata = metadataBagikan("Daftar", "Bikin akun Syamxuanify gratis, lalu buka toko dari halaman akun.");

export default function HalamanDaftar() {
  return (
    <KartuAuth
      judul="Bikin akun gratis"
      sub="Gratis. Mulai sebagai pembeli, buka toko kapan saja."
      bawah={
        <>
          Sudah punya akun?{" "}
          <Link href="/masuk" className="font-bold text-[#141210] underline decoration-2 underline-offset-4 hover:text-[#ff3b1f]">
            Masuk
          </Link>
        </>
      }
      anak={<FormDaftar />}
    />
  );
}

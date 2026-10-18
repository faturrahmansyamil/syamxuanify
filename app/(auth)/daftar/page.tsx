import Link from "next/link";
import { KartuAuth } from "@/components/kartu-auth";
import { FormDaftar } from "@/components/form-daftar";

export const metadata = {
  title: "Daftar",
};

export default function HalamanDaftar() {
  return (
    <KartuAuth
      judul="Bikin akun gratis"
      sub="Gratis untuk mahasiswa."
      bawah={
        <>
          Sudah punya akun?{" "}
          <Link href="/masuk" className="text-ink-black">
            Masuk
          </Link>
        </>
      }
      anak={<FormDaftar />}
    />
  );
}

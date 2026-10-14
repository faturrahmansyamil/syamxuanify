import Link from "next/link";
import { Suspense } from "react";
import { KartuAuth } from "@/components/kartu-auth";
import { FormMasuk } from "@/components/form-masuk";
import { tautanAman } from "@/lib/tujuan";

export const metadata = {
  title: "Masuk",
};

export default function HalamanMasuk({
  searchParams,
}: {
  searchParams: Promise<{ galat?: string; selanjutnya?: string }>;
}) {
  return (
    <KartuAuth
      judul="Masuk dulu, Syam-ers."
      bawah={
        <>
          Belum punya akun?{" "}
          <Link href="/daftar" className="underline">
            Daftar
          </Link>
        </>
      }
      anak={
        <Suspense fallback={<p className="text-sm text-hof">Memuat formulir...</p>}>
          <IsiMasuk searchParams={searchParams} />
        </Suspense>
      }
    />
  );
}

async function IsiMasuk({
  searchParams,
}: {
  searchParams: Promise<{ galat?: string; selanjutnya?: string }>;
}) {
  const { galat, selanjutnya } = await searchParams;
  const tujuan = tautanAman(selanjutnya);

  return (
    <>
      {galat === "konfirmasi" ? (
        <p role="alert" className="mb-4 rounded-[10px] border-2 border-garis bg-red-50 px-3 py-2 text-sm text-red-700">
          Tautan konfirmasi tidak berlaku. Coba daftar lagi atau masuk kalau akunnya sudah aktif.
        </p>
      ) : null}
      <FormMasuk selanjutnya={tujuan} />
    </>
  );
}

import { metadataBagikan } from "@/lib/og";
import Link from "next/link";
import { Suspense } from "react";
import { KartuAuth } from "@/components/kartu-auth";
import { FormMasuk } from "@/components/form-masuk";
import { tautanAman } from "@/lib/tujuan";

export const metadata = metadataBagikan("Masuk", "Masuk ke akun Syamxuanify untuk menyimpan favorit dan mengelola toko.");

export default function HalamanMasuk({
  searchParams,
}: {
  searchParams: Promise<{ galat?: string; selanjutnya?: string }>;
}) {
  return (
    <KartuAuth
      judul="Masuk ke Syamxuanify"
      sub="Pakai akun Google atau email yang sudah terdaftar."
      bawah={
        <>
          Belum punya akun?{" "}
          <Link href="/daftar" className="font-bold text-[#141210] underline decoration-2 underline-offset-4 hover:text-[#ff3b1f]">
            Daftar
          </Link>
        </>
      }
      anak={
        <Suspense fallback={<p className="text-[14px] text-ink-black">Memuat formulir...</p>}>
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
        <p role="alert" className="mb-[16px] text-[14px] teks-galat">
          Tautan konfirmasi tidak berlaku. Coba daftar lagi atau masuk kalau akunnya sudah aktif.
        </p>
      ) : null}
      <FormMasuk selanjutnya={tujuan} />
    </>
  );
}

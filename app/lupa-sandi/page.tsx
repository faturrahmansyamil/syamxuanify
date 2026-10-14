import Link from "next/link";
import { Suspense } from "react";
import { FormLupaSandi } from "@/components/form-lupa-sandi";
import { Muncul } from "@/components/muncul";

export const metadata = {
  title: "Lupa password",
};

export default function HalamanLupaSandi({
  searchParams,
}: {
  searchParams: Promise<{ galat?: string }>;
}) {
  return (
    <Muncul>
    <section className="mx-auto w-full max-w-md rounded-[12px] border border-bebe bg-card p-5 sm:p-8">
      <h1 className="text-2xl font-semibold tracking-tight">Lupa password</h1>
      <p className="mt-2 text-sm leading-6 text-foggy">
        Masukkan email akunmu. Kami kirim tautan untuk membuat kata sandi baru.
      </p>
      <div className="mt-6">
        <Suspense fallback={null}>
          <PesanGalat searchParams={searchParams} />
        </Suspense>
        <FormLupaSandi />
      </div>
      <p className="mt-6 text-sm">
        Ingat kata sandinya?{" "}
        <Link href="/masuk" className="font-semibold text-hof hover:underline">
          Masuk
        </Link>
      </p>
    </section>
    </Muncul>
  );
}

async function PesanGalat({ searchParams }: { searchParams: Promise<{ galat?: string }> }) {
  const { galat } = await searchParams;
  if (galat !== "tautan") return null;

  return (
    <p role="alert" className="mb-4 rounded-xl bg-red-50 px-3 py-2 text-sm text-red-700">
      Tautan ganti password tidak berlaku atau sudah kedaluwarsa. Kirim ulang dari sini.
    </p>
  );
}

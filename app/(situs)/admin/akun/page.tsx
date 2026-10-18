import type { Metadata } from "next";
import { Suspense } from "react";
import { FormGantiSandi } from "@/components/form-ganti-sandi";
import { Muncul } from "@/components/muncul";
import { klienAdmin } from "@/lib/panel-admin";

export const metadata: Metadata = { title: "Akun Admin" };

export default function HalamanAkunAdmin() {
  return (
    <Suspense fallback={<p className="text-sm text-hof">Memuat akun...</p>}>
      <Isi />
    </Suspense>
  );
}

async function Isi() {
  const hasil = await klienAdmin();
  if (!hasil.ok) return <p className="rounded-[12px] bg-card p-[16px] text-sm">{hasil.pesan}</p>;

  return (
    <Muncul>
    <section className="mx-auto max-w-2xl space-y-[16px] rounded-[12px] border border-bebe bg-card p-5">
      <div>
        <h1 className="text-2xl font-semibold">Akun Admin</h1>
        <p className="mt-2 text-sm leading-6 text-foggy">Ganti kata sandi akun ini. Keluar ada di bawah menu.</p>
      </div>
      <FormGantiSandi teksSukses="Tersimpan" rataKanan />
    </section>
    </Muncul>
  );
}

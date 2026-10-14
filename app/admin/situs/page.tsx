import type { Metadata } from "next";
import { Suspense } from "react";
import { FormSitus } from "@/components/form-situs";
import { klienAdmin } from "@/lib/panel-admin";
import { ambilSitus } from "@/lib/situs";

export const metadata: Metadata = { title: "Info Situs" };

export default function HalamanSitus() {
  return (
    <Suspense fallback={<p className="text-sm text-hof">Memuat info situs...</p>}>
      <Isi />
    </Suspense>
  );
}

async function Isi() {
  const hasil = await klienAdmin();
  if (!hasil.ok) return <p className="rounded-[12px] bg-card p-4 text-sm">{hasil.pesan}</p>;
  const situs = await ambilSitus();
  return (
    <div className="mx-auto max-w-2xl">
      <FormSitus situs={situs} />
    </div>
  );
}

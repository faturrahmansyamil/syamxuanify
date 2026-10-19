import type { Metadata } from "next";
import { metadataBagikan } from "@/lib/og";
import { Suspense } from "react";
import { Muncul } from "@/components/muncul";
import { ambilSitus } from "@/lib/situs";

export const metadata: Metadata = metadataBagikan("Tentang", "Syamxuanify adalah etalase mahasiswa kampus. Chat penjual di WhatsApp dan bayar langsung ke penjual.");

export default function HalamanTentang() {
  return (
    <Suspense fallback={<p className="text-sm text-hof">Memuat...</p>}>
      <IsiTentang />
    </Suspense>
  );
}

async function IsiTentang() {
  const situs = await ambilSitus();
  const wa = situs.no_wa ? `https://wa.me/${situs.no_wa}` : null;

  return (
    <article className="mx-auto max-w-3xl space-y-[24px]">
      <header className="space-y-2">
        <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">Tentang {situs.nama_situs}</h1>
        <p className="text-sm leading-[1.6] text-hof">{situs.tagline}</p>
        <p className="text-sm leading-[1.6] text-hof">
          Kamu bisa melihat jajanan, jasa, fashion, dan produk digital, lalu chat penjualnya di WhatsApp.
          Pembayaran dilakukan ke QRIS penjual. {situs.nama_situs} tidak memproses pembayaran.
        </p>
      </header>
      <Muncul>
      <section className="space-y-2 rounded-[12px] bg-card p-5">
        <h2 className="text-lg font-semibold">Kontak admin</h2>
        <p className="text-sm leading-[1.6]">
          Ada pertanyaan atau laporan? Email admin di{" "}
          <a href={`mailto:${situs.email_kontak}`} className="font-semibold break-all text-hof hover:underline">
            {situs.email_kontak}
          </a>
          .
        </p>
        {wa ? (
          <p className="text-sm leading-[1.6]">
            Atau chat lewat{" "}
            <a href={wa} className="font-semibold text-hof hover:underline">
              WhatsApp admin
            </a>
            .
          </p>
        ) : null}
      </section>
      </Muncul>
    </article>
  );
}

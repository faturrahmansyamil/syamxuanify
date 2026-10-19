import { Tombol } from "@/components/tombol";
import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { Muncul } from "@/components/muncul";
import { ambilRingkasan, klienAdmin } from "@/lib/panel-admin";

export const metadata: Metadata = { title: "Ringkasan" };

export default function HalamanRingkasan() {
  return (
    <Suspense fallback={<p className="text-sm text-hof">Memuat ringkasan...</p>}>
      <Isi />
    </Suspense>
  );
}

async function Isi() {
  const hasil = await klienAdmin();
  if (!hasil.ok) return <p className="rounded-[12px] bg-card p-[16px] text-sm">{hasil.pesan}</p>;
  const data = await ambilRingkasan(hasil.supabase);
  const kartu = [
    { angka: data.toko, label: "Total toko" },
    { angka: data.produk, label: "Total produk" },
    { angka: data.pengguna, label: "Total pengguna" },
    { angka: data.tokoTunggu, label: "Toko menunggu" },
    { angka: data.produkTunggu, label: "Produk menunggu" },
    { angka: data.laporan, label: "Laporan baru" },
  ];

  return (
    <div className="space-y-[24px]">
      <header>
        <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">Ringkasan</h1>
        <p className="mt-2 text-sm leading-[1.6] text-foggy">Kondisi situs dan hal yang perlu dicek.</p>
      </header>
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-3">
        {kartu.map((item) => (
          <div key={item.label} className="rounded-[12px] border border-bebe bg-card p-[16px]">
            <p className="text-2xl font-semibold text-hof">{item.angka}</p>
            <p className="mt-1 text-sm text-foggy">{item.label}</p>
          </div>
        ))}
      </div>
      <div className="flex flex-wrap gap-2">
        <Tombol href="/admin/persetujuan" varian="secondary" ukuran="lg">
          Ke persetujuan
        </Tombol>
        <Tombol href="/admin/laporan" varian="secondary" ukuran="lg">
          Ke laporan
        </Tombol>
      </div>
      <Muncul>
      <section className="rounded-[12px] border border-bebe bg-card p-[16px]">
        <h2 className="text-lg font-semibold">Aktivitas terbaru</h2>
        {data.aktivitas.length === 0 ? (
          <p className="mt-3 text-sm text-foggy">Belum ada aktivitas.</p>
        ) : (
          <ul className="mt-3 space-y-2">
            {data.aktivitas.map((item) => (
              <li key={item.id}>
                <Link href={item.href} className="block truncate text-sm text-hof hover:underline">
                  {item.teks}
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>
      </Muncul>
    </div>
  );
}

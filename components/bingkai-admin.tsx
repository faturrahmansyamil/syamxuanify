"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState, type ReactNode } from "react";
import { keluar } from "@/app/actions/auth";

const GRUP = [
  { judul: "Utama", item: [{ href: "/admin", nama: "Ringkasan" }] },
  {
    judul: "Moderasi",
    item: [
      { href: "/admin/persetujuan", nama: "Persetujuan", badge: "persetujuan" as const },
      { href: "/admin/laporan", nama: "Laporan", badge: "laporan" as const },
      { href: "/admin/verifikasi", nama: "Verifikasi Toko" },
    ],
  },
  {
    judul: "Data",
    item: [
      { href: "/admin/toko", nama: "Toko" },
      { href: "/admin/produk", nama: "Produk" },
      { href: "/admin/pengguna", nama: "Pengguna" },
      { href: "/admin/kategori", nama: "Kategori" },
    ],
  },
  {
    judul: "Situs",
    item: [
      { href: "/admin/situs", nama: "Info Situs" },
      { href: "/admin/pengumuman", nama: "Pengumuman" },
      { href: "/admin/moderasi", nama: "Moderasi" },
    ],
  },
  { judul: "Akun", item: [{ href: "/admin/akun", nama: "Akun Admin" }] },
];

export function BingkaiAdmin({
  persetujuan,
  laporan,
  children,
}: {
  persetujuan: number;
  laporan: number;
  children: ReactNode;
}) {
  const jalur = usePathname();
  const [buka, setBuka] = useState(false);
  const angka = { persetujuan, laporan };

  useEffect(() => {
    setBuka(false);
  }, [jalur]);

  return (
    <div className="md:grid md:grid-cols-[15rem_minmax(0,1fr)] md:items-start md:gap-8">
      <button
        type="button"
        onClick={() => setBuka(true)}
        className="btn-duo mb-4 inline-flex items-center md:hidden"
      >
        Menu
      </button>
      {buka ? (
        <button type="button" aria-label="Tutup menu" className="fixed inset-0 z-30 bg-black/40 md:hidden" onClick={() => setBuka(false)} />
      ) : null}
      <aside
        className={`${buka ? "fixed inset-y-0 left-0 z-40 flex w-[min(100%,18rem)]" : "hidden md:flex"} flex-col rounded-[12px] border border-bebe bg-card p-4 md:sticky md:top-24 md:max-h-[calc(100vh-7rem)]`}
      >
        <div className="mb-4 flex items-center justify-between md:hidden">
          <p className="text-sm font-semibold">Menu admin</p>
          <button type="button" onClick={() => setBuka(false)} className="text-sm font-medium text-hof">
            Tutup
          </button>
        </div>
        <nav className="min-h-0 flex-1 space-y-5 overflow-y-auto">
          {GRUP.map((grup) => (
            <div key={grup.judul}>
              <p className="px-3 text-xs font-semibold uppercase tracking-wide text-foggy">{grup.judul}</p>
              <ul className="mt-1 space-y-1">
                {grup.item.map((item) => {
                  const dipilih = item.href === "/admin" ? jalur === "/admin" : jalur === item.href || jalur.startsWith(`${item.href}/`);
                  const jumlah = item.badge ? angka[item.badge] : 0;
                  return (
                    <li key={item.href}>
                      <Link
                        href={item.href}
                        className={`flex items-center justify-between gap-2 rounded-lg px-3 py-2 text-sm ${
                          dipilih ? "bg-fill font-semibold text-on-fill" : "text-hof hover:bg-faint"
                        }`}
                      >
                        <span>{item.nama}</span>
                        {jumlah > 0 ? (
                          <span className="inline-flex min-w-5 items-center justify-center rounded-full bg-black px-1.5 text-xs font-semibold text-white">
                            {jumlah}
                          </span>
                        ) : null}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </nav>
        <form action={keluar} className="mt-4 border-t border-bebe pt-4">
          <button type="submit" className="text-sm font-medium text-hof hover:underline">
            Keluar
          </button>
        </form>
      </aside>
      <div className="min-w-0">{children}</div>
    </div>
  );
}

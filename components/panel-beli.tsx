"use client";

import { useMemo, useState } from "react";
import { formatRupiah } from "@/lib/rupiah";
import type { VarianEtalase } from "@/lib/katalog";
import { pesanPesan, tautanWhatsApp } from "@/lib/wa";

export function PanelBeli({
  judul,
  harga,
  terjual,
  kondisi,
  stok,
  preorder,
  ukuran,
  habis,
  varian,
  nomor,
  namaToko,
}: {
  judul: string;
  harga: number;
  terjual?: number;
  kondisi?: "baru" | "bekas";
  stok?: number | null;
  preorder?: number | null;
  ukuran?: string | null;
  habis: boolean;
  varian: VarianEtalase[];
  nomor: string;
  namaToko: string;
}) {
  const [dipilih, setDipilih] = useState<string | null>(varian.length === 1 ? varian[0].id : null);
  const [jumlah, setJumlah] = useState(1);
  const varianAktif = varian.find((item) => item.id === dipilih) ?? null;
  const sumber = varianAktif && typeof varianAktif.stock === "number" ? varianAktif.stock : stok;
  const terbatas = habis || typeof sumber === "number";
  const batas = habis ? 0 : typeof sumber === "number" ? sumber : 99;
  const jumlahAman = Math.min(Math.max(1, jumlah), Math.max(batas, 1));
  const satuan = varianAktif?.harga ?? harga;
  const total = satuan * (batas === 0 ? 0 : jumlahAman);
  const wajibVarian = varian.length > 0 && !varianAktif;
  const bisaPesan = Boolean(nomor) && batas > 0 && !wajibVarian;
  const tautan = useMemo(() => {
    if (!bisaPesan) return null;
    return tautanWhatsApp(nomor, pesanPesan(namaToko, judul, jumlahAman, total, varianAktif?.nama));
  }, [bisaPesan, nomor, namaToko, judul, jumlahAman, total, varianAktif?.nama]);

  const teksHarga = useMemo(() => {
    if (varianAktif) return formatRupiah(satuan);
    const angka = [harga, ...varian.map((item) => item.harga ?? harga)];
    const rendah = Math.min(...angka);
    const tinggi = Math.max(...angka);
    return rendah === tinggi ? formatRupiah(rendah) : `${formatRupiah(rendah)} – ${formatRupiah(tinggi)}`;
  }, [varianAktif, satuan, harga, varian]);

  const teksStok = !terbatas ? null : batas <= 0 ? "Habis" : batas <= 5 ? `Sisa ${batas}!` : `Stok: ${batas}`;

  const tombol = bisaPesan && tautan ? (
    <a
      href={tautan}
      target="_blank"
      rel="noopener noreferrer"
      className="btn-duo flex w-full items-center justify-center"
    >
      Chat WhatsApp
    </a>
  ) : (
    <button
      type="button"
      disabled
      className="flex h-12 w-full cursor-not-allowed items-center justify-center rounded-full bg-faint text-sm font-medium text-hof"
    >
      {wajibVarian ? "Pilih varian dulu" : "Chat WhatsApp"}
    </button>
  );

  return (
    <div className="space-y-4">
      <p className="text-4xl font-extrabold leading-none text-accent">{teksHarga}</p>
      <div className="flex flex-wrap items-center gap-2 text-sm">
        {typeof terjual === "number" ? <span className="text-foggy">{terjual} terjual</span> : null}
        {kondisi ? (
          <span className="rounded-full bg-faint px-2 py-0.5 text-xs font-medium text-hof">
            {kondisi === "bekas" ? "Bekas" : "Baru"}
          </span>
        ) : null}
        {teksStok ? (
          <span className={batas === 0 ? "font-semibold text-hof" : "text-hof"}>{teksStok}</span>
        ) : null}
        {preorder ? <span className="text-foggy">Pre-order {preorder} hari</span> : null}
      </div>
      {ukuran ? <p className="text-sm text-foggy">{ukuran}</p> : null}
      {varian.length > 0 ? (
        <div className="space-y-2">
          <p className="text-sm font-medium">Pilih varian</p>
          <div className="flex flex-wrap gap-2">
            {varian.map((item) => {
              const habisVarian = item.stock === 0;
              const aktif = item.id === dipilih;
              return (
                <button
                  key={item.id}
                  type="button"
                  disabled={habisVarian}
                  aria-pressed={aktif}
                  onClick={() => {
                    setDipilih(item.id);
                    const batasBaru = typeof item.stock === "number" ? item.stock : typeof stok === "number" ? stok : 99;
                    setJumlah((nilai) => Math.min(Math.max(1, nilai), Math.max(batasBaru, 1)));
                  }}
                  data-active={aktif ? "true" : "false"}
                  className="chip-duo disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {item.nama}
                  {item.harga != null ? ` · ${formatRupiah(item.harga)}` : ""}
                </button>
              );
            })}
          </div>
        </div>
      ) : null}
      <div className="flex items-center gap-3">
        <p className="text-sm font-medium">Jumlah</p>
        <button
          type="button"
          aria-label="Kurangi"
          disabled={jumlahAman <= 1 || batas === 0}
          onClick={() => setJumlah(jumlahAman - 1)}
          className="btn-duo-white inline-flex items-center justify-center disabled:opacity-40"
        >
          −
        </button>
        <span className="min-w-6 text-center text-sm font-semibold">{batas === 0 ? 0 : jumlahAman}</span>
        <button
          type="button"
          aria-label="Tambah"
          disabled={batas === 0 || jumlahAman >= batas}
          onClick={() => setJumlah(jumlahAman + 1)}
          className="btn-duo-white inline-flex items-center justify-center disabled:opacity-40"
        >
          +
        </button>
        {batas > 0 ? <span className="text-sm text-foggy">Total {formatRupiah(total)}</span> : null}
      </div>
      <div className="hidden md:block">{tombol}</div>
      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-bebe bg-card p-3 md:hidden">{tombol}</div>
    </div>
  );
}

"use client";

import { useMemo, useState } from "react";
import { catatKlikWa } from "@/app/actions/klik";
import { Tombol } from "@/components/tombol";
import { formatRupiah } from "@/lib/rupiah";
import type { VarianEtalase } from "@/lib/katalog";
import { pesanPesan, tautanWhatsApp } from "@/lib/wa";

export function PanelBeli({
  id,
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
  id: string;
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
    <Tombol
      href={tautan}
      target="_blank"
      rel="noopener noreferrer"
      onClick={() => {
        void catatKlikWa(id);
      }}
      varian="primary"
      ukuran="lg"
      className="w-full border-[#141210]! bg-[#00a859]! text-white! shadow-[0_6px_18px_rgba(20,18,16,0.14)] hover:bg-[#141210]! md:w-auto"
    >
      Chat penjual di WhatsApp
    </Tombol>
  ) : (
    <Tombol type="button" disabled varian="primary" ukuran="lg" className="w-full md:w-auto">
      {wajibVarian ? "Pilih varian dulu" : "Chat WhatsApp"}
    </Tombol>
  );

  return (
    <div className="space-y-[16px]">
      <div className="harga-besar">
        <div className="bon">
          <span className="bon-baris">
            <span>HARGA</span>
            <span>{varian.length > 0 && !varianAktif ? "mulai" : "Rp"}</span>
          </span>
          <span className="bon-total">{teksHarga}</span>
          <span className="bon-kecil">bayar ke QRIS penjual</span>
        </div>
      </div>
      <div className="flex flex-wrap items-center gap-2 text-sm">
        {typeof terjual === "number" ? <span className="text-foggy">{terjual} terjual</span> : null}
        {kondisi ? (
          <span className="rounded-[6px] border-[1.5px] border-[#141210] bg-white px-2 py-0.5 text-xs font-bold text-[#141210]">
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
                <Tombol
                  key={item.id}
                  type="button"
                  disabled={habisVarian}
                  aria-pressed={aktif}
                  onClick={() => {
                    setDipilih(item.id);
                    const batasBaru = typeof item.stock === "number" ? item.stock : typeof stok === "number" ? stok : 99;
                    setJumlah((nilai) => Math.min(Math.max(1, nilai), Math.max(batasBaru, 1)));
                  }}
                  chip
                  varian={aktif ? "primary" : "secondary"}
                >
                  {item.nama}
                  {item.harga != null ? ` · ${formatRupiah(item.harga)}` : ""}
                </Tombol>
              );
            })}
          </div>
        </div>
      ) : null}
      <div className="flex items-center gap-3">
        <p className="text-sm font-medium">Jumlah</p>
        <Tombol
          type="button"
          aria-label="Kurangi"
          disabled={jumlahAman <= 1 || batas === 0}
          onClick={() => setJumlah(jumlahAman - 1)}
          ikon
          ukuran="sm"
          varian="secondary"
        >
          −
        </Tombol>
        <span className="min-w-[24px] text-center text-sm font-semibold">{batas === 0 ? 0 : jumlahAman}</span>
        <Tombol
          type="button"
          aria-label="Tambah"
          disabled={batas === 0 || jumlahAman >= batas}
          onClick={() => setJumlah(jumlahAman + 1)}
          ikon
          ukuran="sm"
          varian="secondary"
        >
          +
        </Tombol>
        {batas > 0 ? <span className="text-sm text-foggy">Total {formatRupiah(total)}</span> : null}
      </div>
      <div className="hidden md:block">{tombol}</div>
      <div className="bar-wa-hp fixed inset-x-0 bottom-[calc(73px+max(8px,env(safe-area-inset-bottom)))] z-40 border-t border-bebe bg-card p-3 md:hidden">{tombol}</div>
    </div>
  );
}

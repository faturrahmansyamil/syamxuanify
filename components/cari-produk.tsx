"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { cariLangsung } from "@/app/actions/cari";
import type { SaranCari } from "@/lib/temukan";
import { formatRupiah } from "@/lib/rupiah";

const CHIP = [
  { nama: "Terbaru", href: "/produk" },
  { nama: "Terlaris", href: "/produk?urut=terlaris" },
  { nama: "Jajanan", href: "/produk?kategori=makanan-jajanan" },
  { nama: "Produk Digital", href: "/produk?kategori=produk-digital" },
  { nama: "Jasa", href: "/produk?kategori=jasa" },
  { nama: "Fashion", href: "/produk?kategori=fashion" },
];

const KOSONG: SaranCari = { produk: [], toko: [] };

export function CariProduk() {
  const params = useSearchParams();
  const awal = params.get("q") ?? "";
  const kategori = params.get("kategori") ?? "";
  const bungkus = useRef<HTMLDivElement>(null);
  const [buka, setBuka] = useState(false);
  const [teks, setTeks] = useState(awal);
  const [saran, setSaran] = useState<SaranCari>(KOSONG);
  const [status, setStatus] = useState<"diam" | "memuat" | "selesai">("diam");

  useEffect(() => {
    setTeks(awal);
  }, [awal]);

  useEffect(() => {
    const kata = teks.trim();
    if (!buka || kata.length < 1) {
      setSaran(KOSONG);
      setStatus("diam");
      return;
    }
    setStatus("memuat");
    let batal = false;
    const timer = window.setTimeout(() => {
      void cariLangsung(kata).then((hasil) => {
        if (batal) return;
        setSaran(hasil);
        setStatus("selesai");
      });
    }, 300);
    return () => {
      batal = true;
      window.clearTimeout(timer);
    };
  }, [teks, buka]);

  useEffect(() => {
    if (!buka) return;
    function tutupTombol(event: KeyboardEvent) {
      if (event.key === "Escape") setBuka(false);
    }
    function tutupLuar(event: PointerEvent) {
      if (!bungkus.current?.contains(event.target as Node)) setBuka(false);
    }
    document.addEventListener("keydown", tutupTombol);
    document.addEventListener("pointerdown", tutupLuar);
    return () => {
      document.removeEventListener("keydown", tutupTombol);
      document.removeEventListener("pointerdown", tutupLuar);
    };
  }, [buka]);

  const adaSaran = saran.produk.length > 0 || saran.toko.length > 0;

  return (
    <div ref={bungkus} className={buka ? "relative z-30" : "relative"}>
      <form key={awal} action="/" method="get" className="cari-pill">
        <label htmlFor="q" className="sr-only">
          Cari produk
        </label>
        <input
          id="q"
          name="q"
          value={teks}
          onChange={(event) => {
            setTeks(event.target.value);
            setBuka(true);
          }}
          onClick={() => setBuka(true)}
          onFocus={() => setBuka(true)}
          placeholder="Cari jajanan, jasa, fashion..."
          aria-expanded={buka}
          aria-controls="panel-cari"
          autoComplete="off"
          className="h-[48px] min-w-0 flex-1 bg-transparent text-[16px] text-ink-black placeholder:text-muted-gray"
        />
        {kategori ? <input type="hidden" name="kategori" value={kategori} /> : null}
        <button type="submit" aria-label="Cari" className="tombol-cari">
          <svg viewBox="0 0 24 24" className="h-[20px] w-[20px]" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="2.2">
            <path d="M5 12h12M13 6l6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
      </form>
      {buka ? (
        <div id="panel-cari" className="kartu absolute top-[calc(100%+8px)] right-0 left-0 z-30 max-h-[70vh] overflow-y-auto px-[16px] py-[12px]">
          <p className="text-xs font-black text-[#1e40af]">Lagi tren</p>
          <div className="mt-2 flex flex-wrap gap-2">
            {CHIP.map((item) => (
              <Link key={item.nama} href={item.href} className="chip-duo" onClick={() => setBuka(false)}>
                {item.nama}
              </Link>
            ))}
          </div>
          {teks.trim().length > 0 ? (
            <div className="mt-3 border-t-2 border-[#e5e5e5] pt-3">
              {status === "memuat" && !adaSaran ? <p className="text-sm font-bold text-[#4b4b4b]">Mencari...</p> : null}
              {status === "selesai" && !adaSaran ? <p className="text-sm font-bold text-[#4b4b4b]">Tidak ada yang cocok.</p> : null}
              {saran.produk.length > 0 ? (
                <div>
                  <p className="px-1 text-xs font-black text-[#1e40af]">Produk</p>
                  {saran.produk.map((item) => (
                    <Link key={item.id} href={`/produk/${item.slug}`} onClick={() => setBuka(false)} className="mt-1 flex min-h-11 min-w-0 items-center gap-2 rounded-xl px-1 py-2">
                      {item.gambar ? (
                        <img src={item.gambar} alt="" className="h-10 w-10 shrink-0 rounded-lg object-cover" />
                      ) : (
                        <span className="inline-block h-10 w-10 shrink-0 rounded-lg bg-[#dbeafe]" />
                      )}
                      <span className="min-w-0">
                        <span className="block truncate text-sm font-bold text-[#3c3c3c]">{item.judul}</span>
                        <span className="block truncate text-xs font-bold text-[#4b4b4b]">oleh {item.toko}</span>
                        <span className="block text-sm font-extrabold text-[#2563eb]">{formatRupiah(item.harga)}</span>
                      </span>
                    </Link>
                  ))}
                </div>
              ) : null}
              {saran.toko.length > 0 ? (
                <div className="mt-2">
                  <p className="px-1 text-xs font-black text-[#1e40af]">Toko</p>
                  {saran.toko.map((item) => (
                    <Link key={item.id} href={`/toko/${item.slug}`} onClick={() => setBuka(false)} className="mt-1 flex min-h-11 min-w-0 items-center gap-2 rounded-xl px-1 py-2">
                      {item.logo ? (
                        <img src={item.logo} alt="" className="h-10 w-10 shrink-0 rounded-full object-cover" />
                      ) : (
                        <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#dbeafe] text-sm font-black text-[#1e40af]">
                          {item.nama.slice(0, 1).toUpperCase()}
                        </span>
                      )}
                      <span className="min-w-0 truncate text-sm font-bold text-[#3c3c3c]">{item.nama}</span>
                    </Link>
                  ))}
                </div>
              ) : null}
            </div>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}

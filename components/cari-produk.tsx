"use client";

import { ArrowRight, Search } from "lucide-react";
import { useEffect, useId, useRef, useState, type FocusEvent, type KeyboardEvent as ReactKeyboardEvent, type PointerEvent as ReactPointerEvent } from "react";
import { Tombol } from "@/components/tombol";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { cariLangsung } from "@/app/actions/cari";
import type { SaranCari } from "@/lib/temukan";

const KOSONG: SaranCari = { produk: [], toko: [] };

const KALIMAT = [
  "Cari risoles mayo...",
  "Cari jasa desain poster...",
  "Cari kaos kampus...",
  "Cari edit CV...",
];
const PLACEHOLDER_DIAM = "Cari jajanan, jasa, fashion...";

type BarisSaran = { id: string; nama: string; href: string };

function tahanPanel(event: ReactPointerEvent) {
  event.preventDefault();
}

export function CariProduk({ hidup = false }: { hidup?: boolean }) {
  const params = useSearchParams();
  const router = useRouter();
  const jalur = usePathname();
  const awal = params.get("q") ?? "";
  const kategori = params.get("kategori") ?? "";
  const idKolom = useId();
  const idPanel = useId();
  const bungkus = useRef<HTMLDivElement>(null);
  const kolom = useRef<HTMLInputElement>(null);
  const bukaRef = useRef(false);
  const [buka, setBuka] = useState(false);
  bukaRef.current = buka;
  const [teks, setTeks] = useState(awal);
  const [saran, setSaran] = useState<SaranCari>(KOSONG);
  const [status, setStatus] = useState<"diam" | "memuat" | "selesai">("diam");
  const [placeholder, setPlaceholder] = useState(PLACEHOLDER_DIAM);
  const [aktif, setAktif] = useState(-1);

  const kata = teks.trim();
  const daftar: BarisSaran[] = [
    ...saran.produk.map((item) => ({ id: `produk-${item.id}`, nama: item.judul, href: `/produk/${item.slug}` })),
    ...saran.toko.map((item) => ({ id: `toko-${item.id}`, nama: item.nama, href: `/toko/${item.slug}` })),
  ].slice(0, 6);
  const tampil = buka && kata.length >= 1;

  useEffect(() => {
    setTeks(awal);
    setBuka(false);
    setAktif(-1);
  }, [awal, jalur]);

  useEffect(() => {
    setAktif(-1);
  }, [kata]);

  useEffect(() => {
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
  }, [teks, buka, kata]);

  useEffect(() => {
    function tutupEscape(event: KeyboardEvent) {
      if (event.key !== "Escape" || !bukaRef.current) return;
      setBuka(false);
      setAktif(-1);
      kolom.current?.blur();
    }
    function tutupLuar(event: PointerEvent) {
      if (!bungkus.current?.contains(event.target as Node)) setBuka(false);
    }
    document.addEventListener("keydown", tutupEscape);
    document.addEventListener("pointerdown", tutupLuar);
    return () => {
      document.removeEventListener("keydown", tutupEscape);
      document.removeEventListener("pointerdown", tutupLuar);
    };
  }, []);

  useEffect(() => {
    if (!hidup) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setPlaceholder(PLACEHOLDER_DIAM);
      return;
    }
    const el = kolom.current;
    let indeks = 0;
    let posisi = 0;
    let menghapus = false;
    let timer = 0;
    const langkah = () => {
      if (document.activeElement === el) {
        timer = window.setTimeout(langkah, 200);
        return;
      }
      const kalimat = KALIMAT[indeks] ?? KALIMAT[0];
      if (!menghapus) {
        posisi += 1;
        setPlaceholder(kalimat.slice(0, posisi));
        if (posisi >= kalimat.length) {
          menghapus = true;
          timer = window.setTimeout(langkah, 1500);
          return;
        }
        timer = window.setTimeout(langkah, 60);
        return;
      }
      posisi -= 1;
      setPlaceholder(kalimat.slice(0, Math.max(posisi, 0)));
      if (posisi <= 0) {
        menghapus = false;
        indeks = (indeks + 1) % KALIMAT.length;
      }
      timer = window.setTimeout(langkah, 60);
    };
    timer = window.setTimeout(langkah, 60);
    return () => window.clearTimeout(timer);
  }, [hidup]);

  function tutupJikaKeluar(event: FocusEvent<HTMLElement>) {
    const berikut = event.relatedTarget;
    if (berikut instanceof Node && bungkus.current?.contains(berikut)) return;
    setBuka(false);
  }

  function pilih(href: string) {
    setBuka(false);
    setAktif(-1);
    router.push(href);
  }

  function tekan(event: ReactKeyboardEvent<HTMLInputElement>) {
    if (event.key === "ArrowDown") {
      if (!daftar.length) return;
      event.preventDefault();
      setBuka(true);
      setAktif((indeks) => (indeks + 1) % daftar.length);
      return;
    }
    if (event.key === "ArrowUp") {
      if (!daftar.length) return;
      event.preventDefault();
      setBuka(true);
      setAktif((indeks) => (indeks <= 0 ? daftar.length - 1 : indeks - 1));
      return;
    }
    if (event.key === "Enter" && aktif >= 0 && daftar[aktif]) {
      event.preventDefault();
      pilih(daftar[aktif].href);
    }
  }

  return (
    <div ref={bungkus} className="relative z-40" onBlur={tutupJikaKeluar}>
      <form key={awal} action="/cari" method="get" className="cari-pill" onSubmit={() => setBuka(false)}>
        <label htmlFor={idKolom} className="sr-only">
          Cari produk
        </label>
        <input
          ref={kolom}
          id={idKolom}
          name="q"
          value={teks}
          role="combobox"
          onChange={(event) => setTeks(event.target.value)}
          onFocus={() => setBuka(true)}
          onBlur={tutupJikaKeluar}
          onKeyDown={tekan}
          placeholder={hidup ? placeholder : PLACEHOLDER_DIAM}
          aria-expanded={tampil}
          aria-controls={idPanel}
          aria-autocomplete="list"
          aria-activedescendant={aktif >= 0 ? `${idPanel}-${aktif}` : undefined}
          autoComplete="off"
          className="h-[48px] min-w-0 flex-1 bg-transparent text-[16px] text-ink-black outline-none placeholder:text-muted-gray"
        />
        {kategori ? <input type="hidden" name="kategori" value={kategori} /> : null}
        <Tombol type="submit" formAction="/cari" aria-label="Cari" ikon ukuran="lg" varian="primary" sorot>
          <ArrowRight strokeWidth={1.75} aria-hidden="true" />
        </Tombol>
      </form>
      {tampil ? (
        <div id={idPanel} role="listbox" className="panel-saran" onPointerDown={tahanPanel}>
          {status === "memuat" && daftar.length === 0 ? <p className="px-[8px] py-[10px] text-[14px] text-[#787574]">Mencari…</p> : null}
          {status === "selesai" && daftar.length === 0 ? <p className="px-[8px] py-[10px] text-[14px] text-[#787574]">Tidak ada yang cocok.</p> : null}
          {daftar.map((item, indeks) => (
            <a
              key={item.id}
              id={`${idPanel}-${indeks}`}
              href={item.href}
              role="option"
              aria-selected={indeks === aktif}
              onPointerDown={tahanPanel}
              onMouseEnter={() => setAktif(indeks)}
              onClick={(event) => {
                event.preventDefault();
                pilih(item.href);
              }}
              className={`flex min-h-[44px] items-center gap-[12px] rounded-[12px] px-[8px] text-[14px] text-[#000000] ${indeks === aktif ? "bg-[#f2f4f5]" : ""}`}
            >
              <Search className="h-[16px] w-[16px] shrink-0 text-[#787574]" strokeWidth={1.75} aria-hidden="true" />
              <span className="min-w-0 truncate">{item.nama}</span>
            </a>
          ))}
        </div>
      ) : null}
    </div>
  );
}

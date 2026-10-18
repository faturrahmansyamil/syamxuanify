"use client";

import { motion, useMotionValue, useReducedMotion, useSpring, useTransform, type MotionValue } from "framer-motion";
import Link from "next/link";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { GambarIsi } from "@/components/gambar-isi";
import { PlaceholderProduk } from "@/components/tampilan";
import { formatRupiah } from "@/lib/rupiah";
import { urlGambarAman } from "@/lib/wa";

export type KartuHidup = {
  id: string;
  slug: string;
  judul: string;
  gambar: string | null;
  toko: string;
  harga: number;
  kategori: string | null;
  ukuran: "besar" | "sedang" | "kecil";
  atas: number;
  tepi: number;
  sisi: "kiri" | "kanan";
  depth: number;
  angkat: string;
  durasi: string;
  jeda: string;
  sebarX: number;
  sebarY: number;
};

const PEGAS = { stiffness: 120, damping: 20 };
const INSET = 24;

function lebarKartu(ukuran: KartuHidup["ukuran"]) {
  if (ukuran === "besar") return 200;
  if (ukuran === "sedang") return 150;
  return 110;
}

function tinggiKartu(ukuran: KartuHidup["ukuran"]) {
  return lebarKartu(ukuran) + 62;
}

export function HeroHidup({ kartu, children }: { kartu: KartuHidup[]; children: ReactNode }) {
  const simpul = useRef<HTMLElement>(null);
  const mentahX = useMotionValue(0);
  const mentahY = useMotionValue(0);
  const halusX = useSpring(mentahX, PEGAS);
  const halusY = useSpring(mentahY, PEGAS);
  const progres = useMotionValue(0);
  const kiriTerbang = useMotionValue(0);
  const atasTerbang = useMotionValue(0);
  const skalaTerbang = useMotionValue(1);
  const opasitasTerbang = useMotionValue(0);
  const diam = useReducedMotion();
  const [lebar, setLebar] = useState(0);
  const [siap, setSiap] = useState(false);

  useEffect(() => {
    const el = simpul.current;
    if (!el) return;
    const ukur = () => setLebar(el.clientWidth);
    ukur();
    const pengamat = new ResizeObserver(ukur);
    pengamat.observe(el);
    return () => pengamat.disconnect();
  }, []);

  useEffect(() => {
    if (diam) {
      mentahX.set(0);
      mentahY.set(0);
    }
  }, [diam, mentahX, mentahY]);

  useEffect(() => {
    let id = 0;
    let sudah = false;
    let coba = 0;
    const gerak = () => {
      const asal = document.getElementById("wordmark-asal");
      const slot = document.querySelector("#slot-wordmark .wordmark-teks");
      if (!asal || !slot) {
        if (coba < 40) {
          coba += 1;
          id = requestAnimationFrame(gerak);
        }
        return;
      }
      const s = window.scrollY;
      const jarak = Math.max(280, (simpul.current?.offsetHeight || 640) * 0.55);
      const p = diam ? (s > jarak * 0.5 ? 1 : 0) : Math.min(1, Math.max(0, s / jarak));
      progres.set(p);
      if (asal && slot) {
        const a = asal.getBoundingClientRect();
        const b = slot.getBoundingClientRect();
        const ukuranAsal = Number.parseFloat(getComputedStyle(asal).fontSize) || 64;
        kiriTerbang.set(a.left + (b.left - a.left) * p);
        atasTerbang.set(a.top + (b.top - a.top) * p);
        skalaTerbang.set(1 + (16 / ukuranAsal - 1) * p);
        opasitasTerbang.set(1);
        if (!sudah) {
          sudah = true;
          setSiap(true);
        }
      }
    };
    const jadwal = () => {
      cancelAnimationFrame(id);
      id = requestAnimationFrame(gerak);
    };
    gerak();
    window.addEventListener("scroll", jadwal, { passive: true });
    window.addEventListener("resize", jadwal);
    return () => {
      cancelAnimationFrame(id);
      window.removeEventListener("scroll", jadwal);
      window.removeEventListener("resize", jadwal);
    };
  }, [atasTerbang, diam, kiriTerbang, opasitasTerbang, progres, skalaTerbang]);

  useEffect(() => {
    if (diam) return;
    const kasar = window.matchMedia("(pointer: coarse)").matches;
    if (!kasar) return;

    function gerak(event: DeviceOrientationEvent) {
      const gamma = event.gamma ?? 0;
      const beta = event.beta ?? 0;
      mentahX.set(Math.max(-1, Math.min(1, gamma / 24)) * 8);
      mentahY.set(Math.max(-1, Math.min(1, (beta - 40) / 30)) * 8);
    }

    let lepas = false;
    async function pasang() {
      const Perangkat = DeviceOrientationEvent as typeof DeviceOrientationEvent & {
        requestPermission?: () => Promise<PermissionState | string>;
      };
      if (typeof Perangkat.requestPermission === "function") {
        try {
          const izin = await Perangkat.requestPermission();
          if (izin !== "granted" || lepas) return;
        } catch {
          return;
        }
      }
      window.addEventListener("deviceorientation", gerak);
    }

    const hero = simpul.current;
    hero?.addEventListener("pointerdown", pasang, { once: true });
    if (typeof (DeviceOrientationEvent as { requestPermission?: unknown }).requestPermission !== "function") {
      window.addEventListener("deviceorientation", gerak);
    }
    return () => {
      lepas = true;
      hero?.removeEventListener("pointerdown", pasang);
      window.removeEventListener("deviceorientation", gerak);
    };
  }, [diam, mentahX, mentahY]);

  function ikuti(event: React.MouseEvent<HTMLElement>) {
    if (diam || window.matchMedia("(pointer: coarse)").matches || !simpul.current) return;
    const kotak = simpul.current.getBoundingClientRect();
    const nx = ((event.clientX - kotak.left) / kotak.width - 0.5) * 2;
    const ny = ((event.clientY - kotak.top) / kotak.height - 0.5) * 2;
    mentahX.set(Math.max(-1, Math.min(1, nx)) * 8);
    mentahY.set(Math.max(-1, Math.min(1, ny)) * 8);
  }

  const padat = lebar < 860;
  const jumlahPadat = lebar === 0 ? 2 : Math.max(1, Math.min(2, Math.floor((lebar - INSET * 2) / 122)));
  const tengah = Math.min(600, Math.round(Math.max(lebar, 1) * 0.5));
  const ruang = (Math.max(lebar, 1) - tengah) / 2;
  const kiri = susunSisi(kartu.filter((item) => item.sisi === "kiri"), ruang);
  const kanan = susunSisi(kartu.filter((item) => item.sisi === "kanan"), ruang);
  const konstelasi = !padat && (kiri.length > 0 || kanan.length > 0);
  const bawahKartu = Math.max(
    0,
    ...kiri.map((tempat) => tempat.atas + tinggiKartu(tempat.item.ukuran)),
    ...kanan.map((tempat) => tempat.atas + tinggiKartu(tempat.item.ukuran)),
  );

  return (
    <section
      id="etalase-hero"
      ref={simpul}
      className={`relative z-20 mb-[64px] ${konstelasi ? "" : "pt-[24px]"}`}
      style={konstelasi ? { height: bawahKartu + 12 } : undefined}
      onMouseMove={ikuti}
      onMouseLeave={() => {
        mentahX.set(0);
        mentahY.set(0);
      }}
    >
      {konstelasi ? (
        <div className="pointer-events-none absolute inset-0 overflow-x-clip overflow-y-clip">
          <div className="absolute inset-y-0 left-0" style={{ width: ruang }}>
            {kiri.map((tempat) => (
              <KartuSisi key={`${tempat.item.id}-kiri`} item={tempat.item} atas={tempat.atas} tepi={INSET} halusX={halusX} halusY={halusY} progres={progres} />
            ))}
          </div>
          <div className="absolute inset-y-0 right-0" style={{ width: ruang }}>
            {kanan.map((tempat) => (
              <KartuSisi key={`${tempat.item.id}-kanan`} item={tempat.item} atas={tempat.atas} tepi={INSET} halusX={halusX} halusY={halusY} progres={progres} />
            ))}
          </div>
        </div>
      ) : (
        <div className="mb-[16px] overflow-x-clip overflow-y-clip">
          <div className="flex justify-center gap-[12px]">
            {kartu.slice(0, jumlahPadat).map((item) => (
              <KartuPonsel key={`padat-${item.id}`} item={item} halusX={halusX} halusY={halusY} progres={progres} prioritas />
            ))}
          </div>
        </div>
      )}
      <div
        id="cari"
        className={
          konstelasi
            ? "absolute top-1/2 left-1/2 z-30 w-[min(600px,50%)] -translate-x-1/2 -translate-y-1/2"
            : "relative z-30 mx-auto w-full max-w-[600px]"
        }
      >
        <p
          id="wordmark-asal"
          aria-hidden="true"
          translate="no"
          className={`${siap ? "invisible" : ""} mx-auto w-fit text-center text-[40px] leading-none font-semibold tracking-[-0.05em] md:text-[64px]`}
        >
          Syamxuanify<span className="text-shop-violet">.</span>
        </p>
        {children}
      </div>
      <motion.p
        aria-hidden="true"
        translate="no"
        className="pointer-events-none fixed z-50 m-0 w-fit text-[40px] leading-none font-semibold tracking-[-0.05em] text-ink-black md:text-[64px]"
        style={{ left: kiriTerbang, top: atasTerbang, scale: skalaTerbang, opacity: opasitasTerbang, transformOrigin: "top left" }}
      >
        Syamxuanify<span className="text-shop-violet">.</span>
      </motion.p>
    </section>
  );
}

function susunSisi(daftar: KartuHidup[], ruang: number) {
  const hasil: { item: KartuHidup; atas: number }[] = [];
  let atas = 36;
  for (const item of daftar) {
    const tinggi = tinggiKartu(item.ukuran);
    if (lebarKartu(item.ukuran) + INSET * 2 > ruang) continue;
    if (atas + tinggi > 760) break;
    if (hasil.length >= 2) break;
    hasil.push({ item, atas });
    atas += tinggi + INSET;
  }
  return hasil;
}

function KartuSisi({
  item,
  atas,
  tepi,
  halusX,
  halusY,
  progres,
}: {
  item: KartuHidup;
  atas: number;
  tepi: number;
  halusX: MotionValue<number>;
  halusY: MotionValue<number>;
  progres: MotionValue<number>;
}) {
  const x = useTransform([halusX, progres], (nilai) => {
    const [geser, p] = nilai as number[];
    return geser * item.depth + p * item.sebarX;
  });
  const y = useTransform([halusY, progres], (nilai) => {
    const [geser, p] = nilai as number[];
    return geser * item.depth + p * item.sebarY;
  });
  const scale = useTransform(progres, (p) => 1 - p * 0.08);
  const opacity = useTransform(progres, (p) => 1 - p);

  return (
    <motion.div
      data-depth={item.depth}
      className="pointer-events-auto absolute"
      style={{
        top: atas,
        [item.sisi === "kiri" ? "left" : "right"]: tepi,
        x,
        y,
        scale,
        opacity,
      }}
    >
      <div className="melayang" style={{ ["--angkat" as string]: item.angkat, ["--durasi" as string]: item.durasi, ["--jeda" as string]: item.jeda }}>
        <KartuMelayang item={item} lebar={lebarKartu(item.ukuran)} />
      </div>
    </motion.div>
  );
}

function KartuPonsel({
  item,
  halusX,
  halusY,
  progres,
  prioritas = false,
}: {
  item: KartuHidup;
  halusX: MotionValue<number>;
  halusY: MotionValue<number>;
  progres: MotionValue<number>;
  prioritas?: boolean;
}) {
  const x = useTransform([halusX, progres], (nilai) => {
    const [geser, p] = nilai as number[];
    return geser * item.depth * 0.4 + p * item.sebarX * 0.35;
  });
  const y = useTransform([halusY, progres], (nilai) => {
    const [geser, p] = nilai as number[];
    return geser * item.depth * 0.4 + p * item.sebarY * 0.35;
  });
  const scale = useTransform(progres, (p) => 1 - p * 0.08);
  const opacity = useTransform(progres, (p) => 1 - p);

  return (
    <motion.div data-depth={item.depth} style={{ x, y, scale, opacity }}>
      <div className="melayang" style={{ ["--angkat" as string]: item.angkat, ["--durasi" as string]: item.durasi, ["--jeda" as string]: item.jeda }}>
        <KartuMelayang item={item} lebar={110} prioritas={prioritas} />
      </div>
    </motion.div>
  );
}

function KartuMelayang({ item, lebar, prioritas = false }: { item: KartuHidup; lebar: number; prioritas?: boolean }) {
  const gambar = urlGambarAman(item.gambar);
  return (
    <Link href={`/produk/${item.slug}`} className="block overflow-hidden rounded-[20px] bg-white" style={{ width: lebar, boxShadow: "var(--shadow-sm)" }}>
      {gambar ? (
        <span className="relative block aspect-square overflow-hidden">
          <GambarIsi src={gambar} sizes={`${lebar}px`} priority={prioritas} className="object-cover" />
        </span>
      ) : (
        <span className="block aspect-square">
          <PlaceholderProduk kategori={item.kategori} />
        </span>
      )}
      <span className="flex flex-col gap-[2px] px-[10px] pt-[8px] pb-[10px]">
        <span className="truncate text-[14px] font-semibold tracking-[-0.014em] text-ink-black">{item.judul}</span>
        <span className="truncate text-[14px] text-ink-black">{formatRupiah(item.harga)}</span>
      </span>
    </Link>
  );
}

"use client";

import { useEffect, useRef, useState, type MouseEvent, type PointerEvent, type RefObject } from "react";

export const KELAS_JALUR =
  "jalur-geser -mx-[16px] flex min-w-0 snap-x snap-mandatory overflow-x-auto scroll-px-[16px] px-[16px] pb-[4px] md:-mx-[24px] md:scroll-px-[24px] md:px-[24px]";

export function langkahKartu(el: HTMLElement) {
  const anak = el.firstElementChild;
  const gaya = getComputedStyle(el);
  const celah = Number.parseFloat(gaya.columnGap || gaya.gap) || 12;
  const lebar = anak instanceof HTMLElement ? anak.getBoundingClientRect().width : 220;
  return lebar + celah;
}

export function gerakHalus() {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth";
}

export function useDiAwal(jalur: RefObject<HTMLDivElement | null>) {
  const [awal, setAwal] = useState(true);

  useEffect(() => {
    const el = jalur.current;
    if (!el) return;
    const cek = () => setAwal(el.scrollLeft <= 1);
    cek();
    el.addEventListener("scroll", cek, { passive: true });
    window.addEventListener("resize", cek);
    return () => {
      el.removeEventListener("scroll", cek);
      window.removeEventListener("resize", cek);
    };
  }, [jalur]);

  return awal;
}

export function useTarikJalur(jalur: RefObject<HTMLDivElement | null>) {
  const tarik = useRef({ aktif: false, x: 0, kiri: 0, pindah: false });

  return {
    onPointerDown(event: PointerEvent<HTMLDivElement>) {
      if (event.pointerType !== "mouse" || !jalur.current) return;
      tarik.current = { aktif: true, x: event.clientX, kiri: jalur.current.scrollLeft, pindah: false };
      jalur.current.style.scrollBehavior = "auto";
      jalur.current.setPointerCapture(event.pointerId);
    },
    onPointerMove(event: PointerEvent<HTMLDivElement>) {
      if (!tarik.current.aktif || !jalur.current) return;
      const jarak = event.clientX - tarik.current.x;
      if (Math.abs(jarak) > 8) tarik.current.pindah = true;
      jalur.current.scrollLeft = tarik.current.kiri - jarak;
    },
    lepas() {
      tarik.current.aktif = false;
      if (jalur.current) jalur.current.style.scrollBehavior = "";
    },
    onClickCapture(event: MouseEvent<HTMLDivElement>) {
      if (!tarik.current.pindah) return;
      event.preventDefault();
      event.stopPropagation();
      tarik.current.pindah = false;
    },
  };
}


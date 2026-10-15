export const KELAS_JALUR =
  "jalur-geser -mx-4 flex min-w-0 snap-x snap-mandatory gap-3 overflow-x-auto scroll-px-4 px-4 pb-1 md:-mx-10 md:scroll-px-10 md:px-10";

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

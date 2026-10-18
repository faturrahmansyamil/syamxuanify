"use client";

import { useEffect } from "react";

export function PenandaMuat() {
  useEffect(() => {
    const akar = document.documentElement;
    const status = document.getElementById("status-muat");
    const diam = window.matchMedia("(prefers-reduced-motion: reduce)");
    let asal = "";
    let sejak = 0;
    let rangka = 0;
    let jeda = 0;

    function tutup(titik: boolean) {
      cancelAnimationFrame(rangka);
      akar.classList.remove("sedang-muat");
      if (status) status.textContent = "";
      if (!titik || diam.matches) return;
      akar.classList.remove("selesai-muat");
      rangka = requestAnimationFrame(() => {
        akar.classList.add("selesai-muat");
        window.clearTimeout(jeda);
        jeda = window.setTimeout(() => akar.classList.remove("selesai-muat"), 250);
      });
    }

    function pantau() {
      const lama = performance.now() - sejak;
      const pindah = `${location.pathname}${location.search}` !== asal;
      const kerangka = document.querySelector("[data-kerangka]");
      if (pindah && kerangka) {
        rangka = requestAnimationFrame(pantau);
        return;
      }
      if (pindah && lama > 320) {
        tutup(true);
        return;
      }
      if (!pindah && lama > 1200) {
        tutup(false);
        return;
      }
      if (lama > 8000) {
        tutup(pindah);
        return;
      }
      rangka = requestAnimationFrame(pantau);
    }

    function mulai() {
      asal = `${location.pathname}${location.search}`;
      sejak = performance.now();
      akar.classList.add("sedang-muat");
      akar.classList.remove("selesai-muat");
      if (status) status.textContent = "Memuat…";
      cancelAnimationFrame(rangka);
      rangka = requestAnimationFrame(pantau);
    }

    function klik(event: MouseEvent) {
      if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      const tautan = (event.target as Element | null)?.closest("a");
      if (!tautan || tautan.target === "_blank" || tautan.hasAttribute("download")) return;
      const href = tautan.getAttribute("href");
      if (!href || href.startsWith("#") || href.startsWith("mailto:") || href.startsWith("tel:")) return;
      let url: URL;
      try {
        url = new URL(href, location.href);
      } catch {
        return;
      }
      if (url.origin !== location.origin) return;
      if (`${url.pathname}${url.search}` === `${location.pathname}${location.search}`) return;
      mulai();
    }

    function kirim(event: SubmitEvent) {
      const form = event.target as HTMLFormElement | null;
      if (!form || form.method.toLowerCase() !== "get") return;
      const action = form.getAttribute("action") || "";
      if (!action.startsWith("/")) return;
      mulai();
    }

    document.addEventListener("click", klik);
    document.addEventListener("submit", kirim);
    return () => {
      document.removeEventListener("click", klik);
      document.removeEventListener("submit", kirim);
      cancelAnimationFrame(rangka);
      window.clearTimeout(jeda);
      akar.classList.remove("sedang-muat", "selesai-muat");
    };
  }, []);

  return (
    <>
      <div className="batang-muat" aria-hidden="true" />
      <div className="titik-halaman" aria-hidden="true" />
      <p id="status-muat" className="sr-only" role="status" />
    </>
  );
}

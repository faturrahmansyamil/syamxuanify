"use client";

import { animate, useInView, useReducedMotion } from "framer-motion";
import { useEffect, useRef, useState } from "react";

export function AngkaNaik({ n }: { n: number }) {
  const simpul = useRef<HTMLSpanElement>(null);
  const lihat = useInView(simpul, { once: true, amount: 0.6 });
  const diam = useReducedMotion();
  const [nilai, setNilai] = useState(0);

  useEffect(() => {
    if (!lihat) return;
    if (diam) {
      setNilai(n);
      return;
    }
    const kontrol = animate(0, n, {
      duration: 0.8,
      ease: "easeOut",
      onUpdate: (angka) => setNilai(Math.round(angka)),
    });
    return () => kontrol.stop();
  }, [lihat, n, diam]);

  return <span ref={simpul}>{nilai}</span>;
}

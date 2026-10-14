"use client";

import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";

export function Muncul({
  children,
  urut = 0,
}: {
  children: ReactNode;
  urut?: number;
}) {
  const simpul = useRef<HTMLDivElement>(null);
  const [tampil, setTampil] = useState(false);

  useEffect(() => {
    const el = simpul.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setTampil(true);
      return;
    }
    const pengamat = new IntersectionObserver(
      (daftar) => {
        if (daftar.some((item) => item.isIntersecting)) {
          setTampil(true);
          pengamat.disconnect();
        }
      },
      { threshold: 0, rootMargin: "0px 0px -8% 0px" },
    );
    pengamat.observe(el);
    return () => pengamat.disconnect();
  }, []);

  const gaya: CSSProperties = { transitionDelay: `${urut * 60}ms` };

  return (
    <div ref={simpul} className={tampil ? "muncul muncul-tampil" : "muncul"} style={gaya}>
      {children}
    </div>
  );
}

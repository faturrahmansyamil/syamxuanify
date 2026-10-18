"use client";

import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";

export function LatarHidup() {
  const diam = useReducedMotion();
  const diamRef = useRef(diam);
  diamRef.current = diam;
  const { scrollY, scrollYProgress } = useScroll();
  const yPola = useTransform(scrollY, (nilai) => (diamRef.current === false ? nilai * 0.15 : 0));
  const xKata = useTransform(scrollYProgress, (nilai) => (diamRef.current === false ? `${nilai * -40}%` : "0%"));
  const yTitik = useTransform(scrollYProgress, (nilai) => {
    if (diamRef.current !== false) return 24;
    const tinggi = typeof window === "undefined" ? 800 : window.innerHeight;
    return 24 + nilai * Math.max(0, tinggi - 56);
  });

  return (
    <div aria-hidden="true" className="pointer-events-none fixed inset-0 overflow-hidden" style={{ zIndex: -1 }}>
      <motion.div
        className="absolute inset-x-0 opacity-50"
        style={{
          y: yPola,
          top: "-8000px",
          height: "calc(100% + 16000px)",
          backgroundImage: "radial-gradient(circle, #cccccc 1.5px, transparent 1.5px)",
          backgroundSize: "24px 24px",
          willChange: "transform",
        }}
      />
      <div
        className="absolute top-[72vh] right-0 left-0"
        style={{
          maskImage: "linear-gradient(90deg, transparent, #000 9%, #000 91%, transparent)",
          WebkitMaskImage: "linear-gradient(90deg, transparent, #000 9%, #000 91%, transparent)",
        }}
      >
        <motion.p
          className="m-0 w-max font-semibold whitespace-nowrap"
          style={{
            x: xKata,
            fontSize: "clamp(160px, 22vw, 360px)",
            letterSpacing: "-0.04em",
            lineHeight: 1,
            color: "transparent",
            WebkitTextStroke: "1px #ebebeb",
            willChange: "transform",
          }}
        >
          Syamxuanify
        </motion.p>
      </div>
      <motion.span
        className="absolute top-0 right-[24px] hidden h-[8px] w-[8px] rounded-full bg-[#5433eb] md:block"
        style={{ y: yTitik, willChange: "transform" }}
      />
    </div>
  );
}

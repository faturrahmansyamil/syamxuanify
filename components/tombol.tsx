import Link from "next/link";
import type { ComponentProps, ReactNode } from "react";

type Varian = "primary" | "secondary" | "ghost";
type Ukuran = "sm" | "md" | "lg";

type Dasar = {
  varian?: Varian;
  ukuran?: Ukuran;
  ikon?: boolean;
  chip?: boolean;
  sorot?: boolean;
  terang?: boolean;
  bayang?: "sm";
  className?: string;
  children?: ReactNode;
};

type Properti =
  | (Dasar & { href: string } & Omit<ComponentProps<typeof Link>, "href" | "className" | "children">)
  | (Dasar & { href?: undefined } & Omit<ComponentProps<"button">, "className" | "children">);

const UKURAN: Record<Ukuran, { kotak: string; isi: string; ikon: string }> = {
  sm: {
    kotak: "h-[32px] w-[32px]",
    isi: "h-[32px] gap-[8px] px-[14px]",
    ikon: "[&_svg]:h-[16px] [&_svg]:w-[16px]",
  },
  md: {
    kotak: "h-[40px] w-[40px]",
    isi: "h-[40px] gap-[8px] px-[18px]",
    ikon: "[&_svg]:h-[16px] [&_svg]:w-[16px]",
  },
  lg: {
    kotak: "h-[48px] w-[48px]",
    isi: "h-[48px] gap-[8px] px-[24px] text-[15px]",
    ikon: "[&_svg]:h-[20px] [&_svg]:w-[20px]",
  },
};

const WARNA: Record<Varian, string> = {
  primary: "border-[1.5px] border-[#141210] bg-[#141210] text-[#fff4dc] hover:bg-[#ff3b1f] hover:text-[#141210]",
  secondary: "border-[1.5px] border-[#141210] bg-white text-[#141210] hover:bg-[#ffd60a]",
  ghost: "bg-transparent text-[#141210] hover:bg-[#141210]/10",
};

function kelasTombol({
  varian = "primary",
  ukuran = "md",
  ikon = false,
  chip = false,
  sorot = false,
  terang = false,
  bayang,
  className,
}: Dasar) {
  const ukuranKelas = UKURAN[ukuran];
  return [
    "tombol rounded-[12px] font-bold leading-none tracking-[-0.01em] no-underline transition-[background-color,transform] duration-200 ease-out",
    "active:scale-[0.96] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#2d5bff]",
    "disabled:cursor-not-allowed disabled:opacity-60 motion-reduce:transition-none motion-reduce:active:scale-100",
    "[&_svg]:block [&_svg]:shrink-0",
    ikon ? `grid place-items-center p-0 ${ukuranKelas.kotak}` : chip ? "inline-flex h-[38px] items-center justify-center gap-[6px] rounded-[10px] px-[14px]" : `inline-flex items-center justify-center ${ukuranKelas.isi}`,
    chip || ukuran !== "lg" ? "text-[14px]" : "",
    chip || ukuran !== "lg" ? ukuranKelas.ikon : ukuranKelas.ikon,
    WARNA[varian],
    sorot ? "tombol-sorot" : "",
    bayang === "sm" ? "tombol-bayang" : "",
    terang ? "border-transparent! bg-transparent! text-white! hover:bg-white/15!" : "",
    className ?? "",
  ]
    .filter(Boolean)
    .join(" ");
}

export function Tombol(properti: Properti) {
  const { varian, ukuran, ikon, chip, sorot, terang, bayang, className, children, href, ...sisa } = properti;
  const kelas = kelasTombol({ varian, ukuran, ikon, chip, sorot, terang, bayang, className });

  if (href) {
    if (/^https?:\/\//.test(href)) {
      return (
        <a href={href} className={kelas} {...(sisa as Omit<ComponentProps<"a">, "href" | "className" | "children">)}>
          {children}
        </a>
      );
    }
    return (
      <Link href={href} className={kelas} {...(sisa as Omit<ComponentProps<typeof Link>, "href" | "className" | "children">)}>
        {children}
      </Link>
    );
  }

  return (
    <button className={kelas} {...(sisa as Omit<ComponentProps<"button">, "className" | "children">)}>
      {children}
    </button>
  );
}

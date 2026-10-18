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
  primary: "bg-[#000000] text-white hover:bg-[#332f2d]",
  secondary: "border border-[#ebebeb] bg-white text-[#000000] hover:bg-[#f2f4f5]",
  ghost: "bg-transparent text-[#000000] hover:bg-[#f2f4f5]",
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
    "tombol rounded-full font-medium leading-none tracking-[-0.014em] no-underline transition-[background-color,transform] duration-200 ease-out",
    "active:scale-[0.96] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#000000]",
    "disabled:cursor-not-allowed disabled:opacity-60 motion-reduce:transition-none motion-reduce:active:scale-100",
    "[&_svg]:block [&_svg]:shrink-0",
    ikon ? `grid place-items-center p-0 ${ukuranKelas.kotak}` : chip ? "inline-flex h-[36px] items-center justify-center gap-[6px] px-[14px]" : `inline-flex items-center justify-center ${ukuranKelas.isi}`,
    chip || ukuran !== "lg" ? "text-[14px]" : "",
    chip || ukuran !== "lg" ? ukuranKelas.ikon : ukuranKelas.ikon,
    WARNA[varian],
    sorot ? "tombol-sorot" : "",
    bayang === "sm" ? "tombol-bayang" : "",
    terang ? "text-white! hover:bg-[#f2f4f5]! hover:text-[#000000]!" : "",
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

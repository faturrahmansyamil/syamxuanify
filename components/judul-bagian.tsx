import Link from "next/link";
import { ChevronRight } from "lucide-react";

export function JudulBagian({ judul, href, className = "mb-[24px]" }: { judul: string; href?: string; className?: string }) {
  const isi = (
    <>
      <h2 className="min-w-0 truncate text-balance">{judul}</h2>
      <ChevronRight className="h-[16px] w-[16px] shrink-0" aria-hidden="true" />
      <span className="titik-judul" aria-hidden="true" />
    </>
  );
  const kelas = `judul-bagian inline-flex min-h-[44px] min-w-0 items-center gap-[6px] text-ink-black ${className}`;
  if (!href) return <div className={kelas}>{isi}</div>;
  return (
    <Link href={href} className={kelas}>
      {isi}
    </Link>
  );
}

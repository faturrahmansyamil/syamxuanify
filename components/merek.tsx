import Link from "next/link";

export function Merek({ terang = false, besar = false }: { terang?: boolean; besar?: boolean }) {
  return (
    <Link href="/" aria-label="Syamxuanify, ke beranda" translate="no" className="inline-flex items-center gap-[8px] no-underline">
      <span
        aria-hidden="true"
        className={`font-display grid place-items-center border-2 border-[#141210] bg-[#ff3b1f] font-extrabold text-[#141210] ${besar ? "h-[44px] w-[44px] text-[26px]" : "h-[30px] w-[30px] text-[18px]"}`}
        style={{ clipPath: "polygon(0 0, 100% 0, 100% 72%, 72% 100%, 0 100%)" }}
      >
        S
      </span>
      <span className={`font-display font-extrabold tracking-[-0.04em] ${besar ? "text-[34px]" : "text-[21px]"} ${terang ? "text-[#fff4dc]" : "text-[#141210]"}`}>
        syamxuanify
      </span>
    </Link>
  );
}

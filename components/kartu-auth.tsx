import type { ReactNode } from "react";
import Link from "next/link";

export function KartuAuth({
  judul,
  sub,
  anak,
  bawah,
}: {
  judul: string;
  sub: string;
  anak: ReactNode;
  bawah: ReactNode;
}) {
  return (
    <div className="w-full text-ink-black">
      <p className="wordmark-auth">
        Syamxuanify<span className="text-shop-violet">.</span>
      </p>
      <img
        src="/maskot.png"
        alt=""
        width={72}
        height={72}
        className="mx-auto mt-[16px] h-[72px] w-[72px] object-contain"
      />
      <p className="judul-auth">{judul}</p>
      <p className="sub-auth">{sub}</p>
      <div className="mt-[24px]">{anak}</div>
      <div className="mt-[24px] text-center text-[14px]">{bawah}</div>
      <p className="mt-[12px] text-center text-[12px] leading-[1.4] text-[#787574]">
        Dengan melanjutkan, kamu setuju pada{" "}
        <Link href="/syarat" className="underline">
          syarat
        </Link>{" "}
        dan privasi Syamxuanify.
      </p>
    </div>
  );
}

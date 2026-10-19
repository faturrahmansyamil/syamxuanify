import type { ReactNode } from "react";
import Link from "next/link";
import { Merek } from "@/components/merek";

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
    <div className="w-full text-[#141210]">
      <div className="mb-[20px] lg:hidden">
        <Merek />
      </div>
      <div className="kartu-auth">
        <h1 className="judul-auth">{judul}</h1>
        <p className="sub-auth">{sub}</p>
        <div className="mt-[24px]">{anak}</div>
      </div>
      <div className="mt-[20px] text-center text-[15px]">{bawah}</div>
      <p className="mt-[10px] text-center text-[12px] leading-[1.5] text-[#6b645c]">
        Dengan melanjutkan, kamu setuju pada{" "}
        <Link href="/syarat" className="underline underline-offset-2">
          syarat
        </Link>{" "}
        dan privasi Syamxuanify.
      </p>
    </div>
  );
}

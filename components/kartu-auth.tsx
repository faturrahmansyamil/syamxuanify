import type { ReactNode } from "react";

export function KartuAuth({
  judul,
  anak,
  bawah,
}: {
  judul: string;
  anak: ReactNode;
  bawah: ReactNode;
}) {
  return (
    <div className="mx-auto w-full max-w-md px-1 pt-2 pb-4">
      <img
        src="/maskot.png"
        alt=""
        className="pointer-events-none mx-auto mb-[12px] h-[64px] w-[64px] object-contain"
      />
      <div className="kartu px-[24px] py-[28px] text-ink-black">
        <h1>{judul}</h1>
        <div className="mt-[24px]">{anak}</div>
        <div className="mt-[24px] text-[14px]">{bawah}</div>
      </div>
    </div>
  );
}

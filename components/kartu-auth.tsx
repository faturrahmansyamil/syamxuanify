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
    <div className="auth-muncul mx-auto w-full max-w-md px-1 pt-12 pb-4">
      <div className="relative rounded-2xl border-2 border-bebe bg-card px-5 py-6 sm:px-7 sm:py-8">
        <img
          src="/maskot.png"
          alt=""
          className="pointer-events-none absolute -top-10 right-2 h-24 w-24 object-contain sm:-top-12 sm:right-4 sm:h-28 sm:w-28"
        />
        <h1 className="max-w-[15.5rem] text-3xl font-extrabold leading-tight text-accent sm:max-w-[17rem] sm:text-4xl">{judul}</h1>
        <div className="mt-6">{anak}</div>
        <div className="mt-6 text-sm font-bold">{bawah}</div>
      </div>
    </div>
  );
}

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
    <div className="auth-muncul mx-auto w-full max-w-md px-1 pt-2 pb-4">
      <img
        src="/maskot.png"
        alt=""
        className="maskot-layang pointer-events-none mx-auto mb-3 h-28 w-28 object-contain sm:h-32 sm:w-32"
      />
      <div className="card-duo px-5 py-6 text-[#3c3c3c] sm:px-7 sm:py-8">
        <h1 className="text-3xl font-black leading-tight tracking-tight text-accent sm:text-4xl">{judul}</h1>
        <div className="mt-6">{anak}</div>
        <div className="mt-6 text-sm font-bold">{bawah}</div>
      </div>
    </div>
  );
}

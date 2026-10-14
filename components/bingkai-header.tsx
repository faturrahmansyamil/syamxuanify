"use client";

import { usePathname } from "next/navigation";

export function BingkaiHeader({
  logo,
  cari,
  akun,
}: {
  logo: React.ReactNode;
  cari: React.ReactNode;
  akun: React.ReactNode;
}) {
  const jalur = usePathname();
  const ringkas = jalur === "/masuk" || jalur === "/daftar";

  if (ringkas) {
    return (
      <div className="mx-auto flex w-full max-w-[1200px] items-center justify-between px-4 py-3 md:px-10">
        {logo}
      </div>
    );
  }

  return (
    <div className="mx-auto grid w-full max-w-[1200px] grid-cols-[auto_minmax(0,1fr)] items-center gap-x-3 gap-y-3 px-4 py-3 md:grid-cols-[auto_minmax(0,36rem)_auto] md:gap-6 md:px-10">
      {logo}
      <div className="col-span-2 row-start-2 min-w-0 md:col-span-1 md:col-start-2 md:row-start-1">{cari}</div>
      <div className="col-start-2 row-start-1 flex items-center justify-end gap-1 md:col-start-3 md:gap-2">
        {akun}
      </div>
    </div>
  );
}

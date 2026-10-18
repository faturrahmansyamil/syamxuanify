import { Suspense, type ReactNode } from "react";
import { BingkaiAdmin } from "@/components/bingkai-admin";
import { angkaMenu, klienAdmin } from "@/lib/panel-admin";

export default function LayoutAdmin({ children }: { children: ReactNode }) {
  return (
    <Suspense fallback={<p className="text-sm text-hof">Memuat panel admin...</p>}>
      <IsiLayout>{children}</IsiLayout>
    </Suspense>
  );
}

async function IsiLayout({ children }: { children: ReactNode }) {
  const hasil = await klienAdmin();
  if (!hasil.ok) return <p className="rounded-[12px] bg-card p-[16px] text-sm">{hasil.pesan}</p>;
  const angka = await angkaMenu(hasil.supabase);
  return (
    <BingkaiAdmin persetujuan={angka.persetujuan} laporan={angka.laporan}>
      {children}
    </BingkaiAdmin>
  );
}

import { BaruMendarat } from "@/components/baru-mendarat";
import { LagiTren } from "@/components/lagi-tren";
import { PapanHarian } from "@/components/papan-harian";
import { TopPenjual } from "@/components/top-penjual";
import { ambilTemukan } from "@/lib/temukan";

export async function TemukanBeranda() {
  const data = await ambilTemukan();
  const ada =
    data.hariIni.length > 0 ||
    data.favorit.length > 0 ||
    data.penjualBaru ||
    data.tren.length > 0 ||
    data.baruMendarat.length > 0 ||
    data.topPenjual.length > 0;
  if (!ada) return null;

  return (
    <div className="mb-10 space-y-10">
      <PapanHarian hariIni={data.hariIni} penjualBaru={data.penjualBaru} favorit={data.favorit} />
      <LagiTren kolom={data.tren} />
      <BaruMendarat produk={data.baruMendarat} />
      <TopPenjual toko={data.topPenjual} />
    </div>
  );
}

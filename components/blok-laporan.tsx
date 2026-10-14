import Link from "next/link";
import { FormLapor } from "@/components/form-lapor";
import { penggunaMasuk } from "@/lib/katalog";

export async function BlokLaporan({
  productId,
  shopId,
  kembali,
}: {
  productId?: string;
  shopId?: string;
  kembali: string;
}) {
  const masuk = await penggunaMasuk();

  if (!masuk) {
    return (
      <div className="rounded-[12px] border border-bebe bg-card p-4">
        <h2 className="font-semibold">Laporkan</h2>
        <p className="mt-2 text-sm leading-6 text-foggy">
          Masuk dulu kalau kamu ingin melaporkan produk atau toko yang mencurigakan.
        </p>
        <Link
          href={`/masuk?selanjutnya=${encodeURIComponent(kembali)}`}
          className="mt-4 inline-flex h-11 items-center rounded-lg border border-hof px-4 text-sm font-semibold text-hof"
        >
          Masuk untuk melaporkan
        </Link>
      </div>
    );
  }

  return <FormLapor productId={productId} shopId={shopId} />;
}

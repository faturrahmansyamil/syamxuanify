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
      <div className="card-duo p-4">
        <h2 className="font-semibold">Laporkan</h2>
        <p className="mt-2 text-sm leading-6 text-foggy">
          Masuk dulu kalau kamu ingin melaporkan produk atau toko yang mencurigakan.
        </p>
        <Link
          href={`/masuk?selanjutnya=${encodeURIComponent(kembali)}`}
          className="btn-duo mt-4 inline-flex items-center"
        >
          Masuk untuk melaporkan
        </Link>
      </div>
    );
  }

  return <FormLapor productId={productId} shopId={shopId} />;
}

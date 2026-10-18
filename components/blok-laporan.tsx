import { Tombol } from "@/components/tombol";
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
      <div className="kartu p-[16px]">
        <h2 className="font-semibold">Laporkan</h2>
        <p className="mt-2 text-sm leading-6 text-foggy">
          Masuk dulu kalau kamu ingin melaporkan produk atau toko yang mencurigakan.
        </p>
        <Tombol
          href={`/masuk?selanjutnya=${encodeURIComponent(kembali)}`} varian="secondary" ukuran="lg" className="mt-[16px]">
          Masuk untuk melaporkan
        </Tombol>
      </div>
    );
  }

  return <FormLapor productId={productId} shopId={shopId} />;
}

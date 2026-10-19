import { Tombol } from "@/components/tombol";

export function EtalaseKosong({
  judul = "Etalase masih kosong.",
  isi = "Belum ada produk yang tayang. Kalau kamu punya jualan, pasang di sini gratis.",
  langkah = false,
}: {
  judul?: string;
  isi?: string;
  langkah?: boolean;
}) {
  return (
    <section className="overflow-hidden rounded-[18px] border-2 border-[#141210] bg-[#ffd60a]">
      <div className="tenda-gelap" aria-hidden="true" />
      <div className="px-[20px] py-[24px] md:px-[32px] md:py-[32px]">
        <h2 className="text-[30px] leading-[1] text-[#141210] md:text-[40px]">{judul}</h2>
        <p className="mt-[10px] max-w-[560px] text-[15px] leading-[1.5] font-medium text-[#141210] md:text-[16px]">{isi}</p>
        {langkah ? (
          <p className="mt-[10px] max-w-[560px] text-[14px] leading-[1.5] text-[#141210]/80">
            Caranya: daftar, buka toko dari halaman akun, lalu pasang produk dan nomor WhatsApp.
          </p>
        ) : null}
        <div className="mt-[20px]">
          <Tombol href="/jadi-penjual" varian="primary" ukuran="lg" className="shadow-[4px_4px_0_#141210]">
            Buka toko gratis
          </Tombol>
        </div>
      </div>
    </section>
  );
}

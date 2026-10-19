import { Tombol } from "@/components/tombol";

export default function TidakDitemukan() {
  return (
    <section className="mx-auto my-[24px] max-w-[720px] overflow-hidden rounded-[22px] border-[1.5px] border-[#141210] bg-white">
      <div className="tenda" aria-hidden="true" />
      <div className="grid items-center gap-[20px] p-[24px] md:grid-cols-[auto_1fr] md:p-[36px]">
        <p className="font-display -rotate-3 border-[1.5px] border-[#141210] bg-[#ffd60a] px-[16px] py-[6px] text-center text-[72px] leading-none font-extrabold text-[#141210] shadow-[0_6px_18px_rgba(20,18,16,0.14)] md:text-[96px]">
          404
        </p>
        <div>
          <h1 className="text-[32px] leading-[1] md:text-[40px]">Lapaknya nggak ketemu.</h1>
          <p className="mt-[10px] text-[15px] leading-[1.5] text-[#6b5d4b]">
            Mungkin produknya sudah diturunkan penjual, atau alamatnya salah ketik.
          </p>
          <div className="mt-[18px] flex flex-wrap gap-[10px]">
            <Tombol href="/produk" ukuran="lg">
              Lihat semua produk
            </Tombol>
            <Tombol href="/" varian="secondary" ukuran="lg">
              Ke beranda
            </Tombol>
          </div>
        </div>
      </div>
    </section>
  );
}

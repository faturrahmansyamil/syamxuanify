import { Tombol } from "@/components/tombol";

const LANGKAH = [
  { judul: "Daftar", isi: "Bikin akun pakai email atau Google." },
  { judul: "Buka toko", isi: "Isi nama toko dari halaman akun." },
  { judul: "Pasang produk", isi: "Tambah foto, harga, dan nomor WhatsApp." },
] as const;

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
    <section className="rounded-[28px] bg-white px-[20px] py-[24px] shadow-[var(--shadow-sm-2)] md:px-[32px] md:py-[32px]">
      <h2 className="text-[24px] leading-[1.15] font-semibold text-[#000000] md:text-[32px]">{judul}</h2>
      <p className="mt-[8px] max-w-[560px] text-[14px] leading-[1.5] text-muted-gray md:text-[16px]">{isi}</p>
      {langkah ? (
        <ol className="mt-[20px] grid gap-[12px] sm:grid-cols-3">
          {LANGKAH.map((item, indeks) => (
            <li key={item.judul} className="rounded-[12px] bg-[#f2f4f5] px-[16px] py-[14px]">
              <span className="text-[13px] font-semibold text-muted-gray tabular-nums">{indeks + 1}</span>
              <p className="mt-[4px] text-[15px] font-semibold text-[#000000]">{item.judul}</p>
              <p className="mt-[2px] text-[13px] leading-[1.4] text-muted-gray">{item.isi}</p>
            </li>
          ))}
        </ol>
      ) : null}
      <div className="mt-[20px]">
        <Tombol href="/jadi-penjual" varian="primary" ukuran="lg">
          Buka toko gratis
        </Tombol>
      </div>
    </section>
  );
}

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { GambarIsi } from "@/components/gambar-isi";
import { IkonKategori } from "@/components/ikon-kategori";
import { Tombol } from "@/components/tombol";
import type { KategoriRingkas, ProdukPublik, TokoPilihan } from "@/lib/katalog";
import { formatRupiah } from "@/lib/rupiah";
import { urlGambarAman } from "@/lib/wa";

const WARNA_UBIN: Record<string, { bg: string; teks: string }> = {
  "makanan-jajanan": { bg: "#ffd60a", teks: "#141210" },
  "produk-digital": { bg: "#2d5bff", teks: "#ffffff" },
  jasa: { bg: "#00a859", teks: "#ffffff" },
  fashion: { bg: "#ff5fa2", teks: "#141210" },
  lainnya: { bg: "#ffffff", teks: "#141210" },
};

const MIRING = ["-rotate-6", "rotate-6", "-rotate-2"];

export function HeroLapak({ produk, children }: { produk: ProdukPublik[]; children: React.ReactNode }) {
  const tumpuk = produk.filter((item) => urlGambarAman(item.gambar_url)).slice(0, 3);
  return (
    <section className="overflow-hidden rounded-[22px] border-2 border-[#141210] bg-[#ff3b1f]">
      <div className="tenda" aria-hidden="true" />
      <div className="grid items-center gap-[28px] px-[18px] pt-[22px] pb-[26px] md:grid-cols-[1.15fr_0.85fr] md:px-[36px] md:pt-[32px] md:pb-[40px]">
        <div>
          <span className="font-display inline-block -rotate-2 border-2 border-[#141210] bg-[#ffd60a] px-[10px] py-[4px] text-[13px] font-extrabold tracking-[0.02em] text-[#141210] uppercase">
            Pasar anak kampus
          </span>
          <h1 className="mt-[14px] text-[40px] leading-[0.95] text-[#141210] md:text-[68px]">
            Jajan, jasa, sampai kaos himpunan. Penjualnya teman sekampus.
          </h1>
          <p className="mt-[14px] max-w-[460px] text-[16px] leading-[1.5] font-medium text-[#141210]">
            Pilih barangnya, chat penjualnya di WhatsApp, bayar langsung ke mereka. Nggak pakai keranjang.
          </p>
          <div className="mt-[20px] max-w-[520px]">{children}</div>
        </div>
        {tumpuk.length ? (
          <div className="relative hidden h-[360px] md:block" aria-hidden="true">
            {tumpuk.map((item, indeks) => (
              <div
                key={item.id}
                className={`absolute w-[200px] border-2 border-[#141210] bg-white p-[8px] pb-[12px] shadow-[6px_6px_0_#141210] ${MIRING[indeks]}`}
                style={{ left: `${[2, 44, 22][indeks]}%`, top: `${[0, 34, 150][indeks]}px`, zIndex: [1, 2, 3][indeks] }}
              >
                <span className="relative block aspect-square overflow-hidden border-2 border-[#141210]">
                  <GambarIsi src={urlGambarAman(item.gambar_url)!} sizes="200px" alt="" priority={indeks === 0} />
                </span>
                <p className="mt-[8px] truncate text-[13px] font-bold text-[#141210]">{item.judul}</p>
                <span className="font-display mt-[4px] inline-block bg-[#ffd60a] px-[6px] text-[15px] font-extrabold text-[#141210]">
                  {formatRupiah(item.harga)}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <Link
            href="/jadi-penjual"
            className="group relative hidden h-[300px] items-center justify-center md:flex"
          >
            <span
              className="font-display relative flex h-[210px] w-[320px] rotate-[-5deg] flex-col justify-center border-2 border-[#141210] bg-[#ffd60a] py-[20px] pr-[24px] pl-[64px] text-[#141210] shadow-[8px_8px_0_#141210] transition-transform duration-200 group-hover:rotate-[-2deg]"
              style={{ clipPath: "polygon(44px 0, 100% 0, 100% 100%, 44px 100%, 0 50%)" }}
            >
              <span className="absolute top-1/2 left-[22px] h-[16px] w-[16px] -translate-y-1/2 rounded-full border-2 border-[#141210] bg-[#ff3b1f]" />
              <span className="text-[15px] font-extrabold tracking-[0.04em] uppercase">Lapak masih kosong</span>
              <span className="mt-[6px] text-[34px] leading-[0.95] font-extrabold">Tempat pertama buat daganganmu</span>
            </span>
          </Link>
        )}
      </div>
    </section>
  );
}

export function UbinKategori({ kategori }: { kategori: KategoriRingkas[] }) {
  return (
    <section aria-label="Kategori">
      <ul className="grid grid-cols-2 gap-[10px] sm:grid-cols-3 lg:grid-cols-5">
        {kategori.map((item) => {
          const warna = WARNA_UBIN[item.slug] ?? WARNA_UBIN.lainnya;
          return (
            <li key={item.slug} className={item.slug === "lainnya" ? "col-span-2 sm:col-span-1" : undefined}>
              <Link href={`/kategori/${item.slug}`} className="ubin-kategori" style={{ background: warna.bg, color: warna.teks }}>
                <IkonKategori slug={item.slug} className="h-[26px] w-[26px]" />
                <span className="flex items-end justify-between gap-[8px]">
                  {item.nama}
                  <ArrowRight className="h-[18px] w-[18px] shrink-0" strokeWidth={2.5} aria-hidden="true" />
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
    </section>
  );
}

export function JudulLapak({ judul, href, label = "Lihat semua" }: { judul: string; href?: string; label?: string }) {
  return (
    <div className="mb-[16px] flex items-end justify-between gap-[12px] border-b-2 border-[#141210] pb-[10px]">
      <h2 className="text-[28px] md:text-[36px]">{judul}</h2>
      {href ? (
        <Link href={href} className="inline-flex shrink-0 items-center gap-[6px] text-[14px] font-bold text-[#141210] underline decoration-2 underline-offset-4 hover:text-[#ff3b1f]">
          {label}
          <ArrowRight className="h-[16px] w-[16px]" strokeWidth={2.5} aria-hidden="true" />
        </Link>
      ) : null}
    </div>
  );
}

export function PapanLaris({ produk }: { produk: ProdukPublik[] }) {
  if (!produk.length) return null;
  return (
    <section>
      <JudulLapak judul="Paling sering di-chat" href="/produk?urut=terlaris" />
      <ol className="grid gap-[10px] md:grid-cols-2 lg:grid-cols-3">
        {produk.slice(0, 6).map((item, indeks) => {
          const gambar = urlGambarAman(item.gambar_url);
          return (
            <li key={item.id}>
              <Link
                href={`/produk/${item.slug}`}
                className="group flex items-center gap-[12px] rounded-[14px] border-2 border-[#141210] bg-white p-[10px] transition-shadow hover:shadow-[4px_4px_0_#141210]"
              >
                <span className="angka-peringkat w-[1.3ch]! text-[52px]!">{indeks + 1}</span>
                <span className="relative h-[64px] w-[64px] shrink-0 overflow-hidden rounded-[10px] border-2 border-[#141210] bg-[#f6e6c4]">
                  {gambar ? <GambarIsi src={gambar} sizes="64px" alt="" /> : null}
                </span>
                <span className="min-w-0">
                  <span className="block truncate text-[15px] font-bold text-[#141210]">{item.judul}</span>
                  <span className="block truncate text-[13px] text-[#6b5d4b]">{item.toko?.nama_toko}</span>
                  <span className="font-display mt-[2px] inline-block bg-[#ffd60a] px-[6px] text-[15px] font-extrabold">{formatRupiah(item.harga)}</span>
                </span>
              </Link>
            </li>
          );
        })}
      </ol>
    </section>
  );
}

export function LapakBuka({ toko }: { toko: TokoPilihan[] }) {
  if (!toko.length) return null;
  return (
    <section>
      <JudulLapak judul="Lapak yang lagi buka" href="/toko" />
      <ul className="grid gap-[14px] sm:grid-cols-2 lg:grid-cols-3">
        {toko.slice(0, 6).map((item) => (
          <li key={item.id}>
            <Link href={`/toko/${item.slug}`} className="kartu block bg-white">
              <div className="tenda" aria-hidden="true" />
              <div className="p-[14px]">
                <p className="font-display text-[22px] leading-[1.05] font-extrabold text-[#141210]">{item.nama_toko}</p>
                <p className="mt-[4px] text-[13px] font-semibold text-[#6b5d4b]">
                  {item.jumlah} produk{item.terverifikasi ? " · terverifikasi" : ""}
                </p>
                <span className="mt-[12px] grid grid-cols-3 gap-[8px]">
                  {[0, 1, 2].map((indeks) => {
                    const src = item.foto[indeks];
                    return (
                      <span key={indeks} className="relative aspect-square overflow-hidden rounded-[10px] border-2 border-[#141210] bg-[#f6e6c4]">
                        {src ? <GambarIsi src={src} alt={`Produk dari ${item.nama_toko}`} sizes="(max-width: 640px) 28vw, 120px" /> : null}
                      </span>
                    );
                  })}
                </span>
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}

export function AjakJualan({ kosong }: { kosong: boolean }) {
  return (
    <section className="relative overflow-hidden rounded-[22px] border-2 border-[#141210] bg-[#ffd60a] px-[20px] py-[28px] md:px-[40px] md:py-[44px]">
      <div className="grid items-center gap-[20px] md:grid-cols-[1fr_auto]">
        <div>
          <h2 className="max-w-[720px] text-[34px] leading-[0.98] md:text-[52px]">
            {kosong ? "Belum ada yang jualan. Jadi penjual pertama di kampusmu." : "Punya dagangan? Pajang di sini, gratis."}
          </h2>
          <p className="mt-[12px] max-w-[560px] text-[16px] leading-[1.5] font-medium text-[#141210]">
            Daftar, buka toko dari halaman akun, lalu pasang produk dan nomor WhatsApp-mu. Pembeli langsung chat kamu, uangnya langsung ke kamu.
          </p>
        </div>
        <div className="flex flex-wrap gap-[10px]">
          <Tombol href="/jadi-penjual" ukuran="lg" className="shadow-[4px_4px_0_#141210]">
            Buka toko gratis
          </Tombol>
          <Tombol href="/syarat" varian="secondary" ukuran="lg">
            Baca aturannya
          </Tombol>
        </div>
      </div>
    </section>
  );
}

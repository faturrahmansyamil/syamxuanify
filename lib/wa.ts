import { formatRupiah } from "@/lib/rupiah";

export function pesanBeli(judul: string, harga: number) {
  return `Halo, saya mau beli ${judul} (${formatRupiah(harga)}) dari Syamxuanify`;
}

export function pesanPesan(toko: string, judul: string, jumlah: number, total: number, varian?: string) {
  const produk = varian ? `${judul} ${varian}` : judul;
  return `Halo ${toko}, saya mau pesan ${produk} sebanyak ${jumlah}, total ${formatRupiah(total)}. Apakah masih tersedia?`;
}

export function pesanToko(toko: string) {
  return `Halo ${toko}, saya mau tanya produk di toko kamu.`;
}

export function tautanWhatsApp(nomor: string, pesan: string) {
  const angka = nomor.replace(/\D/g, "");
  if (angka.length < 10 || angka.length > 15) return null;
  return `https://wa.me/${angka}?text=${encodeURIComponent(pesan)}`;
}

export function urlGambarAman(nilai: string | null | undefined) {
  if (!nilai) return null;
  try {
    const url = new URL(nilai);
    if (url.protocol !== "https:" && url.protocol !== "http:") return null;
    return url.toString();
  } catch {
    return null;
  }
}

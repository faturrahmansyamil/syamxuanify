"use client";

const JENIS = ["image/jpeg", "image/png", "image/webp"];
const BATAS = 2 * 1024 * 1024;

export async function kompresGambar(file: File, jagaKetajaman = false) {
  if (!JENIS.includes(file.type)) {
    throw new Error("Gambar harus JPG, PNG, atau WebP.");
  }

  if (file.size <= BATAS && (jagaKetajaman || file.size <= 700 * 1024)) {
    return file;
  }

  const bitmap = await createImageBitmap(file).catch(() => null);
  if (!bitmap) {
    throw new Error("Gambar tidak bisa dibaca. Coba file JPG, PNG, atau WebP lain.");
  }

  const sisi = 1600;
  const rasio = Math.min(1, sisi / Math.max(bitmap.width, bitmap.height));
  const kanvas = document.createElement("canvas");
  kanvas.width = Math.max(1, Math.round(bitmap.width * rasio));
  kanvas.height = Math.max(1, Math.round(bitmap.height * rasio));
  const konteks = kanvas.getContext("2d");
  if (!konteks) {
    bitmap.close();
    throw new Error("Browser ini tidak bisa memproses gambar.");
  }
  konteks.drawImage(bitmap, 0, 0, kanvas.width, kanvas.height);
  bitmap.close();

  const tipe = "image/webp";
  let kualitas = jagaKetajaman ? 0.92 : 0.8;
  let blob = await keBlob(kanvas, tipe, kualitas);
  if (!blob) blob = await keBlob(kanvas, "image/jpeg", kualitas);
  if (!blob) throw new Error("Gambar gagal diperkecil. Coba file lain.");

  while (blob.size > BATAS && kualitas > 0.5) {
    kualitas = Math.round((kualitas - 0.1) * 10) / 10;
    const berikutnya = await keBlob(kanvas, blob.type, kualitas);
    if (!berikutnya) break;
    blob = berikutnya;
  }

  if (blob.size > BATAS) {
    throw new Error("Gambar masih lebih dari 2 MB setelah diperkecil. Pilih foto yang lebih kecil.");
  }

  const ekstensi = blob.type === "image/jpeg" ? "jpg" : "webp";
  const nama = file.name.replace(/\.[^.]+$/, "") || "gambar";
  return new File([blob], `${nama}.${ekstensi}`, { type: blob.type });
}

function keBlob(kanvas: HTMLCanvasElement, tipe: string, kualitas: number) {
  return new Promise<Blob | null>((selesai) => {
    kanvas.toBlob((hasil) => selesai(hasil), tipe, kualitas);
  });
}

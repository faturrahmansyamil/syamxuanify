import type { Metadata } from "next";

export function ringkasTeks(teks: string | null | undefined, cadangan: string) {
  const bersih = (teks ?? "").replace(/\s+/g, " ").trim();
  if (!bersih) return cadangan;
  return bersih.length > 160 ? `${bersih.slice(0, 157)}...` : bersih;
}

export function metadataBagikan(judul: string, deskripsi: string, gambar?: string | null): Metadata {
  const url = gambar && gambar.startsWith("https://") ? gambar : "/og.jpg";
  const judulLengkap = `${judul} · Syamxuanify`;

  return {
    title: judul,
    description: deskripsi,
    openGraph: {
      title: judulLengkap,
      description: deskripsi,
      siteName: "Syamxuanify",
      locale: "id_ID",
      type: "website",
      images: [{ url, width: 1200, height: 630, alt: judul }],
    },
  };
}

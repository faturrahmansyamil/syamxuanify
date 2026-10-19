import Image from "next/image";
import { IkonKategori } from "@/components/ikon-kategori";

// Foto benda asli (latar dihapus, WebP kecil) yang nongol dari pojok ubin kategori.
const FOTO: Record<string, { src: string; w: number; h: number }> = {
  "makanan-jajanan": { src: "/kategori/makanan-jajanan.webp", w: 320, h: 182 },
  "produk-digital": { src: "/kategori/produk-digital.webp", w: 278, h: 260 },
  jasa: { src: "/kategori/jasa.webp", w: 320, h: 238 },
  fashion: { src: "/kategori/fashion.webp", w: 192, h: 260 },
  lainnya: { src: "/kategori/lainnya.webp", w: 246, h: 260 },
};

export function IkonUbin({ slug }: { slug: string }) {
  const foto = FOTO[slug];
  if (!foto) return <IkonKategori slug={slug} className="h-[26px] w-[26px]" />;
  return (
    <>
      <span aria-hidden="true" className="h-[26px]" />
      <Image src={foto.src} alt="" width={foto.w} height={foto.h} sizes="(max-width: 639px) 100px, 140px" unoptimized className="ubin-foto" />
    </>
  );
}

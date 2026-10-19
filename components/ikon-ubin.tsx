import Image from "next/image";
import { IkonKategori } from "@/components/ikon-kategori";

// Foto benda asli (latar dihapus, WebP kecil) yang nongol dari pojok ubin kategori.
const FOTO: Record<string, { src: string; w: number; h: number }> = {
  "makanan-jajanan": { src: "/kategori/makanan-jajanan.webp", w: 200, h: 115 },
  "produk-digital": { src: "/kategori/produk-digital.webp", w: 200, h: 123 },
  jasa: { src: "/kategori/jasa.webp", w: 200, h: 149 },
  fashion: { src: "/kategori/fashion.webp", w: 148, h: 200 },
  lainnya: { src: "/kategori/lainnya.webp", w: 126, h: 200 },
};

export function IkonUbin({ slug }: { slug: string }) {
  const foto = FOTO[slug];
  if (!foto) return <IkonKategori slug={slug} className="h-[26px] w-[26px]" />;
  return (
    <>
      <span aria-hidden="true" className="h-[26px]" />
      <Image src={foto.src} alt="" width={foto.w} height={foto.h} sizes="96px" unoptimized className="ubin-foto" />
    </>
  );
}

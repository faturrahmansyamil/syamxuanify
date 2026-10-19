// Foto mini bulat untuk pil kategori (WebP 72px, tampil 22px = 3x tajam di layar retina).
const ADA = new Set(["makanan-jajanan", "produk-digital", "jasa", "fashion", "lainnya"]);

function Bulat({ slug }: { slug: string }) {
  const kunci = ADA.has(slug) ? slug : "lainnya";
  // eslint-disable-next-line @next/next/no-img-element
  return <img src={`/kategori/mini/${kunci}.webp`} alt="" width={22} height={22} loading="lazy" decoding="async" className="thumb-kategori" />;
}

export function ThumbKategori({ slug }: { slug: string }) {
  if (slug === "semua") {
    return (
      <span className="thumb-tumpuk" aria-hidden="true">
        <Bulat slug="makanan-jajanan" />
        <Bulat slug="produk-digital" />
        <Bulat slug="fashion" />
      </span>
    );
  }
  return (
    <span aria-hidden="true" className="inline-flex">
      <Bulat slug={slug} />
    </span>
  );
}

import Link from "next/link";
import { IkonKategori } from "@/components/ikon-kategori";
import { ambilKatalog, bersihkanKata, slugAman, urutanAman, type UrutanKatalog } from "@/lib/katalog";
import { KisiProduk } from "@/components/kisi-produk";

export async function KatalogProduk({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; kategori?: string; urut?: string }>;
}) {
  const params = await searchParams;
  const kata = bersihkanKata(params.q);
  const kategori = slugAman(params.kategori) ? params.kategori : "";
  const urutan = urutanAman(params.urut);
  const hasil = await ambilKatalog(kata, kategori, urutan);

  if (!hasil.ok) {
    return <Kotak judul="Katalog belum bisa dimuat">{hasil.pesan}</Kotak>;
  }

  return (
    <div id="daftar-produk" className="scroll-mt-28 space-y-4">
      <div className="flex flex-wrap gap-2">
        <Filter href={tautanFilter("", kata, hasil.urutan)} aktif={!hasil.kategoriAktif} slug="semua">
          Semua
        </Filter>
        {hasil.kategori.map((item) => (
          <Filter
            key={item.slug}
            href={tautanFilter(item.slug, kata, hasil.urutan)}
            aktif={hasil.kategoriAktif === item.slug}
            slug={item.slug}
          >
            {item.nama}
          </Filter>
        ))}
      </div>
      <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
        <span className="text-sm text-foggy">Urutkan</span>
        {URUTAN.map((item) => (
          <Link
            key={item.id}
            href={tautanFilter(kategori, kata, item.id)}
            className={`text-sm ${hasil.urutan === item.id ? "font-semibold text-hof" : "text-foggy hover:text-hof"}`}
          >
            {item.nama}
          </Link>
        ))}
      </div>
      {hasil.produk.length === 0 ? (
        <Kotak judul="Tidak ada produk">
          {kata || hasil.kategoriAktif
            ? "Tidak ada produk yang cocok. Coba kata lain atau pilih kategori Semua."
            : "Belum ada produk yang disetujui."}
        </Kotak>
      ) : (
        <KisiProduk produk={hasil.produk} kembali={tautanFilter(kategori, kata, hasil.urutan)} />
      )}
    </div>
  );
}

const URUTAN: Array<{ id: UrutanKatalog; nama: string }> = [
  { id: "terbaru", nama: "Terbaru" },
  { id: "terlaris", nama: "Terlaris" },
  { id: "murah", nama: "Harga termurah" },
  { id: "mahal", nama: "Harga termahal" },
];

function tautanFilter(kategori: string, kata: string, urutan: UrutanKatalog = "terbaru") {
  const params = new URLSearchParams();
  if (kata) params.set("q", kata);
  if (kategori) params.set("kategori", kategori);
  if (urutan !== "terbaru") params.set("urut", urutan);
  const query = params.toString();
  return query ? `/?${query}` : "/";
}

function Filter({
  href,
  aktif,
  slug,
  children,
}: {
  href: string;
  aktif: boolean;
  slug: string;
  children: string;
}) {
  return (
    <Link
      href={href}
      prefetch={true}
      className={`inline-flex items-center gap-2 rounded-xl border-2 px-3 py-2 text-sm font-bold ${
        aktif ? "chip-aktif" : "border-bebe bg-card text-hof hover:bg-deco"
      }`}
    >
      <IkonKategori slug={slug} className="h-4 w-4" />
      {children}
    </Link>
  );
}

function Kotak({ judul, children }: { judul: string; children: string }) {
  return (
    <div className="rounded-2xl border-2 border-bebe bg-card px-4 py-5">
      <h3 className="text-sm font-semibold text-hof">{judul}</h3>
      <p className="mt-2 text-sm leading-6 text-foggy">{children}</p>
    </div>
  );
}

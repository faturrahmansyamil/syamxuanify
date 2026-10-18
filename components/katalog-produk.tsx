import { IkonKategori } from "@/components/ikon-kategori";
import { JalurChip } from "@/components/jalur-chip";
import { Tombol } from "@/components/tombol";
import { ambilKatalog, bersihkanKata, slugAman, urutanAman, type UrutanKatalog } from "@/lib/katalog";
import { KisiProduk } from "@/components/kisi-produk";
import { Muncul } from "@/components/muncul";

export async function KatalogProduk({
  searchParams,
  dasar = "/produk",
}: {
  searchParams: Promise<{ q?: string; kategori?: string; urut?: string }>;
  dasar?: string;
}) {
  const params = await searchParams;
  const kata = bersihkanKata(params.q);
  const kategori = slugAman(params.kategori) ? params.kategori : "";
  const urutan = urutanAman(params.urut);
  const hasil = await ambilKatalog(kata, kategori, urutan);

  if (!hasil.ok) {
    return <Kotak judul="Katalog belum bisa dimuat">{hasil.pesan}</Kotak>;
  }

  const kategoriFilter = (
      <JalurChip>
        <Filter href={tautanFilter(dasar === "/cari" ? "/cari" : "/produk", "", kata, hasil.urutan)} aktif={!hasil.kategoriAktif} slug="semua">
          Semua
        </Filter>
        {hasil.kategori.map((item) => (
          <Filter
            key={item.slug}
            href={tautanFilter(`/kategori/${item.slug}`, "", kata, hasil.urutan)}
            aktif={hasil.kategoriAktif === item.slug}
            slug={item.slug}
          >
            {item.nama}
          </Filter>
        ))}
      </JalurChip>
  );

  const daftar = (
      <section className="space-y-[16px]">
        <JalurChip>
          {URUTAN.map((item) => (
            <Tombol
              key={item.id}
              href={tautanFilter(dasar, kategori, kata, item.id)}
              chip
              varian={hasil.urutan === item.id ? "primary" : "secondary"}
              className="shrink-0"
            >
              {item.nama}
            </Tombol>
          ))}
        </JalurChip>
        {hasil.produk.length === 0 ? (
          <Kotak judul="Tidak ada produk">
            {kata || hasil.kategoriAktif
              ? "Tidak ada produk yang cocok. Coba kata lain atau pilih kategori Semua."
              : "Belum ada produk yang disetujui."}
          </Kotak>
        ) : (
          <KisiProduk
            produk={hasil.produk}
            kembali={tautanFilter(dasar, kategori, kata, hasil.urutan)}
            kolom="padat"
          />
        )}
      </section>
  );

  return (
    <Muncul>
      <div className="scroll-mt-28 space-y-[16px]">
        <h1>{dasar === "/cari" ? (kata ? kata : "Cari") : hasil.kategori.find((item) => item.slug === hasil.kategoriAktif)?.nama ?? "Semua produk"}</h1>
        {kategoriFilter}
        {daftar}
      </div>
    </Muncul>
  );
}

const URUTAN: Array<{ id: UrutanKatalog; nama: string }> = [
  { id: "terbaru", nama: "Terbaru" },
  { id: "terlaris", nama: "Terlaris" },
  { id: "murah", nama: "Harga termurah" },
  { id: "mahal", nama: "Harga termahal" },
];

function tautanFilter(dasar: string, kategori: string, kata: string, urutan: UrutanKatalog = "terbaru") {
  const params = new URLSearchParams();
  if (kata) params.set("q", kata);
  if (kategori) params.set("kategori", kategori);
  if (urutan !== "terbaru") params.set("urut", urutan);
  const query = params.toString();
  return query ? `${dasar}?${query}` : dasar;
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
    <Tombol href={href} prefetch={true} chip varian={aktif ? "primary" : "secondary"} className="shrink-0">
      <IkonKategori slug={slug} />
      {children}
    </Tombol>
  );
}

function Kotak({ judul, children }: { judul: string; children: string }) {
  return (
    <Muncul>
      <div className="kartu px-[20px] py-[16px]">
        <h3>{judul}</h3>
        <p className="mt-[8px] text-[14px] leading-[1.4] text-muted-gray">{children}</p>
      </div>
    </Muncul>
  );
}

import { connection } from "next/server";
import { peranPengguna } from "@/lib/peran";
import { hasSupabaseEnv } from "@/lib/supabase/env";
import { createClient } from "@/lib/supabase/server";
import { urlGambarAman } from "@/lib/wa";

export type KategoriRingkas = {
  nama: string;
  slug: string;
  urutan?: number;
};

export type TokoPublik = {
  id: string;
  nama_toko: string;
  slug: string;
  deskripsi: string | null;
  no_wa: string;
  qris_url: string | null;
  logo_url: string | null;
  terverifikasi: boolean;
};

export type ProdukPublik = {
  id: string;
  judul: string;
  slug: string;
  deskripsi: string | null;
  harga: number;
  gambar_url: string | null;
  kategori: KategoriRingkas | null;
  toko: TokoPublik | null;
  status?: string;
  is_available?: boolean;
  stock?: number | null;
  sold_count?: number;
  condition?: "baru" | "bekas";
  preorder_days?: number | null;
  weight_or_size?: string | null;
};

export type UrutanKatalog = "terbaru" | "terlaris" | "murah" | "mahal";

export type VarianEtalase = {
  id: string;
  nama: string;
  harga: number | null;
  stock: number | null;
};

export type TetanggaProduk = {
  foto: string[];
  varian: VarianEtalase[];
  lain: ProdukPublik[];
  serupa: ProdukPublik[];
  jumlahToko: number;
};

const URUTAN_KATEGORI = ["makanan-jajanan", "produk-digital", "jasa", "fashion", "lainnya"];

const KOLOM_PRODUK = `
  id, judul, slug, deskripsi, harga, gambar_url, status, is_available,
  categories!inner(nama, slug),
  shops!inner(id, nama_toko, slug, deskripsi, no_wa, qris_url, logo_url, terverifikasi, status)
`;

const KOLOM_ETALASE = `
  id, judul, slug, deskripsi, harga, gambar_url, status, is_available,
  stock, sold_count, condition, preorder_days, weight_or_size,
  categories!inner(nama, slug),
  shops!inner(id, nama_toko, slug, deskripsi, no_wa, qris_url, logo_url, terverifikasi, status)
`;

type BarisKategori = KategoriRingkas | KategoriRingkas[] | null;
type BarisToko = (TokoPublik & { status: string }) | Array<TokoPublik & { status: string }> | null;
type BarisProduk = {
  id: string;
  judul: string;
  slug: string;
  deskripsi: string | null;
  harga: number;
  gambar_url: string | null;
  status?: string;
  is_available?: boolean;
  stock?: number | null;
  sold_count?: number | null;
  condition?: string | null;
  preorder_days?: number | null;
  weight_or_size?: string | null;
  categories: BarisKategori;
  shops: BarisToko;
};

export function urutanAman(nilai: string | undefined): UrutanKatalog {
  if (nilai === "terlaris" || nilai === "murah" || nilai === "mahal") return nilai;
  return "terbaru";
}

export function slugAman(nilai: string | undefined): nilai is string {
  return Boolean(nilai && /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(nilai));
}

export function bersihkanKata(nilai: string | undefined) {
  return (nilai ?? "")
    .replace(/[%_,().\\]/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 80);
}

export async function ambilKatalog(
  kataMentah: string | undefined,
  kategoriMentah: string | undefined,
  urutMentah?: string,
) {
  const siap = await siapkan();
  if (!siap.ok) return { ok: false as const, pesan: siap.pesan };

  const kata = bersihkanKata(kataMentah);
  const kategori = slugAman(kategoriMentah) ? kategoriMentah : "";
  const urutan = urutanAman(urutMentah);
  const [produkRes, kategoriRes] = await Promise.all([
    muatProdukPublik(siap.supabase, kata, kategori, urutan),
    muatKategoriPublik(siap.supabase),
  ]);

  if (produkRes.error) return { ok: false as const, pesan: pesanDatabase(produkRes.error.message) };
  if (kategoriRes.error) return { ok: false as const, pesan: pesanDatabase(kategoriRes.error.message) };

  return {
    ok: true as const,
    produk: ((produkRes.data ?? []) as BarisProduk[]).map(jadikanProduk).filter(adaToko),
    kategori: urutkanKategori((kategoriRes.data ?? []) as KategoriRingkas[]),
    kata,
    kategoriAktif: kategori ?? "",
    urutan,
  };
}

export async function ambilProduk(slug: string, opsi?: { lihatAdmin?: boolean }) {
  if (!slugAman(slug)) return { ok: true as const, produk: [] as ProdukPublik[] };

  const siap = await siapkan();
  if (!siap.ok) return { ok: false as const, pesan: siap.pesan };

  const pertama = await muatSatuProduk(siap.supabase, slug);
  let data = pertama.data;
  let error = pertama.error;

  if (!error && (data ?? []).length === 0 && opsi?.lihatAdmin && (await peranPengguna(siap.supabase)) === "admin") {
    const longgar = await siap.supabase.from("products").select(KOLOM_ETALASE).eq("slug", slug);
    if (longgar.error && kolomEtalase(longgar.error.message)) {
      const dasar = await siap.supabase.from("products").select(KOLOM_PRODUK).eq("slug", slug);
      data = dasar.data;
      error = dasar.error;
    } else {
      data = longgar.data;
      error = longgar.error;
    }
  }

  if (error) return { ok: false as const, pesan: pesanDatabase(error.message) };

  return {
    ok: true as const,
    produk: ((data ?? []) as BarisProduk[]).map(jadikanProduk).filter(adaToko),
  };
}

export async function ambilProdukId(ids: string[]) {
  const unik = [...new Set(ids.filter((id) => /^[0-9a-f-]{36}$/i.test(id)))];
  if (unik.length === 0) return [] as ProdukPublik[];

  const siap = await siapkan();
  if (!siap.ok) return [] as ProdukPublik[];

  const etalase = await siap.supabase.from("products").select(KOLOM_ETALASE).in("id", unik).eq("status", "approved");
  const dasar =
    etalase.error && kolomEtalase(etalase.error.message)
      ? await siap.supabase.from("products").select(KOLOM_PRODUK).in("id", unik).eq("status", "approved")
      : etalase;
  const { data, error } = dasar;
  if (error || !data) return [] as ProdukPublik[];

  const peta = new Map(((data ?? []) as BarisProduk[]).map((baris) => [baris.id, jadikanProduk(baris)]));
  return unik.map((id) => peta.get(id)).filter((item): item is ProdukPublik => Boolean(item?.toko));
}

export async function ambilToko(slug: string, opsi?: { lihatMilik?: boolean; lihatAdmin?: boolean }) {
  if (!slugAman(slug)) return { ok: true as const, toko: null, produk: [] as ProdukPublik[] };

  const siap = await siapkan();
  if (!siap.ok) return { ok: false as const, pesan: siap.pesan };

  const { data, error } = await muatSatuToko(siap.supabase, slug);

  if (error) return { ok: false as const, pesan: pesanDatabase(error.message) };
  if (!data) return { ok: true as const, toko: null, produk: [] as ProdukPublik[] };

  if (data.status !== "approved") {
    if (!opsi?.lihatMilik && !opsi?.lihatAdmin) {
      return { ok: true as const, toko: null, produk: [] as ProdukPublik[] };
    }
    const { data: klaim } = await siap.supabase.auth.getClaims();
    const uid = typeof klaim?.claims?.sub === "string" ? klaim.claims.sub : "";
    const pemilik = Boolean(opsi?.lihatMilik && uid && data.owner_id === uid);
    const admin = Boolean(opsi?.lihatAdmin && (await peranPengguna(siap.supabase)) === "admin");
    if (!pemilik && !admin) {
      return { ok: true as const, toko: null, produk: [] as ProdukPublik[] };
    }
  }

  const toko = data as TokoPublik & {
    status: string;
    owner_id: string;
    products: Array<BarisProduk & { status: string }> | null;
  };
  const produk = (toko.products ?? [])
    .filter((item) => item.status === "approved")
    .map((item) =>
      jadikanProduk({
        ...item,
        shops: {
          id: toko.id,
          nama_toko: toko.nama_toko,
          slug: toko.slug,
          deskripsi: toko.deskripsi,
          no_wa: toko.no_wa,
          qris_url: toko.qris_url,
          logo_url: toko.logo_url,
          terverifikasi: toko.terverifikasi,
          status: "approved",
        },
      }),
    )
    .sort((a, b) => a.judul.localeCompare(b.judul, "id"));

  return {
    ok: true as const,
    toko: {
      id: toko.id,
      nama_toko: toko.nama_toko,
      slug: toko.slug,
      deskripsi: toko.deskripsi,
      no_wa: toko.no_wa,
      qris_url: toko.qris_url,
      logo_url: toko.logo_url,
      terverifikasi: toko.terverifikasi,
      status: toko.status,
      is_closed: Boolean((data as { is_closed?: boolean }).is_closed),
    },
    produk,
  };
}

export async function penggunaMasuk() {
  await connection();
  if (!hasSupabaseEnv()) return false;
  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();
  return Boolean(data?.claims?.sub);
}

export type TokoPilihan = {
  id: string;
  nama_toko: string;
  slug: string;
  logo_url: string | null;
  terverifikasi: boolean;
  jumlah: number;
};

export async function ambilTokoPilihan(): Promise<TokoPilihan[]> {
  const siap = await siapkan();
  if (!siap.ok) return [];

  const { data, error } = await siap.supabase
    .from("shops")
    .select("id, nama_toko, slug, logo_url, terverifikasi, products(status)")
    .eq("status", "approved")
    .order("created_at", { ascending: false })
    .limit(6);

  if (error || !data) return [];

  return data.map((baris) => ({
    id: baris.id,
    nama_toko: baris.nama_toko,
    slug: baris.slug,
    logo_url: baris.logo_url,
    terverifikasi: Boolean(baris.terverifikasi),
    jumlah: hitungProdukDisetujui(baris.products),
  }));
}

function hitungProdukDisetujui(produk: { status: string }[] | { status: string } | null) {
  const daftar = !produk ? [] : Array.isArray(produk) ? produk : [produk];
  return daftar.filter((item) => item.status === "approved").length;
}

async function siapkan() {
  await connection();
  if (!hasSupabaseEnv()) {
    return {
      ok: false as const,
      pesan: "Isi URL dan anon key di file .env.local, simpan, lalu jalankan ulang npm run dev.",
    };
  }

  try {
    const supabase = await createClient();
    return { ok: true as const, supabase };
  } catch {
    return { ok: false as const, pesan: "Supabase tidak terjangkau. Periksa koneksi, lalu muat ulang halaman." };
  }
}

function jadikanProduk(baris: BarisProduk): ProdukPublik {
  const kategori = satu(baris.categories);
  const toko = satu(baris.shops);
  return {
    id: baris.id,
    judul: baris.judul,
    slug: baris.slug,
    deskripsi: baris.deskripsi,
    harga: baris.harga,
    gambar_url: baris.gambar_url,
    status: baris.status,
    is_available: baris.is_available !== false,
    stock: typeof baris.stock === "number" || baris.stock === null ? baris.stock : undefined,
    sold_count: typeof baris.sold_count === "number" ? baris.sold_count : undefined,
    condition: baris.condition === "bekas" || baris.condition === "baru" ? baris.condition : undefined,
    preorder_days: typeof baris.preorder_days === "number" ? baris.preorder_days : null,
    weight_or_size: baris.weight_or_size || null,
    kategori: kategori ? { nama: kategori.nama, slug: kategori.slug } : null,
    toko: toko
      ? {
          id: toko.id,
          nama_toko: toko.nama_toko,
          slug: toko.slug,
          deskripsi: toko.deskripsi,
          no_wa: toko.no_wa,
          qris_url: toko.qris_url,
          logo_url: toko.logo_url,
          terverifikasi: toko.terverifikasi,
        }
      : null,
  };
}

function adaToko(produk: ProdukPublik): produk is ProdukPublik & { toko: TokoPublik } {
  return produk.toko !== null;
}

function satu<T>(nilai: T | T[] | null | undefined) {
  if (!nilai) return null;
  return Array.isArray(nilai) ? (nilai[0] ?? null) : nilai;
}

function urutkanKategori(daftar: KategoriRingkas[]) {
  return [...daftar].sort((a, b) => {
    if (typeof a.urutan === "number" && typeof b.urutan === "number") {
      return a.urutan - b.urutan || a.nama.localeCompare(b.nama, "id");
    }
    const urutanA = URUTAN_KATEGORI.indexOf(a.slug);
    const urutanB = URUTAN_KATEGORI.indexOf(b.slug);
    return (urutanA === -1 ? 99 : urutanA) - (urutanB === -1 ? 99 : urutanB);
  });
}

function kolomPengaturan(pesan: string) {
  const rendah = pesan.toLowerCase();
  return ["is_closed", "aktif", "urutan", "site_settings", "favorites", "riwayat_lihat", "is_blocked"].some((kolom) =>
    rendah.includes(kolom),
  );
}

function kolomEtalase(pesan: string) {
  const rendah = pesan.toLowerCase();
  return (
    ["stock", "sold_count", "preorder_days", "weight_or_size", "product_images", "product_variants"].some((kolom) =>
      rendah.includes(kolom),
    ) ||
    (rendah.includes("condition") && (rendah.includes("column") || rendah.includes("schema")))
  );
}

async function muatProdukPublik(
  supabase: Awaited<ReturnType<typeof createClient>>,
  kata: string,
  kategori: string,
  urutan: UrutanKatalog,
) {
  const langkah: Array<[boolean, boolean]> = [
    [true, true],
    [true, false],
    [false, true],
    [false, false],
  ];
  let hasil = await kueriKatalog(supabase, kata, kategori, urutan, true, true);
  for (const [etalase, tutup] of langkah.slice(1)) {
    if (!hasil.error) break;
    if (!kolomEtalase(hasil.error.message) && !kolomPengaturan(hasil.error.message)) break;
    hasil = await kueriKatalog(supabase, kata, kategori, urutan, etalase, tutup);
  }
  return hasil;
}

function kueriKatalog(
  supabase: Awaited<ReturnType<typeof createClient>>,
  kata: string,
  kategori: string,
  urutan: UrutanKatalog,
  etalase: boolean,
  tutup: boolean,
) {
  if (etalase) {
    let query = supabase.from("products").select(KOLOM_ETALASE).eq("status", "approved").eq("shops.status", "approved");
    if (tutup) query = query.eq("shops.is_closed", false).eq("categories.aktif", true);
    if (kategori) query = query.eq("categories.slug", kategori);
    if (kata) query = query.or(`judul.ilike.%${kata}%,deskripsi.ilike.%${kata}%`);
    if (urutan === "murah") return query.order("harga", { ascending: true });
    if (urutan === "mahal") return query.order("harga", { ascending: false });
    if (urutan === "terlaris") return query.order("sold_count", { ascending: false });
    return query.order("created_at", { ascending: false });
  }

  let query = supabase.from("products").select(KOLOM_PRODUK).eq("status", "approved").eq("shops.status", "approved");
  if (tutup) query = query.eq("shops.is_closed", false).eq("categories.aktif", true);
  if (kategori) query = query.eq("categories.slug", kategori);
  if (kata) query = query.or(`judul.ilike.%${kata}%,deskripsi.ilike.%${kata}%`);
  if (urutan === "murah") return query.order("harga", { ascending: true });
  if (urutan === "mahal") return query.order("harga", { ascending: false });
  return query.order("created_at", { ascending: false });
}

async function muatKategoriPublik(supabase: Awaited<ReturnType<typeof createClient>>) {
  const pertama = await supabase.from("categories").select("nama, slug, urutan").eq("aktif", true).order("urutan");
  if (pertama.error && kolomPengaturan(pertama.error.message)) {
    return supabase.from("categories").select("nama, slug");
  }
  return pertama;
}

async function muatSatuProduk(supabase: Awaited<ReturnType<typeof createClient>>, slug: string) {
  const etalase = await supabase
    .from("products")
    .select(KOLOM_ETALASE)
    .eq("slug", slug)
    .eq("status", "approved")
    .eq("shops.status", "approved");
  if (etalase.error && kolomEtalase(etalase.error.message)) {
    return supabase
      .from("products")
      .select(KOLOM_PRODUK)
      .eq("slug", slug)
      .eq("status", "approved")
      .eq("shops.status", "approved");
  }
  return etalase;
}

const KOLOM_TOKO = `id, owner_id, nama_toko, slug, deskripsi, no_wa, qris_url, logo_url, terverifikasi, status,
       products(id, judul, slug, deskripsi, harga, gambar_url, status, is_available, categories(nama, slug))`;

async function muatSatuToko(supabase: Awaited<ReturnType<typeof createClient>>, slug: string) {
  const etalase = await supabase
    .from("shops")
    .select(
      `id, owner_id, nama_toko, slug, deskripsi, no_wa, qris_url, logo_url, terverifikasi, status, is_closed,
       products(id, judul, slug, deskripsi, harga, gambar_url, status, is_available, stock, sold_count, categories(nama, slug))`,
    )
    .eq("slug", slug)
    .maybeSingle();
  if (!etalase.error) return etalase;
  if (!(kolomEtalase(etalase.error.message) || kolomPengaturan(etalase.error.message))) return etalase;

  const pertama = await supabase
    .from("shops")
    .select(`${KOLOM_TOKO}, is_closed`)
    .eq("slug", slug)
    .maybeSingle();
  if (pertama.error && kolomPengaturan(pertama.error.message)) {
    return supabase.from("shops").select(KOLOM_TOKO).eq("slug", slug).maybeSingle();
  }
  return pertama;
}

export async function ambilTetangga(produk: ProdukPublik): Promise<TetanggaProduk> {
  const fotoAwal = urlGambarAman(produk.gambar_url);
  const kosong: TetanggaProduk = {
    foto: fotoAwal ? [fotoAwal] : [],
    varian: [],
    lain: [],
    serupa: [],
    jumlahToko: 0,
  };
  const siap = await siapkan();
  if (!siap.ok || !produk.toko) return kosong;

  const [foto, varian, lain, serupa, jumlahToko] = await Promise.all([
    muatFoto(siap.supabase, produk.id, fotoAwal),
    muatVarian(siap.supabase, produk.id),
    muatLain(siap.supabase, produk),
    muatSerupa(siap.supabase, produk),
    hitungProdukToko(siap.supabase, produk.toko.id),
  ]);
  return { foto, varian, lain, serupa, jumlahToko };
}

async function muatFoto(
  supabase: Awaited<ReturnType<typeof createClient>>,
  id: string,
  cadangan: string | null,
) {
  const { data, error } = await supabase
    .from("product_images")
    .select("url, urutan")
    .eq("product_id", id)
    .order("urutan");
  if (error || !data?.length) return cadangan ? [cadangan] : [];
  const foto = data.map((baris) => urlGambarAman(baris.url)).filter((url): url is string => Boolean(url));
  return foto.length ? foto : cadangan ? [cadangan] : [];
}

async function muatVarian(supabase: Awaited<ReturnType<typeof createClient>>, id: string) {
  const { data, error } = await supabase
    .from("product_variants")
    .select("id, nama, harga, stock, urutan")
    .eq("product_id", id)
    .order("urutan");
  if (error || !data) return [] as VarianEtalase[];
  return data
    .filter((baris) => baris.nama.trim())
    .map((baris) => ({
      id: baris.id,
      nama: baris.nama,
      harga: typeof baris.harga === "number" ? baris.harga : null,
      stock: typeof baris.stock === "number" ? baris.stock : null,
    }));
}

async function muatLain(supabase: Awaited<ReturnType<typeof createClient>>, produk: ProdukPublik) {
  const shopId = produk.toko?.id;
  if (!shopId) return [] as ProdukPublik[];
  const etalase = await supabase
    .from("products")
    .select(KOLOM_ETALASE)
    .eq("status", "approved")
    .eq("shops.status", "approved")
    .eq("shop_id", shopId)
    .neq("id", produk.id)
    .order("created_at", { ascending: false })
    .limit(8);
  const hasil =
    etalase.error && kolomEtalase(etalase.error.message)
      ? await supabase
          .from("products")
          .select(KOLOM_PRODUK)
          .eq("status", "approved")
          .eq("shops.status", "approved")
          .eq("shop_id", shopId)
          .neq("id", produk.id)
          .order("created_at", { ascending: false })
          .limit(8)
      : etalase;
  if (hasil.error || !hasil.data) return [] as ProdukPublik[];
  return (hasil.data as BarisProduk[]).map(jadikanProduk).filter(adaToko);
}

async function muatSerupa(supabase: Awaited<ReturnType<typeof createClient>>, produk: ProdukPublik) {
  const slug = produk.kategori?.slug;
  const shopId = produk.toko?.id;
  if (!slug || !shopId) return [] as ProdukPublik[];
  const etalase = await supabase
    .from("products")
    .select(KOLOM_ETALASE)
    .eq("status", "approved")
    .eq("shops.status", "approved")
    .eq("categories.slug", slug)
    .neq("shop_id", shopId)
    .neq("id", produk.id)
    .order("created_at", { ascending: false })
    .limit(8);
  const hasil =
    etalase.error && kolomEtalase(etalase.error.message)
      ? await supabase
          .from("products")
          .select(KOLOM_PRODUK)
          .eq("status", "approved")
          .eq("shops.status", "approved")
          .eq("categories.slug", slug)
          .neq("shop_id", shopId)
          .neq("id", produk.id)
          .order("created_at", { ascending: false })
          .limit(8)
      : etalase;
  if (hasil.error || !hasil.data) return [] as ProdukPublik[];
  return (hasil.data as BarisProduk[]).map(jadikanProduk).filter(adaToko);
}

async function hitungProdukToko(supabase: Awaited<ReturnType<typeof createClient>>, shopId: string) {
  const { count, error } = await supabase
    .from("products")
    .select("id", { count: "exact", head: true })
    .eq("shop_id", shopId)
    .eq("status", "approved");
  if (error) return 0;
  return count ?? 0;
}

function pesanDatabase(pesan: string) {
  const rendah = pesan.toLowerCase();
  if (rendah.includes("is_closed") || rendah.includes("site_settings") || rendah.includes("favorites") || rendah.includes("is_blocked")) {
    return "Database belum punya tabel pengaturan. Jalankan supabase/migration-4-7.sql di SQL Editor Supabase, lalu muat ulang halaman.";
  }
  if (kolomEtalase(pesan)) {
    return "Database etalase belum siap. Jalankan supabase/migration-4-8.sql di SQL Editor Supabase, lalu muat ulang halaman.";
  }
  if (rendah.includes("is_available") || rendah.includes("rejection_reason")) {
    return "Database belum punya kolom baru. Jalankan supabase/migration-4-5.sql di SQL Editor Supabase, lalu muat ulang halaman.";
  }
  if (rendah.includes("does not exist") || rendah.includes("schema cache") || rendah.includes("relation")) {
    return "Tabel belum ada. Jalankan supabase/schema.sql di SQL Editor Supabase.";
  }
  if (rendah.includes("invalid api key") || rendah.includes("jwt")) {
    return "Kunci Supabase di .env.local belum benar. Simpan lagi, lalu jalankan ulang npm run dev.";
  }
  return "Permintaan ke database gagal. Muat ulang halaman ini.";
}

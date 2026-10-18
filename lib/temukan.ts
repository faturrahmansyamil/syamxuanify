import { connection } from "next/server";
import { fotoPenjual } from "@/lib/contoh-penjual";
import { bersihkanKata } from "@/lib/katalog";
import { hasSupabaseEnv } from "@/lib/supabase/env";
import { createClient } from "@/lib/supabase/server";
import { urlGambarAman } from "@/lib/wa";

export type ArahPeringkat = "naik" | "turun" | null;

export type BarisPeringkat = {
  id: string;
  judul: string;
  slug: string;
  harga: number;
  gambar: string | null;
  toko: string;
  habis: boolean;
  arah: ArahPeringkat;
};

export type PenjualBaru = {
  nama: string;
  slug: string;
  deskripsi: string | null;
  logo: string | null;
  terverifikasi: boolean;
};

export type ButirTren = {
  id: string;
  judul: string;
  slug: string;
  harga: number;
  gambar: string | null;
  toko: string;
};

export type KolomTren = {
  judul: string;
  slug: string;
  produk: ButirTren[];
};

export type KartuBaru = {
  id: string;
  judul: string;
  slug: string;
  harga: number;
  gambar: string | null;
  toko: string;
  slugToko: string;
  wa: string;
};

export type PenjualTop = {
  id: string;
  nama: string;
  slug: string;
  logo: string | null;
  jumlah: number;
  klik: number;
  terverifikasi: boolean;
};

export type SaranCari = {
  produk: Array<{ id: string; judul: string; slug: string; harga: number; gambar: string | null; toko: string }>;
  toko: Array<{ id: string; nama: string; slug: string; logo: string | null }>;
};

export type IsiTemukan = {
  hariIni: BarisPeringkat[];
  favorit: BarisPeringkat[];
  penjualBaru: PenjualBaru | null;
  tren: KolomTren[];
  baruMendarat: KartuBaru[];
  topPenjual: PenjualTop[];
};

const TREN = [
  { judul: "Top Jajanan", slug: "makanan-jajanan" },
  { judul: "Top Produk Digital", slug: "produk-digital" },
  { judul: "Top Jasa", slug: "jasa" },
];

type BarisKlik = {
  id: string;
  judul: string;
  slug: string;
  harga: number;
  gambar_url: string | null;
  is_available?: boolean | null;
  stock?: number | null;
  klik_wa?: number | null;
  shops: { nama_toko: string; slug: string; logo_url?: string | null; status?: string; terverifikasi?: boolean } | Array<{ nama_toko: string; slug: string; logo_url?: string | null; status?: string; terverifikasi?: boolean }> | null;
  categories?: { slug: string } | Array<{ slug: string }> | null;
};

export async function ambilTemukan(): Promise<IsiTemukan> {
  await connection();
  const sekarang = new Date();
  const hariIni = tanggalJakarta(sekarang, 0);
  const kemarin = tanggalJakarta(sekarang, -1);
  const kosong: IsiTemukan = { hariIni: [], favorit: [], penjualBaru: null, tren: [], baruMendarat: [], topPenjual: [] };
  const supabase = await klien();
  if (!supabase) return kosong;

  const [penjualBaru, klik, harian, baruMendarat, terbaru] = await Promise.all([
    muatPenjualBaru(supabase),
    muatProdukKlik(supabase),
    muatHarian(supabase, hariIni, kemarin),
    muatBaruMendarat(supabase),
    muatProdukUrut(supabase),
  ]);

  const adaKlik = klik.some((item) => (item.klik_wa ?? 0) > 0);
  const cadangan = terbaru.slice(0, 5).map((item, indeks) => jadikanBaris(item, indeks + 1, null));
  const favorit = adaKlik ? susunFavorit(klik, harian.hariIni) : cadangan;
  const hari = harian.baris.length > 0 ? harian.baris : cadangan;
  const trenKlik = adaKlik ? susunTren(klik) : [];
  const tren = trenKlik.length > 0 ? trenKlik : susunTren(terbaru);
  const topPenjual = await muatTopPenjual(supabase);

  return { hariIni: hari, favorit, penjualBaru, tren, baruMendarat, topPenjual };
}

export async function cariSaran(mentah: string): Promise<SaranCari> {
  const kata = bersihkanKata(mentah);
  const kosong: SaranCari = { produk: [], toko: [] };
  if (kata.length < 1) return kosong;
  const supabase = await klien();
  if (!supabase) return kosong;

  const [produkRes, tokoRes] = await Promise.all([
    supabase
      .from("products")
      .select("id, judul, slug, harga, gambar_url, shops!inner(nama_toko, status)")
      .eq("status", "approved")
      .eq("shops.status", "approved")
      .ilike("judul", `%${kata}%`)
      .order("created_at", { ascending: false })
      .limit(6),
    supabase
      .from("shops")
      .select("id, nama_toko, slug, logo_url")
      .eq("status", "approved")
      .ilike("nama_toko", `%${kata}%`)
      .order("created_at", { ascending: false })
      .limit(3),
  ]);

  return {
    produk: produkRes.error
      ? []
      : (produkRes.data ?? []).map((baris) => {
          const toko = satu(baris.shops as { nama_toko: string } | Array<{ nama_toko: string }> | null);
          return {
            id: baris.id,
            judul: baris.judul,
            slug: baris.slug,
            harga: baris.harga,
            gambar: urlGambarAman(baris.gambar_url),
            toko: toko?.nama_toko ?? "Toko",
          };
        }),
    toko: tokoRes.error
      ? []
      : (tokoRes.data ?? []).map((baris) => ({
          id: baris.id,
          nama: baris.nama_toko,
          slug: baris.slug,
          logo: fotoPenjual(baris.slug, baris.logo_url),
        })),
  };
}

export async function ambilSemuaToko(): Promise<PenjualTop[]> {
  const supabase = await klien();
  if (!supabase) return [];
  const { data, error } = await supabase
    .from("shops")
    .select("id, nama_toko, slug, logo_url, terverifikasi, products(status)")
    .eq("status", "approved")
    .order("nama_toko", { ascending: true });
  if (error || !data) return [];
  return data.map((baris) => ({
    id: baris.id,
    nama: baris.nama_toko,
    slug: baris.slug,
    logo: fotoPenjual(baris.slug, baris.logo_url),
    jumlah: hitungDisetujui(baris.products as { status: string }[] | { status: string } | null),
    klik: 0,
    terverifikasi: Boolean(baris.terverifikasi),
  }));
}

async function klien() {
  await connection();
  if (!hasSupabaseEnv()) return null;
  try {
    return await createClient();
  } catch {
    return null;
  }
}

function tanggalJakarta(saat: Date, geserHari: number) {
  const teks = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Jakarta",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(saat);
  if (geserHari === 0) return teks;
  const [tahun, bulan, hari] = teks.split("-").map(Number);
  return new Date(Date.UTC(tahun, bulan - 1, hari + geserHari)).toISOString().slice(0, 10);
}

async function muatPenjualBaru(supabase: Awaited<ReturnType<typeof createClient>>): Promise<PenjualBaru | null> {
  const { data, error } = await supabase
    .from("shops")
    .select("nama_toko, slug, deskripsi, logo_url, terverifikasi")
    .eq("status", "approved")
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  if (error || !data) return null;
  return {
    nama: data.nama_toko,
    slug: data.slug,
    deskripsi: data.deskripsi,
    logo: fotoPenjual(data.slug, data.logo_url),
    terverifikasi: Boolean(data.terverifikasi),
  };
}

async function muatProdukUrut(supabase: Awaited<ReturnType<typeof createClient>>) {
  const lengkap = await supabase
    .from("products")
    .select("id, judul, slug, harga, gambar_url, is_available, stock, created_at, categories!inner(slug), shops!inner(nama_toko, slug, logo_url, terverifikasi, status)")
    .eq("status", "approved")
    .eq("shops.status", "approved")
    .order("created_at", { ascending: false })
    .limit(40);
  if (!lengkap.error) return (lengkap.data ?? []) as BarisKlik[];
  if (!lengkap.error.message.toLowerCase().includes("stock")) return [] as BarisKlik[];
  const ulang = await supabase
    .from("products")
    .select("id, judul, slug, harga, gambar_url, is_available, created_at, categories!inner(slug), shops!inner(nama_toko, slug, logo_url, terverifikasi, status)")
    .eq("status", "approved")
    .eq("shops.status", "approved")
    .order("created_at", { ascending: false })
    .limit(40);
  if (ulang.error) return [] as BarisKlik[];
  return (ulang.data ?? []) as BarisKlik[];
}

async function muatProdukKlik(supabase: Awaited<ReturnType<typeof createClient>>) {
  const lengkap = await supabase
    .from("products")
    .select("id, judul, slug, harga, gambar_url, is_available, stock, klik_wa, categories!inner(slug), shops!inner(nama_toko, slug, logo_url, terverifikasi, status)")
    .eq("status", "approved")
    .eq("shops.status", "approved")
    .gt("klik_wa", 0)
    .order("klik_wa", { ascending: false })
    .limit(80);
  if (!lengkap.error) return (lengkap.data ?? []) as BarisKlik[];
  const pesan = lengkap.error.message.toLowerCase();
  if (!pesan.includes("stock") && !pesan.includes("klik_wa")) return [] as BarisKlik[];
  if (pesan.includes("klik_wa") && !pesan.includes("stock")) return [] as BarisKlik[];
  const ulang = await supabase
    .from("products")
    .select("id, judul, slug, harga, gambar_url, is_available, klik_wa, categories!inner(slug), shops!inner(nama_toko, slug, logo_url, terverifikasi, status)")
    .eq("status", "approved")
    .eq("shops.status", "approved")
    .gt("klik_wa", 0)
    .order("klik_wa", { ascending: false })
    .limit(80);
  if (ulang.error) return [] as BarisKlik[];
  return (ulang.data ?? []) as BarisKlik[];
}

async function muatHarian(
  supabase: Awaited<ReturnType<typeof createClient>>,
  hariIni: string,
  kemarin: string,
) {
  const [hari, lalu] = await Promise.all([
    supabase.from("klik_harian").select("product_id, jumlah").eq("tanggal", hariIni).order("jumlah", { ascending: false }).limit(20),
    supabase.from("klik_harian").select("product_id, jumlah").eq("tanggal", kemarin).order("jumlah", { ascending: false }).limit(80),
  ]);
  if (hari.error || lalu.error) {
    return { baris: [] as BarisPeringkat[], hariIni: new Map<string, number>(), kemarin: new Map<string, number>() };
  }
  const petaHari = new Map<string, number>();
  for (const baris of hari.data ?? []) petaHari.set(String(baris.product_id), Number(baris.jumlah) || 0);
  const petaLalu = new Map<string, number>();
  (lalu.data ?? []).forEach((baris, indeks) => petaLalu.set(String(baris.product_id), indeks + 1));
  const ids = [...petaHari.keys()].slice(0, 5);
  if (ids.length === 0) return { baris: [] as BarisPeringkat[], hariIni: petaHari, kemarin: petaLalu };
  const { data, error } = await supabase
    .from("products")
    .select("id, judul, slug, harga, gambar_url, is_available, stock, shops!inner(nama_toko, status)")
    .in("id", ids)
    .eq("status", "approved")
    .eq("shops.status", "approved");
  if (error || !data) return { baris: [] as BarisPeringkat[], hariIni: petaHari, kemarin: petaLalu };
  const petaProduk = new Map(data.map((baris) => [baris.id, baris]));
  const adaKemarin = petaLalu.size > 0;
  const baris = ids.flatMap((id, indeks) => {
    const produk = petaProduk.get(id);
    if (!produk) return [];
    const toko = satu(produk.shops as { nama_toko: string } | Array<{ nama_toko: string }> | null);
    const peringkat = indeks + 1;
    return [
      {
        id: produk.id,
        judul: produk.judul,
        slug: produk.slug,
        harga: produk.harga,
        gambar: urlGambarAman(produk.gambar_url),
        toko: toko?.nama_toko ?? "Toko",
        habis: produk.is_available === false || produk.stock === 0,
        arah: adaKemarin ? arah(peringkat, petaLalu.get(id)) : null,
      },
    ];
  });
  return { baris, hariIni: petaHari, kemarin: petaLalu };
}

function susunFavorit(daftar: BarisKlik[], hariIni: Map<string, number>) {
  const dengan = daftar.map((item) => ({
    item,
    kemarin: Math.max(0, (item.klik_wa ?? 0) - (hariIni.get(item.id) ?? 0)),
  }));
  const urutLalu = dengan
    .filter((baris) => baris.kemarin > 0)
    .sort((a, b) => b.kemarin - a.kemarin || a.item.id.localeCompare(b.item.id));
  const peta = new Map(urutLalu.map((baris, indeks) => [baris.item.id, indeks + 1]));
  return dengan.slice(0, 5).map((baris, indeks) => jadikanBaris(baris.item, indeks + 1, peta.size > 0 ? peta : null));
}

function susunTren(daftar: BarisKlik[]) {
  return TREN.map((kolom) => ({
    judul: kolom.judul,
    slug: kolom.slug,
    produk: daftar
      .filter((item) => satu(item.categories)?.slug === kolom.slug)
      .slice(0, 5)
      .map((item) => {
        const toko = satu(item.shops);
        return {
          id: item.id,
          judul: item.judul,
          slug: item.slug,
          harga: item.harga,
          gambar: urlGambarAman(item.gambar_url),
          toko: toko?.nama_toko ?? "Toko",
        };
      }),
  })).filter((kolom) => kolom.produk.length > 0);
}

function jadikanBaris(item: BarisKlik, peringkat: number, kemarin: Map<string, number> | null): BarisPeringkat {
  const toko = satu(item.shops);
  return {
    id: item.id,
    judul: item.judul,
    slug: item.slug,
    harga: item.harga,
    gambar: urlGambarAman(item.gambar_url),
    toko: toko?.nama_toko ?? "Toko",
    habis: item.is_available === false || item.stock === 0,
    arah: kemarin ? arah(peringkat, kemarin.get(item.id)) : null,
  };
}

function arah(sekarang: number, lalu: number | undefined): ArahPeringkat {
  if (!lalu || sekarang < lalu) return "naik";
  if (sekarang > lalu) return "turun";
  return null;
}

async function muatTopPenjual(supabase: Awaited<ReturnType<typeof createClient>>): Promise<PenjualTop[]> {
  const lengkap = await supabase
    .from("shops")
    .select("id, nama_toko, slug, logo_url, terverifikasi, created_at, products(status, klik_wa)")
    .eq("status", "approved");
  if (lengkap.error) {
    if (!lengkap.error.message.toLowerCase().includes("klik_wa")) return [];
    return muatTokoTerbaru(supabase);
  }
  const daftar = (lengkap.data ?? []).map((baris) => {
    const produk = !baris.products ? [] : Array.isArray(baris.products) ? baris.products : [baris.products];
    const disetujui = produk.filter((item) => item.status === "approved");
    const klik = disetujui.reduce((total, item) => total + (typeof item.klik_wa === "number" ? item.klik_wa : 0), 0);
    return { toko: rakitToko(baris, disetujui.length, klik), klik, dibuat: String(baris.created_at ?? "") };
  });
  if (!daftar.some((item) => item.klik > 0)) {
    return daftar
      .sort((a, b) => b.dibuat.localeCompare(a.dibuat) || a.toko.nama.localeCompare(b.toko.nama, "id"))
      .slice(0, 12)
      .map((item) => item.toko);
  }
  return daftar
    .filter((item) => item.klik > 0)
    .sort((a, b) => b.klik - a.klik || a.toko.nama.localeCompare(b.toko.nama, "id"))
    .slice(0, 12)
    .map((item) => item.toko);
}

async function muatTokoTerbaru(supabase: Awaited<ReturnType<typeof createClient>>) {
  const { data, error } = await supabase
    .from("shops")
    .select("id, nama_toko, slug, logo_url, terverifikasi, products(status)")
    .eq("status", "approved")
    .order("created_at", { ascending: false })
    .limit(12);
  if (error || !data) return [];
  return data.map((baris) => rakitToko(baris, hitungDisetujui(baris.products as { status: string }[] | { status: string } | null), 0));
}

function rakitToko(
  baris: { id: string; nama_toko: string; slug: string; logo_url: string | null; terverifikasi: boolean | null },
  jumlah: number,
  klik: number,
): PenjualTop {
  return {
    id: baris.id,
    nama: baris.nama_toko,
    slug: baris.slug,
    logo: fotoPenjual(baris.slug, baris.logo_url),
    jumlah,
    klik,
    terverifikasi: Boolean(baris.terverifikasi),
  };
}

type TokoBaru = { nama_toko: string; slug: string; no_wa: string };

async function muatBaruMendarat(supabase: Awaited<ReturnType<typeof createClient>>): Promise<KartuBaru[]> {
  const { data, error } = await supabase
    .from("products")
    .select("id, judul, slug, harga, gambar_url, shops!inner(nama_toko, slug, no_wa, status)")
    .eq("status", "approved")
    .eq("shops.status", "approved")
    .order("created_at", { ascending: false })
    .limit(10);
  if (error || !data) return [];
  return data.map((baris) => {
    const toko = satu(baris.shops as TokoBaru | TokoBaru[] | null);
    return {
      id: baris.id,
      judul: baris.judul,
      slug: baris.slug,
      harga: baris.harga,
      gambar: urlGambarAman(baris.gambar_url),
      toko: toko?.nama_toko ?? "Toko",
      slugToko: toko?.slug ?? "",
      wa: toko?.no_wa ?? "",
    };
  });
}

function hitungDisetujui(produk: { status: string }[] | { status: string } | null) {
  const daftar = !produk ? [] : Array.isArray(produk) ? produk : [produk];
  return daftar.filter((item) => item.status === "approved").length;
}

function satu<T>(nilai: T | T[] | null | undefined) {
  if (!nilai) return null;
  return Array.isArray(nilai) ? (nilai[0] ?? null) : nilai;
}

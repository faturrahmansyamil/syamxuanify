"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { buatSlug } from "@/lib/slug";
import { hasSupabaseEnv } from "@/lib/supabase/env";
import { createClient } from "@/lib/supabase/server";
import { hapusGambar, unggahGambar } from "@/lib/unggah";
import type { FormState } from "@/app/actions/toko";

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export async function tambahProduk(_state: FormState, formData: FormData): Promise<FormState> {
  const isian = bacaProduk(formData);
  if (isian.error || !isian.nilai) return { error: isian.error };

  const sesi = await sesiPengguna();
  if (!sesi.ok) return { error: sesi.pesan };
  const toko = await tokoMilik(sesi.supabase, sesi.id);
  if (!toko) return { error: "Buka toko dulu sebelum menambah produk." };
  if (!isian.nilai.categoryId) return { error: "Pilih kategori." };

  const foto = await unggahSemua(sesi.supabase, sesi.id, formData);
  if ("error" in foto) return { error: foto.error };
  const berkas = foto.berkas;

  const slug = await slugProduk(sesi.supabase, toko.id, isian.nilai.judul);
  const dasar = {
    shop_id: toko.id,
    category_id: isian.nilai.categoryId,
    judul: isian.nilai.judul,
    slug,
    deskripsi: isian.nilai.deskripsi,
    harga: isian.nilai.harga,
    gambar_url: berkas[0]?.url ?? null,
    status: "pending" as const,
  };
  const penuh = { ...dasar, ...kolomEtalase(isian.nilai) };
  let simpan = await sesi.supabase.from("products").insert(penuh).select("id").single();
  if (simpan.error && kolomHilang(simpan.error.message)) {
    if (isian.nilai.butuhKolom) {
      await bersihkan(sesi.supabase, berkas);
      return { error: PESAN_ETALASE };
    }
    simpan = await sesi.supabase.from("products").insert(dasar).select("id").single();
  }
  if (simpan.error || !simpan.data) {
    await bersihkan(sesi.supabase, berkas);
    return { error: "Produk gagal disimpan. Coba lagi." };
  }

  const susun = await simpanEtalase(sesi.supabase, simpan.data.id, berkas, isian.nilai, formData.get("ada_varian") === "1");
  if (susun.error) {
    await sesi.supabase.from("products").delete().eq("id", simpan.data.id).eq("shop_id", toko.id);
    await bersihkan(sesi.supabase, berkas);
    return { error: susun.error };
  }

  segarkan(toko.slug, slug);
  redirect("/dashboard");
}

export async function ubahProduk(_state: FormState, formData: FormData): Promise<FormState> {
  const id = uuid(formData.get("id"));
  const isian = bacaProduk(formData);
  if (!id) return { error: "Produk tidak ditemukan." };
  if (isian.error || !isian.nilai) return { error: isian.error };
  if (!isian.nilai.categoryId) return { error: "Pilih kategori." };

  const sesi = await sesiPengguna();
  if (!sesi.ok) return { error: sesi.pesan };
  const toko = await tokoMilik(sesi.supabase, sesi.id);
  if (!toko) return { error: "Toko tidak ditemukan." };

  const { data: lama } = await sesi.supabase
    .from("products")
    .select("id, slug, status")
    .eq("id", id)
    .eq("shop_id", toko.id)
    .maybeSingle();
  if (!lama) return { error: "Produk ini bukan milik tokomu." };

  const foto = await unggahSemua(sesi.supabase, sesi.id, formData);
  if ("error" in foto) return { error: foto.error };
  const berkas = foto.berkas;

  const perubahan: {
    judul: string;
    deskripsi: string | null;
    harga: number;
    category_id: string;
    gambar_url?: string;
    status?: "pending";
    rejection_reason?: null;
  } = {
    judul: isian.nilai.judul,
    deskripsi: isian.nilai.deskripsi,
    harga: isian.nilai.harga,
    category_id: isian.nilai.categoryId,
  };
  if (berkas[0]?.url) perubahan.gambar_url = berkas[0].url;
  if (lama.status === "rejected") {
    perubahan.status = "pending";
    perubahan.rejection_reason = null;
  }

  const penuh = { ...perubahan, ...kolomEtalase(isian.nilai) };
  let { error } = await sesi.supabase.from("products").update(penuh).eq("id", id).eq("shop_id", toko.id);
  if (error && kolomHilang(error.message)) {
    if (isian.nilai.butuhKolom) {
      await bersihkan(sesi.supabase, berkas);
      return { error: PESAN_ETALASE };
    }
    ({ error } = await sesi.supabase.from("products").update(perubahan).eq("id", id).eq("shop_id", toko.id));
  }
  if (error) {
    await bersihkan(sesi.supabase, berkas);
    return { error: "Perubahan gagal disimpan. Coba lagi." };
  }

  const susun = await simpanEtalase(sesi.supabase, id, berkas, isian.nilai, formData.get("ada_varian") === "1");
  if (susun.error) return { error: susun.error };

  segarkan(toko.slug, lama.slug);
  redirect("/dashboard");
}

export async function ubahKetersediaan(formData: FormData) {
  const id = uuid(formData.get("id"));
  if (!id) redirect("/dashboard");

  const sesi = await sesiPengguna();
  if (!sesi.ok) redirect("/masuk?selanjutnya=/dashboard");
  const toko = await tokoMilik(sesi.supabase, sesi.id);
  if (!toko) redirect("/dashboard");

  const { data: lama } = await sesi.supabase
    .from("products")
    .select("slug")
    .eq("id", id)
    .eq("shop_id", toko.id)
    .maybeSingle();
  if (!lama) redirect("/dashboard");

  await sesi.supabase
    .from("products")
    .update({ is_available: teks(formData, "tersedia") === "ya" })
    .eq("id", id)
    .eq("shop_id", toko.id);

  segarkan(toko.slug, lama.slug);
  redirect("/dashboard");
}

export async function hapusProduk(formData: FormData) {
  const id = uuid(formData.get("id"));
  if (!id) redirect("/dashboard");

  const sesi = await sesiPengguna();
  if (!sesi.ok) redirect("/masuk?selanjutnya=/dashboard");
  const toko = await tokoMilik(sesi.supabase, sesi.id);
  if (!toko) redirect("/dashboard");

  const { data: lama } = await sesi.supabase
    .from("products")
    .select("slug")
    .eq("id", id)
    .eq("shop_id", toko.id)
    .maybeSingle();

  if (lama) {
    await sesi.supabase.from("products").delete().eq("id", id).eq("shop_id", toko.id);
    segarkan(toko.slug, lama.slug);
  }

  redirect("/dashboard");
}

function bacaProduk(formData: FormData) {
  const judul = teks(formData, "judul");
  const deskripsi = teks(formData, "deskripsi");
  const categoryId = uuid(formData.get("category_id"));
  const harga = Number(teks(formData, "harga").replace(/\D/g, ""));

  if (judul.length < 3 || judul.length > 80) {
    return { error: "Judul minimal 3 huruf dan maksimal 80 huruf." };
  }
  if (deskripsi.length > 500) return { error: "Deskripsi maksimal 500 huruf." };
  if (!Number.isSafeInteger(harga) || harga < 0 || harga > 100_000_000) {
    return { error: "Harga harus angka rupiah, paling besar 100 juta." };
  }

  const stok = angkaOpsional(teks(formData, "stock"), 0, 100_000, "Stok");
  if (stok.error) return { error: stok.error };
  const terjual = angkaOpsional(teks(formData, "sold_count"), 0, 1_000_000, "Terjual");
  if (terjual.error) return { error: terjual.error };
  const preorder = angkaOpsional(teks(formData, "preorder_days"), 1, 60, "Pre-order");
  if (preorder.error) return { error: preorder.error };
  const ukuran = teks(formData, "weight_or_size");
  if (ukuran.length > 40) return { error: "Berat atau ukuran maksimal 40 huruf." };
  const condition = teks(formData, "condition") === "bekas" ? "bekas" : "baru";
  const varian = bacaVarian(formData);
  if (varian.error || !varian.nilai) return { error: varian.error };

  return {
    nilai: {
      judul,
      deskripsi: deskripsi || null,
      harga,
      categoryId,
      stock: stok.nilai,
      sold_count: terjual.nilai ?? 0,
      condition: condition as "baru" | "bekas",
      preorder_days: preorder.nilai,
      weight_or_size: ukuran || null,
      varian: varian.nilai,
      butuhKolom:
        stok.nilai !== null ||
        (terjual.nilai ?? 0) > 0 ||
        condition === "bekas" ||
        preorder.nilai !== null ||
        Boolean(ukuran),
    },
  };
}

const PESAN_ETALASE =
  "Stok, foto tambahan, dan varian butuh tabel baru. Jalankan supabase/migration-4-8.sql di SQL Editor Supabase, lalu simpan lagi.";

type NilaiProduk = NonNullable<ReturnType<typeof bacaProduk>["nilai"]>;
type BerkasFoto = { url: string; path: string };

function kolomEtalase(nilai: NilaiProduk) {
  return {
    stock: nilai.stock,
    sold_count: nilai.sold_count,
    condition: nilai.condition,
    preorder_days: nilai.preorder_days,
    weight_or_size: nilai.weight_or_size,
  };
}

function kolomHilang(pesan: string) {
  const rendah = pesan.toLowerCase();
  return ["stock", "sold_count", "preorder_days", "weight_or_size", "product_images", "product_variants", "condition"].some(
    (kolom) => rendah.includes(kolom),
  );
}

function angkaOpsional(nilai: string, min: number, max: number, nama: string) {
  if (!nilai) return { nilai: null as number | null };
  const angka = Number(nilai.replace(/\D/g, ""));
  if (!Number.isSafeInteger(angka) || angka < min || angka > max) {
    return { error: `${nama} harus angka dari ${min} sampai ${max}.` };
  }
  return { nilai: angka };
}

function bacaVarian(formData: FormData) {
  const nama = formData.getAll("varian_nama").map((item) => String(item).trim());
  const harga = formData.getAll("varian_harga").map((item) => String(item).trim());
  const stok = formData.getAll("varian_stok").map((item) => String(item).trim());
  const varian: Array<{ nama: string; harga: number | null; stock: number | null; urutan: number }> = [];

  for (let i = 0; i < nama.length && varian.length < 10; i += 1) {
    if (!nama[i]) continue;
    if (nama[i].length > 40) return { error: "Nama varian maksimal 40 huruf." };
    const hargaVarian = angkaOpsional(harga[i] ?? "", 0, 100_000_000, "Harga varian");
    if (hargaVarian.error) return { error: hargaVarian.error };
    const stokVarian = angkaOpsional(stok[i] ?? "", 0, 100_000, "Stok varian");
    if (stokVarian.error) return { error: stokVarian.error };
    varian.push({
      nama: nama[i],
      harga: hargaVarian.nilai ?? null,
      stock: stokVarian.nilai ?? null,
      urutan: varian.length,
    });
  }

  return { nilai: varian };
}

async function unggahSemua(
  supabase: Awaited<ReturnType<typeof createClient>>,
  userId: string,
  formData: FormData,
) {
  const files = formData.getAll("gambar").filter((file): file is File => file instanceof File && file.size > 0).slice(0, 5);
  const berkas: BerkasFoto[] = [];
  for (const file of files) {
    const hasil = await unggahGambar(supabase, "produk", userId, file);
    if (hasil.error) {
      await bersihkan(supabase, berkas);
      return { error: hasil.error };
    }
    if (hasil.url && hasil.path) berkas.push({ url: hasil.url, path: hasil.path });
  }
  return { berkas };
}

async function bersihkan(supabase: Awaited<ReturnType<typeof createClient>>, berkas: BerkasFoto[]) {
  for (const item of berkas) await hapusGambar(supabase, "produk", item.path);
}

async function simpanEtalase(
  supabase: Awaited<ReturnType<typeof createClient>>,
  productId: string,
  berkas: BerkasFoto[],
  nilai: NilaiProduk,
  adaVarian: boolean,
) {
  if (berkas.length > 0) {
    const hapus = await supabase.from("product_images").delete().eq("product_id", productId);
    if (hapus.error && kolomHilang(hapus.error.message)) {
      if (berkas.length > 1) return { error: PESAN_ETALASE };
    } else if (hapus.error) {
      return { error: "Foto tambahan gagal disimpan. Coba lagi." };
    } else {
      const masuk = await supabase.from("product_images").insert(
        berkas.map((item, urutan) => ({ product_id: productId, url: item.url, urutan })),
      );
      if (masuk.error && kolomHilang(masuk.error.message) && berkas.length > 1) return { error: PESAN_ETALASE };
      if (masuk.error && !kolomHilang(masuk.error.message)) return { error: "Foto tambahan gagal disimpan. Coba lagi." };
    }
  }

  if (nilai.varian.length > 0 || adaVarian) {
    const hapus = await supabase.from("product_variants").delete().eq("product_id", productId);
    if (hapus.error && kolomHilang(hapus.error.message)) {
      return nilai.varian.length > 0 ? { error: PESAN_ETALASE } : {};
    }
    if (hapus.error) return { error: "Varian gagal disimpan. Coba lagi." };
    if (nilai.varian.length > 0) {
      const masuk = await supabase.from("product_variants").insert(
        nilai.varian.map((item) => ({
          product_id: productId,
          nama: item.nama,
          harga: item.harga,
          stock: item.stock,
          urutan: item.urutan,
        })),
      );
      if (masuk.error && kolomHilang(masuk.error.message)) return { error: PESAN_ETALASE };
      if (masuk.error) return { error: "Varian gagal disimpan. Coba lagi." };
    }
  }

  return {};
}

async function slugProduk(supabase: Awaited<ReturnType<typeof createClient>>, shopId: string, judul: string) {
  const dasar = buatSlug(judul);
  for (let percobaan = 0; percobaan < 5; percobaan += 1) {
    const slug = percobaan === 0 ? dasar : `${dasar}-${percobaan + 1}`;
    const { data } = await supabase.from("products").select("id").eq("shop_id", shopId).eq("slug", slug).maybeSingle();
    if (!data) return slug;
  }
  return `${dasar}-${crypto.randomUUID().slice(0, 8)}`;
}

async function tokoMilik(supabase: Awaited<ReturnType<typeof createClient>>, userId: string) {
  const { data } = await supabase
    .from("shops")
    .select("id, slug")
    .eq("owner_id", userId)
    .order("created_at", { ascending: true })
    .limit(1);
  return (data ?? [])[0] ?? null;
}

async function sesiPengguna() {
  if (!hasSupabaseEnv()) return { ok: false as const, pesan: "Supabase belum dihubungkan." };
  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();
  const id = typeof data?.claims?.sub === "string" ? data.claims.sub : "";
  if (!id) return { ok: false as const, pesan: "Masuk dulu." };
  return { ok: true as const, supabase, id };
}

function segarkan(slugToko: string, slugProduk: string) {
  revalidatePath("/");
  revalidatePath("/dashboard");
  revalidatePath(`/toko/${slugToko}`);
  revalidatePath(`/produk/${slugProduk}`);
}

function teks(formData: FormData, nama: string) {
  return String(formData.get(nama) ?? "").trim();
}

function uuid(nilai: FormDataEntryValue | null) {
  const teksId = String(nilai ?? "").trim();
  return UUID.test(teksId) ? teksId : null;
}

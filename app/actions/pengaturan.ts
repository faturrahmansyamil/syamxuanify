"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { buatSlug, normalkanWa, waValid } from "@/lib/slug";
import { peranPengguna } from "@/lib/peran";
import { hasSupabaseEnv } from "@/lib/supabase/env";
import { createClient } from "@/lib/supabase/server";
import { unggahGambar } from "@/lib/unggah";

export type PengaturanState = {
  error?: string;
  sukses?: string;
};

const IKON = ["makanan-jajanan", "produk-digital", "jasa", "fashion", "lainnya"];
const PERAN = ["buyer", "seller", "admin"] as const;

function teks(formData: FormData, nama: string) {
  return String(formData.get(nama) ?? "").trim();
}

function pesanMigrasi(pesan: string) {
  const rendah = pesan.toLowerCase();
  if (rendah.includes("site_settings") || rendah.includes("is_blocked") || rendah.includes("is_closed") || rendah.includes("favorites") || rendah.includes("does not exist") || rendah.includes("schema cache")) {
    return "Database pengaturan belum siap. Jalankan supabase/migration-4-7.sql di SQL Editor Supabase, lalu muat ulang.";
  }
  return "Perubahan gagal disimpan. Coba lagi.";
}

async function sesi() {
  if (!hasSupabaseEnv()) return { ok: false as const, pesan: "Supabase belum dihubungkan." };
  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();
  const id = typeof data?.claims?.sub === "string" ? data.claims.sub : "";
  if (!id) return { ok: false as const, pesan: "Masuk dulu." };
  const peran = await peranPengguna(supabase);
  return { ok: true as const, supabase, id, peran };
}

async function pastikan(peranDiharap: "admin" | "seller" | "masuk") {
  const hasil = await sesi();
  if (!hasil.ok) redirect(peranDiharap === "masuk" ? "/masuk" : "/");
  if (peranDiharap === "admin" && hasil.peran !== "admin") redirect("/");
  if (peranDiharap === "seller" && hasil.peran !== "seller") redirect("/");
  return hasil;
}

export async function simpanSitus(_state: PengaturanState, formData: FormData): Promise<PengaturanState> {
  const hasil = await sesi();
  if (!hasil.ok) return { error: hasil.pesan };
  if (hasil.peran !== "admin") return { error: "Hanya admin yang bisa mengubah info situs." };

  const nama = teks(formData, "nama_situs");
  const tagline = teks(formData, "tagline");
  const email = teks(formData, "email_kontak").toLowerCase();
  const waMentah = teks(formData, "no_wa");
  const wa = waMentah ? normalkanWa(waMentah) : "";

  if (nama.length < 2 || nama.length > 40) return { error: "Nama situs 2–40 huruf." };
  if (tagline.length < 2 || tagline.length > 180) return { error: "Tagline 2–180 huruf." };
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return { error: "Email kontak tidak valid." };
  if (wa && !waValid(wa)) return { error: "Nomor WhatsApp admin tidak valid." };

  const logo = await unggahGambar(hasil.supabase, "logos", hasil.id, formData.get("logo"));
  if (logo.error) return { error: logo.error };

  const perubahan: {
    nama_situs: string;
    tagline: string;
    email_kontak: string;
    no_wa: string | null;
    logo_url?: string;
  } = {
    nama_situs: nama,
    tagline,
    email_kontak: email,
    no_wa: wa || null,
  };
  if (logo.url) perubahan.logo_url = logo.url;

  const { error } = await hasil.supabase.from("site_settings").update(perubahan).eq("id", 1);
  if (error) return { error: pesanMigrasi(error.message) };

  revalidatePath("/", "layout");
  revalidatePath("/tentang");
  revalidatePath("/admin", "layout");
  return { sukses: "Tersimpan" };
}

export async function simpanModerasi(formData: FormData) {
  const hasil = await pastikan("admin");
  const { error } = await hasil.supabase
    .from("site_settings")
    .update({ produk_wajib_disetujui: teks(formData, "wajib") === "ya" })
    .eq("id", 1);
  if (error) redirect("/admin/moderasi?galat=1");
  revalidatePath("/admin/moderasi");
  redirect("/admin/moderasi?tersimpan=1");
}

export async function simpanPengumuman(formData: FormData) {
  const hasil = await pastikan("admin");
  const isi = teks(formData, "pengumuman_teks");
  if (isi.length > 240) redirect("/admin/pengumuman?galat=1");
  const { error } = await hasil.supabase
    .from("site_settings")
    .update({
      pengumuman_aktif: teks(formData, "nyala") === "ya",
      pengumuman_teks: isi || null,
    })
    .eq("id", 1);
  if (error) redirect("/admin/pengumuman?galat=1");
  revalidatePath("/");
  revalidatePath("/admin/pengumuman");
  redirect("/admin/pengumuman?tersimpan=1");
}

export async function tambahKategori(formData: FormData) {
  const hasil = await pastikan("admin");
  const nama = teks(formData, "nama");
  const ikon = IKON.includes(teks(formData, "ikon")) ? teks(formData, "ikon") : "lainnya";
  if (nama.length < 2 || nama.length > 40) redirect("/admin/kategori?galat=kategori");

  const { data: terakhir } = await hasil.supabase.from("categories").select("urutan").order("urutan", { ascending: false }).limit(1).maybeSingle();
  const urutan = (terakhir?.urutan ?? 0) + 1;
  let slug = buatSlug(nama);
  for (let percobaan = 0; percobaan < 5; percobaan += 1) {
    const calon = percobaan === 0 ? slug : `${slug}-${percobaan + 1}`;
    const { error } = await hasil.supabase.from("categories").insert({ nama, slug: calon, ikon, urutan, aktif: true });
    if (!error) break;
    if (percobaan === 4) redirect("/admin/kategori?galat=kategori");
  }

  revalidatePath("/");
  revalidatePath("/admin/kategori");
  redirect("/admin/kategori");
}

export async function ubahKategori(formData: FormData) {
  const hasil = await pastikan("admin");
  const id = teks(formData, "id");
  const nama = teks(formData, "nama");
  const ikon = IKON.includes(teks(formData, "ikon")) ? teks(formData, "ikon") : "lainnya";
  if (!id || nama.length < 2 || nama.length > 40) redirect("/admin/kategori?galat=kategori");

  const { error } = await hasil.supabase.from("categories").update({ nama, ikon }).eq("id", id);
  if (error) redirect("/admin/kategori?galat=kategori");
  revalidatePath("/");
  revalidatePath("/admin/kategori");
  redirect("/admin/kategori");
}

export async function urutKategori(formData: FormData) {
  const hasil = await pastikan("admin");
  const id = teks(formData, "id");
  const arah = teks(formData, "arah") === "naik" ? -1 : 1;
  const { data } = await hasil.supabase.from("categories").select("id, urutan").order("urutan");
  const daftar = data ?? [];
  const indeks = daftar.findIndex((item) => item.id === id);
  const tetangga = daftar[indeks + arah];
  const sekarang = daftar[indeks];
  if (!sekarang || !tetangga) redirect("/admin/kategori#kategori");

  await hasil.supabase.from("categories").update({ urutan: tetangga.urutan }).eq("id", sekarang.id);
  await hasil.supabase.from("categories").update({ urutan: sekarang.urutan }).eq("id", tetangga.id);
  revalidatePath("/");
  revalidatePath("/admin/kategori");
  redirect("/admin/kategori");
}

export async function aktifKategori(formData: FormData) {
  const hasil = await pastikan("admin");
  const id = teks(formData, "id");
  if (!id) redirect("/admin/kategori#kategori");
  await hasil.supabase.from("categories").update({ aktif: teks(formData, "aktif") === "ya" }).eq("id", id);
  revalidatePath("/");
  revalidatePath("/admin/kategori");
  redirect("/admin/kategori");
}

export async function ubahPeranPengguna(formData: FormData) {
  const hasil = await pastikan("admin");
  const id = teks(formData, "id");
  const peran = teks(formData, "role");
  if (!id || id === hasil.id || !PERAN.includes(peran as (typeof PERAN)[number])) redirect("/admin/pengguna");
  await hasil.supabase.from("profiles").update({ role: peran }).eq("id", id);
  revalidatePath("/admin/pengguna");
  redirect(`/admin/pengguna${tautanCari(formData)}`);
}

export async function ubahBlokir(formData: FormData) {
  const hasil = await pastikan("admin");
  const id = teks(formData, "id");
  if (!id || id === hasil.id) redirect("/admin/pengguna");
  await hasil.supabase.from("profiles").update({ is_blocked: teks(formData, "blokir") === "ya" }).eq("id", id);
  revalidatePath("/admin/pengguna");
  redirect(`/admin/pengguna${tautanCari(formData)}`);
}

export async function ubahVerifikasiPengaturan(formData: FormData) {
  const hasil = await pastikan("admin");
  const id = teks(formData, "id");
  if (!id) redirect("/admin/verifikasi");
  await hasil.supabase.from("shops").update({ terverifikasi: teks(formData, "terverifikasi") === "ya" }).eq("id", id);
  revalidatePath("/");
  revalidatePath("/admin/verifikasi");
  redirect("/admin/verifikasi");
}

export async function simpanProfil(_state: PengaturanState, formData: FormData): Promise<PengaturanState> {
  const hasil = await sesi();
  if (!hasil.ok) return { error: hasil.pesan };

  const nama = teks(formData, "nama");
  const waMentah = teks(formData, "no_wa");
  const wa = waMentah ? normalkanWa(waMentah) : "";
  if (nama.length < 2 || nama.length > 80) return { error: "Nama 2–80 huruf." };
  if (wa && !waValid(wa)) return { error: "Nomor WhatsApp tidak valid. Contoh: 081234567890." };

  const foto = await unggahGambar(hasil.supabase, "logos", hasil.id, formData.get("foto"));
  if (foto.error) return { error: foto.error };

  const perubahan: { nama: string; no_wa: string | null; foto_url?: string } = {
    nama,
    no_wa: wa || null,
  };
  if (foto.url) perubahan.foto_url = foto.url;

  const { error } = await hasil.supabase.from("profiles").update(perubahan).eq("id", hasil.id);
  if (error) return { error: pesanMigrasi(error.message) };

  revalidatePath("/akun");
  revalidatePath("/dashboard/pengaturan");
  return { sukses: "Profil disimpan." };
}

export async function ubahTutupToko(formData: FormData) {
  const hasil = await pastikan("seller");
  const { data: toko } = await hasil.supabase.from("shops").select("id, slug").eq("owner_id", hasil.id).limit(1).maybeSingle();
  if (!toko) redirect("/dashboard/pengaturan");
  await hasil.supabase.from("shops").update({ is_closed: teks(formData, "tutup") === "ya" }).eq("id", toko.id);
  revalidatePath("/");
  revalidatePath(`/toko/${toko.slug}`);
  revalidatePath("/dashboard/pengaturan");
  redirect("/dashboard/pengaturan#toko");
}

export async function hapusAkun(_state: PengaturanState, formData: FormData): Promise<PengaturanState> {
  if (teks(formData, "konfirmasi") !== "HAPUS") {
    return { error: 'Ketik HAPUS dengan huruf besar untuk menghapus akun.' };
  }

  const hasil = await sesi();
  if (!hasil.ok) return { error: hasil.pesan };

  const { error } = await hasil.supabase.rpc("hapus_akun_sendiri");
  if (error) return { error: pesanMigrasi(error.message) };

  await hasil.supabase.auth.signOut();
  redirect("/");
}

function tautanCari(formData: FormData) {
  const kata = teks(formData, "q").slice(0, 80);
  return kata ? `?q=${encodeURIComponent(kata)}` : "";
}

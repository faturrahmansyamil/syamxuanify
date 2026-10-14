"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { buatSlug, normalkanWa, waValid } from "@/lib/slug";
import { tautanAman } from "@/lib/tujuan";
import { hasSupabaseEnv } from "@/lib/supabase/env";
import { createClient } from "@/lib/supabase/server";
import { hapusGambar, unggahGambar } from "@/lib/unggah";

export type FormState = {
  error?: string;
};

export async function bukaToko(_state: FormState, formData: FormData): Promise<FormState> {
  const nama = teks(formData, "nama_toko");
  const deskripsi = teks(formData, "deskripsi");
  const wa = normalkanWa(teks(formData, "no_wa"));

  if (nama.length < 3 || nama.length > 80) {
    return { error: "Nama toko minimal 3 huruf dan maksimal 80 huruf." };
  }
  if (deskripsi.length > 500) {
    return { error: "Deskripsi maksimal 500 huruf." };
  }
  if (!waValid(wa)) {
    return { error: "Nomor WhatsApp harus diawali 62. Contoh: 081234567890." };
  }
  if (teks(formData, "setuju") !== "ya") {
    return { error: "Centang persetujuan Syarat & Ketentuan dulu." };
  }

  const sesi = await sesiPengguna();
  if (!sesi.ok) return { error: sesi.pesan };

  const { data: sudahAda } = await sesi.supabase
    .from("shops")
    .select("id")
    .eq("owner_id", sesi.id)
    .limit(1);
  if ((sudahAda ?? []).length > 0) return { error: "Kamu sudah punya toko." };

  const logo = await unggahGambar(sesi.supabase, "logos", sesi.id, formData.get("logo"));
  if (logo.error) return { error: logo.error };
  const qris = await unggahGambar(sesi.supabase, "qris", sesi.id, formData.get("qris"));
  if (qris.error) {
    if (logo.path) await hapusGambar(sesi.supabase, "logos", logo.path);
    return { error: qris.error };
  }
  if (!qris.url) {
    if (logo.path) await hapusGambar(sesi.supabase, "logos", logo.path);
    return { error: "Unggah gambar QRIS penjual." };
  }

  const slug = await slugToko(sesi.supabase, nama);
  const { error } = await sesi.supabase.from("shops").insert({
    owner_id: sesi.id,
    nama_toko: nama,
    slug,
    deskripsi: deskripsi || null,
    no_wa: wa,
    logo_url: logo.url,
    qris_url: qris.url,
    status: "pending",
    terverifikasi: false,
  });

  if (error) {
    if (logo.path) await hapusGambar(sesi.supabase, "logos", logo.path);
    if (qris.path) await hapusGambar(sesi.supabase, "qris", qris.path);
    return { error: "Toko gagal dibuat. Coba lagi." };
  }

  revalidatePath("/dashboard");
  redirect("/dashboard");
}

export async function ubahToko(_state: FormState, formData: FormData): Promise<FormState> {
  const nama = teks(formData, "nama_toko");
  const deskripsi = teks(formData, "deskripsi");
  const wa = normalkanWa(teks(formData, "no_wa"));

  if (nama.length < 3 || nama.length > 80) {
    return { error: "Nama toko minimal 3 huruf dan maksimal 80 huruf." };
  }
  if (deskripsi.length > 500) {
    return { error: "Deskripsi maksimal 500 huruf." };
  }
  if (!waValid(wa)) {
    return { error: "Nomor WhatsApp harus diawali 62. Contoh: 081234567890." };
  }

  const sesi = await sesiPengguna();
  if (!sesi.ok) return { error: sesi.pesan };

  const { data: lama } = await sesi.supabase
    .from("shops")
    .select("id, slug, status")
    .eq("owner_id", sesi.id)
    .order("created_at", { ascending: true })
    .limit(1)
    .maybeSingle();
  if (!lama) return { error: "Kamu belum punya toko." };

  const logo = await unggahGambar(sesi.supabase, "logos", sesi.id, formData.get("logo"));
  if (logo.error) return { error: logo.error };
  const qris = await unggahGambar(sesi.supabase, "qris", sesi.id, formData.get("qris"));
  if (qris.error) {
    if (logo.path) await hapusGambar(sesi.supabase, "logos", logo.path);
    return { error: qris.error };
  }

  const perubahan: {
    nama_toko: string;
    deskripsi: string | null;
    no_wa: string;
    logo_url?: string;
    qris_url?: string;
    status?: "pending";
    rejection_reason?: null;
  } = {
    nama_toko: nama,
    deskripsi: deskripsi || null,
    no_wa: wa,
  };
  if (logo.url) perubahan.logo_url = logo.url;
  if (qris.url) perubahan.qris_url = qris.url;
  if (lama.status === "rejected") {
    perubahan.status = "pending";
    perubahan.rejection_reason = null;
  }

  const { error } = await sesi.supabase.from("shops").update(perubahan).eq("id", lama.id).eq("owner_id", sesi.id);
  if (error) {
    if (logo.path) await hapusGambar(sesi.supabase, "logos", logo.path);
    if (qris.path) await hapusGambar(sesi.supabase, "qris", qris.path);
    return { error: "Perubahan toko gagal disimpan. Coba lagi." };
  }

  revalidatePath("/dashboard");
  revalidatePath("/dashboard/pengaturan");
  revalidatePath("/");
  revalidatePath(`/toko/${lama.slug}`);
  const kembali = String(formData.get("kembali") ?? "").trim();
  redirect(kembali ? tautanAman(kembali) : "/dashboard");
}

async function slugToko(supabase: Awaited<ReturnType<typeof createClient>>, nama: string) {
  const dasar = buatSlug(nama);
  for (let percobaan = 0; percobaan < 5; percobaan += 1) {
    const slug = percobaan === 0 ? dasar : `${dasar}-${crypto.randomUUID().slice(0, 4)}`;
    const { data } = await supabase.from("shops").select("id").eq("slug", slug).maybeSingle();
    if (!data) return slug;
  }
  return `${dasar}-${crypto.randomUUID().slice(0, 8)}`;
}

async function sesiPengguna() {
  if (!hasSupabaseEnv()) return { ok: false as const, pesan: "Supabase belum dihubungkan." };
  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();
  const id = typeof data?.claims?.sub === "string" ? data.claims.sub : "";
  if (!id) return { ok: false as const, pesan: "Masuk dulu untuk membuka toko." };
  return { ok: true as const, supabase, id };
}

function teks(formData: FormData, nama: string) {
  return String(formData.get(nama) ?? "").trim();
}

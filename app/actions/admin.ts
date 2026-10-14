"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { peranPengguna } from "@/lib/peran";
import { tautanAman } from "@/lib/tujuan";
import { hasSupabaseEnv } from "@/lib/supabase/env";
import { createClient } from "@/lib/supabase/server";

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export async function ubahStatusToko(formData: FormData) {
  const supabase = await pastikanAdmin();
  const id = uuid(formData.get("id"));
  const status = teks(formData, "status");
  if (!id || (status !== "approved" && status !== "rejected")) redirect(kembali(formData));

  const alasan = alasanWajib(formData);
  if (status === "rejected" && !alasan) redirect(kembali(formData));

  const { data: toko } = await supabase.from("shops").select("slug").eq("id", id).maybeSingle();
  if (toko) {
    await supabase
      .from("shops")
      .update({ status, rejection_reason: status === "approved" ? null : alasan })
      .eq("id", id);
    revalidatePath("/");
    revalidatePath("/admin", "layout");
    revalidatePath(`/toko/${toko.slug}`);
  }
  redirect(kembali(formData));
}

export async function ubahVerifikasiToko(formData: FormData) {
  const supabase = await pastikanAdmin();
  const id = uuid(formData.get("id"));
  if (!id) redirect(kembali(formData));

  const { data: toko } = await supabase.from("shops").select("slug").eq("id", id).maybeSingle();
  if (toko) {
    await supabase.from("shops").update({ terverifikasi: teks(formData, "terverifikasi") === "ya" }).eq("id", id);
    revalidatePath("/admin", "layout");
    revalidatePath(`/toko/${toko.slug}`);
  }
  redirect(kembali(formData));
}

export async function ubahStatusProduk(formData: FormData) {
  const supabase = await pastikanAdmin();
  const id = uuid(formData.get("id"));
  const status = teks(formData, "status");
  if (!id || (status !== "approved" && status !== "rejected")) redirect(kembali(formData));

  const { data: produk } = await supabase
    .from("products")
    .select("slug, shops(slug)")
    .eq("id", id)
    .maybeSingle();
  const alasan = alasanWajib(formData);
  if (status === "rejected" && !alasan) redirect(kembali(formData));

  if (produk) {
    await supabase
      .from("products")
      .update({ status, rejection_reason: status === "approved" ? null : alasan })
      .eq("id", id);
    const slugToko = satu(produk.shops as { slug: string } | { slug: string }[] | null)?.slug;
    revalidatePath("/");
    revalidatePath("/admin", "layout");
    revalidatePath(`/produk/${produk.slug}`);
    if (slugToko) revalidatePath(`/toko/${slugToko}`);
  }
  redirect(kembali(formData));
}

export async function hapusProdukAdmin(formData: FormData) {
  const supabase = await pastikanAdmin();
  const id = uuid(formData.get("id"));
  if (!id) redirect(kembali(formData));

  const { data: produk } = await supabase
    .from("products")
    .select("slug, shops(slug)")
    .eq("id", id)
    .maybeSingle();
  if (produk) {
    await supabase.from("products").delete().eq("id", id);
    const slugToko = satu(produk.shops as { slug: string } | { slug: string }[] | null)?.slug;
    revalidatePath("/");
    revalidatePath("/admin", "layout");
    revalidatePath(`/produk/${produk.slug}`);
    if (slugToko) revalidatePath(`/toko/${slugToko}`);
  }
  redirect(kembali(formData));
}

export async function hapusItemLaporan(formData: FormData) {
  const supabase = await pastikanAdmin();
  const id = uuid(formData.get("id"));
  if (!id) redirect(kembali(formData));

  const { data: laporan } = await supabase
    .from("reports")
    .select("product_id, shop_id")
    .eq("id", id)
    .maybeSingle();

  if (laporan?.product_id) {
    await supabase.from("products").delete().eq("id", laporan.product_id);
  } else if (laporan?.shop_id) {
    await supabase.from("shops").delete().eq("id", laporan.shop_id);
  }

  revalidatePath("/");
  revalidatePath("/admin", "layout");
  redirect(kembali(formData));
}

export async function selesaiLaporan(formData: FormData) {
  const supabase = await pastikanAdmin();
  const id = uuid(formData.get("id"));
  if (!id) redirect(kembali(formData));

  await supabase.from("reports").update({ status: "selesai" }).eq("id", id);
  revalidatePath("/admin", "layout");
  redirect(kembali(formData));
}

export async function ubahTutupTokoAdmin(formData: FormData) {
  const supabase = await pastikanAdmin();
  const id = uuid(formData.get("id"));
  if (!id) redirect(kembali(formData));

  const { data: toko } = await supabase.from("shops").select("slug").eq("id", id).maybeSingle();
  if (toko) {
    await supabase.from("shops").update({ is_closed: teks(formData, "tutup") === "ya" }).eq("id", id);
    revalidatePath("/");
    revalidatePath("/admin", "layout");
    revalidatePath(`/toko/${toko.slug}`);
  }
  redirect(kembali(formData));
}

export async function hapusTokoAdmin(formData: FormData) {
  const supabase = await pastikanAdmin();
  const id = uuid(formData.get("id"));
  if (!id) redirect(kembali(formData));

  const { data: toko } = await supabase.from("shops").select("slug").eq("id", id).maybeSingle();
  if (toko) {
    await supabase.from("shops").delete().eq("id", id);
    revalidatePath("/");
    revalidatePath("/admin", "layout");
    revalidatePath(`/toko/${toko.slug}`);
  }
  redirect(kembali(formData));
}

export async function ubahStokAdmin(formData: FormData) {
  const supabase = await pastikanAdmin();
  const id = uuid(formData.get("id"));
  if (!id) redirect(kembali(formData));

  const { data: produk } = await supabase.from("products").select("slug, shops(slug)").eq("id", id).maybeSingle();
  if (produk) {
    await supabase.from("products").update({ is_available: teks(formData, "tersedia") === "ya" }).eq("id", id);
    const slugToko = satu(produk.shops as { slug: string } | { slug: string }[] | null)?.slug;
    revalidatePath("/");
    revalidatePath("/admin", "layout");
    revalidatePath(`/produk/${produk.slug}`);
    if (slugToko) revalidatePath(`/toko/${slugToko}`);
  }
  redirect(kembali(formData));
}

async function pastikanAdmin() {
  if (!hasSupabaseEnv()) redirect("/");
  const supabase = await createClient();
  const peran = await peranPengguna(supabase);
  if (peran !== "admin") redirect("/");
  return supabase;
}

function kembali(formData: FormData) {
  return tautanAman(teks(formData, "kembali"));
}

function teks(formData: FormData, nama: string) {
  return String(formData.get(nama) ?? "").trim();
}

function alasanWajib(formData: FormData) {
  const alasan = teks(formData, "alasan");
  if (alasan.length < 10 || alasan.length > 500) return null;
  return alasan;
}

function uuid(nilai: FormDataEntryValue | null) {
  const id = String(nilai ?? "").trim();
  return UUID.test(id) ? id : null;
}

function satu<T>(nilai: T | T[] | null) {
  if (!nilai) return null;
  return Array.isArray(nilai) ? (nilai[0] ?? null) : nilai;
}

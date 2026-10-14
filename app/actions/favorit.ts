"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { catatLihat } from "@/lib/favorit";
import { hasSupabaseEnv } from "@/lib/supabase/env";
import { createClient } from "@/lib/supabase/server";
import { tautanAman } from "@/lib/tujuan";

export async function catatKunjungan(id: string) {
  if (!hasSupabaseEnv() || !/^[0-9a-f-]{36}$/i.test(id)) return;
  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();
  const userId = typeof data?.claims?.sub === "string" ? data.claims.sub : "";
  if (!userId) return;
  await catatLihat(supabase, userId, id);
}

export async function ubahFavorit(formData: FormData) {
  const id = String(formData.get("id") ?? "");
  const slug = String(formData.get("slug") ?? "");
  const kembali = tautanAman(String(formData.get("kembali") ?? "/"));

  if (!hasSupabaseEnv() || !/^[0-9a-f-]{36}$/i.test(id)) redirect(kembali);

  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();
  const userId = typeof data?.claims?.sub === "string" ? data.claims.sub : "";
  if (!userId) redirect(`/masuk?selanjutnya=${encodeURIComponent(kembali)}`);

  const { data: sudah } = await supabase
    .from("favorites")
    .select("product_id")
    .eq("user_id", userId)
    .eq("product_id", id)
    .maybeSingle();

  if (sudah) {
    await supabase.from("favorites").delete().eq("user_id", userId).eq("product_id", id);
  } else {
    await supabase.from("favorites").insert({ user_id: userId, product_id: id });
  }

  revalidatePath("/");
  revalidatePath("/akun/favorit");
  if (slug) revalidatePath(`/produk/${slug}`);
  redirect(kembali);
}

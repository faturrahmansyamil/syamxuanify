import type { SupabaseClient } from "@supabase/supabase-js";

export async function idFavorit(supabase: SupabaseClient, userId: string, produkId: string[]) {
  if (!userId || produkId.length === 0) return new Set<string>();

  const { data, error } = await supabase
    .from("favorites")
    .select("product_id")
    .eq("user_id", userId)
    .in("product_id", produkId);

  if (error) return new Set<string>();
  return new Set((data ?? []).map((baris) => baris.product_id as string));
}

export async function catatLihat(supabase: SupabaseClient, userId: string, produkId: string) {
  if (!userId || !produkId) return;

  const { error } = await supabase.from("riwayat_lihat").upsert(
    { user_id: userId, product_id: produkId, dilihat_pada: new Date().toISOString() },
    { onConflict: "user_id,product_id" },
  );
  if (error) return;

  const { data } = await supabase
    .from("riwayat_lihat")
    .select("product_id")
    .eq("user_id", userId)
    .order("dilihat_pada", { ascending: false });

  const buang = (data ?? []).slice(10).map((baris) => baris.product_id as string);
  if (buang.length === 0) return;
  await supabase.from("riwayat_lihat").delete().eq("user_id", userId).in("product_id", buang);
}

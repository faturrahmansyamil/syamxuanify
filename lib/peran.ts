import type { SupabaseClient } from "@supabase/supabase-js";

export async function peranPengguna(supabase: SupabaseClient) {
  const { data } = await supabase.auth.getClaims();
  const id = typeof data?.claims?.sub === "string" ? data.claims.sub : "";
  if (!id) return null;

  const { data: profil } = await supabase.from("profiles").select("role").eq("id", id).maybeSingle();
  if (profil?.role === "admin" || profil?.role === "seller" || profil?.role === "buyer") {
    return profil.role;
  }
  return null;
}

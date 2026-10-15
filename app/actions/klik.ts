"use server";

import { hasSupabaseEnv } from "@/lib/supabase/env";
import { createClient } from "@/lib/supabase/server";

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export async function catatKlikWa(id: string) {
  try {
    if (!UUID.test(id) || !hasSupabaseEnv()) return;
    const supabase = await createClient();
    await supabase.rpc("tambah_klik_wa", { produk_id: id });
  } catch {
    return;
  }
}

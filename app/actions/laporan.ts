"use server";

import { hasSupabaseEnv } from "@/lib/supabase/env";
import { createClient } from "@/lib/supabase/server";

export type LaporanState = {
  error?: string;
  sukses?: string;
};

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export async function laporkan(_state: LaporanState, formData: FormData): Promise<LaporanState> {
  if (!hasSupabaseEnv()) {
    return { error: "Supabase belum dihubungkan." };
  }

  const alasan = String(formData.get("alasan") ?? "").trim();
  const productId = uuidAtauKosong(formData.get("product_id"));
  const shopId = uuidAtauKosong(formData.get("shop_id"));

  if (alasan.length < 10 || alasan.length > 500) {
    return { error: "Tuliskan alasan antara 10 dan 500 huruf." };
  }
  if (!productId && !shopId) {
    return { error: "Laporan tidak punya produk atau toko." };
  }

  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();
  const pelaporId = data?.claims?.sub;

  if (!pelaporId) {
    return { error: "Masuk dulu untuk mengirim laporan." };
  }

  const { data: tersimpan, error } = await supabase
    .from("reports")
    .insert({
      product_id: productId,
      shop_id: shopId,
      pelapor_id: pelaporId,
      alasan,
    })
    .select("id")
    .single();

  if (error) return { error: "Laporan tidak terkirim. Coba lagi." };
  if (!tersimpan?.id) return { error: "Laporan tidak terkirim. Coba lagi." };

  return { sukses: "Laporan terkirim. Admin akan meninjaunya." };
}

function uuidAtauKosong(nilai: FormDataEntryValue | null) {
  const teks = String(nilai ?? "").trim();
  if (!teks) return null;
  return UUID.test(teks) ? teks : null;
}

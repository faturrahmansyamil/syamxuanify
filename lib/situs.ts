import { connection } from "next/server";
import { hasSupabaseEnv } from "@/lib/supabase/env";
import { createClient } from "@/lib/supabase/server";

export type Situs = {
  nama_situs: string;
  tagline: string;
  logo_url: string | null;
  no_wa: string | null;
  email_kontak: string;
  produk_wajib_disetujui: boolean;
  pengumuman_aktif: boolean;
  pengumuman_teks: string | null;
};

export const SITUS_AWAL: Situs = {
  nama_situs: "Syamxuanify",
  tagline: "Etalase mahasiswa kampus. Hubungi penjual lewat WhatsApp dan bayar ke QRIS penjual.",
  logo_url: null,
  no_wa: null,
  email_kontak: "syamilfatur@gmail.com",
  produk_wajib_disetujui: true,
  pengumuman_aktif: false,
  pengumuman_teks: null,
};

export async function ambilSitus() {
  await connection();
  if (!hasSupabaseEnv()) return SITUS_AWAL;

  const supabase = await createClient();
  const { data, error } = await supabase.from("site_settings").select("*").eq("id", 1).maybeSingle();
  if (error || !data) return SITUS_AWAL;

  return {
    nama_situs: data.nama_situs || SITUS_AWAL.nama_situs,
    tagline: data.tagline || SITUS_AWAL.tagline,
    logo_url: data.logo_url,
    no_wa: data.no_wa,
    email_kontak: data.email_kontak || SITUS_AWAL.email_kontak,
    produk_wajib_disetujui: data.produk_wajib_disetujui !== false,
    pengumuman_aktif: Boolean(data.pengumuman_aktif),
    pengumuman_teks: data.pengumuman_teks,
  } satisfies Situs;
}

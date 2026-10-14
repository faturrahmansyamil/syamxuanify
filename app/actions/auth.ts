"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { tautanAman } from "@/lib/tujuan";
import { hasSupabaseEnv } from "@/lib/supabase/env";
import { createClient } from "@/lib/supabase/server";

export type AuthState = {
  error?: string;
  sukses?: string;
};

function teks(formData: FormData, nama: string) {
  return String(formData.get(nama) ?? "").trim();
}

function normalkanWa(input: string) {
  const angka = input.replace(/\D/g, "");
  if (!angka) return null;
  if (angka.startsWith("0")) return `62${angka.slice(1)}`;
  return angka;
}

function pesanSupabase(pesan: string) {
  const rendah = pesan.toLowerCase();

  if (rendah.includes("invalid login credentials")) {
    return "Email atau kata sandi salah.";
  }
  if (rendah.includes("email not confirmed")) {
    return "Email belum dikonfirmasi. Buka tautan di kotak masuk, lalu masuk lagi.";
  }
  if (rendah.includes("already registered") || rendah.includes("already been registered")) {
    return "Email ini sudah terdaftar. Silakan masuk.";
  }
  if (rendah.includes("password")) {
    return "Kata sandi ditolak. Gunakan minimal 6 karakter.";
  }
  if (rendah.includes("invalid format") || rendah.includes("unable to validate email")) {
    return "Format email tidak valid.";
  }
  if (rendah.includes("rate limit") || rendah.includes("only request this after")) {
    return "Terlalu banyak percobaan. Tunggu sebentar, lalu coba lagi.";
  }

  return "Permintaan gagal. Periksa email, kata sandi, dan koneksi, lalu coba lagi.";
}

function envBelumSiap(): AuthState | null {
  if (hasSupabaseEnv()) return null;
  return {
    error:
      "Isi NEXT_PUBLIC_SUPABASE_URL dan NEXT_PUBLIC_SUPABASE_ANON_KEY di file .env.local, simpan, lalu hentikan dan jalankan lagi npm run dev.",
  };
}

export async function masuk(
  _state: AuthState,
  formData: FormData,
): Promise<AuthState> {
  const email = teks(formData, "email").toLowerCase();
  const password = teks(formData, "password");

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return { error: "Masukkan email yang valid." };
  }
  if (password.length < 6) {
    return { error: "Kata sandi minimal 6 karakter." };
  }

  const belum = envBelumSiap();
  if (belum) return belum;

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) return { error: pesanSupabase(error.message) };

  const { data: klaim } = await supabase.auth.getClaims();
  const id = typeof klaim?.claims?.sub === "string" ? klaim.claims.sub : "";
  if (id) {
    const { data: profil, error: profilError } = await supabase.from("profiles").select("is_blocked").eq("id", id).maybeSingle();
    if (!profilError && profil?.is_blocked) {
      await supabase.auth.signOut();
      return { error: "Akun ini diblokir. Hubungi admin lewat email di halaman Tentang." };
    }
  }

  redirect(tautanAman(teks(formData, "selanjutnya")));
}

export async function daftar(
  _state: AuthState,
  formData: FormData,
): Promise<AuthState> {
  const nama = teks(formData, "nama");
  const email = teks(formData, "email").toLowerCase();
  const password = teks(formData, "password");
  const konfirmasi = teks(formData, "konfirmasi");
  const noWa = normalkanWa(teks(formData, "no_wa"));

  if (nama.length < 2 || nama.length > 80) {
    return { error: "Nama minimal 2 huruf dan maksimal 80 huruf." };
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return { error: "Masukkan email yang valid." };
  }
  if (password.length < 6 || password.length > 72) {
    return { error: "Kata sandi minimal 6 karakter dan maksimal 72 karakter." };
  }
  if (password !== konfirmasi) {
    return { error: "Ulangan kata sandi tidak sama." };
  }
  if (noWa && (noWa.length < 10 || noWa.length > 15)) {
    return { error: "Nomor WhatsApp tidak valid. Contoh: 081234567890." };
  }

  const belum = envBelumSiap();
  if (belum) return belum;

  const origin = (await headers()).get("origin");
  const supabase = await createClient();
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        nama,
        no_wa: noWa,
      },
      emailRedirectTo: origin ? `${origin}/auth/callback` : undefined,
    },
  });

  if (error) return { error: pesanSupabase(error.message) };

  if (data.session) redirect("/");

  return {
    sukses:
      "Akun dibuat. Kalau ada email konfirmasi, buka tautannya dulu, lalu masuk dengan email dan kata sandi yang sama.",
  };
}

export async function kirimReset(_state: AuthState, formData: FormData): Promise<AuthState> {
  const email = teks(formData, "email").toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return { error: "Masukkan email yang valid." };
  }

  const belum = envBelumSiap();
  if (belum) return belum;

  const origin = (await headers()).get("origin");
  const supabase = await createClient();
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: origin ? `${origin}/auth/callback?next=/atur-sandi` : undefined,
  });

  if (error) return { error: pesanSupabase(error.message) };

  return {
    sukses: "Kalau email itu terdaftar, tautan ganti password sudah dikirim. Cek kotak masuk dan folder spam.",
  };
}

export async function simpanSandiBaru(_state: AuthState, formData: FormData): Promise<AuthState> {
  const password = teks(formData, "password");
  const konfirmasi = teks(formData, "konfirmasi");

  if (password.length < 6 || password.length > 72) {
    return { error: "Kata sandi minimal 6 karakter dan maksimal 72 karakter." };
  }
  if (password !== konfirmasi) {
    return { error: "Ulangan kata sandi tidak sama." };
  }

  const belum = envBelumSiap();
  if (belum) return belum;

  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();
  if (!data?.claims) {
    return { error: "Buka tautan dari email dulu, baru simpan kata sandi baru." };
  }

  const { error } = await supabase.auth.updateUser({ password });
  if (error) return { error: pesanSupabase(error.message) };

  redirect("/");
}

export async function gantiKataSandi(_state: AuthState, formData: FormData): Promise<AuthState> {
  const password = teks(formData, "password");
  const konfirmasi = teks(formData, "konfirmasi");

  if (password.length < 6 || password.length > 72) {
    return { error: "Kata sandi minimal 6 karakter dan maksimal 72 karakter." };
  }
  if (password !== konfirmasi) {
    return { error: "Ulangan kata sandi tidak sama." };
  }

  const belum = envBelumSiap();
  if (belum) return belum;

  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();
  if (!data?.claims) return { error: "Masuk dulu untuk mengganti kata sandi." };

  const { error } = await supabase.auth.updateUser({ password });
  if (error) return { error: pesanSupabase(error.message) };
  return { sukses: "Kata sandi baru sudah disimpan." };
}

export async function masukGoogle(_state: AuthState, formData: FormData): Promise<AuthState> {
  const belum = envBelumSiap();
  if (belum) return belum;

  const origin = (await headers()).get("origin");
  if (!origin) return { error: "Google belum bisa dibuka. Muat ulang halaman, lalu coba lagi." };

  const selanjutnya = tautanAman(teks(formData, "selanjutnya"));
  const supabase = await createClient();
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: `${origin}/auth/callback?next=${encodeURIComponent(selanjutnya)}`,
    },
  });

  if (error || !data.url) {
    return { error: "Masuk dengan Google belum siap. Pakai email dan kata sandi." };
  }

  redirect(data.url);
}

export async function keluar() {
  if (!hasSupabaseEnv()) redirect("/");

  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/");
}

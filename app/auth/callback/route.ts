import { NextResponse } from "next/server";
import type { EmailOtpType } from "@supabase/supabase-js";
import { hasSupabaseEnv } from "@/lib/supabase/env";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const tokenHash = searchParams.get("token_hash");
  const type = searchParams.get("type");

  if (!hasSupabaseEnv()) {
    return NextResponse.redirect(`${origin}/masuk`);
  }
  const next = searchParams.get("next") ?? "/";
  const tujuan = next.startsWith("/") && !next.startsWith("//") ? next : "/";

  const supabase = await createClient();
  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) return NextResponse.redirect(`${origin}${tujuan}`);
  } else if (tokenHash && type) {
    const { error } = await supabase.auth.verifyOtp({
      type: type as EmailOtpType,
      token_hash: tokenHash,
    });
    if (!error) return NextResponse.redirect(`${origin}${tujuan}`);
  }

  const gagal = tujuan.startsWith("/atur-sandi") ? "/lupa-sandi?galat=tautan" : "/masuk?galat=konfirmasi";
  return NextResponse.redirect(`${origin}${gagal}`);
}

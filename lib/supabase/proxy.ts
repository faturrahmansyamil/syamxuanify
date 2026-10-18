import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { tautanAman } from "@/lib/tujuan";
import { getSupabaseEnv, hasSupabaseEnv } from "@/lib/supabase/env";

export async function updateSession(request: NextRequest) {
  if (!hasSupabaseEnv()) {
    return NextResponse.next({ request });
  }

  const { url, key } = getSupabaseEnv();
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    url,
    key,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet, headers) {
          cookiesToSet.forEach(({ name, value }) => {
            request.cookies.set(name, value);
          });
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) => {
            supabaseResponse.cookies.set(name, value, options);
          });
          Object.entries(headers).forEach(([nama, nilai]) => {
            supabaseResponse.headers.set(nama, nilai);
          });
        },
      },
    },
  );

  const { data } = await supabase.auth.getClaims();
  const sudahMasuk = Boolean(data?.claims);
  const jalur = request.nextUrl.pathname;
  const userId = typeof data?.claims?.sub === "string" ? data.claims.sub : "";

  const alihkan = (pathname: string, search = "") => {
    const alamat = request.nextUrl.clone();
    alamat.pathname = pathname;
    alamat.search = search;
    const tujuan = NextResponse.redirect(alamat);
    supabaseResponse.cookies.getAll().forEach((cookie) => {
      tujuan.cookies.set(cookie);
    });
    return tujuan;
  };

  let peran: string | null = null;
  let diblokir = false;
  if (sudahMasuk && userId) {
    const lengkap = await supabase.from("profiles").select("role, is_blocked").eq("id", userId).maybeSingle();
    if (lengkap.error) {
      const dasar = await supabase.from("profiles").select("role").eq("id", userId).maybeSingle();
      peran = dasar.data?.role ?? null;
    } else {
      peran = lengkap.data?.role ?? null;
      diblokir = Boolean(lengkap.data?.is_blocked);
    }
  }

  if (diblokir) {
    await supabase.auth.signOut();
    return alihkan("/masuk");
  }

  if ((jalur === "/admin" || jalur.startsWith("/admin/")) && peran !== "admin") {
    return alihkan("/");
  }

  if (jalur === "/dashboard" || jalur.startsWith("/dashboard/")) {
    if (!sudahMasuk) {
      return alihkan("/masuk", `?selanjutnya=${encodeURIComponent(`${jalur}${request.nextUrl.search}`)}`);
    }
    if (peran !== "seller") return alihkan("/");
  }

  if ((jalur === "/akun" || jalur.startsWith("/akun/")) && !sudahMasuk) {
    return alihkan("/masuk", `?selanjutnya=${encodeURIComponent(`${jalur}${request.nextUrl.search}`)}`);
  }

  if (sudahMasuk && (jalur === "/masuk" || jalur === "/daftar")) {
    const tujuan = tautanAman(jalur === "/masuk" ? request.nextUrl.searchParams.get("selanjutnya") : "/");
    const alamat = request.nextUrl.clone();
    const parsed = new URL(tujuan, request.nextUrl.origin);
    alamat.pathname = parsed.pathname;
    alamat.search = parsed.search;
    const redirectResponse = NextResponse.redirect(alamat);
    supabaseResponse.cookies.getAll().forEach((cookie) => {
      redirectResponse.cookies.set(cookie);
    });
    return redirectResponse;
  }

  const detail = /^\/(produk|toko|kategori)\/([^/]+)\/?$/.exec(jalur);
  if (detail && (!sudahMasuk || detail[1] === "kategori")) {
    let slug = "";
    try {
      slug = decodeURIComponent(detail[2]);
    } catch {
      slug = "";
    }
    const cek = !slug
      ? { data: [], error: null }
      : detail[1] === "kategori"
        ? await supabase.from("categories").select("id").eq("slug", slug).limit(1)
        : await supabase
            .from(detail[1] === "produk" ? "products" : "shops")
            .select("id")
            .eq("slug", slug)
            .eq("status", "approved")
            .limit(1);
    if (!cek.error && (cek.data ?? []).length === 0) {
      const alamat = request.nextUrl.clone();
      alamat.pathname = "/_tidak-ditemukan";
      alamat.search = "";
      const kosong = NextResponse.rewrite(alamat, { status: 404 });
      supabaseResponse.cookies.getAll().forEach((cookie) => {
        kosong.cookies.set(cookie);
      });
      return kosong;
    }
  }

  return supabaseResponse;
}

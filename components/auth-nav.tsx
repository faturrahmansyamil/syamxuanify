import Link from "next/link";
import { connection } from "next/server";
import { keluar } from "@/app/actions/auth";
import { peranPengguna } from "@/lib/peran";
import { hasSupabaseEnv } from "@/lib/supabase/env";
import { createClient } from "@/lib/supabase/server";

export async function AuthNav() {
  await connection();

  if (!hasSupabaseEnv()) {
    return <TautanTamu />;
  }

  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();
  const email = typeof data?.claims.email === "string" ? data.claims.email : null;

  if (!email) return <TautanTamu />;

  const peran = await peranPengguna(supabase);
  const tautan = "text-xs font-medium text-hof hover:underline sm:text-sm";

  return (
    <div className="flex flex-wrap items-center justify-end gap-x-2 gap-y-1">
      {peran === "admin" ? (
        <Link href="/admin" className={tautan}>
          Admin
        </Link>
      ) : null}
      {peran === "seller" ? (
        <>
          <Link href="/dashboard" className={tautan}>
            Dashboard
          </Link>
          <Link href="/dashboard/pengaturan" className={tautan}>
            Pengaturan Toko
          </Link>
        </>
      ) : null}
      {peran === "buyer" ? (
        <Link href="/akun" className={tautan}>
          Akun Saya
        </Link>
      ) : null}
      <span className="hidden max-w-32 truncate text-sm text-foggy sm:inline sm:max-w-56">{email}</span>
      <form action={keluar}>
        <button type="submit" className="text-xs font-medium text-hof hover:underline sm:text-sm">
          Keluar
        </button>
      </form>
    </div>
  );
}

function TautanTamu() {
  return (
    <div className="flex flex-nowrap items-center justify-end gap-x-2">
      <Link href="/masuk" className="btn-duo-white inline-flex items-center">
        Masuk
      </Link>
      <Link href="/daftar" className="btn-duo inline-flex items-center">
        Daftar
      </Link>
    </div>
  );
}

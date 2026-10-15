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
  const tautan = "inline-flex min-h-[44px] items-center px-[8px] text-[14px] font-medium text-ink-black";

  return (
    <div className="flex flex-wrap items-center justify-end gap-2">
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
      <span className="hidden max-w-[8rem] truncate text-[14px] text-muted-gray sm:inline sm:max-w-[14rem]">{email}</span>
      <form action={keluar}>
        <button type="submit" className="btn-sekunder">
          Keluar
        </button>
      </form>
    </div>
  );
}

function TautanTamu() {
  return (
    <div className="flex flex-nowrap items-center justify-end gap-2">
      <Link href="/masuk" className="btn-utama shrink-0">
        Masuk
      </Link>
      <Link href="/daftar" className="btn-utama shrink-0">
        Daftar
      </Link>
    </div>
  );
}

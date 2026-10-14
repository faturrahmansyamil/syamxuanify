import Link from "next/link";
import { connection } from "next/server";
import { Suspense } from "react";
import { FormAturSandi } from "@/components/form-atur-sandi";
import { Muncul } from "@/components/muncul";
import { hasSupabaseEnv } from "@/lib/supabase/env";
import { createClient } from "@/lib/supabase/server";

export const metadata = {
  title: "Kata sandi baru",
};

export default function HalamanAturSandi() {
  return (
    <Muncul>
    <section className="mx-auto w-full max-w-md rounded-[12px] border border-bebe bg-card p-5 sm:p-8">
      <h1 className="text-2xl font-semibold tracking-tight">Kata sandi baru</h1>
      <div className="mt-6">
        <Suspense fallback={<p className="text-sm text-hof">Memuat formulir...</p>}>
          <IsiAturSandi />
        </Suspense>
      </div>
    </section>
    </Muncul>
  );
}

async function IsiAturSandi() {
  await connection();

  if (!hasSupabaseEnv()) {
    return <p className="text-sm">Supabase belum dihubungkan.</p>;
  }

  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();
  if (!data?.claims) {
    return (
      <p className="text-sm leading-6">
        Buka tautan dari email dulu, baru halaman ini bisa menyimpan kata sandi baru.{" "}
        <Link href="/lupa-sandi" className="font-semibold text-hof hover:underline">
          Kirim ulang
        </Link>
      </p>
    );
  }

  return (
    <>
      <p className="mb-4 text-sm leading-6 text-foggy">
        Pilih kata sandi baru, minimal 6 karakter.
      </p>
      <FormAturSandi />
    </>
  );
}

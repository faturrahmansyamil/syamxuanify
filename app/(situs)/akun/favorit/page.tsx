import { Tombol } from "@/components/tombol";
import type { Metadata } from "next";
import { connection } from "next/server";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { KisiProduk } from "@/components/kisi-produk";
import { ambilProdukId } from "@/lib/katalog";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = { title: "Favorit" };

export default function HalamanFavorit() {
  return (
    <Suspense fallback={<p className="text-sm text-hof">Memuat favorit...</p>}>
      <Isi />
    </Suspense>
  );
}

async function Isi() {
  await connection();
  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();
  const id = typeof data?.claims?.sub === "string" ? data.claims.sub : "";
  if (!id) redirect("/masuk?selanjutnya=/akun/favorit");

  const { data: favorit, error } = await supabase
    .from("favorites")
    .select("product_id, created_at")
    .eq("user_id", id)
    .order("created_at", { ascending: false });

  const produk = error ? [] : await ambilProdukId((favorit ?? []).map((baris) => baris.product_id as string));

  return (
    <div className="space-y-[24px]">
      <header className="space-y-2">
        <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">Favorit</h1>
        <Tombol href="/akun" varian="secondary" ukuran="lg">
          Kembali ke akun
        </Tombol>
      </header>
      {error ? (
        <p className="rounded-[12px] bg-card p-[16px] text-sm leading-6">
          Favorit belum siap. Jalankan supabase/migration-4-7.sql di SQL Editor Supabase, lalu muat ulang.
        </p>
      ) : produk.length === 0 ? (
        <p className="rounded-[12px] bg-card p-[16px] text-sm text-foggy">Belum ada produk favorit. Tekan hati di kartu produk.</p>
      ) : (
        <KisiProduk produk={produk} kembali="/akun/favorit" />
      )}
    </div>
  );
}

import { connection } from "next/server";
import { KartuProduk } from "@/components/kartu-produk";
import { Muncul } from "@/components/muncul";
import { idFavorit } from "@/lib/favorit";
import type { ProdukPublik } from "@/lib/katalog";
import { hasSupabaseEnv } from "@/lib/supabase/env";
import { createClient } from "@/lib/supabase/server";

export async function KisiProduk({
  produk,
  kembali,
  kolom = "padat",
}: {
  produk: ProdukPublik[];
  kembali: string;
  kolom?: "padat" | "beranda" | "empat";
}) {
  await connection();
  let disukai = new Set<string>();

  if (hasSupabaseEnv() && produk.length > 0) {
    const supabase = await createClient();
    const { data } = await supabase.auth.getClaims();
    const userId = typeof data?.claims?.sub === "string" ? data.claims.sub : "";
    disukai = await idFavorit(
      supabase,
      userId,
      produk.map((item) => item.id),
    );
  }

  return (
    <div className={kelasKisi(kolom)}>
      {produk.map((item, indeks) => (
        <Muncul key={item.id} urut={indeks} className="flex h-full flex-col">
          <KartuProduk produk={item} disukai={disukai.has(item.id)} kembali={kembali} prioritas={indeks === 0} />
        </Muncul>
      ))}
    </div>
  );
}

function kelasKisi(kolom: "padat" | "beranda" | "empat") {
  if (kolom === "empat") return "grid grid-cols-2 gap-[12px] md:grid-cols-4";
  if (kolom === "beranda") return "grid grid-cols-2 gap-[12px] md:grid-cols-3 lg:grid-cols-4";
  return "grid grid-cols-2 gap-[12px] md:grid-cols-3 lg:grid-cols-5";
}

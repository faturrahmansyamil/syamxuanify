import { connection } from "next/server";
import { KartuProduk } from "@/components/kartu-produk";
import { Muncul } from "@/components/muncul";
import { idFavorit } from "@/lib/favorit";
import type { ProdukPublik } from "@/lib/katalog";
import { hasSupabaseEnv } from "@/lib/supabase/env";
import { createClient } from "@/lib/supabase/server";

export async function KisiProduk({ produk, kembali }: { produk: ProdukPublik[]; kembali: string }) {
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
    <div className="grid grid-cols-2 gap-4 md:grid-cols-3 md:gap-6 lg:grid-cols-5">
      {produk.map((item, indeks) => (
        <Muncul key={item.id} urut={indeks}>
          <KartuProduk produk={item} disukai={disukai.has(item.id)} kembali={kembali} />
        </Muncul>
      ))}
    </div>
  );
}

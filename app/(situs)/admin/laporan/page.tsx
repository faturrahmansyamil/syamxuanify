import { Tombol } from "@/components/tombol";
import type { Metadata } from "next";
import { Suspense } from "react";
import { hapusItemLaporan, selesaiLaporan } from "@/app/actions/admin";
import { TombolAksi } from "@/components/tombol-aksi";
import { klienAdmin, satu } from "@/lib/panel-admin";

export const metadata: Metadata = { title: "Laporan" };


export default function HalamanLaporan({ searchParams }: { searchParams: Promise<{ saring?: string }> }) {
  return (
    <Suspense fallback={<p className="text-sm text-hof">Memuat laporan...</p>}>
      <Isi searchParams={searchParams} />
    </Suspense>
  );
}

async function Isi({ searchParams }: { searchParams: Promise<{ saring?: string }> }) {
  const params = await searchParams;
  const saring = params.saring === "selesai" ? "selesai" : "baru";
  const hasil = await klienAdmin();
  if (!hasil.ok) return <p className="rounded-[12px] bg-card p-[16px] text-sm">{hasil.pesan}</p>;
  const kembali = `/admin/laporan?saring=${saring}`;

  let query = await hasil.supabase
    .from("reports")
    .select("id, alasan, status, product_id, shop_id, products(judul, slug), shops(nama_toko, slug), profiles!reports_pelapor_id_fkey(nama)")
    .eq("status", saring)
    .order("created_at", { ascending: false });

  if (query.error) {
    return (
      <p className="rounded-[12px] bg-card p-[16px] text-sm leading-[1.6]">
        Status laporan belum siap. Jalankan supabase/migration-4-7.sql di SQL Editor Supabase, lalu muat ulang.
      </p>
    );
  }

  return (
    <div className="space-y-[16px]">
      <header>
        <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">Laporan</h1>
      </header>
      <div className="flex gap-2">
        <Saring href="/admin/laporan?saring=baru" aktif={saring === "baru"}>Baru</Saring>
        <Saring href="/admin/laporan?saring=selesai" aktif={saring === "selesai"}>Selesai</Saring>
      </div>
      <div className="overflow-x-auto rounded-[12px] border border-bebe bg-card">
        <table className="w-full min-w-[40rem] text-left text-sm">
          <thead className="text-foggy">
            <tr>
              <th className="px-[16px] py-3 font-medium">Item</th>
              <th className="px-[16px] py-3 font-medium">Pelapor</th>
              <th className="px-[16px] py-3 font-medium">Alasan</th>
              <th className="px-[16px] py-3 font-medium">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {(query.data ?? []).length === 0 ? (
              <tr>
                <td colSpan={4} className="px-[16px] py-[16px] text-foggy">Tidak ada laporan {saring === "selesai" ? "selesai" : "baru"}.</td>
              </tr>
            ) : (
              (query.data ?? []).map((item) => {
                const produk = satu(item.products as { judul: string; slug: string } | { judul: string; slug: string }[] | null);
                const toko = satu(item.shops as { nama_toko: string; slug: string } | { nama_toko: string; slug: string }[] | null);
                const pelapor = satu(item.profiles as { nama: string } | { nama: string }[] | null);
                const href = produk ? `/produk/${produk.slug}` : toko ? `/toko/${toko.slug}` : "";
                const hapusToko = !item.product_id && Boolean(item.shop_id);
                return (
                  <tr key={item.id} className="border-t border-bebe align-top">
                    <td className="px-[16px] py-3 font-medium">{produk?.judul || toko?.nama_toko || "Item sudah tidak ada"}</td>
                    <td className="px-[16px] py-3">{pelapor?.nama || "Pembeli"}</td>
                    <td className="max-w-xs px-[16px] py-3">{item.alasan}</td>
                    <td className="px-[16px] py-3">
                      <div className="flex flex-wrap gap-2">
                        {href ? <Tombol href={href} varian="secondary" ukuran="sm">Lihat</Tombol> : null}
                        {item.product_id || item.shop_id ? (
                          <TombolAksi
                            aksi={hapusItemLaporan}
                            bidang={{ id: item.id, kembali }}
                            konfirmasi={hapusToko ? "Hapus toko ini beserta produknya?" : "Hapus produk yang dilaporkan?"}
                           
                          >
                            Hapus item
                          </TombolAksi>
                        ) : null}
                        {saring === "baru" ? (
                          <TombolAksi aksi={selesaiLaporan} bidang={{ id: item.id, kembali }}>
                            Tandai selesai
                          </TombolAksi>
                        ) : null}
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function Saring({ href, aktif, children }: { href: string; aktif: boolean; children: string }) {
  return (
    <Tombol href={href} chip varian={aktif ? "primary" : "secondary"}>
      {children}
    </Tombol>
  );
}

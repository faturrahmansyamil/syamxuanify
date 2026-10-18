import { Tombol } from "@/components/tombol";
import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { hapusProdukAdmin, ubahStokAdmin, ubahUnggulan } from "@/app/actions/admin";
import { TombolAksi } from "@/components/tombol-aksi";
import { kataCari, klienAdmin, labelStatus, satu, statusAman } from "@/lib/panel-admin";
import { formatRupiah } from "@/lib/rupiah";

export const metadata: Metadata = { title: "Produk" };

const bidang = "h-[40px] rounded-lg border border-bebe bg-card px-3 text-sm outline-none";

export default function HalamanProduk({ searchParams }: { searchParams: Promise<{ q?: string; status?: string }> }) {
  return (
    <Suspense fallback={<p className="text-sm text-hof">Memuat produk...</p>}>
      <Isi searchParams={searchParams} />
    </Suspense>
  );
}

async function Isi({ searchParams }: { searchParams: Promise<{ q?: string; status?: string }> }) {
  const params = await searchParams;
  const kata = kataCari(params.q);
  const status = statusAman(params.status);
  const hasil = await klienAdmin();
  if (!hasil.ok) return <p className="rounded-[12px] bg-card p-[16px] text-sm">{hasil.pesan}</p>;
  const kembali = tautan(kata, status);

  const daftar = await muat(hasil.supabase, kata, status);

  return (
    <div className="space-y-[16px]">
      <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">Produk</h1>
      <form className="flex flex-wrap gap-2">
        <input name="q" defaultValue={kata} placeholder="Cari judul produk" className={`${bidang} min-w-0 flex-1`} />
        <select name="status" defaultValue={status} className={bidang}>
          <option value="">Semua status</option>
          <option value="pending">Menunggu</option>
          <option value="approved">Disetujui</option>
          <option value="rejected">Ditolak</option>
        </select>
        <Tombol type="submit" varian="secondary" ukuran="sm">Cari</Tombol>
      </form>
      <div className="overflow-x-auto rounded-[12px] border border-bebe bg-card">
        <table className="w-full min-w-[44rem] text-left text-sm">
          <thead className="text-foggy">
            <tr>
              <th className="px-[16px] py-3 font-medium">Judul</th>
              <th className="px-[16px] py-3 font-medium">Toko</th>
              <th className="px-[16px] py-3 font-medium">Harga</th>
              <th className="px-[16px] py-3 font-medium">Status</th>
              <th className="px-[16px] py-3 font-medium">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {daftar.length === 0 ? (
              <tr><td colSpan={5} className="px-[16px] py-[16px] text-foggy">Tidak ada produk.</td></tr>
            ) : daftar.map((produk) => {
              const toko = satu(produk.shops);
              const tersedia = produk.is_available !== false;
              const unggulan = produk.is_unggulan === true;
              return (
                <tr key={produk.id} className="border-t border-bebe">
                  <td className="px-[16px] py-3 font-medium">{produk.judul}</td>
                  <td className="px-[16px] py-3">{toko?.nama_toko ?? "Toko"}</td>
                  <td className="px-[16px] py-3">{formatRupiah(produk.harga)}</td>
                  <td className="px-[16px] py-3">{labelStatus(produk.status)}{tersedia ? "" : " · nonaktif"}{unggulan ? " · unggulan" : ""}</td>
                  <td className="px-[16px] py-3">
                    <div className="flex flex-wrap gap-2">
                      <Link href={`/produk/${produk.slug}`}>Lihat</Link>
                      {typeof produk.is_unggulan === "boolean" ? (
                        <TombolAksi
                          aksi={ubahUnggulan}
                          bidang={{ id: produk.id, unggulan: unggulan ? "tidak" : "ya", kembali }}
                         
                        >
                          {unggulan ? "Cabut unggulan" : "Jadikan unggulan"}
                        </TombolAksi>
                      ) : null}
                      <TombolAksi aksi={ubahStokAdmin} bidang={{ id: produk.id, tersedia: tersedia ? "tidak" : "ya", kembali }}>
                        {tersedia ? "Nonaktifkan" : "Aktifkan"}
                      </TombolAksi>
                      <TombolAksi aksi={hapusProdukAdmin} bidang={{ id: produk.id, kembali }} konfirmasi="Hapus produk ini?">
                        Hapus
                      </TombolAksi>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function tautan(kata: string, status: string) {
  const params = new URLSearchParams();
  if (kata) params.set("q", kata);
  if (status) params.set("status", status);
  const query = params.toString();
  return query ? `/admin/produk?${query}` : "/admin/produk";
}

async function muat(supabase: Awaited<ReturnType<typeof import("@/lib/supabase/server").createClient>>, kata: string, status: string) {
  const lengkapAwal = supabase
    .from("products")
    .select("id, judul, slug, harga, status, is_available, is_unggulan, shops(nama_toko)")
    .order("created_at", { ascending: false });
  const lengkapStatus = status ? lengkapAwal.eq("status", status) : lengkapAwal;
  const lengkap = await (kata ? lengkapStatus.ilike("judul", `%${kata}%`) : lengkapStatus);
  if (!lengkap.error) {
    return (lengkap.data ?? []).map((produk) => ({
      id: produk.id,
      judul: produk.judul,
      slug: produk.slug,
      harga: produk.harga,
      status: produk.status,
      is_available: produk.is_available,
      is_unggulan: produk.is_unggulan,
      shops: produk.shops,
    }));
  }

  const stokAwal = supabase.from("products").select("id, judul, slug, harga, status, is_available, shops(nama_toko)").order("created_at", { ascending: false });
  const stokStatus = status ? stokAwal.eq("status", status) : stokAwal;
  const stok = await (kata ? stokStatus.ilike("judul", `%${kata}%`) : stokStatus);
  if (!stok.error) {
    return (stok.data ?? []).map((produk) => ({
      id: produk.id,
      judul: produk.judul,
      slug: produk.slug,
      harga: produk.harga,
      status: produk.status,
      is_available: produk.is_available,
      is_unggulan: null as boolean | null,
      shops: produk.shops,
    }));
  }

  const dasarAwal = supabase.from("products").select("id, judul, slug, harga, status, shops(nama_toko)").order("created_at", { ascending: false });
  const dasarStatus = status ? dasarAwal.eq("status", status) : dasarAwal;
  const dasar = await (kata ? dasarStatus.ilike("judul", `%${kata}%`) : dasarStatus);
  return (dasar.data ?? []).map((produk) => ({
    id: produk.id,
    judul: produk.judul,
    slug: produk.slug,
    harga: produk.harga,
    status: produk.status,
    is_available: true,
    is_unggulan: null as boolean | null,
    shops: produk.shops,
  }));
}

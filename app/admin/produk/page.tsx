import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { hapusProdukAdmin, ubahStokAdmin } from "@/app/actions/admin";
import { TombolAksi } from "@/components/tombol-aksi";
import { kataCari, klienAdmin, labelStatus, satu, statusAman } from "@/lib/panel-admin";
import { formatRupiah } from "@/lib/rupiah";

export const metadata: Metadata = { title: "Produk" };

const tombol = "btn-duo inline-flex items-center justify-center";
const bidang = "h-10 rounded-lg border border-bebe bg-card px-3 text-sm outline-none";

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
  if (!hasil.ok) return <p className="rounded-[12px] bg-card p-4 text-sm">{hasil.pesan}</p>;
  const kembali = tautan(kata, status);

  const daftar = await muat(hasil.supabase, kata, status);

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">Produk</h1>
      <form className="flex flex-wrap gap-2">
        <input name="q" defaultValue={kata} placeholder="Cari judul produk" className={`${bidang} min-w-0 flex-1`} />
        <select name="status" defaultValue={status} className={bidang}>
          <option value="">Semua status</option>
          <option value="pending">Menunggu</option>
          <option value="approved">Disetujui</option>
          <option value="rejected">Ditolak</option>
        </select>
        <button type="submit" className={tombol}>Cari</button>
      </form>
      <div className="overflow-x-auto rounded-[12px] border border-bebe bg-card">
        <table className="w-full min-w-[44rem] text-left text-sm">
          <thead className="text-foggy">
            <tr>
              <th className="px-4 py-3 font-medium">Judul</th>
              <th className="px-4 py-3 font-medium">Toko</th>
              <th className="px-4 py-3 font-medium">Harga</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {daftar.length === 0 ? (
              <tr><td colSpan={5} className="px-4 py-4 text-foggy">Tidak ada produk.</td></tr>
            ) : daftar.map((produk) => {
              const toko = satu(produk.shops);
              const tersedia = produk.is_available !== false;
              return (
                <tr key={produk.id} className="border-t border-bebe">
                  <td className="px-4 py-3 font-medium">{produk.judul}</td>
                  <td className="px-4 py-3">{toko?.nama_toko ?? "Toko"}</td>
                  <td className="px-4 py-3">{formatRupiah(produk.harga)}</td>
                  <td className="px-4 py-3">{labelStatus(produk.status)}{tersedia ? "" : " · nonaktif"}</td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-2">
                      <Link href={`/produk/${produk.slug}`} className={tombol}>Lihat</Link>
                      <TombolAksi aksi={ubahStokAdmin} bidang={{ id: produk.id, tersedia: tersedia ? "tidak" : "ya", kembali }} className={tombol}>
                        {tersedia ? "Nonaktifkan" : "Aktifkan"}
                      </TombolAksi>
                      <TombolAksi aksi={hapusProdukAdmin} bidang={{ id: produk.id, kembali }} konfirmasi="Hapus produk ini?" className={tombol}>
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
  const lengkapAwal = supabase.from("products").select("id, judul, slug, harga, status, is_available, shops(nama_toko)").order("created_at", { ascending: false });
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
    shops: produk.shops,
  }));
}

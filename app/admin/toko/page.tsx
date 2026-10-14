import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { hapusTokoAdmin, ubahTutupTokoAdmin } from "@/app/actions/admin";
import { TombolAksi } from "@/components/tombol-aksi";
import { kataCari, klienAdmin, labelStatus, statusAman } from "@/lib/panel-admin";

export const metadata: Metadata = { title: "Toko" };

const tombol = "inline-flex h-9 items-center justify-center rounded-full bg-fill px-3 text-sm font-medium text-on-fill";
const bidang = "h-10 rounded-lg border border-bebe bg-card px-3 text-sm outline-none";

export default function HalamanToko({ searchParams }: { searchParams: Promise<{ q?: string; status?: string }> }) {
  return (
    <Suspense fallback={<p className="text-sm text-hof">Memuat toko...</p>}>
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
      <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">Toko</h1>
      <form className="flex flex-wrap gap-2">
        <input name="q" defaultValue={kata} placeholder="Cari nama toko" className={`${bidang} min-w-0 flex-1`} />
        <select name="status" defaultValue={status} className={bidang}>
          <option value="">Semua status</option>
          <option value="pending">Menunggu</option>
          <option value="approved">Disetujui</option>
          <option value="rejected">Ditolak</option>
        </select>
        <button type="submit" className={tombol}>Cari</button>
      </form>
      <div className="overflow-x-auto rounded-[12px] border border-bebe bg-card">
        <table className="w-full min-w-[40rem] text-left text-sm">
          <thead className="text-foggy">
            <tr>
              <th className="px-4 py-3 font-medium">Nama</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {daftar.length === 0 ? (
              <tr><td colSpan={3} className="px-4 py-4 text-foggy">Tidak ada toko.</td></tr>
            ) : daftar.map((toko) => {
              const tutup = Boolean(toko.is_closed);
              return (
                <tr key={toko.id} className="border-t border-bebe">
                  <td className="px-4 py-3 font-medium">{toko.nama_toko}</td>
                  <td className="px-4 py-3">{labelStatus(toko.status)}{tutup ? " · tutup" : ""}</td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-2">
                      <Link href={`/toko/${toko.slug}`} className={tombol}>Lihat</Link>
                      <TombolAksi aksi={ubahTutupTokoAdmin} bidang={{ id: toko.id, tutup: tutup ? "tidak" : "ya", kembali }} className={tombol}>
                        {tutup ? "Aktifkan" : "Nonaktifkan"}
                      </TombolAksi>
                      <TombolAksi aksi={hapusTokoAdmin} bidang={{ id: toko.id, kembali }} konfirmasi="Hapus toko ini beserta produknya?" className={tombol}>
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
  return query ? `/admin/toko?${query}` : "/admin/toko";
}

async function muat(supabase: Awaited<ReturnType<typeof import("@/lib/supabase/server").createClient>>, kata: string, status: string) {
  const lengkapAwal = supabase.from("shops").select("id, nama_toko, slug, status, is_closed").order("nama_toko");
  const lengkapStatus = status ? lengkapAwal.eq("status", status) : lengkapAwal;
  const lengkap = await (kata ? lengkapStatus.ilike("nama_toko", `%${kata}%`) : lengkapStatus);
  if (!lengkap.error) return (lengkap.data ?? []) as TokoBaris[];

  const dasarAwal = supabase.from("shops").select("id, nama_toko, slug, status").order("nama_toko");
  const dasarStatus = status ? dasarAwal.eq("status", status) : dasarAwal;
  const dasar = await (kata ? dasarStatus.ilike("nama_toko", `%${kata}%`) : dasarStatus);
  return (dasar.data ?? []).map((toko) => ({ ...toko, is_closed: false }));
}

type TokoBaris = { id: string; nama_toko: string; slug: string; status: string; is_closed?: boolean };

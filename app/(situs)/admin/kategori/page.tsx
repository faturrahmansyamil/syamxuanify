import { Tombol } from "@/components/tombol";
import type { Metadata } from "next";
import { Suspense } from "react";
import { aktifKategori, tambahKategori, ubahKategori, urutKategori } from "@/app/actions/pengaturan";
import { IkonKategori } from "@/components/ikon-kategori";
import { klienAdmin } from "@/lib/panel-admin";

export const metadata: Metadata = { title: "Kategori" };

const IKON = [
  { slug: "makanan-jajanan", nama: "Makanan" },
  { slug: "produk-digital", nama: "Digital" },
  { slug: "jasa", nama: "Jasa" },
  { slug: "fashion", nama: "Fashion" },
  { slug: "lainnya", nama: "Lainnya" },
];

const bidang = "h-[40px] rounded-lg border border-bebe bg-card px-3 text-sm outline-none";

export default function HalamanKategori() {
  return (
    <Suspense fallback={<p className="text-sm text-hof">Memuat kategori...</p>}>
      <Isi />
    </Suspense>
  );
}

async function Isi() {
  const hasil = await klienAdmin();
  if (!hasil.ok) return <p className="rounded-[12px] bg-card p-[16px] text-sm">{hasil.pesan}</p>;
  const daftar = await hasil.supabase.from("categories").select("id, nama, ikon, urutan, aktif").order("urutan");
  if (daftar.error) {
    return <p className="rounded-[12px] bg-card p-[16px] text-sm leading-[1.6]">Kategori belum siap. Jalankan supabase/migration-4-7.sql, lalu muat ulang.</p>;
  }

  return (
    <div className="space-y-[16px]">
      <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">Kategori</h1>
      <form action={tambahKategori} className="flex flex-wrap items-end gap-2 rounded-[12px] border border-bebe bg-card p-[16px]">
        <label className="min-w-0 flex-1 space-y-1 text-sm font-medium">
          Nama
          <input name="nama" required minLength={2} maxLength={40} className={`${bidang} w-full`} />
        </label>
        <label className="space-y-1 text-sm font-medium">
          Ikon
          <select name="ikon" defaultValue="lainnya" className={bidang}>
            {IKON.map((ikon) => <option key={ikon.slug} value={ikon.slug}>{ikon.nama}</option>)}
          </select>
        </label>
        <Tombol type="submit" varian="secondary" ukuran="sm">Tambah</Tombol>
      </form>
      <div className="overflow-x-auto rounded-[12px] border border-bebe bg-card">
        <table className="w-full min-w-[46rem] text-left text-sm">
          <thead className="text-foggy">
            <tr>
              <th className="px-[16px] py-3 font-medium">Nama</th>
              <th className="px-[16px] py-3 font-medium">Ikon</th>
              <th className="px-[16px] py-3 font-medium">Urutan</th>
              <th className="px-[16px] py-3 font-medium">Status</th>
              <th className="px-[16px] py-3 font-medium">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {(daftar.data ?? []).map((kategori) => {
              const formulir = `kategori-${kategori.id}`;
              return (
                <tr key={kategori.id} className="border-t border-bebe">
                  <td className="px-[16px] py-3">
                    <form id={formulir} action={ubahKategori}>
                      <input type="hidden" name="id" value={kategori.id} />
                    </form>
                    <input form={formulir} name="nama" required minLength={2} maxLength={40} defaultValue={kategori.nama} className={`${bidang} w-[160px]`} />
                  </td>
                  <td className="px-[16px] py-3">
                    <span className="inline-flex items-center gap-2 whitespace-nowrap">
                      <IkonKategori slug={kategori.ikon} />
                      <select form={formulir} name="ikon" defaultValue={kategori.ikon ?? "lainnya"} className={bidang}>
                        {IKON.map((ikon) => <option key={ikon.slug} value={ikon.slug}>{ikon.nama}</option>)}
                      </select>
                    </span>
                  </td>
                  <td className="px-[16px] py-3">{kategori.urutan}</td>
                  <td className="px-[16px] py-3 whitespace-nowrap">{kategori.aktif === false ? "Nonaktif" : "Aktif"}</td>
                  <td className="px-[16px] py-3">
                    <div className="flex flex-nowrap gap-2">
                      <Tombol form={formulir} type="submit" varian="secondary" ukuran="sm">Simpan</Tombol>
                      <Tombol form={formulir} type="submit" formAction={urutKategori} name="arah" value="naik" varian="secondary" ukuran="sm">Naik</Tombol>
                      <Tombol form={formulir} type="submit" formAction={urutKategori} name="arah" value="turun" varian="secondary" ukuran="sm">Turun</Tombol>
                      <Tombol form={formulir} type="submit" formAction={aktifKategori} name="aktif" value={kategori.aktif === false ? "ya" : "tidak"} varian="secondary" ukuran="sm">
                        {kategori.aktif === false ? "Aktifkan" : "Nonaktifkan"}
                      </Tombol>
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


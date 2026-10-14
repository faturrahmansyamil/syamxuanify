import type { Metadata } from "next";
import { Suspense } from "react";
import { ubahBlokir, ubahPeranPengguna } from "@/app/actions/pengaturan";
import { BarisAksi } from "@/components/baris-aksi";
import { kataCari, klienAdmin } from "@/lib/panel-admin";

export const metadata: Metadata = { title: "Pengguna" };

const tombol = "btn-duo inline-flex items-center justify-center";
const bidang = "h-10 w-full rounded-lg border border-bebe bg-card px-3 text-sm outline-none sm:w-auto";

const PERAN = [
  { nilai: "buyer", nama: "Pembeli" },
  { nilai: "seller", nama: "Penjual" },
  { nilai: "admin", nama: "Admin" },
];

export default function HalamanPengguna({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  return (
    <Suspense fallback={<p className="text-sm text-hof">Memuat pengguna...</p>}>
      <Isi searchParams={searchParams} />
    </Suspense>
  );
}

async function Isi({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const params = await searchParams;
  const kata = kataCari(params.q);
  const hasil = await klienAdmin();
  if (!hasil.ok) return <p className="rounded-[12px] bg-card p-4 text-sm">{hasil.pesan}</p>;
  const { data: sesi } = await hasil.supabase.auth.getClaims();
  const adminId = typeof sesi?.claims?.sub === "string" ? sesi.claims.sub : "";

  let query = hasil.supabase.from("profiles").select("id, nama, email, role, is_blocked").order("nama").limit(50);
  if (kata) query = query.ilike("email", `%${kata}%`);
  const daftar = await query;
  if (daftar.error) {
    return <p className="rounded-[12px] bg-card p-4 text-sm leading-6">Daftar pengguna belum siap. Jalankan supabase/migration-4-7.sql, lalu muat ulang.</p>;
  }

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">Pengguna</h1>
      <form className="flex gap-2">
        <input name="q" defaultValue={kata} placeholder="Cari email" className="h-10 min-w-0 flex-1 rounded-lg border border-bebe bg-card px-3 text-sm outline-none" />
        <button type="submit" className={tombol}>Cari</button>
      </form>
      <div className="overflow-x-auto rounded-[12px] border border-bebe bg-card">
        <table className="w-full min-w-[36rem] text-left text-sm">
          <thead className="text-foggy">
            <tr>
              <th className="px-4 py-3 font-medium">Nama</th>
              <th className="px-4 py-3 font-medium">Email</th>
              <th className="px-4 py-3 font-medium">Role</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {(daftar.data ?? []).map((pengguna) => (
              <tr key={pengguna.id} className="border-t border-bebe align-top">
                <td className="px-4 py-3 font-medium">{pengguna.nama}</td>
                <td className="max-w-40 truncate px-4 py-3">{pengguna.email || "—"}</td>
                <td className="px-4 py-3">{PERAN.find((item) => item.nilai === pengguna.role)?.nama ?? pengguna.role}</td>
                <td className="px-4 py-3">{pengguna.is_blocked ? "Diblokir" : "Aktif"}</td>
                <td className="px-4 py-3">
                  {pengguna.id === adminId ? (
                    <span className="text-foggy">Akunmu</span>
                  ) : (
                    <BarisAksi>
                      <form action={ubahPeranPengguna} className="flex gap-2">
                        <input type="hidden" name="id" value={pengguna.id} />
                        {kata ? <input type="hidden" name="q" value={kata} /> : null}
                        <select name="role" defaultValue={pengguna.role} className={bidang}>
                          {PERAN.map((peran) => (
                            <option key={peran.nilai} value={peran.nilai}>{peran.nama}</option>
                          ))}
                        </select>
                        <button type="submit" className={tombol}>Simpan</button>
                      </form>
                      <form action={ubahBlokir}>
                        <input type="hidden" name="id" value={pengguna.id} />
                        {kata ? <input type="hidden" name="q" value={kata} /> : null}
                        <input type="hidden" name="blokir" value={pengguna.is_blocked ? "tidak" : "ya"} />
                        <button type="submit" className={tombol}>{pengguna.is_blocked ? "Buka blokir" : "Blokir"}</button>
                      </form>
                    </BarisAksi>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

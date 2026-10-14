import type { Metadata } from "next";
import Link from "next/link";
import { connection } from "next/server";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { keluar } from "@/app/actions/auth";
import { ubahTutupToko } from "@/app/actions/pengaturan";
import { FormGantiSandi } from "@/components/form-ganti-sandi";
import { FormHapusAkun } from "@/components/form-hapus-akun";
import { FormProfil } from "@/components/form-profil";
import { FormUbahToko } from "@/components/form-ubah-toko";
import { ambilDasbor, type ProdukDasbor, type TokoDasbor } from "@/lib/dasbor";
import { peranPengguna } from "@/lib/peran";
import { urlGambarAman } from "@/lib/wa";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = { title: "Pengaturan Toko" };

const tombol = "h-10 rounded-full bg-fill px-4 text-sm font-medium text-on-fill hover:bg-fill-pressed";

export default function HalamanPengaturanToko() {
  return (
    <Suspense fallback={<p className="text-sm text-hof">Memuat pengaturan...</p>}>
      <Isi />
    </Suspense>
  );
}

async function Isi() {
  await connection();
  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();
  const id = typeof data?.claims?.sub === "string" ? data.claims.sub : "";
  if (!id) redirect("/masuk?selanjutnya=/dashboard/pengaturan");
  if ((await peranPengguna(supabase)) !== "seller") redirect("/");

  const hasil = await ambilDasbor();
  if (!hasil.ok) return <p className="rounded-[12px] bg-card p-4 text-sm">{hasil.pesan}</p>;

  const profil = await muatProfil(supabase, id);
  const tutup = hasil.toko ? await tokoTutup(supabase, hasil.toko.id) : false;

  return (
    <div className="mx-auto max-w-3xl space-y-8">
      <header className="space-y-2">
        <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">Pengaturan Toko</h1>
        <p className="text-sm leading-6 text-foggy">Profil akun, data toko, status persetujuan, dan keamanan.</p>
      </header>

      <FormProfil nama={profil.nama} noWa={profil.no_wa} foto={urlGambarAman(profil.foto_url)} />

      <section id="toko" className="scroll-mt-28 space-y-4">
        {hasil.toko ? (
          <>
            <FormUbahToko toko={hasil.toko} kembali="/dashboard/pengaturan" />
            <form action={ubahTutupToko} className="flex flex-wrap items-center justify-between gap-3 rounded-[12px] border border-bebe bg-card p-5">
              <div>
                <h2 className="text-xl font-semibold">Tutup toko sementara</h2>
                <p className="mt-2 text-sm leading-6 text-foggy">
                  {tutup ? "Toko sedang tidak muncul di katalog." : "Toko tampil di katalog."}
                </p>
              </div>
              <input type="hidden" name="tutup" value={tutup ? "tidak" : "ya"} />
              <button type="submit" className={tombol}>
                {tutup ? "Buka lagi" : "Tutup sementara"}
              </button>
            </form>
          </>
        ) : (
          <p className="rounded-[12px] bg-card p-4 text-sm text-foggy">Kamu belum punya toko. Buka toko dari dashboard.</p>
        )}
      </section>

      <section className="space-y-3 rounded-[12px] border border-bebe bg-card p-5">
        <h2 className="text-xl font-semibold">Notifikasi</h2>
        <p className="text-sm leading-6 text-foggy">Status toko dan produk, plus alasan kalau ditolak.</p>
        {hasil.toko ? <StatusToko toko={hasil.toko} /> : null}
        <ul className="space-y-3">
          {hasil.produk.map((produk) => (
            <li key={produk.id}>
              <StatusProduk produk={produk} />
            </li>
          ))}
        </ul>
      </section>

      <section className="space-y-4 rounded-[12px] border border-bebe bg-card p-5">
        <h2 className="text-xl font-semibold">Keamanan</h2>
        <FormGantiSandi />
        <form action={keluar}>
          <button type="submit" className={tombol}>
            Keluar
          </button>
        </form>
        <Link href="/dashboard" className="inline-block text-sm font-semibold text-hof hover:underline">
          Kembali ke dashboard
        </Link>
      </section>

      <FormHapusAkun />
    </div>
  );
}

function StatusToko({ toko }: { toko: TokoDasbor }) {
  return (
    <p className="rounded-lg bg-faint px-3 py-2 text-sm leading-6 text-hof">
      Toko {label(toko.status)}.
      {toko.status === "rejected" && toko.rejection_reason ? ` Alasan: ${toko.rejection_reason}` : ""}
    </p>
  );
}

function StatusProduk({ produk }: { produk: ProdukDasbor }) {
  return (
    <p className="rounded-lg bg-faint px-3 py-2 text-sm leading-6 text-hof">
      {produk.judul}: {label(produk.status)}.
      {produk.status === "rejected" && produk.rejection_reason ? ` Alasan: ${produk.rejection_reason}` : ""}
    </p>
  );
}

function label(status: string) {
  if (status === "approved") return "disetujui";
  if (status === "rejected") return "ditolak";
  return "menunggu";
}

async function muatProfil(supabase: Awaited<ReturnType<typeof createClient>>, id: string) {
  const lengkap = await supabase.from("profiles").select("nama, no_wa, foto_url").eq("id", id).maybeSingle();
  if (!lengkap.error && lengkap.data) return lengkap.data;
  const dasar = await supabase.from("profiles").select("nama, no_wa").eq("id", id).maybeSingle();
  return { nama: dasar.data?.nama ?? "", no_wa: dasar.data?.no_wa ?? null, foto_url: null as string | null };
}

async function tokoTutup(supabase: Awaited<ReturnType<typeof createClient>>, id: string) {
  const { data, error } = await supabase.from("shops").select("is_closed").eq("id", id).maybeSingle();
  if (error || !data) return false;
  return Boolean(data.is_closed);
}

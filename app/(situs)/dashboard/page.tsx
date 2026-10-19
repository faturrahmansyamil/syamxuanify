import { Tombol } from "@/components/tombol";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { tambahProduk, ubahKetersediaan } from "@/app/actions/produk-toko";
import { FormBukaToko } from "@/components/form-buka-toko";
import { Muncul } from "@/components/muncul";
import { FormProduk } from "@/components/form-produk";
import { FormUbahToko } from "@/components/form-ubah-toko";
import { SalinTautan } from "@/components/salin-tautan";
import { StatusModerasi } from "@/components/status-moderasi";
import { InisialToko } from "@/components/tampilan";
import { TombolHapusProduk } from "@/components/tombol-hapus-produk";
import { ambilDasbor } from "@/lib/dasbor";
import { peranPengguna } from "@/lib/peran";
import { createClient } from "@/lib/supabase/server";
import { formatRupiah } from "@/lib/rupiah";
import { fotoPenjual } from "@/lib/contoh-penjual";
import { urlGambarAman } from "@/lib/wa";

export const metadata = {
  title: "Dashboard",
};

export default function HalamanDasbor() {
  return (
    <Suspense fallback={<p className="text-sm text-hof">Memuat dashboard...</p>}>
      <IsiDasbor />
    </Suspense>
  );
}

async function IsiDasbor() {
  const hasil = await ambilDasbor();
  if (!hasil.masuk) redirect("/masuk?selanjutnya=/dashboard");
  const supabase = await createClient();
  if ((await peranPengguna(supabase)) !== "seller") redirect("/");
  if (!hasil.ok) return <p className="rounded-[12px] bg-card p-[16px] text-sm">{hasil.pesan}</p>;

  if (!hasil.toko) {
    return (
      <div className="mx-auto max-w-xl space-y-[16px]">
        <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">Dashboard</h1>
        <FormBukaToko />
      </div>
    );
  }

  const toko = hasil.toko;
  const logo = fotoPenjual(toko.slug, toko.logo_url);
  const qris = urlGambarAman(toko.qris_url);

  return (
    <div className="space-y-[24px]">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">Dashboard</h1>
        <p className="mt-2 text-sm leading-[1.6] text-foggy">Kelola toko dan produkmu dari sini.</p>
      </div>
      <Muncul>
      <section className="kartu space-y-[16px] p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            {logo ? (
              <img src={logo} alt={`Foto ${toko.nama_toko}`} className="h-14 w-14 rounded-full object-cover" />
            ) : (
              <InisialToko nama={toko.nama_toko} className="h-14 w-14 text-lg" />
            )}
            <div className="min-w-0">
              <h2 className="break-words text-xl font-semibold">{toko.nama_toko}</h2>
              <div className="mt-2">
                <StatusModerasi status={toko.status} />
              </div>
            </div>
          </div>
        </div>
        <p className="text-sm leading-[1.6] text-hof">{toko.deskripsi || "Belum ada deskripsi."}</p>
        <p className="text-sm">WhatsApp: {toko.no_wa}</p>
        {qris ? (
          <img src={qris} alt="QRIS toko" className="h-36 w-36 rounded-[12px] border border-bebe object-contain" />
        ) : (
          <p className="text-sm text-foggy">Gambar QRIS belum ada.</p>
        )}
        {toko.status === "rejected" ? (
          <div className="teks-galat rounded-[12px] bg-canvas-mist px-[16px] py-3 text-sm leading-[1.6]">
            <p className="font-semibold">Toko ditolak</p>
            <p className="mt-1 whitespace-pre-wrap break-words">
              {toko.rejection_reason || "Admin tidak menulis alasan."}
            </p>
            <p className="mt-2">Ubah data di bawah, lalu simpan. Statusnya kembali menunggu.</p>
          </div>
        ) : (
          <p className="text-sm leading-[1.6] text-foggy">
            {toko.status === "approved"
              ? "Toko ini sudah tampil untuk pembeli."
              : "Toko ini belum tampil untuk pembeli. Tunggu admin menyetujuinya."}
          </p>
        )}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <Tombol
            href={`/toko/${toko.slug}`}
            prefetch={true} varian="secondary" ukuran="lg">
            Lihat toko saya
          </Tombol>
          <SalinTautan path={`/toko/${toko.slug}`} />
        </div>
      </section>
      </Muncul>
      <FormUbahToko toko={toko} />
      <Muncul>
      <section className="space-y-3">
        <h2 className="text-xl font-semibold">Produk saya</h2>
        {hasil.produk.length === 0 ? (
          <p className="rounded-[12px] bg-card p-[16px] text-sm text-foggy">Belum ada produk.</p>
        ) : (
          <ul className="space-y-3">
            {hasil.produk.map((produk, indeks) => (
              <li key={produk.id}>
                <Muncul urut={indeks}>
                <div className="kartu" style={{ padding: 16 }}>
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="break-words font-semibold">{produk.judul}</p>
                    <p className="mt-1 text-sm text-hof">{formatRupiah(produk.harga)}</p>
                    <p className="mt-1 text-sm text-foggy">{produk.kategori}</p>
                    <p className={produk.is_available ? "mt-1 text-sm text-hof" : "mt-1 text-sm font-semibold text-ink-black"}>
                      {produk.is_available ? "Tersedia" : "Habis"}
                    </p>
                    {produk.status === "rejected" ? (
                      <p className="mt-2 break-words text-sm leading-[1.6] text-ink-black">
                        Ditolak: {produk.rejection_reason || "Admin tidak menulis alasan."}
                      </p>
                    ) : null}
                  </div>
                  <StatusModerasi status={produk.status} />
                </div>
                <div className="mt-3 flex flex-wrap items-center gap-x-[16px] gap-y-2">
                  <form action={ubahKetersediaan}>
                    <input type="hidden" name="id" value={produk.id} />
                    <input type="hidden" name="tersedia" value={produk.is_available ? "tidak" : "ya"} />
                    <Tombol type="submit" varian="secondary" ukuran="sm">
                      {produk.is_available ? "Tandai habis" : "Tandai tersedia"}
                    </Tombol>
                  </form>
                  <Tombol href={`/dashboard/produk/${produk.id}`} prefetch={true} varian="secondary" ukuran="sm">
                    Ubah
                  </Tombol>
                  <TombolHapusProduk id={produk.id} />
                </div>
                </div>
                </Muncul>
              </li>
            ))}
          </ul>
        )}
      </section>
      </Muncul>
      <FormProduk aksi={tambahProduk} kategori={hasil.kategori} utama={false} />
    </div>
  );
}

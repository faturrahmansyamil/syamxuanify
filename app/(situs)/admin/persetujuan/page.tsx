import { Tombol } from "@/components/tombol";
import type { Metadata } from "next";
import { Suspense } from "react";
import { ubahStatusProduk, ubahStatusToko } from "@/app/actions/admin";
import { FormTolak } from "@/components/form-tolak";
import { Muncul } from "@/components/muncul";
import { TombolAksi } from "@/components/tombol-aksi";
import { klienAdmin } from "@/lib/panel-admin";
import { formatRupiah } from "@/lib/rupiah";

export const metadata: Metadata = { title: "Persetujuan" };


export default function HalamanPersetujuan({ searchParams }: { searchParams: Promise<{ tab?: string }> }) {
  return (
    <Suspense fallback={<p className="text-sm text-hof">Memuat persetujuan...</p>}>
      <Isi searchParams={searchParams} />
    </Suspense>
  );
}

async function Isi({ searchParams }: { searchParams: Promise<{ tab?: string }> }) {
  const params = await searchParams;
  const tab = params.tab === "produk" ? "produk" : "toko";
  const hasil = await klienAdmin();
  if (!hasil.ok) return <p className="rounded-[12px] bg-card p-[16px] text-sm">{hasil.pesan}</p>;

  const toko = tab === "toko"
    ? await hasil.supabase.from("shops").select("id, nama_toko, slug, no_wa").eq("status", "pending").order("created_at", { ascending: false })
    : null;
  const produk = tab === "produk"
    ? await hasil.supabase.from("products").select("id, judul, slug, harga, shops(nama_toko)").eq("status", "pending").order("created_at", { ascending: false })
    : null;

  return (
    <div className="space-y-[16px]">
      <header>
        <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">Persetujuan</h1>
        <p className="mt-2 text-sm leading-6 text-foggy">Hanya yang masih menunggu. Tolak wajib menulis alasan.</p>
      </header>
      <div className="flex gap-[16px] border-b border-bebe">
        <Tab href="/admin/persetujuan?tab=toko" aktif={tab === "toko"}>Toko</Tab>
        <Tab href="/admin/persetujuan?tab=produk" aktif={tab === "produk"}>Produk</Tab>
      </div>
      {tab === "toko" ? (
        (toko?.data ?? []).length === 0 ? <Kosong>Tidak ada toko yang menunggu.</Kosong> : (
          <ul className="space-y-3">
            {(toko?.data ?? []).map((item, indeks) => (
              <li key={item.id}>
                <Muncul urut={indeks}>
                <div className="kartu space-y-3 p-[16px]">
                <div>
                  <h2 className="font-semibold">{item.nama_toko}</h2>
                  <p className="mt-1 text-sm text-foggy">WhatsApp: {item.no_wa}</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <TombolAksi aksi={ubahStatusToko} bidang={{ id: item.id, status: "approved", kembali: "/admin/persetujuan?tab=toko" }}>
                    Setujui
                  </TombolAksi>
                  <Tombol href={`/toko/${item.slug}`} varian="secondary" ukuran="sm">Lihat</Tombol>
                </div>
                <FormTolak aksi={ubahStatusToko} id={item.id} kembali="/admin/persetujuan?tab=toko" />
                </div>
                </Muncul>
              </li>
            ))}
          </ul>
        )
      ) : (produk?.data ?? []).length === 0 ? <Kosong>Tidak ada produk yang menunggu.</Kosong> : (
        <ul className="space-y-3">
          {(produk?.data ?? []).map((item, indeks) => {
            const tokoItem = Array.isArray(item.shops) ? item.shops[0] : item.shops;
            return (
              <li key={item.id}>
                <Muncul urut={indeks}>
                <div className="kartu space-y-3 p-[16px]">
                <div>
                  <h2 className="font-semibold">{item.judul}</h2>
                  <p className="mt-1 text-sm text-foggy">{tokoItem?.nama_toko} · {formatRupiah(item.harga)}</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <TombolAksi aksi={ubahStatusProduk} bidang={{ id: item.id, status: "approved", kembali: "/admin/persetujuan?tab=produk" }}>
                    Setujui
                  </TombolAksi>
                  <Tombol href={`/produk/${item.slug}`} varian="secondary" ukuran="sm">Lihat</Tombol>
                </div>
                <FormTolak aksi={ubahStatusProduk} id={item.id} kembali="/admin/persetujuan?tab=produk" />
                </div>
                </Muncul>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

function Tab({ href, aktif, children }: { href: string; aktif: boolean; children: string }) {
  return (
    <Tombol href={href} chip varian={aktif ? "primary" : "secondary"}>
      {children}
    </Tombol>
  );
}

function Kosong({ children }: { children: string }) {
  return <p className="rounded-[12px] bg-card p-[16px] text-sm text-foggy">{children}</p>;
}

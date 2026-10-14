import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { Suspense } from "react";
import { ubahProduk } from "@/app/actions/produk-toko";
import { FormProduk } from "@/components/form-produk";
import type { EtalaseForm } from "@/components/form-produk";
import { ambilDasbor } from "@/lib/dasbor";
import { createClient } from "@/lib/supabase/server";

export const metadata = {
  title: "Ubah produk",
};

export default function HalamanUbahProduk({ params }: { params: Promise<{ id: string }> }) {
  return (
    <Suspense fallback={<p className="text-sm text-hof">Memuat produk...</p>}>
      <IsiUbah params={params} />
    </Suspense>
  );
}

async function IsiUbah({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const hasil = await ambilDasbor();
  if (!hasil.masuk) redirect(`/masuk?selanjutnya=/dashboard/produk/${id}`);
  if (!hasil.ok) return <p className="rounded-[12px] bg-card p-4 text-sm">{hasil.pesan}</p>;

  const produk = hasil.produk.find((item) => item.id === id);
  if (!produk) notFound();
  const etalase = await muatEtalaseForm(id);

  return (
    <div className="mx-auto max-w-xl space-y-4">
      <Link href="/dashboard" className="text-sm font-semibold text-hof">
        Kembali ke dashboard
      </Link>
      <FormProduk aksi={ubahProduk} kategori={hasil.kategori} produk={produk} etalase={etalase} />
    </div>
  );
}

async function muatEtalaseForm(id: string): Promise<EtalaseForm | undefined> {
  const supabase = await createClient();
  const [produk, foto, varian] = await Promise.all([
    supabase.from("products").select("stock, sold_count, condition, preorder_days, weight_or_size").eq("id", id).maybeSingle(),
    supabase.from("product_images").select("url").eq("product_id", id),
    supabase.from("product_variants").select("nama, harga, stock, urutan").eq("product_id", id).order("urutan"),
  ]);
  if (produk.error && foto.error && varian.error) return undefined;
  const baris = produk.data;
  return {
    stock: typeof baris?.stock === "number" ? baris.stock : null,
    sold_count: typeof baris?.sold_count === "number" ? baris.sold_count : 0,
    condition: baris?.condition === "bekas" ? "bekas" : "baru",
    preorder_days: typeof baris?.preorder_days === "number" ? baris.preorder_days : null,
    weight_or_size: baris?.weight_or_size ?? null,
    jumlahFoto: foto.data?.length ?? 0,
    varian: (varian.data ?? []).map((item) => ({
      nama: item.nama,
      harga: typeof item.harga === "number" ? String(item.harga) : "",
      stok: typeof item.stock === "number" ? String(item.stock) : "",
    })),
  };
}

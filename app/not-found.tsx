import Link from "next/link";

export default function TidakDitemukan() {
  return (
    <div className="mx-auto max-w-md rounded-[12px] bg-card p-6 text-center">
      <h1 className="text-2xl font-semibold">Halaman tidak ditemukan</h1>
      <p className="mt-2 text-sm leading-6 text-foggy">
        Produk atau toko itu belum ada, atau belum disetujui.
      </p>
      <Link
        href="/"
        className="btn-duo mt-5 inline-flex items-center justify-center"
      >
        Ke beranda
      </Link>
    </div>
  );
}

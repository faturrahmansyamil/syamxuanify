import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Syarat & Ketentuan",
  description: "Aturan memakai Syamxuanify, barang yang dilarang, dan tanggung jawab transaksi.",
};

export default function HalamanSyarat() {
  return (
    <article className="mx-auto max-w-3xl space-y-6">
      <header className="space-y-2">
        <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">Syarat & Ketentuan</h1>
        <p className="text-sm leading-6 text-foggy">
          Dengan membuka toko atau berbelanja di Syamxuanify, kamu setuju aturan di halaman ini.
        </p>
      </header>

      <section className="space-y-2 rounded-[12px] bg-card p-5">
        <h2 className="text-lg font-semibold">Barang terlarang</h2>
        <p className="text-sm leading-6">Jangan jual atau minta jasa berikut:</p>
        <ul className="list-disc space-y-1 pl-5 text-sm leading-6">
          <li>Narkoba dan obat terlarang</li>
          <li>Senjata</li>
          <li>Barang bajakan</li>
          <li>Akun curian</li>
          <li>Joki tugas</li>
        </ul>
        <p className="text-sm leading-6">
          Admin boleh menolak atau menghapus toko dan produk yang melanggar, lalu menuliskan alasannya.
        </p>
      </section>

      <section className="space-y-2 rounded-[12px] bg-card p-5">
        <h2 className="text-lg font-semibold">Aturan penjual</h2>
        <ul className="list-disc space-y-1 pl-5 text-sm leading-6">
          <li>Toko dan produk baru berstatus menunggu sampai admin menyetujui.</li>
          <li>Tulis nama, harga, dan deskripsi yang jujur.</li>
          <li>Nomor WhatsApp dan gambar QRIS harus milik penjual yang bisa dihubungi.</li>
          <li>Tandai produk habis kalau stoknya sudah tidak ada.</li>
          <li>Kalau ditolak, baca alasannya, perbaiki, lalu ajukan ulang.</li>
        </ul>
      </section>

      <section className="space-y-3 rounded-[12px] bg-card p-5">
        <h2 className="text-lg font-semibold">Transaksi</h2>
        <p className="text-sm leading-6">
          Pembeli menghubungi penjual lewat WhatsApp dan membayar ke QRIS penjual. Harga, pengiriman,
          dan penyelesaian masalah adalah tanggung jawab penjual dan pembeli.
        </p>
      </section>
    </article>
  );
}

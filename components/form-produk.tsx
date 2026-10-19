"use client";

import { Tombol } from "@/components/tombol";
import { useActionState, useState } from "react";
import type { FormState } from "@/app/actions/toko";
import { InputGambar } from "@/components/input-gambar";
import type { KategoriPilihan, ProdukDasbor } from "@/lib/dasbor";

export type EtalaseForm = {
  stock: number | null;
  sold_count: number;
  condition: "baru" | "bekas";
  preorder_days: number | null;
  weight_or_size: string | null;
  jumlahFoto: number;
  varian: Array<{ nama: string; harga: string; stok: string }>;
};

const awal: FormState = {};
const bidang =
  "w-full rounded-lg border border-bebe bg-card px-3 py-3 text-base outline-none focus:border-hof";

export function FormProduk({
  aksi,
  kategori,
  produk,
  etalase,
  utama = true,
}: {
  aksi: (state: FormState, formData: FormData) => Promise<FormState>;
  kategori: KategoriPilihan[];
  produk?: ProdukDasbor;
  etalase?: EtalaseForm;
  utama?: boolean;
}) {
  const [state, action, pending] = useActionState(aksi, awal);

  return (
    <form action={action} className="kartu space-y-[16px] p-5">
      <h2 className="text-xl font-semibold">{produk ? "Ubah produk" : "Tambah produk"}</h2>
      {produk?.status === "rejected" ? (
        <p className="teks-galat rounded-xl bg-canvas-mist px-3 py-2 text-sm leading-[1.6]">
          Ditolak: {produk.rejection_reason || "Admin tidak menulis alasan."} Simpan untuk mengajukan ulang.
        </p>
      ) : null}
      {produk ? <input type="hidden" name="id" value={produk.id} /> : null}
      <div className="space-y-1.5">
        <label htmlFor="judul" className="block text-sm font-medium">
          Judul
        </label>
        <input id="judul" name="judul" required minLength={3} maxLength={80} defaultValue={produk?.judul} className={bidang} />
      </div>
      <div className="space-y-1.5">
        <label htmlFor="harga" className="block text-sm font-medium">
          Harga (rupiah)
        </label>
        <input
          id="harga"
          name="harga"
          inputMode="numeric"
          required
          defaultValue={produk ? String(produk.harga) : ""}
          placeholder="18000"
          className={bidang}
        />
      </div>
      <div className="space-y-1.5">
        <label htmlFor="category_id" className="block text-sm font-medium">
          Kategori
        </label>
        <select id="category_id" name="category_id" required defaultValue={produk?.category_id ?? ""} className={bidang}>
          <option value="" disabled>
            Pilih kategori
          </option>
          {kategori.map((item) => (
            <option key={item.id} value={item.id}>
              {item.nama}
            </option>
          ))}
        </select>
      </div>
      <div className="space-y-1.5">
        <label htmlFor="deskripsi" className="block text-sm font-medium">
          Deskripsi
        </label>
        <textarea
          id="deskripsi"
          name="deskripsi"
          rows={4}
          maxLength={500}
          defaultValue={produk?.deskripsi ?? ""}
          className={bidang}
        />
      </div>
      <div className="grid gap-[16px] sm:grid-cols-2">
        <div className="space-y-1.5">
          <label htmlFor="stock" className="block text-sm font-medium">
            Stok
          </label>
          <input
            id="stock"
            name="stock"
            inputMode="numeric"
            defaultValue={etalase?.stock ?? ""}
            placeholder="Kosong = tidak dibatasi"
            className={bidang}
          />
        </div>
        <div className="space-y-1.5">
          <label htmlFor="sold_count" className="block text-sm font-medium">
            Terjual
          </label>
          <input
            id="sold_count"
            name="sold_count"
            inputMode="numeric"
            defaultValue={etalase ? String(etalase.sold_count) : "0"}
            className={bidang}
          />
        </div>
        <div className="space-y-1.5">
          <label htmlFor="condition" className="block text-sm font-medium">
            Kondisi
          </label>
          <select id="condition" name="condition" defaultValue={etalase?.condition ?? "baru"} className={bidang}>
            <option value="baru">Baru</option>
            <option value="bekas">Bekas</option>
          </select>
        </div>
        <div className="space-y-1.5">
          <label htmlFor="preorder_days" className="block text-sm font-medium">
            Pre-order (hari)
          </label>
          <input
            id="preorder_days"
            name="preorder_days"
            inputMode="numeric"
            defaultValue={etalase?.preorder_days ?? ""}
            placeholder="Kosong kalau siap kirim"
            className={bidang}
          />
        </div>
      </div>
      <div className="space-y-1.5">
        <label htmlFor="weight_or_size" className="block text-sm font-medium">
          Berat atau ukuran
        </label>
        <input
          id="weight_or_size"
          name="weight_or_size"
          maxLength={40}
          defaultValue={etalase?.weight_or_size ?? ""}
          placeholder="Misalnya 250 gram"
          className={bidang}
        />
      </div>
      <DaftarVarian awal={etalase?.varian ?? []} />
      <div className="space-y-1.5">
        <label htmlFor="gambar" className="block text-sm font-medium">
          Foto (maksimal 5)
        </label>
        <InputGambar id="gambar" name="gambar" maks={5} />
        <p className="text-xs leading-5 text-foggy">
          {produk
            ? `Sudah ada ${etalase?.jumlahFoto ?? (produk.gambar_url ? 1 : 0)} foto. Kosongkan kalau tidak diganti. Unggah baru untuk mengganti semuanya.`
            : "JPG, PNG, atau WebP. Masing-masing maksimal 2 MB. Boleh dikosongkan."}
        </p>
      </div>
      {produk ? null : (
        <p className="text-sm leading-[1.6] text-foggy">
          Produk baru berstatus menunggu. Baru tampil di beranda setelah disetujui admin.
        </p>
      )}
      {state.error ? (
        <p role="alert" className="teks-galat rounded-xl bg-canvas-mist px-3 py-2 text-sm">
          {state.error}
        </p>
      ) : null}
      <Tombol type="submit" disabled={pending} varian={utama ? "primary" : "secondary"} ukuran="lg">
        {pending ? "Menyimpan..." : produk?.status === "rejected" ? "Simpan dan ajukan ulang" : "Simpan"}
      </Tombol>
    </form>
  );
}

function DaftarVarian({ awal }: { awal: EtalaseForm["varian"] }) {
  const [baris, setBaris] = useState(awal);

  function ubah(indeks: number, bidangVarian: "nama" | "harga" | "stok", nilai: string) {
    setBaris(baris.map((item, i) => (i === indeks ? { ...item, [bidangVarian]: nilai } : item)));
  }

  return (
    <div className="space-y-2">
      {awal.length > 0 ? <input type="hidden" name="ada_varian" value="1" /> : null}
      <p className="text-sm font-medium">Varian</p>
      {baris.map((item, indeks) => (
        <div key={indeks} className="grid gap-2 sm:grid-cols-[minmax(0,1fr)_7rem_5rem_auto]">
          <input
            name="varian_nama"
            value={item.nama}
            onChange={(event) => ubah(indeks, "nama", event.target.value)}
            maxLength={40}
            placeholder="Ukuran L"
            className={bidang}
          />
          <input
            name="varian_harga"
            value={item.harga}
            onChange={(event) => ubah(indeks, "harga", event.target.value)}
            inputMode="numeric"
            placeholder="Harga"
            className={bidang}
          />
          <input
            name="varian_stok"
            value={item.stok}
            onChange={(event) => ubah(indeks, "stok", event.target.value)}
            inputMode="numeric"
            placeholder="Stok"
            className={bidang}
          />
          <Tombol
            type="button"
            onClick={() => setBaris(baris.filter((_, i) => i !== indeks))} varian="secondary" ukuran="lg">
            Hapus
          </Tombol>
        </div>
      ))}
      {baris.length < 10 ? (
        <Tombol
          type="button"
          onClick={() => setBaris([...baris, { nama: "", harga: "", stok: "" }])} varian="secondary" ukuran="lg">
          Tambah varian
        </Tombol>
      ) : null}
      <p className="text-xs leading-5 text-foggy">Harga dan stok varian boleh kosong. Kosong berarti ikut harga dan stok utama.</p>
    </div>
  );
}

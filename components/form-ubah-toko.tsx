"use client";

import { Tombol } from "@/components/tombol";
import { useActionState, type ReactNode } from "react";
import { ubahToko, type FormState } from "@/app/actions/toko";
import { InputGambar } from "@/components/input-gambar";
import type { TokoDasbor } from "@/lib/dasbor";

const awal: FormState = {};
const bidang =
  "w-full rounded-lg border border-bebe bg-card px-3 py-3 text-base outline-none focus:border-hof";

export function FormUbahToko({ toko, kembali }: { toko: TokoDasbor; kembali?: string }) {
  const [state, action, pending] = useActionState(ubahToko, awal);
  const ditolak = toko.status === "rejected";

  return (
    <form action={action} className="space-y-[16px] rounded-[12px] border border-bebe bg-card p-5">
      {kembali ? <input type="hidden" name="kembali" value={kembali} /> : null}
      <div>
        <h2 className="text-xl font-semibold">Ubah data toko</h2>
        <p className="mt-2 text-sm leading-[1.6] text-foggy">
          {ditolak
            ? "Perbaiki data ini, lalu simpan. Toko diajukan ulang dan statusnya kembali menunggu."
            : "Kosongkan logo atau QRIS kalau gambarnya tidak diganti."}
        </p>
      </div>
      <Bidang id="nama_toko" label="Nama toko">
        <input
          id="nama_toko"
          name="nama_toko"
          required
          minLength={3}
          maxLength={80}
          defaultValue={toko.nama_toko}
          className={bidang}
        />
      </Bidang>
      <Bidang id="deskripsi_toko" label="Deskripsi">
        <textarea
          id="deskripsi_toko"
          name="deskripsi"
          rows={4}
          maxLength={500}
          defaultValue={toko.deskripsi ?? ""}
          className={bidang}
        />
      </Bidang>
      <Bidang id="no_wa_toko" label="Nomor WhatsApp" petunjuk="Boleh diawali 08. Sistem menyimpannya sebagai 62.">
        <input
          id="no_wa_toko"
          name="no_wa"
          type="tel"
          inputMode="tel"
          required
          defaultValue={toko.no_wa}
          className={bidang}
        />
      </Bidang>
      <Bidang id="logo" label="Logo" petunjuk="JPG, PNG, atau WebP. Maksimal 2 MB. Boleh dikosongkan.">
        <InputGambar id="logo" name="logo" />
      </Bidang>
      <Bidang id="qris" label="Gambar QRIS" petunjuk="JPG, PNG, atau WebP. Maksimal 2 MB. Boleh dikosongkan.">
        <InputGambar id="qris" name="qris" jagaKetajaman />
      </Bidang>
      {state.error ? (
        <p role="alert" className="teks-galat rounded-xl bg-canvas-mist px-3 py-2 text-sm">
          {state.error}
        </p>
      ) : null}
      <Tombol
        type="submit"
        disabled={pending} varian="secondary" ukuran="lg">
        {pending ? "Menyimpan..." : ditolak ? "Simpan dan ajukan ulang" : "Simpan perubahan"}
      </Tombol>
    </form>
  );
}

function Bidang({
  id,
  label,
  petunjuk,
  children,
}: {
  id: string;
  label: string;
  petunjuk?: string;
  children: ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <label htmlFor={id} className="block text-sm font-medium">
        {label}
      </label>
      {children}
      {petunjuk ? <p className="text-xs leading-5 text-foggy">{petunjuk}</p> : null}
    </div>
  );
}

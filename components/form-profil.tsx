"use client";

import { useActionState } from "react";
import { simpanProfil, type PengaturanState } from "@/app/actions/pengaturan";
import { InputGambar } from "@/components/input-gambar";

const awal: PengaturanState = {};
const bidang =
  "w-full rounded-lg border border-bebe bg-card px-3 py-3 text-base outline-none focus:border-hof";

export function FormProfil({
  nama,
  noWa,
  foto,
}: {
  nama: string;
  noWa: string | null;
  foto: string | null;
}) {
  const [state, action, pending] = useActionState(simpanProfil, awal);

  return (
    <form action={action} className="space-y-4 rounded-[12px] border border-bebe bg-card p-5">
      <div>
        <h2 className="text-xl font-semibold">Profil</h2>
        <p className="mt-2 text-sm leading-6 text-foggy">Nama, foto, dan WhatsApp pribadi. Kosongkan foto kalau tidak diganti.</p>
      </div>
      {foto ? <img src={foto} alt="" className="h-16 w-16 rounded-full object-cover" /> : null}
      <label className="block space-y-1.5 text-sm font-medium">
        Nama
        <input name="nama" required minLength={2} maxLength={80} defaultValue={nama} className={bidang} />
      </label>
      <label className="block space-y-1.5 text-sm font-medium">
        WhatsApp
        <input name="no_wa" defaultValue={noWa ?? ""} placeholder="081234567890" className={bidang} />
      </label>
      <div className="space-y-1.5">
        <p className="text-sm font-medium">Foto profil</p>
        <InputGambar id="foto-profil" name="foto" />
      </div>
      {state.error ? <p className="rounded-xl bg-red-50 px-3 py-2 text-sm text-red-700">{state.error}</p> : null}
      {state.sukses ? <p className="rounded-xl bg-faint px-3 py-2 text-sm text-hof">{state.sukses}</p> : null}
      <button
        type="submit"
        disabled={pending}
        className="btn-duo flex items-center justify-center disabled:opacity-60"
      >
        {pending ? "Menyimpan..." : "Simpan profil"}
      </button>
    </form>
  );
}

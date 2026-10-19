"use client";

import { Tombol } from "@/components/tombol";
import { useActionState } from "react";
import { hapusAkun, type PengaturanState } from "@/app/actions/pengaturan";

const awal: PengaturanState = {};
const bidang =
  "w-full rounded-lg border border-bebe bg-card px-3 py-3 text-base outline-none focus:border-hof";

export function FormHapusAkun() {
  const [state, action, pending] = useActionState(hapusAkun, awal);

  return (
    <form action={action} className="space-y-[16px] rounded-[12px] border border-bebe bg-card p-5">
      <div>
        <h2 className="text-xl font-semibold">Hapus akun</h2>
        <p className="mt-2 text-sm leading-[1.6] text-foggy">
          Akun, toko, dan produkmu akan terhapus. Ketik HAPUS untuk melanjutkan.
        </p>
      </div>
      <label className="block space-y-1.5 text-sm font-medium">
        Konfirmasi
        <input name="konfirmasi" required autoComplete="off" placeholder="HAPUS" className={bidang} />
      </label>
      {state.error ? <p className="rounded-xl bg-canvas-mist px-3 py-2 text-sm text-ink-black">{state.error}</p> : null}
      <Tombol
        type="submit"
        disabled={pending} varian="secondary" ukuran="lg">
        {pending ? "Menghapus..." : "Hapus akun"}
      </Tombol>
    </form>
  );
}

"use client";

import { useActionState } from "react";
import { hapusAkun, type PengaturanState } from "@/app/actions/pengaturan";

const awal: PengaturanState = {};
const bidang =
  "w-full rounded-lg border border-bebe bg-card px-3 py-3 text-base outline-none focus:border-hof";

export function FormHapusAkun() {
  const [state, action, pending] = useActionState(hapusAkun, awal);

  return (
    <form action={action} className="space-y-4 rounded-[12px] border border-bebe bg-card p-5">
      <div>
        <h2 className="text-xl font-semibold">Hapus akun</h2>
        <p className="mt-2 text-sm leading-6 text-foggy">
          Akun, toko, dan produkmu akan terhapus. Ketik HAPUS untuk melanjutkan.
        </p>
      </div>
      <label className="block space-y-1.5 text-sm font-medium">
        Konfirmasi
        <input name="konfirmasi" required autoComplete="off" placeholder="HAPUS" className={bidang} />
      </label>
      {state.error ? <p className="rounded-xl bg-red-50 px-3 py-2 text-sm text-red-700">{state.error}</p> : null}
      <button
        type="submit"
        disabled={pending}
        className="btn-duo-white flex items-center justify-center disabled:opacity-60"
      >
        {pending ? "Menghapus..." : "Hapus akun"}
      </button>
    </form>
  );
}

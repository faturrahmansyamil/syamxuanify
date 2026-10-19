"use client";

import { Tombol } from "@/components/tombol";
import { useActionState } from "react";
import { simpanSitus, type PengaturanState } from "@/app/actions/pengaturan";
import { InputGambar } from "@/components/input-gambar";
import type { Situs } from "@/lib/situs";

const awal: PengaturanState = {};
const bidang =
  "w-full rounded-lg border border-bebe bg-card px-3 py-3 text-base outline-none focus:border-hof";

export function FormSitus({ situs }: { situs: Situs }) {
  const [state, action, pending] = useActionState(simpanSitus, awal);

  return (
    <form action={action} className="space-y-[16px] rounded-[12px] border border-bebe bg-card p-5">
      <div>
        <h2 className="text-xl font-semibold">Info situs</h2>
        <p className="mt-2 text-sm leading-[1.6] text-foggy">Nama, tagline, logo, WhatsApp, dan email ini dipakai di header, footer, dan halaman Tentang.</p>
      </div>
      <label className="block space-y-1.5 text-sm font-medium">
        Nama situs
        <input name="nama_situs" required minLength={2} maxLength={40} defaultValue={situs.nama_situs} className={bidang} />
      </label>
      <label className="block space-y-1.5 text-sm font-medium">
        Tagline
        <textarea name="tagline" required minLength={2} maxLength={180} defaultValue={situs.tagline} className={`${bidang} min-h-[80px]`} />
      </label>
      <label className="block space-y-1.5 text-sm font-medium">
        Email kontak
        <input name="email_kontak" type="email" required defaultValue={situs.email_kontak} className={bidang} />
      </label>
      <label className="block space-y-1.5 text-sm font-medium">
        WhatsApp admin
        <input name="no_wa" defaultValue={situs.no_wa ?? ""} placeholder="081234567890" className={bidang} />
      </label>
      <div className="space-y-1.5">
        <p className="text-sm font-medium">Logo</p>
        <InputGambar id="logo-situs" name="logo" />
      </div>
      {state.error ? <p className="rounded-xl bg-canvas-mist px-3 py-2 text-sm text-ink-black">{state.error}</p> : null}
      {state.sukses ? <p className="rounded-xl bg-faint px-3 py-2 text-sm text-hof">{state.sukses}</p> : null}
      <div className="flex justify-end">
        <Tombol
          type="submit"
          disabled={pending} varian="secondary" ukuran="lg">
          {pending ? "Menyimpan..." : "Simpan"}
        </Tombol>
      </div>
    </form>
  );
}

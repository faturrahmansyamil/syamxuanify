"use client";

import Link from "next/link";
import { useActionState, type ReactNode } from "react";
import { bukaToko, type FormState } from "@/app/actions/toko";
import { InputGambar } from "@/components/input-gambar";

const awal: FormState = {};
const bidang =
  "w-full rounded-lg border border-bebe bg-card px-3 py-3 text-base outline-none focus:border-hof";

export function FormBukaToko() {
  const [state, action, pending] = useActionState(bukaToko, awal);

  return (
    <form action={action} className="card-duo space-y-4 p-5">
      <div>
        <h2 className="text-xl font-semibold">Buka toko</h2>
        <p className="mt-2 text-sm leading-6 text-foggy">
          Tokomu mulai dengan status menunggu. Admin yang akan menyetujuinya.
        </p>
      </div>
      <Bidang id="nama_toko" label="Nama toko">
        <input id="nama_toko" name="nama_toko" required minLength={3} maxLength={80} className={bidang} />
      </Bidang>
      <Bidang id="deskripsi" label="Deskripsi">
        <textarea id="deskripsi" name="deskripsi" rows={4} maxLength={500} className={bidang} />
      </Bidang>
      <Bidang id="no_wa" label="Nomor WhatsApp" petunjuk="Boleh diawali 08. Sistem menyimpannya sebagai 62.">
        <input id="no_wa" name="no_wa" type="tel" inputMode="tel" required placeholder="081234567890" className={bidang} />
      </Bidang>
      <Bidang id="logo" label="Logo" petunjuk="JPG, PNG, atau WebP. Maksimal 2 MB. Boleh dikosongkan.">
        <InputGambar id="logo" name="logo" />
      </Bidang>
      <Bidang id="qris" label="Gambar QRIS" petunjuk="JPG, PNG, atau WebP. Maksimal 2 MB.">
        <InputGambar id="qris" name="qris" required jagaKetajaman />
      </Bidang>
      <label className="flex items-start gap-3 text-sm leading-6">
        <input type="checkbox" name="setuju" value="ya" required className="mt-1 h-5 w-5 shrink-0 accent-hof" />
        <span>
          Saya setuju{" "}
          <Link href="/syarat" className="font-semibold text-hof hover:underline">
            Syarat & Ketentuan
          </Link>
          .
        </span>
      </label>
      {state.error ? (
        <p role="alert" className="rounded-xl bg-red-50 px-3 py-2 text-sm text-red-700">
          {state.error}
        </p>
      ) : null}
      <button
        type="submit"
        disabled={pending}
        className="btn-duo flex w-full items-center justify-center disabled:opacity-60"
      >
        {pending ? "Menyimpan..." : "Buka toko"}
      </button>
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

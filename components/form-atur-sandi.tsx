"use client";

import { Tombol } from "@/components/tombol";
import { useActionState } from "react";
import { simpanSandiBaru, type AuthState } from "@/app/actions/auth";

const awal: AuthState = {};
const bidang =
  "w-full rounded-lg border border-bebe bg-card px-3 py-3 text-base outline-none focus:border-hof";

export function FormAturSandi() {
  const [state, action, pending] = useActionState(simpanSandiBaru, awal);

  return (
    <form action={action} className="space-y-[16px]">
      <div className="space-y-1.5">
        <label htmlFor="password" className="block text-sm font-medium">
          Kata sandi baru
        </label>
        <input
          id="password"
          name="password"
          type="password"
          autoComplete="new-password"
          required
          minLength={6}
          maxLength={72}
          className={bidang}
        />
      </div>
      <div className="space-y-1.5">
        <label htmlFor="konfirmasi" className="block text-sm font-medium">
          Ulangi kata sandi
        </label>
        <input
          id="konfirmasi"
          name="konfirmasi"
          type="password"
          autoComplete="new-password"
          required
          minLength={6}
          maxLength={72}
          className={bidang}
        />
      </div>
      {state.error ? (
        <p role="alert" className="teks-galat rounded-xl bg-canvas-mist px-3 py-2 text-sm">
          {state.error}
        </p>
      ) : null}
      <Tombol
        type="submit"
        disabled={pending} varian="primary" ukuran="lg" className="w-full">
        {pending ? "Menyimpan..." : "Simpan kata sandi"}
      </Tombol>
    </form>
  );
}

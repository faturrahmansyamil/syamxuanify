"use client";

import { useActionState } from "react";
import { simpanSandiBaru, type AuthState } from "@/app/actions/auth";

const awal: AuthState = {};
const bidang =
  "w-full rounded-lg border border-bebe bg-card px-3 py-3 text-base outline-none focus:border-hof focus:ring-2 focus:ring-bebe";

export function FormAturSandi() {
  const [state, action, pending] = useActionState(simpanSandiBaru, awal);

  return (
    <form action={action} className="space-y-4">
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
        <p role="alert" className="rounded-xl bg-red-50 px-3 py-2 text-sm text-red-700">
          {state.error}
        </p>
      ) : null}
      <button
        type="submit"
        disabled={pending}
        className="flex h-12 w-full items-center justify-center rounded-full bg-accent text-base font-semibold text-white hover:bg-accent-pressed disabled:cursor-not-allowed disabled:opacity-60"
      >
        {pending ? "Menyimpan..." : "Simpan kata sandi"}
      </button>
    </form>
  );
}

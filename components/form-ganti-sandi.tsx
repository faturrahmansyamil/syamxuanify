"use client";

import { useActionState } from "react";
import { gantiKataSandi, type AuthState } from "@/app/actions/auth";

const awal: AuthState = {};
const bidang =
  "w-full rounded-lg border border-bebe bg-card px-3 py-3 text-base outline-none focus:border-hof focus:ring-2 focus:ring-bebe";

export function FormGantiSandi({
  teksSukses,
  rataKanan = false,
}: {
  teksSukses?: string;
  rataKanan?: boolean;
} = {}) {
  const [state, action, pending] = useActionState(gantiKataSandi, awal);

  return (
    <form action={action} className="space-y-4">
      <label className="block space-y-1.5 text-sm font-medium">
        Kata sandi baru
        <input name="password" type="password" autoComplete="new-password" required minLength={6} maxLength={72} className={bidang} />
      </label>
      <label className="block space-y-1.5 text-sm font-medium">
        Ulangi kata sandi
        <input name="konfirmasi" type="password" autoComplete="new-password" required minLength={6} maxLength={72} className={bidang} />
      </label>
      {state.error ? <p className="rounded-xl bg-red-50 px-3 py-2 text-sm text-red-700">{state.error}</p> : null}
      {state.sukses ? <p className="rounded-xl bg-faint px-3 py-2 text-sm text-hof">{teksSukses ?? state.sukses}</p> : null}
      <div className={rataKanan ? "flex justify-end" : ""}>
        <button
          type="submit"
          disabled={pending}
          className="flex h-12 items-center justify-center rounded-full bg-fill px-5 text-sm font-medium text-on-fill hover:bg-fill-pressed disabled:opacity-60"
        >
          {pending ? "Menyimpan..." : "Simpan"}
        </button>
      </div>
    </form>
  );
}

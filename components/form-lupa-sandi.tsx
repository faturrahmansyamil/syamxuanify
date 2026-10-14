"use client";

import { useActionState } from "react";
import { kirimReset, type AuthState } from "@/app/actions/auth";

const awal: AuthState = {};
const bidang =
  "w-full rounded-lg border border-bebe bg-card px-3 py-3 text-base outline-none focus:border-hof";

export function FormLupaSandi() {
  const [state, action, pending] = useActionState(kirimReset, awal);

  return (
    <form action={action} className="space-y-4">
      <div className="space-y-1.5">
        <label htmlFor="email" className="block text-sm font-medium">
          Email
        </label>
        <input id="email" name="email" type="email" autoComplete="email" required className={bidang} />
      </div>
      {state.error ? (
        <p role="alert" className="rounded-xl bg-red-50 px-3 py-2 text-sm text-red-700">
          {state.error}
        </p>
      ) : null}
      {state.sukses ? (
        <p role="status" className="rounded-xl bg-faint px-3 py-2 text-sm text-hof">
          {state.sukses}
        </p>
      ) : null}
      <button
        type="submit"
        disabled={pending}
        className="btn-duo flex w-full items-center justify-center disabled:cursor-not-allowed disabled:opacity-60"
      >
        {pending ? "Mengirim..." : "Kirim tautan"}
      </button>
    </form>
  );
}

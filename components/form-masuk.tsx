"use client";

import Link from "next/link";
import { useActionState } from "react";
import { masuk, type AuthState } from "@/app/actions/auth";
import { BidangSandi, BidangTeks, PemisahAtau, TombolGoogle, TombolUtama, galatBidang, galatUmum } from "@/components/bidang-auth";

const awal: AuthState = {};

export function FormMasuk({ selanjutnya = "/" }: { selanjutnya?: string }) {
  const [state, action, pending] = useActionState(masuk, awal);
  const galatEmail = galatBidang(state.error, "email");
  const galatSandi = galatBidang(state.error, "kata sandi", "password");
  const umum = galatUmum(state.error);

  return (
    <div className="space-y-5">
      <TombolGoogle label="Masuk dengan Google" selanjutnya={selanjutnya} />
      <PemisahAtau />
      <form action={action} className="space-y-4">
        <input type="hidden" name="selanjutnya" value={selanjutnya} />
        <BidangTeks
          id="email"
          name="email"
          label="Email"
          type="email"
          autoComplete="email"
          required
          ikon="email"
          galat={galatEmail}
        />
        <div className="space-y-1.5">
          <BidangSandi id="password" name="password" label="Kata sandi" autoComplete="current-password" galat={galatSandi} />
          <Link href="/lupa-sandi" className="inline-block text-sm font-medium text-[#3c3c3c] hover:underline">
            Lupa password?
          </Link>
        </div>
        {umum ? (
          <p role="alert" className="rounded-xl bg-red-50 px-3 py-2 text-sm text-red-700">
            {umum}
          </p>
        ) : null}
        <TombolUtama pending={pending} anak="Masuk" />
      </form>
    </div>
  );
}

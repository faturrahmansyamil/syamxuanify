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
    <div>
      <TombolGoogle label="Masuk dengan Google" selanjutnya={selanjutnya} />
      <PemisahAtau />
      <form action={action}>
        <input type="hidden" name="selanjutnya" value={selanjutnya} />
        <div className="flex flex-col gap-[16px]">
          <BidangTeks
            id="email"
            name="email"
            label="Email"
            type="email"
            autoComplete="email"
            required
            galat={galatEmail}
          />
          <BidangSandi
            id="password"
            name="password"
            label="Kata sandi"
            autoComplete="current-password"
            galat={galatSandi}
            catatan={
              <div className="mt-[6px] text-right">
                <Link href="/lupa-sandi" className="text-[14px] text-ink-black">
                  Lupa kata sandi?
                </Link>
              </div>
            }
          />
        </div>
        {umum ? (
          <p role="alert" className="mt-[12px] text-[14px] teks-galat">
            {umum}
          </p>
        ) : null}
        <TombolUtama pending={pending} anak="Masuk" />
      </form>
    </div>
  );
}

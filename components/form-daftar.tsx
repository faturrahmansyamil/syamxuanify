"use client";

import { useActionState } from "react";
import { daftar, type AuthState } from "@/app/actions/auth";
import {
  BidangSandi,
  BidangTeks,
  PemisahAtau,
  TombolGoogle,
  TombolUtama,
  galatBidang,
  galatUmum,
} from "@/components/bidang-auth";

const awal: AuthState = {};

export function FormDaftar() {
  const [state, action, pending] = useActionState(daftar, awal);
  const umum = galatUmum(state.error);
  const pesan = state.error?.toLowerCase() ?? "";
  const galatSandi = pesan.includes("ulangan") ? null : galatBidang(state.error, "kata sandi", "password");

  return (
    <div>
      <TombolGoogle label="Daftar dengan Google" />
      <PemisahAtau />
      <p className="mb-[16px] mt-[4px] text-[12px] leading-[1.4] text-[#787574]">
        Akun baru mulai sebagai pembeli. Toko bisa dibuka setelah kamu masuk.
      </p>
      <form action={action}>
        <div className="flex flex-col gap-[16px]">
          <BidangTeks
            id="nama"
            name="nama"
            label="Nama lengkap"
            autoComplete="name"
            required
            minLength={2}
            maxLength={80}
            galat={galatBidang(state.error, "nama")}
          />
          <BidangTeks
            id="no_wa"
            name="no_wa"
            label="Nomor WhatsApp"
            type="tel"
            inputMode="tel"
            autoComplete="tel"
            placeholder="08xxxxxxxxxx"
            bantuan="Boleh dikosongkan. Nanti dipakai pembeli untuk menghubungimu."
            galat={galatBidang(state.error, "whatsapp", "nomor")}
          />
          <BidangTeks
            id="email"
            name="email"
            label="Email"
            type="email"
            autoComplete="email"
            required
            galat={galatBidang(state.error, "email")}
          />
          <BidangSandi
            id="password"
            name="password"
            label="Kata sandi"
            autoComplete="new-password"
            galat={galatSandi}
          />
          <BidangSandi
            id="konfirmasi"
            name="konfirmasi"
            label="Ulangi kata sandi"
            autoComplete="new-password"
            galat={galatBidang(state.error, "ulangan")}
          />
        </div>
        {umum ? (
          <p role="alert" className="mt-[12px] text-[14px] teks-galat">
            {umum}
          </p>
        ) : null}
        {state.sukses ? (
          <p role="status" className="mt-[12px] text-[14px] text-ink-black">
            {state.sukses}
          </p>
        ) : null}
        <TombolUtama pending={pending} anak="Daftar" />
      </form>
    </div>
  );
}

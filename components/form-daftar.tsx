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
    <div className="space-y-5">
      <TombolGoogle label="Daftar dengan Google" />
      <PemisahAtau />
      <p className="text-sm leading-6 text-[#4b4b4b]">Akun baru mulai sebagai pembeli. Toko bisa dibuka setelah kamu masuk.</p>
      <form action={action} className="space-y-4">
        <BidangTeks
          id="nama"
          name="nama"
          label="Nama lengkap"
          autoComplete="name"
          required
          minLength={2}
          maxLength={80}
          ikon="orang"
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
          ikon="wa"
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
          ikon="email"
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
        {umum ? (
          <p role="alert" className="rounded-xl bg-red-50 px-3 py-2 text-sm text-red-700">
            {umum}
          </p>
        ) : null}
        {state.sukses ? (
          <p role="status" className="rounded-xl bg-faint px-3 py-2 text-sm text-hof">
            {state.sukses}
          </p>
        ) : null}
        <TombolUtama pending={pending} anak="Daftar" />
      </form>
    </div>
  );
}

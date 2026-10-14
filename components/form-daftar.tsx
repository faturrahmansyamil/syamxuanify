"use client";

import { useActionState, useState } from "react";
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
  const [niat, setNiat] = useState<"belanja" | "jualan">("belanja");
  const umum = galatUmum(state.error);
  const pesan = state.error?.toLowerCase() ?? "";
  const galatSandi = pesan.includes("ulangan") ? null : galatBidang(state.error, "kata sandi", "password");

  return (
    <div className="space-y-5">
      <TombolGoogle label="Masuk dengan Google" />
      <PemisahAtau />
      <form action={action} className="space-y-4">
        <fieldset className="space-y-2">
          <legend className="text-sm font-medium">Saya mau</legend>
          <div className="grid grid-cols-2 gap-2">
            <KartuNiat
              aktif={niat === "belanja"}
              judul="Belanja"
              teks="Cari produk teman kampus"
              onPilih={() => setNiat("belanja")}
            />
            <KartuNiat
              aktif={niat === "jualan"}
              judul="Jualan"
              teks="Pajang daganganmu nanti"
              onPilih={() => setNiat("jualan")}
            />
          </div>
          <p className="text-xs leading-5 text-foggy">Akun baru mulai sebagai pembeli. Toko bisa dibuka setelah kamu masuk.</p>
        </fieldset>
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
          placeholder="081234567890"
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

function KartuNiat({
  aktif,
  judul,
  teks,
  onPilih,
}: {
  aktif: boolean;
  judul: string;
  teks: string;
  onPilih: () => void;
}) {
  return (
    <button
      type="button"
      aria-pressed={aktif}
      onClick={onPilih}
      data-active={aktif ? "true" : "false"}
      className="chip-duo text-left"
    >
      <span className="block text-sm font-extrabold">{judul}</span>
      <span className={`mt-1 block text-xs leading-5 ${aktif ? "text-[#3c3c3c]" : "text-[#777777]"}`}>{teks}</span>
    </button>
  );
}

"use client";

import type { ReactNode } from "react";
import { useActionState, useState } from "react";
import { masukGoogle, type AuthState } from "@/app/actions/auth";
import { Tombol } from "@/components/tombol";

const awal: AuthState = {};

export function galatBidang(pesan: string | undefined, ...kunci: string[]) {
  if (!pesan) return null;
  const rendah = pesan.toLowerCase();
  return kunci.some((kunciTeks) => rendah.includes(kunciTeks)) ? pesan : null;
}

export function galatUmum(pesan: string | undefined) {
  if (!pesan) return null;
  const rendah = pesan.toLowerCase();
  const spesifik = ["email", "kata sandi", "password", "ulangan", "nama", "whatsapp", "nomor"];
  return spesifik.some((kunci) => rendah.includes(kunci)) ? null : pesan;
}

export function BidangTeks({
  id,
  name,
  label,
  type = "text",
  autoComplete,
  placeholder,
  required,
  minLength,
  maxLength,
  inputMode,
  galat,
  bantuan,
}: {
  id: string;
  name: string;
  label: string;
  type?: string;
  autoComplete?: string;
  placeholder?: string;
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  inputMode?: "text" | "tel" | "email";
  galat?: string | null;
  bantuan?: string;
}) {
  return (
    <div>
      <label htmlFor={id} className="mb-[6px] block text-[14px] font-medium">
        {label}
      </label>
      <input
        id={id}
        name={name}
        type={type}
        autoComplete={autoComplete}
        placeholder={placeholder}
        required={required}
        minLength={minLength}
        maxLength={maxLength}
        inputMode={inputMode}
        aria-invalid={galat ? true : undefined}
        className="input-auth"
      />
      {bantuan ? <p className="mt-[4px] text-[12px] leading-[1.4] text-[#787574]">{bantuan}</p> : null}
      {galat ? (
        <p role="alert" className="mt-[4px] text-[12px] leading-[1.4] teks-galat">
          {galat}
        </p>
      ) : null}
    </div>
  );
}

export function BidangSandi({
  id,
  name,
  label,
  autoComplete,
  galat,
  catatan,
}: {
  id: string;
  name: string;
  label: string;
  autoComplete: string;
  galat?: string | null;
  catatan?: ReactNode;
}) {
  const [tampil, setTampil] = useState(false);

  return (
    <div>
      <label htmlFor={id} className="mb-[6px] block text-[14px] font-medium">
        {label}
      </label>
      <div className="relative">
        <input
          id={id}
          name={name}
          type={tampil ? "text" : "password"}
          autoComplete={autoComplete}
          required
          minLength={6}
          aria-invalid={galat ? true : undefined}
          className="input-auth ada-mata"
        />
        <span className="absolute top-1/2 right-[12px] -translate-y-1/2">
          <Tombol
            type="button"
            onClick={() => setTampil((nilai) => !nilai)}
            aria-label={tampil ? "Sembunyikan kata sandi" : "Tampilkan kata sandi"}
            ikon
            ukuran="sm"
            varian="ghost"
          >
            {tampil ? <IkonMata coret /> : <IkonMata />}
          </Tombol>
        </span>
      </div>
      {catatan}
      {galat ? (
        <p role="alert" className="mt-[4px] text-[12px] leading-[1.4] teks-galat">
          {galat}
        </p>
      ) : null}
    </div>
  );
}

export function TombolUtama({ pending, anak }: { pending: boolean; anak: string }) {
  return (
    <Tombol type="submit" disabled={pending} varian="primary" ukuran="lg" className="mt-[24px] w-full">
      {pending ? <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white motion-reduce:animate-none" /> : null}
      {pending ? "Memproses..." : anak}
    </Tombol>
  );
}

export function TombolGoogle({
  label,
  selanjutnya = "/",
}: {
  label: string;
  selanjutnya?: string;
}) {
  const [state, action, pending] = useActionState(masukGoogle, awal);

  return (
    <form action={action}>
      <input type="hidden" name="selanjutnya" value={selanjutnya} />
      {state.error ? (
        <p role="alert" className="mb-[12px] text-[14px] teks-galat">
          {state.error}
        </p>
      ) : null}
      <Tombol type="submit" disabled={pending} varian="secondary" ukuran="lg" className="relative w-full">
        <span className="absolute left-[20px] flex h-[20px] w-[20px] items-center justify-center">
          {pending ? (
            <span className="h-5 w-5 animate-spin rounded-full border-2 border-[#ebebeb] border-t-black" />
          ) : (
            <IkonGoogle />
          )}
        </span>
        {pending ? "Memproses..." : label}
      </Tombol>
    </form>
  );
}

export function PemisahAtau() {
  return (
    <div className="my-[24px] flex items-center gap-[12px]">
      <span className="h-px flex-1 bg-[#ebebeb]" />
      <span className="text-[12px] text-[#787574]">atau</span>
      <span className="h-px flex-1 bg-[#ebebeb]" />
    </div>
  );
}

function IkonMata({ coret = false }: { coret?: boolean }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden="true">
      <path d="M2 12s3.5-6 10-6 10 6 10 6-3.5 6-10 6S2 12 2 12Z" />
      <circle cx="12" cy="12" r="2.5" />
      {coret ? <path d="m4 5 16 14" /> : null}
    </svg>
  );
}

function IkonGoogle() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden="true">
      <path fill="#000000" d="M21.6 12.2c0-.7-.1-1.4-.2-2H12v3.8h5.4a4.6 4.6 0 0 1-2 3v2.5h3.2c1.9-1.7 3-4.3 3-7.3Z" />
      <path fill="#000000" d="M12 22c2.7 0 5-1 6.6-2.5l-3.2-2.5c-.9.6-2 1-3.4 1-2.6 0-4.8-1.8-5.6-4.1H3.1v2.6A10 10 0 0 0 12 22Z" />
      <path fill="#000000" d="M6.4 13.9A6 6 0 0 1 6.1 12c0-.7.1-1.3.3-1.9V7.5H3.1A10 10 0 0 0 2 12c0 1.6.4 3.1 1.1 4.5l3.3-2.6Z" />
      <path fill="#000000" d="M12 6.1c1.5 0 2.8.5 3.8 1.5l2.8-2.8A10 10 0 0 0 3.1 7.5l3.3 2.6C7.2 7.8 9.4 6.1 12 6.1Z" />
    </svg>
  );
}

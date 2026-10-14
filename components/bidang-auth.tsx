"use client";

import { useActionState, useState } from "react";
import { masukGoogle, type AuthState } from "@/app/actions/auth";

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
  ikon,
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
  ikon: "email" | "orang" | "wa";
  bantuan?: string;
}) {
  return (
    <div className="space-y-1.5">
      <label htmlFor={id} className="block text-sm font-medium">
        {label}
      </label>
      <div className="relative">
        <IkonBidang nama={ikon} />
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
          className={`w-full rounded-xl border-2 bg-[#f7f7f7] py-3 pl-11 pr-3 text-base text-[#3c3c3c] outline-none ${
            galat ? "border-red-400 focus:border-red-500" : "border-[#e5e5e5] focus:border-[#93c5fd]"
          }`}
        />
      </div>
      {bantuan ? <p className="text-xs leading-5 text-foggy">{bantuan}</p> : null}
      {galat ? (
        <p role="alert" className="text-sm text-red-700">
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
}: {
  id: string;
  name: string;
  label: string;
  autoComplete: string;
  galat?: string | null;
}) {
  const [tampil, setTampil] = useState(false);

  return (
    <div className="space-y-1.5">
      <label htmlFor={id} className="block text-sm font-medium">
        {label}
      </label>
      <div className="relative">
        <IkonBidang nama="gembok" />
        <input
          id={id}
          name={name}
          type={tampil ? "text" : "password"}
          autoComplete={autoComplete}
          required
          minLength={6}
          aria-invalid={galat ? true : undefined}
          className={`w-full rounded-xl border-2 bg-[#f7f7f7] py-3 pl-11 pr-12 text-base text-[#3c3c3c] outline-none ${
            galat ? "border-red-400 focus:border-red-500" : "border-[#e5e5e5] focus:border-[#93c5fd]"
          }`}
        />
        <button
          type="button"
          onClick={() => setTampil((nilai) => !nilai)}
          aria-label={tampil ? "Sembunyikan kata sandi" : "Tampilkan kata sandi"}
          className="absolute right-2 top-1/2 inline-flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full text-foggy hover:bg-faint hover:text-hof"
        >
          {tampil ? <IkonMata coret /> : <IkonMata />}
        </button>
      </div>
      {galat ? (
        <p role="alert" className="text-sm text-red-700">
          {galat}
        </p>
      ) : null}
    </div>
  );
}

export function TombolUtama({ pending, anak }: { pending: boolean; anak: string }) {
  return (
    <button
      type="submit"
      disabled={pending}
      className="btn-duo flex w-full items-center justify-center gap-2 disabled:cursor-not-allowed disabled:opacity-70"
    >
      {pending ? <span className="h-5 w-5 animate-spin rounded-full border-2 border-white/40 border-t-white" /> : null}
      {pending ? "Memproses..." : anak}
    </button>
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
    <form action={action} className="space-y-3">
      <input type="hidden" name="selanjutnya" value={selanjutnya} />
      {state.error ? (
        <p role="alert" className="text-sm text-red-700">
          {state.error}
        </p>
      ) : null}
      <button
        type="submit"
        disabled={pending}
        className="btn-duo-white flex w-full items-center justify-center gap-3 disabled:opacity-70"
      >
        {pending ? (
          <span className="h-5 w-5 animate-spin rounded-full border-2 border-bebe border-t-hof" />
        ) : (
          <IkonGoogle />
        )}
        {label}
      </button>
    </form>
  );
}

export function PemisahAtau() {
  return (
    <p className="text-center text-xs text-foggy">atau pakai email</p>
  );
}

function IkonBidang({ nama }: { nama: "email" | "gembok" | "orang" | "wa" }) {
  return (
    <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-foggy">
      {nama === "email" ? (
        <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
          <path d="M4 7h16v10H4z" />
          <path d="m4 8 8 6 8-6" />
        </svg>
      ) : null}
      {nama === "gembok" ? (
        <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
          <rect x="5" y="11" width="14" height="9" rx="2" />
          <path d="M8 11V8a4 4 0 0 1 8 0v3" />
        </svg>
      ) : null}
      {nama === "orang" ? (
        <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
          <circle cx="12" cy="8" r="3" />
          <path d="M5 19c1.4-3 3.8-4.5 7-4.5S17.6 16 19 19" />
        </svg>
      ) : null}
      {nama === "wa" ? (
        <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
          <path d="M6 18.5 4.5 21l2.2-1.2A8 8 0 1 0 6 18.5Z" strokeLinejoin="round" />
        </svg>
      ) : null}
    </span>
  );
}

function IkonMata({ coret = false }: { coret?: boolean }) {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
      <path d="M2 12s3.5-6 10-6 10 6 10 6-3.5 6-10 6S2 12 2 12Z" />
      <circle cx="12" cy="12" r="2.5" />
      {coret ? <path d="m4 5 16 14" /> : null}
    </svg>
  );
}

function IkonGoogle() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden="true">
      <path fill="#4285F4" d="M21.6 12.2c0-.7-.1-1.4-.2-2H12v3.8h5.4a4.6 4.6 0 0 1-2 3v2.5h3.2c1.9-1.7 3-4.3 3-7.3Z" />
      <path fill="#34A853" d="M12 22c2.7 0 5-1 6.6-2.5l-3.2-2.5c-.9.6-2 1-3.4 1-2.6 0-4.8-1.8-5.6-4.1H3.1v2.6A10 10 0 0 0 12 22Z" />
      <path fill="#FBBC05" d="M6.4 13.9A6 6 0 0 1 6.1 12c0-.7.1-1.3.3-1.9V7.5H3.1A10 10 0 0 0 2 12c0 1.6.4 3.1 1.1 4.5l3.3-2.6Z" />
      <path fill="#EA4335" d="M12 6.1c1.5 0 2.8.5 3.8 1.5l2.8-2.8A10 10 0 0 0 3.1 7.5l3.3 2.6C7.2 7.8 9.4 6.1 12 6.1Z" />
    </svg>
  );
}

"use client";

import { useActionState } from "react";
import { laporkan, type LaporanState } from "@/app/actions/laporan";

const awal: LaporanState = {};

export function FormLapor({
  productId,
  shopId,
}: {
  productId?: string;
  shopId?: string;
}) {
  const [state, action, pending] = useActionState(laporkan, awal);

  return (
    <form action={action} className="card-duo space-y-3 p-4">
      <h2 className="font-semibold">Laporkan</h2>
      <p className="text-sm leading-6 text-foggy">
        Laporkan kalau produk atau toko ini mencurigakan. Admin yang akan memeriksanya.
      </p>
      {productId ? <input type="hidden" name="product_id" value={productId} /> : null}
      {shopId ? <input type="hidden" name="shop_id" value={shopId} /> : null}
      <label htmlFor={`alasan-${productId ?? shopId}`} className="block text-sm font-medium">
        Alasan
      </label>
      <textarea
        id={`alasan-${productId ?? shopId}`}
        name="alasan"
        required
        minLength={10}
        maxLength={500}
        rows={4}
        className="w-full rounded-lg border border-bebe px-3 py-3 text-base outline-none focus:border-hof"
        placeholder="Ceritakan apa yang mencurigakan"
      />
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
        disabled={pending || Boolean(state.sukses)}
        className="btn-duo disabled:opacity-60"
      >
        {pending ? "Mengirim..." : "Kirim laporan"}
      </button>
    </form>
  );
}

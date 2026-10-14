"use client";

import { hapusProduk } from "@/app/actions/produk-toko";

export function TombolHapusProduk({ id }: { id: string }) {
  return (
    <form
      action={hapusProduk}
      onSubmit={(event) => {
        if (!window.confirm("Hapus produk ini?")) event.preventDefault();
      }}
    >
      <input type="hidden" name="id" value={id} />
      <button type="submit" className="btn-duo-white">
        Hapus
      </button>
    </form>
  );
}

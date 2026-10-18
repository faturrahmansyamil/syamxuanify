"use client";

import { Tombol } from "@/components/tombol";
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
      <Tombol type="submit" varian="secondary" ukuran="sm">
        Hapus
      </Tombol>
    </form>
  );
}

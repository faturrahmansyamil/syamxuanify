"use client";

import { Heart } from "lucide-react";
import { ubahFavorit } from "@/app/actions/favorit";
import { Tombol } from "@/components/tombol";

export function TombolFavorit({
  id,
  slug,
  disukai,
  kembali,
}: {
  id: string;
  slug: string;
  disukai: boolean;
  kembali: string;
}) {
  return (
    <form
      action={ubahFavorit}
      className="inline-block h-[32px] w-[32px]"
      onClick={(event) => event.stopPropagation()}
      onPointerDown={(event) => event.stopPropagation()}
    >
      <input type="hidden" name="id" value={id} />
      <input type="hidden" name="slug" value={slug} />
      <input type="hidden" name="kembali" value={kembali} />
      <Tombol
        type="submit"
        ikon
        ukuran="sm"
        varian="secondary"
        bayang="sm"
        aria-label={disukai ? "Hapus dari favorit" : "Simpan ke favorit"}
        aria-pressed={disukai}
      >
        <Heart strokeWidth={1.75} fill={disukai ? "currentColor" : "none"} aria-hidden="true" />
      </Tombol>
    </form>
  );
}

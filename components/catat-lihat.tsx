"use client";

import { useEffect } from "react";
import { catatKunjungan } from "@/app/actions/favorit";

export function CatatLihat({ id }: { id: string }) {
  useEffect(() => {
    void catatKunjungan(id);
  }, [id]);

  return null;
}

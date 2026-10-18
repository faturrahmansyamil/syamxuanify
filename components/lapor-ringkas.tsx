"use client";

import { Tombol } from "@/components/tombol";
import { useState } from "react";
import { FormLapor } from "@/components/form-lapor";

export function LaporRingkas({ productId, shopId }: { productId: string; shopId: string }) {
  const [buka, setBuka] = useState(false);

  return (
    <div className="space-y-3">
      <Tombol type="button" onClick={() => setBuka((nilai) => !nilai)} varian="secondary" ukuran="sm">
        Laporkan
      </Tombol>
      {buka ? <FormLapor productId={productId} shopId={shopId} /> : null}
    </div>
  );
}

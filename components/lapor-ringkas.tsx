"use client";

import { useState } from "react";
import { FormLapor } from "@/components/form-lapor";

export function LaporRingkas({ productId, shopId }: { productId: string; shopId: string }) {
  const [buka, setBuka] = useState(false);

  return (
    <div className="space-y-3">
      <button type="button" onClick={() => setBuka((nilai) => !nilai)} className="text-sm text-foggy underline">
        Laporkan
      </button>
      {buka ? <FormLapor productId={productId} shopId={shopId} /> : null}
    </div>
  );
}

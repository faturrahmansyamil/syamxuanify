"use client";

import { useState } from "react";
import { kompresGambar } from "@/lib/kompres-gambar";

const bidang =
  "w-full max-w-full rounded-lg border border-bebe bg-card px-3 py-3 text-base outline-none file:mr-3 file:rounded-lg file:border-0 file:bg-faint file:px-3 file:py-1 file:text-sm file:font-medium file:text-hof";

export function InputGambar({
  id,
  name,
  required = false,
  jagaKetajaman = false,
  maks = 1,
}: {
  id: string;
  name: string;
  required?: boolean;
  jagaKetajaman?: boolean;
  maks?: number;
}) {
  const [pesan, setPesan] = useState("");
  const [galat, setGalat] = useState(false);

  return (
    <div className="space-y-1.5">
      <input
        id={id}
        name={name}
        type="file"
        accept="image/jpeg,image/png,image/webp,.jpg,.jpeg,.png,.webp"
        required={required}
        multiple={maks > 1}
        className={bidang}
        onChange={(event) => {
          const input = event.currentTarget;
          const files = [...(input.files ?? [])].slice(0, maks);
          setPesan("");
          setGalat(false);
          if (files.length === 0) return;

          void (async () => {
            try {
              const hasil = [];
              for (const file of files) hasil.push(await kompresGambar(file, jagaKetajaman));
              const data = new DataTransfer();
              hasil.forEach((file) => data.items.add(file));
              input.files = data.files;
              const total = hasil.reduce((jumlah, file) => jumlah + file.size, 0);
              setPesan(
                `${hasil.length} foto siap diunggah (${Math.max(1, Math.round(total / 1024))} KB).`,
              );
            } catch (err) {
              input.value = "";
              setGalat(true);
              setPesan(err instanceof Error ? err.message : "Gambar tidak bisa dipakai.");
            }
          })();
        }}
      />
      {pesan ? (
        <p role={galat ? "alert" : "status"} className={galat ? "text-sm text-red-700" : "text-sm text-hof"}>
          {pesan}
        </p>
      ) : null}
    </div>
  );
}

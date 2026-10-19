import type { ReactNode } from "react";
import { Merek } from "@/components/merek";

export default function LayoutAuth({ children }: { children: ReactNode }) {
  return (
    <div className="fixed inset-0 overflow-y-auto bg-[#fff4dc]">
      <div className="grid min-h-full lg:grid-cols-[minmax(0,5fr)_minmax(0,6fr)]">
        <aside className="panel-auth hidden lg:flex">
          <div className="tenda-panel" aria-hidden="true" />
          <div className="flex flex-1 flex-col justify-between px-[48px] pt-[40px] pb-[48px]">
            <Merek terang besar />
            <div>
              <p className="font-display text-[44px] leading-[1.02] font-extrabold tracking-[-0.03em] text-[#fff4dc]">
                Lapak jualan
                <br />
                anak kampus.
              </p>
              <p className="mt-[16px] max-w-[380px] text-[16px] leading-[1.55] text-[#fff4dc]/90">
                Jajanan, jasa, barang preloved, sampai produk digital dari sesama mahasiswa. Chat penjualnya lewat
                WhatsApp, bayar langsung ke QRIS mereka.
              </p>
            </div>
            <div className="bon-auth" aria-label="Cara beli di Syamxuanify">
              <p className="bon-auth-judul">CARA BELI</p>
              <ol>
                <li><span>01</span> Pilih barang di etalase</li>
                <li><span>02</span> Chat penjual di WhatsApp</li>
                <li><span>03</span> Bayar ke QRIS penjual</li>
              </ol>
            </div>
          </div>
        </aside>
        <main className="flex min-h-full flex-col">
          <div className="tenda lg:hidden" aria-hidden="true" />
          <div className="flex flex-1 flex-col px-[16px] py-[28px] sm:px-[24px] lg:py-[48px]">
            <div className="mx-auto my-auto w-full max-w-[440px]">{children}</div>
          </div>
        </main>
      </div>
    </div>
  );
}

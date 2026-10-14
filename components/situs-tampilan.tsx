import Link from "next/link";
import { ambilSitus } from "@/lib/situs";
import { tautanWhatsApp, urlGambarAman } from "@/lib/wa";

export async function LogoSitus() {
  const situs = await ambilSitus();
  const logo = urlGambarAman(situs.logo_url) ?? "/logo.svg";
  return <img src={logo} alt={situs.nama_situs} className="h-7 w-auto max-w-[148px] object-contain sm:h-8" />;
}

export async function IsiFooter() {
  const situs = await ambilSitus();
  const wa = situs.no_wa ? tautanWhatsApp(situs.no_wa, `Halo admin ${situs.nama_situs}`) : null;

  return (
    <div className="mx-auto w-full max-w-[1200px] px-4 py-12 md:px-10">
      <div className="grid grid-cols-3 gap-4 md:gap-8">
        <div>
          <h2 className="text-sm font-semibold text-hof">Tentang</h2>
          <p className="mt-3 text-sm leading-6 text-foggy">{situs.tagline}</p>
          <Link href="/tentang" className="mt-3 block text-sm text-foggy hover:text-hof">
            Tentang {situs.nama_situs}
          </Link>
        </div>
        <div>
          <h2 className="text-sm font-semibold text-hof">Syarat</h2>
          <Link href="/syarat" className="mt-3 block text-sm text-foggy hover:text-hof">
            Syarat & Ketentuan
          </Link>
        </div>
        <div>
          <h2 className="text-sm font-semibold text-hof">Kontak</h2>
          <a href={`mailto:${situs.email_kontak}`} className="mt-3 block break-all text-sm text-foggy hover:text-hof">
            {situs.email_kontak}
          </a>
          {wa ? (
            <a href={wa} className="mt-2 block text-sm text-foggy hover:text-hof">
              WhatsApp admin
            </a>
          ) : null}
        </div>
      </div>
      <p className="mt-8 text-sm leading-6 text-foggy">
        Transaksi dilakukan langsung dengan penjual. {situs.nama_situs} tidak memproses pembayaran.
      </p>
    </div>
  );
}

export async function BannerPengumuman() {
  const situs = await ambilSitus();
  if (!situs.pengumuman_aktif || !situs.pengumuman_teks) return null;

  return (
    <p className="rounded-[12px] border border-bebe bg-card px-4 py-3 text-sm leading-6 text-hof">
      {situs.pengumuman_teks}
    </p>
  );
}

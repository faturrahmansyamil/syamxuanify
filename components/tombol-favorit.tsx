import { ubahFavorit } from "@/app/actions/favorit";

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
    <form action={ubahFavorit}>
      <input type="hidden" name="id" value={id} />
      <input type="hidden" name="slug" value={slug} />
      <input type="hidden" name="kembali" value={kembali} />
      <button
        type="submit"
        aria-label={disukai ? "Hapus dari favorit" : "Simpan ke favorit"}
        aria-pressed={disukai}
        data-active={disukai ? "true" : "false"}
        className={disukai ? "btn-duo inline-flex items-center justify-center" : "btn-duo-white inline-flex items-center justify-center"}
      >
        <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden="true" fill={disukai ? "currentColor" : "none"} stroke="currentColor" strokeWidth="1.8">
          <path d="M12 20s-7-4.4-7-9a4 4 0 0 1 7-2 4 4 0 0 1 7 2c0 4.6-7 9-7 9Z" />
        </svg>
      </button>
    </form>
  );
}

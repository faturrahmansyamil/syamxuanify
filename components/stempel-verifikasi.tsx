// Stempel karet "terverifikasi" gambar tangan. Kecil: cap bulat + centang. Besar: cap kotak bertulisan.
export function StempelVerifikasi({ besar = false, className = "" }: { besar?: boolean; className?: string }) {
  if (besar) {
    return (
      <svg
        viewBox="0 0 132 36"
        role="img"
        aria-label="Toko terverifikasi"
        className={`stempel stempel-besar ${className}`}
      >
        <title>Toko terverifikasi</title>
        <path d="M5 4.5c40-1.6 82-1.2 122 .4 1.4 9 1.5 18 .3 27-41 1.5-82 1.3-122-.2-1.3-9-1.4-18-.2-27.2z" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinejoin="round" />
        <path d="M9 8.3c38-1 76-.8 114 .3.8 6.4.8 12.8.1 19.2-38 1-76 .9-114-.2-.8-6.4-.8-12.9-.1-19.3z" fill="none" stroke="currentColor" strokeWidth="1" strokeDasharray="9 2.5 4 2" />
        <path d="M16 18.6l4 4.4 8-10" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
        <text x="33" y="22.5" fill="currentColor" fontSize="11" fontWeight="700" letterSpacing="0.2" fontFamily="var(--font-bon), ui-monospace, monospace">
          TERVERIFIKASI
        </text>
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 24 24" role="img" aria-label="Toko terverifikasi" className={`stempel stempel-kecil ${className}`}>
      <title>Toko terverifikasi</title>
      <path d="M12 1.6c5.9-.2 10.5 4.4 10.4 10.5.1 5.9-4.6 10.5-10.5 10.3C6 22.5 1.4 17.9 1.6 11.9 1.5 6.1 6.2 1.5 12 1.6z" fill="none" stroke="currentColor" strokeWidth="2.2" />
      <circle cx="12" cy="12" r="7.2" fill="none" stroke="currentColor" strokeWidth="0.9" strokeDasharray="5 1.6 2.4 1.4" />
      <path d="M8.1 12.3l2.7 2.9 5.3-6.4" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

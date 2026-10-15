export function BarPengumuman({ teks }: { teks: string }) {
  return (
    <div className="flex h-[48px] items-center justify-center bg-ink-black px-[12px] text-center text-white">
      <p className="max-w-[1200px] truncate text-[14px] leading-none">{teks}</p>
    </div>
  );
}

const LABEL = {
  pending: "Menunggu",
  approved: "Disetujui",
  rejected: "Ditolak",
} as const;

const WARNA = {
  pending: "bg-faint text-foggy",
  approved: "bg-faint text-hof",
  rejected: "bg-faint text-red-700",
} as const;

export function StatusModerasi({ status }: { status: keyof typeof LABEL }) {
  return (
    <span className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${WARNA[status]}`}>
      {LABEL[status]}
    </span>
  );
}

export function FormTolak({
  aksi,
  id,
  kembali,
}: {
  aksi: (formData: FormData) => Promise<void>;
  id: string;
  kembali: string;
}) {
  return (
    <form action={aksi} className="space-y-2 rounded-[12px] bg-faint p-3">
      <input type="hidden" name="id" value={id} />
      <input type="hidden" name="status" value="rejected" />
      <input type="hidden" name="kembali" value={kembali} />
      <label htmlFor={`alasan-${id}`} className="block text-sm font-medium text-hof">
        Alasan ditolak
      </label>
      <textarea
        id={`alasan-${id}`}
        name="alasan"
        required
        minLength={10}
        maxLength={500}
        rows={3}
        placeholder="Tulis alasan yang jelas, minimal 10 huruf."
        className="w-full rounded-lg border border-bebe bg-card px-3 py-3 text-base outline-none focus:border-hof"
      />
      <button
        type="submit"
        className="btn-duo-white flex w-full items-center justify-center sm:w-auto"
      >
        Tolak
      </button>
    </form>
  );
}

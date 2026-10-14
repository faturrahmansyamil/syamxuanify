export function buatSlug(teks: string) {
  const dasar = teks
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 48);

  return dasar || "item";
}

export function normalkanWa(input: string) {
  const angka = input.replace(/\D/g, "");
  if (angka.startsWith("0")) return `62${angka.slice(1)}`;
  return angka;
}

export function waValid(nomor: string) {
  return nomor.startsWith("62") && nomor.length >= 10 && nomor.length <= 15;
}

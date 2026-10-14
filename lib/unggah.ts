import type { SupabaseClient } from "@supabase/supabase-js";

const JENIS: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
};

const BATAS = 2 * 1024 * 1024;

export async function unggahGambar(
  supabase: SupabaseClient,
  bucket: "logos" | "produk" | "qris",
  userId: string,
  file: FormDataEntryValue | null,
) {
  if (!(file instanceof File) || file.size === 0) return { url: null as string | null };

  if (file.size > BATAS) return { error: "Gambar maksimal 2 MB." };

  const ekstensi = JENIS[file.type];
  if (!ekstensi) return { error: "Gambar harus JPG, PNG, atau WebP." };

  const path = `${userId}/${crypto.randomUUID()}.${ekstensi}`;
  const isi = Buffer.from(await file.arrayBuffer());
  const { error } = await supabase.storage.from(bucket).upload(path, isi, {
    contentType: file.type,
    upsert: false,
  });

  if (error) return { error: pesanUnggah(error.message) };

  const { data } = supabase.storage.from(bucket).getPublicUrl(path);
  return { url: data.publicUrl, path };
}

function pesanUnggah(pesan: string) {
  const rendah = pesan.toLowerCase();
  if (rendah.includes("size") || rendah.includes("exceeded") || rendah.includes("too large")) {
    return "Gambar maksimal 2 MB.";
  }
  if (rendah.includes("mime") || rendah.includes("content type") || rendah.includes("invalid")) {
    return "Gambar harus JPG, PNG, atau WebP.";
  }
  return "Gambar gagal diunggah. Coba lagi.";
}

export async function hapusGambar(supabase: SupabaseClient, bucket: "logos" | "produk" | "qris", path: string) {
  await supabase.storage.from(bucket).remove([path]);
}

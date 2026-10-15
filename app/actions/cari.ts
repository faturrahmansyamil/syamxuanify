"use server";

import { cariSaran } from "@/lib/temukan";

export async function cariLangsung(kata: string) {
  return cariSaran(kata);
}

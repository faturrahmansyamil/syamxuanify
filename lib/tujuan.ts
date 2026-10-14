export function tautanAman(nilai: string | null | undefined) {
  if (!nilai || !nilai.startsWith("/") || nilai.startsWith("//") || nilai.includes("\\") || nilai.includes("://")) {
    return "/";
  }

  try {
    const url = new URL(nilai, "http://syamxuanify.local");
    if (url.origin !== "http://syamxuanify.local") return "/";
    return `${url.pathname}${url.search}`;
  } catch {
    return "/";
  }
}

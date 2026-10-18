import type { MetadataRoute } from "next";

const DASAR = "https://syamxuanify.biz.id";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/admin", "/dashboard", "/akun", "/auth", "/atur-sandi", "/lupa-sandi"],
    },
    sitemap: `${DASAR}/sitemap.xml`,
    host: DASAR,
  };
}

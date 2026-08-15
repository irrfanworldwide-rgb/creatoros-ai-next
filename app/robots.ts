import type { MetadataRoute } from "next";

const SITE_URL = "https://creatorosstudio.in";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: ["/", "/tools/"],
      disallow: [
        "/api/",
        "/home",
        "/chat",
        "/library",
        "/profile",
        "/admin",
      ],
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}

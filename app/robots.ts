import type { MetadataRoute } from "next";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://creatorosstudio.in";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: ["/", "/tools", "/tools/"],
      // /tools is now a real public SEO landing page (see app/tools/page.tsx
      // and app/tools/layout.tsx) — no longer disallowed. Individual
      // /tools/[id] pages were already public and indexable.
      disallow: [
        "/api/",
        "/home",
        "/chat",
        "/library",
        "/profile",
        "/admin",
        "/verify-email",
        "/forgot-password",
        "/reset-password",
      ],
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}

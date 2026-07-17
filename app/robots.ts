import type { MetadataRoute } from "next";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://creator-os-ai-kohl.vercel.app";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: ["/", "/tools/"],
      // /tools/[id] pages are publicly viewable (login-gated only for
      // actually generating) and are decent SEO landing pages per tool,
      // so only the auth-gated screens are blocked, not tool subpages.
      disallow: ["/api/", "/home", "/tools$", "/chat", "/library", "/profile"],
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}

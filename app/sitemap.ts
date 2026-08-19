import type { MetadataRoute } from "next";
import { TOOLS } from "@/data/tools";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://creatorosstudio.in";

export default function sitemap(): MetadataRoute.Sitemap {
  const staticPages: MetadataRoute.Sitemap = [
    { url: `${SITE_URL}/`, changeFrequency: "weekly", priority: 1 },
    { url: `${SITE_URL}/tools`, changeFrequency: "weekly", priority: 0.9 },
    { url: `${SITE_URL}/about`, changeFrequency: "yearly", priority: 0.4 },
    { url: `${SITE_URL}/privacy`, changeFrequency: "yearly", priority: 0.3 },
    { url: `${SITE_URL}/terms`, changeFrequency: "yearly", priority: 0.3 },
    { url: `${SITE_URL}/refund-policy`, changeFrequency: "yearly", priority: 0.3 },
    { url: `${SITE_URL}/cookie-policy`, changeFrequency: "yearly", priority: 0.3 },
    { url: `${SITE_URL}/contact`, changeFrequency: "yearly", priority: 0.3 },
  ];

  const toolPages: MetadataRoute.Sitemap = TOOLS.map((t) => ({
    url: `${SITE_URL}/tools/${t.id}`,
    changeFrequency: "monthly",
    priority: 0.7,
  }));

  return [...staticPages, ...toolPages];
}

import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "CreatorOS Studio AI — AI Content Creation Platform",
    short_name: "CreatorOS Studio AI",
    description: "Generate viral hooks, scripts, captions, hashtags and more with AI.",
    start_url: "/home",
    display: "standalone",
    background_color: "#0D1117",
    theme_color: "#0D1117",
    icons: [
      { src: "/icon", sizes: "512x512", type: "image/png" },
      { src: "/apple-icon", sizes: "180x180", type: "image/png" },
    ],
  };
}

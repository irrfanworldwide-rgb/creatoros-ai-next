import { ImageResponse } from "next/og";

export const alt = "CreatorOS AI — AI Content Creation Platform";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "#0D1117",
          backgroundImage: "radial-gradient(ellipse at 50% 30%, rgba(124,58,237,.35), transparent 60%)",
        }}
      >
        <div
          style={{
            display: "flex",
            fontSize: 92,
            fontWeight: 700,
            fontFamily: "sans-serif",
            background: "linear-gradient(135deg, #7C3AED, #A855F7)",
            backgroundClip: "text",
            color: "transparent",
            marginBottom: 20,
          }}
        >
          CreatorOS AI
        </div>
        <div style={{ display: "flex", fontSize: 34, color: "#8b949e", fontFamily: "sans-serif" }}>
          21 AI tools to write hooks, scripts, captions & more
        </div>
      </div>
    ),
    { ...size }
  );
}

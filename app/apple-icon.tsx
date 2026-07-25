import { ImageResponse } from "next/og";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#0D1117",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: 130,
            height: 130,
            borderRadius: 30,
            background: "linear-gradient(135deg, #7C3AED, #A855F7)",
            fontSize: 84,
            fontWeight: 700,
            color: "#fff",
            fontFamily: "sans-serif",
          }}
        >
          C
        </div>
      </div>
    ),
    { ...size }
  );
}

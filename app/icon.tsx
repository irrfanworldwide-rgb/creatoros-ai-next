import { ImageResponse } from "next/og";

export const size = { width: 512, height: 512 };
export const contentType = "image/png";

export default function Icon() {
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
          borderRadius: 96,
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: 340,
            height: 340,
            borderRadius: 76,
            background: "linear-gradient(135deg, #7C3AED, #A855F7)",
            fontSize: 220,
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

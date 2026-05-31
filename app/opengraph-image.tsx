import { ImageResponse } from "next/og";

export const alt = "GitPersona — Turn your GitHub into a developer character sheet";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OgImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "1200px",
          height: "630px",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          background: "#08080b",
          color: "#ededf2",
          fontFamily: "sans-serif",
          padding: "80px",
          position: "relative",
        }}
      >
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "1200px",
            height: "6px",
            background: "#a855f7",
            display: "flex",
          }}
        />
        <div style={{ display: "flex", alignItems: "center", gap: "16px", fontSize: "28px", color: "#9a9aa6" }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: "44px",
              height: "44px",
              borderRadius: "10px",
              background: "#a855f7",
              color: "#08080b",
              fontSize: "30px",
              fontWeight: 700,
            }}
          >
            g
          </div>
          GitPersona
        </div>
        <div style={{ display: "flex", fontSize: "76px", fontWeight: 700, lineHeight: 1.05, marginTop: "28px", maxWidth: "900px" }}>
          Turn your GitHub into a developer character sheet
        </div>
        <div style={{ display: "flex", fontSize: "30px", color: "#9a9aa6", marginTop: "28px", maxWidth: "820px" }}>
          Stats · languages · code footprint · skill scores · your developer archetype
        </div>
      </div>
    ),
    { ...size },
  );
}

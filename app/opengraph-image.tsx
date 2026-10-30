import { ImageResponse } from "next/og";

export const alt = "Aman Choudhary — Software Developer & Full-Stack Engineer";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: "linear-gradient(135deg,#050507 0%,#150811 52%,#3d0b1d 100%)",
          color: "#f4f1ec",
          padding: "66px 74px",
          fontFamily: "Arial, sans-serif",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 27, fontWeight: 800 }}>
          <span>AMAN.</span>
          <span style={{ fontSize: 17, opacity: 0.65 }}>NEW DELHI · INDIA</span>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 15 }}>
          <div style={{ display: "flex", fontSize: 28, letterSpacing: "0.08em", opacity: 0.72 }}>AMAN CHOUDHARY</div>
          <div style={{ display: "flex", flexDirection: "column", fontSize: 78, lineHeight: 0.94, fontWeight: 900 }}>
            <span>SOFTWARE DEVELOPER</span>
            <span>&amp; FULL-STACK ENGINEER</span>
          </div>
          <div style={{ display: "flex", fontSize: 26, opacity: 0.76 }}>Frontend · Backend · APIs · Authentication · Data · Security</div>
        </div>
      </div>
    ),
    size
  );
}

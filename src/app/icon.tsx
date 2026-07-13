import { ImageResponse } from "next/og";

export const size = { width: 32, height: 32 };
export const contentType = "image/png";

const Icon = () =>
  new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#000000",
          borderRadius: 7,
          color: "#E3B97D",
          fontSize: 20,
          fontWeight: 700,
        }}
      >
        H
      </div>
    ),
    { ...size }
  );

export default Icon;

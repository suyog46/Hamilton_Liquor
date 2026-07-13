import { ImageResponse } from "next/og";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

const AppleIcon = () =>
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
          color: "#E3B97D",
          fontSize: 96,
          fontWeight: 700,
        }}
      >
        H
      </div>
    ),
    { ...size }
  );

export default AppleIcon;

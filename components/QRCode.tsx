"use client";

import QRCode from "react-qr-code";

interface Props {
  value: string;
  size?: number;
}

export function QRCodeComponent({ value, size = 160 }: Props) {
  return (
    <div style={{ background: "white", padding: 16 }}>
      <QRCode value={value} size={size} />
    </div>
  );
}

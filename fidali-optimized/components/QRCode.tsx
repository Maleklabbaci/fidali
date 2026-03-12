// components/QRCode.tsx
'use client'

import React from 'react'
import { QRCodeSVG } from 'qrcode.react'

interface QRCodeProps {
  value: string
  size?: number
  bgColor?: string
  fgColor?: string
  logo?: string
}

export const QRCode: React.FC<QRCodeProps> = ({
  value,
  size = 200,
  bgColor = '#FFFFFF',
  fgColor = '#000000',
  logo,
}) => {
  return (
    <div className="inline-flex flex-col items-center gap-2">
      <QRCodeSVG
        value={value}
        size={size}
        bgColor={bgColor}
        fgColor={fgColor}
        level="H"
        imageSettings={
          logo
            ? {
                src: logo,
                height: size * 0.2,
                width: size * 0.2,
                excavate: true,
              }
            : undefined
        }
      />
    </div>
  )
}

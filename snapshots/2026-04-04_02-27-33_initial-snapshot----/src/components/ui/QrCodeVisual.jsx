import React, { useEffect, useRef } from 'react';
import QRCode from 'qrcode';

/**
 * QrCodeVisual - يرسم QR code على canvas
 * Props: value (string), size (number, default 128)
 */
export function QrCodeVisual({ value, size = 128 }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    if (!canvasRef.current || !value) return;
    QRCode.toCanvas(canvasRef.current, value, {
      width: size,
      margin: 1,
      color: { dark: '#0f172a', light: '#ffffff' },
    }).catch(() => {});
  }, [value, size]);

  if (!value) {
    return (
      <div
        style={{ width: size, height: size }}
        className="flex items-center justify-center rounded-xl bg-slate-100 text-slate-400 text-xs"
      >
        —
      </div>
    );
  }

  return <canvas ref={canvasRef} width={size} height={size} className="rounded-xl" />;
}

export default QrCodeVisual;

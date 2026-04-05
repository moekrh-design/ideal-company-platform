import React from 'react';
import { QrCodeVisual } from './QrCodeVisual';

/**
 * LinkQrPreview - يعرض QR code لرابط مع عنوان
 * Props: url (string), label (string), size (number)
 */
export function LinkQrPreview({ url, label, size = 120 }) {
  return (
    <div className="flex flex-col items-center gap-2 rounded-2xl bg-white p-4 ring-1 ring-slate-200">
      {label && <div className="text-sm font-bold text-slate-700">{label}</div>}
      <QrCodeVisual value={url} size={size} />
      {url && (
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs text-sky-600 hover:underline break-all text-center max-w-[200px]"
        >
          {url}
        </a>
      )}
    </div>
  );
}

export default LinkQrPreview;

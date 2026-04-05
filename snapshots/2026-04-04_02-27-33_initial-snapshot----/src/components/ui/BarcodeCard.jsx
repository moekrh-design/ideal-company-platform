import React from 'react';
import { QrCodeVisual } from './QrCodeVisual';

/**
 * BarcodeCard - بطاقة طالب مع QR code
 * Props: student, companyName, schoolName
 */
export function BarcodeCard({ student, companyName, schoolName }) {
  if (!student) return null;
  return (
    <div className="flex flex-col items-center gap-3 rounded-2xl bg-white p-5 ring-1 ring-slate-200 shadow-sm print:break-inside-avoid">
      <div className="text-center">
        <div className="text-base font-bold text-slate-800">{student.name}</div>
        {companyName && <div className="text-xs text-slate-500">{companyName}</div>}
        {schoolName && <div className="text-xs text-slate-400">{schoolName}</div>}
      </div>
      <QrCodeVisual value={student.barcode || student.id} size={120} />
      <div className="text-xs font-mono text-slate-400 tracking-wider">{student.barcode || student.id}</div>
    </div>
  );
}

export default BarcodeCard;

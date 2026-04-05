import React from 'react';

import { cx } from '../../utils/sharedFunctions.jsx';

/**
 * MiniAttendanceRing - حلقة دائرية تعرض نسبة الحضور
 * Props: value (0-100)
 */
export function MiniAttendanceRing({ value = 0 }) {
  const pct = Math.min(100, Math.max(0, value));
  const r = 40;
  const circ = 2 * Math.PI * r;
  const offset = circ - (pct / 100) * circ;

  const color = pct >= 80 ? '#10b981' : pct >= 60 ? '#f59e0b' : '#ef4444';

  return (
    <div className="relative inline-flex items-center justify-center">
      <svg width="100" height="100" viewBox="0 0 100 100">
        <circle cx="50" cy="50" r={r} fill="none" stroke="#e2e8f0" strokeWidth="10" />
        <circle
          cx="50"
          cy="50"
          r={r}
          fill="none"
          stroke={color}
          strokeWidth="10"
          strokeDasharray={circ}
          strokeDashoffset={offset}
          strokeLinecap="round"
          transform="rotate(-90 50 50)"
        />
      </svg>
      <div className="absolute text-center">
        <div className="text-lg font-black text-slate-800">{Math.round(pct)}%</div>
      </div>
    </div>
  );
}

export default MiniAttendanceRing;

import React from 'react';

/**
 * ScreenAxisTick - تسمية محور Y لشاشات العرض
 */
export function ScreenAxisTick({ x, y, payload, width = 300 }) {
  if (!payload) return null;
  return (
    <g transform={`translate(${x},${y})`}>
      <text
        x={0}
        y={0}
        dy={4}
        textAnchor="end"
        fill="#334155"
        fontSize={13}
        fontWeight={600}
        style={{ direction: 'rtl' }}
      >
        {payload.value && payload.value.length > 22
          ? payload.value.slice(0, 22) + '…'
          : payload.value}
      </text>
    </g>
  );
}

/**
 * ScreenBarValueLabel - تسمية قيمة الشريط في شاشات العرض
 */
export function ScreenBarValueLabel({ x, y, width, height, value, suffix = '' }) {
  if (!value) return null;
  return (
    <text
      x={(x || 0) + (width || 0) + 6}
      y={(y || 0) + (height || 0) / 2}
      dy={4}
      textAnchor="start"
      fill="#0f172a"
      fontSize={13}
      fontWeight={700}
    >
      {value}{suffix}
    </text>
  );
}

import React from 'react';
import { cx } from '../../utils/helpers';

/**
 * SchoolTickerLogo - شعار المدرسة في شريط الأخبار
 * Props: schoolName (string), className (string)
 */
export function SchoolTickerLogo({ schoolName, className = '' }) {
  return (
    <span className={cx(
      'inline-flex items-center gap-1.5 rounded-full bg-white/20 font-bold text-white',
      className
    )}>
      <span className="flex h-6 w-6 items-center justify-center rounded-full bg-white/30 text-xs font-black">
        {schoolName ? schoolName[0] : '◆'}
      </span>
      {schoolName}
    </span>
  );
}

export default SchoolTickerLogo;

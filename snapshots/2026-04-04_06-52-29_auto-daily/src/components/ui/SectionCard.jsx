import React from 'react';
import { cx } from '../../utils/helpers';

export function SectionCard({ title, icon: Icon, children, action, className = "" }) {
  return (
    <div className={cx("overflow-hidden rounded-3xl bg-white shadow-sm ring-1 ring-slate-200", className)}>
      <div className="flex items-center justify-between gap-3 border-b border-slate-100 px-5 py-4">
        <div className="flex min-w-0 items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-sky-100 text-sky-700">
            <Icon className="h-5 w-5" />
          </div>
          <h3 className="truncate font-bold text-slate-800">{title}</h3>
        </div>
        {action}
      </div>
      <div className="p-5">{children}</div>
    </div>
  );
}

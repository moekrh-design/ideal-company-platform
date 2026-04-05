import React from 'react';
import { motion } from 'framer-motion';
import { cx } from '../../utils/helpers';

export function StatCard({ title, label, value, subtitle, tone, icon: Icon }) {
  const toneClasses = {
    sky: 'bg-sky-100 text-sky-700',
    green: 'bg-emerald-100 text-emerald-700',
    amber: 'bg-amber-100 text-amber-700',
    violet: 'bg-violet-100 text-violet-700',
    rose: 'bg-rose-100 text-rose-700',
    blue: 'bg-blue-100 text-blue-700',
    slate: 'bg-slate-100 text-slate-700',
  };
  const displayTitle = title || label;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-3xl bg-white p-5 shadow-sm ring-1 ring-slate-200"
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="text-sm text-slate-500">{displayTitle}</div>
          <div className="mt-2 text-3xl font-extrabold text-slate-800">{value}</div>
          <div className="mt-1 text-sm text-slate-500">{subtitle}</div>
        </div>
        {Icon ? (
          <div className={cx('flex h-12 w-12 items-center justify-center rounded-2xl', toneClasses[tone] || 'bg-emerald-100 text-emerald-700')}>
            <Icon className="h-6 w-6" />
          </div>
        ) : null}
      </div>
    </motion.div>
  );
}

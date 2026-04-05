import React from 'react';
import { cx } from '../../utils/helpers';

export function Input({ label, className = "", ...props }) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-bold text-slate-700">{label}</span>
      <input {...props} className={cx("w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none", className)} />
    </label>
  );
}

export function Select({ label, className = "", children, ...props }) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-bold text-slate-700">{label}</span>
      <select {...props} className={cx("w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none", className)}>
        {children}
      </select>
    </label>
  );
}

export function SummaryBox({ label, value, color = "text-slate-900" }) {
  return (
    <div className="rounded-2xl bg-white p-4 text-center ring-1 ring-slate-200">
      <div className={cx("text-2xl font-black", color)}>{value}</div>
      <div className="text-sm text-slate-500">{label}</div>
    </div>
  );
}

export function MetricTile({ label, value, hint }) {
  return (
    <div className="rounded-2xl bg-slate-50 p-4 ring-1 ring-slate-200">
      <div className="text-sm text-slate-500">{label}</div>
      <div className="mt-2 text-2xl font-black text-slate-800">{value}</div>
      {hint ? <div className="mt-1 text-xs text-slate-500">{hint}</div> : null}
    </div>
  );
}

export function Button({ children, variant = 'primary', className = '', ...props }) {
  const variants = {
    primary: 'bg-sky-600 text-white hover:bg-sky-700 shadow-sm',
    secondary: 'bg-slate-100 text-slate-700 hover:bg-slate-200',
    danger: 'bg-rose-600 text-white hover:bg-rose-700 shadow-sm',
    ghost: 'text-slate-600 hover:bg-slate-100',
  };

  return (
    <button
      {...props}
      className={cx(
        'inline-flex items-center justify-center gap-2 rounded-2xl px-5 py-2.5 text-sm font-bold transition-colors disabled:opacity-50',
        variants[variant] || variants.primary,
        className
      )}
    >
      {children}
    </button>
  );
}

// ─── Badge ────────────────────────────────────────────────────────────────────
const BADGE_TONE_CLASSES = {
  blue:    'bg-blue-100 text-blue-800 ring-blue-200',
  emerald: 'bg-emerald-100 text-emerald-800 ring-emerald-200',
  green:   'bg-green-100 text-green-800 ring-green-200',
  sky:     'bg-sky-100 text-sky-800 ring-sky-200',
  amber:   'bg-amber-100 text-amber-800 ring-amber-200',
  rose:    'bg-rose-100 text-rose-800 ring-rose-200',
  red:     'bg-red-100 text-red-800 ring-red-200',
  violet:  'bg-violet-100 text-violet-800 ring-violet-200',
  purple:  'bg-purple-100 text-purple-800 ring-purple-200',
  slate:   'bg-slate-100 text-slate-700 ring-slate-200',
  gray:    'bg-gray-100 text-gray-700 ring-gray-200',
  orange:  'bg-orange-100 text-orange-800 ring-orange-200',
  teal:    'bg-teal-100 text-teal-800 ring-teal-200',
  cyan:    'bg-cyan-100 text-cyan-800 ring-cyan-200',
  indigo:  'bg-indigo-100 text-indigo-800 ring-indigo-200',
  pink:    'bg-pink-100 text-pink-800 ring-pink-200',
  lime:    'bg-lime-100 text-lime-800 ring-lime-200',
  yellow:  'bg-yellow-100 text-yellow-800 ring-yellow-200',
};

export function Badge({ tone = 'slate', children, className = '' }) {
  const toneClass = BADGE_TONE_CLASSES[tone] || BADGE_TONE_CLASSES.slate;
  return (
    <span className={cx(
      'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset',
      toneClass,
      className
    )}>
      {children}
    </span>
  );
}

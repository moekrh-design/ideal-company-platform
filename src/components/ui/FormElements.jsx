import React from 'react';
import { AlertCircle, CheckCircle2 } from 'lucide-react';
import { cx } from '../../utils/helpers';

// ─── رسالة خطأ الحقل ───────────────────────────────────────────────────────
export function FieldError({ error }) {
  if (!error) return null;
  return (
    <div className="mt-1.5 flex items-center gap-1.5 text-xs font-medium text-rose-600">
      <AlertCircle className="h-3.5 w-3.5 flex-shrink-0" />
      <span>{error}</span>
    </div>
  );
}

// ─── بانر خطأ النموذج الكامل ────────────────────────────────────────────────
export function FormError({ errors }) {
  const messages = Object.values(errors || {}).filter(Boolean);
  if (!messages.length) return null;
  return (
    <div className="rounded-2xl bg-rose-50 p-4 ring-1 ring-rose-200">
      <div className="flex items-start gap-2">
        <AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0 text-rose-600" />
        <div>
          <div className="text-sm font-bold text-rose-800">يرجى تصحيح الأخطاء التالية:</div>
          <ul className="mt-1.5 space-y-1">
            {messages.map((msg, i) => (
              <li key={i} className="text-xs text-rose-700">• {msg}</li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

// ─── رسالة نجاح ─────────────────────────────────────────────────────────────
export function FormSuccess({ message }) {
  if (!message) return null;
  return (
    <div className="flex items-center gap-2 rounded-2xl bg-emerald-50 p-4 ring-1 ring-emerald-200">
      <CheckCircle2 className="h-4 w-4 flex-shrink-0 text-emerald-600" />
      <span className="text-sm font-medium text-emerald-800">{message}</span>
    </div>
  );
}

// ─── Input مع دعم الأخطاء ───────────────────────────────────────────────────
export function Input({ label, className = "", error, required, hint, ...props }) {
  const hasError = Boolean(error);
  return (
    <div className="block">
      {label && (
        <div className="mb-2 flex items-center justify-between gap-2">
          <span className={cx("block text-sm font-bold", hasError ? "text-rose-700" : "text-slate-700")}>
            {label}
            {required && <span className="mr-1 text-rose-500">*</span>}
          </span>
          {hint && <span className="text-xs text-slate-400">{hint}</span>}
        </div>
      )}
      <input
        {...props}
        className={cx(
          "w-full rounded-2xl border px-4 py-3 text-sm outline-none transition-colors",
          hasError
            ? "border-rose-300 bg-rose-50 text-rose-900 placeholder-rose-300 focus:border-rose-400 focus:ring-2 focus:ring-rose-100"
            : "border-slate-200 bg-white focus:border-sky-400 focus:ring-2 focus:ring-sky-50",
          className
        )}
      />
      <FieldError error={error} />
    </div>
  );
}

// ─── Select مع دعم الأخطاء ──────────────────────────────────────────────────
export function Select({ label, className = "", children, error, required, hint, ...props }) {
  const hasError = Boolean(error);
  return (
    <div className="block">
      {label && (
        <div className="mb-2 flex items-center justify-between gap-2">
          <span className={cx("block text-sm font-bold", hasError ? "text-rose-700" : "text-slate-700")}>
            {label}
            {required && <span className="mr-1 text-rose-500">*</span>}
          </span>
          {hint && <span className="text-xs text-slate-400">{hint}</span>}
        </div>
      )}
      <select
        {...props}
        className={cx(
          "w-full rounded-2xl border px-4 py-3 text-sm outline-none transition-colors",
          hasError
            ? "border-rose-300 bg-rose-50 text-rose-900 focus:border-rose-400"
            : "border-slate-200 bg-white focus:border-sky-400",
          className
        )}
      >
        {children}
      </select>
      <FieldError error={error} />
    </div>
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

/**
 * ==========================================
 *  HelpGuideModal Component
 *  تم استخراجه تلقائياً من App.jsx
 * ==========================================
 */
import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  BadgeCheck, BarChart3, Bell, BookOpen, CheckCircle, Building2, Camera,
  ClipboardCheck, ClipboardList, Copy, Database, ExternalLink, Download,
  Gift, FileClock, GraduationCap, Layers3, LayoutDashboard, LineChart,
  Maximize2, Plus, QrCode, RefreshCw, Rocket, Wifi, WifiOff, Clock3,
  Save, ScanLine, School, ShoppingCart, Search, Settings, Shield,
  ShieldAlert, ShieldCheck, Trash2, Trophy, Upload, UserCircle2, Users,
  Wand2, Pencil, Archive, ArrowRightLeft, MonitorSmartphone, Loader2,
  PackageCheck, Printer, Unlink2, UserCheck, Phone, RefreshCcw, School2,
  Sparkles, FolderOpen, Info, ChevronDown, AlertCircle
} from 'lucide-react';
import {
  Bar, BarChart, CartesianGrid, Cell, LabelList, Legend,
  Line, LineChart as RLineChart, Pie, PieChart, ResponsiveContainer,
  Tooltip, XAxis, YAxis
} from 'recharts';
// === الدوال المشتركة ===
import { cx, safeNumber, clamp, getTodayIso, toArabicDate, parseTimeToMinutes, formatDateTime, getShortStudentName, schoolHasStructureClassrooms, getStudentCompanyName, getStudentGroupingLabel, resultTone, statusFromResult, getRoleLabel, canAccessPermission, getUnifiedSchoolStudents, pieColors, roles, getAuthActionMeta, generateQrDataUrl, exportToExcel } from '../utils/sharedFunctions.jsx';
import { HELP_GUIDES } from '../constants/helpGuides.jsx';
;


function HelpGuideModal({ open, role, onClose }) {
  const [activeSection, setActiveSection] = useState(0);
  useEffect(() => { if (open) setActiveSection(0); }, [open]);
  if (!open) return null;
  const guide = HELP_GUIDES[role] || HELP_GUIDES.teacher;
  const colorMap = {
    violet: { bg: 'bg-violet-700', light: 'bg-violet-50', ring: 'ring-violet-200', text: 'text-violet-900', badge: 'bg-violet-100 text-violet-800', active: 'bg-violet-700 text-white', inactive: 'bg-slate-100 text-slate-700' },
    sky: { bg: 'bg-sky-700', light: 'bg-sky-50', ring: 'ring-sky-200', text: 'text-sky-900', badge: 'bg-sky-100 text-sky-800', active: 'bg-sky-700 text-white', inactive: 'bg-slate-100 text-slate-700' },
    emerald: { bg: 'bg-emerald-700', light: 'bg-emerald-50', ring: 'ring-emerald-200', text: 'text-emerald-900', badge: 'bg-emerald-100 text-emerald-800', active: 'bg-emerald-700 text-white', inactive: 'bg-slate-100 text-slate-700' },
    amber: { bg: 'bg-amber-600', light: 'bg-amber-50', ring: 'ring-amber-200', text: 'text-amber-900', badge: 'bg-amber-100 text-amber-800', active: 'bg-amber-600 text-white', inactive: 'bg-slate-100 text-slate-700' },
  };
  const c = colorMap[guide.color] || colorMap.sky;
  const section = guide.sections[activeSection];
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/60 p-4" onClick={onClose}>
      <div className="w-full max-w-lg overflow-hidden rounded-[2rem] bg-white shadow-2xl ring-1 ring-slate-200" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className={cx('flex items-center justify-between gap-4 p-5', c.bg)}>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white/20">
              <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4M12 8h.01"/></svg>
            </div>
            <div>
              <div className="text-xs font-bold text-white/70">دليل الاستخدام</div>
              <div className="text-lg font-black text-white">{guide.title}</div>
            </div>
          </div>
          <button onClick={onClose} className="flex h-9 w-9 items-center justify-center rounded-2xl bg-white/20 text-white hover:bg-white/30">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="h-5 w-5"><path d="M18 6 6 18M6 6l12 12"/></svg>
          </button>
        </div>
        {/* Tabs */}
        <div className="flex gap-2 overflow-x-auto p-4 pb-0">
          {guide.sections.map((s, i) => (
            <button key={i} onClick={() => setActiveSection(i)} className={cx('flex-shrink-0 rounded-2xl px-4 py-2 text-sm font-bold transition', i === activeSection ? c.active : c.inactive)}>
              {s.title}
            </button>
          ))}
        </div>
        {/* Content */}
        <div className="p-5">
          <div className={cx('rounded-[1.5rem] p-5', c.light, 'ring-1', c.ring)}>
            <div className={cx('text-base font-black', c.text)}>{section.title}</div>
            <ol className="mt-4 space-y-3">
              {section.steps.map((step, i) => (
                <li key={i} className="flex items-start gap-3">
                  <span className={cx('flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full text-xs font-black text-white', c.bg)}>{i + 1}</span>
                  <span className={cx('text-sm leading-7', c.text)}>{step}</span>
                </li>
              ))}
            </ol>
          </div>
          <div className="mt-4 flex items-center justify-between">
            <span className="text-xs text-slate-400">{activeSection + 1} / {guide.sections.length}</span>
            <div className="flex gap-2">
              {activeSection > 0 && <button onClick={() => setActiveSection(activeSection - 1)} className="rounded-2xl bg-slate-100 px-4 py-2 text-sm font-bold text-slate-700">السابق</button>}
              {activeSection < guide.sections.length - 1 && <button onClick={() => setActiveSection(activeSection + 1)} className={cx('rounded-2xl px-4 py-2 text-sm font-bold text-white', c.bg)}>التالي</button>}
              {activeSection === guide.sections.length - 1 && <button onClick={onClose} className={cx('rounded-2xl px-4 py-2 text-sm font-bold text-white', c.bg)}>إغلاق</button>}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default HelpGuideModal;

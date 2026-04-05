/**
 * ==========================================
 *  ResetUserPasswordModal Component
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
import { Input } from './ui/FormElements';
;


function ResetUserPasswordModal({ open, targetUser, onClose, onSubmit, loading }) {
  const [form, setForm] = useState({ newPassword: '', confirmPassword: '' });
  const [error, setError] = useState('');

  useEffect(() => {
    if (!open) {
      setForm({ newPassword: '', confirmPassword: '' });
      setError('');
    }
  }, [open, targetUser?.id]);

  if (!open || !targetUser) return null;

  const submit = async (e) => {
    e.preventDefault();
    if (!form.newPassword || !form.confirmPassword) {
      setError('أدخل كلمة المرور الجديدة وتأكيدها.');
      return;
    }
    if (form.newPassword.length < 6) {
      setError('كلمة المرور الجديدة يجب ألا تقل عن 6 أحرف.');
      return;
    }
    if (form.newPassword !== form.confirmPassword) {
      setError('تأكيد كلمة المرور غير متطابق.');
      return;
    }
    const result = await onSubmit({ userId: targetUser.id, newPassword: form.newPassword, confirmPassword: form.confirmPassword });
    if (!result?.ok) setError(result?.message || 'تعذر إعادة تعيين كلمة المرور.');
  };

  return (
    <div className="fixed inset-0 z-[90] flex items-center justify-center bg-slate-950/50 p-4">
      <div className="w-full max-w-xl rounded-[2rem] bg-white p-6 shadow-2xl ring-1 ring-slate-200">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="text-sm text-slate-500">إعادة تعيين كلمة المرور</div>
            <div className="mt-1 text-2xl font-black text-slate-900">{targetUser.name || targetUser.username}</div>
            <div className="mt-2 text-sm text-slate-500">{getRoleLabel(targetUser.role)} • {targetUser.username}</div>
          </div>
          <button onClick={onClose} className="rounded-2xl bg-slate-100 px-3 py-2 text-sm font-bold text-slate-700">إغلاق</button>
        </div>
        <div className="mt-4 rounded-2xl bg-violet-50 p-4 text-sm leading-7 text-violet-900 ring-1 ring-violet-100">
          سيُطلب من المستخدم تسجيل الدخول بكلمة المرور الجديدة بعد إبلاغه بها. استخدم هذا الإجراء فقط عند الحاجة الإدارية.
        </div>
        <form onSubmit={submit} className="mt-5 space-y-4">
          <Input label="كلمة المرور الجديدة" type="password" value={form.newPassword} onChange={(e) => { setForm((prev) => ({ ...prev, newPassword: e.target.value })); setError(''); }} />
          <Input label="تأكيد كلمة المرور الجديدة" type="password" value={form.confirmPassword} onChange={(e) => { setForm((prev) => ({ ...prev, confirmPassword: e.target.value })); setError(''); }} />
          {error ? <div className="rounded-2xl bg-rose-50 px-4 py-3 text-sm font-bold text-rose-700 ring-1 ring-rose-100">{error}</div> : null}
          <div className="flex flex-wrap items-center gap-3 pt-2">
            <button type="submit" disabled={loading} className={`inline-flex items-center gap-2 rounded-2xl px-5 py-3 font-bold text-white ${loading ? 'bg-slate-400' : 'bg-violet-700'}`}>
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <ShieldAlert className="h-4 w-4" />} حفظ كلمة المرور الجديدة
            </button>
            <button type="button" onClick={onClose} className="rounded-2xl bg-slate-100 px-4 py-3 text-sm font-bold text-slate-700">إلغاء</button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ===== دليل التعليمات المخصص لكل دور =====

export default ResetUserPasswordModal;

/**
 * ==========================================
 *  TeacherPointsCapSection Component
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
import { canAccessPermission, clamp, cx, exportToExcel, formatDateTime, generateQrDataUrl, getAuthActionMeta, getRoleLabel, getSessionToken, getShortStudentName, getStudentCompanyName, getStudentGroupingLabel, getTodayIso, getUnifiedSchoolStudents, parseTimeToMinutes, pieColors, resultTone, roles, safeNumber, schoolHasStructureClassrooms, statusFromResult, toArabicDate, apiRequest} from '../utils/sharedFunctions.jsx';
import { Input } from './ui/FormElements';
import { SectionCard } from './ui/SectionCard';


function TeacherPointsCapSection({ selectedSchool, currentUser }) {
  const classrooms = Array.isArray(selectedSchool?.structure?.classrooms) ? selectedSchool.structure.classrooms : [];
  const initialCap = selectedSchool?.teacherPointsCap || { enabled: false, defaultCap: 150, classCaps: {} };
  const [cap, setCap] = React.useState(initialCap);
  const [saveStatus, setSaveStatus] = React.useState('idle');

  React.useEffect(() => {
    setCap(selectedSchool?.teacherPointsCap || { enabled: false, defaultCap: 150, classCaps: {} });
  }, [selectedSchool?.id, selectedSchool?.teacherPointsCap]);

  const canEdit = currentUser?.role === 'superadmin' || currentUser?.role === 'principal';

  const save = async () => {
    setSaveStatus('saving');
    try {
      await apiRequest(`/api/schools/${selectedSchool.id}/teacher-points-cap`, {
        method: 'PATCH',
        token: getSessionToken(),
        body: cap,
      });
      setSaveStatus('saved');
      setTimeout(() => setSaveStatus('idle'), 2500);
    } catch (e) {
      setSaveStatus('error');
      setTimeout(() => setSaveStatus('idle'), 2500);
    }
  };

  return (
    <SectionCard title="سقف نقاط المكافآت اليومي للمعلم" icon={Shield}
      action={
        canEdit ? (
          <button onClick={save} disabled={saveStatus === 'saving'}
            className={`inline-flex items-center gap-2 rounded-2xl px-5 py-3 font-bold text-white transition-all duration-300 shadow-md ${
              saveStatus === 'saved' ? 'bg-emerald-600 scale-105 shadow-emerald-300'
              : saveStatus === 'error' ? 'bg-rose-600'
              : saveStatus === 'saving' ? 'bg-sky-400 cursor-wait'
              : 'bg-sky-700 hover:bg-sky-800 hover:scale-105'
            }`}>
            {saveStatus === 'saving' ? <><RefreshCw className="h-4 w-4 animate-spin" /> جارٍ الحفظ...</>
            : saveStatus === 'saved' ? <><CheckCircle className="h-4 w-4" /> تم الحفظ ✓</>
            : saveStatus === 'error' ? 'خطأ في الحفظ'
            : <><Save className="h-4 w-4" /> حفظ الإعدادات</>}
          </button>
        ) : null
      }
    >
      {/* وصف الميزة */}
      <div className="mb-5 rounded-3xl bg-amber-50 p-5 ring-1 ring-amber-100">
        <div className="font-black text-amber-900">تحديد الحد الأقصى لنقاط المكافآت اليومية لكل معلم</div>
        <div className="mt-2 text-sm leading-7 text-amber-800">
          عند التفعيل، لا يستطيع المعلم منح نقاط مكافآت تتجاوز الحد المحدد لكل فصل يومياً.
          الخصم مفتوح دائماً بدون قيود.
        </div>
      </div>

      {/* تفعيل / تعطيل */}
      <div className="mb-6 flex items-center justify-between gap-4 rounded-3xl bg-white p-5 ring-1 ring-slate-200">
        <div>
          <div className="font-black text-slate-900">تفعيل نظام سقف النقاط اليومي</div>
          <div className="mt-1 text-sm text-slate-500">الافتراضي: معطّل (لا توجد قيود على المعلم)</div>
        </div>
        <button
          onClick={() => canEdit && setCap({ ...cap, enabled: !cap.enabled })}
          disabled={!canEdit}
          className={`flex-shrink-0 rounded-2xl px-6 py-3 font-black transition-colors ${
            cap.enabled ? 'bg-emerald-600 text-white' : 'bg-slate-200 text-slate-600'
          } ${!canEdit ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          {cap.enabled ? '✓ مفعّل' : 'معطّل'}
        </button>
      </div>

      {cap.enabled && (
        <div className="space-y-5">
          {/* السقف الافتراضي */}
          <div className="rounded-3xl bg-white p-5 ring-1 ring-slate-200">
            <div className="mb-4 font-black text-slate-900">السقف الافتراضي لجميع الفصول</div>
            <div className="flex items-center gap-4">
              <div className="flex-1">
                <Input
                  label="الحد الأقصى لنقاط المكافآت اليومي (150 نقطة افتراضي)"
                  type="number" min="1"
                  value={cap.defaultCap ?? 150}
                  onChange={(e) => canEdit && setCap({ ...cap, defaultCap: Number(e.target.value) || 150 })}
                  disabled={!canEdit}
                />
              </div>
              <div className="mt-5 text-sm text-slate-500">ينطبق على أي فصل لم يُخصص له سقف مختلف</div>
            </div>
          </div>

          {/* سقف مخصص لكل فصل */}
          {classrooms.length > 0 && (
            <div className="rounded-3xl bg-white p-5 ring-1 ring-slate-200">
              <div className="mb-4 font-black text-slate-900">سقف مخصص لكل فصل (اختياري)</div>
              <div className="mb-3 text-sm text-slate-500">اترك الحقل فارغاً لاستخدام السقف الافتراضي لهذا الفصل</div>
              <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
                {classrooms.map((cls) => (
                  <div key={cls.id} className="flex items-center gap-3 rounded-2xl bg-slate-50 p-4 ring-1 ring-slate-200">
                    <div className="min-w-0 flex-1">
                      <div className="truncate text-sm font-bold text-slate-700">{cls.name}</div>
                      <div className="text-xs text-slate-400">{cls.students?.length || 0} طالب</div>
                    </div>
                    <input
                      type="number" min="1" placeholder={String(cap.defaultCap ?? 150)}
                      value={cap.classCaps?.[String(cls.id)] ?? ''}
                      onChange={(e) => {
                        if (!canEdit) return;
                        const val = e.target.value;
                        setCap({
                          ...cap,
                          classCaps: {
                            ...(cap.classCaps || {}),
                            [String(cls.id)]: val === '' ? '' : Number(val) || 150,
                          },
                        });
                      }}
                      disabled={!canEdit}
                      className="w-24 rounded-xl border border-slate-300 bg-white px-3 py-2 text-center text-sm font-bold text-slate-800 focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-200 disabled:opacity-50"
                    />
                    <span className="text-xs text-slate-400">نقطة</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {classrooms.length === 0 && (
            <div className="rounded-3xl bg-slate-50 p-5 text-center text-sm text-slate-500 ring-1 ring-slate-200">
              لا توجد فصول مضافة لهذه المدرسة. أضف فصولاً من صفحة الهيكل أولاً.
            </div>
          )}
        </div>
      )}
    </SectionCard>
  );
}
// =====================================================

export default TeacherPointsCapSection;

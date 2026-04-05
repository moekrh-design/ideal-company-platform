/**
 * ==========================================
 *  SchoolDeviceLinksPanel Component
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
import { buildPublicLink, canAccessPermission, clamp, cx, exportToExcel, formatDateTime, generateQrDataUrl, getAuthActionMeta, getRoleLabel, getScreenTemplateLabel, getShortStudentName, getStudentCompanyName, getStudentGroupingLabel, getTodayIso, getTransitionLabel, getUnifiedSchoolStudents, parseTimeToMinutes, pieColors, resultTone, roles, safeNumber, schoolHasStructureClassrooms, statusFromResult, toArabicDate } from '../utils/sharedFunctions.jsx';
import { Input, Select } from './ui/FormElements';
import { SectionCard } from './ui/SectionCard';


import { ScreenSettingsEditor } from './ui/ScreenSettingsEditor';
import { LinkQrPreview } from './ui/LinkQrPreview';
import { Badge } from './ui/FormElements';
function SchoolDeviceLinksPanel({ selectedSchool, currentUser, onCreateGateLink, onDeleteGateLink, onUpdateGateLink, onCreateScreenLink, onDeleteScreenLink, onUpdateScreenLink }) {
  const [activeTab, setActiveTab] = useState("screens");
  const [gateName, setGateName] = useState("");
  const [gateMode, setGateMode] = useState("mixed");
  const [gateSearch, setGateSearch] = useState("");
  const [screenSearch, setScreenSearch] = useState("");
  const [screenForm, setScreenForm] = useState({
    name: "",
    title: "لوحة المدرسة",
    widgets: { metrics: true, topStudents: true, topCompanies: true, attendanceChart: true, recentActivity: true, parentPortalSummary: true, lessonAttendanceSummary: false, rewardStoreSummary: false, actionStats: false, teacherActivity: false, rewardCategoryBreakdown: false, topTeachers: false, nafisQuiz: false, nafisLeaderboard: false },
    rewardStoreSettings: { mode: 'all', sourceFilter: 'all', maxItems: 8 },
    transition: "fade",
    rotateSeconds: "8",
    theme: "emerald-night",
    template: "executive",
    tickerEnabled: false,
    tickerText: "",
    tickerDir: "ltr",
    tickerBg: "amber",
    tickerSeparator: " ✦ ",
    tickerFontSize: "28",
    tickerShowLogo: true,
    tickerLayout: "marquee",
  });
  const [editingScreenId, setEditingScreenId] = useState(null);
  const [editingScreenForm, setEditingScreenForm] = useState(null);
  const [savingScreenId, setSavingScreenId] = useState(null);
  const [editingGateModeId, setEditingGateModeId] = useState(null);
  const [editingGateModeValue, setEditingGateModeValue] = useState('mixed');
  const canManage = Boolean(currentUser && (currentUser.role === "superadmin" || canAccessPermission(currentUser, "deviceDisplays")));
  const gates = Array.isArray(selectedSchool?.smartLinks?.gates) ? selectedSchool.smartLinks.gates : [];
  const screens = Array.isArray(selectedSchool?.smartLinks?.screens) ? selectedSchool.smartLinks.screens : [];
  const classrooms = selectedSchool?.structure?.classrooms || [];
  const linkedClassroomScreensCount = screens.filter((screen) => screen.sourceMode === "classroom" && String(screen.linkedClassroomId || "")).length;
  const filteredGates = gates.filter((gate) => `${gate.name || ""} ${gate.mode || ""}`.toLowerCase().includes(gateSearch.trim().toLowerCase()));
  const filteredScreens = screens.filter((screen) => `${screen.name || ""} ${screen.title || ""} ${screen.template || ""}`.toLowerCase().includes(screenSearch.trim().toLowerCase()));

  const copyLink = async (url) => {
    try {
      if (navigator?.clipboard?.writeText) await navigator.clipboard.writeText(url);
      else window.prompt("انسخ الرابط التالي", url);
      window.alert("تم نسخ الرابط.");
    } catch {
      window.prompt("انسخ الرابط التالي", url);
    }
  };

  const startEditingScreen = (screen) => {
    setEditingScreenId(screen.id);
    setEditingScreenForm({
      name: screen.name || "",
      title: screen.title || "لوحة المدرسة",
      widgets: {
        metrics: screen.widgets?.metrics !== false,
        topStudents: screen.widgets?.topStudents !== false,
        topCompanies: screen.widgets?.topCompanies !== false,
        attendanceChart: screen.widgets?.attendanceChart !== false,
        recentActivity: screen.widgets?.recentActivity !== false,
        parentPortalSummary: screen.widgets?.parentPortalSummary !== false,
        lessonAttendanceSummary: screen.widgets?.lessonAttendanceSummary !== false,
        rewardStoreSummary: screen.widgets?.rewardStoreSummary !== false,
        actionStats: !!screen.widgets?.actionStats,
        teacherActivity: !!screen.widgets?.teacherActivity,
        rewardCategoryBreakdown: !!screen.widgets?.rewardCategoryBreakdown,
        topTeachers: !!screen.widgets?.topTeachers,
        nafisQuiz: !!screen.widgets?.nafisQuiz,
        nafisLeaderboard: !!screen.widgets?.nafisLeaderboard,
      },
      topCompaniesMax: Math.max(1, Math.min(10, Number(screen?.topCompaniesMax || 3))),
      topCompaniesLayout: ['auto','grid','list'].includes(String(screen?.topCompaniesLayout || '')) ? screen.topCompaniesLayout : 'auto',
      rewardStoreSettings: {
        mode: ['all','featured','marked'].includes(String(screen.rewardStoreSettings?.mode || '')) ? screen.rewardStoreSettings.mode : 'all',
        sourceFilter: ['all','school','parent','external'].includes(String(screen.rewardStoreSettings?.sourceFilter || '')) ? screen.rewardStoreSettings.sourceFilter : 'all',
        maxItems: Math.max(1, Math.min(24, Number(screen.rewardStoreSettings?.maxItems || 8))),
      },
      transition: screen.transition || "fade",
      rotateSeconds: String(screen.rotateSeconds || 8),
      theme: screen.theme || "emerald-night",
      template: screen.template || "executive",
      tickerEnabled: Boolean(screen.tickerEnabled),
      tickerText: screen.tickerText || "",
      tickerDir: screen.tickerDir || "ltr",
      tickerBg: screen.tickerBg || "amber",
      tickerSeparator: screen.tickerSeparator || " ✦ ",
      tickerFontSize: String(screen.tickerFontSize || 28),
      tickerShowLogo: screen.tickerShowLogo !== false,
      tickerLayout: screen.tickerLayout || "marquee",
      sourceMode: screen.sourceMode || "school",
      linkedClassroomId: screen.linkedClassroomId ? String(screen.linkedClassroomId) : "",
    });
  };

  const resetCreateForm = () => setScreenForm({
    name: "",
    title: "لوحة المدرسة",
    widgets: { metrics: true, topStudents: true, topCompanies: true, attendanceChart: true, recentActivity: true, parentPortalSummary: true, lessonAttendanceSummary: false, rewardStoreSummary: false, actionStats: false, teacherActivity: false, rewardCategoryBreakdown: false, topTeachers: false, nafisQuiz: false, nafisLeaderboard: false },
    rewardStoreSettings: { mode: 'all', sourceFilter: 'all', maxItems: 8 },
    transition: "fade",
    rotateSeconds: "8",
    theme: "emerald-night",
    template: "executive",
    tickerEnabled: false,
    tickerText: "",
    tickerDir: "ltr",
    tickerBg: "amber",
    tickerSeparator: " ✦ ",
    tickerFontSize: "28",
    tickerShowLogo: true,
    tickerLayout: "marquee",
  });

  if (!canManage) return null;

  return (
    <SectionCard title="إدارة روابط البوابة والشاشات" icon={ExternalLink} className="overflow-visible" action={<Badge tone="blue">واجهة مستقلة أوضح للشاشات والبوابات</Badge>}>
      <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-4">
          <div className="rounded-3xl bg-gradient-to-l from-sky-700 to-cyan-600 p-5 text-white shadow-sm">
            <div className="text-sm text-white/80">إجمالي الشاشات</div>
            <div className="mt-2 text-3xl font-black">{screens.length}</div>
            <div className="mt-2 text-xs text-white/80">روابط العرض المباشر الجاهزة للتشغيل.</div>
          </div>
          <div className="rounded-3xl bg-gradient-to-l from-emerald-700 to-teal-600 p-5 text-white shadow-sm">
            <div className="text-sm text-white/80">إجمالي البوابات</div>
            <div className="mt-2 text-3xl font-black">{gates.length}</div>
            <div className="mt-2 text-xs text-white/80">أجهزة التحضير المباشر عند المداخل.</div>
          </div>
          <div className="rounded-3xl bg-white p-5 ring-1 ring-slate-200 shadow-sm">
            <div className="text-sm text-slate-500">شاشات مرتبطة بفصول</div>
            <div className="mt-2 text-3xl font-black text-slate-900">{linkedClassroomScreensCount}</div>
            <div className="mt-2 text-xs text-slate-500">للعرض المرتبط بصف أو فصل محدد.</div>
          </div>
          <div className="rounded-3xl bg-white p-5 ring-1 ring-slate-200 shadow-sm">
            <div className="text-sm text-slate-500">فصول متاحة للربط</div>
            <div className="mt-2 text-3xl font-black text-slate-900">{classrooms.length}</div>
            <div className="mt-2 text-xs text-slate-500">يمكن ربط الشاشة مباشرة بأحد الفصول.</div>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-3 rounded-3xl bg-slate-100 p-2 ring-1 ring-slate-200">
          <button onClick={() => setActiveTab('screens')} className={cx('rounded-2xl px-5 py-3 text-sm font-black transition', activeTab === 'screens' ? 'bg-sky-700 text-white shadow-sm' : 'text-slate-700 hover:bg-white')}>الشاشات</button>
          <button onClick={() => setActiveTab('gates')} className={cx('rounded-2xl px-5 py-3 text-sm font-black transition', activeTab === 'gates' ? 'bg-emerald-700 text-white shadow-sm' : 'text-slate-700 hover:bg-white')}>البوابات</button>
        </div>

        {activeTab === 'gates' ? (
          <div className="space-y-6 rounded-3xl bg-slate-50 p-6 ring-1 ring-slate-200 shadow-sm">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <div className="font-black text-slate-800">إدارة روابط البوابات</div>
                <div className="mt-2 text-sm leading-7 text-slate-600">أنشئ روابط مستقلة لأجهزة الآيباد والجوال عند بوابات المدرسة، مع دعم QR أو بصمة الوجه أو الوضع المزدوج.</div>
              </div>
              <Badge tone="emerald">{gates.length} بوابة</Badge>
            </div>
            <div className="grid grid-cols-1 gap-5 xl:grid-cols-[1fr_auto_auto_auto] xl:items-end">
              <Input label="بحث في البوابات" value={gateSearch} onChange={(e) => setGateSearch(e.target.value)} placeholder="ابحث باسم البوابة أو وضعها" />
              <Input label="اسم البوابة" value={gateName} onChange={(e) => setGateName(e.target.value)} placeholder="مثال: بوابة الطلاب الرئيسية" />
              <Select label="وضع البوابة" value={gateMode} onChange={(e) => setGateMode(e.target.value)}>
                <option value="mixed">QR + بصمة وجه</option>
                <option value="qr">QR فقط</option>
                <option value="face">بصمة وجه فقط</option>
              </Select>
              <button onClick={async () => { const result = await onCreateGateLink?.({ name: gateName, mode: gateMode }); if (result?.ok) setGateName(''); }} className="rounded-2xl bg-emerald-700 px-6 py-3 text-sm font-bold text-white">توليد رابط بوابة</button>
            </div>
            <div className="grid grid-cols-1 gap-4 2xl:grid-cols-2">
              {filteredGates.map((gate) => {
                const url = buildPublicLink('gate', gate.token);
                return (
                  <div key={gate.id} className="rounded-3xl bg-white p-5 ring-1 ring-slate-200">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <div className="font-bold text-slate-800">{gate.name}</div>
                        <div className="mt-1 flex items-center gap-2">
                          <span className={`rounded-xl px-2 py-1 text-xs font-bold ${
                            gate.mode === 'qr' ? 'bg-sky-100 text-sky-700' :
                            gate.mode === 'face' ? 'bg-violet-100 text-violet-700' :
                            'bg-emerald-100 text-emerald-700'
                          }`}>
                            {gate.mode === 'mixed' ? 'QR + بصمة وجه' : gate.mode === 'qr' ? 'QR فقط' : 'بصمة وجه فقط'}
                          </span>
                          {canManage && (
                            <button
                              onClick={() => { setEditingGateModeId(gate.id); setEditingGateModeValue(gate.mode || 'mixed'); }}
                              className="rounded-xl bg-slate-100 px-2 py-1 text-xs font-bold text-slate-600 hover:bg-slate-200"
                            >
                              تغيير الوضع
                            </button>
                          )}
                        </div>
                        {editingGateModeId === gate.id && (
                          <div className="mt-3 flex flex-wrap items-center gap-2">
                            {[['mixed', 'QR + بصمة وجه', 'bg-emerald-600'], ['qr', 'QR فقط', 'bg-sky-600'], ['face', 'بصمة وجه فقط', 'bg-violet-600']].map(([val, label, color]) => (
                              <button
                                key={val}
                                onClick={() => setEditingGateModeValue(val)}
                                className={`rounded-xl px-3 py-2 text-xs font-bold text-white transition ${editingGateModeValue === val ? color : 'bg-slate-300 text-slate-700'}`}
                              >
                                {label}
                              </button>
                            ))}
                            <button
                              onClick={async () => {
                                await onUpdateGateLink?.(gate.id, { mode: editingGateModeValue });
                                setEditingGateModeId(null);
                              }}
                              className="rounded-xl bg-slate-900 px-3 py-2 text-xs font-bold text-white"
                            >
                              حفظ
                            </button>
                            <button onClick={() => setEditingGateModeId(null)} className="rounded-xl bg-slate-100 px-3 py-2 text-xs font-bold text-slate-600">إلغاء</button>
                          </div>
                        )}
                      </div>
                      <button onClick={() => onDeleteGateLink?.(gate.id)} className="rounded-xl bg-rose-50 px-3 py-2 text-xs font-bold text-rose-700">حذف</button>
                    </div>
                    <input readOnly value={url} className="mt-4 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-xs outline-none" />
                    <div className="mt-4 grid grid-cols-1 gap-4 xl:grid-cols-[1fr_240px] xl:items-start">
                      <div className="flex flex-wrap gap-2">
                      <button onClick={() => copyLink(url)} className="inline-flex items-center gap-2 rounded-2xl bg-slate-100 px-3 py-2 text-sm font-bold text-slate-700"><Copy className="h-4 w-4" /> نسخ</button>
                      <a href={url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 rounded-2xl bg-emerald-600 px-3 py-2 text-sm font-bold text-white"><ExternalLink className="h-4 w-4" /> فتح</a>
                    </div>
                    <LinkQrPreview url={url} label={`QR ${gate.name}`} />
                    </div>
                  </div>
                );
              })}
              {!gates.length ? <div className="rounded-3xl border border-dashed border-slate-300 bg-white px-6 py-10 text-center text-sm font-bold text-slate-500">لا توجد بوابات منشأة بعد.</div> : null}
              {gates.length > 0 && !filteredGates.length ? <div className="rounded-3xl border border-dashed border-amber-300 bg-amber-50 px-6 py-10 text-center text-sm font-bold text-amber-700">لا توجد بوابات مطابقة لعبارة البحث الحالية.</div> : null}
            </div>
          </div>
        ) : (
          <div className="space-y-6 rounded-3xl bg-slate-50 p-6 ring-1 ring-slate-200 shadow-sm">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <div className="font-black text-slate-800">إدارة شاشات العرض</div>
                <div className="mt-2 text-sm leading-7 text-slate-600">أنشئ شاشات العرض بحجم كامل داخل الصفحة، وعدّل الثيم والانتقالات ومصدر البيانات وشريط الأخبار بدون الواجهة الضيقة السابقة.</div>
              </div>
              <Badge tone="sky">{screens.length} شاشة</Badge>
            </div>
            <div className="grid grid-cols-1 gap-4 xl:grid-cols-[1fr_auto] xl:items-end">
              <Input label="بحث في الشاشات" value={screenSearch} onChange={(e) => setScreenSearch(e.target.value)} placeholder="ابحث باسم الشاشة أو عنوانها أو القالب" />
              <div className="rounded-2xl bg-white px-4 py-3 text-sm font-bold text-slate-600 ring-1 ring-slate-200">النتائج الحالية: {filteredScreens.length}</div>
            </div>
            <div className="rounded-3xl bg-white p-6 ring-1 ring-slate-200">
              <div className="mb-4 font-black text-slate-800">إنشاء شاشة جديدة</div>
              <div className="mb-4 grid grid-cols-1 gap-3 md:grid-cols-3">
                <div className="rounded-2xl bg-slate-50 px-4 py-3 text-sm font-bold text-slate-700 ring-1 ring-slate-200">القالب الحالي: {getScreenTemplateLabel(screenForm.template)}</div>
                <div className="rounded-2xl bg-slate-50 px-4 py-3 text-sm font-bold text-slate-700 ring-1 ring-slate-200">الانتقال: {getTransitionLabel(screenForm.transition)}</div>
                <div className="rounded-2xl bg-slate-50 px-4 py-3 text-sm font-bold text-slate-700 ring-1 ring-slate-200">المصدر: {screenForm.sourceMode === 'classroom' ? 'فصل محدد' : 'المدرسة كاملة'}</div>
              </div>
              <ScreenSettingsEditor value={screenForm} onChange={setScreenForm} classrooms={classrooms} />
              <button
                onClick={async () => {
                  const result = await onCreateScreenLink?.({ ...screenForm, rotateSeconds: Number(screenForm.rotateSeconds) || 8 });
                  if (result?.ok) resetCreateForm();
                }}
                className="mt-5 rounded-2xl bg-sky-700 px-5 py-3 text-sm font-bold text-white"
              >
                توليد رابط شاشة
              </button>
            </div>
            <div className="grid grid-cols-1 gap-5">
              {filteredScreens.map((screen) => {
                const url = buildPublicLink('screen', screen.token);
                const isEditing = editingScreenId === screen.id && editingScreenForm;
                return (
                  <div key={screen.id} className="rounded-3xl bg-white p-5 ring-1 ring-slate-200">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div>
                        <div className="font-bold text-slate-800">{screen.name}</div>
                        <div className="text-sm text-slate-500">{screen.title}</div>
                        <div className="mt-1 text-xs text-slate-400">القالب: {getScreenTemplateLabel(screen.template)} • انتقال: {getTransitionLabel(screen.transition)} • كل {screen.rotateSeconds || 8} ث</div>
                        <div className="mt-2 flex flex-wrap gap-2 text-[11px] font-bold text-slate-500">
                          <span className="rounded-full bg-slate-100 px-3 py-1">المصدر: {screen.sourceMode === 'classroom' ? 'فصل' : 'المدرسة'}</span>
                          {screen.linkedClassroomId ? <span className="rounded-full bg-cyan-50 px-3 py-1 text-cyan-700">مرتبط بفصل</span> : null}
                          {screen.tickerEnabled ? <span className="rounded-full bg-amber-50 px-3 py-1 text-amber-700">شريط الأخبار مفعل</span> : null}
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        <button onClick={() => isEditing ? (setEditingScreenId(null), setEditingScreenForm(null)) : startEditingScreen(screen)} className="rounded-xl bg-amber-50 px-3 py-2 text-xs font-bold text-amber-700">{isEditing ? 'إلغاء التعديل' : 'تعديل'}</button>
                        <button onClick={() => onDeleteScreenLink?.(screen.id)} className="rounded-xl bg-rose-50 px-3 py-2 text-xs font-bold text-rose-700">حذف</button>
                      </div>
                    </div>
                    <input readOnly value={url} className="mt-4 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-xs outline-none" />
                    <div className="mt-4 grid grid-cols-1 gap-4 xl:grid-cols-[1fr_240px] xl:items-start">
                      <div className="flex flex-wrap gap-2">
                      <button onClick={() => copyLink(url)} className="inline-flex items-center gap-2 rounded-2xl bg-slate-100 px-3 py-2 text-sm font-bold text-slate-700"><Copy className="h-4 w-4" /> نسخ</button>
                      <a href={url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 rounded-2xl bg-emerald-600 px-3 py-2 text-sm font-bold text-white"><ExternalLink className="h-4 w-4" /> فتح</a>
                    </div>
                    <LinkQrPreview url={url} label={`QR ${screen.name}`} />
                    </div>
                    {isEditing ? (
                      <div className="mt-5 rounded-3xl bg-slate-50 p-5 ring-1 ring-slate-200">
                        <div className="mb-4 font-black text-slate-800">تحرير إعدادات الشاشة</div>
                        <ScreenSettingsEditor value={editingScreenForm} onChange={setEditingScreenForm} classrooms={selectedSchool?.structure?.classrooms || []} />
                        <div className="mt-5 flex flex-wrap gap-3">
                          <button
                            onClick={async () => {
                              setSavingScreenId(screen.id);
                              try {
                                const result = await onUpdateScreenLink?.(screen.id, { ...editingScreenForm, rotateSeconds: Number(editingScreenForm.rotateSeconds) || 8 });
                                if (result?.ok) {
                                  setEditingScreenId(null);
                                  setEditingScreenForm(null);
                                }
                              } finally {
                                setSavingScreenId(null);
                              }
                            }}
                            className="rounded-2xl bg-sky-700 px-4 py-3 text-sm font-bold text-white"
                          >
                            {savingScreenId === screen.id ? 'جارٍ الحفظ...' : 'حفظ التعديلات'}
                          </button>
                          <button onClick={() => { setEditingScreenId(null); setEditingScreenForm(null); }} className="rounded-2xl bg-slate-200 px-4 py-3 text-sm font-bold text-slate-700">إلغاء</button>
                        </div>
                      </div>
                    ) : null}
                  </div>
                );
              })}
              {!screens.length ? <div className="rounded-3xl border border-dashed border-slate-300 bg-white px-6 py-10 text-center text-sm font-bold text-slate-500">لا توجد شاشات منشأة بعد.</div> : null}
              {screens.length > 0 && !filteredScreens.length ? <div className="rounded-3xl border border-dashed border-amber-300 bg-amber-50 px-6 py-10 text-center text-sm font-bold text-amber-700">لا توجد شاشات مطابقة لعبارة البحث الحالية.</div> : null}
            </div>
          </div>
        )}
      </div>
    </SectionCard>
  );
}

export default SchoolDeviceLinksPanel;

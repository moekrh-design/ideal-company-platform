/**
 * ==========================================
 *  SecurityDeskPage Component
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
import { SPECIAL_ITEM_TEMPLATES, appendGateSyncLog, applyMessageVariables, applyPointsToUnifiedStudent, applySchoolAccessToUser, buildCsv, buildHydratedClientState, buildLeavePassLink, buildLessonAttendanceSessionLabel, buildLessonSessionLink, buildPrintSummaryStats, buildPublicLink, buildRewardStoreScreenSummary, buildRewardStoreSummary, buildRolePermissions, buildStructureAttendanceBarcode, buildStudentNumberFromImport, buildTemplateStudentsCsv, buildWsUrl, canAccessPermission, canPrincipalManageUser, captureDataUrlFromVideo, clamp, clampDelegatedPermissions, clampScreenLabel, clearGateSyncLog, clearLeavePassParam, clearLessonSessionParam, clearSchoolStructureViewState, compareFaceSignatures, computeLessonAttendanceSessionSummary, computeTeacherSpecialScore, computeTeacherSpecialStats, createBarcode, createDefaultMessagingCenter, createDefaultSchoolAccess, createDefaultSmartLinks, createDefaultState, createDefaultUsers, createLeavePassEvent, createRewardStoreNotification, createSeedUsersForSchool, cx, defaultActionCatalog, defaultPermissionsByRole, defaultSettings, detectNoorOriginalRows, downloadFile, drawVisualSourceToCanvas, enhanceContrastForBarcode, enqueueGateOfflineScan, escapePrintHtml, exportRowsToWorkbook, exportToExcel, fileToDataUrl, findBestFaceMatch, findLabeledValueFromGrid, findStudentByKeyword, formatDateTime, formatEnglishDigits, formatLocalGateTimestamp, generateQrDataUrl, generateSchoolStructureClassrooms, getApprovedRewardStoreItems, getArabicDayKey, getAttendanceStudentsSource, getAuthActionMeta, getClassroomKeyFromCompanyRow, getCurrentAcademicTermId, getCurrentSlotFromTimetable, getDefaultLandingPage, getDefaultTemplateForEvent, getDisplayMotionVariant, getFaceProfileLabel, getFaceProfileState, getFaceProfileTone, getGateOfflineQueueKey, getGateOfflineQueueSummary, getGateSyncLogKey, getGateSyncLogSummary, getGateSyncStatusMeta, getLeavePassAgeMinutes, getLeavePassDestinationLabel, getLeavePassElapsedLabel, getLeavePassEventLabel, getLeavePassIdFromLocation, getLeavePassQueueMeta, getLeavePassStatusLabel, getLeavePassStatusTone, getLeavePassTimeline, getLeavePasses, getLessonAttendanceSessionStatusLabel, getLessonAttendanceSessionStatusTone, getLessonAttendanceSessions, getLessonSessionIdFromLocation, getLessonSessionTeacherTargets, getPublicModeFromLocation, getRewardStore, getRewardStoreDisplayItems, getRewardStoreDonorLabel, getRewardStoreStatusLabel, getRoleLabel, getSchoolAccess, getSchoolAttendanceBinding, getScreenTemplateLabel, getScreenTheme, getSessionToken, getShortStudentName, getStudentCompanyName, getStudentGroupingLabel, getStudentsForLessonClassroom, getTeacherSpecialItems, getTeacherSubjects, getTemplateCategoriesForEvent, getTickerTheme, getTodayIso, getTransitionLabel, getUnifiedCompanyRows, getUnifiedSchoolStudents, getVisualSourceSize, hydrateActionCatalog, hydrateActionLog, hydrateGateSyncCenterEvents, hydrateMessagingCenter, hydrateScanLog, hydrateSchools, hydrateTeacherSpecialItems, hydrateUsers, initialScanLog, initialSchools, isRoleEnabledForSchool, loadImageSource, loadPersistedState, loadServerCache, loadUiState, navItems, normalizeArabicHeader, normalizeImportRow, normalizePhoneNumber, normalizeRewardStoreItem, normalizeSearchDigits, normalizeSearchToken, normalizeSmartLinks, parseTeacherSubjects, parseTimeToMinutes, pickImportValue, pieColors, prependRewardStoreNotification, principalDelegableRoles, principalManageablePermissionKeys, printHtmlContent, readGateOfflineQueue, readGateSyncLog, readSchoolStructureViewState, removeGateOfflineQueueItem, removeGateSyncLogItem, resultTone, roles, safeLocalStorageGetItem, safeLocalStorageSetItem, safeNumber, sanitizeBarcodeValue, saveSchoolStructureViewState, saveServerCache, saveUiState, schoolCodeSlug, schoolHasStructureClassrooms, setSessionToken, sortUnifiedCompanyRows, splitTickerItems, statusFromResult, summarizeSchoolLiveState, toArabicDate, writeGateOfflineQueue, writeGateSyncLog } from '../utils/sharedFunctions.jsx';


function SecurityDeskPage({ selectedSchool, currentUser, onUpdateLeavePassStatus }) {
  const today = getTodayIso();
  const [tab, setTab] = useState('live'); // 'live' | 'report'
  const [reportRange, setReportRange] = useState('day'); // 'day' | 'week' | 'month' | 'year' | 'custom'
  const [fromDate, setFromDate] = useState(today);
  const [toDate, setToDate] = useState(today);
  const [confirmExit, setConfirmExit] = useState(null); // { pass }
  const [actionMsg, setActionMsg] = useState({ tone: '', text: '' });
  const [now, setNow] = useState(new Date());

  // تحديث الوقت كل دقيقة
  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  const allPasses = useMemo(() => getLeavePasses(selectedSchool), [selectedSchool]);

  // الاستئذانات النشطة (غير مغلقة)
  const activePasses = useMemo(() => {
    return [...allPasses]
      .filter((p) => !['completed', 'cancelled'].includes(String(p.status || '')))
      .sort((a, b) => String(b.createdAt || '').localeCompare(String(a.createdAt || '')));
  }, [allPasses]);

  // حساب نطاق التقرير
  const reportDateRange = useMemo(() => {
    const todayDate = new Date(today);
    if (reportRange === 'day') return { from: today, to: today };
    if (reportRange === 'week') {
      const d = new Date(todayDate);
      d.setDate(d.getDate() - 6);
      return { from: d.toISOString().slice(0, 10), to: today };
    }
    if (reportRange === 'month') {
      const d = new Date(todayDate);
      d.setDate(1);
      return { from: d.toISOString().slice(0, 10), to: today };
    }
    if (reportRange === 'year') {
      const d = new Date(todayDate);
      d.setMonth(0, 1);
      return { from: d.toISOString().slice(0, 10), to: today };
    }
    return { from: fromDate, to: toDate };
  }, [reportRange, fromDate, toDate, today]);

  // بيانات التقرير
  const reportPasses = useMemo(() => {
    const { from, to } = reportDateRange;
    return [...allPasses]
      .filter((p) => {
        const d = String(p.createdAt || '').slice(0, 10);
        return d >= from && d <= to;
      })
      .sort((a, b) => String(b.createdAt || '').localeCompare(String(a.createdAt || '')));
  }, [allPasses, reportDateRange]);

  // إحصائيات اليوم
  const todayStats = useMemo(() => {
    const todayPasses = allPasses.filter((p) => String(p.createdAt || '').slice(0, 10) === today);
    return {
      total: todayPasses.length,
      completed: todayPasses.filter((p) => p.status === 'completed').length,
      guardian: todayPasses.filter((p) => p.destination === 'guardian').length,
      active: todayPasses.filter((p) => !['completed', 'cancelled'].includes(String(p.status || ''))).length,
    };
  }, [allPasses, today]);

  const handleConfirmExit = () => {
    if (!confirmExit) return;
    onUpdateLeavePassStatus?.(confirmExit.pass.id, 'completed');
    setActionMsg({ tone: 'green', text: `✓ تم تأكيد خروج ${confirmExit.pass.studentName}` });
    setConfirmExit(null);
    setTimeout(() => setActionMsg({ tone: '', text: '' }), 3000);
  };

  const getStatusBadge = (status) => {
    const map = {
      created: { label: 'جديد', cls: 'bg-blue-100 text-blue-800' },
      'sent-system': { label: 'أُرسل', cls: 'bg-amber-100 text-amber-800' },
      'sent-manual': { label: 'أُرسل يدوياً', cls: 'bg-amber-100 text-amber-800' },
      viewed: { label: 'اطلع المعلم', cls: 'bg-sky-100 text-sky-800' },
      'approved-agent': { label: 'اعتمد الوكيل', cls: 'bg-indigo-100 text-indigo-800' },
      'approved-counselor': { label: 'اعتمد المرشد', cls: 'bg-violet-100 text-violet-800' },
      'released-guardian': { label: 'مع ولي الأمر', cls: 'bg-teal-100 text-teal-800' },
      completed: { label: 'خرج ✓', cls: 'bg-emerald-100 text-emerald-800' },
      cancelled: { label: 'ملغي', cls: 'bg-rose-100 text-rose-800' },
    };
    const s = map[String(status || '')] || { label: status || '—', cls: 'bg-slate-100 text-slate-700' };
    return <span className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-bold ${s.cls}`}>{s.label}</span>;
  };

  const getDestIcon = (dest) => {
    if (dest === 'guardian') return '👨‍👦';
    if (dest === 'agent') return '🏫';
    if (dest === 'counselor') return '🧑‍💼';
    return '📋';
  };

  const getElapsed = (createdAt) => {
    const ms = now - new Date(createdAt || '');
    if (!ms || ms < 0) return '';
    const mins = Math.floor(ms / 60000);
    if (mins < 1) return 'الآن';
    if (mins < 60) return `${mins} د`;
    const h = Math.floor(mins / 60);
    const m = mins % 60;
    return m ? `${h}س ${m}د` : `${h}س`;
  };

  const formatDateShort = (iso) => {
    if (!iso) return '—';
    try {
      return new Date(iso).toLocaleString('ar-SA', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
    } catch { return iso.slice(0, 16).replace('T', ' '); }
  };

  const schoolName = selectedSchool?.name || 'المدرسة';
  const nowLabel = now.toLocaleString('ar-SA', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' });

  return (
    <div dir="rtl" className="min-h-screen bg-slate-900 text-white">
      {/* رأس الصفحة */}
      <div className="bg-gradient-to-l from-slate-900 via-slate-800 to-slate-900 border-b border-slate-700 px-4 py-4">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-amber-500/20 ring-1 ring-amber-500/40">
              <Shield className="h-6 w-6 text-amber-400" />
            </div>
            <div>
              <div className="text-base font-black text-white leading-tight">مسؤول الأمن</div>
              <div className="text-xs text-slate-400 leading-tight">{schoolName}</div>
            </div>
          </div>
          <div className="text-left text-xs text-slate-400 leading-5">
            <div className="font-bold text-slate-300">{nowLabel}</div>
          </div>
        </div>

        {/* إحصائيات اليوم */}
        <div className="mt-4 grid grid-cols-4 gap-2">
          {[
            { label: 'طلبات اليوم', value: todayStats.total, color: 'text-sky-400' },
            { label: 'نشط الآن', value: todayStats.active, color: 'text-amber-400' },
            { label: 'مع ولي الأمر', value: todayStats.guardian, color: 'text-violet-400' },
            { label: 'تم التنفيذ', value: todayStats.completed, color: 'text-emerald-400' },
          ].map((stat) => (
            <div key={stat.label} className="rounded-2xl bg-slate-800/80 ring-1 ring-slate-700 p-3 text-center">
              <div className={`text-2xl font-black ${stat.color}`}>{stat.value}</div>
              <div className="mt-0.5 text-[10px] text-slate-400 leading-tight">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* تبويبات */}
        <div className="mt-4 flex gap-2">
          <button
            onClick={() => setTab('live')}
            className={`flex-1 rounded-2xl py-2.5 text-sm font-bold transition-all ${
              tab === 'live'
                ? 'bg-amber-500 text-slate-900 shadow-lg shadow-amber-500/30'
                : 'bg-slate-800 text-slate-400 ring-1 ring-slate-700'
            }`}
          >
            🔴 تنبيهات فورية {activePasses.length > 0 ? `(${activePasses.length})` : ''}
          </button>
          <button
            onClick={() => setTab('report')}
            className={`flex-1 rounded-2xl py-2.5 text-sm font-bold transition-all ${
              tab === 'report'
                ? 'bg-sky-500 text-white shadow-lg shadow-sky-500/30'
                : 'bg-slate-800 text-slate-400 ring-1 ring-slate-700'
            }`}
          >
            📊 التقارير
          </button>
        </div>
      </div>

      {/* رسالة التأكيد */}
      {actionMsg.text && (
        <div className="mx-4 mt-3 rounded-2xl bg-emerald-500/20 ring-1 ring-emerald-500/40 px-4 py-3 text-sm font-bold text-emerald-300">
          {actionMsg.text}
        </div>
      )}

      {/* محتوى التبويب: تنبيهات فورية */}
      {tab === 'live' && (
        <div className="p-4 space-y-3">
          {activePasses.length === 0 ? (
            <div className="mt-8 text-center">
              <div className="text-5xl mb-3">✅</div>
              <div className="text-lg font-bold text-slate-300">لا توجد استئذانات نشطة</div>
              <div className="text-sm text-slate-500 mt-1">جميع الطلاب داخل المدرسة</div>
            </div>
          ) : activePasses.map((pass) => {
            const queueMeta = getLeavePassQueueMeta(pass);
            const isUrgent = queueMeta.key === 'overdue-teacher' || queueMeta.key === 'overdue-close';
            return (
              <div
                key={pass.id}
                className={`rounded-3xl p-4 ring-1 transition-all ${
                  isUrgent
                    ? 'bg-rose-950/60 ring-rose-500/50 shadow-lg shadow-rose-900/30'
                    : 'bg-slate-800 ring-slate-700'
                }`}
              >
                {/* رأس البطاقة */}
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2.5">
                    <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl text-xl ${
                      isUrgent ? 'bg-rose-500/20' : 'bg-slate-700'
                    }`}>
                      {getDestIcon(pass.destination)}
                    </div>
                    <div>
                      <div className="font-black text-white text-base leading-tight">{pass.studentName}</div>
                      <div className="text-xs text-slate-400 mt-0.5">{pass.className || pass.companyName || '—'}</div>
                    </div>
                  </div>
                  <div className="text-left shrink-0">
                    <div className={`text-xs font-bold ${isUrgent ? 'text-rose-400' : 'text-slate-400'}`}>
                      {getElapsed(pass.createdAt)}
                    </div>
                    {isUrgent && <div className="text-[10px] text-rose-400 mt-0.5">⚠ متأخر</div>}
                  </div>
                </div>

                {/* تفاصيل */}
                <div className="mt-3 grid grid-cols-2 gap-2">
                  <div className="rounded-xl bg-slate-700/50 px-3 py-2">
                    <div className="text-[10px] text-slate-500">الوجهة</div>
                    <div className="text-sm font-bold text-slate-200">{getLeavePassDestinationLabel(pass.destination)}</div>
                  </div>
                  <div className="rounded-xl bg-slate-700/50 px-3 py-2">
                    <div className="text-[10px] text-slate-500">الحالة</div>
                    <div className="mt-0.5">{getStatusBadge(pass.status)}</div>
                  </div>
                </div>

                {pass.reason && (
                  <div className="mt-2 rounded-xl bg-slate-700/30 px-3 py-2 text-xs text-slate-400">
                    <span className="font-bold text-slate-300">السبب: </span>{pass.reason}
                  </div>
                )}

                {/* زر تأكيد الخروج */}
                <button
                  onClick={() => setConfirmExit({ pass })}
                  className="mt-3 w-full rounded-2xl bg-emerald-500 py-3 text-sm font-black text-white shadow-lg shadow-emerald-500/30 active:scale-95 transition-transform"
                >
                  ✓ تأكيد الخروج
                </button>
              </div>
            );
          })}
        </div>
      )}

      {/* محتوى التبويب: التقارير */}
      {tab === 'report' && (
        <div className="p-4">
          {/* فلتر الفترة الزمنية */}
          <div className="rounded-3xl bg-slate-800 ring-1 ring-slate-700 p-4 mb-4">
            <div className="text-xs font-bold text-slate-400 mb-3">الفترة الزمنية</div>
            <div className="grid grid-cols-4 gap-2 mb-3">
              {[
                { key: 'day', label: 'اليوم' },
                { key: 'week', label: 'الأسبوع' },
                { key: 'month', label: 'الشهر' },
                { key: 'year', label: 'السنة' },
              ].map((r) => (
                <button
                  key={r.key}
                  onClick={() => setReportRange(r.key)}
                  className={`rounded-2xl py-2 text-xs font-bold transition-all ${
                    reportRange === r.key
                      ? 'bg-sky-500 text-white shadow-md shadow-sky-500/30'
                      : 'bg-slate-700 text-slate-400 ring-1 ring-slate-600'
                  }`}
                >
                  {r.label}
                </button>
              ))}
            </div>
            <button
              onClick={() => setReportRange('custom')}
              className={`w-full rounded-2xl py-2 text-xs font-bold transition-all mb-3 ${
                reportRange === 'custom'
                  ? 'bg-violet-500 text-white shadow-md shadow-violet-500/30'
                  : 'bg-slate-700 text-slate-400 ring-1 ring-slate-600'
              }`}
            >
              📅 نطاق مخصص
            </button>
            {reportRange === 'custom' && (
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] text-slate-400 mb-1">من تاريخ</label>
                  <input
                    type="date"
                    value={fromDate}
                    onChange={(e) => setFromDate(e.target.value)}
                    className="w-full rounded-xl bg-slate-700 ring-1 ring-slate-600 px-3 py-2 text-sm text-white"
                  />
                </div>
                <div>
                  <label className="block text-[10px] text-slate-400 mb-1">إلى تاريخ</label>
                  <input
                    type="date"
                    value={toDate}
                    onChange={(e) => setToDate(e.target.value)}
                    className="w-full rounded-xl bg-slate-700 ring-1 ring-slate-600 px-3 py-2 text-sm text-white"
                  />
                </div>
              </div>
            )}
            {/* ملخص الفترة */}
            <div className="mt-3 grid grid-cols-3 gap-2">
              {[
                { label: 'إجمالي الطلبات', value: reportPasses.length, color: 'text-sky-400' },
                { label: 'مع ولي الأمر', value: reportPasses.filter((p) => p.destination === 'guardian').length, color: 'text-violet-400' },
                { label: 'تم التنفيذ', value: reportPasses.filter((p) => p.status === 'completed').length, color: 'text-emerald-400' },
              ].map((s) => (
                <div key={s.label} className="rounded-2xl bg-slate-700/50 p-3 text-center">
                  <div className={`text-xl font-black ${s.color}`}>{s.value}</div>
                  <div className="text-[10px] text-slate-500 mt-0.5 leading-tight">{s.label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* قائمة التقرير */}
          {reportPasses.length === 0 ? (
            <div className="text-center py-8">
              <div className="text-4xl mb-2">📋</div>
              <div className="text-slate-400 text-sm">لا توجد بيانات في هذه الفترة</div>
            </div>
          ) : (
            <div className="space-y-2">
              {reportPasses.map((pass, idx) => (
                <div key={pass.id} className="rounded-2xl bg-slate-800 ring-1 ring-slate-700 px-4 py-3">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-slate-700 text-[10px] font-black text-slate-400">
                        {idx + 1}
                      </span>
                      <div>
                        <div className="font-bold text-white text-sm leading-tight">{pass.studentName}</div>
                        <div className="text-[11px] text-slate-500">{pass.className || pass.companyName || '—'}</div>
                      </div>
                    </div>
                    {getStatusBadge(pass.status)}
                  </div>
                  <div className="mt-2 flex flex-wrap items-center gap-2 text-[11px] text-slate-400">
                    <span>{getDestIcon(pass.destination)} {getLeavePassDestinationLabel(pass.destination)}</span>
                    <span className="text-slate-600">•</span>
                    <span>{formatDateShort(pass.createdAt)}</span>
                    {pass.reason && <>
                      <span className="text-slate-600">•</span>
                      <span className="text-slate-500">{pass.reason}</span>
                    </>}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* نافذة تأكيد الخروج */}
      {confirmExit && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="w-full max-w-sm rounded-3xl bg-slate-800 ring-1 ring-slate-600 p-6 shadow-2xl">
            <div className="text-center mb-5">
              <div className="text-5xl mb-3">🚪</div>
              <div className="text-lg font-black text-white">تأكيد خروج الطالب</div>
              <div className="mt-2 text-sm text-slate-300">
                <span className="font-bold text-white">{confirmExit.pass.studentName}</span>
              </div>
              <div className="mt-1 text-xs text-slate-400">
                {confirmExit.pass.className || confirmExit.pass.companyName || '—'} • {getLeavePassDestinationLabel(confirmExit.pass.destination)}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setConfirmExit(null)}
                className="rounded-2xl bg-slate-700 py-3 text-sm font-bold text-slate-300 ring-1 ring-slate-600 active:scale-95 transition-transform"
              >
                إلغاء
              </button>
              <button
                onClick={handleConfirmExit}
                className="rounded-2xl bg-emerald-500 py-3 text-sm font-black text-white shadow-lg shadow-emerald-500/30 active:scale-95 transition-transform"
              >
                ✓ تأكيد الخروج
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default SecurityDeskPage;

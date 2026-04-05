/**
 * ==========================================
 *  ParentAuditFeedPage Component
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
import { SPECIAL_ITEM_TEMPLATES, appendGateSyncLog, applyMessageVariables, applyPointsToUnifiedStudent, applySchoolAccessToUser, buildCsv, buildHydratedClientState, buildLeavePassLink, buildLessonAttendanceSessionLabel, buildLessonSessionLink, buildPrintSummaryStats, buildPublicLink, buildRewardStoreScreenSummary, buildRewardStoreSummary, buildRolePermissions, buildStructureAttendanceBarcode, buildStudentNumberFromImport, buildTemplateStudentsCsv, buildWsUrl, canAccessPermission, canPrincipalManageUser, captureDataUrlFromVideo, clamp, clampDelegatedPermissions, clampScreenLabel, clearGateSyncLog, clearLeavePassParam, clearLessonSessionParam, clearSchoolStructureViewState, compareFaceSignatures, computeLessonAttendanceSessionSummary, computeTeacherSpecialScore, computeTeacherSpecialStats, createBarcode, createDefaultMessagingCenter, createDefaultSchoolAccess, createDefaultSmartLinks, createDefaultState, createDefaultUsers, createLeavePassEvent, createRewardStoreNotification, createSeedUsersForSchool, cx, defaultActionCatalog, defaultPermissionsByRole, defaultSettings, detectNoorOriginalRows, downloadFile, drawVisualSourceToCanvas, enhanceContrastForBarcode, enqueueGateOfflineScan, escapePrintHtml, exportRowsToWorkbook, exportToExcel, fileToDataUrl, findBestFaceMatch, findLabeledValueFromGrid, findStudentByKeyword, formatDateTime, formatEnglishDigits, formatLocalGateTimestamp, generateQrDataUrl, generateSchoolStructureClassrooms, getApprovedRewardStoreItems, getArabicDayKey, getAttendanceStudentsSource, getAuthActionMeta, getClassroomKeyFromCompanyRow, getCurrentAcademicTermId, getCurrentSlotFromTimetable, getDefaultLandingPage, getDefaultTemplateForEvent, getDisplayMotionVariant, getFaceProfileLabel, getFaceProfileState, getFaceProfileTone, getGateOfflineQueueKey, getGateOfflineQueueSummary, getGateSyncLogKey, getGateSyncLogSummary, getGateSyncStatusMeta, getLeavePassAgeMinutes, getLeavePassDestinationLabel, getLeavePassElapsedLabel, getLeavePassEventLabel, getLeavePassIdFromLocation, getLeavePassQueueMeta, getLeavePassStatusLabel, getLeavePassStatusTone, getLeavePassTimeline, getLeavePasses, getLessonAttendanceSessionStatusLabel, getLessonAttendanceSessionStatusTone, getLessonAttendanceSessions, getLessonSessionIdFromLocation, getLessonSessionTeacherTargets, getPublicModeFromLocation, getRewardStore, getRewardStoreDisplayItems, getRewardStoreDonorLabel, getRewardStoreStatusLabel, getRoleLabel, getSchoolAccess, getSchoolAttendanceBinding, getScreenTemplateLabel, getScreenTheme, getSessionToken, getShortStudentName, getStudentCompanyName, getStudentGroupingLabel, getStudentsForLessonClassroom, getTeacherSpecialItems, getTeacherSubjects, getTemplateCategoriesForEvent, getTickerTheme, getTodayIso, getTransitionLabel, getUnifiedCompanyRows, getUnifiedSchoolStudents, getVisualSourceSize, hydrateActionCatalog, hydrateActionLog, hydrateGateSyncCenterEvents, hydrateMessagingCenter, hydrateScanLog, hydrateSchools, hydrateTeacherSpecialItems, hydrateUsers, initialScanLog, initialSchools, isRoleEnabledForSchool, loadImageSource, loadPersistedState, loadServerCache, loadUiState, navItems, normalizeArabicHeader, normalizeImportRow, normalizePhoneNumber, normalizeRewardStoreItem, normalizeSearchDigits, normalizeSearchToken, normalizeSmartLinks, parseTeacherSubjects, parseTimeToMinutes, pickImportValue, pieColors, prependRewardStoreNotification, principalDelegableRoles, principalManageablePermissionKeys, printHtmlContent, readGateOfflineQueue, readGateSyncLog, readSchoolStructureViewState, removeGateOfflineQueueItem, removeGateSyncLogItem, resultTone, roles, safeLocalStorageGetItem, safeLocalStorageSetItem, safeNumber, sanitizeBarcodeValue, saveSchoolStructureViewState, saveServerCache, saveUiState, schoolCodeSlug, schoolHasStructureClassrooms, setSessionToken, sortUnifiedCompanyRows, splitTickerItems, statusFromResult, summarizeSchoolLiveState, toArabicDate, writeGateOfflineQueue, writeGateSyncLog, apiRequest} from '../utils/sharedFunctions.jsx';
import { SectionCard } from '../components/ui/SectionCard';


import { Badge } from '../components/ui/FormElements';
function ParentAuditFeedPage({ currentUser, selectedSchool, onSendMessage, onNavigate }) {
  const [state, setState] = useState({ loading: true, entries: [], summary: { total: 0, byAction: {}, schools: 0, parents: 0 }, error: '' });
  const [query, setQuery] = useState('');
  const [actionFilter, setActionFilter] = useState('all');
  const [scopeFilter, setScopeFilter] = useState('all');
  const [actionNotice, setActionNotice] = useState({ tone: '', text: '' });
  const [sendingEntryId, setSendingEntryId] = useState('');

  const load = useCallback(async () => {
    setState((current) => ({ ...current, loading: true, error: '' }));
    try {
      const response = await apiRequest('/api/admin/parents/audit-feed', { token: getSessionToken() });
      setState({ loading: false, entries: Array.isArray(response.entries) ? response.entries : [], summary: response.summary || { total: 0, byAction: {}, schools: 0, parents: 0 }, error: '' });
    } catch (error) {
      setState((current) => ({ ...current, loading: false, error: error.message || 'تعذر تحميل السجل الرقابي.' }));
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const actionOptions = useMemo(() => {
    const set = new Set();
    (state.entries || []).forEach((entry) => set.add(String(entry.action || '').trim()));
    return [...set].filter(Boolean);
  }, [state.entries]);

  const filteredEntries = useMemo(() => {
    const q = String(query || '').trim().toLowerCase();
    return (state.entries || []).filter((entry) => {
      if (actionFilter !== 'all' && String(entry.action || '') !== actionFilter) return false;
      if (scopeFilter === 'school' && String(entry.scope || '') !== 'school') return false;
      if (scopeFilter === 'parent' && String(entry.scope || '') !== 'parent') return false;
      if (!q) return true;
      const haystack = [entry.title, entry.note, entry.actorName, entry.actorRole, entry.guardianName, entry.mobileMasked, entry.studentName, entry.schoolName].join(' ').toLowerCase();
      return haystack.includes(q);
    });
  }, [state.entries, query, actionFilter, scopeFilter]);

  const exportPrefix = `parent-audit-${selectedSchool?.code || selectedSchool?.id || 'school'}`;
  const exportColumns = [
    { key: 'createdAt', label: 'وقت الإجراء' },
    { key: 'title', label: 'الإجراء' },
    { key: 'note', label: 'الوصف' },
    { key: 'guardianName', label: 'ولي الأمر' },
    { key: 'mobileMasked', label: 'رقم ولي الأمر' },
    { key: 'studentName', label: 'الطالب' },
    { key: 'schoolName', label: 'المدرسة' },
    { key: 'actorName', label: 'المنفذ' },
    { key: 'actorRoleLabel', label: 'الدور' },
    { key: 'scopeLabel', label: 'النطاق' },
    { key: 'action', label: 'رمز الإجراء' },
  ];

  const exportRows = (filteredEntries || []).map((entry) => ({
    ...entry,
    createdAt: entry.createdAt ? formatDateTime(entry.createdAt) : '—',
    actorRoleLabel: entry.actorRole === 'superadmin' ? 'أدمن عام' : entry.actorRole === 'principal' ? 'مدير مدرسة' : entry.actorRole === 'supervisor' ? 'مشرف' : entry.actorRole || 'إجراء',
    scopeLabel: entry.scope === 'school' ? 'عام على مستوى المدرسة' : 'خاص بولي أمر',
  }));

  const exportAudit = (mode = 'xlsx') => {
    if (mode === 'csv') {
      downloadFile(`${exportPrefix}.csv`, buildCsv(exportRows, exportColumns), 'text/csv;charset=utf-8;');
      return;
    }
    exportRowsToWorkbook(`${exportPrefix}.xlsx`, 'ParentAudit', exportRows, exportColumns);
  };

  const printAudit = () => {
    const rowsHtml = exportRows.map((row) => `<tr>${exportColumns.map((column) => `<td style="border:1px solid #dbe3ef;padding:8px;text-align:right;font-size:12px">${String(row[column.key] ?? '').replace(/</g, '&lt;')}</td>`).join('')}</tr>`).join('');
    const popup = window.open('', '_blank', 'width=1200,height=900');
    if (!popup) return;
    popup.document.write(`<!doctype html><html lang="ar" dir="rtl"><head><meta charset="utf-8" /><title>سجل أولياء الأمور</title><style>body{font-family:Arial,sans-serif;padding:24px;color:#0f172a}h1{margin:0 0 8px;font-size:22px}p{margin:0 0 18px;color:#475569}table{width:100%;border-collapse:collapse}th{background:#f8fafc;border:1px solid #dbe3ef;padding:10px;text-align:right;font-size:12px}</style></head><body><h1>سجل أولياء الأمور الرقابي</h1><p>إجمالي السجلات: ${exportRows.length}</p><table><thead><tr>${exportColumns.map((column) => `<th>${column.label}</th>`).join('')}</tr></thead><tbody>${rowsHtml || '<tr><td colspan="11" style="padding:16px;text-align:center">لا توجد بيانات</td></tr>'}</tbody></table></body></html>`);
    popup.document.close();
    popup.focus();
    popup.print();
  };


  const canSendFollowupForEntry = useCallback((entry) => {
    if (!selectedSchool || !entry || !onSendMessage) return false;
    if (!entry.studentId || !entry.mobile) return false;
    return Number(entry.schoolId || 0) === Number(selectedSchool.id || 0);
  }, [selectedSchool, onSendMessage]);

  const openEntryContext = useCallback((entry) => {
    if (!entry) return;
    const actionKey = String(entry.action || '').toLowerCase();
    if (/primary|portal|policy|request|approve|reject|rollback/.test(actionKey)) {
      window.open('/admin/parent-primary-requests', '_blank', 'noopener,noreferrer');
      return;
    }
    if (onNavigate) onNavigate('parentsAdmin');
  }, [onNavigate]);

  const sendFollowupForEntry = useCallback(async (entry) => {
    if (!canSendFollowupForEntry(entry)) {
      setActionNotice({ tone: 'rose', text: 'لا يمكن إرسال متابعة لهذا السجل من المدرسة الحالية. اختر المدرسة المرتبطة بالسجل أولًا.' });
      return;
    }
    const extraNote = window.prompt('اكتب نص متابعة مختصرًا سيُرسل لولي الأمر، أو اتركه فارغًا لاستخدام النص الافتراضي.', String(entry.note || '').trim()) || '';
    const subject = `متابعة إدارية: ${entry.title || 'سجل ولي أمر'}`;
    const message = extraNote.trim() || `نحيطكم علمًا بأنه تمت مراجعة السجل المرتبط بالطالب {اسم_الطالب} في ${selectedSchool?.name || 'المدرسة'}، ويمكنكم التواصل مع إدارة المدرسة عند الحاجة.`;
    try {
      setSendingEntryId(String(entry.id || 'sending'));
      const result = await onSendMessage({
        audience: `students:${entry.studentId}`,
        audienceLabel: `متابعة ولي أمر: ${entry.studentName || entry.guardianName || 'طالب'}`,
        channel: 'whatsapp',
        subject,
        message,
        sendMode: 'now',
      });
      if (!result?.ok) throw new Error(result?.message || 'تعذر إرسال المتابعة.');
      setActionNotice({ tone: 'green', text: result.message || `تم إرسال متابعة إلى ولي أمر ${entry.studentName || entry.guardianName || 'الطالب'}.` });
    } catch (error) {
      setActionNotice({ tone: 'rose', text: error?.message || 'تعذر إرسال المتابعة من السجل.' });
    } finally {
      setSendingEntryId('');
    }
  }, [canSendFollowupForEntry, onSendMessage, selectedSchool]);

  const actionCards = [
    { label: 'إجمالي السجلات', value: state.summary.total || 0, tone: 'blue' },
    { label: 'السجلات العامة', value: (state.entries || []).filter((entry) => entry.scope === 'school').length, tone: 'amber' },
    { label: 'السجلات الفردية', value: (state.entries || []).filter((entry) => entry.scope !== 'school').length, tone: 'green' },
    { label: 'أولياء الأمور المشمولون', value: state.summary.parents || 0, tone: 'violet' },
  ];

  return (
    <div className="space-y-6">
      <SectionCard title="سجل أولياء الأمور" icon={ClipboardList} action={<div className="flex flex-wrap items-center gap-2"><button onClick={load} className="rounded-2xl bg-slate-100 px-4 py-2 text-sm font-bold text-slate-700">تحديث</button><button onClick={() => exportAudit('xlsx')} className="rounded-2xl bg-emerald-600 px-4 py-2 text-sm font-bold text-white">Excel</button><button onClick={() => exportAudit('csv')} className="rounded-2xl bg-sky-50 px-4 py-2 text-sm font-bold text-sky-700 ring-1 ring-sky-100">CSV</button><button onClick={printAudit} className="rounded-2xl bg-white px-4 py-2 text-sm font-bold text-slate-700 ring-1 ring-slate-200">طباعة / PDF</button></div>}>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
          {actionCards.map((card) => <div key={card.label} className="rounded-[1.5rem] border border-slate-200 bg-white p-5"><Badge tone={card.tone}>{card.label}</Badge><div className="mt-4 text-3xl font-black text-slate-900">{card.value}</div></div>)}
        </div>
        <div className="mt-5 grid grid-cols-1 gap-3 lg:grid-cols-[1.2fr_.7fr_.7fr_auto]">
          <label className="rounded-2xl bg-slate-50 px-4 py-3 ring-1 ring-slate-200"><div className="text-xs font-black text-slate-500">بحث</div><input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="ولي الأمر أو الطالب أو الوصف" className="mt-2 w-full bg-transparent text-sm font-bold outline-none" /></label>
          <label className="rounded-2xl bg-slate-50 px-4 py-3 ring-1 ring-slate-200"><div className="text-xs font-black text-slate-500">نوع الإجراء</div><select value={actionFilter} onChange={(e) => setActionFilter(e.target.value)} className="mt-2 w-full bg-transparent text-sm font-bold outline-none"><option value="all">الكل</option>{actionOptions.map((action) => <option key={action} value={action}>{action}</option>)}</select></label>
          <label className="rounded-2xl bg-slate-50 px-4 py-3 ring-1 ring-slate-200"><div className="text-xs font-black text-slate-500">النطاق</div><select value={scopeFilter} onChange={(e) => setScopeFilter(e.target.value)} className="mt-2 w-full bg-transparent text-sm font-bold outline-none"><option value="all">الكل</option><option value="school">عام على مستوى المدرسة</option><option value="parent">خاص بولي أمر</option></select></label>
          <div className="flex items-end"><div className="rounded-2xl bg-slate-100 px-4 py-3 text-sm font-bold text-slate-700">{filteredEntries.length} سجل</div></div>
        </div>
        {state.error ? <div className="mt-4 rounded-2xl bg-rose-50 px-4 py-3 text-sm font-bold text-rose-700 ring-1 ring-rose-200">{state.error}</div> : null}
        {actionNotice.text ? <div className={`mt-4 rounded-2xl px-4 py-3 text-sm font-bold ring-1 ${actionNotice.tone === 'green' ? 'bg-emerald-50 text-emerald-700 ring-emerald-200' : actionNotice.tone === 'rose' ? 'bg-rose-50 text-rose-700 ring-rose-200' : 'bg-sky-50 text-sky-700 ring-sky-200'}`}>{actionNotice.text}</div> : null}
        {state.loading ? <div className="mt-4 rounded-2xl bg-slate-50 px-4 py-8 text-center text-sm font-bold text-slate-500">جاري تحميل السجل الرقابي...</div> : null}
        {!state.loading && !filteredEntries.length ? <div className="mt-4 rounded-2xl bg-slate-50 px-4 py-8 text-center text-sm font-bold text-slate-500">لا توجد سجلات مطابقة للفلاتر الحالية.</div> : null}
        <div className="mt-4 space-y-3">
          {filteredEntries.map((entry) => (
            <div key={entry.id} className="rounded-[1.5rem] border border-slate-200 bg-white p-5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <div className="text-lg font-black text-slate-900">{entry.title || 'إجراء إداري'}</div>
                  <div className="mt-2 text-sm leading-7 text-slate-600">{entry.note || '—'}</div>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Badge tone={/suspend|reject|rollback|disabled/i.test(String(entry.action || '')) ? 'rose' : /approve|reactivate|enabled/i.test(String(entry.action || '')) ? 'green' : /policy|send_access_code/i.test(String(entry.action || '')) ? 'amber' : 'blue'}>{entry.scope === 'school' ? 'عام' : 'ولي أمر'}</Badge>
                  <Badge tone="slate">{entry.actorRole === 'superadmin' ? 'أدمن عام' : entry.actorRole === 'principal' ? 'مدير مدرسة' : entry.actorRole === 'supervisor' ? 'مشرف' : entry.actorRole || 'إجراء'}</Badge>
                </div>
              </div>
              <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-4">
                <div className="rounded-2xl bg-slate-50 px-4 py-3 ring-1 ring-slate-200"><div className="text-xs font-black text-slate-500">ولي الأمر</div><div className="mt-1 text-sm font-black text-slate-900">{entry.guardianName || '—'}</div><div className="mt-1 text-xs text-slate-500">{entry.mobileMasked || '—'}</div></div>
                <div className="rounded-2xl bg-slate-50 px-4 py-3 ring-1 ring-slate-200"><div className="text-xs font-black text-slate-500">الطالب / المدرسة</div><div className="mt-1 text-sm font-black text-slate-900">{entry.studentName || '—'}</div><div className="mt-1 text-xs text-slate-500">{entry.schoolName || '—'}</div></div>
                <div className="rounded-2xl bg-slate-50 px-4 py-3 ring-1 ring-slate-200"><div className="text-xs font-black text-slate-500">المنفذ</div><div className="mt-1 text-sm font-black text-slate-900">{entry.actorName || '—'}</div><div className="mt-1 text-xs text-slate-500">{entry.createdAt ? formatDateTime(entry.createdAt) : '—'}</div></div>
                <div className="rounded-2xl bg-slate-50 px-4 py-3 ring-1 ring-slate-200"><div className="text-xs font-black text-slate-500">رمز الإجراء</div><div className="mt-1 text-sm font-black text-slate-900">{entry.action || '—'}</div><div className="mt-1 text-xs text-slate-500">{entry.scope === 'school' ? 'عام على المدرسة' : 'ملف ولي الأمر'}</div></div>
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                <button type="button" onClick={() => openEntryContext(entry)} className="rounded-2xl bg-slate-100 px-4 py-2 text-sm font-bold text-slate-700 hover:bg-slate-200">فتح الجهة المرتبطة</button>
                <button type="button" onClick={() => onNavigate?.('messages')} className="rounded-2xl bg-white px-4 py-2 text-sm font-bold text-sky-700 ring-1 ring-sky-100 hover:bg-sky-50">فتح الرسائل والتنبيهات</button>
                {canSendFollowupForEntry(entry) ? <button type="button" onClick={() => sendFollowupForEntry(entry)} disabled={sendingEntryId === String(entry.id || '')} className="rounded-2xl bg-sky-700 px-4 py-2 text-sm font-bold text-white disabled:opacity-60">{sendingEntryId === String(entry.id || '') ? 'جاري الإرسال...' : 'إرسال متابعة لولي الأمر'}</button> : null}
                {!canSendFollowupForEntry(entry) && entry.studentId ? <div className="rounded-2xl bg-amber-50 px-4 py-2 text-xs font-bold text-amber-700 ring-1 ring-amber-200">لإرسال متابعة مباشرة اختر المدرسة المرتبطة بهذا السجل أولًا.</div> : null}
              </div>
            </div>
          ))}
        </div>
      </SectionCard>
    </div>
  );
}

export default ParentAuditFeedPage;

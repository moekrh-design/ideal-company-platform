/**
 * ==========================================
 *  ParentExecutiveSummaryPage Component
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
function ParentExecutiveSummaryPage({ currentUser, selectedSchool, onNavigate }) {
  const [state, setState] = useState({
    loading: false,
    error: '',
    requests: [],
    alerts: [],
    parents: [],
    audit: [],
    portalEnabled: true,
    portalMode: 'auto',
    lastUpdatedAt: '',
  });

  const load = useCallback(async () => {
    if (!selectedSchool?.id) return;
    setState((current) => ({ ...current, loading: true, error: '' }));
    try {
      const query = currentUser?.role === 'superadmin' ? `?schoolId=${selectedSchool.id}` : '';
      const [requestsResponse, parentsResponse, auditResponse] = await Promise.all([
        apiRequest(`/api/admin/parent-primary-requests${query}`, { token: getSessionToken() }),
        apiRequest('/api/admin/parents', { token: getSessionToken() }),
        apiRequest('/api/admin/parents/audit-feed', { token: getSessionToken() }),
      ]);
      setState({
        loading: false,
        error: '',
        requests: Array.isArray(requestsResponse?.requests) ? requestsResponse.requests : [],
        alerts: Array.isArray(requestsResponse?.alerts) ? requestsResponse.alerts : [],
        parents: Array.isArray(parentsResponse?.parents) ? parentsResponse.parents : [],
        audit: Array.isArray(auditResponse?.entries) ? auditResponse.entries : [],
        portalEnabled: requestsResponse?.portalSettings?.enabled !== false,
        portalMode: requestsResponse?.policy?.mode === 'manual' ? 'manual' : 'auto',
        lastUpdatedAt: new Date().toISOString(),
      });
    } catch (error) {
      setState((current) => ({ ...current, loading: false, error: error.message || 'تعذر تحميل المتابعة التنفيذية.' }));
    }
  }, [selectedSchool?.id, currentUser?.role]);

  useEffect(() => {
    load();
  }, [load]);

  const summary = useMemo(() => {
    const parents = state.parents || [];
    const requests = state.requests || [];
    const audit = state.audit || [];
    const pending = requests.filter((item) => item?.status === 'pending').length;
    const approved = requests.filter((item) => item?.status === 'approved').length;
    const rejected = requests.filter((item) => item?.status === 'rejected').length;
    const autoApproved = (state.alerts || []).filter((item) => String(item?.action || '') === 'auto-approved').length;
    const suspended = parents.filter((item) => item?.accountControl?.suspended).length;
    const active = parents.filter((item) => item?.status === 'active' && !item?.accountControl?.suspended).length;
    const extraContacts = parents.reduce((sum, item) => sum + Number(item?.extraContactsCount || 0), 0);
    const schoolEntries = audit.filter((item) => item?.scope === 'school').length;
    const parentEntries = audit.filter((item) => item?.scope !== 'school').length;
    const followups = audit.filter((item) => /send_access_code|parent_reassign_student|approve_parent_primary_change|rollback_parent_primary_change|reject_parent_primary_change/i.test(String(item?.action || ''))).length;
    const readiness = Math.max(0, Math.min(100,
      (state.portalEnabled ? 40 : 10)
      + (state.portalMode === 'auto' ? 20 : 8)
      + Math.max(0, 20 - Math.min(20, pending * 3))
      + Math.max(0, 10 - Math.min(10, suspended * 2))
      + Math.min(10, active > 0 ? 10 : 0)
    ));
    return { pending, approved, rejected, autoApproved, suspended, active, extraContacts, schoolEntries, parentEntries, followups, readiness, totalParents: parents.length };
  }, [state]);

  const healthTone = !state.portalEnabled ? 'amber' : summary.pending > 0 && state.portalMode === 'manual' ? 'amber' : 'green';
  const cardRows = [
    { label: 'جاهزية البوابة', value: `${summary.readiness}%`, tone: summary.readiness >= 80 ? 'green' : summary.readiness >= 60 ? 'amber' : 'rose', detail: state.portalEnabled ? 'الحالة العامة للتشغيل والمتابعة' : 'البوابة مقفلة حاليًا' },
    { label: 'أولياء الأمور النشطون', value: summary.active, tone: 'blue', detail: `من أصل ${summary.totalParents} حسابًا` },
    { label: 'الطلبات المعلقة', value: summary.pending, tone: summary.pending > 0 ? 'amber' : 'green', detail: state.portalMode === 'manual' ? 'تحتاج اعتمادًا يدويًا' : 'الوضع التلقائي يخفف التكدس' },
    { label: 'الحسابات المعلقة', value: summary.suspended, tone: summary.suspended > 0 ? 'rose' : 'green', detail: 'معلّقة من الإدارة' },
    { label: 'الأرقام الإضافية', value: summary.extraContacts, tone: 'violet', detail: 'مرتبطة بحسابات أولياء الأمور' },
    { label: 'المتابعات الرقابية', value: summary.followups, tone: 'sky', detail: 'اعتماد/رفض/إرسال/نقل' },
  ];

  const distributionRows = useMemo(() => ([
    { name: 'نشطون', value: summary.active },
    { name: 'معلقون', value: summary.suspended },
    { name: 'طلبات معلقة', value: summary.pending },
  ]).filter((item) => item.value > 0), [summary]);

  const actionRows = useMemo(() => ([
    { name: 'معتمدة', value: summary.approved },
    { name: 'مرفوضة', value: summary.rejected },
    { name: 'تلقائي', value: summary.autoApproved },
    { name: 'رقابي', value: summary.parentEntries + summary.schoolEntries },
  ]).filter((item) => item.value > 0), [summary]);

  const topAttention = useMemo(() => {
    const items = [];
    if (!state.portalEnabled) items.push({ title: 'البوابة مقفلة', body: 'بوابة ولي الأمر متوقفة، ولن يتمكن أولياء الأمور من تسجيل الدخول حتى يعاد تفعيلها.', tone: 'amber', target: 'parentPortal' });
    if (state.portalMode === 'manual' && summary.pending > 0) items.push({ title: 'طلبات بانتظار الاعتماد', body: `يوجد ${summary.pending} طلب يحتاج معالجة من الإدارة.`, tone: 'blue', target: 'parentPortal' });
    if (summary.suspended > 0) items.push({ title: 'حسابات معلقة', body: `تم تعليق ${summary.suspended} حساب${summary.suspended > 1 ? 'ات' : ''} ولي أمر، راجع الأسباب والتأثير على التواصل.`, tone: 'rose', target: 'parentsAdmin' });
    const lastAlert = (state.alerts || [])[0];
    if (lastAlert?.message) items.push({ title: 'آخر إشعار إداري', body: lastAlert.message, tone: 'slate', target: 'parentsAdmin' });
    return items.slice(0, 4);
  }, [state.portalEnabled, state.portalMode, state.alerts, summary.pending, summary.suspended]);

  const printExecutiveSummary = () => {
    const rows = cardRows.map((item) => `<div class="stat"><div class="k">${item.label}</div><div class="v">${item.value}</div><div class="d">${item.detail}</div></div>`).join('');
    const attention = topAttention.map((item) => `<tr><td>${item.title}</td><td>${item.body}</td></tr>`).join('');
    printHtmlContent('المتابعة التنفيذية لبوابة ولي الأمر', `<h1>المتابعة التنفيذية لبوابة ولي الأمر</h1><div class="meta">${selectedSchool?.name || 'المدرسة'} • ${formatDateTime(new Date().toISOString())}</div><div class="stats">${rows}</div><h1 style="font-size:20px;margin-top:24px">العناصر التي تحتاج انتباهًا</h1><table><thead><tr><th>العنصر</th><th>التفصيل</th></tr></thead><tbody>${attention || '<tr><td colspan="2">لا توجد عناصر عاجلة.</td></tr>'}</tbody></table>`);
  };

  return (
    <div className="space-y-6">
      <SectionCard title="المتابعة التنفيذية لبوابة ولي الأمر" icon={BarChart3} action={<div className="flex flex-wrap items-center gap-2"><button onClick={load} className="rounded-2xl bg-slate-100 px-4 py-2 text-sm font-bold text-slate-700">تحديث</button><button onClick={printExecutiveSummary} className="rounded-2xl bg-white px-4 py-2 text-sm font-bold text-slate-700 ring-1 ring-slate-200">طباعة / PDF</button><button onClick={() => onNavigate?.('parentPortal')} className="rounded-2xl bg-sky-700 px-4 py-2 text-sm font-bold text-white">إدارة البوابة</button></div>}>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {cardRows.map((card) => <div key={card.label} className="rounded-[1.5rem] border border-slate-200 bg-white p-5"><Badge tone={card.tone}>{card.label}</Badge><div className="mt-4 text-3xl font-black text-slate-900">{card.value}</div><div className="mt-2 text-sm leading-7 text-slate-500">{card.detail}</div></div>)}
        </div>

        <div className="mt-5 grid grid-cols-1 gap-4 xl:grid-cols-[1.2fr_.8fr]">
          <div className="rounded-[1.75rem] border border-slate-200 bg-white p-5">
            <div className="flex items-center justify-between gap-3">
              <div>
                <div className="text-lg font-black text-slate-900">لوحة الانتباه السريع</div>
                <div className="mt-1 text-sm leading-7 text-slate-500">مختصر تنفيذي لما يحتاج قرارًا أو متابعة من المدير.</div>
              </div>
              <Badge tone={healthTone}>{state.portalEnabled ? (state.portalMode === 'auto' ? 'تشغيل تلقائي' : 'تشغيل يدوي') : 'مقفلة'}</Badge>
            </div>
            {state.error ? <div className="mt-4 rounded-2xl bg-rose-50 px-4 py-3 text-sm font-bold text-rose-700 ring-1 ring-rose-200">{state.error}</div> : null}
            {state.loading ? <div className="mt-4 rounded-2xl bg-slate-50 px-4 py-8 text-center text-sm font-bold text-slate-500">جاري تحميل المؤشرات التنفيذية...</div> : null}
            {!state.loading && !topAttention.length ? <div className="mt-4 rounded-2xl bg-slate-50 px-4 py-8 text-center text-sm font-bold text-slate-500">الوضع مستقر حاليًا، ولا توجد عناصر عاجلة ظاهرة.</div> : null}
            <div className="mt-4 space-y-3">
              {topAttention.map((item, index) => <button key={`${item.title}-${index}`} type="button" onClick={() => onNavigate?.(item.target)} className="block w-full rounded-3xl border border-slate-200 bg-slate-50 p-4 text-right transition hover:bg-slate-100"><div className="flex items-start justify-between gap-3"><div><div className="font-black text-slate-900">{item.title}</div><div className="mt-1 text-sm leading-7 text-slate-600">{item.body}</div></div><Badge tone={item.tone}>{item.tone === 'amber' ? 'تنبيه' : item.tone === 'rose' ? 'حرج' : item.tone === 'blue' ? 'متابعة' : 'معلومة'}</Badge></div></button>)}
            </div>
          </div>

          <div className="rounded-[1.75rem] border border-slate-200 bg-white p-5">
            <div className="text-lg font-black text-slate-900">ملخص التشغيل</div>
            <div className="mt-4 space-y-3 text-sm">
              <div className="flex items-center justify-between rounded-2xl bg-slate-50 px-4 py-3 ring-1 ring-slate-200"><span className="font-bold text-slate-600">حالة البوابة</span><span className="font-black text-slate-900">{state.portalEnabled ? 'مفعلة' : 'مقفلة'}</span></div>
              <div className="flex items-center justify-between rounded-2xl bg-slate-50 px-4 py-3 ring-1 ring-slate-200"><span className="font-bold text-slate-600">سياسة التحديث</span><span className="font-black text-slate-900">{state.portalMode === 'auto' ? 'تلقائي' : 'يدوي'}</span></div>
              <div className="flex items-center justify-between rounded-2xl bg-slate-50 px-4 py-3 ring-1 ring-slate-200"><span className="font-bold text-slate-600">السجلات الرقابية</span><span className="font-black text-slate-900">{summary.schoolEntries + summary.parentEntries}</span></div>
              <div className="flex items-center justify-between rounded-2xl bg-slate-50 px-4 py-3 ring-1 ring-slate-200"><span className="font-bold text-slate-600">آخر تحديث</span><span className="font-black text-slate-900">{state.lastUpdatedAt ? formatDateTime(state.lastUpdatedAt) : '—'}</span></div>
            </div>
            <div className="mt-4 grid grid-cols-1 gap-2">
              <button type="button" onClick={() => onNavigate?.('parentsAdmin')} className="rounded-2xl bg-slate-100 px-4 py-3 text-sm font-bold text-slate-700 hover:bg-slate-200">فتح ملف أولياء الأمور</button>
              <button type="button" onClick={() => onNavigate?.('parentsAdmin')} className="rounded-2xl bg-white px-4 py-3 text-sm font-bold text-sky-700 ring-1 ring-sky-100 hover:bg-sky-50">فتح السجل الرقابي</button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
          <div className="rounded-[1.75rem] border border-slate-200 bg-white p-5">
            <div className="text-lg font-black text-slate-900">توزيع الحالات</div>
            <div className="mt-1 text-sm leading-7 text-slate-500">نظرة سريعة على الصحة التشغيلية لحسابات أولياء الأمور.</div>
            <div className="mt-4 h-72">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={distributionRows.length ? distributionRows : [{ name: 'لا توجد بيانات', value: 1 }]} dataKey="value" nameKey="name" innerRadius={55} outerRadius={90} paddingAngle={3}>
                    {(distributionRows.length ? distributionRows : [{ name: 'لا توجد بيانات', value: 1 }]).map((_, index) => <Cell key={index} fill={["#0ea5e9", "#f59e0b", "#ef4444", "#8b5cf6"][index % 4]} />)}
                  </Pie>
                  <Tooltip formatter={(value) => [value, 'العدد']} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="rounded-[1.75rem] border border-slate-200 bg-white p-5">
            <div className="text-lg font-black text-slate-900">نشاط الإجراءات</div>
            <div className="mt-1 text-sm leading-7 text-slate-500">يميز بين الاعتماد والرفض والتدخلات الرقابية خلال الفترة الحالية.</div>
            <div className="mt-4 h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={actionRows.length ? actionRows : [{ name: 'لا توجد بيانات', value: 0 }]}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="name" tickLine={false} axisLine={false} />
                  <YAxis allowDecimals={false} tickLine={false} axisLine={false} />
                  <Tooltip formatter={(value) => [value, 'العدد']} />
                  <Bar dataKey="value" radius={[14, 14, 0, 0]}>
                    {(actionRows.length ? actionRows : [{ name: 'لا توجد بيانات', value: 0 }]).map((_, index) => <Cell key={index} fill={["#10b981", "#ef4444", "#0ea5e9", "#8b5cf6"][index % 4]} />)}
                    <LabelList dataKey="value" position="top" />
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </SectionCard>
    </div>
  );
}

export default ParentExecutiveSummaryPage;

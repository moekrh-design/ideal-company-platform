/**
 * ==========================================
 *  SchoolDashboard Component
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
import { SummaryBox } from '../components/ui/FormElements';
import { SectionCard } from '../components/ui/SectionCard';
import { StatCard } from '../components/ui/StatCard';


import { Badge } from '../components/ui/FormElements';
import { BarcodeCard } from '../components/ui/BarcodeCard';
function SchoolDashboard({ schools, selectedSchool, setSelectedSchoolId, scanLog, actionLog = [], gateSyncEvents = [], settings = {}, notifications, canSelectSchool = true, executiveReport, currentUser, onCreateGateLink, onDeleteGateLink, onCreateScreenLink, onDeleteScreenLink, onUpdateScreenLink, onNavigate }) {
  const fallbackSchool = selectedSchool || schools[0] || null;
  const canViewParentPortalDashboard = ['superadmin', 'principal', 'supervisor'].includes(String(currentUser?.role || ''));
  const [parentPortalDashboard, setParentPortalDashboard] = useState({
    loading: false,
    loaded: false,
    error: '',
    enabled: true,
    mode: 'auto',
    pending: 0,
    approvedToday: 0,
    activeParents: 0,
    lastAlert: null,
  });
  const scopedSchools = canSelectSchool ? schools : [fallbackSchool].filter(Boolean);
  const totalStudents = scopedSchools.reduce((sum, school) => sum + getUnifiedSchoolStudents(school, { includeArchived: false, preferStructure: true }).length, 0);
  const totalCompanies = scopedSchools.reduce((sum, school) => sum + getUnifiedCompanyRows(school, { preferStructure: true }).length, 0);
  const faceReadyCount = scopedSchools.reduce((sum, school) => sum + getUnifiedSchoolStudents(school, { includeArchived: false, preferStructure: true }).filter((student) => student.faceReady).length, 0);
  const schoolStudents = getUnifiedSchoolStudents(fallbackSchool, { includeArchived: false, preferStructure: true });

  const rankedCompanies = [...getUnifiedCompanyRows(fallbackSchool, { preferStructure: true })].sort((a, b) => b.points - a.points);
  const topStudents = [...schoolStudents].sort((a, b) => b.points - a.points).slice(0, 3);
  const schoolLogs = scanLog.filter((item) => item.schoolId === fallbackSchool?.id && !item.result.includes("فشل"));
  const gateCount = Number(fallbackSchool?.smartLinks?.gates?.length || 0);
  const screenCount = Number(fallbackSchool?.smartLinks?.screens?.length || 0);
  const structureCount = Number(fallbackSchool?.structure?.classrooms?.length || 0);
  const schoolGateSyncEvents = useMemo(() => hydrateGateSyncCenterEvents(gateSyncEvents).filter((item) => Number(item.schoolId) === Number(fallbackSchool?.id)), [gateSyncEvents, fallbackSchool?.id]);
  const schoolGateSyncSummary = useMemo(() => schoolGateSyncEvents.reduce((acc, item) => {
    acc.total += 1;
    const status = String(item.status || '').toLowerCase();
    if (status === 'synced') acc.synced += 1;
    else if (status === 'duplicate') acc.duplicate += 1;
    else if (status === 'pending') acc.pending += 1;
    else if (status === 'rejected') acc.rejected += 1;
    else if (status === 'error') acc.error += 1;
    else if (status === 'cleared') acc.cleared += 1;
    return acc;
  }, { total: 0, pending: 0, synced: 0, duplicate: 0, rejected: 0, error: 0, cleared: 0 }), [schoolGateSyncEvents]);
  const schoolGateSyncRecent = useMemo(() => schoolGateSyncEvents.slice(0, 6), [schoolGateSyncEvents]);

  const statusPie = [
    { name: "مبكر", value: schoolStudents.filter((item) => item.status === "مبكر").length },
    { name: "في الوقت", value: schoolStudents.filter((item) => item.status === "في الوقت").length },
    { name: "متأخر", value: schoolStudents.filter((item) => item.status === "متأخر").length },
  ].filter((item) => item.value > 0);

  const attendanceTrend = useMemo(() => {
    const grouped = new Map();
    schoolLogs.forEach((log) => {
      const existing = grouped.get(log.isoDate) || { day: log.date, attendance: 0, early: 0 };
      existing.attendance += 1;
      if (log.result.includes("مبكر")) existing.early += 1;
      grouped.set(log.isoDate, existing);
    });
    const rows = [...grouped.entries()].sort((a, b) => a[0].localeCompare(b[0])).slice(-5).map(([, value]) => value);
    return rows.length ? rows : [{ day: "اليوم", attendance: 0, early: 0 }];
  }, [schoolLogs]);

  const companyChart = rankedCompanies.map((company) => ({
    name: company.name,
    points: company.points,
    initiatives: company.initiatives,
  }));
  const liveSummary = executiveReport?.summary || summarizeSchoolLiveState(fallbackSchool, scanLog, []).summary;
  const latestNotifications = notifications.slice(0, 4);

  useEffect(() => {
    let cancelled = false;
    if (!fallbackSchool?.id || !canViewParentPortalDashboard) {
      setParentPortalDashboard((current) => ({ ...current, loading: false, loaded: false, error: '' }));
      return () => { cancelled = true; };
    }
    const loadParentPortalDashboard = async () => {
      setParentPortalDashboard((current) => ({ ...current, loading: true, error: '' }));
      try {
        const query = currentUser?.role === 'superadmin' ? `?schoolId=${fallbackSchool.id}` : '';
        const response = await apiRequest(`/api/admin/parent-primary-requests${query}`, { token: getSessionToken() });
        const requests = Array.isArray(response?.requests) ? response.requests : [];
        const alerts = Array.isArray(response?.alerts) ? response.alerts : [];
        const activeParentPhones = new Set();
        requests.forEach((request) => {
          if (request?.currentPhone) activeParentPhones.add(String(request.currentPhone));
          if (request?.requestedMobile) activeParentPhones.add(String(request.requestedMobile));
        });
        const approvedToday = requests.filter((request) => {
          const stamp = String(request?.updatedAt || request?.verifiedAt || '');
          return request?.status === 'approved' && stamp.slice(0, 10) === new Date().toISOString().slice(0, 10);
        }).length;
        if (!cancelled) {
          setParentPortalDashboard({
            loading: false,
            loaded: true,
            error: '',
            enabled: response?.portalSettings?.enabled !== false,
            mode: response?.policy?.mode === 'manual' ? 'manual' : 'auto',
            pending: requests.filter((request) => String(request?.status || '') === 'pending').length,
            approvedToday,
            activeParents: activeParentPhones.size,
            lastAlert: alerts[0] || null,
          });
        }
      } catch (error) {
        if (!cancelled) {
          setParentPortalDashboard((current) => ({ ...current, loading: false, loaded: true, error: error.message || 'تعذر تحميل مؤشرات بوابة ولي الأمر.' }));
        }
      }
    };
    loadParentPortalDashboard();
    return () => { cancelled = true; };
  }, [fallbackSchool?.id, canViewParentPortalDashboard, currentUser?.role]);

  // ===== إحصائيات الإجراءات =====
  const schoolActionLog = useMemo(() => (actionLog || []).filter((item) => item.schoolId === fallbackSchool?.id), [actionLog, fallbackSchool]);
  const todayIso = new Date().toISOString().slice(0, 10);

  const actionStats = useMemo(() => {
    const rewardMap = {};
    const violationMap = {};
    const programMap = {};
    const teacherMap = {};
    let rewardTotal = 0, violationTotal = 0, programTotal = 0;
    let rewardToday = 0, violationToday = 0, programToday = 0;
    const tPoints = settings?.teacherPoints || {};
    const ptReward = Number(tPoints.perReward ?? 5);
    const ptViolation = Number(tPoints.perViolation ?? 2);
    const ptProgram = Number(tPoints.perProgram ?? 10);

    schoolActionLog.forEach((item) => {
      const isToday = (item.isoDate || '').slice(0, 10) === todayIso;
      const actor = item.actorName || 'غير محدد';
      if (!teacherMap[actor]) teacherMap[actor] = { name: actor, rewards: 0, violations: 0, programs: 0, points: 0 };

      if (item.actionType === 'reward') {
        rewardTotal++;
        if (isToday) rewardToday++;
        const title = item.actionTitle || 'غير محدد';
        rewardMap[title] = (rewardMap[title] || { title, count: 0, points: 0 });
        rewardMap[title].count++;
        rewardMap[title].points += Number(item.points || 0);
        teacherMap[actor].rewards++;
        teacherMap[actor].points += ptReward;
      } else if (item.actionType === 'violation') {
        violationTotal++;
        if (isToday) violationToday++;
        const title = item.actionTitle || 'غير محدد';
        violationMap[title] = (violationMap[title] || { title, count: 0, points: 0 });
        violationMap[title].count++;
        violationMap[title].points += Math.abs(Number(item.points || 0));
        teacherMap[actor].violations++;
        teacherMap[actor].points += ptViolation;
      } else if (item.actionType === 'program') {
        programTotal++;
        if (isToday) programToday++;
        const title = item.actionTitle || 'غير محدد';
        programMap[title] = (programMap[title] || { title, count: 0 });
        programMap[title].count++;
        teacherMap[actor].programs++;
        teacherMap[actor].points += ptProgram;
      }
    });

    const topRewards = Object.values(rewardMap).sort((a, b) => b.count - a.count).slice(0, 8);
    const topViolations = Object.values(violationMap).sort((a, b) => b.count - a.count).slice(0, 8);
    const topPrograms = Object.values(programMap).sort((a, b) => b.count - a.count).slice(0, 8);
    const topTeachers = Object.values(teacherMap).sort((a, b) => b.points - a.points).slice(0, 8);
    return { rewardTotal, violationTotal, programTotal, rewardToday, violationToday, programToday, topRewards, topViolations, topPrograms, topTeachers };
  }, [schoolActionLog, settings, todayIso]);
  const quickNavigation = [
    { key: 'attendance', label: 'الحضور الذكي', tone: 'blue' },
    { key: 'students', label: 'الطلاب', tone: 'violet' },
    { key: 'classes', label: 'الفصول', tone: 'amber' },
    { key: 'gates', label: 'البوابات والشاشات', tone: 'green' },
    { key: 'users', label: 'المستخدمون', tone: 'rose' },
    { key: 'settings', label: 'الإعدادات', tone: 'slate' },
    ...(canViewParentPortalDashboard ? [{ key: 'parentPortal', label: 'بوابة ولي الأمر', tone: parentPortalDashboard.enabled ? 'green' : 'amber' }] : []),
  ];
  const readinessWarnings = [
    !structureCount ? { title: 'الفصول غير مهيأة', body: 'أضف الفصول أو استوردها من صفحة الشركات والفصول لظهور البيانات بشكل صحيح.', tone: 'amber' } : null,
    !schoolStudents.length ? { title: 'لا يوجد طلاب', body: 'أضف الطلاب أو استوردهم ثم أعد مراجعة صفحة الطلاب والحضور.', tone: 'rose' } : null,
    !gateCount ? { title: 'لا توجد بوابات', body: 'أنشئ بوابة واحدة على الأقل حتى تعمل شاشة الحضور عند المدخل.', tone: 'amber' } : null,
    !screenCount ? { title: 'لا توجد شاشات', body: 'أضف شاشة عرض واحدة على الأقل لعرض المؤشرات أو لوحة المدرسة.', tone: 'blue' } : null,
    !fallbackSchool?.manager ? { title: 'بيانات المدير ناقصة', body: 'أكمل اسم مدير المدرسة وبياناته من صفحة المدارس أو الإعدادات.', tone: 'amber' } : null,
    canViewParentPortalDashboard && !parentPortalDashboard.enabled ? { title: 'بوابة ولي الأمر مقفلة', body: 'البوابة متوقفة حاليًا، ولن يتمكن أولياء الأمور من تسجيل الدخول حتى يعاد تفعيلها من الإعدادات.', tone: 'amber' } : null,
    canViewParentPortalDashboard && parentPortalDashboard.mode === 'manual' && parentPortalDashboard.pending > 0 ? { title: 'طلبات أولياء الأمور بانتظار الاعتماد', body: `يوجد ${parentPortalDashboard.pending} طلب يحتاج متابعة لأن سياسة التحديث الحالية يدوية.`, tone: 'blue' } : null,
  ].filter(Boolean);

  if (!fallbackSchool) {
    return (
      <div className="space-y-6">
        <SectionCard title="لوحة التحكم" icon={LayoutDashboard}>
          <div className="rounded-[1.75rem] border border-dashed border-slate-300 bg-slate-50 p-10 text-center">
            <div className="text-xl font-black text-slate-800">لا توجد مدرسة محددة بعد</div>
            <div className="mt-3 text-sm leading-8 text-slate-500">أضف مدرسة من تبويب المدارس ثم عد إلى الصفحة الرئيسية لعرض المؤشرات والتقارير المباشرة.</div>
          </div>
        </SectionCard>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="rounded-[2rem] bg-gradient-to-l from-slate-900 via-sky-800 to-cyan-700 p-6 text-white shadow-lg">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <Badge tone="blue">الرئيسية التنفيذية</Badge>
              <Badge tone="green">{fallbackSchool.city || '—'}</Badge>
              <Badge tone="violet">{currentUser?.role === 'superadmin' ? 'الأدمن العام' : getRoleLabel(currentUser?.role)}</Badge>
            </div>
            <div className="mt-4 text-3xl font-black leading-tight">{fallbackSchool.name || '—'}</div>
            <div className="mt-2 text-sm leading-7 text-white/85">واجهة مختصرة تعرض حالة المدرسة الآن: الحضور، جاهزية الطلاب، الشاشات والبوابات، وأبرز عناصر المتابعة اليومية.</div>
          </div>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 xl:min-w-[440px]">
            <div className="rounded-2xl bg-white/10 p-4 ring-1 ring-white/15"><div className="text-xs text-white/70">الطلاب</div><div className="mt-1 text-2xl font-black">{schoolStudents.length}</div></div>
            <div className="rounded-2xl bg-white/10 p-4 ring-1 ring-white/15"><div className="text-xs text-white/70">الفصول</div><div className="mt-1 text-2xl font-black">{structureCount || totalCompanies}</div></div>
            <div className="rounded-2xl bg-white/10 p-4 ring-1 ring-white/15"><div className="text-xs text-white/70">البوابات</div><div className="mt-1 text-2xl font-black">{gateCount}</div></div>
            <div className="rounded-2xl bg-white/10 p-4 ring-1 ring-white/15"><div className="text-xs text-white/70">الشاشات</div><div className="mt-1 text-2xl font-black">{screenCount}</div></div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard title="إجمالي المدارس" value={canSelectSchool ? schools.length : 1} subtitle={canSelectSchool ? "قابلة لإضافة مدارس جديدة" : "نطاق المدرسة الحالية"} icon={Building2} />
        <StatCard title="الشركات النشطة" value={totalCompanies} subtitle="فصول أو شركات طلابية" icon={Trophy} />
        <StatCard title="الطلاب المسجلون" value={totalStudents} subtitle="مرتبطون بالتقارير والحضور" icon={Users} />
        <StatCard title="جاهزية بصمة الوجه" value={faceReadyCount} subtitle="طالب مفعّل لبصمة الوجه" icon={Camera} />
      </div>

      {canViewParentPortalDashboard ? (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
          <div className="rounded-3xl bg-white p-5 ring-1 ring-slate-200">
            <div className="flex items-center justify-between gap-3"><Badge tone={parentPortalDashboard.enabled ? 'green' : 'amber'}>بوابة ولي الأمر</Badge><Users className="h-5 w-5 text-slate-400" /></div>
            <div className="mt-4 text-3xl font-black text-slate-900">{parentPortalDashboard.enabled ? 'مفعلة' : 'مقفلة'}</div>
            <div className="mt-2 text-sm leading-7 text-slate-500">{parentPortalDashboard.mode === 'manual' ? 'التحديث يدوي ويحتاج موافقة الإدارة.' : 'التحديث تلقائي مع إشعار للإدارة.'}</div>
            <div className="mt-4 flex items-center gap-2 text-xs font-bold text-slate-500"><span className="rounded-full bg-slate-100 px-3 py-1">{parentPortalDashboard.mode === 'manual' ? 'يدوي' : 'تلقائي'}</span>{parentPortalDashboard.loading ? <span className="rounded-full bg-sky-50 px-3 py-1 text-sky-700">تحديث...</span> : null}</div>
          </div>
          <div className="rounded-3xl bg-white p-5 ring-1 ring-slate-200">
            <div className="flex items-center justify-between gap-3"><Badge tone="amber">طلبات التحديث</Badge><RefreshCw className="h-5 w-5 text-slate-400" /></div>
            <div className="mt-4 text-3xl font-black text-slate-900">{parentPortalDashboard.pending}</div>
            <div className="mt-2 text-sm leading-7 text-slate-500">طلبات بانتظار المراجعة أو المتابعة حسب السياسة الحالية.</div>
            <div className="mt-4 text-xs font-bold text-slate-500">اعتمد اليوم: <span className="text-slate-800">{parentPortalDashboard.approvedToday}</span></div>
          </div>
          <div className="rounded-3xl bg-white p-5 ring-1 ring-slate-200">
            <div className="flex items-center justify-between gap-3"><Badge tone="blue">الأولياء المرتبطون</Badge><Phone className="h-5 w-5 text-slate-400" /></div>
            <div className="mt-4 text-3xl font-black text-slate-900">{parentPortalDashboard.activeParents}</div>
            <div className="mt-2 text-sm leading-7 text-slate-500">عدد الأرقام الظاهرة في سجل طلبات البوابة لهذه المدرسة.</div>
            <div className="mt-4 text-xs font-bold text-slate-500">آخر تحديث: <span className="text-slate-800">{parentPortalDashboard.lastAlert?.createdAt ? formatDateTime(parentPortalDashboard.lastAlert.createdAt) : '—'}</span></div>
          </div>
          <div className="rounded-3xl bg-white p-5 ring-1 ring-slate-200">
            <div className="flex items-center justify-between gap-3"><Badge tone="violet">آخر إشعار</Badge><Bell className="h-5 w-5 text-slate-400" /></div>
            <div className="mt-4 text-lg font-black leading-8 text-slate-900">{parentPortalDashboard.lastAlert?.message || parentPortalDashboard.error || 'لا يوجد إشعار حديث'}</div>
            <div className="mt-2 text-sm leading-7 text-slate-500">{parentPortalDashboard.lastAlert?.action === 'auto-approved' ? 'اعتماد تلقائي' : parentPortalDashboard.lastAlert?.action === 'rejected' ? 'رفض/تراجع' : parentPortalDashboard.lastAlert?.action === 'approved' ? 'اعتماد يدوي' : 'متابعة إدارية'}</div>
            <div className="mt-4 flex flex-wrap gap-2 text-xs font-bold"> 
              <button type="button" onClick={() => onNavigate?.('settings')} className="rounded-full bg-slate-100 px-3 py-1 text-slate-700 hover:bg-slate-200">إعدادات البوابة</button>
              <button type="button" onClick={() => window.open(`/admin/parent-primary-requests?token=${encodeURIComponent(getSessionToken())}`, '_blank', 'noopener,noreferrer')} className="rounded-full bg-sky-50 px-3 py-1 text-sky-700 hover:bg-sky-100">عرض الطلبات</button>
            </div>
          </div>
        </div>
      ) : null}

      {Array.isArray(fallbackSchool?.structure?.classrooms) && fallbackSchool.structure.classrooms.length ? <div className="rounded-2xl border border-dashed border-violet-200 bg-violet-50 p-4 text-sm font-bold text-violet-800">المصدر الافتراضي للوحات المدرسة الآن هو <span className="font-black">الهيكل المدرسي</span>.</div> : null}

      <div className="grid grid-cols-2 gap-4 xl:grid-cols-5">
        <SummaryBox label="الحاضرون اليوم" value={liveSummary.presentToday || 0} color="text-emerald-700" />
        <SummaryBox label="نسبة الحضور" value={`${liveSummary.attendanceRate || 0}%`} color="text-sky-700" />
        <SummaryBox label="المكافآت" value={liveSummary.rewardsToday || 0} color="text-emerald-700" />
        <SummaryBox label="الخصومات" value={liveSummary.violationsToday || 0} color="text-rose-700" />
        <SummaryBox label="البرامج" value={liveSummary.programsToday || 0} color="text-violet-700" />
      </div>


      <SectionCard title="مركز مزامنة البوابات" icon={Wifi} action={<Badge tone={schoolGateSyncSummary.pending ? 'amber' : 'green'}>{schoolGateSyncSummary.pending ? `${schoolGateSyncSummary.pending} معلقة` : 'متزامنة'}</Badge>}>
        <div className="grid grid-cols-2 gap-4 xl:grid-cols-6">
          <SummaryBox label="إجمالي السجلات" value={schoolGateSyncSummary.total} color="text-slate-800" />
          <SummaryBox label="تمت" value={schoolGateSyncSummary.synced} color="text-emerald-700" />
          <SummaryBox label="مكرر" value={schoolGateSyncSummary.duplicate} color="text-sky-700" />
          <SummaryBox label="بانتظار" value={schoolGateSyncSummary.pending} color="text-amber-700" />
          <SummaryBox label="مرفوض / خطأ" value={schoolGateSyncSummary.rejected + schoolGateSyncSummary.error} color="text-rose-700" />
          <SummaryBox label="تم تفريغه" value={schoolGateSyncSummary.cleared} color="text-slate-600" />
        </div>
        <div className="mt-5 grid grid-cols-1 gap-3 xl:grid-cols-2">
          <div className="rounded-3xl bg-slate-50 p-4 ring-1 ring-slate-200">
            <div className="text-sm font-black text-slate-800">آخر أحداث مزامنة البوابات</div>
            <div className="mt-3 space-y-3">
              {schoolGateSyncRecent.length ? schoolGateSyncRecent.map((item) => (
                <div key={item.id} className="rounded-2xl bg-white p-4 ring-1 ring-slate-200">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <div className="font-black text-slate-800">{item.gateName || 'بوابة المدرسة'}</div>
                      <div className="mt-1 text-xs text-slate-500">{item.studentName || item.barcode || 'عملية بوابة'} - {formatDateTime(item.syncedAt || item.createdAt || item.capturedAt || new Date().toISOString())}</div>
                    </div>
                    <Badge tone={item.status === 'synced' ? 'green' : item.status === 'duplicate' ? 'blue' : item.status === 'pending' ? 'amber' : item.status === 'cleared' ? 'slate' : 'rose'}>
                      {item.status === 'synced' ? 'تمت' : item.status === 'duplicate' ? 'مكرر' : item.status === 'pending' ? 'بانتظار' : item.status === 'cleared' ? 'تم تفريغه' : item.status === 'rejected' ? 'مرفوض' : 'خطأ'}
                    </Badge>
                  </div>
                  <div className="mt-2 text-sm leading-7 text-slate-600">{item.message || '—'}</div>
                </div>
              )) : <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-8 text-center text-sm font-bold text-slate-500">لا توجد أحداث مزامنة مركزية بعد.</div>}
            </div>
          </div>
          <div className="rounded-3xl bg-white p-5 ring-1 ring-slate-200">
            <div className="flex items-center justify-between gap-3">
              <div className="font-extrabold text-slate-800">بوابات تحتاج متابعة</div>
              <button type="button" onClick={() => onNavigate?.('reports')} className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-700 hover:bg-slate-200">فتح التقارير</button>
            </div>
            <div className="mt-4 space-y-3">
              {(fallbackSchool?.smartLinks?.gates || []).map((gate) => {
                const gateRows = schoolGateSyncEvents.filter((item) => String(item.gateId) === String(gate.id));
                const pending = gateRows.filter((item) => item.status === 'pending').length;
                const failed = gateRows.filter((item) => ['rejected','error'].includes(item.status)).length;
                const synced = gateRows.filter((item) => item.status === 'synced').length;
                return (
                  <div key={gate.id} className="rounded-2xl bg-slate-50 p-4 ring-1 ring-slate-200">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <div className="font-black text-slate-800">{gate.name}</div>
                        <div className="mt-1 text-xs text-slate-500">تمت {synced} | معلقة {pending} | متعثرة {failed}</div>
                      </div>
                      <Badge tone={pending ? 'amber' : failed ? 'rose' : 'green'}>{pending ? 'تحتاج متابعة' : failed ? 'يوجد تعثر' : 'مستقرة'}</Badge>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </SectionCard>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-4">
        <div className="rounded-3xl bg-white p-5 ring-1 ring-slate-200">
          <div className="flex items-center gap-3"><Building2 className="h-5 w-5 text-sky-700" /><div className="font-extrabold text-slate-800">ملف المدرسة</div></div>
          <div className="mt-4 space-y-3 text-sm text-slate-600">
            <div className="flex items-center justify-between rounded-2xl bg-slate-50 px-4 py-3"><span>الرقم الوزاري</span><span className="font-black text-slate-800">{fallbackSchool.code || '—'}</span></div>
            <div className="flex items-center justify-between rounded-2xl bg-slate-50 px-4 py-3"><span>المدير</span><span className="font-black text-slate-800">{fallbackSchool.manager || '—'}</span></div>
            <div className="flex items-center justify-between rounded-2xl bg-slate-50 px-4 py-3"><span>آخر الحضور</span><span className="font-black text-slate-800">{schoolLogs[0]?.time || 'لا يوجد'}</span></div>
          </div>
        </div>
        <div className="rounded-3xl bg-white p-5 ring-1 ring-slate-200">
          <div className="flex items-center gap-3"><Shield className="h-5 w-5 text-emerald-700" /><div className="font-extrabold text-slate-800">جاهزية التشغيل</div></div>
          <div className="mt-4 grid grid-cols-2 gap-3 text-center">
            <div className="rounded-2xl bg-emerald-50 p-3"><div className="text-xs text-emerald-700">الباركود</div><div className="mt-1 font-black text-emerald-800">جاهز</div></div>
            <div className="rounded-2xl bg-sky-50 p-3"><div className="text-xs text-sky-700">النسخ الاحتياطي</div><div className="mt-1 font-black text-sky-800">يومي</div></div>
            <div className="rounded-2xl bg-violet-50 p-3"><div className="text-xs text-violet-700">الحسابات</div><div className="mt-1 font-black text-violet-800">{(schools || []).length ? 'نشطة' : '—'}</div></div>
            <div className="rounded-2xl bg-amber-50 p-3"><div className="text-xs text-amber-700">الروابط الذكية</div><div className="mt-1 font-black text-amber-800">{gateCount + screenCount}</div></div>
          </div>
        </div>
        <div className="rounded-3xl bg-white p-5 ring-1 ring-slate-200 xl:col-span-2">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3"><ClipboardList className="h-5 w-5 text-slate-700" /><div className="font-extrabold text-slate-800">ملخص سريع</div></div>
            {canSelectSchool ? (
              <select value={fallbackSchool.id} onChange={(e) => setSelectedSchoolId(Number(e.target.value))} className="rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm font-bold outline-none">
                {schools.map((school) => (
                  <option key={school.id} value={school.id}>{school.name}</option>
                ))}
              </select>
            ) : <Badge tone="blue">مدرستي فقط</Badge>}
          </div>
          <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-3">
            <div className="rounded-2xl bg-slate-50 p-4 ring-1 ring-slate-200"><div className="text-sm text-slate-500">أفضل فصل</div><div className="mt-1 font-black text-slate-800">{rankedCompanies[0]?.name || '—'}</div><div className="mt-1 text-xs text-slate-500">{rankedCompanies[0]?.points || 0} نقطة</div></div>
            <div className="rounded-2xl bg-slate-50 p-4 ring-1 ring-slate-200"><div className="text-sm text-slate-500">أفضل طالب</div><div className="mt-1 font-black text-slate-800">{topStudents[0]?.name || '—'}</div><div className="mt-1 text-xs text-slate-500">{topStudents[0]?.points || 0} نقطة</div></div>
            <div className="rounded-2xl bg-slate-50 p-4 ring-1 ring-slate-200"><div className="text-sm text-slate-500">آخر تنبيه</div><div className="mt-1 font-black text-slate-800">{latestNotifications[0]?.title || 'لا يوجد'}</div><div className="mt-1 text-xs text-slate-500">{latestNotifications[0]?.time || '—'}</div></div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-12">
        <div className="xl:col-span-7">
          <SectionCard title="مركز التشغيل السريع" icon={Rocket} action={<Badge tone="green">أسرع وصول</Badge>}>
            <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-6">
              {quickNavigation.map((item) => (
                <button
                  key={item.key}
                  type="button"
                  onClick={() => onNavigate?.(item.key)}
                  className="rounded-2xl bg-slate-50 px-4 py-4 text-right ring-1 ring-slate-200 transition hover:-translate-y-0.5 hover:bg-white hover:shadow-sm"
                >
                  <div className="text-sm font-black text-slate-800">{item.label}</div>
                  <div className="mt-2"><Badge tone={item.tone}>فتح الصفحة</Badge></div>
                </button>
              ))}
            </div>
          </SectionCard>
        </div>
        <div className="xl:col-span-5">
          <SectionCard title="تنبيهات الجاهزية" icon={ShieldAlert} action={<Badge tone={readinessWarnings.length ? "amber" : "green"}>{readinessWarnings.length ? `${readinessWarnings.length} بحاجة مراجعة` : "جاهزة"}</Badge>}>
            <div className="space-y-3">
              {readinessWarnings.length ? readinessWarnings.map((item, index) => (
                <div key={`${item.title}-${index}`} className="rounded-2xl bg-slate-50 p-4 ring-1 ring-slate-200">
                  <div className="flex items-center justify-between gap-3">
                    <div className="font-black text-slate-800">{item.title}</div>
                    <Badge tone={item.tone}>{item.tone === "rose" ? "مرتفع" : item.tone === "amber" ? "متوسط" : "ملاحظة"}</Badge>
                  </div>
                  <div className="mt-2 text-sm leading-7 text-slate-600">{item.body}</div>
                </div>
              )) : <div className="rounded-2xl bg-emerald-50 p-4 text-sm font-bold text-emerald-800 ring-1 ring-emerald-100">البيانات الأساسية متوفرة، ويمكنك متابعة التشغيل اليومي من دون ملاحظات رئيسية.</div>}
            </div>
          </SectionCard>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        <div className="space-y-6 lg:col-span-8">
          <SectionCard title="لوحة المدرسة والمؤشرات المباشرة" icon={BarChart3} action={<Badge tone="blue">مؤشرات مباشرة</Badge>}>
            <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
              <div className="rounded-3xl bg-slate-50 p-4 ring-1 ring-slate-200">
                <div className="mb-3 font-bold text-slate-700">عمليات الحضور المسجلة خلال آخر الأيام</div>
                <div className="h-72">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={attendanceTrend}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="day" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="attendance" radius={[8, 8, 0, 0]} fill="#0ea5e9" />
                      <Bar dataKey="early" radius={[8, 8, 0, 0]} fill="#10b981" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
              <div className="rounded-3xl bg-slate-50 p-4 ring-1 ring-slate-200">
                <div className="mb-3 font-bold text-slate-700">حالة الطلاب الحالية</div>
                <div className="h-72">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={statusPie.length ? statusPie : [{ name: 'لا يوجد', value: 1 }]} dataKey="value" nameKey="name" innerRadius={58} outerRadius={94} paddingAngle={4}>
                        {(statusPie.length ? statusPie : [{ name: 'لا يوجد', value: 1 }]).map((entry, index) => <Cell key={entry.name + index} fill={pieColors[index % pieColors.length]} />)}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>
              <div className="xl:col-span-2 rounded-3xl bg-slate-50 p-4 ring-1 ring-slate-200">
                <div className="mb-3 font-bold text-slate-700">نقاط الشركات والمبادرات</div>
                <div className="h-72">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={companyChart.length ? companyChart : [{ name: 'لا يوجد', points: 0, initiatives: 0 }]}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="points" radius={[8, 8, 0, 0]} fill="#1d4ed8" />
                      <Bar dataKey="initiatives" radius={[8, 8, 0, 0]} fill="#f59e0b" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          </SectionCard>
        </div>

        <div className="space-y-6 lg:col-span-4">
          <SectionCard title="ترتيب الشركات داخل المدرسة" icon={Trophy}>
            <div className="space-y-3">
              {rankedCompanies.length ? rankedCompanies.map((company, index) => (
                <div key={company.id} className="rounded-2xl bg-slate-50 p-4 ring-1 ring-slate-200">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <div className="font-extrabold text-slate-800">{index + 1}. {company.name}</div>
                      <div className="text-sm text-slate-500">الفصل {company.className}</div>
                    </div>
                    <Badge tone={index === 0 ? "green" : index === 1 ? "blue" : "amber"}>{company.points} نقطة</Badge>
                  </div>
                </div>
              )) : <div className="rounded-2xl bg-slate-50 p-4 text-sm text-slate-500 ring-1 ring-slate-200">لا توجد فصول أو شركات لعرض الترتيب بعد.</div>}
            </div>
          </SectionCard>

          <SectionCard title="أعلى الطلاب نقاطًا" icon={QrCode}>
            <div className="space-y-3">
              {topStudents.length ? topStudents.map((student) => {
                return <BarcodeCard key={student.id} student={student} companyName={student.companyName || getStudentGroupingLabel(student, fallbackSchool)} schoolName={fallbackSchool?.name || "—"} />;
              }) : <div className="rounded-2xl bg-slate-50 p-4 text-sm text-slate-500 ring-1 ring-slate-200">لا يوجد طلاب بعد لعرض بطاقة التميز.</div>}
            </div>
          </SectionCard>

          <SectionCard title="آخر التنبيهات" icon={Bell}>
            <div className="space-y-3">
              {latestNotifications.length ? latestNotifications.map((note) => (
                <div key={note.id} className="rounded-2xl bg-slate-50 p-4 ring-1 ring-slate-200">
                  <div className="font-bold text-slate-800">{note.title}</div>
                  <div className="mt-1 text-sm leading-6 text-slate-500">{note.body}</div>
                  <div className="mt-2 text-xs text-slate-400">{note.time}</div>
                </div>
              )) : <div className="rounded-2xl bg-slate-50 p-4 text-sm text-slate-500 ring-1 ring-slate-200">لا توجد تنبيهات حديثة في الوقت الحالي.</div>}
            </div>
          </SectionCard>
        </div>
      </div>

      {/* ===== قسم إحصائيات الإجراءات ===== */}
      <div id="actions-stats-section" className="space-y-6">
        {/* ملخص أرقام الإجراءات */}
        <SectionCard title="إحصائيات الإجراءات" icon={ClipboardList} action={
          <button
            type="button"
            onClick={() => window.print()}
            className="flex items-center gap-2 rounded-2xl bg-slate-800 px-4 py-2 text-sm font-bold text-white hover:bg-slate-700"
          >
            <Printer className="h-4 w-4" /> طباعة التقرير
          </button>
        }>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-6">
            <div className="rounded-2xl bg-emerald-50 p-4 ring-1 ring-emerald-100 text-center">
              <div className="text-xs font-bold text-emerald-700">مكافآت الإجمالي</div>
              <div className="mt-2 text-3xl font-black text-emerald-800">{actionStats.rewardTotal}</div>
              <div className="mt-1 text-xs text-emerald-600">اليوم: {actionStats.rewardToday}</div>
            </div>
            <div className="rounded-2xl bg-rose-50 p-4 ring-1 ring-rose-100 text-center">
              <div className="text-xs font-bold text-rose-700">خصومات الإجمالي</div>
              <div className="mt-2 text-3xl font-black text-rose-800">{actionStats.violationTotal}</div>
              <div className="mt-1 text-xs text-rose-600">اليوم: {actionStats.violationToday}</div>
            </div>
            <div className="rounded-2xl bg-violet-50 p-4 ring-1 ring-violet-100 text-center">
              <div className="text-xs font-bold text-violet-700">برامج الإجمالي</div>
              <div className="mt-2 text-3xl font-black text-violet-800">{actionStats.programTotal}</div>
              <div className="mt-1 text-xs text-violet-600">اليوم: {actionStats.programToday}</div>
            </div>
            <div className="rounded-2xl bg-amber-50 p-4 ring-1 ring-amber-100 text-center">
              <div className="text-xs font-bold text-amber-700">أعلى مكافأة</div>
              <div className="mt-2 text-base font-black text-amber-800 leading-tight">{actionStats.topRewards[0]?.title || '—'}</div>
              <div className="mt-1 text-xs text-amber-600">{actionStats.topRewards[0]?.count || 0} مرة</div>
            </div>
            <div className="rounded-2xl bg-sky-50 p-4 ring-1 ring-sky-100 text-center">
              <div className="text-xs font-bold text-sky-700">أعلى خصم</div>
              <div className="mt-2 text-base font-black text-sky-800 leading-tight">{actionStats.topViolations[0]?.title || '—'}</div>
              <div className="mt-1 text-xs text-sky-600">{actionStats.topViolations[0]?.count || 0} مرة</div>
            </div>
            <div className="rounded-2xl bg-indigo-50 p-4 ring-1 ring-indigo-100 text-center">
              <div className="text-xs font-bold text-indigo-700">المعلم الأبرز</div>
              <div className="mt-2 text-base font-black text-indigo-800 leading-tight">{actionStats.topTeachers[0]?.name || '—'}</div>
              <div className="mt-1 text-xs text-indigo-600">{actionStats.topTeachers[0]?.points || 0} نقطة</div>
            </div>
          </div>
        </SectionCard>

        {/* رسوم بيانية للإجراءات */}
        <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
          {/* مخطط المكافآت */}
          <div className="rounded-3xl bg-white p-5 ring-1 ring-slate-200">
            <div className="mb-4 flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-emerald-100"><Trophy className="h-5 w-5 text-emerald-700" /></div>
              <div className="font-extrabold text-slate-800">أكثر المكافآت تكراراً</div>
            </div>
            {actionStats.topRewards.length ? (
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={actionStats.topRewards} layout="vertical" margin={{ right: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                    <XAxis type="number" />
                    <YAxis type="category" dataKey="title" width={120} tick={{ fontSize: 11 }} />
                    <Tooltip formatter={(v) => [`${v} مرة`, 'التكرار']} />
                    <Bar dataKey="count" radius={[0, 8, 8, 0]} fill="#10b981" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            ) : <div className="rounded-2xl bg-slate-50 p-6 text-center text-sm text-slate-500">لا توجد مكافآت مسجلة بعد.</div>}
          </div>

          {/* مخطط الخصومات */}
          <div className="rounded-3xl bg-white p-5 ring-1 ring-slate-200">
            <div className="mb-4 flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-rose-100"><ShieldAlert className="h-5 w-5 text-rose-700" /></div>
              <div className="font-extrabold text-slate-800">أكثر الخصومات تكراراً</div>
            </div>
            {actionStats.topViolations.length ? (
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={actionStats.topViolations} layout="vertical" margin={{ right: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                    <XAxis type="number" />
                    <YAxis type="category" dataKey="title" width={120} tick={{ fontSize: 11 }} />
                    <Tooltip formatter={(v) => [`${v} مرة`, 'التكرار']} />
                    <Bar dataKey="count" radius={[0, 8, 8, 0]} fill="#f43f5e" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            ) : <div className="rounded-2xl bg-slate-50 p-6 text-center text-sm text-slate-500">لا توجد خصومات مسجلة بعد.</div>}
          </div>

          {/* مخطط البرامج */}
          <div className="rounded-3xl bg-white p-5 ring-1 ring-slate-200">
            <div className="mb-4 flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-violet-100"><Rocket className="h-5 w-5 text-violet-700" /></div>
              <div className="font-extrabold text-slate-800">أكثر البرامج تنفيذاً</div>
            </div>
            {actionStats.topPrograms.length ? (
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={actionStats.topPrograms} layout="vertical" margin={{ right: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                    <XAxis type="number" />
                    <YAxis type="category" dataKey="title" width={120} tick={{ fontSize: 11 }} />
                    <Tooltip formatter={(v) => [`${v} مرة`, 'التكرار']} />
                    <Bar dataKey="count" radius={[0, 8, 8, 0]} fill="#8b5cf6" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            ) : <div className="rounded-2xl bg-slate-50 p-6 text-center text-sm text-slate-500">لا توجد برامج مسجلة بعد.</div>}
          </div>

          {/* مخطط المعلمين الأبرز */}
          <div className="rounded-3xl bg-white p-5 ring-1 ring-slate-200">
            <div className="mb-4 flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-amber-100"><Users className="h-5 w-5 text-amber-700" /></div>
              <div className="font-extrabold text-slate-800">المعلمون الأبرز (بالنقاط)</div>
            </div>
            {actionStats.topTeachers.length ? (
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={actionStats.topTeachers} layout="vertical" margin={{ right: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                    <XAxis type="number" />
                    <YAxis type="category" dataKey="name" width={120} tick={{ fontSize: 11 }} />
                    <Tooltip formatter={(v, name) => [v, name === 'points' ? 'النقاط' : name === 'rewards' ? 'المكافآت' : name === 'violations' ? 'الخصومات' : 'البرامج']} />
                    <Bar dataKey="points" radius={[0, 8, 8, 0]} fill="#f59e0b" />
                    <Bar dataKey="rewards" radius={[0, 8, 8, 0]} fill="#10b981" />
                    <Bar dataKey="violations" radius={[0, 8, 8, 0]} fill="#f43f5e" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            ) : <div className="rounded-2xl bg-slate-50 p-6 text-center text-sm text-slate-500">لا توجد إجراءات مسجلة بعد.</div>}
          </div>
        </div>

        {/* جدول تفاصيل المكافآت */}
        <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
          <div className="rounded-3xl bg-white p-5 ring-1 ring-slate-200">
            <div className="mb-4 font-extrabold text-emerald-800">تفاصيل المكافآت</div>
            <div className="space-y-2">
              {actionStats.topRewards.length ? actionStats.topRewards.map((item, i) => (
                <div key={item.title} className="flex items-center justify-between rounded-2xl bg-emerald-50 px-4 py-3 ring-1 ring-emerald-100">
                  <div className="flex items-center gap-2">
                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-200 text-xs font-black text-emerald-800">{i + 1}</span>
                    <span className="text-sm font-bold text-slate-800">{item.title}</span>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-black text-emerald-700">{item.count} مرة</div>
                    <div className="text-xs text-slate-500">{item.points} نقطة</div>
                  </div>
                </div>
              )) : <div className="text-sm text-slate-400 text-center py-4">لا توجد بيانات</div>}
            </div>
          </div>
          <div className="rounded-3xl bg-white p-5 ring-1 ring-slate-200">
            <div className="mb-4 font-extrabold text-rose-800">تفاصيل الخصومات</div>
            <div className="space-y-2">
              {actionStats.topViolations.length ? actionStats.topViolations.map((item, i) => (
                <div key={item.title} className="flex items-center justify-between rounded-2xl bg-rose-50 px-4 py-3 ring-1 ring-rose-100">
                  <div className="flex items-center gap-2">
                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-rose-200 text-xs font-black text-rose-800">{i + 1}</span>
                    <span className="text-sm font-bold text-slate-800">{item.title}</span>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-black text-rose-700">{item.count} مرة</div>
                    <div className="text-xs text-slate-500">{item.points} نقطة</div>
                  </div>
                </div>
              )) : <div className="text-sm text-slate-400 text-center py-4">لا توجد بيانات</div>}
            </div>
          </div>
          <div className="rounded-3xl bg-white p-5 ring-1 ring-slate-200">
            <div className="mb-4 font-extrabold text-violet-800">تفاصيل البرامج</div>
            <div className="space-y-2">
              {actionStats.topPrograms.length ? actionStats.topPrograms.map((item, i) => (
                <div key={item.title} className="flex items-center justify-between rounded-2xl bg-violet-50 px-4 py-3 ring-1 ring-violet-100">
                  <div className="flex items-center gap-2">
                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-violet-200 text-xs font-black text-violet-800">{i + 1}</span>
                    <span className="text-sm font-bold text-slate-800">{item.title}</span>
                  </div>
                  <div className="text-sm font-black text-violet-700">{item.count} مرة</div>
                </div>
              )) : <div className="text-sm text-slate-400 text-center py-4">لا توجد بيانات</div>}
            </div>
          </div>
        </div>

        {/* جدول المعلمين الأبرز */}
        <SectionCard title="المعلمون الأبرز — التفاصيل الكاملة" icon={Users}>
          {actionStats.topTeachers.length ? (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-200">
                    <th className="py-3 pr-4 text-right font-extrabold text-slate-700">#</th>
                    <th className="py-3 pr-4 text-right font-extrabold text-slate-700">المعلم</th>
                    <th className="py-3 px-4 text-center font-extrabold text-emerald-700">مكافآت</th>
                    <th className="py-3 px-4 text-center font-extrabold text-rose-700">خصومات</th>
                    <th className="py-3 px-4 text-center font-extrabold text-violet-700">برامج</th>
                    <th className="py-3 px-4 text-center font-extrabold text-amber-700">النقاط</th>
                  </tr>
                </thead>
                <tbody>
                  {actionStats.topTeachers.map((teacher, i) => (
                    <tr key={teacher.name} className={`border-b border-slate-100 ${i === 0 ? 'bg-amber-50' : ''}`}>
                      <td className="py-3 pr-4 font-black text-slate-500">{i + 1}</td>
                      <td className="py-3 pr-4 font-bold text-slate-800">{teacher.name}</td>
                      <td className="py-3 px-4 text-center font-bold text-emerald-700">{teacher.rewards}</td>
                      <td className="py-3 px-4 text-center font-bold text-rose-700">{teacher.violations}</td>
                      <td className="py-3 px-4 text-center font-bold text-violet-700">{teacher.programs}</td>
                      <td className="py-3 px-4 text-center">
                        <span className="rounded-full bg-amber-100 px-3 py-1 font-black text-amber-800">{teacher.points}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : <div className="rounded-2xl bg-slate-50 p-6 text-center text-sm text-slate-500">لا توجد إجراءات مسجلة بعد.</div>}
        </SectionCard>
      </div>
    </div>
  );
}

export default SchoolDashboard;

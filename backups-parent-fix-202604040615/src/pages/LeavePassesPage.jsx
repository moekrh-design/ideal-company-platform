/**
 * ==========================================
 *  LeavePassesPage Component
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
import { Input, Select, SummaryBox } from '../components/ui/FormElements';
import { DataTable } from '../components/ui/DataTable';
import { SectionCard } from '../components/ui/SectionCard';


import { Badge } from '../components/ui/FormElements';
function LeavePassesPage({ selectedSchool, currentUser, users, initialPassId, onCreateLeavePass, onSendLeavePass, onMarkViewed, onUpdateLeavePassStatus, viewMode = "main" }) {
  const schoolUsers = useMemo(() => (users || []).filter((user) => Number(user.schoolId) === Number(selectedSchool?.id)), [users, selectedSchool]);
  const teacherUsers = useMemo(() => schoolUsers.filter((user) => String(user.role || '') === 'teacher' && String(user.status || 'نشط') === 'نشط'), [schoolUsers]);
  const students = useMemo(() => getUnifiedSchoolStudents(selectedSchool, { includeArchived: false, preferStructure: true }), [selectedSchool]);
  const allLeavePasses = useMemo(() => [...getLeavePasses(selectedSchool)].sort((a, b) => String(b.createdAt || '').localeCompare(String(a.createdAt || ''))), [selectedSchool]);
  const destinationFilter = viewMode === 'agent' ? 'agent' : viewMode === 'counselor' ? 'counselor' : '';
  const leavePasses = useMemo(() => destinationFilter ? allLeavePasses.filter((item) => String(item.destination || '') === destinationFilter) : allLeavePasses, [allLeavePasses, destinationFilter]);
  const canCreate = viewMode === 'main' && ['superadmin', 'principal', 'supervisor'].includes(String(currentUser?.role || ''));
  const teacherInbox = useMemo(() => leavePasses.filter((item) => String(item.teacherUserId || '') === String(currentUser?.id || '') && !['completed', 'cancelled'].includes(String(item.status || ''))), [leavePasses, currentUser]);
  const managedRows = canCreate || viewMode !== 'main' ? leavePasses : teacherInbox;
  const pageMeta = viewMode === 'agent'
    ? { title: 'لوحة استئذان الوكيل', description: 'تعرض فقط الطلبات الموجهة إلى الوكيل مع الاعتماد السريع والطباعة والمتابعة. إذا دخل حساب الوكيل فستفتح له هذه الشاشة مباشرة.', summaryTone: 'indigo' }
    : viewMode === 'counselor'
      ? { title: 'لوحة استئذان المرشد', description: 'تعرض فقط الطلبات الموجهة إلى المرشد مع سجلها الزمني واعتمادها السريع. إذا دخل حساب المرشد فستفتح له هذه الشاشة مباشرة.', summaryTone: 'violet' }
      : { title: 'الاستئذان', description: 'مسار تشغيلي لطلب الطالب من فصله وتوجيهه إلى الوكيل أو المرشد أو الخروج مع ولي الأمر، مع إنشاء رابط خاص للمعلم وإرساله يدويًا أو عبر النظام.', summaryTone: 'sky' };
  const [form, setForm] = useState({ studentId: '', teacherUserId: '', destination: 'agent', reason: '', note: '', guardianName: '', guardianMobile: '', sendChannel: 'system' });
  const [completionEffect, setCompletionEffect] = useState(null); // { id, type, studentName }
  const [recentlyCompleted, setRecentlyCompleted] = useState(new Set());
  const [selectedId, setSelectedId] = useState('');
  const selectedPass = useMemo(() => managedRows.find((item) => String(item.id) === String(selectedId)) || managedRows[0] || null, [managedRows, selectedId]);
  const selectedStudent = useMemo(() => students.find((item) => String(item.id) === String(form.studentId)), [students, form.studentId]);
  const selectedTeacher = useMemo(() => teacherUsers.find((item) => String(item.id) === String(form.teacherUserId)), [teacherUsers, form.teacherUserId]);
  const [boardFilter, setBoardFilter] = useState('active');
  const [sendingPassId, setSendingPassId] = React.useState(null);
  const [sendPassStatus, setSendPassStatus] = React.useState('');
  const todayIso = getTodayIso();
  const dashboardRows = useMemo(() => leavePasses.map((item) => ({ ...item, queueMeta: getLeavePassQueueMeta(item) })), [leavePasses]);
  const boardRows = useMemo(() => {
    const rows = dashboardRows.filter((item) => {
      if (boardFilter === 'today') return String(item.createdAt || '').startsWith(todayIso);
      if (boardFilter === 'overdue') return ['overdue-teacher', 'overdue-close'].includes(String(item.queueMeta?.key || ''));
      if (boardFilter === 'waitingTeacher') return ['created', 'sent-system', 'sent-manual'].includes(String(item.status || ''));
      if (boardFilter === 'needsClosure') return ['viewed', 'approved-agent', 'approved-counselor', 'released-guardian'].includes(String(item.status || ''));
      return !['completed', 'cancelled'].includes(String(item.status || ''));
    });
    return [...rows].sort((a, b) => {
      const rank = { 'overdue-teacher': 5, 'overdue-close': 4, 'attention-teacher': 3, 'attention-close': 2, 'in-progress': 1, 'new': 0, 'closed': -1 };
      const diff = (rank[String(b.queueMeta?.key || '')] || 0) - (rank[String(a.queueMeta?.key || '')] || 0);
      if (diff) return diff;
      return String(b.createdAt || '').localeCompare(String(a.createdAt || ''));
    });
  }, [dashboardRows, boardFilter, todayIso]);
  const boardSummary = useMemo(() => ({
    active: dashboardRows.filter((item) => !['completed', 'cancelled'].includes(String(item.status || ''))).length,
    waitingTeacher: dashboardRows.filter((item) => ['created', 'sent-system', 'sent-manual'].includes(String(item.status || ''))).length,
    needsClosure: dashboardRows.filter((item) => ['viewed', 'approved-agent', 'approved-counselor', 'released-guardian'].includes(String(item.status || ''))).length,
    overdue: dashboardRows.filter((item) => ['overdue-teacher', 'overdue-close'].includes(String(item.queueMeta?.key || ''))).length,
    today: dashboardRows.filter((item) => String(item.createdAt || '').startsWith(todayIso)).length,
  }), [dashboardRows, todayIso]);
  const printLeavePass = (pass) => {
    if (!pass) return;
    const popup = window.open('', '_blank', 'width=980,height=760');
    if (!popup) return window.alert('تعذر فتح نافذة الطباعة.');
    const statusLabel = getLeavePassStatusLabel(pass.status);
    const destinationLabel = getLeavePassDestinationLabel(pass.destination);
    const createdAtLabel = pass.createdAt ? formatDateTime(pass.createdAt) : '—';
    const approvalLabel = pass.approvedAt ? `${pass.approvedByName || 'الإدارة'} — ${formatDateTime(pass.approvedAt)}` : '—';
    const timelineHtml = getLeavePassTimeline(pass).slice(0, 6).map((event) => `<div class="time-item"><strong>${getLeavePassEventLabel(event.type)}</strong><span>${event.at ? formatDateTime(event.at) : '—'}</span><div>${event.actorName || 'مستخدم النظام'}${event.note ? ` — ${event.note}` : ''}</div></div>`).join('');
    popup.document.write(`<!doctype html><html lang="ar" dir="rtl"><head><meta charset="UTF-8" /><title>طباعة الاستئذان</title><style>
      body{font-family:Tahoma,Arial,sans-serif;background:#f8fafc;padding:24px;color:#0f172a} .sheet{max-width:900px;margin:auto;background:#fff;border:2px solid #cbd5e1;border-radius:24px;padding:28px}
      .head{display:flex;justify-content:space-between;align-items:center;border-bottom:3px solid #0f766e;padding-bottom:16px;margin-bottom:18px}.title{font-size:28px;font-weight:800}.meta{color:#475569;font-size:14px}
      .grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:14px;margin:16px 0}.box{border:1px solid #cbd5e1;border-radius:18px;padding:14px;background:#f8fafc}.label{font-size:13px;color:#64748b;margin-bottom:6px}.value{font-size:18px;font-weight:700}
      .wide{grid-column:1/-1}.badge{display:inline-block;padding:8px 14px;border-radius:999px;background:#e0f2fe;color:#075985;font-weight:800}.timeline{margin-top:18px;border-top:1px dashed #cbd5e1;padding-top:14px}.timeline div{margin:8px 0}.footer{margin-top:24px;display:grid;grid-template-columns:1fr 1fr;gap:24px}.sign{border-top:1px solid #94a3b8;padding-top:12px;color:#475569;height:70px}
      @media print{body{background:#fff;padding:0}.sheet{border:none;border-radius:0;padding:0}}
    </style></head><body><div class="sheet"><div class="head"><div><div class="title">نموذج استئذان طالب</div><div class="meta">${selectedSchool?.name || 'المدرسة'} — ${createdAtLabel}</div></div><div class="badge">${statusLabel}</div></div>
      <div class="grid"><div class="box"><div class="label">الطالب</div><div class="value">${pass.studentName || '—'}</div></div><div class="box"><div class="label">الفصل</div><div class="value">${pass.className || pass.companyName || '—'}</div></div>
      <div class="box"><div class="label">المعلم</div><div class="value">${pass.teacherName || '—'}</div></div><div class="box"><div class="label">الوجهة</div><div class="value">${destinationLabel}</div></div>
      <div class="box wide"><div class="label">سبب الاستئذان</div><div class="value">${pass.reason || '—'}</div></div><div class="box wide"><div class="label">الملاحظات</div><div class="value">${pass.note || 'لا توجد ملاحظات إضافية'}</div></div>
      ${pass.guardianName || pass.guardianMobile ? `<div class="box"><div class="label">ولي الأمر</div><div class="value">${pass.guardianName || '—'}</div></div><div class="box"><div class="label">جوال ولي الأمر</div><div class="value">${pass.guardianMobile || '—'}</div></div>` : ''}</div>
      <div class="timeline"><div><strong>إنشاء الطلب:</strong> ${createdAtLabel}</div><div><strong>اطلاع المعلم:</strong> ${pass.viewedAt ? formatDateTime(pass.viewedAt) : '—'}</div><div><strong>اعتماد/تنفيذ:</strong> ${approvalLabel}</div></div>
      <div class="footer"><div class="sign">توقيع الجهة الطالبة</div><div class="sign">توقيع مستلم الطالب / الجهة المستقبلة</div></div></div><script>window.print();</script></body></html>`);
    popup.document.close();
  };

  useEffect(() => {
    if (!form.studentId && students[0]) {
      setForm((prev) => ({ ...prev, studentId: String(students[0].id) }));
    }
  }, [students, form.studentId]);

  useEffect(() => {
    if (!selectedId && managedRows[0]) {
      setSelectedId(String(managedRows[0].id));
    }
  }, [managedRows, selectedId]);

  useEffect(() => {
    if (!initialPassId) return;
    setSelectedId(String(initialPassId));
    if (String(currentUser?.role || '') === 'teacher') {
      onMarkViewed?.(initialPassId);
      clearLeavePassParam();
    }
  }, [initialPassId, currentUser, onMarkViewed]);

  useEffect(() => {
    if (!selectedStudent || form.teacherUserId) return;
    const normalizedClass = String(selectedStudent.classroomName || selectedStudent.className || selectedStudent.companyName || '').trim();
    const matchedTeacher = teacherUsers.find((teacher) => String(teacher.className || teacher.companyName || '').trim() && String(teacher.className || teacher.companyName || '').trim() === normalizedClass);
    if (matchedTeacher) {
      setForm((prev) => ({ ...prev, teacherUserId: String(matchedTeacher.id) }));
    }
  }, [selectedStudent, form.teacherUserId, teacherUsers]);

  const handleCreate = async () => {
    const result = await onCreateLeavePass?.(form);
    if (result?.ok && result?.leavePass?.id) {
      setSelectedId(String(result.leavePass.id));
      window.alert(result.message || 'تم إنشاء الاستئذان بنجاح.');
    } else {
      window.alert(result?.message || 'تعذر إنشاء الاستئذان.');
    }
  };

  const openManualWhatsapp = async (pass) => {
    const result = await onSendLeavePass?.(pass?.id, 'manual');
    if (result?.ok && result?.whatsAppUrl) {
      window.open(result.whatsAppUrl, '_blank');
    }
    window.alert(result?.message || (result?.ok ? 'تم تجهيز رابط الواتساب.' : 'تعذر تنفيذ الإرسال اليدوي.'));
  };

  const sendSystem = async (pass) => {
    if (!pass?.id) return;
    setSendingPassId(pass.id);
    setSendPassStatus('');
    const result = await onSendLeavePass?.(pass?.id, 'system');
    setSendingPassId(null);
    setSendPassStatus(result?.message || (result?.ok ? 'تم الإرسال عبر النظام بنجاح.' : 'تعذر الإرسال عبر النظام.'));
    setTimeout(() => setSendPassStatus(''), 5000);
  };

  const isTeacher = String(currentUser?.role || '') === 'teacher';
  const principalColumns = [
    { key: 'studentName', label: 'الطالب' },
    { key: 'teacherName', label: 'المعلم' },
    { key: 'destinationLabel', label: 'الوجهة' },
    { key: 'statusLabel', label: 'الحالة', render: (row) => <Badge tone={getLeavePassStatusTone(row.status)}>{getLeavePassStatusLabel(row.status)}</Badge> },
    { key: 'createdAtLabel', label: 'الوقت' },
    { key: 'queueLabel', label: 'المتابعة', render: (row) => <Badge tone={row.queueTone || 'blue'}>{row.queueLabel || 'جديد'}</Badge> },
    ...(isTeacher ? [{ key: 'actions', label: 'الإجراء', render: (row) => (
      <div className="flex flex-wrap gap-1.5">
        <button onClick={(e) => { e.stopPropagation(); onMarkViewed?.(row.id); }} className="inline-flex items-center gap-1 rounded-xl bg-sky-700 px-3 py-1.5 text-xs font-bold text-white"><BadgeCheck className="h-3 w-3" /> تم الاطلاع</button>
        <button onClick={(e) => { e.stopPropagation(); setCompletionEffect({ id: row.id, type: 'exit', studentName: row.studentName }); onUpdateLeavePassStatus?.(row.id, 'completed'); setTimeout(() => { setRecentlyCompleted((prev) => new Set([...prev, row.id])); setCompletionEffect(null); }, 2500); }} className="inline-flex items-center gap-1 rounded-xl bg-emerald-600 px-3 py-1.5 text-xs font-bold text-white"><ClipboardCheck className="h-3 w-3" /> خرج الطالب</button>
      </div>
    ) }] : []),
    ...(!isTeacher && (canCreate || viewMode === 'agent' || viewMode === 'counselor') ? [{ key: 'adminActions', label: 'الإجراء', render: (row) => (
      <div className="flex flex-wrap gap-1.5">
        {row.destination === 'agent' ? <button onClick={(e) => { e.stopPropagation(); onUpdateLeavePassStatus?.(row.id, 'approved-agent'); }} className="inline-flex items-center gap-1 rounded-xl bg-indigo-600 px-2 py-1 text-xs font-bold text-white"><ShieldCheck className="h-3 w-3" /> اعتماد</button> : null}
        {row.destination === 'counselor' ? <button onClick={(e) => { e.stopPropagation(); onUpdateLeavePassStatus?.(row.id, 'approved-counselor'); }} className="inline-flex items-center gap-1 rounded-xl bg-indigo-600 px-2 py-1 text-xs font-bold text-white"><ShieldCheck className="h-3 w-3" /> اعتماد</button> : null}
        {row.destination === 'guardian' ? <button onClick={(e) => { e.stopPropagation(); onUpdateLeavePassStatus?.(row.id, 'released-guardian'); }} className="inline-flex items-center gap-1 rounded-xl bg-emerald-700 px-2 py-1 text-xs font-bold text-white"><UserCheck className="h-3 w-3" /> تسليم</button> : null}
        <button onClick={(e) => { e.stopPropagation(); setCompletionEffect({ id: row.id, type: 'complete', studentName: row.studentName }); onUpdateLeavePassStatus?.(row.id, 'completed'); setTimeout(() => { setRecentlyCompleted((prev) => new Set([...prev, row.id])); setCompletionEffect(null); }, 2500); }} className="inline-flex items-center gap-1 rounded-xl bg-emerald-600 px-2 py-1 text-xs font-bold text-white"><ClipboardCheck className="h-3 w-3" /> إقفال</button>
        <button onClick={(e) => { e.stopPropagation(); onUpdateLeavePassStatus?.(row.id, 'cancelled'); }} className="inline-flex items-center gap-1 rounded-xl bg-rose-600 px-2 py-1 text-xs font-bold text-white"><Trash2 className="h-3 w-3" /> إلغاء</button>
      </div>
    ) }] : []),
  ];

  const preparedRows = managedRows.map((row) => ({
    ...row,
    destinationLabel: getLeavePassDestinationLabel(row.destination),
    statusLabel: getLeavePassStatusLabel(row.status),
    createdAtLabel: row.createdAt ? new Intl.DateTimeFormat('ar-SA', { dateStyle: 'short', timeStyle: 'short' }).format(new Date(row.createdAt)) : '—',
    queueLabel: getLeavePassQueueMeta(row).label,
    queueTone: getLeavePassQueueMeta(row).tone,
  }));


  const renderCompletionEffect = () => {
    if (!completionEffect) return null;
    return (
      <AnimatePresence>
        <motion.div
          key={completionEffect.id}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          style={{ position: 'fixed', inset: 0, zIndex: 9999, pointerEvents: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
        >
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 0.15, 0] }}
            transition={{ duration: 0.5 }}
            style={{ position: 'absolute', inset: 0, background: '#10b981' }}
          />
          <motion.div
            initial={{ scale: 0.3, opacity: 0, y: 40 }}
            animate={{ scale: [0.3, 1.15, 1], opacity: [0, 1, 1], y: [40, -10, 0] }}
            exit={{ scale: 0.8, opacity: 0, y: -30 }}
            transition={{ duration: 0.5, ease: 'backOut' }}
            style={{ background: 'linear-gradient(135deg, #10b981, #059669)', borderRadius: 32, padding: '28px 40px', textAlign: 'center', color: '#fff', boxShadow: '0 24px 64px #10b98188', minWidth: 260 }}
          >
            <motion.div animate={{ scale: [1, 1.3, 1] }} transition={{ duration: 0.4, delay: 0.2 }} style={{ fontSize: 52, lineHeight: 1 }}>{'\u2705'}</motion.div>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }} style={{ marginTop: 12, fontSize: 20, fontWeight: 900, fontFamily: 'Tajawal, sans-serif' }}>
              {completionEffect.type === 'exit' ? '\u062A\u0645 \u062E\u0631\u0648\u062C \u0627\u0644\u0637\u0627\u0644\u0628' : '\u062A\u0645 \u0625\u0642\u0641\u0627\u0644 \u0627\u0644\u0637\u0644\u0628'}
            </motion.div>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.35 }} style={{ marginTop: 6, fontSize: 14, opacity: 0.85, fontFamily: 'Tajawal, sans-serif' }}>
              {completionEffect.studentName}
            </motion.div>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.45 }} style={{ marginTop: 8, fontSize: 11, opacity: 0.7, fontFamily: 'Tajawal, sans-serif' }}>
              {'\u062A\u0645 \u0646\u0642\u0644 \u0627\u0644\u0637\u0644\u0628 \u0644\u0644\u0633\u062C\u0644'}
            </motion.div>
          </motion.div>
        </motion.div>
      </AnimatePresence>
    );
  };

  return (
    <div className="space-y-6">
      <SectionCard title={pageMeta.title} icon={viewMode === 'agent' ? ShieldCheck : viewMode === 'counselor' ? UserCheck : ClipboardList} description={pageMeta.description}>
        <div className="grid gap-4 md:grid-cols-5">
          <SummaryBox label="إجمالي الطلبات" value={formatEnglishDigits(leavePasses.length)} color="text-slate-900" />
          <SummaryBox label="بانتظار اطلاع المعلم" value={formatEnglishDigits(leavePasses.filter((item) => ['created','sent-system','sent-manual'].includes(String(item.status || ''))).length)} color="text-amber-700" />
          <SummaryBox label="اطلع المعلم" value={formatEnglishDigits(leavePasses.filter((item) => String(item.status || '') === 'viewed').length)} color="text-sky-700" />
          <SummaryBox label="اعتماد الجهة" value={formatEnglishDigits(leavePasses.filter((item) => ['approved-agent','approved-counselor','released-guardian'].includes(String(item.status || ''))).length)} color="text-sky-700" />
          <SummaryBox label="تم التنفيذ" value={formatEnglishDigits(leavePasses.filter((item) => String(item.status || '') === 'completed').length)} color="text-emerald-700" />
        </div>
      </SectionCard>

      {renderCompletionEffect()}
      {canCreate && (
        <SectionCard title={viewMode === 'main' ? "لوحة المتابعة اليومية" : "لوحة متابعة الجهة"} icon={FileClock} description={viewMode === 'main' ? "تعرض الطلبات الجارية الآن، وما تأخر على المعلم أو ما يحتاج إقفالًا سريعًا من الإدارة." : "تعرض الطلبات المحالة إلى هذه الجهة مع الحالات التي تحتاج اعتمادًا أو إقفالًا سريعًا."}>
          <div className="grid gap-4 xl:grid-cols-[0.95fr_2.05fr]">
            <div className="space-y-3">
              <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-1">
                {[
                  ['active', 'الطلبات الجارية', boardSummary.active, 'text-slate-900'],
                  ['waitingTeacher', 'بانتظار المعلم', boardSummary.waitingTeacher, 'text-amber-700'],
                  ['needsClosure', 'بانتظار الإقفال', boardSummary.needsClosure, 'text-sky-700'],
                  ['overdue', 'طلبات متأخرة', boardSummary.overdue, 'text-rose-700'],
                  ['today', 'طلبات اليوم', boardSummary.today, 'text-violet-700'],
                ].map(([key, label, value, tone]) => (
                  <button key={key} onClick={() => setBoardFilter(String(key))} className={cx('rounded-3xl border p-4 text-right transition', boardFilter === key ? 'border-sky-300 bg-sky-50' : 'border-slate-200 bg-white hover:bg-slate-50')}>
                    <div className="text-xs font-bold text-slate-500">{label}</div>
                    <div className={cx('mt-2 text-3xl font-black', tone)}>{formatEnglishDigits(value)}</div>
                  </button>
                ))}
              </div>
            </div>
            <div className="rounded-3xl bg-slate-50 p-4 ring-1 ring-slate-200">
              <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
                <div>
                  <div className="text-sm font-black text-slate-800">طلبات تحتاج متابعة</div>
                  <div className="mt-1 text-xs text-slate-500">يتم ترتيبها تلقائيًا بحسب الأشد حاجة للتدخل أولًا.</div>
                </div>
                <div className="flex flex-wrap gap-2">
                  <button onClick={() => setBoardFilter('active')} className="rounded-2xl bg-white px-3 py-2 text-xs font-black text-slate-700 ring-1 ring-slate-200">الكل الجاري</button>
                  <button onClick={() => setBoardFilter('overdue')} className="rounded-2xl bg-white px-3 py-2 text-xs font-black text-rose-700 ring-1 ring-rose-200">المتأخر فقط</button>
                </div>
              </div>
              <div className="grid gap-3 md:grid-cols-2">
                {boardRows.length ? boardRows.slice(0, 8).map((pass) => (
                  <button key={pass.id} onClick={() => setSelectedId(String(pass.id))} className={cx('rounded-3xl border p-4 text-right transition hover:shadow-sm', pass.queueMeta?.cardClass || 'border-slate-200 bg-white', String(selectedId) === String(pass.id) ? 'ring-2 ring-sky-300' : 'ring-1 ring-transparent')}>
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="text-base font-black text-slate-900">{pass.studentName}</div>
                        <div className="mt-1 text-xs text-slate-500">{pass.className || pass.companyName || '—'} — {pass.teacherName || '—'}</div>
                      </div>
                      <Badge tone={pass.queueMeta?.tone || 'blue'}>{pass.queueMeta?.label || 'جديد'}</Badge>
                    </div>
                    <div className="mt-3 flex flex-wrap gap-2 text-[11px] font-bold text-slate-600">
                      <span className="rounded-full bg-white/80 px-3 py-1 ring-1 ring-slate-200">{getLeavePassDestinationLabel(pass.destination)}</span>
                      <span className="rounded-full bg-white/80 px-3 py-1 ring-1 ring-slate-200">{getLeavePassElapsedLabel(pass)}</span>
                      <span className="rounded-full bg-white/80 px-3 py-1 ring-1 ring-slate-200">{getLeavePassStatusLabel(pass.status)}</span>
                    </div>
                    <div className="mt-3 text-sm leading-6 text-slate-700">{pass.reason || 'لا يوجد سبب مكتوب.'}</div>
                  </button>
                )) : <div className="md:col-span-2 rounded-3xl bg-white p-6 text-sm font-bold text-slate-500 ring-1 ring-slate-200">لا توجد طلبات ضمن هذا التصنيف حاليًا.</div>}
              </div>
            </div>
          </div>
        </SectionCard>
      )}

      {canCreate && selectedPass && (
        <SectionCard title="تفاصيل الاستئذان المحدد" icon={ClipboardCheck}>
          <div className="grid gap-4 lg:grid-cols-2">
            <div className="space-y-3">
              <div className="rounded-2xl bg-slate-50 p-4 ring-1 ring-slate-200">
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div><span className="text-xs text-slate-500 block">الطالب</span><span className="font-black text-slate-900">{selectedPass.studentName || '—'}</span></div>
                  <div><span className="text-xs text-slate-500 block">الفصل</span><span className="font-black text-slate-900">{selectedPass.className || selectedPass.companyName || '—'}</span></div>
                  <div><span className="text-xs text-slate-500 block">المعلم</span><span className="font-black text-slate-900">{selectedPass.teacherName || '—'}</span></div>
                  <div><span className="text-xs text-slate-500 block">الوجهة</span><span className="font-black text-slate-900">{getLeavePassDestinationLabel(selectedPass.destination)}</span></div>
                  <div><span className="text-xs text-slate-500 block">الحالة</span><Badge tone={getLeavePassStatusTone(selectedPass.status)}>{getLeavePassStatusLabel(selectedPass.status)}</Badge></div>
                  <div><span className="text-xs text-slate-500 block">السبب</span><span className="font-bold text-slate-700">{selectedPass.reason || '—'}</span></div>
                </div>
              </div>
            </div>
            <div className="space-y-3">
              <div className="rounded-2xl bg-slate-50 p-4 ring-1 ring-slate-200">
                <div className="mb-3 text-sm font-black text-slate-800">إرسال إشعار للمعلم</div>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => sendSystem(selectedPass)}
                    disabled={sendingPassId === selectedPass.id}
                    className={`inline-flex items-center gap-2 rounded-2xl px-4 py-3 text-sm font-black text-white transition-all ${sendingPassId === selectedPass.id ? 'bg-emerald-400 cursor-not-allowed' : 'bg-emerald-700 hover:bg-emerald-800'}`}
                  >
                    {sendingPassId === selectedPass.id ? 'جارِ الإرسال...' : 'إرسال من النظام'}
                  </button>
                  <button
                    onClick={() => openManualWhatsapp(selectedPass)}
                    className="inline-flex items-center gap-2 rounded-2xl bg-[#25D366] px-4 py-3 text-sm font-black text-white"
                  >
                    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
                    واتساب يدوي
                  </button>
                  <button onClick={() => printLeavePass(selectedPass)} className="inline-flex items-center gap-2 rounded-2xl bg-slate-700 px-4 py-3 text-sm font-black text-white">طباعة</button>
                </div>
                {sendPassStatus ? <div className={`mt-3 rounded-2xl px-4 py-3 text-sm font-bold ${/نجاح|بنجاح/.test(sendPassStatus) ? 'bg-emerald-50 text-emerald-800 ring-1 ring-emerald-200' : 'bg-amber-50 text-amber-800 ring-1 ring-amber-200'}`}>{sendPassStatus}</div> : null}
              </div>
            </div>
          </div>
        </SectionCard>
      )}

      {canCreate && (
        <SectionCard title="إنشاء استئذان جديد" icon={Plus} description="اختر الطالب والمعلم والوجهة، ثم أنشئ الطلب ليظهر معه رابط خاص يمكن مشاركته مع المعلم.">
          <div className="grid gap-4 lg:grid-cols-2">
            <Select label="الفصل" value={form.classFilter || ''} onChange={(e) => setForm((prev) => ({ ...prev, classFilter: e.target.value, studentId: '' }))}>
              <option value="">اختر الفصل أولاً</option>
              {[...new Set(students.map((s) => getStudentGroupingLabel(s, selectedSchool)).filter(Boolean))].sort().map((cls) => <option key={cls} value={cls}>{cls}</option>)}
            </Select>
            <Select label="الطالب" value={form.studentId} onChange={(e) => setForm((prev) => ({ ...prev, studentId: e.target.value }))} disabled={!form.classFilter}>
              <option value="">{form.classFilter ? 'اختر الطالب' : 'اختر الفصل أولاً'}</option>
              {(form.classFilter ? students.filter((s) => getStudentGroupingLabel(s, selectedSchool) === form.classFilter) : students).map((student) => <option key={student.id} value={student.id}>{student.name || student.fullName || "طالب"} — {getStudentGroupingLabel(student, selectedSchool)}</option>)}
            </Select>
            <Select label="المعلم المستهدف" value={form.teacherUserId} onChange={(e) => setForm((prev) => ({ ...prev, teacherUserId: e.target.value }))}>
              <option value="">اختر المعلم</option>
              {teacherUsers.map((teacher) => <option key={teacher.id} value={teacher.id}>{teacher.name}{teacher.mobile ? ` — ${teacher.mobile}` : ''}</option>)}
            </Select>
            <Select label="الوجهة" value={form.destination} onChange={(e) => setForm((prev) => ({ ...prev, destination: e.target.value }))}>
              <option value="agent">الوكيل</option>
              <option value="counselor">المرشد</option>
              <option value="guardian">الخروج مع ولي الأمر</option>
            </Select>
            <Select label="طريقة الإرسال الافتراضية" value={form.sendChannel} onChange={(e) => setForm((prev) => ({ ...prev, sendChannel: e.target.value }))}>
              <option value="system">من خلال النظام</option>
              <option value="manual">واتساب يدوي</option>
            </Select>
            <Input label="اسم ولي الأمر (اختياري)" value={form.guardianName} onChange={(e) => setForm((prev) => ({ ...prev, guardianName: e.target.value }))} placeholder="يُفضّل عند الخروج مع ولي الأمر" />
            <Input label="جوال ولي الأمر (اختياري)" value={form.guardianMobile} onChange={(e) => setForm((prev) => ({ ...prev, guardianMobile: e.target.value }))} placeholder="9665XXXXXXXX" />
            <div className="lg:col-span-2">
              <Input label="سبب الاستئذان" value={form.reason} onChange={(e) => setForm((prev) => ({ ...prev, reason: e.target.value }))} placeholder="مثال: مراجعة الوكيل / موعد ولي أمر / ظرف طارئ" />
            </div>
            <label className="block lg:col-span-2">
              <span className="mb-2 block text-sm font-bold text-slate-700">ملاحظات إضافية</span>
              <textarea value={form.note} onChange={(e) => setForm((prev) => ({ ...prev, note: e.target.value }))} rows={3} className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none" placeholder="أي تعليمات يحتاجها المعلم أو الجهة المستقبلة" />
            </label>
          </div>
          <div className="mt-4 flex flex-wrap gap-3">
            <button onClick={handleCreate} className="inline-flex items-center gap-2 rounded-2xl bg-sky-700 px-5 py-3 font-bold text-white"><Plus className="h-4 w-4" /> إنشاء الطلب</button>
            <div className="rounded-2xl bg-slate-50 px-4 py-3 text-sm text-slate-600 ring-1 ring-slate-200">المعلم يُحدد الآن يدويًا من معلمي المدرسة، ويمكن لاحقًا ربطه تلقائيًا بالحصة أو الجدول.</div>
          </div>
        </SectionCard>
      )}

      <SectionCard title={viewMode === 'main' ? (canCreate ? 'سجل الاستئذان' : 'طلبات الاستئذان الواردة') : (viewMode === 'agent' ? 'طلبات الوكيل' : 'طلبات المرشد')} icon={ClipboardCheck}>
          {viewMode !== 'main' ? <div className="mb-4 grid grid-cols-1 gap-3 md:grid-cols-3">
            <div className="rounded-2xl bg-slate-50 p-4 ring-1 ring-slate-200"><div className="text-sm text-slate-500">بانتظار الاعتماد</div><div className="mt-1 text-2xl font-black text-slate-900">{formatEnglishDigits(preparedRows.filter((item) => ['viewed','sent-system','sent-manual','created'].includes(String(item.status || ''))).length)}</div></div>
            <div className="rounded-2xl bg-slate-50 p-4 ring-1 ring-slate-200"><div className="text-sm text-slate-500">قيد التنفيذ</div><div className="mt-1 text-2xl font-black text-slate-900">{formatEnglishDigits(preparedRows.filter((item) => ['approved-agent','approved-counselor','released-guardian'].includes(String(item.status || ''))).length)}</div></div>
            <div className="rounded-2xl bg-slate-50 p-4 ring-1 ring-slate-200"><div className="text-sm text-slate-500">متأخرة</div><div className="mt-1 text-2xl font-black text-slate-900">{formatEnglishDigits(preparedRows.filter((item) => ['overdue-teacher','overdue-close'].includes(String(item.queueMeta?.key || item.queueKey || ''))).length)}</div></div>
          </div> : null}
          <DataTable columns={principalColumns} rows={preparedRows} onRowClick={(row) => setSelectedId(String(row.id))} emptyMessage={viewMode === 'main' ? (canCreate ? 'لا توجد طلبات استئذان بعد.' : 'لا توجد طلبات موجّهة لهذا المعلم.') : (viewMode === 'agent' ? 'لا توجد طلبات موجّهة إلى الوكيل.' : 'لا توجد طلبات موجّهة إلى المرشد.')} />
        </SectionCard>
    </div>
  );
}

export default LeavePassesPage;

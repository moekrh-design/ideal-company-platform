/**
 * ==========================================
 *  ParentAccountsPage Component
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
import { StatCard } from '../components/ui/StatCard';


import { Badge } from '../components/ui/FormElements';
function ParentAccountsPage({ currentUser, selectedSchool, onSendMessage, onNavigate }) {
  const [parentsTab, setParentsTab] = useState('accounts');
  const [state, setState] = useState({ loading: true, parents: [], summary: { total: 0, active: 0, pending: 0, extraContacts: 0 }, error: '', sending: '', detailLoading: '', detailError: '', detail: null, toggling: false });
  const [query, setQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  // --- Audit Feed State ---
  const [auditState, setAuditState] = useState({ loading: true, entries: [], summary: { total: 0, byAction: {}, schools: 0, parents: 0 }, error: '' });
  const [auditQuery, setAuditQuery] = useState('');
  const [auditActionFilter, setAuditActionFilter] = useState('all');
  const [auditScopeFilter, setAuditScopeFilter] = useState('all');
  const [auditActionNotice, setAuditActionNotice] = useState({ tone: '', text: '' });
  const [sendingEntryId, setSendingEntryId] = useState('');
  const [detailNote, setDetailNote] = useState('');
  const [reassigning, setReassigning] = useState(false);
  const [reassignTarget, setReassignTarget] = useState(null);
  const [reassignMobile, setReassignMobile] = useState('');
  const [reassignGuardianName, setReassignGuardianName] = useState('');
  const canManage = ['superadmin', 'admin', 'principal'].includes(String(currentUser?.role || ''));
  const load = useCallback(async () => {
    setState((current) => ({ ...current, loading: true, error: '' }));
    try {
      const response = await apiRequest('/api/admin/parents', { token: getSessionToken() });
      setState((current) => ({ ...current, loading: false, parents: Array.isArray(response.parents) ? response.parents : [], summary: response.summary || current.summary, error: '' }));
    } catch (error) {
      setState((current) => ({ ...current, loading: false, error: error.message || 'تعذر تحميل بيانات أولياء الأمور.' }));
    }
  }, []);
  useEffect(() => { load(); }, [load]);

  // --- Audit Feed Logic ---
  const loadAudit = useCallback(async () => {
    setAuditState((current) => ({ ...current, loading: true, error: '' }));
    try {
      const response = await apiRequest('/api/admin/parents/audit-feed', { token: getSessionToken() });
      setAuditState({ loading: false, entries: Array.isArray(response.entries) ? response.entries : [], summary: response.summary || { total: 0, byAction: {}, schools: 0, parents: 0 }, error: '' });
    } catch (error) {
      setAuditState((current) => ({ ...current, loading: false, error: error.message || 'تعذر تحميل السجل الرقابي.' }));
    }
  }, []);
  useEffect(() => { if (parentsTab === 'audit') loadAudit(); }, [parentsTab, loadAudit]);

  const auditActionOptions = useMemo(() => {
    const set = new Set();
    (auditState.entries || []).forEach((entry) => set.add(String(entry.action || '').trim()));
    return [...set].filter(Boolean);
  }, [auditState.entries]);

  const filteredAuditEntries = useMemo(() => {
    const q = String(auditQuery || '').trim().toLowerCase();
    return (auditState.entries || []).filter((entry) => {
      if (auditActionFilter !== 'all' && String(entry.action || '') !== auditActionFilter) return false;
      if (auditScopeFilter === 'school' && String(entry.scope || '') !== 'school') return false;
      if (auditScopeFilter === 'parent' && String(entry.scope || '') !== 'parent') return false;
      if (!q) return true;
      const haystack = [entry.title, entry.note, entry.actorName, entry.actorRole, entry.guardianName, entry.mobileMasked, entry.studentName, entry.schoolName].join(' ').toLowerCase();
      return haystack.includes(q);
    });
  }, [auditState.entries, auditQuery, auditActionFilter, auditScopeFilter]);

  const auditExportPrefix = `parent-audit-${selectedSchool?.code || selectedSchool?.id || 'school'}`;
  const auditExportColumns = [
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
  const auditExportRows = (filteredAuditEntries || []).map((entry) => ({
    ...entry,
    createdAt: entry.createdAt ? formatDateTime(entry.createdAt) : '—',
    actorRoleLabel: entry.actorRole === 'superadmin' ? 'أدمن عام' : entry.actorRole === 'principal' ? 'مدير مدرسة' : entry.actorRole === 'supervisor' ? 'مشرف' : entry.actorRole || 'إجراء',
    scopeLabel: entry.scope === 'school' ? 'عام على مستوى المدرسة' : 'خاص بولي أمر',
  }));
  const exportAudit = (mode = 'xlsx') => {
    if (mode === 'csv') { downloadFile(`${auditExportPrefix}.csv`, buildCsv(auditExportRows, auditExportColumns), 'text/csv;charset=utf-8;'); return; }
    exportRowsToWorkbook(`${auditExportPrefix}.xlsx`, 'ParentAudit', auditExportRows, auditExportColumns);
  };
  const printAudit = () => {
    const rowsHtml = auditExportRows.map((row) => `<tr>${auditExportColumns.map((column) => `<td style="border:1px solid #dbe3ef;padding:8px;text-align:right;font-size:12px">${String(row[column.key] ?? '').replace(/</g, '&lt;')}</td>`).join('')}</tr>`).join('');
    const popup = window.open('', '_blank', 'width=1200,height=900');
    if (!popup) return;
    popup.document.write(`<!doctype html><html lang="ar" dir="rtl"><head><meta charset="utf-8" /><title>سجل أولياء الأمور</title><style>body{font-family:Arial,sans-serif;padding:24px;color:#0f172a}h1{margin:0 0 8px;font-size:22px}p{margin:0 0 18px;color:#475569}table{width:100%;border-collapse:collapse}th{background:#f8fafc;border:1px solid #dbe3ef;padding:10px;text-align:right;font-size:12px}</style></head><body><h1>سجل أولياء الأمور الرقابي</h1><p>إجمالي السجلات: ${auditExportRows.length}</p><table><thead><tr>${auditExportColumns.map((column) => `<th>${column.label}</th>`).join('')}</tr></thead><tbody>${rowsHtml || '<tr><td colspan="11" style="padding:16px;text-align:center">لا توجد بيانات</td></tr>'}</tbody></table></body></html>`);
    popup.document.close(); popup.focus(); popup.print();
  };
  const canSendFollowupForEntry = useCallback((entry) => {
    if (!selectedSchool || !entry || !onSendMessage) return false;
    if (!entry.studentId || !entry.mobile) return false;
    return Number(entry.schoolId || 0) === Number(selectedSchool.id || 0);
  }, [selectedSchool, onSendMessage]);
  const openEntryContext = useCallback((entry) => {
    if (!entry) return;
    const actionKey = String(entry.action || '').toLowerCase();
    if (/primary|portal|policy|request|approve|reject|rollback/.test(actionKey)) { window.open('/admin/parent-primary-requests', '_blank', 'noopener,noreferrer'); return; }
    if (onNavigate) onNavigate('parentsAdmin');
  }, [onNavigate]);
  const sendFollowupForEntry = useCallback(async (entry) => {
    if (!canSendFollowupForEntry(entry)) { setAuditActionNotice({ tone: 'rose', text: 'لا يمكن إرسال متابعة لهذا السجل من المدرسة الحالية. اختر المدرسة المرتبطة بالسجل أولًا.' }); return; }
    const extraNote = window.prompt('اكتب نص متابعة مختصرًا سيُرسل لولي الأمر، أو اتركه فارغًا لاستخدام النص الافتراضي.', String(entry.note || '').trim()) || '';
    const subject = `متابعة إدارية: ${entry.title || 'سجل ولي أمر'}`;
    const message = extraNote.trim() || `نحيطكم علمًا بأنه تمت مراجعة السجل المرتبط بالطالب {اسم_الطالب} في ${selectedSchool?.name || 'المدرسة'}، ويمكنكم التواصل مع إدارة المدرسة عند الحاجة.`;
    try {
      setSendingEntryId(String(entry.id || 'sending'));
      const result = await onSendMessage({ audience: `students:${entry.studentId}`, audienceLabel: `متابعة ولي أمر: ${entry.studentName || entry.guardianName || 'طالب'}`, channel: 'whatsapp', subject, message, sendMode: 'now' });
      if (!result?.ok) throw new Error(result?.message || 'تعذر إرسال المتابعة.');
      setAuditActionNotice({ tone: 'green', text: result.message || `تم إرسال متابعة إلى ولي أمر ${entry.studentName || entry.guardianName || 'الطالب'}.` });
    } catch (error) {
      setAuditActionNotice({ tone: 'rose', text: error?.message || 'تعذر إرسال المتابعة من السجل.' });
    } finally { setSendingEntryId(''); }
  }, [canSendFollowupForEntry, onSendMessage, selectedSchool]);

  const filteredParents = useMemo(() => {
    const q = String(query || '').trim().toLowerCase();
    return (state.parents || []).filter((item) => {
      if (statusFilter !== 'all') {
        if (statusFilter === 'pending' && item.primaryChangeRequest?.status !== 'pending') return false;
        if (statusFilter === 'active' && item.status !== 'active') return false;
        if (statusFilter === 'idle' && item.status !== 'idle') return false;
        if (statusFilter === 'suspended' && !item.accountControl?.suspended) return false;
      }
      if (!q) return true;
      const haystack = [item.guardianName, item.mobile, ...(item.schoolNames || []), ...(item.studentNames || [])].join(' ').toLowerCase();
      return haystack.includes(q);
    });
  }, [state.parents, query, statusFilter]);
  const sendAccessCode = async (mobile, channel = 'whatsapp') => {
    setState((current) => ({ ...current, sending: mobile }));
    try {
      const response = await apiRequest('/api/admin/parents/send-access-code', { method: 'POST', token: getSessionToken(), body: { mobile, channel } });
      const suffix = response.previewCode ? `\nرمز التجربة: ${response.previewCode}` : '';
      window.alert((response.message || 'تم تنفيذ العملية بنجاح.') + suffix);
      await load();
    } catch (error) {
      window.alert(error.message || 'تعذر إرسال الرمز.');
    } finally {
      setState((current) => ({ ...current, sending: '' }));
    }
  };
  const generateDirectLink = async (mobile, guardianName) => {
    setState((current) => ({ ...current, generatingLink: mobile }));
    try {
      const baseUrl = window.location.origin;
      const response = await apiRequest('/api/admin/parents/generate-link', { method: 'POST', token: getSessionToken(), body: { mobile, baseUrl } });
      if (response.link) {
        try { await navigator.clipboard.writeText(response.link); } catch {}
        setState((current) => ({ ...current, linkModal: { link: response.link, mobile, guardianName: guardianName || 'ولي الأمر', whatsappUrl: `https://wa.me/${mobile.replace(/[^0-9]/g,'')}?text=${encodeURIComponent(`رابط دخول بوابة ولي الأمر:\n${response.link}\nصالح لمدة 10 دقائق.`)}` } }));
      }
    } catch (error) {
      window.alert(error.message || 'تعذر إنشاء الرابط.');
    } finally {
      setState((current) => ({ ...current, generatingLink: '' }));
    }
  };
  const openDetail = async (mobile) => {
    setState((current) => ({ ...current, detailLoading: mobile, detailError: '', detail: null }));
    setDetailNote('');
    try {
      const response = await apiRequest(`/api/admin/parents/details?mobile=${encodeURIComponent(mobile)}`, { token: getSessionToken() });
      setState((current) => ({ ...current, detailLoading: '', detail: response.parent || null, detailError: '' }));
      setDetailNote(response.parent?.accountControl?.note || '');
    } catch (error) {
      setState((current) => ({ ...current, detailLoading: '', detailError: error.message || 'تعذر تحميل التفاصيل.' }));
    }
  };
  const closeDetail = () => {
    setState((current) => ({ ...current, detail: null, detailError: '', detailLoading: '' }));
    setDetailNote('');
    setReassignTarget(null);
    setReassignMobile('');
    setReassignGuardianName('');
  };
  const toggleSuspension = async (suspended) => {
    if (!state.detail?.mobile || !canManage) return;
    setState((current) => ({ ...current, toggling: true }));
    try {
      const response = await apiRequest('/api/admin/parents/toggle-suspension', { method: 'POST', token: getSessionToken(), body: { mobile: state.detail.mobile, suspended, note: detailNote } });
      window.alert(response.message || (suspended ? 'تم تعليق الحساب.' : 'تمت إعادة التفعيل.'));
      await load();
      await openDetail(state.detail.mobile);
    } catch (error) {
      window.alert(error.message || 'تعذر تنفيذ العملية.');
    } finally {
      setState((current) => ({ ...current, toggling: false }));
    }
  };
  const openReassign = (student) => {
    setReassignTarget(student);
    setReassignMobile('');
    setReassignGuardianName(detail?.guardianName || student?.guardianName || '');
  };
  const closeReassign = () => {
    if (reassigning) return;
    setReassignTarget(null);
    setReassignMobile('');
    setReassignGuardianName('');
  };
  const submitReassign = async () => {
    if (!detail?.mobile || !reassignTarget || !canManage) return;
    if (!String(reassignMobile || '').trim()) {
      window.alert('أدخل الرقم البديل أولًا حتى لا يبقى الطالب بلا ولي أمر أساسي.');
      return;
    }
    setReassigning(true);
    try {
      const response = await apiRequest('/api/admin/parents/reassign-student', { method: 'POST', token: getSessionToken(), body: { mobile: detail.mobile, schoolId: reassignTarget.schoolId, studentId: reassignTarget.studentId || reassignTarget.id, newMobile: reassignMobile, guardianName: reassignGuardianName } });
      window.alert(response.message || 'تم تنفيذ النقل بنجاح.');
      closeReassign();
      await load();
      await openDetail(detail.mobile);
    } catch (error) {
      window.alert(error.message || 'تعذر نقل الارتباط.');
    } finally {
      setReassigning(false);
    }
  };
  const summaryCards = [
    { label: 'إجمالي أولياء الأمور', value: state.summary.total || 0, tone: 'sky' },
    { label: 'نشطون مؤخرًا', value: state.summary.active || 0, tone: 'green' },
    { label: 'طلبات معلقة', value: state.summary.pending || 0, tone: 'amber' },
    { label: 'أرقام إضافية', value: state.summary.extraContacts || 0, tone: 'violet' },
  ];
  const exportPrefix = `parents-${selectedSchool?.code || selectedSchool?.id || 'school'}`;
  const parentExportColumns = [
    { key: 'guardianName', label: 'اسم ولي الأمر' },
    { key: 'mobileMasked', label: 'رقم الجوال' },
    { key: 'studentsCount', label: 'عدد الأبناء' },
    { key: 'schoolNames', label: 'المدارس', render: (row) => (row.schoolNames || []).join('، ') },
    { key: 'studentNames', label: 'الأبناء', render: (row) => (row.studentNames || []).join('، ') },
    { key: 'statusLabel', label: 'الحالة', render: (row) => row.accountControl?.suspended ? 'معلق' : row.primaryChangeRequest?.status === 'pending' ? 'طلب معلق' : row.status === 'active' ? 'نشط' : 'جاهز' },
    { key: 'preferredChannel', label: 'القناة المفضلة', render: (row) => row.notificationSettings?.preferredChannel === 'sms' ? 'SMS' : row.notificationSettings?.preferredChannel === 'both' ? 'واتساب + SMS' : 'واتساب' },
    { key: 'latestLogin', label: 'آخر دخول', render: (row) => row.latestSession?.lastLoginAt ? formatDateTime(row.latestSession.lastLoginAt) : 'لا يوجد' },
    { key: 'extraContactsCount', label: 'الأرقام الإضافية' },
  ];
  const exportParentList = (format = 'xlsx') => {
    const rows = filteredParents || [];
    if (!rows.length) {
      window.alert('لا توجد بيانات قابلة للتصدير حاليًا.');
      return;
    }
    if (format === 'csv') {
      downloadFile(`${exportPrefix}-list.csv`, buildCsv(rows, parentExportColumns), 'text/csv;charset=utf-8;');
      return;
    }
    exportRowsToWorkbook(`${exportPrefix}-list.xlsx`, 'Parents', rows, parentExportColumns);
  };
  const printParentList = () => {
    const rows = filteredParents || [];
    if (!rows.length) {
      window.alert('لا توجد بيانات قابلة للطباعة حاليًا.');
      return;
    }
    const statsHtml = summaryCards.map((card) => `<div class="stat"><div class="k">${card.label}</div><div class="v">${card.value}</div></div>`).join('');
    const tableRows = rows.map((row, index) => `<tr><td>${index + 1}</td><td>${row.guardianName || '—'}</td><td>${row.mobileMasked || '—'}</td><td>${row.studentsCount || 0}</td><td>${(row.schoolNames || []).join('، ') || '—'}</td><td>${(row.studentNames || []).join('، ') || '—'}</td><td>${row.accountControl?.suspended ? 'معلق' : row.primaryChangeRequest?.status === 'pending' ? 'طلب معلق' : row.status === 'active' ? 'نشط' : 'جاهز'}</td><td>${row.latestSession?.lastLoginAt ? formatDateTime(row.latestSession.lastLoginAt) : 'لا يوجد'}</td></tr>`).join('');
    printHtmlContent('تقرير أولياء الأمور', `<h1>تقرير أولياء الأمور</h1><div class="meta">${selectedSchool?.name || 'المدرسة'} • ${formatDateTime(new Date().toISOString())}</div><div class="stats">${statsHtml}</div><table><thead><tr><th>#</th><th>ولي الأمر</th><th>الجوال</th><th>الأبناء</th><th>المدارس</th><th>الطلاب</th><th>الحالة</th><th>آخر دخول</th></tr></thead><tbody>${tableRows}</tbody></table>`);
  };
  const exportParentDetail = (format = 'xlsx') => {
    if (!detail) return;
    const overviewRows = [{
      guardianName: detail.guardianName || 'ولي الأمر',
      mobileMasked: detail.mobileMasked || detail.mobile || '—',
      studentsCount: (detail.students || []).length,
      totalPoints: detail.totalPoints || 0,
      averageAttendance: `${detail.averageAttendance || 0}%`,
      accountStatus: detail.accountControl?.suspended ? 'معلق' : 'مفعل',
      preferredChannel: detail.notificationSettings?.preferredChannel === 'sms' ? 'SMS' : detail.notificationSettings?.preferredChannel === 'both' ? 'واتساب + SMS' : 'واتساب',
      latestLogin: detail.latestSession?.lastLoginAt ? formatDateTime(detail.latestSession.lastLoginAt) : 'لا يوجد',
    }];
    const overviewColumns = [
      { key: 'guardianName', label: 'اسم ولي الأمر' },
      { key: 'mobileMasked', label: 'الرقم الأساسي' },
      { key: 'studentsCount', label: 'عدد الأبناء' },
      { key: 'totalPoints', label: 'مجموع النقاط' },
      { key: 'averageAttendance', label: 'متوسط الحضور' },
      { key: 'accountStatus', label: 'حالة الحساب' },
      { key: 'preferredChannel', label: 'القناة المفضلة' },
      { key: 'latestLogin', label: 'آخر دخول' },
    ];
    const auditRows = (detail.auditHistory || []).map((entry) => ({
      title: entry.title || 'إجراء',
      note: entry.note || '—',
      actorName: entry.actorName || '—',
      actorRole: entry.actorRole || '—',
      studentName: entry.studentName || '—',
      schoolName: entry.schoolName || '—',
      createdAt: entry.createdAt ? formatDateTime(entry.createdAt) : '—',
    }));
    const auditColumns = [
      { key: 'title', label: 'الإجراء' },
      { key: 'note', label: 'التفاصيل' },
      { key: 'actorName', label: 'المنفذ' },
      { key: 'actorRole', label: 'الدور' },
      { key: 'studentName', label: 'الطالب' },
      { key: 'schoolName', label: 'المدرسة' },
      { key: 'createdAt', label: 'الوقت' },
    ];
    if (format === 'csv') {
      const content = `${buildCsv(overviewRows, overviewColumns)}

${buildCsv(auditRows, auditColumns)}`;
      downloadFile(`${exportPrefix}-${detail.mobile || 'parent'}-detail.csv`, content, 'text/csv;charset=utf-8;');
      return;
    }
    const workbook = XLSX.utils.book_new();
    const overviewSheet = XLSX.utils.aoa_to_sheet([overviewColumns.map((col) => col.label), ...overviewRows.map((row) => overviewColumns.map((col) => row[col.key]))]);
    XLSX.utils.book_append_sheet(workbook, overviewSheet, 'Overview');
    const auditSheet = XLSX.utils.aoa_to_sheet([auditColumns.map((col) => col.label), ...auditRows.map((row) => auditColumns.map((col) => row[col.key]))]);
    XLSX.utils.book_append_sheet(workbook, auditSheet, 'Audit');
    XLSX.writeFile(workbook, `${exportPrefix}-${detail.mobile || 'parent'}-detail.xlsx`);
  };
  const printParentDetail = () => {
    if (!detail) return;
    const studentRows = (detail.students || []).map((student) => `<tr><td>${student.name || '—'}</td><td>${student.schoolName || '—'}</td><td>${student.className || '—'}</td><td>${student.points || 0}</td><td>${student.attendanceRate || 0}%</td><td>${student.status || '—'}</td></tr>`).join('');
    const auditRows = (detail.auditHistory || []).slice(0, 20).map((entry) => `<tr><td>${entry.title || 'إجراء'}</td><td>${entry.note || '—'}</td><td>${entry.actorName || '—'}</td><td>${entry.createdAt ? formatDateTime(entry.createdAt) : '—'}</td></tr>`).join('');
    printHtmlContent(`ملف ولي الأمر ${detail.guardianName || ''}`, `<h1>ملف ولي الأمر</h1><div class="meta">${detail.guardianName || 'ولي الأمر'} • ${detail.mobileMasked || detail.mobile || '—'} • ${selectedSchool?.name || 'المدرسة'}</div><div class="stats"><div class="stat"><div class="k">عدد الأبناء</div><div class="v">${(detail.students || []).length}</div></div><div class="stat"><div class="k">مجموع النقاط</div><div class="v">${detail.totalPoints || 0}</div></div><div class="stat"><div class="k">متوسط الحضور</div><div class="v">${detail.averageAttendance || 0}%</div></div><div class="stat"><div class="k">حالة الحساب</div><div class="v">${detail.accountControl?.suspended ? 'معلق' : 'مفعل'}</div></div></div><h1 style="font-size:20px;margin-top:24px">الأبناء المرتبطون</h1><table><thead><tr><th>الطالب</th><th>المدرسة</th><th>الفصل</th><th>النقاط</th><th>الحضور</th><th>الحالة</th></tr></thead><tbody>${studentRows || '<tr><td colspan="6">لا يوجد أبناء مرتبطون.</td></tr>'}</tbody></table><h1 style="font-size:20px;margin-top:24px">آخر السجل الرقابي</h1><table><thead><tr><th>الإجراء</th><th>التفاصيل</th><th>المنفذ</th><th>الوقت</th></tr></thead><tbody>${auditRows || '<tr><td colspan="4">لا يوجد سجل تغييرات.</td></tr>'}</tbody></table>`);
  };
  const detail = state.detail;
  const auditActionCards = [
    { label: 'إجمالي السجلات', value: auditState.summary.total || 0, tone: 'blue' },
    { label: 'السجلات العامة', value: (auditState.entries || []).filter((entry) => entry.scope === 'school').length, tone: 'amber' },
    { label: 'السجلات الفردية', value: (auditState.entries || []).filter((entry) => entry.scope !== 'school').length, tone: 'green' },
    { label: 'أولياء الأمور المشمولون', value: auditState.summary.parents || 0, tone: 'violet' },
  ];

  return (
    <div className="space-y-6">
      {/* تبويبات داخلية */}
      <div className="flex gap-2 rounded-2xl bg-slate-100 p-1.5 w-fit">
        <button onClick={() => setParentsTab('accounts')} className={`rounded-xl px-5 py-2 text-sm font-bold transition-all ${parentsTab === 'accounts' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>الأولياء المرتبطون</button>
        <button onClick={() => setParentsTab('audit')} className={`rounded-xl px-5 py-2 text-sm font-bold transition-all ${parentsTab === 'audit' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>السجل الرقابي</button>
      </div>

      {parentsTab === 'accounts' && <SectionCard title="أولياء الأمور" icon={Users} action={<div className="flex flex-wrap items-center gap-2"><button onClick={load} className="rounded-2xl bg-slate-100 px-4 py-2 text-sm font-bold text-slate-700">تحديث</button><button onClick={() => exportParentList('xlsx')} className="rounded-2xl bg-emerald-600 px-4 py-2 text-sm font-bold text-white">Excel</button><button onClick={() => exportParentList('csv')} className="rounded-2xl bg-sky-50 px-4 py-2 text-sm font-bold text-sky-700 ring-1 ring-sky-100">CSV</button><button onClick={printParentList} className="rounded-2xl bg-white px-4 py-2 text-sm font-bold text-slate-700 ring-1 ring-slate-200">طباعة / PDF</button><button onClick={() => window.open('/parent', '_blank', 'noopener,noreferrer')} className="rounded-2xl bg-sky-700 px-4 py-2 text-sm font-bold text-white">فتح البوابة</button></div>}>
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-4">{summaryCards.map((item) => <StatCard key={item.label} label={item.label} value={item.value} tone={item.tone} />)}</div>
        <div className="mt-4 grid grid-cols-1 gap-3 lg:grid-cols-[1.5fr,220px,auto]">
          <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="ابحث باسم ولي الأمر أو الطالب أو الرقم" className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-bold outline-none" />
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-bold outline-none">
            <option value="all">كل الحالات</option>
            <option value="active">نشطون</option>
            <option value="pending">لديهم طلبات معلقة</option>
            <option value="idle">بدون نشاط حديث</option>
            <option value="suspended">حسابات معلقة</option>
          </select>
          <a href="/admin/parent-primary-requests" target="_blank" rel="noreferrer" className="inline-flex items-center justify-center rounded-2xl bg-white px-4 py-3 text-sm font-bold text-slate-700 ring-1 ring-slate-200 hover:bg-slate-50">شاشة الطلبات</a>
        </div>
        {state.error ? <div className="mt-4 rounded-2xl bg-rose-50 px-4 py-3 text-sm font-bold text-rose-700 ring-1 ring-rose-100">{state.error}</div> : null}
        {state.loading ? <div className="mt-4 rounded-2xl bg-slate-50 px-4 py-10 text-center text-sm font-bold text-slate-500">جاري تحميل بيانات أولياء الأمور...</div> : null}
        {!state.loading && !filteredParents.length ? <div className="mt-4 rounded-2xl bg-slate-50 px-4 py-10 text-center text-sm font-bold text-slate-500">لا توجد حسابات مطابقة.</div> : null}
        <div className="mt-4 grid grid-cols-1 gap-4 xl:grid-cols-2">{filteredParents.map((item) => {
          const tone = item.accountControl?.suspended ? 'rose' : item.primaryChangeRequest?.status === 'pending' ? 'amber' : item.status === 'active' ? 'green' : 'slate';
          return <div key={item.mobile} className="rounded-[1.75rem] bg-white p-5 ring-1 ring-slate-200 shadow-sm">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <div className="text-lg font-black text-slate-900">{item.guardianName || 'ولي الأمر'}</div>
                <div className="mt-1 text-sm font-bold text-slate-500">{item.mobileMasked} • {item.studentsCount || 0} طالب/ـة</div>
                <div className="mt-2 flex flex-wrap gap-2">
                  <Badge tone={tone}>{item.accountControl?.suspended ? 'معلق' : item.primaryChangeRequest?.status === 'pending' ? 'طلب معلق' : item.status === 'active' ? 'نشط' : 'جاهز'}</Badge>
                  <Badge tone="blue">{(item.schoolNames || []).join('، ') || (selectedSchool?.name || 'المدرسة')}</Badge>
                  {item.extraContactsCount ? <Badge tone="violet">{item.extraContactsCount} أرقام إضافية</Badge> : null}
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                <button disabled={state.sending === item.mobile || String(currentUser?.role || '') === 'supervisor' || item.accountControl?.suspended} onClick={() => sendAccessCode(item.mobile, item.notificationSettings?.preferredChannel === 'sms' ? 'sms' : 'whatsapp')} className="rounded-2xl bg-emerald-600 px-4 py-2 text-sm font-bold text-white disabled:opacity-60">{state.sending === item.mobile ? 'جارِ الإرسال...' : 'إرسال رمز دخول'}</button>
                <button disabled={state.generatingLink === item.mobile || String(currentUser?.role || '') === 'supervisor' || item.accountControl?.suspended} onClick={() => generateDirectLink(item.mobile, item.guardianName)} className="rounded-2xl bg-violet-600 px-4 py-2 text-sm font-bold text-white disabled:opacity-60 flex items-center gap-1.5">
                  <ExternalLink size={14} />
                  {state.generatingLink === item.mobile ? 'جارِ الإنشاء...' : 'رابط دخول'}
                </button>
                <button onClick={() => openDetail(item.mobile)} className="rounded-2xl bg-sky-50 px-4 py-2 text-sm font-bold text-sky-700 ring-1 ring-sky-100">{state.detailLoading === item.mobile ? 'جارِ التحميل...' : 'التفاصيل'}</button>
              </div>
            </div>
            <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-2">
              <div className="rounded-2xl bg-slate-50 p-4 ring-1 ring-slate-200">
                <div className="text-xs font-black text-slate-500">آخر دخول</div>
                <div className="mt-2 text-sm font-bold text-slate-800">{item.latestSession?.lastLoginAt ? formatDateTime(item.latestSession.lastLoginAt) : 'لا يوجد دخول مسجل'}</div>
                <div className="mt-1 text-xs text-slate-500">القناة المفضلة: {item.notificationSettings?.preferredChannel === 'sms' ? 'SMS' : item.notificationSettings?.preferredChannel === 'both' ? 'واتساب + SMS' : 'واتساب'}</div>
              </div>
              <div className="rounded-2xl bg-slate-50 p-4 ring-1 ring-slate-200">
                <div className="text-xs font-black text-slate-500">طلب تغيير الرقم الأساسي</div>
                <div className="mt-2 text-sm font-bold text-slate-800">{item.primaryChangeRequest?.status === 'pending' ? `بانتظار الاعتماد إلى ${item.primaryChangeRequest.requestedMobileMasked || '—'}` : item.primaryChangeRequest?.status === 'approved' ? 'معتمد سابقًا' : 'لا يوجد طلب حالي'}</div>
                <div className="mt-1 text-xs text-slate-500">{item.primaryChangeRequest?.requestedAt ? formatDateTime(item.primaryChangeRequest.requestedAt) : '—'}</div>
              </div>
            </div>
            <div className="mt-4 rounded-2xl border border-slate-200 p-4">
              <div className="text-sm font-black text-slate-800">الطلاب المرتبطون</div>
              <div className="mt-3 flex flex-wrap gap-2">{(item.students || []).slice(0, 8).map((student) => <span key={`${item.mobile}-${student.studentId}`} className="rounded-full bg-slate-100 px-3 py-1.5 text-xs font-bold text-slate-700">{student.name} • {student.className || '—'}</span>)}</div>
            </div>
          </div>;
        })}</div>
      </SectionCard>}

      {parentsTab === 'accounts' && detail ? <div className="fixed inset-0 z-[100] bg-slate-950/40 p-4 backdrop-blur-sm" onClick={closeDetail}>
        <div className="mx-auto mt-6 max-h-[92vh] w-full max-w-6xl overflow-y-auto rounded-[2rem] bg-white p-6 shadow-2xl ring-1 ring-slate-200" onClick={(e) => e.stopPropagation()}>
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <div className="text-2xl font-black text-slate-900">تفاصيل ولي الأمر</div>
              <div className="mt-1 text-sm font-bold text-slate-500">{detail.guardianName || 'ولي الأمر'} • {detail.mobileMasked}</div>
              <div className="mt-2 flex flex-wrap gap-2">
                <Badge tone={detail.accountControl?.suspended ? 'rose' : 'green'}>{detail.accountControl?.suspended ? 'الحساب معلق' : 'الحساب مفعل'}</Badge>
                <Badge tone="blue">{detail.studentsCount || 0} طالب/ـة</Badge>
                <Badge tone="violet">{detail.extraContacts?.length || 0} أرقام إضافية</Badge>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              <button onClick={() => exportParentDetail('xlsx')} className="rounded-2xl bg-emerald-600 px-4 py-2 text-sm font-bold text-white">Excel</button>
              <button onClick={() => exportParentDetail('csv')} className="rounded-2xl bg-sky-50 px-4 py-2 text-sm font-bold text-sky-700 ring-1 ring-sky-100">CSV</button>
              <button onClick={printParentDetail} className="rounded-2xl bg-white px-4 py-2 text-sm font-bold text-slate-700 ring-1 ring-slate-200">طباعة / PDF</button>
              {canManage ? <>
                <button disabled={state.toggling || detail.accountControl?.suspended} onClick={() => toggleSuspension(true)} className="rounded-2xl bg-rose-600 px-4 py-2 text-sm font-bold text-white disabled:opacity-60">تعليق الحساب</button>
                <button disabled={state.toggling || !detail.accountControl?.suspended} onClick={() => toggleSuspension(false)} className="rounded-2xl bg-emerald-600 px-4 py-2 text-sm font-bold text-white disabled:opacity-60">إعادة التفعيل</button>
              </> : null}
              <button onClick={closeDetail} className="rounded-2xl bg-slate-100 px-4 py-2 text-sm font-bold text-slate-700">إغلاق</button>
            </div>
          </div>
          {state.detailError ? <div className="mt-4 rounded-2xl bg-rose-50 px-4 py-3 text-sm font-bold text-rose-700 ring-1 ring-rose-100">{state.detailError}</div> : null}
          <div className="mt-5 grid grid-cols-1 gap-4 lg:grid-cols-4">
            <StatCard label="إجمالي الطلاب" value={detail.studentsCount || 0} tone="sky" />
            <StatCard label="مجموع النقاط" value={detail.totalPoints || 0} tone="green" />
            <StatCard label="متوسط الحضور" value={`${detail.avgAttendance || 0}%`} tone="amber" />
            <StatCard label="سجل التنبيهات" value={(detail.notificationHistory || []).length} tone="violet" />
          </div>
          <div className="mt-5 grid grid-cols-1 gap-5 xl:grid-cols-[1.25fr_1fr]">
            <div className="space-y-5">
              <div className="rounded-[1.75rem] border border-slate-200 p-5">
                <div className="text-lg font-black text-slate-900">الأبناء المرتبطون</div>
                <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-2">{(detail.students || []).map((student) => <div key={`${detail.mobile}-${student.id || student.studentId}`} className="rounded-2xl bg-slate-50 p-4 ring-1 ring-slate-200"><div className="flex flex-wrap items-start justify-between gap-3"><div><div className="text-sm font-black text-slate-900">{student.name}</div><div className="mt-1 text-xs font-bold text-slate-500">{student.schoolName || 'المدرسة'} • {student.className || '—'}</div></div>{canManage ? <button onClick={() => openReassign(student)} className="rounded-2xl bg-white px-3 py-2 text-xs font-black text-slate-700 ring-1 ring-slate-200 hover:bg-slate-100">فك / نقل الارتباط</button> : null}</div><div className="mt-3 grid grid-cols-3 gap-2 text-center"><div className="rounded-2xl bg-white px-2 py-3 ring-1 ring-slate-200"><div className="text-lg font-black text-slate-900">{student.points || 0}</div><div className="text-[11px] font-bold text-slate-500">نقاط</div></div><div className="rounded-2xl bg-white px-2 py-3 ring-1 ring-slate-200"><div className="text-lg font-black text-slate-900">{student.attendanceRate || 0}%</div><div className="text-[11px] font-bold text-slate-500">حضور</div></div><div className="rounded-2xl bg-white px-2 py-3 ring-1 ring-slate-200"><div className="text-sm font-black text-slate-900">{student.status || '—'}</div><div className="text-[11px] font-bold text-slate-500">الحالة</div></div></div></div>)}</div>
              </div>
              <div className="rounded-[1.75rem] border border-slate-200 p-5">
                <div className="flex items-center justify-between gap-3"><div className="text-lg font-black text-slate-900">سجل التنبيهات والرسائل</div><Badge tone="blue">{(detail.notificationHistory || []).length} سجل</Badge></div>
                <div className="mt-4 space-y-3">{(detail.notificationHistory || []).length ? (detail.notificationHistory || []).slice(0, 12).map((entry) => <div key={entry.id} className="rounded-2xl bg-slate-50 p-4 ring-1 ring-slate-200"><div className="flex flex-wrap items-center justify-between gap-2"><div className="text-sm font-black text-slate-900">{entry.title || 'تنبيه'}</div><div className="flex flex-wrap gap-2"><Badge tone={entry.channel === 'sms' ? 'amber' : entry.channel === 'internal' ? 'slate' : 'green'}>{entry.channel === 'sms' ? 'SMS' : entry.channel === 'internal' ? 'داخلي' : 'واتساب'}</Badge><Badge tone={/نجاح/.test(String(entry.status || '')) ? 'green' : 'rose'}>{entry.status || '—'}</Badge></div></div><div className="mt-2 text-sm leading-7 text-slate-600">{entry.body || '—'}</div><div className="mt-2 text-xs font-bold text-slate-500">{entry.studentName ? `${entry.studentName} • ` : ''}{entry.recipientMasked || entry.recipient || '—'} • {entry.createdAt ? formatDateTime(entry.createdAt) : '—'}</div>{entry.reason ? <div className="mt-2 rounded-2xl bg-rose-50 px-3 py-2 text-xs font-bold text-rose-700 ring-1 ring-rose-100">سبب التعثر: {entry.reason}</div> : null}</div>) : <div className="rounded-2xl bg-slate-50 px-4 py-6 text-center text-sm font-bold text-slate-500">لا يوجد سجل تنبيهات حتى الآن.</div>}</div>
              </div>
              <div className="rounded-[1.75rem] border border-slate-200 p-5">
                <div className="flex items-center justify-between gap-3"><div className="text-lg font-black text-slate-900">سجل التغييرات الرقابي</div><Badge tone="violet">{(detail.auditHistory || []).length} إجراء</Badge></div>
                <div className="mt-2 text-sm font-bold text-slate-500">يعرض آخر الإجراءات الإدارية المهمة على ملف ولي الأمر لضمان سهولة المراجعة والتتبع.</div>
                <div className="mt-4 space-y-3">{(detail.auditHistory || []).length ? (detail.auditHistory || []).slice(0, 14).map((entry) => <div key={entry.id} className="rounded-2xl bg-slate-50 p-4 ring-1 ring-slate-200"><div className="flex flex-wrap items-center justify-between gap-2"><div className="text-sm font-black text-slate-900">{entry.title || 'إجراء إداري'}</div><Badge tone={/suspend|reject|rollback|disabled/i.test(String(entry.action || '')) ? 'rose' : /approve|reactivate|enabled/i.test(String(entry.action || '')) ? 'green' : /policy|send_access_code/i.test(String(entry.action || '')) ? 'amber' : 'blue'}>{entry.actorRole === 'superadmin' ? 'أدمن عام' : entry.actorRole === 'principal' ? 'مدير مدرسة' : entry.actorRole === 'supervisor' ? 'مشرف' : entry.actorRole || 'إجراء'}</Badge></div><div className="mt-2 text-sm leading-7 text-slate-600">{entry.note || '—'}</div><div className="mt-2 flex flex-wrap gap-2 text-xs font-bold text-slate-500"><span>{entry.createdAt ? formatDateTime(entry.createdAt) : '—'}</span>{entry.actorName ? <span>• {entry.actorName}</span> : null}{entry.studentName ? <span>• {entry.studentName}</span> : null}{entry.schoolName ? <span>• {entry.schoolName}</span> : null}</div></div>) : <div className="rounded-2xl bg-slate-50 px-4 py-6 text-center text-sm font-bold text-slate-500">لا يوجد سجل تغييرات محفوظ حتى الآن.</div>}</div>
              </div>
            </div>
            <div className="space-y-5">
              <div className="rounded-[1.75rem] border border-slate-200 p-5">
                <div className="text-lg font-black text-slate-900">الضبط والتحكم</div>
                <div className="mt-4 rounded-2xl bg-slate-50 p-4 ring-1 ring-slate-200"><div className="text-xs font-black text-slate-500">ملاحظة إدارية</div><textarea value={detailNote} onChange={(e) => setDetailNote(e.target.value)} placeholder="مثال: تعليق مؤقت حتى تحديث البيانات" className="mt-2 min-h-[90px] w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-bold outline-none" /></div>
                <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-2"><div className="rounded-2xl bg-slate-50 p-4 ring-1 ring-slate-200"><div className="text-xs font-black text-slate-500">آخر حالة</div><div className="mt-2 text-sm font-bold text-slate-900">{detail.accountControl?.suspended ? 'معلق من الإدارة' : 'مفعل'}</div><div className="mt-1 text-xs text-slate-500">{detail.accountControl?.updatedAt ? formatDateTime(detail.accountControl.updatedAt) : 'لم يتم تعديل الحالة من قبل'}</div></div><div className="rounded-2xl bg-slate-50 p-4 ring-1 ring-slate-200"><div className="text-xs font-black text-slate-500">طلب تغيير الرقم</div><div className="mt-2 text-sm font-bold text-slate-900">{detail.primaryChangeRequest?.status === 'pending' ? `معلّق إلى ${detail.primaryChangeRequest.requestedMobileMasked || '—'}` : detail.primaryChangeRequest?.status === 'approved' ? 'تم اعتماده' : detail.primaryChangeRequest?.status === 'rejected' ? 'مرفوض' : 'لا يوجد طلب'}</div><div className="mt-1 text-xs text-slate-500">{detail.primaryChangeRequest?.requestedAt ? formatDateTime(detail.primaryChangeRequest.requestedAt) : '—'}</div></div></div>
              </div>
              <div className="rounded-[1.75rem] border border-slate-200 p-5">
                <div className="text-lg font-black text-slate-900">سجل الدخول</div>
                <div className="mt-4 space-y-3">{(detail.sessions || []).length ? (detail.sessions || []).map((session) => <div key={session.id} className="rounded-2xl bg-slate-50 p-4 ring-1 ring-slate-200"><div className="flex flex-wrap items-center justify-between gap-2"><div className="text-sm font-black text-slate-900">{session.createdAt ? formatDateTime(session.createdAt) : '—'}</div><Badge tone={session.active ? 'green' : 'slate'}>{session.active ? 'نشطة' : 'منتهية'}</Badge></div><div className="mt-1 text-xs font-bold text-slate-500">تنتهي الجلسة: {session.expiresAt ? formatDateTime(session.expiresAt) : '—'}</div></div>) : <div className="rounded-2xl bg-slate-50 px-4 py-6 text-center text-sm font-bold text-slate-500">لا يوجد سجل دخول محفوظ.</div>}</div>
              </div>
              <div className="rounded-[1.75rem] border border-slate-200 p-5">
                <div className="text-lg font-black text-slate-900">أرقام التنبيه الإضافية</div>
                <div className="mt-4 flex flex-wrap gap-2">{(detail.extraContacts || []).length ? (detail.extraContacts || []).map((contact) => <span key={`${detail.mobile}-${contact.mobile}`} className="rounded-full bg-violet-50 px-3 py-2 text-xs font-bold text-violet-700 ring-1 ring-violet-100">{contact.mobileMasked} • {contact.channel === 'sms' ? 'SMS' : 'واتساب'} • {contact.label || 'رقم إضافي'}</span>) : <span className="text-sm font-bold text-slate-500">لا توجد أرقام إضافية مرتبطة.</span>}</div>
              </div>
            </div>
          {reassignTarget ? <div className="fixed inset-0 z-[110] bg-slate-950/40 p-4 backdrop-blur-sm" onClick={closeReassign}>
            <div className="mx-auto mt-20 w-full max-w-2xl rounded-[2rem] bg-white p-6 shadow-2xl ring-1 ring-slate-200" onClick={(e) => e.stopPropagation()}>
              <div className="text-2xl font-black text-slate-900">فك / نقل ارتباط الطالب</div>
              <div className="mt-2 text-sm font-bold text-slate-500">سيتم نقل {reassignTarget.name || 'الطالب'} إلى رقم ولي أمر أساسي بديل حفاظًا على التنبيهات وعدم ترك الطالب بلا ارتباط.</div>
              <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-2">
                <div>
                  <label className="text-xs font-black text-slate-500">الرقم الحالي</label>
                  <div className="mt-2 rounded-2xl bg-slate-50 px-4 py-3 text-sm font-black text-slate-700 ring-1 ring-slate-200">{detail.mobileMasked}</div>
                </div>
                <div>
                  <label className="text-xs font-black text-slate-500">الرقم البديل الجديد</label>
                  <input value={reassignMobile} onChange={(e) => setReassignMobile(e.target.value)} placeholder="05xxxxxxxx" className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-bold outline-none" />
                </div>
              </div>
              <div className="mt-4">
                <label className="text-xs font-black text-slate-500">اسم ولي الأمر الجديد (اختياري)</label>
                <input value={reassignGuardianName} onChange={(e) => setReassignGuardianName(e.target.value)} placeholder="يُترك فارغًا للاحتفاظ بالاسم الحالي" className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-bold outline-none" />
              </div>
              <div className="mt-4 rounded-2xl bg-amber-50 px-4 py-3 text-sm font-bold leading-7 text-amber-800 ring-1 ring-amber-100">هذا الإجراء لا يحذف الطالب، بل ينقل ارتباطه إلى الرقم الجديد. ويمكن استخدامه عند تغيير رقم ولي الأمر أو رغبة الإدارة في فصل الأبناء بين أرقام مختلفة.</div>
              <div className="mt-6 flex flex-wrap justify-end gap-2">
                <button onClick={closeReassign} disabled={reassigning} className="rounded-2xl bg-slate-100 px-4 py-2 text-sm font-bold text-slate-700">إلغاء</button>
                <button onClick={submitReassign} disabled={reassigning} className="rounded-2xl bg-sky-700 px-4 py-2 text-sm font-bold text-white disabled:opacity-60">{reassigning ? 'جاري التنفيذ...' : 'تنفيذ النقل الآمن'}</button>
              </div>
            </div>
          </div> : null}
          </div>
        </div>
      </div> : null}

      {parentsTab === 'audit' && <SectionCard title="السجل الرقابي لأولياء الأمور" icon={ClipboardList} action={<div className="flex flex-wrap items-center gap-2"><button onClick={loadAudit} className="rounded-2xl bg-slate-100 px-4 py-2 text-sm font-bold text-slate-700">تحديث</button><button onClick={() => exportAudit('xlsx')} className="rounded-2xl bg-emerald-600 px-4 py-2 text-sm font-bold text-white">Excel</button><button onClick={() => exportAudit('csv')} className="rounded-2xl bg-sky-50 px-4 py-2 text-sm font-bold text-sky-700 ring-1 ring-sky-100">CSV</button><button onClick={printAudit} className="rounded-2xl bg-white px-4 py-2 text-sm font-bold text-slate-700 ring-1 ring-slate-200">طباعة / PDF</button></div>}>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
          {auditActionCards.map((card) => <div key={card.label} className="rounded-[1.5rem] border border-slate-200 bg-white p-5"><Badge tone={card.tone}>{card.label}</Badge><div className="mt-4 text-3xl font-black text-slate-900">{card.value}</div></div>)}
        </div>
        <div className="mt-5 grid grid-cols-1 gap-3 lg:grid-cols-[1.2fr_.7fr_.7fr_auto]">
          <label className="rounded-2xl bg-slate-50 px-4 py-3 ring-1 ring-slate-200"><div className="text-xs font-black text-slate-500">بحث</div><input value={auditQuery} onChange={(e) => setAuditQuery(e.target.value)} placeholder="ولي الأمر أو الطالب أو الوصف" className="mt-2 w-full bg-transparent text-sm font-bold outline-none" /></label>
          <label className="rounded-2xl bg-slate-50 px-4 py-3 ring-1 ring-slate-200"><div className="text-xs font-black text-slate-500">نوع الإجراء</div><select value={auditActionFilter} onChange={(e) => setAuditActionFilter(e.target.value)} className="mt-2 w-full bg-transparent text-sm font-bold outline-none"><option value="all">الكل</option>{auditActionOptions.map((action) => <option key={action} value={action}>{action}</option>)}</select></label>
          <label className="rounded-2xl bg-slate-50 px-4 py-3 ring-1 ring-slate-200"><div className="text-xs font-black text-slate-500">النطاق</div><select value={auditScopeFilter} onChange={(e) => setAuditScopeFilter(e.target.value)} className="mt-2 w-full bg-transparent text-sm font-bold outline-none"><option value="all">الكل</option><option value="school">عام على مستوى المدرسة</option><option value="parent">خاص بولي أمر</option></select></label>
          <div className="flex items-end"><div className="rounded-2xl bg-slate-100 px-4 py-3 text-sm font-bold text-slate-700">{filteredAuditEntries.length} سجل</div></div>
        </div>
        {auditState.error ? <div className="mt-4 rounded-2xl bg-rose-50 px-4 py-3 text-sm font-bold text-rose-700 ring-1 ring-rose-200">{auditState.error}</div> : null}
        {auditActionNotice.text ? <div className={`mt-4 rounded-2xl px-4 py-3 text-sm font-bold ring-1 ${auditActionNotice.tone === 'green' ? 'bg-emerald-50 text-emerald-700 ring-emerald-200' : auditActionNotice.tone === 'rose' ? 'bg-rose-50 text-rose-700 ring-rose-200' : 'bg-sky-50 text-sky-700 ring-sky-200'}`}>{auditActionNotice.text}</div> : null}
        {auditState.loading ? <div className="mt-4 rounded-2xl bg-slate-50 px-4 py-8 text-center text-sm font-bold text-slate-500">جاري تحميل السجل الرقابي...</div> : null}
        {!auditState.loading && !filteredAuditEntries.length ? <div className="mt-4 rounded-2xl bg-slate-50 px-4 py-8 text-center text-sm font-bold text-slate-500">لا توجد سجلات مطابقة للفلاتر الحالية.</div> : null}
        <div className="mt-4 space-y-3">
          {filteredAuditEntries.map((entry) => (
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
      </SectionCard>}
      {/* Modal رابط الدخول المباشر */}
      {state.linkModal ? <div className="fixed inset-0 z-[200] bg-slate-950/50 p-4 backdrop-blur-sm flex items-center justify-center" onClick={() => setState((c) => ({ ...c, linkModal: null }))}>
        <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl" onClick={(e) => e.stopPropagation()}>
          <div className="mb-4 flex items-center justify-between">
            <div className="text-lg font-black text-slate-900">رابط دخول مباشر</div>
            <button onClick={() => setState((c) => ({ ...c, linkModal: null }))} className="rounded-xl bg-slate-100 p-2 text-slate-500 hover:bg-slate-200 text-xl leading-none">×</button>
          </div>
          <div className="mb-2 text-sm font-bold text-slate-600">ولي الأمر: {state.linkModal.guardianName}</div>
          <div className="mb-4 rounded-2xl bg-violet-50 p-4 ring-1 ring-violet-200">
            <div className="text-xs font-black text-violet-600 mb-2">الرابط المباشر (صالح 10 دقائق)</div>
            <div className="break-all text-xs text-slate-700 font-mono leading-relaxed">{state.linkModal.link}</div>
          </div>
          <div className="flex flex-wrap gap-2">
            <button onClick={async () => { try { await navigator.clipboard.writeText(state.linkModal.link); window.alert('تم نسخ الرابط!'); } catch {} }} className="flex-1 rounded-2xl bg-slate-100 px-4 py-2.5 text-sm font-bold text-slate-700 hover:bg-slate-200 flex items-center justify-center gap-2">
              <Copy size={14} /> نسخ الرابط
            </button>
            <a href={state.linkModal.whatsappUrl} target="_blank" rel="noopener noreferrer" className="flex-1 rounded-2xl bg-emerald-600 px-4 py-2.5 text-sm font-bold text-white hover:bg-emerald-700 flex items-center justify-center gap-2">
              <ExternalLink size={14} /> إرسال واتساب
            </a>
          </div>
          <div className="mt-3 text-center text-xs text-slate-400">تم نسخ الرابط تلقائياً عند الإنشاء</div>
        </div>
      </div> : null}
    </div>
  );
}

export default ParentAccountsPage;

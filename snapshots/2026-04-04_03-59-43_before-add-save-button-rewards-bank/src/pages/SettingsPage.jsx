/**
 * ==========================================
 *  SettingsPage Component
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
import { Input, Select } from '../components/ui/FormElements';
import { SectionCard } from '../components/ui/SectionCard';


import { SubjectBankEditor } from '../components/ui/SubjectBankEditor';
import WeeklyTimetableEditor from '../components/WeeklyTimetableEditor';
import { Badge } from '../components/ui/FormElements';
import { getAuthReasonLabel } from '../constants/appConfig.js';
function SettingsPage({ selectedSchool, settings, attendanceMethod, users, schools, currentUser, onSaveSettings, onRestoreBackup, onResetData, onExportBackup, onImportStudents, onDownloadTemplate, setAttendanceMethod, onUpdateSchoolBranding, forcedTab = null, titleOverride = "", descriptionOverride = "" }) {
  const [tab, setTab] = useState(forcedTab || "general");
  const [localSettings, setLocalSettings] = useState(settings);
  const [importMessage, setImportMessage] = useState("");
  const [authTestDraft, setAuthTestDraft] = useState({
    emailTarget: '',
    smsTarget: '',
    whatsappTarget: '',
    otpUserId: '',
    otpDelivery: 'email',
  });
  const [authTestStatus, setAuthTestStatus] = useState({});
  const [authTestBusy, setAuthTestBusy] = useState('');
  const [authLogs, setAuthLogs] = useState([]);
  const [authLogsBusy, setAuthLogsBusy] = useState(false);
  const [authLogFilter, setAuthLogFilter] = useState('all');
  const canManageParentPortal = ['superadmin', 'principal'].includes(String(currentUser?.role || ''));
  const canViewParentPortal = canManageParentPortal || String(currentUser?.role || '') === 'supervisor';
  const [parentPortalConfig, setParentPortalConfig] = useState({
    loaded: false,
    loading: false,
    saving: false,
    mode: 'auto',
    enabled: true,
    altLoginEnabled: true,
    alerts: [],
    totalRequests: 0,
    pendingRequests: 0,
    error: '',
  });
  const fileRef = useRef(null);
  const importRef = useRef(null);

  useEffect(() => {
    setLocalSettings(settings);
  }, [settings]);

  useEffect(() => {
    if (forcedTab) setTab(forcedTab);
  }, [forcedTab]);

  useEffect(() => {
    setAuthTestStatus({});
  }, [settings?.auth]);


  const loadAuthLogs = useCallback(async () => {
    if (!currentUser || currentUser.role === 'student') return;
    setAuthLogsBusy(true);
    try {
      const response = await apiRequest('/api/auth/logs?limit=200', { token: getSessionToken() });
      setAuthLogs(Array.isArray(response.logs) ? response.logs : []);
    } catch (error) {
      window.alert(error.message || 'تعذر تحميل سجل الدخول.');
    } finally {
      setAuthLogsBusy(false);
    }
  }, [currentUser]);

  useEffect(() => {
    let cancelled = false;
    const loadParentPortalConfig = async () => {
      if (!canViewParentPortal || tab !== 'parentPortal') return;
      setParentPortalConfig((current) => ({ ...current, loading: true, error: '' }));
      try {
        const response = await apiRequest('/api/admin/parent-primary-requests', { token: getSessionToken() });
        if (cancelled) return;
        const requests = Array.isArray(response.requests) ? response.requests : [];
        const alerts = Array.isArray(response.alerts) ? response.alerts : [];
        setParentPortalConfig((current) => ({
          ...current,
          loaded: true,
          loading: false,
          mode: response.policy?.mode || 'auto',
          enabled: response.portalSettings?.enabled !== false,
          altLoginEnabled: response.portalSettings?.altLoginEnabled !== false,
          alerts,
          totalRequests: requests.length,
          pendingRequests: requests.filter((item) => item.status === 'pending').length,
          error: '',
        }));
      } catch (error) {
        if (cancelled) return;
        setParentPortalConfig((current) => ({ ...current, loading: false, loaded: true, error: error.message || 'تعذر تحميل إعدادات بوابة ولي الأمر.' }));
      }
    };
    loadParentPortalConfig();
    return () => { cancelled = true; };
  }, [tab, canViewParentPortal]);

  const saveParentPortalMode = async (mode) => {
    if (!canManageParentPortal) return;
    setParentPortalConfig((current) => ({ ...current, saving: true, error: '' }));
    try {
      await apiRequest('/api/admin/parent-primary-requests/policy', { method: 'POST', token: getSessionToken(), body: { mode } });
      setParentPortalConfig((current) => ({ ...current, saving: false, mode, error: '' }));
      window.alert(mode === 'auto' ? 'تم تفعيل الاعتماد التلقائي لتحديث الرقم الأساسي.' : 'تم التحويل إلى الاعتماد اليدوي لطلبات تحديث الرقم الأساسي.');
    } catch (error) {
      setParentPortalConfig((current) => ({ ...current, saving: false, error: error.message || 'تعذر تحديث سياسة البوابة.' }));
    }
  };

  const saveParentPortalEnabled = async (enabled) => {
    if (!canManageParentPortal) return;
    setParentPortalConfig((current) => ({ ...current, saving: true, error: '' }));
    try {
      await apiRequest('/api/admin/parent-primary-requests/portal-settings', { method: 'POST', token: getSessionToken(), body: { enabled } });
      setParentPortalConfig((current) => ({ ...current, saving: false, enabled, error: '' }));
      window.alert(enabled ? 'تم تفعيل بوابة ولي الأمر.' : 'تم إيقاف بوابة ولي الأمر.');
    } catch (error) {
      setParentPortalConfig((current) => ({ ...current, saving: false, error: error.message || 'تعذر تحديث حالة البوابة.' }));
    }
  };

  const saveParentPortalAltLogin = async (altLoginEnabled) => {
    if (!canManageParentPortal) return;
    setParentPortalConfig((current) => ({ ...current, saving: true, error: '' }));
    try {
      await apiRequest('/api/admin/parent-primary-requests/portal-settings', { method: 'POST', token: getSessionToken(), body: { altLoginEnabled } });
      setParentPortalConfig((current) => ({ ...current, saving: false, altLoginEnabled, error: '' }));
      window.alert(altLoginEnabled ? 'تم تفعيل الدخول البديل برقم الهوية.' : 'تم تعطيل الدخول البديل برقم الهوية.');
    } catch (error) {
      setParentPortalConfig((current) => ({ ...current, saving: false, error: error.message || 'تعذر تحديث إعداد الدخول البديل.' }));
    }
  };

  const tabs = forcedTab ? [
    { key: forcedTab, label: forcedTab === 'auth' ? "الدخول والمصادقة" : "الإعدادات" },
  ] : [
    { key: "general", label: "هوية وتشغيل" },
    { key: "attendance", label: "الحضور" },
    { key: "subjects", label: "بنك المواد" },
    { key: "import", label: "الطلاب" },
    { key: "devices", label: "الأجهزة" },
    ...(canViewParentPortal ? [{ key: "parentPortal", label: "بوابة ولي الأمر" }] : []),
    { key: "timetable", label: "جدول الحصص" },
    ...(currentUser?.role === 'superadmin' ? [{ key: "backup", label: "النسخ الاحتياطي" }] : []),
    { key: "diagnostics", label: "جاهزية المدرسة" },
  ];

  const diagnosticsStudents = useMemo(() => getUnifiedSchoolStudents(selectedSchool, { includeArchived: false, preferStructure: true }), [selectedSchool]);
  const diagnosticsCompanies = useMemo(() => getUnifiedCompanyRows(selectedSchool, { preferStructure: true }), [selectedSchool]);
  const diagnosticsClassrooms = useMemo(() => {
    if (Array.isArray(selectedSchool?.structure?.classrooms) && selectedSchool.structure.classrooms.length) return selectedSchool.structure.classrooms;
    return Array.isArray(selectedSchool?.companies) ? selectedSchool.companies : [];
  }, [selectedSchool]);

  const schoolDiagnostics = [
    { label: "الطلاب", value: diagnosticsStudents.length, tone: "blue" },
    { label: "الفصول", value: diagnosticsClassrooms.length, tone: "violet" },
    { label: "الشركات", value: diagnosticsCompanies.length, tone: "amber" },
    { label: "البوابات", value: selectedSchool?.smartLinks?.gates?.length || 0, tone: "green" },
    { label: "الشاشات", value: selectedSchool?.smartLinks?.screens?.length || 0, tone: "slate" },
  ];

  const readinessChecks = [
    {
      title: "بيانات المدرسة",
      ok: Boolean(selectedSchool?.name && selectedSchool?.city),
      description: selectedSchool?.name ? `المدرسة الحالية: ${selectedSchool.name}` : "لا توجد مدرسة محددة حاليًا.",
    },
    {
      title: "الفصول",
      ok: diagnosticsClassrooms.length > 0,
      description: diagnosticsClassrooms.length > 0 ? `هناك ${diagnosticsClassrooms.length} فصل مهيأ داخل الهيكل المدرسي.` : "لا توجد فصول مهيأة بعد.",
    },
    {
      title: "الطلاب",
      ok: diagnosticsStudents.length > 0,
      description: diagnosticsStudents.length > 0 ? `تمت إضافة ${diagnosticsStudents.length} طالب ويمكن استخدام الحضور والبطاقات.` : "لم تتم إضافة أي طالب بعد.",
    },
    {
      title: "الأجهزة",
      ok: Boolean(localSettings?.devices?.barcodeEnabled || localSettings?.devices?.faceEnabled),
      description: localSettings?.devices?.barcodeEnabled && localSettings?.devices?.faceEnabled ? "الباركود وبصمة الوجه مفعّلان." : localSettings?.devices?.barcodeEnabled ? "الباركود مفعل وبصمة الوجه غير مفعلة." : localSettings?.devices?.faceEnabled ? "بصمة الوجه مفعلة والباركود غير مفعل." : "لا توجد وسيلة حضور مفعلة حاليًا.",
    },
    {
      title: "الروابط الذكية",
      ok: ((selectedSchool?.smartLinks?.gates?.length || 0) + (selectedSchool?.smartLinks?.screens?.length || 0)) > 0,
      description: ((selectedSchool?.smartLinks?.gates?.length || 0) + (selectedSchool?.smartLinks?.screens?.length || 0)) > 0 ? "هناك بوابات أو شاشات تم توليدها." : "لم يتم توليد أي بوابة أو شاشة بعد.",
    },
  ];

  const authTargeting = localSettings.auth?.targeting || { applyScope: 'all', selectedRoleKeys: [], selectedUserIds: [], excludedUserIds: [], forceForSelected: false };
  const canEditGlobalIdentity = currentUser?.role === 'superadmin';
  const canCustomizeBranding = !canEditGlobalIdentity && selectedSchool?.customBranding?.allowed === true;
  const [localBranding, setLocalBranding] = useState({
    platformName: selectedSchool?.customBranding?.platformName || '',
    logoUrl: selectedSchool?.customBranding?.logoUrl || '',
    enabled: selectedSchool?.customBranding?.enabled || false,
  });
  const [brandingSaveStatus, setBrandingSaveStatus] = useState('idle');

  const saveSchoolBranding = () => {
    if (!onUpdateSchoolBranding || !selectedSchool?.id) return;
    setBrandingSaveStatus('saving');
    setTimeout(() => {
      onUpdateSchoolBranding(selectedSchool.id, {
        allowed: true,
        enabled: localBranding.enabled,
        platformName: localBranding.platformName.trim(),
        logoUrl: localBranding.logoUrl.trim(),
      });
      setBrandingSaveStatus('saved');
      setTimeout(() => setBrandingSaveStatus('idle'), 2500);
    }, 400);
  };

  const handleSchoolLogoUpload = async (file) => {
    if (!file) return;
    const dataUrl = await fileToDataUrl(file);
    setLocalBranding((prev) => ({ ...prev, logoUrl: dataUrl }));
  };

  const authManagedUsers = useMemo(() => (users || []).map((user) => ({ ...user, schoolName: schools.find((school) => Number(school.id) === Number(user.schoolId))?.name || 'بدون مدرسة' })), [users, schools]);
  const handleBrandLogoUpload = async (type, file) => {
    if (!file) return;
    const dataUrl = await fileToDataUrl(file);
    setLocalSettings((prev) => ({
      ...prev,
      branding: {
        ...(prev.branding || {}),
        [type]: dataUrl,
      },
    }));
  };
  const clearBrandLogo = (type) => {
    setLocalSettings((prev) => ({
      ...prev,
      branding: {
        ...(prev.branding || {}),
        [type]: '',
      },
    }));
  };
  const toggleAuthTargetListValue = (key, value) => {
    const currentList = Array.isArray(authTargeting?.[key]) ? authTargeting[key] : [];
    const nextList = currentList.includes(value) ? currentList.filter((item) => item !== value) : [...currentList, value];
    setLocalSettings({ ...localSettings, auth: { ...localSettings.auth, targeting: { ...authTargeting, [key]: nextList } } });
  };
  const filteredAuthLogs = useMemo(() => authLogs.filter((entry) => {
    if (authLogFilter === 'all') return true;
    if (authLogFilter === 'success') return ['login', 'auth_request_otp_success', 'auth_verify_otp_success'].includes(entry.action);
    if (authLogFilter === 'failed') return ['auth_login_failed', 'auth_request_otp_failed', 'auth_verify_otp_failed'].includes(entry.action);
    if (authLogFilter === 'blocked') return ['auth_login_blocked', 'auth_request_otp_blocked', 'auth_verify_otp_blocked'].includes(entry.action);
    if (authLogFilter === 'otp') return String(entry.action || '').includes('otp');
    return true;
  }), [authLogs, authLogFilter]);

  const settingsOverview = useMemo(() => ([
    {
      key: 'school',
      title: 'هوية المدرسة والتشغيل',
      value: selectedSchool?.name || 'بدون مدرسة',
      detail: `المنصة: ${localSettings?.platformName || 'منصة المدرسة'} • السنة: ${localSettings?.academicYear || 'غير محددة'}`,
      tone: 'sky',
      tab: 'general',
    },
    {
      key: 'attendance',
      title: 'سياسة الحضور',
      value: attendanceMethod === 'face' ? 'بصمة الوجه' : 'QR كود',
      detail: `بداية اليوم: ${localSettings?.dayStart || '—'} • مبكر حتى ${localSettings?.policy?.earlyEnd || '—'}`,
      tone: 'green',
      tab: 'attendance',
    },
    {
      key: 'devices',
      title: 'الأجهزة والتشغيل',
      value: `${localSettings?.devices?.barcodeEnabled ? 'QR' : ''}${localSettings?.devices?.barcodeEnabled && localSettings?.devices?.faceEnabled ? ' + ' : ''}${localSettings?.devices?.faceEnabled ? 'Face' : ''}` || 'غير مفعل',
      detail: `${selectedSchool?.smartLinks?.gates?.length || 0} بوابة • ${selectedSchool?.smartLinks?.screens?.length || 0} شاشة`,
      tone: 'amber',
      tab: 'devices',
    },
    ...(canViewParentPortal ? [{
      key: 'parentPortal',
      title: 'بوابة ولي الأمر',
      value: parentPortalConfig.enabled ? 'مفعلة' : 'مقفلة',
      detail: `${parentPortalConfig.mode === 'auto' ? 'التحديث تلقائي' : 'التحديث يدوي'} • ${parentPortalConfig.pendingRequests || 0} طلب بانتظار المراجعة`,
      tone: parentPortalConfig.enabled ? 'green' : 'slate',
      tab: 'parentPortal',
    }] : []),
    {
      key: 'timetable',
      title: 'جدول الحصص',
      value: `${(localSettings?.weeklyTimetable || []).length} خانة`,
      detail: `${(localSettings?.slotDefinitions || []).length} حصة معرّفة • الاختيار التلقائي بحسب الوقت`,
      tone: 'violet',
      tab: 'timetable',
    },
  ]), [selectedSchool, localSettings, attendanceMethod, canViewParentPortal, parentPortalConfig]);

  const exportAuthLogs = (format = 'xlsx') => {
    const rows = filteredAuthLogs.map((entry) => {
      const details = entry.details || {};
      const meta = getAuthActionMeta(entry.action);
      const channelLabel = details.delivery === 'email' ? 'البريد الإلكتروني' : details.delivery === 'sms' ? 'SMS' : details.delivery === 'whatsapp' ? 'واتساب' : 'كلمة المرور / داخلي';
      return {
        'الوقت': formatDateTime(entry.createdAt),
        'الحدث': meta.label,
        'رمز الحدث': entry.action || '',
        'الحساب': details.userName || details.username || entry.actorUsername || details.identifier || '',
        'رقم المستخدم': details.userId || '',
        'الدور': getRoleLabel(details.role || entry.actorRole || '') || '',
        'القناة': channelLabel,
        'السبب': getAuthReasonLabel(details.reason),
        'الوجهة': details.destinationPreview || '',
      };
    });
    if (!rows.length) {
      window.alert('لا توجد سجلات مطابقة لتصديرها.');
      return;
    }
    const stamp = new Date().toISOString().replace(/[:T]/g, '-').slice(0, 16);
    if (format === 'csv') {
      const worksheet = XLSX.utils.json_to_sheet(rows);
      const csv = XLSX.utils.sheet_to_csv(worksheet);
      const blob = new Blob(["﻿" + csv], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `auth-audit-log-${stamp}.csv`;
      link.click();
      URL.revokeObjectURL(url);
      return;
    }
    const workbook = XLSX.utils.book_new();
    const worksheet = XLSX.utils.json_to_sheet(rows);
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Auth Audit');
    XLSX.writeFile(workbook, `auth-audit-log-${stamp}.xlsx`);
  };

  const save = () => onSaveSettings({
    ...localSettings,
    platformName: currentUser?.role === "superadmin" ? localSettings.platformName : settings.platformName,
    actions: hydrateActionCatalog(localSettings.actions),
  });

  const handleRestoreFile = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const textFile = await file.text();
    try {
      const parsed = JSON.parse(textFile);
      onRestoreBackup(parsed);
    } catch {
      window.alert("ملف النسخة الاحتياطية غير صالح.");
    }
    event.target.value = "";
  };

  const handleImportFile = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const result = await onImportStudents(file);
    setImportMessage(result?.message || "تم إنهاء عملية الاستيراد.");
    event.target.value = "";
  };

  const updateAuthTestField = (key, value) => setAuthTestDraft((current) => ({ ...current, [key]: value }));

  const runAuthDeliveryTest = async (delivery) => {
    const target = delivery === 'email' ? authTestDraft.emailTarget : delivery === 'sms' ? authTestDraft.smsTarget : authTestDraft.whatsappTarget;
    setAuthTestBusy(`delivery-${delivery}`);
    setAuthTestStatus((current) => ({ ...current, [delivery]: null }));
    try {
      const response = await apiRequest('/api/auth/test-delivery', { method: 'POST', token: getSessionToken(), body: { delivery, target, schoolId: selectedSchool?.id || '' } });
      setAuthTestStatus((current) => ({ ...current, [delivery]: { ok: true, message: response.message, destinationPreview: response.destinationPreview || '', previewCode: response.previewCode || '', providerMessageId: response.providerMessageId || '' } }));
    } catch (error) {
      setAuthTestStatus((current) => ({ ...current, [delivery]: { ok: false, message: error.message } }));
    } finally {
      setAuthTestBusy('');
    }
  };

  const runOtpScenarioTest = async () => {
    setAuthTestBusy('otp-scenario');
    setAuthTestStatus((current) => ({ ...current, otpScenario: null }));
    try {
      const response = await apiRequest('/api/auth/test-otp-scenario', { method: 'POST', token: getSessionToken(), body: { userId: authTestDraft.otpUserId, delivery: authTestDraft.otpDelivery } });
      setAuthTestStatus((current) => ({ ...current, otpScenario: { ok: true, message: response.message, destinationPreview: response.destinationPreview || '', previewCode: response.previewCode || '', expiresAt: response.expiresAt || '', userName: response.userName || '' } }));
    } catch (error) {
      setAuthTestStatus((current) => ({ ...current, otpScenario: { ok: false, message: error.message } }));
    } finally {
      setAuthTestBusy('');
    }
  };

  return (
    <div className="space-y-6">
      <SectionCard title={titleOverride || "إعدادات المدرسة والتشغيل"} icon={Settings}>
        {descriptionOverride ? <div className="mb-5 rounded-2xl bg-sky-50 px-4 py-4 text-sm leading-7 text-sky-900 ring-1 ring-sky-100">{descriptionOverride}</div> : null}
        {!forcedTab ? (
          <>
            <div className="mb-5 grid grid-cols-1 gap-3 xl:grid-cols-4">
              {settingsOverview.map((item) => (
                <button key={item.key} type="button" onClick={() => setTab(item.tab)} className="rounded-3xl bg-gradient-to-br from-white to-slate-50 p-4 text-right ring-1 ring-slate-200 transition hover:-translate-y-0.5 hover:shadow-sm">
                  <div className="flex items-center justify-between gap-3">
                    <Badge tone={item.tone}>{item.title}</Badge>
                    <span className="text-xs font-bold text-slate-500">فتح القسم</span>
                  </div>
                  <div className="mt-4 text-xl font-black text-slate-900">{item.value}</div>
                  <div className="mt-2 text-sm leading-7 text-slate-500">{item.detail}</div>
                </button>
              ))}
            </div>
            <div className="mb-5 rounded-3xl bg-slate-50 p-4 ring-1 ring-slate-200">
              <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <div className="font-black text-slate-900">تحكم سريع في المدرسة والتشغيل</div>
                  <div className="mt-1 text-sm leading-7 text-slate-500">هذه الصفحة خاصة بإعدادات المدرسة الحالية: الهوية، الحضور، البنود، الأجهزة، الاستيراد، النسخ الاحتياطي، وجاهزية التشغيل.</div>
                </div>
                <div className="flex flex-wrap gap-2">
                  {tabs.map((item) => (
                    <button key={item.key} onClick={() => setTab(item.key)} className={`rounded-2xl px-4 py-2 text-sm font-bold transition ${tab === item.key ? "bg-sky-700 text-white shadow-sm" : "bg-white text-slate-600 ring-1 ring-slate-200 hover:bg-slate-100"}`}>{item.label}</button>
                  ))}
                </div>
              </div>
            </div>
          </>
        ) : null}

        {tab === "general" && (
          <div className="space-y-5">
            <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
              <div className="rounded-3xl bg-sky-50 p-5 ring-1 ring-sky-100">
                <div className="text-sm font-bold text-sky-800">الهوية الحالية</div>
                <div className="mt-3 text-2xl font-black text-slate-900">{selectedSchool?.name || 'بدون مدرسة'}</div>
                <div className="mt-2 text-sm leading-7 text-slate-600">هذه البيانات تظهر في الشاشات، التقارير، ورسائل المدرسة، لذلك يُفضّل ضبطها بدقة.</div>
              </div>
              <div className="rounded-3xl bg-emerald-50 p-5 ring-1 ring-emerald-100">
                <div className="text-sm font-bold text-emerald-800">التشغيل الدراسي</div>
                <div className="mt-3 text-2xl font-black text-slate-900">{localSettings?.academicYear || 'غير محددة'}</div>
                <div className="mt-2 text-sm leading-7 text-slate-600">بداية اليوم الحالية: {localSettings?.dayStart || '—'} • مسؤول النظام: {localSettings?.adminName || 'غير محدد'}.</div>
              </div>
              <div className="rounded-3xl bg-violet-50 p-5 ring-1 ring-violet-100">
                <div className="text-sm font-bold text-violet-800">الاسم المعتمد للمنصة</div>
                <div className="mt-3 text-2xl font-black text-slate-900">{localSettings?.platformName || 'منصة المدرسة'}</div>
                <div className="mt-2 text-sm leading-7 text-slate-600">يمكن اعتماد اسم المدرسة أو اسم المبادرة أو اسم المنصة الرسمي بحسب سياستكم.</div>
              </div>
            </div>
            <div className="rounded-3xl bg-slate-50 p-5 ring-1 ring-slate-200">
              <div className="mb-4">
                <div className="font-black text-slate-900">هوية المدرسة والتشغيل العام</div>
                <div className="mt-1 text-sm leading-7 text-slate-500">اضبط البيانات الأساسية التي يعتمد عليها النظام في الواجهة والتقارير والإشعارات.</div>{currentUser?.role !== "superadmin" ? <div className="mt-3 rounded-2xl bg-amber-50 px-4 py-3 text-sm font-bold text-amber-900 ring-1 ring-amber-200">اسم المنصة واسم المدرسة من الصلاحيات العامة للأدمن الرئيسي فقط، ويمكن لمدير المدرسة تعديل بقية إعدادات التشغيل الخاصة بمدرسته.</div> : null}
              </div>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <Input label="اسم المنصة" value={localSettings.platformName} onChange={(e) => setLocalSettings({ ...localSettings, platformName: e.target.value })} disabled={!canEditGlobalIdentity} className={!canEditGlobalIdentity ? "cursor-not-allowed bg-slate-100 text-slate-500" : ""} />
                <Input label="اسم المدرسة" value={selectedSchool?.name || ''} disabled className="cursor-not-allowed bg-slate-100 text-slate-500" />
                <Input label="الرقم الوزاري" value={selectedSchool?.code || ''} disabled className="cursor-not-allowed bg-slate-100 text-slate-500" />
                <Input label="مدير المدرسة" value={selectedSchool?.manager || ''} disabled className="cursor-not-allowed bg-slate-100 text-slate-500" />
                <Input label="السنة الدراسية" value={localSettings.academicYear} onChange={(e) => setLocalSettings({ ...localSettings, academicYear: e.target.value })} />
                <Input label="وقت بداية اليوم الدراسي" value={localSettings.dayStart} onChange={(e) => setLocalSettings({ ...localSettings, dayStart: e.target.value })} />
                <Input label="مسؤول النظام" value={localSettings.adminName} onChange={(e) => setLocalSettings({ ...localSettings, adminName: e.target.value })} />
              </div>
              <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-2">
                {[
                  { key: 'ministryLogo', label: 'شعار الوزارة', hint: 'يظهر في صفحة الدخول والواجهات الرسمية.' },
                  { key: 'platformLogo', label: 'شعار المنصة', hint: 'يظهر في صفحة الدخول وبطاقة التعريف.' },
                ].map((item) => (
                  <div key={item.key} className="rounded-3xl bg-white p-4 ring-1 ring-slate-200">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="font-black text-slate-900">{item.label}</div>
                        <div className="mt-1 text-sm leading-7 text-slate-500">{item.hint}</div>
                      </div>
                      <div className="flex h-20 w-20 items-center justify-center overflow-hidden rounded-2xl bg-slate-50 ring-1 ring-slate-200">
                        {(localSettings.branding?.[item.key]) ? (
                          <img src={localSettings.branding[item.key]} alt={item.label} className="h-full w-full object-contain p-2" />
                        ) : (
                          <ShieldCheck className="h-8 w-8 text-slate-300" />
                        )}
                      </div>
                    </div>
                    <div className="mt-4 flex flex-wrap gap-2">
                      <label className={`inline-flex cursor-pointer items-center gap-2 rounded-2xl px-4 py-3 text-sm font-bold transition ${canEditGlobalIdentity ? 'bg-sky-700 text-white' : 'cursor-not-allowed bg-slate-100 text-slate-400'}`}>
                        <Upload className="h-4 w-4" />
                        رفع الشعار
                        <input type="file" accept="image/*" className="hidden" disabled={!canEditGlobalIdentity} onChange={async (e) => { const file = e.target.files?.[0]; if (file) await handleBrandLogoUpload(item.key, file); e.target.value = ''; }} />
                      </label>
                      <button type="button" disabled={!canEditGlobalIdentity || !localSettings.branding?.[item.key]} onClick={() => clearBrandLogo(item.key)} className="rounded-2xl bg-slate-100 px-4 py-3 text-sm font-bold text-slate-700 disabled:cursor-not-allowed disabled:opacity-50">إزالة</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {canCustomizeBranding && (
              <div className="rounded-3xl bg-violet-50 p-5 ring-1 ring-violet-200">
                <div className="mb-4">
                  <div className="font-black text-violet-900">تخصيص هوية المنصة لمدرستك</div>
                  <div className="mt-1 text-sm leading-7 text-violet-700">تم منحك صلاحية تغيير اسم المنصة وشعارها لمدرستك بشكل مستقل دون التأثير على المدارس الأخرى.</div>
                </div>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <Input
                    label="اسم المنصة المخصص لمدرستك"
                    value={localBranding.platformName}
                    onChange={(e) => setLocalBranding((prev) => ({ ...prev, platformName: e.target.value }))}
                    placeholder="مثال: منصة متوسطة الأبناء الثالثة"
                  />
                  <div className="rounded-3xl bg-white p-4 ring-1 ring-violet-200">
                    <div className="font-black text-slate-900">شعار المدرسة</div>
                    <div className="mt-1 text-sm text-slate-500">يظهر في الشريط الجانبي بدلاً من الشعار الافتراضي</div>
                    <div className="mt-3 flex items-center gap-3">
                      {localBranding.logoUrl ? (
                        <div className="flex h-16 w-16 items-center justify-center overflow-hidden rounded-2xl bg-slate-50 ring-1 ring-slate-200">
                          <img src={localBranding.logoUrl} alt="شعار المدرسة" className="h-full w-full object-contain p-1" />
                        </div>
                      ) : (
                        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100 ring-1 ring-slate-200">
                          <Building2 className="h-7 w-7 text-slate-400" />
                        </div>
                      )}
                      <div className="flex flex-wrap gap-2">
                        <label className="inline-flex cursor-pointer items-center gap-2 rounded-2xl bg-violet-700 px-4 py-2 text-sm font-bold text-white">
                          <Upload className="h-4 w-4" />
                          رفع الشعار
                          <input type="file" accept="image/*" className="hidden" onChange={async (e) => { const file = e.target.files?.[0]; if (file) await handleSchoolLogoUpload(file); e.target.value = ''; }} />
                        </label>
                        {localBranding.logoUrl && (
                          <button type="button" onClick={() => setLocalBranding((prev) => ({ ...prev, logoUrl: '' }))} className="rounded-2xl bg-slate-100 px-4 py-2 text-sm font-bold text-slate-700">إزالة</button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
                <div className="mt-4 flex items-center gap-3">
                  <label className="flex cursor-pointer items-center gap-3 rounded-2xl bg-white px-4 py-3 ring-1 ring-violet-200">
                    <input
                      type="checkbox"
                      checked={localBranding.enabled}
                      onChange={(e) => setLocalBranding((prev) => ({ ...prev, enabled: e.target.checked }))}
                    />
                    <span className="font-bold text-slate-800">تفعيل الهوية المخصصة (تظهر في الشريط الجانبي)</span>
                  </label>
                </div>
                <button
                  type="button"
                  onClick={saveSchoolBranding}
                  disabled={brandingSaveStatus === 'saving'}
                  className={`mt-4 inline-flex items-center gap-2 rounded-2xl px-5 py-3 font-bold text-white transition-all duration-300 ${
                    brandingSaveStatus === 'saved' ? 'scale-105 bg-emerald-600' : brandingSaveStatus === 'saving' ? 'cursor-wait bg-violet-400' : 'bg-violet-700 hover:bg-violet-800'
                  }`}
                >
                  {brandingSaveStatus === 'saving' ? <><RefreshCw className="h-4 w-4 animate-spin" /> جارٍ الحفظ...</> : brandingSaveStatus === 'saved' ? <><CheckCircle className="h-4 w-4" /> تم الحفظ ✓</> : <><Save className="h-4 w-4" /> حفظ هوية المدرسة</>}
                </button>
              </div>
            )}
          </div>
        )}

        {tab === "attendance" && (
          <div className="space-y-5">
            <div className="grid grid-cols-1 gap-4 xl:grid-cols-4">
              <div className="rounded-3xl bg-emerald-50 p-5 ring-1 ring-emerald-100"><div className="text-sm font-bold text-emerald-800">طريقة الحضور</div><div className="mt-3 text-2xl font-black text-slate-900">{attendanceMethod === 'face' ? 'بصمة الوجه' : 'QR كود'}</div><div className="mt-2 text-sm text-slate-600">اختر الطريقة الافتراضية لمسارات التحضير السريع والبوابات.</div></div>
              <div className="rounded-3xl bg-sky-50 p-5 ring-1 ring-sky-100"><div className="text-sm font-bold text-sky-800">الحضور المبكر</div><div className="mt-3 text-2xl font-black text-slate-900">{localSettings?.policy?.earlyEnd || '—'}</div><div className="mt-2 text-sm text-slate-600">آخر وقت يُحسب حضورًا مبكرًا.</div></div>
              <div className="rounded-3xl bg-violet-50 p-5 ring-1 ring-violet-100"><div className="text-sm font-bold text-violet-800">الحضور في الوقت</div><div className="mt-3 text-2xl font-black text-slate-900">{localSettings?.policy?.onTimeEnd || '—'}</div><div className="mt-2 text-sm text-slate-600">آخر وقت يُحسب حضورًا طبيعيًا قبل التأخر.</div></div>
              <div className="rounded-3xl bg-amber-50 p-5 ring-1 ring-amber-100"><div className="text-sm font-bold text-amber-800">التصدير</div><div className="mt-3 text-2xl font-black text-slate-900">{localSettings?.exportPrefix || 'school'}</div><div className="mt-2 text-sm text-slate-600">يستخدم كبادئة لتقارير Excel والنسخ الاحتياطية.</div></div>
            </div>
            <div className="rounded-3xl bg-slate-50 p-5 ring-1 ring-slate-200">
              <div className="mb-4">
                <div className="font-black text-slate-900">سياسات الحضور والانصراف</div>
                <div className="mt-1 text-sm leading-7 text-slate-500">اضبط أوقات اليوم الدراسي وطريقة التحضير الافتراضية بما يتوافق مع بوابات المدرسة والشاشات والحضور الذكي.</div>
              </div>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <Input label="نهاية الحضور المبكر" value={localSettings.policy.earlyEnd} onChange={(e) => setLocalSettings({ ...localSettings, policy: { ...localSettings.policy, earlyEnd: e.target.value } })} />
                <Input label="نهاية الحضور في الوقت" value={localSettings.policy.onTimeEnd} onChange={(e) => setLocalSettings({ ...localSettings, policy: { ...localSettings.policy, onTimeEnd: e.target.value } })} />
                <Select label="طريقة الحضور الافتراضية" value={attendanceMethod} onChange={(e) => setAttendanceMethod(e.target.value)}>
                  <option value="barcode">QR كود</option>
                  <option value="face">بصمة وجه</option>
                </Select>
                <Input label="بادئة ملفات التصدير" value={localSettings.exportPrefix} onChange={(e) => setLocalSettings({ ...localSettings, exportPrefix: e.target.value })} />
              </div>
            </div>
          </div>
        )}

        {tab === "points" && (
          <div className="rounded-3xl bg-amber-50 p-5 text-amber-900 ring-1 ring-amber-200">
            <div className="font-black">تم نقل هذا القسم</div>
            <div className="mt-2 text-sm leading-7">إعدادات النقاط والمكافآت والخصومات والبرامج أصبحت في القائمة الجانبية ضمن صفحة «النقاط والمكافآت» لتسهيل الوصول إليها.</div>
          </div>
        )}

        {tab === "subjects" && (
          <SubjectBankEditor
            subjectBank={localSettings.subjectBank || defaultSettings.subjectBank}
            onChange={(updated) => setLocalSettings((prev) => ({ ...prev, subjectBank: updated }))}
          />
        )}

        {tab === "import" && (
          <div className="space-y-4">
            <div className="rounded-3xl bg-slate-50 p-5 ring-1 ring-slate-200">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <div className="font-bold text-slate-800">استيراد الطلاب من ملف نور</div>
                  <div className="mt-2 text-sm leading-7 text-slate-600">ارفع ملف Excel بصيغة xlsx أو xls أو csv، وستقوم المنصة بقراءة الأعمدة الشائعة في نور تلقائيًا ثم إنشاء الطلاب داخل المدرسة الحالية مع توليد رقم الطالب وQR، وإنشاء الشركات/الفصول عند الحاجة.</div>
                </div>
                <Badge tone="blue">{selectedSchool?.name || "المدرسة الحالية"}</Badge>
              </div>
              <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-3">
                <button onClick={onDownloadTemplate} className="inline-flex items-center justify-center gap-2 rounded-2xl bg-slate-100 px-4 py-3 font-bold text-slate-700"><Download className="h-4 w-4" /> تحميل نموذج CSV</button>
                <button onClick={() => importRef.current?.click()} className="inline-flex items-center justify-center gap-2 rounded-2xl bg-sky-700 px-4 py-3 font-bold text-white"><Upload className="h-4 w-4" /> استيراد ملف نور</button>
                <div className="rounded-2xl bg-white px-4 py-3 text-sm text-slate-600 ring-1 ring-slate-200">الأعمدة المقروءة: اسم الطالب، رقم الهوية، رقم الطالب، الصف، الفصل، الشركة.</div>
              </div>
              <input ref={importRef} type="file" accept=".xlsx,.xls,.csv,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-excel,text/csv" className="hidden" onChange={handleImportFile} />
              {importMessage ? <div className="mt-4 rounded-2xl bg-emerald-50 px-4 py-3 text-sm font-bold text-emerald-800 ring-1 ring-emerald-200">{importMessage}</div> : null}
            </div>
          </div>
        )}

        {tab === "devices" && (
          <div className="space-y-5">
            <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
              <div className="rounded-3xl bg-sky-50 p-5 ring-1 ring-sky-100"><div className="text-sm font-bold text-sky-800">قارئ QR</div><div className="mt-3 text-2xl font-black text-slate-900">{localSettings?.devices?.barcodeEnabled ? 'مفعل' : 'غير مفعل'}</div></div>
              <div className="rounded-3xl bg-violet-50 p-5 ring-1 ring-violet-100"><div className="text-sm font-bold text-violet-800">بصمة الوجه</div><div className="mt-3 text-2xl font-black text-slate-900">{localSettings?.devices?.faceEnabled ? 'مفعلة' : 'غير مفعلة'}</div></div>
              <div className="rounded-3xl bg-amber-50 p-5 ring-1 ring-amber-100"><div className="text-sm font-bold text-amber-800">منع التكرار</div><div className="mt-3 text-2xl font-black text-slate-900">{localSettings?.devices?.duplicateScanBlocked ? 'نشط' : 'غير نشط'}</div></div>
            </div>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              {[
                ["barcodeEnabled", "تفعيل قارئ QR"],
                ["faceEnabled", "تفعيل مسار بصمة الوجه"],
                ["duplicateScanBlocked", "منع التكرار في اليوم نفسه"],
              ].map(([key, label]) => (
                <label key={key} className="flex items-center gap-3 rounded-2xl bg-slate-50 px-4 py-4 ring-1 ring-slate-200">
                  <input
                    type="checkbox"
                    checked={Boolean(localSettings.devices[key])}
                    onChange={(e) => setLocalSettings({ ...localSettings, devices: { ...localSettings.devices, [key]: e.target.checked } })}
                  />
                  <span className="font-bold text-slate-700">{label}</span>
                </label>
              ))}
            </div>
          </div>
        )}

        {tab === "auth" && !forcedTab && (
          <div className="rounded-3xl bg-amber-50 p-5 text-amber-900 ring-1 ring-amber-200">
            <div className="font-black">تنبيه تنظيمي</div>
            <div className="mt-2 text-sm leading-7">إعدادات الدخول والمصادقة أصبحت صفحة عامة مستقلة على مستوى المنصة. استخدم من القائمة الجانبية للأدمن العام صفحة «الدخول والمصادقة» بدل إعدادات المدرسة.</div>
          </div>
        )}

        {tab === "auth" && (
          <div className="space-y-5">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
              <label className="flex items-center gap-3 rounded-2xl bg-slate-50 px-4 py-4 ring-1 ring-slate-200"><input type="checkbox" checked={Boolean(localSettings.auth?.allowPasswordLogin)} onChange={(e) => setLocalSettings({ ...localSettings, auth: { ...localSettings.auth, allowPasswordLogin: e.target.checked } })} /><span className="font-bold text-slate-700">السماح بالدخول بكلمة المرور</span></label>
              <label className="flex items-center gap-3 rounded-2xl bg-slate-50 px-4 py-4 ring-1 ring-slate-200"><input type="checkbox" checked={Boolean(localSettings.auth?.otpEnabled)} onChange={(e) => setLocalSettings({ ...localSettings, auth: { ...localSettings.auth, otpEnabled: e.target.checked } })} /><span className="font-bold text-slate-700">تفعيل OTP</span></label>
              <label className="flex items-center gap-3 rounded-2xl bg-slate-50 px-4 py-4 ring-1 ring-slate-200"><input type="checkbox" checked={Boolean(localSettings.auth?.passwordlessEnabled)} onChange={(e) => setLocalSettings({ ...localSettings, auth: { ...localSettings.auth, passwordlessEnabled: e.target.checked } })} /><span className="font-bold text-slate-700">تفعيل الدخول بدون كلمة مرور</span></label>
            </div>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              <Select label="معرّف الدخول الأساسي" value={localSettings.auth?.identifierMode || 'username'} onChange={(e) => setLocalSettings({ ...localSettings, auth: { ...localSettings.auth, identifierMode: e.target.value } })}>
                <option value="username">اسم المستخدم</option>
                <option value="email_or_username">البريد أو اسم المستخدم</option>
                <option value="email_or_mobile_or_username">الجوال أو البريد أو اسم المستخدم</option>
              </Select>
              <Input label="مدة صلاحية الرمز بالدقائق" type="number" value={localSettings.auth?.otpExpiryMinutes || 10} onChange={(e) => setLocalSettings({ ...localSettings, auth: { ...localSettings.auth, otpExpiryMinutes: safeNumber(e.target.value, 10) } })} />
              <Input label="طول الرمز" type="number" value={localSettings.auth?.otpLength || 6} onChange={(e) => setLocalSettings({ ...localSettings, auth: { ...localSettings.auth, otpLength: safeNumber(e.target.value, 6) } })} />
            </div>
            <div className="rounded-3xl bg-slate-50 p-5 ring-1 ring-slate-200">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <div className="font-black text-slate-800">من يستفيد من OTP / Passwordless؟</div>
                  <div className="mt-1 text-sm leading-7 text-slate-500">كل شيء اختياري: يمكنك فتحها للجميع أو تخصيصها لأدوار أو مستخدمين محددين، مع إمكانية استثناء حسابات بعينها.</div>
                </div>
              </div>
              <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
                <Select label="نطاق التطبيق" value={authTargeting.applyScope || 'all'} onChange={(e) => setLocalSettings({ ...localSettings, auth: { ...localSettings.auth, targeting: { ...authTargeting, applyScope: e.target.value } } })}>
                  <option value="all">متاح لجميع المستخدمين</option>
                  <option value="selected">متاح فقط للمحددّين</option>
                </Select>
                <label className="flex items-center gap-3 rounded-2xl bg-white px-4 py-4 ring-1 ring-slate-200"><input type="checkbox" checked={Boolean(authTargeting.forceForSelected)} onChange={(e) => setLocalSettings({ ...localSettings, auth: { ...localSettings.auth, targeting: { ...authTargeting, forceForSelected: e.target.checked } } })} /><span className="font-bold text-slate-700">إجبار المحددين على الرمز فقط وإيقاف كلمة المرور عنهم</span></label>
              </div>
              <div className="mt-4 grid grid-cols-1 gap-4 xl:grid-cols-3">
                <div className="rounded-2xl bg-white p-4 ring-1 ring-slate-200">
                  <div className="font-bold text-slate-800">الأدوار المشمولة</div>
                  <div className="mt-3 space-y-2">
                    {roles.map((role) => (
                      <label key={role.key} className="flex items-center gap-3 rounded-2xl bg-slate-50 px-3 py-3 text-sm font-bold text-slate-700 ring-1 ring-slate-200">
                        <input type="checkbox" checked={(authTargeting.selectedRoleKeys || []).includes(role.key)} onChange={() => toggleAuthTargetListValue('selectedRoleKeys', role.key)} />
                        <span>{role.label}</span>
                      </label>
                    ))}
                  </div>
                </div>
                <div className="rounded-2xl bg-white p-4 ring-1 ring-slate-200 xl:col-span-2">
                  <div className="font-bold text-slate-800">مستخدمون محددون</div>
                  <div className="mt-1 text-xs text-slate-500">اختر مستخدمين بعينهم لإتاحة OTP لهم حتى لو لم يكن دورهم ضمن القائمة.</div>
                  <div className="mt-3 max-h-64 space-y-2 overflow-auto pr-1">
                    {authManagedUsers.map((user) => (
                      <label key={user.id} className="flex items-start gap-3 rounded-2xl bg-slate-50 px-3 py-3 text-sm ring-1 ring-slate-200">
                        <input type="checkbox" checked={(authTargeting.selectedUserIds || []).includes(user.id)} onChange={() => toggleAuthTargetListValue('selectedUserIds', user.id)} className="mt-1" />
                        <span>
                          <span className="block font-bold text-slate-800">{user.name}</span>
                          <span className="block text-slate-500">{getRoleLabel(user.role)} • {user.username} • {user.schoolName}</span>
                        </span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
              <div className="mt-4 rounded-2xl bg-white p-4 ring-1 ring-slate-200">
                <div className="font-bold text-slate-800">حسابات مستثناة</div>
                <div className="mt-1 text-xs text-slate-500">هذه الحسابات لن يظهر لها OTP ولن تُفرض عليها المصادقة بدون كلمة مرور حتى لو كانت ضمن الدور أو التحديد.</div>
                <div className="mt-3 max-h-56 grid grid-cols-1 gap-2 overflow-auto pr-1 md:grid-cols-2">
                  {authManagedUsers.map((user) => (
                    <label key={`ex-${user.id}`} className="flex items-start gap-3 rounded-2xl bg-slate-50 px-3 py-3 text-sm ring-1 ring-slate-200">
                      <input type="checkbox" checked={(authTargeting.excludedUserIds || []).includes(user.id)} onChange={() => toggleAuthTargetListValue('excludedUserIds', user.id)} className="mt-1" />
                      <span>
                        <span className="block font-bold text-slate-800">{user.name}</span>
                        <span className="block text-slate-500">{getRoleLabel(user.role)} • {user.username}</span>
                      </span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
            <div className="rounded-3xl bg-amber-50/70 p-5 ring-1 ring-amber-200">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <div className="font-black text-slate-800">الحماية من كثرة المحاولات الفاشلة</div>
                  <div className="mt-1 text-sm leading-7 text-slate-500">ميزة اختيارية لحماية الدخول: قفل مؤقت عند تكرار الفشل، مع إشعار الأدمن عبر القنوات العامة التي تحددها هنا.</div>
                </div>
                <label className="flex items-center gap-3 rounded-2xl bg-white px-4 py-4 ring-1 ring-amber-200"><input type="checkbox" checked={Boolean(localSettings.auth?.security?.enabled)} onChange={(e) => setLocalSettings({ ...localSettings, auth: { ...localSettings.auth, security: { ...localSettings.auth?.security, enabled: e.target.checked } } })} /><span className="font-bold text-slate-700">تفعيل الحماية الأمنية</span></label>
              </div>
              <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
                <Input label="عدد المحاولات الفاشلة قبل القفل" type="number" value={localSettings.auth?.security?.maxFailedAttempts || 5} onChange={(e) => setLocalSettings({ ...localSettings, auth: { ...localSettings.auth, security: { ...localSettings.auth?.security, maxFailedAttempts: safeNumber(e.target.value, 5) } } })} />
                <Input label="نافذة المراقبة بالدقائق" type="number" value={localSettings.auth?.security?.trackWindowMinutes || 15} onChange={(e) => setLocalSettings({ ...localSettings, auth: { ...localSettings.auth, security: { ...localSettings.auth?.security, trackWindowMinutes: safeNumber(e.target.value, 15) } } })} />
                <Input label="مدة القفل المؤقت بالدقائق" type="number" value={localSettings.auth?.security?.lockoutMinutes || 15} onChange={(e) => setLocalSettings({ ...localSettings, auth: { ...localSettings.auth, security: { ...localSettings.auth?.security, lockoutMinutes: safeNumber(e.target.value, 15) } } })} />
                <div className="rounded-2xl bg-white px-4 py-3 text-sm leading-7 text-slate-600 ring-1 ring-slate-200">عند نجاح الدخول لاحقًا أو انتهاء مدة القفل، يُرفع القفل تلقائيًا.</div>
              </div>
              <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-3">
                <label className="flex items-center gap-3 rounded-2xl bg-white px-4 py-4 ring-1 ring-slate-200"><input type="checkbox" checked={Boolean(localSettings.auth?.security?.applyToPassword)} onChange={(e) => setLocalSettings({ ...localSettings, auth: { ...localSettings.auth, security: { ...localSettings.auth?.security, applyToPassword: e.target.checked } } })} /><span className="font-bold text-slate-700">تطبيقها على كلمة المرور</span></label>
                <label className="flex items-center gap-3 rounded-2xl bg-white px-4 py-4 ring-1 ring-slate-200"><input type="checkbox" checked={Boolean(localSettings.auth?.security?.applyToOtp)} onChange={(e) => setLocalSettings({ ...localSettings, auth: { ...localSettings.auth, security: { ...localSettings.auth?.security, applyToOtp: e.target.checked } } })} /><span className="font-bold text-slate-700">تطبيقها على OTP</span></label>
                <label className="flex items-center gap-3 rounded-2xl bg-white px-4 py-4 ring-1 ring-slate-200"><input type="checkbox" checked={Boolean(localSettings.auth?.security?.notifyAdminOnLock)} onChange={(e) => setLocalSettings({ ...localSettings, auth: { ...localSettings.auth, security: { ...localSettings.auth?.security, notifyAdminOnLock: e.target.checked } } })} /><span className="font-bold text-slate-700">إشعار الأدمن عند القفل</span></label>
              </div>
              <div className="mt-4 rounded-2xl bg-white p-4 ring-1 ring-slate-200">
                <div className="font-bold text-slate-800">قنوات تنبيه الأدمن</div>
                <div className="mt-1 text-xs leading-6 text-slate-500">البريد وSMS وواتساب كلها تُدار من هذه الصفحة كإعداد عام على مستوى المنصة.</div>
                <div className="mt-3 grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-4">
                  <label className="flex items-center gap-3 rounded-2xl bg-slate-50 px-4 py-4 ring-1 ring-slate-200"><input type="checkbox" checked={Boolean(localSettings.auth?.security?.notificationChannels?.internal)} onChange={(e) => setLocalSettings({ ...localSettings, auth: { ...localSettings.auth, security: { ...localSettings.auth?.security, notificationChannels: { ...localSettings.auth?.security?.notificationChannels, internal: e.target.checked } } } })} /><span className="font-bold text-slate-700">إشعار داخلي</span></label>
                  <label className="flex items-center gap-3 rounded-2xl bg-slate-50 px-4 py-4 ring-1 ring-slate-200"><input type="checkbox" checked={Boolean(localSettings.auth?.security?.notificationChannels?.email)} onChange={(e) => setLocalSettings({ ...localSettings, auth: { ...localSettings.auth, security: { ...localSettings.auth?.security, notificationChannels: { ...localSettings.auth?.security?.notificationChannels, email: e.target.checked } } } })} /><span className="font-bold text-slate-700">بريد إلكتروني</span></label>
                  <label className="flex items-center gap-3 rounded-2xl bg-slate-50 px-4 py-4 ring-1 ring-slate-200"><input type="checkbox" checked={Boolean(localSettings.auth?.security?.notificationChannels?.sms)} onChange={(e) => setLocalSettings({ ...localSettings, auth: { ...localSettings.auth, security: { ...localSettings.auth?.security, notificationChannels: { ...localSettings.auth?.security?.notificationChannels, sms: e.target.checked } } } })} /><span className="font-bold text-slate-700">SMS</span></label>
                  <label className="flex items-center gap-3 rounded-2xl bg-slate-50 px-4 py-4 ring-1 ring-slate-200"><input type="checkbox" checked={Boolean(localSettings.auth?.security?.notificationChannels?.whatsapp)} onChange={(e) => setLocalSettings({ ...localSettings, auth: { ...localSettings.auth, security: { ...localSettings.auth?.security, notificationChannels: { ...localSettings.auth?.security?.notificationChannels, whatsapp: e.target.checked } } } })} /><span className="font-bold text-slate-700">واتساب</span></label>
                </div>
              </div>
            </div>
            <div className="rounded-3xl bg-slate-50 p-5 ring-1 ring-slate-200">
              <div className="font-black text-slate-800">قنوات إرسال رمز التحقق</div>
              <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-3">
                <label className="flex items-center gap-3 rounded-2xl bg-white px-4 py-4 ring-1 ring-slate-200"><input type="checkbox" checked={Boolean(localSettings.auth?.delivery?.email)} onChange={(e) => setLocalSettings({ ...localSettings, auth: { ...localSettings.auth, delivery: { ...localSettings.auth?.delivery, email: e.target.checked } } })} /><span className="font-bold text-slate-700">البريد الإلكتروني</span></label>
                <label className="flex items-center gap-3 rounded-2xl bg-white px-4 py-4 ring-1 ring-slate-200"><input type="checkbox" checked={Boolean(localSettings.auth?.delivery?.sms)} onChange={(e) => setLocalSettings({ ...localSettings, auth: { ...localSettings.auth, delivery: { ...localSettings.auth?.delivery, sms: e.target.checked } } })} /><span className="font-bold text-slate-700">رسالة نصية SMS</span></label>
                <label className="flex items-center gap-3 rounded-2xl bg-white px-4 py-4 ring-1 ring-slate-200"><input type="checkbox" checked={Boolean(localSettings.auth?.delivery?.whatsapp)} onChange={(e) => setLocalSettings({ ...localSettings, auth: { ...localSettings.auth, delivery: { ...localSettings.auth?.delivery, whatsapp: e.target.checked } } })} /><span className="font-bold text-slate-700">واتساب</span></label>
              </div>
            </div>
            <div className="rounded-3xl bg-white p-5 ring-1 ring-slate-200">
              <div className="font-black text-slate-800">إعدادات البريد لإرسال OTP</div>
              <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
                <Input label="اسم المرسل" value={localSettings.auth?.email?.fromName || ''} onChange={(e) => setLocalSettings({ ...localSettings, auth: { ...localSettings.auth, email: { ...localSettings.auth?.email, fromName: e.target.value } } })} />
                <Input label="بريد المرسل" value={localSettings.auth?.email?.fromEmail || ''} onChange={(e) => setLocalSettings({ ...localSettings, auth: { ...localSettings.auth, email: { ...localSettings.auth?.email, fromEmail: e.target.value.toLowerCase() } } })} placeholder="no-reply@example.com" />
                <Input label="SMTP Host" value={localSettings.auth?.email?.smtpHost || ''} onChange={(e) => setLocalSettings({ ...localSettings, auth: { ...localSettings.auth, email: { ...localSettings.auth?.email, smtpHost: e.target.value } } })} placeholder="smtp.office365.com" />
                <Input label="SMTP Port" type="number" value={localSettings.auth?.email?.smtpPort || 587} onChange={(e) => setLocalSettings({ ...localSettings, auth: { ...localSettings.auth, email: { ...localSettings.auth?.email, smtpPort: safeNumber(e.target.value, 587) } } })} />
                <Input label="SMTP Username" value={localSettings.auth?.email?.smtpUsername || ''} onChange={(e) => setLocalSettings({ ...localSettings, auth: { ...localSettings.auth, email: { ...localSettings.auth?.email, smtpUsername: e.target.value } } })} />
                <Input label="SMTP Password" type="password" value={localSettings.auth?.email?.smtpPassword || ''} onChange={(e) => setLocalSettings({ ...localSettings, auth: { ...localSettings.auth, email: { ...localSettings.auth?.email, smtpPassword: e.target.value } } })} />
                <label className="flex items-center gap-3 rounded-2xl bg-slate-50 px-4 py-4 ring-1 ring-slate-200 md:col-span-2"><input type="checkbox" checked={Boolean(localSettings.auth?.email?.smtpSecure)} onChange={(e) => setLocalSettings({ ...localSettings, auth: { ...localSettings.auth, email: { ...localSettings.auth?.email, smtpSecure: e.target.checked } } })} /><span className="font-bold text-slate-700">استخدام اتصال آمن SSL/TLS</span></label>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
              <div className="rounded-3xl bg-white p-5 ring-1 ring-slate-200">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <div className="font-black text-slate-800">ربط SMS العام للمنصة</div>
                    <div className="mt-1 text-sm leading-7 text-slate-500">هذا الربط يستخدمه OTP والتنبيهات الأمنية العامة دون ارتباط بأي مدرسة.</div>
                  </div>
                  <Badge tone={localSettings.auth?.integrations?.sms?.status === 'مرتبط' ? 'green' : localSettings.auth?.integrations?.sms?.status === 'فشل الاختبار' ? 'rose' : 'slate'}>{localSettings.auth?.integrations?.sms?.status || 'غير مختبر'}</Badge>
                </div>
                <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
                  <Input label="اسم المزود" value={localSettings.auth?.integrations?.sms?.providerName || ''} onChange={(e) => setLocalSettings({ ...localSettings, auth: { ...localSettings.auth, integrations: { ...localSettings.auth?.integrations, sms: { ...localSettings.auth?.integrations?.sms, providerName: e.target.value } } } })} />
                  <Input label="Sender ID" value={localSettings.auth?.integrations?.sms?.senderId || ''} onChange={(e) => setLocalSettings({ ...localSettings, auth: { ...localSettings.auth, integrations: { ...localSettings.auth?.integrations, sms: { ...localSettings.auth?.integrations?.sms, senderId: e.target.value } } } })} />
                  <Input label="رابط API" value={localSettings.auth?.integrations?.sms?.apiUrl || ''} onChange={(e) => setLocalSettings({ ...localSettings, auth: { ...localSettings.auth, integrations: { ...localSettings.auth?.integrations, sms: { ...localSettings.auth?.integrations?.sms, apiUrl: e.target.value } } } })} placeholder="https://provider.example.com/send" />
                  <Input label="API Key" value={localSettings.auth?.integrations?.sms?.apiKey || ''} onChange={(e) => setLocalSettings({ ...localSettings, auth: { ...localSettings.auth, integrations: { ...localSettings.auth?.integrations, sms: { ...localSettings.auth?.integrations?.sms, apiKey: e.target.value } } } })} />
                  <Input label="اسم المستخدم" value={localSettings.auth?.integrations?.sms?.username || ''} onChange={(e) => setLocalSettings({ ...localSettings, auth: { ...localSettings.auth, integrations: { ...localSettings.auth?.integrations, sms: { ...localSettings.auth?.integrations?.sms, username: e.target.value } } } })} />
                  <Input label="كلمة المرور" type="password" value={localSettings.auth?.integrations?.sms?.password || ''} onChange={(e) => setLocalSettings({ ...localSettings, auth: { ...localSettings.auth, integrations: { ...localSettings.auth?.integrations, sms: { ...localSettings.auth?.integrations?.sms, password: e.target.value } } } })} />
                </div>
              </div>
              <div className="rounded-3xl bg-white p-5 ring-1 ring-slate-200">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <div className="font-black text-slate-800">ربط واتساب العام للمنصة</div>
                    <div className="mt-1 text-sm leading-7 text-slate-500">هذا الربط يستخدمه OTP والتنبيهات الأمنية العامة عبر WhatsApp Cloud API.</div>
                  </div>
                  <Badge tone={localSettings.auth?.integrations?.whatsapp?.status === 'مرتبط' ? 'green' : localSettings.auth?.integrations?.whatsapp?.status === 'فشل الاختبار' ? 'rose' : 'slate'}>{localSettings.auth?.integrations?.whatsapp?.status || 'غير مختبر'}</Badge>
                </div>
                <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
                  <Input label="Phone Number ID" value={localSettings.auth?.integrations?.whatsapp?.phoneNumberId || ''} onChange={(e) => setLocalSettings({ ...localSettings, auth: { ...localSettings.auth, integrations: { ...localSettings.auth?.integrations, whatsapp: { ...localSettings.auth?.integrations?.whatsapp, phoneNumberId: e.target.value } } } })} />
                  <Input label="Business Account ID" value={localSettings.auth?.integrations?.whatsapp?.businessAccountId || ''} onChange={(e) => setLocalSettings({ ...localSettings, auth: { ...localSettings.auth, integrations: { ...localSettings.auth?.integrations, whatsapp: { ...localSettings.auth?.integrations?.whatsapp, businessAccountId: e.target.value } } } })} />
                  <Input label="Access Token" type="password" value={localSettings.auth?.integrations?.whatsapp?.accessToken || ''} onChange={(e) => setLocalSettings({ ...localSettings, auth: { ...localSettings.auth, integrations: { ...localSettings.auth?.integrations, whatsapp: { ...localSettings.auth?.integrations?.whatsapp, accessToken: e.target.value } } } })} />
                  <Input label="Webhook Verify Token" value={localSettings.auth?.integrations?.whatsapp?.webhookVerifyToken || ''} onChange={(e) => setLocalSettings({ ...localSettings, auth: { ...localSettings.auth, integrations: { ...localSettings.auth?.integrations, whatsapp: { ...localSettings.auth?.integrations?.whatsapp, webhookVerifyToken: e.target.value } } } })} />
                </div>
              </div>
            </div>
            <div className="rounded-3xl bg-white p-5 ring-1 ring-slate-200">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <div className="font-black text-slate-800">اختبار قنوات الدخول العامة</div>
                  <div className="mt-1 text-sm leading-7 text-slate-500">بعد حفظ الإعدادات يمكنك اختبار البريد وSMS وواتساب وOTP من هنا مباشرة. الاختبار يقرأ الإعدادات المحفوظة الحالية، لذلك احفظ أولًا أي تغيير جديد قبل التنفيذ.</div>
                </div>
                <Badge tone="blue">إعداد عام على مستوى المنصة</Badge>
              </div>
              <div className="mt-4 grid grid-cols-1 gap-4 xl:grid-cols-3">
                <div className="rounded-2xl bg-slate-50 p-4 ring-1 ring-slate-200">
                  <div className="font-bold text-slate-800">اختبار البريد الإلكتروني</div>
                  <Input label="البريد المستهدف" value={authTestDraft.emailTarget} onChange={(e) => updateAuthTestField('emailTarget', e.target.value.toLowerCase())} placeholder="test@example.com" />
                  <button type="button" onClick={() => runAuthDeliveryTest('email')} disabled={authTestBusy === 'delivery-email'} className="mt-3 inline-flex items-center gap-2 rounded-2xl bg-sky-700 px-4 py-3 text-sm font-bold text-white disabled:opacity-60">{authTestBusy === 'delivery-email' ? <Loader2 className="h-4 w-4 animate-spin" /> : <ShieldCheck className="h-4 w-4" />} اختبار البريد</button>
                  {authTestStatus.email ? <div className={`mt-3 rounded-2xl px-4 py-3 text-sm leading-7 ${authTestStatus.email.ok ? 'bg-emerald-50 text-emerald-800 ring-1 ring-emerald-200' : 'bg-rose-50 text-rose-800 ring-1 ring-rose-200'}`}>{authTestStatus.email.message}{authTestStatus.email.destinationPreview ? `
الوجهة: ${authTestStatus.email.destinationPreview}` : ''}{authTestStatus.email.previewCode ? `
الرمز التجريبي: ${authTestStatus.email.previewCode}` : ''}</div> : null}
                </div>
                <div className="rounded-2xl bg-slate-50 p-4 ring-1 ring-slate-200">
                  <div className="font-bold text-slate-800">اختبار SMS</div>
                  <Input label="رقم الجوال المستهدف" value={authTestDraft.smsTarget} onChange={(e) => updateAuthTestField('smsTarget', e.target.value)} placeholder="9665xxxxxxxx" />
                  <button type="button" onClick={() => runAuthDeliveryTest('sms')} disabled={authTestBusy === 'delivery-sms'} className="mt-3 inline-flex items-center gap-2 rounded-2xl bg-slate-900 px-4 py-3 text-sm font-bold text-white disabled:opacity-60">{authTestBusy === 'delivery-sms' ? <Loader2 className="h-4 w-4 animate-spin" /> : <Bell className="h-4 w-4" />} اختبار SMS</button>
                  {authTestStatus.sms ? <div className={`mt-3 rounded-2xl px-4 py-3 text-sm leading-7 ${authTestStatus.sms.ok ? 'bg-emerald-50 text-emerald-800 ring-1 ring-emerald-200' : 'bg-rose-50 text-rose-800 ring-1 ring-rose-200'}`}>{authTestStatus.sms.message}{authTestStatus.sms.destinationPreview ? `
الوجهة: ${authTestStatus.sms.destinationPreview}` : ''}{authTestStatus.sms.providerMessageId ? `
معرّف المزود: ${authTestStatus.sms.providerMessageId}` : ''}</div> : null}
                </div>
                <div className="rounded-2xl bg-slate-50 p-4 ring-1 ring-slate-200">
                  <div className="font-bold text-slate-800">اختبار واتساب</div>
                  <Input label="رقم الجوال المستهدف" value={authTestDraft.whatsappTarget} onChange={(e) => updateAuthTestField('whatsappTarget', e.target.value)} placeholder="9665xxxxxxxx" />
                  <button type="button" onClick={() => runAuthDeliveryTest('whatsapp')} disabled={authTestBusy === 'delivery-whatsapp'} className="mt-3 inline-flex items-center gap-2 rounded-2xl bg-emerald-700 px-4 py-3 text-sm font-bold text-white disabled:opacity-60">{authTestBusy === 'delivery-whatsapp' ? <Loader2 className="h-4 w-4 animate-spin" /> : <Shield className="h-4 w-4" />} اختبار واتساب</button>
                  {authTestStatus.whatsapp ? <div className={`mt-3 rounded-2xl px-4 py-3 text-sm leading-7 ${authTestStatus.whatsapp.ok ? 'bg-emerald-50 text-emerald-800 ring-1 ring-emerald-200' : 'bg-rose-50 text-rose-800 ring-1 ring-rose-200'}`}>{authTestStatus.whatsapp.message}{authTestStatus.whatsapp.destinationPreview ? `
الوجهة: ${authTestStatus.whatsapp.destinationPreview}` : ''}{authTestStatus.whatsapp.providerMessageId ? `
معرّف المزود: ${authTestStatus.whatsapp.providerMessageId}` : ''}</div> : null}
                </div>
              </div>
              <div className="mt-4 rounded-2xl bg-slate-50 p-4 ring-1 ring-slate-200">
                <div className="font-bold text-slate-800">اختبار سيناريو OTP على حساب تجريبي</div>
                <div className="mt-1 text-xs leading-6 text-slate-500">سيتم إرسال رمز حقيقي أو تجريبي للمستخدم المحدد حسب القناة المختارة. هذا الاختبار يعكس شروط التطبيق الفعلية مثل التفعيل والاستثناءات وربط البريد أو الجوال.</div>
                <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
                  <Select label="المستخدم التجريبي" value={authTestDraft.otpUserId} onChange={(e) => updateAuthTestField('otpUserId', e.target.value)}>
                    <option value="">اختر مستخدمًا</option>
                    {authManagedUsers.map((user) => <option key={`otp-user-${user.id}`} value={user.id}>{user.name} — {user.username} — {getRoleLabel(user.role)}</option>)}
                  </Select>
                  <Select label="القناة" value={authTestDraft.otpDelivery} onChange={(e) => updateAuthTestField('otpDelivery', e.target.value)}>
                    {localSettings.auth?.delivery?.email ? <option value="email">البريد الإلكتروني</option> : null}
                    {localSettings.auth?.delivery?.sms ? <option value="sms">SMS</option> : null}
                    {localSettings.auth?.delivery?.whatsapp ? <option value="whatsapp">واتساب</option> : null}
                  </Select>
                  <div className="flex items-end">
                    <button type="button" onClick={runOtpScenarioTest} disabled={authTestBusy === 'otp-scenario'} className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-violet-700 px-4 py-3 text-sm font-bold text-white disabled:opacity-60">{authTestBusy === 'otp-scenario' ? <Loader2 className="h-4 w-4 animate-spin" /> : <BadgeCheck className="h-4 w-4" />} اختبار OTP على الحساب</button>
                  </div>
                </div>
                {authTestStatus.otpScenario ? <div className={`mt-4 rounded-2xl px-4 py-3 text-sm leading-7 ${authTestStatus.otpScenario.ok ? 'bg-emerald-50 text-emerald-800 ring-1 ring-emerald-200' : 'bg-rose-50 text-rose-800 ring-1 ring-rose-200'}`}>{authTestStatus.otpScenario.message}{authTestStatus.otpScenario.userName ? `
المستخدم: ${authTestStatus.otpScenario.userName}` : ''}{authTestStatus.otpScenario.destinationPreview ? `
الوجهة: ${authTestStatus.otpScenario.destinationPreview}` : ''}{authTestStatus.otpScenario.previewCode ? `
الرمز التجريبي: ${authTestStatus.otpScenario.previewCode}` : ''}{authTestStatus.otpScenario.expiresAt ? `
تنتهي الصلاحية: ${formatDateTime(authTestStatus.otpScenario.expiresAt)}` : ''}</div> : null}
              </div>
            </div>
            <div className="rounded-3xl bg-white p-5 ring-1 ring-slate-200">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <div className="font-black text-slate-800">سجل محاولات الدخول والرموز</div>
                  <div className="mt-1 text-sm leading-7 text-slate-500">يعرض نجاح وفشل ومنع تسجيل الدخول بكلمة المرور وOTP، مع تفاصيل القناة والسبب والحساب المستهدف متى توفرت البيانات.</div>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <select value={authLogFilter} onChange={(e) => setAuthLogFilter(e.target.value)} className="rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-bold text-slate-700 outline-none focus:border-sky-400">
                    <option value="all">الكل</option>
                    <option value="success">النجاحات</option>
                    <option value="failed">الإخفاقات</option>
                    <option value="blocked">الحالات الممنوعة</option>
                    <option value="otp">أحداث OTP فقط</option>
                  </select>
                  <button type="button" onClick={loadAuthLogs} disabled={authLogsBusy} className="inline-flex items-center gap-2 rounded-2xl bg-slate-100 px-4 py-2.5 text-sm font-bold text-slate-700 disabled:opacity-60">{authLogsBusy ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />} تحديث السجل</button>
                  <button type="button" onClick={() => exportAuthLogs('xlsx')} className="inline-flex items-center gap-2 rounded-2xl bg-emerald-600 px-4 py-2.5 text-sm font-bold text-white"><Download className="h-4 w-4" /> Excel</button>
                  <button type="button" onClick={() => exportAuthLogs('csv')} className="inline-flex items-center gap-2 rounded-2xl bg-sky-600 px-4 py-2.5 text-sm font-bold text-white"><Download className="h-4 w-4" /> CSV</button>
                </div>
              </div>
              <div className="mt-4 grid grid-cols-2 gap-3 md:grid-cols-4 xl:grid-cols-6">
                <div className="rounded-2xl bg-slate-50 p-3 ring-1 ring-slate-200"><div className="text-xs text-slate-500">الإجمالي</div><div className="mt-2 text-2xl font-black text-slate-900">{authLogs.length}</div></div>
                <div className="rounded-2xl bg-emerald-50 p-3 ring-1 ring-emerald-100"><div className="text-xs text-emerald-700">نجاحات</div><div className="mt-2 text-2xl font-black text-emerald-700">{authLogs.filter((entry) => ['login', 'auth_request_otp_success', 'auth_verify_otp_success'].includes(entry.action)).length}</div></div>
                <div className="rounded-2xl bg-rose-50 p-3 ring-1 ring-rose-100"><div className="text-xs text-rose-700">إخفاقات</div><div className="mt-2 text-2xl font-black text-rose-700">{authLogs.filter((entry) => ['auth_login_failed', 'auth_request_otp_failed', 'auth_verify_otp_failed'].includes(entry.action)).length}</div></div>
                <div className="rounded-2xl bg-amber-50 p-3 ring-1 ring-amber-100"><div className="text-xs text-amber-700">ممنوعة</div><div className="mt-2 text-2xl font-black text-amber-700">{authLogs.filter((entry) => ['auth_login_blocked', 'auth_request_otp_blocked', 'auth_verify_otp_blocked'].includes(entry.action)).length}</div></div>
                <div className="rounded-2xl bg-violet-50 p-3 ring-1 ring-violet-100"><div className="text-xs text-violet-700">أحداث OTP</div><div className="mt-2 text-2xl font-black text-violet-700">{authLogs.filter((entry) => String(entry.action || '').includes('otp')).length}</div></div>
                <div className="rounded-2xl bg-sky-50 p-3 ring-1 ring-sky-100"><div className="text-xs text-sky-700">المعروض الآن</div><div className="mt-2 text-2xl font-black text-sky-700">{filteredAuthLogs.length}</div></div>
              </div>
              <div className="mt-4 overflow-x-auto rounded-3xl ring-1 ring-slate-200">
                <table className="min-w-full divide-y divide-slate-200 text-right text-sm">
                  <thead className="bg-slate-50 text-slate-600">
                    <tr>
                      <th className="px-4 py-3 font-bold">الوقت</th>
                      <th className="px-4 py-3 font-bold">الحدث</th>
                      <th className="px-4 py-3 font-bold">الحساب</th>
                      <th className="px-4 py-3 font-bold">الدور</th>
                      <th className="px-4 py-3 font-bold">القناة / السبب</th>
                      <th className="px-4 py-3 font-bold">تفاصيل</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 bg-white">
                    {filteredAuthLogs.length ? filteredAuthLogs.map((entry) => {
                      const meta = getAuthActionMeta(entry.action);
                      const details = entry.details || {};
                      return (
                        <tr key={`auth-log-${entry.id}`} className="align-top">
                          <td className="px-4 py-3 font-medium text-slate-700">{formatDateTime(entry.createdAt)}</td>
                          <td className="px-4 py-3"><Badge tone={meta.tone}>{meta.label}</Badge></td>
                          <td className="px-4 py-3 text-slate-700">{details.userName || details.username || entry.actorUsername || details.identifier || '—'}</td>
                          <td className="px-4 py-3 text-slate-500">{getRoleLabel(details.role || entry.actorRole || '') || '—'}</td>
                          <td className="px-4 py-3 text-slate-600">{details.delivery ? <div>القناة: {details.delivery === 'email' ? 'البريد' : details.delivery === 'sms' ? 'SMS' : details.delivery === 'whatsapp' ? 'واتساب' : details.delivery}</div> : null}{details.reason ? <div>السبب: {getAuthReasonLabel(details.reason)}</div> : null}{details.destinationPreview ? <div>الوجهة: {details.destinationPreview}</div> : null}</td>
                          <td className="px-4 py-3 text-slate-600">{details.userId ? <div>المستخدم #{details.userId}</div> : null}{details.identifier ? <div>المعرّف: {details.identifier}</div> : null}{details.tokenPreview ? <div>جلسة: {details.tokenPreview}...</div> : null}{!details.userId && !details.identifier && !details.tokenPreview && !details.reason && !details.destinationPreview ? '—' : null}</td>
                        </tr>
                      );
                    }) : <tr><td colSpan={6} className="px-4 py-8 text-center text-slate-500">{authLogsBusy ? 'جارٍ تحميل السجل...' : 'لا توجد سجلات مطابقة للفلاتر الحالية.'}</td></tr>}
                  </tbody>
                </table>
              </div>
            </div>
            <div className="rounded-3xl bg-emerald-50 p-4 text-sm leading-7 text-emerald-900 ring-1 ring-emerald-100">هذه الصفحة عامة على مستوى المنصة ويعتمدها الأدمن العام مباشرة. جميع إعدادات OTP وPasswordless والبريد وSMS وواتساب هنا مستقلة عن المدارس. وإذا جعلت النطاق «للمحددّين فقط»، فلن يقبل النظام طلب OTP إلا للحسابات أو الأدوار التي اخترتها هنا.</div>

            {currentUser?.role === 'superadmin' && (
              <div className="mt-6 rounded-3xl bg-slate-900 p-5 ring-1 ring-slate-700">
                <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <Shield className="h-5 w-5 text-sky-400" />
                      <div className="text-lg font-black text-white">التحكم المركزي في بوابة ولي الأمر — جميع المدارس</div>
                    </div>
                    <div className="mt-2 text-sm leading-7 text-slate-400">هذه الإعدادات تنطبق على جميع المدارس في المنصة. تحكم في تفعيل أو تعطيل طرق الدخول لبوابة ولي الأمر بشكل مركزي دون الحاجة للدخول لكل مدرسة على حدة.</div>
                  </div>
                  <Badge tone="violet">أدمن عام</Badge>
                </div>

                <div className="mt-5 grid grid-cols-1 gap-4 lg:grid-cols-2">
                  <div className="rounded-3xl bg-slate-800 p-5 ring-1 ring-slate-700">
                    <div className="font-black text-white">حالة بوابة ولي الأمر</div>
                    <div className="mt-1 text-sm text-slate-400">تفعيل أو تعطيل بوابة ولي الأمر لجميع المدارس</div>
                    <div className="mt-4 flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          const updated = { ...localSettings, parentPortal: { ...(localSettings.parentPortal || {}), enabled: true } };
                          setLocalSettings(updated);
                        }}
                        className={`rounded-2xl px-4 py-2 text-sm font-bold transition ${
                          localSettings.parentPortal?.enabled !== false ? 'bg-emerald-600 text-white ring-2 ring-emerald-400' : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                        }`}
                      >
                        مفعّلة للجميع
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          const updated = { ...localSettings, parentPortal: { ...(localSettings.parentPortal || {}), enabled: false } };
                          setLocalSettings(updated);
                        }}
                        className={`rounded-2xl px-4 py-2 text-sm font-bold transition ${
                          localSettings.parentPortal?.enabled === false ? 'bg-rose-600 text-white ring-2 ring-rose-400' : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                        }`}
                      >
                        معطّلة للجميع
                      </button>
                    </div>
                  </div>

                  <div className="rounded-3xl bg-slate-800 p-5 ring-1 ring-slate-700">
                    <div className="font-black text-white">السماح بتسجيل حسابات جديدة</div>
                    <div className="mt-1 text-sm text-slate-400">هل يمكن لأولياء الأمور الجدد إنشاء حسابات؟</div>
                    <div className="mt-4 flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          const updated = { ...localSettings, parentPortal: { ...(localSettings.parentPortal || {}), allowRegistration: true } };
                          setLocalSettings(updated);
                        }}
                        className={`rounded-2xl px-4 py-2 text-sm font-bold transition ${
                          localSettings.parentPortal?.allowRegistration === true ? 'bg-emerald-600 text-white ring-2 ring-emerald-400' : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                        }`}
                      >
                        مسموح
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          const updated = { ...localSettings, parentPortal: { ...(localSettings.parentPortal || {}), allowRegistration: false } };
                          setLocalSettings(updated);
                        }}
                        className={`rounded-2xl px-4 py-2 text-sm font-bold transition ${
                          localSettings.parentPortal?.allowRegistration !== true ? 'bg-rose-600 text-white ring-2 ring-rose-400' : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                        }`}
                      >
                        ممنوع
                      </button>
                    </div>
                  </div>
                </div>

                <div className="mt-4 rounded-3xl bg-slate-800 p-5 ring-1 ring-slate-700">
                  <div className="font-black text-white">طرق الدخول المتاحة لأولياء الأمور</div>
                  <div className="mt-1 text-sm text-slate-400">اختر الطرق المسموح بها للدخول إلى بوابة ولي الأمر — تنطبق على جميع المدارس</div>
                  <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-2">
                    {[
                      { key: 'nationalId', label: 'رقم الهوية الوطنية / الإقامة', desc: 'الدخول باستخدام رقم هوية الطالب' },
                      { key: 'studentId', label: 'رقم الطالب في المنصة', desc: 'الدخول باستخدام معرّف الطالب الداخلي' },
                      { key: 'mobileNumber', label: 'رقم الجوال', desc: 'الدخول عبر رقم جوال ولي الأمر المسجّل' },
                      { key: 'email', label: 'البريد الإلكتروني', desc: 'الدخول عبر البريد الإلكتروني لولي الأمر' },
                    ].map((method) => {
                      const isEnabled = localSettings.parentPortal?.loginMethods?.[method.key] !== false;
                      return (
                        <div key={method.key} className="flex items-start justify-between gap-3 rounded-2xl bg-slate-700 p-4 ring-1 ring-slate-600">
                          <div>
                            <div className="font-bold text-white">{method.label}</div>
                            <div className="mt-1 text-xs text-slate-400">{method.desc}</div>
                          </div>
                          <button
                            type="button"
                            onClick={() => {
                              const updated = {
                                ...localSettings,
                                parentPortal: {
                                  ...(localSettings.parentPortal || {}),
                                  loginMethods: {
                                    ...(localSettings.parentPortal?.loginMethods || {}),
                                    [method.key]: !isEnabled,
                                  },
                                },
                              };
                              setLocalSettings(updated);
                            }}
                            className={`shrink-0 rounded-2xl px-4 py-2 text-sm font-bold transition ${
                              isEnabled ? 'bg-emerald-600 text-white hover:bg-emerald-700' : 'bg-slate-600 text-slate-300 hover:bg-slate-500'
                            }`}
                          >
                            {isEnabled ? 'مفعّل' : 'معطّل'}
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="mt-4 rounded-2xl bg-amber-900/40 px-4 py-3 text-sm font-bold text-amber-300 ring-1 ring-amber-700">
                  تذكّر الضغط على «حفظ الإعدادات» في الأسفل لتطبيق التغييرات على جميع المدارس.
                </div>
              </div>
            )}

          </div>
        )}

        {tab === "backup" && currentUser?.role === "superadmin" && (          <div className="space-y-4">
            <div className="grid grid-cols-1 gap-4 xl:grid-cols-[1.3fr_.7fr]">
              <div className="rounded-3xl bg-slate-50 p-5 ring-1 ring-slate-200">
                <div className="font-bold text-slate-800">نسخة احتياطية واستعادة</div>
                <div className="mt-2 text-sm leading-7 text-slate-600">يمكنك أخذ نسخة كاملة من المدارس والطلاب والإعدادات وسجل الحضور والإجراءات، ثم استعادتها لاحقًا داخل نفس الواجهة.</div>
                <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-3">
                  <button onClick={onExportBackup} className="inline-flex items-center justify-center gap-2 rounded-2xl bg-sky-700 px-4 py-3 font-bold text-white"><Download className="h-4 w-4" /> تصدير JSON</button>
                  <button onClick={() => fileRef.current?.click()} className="inline-flex items-center justify-center gap-2 rounded-2xl bg-slate-100 px-4 py-3 font-bold text-slate-700"><Upload className="h-4 w-4" /> استعادة نسخة</button>
                  <button onClick={onResetData} className="inline-flex items-center justify-center gap-2 rounded-2xl bg-rose-50 px-4 py-3 font-bold text-rose-700"><RefreshCw className="h-4 w-4" /> إعادة ضبط تجريبية</button>
                </div>
                <input ref={fileRef} type="file" accept="application/json" className="hidden" onChange={handleRestoreFile} />
              </div>
              <div className="rounded-3xl bg-white p-5 ring-1 ring-slate-200">
                <div className="font-bold text-slate-800">الحماية اليومية</div>
                <div className="mt-3 space-y-3 text-sm leading-7 text-slate-600">
                  <div className="rounded-2xl bg-emerald-50 px-4 py-3 ring-1 ring-emerald-100">يتم إنشاء نسخة احتياطية يومية تلقائيًا للنظام الرئيسي ولكل مدرسة بشكل مستقل.</div>
                  <div className="rounded-2xl bg-slate-50 px-4 py-3 ring-1 ring-slate-200">الاحتفاظ الافتراضي: آخر 30 يومًا من النسخ.</div>
                  <div className="rounded-2xl bg-sky-50 px-4 py-3 ring-1 ring-sky-100">أفضل ممارسة: خذ نسخة يدوية إضافية قبل أي استيراد جماعي أو تعديل بنيوي كبير.</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {tab === "diagnostics" && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3 md:grid-cols-5">
              {schoolDiagnostics.map((item) => (
                <div key={item.label} className="rounded-3xl bg-slate-50 p-4 ring-1 ring-slate-200">
                  <div className="text-xs text-slate-500">{item.label}</div>
                  <div className="mt-2 text-3xl font-black text-slate-900">{item.value}</div>
                  <div className="mt-2"><Badge tone={item.tone}>{selectedSchool?.name || "المدرسة الحالية"}</Badge></div>
                </div>
              ))}
            </div>
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
              {readinessChecks.map((item) => (
                <div key={item.title} className="rounded-3xl bg-white p-5 ring-1 ring-slate-200">
                  <div className="flex items-center justify-between gap-3">
                    <div className="font-bold text-slate-800">{item.title}</div>
                    <Badge tone={item.ok ? "green" : "amber"}>{item.ok ? "جاهز" : "يحتاج مراجعة"}</Badge>
                  </div>
                  <div className="mt-3 text-sm leading-7 text-slate-600">{item.description}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {tab === "parentPortal" && canViewParentPortal && (
          <div className="space-y-5">
            <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
              <div className="rounded-3xl bg-emerald-50 p-5 ring-1 ring-emerald-100">
                <div className="text-sm font-bold text-emerald-800">حالة البوابة</div>
                <div className="mt-3 text-2xl font-black text-slate-900">{parentPortalConfig.enabled ? 'مفعلة' : 'مقفلة'}</div>
                <div className="mt-2 text-sm leading-7 text-slate-600">عند الإقفال تتوقف طلبات الدخول الجديدة من /parent، وتبقى الإعدادات والبيانات محفوظة.</div>
              </div>
              <div className="rounded-3xl bg-sky-50 p-5 ring-1 ring-sky-100">
                <div className="text-sm font-bold text-sky-800">سياسة تحديث الرقم</div>
                <div className="mt-3 text-2xl font-black text-slate-900">{parentPortalConfig.mode === 'auto' ? 'تلقائي' : 'يدوي'}</div>
                <div className="mt-2 text-sm leading-7 text-slate-600">الاعتماد التلقائي هو الوضع الافتراضي حتى لا تتكدس الطلبات على المدير، مع بقاء الإشعار وسجل المراجعة.</div>
              </div>
              <div className="rounded-3xl bg-violet-50 p-5 ring-1 ring-violet-100">
                <div className="text-sm font-bold text-violet-800">الطلبات الحالية</div>
                <div className="mt-3 text-2xl font-black text-slate-900">{parentPortalConfig.pendingRequests} / {parentPortalConfig.totalRequests}</div>
                <div className="mt-2 text-sm leading-7 text-slate-600">الأول رقم الطلبات المعلقة، والثاني جميع الطلبات المسجلة في المدرسة.</div>
              </div>
            </div>

            <div className="rounded-3xl bg-slate-50 p-5 ring-1 ring-slate-200">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                <div className="max-w-3xl">
                  <div className="text-lg font-black text-slate-900">إدارة بوابة ولي الأمر</div>
                  <div className="mt-2 text-sm leading-8 text-slate-600">
                    من هنا تفعّل أو تقفل البوابة، وتحدد هل تحديث الرقم الأساسي يتم تلقائيًا أو يدويًا، ثم تفتح صفحة الطلبات التفصيلية عند الحاجة.
                  </div>
                  {!canManageParentPortal ? <div className="mt-3 rounded-2xl bg-amber-50 px-4 py-3 text-sm font-bold text-amber-800 ring-1 ring-amber-200">هذه الصفحة متاحة لك للمتابعة فقط، أما تغيير السياسة والتفعيل فهو من صلاحية الأدمن العام أو مدير المدرسة.</div> : null}
                  {parentPortalConfig.error ? <div className="mt-3 rounded-2xl bg-rose-50 px-4 py-3 text-sm font-bold text-rose-700 ring-1 ring-rose-200">{parentPortalConfig.error}</div> : null}
                </div>
                <div className="flex flex-wrap gap-2">
                  <button type="button" onClick={() => window.open('/parent', '_blank', 'noopener,noreferrer')} className="rounded-2xl bg-white px-4 py-2 text-sm font-bold text-slate-700 ring-1 ring-slate-200 hover:bg-slate-100">فتح بوابة ولي الأمر</button>
                  <button type="button" onClick={() => window.open(`/admin/parent-primary-requests?token=${encodeURIComponent(getSessionToken())}`, '_blank', 'noopener,noreferrer')} className="rounded-2xl bg-sky-700 px-4 py-2 text-sm font-bold text-white hover:bg-sky-800">فتح شاشة الطلبات الكاملة</button>
                </div>
              </div>

              <div className="mt-5 grid grid-cols-1 gap-4 lg:grid-cols-2">
                <div className="rounded-3xl bg-white p-4 ring-1 ring-slate-200">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <div className="font-black text-slate-900">حالة البوابة</div>
                      <div className="mt-1 text-sm text-slate-500">التحكم في إتاحة دخول أولياء الأمور إلى /parent</div>
                    </div>
                    <Badge tone={parentPortalConfig.enabled ? 'green' : 'slate'}>{parentPortalConfig.enabled ? 'مفعلة' : 'مقفلة'}</Badge>
                  </div>
                  <div className="mt-4 flex flex-wrap gap-2">
                    <button type="button" disabled={!canManageParentPortal || parentPortalConfig.saving || parentPortalConfig.enabled} onClick={() => saveParentPortalEnabled(true)} className={`rounded-2xl px-4 py-2 text-sm font-bold transition ${(!canManageParentPortal || parentPortalConfig.saving || parentPortalConfig.enabled) ? 'cursor-not-allowed bg-slate-100 text-slate-400' : 'bg-emerald-700 text-white hover:bg-emerald-800'}`}>تفعيل البوابة</button>
                    <button type="button" disabled={!canManageParentPortal || parentPortalConfig.saving || !parentPortalConfig.enabled} onClick={() => saveParentPortalEnabled(false)} className={`rounded-2xl px-4 py-2 text-sm font-bold transition ${(!canManageParentPortal || parentPortalConfig.saving || !parentPortalConfig.enabled) ? 'cursor-not-allowed bg-slate-100 text-slate-400' : 'bg-rose-700 text-white hover:bg-rose-800'}`}>إقفال البوابة</button>
                  </div>
                </div>

                <div className="rounded-3xl bg-white p-4 ring-1 ring-slate-200">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <div className="font-black text-slate-900">سياسة تحديث الرقم الأساسي</div>
                      <div className="mt-1 text-sm text-slate-500">اختر الوضع الافتراضي المناسب لطريقة عمل المدرسة</div>
                    </div>
                    <Badge tone={parentPortalConfig.mode === 'auto' ? 'green' : 'amber'}>{parentPortalConfig.mode === 'auto' ? 'اعتماد تلقائي' : 'اعتماد يدوي'}</Badge>
                  </div>
                  <div className="mt-4 flex flex-wrap gap-2">
                    <button type="button" disabled={!canManageParentPortal || parentPortalConfig.saving || parentPortalConfig.mode === 'auto'} onClick={() => saveParentPortalMode('auto')} className={`rounded-2xl px-4 py-2 text-sm font-bold transition ${(!canManageParentPortal || parentPortalConfig.saving || parentPortalConfig.mode === 'auto') ? 'cursor-not-allowed bg-slate-100 text-slate-400' : 'bg-sky-700 text-white hover:bg-sky-800'}`}>تلقائي (افتراضي)</button>
                    <button type="button" disabled={!canManageParentPortal || parentPortalConfig.saving || parentPortalConfig.mode === 'manual'} onClick={() => saveParentPortalMode('manual')} className={`rounded-2xl px-4 py-2 text-sm font-bold transition ${(!canManageParentPortal || parentPortalConfig.saving || parentPortalConfig.mode === 'manual') ? 'cursor-not-allowed bg-slate-100 text-slate-400' : 'bg-amber-500 text-white hover:bg-amber-600'}`}>يدوي</button>
                  </div>
                </div>

                <div className="rounded-3xl bg-white p-4 ring-1 ring-slate-200 lg:col-span-2">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <div className="font-black text-slate-900">طريقة الدخول البديل برقم الهوية</div>
                      <div className="mt-1 text-sm text-slate-500">تتيح لولي الأمر الدخول عبر رقم الجوال المسجّل + رقم هوية أحد أبنائه بدلاً من رمز OTP — مفيد عند تعذّر استلام الرمز</div>
                    </div>
                    <Badge tone={parentPortalConfig.altLoginEnabled ? 'green' : 'slate'}>{parentPortalConfig.altLoginEnabled ? 'مفعّل' : 'معطّل'}</Badge>
                  </div>
                  <div className="mt-4 flex flex-wrap gap-2">
                    <button type="button" disabled={!canManageParentPortal || parentPortalConfig.saving || parentPortalConfig.altLoginEnabled} onClick={() => saveParentPortalAltLogin(true)} className={`rounded-2xl px-4 py-2 text-sm font-bold transition ${(!canManageParentPortal || parentPortalConfig.saving || parentPortalConfig.altLoginEnabled) ? 'cursor-not-allowed bg-slate-100 text-slate-400' : 'bg-emerald-700 text-white hover:bg-emerald-800'}`}>تفعيل الدخول البديل</button>
                    <button type="button" disabled={!canManageParentPortal || parentPortalConfig.saving || !parentPortalConfig.altLoginEnabled} onClick={() => saveParentPortalAltLogin(false)} className={`rounded-2xl px-4 py-2 text-sm font-bold transition ${(!canManageParentPortal || parentPortalConfig.saving || !parentPortalConfig.altLoginEnabled) ? 'cursor-not-allowed bg-slate-100 text-slate-400' : 'bg-rose-700 text-white hover:bg-rose-800'}`}>تعطيل الدخول البديل</button>
                  </div>
                </div>
              </div>
            </div>

            <div className="rounded-3xl bg-white p-5 ring-1 ring-slate-200">
              <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <div className="text-lg font-black text-slate-900">آخر إشعارات طلبات الأرقام</div>
                  <div className="mt-1 text-sm leading-7 text-slate-500">تنبيه سريع يساعد المدير على معرفة الطلبات المعتمدة تلقائيًا أو ما يحتاج متابعة لاحقة.</div>
                </div>
                <button type="button" onClick={() => setTab('parentPortal')} className="rounded-2xl bg-slate-100 px-4 py-2 text-sm font-bold text-slate-700 ring-1 ring-slate-200 hover:bg-slate-200">تحديث البيانات</button>
              </div>
              {parentPortalConfig.loading ? <div className="mt-4 rounded-2xl bg-slate-50 px-4 py-6 text-center text-sm font-bold text-slate-500">جاري تحميل إعدادات وإشعارات بوابة ولي الأمر...</div> : null}
              {!parentPortalConfig.loading && !(parentPortalConfig.alerts || []).length ? <div className="mt-4 rounded-2xl bg-slate-50 px-4 py-6 text-center text-sm font-bold text-slate-500">لا توجد إشعارات حديثة حتى الآن.</div> : null}
              {!parentPortalConfig.loading && (parentPortalConfig.alerts || []).length ? (
                <div className="mt-4 grid grid-cols-1 gap-3 xl:grid-cols-2">
                  {(parentPortalConfig.alerts || []).slice(0, 6).map((item, index) => (
                    <div key={`${item.createdAt || index}-${index}`} className="rounded-3xl bg-slate-50 p-4 ring-1 ring-slate-200">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <div className="font-black text-slate-900">{item.guardianName || 'ولي الأمر'}</div>
                          <div className="mt-1 text-sm leading-7 text-slate-600">{item.message || 'تم تسجيل تنبيه جديد.'}</div>
                        </div>
                        <Badge tone="blue">{item.status || 'معلومة'}</Badge>
                      </div>
                      <div className="mt-3 text-xs font-bold text-slate-400">{item.createdAt ? formatDateTime(item.createdAt) : '—'}</div>
                    </div>
                  ))}
                </div>
              ) : null}
            </div>
          </div>
        )}


        {tab === "timetable" && (
          <WeeklyTimetableEditor
            timetable={localSettings?.weeklyTimetable || []}
            slotDefinitions={localSettings?.slotDefinitions || []}
            teachers={(users || []).filter((u) => Number(u.schoolId) === Number(selectedSchool?.id) && ['teacher','principal','supervisor'].includes(u.role) && String(u.status || 'نشط') === 'نشط')}
            classrooms={Array.isArray(selectedSchool?.structure?.classrooms) && selectedSchool.structure.classrooms.length ? selectedSchool.structure.classrooms : (selectedSchool?.companies || [])}
            subjectBank={localSettings?.subjectBank || defaultSettings.subjectBank}
            onChange={(newTimetable) => setLocalSettings((prev) => ({ ...prev, weeklyTimetable: newTimetable }))}
            onChangeSlotDefs={(newDefs) => setLocalSettings((prev) => ({ ...prev, slotDefinitions: newDefs }))}
          />
        )}

        <div className="mt-6 flex flex-wrap gap-3">
          <button onClick={save} className="inline-flex items-center gap-2 rounded-2xl bg-sky-700 px-5 py-3 font-bold text-white"><Save className="h-4 w-4" /> حفظ الإعدادات</button>
          <button onClick={() => setLocalSettings(settings)} className="inline-flex items-center gap-2 rounded-2xl bg-slate-100 px-5 py-3 font-bold text-slate-700"><RefreshCw className="h-4 w-4" /> التراجع</button>
        </div>
      </SectionCard>
    </div>
  );
}

export default SettingsPage;

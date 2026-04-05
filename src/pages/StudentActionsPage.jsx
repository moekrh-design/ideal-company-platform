/**
 * ==========================================
 *  StudentActionsPage Component
 *  تم استخراجه تلقائياً من App.jsx
 * ==========================================
 */
import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import ReactDOM from 'react-dom';
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
import { Input, Select } from '../components/ui/FormElements';
import { SectionCard } from '../components/ui/SectionCard';


import LiveCameraPanel from '../components/LiveCameraPanel';
import { Badge } from '../components/ui/FormElements';
import { QrCodeVisual } from '../components/ui/QrCodeVisual';
function StudentActionsPage({ selectedSchool, currentUser, settings, actionLog, onResolveStudentByBarcode, onResolveStudentByManual, onResolveStudentByFaceFile, onResolveStudentByFaceDataUrl, onApplyStudentAction, onRecordProgramAction }) {
  const compactMode = currentUser?.role === "teacher";
  if (!selectedSchool) {
    return (
      <SectionCard title="صفحة المعلم" icon={UserCircle2}>
        <div className="rounded-3xl border border-amber-200 bg-amber-50 p-6 text-center text-sm font-bold text-amber-800">لم يتم تحديد مدرسة لهذا الحساب بعد. راجع إعدادات المستخدم أو أعد تسجيل الدخول.</div>
      </SectionCard>
    );
  }
  const [identifyMethod, setIdentifyMethod] = useState("barcode");
  const [query, setQuery] = useState("");
  const [manualSelectedStudentId, setManualSelectedStudentId] = useState("");
  const [manualSelectedCompany, setManualSelectedCompany] = useState("");
  const [actionType, setActionType] = useState("reward");
  const [definitionId, setDefinitionId] = useState((settings.actions?.rewards || []).find((item) => item.active !== false)?.id || "");
  const [note, setNote] = useState("");
  const [faceFile, setFaceFile] = useState(null);
  const [facePreview, setFacePreview] = useState("");
  const [identifiedStudent, setIdentifiedStudent] = useState(null);
  const [busy, setBusy] = useState(false);
  const [executingDefinitionId, setExecutingDefinitionId] = useState(null);
  const [statusMessage, setStatusMessage] = useState("");
  const [teacherFastMode, setTeacherFastMode] = useState(true);
  const [teacherView, setTeacherView] = useState("home");
  const [lastExecution, setLastExecution] = useState(null);
  const [executionEffect, setExecutionEffect] = useState(null); // تأثير بصري عند التنفيذ
  const [scanSessionKey, setScanSessionKey] = useState(0);
  const [programTargetType, setProgramTargetType] = useState("school");
  const [programTargetLabel, setProgramTargetLabel] = useState("");
  const [programTargetCount, setProgramTargetCount] = useState("1");
  const programCompanies = getUnifiedCompanyRows(selectedSchool, { preferStructure: true });
  const [programCompanyId, setProgramCompanyId] = useState(String(programCompanies[0]?.rawId || programCompanies[0]?.id || ""));
  const [programStudentQuery, setProgramStudentQuery] = useState("");
  const [programStudent, setProgramStudent] = useState(null);
  const [programTitle, setProgramTitle] = useState("");
  const [programEvidenceFiles, setProgramEvidenceFiles] = useState([]);
  const [programEvidencePreviews, setProgramEvidencePreviews] = useState([]);

  const actionModes = [
    { key: "reward", label: "مكافأة", icon: Trophy, tone: "green", description: "الحضور المبكر، حل الواجب، التميز" },
    { key: "violation", label: "خصم", icon: Bell, tone: "rose", description: "مخالفة أو خصم معتمد" },
    { key: "program", label: "برنامج", icon: Wand2, tone: "blue", description: "برنامج أو نشاط ينفذه المعلم" },
  ];
  const programTargetOptions = [
    { key: "school", label: "المدرسة كاملة" },
    { key: "company", label: "فصل / شركة" },
    { key: "group", label: "مجموعة" },
    { key: "student", label: "طالب واحد" },
  ];
  const [definitionScope, setDefinitionScope] = useState('general');
  const teacherSubjects = useMemo(() => getTeacherSubjects(currentUser), [currentUser]);
  const teacherAvailableStudents = useMemo(() => {
    const rows = getUnifiedSchoolStudents(selectedSchool, { includeArchived: false, preferStructure: true });
    return [...rows].sort((a, b) => {
      const companyA = String(a.companyName || a.className || getStudentCompanyName(a, selectedSchool) || '');
      const companyB = String(b.companyName || b.className || getStudentCompanyName(b, selectedSchool) || '');
      const companyCompare = companyA.localeCompare(companyB, 'ar');
      if (companyCompare !== 0) return companyCompare;
      return String(a.name || '').localeCompare(String(b.name || ''), 'ar');
    });
  }, [selectedSchool]);
  const teacherManualCompanyOptions = useMemo(() => {
    const map = new Map();
    teacherAvailableStudents.forEach((student) => {
      const name = String(getStudentCompanyName(student, selectedSchool) || student.companyName || student.className || 'غير محدد');
      const key = normalizeSearchToken(name) || String(student.companyId || student.classId || name);
      if (!map.has(key)) map.set(key, { key, label: name, className: student.className || student.classroomName || ''});
    });
    return Array.from(map.values()).sort((a, b) => String(a.label || '').localeCompare(String(b.label || ''), 'ar'));
  }, [teacherAvailableStudents, selectedSchool]);
  const teacherManualStudentOptions = useMemo(() => {
    const token = normalizeSearchToken(query);
    const companyToken = normalizeSearchToken(manualSelectedCompany);
    const filteredByCompany = companyToken
      ? teacherAvailableStudents.filter((student) => normalizeSearchToken(String(getStudentCompanyName(student, selectedSchool) || student.companyName || student.className || 'غير محدد')) === companyToken)
      : teacherAvailableStudents;
    const rows = !token
      ? filteredByCompany.slice(0, 80)
      : filteredByCompany.filter((student) => [student.name, student.studentNumber, student.nationalId, student.barcode, getStudentCompanyName(student, selectedSchool)].some((value) => normalizeSearchToken(String(value || '')).includes(token))).slice(0, 80);
    return rows;
  }, [teacherAvailableStudents, query, selectedSchool, manualSelectedCompany]);
  const [selectedSpecialSubject, setSelectedSpecialSubject] = useState('');
  const teacherSpecialScore = useMemo(() => computeTeacherSpecialScore(actionLog, currentUser, settings), [actionLog, currentUser, settings]);
  const specialAvailabilityBySubject = useMemo(() => (
    teacherSubjects
      .map((subject) => ({ subject, count: getTeacherSpecialItems(currentUser, actionType, subject).length }))
      .filter((entry) => entry.count > 0)
  ), [teacherSubjects, currentUser, actionType]);
  const hasSpecialDefinitions = specialAvailabilityBySubject.length > 0;
  const canUseSpecialDefinitions = Boolean(identifiedStudent) && hasSpecialDefinitions && actionType !== 'program';


  useEffect(() => {
    if (!teacherManualCompanyOptions.length) {
      if (manualSelectedCompany) setManualSelectedCompany('');
      return;
    }
    if (manualSelectedCompany && teacherManualCompanyOptions.some((item) => item.label === manualSelectedCompany || item.key === normalizeSearchToken(manualSelectedCompany))) return;
    if (teacherManualCompanyOptions.length === 1) {
      setManualSelectedCompany(teacherManualCompanyOptions[0].label);
    }
  }, [teacherManualCompanyOptions, manualSelectedCompany]);

  const getDefinitionsByType = useCallback((type) => {
    if (definitionScope === 'special' && type !== 'program') {
      return getTeacherSpecialItems(currentUser, type, selectedSpecialSubject || teacherSubjects[0] || '');
    }
    // نُخفي البنود غير المفعّلة من صفحة المعلم
    if (type === "violation") return (settings.actions?.violations || []).filter((item) => item.active !== false).map((item) => ({ ...item, scope: 'general' }));
    if (type === "program") return (settings.actions?.programs || []).filter((item) => item.active !== false).map((item) => ({ ...item, scope: 'general' }));
    return (settings.actions?.rewards || []).filter((item) => item.active !== false).map((item) => ({ ...item, scope: 'general' }));
  }, [settings, definitionScope, currentUser, selectedSpecialSubject, teacherSubjects]);

  useEffect(() => {
    if (definitionScope === 'special' && teacherSubjects.length && !selectedSpecialSubject) {
      setSelectedSpecialSubject(teacherSubjects[0]);
    }
    const definitions = getDefinitionsByType(actionType);
    // لا نُعيد تعيين definitionId إذا كان البند المختار لا يزال موجوداً في القائمة
    setDefinitionId((prev) => {
      const stillExists = prev && definitions.some((d) => String(d.id) === String(prev));
      return stillExists ? prev : (definitions[0]?.id || "");
    });
  }, [actionType, getDefinitionsByType, definitionScope, teacherSubjects, selectedSpecialSubject]);

  useEffect(() => {
    if (actionType === 'program') {
      setDefinitionScope('general');
      return;
    }
    if (definitionScope === 'special' && !teacherSubjects.length) {
      setDefinitionScope('general');
    }
  }, [actionType, definitionScope, teacherSubjects]);

  useEffect(() => {
    if (!compactMode) setTeacherView("workspace");
  }, [compactMode]);

  useEffect(() => {
    setIdentifiedStudent(null);
    setProgramStudent(null);
    setQuery("");
    setManualSelectedStudentId("");
    setProgramStudentQuery("");
    setStatusMessage("");
    setFaceFile(null);
    setFacePreview("");
    setProgramCompanyId(String(programCompanies[0]?.rawId || programCompanies[0]?.id || ""));
    setProgramEvidenceFiles([]);
    setProgramEvidencePreviews([]);
  }, [selectedSchool.id]);

  const currentDefinitions = getDefinitionsByType(actionType);
  const selectedDefinition = currentDefinitions.find((item) => String(item.id) === String(definitionId)) || currentDefinitions[0] || null;
  const latestActions = actionLog.filter((item) => item.schoolId === selectedSchool.id).slice(0, 10);
  const teacherRecentActions = latestActions.filter((item) =>
    (currentUser?.id && item.actorId != null && String(item.actorId) === String(currentUser.id)) ||
    (currentUser?.username && item.actorUsername && item.actorUsername === currentUser.username) ||
    (currentUser?.name && item.actorName && item.actorName === currentUser.name)
  ).slice(0, 5);
  const teacherStats = {
    total: teacherRecentActions.length,
    rewards: teacherRecentActions.filter((item) => item.actionType === "reward").length,
    violations: teacherRecentActions.filter((item) => item.actionType === "violation").length,
    programs: teacherRecentActions.filter((item) => item.actionType === "program").length,
  };

  // حساب نقاط المعلم من كامل actionLog
  const allMyActions = actionLog.filter((item) =>
    item.schoolId === selectedSchool.id &&
    (
      (currentUser?.id && item.actorId != null && String(item.actorId) === String(currentUser.id)) ||
      (currentUser?.username && item.actorUsername && item.actorUsername === currentUser.username) ||
      (currentUser?.name && item.actorName && item.actorName === currentUser.name)
    )
  );
  const todayIso = new Date().toISOString().slice(0, 10);
  const todayMyActions = allMyActions.filter((item) => (item.isoDate || '').slice(0, 10) === todayIso);
  const tpSettings = settings.teacherPoints || { perReward: 5, perViolation: 2, perProgram: 10 };
  const calcTeacherPoints = (actions) => actions.reduce((sum, item) => {
    if (item.actionType === 'reward') return sum + Number(tpSettings.perReward ?? 5);
    if (item.actionType === 'violation') return sum + Number(tpSettings.perViolation ?? 2);
    if (item.actionType === 'program') return sum + Number(tpSettings.perProgram ?? 10);
    return sum;
  }, 0);
  const myPointsToday = calcTeacherPoints(todayMyActions);
  const myPointsTotal = calcTeacherPoints(allMyActions);
  const myTodayRewards = todayMyActions.filter((item) => item.actionType === 'reward').length;
  const myTodayViolations = todayMyActions.filter((item) => item.actionType === 'violation').length;
  const myTodayPrograms = todayMyActions.filter((item) => item.actionType === 'program').length;
  const teacherPreferredDefinitions = currentDefinitions.slice().sort((a, b) => {
    const aCount = teacherRecentActions.filter((item) => item.actionType === actionType && String(item.definitionId || '') === String(a.id)).length;
    const bCount = teacherRecentActions.filter((item) => item.actionType === actionType && String(item.definitionId || '') === String(b.id)).length;
    return bCount - aCount;
  });
  const teacherFavoriteDefinitions = teacherPreferredDefinitions.slice(0, 3);
  const teacherLastStudentAction = teacherRecentActions.find((item) => ['reward', 'violation'].includes(item.actionType) && (item.studentName || item.targetLabel));
  const teacherLastProgramAction = teacherRecentActions.find((item) => item.actionType === 'program');
  const teacherLastDefinitionForCurrentType = teacherRecentActions.find((item) => item.actionType === actionType && item.definitionId);
  const teacherRecentStudents = teacherRecentActions
    .filter((item) => ['reward', 'violation'].includes(item.actionType) && (item.studentId || item.studentNumber || item.studentName))
    .reduce((acc, item) => {
      const key = String(item.studentId || item.studentNumber || item.studentName || item.targetLabel || '');
      if (!key || acc.some((entry) => entry.key === key)) return acc;
      acc.push({
        key,
        studentId: item.studentId,
        studentNumber: item.studentNumber,
        barcode: item.barcode,
        studentName: item.studentName || item.targetLabel,
        actionType: item.actionType,
        definitionTitle: item.definitionTitle,
      });
      return acc;
    }, [])
    .slice(0, 4);
  const teacherProgramFavoriteActions = teacherRecentActions.filter((item) => item.actionType === 'program').reduce((acc, item) => {
    if (!acc.some((existing) => String(existing.definitionId || '') === String(item.definitionId || '') && String(existing.targetType || '') === String(item.targetType || ''))) acc.push(item);
    return acc;
  }, []).slice(0, 3);
  const programQuickTemplates = (settings.actions?.programs || []).filter((item) => item.active !== false).slice(0, 4).map((item, index) => ({
    id: `program-template-${item.id}`,
    definitionId: item.id,
    title: item.title,
    targetType: ['school', 'company', 'group', 'student'][index % 4],
    targetLabel: index % 4 === 0 ? 'جميع طلاب المدرسة' : index % 4 === 1 ? 'طلاب الفصل المستهدف' : index % 4 === 2 ? 'مجموعة دعم صغيرة' : 'طالب يحتاج متابعة',
    targetCount: index % 4 === 0 ? '60' : index % 4 === 1 ? '30' : index % 4 === 2 ? '12' : '1',
    note: item.description || 'تنفيذ ميداني موثق مع شاهد مختصر.',
  }));
  const applyProgramPreset = (preset) => {
    if (!preset) return;
    if (preset.definitionId) setDefinitionId(String(preset.definitionId));
    if (preset.title) setProgramTitle(preset.title);
    if (preset.targetType) setProgramTargetType(preset.targetType);
    if (typeof preset.targetLabel !== 'undefined') setProgramTargetLabel(preset.targetLabel || '');
    if (typeof preset.targetCount !== 'undefined') setProgramTargetCount(String(preset.targetCount || '1'));
    if (typeof preset.note !== 'undefined') setNote(preset.note || '');
    setStatusMessage(`تم تعبئة قالب سريع: ${preset.title || 'برنامج جاهز'}`);
  };


  const fillFromLastStudentAction = () => {
    if (!teacherLastStudentAction) return;
    openTeacherAction(teacherLastStudentAction.actionType || 'reward');
    const fallbackStudent = getUnifiedSchoolStudents(selectedSchool, { includeArchived: false, preferStructure: true }).find((student) => String(student.id) === String(teacherLastStudentAction.studentId || '') || String(student.studentNumber || '') === String(teacherLastStudentAction.studentNumber || '') || String(student.barcode || '') === String(teacherLastStudentAction.barcode || '') || student.name === teacherLastStudentAction.studentName);
    if (fallbackStudent) {
      setIdentifiedStudent(fallbackStudent);
      setStatusMessage(`تم تجهيز آخر طالب بسرعة: ${fallbackStudent.name}`);
    } else {
      setStatusMessage(`تم فتح المسار السريع. امسح الطالب الأخير: ${teacherLastStudentAction.studentName || teacherLastStudentAction.targetLabel}`);
    }
  };

  const fillProgramFromLastAction = () => {
    if (!teacherLastProgramAction) return;
    openTeacherAction('program');
    setProgramTitle(teacherLastProgramAction.definitionTitle || teacherLastProgramAction.actionTitle || '');
    setProgramTargetLabel(teacherLastProgramAction.targetLabel || '');
    setProgramTargetCount(String(teacherLastProgramAction.targetCount || 1));
    setNote(teacherLastProgramAction.note || '');
    if (teacherLastProgramAction.definitionId) setDefinitionId(String(teacherLastProgramAction.definitionId));
    setStatusMessage('تم تجهيز آخر برنامج لتسريع التكرار والتعديل.');
  };

  const openTeacherAction = (nextType, options = {}) => {
    const preserveStudent = !!options.preserveStudent && nextType !== "program";
    const preserveProgram = !!options.preserveProgram && nextType === "program";
    setActionType(nextType);
    setTeacherView(nextType);
    setIdentifyMethod(nextType === "program" ? "manual" : "barcode");
    setStatusMessage(nextType === "program"
      ? (preserveProgram ? "تم فتح مسار البرنامج مع الإبقاء على بياناتك الحالية." : "")
      : (preserveStudent
        ? `تم إبقاء الطالب المحدد (${identifiedStudent?.name || 'الطالب الحالي'}) ويمكنك التبديل بين المكافأة والخصم دون إعادة المسح.`
        : "الالتقاط السريع جاهز. وجّه الكاميرا مباشرة إلى باركود الطالب، أو بدّل إلى بصمة الوجه أو الإدخال اليدوي عند الحاجة."));
    if (!preserveStudent) {
      setIdentifiedStudent(null);
      setQuery("");
      setFaceFile(null);
      setFacePreview("");
    }
    if (!preserveProgram) {
      setProgramStudent(null);
      setProgramStudentQuery("");
      setProgramTitle("");
      setProgramEvidenceFiles([]);
      setProgramEvidencePreviews([]);
    }
    setNote("");
    setLastExecution(null);
    if (nextType !== "program" && !preserveStudent) setScanSessionKey((value) => value + 1);
  };

  const continueSequentialAction = () => {
    if (actionType === 'program') {
      setProgramTitle('');
      setProgramTargetLabel('');
      setProgramTargetCount('1');
      setProgramEvidenceFiles([]);
      setProgramEvidencePreviews([]);
      setNote('');
      setLastExecution(null);
      setStatusMessage('تم تجهيز نموذج برنامج جديد لإدخال التنفيذ التالي بسرعة.');
      return;
    }
    setIdentifiedStudent(null);
    setQuery('');
    setFaceFile(null);
    setFacePreview('');
    setLastExecution(null);
    setStatusMessage('جاهز لتنفيذ متتابع. امسح الطالب التالي مباشرة.');
    setIdentifyMethod('barcode');
    setScanSessionKey((value) => value + 1);
  };
  const continueOnSameStudent = () => {
    setLastExecution(null);
    setStatusMessage('جاهز لتنفيذ إجراء آخر على نفس الطالب.');
    setScanSessionKey((value) => value + 1);
  };

  const goTeacherHome = () => {
    setTeacherView("home");
    setStatusMessage("");
    setIdentifiedStudent(null);
    setProgramStudent(null);
    setLastExecution(null);
  };
  const resolveFromBarcode = (value) => {
    const student = onResolveStudentByBarcode(value);
    setQuery(value);
    setIdentifiedStudent(student);
    setStatusMessage(student ? `تم التعرف على الطالب: ${student.name}` : "لم يتم العثور على طالب بهذا الـ QR.");
    return student;
  };

  const resolveManual = () => {
    const student = onResolveStudentByManual(query);
    setIdentifiedStudent(student);
    if (student) {
      setManualSelectedStudentId(String(student.id));
      setManualSelectedCompany(String(getStudentCompanyName(student, selectedSchool) || student.companyName || student.className || 'غير محدد'));
    }
    setStatusMessage(student ? `تم العثور على الطالب: ${student.name}` : "لم يتم العثور على طالب بهذه البيانات.");
    return student;
  };

  const handleManualStudentSelection = (value) => {
    setManualSelectedStudentId(value);
    const student = teacherAvailableStudents.find((item) => String(item.id) === String(value));
    if (!student) return;
    setManualSelectedCompany(String(getStudentCompanyName(student, selectedSchool) || student.companyName || student.className || 'غير محدد'));
    setQuery(student.studentNumber || student.nationalId || student.name || student.barcode || '');
    setIdentifiedStudent(student);
    setStatusMessage(`تم اختيار الطالب يدويًا: ${student.name}`);
  };

  const resolveProgramStudent = () => {
    const student = onResolveStudentByManual(programStudentQuery);
    setProgramStudent(student);
    setStatusMessage(student ? `تم تحديد الطالب للبرنامج: ${student.name}` : "لم يتم العثور على الطالب المطلوب للبرنامج.");
    return student;
  };

  const handleFaceFile = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setFaceFile(file);
    setFacePreview(await fileToDataUrl(file));
    event.target.value = "";
  };
  const handleProgramEvidenceFiles = async (event) => {
    const files = Array.from(event.target.files || []);
    if (!files.length) return;
    const newFiles = [...programEvidenceFiles, ...files];
    setProgramEvidenceFiles(newFiles);
    const newPreviews = await Promise.all(
      files.map(async (file) => ({
        id: `${file.name}-${file.size}-${Date.now()}`,
        name: file.name,
        url: await fileToDataUrl(file),
      }))
    );
    setProgramEvidencePreviews((prev) => [...prev, ...newPreviews]);
    event.target.value = "";
  };

  const verifyFaceFile = async () => {
    if (!faceFile) return null;
    setBusy(true);
    try {
      const result = await onResolveStudentByFaceFile(faceFile);
      setIdentifiedStudent(result);
      setStatusMessage(result ? `تمت مطابقة الوجه مع الطالب: ${result.name}` : "لم يتم العثور على تطابق كافٍ للوجه.");
      return result;
    } finally {
      setBusy(false);
    }
  };

  const verifyFaceCamera = async (dataUrl) => {
    setBusy(true);
    try {
      const result = await onResolveStudentByFaceDataUrl(dataUrl);
      setIdentifiedStudent(result);
      setStatusMessage(result ? `تمت مطابقة الوجه مع الطالب: ${result.name}` : "لم يتم العثور على تطابق كافٍ للوجه.");
      return result;
    } finally {
      setBusy(false);
    }
  };

  const applyAction = async (definitionOverride = selectedDefinition, methodOverride = null) => {
    if (!identifiedStudent || !definitionOverride) return;
    if (executingDefinitionId) return; // منع الضغط المزدوج
    setBusy(true);
    setExecutingDefinitionId(String(definitionOverride.id));
    try {
      const result = await onApplyStudentAction({
        studentId: identifiedStudent.id,
        actionType,
        definitionId: definitionOverride.id,
        specialDefinition: definitionOverride?.scope === 'special' ? definitionOverride : null,
        note,
        method: methodOverride || (identifyMethod === "face" ? "بصمة وجه" : identifyMethod === "barcode" ? "QR مباشر" : "يدوي"),
      });
      setStatusMessage(result?.message || (result?.ok ? "تم تنفيذ الإجراء." : "تعذر تنفيذ الإجراء."));
      if (result?.ok) {
        const delta = Number(definitionOverride?.points || 0);
        setIdentifiedStudent((prev) => prev ? { ...prev, points: Number(prev.points || 0) + delta } : prev);
        setNote("");
        // تشغيل التأثير البصري
        setExecutionEffect({ type: actionType, points: delta, title: definitionOverride?.title || '', at: Date.now() });
        setTimeout(() => setExecutionEffect(null), 2800);
        setLastExecution({
          type: actionType,
          title: definitionOverride?.title || (actionType === 'reward' ? 'مكافأة' : 'خصم'),
          studentName: identifiedStudent?.name,
          deltaPoints: delta,
          method: methodOverride || (identifyMethod === "face" ? "بصمة وجه" : identifyMethod === "barcode" ? "QR مباشر" : "إدخال يدوي"),
          at: new Date().toISOString(),
          message: result?.message || "تم تنفيذ الإجراء بنجاح.",
          quickStudentId: identifiedStudent?.id,
        });
      }
      return result;
    } finally {
      setBusy(false);
      setExecutingDefinitionId(null);
    }
  };

  const submitProgram = async () => {
    if (!selectedDefinition) return;
    if (programTargetType === "student" && !programStudent) {
      setStatusMessage("حدّد الطالب المستهدف للبرنامج أولاً.");
      return;
    }
    const company = programCompanies.find((item) => String(item.rawId || item.id) === String(programCompanyId));
    const targetLabels = {
      school: "المدرسة كاملة",
      company: company?.name || "فصل / شركة",
      group: programTargetLabel || "مجموعة محددة",
      student: programStudent?.name || "طالب واحد",
    };
    setBusy(true);
    try {
      const result = await onRecordProgramAction({
        definitionId: selectedDefinition.id,
        companyId: programTargetType === "company" ? company?.id : (programTargetType === "student" ? programStudent?.companyId : null),
        studentId: programTargetType === "student" ? programStudent?.id : null,
        targetType: programTargetOptions.find((item) => item.key === programTargetType)?.label || programTargetType,
        targetLabel: programTargetType === "company" ? company?.name : targetLabels[programTargetType],
        targetCount: programTargetCount,
        note: [programTitle ? `عنوان البرنامج: ${programTitle}` : '', programTargetLabel, note].filter(Boolean).join(" • "),
        evidenceFiles: programEvidenceFiles,
      });
      setStatusMessage(result?.message || (result?.ok ? "تم حفظ البرنامج." : "تعذر حفظ البرنامج."));
      if (result?.ok) {
        const programDelta = Number(selectedDefinition?.points || 0);
        // ✅ إصلاح: تشغيل التأثير البصري للبرامج كما هو في المكافآت والخصم
        setExecutionEffect({ type: 'program', points: programDelta, title: selectedDefinition?.title || 'برنامج', at: Date.now() });
        setTimeout(() => setExecutionEffect(null), 2800);
        setLastExecution({
          type: 'program',
          title: selectedDefinition?.title || 'برنامج',
          studentName: programTargetType === 'student' ? programStudent?.name : null,
          deltaPoints: programDelta,
          method: 'نموذج برنامج',
          at: new Date().toISOString(),
          message: result?.message || 'تم حفظ البرنامج بنجاح.',
          targetLabel: targetLabels[programTargetType],
        });
        setProgramTitle("");
        setNote("");
        setProgramEvidenceFiles([]);
        setProgramEvidencePreviews([]);
        if (programTargetType === "student") {
          setProgramStudent(null);
          setProgramStudentQuery("");
        }
      }
    } finally {
      setBusy(false);
    }
  };

  const continueOnLastDefinition = () => {
    if (!identifiedStudent || !teacherLastDefinitionForCurrentType) return;
    const lastDefinition = currentDefinitions.find((item) => String(item.id) === String(teacherLastDefinitionForCurrentType.definitionId));
    if (!lastDefinition) return;
    setDefinitionId(String(lastDefinition.id));
    applyAction(lastDefinition, 'آخر سبب مستخدم');
  };

  const teacherContextLabel = identifiedStudent
    ? `${identifiedStudent.name} • ${getStudentGroupingLabel(identifiedStudent, selectedSchool)}`
    : 'لم يتم تحديد طالب بعد';

  const switchTeacherActionKeepingStudent = (nextType) => {
    if (nextType === 'program') {
      openTeacherAction('program');
      return;
    }
    const definitions = getDefinitionsByType(nextType);
    setDefinitionId(definitions[0]?.id || '');
    openTeacherAction(nextType, { preserveStudent: !!identifiedStudent });
  };

  const projectedStudentPoints = identifiedStudent && selectedDefinition
    ? Number(identifiedStudent.points || 0) + Number(selectedDefinition.points || 0)
    : null;

  // مكوّن التأثير البصري الاحترافي عند تنفيذ المكافأة أو الخصم أو البرنامج
  const renderExecutionEffect = () => {
    if (!executionEffect) return null;
    const isReward = executionEffect.type === 'reward';
    const isViolation = executionEffect.type === 'violation';
    const isProgram = executionEffect.type === 'program';
    const bgColor = isReward ? '#10b981' : isViolation ? '#ef4444' : '#7c3aed';
    const gradientEnd = isReward ? '#059669' : isViolation ? '#dc2626' : '#4f46e5';
    const emoji = isReward ? '⭐' : isViolation ? '⚠️' : '🏆';
    const pointsText = executionEffect.points > 0 ? `+${executionEffect.points}` : String(executionEffect.points);
    const particles = Array.from({ length: isReward ? 14 : isProgram ? 10 : 6 }, (_, i) => ({
      id: i,
      x: (Math.random() - 0.5) * 340,
      y: -(Math.random() * 220 + 80),
      rotate: Math.random() * 720 - 360,
      size: Math.random() * 12 + 5,
      color: isReward
        ? ['#fbbf24','#34d399','#60a5fa','#f472b6','#a78bfa'][i % 5]
        : isProgram
        ? ['#c4b5fd','#818cf8','#6366f1','#a78bfa','#7c3aed'][i % 5]
        : ['#f87171','#fb923c','#fbbf24'][i % 3],
    }));
    const effectContent = (
      <AnimatePresence>
        {executionEffect && (
          <motion.div
            key={executionEffect.at}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{ position: 'fixed', inset: 0, zIndex: 9999, pointerEvents: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          >
            {/* خلفية شفافة */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: [0, 0.18, 0] }}
              transition={{ duration: 0.6, times: [0, 0.2, 1] }}
              style={{ position: 'absolute', inset: 0, background: bgColor }}
            />
            {/* جسيمات متطايرة */}
            {particles.map((p) => (
              <motion.div
                key={p.id}
                initial={{ x: 0, y: 0, opacity: 1, scale: 1, rotate: 0 }}
                animate={{ x: p.x, y: p.y, opacity: 0, scale: 0.3, rotate: p.rotate }}
                transition={{ duration: 1.2, ease: 'easeOut', delay: 0.1 }}
                style={{
                  position: 'absolute',
                  width: p.size,
                  height: p.size,
                  borderRadius: '50%',
                  background: p.color,
                  boxShadow: `0 0 6px ${p.color}`,
                }}
              />
            ))}
            {/* بطاقة التأثير الرئيسية */}
            <motion.div
              initial={{ scale: 0.3, opacity: 0, y: 40 }}
              animate={{ scale: [0.3, 1.15, 1], opacity: [0, 1, 1], y: [40, -10, 0] }}
              exit={{ scale: 0.8, opacity: 0, y: -30 }}
              transition={{ duration: 0.55, times: [0, 0.6, 1], ease: 'backOut' }}
              style={{
                background: `linear-gradient(135deg, ${bgColor}, ${gradientEnd})`,
                borderRadius: 32,
                padding: '28px 40px',
                textAlign: 'center',
                color: '#fff',
                boxShadow: `0 24px 64px ${bgColor}88, 0 0 0 4px ${bgColor}44`,
                minWidth: 220,
                position: 'relative',
              }}
            >
              <motion.div
                animate={{ rotate: isReward ? [0, -15, 15, -10, 10, 0] : [0, 5, -5, 0] }}
                transition={{ duration: 0.6, delay: 0.2 }}
                style={{ fontSize: 52, lineHeight: 1 }}
              >
                {emoji}
              </motion.div>
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.25 }}
                style={{ marginTop: 12, fontSize: 48, fontWeight: 900, lineHeight: 1, fontFamily: 'Tajawal, sans-serif', textShadow: '0 2px 8px rgba(0,0,0,0.2)' }}
              >
                {pointsText}
              </motion.div>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.35 }}
                style={{ marginTop: 6, fontSize: 15, fontWeight: 700, opacity: 0.9, fontFamily: 'Tajawal, sans-serif' }}
              >
                {executionEffect.title || (isReward ? 'مكافأة' : 'خصم')}
              </motion.div>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.45 }}
                style={{ marginTop: 4, fontSize: 12, opacity: 0.75, fontFamily: 'Tajawal, sans-serif' }}
              >
                تم التنفيذ بنجاح
              </motion.div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    );
    return ReactDOM.createPortal(effectContent, document.body);
  };

  const renderExecutionBanner = () => {
    if (!lastExecution) return null;
    const tone = lastExecution.type === 'reward' ? 'from-emerald-500 via-emerald-600 to-teal-600' : lastExecution.type === 'violation' ? 'from-rose-500 via-rose-600 to-orange-500' : 'from-sky-600 via-blue-700 to-indigo-700';
    return (
      <div className={`rounded-[34px] bg-gradient-to-r ${tone} p-6 text-white shadow-2xl`}>
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="text-sm font-bold text-white/80">تم التنفيذ بنجاح</div>
            <div className="mt-1 text-3xl font-black md:text-4xl">{lastExecution.title}</div>
            <div className="mt-2 text-base leading-8 text-white/95">{lastExecution.message}</div>
            <div className="mt-3 inline-flex items-center rounded-2xl bg-white/10 px-3 py-2 text-xs font-black ring-1 ring-white/15">{selectedSchool?.name || 'المدرسة الحالية'}</div>
          </div>
          <div className="rounded-[30px] bg-white/15 px-5 py-4 text-center ring-1 ring-white/15 min-w-[96px]">
            <div className="text-xs text-white/75">الأثر</div>
            <div className="mt-1 text-4xl font-black">{lastExecution.deltaPoints > 0 ? `+${lastExecution.deltaPoints}` : lastExecution.deltaPoints || 0}</div>
          </div>
        </div>
        <div className="mt-4 grid grid-cols-2 gap-3 text-sm md:grid-cols-4">
          <div className="rounded-2xl bg-white/10 px-3 py-3 ring-1 ring-white/10"><div className="text-xs text-white/70">المستفيد</div><div className="mt-1 font-bold">{lastExecution.studentName || lastExecution.targetLabel || 'عام'}</div></div>
          <div className="rounded-2xl bg-white/10 px-3 py-3 ring-1 ring-white/10"><div className="text-xs text-white/70">الطريقة</div><div className="mt-1 font-bold">{lastExecution.method}</div></div>
          <div className="rounded-2xl bg-white/10 px-3 py-3 ring-1 ring-white/10"><div className="text-xs text-white/70">الوقت</div><div className="mt-1 font-bold">{formatDateTime(lastExecution.at)}</div></div>
          <button onClick={() => setLastExecution(null)} className="rounded-2xl bg-white/10 px-3 py-3 text-center font-black ring-1 ring-white/10">إخفاء</button>
        </div>
        <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
          {lastExecution.type !== 'program' ? <button onClick={continueSequentialAction} className="rounded-2xl bg-white px-4 py-4 text-sm font-black text-slate-900">تنفيذ متتابع للطالب التالي</button> : <button onClick={continueSequentialAction} className="rounded-2xl bg-white px-4 py-4 text-sm font-black text-slate-900">برنامج جديد سريع</button>}
          {lastExecution.type !== 'program' ? <button onClick={continueOnSameStudent} className="rounded-2xl bg-white/10 px-4 py-4 text-sm font-black text-white ring-1 ring-white/10">الاستمرار على نفس الطالب</button> : <div className="hidden sm:block" />}
          <button onClick={goTeacherHome} className="rounded-2xl bg-white/10 px-4 py-4 text-sm font-black text-white ring-1 ring-white/10">العودة للرئيسية</button>
        </div>
      </div>
    );
  };

  const renderProgramCompanyButtons = () => {
    if (!programCompanies.length) return null;
    return (
      <div className="mt-4 rounded-2xl bg-slate-50 p-4 ring-1 ring-slate-200">
        <div className="mb-3 flex items-center justify-between gap-3">
          <div>
            <div className="font-bold text-slate-800">اختر الفصل / الشركة</div>
            <div className="text-sm text-slate-500">بدون قوائم منسدلة. اضغط مباشرة على الفصل المستهدف.</div>
          </div>
          <Badge tone="slate">{programCompanies.length}</Badge>
        </div>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {programCompanies.map((company) => {
            const selected = String(programCompanyId) === String(company.rawId || company.id);
            return (
              <button key={company.id} onClick={() => setProgramCompanyId(String(company.rawId || company.id))} className={cx('rounded-3xl border p-4 text-right transition', selected ? 'border-slate-900 bg-slate-900 text-white shadow-lg' : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-100')}>
                <div className="font-black">{company.name}</div>
                <div className={cx('mt-1 text-xs leading-6', selected ? 'text-white/80' : 'text-slate-500')}>{company.className || 'فصل دراسي'}</div>
              </button>
            );
          })}
        </div>
      </div>
    );
  };

  const renderStudentCard = (student) => {
    if (!student) return <div className="mt-4 overflow-hidden rounded-[30px] border border-dashed border-slate-300 bg-gradient-to-b from-slate-50 to-white px-4 py-10 text-center text-sm text-slate-500 shadow-sm">عرّف الطالب أولاً عبر QR أو بصمة الوجه أو رقم الطالب.</div>;
    return (
      <div className="mt-4 overflow-hidden rounded-[32px] bg-gradient-to-br from-slate-900 via-slate-800 to-sky-900 p-[1px] shadow-xl">
        <div className="rounded-[31px] bg-white p-4">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="flex items-start gap-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-[24px] bg-sky-100 text-sky-800 ring-1 ring-sky-200">
                <UserCircle2 className="h-9 w-9" />
              </div>
              <div>
                <div className="text-xs font-bold tracking-wide text-slate-500">الطالب المحدد</div>
                <div className="mt-1 text-xl font-black text-slate-900">{student.name}</div>
                <div className="mt-2 flex flex-wrap gap-2">
                  <Badge tone="blue">{getStudentGroupingLabel(student, selectedSchool)}</Badge>
                  <Badge tone="violet">{student.points} نقطة حالية</Badge>
                  <Badge tone={getFaceProfileTone(student)}>{getFaceProfileLabel(student)}</Badge>
                  {selectedDefinition ? <Badge tone={actionType === 'reward' ? 'green' : actionType === 'violation' ? 'rose' : 'blue'}>{actionType === 'reward' ? 'مكافأة' : actionType === 'violation' ? 'خصم' : 'برنامج'}: {selectedDefinition.title}</Badge> : null}
                </div>
              </div>
            </div>
            <div className="flex justify-center">
              <div className="rounded-[28px] bg-slate-50 p-3 ring-1 ring-slate-200">
                <QrCodeVisual value={student.barcode} size={108} />
              </div>
            </div>
          </div>
          <div className="mt-4 grid grid-cols-2 gap-3 md:grid-cols-4">
            <div className="rounded-2xl bg-slate-50 p-3 ring-1 ring-slate-200"><div className="text-[11px] font-bold text-slate-500">رقم الطالب</div><div className="mt-1 text-sm font-black text-slate-800">{student.studentNumber || student.id}</div></div>
            <div className="rounded-2xl bg-slate-50 p-3 ring-1 ring-slate-200"><div className="text-[11px] font-bold text-slate-500">الهوية</div><div className="mt-1 text-sm font-black text-slate-800">{student.nationalId || '—'}</div></div>
            <div className="rounded-2xl bg-slate-50 p-3 ring-1 ring-slate-200"><div className="text-[11px] font-bold text-slate-500">رمز الطالب</div><div className="mt-1 truncate text-sm font-black text-slate-800">{student.barcode || '—'}</div></div>
            <div className={cx('rounded-2xl p-3 ring-1', selectedDefinition ? (actionType === 'reward' ? 'bg-gradient-to-br from-emerald-50 to-sky-50 ring-emerald-100' : 'bg-gradient-to-br from-rose-50 to-orange-50 ring-rose-100') : 'bg-gradient-to-br from-slate-50 to-white ring-slate-200')}><div className="text-[11px] font-bold text-slate-500">أثر التنفيذ</div><div className="mt-1 text-sm font-black text-slate-800">{selectedDefinition ? `${selectedDefinition.points > 0 ? '+' : ''}${selectedDefinition.points} نقطة` : 'يُحدَّث مباشرة بعد الاعتماد'}</div></div>
          </div>
          {selectedDefinition ? (
            <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
              <div className="rounded-2xl bg-slate-50 p-3 ring-1 ring-slate-200"><div className="text-[11px] font-bold text-slate-500">الإجراء الحالي</div><div className="mt-1 text-sm font-black text-slate-900">{selectedDefinition.title}</div></div>
              <div className="rounded-2xl bg-slate-50 p-3 ring-1 ring-slate-200"><div className="text-[11px] font-bold text-slate-500">أثره على الطالب</div><div className="mt-1 text-sm font-black text-slate-900">{selectedDefinition.points > 0 ? `+${selectedDefinition.points}` : selectedDefinition.points} نقطة</div></div>
              <div className={cx('rounded-2xl p-3 ring-1', projectedStudentPoints !== null ? 'bg-slate-900 text-white ring-slate-900/10' : 'bg-slate-50 ring-slate-200')}><div className={cx('text-[11px] font-bold', projectedStudentPoints !== null ? 'text-white/70' : 'text-slate-500')}>الرصيد المتوقع بعد الاعتماد</div><div className="mt-1 text-sm font-black">{projectedStudentPoints !== null ? `${projectedStudentPoints} نقطة` : '—'}</div></div>
            </div>
          ) : null}
        </div>
      </div>
    );
  };

  const renderQuickIdentifyPanel = () => (
    <div className="rounded-3xl bg-slate-50 p-5 ring-1 ring-slate-200">
      <div className="mb-3 flex items-center justify-between gap-3">
        <div>
          <div className="font-bold text-slate-800">التعرف على الطالب</div>
          <div className="text-sm text-slate-500">التقاط سريع مهيأ للجوال. الكاميرا تبدأ مباشرة، وبعد التنفيذ يمكنك الانتقال للطالب التالي دون العودة للرئيسية.</div>
        </div>
        <Badge tone="slate">{selectedSchool?.name || 'المدرسة الحالية'}</Badge>
      </div>

      {compactMode ? (
        <div className="space-y-4">
          <div className="grid grid-cols-3 gap-2 rounded-3xl bg-white p-1 ring-1 ring-slate-200">
            {[['barcode', 'باركود'], ['face', 'الوجه'], ['manual', 'يدوي']].map(([key, label]) => (
              <button key={key} onClick={() => setIdentifyMethod(key)} className={cx('rounded-2xl px-3 py-3 text-sm font-black transition', identifyMethod === key ? 'bg-slate-900 text-white shadow-sm' : 'text-slate-600')}>{label}</button>
            ))}
          </div>

          {teacherRecentStudents.length ? (
            <div className="rounded-3xl bg-white p-3 ring-1 ring-slate-200">
              <div className="mb-2 text-xs font-black text-slate-500">آخر الطلاب لديك</div>
              <div className="flex gap-2 overflow-x-auto pb-1">
                {teacherRecentStudents.map((item) => (
                  <button
                    key={`recent-student-${item.key}`}
                    onClick={() => {
                      const fallbackStudent = getUnifiedSchoolStudents(selectedSchool, { includeArchived: false, preferStructure: true }).find((student) => String(student.id) === String(item.studentId || '') || String(student.studentNumber || '') === String(item.studentNumber || '') || String(student.barcode || '') === String(item.barcode || '') || student.name === item.studentName);
                      if (fallbackStudent) {
                        setIdentifiedStudent(fallbackStudent);
                        setStatusMessage(`تم استدعاء الطالب ${fallbackStudent.name} مباشرة.`);
                      }
                    }}
                    className="min-w-[150px] rounded-2xl bg-slate-50 px-3 py-3 text-right ring-1 ring-slate-200"
                  >
                    <div className="truncate text-sm font-black text-slate-800">{item.studentName || 'طالب سابق'}</div>
                    <div className="mt-1 text-[11px] text-slate-500">{item.definitionTitle || (item.actionType === 'reward' ? 'مكافأة' : 'خصم')}</div>
                  </button>
                ))}
              </div>
            </div>
          ) : null}

          {identifyMethod === 'barcode' ? (
            <LiveCameraPanel mode="barcode" title="التقاط مباشر للطالب" description="افتح الكاميرا الآن ووجّه الباركود أمام الجوال ليتم التعرف مباشرة." onDetectBarcode={resolveFromBarcode} autoStart hideDeviceSelect videoHeightClass="h-[22rem]" />
          ) : null}

          {identifyMethod === 'face' ? (
            <div className="space-y-4">
              <LiveCameraPanel key={`teacher-face-${scanSessionKey}`} mode="face" title="التقاط بالوجه" description="وضع الوجه جاهز مباشرة. وجّه وجه الطالب بوضوح أمام الكاميرا أو استخدم رفع صورة احتياطية." onDetectFace={verifyFaceCamera} onCapture={verifyFaceCamera} autoStart hideDeviceSelect videoHeightClass="h-72" />
              <div className="rounded-2xl bg-white p-4 ring-1 ring-slate-200">
                <div className="flex flex-wrap gap-3">
                  <label className="inline-flex cursor-pointer items-center gap-2 rounded-2xl bg-sky-700 px-4 py-3 text-sm font-bold text-white">
                    <Upload className="h-4 w-4" /> رفع صورة الوجه
                    <input type="file" accept="image/*" capture="user" className="hidden" onChange={handleFaceFile} />
                  </label>
                  <button onClick={verifyFaceFile} disabled={!faceFile || busy} className={cx('rounded-2xl px-4 py-3 text-sm font-bold', !faceFile || busy ? 'bg-slate-200 text-slate-500' : 'bg-emerald-600 text-white')}>{busy ? 'جارٍ التحقق...' : 'تحقق من الصورة'}</button>
                </div>
                {facePreview ? <img src={facePreview} alt="معاينة الوجه" className="mt-4 h-56 w-full rounded-2xl object-cover ring-1 ring-slate-200" /> : null}
              </div>
            </div>
          ) : null}

          {identifyMethod === 'manual' ? (
            <div className="rounded-2xl bg-white p-4 ring-1 ring-slate-200">
              <Input label="رقم الطالب أو الهوية أو الاسم" value={query} onChange={(e) => { setQuery(e.target.value); setManualSelectedStudentId(""); }} placeholder="مثال: ABH-0001 أو 1100000011" list="teacher-manual-student-options-compact" />
              <datalist id="teacher-manual-student-options-compact">{teacherManualStudentOptions.map((student) => <option key={student.id} value={student.studentNumber || student.name || student.fullName}>{student.name || student.fullName || "طالب"} — {student.nationalId || student.barcode}</option>)}</datalist>
              <div className="mt-3 space-y-3">
                {teacherManualCompanyOptions.length >= 1 ? (
                  <Select label="اختر الفصل أولًا" value={manualSelectedCompany} onChange={(e) => { setManualSelectedCompany(e.target.value); setManualSelectedStudentId(""); }}>
                    <option value="">اختر الفصل</option>
                    {teacherManualCompanyOptions.map((company) => (
                      <option key={`compact-company-${company.key}`} value={company.label}>{company.className ? `${company.className} — ${company.label}` : company.label}</option>
                    ))}
                  </Select>
                ) : null}
                <Select label="ثم اختر الطالب من هذا الفصل" value={manualSelectedStudentId} onChange={(e) => handleManualStudentSelection(e.target.value)} disabled={teacherManualCompanyOptions.length >= 1 && !manualSelectedCompany}>
                  <option value="">{!manualSelectedCompany ? 'اختر الفصل أولًا' : 'اختر الطالب'}</option>
                  {teacherManualStudentOptions.map((student) => (
                    <option key={`compact-manual-${student.id}`} value={student.id}>{student.name || student.fullName || "طالب"} — {getStudentCompanyName(student, selectedSchool)}</option>
                  ))}
                </Select>
              </div>
              <div className="mt-2 text-xs font-bold text-slate-500">إذا كان لديك طلاب من أكثر من فصل فاختر الفصل أولًا، ثم ستظهر لك أسماء طلابه فقط.</div>
              <button onClick={resolveManual} className="mt-3 w-full rounded-2xl bg-sky-700 px-4 py-3 text-sm font-bold text-white">تعرف يدويًا</button>
            </div>
          ) : null}
        </div>
      ) : (
        <>
          <div className="mb-4 grid grid-cols-3 gap-2 rounded-2xl bg-white p-1 ring-1 ring-slate-200">
            {[['barcode', 'QR مباشر'], ['face', 'بصمة وجه'], ['manual', 'يدوي']].map(([key, label]) => (
              <button key={key} onClick={() => setIdentifyMethod(key)} className={`rounded-xl px-3 py-3 text-sm font-bold ${identifyMethod === key ? 'bg-sky-700 text-white' : 'text-slate-600'}`}>{label}</button>
            ))}
          </div>

          {identifyMethod === 'barcode' ? (
            <div className="space-y-4">
              <LiveCameraPanel mode="barcode" title="كاميرا QR المباشرة" description="وجّه QR الطالب للكاميرا وسيُقرأ مباشرة دون تصوير." onDetectBarcode={resolveFromBarcode} />
              <div className="rounded-2xl bg-white p-4 ring-1 ring-slate-200">
                <Input label="رقم QR يدوي" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="مثال: ST-0001-ABH" />
                <div className="mt-3 flex gap-3">
                  <button onClick={() => resolveFromBarcode(query)} className="rounded-2xl bg-sky-700 px-4 py-3 text-sm font-bold text-white">تعرف على الطالب</button>
                  <button onClick={() => setQuery('')} className="rounded-2xl bg-slate-100 px-4 py-3 text-sm font-bold text-slate-700">مسح</button>
                </div>
              </div>
            </div>
          ) : null}

          {identifyMethod === 'face' ? (
            <div className="space-y-4">
              <div className="flex flex-wrap gap-3">
                <label className="inline-flex cursor-pointer items-center gap-2 rounded-2xl bg-sky-700 px-4 py-3 text-sm font-bold text-white">
                  <Upload className="h-4 w-4" /> رفع صورة الوجه
                  <input type="file" accept="image/*" capture="user" className="hidden" onChange={handleFaceFile} />
                </label>
                <button onClick={verifyFaceFile} disabled={!faceFile || busy} className={cx('rounded-2xl px-4 py-3 text-sm font-bold', !faceFile || busy ? 'bg-slate-200 text-slate-500' : 'bg-emerald-600 text-white')}>{busy ? 'جارٍ التحقق...' : 'تحقق من الصورة'}</button>
              </div>
              {facePreview ? <img src={facePreview} alt="معاينة الوجه" className="h-56 w-full rounded-2xl object-cover ring-1 ring-slate-200" /> : null}
              <LiveCameraPanel mode="face" title="كاميرا بصمة الوجه المباشرة" description="افتح الكاميرا من الجوال أو اللابتوب وسيجري التعرف على الطالب مباشرة." onDetectFace={verifyFaceCamera} onCapture={verifyFaceCamera} />
            </div>
          ) : null}

          {identifyMethod === 'manual' ? (
            <div className="rounded-2xl bg-white p-4 ring-1 ring-slate-200">
              <Input label="رقم الطالب أو الهوية أو الاسم أو الباركود" value={query} onChange={(e) => { setQuery(e.target.value); setManualSelectedStudentId(""); }} placeholder="مثال: ST-0001-ABH أو 1100000011" list="manual-student-options-admin" />
              <datalist id="manual-student-options-admin">{teacherManualStudentOptions.map((student) => <option key={student.id} value={student.studentNumber || student.barcode || student.name || student.fullName}>{student.name || student.fullName || "طالب"} — {student.nationalId || student.barcode}</option>)}</datalist>
              <div className="mt-3 space-y-3">
                {teacherManualCompanyOptions.length >= 1 ? (
                  <Select label="اختر الفصل أولًا" value={manualSelectedCompany} onChange={(e) => { setManualSelectedCompany(e.target.value); setManualSelectedStudentId(""); }}>
                    <option value="">اختر الفصل</option>
                    {teacherManualCompanyOptions.map((company) => (
                      <option key={`admin-company-${company.key}`} value={company.label}>{company.className ? `${company.className} — ${company.label}` : company.label}</option>
                    ))}
                  </Select>
                ) : null}
                <Select label="ثم اختر الطالب من هذا الفصل" value={manualSelectedStudentId} onChange={(e) => handleManualStudentSelection(e.target.value)} disabled={teacherManualCompanyOptions.length >= 1 && !manualSelectedCompany}>
                  <option value="">{teacherManualCompanyOptions.length >= 1 && !manualSelectedCompany ? 'اختر الفصل أولًا' : 'اختر الطالب'}</option>
                  {teacherManualStudentOptions.map((student) => (
                    <option key={`admin-manual-${student.id}`} value={student.id}>{student.name || student.fullName || "طالب"} — {getStudentCompanyName(student, selectedSchool)}</option>
                  ))}
                </Select>
              </div>
              <div className="mt-2 text-xs font-bold text-slate-500">اختر الفصل أولًا لتصفية الطلاب، ثم اختر الطالب من القائمة.</div>
              <button onClick={resolveManual} className="mt-3 rounded-2xl bg-sky-700 px-4 py-3 text-sm font-bold text-white">بحث عن الطالب</button>
            </div>
          ) : null}
        </>
      )}

      {statusMessage ? <div className="mt-4 rounded-2xl bg-white px-4 py-3 text-sm text-slate-600 ring-1 ring-slate-200">{statusMessage}</div> : null}
    </div>
  );

  const renderDefinitionScopeChooser = () => {
    if (actionType === 'program') return null;
    return (
      <div className="mt-4 space-y-3">
        <div className="flex flex-wrap items-center gap-2">
          <button type="button" onClick={() => setDefinitionScope('general')} className={cx('rounded-2xl px-4 py-2 text-sm font-bold transition', definitionScope === 'general' ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-700')}>البنود العامة</button>
          <button
            type="button"
            onClick={() => {
              if (!canUseSpecialDefinitions) return;
              setDefinitionScope('special');
              if (!selectedSpecialSubject && (specialAvailabilityBySubject[0]?.subject || teacherSubjects[0])) {
                setSelectedSpecialSubject(specialAvailabilityBySubject[0]?.subject || teacherSubjects[0]);
              }
            }}
            disabled={!canUseSpecialDefinitions}
            className={cx('rounded-2xl px-4 py-2 text-sm font-bold transition', !canUseSpecialDefinitions ? 'cursor-not-allowed bg-slate-100 text-slate-400' : definitionScope === 'special' ? 'bg-violet-700 text-white' : 'bg-violet-50 text-violet-700')}
          >
            البنود التخصصية
          </button>
          {definitionScope === 'special' ? <Badge tone="violet">رصيدك التخصصي: {teacherSpecialScore}</Badge> : null}
        </div>

        {!identifiedStudent && hasSpecialDefinitions ? (
          <div className="rounded-2xl bg-sky-50 px-4 py-3 text-sm font-bold text-sky-800 ring-1 ring-sky-100">حدد الطالب أولًا ثم افتح البنود التخصصية.</div>
        ) : null}
        {identifiedStudent && !hasSpecialDefinitions ? (
          <div className="rounded-2xl bg-amber-50 px-4 py-3 text-sm font-bold text-amber-900 ring-1 ring-amber-200">لا توجد لك بنود تخصصية مفعلة لهذا النوع حاليًا.</div>
        ) : null}

        {hasSpecialDefinitions ? (
          <div className="flex flex-wrap gap-2">
            {specialAvailabilityBySubject.map((entry) => (
              <button
                key={entry.subject}
                type="button"
                disabled={!identifiedStudent}
                onClick={() => {
                  if (!identifiedStudent) return;
                  setDefinitionScope('special');
                  setSelectedSpecialSubject(entry.subject);
                }}
                className={cx('rounded-full px-3 py-2 text-xs font-black transition ring-1', definitionScope === 'special' && selectedSpecialSubject === entry.subject ? 'bg-violet-700 text-white ring-violet-700' : identifiedStudent ? 'bg-white text-violet-700 ring-violet-200 hover:bg-violet-50' : 'bg-slate-50 text-slate-400 ring-slate-200')}
              >
                {entry.subject} ({entry.count})
              </button>
            ))}
          </div>
        ) : null}

        {definitionScope === 'special' ? (
          specialAvailabilityBySubject.length > 1 ? (
            <Select label="المادة" value={selectedSpecialSubject} onChange={(e) => setSelectedSpecialSubject(e.target.value)}>
              {specialAvailabilityBySubject.map((entry) => <option key={entry.subject} value={entry.subject}>{entry.subject} ({entry.count})</option>)}
            </Select>
          ) : (
            <div className="rounded-2xl bg-violet-50 px-4 py-3 text-sm font-bold text-violet-800 ring-1 ring-violet-100">المادة الحالية: {specialAvailabilityBySubject[0]?.subject || teacherSubjects[0] || '—'}</div>
          )
        ) : null}
        {definitionScope === 'special' && !currentDefinitions.length ? <div className="rounded-2xl bg-amber-50 px-4 py-3 text-sm font-bold text-amber-900 ring-1 ring-amber-200">لا توجد بنود تخصصية مفعلة لهذه المادة حتى الآن.</div> : null}
      </div>
    );
  };



  const renderQuickActionButtons = () => (
    <div className="overflow-hidden rounded-[32px] bg-gradient-to-br from-white via-slate-50 to-slate-100 p-5 ring-1 ring-slate-200 shadow-sm">
      <div className="flex items-center justify-between gap-3">
        <div>
          <div className="font-bold text-slate-800">اختر {actionType === 'reward' ? 'المكافأة' : 'الخصم'} مباشرة</div>
          <div className="text-sm text-slate-500">واجهة أزرار كبيرة مهيأة للجوال. لا تظهر القوائم المنسدلة في هذا المسار.</div>
        </div>
        <Badge tone={actionType === 'reward' ? 'green' : 'rose'}>{currentDefinitions.length} بنود</Badge>
      </div>
      <div className="mt-4 grid grid-cols-3 gap-2 rounded-[28px] bg-white p-2 ring-1 ring-slate-200">
        <div className={cx('rounded-2xl px-3 py-3 text-center text-xs font-black', identifiedStudent ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-50 text-slate-400 ring-1 ring-slate-200')}>1. تحديد الطالب</div>
        <div className={cx('rounded-2xl px-3 py-3 text-center text-xs font-black', identifiedStudent ? 'bg-sky-100 text-sky-700' : 'bg-slate-50 text-slate-400 ring-1 ring-slate-200')}>2. اختيار البند</div>
        <div className={cx('rounded-2xl px-3 py-3 text-center text-xs font-black', lastExecution && lastExecution.type === actionType ? 'bg-violet-100 text-violet-700' : 'bg-slate-50 text-slate-400 ring-1 ring-slate-200')}>3. اعتماد فوري</div>
      </div>
      <div className="mt-4 grid grid-cols-2 gap-3 md:grid-cols-5">
        <div className="rounded-2xl bg-white p-3 ring-1 ring-slate-200"><div className="text-[11px] font-bold text-slate-500">نقاطك الحالية</div><div className="mt-1 text-lg font-black text-slate-900">{currentUser.points || 0}</div></div>
        <div className="rounded-2xl bg-white p-3 ring-1 ring-slate-200"><div className="text-[11px] font-bold text-slate-500">عملياتك اليوم</div><div className="mt-1 text-lg font-black text-slate-900">{teacherStats.total}</div></div>
        <div className="rounded-2xl bg-white p-3 ring-1 ring-slate-200"><div className="text-[11px] font-bold text-slate-500">النوع الحالي</div><div className="mt-1 text-lg font-black text-slate-900">{actionType === 'reward' ? 'مكافأة' : 'خصم'}</div></div>
        <div className="rounded-2xl bg-white p-3 ring-1 ring-slate-200"><div className="text-[11px] font-bold text-slate-500">رصيدك التخصصي</div><div className="mt-1 text-lg font-black text-violet-700">{teacherSpecialScore}</div></div>
        <div className={cx('rounded-2xl p-3 ring-1', actionType === 'reward' ? 'bg-emerald-50 ring-emerald-100' : 'bg-rose-50 ring-rose-100')}><div className="text-[11px] font-bold text-slate-500">أثر البند المختار</div><div className="mt-1 text-lg font-black text-slate-900">{selectedDefinition ? (selectedDefinition.points > 0 ? `+${selectedDefinition.points}` : selectedDefinition.points) : '—'}</div><div className="mt-1 text-[11px] font-bold text-slate-500">{specialAvailabilityBySubject.length ? `مواد تخصصية مفعلة: ${specialAvailabilityBySubject.length}` : 'لا توجد مواد تخصصية مفعلة'}</div></div>
      </div>
      {renderDefinitionScopeChooser()}
      <div className="mt-4">
        <label className="block">
          <span className="mb-2 block text-sm font-bold text-slate-700">ملاحظة اختيارية</span>
          <textarea value={note} onChange={(e) => setNote(e.target.value)} className="min-h-[88px] w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none" placeholder="ملاحظة تحفظ في السجل عند الحاجة" />
        </label>
      </div>
      {teacherLastDefinitionForCurrentType ? (
        <div className={cx('mt-4 grid gap-3', teacherFastMode ? 'grid-cols-1' : 'grid-cols-1 sm:grid-cols-2')}>
          <button onClick={continueOnLastDefinition} disabled={!identifiedStudent || !!executingDefinitionId} className={cx('rounded-[28px] border px-4 py-4 text-right text-sm font-black transition', !identifiedStudent || executingDefinitionId ? 'cursor-not-allowed border-slate-200 bg-slate-100 text-slate-400' : 'border-slate-900 bg-slate-900 text-white hover:bg-slate-800')}>
            <div className="flex items-center justify-between gap-3">
              <div>
                <div>تنفيذ آخر سبب مباشرة</div>
                <div className="mt-1 text-xs opacity-75">{teacherLastDefinitionForCurrentType.definitionTitle || 'آخر بند مستخدم'} • {teacherLastDefinitionForCurrentType.method || 'سريع'}</div>
              </div>
              <span className="rounded-2xl bg-white/10 px-3 py-2 text-[11px] font-black">سريع جدًا</span>
            </div>
          </button>
          {teacherFastMode && identifiedStudent && selectedDefinition ? (
            <button onClick={() => applyAction(selectedDefinition, 'الوضع الخاطف')} className={cx('rounded-[28px] border border-emerald-200 bg-emerald-50 px-4 py-4 text-right text-sm font-black text-emerald-900 transition hover:bg-emerald-100', actionType === 'violation' ? 'border-rose-200 bg-rose-50 text-rose-900 hover:bg-rose-100' : '')}>
              <div className="flex items-center justify-between gap-3">
                <div>
                  <div>{actionType === 'reward' ? 'اعتماد سريع الآن' : 'تنفيذ الخصم سريعًا'}</div>
                  <div className="mt-1 text-xs opacity-75">{selectedDefinition.title} • {selectedDefinition.points > 0 ? `+${selectedDefinition.points}` : selectedDefinition.points}</div>
                </div>
                <span className="rounded-2xl bg-white/70 px-3 py-2 text-[11px] font-black">خاطف</span>
              </div>
            </button>
          ) : null}
        </div>
      ) : null}
      {/* تم إزالة قسم المفضلة بناءً على طلب المستخدم */}
      <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
        {teacherPreferredDefinitions.map((item, index) => {
          const isExecuting = executingDefinitionId === String(item.id);
          const isSelected = String(definitionId) === String(item.id);
          const isDisabled = !identifiedStudent || (executingDefinitionId && !isExecuting);
          return (
            <button
              key={item.id}
              onClick={() => {
                setDefinitionId(String(item.id));
                if (identifiedStudent) applyAction(item);
              }}
              disabled={isDisabled || isExecuting}
              className={cx(
                'rounded-[28px] border p-4 text-right transition shadow-sm relative overflow-hidden',
                isExecuting
                  ? actionType === 'reward' ? 'border-emerald-500 bg-emerald-600 text-white scale-[0.98] shadow-lg' : 'border-rose-500 bg-rose-600 text-white scale-[0.98] shadow-lg'
                  : isSelected && !executingDefinitionId
                    ? actionType === 'reward' ? 'border-emerald-600 bg-emerald-600 text-white ring-2 ring-emerald-400 shadow-lg scale-[1.01]' : 'border-rose-600 bg-rose-600 text-white ring-2 ring-rose-400 shadow-lg scale-[1.01]'
                  : !identifiedStudent || executingDefinitionId
                    ? 'cursor-not-allowed border-slate-200 bg-slate-100 text-slate-400'
                    : actionType === 'reward' ? 'border-emerald-200 bg-emerald-50 text-emerald-900 hover:bg-emerald-100 active:scale-[0.97]' : 'border-rose-200 bg-rose-50 text-rose-900 hover:bg-rose-100 active:scale-[0.97]'
              )}
            >
              {isExecuting && (
                <div className="absolute inset-0 flex items-center justify-center rounded-[28px] bg-emerald-600/90">
                  <div className="flex items-center gap-2 text-white">
                    <svg className="h-5 w-5 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>
                    <span className="text-sm font-black">جارٍ التنفيذ...</span>
                  </div>
                </div>
              )}
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="font-black">{item.title}</div>
                  <div className="mt-1 text-xs leading-6 opacity-80">{item.description || 'بدون وصف إضافي'}</div>
                </div>
                <div className="space-y-2 text-left">
                  <div className={cx('rounded-2xl px-3 py-2 text-sm font-black', isSelected && !isExecuting ? 'bg-white/30' : 'bg-white/80 text-slate-900')}>{item.points > 0 ? `+${item.points}` : item.points}</div>
                  {isSelected && !isExecuting ? <div className="text-[11px] font-bold text-white/90">✓ محدد</div> : index < 2 ? <div className="text-[11px] font-bold opacity-70">سريع</div> : null}
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );

  const renderProgramForm = () => (
    <div className="space-y-4">
      <div className="overflow-hidden rounded-[30px] bg-gradient-to-br from-sky-950 via-sky-800 to-indigo-700 p-5 text-white shadow-xl">
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="text-sm font-bold text-white/75">مسار البرنامج السريع</div>
            <div className="mt-2 text-2xl font-black">سجّل برنامجك بطريقة احترافية</div>
            <div className="mt-2 text-sm leading-7 text-white/85">استخدم قالبًا سريعًا أو أكمل الإدخال يدويًا، ثم راجع أثر البرنامج وعدد الشواهد قبل الحفظ.</div>
          </div>
          {selectedDefinition ? <div className="rounded-3xl bg-white/10 px-4 py-3 text-center ring-1 ring-white/15"><div className="text-xs text-white/70">أثر المعلم</div><div className="mt-1 text-3xl font-black">{selectedDefinition.points > 0 ? `+${selectedDefinition.points}` : selectedDefinition.points}</div></div> : null}
        </div>
        <div className="mt-4 grid grid-cols-3 gap-3 text-sm">
          <div className="rounded-2xl bg-white/10 p-3 ring-1 ring-white/10"><div className="text-xs text-white/70">القوالب السريعة</div><div className="mt-1 font-black">{programQuickTemplates.length}</div></div>
          <div className="rounded-2xl bg-white/10 p-3 ring-1 ring-white/10"><div className="text-xs text-white/70">الشواهد</div><div className="mt-1 font-black">{programEvidenceFiles.length || 0}</div></div>
          <div className="rounded-2xl bg-white/10 p-3 ring-1 ring-white/10"><div className="text-xs text-white/70">المستهدفون</div><div className="mt-1 font-black">{programTargetCount || '1'}</div></div>
        </div>
      </div>

      {programQuickTemplates.length ? (
        <div className="rounded-3xl bg-white p-5 ring-1 ring-slate-200">
          <div className="flex items-center justify-between gap-3">
            <div>
              <div className="font-bold text-slate-800">قوالب برامج سريعة</div>
              <div className="text-sm text-slate-500">لتعبئة أسرع من الجوال. اضغط القالب ثم عدّل ما تحتاجه.</div>
            </div>
            <Badge tone="blue">{programQuickTemplates.length}</Badge>
          </div>
          <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-2">
            {programQuickTemplates.map((item) => (
              <button key={item.id} onClick={() => applyProgramPreset(item)} className="rounded-3xl border border-sky-100 bg-sky-50 p-4 text-right transition hover:bg-sky-100">
                <div className="flex items-center justify-between gap-3">
                  <div className="font-black text-slate-900">{item.title}</div>
                  <Badge tone="blue">{item.targetCount}</Badge>
                </div>
                <div className="mt-2 text-xs leading-6 text-slate-600">{programTargetOptions.find((option) => option.key === item.targetType)?.label || item.targetType} • {item.targetLabel}</div>
                <div className="mt-2 text-xs leading-6 text-slate-500">{item.note}</div>
              </button>
            ))}
          </div>
        </div>
      ) : null}

      {/* تم إزالة قسم مفضلة البرامج بناءً على طلب المستخدم */}

      <div className="rounded-3xl bg-white p-5 ring-1 ring-slate-200">
        <div className="flex items-center justify-between gap-3">
          <div>
            <div className="font-bold text-slate-800">تفاصيل البرنامج</div>
            <div className="text-sm text-slate-500">نفس واجهة المعلم الجوالية ولكن بمسار برنامج أوضح وأسهل في التنفيذ.</div>
          </div>
          {selectedDefinition ? <Badge tone="blue">{selectedDefinition.points > 0 ? `+${selectedDefinition.points}` : selectedDefinition.points} نقطة</Badge> : null}
        </div>

        <div className="mt-4">
          <Input label="عنوان البرنامج" value={programTitle} onChange={(e) => setProgramTitle(e.target.value)} placeholder="مثال: برنامج انضباط الطابور الصباحي" />
        </div>

        <div className={cx('mt-4 grid gap-3', compactMode ? 'grid-cols-1' : 'md:grid-cols-2')}>
          {(currentDefinitions || []).map((item) => (
            <button key={item.id} onClick={() => setDefinitionId(item.id)} className={cx('rounded-3xl border p-4 text-right transition', String(definitionId) === String(item.id) ? 'border-sky-700 bg-sky-700 text-white shadow-lg' : 'border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100')}>
              <div className="font-black">{item.title}</div>
              <div className={cx('mt-1 text-xs leading-6', String(definitionId) === String(item.id) ? 'text-white/80' : 'text-slate-500')}>{item.description || 'بدون وصف إضافي'}</div>
              <div className="mt-2 text-sm font-black">{item.points > 0 ? `+${item.points}` : item.points} نقطة</div>
            </button>
          ))}
        </div>

        <div className="mt-5 grid grid-cols-2 gap-2 md:grid-cols-4">
          {programTargetOptions.map((item) => (
            <button key={item.key} onClick={() => setProgramTargetType(item.key)} className={cx('rounded-2xl px-4 py-3 text-sm font-bold', programTargetType === item.key ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-700')}>{item.label}</button>
          ))}
        </div>

        {programTargetType === 'company' ? (
          compactMode ? renderProgramCompanyButtons() : (
            <div className="mt-4">
              <Select label="الفصل / الشركة المستهدفة" value={programCompanyId} onChange={(e) => setProgramCompanyId(e.target.value)}>
                {programCompanies.map((company) => <option key={company.id} value={company.rawId || company.id}>{company.name} - {company.className}</option>)}
              </Select>
            </div>
          )
        ) : null}

        {programTargetType === 'student' ? (
          <div className="mt-4 rounded-2xl bg-slate-50 p-4 ring-1 ring-slate-200">
            <Input label="رقم الطالب أو الهوية أو الاسم" value={programStudentQuery} onChange={(e) => setProgramStudentQuery(e.target.value)} placeholder="حدد الطالب المستهدف يدويًا" />
            <button onClick={resolveProgramStudent} className="mt-3 rounded-2xl bg-sky-700 px-4 py-3 text-sm font-bold text-white">تحديد الطالب</button>
            {programStudent ? renderStudentCard(programStudent) : null}
          </div>
        ) : null}

        <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
          <Input label="عدد المستهدفين" type="number" value={programTargetCount} onChange={(e) => setProgramTargetCount(e.target.value)} placeholder="مثال: 25" />
          <Input label="وصف المستهدفين / اسم المجموعة" value={programTargetLabel} onChange={(e) => setProgramTargetLabel(e.target.value)} placeholder="مثال: طلاب الصف الأول متوسط" />
        </div>

        <div className="mt-4">
          <label className="block">
            <span className="mb-2 block text-sm font-bold text-slate-700">تفاصيل التنفيذ</span>
            <textarea value={note} onChange={(e) => setNote(e.target.value)} className="min-h-[110px] w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none" placeholder="نوع البرنامج، الهدف، الآلية، الأثر، وأي ملاحظات أخرى" />
          </label>
        </div>

        <div className="mt-4 rounded-2xl bg-sky-50 p-4 ring-1 ring-sky-200">
          <div className="flex items-center justify-between gap-3">
            <div>
              <div className="font-bold text-slate-800">ملخص البرنامج قبل الحفظ</div>
              <div className="mt-1 text-sm text-slate-500">راجع الأثر والمستهدفين والشواهد قبل الاعتماد النهائي.</div>
            </div>
            {selectedDefinition ? <Badge tone="blue">{selectedDefinition.title}</Badge> : null}
          </div>
          <div className="mt-4 grid grid-cols-2 gap-3 text-sm md:grid-cols-4">
            <div className="rounded-2xl bg-white p-3 ring-1 ring-sky-100"><div className="text-xs text-slate-500">العنوان</div><div className="mt-1 font-black text-slate-800">{programTitle || 'بدون عنوان بعد'}</div></div>
            <div className="rounded-2xl bg-white p-3 ring-1 ring-sky-100"><div className="text-xs text-slate-500">المستهدف</div><div className="mt-1 font-black text-slate-800">{programTargetOptions.find((item) => item.key === programTargetType)?.label || '—'}</div></div>
            <div className="rounded-2xl bg-white p-3 ring-1 ring-sky-100"><div className="text-xs text-slate-500">عدد المستفيدين</div><div className="mt-1 font-black text-slate-800">{programTargetCount || '1'}</div></div>
            <div className="rounded-2xl bg-white p-3 ring-1 ring-sky-100"><div className="text-xs text-slate-500">نقاط المعلم</div><div className="mt-1 font-black text-slate-800">{selectedDefinition?.points > 0 ? `+${selectedDefinition.points}` : selectedDefinition?.points || 0}</div></div>
          </div>
        </div>

        <div className="mt-4 rounded-2xl bg-slate-50 p-4 ring-1 ring-slate-200">
          <div className="font-bold text-slate-800">الشواهد</div>
          <div className="mt-1 text-sm text-slate-500">أرفق صورًا أو لقطات كشواهد للبرنامج، وسيتم رفعها إلى التخزين المركزي وربطها بالسجل.</div>
          <div className="mt-3 flex flex-wrap gap-3">
            <label className="inline-flex cursor-pointer items-center gap-2 rounded-2xl bg-sky-700 px-4 py-3 text-sm font-bold text-white">
              <Upload className="h-4 w-4" /> رفع الشواهد
              <input type="file" accept="image/*" multiple capture="environment" className="hidden" onChange={handleProgramEvidenceFiles} />
            </label>
            {programEvidenceFiles.length ? <Badge tone="blue">{programEvidenceFiles.length} شاهد</Badge> : <Badge tone="slate">بدون شواهد</Badge>}
          </div>
          {programEvidencePreviews.length ? (
            <div className="mt-4 grid grid-cols-2 gap-3 md:grid-cols-4">
              {programEvidencePreviews.map((item) => <img key={item.id} src={item.url} alt={item.name} className="h-28 w-full rounded-2xl object-cover ring-1 ring-slate-200" />)}
            </div>
          ) : null}
        </div>

        <button onClick={submitProgram} disabled={busy} className={cx("mt-4 w-full rounded-2xl px-5 py-3 text-sm font-bold", busy ? 'bg-slate-200 text-slate-500' : 'bg-sky-700 text-white')}>{busy ? 'جارٍ حفظ البرنامج...' : 'حفظ البرنامج'}</button>
      </div>
    </div>
  );

  if (compactMode) {
    const activeAction = actionModes.find((item) => item.key === actionType) || actionModes[0];
    const ActiveIcon = activeAction.icon;
    return (
      <div className="space-y-5">
        {renderExecutionEffect()}
        {teacherView === "home" ? (
          <>
            {renderExecutionBanner()}
            <div className="overflow-hidden rounded-[34px] bg-gradient-to-br from-slate-950 via-sky-900 to-cyan-700 p-5 text-white shadow-2xl">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="text-sm font-bold text-white/80">واجهة المعلم التنفيذية</div>
                  <div className="mt-2 text-2xl font-black">مرحبًا {currentUser.fullName || currentUser.username}</div>
                  <div className="mt-2 text-sm leading-7 text-white/80">واجهة جوالية سريعة بثلاثة أزرار رئيسية فقط، مع اختصارات آخر طالب وآخر برنامج ومؤشرات أداء فورية.</div>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <button onClick={() => setTeacherFastMode((value) => !value)} className={cx('rounded-2xl px-3 py-2 text-xs font-black ring-1 transition', teacherFastMode ? 'bg-amber-300 text-slate-950 ring-amber-200' : 'bg-white/10 text-white ring-white/10')}>{teacherFastMode ? 'الوضع الخاطف مفعل' : 'تفعيل الوضع الخاطف'}</button>
                  <div className="rounded-3xl bg-white/10 p-3 ring-1 ring-white/15">
                    <UserCircle2 className="h-9 w-9" />
                  </div>
                </div>
              </div>
              {/* بطاقة نقاطي الكبيرة */}
              <div className="mt-5 rounded-3xl bg-white/15 p-4 ring-1 ring-white/20">
                <div className="flex items-center justify-between gap-2">
                  <div className="text-sm font-black text-white">⭐ نقاطي</div>
                  <div className="rounded-2xl bg-amber-400 px-3 py-1 text-xs font-black text-slate-950">إجمالي: {myPointsTotal} نقطة</div>
                </div>
                <div className="mt-3 grid grid-cols-2 gap-2">
                  <div className="rounded-2xl bg-white/10 p-3">
                    <div className="text-[11px] text-white/70">نقاط اليوم</div>
                    <div className="mt-1 text-3xl font-black text-amber-300">{myPointsToday}</div>
                    <div className="mt-1 text-[10px] text-white/60">من {myTodayRewards + myTodayViolations + myTodayPrograms} إجراء</div>
                  </div>
                  <div className="rounded-2xl bg-white/10 p-3">
                    <div className="text-[11px] text-white/70">إجمالي النقاط</div>
                    <div className="mt-1 text-3xl font-black text-emerald-300">{myPointsTotal}</div>
                    <div className="mt-1 text-[10px] text-white/60">من {allMyActions.length} إجراء كلي</div>
                  </div>
                </div>
                <div className="mt-2 grid grid-cols-3 gap-2">
                  <div className="rounded-2xl bg-emerald-500/20 p-2 text-center">
                    <div className="text-[10px] text-emerald-200">مكافآت</div>
                    <div className="text-lg font-black text-emerald-300">{myTodayRewards}</div>
                    <div className="text-[9px] text-white/50">+{myTodayRewards * Number(tpSettings.perReward || 2)} نقطة</div>
                  </div>
                  <div className="rounded-2xl bg-rose-500/20 p-2 text-center">
                    <div className="text-[10px] text-rose-200">خصومات</div>
                    <div className="text-lg font-black text-rose-300">{myTodayViolations}</div>
                    <div className="text-[9px] text-white/50">+{myTodayViolations * Number(tpSettings.perViolation || 1)} نقطة</div>
                  </div>
                  <div className="rounded-2xl bg-sky-500/20 p-2 text-center">
                    <div className="text-[10px] text-sky-200">برامج</div>
                    <div className="text-lg font-black text-sky-300">{myTodayPrograms}</div>
                    <div className="text-[9px] text-white/50">+{myTodayPrograms * Number(tpSettings.perProgram || 3)} نقطة</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4">
              {actionModes.map((item) => {
                const Icon = item.icon;
                const tone = item.key === 'reward' ? 'from-emerald-500 to-emerald-600' : item.key === 'violation' ? 'from-rose-500 to-rose-600' : 'from-sky-600 to-indigo-600';
                return (
                  <button key={item.key} onClick={() => openTeacherAction(item.key)} className={`rounded-[28px] bg-gradient-to-r ${tone} p-5 text-right text-white shadow-lg transition hover:scale-[1.01]`}>
                    <div className="flex items-center justify-between gap-4">
                      <div>
                        <div className="text-2xl font-black">{item.label}</div>
                        <div className="mt-2 text-sm leading-7 text-white/85">{item.key === 'reward' ? 'افتح الكاميرا مباشرة ثم اختر نوع المكافأة.' : item.key === 'violation' ? 'افتح الكاميرا مباشرة ثم اختر سبب الخصم أو المخالفة.' : 'سجّل برنامجك وشواهده والمستهدفين بسهولة.'}</div>
                      </div>
                      <div className="rounded-3xl bg-white/15 p-4 ring-1 ring-white/15"><Icon className="h-7 w-7" /></div>
                    </div>
                  </button>
                );
              })}
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div className="rounded-3xl bg-white p-4 ring-1 ring-slate-200"><div className="text-xs text-slate-500">مكافآت</div><div className="mt-2 text-2xl font-black text-emerald-700">{teacherStats.rewards}</div></div>
              <div className="rounded-3xl bg-white p-4 ring-1 ring-slate-200"><div className="text-xs text-slate-500">خصومات</div><div className="mt-2 text-2xl font-black text-rose-700">{teacherStats.violations}</div></div>
              <div className="rounded-3xl bg-white p-4 ring-1 ring-slate-200"><div className="text-xs text-slate-500">برامج</div><div className="mt-2 text-2xl font-black text-sky-700">{teacherStats.programs}</div></div>
            </div>

            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
              <button onClick={fillFromLastStudentAction} disabled={!teacherLastStudentAction} className={cx('rounded-[28px] p-5 text-right ring-1 transition', teacherLastStudentAction ? 'bg-white text-slate-900 ring-slate-200 hover:bg-slate-50' : 'bg-slate-100 text-slate-400 ring-slate-200')}>
                <div className="text-sm font-bold text-slate-500">اختصار سريع</div>
                <div className="mt-1 text-xl font-black">آخر طالب</div>
                <div className="mt-2 text-sm leading-7">{teacherLastStudentAction ? `${teacherLastStudentAction.studentName || teacherLastStudentAction.targetLabel} • ${teacherLastStudentAction.definitionTitle || 'إجراء سابق'}` : 'سيظهر هنا آخر طالب تعاملت معه'}</div>
              </button>
              <button onClick={fillProgramFromLastAction} disabled={!teacherLastProgramAction} className={cx('rounded-[28px] p-5 text-right ring-1 transition', teacherLastProgramAction ? 'bg-white text-slate-900 ring-slate-200 hover:bg-slate-50' : 'bg-slate-100 text-slate-400 ring-slate-200')}>
                <div className="text-sm font-bold text-slate-500">تكرار ذكي</div>
                <div className="mt-1 text-xl font-black">آخر برنامج</div>
                <div className="mt-2 text-sm leading-7">{teacherLastProgramAction ? `${teacherLastProgramAction.definitionTitle || 'برنامج'} • ${teacherLastProgramAction.targetLabel || 'مستهدف سابق'}` : 'سيظهر هنا آخر برنامج حفظته'}</div>
              </button>
            </div>

            <div className="grid grid-cols-4 gap-2 rounded-[28px] bg-slate-900 p-2 text-white shadow-lg">
              <button onClick={goTeacherHome} className={cx('rounded-2xl px-3 py-3 text-xs font-black transition', teacherView === 'home' ? 'bg-white text-slate-900' : 'bg-white/10 text-white')}>الرئيسية</button>
              <button onClick={() => switchTeacherActionKeepingStudent('reward')} className={cx('rounded-2xl px-3 py-3 text-xs font-black transition', actionType === 'reward' && teacherView !== 'home' ? 'bg-emerald-400 text-slate-950' : 'bg-white/10 text-white')}>مكافأة</button>
              <button onClick={() => switchTeacherActionKeepingStudent('violation')} className={cx('rounded-2xl px-3 py-3 text-xs font-black transition', actionType === 'violation' && teacherView !== 'home' ? 'bg-rose-400 text-slate-950' : 'bg-white/10 text-white')}>خصم</button>
              <button onClick={() => openTeacherAction('program')} className={cx('rounded-2xl px-3 py-3 text-xs font-black transition', actionType === 'program' && teacherView !== 'home' ? 'bg-sky-400 text-slate-950' : 'bg-white/10 text-white')}>برنامج</button>
            </div>

            <div className="rounded-[28px] bg-white p-5 ring-1 ring-slate-200">
              <div className="flex items-center justify-between gap-3">
                <div className="font-black text-slate-800">آخر إجراءاتي</div>
                <Badge tone="slate">{teacherRecentActions.length}</Badge>
              </div>
              <div className="mt-4 space-y-3">
                {teacherRecentActions.length ? teacherRecentActions.map((item) => (
                  <div key={item.id} className="rounded-2xl bg-slate-50 p-4 ring-1 ring-slate-200">
                    <div className="flex items-center justify-between gap-3">
                      <div className="font-bold text-slate-800">{item.studentName || item.targetLabel || item.definitionTitle || 'إجراء'}</div>
                      <Badge tone={item.actionType === 'reward' ? 'green' : item.actionType === 'violation' ? 'rose' : 'blue'}>{item.actionType === 'reward' ? 'مكافأة' : item.actionType === 'violation' ? 'خصم' : 'برنامج'}</Badge>
                    </div>
                    <div className="mt-2 text-sm text-slate-500">{item.definitionTitle || item.note || 'بدون تفاصيل إضافية'}</div>
                    <div className="mt-2 text-xs text-slate-400">{formatDateTime(item.createdAt)}</div>
                  </div>
                )) : <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-4 py-8 text-center text-sm text-slate-500">لا توجد عمليات مسجلة لك بعد.</div>}
              </div>
            </div>
          </>
        ) : (
          <>
            {renderExecutionBanner()}
            <div className="rounded-[28px] bg-white p-5 ring-1 ring-slate-200">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3">
                  <div className={cx('flex h-14 w-14 items-center justify-center rounded-3xl', actionType === 'reward' ? 'bg-emerald-100 text-emerald-700' : actionType === 'violation' ? 'bg-rose-100 text-rose-700' : 'bg-sky-100 text-sky-700')}>
                    <ActiveIcon className="h-7 w-7" />
                  </div>
                  <div>
                    <div className="text-sm font-bold text-slate-500">شاشة التنفيذ السريع</div>
                    <div className="mt-1 text-2xl font-black text-slate-900">{activeAction.label}</div>
                    <div className="mt-2 text-sm leading-7 text-slate-500">{actionType === 'program' ? 'سجّل البرنامج مباشرة من الجوال مع الشواهد والمستهدفين.' : 'جاهز للتنفيذ المتتابع: الكاميرا تبدأ مباشرة، وبعد نجاح العملية يمكنك مسح الطالب التالي دون الرجوع للرئيسية.'}</div>
                  </div>
                </div>
                <button onClick={goTeacherHome} className="rounded-2xl bg-slate-100 px-4 py-3 text-sm font-black text-slate-700">رجوع</button>
              </div>
              {actionType !== 'program' ? (
                <div className="mt-4 grid grid-cols-1 gap-3 rounded-[26px] bg-slate-950 p-3 text-white shadow-lg sm:grid-cols-[1.1fr,0.9fr]">
                  <div className="rounded-3xl bg-white/10 px-4 py-3 ring-1 ring-white/10">
                    <div className="text-[11px] font-bold text-white/65">السياق الحالي</div>
                    <div className="mt-1 text-base font-black">{teacherContextLabel}</div>
                    <div className="mt-2 text-xs text-white/70">{selectedSchool?.name || 'المدرسة الحالية'}{identifiedStudent ? ` • ${identifiedStudent.className || identifiedStudent.companyName || 'الفصل الحالي'}` : ' • جهّز الطالب أولًا ثم بدّل بين المكافأة والخصم دون إعادة مسح.'}</div>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <button onClick={() => switchTeacherActionKeepingStudent('reward')} className={cx('rounded-2xl px-3 py-3 text-sm font-black transition', actionType === 'reward' ? 'bg-emerald-400 text-slate-950' : 'bg-white/10 text-white')}>مكافأة</button>
                    <button onClick={() => switchTeacherActionKeepingStudent('violation')} className={cx('rounded-2xl px-3 py-3 text-sm font-black transition', actionType === 'violation' ? 'bg-rose-400 text-slate-950' : 'bg-white/10 text-white')}>خصم</button>
                    <button onClick={continueOnSameStudent} disabled={!identifiedStudent} className={cx('rounded-2xl px-3 py-3 text-xs font-black transition', identifiedStudent ? 'bg-white/10 text-white' : 'cursor-not-allowed bg-white/5 text-white/40')}>نفس الطالب</button>
                    <button onClick={continueSequentialAction} className="rounded-2xl bg-white px-3 py-3 text-xs font-black text-slate-900">الطالب التالي</button>
                  </div>
                </div>
              ) : (
                <div className="mt-4 rounded-[26px] bg-sky-50 p-4 text-sm text-sky-900 ring-1 ring-sky-100">
                  <div className="font-black">{selectedSchool?.name || 'المدرسة الحالية'}</div>
                  <div className="mt-1 text-xs text-sky-800/80">صفحة برامج المعلم مستقلة عن إعدادات المدارس، ويمكنك تعبئة البرنامج ثم حفظه أو اعتماده حسب السياسة المحددة.</div>
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-3xl bg-slate-900 px-4 py-3 text-white shadow-lg">
                <div className="text-[11px] font-bold text-white/65">وضع التنفيذ</div>
                <div className="mt-1 text-sm font-black">{teacherFastMode ? 'خاطف ومختصر' : 'كامل ومفصل'}</div>
              </div>
              <button onClick={() => setTeacherFastMode((value) => !value)} className={cx('rounded-3xl px-4 py-3 text-sm font-black ring-1 transition', teacherFastMode ? 'bg-amber-50 text-amber-900 ring-amber-200' : 'bg-slate-50 text-slate-700 ring-slate-200')}>
                {teacherFastMode ? 'التحويل للوضع الكامل' : 'تفعيل الوضع الخاطف'}
              </button>
            </div>

            {actionType !== 'program' ? (
              <>
                {renderQuickIdentifyPanel()}
                {renderStudentCard(identifiedStudent)}
                {renderQuickActionButtons()}
              </>
            ) : renderProgramForm()}

            <div className="sticky bottom-3 z-20 mt-4 rounded-[30px] bg-slate-950/95 p-2 text-white shadow-2xl backdrop-blur">
              <div className="grid grid-cols-4 gap-2">
                <button onClick={goTeacherHome} className="rounded-2xl px-3 py-3 text-xs font-black bg-white/10">الرئيسية</button>
                <button onClick={() => setIdentifyMethod('barcode')} className={cx('rounded-2xl px-3 py-3 text-xs font-black', identifyMethod === 'barcode' ? 'bg-emerald-400 text-slate-950' : 'bg-white/10')}>باركود</button>
                <button onClick={() => setIdentifyMethod('face')} className={cx('rounded-2xl px-3 py-3 text-xs font-black', identifyMethod === 'face' ? 'bg-sky-400 text-slate-950' : 'bg-white/10')}>وجه</button>
                <button onClick={() => setIdentifyMethod('manual')} className={cx('rounded-2xl px-3 py-3 text-xs font-black', identifyMethod === 'manual' ? 'bg-amber-300 text-slate-950' : 'bg-white/10')}>يدوي</button>
              </div>
            </div>
          </>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {renderExecutionEffect()}
      <SectionCard title={compactMode ? 'مهام المعلم السريعة' : 'إجراءات الطلاب'} icon={ClipboardCheck} action={<Badge tone="blue">{getRoleLabel(currentUser.role)}</Badge>}>
        <div className={compactMode ? 'space-y-5' : 'grid grid-cols-1 gap-6 xl:grid-cols-[1.1fr_.9fr]'}>
          <div className="space-y-5">
            <div className={cx('grid gap-3', compactMode ? 'grid-cols-3' : 'md:grid-cols-3')}>
              {actionModes.map((item) => {
                const Icon = item.icon;
                return (
                  <button key={item.key} onClick={() => setActionType(item.key)} className={cx('rounded-3xl border p-4 text-right transition', actionType === item.key ? 'border-slate-900 bg-slate-900 text-white shadow-lg' : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50')}>
                    <div className="flex items-center justify-between gap-3">
                      <div className={cx('flex h-11 w-11 items-center justify-center rounded-2xl', actionType === item.key ? 'bg-white/15' : item.tone === 'green' ? 'bg-emerald-100 text-emerald-700' : item.tone === 'rose' ? 'bg-rose-100 text-rose-700' : 'bg-sky-100 text-sky-700')}>
                        <Icon className="h-5 w-5" />
                      </div>
                      <div className="text-sm font-black">{item.label}</div>
                    </div>
                    {!compactMode ? <div className={cx('mt-3 text-xs leading-6', actionType === item.key ? 'text-white/80' : 'text-slate-500')}>{item.description}</div> : null}
                  </button>
                );
              })}
            </div>

            {actionType !== 'program' ? renderQuickIdentifyPanel() : renderProgramForm()}

            {actionType !== 'program' ? (compactMode ? renderQuickActionButtons() : (
              <div className="rounded-3xl bg-white p-5 ring-1 ring-slate-200">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <div className="font-bold text-slate-800">{actionModes.find((item) => item.key === actionType)?.label || 'الإجراء'}</div>
                    <div className="text-sm text-slate-500">{definitionScope === 'special' ? 'هذه البنود تخصصية وتظهر لك فقط بحسب المادة المختارة.' : 'هذه البنود تأتي من إعدادات مدير المدرسة أو الأدمن.'}</div>
                  </div>
                  {selectedDefinition ? <Badge tone={actionType === 'violation' ? 'rose' : 'green'}>{selectedDefinition.points > 0 ? `+${selectedDefinition.points}` : selectedDefinition.points} نقطة</Badge> : null}
                </div>
                {renderDefinitionScopeChooser()}
                <div className="mt-4 grid gap-3 md:grid-cols-2">
                  <Select label="البند المعتمد" value={definitionId} onChange={(e) => setDefinitionId(e.target.value)}>
                    {currentDefinitions.map((item) => <option key={item.id} value={item.id}>{item.title}</option>)}
                  </Select>
                  <div className="rounded-2xl bg-slate-50 p-4 ring-1 ring-slate-200">
                    <div className="text-sm text-slate-500">وصف البند</div>
                    <div className="mt-2 text-sm leading-7 text-slate-700">{selectedDefinition?.description || 'بدون وصف إضافي'}</div>
                  </div>
                </div>
                <div className="mt-4">
                  <label className="block">
                    <span className="mb-2 block text-sm font-bold text-slate-700">ملاحظة</span>
                    <textarea value={note} onChange={(e) => setNote(e.target.value)} className="min-h-[90px] w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none" placeholder="سبب الإجراء أو أي ملاحظة تحفظ في السجل" />
                  </label>
                </div>
                <motion.button
                  onClick={() => applyAction(selectedDefinition)}
                  disabled={!identifiedStudent || !selectedDefinition || busy}
                  whileTap={identifiedStudent && selectedDefinition ? { scale: 0.95 } : {}}
                  whileHover={identifiedStudent && selectedDefinition ? { scale: 1.02 } : {}}
                  className={cx('mt-4 w-full rounded-2xl px-5 py-4 text-sm font-black transition-all', !identifiedStudent || !selectedDefinition ? 'bg-slate-200 text-slate-500 cursor-not-allowed' : actionType === 'reward' ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-200 hover:bg-emerald-700' : 'bg-rose-600 text-white shadow-lg shadow-rose-200 hover:bg-rose-700')}
                  style={{ position: 'relative', overflow: 'hidden' }}
                >
                  {busy ? (
                    <span className="flex items-center justify-center gap-2">
                      <motion.span animate={{ rotate: 360 }} transition={{ duration: 0.8, repeat: Infinity, ease: 'linear' }} style={{ display: 'inline-block', width: 16, height: 16, border: '2px solid rgba(255,255,255,0.4)', borderTopColor: '#fff', borderRadius: '50%' }} />
                      جاري التنفيذ...
                    </span>
                  ) : (
                    <span className="flex items-center justify-center gap-2">
                      <span style={{ fontSize: 18 }}>{actionType === 'reward' ? '⭐' : '⚠️'}</span>
                      {actionType === 'reward' ? 'تنفيذ المكافأة' : 'تنفيذ الخصم'}
                      {selectedDefinition ? <span style={{ background: 'rgba(255,255,255,0.2)', borderRadius: 999, padding: '2px 10px', fontSize: 13 }}>{selectedDefinition.points > 0 ? `+${selectedDefinition.points}` : selectedDefinition.points} نقطة</span> : null}
                    </span>
                  )}
                </motion.button>
              </div>
            )) : null}
          </div>

          <div className="space-y-5">
            <div className="rounded-3xl bg-white p-5 ring-1 ring-slate-200">
              <div className="font-bold text-slate-800">{actionType === 'program' ? 'ملخص الاستهداف' : 'الطالب المحدد'}</div>
              {actionType === 'program' ? (
                programTargetType === 'student' && programStudent ? renderStudentCard(programStudent) : (
                  <div className="mt-4 rounded-3xl bg-slate-50 p-4 ring-1 ring-slate-200">
                    <div className="text-sm font-bold text-slate-700">النوع: {programTargetOptions.find((item) => item.key === programTargetType)?.label || '—'}</div>
                    <div className="mt-2 text-sm text-slate-500">التفصيل: {programTargetType === 'company' ? (programCompanies.find((item) => String(item.rawId || item.id) === String(programCompanyId))?.name || '—') : (programTargetLabel || '—')}</div>
                    <div className="mt-2 text-sm text-slate-500">عدد المستهدفين: {programTargetCount || '—'}</div>
                  </div>
                )
              ) : renderStudentCard(identifiedStudent)}
            </div>

            <div className="rounded-3xl bg-white p-5 ring-1 ring-slate-200">
              <div className="font-bold text-slate-800">آخر الإجراءات في المدرسة</div>
              <div className="mt-4 space-y-3">
                {latestActions.length ? latestActions.map((item) => (
                  <div key={item.id} className="rounded-2xl bg-slate-50 p-4 ring-1 ring-slate-200">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <div className="font-bold text-slate-800">{item.student}</div>
                        <div className="mt-1 text-xs text-slate-500">{item.actionTitle} • {item.date} • {item.time}</div>
                      </div>
                      <Badge tone={item.actionType === 'reward' ? 'green' : item.actionType === 'violation' ? 'rose' : 'blue'}>{item.deltaPoints > 0 ? `+${item.deltaPoints}` : item.deltaPoints}</Badge>
                    </div>
                    <div className="mt-2 text-xs text-slate-500">بواسطة: {item.actorName} • {getRoleLabel(item.actorRole)} • {item.method}</div>
                    {item.note ? <div className="mt-2 text-sm text-slate-600">{item.note}</div> : null}
                  </div>
                )) : <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-4 py-8 text-center text-sm text-slate-500">لا توجد إجراءات مسجلة بعد.</div>}
              </div>
            </div>
          </div>
        </div>
      </SectionCard>
    </div>
  );
}

export default StudentActionsPage;

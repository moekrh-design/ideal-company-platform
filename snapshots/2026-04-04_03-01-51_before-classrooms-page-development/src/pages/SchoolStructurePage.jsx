/**
 * ==========================================
 *  SchoolStructurePage Component
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
import { Input, Select } from '../components/ui/FormElements';
import { SectionCard } from '../components/ui/SectionCard';


import { Badge } from '../components/ui/FormElements';
import { SCHOOL_GENDER_OPTIONS, SCHOOL_STAGE_GRADE_OPTIONS, SCHOOL_STAGE_OPTIONS } from '../constants/appConfig.js';
function SchoolStructurePage({ selectedSchool, schoolUsers = [], currentUser, onSaveSchoolStructureProfile, onSaveSchoolStructureStageConfigs, onGenerateSchoolStructureClassrooms, onUpdateSchoolStructureClassroom, onDeleteSchoolStructureClassroom, onClearSchoolStructureClassroomStudents, onAddStudentToSchoolStructureClassroom, onUpdateStudentInSchoolStructureClassroom, onArchiveStudentInSchoolStructureClassroom, onTransferStudentInSchoolStructureClassroom, onImportStudentsToSchoolStructureClassroom, onUpdateScreenLink, onArchiveLegacySchoolSource, onRestoreLegacySchoolSource }) {
  const structureProfile = selectedSchool?.structure?.profile || {};
  const savedStageConfigs = Array.isArray(selectedSchool?.structure?.stageConfigs) ? selectedSchool.structure.stageConfigs : [];
  const [form, setForm] = useState(() => ({
    schoolName: structureProfile.schoolName || selectedSchool?.name || "",
    schoolGender: structureProfile.schoolGender || "boys",
    stages: Array.isArray(structureProfile.stages) && structureProfile.stages.length ? structureProfile.stages : [],
  }));
  const [stageDrafts, setStageDrafts] = useState({});
  const [stageRows, setStageRows] = useState(savedStageConfigs);
  const canEditGlobalIdentity = currentUser?.role === "superadmin";
  const savedClassrooms = Array.isArray(selectedSchool?.structure?.classrooms) ? selectedSchool.structure.classrooms : [];
  const structureTransfers = Array.isArray(selectedSchool?.structure?.transferLog) ? selectedSchool.structure.transferLog : [];
  const normalizedSavedClassrooms = useMemo(() => savedClassrooms.map((item) => ({ ...item, id: String(item.id) })), [savedClassrooms]);
  const [selectedClassroomId, setSelectedClassroomId] = useState(() => String(savedClassrooms[0]?.id || ""));
  const [classroomForm, setClassroomForm] = useState({ companyName: "", leaderUserId: "" });
  const [studentForm, setStudentForm] = useState({ fullName: "", guardianName: "", guardianMobile: "", identityNumber: "", notes: "" });
  const [editingStudentId, setEditingStudentId] = useState(null);
  const [editingStudentForm, setEditingStudentForm] = useState({ fullName: "", guardianName: "", guardianMobile: "", identityNumber: "", notes: "" });
  const [transferStudentId, setTransferStudentId] = useState(null);
  const [transferForm, setTransferForm] = useState({ targetClassroomId: "", reason: "" });
  const [pendingTargetClassroomId, setPendingTargetClassroomId] = useState("");
  const [importPreviewRows, setImportPreviewRows] = useState([]);
  const [importSummary, setImportSummary] = useState(null);
  const [importFileName, setImportFileName] = useState("");
  const [importMessage, setImportMessage] = useState("");
  const [importTargetClassroomId, setImportTargetClassroomId] = useState("");
  const [importColumnMap, setImportColumnMap] = useState({});
  const [screenLinkSavingId, setScreenLinkSavingId] = useState("");
  const [duplicateAlert, setDuplicateAlert] = useState(null); // { student, classroom } أو null
  const [duplicateConfirmModal, setDuplicateConfirmModal] = useState(null); // { payload, conflictStudent, conflictClassroom }
  const importInputRef = useRef(null);
  const legacyArchive = selectedSchool?.legacyArchive || null;
  const legacyArchiveStudentsCount = Array.isArray(legacyArchive?.students) ? legacyArchive.students.length : 0;
  const legacyArchiveCompaniesCount = Array.isArray(legacyArchive?.companies) ? legacyArchive.companies.length : 0;
  const activeLegacyStudentsCount = Array.isArray(selectedSchool?.students) ? selectedSchool.students.length : 0;
  const activeLegacyCompaniesCount = Array.isArray(selectedSchool?.companies) ? selectedSchool.companies.length : 0;

  if (!selectedSchool) {
    return <SectionCard title="الهيكل المدرسي" icon={School}><div className="rounded-3xl border border-dashed border-slate-300 bg-slate-50 p-8 text-center text-sm font-bold text-slate-500">اختر مدرسة أولًا لعرض وحدة الهيكل المدرسي.</div></SectionCard>;
  }

  useEffect(() => {
    const nextProfile = selectedSchool?.structure?.profile || {};
    setForm({
      schoolName: nextProfile.schoolName || selectedSchool?.name || "",
      schoolGender: nextProfile.schoolGender || "boys",
      stages: Array.isArray(nextProfile.stages) && nextProfile.stages.length ? nextProfile.stages : [],
    });
    const nextClassrooms = Array.isArray(selectedSchool?.structure?.classrooms) ? selectedSchool.structure.classrooms : [];
    setStageRows(Array.isArray(selectedSchool?.structure?.stageConfigs) ? selectedSchool.structure.stageConfigs : []);
    setSelectedClassroomId((prev) => {
      const preferred = String(prev || "");
      const hasPreferred = nextClassrooms.some((item) => String(item.id) === preferred);
      return hasPreferred ? preferred : String(nextClassrooms[0]?.id || "");
    });
    const currentClassroom = nextClassrooms.find((item) => String(item.id) === String(selectedClassroomId)) || nextClassrooms[0] || null;
    setClassroomForm({ companyName: currentClassroom?.companyName || "", leaderUserId: currentClassroom?.leaderUserId ? String(currentClassroom.leaderUserId) : "" });
    setStudentForm({ fullName: "", guardianName: "", guardianMobile: "", identityNumber: "", notes: "" });
    setEditingStudentId(null);
    setTransferStudentId(null);
    setTransferForm({ targetClassroomId: "", reason: "" });
    setPendingTargetClassroomId("");
    setImportPreviewRows([]);
    setImportSummary(null);
    setImportFileName("");
    setImportMessage("");
    setImportColumnMap({});
    setImportTargetClassroomId(String(nextClassrooms[0]?.id || ""));
    const nextDrafts = {};
    SCHOOL_STAGE_OPTIONS.forEach((stage) => {
      nextDrafts[stage.key] = {
        gradeKey: SCHOOL_STAGE_GRADE_OPTIONS[stage.key]?.[0]?.[0] || "",
        classCount: 1,
      };
    });
    setStageDrafts(nextDrafts);
  }, [selectedSchool]);

  const toggleStage = (stageKey) => {
    setForm((prev) => ({
      ...prev,
      stages: prev.stages.includes(stageKey) ? prev.stages.filter((item) => item !== stageKey) : [...prev.stages, stageKey],
    }));
  };

  const handleSave = () => {
    onSaveSchoolStructureProfile?.({
      schoolName: canEditGlobalIdentity ? (form.schoolName.trim() || selectedSchool?.name || "") : (selectedSchool?.structure?.profile?.schoolName || selectedSchool?.name || ""),
      schoolGender: form.schoolGender,
      stages: form.stages,
    });
  };

  const updateStageDraft = (stageKey, patch) => {
    setStageDrafts((prev) => ({
      ...prev,
      [stageKey]: {
        ...(prev[stageKey] || {}),
        ...patch,
      },
    }));
  };

  const handleAddStageRow = (stageKey) => {
    const draft = stageDrafts[stageKey] || {};
    const gradeOptions = SCHOOL_STAGE_GRADE_OPTIONS[stageKey] || [];
    const gradeKey = draft.gradeKey || gradeOptions[0]?.[0];
    const gradeLabel = gradeOptions.find(([value]) => value === gradeKey)?.[1];
    const stageLabel = SCHOOL_STAGE_OPTIONS.find((item) => item.key === stageKey)?.label || stageKey;
    const classCount = Math.max(1, Math.min(20, Number(draft.classCount) || 1));
    if (!gradeKey || !gradeLabel) return;
    setStageRows((prev) => {
      const withoutCurrent = prev.filter((item) => !(item.stage === stageKey && item.gradeKey === gradeKey));
      return [...withoutCurrent, { stage: stageKey, stageLabel, gradeKey, gradeLabel, classCount }].sort((a, b) => `${a.stageLabel}-${a.gradeLabel}`.localeCompare(`${b.stageLabel}-${b.gradeLabel}`, 'ar'));
    });
    updateStageDraft(stageKey, { classCount: 1 });
  };

  const handleDeleteStageRow = (stageKey, gradeKey) => {
    setStageRows((prev) => prev.filter((item) => !(item.stage === stageKey && item.gradeKey === gradeKey)));
  };

  const handleSaveStageRows = () => {
    onSaveSchoolStructureStageConfigs?.(stageRows.filter((row) => form.stages.includes(row.stage)));
  };

  const filteredRows = stageRows.filter((row) => form.stages.includes(row.stage));
  const totalClasses = filteredRows.reduce((sum, row) => sum + (Number(row.classCount) || 0), 0);
  const generatedPreviewClassrooms = useMemo(() => generateSchoolStructureClassrooms(filteredRows), [filteredRows]);
  const savedClassroomsCount = normalizedSavedClassrooms.length;
  const leaderOptions = (Array.isArray(schoolUsers) ? schoolUsers : []).filter((user) => ["principal", "supervisor", "teacher"].includes(user.role));
  const schoolScreens = Array.isArray(selectedSchool?.smartLinks?.screens) ? selectedSchool.smartLinks.screens : [];
  const selectedClassroom = normalizedSavedClassrooms.find((item) => String(item.id) === String(selectedClassroomId)) || normalizedSavedClassrooms[0] || null;
  const classroomLinkedScreens = schoolScreens.filter((screen) => String(screen.linkedClassroomId || "") === String(selectedClassroomId));
  const classroomStudents = Array.isArray(selectedClassroom?.students) ? selectedClassroom.students : [];
  const activeStudents = classroomStudents.filter((student) => student.status !== "archived");
  const archivedStudents = classroomStudents.filter((student) => student.status === "archived");
  const availableTransferTargets = normalizedSavedClassrooms.filter((item) => String(item.id) !== String(selectedClassroomId));
  const classroomTransferLog = structureTransfers.filter((entry) => String(entry.fromClassroomId) === String(selectedClassroomId) || String(entry.toClassroomId) === String(selectedClassroomId)).slice().reverse().slice(0, 8);
  const transferStudent = classroomStudents.find((student) => String(student.id) === String(transferStudentId)) || null;
  const structureTabs = [
    { key: "overview", label: "نظرة عامة" },
    { key: "setup", label: "إعداد المدرسة" },
    { key: "classrooms", label: "الفصول" },
    { key: "classroomPage", label: "صفحة الفصل" },
    { key: "safeguards", label: "الحماية" },
  ];
  const [activeStructureTab, setActiveStructureTab] = useState("overview");

  useEffect(() => {
    const target = normalizedSavedClassrooms.find((item) => String(item.id) === String(selectedClassroomId)) || normalizedSavedClassrooms[0] || null;
    setClassroomForm({ companyName: target?.companyName || "", leaderUserId: target?.leaderUserId ? String(target.leaderUserId) : "" });
    setEditingStudentId(null);
    setTransferStudentId(null);
    setTransferForm({ targetClassroomId: "", reason: "" });
    setImportTargetClassroomId((prev) => {
      const preferred = String(prev || "");
      const exists = normalizedSavedClassrooms.some((item) => String(item.id) === preferred);
      return exists ? preferred : String(target?.id || "");
    });
  }, [selectedClassroomId, normalizedSavedClassrooms]);

  useEffect(() => {
    if (!pendingTargetClassroomId) return;
    const targetExists = normalizedSavedClassrooms.some((item) => String(item.id) === String(pendingTargetClassroomId));
    if (!targetExists) return;
    setSelectedClassroomId(String(pendingTargetClassroomId));
    setPendingTargetClassroomId("");
  }, [pendingTargetClassroomId, normalizedSavedClassrooms]);

  useEffect(() => {
    setActiveStructureTab("overview");
  }, [selectedSchool?.id]);

  const handleGenerateClassrooms = () => {
    onGenerateSchoolStructureClassrooms?.(filteredRows);
  };

  const handleSaveClassroomDetails = () => {
    if (!selectedClassroom) return;
    onUpdateSchoolStructureClassroom?.(selectedClassroom.id, {
      companyName: classroomForm.companyName,
      leaderUserId: classroomForm.leaderUserId ? Number(classroomForm.leaderUserId) : null,
    });
  };

  const handleLinkClassroomToScreen = async (screenId, enabled) => {
    if (!selectedClassroom || !screenId || !onUpdateScreenLink) return;
    const screen = schoolScreens.find((item) => String(item.id) === String(screenId));
    if (!screen) return;
    setScreenLinkSavingId(String(screenId));
    try {
      await onUpdateScreenLink(screenId, {
        name: screen.name,
        title: enabled ? `${selectedSchool?.name || "المدرسة"} • ${selectedClassroom.name}` : (screen.title || selectedSchool?.name || "لوحة المدرسة الحية"),
        widgets: screen.widgets || {},
        transition: screen.transition || "fade",
        rotateSeconds: Number(screen.rotateSeconds) || 8,
        theme: screen.theme || "emerald-night",
        template: screen.template || "executive",
        tickerEnabled: Boolean(screen.tickerEnabled),
        tickerText: screen.tickerText || "",
        tickerDir: screen.tickerDir || "ltr",
        tickerBg: screen.tickerBg || "amber",
        tickerSeparator: screen.tickerSeparator || " ✦ ",
        tickerFontSize: Number(screen.tickerFontSize) || 28,
        tickerShowLogo: screen.tickerShowLogo !== false,
        tickerLayout: screen.tickerLayout || "marquee",
        sourceMode: enabled ? "classroom" : "school",
        linkedClassroomId: enabled ? String(selectedClassroom.id) : "",
      });
    } finally {
      setScreenLinkSavingId("");
    }
  };

  // البحث عن طالب مكرر عبر جميع فصول المدرسة
  const findDuplicateAcrossClassrooms = (identityNumber, fullName, excludeClassroomId = null) => {
    const allClassrooms = Array.isArray(selectedSchool?.structure?.classrooms) ? selectedSchool.structure.classrooms : [];
    const normalizedId = String(identityNumber || "").trim();
    const normalizedName = String(fullName || "").trim().toLowerCase();
    for (const classroom of allClassrooms) {
      if (excludeClassroomId && String(classroom.id) === String(excludeClassroomId)) continue;
      const students = Array.isArray(classroom.students) ? classroom.students : [];
      for (const student of students) {
        if (student.status === 'archived') continue;
        const sameId = normalizedId && String(student.identityNumber || "").trim() === normalizedId;
        const sameName = normalizedName && String(student.fullName || "").trim().toLowerCase() === normalizedName;
        if (sameId || sameName) return { student, classroom };
      }
    }
    return null;
  };

  const handleAddStudent = () => {
    if (!selectedClassroom || !studentForm.fullName.trim()) return;
    const payload = {
      fullName: studentForm.fullName,
      guardianName: studentForm.guardianName,
      guardianMobile: studentForm.guardianMobile,
      identityNumber: studentForm.identityNumber,
      notes: studentForm.notes,
    };
    // فحص التكرار عبر كل الفصول (باستثناء الفصل الحالي)
    const conflict = findDuplicateAcrossClassrooms(payload.identityNumber, payload.fullName, selectedClassroom.id);
    if (conflict) {
      setDuplicateConfirmModal({ payload, conflictStudent: conflict.student, conflictClassroom: conflict.classroom });
      return;
    }
    onAddStudentToSchoolStructureClassroom?.(selectedClassroom.id, payload);
    setStudentForm({ fullName: "", guardianName: "", guardianMobile: "", identityNumber: "", notes: "" });
    setDuplicateAlert(null);
  };

  const startEditStudent = (student) => {
    setEditingStudentId(student.id);
    setEditingStudentForm({
      fullName: student.fullName || "",
      guardianName: student.guardianName || "",
      guardianMobile: student.guardianMobile || "",
      identityNumber: student.identityNumber || "",
      notes: student.notes || "",
    });
  };

  const handleSaveStudentEdit = () => {
    if (!selectedClassroom || !editingStudentId || !editingStudentForm.fullName.trim()) return;
    onUpdateStudentInSchoolStructureClassroom?.(selectedClassroom.id, editingStudentId, editingStudentForm);
    setEditingStudentId(null);
  };

  const handleArchiveStudent = (studentId) => {
    if (!selectedClassroom || !studentId) return;
    onArchiveStudentInSchoolStructureClassroom?.(selectedClassroom.id, studentId);
    if (editingStudentId === studentId) setEditingStudentId(null);
    if (transferStudentId === studentId) setTransferStudentId(null);
  };

  const openTransferStudent = (studentId) => {
    setTransferStudentId(String(studentId));
    setTransferForm({ targetClassroomId: String(availableTransferTargets[0]?.id || ""), reason: "" });
  };

  const handleTransferStudent = () => {
    if (!selectedClassroom || !transferStudentId || !transferForm.targetClassroomId) return;
    const normalizedTargetId = String(transferForm.targetClassroomId);
    try {
      setPendingTargetClassroomId(normalizedTargetId);
      onTransferStudentInSchoolStructureClassroom?.(String(selectedClassroom.id), String(transferStudentId), normalizedTargetId, transferForm.reason);
      setTransferStudentId(null);
      setTransferForm({ targetClassroomId: "", reason: "" });
    } catch (error) {
      console.error(error);
      setPendingTargetClassroomId("");
    }
  };

  const normalizeImportHeader = (value) => String(value || "").replace(/\s+/g, " ").trim();

  const normalizeDigits = (value) => String(value || "").replace(/[٠-٩]/g, (digit) => String("٠١٢٣٤٥٦٧٨٩".indexOf(digit)));

  const sanitizeNumeric = (value) => normalizeDigits(value).replace(/\.0$/, "").replace(/[^\d+]/g, "").trim();

  const normalizeMobileValue = (value) => {
    const raw = sanitizeNumeric(value);
    if (!raw) return "";
    if (raw.startsWith("00966")) return `966${raw.slice(5)}`;
    if (raw.startsWith("+966")) return `966${raw.slice(4)}`;
    if (raw.startsWith("966")) return raw;
    if (raw.startsWith("05")) return `966${raw.slice(1)}`;
    return raw;
  };

  const normalizeIdentityValue = (value) => sanitizeNumeric(value).replace(/^\+/, "");

  const detectImportHeaderIndex = (rows = []) => rows.findIndex((row) => {
    const normalizedRow = (Array.isArray(row) ? row : []).map(normalizeImportHeader);
    return normalizedRow.some((cell) => /اسم الطالب|student name/i.test(cell)) && normalizedRow.some((cell) => /(هوية|اقامة|إقامة|رخصة|جوال|الهاتف|mobile|phone)/i.test(cell));
  });

  const detectHeaderMapping = (headers = []) => {
    const findHeader = (patterns = []) => {
      const index = headers.findIndex((header) => patterns.some((pattern) => pattern.test(header)));
      return index >= 0 ? { index, label: headers[index] } : null;
    };
    return {
      fullName: findHeader([/اسم الطالب/i, /student name/i]),
      identityNumber: findHeader([/رقم.*(هوية|إقامة|اقامة|رخصة)/i, /identity/i, /iqama/i, /id number/i]),
      guardianMobile: findHeader([/رقم.*(جوال|الهاتف|ولي الأمر|ولي الامر|الطالب)/i, /guardian mobile/i, /mobile/i, /phone/i]),
      guardianName: findHeader([/اسم.*ولي الأمر/i, /اسم.*ولي الامر/i, /guardian name/i, /parent name/i]),
      notes: findHeader([/ملاحظ/i, /notes?/i]),
    };
  };

  const extractImportedStudents = (rows = []) => {
    const headerIndex = detectImportHeaderIndex(rows);
    if (headerIndex === -1) {
      return { rows: [], errors: ["لم يتم العثور على صف العناوين. تأكد أن الملف يحتوي على عمود اسم الطالب ومعه الهوية أو الجوال على الأقل."], columnMap: {} };
    }
    const headers = (rows[headerIndex] || []).map(normalizeImportHeader);
    const headerMap = detectHeaderMapping(headers);
    if (!headerMap.fullName) {
      return { rows: [], errors: ["لم يتم العثور على عمود اسم الطالب داخل الملف."], columnMap: {} };
    }
    const result = [];
    const errors = [];
    rows.slice(headerIndex + 1).forEach((row, index) => {
      const values = Array.isArray(row) ? row : [];
      const fullName = String(values[headerMap.fullName.index] || "").trim();
      const guardianName = headerMap.guardianName ? String(values[headerMap.guardianName.index] || "").trim() : "";
      const identityNumber = headerMap.identityNumber ? normalizeIdentityValue(values[headerMap.identityNumber.index]) : "";
      const guardianMobile = headerMap.guardianMobile ? normalizeMobileValue(values[headerMap.guardianMobile.index]) : "";
      const notes = headerMap.notes ? String(values[headerMap.notes.index] || "").trim() : "";
      if (!fullName && !guardianName && !identityNumber && !guardianMobile) return;
      const rowNumber = headerIndex + index + 2;
      const blockingErrors = [];
      const warnings = [];
      if (!fullName) blockingErrors.push("اسم الطالب مفقود");
      if (!identityNumber && !guardianMobile) warnings.push("لا توجد هوية ولا جوال");
      if (identityNumber && !/^\d{10}$/.test(identityNumber)) warnings.push("رقم الهوية / الإقامة ليس 10 أرقام");
      if (guardianMobile && !/^9665\d{8}$/.test(guardianMobile) && !/^05\d{8}$/.test(normalizeDigits(guardianMobile))) warnings.push("رقم الجوال لا يبدو سعوديًا بالصيغ المعتادة");
      if (!guardianName) warnings.push("اسم ولي الأمر غير موجود");
      if (blockingErrors.length) {
        errors.push(`الصف ${rowNumber}: ${blockingErrors.join(" - ")}.`);
      }
      result.push({
        rowNumber,
        fullName,
        identityNumber,
        guardianMobile,
        guardianName,
        notes,
        source: "noor_excel",
        blockingErrors,
        warnings,
      });
    });
    return { rows: result, errors, columnMap: Object.fromEntries(Object.entries(headerMap).filter(([, value]) => value).map(([key, value]) => [key, value.label])) };
  };

  const handleImportFile = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setImportMessage("");
    setImportFileName(file.name);
    try {
      const buffer = await file.arrayBuffer();
      const workbook = XLSX.read(buffer, { type: "array" });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const rawRows = XLSX.utils.sheet_to_json(worksheet, { header: 1, defval: "" });
      const parsed = extractImportedStudents(rawRows);
      setImportColumnMap(parsed.columnMap || {});
      const targetId = String(importTargetClassroomId || selectedClassroom?.id || normalizedSavedClassrooms[0]?.id || "");
      const targetClassroom = normalizedSavedClassrooms.find((item) => String(item.id) === targetId) || null;
      const existingStudents = Array.isArray(targetClassroom?.students) ? targetClassroom.students : [];
      const seen = new Set();
      const preview = parsed.rows.map((student) => {
        const duplicateKey = student.identityNumber || `${student.fullName}::${student.guardianMobile}`;
        const duplicateInFile = duplicateKey ? seen.has(duplicateKey) : false;
        if (duplicateKey) seen.add(duplicateKey);
        const duplicateInClassroom = existingStudents.some((existing) => {
          const sameIdentity = student.identityNumber && String(existing.identityNumber || "") === String(student.identityNumber);
          const sameMobile = student.guardianMobile && String(existing.guardianMobile || "") === String(student.guardianMobile);
          const sameName = String(existing.fullName || "").trim() === student.fullName;
          return sameIdentity || (sameName && sameMobile) || (sameName && !student.identityNumber);
        });
        const hasBlockingError = Array.isArray(student.blockingErrors) && student.blockingErrors.length > 0;
        return { ...student, duplicateInFile, duplicateInClassroom, hasBlockingError };
      });
      const accepted = preview.filter((student) => !student.duplicateInFile && !student.duplicateInClassroom && !student.hasBlockingError && student.fullName);
      setImportPreviewRows(preview);
      setImportSummary({
        total: preview.length,
        accepted: accepted.length,
        duplicateInFile: preview.filter((row) => row.duplicateInFile).length,
        duplicateInClassroom: preview.filter((row) => row.duplicateInClassroom).length,
        withWarnings: preview.filter((row) => Array.isArray(row.warnings) && row.warnings.length > 0).length,
        missingGuardianName: preview.filter((row) => !row.guardianName).length,
        invalidIdentity: preview.filter((row) => row.identityNumber && !/^\d{10}$/.test(row.identityNumber)).length,
        invalidMobile: preview.filter((row) => row.guardianMobile && !/^9665\d{8}$/.test(row.guardianMobile) && !/^05\d{8}$/.test(normalizeDigits(row.guardianMobile))).length,
        errors: parsed.errors,
      });
      setImportMessage(`تمت قراءة الملف ${file.name} ومعاينة ${preview.length} سجلًا.`);
    } catch (error) {
      console.error(error);
      setImportPreviewRows([]);
      setImportColumnMap({});
      setImportSummary({ total: 0, accepted: 0, duplicateInFile: 0, duplicateInClassroom: 0, withWarnings: 0, missingGuardianName: 0, invalidIdentity: 0, invalidMobile: 0, errors: ["تعذر قراءة الملف. تأكد من أن الملف Excel صالح."] });
      setImportMessage("حدث خطأ أثناء قراءة ملف Excel.");
    } finally {
      event.target.value = "";
    }
  };

  const handleCommitImport = () => {
    const targetId = String(importTargetClassroomId || selectedClassroom?.id || "");
    if (!targetId) {
      setImportMessage("اختر الفصل الهدف قبل اعتماد الاستيراد.");
      return;
    }
    const acceptedRows = importPreviewRows.filter((student) => !student.duplicateInFile && !student.duplicateInClassroom && !student.hasBlockingError && student.fullName);
    if (acceptedRows.length === 0) {
      setImportMessage("لا توجد سجلات صالحة لاعتمادها داخل هذا الفصل.");
      return;
    }
    const result = onImportStudentsToSchoolStructureClassroom?.(targetId, acceptedRows) || null;
    const importedCount = Number(result?.importedCount || acceptedRows.length || 0);
    const skippedCount = Number(result?.skippedCount || 0);
    setImportMessage(`تم اعتماد ${importedCount} طالبًا داخل الفصل${skippedCount ? `، وتم تجاوز ${skippedCount} سجل مكرر.` : ""}.`);
    setImportPreviewRows([]);
    setImportSummary(null);
    setImportFileName("");
  };

  return (
    <div className="space-y-6">
      <div className="rounded-[1.75rem] bg-white p-3 ring-1 ring-slate-200 shadow-sm">
        <div className="flex flex-wrap gap-2">
          {structureTabs.map((tab) => (
            <button
              key={tab.key}
              type="button"
              onClick={() => setActiveStructureTab(tab.key)}
              className={cx("rounded-2xl px-4 py-3 text-sm font-black transition", activeStructureTab === tab.key ? "bg-sky-700 text-white shadow-sm" : "bg-slate-100 text-slate-700 hover:bg-slate-200")}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {activeStructureTab === "overview" ? <>
      <SectionCard title="الهيكل المدرسي" icon={School} action={<Badge tone="emerald">المرحلة الحالية</Badge>}>
        <div className="mb-6 rounded-[2rem] border border-amber-200 bg-gradient-to-r from-amber-50 via-white to-orange-50 p-5 shadow-sm">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="space-y-2">
              <div className="text-lg font-black text-slate-900">أرشفة المصدر القديم واستكمال الهجرة إلى الهيكل المدرسي</div>
              <div className="text-sm leading-7 text-slate-600">هذه الأداة تنقل الطلاب والفصول القديمة إلى أرشيف مخفي داخل المدرسة، وتُبقي الهيكل المدرسي هو المرجع الظاهر. لا يتم حذف البيانات نهائيًا ويمكن استعادتها لاحقًا عند الحاجة.</div>
              <div className="flex flex-wrap gap-2 text-xs font-bold">
                <span className="rounded-full bg-white px-3 py-2 text-slate-700 ring-1 ring-slate-200">المصدر القديم النشط: {activeLegacyStudentsCount} طالب</span>
                <span className="rounded-full bg-white px-3 py-2 text-slate-700 ring-1 ring-slate-200">{activeLegacyCompaniesCount} فصل/شركة</span>
                <span className="rounded-full bg-violet-100 px-3 py-2 text-violet-800 ring-1 ring-violet-200">الأرشيف المخفي: {legacyArchiveStudentsCount} طالب</span>
                <span className="rounded-full bg-violet-100 px-3 py-2 text-violet-800 ring-1 ring-violet-200">{legacyArchiveCompaniesCount} فصل/شركة</span>
              </div>
            </div>
            <div className="flex flex-wrap gap-3">
              <button type="button" onClick={() => onArchiveLegacySchoolSource?.()} disabled={!schoolHasStructureClassrooms(selectedSchool) || (!activeLegacyStudentsCount && !activeLegacyCompaniesCount)} className="rounded-2xl bg-slate-900 px-5 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50">ترحيل المصدر القديم إلى الأرشيف</button>
              <button type="button" onClick={() => onRestoreLegacySchoolSource?.()} disabled={!legacyArchiveStudentsCount && !legacyArchiveCompaniesCount} className="rounded-2xl border border-slate-300 bg-white px-5 py-3 text-sm font-bold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50">استعادة المصدر القديم</button>
            </div>
          </div>
          {!schoolHasStructureClassrooms(selectedSchool) ? <div className="mt-4 rounded-2xl border border-dashed border-amber-300 bg-amber-100/70 px-4 py-3 text-sm font-bold text-amber-900">لن يتم تفعيل الأرشفة حتى يكون للمدرسة فصول فعلية داخل الهيكل المدرسي.</div> : null}
        </div>
        <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
          <div className="rounded-3xl bg-gradient-to-l from-slate-900 to-slate-800 p-6 text-white shadow-lg">
            <div className="text-sm text-white/70">حالة التنفيذ</div>
            <div className="mt-2 text-3xl font-black">إدارة الطلاب داخل الفصل</div>
            <div className="mt-3 text-sm leading-7 text-white/80">أصبح بإمكان المدير الآن تعديل بيانات الطالب داخل الهيكل المدرسي، وأرشفته بدل الحذف النهائي، ونقله من فصل إلى فصل مع الاحتفاظ بسجل واضح للحركة.</div>
          </div>
          <div className="rounded-3xl bg-white p-6 ring-1 ring-slate-200 shadow-sm xl:col-span-2">
            <div className="text-sm font-bold text-slate-500">الهدف من هذه المرحلة</div>
            <div className="mt-2 text-2xl font-black text-slate-900">تحسين الاستيراد والتحقق من بيانات الطلاب</div>
            <div className="mt-3 text-sm leading-8 text-slate-600">نطوّر الاستيراد داخل الهيكل المدرسي فقط ليصبح أقرب لملفات نور الفعلية، مع معاينة أوضح، والتحقق من الهوية والجوال، ودعم اسم ولي الأمر عندما يكون موجودًا.</div>
          </div>
        </div>
      </SectionCard>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1.45fr,1fr]">
        <SectionCard title="بيانات المدرسة" icon={Building2} action={<Badge tone="blue">آمن ومحافظ</Badge>}>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <Input label="اسم المدرسة داخل الهيكل المدرسي" value={form.schoolName} onChange={(e) => setForm((prev) => ({ ...prev, schoolName: e.target.value }))} placeholder="مثال: متوسطة الأبناء الثالثة" disabled={!canEditGlobalIdentity} className={!canEditGlobalIdentity ? "cursor-not-allowed bg-slate-100 text-slate-500" : ""} />
            <Select label="نوع المدرسة" value={form.schoolGender} onChange={(e) => setForm((prev) => ({ ...prev, schoolGender: e.target.value }))}>
              {SCHOOL_GENDER_OPTIONS.map(([value, label]) => <option key={value} value={value}>{label}</option>)}
            </Select>
          </div>

          <div className="mt-6">
            <div className="mb-3 text-sm font-bold text-slate-700">المراحل الدراسية</div>
            <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
              {SCHOOL_STAGE_OPTIONS.map((stage) => {
                const checked = form.stages.includes(stage.key);
                return (
                  <label key={stage.key} className={cx("flex cursor-pointer items-center justify-between rounded-2xl border p-4 transition", checked ? "border-emerald-300 bg-emerald-50 text-emerald-900" : "border-slate-200 bg-white text-slate-700")}>
                    <div>
                      <div className="font-black">{stage.label}</div>
                      <div className="mt-1 text-xs text-slate-500">عند التفعيل ستظهر قائمة الصفوف الخاصة بهذه المرحلة</div>
                    </div>
                    <input type="checkbox" checked={checked} onChange={() => toggleStage(stage.key)} className="h-5 w-5 rounded border-slate-300 text-emerald-600" />
                  </label>
                );
              })}
            </div>
          </div>

          <div className="mt-6 flex flex-wrap items-center gap-3">
            <button onClick={handleSave} className="inline-flex items-center gap-2 rounded-2xl bg-sky-600 px-5 py-3 text-sm font-black text-white shadow-sm transition hover:bg-sky-700">
              <Save className="h-4 w-4" />
              حفظ بيانات المدرسة
            </button>
            <div className="text-sm text-slate-500">هذا الحفظ لا يغير الحضور ولا البوابات ولا شاشة العرض.</div>
          </div>
          {!canEditGlobalIdentity ? <div className="mt-4 rounded-2xl bg-amber-50 px-4 py-3 text-sm font-bold text-amber-900 ring-1 ring-amber-200">اسم المدرسة والرقم الوزاري والهوية المركزية للمنصة يديرها الأدمن الرئيسي فقط، بينما يستطيع مدير المدرسة متابعة المراحل والفصول والتشغيل اليومي.</div> : null}
        </SectionCard>

        <div className="space-y-6">
          <SectionCard title="ملخص سريع" icon={ClipboardCheck}>
            <div className="space-y-3">
              <div className="rounded-2xl bg-slate-50 p-4 ring-1 ring-slate-200">
                <div className="text-sm text-slate-500">المدرسة الحالية في النظام</div>
                <div className="mt-1 text-lg font-black text-slate-900">{selectedSchool?.name || "—"}</div>
              </div>
              <div className="rounded-2xl bg-slate-50 p-4 ring-1 ring-slate-200">
                <div className="text-sm text-slate-500">المراحل المختارة</div>
                <div className="mt-1 text-lg font-black text-slate-900">{form.stages.map((key) => SCHOOL_STAGE_OPTIONS.find((item) => item.key === key)?.label).filter(Boolean).join("، ") || "—"}</div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-2xl bg-slate-50 p-4 ring-1 ring-slate-200">
                  <div className="text-sm text-slate-500">عدد الصفوف المضافة</div>
                  <div className="mt-1 text-3xl font-black text-slate-900">{filteredRows.length}</div>
                </div>
                <div className="rounded-2xl bg-slate-50 p-4 ring-1 ring-slate-200">
                  <div className="text-sm text-slate-500">إجمالي الفصول</div>
                  <div className="mt-1 text-3xl font-black text-slate-900">{totalClasses}</div>
                </div>
              </div>
            </div>
          </SectionCard>

          <SectionCard title="جاهزية النقل والتعديل" icon={ArrowRightLeft} action={<Badge tone="amber">جديد</Badge>}>
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-2xl bg-slate-50 p-4 ring-1 ring-slate-200">
                <div className="text-sm text-slate-500">الطلاب النشطون</div>
                <div className="mt-1 text-3xl font-black text-slate-900">{activeStudents.length}</div>
              </div>
              <div className="rounded-2xl bg-slate-50 p-4 ring-1 ring-slate-200">
                <div className="text-sm text-slate-500">الطلاب المؤرشفون</div>
                <div className="mt-1 text-3xl font-black text-slate-900">{archivedStudents.length}</div>
              </div>
            </div>
            <div className="mt-4 text-sm leading-8 text-slate-600">أصبح بالإمكان تعديل بيانات الطالب داخل الفصل، أو أرشفته للحفاظ على السجل، أو نقله إلى فصل آخر مع كتابة سبب النقل وحفظه في سجل مستقل.</div>
          </SectionCard>
        </div>
      </div>

      </> : null}

      {activeStructureTab === "setup" ? <>
      <SectionCard title="إعداد الصفوف والفصول" icon={Layers3} action={<Badge tone="violet">مستمر</Badge>}>
        <div className="space-y-5">
          {form.stages.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-slate-300 bg-slate-50 p-8 text-center text-sm font-bold text-slate-500">اختر مرحلة واحدة على الأقل من الأعلى لتظهر لك القوائم المنسدلة الخاصة بالصفوف.</div>
          ) : (
            form.stages.map((stageKey) => {
              const stageMeta = SCHOOL_STAGE_OPTIONS.find((item) => item.key === stageKey);
              const draft = stageDrafts[stageKey] || {};
              const gradeOptions = SCHOOL_STAGE_GRADE_OPTIONS[stageKey] || [];
              return (
                <div key={stageKey} className="rounded-[1.75rem] border border-slate-200 bg-slate-50/80 p-5">
                  <div className="flex flex-col gap-3 lg:flex-row lg:items-end">
                    <div className="min-w-0 flex-1">
                      <div className="text-lg font-black text-slate-900">{stageMeta?.label}</div>
                      <div className="mt-1 text-sm text-slate-500">اختر الصف من القائمة ثم أدخل عدد الفصول الخاصة به وأضفه إلى الجدول.</div>
                    </div>
                    <div className="grid flex-1 grid-cols-1 gap-3 md:grid-cols-[1.2fr,0.8fr,auto]">
                      <Select label={`الصف في مرحلة ${stageMeta?.label || ''}`} value={draft.gradeKey || gradeOptions[0]?.[0] || ''} onChange={(e) => updateStageDraft(stageKey, { gradeKey: e.target.value })}>
                        {gradeOptions.map(([value, label]) => <option key={value} value={value}>{label}</option>)}
                      </Select>
                      <Input label="عدد الفصول" type="number" min="1" max="20" value={draft.classCount ?? 1} onChange={(e) => updateStageDraft(stageKey, { classCount: e.target.value })} />
                      <button type="button" onClick={() => handleAddStageRow(stageKey)} className="inline-flex h-[52px] items-center justify-center gap-2 rounded-2xl bg-sky-700 px-5 text-sm font-black text-white shadow-sm transition hover:bg-sky-800">
                        <Plus className="h-4 w-4" />
                        إضافة
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        <div className="mt-6 overflow-hidden rounded-[1.75rem] border border-slate-200">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200 bg-white text-right">
              <thead className="bg-slate-50 text-sm font-black text-slate-700">
                <tr>
                  <th className="px-4 py-3">المرحلة</th>
                  <th className="px-4 py-3">الصف</th>
                  <th className="px-4 py-3">عدد الفصول</th>
                  <th className="px-4 py-3">إجراء</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm text-slate-700">
                {filteredRows.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-4 py-8 text-center font-bold text-slate-400">لا توجد صفوف مضافة حتى الآن.</td>
                  </tr>
                ) : filteredRows.map((row) => (
                  <tr key={`${row.stage}-${row.gradeKey}`}>
                    <td className="px-4 py-3 font-bold">{row.stageLabel}</td>
                    <td className="px-4 py-3">{row.gradeLabel}</td>
                    <td className="px-4 py-3">{row.classCount}</td>
                    <td className="px-4 py-3"><button onClick={() => handleDeleteStageRow(row.stage, row.gradeKey)} className="rounded-xl bg-rose-50 px-3 py-2 font-bold text-rose-700">حذف</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="mt-6 flex flex-wrap items-center gap-3">
          <button onClick={handleSaveStageRows} className="inline-flex items-center gap-2 rounded-2xl bg-violet-700 px-5 py-3 text-sm font-black text-white shadow-sm transition hover:bg-violet-800"><Save className="h-4 w-4" /> حفظ الصفوف والفصول</button>
          <button onClick={handleGenerateClassrooms} className="inline-flex items-center gap-2 rounded-2xl bg-emerald-700 px-5 py-3 text-sm font-black text-white shadow-sm transition hover:bg-emerald-800"><Wand2 className="h-4 w-4" /> توليد الفصول الفعلية</button>
          <div className="text-sm text-slate-500">التوليد الحالي داخل الهيكل المدرسي فقط.</div>
        </div>
      </SectionCard>

      </> : null}

      {activeStructureTab === "classrooms" ? <>
      <SectionCard title="قائمة الفصول الفعلية" icon={School} action={<Badge tone="sky">{savedClassroomsCount} فصل</Badge>}>
        <div className="mb-5 grid grid-cols-1 gap-4 xl:grid-cols-4">
          <div className="rounded-3xl bg-slate-50 p-5 ring-1 ring-slate-200">
            <div className="text-sm text-slate-500">الفصول المعتمدة</div>
            <div className="mt-1 text-3xl font-black text-slate-900">{savedClassroomsCount}</div>
          </div>
          <div className="rounded-3xl bg-slate-50 p-5 ring-1 ring-slate-200 xl:col-span-3">
            <Select label="اختر فصلًا لفتح صفحته" value={selectedClassroomId} onChange={(e) => setSelectedClassroomId(String(e.target.value))}>
              {(savedClassrooms.length ? savedClassrooms : [{ id: "", name: "لا توجد فصول مولدة" }]).map((item) => <option key={item.id || "empty"} value={item.id}>{item.name}</option>)}
            </Select>
            <div className="mt-3 text-sm text-slate-500">بعد اختيار الفصل ستظهر بياناته الأساسية والطلاب المرتبطون به داخل الهيكل المدرسي فقط.</div>
            {selectedClassroom ? (
              <div className="mt-4 flex flex-wrap gap-3">
                <button type="button" onClick={() => {
                  if (!window.confirm(`سيتم حذف الفصل ${selectedClassroom.name} بالكامل من الهيكل المدرسي. هل تريد المتابعة؟`)) return;
                  onDeleteSchoolStructureClassroom?.(selectedClassroom.id);
                  setSelectedClassroomId("");
                }} className="rounded-2xl bg-rose-600 px-4 py-3 text-sm font-black text-white shadow-sm transition hover:bg-rose-700">حذف الفصل كاملًا</button>
                <button type="button" onClick={() => {
                  if (!window.confirm(`سيتم حذف قائمة الأسماء داخل الفصل ${selectedClassroom.name} فقط مع إبقاء الفصل موجودًا. هل تريد المتابعة؟`)) return;
                  onClearSchoolStructureClassroomStudents?.(selectedClassroom.id);
                }} className="rounded-2xl border border-amber-300 bg-white px-4 py-3 text-sm font-black text-amber-700 transition hover:bg-amber-50">حذف قائمة الأسماء كاملة</button>
              </div>
            ) : null}
          </div>
        </div>
      </SectionCard>

      </> : null}

      {activeStructureTab === "classroomPage" ? (
      selectedClassroom ? (
        <SectionCard title={`صفحة الفصل: ${selectedClassroom.name}`} icon={Users} action={<Badge tone="emerald">صفحة مستقلة</Badge>}>
          <div className="space-y-6">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
              <div className="rounded-3xl bg-slate-50 p-5 ring-1 ring-slate-200"><div className="text-sm text-slate-500">الفصل المحدد</div><div className="mt-2 text-2xl font-black text-slate-900">{selectedClassroom.name}</div><div className="mt-2 text-sm text-slate-600">{selectedClassroom.stageLabel} — {selectedClassroom.gradeLabel}</div></div>
              <div className="rounded-3xl bg-slate-50 p-5 ring-1 ring-slate-200"><div className="text-sm text-slate-500">عدد الطلاب داخل الهيكل</div><div className="mt-2 text-3xl font-black text-slate-900">{classroomStudents.length}</div><div className="mt-2 text-sm text-slate-500">النشطون {activeStudents.length} — المؤرشفون {archivedStudents.length}</div></div>
              <div className="rounded-3xl bg-slate-50 p-5 ring-1 ring-slate-200"><div className="text-sm text-slate-500">اسم الشركة</div><div className="mt-2 text-lg font-black text-slate-900">{selectedClassroom.companyName || "—"}</div></div>
              <div className="rounded-3xl bg-slate-50 p-5 ring-1 ring-slate-200"><div className="text-sm text-slate-500">رائد الفصل</div><div className="mt-2 text-lg font-black text-slate-900">{leaderOptions.find((item) => Number(item.id) === Number(selectedClassroom.leaderUserId))?.name || "—"}</div></div>
            </div>

            <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1fr,1.2fr]">
              <div className="space-y-6">
                <div className="rounded-[1.75rem] border border-slate-200 bg-white p-5 shadow-sm">
                  <div className="text-lg font-black text-slate-900">بيانات الفصل الأساسية</div>
                  <div className="mt-2 text-sm leading-7 text-slate-600">في هذه المرحلة نربط فقط اسم الشركة ورائد الفصل داخل الهيكل المدرسي، دون التأثير على بيانات المنصة الحالية.</div>
                  <div className="mt-5 grid grid-cols-1 gap-4">
                    <Input label="اسم الشركة" value={classroomForm.companyName} onChange={(e) => setClassroomForm((prev) => ({ ...prev, companyName: e.target.value }))} placeholder="مثال: شركة الإبداع" />
                    <Select label="رائد الفصل" value={classroomForm.leaderUserId} onChange={(e) => setClassroomForm((prev) => ({ ...prev, leaderUserId: e.target.value }))}>
                      <option value="">بدون تعيين حاليًا</option>
                      {leaderOptions.map((user) => <option key={user.id} value={user.id}>{user.name} — {getRoleLabel(user.role)}</option>)}
                    </Select>
                    <button type="button" onClick={handleSaveClassroomDetails} className="inline-flex items-center justify-center gap-2 rounded-2xl bg-violet-600 px-5 py-3 text-sm font-black text-white shadow-sm transition hover:bg-violet-700"><Save className="h-4 w-4" /> حفظ بيانات الفصل</button>
                  </div>
                </div>

                <div className="rounded-[1.75rem] border border-cyan-200 bg-cyan-50 p-5 shadow-sm">
                  <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                    <div>
                      <div className="text-lg font-black text-cyan-950">ربط الفصل بشاشات العرض</div>
                      <div className="mt-2 text-sm leading-7 text-cyan-900">اربط هذا الفصل بأي شاشة موجودة في المدرسة ليصبح مصدر بياناتها من الهيكل المدرسي. الربط اختياري وآمن ولا يؤثر على الشاشات الأخرى إلا إذا اخترت ذلك صراحة.</div>
                    </div>
                    <Badge tone="sky">{classroomLinkedScreens.length} شاشة مرتبطة</Badge>
                  </div>
                  {schoolScreens.length === 0 ? (
                    <div className="mt-4 rounded-2xl bg-white p-4 text-sm font-bold text-slate-500 ring-1 ring-cyan-200">لا توجد شاشات عرض منشأة لهذه المدرسة حتى الآن. أنشئ شاشة أولًا من قسم الشاشات والبوابات، ثم ارجع هنا لربطها بهذا الفصل.</div>
                  ) : (
                    <div className="mt-5 space-y-3">
                      {schoolScreens.map((screen) => {
                        const isLinkedToThisClassroom = String(screen.linkedClassroomId || "") === String(selectedClassroom.id) && (screen.sourceMode || "school") === "classroom";
                        const linkedClassroomName = normalizedSavedClassrooms.find((item) => String(item.id) === String(screen.linkedClassroomId || ""))?.name || "";
                        const isSaving = String(screenLinkSavingId) === String(screen.id);
                        return (
                          <div key={screen.id} className="rounded-2xl bg-white p-4 ring-1 ring-cyan-200">
                            <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                              <div>
                                <div className="text-base font-black text-slate-900">{screen.name}</div>
                                <div className="mt-1 text-sm text-slate-600">{screen.title || "لوحة المدرسة الحية"}</div>
                                <div className="mt-2 flex flex-wrap gap-2 text-xs font-bold">
                                  <span className={`rounded-full px-3 py-1 ${isLinkedToThisClassroom ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-600"}`}>{isLinkedToThisClassroom ? "مرتبطة بهذا الفصل" : "غير مرتبطة بهذا الفصل"}</span>
                                  <span className="rounded-full bg-white px-3 py-1 text-slate-600 ring-1 ring-slate-200">المصدر الحالي: {(screen.sourceMode || "school") === "classroom" ? `فصل (${linkedClassroomName || "غير محدد"})` : "المدرسة كاملة"}</span>
                                </div>
                              </div>
                              <div className="flex flex-wrap gap-2">
                                <button
                                  type="button"
                                  onClick={() => handleLinkClassroomToScreen(screen.id, true)}
                                  disabled={isSaving || isLinkedToThisClassroom}
                                  className="inline-flex items-center gap-2 rounded-2xl bg-cyan-700 px-4 py-2.5 text-sm font-black text-white shadow-sm transition enabled:hover:bg-cyan-800 disabled:cursor-not-allowed disabled:opacity-50"
                                >
                                  {isSaving && !isLinkedToThisClassroom ? <Loader2 className="h-4 w-4 animate-spin" /> : <MonitorSmartphone className="h-4 w-4" />}
                                  ربط هذه الشاشة بالفصل
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleLinkClassroomToScreen(screen.id, false)}
                                  disabled={isSaving || !isLinkedToThisClassroom}
                                  className="inline-flex items-center gap-2 rounded-2xl bg-white px-4 py-2.5 text-sm font-black text-slate-700 ring-1 ring-slate-200 transition enabled:hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                                >
                                  {isSaving && isLinkedToThisClassroom ? <Loader2 className="h-4 w-4 animate-spin" /> : <Unlink2 className="h-4 w-4" />}
                                  إلغاء الربط
                                </button>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                <div className="rounded-[1.75rem] border border-slate-200 bg-white p-5 shadow-sm">
                  <div className="text-lg font-black text-slate-900">إضافة طالب يدويًا</div>
                  <div className="mt-2 text-sm leading-7 text-slate-600">هذه الإضافة داخل الفصل المحدد فقط، وهي مستقلة تمامًا عن قوائم الطلاب الأساسية الحالية في المنصة.</div>
                  <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-2">
                    <Input label="اسم الطالب" value={studentForm.fullName} onChange={(e) => setStudentForm((prev) => ({ ...prev, fullName: e.target.value }))} placeholder="الاسم الرباعي" />
                    <Input label="اسم ولي الأمر" value={studentForm.guardianName} onChange={(e) => setStudentForm((prev) => ({ ...prev, guardianName: e.target.value }))} placeholder="اسم ولي الأمر" />
                    <Input label="رقم جوال ولي الأمر" value={studentForm.guardianMobile} onChange={(e) => setStudentForm((prev) => ({ ...prev, guardianMobile: e.target.value }))} placeholder="05xxxxxxxx أو 9665xxxxxxxx" />
                    <Input label="رقم الهوية / الإقامة" value={studentForm.identityNumber} onChange={(e) => {
                      const val = e.target.value;
                      setStudentForm((prev) => ({ ...prev, identityNumber: val }));
                      if (val.trim().length >= 5) {
                        const conflict = findDuplicateAcrossClassrooms(val, studentForm.fullName, selectedClassroom?.id);
                        setDuplicateAlert(conflict);
                      } else {
                        setDuplicateAlert(null);
                      }
                    }} placeholder="كما يظهر في ملف نور" />
                    <div className="md:col-span-2"><label className="mb-2 block text-sm font-bold text-slate-700">ملاحظات</label><textarea value={studentForm.notes} onChange={(e) => setStudentForm((prev) => ({ ...prev, notes: e.target.value }))} rows={3} className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 outline-none transition focus:border-sky-500 focus:ring-4 focus:ring-sky-100" placeholder="ملاحظات إضافية إن وجدت" /></div>
                  </div>
                  {duplicateAlert ? (
                    <div className="mt-3 flex items-start gap-3 rounded-2xl border border-amber-300 bg-amber-50 px-4 py-3">
                      <ShieldAlert className="mt-0.5 h-5 w-5 flex-shrink-0 text-amber-600" />
                      <div className="text-sm">
                        <div className="font-black text-amber-900">تحذير: هذا الطالب موجود بالفعل</div>
                        <div className="mt-0.5 text-amber-800">الاسم: <span className="font-bold">{duplicateAlert.student.fullName}</span> · الفصل: <span className="font-bold">{duplicateAlert.classroom.name || 'فصل غير مسمى'}</span></div>
                        {duplicateAlert.student.identityNumber ? <div className="mt-0.5 text-amber-700">رقم الهوية: {duplicateAlert.student.identityNumber}</div> : null}
                        <div className="mt-1 text-amber-700">سيظهر خيار التأكيد عند الضغط على زر الإضافة.</div>
                      </div>
                    </div>
                  ) : null}
                  <div className="mt-4 flex flex-wrap items-center gap-3">
                    <button type="button" onClick={handleAddStudent} className="inline-flex items-center gap-2 rounded-2xl bg-emerald-600 px-5 py-3 text-sm font-black text-white shadow-sm transition hover:bg-emerald-700"><Plus className="h-4 w-4" /> إضافة الطالب إلى الفصل</button>
                    <div className="text-sm text-slate-500">صار بالإمكان بعد هذه الخطوة تعديل الطالب ونقله وأرشفته.</div>
                  </div>
                </div>

                <div className="rounded-[1.75rem] border border-sky-200 bg-sky-50 p-5 shadow-sm">
                  <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                    <div>
                      <div className="text-lg font-black text-sky-900">استيراد الطلاب من Excel بصيغة نور</div>
                      <div className="mt-2 text-sm leading-7 text-sky-800">ارفع ملف Excel، ثم راجع المعاينة قبل الاعتماد. في هذه المرحلة نستورد فقط إلى الهيكل المدرسي دون أي ربط تشغيلي مع بقية المنصة.</div>
                    </div>
                    <button type="button" onClick={() => importInputRef.current?.click()} className="inline-flex items-center justify-center gap-2 rounded-2xl bg-sky-700 px-5 py-3 text-sm font-black text-white shadow-sm transition hover:bg-sky-800">
                      <Upload className="h-4 w-4" />
                      اختيار ملف Excel
                    </button>
                    <input ref={importInputRef} type="file" accept=".xlsx,.xls,.csv,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-excel,text/csv" className="hidden" onChange={handleImportFile} />
                  </div>
                  <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-2">
                    <Select label="الفصل الهدف للاستيراد" value={importTargetClassroomId} onChange={(e) => setImportTargetClassroomId(String(e.target.value))}>
                      {normalizedSavedClassrooms.map((classroom) => <option key={classroom.id} value={classroom.id}>{classroom.name}</option>)}
                    </Select>
                    <div className="rounded-2xl bg-white p-4 ring-1 ring-sky-200">
                      <div className="text-sm text-slate-500">الملف المحدد</div>
                      <div className="mt-1 text-base font-black text-slate-900">{importFileName || "لم يتم اختيار ملف بعد"}</div>
                      <div className="mt-2 text-xs text-slate-500">الأعمدة المدعومة الآن: اسم الطالب، رقم الهوية/الإقامة، رقم الجوال.</div>
                    </div>
                  </div>
                  {importMessage ? <div className="mt-4 rounded-2xl bg-white px-4 py-3 text-sm font-bold text-sky-900 ring-1 ring-sky-200">{importMessage}</div> : null}
                  {importSummary ? (
                    <div className="mt-4 grid grid-cols-2 gap-3 md:grid-cols-5">
                      <div className="rounded-2xl bg-white p-4 ring-1 ring-sky-200"><div className="text-xs text-slate-500">إجمالي السجلات</div><div className="mt-1 text-2xl font-black text-slate-900">{importSummary.total}</div></div>
                      <div className="rounded-2xl bg-white p-4 ring-1 ring-emerald-200"><div className="text-xs text-slate-500">الصالحة للاعتماد</div><div className="mt-1 text-2xl font-black text-emerald-700">{importSummary.accepted}</div></div>
                      <div className="rounded-2xl bg-white p-4 ring-1 ring-amber-200"><div className="text-xs text-slate-500">مكررة داخل الملف</div><div className="mt-1 text-2xl font-black text-amber-700">{importSummary.duplicateInFile}</div></div>
                      <div className="rounded-2xl bg-white p-4 ring-1 ring-rose-200"><div className="text-xs text-slate-500">مكررة داخل الفصل</div><div className="mt-1 text-2xl font-black text-rose-700">{importSummary.duplicateInClassroom}</div></div>
                      <div className="rounded-2xl bg-white p-4 ring-1 ring-slate-200"><div className="text-xs text-slate-500">الأخطاء</div><div className="mt-1 text-2xl font-black text-slate-900">{importSummary.errors?.length || 0}</div></div>
                    </div>
                  ) : null}
                  {importSummary?.errors?.length ? (
                    <div className="mt-4 rounded-2xl bg-amber-50 p-4 text-sm text-amber-900 ring-1 ring-amber-200">
                      <div className="font-black">ملاحظات القراءة</div>
                      <ul className="mt-2 list-disc space-y-1 pr-5">
                        {importSummary.errors.slice(0, 6).map((error, index) => <li key={`${error}-${index}`}>{error}</li>)}
                      </ul>
                    </div>
                  ) : null}
                  <div className="mt-4 overflow-hidden rounded-[1.5rem] border border-sky-200 bg-white">
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-slate-200 text-right text-sm">
                        <thead className="bg-sky-50 text-slate-700">
                          <tr>
                            <th className="px-4 py-3 font-black">#</th>
                            <th className="px-4 py-3 font-black">اسم الطالب</th>
                            <th className="px-4 py-3 font-black">رقم الهوية / الإقامة</th>
                            <th className="px-4 py-3 font-black">رقم الجوال</th>
                            <th className="px-4 py-3 font-black">الحالة</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {importPreviewRows.length === 0 ? (
                            <tr><td colSpan={5} className="px-4 py-8 text-center font-bold text-slate-400">لا توجد معاينة بعد. اختر ملف Excel أولًا.</td></tr>
                          ) : importPreviewRows.slice(0, 20).map((row, index) => {
                            const statusText = row.duplicateInClassroom ? "مكرر داخل الفصل" : row.duplicateInFile ? "مكرر داخل الملف" : "جاهز للاستيراد";
                            const statusClass = row.duplicateInClassroom ? "text-rose-700" : row.duplicateInFile ? "text-amber-700" : "text-emerald-700";
                            return (
                              <tr key={`${row.rowNumber}-${row.fullName}-${index}`}>
                                <td className="px-4 py-3">{row.rowNumber}</td>
                                <td className="px-4 py-3 font-bold text-slate-900">{row.fullName}</td>
                                <td className="px-4 py-3">{row.identityNumber || "—"}</td>
                                <td className="px-4 py-3">{row.guardianMobile || "—"}</td>
                                <td className={`px-4 py-3 font-black ${statusClass}`}>{statusText}</td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>
                  <div className="mt-4 flex flex-wrap items-center gap-3">
                    <button type="button" onClick={handleCommitImport} className="inline-flex items-center gap-2 rounded-2xl bg-emerald-600 px-5 py-3 text-sm font-black text-white shadow-sm transition hover:bg-emerald-700">
                      <Upload className="h-4 w-4" />
                      اعتماد الاستيراد إلى الفصل
                    </button>
                    <button type="button" onClick={() => { setImportPreviewRows([]); setImportSummary(null); setImportFileName(""); setImportMessage(""); }} className="rounded-2xl bg-white px-5 py-3 text-sm font-black text-slate-700 ring-1 ring-slate-200">مسح المعاينة</button>
                    <div className="text-sm text-slate-500">سيتم تجاوز السجلات المكررة داخل الفصل الحالي تلقائيًا.</div>
                  </div>
                </div>

                {editingStudentId ? (
                  <div className="rounded-[1.75rem] border border-amber-200 bg-amber-50 p-5 shadow-sm">
                    <div className="text-lg font-black text-amber-900">تعديل بيانات الطالب</div>
                    <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-2">
                      <Input label="اسم الطالب" value={editingStudentForm.fullName} onChange={(e) => setEditingStudentForm((prev) => ({ ...prev, fullName: e.target.value }))} />
                      <Input label="اسم ولي الأمر" value={editingStudentForm.guardianName} onChange={(e) => setEditingStudentForm((prev) => ({ ...prev, guardianName: e.target.value }))} />
                      <Input label="رقم جوال ولي الأمر" value={editingStudentForm.guardianMobile} onChange={(e) => setEditingStudentForm((prev) => ({ ...prev, guardianMobile: e.target.value }))} />
                      <Input label="رقم الهوية / الإقامة" value={editingStudentForm.identityNumber} onChange={(e) => setEditingStudentForm((prev) => ({ ...prev, identityNumber: e.target.value }))} />
                      <div className="md:col-span-2"><label className="mb-2 block text-sm font-bold text-slate-700">ملاحظات</label><textarea value={editingStudentForm.notes} onChange={(e) => setEditingStudentForm((prev) => ({ ...prev, notes: e.target.value }))} rows={3} className="w-full rounded-2xl border border-amber-200 bg-white px-4 py-3 text-sm text-slate-800 outline-none transition focus:border-amber-500 focus:ring-4 focus:ring-amber-100" /></div>
                    </div>
                    <div className="mt-4 flex flex-wrap gap-3">
                      <button type="button" onClick={handleSaveStudentEdit} className="inline-flex items-center gap-2 rounded-2xl bg-amber-600 px-5 py-3 text-sm font-black text-white shadow-sm transition hover:bg-amber-700"><Save className="h-4 w-4" /> حفظ التعديل</button>
                      <button type="button" onClick={() => setEditingStudentId(null)} className="rounded-2xl bg-white px-5 py-3 text-sm font-black text-slate-700 ring-1 ring-slate-200">إلغاء</button>
                    </div>
                  </div>
                ) : null}

                {transferStudentId ? (
                  <div className="rounded-[1.75rem] border border-violet-200 bg-violet-50 p-5 shadow-sm">
                    <div className="text-lg font-black text-violet-900">نقل طالب إلى فصل آخر</div>
                    {transferStudent ? (
                      <div className="mt-3 rounded-2xl border border-violet-200 bg-white/80 p-4 text-sm text-violet-900">
                        <div className="font-black">الطالب المحدد للنقل: {transferStudent.fullName || "—"}</div>
                        <div className="mt-1 text-violet-700">ولي الأمر: {transferStudent.guardianName || "—"} · الجوال: {transferStudent.guardianMobile || "—"}</div>
                        <div className="mt-1 text-violet-700">رقم الهوية / الإقامة: {transferStudent.identityNumber || "—"}</div>
                        <div className="mt-1 text-violet-700">الفصل الحالي: {selectedClassroom?.name || "—"}</div>
                      </div>
                    ) : null}
                    <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-2">
                      <Select label="الفصل الهدف" value={transferForm.targetClassroomId} onChange={(e) => setTransferForm((prev) => ({ ...prev, targetClassroomId: e.target.value }))}>
                        <option value="">اختر الفصل الهدف</option>
                        {availableTransferTargets.map((classroom) => <option key={classroom.id} value={classroom.id}>{classroom.name}</option>)}
                      </Select>
                      <Input label="سبب النقل" value={transferForm.reason} onChange={(e) => setTransferForm((prev) => ({ ...prev, reason: e.target.value }))} placeholder="مثال: نقل تنظيمي أو تعديل شعبة" />
                    </div>
                    <div className="mt-4 flex flex-wrap gap-3">
                      <button type="button" onClick={handleTransferStudent} disabled={!transferForm.targetClassroomId} className="inline-flex items-center gap-2 rounded-2xl bg-violet-600 px-5 py-3 text-sm font-black text-white shadow-sm transition enabled:hover:bg-violet-700 disabled:cursor-not-allowed disabled:opacity-50"><ArrowRightLeft className="h-4 w-4" /> تنفيذ النقل</button>
                      <button type="button" onClick={() => setTransferStudentId(null)} className="rounded-2xl bg-white px-5 py-3 text-sm font-black text-slate-700 ring-1 ring-slate-200">إلغاء</button>
                    </div>
                  </div>
                ) : null}
              </div>

              <div className="space-y-6">
                <div className="overflow-hidden rounded-[1.75rem] border border-slate-200 bg-white">
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-slate-200 text-right">
                      <thead className="bg-slate-50 text-sm font-black text-slate-700">
                        <tr><th className="px-4 py-3">الطالب</th><th className="px-4 py-3">ولي الأمر</th><th className="px-4 py-3">الجوال</th><th className="px-4 py-3">رقم الهوية / الإقامة</th><th className="px-4 py-3">الحالة</th><th className="px-4 py-3">الملاحظات</th><th className="px-4 py-3">الإجراءات</th></tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 text-sm text-slate-700">
                        {classroomStudents.length === 0 ? (
                          <tr><td colSpan={7} className="px-4 py-8 text-center font-bold text-slate-400">لا يوجد طلاب مضافون يدويًا داخل هذا الفصل حتى الآن.</td></tr>
                        ) : classroomStudents.map((student) => (
                          <tr key={student.id} className={student.status === "archived" ? "bg-slate-100/80 text-slate-500" : ""}>
                            <td className="px-4 py-3 font-bold text-slate-900">{student.fullName}</td>
                            <td className="px-4 py-3">{student.guardianName || "—"}</td>
                            <td className="px-4 py-3">{student.guardianMobile || "—"}</td>
                            <td className="px-4 py-3">{student.identityNumber || "—"}</td>
                            <td className="px-4 py-3"><Badge tone={student.status === "archived" ? "slate" : "green"}>{student.status === "archived" ? "مؤرشف" : "نشط"}</Badge></td>
                            <td className="px-4 py-3">{student.notes || "—"}</td>
                            <td className="px-4 py-3">
                              <div className="flex flex-wrap gap-2">
                                <button type="button" onClick={() => startEditStudent(student)} disabled={student.status === "archived"} className="rounded-xl bg-amber-50 px-3 py-2 font-bold text-amber-700 disabled:opacity-50"><Pencil className="h-4 w-4" /></button>
                                <button type="button" onClick={() => openTransferStudent(student.id)} disabled={student.status === "archived" || availableTransferTargets.length === 0} className="rounded-xl bg-violet-50 px-3 py-2 font-bold text-violet-700 disabled:opacity-50"><ArrowRightLeft className="h-4 w-4" /></button>
                                <button type="button" onClick={() => handleArchiveStudent(student.id)} disabled={student.status === "archived"} className="rounded-xl bg-rose-50 px-3 py-2 font-bold text-rose-700 disabled:opacity-50"><Archive className="h-4 w-4" /></button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                <div className="rounded-[1.75rem] border border-slate-200 bg-white p-5 shadow-sm">
                  <div className="text-lg font-black text-slate-900">سجل نقل الطلاب</div>
                  <div className="mt-4 space-y-3">
                    {classroomTransferLog.length === 0 ? (
                      <div className="rounded-2xl bg-slate-50 p-4 text-sm font-bold text-slate-500 ring-1 ring-slate-200">لا توجد عمليات نقل مسجلة لهذا الفصل حتى الآن.</div>
                    ) : classroomTransferLog.map((entry) => (
                      <div key={entry.id} className="rounded-2xl bg-slate-50 p-4 ring-1 ring-slate-200">
                        <div className="font-black text-slate-900">{entry.studentName || "طالب"}</div>
                        <div className="mt-1 text-sm text-slate-600">من {entry.fromClassroomName || "—"} إلى {entry.toClassroomName || "—"}</div>
                        <div className="mt-1 text-sm text-slate-500">السبب: {entry.reason || "لم يُذكر"}</div>
                        <div className="mt-1 text-xs text-slate-400">{formatDateTime(entry.createdAt)}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </SectionCard>
      ) : (
        <SectionCard title="صفحة الفصل" icon={Users}><div className="rounded-3xl border border-dashed border-slate-300 bg-slate-50 p-8 text-center text-sm font-bold text-slate-500">ابدأ أولًا بتوليد الفصول الفعلية، ثم اختر فصلًا من القائمة لفتح صفحته المستقلة.</div></SectionCard>
      )

      ) : null}

      {activeStructureTab === "safeguards" ? <>
      <SectionCard title="ضوابط الحماية" icon={ShieldCheck}>
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          {[
            "لا يوجد أي ربط إجباري الآن مع الحضور الذكي.",
            `روابط شاشات العرض المرتبطة بهذا الفصل حاليًا: ${classroomLinkedScreens.length}`,
            `عدد الصفوف المهيأة حاليًا: ${filteredRows.length} — إجمالي الفصول: ${totalClasses}`,
            `الفصول المعتمدة داخل الهيكل المدرسي: ${savedClassroomsCount}`,
          ].map((item) => <div key={item} className="rounded-2xl bg-white p-4 text-sm font-bold text-slate-700 ring-1 ring-slate-200">{item}</div>)}
        </div>
      </SectionCard>

      {/* تقرير الطلاب المكررين عبر الفصول */}
      {(() => {
        const allClassrooms = Array.isArray(selectedSchool?.structure?.classrooms) ? selectedSchool.structure.classrooms : [];
        // جمع كل الطلاب مع معرف فصلهم
        const allStudentsFlat = allClassrooms.flatMap((cls) =>
          (Array.isArray(cls.students) ? cls.students : [])
            .filter((s) => s.status !== 'archived')
            .map((s) => ({ ...s, classroomId: String(cls.id), classroomName: cls.name || 'فصل غير مسمى' }))
        );
        // تجميع حسب رقم الهوية
        const byId = new Map();
        allStudentsFlat.forEach((s) => {
          const key = String(s.identityNumber || '').trim();
          if (!key) return;
          if (!byId.has(key)) byId.set(key, []);
          byId.get(key).push(s);
        });
        const duplicateGroups = [...byId.entries()]
          .filter(([, group]) => group.length > 1)
          .map(([id, group]) => ({ id, group }));
        if (!duplicateGroups.length) {
          return (
            <SectionCard title="الطلاب المكررون عبر الفصول" icon={ShieldCheck}>
              <div className="flex items-center gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 px-5 py-4">
                <BadgeCheck className="h-6 w-6 flex-shrink-0 text-emerald-600" />
                <div className="text-sm font-bold text-emerald-800">لا يوجد أي طالب مكرر برقم هوية متطابقة عبر فصول المدرسة. بيانات الطلاب نظيفة.</div>
              </div>
            </SectionCard>
          );
        }
        return (
          <SectionCard title={`تحذير: طلاب مكررون (${duplicateGroups.length} حالة)`} icon={ShieldAlert}>
            <div className="mb-4 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800">
              <span className="font-black">تنبيه:</span> الطلاب التالية أسماؤهم مسجلة في أكثر من فصل بنفس رقم الهوية. استخدم زر النقل لتصحيح الوضع.
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-200 text-right text-xs font-black text-slate-500">
                    <th className="px-4 py-3">رقم الهوية</th>
                    <th className="px-4 py-3">اسم الطالب</th>
                    <th className="px-4 py-3">الفصل</th>
                    <th className="px-4 py-3">إجراء</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {duplicateGroups.flatMap(({ id, group }) =>
                    group.map((s, idx) => (
                      <tr key={`${id}-${idx}`} className={idx === 0 ? 'bg-rose-50/60' : 'bg-amber-50/60'}>
                        <td className="px-4 py-3 font-mono text-xs text-slate-600">{id}</td>
                        <td className="px-4 py-3 font-bold text-slate-900">{s.fullName}</td>
                        <td className="px-4 py-3 text-slate-700">{s.classroomName}</td>
                        <td className="px-4 py-3">
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedClassroomId(s.classroomId);
                              setActiveStructureTab('classroomPage');
                            }}
                            className="inline-flex items-center gap-1.5 rounded-xl bg-violet-600 px-3 py-1.5 text-xs font-black text-white transition hover:bg-violet-700"
                          >
                            <ArrowRightLeft className="h-3.5 w-3.5" />
                            فتح الفصل
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </SectionCard>
        );
      })()}
      </> : null}

      {/* مودال تأكيد إضافة طالب مكرر */}
      {duplicateConfirmModal ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={() => setDuplicateConfirmModal(null)}>
          <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-2xl bg-rose-100">
                <ShieldAlert className="h-6 w-6 text-rose-600" />
              </div>
              <div>
                <div className="text-lg font-black text-slate-900">تنبيه: طالب مكرر</div>
                <div className="text-sm text-slate-500">هذا الطالب مسجل بالفعل في فصل آخر</div>
              </div>
            </div>
            <div className="mt-4 rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm">
              <div className="font-black text-slate-900">الطالب الموجود حاليًا:</div>
              <div className="mt-1 text-slate-700">الاسم: <span className="font-bold">{duplicateConfirmModal.conflictStudent.fullName}</span></div>
              <div className="mt-0.5 text-slate-700">الفصل: <span className="font-bold">{duplicateConfirmModal.conflictClassroom.name || 'فصل غير مسمى'}</span></div>
              {duplicateConfirmModal.conflictStudent.identityNumber ? <div className="mt-0.5 text-slate-600">رقم الهوية: {duplicateConfirmModal.conflictStudent.identityNumber}</div> : null}
            </div>
            <div className="mt-5 text-sm font-bold text-slate-700">ماذا تريد أن تفعل?</div>
            <div className="mt-3 flex flex-col gap-2">
              <button
                type="button"
                onClick={() => {
                  // نقل الطالب من فصله الحالي إلى الفصل المختار
                  onTransferStudentInSchoolStructureClassroom?.(
                    String(duplicateConfirmModal.conflictClassroom.id),
                    String(duplicateConfirmModal.conflictStudent.id),
                    String(selectedClassroom?.id),
                    'نقل تلقائي بسبب اكتشاف تكرار'
                  );
                  setDuplicateConfirmModal(null);
                  setStudentForm({ fullName: '', guardianName: '', guardianMobile: '', identityNumber: '', notes: '' });
                  setDuplicateAlert(null);
                }}
                className="flex items-center gap-2 rounded-2xl bg-violet-600 px-4 py-3 text-sm font-black text-white transition hover:bg-violet-700"
              >
                <ArrowRightLeft className="h-4 w-4" />
                نقله إلى هذا الفصل (الأفضل)
              </button>
              <button
                type="button"
                onClick={() => {
                  // إضافة كسجل مستقل (مع تحذير)
                  onAddStudentToSchoolStructureClassroom?.(selectedClassroom?.id, duplicateConfirmModal.payload);
                  setDuplicateConfirmModal(null);
                  setStudentForm({ fullName: '', guardianName: '', guardianMobile: '', identityNumber: '', notes: '' });
                  setDuplicateAlert(null);
                }}
                className="flex items-center gap-2 rounded-2xl border border-amber-300 bg-amber-50 px-4 py-3 text-sm font-black text-amber-800 transition hover:bg-amber-100"
              >
                <Plus className="h-4 w-4" />
                إضافة كسجل مستقل (سيظهر في تقرير التكرار)
              </button>
              <button
                type="button"
                onClick={() => setDuplicateConfirmModal(null)}
                className="rounded-2xl bg-white px-4 py-3 text-sm font-black text-slate-700 ring-1 ring-slate-200 transition hover:bg-slate-50"
              >
                إلغاء
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

export default SchoolStructurePage;

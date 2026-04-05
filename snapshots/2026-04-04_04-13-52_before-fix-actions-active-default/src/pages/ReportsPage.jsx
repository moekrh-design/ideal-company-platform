/**
 * ==========================================
 *  ReportsPage Component
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
import { SummaryBox } from '../components/ui/FormElements';
import { SectionCard } from '../components/ui/SectionCard';


import { TeacherPointsReport } from '../components/ui/TeacherPointsReport';
import { Badge } from '../components/ui/FormElements';
import { NafisStudentWidget } from '../components/ui/NafisStudentWidget';
function ReportsPage({ schools, scanLog, actionLog, gateSyncEvents = [], selectedSchool, settings, executiveReport, onExportAttendance, onExportStudents, onExportSchools, onExportBackup }) {
  const schoolLeavePasses = getLeavePasses(selectedSchool);
  const schoolLogs = scanLog.filter((item) => item.schoolId === selectedSchool.id);
  const schoolActions = (actionLog || []).filter((item) => item.schoolId === selectedSchool.id);
  const schoolStudents = getUnifiedSchoolStudents(selectedSchool, { includeArchived: false, preferStructure: true });
  const summary = executiveReport?.summary || {
    totalStudents: schoolStudents.length,
    presentToday: (() => {
      const todayIso = getTodayIso();
      const gateIds = new Set(schoolLogs.filter((item) => item.isoDate === todayIso).map((item) => String(item.studentId)).filter(Boolean));
      const lessonIds = new Set();
      getLessonAttendanceSessions(selectedSchool).filter((s) => s.dateIso === todayIso).forEach((session) => {
        (session.submissions || []).forEach((sub) => {
          (sub.presentStudentIds || []).forEach((id) => lessonIds.add(String(id)));
          const absentSet = new Set((sub.absentStudentIds || []).map(String));
          if (Array.isArray(sub.allStudentIds)) sub.allStudentIds.forEach((id) => { if (!absentSet.has(String(id))) lessonIds.add(String(id)); });
        });
      });
      return new Set([...gateIds, ...lessonIds]).size;
    })(),
    attendanceRate: (() => {
      const todayIso = getTodayIso();
      const gateIds = new Set(schoolLogs.filter((item) => item.isoDate === todayIso).map((item) => String(item.studentId)).filter(Boolean));
      const lessonIds = new Set();
      getLessonAttendanceSessions(selectedSchool).filter((s) => s.dateIso === todayIso).forEach((session) => {
        (session.submissions || []).forEach((sub) => {
          (sub.presentStudentIds || []).forEach((id) => lessonIds.add(String(id)));
          const absentSet = new Set((sub.absentStudentIds || []).map(String));
          if (Array.isArray(sub.allStudentIds)) sub.allStudentIds.forEach((id) => { if (!absentSet.has(String(id))) lessonIds.add(String(id)); });
        });
      });
      const unified = new Set([...gateIds, ...lessonIds]).size;
      return schoolStudents.length ? Math.round((unified / schoolStudents.length) * 100) : 0;
    })(),
    earlyToday: schoolLogs.filter((item) => item.isoDate === getTodayIso() && item.result.includes('مبكر')).length,
    ontimeToday: schoolLogs.filter((item) => item.isoDate === getTodayIso() && item.result.includes('في الوقت')).length,
    lateToday: schoolLogs.filter((item) => item.isoDate === getTodayIso() && item.result.includes('تأخر')).length,
    rewardsToday: schoolActions.filter((item) => item.isoDate === getTodayIso() && item.actionType === 'reward').length,
    violationsToday: schoolActions.filter((item) => item.isoDate === getTodayIso() && item.actionType === 'violation').length,
    programsToday: schoolActions.filter((item) => item.isoDate === getTodayIso() && item.actionType === 'program').length,
  };
  const topStudents = executiveReport?.topStudents || [...schoolStudents].sort((a, b) => b.points - a.points).slice(0, 5).map((student, index) => ({ ...student, rank: index + 1, companyName: getStudentGroupingLabel(student, selectedSchool) }));
  const topCompanies = executiveReport?.topCompanies || [...getUnifiedCompanyRows(selectedSchool, { preferStructure: true })].sort((a, b) => b.points - a.points).slice(0, 5).map((company, index) => ({ ...company, rank: index + 1 }));
  const teacherActivity = executiveReport?.teacherActivity || Object.values(schoolActions.reduce((acc, item) => {
    const key = `${item.actorName}|${item.actorRole}`;
    const row = acc[key] || { actorName: item.actorName, actorRole: item.actorRole, count: 0, rewardCount: 0, violationCount: 0, programCount: 0 };
    row.count += 1;
    if (item.actionType === 'reward') row.rewardCount += 1;
    if (item.actionType === 'violation') row.violationCount += 1;
    if (item.actionType === 'program') row.programCount += 1;
    acc[key] = row;
    return acc;
  }, {})).sort((a, b) => b.count - a.count).slice(0, 5);
  const parentPortalSummary = executiveReport?.parentPortalSummary || null;
  const parentPortalRows = parentPortalSummary ? [
    { metric: 'حالة البوابة', value: parentPortalSummary.portalEnabled ? 'مفعلة' : 'مقفلة' },
    { metric: 'سياسة تحديث الرقم', value: parentPortalSummary.approvalMode === 'manual' ? 'يدوي' : 'تلقائي' },
    { metric: 'أولياء الأمور المرتبطون', value: Number(parentPortalSummary.linkedParents || 0) },
    { metric: 'أولياء الأمور النشطون', value: Number(parentPortalSummary.activeParents || 0) },
    { metric: 'الحسابات المعلقة', value: Number(parentPortalSummary.suspendedParents || 0) },
    { metric: 'الطلبات المعلقة', value: Number(parentPortalSummary.pendingRequests || 0) },
    { metric: 'الاعتمادات المنفذة اليوم', value: Number(parentPortalSummary.approvedToday || 0) },
    { metric: 'تعثرات الإرسال', value: Number(parentPortalSummary.failedDeliveries || 0) },
    { metric: 'الأرقام الإضافية', value: Number(parentPortalSummary.extraContacts || 0) },
    { metric: 'تغطية أولياء الأمور', value: `${Number(parentPortalSummary.coverageRate || 0)}%` },
    { metric: 'تغطية أرقام أولياء الأمور للطلاب', value: `${Number(parentPortalSummary.guardianCoverageRate || 0)}%` },
    { metric: 'تفضيل واتساب', value: Number(parentPortalSummary.preferredWhatsappCount || 0) },
  ] : [];
  const exportExecutiveParentPortal = (format = 'xlsx') => {
    if (!parentPortalRows.length) {
      window.alert('لا توجد بيانات بوابة ولي الأمر ضمن التقرير التنفيذي حاليًا.');
      return;
    }
    if (format === 'csv') {
      downloadFile(`${settings.exportPrefix || 'school'}-${selectedSchool?.code || 'school'}-parent-portal-summary.csv`, buildCsv(parentPortalRows, [
        { key: 'metric', label: 'المؤشر' },
        { key: 'value', label: 'القيمة' },
      ]), 'text/csv;charset=utf-8;');
      return;
    }
    exportRowsToWorkbook(`${settings.exportPrefix || 'school'}-${selectedSchool?.code || 'school'}-parent-portal-summary.xlsx`, 'ParentPortalSummary', parentPortalRows, [
      { key: 'metric', label: 'المؤشر' },
      { key: 'value', label: 'القيمة' },
    ]);
  };
  const printExecutiveSchoolReport = () => {
    const summaryRows = [
      ['طلاب المدرسة', summary.totalStudents],
      ['الحاضرون اليوم', summary.presentToday],
      ['نسبة الحضور', `${summary.attendanceRate}%`],
      ['المكافآت اليوم', summary.rewardsToday],
      ['الخصومات اليوم', summary.violationsToday],
      ['البرامج اليوم', summary.programsToday],
    ].map(([label, value]) => `<div class="stat"><div class="k">${label}</div><div class="v">${value}</div></div>`).join('');
    const parentRowsHtml = parentPortalRows.map((row) => `<tr><td>${String(row.metric || '').replace(/</g,'&lt;')}</td><td>${String(row.value || '').replace(/</g,'&lt;')}</td></tr>`).join('');
    const renderTable = (title, columns, rows) => {
      const head = columns.map((col) => `<th>${col.label}</th>`).join('');
      const body = rows.map((row) => `<tr>${columns.map((col) => `<td>${String(row[col.key] ?? '').replace(/</g,'&lt;')}</td>`).join('')}</tr>`).join('');
      return `<h1 style="font-size:20px;margin-top:24px">${title}</h1><table><thead><tr>${head}</tr></thead><tbody>${body || `<tr><td colspan="${columns.length}">لا توجد بيانات متاحة.</td></tr>`}</tbody></table>`;
    };
    printHtmlContent(`التقرير التنفيذي — ${selectedSchool?.name || 'المدرسة'}`, `<h2>بوابة ولي الأمر</h2><table><thead><tr><th>المؤشر</th><th>القيمة</th></tr></thead><tbody>${parentRowsHtml || '<tr><td colspan="2">لا توجد بيانات متاحة.</td></tr>'}</tbody></table>${renderTable('أعلى الطلاب', [{ key: 'rank', label: '#' }, { key: 'studentName', label: 'الطالب' }, { key: 'className', label: 'الفصل' }, { key: 'points', label: 'النقاط' }, { key: 'attendanceRate', label: 'الحضور %' }], executiveTopStudents)}${renderTable('أعلى الفصول', [{ key: 'rank', label: '#' }, { key: 'className', label: 'الفصل' }, { key: 'averagePoints', label: 'متوسط النقاط' }, { key: 'rewards', label: 'المكافآت' }, { key: 'students', label: 'الطلاب' }], executiveTopClasses)}${renderTable('أعلى المعلمين', [{ key: 'rank', label: '#' }, { key: 'teacherName', label: 'المعلم' }, { key: 'totalActions', label: 'الإجراءات' }, { key: 'submittedLessons', label: 'تحضير الحصص' }, { key: 'specialPoints', label: 'الرصيد التخصصي' }], executiveTopTeachers)}${renderTable('أكثر البنود استخدامًا', [{ key: 'rank', label: '#' }, { key: 'title', label: 'البند' }, { key: 'typeLabel', label: 'النوع' }, { key: 'count', label: 'مرات الاستخدام' }], executiveTopBehaviorItems)}${renderTable('أعلى الطلاب غيابًا', [{ key: 'rank', label: '#' }, { key: 'studentName', label: 'الطالب' }, { key: 'className', label: 'الفصل' }, { key: 'lessonAbsenceCount', label: 'غياب الحصص' }, { key: 'lateCount', label: 'التأخر' }, { key: 'attendanceRate', label: 'الحضور %' }], executiveTopAbsentStudents)}${renderTable('أعلى الطلاب تأخرًا', [{ key: 'rank', label: '#' }, { key: 'studentName', label: 'الطالب' }, { key: 'className', label: 'الفصل' }, { key: 'lateCount', label: 'التأخر' }, { key: 'lessonAbsenceCount', label: 'غياب الحصص' }, { key: 'points', label: 'النقاط' }], executiveTopLateStudents)}${renderTable('أعلى المعلمين مكافآت', [{ key: 'rank', label: '#' }, { key: 'teacherName', label: 'المعلم' }, { key: 'rewards', label: 'المكافآت' }, { key: 'totalActions', label: 'إجمالي الإجراءات' }, { key: 'submittedLessons', label: 'تحضير الحصص' }], executiveTopRewardTeachers)}${renderTable('أعلى المعلمين خصومات', [{ key: 'rank', label: '#' }, { key: 'teacherName', label: 'المعلم' }, { key: 'violations', label: 'الخصومات' }, { key: 'totalActions', label: 'إجمالي الإجراءات' }, { key: 'submittedLessons', label: 'تحضير الحصص' }], executiveTopViolationTeachers)}${renderTable('أعلى الفصول مكافآت', [{ key: 'rank', label: '#' }, { key: 'className', label: 'الفصل' }, { key: 'rewards', label: 'المكافآت' }, { key: 'averagePoints', label: 'متوسط النقاط' }, { key: 'students', label: 'الطلاب' }], executiveTopRewardClasses)}${renderTable('أعلى الفصول خصومات', [{ key: 'rank', label: '#' }, { key: 'className', label: 'الفصل' }, { key: 'violations', label: 'الخصومات' }, { key: 'lateCount', label: 'التأخر' }, { key: 'students', label: 'الطلاب' }], executiveTopViolationClasses)}`, { subtitle: `${selectedSchool?.name || 'المدرسة'} • ${formatDateTime(new Date().toISOString())}`, accent: '#0f766e', summaryCards: [ { label: 'طلاب المدرسة', value: summary.totalStudents, tone: 'tone-blue' }, { label: 'الحاضرون اليوم', value: summary.presentToday, tone: 'tone-green' }, { label: 'نسبة الحضور', value: `${summary.attendanceRate}%`, tone: 'tone-violet' }, { label: 'مكافآت / خصومات / برامج', value: `${summary.rewardsToday} / ${summary.violationsToday} / ${summary.programsToday}`, tone: 'tone-amber' } ] });
  };


  const [reportTab, setReportTab] = useState('attendance');
  const [reportFromDate, setReportFromDate] = useState('');
  const [reportToDate, setReportToDate] = useState('');
  const [reportClassKey, setReportClassKey] = useState('all');
  const [reportTeacherName, setReportTeacherName] = useState('all');
  const [reportStudentId, setReportStudentId] = useState('all');
  const [reportStatus, setReportStatus] = useState('all');
  const schoolGateSyncEvents = useMemo(() => hydrateGateSyncCenterEvents(gateSyncEvents).filter((item) => Number(item.schoolId) === Number(selectedSchool?.id)), [gateSyncEvents, selectedSchool?.id]);

  const classroomRows = useMemo(() => getUnifiedCompanyRows(selectedSchool, { preferStructure: true }), [selectedSchool]);
  const lessonSessions = useMemo(() => getLessonAttendanceSessions(selectedSchool), [selectedSchool]);
  const rewardStore = useMemo(() => getRewardStore(selectedSchool), [selectedSchool]);
  const rewardStoreSummary = useMemo(() => buildRewardStoreSummary(selectedSchool), [selectedSchool]);
  const rewardItems = useMemo(() => (rewardStore.items || []).map((item) => normalizeRewardStoreItem(item)), [rewardStore]);
  const rewardRequests = useMemo(() => Array.isArray(rewardStore.redemptionRequests) ? rewardStore.redemptionRequests : [], [rewardStore]);

  const matchesReportDate = useCallback((isoDate) => {
    const raw = String(isoDate || '').slice(0, 10);
    if (!raw) return true;
    if (reportFromDate && raw < reportFromDate) return false;
    if (reportToDate && raw > reportToDate) return false;
    return true;
  }, [reportFromDate, reportToDate]);

  const attendanceRows = useMemo(() => {
    return schoolStudents.map((student) => {
      const classKey = String(student.classroomId || student.companyId || '');
      const studentScans = schoolLogs.filter((entry) => String(entry.studentId) === String(student.id) && matchesReportDate(entry.isoDate));
      const lateCount = studentScans.filter((entry) => String(entry.result || '').includes('تأخر')).length;
      const earlyCount = studentScans.filter((entry) => String(entry.result || '').includes('مبكر')).length;
      const ontimeCount = studentScans.filter((entry) => String(entry.result || '').includes('في الوقت')).length;
      const sessionAbsences = lessonSessions.reduce((sum, session) => sum + (Array.isArray(session.submissions) ? session.submissions.reduce((subSum, submission) => subSum + ((submission.absentStudentIds || []).map(String).includes(String(student.id)) && matchesReportDate(session.dateIso) ? 1 : 0), 0) : 0), 0);
      const lastScan = studentScans[0] || studentScans.slice().sort((a, b) => String(b.isoDate || '').localeCompare(String(a.isoDate || '')))[0] || null;
      const lastStatus = String(lastScan?.result || student.status || '').includes('تأخر') ? 'late' : lastScan ? 'present' : 'absent';
      return {
        id: student.id,
        studentName: student.name,
        studentNumber: student.studentNumber || '—',
        classKey,
        className: getStudentGroupingLabel(student, selectedSchool),
        totalScans: studentScans.length,
        presentCount: studentScans.length,
        lateCount,
        earlyCount,
        ontimeCount,
        lessonAbsenceCount: sessionAbsences,
        points: Number(student.points || 0),
        status: lastStatus,
        lastScanDate: lastScan?.isoDate || '',
        lastScanTime: lastScan?.time || '',
      };
    }).filter((row) => {
      if (reportClassKey !== 'all' && String(row.classKey) !== String(reportClassKey)) return false;
      if (reportStudentId !== 'all' && String(row.id) !== String(reportStudentId)) return false;
      if (reportStatus !== 'all' && String(row.status) !== String(reportStatus)) return false;
      return true;
    });
  }, [schoolStudents, schoolLogs, lessonSessions, matchesReportDate, selectedSchool, reportClassKey, reportStudentId, reportStatus]);

  const behaviorRows = useMemo(() => {
    const map = {};
    schoolActions.filter((item) => matchesReportDate(item.isoDate)).forEach((item) => {
      const key = String(item.studentId || item.student || 'unknown');
      const classKey = String(item.companyId || '');
      if (!map[key]) map[key] = { studentId: item.studentId || key, studentName: item.student || 'غير معروف', classKey, className: classroomRows.find((row) => String(getClassroomKeyFromCompanyRow(row)) === classKey)?.name || '—', rewards: 0, violations: 0, programs: 0, rewardPoints: 0, violationPoints: 0, lastActionAt: `${item.isoDate || ''} ${item.time || ''}`.trim() };
      if (item.actionType === 'reward') { map[key].rewards += 1; map[key].rewardPoints += Math.abs(Number(item.deltaPoints || 0)); }
      else if (item.actionType === 'violation') { map[key].violations += 1; map[key].violationPoints += Math.abs(Number(item.deltaPoints || 0)); }
      else if (item.actionType === 'program') { map[key].programs += 1; }
      map[key].lastActionAt = `${item.isoDate || ''} ${item.time || ''}`.trim();
    });
    return Object.values(map).filter((row) => {
      if (reportClassKey !== 'all' && String(row.classKey) !== String(reportClassKey)) return false;
      if (reportStudentId !== 'all' && String(row.studentId) !== String(reportStudentId)) return false;
      if (reportStatus === 'positive' && row.rewards <= 0) return false;
      if (reportStatus === 'negative' && row.violations <= 0) return false;
      return true;
    }).sort((a, b) => (b.rewards + b.violations) - (a.rewards + a.violations));
  }, [schoolActions, matchesReportDate, classroomRows, reportClassKey, reportStudentId, reportStatus]);

  const programRows = useMemo(() => {
    const map = {};
    schoolActions.filter((item) => item.actionType === 'program' && matchesReportDate(item.isoDate)).forEach((item) => {
      const key = String(item.actionTitle || 'برنامج');
      const row = map[key] || { programTitle: key, count: 0, students: new Set(), teachers: new Set(), classes: new Set(), lastAt: '' };
      row.count += 1;
      if (item.studentId) row.students.add(String(item.studentId));
      if (item.actorName) row.teachers.add(String(item.actorName));
      if (item.companyId) row.classes.add(String(item.companyId));
      row.lastAt = `${item.isoDate || ''} ${item.time || ''}`.trim();
      map[key] = row;
    });
    return Object.values(map).map((row) => ({ ...row, studentsCount: row.students.size, teachersCount: row.teachers.size, classesCount: row.classes.size })).sort((a, b) => b.count - a.count);
  }, [schoolActions, matchesReportDate]);

  const teacherRows = useMemo(() => {
    const map = {};
    schoolActions.filter((item) => matchesReportDate(item.isoDate)).forEach((item) => {
      const key = String(item.actorName || 'غير محدد');
      if (!map[key]) map[key] = { teacherName: key, role: item.actorRole || 'teacher', rewards: 0, violations: 0, programs: 0, classes: new Set(), submittedLessons: 0, openedLessons: 0 };
      if (item.actionType === 'reward') map[key].rewards += 1;
      if (item.actionType === 'violation') map[key].violations += 1;
      if (item.actionType === 'program') map[key].programs += 1;
      if (item.companyId) map[key].classes.add(String(item.companyId));
    });
    lessonSessions.filter((session) => matchesReportDate(session.dateIso)).forEach((session) => {
      (session.teacherInvites || []).forEach((invite) => {
        const key = String(invite.teacherName || invite.teacherId || 'غير محدد');
        if (!map[key]) map[key] = { teacherName: key, role: 'teacher', rewards: 0, violations: 0, programs: 0, classes: new Set(), submittedLessons: 0, openedLessons: 0 };
        if (invite.openedAt) map[key].openedLessons += 1;
      });
      (session.submissions || []).forEach((submission) => {
        const key = String(submission.teacherName || submission.teacherId || 'غير محدد');
        if (!map[key]) map[key] = { teacherName: key, role: 'teacher', rewards: 0, violations: 0, programs: 0, classes: new Set(), submittedLessons: 0, openedLessons: 0 };
        map[key].submittedLessons += 1;
        if (submission.classKey) map[key].classes.add(String(submission.classKey));
      });
    });
    return Object.values(map).map((row) => ({ ...row, classesCount: row.classes.size, totalActions: row.rewards + row.violations + row.programs })).filter((row) => reportTeacherName === 'all' || row.teacherName === reportTeacherName).sort((a, b) => (b.totalActions + b.submittedLessons) - (a.totalActions + a.submittedLessons));
  }, [schoolActions, lessonSessions, matchesReportDate, reportTeacherName]);

  const studentComprehensiveRows = useMemo(() => {
    const behaviorMap = Object.fromEntries(behaviorRows.map((row) => [String(row.studentId), row]));
    const storeMap = {};
    rewardRequests.forEach((request) => {
      if (!matchesReportDate(request.requestedAt || request.createdAt || request.decidedAt || request.deliveredAt)) return;
      const key = String(request.studentId || '');
      if (!storeMap[key]) storeMap[key] = { requests: 0, delivered: 0, spentPoints: 0 };
      storeMap[key].requests += 1;
      if (String(request.status || '') === 'delivered') storeMap[key].delivered += 1;
      storeMap[key].spentPoints += Math.max(0, Number(request.pointsCost || 0));
    });
    return attendanceRows.map((row) => ({
      ...row,
      rewards: behaviorMap[String(row.id)]?.rewards || 0,
      violations: behaviorMap[String(row.id)]?.violations || 0,
      programs: behaviorMap[String(row.id)]?.programs || 0,
      storeRequests: storeMap[String(row.id)]?.requests || 0,
      storeDelivered: storeMap[String(row.id)]?.delivered || 0,
      storeSpentPoints: storeMap[String(row.id)]?.spentPoints || 0,
    })).sort((a, b) => b.points - a.points);
  }, [attendanceRows, behaviorRows, rewardRequests, matchesReportDate]);

  const lessonRows = useMemo(() => {
    return lessonSessions.filter((session) => matchesReportDate(session.dateIso)).flatMap((session) => (session.submissions || []).map((submission) => ({
      sessionId: session.id,
      sessionLabel: buildLessonAttendanceSessionLabel(session),
      dateIso: session.dateIso,
      status: session.status || 'open',
      teacherName: submission.teacherName || '—',
      classKey: submission.classKey || '',
      className: submission.className || '—',
      presentCount: Number(submission.presentCount || 0),
      absentCount: Number(submission.absentCount || 0),
      totalStudents: Number(submission.totalStudents || 0),
      submittedAt: submission.submittedAt || '',
      acknowledged: submission.acknowledged ? 'نعم' : 'لا',
      absentStudents: Array.isArray(submission.absentStudents) ? submission.absentStudents.map((item) => item.name).join('، ') : '',
    }))).filter((row) => {
      if (reportClassKey !== 'all' && String(row.classKey) !== String(reportClassKey)) return false;
      if (reportTeacherName !== 'all' && row.teacherName !== reportTeacherName) return false;
      if (reportStatus !== 'all') {
        if (reportStatus === 'submitted' && !row.submittedAt) return false;
        if (reportStatus === 'missing' && row.submittedAt) return false;
      }
      return true;
    });
  }, [lessonSessions, matchesReportDate, reportClassKey, reportTeacherName, reportStatus]);

  const leavePassRows = useMemo(() => {
    return schoolLeavePasses
      .filter((item) => matchesReportDate(item.createdAt || item.sentAt || item.viewedAt || item.updatedAt))
      .map((item) => ({
        id: item.id,
        studentId: item.studentId,
        studentName: item.studentName || 'طالب',
        studentNumber: item.studentNumber || '—',
        className: item.className || item.companyName || '—',
        teacherName: item.teacherName || '—',
        destinationLabel: getLeavePassDestinationLabel(item.destination),
        reason: item.reason || '—',
        status: String(item.status || 'created'),
        statusLabel: getLeavePassStatusLabel(item.status),
        sendModeLabel: item.sendMode === 'manual' ? 'واتساب يدوي' : item.sendMode === 'system' ? 'من خلال النظام' : (item.sendPreference === 'manual' ? 'واتساب يدوي' : 'من خلال النظام'),
        approvalLabel: item.approvedAt ? `${item.approvedByName || 'الإدارة'} — ${formatDateTime(item.approvedAt)}` : item.completedAt ? `${item.completedByName || 'الإدارة'} — ${formatDateTime(item.completedAt)}` : '—',
        createdAtLabel: item.createdAt ? formatDateTime(item.createdAt) : '—',
        sentAtLabel: item.sentAt ? formatDateTime(item.sentAt) : '—',
        viewedAtLabel: item.viewedAt ? formatDateTime(item.viewedAt) : '—',
        updatedAtLabel: item.updatedAt ? formatDateTime(item.updatedAt) : '—',
        createdByName: item.createdByName || '—',
      }))
      .filter((row) => {
        if (reportClassKey !== 'all' && String(row.className || '') !== String(classroomRows.find((item) => String(getClassroomKeyFromCompanyRow(item)) === String(reportClassKey))?.name || '')) return false;
        if (reportTeacherName !== 'all' && row.teacherName !== reportTeacherName) return false;
        if (reportStudentId !== 'all' && String(row.studentId) !== String(reportStudentId)) return false;
        if (reportStatus !== 'all' && String(row.status) !== String(reportStatus)) return false;
        return true;
      })
      .sort((a, b) => String(b.createdAtLabel || '').localeCompare(String(a.createdAtLabel || '')));
  }, [schoolLeavePasses, matchesReportDate, reportClassKey, reportTeacherName, reportStudentId, reportStatus, classroomRows]);

  const storeItemRows = useMemo(() => rewardItems.filter((item) => {
    if (reportStatus !== 'all') {
      if (reportStatus === 'active' && item.approvalStatus !== 'active') return false;
      if (reportStatus === 'awaiting' && !['awaiting_receipt','received_pending_activation'].includes(item.approvalStatus)) return false;
      if (reportStatus === 'depleted' && item.approvalStatus !== 'depleted') return false;
    }
    return true;
  }).map((item) => ({
    title: item.title,
    donorName: getRewardStoreDonorLabel(item),
    sourceType: item.sourceType,
    quantity: item.quantity,
    remainingQuantity: item.remainingQuantity,
    deliveredQuantity: item.deliveredQuantity,
    pointsCost: item.pointsCost,
    approvalStatus: getRewardStoreStatusLabel(item.approvalStatus),
  })), [rewardItems, reportStatus]);

  const storeRequestRows = useMemo(() => rewardRequests.filter((request) => matchesReportDate(request.requestedAt || request.createdAt || request.decidedAt || request.deliveredAt)).map((request) => ({
    studentName: request.studentName || request.student || '—',
    className: request.className || getStudentGroupingLabel(schoolStudents.find((item) => String(item.id) === String(request.studentId)) || {}, selectedSchool),
    itemTitle: request.itemTitle || '—',
    status: String(request.status || 'pending'),
    statusLabel: String(request.status || 'pending') === 'pending' ? 'بانتظار الاعتماد' : String(request.status || '') === 'approved' ? 'بانتظار التسليم' : String(request.status || '') === 'delivered' ? 'تم التسليم' : 'مرفوض',
    sourceLabel: request.requestedByRole === 'parent' ? 'ولي الأمر' : request.requestedByRole === 'student' ? 'الطالب' : request.requestedByRole === 'delegated_staff' ? 'موظف مفوض' : 'الإدارة',
    pointsCost: Number(request.pointsCost || 0),
    requestedAt: request.requestedAt || request.createdAt || '',
    deliveredAt: request.deliveredAt || '',
  })).filter((row) => {
    if (reportStatus !== 'all' && row.status !== reportStatus) return false;
    return true;
  }), [rewardRequests, matchesReportDate, schoolStudents, selectedSchool, reportStatus]);

  const parentDetailedRows = useMemo(() => parentPortalRows.map((row, index) => ({ id: index + 1, metric: row.metric, value: row.value })), [parentPortalRows]);

  const selectedStudentReport = useMemo(() => {
    if (reportStudentId === 'all') return null;
    const student = schoolStudents.find((item) => String(item.id) === String(reportStudentId));
    if (!student) return null;
    const attendance = attendanceRows.find((row) => String(row.id) === String(reportStudentId));
    const behavior = behaviorRows.find((row) => String(row.studentId) === String(reportStudentId));
    const store = studentComprehensiveRows.find((row) => String(row.id) === String(reportStudentId));
    const studentActions = schoolActions
      .filter((item) => String(item.studentId) === String(reportStudentId) && matchesReportDate(item.isoDate))
      .slice()
      .sort((a, b) => `${b.isoDate || ''} ${b.time || ''}`.localeCompare(`${a.isoDate || ''} ${a.time || ''}`));
    const recentActions = studentActions.slice(0, 6).map((item) => ({
      title: item.actionTitle || 'إجراء',
      typeLabel: item.actionType === 'reward' ? 'مكافأة' : item.actionType === 'violation' ? 'خصم' : 'برنامج',
      actorName: item.actorName || '—',
      dateLabel: `${item.isoDate || ''} ${item.time || ''}`.trim() || '—',
    }));
    const recentStoreRequests = rewardRequests
      .filter((request) => String(request.studentId) === String(reportStudentId) && matchesReportDate(request.requestedAt || request.createdAt || request.decidedAt || request.deliveredAt))
      .slice()
      .sort((a, b) => `${b.requestedAt || b.createdAt || ''}`.localeCompare(`${a.requestedAt || a.createdAt || ''}`))
      .slice(0, 5)
      .map((request) => ({
        itemTitle: request.itemTitle || '—',
        statusLabel: String(request.status || 'pending') === 'pending' ? 'بانتظار الاعتماد' : String(request.status || '') === 'approved' ? 'بانتظار التسليم' : String(request.status || '') === 'delivered' ? 'تم التسليم' : 'مرفوض',
        dateLabel: request.requestedAt || request.createdAt || request.deliveredAt || '—',
      }));
    const recentLessonAbsences = lessonSessions.filter((session) => matchesReportDate(session.dateIso)).flatMap((session) => (session.submissions || []).filter((submission) => (submission.absentStudentIds || []).map(String).includes(String(reportStudentId))).map((submission) => ({ sessionLabel: buildLessonAttendanceSessionLabel(session), className: submission.className || '—', submittedAt: submission.submittedAt || '', }))).slice(0, 5);
    const attendanceRate = Number(attendance?.presentCount || 0) + Number(attendance?.lateCount || 0) + Number(attendance?.lessonAbsenceCount || 0) > 0
      ? Math.max(0, Math.round((Number(attendance?.presentCount || 0) / Math.max(1, Number(attendance?.presentCount || 0) + Number(attendance?.lateCount || 0) + Number(attendance?.lessonAbsenceCount || 0))) * 100))
      : 0;
    return {
      id: student.id,
      name: student.name,
      className: getStudentGroupingLabel(student, selectedSchool),
      points: Number(student.points || attendance?.points || 0),
      presentCount: Number(attendance?.presentCount || 0),
      lateCount: Number(attendance?.lateCount || 0),
      lessonAbsenceCount: Number(attendance?.lessonAbsenceCount || 0),
      rewards: Number(behavior?.rewards || 0),
      violations: Number(behavior?.violations || 0),
      programs: Number(behavior?.programs || 0),
      storeRequests: Number(store?.storeRequests || 0),
      storeDelivered: Number(store?.storeDelivered || 0),
      storeSpentPoints: Number(store?.storeSpentPoints || 0),
      parentName: student.parentName || student.guardianName || '—',
      parentMobile: student.parentMobile || student.guardianMobile || student.mobile || '—',
      attendanceRate,
      recentActions,
      recentStoreRequests,
      recentLessonAbsences,
    };
  }, [reportStudentId, schoolStudents, attendanceRows, behaviorRows, studentComprehensiveRows, selectedSchool, schoolActions, rewardRequests, lessonSessions, matchesReportDate]);

  const selectedTeacherReport = useMemo(() => {
    if (reportTeacherName === 'all') return null;
    const teacher = teacherRows.find((row) => row.teacherName === reportTeacherName);
    if (!teacher) return null;
    const specialMeta = (selectedSchool?.appMeta?.teacherSpecialSummaries || {})[reportTeacherName] || {};
    const teacherActions = schoolActions
      .filter((item) => String(item.actorName || '') === String(reportTeacherName) && matchesReportDate(item.isoDate))
      .slice()
      .sort((a, b) => `${b.isoDate || ''} ${b.time || ''}`.localeCompare(`${a.isoDate || ''} ${a.time || ''}`));
    const recentActions = teacherActions.slice(0, 6).map((item) => ({
      title: item.actionTitle || 'إجراء',
      typeLabel: item.actionType === 'reward' ? 'مكافأة' : item.actionType === 'violation' ? 'خصم' : 'برنامج',
      studentName: item.studentName || schoolStudents.find((row) => String(row.id) === String(item.studentId))?.name || '—',
      className: getStudentGroupingLabel(schoolStudents.find((row) => String(row.id) === String(item.studentId)) || {}, selectedSchool),
      dateLabel: `${item.isoDate || ''} ${item.time || ''}`.trim() || '—',
    }));
    const lessonSubmissions = lessonRows.filter((row) => row.teacherName === reportTeacherName).slice(0, 6).map((row) => ({
      sessionLabel: row.sessionLabel,
      className: row.className,
      absentCount: row.absentCount,
      submittedAt: row.submittedAt || '—',
    }));
    const classNames = Array.from(teacher.classes || []).map((key) => classroomRows.find((row) => String(getClassroomKeyFromCompanyRow(row)) === String(key))?.name || String(key));
    return {
      ...teacher,
      specialPoints: Number(specialMeta.specialPoints || 0),
      specialAchievements: Number(specialMeta.specialAchievements || 0),
      specialItemsCount: Number(specialMeta.specialItemsCount || 0),
      recentActions,
      lessonSubmissions,
      classNames,
    };
  }, [reportTeacherName, teacherRows, selectedSchool, schoolActions, schoolStudents, matchesReportDate, lessonRows, classroomRows]);

  const executiveReportRows = useMemo(() => ([
    { metric: 'إجمالي الطلاب', value: schoolStudents.length },
    { metric: 'إجمالي المعلمين النشطين', value: teacherRows.length },
    { metric: 'الحضور الصباحي', value: attendanceRows.filter((row) => row.status === 'present').length },
    { metric: 'المتأخرون', value: attendanceRows.filter((row) => row.status === 'late').length },
    { metric: 'غياب الحصص', value: attendanceRows.reduce((sum, row) => sum + Number(row.lessonAbsenceCount || 0), 0) },
    { metric: 'إجمالي المكافآت', value: behaviorRows.reduce((sum, row) => sum + Number(row.rewards || 0), 0) },
    { metric: 'إجمالي الخصومات', value: behaviorRows.reduce((sum, row) => sum + Number(row.violations || 0), 0) },
    { metric: 'البرامج المنفذة', value: programRows.reduce((sum, row) => sum + Number(row.count || 0), 0) },
    { metric: 'جلسات تحضير الحصص', value: lessonSessions.length },
    { metric: 'المتجر — الجوائز المعتمدة', value: rewardStoreSummary.activeItems || 0 },
    { metric: 'المتجر — تم التسليم', value: rewardStoreSummary.deliveredRedemptions || 0 },
    { metric: 'بوابة ولي الأمر — أولياء مرتبطون', value: parentPortalSummary?.linkedParents || 0 },
  ]), [schoolStudents.length, teacherRows.length, attendanceRows, behaviorRows, programRows, lessonSessions.length, rewardStoreSummary, parentPortalSummary]);

  const executiveTopStudents = useMemo(() => [...studentComprehensiveRows]
    .sort((a, b) => (Number(b.points || 0) - Number(a.points || 0)) || (Number(b.rewards || 0) - Number(a.rewards || 0)))
    .slice(0, 8)
    .map((row, index) => ({
      rank: index + 1,
      studentName: row.studentName,
      className: row.className,
      points: Number(row.points || 0),
      attendanceRate: Number(row.attendanceRate || 0),
      rewards: Number(row.rewards || 0),
      violations: Number(row.violations || 0),
    })), [studentComprehensiveRows]);

  const executiveTopClasses = useMemo(() => {
    const map = new Map();
    studentComprehensiveRows.forEach((row) => {
      const key = String(row.className || 'بدون فصل');
      if (!map.has(key)) map.set(key, { className: key, students: 0, points: 0, rewards: 0, violations: 0, lateCount: 0, delivered: 0 });
      const entry = map.get(key);
      entry.students += 1;
      entry.points += Number(row.points || 0);
      entry.rewards += Number(row.rewards || 0);
      entry.violations += Number(row.violations || 0);
      entry.lateCount += Number(row.lateCount || 0);
      entry.delivered += Number(row.storeDelivered || 0);
    });
    return Array.from(map.values())
      .map((row, index) => ({ ...row, averagePoints: row.students ? Math.round(row.points / row.students) : 0 }))
      .sort((a, b) => (b.averagePoints - a.averagePoints) || (b.rewards - a.rewards))
      .slice(0, 8)
      .map((row, index) => ({ ...row, rank: index + 1 }));
  }, [studentComprehensiveRows]);

  const executiveTopTeachers = useMemo(() => [...teacherRows]
    .sort((a, b) => ((Number(b.totalActions || 0) + Number(b.submittedLessons || 0) + Number(b.specialPoints || 0)) - (Number(a.totalActions || 0) + Number(a.submittedLessons || 0) + Number(a.specialPoints || 0))))
    .slice(0, 8)
    .map((row, index) => ({
      rank: index + 1,
      teacherName: row.teacherName,
      totalActions: Number(row.totalActions || 0),
      submittedLessons: Number(row.submittedLessons || 0),
      specialPoints: Number(row.specialPoints || 0),
      classesCount: Number(row.classesCount || 0),
    })), [teacherRows]);

  const executiveTopBehaviorItems = useMemo(() => {
    const map = new Map();
    schoolActions.forEach((item) => {
      if (!matchesReportDate(item.isoDate || item.createdAt || item.date || '')) return;
      const title = String(item.actionTitle || item.title || item.action || 'بدون اسم');
      const key = `${item.actionType || 'other'}::${title}`;
      if (!map.has(key)) map.set(key, { title, actionType: item.actionType || 'other', count: 0 });
      map.get(key).count += 1;
    });
    return Array.from(map.values())
      .sort((a, b) => b.count - a.count)
      .slice(0, 8)
      .map((row, index) => ({
        rank: index + 1,
        title: row.title,
        typeLabel: row.actionType === 'reward' ? 'مكافأة' : row.actionType === 'violation' ? 'خصم' : row.actionType === 'program' ? 'برنامج' : 'إجراء',
        count: row.count,
      }));
  }, [schoolActions, matchesReportDate]);


  const executiveTopAbsentStudents = useMemo(() => [...studentComprehensiveRows]
    .sort((a, b) => (Number(b.lessonAbsenceCount || 0) - Number(a.lessonAbsenceCount || 0)) || (Number(b.lateCount || 0) - Number(a.lateCount || 0)))
    .filter((row) => Number(row.lessonAbsenceCount || 0) > 0)
    .slice(0, 8)
    .map((row, index) => ({
      rank: index + 1,
      studentName: row.studentName,
      className: row.className,
      lessonAbsenceCount: Number(row.lessonAbsenceCount || 0),
      lateCount: Number(row.lateCount || 0),
      attendanceRate: Number(row.attendanceRate || 0),
    })), [studentComprehensiveRows]);

  const executiveTopLateStudents = useMemo(() => [...studentComprehensiveRows]
    .sort((a, b) => (Number(b.lateCount || 0) - Number(a.lateCount || 0)) || (Number(b.lessonAbsenceCount || 0) - Number(a.lessonAbsenceCount || 0)))
    .filter((row) => Number(row.lateCount || 0) > 0)
    .slice(0, 8)
    .map((row, index) => ({
      rank: index + 1,
      studentName: row.studentName,
      className: row.className,
      lateCount: Number(row.lateCount || 0),
      lessonAbsenceCount: Number(row.lessonAbsenceCount || 0),
      points: Number(row.points || 0),
    })), [studentComprehensiveRows]);

  const executiveTopRewardTeachers = useMemo(() => [...teacherRows]
    .sort((a, b) => (Number(b.rewards || 0) - Number(a.rewards || 0)) || (Number(b.totalActions || 0) - Number(a.totalActions || 0)))
    .filter((row) => Number(row.rewards || 0) > 0)
    .slice(0, 8)
    .map((row, index) => ({
      rank: index + 1,
      teacherName: row.teacherName,
      rewards: Number(row.rewards || 0),
      totalActions: Number(row.totalActions || 0),
      submittedLessons: Number(row.submittedLessons || 0),
    })), [teacherRows]);

  const executiveTopViolationTeachers = useMemo(() => [...teacherRows]
    .sort((a, b) => (Number(b.violations || 0) - Number(a.violations || 0)) || (Number(b.totalActions || 0) - Number(a.totalActions || 0)))
    .filter((row) => Number(row.violations || 0) > 0)
    .slice(0, 8)
    .map((row, index) => ({
      rank: index + 1,
      teacherName: row.teacherName,
      violations: Number(row.violations || 0),
      totalActions: Number(row.totalActions || 0),
      submittedLessons: Number(row.submittedLessons || 0),
    })), [teacherRows]);

  const executiveTopRewardClasses = useMemo(() => [...executiveTopClasses]
    .sort((a, b) => (Number(b.rewards || 0) - Number(a.rewards || 0)) || (Number(b.averagePoints || 0) - Number(a.averagePoints || 0)))
    .filter((row) => Number(row.rewards || 0) > 0)
    .slice(0, 8)
    .map((row, index) => ({ ...row, rank: index + 1 })), [executiveTopClasses]);

  const executiveTopViolationClasses = useMemo(() => [...executiveTopClasses]
    .sort((a, b) => (Number(b.violations || 0) - Number(a.violations || 0)) || (Number(b.lateCount || 0) - Number(a.lateCount || 0)))
    .filter((row) => Number(row.violations || 0) > 0)
    .slice(0, 8)
    .map((row, index) => ({ ...row, rank: index + 1 })), [executiveTopClasses]);

  const printExecutiveDataset = (title, columns, rows) => {
    const head = columns.map((col) => `<th>${col.label}</th>`).join('');
    const body = rows.map((row) => `<tr>${columns.map((col) => `<td>${String(row[col.key] ?? '').replace(/</g, '&lt;')}</td>`).join('')}</tr>`).join('');
    printHtmlContent(`${title} — ${selectedSchool?.name || 'المدرسة'}`, `<h1>${title}</h1><div class="meta">${selectedSchool?.name || 'المدرسة'} • ${formatDateTime(new Date().toISOString())}</div><table><thead><tr>${head}</tr></thead><tbody>${body || `<tr><td colspan="${columns.length}">لا توجد بيانات متاحة.</td></tr>`}</tbody></table>`);
  };

  const printSelectedStudentReport = () => {
    if (!selectedStudentReport) return;
    const rows = [
      ['الطالب', selectedStudentReport.name],
      ['الفصل', selectedStudentReport.className],
      ['ولي الأمر', selectedStudentReport.parentName],
      ['جوال ولي الأمر', selectedStudentReport.parentMobile],
      ['النقاط', selectedStudentReport.points],
      ['معدل الحضور', `${selectedStudentReport.attendanceRate}%`],
      ['الحضور', selectedStudentReport.presentCount],
      ['التأخر', selectedStudentReport.lateCount],
      ['غياب الحصص', selectedStudentReport.lessonAbsenceCount],
      ['المكافآت', selectedStudentReport.rewards],
      ['الخصومات', selectedStudentReport.violations],
      ['البرامج', selectedStudentReport.programs],
      ['طلبات المتجر', selectedStudentReport.storeRequests],
      ['الجوائز المسلمة', selectedStudentReport.storeDelivered],
      ['النقاط المصروفة', selectedStudentReport.storeSpentPoints],
    ].map(([label, value]) => `<tr><td>${label}</td><td>${String(value ?? '').replace(/</g, '&lt;')}</td></tr>`).join('');
    const actionsRows = (selectedStudentReport.recentActions || []).map((row) => `<tr><td>${String(row.typeLabel || '').replace(/</g,'&lt;')}</td><td>${String(row.title || '').replace(/</g,'&lt;')}</td><td>${String(row.actorName || '').replace(/</g,'&lt;')}</td><td>${String(row.dateLabel || '').replace(/</g,'&lt;')}</td></tr>`).join('');
    const storeRows = (selectedStudentReport.recentStoreRequests || []).map((row) => `<tr><td>${String(row.itemTitle || '').replace(/</g,'&lt;')}</td><td>${String(row.statusLabel || '').replace(/</g,'&lt;')}</td><td>${String(row.dateLabel || '').replace(/</g,'&lt;')}</td></tr>`).join('');
    printHtmlContent(`تقرير الطالب — ${selectedStudentReport.name}`, `<h1>التقرير الشامل للطالب</h1><div class="meta">${selectedSchool?.name || 'المدرسة'} • ${formatDateTime(new Date().toISOString())}</div><div class="stats"><div class="stat"><div class="k">النقاط الحالية</div><div class="v">${selectedStudentReport.points}</div></div><div class="stat"><div class="k">المكافآت</div><div class="v">${selectedStudentReport.rewards}</div></div><div class="stat"><div class="k">الخصومات</div><div class="v">${selectedStudentReport.violations}</div></div><div class="stat"><div class="k">جوائز المتجر</div><div class="v">${selectedStudentReport.storeDelivered}</div></div></div><h1 style="font-size:20px;margin-top:24px">البيانات الأساسية</h1><table><thead><tr><th>المؤشر</th><th>القيمة</th></tr></thead><tbody>${rows}</tbody></table><h1 style="font-size:20px;margin-top:24px">آخر الإجراءات المرتبطة بالطالب</h1><table><thead><tr><th>النوع</th><th>البند</th><th>المنفذ</th><th>التاريخ</th></tr></thead><tbody>${actionsRows || '<tr><td colspan="4">لا توجد إجراءات حديثة.</td></tr>'}</tbody></table><h1 style="font-size:20px;margin-top:24px">آخر طلبات المتجر</h1><table><thead><tr><th>الجائزة</th><th>الحالة</th><th>التاريخ</th></tr></thead><tbody>${storeRows || '<tr><td colspan="3">لا توجد طلبات متجر.</td></tr>'}</tbody></table>`);
  };

  const printSelectedTeacherReport = () => {
    if (!selectedTeacherReport) return;
    const rows = [
      ['المعلم', selectedTeacherReport.teacherName],
      ['المكافآت', selectedTeacherReport.rewards],
      ['الخصومات', selectedTeacherReport.violations],
      ['البرامج', selectedTeacherReport.programs],
      ['تحضير الحصص', selectedTeacherReport.submittedLessons],
      ['فتح روابط الحصص', selectedTeacherReport.openedLessons],
      ['عدد الفصول', selectedTeacherReport.classesCount],
      ['الرصيد التخصصي', selectedTeacherReport.specialPoints],
      ['الإنجازات التخصصية', selectedTeacherReport.specialAchievements],
      ['البنود التخصصية', selectedTeacherReport.specialItemsCount],
      ['إجمالي الإجراءات', selectedTeacherReport.totalActions],
    ].map(([label, value]) => `<tr><td>${label}</td><td>${String(value ?? '').replace(/</g, '&lt;')}</td></tr>`).join('');
    const classRows = (selectedTeacherReport.classNames || []).map((name) => `<tr><td>${String(name || '').replace(/</g,'&lt;')}</td></tr>`).join('');
    const actionRows = (selectedTeacherReport.recentActions || []).map((row) => `<tr><td>${String(row.typeLabel || '').replace(/</g,'&lt;')}</td><td>${String(row.title || '').replace(/</g,'&lt;')}</td><td>${String(row.studentName || '').replace(/</g,'&lt;')}</td><td>${String(row.className || '').replace(/</g,'&lt;')}</td><td>${String(row.dateLabel || '').replace(/</g,'&lt;')}</td></tr>`).join('');
    const lessonRowsHtml = (selectedTeacherReport.lessonSubmissions || []).map((row) => `<tr><td>${String(row.sessionLabel || '').replace(/</g,'&lt;')}</td><td>${String(row.className || '').replace(/</g,'&lt;')}</td><td>${String(row.absentCount || 0)}</td><td>${String(row.submittedAt || '').replace(/</g,'&lt;')}</td></tr>`).join('');
    printHtmlContent(`تقرير المعلم — ${selectedTeacherReport.teacherName}`, `<h1>التقرير الشامل للمعلم</h1><div class="meta">${selectedSchool?.name || 'المدرسة'} • ${formatDateTime(new Date().toISOString())}</div><div class="stats"><div class="stat"><div class="k">الرصيد التخصصي</div><div class="v">${selectedTeacherReport.specialPoints}</div></div><div class="stat"><div class="k">الإجراءات</div><div class="v">${selectedTeacherReport.totalActions}</div></div><div class="stat"><div class="k">تحضير الحصص</div><div class="v">${selectedTeacherReport.submittedLessons}</div></div><div class="stat"><div class="k">الفصول</div><div class="v">${selectedTeacherReport.classesCount}</div></div></div><h1 style="font-size:20px;margin-top:24px">البيانات الأساسية</h1><table><thead><tr><th>المؤشر</th><th>القيمة</th></tr></thead><tbody>${rows}</tbody></table><h1 style="font-size:20px;margin-top:24px">الفصول المرتبطة</h1><table><thead><tr><th>الفصل</th></tr></thead><tbody>${classRows || '<tr><td>لا توجد فصول مرتبطة.</td></tr>'}</tbody></table><h1 style="font-size:20px;margin-top:24px">آخر الإجراءات المنفذة</h1><table><thead><tr><th>النوع</th><th>البند</th><th>الطالب</th><th>الفصل</th><th>التاريخ</th></tr></thead><tbody>${actionRows || '<tr><td colspan="5">لا توجد إجراءات حديثة.</td></tr>'}</tbody></table><h1 style="font-size:20px;margin-top:24px">آخر جلسات التحضير</h1><table><thead><tr><th>الجلسة</th><th>الفصل</th><th>الغائبون</th><th>وقت الاعتماد</th></tr></thead><tbody>${lessonRowsHtml || '<tr><td colspan="4">لا توجد جلسات حديثة.</td></tr>'}</tbody></table>`);
  };

  const reportTabs = [
    { key: 'attendance', label: 'الحضور والتأخر', description: 'حضور الصباح، التأخر، وغياب الحصص.' },
    { key: 'behavior', label: 'السلوكيات', description: 'المكافآت، الخصومات، والسلوكيات الإيجابية والسلبية.' },
    { key: 'programs', label: 'البرامج', description: 'البرامج المنفذة وعدد الطلاب والمعلمين المرتبطين بها.' },
    { key: 'teachers', label: 'المعلمون', description: 'أداء المعلمين، التحضير الحصصي، والنشاط العام.' },
    { key: 'students', label: 'الطلاب', description: 'نقاط الطلاب، السلوك، الحضور، والاستفادة من المتجر.' },
    { key: 'parents', label: 'أولياء الأمور', description: 'التفعيل، التفاعل، وارتباط الحسابات والتنبيهات.' },
    { key: 'store', label: 'المتجر', description: 'الجوائز، الطلبات، المخزون، والمتبرعون.' },
    { key: 'lessons', label: 'تحضير الحصص', description: 'الجلسات، اعتماد المعلمين، والغياب الحصصي.' },
    { key: 'leavePass', label: 'الاستئذان', description: 'طلبات الاستئذان، حالاتها، وجهتها، ومسار اطلاع المعلم.' },
    { key: 'gateSync', label: 'مزامنة البوابات', description: 'السجل المركزي لمزامنة عمليات البوابة بين الأجهزة والخادم.' },
    { key: 'executive', label: 'التقرير التنفيذي', description: 'ملخص المدرسة التنفيذي لأهم المؤشرات.' },
  ];
  const reportQuickCards = reportTabs.map((tab) => ({
    ...tab,
    count:
      tab.key === 'attendance' ? attendanceRows.length :
      tab.key === 'behavior' ? behaviorRows.length :
      tab.key === 'programs' ? programRows.length :
      tab.key === 'teachers' ? teacherRows.length :
      tab.key === 'students' ? studentComprehensiveRows.length :
      tab.key === 'parents' ? parentDetailedRows.length :
      tab.key === 'store' ? (storeRequestRows.length + storeItemRows.length) :
      tab.key === 'leavePass' ? leavePassRows.length :
      tab.key === 'gateSync' ? schoolGateSyncEvents.length :
      tab.key === 'executive' ? executiveReportRows.length :
      lessonRows.length,
  }));

  const getPrintCellHtml = (reportKey, columnKey, rawValue) => {
    const value = rawValue ?? '';
    const safe = escapePrintHtml(value);
    if (columnKey === 'status') {
      const statusText = String(value || '—');
      if (statusText.includes('حاضر') || statusText.includes('تمت')) return `<span class="pill pill-green">${safe}</span>`;
      if (statusText.includes('متأخر') || statusText.includes('بانتظار')) return `<span class="pill pill-amber">${safe}</span>`;
      if (statusText.includes('مكرر')) return `<span class="pill pill-blue">${safe}</span>`;
      if (statusText.includes('غائب') || statusText.includes('غير ممسوح') || statusText.includes('مرفوض') || statusText.includes('خطأ')) return `<span class="pill pill-rose">${safe}</span>`;
      if (statusText.includes('تفريغ')) return `<span class="pill pill-slate">${safe}</span>`;
      return `<span class="pill pill-slate">${safe}</span>`;
    }
    if (columnKey === 'acknowledged') {
      return String(value).includes('نعم') ? `<span class="pill pill-green">${safe}</span>` : `<span class="pill pill-rose">${safe}</span>`;
    }
    if (columnKey === 'statusLabel') {
      const text = String(value || '—');
      if (text.includes('تسليم') || text.includes('تم')) return `<span class="pill pill-green">${safe}</span>`;
      if (text.includes('رفض')) return `<span class="pill pill-rose">${safe}</span>`;
      if (text.includes('انتظار')) return `<span class="pill pill-amber">${safe}</span>`;
      return `<span class="pill pill-blue">${safe}</span>`;
    }
    if (columnKey === 'sourceLabel') {
      const text = String(value || '—');
      if (text.includes('ولي')) return `<span class="pill pill-violet">${safe}</span>`;
      if (text.includes('متبر')) return `<span class="pill pill-green">${safe}</span>`;
      if (text.includes('مدرس')) return `<span class="pill pill-blue">${safe}</span>`;
      return safe;
    }
    return safe;
  };

  const getPrintRowClass = (reportKey, row) => {
    if (reportKey === 'attendance') {
      if (row.status === 'absent') return 'row-negative';
      if (row.status === 'late') return 'row-warning';
      if (row.status === 'present') return 'row-positive';
    }
    if (reportKey === 'behavior') {
      if (Number(row.violations || 0) > 0 && Number(row.rewards || 0) <= 0) return 'row-negative';
      if (Number(row.rewards || 0) > 0 && Number(row.violations || 0) <= 0) return 'row-positive';
      if (Number(row.programs || 0) > 0) return 'row-info';
    }
    if (reportKey === 'students') {
      if (Number(row.violations || 0) > Number(row.rewards || 0)) return 'row-negative';
      if (Number(row.rewards || 0) > Number(row.violations || 0)) return 'row-positive';
      if (Number(row.points || 0) >= 100) return 'row-highlight';
    }
    if (reportKey === 'teachers') {
      if (Number(row.totalActions || 0) >= 10 || Number(row.submittedLessons || 0) >= 5) return 'row-info';
    }
    if (reportKey === 'store') {
      const status = String(row.statusLabel || '');
      if (status.includes('تم')) return 'row-positive';
      if (status.includes('رفض')) return 'row-negative';
      if (status.includes('انتظار')) return 'row-warning';
      if (status.includes('معتمد')) return 'row-info';
    }
    if (reportKey === 'lessons') {
      if (String(row.acknowledged || '').includes('نعم')) return 'row-positive';
      return 'row-warning';
    }
    if (reportKey === 'leavePass') {
      const status = String(row.status || row.statusLabel || '');
      if (status.includes('completed') || status.includes('تم التنفيذ')) return 'row-positive';
      if (status.includes('cancelled') || status.includes('ملغي')) return 'row-negative';
      if (status.includes('viewed') || status.includes('اطلع')) return 'row-info';
      return 'row-warning';
    }
    return '';
  };

  const currentReportMeta = useMemo(() => {
    if (reportTab === 'attendance') return { title: 'تقرير الحضور والتأخر', rows: attendanceRows, columns: [
      { key: 'studentName', label: 'الطالب' },
      { key: 'studentNumber', label: 'الرقم' },
      { key: 'className', label: 'الفصل' },
      { key: 'presentCount', label: 'الحضور' },
      { key: 'lateCount', label: 'التأخر' },
      { key: 'lessonAbsenceCount', label: 'غياب الحصص' },
      { key: 'status', label: 'الحالة' },
      { key: 'lastScanDate', label: 'آخر تاريخ' },
    ] };
    if (reportTab === 'behavior') return { title: 'تقرير السلوكيات والمكافآت والخصومات', rows: behaviorRows, columns: [
      { key: 'studentName', label: 'الطالب' },
      { key: 'className', label: 'الفصل' },
      { key: 'rewards', label: 'المكافآت' },
      { key: 'violations', label: 'الخصومات' },
      { key: 'programs', label: 'البرامج' },
      { key: 'lastActionAt', label: 'آخر إجراء' },
    ] };
    if (reportTab === 'programs') return { title: 'تقرير البرامج', rows: programRows, columns: [
      { key: 'programTitle', label: 'البرنامج' },
      { key: 'count', label: 'مرات التنفيذ' },
      { key: 'studentsCount', label: 'الطلاب' },
      { key: 'teachersCount', label: 'المعلمون' },
      { key: 'classesCount', label: 'الفصول' },
      { key: 'lastAt', label: 'آخر تنفيذ' },
    ] };
    if (reportTab === 'teachers') return { title: 'تقرير المعلمين', rows: teacherRows, columns: [
      { key: 'teacherName', label: 'المعلم' },
      { key: 'rewards', label: 'المكافآت' },
      { key: 'violations', label: 'الخصومات' },
      { key: 'programs', label: 'البرامج' },
      { key: 'submittedLessons', label: 'تحضير الحصص' },
      { key: 'openedLessons', label: 'فتح الرابط' },
      { key: 'classesCount', label: 'الفصول' },
    ] };
    if (reportTab === 'students') return { title: 'التقرير الشامل للطلاب', rows: studentComprehensiveRows, columns: [
      { key: 'studentName', label: 'الطالب' },
      { key: 'className', label: 'الفصل' },
      { key: 'points', label: 'النقاط' },
      { key: 'lateCount', label: 'التأخر' },
      { key: 'rewards', label: 'المكافآت' },
      { key: 'violations', label: 'الخصومات' },
      { key: 'programs', label: 'البرامج' },
      { key: 'storeDelivered', label: 'جوائز مسلمة' },
    ] };
    if (reportTab === 'parents') return { title: 'تقرير أولياء الأمور', rows: parentDetailedRows, columns: [
      { key: 'metric', label: 'المؤشر' },
      { key: 'value', label: 'القيمة' },
    ] };
    if (reportTab === 'store') return { title: 'تقرير متجر النقاط — الطلبات', rows: storeRequestRows, columns: [
      { key: 'studentName', label: 'الطالب' },
      { key: 'className', label: 'الفصل' },
      { key: 'itemTitle', label: 'الجائزة' },
      { key: 'statusLabel', label: 'الحالة' },
      { key: 'sourceLabel', label: 'جهة الطلب' },
      { key: 'pointsCost', label: 'النقاط' },
      { key: 'requestedAt', label: 'تاريخ الطلب' },
    ] };
    if (reportTab === 'leavePass') return { title: 'تقرير الاستئذان', rows: leavePassRows, columns: [
      { key: 'studentName', label: 'الطالب' },
      { key: 'className', label: 'الفصل' },
      { key: 'teacherName', label: 'المعلم' },
      { key: 'destinationLabel', label: 'الوجهة' },
      { key: 'reason', label: 'السبب' },
      { key: 'statusLabel', label: 'الحالة' },
      { key: 'sendModeLabel', label: 'الإرسال' },
      { key: 'createdAtLabel', label: 'وقت الإنشاء' },
    ] };
    if (reportTab === 'gateSync') return { title: 'التقرير المركزي لمزامنة البوابات', rows: schoolGateSyncEvents.filter((row) => matchesReportDate((row.syncedAt || row.createdAt || row.capturedAt || '').slice(0, 10))), columns: [
      { key: 'gateName', label: 'البوابة' },
      { key: 'status', label: 'الحالة' },
      { key: 'studentName', label: 'الطالب' },
      { key: 'barcode', label: 'الباركود' },
      { key: 'method', label: 'الطريقة' },
      { key: 'capturedAtLocal', label: 'وقت الالتقاط المحلي' },
      { key: 'syncedAt', label: 'وقت المزامنة' },
      { key: 'operationId', label: 'معرف العملية' },
      { key: 'message', label: 'الرسالة التشغيلية' },
    ] };
    if (reportTab === 'executive') return { title: 'التقرير التنفيذي للمدرسة', rows: executiveReportRows, columns: [
      { key: 'metric', label: 'المؤشر' },
      { key: 'value', label: 'القيمة' },
    ] };
    return { title: 'تقرير تحضير الحصص', rows: lessonRows, columns: [
      { key: 'sessionLabel', label: 'الجلسة' },
      { key: 'teacherName', label: 'المعلم' },
      { key: 'className', label: 'الفصل' },
      { key: 'presentCount', label: 'حاضر' },
      { key: 'absentCount', label: 'غائب' },
      { key: 'acknowledged', label: 'الإقرار' },
      { key: 'submittedAt', label: 'وقت الاعتماد' },
    ] };
  }, [reportTab, attendanceRows, behaviorRows, programRows, teacherRows, studentComprehensiveRows, parentDetailedRows, storeRequestRows, executiveReportRows, lessonRows, leavePassRows, schoolGateSyncEvents, matchesReportDate]);
  const currentPrintSummaryCards = useMemo(() => {
    if (reportTab === 'attendance') return [
      { label: 'إجمالي الطلاب', value: attendanceRows.length, tone: 'tone-blue' },
      { label: 'حاضرون', value: attendanceRows.filter((row) => row.status === 'present').length, tone: 'tone-green' },
      { label: 'متأخرون', value: attendanceRows.filter((row) => row.status === 'late').length, tone: 'tone-amber' },
      { label: 'غير ممسوحين / غياب', value: attendanceRows.filter((row) => row.status === 'absent').length, tone: 'tone-rose' },
    ];
    if (reportTab === 'behavior') return [
      { label: 'السجلات', value: behaviorRows.length, tone: 'tone-blue' },
      { label: 'إيجابي', value: behaviorRows.filter((row) => Number(row.rewards || 0) > 0).length, tone: 'tone-green' },
      { label: 'سلبي', value: behaviorRows.filter((row) => Number(row.violations || 0) > 0).length, tone: 'tone-rose' },
      { label: 'برامج', value: behaviorRows.reduce((sum, row) => sum + Number(row.programs || 0), 0), tone: 'tone-violet' },
    ];
    if (reportTab === 'programs') return [
      { label: 'البرامج', value: programRows.length, tone: 'tone-blue' },
      { label: 'إجمالي التنفيذ', value: programRows.reduce((sum, row) => sum + Number(row.count || 0), 0), tone: 'tone-green' },
      { label: 'الطلاب المستفيدون', value: programRows.reduce((sum, row) => sum + Number(row.studentsCount || 0), 0), tone: 'tone-violet' },
      { label: 'المعلمون المشاركون', value: programRows.reduce((sum, row) => sum + Number(row.teachersCount || 0), 0), tone: 'tone-amber' },
    ];
    if (reportTab === 'teachers') return [
      { label: 'المعلمون', value: teacherRows.length, tone: 'tone-blue' },
      { label: 'المكافآت', value: teacherRows.reduce((sum, row) => sum + Number(row.rewards || 0), 0), tone: 'tone-green' },
      { label: 'الخصومات', value: teacherRows.reduce((sum, row) => sum + Number(row.violations || 0), 0), tone: 'tone-rose' },
      { label: 'تحضير الحصص', value: teacherRows.reduce((sum, row) => sum + Number(row.submittedLessons || 0), 0), tone: 'tone-amber' },
    ];
    if (reportTab === 'students') return [
      { label: 'الطلاب', value: studentComprehensiveRows.length, tone: 'tone-blue' },
      { label: 'مجموع النقاط', value: studentComprehensiveRows.reduce((sum, row) => sum + Number(row.points || 0), 0), tone: 'tone-violet' },
      { label: 'المكافآت', value: studentComprehensiveRows.reduce((sum, row) => sum + Number(row.rewards || 0), 0), tone: 'tone-green' },
      { label: 'الخصومات', value: studentComprehensiveRows.reduce((sum, row) => sum + Number(row.violations || 0), 0), tone: 'tone-rose' },
    ];
    if (reportTab === 'store') return [
      { label: 'طلبات المتجر', value: storeRequestRows.length, tone: 'tone-blue' },
      { label: 'بانتظار الاعتماد', value: storeRequestRows.filter((row) => String(row.statusLabel || '').includes('انتظار')).length, tone: 'tone-amber' },
      { label: 'تم التسليم', value: storeRequestRows.filter((row) => String(row.statusLabel || '').includes('تم')).length, tone: 'tone-green' },
      { label: 'الجوائز النشطة', value: storeItemRows.filter((row) => String(row.statusLabel || '').includes('معتمدة')).length, tone: 'tone-violet' },
    ];
    if (reportTab === 'lessons') return [
      { label: 'جلسات التحضير', value: lessonRows.length, tone: 'tone-blue' },
      { label: 'معتمدة', value: lessonRows.filter((row) => String(row.acknowledged || '').includes('نعم')).length, tone: 'tone-green' },
      { label: 'غير معتمدة', value: lessonRows.filter((row) => !String(row.acknowledged || '').includes('نعم')).length, tone: 'tone-amber' },
      { label: 'إجمالي الغياب الحصصي', value: lessonRows.reduce((sum, row) => sum + Number(row.absentCount || 0), 0), tone: 'tone-rose' },
    ];
    if (reportTab === 'gateSync') return [
      { label: 'إجمالي سجلات المزامنة', value: schoolGateSyncEvents.length, tone: 'tone-blue' },
      { label: 'تمت', value: schoolGateSyncEvents.filter((row) => row.status === 'synced').length, tone: 'tone-green' },
      { label: 'مكرر', value: schoolGateSyncEvents.filter((row) => row.status === 'duplicate').length, tone: 'tone-violet' },
      { label: 'بانتظار / مرفوض', value: `${schoolGateSyncEvents.filter((row) => row.status === 'pending').length} / ${schoolGateSyncEvents.filter((row) => ['rejected','error'].includes(row.status)).length}`, tone: 'tone-amber' },
    ];
    if (reportTab === 'leavePass') return [
      { label: 'طلبات الاستئذان', value: leavePassRows.length, tone: 'tone-blue' },
      { label: 'بانتظار التنفيذ', value: leavePassRows.filter((row) => ['created','sent-system','sent-manual'].includes(String(row.status || ''))).length, tone: 'tone-amber' },
      { label: 'اطلع المعلم', value: leavePassRows.filter((row) => String(row.status || '') === 'viewed').length, tone: 'tone-sky' },
      { label: 'اعتمادات الجهة', value: leavePassRows.filter((row) => ['approved-agent','approved-counselor','released-guardian'].includes(String(row.status || ''))).length, tone: 'tone-blue' },
      { label: 'تم التنفيذ', value: leavePassRows.filter((row) => String(row.status || '') === 'completed').length, tone: 'tone-green' },
    ];
    return [
      { label: 'السجلات', value: currentReportMeta?.rows?.length || 0, tone: 'tone-blue' },
    ];
  }, [reportTab, attendanceRows, behaviorRows, programRows, teacherRows, studentComprehensiveRows, storeRequestRows, storeItemRows, lessonRows, leavePassRows, schoolGateSyncEvents, currentReportMeta]);

  const currentPrintLegend = useMemo(() => {
    if (reportTab === 'attendance') return [
      { label: 'أخضر = حاضر', tone: 'pill-green' },
      { label: 'أصفر = متأخر', tone: 'pill-amber' },
      { label: 'وردي = غياب / غير ممسوح', tone: 'pill-rose' },
    ];
    if (reportTab === 'behavior' || reportTab === 'students') return [
      { label: 'أخضر = جانب إيجابي', tone: 'pill-green' },
      { label: 'وردي = جانب سلبي', tone: 'pill-rose' },
      { label: 'بنفسجي = نقاط أو تميّز', tone: 'pill-violet' },
    ];
    if (reportTab === 'store') return [
      { label: 'أصفر = بانتظار', tone: 'pill-amber' },
      { label: 'أخضر = تم', tone: 'pill-green' },
      { label: 'وردي = مرفوض', tone: 'pill-rose' },
    ];
    if (reportTab === 'gateSync') return [
      { label: 'أخضر = تمت', tone: 'pill-green' },
      { label: 'أزرق = مكرر', tone: 'pill-blue' },
      { label: 'أصفر = بانتظار', tone: 'pill-amber' },
      { label: 'وردي = مرفوض / خطأ', tone: 'pill-rose' },
    ];
    if (reportTab === 'leavePass') return [
      { label: 'أصفر = جديد أو مرسل', tone: 'pill-amber' },
      { label: 'أزرق = اطلع المعلم', tone: 'pill-blue' },
      { label: 'أخضر = تم التنفيذ', tone: 'pill-green' },
      { label: 'وردي = ملغي', tone: 'pill-rose' },
    ];
    return [];
  }, [reportTab]);


  const exportCurrentReport = (format = 'xlsx') => {
    const rows = currentReportMeta.rows || [];
    if (!rows.length) { window.alert('لا توجد بيانات متاحة للتصدير بعد تطبيق الفلاتر الحالية.'); return; }
    const filenameBase = `${settings.exportPrefix || 'school'}-${selectedSchool?.code || 'school'}-${reportTab}`;
    if (format === 'csv') {
      downloadFile(`${filenameBase}.csv`, buildCsv(rows, currentReportMeta.columns), 'text/csv;charset=utf-8;');
      return;
    }
    exportRowsToWorkbook(`${filenameBase}.xlsx`, 'Report', rows, currentReportMeta.columns);
  };

  const printCurrentReport = () => {
    const rows = currentReportMeta.rows || [];
    const head = (currentReportMeta.columns || []).map((col) => `<th>${escapePrintHtml(col.label)}</th>`).join('');
    const body = rows.map((row) => `<tr class="${getPrintRowClass(reportTab, row)}">${(currentReportMeta.columns || []).map((col) => `<td>${getPrintCellHtml(reportTab, col.key, row[col.key])}</td>`).join('')}</tr>`).join('');
    const accentMap = {
      attendance: '#0369a1',
      behavior: '#7c3aed',
      programs: '#0f766e',
      teachers: '#1d4ed8',
      students: '#7c3aed',
      parents: '#334155',
      store: '#b45309',
      lessons: '#0f766e',
      leavePass: '#7c3aed',
      gateSync: '#0369a1',
      executive: '#0f766e',
    };
    printHtmlContent(`${currentReportMeta.title} — ${selectedSchool?.name || 'المدرسة'}`, `<table><thead><tr>${head}</tr></thead><tbody>${body || `<tr><td colspan="${(currentReportMeta.columns || []).length || 1}">لا توجد بيانات متاحة.</td></tr>`}</tbody></table>`, {
      subtitle: `${selectedSchool?.name || 'المدرسة'} • ${formatDateTime(new Date().toISOString())}`,
      accent: accentMap[reportTab] || '#0f172a',
      summaryCards: currentPrintSummaryCards,
      legend: currentPrintLegend,
    });
  };

  const reportChartData = useMemo(() => {
    if (reportTab === 'attendance') return [
      { name: 'الحاضرون', value: attendanceRows.filter((row) => row.status === 'present').length },
      { name: 'المتأخرون', value: attendanceRows.filter((row) => row.status === 'late').length },
      { name: 'غير الممسوحين', value: attendanceRows.filter((row) => row.status === 'absent').length },
    ];
    if (reportTab === 'gateSync') return [
      { name: 'تمت', value: schoolGateSyncEvents.filter((row) => row.status === 'synced').length },
      { name: 'مكرر', value: schoolGateSyncEvents.filter((row) => row.status === 'duplicate').length },
      { name: 'بانتظار', value: schoolGateSyncEvents.filter((row) => row.status === 'pending').length },
      { name: 'مرفوض / خطأ', value: schoolGateSyncEvents.filter((row) => ['rejected','error'].includes(row.status)).length },
    ];
    if (reportTab === 'behavior') return [
      { name: 'مكافآت', value: behaviorRows.reduce((sum, row) => sum + row.rewards, 0) },
      { name: 'خصومات', value: behaviorRows.reduce((sum, row) => sum + row.violations, 0) },
      { name: 'برامج', value: behaviorRows.reduce((sum, row) => sum + row.programs, 0) },
    ];
    if (reportTab === 'programs') return programRows.slice(0, 8).map((row) => ({ name: row.programTitle, value: row.count }));
    if (reportTab === 'teachers') return teacherRows.slice(0, 8).map((row) => ({ name: row.teacherName, value: row.totalActions + row.submittedLessons }));
    if (reportTab === 'students') return studentComprehensiveRows.slice(0, 8).map((row) => ({ name: row.studentName, value: row.points }));
    if (reportTab === 'store') return [
      { name: 'بانتظار الاعتماد', value: storeRequestRows.filter((row) => row.status === 'pending').length },
      { name: 'بانتظار التسليم', value: storeRequestRows.filter((row) => row.status === 'approved').length },
      { name: 'تم التسليم', value: storeRequestRows.filter((row) => row.status === 'delivered').length },
      { name: 'مرفوض', value: storeRequestRows.filter((row) => row.status === 'rejected').length },
    ];
    if (reportTab === 'lessons') return lessonRows.slice(0, 8).map((row) => ({ name: row.className, value: row.absentCount }));
    if (reportTab === 'leavePass') return [
      { name: 'جديد / مرسل', value: leavePassRows.filter((row) => ['created','sent-system','sent-manual'].includes(String(row.status || ''))).length },
      { name: 'اطلع المعلم', value: leavePassRows.filter((row) => String(row.status || '') === 'viewed').length },
      { name: 'اعتمادات الجهة', value: leavePassRows.filter((row) => ['approved-agent','approved-counselor','released-guardian'].includes(String(row.status || ''))).length },
      { name: 'تم التنفيذ', value: leavePassRows.filter((row) => String(row.status || '') === 'completed').length },
      { name: 'ملغي', value: leavePassRows.filter((row) => String(row.status || '') === 'cancelled').length },
    ];
    return parentDetailedRows.map((row) => ({ name: row.metric, value: Number(String(row.value).replace(/[^0-9.-]/g, '')) || 0 })).slice(0, 8);
  }, [reportTab, attendanceRows, behaviorRows, programRows, teacherRows, studentComprehensiveRows, storeRequestRows, lessonRows, leavePassRows, schoolGateSyncEvents, parentDetailedRows]);

  return (
    <div className="space-y-6">
      <SectionCard title="التقارير التنفيذية" icon={LineChart} action={<Badge tone="blue">{selectedSchool?.name || "—"}</Badge>}>
        {Array.isArray(selectedSchool?.structure?.classrooms) && selectedSchool.structure.classrooms.length ? <div className="mb-4 rounded-2xl border border-dashed border-violet-200 bg-violet-50 p-4 text-sm font-bold text-violet-800">التقارير هنا تعتمد الآن على <span className="font-black">الهيكل المدرسي</span> كمصدر افتراضي للطلاب والفصول.</div> : null}
        <div className="grid grid-cols-2 gap-4 xl:grid-cols-6">
          <SummaryBox label="طلاب المدرسة" value={summary.totalStudents} />
          <SummaryBox label="الحاضرون اليوم" value={summary.presentToday} color="text-emerald-700" />
          <SummaryBox label="نسبة الحضور" value={`${summary.attendanceRate}%`} color="text-sky-700" />
          <SummaryBox label="المكافآت اليوم" value={summary.rewardsToday} color="text-emerald-700" />
          <SummaryBox label="الخصومات اليوم" value={summary.violationsToday} color="text-rose-700" />
          <SummaryBox label="البرامج اليوم" value={summary.programsToday} color="text-violet-700" />
        </div>
        <div className="mt-6 grid grid-cols-1 gap-6 xl:grid-cols-3">
          <div className="xl:col-span-2 rounded-3xl bg-slate-50 p-5 ring-1 ring-slate-200">
            <div className="mb-4 font-bold text-slate-800">مؤشرات الحضور والالتزام اليومي</div>
            <div className="grid grid-cols-2 gap-3 md:grid-cols-5">
              <SummaryBox label="الإجمالي" value={schoolLogs.length} />
              <SummaryBox label="مبكر" value={summary.earlyToday} color="text-emerald-700" />
              <SummaryBox label="في الوقت" value={summary.ontimeToday || 0} color="text-sky-700" />
              <SummaryBox label="متأخر" value={summary.lateToday} color="text-amber-700" />
              <SummaryBox label="برامج" value={summary.programsToday} color="text-violet-700" />
            </div>
            <div className="mt-6 h-80 rounded-3xl bg-white p-4 ring-1 ring-slate-200">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={executiveReport?.attendanceTrend || summarizeSchoolLiveState(selectedSchool, scanLog, actionLog).attendanceTrend}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="day" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="attendance" fill="#0ea5e9" radius={[8,8,0,0]} />
                  <Bar dataKey="early" fill="#10b981" radius={[8,8,0,0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
          <div className="rounded-3xl bg-white p-5 ring-1 ring-slate-200">
            <div className="mb-3 font-bold text-slate-800">تصدير سريع</div>
            <div className="space-y-3">
              <button onClick={onExportAttendance} className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-slate-100 px-4 py-3 font-bold text-slate-700"><Download className="h-4 w-4" /> تقرير الحضور CSV</button>
              <button onClick={onExportStudents} className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-slate-100 px-4 py-3 font-bold text-slate-700"><Download className="h-4 w-4" /> تقرير الطلاب CSV</button>
              <button onClick={onExportSchools} className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-slate-100 px-4 py-3 font-bold text-slate-700"><Download className="h-4 w-4" /> تقرير المدارس CSV</button>
              <button onClick={() => exportExecutiveParentPortal('xlsx')} className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-emerald-50 px-4 py-3 font-bold text-emerald-700 ring-1 ring-emerald-100"><Download className="h-4 w-4" /> بوابة ولي الأمر Excel</button>
              <button onClick={printExecutiveSchoolReport} className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-white px-4 py-3 font-bold text-slate-700 ring-1 ring-slate-200"><Printer className="h-4 w-4" /> طباعة التقرير التنفيذي</button>
              <button onClick={onExportBackup} className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-sky-700 px-4 py-3 font-bold text-white"><ClipboardCheck className="h-4 w-4" /> نسخ احتياطي JSON</button>
            </div>
          </div>
        </div>
        <div className="mt-6 grid grid-cols-1 gap-6 xl:grid-cols-3">
          <div className="rounded-3xl bg-slate-50 p-5 ring-1 ring-slate-200">
            <div className="mb-4 font-bold text-slate-800">أعلى الطلاب</div>
            <div className="space-y-3">{topStudents.map((student) => <div key={student.id} className="rounded-2xl bg-white p-4 ring-1 ring-slate-200"><div className="flex items-center justify-between gap-3"><div><div className="font-black">{student.rank}. {student.name}</div><div className="text-sm text-slate-500">{student.companyName}</div></div><Badge tone="green">{student.points} نقطة</Badge></div></div>)}</div>
          </div>
          <div className="rounded-3xl bg-slate-50 p-5 ring-1 ring-slate-200">
            <div className="mb-4 font-bold text-slate-800">ترتيب الشركات</div>
            <div className="space-y-3">{topCompanies.map((company) => <div key={company.id} className="rounded-2xl bg-white p-4 ring-1 ring-slate-200"><div className="flex items-center justify-between gap-3"><div><div className="font-black">{company.rank}. {company.name}</div><div className="text-sm text-slate-500">{company.className}</div></div><Badge tone="blue">{company.points} نقطة</Badge></div></div>)}</div>
          </div>
          <div className="rounded-3xl bg-slate-50 p-5 ring-1 ring-slate-200">
            <div className="mb-4 font-bold text-slate-800">نشاط المعلمين والمشرفين</div>
            <div className="space-y-3">{teacherActivity.length ? teacherActivity.map((item, index) => <div key={`${item.actorName}-${index}`} className="rounded-2xl bg-white p-4 ring-1 ring-slate-200"><div className="font-black">{item.actorName}</div><div className="mt-1 text-sm text-slate-500">{getRoleLabel(item.actorRole)}</div><div className="mt-3 grid grid-cols-4 gap-2 text-center text-xs"><div className="rounded-xl bg-slate-50 p-2"><div className="font-black text-slate-800">{item.count}</div><div className="text-slate-500">إجمالي</div></div><div className="rounded-xl bg-emerald-50 p-2"><div className="font-black text-emerald-700">{item.rewardCount}</div><div className="text-emerald-700">مكافآت</div></div><div className="rounded-xl bg-rose-50 p-2"><div className="font-black text-rose-700">{item.violationCount}</div><div className="text-rose-700">خصومات</div></div><div className="rounded-xl bg-violet-50 p-2"><div className="font-black text-violet-700">{item.programCount}</div><div className="text-violet-700">برامج</div></div></div></div>) : <div className="rounded-2xl bg-white p-4 ring-1 ring-slate-200 text-sm text-slate-500">لا توجد بيانات نشاط كافية بعد.</div>}</div>
          </div>
        </div>
       </SectionCard>

      {parentPortalSummary ? <SectionCard title="بوابة ولي الأمر ضمن التقرير التنفيذي" icon={MonitorSmartphone} action={<div className="flex flex-wrap items-center gap-2"><Badge tone={parentPortalSummary.portalEnabled ? 'green' : 'rose'}>{parentPortalSummary.portalEnabled ? 'البوابة مفعلة' : 'البوابة مقفلة'}</Badge><button onClick={() => exportExecutiveParentPortal('csv')} className="rounded-2xl bg-sky-50 px-4 py-2 text-sm font-bold text-sky-700 ring-1 ring-sky-100">CSV</button><button onClick={() => exportExecutiveParentPortal('xlsx')} className="rounded-2xl bg-emerald-600 px-4 py-2 text-sm font-bold text-white">Excel</button><button onClick={printExecutiveSchoolReport} className="rounded-2xl bg-white px-4 py-2 text-sm font-bold text-slate-700 ring-1 ring-slate-200">طباعة / PDF</button></div>}>
        <div className="grid grid-cols-2 gap-4 xl:grid-cols-6">
          <SummaryBox label="الأولياء المرتبطون" value={parentPortalSummary.linkedParents || 0} color="text-sky-700" />
          <SummaryBox label="الأولياء النشطون" value={parentPortalSummary.activeParents || 0} color="text-emerald-700" />
          <SummaryBox label="الطلبات المعلقة" value={parentPortalSummary.pendingRequests || 0} color="text-amber-700" />
          <SummaryBox label="الحسابات المعلقة" value={parentPortalSummary.suspendedParents || 0} color="text-rose-700" />
          <SummaryBox label="تغطية أولياء الأمور" value={`${parentPortalSummary.coverageRate || 0}%`} color="text-violet-700" />
          <SummaryBox label="تغطية الجوالات" value={`${parentPortalSummary.guardianCoverageRate || 0}%`} color="text-slate-700" />
        </div>
        <div className="mt-6 grid grid-cols-1 gap-6 xl:grid-cols-3">
          <div className="rounded-3xl bg-slate-50 p-5 ring-1 ring-slate-200 xl:col-span-2">
            <div className="mb-4 font-bold text-slate-800">ملخص مؤشرات بوابة ولي الأمر</div>
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
              {parentPortalRows.map((row) => <div key={row.metric} className="flex items-center justify-between rounded-2xl bg-white px-4 py-3 ring-1 ring-slate-200"><div className="text-sm font-bold text-slate-700">{row.metric}</div><div className="text-sm font-black text-slate-900">{row.value}</div></div>)}
            </div>
          </div>
          <div className="rounded-3xl bg-slate-50 p-5 ring-1 ring-slate-200">
            <div className="mb-4 font-bold text-slate-800">جاهزية التواصل</div>
            <div className="space-y-3">
              <div className="rounded-2xl bg-white p-4 ring-1 ring-slate-200"><div className="text-sm text-slate-500">الأرقام الإضافية</div><div className="mt-2 text-3xl font-black text-slate-900">{parentPortalSummary.extraContacts || 0}</div></div>
              <div className="rounded-2xl bg-white p-4 ring-1 ring-slate-200"><div className="text-sm text-slate-500">تفضيل واتساب</div><div className="mt-2 text-3xl font-black text-emerald-700">{parentPortalSummary.preferredWhatsappCount || 0}</div></div>
              <div className="rounded-2xl bg-white p-4 ring-1 ring-slate-200"><div className="text-sm text-slate-500">آخر تنبيه إداري</div><div className="mt-2 text-sm font-black text-slate-900">{parentPortalSummary.lastAlertAt ? formatDateTime(parentPortalSummary.lastAlertAt) : 'لا يوجد'}</div></div>
            </div>
          </div>
        </div>
      </SectionCard> : null}

      <SectionCard title="مركز التقارير الشاملة" icon={BarChart3} action={<div className="flex flex-wrap items-center gap-2"><button onClick={() => exportCurrentReport('csv')} className="rounded-2xl bg-sky-50 px-4 py-2 text-sm font-bold text-sky-700 ring-1 ring-sky-100">CSV</button><button onClick={() => exportCurrentReport('xlsx')} className="rounded-2xl bg-emerald-600 px-4 py-2 text-sm font-bold text-white">Excel</button><button onClick={printCurrentReport} className="rounded-2xl bg-white px-4 py-2 text-sm font-bold text-slate-700 ring-1 ring-slate-200">طباعة / PDF</button></div>}>
        <div className="flex flex-wrap gap-2">{reportTabs.map((tab) => <button key={tab.key} onClick={() => setReportTab(tab.key)} className={cx('rounded-2xl px-4 py-2 text-sm font-black transition', reportTab === tab.key ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200')}>{tab.label}</button>)}</div>
        <div className="mt-5 grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">{reportQuickCards.map((card) => {
          const active = reportTab === card.key;
          return <button key={card.key} onClick={() => setReportTab(card.key)} className={cx('rounded-3xl p-4 text-right ring-1 transition', active ? 'bg-slate-900 text-white ring-slate-900 shadow-lg' : 'bg-slate-50 text-slate-800 ring-slate-200 hover:bg-white')}>
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className={cx('text-sm font-black', active ? 'text-white' : 'text-slate-900')}>{card.label}</div>
                <div className={cx('mt-1 text-xs leading-6', active ? 'text-white/75' : 'text-slate-500')}>{card.description}</div>
              </div>
              <div className={cx('rounded-2xl px-3 py-2 text-center', active ? 'bg-white/10' : 'bg-white ring-1 ring-slate-200')}>
                <div className={cx('text-2xl font-black', active ? 'text-white' : 'text-slate-900')}>{card.count}</div>
                <div className={cx('text-[11px] font-bold', active ? 'text-white/70' : 'text-slate-500')}>سجل</div>
              </div>
            </div>
          </button>;
        })}</div>
        <div className="mt-5 grid grid-cols-1 gap-3 md:grid-cols-3 xl:grid-cols-6">
          <div><label className="mb-1 block text-xs font-bold text-slate-600">من تاريخ</label><input type="date" value={reportFromDate} onChange={(e) => setReportFromDate(e.target.value)} className="w-full rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm" /></div>
          <div><label className="mb-1 block text-xs font-bold text-slate-600">إلى تاريخ</label><input type="date" value={reportToDate} onChange={(e) => setReportToDate(e.target.value)} className="w-full rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm" /></div>
          <div><label className="mb-1 block text-xs font-bold text-slate-600">الفصل</label><select value={reportClassKey} onChange={(e) => setReportClassKey(e.target.value)} className="w-full rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm"><option value="all">كل الفصول</option>{classroomRows.map((row) => <option key={getClassroomKeyFromCompanyRow(row)} value={getClassroomKeyFromCompanyRow(row)}>{row.name}</option>)}</select></div>
          <div><label className="mb-1 block text-xs font-bold text-slate-600">المعلم</label><select value={reportTeacherName} onChange={(e) => setReportTeacherName(e.target.value)} className="w-full rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm"><option value="all">كل المعلمين</option>{teacherRows.map((row) => <option key={row.teacherName} value={row.teacherName}>{row.teacherName}</option>)}</select></div>
          <div><label className="mb-1 block text-xs font-bold text-slate-600">الطالب</label><select value={reportStudentId} onChange={(e) => setReportStudentId(e.target.value)} className="w-full rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm"><option value="all">كل الطلاب</option>{schoolStudents.map((row) => <option key={row.id} value={row.id}>{row.name}</option>)}</select></div>
          <div><label className="mb-1 block text-xs font-bold text-slate-600">الحالة</label><select value={reportStatus} onChange={(e) => setReportStatus(e.target.value)} className="w-full rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm"><option value="all">كل الحالات</option>{reportTab === 'attendance' ? <><option value="present">حاضر</option><option value="late">متأخر</option><option value="absent">غير ممسوح / غائب</option></> : null}{reportTab === 'behavior' ? <><option value="positive">إيجابي</option><option value="negative">سلبي</option></> : null}{reportTab === 'store' ? <><option value="pending">بانتظار الاعتماد</option><option value="approved">بانتظار التسليم</option><option value="delivered">تم التسليم</option><option value="rejected">مرفوض</option><option value="active">جوائز معتمدة</option><option value="awaiting">جوائز بانتظار الاعتماد</option><option value="depleted">منتهية الكمية</option></> : null}{reportTab === 'lessons' ? <><option value="submitted">تم الاعتماد</option><option value="missing">لم يعتمد</option></> : null}{reportTab === 'leavePass' ? <><option value="created">جديد</option><option value="sent-system">أرسل بالنظام</option><option value="sent-manual">أرسل يدويًا</option><option value="viewed">اطلع المعلم</option><option value="approved-agent">اعتمده الوكيل</option><option value="approved-counselor">اعتمده المرشد</option><option value="released-guardian">سُلّم مع ولي الأمر</option><option value="completed">تم التنفيذ</option><option value="cancelled">ملغي</option></> : null}</select></div>
        </div>
        <div className="mt-4 flex flex-wrap items-center gap-3">
          <div className="rounded-2xl bg-white px-4 py-2 text-sm text-slate-500 ring-1 ring-slate-200">فلترة التقرير الحالي بحسب التاريخ، الفصل، المعلم، الطالب، والحالة.</div>
          <button onClick={() => { setReportFromDate(''); setReportToDate(''); setReportClassKey('all'); setReportTeacherName('all'); setReportStudentId('all'); setReportStatus('all'); }} className="rounded-2xl bg-slate-200 px-4 py-2 text-sm font-bold text-slate-700">إعادة تعيين الفلاتر</button>
          {selectedStudentReport ? <button onClick={printSelectedStudentReport} className="rounded-2xl bg-sky-50 px-4 py-2 text-sm font-bold text-sky-700 ring-1 ring-sky-100">طباعة تقرير الطالب المحدد</button> : null}
          {selectedTeacherReport ? <button onClick={printSelectedTeacherReport} className="rounded-2xl bg-violet-50 px-4 py-2 text-sm font-bold text-violet-700 ring-1 ring-violet-100">طباعة تقرير المعلم المحدد</button> : null}
          {reportTab === 'executive' ? <button onClick={printExecutiveSchoolReport} className="rounded-2xl bg-emerald-50 px-4 py-2 text-sm font-bold text-emerald-700 ring-1 ring-emerald-100">طباعة التقرير التنفيذي للمدرسة</button> : null}
        </div>
        {(selectedStudentReport || selectedTeacherReport || reportTab === 'executive') ? <div className="mt-5 space-y-4">
          <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
            {selectedStudentReport ? <div className="rounded-3xl bg-sky-50 p-5 ring-1 ring-sky-100"><div className="mb-3 flex items-center justify-between gap-3"><div><div className="font-black text-slate-900">تقرير الطالب المحدد</div><div className="text-sm text-slate-500">{selectedStudentReport.name} • {selectedStudentReport.className}</div></div><Badge tone="blue">{selectedStudentReport.points} نقطة</Badge></div><div className="mb-3 flex flex-wrap gap-2 text-xs"><Badge tone="slate">ولي الأمر: {selectedStudentReport.parentName}</Badge><Badge tone="sky">جوال: {selectedStudentReport.parentMobile}</Badge><Badge tone="green">معدل الحضور {selectedStudentReport.attendanceRate}%</Badge></div><div className="grid grid-cols-2 gap-3 text-sm"><div className="rounded-2xl bg-white p-3 ring-1 ring-sky-100"><div className="text-slate-500">الحضور</div><div className="mt-1 text-xl font-black text-slate-900">{selectedStudentReport.presentCount}</div></div><div className="rounded-2xl bg-white p-3 ring-1 ring-sky-100"><div className="text-slate-500">التأخر</div><div className="mt-1 text-xl font-black text-amber-700">{selectedStudentReport.lateCount}</div></div><div className="rounded-2xl bg-white p-3 ring-1 ring-sky-100"><div className="text-slate-500">المكافآت</div><div className="mt-1 text-xl font-black text-emerald-700">{selectedStudentReport.rewards}</div></div><div className="rounded-2xl bg-white p-3 ring-1 ring-sky-100"><div className="text-slate-500">الخصومات</div><div className="mt-1 text-xl font-black text-rose-700">{selectedStudentReport.violations}</div></div><div className="rounded-2xl bg-white p-3 ring-1 ring-sky-100"><div className="text-slate-500">البرامج</div><div className="mt-1 text-xl font-black text-violet-700">{selectedStudentReport.programs}</div></div><div className="rounded-2xl bg-white p-3 ring-1 ring-sky-100"><div className="text-slate-500">جوائز المتجر</div><div className="mt-1 text-xl font-black text-slate-900">{selectedStudentReport.storeDelivered}</div></div></div></div> : null}
            {selectedStudentReport ? <NafisStudentWidget studentId={selectedStudentReport.id} schoolId={selectedSchool?.id} studentName={selectedStudentReport.name} /> : null}
            {selectedTeacherReport ? <div className="rounded-3xl bg-violet-50 p-5 ring-1 ring-violet-100"><div className="mb-3 flex items-center justify-between gap-3"><div><div className="font-black text-slate-900">تقرير المعلم المحدد</div><div className="text-sm text-slate-500">{selectedTeacherReport.teacherName}</div></div><Badge tone="violet">{selectedTeacherReport.specialPoints} تخصصي</Badge></div><div className="mb-3 flex flex-wrap gap-2 text-xs">{(selectedTeacherReport.classNames || []).slice(0, 3).map((name, index) => <Badge key={`${name}-${index}`} tone="slate">{name}</Badge>)}{(selectedTeacherReport.classNames || []).length > 3 ? <Badge tone="slate">+{selectedTeacherReport.classNames.length - 3}</Badge> : null}</div><div className="grid grid-cols-2 gap-3 text-sm"><div className="rounded-2xl bg-white p-3 ring-1 ring-violet-100"><div className="text-slate-500">المكافآت</div><div className="mt-1 text-xl font-black text-emerald-700">{selectedTeacherReport.rewards}</div></div><div className="rounded-2xl bg-white p-3 ring-1 ring-violet-100"><div className="text-slate-500">الخصومات</div><div className="mt-1 text-xl font-black text-rose-700">{selectedTeacherReport.violations}</div></div><div className="rounded-2xl bg-white p-3 ring-1 ring-violet-100"><div className="text-slate-500">البرامج</div><div className="mt-1 text-xl font-black text-sky-700">{selectedTeacherReport.programs}</div></div><div className="rounded-2xl bg-white p-3 ring-1 ring-violet-100"><div className="text-slate-500">تحضير الحصص</div><div className="mt-1 text-xl font-black text-slate-900">{selectedTeacherReport.submittedLessons}</div></div><div className="rounded-2xl bg-white p-3 ring-1 ring-violet-100"><div className="text-slate-500">الإنجازات التخصصية</div><div className="mt-1 text-xl font-black text-violet-700">{selectedTeacherReport.specialAchievements}</div></div><div className="rounded-2xl bg-white p-3 ring-1 ring-violet-100"><div className="text-slate-500">الفصول</div><div className="mt-1 text-xl font-black text-slate-900">{selectedTeacherReport.classesCount}</div></div></div></div> : null}
            {reportTab === 'executive' ? <div className="rounded-3xl bg-emerald-50 p-5 ring-1 ring-emerald-100"><div className="mb-3 flex items-center justify-between gap-3"><div><div className="font-black text-slate-900">ملخص تنفيذي سريع</div><div className="text-sm text-slate-500">{selectedSchool?.name || 'المدرسة'}</div></div><Badge tone="green">جاهز للطباعة</Badge></div><div className="grid grid-cols-2 gap-3 text-sm"><div className="rounded-2xl bg-white p-3 ring-1 ring-emerald-100"><div className="text-slate-500">نسبة المتأخرين</div><div className="mt-1 text-xl font-black text-amber-700">{attendanceRows.length ? Math.round((attendanceRows.filter((row) => row.status === 'late').length / attendanceRows.length) * 100) : 0}%</div></div><div className="rounded-2xl bg-white p-3 ring-1 ring-emerald-100"><div className="text-slate-500">إجمالي النقاط</div><div className="mt-1 text-xl font-black text-slate-900">{studentComprehensiveRows.reduce((sum, row) => sum + Number(row.points || 0), 0)}</div></div><div className="rounded-2xl bg-white p-3 ring-1 ring-emerald-100"><div className="text-slate-500">الجوائز المسلمة</div><div className="mt-1 text-xl font-black text-rose-700">{rewardStoreSummary.deliveredRedemptions || 0}</div></div><div className="rounded-2xl bg-white p-3 ring-1 ring-emerald-100"><div className="text-slate-500">الجلسات المعتمدة</div><div className="mt-1 text-xl font-black text-sky-700">{lessonRows.filter((row) => row.submittedAt).length}</div></div></div></div> : null}
          </div>
          {reportTab === 'executive' ? <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
            <SectionCard title="أعلى الطلاب" icon={GraduationCap} action={<button onClick={() => printExecutiveDataset('أعلى الطلاب', [{ key: 'rank', label: '#' }, { key: 'studentName', label: 'الطالب' }, { key: 'className', label: 'الفصل' }, { key: 'points', label: 'النقاط' }, { key: 'attendanceRate', label: 'معدل الحضور %' }, { key: 'rewards', label: 'المكافآت' }, { key: 'violations', label: 'الخصومات' }], executiveTopStudents)} className="rounded-2xl bg-white px-4 py-2 text-sm font-bold text-slate-700 ring-1 ring-slate-200">طباعة</button>}>
              <div className="overflow-x-auto rounded-3xl ring-1 ring-slate-200">
                <table className="w-full text-sm"><thead className="bg-slate-100"><tr><th className="px-4 py-3 text-right font-black text-slate-700">#</th><th className="px-4 py-3 text-right font-black text-slate-700">الطالب</th><th className="px-4 py-3 text-right font-black text-slate-700">الفصل</th><th className="px-4 py-3 text-right font-black text-slate-700">النقاط</th><th className="px-4 py-3 text-right font-black text-slate-700">الحضور</th></tr></thead><tbody>{executiveTopStudents.length ? executiveTopStudents.map((row) => <tr key={`exec-student-${row.rank}`} className="border-t border-slate-100 hover:bg-slate-50"><td className="px-4 py-3 font-black text-slate-900">{row.rank}</td><td className="px-4 py-3 font-bold text-slate-900">{row.studentName}</td><td className="px-4 py-3 text-slate-600">{row.className}</td><td className="px-4 py-3 font-black text-sky-700">{row.points}</td><td className="px-4 py-3 text-slate-600">{row.attendanceRate}%</td></tr>) : <tr><td colSpan={5} className="px-4 py-8 text-center text-slate-500">لا توجد بيانات متاحة.</td></tr>}</tbody></table>
              </div>
            </SectionCard>
            <SectionCard title="أعلى الفصول" icon={School2} action={<button onClick={() => printExecutiveDataset('أعلى الفصول', [{ key: 'rank', label: '#' }, { key: 'className', label: 'الفصل' }, { key: 'averagePoints', label: 'متوسط النقاط' }, { key: 'rewards', label: 'المكافآت' }, { key: 'students', label: 'الطلاب' }, { key: 'lateCount', label: 'التأخر' }], executiveTopClasses)} className="rounded-2xl bg-white px-4 py-2 text-sm font-bold text-slate-700 ring-1 ring-slate-200">طباعة</button>}>
              <div className="overflow-x-auto rounded-3xl ring-1 ring-slate-200">
                <table className="w-full text-sm"><thead className="bg-slate-100"><tr><th className="px-4 py-3 text-right font-black text-slate-700">#</th><th className="px-4 py-3 text-right font-black text-slate-700">الفصل</th><th className="px-4 py-3 text-right font-black text-slate-700">متوسط النقاط</th><th className="px-4 py-3 text-right font-black text-slate-700">المكافآت</th><th className="px-4 py-3 text-right font-black text-slate-700">الطلاب</th></tr></thead><tbody>{executiveTopClasses.length ? executiveTopClasses.map((row) => <tr key={`exec-class-${row.rank}`} className="border-t border-slate-100 hover:bg-slate-50"><td className="px-4 py-3 font-black text-slate-900">{row.rank}</td><td className="px-4 py-3 font-bold text-slate-900">{row.className}</td><td className="px-4 py-3 font-black text-emerald-700">{row.averagePoints}</td><td className="px-4 py-3 text-slate-600">{row.rewards}</td><td className="px-4 py-3 text-slate-600">{row.students}</td></tr>) : <tr><td colSpan={5} className="px-4 py-8 text-center text-slate-500">لا توجد بيانات متاحة.</td></tr>}</tbody></table>
              </div>
            </SectionCard>
            <SectionCard title="أعلى المعلمين" icon={Users} action={<button onClick={() => printExecutiveDataset('أعلى المعلمين', [{ key: 'rank', label: '#' }, { key: 'teacherName', label: 'المعلم' }, { key: 'totalActions', label: 'الإجراءات' }, { key: 'submittedLessons', label: 'تحضير الحصص' }, { key: 'specialPoints', label: 'الرصيد التخصصي' }, { key: 'classesCount', label: 'الفصول' }], executiveTopTeachers)} className="rounded-2xl bg-white px-4 py-2 text-sm font-bold text-slate-700 ring-1 ring-slate-200">طباعة</button>}>
              <div className="overflow-x-auto rounded-3xl ring-1 ring-slate-200">
                <table className="w-full text-sm"><thead className="bg-slate-100"><tr><th className="px-4 py-3 text-right font-black text-slate-700">#</th><th className="px-4 py-3 text-right font-black text-slate-700">المعلم</th><th className="px-4 py-3 text-right font-black text-slate-700">الإجراءات</th><th className="px-4 py-3 text-right font-black text-slate-700">تحضير الحصص</th><th className="px-4 py-3 text-right font-black text-slate-700">التخصصي</th></tr></thead><tbody>{executiveTopTeachers.length ? executiveTopTeachers.map((row) => <tr key={`exec-teacher-${row.rank}`} className="border-t border-slate-100 hover:bg-slate-50"><td className="px-4 py-3 font-black text-slate-900">{row.rank}</td><td className="px-4 py-3 font-bold text-slate-900">{row.teacherName}</td><td className="px-4 py-3 text-slate-600">{row.totalActions}</td><td className="px-4 py-3 text-slate-600">{row.submittedLessons}</td><td className="px-4 py-3 font-black text-violet-700">{row.specialPoints}</td></tr>) : <tr><td colSpan={5} className="px-4 py-8 text-center text-slate-500">لا توجد بيانات متاحة.</td></tr>}</tbody></table>
              </div>
            </SectionCard>
            <SectionCard title="أكثر البنود استخدامًا" icon={Sparkles} action={<button onClick={() => printExecutiveDataset('أكثر البنود استخدامًا', [{ key: 'rank', label: '#' }, { key: 'title', label: 'البند' }, { key: 'typeLabel', label: 'النوع' }, { key: 'count', label: 'مرات الاستخدام' }], executiveTopBehaviorItems)} className="rounded-2xl bg-white px-4 py-2 text-sm font-bold text-slate-700 ring-1 ring-slate-200">طباعة</button>}>
              <div className="overflow-x-auto rounded-3xl ring-1 ring-slate-200">
                <table className="w-full text-sm"><thead className="bg-slate-100"><tr><th className="px-4 py-3 text-right font-black text-slate-700">#</th><th className="px-4 py-3 text-right font-black text-slate-700">البند</th><th className="px-4 py-3 text-right font-black text-slate-700">النوع</th><th className="px-4 py-3 text-right font-black text-slate-700">مرات الاستخدام</th></tr></thead><tbody>{executiveTopBehaviorItems.length ? executiveTopBehaviorItems.map((row) => <tr key={`exec-item-${row.rank}`} className="border-t border-slate-100 hover:bg-slate-50"><td className="px-4 py-3 font-black text-slate-900">{row.rank}</td><td className="px-4 py-3 font-bold text-slate-900">{row.title}</td><td className="px-4 py-3 text-slate-600">{row.typeLabel}</td><td className="px-4 py-3 font-black text-amber-700">{row.count}</td></tr>) : <tr><td colSpan={4} className="px-4 py-8 text-center text-slate-500">لا توجد بيانات متاحة.</td></tr>}</tbody></table>
              </div>
            </SectionCard>

            <SectionCard title="أعلى الطلاب غيابًا" icon={FileClock} action={<button onClick={() => printExecutiveDataset('أعلى الطلاب غيابًا', [{ key: 'rank', label: '#' }, { key: 'studentName', label: 'الطالب' }, { key: 'className', label: 'الفصل' }, { key: 'lessonAbsenceCount', label: 'غياب الحصص' }, { key: 'lateCount', label: 'التأخر' }, { key: 'attendanceRate', label: 'الحضور %' }], executiveTopAbsentStudents)} className="rounded-2xl bg-white px-4 py-2 text-sm font-bold text-slate-700 ring-1 ring-slate-200">طباعة</button>}>
              <div className="overflow-x-auto rounded-3xl ring-1 ring-slate-200">
                <table className="w-full text-sm"><thead className="bg-slate-100"><tr><th className="px-4 py-3 text-right font-black text-slate-700">#</th><th className="px-4 py-3 text-right font-black text-slate-700">الطالب</th><th className="px-4 py-3 text-right font-black text-slate-700">الفصل</th><th className="px-4 py-3 text-right font-black text-slate-700">غياب الحصص</th><th className="px-4 py-3 text-right font-black text-slate-700">التأخر</th><th className="px-4 py-3 text-right font-black text-slate-700">الحضور</th></tr></thead><tbody>{executiveTopAbsentStudents.length ? executiveTopAbsentStudents.map((row) => <tr key={`exec-absent-${row.rank}`} className="border-t border-slate-100 hover:bg-slate-50"><td className="px-4 py-3 font-black text-slate-900">{row.rank}</td><td className="px-4 py-3 font-bold text-slate-900">{row.studentName}</td><td className="px-4 py-3 text-slate-600">{row.className}</td><td className="px-4 py-3 font-black text-rose-700">{row.lessonAbsenceCount}</td><td className="px-4 py-3 text-slate-600">{row.lateCount}</td><td className="px-4 py-3 text-slate-600">{row.attendanceRate}%</td></tr>) : <tr><td colSpan={6} className="px-4 py-8 text-center text-slate-500">لا توجد بيانات متاحة.</td></tr>}</tbody></table>
              </div>
            </SectionCard>
            <SectionCard title="أعلى الطلاب تأخرًا" icon={FileClock} action={<button onClick={() => printExecutiveDataset('أعلى الطلاب تأخرًا', [{ key: 'rank', label: '#' }, { key: 'studentName', label: 'الطالب' }, { key: 'className', label: 'الفصل' }, { key: 'lateCount', label: 'التأخر' }, { key: 'lessonAbsenceCount', label: 'غياب الحصص' }, { key: 'points', label: 'النقاط' }], executiveTopLateStudents)} className="rounded-2xl bg-white px-4 py-2 text-sm font-bold text-slate-700 ring-1 ring-slate-200">طباعة</button>}>
              <div className="overflow-x-auto rounded-3xl ring-1 ring-slate-200">
                <table className="w-full text-sm"><thead className="bg-slate-100"><tr><th className="px-4 py-3 text-right font-black text-slate-700">#</th><th className="px-4 py-3 text-right font-black text-slate-700">الطالب</th><th className="px-4 py-3 text-right font-black text-slate-700">الفصل</th><th className="px-4 py-3 text-right font-black text-slate-700">التأخر</th><th className="px-4 py-3 text-right font-black text-slate-700">غياب الحصص</th><th className="px-4 py-3 text-right font-black text-slate-700">النقاط</th></tr></thead><tbody>{executiveTopLateStudents.length ? executiveTopLateStudents.map((row) => <tr key={`exec-late-${row.rank}`} className="border-t border-slate-100 hover:bg-slate-50"><td className="px-4 py-3 font-black text-slate-900">{row.rank}</td><td className="px-4 py-3 font-bold text-slate-900">{row.studentName}</td><td className="px-4 py-3 text-slate-600">{row.className}</td><td className="px-4 py-3 font-black text-amber-700">{row.lateCount}</td><td className="px-4 py-3 text-slate-600">{row.lessonAbsenceCount}</td><td className="px-4 py-3 text-slate-600">{row.points}</td></tr>) : <tr><td colSpan={6} className="px-4 py-8 text-center text-slate-500">لا توجد بيانات متاحة.</td></tr>}</tbody></table>
              </div>
            </SectionCard>
            <SectionCard title="أعلى المعلمين مكافآت" icon={Gift} action={<button onClick={() => printExecutiveDataset('أعلى المعلمين مكافآت', [{ key: 'rank', label: '#' }, { key: 'teacherName', label: 'المعلم' }, { key: 'rewards', label: 'المكافآت' }, { key: 'totalActions', label: 'الإجراءات' }, { key: 'submittedLessons', label: 'تحضير الحصص' }], executiveTopRewardTeachers)} className="rounded-2xl bg-white px-4 py-2 text-sm font-bold text-slate-700 ring-1 ring-slate-200">طباعة</button>}>
              <div className="overflow-x-auto rounded-3xl ring-1 ring-slate-200">
                <table className="w-full text-sm"><thead className="bg-slate-100"><tr><th className="px-4 py-3 text-right font-black text-slate-700">#</th><th className="px-4 py-3 text-right font-black text-slate-700">المعلم</th><th className="px-4 py-3 text-right font-black text-slate-700">المكافآت</th><th className="px-4 py-3 text-right font-black text-slate-700">الإجراءات</th><th className="px-4 py-3 text-right font-black text-slate-700">الحصص</th></tr></thead><tbody>{executiveTopRewardTeachers.length ? executiveTopRewardTeachers.map((row) => <tr key={`exec-reward-teacher-${row.rank}`} className="border-t border-slate-100 hover:bg-slate-50"><td className="px-4 py-3 font-black text-slate-900">{row.rank}</td><td className="px-4 py-3 font-bold text-slate-900">{row.teacherName}</td><td className="px-4 py-3 font-black text-emerald-700">{row.rewards}</td><td className="px-4 py-3 text-slate-600">{row.totalActions}</td><td className="px-4 py-3 text-slate-600">{row.submittedLessons}</td></tr>) : <tr><td colSpan={5} className="px-4 py-8 text-center text-slate-500">لا توجد بيانات متاحة.</td></tr>}</tbody></table>
              </div>
            </SectionCard>
            <SectionCard title="أعلى المعلمين خصومات" icon={ShieldAlert} action={<button onClick={() => printExecutiveDataset('أعلى المعلمين خصومات', [{ key: 'rank', label: '#' }, { key: 'teacherName', label: 'المعلم' }, { key: 'violations', label: 'الخصومات' }, { key: 'totalActions', label: 'الإجراءات' }, { key: 'submittedLessons', label: 'تحضير الحصص' }], executiveTopViolationTeachers)} className="rounded-2xl bg-white px-4 py-2 text-sm font-bold text-slate-700 ring-1 ring-slate-200">طباعة</button>}>
              <div className="overflow-x-auto rounded-3xl ring-1 ring-slate-200">
                <table className="w-full text-sm"><thead className="bg-slate-100"><tr><th className="px-4 py-3 text-right font-black text-slate-700">#</th><th className="px-4 py-3 text-right font-black text-slate-700">المعلم</th><th className="px-4 py-3 text-right font-black text-slate-700">الخصومات</th><th className="px-4 py-3 text-right font-black text-slate-700">الإجراءات</th><th className="px-4 py-3 text-right font-black text-slate-700">الحصص</th></tr></thead><tbody>{executiveTopViolationTeachers.length ? executiveTopViolationTeachers.map((row) => <tr key={`exec-violation-teacher-${row.rank}`} className="border-t border-slate-100 hover:bg-slate-50"><td className="px-4 py-3 font-black text-slate-900">{row.rank}</td><td className="px-4 py-3 font-bold text-slate-900">{row.teacherName}</td><td className="px-4 py-3 font-black text-rose-700">{row.violations}</td><td className="px-4 py-3 text-slate-600">{row.totalActions}</td><td className="px-4 py-3 text-slate-600">{row.submittedLessons}</td></tr>) : <tr><td colSpan={5} className="px-4 py-8 text-center text-slate-500">لا توجد بيانات متاحة.</td></tr>}</tbody></table>
              </div>
            </SectionCard>
            <SectionCard title="أعلى الفصول مكافآت" icon={School2} action={<button onClick={() => printExecutiveDataset('أعلى الفصول مكافآت', [{ key: 'rank', label: '#' }, { key: 'className', label: 'الفصل' }, { key: 'rewards', label: 'المكافآت' }, { key: 'averagePoints', label: 'متوسط النقاط' }, { key: 'students', label: 'الطلاب' }], executiveTopRewardClasses)} className="rounded-2xl bg-white px-4 py-2 text-sm font-bold text-slate-700 ring-1 ring-slate-200">طباعة</button>}>
              <div className="overflow-x-auto rounded-3xl ring-1 ring-slate-200">
                <table className="w-full text-sm"><thead className="bg-slate-100"><tr><th className="px-4 py-3 text-right font-black text-slate-700">#</th><th className="px-4 py-3 text-right font-black text-slate-700">الفصل</th><th className="px-4 py-3 text-right font-black text-slate-700">المكافآت</th><th className="px-4 py-3 text-right font-black text-slate-700">متوسط النقاط</th><th className="px-4 py-3 text-right font-black text-slate-700">الطلاب</th></tr></thead><tbody>{executiveTopRewardClasses.length ? executiveTopRewardClasses.map((row) => <tr key={`exec-reward-class-${row.rank}`} className="border-t border-slate-100 hover:bg-slate-50"><td className="px-4 py-3 font-black text-slate-900">{row.rank}</td><td className="px-4 py-3 font-bold text-slate-900">{row.className}</td><td className="px-4 py-3 font-black text-emerald-700">{row.rewards}</td><td className="px-4 py-3 text-slate-600">{row.averagePoints}</td><td className="px-4 py-3 text-slate-600">{row.students}</td></tr>) : <tr><td colSpan={5} className="px-4 py-8 text-center text-slate-500">لا توجد بيانات متاحة.</td></tr>}</tbody></table>
              </div>
            </SectionCard>
            <SectionCard title="أعلى الفصول خصومات" icon={School2} action={<button onClick={() => printExecutiveDataset('أعلى الفصول خصومات', [{ key: 'rank', label: '#' }, { key: 'className', label: 'الفصل' }, { key: 'violations', label: 'الخصومات' }, { key: 'lateCount', label: 'التأخر' }, { key: 'students', label: 'الطلاب' }], executiveTopViolationClasses)} className="rounded-2xl bg-white px-4 py-2 text-sm font-bold text-slate-700 ring-1 ring-slate-200">طباعة</button>}>
              <div className="overflow-x-auto rounded-3xl ring-1 ring-slate-200">
                <table className="w-full text-sm"><thead className="bg-slate-100"><tr><th className="px-4 py-3 text-right font-black text-slate-700">#</th><th className="px-4 py-3 text-right font-black text-slate-700">الفصل</th><th className="px-4 py-3 text-right font-black text-slate-700">الخصومات</th><th className="px-4 py-3 text-right font-black text-slate-700">التأخر</th><th className="px-4 py-3 text-right font-black text-slate-700">الطلاب</th></tr></thead><tbody>{executiveTopViolationClasses.length ? executiveTopViolationClasses.map((row) => <tr key={`exec-violation-class-${row.rank}`} className="border-t border-slate-100 hover:bg-slate-50"><td className="px-4 py-3 font-black text-slate-900">{row.rank}</td><td className="px-4 py-3 font-bold text-slate-900">{row.className}</td><td className="px-4 py-3 font-black text-rose-700">{row.violations}</td><td className="px-4 py-3 text-slate-600">{row.lateCount}</td><td className="px-4 py-3 text-slate-600">{row.students}</td></tr>) : <tr><td colSpan={5} className="px-4 py-8 text-center text-slate-500">لا توجد بيانات متاحة.</td></tr>}</tbody></table>
              </div>
            </SectionCard>
          </div> : null}
          {(selectedStudentReport || selectedTeacherReport) ? <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
            {selectedStudentReport ? <div className="rounded-3xl bg-white p-5 ring-1 ring-slate-200"><div className="mb-4 font-black text-slate-900">آخر نشاط الطالب</div><div className="space-y-3">{selectedStudentReport.recentActions?.length ? selectedStudentReport.recentActions.map((row, index) => <div key={`student-action-${index}`} className="rounded-2xl bg-slate-50 px-4 py-3 ring-1 ring-slate-200"><div className="flex items-center justify-between gap-3"><div><div className="font-bold text-slate-900">{row.title}</div><div className="mt-1 text-xs text-slate-500">{row.actorName} • {row.dateLabel}</div></div><Badge tone={row.typeLabel === 'مكافأة' ? 'green' : row.typeLabel === 'خصم' ? 'rose' : 'violet'}>{row.typeLabel}</Badge></div></div>) : <div className="rounded-2xl bg-slate-50 px-4 py-6 text-sm font-bold text-slate-500 ring-1 ring-slate-200">لا توجد إجراءات حديثة على الطالب.</div>}</div><div className="mt-4 rounded-2xl bg-slate-50 p-4 ring-1 ring-slate-200"><div className="mb-3 font-bold text-slate-800">آخر طلبات المتجر</div><div className="space-y-2">{selectedStudentReport.recentStoreRequests?.length ? selectedStudentReport.recentStoreRequests.map((row, index) => <div key={`student-store-${index}`} className="flex items-center justify-between gap-3 rounded-2xl bg-white px-4 py-3 ring-1 ring-slate-200"><div><div className="font-bold text-slate-900">{row.itemTitle}</div><div className="mt-1 text-xs text-slate-500">{row.dateLabel}</div></div><Badge tone={row.statusLabel === 'تم التسليم' ? 'green' : row.statusLabel === 'مرفوض' ? 'rose' : row.statusLabel === 'بانتظار التسليم' ? 'blue' : 'amber'}>{row.statusLabel}</Badge></div>) : <div className="rounded-2xl bg-white px-4 py-4 text-sm font-bold text-slate-500 ring-1 ring-slate-200">لا توجد طلبات متجر حديثة.</div>}</div></div></div> : null}
            {selectedTeacherReport ? <div className="rounded-3xl bg-white p-5 ring-1 ring-slate-200"><div className="mb-4 font-black text-slate-900">آخر نشاط المعلم</div><div className="space-y-3">{selectedTeacherReport.recentActions?.length ? selectedTeacherReport.recentActions.map((row, index) => <div key={`teacher-action-${index}`} className="rounded-2xl bg-slate-50 px-4 py-3 ring-1 ring-slate-200"><div className="flex items-center justify-between gap-3"><div><div className="font-bold text-slate-900">{row.title}</div><div className="mt-1 text-xs text-slate-500">{row.studentName} • {row.className} • {row.dateLabel}</div></div><Badge tone={row.typeLabel === 'مكافأة' ? 'green' : row.typeLabel === 'خصم' ? 'rose' : 'violet'}>{row.typeLabel}</Badge></div></div>) : <div className="rounded-2xl bg-slate-50 px-4 py-6 text-sm font-bold text-slate-500 ring-1 ring-slate-200">لا توجد إجراءات حديثة على المعلم.</div>}</div><div className="mt-4 rounded-2xl bg-slate-50 p-4 ring-1 ring-slate-200"><div className="mb-3 font-bold text-slate-800">آخر جلسات التحضير</div><div className="space-y-2">{selectedTeacherReport.lessonSubmissions?.length ? selectedTeacherReport.lessonSubmissions.map((row, index) => <div key={`teacher-lesson-${index}`} className="flex items-center justify-between gap-3 rounded-2xl bg-white px-4 py-3 ring-1 ring-slate-200"><div><div className="font-bold text-slate-900">{row.sessionLabel}</div><div className="mt-1 text-xs text-slate-500">{row.className} • {formatDateTime(row.submittedAt)}</div></div><Badge tone={Number(row.absentCount || 0) > 0 ? 'rose' : 'green'}>{Number(row.absentCount || 0)} غائب</Badge></div>) : <div className="rounded-2xl bg-white px-4 py-4 text-sm font-bold text-slate-500 ring-1 ring-slate-200">لا توجد جلسات تحضير حديثة.</div>}</div></div></div> : null}
          </div> : null}
        </div> : null}
        <div className="mt-5 grid grid-cols-2 gap-4 xl:grid-cols-6">
          <SummaryBox label="نوع التقرير" value={reportTabs.find((tab) => tab.key === reportTab)?.label || '—'} color="text-slate-900" />
          <SummaryBox label="عدد السجلات" value={currentReportMeta.rows.length} color="text-sky-700" />
          <SummaryBox label="الطلاب" value={schoolStudents.length} color="text-emerald-700" />
          <SummaryBox label="المعلمون النشطون" value={teacherRows.length} color="text-violet-700" />
          <SummaryBox label="جلسات الحصص" value={lessonSessions.length} color="text-amber-700" />
          <SummaryBox label="جوائز المتجر" value={rewardStoreSummary.activeItems || 0} color="text-rose-700" />
        </div>
        <div className="mt-6 grid grid-cols-1 gap-6 xl:grid-cols-3">
          <div className="rounded-3xl bg-slate-50 p-5 ring-1 ring-slate-200 xl:col-span-2">
            <div className="mb-4 font-bold text-slate-800">{currentReportMeta.title}</div>
            <div className="h-80 rounded-3xl bg-white p-4 ring-1 ring-slate-200">
              <ResponsiveContainer width="100%" height="100%">{['parents','store'].includes(reportTab) ? <PieChart><Pie data={reportChartData.filter((item) => Number(item.value || 0) > 0)} dataKey="value" nameKey="name" outerRadius={110} label>{reportChartData.map((entry, index) => <Cell key={`${entry.name}-${index}`} fill={["#0ea5e9","#10b981","#f59e0b","#ef4444","#8b5cf6","#14b8a6"][index % 6]} />)}</Pie><Tooltip /></PieChart> : <BarChart data={reportChartData}><CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="name" hide={reportChartData.length > 8} /><YAxis /><Tooltip /><Bar dataKey="value" fill="#0ea5e9" radius={[8,8,0,0]} /></BarChart>}</ResponsiveContainer>
            </div>
          </div>
          <div className="rounded-3xl bg-slate-50 p-5 ring-1 ring-slate-200">
            <div className="mb-4 font-bold text-slate-800">ملخص سريع</div>
            <div className="space-y-3">
              <div className="rounded-2xl bg-white p-4 ring-1 ring-slate-200"><div className="text-sm text-slate-500">النطاق الزمني</div><div className="mt-2 text-sm font-black text-slate-900">{reportFromDate || 'من البداية'} → {reportToDate || 'حتى اليوم'}</div></div>
              <div className="rounded-2xl bg-white p-4 ring-1 ring-slate-200"><div className="text-sm text-slate-500">الفصل المحدد</div><div className="mt-2 text-sm font-black text-slate-900">{reportClassKey === 'all' ? 'كل الفصول' : (classroomRows.find((row) => String(getClassroomKeyFromCompanyRow(row)) === String(reportClassKey))?.name || '—')}</div></div>
              <div className="rounded-2xl bg-white p-4 ring-1 ring-slate-200"><div className="text-sm text-slate-500">المعلم المحدد</div><div className="mt-2 text-sm font-black text-slate-900">{reportTeacherName === 'all' ? 'كل المعلمين' : reportTeacherName}</div></div>
              <div className="rounded-2xl bg-white p-4 ring-1 ring-slate-200"><div className="text-sm text-slate-500">الطالب المحدد</div><div className="mt-2 text-sm font-black text-slate-900">{reportStudentId === 'all' ? 'كل الطلاب' : (schoolStudents.find((item) => String(item.id) === String(reportStudentId))?.name || '—')}</div></div>
            </div>
          </div>
        </div>
        {reportTab === 'store' ? <div className="mt-6 grid grid-cols-2 gap-4 xl:grid-cols-6"><SummaryBox label="المتجر المعتمد" value={rewardStoreSummary.activeItems || 0} color="text-emerald-700" /><SummaryBox label="بانتظار الاستلام" value={rewardStoreSummary.awaitingReceipt || 0} color="text-amber-700" /><SummaryBox label="المقترحات المعلقة" value={rewardStoreSummary.pendingProposals || 0} color="text-violet-700" /><SummaryBox label="طلبات بانتظار الاعتماد" value={rewardStoreSummary.pendingRedemptions || 0} color="text-sky-700" /><SummaryBox label="تم التسليم" value={rewardStoreSummary.deliveredRedemptions || 0} color="text-rose-700" /><SummaryBox label="عدد المتبرعين" value={rewardStoreSummary.donorCount || 0} color="text-slate-700" /></div> : null}
        <div className="mt-6 overflow-x-auto rounded-3xl ring-1 ring-slate-200">
          <table className="w-full text-sm"><thead className="bg-slate-100"><tr>{currentReportMeta.columns.map((column) => <th key={column.key} className="px-4 py-3 text-right font-black text-slate-700">{column.label}</th>)}</tr></thead><tbody>{!currentReportMeta.rows.length ? <tr><td colSpan={currentReportMeta.columns.length} className="px-4 py-8 text-center text-slate-500">لا توجد بيانات مطابقة للفلاتر الحالية.</td></tr> : currentReportMeta.rows.slice(0, 300).map((row, index) => <tr key={`${reportTab}-${index}`} className="border-t border-slate-100 hover:bg-slate-50">{currentReportMeta.columns.map((column) => <td key={column.key} className="px-4 py-3 text-slate-700">{String(row[column.key] ?? '—')}</td>)}</tr>)}</tbody></table>
        </div>
        {reportTab === 'store' ? <div className="mt-6 grid grid-cols-1 gap-6 xl:grid-cols-2"><div className="rounded-3xl bg-slate-50 p-5 ring-1 ring-slate-200"><div className="mb-4 font-bold text-slate-800">تقرير الجوائز والمخزون</div><div className="overflow-x-auto rounded-3xl ring-1 ring-slate-200"><table className="w-full text-sm"><thead className="bg-slate-100"><tr><th className="px-4 py-3 text-right font-black text-slate-700">الجائزة</th><th className="px-4 py-3 text-right font-black text-slate-700">المتبرع</th><th className="px-4 py-3 text-center font-black text-slate-700">الكمية</th><th className="px-4 py-3 text-center font-black text-slate-700">المتبقي</th><th className="px-4 py-3 text-center font-black text-slate-700">النقاط</th><th className="px-4 py-3 text-right font-black text-slate-700">الحالة</th></tr></thead><tbody>{!storeItemRows.length ? <tr><td colSpan={6} className="px-4 py-8 text-center text-slate-500">لا توجد جوائز مطابقة.</td></tr> : storeItemRows.map((row, index) => <tr key={`item-${index}`} className="border-t border-slate-100 hover:bg-slate-50"><td className="px-4 py-3">{row.title}</td><td className="px-4 py-3">{row.donorName}</td><td className="px-4 py-3 text-center">{row.quantity}</td><td className="px-4 py-3 text-center">{row.remainingQuantity}</td><td className="px-4 py-3 text-center">{row.pointsCost}</td><td className="px-4 py-3">{row.approvalStatus}</td></tr>)}</tbody></table></div></div><div className="rounded-3xl bg-slate-50 p-5 ring-1 ring-slate-200"><div className="mb-4 font-bold text-slate-800">تقرير الشراكة المجتمعية</div><div className="grid grid-cols-2 gap-3"><div className="rounded-2xl bg-white p-4 ring-1 ring-slate-200"><div className="text-sm text-slate-500">جوائز المدرسة</div><div className="mt-2 text-3xl font-black text-slate-900">{rewardStoreSummary.schoolSourceCount || 0}</div></div><div className="rounded-2xl bg-white p-4 ring-1 ring-slate-200"><div className="text-sm text-slate-500">جوائز أولياء الأمور</div><div className="mt-2 text-3xl font-black text-violet-700">{rewardStoreSummary.parentSourceCount || 0}</div></div><div className="rounded-2xl bg-white p-4 ring-1 ring-slate-200"><div className="text-sm text-slate-500">جوائز المتبرعين</div><div className="mt-2 text-3xl font-black text-emerald-700">{rewardStoreSummary.externalSourceCount || 0}</div></div><div className="rounded-2xl bg-white p-4 ring-1 ring-slate-200"><div className="text-sm text-slate-500">المتبرعون</div><div className="mt-2 text-3xl font-black text-amber-700">{rewardStoreSummary.donorCount || 0}</div></div></div></div></div> : null}
      </SectionCard>

      {/* تقرير نقاط المعلمين التفصيلي */}
      <TeacherPointsReport schoolActions={schoolActions} settings={settings} />
    </div>
  );
}

export default ReportsPage;

/**
 * ==========================================
 *  LessonAttendanceSessionsPage Component
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
function LessonAttendanceSessionsPage({ selectedSchool, currentUser, users, settings, initialSessionId, onCreateSession, onCloseSession, onDeleteSession, onSubmitSession, onSendSessionInvites, onMarkSessionOpened }) {
  const isManager = ['superadmin', 'principal', 'supervisor'].includes(String(currentUser?.role || ''));
  const schoolUsers = useMemo(() => (users || []).filter((user) => Number(user.schoolId) === Number(selectedSchool?.id)), [users, selectedSchool?.id]);
  const todayIsoSession = getTodayIso();
  const weeklyTimetable = useMemo(() => Array.isArray(settings?.weeklyTimetable) ? settings.weeklyTimetable : [], [settings?.weeklyTimetable]);
  const [showAllDays, setShowAllDays] = useState(false);
  const allSessions = useMemo(() => [...getLessonAttendanceSessions(selectedSchool)].sort((a, b) => String(b.createdAt || '').localeCompare(String(a.createdAt || ''))), [selectedSchool]);
  const sessions = useMemo(() => showAllDays ? allSessions : allSessions.filter((session) => String(session.dateIso || '').startsWith(todayIsoSession) || String(session.createdAt || '').startsWith(todayIsoSession)), [allSessions, showAllDays, todayIsoSession]);
  const [selectedSessionId, setSelectedSessionId] = useState(initialSessionId || sessions[0]?.id || '');
  const [createForm, setCreateForm] = useState(() => {
    const now = new Date();
    const hh = String(now.getHours()).padStart(2, '0');
    const mm = String(now.getMinutes()).padStart(2, '0');
    const endDate = new Date(now.getTime() + 30 * 60000);
    const ehh = String(endDate.getHours()).padStart(2, '0');
    const emm = String(endDate.getMinutes()).padStart(2, '0');
    const autoSlot = getCurrentSlotFromTimetable(Array.isArray(settings?.weeklyTimetable) ? settings.weeklyTimetable : [], now);
    return {
      dateIso: getTodayIso(),
      slotLabel: autoSlot ? autoSlot.slotLabel : 'الحصة الأولى',
      startTime: autoSlot ? (autoSlot.startTime || `${hh}:${mm}`) : `${hh}:${mm}`,
      endTime: autoSlot ? (autoSlot.endTime || `${ehh}:${emm}`) : `${ehh}:${emm}`,
      note: '',
      _autoSlotId: autoSlot?.id || '',
    };
  });
  const [teacherClassKey, setTeacherClassKey] = useState('');
  const [teacherAbsentIds, setTeacherAbsentIds] = useState([]);
  const [teacherAcknowledgement, setTeacherAcknowledgement] = useState(false);
  const [teacherStatus, setTeacherStatus] = useState('');
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [allowResubmit, setAllowResubmit] = useState(false);
  const [targetTeacherIds, setTargetTeacherIds] = useState([]);
  const [sendStatus, setSendStatus] = useState('');
  const [customMessage, setCustomMessage] = useState('');
  const [showMessageEditor, setShowMessageEditor] = useState(false);

  const teacherOptions = useMemo(() => (schoolUsers || []).filter((user) => user.role === 'teacher' && String(user.status || 'نشط') === 'نشط'), [schoolUsers]);
  const selectedSession = useMemo(() => sessions.find((session) => String(session.id) === String(selectedSessionId)) || null, [sessions, selectedSessionId]);
  const selectedSessionSummary = useMemo(() => computeLessonAttendanceSessionSummary(selectedSession, selectedSchool, schoolUsers), [selectedSession, selectedSchool, schoolUsers]);
  const teacherClassrooms = useMemo(() => getUnifiedCompanyRows(selectedSchool, { preferStructure: true }).filter((row) => Number(row.studentsCount || 0) > 0), [selectedSchool]);
  const teacherClassStudents = useMemo(() => getStudentsForLessonClassroom(selectedSchool, teacherClassKey), [selectedSchool, teacherClassKey]);
  const existingTeacherSubmission = useMemo(() => {
    if (!selectedSession || !teacherClassKey) return null;
    return (selectedSession.submissions || []).find((item) => String(item.teacherId) === String(currentUser?.id) && String(item.classKey) === String(teacherClassKey)) || null;
  }, [selectedSession, teacherClassKey, currentUser?.id]);
  const inviteRows = useMemo(() => {
    if (!selectedSession) return [];
    const inviteMap = new Map((selectedSession.teacherInvites || []).map((item) => [String(item.teacherId), item]));
    return getLessonSessionTeacherTargets(selectedSession, schoolUsers).map((teacher) => ({ teacher, invite: inviteMap.get(String(teacher.id)) || null }));
  }, [selectedSession, schoolUsers]);
  const completionChart = useMemo(() => ([
    { name: 'المستهدفون', value: selectedSessionSummary.expectedTeachers || 0 },
    { name: 'أرسل لهم', value: selectedSessionSummary.sentTeachers || 0 },
    { name: 'فتحوا الرابط', value: selectedSessionSummary.openedTeachers || 0 },
    { name: 'اعتمدوا', value: selectedSessionSummary.submittedTeachers || 0 },
  ]), [selectedSessionSummary]);
  const attendanceChart = useMemo(() => ([
    { name: 'حاضر', value: selectedSessionSummary.totalPresent || 0 },
    { name: 'غائب', value: selectedSessionSummary.totalAbsent || 0 },
  ]), [selectedSessionSummary]);

  useEffect(() => {
    if (!selectedSessionId && sessions[0]?.id) setSelectedSessionId(sessions[0].id);
  }, [sessions, selectedSessionId]);

  useEffect(() => {
    if (initialSessionId && sessions.some((session) => String(session.id) === String(initialSessionId))) setSelectedSessionId(initialSessionId);
  }, [initialSessionId, sessions]);

  useEffect(() => {
    if (!teacherClassKey && teacherClassrooms[0]) setTeacherClassKey(getClassroomKeyFromCompanyRow(teacherClassrooms[0]));
  }, [teacherClassKey, teacherClassrooms]);

  useEffect(() => {
    if (existingTeacherSubmission) {
      setTeacherAbsentIds((existingTeacherSubmission.absentStudentIds || []).map((id) => String(id)));
      setTeacherAcknowledgement(existingTeacherSubmission.acknowledged !== false);
    } else {
      setTeacherAbsentIds([]);
      setTeacherAcknowledgement(false);
    }
    // إعادة تعيين وضع إعادة التحضير عند تغيير الجلسة أو الفصل
    setAllowResubmit(false);
  }, [existingTeacherSubmission, selectedSessionId, teacherClassKey]);

  useEffect(() => {
    if (!selectedSession) return;
    if (Array.isArray(selectedSession.targetTeacherIds) && selectedSession.targetTeacherIds.length) {
      setTargetTeacherIds(selectedSession.targetTeacherIds.map((id) => String(id)));
      return;
    }
    // ابحث عن الحصة في الجدول لتفعيل المعلمين المناوبين تلقائيًا
    const sessionSlotId = selectedSession?._autoSlotId || selectedSession?.slotId || '';
    const sessionSlot = sessionSlotId ? weeklyTimetable.find((e) => e.id === sessionSlotId) : null;
    const sessionDayKey = selectedSession?.dateIso ? getArabicDayKey(new Date(selectedSession.dateIso + 'T12:00:00')) : '';
    const matchedSlot = sessionSlot || (sessionDayKey ? weeklyTimetable.find((e) => e.day === sessionDayKey && e.slotLabel === selectedSession?.slotLabel) : null);
    const scheduledTeacherIds = (matchedSlot?.teacherIds || []).map(String);
    if (scheduledTeacherIds.length > 0) {
      // فعّل المعلمين المناوبين فقط
      setTargetTeacherIds(scheduledTeacherIds.filter((id) => teacherOptions.some((t) => String(t.id) === id)));
    } else {
      // إذا لم يكن هناك جدول، فعّل جميع المعلمين
      setTargetTeacherIds(teacherOptions.map((teacher) => String(teacher.id)));
    }
  }, [selectedSession?.id, teacherOptions, weeklyTimetable]);

  useEffect(() => {
    if (isManager || !selectedSession || !currentUser?.id) return;
    onMarkSessionOpened?.(selectedSession.id, currentUser.id);
  }, [isManager, selectedSession?.id, currentUser?.id, onMarkSessionOpened]);

  const toggleAbsent = (studentId) => {
    const key = String(studentId);
    setTeacherAbsentIds((prev) => prev.includes(key) ? prev.filter((item) => item !== key) : [...prev, key]);
  };

  const handleCreate = () => {
    const formData = { ...createForm, slotId: createForm._autoSlotId || '' };
    const result = onCreateSession(formData);
    if (result?.ok) {
      setSelectedSessionId(result.session.id);
      setTeacherStatus(`تم إنشاء الجلسة. الرابط: ${buildLessonSessionLink(result.session.id)}`);
    }
  };

  const handleTeacherSubmit = async () => {
    if (!selectedSession) return;
    if (!teacherClassKey) return setTeacherStatus('اختر الفصل أولًا.');
    if (!teacherAcknowledgement) return setTeacherStatus('يلزم إقرار المعلم بصحة التحضير قبل الحفظ.');
    setTeacherStatus('جارٍ حفظ التحضير...');
    const result = await onSubmitSession({ sessionId: selectedSession.id, classKey: teacherClassKey, acknowledgement: teacherAcknowledgement, absentStudentIds: teacherAbsentIds });
    setTeacherStatus(result?.message || (result?.ok ? 'تم الحفظ.' : 'تعذر الحفظ.'));
    if (result?.ok) {
      setSubmitSuccess(true);
      setAllowResubmit(false);
      setTimeout(() => setSubmitSuccess(false), 3000);
    }
  };

  const [isSendingInvites, setIsSendingInvites] = React.useState(false);
  const handleSendInvitesNow = async () => {
    if (!selectedSession) return;
    if (!targetTeacherIds.length) { setSendStatus('حدد معلمًا واحدًا على الأقل.'); return; }
    setIsSendingInvites(true);
    setSendStatus('');
    const result = await onSendSessionInvites?.(selectedSession.id, targetTeacherIds, customMessage || null);
    setIsSendingInvites(false);
    setSendStatus(result?.message || (result?.ok ? 'تم الإرسال بنجاح.' : 'تعذر الإرسال.'));
  };

  const buildSessionMessage = (session) => customMessage || `نأمل تنفيذ تحضير ${buildLessonAttendanceSessionLabel(session)} عبر الرابط التالي:\n${buildLessonSessionLink(session.id)}\nيرجى اختيار الفصل يدويًا ثم اعتماد التحضير.`;

  const handleCopyMessage = () => {
    if (!selectedSession) return;
    const msg = buildSessionMessage(selectedSession);
    navigator.clipboard?.writeText(msg);
    setCustomMessage(msg);
    setShowMessageEditor(true);
  };

  const exportSessionSummary = () => {
    if (!selectedSession) return;
    const rows = (selectedSession.submissions || []).map((item) => ({
      session: buildLessonAttendanceSessionLabel(selectedSession),
      teacherName: item.teacherName || '—',
      className: item.className || '—',
      totalStudents: item.totalStudents || 0,
      presentCount: item.presentCount || 0,
      absentCount: item.absentCount || 0,
      acknowledged: item.acknowledged ? 'نعم' : 'لا',
      submittedAt: item.submittedAt || '',
    }));
    downloadFile(`lesson-session-${selectedSession.id}-summary.csv`, buildCsv(rows, [
      { key: 'session', label: 'الجلسة' },
      { key: 'teacherName', label: 'المعلم' },
      { key: 'className', label: 'الفصل' },
      { key: 'totalStudents', label: 'إجمالي الطلاب' },
      { key: 'presentCount', label: 'الحاضرون' },
      { key: 'absentCount', label: 'الغائبون' },
      { key: 'acknowledged', label: 'إقرار المعلم' },
      { key: 'submittedAt', label: 'وقت الحفظ' },
    ]), 'text/csv;charset=utf-8;');
  };

  const exportSessionAbsences = () => {
    if (!selectedSession) return;
    downloadFile(`lesson-session-${selectedSession.id}-absences.csv`, buildCsv(selectedSessionSummary.absentRows || [], [
      { key: 'sessionLabel', label: 'الجلسة' },
      { key: 'className', label: 'الفصل' },
      { key: 'teacherName', label: 'المعلم' },
      { key: 'studentName', label: 'الطالب' },
      { key: 'studentNumber', label: 'الرقم' },
      { key: 'acknowledged', label: 'إقرار المعلم' },
      { key: 'submittedAt', label: 'وقت الحفظ' },
    ]), 'text/csv;charset=utf-8;');
  };

  if (!selectedSchool) {
    return <SectionCard title="تحضير الحصص" icon={ClipboardList}><div className="rounded-3xl bg-amber-50 p-6 text-sm font-bold text-amber-900 ring-1 ring-amber-200">لم يتم تحديد مدرسة لهذا الحساب.</div></SectionCard>;
  }

  return (
    <div className="space-y-6">
      <SectionCard title="تحضير الحصص" icon={ClipboardList}>
        <div className="grid gap-4 xl:grid-cols-[1.02fr_1.98fr]">
          <div className="space-y-4 rounded-[1.8rem] bg-slate-50 p-4 ring-1 ring-slate-200">
            <div>
              <div className="text-sm font-black text-slate-700">جلسات التحضير</div>
              <div className="mt-1 text-xs leading-6 text-slate-500">ينشئ المدير الجلسة ثم ينسخ الرابط أو يرسل واتساب للمعلمين. المعلم يختار الفصل يدويًا والجميع حاضرون افتراضيًا.</div>
            </div>
            {isManager ? (
              <div className="space-y-3 rounded-[1.5rem] bg-white p-4 ring-1 ring-slate-200">
                <div className="text-sm font-black text-slate-800">إنشاء جلسة جديدة</div>
                <Input label="التاريخ" type="date" value={createForm.dateIso} onChange={(e) => setCreateForm((prev) => ({ ...prev, dateIso: e.target.value }))} />
                {(() => {
                  const selectedDate = createForm.dateIso ? new Date(createForm.dateIso + 'T12:00:00') : new Date();
                  const dayKey = getArabicDayKey(selectedDate);
                  const todaySlots = weeklyTimetable.filter((e) => e.day === dayKey).sort((a, b) => parseTimeToMinutes(a.startTime || '00:00') - parseTimeToMinutes(b.startTime || '00:00'));
                  if (todaySlots.length > 0) {
                    return (
                      <div>
                        <label className="block text-xs font-bold text-slate-600 mb-1">الحصة</label>
                        <select
                          value={createForm._autoSlotId || ''}
                          onChange={(e) => {
                            const slot = todaySlots.find((s) => s.id === e.target.value);
                            if (slot) {
                              setCreateForm((prev) => ({ ...prev, slotLabel: slot.slotLabel, startTime: slot.startTime || prev.startTime, endTime: slot.endTime || prev.endTime, _autoSlotId: slot.id }));
                            } else {
                              setCreateForm((prev) => ({ ...prev, slotLabel: e.target.value, _autoSlotId: '' }));
                            }
                          }}
                          className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-bold text-slate-800 outline-none focus:border-sky-400 focus:ring-2 focus:ring-sky-100"
                        >
                          {todaySlots.map((s) => (
                            <option key={s.id} value={s.id}>{s.slot ? `الحصة ${s.slot}: ` : ''}{s.slotLabel} ({s.startTime || '—'} – {s.endTime || '—'})</option>
                          ))}
                          <option value="">حصة مخصصة...</option>
                        </select>
                        {(!createForm._autoSlotId) && <Input label="اسم الحصة" value={createForm.slotLabel} onChange={(e) => setCreateForm((prev) => ({ ...prev, slotLabel: e.target.value }))} className="mt-2" />}
                      </div>
                    );
                  }
                  return <Input label="اسم الحصة" value={createForm.slotLabel} onChange={(e) => setCreateForm((prev) => ({ ...prev, slotLabel: e.target.value }))} placeholder="مثال: الحصة الأولى" />;
                })()}
                <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                  <Input label="بداية التحضير" type="time" value={createForm.startTime} onChange={(e) => setCreateForm((prev) => ({ ...prev, startTime: e.target.value }))} />
                  <Input label="نهاية التحضير" type="time" value={createForm.endTime} onChange={(e) => setCreateForm((prev) => ({ ...prev, endTime: e.target.value }))} />
                </div>
                <Input label="ملاحظة" value={createForm.note} onChange={(e) => setCreateForm((prev) => ({ ...prev, note: e.target.value }))} placeholder="اختياري" />
                <button onClick={handleCreate} className="w-full rounded-2xl bg-sky-700 px-4 py-3 text-sm font-black text-white">إنشاء الجلسة</button>
              </div>
            ) : (
              <div className="rounded-[1.5rem] bg-white p-4 ring-1 ring-slate-200">
                <div className="text-sm font-black text-slate-800">وضع المعلم</div>
                <div className="mt-2 text-xs leading-6 text-slate-500">ادخل الجلسة من الرابط أو من هذه الصفحة. اضغط فقط على الغائب ثم اعتمد مع الإقرار.</div>
              </div>
            )}
            <div className="space-y-2">
              <div className="flex items-center justify-between gap-2">
                <div className="text-xs font-bold text-slate-500">{showAllDays ? 'جميع الأيام' : 'جلسات اليوم فقط'}</div>
                <button onClick={() => setShowAllDays((prev) => !prev)} className="rounded-xl bg-white px-3 py-1 text-xs font-black text-slate-600 ring-1 ring-slate-200">{showAllDays ? 'اليوم فقط' : 'عرض كل الأيام'}</button>
              </div>
              {sessions.length ? sessions.map((session) => {
                const summary = computeLessonAttendanceSessionSummary(session, selectedSchool, schoolUsers);
                return (
                  <button key={session.id} onClick={() => setSelectedSessionId(session.id)} className={cx('w-full rounded-[1.5rem] border px-4 py-4 text-right transition', String(selectedSessionId) === String(session.id) ? 'border-sky-300 bg-sky-50' : 'border-slate-200 bg-white hover:bg-slate-50')}>
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <div className="font-black text-slate-900">{buildLessonAttendanceSessionLabel(session)}</div>
                        <div className="mt-1 text-xs text-slate-500">{session.startTime || '—'} {session.endTime ? `حتى ${session.endTime}` : ''}</div>
                      </div>
                      <Badge tone={getLessonAttendanceSessionStatusTone(session.status)}>{getLessonAttendanceSessionStatusLabel(session.status)}</Badge>
                    </div>
                    <div className="mt-3 flex flex-wrap gap-2 text-[11px] font-bold text-slate-500">
                      <span className="rounded-full bg-slate-100 px-3 py-1">اعتمدوا: {summary.submittedTeachers}/{summary.expectedTeachers}</span>
                      <span className="rounded-full bg-slate-100 px-3 py-1">فتحوا الرابط: {summary.openedTeachers}</span>
                      <span className="rounded-full bg-slate-100 px-3 py-1">الغياب: {summary.totalAbsent}</span>
                    </div>
                  </button>
                );
              }) : <div className="rounded-[1.5rem] bg-white p-5 text-sm font-bold text-slate-500 ring-1 ring-slate-200">لا توجد جلسات تحضير بعد.</div>}
            </div>
          </div>

          <div className="space-y-4">
            {!selectedSession && (
              <div className="rounded-[1.8rem] bg-white p-8 text-center ring-1 ring-slate-200">
                <div className="text-base font-black text-slate-700">{isManager ? 'اختر جلسة أو أنشئ جلسة جديدة' : 'اختر جلسة من القائمة'}</div>
                <div className="mt-2 text-sm text-slate-500">{isManager ? 'بعد إنشاء الجلسة يمكنك إرسال رابط التحضير للمعلمين عبر الواتساب أو النظام.' : 'اختر الجلسة من القائمة على اليسار لبدء التحضير.'}</div>
              </div>
            )}
            {selectedSession ? (
              <>
                <div className="grid grid-cols-2 gap-3 xl:grid-cols-6">
                  {[
                    ['المستهدفون', selectedSessionSummary.expectedTeachers, 'text-slate-900'],
                    ['أرسل لهم', selectedSessionSummary.sentTeachers, 'text-violet-700'],
                    ['فتحوا الرابط', selectedSessionSummary.openedTeachers, 'text-sky-700'],
                    ['اعتمدوا', selectedSessionSummary.submittedTeachers, 'text-emerald-700'],
                    ['الحاضرون', selectedSessionSummary.totalPresent, 'text-slate-900'],
                    ['الغائبون', selectedSessionSummary.totalAbsent, 'text-rose-700'],
                  ].map(([label, value, tone]) => (
                    <div key={label} className="rounded-[1.5rem] bg-white p-4 ring-1 ring-slate-200">
                      <div className="text-xs font-bold text-slate-500">{label}</div>
                      <div className={cx('mt-2 text-3xl font-black', tone)}>{value}</div>
                    </div>
                  ))}
                </div>

                <div className="rounded-[1.8rem] bg-white p-5 ring-1 ring-slate-200">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <div className="text-sm text-slate-500">تفاصيل الجلسة</div>
                      <div className="mt-1 text-2xl font-black text-slate-900">{buildLessonAttendanceSessionLabel(selectedSession)}</div>
                      <div className="mt-2 flex flex-wrap gap-2">
                        <Badge tone={getLessonAttendanceSessionStatusTone(selectedSession.status)}>{getLessonAttendanceSessionStatusLabel(selectedSession.status)}</Badge>
                        {selectedSession.note ? <Badge tone="violet">{selectedSession.note}</Badge> : null}
                        <Badge tone="blue">الرابط جاهز</Badge>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {isManager ? <button onClick={() => onCloseSession?.(selectedSession.id, selectedSession.status === 'closed' ? 'open' : 'closed')} className="rounded-2xl bg-slate-900 px-4 py-3 text-sm font-black text-white">{selectedSession.status === 'closed' ? 'إعادة فتح' : 'إغلاق الجلسة'}</button> : null}
                      {isManager ? <button onClick={() => { if (window.confirm('هل أنت متأكد من حذف هذه الجلسة؟ لا يمكن التراجع عن هذا الإجراء.')) { onDeleteSession?.(selectedSession.id); setSelectedSessionId(''); } }} className="rounded-2xl bg-rose-600 px-4 py-3 text-sm font-black text-white">حذف الجلسة</button> : null}
                      <button onClick={exportSessionSummary} className="rounded-2xl bg-emerald-600 px-4 py-3 text-sm font-black text-white">CSV الملخص</button>
                      <button onClick={exportSessionAbsences} className="rounded-2xl bg-orange-600 px-4 py-3 text-sm font-black text-white">CSV الغياب</button>
                    </div>
                  </div>

                  {isManager ? (
                    <div className="mt-5 grid gap-5 xl:grid-cols-[1.1fr_0.9fr]">
                      <div className="space-y-4">
                        <div className="rounded-[1.5rem] bg-slate-50 p-4 ring-1 ring-slate-200">
                          <div className="flex items-center justify-between gap-3">
                            <div>
                              <div className="text-sm font-black text-slate-800">إرسال الرابط للمعلمين</div>
                              <div className="mt-1 text-xs text-slate-500">حدد المعلمين ثم أرسل لهم عبر واتساب من النظام أو انسخ الرابط يدويًا.</div>
                            </div>
                            <button onClick={() => setTargetTeacherIds(teacherOptions.map((teacher) => String(teacher.id)))} className="rounded-2xl bg-white px-3 py-2 text-xs font-black text-slate-700 ring-1 ring-slate-200">تحديد الكل</button>
                          </div>
                          {(() => {
                            // المعلمون المناوبون من الجدول لهذه الجلسة
                            const sessionSlotId = selectedSession?._autoSlotId || selectedSession?.slotId || '';
                            const sessionSlot = sessionSlotId ? weeklyTimetable.find((e) => e.id === sessionSlotId) : null;
                            // إذا لم يكن هناك slotId، ابحث باسم الحصة واليوم
                            const sessionDayKey = selectedSession?.dateIso ? getArabicDayKey(new Date(selectedSession.dateIso + 'T12:00:00')) : '';
                            const matchedSlot = sessionSlot || (sessionDayKey ? weeklyTimetable.find((e) => e.day === sessionDayKey && e.slotLabel === selectedSession?.slotLabel) : null);
                            const scheduledTeacherIds = new Set((matchedSlot?.teacherIds || []).map(String));
                            const hasScheduled = scheduledTeacherIds.size > 0;
                            return (
                              <>
                                {hasScheduled && <div className="mt-3 mb-1 text-xs font-bold text-emerald-700">✅ المعلمون المناوبون من الجدول مفعّلون تلقائيًا</div>}
                                <div className="mt-3 grid gap-2 md:grid-cols-2">
                                  {teacherOptions.map((teacher) => {
                                    const active = targetTeacherIds.includes(String(teacher.id));
                                    const isScheduled = scheduledTeacherIds.has(String(teacher.id));
                                    return (
                                      <label key={teacher.id} className={cx('flex items-center justify-between rounded-2xl px-4 py-3 text-sm font-bold ring-1', active && isScheduled ? 'bg-emerald-50 text-emerald-800 ring-emerald-200' : active ? 'bg-sky-50 text-sky-800 ring-sky-200' : 'bg-white text-slate-700 ring-slate-200')}>
                                        <span className="flex items-center gap-2">
                                          {isScheduled && <span className="inline-block h-2 w-2 rounded-full bg-emerald-500" title="مناوب في الجدول" />}
                                          {teacher.name || teacher.username}
                                        </span>
                                        <input type="checkbox" checked={active} onChange={(e) => setTargetTeacherIds((prev) => e.target.checked ? [...new Set([...prev, String(teacher.id)])] : prev.filter((id) => String(id) !== String(teacher.id)))} />
                                      </label>
                                    );
                                  })}
                                </div>
                              </>
                            );
                          })()}

                          {showMessageEditor && (
                            <div className="mt-3 space-y-2">
                              <div className="text-xs font-bold text-slate-700">نص الرسالة (يمكنك تعديلها)</div>
                              <textarea value={customMessage || buildSessionMessage(selectedSession)} onChange={(e) => setCustomMessage(e.target.value)} rows={4} className="w-full rounded-2xl border border-slate-200 bg-white px-3 py-2 text-xs leading-6 outline-none" />
                              <div className="flex gap-2">
                                <button onClick={() => { navigator.clipboard?.writeText(customMessage || buildSessionMessage(selectedSession)); setSendStatus('تم نسخ الرسالة.'); }} className="rounded-xl bg-slate-100 px-3 py-2 text-xs font-black text-slate-700 ring-1 ring-slate-200">نسخ الرسالة</button>
                                <button onClick={() => { setCustomMessage(''); setShowMessageEditor(false); }} className="rounded-xl bg-white px-3 py-2 text-xs font-black text-slate-500 ring-1 ring-slate-200">إعادة تعيين</button>
                              </div>
                            </div>
                          )}
                          <div className="mt-4 flex flex-wrap gap-2">
                            <button onClick={handleSendInvitesNow} disabled={isSendingInvites} className={`rounded-2xl px-4 py-3 text-sm font-black text-white transition-all ${isSendingInvites ? 'bg-emerald-400 cursor-not-allowed' : 'bg-emerald-700 hover:bg-emerald-800'}`}>{isSendingInvites ? 'جارِ الإرسال...' : 'إرسال من النظام'}</button>
                            <a href={targetTeacherIds.length === 1 ? `https://wa.me/${String((teacherOptions.find((t) => String(t.id) === targetTeacherIds[0])?.mobile || '')).replace(/\D/g, '')}?text=${encodeURIComponent(customMessage || buildSessionMessage(selectedSession))}` : `https://wa.me/?text=${encodeURIComponent(customMessage || buildSessionMessage(selectedSession))}`} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 rounded-2xl bg-[#25D366] px-4 py-3 text-sm font-black text-white">
                              <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
                              إرسال رابط واتساب
                            </a>
                            {sendStatus ? <Badge tone={/تم/.test(sendStatus) ? 'green' : 'amber'}>{sendStatus}</Badge> : null}
                          </div>
                        </div>
                        <div className="rounded-[1.5rem] bg-slate-50 p-4 ring-1 ring-slate-200">
                          <div className="mb-3 text-sm font-black text-slate-800">متابعة الإرسال والفتح</div>
                          <div className="space-y-2 max-h-[24rem] overflow-auto">
                            {inviteRows.length ? inviteRows.map(({ teacher, invite }) => (
                              <div key={teacher.id} className="rounded-2xl bg-white px-4 py-3 ring-1 ring-slate-200">
                                <div className="flex items-center justify-between gap-3">
                                  <div>
                                    <div className="font-black text-slate-900">{teacher.name || teacher.username}</div>
                                    <div className="mt-1 text-xs text-slate-500">{teacher.mobile || 'لا يوجد رقم جوال'}</div>
                                  </div>
                                  <div className="flex flex-wrap gap-2">
                                    {(() => {
                                      const hasSubmitted = (selectedSession.submissions || []).some((item) => String(item.teacherId) === String(teacher.id));
                                      if (invite?.sentAt) return <Badge tone="violet">أرسل</Badge>;
                                      if (hasSubmitted) return <Badge tone="sky">تم</Badge>;
                                      return <Badge tone="slate">لم يرسل</Badge>;
                                    })()}
                                    {invite?.openedAt ? <Badge tone="blue">فتح الرابط</Badge> : null}
                                    {(selectedSession.submissions || []).some((item) => String(item.teacherId) === String(teacher.id)) ? <Badge tone="green">اعتمد</Badge> : null}
                                    {teacher.mobile ? (
                                      <a
                                        href={`https://wa.me/${String(teacher.mobile || '').replace(/\D/g, '')}?text=${encodeURIComponent(`نأمل تنفيذ تحضير ${buildLessonAttendanceSessionLabel(selectedSession)} عبر الرابط التالي:\n${buildLessonSessionLink(selectedSession.id)}`)}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="inline-flex items-center gap-1 rounded-2xl bg-emerald-600 px-3 py-1 text-xs font-black text-white hover:bg-emerald-700"
                                      >
                                        <svg className="h-3 w-3" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
                                        واتساب
                                      </a>
                                    ) : null}
                                  </div>
                                </div>
                              </div>
                            )) : <div className="rounded-2xl bg-white px-4 py-5 text-sm font-bold text-slate-500 ring-1 ring-slate-200">لا يوجد معلمون مستهدفون.</div>}
                          </div>
                        </div>
                      </div>

                      <div className="grid gap-5 xl:grid-cols-2">
                        <div className="rounded-[1.6rem] bg-white p-4 ring-1 ring-slate-200 xl:col-span-2">
                          <div className="mb-3 text-sm font-black text-slate-800">سير الجلسة</div>
                          <ResponsiveContainer width="100%" height={240}>
                            <BarChart data={completionChart}>
                              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                              <XAxis dataKey="name" axisLine={false} tickLine={false} />
                              <YAxis allowDecimals={false} axisLine={false} tickLine={false} />
                              <Tooltip />
                              <Bar dataKey="value" fill="#0ea5e9" radius={[12, 12, 0, 0]}>
                                <LabelList dataKey="value" position="top" />
                              </Bar>
                            </BarChart>
                          </ResponsiveContainer>
                        </div>
                        <div className="rounded-[1.6rem] bg-white p-4 ring-1 ring-slate-200">
                          <div className="mb-3 text-sm font-black text-slate-800">الحاضرون مقابل الغياب</div>
                          <ResponsiveContainer width="100%" height={240}>
                            <PieChart>
                              <Pie data={attendanceChart} dataKey="value" nameKey="name" innerRadius={50} outerRadius={85}>
                                {attendanceChart.map((entry, index) => <Cell key={entry.name} fill={index === 0 ? '#10b981' : '#f43f5e'} />)}
                              </Pie>
                              <Tooltip />
                            </PieChart>
                          </ResponsiveContainer>
                        </div>
                        <div className="rounded-[1.6rem] bg-white p-4 ring-1 ring-slate-200">
                          <div className="mb-3 text-sm font-black text-slate-800">توزيع الغياب حسب الفصول</div>
                          <ResponsiveContainer width="100%" height={240}>
                            <BarChart data={(selectedSessionSummary.classRows || []).length ? selectedSessionSummary.classRows : [{ name: 'لا توجد بيانات', absent: 0 }]}>
                              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                              <XAxis dataKey="name" axisLine={false} tickLine={false} />
                              <YAxis allowDecimals={false} axisLine={false} tickLine={false} />
                              <Tooltip />
                              <Bar dataKey="absent" fill="#f43f5e" radius={[10, 10, 0, 0]} />
                            </BarChart>
                          </ResponsiveContainer>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="mt-5 rounded-[1.5rem] bg-slate-50 p-4 ring-1 ring-slate-200">
                      <div className="text-sm font-black text-slate-800">تحضير المعلم</div>
                      <div className="mt-1 text-xs leading-6 text-slate-500">الجميع حاضر افتراضيًا. اضغط فقط على الغائب ثم احفظ مع الإقرار.</div>
                      {String(selectedSession.status || 'open') !== 'closed' ? (
                        <div className="mt-4 space-y-4">
                          <Select label="اختر الفصل" value={teacherClassKey} onChange={(e) => setTeacherClassKey(e.target.value)}>
                            <option value="">اختر الفصل</option>
                            {teacherClassrooms.map((row) => <option key={getClassroomKeyFromCompanyRow(row)} value={getClassroomKeyFromCompanyRow(row)}>{row.className ? `${row.className} — ${row.name}` : row.name} ({row.studentsCount})</option>)}
                          </Select>
                          {/* إذا سبق للمعلم التحضير ولم يطلب إعادة التحضير، نعرض رسالة الاعتماد وزر إعادة التحضير */}
                          {existingTeacherSubmission && !allowResubmit ? (
                            <div className="rounded-2xl bg-emerald-50 p-5 ring-1 ring-emerald-200">
                              <div className="flex items-center gap-3">
                                <span className="text-2xl">✅</span>
                                <div>
                                  <div className="font-black text-emerald-800">تم اعتماد التحضير بنجاح</div>
                                  <div className="mt-1 text-xs text-emerald-700">آخر حفظ: {new Date(existingTeacherSubmission.submittedAt).toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' })} — الغائبون: {existingTeacherSubmission.absentCount || 0} طالب</div>
                                </div>
                              </div>
                              <button onClick={() => { setAllowResubmit(true); setTeacherStatus(''); }} className="mt-4 w-full rounded-2xl bg-amber-500 px-4 py-3 text-sm font-black text-white hover:bg-amber-600 transition-colors">إعادة التحضير (تعديل)</button>
                            </div>
                          ) : (
                            <>
                              <div className="rounded-2xl bg-white p-4 ring-1 ring-slate-200">
                                <div className="flex items-center justify-between gap-3">
                                  <div className="font-black text-slate-900">قائمة الطلاب</div>
                                  <Badge tone="green">الجميع حاضر افتراضيًا</Badge>
                                </div>
                                <div className="mt-3 max-h-[22rem] overflow-auto space-y-2">
                                  {teacherClassStudents.length ? teacherClassStudents.map((student) => {
                                    const absent = teacherAbsentIds.includes(String(student.id));
                                    const aps = settings?.attendancePointsSystem;
                                    const apsEnabled = Boolean(aps?.enabled);
                                    const absentPointsImpact = apsEnabled ? -(safeNumber(aps?.dailyPresencePoints ?? 5) + safeNumber(aps?.absentDeductPoints ?? 3)) : null;
                                    return (
                                      <button key={student.id} onClick={() => toggleAbsent(student.id)} className={cx('flex w-full items-center justify-between rounded-2xl px-4 py-3 text-right ring-1 transition', absent ? 'bg-rose-50 text-rose-900 ring-rose-200' : 'bg-emerald-50 text-emerald-900 ring-emerald-200')}>
                                        <div>
                                          <div className="font-black">{student.name}</div>
                                          <div className="mt-1 text-xs opacity-80">{student.studentNumber || student.nationalId || '—'}</div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                          {apsEnabled && absent && absentPointsImpact !== null && (
                                            <span className="rounded-full bg-rose-100 px-2 py-0.5 text-xs font-black text-rose-700">{absentPointsImpact} نقطة</span>
                                          )}
                                          <span className="rounded-full bg-white/80 px-3 py-1 text-xs font-black">{absent ? 'غائب' : 'حاضر'}</span>
                                        </div>
                                      </button>
                                    );
                                  }) : <div className="rounded-2xl bg-slate-50 px-4 py-6 text-center text-sm font-bold text-slate-500">اختر الفصل لعرض الطلاب.</div>}
                                </div>
                              </div>
                              <label className="flex items-start gap-3 rounded-2xl bg-white px-4 py-3 text-sm font-bold text-slate-700 ring-1 ring-slate-200">
                                <input type="checkbox" checked={teacherAcknowledgement} onChange={(e) => setTeacherAcknowledgement(e.target.checked)} className="mt-1 h-4 w-4 rounded border-slate-300" />
                                <span>أقر بصحة التحضير لهذه الحصة وأن البيانات المدخلة مطابقة لواقع الفصل.</span>
                              </label>
                              <div className="flex flex-wrap items-center gap-3">
                                <button onClick={handleTeacherSubmit} className={`rounded-2xl px-5 py-3 text-sm font-black text-white transition-all duration-300 ${submitSuccess ? 'bg-emerald-600 scale-105 shadow-lg shadow-emerald-200' : 'bg-sky-700 hover:bg-sky-800'}`}>{submitSuccess ? '✓ تم الاعتماد بنجاح!' : 'اعتماد التحضير'}</button>
                                {allowResubmit ? <button onClick={() => { setAllowResubmit(false); setTeacherStatus(''); }} className="rounded-2xl bg-slate-200 px-4 py-3 text-sm font-black text-slate-700 hover:bg-slate-300 transition-colors">إلغاء التعديل</button> : null}
                                {teacherStatus ? <Badge tone={/تم/.test(teacherStatus) ? 'green' : 'amber'}>{teacherStatus}</Badge> : null}
                              </div>
                            </>
                          )}
                        </div>
                      ) : <div className="mt-4 rounded-2xl bg-amber-50 px-4 py-4 text-sm font-bold text-amber-900 ring-1 ring-amber-200">الجلسة الحالية مغلقة.</div>}
                    </div>
                  )}
                </div>
              </>
            ) : null}
          </div>
        </div>
      </SectionCard>
    </div>
  );
}

export default LessonAttendanceSessionsPage;

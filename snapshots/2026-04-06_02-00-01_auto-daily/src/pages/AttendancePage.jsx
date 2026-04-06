/**
 * ==========================================
 *  AttendancePage Component
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
import { MetricTile } from '../components/ui/FormElements';
import { SectionCard } from '../components/ui/SectionCard';


import LiveCameraPanel from '../components/LiveCameraPanel';
import { Badge } from '../components/ui/FormElements';
function AttendancePage({ selectedSchool, currentUser, attendanceMethod, setAttendanceMethod, scanLog, actionLog, settings, onScan, onFaceScanFile, onFaceScanDataUrl, onCreateGateLink, onDeleteGateLink, onUpdateGateLink, onCreateScreenLink, onDeleteScreenLink, onUpdateScreenLink, onSaveAttendanceBinding }) {
  const [scanValue, setScanValue] = useState("");
  const [filter, setFilter] = useState("all");
  const [faceFile, setFaceFile] = useState(null);
  const [facePreview, setFacePreview] = useState("");
  const [faceBusy, setFaceBusy] = useState(false);
  const [manualClassroomId, setManualClassroomId] = useState("");
  const [manualStudentId, setManualStudentId] = useState("");
  const hasStructureSource = useMemo(() => schoolHasStructureClassrooms(selectedSchool), [selectedSchool]);
  const attendanceBinding = useMemo(() => getSchoolAttendanceBinding(selectedSchool), [selectedSchool]);
  const attendanceSource = useMemo(() => getAttendanceStudentsSource(selectedSchool), [selectedSchool]);
  const attendanceStudents = attendanceSource.students || [];
  // نحدد مصدر الطلاب الفعلي للتحضير اليدوي
  // إذا كان attendanceStudents فارغاً (structure بدون طلاب)، نرجع لـ school.students
  const effectiveManualStudents = useMemo(() => {
    if (attendanceStudents.length > 0) return attendanceStudents;
    // fallback: نستخدم school.students مباشرة
    return (selectedSchool?.students || []).map((s) => ({
      ...s,
      id: s.id,
      name: s.name || s.fullName || 'طالب',
      fullName: s.name || s.fullName || 'طالب',
      barcode: s.barcode || s.studentNumber || String(s.id),
      companyId: s.companyId,
      classroomId: null,
      source: 'school',
    }));
  }, [attendanceStudents, selectedSchool?.students]);

  const manualClassrooms = useMemo(() => {
    if (attendanceSource.sourceMode === 'structure' && attendanceStudents.length > 0) {
      // وضع الهيكل المدرسي مع طلاب: نبني الفصول من attendanceStudents
      const map = {};
      attendanceStudents.forEach((s) => { if (s.classroomId && !map[s.classroomId]) map[s.classroomId] = s.classroomName || s.className || 'فصل'; });
      return Object.entries(map).map(([id, name]) => ({ id, name, type: 'structure' }));
    }
    // وضع المدرسة كاملة أو fallback: نبني الفصول من companies
    return (selectedSchool?.companies || []).map((c) => ({ id: String(c.id), name: c.name + (c.className ? ` (${c.className})` : ''), type: 'company' }));
  }, [attendanceStudents, attendanceSource.sourceMode, selectedSchool?.companies]);

  const manualStudentsInClass = useMemo(() => {
    if (!manualClassroomId) return [];
    if (attendanceSource.sourceMode === 'structure' && attendanceStudents.length > 0) {
      return attendanceStudents.filter((s) => String(s.classroomId) === String(manualClassroomId));
    }
    // وضع المدرسة كاملة أو fallback: نصفي بالشركة
    return effectiveManualStudents.filter((s) => String(s.companyId) === String(manualClassroomId));
  }, [manualClassroomId, attendanceStudents, effectiveManualStudents, attendanceSource.sourceMode]);

  const filteredLog = scanLog
    .filter((item) => item.schoolId === selectedSchool.id)
    .filter((item) => {
      if (filter === "all") return true;
      if (filter === "early") return item.result.includes("مبكر");
      if (filter === "ontime") return item.result.includes("في الوقت");
      if (filter === "late") return item.result.includes("تأخر");
      if (filter === "failed") return item.result.includes("فشل") || item.result.includes("مسبق");
      return true;
    });

  const enrolledFaceCount = attendanceStudents.filter((student) => getFaceProfileState(student) === "ready" || student.faceReady).length;

  const handleSubmit = () => {
    if (!scanValue.trim()) return;
    onScan(scanValue.trim());
    setScanValue("");
  };

  const handleManualSubmit = () => {
    if (!manualStudentId) return;
    // نبحث في attendanceStudents أولاً ثم effectiveManualStudents كـ fallback
    const student = attendanceStudents.find((s) => String(s.id) === String(manualStudentId))
      || effectiveManualStudents.find((s) => String(s.id) === String(manualStudentId));
    if (!student) {
      window.alert('لم يتم العثور على بيانات الطالب. حاول مجدداً.');
      return;
    }
    // نمرر skipDeviceCheck=true لأن التحضير اليدوي لا يحتاج تفعيل قارئ QR
    onScan(student.barcode || student.nationalId || student.name, { skipDeviceCheck: true });
    setManualStudentId("");
  };

  const handleFaceFile = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setFaceFile(file);
    setFacePreview(await fileToDataUrl(file));
    event.target.value = "";
  };


  const verifyFace = async () => {
    if (!faceFile) return null;
    setFaceBusy(true);
    try {
      const result = await onFaceScanFile(faceFile);
      if (result) {
        setFaceFile(null);
        setFacePreview("");
      }
      return result;
    } finally {
      setFaceBusy(false);
    }
  };

  const verifyFaceCamera = async (dataUrl) => {
    setFaceBusy(true);
    try {
      const result = await onFaceScanDataUrl(dataUrl);
      if (result) {
        setFaceFile(null);
        setFacePreview("");
      }
      return result;
    } finally {
      setFaceBusy(false);
    }
  };

  return (
    <div className="space-y-6">
      <SectionCard
        title="الحضور الذكي"
        icon={ScanLine}
        action={
          <div className="flex items-center gap-2 rounded-2xl bg-slate-100 p-1">
            <button onClick={() => setAttendanceMethod("barcode")} className={`rounded-xl px-3 py-2 text-sm font-bold ${attendanceMethod === "barcode" ? "bg-white shadow-sm" : "text-slate-600"}`}>QR</button>
            <button onClick={() => setAttendanceMethod("face")} className={`rounded-xl px-3 py-2 text-sm font-bold ${attendanceMethod === "face" ? "bg-white shadow-sm" : "text-slate-600"}`}>بصمة وجه</button>
          </div>
        }
      >
        <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
          <div className="space-y-6">
            <div className="rounded-3xl bg-white p-5 ring-1 ring-slate-200">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <div className="font-black text-slate-800">مصدر بيانات الحضور</div>
                  <div className="mt-1 text-sm text-slate-500">{hasStructureSource ? 'الهيكل المدرسي هو المصدر الافتراضي للحضور حاليًا، والمصدر القديم مخفي من الواجهة مع بقائه داخليًا كطبقة توافق مؤقتة.' : 'لا يوجد هيكل مدرسي مكتمل بعد، لذا يعمل الحضور على قاعدة المدرسة الأساسية مؤقتًا.'}</div>
                </div>
                <Badge tone={attendanceBinding.sourceMode === 'structure' ? 'violet' : 'blue'}>{attendanceSource.label}</Badge>
              </div>
              <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-3">
                <div className="rounded-2xl bg-violet-50 p-4 ring-1 ring-violet-200">
                  <div className="text-sm font-bold text-violet-800">المصدر المعتمد</div>
                  <div className="mt-2 text-lg font-black text-violet-900">{hasStructureSource ? 'الهيكل المدرسي (افتراضي)' : 'المدرسة الكاملة'}</div>
                  <div className="mt-1 text-xs text-violet-700">{hasStructureSource ? 'سيتم اعتماد طلاب الهيكل المدرسي تلقائيًا في الحضور.' : 'أكمِل بناء الهيكل المدرسي ليصبح هو المصدر الافتراضي.'}</div>
                </div>
                <div>
                  <label className="mb-2 block text-sm font-bold text-slate-700">الفصل المرتبط للحضور</label>
                  <select value={attendanceBinding.linkedClassroomId} disabled={!hasStructureSource} onChange={(e) => onSaveAttendanceBinding?.({ sourceMode: hasStructureSource ? 'structure' : 'school', linkedClassroomId: e.target.value })} className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 disabled:cursor-not-allowed disabled:opacity-60">
                    <option value="">{hasStructureSource ? 'جميع فصول الهيكل المدرسي' : 'لا يوجد هيكل مدرسي بعد'}</option>
                    {(selectedSchool?.structure?.classrooms || []).map((classroom) => <option key={classroom.id} value={String(classroom.id)}>{classroom.name}</option>)}
                  </select>
                </div>
                <div className="rounded-2xl bg-slate-50 p-4 ring-1 ring-slate-200">
                  <div className="text-sm font-bold text-slate-700">الطلاب المتاحون للحضور</div>
                  <div className="mt-2 text-3xl font-black text-slate-900">{attendanceStudents.length}</div>
                  <div className="mt-1 text-xs text-slate-500">{hasStructureSource ? 'من الهيكل المدرسي افتراضيًا' : 'من قاعدة المدرسة الأساسية'}</div>
                </div>
              </div>
            </div>
            <div className="rounded-3xl bg-white p-5 ring-1 ring-slate-200">
              <div className="mb-3 rounded-2xl bg-sky-50 px-4 py-3 text-sm font-bold text-sky-900 ring-1 ring-sky-200">التحضير اليدوي السريع</div>
              <div className="space-y-3">
                <div>
                  <label className="mb-1 block text-sm font-bold text-slate-700">اختر الفصل أولاً</label>
                  <select value={manualClassroomId} onChange={(e) => { setManualClassroomId(e.target.value); setManualStudentId(""); }} className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none">
                    <option value="">-- اختر الفصل --</option>
                    {manualClassrooms.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className={cx("mb-1 block text-sm font-bold", manualClassroomId ? "text-slate-700" : "text-slate-400")}>اختر الطالب</label>
                  <select value={manualStudentId} onChange={(e) => setManualStudentId(e.target.value)} disabled={!manualClassroomId} className={cx("w-full rounded-2xl border px-4 py-3 outline-none", manualClassroomId ? "border-slate-200 bg-white" : "border-slate-100 bg-slate-50 text-slate-400 cursor-not-allowed")}>
                    <option value="">{manualClassroomId ? `-- اختر الطالب (${manualStudentsInClass.length} طالب) --` : '-- يجب اختيار الفصل أولاً --'}</option>
                    {manualStudentsInClass.map((s) => <option key={s.id} value={s.id}>{s.name || s.fullName}</option>)}
                  </select>
                </div>
                <div className="flex gap-3">
                  <button onClick={handleManualSubmit} disabled={!manualStudentId} className={cx("flex-1 rounded-2xl px-5 py-3 font-bold", manualStudentId ? "bg-sky-700 text-white" : "bg-slate-200 text-slate-400 cursor-not-allowed")}>تسجيل الحضور</button>
                  <button onClick={() => { setManualClassroomId(""); setManualStudentId(""); }} className="rounded-2xl bg-slate-100 px-5 py-3 font-bold text-slate-700">مسح</button>
                </div>
              </div>
            </div>
            <div className="rounded-3xl border border-dashed border-slate-300 bg-slate-50 p-5">
              <div className="mb-4 flex items-center gap-3">
                {attendanceMethod === "barcode" ? <QrCode className="h-6 w-6" /> : <Camera className="h-6 w-6" />}
                <div>
                  <div className="font-bold text-slate-800">{attendanceMethod === "barcode" ? "قارئ QR عند البوابة" : "بوابة بصمة الوجه"}</div>
                  <div className="text-sm text-slate-500">يسجل اليوم والوقت والطريقة ويحدّث نقاط الطالب والشركة فورًا</div>
                </div>
              </div>

              {attendanceMethod === "barcode" ? (
                <div className="space-y-4">
                  <LiveCameraPanel mode="barcode" title="التقاط مباشر لـ QR" description="يمكنك تشغيل كاميرا اللابتوب أو الآيباد أو الجوال وقراءة QR الطالب مباشرة من البوابة." onDetectBarcode={(value) => { setScanValue(value); onScan(value); }} onResolveBarcodeLabel={(barcode) => { const normalizedBarcode = sanitizeBarcodeValue(barcode); const s = attendanceStudents.find((st) => sanitizeBarcodeValue(st.barcode || '') === normalizedBarcode || String(st.studentNumber || '') === String(barcode || '') || String(st.nationalId || '') === String(barcode || '') || String(st.identityNumber || '') === String(barcode || '')); if (s) return s.name || s.fullName || null; const fallback = (selectedSchool?.students || []).find((st) => sanitizeBarcodeValue(st.barcode || '') === normalizedBarcode); return fallback ? (fallback.name || fallback.fullName || null) : null; }} />
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="rounded-2xl bg-white p-4 ring-1 ring-slate-200">
                    <div className="text-sm font-bold text-slate-700">الطلاب المسجلون للوجه</div>
                    <div className="mt-1 text-2xl font-black text-slate-800">{enrolledFaceCount}</div>
                    <div className="mt-1 text-xs text-slate-500">من أصل {attendanceStudents.length} طالب</div>
                  </div>
                  <div className="flex flex-wrap gap-3">
                    <label className="inline-flex cursor-pointer items-center gap-2 rounded-2xl bg-sky-700 px-4 py-3 text-sm font-bold text-white">
                      <Upload className="h-4 w-4" /> رفع صورة / اختيار من الجهاز
                      <input type="file" accept="image/*" capture="user" className="hidden" onChange={handleFaceFile} />
                    </label>
                    <button onClick={verifyFace} disabled={!faceFile || faceBusy} className={cx("rounded-2xl px-4 py-3 text-sm font-bold", !faceFile || faceBusy ? "bg-slate-200 text-slate-500" : "bg-emerald-600 text-white")}>{faceBusy ? "جارٍ التحقق..." : "تحقق من الصورة المرفوعة"}</button>
                  </div>
                  {facePreview ? <img src={facePreview} alt="معاينة الوجه" className="h-56 w-full rounded-2xl object-cover ring-1 ring-slate-200" /> : <div className="flex h-56 items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-white text-sm text-slate-500">ارفع صورة وجه واضحة ليتم التعرف على الطالب</div>}
                  <LiveCameraPanel mode="face" title="مطابقة مباشرة للوجه" description="افتح الكاميرا وسيجري التحقق تلقائيًا مباشرة من اللابتوب أو الآيباد أو الجوال دون الحاجة إلى ضغط زر التصوير. وزر الالتقاط موجود فقط كخيار احتياطي." onDetectFace={verifyFaceCamera} onCapture={verifyFaceCamera} />
                  <div className="text-xs leading-6 text-slate-500">التحقق هنا محلي وتجريبي داخل المتصفح، ومناسب كبداية قبل ربط خوارزمية أو مزود تعرّف احترافي.</div>
                </div>
              )}
            </div>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <MetricTile label="نهاية الحضور المبكر" value={settings.policy.earlyEnd} />
              <MetricTile label="نهاية الحضور في الوقت" value={settings.policy.onTimeEnd} />
              <MetricTile label="منع التكرار" value={settings.devices.duplicateScanBlocked ? "مفعل" : "غير مفعل"} />
              <MetricTile label="جاهزية الوجه" value={settings.devices.faceEnabled ? "مفعل" : "مغلق"} />
            </div>
          </div>
          <div className="overflow-hidden rounded-3xl bg-white ring-1 ring-slate-200">
            <div className="flex items-center justify-between gap-3 border-b border-slate-100 px-4 py-3">
              <div className="font-bold text-slate-700">سجل عمليات البوابة</div>
              <div className="flex items-center gap-2">
                <select value={filter} onChange={(e) => setFilter(e.target.value)} className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm">
                  <option value="all">الكل</option>
                  <option value="early">مبكر</option>
                  <option value="ontime">في الوقت</option>
                  <option value="late">متأخر</option>
                  <option value="failed">مرفوض / فشل</option>
                </select>
              </div>
            </div>
            <div className="max-h-[540px] overflow-auto divide-y divide-slate-100">
              {filteredLog.map((item) => (
                <div key={item.id} className="flex items-start justify-between gap-4 px-4 py-3">
                  <div>
                    <div className="font-bold text-slate-800">{item.student}</div>
                    <div className="text-sm text-slate-500">{item.method} • {item.date} • {item.time}</div>
                    <div className="font-mono text-xs text-slate-400">{item.barcode}</div>
                  </div>
                  <div className="space-y-2 text-left">
                    <Badge tone={resultTone(item.result)}>{item.result}</Badge>
                    {!item.result.includes("فشل") && !item.result.includes("مسبق") ? <div className="text-xs font-bold text-emerald-700">{item.deltaPoints > 0 ? `+${item.deltaPoints}` : item.deltaPoints} نقطة</div> : null}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </SectionCard>

    </div>
  );
}

export default AttendancePage;

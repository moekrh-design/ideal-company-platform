/**
 * ==========================================
 *  StudentsPage Component
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


import LiveCameraPanel from '../components/LiveCameraPanel';
import { Badge } from '../components/ui/FormElements';
import { BarcodeCard } from '../components/ui/BarcodeCard';
function StudentsPage({ selectedSchool, onAddStudent, onDeleteStudent, onAwardBehavior, onEnrollFace, onEnrollFaceDataUrl, onClearFace, onDownloadStudentCard, onDownloadAllCards }) {
  const [activeTab, setActiveTab] = useState('pick');
  const [search, setSearch] = useState("");
  const unifiedStudents = useMemo(() => getUnifiedSchoolStudents(selectedSchool, { includeArchived: false, preferStructure: true }), [selectedSchool]);
  const unifiedCompanies = useMemo(() => getUnifiedCompanyRows(selectedSchool, { preferStructure: true }), [selectedSchool]);
  const structureDefault = schoolHasStructureClassrooms(selectedSchool);
  const hasStructureCompanies = unifiedCompanies.some((company) => company.source === 'structure');
  const [selectedStudentId, setSelectedStudentId] = useState(unifiedStudents[0]?.id || null);
  const [selectedGroupId, setSelectedGroupId] = useState('all');
  const [form, setForm] = useState({
    name: "",
    nationalId: "",
    grade: "",
    companyId: String(unifiedCompanies[0]?.rawId || unifiedCompanies[0]?.id || ""),
    faceReady: false,
  });
  const [faceBusy, setFaceBusy] = useState(false);
  const [facePreviewDataUrl, setFacePreviewDataUrl] = useState(null); // معاينة الصورة قبل الحفظ

  useEffect(() => {
    setForm((prev) => ({ ...prev, companyId: String(unifiedCompanies[0]?.rawId || unifiedCompanies[0]?.id || "") }));
    setSelectedStudentId(getUnifiedSchoolStudents(selectedSchool, { includeArchived: false, preferStructure: true })[0]?.id || null);
    setSelectedGroupId('all');
    setActiveTab('pick');
  }, [selectedSchool]);

  const students = useMemo(
    () => {
      const normalizedSearch = normalizeSearchToken(search);
      const lowerSearch = String(search || '').toLowerCase().trim();
      return unifiedStudents.filter((student) => {
        const studentGroupId = String(student.source === 'structure' ? (student.classroomId || '') : (student.companyId || ''));
        if (selectedGroupId !== 'all' && studentGroupId !== String(selectedGroupId)) return false;
        const values = [student.name, student.fullName, student.barcode, student.nationalId, student.guardianMobile, student.studentNumber, student.className, student.companyName, student.rawId, student.id];
        return values.some((value) => {
          const text = String(value || '');
          return text.includes(search)
            || normalizeSearchToken(text) === normalizedSearch
            || normalizeSearchToken(text).includes(normalizedSearch)
            || text.toLowerCase().includes(lowerSearch);
        });
      });
    },
    [unifiedStudents, search, selectedGroupId],
  );

  const featuredStudent = unifiedStudents.find((student) => String(student.id) === String(selectedStudentId)) || students[0] || unifiedStudents[0];
  const featuredCompany = unifiedCompanies.find((company) => (featuredStudent?.source === 'structure' ? String(company.rawId || company.id) === String(featuredStudent.classroomId) : String(company.id) === String(featuredStudent?.companyId)));
  const selectedGroup = unifiedCompanies.find((company) => String(company.rawId || company.id) === String(selectedGroupId) || String(company.id) === String(selectedGroupId));

  const handleFaceFile = async (event) => {
    const file = event.target.files?.[0];
    if (!file || !featuredStudent) return;
    setFaceBusy(true);
    try {
      await onEnrollFace(featuredStudent.id, file);
    } finally {
      setFaceBusy(false);
      event.target.value = "";
    }
  };

  const handleFaceCameraCapture = async (dataUrl) => {
    if (!featuredStudent) {
      window.alert('اختر طالباً أولاً قبل تسجيل البصمة.');
      return null;
    }
    // عرض معاينة الصورة بدلاً من الحفظ المباشر
    setFacePreviewDataUrl(dataUrl);
    // إرجاع قيمة حتى تتوقف الكاميرا وتعرض رسالة نجاح الالتقاط
    return { name: featuredStudent.name, enrolled: false, preview: true };
  };

  const handleFacePreviewSave = async () => {
    if (!featuredStudent || !facePreviewDataUrl) return;
    setFaceBusy(true);
    try {
      await onEnrollFaceDataUrl(featuredStudent.id, facePreviewDataUrl);
      setFacePreviewDataUrl(null);
    } catch (err) {
      window.alert(err?.message || 'تعذر تسجيل بصمة الوجه.');
    } finally {
      setFaceBusy(false);
    }
  };

  const handleFacePreviewDiscard = () => {
    setFacePreviewDataUrl(null);
  };


  const exportColumns = [
    { key: "name", label: "اسم الطالب" },
    { key: "studentNumber", label: "رقم الطالب" },
    { key: "grade", label: "الصف" },
    { key: "grouping", label: "الفصل", render: (row) => getStudentGroupingLabel(row, selectedSchool) },
    { key: "barcode", label: "الباركود" },
    { key: "attendanceRate", label: "الحضور", render: (row) => `${safeNumber(row.attendanceRate)}%` },
    { key: "points", label: "النقاط" },
    { key: "face", label: "بصمة الوجه", render: (row) => getFaceProfileLabel(row) },
  ];

  const exportStudentsExcel = () => {
    exportRowsToWorkbook(
      `${selectedSchool?.code || 'school'}-students.xlsx`,
      'Students',
      students,
      exportColumns,
    );
  };

  const exportStudentsCsv = () => {
    downloadFile(
      `${selectedSchool?.code || 'school'}-students.csv`,
      buildCsv(students, exportColumns),
      'text/csv;charset=utf-8;',
    );
  };

  const printCurrentBarcode = async () => {
    if (!featuredStudent) return;
    const qrDataUrl = await generateQrDataUrl(featuredStudent.barcode || featuredStudent.studentNumber || featuredStudent.id, 220);
    printHtmlContent(
      `بطاقة الطالب - ${featuredStudent.name}`,
      `
      <div style="max-width:760px;margin:0 auto">
        <h1>بطاقة باركود الطالب</h1>
        <div class="meta">${selectedSchool?.name || "—"} — ${getStudentGroupingLabel(featuredStudent, selectedSchool)}</div>
        <div style="display:grid;grid-template-columns:280px 1fr;gap:20px;align-items:center;border:1px solid #e2e8f0;border-radius:24px;padding:24px">
          <div style="text-align:center">
            <img src="${qrDataUrl}" alt="QR" style="width:220px;height:220px;object-fit:contain" />
            <div style="margin-top:10px;font-family:monospace;font-size:15px">${featuredStudent.barcode || '—'}</div>
          </div>
          <div>
            <div style="font-size:28px;font-weight:800;color:#0f172a">${featuredStudent.name}</div>
            <div style="margin-top:12px;color:#475569;font-size:15px">رقم الطالب: ${featuredStudent.studentNumber || featuredStudent.id}</div>
            <div style="margin-top:8px;color:#475569;font-size:15px">الصف: ${featuredStudent.grade || '—'}</div>
            <div style="margin-top:8px;color:#475569;font-size:15px">الفصل: ${getStudentGroupingLabel(featuredStudent, selectedSchool)}</div>
            <div style="margin-top:8px;color:#475569;font-size:15px">الهوية: ${featuredStudent.nationalId || '—'}</div>
          </div>
        </div>
      </div>
      `,
    );
  };

  // طباعة باركودات الفصل المختار - A4 عمودين خمس بطاقات
  const printClassBarcodes = async () => {
    const classStudents = selectedGroupId === 'all' ? unifiedStudents : students;
    if (!classStudents || classStudents.length === 0) {
      alert('لا يوجد طلاب في الفصل المختار');
      return;
    }
    const groupLabel = selectedGroup ? (selectedGroup.className ? `${selectedGroup.className} — ${selectedGroup.name}` : selectedGroup.name) : 'جميع الطلاب';
    const schoolName = selectedSchool?.name || '—';

    // توليد QR لكل طالب
    const cardsData = await Promise.all(
      classStudents.map(async (student) => {
        const qrValue = student.barcode || student.studentNumber || student.id || '';
        const qrUrl = await generateQrDataUrl(qrValue, 160);
        return { student, qrUrl };
      })
    );

    // بناء HTML البطاقات
    const cardsHtml = cardsData.map(({ student, qrUrl }) => `
      <div class="card">
        <div class="card-qr">
          <img src="${qrUrl}" alt="QR" />
        </div>
        <div class="card-info">
          <div class="card-name">${student.name || student.fullName || '—'}</div>
          <div class="card-meta">${schoolName}</div>
          <div class="card-meta">${groupLabel}</div>
          <div class="card-barcode">${student.barcode || student.studentNumber || '—'}</div>
        </div>
      </div>
    `).join('');

    const printWindow = window.open('', '_blank', 'width=1000,height=900');
    if (!printWindow) return;
    printWindow.document.write(`<!doctype html>
<html lang="ar" dir="rtl">
<head>
  <meta charset="utf-8" />
  <title>باركودات الفصل — ${groupLabel}</title>
  <style>
    * { box-sizing: border-box; -webkit-print-color-adjust: exact; print-color-adjust: exact; margin: 0; padding: 0; }
    body {
      font-family: "Tahoma", "Arial", sans-serif;
      background: #fff;
      direction: rtl;
      padding: 10mm;
    }
    .page-header {
      text-align: center;
      margin-bottom: 8mm;
      padding-bottom: 4mm;
      border-bottom: 2px solid #0f172a;
    }
    .page-header h1 {
      font-size: 18px;
      font-weight: 800;
      color: #0f172a;
    }
    .page-header p {
      font-size: 12px;
      color: #475569;
      margin-top: 3px;
    }
    .cards-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 5mm;
    }
    .card {
      display: flex;
      flex-direction: row;
      align-items: center;
      gap: 4mm;
      border: 1.5px solid #cbd5e1;
      border-radius: 8px;
      padding: 4mm 5mm;
      background: #fff;
      page-break-inside: avoid;
      min-height: 38mm;
      max-height: 42mm;
    }
    .card-qr img {
      width: 30mm;
      height: 30mm;
      object-fit: contain;
      display: block;
    }
    .card-info {
      flex: 1;
      overflow: hidden;
    }
    .card-name {
      font-size: 13px;
      font-weight: 800;
      color: #0f172a;
      line-height: 1.3;
      margin-bottom: 2mm;
    }
    .card-meta {
      font-size: 10px;
      color: #475569;
      line-height: 1.5;
    }
    .card-barcode {
      font-family: monospace;
      font-size: 10px;
      color: #64748b;
      margin-top: 2mm;
      letter-spacing: 0.5px;
    }
    @media print {
      body { padding: 8mm; }
      @page {
        size: A4 portrait;
        margin: 8mm;
      }
    }
  </style>
</head>
<body>
  <div class="page-header">
    <h1>باركودات الفصل — ${groupLabel}</h1>
    <p>${schoolName} &nbsp;|&nbsp; عدد الطلاب: ${cardsData.length}</p>
  </div>
  <div class="cards-grid">
    ${cardsHtml}
  </div>
</body>
</html>`);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => { printWindow.print(); }, 350);
  };

  const columns = [
    { key: "name", label: "اسم الطالب" },
    { key: "studentNumber", label: "رقم الطالب" },
    { key: "grade", label: "الصف" },
    { key: "companyId", label: "الشركة", render: (row) => row.companyName || row.className || unifiedCompanies.find((company) => String(company.id) === String(row.companyId) || String(company.rawId || '') === String(row.companyId))?.name || "—" },
    { key: "barcode", label: "QR" },
    { key: "attendanceRate", label: "الحضور", render: (row) => `${row.attendanceRate}%` },
    { key: "points", label: "النقاط" },
    { key: "faceReady", label: "بصمة الوجه", render: (row) => <Badge tone={getFaceProfileTone(row)}>{getFaceProfileLabel(row)}</Badge> },
    {
      key: "actions",
      label: "الإجراء",
      render: (row) => (
        <div className="flex flex-wrap gap-2">
          <button onClick={() => setSelectedStudentId(row.id)} className="rounded-xl bg-sky-50 px-3 py-2 font-bold text-sky-700">بطاقة</button>
          {row.source === 'structure' ? <span className="rounded-xl bg-slate-100 px-3 py-2 text-xs font-bold text-slate-600">إدارة الطالب من الهيكل المدرسي</span> : <>
          <button onClick={() => onAwardBehavior(row.id)} className="rounded-xl bg-amber-50 px-3 py-2 font-bold text-amber-700">+ سلوك</button>
          <button onClick={() => onDeleteStudent(row.id)} className="rounded-xl bg-rose-50 px-3 py-2 font-bold text-rose-700">حذف</button>
          </>}
        </div>
      ),
    },
  ];


  const submit = (e) => {
    e.preventDefault();
    if (structureDefault) return;
    if (!form.name || !form.grade || !form.companyId) return;
    onAddStudent({ ...form, companyId: Number(form.companyId) });
    setForm({ name: "", nationalId: "", grade: "", companyId: String(unifiedCompanies[0]?.rawId || unifiedCompanies[0]?.id || ""), faceReady: false });
  };

  return (
    <div className="space-y-6">
      <SectionCard title="إدارة الطلاب والبطاقات" icon={GraduationCap} action={<Badge tone="blue">{selectedSchool?.name || "—"}</Badge>}>
        <div className="space-y-5">
          <div className="grid grid-cols-1 gap-3 lg:grid-cols-[1fr_auto] lg:items-end">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-[260px_1fr]">
              <Select label="اختيار الصف / الفصل" value={selectedGroupId} onChange={(e) => setSelectedGroupId(e.target.value)}>
                <option value="all">كل الفصول</option>
                {unifiedCompanies.map((company) => <option key={company.id} value={company.rawId || company.id}>{company.className ? `${company.className} — ${company.name}` : company.name}</option>)}
              </Select>
              <div className="relative">
                <Search className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="بحث باسم الطالب أو رقمه أو QR أو الهوية" className="w-full rounded-2xl border border-slate-200 bg-white py-3 pr-9 pl-4 text-sm outline-none" />
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              <button type="button" onClick={exportStudentsExcel} className="inline-flex items-center gap-2 rounded-2xl bg-emerald-600 px-4 py-3 text-sm font-black text-white"><Download className="h-4 w-4" /> تصدير Excel</button>
              <button type="button" onClick={exportStudentsCsv} className="inline-flex items-center gap-2 rounded-2xl bg-sky-700 px-4 py-3 text-sm font-black text-white"><Download className="h-4 w-4" /> تصدير CSV</button>
              <button type="button" onClick={printCurrentBarcode} className="inline-flex items-center gap-2 rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm font-black text-slate-700"><Printer className="h-4 w-4" /> طباعة الباركود</button>
              <button type="button" onClick={printClassBarcodes} className="inline-flex items-center gap-2 rounded-2xl border border-emerald-300 bg-emerald-50 px-4 py-3 text-sm font-black text-emerald-700"><Printer className="h-4 w-4" /> طباعة باركود الفصل</button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
            <div className="rounded-2xl bg-slate-50 p-4 ring-1 ring-slate-200"><div className="text-xs text-slate-500">إجمالي الطلاب</div><div className="mt-1 text-2xl font-black text-slate-900">{unifiedStudents.length}</div></div>
            <div className="rounded-2xl bg-slate-50 p-4 ring-1 ring-slate-200"><div className="text-xs text-slate-500">الظاهرون الآن</div><div className="mt-1 text-2xl font-black text-slate-900">{students.length}</div></div>
            <div className="rounded-2xl bg-slate-50 p-4 ring-1 ring-slate-200"><div className="text-xs text-slate-500">الفصل المختار</div><div className="mt-1 text-sm font-black text-slate-900">{selectedGroup?.name || 'كل الفصول'}</div></div>
            <div className="rounded-2xl bg-slate-50 p-4 ring-1 ring-slate-200"><div className="text-xs text-slate-500">بصمة وجه جاهزة</div><div className="mt-1 text-2xl font-black text-slate-900">{students.filter((item) => getFaceProfileState(item) === 'ready').length}</div></div>
          </div>

          <div className="grid grid-cols-1 gap-2 rounded-2xl bg-slate-100 p-1 md:grid-cols-2">
            {[['pick','اختيار الطالب'], ['bio','البصمة والباركود']].map(([key,label]) => (
              <button key={key} onClick={() => setActiveTab(key)} className={cx('rounded-2xl px-4 py-3 text-sm font-black transition', activeTab === key ? 'bg-white text-sky-700 shadow-sm' : 'text-slate-600')}>{label}</button>
            ))}
          </div>

          {activeTab === 'pick' ? (
            <div className="grid grid-cols-1 gap-6 xl:grid-cols-[420px,1fr]">
              <div className="space-y-4">
                <div className="rounded-[1.75rem] bg-slate-50 p-5 ring-1 ring-slate-200">
                  <div className="text-sm font-bold text-slate-500">اختيار سريع</div>
                  <Select label="اختر الطالب" value={featuredStudent?.id || ''} onChange={(e) => { setSelectedStudentId(e.target.value); }}>
                    {(students.length ? students : unifiedStudents).map((student) => <option key={student.id} value={student.id}>{student.name} — {student.studentNumber || student.rawId || student.id}</option>)}
                  </Select>
                  <div className="mt-3 text-xs text-slate-500">تظهر بيانات الطالب المختار فقط بدل عرض جميع الأسماء في الجدول.</div>
                  <div className="mt-4 grid grid-cols-2 gap-3">
                    <div className="rounded-2xl bg-white p-4 ring-1 ring-slate-200"><div className="text-xs text-slate-500">عدد النتائج</div><div className="mt-1 text-xl font-black text-slate-900">{students.length}</div></div>
                    <div className="rounded-2xl bg-white p-4 ring-1 ring-slate-200"><div className="text-xs text-slate-500">الطالب الحالي</div><div className="mt-1 text-sm font-black text-slate-900">{featuredStudent?.name || '—'}</div></div>
                  </div>
                </div>

                {structureDefault ? <div className="rounded-2xl border border-dashed border-sky-200 bg-sky-50 p-4 text-sm leading-7 text-sky-800">مصدر الطلاب الافتراضي هنا هو <span className="font-black">الهيكل المدرسي</span>. إضافة وحذف ونقل الطلاب يتم من صفحة الهيكل المدرسي لضمان بقاء البيانات موحدة.</div> : null}
                {hasStructureCompanies ? <div className="rounded-3xl border border-dashed border-sky-200 bg-sky-50 p-5 text-sm leading-7 text-sky-800">يتم الآن اعتماد الفصول من <span className="font-black">الهيكل المدرسي</span> كمصدر افتراضي. يمكن الإضافة والتعديل من صفحة الهيكل المدرسي.</div> : null}
              </div>

              <div className="space-y-4">
                {featuredStudent ? (
                  <div className="rounded-[1.75rem] bg-white p-5 ring-1 ring-slate-200">
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                      <div>
                        <div className="text-2xl font-black text-slate-900">{featuredStudent.name}</div>
                        <div className="mt-2 text-sm text-slate-500">رقم الطالب: {featuredStudent.studentNumber || featuredStudent.id}</div>
                        <div className="mt-1 text-sm text-slate-500">الفصل: {getStudentGroupingLabel(featuredStudent, selectedSchool)}</div>
                        <div className="mt-1 text-sm text-slate-500">الهوية: {featuredStudent.nationalId || '—'}</div>
                        <div className="mt-1 text-sm text-slate-500">الباركود: <span className="font-mono">{featuredStudent.barcode || '—'}</span></div>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        <Badge tone="blue">{featuredStudent.points} نقطة</Badge>
                        <Badge tone={getFaceProfileTone(featuredStudent)}>{getFaceProfileLabel(featuredStudent)}</Badge>
                      </div>
                    </div>

                    <div className="mt-5 grid grid-cols-2 gap-3 md:grid-cols-4">
                      <div className="rounded-2xl bg-slate-50 p-4 ring-1 ring-slate-200"><div className="text-xs text-slate-500">الحضور</div><div className="mt-1 text-xl font-black text-slate-900">{featuredStudent.attendanceRate || 0}%</div></div>
                      <div className="rounded-2xl bg-slate-50 p-4 ring-1 ring-slate-200"><div className="text-xs text-slate-500">النقاط</div><div className="mt-1 text-xl font-black text-slate-900">{featuredStudent.points || 0}</div></div>
                      <div className="rounded-2xl bg-slate-50 p-4 ring-1 ring-slate-200"><div className="text-xs text-slate-500">الصف</div><div className="mt-1 text-sm font-black text-slate-900">{featuredStudent.grade || '—'}</div></div>
                      <div className="rounded-2xl bg-slate-50 p-4 ring-1 ring-slate-200"><div className="text-xs text-slate-500">الفصل</div><div className="mt-1 text-sm font-black text-slate-900">{featuredCompany?.name || selectedGroup?.name || '—'}</div></div>
                    </div>

                    <div className="mt-5 flex flex-wrap gap-2">
                      <button type="button" onClick={() => setActiveTab('bio')} className="rounded-2xl bg-sky-700 px-4 py-3 text-sm font-black text-white">فتح البصمة والباركود</button>
                      <button type="button" onClick={() => onDownloadStudentCard(featuredStudent.id)} className="rounded-2xl bg-slate-100 px-4 py-3 text-sm font-bold text-slate-700">تحميل بطاقة الطالب</button>
                      <button type="button" onClick={printCurrentBarcode} className="rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm font-black text-slate-700">طباعة الباركود</button>
                      <button type="button" onClick={() => onAwardBehavior(featuredStudent.id)} className="rounded-2xl bg-amber-50 px-4 py-3 text-sm font-bold text-amber-700">+ سلوك</button>
                      {featuredStudent.source === 'structure' ? null : <button type="button" onClick={() => onDeleteStudent(featuredStudent.id)} className="rounded-2xl bg-rose-50 px-4 py-3 text-sm font-bold text-rose-700">حذف الطالب</button>}
                    </div>
                  </div>
                ) : (
                  <div className="rounded-[1.75rem] border border-dashed border-slate-300 bg-slate-50 p-10 text-center text-sm font-bold text-slate-500">لا يوجد طالب ضمن الفلتر الحالي. اختر فصلًا آخر أو غيّر عبارة البحث.</div>
                )}

                {!structureDefault && !hasStructureCompanies ? <form onSubmit={submit} className="rounded-3xl bg-slate-50 p-5 ring-1 ring-slate-200">
                  <div className="mb-4 flex items-center gap-2 font-extrabold text-slate-800"><Plus className="h-5 w-5" /> إضافة طالب جديد</div>
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <Input label="اسم الطالب" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="الاسم الرباعي" />
                    <Input label="رقم الهوية/الإقامة" value={form.nationalId} onChange={(e) => setForm({ ...form, nationalId: e.target.value })} placeholder="اختياري في النموذج" />
                    <Input label="الصف" value={form.grade} onChange={(e) => setForm({ ...form, grade: e.target.value })} placeholder="مثال: الأول متوسط" />
                    <Select label="الشركة" value={form.companyId} onChange={(e) => setForm({ ...form, companyId: e.target.value })}>
                      {unifiedCompanies.map((company) => <option key={company.id} value={company.rawId || company.id}>{company.className ? `${company.className} – ${company.name}` : company.name}</option>)}
                    </Select>
                  </div>
                  <label className="mt-4 flex cursor-pointer items-center gap-3 rounded-2xl bg-white px-4 py-3 ring-1 ring-slate-200">
                    <input type="checkbox" checked={form.faceReady} onChange={(e) => setForm({ ...form, faceReady: e.target.checked })} />
                    <span className="text-sm font-bold text-slate-700">تفعيل مسار بصمة الوجه لهذا الطالب عند الإنشاء</span>
                  </label>
                  <button type="submit" className="mt-4 inline-flex items-center gap-2 rounded-2xl bg-sky-700 px-5 py-3 font-bold text-white"><Wand2 className="h-4 w-4" /> إنشاء الطالب وتوليد الرقم وQR</button>
                </form> : null}
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1fr,360px]">
              <div className="space-y-4">
                {featuredStudent ? (
                  <BarcodeCard
                    student={featuredStudent}
                    companyName={featuredCompany?.name || "—"}
                    schoolName={selectedSchool?.name || "—"}
                    action={
                      <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
                        <button onClick={() => onDownloadStudentCard(featuredStudent.id)} className="rounded-2xl bg-slate-100 px-4 py-3 text-sm font-bold text-slate-700">تحميل بطاقة الطالب</button>
                        <button onClick={onDownloadAllCards} className="rounded-2xl bg-slate-100 px-4 py-3 text-sm font-bold text-slate-700">بطاقات المدرسة</button>
                      </div>
                    }
                  />
                ) : null}
                {featuredStudent ? (
                  <div className="space-y-4 rounded-3xl bg-slate-50 p-4 ring-1 ring-slate-200">
                    <div>
                      <div className="font-bold text-slate-800">تسجيل بصمة الوجه</div>
                      <div className="mt-2 text-sm leading-7 text-slate-600">اختر الطالب أولًا ثم التقط صورة الوجه. ستظهر الصورة للمراجعة قبل الحفظ.</div>
                    </div>

                    {facePreviewDataUrl ? (
                      /* مرحلة المعاينة - بعد الالتقاط وقبل الحفظ */
                      <div className="space-y-3">
                        <div className="relative">
                          <img src={facePreviewDataUrl} alt="معاينة الوجه" className="h-56 w-full rounded-2xl object-cover ring-2 ring-emerald-400" />
                          <div className="absolute top-2 right-2 rounded-xl bg-amber-500 px-3 py-1 text-xs font-bold text-white shadow">لم تُحفظ بعد</div>
                        </div>
                        <div className="rounded-2xl bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-800 ring-1 ring-emerald-200">
                          ✅ تم التقاط الصورة. تحقق من جودتها ثم اختر أحد الخيارات أدناه.
                        </div>
                        <div className="flex flex-wrap gap-3">
                          <button
                            onClick={handleFacePreviewSave}
                            disabled={faceBusy}
                            className="inline-flex items-center gap-2 rounded-2xl bg-emerald-600 px-5 py-3 text-sm font-bold text-white shadow-sm disabled:opacity-60 hover:bg-emerald-700 active:scale-95 transition-all"
                          >
                            {faceBusy ? (
                              <>جارٍ الحفظ...</>
                            ) : (
                              <>✓ حفظ البصمة</>
                            )}
                          </button>
                          <button
                            onClick={handleFacePreviewDiscard}
                            disabled={faceBusy}
                            className="inline-flex items-center gap-2 rounded-2xl bg-amber-50 px-5 py-3 text-sm font-bold text-amber-700 ring-1 ring-amber-200 disabled:opacity-60 hover:bg-amber-100 active:scale-95 transition-all"
                          >
                            ↺ إعادة الالتقاط
                          </button>
                          <button
                            onClick={() => { handleFacePreviewDiscard(); onClearFace(featuredStudent.id); }}
                            disabled={faceBusy}
                            className="rounded-2xl bg-rose-50 px-5 py-3 text-sm font-bold text-rose-700 ring-1 ring-rose-200 disabled:opacity-60 hover:bg-rose-100 active:scale-95 transition-all"
                          >
                            حذف البصمة
                          </button>
                        </div>
                      </div>
                    ) : (
                      /* الحالة العادية - عرض الصورة المحفوظة وأدوات الالتقاط */
                      <>
                        {featuredStudent.facePhoto ? (
                          <img src={featuredStudent.facePhoto} alt={featuredStudent.name} className="h-44 w-full rounded-2xl object-cover ring-1 ring-slate-200" />
                        ) : (
                          <div className="flex h-44 items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-white text-sm text-slate-500">لا توجد صورة وجه مسجلة بعد</div>
                        )}
                        <div className="flex flex-wrap gap-3">
                          <label className="inline-flex cursor-pointer items-center gap-2 rounded-2xl bg-sky-700 px-4 py-3 text-sm font-bold text-white">
                            <Upload className="h-4 w-4" /> رفع صورة وجه
                            <input type="file" accept="image/*" capture="user" className="hidden" onChange={handleFaceFile} />
                          </label>
                          {featuredStudent.facePhoto ? (
                            <button onClick={() => onClearFace(featuredStudent.id)} className="rounded-2xl bg-rose-50 px-4 py-3 text-sm font-bold text-rose-700">حذف البصمة</button>
                          ) : null}
                        </div>
                        <LiveCameraPanel
                          mode="face"
                          title="التقاط مباشر"
                          description="اضغط 'التقاط احتياطي' أسفل الكاميرا لالتقاط صورة الوجه. ستظهر الصورة للمراجعة قبل الحفظ."
                          onCapture={handleFaceCameraCapture}
                        />
                      </>
                    )}
                  </div>
                ) : null}
              </div>
              <div className="space-y-4">
                <div className="rounded-3xl bg-white p-5 ring-1 ring-slate-200">
                  <div className="font-black text-slate-800">لوحة الطالب المحدد</div>
                  <div className="mt-2 text-sm text-slate-500">كل ما يتعلق بالطالب المختار موجود هنا: الباركود، البطاقة، بصمة الوجه، والحالة الحالية.</div>
                  {featuredStudent ? <div className="mt-4 space-y-3 text-sm text-slate-600">
                    <div className="rounded-2xl bg-slate-50 p-4 ring-1 ring-slate-200"><span className="font-bold text-slate-800">الاسم:</span> {featuredStudent.name}</div>
                    <div className="rounded-2xl bg-slate-50 p-4 ring-1 ring-slate-200"><span className="font-bold text-slate-800">رقم الطالب:</span> {featuredStudent.studentNumber || featuredStudent.id}</div>
                    <div className="rounded-2xl bg-slate-50 p-4 ring-1 ring-slate-200"><span className="font-bold text-slate-800">الفصل:</span> {getStudentGroupingLabel(featuredStudent, selectedSchool)}</div>
                    <div className="rounded-2xl bg-slate-50 p-4 ring-1 ring-slate-200"><span className="font-bold text-slate-800">الباركود:</span> <span className="font-mono">{featuredStudent.barcode}</span></div>
                    <div className="flex flex-wrap gap-2">
                      <button onClick={() => onAwardBehavior(featuredStudent.id)} className="rounded-2xl bg-amber-50 px-4 py-3 text-sm font-bold text-amber-700">+ سلوك</button>
                      {featuredStudent.source === 'structure' ? null : <button onClick={() => onDeleteStudent(featuredStudent.id)} className="rounded-2xl bg-rose-50 px-4 py-3 text-sm font-bold text-rose-700">حذف الطالب</button>}
                    </div>
                  </div> : <div className="mt-4 rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-4 py-8 text-center text-sm text-slate-500">اختر طالبًا من التبويب الأول.</div>}
                </div>
              </div>
            </div>
          )}
        </div>
      </SectionCard>
    </div>
  );

}

export default StudentsPage;

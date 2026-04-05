/**
 * ==========================================
 *  CompaniesPage Component
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
import { Input } from '../components/ui/FormElements';
import { DataTable } from '../components/ui/DataTable';
import { SectionCard } from '../components/ui/SectionCard';


import { Badge } from '../components/ui/FormElements';
function CompaniesPage({ selectedSchool, onAddCompany, onDeleteCompany, onAwardInitiative }) {
  const [form, setForm] = useState({ name: "", className: "", leader: "" });
  const hasStructureCompanies = schoolHasStructureClassrooms(selectedSchool);
  const companyRows = useMemo(() => getUnifiedCompanyRows(selectedSchool, { preferStructure: true }), [selectedSchool]);
  const columns = [
    { key: "name", label: "اسم الشركة" },
    { key: "className", label: "الفصل" },
    { key: "leader", label: "الرائد" },
    { key: "students", label: "الطلاب", render: (row) => row.studentsCount ?? getUnifiedSchoolStudents(selectedSchool, { includeArchived: false, preferStructure: true }).filter((student) => (row.source === 'structure' ? String(student.classroomId || '') === String(row.rawId || row.id) : String(student.companyId || '') === String(row.id))).length },
    { key: "early", label: "الحضور المبكر" },
    { key: "behavior", label: "السلوك", render: (row) => `${row.behavior}%` },
    { key: "initiatives", label: "المبادرات" },
    { key: "points", label: "النقاط", render: (row) => <span className="font-extrabold text-slate-800">{row.points}</span> },
    {
      key: "actions",
      label: "الإجراء",
      render: (row) => (
        <div className="flex gap-2">
          <button onClick={() => onAwardInitiative(row.id)} className="rounded-xl bg-emerald-50 px-3 py-2 font-bold text-emerald-700">+ مبادرة</button>
          <button onClick={() => onDeleteCompany(row.id)} className="rounded-xl bg-rose-50 px-3 py-2 font-bold text-rose-700">حذف</button>
        </div>
      ),
    },
  ];


  const submit = (e) => {
    e.preventDefault();
    if (!form.name || !form.className) return;
    onAddCompany(form);
    setForm({ name: "", className: "", leader: "" });
  };

  return (
    <div className="space-y-6">
      <SectionCard title="الشركات والفصول" icon={Layers3} action={<Badge tone="blue">{selectedSchool?.name || "—"}</Badge>}>
        <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
          <div className="space-y-6 xl:col-span-2">
            <DataTable columns={columns} rows={companyRows} emptyMessage={hasStructureCompanies ? 'الفصول/الشركات تُدار الآن من الهيكل المدرسي.' : 'أضف أول شركة داخل هذه المدرسة'} />
            {hasStructureCompanies ? <div className="rounded-3xl border border-dashed border-sky-200 bg-sky-50 p-5 text-sm leading-7 text-sky-800">يتم الآن اعتماد الفصول والشركات من <span className="font-black">الهيكل المدرسي</span> كمصدر افتراضي. يمكن الإضافة والتعديل من صفحة الهيكل المدرسي للحفاظ على توحيد البيانات.</div> : <form onSubmit={submit} className="rounded-3xl bg-slate-50 p-5 ring-1 ring-slate-200">
              <div className="mb-4 flex items-center gap-2 font-extrabold text-slate-800"><Plus className="h-5 w-5" /> إضافة شركة / فصل جديد</div>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                <Input label="اسم الشركة" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="مثال: شركة الريادة" />
                <Input label="الفصل" value={form.className} onChange={(e) => setForm({ ...form, className: e.target.value })} placeholder="مثال: 1/3" />
                <Input label="رائد الشركة" value={form.leader} onChange={(e) => setForm({ ...form, leader: e.target.value })} placeholder="اسم الرائد" />
              </div>
              <button type="submit" className="mt-4 inline-flex items-center gap-2 rounded-2xl bg-sky-700 px-5 py-3 font-bold text-white"><Plus className="h-4 w-4" /> حفظ الشركة</button>
            </form>}
          </div>
          <div className="space-y-4">
            <div className="rounded-3xl bg-slate-50 p-5 ring-1 ring-slate-200">
              <div className="font-bold text-slate-800">ربط نقاط الشركات</div>
              <div className="mt-4 space-y-3 text-sm text-slate-600">
                <div className="rounded-2xl bg-white p-4 ring-1 ring-slate-200">الحضور المبكر والالتزام في البوابة ينعكس مباشرة على نقاط الشركة.</div>
                <div className="rounded-2xl bg-white p-4 ring-1 ring-slate-200">زر <span className="font-bold text-emerald-700">+ مبادرة</span> يضيف مبادرة معتمدة ويرفع رصيد الشركة تلقائيًا.</div>
              </div>
            </div>
          </div>
        </div>
      </SectionCard>
    </div>
  );
}

export default CompaniesPage;

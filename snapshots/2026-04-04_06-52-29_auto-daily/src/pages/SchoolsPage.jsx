/**
 * ==========================================
 *  SchoolsPage Component
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
import { Input } from '../components/ui/FormElements';
import { Modal } from '../components/ui/Modal';
import { DataTable } from '../components/ui/DataTable';
import { SectionCard } from '../components/ui/SectionCard';


import EditSchoolForm from './EditSchoolForm';
import BackupsModal from './BackupsModal';
import { Badge } from '../components/ui/FormElements';
import { APP_VERSION, APP_VERSION_DATE } from '../constants/appConfig.js';
function SchoolsPage({ schools, selectedSchoolId, setSelectedSchoolId, onAddSchool, onDeleteSchool, onExportSchool, onUpdateSchoolBranding, onEditSchool }) {
  const [form, setForm] = useState({ name: "", city: "", code: "", manager: "", principalUsername: "", principalEmail: "", principalPassword: "123456", principalPhone: "" });
  const [schoolSaveStatus, setSchoolSaveStatus] = useState('idle'); // idle | saving | saved
  const [editSchoolModalOpen, setEditSchoolModalOpen] = useState(false);
  const [editingSchool, setEditingSchool] = useState(null);
  const [backupsModalOpen, setBackupsModalOpen] = useState(false);
  const [importingSchoolId, setImportingSchoolId] = useState(null); // id المدرسة الجاري استيرادها
  const [confirmImportSchool, setConfirmImportSchool] = useState(null); // { schoolId, schoolData, fileName }
  const [confirmDeleteSchool, setConfirmDeleteSchool] = useState(null); // { id, name, companiesCount, studentsCount }
  const importFileRef = React.useRef(null);

  const handleImportSchoolFile = (e) => {
    const file = e.target.files?.[0];
    if (!file || !importingSchoolId) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const parsed = JSON.parse(ev.target.result);
        const schoolData = parsed.school || parsed;
        if (!schoolData || typeof schoolData !== 'object' || !schoolData.name) {
          window.alert('الملف غير صالح. تأكد أنه ملف تصدير مدرسة من هذه المنصة.');
          return;
        }
        setConfirmImportSchool({ schoolId: importingSchoolId, schoolData, fileName: file.name });
      } catch {
        window.alert('تعذر قراءة الملف. تأكد أنه ملف JSON صحيح.');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
    setImportingSchoolId(null);
  };

  const doImportSchool = async () => {
    if (!confirmImportSchool) return;
    try {
      const token = getSessionToken();
      const res = await apiRequest(`/api/schools/${confirmImportSchool.schoolId}/import-snapshot`, {
        method: 'POST',
        token,
        body: confirmImportSchool.schoolData,
      });
      if (res?.ok) {
        window.alert(`✅ ${res.message || 'تم استيراد بيانات المدرسة بنجاح. سيتم إعادة تحميل الصفحة.'}`);
        setConfirmImportSchool(null);
        window.location.reload();
      }
    } catch (err) {
      window.alert('تعذر استيراد بيانات المدرسة: ' + (err?.message || ''));
    }
  };

  const columns = [
    { key: "name", label: "المدرسة" },
    { key: "city", label: "المدينة" },
    { key: "code", label: "الرقم الوزاري" },
    { key: "manager", label: "المدير" },
    { key: "studentsCount", label: "الطلاب", render: (row) => getUnifiedSchoolStudents(row, { includeArchived: false, preferStructure: true }).length },
    { key: "companiesCount", label: "الشركات", render: (row) => getUnifiedCompanyRows(row, { preferStructure: true }).length },
    { key: "status", label: "الحالة", render: (row) => <Badge tone="green">{row.status}</Badge> },
    {
      key: "actions",
      label: "الإجراء",
      render: (row) => (
        <div className="flex gap-2">
          <button onClick={() => setSelectedSchoolId(row.id)} className="rounded-xl bg-sky-50 px-3 py-2 font-bold text-sky-700">فتح</button>
          <button onClick={() => { setEditingSchool(row); setEditSchoolModalOpen(true); }} className="rounded-xl bg-amber-50 px-3 py-2 font-bold text-amber-700">تعديل</button>
          <button onClick={() => onExportSchool(row.id)} className="rounded-xl bg-slate-100 px-3 py-2 font-bold text-slate-700">تصدير</button>
          <button
            onClick={() => { setImportingSchoolId(row.id); setTimeout(() => importFileRef.current?.click(), 50); }}
            className="rounded-xl bg-violet-50 px-3 py-2 font-bold text-violet-700 hover:bg-violet-100"
          >استيراد</button>
          <button onClick={() => {
            const companiesCount = (row.companies || []).length;
            const studentsCount = (row.companies || []).reduce((acc, c) => acc + (c.students || []).length, 0);
            setConfirmDeleteSchool({ id: row.id, name: row.name, companiesCount, studentsCount });
          }} className="rounded-xl bg-rose-50 px-3 py-2 font-bold text-rose-700">حذف</button>
        </div>
      ),
    },
  ];

  const activeSchool = schools.find((s) => s.id === selectedSchoolId) || schools[0];
  const handleConfirmDeleteSchool = () => {
    if (confirmDeleteSchool) {
      onDeleteSchool(confirmDeleteSchool.id);
      setConfirmDeleteSchool(null);
    }
  };
  const submit = (e) => {
    e.preventDefault();
    if (!form.name) { window.alert('يرجى إدخال اسم المدرسة.'); return; }
    if (!form.city) { window.alert('يرجى إدخال المدينة.'); return; }
    if (!form.code) { window.alert('يرجى إدخال الرقم الوزاري.'); return; }
    if (!form.principalUsername) { window.alert('يرجى إدخال اسم دخول مدير المدرسة.'); return; }
    if (!form.principalEmail) { window.alert('يرجى إدخال البريد الإلكتروني لمدير المدرسة.'); return; }
    if (!form.principalPassword) { window.alert('يرجى إدخال كلمة المرور الأولية.'); return; }
    if (!form.principalPhone) { window.alert('يرجى إدخال رقم جوال مدير المدرسة.'); return; }
    setSchoolSaveStatus('saving');
    setTimeout(() => {
      onAddSchool({ ...form, principalPhone: normalizePhoneNumber(form.principalPhone) });
      setForm({ name: "", city: "", code: "", manager: "", principalUsername: "", principalEmail: "", principalPassword: "123456" });
      setSchoolSaveStatus('saved');
      setTimeout(() => setSchoolSaveStatus('idle'), 2500);
    }, 400);
  };

  return (
    <div className="space-y-6">
      {/* input مخفي لاستيراد ملف المدرسة */}
      <input
        ref={importFileRef}
        type="file"
        accept=".json,application/json"
        className="hidden"
        onChange={handleImportSchoolFile}
      />

      {/* نافذة تأكيد استيراد المدرسة */}
      {/* مودال تأكيد حذف المدرسة */}
      {confirmDeleteSchool && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-rose-100 shrink-0">
                <Trash2 className="h-6 w-6 text-rose-600" />
              </div>
              <div>
                <div className="font-black text-slate-800 text-lg">تحذير: حذف المدرسة</div>
                <div className="text-sm text-rose-600 font-bold">هذا الإجراء لا يمكن التراجع عنه</div>
              </div>
            </div>
            <div className="rounded-2xl bg-rose-50 border border-rose-200 p-4 mb-4">
              <div className="font-black text-slate-800 text-base mb-2">{confirmDeleteSchool.name}</div>
              <div className="text-sm text-slate-600 space-y-1">
                <div>سيتم حذف <span className="font-bold text-rose-700">{confirmDeleteSchool.companiesCount} فصل/شركة</span> وجميع بياناتها</div>
                <div>سيتم حذف <span className="font-bold text-rose-700">{confirmDeleteSchool.studentsCount} طالب</span> وسجلاتهم كاملة</div>
                <div>سيتم حذف جميع المستخدمين المرتبطين بهذه المدرسة</div>
                <div>سيتم حذف سجلات الحضور والإجراءات والاستئذانات</div>
              </div>
            </div>
            <div className="text-sm text-slate-500 mb-5">يُنصح بأخذ نسخة احتياطية أولاً قبل المتابعة.</div>
            <div className="flex gap-2">
              <button onClick={() => setConfirmDeleteSchool(null)} className="inline-flex flex-1 items-center justify-center rounded-2xl bg-slate-100 px-4 py-3 text-sm font-bold text-slate-700 hover:bg-slate-200">إلغاء</button>
              <button
                onClick={handleConfirmDeleteSchool}
                className="inline-flex flex-1 items-center justify-center gap-2 rounded-2xl bg-rose-600 px-4 py-3 text-sm font-bold text-white hover:bg-rose-700"
              >
                <Trash2 className="h-4 w-4" />
                تأكيد الحذف النهائي
              </button>
            </div>
          </div>
        </div>
      )}
      {confirmImportSchool && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl ring-1 ring-slate-200">
            <div className="text-lg font-black text-slate-900">تأكيد استيراد بيانات المدرسة</div>
            <div className="mt-3 rounded-2xl bg-amber-50 p-4 text-sm leading-7 text-amber-800 ring-1 ring-amber-200">
              <div className="font-bold">تحذير: سيتم استبدال جميع بيانات هذه المدرسة بمحتوى الملف.</div>
              <div className="mt-2">الملف: <span className="font-bold text-slate-800">{confirmImportSchool.fileName}</span></div>
              <div className="mt-1">المدرسة في الملف: <span className="font-bold text-violet-700">{confirmImportSchool.schoolData.name}</span></div>
              <div className="mt-1">عدد الطلاب: <span className="font-bold">{confirmImportSchool.schoolData.students?.length || 0}</span></div>
              <div className="mt-1">عدد الشركات: <span className="font-bold">{confirmImportSchool.schoolData.companies?.length || 0}</span></div>
              <div className="mt-2 text-xs">سيتم الاحتفاظ برقم المدرسة وروابطها الحالية. هل أنت متأكد؟</div>
            </div>
            <div className="mt-4 flex gap-3">
              <button
                onClick={doImportSchool}
                className="flex-1 rounded-2xl bg-violet-700 px-4 py-3 font-bold text-white hover:bg-violet-800"
              >
                نعم، استيراد بيانات المدرسة
              </button>
              <button onClick={() => setConfirmImportSchool(null)} className="flex-1 rounded-2xl bg-slate-100 px-4 py-3 font-bold text-slate-700 hover:bg-slate-200">إلغاء</button>
            </div>
          </div>
        </div>
      )}

      {backupsModalOpen && <BackupsModal onClose={() => setBackupsModalOpen(false)} schools={schools} />}
      <SectionCard title="إدارة المدارس" icon={Building2} action={
        <div className="flex items-center gap-2">
          <button onClick={() => setBackupsModalOpen(true)} className="inline-flex items-center gap-1.5 rounded-2xl bg-emerald-50 px-3 py-2 text-sm font-bold text-emerald-700 ring-1 ring-emerald-200 hover:bg-emerald-100 transition">
            <Archive className="h-4 w-4" /> النسخ الاحتياطية
          </button>
          <Badge tone="blue">مركزية متعددة المدارس</Badge>
          <span className="inline-flex items-center gap-1.5 rounded-xl bg-violet-50 px-2.5 py-1 font-mono text-xs font-bold text-violet-700 ring-1 ring-violet-200" title={`آخر تحديث: ${APP_VERSION_DATE}`}>
            {APP_VERSION} · {APP_VERSION_DATE}
          </span>
        </div>
      }>
        <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
          <div className="space-y-6 xl:col-span-2">
            <DataTable columns={columns} rows={schools} />
            <form onSubmit={submit} className="rounded-3xl bg-slate-50 p-5 ring-1 ring-slate-200">
              <div className="mb-4 flex items-center gap-2 font-extrabold text-slate-800"><Plus className="h-5 w-5" /> إضافة مدرسة جديدة</div>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <Input label="اسم المدرسة" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="مثال: متوسطة الملك فهد" />
                <Input label="المدينة" value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} placeholder="مثال: الخرج" />
                <Input label="الرقم الوزاري" value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value })} placeholder="مثال: KRJ-014" />
                <Input label="مدير المدرسة" value={form.manager} onChange={(e) => setForm({ ...form, manager: e.target.value })} placeholder="اسم المدير" />
                <Input label="اسم دخول مدير المدرسة" value={form.principalUsername} onChange={(e) => setForm({ ...form, principalUsername: e.target.value.trim().toLowerCase() })} placeholder="مثال: krj014.principal" />
                <Input label="البريد الإلكتروني لمدير المدرسة" value={form.principalEmail} onChange={(e) => setForm({ ...form, principalEmail: e.target.value.trim().toLowerCase() })} placeholder="principal@example.com" />
                <Input label="كلمة المرور الأولية" value={form.principalPassword} onChange={(e) => setForm({ ...form, principalPassword: e.target.value })} placeholder="123456" />
                <Input label="رقم جوال مدير المدرسة" value={form.principalPhone} onChange={(e) => setForm({ ...form, principalPhone: e.target.value })} placeholder="مثال: 05xxxxxxxx" type="tel" />
              </div>
              <div className="mt-4 rounded-2xl bg-white p-4 text-sm leading-7 text-slate-600 ring-1 ring-slate-200">
                عند حفظ المدرسة سيتم إنشاء <span className="font-black text-slate-800">مدير المدرسة كأدمن المدرسة</span> مباشرة بهذه البيانات، مع إبقاء حسابات البوابة والمعلم الافتراضية.
              </div>
              <button type="submit" disabled={schoolSaveStatus === 'saving'} className={`mt-4 inline-flex items-center gap-2 rounded-2xl px-5 py-3 font-bold text-white transition-all duration-300 ${schoolSaveStatus === 'saved' ? 'bg-emerald-600 scale-105' : schoolSaveStatus === 'saving' ? 'bg-sky-400 cursor-wait' : 'bg-sky-700 hover:bg-sky-800'}`}>{schoolSaveStatus === 'saving' ? <><RefreshCw className="h-4 w-4 animate-spin" /> جارٍ الحفظ...</> : schoolSaveStatus === 'saved' ? <><CheckCircle className="h-4 w-4" /> تمت الإضافة بنجاح ✓</> : <><Plus className="h-4 w-4" /> حفظ المدرسة وإنشاء الأدمن</>}</button>
            </form>
          </div>

          {editSchoolModalOpen && editingSchool && (
            <Modal title="تعديل بيانات المدرسة" isOpen={editSchoolModalOpen} onClose={() => setEditSchoolModalOpen(false)}>
              <EditSchoolForm
                school={editingSchool}
                onSave={(updatedSchool) => {
                  onEditSchool(updatedSchool);
                  setEditSchoolModalOpen(false);
                  setEditingSchool(null);
                }}
                onCancel={() => {
                  setEditSchoolModalOpen(false);
                  setEditingSchool(null);
                }}
              />
            </Modal>
          )}
          <div className="space-y-4">
            <div className="rounded-3xl bg-slate-50 p-5 ring-1 ring-slate-200">
              <div className="text-sm text-slate-500">المدرسة المحددة</div>
              <div className="mt-2 text-2xl font-extrabold text-slate-800">{activeSchool.name}</div>
              <div className="mt-1 text-slate-500">{activeSchool.city}</div>
              <div className="mt-4 grid grid-cols-2 gap-3 text-center">
                <div className="rounded-2xl bg-white p-3 ring-1 ring-slate-200"><div className="text-2xl font-black">{getUnifiedSchoolStudents(activeSchool, { includeArchived: false, preferStructure: true }).length}</div><div className="text-sm text-slate-500">طالب</div></div>
                <div className="rounded-2xl bg-white p-3 ring-1 ring-slate-200"><div className="text-2xl font-black">{getUnifiedCompanyRows(activeSchool, { preferStructure: true }).length}</div><div className="text-sm text-slate-500">شركة</div></div>
              </div>
              <div className="mt-4 rounded-2xl bg-white p-4 text-sm leading-7 text-slate-600 ring-1 ring-slate-200">
                عند إضافة مدرسة جديدة، تصبح قابلة مباشرة لإضافة الشركات والطلاب والحضور دون إعادة تشغيل المنصة. كما يتم إنشاء <span className="font-black text-slate-800">حساب مدير المدرسة</span> مرتبطًا بالبريد الإلكتروني ليستفاد منه لاحقًا في الاسترجاع والإشعارات.
              </div>
            </div>
          </div>
        </div>
      </SectionCard>

      <SectionCard title="تخصيص هوية المنصة لكل مدرسة" icon={ShieldCheck} action={<Badge tone="violet">صلاحيات White-Label</Badge>}>
        <div className="mb-4 rounded-2xl bg-violet-50 px-4 py-3 text-sm leading-7 text-violet-900 ring-1 ring-violet-200">
          يمكنك منح كل مدرسة صلاحية تغيير اسم المنصة وشعارها بشكل مستقل دون التأثير على المدارس الأخرى. عند تفعيل الصلاحية، يظهر قسم التخصيص لمدير المدرسة في إعداداته.
        </div>
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 xl:grid-cols-3">
          {schools.map((school) => (
            <div key={school.id} className="rounded-3xl bg-white p-5 ring-1 ring-slate-200">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="font-black text-slate-900">{school.name}</div>
                  <div className="mt-1 text-sm text-slate-500">{school.city} • {school.code}</div>
                </div>
                <Badge tone={school.customBranding?.allowed ? 'violet' : 'slate'}>
                  {school.customBranding?.allowed ? 'مفعلة' : 'غير مفعلة'}
                </Badge>
              </div>
              {school.customBranding?.allowed && school.customBranding?.platformName && (
                <div className="mt-3 rounded-2xl bg-violet-50 px-3 py-2 text-sm">
                  <span className="font-bold text-violet-800">الاسم المخصص:</span> <span className="text-violet-700">{school.customBranding.platformName}</span>
                </div>
              )}
              <div className="mt-4 flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => onUpdateSchoolBranding?.(school.id, { allowed: !school.customBranding?.allowed })}
                  className={`rounded-2xl px-4 py-2 text-sm font-bold transition ${
                    school.customBranding?.allowed
                      ? 'bg-rose-50 text-rose-700 hover:bg-rose-100'
                      : 'bg-violet-700 text-white hover:bg-violet-800'
                  }`}
                >
                  {school.customBranding?.allowed ? 'إلغاء صلاحية التخصيص' : 'منح صلاحية التخصيص'}
                </button>
              </div>
            </div>
          ))}
        </div>
      </SectionCard>
    </div>
  );
}

export default SchoolsPage;

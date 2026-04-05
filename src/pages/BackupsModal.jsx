/**
 * ==========================================
 *  BackupsModal Component
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
import { Modal } from '../components/ui/Modal';


function BackupsModal({ onClose, onRestoreSuccess, schools = [] }) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [data, setData] = useState(null);
  const [activeTab, setActiveTab] = useState('global');
  const [downloading, setDownloading] = useState('');
  const [restoring, setRestoring] = useState('');
  const [confirmRestore, setConfirmRestore] = useState(null); // { type, name, label }
  const [confirmDeleteBackup, setConfirmDeleteBackup] = useState(null); // { type, name, label }
  const [selectedSchoolFilter, setSelectedSchoolFilter] = useState('all'); // 'all' أو اسم المدرسة
  const [deletingBackup, setDeletingBackup] = useState('');
  const [uploadRestoring, setUploadRestoring] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const [confirmUploadRestore, setConfirmUploadRestore] = useState(null); // parsed state from file
  const fileInputRef = React.useRef(null);
  const [creatingNow, setCreatingNow] = useState(false);

  const createNowBackup = async () => {
    try {
      setCreatingNow(true);
      const token = getSessionToken();
      const res = await apiRequest('/api/backups/create-now', { method: 'POST', token });
      if (res?.ok) {
        window.alert(`✅ ${res.message}`);
        await loadList(); // تحديث القائمة بعد الإنشاء
      }
    } catch (err) {
      window.alert('تعذر إنشاء النسخة: ' + (err?.message || ''));
    } finally {
      setCreatingNow(false);
    }
  };

  const loadList = async () => {
    try {
      setLoading(true);
      setError('');
      const token = getSessionToken();
      const res = await apiRequest('/api/backups/list', { token });
      setData(res);
    } catch (err) {
      setError(err?.message || 'تعذر تحميل قائمة النسخ الاحتياطية.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadList(); }, []);

  const downloadBackup = async (type, name) => {
    try {
      setDownloading(name);
      const token = getSessionToken();
      const res = await fetch(`/api/backups/download/${type}/${encodeURIComponent(name)}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error('تعذر تحميل الملف.');
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = name;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      window.alert(err?.message || 'تعذر تحميل الملف.');
    } finally {
      setDownloading('');
    }
  };

  const restoreBackup = async (type, name) => {
    try {
      setRestoring(name);
      const token = getSessionToken();
      const res = await apiRequest(`/api/backups/restore/${type}/${encodeURIComponent(name)}`, { method: 'POST', token });
      if (res?.ok) {
        window.alert(`✅ ${res.message || 'تمت استعادة النسخة بنجاح. سيتم إعادة تحميل الصفحة.'}`);
        if (onRestoreSuccess) onRestoreSuccess(res.state);
        onClose();
        window.location.reload();
      }
    } catch (err) {
      window.alert('تعذر استعادة النسخة: ' + (err?.message || ''));
    } finally {
      setRestoring('');
      setConfirmRestore(null);
    }
  };

  const deleteBackup = async (type, name) => {
    try {
      setDeletingBackup(name);
      const token = getSessionToken();
      const res = await apiRequest(`/api/backups/delete/${type}/${encodeURIComponent(name)}`, { method: 'DELETE', token });
      if (res?.ok) {
        await loadList();
      }
    } catch (err) {
      window.alert('تعذر حذف النسخة: ' + (err?.message || ''));
    } finally {
      setDeletingBackup('');
      setConfirmDeleteBackup(null);
    }
  };
  const formatSize = (bytes) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  // استخراج التاريخ من اسم الملف بشكل واضح
  const parseDateFromName = (name) => {
    // صيغة: platform-2026-03-27.json أو 2026-03-27-school-name.json
    const match = name.match(/(\d{4})-(\d{2})-(\d{2})/);
    if (!match) return null;
    return new Date(`${match[1]}-${match[2]}-${match[3]}`);
  };

  const formatDateLabel = (name, mtime) => {
    const d = parseDateFromName(name) || new Date(mtime);
    return d.toLocaleDateString('ar-SA', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
  };

  const formatTimeLabel = (mtime) => {
    try { return new Date(mtime).toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' }); } catch { return ''; }
  };

  // استخراج رمز المدرسة من اسم الملف ثم البحث عن اسمها الحقيقي
  const parseSchoolLabel = (name) => {
    // صيغة: 2026-03-27-school-code.json أو manual-XXXXXX-school-code.json
    const withoutDate = name.replace(/^\d{4}-\d{2}-\d{2}-/, '').replace(/^manual-\d+-/, '').replace(/\.json$/, '');
    const code = withoutDate || name;
    // البحث عن المدرسة بالرمز الوزاري أو اسم الدخول
    if (schools.length > 0) {
      const matched = schools.find(s =>
        (s.code && s.code.toLowerCase() === code.toLowerCase()) ||
        (s.principalUsername && s.principalUsername.toLowerCase() === code.toLowerCase())
      );
      if (matched) return matched.name;
    }
    return code;
  };

  // استعادة من ملف محلي
  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadError('');
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const parsed = JSON.parse(ev.target.result);
        const stateToRestore = parsed.state || parsed;
        if (!stateToRestore || !Array.isArray(stateToRestore.schools)) {
          setUploadError('الملف غير صالح. تأكد أنه نسخة احتياطية صحيحة من المنصة (يجب أن يحتوي على قائمة مدارس).');
          return;
        }
        setConfirmUploadRestore({ state: stateToRestore, fileName: file.name });
      } catch {
        setUploadError('تعذر قراءة الملف. تأكد أنه ملف JSON صحيح.');
      }
    };
    reader.readAsText(file);
    // إعادة تعيين حقل الملف للسماح باختيار نفس الملف مرة أخرى
    e.target.value = '';
  };

  const restoreFromUpload = async () => {
    if (!confirmUploadRestore) return;
    try {
      setUploadRestoring(true);
      const token = getSessionToken();
      const res = await apiRequest('/api/backups/restore-from-upload', {
        method: 'POST',
        token,
        body: confirmUploadRestore.state,
      });
      if (res?.ok) {
        window.alert(`✅ ${res.message || 'تمت استعادة النسخة من الملف بنجاح. سيتم إعادة تحميل الصفحة.'}`);
        if (onRestoreSuccess) onRestoreSuccess(res.state);
        onClose();
        window.location.reload();
      }
    } catch (err) {
      window.alert('تعذر استعادة النسخة من الملف: ' + (err?.message || ''));
    } finally {
      setUploadRestoring(false);
      setConfirmUploadRestore(null);
    }
  };

  const globalList = data?.global || [];
  const schoolList = data?.schools || [];
  // استخراج أسماء المدارس الفريدة من نسخ المدارس
  const uniqueSchoolNames = [...new Set((data?.schools || []).map(item => parseSchoolLabel(item.name)).filter(Boolean))].sort();
  const filteredSchoolList = selectedSchoolFilter === 'all'
    ? schoolList
    : schoolList.filter(item => parseSchoolLabel(item.name) === selectedSchoolFilter);
  const activeList = activeTab === 'global' ? globalList : filteredSchoolList;
  const activeType = activeTab === 'global' ? 'global' : 'school';

  return (
    <Modal title="النسخ الاحتياطية التلقائية" isOpen={true} onClose={onClose}>
      <div className="space-y-4">

        {/* نافذة تأكيد استعادة من ملف */}
        {confirmUploadRestore && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
            <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl ring-1 ring-slate-200">
              <div className="text-lg font-black text-slate-900">تأكيد استعادة من ملف</div>
              <div className="mt-3 rounded-2xl bg-amber-50 p-4 text-sm leading-7 text-amber-800 ring-1 ring-amber-200">
                <div className="font-bold">تحذير: سيتم استبدال جميع بيانات المنصة الحالية بمحتوى هذا الملف.</div>
                <div className="mt-2">الملف: <span className="font-bold text-slate-800">{confirmUploadRestore.fileName}</span></div>
                <div className="mt-1">عدد المدارس في النسخة: <span className="font-bold">{confirmUploadRestore.state?.schools?.length || 0}</span></div>
                <div className="mt-1">هل أنت متأكد من المتابعة؟</div>
              </div>
              <div className="mt-4 flex gap-3">
                <button
                  onClick={restoreFromUpload}
                  disabled={uploadRestoring}
                  className="flex-1 rounded-2xl bg-emerald-700 px-4 py-3 font-bold text-white hover:bg-emerald-800 disabled:opacity-60"
                >
                  {uploadRestoring ? <><RefreshCw className="inline h-4 w-4 animate-spin ml-1" /> جارٍ الاستعادة...</> : 'نعم، استعادة من الملف'}
                </button>
                <button onClick={() => setConfirmUploadRestore(null)} className="flex-1 rounded-2xl bg-slate-100 px-4 py-3 font-bold text-slate-700 hover:bg-slate-200">إلغاء</button>
              </div>
            </div>
          </div>
        )}

        {/* نافذة تأكيد الاستعادة */}
        {confirmRestore && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
            <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl ring-1 ring-slate-200">
              <div className="text-lg font-black text-slate-900">تأكيد استعادة النسخة</div>
              <div className="mt-3 rounded-2xl bg-amber-50 p-4 text-sm leading-7 text-amber-800 ring-1 ring-amber-200">
                <div className="font-bold">تحذير: سيتم استبدال جميع بيانات المنصة الحالية بمحتوى هذه النسخة.</div>
                <div className="mt-2">النسخة: <span className="font-bold text-slate-800">{confirmRestore.label}</span></div>
                <div className="mt-1">هل أنت متأكد من المتابعة؟</div>
              </div>
              <div className="mt-4 flex gap-3">
                <button
                  onClick={() => restoreBackup(confirmRestore.type, confirmRestore.name)}
                  disabled={!!restoring}
                  className="flex-1 rounded-2xl bg-emerald-700 px-4 py-3 font-bold text-white hover:bg-emerald-800 disabled:opacity-60"
                >
                  {restoring ? <><RefreshCw className="inline h-4 w-4 animate-spin ml-1" /> جارٍ الاستعادة...</> : 'نعم، استعادة النسخة'}
                </button>
                <button onClick={() => setConfirmRestore(null)} className="flex-1 rounded-2xl bg-slate-100 px-4 py-3 font-bold text-slate-700 hover:bg-slate-200">إلغاء</button>
              </div>
            </div>
          </div>
        )}

        {/* زر أخذ نسخة الآن */}
        <div className="flex items-center justify-between gap-3 rounded-2xl bg-emerald-50 p-3 ring-1 ring-emerald-200">
          <div>
            <div className="font-bold text-emerald-900 text-sm">أخذ نسخة احتياطية الآن</div>
            <div className="mt-0.5 text-xs text-emerald-700">إنشاء نسخة يدوية فورية لجميع بيانات المنصة والمدارس</div>
          </div>
          <button
            onClick={createNowBackup}
            disabled={creatingNow || loading}
            className="inline-flex shrink-0 items-center gap-2 rounded-2xl bg-emerald-700 px-4 py-2.5 text-sm font-bold text-white hover:bg-emerald-800 disabled:opacity-60 transition"
          >
            {creatingNow ? <><RefreshCw className="h-4 w-4 animate-spin" /> جاري الإنشاء...</> : <><Archive className="h-4 w-4" /> أخذ نسخة الآن</>}
          </button>
        </div>

        {/* إحصائيات سريعة */}
        <div className="grid grid-cols-3 gap-3">
          <div className="rounded-2xl bg-emerald-50 p-3 text-center ring-1 ring-emerald-100">
            <div className="text-xs text-emerald-700">نسخ المنصة الكاملة</div>
            <div className="mt-1 text-2xl font-black text-emerald-800">{globalList.length}</div>
          </div>
          <div className="rounded-2xl bg-sky-50 p-3 text-center ring-1 ring-sky-100">
            <div className="text-xs text-sky-700">نسخ المدارس</div>
            <div className="mt-1 text-2xl font-black text-sky-800">{schoolList.length}</div>
          </div>
          <div className="rounded-2xl bg-violet-50 p-3 text-center ring-1 ring-violet-100">
            <div className="text-xs text-violet-700">مدة الاحتفاظ</div>
            <div className="mt-1 text-2xl font-black text-violet-800">{data?.retentionDays || 30} يوم</div>
          </div>
        </div>

        {/* تبويبات */}
        <div className="flex gap-2">
          <button onClick={() => setActiveTab('global')} className={`rounded-2xl px-4 py-2 text-sm font-bold transition ${activeTab === 'global' ? 'bg-sky-700 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'}`}>نسخ المنصة الكاملة ({globalList.length})</button>
          <button onClick={() => setActiveTab('school')} className={`rounded-2xl px-4 py-2 text-sm font-bold transition ${activeTab === 'school' ? 'bg-sky-700 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'}`}>نسخ المدارس ({schoolList.length})</button>
        </div>

        {/* منسدلة تصفية المدارس - تظهر فقط عند تبويب نسخ المدارس */}
        {activeTab === 'school' && uniqueSchoolNames.length > 1 && (
          <div className="flex items-center gap-2">
            <label className="text-xs font-bold text-slate-600 shrink-0">تصفية حسب المدرسة:</label>
            <select
              value={selectedSchoolFilter}
              onChange={(e) => setSelectedSchoolFilter(e.target.value)}
              className="flex-1 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-sky-400"
            >
              <option value="all">جميع المدارس ({schoolList.length} نسخة)</option>
              {uniqueSchoolNames.map(name => {
                const count = schoolList.filter(item => parseSchoolLabel(item.name) === name).length;
                return (
                  <option key={name} value={name}>{name} ({count} نسخة)</option>
                );
              })}
            </select>
            {selectedSchoolFilter !== 'all' && (
              <button
                onClick={() => setSelectedSchoolFilter('all')}
                className="shrink-0 rounded-xl bg-slate-100 px-2.5 py-2 text-xs font-bold text-slate-600 hover:bg-slate-200"
                title="إلغاء التصفية"
              >✕</button>
            )}
          </div>
        )}
        {/* المحتوى */}
        {loading && (
          <div className="flex items-center justify-center py-10 text-slate-500">
            <RefreshCw className="h-5 w-5 animate-spin ml-2" /> جارٍ تحميل القائمة...
          </div>
        )}
        {error && !loading && (
          <div className="rounded-2xl bg-rose-50 px-4 py-3 text-sm text-rose-700 ring-1 ring-rose-100">{error}</div>
        )}
        {!loading && !error && activeList.length === 0 && (
          <div className="rounded-2xl bg-slate-50 px-4 py-6 text-center text-sm text-slate-500 ring-1 ring-slate-200">
            {activeTab === 'school' && selectedSchoolFilter !== 'all'
              ? `لا توجد نسخ احتياطية لمدرسة "${selectedSchoolFilter}".`
              : 'لا توجد نسخ احتياطية متاحة بعد. سيتم إنشاؤها تلقائياً عند حفظ البيانات.'}
          </div>
        )}
        {!loading && !error && activeList.length > 0 && (
          <div className="max-h-[32rem] overflow-y-auto space-y-2 pl-1">
            {activeList.map((item, index) => {
              const dateLabel = formatDateLabel(item.name, item.mtime);
              const timeLabel = formatTimeLabel(item.mtime);
              const schoolLabel = activeTab === 'school' ? parseSchoolLabel(item.name) : null;
              const isLatest = index === 0;
              const isBusy = downloading === item.name || restoring === item.name;
              return (
                <div key={item.name} className={`rounded-2xl p-4 ring-1 ${isLatest ? 'bg-sky-50 ring-sky-200' : 'bg-slate-50 ring-slate-200'}`}>
                  {/* رأس البطاقة */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      {/* رقم النسخة */}
                      <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-sm font-black ${isLatest ? 'bg-sky-700 text-white' : 'bg-slate-200 text-slate-700'}`}>
                        {activeList.length - index}
                      </div>
                      <div>
                        {/* التاريخ */}
                        <div className="font-bold text-slate-900 text-sm">{dateLabel}</div>
                        {schoolLabel && (
                          <div className="mt-0.5 text-xs font-bold text-sky-700">مدرسة: {schoolLabel}</div>
                        )}
                        <div className="mt-0.5 flex flex-wrap items-center gap-2 text-xs text-slate-500">
                          <span>الساعة {timeLabel}</span>
                          <span className="rounded-lg bg-white px-2 py-0.5 ring-1 ring-slate-200">{formatSize(item.size)}</span>
                          {isLatest && <span className="rounded-lg bg-sky-100 px-2 py-0.5 font-bold text-sky-700">الأحدث</span>}
                        </div>
                      </div>
                    </div>
                  </div>
                  {/* أزرار الإجراء */}
                  <div className="mt-3 flex gap-2">
                    <button
                      onClick={() => downloadBackup(activeType, item.name)}
                      disabled={isBusy}
                      className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-slate-100 px-3 py-2 text-xs font-bold text-slate-700 hover:bg-slate-200 disabled:opacity-60"
                    >
                      {downloading === item.name ? <RefreshCw className="h-3.5 w-3.5 animate-spin" /> : <Download className="h-3.5 w-3.5" />}
                      تحميل الملف
                    </button>
                    <button
                      onClick={() => setConfirmRestore({ type: activeType, name: item.name, label: dateLabel + (schoolLabel ? ` - ${schoolLabel}` : '') })}
                      disabled={isBusy}
                      className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-emerald-700 px-3 py-2 text-xs font-bold text-white hover:bg-emerald-800 disabled:opacity-60"
                    >
                      {restoring === item.name ? <RefreshCw className="h-3.5 w-3.5 animate-spin" /> : <Upload className="h-3.5 w-3.5" />}
                      استعادة هذه النسخة
                    </button>
                    <button
                      onClick={() => setConfirmDeleteBackup({ type: activeType, name: item.name, label: dateLabel + (schoolLabel ? ` - ${schoolLabel}` : '') })}
                      disabled={isBusy}
                      title="حذف هذه النسخة"
                      className="inline-flex items-center justify-center rounded-xl bg-rose-50 px-2.5 py-2 text-rose-600 hover:bg-rose-100 disabled:opacity-60 ring-1 ring-rose-200"
                    >
                      {deletingBackup === item.name ? <RefreshCw className="h-3.5 w-3.5 animate-spin" /> : <Trash2 className="h-3.5 w-3.5" />}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* مودال تأكيد حذف النسخة */}
        {confirmDeleteBackup && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
            <div className="w-full max-w-sm rounded-3xl bg-white p-6 shadow-2xl">
              <div className="flex items-center gap-3 mb-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-rose-100">
                  <Trash2 className="h-5 w-5 text-rose-600" />
                </div>
                <div className="font-black text-slate-800 text-base">حذف النسخة الاحتياطية</div>
              </div>
              <div className="text-sm text-slate-600 mb-1">هل أنت متأكد من حذف هذه النسخة؟ لا يمكن التراجع عن هذا الإجراء.</div>
              <div className="mt-2 text-xs text-slate-500">النسخة: <span className="font-bold text-slate-800">{confirmDeleteBackup.label}</span></div>
              <div className="mt-5 flex gap-2">
                <button onClick={() => setConfirmDeleteBackup(null)} className="inline-flex flex-1 items-center justify-center rounded-2xl bg-slate-100 px-4 py-2.5 text-sm font-bold text-slate-700 hover:bg-slate-200">إلغاء</button>
                <button
                  onClick={() => deleteBackup(confirmDeleteBackup.type, confirmDeleteBackup.name)}
                  disabled={deletingBackup === confirmDeleteBackup.name}
                  className="inline-flex flex-1 items-center justify-center gap-2 rounded-2xl bg-rose-600 px-4 py-2.5 text-sm font-bold text-white hover:bg-rose-700 disabled:opacity-60"
                >
                  {deletingBackup === confirmDeleteBackup.name ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                  حذف النسخة
                </button>
              </div>
            </div>
          </div>
        )}
        {/* قسم كيف يعمل النظام */}
        <details className="rounded-2xl bg-slate-50 ring-1 ring-slate-200 overflow-hidden">
          <summary className="flex cursor-pointer items-center justify-between px-4 py-3 text-sm font-bold text-slate-700 hover:bg-slate-100 select-none">
            <span className="flex items-center gap-2">
              <Info className="h-4 w-4 text-slate-500" />
              كيف يعمل نظام النسخ الاحتياطية؟
            </span>
            <ChevronDown className="h-4 w-4 text-slate-400" />
          </summary>
          <div className="px-4 pb-4 pt-2 space-y-3">
            <table className="w-full text-xs border-collapse">
              <thead>
                <tr className="bg-slate-100">
                  <th className="rounded-tr-xl px-3 py-2 text-right font-bold text-slate-700 border border-slate-200">الجانب</th>
                  <th className="rounded-tl-xl px-3 py-2 text-right font-bold text-slate-700 border border-slate-200">التفصيل</th>
                </tr>
              </thead>
              <tbody>
                <tr className="bg-white">
                  <td className="px-3 py-2 font-bold text-slate-700 border border-slate-200 whitespace-nowrap">وقت النسخ</td>
                  <td className="px-3 py-2 text-slate-600 border border-slate-200">تلقائياً كل يوم الساعة <span className="font-bold text-sky-700">12:00 منتصف الليل</span>، وعند أول حفظ للبيانات في اليوم، وعند تشغيل الخادم</td>
                </tr>
                <tr className="bg-slate-50">
                  <td className="px-3 py-2 font-bold text-slate-700 border border-slate-200 whitespace-nowrap">ما يُحفظ</td>
                  <td className="px-3 py-2 text-slate-600 border border-slate-200">نسخة كاملة للمنصة + نسخة مستقلة لكل مدرسة</td>
                </tr>
                <tr className="bg-white">
                  <td className="px-3 py-2 font-bold text-slate-700 border border-slate-200 whitespace-nowrap">مدة الاحتفاظ</td>
                  <td className="px-3 py-2 text-slate-600 border border-slate-200"><span className="font-bold text-violet-700">30 يوماً</span> - النسخ الأقدم تُحذف تلقائياً</td>
                </tr>
                <tr className="bg-slate-50">
                  <td className="px-3 py-2 font-bold text-slate-700 border border-slate-200 whitespace-nowrap">التكرار</td>
                  <td className="px-3 py-2 text-slate-600 border border-slate-200">نسخة واحدة فقط في اليوم - لا يتم الكتابة فوق نسخة موجودة</td>
                </tr>
              </tbody>
            </table>
            <div className="rounded-xl bg-amber-50 border border-amber-200 px-3 py-2.5 text-xs text-amber-800">
              <span className="font-bold">تنبيه:</span> النسخة اليومية تُنشأ مرة واحدة في اليوم. استخدم زر <span className="font-bold">"أخذ نسخة الآن"</span> لإنشاء نسخة يدوية إضافية في أي وقت.
            </div>
          </div>
        </details>
        {/* زر استعادة من ملف محلي */}
        <div className="rounded-2xl border-2 border-dashed border-slate-300 bg-slate-50 p-4">
          <div className="flex items-center justify-between gap-3">
            <div>
              <div className="font-bold text-slate-800 text-sm">استعادة من ملف على جهازك</div>
              <div className="mt-0.5 text-xs text-slate-500">ارفع ملف JSON سبق تحميله من المنصة</div>
            </div>
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={uploadRestoring}
              className="inline-flex shrink-0 items-center gap-2 rounded-2xl bg-sky-700 px-4 py-2.5 text-sm font-bold text-white hover:bg-sky-800 disabled:opacity-60"
            >
              <FolderOpen className="h-4 w-4" />
              اختر ملف
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept=".json,application/json"
              className="hidden"
              onChange={handleFileUpload}
            />
          </div>
          {uploadError && (
            <div className="mt-3 rounded-xl bg-rose-50 px-3 py-2 text-xs text-rose-700 ring-1 ring-rose-100">{uploadError}</div>
          )}
        </div>

        <div className="rounded-2xl bg-amber-50 px-4 py-3 text-xs leading-6 text-amber-800 ring-1 ring-amber-100">
          <span className="font-bold">ملاحظة:</span> عند الاستعادة سيتم استبدال جميع بيانات المنصة الحالية بمحتوى النسخة المختارة. يُنصح بأخذ نسخة يدوية قبل أي استعادة.
        </div>
      </div>
    </Modal>
  );
}

export default BackupsModal;

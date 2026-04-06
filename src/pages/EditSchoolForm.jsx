/**
 * ==========================================
 *  EditSchoolForm Component
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


function EditSchoolForm({ school, onSave, onCancel }) {
  const [form, setForm] = useState(school);

  const submit = (e) => {
    e.preventDefault();
    if (!form.name) { window.alert('يرجى إدخال اسم المدرسة.'); return; }
    if (!form.city) { window.alert('يرجى إدخال المدينة.'); return; }
    if (!form.code) { window.alert('يرجى إدخال الرقم الوزاري.'); return; }
    onSave(form);
  };

  // استخراج بيانات المدير من مستخدمي المدرسة إن وجدت
  const principalUsername = form.principalUsername || form.adminUsername || '';
  const principalEmail = form.principalEmail || form.adminEmail || '';
  const principalPhone = form.principalPhone || form.adminPhone || '';

  return (
    <form onSubmit={submit}>
      <div className="mb-4 rounded-2xl bg-sky-50 px-4 py-3 text-sm text-sky-800 ring-1 ring-sky-200">
        تعديل البيانات الأساسية للمدرسة. يمكنك تحديث جميع الحقول ثم الضغط على حفظ التغييرات.
      </div>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <Input label="اسم المدرسة" value={form.name || ''} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="مثال: متوسطة الملك فهد" />
        <Input label="المدينة" value={form.city || ''} onChange={(e) => setForm({ ...form, city: e.target.value })} placeholder="مثال: الرياض" />
        <Input label="الرقم الوزاري" value={form.code || ''} onChange={(e) => setForm({ ...form, code: e.target.value })} placeholder="مثال: RYD-001" />
        <Input label="مدير المدرسة" value={form.manager || ''} onChange={(e) => setForm({ ...form, manager: e.target.value })} placeholder="اسم المدير" />
      </div>
      <div className="mt-4 border-t border-slate-200 pt-4">
        <div className="mb-3 text-sm font-bold text-slate-600">بيانات حساب مدير المدرسة</div>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <Input label="اسم دخول مدير المدرسة" value={form.principalUsername || ''} onChange={(e) => setForm({ ...form, principalUsername: e.target.value.trim().toLowerCase() })} placeholder="مثال: ryd001.principal" />
          <Input label="البريد الإلكتروني لمدير المدرسة" value={form.principalEmail || ''} onChange={(e) => setForm({ ...form, principalEmail: e.target.value.trim().toLowerCase() })} placeholder="principal@example.com" />
          <Input label="رقم جوال مدير المدرسة" value={form.principalPhone || ''} onChange={(e) => setForm({ ...form, principalPhone: e.target.value })} placeholder="مثال: 05xxxxxxxx" type="tel" />
          <Input label="كلمة المرور الجديدة (اتركها فارغة للإبقاء على الحالية)" value={form.principalPassword || ''} onChange={(e) => setForm({ ...form, principalPassword: e.target.value })} placeholder="اتركها فارغة للإبقاء" />
        </div>
      </div>
      <div className="mt-6 flex justify-end gap-4">
        <button type="button" onClick={onCancel} className="rounded-xl bg-slate-100 px-4 py-2 font-bold text-slate-700">إلغاء</button>
        <button type="submit" className="rounded-xl bg-sky-700 px-4 py-2 font-bold text-white">حفظ التغييرات</button>
      </div>
    </form>
  );
}


export default EditSchoolForm;

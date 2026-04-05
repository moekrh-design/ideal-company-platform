/**
 * ==========================================
 *  PointsRewardsConfigPage Component
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
import { SectionCard } from '../components/ui/SectionCard';


import { ActionCatalogEditor } from '../components/ui/ActionCatalogEditor';
import TeacherPointsCapSection from '../components/TeacherPointsCapSection';
import { PROGRAM_SUGGESTIONS_BANK, REWARD_SUGGESTIONS_BANK, VIOLATION_SUGGESTIONS_BANK } from '../constants/appConfig.js';
function PointsRewardsConfigPage({ selectedSchool, settings, currentUser, onSaveSettings }) {
  const [localSettings, setLocalSettings] = useState(settings);
  const [saveStatus, setSaveStatus] = useState('idle'); // idle | saving | saved
  const justSavedRef = React.useRef(false);
  const [hasUnsaved, setHasUnsaved] = useState(false);

  useEffect(() => {
    if (!justSavedRef.current) {
      setLocalSettings(settings);
      setHasUnsaved(false);
    }
  }, [settings]);

  const save = () => {
    justSavedRef.current = true;
    setSaveStatus('saving');
    onSaveSettings({
      ...localSettings,
      actions: hydrateActionCatalog(localSettings.actions),
    });
    setTimeout(() => { setSaveStatus('saved'); setHasUnsaved(false); }, 400);
    setTimeout(() => {
      setSaveStatus('idle');
      justSavedRef.current = false;
    }, 2800);
  };

  const updateSettings = (updater) => {
    setLocalSettings(updater);
    setHasUnsaved(true);
  };

  const overview = [
    { label: 'بنود المكافآت', value: localSettings.actions?.rewards?.length || 0, tone: 'emerald' },
    { label: 'بنود الخصم', value: localSettings.actions?.violations?.length || 0, tone: 'rose' },
    { label: 'البرامج المعتمدة', value: localSettings.actions?.programs?.length || 0, tone: 'sky' },
    { label: 'نقاط المعلم للمكافأة', value: localSettings.teacherPoints?.perReward ?? 5, tone: 'amber' },
  ];

  return (
    <div className="space-y-6">
      <SectionCard title="النقاط والمكافآت والخصومات والبرامج" icon={Trophy} action={<div className="flex gap-2"><button onClick={() => setLocalSettings(settings)} className="inline-flex items-center gap-2 rounded-2xl bg-slate-100 px-4 py-3 font-bold text-slate-700"><RefreshCw className="h-4 w-4" /> التراجع</button><button onClick={save} disabled={saveStatus === 'saving'} className={`inline-flex items-center gap-2 rounded-2xl px-5 py-3 font-bold text-white transition-all duration-300 shadow-md ${saveStatus === 'saved' ? 'bg-emerald-600 scale-105 shadow-emerald-300' : saveStatus === 'saving' ? 'bg-sky-400 cursor-wait' : 'bg-sky-700 hover:bg-sky-800 hover:scale-105'}`}>{saveStatus === 'saving' ? <><RefreshCw className="h-4 w-4 animate-spin" /> جارٍ الحفظ...</> : saveStatus === 'saved' ? <><CheckCircle className="h-4 w-4" /> تم الحفظ ✓</> : <><Save className="h-4 w-4" /> حفظ التعديلات</>}</button></div>}>
        <div className="mb-5 rounded-3xl bg-sky-50 p-5 ring-1 ring-sky-100">
          <div className="font-black text-sky-900">وصول أسرع لبنود النقاط</div>
          <div className="mt-2 text-sm leading-7 text-sky-900">تم جمع إعدادات النقاط وبنود المكافآت والخصومات والبرامج في صفحة مستقلة داخل القائمة الجانبية حتى تكون أوضح وأسهل للمدير في الوصول والتحرير والمتابعة.</div>
        </div>
        <div className="grid grid-cols-2 gap-4 xl:grid-cols-4">
          {overview.map((item) => <div key={item.label} className="rounded-3xl bg-white p-5 ring-1 ring-slate-200"><div className="text-sm font-bold text-slate-500">{item.label}</div><div className={`mt-3 text-3xl font-black ${item.tone === 'emerald' ? 'text-emerald-700' : item.tone === 'rose' ? 'text-rose-700' : item.tone === 'amber' ? 'text-amber-700' : 'text-sky-700'}`}>{item.value}</div></div>)}
        </div>
      </SectionCard>

      <SectionCard title="نظام نقاط الحضور التلقائي" icon={ClipboardCheck}>
        <div className="mb-5 flex items-start justify-between gap-4 rounded-3xl bg-emerald-50 p-5 ring-1 ring-emerald-100">
          <div>
            <div className="font-black text-emerald-900">تفعيل نظام النقاط التلقائي للحضور والغياب</div>
            <div className="mt-2 text-sm leading-7 text-emerald-800">عند التفعيل، يحصل كل طالب تلقائياً على نقاط الحضور اليومية. ولا تُخصم النقاط إلا إذا سجّل المعلم الطالب غائباً أو متأخراً صراحةً. الأصل هو الحضور.</div>
          </div>
          <button onClick={() => setLocalSettings({ ...localSettings, attendancePointsSystem: { ...(localSettings.attendancePointsSystem || {}), enabled: !(localSettings.attendancePointsSystem?.enabled) } })} className={`flex-shrink-0 rounded-2xl px-5 py-3 font-black transition-colors ${localSettings.attendancePointsSystem?.enabled ? 'bg-emerald-600 text-white' : 'bg-slate-200 text-slate-600'}`}>{localSettings.attendancePointsSystem?.enabled ? '✓ مفعّل' : 'معطّل'}</button>
        </div>
        {localSettings.attendancePointsSystem?.enabled && (
          <div className="space-y-5">
            <div className="rounded-3xl bg-white p-5 ring-1 ring-slate-200">
              <div className="mb-4 font-black text-slate-900">نقاط الحضور</div>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div>
                  <Input label="نقاط الحضور اليومي (الأساسية)" type="number" min="0" value={localSettings.attendancePointsSystem?.dailyPresencePoints ?? 5} onChange={(e) => setLocalSettings({ ...localSettings, attendancePointsSystem: { ...(localSettings.attendancePointsSystem || {}), dailyPresencePoints: safeNumber(e.target.value) } })} />
                  <div className="mt-2 text-xs text-slate-500">تُضاف تلقائياً لكل طالب مع بداية اليوم الدراسي. الأصل هو الحضور.</div>
                </div>
                <div>
                  <Input label="نقاط مكافأة الحضور المبكر (إضافية)" type="number" min="0" value={localSettings.attendancePointsSystem?.earlyBonusPoints ?? 3} onChange={(e) => setLocalSettings({ ...localSettings, attendancePointsSystem: { ...(localSettings.attendancePointsSystem || {}), earlyBonusPoints: safeNumber(e.target.value) } })} />
                  <div className="mt-2 text-xs text-slate-500">تُضاف فوق النقاط الأساسية لمن يسجل حضوره مبكراً عبر البوابة. الإجمالي = الأساسية + المبكر.</div>
                </div>
              </div>
            </div>
            <div className="rounded-3xl bg-white p-5 ring-1 ring-slate-200">
              <div className="mb-4 font-black text-slate-900">خصومات الغياب والتأخر</div>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                <div>
                  <Input label="خصم الغياب (بدون عذر)" type="number" min="0" value={localSettings.attendancePointsSystem?.absentDeductPoints ?? 3} onChange={(e) => setLocalSettings({ ...localSettings, attendancePointsSystem: { ...(localSettings.attendancePointsSystem || {}), absentDeductPoints: safeNumber(e.target.value) } })} />
                  <div className="mt-2 text-xs text-rose-600">تُسحب النقاط الأساسية + هذا الخصم عند تسجيل المعلم للطالب غائباً. الإجمالي = -(الأساسية + الخصم).</div>
                </div>
                <div>
                  <Input label="خصم التأخر" type="number" min="0" value={localSettings.attendancePointsSystem?.lateDeductPoints ?? 3} onChange={(e) => setLocalSettings({ ...localSettings, attendancePointsSystem: { ...(localSettings.attendancePointsSystem || {}), lateDeductPoints: safeNumber(e.target.value) } })} />
                  <div className="mt-2 text-xs text-amber-600">تُسحب من النقاط الأساسية عند تسجيل المعلم للطالب متأخراً. الطالب يحتفظ بالفرق.</div>
                </div>
                <div>
                  <Input label="نقاط الغياب بعذر" type="number" min="0" value={localSettings.attendancePointsSystem?.excusedPoints ?? 0} onChange={(e) => setLocalSettings({ ...localSettings, attendancePointsSystem: { ...(localSettings.attendancePointsSystem || {}), excusedPoints: safeNumber(e.target.value) } })} />
                  <div className="mt-2 text-xs text-sky-600">تُسحب النقاط الأساسية لكن لا يُطبَّق خصم إضافي. القيمة هنا هي ما يحتفظ به الطالب (0 = لا شيء).</div>
                </div>
              </div>
            </div>
            <div className="rounded-3xl bg-amber-50 p-4 ring-1 ring-amber-100">
              <div className="font-black text-amber-900">ملخص النظام</div>
              <div className="mt-3 grid grid-cols-2 gap-3 md:grid-cols-4">
                <div className="rounded-2xl bg-white p-3 text-center ring-1 ring-slate-200"><div className="text-xs text-slate-500">حضور مبكر</div><div className="mt-1 text-2xl font-black text-emerald-700">+{(localSettings.attendancePointsSystem?.dailyPresencePoints ?? 5) + (localSettings.attendancePointsSystem?.earlyBonusPoints ?? 3)}</div></div>
                <div className="rounded-2xl bg-white p-3 text-center ring-1 ring-slate-200"><div className="text-xs text-slate-500">حضور عادي</div><div className="mt-1 text-2xl font-black text-sky-700">+{localSettings.attendancePointsSystem?.dailyPresencePoints ?? 5}</div></div>
                <div className="rounded-2xl bg-white p-3 text-center ring-1 ring-slate-200"><div className="text-xs text-slate-500">متأخر</div><div className="mt-1 text-2xl font-black text-amber-700">+{Math.max(0, (localSettings.attendancePointsSystem?.dailyPresencePoints ?? 5) - (localSettings.attendancePointsSystem?.lateDeductPoints ?? 3))}</div></div>
                <div className="rounded-2xl bg-white p-3 text-center ring-1 ring-slate-200"><div className="text-xs text-slate-500">غائب</div><div className="mt-1 text-2xl font-black text-rose-700">-{localSettings.attendancePointsSystem?.absentDeductPoints ?? 3}</div></div>
              </div>
            </div>
          </div>
        )}
      </SectionCard>

      <SectionCard title="درجات النقاط الأساسية" icon={BadgeCheck}>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-5">
          <Input label="نقاط الحضور المبكر" type="number" value={localSettings.points?.early ?? 0} onChange={(e) => setLocalSettings({ ...localSettings, points: { ...localSettings.points, early: safeNumber(e.target.value) } })} />
          <Input label="نقاط الحضور في الوقت" type="number" value={localSettings.points?.onTime ?? 0} onChange={(e) => setLocalSettings({ ...localSettings, points: { ...localSettings.points, onTime: safeNumber(e.target.value) } })} />
          <Input label="خصم التأخر" type="number" value={localSettings.points?.late ?? 0} onChange={(e) => setLocalSettings({ ...localSettings, points: { ...localSettings.points, late: safeNumber(e.target.value) } })} />
          <Input label="نقاط المبادرة" type="number" value={localSettings.points?.initiative ?? 0} onChange={(e) => setLocalSettings({ ...localSettings, points: { ...localSettings.points, initiative: safeNumber(e.target.value) } })} />
          <Input label="نقاط السلوك" type="number" value={localSettings.points?.behavior ?? 0} onChange={(e) => setLocalSettings({ ...localSettings, points: { ...localSettings.points, behavior: safeNumber(e.target.value) } })} />
        </div>
        <div className="mt-5 rounded-3xl bg-slate-50 p-5 ring-1 ring-slate-200">
          <div className="font-black text-slate-900">نقاط المعلمين</div>
          <div className="mt-2 text-sm leading-7 text-slate-500">هذه القيم تضبط الرصيد العام للمعلم عند تنفيذ المكافآت والخصومات والبرامج.</div>
          <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-3">
            <Input label="نقاط المعلم لكل مكافأة" type="number" value={localSettings.teacherPoints?.perReward ?? 5} onChange={(e) => setLocalSettings({ ...localSettings, teacherPoints: { ...localSettings.teacherPoints, perReward: safeNumber(e.target.value) } })} />
            <Input label="نقاط المعلم لكل خصم" type="number" value={localSettings.teacherPoints?.perViolation ?? 2} onChange={(e) => setLocalSettings({ ...localSettings, teacherPoints: { ...localSettings.teacherPoints, perViolation: safeNumber(e.target.value) } })} />
            <Input label="نقاط المعلم لكل برنامج" type="number" value={localSettings.teacherPoints?.perProgram ?? 10} onChange={(e) => setLocalSettings({ ...localSettings, teacherPoints: { ...localSettings.teacherPoints, perProgram: safeNumber(e.target.value) } })} />
          </div>
        </div>
      </SectionCard>

      <TeacherPointsCapSection selectedSchool={selectedSchool} currentUser={currentUser} />

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        <ActionCatalogEditor title="بنك المكافآت والقيم" description="اختر القيم والسلوكيات التي تستحق المكافأة، وأضف بنودًا جديدة عند الحاجة." mode="reward" items={localSettings.actions?.rewards || []} suggestions={REWARD_SUGGESTIONS_BANK} onChange={(items) => updateSettings({ ...localSettings, actions: { ...localSettings.actions, rewards: items } })} />
        <ActionCatalogEditor title="بنك الخصومات والسلوكيات" description="اختر السلوكيات أو المخالفات التي تستحق الخصم، مع إمكانية تعديل الدرجة والوصف." mode="violation" items={localSettings.actions?.violations || []} suggestions={VIOLATION_SUGGESTIONS_BANK} onChange={(items) => updateSettings({ ...localSettings, actions: { ...localSettings.actions, violations: items } })} />
        <ActionCatalogEditor title="بنك البرامج المقترحة" description="هذه البرامج تظهر للمعلم في قائمة منسدلة عند تسجيل البرامج أو الأنشطة للطالب." mode="program" items={localSettings.actions?.programs || []} suggestions={PROGRAM_SUGGESTIONS_BANK} onChange={(items) => updateSettings({ ...localSettings, actions: { ...localSettings.actions, programs: items } })} />
      </div>

      {/* زر الحفظ العائم الثابت - يظهر عند وجود تعديلات غير محفوظة */}
      {hasUnsaved && (
        <div className="fixed bottom-6 left-1/2 z-50 -translate-x-1/2">
          <div className="flex items-center gap-3 rounded-2xl bg-white px-5 py-3 shadow-2xl ring-2 ring-amber-400">
            <span className="text-sm font-bold text-amber-700">⚠️ يوجد تعديلات غير محفوظة</span>
            <button
              onClick={() => { setLocalSettings(settings); setHasUnsaved(false); }}
              className="rounded-xl bg-slate-100 px-4 py-2 text-sm font-bold text-slate-600 hover:bg-slate-200"
            >
              تراجع
            </button>
            <button
              onClick={save}
              disabled={saveStatus === 'saving'}
              className={`inline-flex items-center gap-2 rounded-xl px-5 py-2 text-sm font-bold text-white transition-all ${
                saveStatus === 'saved' ? 'bg-emerald-600' :
                saveStatus === 'saving' ? 'cursor-wait bg-sky-400' :
                'bg-sky-700 hover:bg-sky-800'
              }`}
            >
              {saveStatus === 'saving' ? (
                <><RefreshCw className="h-4 w-4 animate-spin" /> جارٍ الحفظ...</>
              ) : saveStatus === 'saved' ? (
                <><CheckCircle className="h-4 w-4" /> تم الحفظ ✓</>
              ) : (
                <><Save className="h-4 w-4" /> حفظ التعديلات</>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default PointsRewardsConfigPage;

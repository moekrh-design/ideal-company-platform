/**
 * ==========================================
 *  MessagingCenterPage Component
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
import { DataTable } from '../components/ui/DataTable';
import { SectionCard } from '../components/ui/SectionCard';
import { StatCard } from '../components/ui/StatCard';


import { Badge } from '../components/ui/FormElements';
function MessagingCenterPage({ selectedSchool, currentUser, onSendMessage, onTestIntegration, onSaveMessagingSettings, onSaveMessageTemplate, onDeleteMessageTemplate, onSaveMessageRule, onToggleMessageRule }) {
  const [tab, setTab] = useState("dashboard");
  const center = useMemo(() => hydrateMessagingCenter(selectedSchool?.messaging), [selectedSchool]);
  const [integrationNotice, setIntegrationNotice] = useState('');
  const templates = center.templates || [];
  const rules = center.rules || [];
  const logs = center.logs || [];
  const schoolStudents = useMemo(() => getUnifiedSchoolStudents(selectedSchool, { includeArchived: false, preferStructure: true }), [selectedSchool]);
  const audienceOptions = [
    { key: "allStudents", label: "جميع الطلاب", students: schoolStudents },
    { key: "lateToday", label: "المتأخرون اليوم", students: schoolStudents.filter((student) => student.status === "متأخر") },
    { key: "behavior", label: "غير المنضبطين", students: schoolStudents.filter((student) => Number(student.points || 0) < 100) },
    { key: "positive", label: "رسائل إيجابية", students: schoolStudents.filter((student) => Number(student.points || 0) >= 120) },
  ];

  const templatePresets = [
    { id: 'preset-late-whatsapp', label: 'تأخر عبر واتساب', category: 'تأخر', channel: 'whatsapp', language: 'ar', message: 'نحيطكم علمًا بأن الطالب {اسم_الطالب} من {الفصل} وصل متأخرًا اليوم عند الساعة {وقت_التأخر}. نأمل المتابعة.' },
    { id: 'preset-absence-sms', label: 'غياب عبر SMS', category: 'غياب', channel: 'sms', language: 'ar', message: 'نفيدكم بغياب الطالب {اسم_الطالب} اليوم من {المدرسة}. نأمل التحقق وإشعار المدرسة بسبب الغياب.' },
    { id: 'preset-behavior-whatsapp', label: 'مخالفة سلوكية', category: 'سلوك', channel: 'whatsapp', language: 'ar', message: 'نحيطكم علمًا بتسجيل ملاحظة سلوكية على الطالب {اسم_الطالب}. نوع الملاحظة: {نوع_المخالفة}. رصيد النقاط الحالي: {النقاط}.' },
    { id: 'preset-positive-internal', label: 'إشادة داخلية', category: 'إشادة', channel: 'internal', language: 'ar', message: 'أحسنتم، الطالب {اسم_الطالب} حقق أداءً إيجابيًا اليوم ونقاطه الحالية {النقاط}.' },
  ];
  const rulePresets = [
    { id: 'rule-late', label: 'قاعدة التأخر', eventType: 'late', condition: 'مرة واحدة', channel: 'whatsapp', execution: 'فوري', message: 'نحيطكم علمًا بأن الطالب {اسم_الطالب} تأخر هذا اليوم. وقت الوصول: {وقت_التأخر}.' },
    { id: 'rule-absence', label: 'قاعدة الغياب', eventType: 'absence', condition: 'بدون عذر', channel: 'sms', execution: 'بعد وقت الفحص', message: 'الطالب {اسم_الطالب} مسجل غائبًا اليوم في {المدرسة}.' },
    { id: 'rule-behavior', label: 'قاعدة السلوك', eventType: 'behavior', condition: 'عند تسجيل مخالفة', channel: 'whatsapp', execution: 'فوري', message: 'نحيطكم علمًا بتسجيل ملاحظة سلوكية على الطالب {اسم_الطالب}. نوع الملاحظة: {نوع_المخالفة}. رصيد النقاط الحالي: {النقاط}.' },
    { id: 'rule-positive', label: 'قاعدة الإشادة', eventType: 'positive', condition: 'عند استحقاق الإشادة', channel: 'internal', execution: 'فوري', message: 'نبارك للطالب {اسم_الطالب} هذا التميز، وقد بلغ رصيد نقاطه {النقاط}.' },
  ];
  const [manualForm, setManualForm] = useState({ audience: "lateToday", channel: "whatsapp", subject: "تنبيه تأخر", templateId: String(templates[0]?.id || ""), message: templates[0]?.message || "", sendMode: "now" });
  const [templateForm, setTemplateForm] = useState({ id: null, name: "", category: "رسالة عامة", channel: "whatsapp", language: "ar", message: "", active: true });
  const [ruleForm, setRuleForm] = useState({ id: null, name: "", eventType: "late", target: "guardians", condition: "مرة واحدة", channel: "whatsapp", message: "", execution: "فوري", preventDuplicates: true, active: true });
  const [settingsDraft, setSettingsDraft] = useState(center.settings);

  useEffect(() => {
    const selectedTemplate = templates.find((item) => String(item.id) === String(manualForm.templateId));
    setManualForm((prev) => ({ ...prev, message: selectedTemplate?.message || prev.message }));
  }, [manualForm.templateId]);

  useEffect(() => {
    setSettingsDraft(center.settings);
  }, [center.settings]);

  const updateIntegrationField = (channel, field, value) => {
    setSettingsDraft((prev) => ({
      ...prev,
      integration: {
        ...prev.integration,
        [channel]: {
          ...prev.integration[channel],
          [field]: value,
        },
      },
    }));
  };

  const handleTestIntegration = async (channel) => {
    try {
      onSaveMessagingSettings(settingsDraft);
      const result = await onTestIntegration?.(channel, settingsDraft);
      setIntegrationNotice(result?.message || 'تم تنفيذ اختبار الربط.');
    } catch (error) {
      setIntegrationNotice(error?.message || 'تعذر تنفيذ اختبار الربط.');
    }
  };

  if (!selectedSchool) {
    return <SectionCard title="الرسائل والتنبيهات" icon={Bell}><div className="text-sm text-slate-500">اختر مدرسة أولًا لعرض مركز الرسائل والتنبيهات.</div></SectionCard>;
  }

  const selectedAudience = audienceOptions.find((item) => item.key === manualForm.audience) || audienceOptions[0];
  const previewStudent = selectedAudience?.students?.[0] || schoolStudents[0] || {};
  const previewText = applyMessageVariables(manualForm.message, {
    studentName: previewStudent.name,
    grade: previewStudent.grade,
    className: previewStudent.className,
    companyName: getStudentGroupingLabel(previewStudent, selectedSchool),
    schoolName: selectedSchool.name,
    lateTime: '06:52',
    points: previewStudent.points || 0,
  });

  const messagePreviewPayload = {
    studentName: previewStudent.name,
    grade: previewStudent.grade,
    className: previewStudent.className,
    companyName: getStudentGroupingLabel(previewStudent, selectedSchool),
    schoolName: selectedSchool.name,
    lateTime: '06:52',
    violationType: 'مخالفة سلوكية',
    points: previewStudent.points || 0,
  };
  const templatePreviewText = applyMessageVariables(templateForm.message, messagePreviewPayload);
  const linkedRuleTemplate = getDefaultTemplateForEvent(templates, ruleForm.eventType, ruleForm.channel);
  const effectiveRuleMessage = String(ruleForm.message || '').trim() || linkedRuleTemplate?.message || '';
  const rulePreviewText = applyMessageVariables(effectiveRuleMessage, messagePreviewPayload);
  const stats = {
    today: logs.filter((item) => String(item.createdAt || '').slice(0, 10) === getTodayIso()).length,
    scheduled: logs.filter((item) => item.type === 'مجدولة').length,
    failed: logs.filter((item) => item.status === 'فشل').length,
    autoRules: rules.filter((item) => item.active).length,
  };
  const tabButton = (key, label) => (
    <button onClick={() => setTab(key)} className={cx("rounded-2xl px-4 py-3 text-sm font-bold transition", tab === key ? "bg-sky-700 text-white" : "bg-white text-slate-700 ring-1 ring-slate-200")}>{label}</button>
  );

  return (
    <div className="space-y-6">
      <div className="rounded-[2rem] bg-gradient-to-l from-sky-900 via-cyan-800 to-emerald-700 p-6 text-white shadow-lg">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="text-sm text-white/80">مركز تشغيل المدرسة</div>
            <div className="mt-2 text-3xl font-black">الرسائل والتنبيهات</div>
            <div className="mt-2 max-w-3xl text-sm leading-7 text-white/90">مركز موحد لإرسال الرسائل يدويًا وجدولتها وإدارة القوالب والقواعد التلقائية مع سجل تشغيلي واضح وصلاحية قابلة للإسناد.</div>
          </div>
          <div className="rounded-3xl bg-white/10 px-5 py-4 text-sm ring-1 ring-white/15">
            <div className="text-white/75">المدرسة الحالية</div>
            <div className="mt-1 text-lg font-black">{selectedSchool.name}</div>
            <div className="mt-2 text-white/80">المستخدم: {currentUser?.name || '—'}</div>
          </div>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard title="رسائل اليوم" value={stats.today} subtitle="الإرسال المنفذ أو المجدول اليوم" icon={Bell} />
        <StatCard title="قواعد نشطة" value={stats.autoRules} subtitle="تنبيهات تلقائية مفعلة" icon={Rocket} />
        <StatCard title="رسائل مجدولة" value={stats.scheduled} subtitle="بانتظار التنفيذ" icon={FileClock} />
        <StatCard title="حالات فشل" value={stats.failed} subtitle="رسائل تحتاج معالجة قناة أو بيانات" icon={ShieldAlert} />
      </div>

      <div className="flex flex-wrap gap-3">
        {tabButton("dashboard", "لوحة الرسائل")}
        {tabButton("manual", "الإرسال اليدوي")}
        {tabButton("rules", "التنبيهات التلقائية")}
        {tabButton("templates", "القوالب")}
        {tabButton("logs", "السجل والتقارير")}
        {tabButton("settings", "الإعدادات")}
      </div>

      {tab === "dashboard" && (
        <div className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
          <SectionCard title="ملخص تشغيلي" icon={BarChart3}>
            <div className="grid gap-4 md:grid-cols-2">
              {audienceOptions.map((item) => (
                <div key={item.key} className="rounded-3xl bg-slate-50 p-4 ring-1 ring-slate-200">
                  <div className="flex items-center justify-between gap-3">
                    <div className="font-black text-slate-800">{item.label}</div>
                    <Badge tone={item.key === 'positive' ? 'green' : item.key === 'behavior' ? 'rose' : 'blue'}>{item.students.length}</Badge>
                  </div>
                  <div className="mt-2 text-sm text-slate-500">عدد المستهدفين القابلين للاستخدام فورًا داخل هذا المسار.</div>
                </div>
              ))}
            </div>
            <div className="mt-5 rounded-3xl bg-slate-50 p-4 ring-1 ring-slate-200">
              <div className="font-black text-slate-800">آخر الرسائل</div>
              <div className="mt-3 space-y-3">
                {logs.slice(0, 4).map((item) => (
                  <div key={item.id} className="rounded-2xl bg-white p-4 ring-1 ring-slate-200">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div className="font-bold text-slate-800">{item.subject}</div>
                      <Badge tone={item.status === 'نجاح' ? 'green' : item.status === 'جزئي' ? 'amber' : item.status === 'فشل' ? 'rose' : 'blue'}>{item.status}</Badge>
                    </div>
                    <div className="mt-2 text-sm text-slate-500">{formatDateTime(item.createdAt)} · {item.channel} · {item.recipients} مستفيد</div>
                  </div>
                ))}
                {!logs.length && <div className="rounded-2xl bg-white p-6 text-sm text-slate-500 ring-1 ring-slate-200">لا توجد رسائل مسجلة بعد في هذا المركز.</div>}
              </div>
            </div>
          </SectionCard>
          <SectionCard title="حالة القنوات" icon={MonitorSmartphone}>
            <div className="space-y-4">
              {[['whatsapp','واتساب'],['sms','رسائل SMS'],['internal','إشعار داخلي']].map(([key,label]) => (
                <div key={key} className="flex items-center justify-between rounded-2xl bg-slate-50 px-4 py-4 ring-1 ring-slate-200">
                  <div>
                    <div className="font-bold text-slate-800">{label}</div>
                    <div className="text-sm text-slate-500">{center.settings.channels[key] ? 'القناة مفعلة' : 'القناة غير مفعلة'}</div>
                  </div>
                  <Badge tone={center.settings.channels[key] ? 'green' : 'slate'}>{center.settings.channels[key] ? 'نشطة' : 'متوقفة'}</Badge>
                </div>
              ))}
            </div>
          </SectionCard>
        </div>
      )}

      {tab === "manual" && (
        <div className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
          <SectionCard title="إرسال يدوي" icon={Bell}>
            <div className="grid gap-4 md:grid-cols-2">
              <Select label="الفئة المستهدفة" value={manualForm.audience} onChange={(e) => setManualForm((prev) => ({ ...prev, audience: e.target.value }))}>
                {audienceOptions.map((item) => <option key={item.key} value={item.key}>{item.label} ({item.students.length})</option>)}
              </Select>
              <Select label="القناة" value={manualForm.channel} onChange={(e) => setManualForm((prev) => ({ ...prev, channel: e.target.value }))}>
                <option value="whatsapp">واتساب</option>
                <option value="sms">SMS</option>
                <option value="internal">إشعار داخلي</option>
              </Select>
              <Input label="عنوان الرسالة" value={manualForm.subject} onChange={(e) => setManualForm((prev) => ({ ...prev, subject: e.target.value }))} placeholder="مثال: تنبيه تأخر صباحي" />
              <Select label="القالب" value={manualForm.templateId} onChange={(e) => setManualForm((prev) => ({ ...prev, templateId: e.target.value }))}>
                <option value="">بدون قالب</option>
                {templates.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}
              </Select>
              <Select label="طريقة التنفيذ" value={manualForm.sendMode} onChange={(e) => setManualForm((prev) => ({ ...prev, sendMode: e.target.value }))}>
                <option value="now">إرسال الآن</option>
                <option value="scheduled">جدولة</option>
              </Select>
              <div className="rounded-2xl bg-slate-50 p-4 text-sm text-slate-600 ring-1 ring-slate-200">يستهدف هذا الإرسال <span className="font-black text-slate-800">{selectedAudience?.students?.length || 0}</span> مستفيدًا وفق الفئة المختارة.</div>
              <div className="md:col-span-2">
                <label className="mb-2 block text-sm font-bold text-slate-700">نص الرسالة</label>
                <textarea value={manualForm.message} onChange={(e) => setManualForm((prev) => ({ ...prev, message: e.target.value }))} rows={7} className="min-h-[160px] w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none" placeholder="اكتب نص الرسالة أو اختر قالبًا جاهزًا" />
              </div>
            </div>
            <div className="mt-5 flex flex-wrap gap-3">
              <button onClick={async () => { const result = await onSendMessage({ ...manualForm, audienceLabel: selectedAudience?.label || 'مخصص' }); window.alert(result?.message || (result?.ok ? 'تم تنفيذ العملية.' : 'تعذر تنفيذ العملية')); }} className="inline-flex items-center gap-2 rounded-2xl bg-sky-700 px-5 py-3 font-bold text-white"><Bell className="h-4 w-4" /> {manualForm.sendMode === 'scheduled' ? 'حفظ كرسالة مجدولة' : 'إرسال الآن'}</button>
              <button onClick={() => onSaveMessageTemplate({ name: manualForm.subject || 'قالب جديد', category: 'عام', channel: manualForm.channel, language: 'ar', message: manualForm.message, active: true })} className="inline-flex items-center gap-2 rounded-2xl bg-white px-5 py-3 font-bold text-slate-700 ring-1 ring-slate-200"><Save className="h-4 w-4" /> حفظ كقالب</button>
            </div>
          </SectionCard>
          <SectionCard title="المعاينة قبل الإرسال" icon={ClipboardList}>
            <div className="rounded-3xl bg-slate-950 p-5 text-white">
              <div className="text-sm text-white/70">المعاينة الذكية</div>
              <div className="mt-3 text-lg font-black">{manualForm.subject || 'بدون عنوان'}</div>
              <div className="mt-4 whitespace-pre-wrap text-sm leading-8 text-white/90">{previewText || 'اكتب نص الرسالة لتظهر المعاينة.'}</div>
            </div>
            <div className="mt-5 rounded-3xl bg-slate-50 p-4 ring-1 ring-slate-200">
              <div className="font-black text-slate-800">المتغيرات المدعومة</div>
              <div className="mt-3 flex flex-wrap gap-2">
                {["{اسم_الطالب}","{الصف}","{الفصل}","{الشركة}","{المدرسة}","{وقت_التأخر}","{النقاط}"].map((item) => <Badge key={item} tone="slate">{item}</Badge>)}
              </div>
            </div>
          </SectionCard>
        </div>
      )}

      {tab === "templates" && (
        <div className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
          <SectionCard title="مركز القوالب الذكي" icon={Archive}>
            <div className="rounded-3xl bg-sky-50 p-4 ring-1 ring-sky-100">
              <div className="text-sm font-bold text-sky-800">اختيار سريع</div>
              <div className="mt-3 grid gap-3 md:grid-cols-2">
                {templatePresets.map((preset) => (
                  <button
                    key={preset.id}
                    onClick={() => setTemplateForm((prev) => ({ ...prev, name: prev.name || preset.label, category: preset.category, channel: preset.channel, language: preset.language, message: preset.message }))}
                    className="rounded-2xl bg-white px-4 py-3 text-right text-sm font-bold text-slate-700 ring-1 ring-slate-200 transition hover:bg-slate-50"
                  >
                    <div>{preset.label}</div>
                    <div className="mt-1 text-xs font-medium text-slate-500">{preset.category} · {preset.channel}</div>
                  </button>
                ))}
              </div>
            </div>
            <div className="mt-5 grid gap-4 md:grid-cols-2">
              <Input label="اسم القالب" value={templateForm.name} onChange={(e) => setTemplateForm((prev) => ({ ...prev, name: e.target.value }))} />
              <Input label="التصنيف" value={templateForm.category} onChange={(e) => setTemplateForm((prev) => ({ ...prev, category: e.target.value }))} />
              <Select label="القناة" value={templateForm.channel} onChange={(e) => setTemplateForm((prev) => ({ ...prev, channel: e.target.value }))}>
                <option value="whatsapp">واتساب</option><option value="sms">SMS</option><option value="internal">إشعار داخلي</option>
              </Select>
              <Select label="اللغة" value={templateForm.language} onChange={(e) => setTemplateForm((prev) => ({ ...prev, language: e.target.value }))}>
                <option value="ar">العربية</option><option value="en">English</option>
              </Select>
              <div className="md:col-span-2">
                <label className="mb-2 block text-sm font-bold text-slate-700">نص القالب</label>
                <textarea value={templateForm.message} onChange={(e) => setTemplateForm((prev) => ({ ...prev, message: e.target.value }))} rows={6} className="min-h-[150px] w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none" />
              </div>
            </div>
            <div className="mt-5 rounded-3xl bg-slate-950 p-5 text-white">
              <div className="text-sm text-white/70">معاينة القالب</div>
              <div className="mt-3 text-lg font-black">{templateForm.name || 'قالب جديد'}</div>
              <div className="mt-4 whitespace-pre-wrap text-sm leading-8 text-white/90">{templatePreviewText || 'أدخل نص القالب لتظهر المعاينة هنا.'}</div>
            </div>
            <div className="mt-5 flex flex-wrap gap-3">
              <button onClick={() => { onSaveMessageTemplate(templateForm); setTemplateForm({ id: null, name: '', category: 'رسالة عامة', channel: 'whatsapp', language: 'ar', message: '', active: true }); }} className="inline-flex items-center gap-2 rounded-2xl bg-sky-700 px-5 py-3 font-bold text-white"><Save className="h-4 w-4" /> حفظ القالب</button>
              <button onClick={() => setTemplateForm({ id: null, name: '', category: 'رسالة عامة', channel: 'whatsapp', language: 'ar', message: '', active: true })} className="inline-flex items-center gap-2 rounded-2xl bg-white px-5 py-3 font-bold text-slate-700 ring-1 ring-slate-200"><RefreshCw className="h-4 w-4" /> جديد</button>
            </div>
          </SectionCard>
          <SectionCard title="القوالب الجاهزة" icon={Copy}>
            <div className="mb-4 rounded-3xl bg-slate-50 p-4 ring-1 ring-slate-200">
              <div className="font-black text-slate-800">المتغيرات المدعومة</div>
              <div className="mt-3 flex flex-wrap gap-2">
                {["{اسم_الطالب}","{الصف}","{الفصل}","{الشركة}","{المدرسة}","{وقت_التأخر}","{نوع_المخالفة}","{النقاط}"].map((item) => <Badge key={item} tone="slate">{item}</Badge>)}
              </div>
            </div>
            <div className="space-y-3">
              {templates.map((item) => (
                <div key={item.id} className="rounded-3xl bg-slate-50 p-4 ring-1 ring-slate-200">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <div className="font-black text-slate-800">{item.name}</div>
                      <div className="mt-1 text-sm text-slate-500">{item.category} · {item.channel}</div>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <button onClick={() => setTemplateForm(item)} className="rounded-2xl bg-white px-3 py-2 text-sm font-bold text-slate-700 ring-1 ring-slate-200">تحرير</button>
                      {!item.isDefault && <button onClick={() => onDeleteMessageTemplate(item.id)} className="rounded-2xl bg-rose-50 px-3 py-2 text-sm font-bold text-rose-700 ring-1 ring-rose-100">حذف</button>}
                    </div>
                  </div>
                  <div className="mt-3 whitespace-pre-wrap text-sm leading-7 text-slate-600">{applyMessageVariables((String(item.message || '').trim() || getDefaultTemplateForEvent(templates, item.eventType, item.channel)?.message || ''), messagePreviewPayload)}</div>
              {!String(item.message || '').trim() ? <div className="mt-2 text-xs font-bold text-emerald-700">تستخدم هذه القاعدة القالب الافتراضي للحدث تلقائيًا.</div> : null}
                </div>
              ))}
            </div>
          </SectionCard>
        </div>
      )}

      {tab === "rules" && (
        <div className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
          <SectionCard title="القواعد التلقائية الذكية" icon={Rocket}>
            <div className="rounded-3xl bg-emerald-50 p-4 ring-1 ring-emerald-100">
              <div className="text-sm font-bold text-emerald-800">بناء سريع حسب الحدث</div>
              <div className="mt-3 grid gap-3 md:grid-cols-2">
                {rulePresets.map((preset) => (
                  <button
                    key={preset.id}
                    onClick={() => setRuleForm((prev) => ({ ...prev, name: prev.name || preset.label, eventType: preset.eventType, condition: preset.condition, channel: preset.channel, execution: preset.execution, message: preset.message }))}
                    className="rounded-2xl bg-white px-4 py-3 text-right text-sm font-bold text-slate-700 ring-1 ring-slate-200 transition hover:bg-slate-50"
                  >
                    <div>{preset.label}</div>
                    <div className="mt-1 text-xs font-medium text-slate-500">{preset.channel} · {preset.execution}</div>
                  </button>
                ))}
              </div>
            </div>
            <div className="mt-5 grid gap-4 md:grid-cols-2">
              <Input label="اسم القاعدة" value={ruleForm.name} onChange={(e) => setRuleForm((prev) => ({ ...prev, name: e.target.value }))} />
              <Select label="نوع الحدث" value={ruleForm.eventType} onChange={(e) => setRuleForm((prev) => ({ ...prev, eventType: e.target.value }))}>
                <option value="late">تأخر</option><option value="absence">غياب</option><option value="behavior">سلوك</option><option value="positive">إشادة</option>
              </Select>
              <Input label="الشرط" value={ruleForm.condition} onChange={(e) => setRuleForm((prev) => ({ ...prev, condition: e.target.value }))} />
              <Select label="القناة" value={ruleForm.channel} onChange={(e) => setRuleForm((prev) => ({ ...prev, channel: e.target.value }))}>
                <option value="whatsapp">واتساب</option><option value="sms">SMS</option><option value="internal">إشعار داخلي</option>
              </Select>
              <Input label="زمن التنفيذ" value={ruleForm.execution} onChange={(e) => setRuleForm((prev) => ({ ...prev, execution: e.target.value }))} />
              <label className="flex items-center gap-3 rounded-2xl bg-slate-50 px-4 py-3 text-sm font-bold text-slate-700 ring-1 ring-slate-200"><input type="checkbox" checked={ruleForm.preventDuplicates} onChange={(e) => setRuleForm((prev) => ({ ...prev, preventDuplicates: e.target.checked }))} /> منع التكرار</label>
              <div className="md:col-span-2">
                <label className="mb-2 block text-sm font-bold text-slate-700">نص القاعدة</label>
                <textarea value={ruleForm.message} onChange={(e) => setRuleForm((prev) => ({ ...prev, message: e.target.value }))} rows={5} className="min-h-[130px] w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none" />
              </div>
            </div>
            <div className="mt-5 rounded-3xl bg-slate-950 p-5 text-white">
              <div className="text-sm text-white/70">معاينة القاعدة</div>
              <div className="mt-3 text-lg font-black">{ruleForm.name || 'قاعدة جديدة'}</div>
              <div className="mt-4 whitespace-pre-wrap text-sm leading-8 text-white/90">{rulePreviewText || 'أدخل نص القاعدة لتظهر المعاينة هنا.'}</div>
            </div>
            <div className="mt-5 flex gap-3">
              <button onClick={() => { onSaveMessageRule(ruleForm); setRuleForm({ id: null, name: '', eventType: 'late', target: 'guardians', condition: 'مرة واحدة', channel: 'whatsapp', message: '', execution: 'فوري', preventDuplicates: true, active: true }); }} className="inline-flex items-center gap-2 rounded-2xl bg-sky-700 px-5 py-3 font-bold text-white"><Save className="h-4 w-4" /> حفظ القاعدة</button>
            </div>
          </SectionCard>
          <SectionCard title="القواعد الحالية" icon={ShieldCheck}>
            <div className="space-y-3">
              {rules.map((item) => (
                <div key={item.id} className="rounded-3xl bg-slate-50 p-4 ring-1 ring-slate-200">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <div className="font-black text-slate-800">{item.name}</div>
                      <div className="mt-1 text-sm text-slate-500">{item.eventType === 'late' ? 'تأخر' : item.eventType === 'absence' ? 'غياب' : item.eventType === 'behavior' ? 'سلوك / انضباط' : item.eventType} · {item.channel} · {item.execution}</div>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge tone={item.active ? 'green' : 'slate'}>{item.active ? 'نشطة' : 'متوقفة'}</Badge>
                      <button onClick={() => setRuleForm(item)} className="rounded-2xl bg-white px-3 py-2 text-sm font-bold text-slate-700 ring-1 ring-slate-200">تحرير</button>
                      <button onClick={() => onToggleMessageRule(item.id)} className="rounded-2xl bg-white px-3 py-2 text-sm font-bold text-slate-700 ring-1 ring-slate-200">{item.active ? 'إيقاف' : 'تفعيل'}</button>
                    </div>
                  </div>
                  <div className="mt-3 whitespace-pre-wrap text-sm leading-7 text-slate-600">{applyMessageVariables((String(item.message || '').trim() || getDefaultTemplateForEvent(templates, item.eventType, item.channel)?.message || ''), messagePreviewPayload)}</div>
              {!String(item.message || '').trim() ? <div className="mt-2 text-xs font-bold text-emerald-700">تستخدم هذه القاعدة القالب الافتراضي للحدث تلقائيًا.</div> : null}
                </div>
              ))}
            </div>
          </SectionCard>
        </div>
      )}

      {tab === "logs" && (
        <SectionCard title="السجل والتقارير" icon={ClipboardList}>
          <DataTable
            columns={[
              { key: 'createdAt', label: 'التاريخ والوقت', render: (row) => formatDateTime(row.createdAt) },
              { key: 'subject', label: 'العنوان' },
              { key: 'channel', label: 'القناة' },
              { key: 'senderName', label: 'المرسل' },
              { key: 'recipients', label: 'المستلمين' },
              { key: 'successCount', label: 'ناجح' },
              { key: 'failedCount', label: 'فاشل' },
              { key: 'status', label: 'الحالة', render: (row) => <Badge tone={row.status === 'نجاح' ? 'green' : row.status === 'جزئي' ? 'amber' : row.status === 'فشل' ? 'rose' : 'blue'}>{row.status}</Badge> },
            ]}
            rows={logs}
            emptyMessage="لا توجد عمليات إرسال مسجلة بعد"
          />
        </SectionCard>
      )}

      {tab === "settings" && (
        <div className="space-y-6">
          <SectionCard title="إعدادات التشغيل والقنوات" icon={Settings}>
            <div className="grid gap-6 lg:grid-cols-2">
              <div className="space-y-4">
                <div className="font-black text-slate-800">القنوات</div>
                {[['whatsapp','واتساب'],['sms','SMS'],['internal','الإشعار الداخلي']].map(([key,label]) => (
                  <label key={key} className="flex items-center justify-between rounded-2xl bg-slate-50 px-4 py-4 ring-1 ring-slate-200">
                    <span className="font-bold text-slate-700">{label}</span>
                    <input type="checkbox" checked={Boolean(settingsDraft.channels[key])} onChange={(e) => setSettingsDraft((prev) => ({ ...prev, channels: { ...prev.channels, [key]: e.target.checked } }))} />
                  </label>
                ))}
              </div>
              <div className="grid gap-4">
                <Input label="الحد الأعلى للمستلمين" type="number" value={settingsDraft.operations.batchLimit} onChange={(e) => setSettingsDraft((prev) => ({ ...prev, operations: { ...prev.operations, batchLimit: Number(e.target.value || 0) } }))} />
                <Input label="التأخير بين الرسائل بالثواني" type="number" value={settingsDraft.operations.delaySeconds} onChange={(e) => setSettingsDraft((prev) => ({ ...prev, operations: { ...prev.operations, delaySeconds: Number(e.target.value || 0) } }))} />
                <Input label="مدة حفظ السجل بالأيام" type="number" value={settingsDraft.operations.retentionDays} onChange={(e) => setSettingsDraft((prev) => ({ ...prev, operations: { ...prev.operations, retentionDays: Number(e.target.value || 0) } }))} />
                <Input label="وقت فحص الأحداث" value={settingsDraft.automation.checkTime} onChange={(e) => setSettingsDraft((prev) => ({ ...prev, automation: { ...prev.automation, checkTime: e.target.value } }))} />
                <label className="flex items-center gap-3 rounded-2xl bg-slate-50 px-4 py-4 font-bold text-slate-700 ring-1 ring-slate-200"><input type="checkbox" checked={Boolean(settingsDraft.automation.enabled)} onChange={(e) => setSettingsDraft((prev) => ({ ...prev, automation: { ...prev.automation, enabled: e.target.checked } }))} /> تفعيل التنبيهات التلقائية</label>
                <label className="flex items-center gap-3 rounded-2xl bg-slate-50 px-4 py-4 font-bold text-slate-700 ring-1 ring-slate-200"><input type="checkbox" checked={Boolean(settingsDraft.automation.lateAlerts)} onChange={(e) => setSettingsDraft((prev) => ({ ...prev, automation: { ...prev.automation, lateAlerts: e.target.checked } }))} /> إرسال تنبيه تلقائي عند التأخر</label>
                <label className="flex items-center gap-3 rounded-2xl bg-slate-50 px-4 py-4 font-bold text-slate-700 ring-1 ring-slate-200"><input type="checkbox" checked={Boolean(settingsDraft.automation.absenceAlerts)} onChange={(e) => setSettingsDraft((prev) => ({ ...prev, automation: { ...prev.automation, absenceAlerts: e.target.checked } }))} /> إرسال تنبيه تلقائي عند الغياب</label>
                <label className="flex items-center gap-3 rounded-2xl bg-slate-50 px-4 py-4 font-bold text-slate-700 ring-1 ring-slate-200"><input type="checkbox" checked={Boolean(settingsDraft.automation.behaviorAlerts)} onChange={(e) => setSettingsDraft((prev) => ({ ...prev, automation: { ...prev.automation, behaviorAlerts: e.target.checked } }))} /> إرسال تنبيه تلقائي عند المخالفات السلوكية وغير المنضبطين</label>
                <label className="flex items-center gap-3 rounded-2xl bg-slate-50 px-4 py-4 font-bold text-slate-700 ring-1 ring-slate-200"><input type="checkbox" checked={Boolean(settingsDraft.privacy.requireApprovalForBulk)} onChange={(e) => setSettingsDraft((prev) => ({ ...prev, privacy: { ...prev.privacy, requireApprovalForBulk: e.target.checked } }))} /> اعتماد المدير قبل الرسائل الجماعية</label>
              </div>
            </div>
          </SectionCard>

          <SectionCard title="بيانات الربط والتكامل" icon={ShieldCheck}>
            <div className="grid gap-6 xl:grid-cols-2">
              <div className="rounded-3xl bg-slate-50 p-5 ring-1 ring-slate-200">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <div className="text-lg font-black text-slate-800">ربط واتساب</div>
                    <div className="mt-1 text-sm text-slate-500">أدخل بيانات WhatsApp Cloud API ثم نفذ اختبارًا فعليًا من داخل المنصة.</div>
                  </div>
                  <Badge tone={settingsDraft.integration?.whatsapp?.status === 'جاهز مبدئيًا' ? 'green' : settingsDraft.integration?.whatsapp?.status === 'بيانات ناقصة' ? 'amber' : 'slate'}>{settingsDraft.integration?.whatsapp?.status || 'غير مرتبط'}</Badge>
                </div>
                <div className="mt-4 grid gap-4 md:grid-cols-2">
                  <Select label="نوع الربط" value={settingsDraft.integration?.whatsapp?.mode || 'cloud'} onChange={(e) => updateIntegrationField('whatsapp', 'mode', e.target.value)}>
                    <option value="cloud">WhatsApp Cloud API</option>
                    <option value="provider">مزود خارجي</option>
                  </Select>
                  <Input label="رقم اختبار الاستقبال" value={settingsDraft.integration?.whatsapp?.testRecipient || ''} onChange={(e) => updateIntegrationField('whatsapp', 'testRecipient', e.target.value)} placeholder="9665XXXXXXXX" />
                  <Input label="Phone Number ID" value={settingsDraft.integration?.whatsapp?.phoneNumberId || ''} onChange={(e) => updateIntegrationField('whatsapp', 'phoneNumberId', e.target.value)} placeholder="أدخل المعرف" />
                  <Input label="Business Account ID" value={settingsDraft.integration?.whatsapp?.businessAccountId || ''} onChange={(e) => updateIntegrationField('whatsapp', 'businessAccountId', e.target.value)} placeholder="اختياري" />
                  <div className="md:col-span-2">
                    <Input label="Access Token" type="password" value={settingsDraft.integration?.whatsapp?.accessToken || ''} onChange={(e) => updateIntegrationField('whatsapp', 'accessToken', e.target.value)} placeholder="ألصق التوكن هنا" />
                  </div>
                  <div className="md:col-span-2">
                    <Input label="Webhook Verify Token" value={settingsDraft.integration?.whatsapp?.webhookVerifyToken || ''} onChange={(e) => updateIntegrationField('whatsapp', 'webhookVerifyToken', e.target.value)} placeholder="رمز التحقق للويب هوك" />
                  </div>
                </div>
                <div className="mt-4 flex flex-wrap gap-3">
                  <button onClick={() => handleTestIntegration('whatsapp')} className="inline-flex items-center gap-2 rounded-2xl bg-white px-4 py-3 font-bold text-slate-700 ring-1 ring-slate-200"><ShieldCheck className="h-4 w-4" /> اختبار الربط</button>
                </div>
                <div className="mt-3 text-xs text-slate-500">آخر فحص: {settingsDraft.integration?.whatsapp?.lastCheckedAt ? formatDateTime(settingsDraft.integration.whatsapp.lastCheckedAt) : 'لم يتم بعد'}</div>
              </div>

              <div className="rounded-3xl bg-slate-50 p-5 ring-1 ring-slate-200">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <div className="text-lg font-black text-slate-800">ربط الرسائل النصية SMS</div>
                    <div className="mt-1 text-sm text-slate-500">أدخل بيانات المزود والمرسل ووسيلة التوثيق.</div>
                  </div>
                  <Badge tone={settingsDraft.integration?.sms?.status === 'جاهز مبدئيًا' ? 'green' : settingsDraft.integration?.sms?.status === 'بيانات ناقصة' ? 'amber' : 'slate'}>{settingsDraft.integration?.sms?.status || 'غير مرتبط'}</Badge>
                </div>
                <div className="mt-4 grid gap-4 md:grid-cols-2">
                  <Input label="اسم المزود" value={settingsDraft.integration?.sms?.provider || ''} onChange={(e) => updateIntegrationField('sms', 'provider', e.target.value)} placeholder="مثال: Unifonic" />
                  <Input label="اسم المرسل Sender ID" value={settingsDraft.integration?.sms?.senderId || ''} onChange={(e) => updateIntegrationField('sms', 'senderId', e.target.value)} placeholder="مثال: School" />
                  <div className="md:col-span-2">
                    <Input label="رابط API" value={settingsDraft.integration?.sms?.apiUrl || ''} onChange={(e) => updateIntegrationField('sms', 'apiUrl', e.target.value)} placeholder="https://..." />
                  </div>
                  <Input label="API Key" type="password" value={settingsDraft.integration?.sms?.apiKey || ''} onChange={(e) => updateIntegrationField('sms', 'apiKey', e.target.value)} placeholder="إن وجد" />
                  <Input label="رقم اختبار الاستقبال" value={settingsDraft.integration?.sms?.testRecipient || ''} onChange={(e) => updateIntegrationField('sms', 'testRecipient', e.target.value)} placeholder="9665XXXXXXXX" />
                  <Input label="اسم المستخدم" value={settingsDraft.integration?.sms?.username || ''} onChange={(e) => updateIntegrationField('sms', 'username', e.target.value)} placeholder="اختياري" />
                  <Input label="كلمة المرور" type="password" value={settingsDraft.integration?.sms?.password || ''} onChange={(e) => updateIntegrationField('sms', 'password', e.target.value)} placeholder="اختياري" />
                </div>
                <div className="mt-4 flex flex-wrap gap-3">
                  <button onClick={() => handleTestIntegration('sms')} className="inline-flex items-center gap-2 rounded-2xl bg-white px-4 py-3 font-bold text-slate-700 ring-1 ring-slate-200"><ShieldCheck className="h-4 w-4" /> اختبار الربط</button>
                </div>
                <div className="mt-3 text-xs text-slate-500">آخر فحص: {settingsDraft.integration?.sms?.lastCheckedAt ? formatDateTime(settingsDraft.integration.sms.lastCheckedAt) : 'لم يتم بعد'}</div>
              </div>
            </div>

            <div className="mt-5 rounded-2xl bg-emerald-50 px-4 py-4 text-sm leading-7 text-emerald-800 ring-1 ring-emerald-200">
              هذه الصفحة تدعم الآن الاختبار والإرسال الفعلي عبر الخادم عند اكتمال بيانات المزود. بالنسبة لرسائل SMS قد تحتاج بعض الشركات تنسيق API مختلفًا عن التنسيق العام المضمّن في هذه النسخة.
            </div>
            {integrationNotice && <div className="mt-4 rounded-2xl bg-sky-50 px-4 py-4 text-sm text-sky-800 ring-1 ring-sky-200">{integrationNotice}</div>}
          </SectionCard>

          <div className="flex gap-3">
            <button onClick={() => onSaveMessagingSettings(settingsDraft)} className="inline-flex items-center gap-2 rounded-2xl bg-sky-700 px-5 py-3 font-bold text-white"><Save className="h-4 w-4" /> حفظ جميع إعدادات الرسائل</button>
          </div>
        </div>
      )}
    </div>
  );
}

export default MessagingCenterPage;

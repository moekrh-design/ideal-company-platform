/**
 * ==========================================
 *  UsersPage Component
 *  تم استخراجه تلقائياً من App.jsx
 * ==========================================
 */
import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useFormValidation, validators } from '../hooks/useFormValidation';
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
import { SPECIAL_ITEM_TEMPLATES, appendGateSyncLog, applyMessageVariables, applyPointsToUnifiedStudent, applySchoolAccessToUser, buildCsv, buildHydratedClientState, buildLeavePassLink, buildLessonAttendanceSessionLabel, buildLessonSessionLink, buildPrintSummaryStats, buildPublicLink, buildRewardStoreScreenSummary, buildRewardStoreSummary, buildRolePermissions, buildStructureAttendanceBarcode, buildStudentNumberFromImport, buildTemplateStudentsCsv, buildWsUrl, canAccessPermission, canPrincipalManageUser, captureDataUrlFromVideo, clamp, clampDelegatedPermissions, clampScreenLabel, clearGateSyncLog, clearLeavePassParam, clearLessonSessionParam, clearSchoolStructureViewState, compareFaceSignatures, computeLessonAttendanceSessionSummary, computeTeacherSpecialScore, computeTeacherSpecialStats, createBarcode, createDefaultMessagingCenter, createDefaultSchoolAccess, createDefaultSmartLinks, createDefaultState, createDefaultUsers, createLeavePassEvent, createRewardStoreNotification, createSeedUsersForSchool, cx, defaultActionCatalog, defaultPermissionsByRole, defaultSettings, detectNoorOriginalRows, downloadFile, drawVisualSourceToCanvas, enhanceContrastForBarcode, enqueueGateOfflineScan, escapePrintHtml, exportRowsToWorkbook, exportToExcel, fileToDataUrl, findBestFaceMatch, findLabeledValueFromGrid, findStudentByKeyword, formatDateTime, formatEnglishDigits, formatLocalGateTimestamp, generateQrDataUrl, generateSchoolStructureClassrooms, getApprovedRewardStoreItems, getArabicDayKey, getAttendanceStudentsSource, getAuthActionMeta, getClassroomKeyFromCompanyRow, getCurrentAcademicTermId, getCurrentSlotFromTimetable, getDefaultLandingPage, getDefaultTemplateForEvent, getDisplayMotionVariant, getFaceProfileLabel, getFaceProfileState, getFaceProfileTone, getGateOfflineQueueKey, getGateOfflineQueueSummary, getGateSyncLogKey, getGateSyncLogSummary, getGateSyncStatusMeta, getLeavePassAgeMinutes, getLeavePassDestinationLabel, getLeavePassElapsedLabel, getLeavePassEventLabel, getLeavePassIdFromLocation, getLeavePassQueueMeta, getLeavePassStatusLabel, getLeavePassStatusTone, getLeavePassTimeline, getLeavePasses, getLessonAttendanceSessionStatusLabel, getLessonAttendanceSessionStatusTone, getLessonAttendanceSessions, getLessonSessionIdFromLocation, getLessonSessionTeacherTargets, getPublicModeFromLocation, getRewardStore, getRewardStoreDisplayItems, getRewardStoreDonorLabel, getRewardStoreStatusLabel, getRoleLabel, getSchoolAccess, getSchoolAttendanceBinding, getScreenTemplateLabel, getScreenTheme, getSessionToken, getShortStudentName, getStudentCompanyName, getStudentGroupingLabel, getStudentsForLessonClassroom, getTeacherSpecialItems, getTeacherSubjects, getTemplateCategoriesForEvent, getTickerTheme, getTodayIso, getTransitionLabel, getUnifiedCompanyRows, getUnifiedSchoolStudents, getVisualSourceSize, hydrateActionCatalog, hydrateActionLog, hydrateGateSyncCenterEvents, hydrateMessagingCenter, hydrateScanLog, hydrateSchools, hydrateTeacherSpecialItems, hydrateUsers, initialScanLog, initialSchools, isRoleEnabledForSchool, loadImageSource, loadPersistedState, loadServerCache, loadUiState, navItems, normalizeArabicHeader, normalizeImportRow, normalizePhoneNumber, normalizeRewardStoreItem, normalizeSearchDigits, normalizeSearchToken, normalizeSmartLinks, parseTeacherSubjects, parseTimeToMinutes, pickImportValue, pieColors, prependRewardStoreNotification, principalDelegableRoles, principalManageablePermissionKeys, printHtmlContent, readGateOfflineQueue, readGateSyncLog, readSchoolStructureViewState, removeGateOfflineQueueItem, removeGateSyncLogItem, resultTone, roles, safeLocalStorageGetItem, safeLocalStorageSetItem, safeNumber, sanitizeBarcodeValue, saveSchoolStructureViewState, saveServerCache, saveUiState, schoolCodeSlug, schoolHasStructureClassrooms, setSessionToken, sortUnifiedCompanyRows, splitTickerItems, statusFromResult, summarizeSchoolLiveState, toArabicDate, writeGateOfflineQueue, writeGateSyncLog, TeacherSpecialItemsEditor} from '../utils/sharedFunctions.jsx';
import { permissionDefinitions, schoolRoleDefinitions } from '../constants/appConfig.js';
import { Input, Select, FormError, FieldError } from '../components/ui/FormElements';
import { DataTable } from '../components/ui/DataTable';
import { SectionCard } from '../components/ui/SectionCard';
import { StatCard } from '../components/ui/StatCard';


import { Badge } from '../components/ui/FormElements';
function UsersPage({ users, schools, currentUser, selectedSchoolId, actionLog, settings, onAddUser, onSelectForEdit, editingUserId, onToggleUserStatus, onDeleteUser, onUpdateSchoolAccess, onOpenAccountSecurity, onOpenResetUserPassword }) {
  const canManageAll = currentUser?.role === "superadmin";
  const scopeSchoolId = canManageAll ? selectedSchoolId : currentUser?.schoolId;
  const scopedSchool = schools.find((school) => school.id === scopeSchoolId) || schools[0] || null;
  const roleOptions = canManageAll ? roles : roles.filter((role) => principalDelegableRoles.includes(role.key));
  const { errors, validate, clearError, clearAll } = useFormValidation();
  const [form, setForm] = useState({
    name: "",
    email: "",
    mobile: "",
    username: "",
    password: "123456",
    role: canManageAll ? "principal" : "teacher",
    schoolId: scopeSchoolId || schools[0]?.id || 1,
    permissions: clampDelegatedPermissions(currentUser, canManageAll ? "principal" : "teacher", buildRolePermissions(canManageAll ? "principal" : "teacher")),
    subjects: [],
    specialItems: [],
  });
  const [schoolAccess, setSchoolAccess] = useState(() => getSchoolAccess(scopedSchool));
  const [usersTab, setUsersTab] = useState("overview");
  const [accountSearch, setAccountSearch] = useState("");
  const [accountRoleFilter, setAccountRoleFilter] = useState("all");

  const permissionPresetOptions = useMemo(() => ([
    { key: 'clear', label: 'بدون صلاحيات', permissions: Object.fromEntries(permissionDefinitions.map((item) => [item.key, false])) },
    { key: 'currentRole', label: 'حسب الدور المختار', permissions: clampDelegatedPermissions(currentUser, form.role, buildRolePermissions(form.role)) },
    ...(canManageAll ? [{ key: 'principal', label: 'مثل مدير المدرسة', permissions: buildRolePermissions('principal') }] : []),
    ...(canManageAll ? [{ key: 'superadmin', label: 'مثل الأدمن العام', permissions: buildRolePermissions('superadmin') }] : []),
    { key: 'agent', label: 'مثل الوكيل', permissions: clampDelegatedPermissions(currentUser, 'agent', buildRolePermissions('agent')) },
    { key: 'counselor', label: 'مثل المرشد', permissions: clampDelegatedPermissions(currentUser, 'counselor', buildRolePermissions('counselor')) },
    { key: 'supervisor', label: 'مثل المشرف', permissions: clampDelegatedPermissions(currentUser, 'supervisor', buildRolePermissions('supervisor')) },
    { key: 'teacher', label: 'مثل المعلم', permissions: clampDelegatedPermissions(currentUser, 'teacher', buildRolePermissions('teacher')) },
    { key: 'gate', label: 'مثل البوابة', permissions: clampDelegatedPermissions(currentUser, 'gate', buildRolePermissions('gate')) },
  ]), [canManageAll, form.role]);

  useEffect(() => {
    const defaultRole = canManageAll ? "principal" : "teacher";
    setForm((prev) => ({
      ...prev,
      role: (canManageAll ? roles : roles.filter((role) => principalDelegableRoles.includes(role.key))).some((item) => item.key === prev.role) ? prev.role : defaultRole,
      schoolId: canManageAll ? (prev.schoolId || scopeSchoolId || schools[0]?.id || 1) : (scopeSchoolId || schools[0]?.id || 1),
      permissions: prev.permissions || clampDelegatedPermissions(currentUser, defaultRole, buildRolePermissions(defaultRole)),
      subjects: Array.isArray(prev.subjects) ? prev.subjects : [],
      specialItems: Array.isArray(prev.specialItems) ? prev.specialItems : [],
    }));
  }, [canManageAll, scopeSchoolId, schools]);

  useEffect(() => {
    setSchoolAccess(getSchoolAccess(scopedSchool));
  }, [scopedSchool]);

  const visibleUsers = users.filter((user) => {
    if (canManageAll) {
      if (!scopeSchoolId) return true;
      return user.role === "superadmin" || user.schoolId === scopeSchoolId;
    }
    return user.schoolId === currentUser?.schoolId;
  });

  const filteredVisibleUsers = visibleUsers.filter((user) => {
    if (accountRoleFilter !== "all" && user.role !== accountRoleFilter) return false;
    const query = normalizeSearchToken(accountSearch);
    if (!query) return true;
    const schoolName = user.role === "superadmin" ? "مركزي" : (schools.find((school) => school.id === user.schoolId)?.name || "");
    const values = [user.name, user.username, user.email, user.mobile, getRoleLabel(user.role), schoolName, user.status];
    return values.some((value) => normalizeSearchToken(String(value || '')).includes(query));
  });
  const teacherSpecialStatsMap = useMemo(() => Object.fromEntries(visibleUsers.filter((user) => user.role === 'teacher').map((user) => [String(user.id), computeTeacherSpecialStats(actionLog, user, settings)])), [visibleUsers, actionLog, settings]);

  const userTabs = [
    { key: "overview", label: "نظرة عامة" },
    { key: "add", label: "إضافة مستخدم" },
    { key: "accounts", label: "قائمة الحسابات" },
    ...(canManageAll && scopedSchool ? [{ key: "schoolAccess", label: "صلاحيات المدرسة" }] : []),
  ];

  const handleRoleChange = (role) => {
    setForm((prev) => ({
      ...prev,
      role,
      schoolId: role === "superadmin" ? null : (canManageAll ? (prev.schoolId || scopeSchoolId || schools[0]?.id || 1) : (scopeSchoolId || schools[0]?.id || 1)),
      permissions: clampDelegatedPermissions(currentUser, role, buildRolePermissions(role)),
    }));
  };

  const handlePermissionChange = (permissionKey, checked) => {
    setForm((prev) => ({
      ...prev,
      permissions: {
        ...prev.permissions,
        [permissionKey]: checked,
      },
    }));
  };

  const applyPermissionPreset = (permissions) => {
    setForm((prev) => ({
      ...prev,
      permissions: {
        ...Object.fromEntries(permissionDefinitions.map((item) => [item.key, false])),
        ...clampDelegatedPermissions(currentUser, form.role, permissions || {}),
      },
    }));
  };

  const enabledPermissionCount = permissionDefinitions.filter((permission) => Boolean(form.permissions?.[permission.key])).length;

  const submit = (e) => {
    e.preventDefault();
    const ok = validate({
      name:     [validators.required('الاسم')],
      username: [validators.username('اسم الدخول'), validators.notExists('اسم الدخول', users, 'username')],
      password: [validators.password('كلمة المرور')],
      email:    [validators.email('البريد الإلكتروني')],
      mobile:   [validators.mobile('رقم الجوال')],
    }, form);
    if (!ok) return;
    clearAll();
    onAddUser({
      ...form,
      schoolId: form.role === "superadmin" ? null : Number(form.schoolId || scopeSchoolId || schools[0]?.id || 1),
    });
    setForm({
      name: "",
      email: "",
      mobile: "",
      username: "",
      password: "123456",
      role: canManageAll ? "principal" : "teacher",
      schoolId: canManageAll ? (scopeSchoolId || schools[0]?.id || 1) : (scopeSchoolId || schools[0]?.id || 1),
      permissions: clampDelegatedPermissions(currentUser, canManageAll ? "principal" : "teacher", buildRolePermissions(canManageAll ? "principal" : "teacher")),
      subjects: [],
      specialItems: [],
    });
  };

  const saveSchoolAccess = () => {
    if (!canManageAll || !scopedSchool) return;
    onUpdateSchoolAccess(scopedSchool.id, schoolAccess);
  };

  const roleStatusLabel = (user) => {
    if (user.role === "superadmin") return user.status;
    const school = schools.find((item) => item.id === user.schoolId);
    if (!isRoleEnabledForSchool(user.role, school)) return `${user.status} • الدور مغلق من الأدمن`;
    return user.status;
  };

  const canEditUserRow = (user) => {
    if (!currentUser || !user) return false;
    if (currentUser.role === 'superadmin') return true;
    return canPrincipalManageUser(currentUser, user);
  };

  const canToggleUserRow = (user) => canEditUserRow(user);
  const canDeleteUserRow = (user) => canEditUserRow(user);

  const canResetPasswordForUser = (user) => {
    if (!currentUser || !user || Number(currentUser.id) === Number(user.id)) return false;
    if (currentUser.role === 'superadmin') return true;
    return currentUser.role === 'principal' && canAccessPermission(currentUser, 'users') && canPrincipalManageUser(currentUser, user);
  };

  return (
    <div className="space-y-6">
      <SectionCard title="المستخدمون والصلاحيات" icon={ShieldCheck} action={<Badge tone="blue">{visibleUsers.length} مستخدم</Badge>}>
        <div className="space-y-5">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <StatCard title="إجمالي المستخدمين في النطاق" value={visibleUsers.length} subtitle={canManageAll ? "مستخدمو المدرسة المختارة + الأدمن العام" : "مستخدمو المدرسة الحالية"} icon={Users} />
            <StatCard title="حسابات نشطة" value={visibleUsers.filter((user) => user.status === "نشط").length} subtitle="جاهزة للدخول" icon={BadgeCheck} />
            <StatCard title="أدوار مختلفة" value={new Set(visibleUsers.map((user) => user.role)).size} subtitle="تنويع صلاحيات التشغيل" icon={Layers3} />
          </div>

          <div className="flex flex-wrap gap-3">
            {userTabs.map((tab) => {
              const active = usersTab === tab.key;
              return (
                <button
                  key={tab.key}
                  type="button"
                  onClick={() => setUsersTab(tab.key)}
                  className={`rounded-2xl px-4 py-3 text-sm font-bold transition ${active ? "bg-sky-700 text-white shadow-sm" : "bg-slate-100 text-slate-700 hover:bg-slate-200"}`}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>
      </SectionCard>

      {usersTab === "overview" ? (
        <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1.05fr_.95fr]">
          <SectionCard title="ملخص الحسابات" icon={Users}>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
              {roleOptions.map((role) => {
                const count = visibleUsers.filter((user) => user.role === role.key).length;
                return (
                  <div key={role.key} className="rounded-3xl bg-slate-50 p-5 ring-1 ring-slate-200">
                    <div className="text-sm font-bold text-slate-500">{role.label}</div>
                    <div className="mt-3 text-3xl font-black text-slate-900">{count}</div>
                  </div>
                );
              })}
            </div>
            <div className="mt-5 rounded-3xl bg-sky-50 p-5 text-sm leading-8 text-sky-900 ring-1 ring-sky-100">
              من هذه الصفحة تستطيع إضافة الحسابات، متابعة حالتها، وإدارة صلاحيات المدرسة بدون ازدحام أو تنقل مشتت. كما يمكن لأي مستخدم تغيير كلمة مروره من زر «أمان الحساب».
            </div>
          </SectionCard>

          <SectionCard title="حالة التشغيل" icon={ShieldCheck}>
            <div className="space-y-4">
              <div className="rounded-3xl bg-white p-5 ring-1 ring-slate-200">
                <div className="font-black text-slate-800">الحسابات النشطة</div>
                <div className="mt-2 text-sm text-slate-500">{visibleUsers.filter((user) => user.status === "نشط").length} من أصل {visibleUsers.length}</div>
              </div>
              <div className="rounded-3xl bg-white p-5 ring-1 ring-slate-200">
                <div className="font-black text-slate-800">جهات التحقق</div>
                <div className="mt-2 text-sm text-slate-500">{visibleUsers.filter((user) => String(user.email || "").trim()).length} بريدًا إلكترونيًا و{visibleUsers.filter((user) => String(user.mobile || "").trim()).length} رقم جوال مرتبطًا بالحسابات.</div>
              </div>
              <div className="rounded-3xl bg-white p-5 ring-1 ring-slate-200">
                <div className="font-black text-slate-800">أمان الحساب</div>
                <div className="mt-2 text-sm text-slate-500">جميع المستخدمين يمكنهم تغيير كلمة المرور الخاصة بهم من نفس النظام.</div>
                <button type="button" onClick={onOpenAccountSecurity} className="mt-4 inline-flex items-center gap-2 rounded-2xl bg-slate-900 px-4 py-3 text-sm font-bold text-white">تغيير كلمة المرور</button>
              </div>
            </div>
          </SectionCard>
        </div>
      ) : null}

      {usersTab === "add" ? (
        <SectionCard title="إضافة مستخدم" icon={Plus}>
          {canManageAll ? (
            <div className="mb-4 rounded-3xl bg-sky-50 p-4 ring-1 ring-sky-100">
              <div className="font-black text-sky-900">إضافة أدمن ثانٍ أو ثالث</div>
              <div className="mt-1 text-sm leading-7 text-sky-800">يمكنك إنشاء أكثر من حساب بصلاحية الأدمن العام من هنا، ثم تخصيص كلمة المرور وبيانات كل حساب بشكل مستقل.</div>
              <div className="mt-3 flex flex-wrap gap-2">
                <button type="button" onClick={() => handleRoleChange('superadmin')} className="rounded-2xl bg-slate-900 px-4 py-2 text-sm font-bold text-white">اختيار دور: أدمن عام</button>
                <button type="button" onClick={() => setForm((prev) => ({ ...prev, role: 'superadmin', permissions: buildRolePermissions('superadmin'), schoolId: null, password: prev.password || '123456' }))} className="rounded-2xl bg-white px-4 py-2 text-sm font-bold text-slate-700 ring-1 ring-slate-200">ملء صلاحيات الأدمن كاملة</button>
              </div>
            </div>
          ) : null}
          <form onSubmit={submit} className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <Input required label="اسم المستخدم الفعلي" value={form.name} error={errors.name} onChange={(e) => { setForm((prev) => ({ ...prev, name: e.target.value })); clearError('name'); }} placeholder="مثال: أ. ناصر الشهراني" />
            <Input label="البريد الإلكتروني" value={form.email} error={errors.email} onChange={(e) => { setForm((prev) => ({ ...prev, email: e.target.value.trim().toLowerCase() })); clearError('email'); }} placeholder="name@example.com" hint="اختياري" />
            <Input required label="اسم الدخول" value={form.username} error={errors.username} onChange={(e) => { setForm((prev) => ({ ...prev, username: e.target.value.trim().toLowerCase() })); clearError('username'); }} placeholder="مثال: ryd011.teacher2" />
            <Input required label="كلمة المرور" value={form.password} error={errors.password} onChange={(e) => { setForm((prev) => ({ ...prev, password: e.target.value })); clearError('password'); }} placeholder="123456" />
            <Select label="الدور" value={form.role} onChange={(e) => handleRoleChange(e.target.value)}>
              {roleOptions.map((role) => <option key={role.key} value={role.key}>{role.label}</option>)}
            </Select>
            {form.role !== "superadmin" && (
              <Select label="المدرسة" value={form.schoolId || ""} onChange={(e) => setForm((prev) => ({ ...prev, schoolId: Number(e.target.value) }))} disabled={!canManageAll}>
                {schools.map((school) => <option key={school.id} value={school.id}>{school.name}</option>)}
              </Select>
            )}
            {form.role === 'teacher' ? (
              <div className="md:col-span-2">
                <div className="rounded-3xl bg-slate-50 p-4 ring-1 ring-slate-200">
                  <div className="mb-3">
                    <div className="font-black text-slate-900">المواد التي يدرّسها</div>
                    <div className="mt-1 text-sm text-slate-500">اختر من بنك المواد أو أضف مادة جديدة يدوياً</div>
                  </div>
                  {(settings?.subjectBank || defaultSettings.subjectBank).length > 0 && (
                    <div className="mb-3 flex flex-wrap gap-2">
                      {(settings?.subjectBank || defaultSettings.subjectBank).map((subject) => {
                        const selected = (form.subjects || []).includes(subject);
                        return (
                          <button
                            key={subject}
                            type="button"
                            onClick={() => {
                              const current = form.subjects || [];
                              const updated = selected ? current.filter((s) => s !== subject) : [...current, subject];
                              setForm((prev) => ({ ...prev, subjects: updated, specialItems: hydrateTeacherSpecialItems(prev.specialItems || []).filter((item) => updated.includes(item.subject)) }));
                            }}
                            className={`rounded-2xl px-3 py-2 text-sm font-bold transition ${
                              selected ? 'bg-sky-700 text-white' : 'bg-white text-slate-700 ring-1 ring-slate-200 hover:bg-slate-100'
                            }`}
                          >
                            {selected ? '✓ ' : ''}{subject}
                          </button>
                        );
                      })}
                    </div>
                  )}
                  <div className="flex gap-2">
                    <Input
                      label="إضافة مادة يدوياً"
                      value={form._subjectInput || ''}
                      onChange={(e) => setForm((prev) => ({ ...prev, _subjectInput: e.target.value }))}
                      placeholder="مثال: التربية الإسلامية"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        const val = String(form._subjectInput || '').trim();
                        if (!val) return;
                        const current = form.subjects || [];
                        if (!current.includes(val)) {
                          setForm((prev) => ({ ...prev, subjects: [...current, val], _subjectInput: '' }));
                        } else {
                          setForm((prev) => ({ ...prev, _subjectInput: '' }));
                        }
                      }}
                      className="mt-6 shrink-0 rounded-2xl bg-sky-700 px-4 py-3 text-sm font-bold text-white"
                    >
                      إضافة
                    </button>
                  </div>
                  {(form.subjects || []).length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-2">
                      {(form.subjects || []).map((subject) => (
                        <span key={subject} className="inline-flex items-center gap-1 rounded-2xl bg-sky-100 px-3 py-1 text-sm font-bold text-sky-800">
                          {subject}
                          <button type="button" onClick={() => setForm((prev) => ({ ...prev, subjects: prev.subjects.filter((s) => s !== subject) }))} className="text-sky-600 hover:text-rose-600">×</button>
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ) : null}
            <div className="rounded-2xl bg-slate-50 p-4 text-sm leading-7 text-slate-600 ring-1 ring-slate-200 md:col-span-2">
              {canManageAll ? 'صلاحيات هذا الحساب يمكن تعديلها الآن قبل الحفظ، ويمكنك منحه صلاحيات مثل مدير المدرسة أو الأدمن العام ثم الزيادة أو التقليل يدويًا حسب حاجتك.' : 'مدير المدرسة يمنح فقط الأدوار التشغيلية داخل مدرسته: الوكيل والمرشد والبوابة والمشرف والمعلم والطالب، ولا يستطيع منح صلاحيات مركزية مثل الإعدادات العامة أو المستخدمين أو الشاشات والبوابات.'}
            </div>
            <div className="rounded-2xl bg-white p-4 ring-1 ring-slate-200 md:col-span-2">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <div className="font-black text-slate-800">قوالب الصلاحيات السريعة</div>
                  <div className="mt-1 text-sm text-slate-500">اختر قالبًا جاهزًا ثم عدّل ما تريد. المفعّل الآن: {enabledPermissionCount} / {permissionDefinitions.length}</div>
                </div>
                <Badge tone="violet">مرنة وقابلة للتخصيص</Badge>
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                {permissionPresetOptions.map((preset) => (
                  <button key={preset.key} type="button" onClick={() => applyPermissionPreset(preset.permissions)} className="rounded-2xl bg-slate-100 px-4 py-2 text-sm font-bold text-slate-700 transition hover:bg-slate-200">
                    {preset.label}
                  </button>
                ))}
              </div>
            </div>
            <div className="grid grid-cols-1 gap-3 md:col-span-2 md:grid-cols-3">
              {permissionDefinitions.map((permission) => (
                <label key={permission.key} className="flex items-center justify-between rounded-2xl bg-white px-4 py-3 text-sm font-bold text-slate-700 ring-1 ring-slate-200">
                  <span>{permission.label}</span>
                  <input type="checkbox" checked={Boolean(form.permissions?.[permission.key])} disabled={!canManageAll && !principalManageablePermissionKeys.includes(permission.key)} onChange={(e) => handlePermissionChange(permission.key, e.target.checked)} />
                </label>
              ))}
            </div>
            {form.role === 'teacher' ? <TeacherSpecialItemsEditor subjects={form.subjects || []} items={form.specialItems || []} onChange={(items) => setForm((prev) => ({ ...prev, specialItems: items }))} /> : null}
            <div className="md:col-span-2">
              <button type="submit" className="inline-flex items-center gap-2 rounded-2xl bg-sky-700 px-5 py-3 font-bold text-white"><Save className="h-4 w-4" /> حفظ المستخدم</button>
            </div>
          </form>
        </SectionCard>
      ) : null}

      {usersTab === "accounts" ? (
        <SectionCard title="قائمة الحسابات" icon={Users}>
          <div className="mb-5 grid grid-cols-1 gap-3 lg:grid-cols-[1fr_220px]">
            <div className="relative">
              <Search className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                value={accountSearch}
                onChange={(e) => setAccountSearch(e.target.value)}
                placeholder="ابحث بالاسم أو اسم الدخول أو البريد أو المدرسة"
                className="w-full rounded-2xl border border-slate-200 bg-white py-3 pr-10 pl-4 text-sm outline-none"
              />
            </div>
            <Select label="تصفية الدور" value={accountRoleFilter} onChange={(e) => setAccountRoleFilter(e.target.value)}>
              <option value="all">كل الأدوار</option>
              {roleOptions.map((role) => <option key={role.key} value={role.key}>{role.label}</option>)}
              {canManageAll ? <option value="superadmin">أدمن عام</option> : null}
            </Select>
          </div>
          <DataTable
            columns={[
              { key: "name", label: "الاسم" },
              { key: "username", label: "الدخول" },
              { key: "email", label: "البريد الإلكتروني" },
              { key: "password", label: "كلمة المرور" },
              { key: "role", label: "الدور", render: (row) => getRoleLabel(row.role) },
              { key: "subjects", label: "المواد", render: (row) => row.role === 'teacher' ? ((row.subjects || []).join('، ') || '—') : '—' },
              { key: "specialItems", label: "التخصصي", render: (row) => row.role === 'teacher' ? `${hydrateTeacherSpecialItems(row.specialItems || []).length} بند • ${teacherSpecialStatsMap[String(row.id)]?.score || 0} رصيد` : '—' },
              { key: "specialAchievements", label: "إنجازات الفصل", render: (row) => row.role === 'teacher' ? `${teacherSpecialStatsMap[String(row.id)]?.achievements || 0} تفعيل` : '—' },
              { key: "schoolId", label: "المدرسة", render: (row) => row.role === "superadmin" ? "مركزي" : (schools.find((school) => school.id === row.schoolId)?.name || "—") },
              { key: "status", label: "الحالة", render: (row) => roleStatusLabel(row) },
              {
                key: "actions",
                label: "إجراءات",
                render: (row) => (
                  <div className="flex flex-wrap gap-2">
                    {canEditUserRow(row) && <button onClick={() => onSelectForEdit(row)} className="rounded-xl bg-slate-100 px-3 py-2 text-xs font-bold text-slate-700">تحرير</button>}
                    {canToggleUserRow(row) && <button onClick={() => onToggleUserStatus(row.id)} className="rounded-xl bg-amber-50 px-3 py-2 text-xs font-bold text-amber-800">{row.status === "نشط" ? "تعطيل" : "تفعيل"}</button>}
                    {canDeleteUserRow(row) && row.role !== "superadmin" && <button onClick={() => onDeleteUser(row.id)} className="rounded-xl bg-rose-50 px-3 py-2 text-xs font-bold text-rose-700">حذف</button>}
                    {canResetPasswordForUser(row) && <button onClick={() => onOpenResetUserPassword(row)} className="rounded-xl bg-violet-50 px-3 py-2 text-xs font-bold text-violet-700">إعادة تعيين كلمة المرور</button>}
                    {currentUser?.id === row.id && <button onClick={onOpenAccountSecurity} className="rounded-xl bg-sky-50 px-3 py-2 text-xs font-bold text-sky-700">تغيير كلمة المرور</button>}
                  </div>
                ),
              },
            ]}
            rows={filteredVisibleUsers}
            emptyMessage="لا يوجد مستخدمون يطابقون الفلتر الحالي"
          />
          {editingUserId && <div className="mt-4 rounded-2xl bg-sky-50 p-4 text-sm font-bold text-sky-800 ring-1 ring-sky-100">تم اختيار مستخدم للتحرير. راجع بطاقة التحرير أسفل الصفحة.</div>}
        </SectionCard>
      ) : null}

      {usersTab === "schoolAccess" && canManageAll && scopedSchool ? (
        <SectionCard title={`صلاحيات المدرسة: ${scopedSchool.name}`} icon={ShieldCheck} action={<Badge tone="violet">تحكم مركزي</Badge>}>
          <div className="grid grid-cols-1 gap-6 xl:grid-cols-[.95fr_1.05fr]">
            <div className="space-y-4">
              <div className="rounded-3xl bg-slate-50 p-5 ring-1 ring-slate-200">
                <div className="font-black text-slate-800">تفعيل الأدوار لهذه المدرسة</div>
                <div className="mt-2 text-sm leading-7 text-slate-500">إذا أغلقت دورًا معيّنًا فلن يتمكن أصحاب هذا الدور من الدخول لهذه المدرسة حتى لو كان الحساب موجودًا.</div>
                <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-2">
                  {schoolRoleDefinitions.map((role) => (
                    <label key={role.key} className="flex items-center justify-between rounded-2xl bg-white px-4 py-3 text-sm font-bold text-slate-700 ring-1 ring-slate-200">
                      <span>{role.label}</span>
                      <input type="checkbox" checked={schoolAccess.roleAccess?.[role.key] !== false} onChange={(e) => setSchoolAccess((prev) => ({ ...prev, roleAccess: { ...prev.roleAccess, [role.key]: e.target.checked } }))} />
                    </label>
                  ))}
                </div>
              </div>
              <div className="rounded-3xl bg-slate-50 p-5 ring-1 ring-slate-200">
                <div className="font-black text-slate-800">منح الصلاحيات لمدير المدرسة</div>
                <div className="mt-2 text-sm leading-7 text-slate-500">هذه الصلاحيات تُطبَّق على حسابات مدير المدرسة في هذه المدرسة، ويمكنك تفعيل الطلاب أو المستخدمين أو الإعدادات أو غيرها مركزيًا.</div>
                <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-2">
                  {permissionDefinitions.map((permission) => (
                    <label key={permission.key} className="flex items-center justify-between rounded-2xl bg-white px-4 py-3 text-sm font-bold text-slate-700 ring-1 ring-slate-200">
                      <span>{permission.label}</span>
                      <input type="checkbox" checked={Boolean(schoolAccess.principalPermissions?.[permission.key])} onChange={(e) => setSchoolAccess((prev) => ({ ...prev, principalPermissions: { ...prev.principalPermissions, [permission.key]: e.target.checked } }))} />
                    </label>
                  ))}
                </div>
              </div>
            </div>
            <div className="space-y-4">
              <div className="rounded-3xl bg-white p-5 ring-1 ring-slate-200">
                <div className="font-black text-slate-800">ملخص المدرسة المحددة</div>
                <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-3">
                  <div className="rounded-2xl bg-slate-50 p-4 ring-1 ring-slate-200"><div className="text-2xl font-black">{getUnifiedSchoolStudents(scopedSchool, { includeArchived: false, preferStructure: true }).length}</div><div className="text-sm text-slate-500">طلاب</div></div>
                  <div className="rounded-2xl bg-slate-50 p-4 ring-1 ring-slate-200"><div className="text-2xl font-black">{visibleUsers.filter((user) => user.role !== "superadmin").length}</div><div className="text-sm text-slate-500">حسابات المدرسة</div></div>
                  <div className="rounded-2xl bg-slate-50 p-4 ring-1 ring-slate-200"><div className="text-2xl font-black">{scopedSchool.companies.length}</div><div className="text-sm text-slate-500">شركات وفصول</div></div>
                </div>
                <div className="mt-4 rounded-2xl bg-sky-50 p-4 text-sm leading-7 text-sky-800 ring-1 ring-sky-100">بعد الحفظ، تُحدَّث صلاحيات مديري المدرسة فورًا، كما تُمنع الأدوار المغلقة من تسجيل الدخول في هذه المدرسة.</div>
                <button onClick={saveSchoolAccess} className="mt-4 inline-flex items-center gap-2 rounded-2xl bg-sky-700 px-5 py-3 font-bold text-white"><Save className="h-4 w-4" /> حفظ صلاحيات المدرسة</button>
              </div>
            </div>
          </div>
        </SectionCard>
      ) : null}
    </div>
  );
}

export default UsersPage;

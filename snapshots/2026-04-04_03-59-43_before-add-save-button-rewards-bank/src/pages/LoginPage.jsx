/**
 * ==========================================
 *  LoginPage Component
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
import { Input, Select } from '../components/ui/FormElements';


function LoginPage({ settings, users, schools, onLogin, onRequestOtp, onVerifyOtp }) {
  const authConfig = settings?.auth || defaultSettings.auth;
  const [mode, setMode] = useState(authConfig.allowPasswordLogin === false ? 'otp' : 'password');
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [otpDelivery, setOtpDelivery] = useState(authConfig.delivery?.email ? 'email' : authConfig.delivery?.sms ? 'sms' : 'whatsapp');
  const [error, setError] = useState('');
  const [otpMessage, setOtpMessage] = useState('');
  const [previewCode, setPreviewCode] = useState('');
  const [busy, setBusy] = useState(false);
  const [otpRequested, setOtpRequested] = useState(false);
  const [showResetPanel, setShowResetPanel] = useState(false);
  const [resetIdentifier, setResetIdentifier] = useState('');
  const [resetCode, setResetCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [resetMessage, setResetMessage] = useState('');
  const [resetError, setResetError] = useState('');
  const [resetBusy, setResetBusy] = useState(false);
  const deliveryOptions = [
    authConfig.delivery?.email ? { key: 'email', label: 'البريد الإلكتروني' } : null,
    authConfig.delivery?.sms ? { key: 'sms', label: 'رسالة نصية SMS' } : null,
    authConfig.delivery?.whatsapp ? { key: 'whatsapp', label: 'واتساب' } : null,
  ].filter(Boolean);

  useEffect(() => {
    if (!authConfig.allowPasswordLogin && mode === 'password') setMode('otp');
    if (!deliveryOptions.some((item) => item.key === otpDelivery)) setOtpDelivery(deliveryOptions[0]?.key || 'email');
  }, [authConfig.allowPasswordLogin, mode, deliveryOptions, otpDelivery]);

  const submitPassword = async (e) => {
    e.preventDefault();
    setBusy(true);
    setError('');
    try {
      const result = await onLogin(identifier.trim(), password);
      if (!result?.ok) setError(result?.message || 'تعذر تسجيل الدخول.');
    } finally { setBusy(false); }
  };

  const requestOtp = async () => {
    setBusy(true);
    setError('');
    setOtpMessage('');
    setPreviewCode('');
    try {
      const result = await onRequestOtp(identifier.trim(), otpDelivery);
      if (!result?.ok) {
        setError(result?.message || 'تعذر إرسال الرمز.');
      } else {
        setOtpRequested(true);
        setOtpMessage(result.message || 'تم إرسال الرمز.');
        setPreviewCode(result.previewCode || '');
      }
    } finally { setBusy(false); }
  };

  const verifyOtp = async (e) => {
    e.preventDefault();
    setBusy(true);
    setError('');
    try {
      const result = await onVerifyOtp(identifier.trim(), otpCode.trim());
      if (!result?.ok) setError(result?.message || 'تعذر التحقق من الرمز.');
    } finally { setBusy(false); }
  };

  const requestReset = async () => {
    setResetBusy(true); setResetError(''); setResetMessage(''); setPreviewCode('');
    try {
      const response = await apiRequest('/api/auth/request-reset', { method: 'POST', body: { identifier: resetIdentifier.trim() } });
      setResetMessage(response?.message || 'تم تجهيز طلب إعادة التعيين.');
      if (response?.previewCode) setPreviewCode(String(response.previewCode));
    } catch (error) { setResetError(error?.message || 'تعذر طلب إعادة التعيين.'); }
    finally { setResetBusy(false); }
  };

  const confirmReset = async () => {
    setResetBusy(true); setResetError(''); setResetMessage('');
    try {
      const response = await apiRequest('/api/auth/confirm-reset', { method: 'POST', body: { identifier: resetIdentifier.trim(), code: resetCode.trim(), newPassword } });
      setResetMessage(response?.message || 'تم تحديث كلمة المرور.');
      setPassword(newPassword); if (!identifier) setIdentifier(resetIdentifier.trim());
      setResetCode(''); setNewPassword('');
    } catch (error) { setResetError(error?.message || 'تعذر تأكيد إعادة التعيين.'); }
    finally { setResetBusy(false); }
  };

  const ministryLogo = settings?.branding?.ministryLogo || '';
  const platformLogo = settings?.branding?.platformLogo || '';

  return (
    <div
      dir="rtl"
      className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(14,165,233,0.10),_transparent_22%),linear-gradient(180deg,#f8fafc_0%,#eef2f7_100%)] px-4 py-8 md:px-8"
    >
      <div className="mx-auto flex min-h-[calc(100vh-2rem)] max-w-6xl items-center justify-center">
        <div className="grid w-full overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-[0_35px_100px_rgba(15,23,42,0.12)] md:grid-cols-2">
          <div className="flex flex-col justify-center bg-[linear-gradient(135deg,#0f172a_0%,#0b5f8a_45%,#0f766e_100%)] p-8 text-white md:p-12">
            <div className="flex flex-wrap items-center gap-3">
              {ministryLogo ? <img src={ministryLogo} alt="شعار الوزارة" className="h-14 w-14 rounded-2xl bg-white/90 object-contain p-2 shadow-sm" /> : null}
              {platformLogo ? <img src={platformLogo} alt="شعار المنصة" className="h-14 w-14 rounded-2xl bg-white/90 object-contain p-2 shadow-sm" /> : null}
              <div className="inline-flex w-fit items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-sm font-bold text-white/90 ring-1 ring-white/15">
                <ShieldCheck className="h-4 w-4" />
                منصة تشغيل تعليمية موحدة
              </div>
            </div>

            <h1 className="mt-6 text-4xl font-black leading-tight md:text-5xl">
              {settings?.platformName || 'منصة الشركة المثالية'}
            </h1>

            <p className="mt-5 max-w-xl text-base leading-8 text-white/85 md:text-lg">
              منصة تشغيلية متكاملة لإدارة الحضور والانضباط والإجراءات والبرامج،
              وتمكين المعلم والإدارة من العمل عبر تجربة موحدة وآمنة وسريعة.
            </p>

            <div className="mt-8 grid gap-4 sm:grid-cols-3">
              <div className="rounded-3xl bg-white/10 p-4 ring-1 ring-white/10">
                <div className="text-sm font-bold text-white/75">الحضور والانضباط</div>
                <div className="mt-2 text-lg font-black">متابعة لحظية</div>
              </div>
              <div className="rounded-3xl bg-white/10 p-4 ring-1 ring-white/10">
                <div className="text-sm font-bold text-white/75">إجراءات المعلم</div>
                <div className="mt-2 text-lg font-black">تنفيذ سريع</div>
              </div>
              <div className="rounded-3xl bg-white/10 p-4 ring-1 ring-white/10">
                <div className="text-sm font-bold text-white/75">التقارير والتنبيهات</div>
                <div className="mt-2 text-lg font-black">لوحات متابعة</div>
              </div>
            </div>

            <div className="mt-8 text-sm text-white/70">
              بعد تسجيل الدخول سيتم توجيهك تلقائيًا إلى الصفحة المناسبة حسب صلاحياتك.
            </div>
          </div>

          <div className="flex items-center justify-center p-6 md:p-10">
            <div className="w-full max-w-md">
              <div className="text-center">
                <div className="mx-auto flex h-16 w-16 items-center justify-center overflow-hidden rounded-3xl bg-slate-900 text-white">
                  {platformLogo ? <img src={platformLogo} alt="شعار المنصة" className="h-full w-full object-contain bg-white p-2" /> : <ShieldCheck className="h-8 w-8" />}
                </div>
                <div className="mt-4 text-sm font-black text-sky-700">تسجيل الدخول</div>
                <h2 className="mt-2 text-3xl font-black text-slate-900">مرحبًا بك</h2>
                <p className="mt-3 text-sm leading-7 text-slate-500">
                  أدخل بياناتك للمتابعة إلى لوحة التحكم الخاصة بك.
                </p>
              </div>

              <div className="mt-6 flex flex-wrap justify-center gap-3">
                {authConfig.allowPasswordLogin && (
                  <button
                    type="button"
                    onClick={() => {
                      setMode('password');
                      setError('');
                    }}
                    className={`rounded-2xl px-4 py-3 text-sm font-black transition ${
                      mode === 'password'
                        ? 'bg-slate-900 text-white'
                        : 'bg-slate-100 text-slate-700'
                    }`}
                  >
                    كلمة المرور
                  </button>
                )}

                {(authConfig.otpEnabled || authConfig.passwordlessEnabled) && (
                  <button
                    type="button"
                    onClick={() => {
                      setMode('otp');
                      setError('');
                    }}
                    className={`rounded-2xl px-4 py-3 text-sm font-black transition ${
                      mode === 'otp'
                        ? 'bg-emerald-600 text-white'
                        : 'bg-slate-100 text-slate-700'
                    }`}
                  >
                    {authConfig.passwordlessEnabled ? 'OTP / Passwordless' : 'OTP'}
                  </button>
                )}
              </div>

              {mode === 'password' ? (
                <form onSubmit={submitPassword} className="mt-6 space-y-4">
                  <Input
                    label="اسم المستخدم"
                    value={identifier}
                    onChange={(e) => {
                      setIdentifier(e.target.value);
                      setError('');
                    }}
                    placeholder="أدخل اسم المستخدم"
                  />

                  <Input
                    label="كلمة المرور"
                    type="password"
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      setError('');
                    }}
                    placeholder="أدخل كلمة المرور"
                  />

                  {error ? (
                    <div className="rounded-2xl bg-rose-50 px-4 py-3 text-sm font-bold text-rose-700 ring-1 ring-rose-100">
                      {error}
                    </div>
                  ) : null}

                  <button
                    type="submit"
                    disabled={busy}
                    className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-sky-700 px-5 py-4 text-base font-black text-white disabled:opacity-60"
                  >
                    {busy ? (
                      <Loader2 className="h-5 w-5 animate-spin" />
                    ) : (
                      <ShieldCheck className="h-5 w-5" />
                    )}
                    دخول المنصة
                  </button>
                </form>
              ) : (
                <form onSubmit={verifyOtp} className="mt-6 space-y-4">
                  <Input
                    label={
                      authConfig.identifierMode === 'username'
                        ? 'اسم المستخدم'
                        : 'اسم المستخدم أو البريد أو الجوال'
                    }
                    value={identifier}
                    onChange={(e) => {
                      setIdentifier(e.target.value);
                      setError('');
                    }}
                    placeholder="أدخل المعرّف المعتمد"
                  />

                  <Select
                    label="قناة إرسال الرمز"
                    value={otpDelivery}
                    onChange={(e) => setOtpDelivery(e.target.value)}
                  >
                    {deliveryOptions.map((item) => (
                      <option key={item.key} value={item.key}>
                        {item.label}
                      </option>
                    ))}
                  </Select>

                  <button
                    type="button"
                    onClick={requestOtp}
                    disabled={busy || !identifier.trim()}
                    className="w-full rounded-2xl bg-emerald-600 px-4 py-3 text-sm font-black text-white disabled:opacity-60"
                  >
                    إرسال رمز التحقق
                  </button>

                  {otpRequested ? (
                    <Input
                      label="رمز التحقق"
                      value={otpCode}
                      onChange={(e) => {
                        setOtpCode(e.target.value);
                        setError('');
                      }}
                      placeholder="أدخل الرمز"
                    />
                  ) : null}

                  {previewCode ? (
                    <div className="rounded-2xl bg-amber-50 px-4 py-3 text-sm font-bold text-amber-800 ring-1 ring-amber-100">
                      الرمز التجريبي: {previewCode}
                    </div>
                  ) : null}

                  {otpMessage ? (
                    <div className="rounded-2xl bg-emerald-50 px-4 py-3 text-sm font-bold text-emerald-700 ring-1 ring-emerald-100">
                      {otpMessage}
                    </div>
                  ) : null}

                  {error ? (
                    <div className="rounded-2xl bg-rose-50 px-4 py-3 text-sm font-bold text-rose-700 ring-1 ring-rose-100">
                      {error}
                    </div>
                  ) : null}

                  <button
                    type="submit"
                    disabled={busy || !otpRequested || !otpCode.trim()}
                    className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-slate-900 px-5 py-4 font-black text-white disabled:opacity-60"
                  >
                    تحقق وادخل
                  </button>
                </form>
              )}

              <div className="mt-6 border-t border-slate-100 pt-4 text-center">
                <button
                  type="button"
                  onClick={() => {
                    setShowResetPanel((prev) => !prev);
                    setResetError('');
                    setResetMessage('');
                  }}
                  className="text-sm font-bold text-slate-500 hover:text-slate-700"
                >
                  {showResetPanel ? 'إخفاء استرجاع كلمة المرور' : 'استرجاع كلمة المرور'}
                </button>
              </div>

              {showResetPanel ? (
                <div className="mt-4 rounded-[1.75rem] border border-slate-200 bg-slate-50 p-4">
                  <div className="space-y-3">
                    <Input
                      label="اسم المستخدم أو البريد الإلكتروني"
                      value={resetIdentifier}
                      onChange={(e) => {
                        setResetIdentifier(e.target.value.trim().toLowerCase());
                        setResetError('');
                        setResetMessage('');
                      }}
                    />

                    <button
                      type="button"
                      onClick={requestReset}
                      disabled={resetBusy || !resetIdentifier.trim()}
                      className={`w-full rounded-2xl px-4 py-3 text-sm font-bold ${
                        resetBusy || !resetIdentifier.trim()
                          ? 'bg-slate-200 text-slate-500'
                          : 'bg-sky-700 text-white'
                      }`}
                    >
                      طلب رمز إعادة التعيين
                    </button>

                    <div className="grid grid-cols-1 gap-3">
                      <Input
                        label="رمز إعادة التعيين"
                        value={resetCode}
                        onChange={(e) => setResetCode(e.target.value)}
                      />
                      <Input
                        label="كلمة المرور الجديدة"
                        type="password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                      />
                    </div>

                    <button
                      type="button"
                      onClick={confirmReset}
                      disabled={
                        resetBusy ||
                        !resetIdentifier.trim() ||
                        !resetCode.trim() ||
                        !newPassword.trim()
                      }
                      className={`w-full rounded-2xl px-4 py-3 text-sm font-bold ${
                        resetBusy ||
                        !resetIdentifier.trim() ||
                        !resetCode.trim() ||
                        !newPassword.trim()
                          ? 'bg-slate-200 text-slate-500'
                          : 'bg-emerald-600 text-white'
                      }`}
                    >
                      حفظ كلمة المرور الجديدة
                    </button>

                    {resetMessage ? (
                      <div className="rounded-2xl bg-emerald-50 px-4 py-3 text-sm font-bold text-emerald-700 ring-1 ring-emerald-100">
                        {resetMessage}
                      </div>
                    ) : null}

                    {resetError ? (
                      <div className="rounded-2xl bg-rose-50 px-4 py-3 text-sm font-bold text-rose-700 ring-1 ring-rose-100">
                        {resetError}
                      </div>
                    ) : null}
                  </div>
                </div>
              ) : null}
            </div>
          </div>
        </div>
      </div>
    </div>
  );


}

export default LoginPage;

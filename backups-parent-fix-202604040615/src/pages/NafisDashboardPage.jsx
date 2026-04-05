/**
 * ==========================================
 *  NafisDashboardPage Component
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


function NafisDashboardPage({ selectedSchool, currentUser }) {
  const [dashboardData, setDashboardData] = React.useState(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState(null);

  React.useEffect(() => {
    if (!selectedSchool?.id) {
      setLoading(false);
      return;
    }
    loadDashboard();
  }, [selectedSchool?.id]);

  async function loadDashboard() {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/nafis/school-dashboard?schoolId=${selectedSchool.id}`, {
        headers: { 'X-Session-Token': localStorage.getItem('ideal-company-platform-session-token-v8') || '' },
      });
      const data = await response.json();
      if (!data.ok) throw new Error(data.message || 'فشل تحميل البيانات');
      setDashboardData(data);
    } catch (e) {
      setError(e.message || 'حدث خطأ أثناء تحميل البيانات');
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="text-center">
          <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-4 border-sky-200 border-t-sky-600"></div>
          <p className="text-sm text-slate-500">جارِ تحميل بيانات نافس التجريبي...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-2xl bg-red-50 p-6 text-center">
        <p className="text-sm font-semibold text-red-700">⚠️ {error}</p>
        <button onClick={loadDashboard} className="mt-4 rounded-xl bg-red-600 px-4 py-2 text-sm font-bold text-white hover:bg-red-700">
          إعادة المحاولة
        </button>
      </div>
    );
  }

  if (!dashboardData || !dashboardData.summary) {
    return (
      <div className="rounded-2xl bg-slate-50 p-8 text-center">
        <p className="text-sm text-slate-500">لا توجد بيانات متاحة لنافس التجريبي حالياً.</p>
      </div>
    );
  }

  const { summary, bySubject, classroomStats, topStudents, recentAttempts, dailyStats } = dashboardData;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-black text-slate-900">📊 لوحة نافس التجريبي</h2>
          <p className="mt-1 text-sm text-slate-500">تحليل شامل لأداء الطلاب في الاختبارات التجريبية</p>
        </div>
        <button onClick={loadDashboard} className="rounded-xl bg-sky-600 px-4 py-2 text-sm font-bold text-white hover:bg-sky-700">
          🔄 تحديث
        </button>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-6">
        <div className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-200">
          <div className="text-3xl font-black text-sky-600">{summary.totalAttempts}</div>
          <div className="mt-1 text-xs font-semibold text-slate-500">إجمالي المحاولات</div>
        </div>
        <div className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-200">
          <div className="text-3xl font-black text-violet-600">{summary.uniqueStudents}</div>
          <div className="mt-1 text-xs font-semibold text-slate-500">طلاب مشاركون</div>
        </div>
        <div className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-200">
          <div className="text-3xl font-black text-emerald-600">{summary.avgScore}%</div>
          <div className="mt-1 text-xs font-semibold text-slate-500">متوسط الدرجات</div>
        </div>
        <div className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-200">
          <div className="text-3xl font-black text-amber-600">{summary.correctRate}%</div>
          <div className="mt-1 text-xs font-semibold text-slate-500">نسبة الإجابات الصحيحة</div>
        </div>
        <div className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-200">
          <div className="text-3xl font-black text-teal-600">{summary.totalPointsAwarded}</div>
          <div className="mt-1 text-xs font-semibold text-slate-500">نقاط نافس الممنوحة</div>
        </div>
        <div className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-200">
          <div className="text-3xl font-black text-slate-600">{summary.totalStudents}</div>
          <div className="mt-1 text-xs font-semibold text-slate-500">إجمالي الطلاب</div>
        </div>
      </div>

      {/* Daily Trend Chart */}
      {dailyStats && dailyStats.length > 0 && (
        <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
          <h3 className="mb-4 text-lg font-black text-slate-900">📈 التطور اليومي (آخر 7 أيام)</h3>
          <div className="grid grid-cols-7 gap-2">
            {dailyStats.map((day, i) => {
              const maxAttempts = Math.max(...dailyStats.map(d => d.attempts), 1);
              const height = day.attempts > 0 ? Math.max((day.attempts / maxAttempts) * 100, 10) : 5;
              return (
                <div key={i} className="flex flex-col items-center">
                  <div className="mb-2 flex h-32 w-full items-end justify-center">
                    <div
                      className="w-full rounded-t-lg bg-sky-500"
                      style={{ height: `${height}%` }}
                      title={`${day.attempts} محاولة`}
                    ></div>
                  </div>
                  <div className="text-center">
                    <div className="text-xs font-bold text-slate-700">{day.attempts}</div>
                    <div className="text-[10px] text-slate-400">{day.date.slice(5)}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* By Subject */}
      {bySubject && Object.keys(bySubject).length > 0 && (
        <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
          <h3 className="mb-4 text-lg font-black text-slate-900">📚 الأداء حسب المادة</h3>
          <div className="space-y-3">
            {Object.entries(bySubject).map(([key, subject]) => {
              const color = subject.avgScore >= 70 ? 'emerald' : subject.avgScore >= 60 ? 'amber' : 'red';
              return (
                <div key={key} className="flex items-center justify-between rounded-xl bg-slate-50 p-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <div className="text-sm font-bold text-slate-900">{subject.subjectLabel}</div>
                      <div className={`rounded-full bg-${color}-100 px-2 py-0.5 text-xs font-bold text-${color}-700`}>
                        {subject.avgScore}%
                      </div>
                    </div>
                    <div className="mt-1 text-xs text-slate-500">
                      {subject.attempts} محاولة • {subject.correct}/{subject.total} إجابة صحيحة ({subject.correctRate}%)
                    </div>
                  </div>
                  <div className="mr-4 h-2 w-32 overflow-hidden rounded-full bg-slate-200">
                    <div
                      className={`h-full bg-${color}-500`}
                      style={{ width: `${subject.avgScore}%` }}
                    ></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Classroom Stats */}
      {classroomStats && classroomStats.length > 0 && (
        <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
          <h3 className="mb-4 text-lg font-black text-slate-900">🏫 ترتيب الفصول</h3>
          <div className="space-y-2">
            {classroomStats.slice(0, 10).map((classroom, i) => (
              <div key={i} className="flex items-center justify-between rounded-xl bg-slate-50 p-3">
                <div className="flex items-center gap-3">
                  <div className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-black ${i < 3 ? 'bg-amber-100 text-amber-700' : 'bg-slate-200 text-slate-600'}`}>
                    {i + 1}
                  </div>
                  <div>
                    <div className="text-sm font-bold text-slate-900">{classroom.classroomName}</div>
                    <div className="text-xs text-slate-500">{classroom.uniqueStudents} طالب • {classroom.attempts} محاولة</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-lg font-black text-sky-600">{classroom.avgScore}%</div>
                  <div className="text-xs text-slate-400">متوسط</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Top Students */}
      {topStudents && topStudents.length > 0 && (
        <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
          <h3 className="mb-4 text-lg font-black text-slate-900">🌟 أفضل الطلاب</h3>
          <div className="space-y-2">
            {topStudents.slice(0, 10).map((student, i) => (
              <div key={i} className="flex items-center justify-between rounded-xl bg-slate-50 p-3">
                <div className="flex items-center gap-3">
                  <div className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-black ${i < 3 ? 'bg-violet-100 text-violet-700' : 'bg-slate-200 text-slate-600'}`}>
                    {i + 1}
                  </div>
                  <div>
                    <div className="text-sm font-bold text-slate-900">{student.studentName}</div>
                    <div className="text-xs text-slate-500">{student.classroomName} • {student.attempts} محاولة • {student.pointsEarned} نقطة</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-lg font-black text-emerald-600">{student.bestScore}%</div>
                  <div className="text-xs text-slate-400">أفضل درجة</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recent Attempts */}
      {recentAttempts && recentAttempts.length > 0 && (
        <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
          <h3 className="mb-4 text-lg font-black text-slate-900">🕒 آخر المحاولات</h3>
          <div className="space-y-2">
            {recentAttempts.slice(0, 10).map((attempt, i) => {
              const color = attempt.score >= 70 ? 'emerald' : attempt.score >= 60 ? 'amber' : 'red';
              return (
                <div key={i} className="flex items-center justify-between rounded-xl bg-slate-50 p-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <div className="text-sm font-bold text-slate-900">{attempt.studentName}</div>
                      <div className={`rounded-full bg-${color}-100 px-2 py-0.5 text-xs font-bold text-${color}-700`}>
                        {attempt.score}%
                      </div>
                      {attempt.pointsAwarded > 0 && (
                        <div className="rounded-full bg-teal-100 px-2 py-0.5 text-xs font-bold text-teal-700">
                          +{attempt.pointsAwarded} نقطة
                        </div>
                      )}
                    </div>
                    <div className="mt-1 text-xs text-slate-500">
                      {attempt.subjectLabel} • {attempt.classroomName} • {new Date(attempt.createdAt).toLocaleString('ar-SA', { dateStyle: 'short', timeStyle: 'short' })}
                    </div>
                  </div>
                  <div className="mr-4 text-right">
                    <div className="text-sm font-bold text-slate-700">{attempt.correct}/{attempt.total}</div>
                    <div className="text-xs text-slate-400">صحيح</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

export default NafisDashboardPage;

/**
 * ==========================================
 *  GateAttendancePage Component
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


function GateAttendancePage({ selectedSchool }) {
  const gates = Array.isArray(selectedSchool?.smartLinks?.gates) ? selectedSchool.smartLinks.gates : [];

  const openGate = (token) => {
    const url = buildPublicLink('gate', token);
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const getModeLabel = (mode) => {
    if (mode === 'qr') return 'QR فقط';
    if (mode === 'face') return 'بصمة وجه فقط';
    return 'QR + بصمة وجه';
  };

  const getModeColor = (mode) => {
    if (mode === 'qr') return 'bg-sky-500 shadow-sky-500/30';
    if (mode === 'face') return 'bg-violet-500 shadow-violet-500/30';
    return 'bg-emerald-500 shadow-emerald-500/30';
  };

  const getModeIcon = (mode) => {
    if (mode === 'qr') return String.fromCodePoint(0x1F4F7);
    if (mode === 'face') return String.fromCodePoint(0x1F464);
    return String.fromCodePoint(0x1F510);
  };

  return (
    <div dir="rtl" className="min-h-screen bg-slate-900 text-white">
      <div className="bg-gradient-to-l from-slate-900 via-slate-800 to-slate-900 border-b border-slate-700 px-4 py-5">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-500/20 ring-1 ring-emerald-500/40">
            <ScanLine className="h-6 w-6 text-emerald-400" />
          </div>
          <div>
            <div className="text-lg font-black text-white leading-tight">الحضور الذكي</div>
            <div className="text-xs text-slate-400 leading-tight">{selectedSchool?.name || 'المدرسة'}</div>
          </div>
        </div>
      </div>
      <div className="p-4">
        {gates.length === 0 ? (
          <div className="mt-12 text-center">
            <div className="text-6xl mb-4">{String.fromCodePoint(0x1F6AA)}</div>
            <div className="text-lg font-bold text-slate-300">لا توجد بوابات منشأة</div>
            <div className="mt-2 text-sm text-slate-500 leading-7">
              يمكن للمدير إنشاء بوابات الحضور من قسم<br />"الشاشات والبوابات"
            </div>
          </div>
        ) : (
          <>
            <div className="mb-5 text-center">
              <div className="text-sm text-slate-400">اختر البوابة لفتح التحضير الذكي</div>
            </div>
            <div className="space-y-3">
              {gates.map((gate) => (
                <button
                  key={gate.id}
                  onClick={() => openGate(gate.token)}
                  className={`w-full rounded-3xl p-5 text-right transition-all active:scale-95 shadow-lg ${getModeColor(gate.mode)}`}
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/20 text-2xl">
                        {getModeIcon(gate.mode)}
                      </div>
                      <div>
                        <div className="text-base font-black text-white leading-tight">{gate.name}</div>
                        <div className="mt-0.5 text-xs text-white/70">{getModeLabel(gate.mode)}</div>
                      </div>
                    </div>
                    <ExternalLink className="h-5 w-5 text-white/80" />
                  </div>
                </button>
              ))}
            </div>
            <div className="mt-6 rounded-2xl bg-slate-800/60 ring-1 ring-slate-700 px-4 py-3 text-center text-xs text-slate-400">
              سيُفتح رابط البوابة في نافذة جديدة
            </div>
          </>
        )}
      </div>
    </div>
  );
}

// ============================================================
// صفحة مسؤول الأمن (بوابة الحضور)

export default GateAttendancePage;

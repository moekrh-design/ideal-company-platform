/**
 * ==========================================
 *  PointsPage Component
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
import { DataTable } from '../components/ui/DataTable';
import { SectionCard } from '../components/ui/SectionCard';


import { Badge } from '../components/ui/FormElements';
function PointsPage({ selectedSchool, settings }) {
  const rankedCompanies = [...getUnifiedCompanyRows(selectedSchool, { preferStructure: true })].sort((a, b) => b.points - a.points);
  const schoolStudents = getUnifiedSchoolStudents(selectedSchool, { includeArchived: false, preferStructure: true });
  const topStudents = [...schoolStudents].sort((a, b) => b.points - a.points).slice(0, 5);

  const chartData = rankedCompanies.map((company) => ({ name: company.name, points: company.points, early: company.early }));

  const columns = [
    { key: "name", label: "الشركة" },
    { key: "className", label: "الفصل" },
    { key: "leader", label: "الرائد" },
    { key: "early", label: "الحضور المبكر" },
    { key: "behavior", label: "السلوك", render: (row) => `${row.behavior}%` },
    { key: "initiatives", label: "المبادرات" },
    { key: "points", label: "إجمالي النقاط", render: (row) => <span className="font-extrabold text-slate-800">{row.points}</span> },
  ];

  return (
    <div className="space-y-6">
      <SectionCard title="ترتيب الفصول" icon={Trophy}>
        <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
          <div className="space-y-6 xl:col-span-2">
            <DataTable columns={columns} rows={rankedCompanies} />
            <div className="rounded-3xl bg-slate-50 p-4 ring-1 ring-slate-200">
              <div className="mb-3 font-bold text-slate-800">مقارنة نقاط الشركات</div>
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <RLineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Line type="monotone" dataKey="points" stroke="#0f172a" strokeWidth={3} dot={{ r: 4 }} />
                    <Line type="monotone" dataKey="early" stroke="#10b981" strokeWidth={2} dot={{ r: 3 }} />
                  </RLineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
          <div className="space-y-6">
            <div className="rounded-3xl bg-white p-5 ring-1 ring-slate-200">
              <div className="mb-3 font-bold text-slate-800">محرك النقاط</div>
              <div className="space-y-3 text-sm">
                {[
                  ["حضور مبكر", settings.points.early],
                  ["حضور في الوقت", settings.points.onTime],
                  ["تأخر", settings.points.late],
                  ["مبادرة معتمدة", settings.points.initiative],
                  ["تميّز سلوكي", settings.points.behavior],
                ].map(([name, value]) => (
                  <div key={name} className="flex items-center justify-between rounded-2xl bg-slate-50 p-3 ring-1 ring-slate-200">
                    <span>{name}</span>
                    <Badge tone={Number(value) >= 0 ? "green" : "rose"}>{Number(value) >= 0 ? `+${value}` : value}</Badge>
                  </div>
                ))}
              </div>
            </div>
            <div className="rounded-3xl bg-white p-5 ring-1 ring-slate-200">
              <div className="mb-3 font-bold text-slate-800">أفضل الطلاب</div>
              <div className="space-y-3">
                {topStudents.map((student, index) => (
                  <div key={student.id} className="flex items-center justify-between rounded-2xl bg-slate-50 p-3 ring-1 ring-slate-200">
                    <div>
                      <div className="font-bold text-slate-800">{index + 1}. {student.name}</div>
                      <div className="text-xs text-slate-500">{getStudentGroupingLabel(student, selectedSchool)}</div>
                    </div>
                    <Badge tone="violet">{student.points} نقطة</Badge>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </SectionCard>
    </div>
  );
}

export default PointsPage;

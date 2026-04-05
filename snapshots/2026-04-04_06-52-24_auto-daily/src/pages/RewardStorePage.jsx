/**
 * ==========================================
 *  RewardStorePage Component
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


import { Badge } from '../components/ui/FormElements';
function RewardStorePage({ selectedSchool, currentUser, onSaveItem, onDeleteItem, onDecideProposal, onCreateRedemptionRequest, onDecideRedemption, onActivateRewardItem, onUpdateRewardItemMeta, onEditItem }) {
  const summary = useMemo(() => buildRewardStoreSummary(selectedSchool), [selectedSchool]);
  const store = useMemo(() => getRewardStore(selectedSchool), [selectedSchool]);
  const students = useMemo(() => getUnifiedSchoolStudents(selectedSchool, { includeArchived: false, preferStructure: true }), [selectedSchool]);
  const [draft, setDraft] = useState({ title: '', quantity: 1, image: '', note: '', sourceType: 'school', donorName: '', showDonorName: true, showOnScreens: true, featured: false, displayPriority: 0 });
  const [proposalDecisionNotes, setProposalDecisionNotes] = useState({});
  const [redemptionDecisionNotes, setRedemptionDecisionNotes] = useState({});
  const [activationDrafts, setActivationDrafts] = useState({});
  const [redemptionDraft, setRedemptionDraft] = useState({ studentId: '', itemId: '', note: '' });
  const [editingItemId, setEditingItemId] = useState(null);
  const [editDraft, setEditDraft] = useState({});

  const startEditItem = (item) => {
    setEditingItemId(item.id);
    setEditDraft({ title: item.title || '', pointsCost: item.pointsCost || 0, quantity: item.quantity || 1, note: item.note || '', image: item.image || '', showOnScreens: item.showOnScreens !== false, featured: item.featured === true, displayPriority: item.displayPriority || 0 });
  };
  const saveEditItem = () => {
    const result = onEditItem?.(editingItemId, editDraft);
    window.alert(result?.message || (result?.ok ? 'تم تعديل الجائزة.' : 'تعذر التعديل.'));
    if (result?.ok) setEditingItemId(null);
  };
  const handleEditImage = async (file) => {
    const dataUrl = await fileToDataUrl(file);
    if (dataUrl) setEditDraft((prev) => ({ ...prev, image: dataUrl }));
  };

  const handleImage = async (file) => {
    const dataUrl = await fileToDataUrl(file);
    if (dataUrl) setDraft((prev) => ({ ...prev, image: dataUrl }));
  };

  const updateActivationDraft = (itemId, patch) => setActivationDrafts((prev) => ({
    ...prev,
    [itemId]: {
      pointsCost: prev[itemId]?.pointsCost ?? '',
      note: prev[itemId]?.note ?? '',
      ...prev[itemId],
      ...patch,
    },
  }));

  const submit = () => {
    const result = onSaveItem?.(draft);
    if (result?.ok) setDraft({ title: '', quantity: 1, image: '', note: '', sourceType: 'school', donorName: '', showDonorName: true, showOnScreens: true, featured: false, displayPriority: 0 });
    window.alert(result?.message || (result?.ok ? 'تم حفظ الجائزة.' : 'تعذر الحفظ.'));
  };

  const allItems = (store.items || []).map((item) => normalizeRewardStoreItem(item));
  const rewardNotifications = (store.notifications || []).slice(0, 12);
  const approvedItems = getApprovedRewardStoreItems(selectedSchool);
  const awaitingReceiptItems = allItems.filter((item) => item.approvalStatus === 'awaiting_receipt' || item.approvalStatus === 'received_pending_activation');
  const depletedItems = allItems.filter((item) => item.approvalStatus === 'depleted');
  const pendingProposals = (store.parentProposals || []).filter((item) => String(item.status || 'pending') === 'pending');
  const decidedProposals = (store.parentProposals || []).filter((item) => String(item.status || 'pending') !== 'pending');
  const pendingRedemptions = (store.redemptionRequests || []).filter((item) => String(item.status || 'pending') === 'pending');
  const approvedRedemptions = (store.redemptionRequests || []).filter((item) => String(item.status || '') === 'approved');
  const deliveredRedemptions = (store.redemptionRequests || []).filter((item) => String(item.status || '') === 'delivered');
  const processedRedemptions = (store.redemptionRequests || []).filter((item) => !['pending', 'approved', 'delivered'].includes(String(item.status || 'pending')));
  const selectedRedemptionStudent = students.find((student) => String(student.id) === String(redemptionDraft.studentId || '')) || null;
  const selectedRedemptionItem = approvedItems.find((item) => String(item.id) === String(redemptionDraft.itemId || '')) || null;
  const delegateLabel = currentUser?.role === 'principal' ? 'مدير المدرسة' : currentUser?.role === 'supervisor' ? 'موظف مفوض' : 'إدارة المدرسة';
  const submitRedemption = () => {
    const result = onCreateRedemptionRequest?.(redemptionDraft);
    if (result?.ok) setRedemptionDraft({ studentId: '', itemId: '', note: '' });
    window.alert(result?.message || (result?.ok ? 'تم إرسال طلب الاستبدال.' : 'تعذر إرسال الطلب.'));
  };
  const activateRewardItem = (item) => {
    const payload = activationDrafts[item.id] || {};
    const result = onActivateRewardItem?.(item.id, payload);
    window.alert(result?.message || (result?.ok ? 'تم اعتماد الجائزة وإظهارها في المتجر.' : 'تعذر الاعتماد.'));
  };

  const rewardReportData = useMemo(() => {
    const itemMap = new Map(allItems.map((item) => [String(item.id), item]));
    const studentMap = new Map(students.map((student) => [String(student.id), student]));
    const donorMap = {};
    const sourceMap = {};
    const itemStatsMap = {};
    const requestStatusMap = {};
    const studentStatsMap = {};
    const classStatsMap = {};

    const sourceLabel = (value) => value === 'parent' ? 'ولي أمر' : value === 'external' ? 'متبرع خارجي' : 'إدارة المدرسة';

    allItems.forEach((item) => {
      const donorLabel = getRewardStoreDonorLabel(item);
      const donorKey = `${String(item.sourceType || 'school')}::${donorLabel}`;
      if (!donorMap[donorKey]) donorMap[donorKey] = { donorName: donorLabel, sourceType: item.sourceType || 'school', sourceLabel: sourceLabel(item.sourceType || 'school'), itemsCount: 0, totalQuantity: 0, remainingQuantity: 0, deliveredQuantity: 0, activeItems: 0 };
      donorMap[donorKey].itemsCount += 1;
      donorMap[donorKey].totalQuantity += Number(item.quantity || 0);
      donorMap[donorKey].remainingQuantity += Number(item.remainingQuantity || 0);
      donorMap[donorKey].deliveredQuantity += Number(item.deliveredQuantity || 0);
      if (item.approvalStatus === 'active') donorMap[donorKey].activeItems += 1;

      const src = String(item.sourceType || 'school');
      sourceMap[src] = (sourceMap[src] || 0) + Number(item.quantity || 0);
      if (!itemStatsMap[String(item.id)]) itemStatsMap[String(item.id)] = { itemId: String(item.id), title: item.title || 'جائزة', donorName: donorLabel, sourceLabel: sourceLabel(src), quantity: Number(item.quantity || 0), remainingQuantity: Number(item.remainingQuantity || 0), deliveredQuantity: Number(item.deliveredQuantity || 0), pointsCost: Number(item.pointsCost || 0), statusLabel: getRewardStoreStatusLabel(item.approvalStatus), requests: 0, approved: 0, delivered: 0 };
    });

    (store.redemptionRequests || []).forEach((request) => {
      const status = String(request.status || 'pending');
      requestStatusMap[status] = (requestStatusMap[status] || 0) + 1;
      const stat = itemStatsMap[String(request.itemId || '')];
      if (stat) {
        stat.requests += 1;
        if (status === 'approved') stat.approved += 1;
        if (status === 'delivered') stat.delivered += 1;
      }
      const student = studentMap.get(String(request.studentId || ''));
      const className = request.className || student?.className || student?.companyName || 'غير محدد';
      const studentKey = String(request.studentId || '');
      if (!studentStatsMap[studentKey]) studentStatsMap[studentKey] = { studentId: studentKey, studentName: request.studentName || student?.name || 'طالب', className, requests: 0, delivered: 0, pending: 0, pointsSpent: 0 };
      studentStatsMap[studentKey].requests += 1;
      if (status === 'delivered') {
        studentStatsMap[studentKey].delivered += 1;
        studentStatsMap[studentKey].pointsSpent += Number(request.pointsCost || 0);
      }
      if (status === 'pending' || status === 'approved') studentStatsMap[studentKey].pending += 1;

      if (!classStatsMap[className]) classStatsMap[className] = { className, requests: 0, delivered: 0, pointsSpent: 0, uniqueStudents: new Set() };
      classStatsMap[className].requests += 1;
      if (status === 'delivered') {
        classStatsMap[className].delivered += 1;
        classStatsMap[className].pointsSpent += Number(request.pointsCost || 0);
      }
      if (studentKey) classStatsMap[className].uniqueStudents.add(studentKey);
    });

    const donorRows = Object.values(donorMap).sort((a, b) => b.totalQuantity - a.totalQuantity || b.deliveredQuantity - a.deliveredQuantity);
    const itemRows = Object.values(itemStatsMap).sort((a, b) => b.requests - a.requests || b.delivered - a.delivered || b.quantity - a.quantity);
    const requestRows = (store.redemptionRequests || []).map((request) => {
      const student = studentMap.get(String(request.studentId || ''));
      return {
        id: request.id,
        studentName: request.studentName || student?.name || 'طالب',
        className: request.className || student?.className || student?.companyName || 'غير محدد',
        itemTitle: request.itemTitle || itemMap.get(String(request.itemId || ''))?.title || 'جائزة',
        pointsCost: Number(request.pointsCost || 0),
        status: String(request.status || 'pending'),
        statusLabel: request.status === 'delivered' ? 'تم التسليم' : request.status === 'approved' ? 'بانتظار التسليم' : request.status === 'rejected' ? 'مرفوض' : 'بانتظار الاعتماد',
        requesterLabel: request.requestedByType === 'guardian' ? 'ولي الأمر' : request.requestedByType === 'student' ? 'الطالب' : request.requestedByType === 'delegate' ? 'موظف مفوض' : 'الإدارة',
        requesterName: request.requestedByName || '—',
        createdAt: formatDateTime(request.createdAt),
        decisionAt: request.decisionAt ? formatDateTime(request.decisionAt) : '—',
        deliveryAt: request.deliveryAt ? formatDateTime(request.deliveryAt) : '—',
      };
    }).sort((a, b) => String(b.createdAt).localeCompare(String(a.createdAt), 'ar'));
    const studentRows = Object.values(studentStatsMap).sort((a, b) => b.pointsSpent - a.pointsSpent || b.delivered - a.delivered || b.requests - a.requests);
    const classRows = Object.values(classStatsMap).map((row) => ({ ...row, uniqueStudents: row.uniqueStudents.size })).sort((a, b) => b.pointsSpent - a.pointsSpent || b.delivered - a.delivered || b.requests - a.requests);
    const sourceRows = Object.entries(sourceMap).map(([key, value]) => ({ name: sourceLabel(key), value })).sort((a, b) => b.value - a.value);
    const statusRows = Object.entries(requestStatusMap).map(([key, value]) => ({ name: key === 'delivered' ? 'تم التسليم' : key === 'approved' ? 'بانتظار التسليم' : key === 'rejected' ? 'مرفوض' : 'بانتظار الاعتماد', value })).sort((a, b) => b.value - a.value);
    return { donorRows, itemRows, requestRows, studentRows, classRows, sourceRows, statusRows };
  }, [allItems, store.redemptionRequests, students]);

  const exportStoreDataset = (dataset, format = 'xlsx') => {
    const maps = {
      donors: {
        filename: 'reward-store-donors',
        sheet: 'المتبرعون',
        rows: rewardReportData.donorRows,
        columns: [
          { key: 'donorName', label: 'اسم المتبرع/الجهة' },
          { key: 'sourceLabel', label: 'النوع' },
          { key: 'itemsCount', label: 'عدد الجوائز' },
          { key: 'totalQuantity', label: 'الكمية الأصلية' },
          { key: 'remainingQuantity', label: 'المتبقي' },
          { key: 'deliveredQuantity', label: 'المسلّم' },
          { key: 'activeItems', label: 'المعتمد في المتجر' },
        ],
      },
      items: {
        filename: 'reward-store-items',
        sheet: 'الجوائز',
        rows: rewardReportData.itemRows,
        columns: [
          { key: 'title', label: 'الجائزة' },
          { key: 'donorName', label: 'المتبرع' },
          { key: 'sourceLabel', label: 'المصدر' },
          { key: 'quantity', label: 'الكمية الأصلية' },
          { key: 'remainingQuantity', label: 'المتبقي' },
          { key: 'deliveredQuantity', label: 'المسلّم' },
          { key: 'pointsCost', label: 'النقاط' },
          { key: 'requests', label: 'عدد الطلبات' },
          { key: 'delivered', label: 'مرات التسليم' },
          { key: 'statusLabel', label: 'الحالة' },
        ],
      },
      requests: {
        filename: 'reward-store-requests',
        sheet: 'الطلبات',
        rows: rewardReportData.requestRows,
        columns: [
          { key: 'studentName', label: 'الطالب' },
          { key: 'className', label: 'الفصل' },
          { key: 'itemTitle', label: 'الجائزة' },
          { key: 'pointsCost', label: 'النقاط' },
          { key: 'statusLabel', label: 'الحالة' },
          { key: 'requesterLabel', label: 'جهة الطلب' },
          { key: 'requesterName', label: 'المنفذ/المقدم' },
          { key: 'createdAt', label: 'تاريخ الطلب' },
          { key: 'decisionAt', label: 'تاريخ القرار' },
          { key: 'deliveryAt', label: 'تاريخ التسليم' },
        ],
      },
      students: {
        filename: 'reward-store-students',
        sheet: 'الطلاب',
        rows: rewardReportData.studentRows,
        columns: [
          { key: 'studentName', label: 'الطالب' },
          { key: 'className', label: 'الفصل' },
          { key: 'requests', label: 'عدد الطلبات' },
          { key: 'delivered', label: 'المسلّم' },
          { key: 'pending', label: 'قيد المعالجة' },
          { key: 'pointsSpent', label: 'النقاط المصروفة' },
        ],
      },
      classes: {
        filename: 'reward-store-classes',
        sheet: 'الفصول',
        rows: rewardReportData.classRows,
        columns: [
          { key: 'className', label: 'الفصل' },
          { key: 'requests', label: 'عدد الطلبات' },
          { key: 'delivered', label: 'المسلّم' },
          { key: 'pointsSpent', label: 'النقاط المصروفة' },
          { key: 'uniqueStudents', label: 'عدد الطلاب المستفيدين' },
        ],
      },
    };
    const target = maps[dataset];
    if (!target) return;
    const stamp = formatDateTime(new Date().toISOString()).replace(/[\s:/]+/g, '-');
    if (format === 'csv') {
      downloadFile(`${target.filename}-${stamp}.csv`, buildCsv(target.rows, target.columns), 'text/csv;charset=utf-8;');
      return;
    }
    exportRowsToWorkbook(`${target.filename}-${stamp}.xlsx`, target.sheet, target.rows, target.columns);
  };

  const printStoreExecutiveReport = () => {
    const statsHtml = [
      ['إجمالي الجوائز', summary.totalItems],
      ['المعتمدة في المتجر', summary.activeItems],
      ['المتبرعون', summary.donorCount],
      ['المخزون المتبقي', summary.remainingQuantity],
      ['طلبات الاستبدال', rewardReportData.requestRows.length],
      ['تم التسليم', deliveredRedemptions.length],
      ['بانتظار الاعتماد', pendingRedemptions.length],
      ['بانتظار التسليم', approvedRedemptions.length],
    ].map(([label, value]) => `<div class="stat"><div class="k">${label}</div><div class="v">${value}</div></div>`).join('');
    const donorRowsHtml = rewardReportData.donorRows.slice(0, 10).map((row) => `<tr><td>${row.donorName}</td><td>${row.sourceLabel}</td><td>${row.itemsCount}</td><td>${row.totalQuantity}</td><td>${row.remainingQuantity}</td><td>${row.deliveredQuantity}</td></tr>`).join('');
    const itemRowsHtml = rewardReportData.itemRows.slice(0, 10).map((row) => `<tr><td>${row.title}</td><td>${row.donorName}</td><td>${row.quantity}</td><td>${row.remainingQuantity}</td><td>${row.pointsCost}</td><td>${row.requests}</td><td>${row.delivered}</td></tr>`).join('');
    printHtmlContent(`تقرير متجر النقاط — ${selectedSchool?.name || 'المدرسة'}`, `<h1>تقرير متجر النقاط</h1><div class="meta">${selectedSchool?.name || 'المدرسة'} • ${formatDateTime(new Date().toISOString())}</div><div class="stats">${statsHtml}</div><h1 style="font-size:20px;margin-top:24px">أبرز المتبرعين</h1><table><thead><tr><th>المتبرع</th><th>النوع</th><th>عدد الجوائز</th><th>الكمية الأصلية</th><th>المتبقي</th><th>المسلّم</th></tr></thead><tbody>${donorRowsHtml || '<tr><td colspan="6">لا توجد بيانات.</td></tr>'}</tbody></table><h1 style="font-size:20px;margin-top:24px">أكثر الجوائز نشاطًا</h1><table><thead><tr><th>الجائزة</th><th>المتبرع</th><th>الكمية</th><th>المتبقي</th><th>النقاط</th><th>الطلبات</th><th>التسليمات</th></tr></thead><tbody>${itemRowsHtml || '<tr><td colspan="7">لا توجد بيانات.</td></tr>'}</tbody></table>`);
  };

  const [storeTab, setStoreTab] = useState('items');
  const storeTabs = [
    { key: 'items', label: 'المعروضات', icon: Gift, badge: summary.activeItems },
    { key: 'add', label: 'إضافة جائزة', icon: Plus },
    { key: 'inventory', label: 'المخزون والاعتماد', icon: PackageCheck, badge: awaitingReceiptItems.length || undefined },
    { key: 'redemptions', label: 'طلبات الاستبدال', icon: ShoppingCart, badge: pendingRedemptions.length || undefined },
    { key: 'proposals', label: 'مقترحات أولياء الأمور', icon: Users, badge: pendingProposals.length || undefined },
    { key: 'reports', label: 'التقارير', icon: BarChart3 },
  ];

  return <div className="space-y-6">
    {/* ملخص أعلى الصفحة */}
    <div className="grid gap-3 md:grid-cols-3 xl:grid-cols-6">
      <div className="rounded-3xl bg-slate-50 p-4 ring-1 ring-slate-200"><div className="text-xs text-slate-500">إجمالي الجوائز</div><div className="mt-1 text-2xl font-black text-slate-900">{summary.totalItems}</div></div>
      <div className="rounded-3xl bg-slate-50 p-4 ring-1 ring-slate-200"><div className="text-xs text-slate-500">بانتظار الاستلام</div><div className="mt-1 text-2xl font-black text-amber-700">{summary.awaitingReceipt}</div></div>
      <div className="rounded-3xl bg-slate-50 p-4 ring-1 ring-slate-200"><div className="text-xs text-slate-500">بانتظار الاعتماد</div><div className="mt-1 text-2xl font-black text-sky-700">{summary.pendingActivation}</div></div>
      <div className="rounded-3xl bg-emerald-50 p-4 ring-1 ring-emerald-200"><div className="text-xs text-emerald-700 font-bold">الجوائز المعروضة</div><div className="mt-1 text-2xl font-black text-emerald-700">{summary.activeItems}</div></div>
      <div className="rounded-3xl bg-slate-50 p-4 ring-1 ring-slate-200"><div className="text-xs text-slate-500">المتبرعون</div><div className="mt-1 text-2xl font-black text-violet-700">{summary.donorCount}</div></div>
      <div className="rounded-3xl bg-slate-50 p-4 ring-1 ring-slate-200"><div className="text-xs text-slate-500">المخزون المتبقي</div><div className="mt-1 text-2xl font-black text-slate-900">{summary.remainingQuantity}</div></div>
    </div>

    {/* التبويبات العلوية */}
    <div className="flex flex-wrap gap-2 border-b border-slate-200 pb-0">
      {storeTabs.map((tab) => (
        <button
          key={tab.key}
          onClick={() => setStoreTab(tab.key)}
          className={`inline-flex items-center gap-2 rounded-t-2xl px-5 py-3 text-sm font-bold transition-all ${
            storeTab === tab.key
              ? 'bg-white text-sky-700 ring-1 ring-slate-200 ring-b-0 border-b-2 border-sky-600'
              : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50'
          }`}
        >
          <tab.icon className="h-4 w-4" />
          {tab.label}
          {tab.badge ? <span className="rounded-full bg-rose-500 px-1.5 py-0.5 text-[10px] font-black text-white">{tab.badge}</span> : null}
        </button>
      ))}
    </div>

    {/* تبويب المعروضات */}
    {storeTab === 'items' && <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {approvedItems.map((item) => <div key={item.id} className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
          <div className="relative aspect-[16/10] bg-slate-100">{item.image ? <img src={item.image} alt={item.title} className="h-full w-full object-cover" /> : <div className="flex h-full items-center justify-center text-slate-400">بدون صورة</div>}
            <div className="absolute bottom-0 left-0 right-0 flex items-center justify-center bg-gradient-to-t from-black/70 to-transparent py-3">
              <span className="text-xl font-black text-white">{item.pointsCost} <span className="text-sm font-bold opacity-80">نقطة</span></span>
            </div>
          </div>
          <div className="space-y-3 p-4">
            <div className="flex items-start justify-between gap-3">
              <div><div className="font-black text-slate-900">{item.title}</div><div className="mt-1 text-xs text-slate-500">{getRewardStoreDonorLabel(item)} • {item.remainingQuantity}/{item.quantity} متبقي</div></div>
              <div className="rounded-2xl bg-emerald-100 px-3 py-1.5 text-center min-w-[60px]"><div className="text-lg font-black text-emerald-800 leading-none">{item.pointsCost}</div><div className="text-xs font-bold text-emerald-600">نقطة</div></div>
            </div>
            {item.note ? <p className="text-sm leading-7 text-slate-600">{item.note}</p> : null}
            <div className="flex flex-wrap gap-2 text-xs">{item.featured ? <span className="rounded-full bg-amber-100 px-3 py-1 font-black text-amber-800">مهمة</span> : null}{item.showOnScreens !== false ? <span className="rounded-full bg-sky-100 px-3 py-1 font-black text-sky-800">تظهر في الشاشات</span> : <span className="rounded-full bg-slate-200 px-3 py-1 font-black text-slate-700">مخفية عن الشاشات</span>}<span className="rounded-full bg-slate-100 px-3 py-1 font-black text-slate-700">أولوية {formatEnglishDigits(item.displayPriority || 0)}</span></div>
            <div className="grid gap-2 md:grid-cols-3">
              <label className="flex items-center gap-2 rounded-2xl bg-slate-50 px-3 py-2 text-xs font-bold text-slate-700 ring-1 ring-slate-200"><input type="checkbox" checked={item.showOnScreens !== false} onChange={(e) => onUpdateRewardItemMeta?.(item.id, { showOnScreens: e.target.checked })} />عرض في الشاشات</label>
              <label className="flex items-center gap-2 rounded-2xl bg-slate-50 px-3 py-2 text-xs font-bold text-slate-700 ring-1 ring-slate-200"><input type="checkbox" checked={item.featured === true} onChange={(e) => onUpdateRewardItemMeta?.(item.id, { featured: e.target.checked })} />مهمة</label>
              <Input label="أولوية العرض" type="number" value={item.displayPriority || 0} onChange={(e) => onUpdateRewardItemMeta?.(item.id, { displayPriority: e.target.value })} />
            </div>
            <div className="flex gap-2">
              <button type="button" onClick={() => startEditItem(item)} className="flex-1 rounded-2xl bg-sky-700 px-4 py-2 text-sm font-bold text-white">تعديل الجائزة</button>
              <button type="button" onClick={() => onDeleteItem?.(item.id)} className="rounded-2xl border border-rose-200 px-4 py-2 text-sm font-bold text-rose-700">حذف</button>
            </div>
          </div>
        </div>)}
        {editingItemId && <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={(e) => { if (e.target === e.currentTarget) setEditingItemId(null); }}>
          <div className="w-full max-w-lg rounded-3xl bg-white p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-auto">
            <div className="flex items-center justify-between"><h3 className="text-lg font-black text-slate-900">تعديل الجائزة</h3><button onClick={() => setEditingItemId(null)} className="rounded-xl bg-slate-100 px-3 py-2 text-sm font-bold text-slate-600">إغلاق</button></div>
            <div className="grid gap-3 md:grid-cols-2">
              <Input label="اسم الجائزة" value={editDraft.title || ''} onChange={(e) => setEditDraft((p) => ({ ...p, title: e.target.value }))} />
              <div className="grid gap-1"><label className="text-sm font-bold text-slate-700">تكلفة النقاط</label><input type="number" min="0" value={editDraft.pointsCost || 0} onChange={(e) => setEditDraft((p) => ({ ...p, pointsCost: e.target.value }))} className="rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm font-black text-emerald-700 outline-none ring-2 ring-emerald-200" /></div>
              <Input label="الكمية الإجمالية" type="number" value={editDraft.quantity || 1} onChange={(e) => setEditDraft((p) => ({ ...p, quantity: e.target.value }))} />
              <Input label="أولوية العرض" type="number" value={editDraft.displayPriority || 0} onChange={(e) => setEditDraft((p) => ({ ...p, displayPriority: e.target.value }))} />
              <label className="flex items-center gap-2 rounded-2xl bg-slate-50 px-3 py-2 text-xs font-bold text-slate-700 ring-1 ring-slate-200"><input type="checkbox" checked={editDraft.showOnScreens !== false} onChange={(e) => setEditDraft((p) => ({ ...p, showOnScreens: e.target.checked }))} />عرض في الشاشات</label>
              <label className="flex items-center gap-2 rounded-2xl bg-slate-50 px-3 py-2 text-xs font-bold text-slate-700 ring-1 ring-slate-200"><input type="checkbox" checked={editDraft.featured === true} onChange={(e) => setEditDraft((p) => ({ ...p, featured: e.target.checked }))} />جائزة مهمة</label>
              <label className="grid gap-2 text-sm font-bold text-slate-700 md:col-span-2">صورة الجائزة (اتركها فارغة للإبقاء على الصورة الحالية)<input type="file" accept="image/*" onChange={async (e) => { const file = e.target.files?.[0]; if (file) await handleEditImage(file); e.target.value=''; }} className="mt-1 rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm" /></label>
              <label className="grid gap-2 text-sm font-bold text-slate-700 md:col-span-2">ملاحظة<textarea value={editDraft.note || ''} onChange={(e) => setEditDraft((p) => ({ ...p, note: e.target.value }))} className="min-h-[80px] rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm" /></label>
            </div>
            <div className="flex gap-3">
              <button type="button" onClick={saveEditItem} className="flex-1 rounded-2xl bg-emerald-700 px-5 py-3 font-bold text-white">حفظ التعديلات</button>
              <button type="button" onClick={() => setEditingItemId(null)} className="rounded-2xl border border-slate-200 px-5 py-3 font-bold text-slate-700">إلغاء</button>
            </div>
          </div>
        </div>}
        {!approvedItems.length ? <div className="rounded-3xl border border-dashed border-slate-300 p-6 text-sm text-slate-500 col-span-3">لا توجد جوائز معتمدة في المتجر حتى الآن.</div> : null}
      </div>
      {depletedItems.length ? <div><div className="mb-3 text-sm font-bold text-slate-500">جوائز منتهية الكمية</div><div className="grid gap-3 md:grid-cols-2">{depletedItems.map((item) => <div key={item.id} className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm"><div className="font-black text-slate-800">{item.title}</div><div className="mt-1 text-slate-500">{getRewardStoreDonorLabel(item)} • الكمية الأصلية {item.quantity}</div></div>)}</div></div> : null}
      {/* تنبيهات المتجر */}
      <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
        <div className="mb-3 flex items-center gap-2 text-sm font-black text-slate-700"><Bell className="h-4 w-4" /> آخر تنبيهات المتجر</div>
        <div className="grid gap-3 md:grid-cols-4 mb-4">
          <div className="rounded-2xl bg-white p-3 ring-1 ring-slate-200 text-center"><div className="text-xs text-slate-500">آخر التنبيهات</div><div className="mt-1 text-xl font-black text-slate-900">{rewardNotifications.length}</div></div>
          <div className="rounded-2xl bg-emerald-50 p-3 ring-1 ring-emerald-200 text-center"><div className="text-xs text-emerald-700 font-bold">بانتظار الاعتماد</div><div className="mt-1 text-xl font-black text-emerald-700">{pendingRedemptions.length}</div></div>
          <div className="rounded-2xl bg-sky-50 p-3 ring-1 ring-sky-200 text-center"><div className="text-xs text-sky-700 font-bold">بانتظار التسليم</div><div className="mt-1 text-xl font-black text-sky-700">{approvedRedemptions.length}</div></div>
          <div className="rounded-2xl bg-violet-50 p-3 ring-1 ring-violet-200 text-center"><div className="text-xs text-violet-700 font-bold">تم التسليم</div><div className="mt-1 text-xl font-black text-violet-700">{deliveredRedemptions.length}</div></div>
        </div>
        <div className="space-y-2 max-h-64 overflow-auto">
          {rewardNotifications.length ? rewardNotifications.map((note) => (
            <div key={note.id} className="rounded-2xl border border-slate-200 bg-white p-3">
              <div className="flex flex-wrap items-center justify-between gap-2"><div className="text-sm font-black text-slate-900">{note.title}</div><Badge tone={note.type?.includes('rejected') ? 'rose' : note.type?.includes('approved') || note.type?.includes('activated') || note.type?.includes('delivered') ? 'green' : 'blue'}>{note.itemTitle || 'تنبيه متجر'}</Badge></div>
              <div className="mt-1 text-xs text-slate-500">{note.createdByName || 'النظام'} • {formatDateTime(note.createdAt)}</div>
            </div>
          )) : <div className="text-sm text-slate-500">لا توجد تنبيهات حديثة.</div>}
        </div>
      </div>
    </div>}

    {/* تبويب إضافة جائزة */}
    {storeTab === 'add' && <div className="grid gap-4 md:grid-cols-2">
      <Input label="اسم الجائزة" value={draft.title} onChange={(e) => setDraft((prev) => ({ ...prev, title: e.target.value }))} placeholder="مثال: كوبون مقصف" />
      <Input label="الكمية" type="number" value={draft.quantity} onChange={(e) => setDraft((prev) => ({ ...prev, quantity: e.target.value }))} />
      <label className="grid gap-2 text-sm font-bold text-slate-700">الجهة المقدمة
        <select value={draft.sourceType} onChange={(e) => setDraft((prev) => ({ ...prev, sourceType: e.target.value }))} className="rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm font-bold outline-none">
          <option value="school">إدارة المدرسة</option>
          <option value="external">متبرع خارجي</option>
        </select>
      </label>
      <Input label="اسم المتبرع أو الجهة" value={draft.donorName} onChange={(e) => setDraft((prev) => ({ ...prev, donorName: e.target.value }))} placeholder="اختياري" />
      <label className="flex items-center gap-3 rounded-2xl bg-slate-50 px-4 py-4 ring-1 ring-slate-200 md:col-span-2"><input type="checkbox" checked={Boolean(draft.showDonorName)} onChange={(e) => setDraft((prev) => ({ ...prev, showDonorName: e.target.checked }))} /><span className="font-bold text-slate-700">إظهار اسم المتبرع داخل المتجر عند الاعتماد</span></label>
      <label className="flex items-center gap-3 rounded-2xl bg-slate-50 px-4 py-4 ring-1 ring-slate-200"><input type="checkbox" checked={Boolean(draft.showOnScreens)} onChange={(e) => setDraft((prev) => ({ ...prev, showOnScreens: e.target.checked }))} /><span className="font-bold text-slate-700">إتاحة الجائزة للشاشات عند الاعتماد</span></label>
      <label className="flex items-center gap-3 rounded-2xl bg-slate-50 px-4 py-4 ring-1 ring-slate-200"><input type="checkbox" checked={Boolean(draft.featured)} onChange={(e) => setDraft((prev) => ({ ...prev, featured: e.target.checked }))} /><span className="font-bold text-slate-700">تمييز الجائزة كجائزة مهمة</span></label>
      <Input label="أولوية العرض في الشاشات" type="number" value={draft.displayPriority} onChange={(e) => setDraft((prev) => ({ ...prev, displayPriority: e.target.value }))} />
      <label className="grid gap-2 text-sm font-bold text-slate-700 md:col-span-2">صورة الجائزة
        <input type="file" accept="image/*" onChange={async (e) => { const file = e.target.files?.[0]; if (file) await handleImage(file); e.target.value=''; }} className="rounded-2xl border border-slate-300 bg-white px-4 py-3" />
      </label>
      <label className="grid gap-2 text-sm font-bold text-slate-700 md:col-span-2">ملاحظة
        <textarea value={draft.note} onChange={(e) => setDraft((prev) => ({ ...prev, note: e.target.value }))} className="min-h-[110px] rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm" placeholder="مثال: تم التبرع بها للشراكة المجتمعية، وتنتظر الاستلام الفعلي ثم تحديد النقاط." />
      </label>
      <div className="md:col-span-2 rounded-2xl bg-amber-50 px-4 py-3 text-sm font-bold leading-7 text-amber-800 ring-1 ring-amber-100">النقاط لا تُحدد هنا. بعد التأكد من استلام الجائزة فعليًا، يقوم مدير المدرسة بتحديد النقاط ثم اعتمادها للمتجر.</div>
      <button type="button" onClick={submit} className="md:col-span-2 rounded-2xl bg-emerald-700 px-5 py-3 font-bold text-white">حفظ الجائزة في المخزون</button>
    </div>}

    {/* تبويب المخزون والاعتماد */}
    {storeTab === 'inventory' && <div className="space-y-6">
      <div>
        <div className="mb-3 text-sm font-bold text-slate-700">المخزون بانتظار الاستلام أو الاعتماد</div>
        <div className="grid gap-4 lg:grid-cols-2">
        {awaitingReceiptItems.map((item) => <div key={item.id} className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="flex items-start justify-between gap-3">
            <div>
              <div className="font-black text-slate-900">{item.title}</div>
              <div className="mt-1 text-sm text-slate-500">{getRewardStoreDonorLabel(item)} • {item.quantity} قطعة • {getRewardStoreStatusLabel(item.approvalStatus)}</div>
            </div>
            <Badge tone={item.sourceType === 'parent' ? 'violet' : item.sourceType === 'external' ? 'amber' : 'green'}>{item.sourceType === 'parent' ? 'ولي أمر' : item.sourceType === 'external' ? 'متبرع خارجي' : 'المدرسة'}</Badge>
          </div>
          {item.image ? <img src={item.image} alt={item.title} className="mt-4 h-44 w-full rounded-3xl object-cover ring-1 ring-slate-200" /> : null}
          <div className="mt-4 grid gap-3 md:grid-cols-2">
            <Input label="النقاط المعتمدة" type="number" value={activationDrafts[item.id]?.pointsCost ?? ''} onChange={(e) => updateActivationDraft(item.id, { pointsCost: e.target.value })} placeholder="مثال: 500" />
            <Input label="ملاحظة الاعتماد" value={activationDrafts[item.id]?.note ?? ''} onChange={(e) => updateActivationDraft(item.id, { note: e.target.value })} placeholder="مثال: تم الاستلام من المتبرع واعتمادها للمتجر" />
            <label className="flex items-center gap-3 rounded-2xl bg-slate-50 px-4 py-4 ring-1 ring-slate-200"><input type="checkbox" checked={activationDrafts[item.id]?.showOnScreens ?? item.showOnScreens !== false} onChange={(e) => updateActivationDraft(item.id, { showOnScreens: e.target.checked })} /><span className="font-bold text-slate-700">إظهار في الشاشات</span></label>
            <label className="flex items-center gap-3 rounded-2xl bg-slate-50 px-4 py-4 ring-1 ring-slate-200"><input type="checkbox" checked={activationDrafts[item.id]?.featured ?? item.featured === true} onChange={(e) => updateActivationDraft(item.id, { featured: e.target.checked })} /><span className="font-bold text-slate-700">جائزة مهمة</span></label>
            <Input label="أولوية العرض" type="number" value={activationDrafts[item.id]?.displayPriority ?? item.displayPriority ?? 0} onChange={(e) => updateActivationDraft(item.id, { displayPriority: e.target.value })} placeholder="0" />
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            <button type="button" onClick={() => activateRewardItem(item)} className="rounded-2xl bg-sky-700 px-5 py-3 text-sm font-bold text-white">اعتماد وإظهارها في المتجر</button>
            <button type="button" onClick={() => onDeleteItem?.(item.id)} className="rounded-2xl border border-rose-200 px-5 py-3 text-sm font-bold text-rose-700">حذف</button>
          </div>
        </div>)}
        {!awaitingReceiptItems.length ? <div className="rounded-3xl border border-dashed border-slate-300 p-6 text-sm text-slate-500">لا توجد عناصر بانتظار الاستلام أو الاعتماد.</div> : null}
        </div>
      </div>
      <div>
        <div className="mb-3 text-sm font-bold text-slate-700">جوائز المتجر المعتمدة</div>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {approvedItems.map((item) => <div key={item.id} className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
          <div className="aspect-[16/10] bg-slate-100">{item.image ? <img src={item.image} alt={item.title} className="h-full w-full object-cover" /> : <div className="flex h-full items-center justify-center text-slate-400">بدون صورة</div>}</div>
          <div className="space-y-3 p-4">
            <div className="flex items-start justify-between gap-3"><div><div className="font-black text-slate-900">{item.title}</div><div className="mt-1 text-xs text-slate-500">{getRewardStoreDonorLabel(item)} • {item.remainingQuantity}/{item.quantity} متبقي</div></div><Badge tone="green">{item.pointsCost} نقطة</Badge></div>
            {item.note ? <p className="text-sm leading-7 text-slate-600">{item.note}</p> : null}
            <div className="flex flex-wrap gap-2 text-xs">{item.featured ? <span className="rounded-full bg-amber-100 px-3 py-1 font-black text-amber-800">مهمة</span> : null}{item.showOnScreens !== false ? <span className="rounded-full bg-sky-100 px-3 py-1 font-black text-sky-800">تظهر في الشاشات</span> : <span className="rounded-full bg-slate-200 px-3 py-1 font-black text-slate-700">مخفية عن الشاشات</span>}<span className="rounded-full bg-slate-100 px-3 py-1 font-black text-slate-700">أولوية {formatEnglishDigits(item.displayPriority || 0)}</span></div>
            <div className="grid gap-2 md:grid-cols-3">
              <label className="flex items-center gap-2 rounded-2xl bg-slate-50 px-3 py-2 text-xs font-bold text-slate-700 ring-1 ring-slate-200"><input type="checkbox" checked={item.showOnScreens !== false} onChange={(e) => onUpdateRewardItemMeta?.(item.id, { showOnScreens: e.target.checked })} />عرض في الشاشات</label>
              <label className="flex items-center gap-2 rounded-2xl bg-slate-50 px-3 py-2 text-xs font-bold text-slate-700 ring-1 ring-slate-200"><input type="checkbox" checked={item.featured === true} onChange={(e) => onUpdateRewardItemMeta?.(item.id, { featured: e.target.checked })} />مهمة</label>
              <Input label="أولوية العرض" type="number" value={item.displayPriority || 0} onChange={(e) => onUpdateRewardItemMeta?.(item.id, { displayPriority: e.target.value })} />
            </div>
            <div className="flex gap-2"><button type="button" onClick={() => onDeleteItem?.(item.id)} className="rounded-2xl border border-rose-200 px-4 py-2 text-sm font-bold text-rose-700">حذف</button></div>
          </div>
        </div>)}
        {!approvedItems.length ? <div className="rounded-3xl border border-dashed border-slate-300 p-6 text-sm text-slate-500">لا توجد جوائز معتمدة في المتجر حتى الآن.</div> : null}
        </div>
      </div>
      {depletedItems.length ? <div className="mt-4"><div className="mb-3 text-sm font-bold text-slate-500">جوائز منتهية الكمية</div><div className="grid gap-3 md:grid-cols-2">{depletedItems.map((item) => <div key={item.id} className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm"><div className="font-black text-slate-800">{item.title}</div><div className="mt-1 text-slate-500">{getRewardStoreDonorLabel(item)} • الكمية الأصلية {item.quantity}</div></div>)}</div></div> : null}
    </div>}

    {storeTab === 'redemptions' && <div className="space-y-6">
      <div className="rounded-3xl bg-slate-50 p-4 ring-1 ring-slate-200">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <div className="text-sm font-black text-slate-800">مسار الطلب من داخل المدرسة</div>
            <div className="mt-1 text-xs text-slate-500">يمكن لـ {delegateLabel} أو من منحه المدير صلاحية النقاط اختيار الطالب ثم تقديم طلب الجائزة له مباشرة من هنا.</div>
          </div>
          <Badge tone="sky">صلاحية داخلية</Badge>
        </div>
        {(selectedRedemptionStudent || selectedRedemptionItem) ? <div className="mt-3 grid gap-3 md:grid-cols-3">
          <div className="rounded-2xl bg-white p-3 ring-1 ring-slate-200"><div className="text-xs font-bold text-slate-500">الطالب المحدد</div><div className="mt-1 text-sm font-black text-slate-900">{selectedRedemptionStudent?.name || '—'}</div><div className="mt-1 text-xs text-slate-500">{selectedRedemptionStudent ? `${selectedRedemptionStudent.points || 0} نقطة` : 'اختر الطالب أولًا'}</div></div>
          <div className="rounded-2xl bg-white p-3 ring-1 ring-slate-200"><div className="text-xs font-bold text-slate-500">الجائزة المحددة</div><div className="mt-1 text-sm font-black text-slate-900">{selectedRedemptionItem?.title || '—'}</div><div className="mt-1 text-xs text-slate-500">{selectedRedemptionItem ? `${selectedRedemptionItem.pointsCost || 0} نقطة` : 'اختر الجائزة أولًا'}</div></div>
          <div className="rounded-2xl bg-white p-3 ring-1 ring-slate-200"><div className="text-xs font-bold text-slate-500">الرصيد بعد الطلب</div><div className="mt-1 text-sm font-black text-emerald-700">{selectedRedemptionStudent && selectedRedemptionItem ? Math.max(0, Number(selectedRedemptionStudent.points || 0) - Number(selectedRedemptionItem.pointsCost || 0)) : '—'}</div><div className="mt-1 text-xs text-slate-500">تقديري قبل الاعتماد النهائي</div></div>
        </div> : null}
      </div>
      <div className="mb-3 grid gap-3 md:grid-cols-2">
        <select value={redemptionDraft.classFilter || ''} onChange={(e) => setRedemptionDraft((prev) => ({ ...prev, classFilter: e.target.value, studentId: '' }))} className="rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm font-bold outline-none">
          <option value="">اختر الصف أولاً</option>
          {[...new Set(students.map((s) => s.className || s.companyName || 'بدون فصل').filter(Boolean))].sort().map((cls) => <option key={cls} value={cls}>{cls}</option>)}
        </select>
        <div className="text-xs text-rose-600 flex items-center font-bold">يجب اختيار الصف أولاً لتفعيل قائمة الطلاب</div>
      </div>
      <div className="grid gap-4 lg:grid-cols-[1fr,1fr,1.2fr,auto]">
        <select value={redemptionDraft.studentId} onChange={(e) => setRedemptionDraft((prev) => ({ ...prev, studentId: e.target.value }))} disabled={!redemptionDraft.classFilter} className="rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm font-bold outline-none disabled:opacity-50 disabled:cursor-not-allowed">
          <option value="">{redemptionDraft.classFilter ? 'اختر الطالب' : 'اختر الصف أولاً'}</option>
          {(redemptionDraft.classFilter ? students.filter((s) => (s.className || s.companyName || 'بدون فصل') === redemptionDraft.classFilter) : []).map((student) => <option key={student.id} value={student.id}>{student.name} — {student.className || student.companyName || 'بدون فصل'} — {student.points || 0} نقطة</option>)}
        </select>
        <select value={redemptionDraft.itemId} onChange={(e) => setRedemptionDraft((prev) => ({ ...prev, itemId: e.target.value }))} className="rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm font-bold outline-none">
          <option value="">اختر الجائزة</option>
          {approvedItems.map((item) => <option key={item.id} value={item.id}>{item.title} — {item.pointsCost} نقطة — المتبقي {item.remainingQuantity}</option>)}
        </select>
        <Input label="ملاحظة الطلب" value={redemptionDraft.note} onChange={(e) => setRedemptionDraft((prev) => ({ ...prev, note: e.target.value }))} placeholder="مثال: تسليمها في الطابور الصباحي" />
        <button type="button" onClick={submitRedemption} className="rounded-2xl bg-sky-700 px-5 py-3 font-bold text-white">إرسال الطلب</button>
      </div>
      <div className="mt-4 grid gap-3 md:grid-cols-2">
        {pendingRedemptions.slice(0,6).map((request) => <div key={request.id} className="rounded-3xl border border-amber-200 bg-amber-50/60 p-4"><div className="flex items-start justify-between gap-3"><div><div className="font-black text-slate-900">{request.itemTitle}</div><div className="mt-1 text-sm text-slate-500">{request.studentName} • {request.pointsCost} نقطة • {request.createdByLabel || 'طلب'} </div></div><Badge tone="amber">بانتظار الاعتماد</Badge></div><div className="mt-3 grid gap-3 md:grid-cols-[1fr,auto,auto]"><Input label="ملاحظة القرار" value={redemptionDecisionNotes[request.id] || ''} onChange={(e) => setRedemptionDecisionNotes((prev) => ({ ...prev, [request.id]: e.target.value }))} placeholder="ملاحظة عند الاعتماد أو الرفض" /><button type="button" onClick={() => onDecideRedemption?.(request.id, 'approved', redemptionDecisionNotes[request.id] || '')} className="rounded-2xl bg-emerald-700 px-5 py-3 font-bold text-white">اعتماد وخصم النقاط</button><button type="button" onClick={() => onDecideRedemption?.(request.id, 'rejected', redemptionDecisionNotes[request.id] || '')} className="rounded-2xl border border-rose-200 bg-white px-5 py-3 font-bold text-rose-700">رفض</button></div></div>)}
        {!pendingRedemptions.length ? <div className="rounded-3xl border border-dashed border-slate-300 p-6 text-sm text-slate-500">لا توجد طلبات استبدال معلقة.</div> : null}
      </div>
      {approvedRedemptions.length ? <div className="mt-6"><div className="mb-3 text-sm font-bold text-slate-500">طلبات معتمدة بانتظار التسليم</div><div className="grid gap-3">{approvedRedemptions.slice(0,6).map((request) => <div key={request.id} className="rounded-3xl border border-emerald-200 bg-emerald-50/60 p-4"><div className="flex items-center justify-between gap-3"><div><div className="font-black text-slate-900">{request.itemTitle} • {request.studentName}</div><div className="mt-1 text-sm text-slate-500">{request.pointsCost} نقطة • تم الاعتماد {request.decisionAt ? formatDateTime(request.decisionAt) : ''}</div></div><Badge tone="green">بانتظار التسليم</Badge></div><div className="mt-3 grid gap-3 md:grid-cols-[1fr,auto]"><Input label="ملاحظة التسليم" value={redemptionDecisionNotes[request.id] || ''} onChange={(e) => setRedemptionDecisionNotes((prev) => ({ ...prev, [request.id]: e.target.value }))} placeholder="مثال: تم التسليم في الطابور الصباحي" /><button type="button" onClick={() => onDecideRedemption?.(request.id, 'delivered', redemptionDecisionNotes[request.id] || '')} className="rounded-2xl bg-violet-700 px-5 py-3 font-bold text-white">تأكيد التسليم</button></div></div>)}</div></div> : null}
      {deliveredRedemptions.length ? <div className="mt-6"><div className="mb-3 text-sm font-bold text-slate-500">آخر الجوائز المسلّمة</div><div className="grid gap-3">{deliveredRedemptions.slice(0,6).map((request) => <div key={request.id} className="rounded-2xl border border-violet-200 bg-violet-50/60 px-4 py-3 text-sm"><div className="flex items-center justify-between gap-3"><div className="font-bold text-slate-800">{request.itemTitle} • {request.studentName}</div><Badge tone="violet">تم التسليم</Badge></div><div className="mt-1 text-slate-500">{request.deliveryNote || request.decisionNote || request.note || '—'}</div></div>)}</div></div> : null}
      {processedRedemptions.length ? <div className="mt-6"><div className="mb-3 text-sm font-bold text-slate-500">آخر الطلبات المرفوضة</div><div className="grid gap-3">{processedRedemptions.slice(0,6).map((request) => <div key={request.id} className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm"><div className="flex items-center justify-between gap-3"><div className="font-bold text-slate-800">{request.itemTitle} • {request.studentName}</div><Badge tone="rose">مرفوض</Badge></div><div className="mt-1 text-slate-500">{request.decisionNote || request.note || '—'}</div></div>)}</div></div> : null}
    </div>}

    {storeTab === 'proposals' && <div className="space-y-4">
      {pendingProposals.map((proposal) => <div key={proposal.id} className="rounded-3xl border border-amber-200 bg-amber-50/60 p-4">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="space-y-1">
            <div className="text-lg font-black text-slate-900">{proposal.title}</div>
            <div className="text-sm text-slate-500">{proposal.guardianName || 'ولي الأمر'} • {proposal.mobileMasked || proposal.mobile || ''} • {proposal.createdAt ? new Date(proposal.createdAt).toLocaleString('ar-SA') : ''}</div>
            <div className="text-sm text-slate-600">{proposal.note || 'بدون وصف إضافي'}</div>
          </div>
          <div className="text-left">
            <Badge tone="amber">{proposal.quantity || 1} قطعة</Badge>
            <div className="mt-2 text-xs font-bold text-slate-500">الاسم الظاهر: {proposal.showDonorName !== false ? (proposal.donorName || proposal.guardianName || 'ولي الأمر') : 'مخفي'}</div>
          </div>
        </div>
        {proposal.image ? <img src={proposal.image} alt={proposal.title} className="mt-4 h-44 w-full rounded-3xl object-cover ring-1 ring-amber-200" /> : null}
        <div className="mt-4 grid gap-3 md:grid-cols-[1fr,auto,auto]">
          <Input label="ملاحظة المدير" value={proposalDecisionNotes[proposal.id] || ''} onChange={(e) => setProposalDecisionNotes((prev) => ({ ...prev, [proposal.id]: e.target.value }))} placeholder="مثال: يتم انتظار الاستلام من ولي الأمر قبل إدخالها للمتجر" />
          <button type="button" onClick={() => onDecideProposal?.(proposal.id, 'approved', proposalDecisionNotes[proposal.id] || '')} className="rounded-2xl bg-emerald-700 px-5 py-3 font-bold text-white">قبول وتحويل للمخزون</button>
          <button type="button" onClick={() => onDecideProposal?.(proposal.id, 'rejected', proposalDecisionNotes[proposal.id] || '')} className="rounded-2xl border border-rose-200 bg-white px-5 py-3 font-bold text-rose-700">رفض</button>
        </div>
      </div>)}
      {!pendingProposals.length ? <div className="rounded-3xl border border-dashed border-slate-300 p-6 text-sm text-slate-500">لا توجد مقترحات بانتظار الاعتماد.</div> : null}
      {decidedProposals.length ? <div className="mt-4"><div className="mb-3 text-sm font-bold text-slate-500">آخر المقترحات المعالجة</div><div className="grid gap-3">{decidedProposals.slice(0,6).map((proposal) => <div key={proposal.id} className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm"><div className="flex items-center justify-between gap-3"><div className="font-bold text-slate-800">{proposal.title}</div><Badge tone={proposal.status === 'approved' ? 'green' : 'rose'}>{proposal.status === 'approved' ? 'مقبول للمخزون' : 'مرفوض'}</Badge></div><div className="mt-1 text-slate-500">{proposal.decisionNote || proposal.note || '—'}</div></div>)}</div></div> : null}
    </div>}

    {storeTab === 'reports' && <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-2 mb-4">
        <button onClick={printStoreExecutiveReport} className="rounded-2xl bg-white px-4 py-2 text-sm font-bold text-slate-700 ring-1 ring-slate-200">طباعة / PDF</button>
        <button onClick={() => exportStoreDataset('items', 'xlsx')} className="rounded-2xl bg-emerald-600 px-4 py-2 text-sm font-bold text-white">Excel الجوائز</button>
        <button onClick={() => exportStoreDataset('requests', 'csv')} className="rounded-2xl bg-sky-50 px-4 py-2 text-sm font-bold text-sky-700 ring-1 ring-sky-100">CSV الطلبات</button>
      </div>
      <div className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-3xl border border-slate-200 bg-white p-5">
          <div className="text-lg font-black text-slate-900">مصادر الجوائز</div>
          <div className="mt-1 text-sm text-slate-500">يبين مساهمة المدرسة وأولياء الأمور والمتبرعين الخارجيين حسب الكميات المدخلة.</div>
          <div className="mt-4 h-72">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={rewardReportData.sourceRows.length ? rewardReportData.sourceRows : [{ name: 'لا توجد بيانات', value: 1 }]} dataKey="value" nameKey="name" innerRadius={55} outerRadius={90} paddingAngle={3}>
                  {(rewardReportData.sourceRows.length ? rewardReportData.sourceRows : [{ name: 'لا توجد بيانات', value: 1 }]).map((_, index) => <Cell key={index} fill={["#10b981", "#0ea5e9", "#8b5cf6", "#f59e0b"][index % 4]} />)}
                </Pie>
                <Tooltip formatter={(value) => [value, 'الكمية']} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className="rounded-3xl border border-slate-200 bg-white p-5">
          <div className="text-lg font-black text-slate-900">حالة الطلبات</div>
          <div className="mt-1 text-sm text-slate-500">يميز بين الطلبات المعلقة، المعتمدة بانتظار التسليم، والمسلمة فعليًا.</div>
          <div className="mt-4 h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={rewardReportData.statusRows.length ? rewardReportData.statusRows : [{ name: 'لا توجد بيانات', value: 0 }]}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" tickLine={false} axisLine={false} />
                <YAxis allowDecimals={false} tickLine={false} axisLine={false} />
                <Tooltip formatter={(value) => [value, 'العدد']} />
                <Bar dataKey="value" radius={[14,14,0,0]}>
                  {(rewardReportData.statusRows.length ? rewardReportData.statusRows : [{ name: 'لا توجد بيانات', value: 0 }]).map((_, index) => <Cell key={index} fill={["#f59e0b", "#10b981", "#8b5cf6", "#ef4444"][index % 4]} />)}
                  <LabelList dataKey="value" position="top" />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-2">
        <div className="rounded-3xl border border-slate-200 bg-white p-5">
          <div className="mb-3 flex items-center justify-between gap-3"><div><div className="text-lg font-black text-slate-900">تقرير المتبرعين</div><div className="text-sm text-slate-500">عدد المتبرعين، أسماؤهم، وما قدمه كل متبرع من جوائز وكميات.</div></div><div className="flex gap-2"><button onClick={() => exportStoreDataset('donors', 'xlsx')} className="rounded-2xl bg-emerald-600 px-3 py-2 text-xs font-bold text-white">Excel</button><button onClick={() => exportStoreDataset('donors', 'csv')} className="rounded-2xl bg-sky-50 px-3 py-2 text-xs font-bold text-sky-700 ring-1 ring-sky-100">CSV</button></div></div>
          <div className="max-h-[26rem] overflow-auto rounded-2xl ring-1 ring-slate-200">
            <table className="w-full text-sm"><thead className="bg-slate-50 text-slate-600"><tr><th className="px-3 py-3 text-right">المتبرع</th><th className="px-3 py-3 text-right">النوع</th><th className="px-3 py-3 text-center">الجوائز</th><th className="px-3 py-3 text-center">الكمية</th><th className="px-3 py-3 text-center">المتبقي</th><th className="px-3 py-3 text-center">المسلّم</th></tr></thead><tbody>{rewardReportData.donorRows.length ? rewardReportData.donorRows.map((row, idx) => <tr key={`${row.donorName}-${idx}`} className="border-t border-slate-100"><td className="px-3 py-3 font-bold text-slate-800">{row.donorName}</td><td className="px-3 py-3 text-slate-500">{row.sourceLabel}</td><td className="px-3 py-3 text-center">{row.itemsCount}</td><td className="px-3 py-3 text-center">{row.totalQuantity}</td><td className="px-3 py-3 text-center text-emerald-700">{row.remainingQuantity}</td><td className="px-3 py-3 text-center text-violet-700">{row.deliveredQuantity}</td></tr>) : <tr><td className="px-3 py-6 text-center text-slate-500" colSpan="6">لا توجد بيانات متاحة.</td></tr>}</tbody></table>
          </div>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-5">
          <div className="mb-3 flex items-center justify-between gap-3"><div><div className="text-lg font-black text-slate-900">تقرير الجوائز والمخزون</div><div className="text-sm text-slate-500">يبين الجوائز المستلمة، الكمية المتبقية، والجوائز الأكثر طلبًا.</div></div><div className="flex gap-2"><button onClick={() => exportStoreDataset('items', 'xlsx')} className="rounded-2xl bg-emerald-600 px-3 py-2 text-xs font-bold text-white">Excel</button><button onClick={() => exportStoreDataset('items', 'csv')} className="rounded-2xl bg-sky-50 px-3 py-2 text-xs font-bold text-sky-700 ring-1 ring-sky-100">CSV</button></div></div>
          <div className="h-72"><ResponsiveContainer width="100%" height="100%"><BarChart data={rewardReportData.itemRows.slice(0,6).length ? rewardReportData.itemRows.slice(0,6).map((row) => ({ name: row.title, الطلبات: row.requests, التسليمات: row.delivered })) : [{ name: 'لا توجد بيانات', الطلبات: 0, التسليمات: 0 }]}><CartesianGrid strokeDasharray="3 3" vertical={false} /><XAxis dataKey="name" tickLine={false} axisLine={false} hide /><YAxis allowDecimals={false} tickLine={false} axisLine={false} /><Tooltip /><Bar dataKey="الطلبات" radius={[14,14,0,0]} fill="#0ea5e9" /><Bar dataKey="التسليمات" radius={[14,14,0,0]} fill="#10b981" /></BarChart></ResponsiveContainer></div>
          <div className="mt-4 max-h-[16rem] overflow-auto rounded-2xl ring-1 ring-slate-200"><table className="w-full text-sm"><thead className="bg-slate-50 text-slate-600"><tr><th className="px-3 py-3 text-right">الجائزة</th><th className="px-3 py-3 text-center">الكمية</th><th className="px-3 py-3 text-center">المتبقي</th><th className="px-3 py-3 text-center">النقاط</th><th className="px-3 py-3 text-center">الطلبات</th><th className="px-3 py-3 text-center">الحالة</th></tr></thead><tbody>{rewardReportData.itemRows.length ? rewardReportData.itemRows.slice(0,10).map((row) => <tr key={row.itemId} className="border-t border-slate-100"><td className="px-3 py-3 font-bold text-slate-800">{row.title}<div className="text-xs font-normal text-slate-500">{row.donorName}</div></td><td className="px-3 py-3 text-center">{row.quantity}</td><td className="px-3 py-3 text-center text-emerald-700">{row.remainingQuantity}</td><td className="px-3 py-3 text-center">{row.pointsCost}</td><td className="px-3 py-3 text-center text-sky-700">{row.requests}</td><td className="px-3 py-3 text-center">{row.statusLabel}</td></tr>) : <tr><td className="px-3 py-6 text-center text-slate-500" colSpan="6">لا توجد بيانات.</td></tr>}</tbody></table></div>
        </div>
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-2">
        <div className="rounded-3xl border border-slate-200 bg-white p-5">
          <div className="mb-3 flex items-center justify-between gap-3"><div><div className="text-lg font-black text-slate-900">تقرير الطلبات</div><div className="text-sm text-slate-500">كل طلب، حالته، الجهة التي طلبته، وتوقيت القرار أو التسليم.</div></div><div className="flex gap-2"><button onClick={() => exportStoreDataset('requests', 'xlsx')} className="rounded-2xl bg-emerald-600 px-3 py-2 text-xs font-bold text-white">Excel</button><button onClick={() => exportStoreDataset('requests', 'csv')} className="rounded-2xl bg-sky-50 px-3 py-2 text-xs font-bold text-sky-700 ring-1 ring-sky-100">CSV</button></div></div>
          <div className="max-h-[26rem] overflow-auto rounded-2xl ring-1 ring-slate-200"><table className="w-full text-sm"><thead className="bg-slate-50 text-slate-600"><tr><th className="px-3 py-3 text-right">الطالب</th><th className="px-3 py-3 text-right">الفصل</th><th className="px-3 py-3 text-right">الجائزة</th><th className="px-3 py-3 text-center">الحالة</th><th className="px-3 py-3 text-right">جهة الطلب</th><th className="px-3 py-3 text-right">الطلب</th></tr></thead><tbody>{rewardReportData.requestRows.length ? rewardReportData.requestRows.slice(0,30).map((row) => <tr key={row.id} className="border-t border-slate-100"><td className="px-3 py-3 font-bold text-slate-800">{row.studentName}</td><td className="px-3 py-3 text-slate-500">{row.className}</td><td className="px-3 py-3">{row.itemTitle}<div className="text-xs text-slate-500">{row.pointsCost} نقطة</div></td><td className="px-3 py-3 text-center">{row.statusLabel}</td><td className="px-3 py-3 text-slate-500">{row.requesterLabel}<div className="text-xs">{row.requesterName}</div></td><td className="px-3 py-3 text-xs text-slate-500">{row.createdAt}</td></tr>) : <tr><td className="px-3 py-6 text-center text-slate-500" colSpan="6">لا توجد طلبات بعد.</td></tr>}</tbody></table></div>
        </div>

        <div className="space-y-6">
          <div className="rounded-3xl border border-slate-200 bg-white p-5">
            <div className="mb-3 flex items-center justify-between gap-3"><div><div className="text-lg font-black text-slate-900">تقرير الطلاب</div><div className="text-sm text-slate-500">من أكثر الطلاب استبدالًا وأعلى من صرفوا نقاطًا من المتجر.</div></div><div className="flex gap-2"><button onClick={() => exportStoreDataset('students', 'xlsx')} className="rounded-2xl bg-emerald-600 px-3 py-2 text-xs font-bold text-white">Excel</button><button onClick={() => exportStoreDataset('students', 'csv')} className="rounded-2xl bg-sky-50 px-3 py-2 text-xs font-bold text-sky-700 ring-1 ring-sky-100">CSV</button></div></div>
            <div className="max-h-[15rem] overflow-auto rounded-2xl ring-1 ring-slate-200"><table className="w-full text-sm"><thead className="bg-slate-50 text-slate-600"><tr><th className="px-3 py-3 text-right">الطالب</th><th className="px-3 py-3 text-right">الفصل</th><th className="px-3 py-3 text-center">الطلبات</th><th className="px-3 py-3 text-center">المسلّم</th><th className="px-3 py-3 text-center">النقاط المصروفة</th></tr></thead><tbody>{rewardReportData.studentRows.length ? rewardReportData.studentRows.slice(0,12).map((row) => <tr key={row.studentId} className="border-t border-slate-100"><td className="px-3 py-3 font-bold text-slate-800">{row.studentName}</td><td className="px-3 py-3 text-slate-500">{row.className}</td><td className="px-3 py-3 text-center">{row.requests}</td><td className="px-3 py-3 text-center text-violet-700">{row.delivered}</td><td className="px-3 py-3 text-center text-emerald-700">{row.pointsSpent}</td></tr>) : <tr><td className="px-3 py-6 text-center text-slate-500" colSpan="5">لا توجد بيانات طلاب.</td></tr>}</tbody></table></div>
          </div>
          <div className="rounded-3xl border border-slate-200 bg-white p-5">
            <div className="mb-3 flex items-center justify-between gap-3"><div><div className="text-lg font-black text-slate-900">تقرير الفصول</div><div className="text-sm text-slate-500">يبين أكثر الفصول استفادة من المتجر وعدد الطلاب المستفيدين داخل كل فصل.</div></div><div className="flex gap-2"><button onClick={() => exportStoreDataset('classes', 'xlsx')} className="rounded-2xl bg-emerald-600 px-3 py-2 text-xs font-bold text-white">Excel</button><button onClick={() => exportStoreDataset('classes', 'csv')} className="rounded-2xl bg-sky-50 px-3 py-2 text-xs font-bold text-sky-700 ring-1 ring-sky-100">CSV</button></div></div>
            <div className="max-h-[15rem] overflow-auto rounded-2xl ring-1 ring-slate-200"><table className="w-full text-sm"><thead className="bg-slate-50 text-slate-600"><tr><th className="px-3 py-3 text-right">الفصل</th><th className="px-3 py-3 text-center">الطلبات</th><th className="px-3 py-3 text-center">المسلّم</th><th className="px-3 py-3 text-center">النقاط المصروفة</th><th className="px-3 py-3 text-center">الطلاب المستفيدون</th></tr></thead><tbody>{rewardReportData.classRows.length ? rewardReportData.classRows.slice(0,12).map((row) => <tr key={row.className} className="border-t border-slate-100"><td className="px-3 py-3 font-bold text-slate-800">{row.className}</td><td className="px-3 py-3 text-center">{row.requests}</td><td className="px-3 py-3 text-center text-violet-700">{row.delivered}</td><td className="px-3 py-3 text-center text-emerald-700">{row.pointsSpent}</td><td className="px-3 py-3 text-center">{row.uniqueStudents}</td></tr>) : <tr><td className="px-3 py-6 text-center text-slate-500" colSpan="5">لا توجد بيانات فصول.</td></tr>}</tbody></table></div>
          </div>
        </div>
      </div>
    </div>}

  </div>;
}

export default RewardStorePage;

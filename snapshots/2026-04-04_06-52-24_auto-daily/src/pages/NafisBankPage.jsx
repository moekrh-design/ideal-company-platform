/**
 * ==========================================
 *  NafisBankPage Component
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


function NafisBankPage({ currentUser }) {
  const [tab, setTab] = React.useState('overview');
  const [data, setData] = React.useState(null);
  const [loading, setLoading] = React.useState(true);
  const [filterGrade, setFilterGrade] = React.useState('');
  const [filterSubject, setFilterSubject] = React.useState('');
  const [filterType, setFilterType] = React.useState('all'); // all, builtin, custom, deleted
  const [searchText, setSearchText] = React.useState('');
  const [editingQ, setEditingQ] = React.useState(null);
  const [showAddForm, setShowAddForm] = React.useState(false);
  const [importResult, setImportResult] = React.useState(null);
  const [saving, setSaving] = React.useState(false);
  const [importGrade, setImportGrade] = React.useState('p3');
  const [importSubject, setImportSubject] = React.useState('math');
  const [importPreview, setImportPreview] = React.useState([]);
  const [importFile, setImportFile] = React.useState(null);
  const importFileRef = React.useRef(null);
  const [msg, setMsg] = React.useState(null);

  const [form, setForm] = React.useState({
    gradeKey: 'p3', subject: 'math', skill: '', difficulty: 'medium',
    question: '', options: ['', '', '', ''], correctIndex: 0, explanation: ''
  });

  const GRADE_LABELS = {
    p1:'أول ابتدائي', p2:'ثاني ابتدائي', p3:'ثالث ابتدائي',
    p4:'رابع ابتدائي', p5:'خامس ابتدائي', p6:'سادس ابتدائي',
    m1:'أول متوسط', m2:'ثاني متوسط', m3:'ثالث متوسط',
    s1:'أول ثانوي', s2:'ثاني ثانوي', s3:'ثالث ثانوي'
  };
  const SUBJECT_LABELS = {
    math:'رياضيات', arabic:'لغة عربية', science:'علوم',
    english:'إنجليزية', social:'اجتماعيات', islamic:'تربية إسلامية',
    physics:'فيزياء', chemistry:'كيمياء', biology:'أحياء'
  };
  const DIFFICULTY_LABELS = { easy:'سهل', medium:'متوسط', hard:'صعب' };

  const token = localStorage.getItem('ideal-company-platform-session-token-v8') || localStorage.getItem('session-token') || localStorage.getItem('auth-token') || '';

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/nafis/bank', { headers: { Authorization: `Bearer ${token}` } });
      const json = await res.json();
      if (json.ok) setData(json);
    } catch (e) { console.error(e); }
    setLoading(false);
  };

  React.useEffect(() => { fetchData(); }, []);

  const showMsg = (text, type = 'success') => {
    setMsg({ text, type });
    setTimeout(() => setMsg(null), 3500);
  };

  const handleSaveQuestion = async () => {
    if (!form.question.trim() || form.options.some(o => !o.trim())) {
      showMsg('يرجى ملء جميع الحقول المطلوبة', 'error'); return;
    }
    setSaving(true);
    try {
      const payload = { ...form, correct: form.correctIndex };
      let url = '/api/nafis/bank/add';
      let method = 'POST';
      if (editingQ) { url = `/api/nafis/bank/update/${editingQ.id}`; method = 'PUT'; }
      const res = await fetch(url, {
        method, headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(payload)
      });
      const json = await res.json();
      if (json.ok) {
        showMsg(editingQ ? 'تم تحديث السؤال بنجاح' : 'تم إضافة السؤال بنجاح');
        setEditingQ(null); setShowAddForm(false);
        setForm({ gradeKey: 'p3', subject: 'math', skill: '', difficulty: 'medium', question: '', options: ['', '', '', ''], correctIndex: 0, explanation: '' });
        fetchData();
      } else showMsg(json.error || 'حدث خطأ', 'error');
    } catch (e) { showMsg('خطأ في الاتصال', 'error'); }
    setSaving(false);
  };

  const handleDelete = async (q) => {
    if (!confirm(`هل تريد حذف هذا السؤال؟\n"${q.question.substring(0, 60)}..."`)) return;
    try {
      const res = await fetch(`/api/nafis/bank/delete/${q.id}`, {
        method: 'DELETE', headers: { Authorization: `Bearer ${token}` }
      });
      const json = await res.json();
      if (json.ok) { showMsg('تم حذف السؤال'); fetchData(); }
      else showMsg(json.error || 'حدث خطأ', 'error');
    } catch (e) { showMsg('خطأ في الاتصال', 'error'); }
  };

  const handleRestore = async (q) => {
    try {
      const res = await fetch(`/api/nafis/bank/restore/${q.id}`, {
        method: 'POST', headers: { Authorization: `Bearer ${token}` }
      });
      const json = await res.json();
      if (json.ok) { showMsg('تم استعادة السؤال'); fetchData(); }
      else showMsg(json.error || 'حدث خطأ', 'error');
    } catch (e) { showMsg('خطأ في الاتصال', 'error'); }
  };

  const handleEdit = (q) => {
    setForm({
      gradeKey: q.gradeKey, subject: q.subject, skill: q.skill || '',
      difficulty: q.difficulty || 'medium', question: q.question,
      options: [...q.options], correctIndex: q.correct !== undefined ? q.correct : (q.correctIndex || 0),
      explanation: q.explanation || ''
    });
    setEditingQ(q); setShowAddForm(true); setTab('add');
  };

  // تحميل نموذج Excel
  const handleDownloadTemplate = () => {
    const ws = XLSX.utils.aoa_to_sheet([
      ['السؤال', 'الخيار أ', 'الخيار ب', 'الخيار ج', 'الخيار د', 'رقم الإجابة الصحيحة (1-4)', 'المهارة', 'الصعوبة (easy/medium/hard)', 'التفسير'],
      ['كم يساوي 5 + 3؟', '6', '7', '8', '9', '3', 'الجمع', 'easy', '5 + 3 = 8'],
      ['ما عاصمة المملكة العربية السعودية؟', 'الرياض', 'جدة', 'مكة', 'الدمام', '1', 'جغرافيا', 'easy', 'عاصمة المملكة هي الرياض'],
    ]);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'نموذج الأسئلة');
    XLSX.writeFile(wb, 'نموذج_أسئلة_نافس.xlsx');
  };

  // معالجة ملف Excel وعرض معاينة
  const handleExcelFile = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImportFile(file);
    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const wb = XLSX.read(evt.target.result, { type: 'binary' });
        const ws = wb.Sheets[wb.SheetNames[0]];
        const rows = XLSX.utils.sheet_to_json(ws, { header: 1, defval: '' });
        // تجاهل الصف الأول (العناوين) ومعالجة باقي الصفوف
        const dataRows = rows.slice(1).filter(r => r[0] && String(r[0]).trim());
        const preview = dataRows.map((r, i) => ({
          _row: i + 2,
          question: String(r[0] || '').trim(),
          options: [String(r[1]||'').trim(), String(r[2]||'').trim(), String(r[3]||'').trim(), String(r[4]||'').trim()],
          correct: Math.max(0, Math.min(3, Number(r[5] || 1) - 1)),
          skill: String(r[6] || '').trim(),
          difficulty: ['easy','medium','hard'].includes(String(r[7]||'').trim()) ? String(r[7]).trim() : 'medium',
          explanation: String(r[8] || '').trim(),
          gradeKey: importGrade,
          subject: importSubject,
        }));
        setImportPreview(preview);
        showMsg(`تم تحليل ${preview.length} سؤال من الملف`);
      } catch (err) { showMsg('خطأ في قراءة الملف', 'error'); }
    };
    reader.readAsBinaryString(file);
  };

  const handleImport = async () => {
    if (!importPreview.length) { showMsg('يرجى اختيار ملف Excel أولاً', 'error'); return; }
    // تحديث gradeKey و subject لجميع الأسئلة حسب الاختيار الحالي
    const questions = importPreview.map(q => ({ ...q, gradeKey: importGrade, subject: importSubject }));
    setSaving(true);
    try {
      const res = await fetch('/api/nafis/bank/import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ questions })
      });
      const json = await res.json();
      if (json.ok) {
        setImportResult(json);
        setImportPreview([]);
        setImportFile(null);
        if (importFileRef.current) importFileRef.current.value = '';
        showMsg(`تم استيراد ${json.imported} سؤال بنجاح`);
        fetchData();
      } else showMsg(json.error || 'حدث خطأ', 'error');
    } catch (e) { showMsg('خطأ في الاتصال', 'error'); }
    setSaving(false);
  };

  const getFilteredQuestions = () => {
    if (!data) return [];
    let questions = [];
    if (filterType === 'deleted') {
      questions = data.allDeletedQuestions || [];
    } else {
      questions = data.allQuestions || [];
      if (filterType === 'builtin') questions = questions.filter(q => q.isBuiltIn);
      else if (filterType === 'custom') questions = questions.filter(q => !q.isBuiltIn);
    }
    if (filterGrade) questions = questions.filter(q => q.gradeKey === filterGrade);
    if (filterSubject) questions = questions.filter(q => q.subject === filterSubject);
    if (searchText.trim()) {
      const s = searchText.trim().toLowerCase();
      questions = questions.filter(q => q.question.toLowerCase().includes(s) || (q.skill || '').toLowerCase().includes(s));
    }
    return questions;
  };

  const filteredQ = getFilteredQuestions();

  if (loading) return React.createElement('div', { className: 'flex items-center justify-center h-64' },
    React.createElement('div', { className: 'text-center' },
      React.createElement('div', { className: 'text-4xl mb-3' }, '⏳'),
      React.createElement('p', { className: 'text-gray-500' }, 'جاري تحميل بنك الأسئلة...')
    )
  );

  return React.createElement('div', { className: 'p-4 max-w-7xl mx-auto' },
    // رسالة التنبيه
    msg && React.createElement('div', {
      className: `fixed top-4 left-1/2 transform -translate-x-1/2 z-50 px-6 py-3 rounded-xl shadow-lg text-white font-bold text-sm ${msg.type === 'error' ? 'bg-red-500' : 'bg-green-500'}`
    }, msg.text),

    // العنوان
    React.createElement('div', { className: 'mb-6' },
      React.createElement('h1', { className: 'text-2xl font-bold text-gray-800 mb-1' }, '📚 بنك أسئلة نافس'),
      React.createElement('p', { className: 'text-gray-500 text-sm' }, 'إدارة شاملة لجميع أسئلة نافس التجريبي والتحصيلي والتهيئة المهارية')
    ),

    // بطاقات الإحصائيات السريعة
    data && React.createElement('div', { className: 'grid grid-cols-2 md:grid-cols-4 gap-3 mb-6' },
      [
        { label: 'إجمالي الأسئلة الفعالة', value: data.totalCount, color: 'bg-blue-50 border-blue-200', icon: '📊' },
        { label: 'أسئلة أصلية', value: data.staticCount, color: 'bg-green-50 border-green-200', icon: '🔒' },
        { label: 'أسئلة مضافة', value: data.customCount, color: 'bg-purple-50 border-purple-200', icon: '✏️' },
        { label: 'أسئلة محذوفة', value: data.deletedCount, color: 'bg-red-50 border-red-200', icon: '🗑️' },
      ].map((card, i) =>
        React.createElement('div', { key: i, className: `${card.color} border rounded-xl p-4 text-center` },
          React.createElement('div', { className: 'text-2xl mb-1' }, card.icon),
          React.createElement('div', { className: 'text-2xl font-bold text-gray-800' }, card.value),
          React.createElement('div', { className: 'text-xs text-gray-500 mt-1' }, card.label)
        )
      )
    ),

    // التبويبات
    React.createElement('div', { className: 'flex gap-1 mb-6 bg-gray-100 rounded-xl p-1 flex-wrap' },
      [
        { key: 'overview', label: '📊 نظرة عامة' },
        { key: 'questions', label: '📋 جميع الأسئلة' },
        { key: 'add', label: editingQ ? '✏️ تعديل سؤال' : '➕ إضافة سؤال' },
        { key: 'import', label: '📥 استيراد بالجملة' },
      ].map(t =>
        React.createElement('button', {
          key: t.key,
          onClick: () => { setTab(t.key); if (t.key !== 'add') { setEditingQ(null); setShowAddForm(false); } },
          className: `flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-all ${tab === t.key ? 'bg-white shadow text-blue-600' : 'text-gray-600 hover:text-gray-800'}`
        }, t.label)
      )
    ),

    // تبويب: نظرة عامة
    tab === 'overview' && data && React.createElement('div', null,
      React.createElement('h3', { className: 'font-bold text-gray-700 mb-4' }, 'توزيع الأسئلة حسب الصف والمادة'),
      React.createElement('div', { className: 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4' },
        Object.entries(data.statsByGrade || {}).map(([grade, info]) =>
          React.createElement('div', { key: grade, className: 'bg-white border rounded-xl p-4 shadow-sm' },
            React.createElement('div', { className: 'flex justify-between items-center mb-3' },
              React.createElement('h4', { className: 'font-bold text-gray-800 text-sm' }, GRADE_LABELS[grade] || grade),
              React.createElement('span', { className: 'bg-blue-100 text-blue-700 text-xs font-bold px-2 py-1 rounded-full' }, `${info.total} سؤال`)
            ),
            React.createElement('div', { className: 'space-y-1' },
              Object.entries(info.bySubject || {}).map(([subj, count]) =>
                React.createElement('div', { key: subj, className: 'flex justify-between items-center text-xs' },
                  React.createElement('span', { className: 'text-gray-600' }, SUBJECT_LABELS[subj] || subj),
                  React.createElement('span', { className: 'font-bold text-gray-800' }, count)
                )
              )
            )
          )
        )
      )
    ),

    // تبويب: جميع الأسئلة
    tab === 'questions' && React.createElement('div', null,
      // فلاتر البحث
      React.createElement('div', { className: 'bg-white border rounded-xl p-4 mb-4 shadow-sm' },
        React.createElement('div', { className: 'grid grid-cols-2 md:grid-cols-4 gap-3 mb-3' },
          React.createElement('select', {
            value: filterGrade, onChange: e => setFilterGrade(e.target.value),
            className: 'border rounded-lg px-3 py-2 text-sm'
          },
            React.createElement('option', { value: '' }, 'كل الصفوف'),
            Object.entries(GRADE_LABELS).map(([k, v]) => React.createElement('option', { key: k, value: k }, v))
          ),
          React.createElement('select', {
            value: filterSubject, onChange: e => setFilterSubject(e.target.value),
            className: 'border rounded-lg px-3 py-2 text-sm'
          },
            React.createElement('option', { value: '' }, 'كل المواد'),
            Object.entries(SUBJECT_LABELS).map(([k, v]) => React.createElement('option', { key: k, value: k }, v))
          ),
          React.createElement('select', {
            value: filterType, onChange: e => setFilterType(e.target.value),
            className: 'border rounded-lg px-3 py-2 text-sm'
          },
            React.createElement('option', { value: 'all' }, 'كل الأنواع'),
            React.createElement('option', { value: 'builtin' }, '🔒 أصلية فقط'),
            React.createElement('option', { value: 'custom' }, '✏️ مضافة فقط'),
            React.createElement('option', { value: 'deleted' }, '🗑️ محذوفة')
          ),
          React.createElement('input', {
            type: 'text', placeholder: 'بحث في الأسئلة...',
            value: searchText, onChange: e => setSearchText(e.target.value),
            className: 'border rounded-lg px-3 py-2 text-sm'
          })
        ),
        React.createElement('div', { className: 'text-sm text-gray-500' }, `عدد النتائج: ${filteredQ.length} سؤال`)
      ),

      // قائمة الأسئلة
      React.createElement('div', { className: 'space-y-3' },
        filteredQ.length === 0
          ? React.createElement('div', { className: 'text-center py-12 text-gray-400' },
              React.createElement('div', { className: 'text-4xl mb-2' }, '🔍'),
              React.createElement('p', null, 'لا توجد أسئلة تطابق الفلتر')
            )
          : filteredQ.map((q, idx) =>
              React.createElement('div', {
                key: q.id || idx,
                className: `bg-white border rounded-xl p-4 shadow-sm ${q.deleted ? 'opacity-60 border-red-200 bg-red-50' : ''}`
              },
                React.createElement('div', { className: 'flex justify-between items-start gap-3' },
                  React.createElement('div', { className: 'flex-1' },
                    // شارات
                    React.createElement('div', { className: 'flex gap-2 flex-wrap mb-2' },
                      React.createElement('span', { className: 'bg-blue-100 text-blue-700 text-xs px-2 py-0.5 rounded-full' }, GRADE_LABELS[q.gradeKey] || q.gradeKey),
                      React.createElement('span', { className: 'bg-green-100 text-green-700 text-xs px-2 py-0.5 rounded-full' }, SUBJECT_LABELS[q.subject] || q.subject),
                      q.difficulty && React.createElement('span', { className: 'bg-orange-100 text-orange-700 text-xs px-2 py-0.5 rounded-full' }, DIFFICULTY_LABELS[q.difficulty] || q.difficulty),
                      q.skill && React.createElement('span', { className: 'bg-purple-100 text-purple-700 text-xs px-2 py-0.5 rounded-full' }, q.skill),
                      q.isBuiltIn && !q.isModified && React.createElement('span', { className: 'bg-gray-100 text-gray-600 text-xs px-2 py-0.5 rounded-full' }, '🔒 أصلي'),
                      q.isModified && React.createElement('span', { className: 'bg-yellow-100 text-yellow-700 text-xs px-2 py-0.5 rounded-full' }, '✏️ معدّل'),
                      !q.isBuiltIn && !q.deleted && React.createElement('span', { className: 'bg-purple-100 text-purple-700 text-xs px-2 py-0.5 rounded-full' }, '✨ مضاف'),
                      q.deleted && React.createElement('span', { className: 'bg-red-100 text-red-700 text-xs px-2 py-0.5 rounded-full' }, '🗑️ محذوف')
                    ),
                    // نص السؤال
                    React.createElement('p', { className: 'text-gray-800 font-medium text-sm mb-2' }, q.question),
                    // الخيارات
                    React.createElement('div', { className: 'grid grid-cols-2 gap-1' },
                      (q.options || []).map((opt, i) =>
                        React.createElement('div', {
                          key: i,
                          className: `text-xs px-2 py-1 rounded-lg ${i === (q.correct !== undefined ? q.correct : q.correctIndex) ? 'bg-green-100 text-green-700 font-bold' : 'bg-gray-50 text-gray-600'}`
                        }, `${['أ','ب','ج','د'][i]}) ${opt}`)
                      )
                    ),
                    q.explanation && React.createElement('p', { className: 'text-xs text-gray-500 mt-2 italic' }, `💡 ${q.explanation}`)
                  ),
                  // أزرار الإجراءات
                  React.createElement('div', { className: 'flex flex-col gap-2 shrink-0' },
                    !q.deleted && React.createElement('button', {
                      onClick: () => handleEdit(q),
                      className: 'bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs px-3 py-1.5 rounded-lg font-medium transition-colors'
                    }, '✏️ تعديل'),
                    !q.deleted && React.createElement('button', {
                      onClick: () => handleDelete(q),
                      className: 'bg-red-50 hover:bg-red-100 text-red-700 text-xs px-3 py-1.5 rounded-lg font-medium transition-colors'
                    }, '🗑️ حذف'),
                    q.deleted && React.createElement('button', {
                      onClick: () => handleRestore(q),
                      className: 'bg-green-50 hover:bg-green-100 text-green-700 text-xs px-3 py-1.5 rounded-lg font-medium transition-colors'
                    }, '♻️ استعادة')
                  )
                )
              )
            )
      )
    ),

    // تبويب: إضافة / تعديل سؤال
    tab === 'add' && React.createElement('div', { className: 'bg-white border rounded-xl p-6 shadow-sm' },
      React.createElement('h3', { className: 'font-bold text-gray-800 mb-4 text-lg' },
        editingQ ? `✏️ تعديل سؤال: ${editingQ.question.substring(0, 40)}...` : '➕ إضافة سؤال جديد'
      ),
      React.createElement('div', { className: 'grid grid-cols-1 md:grid-cols-2 gap-4 mb-4' },
        // الصف
        React.createElement('div', null,
          React.createElement('label', { className: 'block text-sm font-medium text-gray-700 mb-1' }, 'الصف الدراسي *'),
          React.createElement('select', {
            value: form.gradeKey,
            onChange: e => setForm(f => ({ ...f, gradeKey: e.target.value })),
            className: 'w-full border rounded-lg px-3 py-2 text-sm'
          }, Object.entries(GRADE_LABELS).map(([k, v]) => React.createElement('option', { key: k, value: k }, v)))
        ),
        // المادة
        React.createElement('div', null,
          React.createElement('label', { className: 'block text-sm font-medium text-gray-700 mb-1' }, 'المادة *'),
          React.createElement('select', {
            value: form.subject,
            onChange: e => setForm(f => ({ ...f, subject: e.target.value })),
            className: 'w-full border rounded-lg px-3 py-2 text-sm'
          }, Object.entries(SUBJECT_LABELS).map(([k, v]) => React.createElement('option', { key: k, value: k }, v)))
        ),
        // المهارة
        React.createElement('div', null,
          React.createElement('label', { className: 'block text-sm font-medium text-gray-700 mb-1' }, 'المهارة المستهدفة'),
          React.createElement('input', {
            type: 'text', value: form.skill,
            onChange: e => setForm(f => ({ ...f, skill: e.target.value })),
            placeholder: 'مثال: الجمع والطرح، فهم المقروء...',
            className: 'w-full border rounded-lg px-3 py-2 text-sm'
          })
        ),
        // المستوى
        React.createElement('div', null,
          React.createElement('label', { className: 'block text-sm font-medium text-gray-700 mb-1' }, 'مستوى الصعوبة'),
          React.createElement('select', {
            value: form.difficulty,
            onChange: e => setForm(f => ({ ...f, difficulty: e.target.value })),
            className: 'w-full border rounded-lg px-3 py-2 text-sm'
          },
            React.createElement('option', { value: 'easy' }, '🟢 سهل'),
            React.createElement('option', { value: 'medium' }, '🟡 متوسط'),
            React.createElement('option', { value: 'hard' }, '🔴 صعب')
          )
        )
      ),
      // نص السؤال
      React.createElement('div', { className: 'mb-4' },
        React.createElement('label', { className: 'block text-sm font-medium text-gray-700 mb-1' }, 'نص السؤال *'),
        React.createElement('textarea', {
          value: form.question,
          onChange: e => setForm(f => ({ ...f, question: e.target.value })),
          rows: 3, placeholder: 'اكتب نص السؤال هنا...',
          className: 'w-full border rounded-lg px-3 py-2 text-sm resize-none'
        })
      ),
      // الخيارات
      React.createElement('div', { className: 'mb-4' },
        React.createElement('label', { className: 'block text-sm font-medium text-gray-700 mb-2' },
          'الخيارات * (اضغط على الخيار الصحيح لتحديده)'
        ),
        React.createElement('div', { className: 'space-y-2' },
          form.options.map((opt, i) =>
            React.createElement('div', { key: i, className: 'flex gap-2 items-center' },
              React.createElement('button', {
                onClick: () => setForm(f => ({ ...f, correctIndex: i })),
                className: `w-8 h-8 rounded-full text-xs font-bold shrink-0 transition-all ${form.correctIndex === i ? 'bg-green-500 text-white shadow-md' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}`
              }, ['أ','ب','ج','د'][i]),
              React.createElement('input', {
                type: 'text', value: opt,
                onChange: e => {
                  const newOpts = [...form.options];
                  newOpts[i] = e.target.value;
                  setForm(f => ({ ...f, options: newOpts }));
                },
                placeholder: `الخيار ${['أ','ب','ج','د'][i]}`,
                className: `flex-1 border rounded-lg px-3 py-2 text-sm ${form.correctIndex === i ? 'border-green-400 bg-green-50' : ''}`
              })
            )
          )
        )
      ),
      // الشرح
      React.createElement('div', { className: 'mb-6' },
        React.createElement('label', { className: 'block text-sm font-medium text-gray-700 mb-1' }, 'شرح الإجابة (اختياري)'),
        React.createElement('textarea', {
          value: form.explanation,
          onChange: e => setForm(f => ({ ...f, explanation: e.target.value })),
          rows: 2, placeholder: 'اشرح لماذا هذه الإجابة صحيحة...',
          className: 'w-full border rounded-lg px-3 py-2 text-sm resize-none'
        })
      ),
      // أزرار الحفظ
      React.createElement('div', { className: 'flex gap-3' },
        React.createElement('button', {
          onClick: handleSaveQuestion, disabled: saving,
          className: 'bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-xl font-bold text-sm transition-colors disabled:opacity-50'
        }, saving ? '⏳ جاري الحفظ...' : (editingQ ? '💾 حفظ التعديلات' : '✅ إضافة السؤال')),
        (editingQ || form.question) && React.createElement('button', {
          onClick: () => {
            setEditingQ(null);
            setForm({ gradeKey: 'p3', subject: 'math', skill: '', difficulty: 'medium', question: '', options: ['', '', '', ''], correctIndex: 0, explanation: '' });
          },
          className: 'bg-gray-100 hover:bg-gray-200 text-gray-700 px-6 py-2.5 rounded-xl font-bold text-sm transition-colors'
        }, '🔄 مسح النموذج')
      )
    ),

    // تبويب: استيراد بالجملة من Excel
    tab === 'import' && React.createElement('div', { className: 'bg-white border rounded-xl p-6 shadow-sm space-y-5' },
      // العنوان
      React.createElement('div', { className: 'flex items-center justify-between flex-wrap gap-3' },
        React.createElement('div', null,
          React.createElement('h3', { className: 'font-bold text-gray-800 text-lg' }, '📥 استيراد أسئلة من Excel'),
          React.createElement('p', { className: 'text-gray-500 text-sm mt-1' }, 'حمل النموذج واملأه بالأسئلة، ثم حدد الصف والمادة وارفع الملف')
        ),
        React.createElement('button', {
          onClick: handleDownloadTemplate,
          className: 'flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2.5 rounded-xl font-bold text-sm transition-colors'
        }, '⬇️ تحميل نموذج Excel')
      ),
      // تحديد الصف والمادة
      React.createElement('div', { className: 'grid grid-cols-2 gap-4 bg-blue-50 border border-blue-200 rounded-xl p-4' },
        React.createElement('div', null,
          React.createElement('label', { className: 'block text-sm font-bold text-gray-700 mb-1' }, '🏫 الصف الدراسي'),
          React.createElement('select', {
            value: importGrade,
            onChange: e => { setImportGrade(e.target.value); setImportPreview(prev => prev.map(q => ({ ...q, gradeKey: e.target.value }))); },
            className: 'w-full border rounded-lg px-3 py-2 text-sm'
          }, Object.entries(GRADE_LABELS).map(([k,v]) => React.createElement('option', { key: k, value: k }, v)))
        ),
        React.createElement('div', null,
          React.createElement('label', { className: 'block text-sm font-bold text-gray-700 mb-1' }, '📚 المادة الدراسية'),
          React.createElement('select', {
            value: importSubject,
            onChange: e => { setImportSubject(e.target.value); setImportPreview(prev => prev.map(q => ({ ...q, subject: e.target.value }))); },
            className: 'w-full border rounded-lg px-3 py-2 text-sm'
          }, Object.entries(SUBJECT_LABELS).map(([k,v]) => React.createElement('option', { key: k, value: k }, v)))
        )
      ),
      // رفع الملف
      React.createElement('div', { className: 'border-2 border-dashed border-gray-300 rounded-xl p-6 text-center' },
        React.createElement('input', {
          ref: importFileRef,
          type: 'file',
          accept: '.xlsx,.xls,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-excel',
          className: 'hidden',
          onChange: handleExcelFile
        }),
        React.createElement('div', { className: 'text-4xl mb-3' }, '📂'),
        React.createElement('p', { className: 'text-gray-600 font-bold mb-2' }, importFile ? `✅ تم اختيار: ${importFile.name}` : 'اختر ملف Excel للاستيراد'),
        React.createElement('button', {
          onClick: () => importFileRef.current?.click(),
          className: 'mt-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-xl font-bold text-sm transition-colors'
        }, '📁 اختيار ملف Excel')
      ),
      // معاينة الأسئلة
      importPreview.length > 0 && React.createElement('div', null,
        React.createElement('div', { className: 'flex items-center justify-between mb-3' },
          React.createElement('h4', { className: 'font-bold text-gray-800' }, `👁 معاينة: ${importPreview.length} سؤال`),
          React.createElement('span', { className: 'text-sm text-gray-500' }, `الصف: ${GRADE_LABELS[importGrade]} | المادة: ${SUBJECT_LABELS[importSubject]}`)
        ),
        React.createElement('div', { className: 'max-h-64 overflow-auto border rounded-xl' },
          React.createElement('table', { className: 'w-full text-xs' },
            React.createElement('thead', { className: 'bg-gray-50 sticky top-0' },
              React.createElement('tr', null,
                React.createElement('th', { className: 'px-3 py-2 text-right' }, '#'),
                React.createElement('th', { className: 'px-3 py-2 text-right' }, 'السؤال'),
                React.createElement('th', { className: 'px-3 py-2 text-right' }, 'الخيارات'),
                React.createElement('th', { className: 'px-3 py-2 text-center' }, 'صحيح'),
                React.createElement('th', { className: 'px-3 py-2 text-right' }, 'المهارة')
              )
            ),
            React.createElement('tbody', null,
              importPreview.slice(0, 10).map((q, i) =>
                React.createElement('tr', { key: i, className: 'border-t' },
                  React.createElement('td', { className: 'px-3 py-2 text-gray-400' }, q._row),
                  React.createElement('td', { className: 'px-3 py-2 font-medium text-gray-800 max-w-xs truncate' }, q.question),
                  React.createElement('td', { className: 'px-3 py-2 text-gray-500' }, q.options.filter(Boolean).join(' / ')),
                  React.createElement('td', { className: 'px-3 py-2 text-center font-bold text-blue-600' }, ['A','B','C','D'][q.correct]),
                  React.createElement('td', { className: 'px-3 py-2 text-gray-500' }, q.skill || '—')
                )
              ),
              importPreview.length > 10 && React.createElement('tr', null,
                React.createElement('td', { className: 'px-3 py-2 text-center text-gray-400 text-xs', colSpan: 5 }, `... و${importPreview.length - 10} سؤال آخر`)
              )
            )
          )
        ),
        React.createElement('button', {
          onClick: handleImport, disabled: saving,
          className: 'mt-4 w-full bg-green-600 hover:bg-green-700 text-white py-3 rounded-xl font-bold text-sm transition-colors disabled:opacity-50'
        }, saving ? '⏳ جاري الاستيراد...' : `✅ استيراد ${importPreview.length} سؤال إلى بنك نافس`)
      ),
      // نتيجة الاستيراد
      importResult && React.createElement('div', { className: 'bg-green-50 border border-green-200 rounded-xl p-4' },
        React.createElement('p', { className: 'text-green-700 font-bold' }, `✅ تم استيراد ${importResult.imported} سؤال بنجاح`),
        importResult.errors?.length > 0 && React.createElement('p', { className: 'text-red-600 text-sm mt-1' }, `⚠️ ${importResult.errors.length} سؤال تم تجاهله بسبب أخطاء`)
      )
    )
  );
}

export default NafisBankPage;

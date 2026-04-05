/**
 * ==========================================
 *  PublicGatePage Component
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
import { appendGateSyncLog, buildCsv, buildWsUrl, canAccessPermission, clamp, clearGateSyncLog, cx, downloadFile, enqueueGateOfflineScan, escapePrintHtml, exportRowsToWorkbook, exportToExcel, fileToDataUrl, findBestFaceMatch, formatDateTime, formatLocalGateTimestamp, generateQrDataUrl, getAuthActionMeta, getGateOfflineQueueSummary, getGateSyncLogSummary, getGateSyncStatusMeta, getRoleLabel, getShortStudentName, getStudentCompanyName, getStudentGroupingLabel, getTodayIso, getUnifiedSchoolStudents, normalizeSearchToken, parseTimeToMinutes, pieColors, printHtmlContent, readGateOfflineQueue, readGateSyncLog, removeGateOfflineQueueItem, removeGateSyncLogItem, resultTone, roles, safeNumber, sanitizeBarcodeValue, schoolHasStructureClassrooms, statusFromResult, toArabicDate, writeGateOfflineQueue, apiRequest, buildFaceTemplateFromFile, buildFaceTemplateFromDataUrl} from '../utils/sharedFunctions.jsx';
import { Input } from './ui/FormElements';
import { StatCard } from './ui/StatCard';


import LiveCameraPanel from './LiveCameraPanel';
import { Badge } from './ui/FormElements';
function PublicGatePage({ token }) {
  const [payload, setPayload] = useState(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [manualQuery, setManualQuery] = useState("");
  const [faceFile, setFaceFile] = useState(null);
  const [facePreview, setFacePreview] = useState("");
  const [message, setMessage] = useState("");
  const [lastScanResult, setLastScanResult] = useState(null);
  const [lastScanStudentName, setLastScanStudentName] = useState(''); // { student, message, ok, ts }
  const [isOnline, setIsOnline] = useState(typeof navigator === "undefined" ? true : navigator.onLine);
  const [offlineQueueCount, setOfflineQueueCount] = useState(() => readGateOfflineQueue(token).length);
  const [offlineQueuePreview, setOfflineQueuePreview] = useState(() => getGateOfflineQueueSummary(token));
  const [syncLogSummary, setSyncLogSummary] = useState(() => getGateSyncLogSummary(token));
  const [syncState, setSyncState] = useState({ syncing: false, lastSyncAt: null, lastError: "", lastSyncedOperationAt: null, syncedCount: 0 });
  const [deviceNow, setDeviceNow] = useState(Date.now());
  const [syncLogFilter, setSyncLogFilter] = useState('all');
  const [syncLogQuery, setSyncLogQuery] = useState('');
  const syncLockRef = useRef(false);

  const loadGate = useCallback(async () => {
    try {
      const response = await apiRequest(`/api/public/gate/${token}`);
      setPayload(response);
      setError("");
    } catch (err) {
      setError(err?.message || "تعذر تحميل رابط البوابة.");
    }
  }, [token]);

  useEffect(() => {
    loadGate();
    const socket = new WebSocket(buildWsUrl(`/ws/public?kind=gate&token=${encodeURIComponent(token)}`));
    socket.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data || '{}');
        if (data?.type === 'live_update') {
          setPayload((prev) => prev ? ({ ...prev, gate: data.gate || prev.gate, live: data.live || prev.live }) : prev);
          setError('');
        }
      } catch {}
    };
    socket.onerror = () => { if (!payload) console.warn('WebSocket gate stream unavailable'); };
    // polling كل 15 ثانية لضمان تحديث الإحصائيات حتى لو انقطع WebSocket
    const pollInterval = window.setInterval(async () => {
      try {
        const res = await apiRequest(`/api/public/gate/${token}/live`);
        if (res?.live) setPayload((prev) => prev ? ({ ...prev, live: res.live }) : prev);
      } catch {}
    }, 15000);
    return () => { socket.close(); window.clearInterval(pollInterval); };
  }, [loadGate, token]);

  const refreshOfflineQueueCount = useCallback(() => {
    const summary = getGateOfflineQueueSummary(token);
    setOfflineQueueCount(summary.total);
    setOfflineQueuePreview(summary);
    setSyncLogSummary(getGateSyncLogSummary(token));
  }, [token]);

  const students = payload?.students || [];
  const resolveManualStudent = () => {
    const query = String(manualQuery || '').trim();
    if (!query) return null;
    const normalized = normalizeSearchToken(query);
    const normalizedBarcode = sanitizeBarcodeValue(query);
    const lower = query.toLowerCase();
    return students.find((student) => {
      const values = [student.studentNumber, student.nationalId, student.name, student.fullName, student.barcode, student.id, student.rawId];
      return values.some((value) => {
        const text = String(value || '');
        return text.toLowerCase().includes(lower)
          || normalizeSearchToken(text) === normalized
          || normalizeSearchToken(text).includes(normalized)
          || sanitizeBarcodeValue(text) === normalizedBarcode;
      });
    }) || null;
  };

  const applyScanResponse = useCallback((response, fallbackMessage) => {
    if (response?.live) setPayload((prev) => (prev ? ({ ...prev, live: response.live }) : prev));
    if (response?.student) {
      const studentName = response.student.name || response.student.fullName || '';
      setLastScanResult({ student: response.student, message: response.message || fallbackMessage || 'تمت العملية بنجاح.', ok: true, ts: Date.now() });
      if (studentName) setLastScanStudentName(studentName);
    } else if (fallbackMessage) {
      setLastScanResult({ student: null, message: fallbackMessage, ok: true, ts: Date.now() });
    }
    setManualQuery('');
  }, []);

  const applyScanError = useCallback((err, fallbackMessage) => {
    const errData = err?.data || err?.response;
    if (errData?.live) setPayload((prev) => (prev ? ({ ...prev, live: errData.live }) : prev));
    if (errData?.student) {
      setLastScanResult({ student: errData.student, message: err?.message || errData?.message || fallbackMessage || 'تعذر تسجيل العملية.', ok: false, ts: Date.now() });
    } else {
      setLastScanResult({ student: null, message: err?.message || fallbackMessage || 'تعذر تسجيل العملية.', ok: false, ts: Date.now() });
    }
  }, []);

  const reportSyncEvent = useCallback(async (entry) => {
    try {
      await apiRequest(`/api/public/gate/${token}/sync-event`, { method: 'POST', body: entry });
    } catch {}
  }, [token]);

  const syncOfflineQueue = useCallback(async () => {
    if (syncLockRef.current || !isOnline) return;
    const queue = readGateOfflineQueue(token);
    if (!queue.length) return;
    syncLockRef.current = true;
    setSyncState((prev) => ({ ...prev, syncing: true, lastError: '' }));
    try {
      for (const item of queue) {
        try {
          const response = await apiRequest(`/api/public/gate/${token}/scan`, {
            method: 'POST',
            body: {
              barcode: item.barcode,
              method: item.method,
              capturedAt: item.capturedAt,
              capturedAtLocal: item.capturedAtLocal,
              offlineQueued: true,
              clientOperationId: item.id,
            },
          });
          removeGateOfflineQueueItem(token, item.id);
          appendGateSyncLog(token, { operationId: item.id, status: response?.duplicate ? 'duplicate' : 'synced', studentName: item.studentName || '', barcode: item.barcode || '', method: item.method || 'QR', capturedAt: item.capturedAt, capturedAtLocal: item.capturedAtLocal || '', syncedAt: new Date().toISOString(), message: response?.duplicate ? 'هذه العملية موجودة مسبقًا وتم تجاهل تكرارها.' : 'تمت مزامنة العملية المحلية بنجاح.' });
          reportSyncEvent({ operationId: item.id, status: response?.duplicate ? 'duplicate' : 'synced', studentName: item.studentName || '', barcode: item.barcode || '', method: item.method || 'QR', capturedAt: item.capturedAt, capturedAtLocal: item.capturedAtLocal || '', syncedAt: new Date().toISOString(), message: response?.duplicate ? 'هذه العملية موجودة مسبقًا وتم تجاهل تكرارها.' : 'تمت مزامنة العملية المحلية بنجاح.' });
          refreshOfflineQueueCount();
          applyScanResponse(response, response?.duplicate ? `كانت العملية المحلية مسجلة سابقًا للطالب ${item.studentName || ''}`.trim() : `تمت مزامنة العملية المحلية للطالب ${item.studentName || ''}`.trim());
          setSyncState((prev) => ({ ...prev, lastSyncedOperationAt: item.capturedAt || Date.now(), syncedCount: Number(prev.syncedCount || 0) + 1 }));
        } catch (err) {
          if (err?.data || err?.response) {
            removeGateOfflineQueueItem(token, item.id);
            appendGateSyncLog(token, { operationId: item.id, status: 'rejected', studentName: item.studentName || '', barcode: item.barcode || '', method: item.method || 'QR', capturedAt: item.capturedAt, capturedAtLocal: item.capturedAtLocal || '', syncedAt: new Date().toISOString(), message: err?.message || 'تم رفض العملية من الخادم وحذفها من الصف المحلي.' });
            reportSyncEvent({ operationId: item.id, status: 'rejected', studentName: item.studentName || '', barcode: item.barcode || '', method: item.method || 'QR', capturedAt: item.capturedAt, capturedAtLocal: item.capturedAtLocal || '', syncedAt: new Date().toISOString(), message: err?.message || 'تم رفض العملية من الخادم وحذفها من الصف المحلي.' });
            refreshOfflineQueueCount();
            applyScanError(err, 'تم حذف عملية من الصف لأنها مرفوضة من الخادم.');
            continue;
          }
          throw err;
        }
      }
      setSyncState((prev) => ({ ...prev, syncing: false, lastSyncAt: Date.now(), lastError: '' }));
    } catch (err) {
      appendGateSyncLog(token, { status: 'error', message: err?.message || 'تعذرت مزامنة الصف المحلي بالكامل.' });
      reportSyncEvent({ status: 'error', message: err?.message || 'تعذرت مزامنة الصف المحلي بالكامل.' });
      setSyncState((prev) => ({ ...prev, syncing: false, lastSyncAt: null, lastError: err?.message || 'تعذرت مزامنة الصف المحلي.' }));
    } finally {
      syncLockRef.current = false;
      refreshOfflineQueueCount();
    }
  }, [applyScanError, applyScanResponse, isOnline, refreshOfflineQueueCount, reportSyncEvent, token]);

  const clearOfflineQueue = () => {
    const queue = readGateOfflineQueue(token);
    if (!queue.length) return;
    queue.forEach((item) => {
      appendGateSyncLog(token, {
        operationId: item.id,
        status: 'cleared',
        studentName: item.studentName || '',
        barcode: item.barcode || '',
        method: item.method || 'QR',
        capturedAt: item.capturedAt || '',
        capturedAtLocal: item.capturedAtLocal || '',
        message: 'تم حذف العملية من الصف المحلي يدويًا بواسطة المستخدم.',
      });
      reportSyncEvent({ operationId: item.id, status: 'cleared', studentName: item.studentName || '', barcode: item.barcode || '', method: item.method || 'QR', capturedAt: item.capturedAt || '', capturedAtLocal: item.capturedAtLocal || '', message: 'تم حذف العملية من الصف المحلي يدويًا بواسطة المستخدم.' });
    });
    writeGateOfflineQueue(token, []);
    refreshOfflineQueueCount();
    setMessage('تم تفريغ الصف المحلي يدويًا، وسُجلت العمليات في سجل المزامنة.');
  };

  const submitScan = async (barcode, method) => {
    if (!barcode) return;
    const queuedStudent = students.find((student) => sanitizeBarcodeValue(student.barcode) === sanitizeBarcodeValue(barcode) || String(student.barcode || '') === String(barcode));
    const capturedNow = Date.now();
    const operation = {
      id: `offline-${capturedNow}-${Math.random().toString(36).slice(2, 8)}`,
      barcode,
      method,
      studentId: queuedStudent?.id || null,
      studentName: queuedStudent?.name || queuedStudent?.fullName || '',
      createdAt: new Date(capturedNow).toISOString(),
      capturedAt: new Date(capturedNow).toISOString(),
      capturedAtLocal: formatLocalGateTimestamp(capturedNow),
    };
    if (!isOnline) {
      enqueueGateOfflineScan(token, operation);
      appendGateSyncLog(token, { operationId: operation.id, status: 'pending', studentName: operation.studentName || '', barcode: operation.barcode || '', method: operation.method || 'QR', capturedAt: operation.capturedAt, capturedAtLocal: operation.capturedAtLocal, message: 'حُفظت العملية محليًا بانتظار عودة الاتصال.' });
      reportSyncEvent({ operationId: operation.id, status: 'pending', studentName: operation.studentName || '', barcode: operation.barcode || '', method: operation.method || 'QR', capturedAt: operation.capturedAt, capturedAtLocal: operation.capturedAtLocal, message: 'حُفظت العملية محليًا بانتظار عودة الاتصال.' });
      refreshOfflineQueueCount();
      setLastScanResult({ student: queuedStudent || null, message: `تم حفظ العملية محليًا في الصف المؤقت عند ${operation.capturedAtLocal} وستتم مزامنتها تلقائيًا.`, ok: true, ts: Date.now() });
      setMessage('الجهاز غير متصل حاليًا. تم حفظ المسح محليًا بنجاح.');
      return;
    }
    setBusy(true);
    setLastScanStudentName('');
    try {
      const response = await apiRequest(`/api/public/gate/${token}/scan`, { method: 'POST', body: { barcode, method, capturedAt: operation.capturedAt, capturedAtLocal: operation.capturedAtLocal, clientOperationId: operation.id } });
      applyScanResponse(response);
      setMessage('');
    } catch (err) {
      if (!err?.data && !err?.response) {
        enqueueGateOfflineScan(token, operation);
        appendGateSyncLog(token, { operationId: operation.id, status: 'pending', studentName: operation.studentName || '', barcode: operation.barcode || '', method: operation.method || 'QR', capturedAt: operation.capturedAt, capturedAtLocal: operation.capturedAtLocal, message: 'انقطع الاتصال أثناء الإرسال، فحُولت العملية تلقائيًا إلى الصف المحلي.' });
        reportSyncEvent({ operationId: operation.id, status: 'pending', studentName: operation.studentName || '', barcode: operation.barcode || '', method: operation.method || 'QR', capturedAt: operation.capturedAt, capturedAtLocal: operation.capturedAtLocal, message: 'انقطع الاتصال أثناء الإرسال، فحُولت العملية تلقائيًا إلى الصف المحلي.' });
        refreshOfflineQueueCount();
        setLastScanResult({ student: queuedStudent || null, message: `انقطع الاتصال أثناء الإرسال. حُفظت العملية محليًا عند ${operation.capturedAtLocal} وستتم مزامنتها تلقائيًا.`, ok: true, ts: Date.now() });
        setMessage('تم تحويل العملية تلقائيًا إلى الصف المحلي بانتظار المزامنة.');
      } else {
        applyScanError(err);
      }
    } finally {
      setBusy(false);
    }
  };

  const resolveFaceDataUrl = async (dataUrl) => {
    const template = await buildFaceTemplateFromDataUrl(dataUrl);
    if (template.faceDetected === false) {
      setMessage('لم يتم التعرف على وجه واضح في الصورة.');
      return null;
    }
    const match = findBestFaceMatch(template.signature, students, 22);
    if (!match.student) {
      setMessage('لم يتم العثور على تطابق كافٍ للوجه.');
      return null;
    }
    // تعيين lastScanResult مسبقاً من match.student لضمان صحة الاسم قبل رد السيرفر
    setLastScanResult({ student: { name: match.student.name || match.student.fullName }, message: 'جارٍ تسجيل الحضور...', ok: true, ts: Date.now() });
    await submitScan(match.student.barcode, 'بصمة وجه');
    return match.student;
  };

  const handleFaceFile = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setFaceFile(file);
    setFacePreview(await fileToDataUrl(file));
    event.target.value = '';
  };


  const verifyFaceFile = async () => {
    if (!faceFile) return;
    const template = await buildFaceTemplateFromFile(faceFile);
    if (template.faceDetected === false) return setMessage('لم يتم التعرف على وجه واضح في الصورة.');
    const match = findBestFaceMatch(template.signature, students, 22);
    if (!match.student) return setMessage('لم يتم العثور على تطابق كافٍ للوجه.');
    await submitScan(match.student.barcode, 'بصمة وجه');
    setFaceFile(null);
    setFacePreview('');
  };

  useEffect(() => {
    refreshOfflineQueueCount();
    const onOnline = () => setIsOnline(true);
    const onOffline = () => setIsOnline(false);
    window.addEventListener('online', onOnline);
    window.addEventListener('offline', onOffline);
    return () => {
      window.removeEventListener('online', onOnline);
      window.removeEventListener('offline', onOffline);
    };
  }, [refreshOfflineQueueCount]);

  useEffect(() => {
    const timer = window.setInterval(() => setDeviceNow(Date.now()), 1000);
    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    if (!isOnline) return;
    syncOfflineQueue();
    const timer = window.setInterval(() => { syncOfflineQueue(); }, 12000);
    return () => window.clearInterval(timer);
  }, [isOnline, syncOfflineQueue]);

  if (error) return <div dir="rtl" className="flex min-h-screen items-center justify-center bg-slate-100 p-6"><div className="rounded-3xl bg-white p-8 ring-1 ring-slate-200">{error}</div></div>;
  if (!payload) return <div dir="rtl" className="flex min-h-screen items-center justify-center bg-slate-100 p-6"><div className="rounded-3xl bg-white p-8 ring-1 ring-slate-200">جارِ تحميل البوابة...</div></div>;

  const live = payload.live || {};
  // الإحصائيات تأتي من live.summary (من summarizeSchoolLivePayload التي تُرجع { school, summary, ... })
  const summaryView = live.summary || {};
  // إحصائيات البوابة الحالية
  const currentGateId = payload.gate?.id;
  const currentGateStats = currentGateId && live.gateStats ? (live.gateStats[currentGateId] || null) : null;
  const allGateStats = live.gateStats ? Object.values(live.gateStats) : [];
  const mode = payload.gate?.mode || 'mixed';
  const manualStudent = resolveManualStudent();
  const rawSyncLogItems = readGateSyncLog(token);
  const normalizedSyncLogQuery = normalizeSearchToken(syncLogQuery || '');
  const filteredSyncLogItems = rawSyncLogItems.filter((item) => {
    const status = String(item?.status || '').toLowerCase();
    if (syncLogFilter !== 'all' && status !== syncLogFilter) return false;
    if (!normalizedSyncLogQuery) return true;
    const haystack = [
      item.studentName,
      item.barcode,
      item.method,
      item.message,
      item.status,
      item.capturedAtLocal,
      item.operationId,
    ].map((value) => normalizeSearchToken(value || '')).join(' ');
    return haystack.includes(normalizedSyncLogQuery);
  });
  const syncLogExportColumns = [
    { key: 'statusLabel', label: 'الحالة' },
    { key: 'studentName', label: 'الطالب' },
    { key: 'barcode', label: 'الباركود / المعرف' },
    { key: 'method', label: 'طريقة الالتقاط' },
    { key: 'capturedAtLocal', label: 'وقت الالتقاط المحلي' },
    { key: 'processedAt', label: 'وقت المعالجة / المزامنة' },
    { key: 'operationId', label: 'معرف العملية' },
    { key: 'message', label: 'الرسالة التشغيلية' },
  ];
  const syncLogExportRows = filteredSyncLogItems.map((item) => ({
    statusLabel: getGateSyncStatusMeta(item.status).label,
    studentName: item.studentName || '',
    barcode: item.barcode || '',
    method: item.method || 'QR',
    capturedAtLocal: item.capturedAtLocal || formatLocalGateTimestamp(item.capturedAt || item.createdAt),
    processedAt: item.syncedAt ? formatLocalGateTimestamp(item.syncedAt) : formatLocalGateTimestamp(item.createdAt),
    operationId: item.operationId || item.id || '',
    message: item.message || '',
  }));
  const handleExportSyncLogCsv = () => {
    const stamp = new Date().toISOString().slice(0, 19).replace(/[:T]/g, '-');
    downloadFile(`gate-sync-log-${token || 'gate'}-${stamp}.csv`, buildCsv(syncLogExportRows, syncLogExportColumns), 'text/csv;charset=utf-8;');
  };
  const handleExportSyncLogExcel = () => {
    const stamp = new Date().toISOString().slice(0, 19).replace(/[:T]/g, '-');
    exportRowsToWorkbook(`gate-sync-log-${token || 'gate'}-${stamp}.xlsx`, 'Gate Sync Log', syncLogExportRows, syncLogExportColumns);
  };
  const handlePrintSyncLogReport = () => {
    const statusFilterLabel = syncLogFilter === 'all' ? 'كل الحالات' : (getGateSyncStatusMeta(syncLogFilter).label || syncLogFilter);
    const filterSummary = [
      payload.school?.name || 'المدرسة',
      payload.gate?.name || 'البوابة',
      `الحالة: ${statusFilterLabel}`,
      syncLogQuery ? `البحث: ${syncLogQuery}` : 'بدون بحث نصي',
      `وقت الطباعة: ${formatLocalGateTimestamp(new Date().toISOString())}`,
    ].join(' • ');
    const rowsHtml = syncLogExportRows.map((row, index) => {
      const meta = getGateSyncStatusMeta(filteredSyncLogItems[index]?.status);
      const rowClass = meta.tone === 'green' ? 'row-positive' : meta.tone === 'rose' ? 'row-negative' : meta.tone === 'blue' ? 'row-info' : meta.tone === 'slate' ? 'row-highlight' : 'row-warning';
      const pillClass = meta.tone === 'green' ? 'pill-green' : meta.tone === 'rose' ? 'pill-rose' : meta.tone === 'blue' ? 'pill-blue' : meta.tone === 'slate' ? 'pill-slate' : 'pill-amber';
      return `<tr class="${rowClass}"><td>${index + 1}</td><td><span class="pill ${pillClass}">${escapePrintHtml(row.statusLabel)}</span></td><td>${escapePrintHtml(row.studentName || '—')}</td><td>${escapePrintHtml(row.barcode || '—')}</td><td>${escapePrintHtml(row.method || '—')}</td><td>${escapePrintHtml(row.capturedAtLocal || '—')}</td><td>${escapePrintHtml(row.processedAt || '—')}</td><td>${escapePrintHtml(row.operationId || '—')}</td><td>${escapePrintHtml(row.message || '—')}</td></tr>`;
    }).join('');
    const bodyHtml = `
      <h2>تقرير سجل مزامنة البوابة</h2>
      <table>
        <thead>
          <tr>
            <th>#</th>
            <th>الحالة</th>
            <th>الطالب</th>
            <th>الباركود / المعرف</th>
            <th>طريقة الالتقاط</th>
            <th>وقت الالتقاط المحلي</th>
            <th>وقت المعالجة / المزامنة</th>
            <th>معرف العملية</th>
            <th>الرسالة التشغيلية</th>
          </tr>
        </thead>
        <tbody>${rowsHtml || `<tr><td colspan="9">لا توجد سجلات مطابقة للفلترة الحالية.</td></tr>`}</tbody>
      </table>`;
    printHtmlContent(`سجل مزامنة البوابة — ${payload.gate?.name || 'البوابة'}`, bodyHtml, {
      subtitle: filterSummary,
      accent: '#0f766e',
      summaryCards: [
        { label: 'إجمالي النتائج', value: filteredSyncLogItems.length, tone: 'tone-blue' },
        { label: 'تمت', value: filteredSyncLogItems.filter((item) => String(item?.status || '').toLowerCase() === 'synced').length, tone: 'tone-green' },
        { label: 'بانتظار / مكرر', value: `${filteredSyncLogItems.filter((item) => String(item?.status || '').toLowerCase() === 'pending').length} / ${filteredSyncLogItems.filter((item) => String(item?.status || '').toLowerCase() === 'duplicate').length}`, tone: 'tone-amber' },
        { label: 'مرفوض / خطأ / تفريغ', value: `${filteredSyncLogItems.filter((item) => ['rejected','error'].includes(String(item?.status || '').toLowerCase())).length} / ${filteredSyncLogItems.filter((item) => String(item?.status || '').toLowerCase() === 'cleared').length}`, tone: 'tone-rose' },
      ],
      legend: [
        { label: 'تمت', tone: 'pill-green' },
        { label: 'مكرر', tone: 'pill-blue' },
        { label: 'بانتظار', tone: 'pill-amber' },
        { label: 'مرفوض / خطأ', tone: 'pill-rose' },
        { label: 'تم تفريغه', tone: 'pill-slate' },
      ],
    });
  };

  return (
    <div dir="rtl" className="min-h-screen bg-slate-950 p-4 text-white md:p-6">
      <div className="mx-auto max-w-7xl space-y-6">
        <div className="rounded-[2rem] bg-gradient-to-l from-sky-800 to-emerald-600 p-6 shadow-xl">
          <div className="text-sm text-white/80">رابط بوابة مباشر</div>
          <div className="mt-2 text-3xl font-black">{payload.school?.name}</div>
          <div className="mt-2 text-white/85">{payload.gate?.name} • يعمل مباشرة على الآيباد أو الجوال أو اللابتوب</div>
        </div>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
          <StatCard title="الحاضرون اليوم" value={summaryView?.presentToday || 0} subtitle={`من ${summaryView?.totalStudents || 0} طالب`} icon={Users} />
          <StatCard title="نسبة الحضور" value={`${summaryView?.attendanceRate || 0}%`} subtitle="تتحدث تلقائيًا" icon={BarChart3} />
          <StatCard title="الحضور المبكر" value={summaryView?.earlyToday || 0} subtitle="حتى الآن" icon={BadgeCheck} />
          <StatCard title="الخصومات اليوم" value={summaryView?.violationsToday || 0} subtitle="من سجل الإجراءات" icon={ClipboardCheck} />
        </div>
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-4">
          <div className={`rounded-[1.8rem] border p-5 ${isOnline ? 'border-emerald-400/30 bg-emerald-500/10' : 'border-amber-400/30 bg-amber-500/10'}`}>
            <div className="flex items-center gap-3">
              <div className={`flex h-12 w-12 items-center justify-center rounded-2xl ${isOnline ? 'bg-emerald-500 text-white' : 'bg-amber-500 text-white'}`}>{isOnline ? <Wifi className="h-6 w-6" /> : <WifiOff className="h-6 w-6" />}</div>
              <div>
                <div className="text-sm text-white/70">حالة الاتصال</div>
                <div className="text-xl font-black">{isOnline ? 'متصل ويزامن مباشرة' : 'غير متصل — العمل محليًا'}</div>
              </div>
            </div>
          </div>
          <div className="rounded-[1.8rem] border border-sky-400/30 bg-sky-500/10 p-5">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-sky-500 text-white"><Database className="h-6 w-6" /></div>
              <div>
                <div className="text-sm text-white/70">الصف المؤقت</div>
                <div className="text-xl font-black">{offlineQueueCount} عملية</div>
              </div>
            </div>
          </div>
          <div className="rounded-[1.8rem] border border-violet-400/30 bg-violet-500/10 p-5">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-violet-500 text-white"><Clock3 className="h-6 w-6" /></div>
              <div>
                <div className="text-sm text-white/70">وقت الجهاز المعتمد</div>
                <div className="text-xl font-black">{formatLocalGateTimestamp(deviceNow)}</div>
              </div>
            </div>
          </div>
          <div className="rounded-[1.8rem] border border-white/10 bg-white/5 p-5">
            <div className="flex items-center justify-between gap-3">
              <div>
                <div className="text-sm text-white/70">المزامنة</div>
                <div className="text-xl font-black">{syncState.syncing ? 'جارٍ المزامنة...' : offlineQueueCount ? 'بانتظار المزامنة' : 'متزامن'}</div>
                <div className="mt-1 text-xs text-white/60">{syncState.lastSyncAt ? `آخر مزامنة: ${formatLocalGateTimestamp(syncState.lastSyncAt)}` : (syncState.lastError || 'لا توجد عمليات معلقة')}</div>
                <div className="mt-2 text-xs text-white/60">{syncState.lastSyncedOperationAt ? `آخر عملية تم قبولها: ${formatLocalGateTimestamp(syncState.lastSyncedOperationAt)}` : (offlineQueuePreview.earliestAt ? `أقدم عملية في الصف: ${formatLocalGateTimestamp(offlineQueuePreview.earliestAt)}` : 'لا توجد عمليات بانتظار المزامنة')}</div>
              </div>
              <button onClick={syncOfflineQueue} disabled={!isOnline || syncState.syncing || !offlineQueueCount} className={cx('inline-flex items-center gap-2 rounded-2xl px-4 py-3 text-sm font-bold', (!isOnline || syncState.syncing || !offlineQueueCount) ? 'bg-slate-700 text-slate-300' : 'bg-white text-slate-900')}>
                <RefreshCw className={cx('h-4 w-4', syncState.syncing && 'animate-spin')} /> مزامنة الآن
              </button>
            </div>
          </div>
        </div>
        <div className="grid grid-cols-1 gap-4 xl:grid-cols-[1.1fr_0.7fr_1.2fr]">
          <div className="rounded-[2rem] border border-white/10 bg-white/5 p-5">
            <div className="flex items-center justify-between gap-3">
              <div>
                <div className="text-lg font-black">تفاصيل الصف المؤقت</div>
                <div className="mt-1 text-sm text-white/60">آخر العمليات المحفوظة محليًا مع وقت الالتقاط من الجهاز نفسه.</div>
              </div>
              <Badge tone={offlineQueueCount ? 'amber' : 'green'}>{offlineQueueCount ? `${offlineQueueCount} بانتظار المزامنة` : 'لا توجد عمليات معلقة'}</Badge>
            </div>
            <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-3">
              <div className="rounded-2xl bg-slate-900/60 p-4 ring-1 ring-white/10"><div className="text-xs text-white/60">أقدم عملية</div><div className="mt-2 text-sm font-black">{formatLocalGateTimestamp(offlineQueuePreview.earliestAt)}</div></div>
              <div className="rounded-2xl bg-slate-900/60 p-4 ring-1 ring-white/10"><div className="text-xs text-white/60">أحدث عملية</div><div className="mt-2 text-sm font-black">{formatLocalGateTimestamp(offlineQueuePreview.latestAt)}</div></div>
              <div className="rounded-2xl bg-slate-900/60 p-4 ring-1 ring-white/10"><div className="text-xs text-white/60">عمليات مزامنة ناجحة</div><div className="mt-2 text-2xl font-black">{syncState.syncedCount || 0}</div></div>
            </div>
            <div className="mt-4 space-y-3">
              {offlineQueuePreview.items.length ? offlineQueuePreview.items.map((item) => (
                <div key={item.id} className="flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-slate-900/60 px-4 py-3 ring-1 ring-white/10">
                  <div>
                    <div className="font-bold text-white">{item.studentName || item.barcode || 'عملية محفوظة'}</div>
                    <div className="mt-1 text-xs text-white/60">{item.method || 'QR'} • {item.capturedAtLocal || formatLocalGateTimestamp(item.capturedAt)}</div>
                  </div>
                  <Badge tone="amber">محلي</Badge>
                </div>
              )) : <div className="rounded-2xl border border-dashed border-white/10 px-4 py-6 text-center text-sm text-white/60">لا توجد عمليات محفوظة حاليًا في جهاز البوابة.</div>}
            </div>
          </div>
          <div className="rounded-[2rem] border border-white/10 bg-white/5 p-5">
            <div className="flex items-center justify-between gap-3">
              <div className="text-lg font-black">حالة المزامنة التشغيلية</div>
              <button onClick={() => { if (window.confirm('سيتم حذف جميع العمليات المعلقة من الصف المحلي وتسجيل ذلك في السجل. هل تريد المتابعة؟')) clearOfflineQueue(); }} disabled={!offlineQueueCount} className={cx('rounded-2xl px-4 py-2 text-sm font-bold', !offlineQueueCount ? 'bg-slate-700 text-slate-300' : 'bg-rose-600 text-white')}><Trash2 className="ml-1 inline h-4 w-4" /> تفريغ الصف المحلي</button>
            </div>
            <div className="mt-4 space-y-3 text-sm">
              <div className="flex items-center justify-between rounded-2xl bg-slate-900/60 px-4 py-3 ring-1 ring-white/10"><span className="text-white/65">وضع الجهاز</span><span className="font-black">{isOnline ? 'متصل' : 'دون اتصال'}</span></div>
              <div className="flex items-center justify-between rounded-2xl bg-slate-900/60 px-4 py-3 ring-1 ring-white/10"><span className="text-white/65">وضع العمل</span><span className="font-black">{isOnline ? 'إرسال مباشر + مزامنة تلقائية' : 'حفظ محلي فقط'}</span></div>
              <div className="flex items-center justify-between rounded-2xl bg-slate-900/60 px-4 py-3 ring-1 ring-white/10"><span className="text-white/65">اعتماد الوقت</span><span className="font-black">وقت الجهاز المحلي</span></div>
              <div className="flex items-center justify-between rounded-2xl bg-slate-900/60 px-4 py-3 ring-1 ring-white/10"><span className="text-white/65">منع التكرار</span><span className="font-black">مفعل أثناء المزامنة</span></div>
              <div className="flex items-center justify-between rounded-2xl bg-slate-900/60 px-4 py-3 ring-1 ring-white/10"><span className="text-white/65">آخر خطأ</span><span className="font-black text-left">{syncState.lastError || 'لا يوجد'}</span></div>
            </div>
          </div>
          <div className="rounded-[2rem] border border-white/10 bg-white/5 p-5">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <div className="text-lg font-black">سجل مزامنة البوابة</div>
                <div className="mt-1 text-sm text-white/60">يعرض الحالات التشغيلية كاملة، مع فلترة وبحث وتصدير CSV / Excel للمراجعة الفنية والإدارية.</div>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <Badge tone="green">تمت {syncLogSummary.synced}</Badge>
                <Badge tone="blue">مكرر {syncLogSummary.duplicate}</Badge>
                <Badge tone="amber">بانتظار {syncLogSummary.pending}</Badge>
                <Badge tone="rose">مرفوض {syncLogSummary.rejected + syncLogSummary.error}</Badge>
              </div>
            </div>
            <div className="mt-4 grid grid-cols-2 gap-3">
              <div className="rounded-2xl bg-slate-900/60 p-4 ring-1 ring-white/10"><div className="text-xs text-white/60">إجمالي السجل</div><div className="mt-2 text-2xl font-black">{syncLogSummary.total}</div></div>
              <div className="rounded-2xl bg-slate-900/60 p-4 ring-1 ring-white/10"><div className="text-xs text-white/60">تم تفريغه يدويًا</div><div className="mt-2 text-2xl font-black">{syncLogSummary.cleared}</div></div>
            </div>
            <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-[0.8fr_1.2fr]">
              <select value={syncLogFilter} onChange={(e) => setSyncLogFilter(e.target.value)} className="rounded-2xl border border-white/10 bg-slate-900/60 px-4 py-3 text-sm font-bold text-white outline-none ring-1 ring-white/10">
                <option value="all">كل الحالات</option>
                <option value="pending">بانتظار</option>
                <option value="synced">تمت</option>
                <option value="duplicate">مكرر</option>
                <option value="rejected">مرفوض</option>
                <option value="cleared">تم تفريغه</option>
                <option value="error">خطأ</option>
              </select>
              <input value={syncLogQuery} onChange={(e) => setSyncLogQuery(e.target.value)} placeholder="ابحث باسم الطالب أو الباركود أو الرسالة" className="rounded-2xl border border-white/10 bg-slate-900/60 px-4 py-3 text-sm font-bold text-white placeholder:text-white/35 outline-none ring-1 ring-white/10" />
            </div>
            <div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-white/60">
              <span>المعروض الآن: {filteredSyncLogItems.length} سجل</span>
              <span>•</span>
              <span>التصدير يحترم نفس الفلترة والبحث الحالية</span>
            </div>
            <div className="mt-4 space-y-3">
              {filteredSyncLogItems.length ? filteredSyncLogItems.slice(0, 25).map((item) => { const meta = getGateSyncStatusMeta(item.status); return (
                <div key={item.id} className="rounded-2xl bg-slate-900/60 px-4 py-3 ring-1 ring-white/10">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <div className="font-bold text-white">{item.studentName || item.barcode || 'عملية مزامنة'}</div>
                      <div className="mt-1 text-xs text-white/60">{item.method || 'QR'} • {item.capturedAtLocal || formatLocalGateTimestamp(item.capturedAt || item.createdAt)}</div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge tone={meta.tone}>{meta.label}</Badge>
                      <button onClick={() => { removeGateSyncLogItem(token, item.id); refreshOfflineQueueCount(); }} className="rounded-xl bg-white/5 px-3 py-2 text-xs font-bold text-white ring-1 ring-white/10">حذف</button>
                    </div>
                  </div>
                  <div className="mt-2 text-xs text-white/70">{item.message || '—'}</div>
                  <div className="mt-1 text-[11px] text-white/45">{item.syncedAt ? `تمت المعالجة: ${formatLocalGateTimestamp(item.syncedAt)}` : `سُجلت في: ${formatLocalGateTimestamp(item.createdAt)}`}</div>
                </div>
              ); }) : <div className="rounded-2xl border border-dashed border-white/10 px-4 py-6 text-center text-sm text-white/60">لا توجد سجلات مطابقة للفلترة الحالية على هذا الجهاز.</div>}
              {filteredSyncLogItems.length > 25 ? <div className="rounded-2xl bg-white/5 px-4 py-3 text-center text-xs text-white/60 ring-1 ring-white/10">تم عرض أول 25 سجل فقط داخل الشاشة للحفاظ على سرعة الجهاز، بينما ملف التصدير يشمل جميع النتائج المفلترة ({filteredSyncLogItems.length}).</div> : null}
            </div>
            <div className="mt-4 flex flex-wrap items-center gap-3">
              <button onClick={handlePrintSyncLogReport} disabled={!filteredSyncLogItems.length} className={cx('rounded-2xl px-4 py-2 text-sm font-bold', !filteredSyncLogItems.length ? 'bg-slate-700 text-slate-300' : 'bg-white text-slate-900')}><Printer className="ml-1 inline h-4 w-4" /> طباعة / PDF</button>
              <button onClick={handleExportSyncLogCsv} disabled={!filteredSyncLogItems.length} className={cx('rounded-2xl px-4 py-2 text-sm font-bold', !filteredSyncLogItems.length ? 'bg-slate-700 text-slate-300' : 'bg-emerald-600 text-white')}>تصدير CSV</button>
              <button onClick={handleExportSyncLogExcel} disabled={!filteredSyncLogItems.length} className={cx('rounded-2xl px-4 py-2 text-sm font-bold', !filteredSyncLogItems.length ? 'bg-slate-700 text-slate-300' : 'bg-sky-600 text-white')}>تصدير Excel</button>
              <button onClick={() => { if (window.confirm('سيتم حذف سجل المزامنة المحلي من هذا الجهاز فقط.')) { clearGateSyncLog(token); refreshOfflineQueueCount(); } }} disabled={!syncLogSummary.total} className={cx('rounded-2xl px-4 py-2 text-sm font-bold', !syncLogSummary.total ? 'bg-slate-700 text-slate-300' : 'bg-white text-slate-900')}>مسح سجل المزامنة</button>
            </div>
          </div>
        </div>
        {/* إحصائيات البوابة الحالية */}
        {currentGateStats ? (
          <div className="rounded-[2rem] bg-white/10 border border-white/10 p-5 backdrop-blur">
            <div className="text-sm font-bold text-white/70 mb-3">إحصائيات هذه البوابة ({currentGateStats.name})</div>
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-2xl bg-emerald-500/20 border border-emerald-400/30 p-4 text-center">
                <div className="text-3xl font-black text-emerald-300">{currentGateStats.presentToday}</div>
                <div className="text-xs text-white/70 mt-1">دخلوا من هذه البوابة</div>
              </div>
              <div className="rounded-2xl bg-sky-500/20 border border-sky-400/30 p-4 text-center">
                <div className="text-3xl font-black text-sky-300">{currentGateStats.scansCount}</div>
                <div className="text-xs text-white/70 mt-1">إجمالي المسوحات</div>
              </div>
            </div>
          </div>
        ) : null}
        {/* إحصائيات جميع البوابات - تُظهر فقط إذا كان هناك أكثر من بوابة */}
        {allGateStats.length > 1 ? (
          <div className="rounded-[2rem] bg-white/5 border border-white/10 p-5 backdrop-blur">
            <div className="text-sm font-bold text-white/70 mb-3">مقارنة البوابات اليوم</div>
            <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
              {allGateStats.map((gs) => (
                <div key={gs.id} className={`rounded-2xl p-4 text-center border ${gs.id === currentGateId ? 'bg-emerald-500/20 border-emerald-400/40' : 'bg-white/5 border-white/10'}`}>
                  <div className="text-xs text-white/60 truncate mb-1">{gs.name}</div>
                  <div className={`text-2xl font-black ${gs.id === currentGateId ? 'text-emerald-300' : 'text-white'}`}>{gs.presentToday}</div>
                  <div className="text-xs text-white/50">طالب</div>
                </div>
              ))}
            </div>
          </div>
        ) : null}
        <div className="rounded-[2rem] border border-white/10 bg-white/5 p-4 shadow-2xl backdrop-blur md:p-6">
          <LiveCameraPanel mode={mode === 'qr' ? 'barcode' : mode === 'face' ? 'face' : 'mixed'} variant="gate" autoStart autoRestart hideDeviceSelect videoHeightClass="h-[48vh] md:h-[58vh]" title={`مرحبًا بكم في ${payload.school?.name || 'المدرسة'}`} description={`${payload.gate?.name || 'البوابة'} • وجّه QR أو الوجه أمام الكاميرا وسيتم التعرف تلقائياً بدون تدخل يدوي.`} onDetectBarcode={(value) => submitScan(value, 'QR')} onDetectFace={resolveFaceDataUrl} onCapture={resolveFaceDataUrl} onResolveBarcodeLabel={(barcode) => { const sanitized = sanitizeBarcodeValue(barcode); const s = students.find((st) => sanitizeBarcodeValue(st.barcode || '') === sanitized || sanitizeBarcodeValue(st.studentNumber || '') === sanitized || sanitizeBarcodeValue(st.nationalId || '') === sanitized); return s ? (s.name || s.fullName || null) : null; }} externalMessage={lastScanStudentName ? `مرحباً ${lastScanStudentName}` : ''} />
        </div>
        <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
          <div className="rounded-3xl bg-white p-5 text-slate-900 ring-1 ring-slate-200">
            <div className="font-black">إدخال يدوي</div>
            <Input label="رقم الطالب أو الهوية أو الاسم أو الباركود" value={manualQuery} onChange={(e) => setManualQuery(e.target.value)} placeholder="مثال: ST-0001-ABH أو 1100000011" list="public-gate-manual-students" />
            <datalist id="public-gate-manual-students">{students.slice(0, 30).map((student) => <option key={student.id || student.barcode} value={student.studentNumber || student.barcode}>{student.name} — {student.nationalId || student.barcode}</option>)}</datalist>
            <div className="mt-3 flex flex-wrap gap-3">
              <button onClick={() => manualStudent ? submitScan(manualStudent.barcode, 'إدخال يدوي') : setMessage('لم يتم العثور على الطالب.')} disabled={busy} className="rounded-2xl bg-sky-700 px-4 py-3 text-sm font-bold text-white">تسجيل حضور يدوي</button>
              {manualStudent ? <Badge tone="green">{manualStudent.name}</Badge> : null}
            </div>
          </div>
          <div className="rounded-3xl bg-white p-5 text-slate-900 ring-1 ring-slate-200">
            <div className="font-black">رفع صورة الوجه</div>
            <div className="mt-3 flex flex-wrap gap-3">
              <label className="inline-flex cursor-pointer items-center gap-2 rounded-2xl bg-sky-700 px-4 py-3 text-sm font-bold text-white"><Upload className="h-4 w-4" /> رفع صورة<input type="file" accept="image/*" capture="user" className="hidden" onChange={handleFaceFile} /></label>
              <button onClick={verifyFaceFile} disabled={!faceFile || busy} className={cx('rounded-2xl px-4 py-3 text-sm font-bold', !faceFile || busy ? 'bg-slate-200 text-slate-500' : 'bg-emerald-600 text-white')}>تحقق وتسجيل</button>
            </div>
            {facePreview ? <img src={facePreview} alt="face" className="mt-4 h-56 w-full rounded-2xl object-cover ring-1 ring-slate-200" /> : null}
          </div>
        </div>
        {/* بطاقة آخر مسح - تُظهر اسم الطالب وحالة التسجيل */}
        {lastScanResult ? (
          <div className={`rounded-3xl px-5 py-4 ring-1 flex items-center gap-4 transition-all duration-300 ${lastScanResult.ok ? 'bg-emerald-50 ring-emerald-200 text-emerald-900' : 'bg-amber-50 ring-amber-200 text-amber-900'}`}>
            <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl text-2xl ${lastScanResult.ok ? 'bg-emerald-500 text-white' : 'bg-amber-400 text-white'}`}>
              {lastScanResult.ok ? '✓' : '⚠'}
            </div>
            <div className="min-w-0 flex-1">
              {lastScanResult.student?.name ? (
                <div className="text-xl font-black truncate">{lastScanResult.student.name}</div>
              ) : null}
              <div className="mt-0.5 text-sm font-medium opacity-80">{lastScanResult.message}</div>
            </div>
            <div className="text-xs opacity-50 shrink-0">{new Date(lastScanResult.ts).toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}</div>
          </div>
        ) : null}
        {message ? <div className="rounded-3xl bg-white px-5 py-4 text-slate-900 ring-1 ring-slate-200">{message}</div> : null}
      </div>
    </div>
  );
}

export default PublicGatePage;

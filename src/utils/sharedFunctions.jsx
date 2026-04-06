/**
 * ==========================================
 *  Shared Functions - الدوال المشتركة
 * ==========================================
 *  جميع الدوال المساعدة التي تستخدمها الصفحات والمكونات
 *  تم استخراجها من App.jsx لتكون متاحة عبر import
 */
import QRCode from 'qrcode';
import * as XLSX from 'xlsx';
import { permissionDefinitions, schoolRoleDefinitions, BACKUP_VERSION, GATE_OFFLINE_QUEUE_PREFIX, GATE_SYNC_LOG_PREFIX, SCREEN_TEMPLATE_OPTIONS, SCREEN_THEME_OPTIONS, SCREEN_TRANSITION_KEYS, SCREEN_TRANSITION_OPTIONS, SERVER_CACHE_KEY, SESSION_TOKEN_KEY, STORAGE_KEY, TICKER_BG_OPTIONS, UI_STATE_KEY } from '../constants/appConfig.js';
import {
  LayoutDashboard, Building2, ScanLine, ClipboardList, ClipboardCheck,
  ShieldCheck, UserCheck, Shield, Bell, Users, LineChart, BookOpen,
  Trophy, Layers3, Gift, BarChart3, ExternalLink, GraduationCap,
  Settings, School
} from 'lucide-react';


// === API Request Helper ===
export async function apiRequest(path, { method = "GET", body, token } = {}) {
  const response = await fetch(path, {
    method,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    const error = new Error(data?.message || "تعذر تنفيذ الطلب على الخادم.");
    error.data = data;
    throw error;
  }
  return data;
}


export const CODE39_PATTERNS = {
  "0": "101000111011101",
  "1": "111010001010111",
  "2": "101110001010111",
  "3": "111011100010101",
  "4": "101000111010111",
  "5": "111010001110101",
  "6": "101110001110101",
  "7": "101000101110111",
  "8": "111010001011101",
  "9": "101110001011101",
  A: "111010100010111",
  B: "101110100010111",
  C: "111011101000101",
  D: "101011100010111",
  E: "111010111000101",
  F: "101110111000101",
  G: "101010001110111",
  H: "111010100011101",
  I: "101110100011101",
  J: "101011100011101",
  K: "111010101000111",
  L: "101110101000111",
  M: "111011101010001",
  N: "101011101000111",
  O: "111010111010001",
  P: "101110111010001",
  Q: "101010111000111",
  R: "111010101110001",
  S: "101110101110001",
  T: "101011101110001",
  U: "111000101010111",
  V: "100011101010111",
  W: "111000111010101",
  X: "100010111010111",
  Y: "111000101110101",
  Z: "100011101110101",
  "-": "100010101110111",
  ".": "111000101011101",
  " ": "100011101011101",
  "$": "100010001000101",
  "/": "100010001010001",
  "+": "100010100010001",
  "%": "101000100010001",
  "*": "100010111011101",
};

export function ensureDemoUsers(users, schools) {
  const hydratedSchools = hydrateSchools(schools || initialSchools);
  const firstSchool = hydratedSchools[0] || null;
  let nextId = Math.max(1000, ...(users || []).map((user) => Number(user.id) || 0)) + 1;
  const nextUsers = Array.isArray(users) ? [...users] : [];
  const addIfMissing = (matcher, payload) => {
    if (nextUsers.some(matcher)) return;
    nextUsers.push({ id: nextId++, ...payload });
  };

  addIfMissing((user) => String(user.username || '').toLowerCase() === 'admin', {
    name: 'الأدمن العام للمنصة',
    username: 'admin',
    email: 'admin@example.com',
    mobile: '',
    password: 'admin123',
    role: 'superadmin',
    schoolId: null,
    studentId: null,
    status: 'نشط',
    permissions: buildRolePermissions('superadmin'),
  });

  if (firstSchool) {
    const principalPermissions = getSchoolAccess(firstSchool).principalPermissions;
    addIfMissing((user) => String(user.username || '').toLowerCase() === 'manager.demo', {
      name: 'مدير تجريبي',
      username: 'manager.demo',
      email: 'manager.demo@example.com',
      mobile: '966500000002',
      password: 'Demo@123',
      role: 'principal',
      schoolId: firstSchool.id,
      studentId: null,
      status: 'نشط',
      permissions: principalPermissions,
    });
    addIfMissing((user) => String(user.username || '').toLowerCase() === 'agent.demo', {
      name: 'وكيل تجريبي',
      username: 'agent.demo',
      email: 'agent.demo@example.com',
      mobile: '966500000004',
      password: 'Demo@123',
      role: 'agent',
      schoolId: firstSchool.id,
      studentId: null,
      status: 'نشط',
      permissions: buildRolePermissions('agent'),
    });
    addIfMissing((user) => String(user.username || '').toLowerCase() === 'counselor.demo', {
      name: 'مرشد تجريبي',
      username: 'counselor.demo',
      email: 'counselor.demo@example.com',
      mobile: '966500000005',
      password: 'Demo@123',
      role: 'counselor',
      schoolId: firstSchool.id,
      studentId: null,
      status: 'نشط',
      permissions: buildRolePermissions('counselor'),
    });
    addIfMissing((user) => String(user.username || '').toLowerCase() === 'teacher.demo', {
      name: 'معلم تجريبي',
      username: 'teacher.demo',
      email: 'teacher.demo@example.com',
      mobile: '966500000003',
      password: 'Demo@123',
      role: 'teacher',
      schoolId: firstSchool.id,
      studentId: null,
      status: 'نشط',
      permissions: buildRolePermissions('teacher', { reports: true, actions: true }),
      subjects: ['رياضيات','علوم'],
      specialItems: [
        { id: 'tsi-demo-1', title: 'حفظ جدول الضرب', type: 'reward', points: 5, subject: 'رياضيات', description: 'مكافأة تخصصية سريعة', isActive: true },
        { id: 'tsi-demo-2', title: 'إتمام التجربة العملية', type: 'reward', points: 4, subject: 'علوم', description: 'اعتماد تنفيذ التجربة أو النشاط', isActive: true },
      ],
    });
  }

  return nextUsers;
}

// === CSS Class Merger ===
export function cx(...classes) {
  return classes.filter(Boolean).join(' ');
}

// === Number/Date Helpers ===
export function safeNumber(value, fallback = 0) {
  const num = Number(value);
  return Number.isFinite(num) ? num : fallback;
}

export function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

export function getTodayIso() {
  return new Date().toISOString().slice(0, 10);
}

export function toArabicDate(date = new Date()) {
  return new Intl.DateTimeFormat('ar-SA', { year: 'numeric', month: '2-digit', day: '2-digit' }).format(date);
}

export function parseTimeToMinutes(value) {
  const [h, m] = String(value || '').split(':').map((i) => Number(i));
  return (Number.isFinite(h) ? h : 0) * 60 + (Number.isFinite(m) ? m : 0);
}

export function formatDateTime(value) {
  if (!value) return '—';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '—';
  return new Intl.DateTimeFormat('ar-SA', { year: 'numeric', month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' }).format(date);
}

// === Student Helpers ===
export function getShortStudentName(fullName) {
  if (!fullName) return 'طالب';
  const parts = String(fullName).trim().split(/\s+/);
  if (parts.length <= 2) return fullName;
  return `${parts[0]} ${parts[parts.length - 1]}`;
}

export function schoolHasStructureClassrooms(school) {
  return Array.isArray(school?.structure?.classrooms) && school.structure.classrooms.length > 0;
}

export function getStudentCompanyName(student, school) {
  if (!student) return '';
  if (student.source === 'structure') return student.companyName || student.classroomName || student.className || '';
  return school?.companies?.find((item) => item.id === student.companyId)?.name || student.companyName || student.className || '';
}

export function getStudentGroupingLabel(student, school) {
  if (!student) return '—';
  if (student.source === 'structure') return student.companyName || student.classroomName || student.className || '—';
  return school?.companies?.find((item) => item.id === student.companyId)?.name || student.companyName || student.className || '—';
}

// === Barcode / QR Helpers ===
export function createBarcode(schoolCode, serial) {
  return `ST-${String(serial).padStart(4, '0')}-${schoolCode.split('-')[0]}`;
}

export async function generateQrDataUrl(value, size = 172) {
  if (!value) return '';
  try {
    return await QRCode.toDataURL(String(value), { width: size, margin: 1, color: { dark: '#000000', light: '#ffffff' } });
  } catch { return ''; }
}

// === Result/Status Helpers ===
export function resultTone(result) {
  if (String(result).includes('مبكر')) return 'green';
  if (String(result).includes('في الوقت')) return 'blue';
  if (String(result).includes('تأخر') || String(result).includes('رفض')) return 'red';
  return 'gray';
}

export function statusFromResult(result) {
  if (String(result).includes('مبكر')) return 'مبكر';
  if (String(result).includes('في الوقت')) return 'في الوقت';
  if (String(result).includes('تأخر')) return 'متأخر';
  return 'غير معروف';
}

// === Role/Permission Helpers ===
export const roles = [
  { key: "superadmin", label: "الأدمن العام" },
  { key: "principal", label: "مدير المدرسة" },
  { key: "gate", label: "بوابة الحضور" },
  { key: "supervisor", label: "المشرف" },
  { key: "teacher", label: "المعلم" },
  { key: "student", label: "الطالب" },
];

export function getRoleLabel(roleKey) {
  return roles.find((r) => r.key === roleKey)?.label || roleKey;
}

export function canAccessPermission(user, permission) {
  if (!user) return false;
  if (user.role === 'superadmin') return true;
  return user.permissions?.[permission] === true;
}

// === Unified Student Getter ===
export function getUnifiedSchoolStudents(school, options = {}) {
  const { includeArchived = false, preferStructure = true } = options;
  if (!school) return [];
  
  const hasStructure = schoolHasStructureClassrooms(school);
  
  if (hasStructure && preferStructure) {
    const students = [];
    for (const classroom of school.structure.classrooms || []) {
      if (!Array.isArray(classroom.students)) continue;
      for (const student of classroom.students) {
        if (!includeArchived && student.archived) continue;
        students.push({
          ...student,
          name: student.name || student.fullName || 'طالب',
          fullName: student.fullName || student.name || 'طالب',
          source: 'structure',
          classroomId: classroom.id,
          classroomName: classroom.name,
          companyName: classroom.companyName || classroom.name,
          className: classroom.name,
        });
      }
    }
    return students;
  }
  
  return (school.students || []).map((student) => ({
    ...student,
    source: 'school',
    companyName: school.companies?.find((c) => c.id === student.companyId)?.name || '',
  }));
}

// === Excel Export Helper ===
export function exportToExcel(data, filename = 'export.xlsx', sheetName = 'Sheet1') {
  const ws = XLSX.utils.json_to_sheet(data);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, sheetName);
  XLSX.writeFile(wb, filename);
}

// === LocalStorage Helpers ===
export function safeLocalStorageSetItem(key, value) {
  try { localStorage.setItem(key, value); } catch {}
}

export function safeLocalStorageGetItem(key) {
  try { return localStorage.getItem(key); } catch { return null; }
}

// === Color/Chart Helpers ===
export const pieColors = ["#10b981", "#3b82f6", "#f59e0b", "#ef4444", "#94a3b8"];

// === Auth Helpers ===
export const getAuthActionMeta = (action) => {
  const map = {
    login: { label: 'دخول ناجح بكلمة المرور', tone: 'green' },
    logout: { label: 'تسجيل خروج', tone: 'slate' },
    auth_login_failed: { label: 'فشل دخول بكلمة المرور', tone: 'rose' },
    auth_login_blocked: { label: 'منع دخول بكلمة المرور', tone: 'amber' },
    auth_request_otp_success: { label: 'طلب OTP ناجح', tone: 'green' },
    auth_request_otp_failed: { label: 'فشل طلب OTP', tone: 'rose' },
    auth_verify_otp_success: { label: 'تحقق OTP ناجح', tone: 'green' },
    auth_verify_otp_failed: { label: 'فشل تحقق OTP', tone: 'rose' },
    auth_security_alert: { label: 'تنبيه أمني', tone: 'amber' },
    auth_lockout_cleared: { label: 'رفع القفل المؤقت', tone: 'sky' },
  };
  return map[action] || { label: action || 'حدث مصادقة', tone: 'blue' };
};


// ==========================================
//  دوال مستخرجة تلقائياً من App.jsx
// ==========================================

// سطر 317 من App.jsx الأصلي
export function generateSchoolStructureClassrooms(stageConfigs = []) {
  const alphabet = ["أ", "ب", "ج", "د", "هـ", "و", "ز", "ح", "ط", "ي", "ك", "ل", "م", "ن", "س", "ع", "ف", "ص", "ق", "ر"];
  return (Array.isArray(stageConfigs) ? stageConfigs : []).flatMap((row) => {
    const count = Math.max(1, Math.min(20, Number(row.classCount) || 1));
    return Array.from({ length: count }, (_, index) => {
      const section = alphabet[index] || String(index + 1);
      return {
        id: `${row.stage}-${row.gradeKey}-${index + 1}`,
        stage: row.stage,
        stageLabel: row.stageLabel,
        gradeKey: row.gradeKey,
        gradeLabel: row.gradeLabel,
        section,
        name: `${row.gradeLabel} ${section}`,
        companyName: "",
        leaderUserId: null,
        students: [],
        studentCount: 0,
        status: "active",
      };
    });
  });
}


// سطر 341 من App.jsx الأصلي
export function getTransitionLabel(key) {
  return SCREEN_TRANSITION_OPTIONS.find((item) => item[0] === key)?.[1] || "تلاشي ناعم";
}


// سطر 345 من App.jsx الأصلي
export function getScreenTemplateLabel(key) {
  return SCREEN_TEMPLATE_OPTIONS.find((item) => item[0] === key)?.[1] || "مؤشرات تنفيذية";
}


// سطر 349 من App.jsx الأصلي
export function getDisplayMotionVariant(name) {
  switch (name) {
    case "cut":
      return { initial: { opacity: 1 }, animate: { opacity: 1 }, exit: { opacity: 1 }, duration: 0.05 };
    case "slide-left":
      return { initial: { opacity: 0, x: 180 }, animate: { opacity: 1, x: 0 }, exit: { opacity: 0, x: -180 }, duration: 0.55 };
    case "slide-right":
      return { initial: { opacity: 0, x: -180 }, animate: { opacity: 1, x: 0 }, exit: { opacity: 0, x: 180 }, duration: 0.55 };
    case "slide-up":
      return { initial: { opacity: 0, y: 140 }, animate: { opacity: 1, y: 0 }, exit: { opacity: 0, y: -140 }, duration: 0.55 };
    case "slide-down":
      return { initial: { opacity: 0, y: -140 }, animate: { opacity: 1, y: 0 }, exit: { opacity: 0, y: 140 }, duration: 0.55 };
    case "zoom-in":
      return { initial: { opacity: 0, scale: 0.9 }, animate: { opacity: 1, scale: 1 }, exit: { opacity: 0, scale: 1.07 }, duration: 0.55 };
    case "zoom-out":
      return { initial: { opacity: 0, scale: 1.08 }, animate: { opacity: 1, scale: 1 }, exit: { opacity: 0, scale: 0.92 }, duration: 0.55 };
    case "flip-x":
      return { initial: { opacity: 0, rotateX: -70, transformPerspective: 1200 }, animate: { opacity: 1, rotateX: 0, transformPerspective: 1200 }, exit: { opacity: 0, rotateX: 70, transformPerspective: 1200 }, duration: 0.65 };
    case "flip-y":
      return { initial: { opacity: 0, rotateY: -70, transformPerspective: 1200 }, animate: { opacity: 1, rotateY: 0, transformPerspective: 1200 }, exit: { opacity: 0, rotateY: 70, transformPerspective: 1200 }, duration: 0.65 };
    case "rotate-soft":
      return { initial: { opacity: 0, rotate: -6, scale: 0.96 }, animate: { opacity: 1, rotate: 0, scale: 1 }, exit: { opacity: 0, rotate: 6, scale: 1.03 }, duration: 0.6 };
    case "rotate-in":
      return { initial: { opacity: 0, rotate: -12, scale: 0.88 }, animate: { opacity: 1, rotate: 0, scale: 1 }, exit: { opacity: 0, rotate: 12, scale: 0.9 }, duration: 0.62 };
    case "blur":
      return { initial: { opacity: 0, filter: 'blur(18px)' }, animate: { opacity: 1, filter: 'blur(0px)' }, exit: { opacity: 0, filter: 'blur(14px)' }, duration: 0.62 };
    case "bounce":
      return { initial: { opacity: 0, scale: 0.86, y: 70 }, animate: { opacity: 1, scale: 1, y: 0 }, exit: { opacity: 0, scale: 1.03, y: -40 }, duration: 0.68, ease: [0.16, 1, 0.3, 1] };
    case "scale-up":
      return { initial: { opacity: 0, scaleY: 0.86, transformOrigin: 'top center' }, animate: { opacity: 1, scaleY: 1, transformOrigin: 'top center' }, exit: { opacity: 0, scaleY: 1.06, transformOrigin: 'bottom center' }, duration: 0.58 };
    case "scale-down":
      return { initial: { opacity: 0, scaleY: 1.12, transformOrigin: 'bottom center' }, animate: { opacity: 1, scaleY: 1, transformOrigin: 'bottom center' }, exit: { opacity: 0, scaleY: 0.88, transformOrigin: 'top center' }, duration: 0.58 };
    case "swing":
      return { initial: { opacity: 0, rotate: -10, y: 30, transformOrigin: 'center top' }, animate: { opacity: 1, rotate: 0, y: 0, transformOrigin: 'center top' }, exit: { opacity: 0, rotate: 10, y: -20, transformOrigin: 'center top' }, duration: 0.64 };
    case "curtain":
      return { initial: { opacity: 0, scaleX: 0.72, transformOrigin: 'right center' }, animate: { opacity: 1, scaleX: 1, transformOrigin: 'right center' }, exit: { opacity: 0, scaleX: 0.72, transformOrigin: 'left center' }, duration: 0.56 };
    case "diagonal":
      return { initial: { opacity: 0, x: 120, y: 90 }, animate: { opacity: 1, x: 0, y: 0 }, exit: { opacity: 0, x: -120, y: -90 }, duration: 0.6 };
    case "pop":
      return { initial: { opacity: 0, scale: 0.7 }, animate: { opacity: 1, scale: 1 }, exit: { opacity: 0, scale: 1.12 }, duration: 0.48 };
    case "float":
      return { initial: { opacity: 0, y: 60 }, animate: { opacity: 1, y: 0 }, exit: { opacity: 0, y: -60 }, duration: 0.58 };
    default:
      return { initial: { opacity: 0 }, animate: { opacity: 1 }, exit: { opacity: 0 }, duration: 0.55 };
  }
}


// سطر 396 من App.jsx الأصلي
export function getScreenTheme(theme) {
  switch (theme) {
    case "blue-contrast":
      return { shell: "bg-[radial-gradient(circle_at_top,_#38bdf8,_#0f172a_38%,_#020617_100%)]", panel: "border-white/15 bg-slate-950/55", card: "bg-white text-slate-950 ring-sky-200", muted: "text-slate-600", accent: "text-sky-700" };
    case "violet-stage":
      return { shell: "bg-[radial-gradient(circle_at_top,_#8b5cf6,_#1e1b4b_42%,_#020617_100%)]", panel: "border-white/15 bg-indigo-950/45", card: "bg-white text-slate-950 ring-violet-200", muted: "text-slate-600", accent: "text-violet-700" };
    case "sunrise":
      return { shell: "bg-[radial-gradient(circle_at_top,_#fb923c,_#7c2d12_36%,_#111827_100%)]", panel: "border-white/15 bg-orange-950/35", card: "bg-white text-slate-950 ring-orange-200", muted: "text-slate-600", accent: "text-orange-700" };
    case "graphite":
      return { shell: "bg-[radial-gradient(circle_at_top,_#64748b,_#111827_40%,_#020617_100%)]", panel: "border-white/10 bg-slate-900/55", card: "bg-white text-slate-950 ring-slate-300", muted: "text-slate-600", accent: "text-slate-900" };
    default:
      return { shell: "bg-[radial-gradient(circle_at_top,_#0f766e,_#0f172a_45%,_#020617_100%)]", panel: "border-white/10 bg-white/10", card: "bg-white text-slate-950 ring-emerald-200", muted: "text-slate-600", accent: "text-emerald-700" };
  }
}


// سطر 411 من App.jsx الأصلي
export function getTickerTheme(bg) {
  switch (bg) {
    case "navy":
      return { wrap: "bg-slate-950 text-white", badge: "bg-white/15 text-white" };
    case "emerald":
      return { wrap: "bg-emerald-500 text-slate-950", badge: "bg-slate-950/10 text-slate-950" };
    case "rose":
      return { wrap: "bg-rose-500 text-white", badge: "bg-white/15 text-white" };
    case "slate":
      return { wrap: "bg-slate-700 text-white", badge: "bg-white/15 text-white" };
    default:
      return { wrap: "bg-gradient-to-r from-amber-400 to-yellow-300 text-slate-950", badge: "bg-slate-950/10 text-slate-950" };
  }
}


// سطر 493 من App.jsx الأصلي
export function parseTeacherSubjects(value) {
  if (Array.isArray(value)) return value.map((item) => String(item || '').trim()).filter(Boolean);
  return String(value || '')
    .split(/[\n،,]+/)
    .map((item) => item.trim())
    .filter(Boolean);
}


// سطر 501 من App.jsx الأصلي
export function getTeacherSubjects(user) {
  return parseTeacherSubjects(user?.subjects || user?.subjectAssignments || []);
}


// سطر 505 من App.jsx الأصلي
export function hydrateTeacherSpecialItems(items = []) {
  return (Array.isArray(items) ? items : []).map((item, index) => ({
    id: item?.id || `tsi-${Date.now()}-${index + 1}`,
    title: String(item?.title || '').trim(),
    type: item?.type === 'violation' ? 'violation' : item?.type === 'program' ? 'program' : 'reward',
    points: Number(item?.points || 0),
    subject: String(item?.subject || '').trim(),
    description: String(item?.description || '').trim(),
    isActive: item?.isActive !== false,
  })).filter((item) => item.title && item.subject);
}


// سطر 517 من App.jsx الأصلي
export function getTeacherSpecialItems(user, actionType = '', subject = '') {
  const type = actionType === 'violation' ? 'violation' : actionType === 'program' ? 'program' : 'reward';
  return hydrateTeacherSpecialItems(user?.specialItems || [])
    .filter((item) => item.type === type)
    .filter((item) => !subject || item.subject === subject)
    .filter((item) => item.isActive !== false)
    .map((item) => ({ ...item, scope: 'special' }));
}


// سطر 526 من App.jsx الأصلي
export function getCurrentAcademicTermId(settings = {}) {
  return `term-${String(settings?.academicYear || 'default').trim() || 'default'}`;
}


// سطر 558 من App.jsx الأصلي
export function computeTeacherSpecialStats(actionLog = [], teacher = null, settings = {}) {
  const termId = getCurrentAcademicTermId(settings);
  const teacherId = teacher?.id != null ? String(teacher.id) : '';
  const username = String(teacher?.username || '');
  const name = String(teacher?.name || '');
  const uniquePairs = new Set();
  const uniqueStudents = new Set();
  let activations = 0;
  (Array.isArray(actionLog) ? actionLog : []).forEach((item) => {
    if (!item?.specialDefinitionId || !item?.specialTermId) return;
    if (String(item.specialTermId) !== termId) return;
    const sameTeacher = (teacherId && String(item.actorId || '') === teacherId) || (username && String(item.actorUsername || '') === username) || (name && String(item.actorName || '') === name);
    if (!sameTeacher) return;
    activations += 1;
    uniquePairs.add(`${item.studentId || item.student || 'student'}|${item.specialDefinitionId}`);
    uniqueStudents.add(String(item.studentId || item.student || 'student'));
  });
  return { score: uniquePairs.size, achievements: activations, uniqueStudents: uniqueStudents.size };
}


// سطر 578 من App.jsx الأصلي
export function computeTeacherSpecialScore(actionLog = [], teacher = null, settings = {}) {
  return computeTeacherSpecialStats(actionLog, teacher, settings).score;
}


// سطر 918 من App.jsx الأصلي
export function buildRolePermissions(role, overrides = {}) {
  return {
    ...(defaultPermissionsByRole[role] || defaultPermissionsByRole.teacher),
    ...(overrides || {}),
  };
}


// سطر 925 من App.jsx الأصلي
export function clampDelegatedPermissions(actor, role, permissions = {}) {
  const base = buildRolePermissions(role, permissions);
  if (actor?.role === "superadmin") return base;
  if (actor?.role === "principal") {
    return Object.fromEntries(permissionDefinitions.map((item) => [
      item.key,
      principalManageablePermissionKeys.includes(item.key) ? Boolean(base[item.key]) : false,
    ]));
  }
  return buildRolePermissions(role, {});
}


// سطر 937 من App.jsx الأصلي
export function canPrincipalManageUser(currentUser, targetUser) {
  if (!currentUser || currentUser.role !== "principal") return false;
  if (!targetUser) return false;
  if (Number(currentUser.id) === Number(targetUser.id)) return false;
  if (Number(currentUser.schoolId) !== Number(targetUser.schoolId)) return false;
  return principalDelegableRoles.includes(targetUser.role);
}


// سطر 945 من App.jsx الأصلي
export function createDefaultSchoolAccess() {
  return {
    roleAccess: Object.fromEntries(schoolRoleDefinitions.map((item) => [item.key, true])),
    principalPermissions: buildRolePermissions("principal"),
  };
}


// سطر 952 من App.jsx الأصلي
export function getSchoolAccess(school) {
  const defaults = createDefaultSchoolAccess();
  return {
    roleAccess: {
      ...defaults.roleAccess,
      ...(school?.access?.roleAccess || {}),
    },
    principalPermissions: buildRolePermissions("principal", school?.access?.principalPermissions || defaults.principalPermissions),
  };
}


// سطر 963 من App.jsx الأصلي
export function createDefaultSmartLinks() {
  return {
    gates: [],
    screens: [],
  };
}


// سطر 970 من App.jsx الأصلي
export function normalizeSmartLinks(links) {
  const defaults = createDefaultSmartLinks();
  const mapGate = (item, index) => ({
    id: item?.id || `gate-${Date.now()}-${index + 1}`,
    name: item?.name || `بوابة ${index + 1}`,
    token: item?.token || "",
    mode: item?.mode || "mixed",
    createdAt: item?.createdAt || new Date().toISOString(),
  });
  const mapScreen = (item, index) => ({
    id: item?.id || `screen-${Date.now()}-${index + 1}`,
    name: item?.name || `شاشة ${index + 1}`,
    token: item?.token || "",
    title: item?.title || "لوحة المدرسة الحية",
    transition: SCREEN_TRANSITION_KEYS.includes(item?.transition) ? item.transition : "fade",
    rotateSeconds: Math.max(4, Math.min(30, Number(item?.rotateSeconds) || 8)),
    theme: SCREEN_THEME_OPTIONS.some(([key]) => key === item?.theme) ? item.theme : "emerald-night",
    template: SCREEN_TEMPLATE_OPTIONS.some(([key]) => key === item?.template) ? item.template : "executive",
    tickerEnabled: item?.tickerEnabled === true,
    tickerText: String(item?.tickerText || ""),
    tickerDir: item?.tickerDir === "rtl" ? "rtl" : "ltr",
    tickerBg: TICKER_BG_OPTIONS.some(([key]) => key === item?.tickerBg) ? item.tickerBg : "amber",
    tickerSeparator: String(item?.tickerSeparator || " ✦ "),
    tickerFontSize: Math.max(18, Math.min(48, Number(item?.tickerFontSize) || 28)),
    tickerShowLogo: item?.tickerShowLogo !== false,
    tickerLayout: item?.tickerLayout === "stacked" ? "stacked" : "marquee",
    sourceMode: item?.sourceMode === "classroom" ? "classroom" : "school",
    linkedClassroomId: item?.linkedClassroomId ? String(item.linkedClassroomId) : "",
    widgets: {
      metrics: item?.widgets?.metrics !== false,
      topStudents: item?.widgets?.topStudents !== false,
      topCompanies: item?.widgets?.topCompanies !== false,
      attendanceChart: item?.widgets?.attendanceChart !== false,
      recentActivity: item?.widgets?.recentActivity !== false,
      teacherActivity: item?.widgets?.teacherActivity !== false,
      actionStats: item?.widgets?.actionStats !== false,
      parentPortalSummary: item?.widgets?.parentPortalSummary !== false,
      lessonAttendanceSummary: item?.widgets?.lessonAttendanceSummary !== false,
      rewardStoreSummary: item?.widgets?.rewardStoreSummary !== false,
      rewardCategoryBreakdown: item?.widgets?.rewardCategoryBreakdown !== false,
      topTeachers: item?.widgets?.topTeachers !== false,
      nafisQuiz: item?.widgets?.nafisQuiz !== false,
      nafisLeaderboard: item?.widgets?.nafisLeaderboard !== false,
    },
    topCompaniesMax: Math.max(1, Math.min(10, Number(item?.topCompaniesMax || 3))),
    topCompaniesLayout: ['auto','grid','list'].includes(String(item?.topCompaniesLayout || '')) ? item.topCompaniesLayout : 'auto',
    rewardStoreSettings: {
      mode: ['all','featured','marked'].includes(String(item?.rewardStoreSettings?.mode || '')) ? item.rewardStoreSettings.mode : 'all',
      sourceFilter: ['all','school','parent','external'].includes(String(item?.rewardStoreSettings?.sourceFilter || '')) ? item.rewardStoreSettings.sourceFilter : 'all',
      maxItems: Math.max(1, Math.min(24, Number(item?.rewardStoreSettings?.maxItems || 8))),
    },
    createdAt: item?.createdAt || new Date().toISOString(),
  });
  return {
    gates: Array.isArray(links?.gates) ? links.gates.map(mapGate) : defaults.gates,
    screens: Array.isArray(links?.screens) ? links.screens.map(mapScreen) : defaults.screens,
  };
}


// سطر 1029 من App.jsx الأصلي
export function isRoleEnabledForSchool(role, school) {
  if (role === "superadmin") return true;
  return getSchoolAccess(school).roleAccess?.[role] !== false;
}


// سطر 1034 من App.jsx الأصلي
export function applySchoolAccessToUser(user, schools) {
  if (!user) return null;
  if (user.role === "superadmin") return user;
  const school = (schools || []).find((item) => item.id === user.schoolId);
  const access = getSchoolAccess(school);
  return {
    ...user,
    roleEnabled: isRoleEnabledForSchool(user.role, school),
    permissions: user.role === "principal" ? access.principalPermissions : buildRolePermissions(user.role, user.permissions || {}),
    schoolAccess: access,
  };
}


// سطر 1057 من App.jsx الأصلي
export function getDefaultLandingPage(user) {
  if (user?.role === "agent" && canAccessPermission(user, "leavePass")) return "leavePassAgentDesk";
  if (user?.role === "counselor" && canAccessPermission(user, "leavePass")) return "leavePassCounselorDesk";
  if (user?.role === "teacher" && canAccessPermission(user, "actions")) return "actions";
  if (user?.role === "supervisor" && canAccessPermission(user, "reports")) return "reports";
  if (user?.role === "gate") return "securityDesk";
  const firstAllowed = navItems.find((item) => canAccessPermission(user, item.permission) && (!Array.isArray(item.roles) || !item.roles.length || item.roles.includes(user?.role)));
  return firstAllowed?.key || "dashboard";
}


// سطر 1067 من App.jsx الأصلي
export function schoolCodeSlug(code) {
  return String(code || "school").replace(/[^a-zA-Z0-9]+/g, "").toLowerCase() || "school";
}


// سطر 1071 من App.jsx الأصلي
export function createSeedUsersForSchool(school, startId = 1) {
  const slug = schoolCodeSlug(school.code);
  const teacherPermissions = buildRolePermissions("teacher", { reports: true, actions: true });
  const schoolAccess = getSchoolAccess(school);
  const principalProfile = school.principalProfile || {};
  return [
    {
      id: startId,
      name: school.manager || `مدير ${school.name}`,
      username: principalProfile.username || `${slug}.principal`,
      email: principalProfile.email || `${slug}.principal@example.com`,
      password: principalProfile.password || "123456",
      role: "principal",
      schoolId: school.id,
      studentId: null,
      status: "نشط",
      permissions: schoolAccess.principalPermissions,
    },
    {
      id: startId + 1,
      name: `وكيل ${school.name}`,
      username: `${slug}.agent`,
      email: `${slug}.agent@example.com`,
      password: "123456",
      role: "agent",
      schoolId: school.id,
      studentId: null,
      status: "نشط",
      permissions: buildRolePermissions("agent"),
    },
    {
      id: startId + 2,
      name: `مرشد ${school.name}`,
      username: `${slug}.counselor`,
      email: `${slug}.counselor@example.com`,
      password: "123456",
      role: "counselor",
      schoolId: school.id,
      studentId: null,
      status: "نشط",
      permissions: buildRolePermissions("counselor"),
    },
    {
      id: startId + 3,
      name: `بوابة ${school.name}`,
      username: `${slug}.gate`,
      email: `${slug}.gate@example.com`,
      password: "123456",
      role: "gate",
      schoolId: school.id,
      studentId: null,
      status: "نشط",
      permissions: buildRolePermissions("gate"),
    },
    {
      id: startId + 4,
      name: `معلم ${school.name}`,
      username: `${slug}.teacher`,
      email: `${slug}.teacher@example.com`,
      password: "123456",
      role: "teacher",
      schoolId: school.id,
      studentId: null,
      status: "نشط",
      permissions: teacherPermissions,
      subjects: ['رياضيات'],
      specialItems: [
        { id: `tsi-${school.id}-1`, title: 'حفظ جدول الضرب', type: 'reward', points: 5, subject: 'رياضيات', description: 'مكافأة تخصصية في الرياضيات', isActive: true },
      ],
    },
  ];
}


// سطر 1228 من App.jsx الأصلي
export function createDefaultUsers(schools) {
  const hydrated = hydrateSchools(schools || initialSchools);
  let nextId = 1;
  const users = [
    {
      id: nextId++,
      name: "الأدمن العام للمنصة",
      username: "admin",
      email: "admin@example.com",
      password: "admin123",
      role: "superadmin",
      schoolId: null,
      studentId: null,
      status: "نشط",
      permissions: buildRolePermissions("superadmin"),
    },
  ];

  hydrated.forEach((school) => {
    const seeded = createSeedUsersForSchool(school, nextId);
    users.push(...seeded);
    nextId += seeded.length;
  });

  const firstSchool = hydrated[0];
  const firstStudent = firstSchool?.students?.[0];
  if (firstSchool && firstStudent) {
    users.push({
      id: nextId,
      name: firstStudent.name,
      username: `${schoolCodeSlug(firstSchool.code)}.student1`,
      email: "",
      mobile: "",
      password: "123456",
      role: "student",
      schoolId: firstSchool.id,
      studentId: firstStudent.id,
      status: "نشط",
      permissions: buildRolePermissions("student"),
    });
  }

  return ensureDemoUsers(users, hydrated);
}


// سطر 1273 من App.jsx الأصلي
export function hydrateUsers(users, schools) {
  const schoolIds = new Set((schools || []).map((school) => school.id));
  return ensureDemoUsers((users || []).map((user, index) => {
    const role = roles.some((item) => item.key === user.role) ? user.role : "teacher";
    const scopedSchoolId = role === "superadmin" ? null : (schoolIds.has(user.schoolId) ? user.schoolId : (schools[0]?.id || null));
    return {
      id: user.id || Date.now() + index,
      name: user.name || `مستخدم ${index + 1}`,
      username: user.username || `user${index + 1}`,
      email: String(user.email || '').trim().toLowerCase(),
      mobile: String(user.mobile || '').trim(),
      password: user.password || "",
      role,
      schoolId: scopedSchoolId,
      studentId: user.studentId || null,
      status: user.status === "موقوف" ? "موقوف" : "نشط",
      permissions: buildRolePermissions(role, user.permissions || {}),
    };
  }).filter((user) => user.role === "superadmin" || user.schoolId !== null), schools);
}


// سطر 1354 من App.jsx الأصلي
export function createDefaultMessagingCenter() {
  return {
    templates: [
      { id: 1, name: "تنبيه تأخر صباحي", category: "تأخر", channel: "whatsapp", language: "ar", message: "نحيطكم علمًا بأن الطالب {اسم_الطالب} من {الفصل} وصل متأخرًا اليوم عند الساعة {وقت_التأخر}. نأمل المتابعة.", isDefault: true, active: true },
      { id: 2, name: "غياب بدون عذر", category: "غياب", channel: "sms", language: "ar", message: "نفيدكم بغياب الطالب {اسم_الطالب} اليوم من {المدرسة}. نأمل التحقق وإشعار المدرسة بسبب الغياب.", isDefault: true, active: true },
      { id: 3, name: "رسالة إشادة", category: "إشادة", channel: "internal", language: "ar", message: "أحسنتم، الطالب {اسم_الطالب} حقق أداءً إيجابيًا اليوم ونقاطه الحالية {النقاط}.", isDefault: true, active: true },
    ],
    rules: [
      { id: 1, name: "تنبيه التأخر اليومي", eventType: "late", target: "guardians", condition: "مرة واحدة", channel: "whatsapp", message: "نحيطكم علمًا بأن الطالب {اسم_الطالب} تأخر هذا اليوم. وقت الوصول: {وقت_التأخر}.", execution: "فوري", preventDuplicates: true, active: true },
      { id: 2, name: "تنبيه الغياب", eventType: "absence", target: "guardians", condition: "بدون عذر", channel: "sms", message: "الطالب {اسم_الطالب} مسجل غائبًا اليوم في {المدرسة}.", execution: "فوري", preventDuplicates: true, active: false },
      { id: 3, name: "تنبيه مخالفة سلوكية", eventType: "behavior", target: "guardians", condition: "عند تسجيل مخالفة", channel: "whatsapp", message: "نحيطكم علمًا بتسجيل ملاحظة سلوكية على الطالب {اسم_الطالب}. نوع الملاحظة: {نوع_المخالفة}. رصيد النقاط الحالي: {النقاط}.", execution: "فوري", preventDuplicates: true, active: false },
    ],
    logs: [],
    settings: {
      channels: { whatsapp: true, sms: false, internal: true },
      operations: { instantSend: true, scheduling: true, batchLimit: 200, delaySeconds: 3, retryCount: 1, retentionDays: 90 },
      automation: { enabled: true, lateAlerts: true, absenceAlerts: true, behaviorAlerts: true, checkTime: "06:50" },
      privacy: { hideSensitiveData: true, requireApprovalForBulk: true, showSenderName: true },
      integration: {
        whatsapp: {
          mode: 'cloud',
          phoneNumberId: '',
          businessAccountId: '',
          accessToken: '',
          webhookVerifyToken: '',
          testRecipient: '',
          status: 'غير مرتبط',
          lastCheckedAt: '',
        },
        sms: {
          provider: '',
          senderId: '',
          apiUrl: '',
          apiKey: '',
          username: '',
          password: '',
          testRecipient: '',
          status: 'غير مرتبط',
          lastCheckedAt: '',
        },
      },
    },
  };
}


// سطر 1399 من App.jsx الأصلي
export function hydrateMessagingCenter(center) {
  const defaults = createDefaultMessagingCenter();
  return {
    ...defaults,
    ...(center || {}),
    templates: Array.isArray(center?.templates) ? center.templates : defaults.templates,
    rules: Array.isArray(center?.rules) ? center.rules : defaults.rules,
    logs: Array.isArray(center?.logs) ? center.logs : defaults.logs,
    settings: {
      ...defaults.settings,
      ...(center?.settings || {}),
      channels: { ...defaults.settings.channels, ...(center?.settings?.channels || {}) },
      operations: { ...defaults.settings.operations, ...(center?.settings?.operations || {}) },
      automation: { ...defaults.settings.automation, ...(center?.settings?.automation || {}) },
      privacy: { ...defaults.settings.privacy, ...(center?.settings?.privacy || {}) },
      integration: {
        whatsapp: { ...defaults.settings.integration.whatsapp, ...(center?.settings?.integration?.whatsapp || {}) },
        sms: { ...defaults.settings.integration.sms, ...(center?.settings?.integration?.sms || {}) },
      },
    },
  };
}


// سطر 1422 من App.jsx الأصلي
export function applyMessageVariables(template, payload = {}) {
  const source = String(template || "");
  const values = {
    "اسم_الطالب": payload.studentName || "الطالب",
    "الصف": payload.grade || "—",
    "الفصل": payload.className || payload.companyName || "—",
    "الشركة": payload.companyName || "—",
    "المدرسة": payload.schoolName || "—",
    "وقت_التأخر": payload.lateTime || payload.time || "—",
    "عدد_مرات_التأخر": payload.lateCount || "1",
    "نوع_المخالفة": payload.violationType || "ملاحظة",
    "النقاط": payload.points ?? "0",
  };
  return source.replace(/\{([^}]+)\}/g, (_, key) => values[key] ?? `{${key}}`);


}
// سطر 1438 من App.jsx الأصلي
export function getTemplateCategoriesForEvent(eventType) {
  switch (String(eventType || '').toLowerCase()) {
    case 'late':
      return ['تأخر', 'late'];
    case 'absence':
      return ['غياب', 'absence'];
    case 'behavior':
      return ['سلوك', 'مخالفة', 'behavior'];
    case 'positive':
      return ['إشادة', 'positive'];
    default:
      return [];
  }
}


// سطر 1453 من App.jsx الأصلي
export function getDefaultTemplateForEvent(templates = [], eventType, preferredChannel = '') {
  const categories = getTemplateCategoriesForEvent(eventType);
  const normalizedChannel = String(preferredChannel || '').toLowerCase();
  const activeTemplates = (Array.isArray(templates) ? templates : []).filter((item) => item?.active !== false);
  const categoryMatches = activeTemplates.filter((item) => {
    const category = String(item?.category || '').trim().toLowerCase();
    return categories.some((candidate) => category.includes(String(candidate).toLowerCase()));
  });
  const scored = [...categoryMatches].sort((a, b) => {
    const aScore = (a?.isDefault ? 4 : 0) + (normalizedChannel && String(a?.channel || '').toLowerCase() === normalizedChannel ? 2 : 0);
    const bScore = (b?.isDefault ? 4 : 0) + (normalizedChannel && String(b?.channel || '').toLowerCase() === normalizedChannel ? 2 : 0);
    return bScore - aScore;
  });
  return scored[0] || null;
}


// سطر 1469 من App.jsx الأصلي
export function hydrateSchools(schools) {
  return (schools || []).map((school) => ({
    ...school,
    access: getSchoolAccess(school),
    smartLinks: normalizeSmartLinks(school?.smartLinks),
    customBranding: school.customBranding ? {
      enabled: Boolean(school.customBranding.enabled),
      allowed: Boolean(school.customBranding.allowed),
      platformName: String(school.customBranding.platformName || '').trim(),
      logoUrl: String(school.customBranding.logoUrl || '').trim(),
    } : { enabled: false, allowed: false, platformName: '', logoUrl: '' },
    companies: (school.companies || []).map((company) => ({
      id: company.id,
      name: company.name,
      className: company.className || "—",
      leader: company.leader || "—",
      points: safeNumber(company.points),
      early: safeNumber(company.early),
      behavior: safeNumber(company.behavior, 100),
      initiatives: safeNumber(company.initiatives),
    })),
    messaging: hydrateMessagingCenter(school?.messaging),
    leavePasses: getLeavePasses(school).map((item) => ({
      ...item,
      id: item?.id || `leave-${Date.now()}`,
      status: item?.status || "created",
      createdAt: item?.createdAt || new Date().toISOString(),
      destination: item?.destination || "agent",
      reason: item?.reason || "",
      note: item?.note || "",
      studentName: item?.studentName || "طالب",
      teacherName: item?.teacherName || "المعلم",
      teacherMobile: String(item?.teacherMobile || "").trim(),
      guardianName: item?.guardianName || "",
      guardianMobile: String(item?.guardianMobile || "").trim(),
      viewedAt: item?.viewedAt || "",
      approvedAt: item?.approvedAt || "",
      approvedByName: item?.approvedByName || "",
      completedAt: item?.completedAt || "",
      completedByName: item?.completedByName || "",
      passLink: item?.passLink || buildLeavePassLink(item?.id || `leave-${Date.now()}`),
    })),
    students: (school.students || []).map((student) => ({
      ...student,
      nationalId: student.nationalId || `AUTO-${student.id}`,
      studentNumber: student.studentNumber || `${school.code.split("-")[0]}-${String(student.id).padStart(4, "0")}`,
      barcode: sanitizeBarcodeValue(student.barcode || createBarcode(school.code, student.id)),
      faceReady: Boolean(student.faceReady),
      facePhoto: student.facePhoto || "",
      faceSignature: Array.isArray(student.faceSignature) ? student.faceSignature : [],
      status: student.status || "في الوقت",
      attendanceRate: safeNumber(student.attendanceRate, 100),
      points: safeNumber(student.points),
    })),
    // معالجة structure.classrooms.students لحفظ facePhoto و faceReady بشكل صحيح
    structure: school.structure ? {
      ...school.structure,
      classrooms: Array.isArray(school.structure.classrooms) ? school.structure.classrooms.map((classroom) => ({
        ...classroom,
        students: Array.isArray(classroom.students) ? classroom.students.map((student) => ({
          ...student,
          faceReady: Boolean(student.faceReady || student.facePhoto),
          facePhoto: student.facePhoto || "",
          faceSignature: Array.isArray(student.faceSignature) ? student.faceSignature : [],
        })) : [],
      })) : [],
    } : school.structure,
  }));
}


// سطر 1539 من App.jsx الأصلي
export function hydrateScanLog(logs) {
  return (logs || []).map((item, index) => ({
    id: item.id || Date.now() + index,
    schoolId: item.schoolId,
    studentId: item.studentId || null,
    companyId: item.companyId || null,
    student: item.student || "غير معروف",
    barcode: item.barcode || "—",
    date: item.date || toArabicDate(new Date(item.isoDate || Date.now())),
    isoDate: item.isoDate || getTodayIso(),
    time: item.time || "00:00",
    method: item.method || "QR",
    result: item.result || "غير معروف",
    deltaPoints: safeNumber(item.deltaPoints),
  }));
}


// سطر 1556 من App.jsx الأصلي
export function hydrateActionCatalog(actions) {
  const labels = { rewards: "مكافأة", violations: "مخالفة", programs: "برنامج" };
  const normalizePoints = (mode, value) => {
    if (mode === "violations") return -Math.abs(safeNumber(value, -1));
    return Math.abs(safeNumber(value, 1));
  };

  const mapItems = (items, fallback, mode) => (Array.isArray(items) && items.length ? items : fallback).map((item, index) => ({
    ...item,
    id: item.id || `${mode}-${index + 1}`,
    title: item.title || `${labels[mode]} ${index + 1}`,
    points: normalizePoints(mode, item.points),
    description: item.description || "",
    active: item.active !== false, // افتراضياً مفعّل ما لم يُعطَّل صراحةً
  }));

  return {
    rewards: mapItems(actions?.rewards, defaultActionCatalog.rewards, "rewards"),
    violations: mapItems(actions?.violations, defaultActionCatalog.violations, "violations"),
    programs: mapItems(actions?.programs, defaultActionCatalog.programs, "programs"),
  };
}


// سطر 1578 من App.jsx الأصلي
export function hydrateActionLog(logs) {
  return (logs || []).map((item, index) => ({
    id: item.id || Date.now() + index,
    schoolId: item.schoolId || null,
    studentId: item.studentId || null,
    companyId: item.companyId || null,
    student: item.student || "غير معروف",
    actorName: item.actorName || "مستخدم النظام",
    actorRole: item.actorRole || "teacher",
    method: item.method || "يدوي",
    actionType: item.actionType === "violation" ? "violation" : "reward",
    actionTitle: item.actionTitle || "إجراء",
    note: item.note || "",
    date: item.date || toArabicDate(new Date(item.isoDate || Date.now())),
    isoDate: item.isoDate || getTodayIso(),
    time: item.time || "00:00",
    deltaPoints: safeNumber(item.deltaPoints),
  }));
}


// سطر 1598 من App.jsx الأصلي
export function hydrateGateSyncCenterEvents(items = []) {
  return (Array.isArray(items) ? items : [])
    .map((item, index) => ({
      id: item?.id || `gate-sync-${Date.now()}-${index}`,
      schoolId: item?.schoolId ?? null,
      gateId: item?.gateId ?? null,
      gateName: item?.gateName || item?.gate || "بوابة المدرسة",
      status: String(item?.status || "pending").trim().toLowerCase(),
      studentName: item?.studentName || item?.student || "",
      barcode: item?.barcode || item?.studentBarcode || item?.code || "",
      method: item?.method || item?.captureMethod || "QR",
      capturedAt: item?.capturedAt || item?.capturedAtIso || item?.createdAt || "",
      capturedAtLocal: item?.capturedAtLocal || item?.capturedAt || item?.capturedAtIso || "",
      syncedAt: item?.syncedAt || item?.processedAt || item?.updatedAt || "",
      operationId: item?.operationId || item?.clientOperationId || item?.id || "",
      message: item?.message || item?.result || item?.reason || "",
      createdAt: item?.createdAt || item?.capturedAt || item?.syncedAt || "",
      source: item?.source || item?.syncSource || "gate-device",
    }))
    .sort((a, b) => String(b.syncedAt || b.createdAt || b.capturedAt || '').localeCompare(String(a.syncedAt || a.createdAt || a.capturedAt || '')));
}


// سطر 1620 من App.jsx الأصلي
export function createDefaultState() {
  const schools = hydrateSchools(initialSchools);
  return {
    version: BACKUP_VERSION,
    schools,
    users: createDefaultUsers(schools),
    currentUserId: null,
    selectedSchoolId: schools[0]?.id || 1,
    activePage: "dashboard",
    attendanceMethod: "barcode",
    scanLog: hydrateScanLog(initialScanLog),
    actionLog: [],
    gateSyncEvents: [],
    settings: {
      ...defaultSettings,
      policy: { ...defaultSettings.policy },
      points: { ...defaultSettings.points },
      attendancePointsSystem: { ...defaultSettings.attendancePointsSystem },
      devices: { ...defaultSettings.devices },
      actions: hydrateActionCatalog(defaultSettings.actions),
      auth: {
        ...defaultSettings.auth,
        delivery: { ...defaultSettings.auth.delivery },
        targeting: { ...defaultSettings.auth.targeting },
        email: { ...defaultSettings.auth.email },
      },
    },
    notifications: [
      { id: 1, title: "جاهزية النظام", body: "تم تأسيس المنصة على هيكل متعدد المدارس مع مستخدمين وصلاحيات قابلة للتوسع.", time: "الآن" },
    ],
  };
}


// سطر 1653 من App.jsx الأصلي
export function buildHydratedClientState(parsed = {}, uiState = {}) {
  // [FIX-v1.8.2] استخدام مصفوفة فارغة بدلاً من initialSchools عند غياب البيانات
  // السبب: initialSchools تحتوي بيانات تجريبية تُرسل للخادم وتُصفِّر بيانات المدارس الحقيقية
  const schools = hydrateSchools(parsed.schools?.length ? parsed.schools : []);
  const defaults = createDefaultState();
  return {
    ...defaults,
    schools,
    users: hydrateUsers(parsed.users?.length ? parsed.users : createDefaultUsers(schools), schools),
    currentUserId: uiState.currentUserId || null,
    selectedSchoolId: uiState.selectedSchoolId || schools[0]?.id || 1,
    activePage: uiState.activePage || "dashboard",
    attendanceMethod: uiState.attendanceMethod || "barcode",
    scanLog: hydrateScanLog(parsed.scanLog?.length ? parsed.scanLog : initialScanLog),
    actionLog: hydrateActionLog(parsed.actionLog || []),
    gateSyncEvents: hydrateGateSyncCenterEvents(Array.isArray(parsed.gateSyncEvents) ? parsed.gateSyncEvents : defaults.gateSyncEvents),
    settings: {
      ...defaultSettings,
      ...(parsed.settings || {}),
      policy: { ...defaultSettings.policy, ...(parsed.settings?.policy || {}) },
      points: { ...defaultSettings.points, ...(parsed.settings?.points || {}) },
      attendancePointsSystem: { ...defaultSettings.attendancePointsSystem, ...(parsed.settings?.attendancePointsSystem || {}) },
      teacherPoints: { ...defaultSettings.teacherPoints, ...(parsed.settings?.teacherPoints || {}) },
      devices: { ...defaultSettings.devices, ...(parsed.settings?.devices || {}) },
      actions: hydrateActionCatalog(parsed.settings?.actions || defaultSettings.actions),
      subjectBank: Array.isArray(parsed.settings?.subjectBank) ? parsed.settings.subjectBank : defaultSettings.subjectBank,
      weeklyTimetable: Array.isArray(parsed.settings?.weeklyTimetable) ? parsed.settings.weeklyTimetable : defaultSettings.weeklyTimetable,
      slotDefinitions: Array.isArray(parsed.settings?.slotDefinitions) ? parsed.settings.slotDefinitions : defaultSettings.slotDefinitions,
      auth: {
        ...defaultSettings.auth,
        ...(parsed.settings?.auth || {}),
        delivery: { ...defaultSettings.auth.delivery, ...(parsed.settings?.auth?.delivery || {}) },
        targeting: { ...defaultSettings.auth.targeting, ...(parsed.settings?.auth?.targeting || {}) },
        email: { ...defaultSettings.auth.email, ...(parsed.settings?.auth?.email || {}) },
        integrations: {
          sms: { ...defaultSettings.auth.integrations.sms, ...(parsed.settings?.auth?.integrations?.sms || {}) },
          whatsapp: { ...defaultSettings.auth.integrations.whatsapp, ...(parsed.settings?.auth?.integrations?.whatsapp || {}) },
        },
        security: {
          ...defaultSettings.auth.security,
          ...(parsed.settings?.auth?.security || {}),
          notificationChannels: { ...defaultSettings.auth.security.notificationChannels, ...(parsed.settings?.auth?.security?.notificationChannels || {}) },
        },
      },
    },
    notifications: Array.isArray(parsed.notifications) ? parsed.notifications : defaults.notifications,
  };
}


// سطر 1700 من App.jsx الأصلي
export function loadUiState() {
  if (typeof window === "undefined") return {};
  try {
    const raw = window.localStorage.getItem(UI_STATE_KEY);
    if (raw) return JSON.parse(raw);
    const legacy = window.localStorage.getItem(STORAGE_KEY);
    if (!legacy) return {};
    const parsed = JSON.parse(legacy);
    return {
      currentUserId: parsed.currentUserId || null,
      selectedSchoolId: parsed.selectedSchoolId || null,
      activePage: parsed.activePage || "dashboard",
      attendanceMethod: parsed.attendanceMethod || "barcode",
    };
  } catch {
    return {};
  }
}


// سطر 1719 من App.jsx الأصلي
export function loadServerCache() {
  if (typeof window === "undefined") return {};
  try {
    const raw = window.localStorage.getItem(SERVER_CACHE_KEY);
    if (raw) return JSON.parse(raw);
    const legacy = window.localStorage.getItem(STORAGE_KEY);
    if (!legacy) return {};
    return JSON.parse(legacy);
  } catch {
    return {};
  }
}


// سطر 1732 من App.jsx الأصلي
export function loadPersistedState() {
  return buildHydratedClientState(loadServerCache(), loadUiState());
}


// سطر 1753 من App.jsx الأصلي
export function saveUiState(payload) {
  if (typeof window === "undefined") return;
  safeLocalStorageSetItem(UI_STATE_KEY, JSON.stringify(payload));
}


// سطر 1758 من App.jsx الأصلي
export function saveServerCache(payload) {
  if (typeof window === "undefined") return;
  // نحفظ فقط البيانات الخفيفة (settings, notifications) لتجنب QuotaExceededError على Safari iOS
  // البيانات الضخمة (schools, users, scanLog, actionLog) تُجلب من الخادم عند كل تحميل
  const slim = {
    version: payload.version,
    settings: payload.settings,
    notifications: payload.notifications,
  };
  safeLocalStorageSetItem(SERVER_CACHE_KEY, JSON.stringify(slim));
}


// سطر 1770 من App.jsx الأصلي
export function saveSchoolStructureViewState(payload) {
  if (typeof window === "undefined") return;
  window.sessionStorage.setItem(SCHOOL_STRUCTURE_VIEW_KEY, JSON.stringify(payload || {}));
}


// سطر 1775 من App.jsx الأصلي
export function readSchoolStructureViewState() {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.sessionStorage.getItem(SCHOOL_STRUCTURE_VIEW_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}


// سطر 1785 من App.jsx الأصلي
export function clearSchoolStructureViewState() {
  if (typeof window === "undefined") return;
  window.sessionStorage.removeItem(SCHOOL_STRUCTURE_VIEW_KEY);
}


// سطر 1827 من App.jsx الأصلي
export function getSessionToken() {
  if (typeof window === "undefined") return "";
  return window.localStorage.getItem(SESSION_TOKEN_KEY) || "";
}


// سطر 1832 من App.jsx الأصلي
export function setSessionToken(token) {
  if (typeof window === "undefined") return;
  if (token) safeLocalStorageSetItem(SESSION_TOKEN_KEY, token);
  else window.localStorage.removeItem(SESSION_TOKEN_KEY);
}


// سطر 1857 من App.jsx الأصلي
export function buildWsUrl(path) {
  if (typeof window === "undefined") return path;
  const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
  return `${protocol}//${window.location.host}${path}`;
}


// سطر 1863 من App.jsx الأصلي
export function getGateOfflineQueueKey(token) {
  return `${GATE_OFFLINE_QUEUE_PREFIX}:${token || "unknown"}`;
}


// سطر 1867 من App.jsx الأصلي
export function readGateOfflineQueue(token) {
  if (typeof window === "undefined") return [];
  try {
    const parsed = JSON.parse(window.localStorage.getItem(getGateOfflineQueueKey(token)) || "[]");
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}


// سطر 1877 من App.jsx الأصلي
export function writeGateOfflineQueue(token, queue) {
  if (typeof window === "undefined") return [];
  const safeQueue = Array.isArray(queue) ? queue : [];
  window.localStorage.setItem(getGateOfflineQueueKey(token), JSON.stringify(safeQueue));
  return safeQueue;
}


// سطر 1884 من App.jsx الأصلي
export function enqueueGateOfflineScan(token, operation) {
  const queue = readGateOfflineQueue(token);
  queue.push(operation);
  writeGateOfflineQueue(token, queue);
  return queue;
}


// سطر 1891 من App.jsx الأصلي
export function removeGateOfflineQueueItem(token, operationId) {
  const next = readGateOfflineQueue(token).filter((item) => item.id !== operationId);
  writeGateOfflineQueue(token, next);
  return next;
}


// سطر 1897 من App.jsx الأصلي
export function getGateOfflineQueueSummary(token) {
  const queue = readGateOfflineQueue(token);
  return {
    total: queue.length,
    earliestAt: queue.length ? queue[0]?.capturedAt || queue[0]?.createdAt || '' : '',
    latestAt: queue.length ? queue[queue.length - 1]?.capturedAt || queue[queue.length - 1]?.createdAt || '' : '',
    items: queue.slice(-5).reverse(),
  };
}


// سطر 1908 من App.jsx الأصلي
export function getGateSyncLogKey(token) {
  return `${GATE_SYNC_LOG_PREFIX}:${token || "unknown"}`;
}


// سطر 1912 من App.jsx الأصلي
export function readGateSyncLog(token) {
  if (typeof window === "undefined") return [];
  try {
    const parsed = JSON.parse(window.localStorage.getItem(getGateSyncLogKey(token)) || "[]");
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}


// سطر 1922 من App.jsx الأصلي
export function writeGateSyncLog(token, items) {
  if (typeof window === "undefined") return [];
  const safeItems = Array.isArray(items) ? items.slice(0, 150) : [];
  window.localStorage.setItem(getGateSyncLogKey(token), JSON.stringify(safeItems));
  return safeItems;
}


// سطر 1929 من App.jsx الأصلي
export function appendGateSyncLog(token, entry) {
  const current = readGateSyncLog(token);
  current.unshift({ id: entry?.id || `gate-log-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`, createdAt: new Date().toISOString(), ...entry });
  return writeGateSyncLog(token, current);
}


// سطر 1935 من App.jsx الأصلي
export function clearGateSyncLog(token) {
  return writeGateSyncLog(token, []);
}


// سطر 1939 من App.jsx الأصلي
export function getGateSyncLogSummary(token) {
  const items = readGateSyncLog(token);
  const summary = { total: items.length, pending: 0, synced: 0, duplicate: 0, rejected: 0, error: 0, cleared: 0, items: items.slice(0, 10) };
  items.forEach((item) => {
    const status = String(item?.status || '').toLowerCase();
    if (status === 'pending') summary.pending += 1;
    else if (status === 'synced') summary.synced += 1;
    else if (status === 'duplicate') summary.duplicate += 1;
    else if (status === 'rejected') summary.rejected += 1;
    else if (status === 'cleared') summary.cleared += 1;
    else summary.error += 1;
  });
  return summary;
}


// سطر 1954 من App.jsx الأصلي
export function removeGateSyncLogItem(token, logId) {
  const next = readGateSyncLog(token).filter((item) => item.id !== logId);
  return writeGateSyncLog(token, next);
}


// سطر 1959 من App.jsx الأصلي
export function getGateSyncStatusMeta(status) {
  switch (String(status || '').toLowerCase()) {
    case 'pending':
      return { label: 'بانتظار', tone: 'amber' };
    case 'synced':
      return { label: 'تمت', tone: 'green' };
    case 'duplicate':
      return { label: 'مكرر', tone: 'blue' };
    case 'rejected':
      return { label: 'مرفوض', tone: 'rose' };
    case 'cleared':
      return { label: 'تم تفريغه', tone: 'slate' };
    default:
      return { label: 'خطأ', tone: 'amber' };
  }
}


// سطر 1976 من App.jsx الأصلي
export function formatLocalGateTimestamp(value) {
  if (!value) return "—";
  try {
    return new Date(value).toLocaleString('ar-SA', { hour12: false, year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit' });
  } catch {
    return String(value);
  }
}


// سطر 1985 من App.jsx الأصلي
export function downloadFile(filename, content, mimeType) {
  const payload = String(mimeType || '').includes('csv') ? `﻿${content}` : content;
  const blob = new Blob([payload], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}


// سطر 1998 من App.jsx الأصلي
export function buildCsv(rows, columns) {
  const escapeCell = (value) => `"${String(value ?? "").replace(/"/g, '""')}"`;
  const header = columns.map((col) => escapeCell(col.label)).join(",");
  const body = rows
    .map((row) => columns.map((col) => escapeCell(typeof col.render === "function" ? col.render(row) : row[col.key])).join(","))
    .join("\n");
  return `${header}\n${body}`;
}


// سطر 2007 من App.jsx الأصلي
export function exportRowsToWorkbook(filename, sheetName, rows, columns) {
  const worksheetRows = [
    columns.map((col) => col.label),
    ...rows.map((row) => columns.map((col) => typeof col.render === "function" ? col.render(row) : row[col.key])),
  ];
  const worksheet = XLSX.utils.aoa_to_sheet(worksheetRows);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, sheetName || "Sheet1");
  XLSX.writeFile(workbook, filename);
}


// سطر 2018 من App.jsx الأصلي
export function escapePrintHtml(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}


// سطر 2027 من App.jsx الأصلي
export function buildPrintSummaryStats(cards = []) {
  if (!Array.isArray(cards) || !cards.length) return '';
  return `<div class="stats">${cards.map((card) => `<div class="stat ${escapePrintHtml(card.tone || '')}"><div class="k">${escapePrintHtml(card.label || '')}</div><div class="v">${escapePrintHtml(card.value || '')}</div>${card.note ? `<div class="n">${escapePrintHtml(card.note)}</div>` : ''}</div>`).join('')}</div>`;
}


// سطر 2032 من App.jsx الأصلي
export function printHtmlContent(title, bodyHtml, options = {}) {
  if (typeof window === "undefined") return;
  const printWindow = window.open("", "_blank", "width=1280,height=900");
  if (!printWindow) return;
  const accent = String(options.accent || '#0f172a');
  const subtitle = options.subtitle ? `<div class="meta">${escapePrintHtml(options.subtitle)}</div>` : '';
  const summaryHtml = buildPrintSummaryStats(options.summaryCards || []);
  const legendHtml = Array.isArray(options.legend) && options.legend.length
    ? `<div class="legend">${options.legend.map((item) => `<span class="legend-pill ${escapePrintHtml(item.tone || '')}">${escapePrintHtml(item.label || '')}</span>`).join('')}</div>`
    : '';
  printWindow.document.write(`<!doctype html><html lang="ar" dir="rtl"><head><meta charset="utf-8" /><title>${escapePrintHtml(title)}</title><style>
    :root{--accent:${accent};--accent-soft:color-mix(in srgb, ${accent} 10%, white);--line:#cbd5e1;--text:#0f172a;--muted:#475569;--panel:#f8fafc}
    *{box-sizing:border-box;-webkit-print-color-adjust:exact;print-color-adjust:exact}
    body{font-family:"Tahoma","Arial",sans-serif;background:#fff;color:var(--text);padding:24px;direction:rtl}
    .wrap{max-width:1180px;margin:0 auto}
    .hero{border:1px solid var(--line);background:linear-gradient(180deg,var(--accent-soft),#fff);padding:18px 20px;border-radius:20px;margin-bottom:18px}
    h1{font-size:28px;margin:0 0 8px;font-weight:800;color:var(--accent)}
    h2{font-size:20px;margin:24px 0 8px;font-weight:800;color:#0f172a}
    .meta{color:var(--muted);margin-bottom:14px;font-size:14px}
    .legend{display:flex;flex-wrap:wrap;gap:8px;margin-top:10px}
    .legend-pill{display:inline-flex;align-items:center;gap:6px;padding:6px 10px;border-radius:999px;font-size:12px;font-weight:700;border:1px solid var(--line);background:#fff}
    table{width:100%;border-collapse:separate;border-spacing:0;margin-top:18px;border:1px solid var(--line);border-radius:18px;overflow:hidden}
    th,td{border-bottom:1px solid #e2e8f0;padding:10px 12px;text-align:right;font-size:13px;vertical-align:top}
    th{background:var(--accent);color:#fff;font-weight:800}
    tbody tr:nth-child(even) td{background:#fafcff}
    tbody tr:last-child td{border-bottom:none}
    .stats{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:12px;margin:18px 0}
    .stat{border:1px solid #e2e8f0;border-radius:16px;padding:14px;background:#fff}
    .stat .k{font-size:12px;color:#64748b}
    .stat .v{font-size:24px;font-weight:800;margin-top:6px}
    .stat .n{font-size:11px;color:#64748b;margin-top:4px}
    .tone-blue{background:#eff6ff}.tone-green{background:#ecfdf5}.tone-amber{background:#fffbeb}.tone-rose{background:#fff1f2}.tone-violet{background:#f5f3ff}.tone-slate{background:#f8fafc}
    .pill{display:inline-block;padding:4px 10px;border-radius:999px;font-size:11px;font-weight:800;border:1px solid transparent}
    .pill-green{background:#ecfdf5;color:#065f46;border-color:#a7f3d0}.pill-rose{background:#fff1f2;color:#9f1239;border-color:#fecdd3}.pill-amber{background:#fffbeb;color:#92400e;border-color:#fde68a}.pill-blue{background:#eff6ff;color:#1d4ed8;border-color:#bfdbfe}.pill-slate{background:#f8fafc;color:#334155;border-color:#cbd5e1}.pill-violet{background:#f5f3ff;color:#6d28d9;border-color:#ddd6fe}
    .row-positive td{background:#f0fdf4 !important}.row-negative td{background:#fff1f2 !important}.row-warning td{background:#fffbeb !important}.row-info td{background:#eff6ff !important}.row-highlight td{background:#f5f3ff !important}
    .section-gap{margin-top:24px}
    @media print{body{padding:0}.wrap{max-width:none}.no-print{display:none}}
  </style></head><body><div class="wrap"><div class="hero"><h1>${escapePrintHtml(title)}</h1>${subtitle}${summaryHtml}${legendHtml}</div>${bodyHtml}</div></body></html>`);
  printWindow.document.close();
  printWindow.focus();
  setTimeout(() => {
    printWindow.print();
  }, 250);
}


// سطر 2078 من App.jsx الأصلي
export function normalizeArabicHeader(value) {
  return String(value || "")
    .toLowerCase()
    .replace(/[\u0640]/g, "")
    .replace(/[أإآ]/g, "ا")
    .replace(/ة/g, "ه")
    .replace(/ى/g, "ي")
    .replace(/[\s\-_\/\\|()\[\]{}]+/g, "")
    .replace(/["'`~!@#$%^&*+=:;,.؟،]/g, "")
    .trim();
}


// سطر 2103 من App.jsx الأصلي
export function normalizeImportRow(row) {
  const normalized = {};
  Object.entries(row || {}).forEach(([key, value]) => {
    normalized[normalizeArabicHeader(key)] = typeof value === "string" ? value.trim() : value;
  });
  return normalized;
}


// سطر 2111 من App.jsx الأصلي
export function pickImportValue(normalizedRow, aliases) {
  for (const alias of aliases || []) {
    const value = normalizedRow[alias];
    if (value !== undefined && value !== null && String(value).trim() !== "") return String(value).trim();
  }
  return "";
}


// سطر 2119 من App.jsx الأصلي
export function buildStudentNumberFromImport(schoolCode, serial, provided) {
  if (provided && String(provided).trim()) return String(provided).trim();
  return `${schoolCode.split("-")[0]}-${String(serial).padStart(4, "0")}`;
}


// سطر 2124 من App.jsx الأصلي
export function buildTemplateStudentsCsv() {
  return buildCsv([
    { name: "أحمد محمد علي", nationalId: "1100001111", studentNumber: "240001", grade: "الأول متوسط", className: "1/1", companyName: "شركة الأمل" },
    { name: "سعد عبدالله سالم", nationalId: "1100001112", studentNumber: "240002", grade: "الأول متوسط", className: "1/2", companyName: "شركة التميز" },
  ], [
    { key: "name", label: "اسم الطالب" },
    { key: "nationalId", label: "رقم الهوية" },
    { key: "studentNumber", label: "رقم الطالب" },
    { key: "grade", label: "الصف" },
    { key: "className", label: "الفصل" },
    { key: "companyName", label: "الشركة" },
  ]);
}


// سطر 2138 من App.jsx الأصلي
export function getPublicModeFromLocation() {
  if (typeof window === "undefined") return null;
  const params = new URLSearchParams(window.location.search);
  const gateToken = params.get("gate");
  const screenToken = params.get("screen");
  if (gateToken) return { type: "gate", token: gateToken };
  if (screenToken) return { type: "screen", token: screenToken };
  return null;
}


// سطر 2148 من App.jsx الأصلي
export function buildPublicLink(kind, token) {
  if (typeof window === "undefined") return "";
  const url = new URL(window.location.origin + window.location.pathname);
  url.searchParams.set(kind, token);
  return url.toString();
}


// سطر 2155 من App.jsx الأصلي
export function getLessonSessionIdFromLocation() {
  if (typeof window === "undefined") return "";
  const params = new URLSearchParams(window.location.search);
  return String(params.get("lessonSession") || '').trim();
}


// سطر 2161 من App.jsx الأصلي
export function buildLessonSessionLink(sessionId) {
  if (typeof window === "undefined") return "";
  const url = new URL(window.location.origin + window.location.pathname);
  url.searchParams.set('lessonSession', String(sessionId || ''));
  return url.toString();
}


// سطر 2168 من App.jsx الأصلي
export function clearLessonSessionParam() {
  if (typeof window === "undefined") return;
  const url = new URL(window.location.href);
  url.searchParams.delete('lessonSession');
  window.history.replaceState({}, '', url.toString());
}


// سطر 2175 من App.jsx الأصلي
export function getLeavePassIdFromLocation() {
  if (typeof window === "undefined") return "";
  const params = new URLSearchParams(window.location.search);
  return String(params.get("leavePass") || "").trim();
}


// سطر 2181 من App.jsx الأصلي
export function buildLeavePassLink(leavePassId) {
  if (typeof window === "undefined") return "";
  const url = new URL(window.location.origin + '/teacher');
  url.searchParams.set("leavePass", String(leavePassId || ""));
  return url.toString();
}


// سطر 2188 من App.jsx الأصلي
export function clearLeavePassParam() {
  if (typeof window === "undefined") return;
  const url = new URL(window.location.href);
  url.searchParams.delete("leavePass");
  window.history.replaceState({}, "", url.toString());
}


// سطر 2195 من App.jsx الأصلي
export function getLeavePasses(school) {
  return Array.isArray(school?.leavePasses) ? school.leavePasses : [];
}


// سطر 2199 من App.jsx الأصلي
export function getLeavePassTimeline(pass) {
  return Array.isArray(pass?.timeline) ? [...pass.timeline].sort((a, b) => String(b?.at || '').localeCompare(String(a?.at || ''))) : [];
}


// سطر 2203 من App.jsx الأصلي
export function createLeavePassEvent(type, actorName, note = '') {
  return {
    id: `evt-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    type: String(type || 'updated'),
    actorName: String(actorName || 'مستخدم النظام').trim() || 'مستخدم النظام',
    note: String(note || '').trim(),
    at: new Date().toISOString(),
  };
}


// سطر 2213 من App.jsx الأصلي
export function getLeavePassEventLabel(type) {
  switch (String(type || '')) {
    case 'created': return 'إنشاء الطلب';
    case 'sent-manual-teacher': return 'إرسال يدوي للمعلم';
    case 'sent-system-teacher': return 'إرسال بالنظام للمعلم';
    case 'sent-manual-guardian': return 'إشعار يدوي لولي الأمر';
    case 'sent-system-guardian': return 'إشعار بالنظام لولي الأمر';
    case 'notified-agent': return 'إشعار الوكيل';
    case 'notified-counselor': return 'إشعار المرشد';
    case 'viewed': return 'اطلاع المعلم';
    case 'approved-agent': return 'اعتماد الوكيل';
    case 'approved-counselor': return 'اعتماد المرشد';
    case 'released-guardian': return 'تسليم مع ولي الأمر';
    case 'completed': return 'إقفال مكتمل';
    case 'cancelled': return 'إلغاء الطلب';
    default: return 'تحديث';
  }
}


// سطر 2232 من App.jsx الأصلي
export function getLeavePassStatusLabel(status) {
  switch (String(status || "")) {
    case "draft": return "مسودة";
    case "created": return "جديد";
    case "sent-system": return "أرسل بالنظام";
    case "sent-manual": return "أرسل يدويًا";
    case "viewed": return "اطلع المعلم";
    case "approved-agent": return "اعتمده الوكيل";
    case "approved-counselor": return "اعتمده المرشد";
    case "released-guardian": return "سُلّم مع ولي الأمر";
    case "completed": return "تم التنفيذ";
    case "cancelled": return "ملغي";
    default: return "—";
  }
}


// سطر 2248 من App.jsx الأصلي
export function getLeavePassStatusTone(status) {
  switch (String(status || "")) {
    case "completed":
    case "released-guardian": return "emerald";
    case "approved-agent":
    case "approved-counselor":
    case "viewed": return "sky";
    case "sent-system":
    case "sent-manual": return "amber";
    case "cancelled": return "rose";
    case "draft": return "slate";
    default: return "blue";
  }
}


// سطر 2263 من App.jsx الأصلي
export function getLeavePassAgeMinutes(pass) {
  const base = new Date(pass?.updatedAt || pass?.approvedAt || pass?.viewedAt || pass?.createdAt || '').getTime();
  if (!base || Number.isNaN(base)) return 0;
  return Math.max(0, Math.round((Date.now() - base) / 60000));
}


// سطر 2269 من App.jsx الأصلي
export function getLeavePassQueueMeta(pass) {
  const status = String(pass?.status || 'created');
  const ageMinutes = getLeavePassAgeMinutes(pass);
  if (['completed', 'cancelled'].includes(status)) {
    return { key: 'closed', label: 'مغلق', tone: 'emerald', cardClass: 'border-emerald-200 bg-emerald-50', ageMinutes };
  }
  if (['created', 'sent-system', 'sent-manual'].includes(status)) {
    if (ageMinutes >= 10) return { key: 'overdue-teacher', label: 'متأخر لدى المعلم', tone: 'rose', cardClass: 'border-rose-200 bg-rose-50', ageMinutes };
    if (ageMinutes >= 5) return { key: 'attention-teacher', label: 'بانتظار اطلاع المعلم', tone: 'amber', cardClass: 'border-amber-200 bg-amber-50', ageMinutes };
    return { key: 'new', label: 'جديد', tone: 'blue', cardClass: 'border-sky-200 bg-sky-50', ageMinutes };
  }
  if (['viewed', 'approved-agent', 'approved-counselor', 'released-guardian'].includes(status)) {
    if (ageMinutes >= 20) return { key: 'overdue-close', label: 'بانتظار الإقفال', tone: 'rose', cardClass: 'border-rose-200 bg-rose-50', ageMinutes };
    if (ageMinutes >= 10) return { key: 'attention-close', label: 'قيد التنفيذ', tone: 'amber', cardClass: 'border-amber-200 bg-amber-50', ageMinutes };
    return { key: 'in-progress', label: 'قيد التنفيذ', tone: 'sky', cardClass: 'border-sky-200 bg-sky-50', ageMinutes };
  }
  return { key: 'new', label: 'جديد', tone: 'blue', cardClass: 'border-sky-200 bg-sky-50', ageMinutes };
}


// سطر 2288 من App.jsx الأصلي
export function getLeavePassElapsedLabel(pass) {
  const ageMinutes = getLeavePassAgeMinutes(pass);
  if (ageMinutes < 1) return 'الآن';
  if (ageMinutes < 60) return `منذ ${formatEnglishDigits(ageMinutes)} دقيقة`;
  const hours = Math.floor(ageMinutes / 60);
  const mins = ageMinutes % 60;
  return mins ? `منذ ${formatEnglishDigits(hours)}س ${formatEnglishDigits(mins)}د` : `منذ ${formatEnglishDigits(hours)} ساعة`;
}


// سطر 2297 من App.jsx الأصلي
export function getLeavePassDestinationLabel(destination) {
  switch (String(destination || "")) {
    case "agent": return "الوكيل";
    case "counselor": return "المرشد";
    case "guardian": return "الخروج مع ولي الأمر";
    default: return "—";
  }
}


// سطر 2306 من App.jsx الأصلي
export function getLessonAttendanceSessions(school) {
  return Array.isArray(school?.lessonAttendanceSessions) ? school.lessonAttendanceSessions : [];
}


// سطر 2310 من App.jsx الأصلي
export function getRewardStore(school) {
  return {
    items: Array.isArray(school?.rewardStore?.items) ? school.rewardStore.items : [],
    parentProposals: Array.isArray(school?.rewardStore?.parentProposals) ? school.rewardStore.parentProposals : [],
    redemptionRequests: Array.isArray(school?.rewardStore?.redemptionRequests) ? school.rewardStore.redemptionRequests : [],
    notifications: Array.isArray(school?.rewardStore?.notifications) ? school.rewardStore.notifications : [],
  };
}


// سطر 2319 من App.jsx الأصلي
export function createRewardStoreNotification(payload = {}) {
  return {
    id: payload.id || `reward-note-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    type: String(payload.type || 'info'),
    title: String(payload.title || 'متجر النقاط').trim() || 'متجر النقاط',
    body: String(payload.body || '').trim(),
    schoolId: payload.schoolId || null,
    studentId: payload.studentId || null,
    itemId: payload.itemId || null,
    itemTitle: payload.itemTitle || '',
    requestId: payload.requestId || null,
    createdAt: payload.createdAt || new Date().toISOString(),
    createdByName: String(payload.createdByName || 'النظام').trim() || 'النظام',
    audience: String(payload.audience || 'admin'),
  };
}


// سطر 2336 من App.jsx الأصلي
export function prependRewardStoreNotification(store, payload = {}) {
  const entry = createRewardStoreNotification(payload);
  return {
    ...store,
    notifications: [entry, ...(Array.isArray(store?.notifications) ? store.notifications : [])].slice(0, 80),
  };
}


// سطر 2344 من App.jsx الأصلي
export function normalizeRewardStoreItem(item = {}) {
  const quantity = Math.max(0, safeNumber(item.quantity ?? item.stockQuantity ?? item.remainingQuantity ?? 0, 0));
  const remainingQuantity = Math.max(0, safeNumber(item.remainingQuantity ?? quantity, quantity));
  const deliveredQuantity = Math.max(0, quantity - remainingQuantity);
  const sourceType = String(item.sourceType || item.source || 'school');
  const donorName = String(item.donorName || item.createdByName || '').trim();
  const approvalStatus = String(item.approvalStatus || item.status || (Number(item.pointsCost || 0) > 0 ? 'active' : 'awaiting_receipt'));
  return {
    ...item,
    quantity,
    remainingQuantity,
    deliveredQuantity,
    sourceType,
    donorName,
    showDonorName: item.showDonorName !== false,
    approvalStatus,
    isActive: item.isActive !== false,
    pointsCost: Math.max(0, safeNumber(item.pointsCost || 0, 0)),
    showOnScreens: item.showOnScreens !== false,
    featured: item.featured === true,
    displayPriority: safeNumber(item.displayPriority || 0, 0),
  };
}


// سطر 2368 من App.jsx الأصلي
export function getRewardStoreDonorLabel(item = {}) {
  const normalized = normalizeRewardStoreItem(item);
  if (normalized.showDonorName && normalized.donorName) return normalized.donorName;
  if (normalized.sourceType === 'parent') return 'ولي أمر';
  if (normalized.sourceType === 'external') return 'متبرع خارجي';
  return 'إدارة المدرسة';
}


// سطر 2376 من App.jsx الأصلي
export function getRewardStoreStatusLabel(status) {
  if (status === 'active') return 'معتمدة في المتجر';
  if (status === 'awaiting_receipt') return 'بانتظار الاستلام';
  if (status === 'received_pending_activation') return 'بانتظار اعتماد المدير';
  if (status === 'depleted') return 'منتهية الكمية';
  if (status === 'rejected') return 'مرفوضة';
  return 'مقترحة';
}


// سطر 2385 من App.jsx الأصلي
export function getApprovedRewardStoreItems(school) {
  return getRewardStore(school).items.map((item) => normalizeRewardStoreItem(item)).filter((item) => item && item.isActive !== false && item.approvalStatus === 'active' && item.remainingQuantity > 0);
}


// سطر 2389 من App.jsx الأصلي
export function buildRewardStoreSummary(school) {
  const store = getRewardStore(school);
  const items = (store.items || []).map((item) => normalizeRewardStoreItem(item));
  const proposals = store.parentProposals || [];
  const pending = proposals.filter((item) => String(item.status || 'pending') === 'pending').length;
  const approvedViaParents = items.filter((item) => String(item.sourceType || '') === 'parent').length;
  const donorNames = new Set(items.map((item) => getRewardStoreDonorLabel(item)).filter(Boolean));
  const redemptionRequests = store.redemptionRequests || [];
  return {
    totalItems: items.length,
    activeItems: items.filter((item) => item.approvalStatus === 'active' && item.isActive !== false).length,
    pendingProposals: pending,
    approvedViaParents,
    donorCount: donorNames.size,
    awaitingReceipt: items.filter((item) => item.approvalStatus === 'awaiting_receipt').length,
    pendingActivation: items.filter((item) => item.approvalStatus === 'received_pending_activation').length,
    totalQuantity: items.reduce((sum, item) => sum + Number(item.quantity || 0), 0),
    remainingQuantity: items.reduce((sum, item) => sum + Number(item.remainingQuantity || 0), 0),
    pendingRedemptions: redemptionRequests.filter((item) => String(item.status || 'pending') === 'pending').length,
    approvedRedemptions: redemptionRequests.filter((item) => String(item.status || '') === 'approved').length,
    deliveredRedemptions: redemptionRequests.filter((item) => String(item.status || '') === 'delivered').length,
    schoolSourceCount: items.filter((item) => String(item.sourceType || '') === 'school').reduce((sum, item) => sum + Number(item.quantity || 0), 0),
    parentSourceCount: items.filter((item) => String(item.sourceType || '') === 'parent').reduce((sum, item) => sum + Number(item.quantity || 0), 0),
    externalSourceCount: items.filter((item) => String(item.sourceType || '') === 'external').reduce((sum, item) => sum + Number(item.quantity || 0), 0),
  };
}


// سطر 2417 من App.jsx الأصلي
export function getRewardStoreDisplayItems(school, screenConfig = null) {
  const settings = screenConfig?.rewardStoreSettings || {};
  const mode = String(settings.mode || 'all');
  const sourceFilter = String(settings.sourceFilter || 'all');
  const maxItems = Math.max(1, Math.min(24, Number(settings.maxItems || 8)));
  let items = getApprovedRewardStoreItems(school).filter((item) => item.showOnScreens !== false);
  if (sourceFilter !== 'all') items = items.filter((item) => String(item.sourceType || '') === sourceFilter);
  if (mode === 'featured') items = items.filter((item) => item.featured === true);
  if (mode === 'marked') items = items.filter((item) => item.showOnScreens !== false);
  items = items.sort((a, b) => Number(b.featured === true) - Number(a.featured === true) || Number(b.displayPriority || 0) - Number(a.displayPriority || 0) || String(a.title || '').localeCompare(String(b.title || ''), 'ar'));
  return items.slice(0, maxItems);
}


// سطر 2430 من App.jsx الأصلي
export function buildRewardStoreScreenSummary(school, screenConfig = null) {
  const summary = buildRewardStoreSummary(school);
  return {
    ...summary,
    items: getRewardStoreDisplayItems(school, screenConfig).map((item) => ({
      id: item.id,
      title: item.title,
      image: item.image || '',
      pointsCost: item.pointsCost || 0,
      quantity: item.quantity || 0,
      remainingQuantity: item.remainingQuantity || 0,
      donorLabel: getRewardStoreDonorLabel(item),
      featured: item.featured === true,
      showOnScreens: item.showOnScreens !== false,
      displayPriority: item.displayPriority || 0,
      sourceType: item.sourceType || 'school',
    })),
    mode: String(screenConfig?.rewardStoreSettings?.mode || 'all'),
    sourceFilter: String(screenConfig?.rewardStoreSettings?.sourceFilter || 'all'),
    maxItems: Math.max(1, Math.min(24, Number(screenConfig?.rewardStoreSettings?.maxItems || 8))),
  };
}


// سطر 2453 من App.jsx الأصلي
export function buildLessonAttendanceSessionLabel(session) {
  const slot = String(session?.slotLabel || session?.slot || 'الحصة').trim();
  const date = String(session?.dateIso || '').trim();
  return [slot, date].filter(Boolean).join(' • ');
}


// سطر 2459 من App.jsx الأصلي
export function getLessonAttendanceSessionStatusTone(status) {
  if (status === 'closed') return 'slate';
  if (status === 'expired') return 'amber';
  return 'green';
}


// سطر 2465 من App.jsx الأصلي
export function getLessonAttendanceSessionStatusLabel(status) {
  if (status === 'closed') return 'مغلقة';
  if (status === 'expired') return 'منتهية';
  return 'مفتوحة';
}


// سطر 2471 من App.jsx الأصلي
export function getClassroomKeyFromCompanyRow(row) {
  if (!row) return '';
  return String(row.source === 'structure' ? `structure:${row.rawId || row.id}` : `school:${row.rawId || row.id}`);
}


// سطر 2476 من App.jsx الأصلي
export function getStudentsForLessonClassroom(school, classroomKey) {
  const key = String(classroomKey || '');
  const students = getUnifiedSchoolStudents(school, { includeArchived: false, preferStructure: true });
  if (!key) return [];
  if (key.startsWith('structure:')) {
    const rawId = key.split(':')[1];
    return students.filter((student) => String(student.classroomId || '') === String(rawId));
  }
  if (key.startsWith('school:')) {
    const rawId = key.split(':')[1];
    return students.filter((student) => String(student.companyId || '') === String(rawId));
  }
  return [];
}


// سطر 2491 من App.jsx الأصلي
export function computeLessonAttendanceSessionSummary(session, school, schoolUsers = []) {
  const submissions = Array.isArray(session?.submissions) ? session.submissions : [];
  const expectedTeachers = (schoolUsers || []).filter((user) => ['teacher', 'principal', 'supervisor', 'superadmin'].includes(String(user?.role || '')) && String(user?.status || 'نشط') === 'نشط');
  const submittedTeacherIds = new Set(submissions.map((item) => String(item.teacherId || '')).filter(Boolean));
  const absentRows = submissions.flatMap((submission) => (Array.isArray(submission.absentStudents) ? submission.absentStudents : []).map((student) => ({
    sessionId: session?.id,
    sessionLabel: buildLessonAttendanceSessionLabel(session),
    className: submission.className || '—',
    teacherName: submission.teacherName || '—',
    studentId: student.id,
    studentName: student.name,
    studentNumber: student.studentNumber || '',
    submittedAt: submission.submittedAt || '',
    acknowledged: submission.acknowledged ? 'نعم' : 'لا',
  })));
  return {
    expectedTeachers: expectedTeachers.length,
    submittedTeachers: submittedTeacherIds.size,
    pendingTeachers: Math.max(expectedTeachers.length - submittedTeacherIds.size, 0),
    classesSubmitted: submissions.length,
    totalPresent: submissions.reduce((sum, item) => sum + Number(item.presentCount || 0), 0),
    totalAbsent: submissions.reduce((sum, item) => sum + Number(item.absentCount || 0), 0),
    totalStudents: submissions.reduce((sum, item) => sum + Number(item.totalStudents || 0), 0),
    absentRows,
    classRows: submissions.map((item) => ({
      name: item.className || '—',
      present: Number(item.presentCount || 0),
      absent: Number(item.absentCount || 0),
    })),
    openedTeachers: submissions.filter((item) => item.opened).length,
    sentTeachers: submittedTeacherIds.size,
  };
}


// سطر 2525 من App.jsx الأصلي
export function summarizeSchoolLiveState(school, scanLog = [], actionLog = []) {
  const today = getTodayIso();
  const unifiedStudents = getUnifiedSchoolStudents(school, { includeArchived: false, preferStructure: true });
  const companyRows = getUnifiedCompanyRows(school, { preferStructure: true });
  const schoolScans = (scanLog || []).filter((item) => item.schoolId === school?.id && item.isoDate === today && !String(item.result || '').includes('فشل') && !String(item.result || '').includes('مسبق'));
  const schoolActions = (actionLog || []).filter((item) => item.schoolId === school?.id && item.isoDate === today);
  // ===== حساب presentToday الموحد: يجمع البوابة + تحضير الحصص بدون تكرار =====
  const gatePresentIds = new Set(schoolScans.map((item) => String(item.studentId)).filter(Boolean));
  const lessonSessionsToday = getLessonAttendanceSessions(school).filter((s) => s.dateIso === today);
  const lessonPresentIds = new Set();
  lessonSessionsToday.forEach((session) => {
    (session.submissions || []).forEach((sub) => {
      (sub.presentStudentIds || []).forEach((id) => lessonPresentIds.add(String(id)));
      const absentSet = new Set((sub.absentStudentIds || []).map(String));
      if (Array.isArray(sub.allStudentIds)) {
        sub.allStudentIds.forEach((id) => { if (!absentSet.has(String(id))) lessonPresentIds.add(String(id)); });
      }
    });
  });
  const unifiedPresentIds = new Set([...gatePresentIds, ...lessonPresentIds]);
  const presentToday = unifiedPresentIds.size;
  const totalStudents = unifiedStudents.length;
  const attendanceRate = totalStudents ? Math.round((presentToday / totalStudents) * 100) : 0;
  const topStudents = [...unifiedStudents]
    .sort((a, b) => Number(b.points || 0) - Number(a.points || 0))
    .slice(0, 5)
    .map((student, index) => ({
      ...student,
      rank: index + 1,
      companyName: student.companyName || student.className || '—',
    }));
  const topCompanies = [...companyRows]
    .sort((a, b) => Number(b.points || 0) - Number(a.points || 0))
    .slice(0, 5)
    .map((company, index) => ({ ...company, rank: index + 1 }));
  const recentAttendance = schoolScans.slice(0, 8);
  const attendanceTrendMap = new Map();
  (scanLog || []).filter((item) => item.schoolId === school?.id).forEach((item) => {
    const existing = attendanceTrendMap.get(item.isoDate) || { day: item.date, attendance: 0, early: 0 };
    if (!String(item.result || '').includes('فشل') && !String(item.result || '').includes('مسبق')) {
      existing.attendance += 1;
      if (String(item.result || '').includes('مبكر')) existing.early += 1;
    }
    attendanceTrendMap.set(item.isoDate, existing);
  });
  const attendanceTrend = [...attendanceTrendMap.entries()].sort((a, b) => a[0].localeCompare(b[0])).slice(-7).map(([, value]) => value);
  return {
    summary: {
      totalStudents,
      presentToday,
      attendanceRate,
      earlyToday: schoolScans.filter((item) => String(item.result).includes('مبكر')).length,
      lateToday: schoolScans.filter((item) => String(item.result).includes('تأخر')).length,
      rewardsToday: schoolActions.filter((item) => item.actionType === 'reward').length,
      violationsToday: schoolActions.filter((item) => item.actionType === 'violation').length,
      programsToday: schoolActions.filter((item) => item.actionType === 'program').length,
    },
    topStudents,
    topCompanies,
    recentAttendance,
    attendanceTrend,
  };
}


// سطر 2589 من App.jsx الأصلي
export function getSchoolAttendanceBinding(school) {
  const hasStructure = schoolHasStructureClassrooms(school);
  const savedMode = school?.structure?.attendanceBinding?.sourceMode;
  return {
    sourceMode: hasStructure ? 'structure' : (savedMode || 'school'),
    linkedClassroomId: school?.structure?.attendanceBinding?.linkedClassroomId ? String(school.structure.attendanceBinding.linkedClassroomId) : "",
  };
}


// سطر 2598 من App.jsx الأصلي
export function buildStructureAttendanceBarcode(school, classroom, student) {
  const schoolCode = String(school?.code || 'SCH').replace(/[^A-Za-z0-9]/g, '').toUpperCase().slice(0, 6) || 'SCH';
  const classroomCode = String(classroom?.name || classroom?.gradeLabel || 'CLS').replace(/\s+/g, '').slice(0, 6).toUpperCase();
  const studentCode = String(student?.identityNumber || student?.id || Date.now()).replace(/[^A-Za-z0-9]/g, '').slice(-8);
  return sanitizeBarcodeValue(`SS-${schoolCode}-${classroomCode}-${studentCode}`);
}


// سطر 2605 من App.jsx الأصلي
export function getAttendanceStudentsSource(school) {
  const binding = getSchoolAttendanceBinding(school);
  if (binding.sourceMode !== 'structure') {
    return {
      sourceMode: 'school',
      linkedClassroomId: '',
      students: school?.students || [],
      total: school?.students?.length || 0,
      classrooms: [],
      label: 'المدرسة كاملة',
    };
  }
  const classrooms = Array.isArray(school?.structure?.classrooms) ? school.structure.classrooms : [];
  const filteredClassrooms = binding.linkedClassroomId
    ? classrooms.filter((item) => String(item.id) === String(binding.linkedClassroomId))
    : classrooms;
  const students = filteredClassrooms.flatMap((classroom) => (Array.isArray(classroom.students) ? classroom.students : [])
    .filter((student) => String(student?.status || 'active') !== 'archived')
    .map((student, index) => ({
      id: `structure-${classroom.id}-${student.id}`,
      rawId: student.id,
      name: student.fullName || 'طالب',
      fullName: student.fullName || 'طالب',
      nationalId: String(student.identityNumber || '').trim(),
      guardianMobile: String(student.guardianMobile || '').trim(),
      barcode: buildStructureAttendanceBarcode(school, classroom, student),
      grade: classroom.gradeLabel || classroom.stageLabel || classroom.stage || '',
      className: classroom.name || classroom.gradeLabel || 'فصل',
      classroomId: String(classroom.id),
      classroomName: classroom.name || classroom.gradeLabel || 'فصل',
      companyName: classroom.companyName || '—',
      companyId: null,
      status: student.status === 'archived' ? 'مؤرشف' : (student.attendanceStatus || 'غير مسجل'),
      attendanceRate: Number(student.attendanceRate || 0),
      points: Number(student.points || 0),
      faceReady: Boolean(student.faceReady || student.facePhoto),
      source: 'structure',
    })));
  return {
    sourceMode: 'structure',
    linkedClassroomId: binding.linkedClassroomId,
    students,
    total: students.length,
    classrooms,
    label: binding.linkedClassroomId ? (filteredClassrooms[0]?.name || 'فصل من الهيكل المدرسي') : 'جميع فصول الهيكل المدرسي',
  };
}


// سطر 2653 من App.jsx الأصلي
export function findLabeledValueFromGrid(grid, label) {
  const target = normalizeArabicHeader(label);
  for (const row of grid || []) {
    const normalizedRow = row.map((cell) => normalizeArabicHeader(cell));
    const index = normalizedRow.findIndex((cell) => cell === target);
    if (index >= 0) {
      const candidates = [row[index - 1], row[index - 2], row[index + 1], row[index + 2]];
      const value = candidates.find((item) => String(item || "").trim() && String(item || "").trim() !== ":");
      if (value !== undefined) return String(value).trim();
    }
  }
  return "";
}


// سطر 2667 من App.jsx الأصلي
export function detectNoorOriginalRows(workbook) {
  const results = [];
  (workbook?.SheetNames || []).forEach((sheetName) => {
    const sheet = workbook.Sheets?.[sheetName];
    if (!sheet) return;
    const grid = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: "" });
    const headerIndex = grid.findIndex((row) => row.some((cell) => normalizeArabicHeader(cell) === normalizeArabicHeader("اسم الطالب")));
    if (headerIndex === -1) return;
    const headerRow = grid[headerIndex] || [];
    const findCol = (aliases) => {
      const normalizedAliases = aliases.map(normalizeArabicHeader);
      return headerRow.findIndex((cell) => normalizedAliases.includes(normalizeArabicHeader(cell)));
    };
    const nameCol = findCol(["اسم الطالب"]);
    if (nameCol === -1) return;
    const nationalIdCol = findCol(["رقم الهوية", "السجل المدني", "رقم رخصة الاقامة"]);
    const studentNumberCol = findCol(["رقم الطالب", "م"]);
    const classCol = findCol(["الفصل", "القسم", "الشعبة"]);
    const gradeValue = findLabeledValueFromGrid(grid, "الصف") || "غير محدد";
    const classValue = findLabeledValueFromGrid(grid, "الفصل") || "غير مصنف";
    const sectionValue = findLabeledValueFromGrid(grid, "القسم") || "";
    const schoolName = findLabeledValueFromGrid(grid, "المدرسة") || grid.slice(0, headerIndex).flat().map((item) => String(item || "").trim()).find((item) => item && !item.includes("المملكة") && !item.includes("وزارة") && !item.includes("كشف") && !item.includes("العام") && !item.includes("القسم") && !item.includes("الإدارة") && !item.includes("الصف") && !item.includes(":")) || "";

    grid.slice(headerIndex + 1).forEach((row) => {
      const name = String(row[nameCol] || "").trim();
      if (!name) return;
      const rawClass = classCol >= 0 ? String(row[classCol] || "").trim() : "";
      const classCode = rawClass || classValue || "غير مصنف";
      const className = gradeValue && classCode ? `${gradeValue} - الفصل ${classCode}` : classCode || gradeValue || "غير مصنف";
      const companyName = sectionValue ? `${sectionValue} - ${className}` : className;
      const studentNumber = studentNumberCol >= 0 ? String(row[studentNumberCol] || "").trim() : "";
      const nationalId = nationalIdCol >= 0 ? String(row[nationalIdCol] || "").trim() : "";
      results.push({
        name,
        nationalId,
        studentNumber,
        grade: gradeValue,
        className,
        companyName,
        sourceSchoolName: schoolName,
        sourceSheet: sheetName,
      });
    });
  });
  return results;
}


// سطر 2761 من App.jsx الأصلي
export function sanitizeBarcodeValue(value) {
  return String(value || "")
    .toUpperCase()
    .split("")
    .map((char) => (CODE39_PATTERNS[char] ? char : "-"))
    .join("");
}


// سطر 2797 من App.jsx الأصلي
export function getFaceProfileState(student) {
  if (Array.isArray(student?.faceSignature) && student.faceSignature.length > 0) return "ready";
  if (student?.faceReady) return "pending";
  return "disabled";
}


// سطر 2803 من App.jsx الأصلي
export function getFaceProfileLabel(student) {
  const state = getFaceProfileState(student);
  if (state === "ready") return "الوجه مسجل";
  if (state === "pending") return "بانتظار تسجيل الوجه";
  return "غير مفعّل";
}


// سطر 2810 من App.jsx الأصلي
export function getFaceProfileTone(student) {
  const state = getFaceProfileState(student);
  if (state === "ready") return "green";
  if (state === "pending") return "amber";
  return "slate";
}


// سطر 2817 من App.jsx الأصلي
export function fileToDataUrl(file) {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ""));
    reader.onerror = () => resolve("");
    reader.readAsDataURL(file);
  });
}


// سطر 2826 من App.jsx الأصلي
export function loadImageSource(src) {
  if (!src) return Promise.resolve(null);
  return new Promise((resolve) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => resolve(null);
    image.crossOrigin = 'anonymous';
    image.src = src;
    window.setTimeout(() => resolve(null), 5000);
  });
}


// سطر 2839 من App.jsx الأصلي
export function getVisualSourceSize(source) {
  return {
    width: source?.videoWidth || source?.naturalWidth || source?.width || 0,
    height: source?.videoHeight || source?.naturalHeight || source?.height || 0,
  };
}


// سطر 2846 من App.jsx الأصلي
export function drawVisualSourceToCanvas(source, maxSide = 960) {
  const { width, height } = getVisualSourceSize(source);
  if (!(width && height)) return null;
  const scale = Math.min(1, maxSide / Math.max(width, height));
  const canvas = document.createElement("canvas");
  canvas.width = Math.max(1, Math.round(width * scale));
  canvas.height = Math.max(1, Math.round(height * scale));
  const context = canvas.getContext("2d", { willReadFrequently: true });
  context.drawImage(source, 0, 0, canvas.width, canvas.height);
  return { canvas, context, width: canvas.width, height: canvas.height };
}


// سطر 2858 من App.jsx الأصلي
export function captureDataUrlFromVideo(video, quality = 0.92) {
  const drawn = drawVisualSourceToCanvas(video, 1280);
  return drawn?.canvas?.toDataURL("image/jpeg", quality) || "";
}


// سطر 2919 من App.jsx الأصلي
export function enhanceContrastForBarcode(ctx, width, height) {
  try {
    const imageData = ctx.getImageData(0, 0, width, height);
    const data = imageData.data;
    // حساب المتوسط والتباين
    let sum = 0;
    const grays = [];
    for (let i = 0; i < data.length; i += 4) {
      const g = Math.round(data[i] * 0.299 + data[i+1] * 0.587 + data[i+2] * 0.114);
      grays.push(g);
      sum += g;
    }
    const mean = sum / grays.length;
    // تطبيق تباين بسيط حول المتوسط
    for (let i = 0, j = 0; i < data.length; i += 4, j++) {
      const enhanced = Math.max(0, Math.min(255, Math.round((grays[j] - mean) * 1.4 + mean)));
      data[i] = enhanced;
      data[i+1] = enhanced;
      data[i+2] = enhanced;
    }
    ctx.putImageData(imageData, 0, 0);
  } catch { /* ignore */ }
}


// سطر 2989 من App.jsx الأصلي
export function compareFaceSignatures(baseSignature, candidateSignature) {
  if (!Array.isArray(baseSignature) || !Array.isArray(candidateSignature)) return Number.POSITIVE_INFINITY;
  const length = Math.min(baseSignature.length, candidateSignature.length);
  if (!length) return Number.POSITIVE_INFINITY;
  let total = 0;
  for (let index = 0; index < length; index += 1) total += Math.abs(baseSignature[index] - candidateSignature[index]);
  return total / length;
}


// سطر 2998 من App.jsx الأصلي
export function findBestFaceMatch(signature, students, maxScore = 22) {
  let bestStudent = null;
  let bestScore = Number.POSITIVE_INFINITY;
  students.forEach((student) => {
    if (!student.faceReady || !Array.isArray(student.faceSignature) || student.faceSignature.length === 0) return;
    const score = compareFaceSignatures(signature, student.faceSignature);
    if (score < bestScore) {
      bestScore = score;
      bestStudent = student;
    }
  });
  if (!bestStudent || !Number.isFinite(bestScore) || bestScore > maxScore) return { student: null, score: bestScore };
  return { student: bestStudent, score: bestScore };
}


// سطر 3053 من App.jsx الأصلي
export function applyPointsToUnifiedStudent(school, studentId, deltaPoints = 0, nextStatus = '', meta = {}) {
  if (!school || !studentId) return school;
  const amount = Number(deltaPoints || 0);
  const statusText = String(nextStatus || '').trim();
  const patchStudent = (student) => ({
    ...student,
    points: Math.max(0, Number(student?.points || 0) + amount),
    ...(statusText ? { attendanceStatus: statusText, status: statusText } : {}),
  });
  if (String(studentId).startsWith('structure-')) {
    const targetRaw = String(studentId).split('-').slice(2).join('-');
    return {
      ...school,
      structure: school?.structure ? {
        ...school.structure,
        classrooms: Array.isArray(school.structure.classrooms) ? school.structure.classrooms.map((classroom) => ({
          ...classroom,
          students: Array.isArray(classroom.students) ? classroom.students.map((student) => String(student.id) === String(targetRaw) ? patchStudent(student) : student) : [],
        })) : [],
      } : school.structure,
    };
  }
  return {
    ...school,
    students: Array.isArray(school.students) ? school.students.map((student) => String(student.id) === String(studentId) ? patchStudent(student) : student) : school.students,
  };
}


// سطر 3081 من App.jsx الأصلي
export function sortUnifiedCompanyRows(rows = []) {
  return [...rows].sort((a, b) => String(a.className || a.name || '').localeCompare(String(b.className || b.name || ''), 'ar', { numeric: true, sensitivity: 'base' }) || String(a.name || '').localeCompare(String(b.name || ''), 'ar', { numeric: true, sensitivity: 'base' }));
}


// سطر 3085 من App.jsx الأصلي
export function getUnifiedCompanyRows(school, { preferStructure = true } = {}) {
  if (!school) return [];
  const classrooms = Array.isArray(school?.structure?.classrooms) ? school.structure.classrooms : [];
  // استخدم الهيكل فقط إذا كان يحتوي على فصول فيها طلاب فعليين، أو إذا لم يكن هناك شركات قديمة
  const hasStructureStudents = classrooms.some((c) => Array.isArray(c.students) && c.students.length > 0);
  const hasOldCompanies = Array.isArray(school.companies) && school.companies.length > 0;
  if (preferStructure && classrooms.length && (hasStructureStudents || !hasOldCompanies)) {
    return sortUnifiedCompanyRows(classrooms.map((classroom, index) => {
      const students = Array.isArray(classroom.students) ? classroom.students : [];
      const activeStudents = students.filter((student) => String(student?.status || 'active') !== 'archived');
      const faceReadyCount = activeStudents.filter((student) => Boolean(student.faceReady || student.facePhoto)).length;
      const points = activeStudents.reduce((sum, student) => sum + Number(student.points || 0), 0);
      return {
        id: `structure-company-${classroom.id}`,
        source: 'structure',
        rawId: classroom.id,
        name: classroom.companyName || classroom.name || `فصل ${index + 1}`,
        className: classroom.name || classroom.gradeLabel || 'فصل',
        grade: classroom.gradeLabel || classroom.stageLabel || classroom.stage || '',
        leader: classroom.leaderName || '—',
        leaderUserId: classroom.leaderUserId || null,
        behavior: activeStudents.length ? Math.max(0, Math.min(100, Math.round(activeStudents.reduce((sum, student) => sum + Number(student.attendanceRate || 0), 0) / activeStudents.length))) : 0,
        early: activeStudents.filter((student) => String(student.attendanceStatus || '').includes('مبكر')).length,
        initiatives: faceReadyCount,
        points,
        studentsCount: activeStudents.length,
      };
    }));
  }
  return sortUnifiedCompanyRows(Array.isArray(school.companies) ? school.companies.map((company) => ({ ...company, source: 'school', rawId: company.id, studentsCount: getUnifiedSchoolStudents(school, { includeArchived: false, preferStructure: false }).filter((student) => String(student.companyId) === String(company.id)).length })) : []);
}


// سطر 3117 من App.jsx الأصلي
export function normalizePhoneNumber(value) {
  let digits = String(value || '').trim().replace(/[^\d+]/g, '');
  if (!digits) return '';
  if (digits.startsWith('+')) digits = digits.slice(1);
  if (digits.startsWith('00')) digits = digits.slice(2);
  if (digits.startsWith('0')) digits = `966${digits.slice(1)}`;
  return digits;
}


// سطر 3125 من App.jsx الأصلي
export function normalizeSearchDigits(value) {
  return String(value || '').replace(/[٠-٩]/g, (digit) => String("٠١٢٣٤٥٦٧٨٩".indexOf(digit))).replace(/[۰-۹]/g, (digit) => String("۰۱۲۳۴۵۶۷۸۹".indexOf(digit)));
}


// سطر 3129 من App.jsx الأصلي
export function normalizeSearchToken(value) {
  return normalizeSearchDigits(value).replace(/\s+/g, '').trim();
}


// سطر 3133 من App.jsx الأصلي
export function findStudentByKeyword(school, keyword) {
  const query = String(keyword || "").trim();
  if (!school || !query) return null;
  const normalizedBarcode = sanitizeBarcodeValue(query);
  const normalizedQuery = normalizeSearchToken(query);
  const lower = query.toLowerCase();
  const students = getUnifiedSchoolStudents(school, { includeArchived: false, preferStructure: true });
  return students.find((student) => {
    const studentNumber = normalizeSearchToken(student.studentNumber || "");
    const rawId = normalizeSearchToken(student.rawId || student.id || "");
    const id = normalizeSearchToken(student.id || "");
    const nationalId = normalizeSearchToken(student.nationalId || student.identityNumber || "");
    const guardianMobile = normalizeSearchToken(student.guardianMobile || '');
    return studentNumber === normalizedQuery
      || rawId === normalizedQuery
      || id === normalizedQuery
      || nationalId === normalizedQuery
      || guardianMobile === normalizedQuery
      || sanitizeBarcodeValue(student.barcode) === normalizedBarcode
      || String(student.name || '').toLowerCase().includes(lower)
      || String(student.fullName || '').toLowerCase().includes(lower);
  }) || null;
}


// سطر 3185 من App.jsx الأصلي
export function formatEnglishDigits(value) {
  const num = Number(value);
  if (!Number.isFinite(num)) return String(value ?? '');
  return new Intl.NumberFormat('en-US').format(num);
}


// سطر 3191 من App.jsx الأصلي
export function clampScreenLabel(value, max = 22) {
  const text = String(value || '');
  return text.length > max ? `${text.slice(0, max - 1)}…` : text;
}


// سطر 3315 من App.jsx الأصلي
export function splitTickerItems(text) {
  return String(text || "")
    .split(/\n|\|/)
    .map((item) => item.trim())
    .filter(Boolean);
}


// سطر 3571 من App.jsx الأصلي
export function getLessonSessionTeacherTargets(session, schoolUsers) {
  if (!session || !Array.isArray(schoolUsers)) return [];
  const teachers = schoolUsers.filter((user) => user.role === 'teacher' && String(user.status || 'نشط') === 'نشط');
  if (Array.isArray(session.targetTeacherIds) && session.targetTeacherIds.length > 0) {
    const ids = session.targetTeacherIds.map((id) => String(id));
    return teachers.filter((user) => ids.includes(String(user.id)));
  }
  return teachers;
}


// سطر 3846 من App.jsx الأصلي
export function getArabicDayKey(date = new Date()) {
  const dayIndex = date.getDay(); // 0=Sunday
  const map = [0, 1, 2, 3, 4, 5, 6];
  const keys = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
  return keys[dayIndex] || 'sunday';
}


// سطر 3853 من App.jsx الأصلي
export function getCurrentSlotFromTimetable(timetable = [], date = new Date()) {
  const dayKey = getArabicDayKey(date);
  const nowMinutes = date.getHours() * 60 + date.getMinutes();
  const daySlots = timetable.filter((entry) => entry.day === dayKey);
  if (!daySlots.length) return null;
  // ابحث عن الحصة التي وقتها الحالي ضمن نطاقها
  const current = daySlots.find((entry) => {
    const start = parseTimeToMinutes(entry.startTime || '00:00');
    const end = parseTimeToMinutes(entry.endTime || '23:59');
    return nowMinutes >= start && nowMinutes <= end;
  });
  if (current) return current;
  // إذا لم يكن ضمن أي حصة، ارجع أقرب حصة قادمة
  const upcoming = daySlots
    .filter((entry) => parseTimeToMinutes(entry.startTime || '00:00') > nowMinutes)
    .sort((a, b) => parseTimeToMinutes(a.startTime) - parseTimeToMinutes(b.startTime));
  return upcoming[0] || daySlots.sort((a, b) => parseTimeToMinutes(a.startTime) - parseTimeToMinutes(b.startTime))[0] || null;
}


export const initialSchools = [
  {
    id: 1,
    name: "متوسطة الأبناء الثالثة",
    city: "أبها",
    code: "ABH-003",
    manager: "أ. خالد العمري",
    status: "نشطة",
    companies: [
      { id: 101, name: "شركة الأمل", className: "1/1", leader: "أحمد الحربي", points: 980, early: 18, behavior: 96, initiatives: 6 },
      { id: 102, name: "شركة التميز", className: "1/2", leader: "ياسر القحطاني", points: 940, early: 16, behavior: 92, initiatives: 4 },
      { id: 103, name: "شركة النمير", className: "2/1", leader: "يزن عسيري", points: 910, early: 15, behavior: 90, initiatives: 5 },
      { id: 104, name: "شركة المجد", className: "2/2", leader: "بندر عسيري", points: 860, early: 13, behavior: 88, initiatives: 3 },
    ],
    students: [
      { id: 1, name: "أحمد إبراهيم أحمد الحربي", nationalId: "1100000011", grade: "الأول متوسط", companyId: 101, barcode: "ST-0001-ABH", faceReady: true, status: "مبكر", attendanceRate: 99, points: 138 },
      { id: 2, name: "ياسر مفلح علي القحطاني", nationalId: "1100000012", grade: "الأول متوسط", companyId: 101, barcode: "ST-0002-ABH", faceReady: false, status: "في الوقت", attendanceRate: 96, points: 121 },
      { id: 3, name: "يزن عامر إبراهيم عسيري", nationalId: "1100000013", grade: "الأول متوسط", companyId: 102, barcode: "ST-0003-ABH", faceReady: true, status: "مبكر", attendanceRate: 98, points: 130 },
      { id: 4, name: "بندر هادي المحب عسيري", nationalId: "1100000014", grade: "الثاني متوسط", companyId: 103, barcode: "ST-0004-ABH", faceReady: true, status: "متأخر", attendanceRate: 87, points: 97 },
      { id: 5, name: "سعد سالم مسفر الشهراني", nationalId: "1100000015", grade: "الثاني متوسط", companyId: 104, barcode: "ST-0005-ABH", faceReady: false, status: "في الوقت", attendanceRate: 95, points: 115 },
      { id: 6, name: "عبدالرحمن فهد الشمراني", nationalId: "1100000016", grade: "الثاني متوسط", companyId: 104, barcode: "ST-0006-ABH", faceReady: true, status: "مبكر", attendanceRate: 100, points: 140 },
    ],
  },
  {
    id: 2,
    name: "مدرسة الرياض النموذجية",
    city: "الرياض",
    code: "RYD-011",
    manager: "أ. عبدالله الدوسري",
    status: "نشطة",
    companies: [
      { id: 201, name: "شركة الريادة", className: "1/1", leader: "عبدالله الدوسري", points: 1005, early: 20, behavior: 97, initiatives: 7 },
      { id: 202, name: "شركة المستقبل", className: "1/2", leader: "فهد العتيبي", points: 965, early: 17, behavior: 94, initiatives: 5 },
    ],
    students: [
      { id: 7, name: "عبدالله سالم الدوسري", nationalId: "1100000021", grade: "الأول متوسط", companyId: 201, barcode: "ST-0007-RYD", faceReady: true, status: "مبكر", attendanceRate: 97, points: 136 },
      { id: 8, name: "فهد محمد العتيبي", nationalId: "1100000022", grade: "الأول متوسط", companyId: 202, barcode: "ST-0008-RYD", faceReady: true, status: "في الوقت", attendanceRate: 95, points: 118 },
      { id: 9, name: "تركي حامد المطيري", nationalId: "1100000023", grade: "الثاني متوسط", companyId: 202, barcode: "ST-0009-RYD", faceReady: false, status: "مبكر", attendanceRate: 98, points: 124 },
    ],
  },
];


export const initialScanLog = [
  { id: 1, schoolId: 1, studentId: 1, companyId: 101, student: "أحمد إبراهيم أحمد الحربي", barcode: "ST-0001-ABH", date: "١٧‏/٠٩‏/١٤٤٧ هـ", isoDate: "2026-03-17", time: "06:19", method: "QR", result: "تم تسجيل حضور مبكر", deltaPoints: 5 },
  { id: 2, schoolId: 1, studentId: 3, companyId: 102, student: "يزن عامر إبراهيم عسيري", barcode: "ST-0003-ABH", date: "١٧‏/٠٩‏/١٤٤٧ هـ", isoDate: "2026-03-17", time: "06:24", method: "QR", result: "تم تسجيل حضور مبكر", deltaPoints: 5 },
  { id: 3, schoolId: 1, studentId: 5, companyId: 104, student: "سعد سالم مسفر الشهراني", barcode: "ST-0005-ABH", date: "١٧‏/٠٩‏/١٤٤٧ هـ", isoDate: "2026-03-17", time: "06:41", method: "QR", result: "تم تسجيل حضور في الوقت", deltaPoints: 3 },
];


export const defaultActionCatalog = {
  rewards: [
    { id: 1, title: "الحضور المبكر", points: 5, description: "مكافأة على الانضباط والحضور المبكر" },
    { id: 2, title: "حل الواجب", points: 4, description: "مكافأة على إنجاز الواجب أو المهمة المطلوبة" },
    { id: 3, title: "تميز سلوكي", points: 8, description: "تميز واضح في السلوك أو التعاون" },
  ],
  violations: [
    { id: 101, title: "تأخر عن الحصة", points: -3, description: "خصم بسبب التأخر أو عدم الالتزام بالوقت" },
    { id: 102, title: "مخالفة سلوكية", points: -5, description: "خصم بسبب مخالفة سلوكية معتمدة" },
    { id: 103, title: "عدم إحضار المتطلبات", points: -2, description: "خصم بسبب عدم إحضار المتطلبات أو الأدوات" },
  ],
  programs: [
    { id: 201, title: "مشاركة في برنامج", points: 6, description: "اعتماد مشاركة الطالب في برنامج أو نشاط ينفذه المعلم" },
    { id: 202, title: "قيادة فقرة", points: 7, description: "تنفيذ دور قيادي داخل برنامج أو نشاط مدرسي" },
  ],
};


export const SPECIAL_ITEM_TEMPLATES = {
  'رياضيات': [
    { title: 'حفظ جدول الضرب', type: 'reward', points: 5, description: 'إتقان جدول الضرب في الحصة' },
    { title: 'حل ذهني سريع', type: 'reward', points: 4, description: 'سرعة ودقة في الحل الذهني' },
    { title: 'نسيان الدفتر', type: 'violation', points: -2, description: 'خصم عند نسيان دفتر الرياضيات' },
  ],
  'اللغة العربية': [
    { title: 'إتقان القراءة الجهرية', type: 'reward', points: 4, description: 'إجادة القراءة الجهرية للنص' },
    { title: 'سلامة الإملاء', type: 'reward', points: 4, description: 'كتابة صحيحة وخالية من الأخطاء' },
  ],
  'عربي': [
    { title: 'إتقان القراءة الجهرية', type: 'reward', points: 4, description: 'إجادة القراءة الجهرية للنص' },
    { title: 'سلامة الإملاء', type: 'reward', points: 4, description: 'كتابة صحيحة وخالية من الأخطاء' },
  ],
  'علوم': [
    { title: 'تنفيذ تجربة بإتقان', type: 'reward', points: 5, description: 'تنفيذ النشاط العلمي بدقة' },
    { title: 'إحضار أدوات التجربة', type: 'reward', points: 3, description: 'الالتزام بالأدوات المطلوبة' },
  ],
  'إنجليزي': [
    { title: 'حفظ مفردات الوحدة', type: 'reward', points: 4, description: 'إتقان كلمات الدرس' },
    { title: 'نطق صحيح', type: 'reward', points: 4, description: 'نطق الكلمات والجمل بشكل صحيح' },
  ],
  'التربية الإسلامية': [
    { title: 'حفظ مقرر الحفظ', type: 'reward', points: 5, description: 'إتقان المقرر المطلوب حفظه' },
    { title: 'إتقان التلاوة', type: 'reward', points: 4, description: 'أداء صحيح وواضح' },
  ],
};


export const defaultSettings = {
  platformName: "منصة المدرسة المثالية",
  academicYear: "1447",
  dayStart: "06:45",
  adminName: "الإدارة العامة",
  policy: {
    earlyEnd: "06:30",
    onTimeEnd: "06:45",
  },
  points: {
    early: 5,
    onTime: 3,
    late: -2,
    initiative: 10,
    behavior: 4,
  },
  attendancePointsSystem: {
    enabled: false,
    dailyPresencePoints: 5,
    earlyBonusPoints: 3,
    absentDeductPoints: 3,
    lateDeductPoints: 3,
    excusedPoints: 0,
  },
  teacherPoints: {
    perReward: 5,
    perViolation: 2,
    perProgram: 10,
  },
  devices: {
    barcodeEnabled: true,
    faceEnabled: true,
    duplicateScanBlocked: true,
  },
  exportPrefix: "ideal-company-platform",
  weeklyTimetable: [],
  slotDefinitions: [],
  subjectBank: [
    "القرآن الكريم",
    "التوحيد",
    "الفقه",
    "التفسير",
    "الحديث",
    "اللغة العربية",
    "النحو والصرف",
    "الأدب والبلاغة",
    "الرياضيات",
    "العلوم",
    "الفيزياء",
    "الكيمياء",
    "الأحياء",
    "التاريخ",
    "الجغرافيا",
    "التربية الوطنية",
    "اللغة الإنجليزية",
    "الحاسب الآلي",
    "التربية البدنية",
    "الفنون",
  ],
  actions: defaultActionCatalog,
  auth: {
    allowPasswordLogin: true,
    otpEnabled: false,
    passwordlessEnabled: false,
    identifierMode: 'username',
    otpExpiryMinutes: 10,
    otpLength: 6,
    delivery: { email: true, sms: false, whatsapp: false },
    targeting: {
      applyScope: 'all',
      selectedRoleKeys: [],
      selectedUserIds: [],
      excludedUserIds: [],
      forceForSelected: false,
    },
    email: {
      fromName: 'منصة المدرسة المثالية',
      fromEmail: '',
      smtpHost: '',
      smtpPort: 587,
      smtpSecure: false,
      smtpUsername: '',
      smtpPassword: '',
    },
    integrations: {
      sms: { providerName: '', senderId: '', apiUrl: '', apiKey: '', username: '', password: '', status: 'غير مختبر', lastCheckedAt: '' },
      whatsapp: { phoneNumberId: '', businessAccountId: '', accessToken: '', webhookVerifyToken: '', status: 'غير مختبر', lastCheckedAt: '' },
    },
    security: {
      enabled: false,
      applyToPassword: true,
      applyToOtp: true,
      trackWindowMinutes: 15,
      maxFailedAttempts: 5,
      lockoutMinutes: 15,
      notifyAdminOnLock: true,
      notificationChannels: { internal: true, email: false, sms: false, whatsapp: false },
    },
  },
};


export const defaultPermissionsByRole = {
  superadmin: Object.fromEntries(permissionDefinitions.map((item) => [item.key, true])),
  principal: { dashboard: true, schools: false, companies: true, students: true, attendance: true, actions: true, points: true, reports: true, deviceDisplays: true, messages: true, leavePass: true, settings: true, users: true },
  agent: { dashboard: true, schools: false, companies: false, students: false, attendance: false, actions: false, points: false, reports: true, deviceDisplays: false, messages: false, leavePass: true, settings: false, users: false },
  counselor: { dashboard: true, schools: false, companies: false, students: false, attendance: false, actions: false, points: false, reports: true, deviceDisplays: false, messages: false, leavePass: true, settings: false, users: false },
  gate: { dashboard: false, schools: false, companies: false, students: false, attendance: true, actions: false, points: false, reports: false, deviceDisplays: false, messages: false, leavePass: true, settings: false, users: false },
  supervisor: { dashboard: true, schools: false, companies: false, students: true, attendance: true, actions: true, points: true, reports: true, deviceDisplays: false, messages: false, leavePass: true, settings: false, users: false },
  teacher: { dashboard: true, schools: false, companies: false, students: false, attendance: false, actions: true, points: true, reports: false, deviceDisplays: false, messages: false, leavePass: true, settings: false, users: false },
  student: { dashboard: true, schools: false, companies: false, students: false, attendance: false, actions: false, points: true, reports: false, deviceDisplays: false, messages: false, settings: false, users: false },
};


export const navItems = [
  // ── بدون مجموعة (العمليات اليومية) ──
  { key: "dashboard", label: "الرئيسية", icon: LayoutDashboard, permission: "dashboard", excludeRoles: ["gate"] },
  { key: "schools", label: "المدارس", icon: Building2, permission: "schools" },
  { key: "attendance", label: "الحضور الذكي", icon: ScanLine, permission: "attendance" },
  { key: "lessonAttendanceSessions", label: "تحضير الحصص", icon: ClipboardList, permission: "actions", roles: ["superadmin", "principal", "supervisor", "teacher"] },
  { key: "actions", label: "إجراءات الطلاب", icon: ClipboardCheck, permission: "actions" },
  { key: "leavePasses", label: "الاستئذان", icon: ClipboardList, permission: "leavePass", roles: ["superadmin", "principal", "supervisor", "teacher"] },
  { key: "leavePassAgentDesk", label: "استئذان الوكيل", icon: ShieldCheck, permission: "leavePass", roles: ["agent"] },
  { key: "leavePassCounselorDesk", label: "استئذان المرشد", icon: UserCheck, permission: "leavePass", roles: ["counselor"] },
  { key: "securityDesk", label: "لوحة الأمن", icon: Shield, permission: "leavePass", roles: ["gate"] },
  { key: "leavePassGateDesk", label: "الاستئذانات", icon: ClipboardList, permission: "leavePass", roles: ["gate"] },
  { key: "messages", label: "الرسائل والتنبيهات", icon: Bell, permission: "messages" },
  { key: "parentsAdmin", label: "أولياء الأمور", icon: Users, permission: "settings", roles: ["superadmin", "principal", "supervisor"] },
  { key: "reports", label: "مركز التقارير", icon: LineChart, permission: "reports" },
  // ── الفصول والتنظيم ──
  { key: "classes", label: "الفصول", icon: BookOpen, permission: "companies", group: "الفصول والتنظيم" },
  { key: "points", label: "ترتيب الفصول", icon: Trophy, permission: "points", excludeRoles: ["gate"], group: "الفصول والتنظيم" },
  { key: "companies", label: "الشركات والفصول", icon: Layers3, permission: "companies", group: "الفصول والتنظيم" },
  // ── التحفيز والمتابعة ──
  { key: "pointsRewards", label: "النقاط والمكافآت", icon: Trophy, permission: "points", roles: ["superadmin", "principal", "supervisor"], group: "التحفيز والمتابعة" },
  { key: "rewardStore", label: "متجر النقاط", icon: Gift, permission: "points", roles: ["superadmin", "principal", "supervisor"], group: "التحفيز والمتابعة" },
  { key: "parentsExecutive", label: "المتابعة التنفيذية", icon: BarChart3, permission: "settings", roles: ["superadmin", "principal", "supervisor"], group: "التحفيز والمتابعة" },
  { key: "nafisAnalytics", label: "لوحة نافس التجريبي", icon: Trophy, permission: "settings", roles: ["superadmin", "principal", "supervisor", "teacher"], group: "التحفيز والمتابعة" },
  { key: "nafisBank", label: "بنك أسئلة نافس", icon: BookOpen, permission: "settings", roles: ["superadmin"], group: "التحفيز والمتابعة" },
  // ── الأجهزة والربط ──
  { key: "deviceDisplays", label: "الشاشات والبوابات", icon: ExternalLink, permission: "deviceDisplays", group: "الأجهزة والربط" },
  { key: "students", label: "شؤون الطلاب", icon: GraduationCap, permission: "students", group: "الأجهزة والربط" },
  // ── الإعدادات ──
  { key: "settings", label: "إعدادات المدرسة", icon: Settings, permission: "settings", group: "الإعدادات" },
  { key: "schoolStructure", label: "إعدادات المدرسة (الهيكل)", icon: School, permission: "settings", group: "الإعدادات" },
  { key: "users", label: "المستخدمون", icon: ShieldCheck, permission: "users", group: "الإعدادات" },
  { key: "platformAuth", label: "الدخول والمصادقة", icon: ShieldCheck, permission: "settings", roles: ["superadmin"], group: "الإعدادات" },
];


export const principalDelegableRoles = ["agent", "counselor", "gate", "supervisor", "teacher", "student"];


export const principalManageablePermissionKeys = ["dashboard", "companies", "students", "attendance", "actions", "points", "reports", "messages", "leavePass"];


export function TeacherSpecialItemsEditor({ subjects = [], items = [], onChange }) {
  const subjectOptions = Array.isArray(subjects) ? subjects.filter(Boolean) : [];
  const hydratedItems = hydrateTeacherSpecialItems(items);
  const [draft, setDraft] = React.useState({ title: '', type: 'reward', points: 5, subject: subjectOptions[0] || '', description: '' });
  const [activeSubject, setActiveSubject] = React.useState(subjectOptions[0] || '');
  React.useEffect(() => {
    setDraft((prev) => ({ ...prev, subject: prev.subject || subjectOptions[0] || '' }));
    setActiveSubject((prev) => prev || subjectOptions[0] || '');
  }, [subjectOptions.join('|')]);
  const grouped = subjectOptions.map((subject) => ({ subject, items: hydratedItems.filter((item) => item.subject === subject) }));
  const activeCount = hydratedItems.filter((item) => item.isActive !== false).length;
  const inactiveCount = Math.max(hydratedItems.length - activeCount, 0);
  const activeGroup = grouped.find((group) => group.subject === activeSubject) || grouped[0] || null;
  const subjectTemplates = SPECIAL_ITEM_TEMPLATES[draft.subject] || [];
  const updateItem = (id, patch) => onChange(hydratedItems.map((item) => item.id !== id ? item : { ...item, ...patch }));
  const removeItem = (id) => onChange(hydratedItems.filter((item) => item.id !== id));
  const addItem = () => {
    if (!draft.title.trim() || !draft.subject) return;
    onChange([...hydratedItems, { id: `tsi-${Date.now()}`, title: draft.title.trim(), type: draft.type, points: Number(draft.points || 0), subject: draft.subject, description: draft.description.trim(), isActive: true }]);
    setActiveSubject(draft.subject);
    setDraft((prev) => ({ ...prev, title: '', points: prev.type === 'violation' ? -2 : 5, description: '' }));
  };
  const addTemplate = (template) => {
    if (!draft.subject || !template?.title) return;
    const exists = hydratedItems.some((item) => item.subject === draft.subject && item.title === template.title && item.type === template.type);
    if (exists) return;
    onChange([...hydratedItems, { id: `tsi-${Date.now()}`, title: template.title, type: template.type || 'reward', points: Number(template.points || 0), subject: draft.subject, description: String(template.description || '').trim(), isActive: true }]);
    setActiveSubject(draft.subject);
  };
  return (
    <div className="space-y-4 md:col-span-2">
      <div className="rounded-3xl bg-slate-50 p-5 ring-1 ring-slate-200">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <div className="font-black text-slate-900">البنود التخصصية</div>
            <div className="mt-1 text-sm text-slate-500">تظهر للمعلم داخل شاشة التنفيذ بعد البنود العامة، بحسب المادة التي يدرسها فقط.</div>
          </div>
          <div className="flex flex-wrap gap-2">
            <Badge tone="violet">{hydratedItems.length} بند</Badge>
            <Badge tone="green">{activeCount} مفعل</Badge>
            {inactiveCount ? <Badge tone="slate">{inactiveCount} غير مفعل</Badge> : null}
          </div>
        </div>
        {!subjectOptions.length ? <div className="mt-4 rounded-2xl bg-amber-50 px-4 py-3 text-sm font-bold text-amber-900 ring-1 ring-amber-200">أضف المادة أو المواد أولًا حتى تتمكن من إضافة البنود التخصصية.</div> : null}
        {subjectOptions.length ? (
          <>
            <div className="mt-4 grid grid-cols-2 gap-3 md:grid-cols-4">
              <div className="rounded-2xl bg-white p-4 ring-1 ring-slate-200"><div className="text-xs font-bold text-slate-500">المواد المسندة</div><div className="mt-1 text-2xl font-black text-slate-900">{subjectOptions.length}</div></div>
              <div className="rounded-2xl bg-white p-4 ring-1 ring-slate-200"><div className="text-xs font-bold text-slate-500">إجمالي البنود</div><div className="mt-1 text-2xl font-black text-violet-700">{hydratedItems.length}</div></div>
              <div className="rounded-2xl bg-white p-4 ring-1 ring-slate-200"><div className="text-xs font-bold text-slate-500">البنود المفعلة</div><div className="mt-1 text-2xl font-black text-emerald-700">{activeCount}</div></div>
              <div className="rounded-2xl bg-white p-4 ring-1 ring-slate-200"><div className="text-xs font-bold text-slate-500">مواد فيها بنود</div><div className="mt-1 text-2xl font-black text-sky-700">{grouped.filter((group) => group.items.length).length}</div></div>
            </div>
            <div className="mt-4 rounded-2xl bg-white p-4 ring-1 ring-slate-200">
              <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-5">
                <Input label="اسم البند" value={draft.title} onChange={(e) => setDraft((prev) => ({ ...prev, title: e.target.value }))} placeholder="مثال: حفظ جدول الضرب" />
                <Select label="النوع" value={draft.type} onChange={(e) => setDraft((prev) => ({ ...prev, type: e.target.value, points: e.target.value === 'violation' ? -2 : prev.points > 0 ? prev.points : 5 }))}>
                  <option value="reward">مكافأة</option>
                  <option value="violation">خصم</option>
                  <option value="program">برنامج</option>
                </Select>
                <Input label="نقاط الطالب" type="number" value={draft.points} onChange={(e) => setDraft((prev) => ({ ...prev, points: Number(e.target.value || 0) }))} />
                <Select label="المادة" value={draft.subject} onChange={(e) => { const subject = e.target.value; setDraft((prev) => ({ ...prev, subject })); setActiveSubject(subject); }}>
                  {subjectOptions.map((subject) => <option key={subject} value={subject}>{subject}</option>)}
                </Select>
                <div className="flex items-end">
                  <button type="button" onClick={addItem} className="w-full rounded-2xl bg-sky-700 px-4 py-3 text-sm font-bold text-white">إضافة البند</button>
                </div>
                <div className="md:col-span-2 xl:col-span-5">
                  <Input label="وصف مختصر" value={draft.description} onChange={(e) => setDraft((prev) => ({ ...prev, description: e.target.value }))} placeholder="يظهر للمعلم عند اختيار البند" />
                </div>
              </div>
              {subjectTemplates.length ? (
                <div className="mt-4 rounded-2xl bg-violet-50 p-4 ring-1 ring-violet-100">
                  <div className="text-sm font-black text-violet-800">قوالب سريعة لمادة {draft.subject}</div>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {subjectTemplates.map((template) => {
                      const exists = hydratedItems.some((item) => item.subject === draft.subject && item.title === template.title && item.type === template.type);
                      return (
                        <button key={`${draft.subject}-${template.title}`} type="button" disabled={exists} onClick={() => addTemplate(template)} className={cx('rounded-full px-3 py-2 text-xs font-bold ring-1 transition', exists ? 'cursor-not-allowed bg-slate-100 text-slate-400 ring-slate-200' : 'bg-white text-violet-700 ring-violet-200 hover:bg-violet-100')}>
                          {template.title}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ) : null}
            </div>
          </>
        ) : null}
      </div>
      {grouped.length ? (
        <div className="rounded-3xl bg-white p-5 ring-1 ring-slate-200">
          <div className="flex flex-wrap gap-2">
            {grouped.map((group) => (
              <button key={group.subject} type="button" onClick={() => setActiveSubject(group.subject)} className={cx('rounded-full px-4 py-2 text-sm font-bold ring-1 transition', activeGroup?.subject === group.subject ? 'bg-sky-700 text-white ring-sky-700' : 'bg-slate-50 text-slate-700 ring-slate-200 hover:bg-slate-100')}>
                {group.subject} <span className="me-1 text-xs opacity-80">({group.items.length})</span>
              </button>
            ))}
          </div>
          {activeGroup ? (
            <div className="mt-4">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <div className="font-black text-slate-900">{activeGroup.subject}</div>
                  <div className="mt-1 text-sm text-slate-500">البنود الخاصة بهذه المادة فقط.</div>
                </div>
                <div className="flex gap-2">
                  <Badge tone="blue">{activeGroup.items.length} بند</Badge>
                  <Badge tone="green">{activeGroup.items.filter((item) => item.isActive !== false).length} مفعل</Badge>
                </div>
              </div>
              {!activeGroup.items.length ? <div className="mt-3 rounded-2xl bg-slate-50 px-4 py-3 text-sm text-slate-500 ring-1 ring-slate-200">لا توجد بنود تخصصية لهذه المادة بعد.</div> : null}
              <div className="mt-4 space-y-3">
                {activeGroup.items.map((item) => (
                  <div key={item.id} className="rounded-2xl bg-slate-50 p-4 ring-1 ring-slate-200">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="font-black text-slate-900">{item.title}</div>
                      <div className="flex gap-2">
                        <Badge tone={item.type === 'reward' ? 'green' : item.type === 'violation' ? 'rose' : 'blue'}>{item.type === 'reward' ? 'مكافأة' : item.type === 'violation' ? 'خصم' : 'برنامج'}</Badge>
                        <Badge tone="slate">{item.points > 0 ? `+${item.points}` : item.points} نقطة</Badge>
                      </div>
                    </div>
                    <div className="mt-3 grid grid-cols-1 gap-3 md:grid-cols-[1.1fr_.7fr_.45fr_auto_auto] md:items-end">
                      <Input label="اسم البند" value={item.title} onChange={(e) => updateItem(item.id, { title: e.target.value })} />
                      <Select label="النوع" value={item.type} onChange={(e) => updateItem(item.id, { type: e.target.value })}>
                        <option value="reward">مكافأة</option>
                        <option value="violation">خصم</option>
                        <option value="program">برنامج</option>
                      </Select>
                      <Input label="النقاط" type="number" value={item.points} onChange={(e) => updateItem(item.id, { points: Number(e.target.value || 0) })} />
                      <button type="button" onClick={() => updateItem(item.id, { isActive: item.isActive === false })} className={cx('rounded-2xl px-4 py-3 text-sm font-bold', item.isActive === false ? 'bg-slate-100 text-slate-700' : 'bg-emerald-50 text-emerald-700')}>
                        {item.isActive === false ? 'غير مفعل' : 'مفعل'}
                      </button>
                      <button type="button" onClick={() => removeItem(item.id)} className="rounded-2xl bg-rose-50 px-4 py-3 text-sm font-bold text-rose-700">حذف</button>
                    </div>
                    <div className="mt-3">
                      <Input label="وصف البند" value={item.description || ''} onChange={(e) => updateItem(item.id, { description: e.target.value })} placeholder="وصف مختصر يظهر للمعلم" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}


export async function detectBarcodeValueFromSource(source) {
  if (typeof window === "undefined") return "";
  try {
    const target = typeof source === "string" ? await loadImageSource(source) : source;
    if (!target) return "";

    if ("BarcodeDetector" in window) {
      const detector = new window.BarcodeDetector({ formats: ["qr_code", "code_39", "code_128", "ean_13", "ean_8"] });
      const codes = await detector.detect(target);
      const rawValue = String(codes?.[0]?.rawValue || codes?.[0]?.displayValue || "").trim();
      if (rawValue) return sanitizeBarcodeValue(rawValue);
    }

    if (!jsQR) return "";

    // محاولة 1: بدقة عالية 1280
    const drawn1 = drawVisualSourceToCanvas(target, 1280);
    if (drawn1) {
      const imageData1 = drawn1.context.getImageData(0, 0, drawn1.width, drawn1.height);
      const result1 = jsQR(imageData1.data, drawn1.width, drawn1.height, { inversionAttempts: "attemptBoth" });
      if (result1?.data) return sanitizeBarcodeValue(String(result1.data).trim());
    }

    // محاولة 2: بدقة متوسطة مع تحسين التباين
    const drawn2 = drawVisualSourceToCanvas(target, 800);
    if (drawn2) {
      enhanceContrastForBarcode(drawn2.context, drawn2.width, drawn2.height);
      const imageData2 = drawn2.context.getImageData(0, 0, drawn2.width, drawn2.height);
      const result2 = jsQR(imageData2.data, drawn2.width, drawn2.height, { inversionAttempts: "attemptBoth" });
      if (result2?.data) return sanitizeBarcodeValue(String(result2.data).trim());
    }

    // محاولة 3: دقة منخفضة للباركودات الصغيرة
    const drawn3 = drawVisualSourceToCanvas(target, 480);
    if (drawn3) {
      const imageData3 = drawn3.context.getImageData(0, 0, drawn3.width, drawn3.height);
      const result3 = jsQR(imageData3.data, drawn3.width, drawn3.height, { inversionAttempts: "dontInvert" });
      if (result3?.data) return sanitizeBarcodeValue(String(result3.data).trim());
    }

    return "";
  } catch {
    return "";
  }
}


export async function buildFaceTemplateFromDataUrl(photo) {
  return buildFaceTemplateFromSource(photo);
}


export async function buildFaceTemplateFromFile(file) {
  const photo = await fileToDataUrl(file);
  return buildFaceTemplateFromSource(photo);
}

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import QRCode from "qrcode";
import jsQR from "jsqr";
import * as XLSX from "xlsx";
import {
  BadgeCheck,
  BarChart3,
  Bell,
  BookOpen,
  Building2,
  Camera,
  ClipboardCheck,
  ClipboardList,
  Copy,
  Database,
  ExternalLink,
  Download,
  FileClock,
  GraduationCap,
  Layers3,
  LayoutDashboard,
  LineChart,
  Maximize2,
  Plus,
  QrCode,
  RefreshCw,
  Rocket,
  Save,
  ScanLine,
  School,
  Search,
  Settings,
  Shield,
  ShieldAlert,
  ShieldCheck,
  Trash2,
  Trophy,
  Upload,
  UserCircle2,
  Users,
  Wand2,
  Pencil,
  Archive,
  ArrowRightLeft,
  MonitorSmartphone,
  Loader2,
  Printer,
  Unlink2,
} from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  LabelList,
  Line,
  LineChart as RLineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

const STORAGE_KEY = "ideal-company-platform-state-v8";
const UI_STATE_KEY = "ideal-company-platform-ui-v8";
const SERVER_CACHE_KEY = "ideal-company-platform-server-cache-v8";
const SESSION_TOKEN_KEY = "ideal-company-platform-session-token-v8";
const BACKUP_VERSION = 8;

const SCREEN_TRANSITION_OPTIONS = [
  ["fade", "تلاشي ناعم"],
  ["cut", "قطع مباشر"],
  ["slide-left", "انزلاق من اليمين"],
  ["slide-right", "انزلاق من اليسار"],
  ["slide-up", "صعود للأعلى"],
  ["slide-down", "نزول للأسفل"],
  ["zoom-in", "تكبير داخلي"],
  ["zoom-out", "تكبير خارجي"],
  ["flip-x", "قلب أفقي"],
  ["flip-y", "قلب رأسي"],
  ["rotate-soft", "دوران خفيف"],
  ["rotate-in", "دوران داخلي"],
  ["blur", "ظهور ضبابي"],
  ["bounce", "قفزة ناعمة"],
  ["scale-up", "تمدد للأعلى"],
  ["scale-down", "انكماش ناعم"],
  ["swing", "تأرجح خفيف"],
  ["curtain", "ستارة جانبية"],
  ["diagonal", "انزلاق قطري"],
  ["pop", "انبثاق سريع"],
  ["float", "طفو ناعم"],
  ["random", "عشوائي من كل الحركات"],
];

const SCREEN_TRANSITION_KEYS = SCREEN_TRANSITION_OPTIONS.map(([key]) => key);
const SCREEN_RANDOM_TRANSITIONS = SCREEN_TRANSITION_KEYS.filter((key) => key !== "random");
const SCREEN_THEME_OPTIONS = [
  ["emerald-night", "ليلي زمردي"],
  ["blue-contrast", "أزرق عالي التباين"],
  ["violet-stage", "بنفسجي مسرحي"],
  ["sunrise", "شروق دافئ"],
  ["graphite", "رمادي احترافي"],
];
const SCREEN_TEMPLATE_OPTIONS = [
  ["executive", "مؤشرات تنفيذية"],
  ["reception", "استقبال ولوبي"],
  ["leaderboard", "ترتيب ومنافسة"],
  ["news", "أخبار ونشاطات"],
];
const TICKER_BG_OPTIONS = [
  ["amber", "ذهبي لافت"],
  ["navy", "كحلي رسمي"],
  ["emerald", "زمردي"],
  ["rose", "عنابي"],
  ["slate", "رمادي داكن"],
];



const formatDateTime = (value) => {
  if (!value) return '—';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '—';
  return new Intl.DateTimeFormat('ar-SA', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  }).format(date);
};


const getAuthActionMeta = (action) => {
  const map = {
    login: { label: 'دخول ناجح بكلمة المرور', tone: 'green' },
    logout: { label: 'تسجيل خروج', tone: 'slate' },
    auth_login_failed: { label: 'فشل دخول بكلمة المرور', tone: 'rose' },
    auth_login_blocked: { label: 'منع دخول بكلمة المرور', tone: 'amber' },
    auth_request_otp_success: { label: 'طلب OTP ناجح', tone: 'green' },
    auth_request_otp_failed: { label: 'فشل طلب OTP', tone: 'rose' },
    auth_request_otp_blocked: { label: 'منع طلب OTP', tone: 'amber' },
    auth_verify_otp_success: { label: 'تحقق OTP ناجح', tone: 'green' },
    auth_verify_otp_failed: { label: 'فشل تحقق OTP', tone: 'rose' },
    auth_verify_otp_blocked: { label: 'منع تحقق OTP', tone: 'amber' },
    auth_scenario_test: { label: 'اختبار سيناريو OTP', tone: 'violet' },
    auth_security_alert: { label: 'تنبيه أمني', tone: 'amber' },
    auth_lockout_cleared: { label: 'رفع القفل المؤقت', tone: 'sky' },
  };
  return map[action] || { label: action || 'حدث مصادقة', tone: 'blue' };
};

const getAuthReasonLabel = (reason) => ({
  password_login_disabled: 'الدخول بكلمة المرور معطل',
  invalid_password_or_inactive: 'كلمة المرور غير صحيحة أو الحساب غير نشط',
  user_not_found: 'الحساب غير موجود',
  role_disabled_for_school: 'الدور غير مفعل لهذه المدرسة',
  otp_only_user: 'الحساب مخصص للدخول بالرمز فقط',
  otp_disabled: 'خدمة OTP غير مفعلة',
  missing_identifier: 'لم يتم إدخال المعرّف',
  missing_identifier_or_code: 'الرمز أو المعرّف ناقص',
  delivery_disabled: 'القناة غير مفعلة',
  user_not_found_or_inactive: 'الحساب غير موجود أو غير نشط',
  user_not_eligible: 'الحساب غير مشمول بالخدمة',
  verification_failed: 'فشل التحقق من الرمز',
  dispatch_failed: 'فشل الإرسال',
  temporary_lockout: 'قفل مؤقت بسبب كثرة المحاولات الفاشلة',
  too_many_failed_attempts: 'محاولات فاشلة كثيرة',
})[reason] || reason || '—';

const SCHOOL_STAGE_OPTIONS = [
  { key: "primary", label: "ابتدائي" },
  { key: "middle", label: "متوسط" },
  { key: "secondary", label: "ثانوي" },
];

const SCHOOL_STAGE_GRADE_OPTIONS = {
  primary: [
    ["p1", "أول ابتدائي"],
    ["p2", "ثاني ابتدائي"],
    ["p3", "ثالث ابتدائي"],
    ["p4", "رابع ابتدائي"],
    ["p5", "خامس ابتدائي"],
    ["p6", "سادس ابتدائي"],
  ],
  middle: [
    ["m1", "أول متوسط"],
    ["m2", "ثاني متوسط"],
    ["m3", "ثالث متوسط"],
  ],
  secondary: [
    ["s1", "أول ثانوي"],
    ["s2", "ثاني ثانوي"],
    ["s3", "ثالث ثانوي"],
  ],
};

const IMPORT_FIELD_LABELS = {
  fullName: "اسم الطالب",
  identityNumber: "رقم الهوية / الإقامة",
  guardianMobile: "رقم الجوال",
  guardianName: "اسم ولي الأمر",
  notes: "الملاحظات",
};


const SCHOOL_GENDER_OPTIONS = [
  ["boys", "بنين"],
  ["girls", "بنات"],
  ["mixed", "مجمع"],
];

function schoolHasStructureClassrooms(school) {
  return Array.isArray(school?.structure?.classrooms) && school.structure.classrooms.length > 0;
}

function getStudentGroupingLabel(student, school) {
  if (!student) return '—';
  if (student.source === 'structure') {
    return student.companyName || student.classroomName || student.className || '—';
  }
  return school?.companies?.find((item) => item.id === student.companyId)?.name || student.companyName || student.className || '—';
}

function generateSchoolStructureClassrooms(stageConfigs = []) {
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

function getTransitionLabel(key) {
  return SCREEN_TRANSITION_OPTIONS.find((item) => item[0] === key)?.[1] || "تلاشي ناعم";
}

function getScreenTemplateLabel(key) {
  return SCREEN_TEMPLATE_OPTIONS.find((item) => item[0] === key)?.[1] || "مؤشرات تنفيذية";
}

function getDisplayMotionVariant(name) {
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

function getScreenTheme(theme) {
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

function getTickerTheme(bg) {
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

const initialSchools = [
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

const initialScanLog = [
  { id: 1, schoolId: 1, studentId: 1, companyId: 101, student: "أحمد إبراهيم أحمد الحربي", barcode: "ST-0001-ABH", date: "١٧‏/٠٩‏/١٤٤٧ هـ", isoDate: "2026-03-17", time: "06:19", method: "QR", result: "تم تسجيل حضور مبكر", deltaPoints: 5 },
  { id: 2, schoolId: 1, studentId: 3, companyId: 102, student: "يزن عامر إبراهيم عسيري", barcode: "ST-0003-ABH", date: "١٧‏/٠٩‏/١٤٤٧ هـ", isoDate: "2026-03-17", time: "06:24", method: "QR", result: "تم تسجيل حضور مبكر", deltaPoints: 5 },
  { id: 3, schoolId: 1, studentId: 5, companyId: 104, student: "سعد سالم مسفر الشهراني", barcode: "ST-0005-ABH", date: "١٧‏/٠٩‏/١٤٤٧ هـ", isoDate: "2026-03-17", time: "06:41", method: "QR", result: "تم تسجيل حضور في الوقت", deltaPoints: 3 },
];

const defaultActionCatalog = {
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

const defaultSettings = {
  platformName: "منصة الشركة المثالية",
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
  devices: {
    barcodeEnabled: true,
    faceEnabled: true,
    duplicateScanBlocked: true,
  },
  exportPrefix: "ideal-company-platform",
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
      fromName: 'منصة الشركة المثالية',
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

const roles = [
  { key: "superadmin", label: "الأدمن العام", icon: ShieldCheck },
  { key: "principal", label: "مدير المدرسة", icon: School },
  { key: "gate", label: "بوابة الحضور", icon: ScanLine },
  { key: "supervisor", label: "المشرف", icon: Users },
  { key: "teacher", label: "المعلم", icon: UserCircle2 },
  { key: "student", label: "الطالب", icon: QrCode },
];

const schoolRoleDefinitions = [
  { key: "principal", label: "مدير المدرسة" },
  { key: "teacher", label: "المعلمون" },
  { key: "supervisor", label: "المشرفون" },
  { key: "gate", label: "بوابة الحضور" },
  { key: "student", label: "الطلاب" },
];

const permissionDefinitions = [
  { key: "dashboard", label: "الرئيسية" },
  { key: "schools", label: "المدارس" },
  { key: "companies", label: "الشركات والفصول" },
  { key: "students", label: "الطلاب" },
  { key: "attendance", label: "الحضور الذكي" },
  { key: "actions", label: "إجراءات الطلاب" },
  { key: "points", label: "النقاط والترتيب" },
  { key: "reports", label: "التقارير" },
  { key: "deviceDisplays", label: "الشاشات والبوابات" },
  { key: "messages", label: "الرسائل والتنبيهات" },
  { key: "settings", label: "الإعدادات" },
  { key: "users", label: "المستخدمون والصلاحيات" },
];

const defaultPermissionsByRole = {
  superadmin: Object.fromEntries(permissionDefinitions.map((item) => [item.key, true])),
  principal: { dashboard: true, schools: false, companies: true, students: true, attendance: true, actions: true, points: true, reports: true, deviceDisplays: true, messages: true, settings: true, users: true },
  gate: { dashboard: true, schools: false, companies: false, students: false, attendance: true, actions: false, points: true, reports: false, deviceDisplays: false, messages: false, settings: false, users: false },
  supervisor: { dashboard: true, schools: false, companies: false, students: true, attendance: true, actions: true, points: true, reports: true, deviceDisplays: false, messages: false, settings: false, users: false },
  teacher: { dashboard: true, schools: false, companies: false, students: false, attendance: false, actions: true, points: true, reports: false, deviceDisplays: false, messages: false, settings: false, users: false },
  student: { dashboard: true, schools: false, companies: false, students: false, attendance: false, actions: false, points: true, reports: false, deviceDisplays: false, messages: false, settings: false, users: false },
};

const navItems = [
  { key: "dashboard", label: "الرئيسية", icon: LayoutDashboard, permission: "dashboard" },
  { key: "schools", label: "المدارس", icon: Building2, permission: "schools" },
  { key: "companies", label: "الشركات والفصول", icon: Layers3, permission: "companies" },
  { key: "students", label: "الطلاب", icon: GraduationCap, permission: "students" },
  { key: "attendance", label: "الحضور الذكي", icon: ScanLine, permission: "attendance" },
  { key: "actions", label: "إجراءات الطلاب", icon: ClipboardCheck, permission: "actions" },
  { key: "points", label: "النقاط والترتيب", icon: Trophy, permission: "points" },
  { key: "reports", label: "التقارير", icon: LineChart, permission: "reports" },
  { key: "deviceDisplays", label: "الشاشات والبوابات", icon: ExternalLink, permission: "deviceDisplays" },
  { key: "messages", label: "الرسائل والتنبيهات", icon: Bell, permission: "messages" },
  { key: "schoolStructure", label: "الهيكل المدرسي", icon: School, permission: "settings" },
  { key: "users", label: "المستخدمون", icon: ShieldCheck, permission: "users" },
  { key: "platformAuth", label: "الدخول والمصادقة", icon: ShieldCheck, permission: "settings", roles: ["superadmin"] },
  { key: "settings", label: "إعدادات المدرسة والتشغيل", icon: Settings, permission: "settings" },
  // صفحة الفصول تعرض تفاصيل كل فصل (شركة) والطلاب المرتبطين به
  { key: "classes", label: "الفصول", icon: BookOpen, permission: "companies" },
];

const principalDelegableRoles = ["gate", "supervisor", "teacher", "student"];
const principalManageablePermissionKeys = ["dashboard", "companies", "students", "attendance", "actions", "points", "reports", "messages"];

function buildRolePermissions(role, overrides = {}) {
  return {
    ...(defaultPermissionsByRole[role] || defaultPermissionsByRole.teacher),
    ...(overrides || {}),
  };
}

function clampDelegatedPermissions(actor, role, permissions = {}) {
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

function canPrincipalManageUser(currentUser, targetUser) {
  if (!currentUser || currentUser.role !== "principal") return false;
  if (!targetUser) return false;
  if (Number(currentUser.id) === Number(targetUser.id)) return false;
  if (Number(currentUser.schoolId) !== Number(targetUser.schoolId)) return false;
  return principalDelegableRoles.includes(targetUser.role);
}

function createDefaultSchoolAccess() {
  return {
    roleAccess: Object.fromEntries(schoolRoleDefinitions.map((item) => [item.key, true])),
    principalPermissions: buildRolePermissions("principal"),
  };
}

function getSchoolAccess(school) {
  const defaults = createDefaultSchoolAccess();
  return {
    roleAccess: {
      ...defaults.roleAccess,
      ...(school?.access?.roleAccess || {}),
    },
    principalPermissions: buildRolePermissions("principal", school?.access?.principalPermissions || defaults.principalPermissions),
  };
}

function createDefaultSmartLinks() {
  return {
    gates: [],
    screens: [],
  };
}

function normalizeSmartLinks(links) {
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
    tickerDir: item?.tickerDir === "ltr" ? "ltr" : "rtl",
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
    },
    createdAt: item?.createdAt || new Date().toISOString(),
  });
  return {
    gates: Array.isArray(links?.gates) ? links.gates.map(mapGate) : defaults.gates,
    screens: Array.isArray(links?.screens) ? links.screens.map(mapScreen) : defaults.screens,
  };
}

function isRoleEnabledForSchool(role, school) {
  if (role === "superadmin") return true;
  return getSchoolAccess(school).roleAccess?.[role] !== false;
}

function applySchoolAccessToUser(user, schools) {
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

function canAccessPermission(user, permission) {
  if (!user) return false;
  if (user.roleEnabled === false) return false;
  return Boolean(user.permissions?.[permission]);
}

function getRoleLabel(roleKey) {
  return roles.find((item) => item.key === roleKey)?.label || roleKey;
}

function getDefaultLandingPage(user) {
  if (user?.role === "teacher" && canAccessPermission(user, "actions")) return "actions";
  if (user?.role === "supervisor" && canAccessPermission(user, "reports")) return "reports";
  if (user?.role === "gate" && canAccessPermission(user, "attendance")) return "attendance";
  const firstAllowed = navItems.find((item) => canAccessPermission(user, item.permission));
  return firstAllowed?.key || "dashboard";
}

function schoolCodeSlug(code) {
  return String(code || "school").replace(/[^a-zA-Z0-9]+/g, "").toLowerCase() || "school";
}

function createSeedUsersForSchool(school, startId = 1) {
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
      id: startId + 2,
      name: `معلم ${school.name}`,
      username: `${slug}.teacher`,
      email: `${slug}.teacher@example.com`,
      password: "123456",
      role: "teacher",
      schoolId: school.id,
      studentId: null,
      status: "نشط",
      permissions: teacherPermissions,
    },
  ];
}


function ensureDemoUsers(users, schools) {
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
    });
  }

  return nextUsers;
}

function createDefaultUsers(schools) {
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

function hydrateUsers(users, schools) {
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
      password: user.password || "123456",
      role,
      schoolId: scopedSchoolId,
      studentId: user.studentId || null,
      status: user.status === "موقوف" ? "موقوف" : "نشط",
      permissions: buildRolePermissions(role, user.permissions || {}),
    };
  }).filter((user) => user.role === "superadmin" || user.schoolId !== null), schools);
}

const pieColors = ["#10b981", "#3b82f6", "#f59e0b", "#ef4444", "#94a3b8"];

function cx(...classes) {
  return classes.filter(Boolean).join(" ");
}

function safeNumber(value, fallback = 0) {
  const num = Number(value);
  return Number.isFinite(num) ? num : fallback;
}

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function createBarcode(schoolCode, serial) {
  return `ST-${String(serial).padStart(4, "0")}-${schoolCode.split("-")[0]}`;
}

async function generateQrDataUrl(value, size = 240) {
  return QRCode.toDataURL(String(value || ""), {
    width: size,
    margin: 1,
    errorCorrectionLevel: "M",
    color: { dark: "#0f172a", light: "#ffffff" },
  });
}

function getTodayIso() {
  return new Date().toISOString().slice(0, 10);
}

function toArabicDate(date = new Date()) {
  return new Intl.DateTimeFormat("ar-SA", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date);
}

function parseTimeToMinutes(value) {
  const [h = 0, m = 0] = String(value || "0:0").split(":").map(Number);
  return h * 60 + m;
}

function resultTone(result) {
  if (result.includes("فشل") || result.includes("مسبق")) return "rose";
  if (result.includes("مبكر")) return "green";
  if (result.includes("في الوقت")) return "blue";
  if (result.includes("تأخر")) return "amber";
  return "slate";
}

function statusFromResult(result) {
  if (result.includes("مبكر")) return "مبكر";
  if (result.includes("في الوقت")) return "في الوقت";
  if (result.includes("تأخر")) return "متأخر";
  return "غير معروف";
}

function createDefaultMessagingCenter() {
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

function hydrateMessagingCenter(center) {
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

function applyMessageVariables(template, payload = {}) {
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

function getTemplateCategoriesForEvent(eventType) {
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

function getDefaultTemplateForEvent(templates = [], eventType, preferredChannel = '') {
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

function hydrateSchools(schools) {
  return (schools || []).map((school) => ({
    ...school,
    access: getSchoolAccess(school),
    smartLinks: normalizeSmartLinks(school?.smartLinks),
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
  }));
}

function hydrateScanLog(logs) {
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

function hydrateActionCatalog(actions) {
  const labels = { rewards: "مكافأة", violations: "مخالفة", programs: "برنامج" };
  const normalizePoints = (mode, value) => {
    if (mode === "violations") return -Math.abs(safeNumber(value, -1));
    return Math.abs(safeNumber(value, 1));
  };

  const mapItems = (items, fallback, mode) => (Array.isArray(items) && items.length ? items : fallback).map((item, index) => ({
    id: item.id || `${mode}-${index + 1}`,
    title: item.title || `${labels[mode]} ${index + 1}`,
    points: normalizePoints(mode, item.points),
    description: item.description || "",
  }));

  return {
    rewards: mapItems(actions?.rewards, defaultActionCatalog.rewards, "rewards"),
    violations: mapItems(actions?.violations, defaultActionCatalog.violations, "violations"),
    programs: mapItems(actions?.programs, defaultActionCatalog.programs, "programs"),
  };
}

function hydrateActionLog(logs) {
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

function createDefaultState() {
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
    settings: {
      ...defaultSettings,
      policy: { ...defaultSettings.policy },
      points: { ...defaultSettings.points },
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

function buildHydratedClientState(parsed = {}, uiState = {}) {
  const schools = hydrateSchools(parsed.schools?.length ? parsed.schools : initialSchools);
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
    settings: {
      ...defaultSettings,
      ...(parsed.settings || {}),
      policy: { ...defaultSettings.policy, ...(parsed.settings?.policy || {}) },
      points: { ...defaultSettings.points, ...(parsed.settings?.points || {}) },
      devices: { ...defaultSettings.devices, ...(parsed.settings?.devices || {}) },
      actions: hydrateActionCatalog(parsed.settings?.actions || defaultSettings.actions),
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

function loadUiState() {
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

function loadServerCache() {
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

function loadPersistedState() {
  return buildHydratedClientState(loadServerCache(), loadUiState());
}

function saveUiState(payload) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(UI_STATE_KEY, JSON.stringify(payload));
}

function saveServerCache(payload) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(SERVER_CACHE_KEY, JSON.stringify(payload));
}

function saveSchoolStructureViewState(payload) {
  if (typeof window === "undefined") return;
  window.sessionStorage.setItem(SCHOOL_STRUCTURE_VIEW_KEY, JSON.stringify(payload || {}));
}

function readSchoolStructureViewState() {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.sessionStorage.getItem(SCHOOL_STRUCTURE_VIEW_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function clearSchoolStructureViewState() {
  if (typeof window === "undefined") return;
  window.sessionStorage.removeItem(SCHOOL_STRUCTURE_VIEW_KEY);
}


class PageErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, message: "" };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, message: error?.message || "حدث خطأ غير متوقع" };
  }

  componentDidCatch(error) {
    console.error(error);
  }

  componentDidUpdate(prevProps) {
    if (prevProps.resetKey !== this.props.resetKey && this.state.hasError) {
      this.setState({ hasError: false, message: "" });
    }
  }

  render() {
    if (this.state.hasError) {
      return (
        <SectionCard title="الهيكل المدرسي" icon={School}>
          <div className="rounded-3xl border border-rose-200 bg-rose-50 p-6 text-center shadow-sm">
            <div className="text-lg font-black text-rose-800">حدث خطأ في صفحة الهيكل المدرسي</div>
            <div className="mt-2 text-sm font-bold text-rose-700">{this.state.message || "تم إيقاف الصفحة مؤقتًا لحماية بقية المنصة من الشاشة البيضاء."}</div>
            <div className="mt-4 text-xs text-rose-600">ارجع إلى لوحة التحكم ثم افتح الصفحة مرة أخرى. إذا تكرر الخطأ فهذه النسخة ستبقي بقية المنصة تعمل بدل الانهيار الكامل.</div>
          </div>
        </SectionCard>
      );
    }
    return this.props.children;
  }
}

function getSessionToken() {
  if (typeof window === "undefined") return "";
  return window.localStorage.getItem(SESSION_TOKEN_KEY) || "";
}

function setSessionToken(token) {
  if (typeof window === "undefined") return;
  if (token) window.localStorage.setItem(SESSION_TOKEN_KEY, token);
  else window.localStorage.removeItem(SESSION_TOKEN_KEY);
}

async function apiRequest(path, { method = "GET", body, token } = {}) {
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
    throw new Error(data?.message || "تعذر تنفيذ الطلب على الخادم.");
  }
  return data;
}

function buildWsUrl(path) {
  if (typeof window === "undefined") return path;
  const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
  return `${protocol}//${window.location.host}${path}`;
}

function downloadFile(filename, content, mimeType) {
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

function buildCsv(rows, columns) {
  const escapeCell = (value) => `"${String(value ?? "").replace(/"/g, '""')}"`;
  const header = columns.map((col) => escapeCell(col.label)).join(",");
  const body = rows
    .map((row) => columns.map((col) => escapeCell(typeof col.render === "function" ? col.render(row) : row[col.key])).join(","))
    .join("\n");
  return `${header}\n${body}`;
}

function exportRowsToWorkbook(filename, sheetName, rows, columns) {
  const worksheetRows = [
    columns.map((col) => col.label),
    ...rows.map((row) => columns.map((col) => typeof col.render === "function" ? col.render(row) : row[col.key])),
  ];
  const worksheet = XLSX.utils.aoa_to_sheet(worksheetRows);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, sheetName || "Sheet1");
  XLSX.writeFile(workbook, filename);
}

function printHtmlContent(title, bodyHtml) {
  if (typeof window === "undefined") return;
  const printWindow = window.open("", "_blank", "width=1280,height=900");
  if (!printWindow) return;
  printWindow.document.write(`<!doctype html><html lang="ar" dir="rtl"><head><meta charset="utf-8" /><title>${title}</title><style>
    body{font-family:"Tahoma","Arial",sans-serif;background:#fff;color:#0f172a;padding:24px;direction:rtl}
    .wrap{max-width:1100px;margin:0 auto}
    h1{font-size:28px;margin:0 0 8px;font-weight:800}
    .meta{color:#475569;margin-bottom:20px;font-size:14px}
    table{width:100%;border-collapse:collapse;margin-top:18px}
    th,td{border:1px solid #cbd5e1;padding:10px 12px;text-align:right;font-size:14px}
    th{background:#f8fafc}
    .stats{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:12px;margin:18px 0}
    .stat{border:1px solid #e2e8f0;border-radius:14px;padding:12px;background:#f8fafc}
    .stat .k{font-size:12px;color:#64748b}
    .stat .v{font-size:22px;font-weight:800;margin-top:6px}
    @media print{body{padding:0}.wrap{max-width:none}.no-print{display:none}}
  </style></head><body><div class="wrap">${bodyHtml}</div></body></html>`);
  printWindow.document.close();
  printWindow.focus();
  setTimeout(() => {
    printWindow.print();
  }, 250);
}


function normalizeArabicHeader(value) {
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

const NOOR_IMPORT_ALIASES = {
  name: ["اسم الطالب", "الاسم", "اسم", "student name", "studentname"],
  nationalId: ["رقم الهوية", "السجل المدني", "هوية", "رقم السجل", "national id", "nationalid", "id number", "idnumber"],
  studentNumber: ["رقم الطالب", "الرقم الأكاديمي", "الرقم الاكاديمي", "student number", "studentno", "studentid", "student id"],
  grade: ["الصف", "المرحلة", "grade", "class grade"],
  className: ["الفصل", "الشعبة", "القسم", "الشعبه", "class", "section", "homeroom"],
  companyName: ["الشركة", "المجموعة", "الفريق", "company", "group", "team"],
};

const NOOR_IMPORT_ALIAS_MAP = Object.fromEntries(
  Object.entries(NOOR_IMPORT_ALIASES).map(([key, list]) => [key, list.map(normalizeArabicHeader)])
);

function normalizeImportRow(row) {
  const normalized = {};
  Object.entries(row || {}).forEach(([key, value]) => {
    normalized[normalizeArabicHeader(key)] = typeof value === "string" ? value.trim() : value;
  });
  return normalized;
}

function pickImportValue(normalizedRow, aliases) {
  for (const alias of aliases || []) {
    const value = normalizedRow[alias];
    if (value !== undefined && value !== null && String(value).trim() !== "") return String(value).trim();
  }
  return "";
}

function buildStudentNumberFromImport(schoolCode, serial, provided) {
  if (provided && String(provided).trim()) return String(provided).trim();
  return `${schoolCode.split("-")[0]}-${String(serial).padStart(4, "0")}`;
}

function buildTemplateStudentsCsv() {
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

function getPublicModeFromLocation() {
  if (typeof window === "undefined") return null;
  const params = new URLSearchParams(window.location.search);
  const gateToken = params.get("gate");
  const screenToken = params.get("screen");
  if (gateToken) return { type: "gate", token: gateToken };
  if (screenToken) return { type: "screen", token: screenToken };
  return null;
}

function buildPublicLink(kind, token) {
  if (typeof window === "undefined") return "";
  const url = new URL(window.location.origin + window.location.pathname);
  url.searchParams.set(kind, token);
  return url.toString();
}

function summarizeSchoolLiveState(school, scanLog = [], actionLog = []) {
  const today = getTodayIso();
  const unifiedStudents = getUnifiedSchoolStudents(school, { includeArchived: false, preferStructure: true });
  const companyRows = getUnifiedCompanyRows(school, { preferStructure: true });
  const schoolScans = (scanLog || []).filter((item) => item.schoolId === school?.id && item.isoDate === today && !String(item.result || '').includes('فشل') && !String(item.result || '').includes('مسبق'));
  const schoolActions = (actionLog || []).filter((item) => item.schoolId === school?.id && item.isoDate === today);
  const presentToday = new Set(schoolScans.map((item) => item.studentId).filter(Boolean)).size;
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

function getSchoolAttendanceBinding(school) {
  const hasStructure = schoolHasStructureClassrooms(school);
  const savedMode = school?.structure?.attendanceBinding?.sourceMode;
  return {
    sourceMode: hasStructure ? 'structure' : (savedMode || 'school'),
    linkedClassroomId: school?.structure?.attendanceBinding?.linkedClassroomId ? String(school.structure.attendanceBinding.linkedClassroomId) : "",
  };
}

function buildStructureAttendanceBarcode(school, classroom, student) {
  const schoolCode = String(school?.code || 'SCH').replace(/[^A-Za-z0-9]/g, '').toUpperCase().slice(0, 6) || 'SCH';
  const classroomCode = String(classroom?.name || classroom?.gradeLabel || 'CLS').replace(/\s+/g, '').slice(0, 6).toUpperCase();
  const studentCode = String(student?.identityNumber || student?.id || Date.now()).replace(/[^A-Za-z0-9]/g, '').slice(-8);
  return sanitizeBarcodeValue(`SS-${schoolCode}-${classroomCode}-${studentCode}`);
}

function getAttendanceStudentsSource(school) {
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

function findLabeledValueFromGrid(grid, label) {
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

function detectNoorOriginalRows(workbook) {
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

const CODE39_PATTERNS = {
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

function sanitizeBarcodeValue(value) {
  return String(value || "")
    .toUpperCase()
    .split("")
    .map((char) => (CODE39_PATTERNS[char] ? char : "-"))
    .join("");
}

function buildCode39Svg(value, { height = 64, includeText = true } = {}) {
  const safeValue = sanitizeBarcodeValue(value);
  const full = `*${safeValue}*`;
  const quiet = 12;
  const unit = 2;
  let x = quiet;
  const rects = [];

  full.split("").forEach((char, charIndex) => {
    const pattern = CODE39_PATTERNS[char] || CODE39_PATTERNS["-"];
    let cursor = x;
    for (let i = 0; i < pattern.length; i += 1) {
      if (pattern[i] === "1") {
        rects.push(`<rect x="${cursor}" y="0" width="${unit}" height="${height}" fill="#0f172a" />`);
      }
      cursor += unit;
    }
    x = cursor;
    if (charIndex < full.length - 1) x += unit;
  });

  const width = x + quiet;
  const textY = includeText ? height + 20 : height;
  const label = includeText ? `<text x="${width / 2}" y="${textY}" text-anchor="middle" font-family="monospace" font-size="14" fill="#0f172a">${safeValue}</text>` : "";
  const totalHeight = includeText ? height + 26 : height;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${totalHeight}" width="100%" height="100%" preserveAspectRatio="none" role="img" aria-label="Barcode ${safeValue}"><rect x="0" y="0" width="${width}" height="${totalHeight}" fill="#ffffff" rx="6" />${rects.join("")}${label}</svg>`;
}

function getFaceProfileState(student) {
  if (Array.isArray(student?.faceSignature) && student.faceSignature.length > 0) return "ready";
  if (student?.faceReady) return "pending";
  return "disabled";
}

function getFaceProfileLabel(student) {
  const state = getFaceProfileState(student);
  if (state === "ready") return "الوجه مسجل";
  if (state === "pending") return "بانتظار تسجيل الوجه";
  return "غير مفعّل";
}

function getFaceProfileTone(student) {
  const state = getFaceProfileState(student);
  if (state === "ready") return "green";
  if (state === "pending") return "amber";
  return "slate";
}

function fileToDataUrl(file) {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ""));
    reader.onerror = () => resolve("");
    reader.readAsDataURL(file);
  });
}

function loadImageSource(src) {
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


function getVisualSourceSize(source) {
  return {
    width: source?.videoWidth || source?.naturalWidth || source?.width || 0,
    height: source?.videoHeight || source?.naturalHeight || source?.height || 0,
  };
}

function drawVisualSourceToCanvas(source, maxSide = 960) {
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

function captureDataUrlFromVideo(video, quality = 0.92) {
  const drawn = drawVisualSourceToCanvas(video, 1280);
  return drawn?.canvas?.toDataURL("image/jpeg", quality) || "";
}

async function detectFaceBounds(image) {
  if (typeof window === "undefined" || !("FaceDetector" in window)) return null;
  try {
    const detector = new window.FaceDetector({ fastMode: true, maxDetectedFaces: 1 });
    const faces = await detector.detect(image);
    return faces?.[0]?.boundingBox || null;
  } catch {
    return null;
  }
}

async function buildFaceTemplateFromSource(photo) {
  const image = await loadImageSource(photo);
  const bounds = await detectFaceBounds(image);
  const size = 16;
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const context = canvas.getContext("2d", { willReadFrequently: true });
  const sx = bounds?.x ?? 0;
  const sy = bounds?.y ?? 0;
  const sw = bounds?.width ?? image.width;
  const sh = bounds?.height ?? image.height;
  context.drawImage(image, sx, sy, sw, sh, 0, 0, size, size);
  const pixels = context.getImageData(0, 0, size, size).data;
  const values = [];
  for (let index = 0; index < pixels.length; index += 4) {
    const gray = Math.round((pixels[index] * 0.299) + (pixels[index + 1] * 0.587) + (pixels[index + 2] * 0.114));
    values.push(gray);
  }
  const average = values.reduce((sum, value) => sum + value, 0) / Math.max(values.length, 1);
  const signature = values.map((value) => Math.max(0, Math.min(255, Math.round(value - average + 128))));
  const hasNativeFaceDetector = typeof window !== "undefined" && "FaceDetector" in window;
  return { photo, signature, faceDetected: hasNativeFaceDetector ? Boolean(bounds) : true };
}

async function buildFaceTemplateFromFile(file) {
  const photo = await fileToDataUrl(file);
  return buildFaceTemplateFromSource(photo);
}

async function buildFaceTemplateFromDataUrl(photo) {
  return buildFaceTemplateFromSource(photo);
}

async function detectBarcodeValueFromSource(source) {
  if (typeof window === "undefined") return "";
  try {
    const target = typeof source === "string" ? await loadImageSource(source) : source;
    if (!target) return "";

    if ("BarcodeDetector" in window) {
      const detector = new window.BarcodeDetector({ formats: ["qr_code", "code_39", "code_128"] });
      const codes = await detector.detect(target);
      const rawValue = String(codes?.[0]?.rawValue || codes?.[0]?.displayValue || "").trim();
      if (rawValue) return sanitizeBarcodeValue(rawValue);
    }

    if (!jsQR) return "";
    const drawn = drawVisualSourceToCanvas(target, 960);
    if (!drawn) return "";
    const imageData = drawn.context.getImageData(0, 0, drawn.width, drawn.height);
    const result = jsQR(imageData.data, drawn.width, drawn.height, { inversionAttempts: "attemptBoth" });
    return sanitizeBarcodeValue(String(result?.data || "").trim());
  } catch {
    return "";
  }
}

function compareFaceSignatures(baseSignature, candidateSignature) {
  if (!Array.isArray(baseSignature) || !Array.isArray(candidateSignature)) return Number.POSITIVE_INFINITY;
  const length = Math.min(baseSignature.length, candidateSignature.length);
  if (!length) return Number.POSITIVE_INFINITY;
  let total = 0;
  for (let index = 0; index < length; index += 1) total += Math.abs(baseSignature[index] - candidateSignature[index]);
  return total / length;
}

function findBestFaceMatch(signature, students, maxScore = 28) {
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

function getUnifiedSchoolStudents(school, { includeArchived = false, preferStructure = true } = {}) {
  if (!school) return [];
  const structureClassrooms = Array.isArray(school?.structure?.classrooms) ? school.structure.classrooms : [];
  const structureStudents = structureClassrooms.flatMap((classroom) => (Array.isArray(classroom.students) ? classroom.students : [])
    .filter((student) => includeArchived || String(student?.status || 'active') !== 'archived')
    .map((student) => ({
      id: `structure-${classroom.id}-${student.id}`,
      rawId: student.id,
      source: 'structure',
      name: student.fullName || student.name || 'طالب',
      fullName: student.fullName || student.name || 'طالب',
      studentNumber: String(student.studentNumber || student.id || ''),
      nationalId: String(student.identityNumber || student.nationalId || '').trim(),
      guardianMobile: String(student.guardianMobile || '').trim(),
      guardianName: String(student.guardianName || '').trim(),
      notes: String(student.notes || '').trim(),
      barcode: buildStructureAttendanceBarcode(school, classroom, student),
      grade: classroom.gradeLabel || classroom.stageLabel || classroom.stage || '',
      className: classroom.name || classroom.gradeLabel || 'فصل',
      classroomId: String(classroom.id),
      classroomName: classroom.name || classroom.gradeLabel || 'فصل',
      companyName: classroom.companyName || classroom.name || '—',
      companyId: null,
      status: student.status === 'archived' ? 'مؤرشف' : (student.attendanceStatus || 'غير مسجل'),
      attendanceRate: Number(student.attendanceRate || 0),
      points: Number(student.points || 0),
      faceReady: Boolean(student.faceReady || student.facePhoto),
      facePhoto: student.facePhoto || '',
      faceSignature: Array.isArray(student.faceSignature) ? student.faceSignature : [],
    })));

  const baseStudents = Array.isArray(school.students) ? school.students.map((student) => ({ ...student, source: student.source || 'school', rawId: student.id })) : [];
  if (preferStructure && structureStudents.length) return structureStudents;
  return [...structureStudents, ...baseStudents];
}

function sortUnifiedCompanyRows(rows = []) {
  return [...rows].sort((a, b) => String(a.className || a.name || '').localeCompare(String(b.className || b.name || ''), 'ar', { numeric: true, sensitivity: 'base' }) || String(a.name || '').localeCompare(String(b.name || ''), 'ar', { numeric: true, sensitivity: 'base' }));
}

function getUnifiedCompanyRows(school, { preferStructure = true } = {}) {
  if (!school) return [];
  const classrooms = Array.isArray(school?.structure?.classrooms) ? school.structure.classrooms : [];
  if (preferStructure && classrooms.length) {
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

function normalizeSearchDigits(value) {
  return String(value || '').replace(/[٠-٩]/g, (digit) => String("٠١٢٣٤٥٦٧٨٩".indexOf(digit))).replace(/[۰-۹]/g, (digit) => String("۰۱۲۳۴۵۶۷۸۹".indexOf(digit)));
}

function normalizeSearchToken(value) {
  return normalizeSearchDigits(value).replace(/\s+/g, '').trim();
}

function findStudentByKeyword(school, keyword) {
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

async function createStudentCardMarkup(student, schoolName, companyName) {
  const qrDataUrl = await generateQrDataUrl(student.barcode, 320);
  return `<!doctype html><html lang="ar" dir="rtl"><head><meta charset="UTF-8" /><meta name="viewport" content="width=device-width, initial-scale=1.0" /><title>بطاقة ${student.name}</title><style>body{font-family:Tahoma,Arial,sans-serif;background:#f8fafc;margin:0;padding:24px}.card{width:760px;max-width:100%;margin:0 auto;background:linear-gradient(135deg,#0f172a,#155e75);border-radius:28px;padding:28px;color:#fff}.title{font-size:28px;font-weight:800}.meta{opacity:.9;margin-top:8px;line-height:1.8}.panel{margin-top:20px;background:#fff;color:#0f172a;border-radius:20px;padding:18px}.qr{display:flex;justify-content:center;align-items:center;padding:14px;background:#fff;border-radius:18px;border:1px solid #e2e8f0}.qr img{width:220px;height:220px;object-fit:contain}.footer{margin-top:14px;display:flex;justify-content:space-between;font-size:14px;color:#475569}</style></head><body><div class="card"><div class="title">بطاقة الطالب الذكية</div><div class="meta">${student.name}<br />${schoolName}<br />${companyName}</div><div class="panel"><div style="font-size:12px;color:#64748b">QR Code المعتمد</div><div style="margin-top:8px;font-family:monospace;font-weight:700">${student.barcode}</div><div class="qr"><img src="${qrDataUrl}" alt="QR ${student.barcode}" /></div><div class="footer"><span>الهوية: ${student.nationalId}</span><span>حالة الوجه: ${getFaceProfileLabel(student)}</span></div></div></div></body></html>`;
}

function Badge({ children, tone = "green" }) {
  const tones = {
    green: "bg-emerald-100 text-emerald-700",
    blue: "bg-sky-100 text-sky-700",
    amber: "bg-amber-100 text-amber-700",
    slate: "bg-slate-100 text-slate-700",
    rose: "bg-rose-100 text-rose-700",
    violet: "bg-violet-100 text-violet-700",
  };
  return <span className={`inline-flex rounded-full px-3 py-1 text-xs font-bold ${tones[tone]}`}>{children}</span>;
}

function SectionCard({ title, icon: Icon, children, action, className = "" }) {
  return (
    <div className={cx("overflow-hidden rounded-3xl bg-white shadow-sm ring-1 ring-slate-200", className)}>
      <div className="flex items-center justify-between gap-3 border-b border-slate-100 px-5 py-4">
        <div className="flex min-w-0 items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-sky-100 text-sky-700">
            <Icon className="h-5 w-5" />
          </div>
          <h3 className="truncate font-bold text-slate-800">{title}</h3>
        </div>
        {action}
      </div>
      <div className="p-5">{children}</div>
    </div>
  );
}

function StatCard({ title, value, subtitle, icon: Icon }) {
  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="rounded-3xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="text-sm text-slate-500">{title}</div>
          <div className="mt-2 text-3xl font-extrabold text-slate-800">{value}</div>
          <div className="mt-1 text-sm text-slate-500">{subtitle}</div>
        </div>
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-700">
          <Icon className="h-6 w-6" />
        </div>
      </div>
    </motion.div>
  );
}

function Input({ label, className = "", ...props }) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-bold text-slate-700">{label}</span>
      <input {...props} className={cx("w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none", className)} />
    </label>
  );
}

function Select({ label, className = "", children, ...props }) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-bold text-slate-700">{label}</span>
      <select {...props} className={cx("w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none", className)}>
        {children}
      </select>
    </label>
  );
}

function DataTable({ columns, rows, emptyMessage = "لا توجد بيانات حالياً" }) {
  return (
    <div className="overflow-auto rounded-2xl ring-1 ring-slate-200">
      <table className="min-w-full bg-white text-sm">
        <thead className="bg-slate-50">
          <tr>
            {columns.map((col) => (
              <th key={col.key} className="whitespace-nowrap px-4 py-3 text-right font-bold text-slate-700">{col.label}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.length === 0 ? (
            <tr>
              <td colSpan={columns.length} className="px-4 py-10 text-center text-slate-500">{emptyMessage}</td>
            </tr>
          ) : (
            rows.map((row, index) => (
              <tr key={row.id ?? index} className="border-t border-slate-100 hover:bg-slate-50/70">
                {columns.map((col) => (
                  <td key={col.key} className="whitespace-nowrap px-4 py-3 align-top text-slate-700">
                    {typeof col.render === "function" ? col.render(row) : row[col.key]}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}

function SummaryBox({ label, value, color = "text-slate-900" }) {
  return (
    <div className="rounded-2xl bg-white p-4 text-center ring-1 ring-slate-200">
      <div className={cx("text-2xl font-black", color)}>{value}</div>
      <div className="text-sm text-slate-500">{label}</div>
    </div>
  );
}

function MetricTile({ label, value, hint }) {
  return (
    <div className="rounded-2xl bg-slate-50 p-4 ring-1 ring-slate-200">
      <div className="text-sm text-slate-500">{label}</div>
      <div className="mt-2 text-2xl font-black text-slate-800">{value}</div>
      {hint ? <div className="mt-1 text-xs text-slate-500">{hint}</div> : null}
    </div>
  );
}

function QrCodeVisual({ value, size = 172, className = "", imageClassName = "" }) {
  const [src, setSrc] = useState("");

  useEffect(() => {
    let cancelled = false;
    generateQrDataUrl(value, size).then((url) => {
      if (!cancelled) setSrc(url);
    }).catch(() => {
      if (!cancelled) setSrc("");
    });
    return () => {
      cancelled = true;
    };
  }, [value, size]);

  if (!src) {
    return <div className={cx("flex items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-white text-xs text-slate-400", className)} style={{ width: size, height: size }}>جارٍ توليد QR</div>;
  }

  return <img src={src} alt={`QR ${value}`} className={cx("rounded-2xl bg-white object-contain", className, imageClassName)} style={{ width: size, height: size }} />;
}

function LiveCameraPanel({ mode = "face", title, description, onCapture, onDetectBarcode, onDetectFace, variant = "default", autoStart = false, hideDeviceSelect = false, videoHeightClass = "h-56" }) {
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const timerRef = useRef(null);
  const readyTimerRef = useRef(null);
  const successTimerRef = useRef(null);
  const hasAutoStartedRef = useRef(false);
  const [active, setActive] = useState(false);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [devices, setDevices] = useState([]);
  const [selectedDeviceId, setSelectedDeviceId] = useState("");
  const [cameraReady, setCameraReady] = useState(false);
  const [showGreenFrame, setShowGreenFrame] = useState(false);

  const clearReadyWatcher = useCallback(() => {
    if (readyTimerRef.current) {
      window.clearInterval(readyTimerRef.current);
      readyTimerRef.current = null;
    }
  }, []);

  const flashSuccessFrame = useCallback((label = "تمت القراءة بنجاح") => {
    setCameraReady(true);
    setShowGreenFrame(true);
    setMessage(label);
    if (successTimerRef.current) window.clearTimeout(successTimerRef.current);
    successTimerRef.current = window.setTimeout(() => {
      setShowGreenFrame(false);
      successTimerRef.current = null;
    }, 1800);
  }, []);

  const stopCamera = useCallback(() => {
    if (timerRef.current) {
      window.clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    clearReadyWatcher();
    if (successTimerRef.current) {
      window.clearTimeout(successTimerRef.current);
      successTimerRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.pause?.();
      videoRef.current.srcObject = null;
    }
    setActive(false);
    setCameraReady(false);
    setShowGreenFrame(false);
  }, [clearReadyWatcher]);

  const loadDevices = useCallback(async () => {
    if (!(navigator.mediaDevices?.enumerateDevices)) return;
    try {
      const list = await navigator.mediaDevices.enumerateDevices();
      const cameras = list.filter((item) => item.kind === "videoinput");
      setDevices(cameras);
      if (!selectedDeviceId && cameras[0]?.deviceId) setSelectedDeviceId(cameras[0].deviceId);
    } catch {
      // ignore
    }
  }, [selectedDeviceId]);

  useEffect(() => {
    loadDevices();
  }, [loadDevices]);

  const applyStreamToVideo = useCallback(async (stream) => {
    const video = videoRef.current;
    if (!video) return false;
    if (!stream || !stream.active) return false;
    // Reset first to avoid stale srcObject on iOS
    video.pause?.();
    video.srcObject = null;
    video.load?.();
    video.muted = true;
    video.autoplay = true;
    video.playsInline = true;
    video.setAttribute("muted", "");
    video.setAttribute("autoplay", "");
    video.setAttribute("playsinline", "");
    video.setAttribute("webkit-playsinline", "");
    // Small delay to let iOS release previous stream
    await new Promise((resolve) => window.setTimeout(resolve, 80));
    video.srcObject = stream;
    await new Promise((resolve) => {
      const finalize = () => { video.onloadedmetadata = null; resolve(true); };
      video.onloadedmetadata = finalize;
      // iOS sometimes fires canplay instead of loadedmetadata
      video.oncanplay = finalize;
      window.setTimeout(finalize, 1200);
    });
    video.oncanplay = null;
    try {
      const playPromise = video.play();
      if (playPromise !== undefined) await playPromise;
    } catch (err) {
      // NotAllowedError on autoStart without user gesture - show play button
      if (err && err.name === 'NotAllowedError') {
        setError('اضغط على زر تشغيل الكاميرا لبدء البث.');
      }
    }
    // Extra play attempt after short delay for iOS Safari
    window.setTimeout(async () => {
      if (videoRef.current && videoRef.current.paused && videoRef.current.srcObject) {
        try { await videoRef.current.play(); } catch { /* ignore */ }
      }
    }, 400);
    return Boolean(video.videoWidth || video.readyState >= 2);
  }, []);

  const startCamera = useCallback(async () => {
    if (!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia)) {
      setError("الكاميرا غير متاحة في هذا المتصفح أو الجهاز.");
      return;
    }
    stopCamera();
    setError("");
    setCameraReady(false);
    setShowGreenFrame(false);
    setMessage(mode === "barcode" ? "وجّه QR الطالب نحو الكاميرا وستجري القراءة مباشرة دون الحاجة إلى تصوير." : mode === "mixed" ? "وجّه QR أو الوجه داخل الإطار وسيتم التعرف تلقائيًا." : "وجّه الوجه داخل الإطار وستجري المطابقة المباشرة تلقائيًا.");
    const preferredFacing = mode === "barcode" ? "environment" : mode === "mixed" ? "environment" : "user";
    const attempts = [];
    if (selectedDeviceId) attempts.push({ video: { deviceId: { exact: selectedDeviceId }, width: { ideal: 1280 }, height: { ideal: 720 } }, audio: false });
    attempts.push({ video: { facingMode: { ideal: preferredFacing }, width: { ideal: 1280 }, height: { ideal: 720 } }, audio: false });
    attempts.push({ video: true, audio: false });

    let stream = null;
    for (const constraints of attempts) {
      try {
        stream = await navigator.mediaDevices.getUserMedia(constraints);
        if (stream) break;
      } catch {
        // try next fallback
      }
    }
    if (!stream) {
      setError("تعذر تشغيل الكاميرا. تأكد من منح الصلاحية للمتصفح أو جرّب متصفح Chrome/Edge.");
      return;
    }
    streamRef.current = stream;
    const applied = await applyStreamToVideo(stream);
    if (!applied && !videoRef.current?.videoWidth) {
      // stream may still be starting; continue and let the readyWatcher detect it
    }
    const firstTrack = stream.getVideoTracks?.()[0];
    const currentLabel = firstTrack?.label || "";
    if (currentLabel && devices.length) {
      const matching = devices.find((item) => item.label === currentLabel);
      if (matching?.deviceId) setSelectedDeviceId(matching.deviceId);
    }
    setActive(true);
    clearReadyWatcher();
    readyTimerRef.current = window.setInterval(() => {
      const video = videoRef.current;
      if (video?.videoWidth && video?.videoHeight) {
        setCameraReady(true);
        clearReadyWatcher();
      }
    }, 200);
    window.setTimeout(() => {
      const video = videoRef.current;
      if (streamRef.current && !(video?.videoWidth && video?.videoHeight)) {
        // Try one more play() before showing error (iOS may need extra nudge)
        video?.play?.().catch(() => {});
        window.setTimeout(() => {
          if (streamRef.current && !(videoRef.current?.videoWidth && videoRef.current?.videoHeight)) {
            setError("الكاميرا فُتحت لكن لم يصل بث الصورة. جرّب إعادة التشغيل أو بدّل مصدر الكاميرا.");
          }
        }, 1500);
      }
    }, 4000);
    loadDevices();
  }, [applyStreamToVideo, clearReadyWatcher, devices, loadDevices, mode, selectedDeviceId, stopCamera]);

  useEffect(() => () => stopCamera(), [stopCamera]);

  useEffect(() => () => {
    if (successTimerRef.current) {
      window.clearTimeout(successTimerRef.current);
      successTimerRef.current = null;
    }
  }, []);

  useEffect(() => {
    if (!(active && ["barcode", "mixed"].includes(mode) && onDetectBarcode && videoRef.current)) return undefined;
    let cancelled = false;
    let processing = false;

    const tick = async () => {
      if (cancelled || !videoRef.current || processing) return;
      if (!(videoRef.current.videoWidth && videoRef.current.videoHeight)) {
        timerRef.current = window.setTimeout(tick, 500);
        return;
      }
      processing = true;
      try {
        const value = await detectBarcodeValueFromSource(videoRef.current);
        if (value) {
          flashSuccessFrame(`تمت قراءة QR مباشرة: ${value}`);
          window.setTimeout(() => onDetectBarcode(value), 220);
          window.setTimeout(() => stopCamera(), 1900);
          return;
        }
      } catch {
        // ignore
      } finally {
        processing = false;
      }
      timerRef.current = window.setTimeout(tick, 350);
    };

    timerRef.current = window.setTimeout(tick, 500);
    return () => {
      cancelled = true;
      if (timerRef.current) {
        window.clearTimeout(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [active, flashSuccessFrame, mode, onDetectBarcode, stopCamera]);

  useEffect(() => {
    if (!(active && ["face", "mixed"].includes(mode) && onDetectFace && videoRef.current)) return undefined;
    let cancelled = false;
    let processing = false;

    const tick = async () => {
      if (cancelled || !videoRef.current || processing) return;
      if (!(videoRef.current.videoWidth && videoRef.current.videoHeight)) {
        timerRef.current = window.setTimeout(tick, 700);
        return;
      }
      processing = true;
      try {
        const dataUrl = captureDataUrlFromVideo(videoRef.current, 0.88);
        if (dataUrl) {
          const result = await onDetectFace(dataUrl);
          if (result) {
            const name = typeof result === "object" ? result.name : "الطالب";
            flashSuccessFrame(`تمت المطابقة المباشرة للوجه${name ? `: ${name}` : ""}`);
            window.setTimeout(() => stopCamera(), 1900);
            return;
          }
        }
      } catch {
        // ignore
      } finally {
        processing = false;
      }
      timerRef.current = window.setTimeout(tick, mode === "mixed" ? 1500 : 1200);
    };

    timerRef.current = window.setTimeout(tick, 900);
    return () => {
      cancelled = true;
      if (timerRef.current) {
        window.clearTimeout(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [active, flashSuccessFrame, mode, onDetectFace, stopCamera]);

  useEffect(() => {
    if (!autoStart || hasAutoStartedRef.current) return undefined;
    hasAutoStartedRef.current = true;
    const id = window.setTimeout(() => {
      if (!streamRef.current && !active) startCamera();
    }, 120);
    return () => window.clearTimeout(id);
  }, [autoStart, active, startCamera]);

  const captureFrame = async () => {
    if (!videoRef.current || !active) return;
    const video = videoRef.current;
    if (!(video.videoWidth && video.videoHeight)) {
      setMessage("الكاميرا لم تكن جاهزة بعد، جرّب مرة أخرى.");
      return;
    }
    const dataUrl = captureDataUrlFromVideo(video, 0.92);
    if (!dataUrl) return;

    if (mode === "barcode") {
      const value = await detectBarcodeValueFromSource(dataUrl);
      if (value) {
        flashSuccessFrame(`تم التعرف على QR: ${value}`);
        onDetectBarcode?.(value);
      } else {
        setMessage("لم يتم التعرف على QR من هذه اللقطة. حاول تقريب البطاقة أو تحسين الإضاءة.");
      }
    }

    if (onCapture) {
      setBusy(true);
      try {
        await onCapture(dataUrl);
        if (mode === "face") flashSuccessFrame("تم التقاط الصورة الاحتياطية وإرسالها للمعالجة.");
      } finally {
        setBusy(false);
      }
    }
  };

  return (
    <div className="rounded-3xl bg-white p-4 ring-1 ring-slate-200">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="font-bold text-slate-800">{title}</div>
          {description ? <div className="mt-1 text-sm leading-7 text-slate-500">{description}</div> : null}
        </div>
        <Badge tone={active ? (cameraReady ? "green" : "amber") : "slate"}>{active ? (cameraReady ? "الكاميرا جاهزة" : "جارٍ التهيئة") : "الكاميرا متوقفة"}</Badge>
      </div>
      {!hideDeviceSelect && devices.length > 1 ? (
        <div className="mt-4">
          <Select label="مصدر الكاميرا" value={selectedDeviceId} onChange={(e) => setSelectedDeviceId(e.target.value)}>
            {devices.map((device, index) => (
              <option key={device.deviceId || index} value={device.deviceId}>{device.label || `كاميرا ${index + 1}`}</option>
            ))}
          </Select>
        </div>
      ) : null}
      <div className={cx("relative mt-4 overflow-hidden rounded-2xl bg-slate-900", variant === "gate" ? "border border-white/10 shadow-2xl" : "") }>
        {active ? <video ref={videoRef} className={cx(videoHeightClass, "w-full object-cover")} muted playsInline autoPlay onCanPlay={() => { if (videoRef.current?.videoWidth && videoRef.current?.videoHeight) { setCameraReady(true); clearReadyWatcher(); } }} /> : <div className={cx("flex items-center justify-center px-5 text-center text-sm text-white/80", videoHeightClass)}>افتح الكاميرا من هنا لالتقاط الوجه أو قراءة QR مباشرة من اللابتوب أو الآيباد أو الجوال.</div>}
        <div className="pointer-events-none absolute inset-0">
          <div className={cx("absolute inset-4 rounded-[28px] border-4 transition-all duration-200", showGreenFrame ? "border-emerald-400 shadow-[0_0_0_4px_rgba(16,185,129,0.18),0_0_35px_rgba(16,185,129,0.35)]" : cameraReady ? "border-white/70" : "border-amber-300/80 animate-pulse")} />
          <div className="absolute inset-x-0 top-4 flex justify-center">
            <div className={cx("rounded-full px-4 py-2 text-xs font-black shadow-lg", showGreenFrame ? "bg-emerald-500 text-white" : cameraReady ? "bg-slate-900/70 text-white" : "bg-amber-400 text-slate-900")}>{showGreenFrame ? "تمت القراءة" : cameraReady ? (mode === "barcode" ? "وجّه QR داخل الإطار" : mode === "face" ? "وجّه الوجه داخل الإطار" : "وجّه QR أو الوجه داخل الإطار") : "جارٍ تهيئة الكاميرا"}</div>
          </div>
          {!cameraReady && active ? <div className="absolute inset-0 flex items-center justify-center bg-slate-950/35"><div className="rounded-3xl bg-slate-950/75 px-5 py-4 text-center text-sm font-bold text-white ring-1 ring-white/10">إذا بقيت الشاشة سوداء فبدّل مصدر الكاميرا أو اضغط إعادة التشغيل.</div></div> : null}
        </div>
      </div>
      {message ? <div className={cx("mt-3 rounded-2xl px-4 py-3 text-sm ring-1", showGreenFrame ? "bg-emerald-50 text-emerald-700 ring-emerald-100" : "bg-slate-50 text-slate-600 ring-slate-200")}>{message}</div> : null}
      {error ? <div className="mt-3 rounded-2xl bg-rose-50 px-4 py-3 text-sm font-bold text-rose-700 ring-1 ring-rose-100">{error}</div> : null}
      <div className={cx("mt-4 flex flex-wrap gap-3", variant === "gate" ? "justify-center" : "") }>
        {!active ? <button onClick={startCamera} className="rounded-2xl bg-sky-700 px-4 py-3 text-sm font-bold text-white">تشغيل الكاميرا</button> : <button onClick={stopCamera} className="rounded-2xl bg-slate-100 px-4 py-3 text-sm font-bold text-slate-700">إيقاف الكاميرا</button>}
        <button onClick={captureFrame} disabled={!active || busy} className={cx("rounded-2xl px-4 py-3 text-sm font-bold", !active || busy ? "bg-slate-200 text-slate-500" : "bg-emerald-600 text-white")}>{busy ? "جارٍ المعالجة..." : "التقاط احتياطي"}</button>
        <button onClick={() => { stopCamera(); window.setTimeout(() => startCamera(), 300); }} className="rounded-2xl bg-white px-4 py-3 text-sm font-bold text-slate-700 ring-1 ring-slate-200">إعادة تشغيل</button>
      </div>
      {mode === "barcode" ? <div className="mt-3 text-xs leading-6 text-slate-500">القراءة المباشرة تعمل تلقائيًا ما دامت الكاميرا مفعلة، وعند النجاح سيظهر إطار أخضر واضح يعطي إحساس القراءة الناجحة.</div> : mode === "mixed" ? <div className="mt-3 text-xs leading-6 text-slate-500">الكاميرا الواحدة تقرأ QR أو الوجه تلقائيًا، وعند النجاح سيظهر إطار أخضر داخل المشهد. عند عدم التعرّف جرّب إعادة التشغيل أو الالتقاط الاحتياطي.</div> : <div className="mt-3 text-xs leading-6 text-slate-500">إذا ظهرت شاشة سوداء على بعض الأجهزة، بدّل مصدر الكاميرا أو استخدم إعادة التشغيل؛ تمت إضافة إطار تهيئة واضح حتى تعرف متى أصبحت الكاميرا جاهزة فعليًا.</div>}
    </div>
  );
}

function BarcodeCard({ student, companyName, schoolName, action }) {
  return (
    <div className="rounded-[2rem] bg-gradient-to-l from-slate-900 to-slate-700 p-5 text-white shadow-lg">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="text-xs text-white/70">بطاقة طالب ذكية</div>
          <div className="mt-1 text-lg font-extrabold leading-7">{student.name}</div>
          <div className="text-sm text-white/75">{schoolName}</div>
          <div className="text-sm text-white/75">{companyName}</div>
        </div>
        <Badge tone={getFaceProfileTone(student)}>{getFaceProfileLabel(student)}</Badge>
      </div>
      <div className="mt-4 rounded-2xl bg-white p-4 text-slate-900">
        <div className="text-xs text-slate-500">QR Code المعتمد</div>
        <div className="mt-1 break-all font-mono text-sm font-bold">{student.barcode}</div>
        <div className="mt-4 flex justify-center rounded-xl border border-slate-200 bg-white p-3">
          <QrCodeVisual value={student.barcode} size={172} />
        </div>
        <div className="mt-2 flex items-center justify-between text-xs text-slate-500">
          <span>جاهز للطباعة والمسح من الجوال</span>
          <span>{student.nationalId}</span>
        </div>
        {action ? <div className="mt-4">{action}</div> : null}
      </div>
    </div>
  );
}


function formatEnglishDigits(value) {
  const num = Number(value);
  if (!Number.isFinite(num)) return String(value ?? '');
  return new Intl.NumberFormat('en-US').format(num);
}

function clampScreenLabel(value, max = 22) {
  const text = String(value || '');
  return text.length > max ? `${text.slice(0, max - 1)}…` : text;
}

function ScreenAxisTick({ x, y, payload, width = 280 }) {
  return (
    <g transform={`translate(${x},${y})`}>
      <foreignObject x={-width} y={-26} width={width} height={60}>
        <div
          xmlns="http://www.w3.org/1999/xhtml"
          style={{
            width: `${width}px`,
            fontSize: '24px',
            fontWeight: 900,
            color: '#0f172a',
            overflow: 'hidden',
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            lineHeight: 1.15,
            direction: 'rtl',
            textAlign: 'right',
            wordBreak: 'break-word',
          }}
          title={String(payload?.value || '')}
        >
          {String(payload?.value || '')}
        </div>
      </foreignObject>
    </g>
  );
}

function ScreenBarValueLabel({ x, y, width, value, suffix = '' }) {
  const text = `${formatEnglishDigits(value)}${suffix}`;
  const labelWidth = Math.max(92, 26 + text.length * 12);
  const labelX = x + width + 14;
  return (
    <g>
      <rect x={labelX} y={y - 6} rx="14" ry="14" width={labelWidth} height="40" fill="#0f172a" opacity="0.96" />
      <text x={labelX + labelWidth / 2} y={y + 20} textAnchor="middle" fill="#ffffff" fontSize="22" fontWeight="900">
        {text}
      </text>
    </g>
  );
}

function MiniAttendanceRing({ value }) {
  const safeValue = Math.max(0, Math.min(100, Number(value) || 0));
  const chartData = [
    { name: 'الحضور', value: safeValue, fill: '#0ea5e9' },
    { name: 'الباقي', value: Math.max(0, 100 - safeValue), fill: '#dbeafe' },
  ];

  return (
    <div className="flex flex-col items-center justify-center">
      <div className="h-44 w-full max-w-[240px]">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie data={chartData} dataKey="value" innerRadius={46} outerRadius={66} startAngle={90} endAngle={-270} stroke="none" paddingAngle={0}>
              {chartData.map((entry, index) => <Cell key={`${entry.name}-${index}`} fill={entry.fill} />)}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
      </div>
      <div className="-mt-28 text-center">
        <div className="text-6xl font-black text-sky-700 xl:text-7xl">{formatEnglishDigits(safeValue)}%</div>
        <div className="mt-2 text-xl text-slate-500">تحديث مباشر</div>
      </div>
    </div>
  );
}

function LinkQrPreview({ url, label = 'QR للرابط' }) {
  const [qrDataUrl, setQrDataUrl] = useState('');
  useEffect(() => {
    let active = true;
    generateQrDataUrl(url, 220).then((value) => {
      if (active) setQrDataUrl(value);
    }).catch(() => {
      if (active) setQrDataUrl('');
    });
    return () => {
      active = false;
    };
  }, [url]);

  const downloadQr = () => {
    if (!qrDataUrl) return;
    const link = document.createElement('a');
    link.href = qrDataUrl;
    link.download = `${label.replace(/\s+/g, '-')}.png`;
    link.click();
  };

  return (
    <div className="rounded-[1.8rem] bg-slate-50 p-4 ring-1 ring-slate-200">
      <div className="mb-3 flex items-center justify-between gap-3">
        <div>
          <div className="text-sm font-black text-slate-800">{label}</div>
          <div className="mt-1 text-xs leading-6 text-slate-500">امسح الرمز بالجوال لفتح الرابط مباشرة.</div>
        </div>
        <button onClick={downloadQr} disabled={!qrDataUrl} className="inline-flex items-center gap-2 rounded-2xl bg-slate-900 px-3 py-2 text-xs font-bold text-white disabled:opacity-50"><Download className="h-4 w-4" /> حفظ QR</button>
      </div>
      <div className="flex justify-center rounded-[1.5rem] bg-white p-4 ring-1 ring-slate-200">
        {qrDataUrl ? <img src={qrDataUrl} alt={label} className="h-40 w-40 object-contain" /> : <div className="flex h-40 w-40 items-center justify-center text-sm font-bold text-slate-400">جارٍ إنشاء QR...</div>}
      </div>
    </div>
  );
}

function ScreenSettingsEditor({ value, onChange, compact = false, classrooms = [] }) {
  const widgets = value.widgets || {};
  const widgetOptions = [
    ["metrics", "المؤشرات الرئيسية"],
    ["topStudents", "الطلاب المتميزون"],
    ["topCompanies", "ترتيب الشركات"],
    ["attendanceChart", "الرسم البياني للحضور"],
    ["recentActivity", "آخر النشاطات"],
  ];

  return (
    <div className="space-y-5">
      <div className={cx("grid grid-cols-1 gap-4", compact ? "xl:grid-cols-2" : "lg:grid-cols-2")}>
        <Input label="اسم الشاشة" value={value.name} onChange={(e) => onChange({ ...value, name: e.target.value })} placeholder="مثال: شاشة المدخل" />
        <Input label="عنوان الشاشة" value={value.title} onChange={(e) => onChange({ ...value, title: e.target.value })} placeholder="مثال: لوحة الانضباط والتميز" />
      </div>
      <div className={cx("grid grid-cols-1 gap-4", compact ? "xl:grid-cols-5" : "lg:grid-cols-5")}>
        <Select label="قالب الشاشة" value={value.template || "executive"} onChange={(e) => onChange({ ...value, template: e.target.value })}>
          {SCREEN_TEMPLATE_OPTIONS.map(([key, label]) => <option key={key} value={key}>{label}</option>)}
        </Select>
        <Select label="نوع الانتقال" value={value.transition} onChange={(e) => onChange({ ...value, transition: e.target.value })}>
          {SCREEN_TRANSITION_OPTIONS.map(([key, label]) => <option key={key} value={key}>{label}</option>)}
        </Select>
        <Input label="مدة كل شاشة بالثواني" type="number" min="4" max="30" value={value.rotateSeconds} onChange={(e) => onChange({ ...value, rotateSeconds: e.target.value })} placeholder="8" />
        <Select label="ثيم الشاشة" value={value.theme || "emerald-night"} onChange={(e) => onChange({ ...value, theme: e.target.value })}>
          {SCREEN_THEME_OPTIONS.map(([key, label]) => <option key={key} value={key}>{label}</option>)}
        </Select>
        <Input label="حجم خط الشريط" type="number" min="18" max="56" value={value.tickerFontSize || 28} onChange={(e) => onChange({ ...value, tickerFontSize: e.target.value })} placeholder="28" />
      </div>
      <div className={cx("grid grid-cols-1 gap-4", compact ? "xl:grid-cols-2" : "lg:grid-cols-2")}>
        <Select label="مصدر بيانات الشاشة" value={value.sourceMode || "school"} onChange={(e) => onChange({ ...value, sourceMode: e.target.value, linkedClassroomId: e.target.value === "classroom" ? (value.linkedClassroomId || String(classrooms?.[0]?.id || "")) : "" })}>
          <option value="school">المدرسة كاملة</option>
          <option value="classroom">فصل من الهيكل المدرسي</option>
        </Select>
        <Select label="الفصل المرتبط" value={value.linkedClassroomId || ""} onChange={(e) => onChange({ ...value, linkedClassroomId: e.target.value })} disabled={(value.sourceMode || "school") !== "classroom"}>
          <option value="">اختر فصلًا من الهيكل المدرسي</option>
          {(classrooms || []).map((classroom) => <option key={classroom.id} value={classroom.id}>{classroom.name}</option>)}
        </Select>
      </div>
      <div className={cx("grid grid-cols-1 gap-3", compact ? "xl:grid-cols-5" : "lg:grid-cols-5")}>
        {widgetOptions.map(([key, label]) => (
          <label key={key} className="flex items-center justify-between rounded-2xl bg-white px-4 py-4 text-sm font-bold text-slate-700 ring-1 ring-slate-200">
            <span>{label}</span>
            <input type="checkbox" checked={Boolean(widgets[key])} onChange={(e) => onChange({ ...value, widgets: { ...widgets, [key]: e.target.checked } })} />
          </label>
        ))}
      </div>
      <div className="space-y-4 rounded-3xl bg-slate-100/80 p-5 ring-1 ring-slate-200">
        <div className={cx("grid grid-cols-1 gap-4", compact ? "xl:grid-cols-3" : "lg:grid-cols-3")}>
          <label className="flex items-center justify-between rounded-2xl bg-white px-4 py-4 text-sm font-bold text-slate-700 ring-1 ring-slate-200">
            <span>تفعيل الشريط الإخباري</span>
            <input type="checkbox" checked={Boolean(value.tickerEnabled)} onChange={(e) => onChange({ ...value, tickerEnabled: e.target.checked })} />
          </label>
          <label className="flex items-center justify-between rounded-2xl bg-white px-4 py-4 text-sm font-bold text-slate-700 ring-1 ring-slate-200">
            <span>إظهار الشعار بين الأخبار</span>
            <input type="checkbox" checked={value.tickerShowLogo !== false} onChange={(e) => onChange({ ...value, tickerShowLogo: e.target.checked })} disabled={!value.tickerEnabled} />
          </label>
          <Select label="طريقة عرض الأخبار" value={value.tickerLayout || "marquee"} onChange={(e) => onChange({ ...value, tickerLayout: e.target.value })} disabled={!value.tickerEnabled}>
            <option value="marquee">شريط متحرك</option>
            <option value="stacked">أسطر خبرية</option>
          </Select>
        </div>
        <div>
          <div className="mb-2 text-sm font-bold text-slate-700">الأخبار</div>
          <textarea
            value={value.tickerText}
            onChange={(e) => onChange({ ...value, tickerText: e.target.value })}
            placeholder={"اكتب كل خبر في سطر مستقل\nأو افصل بينها بعلامة |"}
            disabled={!value.tickerEnabled}
            rows={compact ? 4 : 5}
            className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm leading-7 text-slate-700 outline-none ring-0 disabled:bg-slate-100"
          />
          <div className="mt-2 text-xs leading-6 text-slate-500">كل سطر يعتبر خبرًا مستقلًا، ويمكنك أيضًا استخدام الرمز | للفصل بين الأخبار.</div>
        </div>
        <div className={cx("grid grid-cols-1 gap-4", compact ? "xl:grid-cols-4" : "lg:grid-cols-4")}>
          <Select label="اتجاه حركة الشريط" value={value.tickerDir} onChange={(e) => onChange({ ...value, tickerDir: e.target.value })} disabled={!value.tickerEnabled || value.tickerLayout === "stacked"}>
            <option value="rtl">من اليمين إلى اليسار</option>
            <option value="ltr">من اليسار إلى اليمين</option>
          </Select>
          <Select label="خلفية الشريط" value={value.tickerBg || "amber"} onChange={(e) => onChange({ ...value, tickerBg: e.target.value })} disabled={!value.tickerEnabled}>
            {TICKER_BG_OPTIONS.map(([key, label]) => <option key={key} value={key}>{label}</option>)}
          </Select>
          <Input label="الفاصل بين الأخبار" value={value.tickerSeparator || " ✦ "} onChange={(e) => onChange({ ...value, tickerSeparator: e.target.value || " ✦ " })} placeholder="✦" disabled={!value.tickerEnabled || value.tickerLayout === "stacked"} />
          <Input label="حجم خط الأخبار" type="number" min="18" max="56" value={value.tickerFontSize || 28} onChange={(e) => onChange({ ...value, tickerFontSize: e.target.value })} placeholder="28" disabled={!value.tickerEnabled} />
        </div>
      </div>
    </div>
  );
}

function SchoolDeviceLinksPanel({ selectedSchool, currentUser, onCreateGateLink, onDeleteGateLink, onCreateScreenLink, onDeleteScreenLink, onUpdateScreenLink }) {
  const [activeTab, setActiveTab] = useState("screens");
  const [gateName, setGateName] = useState("");
  const [gateMode, setGateMode] = useState("mixed");
  const [gateSearch, setGateSearch] = useState("");
  const [screenSearch, setScreenSearch] = useState("");
  const [screenForm, setScreenForm] = useState({
    name: "",
    title: "لوحة المدرسة",
    widgets: { metrics: true, topStudents: true, topCompanies: true, attendanceChart: true, recentActivity: true },
    transition: "fade",
    rotateSeconds: "8",
    theme: "emerald-night",
    template: "executive",
    tickerEnabled: false,
    tickerText: "",
    tickerDir: "rtl",
    tickerBg: "amber",
    tickerSeparator: " ✦ ",
    tickerFontSize: "28",
    tickerShowLogo: true,
    tickerLayout: "marquee",
  });
  const [editingScreenId, setEditingScreenId] = useState(null);
  const [editingScreenForm, setEditingScreenForm] = useState(null);
  const [savingScreenId, setSavingScreenId] = useState(null);
  const canManage = Boolean(currentUser && (currentUser.role === "superadmin" || canAccessPermission(currentUser, "deviceDisplays")));
  const gates = Array.isArray(selectedSchool?.smartLinks?.gates) ? selectedSchool.smartLinks.gates : [];
  const screens = Array.isArray(selectedSchool?.smartLinks?.screens) ? selectedSchool.smartLinks.screens : [];
  const classrooms = selectedSchool?.structure?.classrooms || [];
  const linkedClassroomScreensCount = screens.filter((screen) => screen.sourceMode === "classroom" && String(screen.linkedClassroomId || "")).length;
  const filteredGates = gates.filter((gate) => `${gate.name || ""} ${gate.mode || ""}`.toLowerCase().includes(gateSearch.trim().toLowerCase()));
  const filteredScreens = screens.filter((screen) => `${screen.name || ""} ${screen.title || ""} ${screen.template || ""}`.toLowerCase().includes(screenSearch.trim().toLowerCase()));

  const copyLink = async (url) => {
    try {
      if (navigator?.clipboard?.writeText) await navigator.clipboard.writeText(url);
      else window.prompt("انسخ الرابط التالي", url);
      window.alert("تم نسخ الرابط.");
    } catch {
      window.prompt("انسخ الرابط التالي", url);
    }
  };

  const startEditingScreen = (screen) => {
    setEditingScreenId(screen.id);
    setEditingScreenForm({
      name: screen.name || "",
      title: screen.title || "لوحة المدرسة",
      widgets: {
        metrics: screen.widgets?.metrics !== false,
        topStudents: screen.widgets?.topStudents !== false,
        topCompanies: screen.widgets?.topCompanies !== false,
        attendanceChart: screen.widgets?.attendanceChart !== false,
        recentActivity: screen.widgets?.recentActivity !== false,
      },
      transition: screen.transition || "fade",
      rotateSeconds: String(screen.rotateSeconds || 8),
      theme: screen.theme || "emerald-night",
      template: screen.template || "executive",
      tickerEnabled: Boolean(screen.tickerEnabled),
      tickerText: screen.tickerText || "",
      tickerDir: screen.tickerDir || "rtl",
      tickerBg: screen.tickerBg || "amber",
      tickerSeparator: screen.tickerSeparator || " ✦ ",
      tickerFontSize: String(screen.tickerFontSize || 28),
      tickerShowLogo: screen.tickerShowLogo !== false,
      tickerLayout: screen.tickerLayout || "marquee",
      sourceMode: screen.sourceMode || "school",
      linkedClassroomId: screen.linkedClassroomId ? String(screen.linkedClassroomId) : "",
    });
  };

  const resetCreateForm = () => setScreenForm({
    name: "",
    title: "لوحة المدرسة",
    widgets: { metrics: true, topStudents: true, topCompanies: true, attendanceChart: true, recentActivity: true },
    transition: "fade",
    rotateSeconds: "8",
    theme: "emerald-night",
    template: "executive",
    tickerEnabled: false,
    tickerText: "",
    tickerDir: "rtl",
    tickerBg: "amber",
    tickerSeparator: " ✦ ",
    tickerFontSize: "28",
    tickerShowLogo: true,
    tickerLayout: "marquee",
  });

  if (!canManage) return null;

  return (
    <SectionCard title="إدارة روابط البوابة والشاشات" icon={ExternalLink} className="overflow-visible" action={<Badge tone="blue">واجهة مستقلة أوضح للشاشات والبوابات</Badge>}>
      <div className="space-y-6">
        <div className="grid grid-cols-1 gap-4 xl:grid-cols-4">
          <div className="rounded-3xl bg-gradient-to-l from-sky-700 to-cyan-600 p-5 text-white shadow-sm">
            <div className="text-sm text-white/80">إجمالي الشاشات</div>
            <div className="mt-2 text-3xl font-black">{screens.length}</div>
            <div className="mt-2 text-xs text-white/80">روابط العرض المباشر الجاهزة للتشغيل.</div>
          </div>
          <div className="rounded-3xl bg-gradient-to-l from-emerald-700 to-teal-600 p-5 text-white shadow-sm">
            <div className="text-sm text-white/80">إجمالي البوابات</div>
            <div className="mt-2 text-3xl font-black">{gates.length}</div>
            <div className="mt-2 text-xs text-white/80">أجهزة التحضير المباشر عند المداخل.</div>
          </div>
          <div className="rounded-3xl bg-white p-5 ring-1 ring-slate-200 shadow-sm">
            <div className="text-sm text-slate-500">شاشات مرتبطة بفصول</div>
            <div className="mt-2 text-3xl font-black text-slate-900">{linkedClassroomScreensCount}</div>
            <div className="mt-2 text-xs text-slate-500">للعرض المرتبط بصف أو فصل محدد.</div>
          </div>
          <div className="rounded-3xl bg-white p-5 ring-1 ring-slate-200 shadow-sm">
            <div className="text-sm text-slate-500">فصول متاحة للربط</div>
            <div className="mt-2 text-3xl font-black text-slate-900">{classrooms.length}</div>
            <div className="mt-2 text-xs text-slate-500">يمكن ربط الشاشة مباشرة بأحد الفصول.</div>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-3 rounded-3xl bg-slate-100 p-2 ring-1 ring-slate-200">
          <button onClick={() => setActiveTab('screens')} className={cx('rounded-2xl px-5 py-3 text-sm font-black transition', activeTab === 'screens' ? 'bg-sky-700 text-white shadow-sm' : 'text-slate-700 hover:bg-white')}>الشاشات</button>
          <button onClick={() => setActiveTab('gates')} className={cx('rounded-2xl px-5 py-3 text-sm font-black transition', activeTab === 'gates' ? 'bg-emerald-700 text-white shadow-sm' : 'text-slate-700 hover:bg-white')}>البوابات</button>
        </div>

        {activeTab === 'gates' ? (
          <div className="space-y-6 rounded-3xl bg-slate-50 p-6 ring-1 ring-slate-200 shadow-sm">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <div className="font-black text-slate-800">إدارة روابط البوابات</div>
                <div className="mt-2 text-sm leading-7 text-slate-600">أنشئ روابط مستقلة لأجهزة الآيباد والجوال عند بوابات المدرسة، مع دعم QR أو بصمة الوجه أو الوضع المزدوج.</div>
              </div>
              <Badge tone="emerald">{gates.length} بوابة</Badge>
            </div>
            <div className="grid grid-cols-1 gap-5 xl:grid-cols-[1fr_auto_auto_auto] xl:items-end">
              <Input label="بحث في البوابات" value={gateSearch} onChange={(e) => setGateSearch(e.target.value)} placeholder="ابحث باسم البوابة أو وضعها" />
              <Input label="اسم البوابة" value={gateName} onChange={(e) => setGateName(e.target.value)} placeholder="مثال: بوابة الطلاب الرئيسية" />
              <Select label="وضع البوابة" value={gateMode} onChange={(e) => setGateMode(e.target.value)}>
                <option value="mixed">QR + بصمة وجه</option>
                <option value="qr">QR فقط</option>
                <option value="face">بصمة وجه فقط</option>
              </Select>
              <button onClick={async () => { const result = await onCreateGateLink?.({ name: gateName, mode: gateMode }); if (result?.ok) setGateName(''); }} className="rounded-2xl bg-emerald-700 px-6 py-3 text-sm font-bold text-white">توليد رابط بوابة</button>
            </div>
            <div className="grid grid-cols-1 gap-4 2xl:grid-cols-2">
              {filteredGates.map((gate) => {
                const url = buildPublicLink('gate', gate.token);
                return (
                  <div key={gate.id} className="rounded-3xl bg-white p-5 ring-1 ring-slate-200">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <div className="font-bold text-slate-800">{gate.name}</div>
                        <div className="mt-1 text-xs text-slate-500">الوضع: {gate.mode === 'mixed' ? 'QR + بصمة وجه' : gate.mode === 'qr' ? 'QR فقط' : 'بصمة وجه فقط'}</div>
                      </div>
                      <button onClick={() => onDeleteGateLink?.(gate.id)} className="rounded-xl bg-rose-50 px-3 py-2 text-xs font-bold text-rose-700">حذف</button>
                    </div>
                    <input readOnly value={url} className="mt-4 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-xs outline-none" />
                    <div className="mt-4 grid grid-cols-1 gap-4 xl:grid-cols-[1fr_240px] xl:items-start">
                      <div className="flex flex-wrap gap-2">
                      <button onClick={() => copyLink(url)} className="inline-flex items-center gap-2 rounded-2xl bg-slate-100 px-3 py-2 text-sm font-bold text-slate-700"><Copy className="h-4 w-4" /> نسخ</button>
                      <a href={url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 rounded-2xl bg-emerald-600 px-3 py-2 text-sm font-bold text-white"><ExternalLink className="h-4 w-4" /> فتح</a>
                    </div>
                    <LinkQrPreview url={url} label={`QR ${gate.name}`} />
                    </div>
                  </div>
                );
              })}
              {!gates.length ? <div className="rounded-3xl border border-dashed border-slate-300 bg-white px-6 py-10 text-center text-sm font-bold text-slate-500">لا توجد بوابات منشأة بعد.</div> : null}
              {gates.length > 0 && !filteredGates.length ? <div className="rounded-3xl border border-dashed border-amber-300 bg-amber-50 px-6 py-10 text-center text-sm font-bold text-amber-700">لا توجد بوابات مطابقة لعبارة البحث الحالية.</div> : null}
            </div>
          </div>
        ) : (
          <div className="space-y-6 rounded-3xl bg-slate-50 p-6 ring-1 ring-slate-200 shadow-sm">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <div className="font-black text-slate-800">إدارة شاشات العرض</div>
                <div className="mt-2 text-sm leading-7 text-slate-600">أنشئ شاشات العرض بحجم كامل داخل الصفحة، وعدّل الثيم والانتقالات ومصدر البيانات وشريط الأخبار بدون الواجهة الضيقة السابقة.</div>
              </div>
              <Badge tone="sky">{screens.length} شاشة</Badge>
            </div>
            <div className="grid grid-cols-1 gap-4 xl:grid-cols-[1fr_auto] xl:items-end">
              <Input label="بحث في الشاشات" value={screenSearch} onChange={(e) => setScreenSearch(e.target.value)} placeholder="ابحث باسم الشاشة أو عنوانها أو القالب" />
              <div className="rounded-2xl bg-white px-4 py-3 text-sm font-bold text-slate-600 ring-1 ring-slate-200">النتائج الحالية: {filteredScreens.length}</div>
            </div>
            <div className="rounded-3xl bg-white p-6 ring-1 ring-slate-200">
              <div className="mb-4 font-black text-slate-800">إنشاء شاشة جديدة</div>
              <div className="mb-4 grid grid-cols-1 gap-3 md:grid-cols-3">
                <div className="rounded-2xl bg-slate-50 px-4 py-3 text-sm font-bold text-slate-700 ring-1 ring-slate-200">القالب الحالي: {getScreenTemplateLabel(screenForm.template)}</div>
                <div className="rounded-2xl bg-slate-50 px-4 py-3 text-sm font-bold text-slate-700 ring-1 ring-slate-200">الانتقال: {getTransitionLabel(screenForm.transition)}</div>
                <div className="rounded-2xl bg-slate-50 px-4 py-3 text-sm font-bold text-slate-700 ring-1 ring-slate-200">المصدر: {screenForm.sourceMode === 'classroom' ? 'فصل محدد' : 'المدرسة كاملة'}</div>
              </div>
              <ScreenSettingsEditor value={screenForm} onChange={setScreenForm} classrooms={classrooms} />
              <button
                onClick={async () => {
                  const result = await onCreateScreenLink?.({ ...screenForm, rotateSeconds: Number(screenForm.rotateSeconds) || 8 });
                  if (result?.ok) resetCreateForm();
                }}
                className="mt-5 rounded-2xl bg-sky-700 px-5 py-3 text-sm font-bold text-white"
              >
                توليد رابط شاشة
              </button>
            </div>
            <div className="grid grid-cols-1 gap-5">
              {filteredScreens.map((screen) => {
                const url = buildPublicLink('screen', screen.token);
                const isEditing = editingScreenId === screen.id && editingScreenForm;
                return (
                  <div key={screen.id} className="rounded-3xl bg-white p-5 ring-1 ring-slate-200">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div>
                        <div className="font-bold text-slate-800">{screen.name}</div>
                        <div className="text-sm text-slate-500">{screen.title}</div>
                        <div className="mt-1 text-xs text-slate-400">القالب: {getScreenTemplateLabel(screen.template)} • انتقال: {getTransitionLabel(screen.transition)} • كل {screen.rotateSeconds || 8} ث</div>
                        <div className="mt-2 flex flex-wrap gap-2 text-[11px] font-bold text-slate-500">
                          <span className="rounded-full bg-slate-100 px-3 py-1">المصدر: {screen.sourceMode === 'classroom' ? 'فصل' : 'المدرسة'}</span>
                          {screen.linkedClassroomId ? <span className="rounded-full bg-cyan-50 px-3 py-1 text-cyan-700">مرتبط بفصل</span> : null}
                          {screen.tickerEnabled ? <span className="rounded-full bg-amber-50 px-3 py-1 text-amber-700">شريط الأخبار مفعل</span> : null}
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        <button onClick={() => isEditing ? (setEditingScreenId(null), setEditingScreenForm(null)) : startEditingScreen(screen)} className="rounded-xl bg-amber-50 px-3 py-2 text-xs font-bold text-amber-700">{isEditing ? 'إلغاء التعديل' : 'تعديل'}</button>
                        <button onClick={() => onDeleteScreenLink?.(screen.id)} className="rounded-xl bg-rose-50 px-3 py-2 text-xs font-bold text-rose-700">حذف</button>
                      </div>
                    </div>
                    <input readOnly value={url} className="mt-4 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-xs outline-none" />
                    <div className="mt-4 grid grid-cols-1 gap-4 xl:grid-cols-[1fr_240px] xl:items-start">
                      <div className="flex flex-wrap gap-2">
                      <button onClick={() => copyLink(url)} className="inline-flex items-center gap-2 rounded-2xl bg-slate-100 px-3 py-2 text-sm font-bold text-slate-700"><Copy className="h-4 w-4" /> نسخ</button>
                      <a href={url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 rounded-2xl bg-emerald-600 px-3 py-2 text-sm font-bold text-white"><ExternalLink className="h-4 w-4" /> فتح</a>
                    </div>
                    <LinkQrPreview url={url} label={`QR ${screen.name}`} />
                    </div>
                    {isEditing ? (
                      <div className="mt-5 rounded-3xl bg-slate-50 p-5 ring-1 ring-slate-200">
                        <div className="mb-4 font-black text-slate-800">تحرير إعدادات الشاشة</div>
                        <ScreenSettingsEditor value={editingScreenForm} onChange={setEditingScreenForm} classrooms={selectedSchool?.structure?.classrooms || []} />
                        <div className="mt-5 flex flex-wrap gap-3">
                          <button
                            onClick={async () => {
                              setSavingScreenId(screen.id);
                              try {
                                const result = await onUpdateScreenLink?.(screen.id, { ...editingScreenForm, rotateSeconds: Number(editingScreenForm.rotateSeconds) || 8 });
                                if (result?.ok) {
                                  setEditingScreenId(null);
                                  setEditingScreenForm(null);
                                }
                              } finally {
                                setSavingScreenId(null);
                              }
                            }}
                            className="rounded-2xl bg-sky-700 px-4 py-3 text-sm font-bold text-white"
                          >
                            {savingScreenId === screen.id ? 'جارٍ الحفظ...' : 'حفظ التعديلات'}
                          </button>
                          <button onClick={() => { setEditingScreenId(null); setEditingScreenForm(null); }} className="rounded-2xl bg-slate-200 px-4 py-3 text-sm font-bold text-slate-700">إلغاء</button>
                        </div>
                      </div>
                    ) : null}
                  </div>
                );
              })}
              {!screens.length ? <div className="rounded-3xl border border-dashed border-slate-300 bg-white px-6 py-10 text-center text-sm font-bold text-slate-500">لا توجد شاشات منشأة بعد.</div> : null}
              {screens.length > 0 && !filteredScreens.length ? <div className="rounded-3xl border border-dashed border-amber-300 bg-amber-50 px-6 py-10 text-center text-sm font-bold text-amber-700">لا توجد شاشات مطابقة لعبارة البحث الحالية.</div> : null}
            </div>
          </div>
        )}
      </div>
    </SectionCard>
  );
}

function PublicGatePage({ token }) {
  const [payload, setPayload] = useState(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [manualQuery, setManualQuery] = useState("");
  const [faceFile, setFaceFile] = useState(null);
  const [facePreview, setFacePreview] = useState("");
  const [message, setMessage] = useState("");

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
    return () => socket.close();
  }, [loadGate, token]);

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

  const submitScan = async (barcode, method) => {
    if (!barcode) return;
    setBusy(true);
    try {
      const response = await apiRequest(`/api/public/gate/${token}/scan`, { method: 'POST', body: { barcode, method } });
      setPayload((prev) => ({ ...prev, live: response.live }));
      setMessage(`${response.student?.name || ''} • ${response.message}`);
      setManualQuery('');
    } catch (err) {
      setMessage(err?.message || 'تعذر تسجيل العملية.');
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
    const match = findBestFaceMatch(template.signature, students, 28);
    if (!match.student) {
      setMessage('لم يتم العثور على تطابق كافٍ للوجه.');
      return null;
    }
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
    const match = findBestFaceMatch(template.signature, students, 28);
    if (!match.student) return setMessage('لم يتم العثور على تطابق كافٍ للوجه.');
    await submitScan(match.student.barcode, 'بصمة وجه');
    setFaceFile(null);
    setFacePreview('');
  };

  if (error) return <div dir="rtl" className="flex min-h-screen items-center justify-center bg-slate-100 p-6"><div className="rounded-3xl bg-white p-8 ring-1 ring-slate-200">{error}</div></div>;
  if (!payload) return <div dir="rtl" className="flex min-h-screen items-center justify-center bg-slate-100 p-6"><div className="rounded-3xl bg-white p-8 ring-1 ring-slate-200">جارِ تحميل البوابة...</div></div>;

  const live = payload.live || {};
  const summaryView = payload.summary || {};
  const mode = payload.gate?.mode || 'mixed';
  const manualStudent = resolveManualStudent();

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
        <div className="rounded-[2rem] border border-white/10 bg-white/5 p-4 shadow-2xl backdrop-blur md:p-6">
          <LiveCameraPanel mode={mode === 'qr' ? 'barcode' : mode === 'face' ? 'face' : 'mixed'} variant="gate" autoStart hideDeviceSelect videoHeightClass="h-[48vh] md:h-[58vh]" title={`مرحبًا بكم في ${payload.school?.name || 'المدرسة'}`} description={`${payload.gate?.name || 'البوابة'} • وجّه QR أو الوجه أمام الكاميرا وسيتم التعرف تلقائيًا.`} onDetectBarcode={(value) => submitScan(value, 'QR')} onDetectFace={resolveFaceDataUrl} onCapture={resolveFaceDataUrl} />
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
        {message ? <div className="rounded-3xl bg-white px-5 py-4 text-slate-900 ring-1 ring-slate-200">{message}</div> : null}
      </div>
    </div>
  );
}


class RenderErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, message: '' };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, message: error?.message || 'حدث خطأ غير متوقع أثناء العرض.' };
  }

  componentDidCatch(error) {
    console.error('screen render failed', error);
  }

  componentDidUpdate(prevProps) {
    if (prevProps.resetKey !== this.props.resetKey && this.state.hasError) {
      this.setState({ hasError: false, message: '' });
    }
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex h-full items-center justify-center p-8">
          <div className="w-full max-w-3xl rounded-[2rem] bg-white p-8 text-slate-900 shadow-2xl ring-1 ring-slate-200">
            <div className="text-3xl font-black text-rose-700">تعذر عرض هذه الشريحة</div>
            <div className="mt-4 text-xl text-slate-600">تم اكتشاف خطأ داخل قالب الشاشة. راجع إعدادات الشاشة أو جرّب قالبًا آخر.</div>
            <div className="mt-6 rounded-2xl bg-rose-50 px-5 py-4 text-lg font-bold text-rose-700 ring-1 ring-rose-200">{this.state.message}</div>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

function splitTickerItems(text) {
  return String(text || "")
    .split(/\n|\|/)
    .map((item) => item.trim())
    .filter(Boolean);
}

function SchoolTickerLogo({ schoolName, className = "" }) {
  const shortName = String(schoolName || "مدرستي").replace(/\s+/g, " ").trim().slice(0, 10);
  return <span className={cx("inline-flex items-center justify-center rounded-full border border-white/35 bg-white/15 px-3 py-1 text-sm font-black text-white shadow-sm backdrop-blur", className)}>{shortName}</span>;
}

function PublicScreenPage({ token }) {
  const [payload, setPayload] = useState(null);
  const [error, setError] = useState('');
  const [slideIndex, setSlideIndex] = useState(0);
  const [now, setNow] = useState(() => new Date());

  const loadScreen = useCallback(async () => {
    try {
      const response = await apiRequest(`/api/public/screen/${token}`);
      setPayload(response);
      setError('');
    } catch (err) {
      setError(err?.message || 'تعذر تحميل الشاشة.');
    }
  }, [token]);

  useEffect(() => {
    loadScreen();
    const socket = new WebSocket(buildWsUrl(`/ws/public?kind=screen&token=${encodeURIComponent(token)}`));
    socket.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data || '{}');
        if (data?.type === 'live_update') {
          setPayload((prev) => prev ? ({ ...prev, screen: data.screen || prev.screen, live: data.live || prev.live }) : prev);
          setError('');
        }
      } catch {}
    };
    socket.onerror = () => { if (!payload) console.warn('WebSocket screen stream unavailable'); };
    return () => socket.close();
  }, [loadScreen, token]);

  useEffect(() => {
    const id = window.setInterval(() => setNow(new Date()), 1000);
    return () => window.clearInterval(id);
  }, []);

  const live = payload?.live || {};
  const screen = payload?.screen || {};
  const widgets = screen.widgets || {};
  const transition = screen.transition || 'fade';
  const effectiveTransition = transition === 'random' ? SCREEN_RANDOM_TRANSITIONS[slideIndex % SCREEN_RANDOM_TRANSITIONS.length] : transition;
  const motionVariant = getDisplayMotionVariant(effectiveTransition);
  const rotateSeconds = Math.max(4, Number(screen.rotateSeconds) || 8);
  const screenTheme = getScreenTheme(screen.theme || 'emerald-night');
  const tickerTheme = getTickerTheme(screen.tickerBg || 'amber');
  const screenTemplate = screen.template || 'executive';
  const heroCardClass = screenTemplate === 'reception'
    ? 'rounded-[2.2rem] bg-white/95 p-8 text-slate-950 shadow-2xl ring-1 ring-slate-200'
    : 'rounded-[2.2rem] bg-white p-8 text-slate-950 shadow-2xl ring-1 ring-slate-200';
  const structureSpotlight = live?.structureSpotlight && typeof live.structureSpotlight === 'object' ? live.structureSpotlight : null;
  const summaryView = structureSpotlight?.summary && typeof structureSpotlight.summary === 'object' ? structureSpotlight.summary : (live.summary || {});
  const topStudentsView = Array.isArray(structureSpotlight?.students) && structureSpotlight.students.length ? structureSpotlight.students : (Array.isArray(live.topStudents) ? live.topStudents : []);
  const topCompaniesView = Array.isArray(structureSpotlight?.topCompanies) && structureSpotlight.topCompanies.length ? structureSpotlight.topCompanies : (Array.isArray(live.topCompanies) ? live.topCompanies : []);
  const attendanceTrendView = Array.isArray(structureSpotlight?.attendanceTrend) && structureSpotlight.attendanceTrend.length ? structureSpotlight.attendanceTrend : (Array.isArray(live.attendanceTrend) ? live.attendanceTrend : []);
  const recentAttendanceView = Array.isArray(structureSpotlight?.recentActivity) && structureSpotlight.recentActivity.length ? structureSpotlight.recentActivity : (Array.isArray(live.recentAttendance) ? live.recentAttendance : []);
  const safeSchoolName = live?.school?.name || payload?.school?.name || 'المدرسة';
  const clockTime = now.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false });
  const topStudentsChartData = useMemo(() => (topStudentsView || []).slice(0, 6).map((item, index) => ({
    rank: index + 1,
    name: String(item?.name || item?.student || item?.title || `طالب ${index + 1}`),
    points: Number(item?.points || 0),
  })).sort((a, b) => b.points - a.points), [topStudentsView]);
  const topCompaniesChartData = useMemo(() => (topCompaniesView || []).slice(0, 6).map((item, index) => ({
    rank: index + 1,
    name: String(item?.companyName || item?.className || item?.name || item?.title || `شركة ${index + 1}`),
    points: Number(item?.points || 0),
  })).sort((a, b) => b.points - a.points), [topCompaniesView]);

  const slides = useMemo(() => {
    try {
    if (structureSpotlight) {
      const classStudents = topStudentsView || [];
      const classActivities = recentAttendanceView || [];
      const attendanceDonut = [
        { name: 'النشطون', value: Number(summaryView?.presentToday || 0) },
        { name: 'المؤرشفون', value: Math.max(Number(summaryView?.violationsToday || 0), 0) },
      ].filter((item) => item.value > 0);
      return [
        {
          key: 'class-overview',
          title: 'لوحة الفصل',
          render: () => (
            <div className="grid h-full gap-5 xl:grid-cols-[1.25fr_0.95fr]">
              <div className="grid gap-5">
                <div className="rounded-[2.2rem] bg-white p-8 text-slate-950 shadow-2xl ring-1 ring-slate-200">
                  <div className="text-lg font-bold text-slate-500">الفصل المرتبط بالشاشة</div>
                  <div className="mt-3 text-5xl font-black xl:text-6xl">{structureSpotlight.classroomName || structureSpotlight.headline || 'الفصل'}</div>
                  <div className="mt-4 flex flex-wrap gap-3 text-lg">
                    <span className="rounded-full bg-sky-100 px-4 py-2 font-bold text-sky-800">الشركة: {structureSpotlight.companyName || '—'}</span>
                    <span className="rounded-full bg-violet-100 px-4 py-2 font-bold text-violet-800">رائد الفصل: {structureSpotlight.leaderName || '—'}</span>
                  </div>
                  <div className="mt-6 grid grid-cols-2 gap-4 xl:grid-cols-4">
                    <div className="rounded-[1.7rem] bg-slate-950 p-5 text-white"><div className="text-base text-white/70">عدد الطلاب</div><div className="mt-3 text-6xl font-black">{summaryView?.totalStudents || 0}</div></div>
                    <div className="rounded-[1.7rem] bg-emerald-600 p-5 text-white"><div className="text-base text-white/75">النشطون</div><div className="mt-3 text-6xl font-black">{summaryView?.presentToday || 0}</div></div>
                    <div className="rounded-[1.7rem] bg-rose-600 p-5 text-white"><div className="text-base text-white/75">المؤرشفون</div><div className="mt-3 text-6xl font-black">{summaryView?.violationsToday || 0}</div></div>
                    <div className="rounded-[1.7rem] bg-amber-500 p-5 text-white"><div className="text-base text-white/75">نسبة الجاهزية</div><div className="mt-3 text-6xl font-black">{summaryView?.attendanceRate || 0}%</div></div>
                  </div>
                </div>
                <div className="rounded-[2.2rem] bg-white p-8 text-slate-950 shadow-2xl ring-1 ring-slate-200">
                  <div className="mb-5 text-3xl font-black">أسماء من الفصل</div>
                  <div className="grid gap-4 xl:grid-cols-2">
                    {classStudents.slice(0, 8).map((student, index) => (
                      <div key={student.id || index} className="rounded-[1.6rem] bg-slate-100 p-5 ring-1 ring-slate-200">
                        <div className="text-3xl font-black">{student.name}</div>
                        <div className="mt-2 text-lg text-slate-500">ترتيب العرض: {index + 1}</div>
                      </div>
                    ))}
                    {!classStudents.length ? <div className="rounded-[1.6rem] bg-slate-100 p-6 text-xl font-bold text-slate-500 ring-1 ring-slate-200">لا توجد أسماء معروضة لهذا الفصل حتى الآن.</div> : null}
                  </div>
                </div>
              </div>
              <div className="grid gap-5">
                <div className="rounded-[2.2rem] bg-white p-8 text-slate-950 shadow-2xl ring-1 ring-slate-200">
                  <div className="mb-5 text-3xl font-black">مؤشرات الفصل</div>
                  {attendanceDonut.length ? (
                    <ResponsiveContainer width="100%" height={300}>
                      <PieChart>
                        <Pie data={attendanceDonut} dataKey="value" nameKey="name" innerRadius={70} outerRadius={110} paddingAngle={6}>
                          {attendanceDonut.map((entry, index) => (
                            <Cell key={entry.name} fill={index === 0 ? '#10b981' : '#f43f5e'} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="rounded-[1.6rem] bg-slate-100 p-6 text-lg font-bold text-slate-500 ring-1 ring-slate-200">لا توجد بيانات كافية لعرض المؤشرات الدائرية.</div>
                  )}
                  <div className="mt-4 grid gap-3">
                    {attendanceDonut.map((item, index) => (
                      <div key={item.name} className="flex items-center justify-between rounded-2xl bg-slate-100 px-4 py-3 text-lg font-bold ring-1 ring-slate-200">
                        <span className="inline-flex items-center gap-3"><span className="h-4 w-4 rounded-full" style={{ backgroundColor: index === 0 ? '#10b981' : '#f43f5e' }} />{item.name}</span>
                        <span>{item.value}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="rounded-[2.2rem] bg-white p-8 text-slate-950 shadow-2xl ring-1 ring-slate-200">
                  <div className="mb-5 text-3xl font-black">آخر النشاطات في الفصل</div>
                  <div className="grid gap-4">
                    {classActivities.slice(0, 6).map((item) => (
                      <div key={item.id} className="rounded-[1.5rem] bg-slate-100 p-5 ring-1 ring-slate-200">
                        <div className="text-2xl font-black">{item.student || item.name || 'طالب'}</div>
                        <div className="mt-2 text-lg text-slate-500">{item.result || 'نشاط'} {item.time ? `• ${item.time}` : ''}</div>
                      </div>
                    ))}
                    {!classActivities.length ? <div className="rounded-[1.6rem] bg-slate-100 p-6 text-lg font-bold text-slate-500 ring-1 ring-slate-200">لا توجد نشاطات حديثة لهذا الفصل.</div> : null}
                  </div>
                </div>
              </div>
            </div>
          ),
        },
        {
          key: 'class-chart',
          title: 'تحليل الفصل',
          render: () => (
            <div className="grid h-full gap-5 xl:grid-cols-[1.1fr_0.9fr]">
              <div className="rounded-[2.2rem] bg-white p-8 text-slate-950 shadow-2xl ring-1 ring-slate-200">
                <div className="mb-5 text-3xl font-black">المؤشرات البيانية للفصل</div>
                <ResponsiveContainer width="100%" height="86%">
                  <BarChart data={attendanceTrendView || []} margin={{ top: 20, right: 30, left: 10, bottom: 10 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="day" tick={{ fontSize: 18, fontWeight: 700 }} />
                    <YAxis tick={{ fontSize: 16, fontWeight: 700 }} />
                    <Tooltip />
                    <Bar dataKey="attendance" fill="#0ea5e9" radius={[12, 12, 0, 0]} />
                    <Bar dataKey="early" fill="#10b981" radius={[12, 12, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <div className="grid gap-5">
                <div className="rounded-[2.2rem] bg-white p-8 text-slate-950 shadow-2xl ring-1 ring-slate-200">
                  <div className="mb-5 text-3xl font-black">نبذة سريعة</div>
                  <div className="grid gap-4 text-xl">
                    <div className="rounded-[1.5rem] bg-slate-100 px-5 py-4 ring-1 ring-slate-200"><span className="font-black">الفصل:</span> {structureSpotlight.classroomName || '—'}</div>
                    <div className="rounded-[1.5rem] bg-slate-100 px-5 py-4 ring-1 ring-slate-200"><span className="font-black">الشركة:</span> {structureSpotlight.companyName || '—'}</div>
                    <div className="rounded-[1.5rem] bg-slate-100 px-5 py-4 ring-1 ring-slate-200"><span className="font-black">رائد الفصل:</span> {structureSpotlight.leaderName || '—'}</div>
                    <div className="rounded-[1.5rem] bg-slate-100 px-5 py-4 ring-1 ring-slate-200"><span className="font-black">الجاهزون للتواصل:</span> {topCompaniesView.find((item) => String(item.className || '').includes('جهوزية'))?.points || 0}</div>
                  </div>
                </div>
                <div className="rounded-[2.2rem] bg-white p-8 text-slate-950 shadow-2xl ring-1 ring-slate-200">
                  <div className="mb-5 text-3xl font-black">ملخص سريع</div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="rounded-[1.5rem] bg-emerald-50 p-5 text-center ring-1 ring-emerald-200"><div className="text-base font-bold text-emerald-700">النشطون</div><div className="mt-2 text-5xl font-black text-emerald-700">{summaryView?.presentToday || 0}</div></div>
                    <div className="rounded-[1.5rem] bg-rose-50 p-5 text-center ring-1 ring-rose-200"><div className="text-base font-bold text-rose-700">المؤرشفون</div><div className="mt-2 text-5xl font-black text-rose-700">{summaryView?.violationsToday || 0}</div></div>
                    <div className="rounded-[1.5rem] bg-sky-50 p-5 text-center ring-1 ring-sky-200"><div className="text-base font-bold text-sky-700">إجمالي الطلاب</div><div className="mt-2 text-5xl font-black text-sky-700">{summaryView?.totalStudents || 0}</div></div>
                    <div className="rounded-[1.5rem] bg-amber-50 p-5 text-center ring-1 ring-amber-200"><div className="text-base font-bold text-amber-700">نسبة الجاهزية</div><div className="mt-2 text-5xl font-black text-amber-700">{summaryView?.attendanceRate || 0}%</div></div>
                  </div>
                </div>
              </div>
            </div>
          ),
        },
      ];
    }

    const items = [];
    if (widgets.metrics !== false) {
      items.push({
        key: 'metrics',
        title: 'المؤشرات الرئيسية',
        render: () => (
          <div className="flex h-full items-center justify-center">
            <div className={cx('grid w-full max-w-[1500px] gap-6', screenTemplate === 'reception' ? 'grid-cols-1 xl:grid-cols-[1.15fr_1.2fr]' : 'grid-cols-1 xl:grid-cols-3')}>
              {screenTemplate === 'reception' ? (
                <div className={cx(heroCardClass, 'flex flex-col justify-between bg-gradient-to-l from-white to-sky-50')}>
                  <div>
                    <div className="text-xl font-bold text-slate-500">مرحبًا بكم في</div>
                    <div className="mt-3 text-5xl font-black leading-tight text-slate-950 xl:text-6xl">{live.school?.name || screen.title || 'لوحة المدرسة'}</div>
                    <div className="mt-4 text-2xl text-slate-600">عرض حي للحضور والانضباط والتميّز الطلابي</div>
                  </div>
                  <div className="grid grid-cols-2 gap-4 pt-6">
                    <div className="rounded-[1.7rem] bg-slate-950 p-6 text-white"><div className="text-lg text-white/70">الحاضرون الآن</div><div className="mt-3 text-7xl font-black">{formatEnglishDigits(summaryView?.presentToday || 0)}</div></div>
                    <div className="rounded-[1.7rem] bg-white p-3 text-slate-950 ring-1 ring-slate-200"><div className="text-center text-lg font-bold text-slate-500">نسبة الحضور</div><MiniAttendanceRing value={summaryView?.attendanceRate || 0} /></div>
                  </div>
                </div>
              ) : null}
              <div className={cx('grid gap-6', screenTemplate === 'reception' ? 'xl:col-span-1 grid-cols-2 xl:grid-cols-2' : 'grid-cols-2 xl:col-span-3 xl:grid-cols-3', screenTemplate === 'leaderboard' ? 'xl:col-span-3' : '')}>
                <div className="rounded-[2rem] bg-white p-7 text-center text-slate-950 shadow-2xl ring-1 ring-slate-200"><div className="text-2xl font-bold text-slate-500">الحاضرون اليوم</div><div className="mt-5 text-7xl font-black text-slate-900 xl:text-8xl">{formatEnglishDigits(summaryView?.presentToday || 0)}</div><div className="mt-4 text-2xl text-slate-500">من {formatEnglishDigits(summaryView?.totalStudents || 0)} طالب</div></div>
                <div className="rounded-[2rem] bg-white p-4 text-slate-950 shadow-2xl ring-1 ring-slate-200"><div className="text-center text-2xl font-bold text-slate-500">نسبة الحضور</div><MiniAttendanceRing value={summaryView?.attendanceRate || 0} /></div>
                <div className="rounded-[2rem] bg-white p-7 text-center text-slate-950 shadow-2xl ring-1 ring-slate-200"><div className="text-2xl font-bold text-slate-500">المبكرون</div><div className="mt-5 text-7xl font-black text-emerald-700 xl:text-8xl">{formatEnglishDigits(summaryView?.earlyToday || 0)}</div><div className="mt-4 text-2xl text-slate-500">اليوم</div></div>
                <div className="rounded-[2rem] bg-white p-7 text-center text-slate-950 shadow-2xl ring-1 ring-slate-200"><div className="text-2xl font-bold text-slate-500">المكافآت</div><div className="mt-5 text-7xl font-black text-violet-700 xl:text-8xl">{formatEnglishDigits(summaryView?.rewardsToday || 0)}</div><div className="mt-4 text-2xl text-slate-500">اليوم</div></div>
                <div className="rounded-[2rem] bg-white p-7 text-center text-slate-950 shadow-2xl ring-1 ring-slate-200"><div className="text-2xl font-bold text-slate-500">الخصومات</div><div className="mt-5 text-7xl font-black text-rose-700 xl:text-8xl">{formatEnglishDigits(summaryView?.violationsToday || 0)}</div><div className="mt-4 text-2xl text-slate-500">اليوم</div></div>
                <div className="rounded-[2rem] bg-white p-7 text-center text-slate-950 shadow-2xl ring-1 ring-slate-200"><div className="text-2xl font-bold text-slate-500">البرامج</div><div className="mt-5 text-7xl font-black text-amber-700 xl:text-8xl">{formatEnglishDigits(summaryView?.programsToday || 0)}</div><div className="mt-4 text-2xl text-slate-500">اليوم</div></div>
              </div>
            </div>
          </div>
        ),
      });
    }
    if (widgets.attendanceChart !== false) {
      items.push({
        key: 'attendanceChart',
        title: 'الرسم البياني للحضور',
        render: () => (
          <div className={cx('h-full rounded-[2.2rem] bg-white p-8 text-slate-950 shadow-2xl ring-1 ring-slate-200', screenTemplate === 'executive' ? 'border-2 border-sky-200' : '')}>
            <div className="mb-5 flex items-center justify-between">
              <div className="text-4xl font-black xl:text-5xl">الحضور خلال الأيام الأخيرة</div>
              <div className="flex items-center gap-3 text-lg font-bold">
                <span className="inline-flex items-center gap-2 rounded-full bg-sky-50 px-4 py-2 text-sky-700 ring-1 ring-sky-200"><span className="h-3.5 w-3.5 rounded-full bg-sky-500" />الحضور</span>
                <span className="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-4 py-2 text-emerald-700 ring-1 ring-emerald-200"><span className="h-3.5 w-3.5 rounded-full bg-emerald-500" />المبكر</span>
              </div>
            </div>
            <ResponsiveContainer width="100%" height="86%">
              <BarChart data={attendanceTrendView || []} margin={{ top: 30, right: 52, left: 26, bottom: 18 }} barCategoryGap={24}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#cbd5e1" />
                <XAxis dataKey="day" tick={{ fontSize: 22, fontWeight: 900, fill: '#0f172a' }} axisLine={false} tickLine={false} />
                <YAxis tickFormatter={(value) => formatEnglishDigits(value)} tick={{ fontSize: 20, fontWeight: 900, fill: '#334155' }} axisLine={false} tickLine={false} width={56} />
                <Tooltip contentStyle={{ borderRadius: '18px', border: '1px solid #cbd5e1', fontWeight: 800 }} formatter={(value) => formatEnglishDigits(value)} />
                <Bar dataKey="attendance" name="الحضور" fill="#0ea5e9" radius={[18, 18, 0, 0]} barSize={64}>
                  <LabelList dataKey="attendance" position="top" formatter={(value) => formatEnglishDigits(value)} style={{ fill: '#0f172a', fontSize: 22, fontWeight: 900 }} />
                </Bar>
                <Bar dataKey="early" name="المبكر" fill="#10b981" radius={[18, 18, 0, 0]} barSize={64}>
                  <LabelList dataKey="early" position="top" formatter={(value) => formatEnglishDigits(value)} style={{ fill: '#0f172a', fontSize: 22, fontWeight: 900 }} />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        ),
      });
    }
    if (widgets.topStudents !== false) {
      items.push({
        key: 'topStudents',
        title: 'الطلاب المتميزون',
        render: () => (
          <div className={cx('h-full rounded-[2.2rem] bg-white p-8 text-slate-950 shadow-2xl ring-1 ring-slate-200', screenTemplate === 'leaderboard' ? 'bg-gradient-to-l from-white to-amber-50' : '')}>
            <div className="mb-5 flex items-center justify-between text-3xl font-black xl:text-4xl"><span>أعلى الطلاب نقاطًا</span>{screenTemplate === 'leaderboard' ? <span className="rounded-full bg-amber-100 px-4 py-2 text-lg text-amber-800">قالب المنافسة</span> : null}</div>
            <ResponsiveContainer width="100%" height="86%">
              <BarChart data={topStudentsChartData} layout="vertical" margin={{ left: 320, right: 150, top: 12, bottom: 12 }} barCategoryGap={18}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e2e8f0" />
                <XAxis type="number" tickFormatter={(value) => formatEnglishDigits(value)} tick={{ fontSize: 20, fontWeight: 900, fill: '#334155' }} axisLine={false} tickLine={false} />
                <YAxis type="category" dataKey="name" width={310} axisLine={false} tickLine={false} tick={(props) => <ScreenAxisTick {...props} width={300} />} />
                <Tooltip contentStyle={{ borderRadius: '18px', border: '1px solid #cbd5e1', fontWeight: 800 }} formatter={(value) => [`${formatEnglishDigits(value)} نقطة`, 'النقاط']} />
                <Bar dataKey="points" fill="#10b981" radius={[0, 20, 20, 0]} barSize={48}>
                  <LabelList dataKey="points" content={(props) => <ScreenBarValueLabel {...props} suffix="" />} />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        ),
      });
    }
    if (widgets.topCompanies !== false) {
      items.push({
        key: 'topCompanies',
        title: 'ترتيب الشركات',
        render: () => (
          <div className={cx('grid h-full gap-6 rounded-[2.2rem] bg-white p-8 text-slate-950 shadow-2xl ring-1 ring-slate-200 xl:grid-cols-[1.2fr_0.8fr]', screenTemplate === 'leaderboard' ? 'bg-gradient-to-l from-white to-sky-50' : '')}>
            <div className="min-h-0">
              <div className="mb-5 flex items-center justify-between text-3xl font-black xl:text-4xl"><span>الشركات المتفوقة</span>{screenTemplate === 'leaderboard' ? <span className="rounded-full bg-sky-100 px-4 py-2 text-lg text-sky-800">ترتيب حي</span> : null}</div>
              <ResponsiveContainer width="100%" height="86%">
                <BarChart data={topCompaniesChartData} layout="vertical" margin={{ left: 310, right: 145, top: 14, bottom: 14 }} barCategoryGap={18}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#dbeafe" />
                  <XAxis type="number" tickFormatter={(value) => formatEnglishDigits(value)} tick={{ fontSize: 20, fontWeight: 900, fill: '#334155' }} axisLine={false} tickLine={false} />
                  <YAxis type="category" dataKey="name" width={300} axisLine={false} tickLine={false} tick={(props) => <ScreenAxisTick {...props} width={290} />} />
                  <Tooltip contentStyle={{ borderRadius: '18px', border: '1px solid #cbd5e1', fontWeight: 800 }} formatter={(value) => [`${formatEnglishDigits(value)} نقطة`, 'النقاط']} />
                  <Bar dataKey="points" fill="#0ea5e9" radius={[0, 20, 20, 0]} barSize={48}>
                    <LabelList dataKey="points" content={(props) => <ScreenBarValueLabel {...props} />} />
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="grid content-start gap-4">
              {(topCompaniesChartData || []).slice(0, 5).map((item, index) => (
                <div key={item.id || item.name || index} className="rounded-[1.7rem] bg-slate-50 px-5 py-4 ring-1 ring-slate-200">
                  <div className="flex items-center justify-between gap-4">
                    <div className="min-w-0">
                      <div className="text-sm font-black text-sky-700">المركز {formatEnglishDigits(index + 1)}</div>
                      <div className="mt-1 truncate text-2xl font-black text-slate-950 xl:text-3xl" title={item.name}>{item.name}</div>
                    </div>
                    <div className="rounded-2xl bg-slate-950 px-4 py-3 text-center text-white">
                      <div className="text-xs font-bold text-white/70">النقاط</div>
                      <div className="mt-1 text-2xl font-black xl:text-3xl">{formatEnglishDigits(item.points)}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ),
      });
    }
    if (widgets.recentActivity !== false) {
      items.push({
        key: 'recentActivity',
        title: 'آخر النشاطات',
        render: () => (
          <div className={cx('grid h-full grid-cols-1 gap-4 overflow-hidden rounded-[2.2rem] bg-white p-8 text-slate-950 shadow-2xl ring-1 ring-slate-200', screenTemplate === 'news' ? 'xl:grid-cols-1 bg-gradient-to-l from-white to-slate-50' : 'xl:grid-cols-2')}>
            {recentAttendanceView.slice(0, 8).map((item) => (
              <div key={item.id} className="rounded-[1.75rem] bg-slate-100 p-5 ring-1 ring-slate-200">
                <div className="text-3xl font-black">{item.student}</div>
                <div className="mt-3 text-xl text-slate-500">{item.time} • {item.result}</div>
              </div>
            ))}
          </div>
        ),
      });
    }
    if (!items.length) {
      return [{ key: 'empty', title: 'الشاشة', render: () => <div className="h-full rounded-[2rem] bg-white p-8 text-slate-950 ring-1 ring-slate-200">لا توجد عناصر مفعلة لهذه الشاشة.</div> }];
    }
    const priorityMap = {
      executive: ['metrics','attendanceChart','recentActivity','topStudents','topCompanies'],
      reception: ['metrics','recentActivity','topStudents','attendanceChart','topCompanies'],
      leaderboard: ['topStudents','topCompanies','metrics','attendanceChart','recentActivity'],
      news: ['recentActivity','metrics','attendanceChart','topStudents','topCompanies'],
    };
    const order = priorityMap[screenTemplate] || priorityMap.executive;
    return items.sort((a, b) => order.indexOf(a.key) - order.indexOf(b.key));
    } catch (screenError) {
      console.error('failed to prepare screen slides', screenError);
      return [{
        key: 'screen-fallback',
        title: 'عرض بديل للشاشة',
        render: () => (
          <div className="h-full rounded-[2rem] bg-white p-8 text-slate-950 shadow-2xl ring-1 ring-slate-200">
            <div className="text-4xl font-black text-slate-900">{safeSchoolName}</div>
            <div className="mt-4 text-2xl text-slate-600">تعذر تجهيز قالب الشاشة المرتبطة، لذلك تم إظهار عرض بديل آمن.</div>
            <div className="mt-8 grid gap-4 xl:grid-cols-3">
              <div className="rounded-[1.5rem] bg-slate-100 p-5 ring-1 ring-slate-200"><div className="text-base font-bold text-slate-500">إجمالي الطلاب</div><div className="mt-3 text-5xl font-black">{summaryView?.totalStudents || 0}</div></div>
              <div className="rounded-[1.5rem] bg-emerald-50 p-5 ring-1 ring-emerald-200"><div className="text-base font-bold text-emerald-700">الحضور / النشطون</div><div className="mt-3 text-5xl font-black text-emerald-700">{summaryView?.presentToday || 0}</div></div>
              <div className="rounded-[1.5rem] bg-sky-50 p-5 ring-1 ring-sky-200"><div className="text-base font-bold text-sky-700">نسبة الجاهزية</div><div className="mt-3 text-5xl font-black text-sky-700">{summaryView?.attendanceRate || 0}%</div></div>
            </div>
          </div>
        )
      }];
    }
  }, [live, widgets, screenTemplate, structureSpotlight, summaryView, topStudentsView, topCompaniesView, topStudentsChartData, topCompaniesChartData, attendanceTrendView, recentAttendanceView, safeSchoolName]);

  useEffect(() => {
    setSlideIndex(0);
  }, [screen.token, slides.length]);

  useEffect(() => {
    if (slides.length <= 1) return undefined;
    const id = window.setInterval(() => setSlideIndex((prev) => (prev + 1) % slides.length), rotateSeconds * 1000);
    return () => window.clearInterval(id);
  }, [slides.length, rotateSeconds]);

  if (error) return <div dir="rtl" className="flex min-h-screen items-center justify-center bg-slate-100 p-6"><div className="rounded-3xl bg-white p-8 ring-1 ring-slate-200">{error}</div></div>;
  if (!payload) return <div dir="rtl" className="flex min-h-screen items-center justify-center bg-slate-100 p-6"><div className="rounded-3xl bg-white p-8 ring-1 ring-slate-200">جارِ تحميل الشاشة...</div></div>;

  const currentSlide = slides[slideIndex] || slides[0];
  const tickerItems = splitTickerItems(screen.tickerText);
  const showTicker = Boolean(screen.tickerEnabled && tickerItems.length);
  const tickerFontSize = Math.max(18, Math.min(56, Number(screen.tickerFontSize) || 28));

  return (
    <div dir="rtl" className={cx("h-screen overflow-hidden text-white antialiased", screenTheme.shell)}>
      <div className="relative flex h-full flex-col overflow-hidden px-4 pb-4 pt-4 xl:px-6">
        <div className={cx("rounded-[2rem] border px-8 py-6 shadow-2xl backdrop-blur-xl", screenTheme.panel)}>
          <div className="grid items-center gap-5 xl:grid-cols-[1fr_auto]">
            <div className="text-center xl:text-right">
              <div className="text-5xl font-black tracking-tight sm:text-6xl xl:text-7xl">{safeSchoolName}</div>
            </div>
            <div className="flex items-center justify-center gap-3 xl:justify-end">
              <div className="min-w-[250px] rounded-[1.8rem] bg-white/10 px-8 py-5 text-center ring-1 ring-white/15">
                <div className="text-lg font-bold tracking-[0.22em] text-white/65">TIME</div>
                <div className="mt-2 text-5xl font-black tracking-[0.1em] text-white xl:text-7xl">{clockTime}</div>
              </div>
              <button
                onClick={async () => {
                  try {
                    if (!document.fullscreenElement) await document.documentElement.requestFullscreen();
                  } catch (error) {
                    console.warn('fullscreen failed', error);
                  }
                }}
                aria-label="ملء الشاشة"
                className="inline-flex h-18 w-18 items-center justify-center rounded-[1.4rem] bg-white/15 text-white ring-1 ring-white/20 transition hover:bg-white/20"
              >
                <Maximize2 className="h-8 w-8" />
              </button>
            </div>
          </div>
          <div className="mt-5 grid grid-cols-3 items-center text-xl font-bold text-white/85 xl:text-2xl">
            <span className="text-right">{formatEnglishDigits(slideIndex + 1)} / {formatEnglishDigits(slides.length)}</span>
            <span className="text-center">{currentSlide.title}</span>
            <span className="text-left">{getScreenTemplateLabel(screenTemplate)}</span>
          </div>
        </div>

        <div className={cx('relative mt-5 flex-1 overflow-hidden', showTicker ? 'pb-28' : '')}>
          <AnimatePresence mode="wait">
            <motion.div
              key={`${currentSlide.key}-${slideIndex}`}
              initial={motionVariant.initial}
              animate={motionVariant.animate}
              exit={motionVariant.exit}
              transition={{ duration: motionVariant.duration || 0.55, ease: motionVariant.ease || 'easeOut' }}
              className="absolute inset-0"
            >
              <RenderErrorBoundary resetKey={`${currentSlide.key}-${slideIndex}`}>{currentSlide.render()}</RenderErrorBoundary>
            </motion.div>
          </AnimatePresence>
        </div>

        <div className={cx('mt-4 flex items-center justify-center gap-3', showTicker ? 'mb-20' : '')}>
          {slides.map((item, index) => (
            <button
              key={item.key}
              onClick={() => setSlideIndex(index)}
              className={cx(
                'group relative overflow-hidden rounded-full ring-1 ring-white/15 transition-all',
                index === slideIndex ? 'h-4 w-16 bg-white shadow-[0_0_22px_rgba(255,255,255,0.3)]' : 'h-4 w-4 bg-white/35 hover:bg-white/50'
              )}
              aria-label={item.title}
            >
              {index === slideIndex ? <span className="absolute inset-y-0 left-0 w-1/2 rounded-full bg-sky-300/80" /> : null}
            </button>
          ))}
        </div>

        {showTicker ? (
          <div className="pointer-events-none absolute bottom-0 left-0 right-0 z-[80] px-4 pb-4 xl:px-6">
            <div className={cx('overflow-hidden rounded-[1.75rem] px-4 py-4 shadow-[0_-12px_30px_rgba(0,0,0,0.35)] ring-1 ring-white/20', tickerTheme.wrap)}>
              <div className="flex items-center gap-4">
                <div className={cx('shrink-0 rounded-xl px-4 py-2 text-lg font-black', tickerTheme.badge)}>شريط الأخبار</div>
                <div className="min-w-0 flex-1 overflow-hidden">
                  {screen.tickerLayout === 'stacked' ? (
                    <div className="grid gap-2">
                      {tickerItems.slice(0, 5).map((item, index) => (
                        <React.Fragment key={`${item}-${index}`}>
                          <div className="flex items-center gap-3 rounded-2xl bg-black/10 px-4 py-2 ring-1 ring-white/10" style={{ fontSize: `${tickerFontSize}px`, lineHeight: 1.35 }}>
                            <span className="font-black text-white">{item}</span>
                          </div>
                          {screen.tickerShowLogo !== false && index < Math.min(tickerItems.length, 5) - 1 ? (
                            <div className="flex justify-center py-1"><SchoolTickerLogo schoolName={safeSchoolName} className="px-5 py-1.5 text-base" /></div>
                          ) : null}
                        </React.Fragment>
                      ))}
                    </div>
                  ) : (
                    <div className="relative min-w-0 overflow-hidden">
                      <div className={cx('flex items-center gap-4 whitespace-nowrap font-black', screen.tickerDir === 'ltr' ? 'animate-marquee-ltr' : 'animate-marquee-rtl')} style={{ fontSize: `${tickerFontSize}px`, lineHeight: 1.3 }}>
                        {[0, 1].map((loop) => (
                          <React.Fragment key={loop}>
                            {tickerItems.map((item, index) => (
                              <span key={`${loop}-${index}`} className="inline-flex items-center gap-4 px-2">
                                <span>{item}</span>
                                {index < tickerItems.length - 1 ? (
                                  <span className="inline-flex items-center gap-4 opacity-95">
                                    {screen.tickerShowLogo !== false ? <SchoolTickerLogo schoolName={safeSchoolName} className="px-4 py-1.5" /> : null}
                                    <span className="opacity-80">{screen.tickerSeparator || ' ✦ '}</span>
                                  </span>
                                ) : null}
                              </span>
                            ))}
                          </React.Fragment>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}

function DeviceDisplaysPage({ selectedSchool, currentUser, onCreateGateLink, onDeleteGateLink, onCreateScreenLink, onDeleteScreenLink, onUpdateScreenLink }) {
  return (
    <div className="space-y-6"> 
      <SectionCard title="الشاشات والبوابات" icon={ExternalLink} action={<Badge tone="blue">صفحة مستقلة للإدارة والتشغيل</Badge>}>
        <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
          <div className="rounded-3xl bg-gradient-to-l from-slate-900 to-slate-800 p-5 text-white shadow-lg">
            <div className="text-sm text-white/70">إدارة الشاشات</div>
            <div className="mt-2 text-3xl font-black">{selectedSchool.smartLinks?.screens?.length || 0}</div>
            <div className="mt-2 text-sm leading-7 text-white/80">إنشاء روابط العرض الذكي وتخصيص الانتقالات والثيمات وشريط الأخبار من مكان واحد.</div>
          </div>
          <div className="rounded-3xl bg-gradient-to-l from-emerald-700 to-cyan-700 p-5 text-white shadow-lg">
            <div className="text-sm text-white/70">إدارة البوابات</div>
            <div className="mt-2 text-3xl font-black">{selectedSchool.smartLinks?.gates?.length || 0}</div>
            <div className="mt-2 text-sm leading-7 text-white/80">روابط جاهزة للآيباد والجوال واللابتوب لبوابات QR وبصمة الوجه بدون تسجيل دخول.</div>
          </div>
          <div className="rounded-3xl bg-white p-5 ring-1 ring-slate-200 shadow-sm">
            <div className="text-sm font-bold text-slate-500">تنبيه صلاحيات</div>
            <div className="mt-2 text-lg font-black text-slate-900">الصلاحية المطلوبة: الشاشات والبوابات</div>
            <div className="mt-2 text-sm leading-7 text-slate-600">يمكن لمدير المدرسة منح هذه الصلاحية للمشرف أو المعلم من صفحة المستخدمين والصلاحيات.</div>
          </div>
        </div>
      </SectionCard>
      <SchoolDeviceLinksPanel
        selectedSchool={selectedSchool}
        currentUser={currentUser}
        onCreateGateLink={onCreateGateLink}
        onDeleteGateLink={onDeleteGateLink}
        onCreateScreenLink={onCreateScreenLink}
        onDeleteScreenLink={onDeleteScreenLink}
        onUpdateScreenLink={onUpdateScreenLink}
      />
    </div>
  );
}

function SchoolStructurePage({ selectedSchool, schoolUsers = [], currentUser, onSaveSchoolStructureProfile, onSaveSchoolStructureStageConfigs, onGenerateSchoolStructureClassrooms, onUpdateSchoolStructureClassroom, onDeleteSchoolStructureClassroom, onClearSchoolStructureClassroomStudents, onAddStudentToSchoolStructureClassroom, onUpdateStudentInSchoolStructureClassroom, onArchiveStudentInSchoolStructureClassroom, onTransferStudentInSchoolStructureClassroom, onImportStudentsToSchoolStructureClassroom, onUpdateScreenLink, onArchiveLegacySchoolSource, onRestoreLegacySchoolSource }) {
  const structureProfile = selectedSchool?.structure?.profile || {};
  const savedStageConfigs = Array.isArray(selectedSchool?.structure?.stageConfigs) ? selectedSchool.structure.stageConfigs : [];
  const [form, setForm] = useState(() => ({
    schoolName: structureProfile.schoolName || selectedSchool?.name || "",
    schoolGender: structureProfile.schoolGender || "boys",
    stages: Array.isArray(structureProfile.stages) && structureProfile.stages.length ? structureProfile.stages : [],
  }));
  const [stageDrafts, setStageDrafts] = useState({});
  const [stageRows, setStageRows] = useState(savedStageConfigs);
  const canEditGlobalIdentity = currentUser?.role === "superadmin";
  const savedClassrooms = Array.isArray(selectedSchool?.structure?.classrooms) ? selectedSchool.structure.classrooms : [];
  const structureTransfers = Array.isArray(selectedSchool?.structure?.transferLog) ? selectedSchool.structure.transferLog : [];
  const normalizedSavedClassrooms = useMemo(() => savedClassrooms.map((item) => ({ ...item, id: String(item.id) })), [savedClassrooms]);
  const [selectedClassroomId, setSelectedClassroomId] = useState(() => String(savedClassrooms[0]?.id || ""));
  const [classroomForm, setClassroomForm] = useState({ companyName: "", leaderUserId: "" });
  const [studentForm, setStudentForm] = useState({ fullName: "", guardianName: "", guardianMobile: "", identityNumber: "", notes: "" });
  const [editingStudentId, setEditingStudentId] = useState(null);
  const [editingStudentForm, setEditingStudentForm] = useState({ fullName: "", guardianName: "", guardianMobile: "", identityNumber: "", notes: "" });
  const [transferStudentId, setTransferStudentId] = useState(null);
  const [transferForm, setTransferForm] = useState({ targetClassroomId: "", reason: "" });
  const [pendingTargetClassroomId, setPendingTargetClassroomId] = useState("");
  const [importPreviewRows, setImportPreviewRows] = useState([]);
  const [importSummary, setImportSummary] = useState(null);
  const [importFileName, setImportFileName] = useState("");
  const [importMessage, setImportMessage] = useState("");
  const [importTargetClassroomId, setImportTargetClassroomId] = useState("");
  const [importColumnMap, setImportColumnMap] = useState({});
  const [screenLinkSavingId, setScreenLinkSavingId] = useState("");
  const importInputRef = useRef(null);
  const legacyArchive = selectedSchool?.legacyArchive || null;
  const legacyArchiveStudentsCount = Array.isArray(legacyArchive?.students) ? legacyArchive.students.length : 0;
  const legacyArchiveCompaniesCount = Array.isArray(legacyArchive?.companies) ? legacyArchive.companies.length : 0;
  const activeLegacyStudentsCount = Array.isArray(selectedSchool?.students) ? selectedSchool.students.length : 0;
  const activeLegacyCompaniesCount = Array.isArray(selectedSchool?.companies) ? selectedSchool.companies.length : 0;

  if (!selectedSchool) {
    return <SectionCard title="الهيكل المدرسي" icon={School}><div className="rounded-3xl border border-dashed border-slate-300 bg-slate-50 p-8 text-center text-sm font-bold text-slate-500">اختر مدرسة أولًا لعرض وحدة الهيكل المدرسي.</div></SectionCard>;
  }

  useEffect(() => {
    const nextProfile = selectedSchool?.structure?.profile || {};
    setForm({
      schoolName: nextProfile.schoolName || selectedSchool?.name || "",
      schoolGender: nextProfile.schoolGender || "boys",
      stages: Array.isArray(nextProfile.stages) && nextProfile.stages.length ? nextProfile.stages : [],
    });
    const nextClassrooms = Array.isArray(selectedSchool?.structure?.classrooms) ? selectedSchool.structure.classrooms : [];
    setStageRows(Array.isArray(selectedSchool?.structure?.stageConfigs) ? selectedSchool.structure.stageConfigs : []);
    setSelectedClassroomId((prev) => {
      const preferred = String(prev || "");
      const hasPreferred = nextClassrooms.some((item) => String(item.id) === preferred);
      return hasPreferred ? preferred : String(nextClassrooms[0]?.id || "");
    });
    const currentClassroom = nextClassrooms.find((item) => String(item.id) === String(selectedClassroomId)) || nextClassrooms[0] || null;
    setClassroomForm({ companyName: currentClassroom?.companyName || "", leaderUserId: currentClassroom?.leaderUserId ? String(currentClassroom.leaderUserId) : "" });
    setStudentForm({ fullName: "", guardianName: "", guardianMobile: "", identityNumber: "", notes: "" });
    setEditingStudentId(null);
    setTransferStudentId(null);
    setTransferForm({ targetClassroomId: "", reason: "" });
    setPendingTargetClassroomId("");
    setImportPreviewRows([]);
    setImportSummary(null);
    setImportFileName("");
    setImportMessage("");
    setImportColumnMap({});
    setImportTargetClassroomId(String(nextClassrooms[0]?.id || ""));
    const nextDrafts = {};
    SCHOOL_STAGE_OPTIONS.forEach((stage) => {
      nextDrafts[stage.key] = {
        gradeKey: SCHOOL_STAGE_GRADE_OPTIONS[stage.key]?.[0]?.[0] || "",
        classCount: 1,
      };
    });
    setStageDrafts(nextDrafts);
  }, [selectedSchool]);

  const toggleStage = (stageKey) => {
    setForm((prev) => ({
      ...prev,
      stages: prev.stages.includes(stageKey) ? prev.stages.filter((item) => item !== stageKey) : [...prev.stages, stageKey],
    }));
  };

  const handleSave = () => {
    onSaveSchoolStructureProfile?.({
      schoolName: canEditGlobalIdentity ? (form.schoolName.trim() || selectedSchool?.name || "") : (selectedSchool?.structure?.profile?.schoolName || selectedSchool?.name || ""),
      schoolGender: form.schoolGender,
      stages: form.stages,
    });
  };

  const updateStageDraft = (stageKey, patch) => {
    setStageDrafts((prev) => ({
      ...prev,
      [stageKey]: {
        ...(prev[stageKey] || {}),
        ...patch,
      },
    }));
  };

  const handleAddStageRow = (stageKey) => {
    const draft = stageDrafts[stageKey] || {};
    const gradeOptions = SCHOOL_STAGE_GRADE_OPTIONS[stageKey] || [];
    const gradeKey = draft.gradeKey || gradeOptions[0]?.[0];
    const gradeLabel = gradeOptions.find(([value]) => value === gradeKey)?.[1];
    const stageLabel = SCHOOL_STAGE_OPTIONS.find((item) => item.key === stageKey)?.label || stageKey;
    const classCount = Math.max(1, Math.min(20, Number(draft.classCount) || 1));
    if (!gradeKey || !gradeLabel) return;
    setStageRows((prev) => {
      const withoutCurrent = prev.filter((item) => !(item.stage === stageKey && item.gradeKey === gradeKey));
      return [...withoutCurrent, { stage: stageKey, stageLabel, gradeKey, gradeLabel, classCount }].sort((a, b) => `${a.stageLabel}-${a.gradeLabel}`.localeCompare(`${b.stageLabel}-${b.gradeLabel}`, 'ar'));
    });
    updateStageDraft(stageKey, { classCount: 1 });
  };

  const handleDeleteStageRow = (stageKey, gradeKey) => {
    setStageRows((prev) => prev.filter((item) => !(item.stage === stageKey && item.gradeKey === gradeKey)));
  };

  const handleSaveStageRows = () => {
    onSaveSchoolStructureStageConfigs?.(stageRows.filter((row) => form.stages.includes(row.stage)));
  };

  const filteredRows = stageRows.filter((row) => form.stages.includes(row.stage));
  const totalClasses = filteredRows.reduce((sum, row) => sum + (Number(row.classCount) || 0), 0);
  const generatedPreviewClassrooms = useMemo(() => generateSchoolStructureClassrooms(filteredRows), [filteredRows]);
  const savedClassroomsCount = normalizedSavedClassrooms.length;
  const leaderOptions = (Array.isArray(schoolUsers) ? schoolUsers : []).filter((user) => ["principal", "supervisor", "teacher"].includes(user.role));
  const schoolScreens = Array.isArray(selectedSchool?.smartLinks?.screens) ? selectedSchool.smartLinks.screens : [];
  const selectedClassroom = normalizedSavedClassrooms.find((item) => String(item.id) === String(selectedClassroomId)) || normalizedSavedClassrooms[0] || null;
  const classroomLinkedScreens = schoolScreens.filter((screen) => String(screen.linkedClassroomId || "") === String(selectedClassroomId));
  const classroomStudents = Array.isArray(selectedClassroom?.students) ? selectedClassroom.students : [];
  const activeStudents = classroomStudents.filter((student) => student.status !== "archived");
  const archivedStudents = classroomStudents.filter((student) => student.status === "archived");
  const availableTransferTargets = normalizedSavedClassrooms.filter((item) => String(item.id) !== String(selectedClassroomId));
  const classroomTransferLog = structureTransfers.filter((entry) => String(entry.fromClassroomId) === String(selectedClassroomId) || String(entry.toClassroomId) === String(selectedClassroomId)).slice().reverse().slice(0, 8);
  const transferStudent = classroomStudents.find((student) => String(student.id) === String(transferStudentId)) || null;
  const structureTabs = [
    { key: "overview", label: "نظرة عامة" },
    { key: "setup", label: "إعداد المدرسة" },
    { key: "classrooms", label: "الفصول" },
    { key: "classroomPage", label: "صفحة الفصل" },
    { key: "safeguards", label: "الحماية" },
  ];
  const [activeStructureTab, setActiveStructureTab] = useState("overview");

  useEffect(() => {
    const target = normalizedSavedClassrooms.find((item) => String(item.id) === String(selectedClassroomId)) || normalizedSavedClassrooms[0] || null;
    setClassroomForm({ companyName: target?.companyName || "", leaderUserId: target?.leaderUserId ? String(target.leaderUserId) : "" });
    setEditingStudentId(null);
    setTransferStudentId(null);
    setTransferForm({ targetClassroomId: "", reason: "" });
    setImportTargetClassroomId((prev) => {
      const preferred = String(prev || "");
      const exists = normalizedSavedClassrooms.some((item) => String(item.id) === preferred);
      return exists ? preferred : String(target?.id || "");
    });
  }, [selectedClassroomId, normalizedSavedClassrooms]);

  useEffect(() => {
    if (!pendingTargetClassroomId) return;
    const targetExists = normalizedSavedClassrooms.some((item) => String(item.id) === String(pendingTargetClassroomId));
    if (!targetExists) return;
    setSelectedClassroomId(String(pendingTargetClassroomId));
    setPendingTargetClassroomId("");
  }, [pendingTargetClassroomId, normalizedSavedClassrooms]);

  useEffect(() => {
    setActiveStructureTab("overview");
  }, [selectedSchool?.id]);

  const handleGenerateClassrooms = () => {
    onGenerateSchoolStructureClassrooms?.(filteredRows);
  };

  const handleSaveClassroomDetails = () => {
    if (!selectedClassroom) return;
    onUpdateSchoolStructureClassroom?.(selectedClassroom.id, {
      companyName: classroomForm.companyName,
      leaderUserId: classroomForm.leaderUserId ? Number(classroomForm.leaderUserId) : null,
    });
  };

  const handleLinkClassroomToScreen = async (screenId, enabled) => {
    if (!selectedClassroom || !screenId || !onUpdateScreenLink) return;
    const screen = schoolScreens.find((item) => String(item.id) === String(screenId));
    if (!screen) return;
    setScreenLinkSavingId(String(screenId));
    try {
      await onUpdateScreenLink(screenId, {
        name: screen.name,
        title: enabled ? `${selectedSchool?.name || "المدرسة"} • ${selectedClassroom.name}` : (screen.title || selectedSchool?.name || "لوحة المدرسة الحية"),
        widgets: screen.widgets || {},
        transition: screen.transition || "fade",
        rotateSeconds: Number(screen.rotateSeconds) || 8,
        theme: screen.theme || "emerald-night",
        template: screen.template || "executive",
        tickerEnabled: Boolean(screen.tickerEnabled),
        tickerText: screen.tickerText || "",
        tickerDir: screen.tickerDir || "rtl",
        tickerBg: screen.tickerBg || "amber",
        tickerSeparator: screen.tickerSeparator || " ✦ ",
        tickerFontSize: Number(screen.tickerFontSize) || 28,
        tickerShowLogo: screen.tickerShowLogo !== false,
        tickerLayout: screen.tickerLayout || "marquee",
        sourceMode: enabled ? "classroom" : "school",
        linkedClassroomId: enabled ? String(selectedClassroom.id) : "",
      });
    } finally {
      setScreenLinkSavingId("");
    }
  };

  const handleAddStudent = () => {
    if (!selectedClassroom || !studentForm.fullName.trim()) return;
    onAddStudentToSchoolStructureClassroom?.(selectedClassroom.id, {
      fullName: studentForm.fullName,
      guardianName: studentForm.guardianName,
      guardianMobile: studentForm.guardianMobile,
      identityNumber: studentForm.identityNumber,
      notes: studentForm.notes,
    });
    setStudentForm({ fullName: "", guardianName: "", guardianMobile: "", identityNumber: "", notes: "" });
  };

  const startEditStudent = (student) => {
    setEditingStudentId(student.id);
    setEditingStudentForm({
      fullName: student.fullName || "",
      guardianName: student.guardianName || "",
      guardianMobile: student.guardianMobile || "",
      identityNumber: student.identityNumber || "",
      notes: student.notes || "",
    });
  };

  const handleSaveStudentEdit = () => {
    if (!selectedClassroom || !editingStudentId || !editingStudentForm.fullName.trim()) return;
    onUpdateStudentInSchoolStructureClassroom?.(selectedClassroom.id, editingStudentId, editingStudentForm);
    setEditingStudentId(null);
  };

  const handleArchiveStudent = (studentId) => {
    if (!selectedClassroom || !studentId) return;
    onArchiveStudentInSchoolStructureClassroom?.(selectedClassroom.id, studentId);
    if (editingStudentId === studentId) setEditingStudentId(null);
    if (transferStudentId === studentId) setTransferStudentId(null);
  };

  const openTransferStudent = (studentId) => {
    setTransferStudentId(String(studentId));
    setTransferForm({ targetClassroomId: String(availableTransferTargets[0]?.id || ""), reason: "" });
  };

  const handleTransferStudent = () => {
    if (!selectedClassroom || !transferStudentId || !transferForm.targetClassroomId) return;
    const normalizedTargetId = String(transferForm.targetClassroomId);
    try {
      setPendingTargetClassroomId(normalizedTargetId);
      onTransferStudentInSchoolStructureClassroom?.(String(selectedClassroom.id), String(transferStudentId), normalizedTargetId, transferForm.reason);
      setTransferStudentId(null);
      setTransferForm({ targetClassroomId: "", reason: "" });
    } catch (error) {
      console.error(error);
      setPendingTargetClassroomId("");
    }
  };

  const normalizeImportHeader = (value) => String(value || "").replace(/\s+/g, " ").trim();

  const normalizeDigits = (value) => String(value || "").replace(/[٠-٩]/g, (digit) => String("٠١٢٣٤٥٦٧٨٩".indexOf(digit)));

  const sanitizeNumeric = (value) => normalizeDigits(value).replace(/\.0$/, "").replace(/[^\d+]/g, "").trim();

  const normalizeMobileValue = (value) => {
    const raw = sanitizeNumeric(value);
    if (!raw) return "";
    if (raw.startsWith("00966")) return `966${raw.slice(5)}`;
    if (raw.startsWith("+966")) return `966${raw.slice(4)}`;
    if (raw.startsWith("966")) return raw;
    if (raw.startsWith("05")) return `966${raw.slice(1)}`;
    return raw;
  };

  const normalizeIdentityValue = (value) => sanitizeNumeric(value).replace(/^\+/, "");

  const detectImportHeaderIndex = (rows = []) => rows.findIndex((row) => {
    const normalizedRow = (Array.isArray(row) ? row : []).map(normalizeImportHeader);
    return normalizedRow.some((cell) => /اسم الطالب|student name/i.test(cell)) && normalizedRow.some((cell) => /(هوية|اقامة|إقامة|رخصة|جوال|الهاتف|mobile|phone)/i.test(cell));
  });

  const detectHeaderMapping = (headers = []) => {
    const findHeader = (patterns = []) => {
      const index = headers.findIndex((header) => patterns.some((pattern) => pattern.test(header)));
      return index >= 0 ? { index, label: headers[index] } : null;
    };
    return {
      fullName: findHeader([/اسم الطالب/i, /student name/i]),
      identityNumber: findHeader([/رقم.*(هوية|إقامة|اقامة|رخصة)/i, /identity/i, /iqama/i, /id number/i]),
      guardianMobile: findHeader([/رقم.*(جوال|الهاتف|ولي الأمر|ولي الامر|الطالب)/i, /guardian mobile/i, /mobile/i, /phone/i]),
      guardianName: findHeader([/اسم.*ولي الأمر/i, /اسم.*ولي الامر/i, /guardian name/i, /parent name/i]),
      notes: findHeader([/ملاحظ/i, /notes?/i]),
    };
  };

  const extractImportedStudents = (rows = []) => {
    const headerIndex = detectImportHeaderIndex(rows);
    if (headerIndex === -1) {
      return { rows: [], errors: ["لم يتم العثور على صف العناوين. تأكد أن الملف يحتوي على عمود اسم الطالب ومعه الهوية أو الجوال على الأقل."], columnMap: {} };
    }
    const headers = (rows[headerIndex] || []).map(normalizeImportHeader);
    const headerMap = detectHeaderMapping(headers);
    if (!headerMap.fullName) {
      return { rows: [], errors: ["لم يتم العثور على عمود اسم الطالب داخل الملف."], columnMap: {} };
    }
    const result = [];
    const errors = [];
    rows.slice(headerIndex + 1).forEach((row, index) => {
      const values = Array.isArray(row) ? row : [];
      const fullName = String(values[headerMap.fullName.index] || "").trim();
      const guardianName = headerMap.guardianName ? String(values[headerMap.guardianName.index] || "").trim() : "";
      const identityNumber = headerMap.identityNumber ? normalizeIdentityValue(values[headerMap.identityNumber.index]) : "";
      const guardianMobile = headerMap.guardianMobile ? normalizeMobileValue(values[headerMap.guardianMobile.index]) : "";
      const notes = headerMap.notes ? String(values[headerMap.notes.index] || "").trim() : "";
      if (!fullName && !guardianName && !identityNumber && !guardianMobile) return;
      const rowNumber = headerIndex + index + 2;
      const blockingErrors = [];
      const warnings = [];
      if (!fullName) blockingErrors.push("اسم الطالب مفقود");
      if (!identityNumber && !guardianMobile) warnings.push("لا توجد هوية ولا جوال");
      if (identityNumber && !/^\d{10}$/.test(identityNumber)) warnings.push("رقم الهوية / الإقامة ليس 10 أرقام");
      if (guardianMobile && !/^9665\d{8}$/.test(guardianMobile) && !/^05\d{8}$/.test(normalizeDigits(guardianMobile))) warnings.push("رقم الجوال لا يبدو سعوديًا بالصيغ المعتادة");
      if (!guardianName) warnings.push("اسم ولي الأمر غير موجود");
      if (blockingErrors.length) {
        errors.push(`الصف ${rowNumber}: ${blockingErrors.join(" - ")}.`);
      }
      result.push({
        rowNumber,
        fullName,
        identityNumber,
        guardianMobile,
        guardianName,
        notes,
        source: "noor_excel",
        blockingErrors,
        warnings,
      });
    });
    return { rows: result, errors, columnMap: Object.fromEntries(Object.entries(headerMap).filter(([, value]) => value).map(([key, value]) => [key, value.label])) };
  };

  const handleImportFile = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setImportMessage("");
    setImportFileName(file.name);
    try {
      const buffer = await file.arrayBuffer();
      const workbook = XLSX.read(buffer, { type: "array" });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const rawRows = XLSX.utils.sheet_to_json(worksheet, { header: 1, defval: "" });
      const parsed = extractImportedStudents(rawRows);
      setImportColumnMap(parsed.columnMap || {});
      const targetId = String(importTargetClassroomId || selectedClassroom?.id || normalizedSavedClassrooms[0]?.id || "");
      const targetClassroom = normalizedSavedClassrooms.find((item) => String(item.id) === targetId) || null;
      const existingStudents = Array.isArray(targetClassroom?.students) ? targetClassroom.students : [];
      const seen = new Set();
      const preview = parsed.rows.map((student) => {
        const duplicateKey = student.identityNumber || `${student.fullName}::${student.guardianMobile}`;
        const duplicateInFile = duplicateKey ? seen.has(duplicateKey) : false;
        if (duplicateKey) seen.add(duplicateKey);
        const duplicateInClassroom = existingStudents.some((existing) => {
          const sameIdentity = student.identityNumber && String(existing.identityNumber || "") === String(student.identityNumber);
          const sameMobile = student.guardianMobile && String(existing.guardianMobile || "") === String(student.guardianMobile);
          const sameName = String(existing.fullName || "").trim() === student.fullName;
          return sameIdentity || (sameName && sameMobile) || (sameName && !student.identityNumber);
        });
        const hasBlockingError = Array.isArray(student.blockingErrors) && student.blockingErrors.length > 0;
        return { ...student, duplicateInFile, duplicateInClassroom, hasBlockingError };
      });
      const accepted = preview.filter((student) => !student.duplicateInFile && !student.duplicateInClassroom && !student.hasBlockingError && student.fullName);
      setImportPreviewRows(preview);
      setImportSummary({
        total: preview.length,
        accepted: accepted.length,
        duplicateInFile: preview.filter((row) => row.duplicateInFile).length,
        duplicateInClassroom: preview.filter((row) => row.duplicateInClassroom).length,
        withWarnings: preview.filter((row) => Array.isArray(row.warnings) && row.warnings.length > 0).length,
        missingGuardianName: preview.filter((row) => !row.guardianName).length,
        invalidIdentity: preview.filter((row) => row.identityNumber && !/^\d{10}$/.test(row.identityNumber)).length,
        invalidMobile: preview.filter((row) => row.guardianMobile && !/^9665\d{8}$/.test(row.guardianMobile) && !/^05\d{8}$/.test(normalizeDigits(row.guardianMobile))).length,
        errors: parsed.errors,
      });
      setImportMessage(`تمت قراءة الملف ${file.name} ومعاينة ${preview.length} سجلًا.`);
    } catch (error) {
      console.error(error);
      setImportPreviewRows([]);
      setImportColumnMap({});
      setImportSummary({ total: 0, accepted: 0, duplicateInFile: 0, duplicateInClassroom: 0, withWarnings: 0, missingGuardianName: 0, invalidIdentity: 0, invalidMobile: 0, errors: ["تعذر قراءة الملف. تأكد من أن الملف Excel صالح."] });
      setImportMessage("حدث خطأ أثناء قراءة ملف Excel.");
    } finally {
      event.target.value = "";
    }
  };

  const handleCommitImport = () => {
    const targetId = String(importTargetClassroomId || selectedClassroom?.id || "");
    if (!targetId) {
      setImportMessage("اختر الفصل الهدف قبل اعتماد الاستيراد.");
      return;
    }
    const acceptedRows = importPreviewRows.filter((student) => !student.duplicateInFile && !student.duplicateInClassroom && !student.hasBlockingError && student.fullName);
    if (acceptedRows.length === 0) {
      setImportMessage("لا توجد سجلات صالحة لاعتمادها داخل هذا الفصل.");
      return;
    }
    const result = onImportStudentsToSchoolStructureClassroom?.(targetId, acceptedRows) || null;
    const importedCount = Number(result?.importedCount || acceptedRows.length || 0);
    const skippedCount = Number(result?.skippedCount || 0);
    setImportMessage(`تم اعتماد ${importedCount} طالبًا داخل الفصل${skippedCount ? `، وتم تجاوز ${skippedCount} سجل مكرر.` : ""}.`);
    setImportPreviewRows([]);
    setImportSummary(null);
    setImportFileName("");
  };

  return (
    <div className="space-y-6">
      <div className="rounded-[1.75rem] bg-white p-3 ring-1 ring-slate-200 shadow-sm">
        <div className="flex flex-wrap gap-2">
          {structureTabs.map((tab) => (
            <button
              key={tab.key}
              type="button"
              onClick={() => setActiveStructureTab(tab.key)}
              className={cx("rounded-2xl px-4 py-3 text-sm font-black transition", activeStructureTab === tab.key ? "bg-sky-700 text-white shadow-sm" : "bg-slate-100 text-slate-700 hover:bg-slate-200")}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {activeStructureTab === "overview" ? <>
      <SectionCard title="الهيكل المدرسي" icon={School} action={<Badge tone="emerald">المرحلة الحالية</Badge>}>
        <div className="mb-6 rounded-[2rem] border border-amber-200 bg-gradient-to-r from-amber-50 via-white to-orange-50 p-5 shadow-sm">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="space-y-2">
              <div className="text-lg font-black text-slate-900">أرشفة المصدر القديم واستكمال الهجرة إلى الهيكل المدرسي</div>
              <div className="text-sm leading-7 text-slate-600">هذه الأداة تنقل الطلاب والفصول القديمة إلى أرشيف مخفي داخل المدرسة، وتُبقي الهيكل المدرسي هو المرجع الظاهر. لا يتم حذف البيانات نهائيًا ويمكن استعادتها لاحقًا عند الحاجة.</div>
              <div className="flex flex-wrap gap-2 text-xs font-bold">
                <span className="rounded-full bg-white px-3 py-2 text-slate-700 ring-1 ring-slate-200">المصدر القديم النشط: {activeLegacyStudentsCount} طالب</span>
                <span className="rounded-full bg-white px-3 py-2 text-slate-700 ring-1 ring-slate-200">{activeLegacyCompaniesCount} فصل/شركة</span>
                <span className="rounded-full bg-violet-100 px-3 py-2 text-violet-800 ring-1 ring-violet-200">الأرشيف المخفي: {legacyArchiveStudentsCount} طالب</span>
                <span className="rounded-full bg-violet-100 px-3 py-2 text-violet-800 ring-1 ring-violet-200">{legacyArchiveCompaniesCount} فصل/شركة</span>
              </div>
            </div>
            <div className="flex flex-wrap gap-3">
              <button type="button" onClick={() => onArchiveLegacySchoolSource?.()} disabled={!schoolHasStructureClassrooms(selectedSchool) || (!activeLegacyStudentsCount && !activeLegacyCompaniesCount)} className="rounded-2xl bg-slate-900 px-5 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50">ترحيل المصدر القديم إلى الأرشيف</button>
              <button type="button" onClick={() => onRestoreLegacySchoolSource?.()} disabled={!legacyArchiveStudentsCount && !legacyArchiveCompaniesCount} className="rounded-2xl border border-slate-300 bg-white px-5 py-3 text-sm font-bold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50">استعادة المصدر القديم</button>
            </div>
          </div>
          {!schoolHasStructureClassrooms(selectedSchool) ? <div className="mt-4 rounded-2xl border border-dashed border-amber-300 bg-amber-100/70 px-4 py-3 text-sm font-bold text-amber-900">لن يتم تفعيل الأرشفة حتى يكون للمدرسة فصول فعلية داخل الهيكل المدرسي.</div> : null}
        </div>
        <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
          <div className="rounded-3xl bg-gradient-to-l from-slate-900 to-slate-800 p-6 text-white shadow-lg">
            <div className="text-sm text-white/70">حالة التنفيذ</div>
            <div className="mt-2 text-3xl font-black">إدارة الطلاب داخل الفصل</div>
            <div className="mt-3 text-sm leading-7 text-white/80">أصبح بإمكان المدير الآن تعديل بيانات الطالب داخل الهيكل المدرسي، وأرشفته بدل الحذف النهائي، ونقله من فصل إلى فصل مع الاحتفاظ بسجل واضح للحركة.</div>
          </div>
          <div className="rounded-3xl bg-white p-6 ring-1 ring-slate-200 shadow-sm xl:col-span-2">
            <div className="text-sm font-bold text-slate-500">الهدف من هذه المرحلة</div>
            <div className="mt-2 text-2xl font-black text-slate-900">تحسين الاستيراد والتحقق من بيانات الطلاب</div>
            <div className="mt-3 text-sm leading-8 text-slate-600">نطوّر الاستيراد داخل الهيكل المدرسي فقط ليصبح أقرب لملفات نور الفعلية، مع معاينة أوضح، والتحقق من الهوية والجوال، ودعم اسم ولي الأمر عندما يكون موجودًا.</div>
          </div>
        </div>
      </SectionCard>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1.45fr,1fr]">
        <SectionCard title="بيانات المدرسة" icon={Building2} action={<Badge tone="blue">آمن ومحافظ</Badge>}>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <Input label="اسم المدرسة داخل الهيكل المدرسي" value={form.schoolName} onChange={(e) => setForm((prev) => ({ ...prev, schoolName: e.target.value }))} placeholder="مثال: متوسطة الأبناء الثالثة" disabled={!canEditGlobalIdentity} className={!canEditGlobalIdentity ? "cursor-not-allowed bg-slate-100 text-slate-500" : ""} />
            <Select label="نوع المدرسة" value={form.schoolGender} onChange={(e) => setForm((prev) => ({ ...prev, schoolGender: e.target.value }))}>
              {SCHOOL_GENDER_OPTIONS.map(([value, label]) => <option key={value} value={value}>{label}</option>)}
            </Select>
          </div>

          <div className="mt-6">
            <div className="mb-3 text-sm font-bold text-slate-700">المراحل الدراسية</div>
            <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
              {SCHOOL_STAGE_OPTIONS.map((stage) => {
                const checked = form.stages.includes(stage.key);
                return (
                  <label key={stage.key} className={cx("flex cursor-pointer items-center justify-between rounded-2xl border p-4 transition", checked ? "border-emerald-300 bg-emerald-50 text-emerald-900" : "border-slate-200 bg-white text-slate-700")}>
                    <div>
                      <div className="font-black">{stage.label}</div>
                      <div className="mt-1 text-xs text-slate-500">عند التفعيل ستظهر قائمة الصفوف الخاصة بهذه المرحلة</div>
                    </div>
                    <input type="checkbox" checked={checked} onChange={() => toggleStage(stage.key)} className="h-5 w-5 rounded border-slate-300 text-emerald-600" />
                  </label>
                );
              })}
            </div>
          </div>

          <div className="mt-6 flex flex-wrap items-center gap-3">
            <button onClick={handleSave} className="inline-flex items-center gap-2 rounded-2xl bg-sky-600 px-5 py-3 text-sm font-black text-white shadow-sm transition hover:bg-sky-700">
              <Save className="h-4 w-4" />
              حفظ بيانات المدرسة
            </button>
            <div className="text-sm text-slate-500">هذا الحفظ لا يغير الحضور ولا البوابات ولا شاشة العرض.</div>
          </div>
          {!canEditGlobalIdentity ? <div className="mt-4 rounded-2xl bg-amber-50 px-4 py-3 text-sm font-bold text-amber-900 ring-1 ring-amber-200">اسم المدرسة والرقم الوزاري والهوية المركزية للمنصة يديرها الأدمن الرئيسي فقط، بينما يستطيع مدير المدرسة متابعة المراحل والفصول والتشغيل اليومي.</div> : null}
        </SectionCard>

        <div className="space-y-6">
          <SectionCard title="ملخص سريع" icon={ClipboardCheck}>
            <div className="space-y-3">
              <div className="rounded-2xl bg-slate-50 p-4 ring-1 ring-slate-200">
                <div className="text-sm text-slate-500">المدرسة الحالية في النظام</div>
                <div className="mt-1 text-lg font-black text-slate-900">{selectedSchool?.name || "—"}</div>
              </div>
              <div className="rounded-2xl bg-slate-50 p-4 ring-1 ring-slate-200">
                <div className="text-sm text-slate-500">المراحل المختارة</div>
                <div className="mt-1 text-lg font-black text-slate-900">{form.stages.map((key) => SCHOOL_STAGE_OPTIONS.find((item) => item.key === key)?.label).filter(Boolean).join("، ") || "—"}</div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-2xl bg-slate-50 p-4 ring-1 ring-slate-200">
                  <div className="text-sm text-slate-500">عدد الصفوف المضافة</div>
                  <div className="mt-1 text-3xl font-black text-slate-900">{filteredRows.length}</div>
                </div>
                <div className="rounded-2xl bg-slate-50 p-4 ring-1 ring-slate-200">
                  <div className="text-sm text-slate-500">إجمالي الفصول</div>
                  <div className="mt-1 text-3xl font-black text-slate-900">{totalClasses}</div>
                </div>
              </div>
            </div>
          </SectionCard>

          <SectionCard title="جاهزية النقل والتعديل" icon={ArrowRightLeft} action={<Badge tone="amber">جديد</Badge>}>
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-2xl bg-slate-50 p-4 ring-1 ring-slate-200">
                <div className="text-sm text-slate-500">الطلاب النشطون</div>
                <div className="mt-1 text-3xl font-black text-slate-900">{activeStudents.length}</div>
              </div>
              <div className="rounded-2xl bg-slate-50 p-4 ring-1 ring-slate-200">
                <div className="text-sm text-slate-500">الطلاب المؤرشفون</div>
                <div className="mt-1 text-3xl font-black text-slate-900">{archivedStudents.length}</div>
              </div>
            </div>
            <div className="mt-4 text-sm leading-8 text-slate-600">أصبح بالإمكان تعديل بيانات الطالب داخل الفصل، أو أرشفته للحفاظ على السجل، أو نقله إلى فصل آخر مع كتابة سبب النقل وحفظه في سجل مستقل.</div>
          </SectionCard>
        </div>
      </div>

      </> : null}

      {activeStructureTab === "setup" ? <>
      <SectionCard title="إعداد الصفوف والفصول" icon={Layers3} action={<Badge tone="violet">مستمر</Badge>}>
        <div className="space-y-5">
          {form.stages.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-slate-300 bg-slate-50 p-8 text-center text-sm font-bold text-slate-500">اختر مرحلة واحدة على الأقل من الأعلى لتظهر لك القوائم المنسدلة الخاصة بالصفوف.</div>
          ) : (
            form.stages.map((stageKey) => {
              const stageMeta = SCHOOL_STAGE_OPTIONS.find((item) => item.key === stageKey);
              const draft = stageDrafts[stageKey] || {};
              const gradeOptions = SCHOOL_STAGE_GRADE_OPTIONS[stageKey] || [];
              return (
                <div key={stageKey} className="rounded-[1.75rem] border border-slate-200 bg-slate-50/80 p-5">
                  <div className="flex flex-col gap-3 lg:flex-row lg:items-end">
                    <div className="min-w-0 flex-1">
                      <div className="text-lg font-black text-slate-900">{stageMeta?.label}</div>
                      <div className="mt-1 text-sm text-slate-500">اختر الصف من القائمة ثم أدخل عدد الفصول الخاصة به وأضفه إلى الجدول.</div>
                    </div>
                    <div className="grid flex-1 grid-cols-1 gap-3 md:grid-cols-[1.2fr,0.8fr,auto]">
                      <Select label={`الصف في مرحلة ${stageMeta?.label || ''}`} value={draft.gradeKey || gradeOptions[0]?.[0] || ''} onChange={(e) => updateStageDraft(stageKey, { gradeKey: e.target.value })}>
                        {gradeOptions.map(([value, label]) => <option key={value} value={value}>{label}</option>)}
                      </Select>
                      <Input label="عدد الفصول" type="number" min="1" max="20" value={draft.classCount ?? 1} onChange={(e) => updateStageDraft(stageKey, { classCount: e.target.value })} />
                      <button type="button" onClick={() => handleAddStageRow(stageKey)} className="inline-flex h-[52px] items-center justify-center gap-2 rounded-2xl bg-sky-700 px-5 text-sm font-black text-white shadow-sm transition hover:bg-sky-800">
                        <Plus className="h-4 w-4" />
                        إضافة
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        <div className="mt-6 overflow-hidden rounded-[1.75rem] border border-slate-200">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200 bg-white text-right">
              <thead className="bg-slate-50 text-sm font-black text-slate-700">
                <tr>
                  <th className="px-4 py-3">المرحلة</th>
                  <th className="px-4 py-3">الصف</th>
                  <th className="px-4 py-3">عدد الفصول</th>
                  <th className="px-4 py-3">إجراء</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm text-slate-700">
                {filteredRows.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-4 py-8 text-center font-bold text-slate-400">لا توجد صفوف مضافة حتى الآن.</td>
                  </tr>
                ) : filteredRows.map((row) => (
                  <tr key={`${row.stage}-${row.gradeKey}`}>
                    <td className="px-4 py-3 font-bold">{row.stageLabel}</td>
                    <td className="px-4 py-3">{row.gradeLabel}</td>
                    <td className="px-4 py-3">{row.classCount}</td>
                    <td className="px-4 py-3"><button onClick={() => handleDeleteStageRow(row.stage, row.gradeKey)} className="rounded-xl bg-rose-50 px-3 py-2 font-bold text-rose-700">حذف</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="mt-6 flex flex-wrap items-center gap-3">
          <button onClick={handleSaveStageRows} className="inline-flex items-center gap-2 rounded-2xl bg-violet-700 px-5 py-3 text-sm font-black text-white shadow-sm transition hover:bg-violet-800"><Save className="h-4 w-4" /> حفظ الصفوف والفصول</button>
          <button onClick={handleGenerateClassrooms} className="inline-flex items-center gap-2 rounded-2xl bg-emerald-700 px-5 py-3 text-sm font-black text-white shadow-sm transition hover:bg-emerald-800"><Wand2 className="h-4 w-4" /> توليد الفصول الفعلية</button>
          <div className="text-sm text-slate-500">التوليد الحالي داخل الهيكل المدرسي فقط.</div>
        </div>
      </SectionCard>

      </> : null}

      {activeStructureTab === "classrooms" ? <>
      <SectionCard title="قائمة الفصول الفعلية" icon={School} action={<Badge tone="sky">{savedClassroomsCount} فصل</Badge>}>
        <div className="mb-5 grid grid-cols-1 gap-4 xl:grid-cols-4">
          <div className="rounded-3xl bg-slate-50 p-5 ring-1 ring-slate-200">
            <div className="text-sm text-slate-500">الفصول المعتمدة</div>
            <div className="mt-1 text-3xl font-black text-slate-900">{savedClassroomsCount}</div>
          </div>
          <div className="rounded-3xl bg-slate-50 p-5 ring-1 ring-slate-200 xl:col-span-3">
            <Select label="اختر فصلًا لفتح صفحته" value={selectedClassroomId} onChange={(e) => setSelectedClassroomId(String(e.target.value))}>
              {(savedClassrooms.length ? savedClassrooms : [{ id: "", name: "لا توجد فصول مولدة" }]).map((item) => <option key={item.id || "empty"} value={item.id}>{item.name}</option>)}
            </Select>
            <div className="mt-3 text-sm text-slate-500">بعد اختيار الفصل ستظهر بياناته الأساسية والطلاب المرتبطون به داخل الهيكل المدرسي فقط.</div>
            {selectedClassroom ? (
              <div className="mt-4 flex flex-wrap gap-3">
                <button type="button" onClick={() => {
                  if (!window.confirm(`سيتم حذف الفصل ${selectedClassroom.name} بالكامل من الهيكل المدرسي. هل تريد المتابعة؟`)) return;
                  onDeleteSchoolStructureClassroom?.(selectedClassroom.id);
                  setSelectedClassroomId("");
                }} className="rounded-2xl bg-rose-600 px-4 py-3 text-sm font-black text-white shadow-sm transition hover:bg-rose-700">حذف الفصل كاملًا</button>
                <button type="button" onClick={() => {
                  if (!window.confirm(`سيتم حذف قائمة الأسماء داخل الفصل ${selectedClassroom.name} فقط مع إبقاء الفصل موجودًا. هل تريد المتابعة؟`)) return;
                  onClearSchoolStructureClassroomStudents?.(selectedClassroom.id);
                }} className="rounded-2xl border border-amber-300 bg-white px-4 py-3 text-sm font-black text-amber-700 transition hover:bg-amber-50">حذف قائمة الأسماء كاملة</button>
              </div>
            ) : null}
          </div>
        </div>
      </SectionCard>

      </> : null}

      {activeStructureTab === "classroomPage" ? (
      selectedClassroom ? (
        <SectionCard title={`صفحة الفصل: ${selectedClassroom.name}`} icon={Users} action={<Badge tone="emerald">صفحة مستقلة</Badge>}>
          <div className="space-y-6">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
              <div className="rounded-3xl bg-slate-50 p-5 ring-1 ring-slate-200"><div className="text-sm text-slate-500">الفصل المحدد</div><div className="mt-2 text-2xl font-black text-slate-900">{selectedClassroom.name}</div><div className="mt-2 text-sm text-slate-600">{selectedClassroom.stageLabel} — {selectedClassroom.gradeLabel}</div></div>
              <div className="rounded-3xl bg-slate-50 p-5 ring-1 ring-slate-200"><div className="text-sm text-slate-500">عدد الطلاب داخل الهيكل</div><div className="mt-2 text-3xl font-black text-slate-900">{classroomStudents.length}</div><div className="mt-2 text-sm text-slate-500">النشطون {activeStudents.length} — المؤرشفون {archivedStudents.length}</div></div>
              <div className="rounded-3xl bg-slate-50 p-5 ring-1 ring-slate-200"><div className="text-sm text-slate-500">اسم الشركة</div><div className="mt-2 text-lg font-black text-slate-900">{selectedClassroom.companyName || "—"}</div></div>
              <div className="rounded-3xl bg-slate-50 p-5 ring-1 ring-slate-200"><div className="text-sm text-slate-500">رائد الفصل</div><div className="mt-2 text-lg font-black text-slate-900">{leaderOptions.find((item) => Number(item.id) === Number(selectedClassroom.leaderUserId))?.name || "—"}</div></div>
            </div>

            <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1fr,1.2fr]">
              <div className="space-y-6">
                <div className="rounded-[1.75rem] border border-slate-200 bg-white p-5 shadow-sm">
                  <div className="text-lg font-black text-slate-900">بيانات الفصل الأساسية</div>
                  <div className="mt-2 text-sm leading-7 text-slate-600">في هذه المرحلة نربط فقط اسم الشركة ورائد الفصل داخل الهيكل المدرسي، دون التأثير على بيانات المنصة الحالية.</div>
                  <div className="mt-5 grid grid-cols-1 gap-4">
                    <Input label="اسم الشركة" value={classroomForm.companyName} onChange={(e) => setClassroomForm((prev) => ({ ...prev, companyName: e.target.value }))} placeholder="مثال: شركة الإبداع" />
                    <Select label="رائد الفصل" value={classroomForm.leaderUserId} onChange={(e) => setClassroomForm((prev) => ({ ...prev, leaderUserId: e.target.value }))}>
                      <option value="">بدون تعيين حاليًا</option>
                      {leaderOptions.map((user) => <option key={user.id} value={user.id}>{user.name} — {getRoleLabel(user.role)}</option>)}
                    </Select>
                    <button type="button" onClick={handleSaveClassroomDetails} className="inline-flex items-center justify-center gap-2 rounded-2xl bg-violet-600 px-5 py-3 text-sm font-black text-white shadow-sm transition hover:bg-violet-700"><Save className="h-4 w-4" /> حفظ بيانات الفصل</button>
                  </div>
                </div>

                <div className="rounded-[1.75rem] border border-cyan-200 bg-cyan-50 p-5 shadow-sm">
                  <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                    <div>
                      <div className="text-lg font-black text-cyan-950">ربط الفصل بشاشات العرض</div>
                      <div className="mt-2 text-sm leading-7 text-cyan-900">اربط هذا الفصل بأي شاشة موجودة في المدرسة ليصبح مصدر بياناتها من الهيكل المدرسي. الربط اختياري وآمن ولا يؤثر على الشاشات الأخرى إلا إذا اخترت ذلك صراحة.</div>
                    </div>
                    <Badge tone="sky">{classroomLinkedScreens.length} شاشة مرتبطة</Badge>
                  </div>
                  {schoolScreens.length === 0 ? (
                    <div className="mt-4 rounded-2xl bg-white p-4 text-sm font-bold text-slate-500 ring-1 ring-cyan-200">لا توجد شاشات عرض منشأة لهذه المدرسة حتى الآن. أنشئ شاشة أولًا من قسم الشاشات والبوابات، ثم ارجع هنا لربطها بهذا الفصل.</div>
                  ) : (
                    <div className="mt-5 space-y-3">
                      {schoolScreens.map((screen) => {
                        const isLinkedToThisClassroom = String(screen.linkedClassroomId || "") === String(selectedClassroom.id) && (screen.sourceMode || "school") === "classroom";
                        const linkedClassroomName = normalizedSavedClassrooms.find((item) => String(item.id) === String(screen.linkedClassroomId || ""))?.name || "";
                        const isSaving = String(screenLinkSavingId) === String(screen.id);
                        return (
                          <div key={screen.id} className="rounded-2xl bg-white p-4 ring-1 ring-cyan-200">
                            <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                              <div>
                                <div className="text-base font-black text-slate-900">{screen.name}</div>
                                <div className="mt-1 text-sm text-slate-600">{screen.title || "لوحة المدرسة الحية"}</div>
                                <div className="mt-2 flex flex-wrap gap-2 text-xs font-bold">
                                  <span className={`rounded-full px-3 py-1 ${isLinkedToThisClassroom ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-600"}`}>{isLinkedToThisClassroom ? "مرتبطة بهذا الفصل" : "غير مرتبطة بهذا الفصل"}</span>
                                  <span className="rounded-full bg-white px-3 py-1 text-slate-600 ring-1 ring-slate-200">المصدر الحالي: {(screen.sourceMode || "school") === "classroom" ? `فصل (${linkedClassroomName || "غير محدد"})` : "المدرسة كاملة"}</span>
                                </div>
                              </div>
                              <div className="flex flex-wrap gap-2">
                                <button
                                  type="button"
                                  onClick={() => handleLinkClassroomToScreen(screen.id, true)}
                                  disabled={isSaving || isLinkedToThisClassroom}
                                  className="inline-flex items-center gap-2 rounded-2xl bg-cyan-700 px-4 py-2.5 text-sm font-black text-white shadow-sm transition enabled:hover:bg-cyan-800 disabled:cursor-not-allowed disabled:opacity-50"
                                >
                                  {isSaving && !isLinkedToThisClassroom ? <Loader2 className="h-4 w-4 animate-spin" /> : <MonitorSmartphone className="h-4 w-4" />}
                                  ربط هذه الشاشة بالفصل
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleLinkClassroomToScreen(screen.id, false)}
                                  disabled={isSaving || !isLinkedToThisClassroom}
                                  className="inline-flex items-center gap-2 rounded-2xl bg-white px-4 py-2.5 text-sm font-black text-slate-700 ring-1 ring-slate-200 transition enabled:hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                                >
                                  {isSaving && isLinkedToThisClassroom ? <Loader2 className="h-4 w-4 animate-spin" /> : <Unlink2 className="h-4 w-4" />}
                                  إلغاء الربط
                                </button>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                <div className="rounded-[1.75rem] border border-slate-200 bg-white p-5 shadow-sm">
                  <div className="text-lg font-black text-slate-900">إضافة طالب يدويًا</div>
                  <div className="mt-2 text-sm leading-7 text-slate-600">هذه الإضافة داخل الفصل المحدد فقط، وهي مستقلة تمامًا عن قوائم الطلاب الأساسية الحالية في المنصة.</div>
                  <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-2">
                    <Input label="اسم الطالب" value={studentForm.fullName} onChange={(e) => setStudentForm((prev) => ({ ...prev, fullName: e.target.value }))} placeholder="الاسم الرباعي" />
                    <Input label="اسم ولي الأمر" value={studentForm.guardianName} onChange={(e) => setStudentForm((prev) => ({ ...prev, guardianName: e.target.value }))} placeholder="اسم ولي الأمر" />
                    <Input label="رقم جوال ولي الأمر" value={studentForm.guardianMobile} onChange={(e) => setStudentForm((prev) => ({ ...prev, guardianMobile: e.target.value }))} placeholder="05xxxxxxxx أو 9665xxxxxxxx" />
                    <Input label="رقم الهوية / الإقامة" value={studentForm.identityNumber} onChange={(e) => setStudentForm((prev) => ({ ...prev, identityNumber: e.target.value }))} placeholder="كما يظهر في ملف نور" />
                    <div className="md:col-span-2"><label className="mb-2 block text-sm font-bold text-slate-700">ملاحظات</label><textarea value={studentForm.notes} onChange={(e) => setStudentForm((prev) => ({ ...prev, notes: e.target.value }))} rows={3} className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 outline-none transition focus:border-sky-500 focus:ring-4 focus:ring-sky-100" placeholder="ملاحظات إضافية إن وجدت" /></div>
                  </div>
                  <div className="mt-4 flex flex-wrap items-center gap-3">
                    <button type="button" onClick={handleAddStudent} className="inline-flex items-center gap-2 rounded-2xl bg-emerald-600 px-5 py-3 text-sm font-black text-white shadow-sm transition hover:bg-emerald-700"><Plus className="h-4 w-4" /> إضافة الطالب إلى الفصل</button>
                    <div className="text-sm text-slate-500">صار بالإمكان بعد هذه الخطوة تعديل الطالب ونقله وأرشفته.</div>
                  </div>
                </div>

                <div className="rounded-[1.75rem] border border-sky-200 bg-sky-50 p-5 shadow-sm">
                  <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                    <div>
                      <div className="text-lg font-black text-sky-900">استيراد الطلاب من Excel بصيغة نور</div>
                      <div className="mt-2 text-sm leading-7 text-sky-800">ارفع ملف Excel، ثم راجع المعاينة قبل الاعتماد. في هذه المرحلة نستورد فقط إلى الهيكل المدرسي دون أي ربط تشغيلي مع بقية المنصة.</div>
                    </div>
                    <button type="button" onClick={() => importInputRef.current?.click()} className="inline-flex items-center justify-center gap-2 rounded-2xl bg-sky-700 px-5 py-3 text-sm font-black text-white shadow-sm transition hover:bg-sky-800">
                      <Upload className="h-4 w-4" />
                      اختيار ملف Excel
                    </button>
                    <input ref={importInputRef} type="file" accept=".xlsx,.xls,.csv,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-excel,text/csv" className="hidden" onChange={handleImportFile} />
                  </div>
                  <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-2">
                    <Select label="الفصل الهدف للاستيراد" value={importTargetClassroomId} onChange={(e) => setImportTargetClassroomId(String(e.target.value))}>
                      {normalizedSavedClassrooms.map((classroom) => <option key={classroom.id} value={classroom.id}>{classroom.name}</option>)}
                    </Select>
                    <div className="rounded-2xl bg-white p-4 ring-1 ring-sky-200">
                      <div className="text-sm text-slate-500">الملف المحدد</div>
                      <div className="mt-1 text-base font-black text-slate-900">{importFileName || "لم يتم اختيار ملف بعد"}</div>
                      <div className="mt-2 text-xs text-slate-500">الأعمدة المدعومة الآن: اسم الطالب، رقم الهوية/الإقامة، رقم الجوال.</div>
                    </div>
                  </div>
                  {importMessage ? <div className="mt-4 rounded-2xl bg-white px-4 py-3 text-sm font-bold text-sky-900 ring-1 ring-sky-200">{importMessage}</div> : null}
                  {importSummary ? (
                    <div className="mt-4 grid grid-cols-2 gap-3 md:grid-cols-5">
                      <div className="rounded-2xl bg-white p-4 ring-1 ring-sky-200"><div className="text-xs text-slate-500">إجمالي السجلات</div><div className="mt-1 text-2xl font-black text-slate-900">{importSummary.total}</div></div>
                      <div className="rounded-2xl bg-white p-4 ring-1 ring-emerald-200"><div className="text-xs text-slate-500">الصالحة للاعتماد</div><div className="mt-1 text-2xl font-black text-emerald-700">{importSummary.accepted}</div></div>
                      <div className="rounded-2xl bg-white p-4 ring-1 ring-amber-200"><div className="text-xs text-slate-500">مكررة داخل الملف</div><div className="mt-1 text-2xl font-black text-amber-700">{importSummary.duplicateInFile}</div></div>
                      <div className="rounded-2xl bg-white p-4 ring-1 ring-rose-200"><div className="text-xs text-slate-500">مكررة داخل الفصل</div><div className="mt-1 text-2xl font-black text-rose-700">{importSummary.duplicateInClassroom}</div></div>
                      <div className="rounded-2xl bg-white p-4 ring-1 ring-slate-200"><div className="text-xs text-slate-500">الأخطاء</div><div className="mt-1 text-2xl font-black text-slate-900">{importSummary.errors?.length || 0}</div></div>
                    </div>
                  ) : null}
                  {importSummary?.errors?.length ? (
                    <div className="mt-4 rounded-2xl bg-amber-50 p-4 text-sm text-amber-900 ring-1 ring-amber-200">
                      <div className="font-black">ملاحظات القراءة</div>
                      <ul className="mt-2 list-disc space-y-1 pr-5">
                        {importSummary.errors.slice(0, 6).map((error, index) => <li key={`${error}-${index}`}>{error}</li>)}
                      </ul>
                    </div>
                  ) : null}
                  <div className="mt-4 overflow-hidden rounded-[1.5rem] border border-sky-200 bg-white">
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-slate-200 text-right text-sm">
                        <thead className="bg-sky-50 text-slate-700">
                          <tr>
                            <th className="px-4 py-3 font-black">#</th>
                            <th className="px-4 py-3 font-black">اسم الطالب</th>
                            <th className="px-4 py-3 font-black">رقم الهوية / الإقامة</th>
                            <th className="px-4 py-3 font-black">رقم الجوال</th>
                            <th className="px-4 py-3 font-black">الحالة</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {importPreviewRows.length === 0 ? (
                            <tr><td colSpan={5} className="px-4 py-8 text-center font-bold text-slate-400">لا توجد معاينة بعد. اختر ملف Excel أولًا.</td></tr>
                          ) : importPreviewRows.slice(0, 20).map((row, index) => {
                            const statusText = row.duplicateInClassroom ? "مكرر داخل الفصل" : row.duplicateInFile ? "مكرر داخل الملف" : "جاهز للاستيراد";
                            const statusClass = row.duplicateInClassroom ? "text-rose-700" : row.duplicateInFile ? "text-amber-700" : "text-emerald-700";
                            return (
                              <tr key={`${row.rowNumber}-${row.fullName}-${index}`}>
                                <td className="px-4 py-3">{row.rowNumber}</td>
                                <td className="px-4 py-3 font-bold text-slate-900">{row.fullName}</td>
                                <td className="px-4 py-3">{row.identityNumber || "—"}</td>
                                <td className="px-4 py-3">{row.guardianMobile || "—"}</td>
                                <td className={`px-4 py-3 font-black ${statusClass}`}>{statusText}</td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>
                  <div className="mt-4 flex flex-wrap items-center gap-3">
                    <button type="button" onClick={handleCommitImport} className="inline-flex items-center gap-2 rounded-2xl bg-emerald-600 px-5 py-3 text-sm font-black text-white shadow-sm transition hover:bg-emerald-700">
                      <Upload className="h-4 w-4" />
                      اعتماد الاستيراد إلى الفصل
                    </button>
                    <button type="button" onClick={() => { setImportPreviewRows([]); setImportSummary(null); setImportFileName(""); setImportMessage(""); }} className="rounded-2xl bg-white px-5 py-3 text-sm font-black text-slate-700 ring-1 ring-slate-200">مسح المعاينة</button>
                    <div className="text-sm text-slate-500">سيتم تجاوز السجلات المكررة داخل الفصل الحالي تلقائيًا.</div>
                  </div>
                </div>

                {editingStudentId ? (
                  <div className="rounded-[1.75rem] border border-amber-200 bg-amber-50 p-5 shadow-sm">
                    <div className="text-lg font-black text-amber-900">تعديل بيانات الطالب</div>
                    <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-2">
                      <Input label="اسم الطالب" value={editingStudentForm.fullName} onChange={(e) => setEditingStudentForm((prev) => ({ ...prev, fullName: e.target.value }))} />
                      <Input label="اسم ولي الأمر" value={editingStudentForm.guardianName} onChange={(e) => setEditingStudentForm((prev) => ({ ...prev, guardianName: e.target.value }))} />
                      <Input label="رقم جوال ولي الأمر" value={editingStudentForm.guardianMobile} onChange={(e) => setEditingStudentForm((prev) => ({ ...prev, guardianMobile: e.target.value }))} />
                      <Input label="رقم الهوية / الإقامة" value={editingStudentForm.identityNumber} onChange={(e) => setEditingStudentForm((prev) => ({ ...prev, identityNumber: e.target.value }))} />
                      <div className="md:col-span-2"><label className="mb-2 block text-sm font-bold text-slate-700">ملاحظات</label><textarea value={editingStudentForm.notes} onChange={(e) => setEditingStudentForm((prev) => ({ ...prev, notes: e.target.value }))} rows={3} className="w-full rounded-2xl border border-amber-200 bg-white px-4 py-3 text-sm text-slate-800 outline-none transition focus:border-amber-500 focus:ring-4 focus:ring-amber-100" /></div>
                    </div>
                    <div className="mt-4 flex flex-wrap gap-3">
                      <button type="button" onClick={handleSaveStudentEdit} className="inline-flex items-center gap-2 rounded-2xl bg-amber-600 px-5 py-3 text-sm font-black text-white shadow-sm transition hover:bg-amber-700"><Save className="h-4 w-4" /> حفظ التعديل</button>
                      <button type="button" onClick={() => setEditingStudentId(null)} className="rounded-2xl bg-white px-5 py-3 text-sm font-black text-slate-700 ring-1 ring-slate-200">إلغاء</button>
                    </div>
                  </div>
                ) : null}

                {transferStudentId ? (
                  <div className="rounded-[1.75rem] border border-violet-200 bg-violet-50 p-5 shadow-sm">
                    <div className="text-lg font-black text-violet-900">نقل طالب إلى فصل آخر</div>
                    {transferStudent ? (
                      <div className="mt-3 rounded-2xl border border-violet-200 bg-white/80 p-4 text-sm text-violet-900">
                        <div className="font-black">الطالب المحدد للنقل: {transferStudent.fullName || "—"}</div>
                        <div className="mt-1 text-violet-700">ولي الأمر: {transferStudent.guardianName || "—"} · الجوال: {transferStudent.guardianMobile || "—"}</div>
                        <div className="mt-1 text-violet-700">رقم الهوية / الإقامة: {transferStudent.identityNumber || "—"}</div>
                        <div className="mt-1 text-violet-700">الفصل الحالي: {selectedClassroom?.name || "—"}</div>
                      </div>
                    ) : null}
                    <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-2">
                      <Select label="الفصل الهدف" value={transferForm.targetClassroomId} onChange={(e) => setTransferForm((prev) => ({ ...prev, targetClassroomId: e.target.value }))}>
                        <option value="">اختر الفصل الهدف</option>
                        {availableTransferTargets.map((classroom) => <option key={classroom.id} value={classroom.id}>{classroom.name}</option>)}
                      </Select>
                      <Input label="سبب النقل" value={transferForm.reason} onChange={(e) => setTransferForm((prev) => ({ ...prev, reason: e.target.value }))} placeholder="مثال: نقل تنظيمي أو تعديل شعبة" />
                    </div>
                    <div className="mt-4 flex flex-wrap gap-3">
                      <button type="button" onClick={handleTransferStudent} disabled={!transferForm.targetClassroomId} className="inline-flex items-center gap-2 rounded-2xl bg-violet-600 px-5 py-3 text-sm font-black text-white shadow-sm transition enabled:hover:bg-violet-700 disabled:cursor-not-allowed disabled:opacity-50"><ArrowRightLeft className="h-4 w-4" /> تنفيذ النقل</button>
                      <button type="button" onClick={() => setTransferStudentId(null)} className="rounded-2xl bg-white px-5 py-3 text-sm font-black text-slate-700 ring-1 ring-slate-200">إلغاء</button>
                    </div>
                  </div>
                ) : null}
              </div>

              <div className="space-y-6">
                <div className="overflow-hidden rounded-[1.75rem] border border-slate-200 bg-white">
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-slate-200 text-right">
                      <thead className="bg-slate-50 text-sm font-black text-slate-700">
                        <tr><th className="px-4 py-3">الطالب</th><th className="px-4 py-3">ولي الأمر</th><th className="px-4 py-3">الجوال</th><th className="px-4 py-3">رقم الهوية / الإقامة</th><th className="px-4 py-3">الحالة</th><th className="px-4 py-3">الملاحظات</th><th className="px-4 py-3">الإجراءات</th></tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 text-sm text-slate-700">
                        {classroomStudents.length === 0 ? (
                          <tr><td colSpan={7} className="px-4 py-8 text-center font-bold text-slate-400">لا يوجد طلاب مضافون يدويًا داخل هذا الفصل حتى الآن.</td></tr>
                        ) : classroomStudents.map((student) => (
                          <tr key={student.id} className={student.status === "archived" ? "bg-slate-100/80 text-slate-500" : ""}>
                            <td className="px-4 py-3 font-bold text-slate-900">{student.fullName}</td>
                            <td className="px-4 py-3">{student.guardianName || "—"}</td>
                            <td className="px-4 py-3">{student.guardianMobile || "—"}</td>
                            <td className="px-4 py-3">{student.identityNumber || "—"}</td>
                            <td className="px-4 py-3"><Badge tone={student.status === "archived" ? "slate" : "green"}>{student.status === "archived" ? "مؤرشف" : "نشط"}</Badge></td>
                            <td className="px-4 py-3">{student.notes || "—"}</td>
                            <td className="px-4 py-3">
                              <div className="flex flex-wrap gap-2">
                                <button type="button" onClick={() => startEditStudent(student)} disabled={student.status === "archived"} className="rounded-xl bg-amber-50 px-3 py-2 font-bold text-amber-700 disabled:opacity-50"><Pencil className="h-4 w-4" /></button>
                                <button type="button" onClick={() => openTransferStudent(student.id)} disabled={student.status === "archived" || availableTransferTargets.length === 0} className="rounded-xl bg-violet-50 px-3 py-2 font-bold text-violet-700 disabled:opacity-50"><ArrowRightLeft className="h-4 w-4" /></button>
                                <button type="button" onClick={() => handleArchiveStudent(student.id)} disabled={student.status === "archived"} className="rounded-xl bg-rose-50 px-3 py-2 font-bold text-rose-700 disabled:opacity-50"><Archive className="h-4 w-4" /></button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                <div className="rounded-[1.75rem] border border-slate-200 bg-white p-5 shadow-sm">
                  <div className="text-lg font-black text-slate-900">سجل نقل الطلاب</div>
                  <div className="mt-4 space-y-3">
                    {classroomTransferLog.length === 0 ? (
                      <div className="rounded-2xl bg-slate-50 p-4 text-sm font-bold text-slate-500 ring-1 ring-slate-200">لا توجد عمليات نقل مسجلة لهذا الفصل حتى الآن.</div>
                    ) : classroomTransferLog.map((entry) => (
                      <div key={entry.id} className="rounded-2xl bg-slate-50 p-4 ring-1 ring-slate-200">
                        <div className="font-black text-slate-900">{entry.studentName || "طالب"}</div>
                        <div className="mt-1 text-sm text-slate-600">من {entry.fromClassroomName || "—"} إلى {entry.toClassroomName || "—"}</div>
                        <div className="mt-1 text-sm text-slate-500">السبب: {entry.reason || "لم يُذكر"}</div>
                        <div className="mt-1 text-xs text-slate-400">{formatDateTime(entry.createdAt)}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </SectionCard>
      ) : (
        <SectionCard title="صفحة الفصل" icon={Users}><div className="rounded-3xl border border-dashed border-slate-300 bg-slate-50 p-8 text-center text-sm font-bold text-slate-500">ابدأ أولًا بتوليد الفصول الفعلية، ثم اختر فصلًا من القائمة لفتح صفحته المستقلة.</div></SectionCard>
      )

      ) : null}

      {activeStructureTab === "safeguards" ? <>
      <SectionCard title="ضوابط الحماية" icon={ShieldCheck}>
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          {[
            "لا يوجد أي ربط إجباري الآن مع الحضور الذكي.",
            `روابط شاشات العرض المرتبطة بهذا الفصل حاليًا: ${classroomLinkedScreens.length}`,
            `عدد الصفوف المهيأة حاليًا: ${filteredRows.length} — إجمالي الفصول: ${totalClasses}`,
            `الفصول المعتمدة داخل الهيكل المدرسي: ${savedClassroomsCount}`,
          ].map((item) => <div key={item} className="rounded-2xl bg-white p-4 text-sm font-bold text-slate-700 ring-1 ring-slate-200">{item}</div>)}
        </div>
      </SectionCard>
      </> : null}
    </div>
  );
}

function SchoolDashboard({ schools, selectedSchool, setSelectedSchoolId, scanLog, notifications, canSelectSchool = true, executiveReport, currentUser, onCreateGateLink, onDeleteGateLink, onCreateScreenLink, onDeleteScreenLink, onUpdateScreenLink, onNavigate }) {
  const fallbackSchool = selectedSchool || schools[0] || null;
  const scopedSchools = canSelectSchool ? schools : [fallbackSchool].filter(Boolean);
  const totalStudents = scopedSchools.reduce((sum, school) => sum + getUnifiedSchoolStudents(school, { includeArchived: false, preferStructure: true }).length, 0);
  const totalCompanies = scopedSchools.reduce((sum, school) => sum + getUnifiedCompanyRows(school, { preferStructure: true }).length, 0);
  const faceReadyCount = scopedSchools.reduce((sum, school) => sum + getUnifiedSchoolStudents(school, { includeArchived: false, preferStructure: true }).filter((student) => student.faceReady).length, 0);
  const schoolStudents = getUnifiedSchoolStudents(fallbackSchool, { includeArchived: false, preferStructure: true });

  const rankedCompanies = [...getUnifiedCompanyRows(fallbackSchool, { preferStructure: true })].sort((a, b) => b.points - a.points);
  const topStudents = [...schoolStudents].sort((a, b) => b.points - a.points).slice(0, 3);
  const schoolLogs = scanLog.filter((item) => item.schoolId === fallbackSchool?.id && !item.result.includes("فشل"));
  const gateCount = Number(fallbackSchool?.smartLinks?.gates?.length || 0);
  const screenCount = Number(fallbackSchool?.smartLinks?.screens?.length || 0);
  const structureCount = Number(fallbackSchool?.structure?.classrooms?.length || 0);

  const statusPie = [
    { name: "مبكر", value: schoolStudents.filter((item) => item.status === "مبكر").length },
    { name: "في الوقت", value: schoolStudents.filter((item) => item.status === "في الوقت").length },
    { name: "متأخر", value: schoolStudents.filter((item) => item.status === "متأخر").length },
  ].filter((item) => item.value > 0);

  const attendanceTrend = useMemo(() => {
    const grouped = new Map();
    schoolLogs.forEach((log) => {
      const existing = grouped.get(log.isoDate) || { day: log.date, attendance: 0, early: 0 };
      existing.attendance += 1;
      if (log.result.includes("مبكر")) existing.early += 1;
      grouped.set(log.isoDate, existing);
    });
    const rows = [...grouped.entries()].sort((a, b) => a[0].localeCompare(b[0])).slice(-5).map(([, value]) => value);
    return rows.length ? rows : [{ day: "اليوم", attendance: 0, early: 0 }];
  }, [schoolLogs]);

  const companyChart = rankedCompanies.map((company) => ({
    name: company.name,
    points: company.points,
    initiatives: company.initiatives,
  }));
  const liveSummary = executiveReport?.summary || summarizeSchoolLiveState(fallbackSchool, scanLog, []).summary;
  const latestNotifications = notifications.slice(0, 4);
  const quickNavigation = [
    { key: 'attendance', label: 'الحضور الذكي', tone: 'blue' },
    { key: 'students', label: 'الطلاب', tone: 'violet' },
    { key: 'classes', label: 'الفصول', tone: 'amber' },
    { key: 'gates', label: 'البوابات والشاشات', tone: 'green' },
    { key: 'users', label: 'المستخدمون', tone: 'rose' },
    { key: 'settings', label: 'الإعدادات', tone: 'slate' },
  ];
  const readinessWarnings = [
    !structureCount ? { title: 'الفصول غير مهيأة', body: 'أضف الفصول أو استوردها من صفحة الشركات والفصول لظهور البيانات بشكل صحيح.', tone: 'amber' } : null,
    !schoolStudents.length ? { title: 'لا يوجد طلاب', body: 'أضف الطلاب أو استوردهم ثم أعد مراجعة صفحة الطلاب والحضور.', tone: 'rose' } : null,
    !gateCount ? { title: 'لا توجد بوابات', body: 'أنشئ بوابة واحدة على الأقل حتى تعمل شاشة الحضور عند المدخل.', tone: 'amber' } : null,
    !screenCount ? { title: 'لا توجد شاشات', body: 'أضف شاشة عرض واحدة على الأقل لعرض المؤشرات أو لوحة المدرسة.', tone: 'blue' } : null,
    !fallbackSchool?.manager ? { title: 'بيانات المدير ناقصة', body: 'أكمل اسم مدير المدرسة وبياناته من صفحة المدارس أو الإعدادات.', tone: 'amber' } : null,
  ].filter(Boolean);

  if (!fallbackSchool) {
    return (
      <div className="space-y-6">
        <SectionCard title="لوحة التحكم" icon={LayoutDashboard}>
          <div className="rounded-[1.75rem] border border-dashed border-slate-300 bg-slate-50 p-10 text-center">
            <div className="text-xl font-black text-slate-800">لا توجد مدرسة محددة بعد</div>
            <div className="mt-3 text-sm leading-8 text-slate-500">أضف مدرسة من تبويب المدارس ثم عد إلى الصفحة الرئيسية لعرض المؤشرات والتقارير المباشرة.</div>
          </div>
        </SectionCard>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="rounded-[2rem] bg-gradient-to-l from-slate-900 via-sky-800 to-cyan-700 p-6 text-white shadow-lg">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <Badge tone="blue">الرئيسية التنفيذية</Badge>
              <Badge tone="green">{fallbackSchool.city || '—'}</Badge>
              <Badge tone="violet">{currentUser?.role === 'superadmin' ? 'الأدمن العام' : getRoleLabel(currentUser?.role)}</Badge>
            </div>
            <div className="mt-4 text-3xl font-black leading-tight">{fallbackSchool.name || '—'}</div>
            <div className="mt-2 text-sm leading-7 text-white/85">واجهة مختصرة تعرض حالة المدرسة الآن: الحضور، جاهزية الطلاب، الشاشات والبوابات، وأبرز عناصر المتابعة اليومية.</div>
          </div>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 xl:min-w-[440px]">
            <div className="rounded-2xl bg-white/10 p-4 ring-1 ring-white/15"><div className="text-xs text-white/70">الطلاب</div><div className="mt-1 text-2xl font-black">{schoolStudents.length}</div></div>
            <div className="rounded-2xl bg-white/10 p-4 ring-1 ring-white/15"><div className="text-xs text-white/70">الفصول</div><div className="mt-1 text-2xl font-black">{structureCount || totalCompanies}</div></div>
            <div className="rounded-2xl bg-white/10 p-4 ring-1 ring-white/15"><div className="text-xs text-white/70">البوابات</div><div className="mt-1 text-2xl font-black">{gateCount}</div></div>
            <div className="rounded-2xl bg-white/10 p-4 ring-1 ring-white/15"><div className="text-xs text-white/70">الشاشات</div><div className="mt-1 text-2xl font-black">{screenCount}</div></div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard title="إجمالي المدارس" value={canSelectSchool ? schools.length : 1} subtitle={canSelectSchool ? "قابلة لإضافة مدارس جديدة" : "نطاق المدرسة الحالية"} icon={Building2} />
        <StatCard title="الشركات النشطة" value={totalCompanies} subtitle="فصول أو شركات طلابية" icon={Trophy} />
        <StatCard title="الطلاب المسجلون" value={totalStudents} subtitle="مرتبطون بالتقارير والحضور" icon={Users} />
        <StatCard title="جاهزية بصمة الوجه" value={faceReadyCount} subtitle="طالب مفعّل لبصمة الوجه" icon={Camera} />
      </div>

      {Array.isArray(fallbackSchool?.structure?.classrooms) && fallbackSchool.structure.classrooms.length ? <div className="rounded-2xl border border-dashed border-violet-200 bg-violet-50 p-4 text-sm font-bold text-violet-800">المصدر الافتراضي للوحات المدرسة الآن هو <span className="font-black">الهيكل المدرسي</span>.</div> : null}

      <div className="grid grid-cols-2 gap-4 xl:grid-cols-5">
        <SummaryBox label="الحاضرون اليوم" value={liveSummary.presentToday || 0} color="text-emerald-700" />
        <SummaryBox label="نسبة الحضور" value={`${liveSummary.attendanceRate || 0}%`} color="text-sky-700" />
        <SummaryBox label="المكافآت" value={liveSummary.rewardsToday || 0} color="text-emerald-700" />
        <SummaryBox label="الخصومات" value={liveSummary.violationsToday || 0} color="text-rose-700" />
        <SummaryBox label="البرامج" value={liveSummary.programsToday || 0} color="text-violet-700" />
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-4">
        <div className="rounded-3xl bg-white p-5 ring-1 ring-slate-200">
          <div className="flex items-center gap-3"><Building2 className="h-5 w-5 text-sky-700" /><div className="font-extrabold text-slate-800">ملف المدرسة</div></div>
          <div className="mt-4 space-y-3 text-sm text-slate-600">
            <div className="flex items-center justify-between rounded-2xl bg-slate-50 px-4 py-3"><span>الرقم الوزاري</span><span className="font-black text-slate-800">{fallbackSchool.code || '—'}</span></div>
            <div className="flex items-center justify-between rounded-2xl bg-slate-50 px-4 py-3"><span>المدير</span><span className="font-black text-slate-800">{fallbackSchool.manager || '—'}</span></div>
            <div className="flex items-center justify-between rounded-2xl bg-slate-50 px-4 py-3"><span>آخر الحضور</span><span className="font-black text-slate-800">{schoolLogs[0]?.time || 'لا يوجد'}</span></div>
          </div>
        </div>
        <div className="rounded-3xl bg-white p-5 ring-1 ring-slate-200">
          <div className="flex items-center gap-3"><Shield className="h-5 w-5 text-emerald-700" /><div className="font-extrabold text-slate-800">جاهزية التشغيل</div></div>
          <div className="mt-4 grid grid-cols-2 gap-3 text-center">
            <div className="rounded-2xl bg-emerald-50 p-3"><div className="text-xs text-emerald-700">الباركود</div><div className="mt-1 font-black text-emerald-800">جاهز</div></div>
            <div className="rounded-2xl bg-sky-50 p-3"><div className="text-xs text-sky-700">النسخ الاحتياطي</div><div className="mt-1 font-black text-sky-800">يومي</div></div>
            <div className="rounded-2xl bg-violet-50 p-3"><div className="text-xs text-violet-700">الحسابات</div><div className="mt-1 font-black text-violet-800">{(schools || []).length ? 'نشطة' : '—'}</div></div>
            <div className="rounded-2xl bg-amber-50 p-3"><div className="text-xs text-amber-700">الروابط الذكية</div><div className="mt-1 font-black text-amber-800">{gateCount + screenCount}</div></div>
          </div>
        </div>
        <div className="rounded-3xl bg-white p-5 ring-1 ring-slate-200 xl:col-span-2">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3"><ClipboardList className="h-5 w-5 text-slate-700" /><div className="font-extrabold text-slate-800">ملخص سريع</div></div>
            {canSelectSchool ? (
              <select value={fallbackSchool.id} onChange={(e) => setSelectedSchoolId(Number(e.target.value))} className="rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm font-bold outline-none">
                {schools.map((school) => (
                  <option key={school.id} value={school.id}>{school.name}</option>
                ))}
              </select>
            ) : <Badge tone="blue">مدرستي فقط</Badge>}
          </div>
          <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-3">
            <div className="rounded-2xl bg-slate-50 p-4 ring-1 ring-slate-200"><div className="text-sm text-slate-500">أفضل فصل</div><div className="mt-1 font-black text-slate-800">{rankedCompanies[0]?.name || '—'}</div><div className="mt-1 text-xs text-slate-500">{rankedCompanies[0]?.points || 0} نقطة</div></div>
            <div className="rounded-2xl bg-slate-50 p-4 ring-1 ring-slate-200"><div className="text-sm text-slate-500">أفضل طالب</div><div className="mt-1 font-black text-slate-800">{topStudents[0]?.name || '—'}</div><div className="mt-1 text-xs text-slate-500">{topStudents[0]?.points || 0} نقطة</div></div>
            <div className="rounded-2xl bg-slate-50 p-4 ring-1 ring-slate-200"><div className="text-sm text-slate-500">آخر تنبيه</div><div className="mt-1 font-black text-slate-800">{latestNotifications[0]?.title || 'لا يوجد'}</div><div className="mt-1 text-xs text-slate-500">{latestNotifications[0]?.time || '—'}</div></div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-12">
        <div className="xl:col-span-7">
          <SectionCard title="مركز التشغيل السريع" icon={Rocket} action={<Badge tone="green">أسرع وصول</Badge>}>
            <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-6">
              {quickNavigation.map((item) => (
                <button
                  key={item.key}
                  type="button"
                  onClick={() => onNavigate?.(item.key)}
                  className="rounded-2xl bg-slate-50 px-4 py-4 text-right ring-1 ring-slate-200 transition hover:-translate-y-0.5 hover:bg-white hover:shadow-sm"
                >
                  <div className="text-sm font-black text-slate-800">{item.label}</div>
                  <div className="mt-2"><Badge tone={item.tone}>فتح الصفحة</Badge></div>
                </button>
              ))}
            </div>
          </SectionCard>
        </div>
        <div className="xl:col-span-5">
          <SectionCard title="تنبيهات الجاهزية" icon={ShieldAlert} action={<Badge tone={readinessWarnings.length ? "amber" : "green"}>{readinessWarnings.length ? `${readinessWarnings.length} بحاجة مراجعة` : "جاهزة"}</Badge>}>
            <div className="space-y-3">
              {readinessWarnings.length ? readinessWarnings.map((item, index) => (
                <div key={`${item.title}-${index}`} className="rounded-2xl bg-slate-50 p-4 ring-1 ring-slate-200">
                  <div className="flex items-center justify-between gap-3">
                    <div className="font-black text-slate-800">{item.title}</div>
                    <Badge tone={item.tone}>{item.tone === "rose" ? "مرتفع" : item.tone === "amber" ? "متوسط" : "ملاحظة"}</Badge>
                  </div>
                  <div className="mt-2 text-sm leading-7 text-slate-600">{item.body}</div>
                </div>
              )) : <div className="rounded-2xl bg-emerald-50 p-4 text-sm font-bold text-emerald-800 ring-1 ring-emerald-100">البيانات الأساسية متوفرة، ويمكنك متابعة التشغيل اليومي من دون ملاحظات رئيسية.</div>}
            </div>
          </SectionCard>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        <div className="space-y-6 lg:col-span-8">
          <SectionCard title="لوحة المدرسة والمؤشرات المباشرة" icon={BarChart3} action={<Badge tone="blue">مؤشرات مباشرة</Badge>}>
            <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
              <div className="rounded-3xl bg-slate-50 p-4 ring-1 ring-slate-200">
                <div className="mb-3 font-bold text-slate-700">عمليات الحضور المسجلة خلال آخر الأيام</div>
                <div className="h-72">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={attendanceTrend}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="day" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="attendance" radius={[8, 8, 0, 0]} fill="#0ea5e9" />
                      <Bar dataKey="early" radius={[8, 8, 0, 0]} fill="#10b981" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
              <div className="rounded-3xl bg-slate-50 p-4 ring-1 ring-slate-200">
                <div className="mb-3 font-bold text-slate-700">حالة الطلاب الحالية</div>
                <div className="h-72">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={statusPie.length ? statusPie : [{ name: 'لا يوجد', value: 1 }]} dataKey="value" nameKey="name" innerRadius={58} outerRadius={94} paddingAngle={4}>
                        {(statusPie.length ? statusPie : [{ name: 'لا يوجد', value: 1 }]).map((entry, index) => <Cell key={entry.name + index} fill={pieColors[index % pieColors.length]} />)}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>
              <div className="xl:col-span-2 rounded-3xl bg-slate-50 p-4 ring-1 ring-slate-200">
                <div className="mb-3 font-bold text-slate-700">نقاط الشركات والمبادرات</div>
                <div className="h-72">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={companyChart.length ? companyChart : [{ name: 'لا يوجد', points: 0, initiatives: 0 }]}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="points" radius={[8, 8, 0, 0]} fill="#1d4ed8" />
                      <Bar dataKey="initiatives" radius={[8, 8, 0, 0]} fill="#f59e0b" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          </SectionCard>
        </div>

        <div className="space-y-6 lg:col-span-4">
          <SectionCard title="ترتيب الشركات داخل المدرسة" icon={Trophy}>
            <div className="space-y-3">
              {rankedCompanies.length ? rankedCompanies.map((company, index) => (
                <div key={company.id} className="rounded-2xl bg-slate-50 p-4 ring-1 ring-slate-200">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <div className="font-extrabold text-slate-800">{index + 1}. {company.name}</div>
                      <div className="text-sm text-slate-500">الفصل {company.className}</div>
                    </div>
                    <Badge tone={index === 0 ? "green" : index === 1 ? "blue" : "amber"}>{company.points} نقطة</Badge>
                  </div>
                </div>
              )) : <div className="rounded-2xl bg-slate-50 p-4 text-sm text-slate-500 ring-1 ring-slate-200">لا توجد فصول أو شركات لعرض الترتيب بعد.</div>}
            </div>
          </SectionCard>

          <SectionCard title="أعلى الطلاب نقاطًا" icon={QrCode}>
            <div className="space-y-3">
              {topStudents.length ? topStudents.map((student) => {
                return <BarcodeCard key={student.id} student={student} companyName={student.companyName || getStudentGroupingLabel(student, fallbackSchool)} schoolName={fallbackSchool?.name || "—"} />;
              }) : <div className="rounded-2xl bg-slate-50 p-4 text-sm text-slate-500 ring-1 ring-slate-200">لا يوجد طلاب بعد لعرض بطاقة التميز.</div>}
            </div>
          </SectionCard>

          <SectionCard title="آخر التنبيهات" icon={Bell}>
            <div className="space-y-3">
              {latestNotifications.length ? latestNotifications.map((note) => (
                <div key={note.id} className="rounded-2xl bg-slate-50 p-4 ring-1 ring-slate-200">
                  <div className="font-bold text-slate-800">{note.title}</div>
                  <div className="mt-1 text-sm leading-6 text-slate-500">{note.body}</div>
                  <div className="mt-2 text-xs text-slate-400">{note.time}</div>
                </div>
              )) : <div className="rounded-2xl bg-slate-50 p-4 text-sm text-slate-500 ring-1 ring-slate-200">لا توجد تنبيهات حديثة في الوقت الحالي.</div>}
            </div>
          </SectionCard>
        </div>
      </div>
    </div>
  );
}

function SchoolsPage({ schools, selectedSchoolId, setSelectedSchoolId, onAddSchool, onDeleteSchool, onExportSchool }) {
  const [form, setForm] = useState({ name: "", city: "", code: "", manager: "", principalUsername: "", principalEmail: "", principalPassword: "123456" });

  const columns = [
    { key: "name", label: "المدرسة" },
    { key: "city", label: "المدينة" },
    { key: "code", label: "الرقم الوزاري" },
    { key: "manager", label: "المدير" },
    { key: "studentsCount", label: "الطلاب", render: (row) => row.students.length },
    { key: "companiesCount", label: "الشركات", render: (row) => row.companies.length },
    { key: "status", label: "الحالة", render: (row) => <Badge tone="green">{row.status}</Badge> },
    {
      key: "actions",
      label: "الإجراء",
      render: (row) => (
        <div className="flex gap-2">
          <button onClick={() => setSelectedSchoolId(row.id)} className="rounded-xl bg-sky-50 px-3 py-2 font-bold text-sky-700">فتح</button>
          <button onClick={() => onExportSchool(row.id)} className="rounded-xl bg-slate-100 px-3 py-2 font-bold text-slate-700">تصدير</button>
          <button onClick={() => onDeleteSchool(row.id)} className="rounded-xl bg-rose-50 px-3 py-2 font-bold text-rose-700">حذف</button>
        </div>
      ),
    },
  ];

  const activeSchool = schools.find((s) => s.id === selectedSchoolId) || schools[0];


  const submit = (e) => {
    e.preventDefault();
    if (!form.name || !form.city || !form.code || !form.principalUsername || !form.principalEmail || !form.principalPassword) return;
    onAddSchool(form);
    setForm({ name: "", city: "", code: "", manager: "", principalUsername: "", principalEmail: "", principalPassword: "123456" });
  };

  return (
    <div className="space-y-6">
      <SectionCard title="إدارة المدارس" icon={Building2} action={<Badge tone="blue">مركزية متعددة المدارس</Badge>}>
        <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
          <div className="space-y-6 xl:col-span-2">
            <DataTable columns={columns} rows={schools} />
            <form onSubmit={submit} className="rounded-3xl bg-slate-50 p-5 ring-1 ring-slate-200">
              <div className="mb-4 flex items-center gap-2 font-extrabold text-slate-800"><Plus className="h-5 w-5" /> إضافة مدرسة جديدة</div>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <Input label="اسم المدرسة" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="مثال: متوسطة الملك فهد" />
                <Input label="المدينة" value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} placeholder="مثال: الخرج" />
                <Input label="الرقم الوزاري" value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value })} placeholder="مثال: KRJ-014" />
                <Input label="مدير المدرسة" value={form.manager} onChange={(e) => setForm({ ...form, manager: e.target.value })} placeholder="اسم المدير" />
                <Input label="اسم دخول مدير المدرسة" value={form.principalUsername} onChange={(e) => setForm({ ...form, principalUsername: e.target.value.trim().toLowerCase() })} placeholder="مثال: krj014.principal" />
                <Input label="البريد الإلكتروني لمدير المدرسة" value={form.principalEmail} onChange={(e) => setForm({ ...form, principalEmail: e.target.value.trim().toLowerCase() })} placeholder="principal@example.com" />
                <Input label="كلمة المرور الأولية" value={form.principalPassword} onChange={(e) => setForm({ ...form, principalPassword: e.target.value })} placeholder="123456" />
              </div>
              <div className="mt-4 rounded-2xl bg-white p-4 text-sm leading-7 text-slate-600 ring-1 ring-slate-200">
                عند حفظ المدرسة سيتم إنشاء <span className="font-black text-slate-800">مدير المدرسة كأدمن المدرسة</span> مباشرة بهذه البيانات، مع إبقاء حسابات البوابة والمعلم الافتراضية.
              </div>
              <button type="submit" className="mt-4 inline-flex items-center gap-2 rounded-2xl bg-sky-700 px-5 py-3 font-bold text-white"><Plus className="h-4 w-4" /> حفظ المدرسة وإنشاء الأدمن</button>
            </form>
          </div>
          <div className="space-y-4">
            <div className="rounded-3xl bg-slate-50 p-5 ring-1 ring-slate-200">
              <div className="text-sm text-slate-500">المدرسة المحددة</div>
              <div className="mt-2 text-2xl font-extrabold text-slate-800">{activeSchool.name}</div>
              <div className="mt-1 text-slate-500">{activeSchool.city}</div>
              <div className="mt-4 grid grid-cols-2 gap-3 text-center">
                <div className="rounded-2xl bg-white p-3 ring-1 ring-slate-200"><div className="text-2xl font-black">{getUnifiedSchoolStudents(activeSchool, { includeArchived: false, preferStructure: true }).length}</div><div className="text-sm text-slate-500">طالب</div></div>
                <div className="rounded-2xl bg-white p-3 ring-1 ring-slate-200"><div className="text-2xl font-black">{activeSchool.companies.length}</div><div className="text-sm text-slate-500">شركة</div></div>
              </div>
              <div className="mt-4 rounded-2xl bg-white p-4 text-sm leading-7 text-slate-600 ring-1 ring-slate-200">
                عند إضافة مدرسة جديدة، تصبح قابلة مباشرة لإضافة الشركات والطلاب والحضور دون إعادة تشغيل المنصة. كما يتم إنشاء <span className="font-black text-slate-800">حساب مدير المدرسة</span> مرتبطًا بالبريد الإلكتروني ليستفاد منه لاحقًا في الاسترجاع والإشعارات.
              </div>
            </div>
          </div>
        </div>
      </SectionCard>
    </div>
  );
}

function CompaniesPage({ selectedSchool, onAddCompany, onDeleteCompany, onAwardInitiative }) {
  const [form, setForm] = useState({ name: "", className: "", leader: "" });
  const hasStructureCompanies = schoolHasStructureClassrooms(selectedSchool);
  const companyRows = useMemo(() => getUnifiedCompanyRows(selectedSchool, { preferStructure: true }), [selectedSchool]);
  const columns = [
    { key: "name", label: "اسم الشركة" },
    { key: "className", label: "الفصل" },
    { key: "leader", label: "الرائد" },
    { key: "students", label: "الطلاب", render: (row) => row.studentsCount ?? getUnifiedSchoolStudents(selectedSchool, { includeArchived: false, preferStructure: true }).filter((student) => (row.source === 'structure' ? String(student.classroomId || '') === String(row.rawId || row.id) : String(student.companyId || '') === String(row.id))).length },
    { key: "early", label: "الحضور المبكر" },
    { key: "behavior", label: "السلوك", render: (row) => `${row.behavior}%` },
    { key: "initiatives", label: "المبادرات" },
    { key: "points", label: "النقاط", render: (row) => <span className="font-extrabold text-slate-800">{row.points}</span> },
    {
      key: "actions",
      label: "الإجراء",
      render: (row) => (
        <div className="flex gap-2">
          <button onClick={() => onAwardInitiative(row.id)} className="rounded-xl bg-emerald-50 px-3 py-2 font-bold text-emerald-700">+ مبادرة</button>
          <button onClick={() => onDeleteCompany(row.id)} className="rounded-xl bg-rose-50 px-3 py-2 font-bold text-rose-700">حذف</button>
        </div>
      ),
    },
  ];


  const submit = (e) => {
    e.preventDefault();
    if (!form.name || !form.className) return;
    onAddCompany(form);
    setForm({ name: "", className: "", leader: "" });
  };

  return (
    <div className="space-y-6">
      <SectionCard title="الشركات والفصول" icon={Layers3} action={<Badge tone="blue">{selectedSchool?.name || "—"}</Badge>}>
        <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
          <div className="space-y-6 xl:col-span-2">
            <DataTable columns={columns} rows={companyRows} emptyMessage={hasStructureCompanies ? 'الفصول/الشركات تُدار الآن من الهيكل المدرسي.' : 'أضف أول شركة داخل هذه المدرسة'} />
            {hasStructureCompanies ? <div className="rounded-3xl border border-dashed border-sky-200 bg-sky-50 p-5 text-sm leading-7 text-sky-800">يتم الآن اعتماد الفصول والشركات من <span className="font-black">الهيكل المدرسي</span> كمصدر افتراضي. يمكن الإضافة والتعديل من صفحة الهيكل المدرسي للحفاظ على توحيد البيانات.</div> : <form onSubmit={submit} className="rounded-3xl bg-slate-50 p-5 ring-1 ring-slate-200">
              <div className="mb-4 flex items-center gap-2 font-extrabold text-slate-800"><Plus className="h-5 w-5" /> إضافة شركة / فصل جديد</div>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                <Input label="اسم الشركة" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="مثال: شركة الريادة" />
                <Input label="الفصل" value={form.className} onChange={(e) => setForm({ ...form, className: e.target.value })} placeholder="مثال: 1/3" />
                <Input label="رائد الشركة" value={form.leader} onChange={(e) => setForm({ ...form, leader: e.target.value })} placeholder="اسم الرائد" />
              </div>
              <button type="submit" className="mt-4 inline-flex items-center gap-2 rounded-2xl bg-sky-700 px-5 py-3 font-bold text-white"><Plus className="h-4 w-4" /> حفظ الشركة</button>
            </form>}
          </div>
          <div className="space-y-4">
            <div className="rounded-3xl bg-slate-50 p-5 ring-1 ring-slate-200">
              <div className="font-bold text-slate-800">ربط نقاط الشركات</div>
              <div className="mt-4 space-y-3 text-sm text-slate-600">
                <div className="rounded-2xl bg-white p-4 ring-1 ring-slate-200">الحضور المبكر والالتزام في البوابة ينعكس مباشرة على نقاط الشركة.</div>
                <div className="rounded-2xl bg-white p-4 ring-1 ring-slate-200">زر <span className="font-bold text-emerald-700">+ مبادرة</span> يضيف مبادرة معتمدة ويرفع رصيد الشركة تلقائيًا.</div>
              </div>
            </div>
          </div>
        </div>
      </SectionCard>
    </div>
  );
}

function ClassesPage({ selectedSchool }) {
  const classRows = useMemo(() => getUnifiedCompanyRows(selectedSchool, { preferStructure: true }), [selectedSchool]);
  const [selectedClassId, setSelectedClassId] = useState(String(classRows[0]?.rawId || classRows[0]?.id || ''));
  const [classSearch, setClassSearch] = useState("");

  useEffect(() => {
    setSelectedClassId(String(classRows[0]?.rawId || classRows[0]?.id || ''));
  }, [selectedSchool?.id, classRows.length]);

  const filteredClassRows = useMemo(() => {
    const query = normalizeSearchToken(classSearch);
    if (!query) return classRows;
    return classRows.filter((row) => [row.name, row.className, row.leader, row.teacherName].some((value) => normalizeSearchToken(String(value || '')).includes(query)));
  }, [classRows, classSearch]);

  const selectedClass = filteredClassRows.find((row) => String(row.rawId || row.id) === String(selectedClassId)) || filteredClassRows[0] || classRows[0] || null;
  const students = useMemo(() => {
    const allStudents = getUnifiedSchoolStudents(selectedSchool, { includeArchived: false, preferStructure: true });
    if (!selectedClass) return [];
    return allStudents.filter((student) => {
      if (selectedClass.source === 'structure') return String(student.classroomId || '') === String(selectedClass.rawId || selectedClass.id);
      return String(student.companyId || '') === String(selectedClass.id);
    });
  }, [selectedSchool, selectedClass]);

  const studentColumns = [
    { key: 'name', label: 'اسم الطالب' },
    { key: 'studentNumber', label: 'رقم الطالب' },
    { key: 'grade', label: 'الصف' },
    { key: 'nationalId', label: 'الهوية' },
    { key: 'barcode', label: 'الباركود' },
    { key: 'points', label: 'النقاط' },
  ];

  const exportExcel = () => {
    if (!selectedClass) return;
    exportRowsToWorkbook(`class-${selectedClass.className || selectedClass.name || 'students'}.xlsx`, 'ClassStudents', students, studentColumns);
  };

  const exportCsv = () => {
    if (!selectedClass) return;
    downloadTextFile(`class-${selectedClass.className || selectedClass.name || 'students'}.csv`, buildCsv(students, studentColumns), 'text/csv;charset=utf-8;');
  };

  const printClassSheet = () => {
    if (!selectedClass) return;
    const rowsHtml = students.map((student, index) => `
      <tr>
        <td>${index + 1}</td>
        <td>${student.name || '—'}</td>
        <td>${student.studentNumber || student.id || '—'}</td>
        <td>${student.grade || '—'}</td>
        <td>${student.nationalId || '—'}</td>
        <td>${student.points || 0}</td>
      </tr>`).join('');
    printHtmlContent(`كشف فصل ${selectedClass.className || selectedClass.name || ''}`, `
      <h1>كشف الفصل</h1>
      <div class="meta">${selectedSchool?.name || '—'} — ${selectedClass.className || selectedClass.name || '—'} — ${selectedClass.name || '—'}</div>
      <table>
        <thead><tr><th>#</th><th>الاسم</th><th>رقم الطالب</th><th>الصف</th><th>الهوية</th><th>النقاط</th></tr></thead>
        <tbody>${rowsHtml || '<tr><td colspan="6">لا يوجد طلاب داخل هذا الفصل.</td></tr>'}</tbody>
      </table>
    `);
  };

  const topStudent = students.slice().sort((a, b) => Number(b.points || 0) - Number(a.points || 0))[0] || null;

  if (!classRows.length) {
    return (
      <div className="space-y-6">
        <SectionCard title="الفصول" icon={BookOpen} action={<Badge tone="blue">{selectedSchool?.name || "—"}</Badge>}>
          <div className="rounded-[1.75rem] border border-dashed border-slate-300 bg-slate-50 p-10 text-center">
            <div className="text-xl font-black text-slate-800">لا توجد فصول مهيأة بعد</div>
            <div className="mt-3 text-sm leading-8 text-slate-500">أضف الفصول من صفحة الهيكل المدرسي أو الشركات والفصول، ثم عد هنا لعرض كشف الفصل والطباعة والتصدير.</div>
          </div>
        </SectionCard>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <SectionCard title="الفصول" icon={BookOpen} action={<Badge tone="blue">{selectedSchool?.name || "—"}</Badge>}>
        <div className="space-y-5">
          <div className="grid grid-cols-1 gap-4 xl:grid-cols-[320px,1fr]">
            <div className="rounded-3xl bg-slate-50 p-5 ring-1 ring-slate-200">
              <div className="relative mb-4">
                <Search className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input value={classSearch} onChange={(e) => setClassSearch(e.target.value)} placeholder="ابحث باسم الفصل أو الشركة أو الرائد" className="w-full rounded-2xl border border-slate-200 bg-white py-3 pr-10 pl-4 text-sm outline-none" />
              </div>
              <Select label="اختر الفصل" value={selectedClassId} onChange={(e) => setSelectedClassId(e.target.value)}>
                {filteredClassRows.map((row) => <option key={row.rawId || row.id} value={row.rawId || row.id}>{row.className ? `${row.className} — ${row.name}` : row.name}</option>)}
              </Select>
              <div className="mt-3 text-xs text-slate-500">يمكنك الآن الوصول للفصل مباشرة بدل التنقل بين صفحات متعددة.</div>
              <div className="mt-4 flex flex-wrap gap-2">
                <button type="button" onClick={printClassSheet} className="inline-flex items-center gap-2 rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm font-black text-slate-700"><Printer className="h-4 w-4" /> طباعة الفصل</button>
                <button type="button" onClick={exportExcel} className="inline-flex items-center gap-2 rounded-2xl bg-emerald-600 px-4 py-3 text-sm font-black text-white"><Download className="h-4 w-4" /> Excel</button>
                <button type="button" onClick={exportCsv} className="inline-flex items-center gap-2 rounded-2xl bg-sky-700 px-4 py-3 text-sm font-black text-white"><Download className="h-4 w-4" /> CSV</button>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-5">
              <div className="rounded-3xl bg-slate-50 p-5 ring-1 ring-slate-200"><div className="text-sm text-slate-500">اسم الفصل</div><div className="mt-2 text-xl font-black text-slate-900">{selectedClass?.className || '—'}</div></div>
              <div className="rounded-3xl bg-slate-50 p-5 ring-1 ring-slate-200"><div className="text-sm text-slate-500">اسم الشركة</div><div className="mt-2 text-xl font-black text-slate-900">{selectedClass?.name || '—'}</div></div>
              <div className="rounded-3xl bg-slate-50 p-5 ring-1 ring-slate-200"><div className="text-sm text-slate-500">رائد الفصل</div><div className="mt-2 text-xl font-black text-slate-900">{selectedClass?.leader || selectedClass?.teacherName || '—'}</div></div>
              <div className="rounded-3xl bg-slate-50 p-5 ring-1 ring-slate-200"><div className="text-sm text-slate-500">عدد الطلاب</div><div className="mt-2 text-xl font-black text-slate-900">{students.length}</div></div>
              <div className="rounded-3xl bg-slate-50 p-5 ring-1 ring-slate-200"><div className="text-sm text-slate-500">إجمالي النقاط</div><div className="mt-2 text-xl font-black text-slate-900">{students.reduce((sum, item) => sum + safeNumber(item.points), 0)}</div></div>
              <div className="rounded-3xl bg-slate-50 p-5 ring-1 ring-slate-200"><div className="text-sm text-slate-500">المتصدر</div><div className="mt-2 text-lg font-black text-slate-900">{topStudent?.name || '—'}</div><div className="mt-1 text-xs text-slate-500">{topStudent ? `${topStudent.points || 0} نقطة` : 'لا يوجد'}</div></div>
            </div>
          </div>

          <SectionCard title="طلاب الفصل" icon={Users}>
            <DataTable columns={studentColumns} rows={students} emptyMessage="لا يوجد طلاب داخل الفصل المحدد." />
          </SectionCard>
        </div>
      </SectionCard>
    </div>
  );
}

function StudentsPage({ selectedSchool, onAddStudent, onDeleteStudent, onAwardBehavior, onEnrollFace, onEnrollFaceDataUrl, onClearFace, onDownloadStudentCard, onDownloadAllCards }) {
  const [activeTab, setActiveTab] = useState('pick');
  const [search, setSearch] = useState("");
  const unifiedStudents = useMemo(() => getUnifiedSchoolStudents(selectedSchool, { includeArchived: false, preferStructure: true }), [selectedSchool]);
  const unifiedCompanies = useMemo(() => getUnifiedCompanyRows(selectedSchool, { preferStructure: true }), [selectedSchool]);
  const structureDefault = schoolHasStructureClassrooms(selectedSchool);
  const hasStructureCompanies = unifiedCompanies.some((company) => company.source === 'structure');
  const [selectedStudentId, setSelectedStudentId] = useState(unifiedStudents[0]?.id || null);
  const [selectedGroupId, setSelectedGroupId] = useState('all');
  const [form, setForm] = useState({
    name: "",
    nationalId: "",
    grade: "",
    companyId: String(unifiedCompanies[0]?.rawId || unifiedCompanies[0]?.id || ""),
    faceReady: false,
  });
  const [faceBusy, setFaceBusy] = useState(false);

  useEffect(() => {
    setForm((prev) => ({ ...prev, companyId: String(unifiedCompanies[0]?.rawId || unifiedCompanies[0]?.id || "") }));
    setSelectedStudentId(getUnifiedSchoolStudents(selectedSchool, { includeArchived: false, preferStructure: true })[0]?.id || null);
    setSelectedGroupId('all');
    setActiveTab('pick');
  }, [selectedSchool]);

  const students = useMemo(
    () => {
      const normalizedSearch = normalizeSearchToken(search);
      const lowerSearch = String(search || '').toLowerCase().trim();
      return unifiedStudents.filter((student) => {
        const studentGroupId = String(student.source === 'structure' ? (student.classroomId || '') : (student.companyId || ''));
        if (selectedGroupId !== 'all' && studentGroupId !== String(selectedGroupId)) return false;
        const values = [student.name, student.fullName, student.barcode, student.nationalId, student.guardianMobile, student.studentNumber, student.className, student.companyName, student.rawId, student.id];
        return values.some((value) => {
          const text = String(value || '');
          return text.includes(search)
            || normalizeSearchToken(text) === normalizedSearch
            || normalizeSearchToken(text).includes(normalizedSearch)
            || text.toLowerCase().includes(lowerSearch);
        });
      });
    },
    [unifiedStudents, search, selectedGroupId],
  );

  const featuredStudent = unifiedStudents.find((student) => String(student.id) === String(selectedStudentId)) || students[0] || unifiedStudents[0];
  const featuredCompany = unifiedCompanies.find((company) => (featuredStudent?.source === 'structure' ? String(company.rawId || company.id) === String(featuredStudent.classroomId) : String(company.id) === String(featuredStudent?.companyId)));
  const selectedGroup = unifiedCompanies.find((company) => String(company.rawId || company.id) === String(selectedGroupId) || String(company.id) === String(selectedGroupId));

  const handleFaceFile = async (event) => {
    const file = event.target.files?.[0];
    if (!file || !featuredStudent) return;
    setFaceBusy(true);
    try {
      await onEnrollFace(featuredStudent.id, file);
    } finally {
      setFaceBusy(false);
      event.target.value = "";
    }
  };

  const handleFaceCameraCapture = async (dataUrl) => {
    if (!featuredStudent) return;
    setFaceBusy(true);
    try {
      await onEnrollFaceDataUrl(featuredStudent.id, dataUrl);
    } finally {
      setFaceBusy(false);
    }
  };


  const exportColumns = [
    { key: "name", label: "اسم الطالب" },
    { key: "studentNumber", label: "رقم الطالب" },
    { key: "grade", label: "الصف" },
    { key: "grouping", label: "الفصل", render: (row) => getStudentGroupingLabel(row, selectedSchool) },
    { key: "barcode", label: "الباركود" },
    { key: "attendanceRate", label: "الحضور", render: (row) => `${safeNumber(row.attendanceRate)}%` },
    { key: "points", label: "النقاط" },
    { key: "face", label: "بصمة الوجه", render: (row) => getFaceProfileLabel(row) },
  ];

  const exportStudentsExcel = () => {
    exportRowsToWorkbook(
      `${selectedSchool?.code || 'school'}-students.xlsx`,
      'Students',
      students,
      exportColumns,
    );
  };

  const exportStudentsCsv = () => {
    downloadFile(
      `${selectedSchool?.code || 'school'}-students.csv`,
      buildCsv(students, exportColumns),
      'text/csv;charset=utf-8;',
    );
  };

  const printCurrentBarcode = async () => {
    if (!featuredStudent) return;
    const qrDataUrl = await generateQrDataUrl(featuredStudent.barcode || featuredStudent.studentNumber || featuredStudent.id, 220);
    printHtmlContent(
      `بطاقة الطالب - ${featuredStudent.name}`,
      `
      <div style="max-width:760px;margin:0 auto">
        <h1>بطاقة باركود الطالب</h1>
        <div class="meta">${selectedSchool?.name || "—"} — ${getStudentGroupingLabel(featuredStudent, selectedSchool)}</div>
        <div style="display:grid;grid-template-columns:280px 1fr;gap:20px;align-items:center;border:1px solid #e2e8f0;border-radius:24px;padding:24px">
          <div style="text-align:center">
            <img src="${qrDataUrl}" alt="QR" style="width:220px;height:220px;object-fit:contain" />
            <div style="margin-top:10px;font-family:monospace;font-size:15px">${featuredStudent.barcode || '—'}</div>
          </div>
          <div>
            <div style="font-size:28px;font-weight:800;color:#0f172a">${featuredStudent.name}</div>
            <div style="margin-top:12px;color:#475569;font-size:15px">رقم الطالب: ${featuredStudent.studentNumber || featuredStudent.id}</div>
            <div style="margin-top:8px;color:#475569;font-size:15px">الصف: ${featuredStudent.grade || '—'}</div>
            <div style="margin-top:8px;color:#475569;font-size:15px">الفصل: ${getStudentGroupingLabel(featuredStudent, selectedSchool)}</div>
            <div style="margin-top:8px;color:#475569;font-size:15px">الهوية: ${featuredStudent.nationalId || '—'}</div>
          </div>
        </div>
      </div>
      `,
    );
  };

  const columns = [
    { key: "name", label: "اسم الطالب" },
    { key: "studentNumber", label: "رقم الطالب" },
    { key: "grade", label: "الصف" },
    { key: "companyId", label: "الشركة", render: (row) => row.companyName || row.className || unifiedCompanies.find((company) => String(company.id) === String(row.companyId) || String(company.rawId || '') === String(row.companyId))?.name || "—" },
    { key: "barcode", label: "QR" },
    { key: "attendanceRate", label: "الحضور", render: (row) => `${row.attendanceRate}%` },
    { key: "points", label: "النقاط" },
    { key: "faceReady", label: "بصمة الوجه", render: (row) => <Badge tone={getFaceProfileTone(row)}>{getFaceProfileLabel(row)}</Badge> },
    {
      key: "actions",
      label: "الإجراء",
      render: (row) => (
        <div className="flex flex-wrap gap-2">
          <button onClick={() => setSelectedStudentId(row.id)} className="rounded-xl bg-sky-50 px-3 py-2 font-bold text-sky-700">بطاقة</button>
          {row.source === 'structure' ? <span className="rounded-xl bg-slate-100 px-3 py-2 text-xs font-bold text-slate-600">إدارة الطالب من الهيكل المدرسي</span> : <>
          <button onClick={() => onAwardBehavior(row.id)} className="rounded-xl bg-amber-50 px-3 py-2 font-bold text-amber-700">+ سلوك</button>
          <button onClick={() => onDeleteStudent(row.id)} className="rounded-xl bg-rose-50 px-3 py-2 font-bold text-rose-700">حذف</button>
          </>}
        </div>
      ),
    },
  ];


  const submit = (e) => {
    e.preventDefault();
    if (structureDefault) return;
    if (!form.name || !form.grade || !form.companyId) return;
    onAddStudent({ ...form, companyId: Number(form.companyId) });
    setForm({ name: "", nationalId: "", grade: "", companyId: String(unifiedCompanies[0]?.rawId || unifiedCompanies[0]?.id || ""), faceReady: false });
  };

  return (
    <div className="space-y-6">
      <SectionCard title="إدارة الطلاب والبطاقات" icon={GraduationCap} action={<Badge tone="blue">{selectedSchool?.name || "—"}</Badge>}>
        <div className="space-y-5">
          <div className="grid grid-cols-1 gap-3 lg:grid-cols-[1fr_auto] lg:items-end">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-[260px_1fr]">
              <Select label="اختيار الصف / الفصل" value={selectedGroupId} onChange={(e) => setSelectedGroupId(e.target.value)}>
                <option value="all">كل الفصول</option>
                {unifiedCompanies.map((company) => <option key={company.id} value={company.rawId || company.id}>{company.className ? `${company.className} — ${company.name}` : company.name}</option>)}
              </Select>
              <div className="relative">
                <Search className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="بحث باسم الطالب أو رقمه أو QR أو الهوية" className="w-full rounded-2xl border border-slate-200 bg-white py-3 pr-9 pl-4 text-sm outline-none" />
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              <button type="button" onClick={exportStudentsExcel} className="inline-flex items-center gap-2 rounded-2xl bg-emerald-600 px-4 py-3 text-sm font-black text-white"><Download className="h-4 w-4" /> تصدير Excel</button>
              <button type="button" onClick={exportStudentsCsv} className="inline-flex items-center gap-2 rounded-2xl bg-sky-700 px-4 py-3 text-sm font-black text-white"><Download className="h-4 w-4" /> تصدير CSV</button>
              <button type="button" onClick={printCurrentBarcode} className="inline-flex items-center gap-2 rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm font-black text-slate-700"><Printer className="h-4 w-4" /> طباعة الباركود</button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
            <div className="rounded-2xl bg-slate-50 p-4 ring-1 ring-slate-200"><div className="text-xs text-slate-500">إجمالي الطلاب</div><div className="mt-1 text-2xl font-black text-slate-900">{unifiedStudents.length}</div></div>
            <div className="rounded-2xl bg-slate-50 p-4 ring-1 ring-slate-200"><div className="text-xs text-slate-500">الظاهرون الآن</div><div className="mt-1 text-2xl font-black text-slate-900">{students.length}</div></div>
            <div className="rounded-2xl bg-slate-50 p-4 ring-1 ring-slate-200"><div className="text-xs text-slate-500">الفصل المختار</div><div className="mt-1 text-sm font-black text-slate-900">{selectedGroup?.name || 'كل الفصول'}</div></div>
            <div className="rounded-2xl bg-slate-50 p-4 ring-1 ring-slate-200"><div className="text-xs text-slate-500">بصمة وجه جاهزة</div><div className="mt-1 text-2xl font-black text-slate-900">{students.filter((item) => getFaceProfileState(item) === 'ready').length}</div></div>
          </div>

          <div className="grid grid-cols-1 gap-2 rounded-2xl bg-slate-100 p-1 md:grid-cols-2">
            {[['pick','اختيار الطالب'], ['bio','البصمة والباركود']].map(([key,label]) => (
              <button key={key} onClick={() => setActiveTab(key)} className={cx('rounded-2xl px-4 py-3 text-sm font-black transition', activeTab === key ? 'bg-white text-sky-700 shadow-sm' : 'text-slate-600')}>{label}</button>
            ))}
          </div>

          {activeTab === 'pick' ? (
            <div className="grid grid-cols-1 gap-6 xl:grid-cols-[420px,1fr]">
              <div className="space-y-4">
                <div className="rounded-[1.75rem] bg-slate-50 p-5 ring-1 ring-slate-200">
                  <div className="text-sm font-bold text-slate-500">اختيار سريع</div>
                  <Select label="اختر الطالب" value={featuredStudent?.id || ''} onChange={(e) => { setSelectedStudentId(e.target.value); }}>
                    {(students.length ? students : unifiedStudents).map((student) => <option key={student.id} value={student.id}>{student.name} — {student.studentNumber || student.rawId || student.id}</option>)}
                  </Select>
                  <div className="mt-3 text-xs text-slate-500">تظهر بيانات الطالب المختار فقط بدل عرض جميع الأسماء في الجدول.</div>
                  <div className="mt-4 grid grid-cols-2 gap-3">
                    <div className="rounded-2xl bg-white p-4 ring-1 ring-slate-200"><div className="text-xs text-slate-500">عدد النتائج</div><div className="mt-1 text-xl font-black text-slate-900">{students.length}</div></div>
                    <div className="rounded-2xl bg-white p-4 ring-1 ring-slate-200"><div className="text-xs text-slate-500">الطالب الحالي</div><div className="mt-1 text-sm font-black text-slate-900">{featuredStudent?.name || '—'}</div></div>
                  </div>
                </div>

                {structureDefault ? <div className="rounded-2xl border border-dashed border-sky-200 bg-sky-50 p-4 text-sm leading-7 text-sky-800">مصدر الطلاب الافتراضي هنا هو <span className="font-black">الهيكل المدرسي</span>. إضافة وحذف ونقل الطلاب يتم من صفحة الهيكل المدرسي لضمان بقاء البيانات موحدة.</div> : null}
                {hasStructureCompanies ? <div className="rounded-3xl border border-dashed border-sky-200 bg-sky-50 p-5 text-sm leading-7 text-sky-800">يتم الآن اعتماد الفصول من <span className="font-black">الهيكل المدرسي</span> كمصدر افتراضي. يمكن الإضافة والتعديل من صفحة الهيكل المدرسي.</div> : null}
              </div>

              <div className="space-y-4">
                {featuredStudent ? (
                  <div className="rounded-[1.75rem] bg-white p-5 ring-1 ring-slate-200">
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                      <div>
                        <div className="text-2xl font-black text-slate-900">{featuredStudent.name}</div>
                        <div className="mt-2 text-sm text-slate-500">رقم الطالب: {featuredStudent.studentNumber || featuredStudent.id}</div>
                        <div className="mt-1 text-sm text-slate-500">الفصل: {getStudentGroupingLabel(featuredStudent, selectedSchool)}</div>
                        <div className="mt-1 text-sm text-slate-500">الهوية: {featuredStudent.nationalId || '—'}</div>
                        <div className="mt-1 text-sm text-slate-500">الباركود: <span className="font-mono">{featuredStudent.barcode || '—'}</span></div>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        <Badge tone="blue">{featuredStudent.points} نقطة</Badge>
                        <Badge tone={getFaceProfileTone(featuredStudent)}>{getFaceProfileLabel(featuredStudent)}</Badge>
                      </div>
                    </div>

                    <div className="mt-5 grid grid-cols-2 gap-3 md:grid-cols-4">
                      <div className="rounded-2xl bg-slate-50 p-4 ring-1 ring-slate-200"><div className="text-xs text-slate-500">الحضور</div><div className="mt-1 text-xl font-black text-slate-900">{featuredStudent.attendanceRate || 0}%</div></div>
                      <div className="rounded-2xl bg-slate-50 p-4 ring-1 ring-slate-200"><div className="text-xs text-slate-500">النقاط</div><div className="mt-1 text-xl font-black text-slate-900">{featuredStudent.points || 0}</div></div>
                      <div className="rounded-2xl bg-slate-50 p-4 ring-1 ring-slate-200"><div className="text-xs text-slate-500">الصف</div><div className="mt-1 text-sm font-black text-slate-900">{featuredStudent.grade || '—'}</div></div>
                      <div className="rounded-2xl bg-slate-50 p-4 ring-1 ring-slate-200"><div className="text-xs text-slate-500">الفصل</div><div className="mt-1 text-sm font-black text-slate-900">{featuredCompany?.name || selectedGroup?.name || '—'}</div></div>
                    </div>

                    <div className="mt-5 flex flex-wrap gap-2">
                      <button type="button" onClick={() => setActiveTab('bio')} className="rounded-2xl bg-sky-700 px-4 py-3 text-sm font-black text-white">فتح البصمة والباركود</button>
                      <button type="button" onClick={() => onDownloadStudentCard(featuredStudent.id)} className="rounded-2xl bg-slate-100 px-4 py-3 text-sm font-bold text-slate-700">تحميل بطاقة الطالب</button>
                      <button type="button" onClick={printCurrentBarcode} className="rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm font-black text-slate-700">طباعة الباركود</button>
                      <button type="button" onClick={() => onAwardBehavior(featuredStudent.id)} className="rounded-2xl bg-amber-50 px-4 py-3 text-sm font-bold text-amber-700">+ سلوك</button>
                      {featuredStudent.source === 'structure' ? null : <button type="button" onClick={() => onDeleteStudent(featuredStudent.id)} className="rounded-2xl bg-rose-50 px-4 py-3 text-sm font-bold text-rose-700">حذف الطالب</button>}
                    </div>
                  </div>
                ) : (
                  <div className="rounded-[1.75rem] border border-dashed border-slate-300 bg-slate-50 p-10 text-center text-sm font-bold text-slate-500">لا يوجد طالب ضمن الفلتر الحالي. اختر فصلًا آخر أو غيّر عبارة البحث.</div>
                )}

                {!structureDefault && !hasStructureCompanies ? <form onSubmit={submit} className="rounded-3xl bg-slate-50 p-5 ring-1 ring-slate-200">
                  <div className="mb-4 flex items-center gap-2 font-extrabold text-slate-800"><Plus className="h-5 w-5" /> إضافة طالب جديد</div>
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <Input label="اسم الطالب" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="الاسم الرباعي" />
                    <Input label="رقم الهوية/الإقامة" value={form.nationalId} onChange={(e) => setForm({ ...form, nationalId: e.target.value })} placeholder="اختياري في النموذج" />
                    <Input label="الصف" value={form.grade} onChange={(e) => setForm({ ...form, grade: e.target.value })} placeholder="مثال: الأول متوسط" />
                    <Select label="الشركة" value={form.companyId} onChange={(e) => setForm({ ...form, companyId: e.target.value })}>
                      {unifiedCompanies.map((company) => <option key={company.id} value={company.rawId || company.id}>{company.className ? `${company.className} – ${company.name}` : company.name}</option>)}
                    </Select>
                  </div>
                  <label className="mt-4 flex cursor-pointer items-center gap-3 rounded-2xl bg-white px-4 py-3 ring-1 ring-slate-200">
                    <input type="checkbox" checked={form.faceReady} onChange={(e) => setForm({ ...form, faceReady: e.target.checked })} />
                    <span className="text-sm font-bold text-slate-700">تفعيل مسار بصمة الوجه لهذا الطالب عند الإنشاء</span>
                  </label>
                  <button type="submit" className="mt-4 inline-flex items-center gap-2 rounded-2xl bg-sky-700 px-5 py-3 font-bold text-white"><Wand2 className="h-4 w-4" /> إنشاء الطالب وتوليد الرقم وQR</button>
                </form> : null}
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1fr,360px]">
              <div className="space-y-4">
                {featuredStudent ? (
                  <BarcodeCard
                    student={featuredStudent}
                    companyName={featuredCompany?.name || "—"}
                    schoolName={selectedSchool?.name || "—"}
                    action={
                      <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
                        <button onClick={() => onDownloadStudentCard(featuredStudent.id)} className="rounded-2xl bg-slate-100 px-4 py-3 text-sm font-bold text-slate-700">تحميل بطاقة الطالب</button>
                        <button onClick={onDownloadAllCards} className="rounded-2xl bg-slate-100 px-4 py-3 text-sm font-bold text-slate-700">بطاقات المدرسة</button>
                      </div>
                    }
                  />
                ) : null}
                {featuredStudent ? (
                  <div className="space-y-4 rounded-3xl bg-slate-50 p-4 ring-1 ring-slate-200">
                    <div>
                      <div className="font-bold text-slate-800">تسجيل بصمة الوجه</div>
                      <div className="mt-2 text-sm leading-7 text-slate-600">اختر الطالب أولًا ثم سجّل له صورة الوجه أو امسحها من نفس التبويب.</div>
                    </div>
                    {featuredStudent.facePhoto ? (
                      <img src={featuredStudent.facePhoto} alt={featuredStudent.name} className="h-44 w-full rounded-2xl object-cover ring-1 ring-slate-200" />
                    ) : (
                      <div className="flex h-44 items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-white text-sm text-slate-500">لا توجد صورة وجه مسجلة بعد</div>
                    )}
                    <div className="flex flex-wrap gap-3">
                      <label className="inline-flex cursor-pointer items-center gap-2 rounded-2xl bg-sky-700 px-4 py-3 text-sm font-bold text-white">
                        <Upload className="h-4 w-4" /> رفع صورة وجه
                        <input type="file" accept="image/*" capture="user" className="hidden" onChange={handleFaceFile} />
                      </label>
                      <button onClick={() => onClearFace(featuredStudent.id)} className="rounded-2xl bg-rose-50 px-4 py-3 text-sm font-bold text-rose-700">حذف البصمة</button>
                    </div>
                    <LiveCameraPanel mode="face" title="التقاط مباشر" description="يمكن أخذ صورة مباشرة من الكاميرا وربطها بالطالب المحدد." onCapture={handleFaceCameraCapture} />
                    {faceBusy ? <div className="rounded-2xl bg-white px-4 py-3 text-sm text-slate-600 ring-1 ring-slate-200">جارٍ حفظ البصمة...</div> : null}
                  </div>
                ) : null}
              </div>
              <div className="space-y-4">
                <div className="rounded-3xl bg-white p-5 ring-1 ring-slate-200">
                  <div className="font-black text-slate-800">لوحة الطالب المحدد</div>
                  <div className="mt-2 text-sm text-slate-500">كل ما يتعلق بالطالب المختار موجود هنا: الباركود، البطاقة، بصمة الوجه، والحالة الحالية.</div>
                  {featuredStudent ? <div className="mt-4 space-y-3 text-sm text-slate-600">
                    <div className="rounded-2xl bg-slate-50 p-4 ring-1 ring-slate-200"><span className="font-bold text-slate-800">الاسم:</span> {featuredStudent.name}</div>
                    <div className="rounded-2xl bg-slate-50 p-4 ring-1 ring-slate-200"><span className="font-bold text-slate-800">رقم الطالب:</span> {featuredStudent.studentNumber || featuredStudent.id}</div>
                    <div className="rounded-2xl bg-slate-50 p-4 ring-1 ring-slate-200"><span className="font-bold text-slate-800">الفصل:</span> {getStudentGroupingLabel(featuredStudent, selectedSchool)}</div>
                    <div className="rounded-2xl bg-slate-50 p-4 ring-1 ring-slate-200"><span className="font-bold text-slate-800">الباركود:</span> <span className="font-mono">{featuredStudent.barcode}</span></div>
                    <div className="flex flex-wrap gap-2">
                      <button onClick={() => onAwardBehavior(featuredStudent.id)} className="rounded-2xl bg-amber-50 px-4 py-3 text-sm font-bold text-amber-700">+ سلوك</button>
                      {featuredStudent.source === 'structure' ? null : <button onClick={() => onDeleteStudent(featuredStudent.id)} className="rounded-2xl bg-rose-50 px-4 py-3 text-sm font-bold text-rose-700">حذف الطالب</button>}
                    </div>
                  </div> : <div className="mt-4 rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-4 py-8 text-center text-sm text-slate-500">اختر طالبًا من التبويب الأول.</div>}
                </div>
              </div>
            </div>
          )}
        </div>
      </SectionCard>
    </div>
  );

}

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

function UsersPage({ users, schools, currentUser, selectedSchoolId, onAddUser, onSelectForEdit, editingUserId, onToggleUserStatus, onDeleteUser, onUpdateSchoolAccess, onOpenAccountSecurity, onOpenResetUserPassword }) {
  const canManageAll = currentUser?.role === "superadmin";
  const scopeSchoolId = canManageAll ? selectedSchoolId : currentUser?.schoolId;
  const scopedSchool = schools.find((school) => school.id === scopeSchoolId) || schools[0] || null;
  const roleOptions = canManageAll ? roles : roles.filter((role) => principalDelegableRoles.includes(role.key));
  const [form, setForm] = useState({
    name: "",
    email: "",
    mobile: "",
    username: "",
    password: "123456",
    role: canManageAll ? "principal" : "teacher",
    schoolId: scopeSchoolId || schools[0]?.id || 1,
    permissions: clampDelegatedPermissions(currentUser, canManageAll ? "principal" : "teacher", buildRolePermissions(canManageAll ? "principal" : "teacher")),
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
    if (!form.name.trim() || !form.username.trim() || !form.password.trim()) {
      window.alert("أكمل الاسم واسم المستخدم وكلمة المرور.");
      return;
    }
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
            <Input label="اسم المستخدم الفعلي" value={form.name} onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))} placeholder="مثال: أ. ناصر الشهراني" />
            <Input label="البريد الإلكتروني" value={form.email} onChange={(e) => setForm((prev) => ({ ...prev, email: e.target.value.trim().toLowerCase() }))} placeholder="name@example.com" />
            <Input label="اسم الدخول" value={form.username} onChange={(e) => setForm((prev) => ({ ...prev, username: e.target.value.trim().toLowerCase() }))} placeholder="مثال: ryd011.teacher2" />
            <Input label="كلمة المرور" value={form.password} onChange={(e) => setForm((prev) => ({ ...prev, password: e.target.value }))} placeholder="123456" />
            <Select label="الدور" value={form.role} onChange={(e) => handleRoleChange(e.target.value)}>
              {roleOptions.map((role) => <option key={role.key} value={role.key}>{role.label}</option>)}
            </Select>
            {form.role !== "superadmin" && (
              <Select label="المدرسة" value={form.schoolId || ""} onChange={(e) => setForm((prev) => ({ ...prev, schoolId: Number(e.target.value) }))} disabled={!canManageAll}>
                {schools.map((school) => <option key={school.id} value={school.id}>{school.name}</option>)}
              </Select>
            )}
            <div className="rounded-2xl bg-slate-50 p-4 text-sm leading-7 text-slate-600 ring-1 ring-slate-200 md:col-span-2">
              {canManageAll ? 'صلاحيات هذا الحساب يمكن تعديلها الآن قبل الحفظ، ويمكنك منحه صلاحيات مثل مدير المدرسة أو الأدمن العام ثم الزيادة أو التقليل يدويًا حسب حاجتك.' : 'مدير المدرسة يمنح فقط الأدوار التشغيلية داخل مدرسته: البوابة والمشرف والمعلم والطالب، ولا يستطيع منح صلاحيات مركزية مثل الإعدادات العامة أو المستخدمين أو الشاشات والبوابات.'}
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

function AccountSecurityModal({ open, currentUser, onClose, onSubmit, loading }) {
  const [form, setForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [error, setError] = useState('');

  useEffect(() => {
    if (!open) {
      setForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
      setError('');
    }
  }, [open]);

  if (!open) return null;

  const submit = async (e) => {
    e.preventDefault();
    if (!form.currentPassword || !form.newPassword || !form.confirmPassword) {
      setError('أكمل جميع الحقول أولاً.');
      return;
    }
    if (form.newPassword.length < 6) {
      setError('كلمة المرور الجديدة يجب ألا تقل عن 6 أحرف.');
      return;
    }
    if (form.newPassword !== form.confirmPassword) {
      setError('تأكيد كلمة المرور الجديدة غير متطابق.');
      return;
    }
    const result = await onSubmit(form);
    if (!result?.ok) setError(result?.message || 'تعذر تحديث كلمة المرور.');
  };

  return (
    <div className="fixed inset-0 z-[90] flex items-center justify-center bg-slate-950/45 p-4">
      <div className="w-full max-w-xl rounded-[2rem] bg-white p-6 shadow-2xl ring-1 ring-slate-200">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="text-sm text-slate-500">أمان الحساب</div>
            <h3 className="mt-1 text-2xl font-black text-slate-900">تغيير كلمة المرور</h3>
            <div className="mt-2 text-sm text-slate-500">الحساب: {currentUser?.name || '—'} • {currentUser?.username || '—'}</div>
          </div>
          <button type="button" onClick={onClose} className="rounded-2xl bg-slate-100 px-4 py-2 text-sm font-bold text-slate-700">إغلاق</button>
        </div>
        <form onSubmit={submit} className="mt-6 space-y-4">
          <Input label="كلمة المرور الحالية" type="password" value={form.currentPassword} onChange={(e) => { setForm((prev) => ({ ...prev, currentPassword: e.target.value })); setError(''); }} />
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <Input label="كلمة المرور الجديدة" type="password" value={form.newPassword} onChange={(e) => { setForm((prev) => ({ ...prev, newPassword: e.target.value })); setError(''); }} />
            <Input label="تأكيد كلمة المرور الجديدة" type="password" value={form.confirmPassword} onChange={(e) => { setForm((prev) => ({ ...prev, confirmPassword: e.target.value })); setError(''); }} />
          </div>
          <div className="rounded-2xl bg-slate-50 p-4 text-sm leading-7 text-slate-600 ring-1 ring-slate-200">
            هذه النافذة متاحة لكل المستخدمين: الأدمن العام، مدير المدرسة، المشرف، المعلم، البوابة، والطالب.
          </div>
          {error ? <div className="rounded-2xl bg-rose-50 px-4 py-3 text-sm font-bold text-rose-700 ring-1 ring-rose-100">{error}</div> : null}
          <div className="flex flex-wrap justify-end gap-3">
            <button type="button" onClick={onClose} className="rounded-2xl bg-slate-100 px-5 py-3 font-bold text-slate-700">إلغاء</button>
            <button type="submit" disabled={loading} className="inline-flex items-center gap-2 rounded-2xl bg-sky-700 px-5 py-3 font-bold text-white disabled:cursor-not-allowed disabled:opacity-60">
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <ShieldCheck className="h-4 w-4" />} حفظ كلمة المرور الجديدة
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}


function ResetUserPasswordModal({ open, targetUser, onClose, onSubmit, loading }) {
  const [form, setForm] = useState({ newPassword: '', confirmPassword: '' });
  const [error, setError] = useState('');

  useEffect(() => {
    if (!open) {
      setForm({ newPassword: '', confirmPassword: '' });
      setError('');
    }
  }, [open, targetUser?.id]);

  if (!open || !targetUser) return null;

  const submit = async (e) => {
    e.preventDefault();
    if (!form.newPassword || !form.confirmPassword) {
      setError('أدخل كلمة المرور الجديدة وتأكيدها.');
      return;
    }
    if (form.newPassword.length < 6) {
      setError('كلمة المرور الجديدة يجب ألا تقل عن 6 أحرف.');
      return;
    }
    if (form.newPassword !== form.confirmPassword) {
      setError('تأكيد كلمة المرور غير متطابق.');
      return;
    }
    const result = await onSubmit({ userId: targetUser.id, newPassword: form.newPassword, confirmPassword: form.confirmPassword });
    if (!result?.ok) setError(result?.message || 'تعذر إعادة تعيين كلمة المرور.');
  };

  return (
    <div className="fixed inset-0 z-[90] flex items-center justify-center bg-slate-950/50 p-4">
      <div className="w-full max-w-xl rounded-[2rem] bg-white p-6 shadow-2xl ring-1 ring-slate-200">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="text-sm text-slate-500">إعادة تعيين كلمة المرور</div>
            <div className="mt-1 text-2xl font-black text-slate-900">{targetUser.name || targetUser.username}</div>
            <div className="mt-2 text-sm text-slate-500">{getRoleLabel(targetUser.role)} • {targetUser.username}</div>
          </div>
          <button onClick={onClose} className="rounded-2xl bg-slate-100 px-3 py-2 text-sm font-bold text-slate-700">إغلاق</button>
        </div>
        <div className="mt-4 rounded-2xl bg-violet-50 p-4 text-sm leading-7 text-violet-900 ring-1 ring-violet-100">
          سيُطلب من المستخدم تسجيل الدخول بكلمة المرور الجديدة بعد إبلاغه بها. استخدم هذا الإجراء فقط عند الحاجة الإدارية.
        </div>
        <form onSubmit={submit} className="mt-5 space-y-4">
          <Input label="كلمة المرور الجديدة" type="password" value={form.newPassword} onChange={(e) => { setForm((prev) => ({ ...prev, newPassword: e.target.value })); setError(''); }} />
          <Input label="تأكيد كلمة المرور الجديدة" type="password" value={form.confirmPassword} onChange={(e) => { setForm((prev) => ({ ...prev, confirmPassword: e.target.value })); setError(''); }} />
          {error ? <div className="rounded-2xl bg-rose-50 px-4 py-3 text-sm font-bold text-rose-700 ring-1 ring-rose-100">{error}</div> : null}
          <div className="flex flex-wrap items-center gap-3 pt-2">
            <button type="submit" disabled={loading} className={`inline-flex items-center gap-2 rounded-2xl px-5 py-3 font-bold text-white ${loading ? 'bg-slate-400' : 'bg-violet-700'}`}>
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <ShieldAlert className="h-4 w-4" />} حفظ كلمة المرور الجديدة
            </button>
            <button type="button" onClick={onClose} className="rounded-2xl bg-slate-100 px-4 py-3 text-sm font-bold text-slate-700">إلغاء</button>
          </div>
        </form>
      </div>
    </div>
  );
}

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

function AttendancePage({ selectedSchool, currentUser, attendanceMethod, setAttendanceMethod, scanLog, actionLog, settings, onScan, onFaceScanFile, onFaceScanDataUrl, onCreateGateLink, onDeleteGateLink, onCreateScreenLink, onDeleteScreenLink, onUpdateScreenLink, onSaveAttendanceBinding }) {
  const [scanValue, setScanValue] = useState("");
  const [filter, setFilter] = useState("all");
  const [faceFile, setFaceFile] = useState(null);
  const [facePreview, setFacePreview] = useState("");
  const [faceBusy, setFaceBusy] = useState(false);
  const hasStructureSource = useMemo(() => schoolHasStructureClassrooms(selectedSchool), [selectedSchool]);
  const attendanceBinding = useMemo(() => getSchoolAttendanceBinding(selectedSchool), [selectedSchool]);
  const attendanceSource = useMemo(() => getAttendanceStudentsSource(selectedSchool), [selectedSchool]);
  const attendanceStudents = attendanceSource.students || [];

  const filteredLog = scanLog
    .filter((item) => item.schoolId === selectedSchool.id)
    .filter((item) => {
      if (filter === "all") return true;
      if (filter === "early") return item.result.includes("مبكر");
      if (filter === "ontime") return item.result.includes("في الوقت");
      if (filter === "late") return item.result.includes("تأخر");
      if (filter === "failed") return item.result.includes("فشل") || item.result.includes("مسبق");
      return true;
    });

  const enrolledFaceCount = attendanceStudents.filter((student) => getFaceProfileState(student) === "ready" || student.faceReady).length;

  const handleSubmit = () => {
    if (!scanValue.trim()) return;
    onScan(scanValue.trim());
    setScanValue("");
  };

  const handleFaceFile = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setFaceFile(file);
    setFacePreview(await fileToDataUrl(file));
    event.target.value = "";
  };


  const verifyFace = async () => {
    if (!faceFile) return null;
    setFaceBusy(true);
    try {
      const result = await onFaceScanFile(faceFile);
      if (result) {
        setFaceFile(null);
        setFacePreview("");
      }
      return result;
    } finally {
      setFaceBusy(false);
    }
  };

  const verifyFaceCamera = async (dataUrl) => {
    setFaceBusy(true);
    try {
      const result = await onFaceScanDataUrl(dataUrl);
      if (result) {
        setFaceFile(null);
        setFacePreview("");
      }
      return result;
    } finally {
      setFaceBusy(false);
    }
  };

  return (
    <div className="space-y-6">
      <SectionCard
        title="الحضور الذكي"
        icon={ScanLine}
        action={
          <div className="flex items-center gap-2 rounded-2xl bg-slate-100 p-1">
            <button onClick={() => setAttendanceMethod("barcode")} className={`rounded-xl px-3 py-2 text-sm font-bold ${attendanceMethod === "barcode" ? "bg-white shadow-sm" : "text-slate-600"}`}>QR</button>
            <button onClick={() => setAttendanceMethod("face")} className={`rounded-xl px-3 py-2 text-sm font-bold ${attendanceMethod === "face" ? "bg-white shadow-sm" : "text-slate-600"}`}>بصمة وجه</button>
          </div>
        }
      >
        <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
          <div className="space-y-6">
            <div className="rounded-3xl bg-white p-5 ring-1 ring-slate-200">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <div className="font-black text-slate-800">مصدر بيانات الحضور</div>
                  <div className="mt-1 text-sm text-slate-500">{hasStructureSource ? 'الهيكل المدرسي هو المصدر الافتراضي للحضور حاليًا، والمصدر القديم مخفي من الواجهة مع بقائه داخليًا كطبقة توافق مؤقتة.' : 'لا يوجد هيكل مدرسي مكتمل بعد، لذا يعمل الحضور على قاعدة المدرسة الأساسية مؤقتًا.'}</div>
                </div>
                <Badge tone={attendanceBinding.sourceMode === 'structure' ? 'violet' : 'blue'}>{attendanceSource.label}</Badge>
              </div>
              <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-3">
                <div className="rounded-2xl bg-violet-50 p-4 ring-1 ring-violet-200">
                  <div className="text-sm font-bold text-violet-800">المصدر المعتمد</div>
                  <div className="mt-2 text-lg font-black text-violet-900">{hasStructureSource ? 'الهيكل المدرسي (افتراضي)' : 'المدرسة الكاملة'}</div>
                  <div className="mt-1 text-xs text-violet-700">{hasStructureSource ? 'سيتم اعتماد طلاب الهيكل المدرسي تلقائيًا في الحضور.' : 'أكمِل بناء الهيكل المدرسي ليصبح هو المصدر الافتراضي.'}</div>
                </div>
                <div>
                  <label className="mb-2 block text-sm font-bold text-slate-700">الفصل المرتبط للحضور</label>
                  <select value={attendanceBinding.linkedClassroomId} disabled={!hasStructureSource} onChange={(e) => onSaveAttendanceBinding?.({ sourceMode: hasStructureSource ? 'structure' : 'school', linkedClassroomId: e.target.value })} className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 disabled:cursor-not-allowed disabled:opacity-60">
                    <option value="">{hasStructureSource ? 'جميع فصول الهيكل المدرسي' : 'لا يوجد هيكل مدرسي بعد'}</option>
                    {(selectedSchool?.structure?.classrooms || []).map((classroom) => <option key={classroom.id} value={String(classroom.id)}>{classroom.name}</option>)}
                  </select>
                </div>
                <div className="rounded-2xl bg-slate-50 p-4 ring-1 ring-slate-200">
                  <div className="text-sm font-bold text-slate-700">الطلاب المتاحون للحضور</div>
                  <div className="mt-2 text-3xl font-black text-slate-900">{attendanceStudents.length}</div>
                  <div className="mt-1 text-xs text-slate-500">{hasStructureSource ? 'من الهيكل المدرسي افتراضيًا' : 'من قاعدة المدرسة الأساسية'}</div>
                </div>
              </div>
            </div>
            <div className="rounded-3xl bg-white p-5 ring-1 ring-slate-200">
              <div className="mb-3 rounded-2xl bg-sky-50 px-4 py-3 text-sm font-bold text-sky-900 ring-1 ring-sky-200">التحضير اليدوي السريع</div>
              <label className="mb-2 block text-sm font-bold text-slate-700">أدخل الاسم أو رقم الطالب أو الهوية أو الجوال ثم اضغط Enter أو زر التسجيل</label>
              <div className="grid grid-cols-1 gap-3 lg:grid-cols-[1fr_auto_auto] lg:items-end">
                <input value={scanValue} onChange={(e) => setScanValue(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter') handleSubmit(); }} placeholder="مثال: أحمد محمد أو 1164421669 أو 9665xxxxxxx" className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none" />
                <button onClick={handleSubmit} className="rounded-2xl bg-sky-700 px-5 py-3 font-bold text-white">تسجيل الحضور</button>
                <button onClick={() => setScanValue('')} className="rounded-2xl bg-slate-100 px-5 py-3 font-bold text-slate-700">مسح</button>
              </div>
            </div>
            <div className="rounded-3xl border border-dashed border-slate-300 bg-slate-50 p-5">
              <div className="mb-4 flex items-center gap-3">
                {attendanceMethod === "barcode" ? <QrCode className="h-6 w-6" /> : <Camera className="h-6 w-6" />}
                <div>
                  <div className="font-bold text-slate-800">{attendanceMethod === "barcode" ? "قارئ QR عند البوابة" : "بوابة بصمة الوجه"}</div>
                  <div className="text-sm text-slate-500">يسجل اليوم والوقت والطريقة ويحدّث نقاط الطالب والشركة فورًا</div>
                </div>
              </div>

              {attendanceMethod === "barcode" ? (
                <div className="space-y-4">
                  <LiveCameraPanel mode="barcode" title="التقاط مباشر لـ QR" description="يمكنك تشغيل كاميرا اللابتوب أو الآيباد أو الجوال وقراءة QR الطالب مباشرة من البوابة." onDetectBarcode={(value) => { setScanValue(value); onScan(value); }} />
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="rounded-2xl bg-white p-4 ring-1 ring-slate-200">
                    <div className="text-sm font-bold text-slate-700">الطلاب المسجلون للوجه</div>
                    <div className="mt-1 text-2xl font-black text-slate-800">{enrolledFaceCount}</div>
                    <div className="mt-1 text-xs text-slate-500">من أصل {attendanceStudents.length} طالب</div>
                  </div>
                  <div className="flex flex-wrap gap-3">
                    <label className="inline-flex cursor-pointer items-center gap-2 rounded-2xl bg-sky-700 px-4 py-3 text-sm font-bold text-white">
                      <Upload className="h-4 w-4" /> رفع صورة / اختيار من الجهاز
                      <input type="file" accept="image/*" capture="user" className="hidden" onChange={handleFaceFile} />
                    </label>
                    <button onClick={verifyFace} disabled={!faceFile || faceBusy} className={cx("rounded-2xl px-4 py-3 text-sm font-bold", !faceFile || faceBusy ? "bg-slate-200 text-slate-500" : "bg-emerald-600 text-white")}>{faceBusy ? "جارٍ التحقق..." : "تحقق من الصورة المرفوعة"}</button>
                  </div>
                  {facePreview ? <img src={facePreview} alt="معاينة الوجه" className="h-56 w-full rounded-2xl object-cover ring-1 ring-slate-200" /> : <div className="flex h-56 items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-white text-sm text-slate-500">ارفع صورة وجه واضحة ليتم التعرف على الطالب</div>}
                  <LiveCameraPanel mode="face" title="مطابقة مباشرة للوجه" description="افتح الكاميرا وسيجري التحقق تلقائيًا مباشرة من اللابتوب أو الآيباد أو الجوال دون الحاجة إلى ضغط زر التصوير. وزر الالتقاط موجود فقط كخيار احتياطي." onDetectFace={verifyFaceCamera} onCapture={verifyFaceCamera} />
                  <div className="text-xs leading-6 text-slate-500">التحقق هنا محلي وتجريبي داخل المتصفح، ومناسب كبداية قبل ربط خوارزمية أو مزود تعرّف احترافي.</div>
                </div>
              )}
            </div>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <MetricTile label="نهاية الحضور المبكر" value={settings.policy.earlyEnd} />
              <MetricTile label="نهاية الحضور في الوقت" value={settings.policy.onTimeEnd} />
              <MetricTile label="منع التكرار" value={settings.devices.duplicateScanBlocked ? "مفعل" : "غير مفعل"} />
              <MetricTile label="جاهزية الوجه" value={settings.devices.faceEnabled ? "مفعل" : "مغلق"} />
            </div>
          </div>
          <div className="overflow-hidden rounded-3xl bg-white ring-1 ring-slate-200">
            <div className="flex items-center justify-between gap-3 border-b border-slate-100 px-4 py-3">
              <div className="font-bold text-slate-700">سجل عمليات البوابة</div>
              <div className="flex items-center gap-2">
                <select value={filter} onChange={(e) => setFilter(e.target.value)} className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm">
                  <option value="all">الكل</option>
                  <option value="early">مبكر</option>
                  <option value="ontime">في الوقت</option>
                  <option value="late">متأخر</option>
                  <option value="failed">مرفوض / فشل</option>
                </select>
              </div>
            </div>
            <div className="max-h-[540px] overflow-auto divide-y divide-slate-100">
              {filteredLog.map((item) => (
                <div key={item.id} className="flex items-start justify-between gap-4 px-4 py-3">
                  <div>
                    <div className="font-bold text-slate-800">{item.student}</div>
                    <div className="text-sm text-slate-500">{item.method} • {item.date} • {item.time}</div>
                    <div className="font-mono text-xs text-slate-400">{item.barcode}</div>
                  </div>
                  <div className="space-y-2 text-left">
                    <Badge tone={resultTone(item.result)}>{item.result}</Badge>
                    {!item.result.includes("فشل") && !item.result.includes("مسبق") ? <div className="text-xs font-bold text-emerald-700">{item.deltaPoints > 0 ? `+${item.deltaPoints}` : item.deltaPoints} نقطة</div> : null}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </SectionCard>

    </div>
  );
}

function StudentActionsPage({ selectedSchool, currentUser, settings, actionLog, onResolveStudentByBarcode, onResolveStudentByManual, onResolveStudentByFaceFile, onResolveStudentByFaceDataUrl, onApplyStudentAction, onRecordProgramAction }) {
  const compactMode = currentUser?.role === "teacher";
  if (!selectedSchool) {
    return (
      <SectionCard title="صفحة المعلم" icon={UserCircle2}>
        <div className="rounded-3xl border border-amber-200 bg-amber-50 p-6 text-center text-sm font-bold text-amber-800">لم يتم تحديد مدرسة لهذا الحساب بعد. راجع إعدادات المستخدم أو أعد تسجيل الدخول.</div>
      </SectionCard>
    );
  }
  const [identifyMethod, setIdentifyMethod] = useState("barcode");
  const [query, setQuery] = useState("");
  const [actionType, setActionType] = useState("reward");
  const [definitionId, setDefinitionId] = useState(settings.actions?.rewards?.[0]?.id || "");
  const [note, setNote] = useState("");
  const [faceFile, setFaceFile] = useState(null);
  const [facePreview, setFacePreview] = useState("");
  const [identifiedStudent, setIdentifiedStudent] = useState(null);
  const [busy, setBusy] = useState(false);
  const [statusMessage, setStatusMessage] = useState("");
  const [teacherFastMode, setTeacherFastMode] = useState(true);
  const [teacherView, setTeacherView] = useState("home");
  const [lastExecution, setLastExecution] = useState(null);
  const [scanSessionKey, setScanSessionKey] = useState(0);
  const [programTargetType, setProgramTargetType] = useState("school");
  const [programTargetLabel, setProgramTargetLabel] = useState("");
  const [programTargetCount, setProgramTargetCount] = useState("1");
  const programCompanies = getUnifiedCompanyRows(selectedSchool, { preferStructure: true });
  const [programCompanyId, setProgramCompanyId] = useState(String(programCompanies[0]?.rawId || programCompanies[0]?.id || ""));
  const [programStudentQuery, setProgramStudentQuery] = useState("");
  const [programStudent, setProgramStudent] = useState(null);
  const [programTitle, setProgramTitle] = useState("");
  const [programEvidenceFiles, setProgramEvidenceFiles] = useState([]);
  const [programEvidencePreviews, setProgramEvidencePreviews] = useState([]);

  const actionModes = [
    { key: "reward", label: "مكافأة", icon: Trophy, tone: "green", description: "الحضور المبكر، حل الواجب، التميز" },
    { key: "violation", label: "خصم", icon: Bell, tone: "rose", description: "مخالفة أو خصم معتمد" },
    { key: "program", label: "برنامج", icon: Wand2, tone: "blue", description: "برنامج أو نشاط ينفذه المعلم" },
  ];
  const programTargetOptions = [
    { key: "school", label: "المدرسة كاملة" },
    { key: "company", label: "فصل / شركة" },
    { key: "group", label: "مجموعة" },
    { key: "student", label: "طالب واحد" },
  ];

  const getDefinitionsByType = useCallback((type) => {
    if (type === "violation") return settings.actions?.violations || [];
    if (type === "program") return settings.actions?.programs || [];
    return settings.actions?.rewards || [];
  }, [settings]);

  useEffect(() => {
    const definitions = getDefinitionsByType(actionType);
    setDefinitionId(definitions[0]?.id || "");
  }, [actionType, getDefinitionsByType]);

  useEffect(() => {
    if (!compactMode) setTeacherView("workspace");
  }, [compactMode]);

  useEffect(() => {
    setIdentifiedStudent(null);
    setProgramStudent(null);
    setQuery("");
    setProgramStudentQuery("");
    setStatusMessage("");
    setFaceFile(null);
    setFacePreview("");
    setProgramCompanyId(String(programCompanies[0]?.rawId || programCompanies[0]?.id || ""));
    setProgramEvidenceFiles([]);
    setProgramEvidencePreviews([]);
  }, [selectedSchool.id]);

  const currentDefinitions = getDefinitionsByType(actionType);
  const selectedDefinition = currentDefinitions.find((item) => String(item.id) === String(definitionId)) || currentDefinitions[0] || null;
  const latestActions = actionLog.filter((item) => item.schoolId === selectedSchool.id).slice(0, 10);
  const teacherRecentActions = latestActions.filter((item) => (currentUser?.id && String(item.actorId || '') === String(currentUser.id)) || item.actorUsername === currentUser?.username || item.actorName === currentUser?.fullName).slice(0, 5);
  const teacherStats = {
    total: teacherRecentActions.length,
    rewards: teacherRecentActions.filter((item) => item.actionType === "reward").length,
    violations: teacherRecentActions.filter((item) => item.actionType === "violation").length,
    programs: teacherRecentActions.filter((item) => item.actionType === "program").length,
  };
  const teacherPreferredDefinitions = currentDefinitions.slice().sort((a, b) => {
    const aCount = teacherRecentActions.filter((item) => item.actionType === actionType && String(item.definitionId || '') === String(a.id)).length;
    const bCount = teacherRecentActions.filter((item) => item.actionType === actionType && String(item.definitionId || '') === String(b.id)).length;
    return bCount - aCount;
  });
  const teacherFavoriteDefinitions = teacherPreferredDefinitions.slice(0, 3);
  const teacherLastStudentAction = teacherRecentActions.find((item) => ['reward', 'violation'].includes(item.actionType) && (item.studentName || item.targetLabel));
  const teacherLastProgramAction = teacherRecentActions.find((item) => item.actionType === 'program');
  const teacherLastDefinitionForCurrentType = teacherRecentActions.find((item) => item.actionType === actionType && item.definitionId);
  const teacherRecentStudents = teacherRecentActions
    .filter((item) => ['reward', 'violation'].includes(item.actionType) && (item.studentId || item.studentNumber || item.studentName))
    .reduce((acc, item) => {
      const key = String(item.studentId || item.studentNumber || item.studentName || item.targetLabel || '');
      if (!key || acc.some((entry) => entry.key === key)) return acc;
      acc.push({
        key,
        studentId: item.studentId,
        studentNumber: item.studentNumber,
        barcode: item.barcode,
        studentName: item.studentName || item.targetLabel,
        actionType: item.actionType,
        definitionTitle: item.definitionTitle,
      });
      return acc;
    }, [])
    .slice(0, 4);
  const teacherProgramFavoriteActions = teacherRecentActions.filter((item) => item.actionType === 'program').reduce((acc, item) => {
    if (!acc.some((existing) => String(existing.definitionId || '') === String(item.definitionId || '') && String(existing.targetType || '') === String(item.targetType || ''))) acc.push(item);
    return acc;
  }, []).slice(0, 3);
  const programQuickTemplates = (settings.actions?.programs || []).slice(0, 4).map((item, index) => ({
    id: `program-template-${item.id}`,
    definitionId: item.id,
    title: item.title,
    targetType: ['school', 'company', 'group', 'student'][index % 4],
    targetLabel: index % 4 === 0 ? 'جميع طلاب المدرسة' : index % 4 === 1 ? 'طلاب الفصل المستهدف' : index % 4 === 2 ? 'مجموعة دعم صغيرة' : 'طالب يحتاج متابعة',
    targetCount: index % 4 === 0 ? '60' : index % 4 === 1 ? '30' : index % 4 === 2 ? '12' : '1',
    note: item.description || 'تنفيذ ميداني موثق مع شاهد مختصر.',
  }));
  const applyProgramPreset = (preset) => {
    if (!preset) return;
    if (preset.definitionId) setDefinitionId(String(preset.definitionId));
    if (preset.title) setProgramTitle(preset.title);
    if (preset.targetType) setProgramTargetType(preset.targetType);
    if (typeof preset.targetLabel !== 'undefined') setProgramTargetLabel(preset.targetLabel || '');
    if (typeof preset.targetCount !== 'undefined') setProgramTargetCount(String(preset.targetCount || '1'));
    if (typeof preset.note !== 'undefined') setNote(preset.note || '');
    setStatusMessage(`تم تعبئة قالب سريع: ${preset.title || 'برنامج جاهز'}`);
  };


  const fillFromLastStudentAction = () => {
    if (!teacherLastStudentAction) return;
    openTeacherAction(teacherLastStudentAction.actionType || 'reward');
    const fallbackStudent = getUnifiedSchoolStudents(selectedSchool, { includeArchived: false, preferStructure: true }).find((student) => String(student.id) === String(teacherLastStudentAction.studentId || '') || String(student.studentNumber || '') === String(teacherLastStudentAction.studentNumber || '') || String(student.barcode || '') === String(teacherLastStudentAction.barcode || '') || student.name === teacherLastStudentAction.studentName);
    if (fallbackStudent) {
      setIdentifiedStudent(fallbackStudent);
      setStatusMessage(`تم تجهيز آخر طالب بسرعة: ${fallbackStudent.name}`);
    } else {
      setStatusMessage(`تم فتح المسار السريع. امسح الطالب الأخير: ${teacherLastStudentAction.studentName || teacherLastStudentAction.targetLabel}`);
    }
  };

  const fillProgramFromLastAction = () => {
    if (!teacherLastProgramAction) return;
    openTeacherAction('program');
    setProgramTitle(teacherLastProgramAction.definitionTitle || teacherLastProgramAction.actionTitle || '');
    setProgramTargetLabel(teacherLastProgramAction.targetLabel || '');
    setProgramTargetCount(String(teacherLastProgramAction.targetCount || 1));
    setNote(teacherLastProgramAction.note || '');
    if (teacherLastProgramAction.definitionId) setDefinitionId(String(teacherLastProgramAction.definitionId));
    setStatusMessage('تم تجهيز آخر برنامج لتسريع التكرار والتعديل.');
  };

  const openTeacherAction = (nextType, options = {}) => {
    const preserveStudent = !!options.preserveStudent && nextType !== "program";
    const preserveProgram = !!options.preserveProgram && nextType === "program";
    setActionType(nextType);
    setTeacherView(nextType);
    setIdentifyMethod(nextType === "program" ? "manual" : "barcode");
    setStatusMessage(nextType === "program"
      ? (preserveProgram ? "تم فتح مسار البرنامج مع الإبقاء على بياناتك الحالية." : "")
      : (preserveStudent
        ? `تم إبقاء الطالب المحدد (${identifiedStudent?.name || 'الطالب الحالي'}) ويمكنك التبديل بين المكافأة والخصم دون إعادة المسح.`
        : "الالتقاط السريع جاهز. وجّه الكاميرا مباشرة إلى باركود الطالب، أو بدّل إلى بصمة الوجه أو الإدخال اليدوي عند الحاجة."));
    if (!preserveStudent) {
      setIdentifiedStudent(null);
      setQuery("");
      setFaceFile(null);
      setFacePreview("");
    }
    if (!preserveProgram) {
      setProgramStudent(null);
      setProgramStudentQuery("");
      setProgramTitle("");
      setProgramEvidenceFiles([]);
      setProgramEvidencePreviews([]);
    }
    setNote("");
    setLastExecution(null);
    if (nextType !== "program" && !preserveStudent) setScanSessionKey((value) => value + 1);
  };

  const continueSequentialAction = () => {
    if (actionType === 'program') {
      setProgramTitle('');
      setProgramTargetLabel('');
      setProgramTargetCount('1');
      setProgramEvidenceFiles([]);
      setProgramEvidencePreviews([]);
      setNote('');
      setLastExecution(null);
      setStatusMessage('تم تجهيز نموذج برنامج جديد لإدخال التنفيذ التالي بسرعة.');
      return;
    }
    setIdentifiedStudent(null);
    setQuery('');
    setFaceFile(null);
    setFacePreview('');
    setLastExecution(null);
    setStatusMessage('جاهز لتنفيذ متتابع. امسح الطالب التالي مباشرة.');
    setIdentifyMethod('barcode');
    setScanSessionKey((value) => value + 1);
  };
  const continueOnSameStudent = () => {
    setLastExecution(null);
    setStatusMessage('جاهز لتنفيذ إجراء آخر على نفس الطالب.');
    setScanSessionKey((value) => value + 1);
  };

  const goTeacherHome = () => {
    setTeacherView("home");
    setStatusMessage("");
    setIdentifiedStudent(null);
    setProgramStudent(null);
    setLastExecution(null);
  };
  const resolveFromBarcode = (value) => {
    const student = onResolveStudentByBarcode(value);
    setQuery(value);
    setIdentifiedStudent(student);
    setStatusMessage(student ? `تم التعرف على الطالب: ${student.name}` : "لم يتم العثور على طالب بهذا الـ QR.");
    return student;
  };

  const resolveManual = () => {
    const student = onResolveStudentByManual(query);
    setIdentifiedStudent(student);
    setStatusMessage(student ? `تم العثور على الطالب: ${student.name}` : "لم يتم العثور على طالب بهذه البيانات.");
    return student;
  };

  const resolveProgramStudent = () => {
    const student = onResolveStudentByManual(programStudentQuery);
    setProgramStudent(student);
    setStatusMessage(student ? `تم تحديد الطالب للبرنامج: ${student.name}` : "لم يتم العثور على الطالب المطلوب للبرنامج.");
    return student;
  };

  const handleFaceFile = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setFaceFile(file);
    setFacePreview(await fileToDataUrl(file));
    event.target.value = "";
  };

  const verifyFaceFile = async () => {
    if (!faceFile) return null;
    setBusy(true);
    try {
      const result = await onResolveStudentByFaceFile(faceFile);
      setIdentifiedStudent(result);
      setStatusMessage(result ? `تمت مطابقة الوجه مع الطالب: ${result.name}` : "لم يتم العثور على تطابق كافٍ للوجه.");
      return result;
    } finally {
      setBusy(false);
    }
  };

  const verifyFaceCamera = async (dataUrl) => {
    setBusy(true);
    try {
      const result = await onResolveStudentByFaceDataUrl(dataUrl);
      setIdentifiedStudent(result);
      setStatusMessage(result ? `تمت مطابقة الوجه مع الطالب: ${result.name}` : "لم يتم العثور على تطابق كافٍ للوجه.");
      return result;
    } finally {
      setBusy(false);
    }
  };

  const applyAction = async (definitionOverride = selectedDefinition, methodOverride = null) => {
    if (!identifiedStudent || !definitionOverride) return;
    setBusy(true);
    try {
      const result = await onApplyStudentAction({
        studentId: identifiedStudent.id,
        actionType,
        definitionId: definitionOverride.id,
        note,
        method: methodOverride || (identifyMethod === "face" ? "بصمة وجه" : identifyMethod === "barcode" ? "QR مباشر" : "إدخال رقم الطالب"),
      });
      setStatusMessage(result?.message || (result?.ok ? "تم تنفيذ الإجراء." : "تعذر تنفيذ الإجراء."));
      if (result?.ok) {
        const delta = Number(definitionOverride?.points || 0);
        setIdentifiedStudent((prev) => prev ? { ...prev, points: Number(prev.points || 0) + delta } : prev);
        setNote("");
        setLastExecution({
          type: actionType,
          title: definitionOverride?.title || (actionType === 'reward' ? 'مكافأة' : 'خصم'),
          studentName: identifiedStudent?.name,
          deltaPoints: delta,
          method: methodOverride || (identifyMethod === "face" ? "بصمة وجه" : identifyMethod === "barcode" ? "QR مباشر" : "إدخال يدوي"),
          at: new Date().toISOString(),
          message: result?.message || "تم تنفيذ الإجراء بنجاح.",
          quickStudentId: identifiedStudent?.id,
        });
      }
      return result;
    } finally {
      setBusy(false);
    }
  };

  const submitProgram = async () => {
    if (!selectedDefinition) return;
    if (programTargetType === "student" && !programStudent) {
      setStatusMessage("حدّد الطالب المستهدف للبرنامج أولاً.");
      return;
    }
    const company = programCompanies.find((item) => String(item.rawId || item.id) === String(programCompanyId));
    const targetLabels = {
      school: "المدرسة كاملة",
      company: company?.name || "فصل / شركة",
      group: programTargetLabel || "مجموعة محددة",
      student: programStudent?.name || "طالب واحد",
    };
    setBusy(true);
    try {
      const result = await onRecordProgramAction({
        definitionId: selectedDefinition.id,
        companyId: programTargetType === "company" ? company?.id : (programTargetType === "student" ? programStudent?.companyId : null),
        studentId: programTargetType === "student" ? programStudent?.id : null,
        targetType: programTargetOptions.find((item) => item.key === programTargetType)?.label || programTargetType,
        targetLabel: programTargetType === "company" ? company?.name : targetLabels[programTargetType],
        targetCount: programTargetCount,
        note: [programTitle ? `عنوان البرنامج: ${programTitle}` : '', programTargetLabel, note].filter(Boolean).join(" • "),
        evidenceFiles: programEvidenceFiles,
      });
      setStatusMessage(result?.message || (result?.ok ? "تم حفظ البرنامج." : "تعذر حفظ البرنامج."));
      if (result?.ok) {
        setLastExecution({
          type: 'program',
          title: selectedDefinition?.title || 'برنامج',
          studentName: programTargetType === 'student' ? programStudent?.name : null,
          deltaPoints: Number(selectedDefinition?.points || 0),
          method: 'نموذج برنامج',
          at: new Date().toISOString(),
          message: result?.message || 'تم حفظ البرنامج بنجاح.',
          targetLabel: targetLabels[programTargetType],
        });
        setProgramTitle("");
        setNote("");
        setProgramEvidenceFiles([]);
        setProgramEvidencePreviews([]);
        if (programTargetType === "student") {
          setProgramStudent(null);
          setProgramStudentQuery("");
        }
      }
    } finally {
      setBusy(false);
    }
  };

  const continueOnLastDefinition = () => {
    if (!identifiedStudent || !teacherLastDefinitionForCurrentType) return;
    const lastDefinition = currentDefinitions.find((item) => String(item.id) === String(teacherLastDefinitionForCurrentType.definitionId));
    if (!lastDefinition) return;
    setDefinitionId(String(lastDefinition.id));
    applyAction(lastDefinition, 'آخر سبب مستخدم');
  };

  const teacherContextLabel = identifiedStudent
    ? `${identifiedStudent.name} • ${getStudentGroupingLabel(identifiedStudent, selectedSchool)}`
    : 'لم يتم تحديد طالب بعد';

  const switchTeacherActionKeepingStudent = (nextType) => {
    if (nextType === 'program') {
      openTeacherAction('program');
      return;
    }
    const definitions = getDefinitionsByType(nextType);
    setDefinitionId(definitions[0]?.id || '');
    openTeacherAction(nextType, { preserveStudent: !!identifiedStudent });
  };

  const projectedStudentPoints = identifiedStudent && selectedDefinition
    ? Number(identifiedStudent.points || 0) + Number(selectedDefinition.points || 0)
    : null;

  const renderExecutionBanner = () => {
    if (!lastExecution) return null;
    const tone = lastExecution.type === 'reward' ? 'from-emerald-500 via-emerald-600 to-teal-600' : lastExecution.type === 'violation' ? 'from-rose-500 via-rose-600 to-orange-500' : 'from-sky-600 via-blue-700 to-indigo-700';
    return (
      <div className={`rounded-[34px] bg-gradient-to-r ${tone} p-6 text-white shadow-2xl`}>
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="text-sm font-bold text-white/80">تم التنفيذ بنجاح</div>
            <div className="mt-1 text-3xl font-black md:text-4xl">{lastExecution.title}</div>
            <div className="mt-2 text-base leading-8 text-white/95">{lastExecution.message}</div>
            <div className="mt-3 inline-flex items-center rounded-2xl bg-white/10 px-3 py-2 text-xs font-black ring-1 ring-white/15">{selectedSchool?.name || 'المدرسة الحالية'}</div>
          </div>
          <div className="rounded-[30px] bg-white/15 px-5 py-4 text-center ring-1 ring-white/15 min-w-[96px]">
            <div className="text-xs text-white/75">الأثر</div>
            <div className="mt-1 text-4xl font-black">{lastExecution.deltaPoints > 0 ? `+${lastExecution.deltaPoints}` : lastExecution.deltaPoints || 0}</div>
          </div>
        </div>
        <div className="mt-4 grid grid-cols-2 gap-3 text-sm md:grid-cols-4">
          <div className="rounded-2xl bg-white/10 px-3 py-3 ring-1 ring-white/10"><div className="text-xs text-white/70">المستفيد</div><div className="mt-1 font-bold">{lastExecution.studentName || lastExecution.targetLabel || 'عام'}</div></div>
          <div className="rounded-2xl bg-white/10 px-3 py-3 ring-1 ring-white/10"><div className="text-xs text-white/70">الطريقة</div><div className="mt-1 font-bold">{lastExecution.method}</div></div>
          <div className="rounded-2xl bg-white/10 px-3 py-3 ring-1 ring-white/10"><div className="text-xs text-white/70">الوقت</div><div className="mt-1 font-bold">{formatDateTime(lastExecution.at)}</div></div>
          <button onClick={() => setLastExecution(null)} className="rounded-2xl bg-white/10 px-3 py-3 text-center font-black ring-1 ring-white/10">إخفاء</button>
        </div>
        <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
          {lastExecution.type !== 'program' ? <button onClick={continueSequentialAction} className="rounded-2xl bg-white px-4 py-4 text-sm font-black text-slate-900">تنفيذ متتابع للطالب التالي</button> : <button onClick={continueSequentialAction} className="rounded-2xl bg-white px-4 py-4 text-sm font-black text-slate-900">برنامج جديد سريع</button>}
          {lastExecution.type !== 'program' ? <button onClick={continueOnSameStudent} className="rounded-2xl bg-white/10 px-4 py-4 text-sm font-black text-white ring-1 ring-white/10">الاستمرار على نفس الطالب</button> : <div className="hidden sm:block" />}
          <button onClick={goTeacherHome} className="rounded-2xl bg-white/10 px-4 py-4 text-sm font-black text-white ring-1 ring-white/10">العودة للرئيسية</button>
        </div>
      </div>
    );
  };

  const renderProgramCompanyButtons = () => {
    if (!programCompanies.length) return null;
    return (
      <div className="mt-4 rounded-2xl bg-slate-50 p-4 ring-1 ring-slate-200">
        <div className="mb-3 flex items-center justify-between gap-3">
          <div>
            <div className="font-bold text-slate-800">اختر الفصل / الشركة</div>
            <div className="text-sm text-slate-500">بدون قوائم منسدلة. اضغط مباشرة على الفصل المستهدف.</div>
          </div>
          <Badge tone="slate">{programCompanies.length}</Badge>
        </div>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {programCompanies.map((company) => {
            const selected = String(programCompanyId) === String(company.rawId || company.id);
            return (
              <button key={company.id} onClick={() => setProgramCompanyId(String(company.rawId || company.id))} className={cx('rounded-3xl border p-4 text-right transition', selected ? 'border-slate-900 bg-slate-900 text-white shadow-lg' : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-100')}>
                <div className="font-black">{company.name}</div>
                <div className={cx('mt-1 text-xs leading-6', selected ? 'text-white/80' : 'text-slate-500')}>{company.className || 'فصل دراسي'}</div>
              </button>
            );
          })}
        </div>
      </div>
    );
  };

  const renderStudentCard = (student) => {
    if (!student) return <div className="mt-4 overflow-hidden rounded-[30px] border border-dashed border-slate-300 bg-gradient-to-b from-slate-50 to-white px-4 py-10 text-center text-sm text-slate-500 shadow-sm">عرّف الطالب أولاً عبر QR أو بصمة الوجه أو رقم الطالب.</div>;
    return (
      <div className="mt-4 overflow-hidden rounded-[32px] bg-gradient-to-br from-slate-900 via-slate-800 to-sky-900 p-[1px] shadow-xl">
        <div className="rounded-[31px] bg-white p-4">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="flex items-start gap-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-[24px] bg-sky-100 text-sky-800 ring-1 ring-sky-200">
                <UserCircle2 className="h-9 w-9" />
              </div>
              <div>
                <div className="text-xs font-bold tracking-wide text-slate-500">الطالب المحدد</div>
                <div className="mt-1 text-xl font-black text-slate-900">{student.name}</div>
                <div className="mt-2 flex flex-wrap gap-2">
                  <Badge tone="blue">{getStudentGroupingLabel(student, selectedSchool)}</Badge>
                  <Badge tone="violet">{student.points} نقطة حالية</Badge>
                  <Badge tone={getFaceProfileTone(student)}>{getFaceProfileLabel(student)}</Badge>
                  {selectedDefinition ? <Badge tone={actionType === 'reward' ? 'green' : actionType === 'violation' ? 'rose' : 'blue'}>{actionType === 'reward' ? 'مكافأة' : actionType === 'violation' ? 'خصم' : 'برنامج'}: {selectedDefinition.title}</Badge> : null}
                </div>
              </div>
            </div>
            <div className="flex justify-center">
              <div className="rounded-[28px] bg-slate-50 p-3 ring-1 ring-slate-200">
                <QrCodeVisual value={student.barcode} size={108} />
              </div>
            </div>
          </div>
          <div className="mt-4 grid grid-cols-2 gap-3 md:grid-cols-4">
            <div className="rounded-2xl bg-slate-50 p-3 ring-1 ring-slate-200"><div className="text-[11px] font-bold text-slate-500">رقم الطالب</div><div className="mt-1 text-sm font-black text-slate-800">{student.studentNumber || student.id}</div></div>
            <div className="rounded-2xl bg-slate-50 p-3 ring-1 ring-slate-200"><div className="text-[11px] font-bold text-slate-500">الهوية</div><div className="mt-1 text-sm font-black text-slate-800">{student.nationalId || '—'}</div></div>
            <div className="rounded-2xl bg-slate-50 p-3 ring-1 ring-slate-200"><div className="text-[11px] font-bold text-slate-500">رمز الطالب</div><div className="mt-1 truncate text-sm font-black text-slate-800">{student.barcode || '—'}</div></div>
            <div className={cx('rounded-2xl p-3 ring-1', selectedDefinition ? (actionType === 'reward' ? 'bg-gradient-to-br from-emerald-50 to-sky-50 ring-emerald-100' : 'bg-gradient-to-br from-rose-50 to-orange-50 ring-rose-100') : 'bg-gradient-to-br from-slate-50 to-white ring-slate-200')}><div className="text-[11px] font-bold text-slate-500">أثر التنفيذ</div><div className="mt-1 text-sm font-black text-slate-800">{selectedDefinition ? `${selectedDefinition.points > 0 ? '+' : ''}${selectedDefinition.points} نقطة` : 'يُحدَّث مباشرة بعد الاعتماد'}</div></div>
          </div>
          {selectedDefinition ? (
            <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
              <div className="rounded-2xl bg-slate-50 p-3 ring-1 ring-slate-200"><div className="text-[11px] font-bold text-slate-500">الإجراء الحالي</div><div className="mt-1 text-sm font-black text-slate-900">{selectedDefinition.title}</div></div>
              <div className="rounded-2xl bg-slate-50 p-3 ring-1 ring-slate-200"><div className="text-[11px] font-bold text-slate-500">أثره على الطالب</div><div className="mt-1 text-sm font-black text-slate-900">{selectedDefinition.points > 0 ? `+${selectedDefinition.points}` : selectedDefinition.points} نقطة</div></div>
              <div className={cx('rounded-2xl p-3 ring-1', projectedStudentPoints !== null ? 'bg-slate-900 text-white ring-slate-900/10' : 'bg-slate-50 ring-slate-200')}><div className={cx('text-[11px] font-bold', projectedStudentPoints !== null ? 'text-white/70' : 'text-slate-500')}>الرصيد المتوقع بعد الاعتماد</div><div className="mt-1 text-sm font-black">{projectedStudentPoints !== null ? `${projectedStudentPoints} نقطة` : '—'}</div></div>
            </div>
          ) : null}
        </div>
      </div>
    );
  };

  const renderQuickIdentifyPanel = () => (
    <div className="rounded-3xl bg-slate-50 p-5 ring-1 ring-slate-200">
      <div className="mb-3 flex items-center justify-between gap-3">
        <div>
          <div className="font-bold text-slate-800">التعرف على الطالب</div>
          <div className="text-sm text-slate-500">التقاط سريع مهيأ للجوال. الكاميرا تبدأ مباشرة، وبعد التنفيذ يمكنك الانتقال للطالب التالي دون العودة للرئيسية.</div>
        </div>
        <Badge tone="slate">{selectedSchool?.name || 'المدرسة الحالية'}</Badge>
      </div>

      {compactMode ? (
        <div className="space-y-4">
          <div className="grid grid-cols-3 gap-2 rounded-3xl bg-white p-1 ring-1 ring-slate-200">
            {[['barcode', 'باركود'], ['face', 'الوجه'], ['manual', 'يدوي']].map(([key, label]) => (
              <button key={key} onClick={() => setIdentifyMethod(key)} className={cx('rounded-2xl px-3 py-3 text-sm font-black transition', identifyMethod === key ? 'bg-slate-900 text-white shadow-sm' : 'text-slate-600')}>{label}</button>
            ))}
          </div>

          {teacherRecentStudents.length ? (
            <div className="rounded-3xl bg-white p-3 ring-1 ring-slate-200">
              <div className="mb-2 text-xs font-black text-slate-500">آخر الطلاب لديك</div>
              <div className="flex gap-2 overflow-x-auto pb-1">
                {teacherRecentStudents.map((item) => (
                  <button
                    key={`recent-student-${item.key}`}
                    onClick={() => {
                      const fallbackStudent = getUnifiedSchoolStudents(selectedSchool, { includeArchived: false, preferStructure: true }).find((student) => String(student.id) === String(item.studentId || '') || String(student.studentNumber || '') === String(item.studentNumber || '') || String(student.barcode || '') === String(item.barcode || '') || student.name === item.studentName);
                      if (fallbackStudent) {
                        setIdentifiedStudent(fallbackStudent);
                        setStatusMessage(`تم استدعاء الطالب ${fallbackStudent.name} مباشرة.`);
                      }
                    }}
                    className="min-w-[150px] rounded-2xl bg-slate-50 px-3 py-3 text-right ring-1 ring-slate-200"
                  >
                    <div className="truncate text-sm font-black text-slate-800">{item.studentName || 'طالب سابق'}</div>
                    <div className="mt-1 text-[11px] text-slate-500">{item.definitionTitle || (item.actionType === 'reward' ? 'مكافأة' : 'خصم')}</div>
                  </button>
                ))}
              </div>
            </div>
          ) : null}

          {identifyMethod === 'barcode' ? (
            <LiveCameraPanel mode="barcode" title="التقاط مباشر للطالب" description="افتح الكاميرا الآن ووجّه الباركود أمام الجوال ليتم التعرف مباشرة." onDetectBarcode={resolveFromBarcode} autoStart hideDeviceSelect videoHeightClass="h-[22rem]" />
          ) : null}

          {identifyMethod === 'face' ? (
            <div className="space-y-4">
              <LiveCameraPanel key={`teacher-face-${scanSessionKey}`} mode="face" title="التقاط بالوجه" description="وضع الوجه جاهز مباشرة. وجّه وجه الطالب بوضوح أمام الكاميرا أو استخدم رفع صورة احتياطية." onDetectFace={verifyFaceCamera} onCapture={verifyFaceCamera} autoStart hideDeviceSelect videoHeightClass="h-72" />
              <div className="rounded-2xl bg-white p-4 ring-1 ring-slate-200">
                <div className="flex flex-wrap gap-3">
                  <label className="inline-flex cursor-pointer items-center gap-2 rounded-2xl bg-sky-700 px-4 py-3 text-sm font-bold text-white">
                    <Upload className="h-4 w-4" /> رفع صورة الوجه
                    <input type="file" accept="image/*" capture="user" className="hidden" onChange={handleFaceFile} />
                  </label>
                  <button onClick={verifyFaceFile} disabled={!faceFile || busy} className={cx('rounded-2xl px-4 py-3 text-sm font-bold', !faceFile || busy ? 'bg-slate-200 text-slate-500' : 'bg-emerald-600 text-white')}>{busy ? 'جارٍ التحقق...' : 'تحقق من الصورة'}</button>
                </div>
                {facePreview ? <img src={facePreview} alt="معاينة الوجه" className="mt-4 h-56 w-full rounded-2xl object-cover ring-1 ring-slate-200" /> : null}
              </div>
            </div>
          ) : null}

          {identifyMethod === 'manual' ? (
            <div className="rounded-2xl bg-white p-4 ring-1 ring-slate-200">
              <Input label="رقم الطالب أو الهوية أو الاسم" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="مثال: ABH-0001 أو 1100000011" />
              <button onClick={resolveManual} className="mt-3 w-full rounded-2xl bg-sky-700 px-4 py-3 text-sm font-bold text-white">تعرف يدويًا</button>
            </div>
          ) : null}
        </div>
      ) : (
        <>
          <div className="mb-4 grid grid-cols-3 gap-2 rounded-2xl bg-white p-1 ring-1 ring-slate-200">
            {[['barcode', 'QR مباشر'], ['face', 'بصمة وجه'], ['manual', 'إدخال رقم']].map(([key, label]) => (
              <button key={key} onClick={() => setIdentifyMethod(key)} className={`rounded-xl px-3 py-3 text-sm font-bold ${identifyMethod === key ? 'bg-sky-700 text-white' : 'text-slate-600'}`}>{label}</button>
            ))}
          </div>

          {identifyMethod === 'barcode' ? (
            <div className="space-y-4">
              <LiveCameraPanel mode="barcode" title="كاميرا QR المباشرة" description="وجّه QR الطالب للكاميرا وسيُقرأ مباشرة دون تصوير." onDetectBarcode={resolveFromBarcode} />
              <div className="rounded-2xl bg-white p-4 ring-1 ring-slate-200">
                <Input label="رقم QR يدوي" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="مثال: ST-0001-ABH" />
                <div className="mt-3 flex gap-3">
                  <button onClick={() => resolveFromBarcode(query)} className="rounded-2xl bg-sky-700 px-4 py-3 text-sm font-bold text-white">تعرف على الطالب</button>
                  <button onClick={() => setQuery('')} className="rounded-2xl bg-slate-100 px-4 py-3 text-sm font-bold text-slate-700">مسح</button>
                </div>
              </div>
            </div>
          ) : null}

          {identifyMethod === 'face' ? (
            <div className="space-y-4">
              <div className="flex flex-wrap gap-3">
                <label className="inline-flex cursor-pointer items-center gap-2 rounded-2xl bg-sky-700 px-4 py-3 text-sm font-bold text-white">
                  <Upload className="h-4 w-4" /> رفع صورة الوجه
                  <input type="file" accept="image/*" capture="user" className="hidden" onChange={handleFaceFile} />
                </label>
                <button onClick={verifyFaceFile} disabled={!faceFile || busy} className={cx('rounded-2xl px-4 py-3 text-sm font-bold', !faceFile || busy ? 'bg-slate-200 text-slate-500' : 'bg-emerald-600 text-white')}>{busy ? 'جارٍ التحقق...' : 'تحقق من الصورة'}</button>
              </div>
              {facePreview ? <img src={facePreview} alt="معاينة الوجه" className="h-56 w-full rounded-2xl object-cover ring-1 ring-slate-200" /> : null}
              <LiveCameraPanel mode="face" title="كاميرا بصمة الوجه المباشرة" description="افتح الكاميرا من الجوال أو اللابتوب وسيجري التعرف على الطالب مباشرة." onDetectFace={verifyFaceCamera} onCapture={verifyFaceCamera} />
            </div>
          ) : null}

          {identifyMethod === 'manual' ? (
            <div className="rounded-2xl bg-white p-4 ring-1 ring-slate-200">
              <Input label="رقم الطالب أو الهوية أو الاسم أو الباركود" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="مثال: ST-0001-ABH أو 1100000011" list="manual-student-options" />
              <datalist id="manual-student-options">{getUnifiedSchoolStudents(selectedSchool, { includeArchived: false, preferStructure: true }).slice(0, 40).map((student) => <option key={student.id} value={student.studentNumber || student.barcode}>{student.name} — {student.nationalId || student.barcode}</option>)}</datalist>
              <button onClick={resolveManual} className="mt-3 rounded-2xl bg-sky-700 px-4 py-3 text-sm font-bold text-white">بحث عن الطالب</button>
            </div>
          ) : null}
        </>
      )}

      {statusMessage ? <div className="mt-4 rounded-2xl bg-white px-4 py-3 text-sm text-slate-600 ring-1 ring-slate-200">{statusMessage}</div> : null}
    </div>
  );

  const renderQuickActionButtons = () => (
    <div className="overflow-hidden rounded-[32px] bg-gradient-to-br from-white via-slate-50 to-slate-100 p-5 ring-1 ring-slate-200 shadow-sm">
      <div className="flex items-center justify-between gap-3">
        <div>
          <div className="font-bold text-slate-800">اختر {actionType === 'reward' ? 'المكافأة' : 'الخصم'} مباشرة</div>
          <div className="text-sm text-slate-500">واجهة أزرار كبيرة مهيأة للجوال. لا تظهر القوائم المنسدلة في هذا المسار.</div>
        </div>
        <Badge tone={actionType === 'reward' ? 'green' : 'rose'}>{currentDefinitions.length} بنود</Badge>
      </div>
      <div className="mt-4 grid grid-cols-3 gap-2 rounded-[28px] bg-white p-2 ring-1 ring-slate-200">
        <div className={cx('rounded-2xl px-3 py-3 text-center text-xs font-black', identifiedStudent ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-50 text-slate-400 ring-1 ring-slate-200')}>1. تحديد الطالب</div>
        <div className={cx('rounded-2xl px-3 py-3 text-center text-xs font-black', identifiedStudent ? 'bg-sky-100 text-sky-700' : 'bg-slate-50 text-slate-400 ring-1 ring-slate-200')}>2. اختيار البند</div>
        <div className={cx('rounded-2xl px-3 py-3 text-center text-xs font-black', lastExecution && lastExecution.type === actionType ? 'bg-violet-100 text-violet-700' : 'bg-slate-50 text-slate-400 ring-1 ring-slate-200')}>3. اعتماد فوري</div>
      </div>
      <div className="mt-4 grid grid-cols-2 gap-3 md:grid-cols-4">
        <div className="rounded-2xl bg-white p-3 ring-1 ring-slate-200"><div className="text-[11px] font-bold text-slate-500">نقاطك الحالية</div><div className="mt-1 text-lg font-black text-slate-900">{currentUser.points || 0}</div></div>
        <div className="rounded-2xl bg-white p-3 ring-1 ring-slate-200"><div className="text-[11px] font-bold text-slate-500">عملياتك اليوم</div><div className="mt-1 text-lg font-black text-slate-900">{teacherStats.total}</div></div>
        <div className="rounded-2xl bg-white p-3 ring-1 ring-slate-200"><div className="text-[11px] font-bold text-slate-500">النوع الحالي</div><div className="mt-1 text-lg font-black text-slate-900">{actionType === 'reward' ? 'مكافأة' : 'خصم'}</div></div>
        <div className={cx('rounded-2xl p-3 ring-1', actionType === 'reward' ? 'bg-emerald-50 ring-emerald-100' : 'bg-rose-50 ring-rose-100')}><div className="text-[11px] font-bold text-slate-500">أثر البند المختار</div><div className="mt-1 text-lg font-black text-slate-900">{selectedDefinition ? (selectedDefinition.points > 0 ? `+${selectedDefinition.points}` : selectedDefinition.points) : '—'}</div></div>
      </div>
      <div className="mt-4">
        <label className="block">
          <span className="mb-2 block text-sm font-bold text-slate-700">ملاحظة اختيارية</span>
          <textarea value={note} onChange={(e) => setNote(e.target.value)} className="min-h-[88px] w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none" placeholder="ملاحظة تحفظ في السجل عند الحاجة" />
        </label>
      </div>
      {teacherLastDefinitionForCurrentType ? (
        <div className={cx('mt-4 grid gap-3', teacherFastMode ? 'grid-cols-1' : 'grid-cols-1 sm:grid-cols-2')}>
          <button onClick={continueOnLastDefinition} disabled={!identifiedStudent} className={cx('rounded-[28px] border px-4 py-4 text-right text-sm font-black transition', !identifiedStudent ? 'cursor-not-allowed border-slate-200 bg-slate-100 text-slate-400' : 'border-slate-900 bg-slate-900 text-white hover:bg-slate-800')}>
            <div className="flex items-center justify-between gap-3">
              <div>
                <div>تنفيذ آخر سبب مباشرة</div>
                <div className="mt-1 text-xs opacity-75">{teacherLastDefinitionForCurrentType.definitionTitle || 'آخر بند مستخدم'} • {teacherLastDefinitionForCurrentType.method || 'سريع'}</div>
              </div>
              <span className="rounded-2xl bg-white/10 px-3 py-2 text-[11px] font-black">سريع جدًا</span>
            </div>
          </button>
          {teacherFastMode && identifiedStudent && selectedDefinition ? (
            <button onClick={() => applyAction(selectedDefinition, 'الوضع الخاطف')} className={cx('rounded-[28px] border border-emerald-200 bg-emerald-50 px-4 py-4 text-right text-sm font-black text-emerald-900 transition hover:bg-emerald-100', actionType === 'violation' ? 'border-rose-200 bg-rose-50 text-rose-900 hover:bg-rose-100' : '')}>
              <div className="flex items-center justify-between gap-3">
                <div>
                  <div>{actionType === 'reward' ? 'اعتماد سريع الآن' : 'تنفيذ الخصم سريعًا'}</div>
                  <div className="mt-1 text-xs opacity-75">{selectedDefinition.title} • {selectedDefinition.points > 0 ? `+${selectedDefinition.points}` : selectedDefinition.points}</div>
                </div>
                <span className="rounded-2xl bg-white/70 px-3 py-2 text-[11px] font-black">خاطف</span>
              </div>
            </button>
          ) : null}
        </div>
      ) : null}
      {teacherFavoriteDefinitions.length ? (
        <div className="mt-4 rounded-[28px] bg-amber-50 p-3 ring-1 ring-amber-200">
          <div className="flex items-center justify-between gap-3">
            <div>
              <div className="font-bold text-amber-900">المفضلة لك</div>
              <div className="text-xs text-amber-800/80">هذه البنود ظهرت أولًا لأنها الأكثر استخدامًا لك خلال الفترة الأخيرة.</div>
            </div>
            <Badge tone="amber">{teacherFavoriteDefinitions.length}</Badge>
          </div>
          <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-3">
            {teacherFavoriteDefinitions.map((item) => (
              <button key={`fav-${item.id}`} onClick={() => applyAction(item, `اختصار ${actionType === 'reward' ? 'مكافأة' : 'خصم'}`)} disabled={!identifiedStudent} className={cx('rounded-[24px] border px-4 py-3 text-right text-sm font-black transition', !identifiedStudent ? 'cursor-not-allowed border-amber-100 bg-white/70 text-slate-400' : 'border-amber-200 bg-white text-amber-900 hover:bg-amber-100')}>
                <div className="flex items-center justify-between gap-3">
                  <div>{item.title}</div>
                  <span className="rounded-xl bg-amber-100 px-2 py-1 text-[11px] font-black text-amber-900">مفضل</span>
                </div>
                <div className="mt-1 text-xs font-bold opacity-70">{item.points > 0 ? `+${item.points}` : item.points} نقطة</div>
              </button>
            ))}
          </div>
        </div>
      ) : null}
      <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
        {teacherPreferredDefinitions.map((item, index) => (
          <button key={item.id} onClick={() => applyAction(item)} disabled={!identifiedStudent} className={cx('rounded-[28px] border p-4 text-right transition shadow-sm', !identifiedStudent ? 'cursor-not-allowed border-slate-200 bg-slate-100 text-slate-400' : actionType === 'reward' ? 'border-emerald-200 bg-emerald-50 text-emerald-900 hover:bg-emerald-100' : 'border-rose-200 bg-rose-50 text-rose-900 hover:bg-rose-100')}>
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="font-black">{item.title}</div>
                <div className="mt-1 text-xs leading-6 opacity-80">{item.description || 'بدون وصف إضافي'}</div>
              </div>
              <div className="space-y-2 text-left">
                <div className="rounded-2xl bg-white/80 px-3 py-2 text-sm font-black">{item.points > 0 ? `+${item.points}` : item.points}</div>
                {index < 2 ? <div className="text-[11px] font-bold opacity-70">سريع</div> : null}
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );

  const renderProgramForm = () => (
    <div className="space-y-4">
      <div className="overflow-hidden rounded-[30px] bg-gradient-to-br from-sky-950 via-sky-800 to-indigo-700 p-5 text-white shadow-xl">
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="text-sm font-bold text-white/75">مسار البرنامج السريع</div>
            <div className="mt-2 text-2xl font-black">سجّل برنامجك بطريقة احترافية</div>
            <div className="mt-2 text-sm leading-7 text-white/85">استخدم قالبًا سريعًا أو أكمل الإدخال يدويًا، ثم راجع أثر البرنامج وعدد الشواهد قبل الحفظ.</div>
          </div>
          {selectedDefinition ? <div className="rounded-3xl bg-white/10 px-4 py-3 text-center ring-1 ring-white/15"><div className="text-xs text-white/70">أثر المعلم</div><div className="mt-1 text-3xl font-black">{selectedDefinition.points > 0 ? `+${selectedDefinition.points}` : selectedDefinition.points}</div></div> : null}
        </div>
        <div className="mt-4 grid grid-cols-3 gap-3 text-sm">
          <div className="rounded-2xl bg-white/10 p-3 ring-1 ring-white/10"><div className="text-xs text-white/70">القوالب السريعة</div><div className="mt-1 font-black">{programQuickTemplates.length}</div></div>
          <div className="rounded-2xl bg-white/10 p-3 ring-1 ring-white/10"><div className="text-xs text-white/70">الشواهد</div><div className="mt-1 font-black">{programEvidenceFiles.length || 0}</div></div>
          <div className="rounded-2xl bg-white/10 p-3 ring-1 ring-white/10"><div className="text-xs text-white/70">المستهدفون</div><div className="mt-1 font-black">{programTargetCount || '1'}</div></div>
        </div>
      </div>

      {programQuickTemplates.length ? (
        <div className="rounded-3xl bg-white p-5 ring-1 ring-slate-200">
          <div className="flex items-center justify-between gap-3">
            <div>
              <div className="font-bold text-slate-800">قوالب برامج سريعة</div>
              <div className="text-sm text-slate-500">لتعبئة أسرع من الجوال. اضغط القالب ثم عدّل ما تحتاجه.</div>
            </div>
            <Badge tone="blue">{programQuickTemplates.length}</Badge>
          </div>
          <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-2">
            {programQuickTemplates.map((item) => (
              <button key={item.id} onClick={() => applyProgramPreset(item)} className="rounded-3xl border border-sky-100 bg-sky-50 p-4 text-right transition hover:bg-sky-100">
                <div className="flex items-center justify-between gap-3">
                  <div className="font-black text-slate-900">{item.title}</div>
                  <Badge tone="blue">{item.targetCount}</Badge>
                </div>
                <div className="mt-2 text-xs leading-6 text-slate-600">{programTargetOptions.find((option) => option.key === item.targetType)?.label || item.targetType} • {item.targetLabel}</div>
                <div className="mt-2 text-xs leading-6 text-slate-500">{item.note}</div>
              </button>
            ))}
          </div>
        </div>
      ) : null}

      {teacherProgramFavoriteActions.length ? (
        <div className="rounded-3xl bg-amber-50 p-4 ring-1 ring-amber-200">
          <div className="flex items-center justify-between gap-3">
            <div>
              <div className="font-bold text-amber-900">المفضلة لك</div>
              <div className="text-xs text-amber-900/75">أكثر البرامج التي استخدمتها مؤخرًا لإعادة تعبئتها بسرعة.</div>
            </div>
            <Badge tone="amber">{teacherProgramFavoriteActions.length}</Badge>
          </div>
          <div className="mt-3 grid grid-cols-1 gap-2 md:grid-cols-3">
            {teacherProgramFavoriteActions.map((item) => (
              <button
                key={`program-favorite-${item.id}`}
                onClick={() => applyProgramPreset({
                  definitionId: item.definitionId,
                  title: item.definitionTitle || item.actionTitle,
                  targetType: item.targetType === 'فصل / شركة' ? 'company' : item.targetType === 'طالب واحد' ? 'student' : item.targetType === 'مجموعة' ? 'group' : 'school',
                  targetLabel: item.targetLabel || '',
                  targetCount: item.targetCount || '1',
                  note: item.note || '',
                })}
                className="rounded-2xl border border-amber-200 bg-white px-4 py-3 text-right text-sm font-black text-amber-900 transition hover:bg-amber-100"
              >
                <div>{item.definitionTitle || item.actionTitle || 'برنامج سابق'}</div>
                <div className="mt-1 text-xs opacity-75">{item.targetLabel || item.targetType || 'بدون مستهدف'} • {item.targetCount || 1}</div>
              </button>
            ))}
          </div>
        </div>
      ) : null}

      <div className="rounded-3xl bg-white p-5 ring-1 ring-slate-200">
        <div className="flex items-center justify-between gap-3">
          <div>
            <div className="font-bold text-slate-800">تفاصيل البرنامج</div>
            <div className="text-sm text-slate-500">نفس واجهة المعلم الجوالية ولكن بمسار برنامج أوضح وأسهل في التنفيذ.</div>
          </div>
          {selectedDefinition ? <Badge tone="blue">{selectedDefinition.points > 0 ? `+${selectedDefinition.points}` : selectedDefinition.points} نقطة</Badge> : null}
        </div>

        <div className="mt-4">
          <Input label="عنوان البرنامج" value={programTitle} onChange={(e) => setProgramTitle(e.target.value)} placeholder="مثال: برنامج انضباط الطابور الصباحي" />
        </div>

        <div className={cx('mt-4 grid gap-3', compactMode ? 'grid-cols-1' : 'md:grid-cols-2')}>
          {(currentDefinitions || []).map((item) => (
            <button key={item.id} onClick={() => setDefinitionId(item.id)} className={cx('rounded-3xl border p-4 text-right transition', String(definitionId) === String(item.id) ? 'border-sky-700 bg-sky-700 text-white shadow-lg' : 'border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100')}>
              <div className="font-black">{item.title}</div>
              <div className={cx('mt-1 text-xs leading-6', String(definitionId) === String(item.id) ? 'text-white/80' : 'text-slate-500')}>{item.description || 'بدون وصف إضافي'}</div>
              <div className="mt-2 text-sm font-black">{item.points > 0 ? `+${item.points}` : item.points} نقطة</div>
            </button>
          ))}
        </div>

        <div className="mt-5 grid grid-cols-2 gap-2 md:grid-cols-4">
          {programTargetOptions.map((item) => (
            <button key={item.key} onClick={() => setProgramTargetType(item.key)} className={cx('rounded-2xl px-4 py-3 text-sm font-bold', programTargetType === item.key ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-700')}>{item.label}</button>
          ))}
        </div>

        {programTargetType === 'company' ? (
          compactMode ? renderProgramCompanyButtons() : (
            <div className="mt-4">
              <Select label="الفصل / الشركة المستهدفة" value={programCompanyId} onChange={(e) => setProgramCompanyId(e.target.value)}>
                {programCompanies.map((company) => <option key={company.id} value={company.rawId || company.id}>{company.name} - {company.className}</option>)}
              </Select>
            </div>
          )
        ) : null}

        {programTargetType === 'student' ? (
          <div className="mt-4 rounded-2xl bg-slate-50 p-4 ring-1 ring-slate-200">
            <Input label="رقم الطالب أو الهوية أو الاسم" value={programStudentQuery} onChange={(e) => setProgramStudentQuery(e.target.value)} placeholder="حدد الطالب المستهدف يدويًا" />
            <button onClick={resolveProgramStudent} className="mt-3 rounded-2xl bg-sky-700 px-4 py-3 text-sm font-bold text-white">تحديد الطالب</button>
            {programStudent ? renderStudentCard(programStudent) : null}
          </div>
        ) : null}

        <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
          <Input label="عدد المستهدفين" type="number" value={programTargetCount} onChange={(e) => setProgramTargetCount(e.target.value)} placeholder="مثال: 25" />
          <Input label="وصف المستهدفين / اسم المجموعة" value={programTargetLabel} onChange={(e) => setProgramTargetLabel(e.target.value)} placeholder="مثال: طلاب الصف الأول متوسط" />
        </div>

        <div className="mt-4">
          <label className="block">
            <span className="mb-2 block text-sm font-bold text-slate-700">تفاصيل التنفيذ</span>
            <textarea value={note} onChange={(e) => setNote(e.target.value)} className="min-h-[110px] w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none" placeholder="نوع البرنامج، الهدف، الآلية، الأثر، وأي ملاحظات أخرى" />
          </label>
        </div>

        <div className="mt-4 rounded-2xl bg-sky-50 p-4 ring-1 ring-sky-200">
          <div className="flex items-center justify-between gap-3">
            <div>
              <div className="font-bold text-slate-800">ملخص البرنامج قبل الحفظ</div>
              <div className="mt-1 text-sm text-slate-500">راجع الأثر والمستهدفين والشواهد قبل الاعتماد النهائي.</div>
            </div>
            {selectedDefinition ? <Badge tone="blue">{selectedDefinition.title}</Badge> : null}
          </div>
          <div className="mt-4 grid grid-cols-2 gap-3 text-sm md:grid-cols-4">
            <div className="rounded-2xl bg-white p-3 ring-1 ring-sky-100"><div className="text-xs text-slate-500">العنوان</div><div className="mt-1 font-black text-slate-800">{programTitle || 'بدون عنوان بعد'}</div></div>
            <div className="rounded-2xl bg-white p-3 ring-1 ring-sky-100"><div className="text-xs text-slate-500">المستهدف</div><div className="mt-1 font-black text-slate-800">{programTargetOptions.find((item) => item.key === programTargetType)?.label || '—'}</div></div>
            <div className="rounded-2xl bg-white p-3 ring-1 ring-sky-100"><div className="text-xs text-slate-500">عدد المستفيدين</div><div className="mt-1 font-black text-slate-800">{programTargetCount || '1'}</div></div>
            <div className="rounded-2xl bg-white p-3 ring-1 ring-sky-100"><div className="text-xs text-slate-500">نقاط المعلم</div><div className="mt-1 font-black text-slate-800">{selectedDefinition?.points > 0 ? `+${selectedDefinition.points}` : selectedDefinition?.points || 0}</div></div>
          </div>
        </div>

        <div className="mt-4 rounded-2xl bg-slate-50 p-4 ring-1 ring-slate-200">
          <div className="font-bold text-slate-800">الشواهد</div>
          <div className="mt-1 text-sm text-slate-500">أرفق صورًا أو لقطات كشواهد للبرنامج، وسيتم رفعها إلى التخزين المركزي وربطها بالسجل.</div>
          <div className="mt-3 flex flex-wrap gap-3">
            <label className="inline-flex cursor-pointer items-center gap-2 rounded-2xl bg-sky-700 px-4 py-3 text-sm font-bold text-white">
              <Upload className="h-4 w-4" /> رفع الشواهد
              <input type="file" accept="image/*" multiple capture="environment" className="hidden" onChange={handleProgramEvidenceFiles} />
            </label>
            {programEvidenceFiles.length ? <Badge tone="blue">{programEvidenceFiles.length} شاهد</Badge> : <Badge tone="slate">بدون شواهد</Badge>}
          </div>
          {programEvidencePreviews.length ? (
            <div className="mt-4 grid grid-cols-2 gap-3 md:grid-cols-4">
              {programEvidencePreviews.map((item) => <img key={item.id} src={item.url} alt={item.name} className="h-28 w-full rounded-2xl object-cover ring-1 ring-slate-200" />)}
            </div>
          ) : null}
        </div>

        <button onClick={submitProgram} disabled={busy} className={cx("mt-4 w-full rounded-2xl px-5 py-3 text-sm font-bold", busy ? 'bg-slate-200 text-slate-500' : 'bg-sky-700 text-white')}>{busy ? 'جارٍ حفظ البرنامج...' : 'حفظ البرنامج'}</button>
      </div>
    </div>
  );

  if (compactMode) {
    const activeAction = actionModes.find((item) => item.key === actionType) || actionModes[0];
    const ActiveIcon = activeAction.icon;
    return (
      <div className="space-y-5">
        {teacherView === "home" ? (
          <>
            {renderExecutionBanner()}
            <div className="overflow-hidden rounded-[34px] bg-gradient-to-br from-slate-950 via-sky-900 to-cyan-700 p-5 text-white shadow-2xl">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="text-sm font-bold text-white/80">واجهة المعلم التنفيذية</div>
                  <div className="mt-2 text-2xl font-black">مرحبًا {currentUser.fullName || currentUser.username}</div>
                  <div className="mt-2 text-sm leading-7 text-white/80">واجهة جوالية سريعة بثلاثة أزرار رئيسية فقط، مع اختصارات آخر طالب وآخر برنامج ومؤشرات أداء فورية.</div>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <button onClick={() => setTeacherFastMode((value) => !value)} className={cx('rounded-2xl px-3 py-2 text-xs font-black ring-1 transition', teacherFastMode ? 'bg-amber-300 text-slate-950 ring-amber-200' : 'bg-white/10 text-white ring-white/10')}>{teacherFastMode ? 'الوضع الخاطف مفعل' : 'تفعيل الوضع الخاطف'}</button>
                  <div className="rounded-3xl bg-white/10 p-3 ring-1 ring-white/15">
                    <UserCircle2 className="h-9 w-9" />
                  </div>
                </div>
              </div>
              <div className="mt-5 grid grid-cols-2 gap-3">
                <div className="rounded-3xl bg-white/10 p-3 ring-1 ring-white/10"><div className="text-xs text-white/70">نقاطي</div><div className="mt-1 text-2xl font-black">{currentUser.points || 0}</div><div className="mt-1 text-[11px] text-white/60">الرصيد الحالي للمعلم</div></div>
                <div className="rounded-3xl bg-white/10 p-3 ring-1 ring-white/10"><div className="text-xs text-white/70">عملياتي اليوم</div><div className="mt-1 text-2xl font-black">{teacherStats.total}</div><div className="mt-1 text-[11px] text-white/60">مكافآت وخصومات وبرامج</div></div>
                <div className="rounded-3xl bg-white/10 p-3 ring-1 ring-white/10"><div className="text-xs text-white/70">المكافآت</div><div className="mt-1 text-2xl font-black">{teacherStats.rewards}</div><div className="mt-1 text-[11px] text-white/60">منفذة من حسابك</div></div>
                <div className="rounded-3xl bg-white/10 p-3 ring-1 ring-white/10"><div className="text-xs text-white/70">البرامج</div><div className="mt-1 text-2xl font-black">{teacherStats.programs}</div><div className="mt-1 text-[11px] text-white/60">محفوظة أو معتمدة</div></div>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4">
              {actionModes.map((item) => {
                const Icon = item.icon;
                const tone = item.key === 'reward' ? 'from-emerald-500 to-emerald-600' : item.key === 'violation' ? 'from-rose-500 to-rose-600' : 'from-sky-600 to-indigo-600';
                return (
                  <button key={item.key} onClick={() => openTeacherAction(item.key)} className={`rounded-[28px] bg-gradient-to-r ${tone} p-5 text-right text-white shadow-lg transition hover:scale-[1.01]`}>
                    <div className="flex items-center justify-between gap-4">
                      <div>
                        <div className="text-2xl font-black">{item.label}</div>
                        <div className="mt-2 text-sm leading-7 text-white/85">{item.key === 'reward' ? 'افتح الكاميرا مباشرة ثم اختر نوع المكافأة.' : item.key === 'violation' ? 'افتح الكاميرا مباشرة ثم اختر سبب الخصم أو المخالفة.' : 'سجّل برنامجك وشواهده والمستهدفين بسهولة.'}</div>
                      </div>
                      <div className="rounded-3xl bg-white/15 p-4 ring-1 ring-white/15"><Icon className="h-7 w-7" /></div>
                    </div>
                  </button>
                );
              })}
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div className="rounded-3xl bg-white p-4 ring-1 ring-slate-200"><div className="text-xs text-slate-500">مكافآت</div><div className="mt-2 text-2xl font-black text-emerald-700">{teacherStats.rewards}</div></div>
              <div className="rounded-3xl bg-white p-4 ring-1 ring-slate-200"><div className="text-xs text-slate-500">خصومات</div><div className="mt-2 text-2xl font-black text-rose-700">{teacherStats.violations}</div></div>
              <div className="rounded-3xl bg-white p-4 ring-1 ring-slate-200"><div className="text-xs text-slate-500">برامج</div><div className="mt-2 text-2xl font-black text-sky-700">{teacherStats.programs}</div></div>
            </div>

            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
              <button onClick={fillFromLastStudentAction} disabled={!teacherLastStudentAction} className={cx('rounded-[28px] p-5 text-right ring-1 transition', teacherLastStudentAction ? 'bg-white text-slate-900 ring-slate-200 hover:bg-slate-50' : 'bg-slate-100 text-slate-400 ring-slate-200')}>
                <div className="text-sm font-bold text-slate-500">اختصار سريع</div>
                <div className="mt-1 text-xl font-black">آخر طالب</div>
                <div className="mt-2 text-sm leading-7">{teacherLastStudentAction ? `${teacherLastStudentAction.studentName || teacherLastStudentAction.targetLabel} • ${teacherLastStudentAction.definitionTitle || 'إجراء سابق'}` : 'سيظهر هنا آخر طالب تعاملت معه'}</div>
              </button>
              <button onClick={fillProgramFromLastAction} disabled={!teacherLastProgramAction} className={cx('rounded-[28px] p-5 text-right ring-1 transition', teacherLastProgramAction ? 'bg-white text-slate-900 ring-slate-200 hover:bg-slate-50' : 'bg-slate-100 text-slate-400 ring-slate-200')}>
                <div className="text-sm font-bold text-slate-500">تكرار ذكي</div>
                <div className="mt-1 text-xl font-black">آخر برنامج</div>
                <div className="mt-2 text-sm leading-7">{teacherLastProgramAction ? `${teacherLastProgramAction.definitionTitle || 'برنامج'} • ${teacherLastProgramAction.targetLabel || 'مستهدف سابق'}` : 'سيظهر هنا آخر برنامج حفظته'}</div>
              </button>
            </div>

            <div className="grid grid-cols-4 gap-2 rounded-[28px] bg-slate-900 p-2 text-white shadow-lg">
              <button onClick={goTeacherHome} className={cx('rounded-2xl px-3 py-3 text-xs font-black transition', teacherView === 'home' ? 'bg-white text-slate-900' : 'bg-white/10 text-white')}>الرئيسية</button>
              <button onClick={() => switchTeacherActionKeepingStudent('reward')} className={cx('rounded-2xl px-3 py-3 text-xs font-black transition', actionType === 'reward' && teacherView !== 'home' ? 'bg-emerald-400 text-slate-950' : 'bg-white/10 text-white')}>مكافأة</button>
              <button onClick={() => switchTeacherActionKeepingStudent('violation')} className={cx('rounded-2xl px-3 py-3 text-xs font-black transition', actionType === 'violation' && teacherView !== 'home' ? 'bg-rose-400 text-slate-950' : 'bg-white/10 text-white')}>خصم</button>
              <button onClick={() => openTeacherAction('program')} className={cx('rounded-2xl px-3 py-3 text-xs font-black transition', actionType === 'program' && teacherView !== 'home' ? 'bg-sky-400 text-slate-950' : 'bg-white/10 text-white')}>برنامج</button>
            </div>

            <div className="rounded-[28px] bg-white p-5 ring-1 ring-slate-200">
              <div className="flex items-center justify-between gap-3">
                <div className="font-black text-slate-800">آخر إجراءاتي</div>
                <Badge tone="slate">{teacherRecentActions.length}</Badge>
              </div>
              <div className="mt-4 space-y-3">
                {teacherRecentActions.length ? teacherRecentActions.map((item) => (
                  <div key={item.id} className="rounded-2xl bg-slate-50 p-4 ring-1 ring-slate-200">
                    <div className="flex items-center justify-between gap-3">
                      <div className="font-bold text-slate-800">{item.studentName || item.targetLabel || item.definitionTitle || 'إجراء'}</div>
                      <Badge tone={item.actionType === 'reward' ? 'green' : item.actionType === 'violation' ? 'rose' : 'blue'}>{item.actionType === 'reward' ? 'مكافأة' : item.actionType === 'violation' ? 'خصم' : 'برنامج'}</Badge>
                    </div>
                    <div className="mt-2 text-sm text-slate-500">{item.definitionTitle || item.note || 'بدون تفاصيل إضافية'}</div>
                    <div className="mt-2 text-xs text-slate-400">{formatDateTime(item.createdAt)}</div>
                  </div>
                )) : <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-4 py-8 text-center text-sm text-slate-500">لا توجد عمليات مسجلة لك بعد.</div>}
              </div>
            </div>
          </>
        ) : (
          <>
            {renderExecutionBanner()}
            <div className="rounded-[28px] bg-white p-5 ring-1 ring-slate-200">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3">
                  <div className={cx('flex h-14 w-14 items-center justify-center rounded-3xl', actionType === 'reward' ? 'bg-emerald-100 text-emerald-700' : actionType === 'violation' ? 'bg-rose-100 text-rose-700' : 'bg-sky-100 text-sky-700')}>
                    <ActiveIcon className="h-7 w-7" />
                  </div>
                  <div>
                    <div className="text-sm font-bold text-slate-500">شاشة التنفيذ السريع</div>
                    <div className="mt-1 text-2xl font-black text-slate-900">{activeAction.label}</div>
                    <div className="mt-2 text-sm leading-7 text-slate-500">{actionType === 'program' ? 'سجّل البرنامج مباشرة من الجوال مع الشواهد والمستهدفين.' : 'جاهز للتنفيذ المتتابع: الكاميرا تبدأ مباشرة، وبعد نجاح العملية يمكنك مسح الطالب التالي دون الرجوع للرئيسية.'}</div>
                  </div>
                </div>
                <button onClick={goTeacherHome} className="rounded-2xl bg-slate-100 px-4 py-3 text-sm font-black text-slate-700">رجوع</button>
              </div>
              {actionType !== 'program' ? (
                <div className="mt-4 grid grid-cols-1 gap-3 rounded-[26px] bg-slate-950 p-3 text-white shadow-lg sm:grid-cols-[1.1fr,0.9fr]">
                  <div className="rounded-3xl bg-white/10 px-4 py-3 ring-1 ring-white/10">
                    <div className="text-[11px] font-bold text-white/65">السياق الحالي</div>
                    <div className="mt-1 text-base font-black">{teacherContextLabel}</div>
                    <div className="mt-2 text-xs text-white/70">{selectedSchool?.name || 'المدرسة الحالية'}{identifiedStudent ? ` • ${identifiedStudent.className || identifiedStudent.companyName || 'الفصل الحالي'}` : ' • جهّز الطالب أولًا ثم بدّل بين المكافأة والخصم دون إعادة مسح.'}</div>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <button onClick={() => switchTeacherActionKeepingStudent('reward')} className={cx('rounded-2xl px-3 py-3 text-sm font-black transition', actionType === 'reward' ? 'bg-emerald-400 text-slate-950' : 'bg-white/10 text-white')}>مكافأة</button>
                    <button onClick={() => switchTeacherActionKeepingStudent('violation')} className={cx('rounded-2xl px-3 py-3 text-sm font-black transition', actionType === 'violation' ? 'bg-rose-400 text-slate-950' : 'bg-white/10 text-white')}>خصم</button>
                    <button onClick={continueOnSameStudent} disabled={!identifiedStudent} className={cx('rounded-2xl px-3 py-3 text-xs font-black transition', identifiedStudent ? 'bg-white/10 text-white' : 'cursor-not-allowed bg-white/5 text-white/40')}>نفس الطالب</button>
                    <button onClick={continueSequentialAction} className="rounded-2xl bg-white px-3 py-3 text-xs font-black text-slate-900">الطالب التالي</button>
                  </div>
                </div>
              ) : (
                <div className="mt-4 rounded-[26px] bg-sky-50 p-4 text-sm text-sky-900 ring-1 ring-sky-100">
                  <div className="font-black">{selectedSchool?.name || 'المدرسة الحالية'}</div>
                  <div className="mt-1 text-xs text-sky-800/80">صفحة برامج المعلم مستقلة عن إعدادات المدارس، ويمكنك تعبئة البرنامج ثم حفظه أو اعتماده حسب السياسة المحددة.</div>
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-3xl bg-slate-900 px-4 py-3 text-white shadow-lg">
                <div className="text-[11px] font-bold text-white/65">وضع التنفيذ</div>
                <div className="mt-1 text-sm font-black">{teacherFastMode ? 'خاطف ومختصر' : 'كامل ومفصل'}</div>
              </div>
              <button onClick={() => setTeacherFastMode((value) => !value)} className={cx('rounded-3xl px-4 py-3 text-sm font-black ring-1 transition', teacherFastMode ? 'bg-amber-50 text-amber-900 ring-amber-200' : 'bg-slate-50 text-slate-700 ring-slate-200')}>
                {teacherFastMode ? 'التحويل للوضع الكامل' : 'تفعيل الوضع الخاطف'}
              </button>
            </div>

            {actionType !== 'program' ? (
              <>
                {renderQuickIdentifyPanel()}
                {renderStudentCard(identifiedStudent)}
                {renderQuickActionButtons()}
              </>
            ) : renderProgramForm()}

            <div className="sticky bottom-3 z-20 mt-4 rounded-[30px] bg-slate-950/95 p-2 text-white shadow-2xl backdrop-blur">
              <div className="grid grid-cols-4 gap-2">
                <button onClick={goTeacherHome} className="rounded-2xl px-3 py-3 text-xs font-black bg-white/10">الرئيسية</button>
                <button onClick={() => setIdentifyMethod('barcode')} className={cx('rounded-2xl px-3 py-3 text-xs font-black', identifyMethod === 'barcode' ? 'bg-emerald-400 text-slate-950' : 'bg-white/10')}>باركود</button>
                <button onClick={() => setIdentifyMethod('face')} className={cx('rounded-2xl px-3 py-3 text-xs font-black', identifyMethod === 'face' ? 'bg-sky-400 text-slate-950' : 'bg-white/10')}>وجه</button>
                <button onClick={() => setIdentifyMethod('manual')} className={cx('rounded-2xl px-3 py-3 text-xs font-black', identifyMethod === 'manual' ? 'bg-amber-300 text-slate-950' : 'bg-white/10')}>يدوي</button>
              </div>
            </div>
          </>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <SectionCard title={compactMode ? 'مهام المعلم السريعة' : 'إجراءات الطلاب'} icon={ClipboardCheck} action={<Badge tone="blue">{getRoleLabel(currentUser.role)}</Badge>}>
        <div className={compactMode ? 'space-y-5' : 'grid grid-cols-1 gap-6 xl:grid-cols-[1.1fr_.9fr]'}>
          <div className="space-y-5">
            <div className={cx('grid gap-3', compactMode ? 'grid-cols-3' : 'md:grid-cols-3')}>
              {actionModes.map((item) => {
                const Icon = item.icon;
                return (
                  <button key={item.key} onClick={() => setActionType(item.key)} className={cx('rounded-3xl border p-4 text-right transition', actionType === item.key ? 'border-slate-900 bg-slate-900 text-white shadow-lg' : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50')}>
                    <div className="flex items-center justify-between gap-3">
                      <div className={cx('flex h-11 w-11 items-center justify-center rounded-2xl', actionType === item.key ? 'bg-white/15' : item.tone === 'green' ? 'bg-emerald-100 text-emerald-700' : item.tone === 'rose' ? 'bg-rose-100 text-rose-700' : 'bg-sky-100 text-sky-700')}>
                        <Icon className="h-5 w-5" />
                      </div>
                      <div className="text-sm font-black">{item.label}</div>
                    </div>
                    {!compactMode ? <div className={cx('mt-3 text-xs leading-6', actionType === item.key ? 'text-white/80' : 'text-slate-500')}>{item.description}</div> : null}
                  </button>
                );
              })}
            </div>

            {actionType !== 'program' ? renderQuickIdentifyPanel() : renderProgramForm()}

            {actionType !== 'program' ? (compactMode ? renderQuickActionButtons() : (
              <div className="rounded-3xl bg-white p-5 ring-1 ring-slate-200">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <div className="font-bold text-slate-800">{actionModes.find((item) => item.key === actionType)?.label || 'الإجراء'}</div>
                    <div className="text-sm text-slate-500">هذه البنود تأتي من إعدادات مدير المدرسة أو الأدمن</div>
                  </div>
                  {selectedDefinition ? <Badge tone={actionType === 'violation' ? 'rose' : 'green'}>{selectedDefinition.points > 0 ? `+${selectedDefinition.points}` : selectedDefinition.points} نقطة</Badge> : null}
                </div>
                <div className="mt-4 grid gap-3 md:grid-cols-2">
                  <Select label="البند المعتمد" value={definitionId} onChange={(e) => setDefinitionId(e.target.value)}>
                    {currentDefinitions.map((item) => <option key={item.id} value={item.id}>{item.title}</option>)}
                  </Select>
                  <div className="rounded-2xl bg-slate-50 p-4 ring-1 ring-slate-200">
                    <div className="text-sm text-slate-500">وصف البند</div>
                    <div className="mt-2 text-sm leading-7 text-slate-700">{selectedDefinition?.description || 'بدون وصف إضافي'}</div>
                  </div>
                </div>
                <div className="mt-4">
                  <label className="block">
                    <span className="mb-2 block text-sm font-bold text-slate-700">ملاحظة</span>
                    <textarea value={note} onChange={(e) => setNote(e.target.value)} className="min-h-[90px] w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none" placeholder="سبب الإجراء أو أي ملاحظة تحفظ في السجل" />
                  </label>
                </div>
                <button onClick={() => applyAction(selectedDefinition)} disabled={!identifiedStudent || !selectedDefinition} className={cx('mt-4 w-full rounded-2xl px-5 py-3 text-sm font-bold', !identifiedStudent || !selectedDefinition ? 'bg-slate-200 text-slate-500' : actionType === 'reward' ? 'bg-emerald-600 text-white' : 'bg-rose-600 text-white')}>
                  {actionType === 'reward' ? 'تنفيذ المكافأة' : 'تنفيذ الخصم'}
                </button>
              </div>
            )) : null}
          </div>

          <div className="space-y-5">
            <div className="rounded-3xl bg-white p-5 ring-1 ring-slate-200">
              <div className="font-bold text-slate-800">{actionType === 'program' ? 'ملخص الاستهداف' : 'الطالب المحدد'}</div>
              {actionType === 'program' ? (
                programTargetType === 'student' && programStudent ? renderStudentCard(programStudent) : (
                  <div className="mt-4 rounded-3xl bg-slate-50 p-4 ring-1 ring-slate-200">
                    <div className="text-sm font-bold text-slate-700">النوع: {programTargetOptions.find((item) => item.key === programTargetType)?.label || '—'}</div>
                    <div className="mt-2 text-sm text-slate-500">التفصيل: {programTargetType === 'company' ? (programCompanies.find((item) => String(item.rawId || item.id) === String(programCompanyId))?.name || '—') : (programTargetLabel || '—')}</div>
                    <div className="mt-2 text-sm text-slate-500">عدد المستهدفين: {programTargetCount || '—'}</div>
                  </div>
                )
              ) : renderStudentCard(identifiedStudent)}
            </div>

            <div className="rounded-3xl bg-white p-5 ring-1 ring-slate-200">
              <div className="font-bold text-slate-800">آخر الإجراءات في المدرسة</div>
              <div className="mt-4 space-y-3">
                {latestActions.length ? latestActions.map((item) => (
                  <div key={item.id} className="rounded-2xl bg-slate-50 p-4 ring-1 ring-slate-200">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <div className="font-bold text-slate-800">{item.student}</div>
                        <div className="mt-1 text-xs text-slate-500">{item.actionTitle} • {item.date} • {item.time}</div>
                      </div>
                      <Badge tone={item.actionType === 'reward' ? 'green' : item.actionType === 'violation' ? 'rose' : 'blue'}>{item.deltaPoints > 0 ? `+${item.deltaPoints}` : item.deltaPoints}</Badge>
                    </div>
                    <div className="mt-2 text-xs text-slate-500">بواسطة: {item.actorName} • {getRoleLabel(item.actorRole)} • {item.method}</div>
                    {item.note ? <div className="mt-2 text-sm text-slate-600">{item.note}</div> : null}
                  </div>
                )) : <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-4 py-8 text-center text-sm text-slate-500">لا توجد إجراءات مسجلة بعد.</div>}
              </div>
            </div>
          </div>
        </div>
      </SectionCard>
    </div>
  );
}

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
      <SectionCard title="النقاط والترتيب" icon={Trophy}>
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

function ReportsPage({ schools, scanLog, actionLog, selectedSchool, settings, executiveReport, onExportAttendance, onExportStudents, onExportSchools, onExportBackup }) {
  const schoolLogs = scanLog.filter((item) => item.schoolId === selectedSchool.id);
  const schoolActions = (actionLog || []).filter((item) => item.schoolId === selectedSchool.id);
  const schoolStudents = getUnifiedSchoolStudents(selectedSchool, { includeArchived: false, preferStructure: true });
  const summary = executiveReport?.summary || {
    totalStudents: schoolStudents.length,
    presentToday: new Set(schoolLogs.filter((item) => item.isoDate === getTodayIso()).map((item) => item.studentId)).size,
    attendanceRate: schoolStudents.length ? Math.round((new Set(schoolLogs.filter((item) => item.isoDate === getTodayIso()).map((item) => item.studentId)).size / schoolStudents.length) * 100) : 0,
    earlyToday: schoolLogs.filter((item) => item.isoDate === getTodayIso() && item.result.includes('مبكر')).length,
    ontimeToday: schoolLogs.filter((item) => item.isoDate === getTodayIso() && item.result.includes('في الوقت')).length,
    lateToday: schoolLogs.filter((item) => item.isoDate === getTodayIso() && item.result.includes('تأخر')).length,
    rewardsToday: schoolActions.filter((item) => item.isoDate === getTodayIso() && item.actionType === 'reward').length,
    violationsToday: schoolActions.filter((item) => item.isoDate === getTodayIso() && item.actionType === 'violation').length,
    programsToday: schoolActions.filter((item) => item.isoDate === getTodayIso() && item.actionType === 'program').length,
  };
  const topStudents = executiveReport?.topStudents || [...schoolStudents].sort((a, b) => b.points - a.points).slice(0, 5).map((student, index) => ({ ...student, rank: index + 1, companyName: getStudentGroupingLabel(student, selectedSchool) }));
  const topCompanies = executiveReport?.topCompanies || [...getUnifiedCompanyRows(selectedSchool, { preferStructure: true })].sort((a, b) => b.points - a.points).slice(0, 5).map((company, index) => ({ ...company, rank: index + 1 }));
  const teacherActivity = executiveReport?.teacherActivity || Object.values(schoolActions.reduce((acc, item) => {
    const key = `${item.actorName}|${item.actorRole}`;
    const row = acc[key] || { actorName: item.actorName, actorRole: item.actorRole, count: 0, rewardCount: 0, violationCount: 0, programCount: 0 };
    row.count += 1;
    if (item.actionType === 'reward') row.rewardCount += 1;
    if (item.actionType === 'violation') row.violationCount += 1;
    if (item.actionType === 'program') row.programCount += 1;
    acc[key] = row;
    return acc;
  }, {})).sort((a, b) => b.count - a.count).slice(0, 5);

  return (
    <div className="space-y-6">
      <SectionCard title="التقارير التنفيذية" icon={LineChart} action={<Badge tone="blue">{selectedSchool?.name || "—"}</Badge>}>
        {Array.isArray(selectedSchool?.structure?.classrooms) && selectedSchool.structure.classrooms.length ? <div className="mb-4 rounded-2xl border border-dashed border-violet-200 bg-violet-50 p-4 text-sm font-bold text-violet-800">التقارير هنا تعتمد الآن على <span className="font-black">الهيكل المدرسي</span> كمصدر افتراضي للطلاب والفصول.</div> : null}
        <div className="grid grid-cols-2 gap-4 xl:grid-cols-6">
          <SummaryBox label="طلاب المدرسة" value={summary.totalStudents} />
          <SummaryBox label="الحاضرون اليوم" value={summary.presentToday} color="text-emerald-700" />
          <SummaryBox label="نسبة الحضور" value={`${summary.attendanceRate}%`} color="text-sky-700" />
          <SummaryBox label="المكافآت اليوم" value={summary.rewardsToday} color="text-emerald-700" />
          <SummaryBox label="الخصومات اليوم" value={summary.violationsToday} color="text-rose-700" />
          <SummaryBox label="البرامج اليوم" value={summary.programsToday} color="text-violet-700" />
        </div>
        <div className="mt-6 grid grid-cols-1 gap-6 xl:grid-cols-3">
          <div className="xl:col-span-2 rounded-3xl bg-slate-50 p-5 ring-1 ring-slate-200">
            <div className="mb-4 font-bold text-slate-800">مؤشرات الحضور والالتزام اليومي</div>
            <div className="grid grid-cols-2 gap-3 md:grid-cols-5">
              <SummaryBox label="الإجمالي" value={schoolLogs.length} />
              <SummaryBox label="مبكر" value={summary.earlyToday} color="text-emerald-700" />
              <SummaryBox label="في الوقت" value={summary.ontimeToday || 0} color="text-sky-700" />
              <SummaryBox label="متأخر" value={summary.lateToday} color="text-amber-700" />
              <SummaryBox label="برامج" value={summary.programsToday} color="text-violet-700" />
            </div>
            <div className="mt-6 h-80 rounded-3xl bg-white p-4 ring-1 ring-slate-200">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={executiveReport?.attendanceTrend || summarizeSchoolLiveState(selectedSchool, scanLog, actionLog).attendanceTrend}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="day" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="attendance" fill="#0ea5e9" radius={[8,8,0,0]} />
                  <Bar dataKey="early" fill="#10b981" radius={[8,8,0,0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
          <div className="rounded-3xl bg-white p-5 ring-1 ring-slate-200">
            <div className="mb-3 font-bold text-slate-800">تصدير سريع</div>
            <div className="space-y-3">
              <button onClick={onExportAttendance} className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-slate-100 px-4 py-3 font-bold text-slate-700"><Download className="h-4 w-4" /> تقرير الحضور CSV</button>
              <button onClick={onExportStudents} className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-slate-100 px-4 py-3 font-bold text-slate-700"><Download className="h-4 w-4" /> تقرير الطلاب CSV</button>
              <button onClick={onExportSchools} className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-slate-100 px-4 py-3 font-bold text-slate-700"><Download className="h-4 w-4" /> تقرير المدارس CSV</button>
              <button onClick={onExportBackup} className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-sky-700 px-4 py-3 font-bold text-white"><ClipboardCheck className="h-4 w-4" /> نسخ احتياطي JSON</button>
            </div>
          </div>
        </div>
        <div className="mt-6 grid grid-cols-1 gap-6 xl:grid-cols-3">
          <div className="rounded-3xl bg-slate-50 p-5 ring-1 ring-slate-200">
            <div className="mb-4 font-bold text-slate-800">أعلى الطلاب</div>
            <div className="space-y-3">{topStudents.map((student) => <div key={student.id} className="rounded-2xl bg-white p-4 ring-1 ring-slate-200"><div className="flex items-center justify-between gap-3"><div><div className="font-black">{student.rank}. {student.name}</div><div className="text-sm text-slate-500">{student.companyName}</div></div><Badge tone="green">{student.points} نقطة</Badge></div></div>)}</div>
          </div>
          <div className="rounded-3xl bg-slate-50 p-5 ring-1 ring-slate-200">
            <div className="mb-4 font-bold text-slate-800">ترتيب الشركات</div>
            <div className="space-y-3">{topCompanies.map((company) => <div key={company.id} className="rounded-2xl bg-white p-4 ring-1 ring-slate-200"><div className="flex items-center justify-between gap-3"><div><div className="font-black">{company.rank}. {company.name}</div><div className="text-sm text-slate-500">{company.className}</div></div><Badge tone="blue">{company.points} نقطة</Badge></div></div>)}</div>
          </div>
          <div className="rounded-3xl bg-slate-50 p-5 ring-1 ring-slate-200">
            <div className="mb-4 font-bold text-slate-800">نشاط المعلمين والمشرفين</div>
            <div className="space-y-3">{teacherActivity.length ? teacherActivity.map((item, index) => <div key={`${item.actorName}-${index}`} className="rounded-2xl bg-white p-4 ring-1 ring-slate-200"><div className="font-black">{item.actorName}</div><div className="mt-1 text-sm text-slate-500">{getRoleLabel(item.actorRole)}</div><div className="mt-3 grid grid-cols-4 gap-2 text-center text-xs"><div className="rounded-xl bg-slate-50 p-2"><div className="font-black text-slate-800">{item.count}</div><div className="text-slate-500">إجمالي</div></div><div className="rounded-xl bg-emerald-50 p-2"><div className="font-black text-emerald-700">{item.rewardCount}</div><div className="text-emerald-700">مكافآت</div></div><div className="rounded-xl bg-rose-50 p-2"><div className="font-black text-rose-700">{item.violationCount}</div><div className="text-rose-700">خصومات</div></div><div className="rounded-xl bg-violet-50 p-2"><div className="font-black text-violet-700">{item.programCount}</div><div className="text-violet-700">برامج</div></div></div></div>) : <div className="rounded-2xl bg-white p-4 ring-1 ring-slate-200 text-sm text-slate-500">لا توجد بيانات نشاط كافية بعد.</div>}</div>
          </div>
        </div>
      </SectionCard>
    </div>
  );
}

function SettingsPage({ selectedSchool, settings, attendanceMethod, users, schools, currentUser, onSaveSettings, onRestoreBackup, onResetData, onExportBackup, onImportStudents, onDownloadTemplate, setAttendanceMethod, forcedTab = null, titleOverride = "", descriptionOverride = "" }) {
  const [tab, setTab] = useState(forcedTab || "general");
  const [localSettings, setLocalSettings] = useState(settings);
  const [importMessage, setImportMessage] = useState("");
  const [authTestDraft, setAuthTestDraft] = useState({
    emailTarget: '',
    smsTarget: '',
    whatsappTarget: '',
    otpUserId: '',
    otpDelivery: 'email',
  });
  const [authTestStatus, setAuthTestStatus] = useState({});
  const [authTestBusy, setAuthTestBusy] = useState('');
  const [authLogs, setAuthLogs] = useState([]);
  const [authLogsBusy, setAuthLogsBusy] = useState(false);
  const [authLogFilter, setAuthLogFilter] = useState('all');
  const fileRef = useRef(null);
  const importRef = useRef(null);

  useEffect(() => {
    setLocalSettings(settings);
  }, [settings]);

  useEffect(() => {
    if (forcedTab) setTab(forcedTab);
  }, [forcedTab]);

  useEffect(() => {
    setAuthTestStatus({});
  }, [settings?.auth]);


  const loadAuthLogs = useCallback(async () => {
    if (!currentUser || currentUser.role === 'student') return;
    setAuthLogsBusy(true);
    try {
      const response = await apiRequest('/api/auth/logs?limit=200', { token: getSessionToken() });
      setAuthLogs(Array.isArray(response.logs) ? response.logs : []);
    } catch (error) {
      window.alert(error.message || 'تعذر تحميل سجل الدخول.');
    } finally {
      setAuthLogsBusy(false);
    }
  }, [currentUser]);

  useEffect(() => {
    if (tab === 'auth' && currentUser && currentUser.role !== 'student') {
      loadAuthLogs();
    }
  }, [tab, currentUser, loadAuthLogs]);

  const tabs = forcedTab ? [
    { key: forcedTab, label: forcedTab === 'auth' ? "الدخول والمصادقة" : "الإعدادات" },
  ] : [
    { key: "general", label: "هوية وتشغيل" },
    { key: "attendance", label: "الحضور" },
    { key: "points", label: "النقاط" },
    { key: "actions", label: "الإجراءات" },
    { key: "import", label: "الطلاب" },
    { key: "devices", label: "الأجهزة" },
    ...(currentUser?.role === 'superadmin' ? [{ key: "backup", label: "النسخ الاحتياطي" }] : []),
    { key: "diagnostics", label: "جاهزية المدرسة" },
  ];

  const diagnosticsStudents = useMemo(() => getUnifiedSchoolStudents(selectedSchool, { includeArchived: false, preferStructure: true }), [selectedSchool]);
  const diagnosticsCompanies = useMemo(() => getUnifiedCompanyRows(selectedSchool, { preferStructure: true }), [selectedSchool]);
  const diagnosticsClassrooms = useMemo(() => {
    if (Array.isArray(selectedSchool?.structure?.classrooms) && selectedSchool.structure.classrooms.length) return selectedSchool.structure.classrooms;
    return Array.isArray(selectedSchool?.companies) ? selectedSchool.companies : [];
  }, [selectedSchool]);

  const schoolDiagnostics = [
    { label: "الطلاب", value: diagnosticsStudents.length, tone: "blue" },
    { label: "الفصول", value: diagnosticsClassrooms.length, tone: "violet" },
    { label: "الشركات", value: diagnosticsCompanies.length, tone: "amber" },
    { label: "البوابات", value: selectedSchool?.smartLinks?.gates?.length || 0, tone: "green" },
    { label: "الشاشات", value: selectedSchool?.smartLinks?.screens?.length || 0, tone: "slate" },
  ];

  const readinessChecks = [
    {
      title: "بيانات المدرسة",
      ok: Boolean(selectedSchool?.name && selectedSchool?.city),
      description: selectedSchool?.name ? `المدرسة الحالية: ${selectedSchool.name}` : "لا توجد مدرسة محددة حاليًا.",
    },
    {
      title: "الفصول",
      ok: diagnosticsClassrooms.length > 0,
      description: diagnosticsClassrooms.length > 0 ? `هناك ${diagnosticsClassrooms.length} فصل مهيأ داخل الهيكل المدرسي.` : "لا توجد فصول مهيأة بعد.",
    },
    {
      title: "الطلاب",
      ok: diagnosticsStudents.length > 0,
      description: diagnosticsStudents.length > 0 ? `تمت إضافة ${diagnosticsStudents.length} طالب ويمكن استخدام الحضور والبطاقات.` : "لم تتم إضافة أي طالب بعد.",
    },
    {
      title: "الأجهزة",
      ok: Boolean(localSettings?.devices?.barcodeEnabled || localSettings?.devices?.faceEnabled),
      description: localSettings?.devices?.barcodeEnabled && localSettings?.devices?.faceEnabled ? "الباركود وبصمة الوجه مفعّلان." : localSettings?.devices?.barcodeEnabled ? "الباركود مفعل وبصمة الوجه غير مفعلة." : localSettings?.devices?.faceEnabled ? "بصمة الوجه مفعلة والباركود غير مفعل." : "لا توجد وسيلة حضور مفعلة حاليًا.",
    },
    {
      title: "الروابط الذكية",
      ok: ((selectedSchool?.smartLinks?.gates?.length || 0) + (selectedSchool?.smartLinks?.screens?.length || 0)) > 0,
      description: ((selectedSchool?.smartLinks?.gates?.length || 0) + (selectedSchool?.smartLinks?.screens?.length || 0)) > 0 ? "هناك بوابات أو شاشات تم توليدها." : "لم يتم توليد أي بوابة أو شاشة بعد.",
    },
  ];

  const authTargeting = localSettings.auth?.targeting || { applyScope: 'all', selectedRoleKeys: [], selectedUserIds: [], excludedUserIds: [], forceForSelected: false };
  const canEditGlobalIdentity = currentUser?.role === 'superadmin';
  const authManagedUsers = useMemo(() => (users || []).map((user) => ({ ...user, schoolName: schools.find((school) => Number(school.id) === Number(user.schoolId))?.name || 'بدون مدرسة' })), [users, schools]);
  const handleBrandLogoUpload = async (type, file) => {
    if (!file) return;
    const dataUrl = await fileToDataUrl(file);
    setLocalSettings((prev) => ({
      ...prev,
      branding: {
        ...(prev.branding || {}),
        [type]: dataUrl,
      },
    }));
  };
  const clearBrandLogo = (type) => {
    setLocalSettings((prev) => ({
      ...prev,
      branding: {
        ...(prev.branding || {}),
        [type]: '',
      },
    }));
  };
  const toggleAuthTargetListValue = (key, value) => {
    const currentList = Array.isArray(authTargeting?.[key]) ? authTargeting[key] : [];
    const nextList = currentList.includes(value) ? currentList.filter((item) => item !== value) : [...currentList, value];
    setLocalSettings({ ...localSettings, auth: { ...localSettings.auth, targeting: { ...authTargeting, [key]: nextList } } });
  };
  const filteredAuthLogs = useMemo(() => authLogs.filter((entry) => {
    if (authLogFilter === 'all') return true;
    if (authLogFilter === 'success') return ['login', 'auth_request_otp_success', 'auth_verify_otp_success'].includes(entry.action);
    if (authLogFilter === 'failed') return ['auth_login_failed', 'auth_request_otp_failed', 'auth_verify_otp_failed'].includes(entry.action);
    if (authLogFilter === 'blocked') return ['auth_login_blocked', 'auth_request_otp_blocked', 'auth_verify_otp_blocked'].includes(entry.action);
    if (authLogFilter === 'otp') return String(entry.action || '').includes('otp');
    return true;
  }), [authLogs, authLogFilter]);

  const settingsOverview = useMemo(() => ([
    {
      key: 'school',
      title: 'هوية المدرسة والتشغيل',
      value: selectedSchool?.name || 'بدون مدرسة',
      detail: `المنصة: ${localSettings?.platformName || 'منصة المدرسة'} • السنة: ${localSettings?.academicYear || 'غير محددة'}`,
      tone: 'sky',
      tab: 'general',
    },
    {
      key: 'attendance',
      title: 'سياسة الحضور',
      value: attendanceMethod === 'face' ? 'بصمة الوجه' : 'QR كود',
      detail: `بداية اليوم: ${localSettings?.dayStart || '—'} • مبكر حتى ${localSettings?.policy?.earlyEnd || '—'}`,
      tone: 'green',
      tab: 'attendance',
    },
    {
      key: 'actions',
      title: 'بنود الإجراءات',
      value: `${localSettings?.actions?.rewards?.length || 0}/${localSettings?.actions?.violations?.length || 0}/${localSettings?.actions?.programs?.length || 0}`,
      detail: 'مكافآت / خصومات / برامج',
      tone: 'violet',
      tab: 'actions',
    },
    {
      key: 'devices',
      title: 'الأجهزة والتشغيل',
      value: `${localSettings?.devices?.barcodeEnabled ? 'QR' : ''}${localSettings?.devices?.barcodeEnabled && localSettings?.devices?.faceEnabled ? ' + ' : ''}${localSettings?.devices?.faceEnabled ? 'Face' : ''}` || 'غير مفعل',
      detail: `${selectedSchool?.smartLinks?.gates?.length || 0} بوابة • ${selectedSchool?.smartLinks?.screens?.length || 0} شاشة`,
      tone: 'amber',
      tab: 'devices',
    },
  ]), [selectedSchool, localSettings, attendanceMethod]);

  const exportAuthLogs = (format = 'xlsx') => {
    const rows = filteredAuthLogs.map((entry) => {
      const details = entry.details || {};
      const meta = getAuthActionMeta(entry.action);
      const channelLabel = details.delivery === 'email' ? 'البريد الإلكتروني' : details.delivery === 'sms' ? 'SMS' : details.delivery === 'whatsapp' ? 'واتساب' : 'كلمة المرور / داخلي';
      return {
        'الوقت': formatDateTime(entry.createdAt),
        'الحدث': meta.label,
        'رمز الحدث': entry.action || '',
        'الحساب': details.userName || details.username || entry.actorUsername || details.identifier || '',
        'رقم المستخدم': details.userId || '',
        'الدور': getRoleLabel(details.role || entry.actorRole || '') || '',
        'القناة': channelLabel,
        'السبب': getAuthReasonLabel(details.reason),
        'الوجهة': details.destinationPreview || '',
      };
    });
    if (!rows.length) {
      window.alert('لا توجد سجلات مطابقة لتصديرها.');
      return;
    }
    const stamp = new Date().toISOString().replace(/[:T]/g, '-').slice(0, 16);
    if (format === 'csv') {
      const worksheet = XLSX.utils.json_to_sheet(rows);
      const csv = XLSX.utils.sheet_to_csv(worksheet);
      const blob = new Blob(["﻿" + csv], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `auth-audit-log-${stamp}.csv`;
      link.click();
      URL.revokeObjectURL(url);
      return;
    }
    const workbook = XLSX.utils.book_new();
    const worksheet = XLSX.utils.json_to_sheet(rows);
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Auth Audit');
    XLSX.writeFile(workbook, `auth-audit-log-${stamp}.xlsx`);
  };

  const save = () => onSaveSettings({
    ...localSettings,
    platformName: currentUser?.role === "superadmin" ? localSettings.platformName : settings.platformName,
    actions: hydrateActionCatalog(localSettings.actions),
  });

  const handleRestoreFile = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const textFile = await file.text();
    try {
      const parsed = JSON.parse(textFile);
      onRestoreBackup(parsed);
    } catch {
      window.alert("ملف النسخة الاحتياطية غير صالح.");
    }
    event.target.value = "";
  };

  const handleImportFile = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const result = await onImportStudents(file);
    setImportMessage(result?.message || "تم إنهاء عملية الاستيراد.");
    event.target.value = "";
  };

  const updateAuthTestField = (key, value) => setAuthTestDraft((current) => ({ ...current, [key]: value }));

  const runAuthDeliveryTest = async (delivery) => {
    const target = delivery === 'email' ? authTestDraft.emailTarget : delivery === 'sms' ? authTestDraft.smsTarget : authTestDraft.whatsappTarget;
    setAuthTestBusy(`delivery-${delivery}`);
    setAuthTestStatus((current) => ({ ...current, [delivery]: null }));
    try {
      const response = await apiRequest('/api/auth/test-delivery', { method: 'POST', token: getSessionToken(), body: { delivery, target, schoolId: selectedSchool?.id || '' } });
      setAuthTestStatus((current) => ({ ...current, [delivery]: { ok: true, message: response.message, destinationPreview: response.destinationPreview || '', previewCode: response.previewCode || '', providerMessageId: response.providerMessageId || '' } }));
    } catch (error) {
      setAuthTestStatus((current) => ({ ...current, [delivery]: { ok: false, message: error.message } }));
    } finally {
      setAuthTestBusy('');
    }
  };

  const runOtpScenarioTest = async () => {
    setAuthTestBusy('otp-scenario');
    setAuthTestStatus((current) => ({ ...current, otpScenario: null }));
    try {
      const response = await apiRequest('/api/auth/test-otp-scenario', { method: 'POST', token: getSessionToken(), body: { userId: authTestDraft.otpUserId, delivery: authTestDraft.otpDelivery } });
      setAuthTestStatus((current) => ({ ...current, otpScenario: { ok: true, message: response.message, destinationPreview: response.destinationPreview || '', previewCode: response.previewCode || '', expiresAt: response.expiresAt || '', userName: response.userName || '' } }));
    } catch (error) {
      setAuthTestStatus((current) => ({ ...current, otpScenario: { ok: false, message: error.message } }));
    } finally {
      setAuthTestBusy('');
    }
  };

  return (
    <div className="space-y-6">
      <SectionCard title={titleOverride || "إعدادات المدرسة والتشغيل"} icon={Settings}>
        {descriptionOverride ? <div className="mb-5 rounded-2xl bg-sky-50 px-4 py-4 text-sm leading-7 text-sky-900 ring-1 ring-sky-100">{descriptionOverride}</div> : null}
        {!forcedTab ? (
          <>
            <div className="mb-5 grid grid-cols-1 gap-3 xl:grid-cols-4">
              {settingsOverview.map((item) => (
                <button key={item.key} type="button" onClick={() => setTab(item.tab)} className="rounded-3xl bg-gradient-to-br from-white to-slate-50 p-4 text-right ring-1 ring-slate-200 transition hover:-translate-y-0.5 hover:shadow-sm">
                  <div className="flex items-center justify-between gap-3">
                    <Badge tone={item.tone}>{item.title}</Badge>
                    <span className="text-xs font-bold text-slate-500">فتح القسم</span>
                  </div>
                  <div className="mt-4 text-xl font-black text-slate-900">{item.value}</div>
                  <div className="mt-2 text-sm leading-7 text-slate-500">{item.detail}</div>
                </button>
              ))}
            </div>
            <div className="mb-5 rounded-3xl bg-slate-50 p-4 ring-1 ring-slate-200">
              <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <div className="font-black text-slate-900">تحكم سريع في المدرسة والتشغيل</div>
                  <div className="mt-1 text-sm leading-7 text-slate-500">هذه الصفحة خاصة بإعدادات المدرسة الحالية: الهوية، الحضور، البنود، الأجهزة، الاستيراد، النسخ الاحتياطي، وجاهزية التشغيل.</div>
                </div>
                <div className="flex flex-wrap gap-2">
                  {tabs.map((item) => (
                    <button key={item.key} onClick={() => setTab(item.key)} className={`rounded-2xl px-4 py-2 text-sm font-bold transition ${tab === item.key ? "bg-sky-700 text-white shadow-sm" : "bg-white text-slate-600 ring-1 ring-slate-200 hover:bg-slate-100"}`}>{item.label}</button>
                  ))}
                </div>
              </div>
            </div>
          </>
        ) : null}

        {tab === "general" && (
          <div className="space-y-5">
            <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
              <div className="rounded-3xl bg-sky-50 p-5 ring-1 ring-sky-100">
                <div className="text-sm font-bold text-sky-800">الهوية الحالية</div>
                <div className="mt-3 text-2xl font-black text-slate-900">{selectedSchool?.name || 'بدون مدرسة'}</div>
                <div className="mt-2 text-sm leading-7 text-slate-600">هذه البيانات تظهر في الشاشات، التقارير، ورسائل المدرسة، لذلك يُفضّل ضبطها بدقة.</div>
              </div>
              <div className="rounded-3xl bg-emerald-50 p-5 ring-1 ring-emerald-100">
                <div className="text-sm font-bold text-emerald-800">التشغيل الدراسي</div>
                <div className="mt-3 text-2xl font-black text-slate-900">{localSettings?.academicYear || 'غير محددة'}</div>
                <div className="mt-2 text-sm leading-7 text-slate-600">بداية اليوم الحالية: {localSettings?.dayStart || '—'} • مسؤول النظام: {localSettings?.adminName || 'غير محدد'}.</div>
              </div>
              <div className="rounded-3xl bg-violet-50 p-5 ring-1 ring-violet-100">
                <div className="text-sm font-bold text-violet-800">الاسم المعتمد للمنصة</div>
                <div className="mt-3 text-2xl font-black text-slate-900">{localSettings?.platformName || 'منصة المدرسة'}</div>
                <div className="mt-2 text-sm leading-7 text-slate-600">يمكن اعتماد اسم المدرسة أو اسم المبادرة أو اسم المنصة الرسمي بحسب سياستكم.</div>
              </div>
            </div>
            <div className="rounded-3xl bg-slate-50 p-5 ring-1 ring-slate-200">
              <div className="mb-4">
                <div className="font-black text-slate-900">هوية المدرسة والتشغيل العام</div>
                <div className="mt-1 text-sm leading-7 text-slate-500">اضبط البيانات الأساسية التي يعتمد عليها النظام في الواجهة والتقارير والإشعارات.</div>{currentUser?.role !== "superadmin" ? <div className="mt-3 rounded-2xl bg-amber-50 px-4 py-3 text-sm font-bold text-amber-900 ring-1 ring-amber-200">اسم المنصة واسم المدرسة من الصلاحيات العامة للأدمن الرئيسي فقط، ويمكن لمدير المدرسة تعديل بقية إعدادات التشغيل الخاصة بمدرسته.</div> : null}
              </div>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <Input label="اسم المنصة" value={localSettings.platformName} onChange={(e) => setLocalSettings({ ...localSettings, platformName: e.target.value })} disabled={!canEditGlobalIdentity} className={!canEditGlobalIdentity ? "cursor-not-allowed bg-slate-100 text-slate-500" : ""} />
                <Input label="اسم المدرسة" value={selectedSchool?.name || ''} disabled className="cursor-not-allowed bg-slate-100 text-slate-500" />
                <Input label="الرقم الوزاري" value={selectedSchool?.code || ''} disabled className="cursor-not-allowed bg-slate-100 text-slate-500" />
                <Input label="مدير المدرسة" value={selectedSchool?.manager || ''} disabled className="cursor-not-allowed bg-slate-100 text-slate-500" />
                <Input label="السنة الدراسية" value={localSettings.academicYear} onChange={(e) => setLocalSettings({ ...localSettings, academicYear: e.target.value })} />
                <Input label="وقت بداية اليوم الدراسي" value={localSettings.dayStart} onChange={(e) => setLocalSettings({ ...localSettings, dayStart: e.target.value })} />
                <Input label="مسؤول النظام" value={localSettings.adminName} onChange={(e) => setLocalSettings({ ...localSettings, adminName: e.target.value })} />
              </div>
              <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-2">
                {[
                  { key: 'ministryLogo', label: 'شعار الوزارة', hint: 'يظهر في صفحة الدخول والواجهات الرسمية.' },
                  { key: 'platformLogo', label: 'شعار المنصة', hint: 'يظهر في صفحة الدخول وبطاقة التعريف.' },
                ].map((item) => (
                  <div key={item.key} className="rounded-3xl bg-white p-4 ring-1 ring-slate-200">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="font-black text-slate-900">{item.label}</div>
                        <div className="mt-1 text-sm leading-7 text-slate-500">{item.hint}</div>
                      </div>
                      <div className="flex h-20 w-20 items-center justify-center overflow-hidden rounded-2xl bg-slate-50 ring-1 ring-slate-200">
                        {(localSettings.branding?.[item.key]) ? (
                          <img src={localSettings.branding[item.key]} alt={item.label} className="h-full w-full object-contain p-2" />
                        ) : (
                          <ShieldCheck className="h-8 w-8 text-slate-300" />
                        )}
                      </div>
                    </div>
                    <div className="mt-4 flex flex-wrap gap-2">
                      <label className={`inline-flex cursor-pointer items-center gap-2 rounded-2xl px-4 py-3 text-sm font-bold transition ${canEditGlobalIdentity ? 'bg-sky-700 text-white' : 'cursor-not-allowed bg-slate-100 text-slate-400'}`}>
                        <Upload className="h-4 w-4" />
                        رفع الشعار
                        <input type="file" accept="image/*" className="hidden" disabled={!canEditGlobalIdentity} onChange={async (e) => { const file = e.target.files?.[0]; if (file) await handleBrandLogoUpload(item.key, file); e.target.value = ''; }} />
                      </label>
                      <button type="button" disabled={!canEditGlobalIdentity || !localSettings.branding?.[item.key]} onClick={() => clearBrandLogo(item.key)} className="rounded-2xl bg-slate-100 px-4 py-3 text-sm font-bold text-slate-700 disabled:cursor-not-allowed disabled:opacity-50">إزالة</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {tab === "attendance" && (
          <div className="space-y-5">
            <div className="grid grid-cols-1 gap-4 xl:grid-cols-4">
              <div className="rounded-3xl bg-emerald-50 p-5 ring-1 ring-emerald-100"><div className="text-sm font-bold text-emerald-800">طريقة الحضور</div><div className="mt-3 text-2xl font-black text-slate-900">{attendanceMethod === 'face' ? 'بصمة الوجه' : 'QR كود'}</div><div className="mt-2 text-sm text-slate-600">اختر الطريقة الافتراضية لمسارات التحضير السريع والبوابات.</div></div>
              <div className="rounded-3xl bg-sky-50 p-5 ring-1 ring-sky-100"><div className="text-sm font-bold text-sky-800">الحضور المبكر</div><div className="mt-3 text-2xl font-black text-slate-900">{localSettings?.policy?.earlyEnd || '—'}</div><div className="mt-2 text-sm text-slate-600">آخر وقت يُحسب حضورًا مبكرًا.</div></div>
              <div className="rounded-3xl bg-violet-50 p-5 ring-1 ring-violet-100"><div className="text-sm font-bold text-violet-800">الحضور في الوقت</div><div className="mt-3 text-2xl font-black text-slate-900">{localSettings?.policy?.onTimeEnd || '—'}</div><div className="mt-2 text-sm text-slate-600">آخر وقت يُحسب حضورًا طبيعيًا قبل التأخر.</div></div>
              <div className="rounded-3xl bg-amber-50 p-5 ring-1 ring-amber-100"><div className="text-sm font-bold text-amber-800">التصدير</div><div className="mt-3 text-2xl font-black text-slate-900">{localSettings?.exportPrefix || 'school'}</div><div className="mt-2 text-sm text-slate-600">يستخدم كبادئة لتقارير Excel والنسخ الاحتياطية.</div></div>
            </div>
            <div className="rounded-3xl bg-slate-50 p-5 ring-1 ring-slate-200">
              <div className="mb-4">
                <div className="font-black text-slate-900">سياسات الحضور والانصراف</div>
                <div className="mt-1 text-sm leading-7 text-slate-500">اضبط أوقات اليوم الدراسي وطريقة التحضير الافتراضية بما يتوافق مع بوابات المدرسة والشاشات والحضور الذكي.</div>
              </div>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <Input label="نهاية الحضور المبكر" value={localSettings.policy.earlyEnd} onChange={(e) => setLocalSettings({ ...localSettings, policy: { ...localSettings.policy, earlyEnd: e.target.value } })} />
                <Input label="نهاية الحضور في الوقت" value={localSettings.policy.onTimeEnd} onChange={(e) => setLocalSettings({ ...localSettings, policy: { ...localSettings.policy, onTimeEnd: e.target.value } })} />
                <Select label="طريقة الحضور الافتراضية" value={attendanceMethod} onChange={(e) => setAttendanceMethod(e.target.value)}>
                  <option value="barcode">QR كود</option>
                  <option value="face">بصمة وجه</option>
                </Select>
                <Input label="بادئة ملفات التصدير" value={localSettings.exportPrefix} onChange={(e) => setLocalSettings({ ...localSettings, exportPrefix: e.target.value })} />
              </div>
            </div>
          </div>
        )}

        {tab === "points" && (
          <div className="space-y-5">
            <div className="grid grid-cols-2 gap-4 xl:grid-cols-5">
              <div className="rounded-3xl bg-emerald-50 p-4 ring-1 ring-emerald-100"><div className="text-xs text-emerald-700">الحضور المبكر</div><div className="mt-2 text-3xl font-black text-emerald-700">{localSettings?.points?.early ?? 0}</div></div>
              <div className="rounded-3xl bg-sky-50 p-4 ring-1 ring-sky-100"><div className="text-xs text-sky-700">الحضور في الوقت</div><div className="mt-2 text-3xl font-black text-sky-700">{localSettings?.points?.onTime ?? 0}</div></div>
              <div className="rounded-3xl bg-rose-50 p-4 ring-1 ring-rose-100"><div className="text-xs text-rose-700">خصم التأخر</div><div className="mt-2 text-3xl font-black text-rose-700">{localSettings?.points?.late ?? 0}</div></div>
              <div className="rounded-3xl bg-violet-50 p-4 ring-1 ring-violet-100"><div className="text-xs text-violet-700">المبادرة</div><div className="mt-2 text-3xl font-black text-violet-700">{localSettings?.points?.initiative ?? 0}</div></div>
              <div className="rounded-3xl bg-amber-50 p-4 ring-1 ring-amber-100"><div className="text-xs text-amber-700">السلوك</div><div className="mt-2 text-3xl font-black text-amber-700">{localSettings?.points?.behavior ?? 0}</div></div>
            </div>
            <div className="rounded-3xl bg-slate-50 p-5 ring-1 ring-slate-200">
              <div className="mb-4">
                <div className="font-black text-slate-900">سياسات النقاط المعتمدة</div>
                <div className="mt-1 text-sm leading-7 text-slate-500">هذه القيم تؤثر مباشرة في ترتيب الطلاب، التفاعل اليومي، ومؤشرات المدرسة؛ لذلك يفضّل ضبطها بعناية وبشكل موحد.</div>
              </div>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <Input label="نقاط الحضور المبكر" type="number" value={localSettings.points.early} onChange={(e) => setLocalSettings({ ...localSettings, points: { ...localSettings.points, early: safeNumber(e.target.value) } })} />
                <Input label="نقاط الحضور في الوقت" type="number" value={localSettings.points.onTime} onChange={(e) => setLocalSettings({ ...localSettings, points: { ...localSettings.points, onTime: safeNumber(e.target.value) } })} />
                <Input label="خصم التأخر" type="number" value={localSettings.points.late} onChange={(e) => setLocalSettings({ ...localSettings, points: { ...localSettings.points, late: safeNumber(e.target.value) } })} />
                <Input label="نقاط المبادرة" type="number" value={localSettings.points.initiative} onChange={(e) => setLocalSettings({ ...localSettings, points: { ...localSettings.points, initiative: safeNumber(e.target.value) } })} />
                <Input label="نقاط السلوك" type="number" value={localSettings.points.behavior} onChange={(e) => setLocalSettings({ ...localSettings, points: { ...localSettings.points, behavior: safeNumber(e.target.value) } })} />
              </div>
            </div>
          </div>
        )}

        {tab === "actions" && (
          <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
            <ActionCatalogEditor title="المكافآت المعتمدة" description="هذه البنود تظهر للمعلم والمدير عند تنفيذ المكافآت على الطلاب." mode="reward" items={localSettings.actions?.rewards || []} onChange={(items) => setLocalSettings({ ...localSettings, actions: { ...localSettings.actions, rewards: items } })} />
            <ActionCatalogEditor title="الخصومات والمخالفات" description="هذه البنود تظهر عند تنفيذ الخصومات أو تسجيل المخالفات على الطالب." mode="violation" items={localSettings.actions?.violations || []} onChange={(items) => setLocalSettings({ ...localSettings, actions: { ...localSettings.actions, violations: items } })} />
            <ActionCatalogEditor title="البرامج المعتمدة" description="هذه البنود تظهر للمعلم عند اعتماد البرامج أو الأنشطة التي ينفذها للطالب." mode="program" items={localSettings.actions?.programs || []} onChange={(items) => setLocalSettings({ ...localSettings, actions: { ...localSettings.actions, programs: items } })} />
          </div>
        )}

        {tab === "import" && (
          <div className="space-y-4">
            <div className="rounded-3xl bg-slate-50 p-5 ring-1 ring-slate-200">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <div className="font-bold text-slate-800">استيراد الطلاب من ملف نور</div>
                  <div className="mt-2 text-sm leading-7 text-slate-600">ارفع ملف Excel بصيغة xlsx أو xls أو csv، وستقوم المنصة بقراءة الأعمدة الشائعة في نور تلقائيًا ثم إنشاء الطلاب داخل المدرسة الحالية مع توليد رقم الطالب وQR، وإنشاء الشركات/الفصول عند الحاجة.</div>
                </div>
                <Badge tone="blue">{selectedSchool?.name || "المدرسة الحالية"}</Badge>
              </div>
              <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-3">
                <button onClick={onDownloadTemplate} className="inline-flex items-center justify-center gap-2 rounded-2xl bg-slate-100 px-4 py-3 font-bold text-slate-700"><Download className="h-4 w-4" /> تحميل نموذج CSV</button>
                <button onClick={() => importRef.current?.click()} className="inline-flex items-center justify-center gap-2 rounded-2xl bg-sky-700 px-4 py-3 font-bold text-white"><Upload className="h-4 w-4" /> استيراد ملف نور</button>
                <div className="rounded-2xl bg-white px-4 py-3 text-sm text-slate-600 ring-1 ring-slate-200">الأعمدة المقروءة: اسم الطالب، رقم الهوية، رقم الطالب، الصف، الفصل، الشركة.</div>
              </div>
              <input ref={importRef} type="file" accept=".xlsx,.xls,.csv,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-excel,text/csv" className="hidden" onChange={handleImportFile} />
              {importMessage ? <div className="mt-4 rounded-2xl bg-emerald-50 px-4 py-3 text-sm font-bold text-emerald-800 ring-1 ring-emerald-200">{importMessage}</div> : null}
            </div>
          </div>
        )}

        {tab === "devices" && (
          <div className="space-y-5">
            <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
              <div className="rounded-3xl bg-sky-50 p-5 ring-1 ring-sky-100"><div className="text-sm font-bold text-sky-800">قارئ QR</div><div className="mt-3 text-2xl font-black text-slate-900">{localSettings?.devices?.barcodeEnabled ? 'مفعل' : 'غير مفعل'}</div></div>
              <div className="rounded-3xl bg-violet-50 p-5 ring-1 ring-violet-100"><div className="text-sm font-bold text-violet-800">بصمة الوجه</div><div className="mt-3 text-2xl font-black text-slate-900">{localSettings?.devices?.faceEnabled ? 'مفعلة' : 'غير مفعلة'}</div></div>
              <div className="rounded-3xl bg-amber-50 p-5 ring-1 ring-amber-100"><div className="text-sm font-bold text-amber-800">منع التكرار</div><div className="mt-3 text-2xl font-black text-slate-900">{localSettings?.devices?.duplicateScanBlocked ? 'نشط' : 'غير نشط'}</div></div>
            </div>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              {[
                ["barcodeEnabled", "تفعيل قارئ QR"],
                ["faceEnabled", "تفعيل مسار بصمة الوجه"],
                ["duplicateScanBlocked", "منع التكرار في اليوم نفسه"],
              ].map(([key, label]) => (
                <label key={key} className="flex items-center gap-3 rounded-2xl bg-slate-50 px-4 py-4 ring-1 ring-slate-200">
                  <input
                    type="checkbox"
                    checked={Boolean(localSettings.devices[key])}
                    onChange={(e) => setLocalSettings({ ...localSettings, devices: { ...localSettings.devices, [key]: e.target.checked } })}
                  />
                  <span className="font-bold text-slate-700">{label}</span>
                </label>
              ))}
            </div>
          </div>
        )}

        {tab === "auth" && !forcedTab && (
          <div className="rounded-3xl bg-amber-50 p-5 text-amber-900 ring-1 ring-amber-200">
            <div className="font-black">تنبيه تنظيمي</div>
            <div className="mt-2 text-sm leading-7">إعدادات الدخول والمصادقة أصبحت صفحة عامة مستقلة على مستوى المنصة. استخدم من القائمة الجانبية للأدمن العام صفحة «الدخول والمصادقة» بدل إعدادات المدرسة.</div>
          </div>
        )}

        {tab === "auth" && (
          <div className="space-y-5">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
              <label className="flex items-center gap-3 rounded-2xl bg-slate-50 px-4 py-4 ring-1 ring-slate-200"><input type="checkbox" checked={Boolean(localSettings.auth?.allowPasswordLogin)} onChange={(e) => setLocalSettings({ ...localSettings, auth: { ...localSettings.auth, allowPasswordLogin: e.target.checked } })} /><span className="font-bold text-slate-700">السماح بالدخول بكلمة المرور</span></label>
              <label className="flex items-center gap-3 rounded-2xl bg-slate-50 px-4 py-4 ring-1 ring-slate-200"><input type="checkbox" checked={Boolean(localSettings.auth?.otpEnabled)} onChange={(e) => setLocalSettings({ ...localSettings, auth: { ...localSettings.auth, otpEnabled: e.target.checked } })} /><span className="font-bold text-slate-700">تفعيل OTP</span></label>
              <label className="flex items-center gap-3 rounded-2xl bg-slate-50 px-4 py-4 ring-1 ring-slate-200"><input type="checkbox" checked={Boolean(localSettings.auth?.passwordlessEnabled)} onChange={(e) => setLocalSettings({ ...localSettings, auth: { ...localSettings.auth, passwordlessEnabled: e.target.checked } })} /><span className="font-bold text-slate-700">تفعيل الدخول بدون كلمة مرور</span></label>
            </div>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              <Select label="معرّف الدخول الأساسي" value={localSettings.auth?.identifierMode || 'username'} onChange={(e) => setLocalSettings({ ...localSettings, auth: { ...localSettings.auth, identifierMode: e.target.value } })}>
                <option value="username">اسم المستخدم</option>
                <option value="email_or_username">البريد أو اسم المستخدم</option>
                <option value="email_or_mobile_or_username">الجوال أو البريد أو اسم المستخدم</option>
              </Select>
              <Input label="مدة صلاحية الرمز بالدقائق" type="number" value={localSettings.auth?.otpExpiryMinutes || 10} onChange={(e) => setLocalSettings({ ...localSettings, auth: { ...localSettings.auth, otpExpiryMinutes: safeNumber(e.target.value, 10) } })} />
              <Input label="طول الرمز" type="number" value={localSettings.auth?.otpLength || 6} onChange={(e) => setLocalSettings({ ...localSettings, auth: { ...localSettings.auth, otpLength: safeNumber(e.target.value, 6) } })} />
            </div>
            <div className="rounded-3xl bg-slate-50 p-5 ring-1 ring-slate-200">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <div className="font-black text-slate-800">من يستفيد من OTP / Passwordless؟</div>
                  <div className="mt-1 text-sm leading-7 text-slate-500">كل شيء اختياري: يمكنك فتحها للجميع أو تخصيصها لأدوار أو مستخدمين محددين، مع إمكانية استثناء حسابات بعينها.</div>
                </div>
              </div>
              <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
                <Select label="نطاق التطبيق" value={authTargeting.applyScope || 'all'} onChange={(e) => setLocalSettings({ ...localSettings, auth: { ...localSettings.auth, targeting: { ...authTargeting, applyScope: e.target.value } } })}>
                  <option value="all">متاح لجميع المستخدمين</option>
                  <option value="selected">متاح فقط للمحددّين</option>
                </Select>
                <label className="flex items-center gap-3 rounded-2xl bg-white px-4 py-4 ring-1 ring-slate-200"><input type="checkbox" checked={Boolean(authTargeting.forceForSelected)} onChange={(e) => setLocalSettings({ ...localSettings, auth: { ...localSettings.auth, targeting: { ...authTargeting, forceForSelected: e.target.checked } } })} /><span className="font-bold text-slate-700">إجبار المحددين على الرمز فقط وإيقاف كلمة المرور عنهم</span></label>
              </div>
              <div className="mt-4 grid grid-cols-1 gap-4 xl:grid-cols-3">
                <div className="rounded-2xl bg-white p-4 ring-1 ring-slate-200">
                  <div className="font-bold text-slate-800">الأدوار المشمولة</div>
                  <div className="mt-3 space-y-2">
                    {roles.map((role) => (
                      <label key={role.key} className="flex items-center gap-3 rounded-2xl bg-slate-50 px-3 py-3 text-sm font-bold text-slate-700 ring-1 ring-slate-200">
                        <input type="checkbox" checked={(authTargeting.selectedRoleKeys || []).includes(role.key)} onChange={() => toggleAuthTargetListValue('selectedRoleKeys', role.key)} />
                        <span>{role.label}</span>
                      </label>
                    ))}
                  </div>
                </div>
                <div className="rounded-2xl bg-white p-4 ring-1 ring-slate-200 xl:col-span-2">
                  <div className="font-bold text-slate-800">مستخدمون محددون</div>
                  <div className="mt-1 text-xs text-slate-500">اختر مستخدمين بعينهم لإتاحة OTP لهم حتى لو لم يكن دورهم ضمن القائمة.</div>
                  <div className="mt-3 max-h-64 space-y-2 overflow-auto pr-1">
                    {authManagedUsers.map((user) => (
                      <label key={user.id} className="flex items-start gap-3 rounded-2xl bg-slate-50 px-3 py-3 text-sm ring-1 ring-slate-200">
                        <input type="checkbox" checked={(authTargeting.selectedUserIds || []).includes(user.id)} onChange={() => toggleAuthTargetListValue('selectedUserIds', user.id)} className="mt-1" />
                        <span>
                          <span className="block font-bold text-slate-800">{user.name}</span>
                          <span className="block text-slate-500">{getRoleLabel(user.role)} • {user.username} • {user.schoolName}</span>
                        </span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
              <div className="mt-4 rounded-2xl bg-white p-4 ring-1 ring-slate-200">
                <div className="font-bold text-slate-800">حسابات مستثناة</div>
                <div className="mt-1 text-xs text-slate-500">هذه الحسابات لن يظهر لها OTP ولن تُفرض عليها المصادقة بدون كلمة مرور حتى لو كانت ضمن الدور أو التحديد.</div>
                <div className="mt-3 max-h-56 grid grid-cols-1 gap-2 overflow-auto pr-1 md:grid-cols-2">
                  {authManagedUsers.map((user) => (
                    <label key={`ex-${user.id}`} className="flex items-start gap-3 rounded-2xl bg-slate-50 px-3 py-3 text-sm ring-1 ring-slate-200">
                      <input type="checkbox" checked={(authTargeting.excludedUserIds || []).includes(user.id)} onChange={() => toggleAuthTargetListValue('excludedUserIds', user.id)} className="mt-1" />
                      <span>
                        <span className="block font-bold text-slate-800">{user.name}</span>
                        <span className="block text-slate-500">{getRoleLabel(user.role)} • {user.username}</span>
                      </span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
            <div className="rounded-3xl bg-amber-50/70 p-5 ring-1 ring-amber-200">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <div className="font-black text-slate-800">الحماية من كثرة المحاولات الفاشلة</div>
                  <div className="mt-1 text-sm leading-7 text-slate-500">ميزة اختيارية لحماية الدخول: قفل مؤقت عند تكرار الفشل، مع إشعار الأدمن عبر القنوات العامة التي تحددها هنا.</div>
                </div>
                <label className="flex items-center gap-3 rounded-2xl bg-white px-4 py-4 ring-1 ring-amber-200"><input type="checkbox" checked={Boolean(localSettings.auth?.security?.enabled)} onChange={(e) => setLocalSettings({ ...localSettings, auth: { ...localSettings.auth, security: { ...localSettings.auth?.security, enabled: e.target.checked } } })} /><span className="font-bold text-slate-700">تفعيل الحماية الأمنية</span></label>
              </div>
              <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
                <Input label="عدد المحاولات الفاشلة قبل القفل" type="number" value={localSettings.auth?.security?.maxFailedAttempts || 5} onChange={(e) => setLocalSettings({ ...localSettings, auth: { ...localSettings.auth, security: { ...localSettings.auth?.security, maxFailedAttempts: safeNumber(e.target.value, 5) } } })} />
                <Input label="نافذة المراقبة بالدقائق" type="number" value={localSettings.auth?.security?.trackWindowMinutes || 15} onChange={(e) => setLocalSettings({ ...localSettings, auth: { ...localSettings.auth, security: { ...localSettings.auth?.security, trackWindowMinutes: safeNumber(e.target.value, 15) } } })} />
                <Input label="مدة القفل المؤقت بالدقائق" type="number" value={localSettings.auth?.security?.lockoutMinutes || 15} onChange={(e) => setLocalSettings({ ...localSettings, auth: { ...localSettings.auth, security: { ...localSettings.auth?.security, lockoutMinutes: safeNumber(e.target.value, 15) } } })} />
                <div className="rounded-2xl bg-white px-4 py-3 text-sm leading-7 text-slate-600 ring-1 ring-slate-200">عند نجاح الدخول لاحقًا أو انتهاء مدة القفل، يُرفع القفل تلقائيًا.</div>
              </div>
              <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-3">
                <label className="flex items-center gap-3 rounded-2xl bg-white px-4 py-4 ring-1 ring-slate-200"><input type="checkbox" checked={Boolean(localSettings.auth?.security?.applyToPassword)} onChange={(e) => setLocalSettings({ ...localSettings, auth: { ...localSettings.auth, security: { ...localSettings.auth?.security, applyToPassword: e.target.checked } } })} /><span className="font-bold text-slate-700">تطبيقها على كلمة المرور</span></label>
                <label className="flex items-center gap-3 rounded-2xl bg-white px-4 py-4 ring-1 ring-slate-200"><input type="checkbox" checked={Boolean(localSettings.auth?.security?.applyToOtp)} onChange={(e) => setLocalSettings({ ...localSettings, auth: { ...localSettings.auth, security: { ...localSettings.auth?.security, applyToOtp: e.target.checked } } })} /><span className="font-bold text-slate-700">تطبيقها على OTP</span></label>
                <label className="flex items-center gap-3 rounded-2xl bg-white px-4 py-4 ring-1 ring-slate-200"><input type="checkbox" checked={Boolean(localSettings.auth?.security?.notifyAdminOnLock)} onChange={(e) => setLocalSettings({ ...localSettings, auth: { ...localSettings.auth, security: { ...localSettings.auth?.security, notifyAdminOnLock: e.target.checked } } })} /><span className="font-bold text-slate-700">إشعار الأدمن عند القفل</span></label>
              </div>
              <div className="mt-4 rounded-2xl bg-white p-4 ring-1 ring-slate-200">
                <div className="font-bold text-slate-800">قنوات تنبيه الأدمن</div>
                <div className="mt-1 text-xs leading-6 text-slate-500">البريد وSMS وواتساب كلها تُدار من هذه الصفحة كإعداد عام على مستوى المنصة.</div>
                <div className="mt-3 grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-4">
                  <label className="flex items-center gap-3 rounded-2xl bg-slate-50 px-4 py-4 ring-1 ring-slate-200"><input type="checkbox" checked={Boolean(localSettings.auth?.security?.notificationChannels?.internal)} onChange={(e) => setLocalSettings({ ...localSettings, auth: { ...localSettings.auth, security: { ...localSettings.auth?.security, notificationChannels: { ...localSettings.auth?.security?.notificationChannels, internal: e.target.checked } } } })} /><span className="font-bold text-slate-700">إشعار داخلي</span></label>
                  <label className="flex items-center gap-3 rounded-2xl bg-slate-50 px-4 py-4 ring-1 ring-slate-200"><input type="checkbox" checked={Boolean(localSettings.auth?.security?.notificationChannels?.email)} onChange={(e) => setLocalSettings({ ...localSettings, auth: { ...localSettings.auth, security: { ...localSettings.auth?.security, notificationChannels: { ...localSettings.auth?.security?.notificationChannels, email: e.target.checked } } } })} /><span className="font-bold text-slate-700">بريد إلكتروني</span></label>
                  <label className="flex items-center gap-3 rounded-2xl bg-slate-50 px-4 py-4 ring-1 ring-slate-200"><input type="checkbox" checked={Boolean(localSettings.auth?.security?.notificationChannels?.sms)} onChange={(e) => setLocalSettings({ ...localSettings, auth: { ...localSettings.auth, security: { ...localSettings.auth?.security, notificationChannels: { ...localSettings.auth?.security?.notificationChannels, sms: e.target.checked } } } })} /><span className="font-bold text-slate-700">SMS</span></label>
                  <label className="flex items-center gap-3 rounded-2xl bg-slate-50 px-4 py-4 ring-1 ring-slate-200"><input type="checkbox" checked={Boolean(localSettings.auth?.security?.notificationChannels?.whatsapp)} onChange={(e) => setLocalSettings({ ...localSettings, auth: { ...localSettings.auth, security: { ...localSettings.auth?.security, notificationChannels: { ...localSettings.auth?.security?.notificationChannels, whatsapp: e.target.checked } } } })} /><span className="font-bold text-slate-700">واتساب</span></label>
                </div>
              </div>
            </div>
            <div className="rounded-3xl bg-slate-50 p-5 ring-1 ring-slate-200">
              <div className="font-black text-slate-800">قنوات إرسال رمز التحقق</div>
              <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-3">
                <label className="flex items-center gap-3 rounded-2xl bg-white px-4 py-4 ring-1 ring-slate-200"><input type="checkbox" checked={Boolean(localSettings.auth?.delivery?.email)} onChange={(e) => setLocalSettings({ ...localSettings, auth: { ...localSettings.auth, delivery: { ...localSettings.auth?.delivery, email: e.target.checked } } })} /><span className="font-bold text-slate-700">البريد الإلكتروني</span></label>
                <label className="flex items-center gap-3 rounded-2xl bg-white px-4 py-4 ring-1 ring-slate-200"><input type="checkbox" checked={Boolean(localSettings.auth?.delivery?.sms)} onChange={(e) => setLocalSettings({ ...localSettings, auth: { ...localSettings.auth, delivery: { ...localSettings.auth?.delivery, sms: e.target.checked } } })} /><span className="font-bold text-slate-700">رسالة نصية SMS</span></label>
                <label className="flex items-center gap-3 rounded-2xl bg-white px-4 py-4 ring-1 ring-slate-200"><input type="checkbox" checked={Boolean(localSettings.auth?.delivery?.whatsapp)} onChange={(e) => setLocalSettings({ ...localSettings, auth: { ...localSettings.auth, delivery: { ...localSettings.auth?.delivery, whatsapp: e.target.checked } } })} /><span className="font-bold text-slate-700">واتساب</span></label>
              </div>
            </div>
            <div className="rounded-3xl bg-white p-5 ring-1 ring-slate-200">
              <div className="font-black text-slate-800">إعدادات البريد لإرسال OTP</div>
              <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
                <Input label="اسم المرسل" value={localSettings.auth?.email?.fromName || ''} onChange={(e) => setLocalSettings({ ...localSettings, auth: { ...localSettings.auth, email: { ...localSettings.auth?.email, fromName: e.target.value } } })} />
                <Input label="بريد المرسل" value={localSettings.auth?.email?.fromEmail || ''} onChange={(e) => setLocalSettings({ ...localSettings, auth: { ...localSettings.auth, email: { ...localSettings.auth?.email, fromEmail: e.target.value.toLowerCase() } } })} placeholder="no-reply@example.com" />
                <Input label="SMTP Host" value={localSettings.auth?.email?.smtpHost || ''} onChange={(e) => setLocalSettings({ ...localSettings, auth: { ...localSettings.auth, email: { ...localSettings.auth?.email, smtpHost: e.target.value } } })} placeholder="smtp.office365.com" />
                <Input label="SMTP Port" type="number" value={localSettings.auth?.email?.smtpPort || 587} onChange={(e) => setLocalSettings({ ...localSettings, auth: { ...localSettings.auth, email: { ...localSettings.auth?.email, smtpPort: safeNumber(e.target.value, 587) } } })} />
                <Input label="SMTP Username" value={localSettings.auth?.email?.smtpUsername || ''} onChange={(e) => setLocalSettings({ ...localSettings, auth: { ...localSettings.auth, email: { ...localSettings.auth?.email, smtpUsername: e.target.value } } })} />
                <Input label="SMTP Password" type="password" value={localSettings.auth?.email?.smtpPassword || ''} onChange={(e) => setLocalSettings({ ...localSettings, auth: { ...localSettings.auth, email: { ...localSettings.auth?.email, smtpPassword: e.target.value } } })} />
                <label className="flex items-center gap-3 rounded-2xl bg-slate-50 px-4 py-4 ring-1 ring-slate-200 md:col-span-2"><input type="checkbox" checked={Boolean(localSettings.auth?.email?.smtpSecure)} onChange={(e) => setLocalSettings({ ...localSettings, auth: { ...localSettings.auth, email: { ...localSettings.auth?.email, smtpSecure: e.target.checked } } })} /><span className="font-bold text-slate-700">استخدام اتصال آمن SSL/TLS</span></label>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
              <div className="rounded-3xl bg-white p-5 ring-1 ring-slate-200">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <div className="font-black text-slate-800">ربط SMS العام للمنصة</div>
                    <div className="mt-1 text-sm leading-7 text-slate-500">هذا الربط يستخدمه OTP والتنبيهات الأمنية العامة دون ارتباط بأي مدرسة.</div>
                  </div>
                  <Badge tone={localSettings.auth?.integrations?.sms?.status === 'مرتبط' ? 'green' : localSettings.auth?.integrations?.sms?.status === 'فشل الاختبار' ? 'rose' : 'slate'}>{localSettings.auth?.integrations?.sms?.status || 'غير مختبر'}</Badge>
                </div>
                <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
                  <Input label="اسم المزود" value={localSettings.auth?.integrations?.sms?.providerName || ''} onChange={(e) => setLocalSettings({ ...localSettings, auth: { ...localSettings.auth, integrations: { ...localSettings.auth?.integrations, sms: { ...localSettings.auth?.integrations?.sms, providerName: e.target.value } } } })} />
                  <Input label="Sender ID" value={localSettings.auth?.integrations?.sms?.senderId || ''} onChange={(e) => setLocalSettings({ ...localSettings, auth: { ...localSettings.auth, integrations: { ...localSettings.auth?.integrations, sms: { ...localSettings.auth?.integrations?.sms, senderId: e.target.value } } } })} />
                  <Input label="رابط API" value={localSettings.auth?.integrations?.sms?.apiUrl || ''} onChange={(e) => setLocalSettings({ ...localSettings, auth: { ...localSettings.auth, integrations: { ...localSettings.auth?.integrations, sms: { ...localSettings.auth?.integrations?.sms, apiUrl: e.target.value } } } })} placeholder="https://provider.example.com/send" />
                  <Input label="API Key" value={localSettings.auth?.integrations?.sms?.apiKey || ''} onChange={(e) => setLocalSettings({ ...localSettings, auth: { ...localSettings.auth, integrations: { ...localSettings.auth?.integrations, sms: { ...localSettings.auth?.integrations?.sms, apiKey: e.target.value } } } })} />
                  <Input label="اسم المستخدم" value={localSettings.auth?.integrations?.sms?.username || ''} onChange={(e) => setLocalSettings({ ...localSettings, auth: { ...localSettings.auth, integrations: { ...localSettings.auth?.integrations, sms: { ...localSettings.auth?.integrations?.sms, username: e.target.value } } } })} />
                  <Input label="كلمة المرور" type="password" value={localSettings.auth?.integrations?.sms?.password || ''} onChange={(e) => setLocalSettings({ ...localSettings, auth: { ...localSettings.auth, integrations: { ...localSettings.auth?.integrations, sms: { ...localSettings.auth?.integrations?.sms, password: e.target.value } } } })} />
                </div>
              </div>
              <div className="rounded-3xl bg-white p-5 ring-1 ring-slate-200">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <div className="font-black text-slate-800">ربط واتساب العام للمنصة</div>
                    <div className="mt-1 text-sm leading-7 text-slate-500">هذا الربط يستخدمه OTP والتنبيهات الأمنية العامة عبر WhatsApp Cloud API.</div>
                  </div>
                  <Badge tone={localSettings.auth?.integrations?.whatsapp?.status === 'مرتبط' ? 'green' : localSettings.auth?.integrations?.whatsapp?.status === 'فشل الاختبار' ? 'rose' : 'slate'}>{localSettings.auth?.integrations?.whatsapp?.status || 'غير مختبر'}</Badge>
                </div>
                <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
                  <Input label="Phone Number ID" value={localSettings.auth?.integrations?.whatsapp?.phoneNumberId || ''} onChange={(e) => setLocalSettings({ ...localSettings, auth: { ...localSettings.auth, integrations: { ...localSettings.auth?.integrations, whatsapp: { ...localSettings.auth?.integrations?.whatsapp, phoneNumberId: e.target.value } } } })} />
                  <Input label="Business Account ID" value={localSettings.auth?.integrations?.whatsapp?.businessAccountId || ''} onChange={(e) => setLocalSettings({ ...localSettings, auth: { ...localSettings.auth, integrations: { ...localSettings.auth?.integrations, whatsapp: { ...localSettings.auth?.integrations?.whatsapp, businessAccountId: e.target.value } } } })} />
                  <Input label="Access Token" type="password" value={localSettings.auth?.integrations?.whatsapp?.accessToken || ''} onChange={(e) => setLocalSettings({ ...localSettings, auth: { ...localSettings.auth, integrations: { ...localSettings.auth?.integrations, whatsapp: { ...localSettings.auth?.integrations?.whatsapp, accessToken: e.target.value } } } })} />
                  <Input label="Webhook Verify Token" value={localSettings.auth?.integrations?.whatsapp?.webhookVerifyToken || ''} onChange={(e) => setLocalSettings({ ...localSettings, auth: { ...localSettings.auth, integrations: { ...localSettings.auth?.integrations, whatsapp: { ...localSettings.auth?.integrations?.whatsapp, webhookVerifyToken: e.target.value } } } })} />
                </div>
              </div>
            </div>
            <div className="rounded-3xl bg-white p-5 ring-1 ring-slate-200">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <div className="font-black text-slate-800">اختبار قنوات الدخول العامة</div>
                  <div className="mt-1 text-sm leading-7 text-slate-500">بعد حفظ الإعدادات يمكنك اختبار البريد وSMS وواتساب وOTP من هنا مباشرة. الاختبار يقرأ الإعدادات المحفوظة الحالية، لذلك احفظ أولًا أي تغيير جديد قبل التنفيذ.</div>
                </div>
                <Badge tone="blue">إعداد عام على مستوى المنصة</Badge>
              </div>
              <div className="mt-4 grid grid-cols-1 gap-4 xl:grid-cols-3">
                <div className="rounded-2xl bg-slate-50 p-4 ring-1 ring-slate-200">
                  <div className="font-bold text-slate-800">اختبار البريد الإلكتروني</div>
                  <Input label="البريد المستهدف" value={authTestDraft.emailTarget} onChange={(e) => updateAuthTestField('emailTarget', e.target.value.toLowerCase())} placeholder="test@example.com" />
                  <button type="button" onClick={() => runAuthDeliveryTest('email')} disabled={authTestBusy === 'delivery-email'} className="mt-3 inline-flex items-center gap-2 rounded-2xl bg-sky-700 px-4 py-3 text-sm font-bold text-white disabled:opacity-60">{authTestBusy === 'delivery-email' ? <Loader2 className="h-4 w-4 animate-spin" /> : <ShieldCheck className="h-4 w-4" />} اختبار البريد</button>
                  {authTestStatus.email ? <div className={`mt-3 rounded-2xl px-4 py-3 text-sm leading-7 ${authTestStatus.email.ok ? 'bg-emerald-50 text-emerald-800 ring-1 ring-emerald-200' : 'bg-rose-50 text-rose-800 ring-1 ring-rose-200'}`}>{authTestStatus.email.message}{authTestStatus.email.destinationPreview ? `
الوجهة: ${authTestStatus.email.destinationPreview}` : ''}{authTestStatus.email.previewCode ? `
الرمز التجريبي: ${authTestStatus.email.previewCode}` : ''}</div> : null}
                </div>
                <div className="rounded-2xl bg-slate-50 p-4 ring-1 ring-slate-200">
                  <div className="font-bold text-slate-800">اختبار SMS</div>
                  <Input label="رقم الجوال المستهدف" value={authTestDraft.smsTarget} onChange={(e) => updateAuthTestField('smsTarget', e.target.value)} placeholder="9665xxxxxxxx" />
                  <button type="button" onClick={() => runAuthDeliveryTest('sms')} disabled={authTestBusy === 'delivery-sms'} className="mt-3 inline-flex items-center gap-2 rounded-2xl bg-slate-900 px-4 py-3 text-sm font-bold text-white disabled:opacity-60">{authTestBusy === 'delivery-sms' ? <Loader2 className="h-4 w-4 animate-spin" /> : <Bell className="h-4 w-4" />} اختبار SMS</button>
                  {authTestStatus.sms ? <div className={`mt-3 rounded-2xl px-4 py-3 text-sm leading-7 ${authTestStatus.sms.ok ? 'bg-emerald-50 text-emerald-800 ring-1 ring-emerald-200' : 'bg-rose-50 text-rose-800 ring-1 ring-rose-200'}`}>{authTestStatus.sms.message}{authTestStatus.sms.destinationPreview ? `
الوجهة: ${authTestStatus.sms.destinationPreview}` : ''}{authTestStatus.sms.providerMessageId ? `
معرّف المزود: ${authTestStatus.sms.providerMessageId}` : ''}</div> : null}
                </div>
                <div className="rounded-2xl bg-slate-50 p-4 ring-1 ring-slate-200">
                  <div className="font-bold text-slate-800">اختبار واتساب</div>
                  <Input label="رقم الجوال المستهدف" value={authTestDraft.whatsappTarget} onChange={(e) => updateAuthTestField('whatsappTarget', e.target.value)} placeholder="9665xxxxxxxx" />
                  <button type="button" onClick={() => runAuthDeliveryTest('whatsapp')} disabled={authTestBusy === 'delivery-whatsapp'} className="mt-3 inline-flex items-center gap-2 rounded-2xl bg-emerald-700 px-4 py-3 text-sm font-bold text-white disabled:opacity-60">{authTestBusy === 'delivery-whatsapp' ? <Loader2 className="h-4 w-4 animate-spin" /> : <Shield className="h-4 w-4" />} اختبار واتساب</button>
                  {authTestStatus.whatsapp ? <div className={`mt-3 rounded-2xl px-4 py-3 text-sm leading-7 ${authTestStatus.whatsapp.ok ? 'bg-emerald-50 text-emerald-800 ring-1 ring-emerald-200' : 'bg-rose-50 text-rose-800 ring-1 ring-rose-200'}`}>{authTestStatus.whatsapp.message}{authTestStatus.whatsapp.destinationPreview ? `
الوجهة: ${authTestStatus.whatsapp.destinationPreview}` : ''}{authTestStatus.whatsapp.providerMessageId ? `
معرّف المزود: ${authTestStatus.whatsapp.providerMessageId}` : ''}</div> : null}
                </div>
              </div>
              <div className="mt-4 rounded-2xl bg-slate-50 p-4 ring-1 ring-slate-200">
                <div className="font-bold text-slate-800">اختبار سيناريو OTP على حساب تجريبي</div>
                <div className="mt-1 text-xs leading-6 text-slate-500">سيتم إرسال رمز حقيقي أو تجريبي للمستخدم المحدد حسب القناة المختارة. هذا الاختبار يعكس شروط التطبيق الفعلية مثل التفعيل والاستثناءات وربط البريد أو الجوال.</div>
                <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
                  <Select label="المستخدم التجريبي" value={authTestDraft.otpUserId} onChange={(e) => updateAuthTestField('otpUserId', e.target.value)}>
                    <option value="">اختر مستخدمًا</option>
                    {authManagedUsers.map((user) => <option key={`otp-user-${user.id}`} value={user.id}>{user.name} — {user.username} — {getRoleLabel(user.role)}</option>)}
                  </Select>
                  <Select label="القناة" value={authTestDraft.otpDelivery} onChange={(e) => updateAuthTestField('otpDelivery', e.target.value)}>
                    {localSettings.auth?.delivery?.email ? <option value="email">البريد الإلكتروني</option> : null}
                    {localSettings.auth?.delivery?.sms ? <option value="sms">SMS</option> : null}
                    {localSettings.auth?.delivery?.whatsapp ? <option value="whatsapp">واتساب</option> : null}
                  </Select>
                  <div className="flex items-end">
                    <button type="button" onClick={runOtpScenarioTest} disabled={authTestBusy === 'otp-scenario'} className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-violet-700 px-4 py-3 text-sm font-bold text-white disabled:opacity-60">{authTestBusy === 'otp-scenario' ? <Loader2 className="h-4 w-4 animate-spin" /> : <BadgeCheck className="h-4 w-4" />} اختبار OTP على الحساب</button>
                  </div>
                </div>
                {authTestStatus.otpScenario ? <div className={`mt-4 rounded-2xl px-4 py-3 text-sm leading-7 ${authTestStatus.otpScenario.ok ? 'bg-emerald-50 text-emerald-800 ring-1 ring-emerald-200' : 'bg-rose-50 text-rose-800 ring-1 ring-rose-200'}`}>{authTestStatus.otpScenario.message}{authTestStatus.otpScenario.userName ? `
المستخدم: ${authTestStatus.otpScenario.userName}` : ''}{authTestStatus.otpScenario.destinationPreview ? `
الوجهة: ${authTestStatus.otpScenario.destinationPreview}` : ''}{authTestStatus.otpScenario.previewCode ? `
الرمز التجريبي: ${authTestStatus.otpScenario.previewCode}` : ''}{authTestStatus.otpScenario.expiresAt ? `
تنتهي الصلاحية: ${formatDateTime(authTestStatus.otpScenario.expiresAt)}` : ''}</div> : null}
              </div>
            </div>
            <div className="rounded-3xl bg-white p-5 ring-1 ring-slate-200">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <div className="font-black text-slate-800">سجل محاولات الدخول والرموز</div>
                  <div className="mt-1 text-sm leading-7 text-slate-500">يعرض نجاح وفشل ومنع تسجيل الدخول بكلمة المرور وOTP، مع تفاصيل القناة والسبب والحساب المستهدف متى توفرت البيانات.</div>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <select value={authLogFilter} onChange={(e) => setAuthLogFilter(e.target.value)} className="rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-bold text-slate-700 outline-none focus:border-sky-400">
                    <option value="all">الكل</option>
                    <option value="success">النجاحات</option>
                    <option value="failed">الإخفاقات</option>
                    <option value="blocked">الحالات الممنوعة</option>
                    <option value="otp">أحداث OTP فقط</option>
                  </select>
                  <button type="button" onClick={loadAuthLogs} disabled={authLogsBusy} className="inline-flex items-center gap-2 rounded-2xl bg-slate-100 px-4 py-2.5 text-sm font-bold text-slate-700 disabled:opacity-60">{authLogsBusy ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />} تحديث السجل</button>
                  <button type="button" onClick={() => exportAuthLogs('xlsx')} className="inline-flex items-center gap-2 rounded-2xl bg-emerald-600 px-4 py-2.5 text-sm font-bold text-white"><Download className="h-4 w-4" /> Excel</button>
                  <button type="button" onClick={() => exportAuthLogs('csv')} className="inline-flex items-center gap-2 rounded-2xl bg-sky-600 px-4 py-2.5 text-sm font-bold text-white"><Download className="h-4 w-4" /> CSV</button>
                </div>
              </div>
              <div className="mt-4 grid grid-cols-2 gap-3 md:grid-cols-4 xl:grid-cols-6">
                <div className="rounded-2xl bg-slate-50 p-3 ring-1 ring-slate-200"><div className="text-xs text-slate-500">الإجمالي</div><div className="mt-2 text-2xl font-black text-slate-900">{authLogs.length}</div></div>
                <div className="rounded-2xl bg-emerald-50 p-3 ring-1 ring-emerald-100"><div className="text-xs text-emerald-700">نجاحات</div><div className="mt-2 text-2xl font-black text-emerald-700">{authLogs.filter((entry) => ['login', 'auth_request_otp_success', 'auth_verify_otp_success'].includes(entry.action)).length}</div></div>
                <div className="rounded-2xl bg-rose-50 p-3 ring-1 ring-rose-100"><div className="text-xs text-rose-700">إخفاقات</div><div className="mt-2 text-2xl font-black text-rose-700">{authLogs.filter((entry) => ['auth_login_failed', 'auth_request_otp_failed', 'auth_verify_otp_failed'].includes(entry.action)).length}</div></div>
                <div className="rounded-2xl bg-amber-50 p-3 ring-1 ring-amber-100"><div className="text-xs text-amber-700">ممنوعة</div><div className="mt-2 text-2xl font-black text-amber-700">{authLogs.filter((entry) => ['auth_login_blocked', 'auth_request_otp_blocked', 'auth_verify_otp_blocked'].includes(entry.action)).length}</div></div>
                <div className="rounded-2xl bg-violet-50 p-3 ring-1 ring-violet-100"><div className="text-xs text-violet-700">أحداث OTP</div><div className="mt-2 text-2xl font-black text-violet-700">{authLogs.filter((entry) => String(entry.action || '').includes('otp')).length}</div></div>
                <div className="rounded-2xl bg-sky-50 p-3 ring-1 ring-sky-100"><div className="text-xs text-sky-700">المعروض الآن</div><div className="mt-2 text-2xl font-black text-sky-700">{filteredAuthLogs.length}</div></div>
              </div>
              <div className="mt-4 overflow-x-auto rounded-3xl ring-1 ring-slate-200">
                <table className="min-w-full divide-y divide-slate-200 text-right text-sm">
                  <thead className="bg-slate-50 text-slate-600">
                    <tr>
                      <th className="px-4 py-3 font-bold">الوقت</th>
                      <th className="px-4 py-3 font-bold">الحدث</th>
                      <th className="px-4 py-3 font-bold">الحساب</th>
                      <th className="px-4 py-3 font-bold">الدور</th>
                      <th className="px-4 py-3 font-bold">القناة / السبب</th>
                      <th className="px-4 py-3 font-bold">تفاصيل</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 bg-white">
                    {filteredAuthLogs.length ? filteredAuthLogs.map((entry) => {
                      const meta = getAuthActionMeta(entry.action);
                      const details = entry.details || {};
                      return (
                        <tr key={`auth-log-${entry.id}`} className="align-top">
                          <td className="px-4 py-3 font-medium text-slate-700">{formatDateTime(entry.createdAt)}</td>
                          <td className="px-4 py-3"><Badge tone={meta.tone}>{meta.label}</Badge></td>
                          <td className="px-4 py-3 text-slate-700">{details.userName || details.username || entry.actorUsername || details.identifier || '—'}</td>
                          <td className="px-4 py-3 text-slate-500">{getRoleLabel(details.role || entry.actorRole || '') || '—'}</td>
                          <td className="px-4 py-3 text-slate-600">{details.delivery ? <div>القناة: {details.delivery === 'email' ? 'البريد' : details.delivery === 'sms' ? 'SMS' : details.delivery === 'whatsapp' ? 'واتساب' : details.delivery}</div> : null}{details.reason ? <div>السبب: {getAuthReasonLabel(details.reason)}</div> : null}{details.destinationPreview ? <div>الوجهة: {details.destinationPreview}</div> : null}</td>
                          <td className="px-4 py-3 text-slate-600">{details.userId ? <div>المستخدم #{details.userId}</div> : null}{details.identifier ? <div>المعرّف: {details.identifier}</div> : null}{details.tokenPreview ? <div>جلسة: {details.tokenPreview}...</div> : null}{!details.userId && !details.identifier && !details.tokenPreview && !details.reason && !details.destinationPreview ? '—' : null}</td>
                        </tr>
                      );
                    }) : <tr><td colSpan={6} className="px-4 py-8 text-center text-slate-500">{authLogsBusy ? 'جارٍ تحميل السجل...' : 'لا توجد سجلات مطابقة للفلاتر الحالية.'}</td></tr>}
                  </tbody>
                </table>
              </div>
            </div>
            <div className="rounded-3xl bg-emerald-50 p-4 text-sm leading-7 text-emerald-900 ring-1 ring-emerald-100">هذه الصفحة عامة على مستوى المنصة ويعتمدها الأدمن العام مباشرة. جميع إعدادات OTP وPasswordless والبريد وSMS وواتساب هنا مستقلة عن المدارس. وإذا جعلت النطاق «للمحددّين فقط»، فلن يقبل النظام طلب OTP إلا للحسابات أو الأدوار التي اخترتها هنا.</div>
          </div>
        )}

        {tab === "backup" && currentUser?.role === "superadmin" && (          <div className="space-y-4">
            <div className="grid grid-cols-1 gap-4 xl:grid-cols-[1.3fr_.7fr]">
              <div className="rounded-3xl bg-slate-50 p-5 ring-1 ring-slate-200">
                <div className="font-bold text-slate-800">نسخة احتياطية واستعادة</div>
                <div className="mt-2 text-sm leading-7 text-slate-600">يمكنك أخذ نسخة كاملة من المدارس والطلاب والإعدادات وسجل الحضور والإجراءات، ثم استعادتها لاحقًا داخل نفس الواجهة.</div>
                <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-3">
                  <button onClick={onExportBackup} className="inline-flex items-center justify-center gap-2 rounded-2xl bg-sky-700 px-4 py-3 font-bold text-white"><Download className="h-4 w-4" /> تصدير JSON</button>
                  <button onClick={() => fileRef.current?.click()} className="inline-flex items-center justify-center gap-2 rounded-2xl bg-slate-100 px-4 py-3 font-bold text-slate-700"><Upload className="h-4 w-4" /> استعادة نسخة</button>
                  <button onClick={onResetData} className="inline-flex items-center justify-center gap-2 rounded-2xl bg-rose-50 px-4 py-3 font-bold text-rose-700"><RefreshCw className="h-4 w-4" /> إعادة ضبط تجريبية</button>
                </div>
                <input ref={fileRef} type="file" accept="application/json" className="hidden" onChange={handleRestoreFile} />
              </div>
              <div className="rounded-3xl bg-white p-5 ring-1 ring-slate-200">
                <div className="font-bold text-slate-800">الحماية اليومية</div>
                <div className="mt-3 space-y-3 text-sm leading-7 text-slate-600">
                  <div className="rounded-2xl bg-emerald-50 px-4 py-3 ring-1 ring-emerald-100">يتم إنشاء نسخة احتياطية يومية تلقائيًا للنظام الرئيسي ولكل مدرسة بشكل مستقل.</div>
                  <div className="rounded-2xl bg-slate-50 px-4 py-3 ring-1 ring-slate-200">الاحتفاظ الافتراضي: آخر 30 يومًا من النسخ.</div>
                  <div className="rounded-2xl bg-sky-50 px-4 py-3 ring-1 ring-sky-100">أفضل ممارسة: خذ نسخة يدوية إضافية قبل أي استيراد جماعي أو تعديل بنيوي كبير.</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {tab === "diagnostics" && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3 md:grid-cols-5">
              {schoolDiagnostics.map((item) => (
                <div key={item.label} className="rounded-3xl bg-slate-50 p-4 ring-1 ring-slate-200">
                  <div className="text-xs text-slate-500">{item.label}</div>
                  <div className="mt-2 text-3xl font-black text-slate-900">{item.value}</div>
                  <div className="mt-2"><Badge tone={item.tone}>{selectedSchool?.name || "المدرسة الحالية"}</Badge></div>
                </div>
              ))}
            </div>
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
              {readinessChecks.map((item) => (
                <div key={item.title} className="rounded-3xl bg-white p-5 ring-1 ring-slate-200">
                  <div className="flex items-center justify-between gap-3">
                    <div className="font-bold text-slate-800">{item.title}</div>
                    <Badge tone={item.ok ? "green" : "amber"}>{item.ok ? "جاهز" : "يحتاج مراجعة"}</Badge>
                  </div>
                  <div className="mt-3 text-sm leading-7 text-slate-600">{item.description}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="mt-6 flex flex-wrap gap-3">
          <button onClick={save} className="inline-flex items-center gap-2 rounded-2xl bg-sky-700 px-5 py-3 font-bold text-white"><Save className="h-4 w-4" /> حفظ الإعدادات</button>
          <button onClick={() => setLocalSettings(settings)} className="inline-flex items-center gap-2 rounded-2xl bg-slate-100 px-5 py-3 font-bold text-slate-700"><RefreshCw className="h-4 w-4" /> التراجع</button>
        </div>
      </SectionCard>
    </div>
  );
}

function ActionCatalogEditor({ title, description, mode, items, onChange }) {
  const defaultPoints = mode === "violation" ? 3 : 5;
  const [draft, setDraft] = useState({ title: "", points: defaultPoints, description: "" });

  useEffect(() => {
    setDraft({ title: "", points: defaultPoints, description: "" });
  }, [mode]);

  const tone = mode === "reward" ? "green" : mode === "violation" ? "rose" : "blue";
  const scoreLabel = mode === "violation" ? "درجة الخصم" : "الدرجة";
  const normalizePoints = (value) => mode === "violation" ? -Math.abs(safeNumber(value)) : Math.abs(safeNumber(value));

  const addItem = () => {
    if (!draft.title.trim()) return;
    onChange([
      ...items,
      {
        id: `${mode}-${Date.now()}`,
        title: draft.title.trim(),
        points: normalizePoints(draft.points),
        description: draft.description.trim(),
      },
    ]);
    setDraft({ title: "", points: defaultPoints, description: "" });
  };

  const updateItem = (id, patch) => {
    onChange(items.map((item) => item.id !== id ? item : { ...item, ...patch }));
  };

  return (
    <div className="rounded-3xl bg-slate-50 p-5 ring-1 ring-slate-200">
      <div className="font-bold text-slate-800">{title}</div>
      <div className="mt-2 text-sm leading-7 text-slate-600">{description}</div>
      <div className="mt-4 space-y-3">
        {items.map((item) => (
          <div key={item.id} className="rounded-2xl bg-white p-4 ring-1 ring-slate-200">
            <div className="grid grid-cols-1 gap-3 md:grid-cols-[1.2fr_.4fr_auto]">
              <Input label="اسم البند" value={item.title} onChange={(e) => updateItem(item.id, { title: e.target.value })} />
              <Input label={scoreLabel} type="number" value={mode === "violation" ? Math.abs(item.points) : item.points} onChange={(e) => updateItem(item.id, { points: normalizePoints(e.target.value) })} />
              <div className="flex items-end">
                <button onClick={() => onChange(items.filter((entry) => entry.id !== item.id))} className="rounded-2xl bg-rose-50 px-4 py-3 text-sm font-bold text-rose-700">حذف</button>
              </div>
            </div>
            <div className="mt-3">
              <label className="block">
                <span className="mb-2 block text-sm font-bold text-slate-700">الوصف</span>
                <textarea value={item.description || ""} onChange={(e) => updateItem(item.id, { description: e.target.value })} className="min-h-[84px] w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none" />
              </label>
            </div>
            <div className="mt-3"><Badge tone={tone}>{item.points > 0 ? `+${item.points}` : item.points} نقطة</Badge></div>
          </div>
        ))}
      </div>
      <div className="mt-5 rounded-2xl bg-white p-4 ring-1 ring-slate-200">
        <div className="mb-3 font-bold text-slate-800">إضافة بند جديد</div>
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          <Input label="اسم البند" value={draft.title} onChange={(e) => setDraft((prev) => ({ ...prev, title: e.target.value }))} />
          <Input label={scoreLabel} type="number" value={draft.points} onChange={(e) => setDraft((prev) => ({ ...prev, points: safeNumber(e.target.value) }))} />
        </div>
        <div className="mt-3">
          <label className="block">
            <span className="mb-2 block text-sm font-bold text-slate-700">الوصف</span>
            <textarea value={draft.description} onChange={(e) => setDraft((prev) => ({ ...prev, description: e.target.value }))} className="min-h-[84px] w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none" />
          </label>
        </div>
        <button onClick={addItem} className="mt-4 rounded-2xl bg-sky-700 px-4 py-3 text-sm font-bold text-white">إضافة البند</button>
      </div>
    </div>
  );
}

function StudentRolePage({ selectedSchool, currentUser }) {
  const forcedStudentId = currentUser?.studentId || null;
  const roleStudents = useMemo(() => getUnifiedSchoolStudents(selectedSchool, { includeArchived: false, preferStructure: true }), [selectedSchool]);
  const [studentId, setStudentId] = useState(forcedStudentId || roleStudents[0]?.id || null);

  useEffect(() => {
    setStudentId(forcedStudentId || getUnifiedSchoolStudents(selectedSchool, { includeArchived: false, preferStructure: true })[0]?.id || null);
  }, [forcedStudentId, selectedSchool]);

  const student = roleStudents.find((item) => String(item.id) === String(forcedStudentId || studentId)) || roleStudents[0];
  const company = getUnifiedCompanyRows(selectedSchool, { preferStructure: true }).find((item) => (student?.source === 'structure' ? String(item.rawId || item.id) === String(student.classroomId) : String(item.id) === String(student?.companyId)));
  if (!student) return null;

  return (
    <div className="space-y-6">
      <SectionCard
        title="واجهة الطالب"
        icon={UserCircle2}
        action={
          forcedStudentId ? <Badge tone="blue">حساب مرتبط بالطالب</Badge> : (
            <select value={student.id} onChange={(e) => setStudentId(e.target.value)} className="rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm font-bold outline-none">
              {roleStudents.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}
            </select>
          )
        }
      >
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <BarcodeCard student={student} companyName={company?.name || "—"} schoolName={selectedSchool?.name || "—"} />
          <div className="rounded-3xl bg-white p-5 ring-1 ring-slate-200">
            <div className="font-bold text-slate-800">أدائي</div>
            <div className="mt-4 grid grid-cols-2 gap-3">
              <div className="rounded-2xl bg-slate-50 p-4 ring-1 ring-slate-200"><div className="text-2xl font-black">{student.points}</div><div className="text-sm text-slate-500">نقاطي</div></div>
              <div className="rounded-2xl bg-slate-50 p-4 ring-1 ring-slate-200"><div className="text-2xl font-black">{student.attendanceRate}%</div><div className="text-sm text-slate-500">حضوري</div></div>
            </div>
            <div className="mt-4 rounded-2xl bg-slate-50 p-4 ring-1 ring-slate-200">
              <div className="text-sm text-slate-500">آخر حالة حضور</div>
              <div className="mt-2 text-lg font-black text-slate-800">{student.status}</div>
            </div>
          </div>
          <div className="rounded-3xl bg-white p-5 ring-1 ring-slate-200">
            <div className="font-bold text-slate-800">شركتي</div>
            <div className="mt-3 text-2xl font-black">{company?.name}</div>
            <div className="mt-2 text-sm text-slate-500">الفصل {company?.className}</div>
            <div className="mt-4 rounded-2xl bg-emerald-50 p-4 text-emerald-800 ring-1 ring-emerald-100">استمر في الحضور المبكر ورفع نقاط شركتك.</div>
          </div>
        </div>
      </SectionCard>
    </div>
  );
}

export default function App() {
  const initial = useMemo(() => loadPersistedState(), []);
  const publicMode = useMemo(() => getPublicModeFromLocation(), []);
  const [schools, setSchools] = useState(initial.schools);
  const [users, setUsers] = useState(initial.users);
  const [currentUserId, setCurrentUserId] = useState(initial.currentUserId);
  const [activePage, setActivePage] = useState(initial.activePage);
  const [selectedSchoolId, setSelectedSchoolId] = useState(initial.selectedSchoolId);
  const [attendanceMethod, setAttendanceMethod] = useState(initial.attendanceMethod);
  const [scanLog, setScanLog] = useState(initial.scanLog);
  const [actionLog, setActionLog] = useState(initial.actionLog || []);
  const [settings, setSettings] = useState(initial.settings);
  const [notifications, setNotifications] = useState(initial.notifications);
  const [editingUserId, setEditingUserId] = useState(null);
  const [booting, setBooting] = useState(true);
  const [syncStatus, setSyncStatus] = useState(getSessionToken() ? "connecting" : "idle");
  const [executiveReport, setExecutiveReport] = useState(null);
  const [accountSecurityOpen, setAccountSecurityOpen] = useState(false);
  const [accountSecurityLoading, setAccountSecurityLoading] = useState(false);
  const [resetUserPasswordOpen, setResetUserPasswordOpen] = useState(false);
  const [resetUserPasswordLoading, setResetUserPasswordLoading] = useState(false);
  const [resetPasswordTargetUserId, setResetPasswordTargetUserId] = useState(null);
  const bootstrappedRef = useRef(false);
  const saveTimerRef = useRef(null);

  const sharedState = useMemo(() => ({
    version: BACKUP_VERSION,
    schools,
    users,
    scanLog,
    actionLog,
    settings,
    notifications,
  }), [schools, users, scanLog, actionLog, settings, notifications]);

  const applyServerStatePayload = useCallback((serverState, uiState = loadUiState()) => {
    const next = buildHydratedClientState(serverState || {}, uiState);
    setSchools(next.schools);
    setUsers(next.users);
    setScanLog(next.scanLog);
    setActionLog(next.actionLog || []);
    setSettings(next.settings);
    setNotifications(next.notifications);
    saveServerCache(serverState || {});
    return next;
  }, []);

  const currentUser = useMemo(() => applySchoolAccessToUser(users.find((user) => user.id === currentUserId) || null, schools), [users, currentUserId, schools]);
  const currentRoleObject = roles.find((role) => role.key === currentUser?.role) || roles[0];
  const RoleIcon = currentRoleObject.icon;

  const selectedSchool = useMemo(() => {
    if (currentUser?.role && currentUser.role !== "superadmin") {
      return schools.find((school) => school.id === currentUser.schoolId) || schools[0];
    }
    return schools.find((school) => school.id === selectedSchoolId) || schools[0];
  }, [schools, selectedSchoolId, currentUser]);

  const allowedNav = useMemo(() => navItems.filter((item) => {
    if (item.key === "schoolStructure") return currentUser?.role === "principal";
    if (Array.isArray(item.roles) && item.roles.length && !item.roles.includes(currentUser?.role)) return false;
    return canAccessPermission(currentUser, item.permission);
  }), [currentUser]);
  const editingUser = users.find((user) => user.id === editingUserId) || null;
  const resetPasswordTargetUser = users.find((user) => user.id === resetPasswordTargetUserId) || null;

  useEffect(() => {
    if (!currentUser) return;
    if (currentUser.role !== "superadmin" && currentUser.schoolId && selectedSchoolId !== currentUser.schoolId) {
      setSelectedSchoolId(currentUser.schoolId);
    }
  }, [currentUser, selectedSchoolId]);

  useEffect(() => {
    if (!currentUser) return;
    if (!allowedNav.some((item) => item.key === activePage)) {
      setActivePage(getDefaultLandingPage(currentUser));
    }
  }, [activePage, allowedNav, currentUser]);

  useEffect(() => {
    if (!selectedSchool && schools[0]) {
      setSelectedSchoolId(schools[0].id);
    }
  }, [selectedSchool, schools]);

  useEffect(() => {
    saveUiState({
      currentUserId,
      selectedSchoolId,
      activePage,
      attendanceMethod,
    });
  }, [currentUserId, selectedSchoolId, activePage, attendanceMethod]);

  useEffect(() => {
    saveServerCache(sharedState);
    if (typeof window !== "undefined") {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...sharedState, currentUserId, selectedSchoolId, activePage, attendanceMethod }));
    }
  }, [sharedState, currentUserId, selectedSchoolId, activePage, attendanceMethod]);

  useEffect(() => {
    let cancelled = false;
    const bootstrap = async () => {
      if (publicMode) {
        setBooting(false);
        return;
      }
      const token = getSessionToken();
      try {
        setSyncStatus(token ? "connecting" : "idle");
        const response = await apiRequest("/api/bootstrap", { token });
        if (cancelled) return;
        const uiState = loadUiState();
        const next = buildHydratedClientState(response.state || {}, uiState);
        setSchools(next.schools);
        setUsers(next.users);
        setScanLog(next.scanLog);
        setActionLog(next.actionLog || []);
        setSettings(next.settings);
        setNotifications(next.notifications);
        saveServerCache(response.state || {});
        const sessionUser = response.sessionUser ? next.users.find((item) => item.id === response.sessionUser.id) : null;
        if (!sessionUser) setSessionToken("");
        setCurrentUserId(sessionUser?.id || null);
        setSelectedSchoolId(sessionUser?.role && sessionUser.role !== "superadmin" ? sessionUser.schoolId : (uiState.selectedSchoolId || next.selectedSchoolId));
        setActivePage(sessionUser ? (uiState.activePage || getDefaultLandingPage(sessionUser)) : "dashboard");
        setAttendanceMethod(uiState.attendanceMethod || "barcode");
        setSyncStatus(sessionUser ? "online" : "idle");
      } catch (error) {
        console.error(error);
        setSyncStatus("offline");
      } finally {
        if (!cancelled) {
          setBooting(false);
          bootstrappedRef.current = true;
        }
      }
    };
    bootstrap();
    return () => {
      cancelled = true;
    };
  }, [publicMode]);

  useEffect(() => {
    if (!bootstrappedRef.current || !currentUser) return;
    const token = getSessionToken();
    if (!token) return;
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    saveTimerRef.current = setTimeout(async () => {
      try {
        setSyncStatus("saving");
        const response = await apiRequest("/api/state/save", { method: "POST", token, body: { state: sharedState } });
        saveServerCache(response.state || sharedState);
        setSyncStatus("saved");
      } catch (error) {
        console.error(error);
        setSyncStatus("error");
      }
    }, 700);
    return () => {
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    };
  }, [sharedState, currentUser]);

  const pushNotification = (title, body) => {
    const time = new Intl.DateTimeFormat("ar-SA", { hour: "2-digit", minute: "2-digit" }).format(new Date());
    setNotifications((prev) => [{ id: Date.now(), title, body, time }, ...prev].slice(0, 20));
  };

  const handleLogin = async (username, password) => {
    try {
      const response = await apiRequest("/api/auth/login", { method: "POST", body: { username, password } });
      const user = users.find((item) => item.id === response.user?.id) || response.user;
      const fallbackSchoolId = response.user?.role === "superadmin"
        ? (selectedSchoolId || schools[0]?.id || null)
        : (response.user?.schoolId || schools[0]?.id || null);
      setSessionToken(response.token || "");
      setCurrentUserId(response.user?.id || null);
      setSelectedSchoolId(fallbackSchoolId);
      setActivePage(response.user?.role === "superadmin" ? "schools" : getDefaultLandingPage(user));
      setEditingUserId(null);
      setSyncStatus("online");
      pushNotification("تسجيل دخول", `تم الدخول بحساب ${response.user?.name || user?.name || username}.`);
      return { ok: true };
    } catch (error) {
      console.error(error);
      return { ok: false, message: error?.message || "تعذر تسجيل الدخول." };
    }
  };

  const finishLoginFromAuthResponse = (response, identifier) => {
    const user = users.find((item) => item.id === response.user?.id) || response.user;
    const fallbackSchoolId = response.user?.role === 'superadmin' ? (selectedSchoolId || schools[0]?.id || null) : (response.user?.schoolId || schools[0]?.id || null);
    setSessionToken(response.token || '');
    setCurrentUserId(response.user?.id || null);
    setSelectedSchoolId(fallbackSchoolId);
    setActivePage(response.user?.role === 'superadmin' ? 'schools' : getDefaultLandingPage(user));
    setEditingUserId(null);
    setSyncStatus('online');
    pushNotification('تسجيل دخول', `تم الدخول بحساب ${response.user?.name || user?.name || identifier}.`);
  };

  const handleRequestOtpLogin = async (identifier, delivery) => {
    try {
      const response = await apiRequest('/api/auth/request-otp', { method: 'POST', body: { identifier, delivery } });
      return { ok: true, message: response.message, previewCode: response.previewCode || '' };
    } catch (error) {
      return { ok: false, message: error?.message || 'تعذر إرسال رمز التحقق.' };
    }
  };

  const handleVerifyOtpLogin = async (identifier, code) => {
    try {
      const response = await apiRequest('/api/auth/verify-otp', { method: 'POST', body: { identifier, code } });
      finishLoginFromAuthResponse(response, identifier);
      return { ok: true };
    } catch (error) {
      return { ok: false, message: error?.message || 'تعذر التحقق من الرمز.' };
    }
  };

  const handleLogout = async () => {
    if (!currentUser) return;
    const token = getSessionToken();
    try {
      if (token) await apiRequest("/api/auth/logout", { method: "POST", token, body: {} });
    } catch (error) {
      console.error(error);
    }
    setSessionToken("");
    pushNotification("تسجيل خروج", `تم تسجيل خروج ${currentUser.name}.`);
    setCurrentUserId(null);
    setEditingUserId(null);
    setAccountSecurityOpen(false);
    setResetUserPasswordOpen(false);
    setResetPasswordTargetUserId(null);
    setSyncStatus("idle");
  };

  const handleChangeOwnPassword = async ({ currentPassword, newPassword, confirmPassword }) => {
    const token = getSessionToken();
    if (!token) return { ok: false, message: 'الجلسة الحالية غير متصلة بالخادم.' };
    try {
      setAccountSecurityLoading(true);
      const response = await apiRequest('/api/auth/change-password', { method: 'POST', token, body: { currentPassword, newPassword, confirmPassword } });
      pushNotification('أمان الحساب', response.message || 'تم تحديث كلمة المرور.');
      setAccountSecurityOpen(false);
      return { ok: true, message: response.message };
    } catch (error) {
      console.error(error);
      return { ok: false, message: error?.message || 'تعذر تحديث كلمة المرور.' };
    } finally {
      setAccountSecurityLoading(false);
    }
  };


  const handleAdminResetUserPassword = async ({ userId, newPassword, confirmPassword }) => {
    const token = getSessionToken();
    if (!token) return { ok: false, message: 'الجلسة الحالية غير متصلة بالخادم.' };
    try {
      setResetUserPasswordLoading(true);
      const response = await apiRequest('/api/auth/admin-reset-password', { method: 'POST', token, body: { userId, newPassword, confirmPassword } });
      pushNotification('إدارة المستخدمين', response.message || 'تمت إعادة تعيين كلمة المرور.');
      setResetUserPasswordOpen(false);
      setResetPasswordTargetUserId(null);
      return { ok: true, message: response.message };
    } catch (error) {
      console.error(error);
      return { ok: false, message: error?.message || 'تعذر إعادة تعيين كلمة المرور.' };
    } finally {
      setResetUserPasswordLoading(false);
    }
  };

  useEffect(() => {
    if (!currentUser || !selectedSchool || publicMode) return;
    if (!canAccessPermission(currentUser, "reports")) return;
    let cancelled = false;
    apiRequest(`/api/schools/${selectedSchool.id}/reports/executive`, { token: getSessionToken() })
      .then((response) => {
        if (!cancelled) setExecutiveReport(response.report || null);
      })
      .catch(() => {
        if (!cancelled) setExecutiveReport(null);
      });
    return () => {
      cancelled = true;
    };
  }, [currentUser, selectedSchool, scanLog, actionLog, publicMode]);

  const handleSaveSchoolStructureProfile = (payload) => {
    if (!selectedSchool) return;
    setSchools((prev) => prev.map((school) => school.id !== selectedSchool.id ? school : {
      ...school,
      structure: {
        profile: {
          schoolName: payload.schoolName || school.name || "",
          schoolGender: payload.schoolGender || "boys",
          stages: Array.isArray(payload.stages) ? payload.stages : [],
        },
        stageConfigs: school.structure?.stageConfigs || [],
        classrooms: school.structure?.classrooms || [],
      },
    }));
    pushNotification("حفظ الهيكل المدرسي", `تم حفظ بيانات المدرسة ${payload.schoolName || selectedSchool.name} داخل وحدة الهيكل المدرسي.`);
  };

  const handleSaveSchoolStructureStageConfigs = (stageConfigs) => {
    if (!selectedSchool) return;
    const normalized = Array.isArray(stageConfigs) ? stageConfigs.map((item) => ({
      stage: item.stage,
      stageLabel: item.stageLabel || SCHOOL_STAGE_OPTIONS.find((stage) => stage.key === item.stage)?.label || item.stage,
      gradeKey: item.gradeKey,
      gradeLabel: item.gradeLabel,
      classCount: Math.max(1, Math.min(20, Number(item.classCount) || 1)),
    })) : [];
    setSchools((prev) => prev.map((school) => school.id !== selectedSchool.id ? school : {
      ...school,
      structure: {
        profile: school.structure?.profile || {
          schoolName: school.name || "",
          schoolGender: "boys",
          stages: [],
        },
        stageConfigs: normalized,
        classrooms: school.structure?.classrooms || [],
      },
    }));
    pushNotification("تهيئة الصفوف والفصول", `تم حفظ ${normalized.length} صفوف مهيأة داخل الهيكل المدرسي لمدرسة ${selectedSchool.name}.`);
  };

  const handleGenerateSchoolStructureClassrooms = (stageConfigs) => {
    if (!selectedSchool) return;
    const normalizedRows = Array.isArray(stageConfigs) ? stageConfigs.map((item) => ({
      stage: item.stage,
      stageLabel: item.stageLabel || SCHOOL_STAGE_OPTIONS.find((stage) => stage.key === item.stage)?.label || item.stage,
      gradeKey: item.gradeKey,
      gradeLabel: item.gradeLabel,
      classCount: Math.max(1, Math.min(20, Number(item.classCount) || 1)),
    })) : [];
    const classrooms = generateSchoolStructureClassrooms(normalizedRows).map((item) => ({ ...item, students: Array.isArray(item.students) ? item.students : [] }));
    setSchools((prev) => prev.map((school) => school.id !== selectedSchool.id ? school : {
      ...school,
      structure: {
        profile: school.structure?.profile || {
          schoolName: school.name || "",
          schoolGender: "boys",
          stages: [],
        },
        stageConfigs: school.structure?.stageConfigs || normalizedRows,
        classrooms,
      },
    }));
    pushNotification("توليد الفصول", `تم توليد ${classrooms.length} فصلًا فعليًا داخل الهيكل المدرسي لمدرسة ${selectedSchool.name} دون أي ربط تشغيلي مع المكونات الحالية.`);
  };

  const handleUpdateSchoolStructureClassroom = (classroomId, payload) => {
    if (!selectedSchool || !classroomId) return;
    setSchools((prev) => prev.map((school) => school.id !== selectedSchool.id ? school : {
      ...school,
      structure: {
        profile: school.structure?.profile || { schoolName: school.name || "", schoolGender: "boys", stages: [] },
        stageConfigs: school.structure?.stageConfigs || [],
        classrooms: (school.structure?.classrooms || []).map((classroom) => classroom.id !== classroomId ? classroom : {
          ...classroom,
          companyName: payload.companyName || "",
          leaderUserId: payload.leaderUserId || null,
        }),
      },
    }));
    pushNotification("تحديث بيانات الفصل", `تم حفظ بيانات الفصل داخل الهيكل المدرسي لمدرسة ${selectedSchool.name}.`);
  };
  const handleDeleteSchoolStructureClassroom = (classroomId) => {
    if (!selectedSchool || !classroomId) return;
    setSchools((prev) => prev.map((school) => school.id !== selectedSchool.id ? school : {
      ...school,
      structure: {
        profile: school.structure?.profile || { schoolName: school.name || "", schoolGender: "boys", stages: [] },
        stageConfigs: school.structure?.stageConfigs || [],
        transferLog: (school.structure?.transferLog || []).filter((entry) => String(entry.fromClassroomId || "") !== String(classroomId) && String(entry.toClassroomId || "") !== String(classroomId)),
        classrooms: (school.structure?.classrooms || []).filter((classroom) => String(classroom.id) !== String(classroomId)),
      },
    }));
    pushNotification("حذف فصل", `تم حذف الفصل من الهيكل المدرسي في ${selectedSchool.name}.`);
  };

  const handleClearSchoolStructureClassroomStudents = (classroomId) => {
    if (!selectedSchool || !classroomId) return;
    setSchools((prev) => prev.map((school) => school.id !== selectedSchool.id ? school : {
      ...school,
      structure: {
        profile: school.structure?.profile || { schoolName: school.name || "", schoolGender: "boys", stages: [] },
        stageConfigs: school.structure?.stageConfigs || [],
        transferLog: school.structure?.transferLog || [],
        classrooms: (school.structure?.classrooms || []).map((classroom) => String(classroom.id) !== String(classroomId) ? classroom : {
          ...classroom,
          students: [],
          studentCount: 0,
        }),
      },
    }));
    pushNotification("حذف قائمة الأسماء", `تم حذف جميع الأسماء من الفصل داخل الهيكل المدرسي في ${selectedSchool.name}.`);
  };

  const handleAddStudentToSchoolStructureClassroom = (classroomId, payload) => {
    if (!selectedSchool || !classroomId) return;
    const nextId = Date.now();
    const normalizedMobile = String(payload.guardianMobile || "").replace(/\s+/g, "").trim();
    setSchools((prev) => prev.map((school) => school.id !== selectedSchool.id ? school : {
      ...school,
      structure: {
        profile: school.structure?.profile || { schoolName: school.name || "", schoolGender: "boys", stages: [] },
        stageConfigs: school.structure?.stageConfigs || [],
        transferLog: school.structure?.transferLog || [],
        classrooms: (school.structure?.classrooms || []).map((classroom) => classroom.id !== classroomId ? classroom : {
          ...classroom,
          students: [...(Array.isArray(classroom.students) ? classroom.students : []), {
            id: nextId,
            fullName: payload.fullName?.trim() || "",
            guardianName: payload.guardianName?.trim() || "",
            guardianMobile: normalizedMobile,
            identityNumber: String(payload.identityNumber || "").trim(),
            notes: payload.notes?.trim() || "",
            source: "manual",
            status: "active",
          }],
          studentCount: ((Array.isArray(classroom.students) ? classroom.students.length : 0) + 1),
        }),
      },
    }));
    pushNotification("إضافة طالب للفصل", `تمت إضافة الطالب ${payload.fullName?.trim() || "الجديد"} داخل الهيكل المدرسي لمدرسة ${selectedSchool.name}.`);
  };

  const handleUpdateStudentInSchoolStructureClassroom = (classroomId, studentId, payload) => {
    if (!selectedSchool || !classroomId || !studentId) return;
    const normalizedMobile = String(payload.guardianMobile || "").replace(/\s+/g, "").trim();
    setSchools((prev) => prev.map((school) => school.id !== selectedSchool.id ? school : {
      ...school,
      structure: {
        profile: school.structure?.profile || { schoolName: school.name || "", schoolGender: "boys", stages: [] },
        stageConfigs: school.structure?.stageConfigs || [],
        transferLog: school.structure?.transferLog || [],
        classrooms: (school.structure?.classrooms || []).map((classroom) => classroom.id !== classroomId ? classroom : {
          ...classroom,
          students: (classroom.students || []).map((student) => student.id !== studentId ? student : {
            ...student,
            fullName: payload.fullName?.trim() || student.fullName || "",
            guardianName: payload.guardianName?.trim() || "",
            guardianMobile: normalizedMobile,
            identityNumber: String(payload.identityNumber || "").trim(),
            notes: payload.notes?.trim() || "",
          }),
        }),
      },
    }));
    pushNotification("تعديل بيانات الطالب", `تم تحديث بيانات الطالب داخل الهيكل المدرسي لمدرسة ${selectedSchool.name}.`);
  };

  const handleArchiveStudentInSchoolStructureClassroom = (classroomId, studentId) => {
    if (!selectedSchool || !classroomId || !studentId) return;
    setSchools((prev) => prev.map((school) => school.id !== selectedSchool.id ? school : {
      ...school,
      structure: {
        profile: school.structure?.profile || { schoolName: school.name || "", schoolGender: "boys", stages: [] },
        stageConfigs: school.structure?.stageConfigs || [],
        transferLog: school.structure?.transferLog || [],
        classrooms: (school.structure?.classrooms || []).map((classroom) => classroom.id !== classroomId ? classroom : {
          ...classroom,
          students: (classroom.students || []).map((student) => student.id !== studentId ? student : {
            ...student,
            status: "archived",
            archivedAt: new Date().toISOString(),
          }),
        }),
      },
    }));
    pushNotification("أرشفة الطالب", `تمت أرشفة الطالب داخل الهيكل المدرسي لمدرسة ${selectedSchool.name} دون حذفه نهائيًا.`);
  };

  const handleTransferStudentInSchoolStructureClassroom = (fromClassroomId, studentId, toClassroomId, reason) => {
    const fromId = String(fromClassroomId || "");
    const studentKey = String(studentId || "");
    const toId = String(toClassroomId || "");
    if (!selectedSchool || !fromId || !studentKey || !toId || fromId === toId) return;
    setSchools((prev) => prev.map((school) => {
      if (school.id !== selectedSchool.id) return school;
      const classrooms = Array.isArray(school.structure?.classrooms) ? school.structure.classrooms : [];
      const fromClassroom = classrooms.find((item) => String(item.id) === fromId);
      const toClassroom = classrooms.find((item) => String(item.id) === toId);
      const student = fromClassroom?.students?.find((item) => String(item.id) === studentKey);
      if (!fromClassroom || !toClassroom || !student) return school;
      const movedStudent = { ...student, status: "active", transferredAt: new Date().toISOString() };
      const transferEntry = {
        id: `transfer-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        studentId: String(student.id),
        studentName: student.fullName || "",
        fromClassroomId: fromId,
        fromClassroomName: fromClassroom.name || "",
        toClassroomId: toId,
        toClassroomName: toClassroom.name || "",
        reason: String(reason || "").trim(),
        createdAt: new Date().toISOString(),
      };
      return {
        ...school,
        structure: {
          ...(school.structure || {}),
          profile: school.structure?.profile || { schoolName: school.name || "", schoolGender: "boys", stages: [] },
          stageConfigs: school.structure?.stageConfigs || [],
          transferLog: [...(Array.isArray(school.structure?.transferLog) ? school.structure.transferLog : []), transferEntry],
          classrooms: classrooms.map((classroom) => {
            if (String(classroom.id) === fromId) {
              const remaining = (Array.isArray(classroom.students) ? classroom.students : []).filter((item) => String(item.id) !== studentKey);
              return { ...classroom, students: remaining, studentCount: remaining.length };
            }
            if (String(classroom.id) === toId) {
              const nextStudents = [...(Array.isArray(classroom.students) ? classroom.students : []), movedStudent];
              return { ...classroom, students: nextStudents, studentCount: nextStudents.length };
            }
            return classroom;
          }),
        },
      };
    }));
    pushNotification("نقل الطالب", `تم نقل الطالب داخل الهيكل المدرسي لمدرسة ${selectedSchool.name} مع حفظ سجل الحركة.`);
  };

  const handleImportStudentsToSchoolStructureClassroom = (classroomId, rows) => {
    const targetId = String(classroomId || "");
    const incomingRows = Array.isArray(rows) ? rows : [];
    if (!selectedSchool || !targetId || !incomingRows.length) return { importedCount: 0, skippedCount: 0 };
    let importedCount = 0;
    let skippedCount = 0;
    setSchools((prev) => prev.map((school) => {
      if (school.id !== selectedSchool.id) return school;
      return {
        ...school,
        structure: {
          ...(school.structure || {}),
          profile: school.structure?.profile || { schoolName: school.name || "", schoolGender: "boys", stages: [] },
          stageConfigs: school.structure?.stageConfigs || [],
          transferLog: school.structure?.transferLog || [],
          classrooms: (school.structure?.classrooms || []).map((classroom) => {
            if (String(classroom.id) !== targetId) return classroom;
            const currentStudents = Array.isArray(classroom.students) ? classroom.students : [];
            const nextStudents = [...currentStudents];
            incomingRows.forEach((row, index) => {
              const fullName = String(row.fullName || "").trim();
              const identityNumber = String(row.identityNumber || "").trim();
              const guardianMobile = String(row.guardianMobile || "").replace(/\s+/g, "").trim();
              if (!fullName) {
                skippedCount += 1;
                return;
              }
              const duplicateExists = nextStudents.some((student) => {
                const sameIdentity = identityNumber && String(student.identityNumber || "") === identityNumber;
                const sameName = String(student.fullName || "").trim() === fullName;
                return sameIdentity || sameName;
              });
              if (duplicateExists) {
                skippedCount += 1;
                return;
              }
              nextStudents.push({
                id: Date.now() + index + nextStudents.length,
                fullName,
                guardianName: String(row.guardianName || "").trim(),
                guardianMobile,
                identityNumber,
                notes: String(row.notes || "").trim(),
                source: row.source || "noor_excel",
                status: "active",
                importedAt: new Date().toISOString(),
              });
              importedCount += 1;
            });
            return { ...classroom, students: nextStudents, studentCount: nextStudents.length };
          }),
        },
      };
    }));
    pushNotification("استيراد الطلاب", `تم استيراد ${importedCount} طالبًا إلى الهيكل المدرسي لمدرسة ${selectedSchool.name}${skippedCount ? `، مع تجاوز ${skippedCount} سجل مكرر أو ناقص.` : ""}.`);
    return { importedCount, skippedCount };
  };

  const handleArchiveLegacySchoolSource = () => {
    if (!selectedSchool) return;
    const hasStructure = schoolHasStructureClassrooms(selectedSchool);
    if (!hasStructure) {
      pushNotification("أرشفة المصدر القديم", "يجب إنشاء فصول فعلية في الهيكل المدرسي قبل أرشفة المصدر القديم.");
      return;
    }
    const studentsCount = Array.isArray(selectedSchool.students) ? selectedSchool.students.length : 0;
    const companiesCount = Array.isArray(selectedSchool.companies) ? selectedSchool.companies.length : 0;
    if (!studentsCount && !companiesCount) {
      pushNotification("أرشفة المصدر القديم", "لا توجد بيانات قديمة نشطة لنقلها إلى الأرشيف.");
      return;
    }
    setSchools((prev) => prev.map((school) => school.id !== selectedSchool.id ? school : {
      ...school,
      legacyArchive: {
        students: Array.isArray(school.students) ? school.students : [],
        companies: Array.isArray(school.companies) ? school.companies : [],
        archivedAt: new Date().toISOString(),
      },
      students: [],
      companies: [],
    }));
    pushNotification("أرشفة المصدر القديم", `تم نقل ${studentsCount} طالب و${companiesCount} فصل/شركة من المصدر القديم إلى الأرشيف المخفي في ${selectedSchool.name}.`);
  };

  const handleRestoreLegacySchoolSource = () => {
    if (!selectedSchool) return;
    const archivedStudents = Array.isArray(selectedSchool.legacyArchive?.students) ? selectedSchool.legacyArchive.students : [];
    const archivedCompanies = Array.isArray(selectedSchool.legacyArchive?.companies) ? selectedSchool.legacyArchive.companies : [];
    if (!archivedStudents.length && !archivedCompanies.length) {
      pushNotification("استعادة المصدر القديم", "لا توجد نسخة مؤرشفة يمكن استعادتها.");
      return;
    }
    setSchools((prev) => prev.map((school) => school.id !== selectedSchool.id ? school : {
      ...school,
      students: archivedStudents,
      companies: archivedCompanies,
      legacyArchive: {
        ...(school.legacyArchive || {}),
        restoredAt: new Date().toISOString(),
      },
    }));
    pushNotification("استعادة المصدر القديم", `تمت استعادة ${archivedStudents.length} طالب و${archivedCompanies.length} فصل/شركة من الأرشيف المخفي في ${selectedSchool.name}.`);
  };

  const handleSaveAttendanceBinding = async (payload) => {
    if (!selectedSchool) return { ok: false };
    const nextSourceMode = payload?.sourceMode === 'structure' ? 'structure' : 'school';
    const nextLinkedClassroomId = nextSourceMode === 'structure' && payload?.linkedClassroomId ? String(payload.linkedClassroomId) : '';
    try {
      const response = await apiRequest(`/api/schools/${selectedSchool.id}/attendance-binding`, {
        method: 'PATCH',
        token: getSessionToken(),
        body: { sourceMode: nextSourceMode, linkedClassroomId: nextLinkedClassroomId },
      });
      const next = buildHydratedClientState(response.state || {}, loadUiState());
      setSchools(next.schools);
      setUsers(next.users);
      setScanLog(next.scanLog);
      setActionLog(next.actionLog || []);
      setSettings(next.settings);
      setNotifications(next.notifications);
      saveServerCache(response.state || {});
      pushNotification('ربط الحضور الذكي', nextSourceMode === 'structure' ? `تم ربط الحضور الذكي مع ${nextLinkedClassroomId ? 'فصل محدد من الهيكل المدرسي' : 'جميع فصول الهيكل المدرسي'} في ${selectedSchool.name}.` : `تمت إعادة الحضور الذكي إلى بيانات المدرسة الأساسية في ${selectedSchool.name}.`);
      return { ok: true };
    } catch (error) {
      window.alert(error?.message || 'تعذر حفظ ربط الحضور الذكي.');
      return { ok: false, message: error?.message };
    }
  };

  const handleAddSchool = (form) => {
    const normalizedPrincipalUsername = String(form.principalUsername || '').trim().toLowerCase();
    const normalizedPrincipalEmail = String(form.principalEmail || '').trim().toLowerCase();
    if (!normalizedPrincipalUsername || !normalizedPrincipalEmail || !String(form.principalPassword || '').trim()) {
      window.alert('أكمل بيانات مدير المدرسة: اسم الدخول والبريد الإلكتروني وكلمة المرور الأولية.');
      return;
    }
    if (users.some((user) => String(user.username || '').toLowerCase() === normalizedPrincipalUsername)) {
      window.alert('اسم دخول مدير المدرسة مستخدم مسبقًا. اختر اسمًا آخر.');
      return;
    }
    if (users.some((user) => String(user.email || '').toLowerCase() === normalizedPrincipalEmail)) {
      window.alert('البريد الإلكتروني مستخدم مسبقًا. اختر بريدًا آخر.');
      return;
    }
    const newId = Math.max(0, ...schools.map((school) => school.id)) + 1;
    const newSchool = {
      id: newId,
      name: form.name,
      city: form.city,
      code: form.code,
      manager: form.manager || '—',
      status: 'نشطة',
      companies: [],
      students: [],
      principalProfile: {
        username: normalizedPrincipalUsername,
        email: normalizedPrincipalEmail,
        password: String(form.principalPassword || '').trim(),
      },
    };
    const nextUserId = Math.max(0, ...users.map((user) => user.id)) + 1;
    const seededUsers = createSeedUsersForSchool(newSchool, nextUserId);
    setSchools((prev) => [...prev, newSchool]);
    setUsers((prev) => [...prev, ...seededUsers]);
    setSelectedSchoolId(newId);
    setActivePage('schools');
    pushNotification('تمت إضافة مدرسة', `أضيفت المدرسة ${form.name} وتم إنشاء مدير المدرسة بحساب ${normalizedPrincipalUsername}.`);
  };

  const handleDeleteSchool = (schoolId) => {
    if (schools.length === 1) {
      window.alert("لا يمكن حذف آخر مدرسة داخل المنصة.");
      return;
    }
    const school = schools.find((item) => item.id === schoolId);
    if (!school) return;
    if (!window.confirm(`هل تريد حذف المدرسة ${school.name} بكل شركاتها وطلابها ومستخدميها؟`)) return;
    setSchools((prev) => prev.filter((item) => item.id !== schoolId));
    setUsers((prev) => prev.filter((item) => item.schoolId !== schoolId));
    setScanLog((prev) => prev.filter((item) => item.schoolId !== schoolId));
    setActionLog((prev) => prev.filter((item) => item.schoolId !== schoolId));
    if (selectedSchoolId === schoolId) {
      const next = schools.find((item) => item.id !== schoolId);
      if (next) setSelectedSchoolId(next.id);
    }
    pushNotification("تم حذف مدرسة", `حُذفت المدرسة ${school.name} وما يتبعها من بيانات محلية.`);
  };

  const handleAddCompany = (form) => {
    setSchools((prev) => prev.map((school) => {
      if (school.id !== selectedSchool.id) return school;
      const newId = Math.max(0, ...school.companies.map((company) => company.id)) + 1;
      return {
        ...school,
        companies: [
          ...school.companies,
          { id: newId, name: form.name, className: form.className, leader: form.leader || "—", points: 0, early: 0, behavior: 100, initiatives: 0 },
        ],
      };
    }));
    pushNotification("تمت إضافة شركة", `أضيفت ${form.name} داخل ${selectedSchool.name}.`);
  };

  const handleDeleteCompany = (companyId) => {
    const company = selectedSchool.companies.find((item) => item.id === companyId);
    if (!company) return;
    const attachedStudents = selectedSchool.students.filter((student) => student.companyId === companyId).length;
    if (attachedStudents > 0) {
      window.alert("لا يمكن حذف الشركة قبل نقل أو حذف الطلاب المرتبطين بها.");
      return;
    }
    if (!window.confirm(`هل تريد حذف ${company.name}؟`)) return;
    setSchools((prev) => prev.map((school) => school.id !== selectedSchool.id ? school : { ...school, companies: school.companies.filter((item) => item.id !== companyId) }));
    setScanLog((prev) => prev.filter((item) => !(item.schoolId === selectedSchool.id && item.companyId === companyId)));
    pushNotification("تم حذف شركة", `حُذفت ${company.name} من المدرسة الحالية.`);
  };

  const handleAwardInitiative = (companyId) => {
    const company = selectedSchool.companies.find((item) => item.id === companyId);
    if (!company) return;
    setSchools((prev) => prev.map((school) => {
      if (school.id !== selectedSchool.id) return school;
      return {
        ...school,
        companies: school.companies.map((item) => item.id !== companyId ? item : { ...item, initiatives: item.initiatives + 1, points: item.points + safeNumber(settings.points.initiative) }),
      };
    }));
    pushNotification("اعتماد مبادرة", `تمت إضافة مبادرة إلى ${company.name} مع احتساب النقاط تلقائيًا.`);
  };

  const handleAddStudent = (form) => {
    setSchools((prev) => prev.map((school) => {
      if (school.id !== selectedSchool.id) return school;
      const newId = Math.max(0, ...school.students.map((student) => student.id)) + 1;
      const barcode = createBarcode(school.code, newId);
      return {
        ...school,
        students: [
          ...school.students,
          { id: newId, name: form.name, nationalId: form.nationalId || `AUTO-${newId}`, studentNumber: `${school.code.split("-")[0]}-${String(newId).padStart(4, "0")}`, grade: form.grade, companyId: form.companyId, barcode, faceReady: Boolean(form.faceReady), facePhoto: "", faceSignature: [], status: "في الوقت", attendanceRate: 100, points: 0 },
        ],
      };
    }));
    pushNotification("تمت إضافة طالب", `تم إنشاء بطاقة وQR للطالب ${form.name}.`);
  };

  const handleImportStudentsFromExcel = async (file) => {
    if (!selectedSchool || !file) return { ok: false, message: "لم يتم تحديد مدرسة للاستيراد." };
    try {
      const buffer = await file.arrayBuffer();
      const workbook = XLSX.read(buffer, { type: "array" });
      let rows = detectNoorOriginalRows(workbook);

      if (!rows.length) {
        const firstSheet = workbook.Sheets[workbook.SheetNames?.[0]];
        const genericRows = firstSheet ? XLSX.utils.sheet_to_json(firstSheet, { defval: "" }) : [];
        rows = genericRows.map((row) => {
          const normalizedRow = normalizeImportRow(row);
          const name = pickImportValue(normalizedRow, NOOR_IMPORT_ALIAS_MAP.name);
          const nationalId = pickImportValue(normalizedRow, NOOR_IMPORT_ALIAS_MAP.nationalId);
          const studentNumber = pickImportValue(normalizedRow, NOOR_IMPORT_ALIAS_MAP.studentNumber);
          const grade = pickImportValue(normalizedRow, NOOR_IMPORT_ALIAS_MAP.grade) || "غير محدد";
          const rawClass = pickImportValue(normalizedRow, NOOR_IMPORT_ALIAS_MAP.className) || "غير مصنف";
          const className = grade && rawClass ? `${grade} - الفصل ${rawClass}` : rawClass || grade || "غير مصنف";
          const companyName = pickImportValue(normalizedRow, NOOR_IMPORT_ALIAS_MAP.companyName) || className;
          return { name, nationalId, studentNumber, grade, className, companyName };
        }).filter((row) => row.name);
      }

      if (!rows.length) {
        window.alert("تعذر قراءة ملف نور. تأكد أنه ملف طلاب من نور أو يحتوي على عمود اسم الطالب.");
        return { ok: false, message: "تعذر قراءة ملف نور" };
      }

      const response = await apiRequest(`/api/schools/${selectedSchool.id}/students/import`, { method: 'POST', token: getSessionToken(), body: { rows } });
      const uiState = loadUiState();
      const next = buildHydratedClientState(response.state || {}, uiState);
      setSchools(next.schools);
      setUsers(next.users);
      setScanLog(next.scanLog);
      setActionLog(next.actionLog || []);
      setSettings(next.settings);
      setNotifications(next.notifications);
      saveServerCache(response.state || {});
      const message = response.added > 0
        ? `تمت إضافة ${response.added} طالب، وتجاوز ${response.skipped} سجل، وإنشاء ${response.companiesCreated} فصل/شركة تلقائيًا.`
        : `لم تتم إضافة طلاب جدد. السجلات المتجاوزة: ${response.skipped}.`;
      if (response.added > 0) {
        pushNotification("استيراد ملف نور", `${selectedSchool.name}: ${message}`);
        setActivePage("students");
      }
      return { ok: response.added > 0, added: response.added, skipped: response.skipped, companiesCreated: response.companiesCreated, message };
    } catch (error) {
      console.error(error);
      window.alert("تعذر قراءة ملف Excel أو إرساله للخادم. تأكد من سلامة الملف وتشغيل الخادم.");
      return { ok: false, message: "فشل في قراءة ملف Excel" };
    }
  };

  const handleDeleteStudent = (studentId) => {
    const student = selectedSchool.students.find((item) => item.id === studentId);
    if (!student) return;
    if (!window.confirm(`هل تريد حذف الطالب ${student.name}؟`)) return;
    setSchools((prev) => prev.map((school) => school.id !== selectedSchool.id ? school : { ...school, students: school.students.filter((item) => item.id !== studentId) }));
    setUsers((prev) => prev.filter((user) => user.studentId !== studentId));
    setScanLog((prev) => prev.filter((item) => !(item.schoolId === selectedSchool.id && item.studentId === studentId)));
    setActionLog((prev) => prev.filter((item) => !(item.schoolId === selectedSchool.id && item.studentId === studentId)));
    pushNotification("تم حذف طالب", `حُذف الطالب ${student.name} من المدرسة الحالية.`);
  };

  const handleAwardBehavior = (studentId) => {
    const student = selectedSchool.students.find((item) => item.id === studentId);
    if (!student) return;
    setSchools((prev) => prev.map((school) => {
      if (school.id !== selectedSchool.id) return school;
      return {
        ...school,
        students: school.students.map((item) => item.id !== studentId ? item : { ...item, points: item.points + safeNumber(settings.points.behavior) }),
        companies: school.companies.map((company) => company.id !== student.companyId ? company : { ...company, points: company.points + safeNumber(settings.points.behavior), behavior: clamp(company.behavior + 1, 0, 100) }),
      };
    }));
    pushNotification("تميّز سلوكي", `تمت إضافة نقاط سلوك للطالب ${student.name}.`);
  };

  const handleEnrollFace = async (studentId, file) => {
    const student = selectedSchool.students.find((item) => item.id === studentId);
    if (!student) return;
    const template = await buildFaceTemplateFromFile(file);
    try {
      const response = await apiRequest(`/api/schools/${selectedSchool.id}/students/${studentId}/face`, {
        method: 'POST',
        token: getSessionToken(),
        body: { imageData: template.photo, signature: template.signature },
      });
      applyServerStatePayload(response.state || {}, loadUiState());
      pushNotification("تسجيل بصمة الوجه", `تم حفظ صورة الوجه للطالب ${student.name} في التخزين المركزي.`);
    } catch (error) {
      window.alert(error?.message || 'تعذر حفظ بصمة الوجه على الخادم.');
    }
  };

  const handleEnrollFaceDataUrl = async (studentId, dataUrl) => {
    const student = selectedSchool.students.find((item) => item.id === studentId);
    if (!student) return;
    const template = await buildFaceTemplateFromDataUrl(dataUrl);
    try {
      const response = await apiRequest(`/api/schools/${selectedSchool.id}/students/${studentId}/face`, {
        method: 'POST',
        token: getSessionToken(),
        body: { imageData: template.photo, signature: template.signature },
      });
      applyServerStatePayload(response.state || {}, loadUiState());
      pushNotification("تسجيل بصمة الوجه", `تم التقاط صورة مباشرة وحفظها للطالب ${student.name}.`);
    } catch (error) {
      window.alert(error?.message || 'تعذر حفظ بصمة الوجه على الخادم.');
    }
  };

  const handleClearFace = (studentId) => {
    const student = selectedSchool.students.find((item) => item.id === studentId);
    if (!student) return;
    setSchools((prev) => prev.map((school) => {
      if (school.id !== selectedSchool.id) return school;
      return {
        ...school,
        students: school.students.map((item) => item.id !== studentId ? item : { ...item, faceReady: false, facePhoto: "", faceSignature: [] }),
      };
    }));
    pushNotification("حذف بصمة الوجه", `تم مسح بصمة الوجه المحفوظة للطالب ${student.name}.`);
  };

  const resolveStudentByBarcode = (barcodeInput) => {
    const value = sanitizeBarcodeValue(barcodeInput);
    const rawValue = normalizeSearchToken(barcodeInput);
    return getUnifiedSchoolStudents(selectedSchool, { includeArchived: false, preferStructure: true }).find((item) => sanitizeBarcodeValue(item.barcode) === value || normalizeSearchToken(item.nationalId || item.identityNumber || '') === rawValue || normalizeSearchToken(item.guardianMobile || '') === rawValue || normalizeSearchToken(item.studentNumber || item.rawId || item.id || '') === rawValue) || null;
  };

  const resolveStudentByManual = (query) => findStudentByKeyword(selectedSchool, query);

  const resolveStudentByFaceFile = async (file) => {
    if (!settings.devices.faceEnabled) {
      window.alert("بصمة الوجه غير مفعلة من الإعدادات.");
      return null;
    }
    const template = await buildFaceTemplateFromFile(file);
    if (!template.faceDetected) return null;
    const candidates = getUnifiedSchoolStudents(selectedSchool, { includeArchived: false, preferStructure: true }).filter((student) => getFaceProfileState(student) === "ready");
    const match = findBestFaceMatch(template.signature, candidates);
    return match?.student || null;
  };

  const resolveStudentByFaceDataUrl = async (dataUrl) => {
    if (!settings.devices.faceEnabled) {
      window.alert("بصمة الوجه غير مفعلة من الإعدادات.");
      return null;
    }
    const template = await buildFaceTemplateFromDataUrl(dataUrl);
    if (!template.faceDetected) return null;
    const candidates = getUnifiedSchoolStudents(selectedSchool, { includeArchived: false, preferStructure: true }).filter((student) => getFaceProfileState(student) === "ready");
    const match = findBestFaceMatch(template.signature, candidates);
    return match?.student || null;
  };

  const handleApplyStudentAction = async ({ studentId, actionType, definitionId, note, method }) => {
    const unifiedStudent = getUnifiedSchoolStudents(selectedSchool, { includeArchived: false, preferStructure: true }).find((item) => String(item.id) === String(studentId));
    if (!unifiedStudent) return { ok: false, message: "الطالب غير موجود." };

    if (unifiedStudent.source === 'structure') {
      const definitionPool = actionType === 'violation' ? (settings.actions?.violations || []) : (actionType === 'program' ? (settings.actions?.programs || []) : (settings.actions?.rewards || []));
      const definition = definitionPool.find((item) => String(item.id) === String(definitionId)) || definitionPool[0] || { title: 'إجراء', points: 0, description: '' };
      const deltaPoints = Number(definition.points || 0);
      const now = new Date();
      const entry = {
        id: Date.now(),
        schoolId: selectedSchool.id,
        studentId: unifiedStudent.id,
        companyId: null,
        classroomId: unifiedStudent.classroomId || null,
        student: unifiedStudent.name,
        actionType,
        actionTitle: definition.title || 'إجراء',
        definitionId: definition.id || definitionId,
        deltaPoints,
        note: String(note || '').trim(),
        actorName: currentUser?.name || currentUser?.username || 'مستخدم',
        actorRole: currentUser?.role || 'user',
        method: method || 'هيكل مدرسي',
        date: toArabicDate(now),
        isoDate: getTodayIso(),
        time: `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`,
      };
      setActionLog((prev) => [entry, ...prev]);
      setSchools((prev) => prev.map((school) => {
        if (school.id !== selectedSchool.id) return school;
        return {
          ...school,
          structure: {
            ...(school.structure || {}),
            classrooms: (school.structure?.classrooms || []).map((classroom) => String(classroom.id) !== String(unifiedStudent.classroomId) ? classroom : {
              ...classroom,
              students: (classroom.students || []).map((item) => String(item.id) !== String(unifiedStudent.rawId) ? item : {
                ...item,
                points: Number(item.points || 0) + deltaPoints,
                lastActionAt: now.toISOString(),
                lastActionType: actionType,
              }),
            }),
          },
        };
      }));
      const message = `تم تنفيذ ${actionType === 'reward' ? 'المكافأة' : 'الخصم'} على ${unifiedStudent.name} من الهيكل المدرسي.`;
      pushNotification(actionType === "reward" ? "تنفيذ مكافأة" : "تنفيذ خصم", message);
      return { ok: true, message };
    }

    const student = selectedSchool.students.find((item) => item.id === unifiedStudent.id || item.id === studentId);
    if (!student) return { ok: false, message: "الطالب غير موجود." };
    try {
      const response = await apiRequest(`/api/schools/${selectedSchool.id}/actions/apply`, {
        method: 'POST',
        token: getSessionToken(),
        body: { studentId: student.id, actionType, definitionId, note, method },
      });
      applyServerStatePayload(response.state || {}, loadUiState());
      const message = response?.message || `تم تنفيذ الإجراء على ${student.name}.`;
      pushNotification(actionType === "reward" ? "تنفيذ مكافأة" : "تنفيذ خصم", message);
      return { ok: true, message };
    } catch (error) {
      return { ok: false, message: error?.message || 'تعذر تنفيذ الإجراء.' };
    }
  };

  const handleRecordProgramExecution = async ({ definitionId, companyId, studentId, targetType, targetLabel, targetCount, note, evidenceFiles = [] }) => {
    try {
      const evidence = await Promise.all((evidenceFiles || []).map(async (file, index) => ({
        name: file?.name || `evidence-${index + 1}`,
        type: file?.type || 'image',
        dataUrl: await fileToDataUrl(file),
      })));
      const response = await apiRequest(`/api/schools/${selectedSchool.id}/programs/apply`, {
        method: 'POST',
        token: getSessionToken(),
        body: { definitionId, companyId, studentId, targetType, targetLabel, targetCount, note, evidence },
      });
      applyServerStatePayload(response.state || {}, loadUiState());
      pushNotification("اعتماد برنامج", response?.message || `${selectedSchool.name}`);
      return { ok: true, message: response?.message || 'تم حفظ البرنامج.' };
    } catch (error) {
      return { ok: false, message: error?.message || 'تعذر حفظ البرنامج.' };
    }
  };

  const handleScan = (barcodeInput) => {
    const rawValue = String(barcodeInput || '').trim();
    const value = sanitizeBarcodeValue(rawValue);
    if (!settings.devices.barcodeEnabled) {
      window.alert("قارئ QR غير مفعل من الإعدادات.");
      return;
    }
    const sourceMode = attendanceBinding.sourceMode;
    const normalizedRaw = normalizeSearchToken(rawValue);
    const student = sourceMode === 'structure'
      ? (attendanceStudents.find((item) => sanitizeBarcodeValue(item.barcode) === value || normalizeSearchToken(item.nationalId || item.identityNumber || '') === normalizedRaw || normalizeSearchToken(item.guardianMobile || '') === normalizedRaw || normalizeSearchToken(item.studentNumber || item.rawId || item.id || '') === normalizedRaw || String(item.name || '').trim() === rawValue || String(item.fullName || '').trim() === rawValue) || findStudentByKeyword(selectedSchool, rawValue))
      : (selectedSchool.students.find((item) => sanitizeBarcodeValue(item.barcode) === value) || findStudentByKeyword(selectedSchool, rawValue));
    if (!student) {
      pushNotification("فشل قراءة الحضور", `لم يتم العثور على الطالب المرتبط بالقيمة ${rawValue || value}.`);
      return;
    }
    const today = getTodayIso();
    if (settings.devices.duplicateScanBlocked) {
      const already = scanLog.some((entry) => String(entry.studentId) === String(student.id) && entry.schoolId === selectedSchool.id && entry.isoDate === today);
      if (already) {
        pushNotification("منع تكرار الحضور", `تم تجاهل عملية التمرير لأن الطالب ${student.name} مسجل اليوم.`);
        return;
      }
    }

    const now = new Date();
    const currentMinutes = now.getHours() * 60 + now.getMinutes();
    const earlyCutoff = parseTimeToMinutes(settings.policy.earlyEnd);
    const onTimeCutoff = parseTimeToMinutes(settings.policy.onTimeEnd);

    let result = "تم تسجيل تأخر";
    let deltaPoints = safeNumber(settings.points.late);
    if (currentMinutes <= earlyCutoff) {
      result = "تم تسجيل حضور مبكر";
      deltaPoints = safeNumber(settings.points.early);
    } else if (currentMinutes <= onTimeCutoff) {
      result = "تم تسجيل حضور في الوقت";
      deltaPoints = safeNumber(settings.points.onTime);
    }

    const logEntry = {
      id: Date.now(),
      schoolId: selectedSchool.id,
      studentId: student.id,
      companyId: student.companyId,
      classroomId: student.classroomId || null,
      student: student.name,
      barcode: student.barcode,
      date: toArabicDate(now),
      isoDate: today,
      time: `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`,
      method: sourceMode === 'structure' ? 'هيكل مدرسي' : 'QR',
      result,
      deltaPoints,
    };

    setScanLog((prev) => [logEntry, ...prev]);
    setSchools((prev) => prev.map((school) => {
      if (school.id !== selectedSchool.id) return school;
      if (sourceMode === 'structure') {
        return {
          ...school,
          structure: {
            ...(school.structure || {}),
            classrooms: (school.structure?.classrooms || []).map((classroom) => String(classroom.id) !== String(student.classroomId) ? classroom : {
              ...classroom,
              students: (classroom.students || []).map((item) => String(item.id) !== String(student.rawId) ? item : {
                ...item,
                attendanceStatus: statusFromResult(result),
                attendanceRate: clamp(Number(item.attendanceRate || 100) + (result.includes("تأخر") ? -1 : 0.4), 0, 100),
                points: Number(item.points || 0) + deltaPoints,
                lastAttendanceAt: new Date().toISOString(),
              }),
            }),
          },
        };
      }
      return {
        ...school,
        students: school.students.map((item) => item.id !== student.id ? item : { ...item, status: statusFromResult(result), attendanceRate: clamp(item.attendanceRate + (result.includes("تأخر") ? -1 : 0.4), 0, 100), points: item.points + deltaPoints }),
        companies: school.companies.map((company) => company.id !== student.companyId ? company : { ...company, points: company.points + deltaPoints, early: company.early + (result.includes("مبكر") ? 1 : 0) }),
      };
    }));
    pushNotification("تسجيل حضور", `${student.name}: ${result}.`);
  };

  const handleFaceScanFile = async (file) => {
    if (!settings.devices.faceEnabled) {
      window.alert("بصمة الوجه غير مفعلة من الإعدادات.");
      return null;
    }
    const student = await resolveStudentByFaceFile(file);
    if (!student) {
      pushNotification("فشل التحقق", "لم يتم العثور على تطابق كافٍ مع الصور المسجلة في المدرسة الحالية.");
      return null;
    }
    handleScan(student.barcode);
    return student;
  };

  const handleFaceScanDataUrl = async (dataUrl) => {
    if (!settings.devices.faceEnabled) {
      window.alert("بصمة الوجه غير مفعلة من الإعدادات.");
      return null;
    }
    const student = await resolveStudentByFaceDataUrl(dataUrl);
    if (!student) {
      pushNotification("فشل التحقق", "لم يتم العثور على تطابق كافٍ مع الصور المسجلة في المدرسة الحالية.");
      return null;
    }
    handleScan(student.barcode);
    return student;
  };

  const handleDownloadStudentCard = async (studentId) => {
    const student = selectedSchool.students.find((item) => item.id === studentId);
    if (!student) return;
    const company = selectedSchool.companies.find((item) => item.id === student.companyId);
    const html = await createStudentCardMarkup(student, selectedSchool.name, company?.name || "—");
    downloadFile(`${student.barcode}.html`, html, "text/html;charset=utf-8;");
  };

  const handleDownloadAllCards = async () => {
    const cards = await Promise.all(selectedSchool.students.map(async (student) => {
      const company = selectedSchool.companies.find((item) => item.id === student.companyId);
      return createStudentCardMarkup(student, selectedSchool.name, company?.name || "—");
    }));
    const html = `<!doctype html><html lang="ar" dir="rtl"><head><meta charset="UTF-8" /><title>${selectedSchool.name}-all-cards</title></head><body style="background:#f8fafc;padding:24px;font-family:Cairo,Arial,sans-serif">${cards.join(`\n<hr style="margin:32px 0;border:none;border-top:2px dashed #cbd5e1" />\n`)}</body></html>`;
    downloadFile(`${selectedSchool.code}-all-student-cards.html`, html, "text/html;charset=utf-8;");
  };

  const exportAttendance = () => {
    const rows = scanLog.filter((item) => item.schoolId === selectedSchool.id);
    const csv = buildCsv(rows, [
      { key: "student", label: "الطالب" },
      { key: "barcode", label: "QR" },
      { key: "date", label: "التاريخ" },
      { key: "time", label: "الوقت" },
      { key: "method", label: "الطريقة" },
      { key: "result", label: "النتيجة" },
      { key: "deltaPoints", label: "الأثر النقطي" },
    ]);
    downloadFile(`${settings.exportPrefix}-${selectedSchool.code}-attendance.csv`, csv, "text/csv;charset=utf-8;");
  };

  const exportStudents = () => {
    const exportableStudents = getUnifiedSchoolStudents(selectedSchool, { includeArchived: true, preferStructure: true });
    const csv = buildCsv(exportableStudents.map((student) => ({
      ...student,
      nationalId: student.nationalId || student.identityNumber || '',
      companyName: getStudentGroupingLabel(student, selectedSchool),
      faceStatus: getFaceProfileLabel(student),
    })), [
      { key: "name", label: "الاسم" },
      { key: "nationalId", label: "الهوية" },
      { key: "grade", label: "المرحلة" },
      { key: "companyName", label: "الشركة" },
      { key: "barcode", label: "QR" },
      { key: "faceStatus", label: "بصمة الوجه" },
      { key: "attendanceRate", label: "نسبة الحضور" },
      { key: "points", label: "النقاط" },
    ]);
    downloadFile(`${settings.exportPrefix}-${selectedSchool.code}-students.csv`, csv, "text/csv;charset=utf-8;");
  };

  const exportSchools = () => {
    const csv = buildCsv(schools, [
      { key: "name", label: "المدرسة" },
      { key: "city", label: "المدينة" },
      { key: "code", label: "الرقم الوزاري" },
      { key: "manager", label: "المدير" },
      { key: "students", label: "الطلاب", render: (row) => row.students.length },
      { key: "companies", label: "الشركات", render: (row) => row.companies.length },
      { key: "status", label: "الحالة" },
    ]);
    downloadFile(`${settings.exportPrefix}-schools.csv`, csv, "text/csv;charset=utf-8;");
  };

  const exportSchoolSnapshot = (schoolId) => {
    const school = schools.find((item) => item.id === schoolId);
    if (!school) return;
    downloadFile(`${settings.exportPrefix}-${school.code}.json`, JSON.stringify(school, null, 2), "application/json;charset=utf-8;");
  };

  const downloadStudentImportTemplate = () => {
    downloadFile("student-import-noor-template.csv", buildTemplateStudentsCsv(), "text/csv;charset=utf-8;");
  };

  const exportBackup = () => {
    const payload = {
      version: BACKUP_VERSION,
      exportedAt: new Date().toISOString(),
      schools,
      users,
      currentUserId,
      selectedSchoolId,
      activePage,
      attendanceMethod,
      scanLog,
      actionLog,
      settings,
      notifications,
    };
    downloadFile(`${settings.exportPrefix}-backup.json`, JSON.stringify(payload, null, 2), "application/json;charset=utf-8;");
  };

  const restoreBackup = (payload) => {
    if (!payload || !Array.isArray(payload.schools)) {
      window.alert("النسخة الاحتياطية لا تحتوي على بيانات المدارس.");
      return;
    }
    const restoredSchools = hydrateSchools(payload.schools);
    setSchools(restoredSchools);
    setUsers(hydrateUsers(payload.users?.length ? payload.users : createDefaultUsers(restoredSchools), restoredSchools));
    setCurrentUserId(payload.currentUserId || null);
    setSelectedSchoolId(payload.selectedSchoolId || payload.schools[0]?.id || 1);
    setActivePage(payload.activePage || "dashboard");
    setAttendanceMethod(payload.attendanceMethod || "barcode");
    setScanLog(hydrateScanLog(payload.scanLog || []));
    setActionLog(hydrateActionLog(payload.actionLog || []));
    setSettings({
      ...defaultSettings,
      ...(payload.settings || {}),
      policy: { ...defaultSettings.policy, ...(payload.settings?.policy || {}) },
      points: { ...defaultSettings.points, ...(payload.settings?.points || {}) },
      devices: { ...defaultSettings.devices, ...(payload.settings?.devices || {}) },
      actions: hydrateActionCatalog(payload.settings?.actions || defaultSettings.actions),
    });
    setNotifications(Array.isArray(payload.notifications) ? payload.notifications : []);
    setEditingUserId(null);
    pushNotification("تمت الاستعادة", "تم تحميل النسخة الاحتياطية بنجاح داخل المنصة.");
  };

  const resetData = async () => {
    if (currentUser?.role !== "superadmin") {
      window.alert("إعادة التهيئة الكاملة متاحة فقط للأدمن العام.");
      return;
    }
    if (!window.confirm("سيتم إعادة البيانات للوضع التجريبي الحالي على الخادم المركزي. هل تريد المتابعة؟")) return;
    try {
      const response = await apiRequest("/api/state/reset", { method: "POST", token: getSessionToken(), body: {} });
      const fresh = buildHydratedClientState(response.state || {}, loadUiState());
      setSchools(fresh.schools);
      setUsers(fresh.users);
      setCurrentUserId(response.sessionUser?.id || currentUser?.id || null);
      setSelectedSchoolId(response.sessionUser?.role === "superadmin" ? (loadUiState().selectedSchoolId || fresh.selectedSchoolId) : response.sessionUser?.schoolId);
      setActivePage(response.sessionUser ? getDefaultLandingPage(response.sessionUser) : "dashboard");
      setAttendanceMethod(fresh.attendanceMethod);
      setScanLog(fresh.scanLog);
      setActionLog(fresh.actionLog || []);
      setSettings(fresh.settings);
      setNotifications(fresh.notifications);
      setEditingUserId(null);
      saveServerCache(response.state || {});
    } catch (error) {
      console.error(error);
      window.alert("تعذر إعادة تهيئة المنصة من الخادم.");
    }
  };

  const handleUpdateSchoolAccess = (schoolId, nextAccess) => {
    const normalizedAccess = {
      roleAccess: {
        ...createDefaultSchoolAccess().roleAccess,
        ...(nextAccess?.roleAccess || {}),
      },
      principalPermissions: buildRolePermissions("principal", nextAccess?.principalPermissions || {}),
    };
    setSchools((prev) => prev.map((school) => school.id !== schoolId ? school : { ...school, access: normalizedAccess }));
    setUsers((prev) => prev.map((user) => {
      if (user.schoolId !== schoolId || user.role !== "principal") return user;
      return {
        ...user,
        permissions: normalizedAccess.principalPermissions,
      };
    }));
    pushNotification("صلاحيات مدرسة", `تم تحديث صلاحيات مدرسة ${schools.find((school) => school.id === schoolId)?.name || "المحددة"}.`);
  };

  const handleAddUser = (form) => {
    if (currentUser?.role === 'principal' && !principalDelegableRoles.includes(form.role)) {
      window.alert('مدير المدرسة يستطيع إنشاء الحسابات التشغيلية داخل مدرسته فقط.');
      return;
    }
    const normalizedUsername = String(form.username || "").trim().toLowerCase();
    if (users.some((user) => user.username.toLowerCase() === normalizedUsername)) {
      window.alert("اسم المستخدم مستخدم مسبقًا. اختر اسمًا آخر.");
      return;
    }
    const nextId = Math.max(0, ...users.map((user) => user.id)) + 1;
    const user = {
      id: nextId,
      name: form.name.trim(),
      username: normalizedUsername,
      email: String(form.email || '').trim().toLowerCase(),
      mobile: String(form.mobile || '').trim(),
      password: form.password,
      role: form.role,
      schoolId: form.role === "superadmin" ? null : Number(form.schoolId),
      studentId: form.studentId || null,
      status: "نشط",
      permissions: clampDelegatedPermissions(currentUser, form.role, form.permissions),
    };
    setUsers((prev) => [...prev, user]);
    pushNotification("إضافة مستخدم", `تم إنشاء حساب ${user.name} بصلاحية ${getRoleLabel(user.role)}.`);
  };

  const handleSelectUserForEdit = (user) => {
    setEditingUserId(user.id);
    setActivePage("users");
  };

  const handleUpdateUser = (form) => {
    const existingUser = users.find((user) => Number(user.id) === Number(form.id));
    if (currentUser?.role === 'principal' && !canPrincipalManageUser(currentUser, existingUser)) {
      window.alert('لا تملك صلاحية تعديل هذا الحساب.');
      return;
    }
    if (currentUser?.role === 'principal' && !principalDelegableRoles.includes(form.role)) {
      window.alert('مدير المدرسة لا يستطيع ترقية الحسابات إلى أدوار مركزية.');
      return;
    }
    const normalizedUsername = String(form.username || "").trim().toLowerCase();
    if (users.some((user) => user.id !== form.id && user.username.toLowerCase() === normalizedUsername)) {
      window.alert("اسم المستخدم مستخدم مسبقًا. اختر اسمًا آخر.");
      return;
    }
    setUsers((prev) => prev.map((user) => user.id !== form.id ? user : {
      ...user,
      name: form.name.trim(),
      username: normalizedUsername,
      email: String(form.email || '').trim().toLowerCase(),
      mobile: String(form.mobile || '').trim(),
      password: form.password,
      role: form.role,
      schoolId: form.role === "superadmin" ? null : Number(form.schoolId),
      status: form.status === "موقوف" ? "موقوف" : "نشط",
      permissions: clampDelegatedPermissions(currentUser, form.role, form.permissions),
    }));
    pushNotification("تحديث مستخدم", `تم تحديث حساب ${form.name}.`);
  };

  const handleToggleUserStatus = (userId) => {
    const user = users.find((item) => item.id === userId);
    if (!user) return;
    if (currentUser?.id === userId) {
      window.alert("لا يمكن تعطيل الحساب المستخدم حاليًا.");
      return;
    }
    if (currentUser?.role === 'principal' && !canPrincipalManageUser(currentUser, user)) {
      window.alert('لا تملك صلاحية تعديل حالة هذا الحساب.');
      return;
    }
    setUsers((prev) => prev.map((item) => item.id !== userId ? item : { ...item, status: item.status === "نشط" ? "موقوف" : "نشط" }));
    pushNotification("تعديل حالة الحساب", `تم ${user.status === "نشط" ? "تعطيل" : "تفعيل"} حساب ${user.name}.`);
  };

  const handleDeleteUser = (userId) => {
    const user = users.find((item) => item.id === userId);
    if (!user) return;
    if (user.role === "superadmin") {
      window.alert("لا يمكن حذف الحساب المركزي من هذه النسخة.");
      return;
    }
    if (currentUser?.id === userId) {
      window.alert("لا يمكن حذف الحساب المستخدم حاليًا.");
      return;
    }
    if (currentUser?.role === 'principal' && !canPrincipalManageUser(currentUser, user)) {
      window.alert('لا تملك صلاحية حذف هذا الحساب.');
      return;
    }
    if (!window.confirm(`هل تريد حذف المستخدم ${user.name}؟`)) return;
    setUsers((prev) => prev.filter((item) => item.id !== userId));
    if (editingUserId === userId) setEditingUserId(null);
    pushNotification("حذف مستخدم", `تم حذف حساب ${user.name}.`);
  };

  const handleCreateGateLink = async (payload) => {
    if (!selectedSchool) return { ok: false };
    try {
      const response = await apiRequest(`/api/schools/${selectedSchool.id}/device-links`, { method: 'POST', token: getSessionToken(), body: { kind: 'gate', ...payload } });
      const uiState = loadUiState();
      const next = buildHydratedClientState(response.state || {}, uiState);
      setSchools(next.schools);
      setUsers(next.users);
      setScanLog(next.scanLog);
      setActionLog(next.actionLog || []);
      setSettings(next.settings);
      setNotifications(next.notifications);
      saveServerCache(response.state || {});
      pushNotification('رابط بوابة', `تم إنشاء رابط ${response.link?.name || 'بوابة'} للمدرسة ${selectedSchool.name}.`);
      return { ok: true, link: response.link };
    } catch (error) {
      window.alert(error?.message || 'تعذر إنشاء رابط البوابة.');
      return { ok: false, message: error?.message };
    }
  };

  const handleDeleteGateLink = async (linkId) => {
    if (!selectedSchool) return;
    if (!window.confirm('هل تريد حذف رابط البوابة؟')) return;
    try {
      const response = await apiRequest(`/api/schools/${selectedSchool.id}/device-links/gate/${linkId}`, { method: 'POST', token: getSessionToken(), body: {} });
      const next = buildHydratedClientState(response.state || {}, loadUiState());
      setSchools(next.schools); setUsers(next.users); setScanLog(next.scanLog); setActionLog(next.actionLog || []); setSettings(next.settings); setNotifications(next.notifications); saveServerCache(response.state || {});
    } catch (error) {
      window.alert(error?.message || 'تعذر حذف رابط البوابة.');
    }
  };

  const handleCreateScreenLink = async (payload) => {
    if (!selectedSchool) return { ok: false };
    try {
      const response = await apiRequest(`/api/schools/${selectedSchool.id}/device-links`, { method: 'POST', token: getSessionToken(), body: { kind: 'screen', ...payload } });
      const uiState = loadUiState();
      const next = buildHydratedClientState(response.state || {}, uiState);
      setSchools(next.schools); setUsers(next.users); setScanLog(next.scanLog); setActionLog(next.actionLog || []); setSettings(next.settings); setNotifications(next.notifications); saveServerCache(response.state || {});
      pushNotification('رابط شاشة', `تم إنشاء رابط ${response.link?.name || 'شاشة'} للمدرسة ${selectedSchool.name}.`);
      return { ok: true, link: response.link };
    } catch (error) {
      window.alert(error?.message || 'تعذر إنشاء رابط الشاشة.');
      return { ok: false, message: error?.message };
    }
  };

  const handleDeleteScreenLink = async (linkId) => {
    if (!selectedSchool) return;
    if (!window.confirm('هل تريد حذف رابط الشاشة؟')) return;
    try {
      const response = await apiRequest(`/api/schools/${selectedSchool.id}/device-links/screen/${linkId}`, { method: 'POST', token: getSessionToken(), body: {} });
      const next = buildHydratedClientState(response.state || {}, loadUiState());
      setSchools(next.schools); setUsers(next.users); setScanLog(next.scanLog); setActionLog(next.actionLog || []); setSettings(next.settings); setNotifications(next.notifications); saveServerCache(response.state || {});
    } catch (error) {
      window.alert(error?.message || 'تعذر حذف رابط الشاشة.');
    }
  };

  // تحديث رابط شاشة موجود
  const handleUpdateScreenLink = async (linkId, payload) => {
    if (!selectedSchool) return { ok: false };
    try {
      const response = await apiRequest(`/api/schools/${selectedSchool.id}/device-links/screen/${linkId}`, { method: 'PATCH', token: getSessionToken(), body: payload });
      const next = buildHydratedClientState(response.state || {}, loadUiState());
      setSchools(next.schools); setUsers(next.users); setScanLog(next.scanLog); setActionLog(next.actionLog || []); setSettings(next.settings); setNotifications(next.notifications); saveServerCache(response.state || {});
      pushNotification('تحديث شاشة', `تم تحديث رابط الشاشة ${response.link?.name || ''}.`);
      return { ok: true, link: response.link };
    } catch (error) {
      window.alert(error?.message || 'تعذر تحديث رابط الشاشة.');
      return { ok: false, message: error?.message };
    }
  };

  const handleSaveMessagingSettings = async (payload) => {
    if (!selectedSchool) return { ok: false };
    try {
      const response = await apiRequest(`/api/schools/${selectedSchool.id}/messages/settings`, {
        method: 'PATCH',
        token: getSessionToken(),
        body: payload,
      });
      if (response.state) {
        const next = buildHydratedClientState(response.state, loadUiState());
        setSchools(next.schools); setUsers(next.users); setScanLog(next.scanLog); setActionLog(next.actionLog || []); setSettings(next.settings); setNotifications(next.notifications); saveServerCache(response.state || {});
      }
      pushNotification("إعدادات الرسائل", `تم تحديث إعدادات الرسائل والتنبيهات في ${selectedSchool.name}.`);
      return { ok: true };
    } catch (error) {
      window.alert(error?.message || 'تعذر حفظ إعدادات الرسائل.');
      return { ok: false, message: error?.message };
    }
  };

  const handleSaveMessageTemplate = async (payload) => {
    if (!selectedSchool) return { ok: false };
    try {
      const response = await apiRequest(`/api/schools/${selectedSchool.id}/messages/templates/save`, {
        method: 'POST',
        token: getSessionToken(),
        body: payload,
      });
      if (response.state) {
        const next = buildHydratedClientState(response.state, loadUiState());
        setSchools(next.schools); setUsers(next.users); setScanLog(next.scanLog); setActionLog(next.actionLog || []); setSettings(next.settings); setNotifications(next.notifications); saveServerCache(response.state || {});
      }
      pushNotification("قوالب الرسائل", `تم ${payload.id ? 'تحديث' : 'إضافة'} قالب رسالة في ${selectedSchool.name}.`);
      return { ok: true };
    } catch (error) {
      window.alert(error?.message || 'تعذر حفظ القالب.');
      return { ok: false, message: error?.message };
    }
  };

  const handleDeleteMessageTemplate = async (templateId) => {
    if (!selectedSchool) return { ok: false };
    try {
      const response = await apiRequest(`/api/schools/${selectedSchool.id}/messages/templates/${templateId}/delete`, {
        method: 'POST',
        token: getSessionToken(),
      });
      if (response.state) {
        const next = buildHydratedClientState(response.state, loadUiState());
        setSchools(next.schools); setUsers(next.users); setScanLog(next.scanLog); setActionLog(next.actionLog || []); setSettings(next.settings); setNotifications(next.notifications); saveServerCache(response.state || {});
      }
      pushNotification("قوالب الرسائل", "تم حذف القالب المحدد.");
      return { ok: true };
    } catch (error) {
      window.alert(error?.message || 'تعذر حذف القالب.');
      return { ok: false, message: error?.message };
    }
  };

  const handleSaveMessageRule = async (payload) => {
    if (!selectedSchool) return { ok: false };
    try {
      const response = await apiRequest(`/api/schools/${selectedSchool.id}/messages/rules/save`, {
        method: 'POST',
        token: getSessionToken(),
        body: payload,
      });
      if (response.state) {
        const next = buildHydratedClientState(response.state, loadUiState());
        setSchools(next.schools); setUsers(next.users); setScanLog(next.scanLog); setActionLog(next.actionLog || []); setSettings(next.settings); setNotifications(next.notifications); saveServerCache(response.state || {});
      }
      pushNotification("التنبيهات التلقائية", `تم ${payload.id ? 'تحديث' : 'إضافة'} قاعدة تلقائية في ${selectedSchool.name}.`);
      return { ok: true };
    } catch (error) {
      window.alert(error?.message || 'تعذر حفظ القاعدة.');
      return { ok: false, message: error?.message };
    }
  };

  const handleToggleMessageRule = async (ruleId) => {
    if (!selectedSchool) return { ok: false };
    try {
      const response = await apiRequest(`/api/schools/${selectedSchool.id}/messages/rules/${ruleId}/toggle`, {
        method: 'POST',
        token: getSessionToken(),
      });
      if (response.state) {
        const next = buildHydratedClientState(response.state, loadUiState());
        setSchools(next.schools); setUsers(next.users); setScanLog(next.scanLog); setActionLog(next.actionLog || []); setSettings(next.settings); setNotifications(next.notifications); saveServerCache(response.state || {});
      }
      return { ok: true };
    } catch (error) {
      window.alert(error?.message || 'تعذر تغيير حالة القاعدة.');
      return { ok: false, message: error?.message };
    }
  };

  const handleSendSchoolMessage = async ({ audience = 'lateToday', channel = 'internal', subject = '', message = '', sendMode = 'now', audienceLabel = 'مستهدفات مخصصة' }) => {
    if (!selectedSchool) return { ok: false, message: 'لا توجد مدرسة محددة.' };
    try {
      const response = await apiRequest(`/api/schools/${selectedSchool.id}/messages/send`, {
        method: 'POST',
        token: getSessionToken(),
        body: { audience, channel, subject, message, sendMode, audienceLabel },
      });
      if (response.state) {
        const next = buildHydratedClientState(response.state, loadUiState());
        setSchools(next.schools);
        setUsers(next.users);
        setScanLog(next.scanLog);
        setActionLog(next.actionLog || []);
        setSettings(next.settings);
        setNotifications(next.notifications);
        saveServerCache(response.state || {});
      }
      pushNotification('الرسائل والتنبيهات', response.message || `تم تنفيذ عملية الرسائل في ${selectedSchool.name}.`);
      return { ok: true, log: response.log, message: response.message || 'تم التنفيذ بنجاح.' };
    } catch (error) {
      return { ok: false, message: error?.message || 'تعذر تنفيذ عملية الرسائل.' };
    }
  };

  const handleTestMessagingIntegration = async (channel, settingsDraft = null) => {
    if (!selectedSchool) return { ok: false, message: 'لا توجد مدرسة محددة.' };
    try {
      const response = await apiRequest(`/api/schools/${selectedSchool.id}/messages/test`, {
        method: 'POST',
        token: getSessionToken(),
        body: { channel, settings: settingsDraft || selectedSchool?.messaging?.settings },
      });
      if (response.state) {
        const next = buildHydratedClientState(response.state, loadUiState());
        setSchools(next.schools);
        setUsers(next.users);
        setScanLog(next.scanLog);
        setActionLog(next.actionLog || []);
        setSettings(next.settings);
        setNotifications(next.notifications);
        saveServerCache(response.state || {});
      }
      pushNotification('الرسائل والتنبيهات', response.message || 'تم اختبار الربط بنجاح.');
      return { ok: true, message: response.message || 'تم اختبار الربط بنجاح.' };
    } catch (error) {
      return { ok: false, message: error?.message || 'تعذر اختبار الربط.' };
    }
  };

  const quickAction = () => {
    if (canAccessPermission(currentUser, "actions")) return setActivePage("actions");
    if (canAccessPermission(currentUser, "attendance")) return setActivePage("attendance");
    if (canAccessPermission(currentUser, "students")) return setActivePage("students");
    if (canAccessPermission(currentUser, "users")) return setActivePage("users");
    setActivePage(getDefaultLandingPage(currentUser));
  };

  const renderPage = () => {
    if (!currentUser) return null;
    if (currentUser.role === "student") return <StudentRolePage selectedSchool={selectedSchool} currentUser={currentUser} />;
    switch (activePage) {
      case "schools":
        return <SchoolsPage schools={schools} selectedSchoolId={selectedSchoolId} setSelectedSchoolId={setSelectedSchoolId} onAddSchool={handleAddSchool} onDeleteSchool={handleDeleteSchool} onExportSchool={exportSchoolSnapshot} />;
      case "companies":
        return <CompaniesPage selectedSchool={selectedSchool} onAddCompany={handleAddCompany} onDeleteCompany={handleDeleteCompany} onAwardInitiative={handleAwardInitiative} />;
      case "students":
        return <StudentsPage selectedSchool={selectedSchool} onAddStudent={handleAddStudent} onDeleteStudent={handleDeleteStudent} onAwardBehavior={handleAwardBehavior} onEnrollFace={handleEnrollFace} onEnrollFaceDataUrl={handleEnrollFaceDataUrl} onClearFace={handleClearFace} onDownloadStudentCard={handleDownloadStudentCard} onDownloadAllCards={handleDownloadAllCards} />;
      case "attendance":
        return <AttendancePage selectedSchool={selectedSchool} currentUser={currentUser} attendanceMethod={attendanceMethod} setAttendanceMethod={setAttendanceMethod} scanLog={scanLog} actionLog={actionLog} settings={settings} onScan={handleScan} onFaceScanFile={handleFaceScanFile} onFaceScanDataUrl={handleFaceScanDataUrl} onCreateGateLink={handleCreateGateLink} onDeleteGateLink={handleDeleteGateLink} onCreateScreenLink={handleCreateScreenLink} onDeleteScreenLink={handleDeleteScreenLink} onUpdateScreenLink={handleUpdateScreenLink} onSaveAttendanceBinding={handleSaveAttendanceBinding} />;
      case "actions":
        return <StudentActionsPage selectedSchool={selectedSchool} currentUser={currentUser} settings={settings} actionLog={actionLog} onResolveStudentByBarcode={resolveStudentByBarcode} onResolveStudentByManual={resolveStudentByManual} onResolveStudentByFaceFile={resolveStudentByFaceFile} onResolveStudentByFaceDataUrl={resolveStudentByFaceDataUrl} onApplyStudentAction={handleApplyStudentAction} onRecordProgramAction={handleRecordProgramExecution} />;
      case "points":
        return <PointsPage selectedSchool={selectedSchool} settings={settings} />;
      case "reports":
        return <ReportsPage schools={schools} scanLog={scanLog} actionLog={actionLog} selectedSchool={selectedSchool} settings={settings} executiveReport={executiveReport} onExportAttendance={exportAttendance} onExportStudents={exportStudents} onExportSchools={exportSchools} onExportBackup={exportBackup} />;
      case "deviceDisplays":
        return <DeviceDisplaysPage selectedSchool={selectedSchool} currentUser={currentUser} onCreateGateLink={handleCreateGateLink} onDeleteGateLink={handleDeleteGateLink} onCreateScreenLink={handleCreateScreenLink} onDeleteScreenLink={handleDeleteScreenLink} onUpdateScreenLink={handleUpdateScreenLink} />;
      case "messages":
        return <MessagingCenterPage selectedSchool={selectedSchool} currentUser={currentUser} onSendMessage={handleSendSchoolMessage} onTestIntegration={handleTestMessagingIntegration} onSaveMessagingSettings={handleSaveMessagingSettings} onSaveMessageTemplate={handleSaveMessageTemplate} onDeleteMessageTemplate={handleDeleteMessageTemplate} onSaveMessageRule={handleSaveMessageRule} onToggleMessageRule={handleToggleMessageRule} />;
      case "schoolStructure":
        return <PageErrorBoundary resetKey={`${selectedSchool?.id || 'none'}-${activePage}`}><SchoolStructurePage selectedSchool={selectedSchool} schoolUsers={users.filter((user) => user.schoolId === selectedSchool?.id)} currentUser={currentUser} onSaveSchoolStructureProfile={handleSaveSchoolStructureProfile} onSaveSchoolStructureStageConfigs={handleSaveSchoolStructureStageConfigs} onGenerateSchoolStructureClassrooms={handleGenerateSchoolStructureClassrooms} onUpdateSchoolStructureClassroom={handleUpdateSchoolStructureClassroom} onDeleteSchoolStructureClassroom={handleDeleteSchoolStructureClassroom} onClearSchoolStructureClassroomStudents={handleClearSchoolStructureClassroomStudents} onAddStudentToSchoolStructureClassroom={handleAddStudentToSchoolStructureClassroom} onUpdateStudentInSchoolStructureClassroom={handleUpdateStudentInSchoolStructureClassroom} onArchiveStudentInSchoolStructureClassroom={handleArchiveStudentInSchoolStructureClassroom} onTransferStudentInSchoolStructureClassroom={handleTransferStudentInSchoolStructureClassroom} onImportStudentsToSchoolStructureClassroom={handleImportStudentsToSchoolStructureClassroom} onUpdateScreenLink={handleUpdateScreenLink} /></PageErrorBoundary>;
      case "users":
        return (
          <div className="space-y-6">
            <UsersPage users={users} schools={schools} currentUser={currentUser} selectedSchoolId={selectedSchool?.id} onAddUser={handleAddUser} onSelectForEdit={handleSelectUserForEdit} editingUserId={editingUserId} onToggleUserStatus={handleToggleUserStatus} onDeleteUser={handleDeleteUser} onUpdateSchoolAccess={handleUpdateSchoolAccess} onOpenAccountSecurity={() => setAccountSecurityOpen(true)} onOpenResetUserPassword={(user) => { setResetPasswordTargetUserId(user?.id || null); setResetUserPasswordOpen(true); }} />
            {editingUser && (
              <SectionCard title={`تحرير الحساب: ${editingUser.name}`} icon={Settings}>
                <UserEditor editingUser={editingUser} schools={schools} currentUser={currentUser} onSave={handleUpdateUser} onCancel={() => setEditingUserId(null)} />
              </SectionCard>
            )}
          </div>
        );
      case "settings":
        return <SettingsPage selectedSchool={selectedSchool} settings={settings} attendanceMethod={attendanceMethod} users={users} schools={schools} currentUser={currentUser} onSaveSettings={setSettings} onRestoreBackup={restoreBackup} onResetData={resetData} onExportBackup={exportBackup} onImportStudents={handleImportStudentsFromExcel} onDownloadTemplate={downloadStudentImportTemplate} setAttendanceMethod={setAttendanceMethod} />;
      case "platformAuth":
        return <PlatformAuthSettingsPage selectedSchool={selectedSchool} settings={settings} attendanceMethod={attendanceMethod} users={users} schools={schools} currentUser={currentUser} onSaveSettings={setSettings} onRestoreBackup={restoreBackup} onResetData={resetData} onExportBackup={exportBackup} onImportStudents={handleImportStudentsFromExcel} onDownloadTemplate={downloadStudentImportTemplate} setAttendanceMethod={setAttendanceMethod} />;
    case "classes":
      return <ClassesPage selectedSchool={selectedSchool} />;
      default:
        return <SchoolDashboard schools={schools} selectedSchool={selectedSchool} setSelectedSchoolId={setSelectedSchoolId} scanLog={scanLog} notifications={notifications} canSelectSchool={currentUser.role === "superadmin"} executiveReport={executiveReport} currentUser={currentUser} onCreateGateLink={handleCreateGateLink} onDeleteGateLink={handleDeleteGateLink} onCreateScreenLink={handleCreateScreenLink} onDeleteScreenLink={handleDeleteScreenLink} onUpdateScreenLink={handleUpdateScreenLink} onNavigate={setActivePage} />;
    }
  };

  if (booting) {
    return (
      <div dir="rtl" className="flex min-h-screen items-center justify-center bg-slate-100 p-6">
        <div className="w-full max-w-xl rounded-[2rem] bg-white p-8 text-center shadow-sm ring-1 ring-slate-200">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-3xl bg-sky-50 text-sky-700 ring-1 ring-sky-100"><Database className="h-8 w-8" /></div>
          <div className="mt-5 text-3xl font-black text-slate-900">جارِ تهيئة المنصة</div>
          <div className="mt-3 text-sm leading-7 text-slate-500">يتم الآن تحميل بيانات المدارس والمستخدمين من الخادم المركزي والتحقق من الجلسة الحالية.</div>
        </div>
      </div>
    );
  }

  if (publicMode?.type === 'gate') {
    return <PublicGatePage token={publicMode.token} />;
  }

  if (publicMode?.type === 'screen') {
    return <PublicScreenPage token={publicMode.token} />;
  }

  if (!currentUser) {
    return <LoginPage settings={settings} users={users} schools={schools} onLogin={handleLogin} onRequestOtp={handleRequestOtpLogin} onVerifyOtp={handleVerifyOtpLogin} />;
  }

  return (
    <PageErrorBoundary resetKey={`${currentUser?.id || 'guest'}-${selectedSchool?.id || 'none'}-${activePage}`}>
      <>
      <div dir="rtl" className="min-h-screen bg-slate-50 text-slate-900">
      <div className="grid min-h-screen lg:grid-cols-[290px_1fr]">
        <aside className="border-l border-slate-200 bg-white p-4 lg:p-5">
          <div className="rounded-[2rem] bg-gradient-to-l from-sky-800 via-cyan-700 to-emerald-600 p-5 text-white shadow-lg">
            <div className="flex items-center justify-between gap-3">
              <div className="flex h-14 w-14 items-center justify-center rounded-3xl bg-white/20"><Building2 className="h-7 w-7" /></div>
              <Badge tone="blue">هيكل مؤسسي</Badge>
            </div>
            <div className="mt-4 text-2xl font-black leading-tight">{settings.platformName}</div>
            <div className="mt-2 text-sm leading-7 text-white/90">منصة متعددة المدارس: أدمن عام، مدراء مدارس، معلمون، بوابات حضور، وصلاحيات تفصيلية قابلة للتوسّع.</div>
          </div>

          <div className="mt-5 rounded-3xl bg-slate-50 p-4 ring-1 ring-slate-200">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white ring-1 ring-slate-200"><RoleIcon className="h-6 w-6 text-sky-700" /></div>
              <div>
                <div className="text-sm text-slate-500">الحساب الحالي</div>
                <div className="font-extrabold text-slate-800">{currentUser.name}</div>
                <div className="text-xs text-slate-500">{getRoleLabel(currentUser.role)}</div>
              </div>
            </div>
            <div className="mt-4 rounded-2xl bg-white p-4 ring-1 ring-slate-200">
              <div className="text-xs text-slate-500">اسم الدخول</div>
              <div className="mt-1 font-black text-slate-800">{currentUser.username}</div>
              <div className="mt-3 text-xs text-slate-500">النطاق</div>
              <div className="mt-1 font-bold text-slate-700">{currentUser.role === "superadmin" ? "جميع المدارس" : selectedSchool?.name || "—"}</div>
              <div className="mt-3 flex flex-wrap gap-2">
                <Badge tone={syncStatus === "online" || syncStatus === "saved" ? "green" : syncStatus === "saving" || syncStatus === "connecting" ? "amber" : syncStatus === "error" ? "rose" : "slate"}>
                  {syncStatus === "online" ? "الخادم متصل" : syncStatus === "saved" ? "تمت المزامنة" : syncStatus === "saving" ? "جارٍ الحفظ" : syncStatus === "connecting" ? "جارٍ الاتصال" : syncStatus === "error" ? "فشل المزامنة" : "محلي"}
                </Badge>
              </div>
            </div>
            <div className="mt-4 grid grid-cols-1 gap-3">
            <button onClick={() => setAccountSecurityOpen(true)} className="inline-flex w-full items-center justify-center rounded-2xl bg-sky-700 px-4 py-3 font-bold text-white">أمان الحساب</button>
            <button onClick={handleLogout} className="inline-flex w-full items-center justify-center rounded-2xl bg-slate-900 px-4 py-3 font-bold text-white">تسجيل الخروج</button>
            </div>
          </div>

          <nav className="mt-5 space-y-2">
            {allowedNav.map((item) => {
              const Icon = item.icon;
              const active = activePage === item.key;
              return (
                <button key={item.key} onClick={() => setActivePage(item.key)} className={cx("flex w-full items-center justify-between rounded-2xl px-4 py-3 text-right transition", active ? "bg-sky-700 text-white shadow-sm" : "bg-white text-slate-700 ring-1 ring-slate-200 hover:bg-slate-50")}>
                  <span className="font-bold">{item.label}</span>
                  <Icon className="h-5 w-5" />
                </button>
              );
            })}
          </nav>

          <div className="mt-5 rounded-3xl bg-amber-50 p-4 text-amber-900 ring-1 ring-amber-200">
            <div className="font-bold">بنية الصلاحيات</div>
            <div className="mt-2 text-sm leading-7">الأدمن العام يدير جميع المدارس والمستخدمين. مدير المدرسة هو أدمن المدرسة، ويستطيع إنشاء المستخدمين داخل مدرسته بحسب الصلاحيات الممنوحة لهم.</div>
          </div>
        </aside>

        <main className="p-4 md:p-6 lg:p-8">
          <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} className="overflow-hidden rounded-[2rem] bg-white shadow-sm ring-1 ring-slate-200">
            <div className="flex flex-col gap-4 border-b border-slate-100 p-5 md:flex-row md:items-center md:justify-between">
              <div>
                {currentUser.role === "superadmin" && activePage === "platformAuth" ? (
                  <>
                    <div className="text-sm text-slate-500">الإعدادات العامة للمنصة</div>
                    <h1 className="mt-1 text-2xl font-black text-slate-800 md:text-3xl">الدخول والمصادقة العامة</h1>
                    <div className="mt-2 flex flex-wrap gap-2">
                      <Badge tone="sky">OTP / Passwordless</Badge>
                      <Badge tone="violet">SMTP</Badge>
                      <Badge tone="green">SMS / واتساب</Badge>
                      <Badge tone="amber">سياسات الأمان</Badge>
                    </div>
                  </>
                ) : activePage === "settings" ? (
                  <>
                    <div className="text-sm text-slate-500">إعدادات المدرسة الحالية</div>
                    <h1 className="mt-1 text-2xl font-black text-slate-800 md:text-3xl">إعدادات المدرسة والتشغيل</h1>
                    <div className="mt-2 flex flex-wrap gap-2">
                      <Badge tone="green">{selectedSchool?.name || "بدون مدرسة"}</Badge>
                      <Badge tone="blue">{selectedSchool?.city || "—"}</Badge>
                      <Badge tone="violet">{selectedSchool?.students?.length || 0} طالب</Badge>
                      <Badge tone="amber">{attendanceMethod === "barcode" ? "QR" : "بصمة وجه"}</Badge>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="text-sm text-slate-500">المدرسة الحالية</div>
                    <h1 className="mt-1 text-2xl font-black text-slate-800 md:text-3xl">{selectedSchool?.name || "—"}</h1>
                    <div className="mt-2 flex flex-wrap gap-2">
                      <Badge tone="green">{selectedSchool?.city || "—"}</Badge>
                      <Badge tone="blue">{selectedSchool?.students?.length || 0} طالب</Badge>
                      <Badge tone="violet">{selectedSchool?.companies?.length || 0} شركات</Badge>
                      <Badge tone="amber">{attendanceMethod === "barcode" ? "QR" : "بصمة وجه"}</Badge>
                    </div>
                  </>
                )}
              </div>
              <div className="flex flex-wrap items-center gap-3">
                {currentUser.role === "superadmin" && activePage !== "platformAuth" && (
                  <select value={selectedSchool?.id || ""} onChange={(e) => setSelectedSchoolId(Number(e.target.value))} className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-bold outline-none">
                    {schools.map((school) => <option key={school.id} value={school.id}>{school.name}</option>)}
                  </select>
                )}
                <button onClick={() => setActivePage("dashboard")} className="inline-flex items-center gap-2 rounded-2xl bg-slate-100 px-4 py-3 font-bold text-slate-700"><Bell className="h-4 w-4" /> التنبيهات</button>
                {canAccessPermission(currentUser, "settings") && <button onClick={() => setActivePage(currentUser.role === "superadmin" ? "platformAuth" : "settings")} className="inline-flex items-center gap-2 rounded-2xl bg-slate-100 px-4 py-3 font-bold text-slate-700"><BookOpen className="h-4 w-4" /> {currentUser.role === "superadmin" ? "الدخول والمصادقة" : "الإعدادات"}</button>}
                <button onClick={() => setAccountSecurityOpen(true)} className="inline-flex items-center gap-2 rounded-2xl bg-slate-100 px-4 py-3 font-bold text-slate-700"><ShieldCheck className="h-4 w-4" /> أمان الحساب</button>
                <button onClick={quickAction} className="inline-flex items-center gap-2 rounded-2xl bg-sky-700 px-4 py-3 font-bold text-white"><Plus className="h-4 w-4" /> إجراء سريع</button>
              </div>
            </div>
            <div className="p-5 md:p-6">
              <PageErrorBoundary resetKey={`${selectedSchool?.id || 'none'}-${activePage}`}>
                {renderPage()}
              </PageErrorBoundary>
            </div>
          </motion.div>
        </main>
      </div>
    </div>
      <AccountSecurityModal open={accountSecurityOpen} currentUser={currentUser} onClose={() => setAccountSecurityOpen(false)} onSubmit={handleChangeOwnPassword} loading={accountSecurityLoading} />
      <ResetUserPasswordModal open={resetUserPasswordOpen} targetUser={resetPasswordTargetUser} onClose={() => { setResetUserPasswordOpen(false); setResetPasswordTargetUserId(null); }} onSubmit={handleAdminResetUserPassword} loading={resetUserPasswordLoading} />
      </>
    </PageErrorBoundary>
  );
}


function PlatformAuthSettingsPage(props) {
  return (
    <SettingsPage
      {...props}
      forcedTab="auth"
      titleOverride="إعدادات الدخول والمصادقة العامة"
      descriptionOverride="هذه الصفحة عامة على مستوى المنصة ويعتمدها الأدمن العام فقط. من هنا تدير سياسة تسجيل الدخول وكلمة المرور وOTP وPasswordless والبريد وSMS وواتساب واختبارات القنوات وسجل المحاولات، بدون ارتباط بأي مدرسة."
    />
  );
}


function UserEditor({ editingUser, schools, currentUser, onSave, onCancel }) {
  const canManageAll = currentUser?.role === "superadmin";
  const roleOptions = canManageAll ? roles : roles.filter((role) => principalDelegableRoles.includes(role.key));
  const [form, setForm] = useState({
    ...editingUser,
    permissions: clampDelegatedPermissions(currentUser, editingUser.role, buildRolePermissions(editingUser.role, editingUser.permissions)),
  });

  useEffect(() => {
    setForm({
      ...editingUser,
      permissions: clampDelegatedPermissions(currentUser, editingUser.role, buildRolePermissions(editingUser.role, editingUser.permissions)),
    });
  }, [editingUser]);

  const handleRoleChange = (role) => {
    setForm((prev) => ({
      ...prev,
      role,
      schoolId: role === "superadmin" ? null : (canManageAll ? (prev.schoolId || schools[0]?.id || 1) : (currentUser.schoolId || schools[0]?.id || 1)),
      permissions: clampDelegatedPermissions(currentUser, role, buildRolePermissions(role, prev.permissions)),
    }));
  };

  return (
    <form onSubmit={(e) => { e.preventDefault(); onSave(form); }} className="grid grid-cols-1 gap-4 md:grid-cols-2">
      <Input label="الاسم" value={form.name} onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))} />
      <Input label="البريد الإلكتروني" value={form.email || ''} onChange={(e) => setForm((prev) => ({ ...prev, email: e.target.value.toLowerCase() }))} />
      <Input label="رقم الجوال" value={form.mobile || ''} onChange={(e) => setForm((prev) => ({ ...prev, mobile: e.target.value }))} placeholder="9665XXXXXXXX" />
      <Input label="اسم الدخول" value={form.username} onChange={(e) => setForm((prev) => ({ ...prev, username: e.target.value.toLowerCase() }))} />
      <Input label="كلمة المرور" value={form.password} onChange={(e) => setForm((prev) => ({ ...prev, password: e.target.value }))} />
      <Select label="الدور" value={form.role} onChange={(e) => handleRoleChange(e.target.value)}>
        {roleOptions.map((role) => <option key={role.key} value={role.key}>{role.label}</option>)}
      </Select>
      {form.role !== "superadmin" && <Select label="المدرسة" value={form.schoolId || ""} onChange={(e) => setForm((prev) => ({ ...prev, schoolId: Number(e.target.value) }))} disabled={!canManageAll}>{schools.map((school) => <option key={school.id} value={school.id}>{school.name}</option>)}</Select>}
      {!canManageAll ? <div className="rounded-2xl bg-amber-50 px-4 py-3 text-sm font-bold text-amber-900 ring-1 ring-amber-200 md:col-span-2">مدير المدرسة يحرر فقط حسابات مدرسته التشغيلية، ولا يستطيع تحويل أي مستخدم إلى مدير مدرسة أو أدمن عام أو منحه صلاحيات مركزية.</div> : null}
      <Select label="حالة الحساب" value={form.status} onChange={(e) => setForm((prev) => ({ ...prev, status: e.target.value }))}>
        <option value="نشط">نشط</option>
        <option value="موقوف">موقوف</option>
      </Select>
      <div className="grid grid-cols-1 gap-3 md:col-span-2 md:grid-cols-3">
        {permissionDefinitions.map((permission) => (
          <label key={permission.key} className="flex items-center justify-between rounded-2xl bg-white px-4 py-3 text-sm font-bold text-slate-700 ring-1 ring-slate-200">
            <span>{permission.label}</span>
            <input type="checkbox" checked={Boolean(form.permissions?.[permission.key])} disabled={!canManageAll && !principalManageablePermissionKeys.includes(permission.key)} onChange={(e) => setForm((prev) => ({ ...prev, permissions: { ...prev.permissions, [permission.key]: e.target.checked } }))} />
          </label>
        ))}
      </div>
      <div className="flex flex-wrap gap-3 md:col-span-2">
        <button type="submit" className="inline-flex items-center gap-2 rounded-2xl bg-sky-700 px-5 py-3 font-bold text-white"><Save className="h-4 w-4" /> حفظ التعديلات</button>
        <button type="button" onClick={onCancel} className="inline-flex items-center gap-2 rounded-2xl bg-slate-100 px-5 py-3 font-bold text-slate-700"><RefreshCw className="h-4 w-4" /> إلغاء</button>
      </div>
    </form>
  );
}

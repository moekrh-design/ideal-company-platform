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
  CheckCircle,
  Building2,
  Camera,
  ClipboardCheck,
  ClipboardList,
  Copy,
  Database,
  ExternalLink,
  Download,
  Gift,
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
  Wifi,
  WifiOff,
  Clock3,
  Save,
  ScanLine,
  School,
  ShoppingCart,
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
  PackageCheck,
  Printer,
  Unlink2,
  UserCheck,
  Phone,
  RefreshCcw,
  School2,
  Sparkles,
  FolderOpen,
  Info,
  ChevronDown,
  AlertCircle,
} from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  LabelList,
  Legend,
  Line,
  LineChart as RLineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

// ==========================================
//  v1.8.1 — الصفحات والمكونات المستخرجة
// ==========================================

// صفحات
import LoginPage from './pages/LoginPage';
import SchoolDashboard from './pages/SchoolDashboard';
import SchoolsPage from './pages/SchoolsPage';
import CompaniesPage from './pages/CompaniesPage';
import StudentsPage from './pages/StudentsPage';
import AttendancePage from './pages/AttendancePage';
import StudentActionsPage from './pages/StudentActionsPage';
import PointsPage from './pages/PointsPage';
import LeavePassesPage from './pages/LeavePassesPage';
import LessonAttendanceSessionsPage from './pages/LessonAttendanceSessionsPage';
import ReportsPage from './pages/ReportsPage';
import SettingsPage from './pages/SettingsPage';
import UsersPage from './pages/UsersPage';
import MessagingCenterPage from './pages/MessagingCenterPage';
import RewardStorePage from './pages/RewardStorePage';
import NafisBankPage from './pages/NafisBankPage';
import NafisDashboardPage from './pages/NafisDashboardPage';
import ParentExecutiveSummaryPage from './pages/ParentExecutiveSummaryPage';
import ParentAccountsPage from './pages/ParentAccountsPage';
import GateAttendancePage from './pages/GateAttendancePage';
import SecurityDeskPage from './pages/SecurityDeskPage';
import ParentAuditFeedPage from './pages/ParentAuditFeedPage';
import SchoolStructurePage from './pages/SchoolStructurePage';
import PointsRewardsConfigPage from './pages/PointsRewardsConfigPage';
import StudentRolePage from './pages/StudentRolePage';
import BackupsModal from './pages/BackupsModal';
import EditSchoolForm from './pages/EditSchoolForm';
import DeviceDisplaysPage from './pages/DeviceDisplaysPage';

// مكونات مشتركة
import PublicGatePage from './components/PublicGatePage';
import PublicScreenPage from './components/PublicScreenPage';
import LiveCameraPanel from './components/LiveCameraPanel';
import SchoolDeviceLinksPanel from './components/SchoolDeviceLinksPanel';
import WeeklyTimetableEditor from './components/WeeklyTimetableEditor';
import HelpGuideModal from './components/HelpGuideModal';
import TeacherPointsCapSection from './components/TeacherPointsCapSection';
import AccountSecurityModal from './components/AccountSecurityModal';
import ResetUserPasswordModal from './components/ResetUserPasswordModal';

// مكونات UI
import { SectionCard } from './components/ui/SectionCard';
import { StatCard } from './components/ui/StatCard';
import { DataTable } from './components/ui/DataTable';
import { Modal } from './components/ui/Modal';
import { Input, Select, SummaryBox, MetricTile } from './components/ui/FormElements';


import PlatformAuthSettingsPage from './pages/PlatformAuthSettingsPage';
import ClassesPage from './pages/ClassesPage';
const STORAGE_KEY = "ideal-company-platform-state-v8";
const UI_STATE_KEY = "ideal-company-platform-ui-v8";
const SERVER_CACHE_KEY = "ideal-company-platform-server-cache-v8";
const SESSION_TOKEN_KEY = "ideal-company-platform-session-token-v8";
const BACKUP_VERSION = 8;
const APP_VERSION = "v1.8.0";
const APP_VERSION_DATE = "2026-03-27";
const GATE_OFFLINE_QUEUE_PREFIX = "ideal-company-platform-gate-offline-queue-v1";
const GATE_SYNC_LOG_PREFIX = "ideal-company-platform-gate-sync-log-v1";


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

function getShortStudentName(fullName) {
  if (!fullName) return 'طالب';
  const parts = String(fullName).trim().split(/\s+/);
  if (parts.length <= 2) return fullName;
  return `${parts[0]} ${parts[parts.length - 1]}`;
}

function schoolHasStructureClassrooms(school) {
  return Array.isArray(school?.structure?.classrooms) && school.structure.classrooms.length > 0;
}

function getStudentCompanyName(student, school) {
  if (!student) return '';
  if (student.source === 'structure') {
    return student.companyName || student.classroomName || student.className || '';
  }
  return school?.companies?.find((item) => item.id === student.companyId)?.name || student.companyName || student.className || '';
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
    "id": 1,
    "name": "متوسطة الأبناء الثالثة",
    "city": "أبها",
    "code": "ABH-003",
    "manager": "",
    "status": "نشطة",
    "companies": [],
    "students": []
  },
  {
    "id": 2,
    "name": "مدرسة الرياض النموذجية",
    "city": "الرياض",
    "code": "RYD-011",
    "manager": "",
    "status": "نشطة",
    "companies": [],
    "students": []
  },
  {
    "id": 3,
    "name": "ابتدائية الأبناء الرابعة",
    "city": "خميس مشيط",
    "code": "61506",
    "manager": "خالد جابر الفيفي",
    "status": "نشطة",
    "companies": [],
    "students": []
  },
  {
    "id": 4,
    "name": "ثانوية الشيخ محمد بن عثيمين",
    "city": "الخرج",
    "code": "116117",
    "manager": "محمد عواض الثقفي",
    "status": "نشطة",
    "companies": [
      {
        "id": 1,
        "name": "غير محدد - الفصل 1",
        "className": "غير محدد - الفصل 1",
        "leader": "—",
        "points": 0,
        "early": 0,
        "behavior": 100,
        "initiatives": 0
      }
    ],
    "students": []
  },
  {
    "id": 5,
    "name": "متوسطة الأبناء الثالثة",
    "city": "خميس مشيط",
    "code": "61511",
    "manager": "عبدالله سعيد الخفاجي",
    "status": "نشطة",
    "companies": [],
    "students": []
  }
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



function parseTeacherSubjects(value) {
  if (Array.isArray(value)) return value.map((item) => String(item || '').trim()).filter(Boolean);
  return String(value || '')
    .split(/[\n،,]+/)
    .map((item) => item.trim())
    .filter(Boolean);
}

function getTeacherSubjects(user) {
  return parseTeacherSubjects(user?.subjects || user?.subjectAssignments || []);
}

function hydrateTeacherSpecialItems(items = []) {
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

function getTeacherSpecialItems(user, actionType = '', subject = '') {
  const type = actionType === 'violation' ? 'violation' : actionType === 'program' ? 'program' : 'reward';
  return hydrateTeacherSpecialItems(user?.specialItems || [])
    .filter((item) => item.type === type)
    .filter((item) => !subject || item.subject === subject)
    .filter((item) => item.isActive !== false)
    .map((item) => ({ ...item, scope: 'special' }));
}

function getCurrentAcademicTermId(settings = {}) {
  return `term-${String(settings?.academicYear || 'default').trim() || 'default'}`;
}

const SPECIAL_ITEM_TEMPLATES = {
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

function computeTeacherSpecialStats(actionLog = [], teacher = null, settings = {}) {
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

function computeTeacherSpecialScore(actionLog = [], teacher = null, settings = {}) {
  return computeTeacherSpecialStats(actionLog, teacher, settings).score;
}

function TeacherSpecialItemsEditor({ subjects = [], items = [], onChange }) {
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
  { key: "agent", label: "الوكيل", icon: ShieldAlert },
  { key: "counselor", label: "المرشد", icon: UserCheck },
  { key: "gate", label: "بوابة الحضور", icon: ScanLine },
  { key: "supervisor", label: "المشرف", icon: Users },
  { key: "teacher", label: "المعلم", icon: UserCircle2 },
  { key: "student", label: "الطالب", icon: QrCode },
];

const schoolRoleDefinitions = [
  { key: "principal", label: "مدير المدرسة" },
  { key: "agent", label: "الوكيل" },
  { key: "counselor", label: "المرشد" },
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
  { key: "actions", label: "إجراءات" },
  { key: "points", label: "ترتيب الفصول" },
  { key: "reports", label: "مركز التقارير" },
  { key: "deviceDisplays", label: "الشاشات والبوابات" },
  { key: "messages", label: "الرسائل والتنبيهات" },
  { key: "leavePass", label: "الاستئذان" },
  { key: "settings", label: "الإعدادات" },
  { key: "users", label: "المستخدمون والصلاحيات" },
];

const defaultPermissionsByRole = {
  superadmin: Object.fromEntries(permissionDefinitions.map((item) => [item.key, true])),
  principal: { dashboard: true, schools: false, companies: true, students: true, attendance: true, actions: true, points: true, reports: true, deviceDisplays: true, messages: true, leavePass: true, settings: true, users: true },
  agent: { dashboard: true, schools: false, companies: false, students: false, attendance: false, actions: false, points: false, reports: true, deviceDisplays: false, messages: false, leavePass: true, settings: false, users: false },
  counselor: { dashboard: true, schools: false, companies: false, students: false, attendance: false, actions: false, points: false, reports: true, deviceDisplays: false, messages: false, leavePass: true, settings: false, users: false },
  gate: { dashboard: false, schools: false, companies: false, students: false, attendance: true, actions: false, points: false, reports: false, deviceDisplays: false, messages: false, leavePass: true, settings: false, users: false },
  supervisor: { dashboard: true, schools: false, companies: false, students: true, attendance: true, actions: true, points: true, reports: true, deviceDisplays: false, messages: false, leavePass: true, settings: false, users: false },
  teacher: { dashboard: true, schools: false, companies: false, students: false, attendance: false, actions: true, points: true, reports: false, deviceDisplays: false, messages: false, leavePass: true, settings: false, users: false },
  student: { dashboard: true, schools: false, companies: false, students: false, attendance: false, actions: false, points: true, reports: false, deviceDisplays: false, messages: false, settings: false, users: false },
};

const navItems = [
  // ── بدون مجموعة (العمليات اليومية) ──
  { key: "dashboard", label: "الرئيسية", icon: LayoutDashboard, permission: "dashboard", excludeRoles: ["gate"] },
  { key: "schools", label: "المدارس", icon: Building2, permission: "schools" },
  { key: "attendance", label: "الحضور الذكي", icon: ScanLine, permission: "attendance" },
  { key: "lessonAttendanceSessions", label: "تحضير الحصص", icon: ClipboardList, permission: "actions", roles: ["superadmin", "principal", "supervisor", "teacher"] },
  { key: "actions", label: "إجراءات", icon: ClipboardCheck, permission: "actions" },
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
  { key: "students", label: "البصمة والمعرفات", icon: GraduationCap, permission: "students", group: "الأجهزة والربط" },
  // ── الإعدادات ──
  { key: "settings", label: "إعدادات المدرسة", icon: Settings, permission: "settings", group: "الإعدادات" },
  { key: "schoolStructure", label: "إعدادات المدرسة (الهيكل)", icon: School, permission: "settings", group: "الإعدادات" },
  { key: "users", label: "المستخدمون", icon: ShieldCheck, permission: "users", group: "الإعدادات" },
  { key: "platformAuth", label: "الدخول والمصادقة", icon: ShieldCheck, permission: "settings", roles: ["superadmin"], group: "الإعدادات" },
];

const principalDelegableRoles = ["agent", "counselor", "gate", "supervisor", "teacher", "student"];
const principalManageablePermissionKeys = ["dashboard", "companies", "students", "attendance", "actions", "points", "reports", "messages", "leavePass"];

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
  if (user?.role === "agent" && canAccessPermission(user, "leavePass")) return "leavePassAgentDesk";
  if (user?.role === "counselor" && canAccessPermission(user, "leavePass")) return "leavePassCounselorDesk";
  if (user?.role === "teacher" && canAccessPermission(user, "actions")) return "actions";
  if (user?.role === "supervisor" && canAccessPermission(user, "reports")) return "reports";
  if (user?.role === "gate") return "securityDesk";
  const firstAllowed = navItems.find((item) => canAccessPermission(user, item.permission) && (!Array.isArray(item.roles) || !item.roles.length || item.roles.includes(user?.role)));
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
      password: user.password || "",
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
    ...item,
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

function hydrateGateSyncCenterEvents(items = []) {
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


// ===== دالة دمج المدارس: تُحافظ على المدارس الموجودة وتُحدِّث فقط الواردة =====
// المشكلة: عند استقبال استجابة من الخادم بمدرسة واحدة (للمعلم/المدير)
// تُستبدل جميع المدارس بمدرسة واحدة في واجهة الأدمن
// الحل: دمج المدارس الواردة مع المدارس الموجودة بدلاً من الاستبدال
function mergeSchoolsFromResponse(existingSchools, incomingSchools) {
  if (!Array.isArray(incomingSchools) || incomingSchools.length === 0) return existingSchools;
  if (!Array.isArray(existingSchools) || existingSchools.length === 0) return incomingSchools;
  // إذا كانت المدارس الواردة أكثر أو مساوية للموجودة، استخدمها مباشرة
  if (incomingSchools.length >= existingSchools.length) return incomingSchools;
  // المدارس الواردة أقل: دمج ذكي - نُحدِّث الواردة ونحتفظ بالباقية
  const incomingIds = new Set(incomingSchools.map(function(s) { return s.id; }));
  const keptSchools = existingSchools.filter(function(s) { return !incomingIds.has(s.id); });
  return [...incomingSchools, ...keptSchools];
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

function safeLocalStorageSetItem(key, value) {
  try {
    window.localStorage.setItem(key, value);
  } catch (e) {
    if (e && (e.name === 'QuotaExceededError' || e.code === 22 || e.code === 1014)) {
      // localStorage ممتلئ - نحاول مسح الـ cache القديم أولاً
      try {
        window.localStorage.removeItem(SERVER_CACHE_KEY);
        window.localStorage.removeItem(STORAGE_KEY);
        window.localStorage.setItem(key, value);
      } catch (e2) {
        console.warn('localStorage quota exceeded, skipping save:', key);
      }
    }
  }
}

function saveUiState(payload) {
  if (typeof window === "undefined") return;
  safeLocalStorageSetItem(UI_STATE_KEY, JSON.stringify(payload));
}

function saveServerCache(payload) {
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
  if (token) safeLocalStorageSetItem(SESSION_TOKEN_KEY, token);
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
    // إرفاق البيانات مع الخطأ حتى يمكن استخدام live منها
    const error = new Error(data?.message || "تعذر تنفيذ الطلب على الخادم.");
    error.data = data;
    throw error;
  }
  return data;
}

function buildWsUrl(path) {
  if (typeof window === "undefined") return path;
  const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
  return `${protocol}//${window.location.host}${path}`;
}

function getGateOfflineQueueKey(token) {
  return `${GATE_OFFLINE_QUEUE_PREFIX}:${token || "unknown"}`;
}

function readGateOfflineQueue(token) {
  if (typeof window === "undefined") return [];
  try {
    const parsed = JSON.parse(window.localStorage.getItem(getGateOfflineQueueKey(token)) || "[]");
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeGateOfflineQueue(token, queue) {
  if (typeof window === "undefined") return [];
  const safeQueue = Array.isArray(queue) ? queue : [];
  window.localStorage.setItem(getGateOfflineQueueKey(token), JSON.stringify(safeQueue));
  return safeQueue;
}

function enqueueGateOfflineScan(token, operation) {
  const queue = readGateOfflineQueue(token);
  queue.push(operation);
  writeGateOfflineQueue(token, queue);
  return queue;
}

function removeGateOfflineQueueItem(token, operationId) {
  const next = readGateOfflineQueue(token).filter((item) => item.id !== operationId);
  writeGateOfflineQueue(token, next);
  return next;
}

function getGateOfflineQueueSummary(token) {
  const queue = readGateOfflineQueue(token);
  return {
    total: queue.length,
    earliestAt: queue.length ? queue[0]?.capturedAt || queue[0]?.createdAt || '' : '',
    latestAt: queue.length ? queue[queue.length - 1]?.capturedAt || queue[queue.length - 1]?.createdAt || '' : '',
    items: queue.slice(-5).reverse(),
  };
}


function getGateSyncLogKey(token) {
  return `${GATE_SYNC_LOG_PREFIX}:${token || "unknown"}`;
}

function readGateSyncLog(token) {
  if (typeof window === "undefined") return [];
  try {
    const parsed = JSON.parse(window.localStorage.getItem(getGateSyncLogKey(token)) || "[]");
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeGateSyncLog(token, items) {
  if (typeof window === "undefined") return [];
  const safeItems = Array.isArray(items) ? items.slice(0, 150) : [];
  window.localStorage.setItem(getGateSyncLogKey(token), JSON.stringify(safeItems));
  return safeItems;
}

function appendGateSyncLog(token, entry) {
  const current = readGateSyncLog(token);
  current.unshift({ id: entry?.id || `gate-log-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`, createdAt: new Date().toISOString(), ...entry });
  return writeGateSyncLog(token, current);
}

function clearGateSyncLog(token) {
  return writeGateSyncLog(token, []);
}

function getGateSyncLogSummary(token) {
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

function removeGateSyncLogItem(token, logId) {
  const next = readGateSyncLog(token).filter((item) => item.id !== logId);
  return writeGateSyncLog(token, next);
}

function getGateSyncStatusMeta(status) {
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

function formatLocalGateTimestamp(value) {
  if (!value) return "—";
  try {
    return new Date(value).toLocaleString('ar-SA', { hour12: false, year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit' });
  } catch {
    return String(value);
  }
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

function escapePrintHtml(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function buildPrintSummaryStats(cards = []) {
  if (!Array.isArray(cards) || !cards.length) return '';
  return `<div class="stats">${cards.map((card) => `<div class="stat ${escapePrintHtml(card.tone || '')}"><div class="k">${escapePrintHtml(card.label || '')}</div><div class="v">${escapePrintHtml(card.value || '')}</div>${card.note ? `<div class="n">${escapePrintHtml(card.note)}</div>` : ''}</div>`).join('')}</div>`;
}

function printHtmlContent(title, bodyHtml, options = {}) {
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

function getLessonSessionIdFromLocation() {
  if (typeof window === "undefined") return "";
  const params = new URLSearchParams(window.location.search);
  return String(params.get("lessonSession") || '').trim();
}

function buildLessonSessionLink(sessionId) {
  if (typeof window === "undefined") return "";
  const url = new URL(window.location.origin + window.location.pathname);
  url.searchParams.set('lessonSession', String(sessionId || ''));
  return url.toString();
}

function clearLessonSessionParam() {
  if (typeof window === "undefined") return;
  const url = new URL(window.location.href);
  url.searchParams.delete('lessonSession');
  window.history.replaceState({}, '', url.toString());
}

function getLeavePassIdFromLocation() {
  if (typeof window === "undefined") return "";
  const params = new URLSearchParams(window.location.search);
  return String(params.get("leavePass") || "").trim();
}

function buildLeavePassLink(leavePassId) {
  if (typeof window === "undefined") return "";
  const url = new URL(window.location.origin + '/teacher');
  url.searchParams.set("leavePass", String(leavePassId || ""));
  return url.toString();
}

function clearLeavePassParam() {
  if (typeof window === "undefined") return;
  const url = new URL(window.location.href);
  url.searchParams.delete("leavePass");
  window.history.replaceState({}, "", url.toString());
}

function getLeavePasses(school) {
  return Array.isArray(school?.leavePasses) ? school.leavePasses : [];
}

function getLeavePassTimeline(pass) {
  return Array.isArray(pass?.timeline) ? [...pass.timeline].sort((a, b) => String(b?.at || '').localeCompare(String(a?.at || ''))) : [];
}

function createLeavePassEvent(type, actorName, note = '') {
  return {
    id: `evt-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    type: String(type || 'updated'),
    actorName: String(actorName || 'مستخدم النظام').trim() || 'مستخدم النظام',
    note: String(note || '').trim(),
    at: new Date().toISOString(),
  };
}

function getLeavePassEventLabel(type) {
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

function getLeavePassStatusLabel(status) {
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

function getLeavePassStatusTone(status) {
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

function getLeavePassAgeMinutes(pass) {
  const base = new Date(pass?.updatedAt || pass?.approvedAt || pass?.viewedAt || pass?.createdAt || '').getTime();
  if (!base || Number.isNaN(base)) return 0;
  return Math.max(0, Math.round((Date.now() - base) / 60000));
}

function getLeavePassQueueMeta(pass) {
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

function getLeavePassElapsedLabel(pass) {
  const ageMinutes = getLeavePassAgeMinutes(pass);
  if (ageMinutes < 1) return 'الآن';
  if (ageMinutes < 60) return `منذ ${formatEnglishDigits(ageMinutes)} دقيقة`;
  const hours = Math.floor(ageMinutes / 60);
  const mins = ageMinutes % 60;
  return mins ? `منذ ${formatEnglishDigits(hours)}س ${formatEnglishDigits(mins)}د` : `منذ ${formatEnglishDigits(hours)} ساعة`;
}

function getLeavePassDestinationLabel(destination) {
  switch (String(destination || "")) {
    case "agent": return "الوكيل";
    case "counselor": return "المرشد";
    case "guardian": return "الخروج مع ولي الأمر";
    default: return "—";
  }
}

function getLessonAttendanceSessions(school) {
  return Array.isArray(school?.lessonAttendanceSessions) ? school.lessonAttendanceSessions : [];
}

function getRewardStore(school) {
  return {
    items: Array.isArray(school?.rewardStore?.items) ? school.rewardStore.items : [],
    parentProposals: Array.isArray(school?.rewardStore?.parentProposals) ? school.rewardStore.parentProposals : [],
    redemptionRequests: Array.isArray(school?.rewardStore?.redemptionRequests) ? school.rewardStore.redemptionRequests : [],
    notifications: Array.isArray(school?.rewardStore?.notifications) ? school.rewardStore.notifications : [],
  };
}

function createRewardStoreNotification(payload = {}) {
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

function prependRewardStoreNotification(store, payload = {}) {
  const entry = createRewardStoreNotification(payload);
  return {
    ...store,
    notifications: [entry, ...(Array.isArray(store?.notifications) ? store.notifications : [])].slice(0, 80),
  };
}

function normalizeRewardStoreItem(item = {}) {
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

function getRewardStoreDonorLabel(item = {}) {
  const normalized = normalizeRewardStoreItem(item);
  if (normalized.showDonorName && normalized.donorName) return normalized.donorName;
  if (normalized.sourceType === 'parent') return 'ولي أمر';
  if (normalized.sourceType === 'external') return 'متبرع خارجي';
  return 'إدارة المدرسة';
}

function getRewardStoreStatusLabel(status) {
  if (status === 'active') return 'معتمدة في المتجر';
  if (status === 'awaiting_receipt') return 'بانتظار الاستلام';
  if (status === 'received_pending_activation') return 'بانتظار اعتماد المدير';
  if (status === 'depleted') return 'منتهية الكمية';
  if (status === 'rejected') return 'مرفوضة';
  return 'مقترحة';
}

function getApprovedRewardStoreItems(school) {
  return getRewardStore(school).items.map((item) => normalizeRewardStoreItem(item)).filter((item) => item && item.isActive !== false && item.approvalStatus === 'active' && item.remainingQuantity > 0);
}

function buildRewardStoreSummary(school) {
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


function getRewardStoreDisplayItems(school, screenConfig = null) {
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

function buildRewardStoreScreenSummary(school, screenConfig = null) {
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

function buildLessonAttendanceSessionLabel(session) {
  const slot = String(session?.slotLabel || session?.slot || 'الحصة').trim();
  const date = String(session?.dateIso || '').trim();
  return [slot, date].filter(Boolean).join(' • ');
}

function getLessonAttendanceSessionStatusTone(status) {
  if (status === 'closed') return 'slate';
  if (status === 'expired') return 'amber';
  return 'green';
}

function getLessonAttendanceSessionStatusLabel(status) {
  if (status === 'closed') return 'مغلقة';
  if (status === 'expired') return 'منتهية';
  return 'مفتوحة';
}

function getClassroomKeyFromCompanyRow(row) {
  if (!row) return '';
  return String(row.source === 'structure' ? `structure:${row.rawId || row.id}` : `school:${row.rawId || row.id}`);
}

function getStudentsForLessonClassroom(school, classroomKey) {
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

function computeLessonAttendanceSessionSummary(session, school, schoolUsers = []) {
  const submissions = Array.isArray(session?.submissions) ? session.submissions : [];
  const expectedTeachers = (schoolUsers || []).filter((user) => ['teacher', 'principal', 'supervisor', 'superadmin'].includes(String(user?.role || '')) && String(user?.status || 'نشط') === 'نشط');
  const submittedTeacherIds = new Set(submissions.map((item) => String(item.teacherId || '')).filter(Boolean));
  const absentRows = submissions.flatMap((submission) => (Array.isArray(submission.absentStudents) ? submission.absentStudents : []).map((student) => ({
    sessionId: session?.id,
    sessionLabel: buildLessonAttendanceSessionLabel(session),
    className: submission.className || '—',
    teacherName: submission.teacherName || '—',
    studentId: student.id,
    studentName: student.name || student.fullName || 'طالب',
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

function summarizeSchoolLiveState(school, scanLog = [], actionLog = []) {
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
  const size = 64; // رفع الدقة من 32 إلى 64 لتحسين الدقة
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const context = canvas.getContext("2d", { willReadFrequently: true });
  // توسيع منطقة الوجه بنسبة 15% لتضمين السياق المحيط
  let sx, sy, sw, sh;
  if (bounds) {
    const pad = Math.round(Math.min(bounds.width, bounds.height) * 0.15);
    sx = Math.max(0, bounds.x - pad);
    sy = Math.max(0, bounds.y - pad);
    sw = Math.min(image.width - sx, bounds.width + pad * 2);
    sh = Math.min(image.height - sy, bounds.height + pad * 2);
  } else {
    sx = 0; sy = 0; sw = image.width; sh = image.height;
  }
  context.drawImage(image, sx, sy, sw, sh, 0, 0, size, size);
  const pixels = context.getImageData(0, 0, size, size).data;
  const values = [];
  for (let index = 0; index < pixels.length; index += 4) {
    const gray = Math.round((pixels[index] * 0.299) + (pixels[index + 1] * 0.587) + (pixels[index + 2] * 0.114));
    values.push(gray);
  }
  // Z-score normalization مع حد أدنى 8 للانحراف المعياري
  const average = values.reduce((sum, value) => sum + value, 0) / Math.max(values.length, 1);
  const variance = values.reduce((sum, value) => sum + Math.pow(value - average, 2), 0) / Math.max(values.length, 1);
  const stdDev = Math.max(Math.sqrt(variance), 8);
  const signature = values.map((value) => Math.max(0, Math.min(255, Math.round(((value - average) / stdDev) * 40 + 128))));
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

// تحسين تباين الصورة لتحسين قراءة الباركود
function enhanceContrastForBarcode(ctx, width, height) {
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

async function detectBarcodeValueFromSource(source) {
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

function compareFaceSignatures(baseSignature, candidateSignature) {
  if (!Array.isArray(baseSignature) || !Array.isArray(candidateSignature)) return Number.POSITIVE_INFINITY;
  const length = Math.min(baseSignature.length, candidateSignature.length);
  if (!length) return Number.POSITIVE_INFINITY;
  let total = 0;
  for (let index = 0; index < length; index += 1) total += Math.abs(baseSignature[index] - candidateSignature[index]);
  return total / length;
}

function findBestFaceMatch(signature, students, maxScore = 22) {
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
  // إذا كان الهيكل يحتوي على طلاب فعليين، استخدمه
  if (preferStructure && structureStudents.length) return structureStudents;
  // إذا لم يكن الهيكل يحتوي على طلاب، استخدم المصدر القديم (school.students)
  if (baseStudents.length) return baseStudents;
  return [];
}


function applyPointsToUnifiedStudent(school, studentId, deltaPoints = 0, nextStatus = '', meta = {}) {
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

function sortUnifiedCompanyRows(rows = []) {
  return [...rows].sort((a, b) => String(a.className || a.name || '').localeCompare(String(b.className || b.name || ''), 'ar', { numeric: true, sensitivity: 'base' }) || String(a.name || '').localeCompare(String(b.name || ''), 'ar', { numeric: true, sensitivity: 'base' }));
}

function getUnifiedCompanyRows(school, { preferStructure = true } = {}) {
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

function normalizePhoneNumber(value) {
  let digits = String(value || '').trim().replace(/[^\d+]/g, '');
  if (!digits) return '';
  if (digits.startsWith('+')) digits = digits.slice(1);
  if (digits.startsWith('00')) digits = digits.slice(2);
  if (digits.startsWith('0')) digits = `966${digits.slice(1)}`;
  return digits;
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
  if (!value && value !== 0) return null;
  const text = `${formatEnglishDigits(value)}${suffix}`;
  const labelWidth = Math.max(80, 20 + text.length * 13);
  // وضع الرقم داخل الشريط من الطرف الأيمن (مسافة 8px من الحافة)
  const labelX = x + width - labelWidth - 8;
  // إذا كان الشريط ضيقاً جداً نضعه بعد الشريط
  const finalX = labelX < x ? x + width + 6 : labelX;
  const textColor = finalX < x ? '#0f172a' : '#ffffff';
  const bgFill = finalX < x ? '#f1f5f9' : '#0f172a';
  return (
    <g>
      <rect x={finalX} y={y - 4} rx="12" ry="12" width={labelWidth} height="36" fill={bgFill} opacity="0.92" />
      <text x={finalX + labelWidth / 2} y={y + 18} textAnchor="middle" fill={textColor} fontSize="20" fontWeight="900">
        {text}
      </text>
    </g>
  );
}

function MiniAttendanceRing({ value }) {
  const safeValue = Math.max(0, Math.min(100, Number(value) || 0));
  const radius = 88;
  const circumference = 2 * Math.PI * radius;
  const dashArray = circumference * safeValue / 100;
  const dashOffset = circumference * 0.25;
  return (
    <div className="relative flex items-center justify-center" style={{ width: 220, height: 220 }}>
      <svg width="220" height="220" viewBox="0 0 220 220" style={{ position: 'absolute', top: 0, left: 0 }}>
        <circle cx="110" cy="110" r={radius} fill="none" stroke="#dbeafe" strokeWidth="28" />
        <circle
          cx="110" cy="110" r={radius}
          fill="none"
          stroke="#0ea5e9"
          strokeWidth="28"
          strokeLinecap="round"
          strokeDasharray={`${dashArray} ${circumference - dashArray}`}
          strokeDashoffset={dashOffset}
          style={{ transition: 'stroke-dasharray 0.6s ease' }}
        />
      </svg>
      <div className="relative z-10 flex flex-col items-center justify-center text-center">
        <div className="text-6xl font-black text-sky-700 xl:text-7xl" style={{ lineHeight: 1 }}>{formatEnglishDigits(safeValue)}%</div>
        <div className="mt-2 text-xl text-slate-500">تحديث مباشر</div>
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
  const shortName = String(schoolName || "مدرستي").replace(/\s+/g, " ").trim();
  return <span className={cx("inline-flex items-center justify-center rounded-full border border-white/35 bg-white/15 px-3 py-1 text-sm font-black text-white shadow-sm backdrop-blur", className)}>{shortName}</span>;
}






// ===== مكون نافذة النسخ الاحتياطية التلقائية =====










// ===== دليل التعليمات المخصص لكل دور =====
const HELP_GUIDES = {
  superadmin: {
    title: 'دليل الأدمن العام',
    color: 'violet',
    sections: [
      {
        title: 'إضافة مدرسة جديدة',
        steps: [
          'انتقل إلى صفحة "المدارس" من الشريط الجانبي.',
          'اضغط "إضافة مدرسة جديدة" وأدخل اسم المدرسة والمدينة.',
          'أدخل بيانات مدير المدرسة (اسم المستخدم وكلمة المرور).',
          'اضغط "حفظ" — سيُنشأ حساب المدير تلقائياً.',
        ],
      },
      {
        title: 'إضافة مستخدم جديد',
        steps: [
          'انتقل إلى "المستخدمون والصلاحيات".',
          'اضغط "إضافة مستخدم" واختر الدور (أدمن عام، مدير، مشرف، معلم، بوابة).',
          'أدخل اسم المستخدم وكلمة المرور والمدرسة المرتبطة.',
          'اضغط "حفظ" لإنشاء الحساب.',
        ],
      },
      {
        title: 'إعداد طريقة الدخول (OTP / كلمة مرور)',
        steps: [
          'اضغط "الدخول والمصادقة" من الشريط العلوي.',
          'فعّل أو عطّل تسجيل الدخول بكلمة المرور أو OTP.',
          'اختر قناة التوصيل: بريد إلكتروني، SMS، أو واتساب.',
          'احفظ الإعدادات.',
        ],
      },
      {
        title: 'منح صلاحيات لمدير مدرسة',
        steps: [
          'انتقل إلى "المستخدمون والصلاحيات" ثم اختر المدرسة.',
          'في قسم "صلاحيات المدرسة" فعّل الصلاحيات المطلوبة.',
          'اضغط "حفظ صلاحيات المدرسة".',
        ],
      },
    ],
  },
  principal: {
    title: 'دليل مدير المدرسة',
    color: 'sky',
    sections: [
      {
        title: 'إضافة الفصول والشركات',
        steps: [
          'انتقل إلى "الهيكل المدرسي" من الشريط الجانبي.',
          'اضغط "إضافة فصل" وأدخل اسم الفصل ثم اضغط "حفظ".',
          'اضغط على اسم الفصل لفتحه ثم اضغط "إضافة شركة" لإضافة مجموعة بداخل الفصل.',
          'يمكن إضافة عدة شركات لكل فصل.',
        ],
      },
      {
        title: 'استيراد الطلاب من Excel',
        steps: [
          'انتقل إلى "الهيكل المدرسي" من الشريط الجانبي.',
          'اضغط "استيراد من Excel" وحمّل ملف الطلاب.',
          'تأكد أن الأعمدة تحتوي: الاسم، رقم الهوية، الفصل.',
          'راجع البيانات واضغط "تأكيد الاستيراد".',
        ],
      },
      {
        title: 'نقل طالب بين الفصول',
        steps: [
          'انتقل إلى "الهيكل المدرسي" وافتح صفحة الفصل المطلوب.',
          'ابحث عن الطالب ثم اضغط على اسمه لفتح بياناته.',
          'اضغط "تعديل" ثم غيّر الفصل من القائمة المنسدلة.',
          'اضغط "حفظ" لتأكيد النقل.',
        ],
      },
      {
        title: 'تسجيل بصمة الوجه للطالب',
        steps: [
          'انتقل إلى "البصمة والمعرفات" من الشريط الجانبي.',
          'ابحث عن الطالب ثم اضغط على اسمه.',
          'اضغط "تسجيل بصمة الوجه" ثم افتح الكاميرا.',
          'وجّه وجه الطالب بوضوح أمام الكاميرا واضغط "التقاط" — ستُحفظ البصمة تلقائياً.',
        ],
      },
      {
        title: 'إضافة معلم أو مشرف',
        steps: [
          'انتقل إلى "المستخدمون والصلاحيات" من الشريط الجانبي.',
          'اضغط "إضافة مستخدم" واختر الدور (معلم أو مشرف).',
          'أدخل الاسم واسم المستخدم وكلمة المرور.',
          'اضغط "حفظ".',
        ],
      },
      {
        title: 'إنشاء بوابة حضور',
        steps: [
          'انتقل إلى "الشاشات والبوابات" من الشريط الجانبي.',
          'في قسم "بوابات الحضور" اضغط "إضافة بوابة" وأدخل اسمها.',
          'اختر وضع الكاميرا: QR فقط / وجه فقط / كلاهما.',
          'انسخ الرابط وافتحه على الجهاز المخصص للبوابة.',
          'لتغيير وضع بوابة موجودة: اضغط "تغيير الوضع" بجانب اسمها.',
        ],
      },
      {
        title: 'عرض شاشة النقاط',
        steps: [
          'انتقل إلى "الشاشات والبوابات" من الشريط الجانبي.',
          'في قسم "شاشات العرض" اضغط "إضافة شاشة" واختر نوع العرض.',
          'انسخ الرابط وافتحه على شاشة العرض أو التلفاز.',
          'تعرض الشاشة النقاط والترتيب والتنبيهات تلقائياً.',
        ],
      },
      {
        title: 'إعداد بنود المكافآت والخصومات',
        steps: [
          'انتقل إلى "الإعدادات" من الشريط العلوي.',
          'في قسم "بنود المكافآت" أضف بنداً جديداً بالاسم والنقاط.',
          'في قسم "بنود الخصومات" أضف بنداً بالاسم والنقاط المخصومة.',
          'تظهر هذه البنود للمعلمين عند منح المكافآت أو الخصومات.',
        ],
      },
      {
        title: 'الرسائل والتنبيهات',
        steps: [
          'انتقل إلى "التنبيهات" من الشريط العلوي.',
          'تظهر جميع التنبيهات التلقائية (حضور، مكافآت، خصومات، برامج).',
          'يمكن فلترة التنبيهات حسب النوع أو التاريخ.',
          'اضغط على أي تنبيه لعرض تفاصيله.',
        ],
      },
    ],
  },
  supervisor: {
    title: 'دليل المشرف',
    color: 'emerald',
    sections: [
      {
        title: 'متابعة الحضور اليومي',
        steps: [
          'انتقل إلى "الحضور" من الشريط الجانبي.',
          'اختر التاريخ والفصل لعرض قائمة الحضور.',
          'يمكنك تعديل حالة أي طالب يدوياً بالضغط عليها.',
          'احفظ التعديلات إن وجدت.',
        ],
      },
      {
        title: 'تسجيل حضور يدوي',
        steps: [
          'انتقل إلى "الحضور" واضغط "تسجيل يدوي".',
          'ابحث عن الطالب بالاسم أو رقم الهوية.',
          'اختر الحالة (حاضر، متأخر، غائب) واضغط "تسجيل".',
        ],
      },
      {
        title: 'منح مكافأة أو خصم',
        steps: [
          'انتقل إلى "إجراءات المعلم".',
          'حدد الطالب بالباركود أو الوجه أو البحث اليدوي.',
          'اختر نوع الإجراء (مكافأة أو خصم) ثم اضغط على البند.',
          'سيُنفَّذ الإجراء فوراً وتظهر لافتة التأكيد.',
        ],
      },
      {
        title: 'عرض التقارير',
        steps: [
          'انتقل إلى "التقارير" من الشريط الجانبي.',
          'اختر نوع التقرير: حضور، نقاط، سلوك.',
          'حدد الفترة والفصل لعرض البيانات.',
          'يمكن تصدير التقرير بصيغة Excel أو طباعته.',
        ],
      },
    ],
  },
  teacher: {
    title: 'دليل المعلم',
    color: 'amber',
    sections: [
      {
        title: 'تحديد الطالب',
        steps: [
          'افتح صفحة "إجراءات المعلم".',
          'اختر طريقة التعرف: باركود (QR)، وجه، أو يدوي.',
          'للباركود: وجّه الكاميرا على بطاقة الطالب أو شاشة الباركود.',
          'للوجه: وجّه الكاميرا على وجه الطالب مباشرة.',
          'لليدوي: ابحث باسم الطالب أو رقمه واضغط عليه.',
        ],
      },
      {
        title: 'منح مكافأة',
        steps: [
          'بعد تحديد الطالب، اضغط على تبويب "مكافأة".',
          'اضغط على البند المناسب (مثل: حضور مبكر، مبادرة...).',
          'سيتحول الزر للأخضر ويظهر "جارٍ التنفيذ..." ثم لافتة النجاح.',
          'لا تضغط مرتين — الزر يُعطَّل تلقائياً أثناء التنفيذ.',
        ],
      },
      {
        title: 'تسجيل خصم',
        steps: [
          'بعد تحديد الطالب، اضغط على تبويب "خصم".',
          'اختر البند المناسب واضغط عليه.',
          'سيُنفَّذ الخصم فوراً مع لافتة تأكيد.',
        ],
      },
      {
        title: 'الوضع الخاطف (سريع)',
        steps: [
          'اضغط "تفعيل الوضع الخاطف" في أعلى صفحة إجراءات المعلم.',
          'تظهر الأزرار مباشرة بدون تفاصيل إضافية للسرعة.',
          'مناسب للاستخدام في الفصل أو الطابور.',
        ],
      },
      {
        title: 'تنفيذ برنامج جماعي',
        steps: [
          'اضغط على تبويب "برنامج" في صفحة إجراءات المعلم.',
          'اختر البرنامج المطلوب وحدد البند والفئة المستهدفة.',
          'اضغط "تنفيذ" لتطبيق البرنامج على جميع الطلاب دفعة واحدة.',
        ],
      },
    ],
  },
};






function getLessonSessionTeacherTargets(session, schoolUsers) {
  if (!session || !Array.isArray(schoolUsers)) return [];
  const teachers = schoolUsers.filter((user) => user.role === 'teacher' && String(user.status || 'نشط') === 'نشط');
  if (Array.isArray(session.targetTeacherIds) && session.targetTeacherIds.length > 0) {
    const ids = session.targetTeacherIds.map((id) => String(id));
    return teachers.filter((user) => ids.includes(String(user.id)));
  }
  return teachers;
}



function TeacherPointsReport({ schoolActions, settings }) {
  const [filterActor, setFilterActor] = React.useState('');
  const [filterType, setFilterType] = React.useState('all');
  const [filterDate, setFilterDate] = React.useState('');
  const tpSettings = settings.teacherPoints || { perReward: 5, perViolation: 2, perProgram: 10 };

  // جمع قائمة المعلمين
  const actorNames = React.useMemo(() => {
    const names = new Set();
    schoolActions.forEach((item) => { if (item.actorName) names.add(item.actorName); });
    return Array.from(names).sort();
  }, [schoolActions]);

  // حساب نقاط كل معلم
  const teacherPointsData = React.useMemo(() => {
    const map = {};
    schoolActions.forEach((item) => {
      const key = item.actorName || 'غير محدد';
      if (!map[key]) map[key] = { actorName: key, actorRole: item.actorRole || 'teacher', rewards: 0, violations: 0, programs: 0, total: 0, points: 0, actions: [] };
      map[key].actions.push(item);
      if (item.actionType === 'reward') { map[key].rewards += 1; map[key].points += Number(tpSettings.perReward || 2); }
      else if (item.actionType === 'violation') { map[key].violations += 1; map[key].points += Number(tpSettings.perViolation || 1); }
      else if (item.actionType === 'program') { map[key].programs += 1; map[key].points += Number(tpSettings.perProgram || 3); }
      map[key].total += 1;
    });
    return Object.values(map).sort((a, b) => b.points - a.points);
  }, [schoolActions, tpSettings]);

  // تفاصيل الإجراءات بعد التصفية
  const filteredActions = React.useMemo(() => {
    return schoolActions.filter((item) => {
      if (filterActor && item.actorName !== filterActor) return false;
      if (filterType !== 'all' && item.actionType !== filterType) return false;
      if (filterDate && (item.isoDate || '').slice(0, 10) !== filterDate) return false;
      return true;
    }).slice(0, 200);
  }, [schoolActions, filterActor, filterType, filterDate]);

  const filteredPoints = filteredActions.reduce((sum, item) => {
    if (item.actionType === 'reward') return sum + Number(tpSettings.perReward || 2);
    if (item.actionType === 'violation') return sum + Number(tpSettings.perViolation || 1);
    if (item.actionType === 'program') return sum + Number(tpSettings.perProgram || 3);
    return sum;
  }, 0);

  return (
    <SectionCard title="نقاط المعلمين" icon={Trophy}>
      {/* ملخص نقاط كل معلم */}
      <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
        {teacherPointsData.map((teacher, index) => (
          <div key={teacher.actorName} className="rounded-3xl bg-slate-50 p-5 ring-1 ring-slate-200">
            <div className="flex items-center justify-between gap-3">
              <div>
                <div className="font-black text-slate-900">{index + 1}. {teacher.actorName}</div>
                <div className="mt-1 text-xs text-slate-500">{getRoleLabel(teacher.actorRole)}</div>
              </div>
              <div className="rounded-2xl bg-amber-100 px-3 py-2 text-center">
                <div className="text-xl font-black text-amber-700">{teacher.points}</div>
                <div className="text-[10px] text-amber-600">نقطة</div>
              </div>
            </div>
            <div className="mt-3 grid grid-cols-3 gap-2 text-center text-xs">
              <div className="rounded-xl bg-emerald-50 p-2"><div className="font-black text-emerald-700">{teacher.rewards}</div><div className="text-emerald-600">مكافآت</div></div>
              <div className="rounded-xl bg-rose-50 p-2"><div className="font-black text-rose-700">{teacher.violations}</div><div className="text-rose-600">خصومات</div></div>
              <div className="rounded-xl bg-sky-50 p-2"><div className="font-black text-sky-700">{teacher.programs}</div><div className="text-sky-600">برامج</div></div>
            </div>
          </div>
        ))}
        {teacherPointsData.length === 0 && <div className="rounded-3xl bg-slate-50 p-6 text-center text-sm text-slate-500 ring-1 ring-slate-200">لا توجد بيانات بعد.</div>}
      </div>

      {/* فلترة التفاصيل */}
      <div className="mb-4 rounded-3xl bg-slate-50 p-4 ring-1 ring-slate-200">
        <div className="mb-3 font-bold text-slate-800">تفاصيل الإجراءات</div>
        <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
          <div>
            <label className="mb-1 block text-xs font-bold text-slate-600">المعلم</label>
            <select value={filterActor} onChange={(e) => setFilterActor(e.target.value)} className="w-full rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm">
              <option value="">جميع المعلمين</option>
              {actorNames.map((name) => <option key={name} value={name}>{name}</option>)}
            </select>
          </div>
          <div>
            <label className="mb-1 block text-xs font-bold text-slate-600">نوع الإجراء</label>
            <select value={filterType} onChange={(e) => setFilterType(e.target.value)} className="w-full rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm">
              <option value="all">جميع الأنواع</option>
              <option value="reward">مكافآت</option>
              <option value="violation">خصومات</option>
              <option value="program">برامج</option>
            </select>
          </div>
          <div>
            <label className="mb-1 block text-xs font-bold text-slate-600">التاريخ</label>
            <input type="date" value={filterDate} onChange={(e) => setFilterDate(e.target.value)} className="w-full rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm" />
          </div>
        </div>
        {(filterActor || filterType !== 'all' || filterDate) && (
          <div className="mt-3 flex items-center gap-3">
            <span className="text-sm font-bold text-slate-700">مجموع النقاط: <span className="text-amber-700">{filteredPoints}</span></span>
            <span className="text-sm text-slate-500">({filteredActions.length} إجراء)</span>
            <button onClick={() => { setFilterActor(''); setFilterType('all'); setFilterDate(''); }} className="rounded-xl bg-slate-200 px-3 py-1 text-xs font-bold text-slate-700">إعادة تعيين</button>
          </div>
        )}
      </div>

      {/* جدول التفاصيل */}
      <div className="overflow-x-auto rounded-3xl ring-1 ring-slate-200">
        <table className="w-full text-sm">
          <thead className="bg-slate-100">
            <tr>
              <th className="px-4 py-3 text-right font-black text-slate-700">المعلم</th>
              <th className="px-4 py-3 text-right font-black text-slate-700">النوع</th>
              <th className="px-4 py-3 text-right font-black text-slate-700">البند</th>
              <th className="px-4 py-3 text-right font-black text-slate-700">الطالب / المستهدف</th>
              <th className="px-4 py-3 text-right font-black text-slate-700">التاريخ</th>
              <th className="px-4 py-3 text-right font-black text-slate-700">الوقت</th>
              <th className="px-4 py-3 text-center font-black text-slate-700">النقاط</th>
            </tr>
          </thead>
          <tbody>
            {filteredActions.length === 0 && (
              <tr><td colSpan={7} className="px-4 py-8 text-center text-slate-500">لا توجد بيانات مطابقة.</td></tr>
            )}
            {filteredActions.map((item) => {
              const pts = item.actionType === 'reward' ? Number(tpSettings.perReward || 2) : item.actionType === 'violation' ? Number(tpSettings.perViolation || 1) : Number(tpSettings.perProgram || 3);
              const typeLabel = item.actionType === 'reward' ? 'مكافأة' : item.actionType === 'violation' ? 'خصم' : 'برنامج';
              const typeTone = item.actionType === 'reward' ? 'text-emerald-700 bg-emerald-50' : item.actionType === 'violation' ? 'text-rose-700 bg-rose-50' : 'text-sky-700 bg-sky-50';
              return (
                <tr key={item.id} className="border-t border-slate-100 hover:bg-slate-50">
                  <td className="px-4 py-3 font-bold text-slate-800">{item.actorName || '—'}</td>
                  <td className="px-4 py-3"><span className={`rounded-xl px-2 py-1 text-xs font-black ${typeTone}`}>{typeLabel}</span></td>
                  <td className="px-4 py-3 text-slate-700">{item.actionTitle || '—'}</td>
                  <td className="px-4 py-3 text-slate-600">{item.student || item.targetLabel || '—'}</td>
                  <td className="px-4 py-3 text-slate-500">{item.date || item.isoDate || '—'}</td>
                  <td className="px-4 py-3 text-slate-500">{item.time || '—'}</td>
                  <td className="px-4 py-3 text-center font-black text-amber-700">+{pts}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </SectionCard>
  );
}


function SubjectBankEditor({ subjectBank = [], onChange }) {
  const [draft, setDraft] = useState('');
  const [editingIndex, setEditingIndex] = useState(null);
  const [editingValue, setEditingValue] = useState('');

  const addSubject = () => {
    const val = draft.trim();
    if (!val) return;
    if (subjectBank.includes(val)) { window.alert('هذه المادة موجودة بالفعل في البنك.'); return; }
    onChange([...subjectBank, val]);
    setDraft('');
  };

  const removeSubject = (index) => {
    onChange(subjectBank.filter((_, i) => i !== index));
  };

  const startEdit = (index) => {
    setEditingIndex(index);
    setEditingValue(subjectBank[index]);
  };

  const saveEdit = () => {
    const val = editingValue.trim();
    if (!val) return;
    const updated = [...subjectBank];
    updated[editingIndex] = val;
    onChange(updated);
    setEditingIndex(null);
    setEditingValue('');
  };

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
        <div className="rounded-3xl bg-sky-50 p-5 ring-1 ring-sky-100">
          <div className="text-sm font-bold text-sky-800">عدد المواد</div>
          <div className="mt-3 text-3xl font-black text-slate-900">{subjectBank.length}</div>
          <div className="mt-2 text-sm text-slate-600">مادة مسجلة في بنك المواد</div>
        </div>
        <div className="rounded-3xl bg-emerald-50 p-5 ring-1 ring-emerald-100">
          <div className="text-sm font-bold text-emerald-800">استخدام البنك</div>
          <div className="mt-3 text-2xl font-black text-slate-900">تلقائي</div>
          <div className="mt-2 text-sm text-slate-600">يظهر البنك عند إضافة أو تعديل حساب معلم</div>
        </div>
        <div className="rounded-3xl bg-violet-50 p-5 ring-1 ring-violet-100">
          <div className="text-sm font-bold text-violet-800">مرونة كاملة</div>
          <div className="mt-3 text-2xl font-black text-slate-900">إضافة / تعديل / حذف</div>
          <div className="mt-2 text-sm text-slate-600">يمكن تخصيص البنك بالكامل حسب احتياجات المدرسة</div>
        </div>
      </div>

      <div className="rounded-3xl bg-slate-50 p-5 ring-1 ring-slate-200">
        <div className="mb-4">
          <div className="font-black text-slate-900">إدارة بنك المواد الدراسية</div>
          <div className="mt-1 text-sm leading-7 text-slate-500">هذه المواد تظهر كأزرار سريعة عند إضافة أو تعديل حساب معلم، مما يسرّع عملية تحديد مواده بدلاً من كتابتها يدوياً.</div>
        </div>

        <div className="mb-4 flex gap-2">
          <Input
            label="اسم المادة الجديدة"
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addSubject(); } }}
            placeholder="مثال: التربية الإسلامية"
          />
          <button type="button" onClick={addSubject} className="mt-6 shrink-0 inline-flex items-center gap-2 rounded-2xl bg-sky-700 px-5 py-3 font-bold text-white">
            <Plus className="h-4 w-4" /> إضافة
          </button>
        </div>

        {subjectBank.length > 0 ? (
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {subjectBank.map((subject, index) => (
              <div key={index} className="flex items-center justify-between rounded-2xl bg-white px-4 py-3 ring-1 ring-slate-200">
                {editingIndex === index ? (
                  <div className="flex flex-1 items-center gap-2">
                    <input
                      type="text"
                      value={editingValue}
                      onChange={(e) => setEditingValue(e.target.value)}
                      onKeyDown={(e) => { if (e.key === 'Enter') saveEdit(); if (e.key === 'Escape') { setEditingIndex(null); setEditingValue(''); } }}
                      className="flex-1 rounded-xl border border-slate-300 px-3 py-1.5 text-sm font-bold outline-none focus:border-sky-400 focus:ring-2 focus:ring-sky-100"
                      autoFocus
                    />
                    <button type="button" onClick={saveEdit} className="rounded-xl bg-sky-700 px-3 py-1.5 text-xs font-bold text-white">حفظ</button>
                    <button type="button" onClick={() => { setEditingIndex(null); setEditingValue(''); }} className="rounded-xl bg-slate-100 px-3 py-1.5 text-xs font-bold text-slate-700">إلغاء</button>
                  </div>
                ) : (
                  <>
                    <span className="font-bold text-slate-800">{subject}</span>
                    <div className="flex items-center gap-1">
                      <button type="button" onClick={() => startEdit(index)} className="rounded-xl bg-slate-100 px-3 py-1.5 text-xs font-bold text-slate-600 hover:bg-slate-200">تعديل</button>
                      <button type="button" onClick={() => removeSubject(index)} className="rounded-xl bg-rose-50 px-3 py-1.5 text-xs font-bold text-rose-600 hover:bg-rose-100">حذف</button>
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="rounded-3xl border border-dashed border-slate-300 p-6 text-center text-sm text-slate-500">بنك المواد فارغ. أضف مواد لتظهر عند إضافة المعلمين.</div>
        )}
      </div>
    </div>
  );
}

const WEEK_DAYS = [
  { key: 'sunday', label: 'الأحد' },
  { key: 'monday', label: 'الاثنين' },
  { key: 'tuesday', label: 'الثلاثاء' },
  { key: 'wednesday', label: 'الأربعاء' },
  { key: 'thursday', label: 'الخميس' },
];

function getArabicDayKey(date = new Date()) {
  const dayIndex = date.getDay(); // 0=Sunday
  const map = [0, 1, 2, 3, 4, 5, 6];
  const keys = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
  return keys[dayIndex] || 'sunday';
}

function getCurrentSlotFromTimetable(timetable = [], date = new Date()) {
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


function ActionCatalogEditor({ title, description, mode, items, onChange, suggestions = [] }) {
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

  const addSuggestion = (suggestion) => {
    const suggestionTitle = String(suggestion?.title || '').trim();
    if (!suggestionTitle) return;
    const exists = items.some((item) => String(item.title || '').trim() === suggestionTitle);
    if (exists) return;
    onChange([
      ...items,
      {
        id: `${mode}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        title: suggestionTitle,
        points: normalizePoints(suggestion.points ?? defaultPoints),
        description: String(suggestion.description || '').trim(),
      },
    ]);
  };

  return (
    <div className="rounded-3xl bg-slate-50 p-5 ring-1 ring-slate-200">
      <div className="font-bold text-slate-800">{title}</div>
      <div className="mt-2 text-sm leading-7 text-slate-600">{description}</div>
      {suggestions.length ? (
        <div className="mt-4 rounded-2xl bg-white p-4 ring-1 ring-slate-200">
          <div className="flex items-center justify-between gap-3">
            <div>
              <div className="font-black text-slate-800">بنك مقترح جاهز</div>
              <div className="mt-1 text-sm leading-7 text-slate-500">اختر من القيم والسلوكيات أو البرامج المقترحة لإضافتها بسرعة دون الكتابة من الصفر.</div>
            </div>
            <Badge tone={tone}>{suggestions.length} مقترح</Badge>
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            {suggestions.map((suggestion, idx) => {
              const exists = items.some((item) => String(item.title || '').trim() === String(suggestion.title || '').trim());
              return (
                <button key={`${mode}-suggestion-${idx}`} type="button" disabled={exists} onClick={() => addSuggestion(suggestion)} className={`rounded-2xl px-3 py-2 text-xs font-bold transition ${exists ? 'cursor-not-allowed bg-slate-100 text-slate-400' : tone === 'green' ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100' : tone === 'rose' ? 'bg-rose-50 text-rose-700 hover:bg-rose-100' : 'bg-sky-50 text-sky-700 hover:bg-sky-100'}`}>
                  {suggestion.title}
                </button>
              );
            })}
          </div>
        </div>
      ) : null}
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

const REWARD_SUGGESTIONS_BANK = [
  { title: 'الانضباط والالتزام', points: 5, description: 'يستحق الطالب مكافأة على الانضباط والالتزام بالتعليمات.' },
  { title: 'حسن التعامل والاحترام', points: 5, description: 'مكافأة على الأدب واحترام الآخرين داخل المدرسة.' },
  { title: 'المبادرة والمساعدة', points: 6, description: 'مكافأة على المبادرة الإيجابية ومساعدة الزملاء.' },
  { title: 'المشاركة الصفية', points: 4, description: 'مكافأة على المشاركة الإيجابية داخل الحصة.' },
  { title: 'المحافظة على الممتلكات', points: 4, description: 'مكافأة على المحافظة على مرافق المدرسة وممتلكاتها.' },
  { title: 'التحسن الملحوظ', points: 6, description: 'مكافأة على وجود تحسن واضح في السلوك أو الأداء.' },
  { title: 'الالتزام بالزي', points: 4, description: 'مكافأة على الالتزام بالزي والنظام العام.' },
  { title: 'التعاون وروح الفريق', points: 5, description: 'مكافأة على التعاون الإيجابي والعمل بروح الفريق.' },
];

const VIOLATION_SUGGESTIONS_BANK = [
  { title: 'التأخر عن الحصة', points: 3, description: 'خصم عند التأخر عن الحصة أو عدم الالتزام بالوقت.' },
  { title: 'إزعاج داخل الفصل', points: 3, description: 'خصم عند الإزعاج أو تعطيل سير الحصة.' },
  { title: 'عدم إحضار الأدوات', points: 2, description: 'خصم عند تكرار عدم إحضار الأدوات أو الدفتر.' },
  { title: 'ضعف الانضباط', points: 4, description: 'خصم عند ضعف الانضباط وعدم الالتزام بالتوجيهات.' },
  { title: 'العبث بالممتلكات', points: 5, description: 'خصم عند العبث بمرافق المدرسة أو ممتلكاتها.' },
  { title: 'عدم احترام الزملاء', points: 4, description: 'خصم عند وجود سلوك غير مناسب تجاه الزملاء.' },
  { title: 'عدم احترام المعلم', points: 5, description: 'خصم عند تجاوز حدود الاحترام مع المعلم.' },
  { title: 'تكرار المخالفة', points: 5, description: 'خصم إضافي عند تكرار نفس المخالفة.' },
];

const PROGRAM_SUGGESTIONS_BANK = [
  { title: 'برنامج متابعة الانضباط', points: 10, description: 'برنامج علاجي أو تحفيزي لمتابعة الانضباط.' },
  { title: 'برنامج تحسين السلوك', points: 10, description: 'برنامج مقترح لتحسين السلوك ومتابعته.' },
  { title: 'برنامج تعزيز الحضور', points: 8, description: 'برنامج يهدف إلى رفع الالتزام بالحضور.' },
  { title: 'برنامج دعم التحصيل', points: 8, description: 'برنامج لمساندة الطالب أكاديميًا.' },
  { title: 'برنامج علاج التأخر', points: 8, description: 'برنامج للحد من التأخر المتكرر.' },
  { title: 'برنامج الشراكة الأسرية', points: 10, description: 'برنامج مقترح لتعزيز متابعة الأسرة.' },
  { title: 'برنامج الإرشاد الطلابي', points: 9, description: 'برنامج إرشادي لمعالجة حالة محددة.' },
  { title: 'برنامج الطالب المتميز', points: 12, description: 'برنامج تحفيزي للطلاب ذوي الأداء المتميز.' },
];

// ===== مكوّن سقف نقاط المعلم اليومي =====
// =====================================================




// ===== مكون لوحة نافس التحليلية للمعلم والمدير =====
// ===== مكون نافس للطالب الفردي (يظهر في شاشة المعلم والمدير) =====

// ===== صفحة إدارة بنك أسئلة نافس (للأدمن العام فقط) =====

// ===== نهاية صفحة إدارة بنك أسئلة نافس =====

// ===== نهاية مكون نافس للطالب الفردي =====






// ============================================================
// صفحة اختيار بوابة الحضور الذكي لمسؤول الأمن
// ============================================================

// ============================================================
// صفحة مسؤول الأمن (بوابة الحضور)
// ============================================================


export default function App() {
  const initial = useMemo(() => loadPersistedState(), []);
  const publicMode = useMemo(() => getPublicModeFromLocation(), []);
  const lessonSessionIdFromUrl = useMemo(() => getLessonSessionIdFromLocation(), []);
  const leavePassIdFromUrl = useMemo(() => getLeavePassIdFromLocation(), []);
  const [schools, setSchools] = useState(initial.schools);
  const [users, setUsers] = useState(initial.users);
  const [currentUserId, setCurrentUserId] = useState(initial.currentUserId);
  const [activePage, setActivePage] = useState(initial.activePage);
  const [selectedSchoolId, setSelectedSchoolId] = useState(initial.selectedSchoolId);
  const [attendanceMethod, setAttendanceMethod] = useState(initial.attendanceMethod);
  const [scanLog, setScanLog] = useState(initial.scanLog);
  const [actionLog, setActionLog] = useState(initial.actionLog || []);
  const [gateSyncEvents, setGateSyncEvents] = useState(hydrateGateSyncCenterEvents(initial.gateSyncEvents || []));
  const [settings, setSettings] = useState(initial.settings);
  const [notifications, setNotifications] = useState(initial.notifications);
  const [editingUserId, setEditingUserId] = useState(null);
  const [booting, setBooting] = useState(true);
  const [syncStatus, setSyncStatus] = useState(getSessionToken() ? "connecting" : "idle");
  const [executiveReport, setExecutiveReport] = useState(null);
  const [accountSecurityOpen, setAccountSecurityOpen] = useState(false);
  const [helpGuideOpen, setHelpGuideOpen] = useState(false);
  const [accountSecurityLoading, setAccountSecurityLoading] = useState(false);
  const [resetUserPasswordOpen, setResetUserPasswordOpen] = useState(false);
  const [resetUserPasswordLoading, setResetUserPasswordLoading] = useState(false);
  const [resetPasswordTargetUserId, setResetPasswordTargetUserId] = useState(null);
  const [headerAlertsOpen, setHeaderAlertsOpen] = useState(false);
  const [headerAlertsState, setHeaderAlertsState] = useState({
    loading: false,
    loaded: false,
    error: '',
    count: 0,
    pending: 0,
    autoApproved: 0,
    failed: 0,
    items: [],
  });
  const [parentPortalDashboard, setParentPortalDashboard] = useState({
    loading: false,
    loaded: false,
    error: '',
    enabled: true,
    mode: 'auto',
    pending: 0,
    approvedToday: 0,
    activeParents: 0,
    lastAlert: null,
  });
  const [parentPortalConfig, setParentPortalConfig] = useState({
    loaded: false,
    loading: false,
    saving: false,
    mode: 'auto',
    enabled: true,
    alerts: [],
    totalRequests: 0,
    pendingRequests: 0,
    error: '',
  });
  const bootstrappedRef = useRef(false);
  const saveTimerRef = useRef(null);

  const sharedState = useMemo(() => ({
    version: BACKUP_VERSION,
    schools,
    users,
    scanLog,
    actionLog,
    gateSyncEvents,
    settings,
    notifications,
  }), [schools, users, scanLog, actionLog, gateSyncEvents, settings, notifications]);

  const applyServerStatePayload = useCallback((serverState, uiState = loadUiState()) => {
    const next = buildHydratedClientState(serverState || {}, uiState);
    // ===== إصلاح اختفاء المدارس: دمج المدارس الواردة مع الموجودة =====
    setSchools(function(prev) { return mergeSchoolsFromResponse(prev, next.schools); });
    setUsers(next.users);
    setScanLog(next.scanLog);
    setActionLog(next.actionLog || []);
    setGateSyncEvents(hydrateGateSyncCenterEvents(next.gateSyncEvents || []));
    setSettings(next.settings);
    setNotifications(next.notifications);
    saveServerCache(serverState || {});
    return next;
  }, []);

  const currentUser = useMemo(() => applySchoolAccessToUser(users.find((user) => user.id === currentUserId) || null, schools), [users, currentUserId, schools]);
  const currentRoleObject = roles.find((role) => role.key === currentUser?.role) || roles[0];
  const RoleIcon = currentRoleObject.icon;
  const canUseHeaderAlerts = ['superadmin', 'principal', 'supervisor', 'teacher'].includes(String(currentUser?.role || ''));
  const canManageParentPortalApp = ['superadmin', 'principal'].includes(String(currentUser?.role || ''));
  const canViewParentPortal = canManageParentPortalApp || String(currentUser?.role || '') === 'supervisor';

  const selectedSchool = useMemo(() => {
    if (currentUser?.role && currentUser.role !== "superadmin") {
      return schools.find((school) => school.id === currentUser.schoolId) || schools[0];
    }
    return schools.find((school) => school.id === selectedSchoolId) || schools[0];
  }, [schools, selectedSchoolId, currentUser]);

  // ===== نظام التنبيهات الصوتية التلقائية =====
  const soundAlertsRef = useRef({});
  const playAlertBeep = useCallback((level = 1) => {
    try {
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      // level 1 = تنبيه خفيف (5 دقائق), 2 = متوسط (10 دقائق), 3 = قوي (15 دقائق), 4 = حرج (20 دقائق)
      const freqs = [660, 880, 1100, 1320];
      const freq = freqs[Math.min(level - 1, 3)];
      const beepCount = Math.min(level, 4);
      for (let i = 0; i < beepCount; i++) {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.frequency.value = freq;
        osc.type = level >= 3 ? 'square' : 'sine';
        const startTime = ctx.currentTime + i * 0.35;
        gain.gain.setValueAtTime(0.4, startTime);
        gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.25);
        osc.start(startTime);
        osc.stop(startTime + 0.25);
      }
    } catch { /* ignore */ }
  }, []);

  // مراقبة الاستئذانات المفتوحة وإطلاق تنبيه صوتي عند 5، 10، 15، 20 دقيقة
  useEffect(() => {
    if (!currentUser || !selectedSchool) return;
    const isTeacher = currentUser.role === 'teacher';
    const isManager = ['principal', 'supervisor', 'superadmin'].includes(currentUser.role);
    const isGate = currentUser.role === 'gate';
    if (!isTeacher && !isManager && !isGate) return;
    const interval = setInterval(() => {
      const now = Date.now();
      // --- تنبيهات الاستئذان ---
      const leavePasses = getLeavePasses(selectedSchool);
      const openPasses = leavePasses.filter((lp) => {
        if (['completed', 'cancelled', 'draft'].includes(lp.status)) return false;
        if (isTeacher) {
          // المعلم يسمع الصوت فقط للطلبات الجديدة التي لم يتصرف بها بعد
          if (String(lp.teacherUserId || lp.teacherId || '') !== String(currentUser.id)) return false;
          return ['created', 'sent-system', 'sent-manual'].includes(String(lp.status || ''));
        }
        // المدير يرى الكل ما عدا المغلقة
        return true;
      });
      openPasses.forEach((lp) => {
        const createdAt = lp.createdAt ? new Date(lp.createdAt).getTime() : null;
        if (!createdAt) return;
        const elapsedMin = (now - createdAt) / 60000;
        const key = `lp-${lp.id}`;
        const alerted = soundAlertsRef.current[key] || 0;

        // === تنبيه مسؤول الأمن: فوري عند أي استئذان جديد (لم يُنبَّه بعد) ===
        if (isGate) {
          // استئذان معتمد (approved) ولم يُنبَّه بعد = تنبيه فوري
          const isApproved = ['approved-agent', 'approved-counselor', 'released-guardian', 'viewed', 'released-teacher'].includes(lp.status);
          if (isApproved && alerted === 0) {
            playAlertBeep(2);
            soundAlertsRef.current[key] = 1;
            setNotifications((prev) => [
              { id: Date.now(), title: '🚨 استئذان جديد عند البوابة', body: `الطالب ${lp.studentName || ''} من ${lp.className || lp.companyName || 'فصله'} — ${lp.destination === 'guardian' ? 'خروج مع ولي الأمر' : lp.destination === 'agent' ? 'وكيل المدرسة' : 'مرشد'} — يحتاج تأكيد خروج.`, time: new Intl.DateTimeFormat('ar-SA', { hour: '2-digit', minute: '2-digit' }).format(new Date()), forTeacherIds: [] },
              ...prev,
            ].slice(0, 30));
            return;
          }
          // تنبيه كل 5 دقائق إذا لم يُؤكَّد الخروج بعد الاعتماد
          if (isApproved && alerted >= 1) {
            const gateLevel = Math.min(Math.floor(elapsedMin / 5), 4);
            if (gateLevel > 0 && gateLevel > alerted - 1) {
              playAlertBeep(Math.min(gateLevel + 1, 4));
              soundAlertsRef.current[key] = gateLevel + 1;
              setNotifications((prev) => [
                { id: Date.now(), title: `⚠️ لم يُؤكَّد خروج الطالب (${Math.floor(elapsedMin)} د)`, body: `الطالب ${lp.studentName || ''} استئذانه معتمد منذ ${Math.floor(elapsedMin)} دقيقة ولم يُؤكَّد خروجه من البوابة.`, time: new Intl.DateTimeFormat('ar-SA', { hour: '2-digit', minute: '2-digit' }).format(new Date()), forTeacherIds: [] },
                ...prev,
              ].slice(0, 30));
            }
          }
          return;
        }

        // === تنبيهات المعلم والمدير: عند 5، 10، 15، 20 دقيقة ===
        let level = 0;
        if (elapsedMin >= 20 && alerted < 4) level = 4;
        else if (elapsedMin >= 15 && alerted < 3) level = 3;
        else if (elapsedMin >= 10 && alerted < 2) level = 2;
        else if (elapsedMin >= 5 && alerted < 1) level = 1;
        if (level > 0) {
          playAlertBeep(level);
          soundAlertsRef.current[key] = level;
          setNotifications((prev) => [
            { id: Date.now(), title: level >= 4 ? '⚠️ استئذان لم يُغلق (20 دقيقة)' : level === 3 ? '🔔 استئذان مفتوح (15 دقيقة)' : level === 2 ? '🔔 استئذان مفتوح (10 دقائق)' : '🔔 استئذان مفتوح (5 دقائق)', body: `الطالب ${lp.studentName || ''} لم يُغلق استئذانه منذ ${Math.floor(elapsedMin)} دقيقة.`, time: new Intl.DateTimeFormat('ar-SA', { hour: '2-digit', minute: '2-digit' }).format(new Date()), forTeacherIds: isTeacher ? [currentUser.id] : [] },
            ...prev,
          ].slice(0, 30));
        }
      });
      // تنظيف مفاتيح الاستئذانات المغلقة
      Object.keys(soundAlertsRef.current).forEach((key) => {
        if (key.startsWith('lp-')) {
          const lpId = key.replace('lp-', '');
          const lp = leavePasses.find((item) => String(item.id) === lpId);
          if (!lp || ['completed', 'cancelled'].includes(lp.status)) {
            delete soundAlertsRef.current[key];
          }
        }
      });
      // --- تنبيهات تحضير الحصص (للمعلم والمدير والوكيل) ---
      {
        const lessonSessions = getLessonAttendanceSessions(selectedSchool);
        if (isTeacher) {
          // المعلم: تنبيه كل 5 دقائق إذا لم يُغلق التحضير المطلوب منه
          const openSessions = lessonSessions.filter((session) => {
            if (session.status === 'closed') return false;
            const targets = session.targetTeacherIds || [];
            if (targets.length && !targets.map(String).includes(String(currentUser.id))) return false;
            const alreadySubmitted = (session.submissions || []).some((sub) => String(sub.teacherId) === String(currentUser.id));
            return !alreadySubmitted;
          });
          openSessions.forEach((session) => {
            const sentAt = (session.teacherInvites || []).find((inv) => String(inv.teacherId) === String(currentUser.id))?.sentAt;
            if (!sentAt) return;
            const elapsedMin = (now - new Date(sentAt).getTime()) / 60000;
            const key = `ls-${session.id}`;
            const alerted = soundAlertsRef.current[key] || 0;
            // كل 5 دقائق يأتي تنبيه (حتى 4 مرات)
            const level = Math.min(Math.floor(elapsedMin / 5), 4);
            if (level > 0 && level > alerted) {
              playAlertBeep(Math.min(level, 4));
              soundAlertsRef.current[key] = level;
              setNotifications((prev) => [
                { id: Date.now(), title: '📋 لم تُغلق تحضير الحصة', body: `مضى ${Math.floor(elapsedMin)} دقيقة على طلب تحضير ${buildLessonAttendanceSessionLabel(session)} ولم تعتمده بعد.`, time: new Intl.DateTimeFormat('ar-SA', { hour: '2-digit', minute: '2-digit' }).format(new Date()), forTeacherIds: [currentUser.id] },
                ...prev,
              ].slice(0, 30));
            }
          });
        }
        if (isManager) {
          // المدير/الوكيل/السوبرأدمين: تنبيه إذا مضى 5 دقائق على جلسة تحضير مفتوحة ولم يُغلقها المعلم
          const pendingSessions = lessonSessions.filter((session) => {
            if (session.status === 'closed') return false;
            // الجلسة مفتوحة وفيها معلمون لم يُقدِّموا التحضير بعد
            const targets = Array.isArray(session.targetTeacherIds) && session.targetTeacherIds.length
              ? session.targetTeacherIds
              : (session.teacherInvites || []).map((inv) => inv.teacherId);
            if (!targets.length) return false;
            const submittedIds = (session.submissions || []).map((sub) => String(sub.teacherId));
            const pendingTeachers = targets.filter((tid) => !submittedIds.includes(String(tid)));
            return pendingTeachers.length > 0;
          });
          pendingSessions.forEach((session) => {
            const createdAt = session.createdAt ? new Date(session.createdAt).getTime() : null;
            if (!createdAt) return;
            const elapsedMin = (now - createdAt) / 60000;
            const key = `ls-mgr-${session.id}`;
            const alerted = soundAlertsRef.current[key] || 0;
            // تنبيه المدير كل 5 دقائق (حتى 4 مرات)
            const level = Math.min(Math.floor(elapsedMin / 5), 4);
            if (level > 0 && level > alerted) {
              playAlertBeep(Math.min(level, 3));
              soundAlertsRef.current[key] = level;
              // حساب عدد المعلمين المتأخرين
              const targets2 = Array.isArray(session.targetTeacherIds) && session.targetTeacherIds.length
                ? session.targetTeacherIds
                : (session.teacherInvites || []).map((inv) => inv.teacherId);
              const submittedIds2 = (session.submissions || []).map((sub) => String(sub.teacherId));
              const pendingCount = targets2.filter((tid) => !submittedIds2.includes(String(tid))).length;
              setNotifications((prev) => [
                { id: Date.now(), title: `📋 تحضير لم يُغلق (${Math.floor(elapsedMin)} د)`, body: `جلسة ${buildLessonAttendanceSessionLabel(session)}: ${pendingCount} معلم لم يُغلق التحضير بعد.`, time: new Intl.DateTimeFormat('ar-SA', { hour: '2-digit', minute: '2-digit' }).format(new Date()), forTeacherIds: [] },
                ...prev,
              ].slice(0, 30));
            }
          });
          // تنظيف مفاتيح جلسات المدير المغلقة
          Object.keys(soundAlertsRef.current).forEach((key) => {
            if (key.startsWith('ls-mgr-')) {
              const sessionId = key.replace('ls-mgr-', '');
              const session = lessonSessions.find((s) => String(s.id) === sessionId);
              if (!session || session.status === 'closed') {
                delete soundAlertsRef.current[key];
              }
            }
          });
        }
      }
    }, 30000); // فحص كل 30 ثانية
    return () => clearInterval(interval);
  }, [currentUser, selectedSchool, playAlertBeep]);
  // ===== نهاية نظام التنبيهات الصوتية =====

  const allowedNav = useMemo(() => navItems.filter((item) => {
    if (item.key === "schoolStructure") return currentUser?.role === "principal" || currentUser?.role === "superadmin";
    // استثناء الأدوار المحددة في excludeRoles
    if (Array.isArray(item.excludeRoles) && item.excludeRoles.length) {
      if (item.excludeRoles.includes(currentUser?.role)) return false;
    }
    if (Array.isArray(item.roles) && item.roles.length) {
      if (!item.roles.includes(currentUser?.role)) return false;
      // إذا كان الدور ضمن roles المحددة، يُسمح بالوصول مباشرة
      return true;
    }
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

  const lessonSessionNavigatedRef = React.useRef(false);
  useEffect(() => {
    if (!currentUser || !lessonSessionIdFromUrl) return;
    if (!["teacher", "principal", "supervisor", "superadmin"].includes(String(currentUser.role || ""))) return;
    if (!lessonSessionNavigatedRef.current) {
      lessonSessionNavigatedRef.current = true;
      setActivePage("lessonAttendanceSessions");
      try {
        const url = new URL(window.location.href);
        url.searchParams.delete("lessonSession");
        window.history.replaceState({}, "", url.toString());
      } catch (e) {}
    }
  }, [currentUser, lessonSessionIdFromUrl]);

  useEffect(() => {
    if (!currentUser || !leavePassIdFromUrl) return;
    const role = String(currentUser.role || "");
    if (!["teacher", "principal", "supervisor", "superadmin", "agent", "counselor"].includes(role)) return;
    const targetPage = role === "agent" ? "leavePassAgentDesk" : role === "counselor" ? "leavePassCounselorDesk" : "leavePasses";
    if (activePage !== targetPage) {
      setActivePage(targetPage);
    }
  }, [currentUser, leavePassIdFromUrl, activePage]);

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
        setSchools(function(prev) { return mergeSchoolsFromResponse(prev, next.schools); });
        setUsers(next.users);
        setScanLog(next.scanLog);
        setActionLog(next.actionLog || []);
        setGateSyncEvents(hydrateGateSyncCenterEvents(next.gateSyncEvents || []));
        setSettings(next.settings);
        setNotifications(next.notifications);
        saveServerCache(response.state || {});
        const sessionUser = response.sessionUser ? next.users.find((item) => item.id === response.sessionUser.id) : null;
        if (!sessionUser) setSessionToken("");
        setCurrentUserId(sessionUser?.id || null);
        setSelectedSchoolId(sessionUser?.role && sessionUser.role !== "superadmin" ? sessionUser.schoolId : (uiState.selectedSchoolId || next.selectedSchoolId));
        const savedPage = uiState.activePage || "";
        const hasLessonUrl = getLessonSessionIdFromLocation();
        const resolvedPage = (savedPage === "lessonAttendanceSessions" && !hasLessonUrl)
          ? getDefaultLandingPage(sessionUser)
          : (savedPage || getDefaultLandingPage(sessionUser));
        setActivePage(sessionUser ? resolvedPage : "dashboard");
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
    let cancelled = false;
    if (!currentUser || !['superadmin', 'principal', 'supervisor', 'teacher'].includes(String(currentUser.role || '')) || !selectedSchool?.id) {
      setHeaderAlertsState({ loading: false, loaded: false, error: '', count: 0, pending: 0, autoApproved: 0, failed: 0, items: [] });
      return () => { cancelled = true; };
    }
    const loadHeaderAlerts = async () => {
      setHeaderAlertsState((current) => ({ ...current, loading: true, error: '' }));
      try {
        const query = currentUser?.role === 'superadmin' ? `?schoolId=${selectedSchool.id}` : '';
        const response = await apiRequest(`/api/admin/parent-primary-requests${query}`, { token: getSessionToken() });
        if (cancelled) return;
        const requests = Array.isArray(response?.requests) ? response.requests : [];
        const apiAlerts = Array.isArray(response?.alerts) ? response.alerts : [];
        const pending = requests.filter((request) => String(request?.status || '') === 'pending').length;
        const autoApproved = apiAlerts.filter((alert) => /اعتماد تلقائي|تلقائيًا|تلقائي/.test(String(alert?.title || '') + ' ' + String(alert?.body || ''))).length;

        // ✅ إصلاح: تعريف isCurrentTeacher مبكراً قبل أي استخدام
        const isCurrentTeacher = String(currentUser?.role || '') === 'teacher';

        // ✅ إصلاح: استخدام الاستئذانات المعلقة من رد الـ API مباشرة (لغير المعلمين)
        // وطلب /api/leave-passes/pending للمعلمين فقط
        let leavePassAlerts = [];
        // استئذانات أولياء الأمور من رد الـ API الرئيسي (للمدير/الوكيل/السوبر)
        const apiLeavePasses = Array.isArray(response?.leavePasses) ? response.leavePasses : [];
        if (!isCurrentTeacher && apiLeavePasses.length > 0) {
          leavePassAlerts = apiLeavePasses.slice(0, 5).map((lp, i) => ({
            id: 'lp-api-' + (lp.id || i),
            title: lp.isFromParent ? '🚪 استئذان من ولي الأمر' : '🚨 طلب استئذان' + (lp.status === 'created' ? ' جديد' : ''),
            body: (lp.studentName || 'طالب') + ' — ' + (lp.schoolName ? lp.schoolName + ' — ' : '') + (lp.destination === 'agent' ? 'الوكيل' : lp.destination === 'counselor' ? 'المرشد' : 'ولي الأمر'),
            time: lp.createdAt ? new Date(lp.createdAt).toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' }) : 'الآن',
            tone: lp.isFromParent ? 'amber' : 'rose',
            urgent: true,
            type: 'leavePass',
            leavePassId: lp.id,
          }));
        }
        // للمعلمين: جلب استئذاناتهم المعلقة من endpoint مخصص
        try {
          if (isCurrentTeacher) {
            const lpResp = await apiRequest('/api/leave-passes/pending?schoolId=' + (selectedSchool?.id || ''), { token: getSessionToken() });
            if (lpResp?.ok && lpResp.count > 0) {
              leavePassAlerts = (lpResp.passes || []).slice(0, 5).map((lp, i) => ({
                id: 'lp-' + (lp.id || i),
                title: '🚨 طلب استئذان' + (lp.status === 'created' ? ' جديد' : ''),
                body: (lp.studentName || 'طالب') + ' — ' + (lp.destination === 'agent' ? 'الوكيل' : lp.destination === 'counselor' ? 'المرشد' : 'ولي الأمر'),
                time: lp.createdAt ? new Date(lp.createdAt).toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' }) : 'الآن',
                tone: 'amber',
                urgent: true,
                type: 'leavePass',
                leavePassId: lp.id,
              }));
            }
          }
        } catch (e) { /* ignore */ }
        const leavePassCount = leavePassAlerts.length;
        // استئذانات المعلم المعلقة (من الـ state مباشرة)
        const teacherLeavePassAlerts = isCurrentTeacher ? (() => {
          const { getLeavePasses: getLP } = { getLeavePasses: (school) => Array.isArray(school?.leavePasses) ? school.leavePasses : [] };
          const schoolLPs = getLP(selectedSchool) || [];
          return schoolLPs
            .filter((lp) => String(lp.teacherUserId || '') === String(currentUser?.id || '') && ['created', 'sent-system', 'sent-manual', 'viewed'].includes(String(lp.status || '')))
            .map((lp, i) => ({
              id: 'teacher-lp-' + (lp.id || i),
              title: '🚨 طلب استئذان جديد',
              body: (lp.studentName || 'طالب') + ' من ' + (lp.className || lp.companyName || 'فصله') + ' — ' + (lp.destination === 'agent' ? 'الوكيل' : lp.destination === 'counselor' ? 'المرشد' : 'ولي الأمر'),
              time: lp.createdAt ? new Date(lp.createdAt).toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' }) : 'الآن',
              tone: 'rose',
              urgent: true,
              type: 'leavePass',
              leavePassId: lp.id,
            }));
        })() : [];
        const teacherNotifs = isCurrentTeacher ? (notifications || []).filter((note) => note?.forTeacherIds?.map(String).includes(String(currentUser?.id || ''))) : [];
        // ✅ إصلاح: نعرض كل التنبيهات لجميع الأدوار، لا فقط تنبيهات ولي الأمر
        // الفلتر القديم كان يخفي الاستئذانات والحضور والنقاط وكل شيء ما عدا أولياء الأمور
        const globalNotifs = isCurrentTeacher
          ? [] // المعلم تنبيهاته من teacherNotifs و teacherLeavePassAlerts فقط
          : (notifications || []).filter((note) => {
              // استبعد التنبيهات المخصصة لمعلمين بعينهم (forTeacherIds محددة)
              if (Array.isArray(note?.forTeacherIds) && note.forTeacherIds.length > 0) return false;
              return true;
            });
        const localItems = [...teacherLeavePassAlerts, ...leavePassAlerts, ...teacherNotifs, ...globalNotifs].slice(0, 8).map((note, index) => ({
          id: `local-${note?.id || index}`,
          title: note?.title || 'تنبيه',
          body: note?.body || '',
          time: note?.time || '—',
          tone: /فشل|تعذر|خطأ/.test(String(note?.title || '') + ' ' + String(note?.body || '')) ? 'rose'
              : /تحذير|انتباه|مخالفة|غياب/.test(String(note?.title || '') + ' ' + String(note?.body || '')) ? 'amber'
              : /مكافأة|نقاط|إنجاز/.test(String(note?.title || '') + ' ' + String(note?.body || '')) ? 'green'
              : 'blue',
        }));
        const normalizedAlerts = apiAlerts.slice(0, 6).map((alert, index) => ({
          id: `api-${alert?.id || index}`,
          title: alert?.title || 'إشعار إداري',
          body: alert?.body || '',
          time: alert?.time || alert?.createdAt || '—',
          tone: /رفض|فشل|تعذر/.test(String(alert?.title || '') + ' ' + String(alert?.body || '')) ? 'rose' : /تلقائي/.test(String(alert?.title || '') + ' ' + String(alert?.body || '')) ? 'amber' : 'blue',
        }));
        const failed = [...normalizedAlerts, ...localItems].filter((item) => item.tone === 'rose').length;
        const items = [];
        if (pending > 0) {
          items.push({ id: 'pending-summary', title: 'طلبات أولياء الأمور', body: `يوجد ${pending} طلب بانتظار المتابعة أو الاعتماد.`, time: 'الآن', tone: 'blue' });
        }
        items.push(...normalizedAlerts, ...localItems);
        // ✅ إصلاح: عدّاد الجرس كان صفراً للمدير/الوكيل لأن items كانت فارغة دائماً
        // الآن نحسب الاستئذانات المعلقة + التنبيهات الفعلية لكل الأدوار
        const nonTeacherCount = pending + leavePassAlerts.length + normalizedAlerts.length + globalNotifs.length;
        const totalCount = isCurrentTeacher
          ? teacherLeavePassAlerts.length + teacherNotifs.length
          : Math.min(nonTeacherCount || items.length, 99);
        setHeaderAlertsState({
          loading: false,
          loaded: true,
          error: '',
          count: Math.min(totalCount || items.length, 99),
          pending,
          autoApproved,
          failed,
          items: items.slice(0, 8),
        });
      } catch (error) {
        if (!cancelled) {
          setHeaderAlertsState((current) => ({ ...current, loading: false, loaded: true, error: error?.message || 'تعذر تحميل التنبيهات.' }));
        }
      }
    };
    loadHeaderAlerts();
    return () => { cancelled = true; };
  }, [currentUser, selectedSchool?.id, selectedSchool?.leavePasses, notifications]);



  // polling تلقائي كل دقيقتين لجلب آخر إعدادات من السيرفر
  useEffect(() => {
    if (!currentUser) return;
    const pollSettings = async () => {
      const token = getSessionToken();
      if (!token) return;
      try {
        const response = await apiRequest("/api/bootstrap", { token });
        if (!response?.state?.settings) return;
        const newSettings = buildHydratedClientState(response.state || {}, loadUiState()).settings;
        setSettings((prev) => {
          // نتحقق إذا تغيرت البنود فعلاً قبل التحديث
          const prevActions = JSON.stringify(prev?.actions || {});
          const nextActions = JSON.stringify(newSettings?.actions || {});
          if (prevActions !== nextActions) return newSettings;
          return prev;
        });
      } catch {}
    };
    const intervalId = setInterval(pollSettings, 2 * 60 * 1000); // كل دقيقتين
    return () => clearInterval(intervalId);
  }, [currentUser]);

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
      // إذا أعاد الخادم state كاملة، نُحدِّث البيانات فوراً بدون الحاجة لإعادة تحميل الصفحة
      if (response.state) {
        const next = buildHydratedClientState(response.state, loadUiState());
        setSchools(function(prev) { return mergeSchoolsFromResponse(prev, next.schools); });
        setUsers(next.users);
        setScanLog(next.scanLog);
        setActionLog(next.actionLog || []);
        setSettings(next.settings);
        saveServerCache(response.state);
      }
      const user = (response.state ? buildHydratedClientState(response.state, loadUiState()).users.find((item) => item.id === response.user?.id) : users.find((item) => item.id === response.user?.id)) || response.user;
      const fallbackSchoolId = response.user?.role === "superadmin"
        ? (selectedSchoolId || (response.state?.schools?.[0]?.id) || schools[0]?.id || null)
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

  const sidebarCounters = useMemo(() => {
    const hasParentSignal = ['superadmin', 'principal', 'supervisor'].includes(String(currentUser?.role || ''));
    const parentPending = Number(parentPortalDashboard?.pending || parentPortalConfig?.pendingRequests || headerAlertsState?.pending || 0);
    const parentAttention = Number(headerAlertsState?.failed || 0);
    const headerCount = Number(headerAlertsState?.count || 0);
    // عداد التنبيهات المخصصة للمعلم
    const isTeacher = String(currentUser?.role || '') === 'teacher';
    // عداد الجرس للمعلم: التنبيهات المخصصة + الاستئذانات الجديدة غير المعالجة
    const teacherPendingLeaves = isTeacher ? getLeavePasses(selectedSchool).filter((lp) => {
      // المعلم يرى في الجرس: الطلبات التي وصلت له ولم يتصرف بها بعد (created/sent/viewed)
      if (!['created', 'sent-system', 'sent-manual', 'viewed'].includes(String(lp.status || ''))) return false;
      return String(lp.teacherUserId || '') === String(currentUser?.id || '');
    }).length : 0;
    const teacherNotifCount = isTeacher ? Math.max(
      (notifications || []).filter((note) => {
        if (!note?.forTeacherIds) return false;
        return note.forTeacherIds.map(String).includes(String(currentUser?.id || ''));
      }).length,
      teacherPendingLeaves
    ) : 0;
    return {
      messages: hasParentSignal ? {
        value: headerCount > 99 ? '99+' : String(headerCount || 0),
        tone: parentAttention > 0 ? 'rose' : parentPending > 0 ? 'amber' : headerCount > 0 ? 'sky' : 'slate',
        hidden: headerCount <= 0,
      } : (isTeacher && teacherNotifCount > 0 ? {
        value: teacherNotifCount > 99 ? '99+' : String(teacherNotifCount),
        tone: 'sky',
        hidden: false,
      } : null),
      settings: canViewParentPortal ? {
        value: parentPending > 99 ? '99+' : String(parentPending || 0),
        tone: parentPending > 0 ? 'amber' : (parentPortalConfig?.enabled === false ? 'slate' : 'green'),
        hidden: parentPending <= 0 && parentPortalConfig?.enabled !== false,
      } : null,
      lessonAttendanceSessions: isTeacher && teacherNotifCount > 0 ? {
        value: teacherNotifCount > 99 ? '99+' : String(teacherNotifCount),
        tone: 'sky',
        hidden: false,
      } : null,
    };
  }, [currentUser?.role, currentUser?.id, notifications, canViewParentPortal, parentPortalDashboard?.pending, parentPortalConfig?.pendingRequests, parentPortalConfig?.enabled, headerAlertsState?.pending, headerAlertsState?.failed, headerAlertsState?.count, selectedSchool?.leavePasses]);

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
    const normalizedMobile = normalizePhoneNumber(String(payload.guardianMobile || "").trim());
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
    const normalizedMobile = normalizePhoneNumber(String(payload.guardianMobile || "").trim());
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
              const guardianMobile = normalizePhoneNumber(String(row.guardianMobile || "").trim());
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
      setSchools(function(prev) { return mergeSchoolsFromResponse(prev, next.schools); });
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

  const handleEditSchool = async (updatedSchool) => {
    if (!updatedSchool?.id) return;
    // تحديث بيانات المدرسة في الحالة المحلية
    setSchools((prev) => prev.map((s) => {
      if (s.id !== updatedSchool.id) return s;
      const merged = { ...s, ...updatedSchool };
      return merged;
    }));
    // تحديث بيانات مدير المدرسة إن تغيرت
    if (updatedSchool.principalUsername || updatedSchool.principalEmail || updatedSchool.principalPhone) {
      setUsers((prev) => prev.map((u) => {
        if (u.schoolId !== updatedSchool.id || u.role !== 'principal') return u;
        const patch = {};
        if (updatedSchool.principalUsername) patch.username = updatedSchool.principalUsername.trim().toLowerCase();
        if (updatedSchool.principalEmail) patch.email = updatedSchool.principalEmail.trim().toLowerCase();
        if (updatedSchool.principalPhone) patch.phone = updatedSchool.principalPhone;
        if (updatedSchool.principalPassword && updatedSchool.principalPassword.trim()) patch.password = updatedSchool.principalPassword.trim();
        return { ...u, ...patch };
      }));
    }
    // حفظ التغييرات على الخادم
    try {
      const token = getSessionToken();
      if (token) {
        const nextSchools = schools.map((s) => s.id !== updatedSchool.id ? s : { ...s, ...updatedSchool });
        const nextState = { ...sharedState, schools: nextSchools };
        await apiRequest('/api/state/save', { method: 'POST', token, body: { state: nextState } });
        pushNotification('تعديل مدرسة', `تم تحديث بيانات المدرسة ${updatedSchool.name || ''} بنجاح.`);
      }
    } catch (error) {
      console.error('خطأ في حفظ تعديل المدرسة:', error);
      window.alert('تم التحديث محلياً لكن تعذر الحفظ على الخادم: ' + (error?.message || ''));
    }
  };

  const handleAddSchool = async (form) => {
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
          password: String(form.principalPassword || "").trim(),
      },
    };
    const nextUserId = Math.max(0, ...users.map((user) => user.id)) + 1;
    const token = getSessionToken();
    if (!token) { window.alert("فشل المصادقة. يرجى تسجيل الدخول مرة أخرى."); return; }

    try {
      const response = await fetch("/api/schools", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(form),
      });
      const result = await response.json();
      if (result.ok) {
        // تحديث الحالة مباشرةً من النتيجة المُرجَعة
        if (result.state) {
          applyServerStatePayload(result.state, loadUiState());
        } else {
          // في حالة عدم وجود state في الرد، نجلب الحالة من bootstrap
          try {
            const stateResp = await apiRequest('/api/bootstrap', { method: 'GET', token: getSessionToken() });
            if (stateResp?.state) applyServerStatePayload(stateResp.state, loadUiState());
          } catch (_) {}
        }
        const addedSchoolId = result.school?.id || newId;
        setSelectedSchoolId(addedSchoolId);
        setActivePage('schools');
        pushNotification('تمت إضافة مدرسة', `أضيفت المدرسة ${form.name} وتم إنشاء مدير المدرسة بحساب ${normalizedPrincipalUsername}.`);
      } else {
        window.alert(result.message || "فشل إضافة المدرسة.");
      }
    } catch (error) {
      console.error("Error adding school:", error);
      window.alert("حدث خطأ أثناء إضافة المدرسة.");
    }
  };

  const handleUpdateSchoolBranding = (schoolId, patch) => {
    setSchools((prev) => prev.map((school) => school.id !== schoolId ? school : {
      ...school,
      customBranding: {
        ...(school.customBranding || { enabled: false, allowed: false, platformName: '', logoUrl: '' }),
        ...patch,
      },
    }));
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
      setSchools(function(prev) { return mergeSchoolsFromResponse(prev, next.schools); });
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

  const resolveStudentForFace = (studentId) => {
    // دعم structure students (id مثل "structure-1-5") وكذلك school students
    const unifiedAll = getUnifiedSchoolStudents(selectedSchool, { includeArchived: false, preferStructure: true });
    const unified = unifiedAll.find((item) => String(item.id) === String(studentId));
    if (unified) {
      // ضمان rawId دائماً رقم صحيح - إذا كان id مركب مثل "structure-1-5" نستخرج الرقم الأخير
      if (!unified.rawId && String(unified.id).startsWith('structure-')) {
        const parts = String(unified.id).split('-');
        unified.rawId = parts[parts.length - 1];
      }
      return unified;
    }
    return selectedSchool.students.find((item) => String(item.id) === String(studentId)) || null;
  };

  const handleEnrollFace = async (studentId, file) => {
    const student = resolveStudentForFace(studentId);
    if (!student) return;
    const realId = student.rawId || student.id;
    const template = await buildFaceTemplateFromFile(file);
    try {
      const response = await apiRequest(`/api/schools/${selectedSchool.id}/students/${realId}/face`, {
        method: 'POST',
        token: getSessionToken(),
        body: { imageData: template.photo, signature: template.signature, classroomId: student.classroomId || null },
      });
      applyServerStatePayload(response.state || {}, loadUiState());
      pushNotification("تسجيل بصمة الوجه", `تم حفظ صورة الوجه للطالب ${student.name} في التخزين المركزي.`);
    } catch (error) {
      window.alert(error?.message || 'تعذر حفظ بصمة الوجه على الخادم.');
    }
  };

  const handleEnrollFaceDataUrl = async (studentId, dataUrl) => {
    const student = resolveStudentForFace(studentId);
    if (!student) throw new Error('لم يتم العثور على الطالب - تأكد من اختيار طالب أولاً.');
    const realId = student.rawId || student.id;
    const template = await buildFaceTemplateFromDataUrl(dataUrl);
    const response = await apiRequest(`/api/schools/${selectedSchool.id}/students/${realId}/face`, {
      method: 'POST',
      token: getSessionToken(),
      body: { imageData: template.photo, signature: template.signature, classroomId: student.classroomId || null },
    });
    applyServerStatePayload(response.state || {}, loadUiState());
    pushNotification("تسجيل بصمة الوجه", `تم التقاط صورة مباشرة وحفظها للطالب ${student.name}.`);
    return true;
  };

  const handleClearFace = (studentId) => {
    const student = resolveStudentForFace(studentId);
    if (!student) return;
    const realId = student.rawId || student.id;
    const cid = student.classroomId ? Number(student.classroomId) : null;
    setSchools((prev) => prev.map((school) => {
      if (school.id !== selectedSchool.id) return school;
      const updatedStudents = school.students.map((item) => Number(item.id) !== Number(realId) ? item : { ...item, faceReady: false, facePhoto: "", faceSignature: [] });
      const updatedStructure = school.structure?.classrooms ? {
        ...school.structure,
        classrooms: school.structure.classrooms.map((cls) => {
          if (cid && Number(cls.id) !== cid) return cls;
          return {
            ...cls,
            students: (cls.students || []).map((item) => Number(item.id) !== Number(realId) ? item : { ...item, faceReady: false, facePhoto: "", faceSignature: [] }),
          };
        }),
      } : school.structure;
      return { ...school, students: updatedStudents, structure: updatedStructure };
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
    const template = await buildFaceTemplateFromFile(file);
    if (!template.faceDetected) return null;
    const candidates = getUnifiedSchoolStudents(selectedSchool, { includeArchived: false, preferStructure: true }).filter((student) => getFaceProfileState(student) === "ready");
    const match = findBestFaceMatch(template.signature, candidates);
    return match?.student || null;
  };

  const resolveStudentByFaceDataUrl = async (dataUrl) => {
    const template = await buildFaceTemplateFromDataUrl(dataUrl);
    if (!template.faceDetected) return null;
    const candidates = getUnifiedSchoolStudents(selectedSchool, { includeArchived: false, preferStructure: true }).filter((student) => getFaceProfileState(student) === "ready");
    const match = findBestFaceMatch(template.signature, candidates);
    return match?.student || null;
  };

  const handleApplyStudentAction = async ({ studentId, actionType, definitionId, specialDefinition, note, method }) => {
    const unifiedStudent = getUnifiedSchoolStudents(selectedSchool, { includeArchived: false, preferStructure: true }).find((item) => String(item.id) === String(studentId));
    if (!unifiedStudent) return { ok: false, message: "الطالب غير موجود." };

    if (unifiedStudent.source === 'structure') {
      // إرسال الإجراء للسيرفر باستخدام composite studentId
      try {
        const response = await apiRequest(`/api/schools/${selectedSchool.id}/actions/apply`, {
          method: 'POST',
          token: getSessionToken(),
          body: { studentId: unifiedStudent.id, actionType, definitionId, specialDefinition, note, method: method || 'هيكل مدرسي' },
        });
        if (response?.state) applyServerStatePayload(response.state || {}, loadUiState());
        const message = response?.message || `تم تنفيذ الإجراء على ${unifiedStudent.name}.`;
        pushNotification(actionType === "reward" ? "تنفيذ مكافأة" : "تنفيذ خصم", message);
        return { ok: true, message };
      } catch (error) {
        // فشل السيرفر: تحديث محلي فقط
        const definitionPool = actionType === 'violation' ? (settings.actions?.violations || []) : (settings.actions?.rewards || []);
        const definition = specialDefinition?.scope === 'special' ? specialDefinition : (definitionPool.find((item) => String(item.id) === String(definitionId)) || { title: 'إجراء', points: 0 });
        const deltaPoints = Number(definition.points || 0);
        const now = new Date();
        setActionLog((prev) => [{ id: Date.now(), schoolId: selectedSchool.id, studentId: unifiedStudent.id, classroomId: unifiedStudent.classroomId || null, student: unifiedStudent.name, actionType, actionTitle: definition.title || 'إجراء', deltaPoints, points: deltaPoints, createdAt: now.toISOString(), note: String(note || '').trim(), actorName: currentUser?.name || 'مستخدم', method: method || 'هيكل مدرسي', date: toArabicDate(now), isoDate: getTodayIso(), time: `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}` }, ...prev]);
        setSchools((prev) => prev.map((school) => {
          if (school.id !== selectedSchool.id) return school;
          return { ...school, structure: { ...(school.structure || {}), classrooms: (school.structure?.classrooms || []).map((classroom) => String(classroom.id) !== String(unifiedStudent.classroomId) ? classroom : { ...classroom, students: (classroom.students || []).map((item) => String(item.id) !== String(unifiedStudent.rawId) ? item : { ...item, points: Number(item.points || 0) + deltaPoints }) }) } };
        }));
        const message = `تم تنفيذ ${actionType === 'reward' ? 'المكافأة' : 'الخصم'} على ${unifiedStudent.name}.`;
        pushNotification(actionType === "reward" ? "تنفيذ مكافأة" : "تنفيذ خصم", message);
        return { ok: true, message };
      }
    }

    const student = selectedSchool.students.find((item) => item.id === unifiedStudent.id || item.id === studentId);
    if (!student) return { ok: false, message: "الطالب غير موجود." };
    try {
      const response = await apiRequest(`/api/schools/${selectedSchool.id}/actions/apply`, {
        method: 'POST',
        token: getSessionToken(),
        body: { studentId: student.id, actionType, definitionId, specialDefinition, note, method },
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

  const handleScan = (barcodeInput, { skipDeviceCheck = false } = {}) => {
    const rawValue = String(barcodeInput || '').trim();
    const value = sanitizeBarcodeValue(rawValue);
    if (!skipDeviceCheck && !settings.devices.barcodeEnabled) {
      window.alert("قارئ QR غير مفعل من الإعدادات.");
      return;
    }
    // نحسب attendanceBinding وattendanceStudents محلياً داخل الدالة لأنهما غير متاحين في هذا السياق
    const _attendanceBinding = getSchoolAttendanceBinding(selectedSchool);
    const _attendanceSource = getAttendanceStudentsSource(selectedSchool);
    const _attendanceStudents = _attendanceSource.students || [];
    const sourceMode = _attendanceBinding.sourceMode;
    const normalizedRaw = normalizeSearchToken(rawValue);
    const student = sourceMode === 'structure'
      ? (_attendanceStudents.find((item) => sanitizeBarcodeValue(item.barcode) === value || normalizeSearchToken(item.nationalId || item.identityNumber || '') === normalizedRaw || normalizeSearchToken(item.guardianMobile || '') === normalizedRaw || normalizeSearchToken(item.studentNumber || item.rawId || item.id || '') === normalizedRaw || String(item.name || '').trim() === rawValue || String(item.fullName || '').trim() === rawValue) || findStudentByKeyword(selectedSchool, rawValue))
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

    // نظام النقاط التلقائي: إذا كان مفعّلاً، نستخدم قيمه بدلاً من القيم القديمة
    const aps = settings?.attendancePointsSystem;
    const apsEnabled = Boolean(aps?.enabled);
    let result = "تم تسجيل تأخر";
    let deltaPoints;
    if (currentMinutes <= earlyCutoff) {
      result = "تم تسجيل حضور مبكر";
      // في النظام التلقائي: النقاط الأساسية + مكافأة المبكر
      deltaPoints = apsEnabled
        ? safeNumber(aps?.dailyPresencePoints ?? 5) + safeNumber(aps?.earlyBonusPoints ?? 3)
        : safeNumber(settings.points.early);
    } else if (currentMinutes <= onTimeCutoff) {
      result = "تم تسجيل حضور في الوقت";
      // في النظام التلقائي: النقاط الأساسية فقط (0 إضافية)
      deltaPoints = apsEnabled
        ? safeNumber(aps?.dailyPresencePoints ?? 5)
        : safeNumber(settings.points.onTime);
    } else {
      // متأخر: في النظام التلقائي يحصل على الفرق (dailyPts - lateDeduct)
      deltaPoints = apsEnabled
        ? Math.max(0, safeNumber(aps?.dailyPresencePoints ?? 5) - safeNumber(aps?.lateDeductPoints ?? 3))
        : safeNumber(settings.points.late);
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
      gateName: 'بوابة الحضور اليدوي',
      attendanceSource: 'بوابة',
      attendanceSourceDetail: 'بوابة الحضور اليدوي',
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
    // ===== حفظ فوري في السيرفر وبث التحديث لشاشة العرض =====
    const _token = getSessionToken();
    if (_token) {
      apiRequest('/api/attendance/scan', {
        method: 'POST',
        token: _token,
        body: { scanEntry: logEntry },
      }).catch((err) => console.warn('حفظ الحضور الفوري فشل:', err));
    }
  };

  const handleFaceScanFile = async (file) => {
    const student = await resolveStudentByFaceFile(file);
    if (!student) {
      pushNotification("فشل التحقق", "لم يتم العثور على تطابق كافٍ مع الصور المسجلة في المدرسة الحالية.");
      return null;
    }
    handleScan(student.barcode, { skipDeviceCheck: true });
    return student;
  };

  const handleFaceScanDataUrl = async (dataUrl) => {
    const student = await resolveStudentByFaceDataUrl(dataUrl);
    if (!student) {
      pushNotification("فشل التحقق", "لم يتم العثور على تطابق كافٍ مع الصور المسجلة في المدرسة الحالية.");
      return null;
    }
    handleScan(student.barcode, { skipDeviceCheck: true });
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
      gateSyncEvents,
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
    setGateSyncEvents(hydrateGateSyncCenterEvents(payload.gateSyncEvents || []));
    setSettings({
      ...defaultSettings,
      ...(payload.settings || {}),
      policy: { ...defaultSettings.policy, ...(payload.settings?.policy || {}) },
      points: { ...defaultSettings.points, ...(payload.settings?.points || {}) },
      teacherPoints: { ...defaultSettings.teacherPoints, ...(payload.settings?.teacherPoints || {}) },
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
      setGateSyncEvents(hydrateGateSyncCenterEvents(fresh.gateSyncEvents || []));
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
      subjects: form.role === 'teacher' ? parseTeacherSubjects(form.subjects || []) : [],
      specialItems: form.role === 'teacher' ? hydrateTeacherSpecialItems(form.specialItems || []) : [],
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
      subjects: form.role === 'teacher' ? parseTeacherSubjects(form.subjects || []) : [],
      specialItems: form.role === 'teacher' ? hydrateTeacherSpecialItems(form.specialItems || []) : [],
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
      setSchools(function(prev) { return mergeSchoolsFromResponse(prev, next.schools); });
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
      setSchools(function(prev) { return mergeSchoolsFromResponse(prev, next.schools); }); setUsers(next.users); setScanLog(next.scanLog); setActionLog(next.actionLog || []); setSettings(next.settings); setNotifications(next.notifications); saveServerCache(response.state || {});
    } catch (error) {
      window.alert(error?.message || 'تعذر حذف رابط البوابة.');
    }
  };

  const handleUpdateGateLink = async (linkId, payload) => {
    if (!selectedSchool) return { ok: false };
    try {
      const response = await apiRequest(`/api/schools/${selectedSchool.id}/device-links/gate/${linkId}`, { method: 'PATCH', token: getSessionToken(), body: payload });
      const next = buildHydratedClientState(response.state || {}, loadUiState());
      setSchools(function(prev) { return mergeSchoolsFromResponse(prev, next.schools); }); setUsers(next.users); setScanLog(next.scanLog); setActionLog(next.actionLog || []); setSettings(next.settings); setNotifications(next.notifications); saveServerCache(response.state || {});
      pushNotification('تحديث بوابة', `تم تحديث وضع بوابة ${response.link?.name || ''}.`);
      return { ok: true, link: response.link };
    } catch (error) {
      // إذا فشل الـAPI نحدد الوضع محلياً فقط (بدون حفظ سيرفر)
      setSchools((prev) => prev.map((school) => {
        if (school.id !== selectedSchool.id) return school;
        return {
          ...school,
          deviceLinks: (school.deviceLinks || []).map((link) =>
            link.id === linkId ? { ...link, ...payload } : link
          ),
        };
      }));
      return { ok: true };
    }
  };

  const handleCreateScreenLink = async (payload) => {
    if (!selectedSchool) return { ok: false };
    try {
      const response = await apiRequest(`/api/schools/${selectedSchool.id}/device-links`, { method: 'POST', token: getSessionToken(), body: { kind: 'screen', ...payload } });
      const uiState = loadUiState();
      const next = buildHydratedClientState(response.state || {}, uiState);
      setSchools(function(prev) { return mergeSchoolsFromResponse(prev, next.schools); }); setUsers(next.users); setScanLog(next.scanLog); setActionLog(next.actionLog || []); setSettings(next.settings); setNotifications(next.notifications); saveServerCache(response.state || {});
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
      setSchools(function(prev) { return mergeSchoolsFromResponse(prev, next.schools); }); setUsers(next.users); setScanLog(next.scanLog); setActionLog(next.actionLog || []); setSettings(next.settings); setNotifications(next.notifications); saveServerCache(response.state || {});
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
      setSchools(function(prev) { return mergeSchoolsFromResponse(prev, next.schools); }); setUsers(next.users); setScanLog(next.scanLog); setActionLog(next.actionLog || []); setSettings(next.settings); setNotifications(next.notifications); saveServerCache(response.state || {});
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
        setSchools(function(prev) { return mergeSchoolsFromResponse(prev, next.schools); }); setUsers(next.users); setScanLog(next.scanLog); setActionLog(next.actionLog || []); setSettings(next.settings); setNotifications(next.notifications); saveServerCache(response.state || {});
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
        setSchools(function(prev) { return mergeSchoolsFromResponse(prev, next.schools); }); setUsers(next.users); setScanLog(next.scanLog); setActionLog(next.actionLog || []); setSettings(next.settings); setNotifications(next.notifications); saveServerCache(response.state || {});
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
        setSchools(function(prev) { return mergeSchoolsFromResponse(prev, next.schools); }); setUsers(next.users); setScanLog(next.scanLog); setActionLog(next.actionLog || []); setSettings(next.settings); setNotifications(next.notifications); saveServerCache(response.state || {});
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
        setSchools(function(prev) { return mergeSchoolsFromResponse(prev, next.schools); }); setUsers(next.users); setScanLog(next.scanLog); setActionLog(next.actionLog || []); setSettings(next.settings); setNotifications(next.notifications); saveServerCache(response.state || {});
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
        setSchools(function(prev) { return mergeSchoolsFromResponse(prev, next.schools); }); setUsers(next.users); setScanLog(next.scanLog); setActionLog(next.actionLog || []); setSettings(next.settings); setNotifications(next.notifications); saveServerCache(response.state || {});
      }
      return { ok: true };
    } catch (error) {
      window.alert(error?.message || 'تعذر تغيير حالة القاعدة.');
      return { ok: false, message: error?.message };
    }
  };

  const handleSendSchoolMessage = async ({ audience = 'lateToday', channel = 'internal', subject = '', message = '', sendMode = 'now', audienceLabel = 'مستهدفات مخصصة', recipientUserIds = [] }) => {
    if (!selectedSchool) return { ok: false, message: 'لا توجد مدرسة محددة.' };
    try {
      const response = await apiRequest(`/api/schools/${selectedSchool.id}/messages/send`, {
        method: 'POST',
        token: getSessionToken(),
        body: { audience, channel, subject, message, sendMode, audienceLabel, recipientUserIds },
      });
      if (response.state) {
        const next = buildHydratedClientState(response.state, loadUiState());
        setSchools(function(prev) { return mergeSchoolsFromResponse(prev, next.schools); });
        setUsers(next.users);
        setScanLog(next.scanLog);
        setActionLog(next.actionLog || []);
        setGateSyncEvents(hydrateGateSyncCenterEvents(next.gateSyncEvents || []));
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
        setSchools(function(prev) { return mergeSchoolsFromResponse(prev, next.schools); });
        setUsers(next.users);
        setScanLog(next.scanLog);
        setActionLog(next.actionLog || []);
        setGateSyncEvents(hydrateGateSyncCenterEvents(next.gateSyncEvents || []));
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


  // === حفظ الاستئذان على الخادم (آمن - يحفظ الاستئذانات فقط بدون مسح بيانات أخرى) ===
  const persistLeavePassesToServer = async () => {
    try {
      const token = getSessionToken();
      if (!token || !selectedSchool?.id) return;
      const passes = getLeavePasses(selectedSchool);
      await apiRequest('/api/leave-passes/save', {
        method: 'POST',
        token,
        body: { schoolId: selectedSchool.id, leavePasses: passes },
      });
    } catch (e) {
      console.warn('تعذر حفظ الاستئذان على الخادم:', e?.message);
    }
  };

  const handleCreateLeavePass = async (payload = {}) => {
    if (!selectedSchool?.id || !currentUser) return { ok: false, message: 'لا توجد مدرسة محددة.' };
    const students = getUnifiedSchoolStudents(selectedSchool, { includeArchived: false, preferStructure: true });
    const student = students.find((item) => String(item.id) === String(payload.studentId || '') || String(item.rawId || '') === String(payload.studentId || ''));
    if (!student) return { ok: false, message: 'حدد الطالب أولاً.' };
    const teacher = (users || []).find((user) => Number(user.schoolId) === Number(selectedSchool.id) && String(user.role || '') === 'teacher' && String(user.id) === String(payload.teacherUserId || ''));
    if (!teacher) return { ok: false, message: 'حدد المعلم المستهدف.' };
    const leavePassId = `leave-${Date.now()}`;
    const leavePass = {
      id: leavePassId,
      schoolId: selectedSchool.id,
      studentId: student.id,
      studentName: student.name || student.fullName || 'طالب',
      studentNumber: student.studentNumber || '',
      className: student.classroomName || student.className || '',
      companyName: getStudentGroupingLabel(student, selectedSchool),
      teacherUserId: teacher.id,
      teacherName: teacher.name || teacher.username || 'معلم',
      teacherMobile: String(teacher.mobile || '').trim(),
      destination: String(payload.destination || 'agent'),
      guardianName: String(payload.guardianName || '').trim(),
      guardianMobile: String(payload.guardianMobile || '').trim(),
      reason: String(payload.reason || '').trim(),
      note: String(payload.note || '').trim(),
      status: 'created',
      createdAt: new Date().toISOString(),
      createdById: currentUser.id || null,
      createdByName: currentUser.name || currentUser.username || 'الإدارة',
      createdByRole: currentUser.role || 'principal',
      sendPreference: payload.sendChannel === 'manual' ? 'manual' : 'system',
      passLink: buildLeavePassLink(leavePassId),
      timeline: [createLeavePassEvent('created', currentUser.name || currentUser.username || 'الإدارة', 'تم إنشاء طلب الاستئذان')],
    };
    setSchools((prev) => prev.map((school) => school.id !== selectedSchool.id ? school : { ...school, leavePasses: [leavePass, ...getLeavePasses(school)] }));
    // إشعار عام
    pushNotification('الاستئذان', `تم إنشاء طلب استئذان للطالب ${leavePass.studentName}.`);
    persistLeavePassesToServer();
    return { ok: true, leavePass, message: 'تم إنشاء الاستئذان ويمكن الآن إرسال الرابط للمعلم.' };
  };

  const handleMarkLeavePassViewed = (leavePassId) => {
    if (!selectedSchool?.id || !currentUser) return { ok: false, message: 'لا توجد مدرسة محددة.' };
    let changed = false;
    setSchools((prev) => prev.map((school) => school.id !== selectedSchool.id ? school : ({
      ...school,
      leavePasses: getLeavePasses(school).map((item) => {
        if (String(item.id) !== String(leavePassId)) return item;
        if (String(item.teacherUserId || '') !== String(currentUser.id || item.teacherUserId || '')) return item;
        changed = true;
        const nextStatus = ['created', 'sent-system', 'sent-manual'].includes(String(item.status || '')) ? 'viewed' : item.status;
        return { ...item, status: nextStatus, viewedAt: new Date().toISOString(), viewedByName: currentUser.name || currentUser.username || 'المعلم', timeline: [createLeavePassEvent('viewed', currentUser.name || currentUser.username || 'المعلم', 'تم تسجيل اطلاع المعلم'), ...getLeavePassTimeline(item)] };
      }),
    })));
    if (changed) {
      pushNotification('الاستئذان', 'اطلع المعلم على طلب الاستئذان.');
      // إرسال تنبيه فوري للمدير ومسؤول الأمن بعد اطلاع المعلم
      const updatedPass = getLeavePasses(selectedSchool).find((item) => String(item.id) === String(leavePassId));
      const passStudentName = updatedPass?.studentName || '';
      const passClassName = updatedPass?.className || updatedPass?.companyName || 'فصله';
      // تنبيه المدير
      const principalUsers = (users || []).filter((u) => Number(u.schoolId) === Number(selectedSchool.id) && ['principal', 'supervisor'].includes(String(u.role || '')));
      principalUsers.forEach((pu) => {
        setNotifications((prev) => [
          { id: Date.now() + Number(pu.id), title: '📋 استئذان بانتظار اعتمادك', body: `استئذان ${passStudentName} من ${passClassName}`, time: new Intl.DateTimeFormat('ar-SA', { hour: '2-digit', minute: '2-digit' }).format(new Date()), forTeacherIds: [pu.id] },
          ...prev,
        ].slice(0, 30));
      });
      // تنبيه مسؤول الأمن
      const gateUsers = (users || []).filter((u) => Number(u.schoolId) === Number(selectedSchool.id) && String(u.role || '') === 'gate');
      gateUsers.forEach((gu) => {
        setNotifications((prev) => [
          { id: Date.now() + Number(gu.id) + 1, title: '🚨 استئذان جديد عند البوابة', body: `استئذان ${passStudentName} من ${passClassName}`, time: new Intl.DateTimeFormat('ar-SA', { hour: '2-digit', minute: '2-digit' }).format(new Date()), forTeacherIds: [gu.id] },
          ...prev,
        ].slice(0, 30));
      });
    }
    if (changed) persistLeavePassesToServer();
    return { ok: changed, message: changed ? 'تم تسجيل اطلاع المعلم.' : 'لم يتم العثور على الطلب.' };
  };

  const handleUpdateLeavePassStatus = async (leavePassId, status = 'completed') => {
    if (!selectedSchool?.id || !currentUser) return { ok: false, message: 'لا توجد مدرسة محددة.' };
    const isTeacher = String(currentUser?.role || '') === 'teacher';
    // المعلم عند الضغط على "خرج الطالب" يغير الحالة إلى released-teacher (ليس completed)
    // الإغلاق النهائي يكون فقط من المدير أو مسؤول الأمن
    const actualStatus = (isTeacher && status === 'completed') ? 'released-teacher' : status;
    const actorName = currentUser.name || currentUser.username || 'مستخدم النظام';
    const now = new Date().toISOString();
    // ابحث عن الطلب الحالي
    const existingPass = getLeavePasses(selectedSchool).find((item) => String(item.id) === String(leavePassId));
    if (!existingPass) return { ok: false, message: 'لم يتم العثور على الطلب.' };
    // بناء الطلب المحدث
    const patch = {
      ...existingPass,
      status: actualStatus,
      updatedAt: now,
      updatedByName: actorName,
      timeline: [createLeavePassEvent(actualStatus, actorName), ...getLeavePassTimeline(existingPass)],
    };
    if (['approved-agent', 'approved-counselor', 'released-guardian', 'released-teacher'].includes(String(actualStatus || ''))) {
      patch.approvedAt = now;
      patch.approvedByName = actorName;
    }
    if (String(actualStatus || '') === 'completed') {
      patch.completedAt = now;
      patch.completedByName = actorName;
    }
    // 1. تحديث الـ state المحلي فوراً (optimistic update)
    setSchools((prev) => prev.map((school) => school.id !== selectedSchool.id ? school : ({
      ...school,
      leavePasses: getLeavePasses(school).map((item) => String(item.id) === String(leavePassId) ? patch : item),
    })));
    // 2. إرسال التحديث للخادم فوراً عبر endpoint خاص (atomic — لا يُعيد الكتابة الكاملة)
    try {
      const token = getSessionToken();
      await apiRequest('/api/leave-passes/update-status', {
        method: 'POST',
        token,
        body: {
          leavePassId,
          status: actualStatus,
          schoolId: selectedSchool.id,
          updatedByName: actorName,
          timeline: patch.timeline,
        },
      });
    } catch (e) {
      console.warn('تعذر تحديث حالة الاستئذان على الخادم:', e?.message);
      // fallback: حفظ كامل
      persistLeavePassesToServer();
    }
    // 3. الإشعارات
    const passStudentName = patch?.studentName || '';
    const passClassName = patch?.className || patch?.companyName || 'فصله';
    if (actualStatus === 'released-teacher') {
      // إشعار المدير بأن الطالب خرج من الفصل وبانتظار التأكيد
      const principalUsers = (users || []).filter((u) => Number(u.schoolId) === Number(selectedSchool.id) && ['principal', 'supervisor', 'superadmin'].includes(String(u.role || '')));
      principalUsers.forEach((pu) => {
        setNotifications((prev) => [
          { id: Date.now() + Number(pu.id), title: '🚶 الطالب خرج من الفصل', body: `الطالب ${passStudentName} من ${passClassName} خرج من الفصل وبانتظار تأكيد الخروج من البوابة.`, time: new Intl.DateTimeFormat('ar-SA', { hour: '2-digit', minute: '2-digit' }).format(new Date()), forTeacherIds: [pu.id] },
          ...prev,
        ].slice(0, 30));
      });
      // إشعار مسؤول الأمن فوراً
      const gateUsers = (users || []).filter((u) => Number(u.schoolId) === Number(selectedSchool.id) && String(u.role || '') === 'gate');
      gateUsers.forEach((gu) => {
        setNotifications((prev) => [
          { id: Date.now() + Number(gu.id) + 2, title: '🚨 طالب في الطريق إلى البوابة', body: `الطالب ${passStudentName} من ${passClassName} خرج من فصله وفي طريقه إلى البوابة. يرجى تأكيد الخروج.`, time: new Intl.DateTimeFormat('ar-SA', { hour: '2-digit', minute: '2-digit' }).format(new Date()), forTeacherIds: [gu.id] },
          ...prev,
        ].slice(0, 30));
      });
      pushNotification('الاستئذان', `الطالب ${passStudentName} خرج من الفصل وبانتظار تأكيد الأمن.`);
    } else {
      pushNotification('الاستئذان', actualStatus === 'completed' ? 'تم إقفال الاستئذان بنجاح.' : 'تم تحديث حالة الاستئذان.');
    }
    return { ok: true, message: 'تم تحديث حالة الاستئذان.' };
  };

  // === تعيين المعلم للاستئذان وتحديث الستيت المحلي ===
  const handleAssignTeacherToPass = async (leavePassId, teacherUserId, teacherName) => {
    if (!selectedSchool?.id) return { ok: false, message: 'لا توجد مدرسة محددة.' };
    // 1. تحديث الستيت المحلي فوراً
    setSchools((prev) => prev.map((school) => school.id !== selectedSchool.id ? school : ({
      ...school,
      leavePasses: getLeavePasses(school).map((item) => String(item.id) !== String(leavePassId) ? item : {
        ...item,
        teacherUserId: String(teacherUserId),
        teacherName: teacherName || String(teacherUserId),
        updatedAt: new Date().toISOString(),
      }),
    })));
    // 2. حفظ فوري للخادم
    setTimeout(() => persistLeavePassesToServer(), 300);
    return { ok: true };
  };

  const handleSendLeavePass = async (leavePassOrId, mode = 'system', target = 'teacher') => {
    if (!selectedSchool?.id || !currentUser) return { ok: false, message: 'لا توجد مدرسة محددة.' };
    // قبول leavePass كـ object مباشرة (عند الإنشاء الفوري) أو كـ id (عند الإرسال اللاحق)
    const leavePassId = typeof leavePassOrId === 'object' ? leavePassOrId?.id : leavePassOrId;
    const leavePass = typeof leavePassOrId === 'object' ? leavePassOrId : getLeavePasses(selectedSchool).find((item) => String(item.id) === String(leavePassId));
    if (!leavePass) return { ok: false, message: 'تعذر العثور على طلب الاستئذان.' };
    const actorName = currentUser.name || currentUser.username || 'الإدارة';
    const targetLabel = target === 'guardian' ? 'ولي الأمر' : target === 'agent' ? 'الوكيل' : target === 'counselor' ? 'المرشد' : 'المعلم';
    const message = `استئذان طالب من الحصة
الطالب: ${leavePass.studentName}
الفصل: ${leavePass.className || leavePass.companyName || '—'}
الوجهة: ${getLeavePassDestinationLabel(leavePass.destination)}
السبب: ${leavePass.reason || '—'}
${target === 'guardian' ? `اسم ولي الأمر: ${leavePass.guardianName || '—'}
` : ''}الرابط: ${leavePass.passLink}`;
    if (mode === 'manual') {
      const phoneSource = target === 'guardian' ? leavePass.guardianMobile : leavePass.teacherMobile;
      if (!phoneSource && target !== 'agent' && target !== 'counselor') return { ok: false, message: `لا يوجد رقم جوال صالح لـ${targetLabel}.` };
      setSchools((prev) => prev.map((school) => school.id !== selectedSchool.id ? school : ({
        ...school,
        leavePasses: getLeavePasses(school).map((item) => String(item.id) !== String(leavePassId) ? item : { ...item,
          status: target === 'teacher' ? 'sent-manual' : item.status,
          sentAt: new Date().toISOString(),
          sentByName: actorName,
          sendMode: mode,
          lastNotifiedTarget: target,
          timeline: [createLeavePassEvent(`sent-manual-${target}`, actorName, `تم تجهيز إرسال يدوي إلى ${targetLabel}`), ...getLeavePassTimeline(item)],
        }),
      })));
      if (target === 'agent' || target === 'counselor') {
        pushNotification('الاستئذان', `تم تسجيل إشعار ${targetLabel} لطلب ${leavePass.studentName}.`);
        return { ok: true, message: `تم تسجيل إشعار ${targetLabel} داخل النظام.` };
      }
      pushNotification('الاستئذان', `تم تجهيز إرسال يدوي لطلب ${leavePass.studentName} إلى ${targetLabel}.`);
      const phone = String(phoneSource || '').replace(/\D+/g, '');
      return { ok: true, whatsAppUrl: `https://wa.me/${phone}?text=${encodeURIComponent(message)}`, message: `تم تجهيز واتساب المدير لإرسال الإشعار إلى ${targetLabel}.` };
    }
    if (target === 'teacher') {
      // إرسال التنبيه مباشرة للمعلم عبر setNotifications (لا يحتاج صلاحية principal)
      const teacherForSend = (users || []).find((u) => Number(u.schoolId) === Number(selectedSchool.id) && String(u.role) === 'teacher' && String(u.id) === String(leavePass.teacherUserId || ''));
      if (teacherForSend) {
        setNotifications((prev) => [
          {
            id: Date.now(),
            title: '🚨 طلب استئذان جديد',
            body: `الطالب ${leavePass.studentName} من ${leavePass.className || leavePass.companyName || 'فصله'} — ${leavePass.destination === 'agent' ? 'الوكيل' : leavePass.destination === 'counselor' ? 'المرشد' : 'ولي الأمر'}`,
            time: new Intl.DateTimeFormat('ar-SA', { hour: '2-digit', minute: '2-digit' }).format(new Date()),
            type: 'leavePass',
            leavePassId: leavePass.id,
            forTeacherIds: [teacherForSend.id],
            urgent: true,
          },
          ...prev,
        ].slice(0, 30));
      }
    }
    setSchools((prev) => prev.map((school) => school.id !== selectedSchool.id ? school : ({
      ...school,
      leavePasses: getLeavePasses(school).map((item) => String(item.id) !== String(leavePassId) ? item : { ...item,
        status: target === 'teacher' ? 'sent-system' : item.status,
        sentAt: new Date().toISOString(),
        sentByName: actorName,
        sendMode: mode,
        lastNotifiedTarget: target,
        timeline: [createLeavePassEvent(target === 'teacher' ? `sent-system-${target}` : `notified-${target}`, actorName, `تم إشعار ${targetLabel}${target === 'guardian' ? ' عبر النظام' : ''}`), ...getLeavePassTimeline(item)],
      }),
    })));
    pushNotification('الاستئذان', `تم إشعار ${targetLabel} بخصوص الطالب ${leavePass.studentName}.`);
    // إضافة تنبيه للمعلم عند إرسال الاستئذان له
    if (target === 'teacher') {
      const teacherUser = (users || []).find((u) => Number(u.schoolId) === Number(selectedSchool.id) && String(u.role) === 'teacher' && (String(u.id) === String(leavePass.teacherUserId || leavePass.teacherId || '') || u.name === leavePass.teacherName));
      if (teacherUser) {
        setNotifications((prev) => [
          {
            id: Date.now(),
            title: '🚨 طلب استئذان جديد',
            body: `الطالب ${leavePass.studentName} من ${leavePass.className || leavePass.companyName || 'فصله'} — ${leavePass.destination === 'agent' ? 'الوكيل' : leavePass.destination === 'counselor' ? 'المرشد' : 'ولي الأمر'}`,
            time: new Intl.DateTimeFormat('ar-SA', { hour: '2-digit', minute: '2-digit' }).format(new Date()),
            type: 'leavePass',
            leavePassId: leavePass.id,
            forTeacherIds: [teacherUser.id],
            urgent: true,
          },
          ...prev,
        ].slice(0, 30));
      }
    }
    return { ok: true, message: target === 'teacher' ? 'تم إرسال رابط الاستئذان إلى المعلم عبر النظام.' : `تم إشعار ${targetLabel} بنجاح.` };
  };

  const quickAction = () => {
    if (canAccessPermission(currentUser, "actions")) return setActivePage("actions");
    if (canAccessPermission(currentUser, "attendance")) return setActivePage("attendance");
    if (canAccessPermission(currentUser, "students")) return setActivePage("students");
    if (canAccessPermission(currentUser, "users")) return setActivePage("users");
    setActivePage(getDefaultLandingPage(currentUser));
  };

  const handleCreateLessonAttendanceSession = ({ dateIso, slotLabel, startTime, endTime, note }) => {
    if (!selectedSchool?.id) return { ok: false, message: 'لم يتم تحديد المدرسة.' };
    const session = {
      id: `lesson-${Date.now()}`,
      dateIso: String(dateIso || getTodayIso()),
      slotLabel: String(slotLabel || 'الحصة').trim() || 'الحصة',
      startTime: String(startTime || '').trim(),
      endTime: String(endTime || '').trim(),
      note: String(note || '').trim(),
      createdAt: new Date().toISOString(),
      createdById: currentUser?.id || null,
      createdByName: currentUser?.name || currentUser?.username || 'الإدارة',
      status: 'open',
      submissions: [],
    };
    setSchools((prev) => prev.map((school) => school.id !== selectedSchool.id ? school : {
      ...school,
      lessonAttendanceSessions: [session, ...getLessonAttendanceSessions(school)],
    }));
    pushNotification('جلسة تحضير جديدة', `تم إنشاء ${buildLessonAttendanceSessionLabel(session)} وإتاحة رابطها للمعلمين.`);
    // إرسال تنبيه لجميع المعلمين النشطين في المدرسة
    const schoolTeachers = (users || []).filter((user) => Number(user.schoolId) === Number(selectedSchool.id) && String(user.role) === 'teacher' && String(user.status || 'نشط') === 'نشط');
    if (schoolTeachers.length) {
      const sessionLabel = buildLessonAttendanceSessionLabel(session);
      setNotifications((prev) => [
        { id: Date.now() + 1, title: 'طلب تحضير حصة', body: `طلب منك المدير تحضير ${sessionLabel}. افتح صفحة تحضير الحصص للبدء.`, time: new Intl.DateTimeFormat('ar-SA', { hour: '2-digit', minute: '2-digit' }).format(new Date()), forTeacherIds: schoolTeachers.map((t) => t.id) },
        ...prev,
      ].slice(0, 30));
    }
    return { ok: true, session, message: 'تم إنشاء جلسة التحضير.' };
  };

  const handleUpdateLessonAttendanceSessionStatus = (sessionId, status) => {
    if (!selectedSchool?.id) return;
    setSchools((prev) => prev.map((school) => school.id !== selectedSchool.id ? school : {
      ...school,
      lessonAttendanceSessions: getLessonAttendanceSessions(school).map((session) => String(session.id) !== String(sessionId) ? session : { ...session, status, closedAt: status === 'closed' ? new Date().toISOString() : session.closedAt }),
    }));
    pushNotification(status === 'closed' ? 'إغلاق جلسة التحضير' : 'تحديث جلسة التحضير', `تم ${status === 'closed' ? 'إغلاق' : 'تحديث'} الجلسة بنجاح.`);
  };

  const handleDeleteLessonAttendanceSession = async (sessionId) => {
    if (!selectedSchool?.id) return;
    const nextSchools = schools.map((school) => school.id !== selectedSchool.id ? school : {
      ...school,
      lessonAttendanceSessions: getLessonAttendanceSessions(school).filter((session) => String(session.id) !== String(sessionId)),
    });
    setSchools(nextSchools);
    pushNotification('حذف جلسة التحضير', 'تم حذف الجلسة بنجاح.');
    // حفظ فوري على السيرفر لمنع عودة الجلسة بعد تحديث الصفحة
    try {
      const token = getSessionToken();
      if (token) {
        const nextState = { ...sharedState, schools: nextSchools };
        await apiRequest('/api/state/save', { method: 'POST', token, body: { state: nextState } });
      }
    } catch (e) {
      console.error('خطأ في حفظ حذف الجلسة:', e);
    }
  };

  const handleSubmitLessonAttendanceSession = async ({ sessionId, classKey, acknowledgement, absentStudentIds = [] }) => {
    if (!selectedSchool?.id || !currentUser) return { ok: false, message: 'لم يتم العثور على الجلسة أو المستخدم.' };
    const companyRows = getUnifiedCompanyRows(selectedSchool, { preferStructure: true });
    const classRow = companyRows.find((row) => getClassroomKeyFromCompanyRow(row) === String(classKey));
    const students = getStudentsForLessonClassroom(selectedSchool, classKey);
    if (!classRow || !students.length) return { ok: false, message: 'الفصل المحدد لا يحتوي طلابًا.' };
    const absentSet = new Set((absentStudentIds || []).map((id) => String(id)));
    const absentStudents = students.filter((student) => absentSet.has(String(student.id))).map((student) => ({ id: student.id, name: student.name, studentNumber: student.studentNumber || '' }));
    const presentStudents = students.filter((student) => !absentSet.has(String(student.id)));
    const submission = {
      id: `submission-${Date.now()}`,
      teacherId: currentUser.id,
      teacherName: currentUser.name || currentUser.username || 'معلم',
      classKey: String(classKey),
      className: classRow.name || classRow.className || 'فصل',
      totalStudents: students.length,
      absentCount: absentStudents.length,
      presentCount: Math.max(students.length - absentStudents.length, 0),
      absentStudentIds: absentStudents.map((student) => student.id),
      presentStudentIds: presentStudents.map((student) => student.id),
      allStudentIds: students.map((student) => student.id),
      absentStudents,
      submittedAt: new Date().toISOString(),
      acknowledged: Boolean(acknowledgement),
    };
    // تطبيق نظام نقاط الحضور التلقائي إذا كان مفعّلاً
    const aps = settings?.attendancePointsSystem;
    const apsEnabled = Boolean(aps?.enabled);
    setSchools((prev) => prev.map((school) => {
      if (school.id !== selectedSchool.id) return school;
      // تحديث جلسات التحضير
      const updatedSchool = {
        ...school,
        lessonAttendanceSessions: getLessonAttendanceSessions(school).map((session) => {
          if (String(session.id) !== String(sessionId)) return session;
          const existing = (session.submissions || []).filter((item) => !(String(item.teacherId) === String(currentUser.id) && String(item.classKey) === String(classKey)));
          return { ...session, submissions: [submission, ...existing] };
        }),
      };
      // تطبيق النقاط إذا كان النظام مفعّلاً
      if (!apsEnabled) return updatedSchool;
      const dailyPts = safeNumber(aps?.dailyPresencePoints ?? 5);
      const absentDeduct = safeNumber(aps?.absentDeductPoints ?? 3);
      const lateDeduct = safeNumber(aps?.lateDeductPoints ?? 3);
      // نطبق الخصومات على الغائبين فقط (الحاضرون يحتفظون بنقاطهم التلقائية)
      let schoolWithPoints = updatedSchool;
      absentStudents.forEach((absentStudent) => {
        const totalDeduct = dailyPts + absentDeduct;
        schoolWithPoints = applyPointsToUnifiedStudent(schoolWithPoints, absentStudent.id, -totalDeduct, 'غائب', { actorName: currentUser?.name || currentUser?.username || 'معلم', actorRole: currentUser?.role || 'teacher', actionType: 'absence', note: 'غياب مسجّل من تحضير الحصة' });
      });
      return schoolWithPoints;
    }));
    pushNotification('تحضير حصة', `أتم ${currentUser.name || currentUser.username} تحضير ${submission.className} في ${selectedSchool.name}.`);
    // حفظ التحضير على الخادم
    try {
      const token = getSessionToken();
      const serverResp = await apiRequest(`/api/lesson-sessions/${sessionId}/submit`, {
        method: 'POST',
        token,
        body: { schoolId: selectedSchool.id, submission },
      });
      // ✅ إصلاح: تطبيق state السيرفر لضمان التزامن الكامل مع شاشة العرض
      if (serverResp?.state) {
        applyServerStatePayload(serverResp.state, loadUiState());
      }
    } catch (err) {
      console.error('فشل حفظ التحضير على الخادم:', err);
    }
    return { ok: true, submission, message: `تم اعتماد التحضير لفصل ${submission.className}.` };
  };


  const handleMarkLessonAttendanceSessionOpened = (sessionId, teacherId) => {
    if (!selectedSchool?.id || !teacherId) return;
    setSchools((prev) => prev.map((school) => school.id !== selectedSchool.id ? school : {
      ...school,
      lessonAttendanceSessions: getLessonAttendanceSessions(school).map((session) => {
        if (String(session.id) !== String(sessionId)) return session;
        const invites = Array.isArray(session.teacherInvites) ? session.teacherInvites : [];
        const existing = invites.find((item) => String(item.teacherId) === String(teacherId));
        const nextInvite = { ...(existing || {}), teacherId, openedAt: existing?.openedAt || new Date().toISOString() };
        const rest = invites.filter((item) => String(item.teacherId) !== String(teacherId));
        return { ...session, teacherInvites: [nextInvite, ...rest] };
      }),
    }));
  };

  const handleSendLessonAttendanceSessionInvites = async (sessionId, teacherIds = []) => {
    if (!selectedSchool?.id || !currentUser) return { ok: false, message: 'لا توجد مدرسة محددة.' };
    const targets = (users || []).filter((user) => Number(user.schoolId) === Number(selectedSchool.id) && String(user.role) === 'teacher' && teacherIds.map((id) => String(id)).includes(String(user.id)));
    if (!targets.length) return { ok: false, message: 'حدد معلمًا واحدًا على الأقل.' };
    const session = getLessonAttendanceSessions(selectedSchool).find((item) => String(item.id) === String(sessionId));
    const message = `نأمل تنفيذ تحضير ${buildLessonAttendanceSessionLabel(session)} عبر الرابط التالي:
${buildLessonSessionLink(sessionId)}
يرجى اختيار الفصل يدويًا ثم اعتماد التحضير.`;
    const result = await handleSendSchoolMessage({ audience: 'selectedTeachers', audienceLabel: 'معلمون محددون', channel: 'internal', subject: `رابط ${buildLessonAttendanceSessionLabel(session)}`, message, recipientUserIds: targets.map((item) => item.id), sendMode: 'now' });
    if (!result?.ok) return result;
    setSchools((prev) => prev.map((school) => school.id !== selectedSchool.id ? school : {
      ...school,
      lessonAttendanceSessions: getLessonAttendanceSessions(school).map((item) => {
        if (String(item.id) !== String(sessionId)) return item;
        const now = new Date().toISOString();
        const invites = Array.isArray(item.teacherInvites) ? item.teacherInvites : [];
        const mapped = targets.map((teacher) => {
          const existing = invites.find((entry) => String(entry.teacherId) === String(teacher.id)) || {};
          return { ...existing, teacherId: teacher.id, teacherName: teacher.name || teacher.username || 'معلم', mobile: teacher.mobile || '', sentAt: now, channel: 'whatsapp' };
        });
        const others = invites.filter((entry) => !targets.some((teacher) => String(teacher.id) === String(entry.teacherId)));
        return { ...item, targetTeacherIds: targets.map((teacher) => teacher.id), teacherInvites: [...mapped, ...others] };
      }),
    }));
    // إضافة تنبيه للمعلمين المستهدفين
    const sessionLabel = buildLessonAttendanceSessionLabel(session);
    setNotifications((prev) => [
      { id: Date.now(), title: 'تحضير حصة جديد', body: `طلب منك المدير تحضير ${sessionLabel}. افتح صفحة تحضير الحصص للبدء.`, time: new Intl.DateTimeFormat('ar-SA', { hour: '2-digit', minute: '2-digit' }).format(new Date()), forTeacherIds: targets.map((t) => t.id) },
      ...prev,
    ].slice(0, 30));
    return { ok: true, message: `تم إرسال الجلسة إلى ${targets.length} معلم/ـة عبر واتساب.` };
  };

  const handleSaveRewardStoreItem = (payload = {}) => {
    if (!selectedSchool?.id) return { ok: false, message: 'لم يتم تحديد المدرسة.' };
    const item = {
      id: `reward-${Date.now()}`,
      title: String(payload.title || '').trim(),
      pointsCost: 0,
      image: String(payload.image || '').trim(),
      note: String(payload.note || '').trim(),
      quantity: Math.max(1, Number(payload.quantity || 1)),
      remainingQuantity: Math.max(1, Number(payload.quantity || 1)),
      sourceType: String(payload.sourceType || 'school'),
      donorName: String(payload.donorName || '').trim(),
      showDonorName: payload.showDonorName !== false,
      showOnScreens: payload.showOnScreens !== false,
      featured: payload.featured === true,
      displayPriority: safeNumber(payload.displayPriority || 0, 0),
      isActive: true,
      approvalStatus: 'awaiting_receipt',
      createdAt: new Date().toISOString(),
      createdById: currentUser?.id || null,
      createdByName: currentUser?.name || currentUser?.username || 'الإدارة',
    };
    if (!item.title || !item.quantity) return { ok: false, message: 'أدخل اسم الجائزة والكمية.' };
    setSchools((prev) => prev.map((school) => school.id !== selectedSchool.id ? school : {
      ...school,
      rewardStore: prependRewardStoreNotification({ ...getRewardStore(school), items: [item, ...getRewardStore(school).items] }, { type: 'stock', title: 'جائزة جديدة في المخزون', body: `تم تسجيل الجائزة ${item.title} بكمية ${item.quantity} في مخزون المدرسة.`, schoolId: school.id, itemId: item.id, itemTitle: item.title, createdByName: currentUser?.name || currentUser?.username || 'الإدارة', audience: 'admin' }),
    }));
    pushNotification('متجر النقاط', `تم تسجيل الجائزة ${item.title} في المخزون بانتظار الاستلام والاعتماد في ${selectedSchool.name}.`);
    return { ok: true, item, message: 'تم حفظ الجائزة في المخزون بانتظار الاستلام والاعتماد.' };
  };

  const handleDeleteRewardStoreItem = (itemId) => {
    if (!selectedSchool?.id) return;
    setSchools((prev) => prev.map((school) => school.id !== selectedSchool.id ? school : {
      ...school,
      rewardStore: {
        ...getRewardStore(school),
        items: getRewardStore(school).items.filter((item) => String(item.id) !== String(itemId)),
      },
    }));
  };

  const handleDecideRewardStoreProposal = (proposalId, decision = 'approved', decisionNote = '') => {
    if (!selectedSchool?.id) return { ok: false, message: 'لم يتم تحديد المدرسة.' };
    let changed = false;
    setSchools((prev) => prev.map((school) => {
      if (school.id !== selectedSchool.id) return school;
      const store = getRewardStore(school);
      const proposals = store.parentProposals.map((proposal) => {
        if (String(proposal.id) !== String(proposalId)) return proposal;
        changed = true;
        return { ...proposal, status: decision, decisionAt: new Date().toISOString(), decisionByName: currentUser?.name || currentUser?.username || 'المدير', decisionNote: String(decisionNote || '').trim() };
      });
      let items = store.items;
      const approvedProposal = proposals.find((item) => String(item.id) === String(proposalId) && item.status === 'approved');
      if (approvedProposal && !items.some((item) => String(item.linkedProposalId || '') === String(proposalId))) {
        items = [{
          id: `reward-${Date.now()}`,
          title: approvedProposal.title,
          pointsCost: 0,
          image: approvedProposal.image || '',
          note: approvedProposal.note || '',
          quantity: Math.max(1, Number(approvedProposal.quantity || 1)),
          remainingQuantity: Math.max(1, Number(approvedProposal.quantity || 1)),
          sourceType: 'parent',
          donorName: String(approvedProposal.donorName || approvedProposal.guardianName || 'ولي الأمر').trim(),
          showDonorName: approvedProposal.showDonorName !== false,
          showOnScreens: approvedProposal.showOnScreens !== false,
          featured: approvedProposal.featured === true,
          displayPriority: safeNumber(approvedProposal.displayPriority || 0, 0),
          isActive: true,
          approvalStatus: 'awaiting_receipt',
          linkedProposalId: approvedProposal.id,
          createdAt: new Date().toISOString(),
          createdByName: approvedProposal.guardianName || 'ولي الأمر',
        }, ...items];
      }
      const nextStore = prependRewardStoreNotification({ ...store, parentProposals: proposals, items }, { type: decision === 'approved' ? 'proposal-approved' : 'proposal-rejected', title: decision === 'approved' ? 'اعتماد مقترح ولي الأمر' : 'رفض مقترح ولي الأمر', body: decision === 'approved' ? `تم تحويل مقترح الجائزة إلى المخزون بانتظار الاستلام والاعتماد.` : `تم رفض مقترح جائزة مقدم من ولي الأمر.`, schoolId: school.id, createdByName: currentUser?.name || currentUser?.username || 'المدير', audience: 'admin' });
      return { ...school, rewardStore: nextStore };
    }));
    if (!changed) return { ok: false, message: 'تعذر العثور على المقترح.' };
    pushNotification('متجر النقاط', decision === 'approved' ? 'تم قبول المقترح وتحويله إلى المخزون بانتظار الاستلام والاعتماد.' : 'تم رفض مقترح ولي الأمر.');
    return { ok: true, message: decision === 'approved' ? 'تم قبول المقترح وتحويله إلى المخزون بانتظار الاستلام والاعتماد.' : 'تم رفض المقترح.' };
  };
  const handleActivateRewardStoreItem = (itemId, payload = {}) => {
    if (!selectedSchool?.id) return { ok: false, message: 'لم يتم تحديد المدرسة.' };
    const pointsCost = Math.max(1, Number(payload.pointsCost || 0));
    if (!pointsCost) return { ok: false, message: 'حدد النقاط المعتمدة للجائزة أولًا.' };
    let changed = false;
    setSchools((prev) => prev.map((school) => {
      if (school.id !== selectedSchool.id) return school;
      const store = getRewardStore(school);
      const items = store.items.map((entry) => {
        if (String(entry.id) !== String(itemId)) return entry;
        changed = true;
        return {
          ...normalizeRewardStoreItem(entry),
          pointsCost,
          approvalStatus: Number(entry.remainingQuantity ?? entry.quantity ?? 0) > 0 ? 'active' : 'depleted',
          receivedAt: new Date().toISOString(),
          activatedAt: new Date().toISOString(),
          activatedByName: currentUser?.name || currentUser?.username || 'المدير',
          activationNote: String(payload.note || '').trim(),
          showOnScreens: payload.showOnScreens !== undefined ? payload.showOnScreens : (entry.showOnScreens !== false),
          featured: payload.featured !== undefined ? payload.featured : (entry.featured === true),
          displayPriority: payload.displayPriority !== undefined ? safeNumber(payload.displayPriority || 0, 0) : safeNumber(entry.displayPriority || 0, 0),
        };
      });
      return { ...school, rewardStore: prependRewardStoreNotification({ ...store, items }, { type: 'item-activated', title: 'اعتماد جائزة في المتجر', body: `تم اعتماد الجائزة بالنقاط المحددة وإظهارها في المتجر.`, schoolId: school.id, itemId: itemId, createdByName: currentUser?.name || currentUser?.username || 'المدير', audience: 'admin' }) };
    }));
    if (!changed) return { ok: false, message: 'تعذر العثور على الجائزة.' };
    pushNotification('متجر النقاط', 'تم اعتماد الجائزة وإظهارها في المتجر بالنقاط المحددة من المدير.');
    return { ok: true, message: 'تم اعتماد الجائزة وإظهارها في المتجر.' };
  };

  const handleEditRewardStoreItem = (itemId, payload = {}) => {
    if (!selectedSchool?.id) return { ok: false, message: 'لم يتم تحديد المدرسة.' };
    let changed = false;
    setSchools((prev) => prev.map((school) => {
      if (school.id !== selectedSchool.id) return school;
      const store = getRewardStore(school);
      const items = store.items.map((entry) => {
        if (String(entry.id) !== String(itemId)) return entry;
        changed = true;
        return {
          ...normalizeRewardStoreItem(entry),
          ...(payload.title !== undefined ? { title: payload.title } : {}),
          ...(payload.pointsCost !== undefined ? { pointsCost: safeNumber(payload.pointsCost, 0) } : {}),
          ...(payload.quantity !== undefined ? { quantity: safeNumber(payload.quantity, 1) } : {}),
          ...(payload.note !== undefined ? { note: payload.note } : {}),
          ...(payload.image !== undefined ? { image: payload.image } : {}),
          ...(payload.showOnScreens !== undefined ? { showOnScreens: payload.showOnScreens } : {}),
          ...(payload.featured !== undefined ? { featured: payload.featured } : {}),
          ...(payload.displayPriority !== undefined ? { displayPriority: safeNumber(payload.displayPriority, 0) } : {}),
        };
      });
      return { ...school, rewardStore: prependRewardStoreNotification({ ...store, items }, { type: 'item-edited', title: 'تعديل جائزة', body: `تم تعديل بيانات الجائزة في المتجر.`, schoolId: school.id, itemId, createdByName: currentUser?.name || currentUser?.username || 'المدير', audience: 'admin' }) };
    }));
    if (!changed) return { ok: false, message: 'تعذر العثور على الجائزة.' };
    return { ok: true, message: 'تم تعديل الجائزة بنجاح.' };
  };
  const handleUpdateRewardStoreItemMeta = (itemId, payload = {}) => {
    if (!selectedSchool?.id) return { ok: false, message: 'لم يتم تحديد المدرسة.' };
    let changed = false;
    setSchools((prev) => prev.map((school) => {
      if (school.id !== selectedSchool.id) return school;
      const store = getRewardStore(school);
      const items = store.items.map((entry) => {
        if (String(entry.id) !== String(itemId)) return entry;
        changed = true;
        return {
          ...normalizeRewardStoreItem(entry),
          showOnScreens: payload.showOnScreens !== undefined ? payload.showOnScreens : (entry.showOnScreens !== false),
          featured: payload.featured !== undefined ? payload.featured : (entry.featured === true),
          displayPriority: payload.displayPriority !== undefined ? safeNumber(payload.displayPriority || 0, 0) : safeNumber(entry.displayPriority || 0, 0),
        };
      });
      return { ...school, rewardStore: prependRewardStoreNotification({ ...store, items }, { type: 'item-screen-settings', title: 'تحديث عرض الجائزة في الشاشات', body: 'تم تحديث إعدادات ظهور الجائزة في الشاشات.', schoolId: school.id, itemId, createdByName: currentUser?.name || currentUser?.username || 'المدير', audience: 'admin' }) };
    }));
    if (!changed) return { ok: false, message: 'تعذر العثور على الجائزة.' };
    return { ok: true, message: 'تم تحديث إعدادات العرض في الشاشات.' };
  };

  const handleCreateRewardRedemptionRequest = (payload = {}) => {
    if (!selectedSchool?.id) return { ok: false, message: 'لم يتم تحديد المدرسة.' };
    const student = getUnifiedSchoolStudents(selectedSchool, { includeArchived: false, preferStructure: true }).find((item) => String(item.id) === String(payload.studentId || ''));
    const item = getApprovedRewardStoreItems(selectedSchool).find((entry) => String(entry.id) === String(payload.itemId || ''));
    if (item && Number(item.remainingQuantity || 0) <= 0) return { ok: false, message: 'نفدت كمية هذه الجائزة حاليًا.' };
    if (!student || !item) return { ok: false, message: 'اختر الطالب والجائزة أولًا.' };
    if (Number(student.points || 0) < Number(item.pointsCost || 0)) return { ok: false, message: 'رصيد الطالب لا يكفي لهذه الجائزة.' };
    const isStudentRequest = currentUser?.role === 'student';
    const isPrincipalRequest = currentUser?.role === 'principal';
    const createdByLabel = isStudentRequest
      ? 'الطالب'
      : isPrincipalRequest
        ? 'مدير المدرسة'
        : ['supervisor', 'teacher'].includes(String(currentUser?.role || ''))
          ? 'موظف مفوض'
          : 'إدارة المدرسة';
    const request = {
      id: `redeem-${Date.now()}`,
      itemId: item.id,
      itemTitle: item.title,
      pointsCost: Number(item.pointsCost || 0),
      studentId: student.id,
      studentName: student.name || student.fullName || 'طالب',
      className: student.className || student.companyName || '',
      status: 'pending',
      note: String(payload.note || '').trim(),
      createdAt: new Date().toISOString(),
      createdByLabel,
      createdByName: currentUser?.name || currentUser?.username || createdByLabel,
      createdById: currentUser?.id || null,
      requestChannel: isStudentRequest ? 'student' : isPrincipalRequest ? 'principal' : ['supervisor', 'teacher'].includes(String(currentUser?.role || '')) ? 'delegate' : 'admin',
    };
    setSchools((prev) => prev.map((school) => school.id !== selectedSchool.id ? school : ({
      ...school,
      rewardStore: prependRewardStoreNotification({ ...getRewardStore(school), redemptionRequests: [request, ...getRewardStore(school).redemptionRequests] }, { type: 'redemption-request', title: 'طلب استبدال جديد', body: `تم إنشاء طلب استبدال للطالب ${request.studentName} على الجائزة ${request.itemTitle}.`, schoolId: school.id, studentId: request.studentId, itemId: request.itemId, itemTitle: request.itemTitle, requestId: request.id, createdByName: currentUser?.name || currentUser?.username || request.createdByLabel, audience: 'admin' }),
    })));
    pushNotification('متجر النقاط', `تم إنشاء طلب استبدال جديد للطالب ${request.studentName}.`);
    return { ok: true, request, message: 'تم إرسال طلب الاستبدال بانتظار اعتماد الإدارة.' };
  };

  const handleDecideRewardRedemption = (requestId, decision = 'approved', decisionNote = '') => {
    if (!selectedSchool?.id) return { ok: false, message: 'لم يتم تحديد المدرسة.' };
    let changed = false;
    let insufficient = false;
    let invalidDelivery = false;
    setSchools((prev) => prev.map((school) => {
      if (school.id !== selectedSchool.id) return school;
      const store = getRewardStore(school);
      const targetBefore = (store.redemptionRequests || []).find((request) => String(request.id) === String(requestId));
      if (decision === 'delivered' && String(targetBefore?.status || '') !== 'approved') {
        invalidDelivery = true;
        return school;
      }
      const requests = (store.redemptionRequests || []).map((request) => {
        if (String(request.id) !== String(requestId)) return request;
        changed = true;
        if (decision === 'delivered') {
          return {
            ...request,
            status: 'delivered',
            deliveredAt: new Date().toISOString(),
            deliveredByName: currentUser?.name || currentUser?.username || 'الإدارة',
            deliveryNote: String(decisionNote || '').trim() || request.deliveryNote || '',
          };
        }
        return { ...request, status: decision, decisionAt: new Date().toISOString(), decisionByName: currentUser?.name || currentUser?.username || 'الإدارة', decisionNote: String(decisionNote || '').trim() };
      });
      if (decision === 'approved') {
        const target = requests.find((request) => String(request.id) === String(requestId));
        const students = getUnifiedSchoolStudents(school, { includeArchived: false, preferStructure: true });
        const student = students.find((item) => String(item.id) === String(target?.studentId || ''));
        const targetItem = (store.items || []).map((entry) => normalizeRewardStoreItem(entry)).find((entry) => String(entry.id) === String(target?.itemId || ''));
        if (!student || Number(student.points || 0) < Number(target?.pointsCost || 0) || !targetItem || Number(targetItem.remainingQuantity || 0) <= 0) {
          insufficient = true;
          return school;
        }
        const nextSchool = applyPointsToUnifiedStudent(school, target.studentId, -Math.abs(Number(target.pointsCost || 0)), `استبدال جائزة: ${target.itemTitle}`, { actorName: currentUser?.name || currentUser?.username || 'الإدارة', actorRole: currentUser?.role || 'principal', actionType: 'program', note: 'استبدال من متجر النقاط' });
        return { ...nextSchool, rewardStore: prependRewardStoreNotification({ ...getRewardStore(nextSchool), redemptionRequests: requests }, { type: 'redemption-approved', title: 'اعتماد طلب الاستبدال', body: `تم اعتماد طلب استبدال الجائزة ${target?.itemTitle || ''} للطالب ${target?.studentName || ''}.`, schoolId: nextSchool.id, studentId: target?.studentId || null, itemId: target?.itemId || null, itemTitle: target?.itemTitle || '', requestId: target?.id || null, createdByName: currentUser?.name || currentUser?.username || 'الإدارة', audience: 'admin' }) };
      }
      if (decision === 'delivered') {
        const target = requests.find((request) => String(request.id) === String(requestId));
        const items = (store.items || []).map((entry) => {
          if (String(entry.id) !== String(target?.itemId || '')) return entry;
          const normalized = normalizeRewardStoreItem(entry);
          const remainingQuantity = Math.max(0, Number(normalized.remainingQuantity || normalized.quantity || 0) - 1);
          return { ...normalized, remainingQuantity, approvalStatus: remainingQuantity > 0 ? 'active' : 'depleted' };
        });
        return { ...school, rewardStore: prependRewardStoreNotification({ ...store, redemptionRequests: requests, items }, { type: 'redemption-delivered', title: 'تأكيد تسليم الجائزة', body: `تم تسليم الجائزة ${target?.itemTitle || ''} للطالب ${target?.studentName || ''}.`, schoolId: school.id, studentId: target?.studentId || null, itemId: target?.itemId || null, itemTitle: target?.itemTitle || '', requestId: target?.id || null, createdByName: currentUser?.name || currentUser?.username || 'الإدارة', audience: 'admin' }) };
      }
      return { ...school, rewardStore: prependRewardStoreNotification({ ...store, redemptionRequests: requests }, { type: 'redemption-rejected', title: 'رفض طلب الاستبدال', body: `تم رفض طلب الاستبدال مع حفظ الملاحظة الإدارية.`, schoolId: school.id, requestId: requestId, createdByName: currentUser?.name || currentUser?.username || 'الإدارة', audience: 'admin' }) };
    }));
    if (invalidDelivery) return { ok: false, message: 'لا يمكن تأكيد التسليم إلا بعد اعتماد الطلب.' };
    if (insufficient) return { ok: false, message: 'رصيد الطالب لم يعد كافيًا عند الاعتماد.' };
    if (!changed) return { ok: false, message: 'تعذر العثور على طلب الاستبدال.' };
    pushNotification('متجر النقاط', decision === 'approved' ? 'تم اعتماد طلب الاستبدال وخصم النقاط.' : decision === 'delivered' ? 'تم تأكيد تسليم الجائزة.' : 'تم رفض طلب الاستبدال.');
    return { ok: true, message: decision === 'approved' ? 'تم اعتماد الطلب وخصم النقاط.' : decision === 'delivered' ? 'تم تأكيد تسليم الجائزة.' : 'تم رفض طلب الاستبدال.' };
  };



  const renderPage = () => {
    if (!currentUser) return null;
    if (currentUser.role === "student") return <StudentRolePage selectedSchool={selectedSchool} currentUser={currentUser} onCreateRewardRedemptionRequest={handleCreateRewardRedemptionRequest} />;
    switch (activePage) {
      case "schools":
        return <SchoolsPage schools={schools} selectedSchoolId={selectedSchoolId} setSelectedSchoolId={setSelectedSchoolId} onAddSchool={handleAddSchool} onDeleteSchool={handleDeleteSchool} onExportSchool={exportSchoolSnapshot} onUpdateSchoolBranding={handleUpdateSchoolBranding} onEditSchool={handleEditSchool} />;
      case "companies":
        return <CompaniesPage selectedSchool={selectedSchool} onAddCompany={handleAddCompany} onDeleteCompany={handleDeleteCompany} onAwardInitiative={handleAwardInitiative} />;
      case "students":
        return <StudentsPage selectedSchool={selectedSchool} onAddStudent={handleAddStudent} onDeleteStudent={handleDeleteStudent} onAwardBehavior={handleAwardBehavior} onEnrollFace={handleEnrollFace} onEnrollFaceDataUrl={handleEnrollFaceDataUrl} onClearFace={handleClearFace} onDownloadStudentCard={handleDownloadStudentCard} onDownloadAllCards={handleDownloadAllCards} />;
      case "attendance":
        if (currentUser?.role === "gate") return <GateAttendancePage selectedSchool={selectedSchool} />;
        return <AttendancePage selectedSchool={selectedSchool} currentUser={currentUser} attendanceMethod={attendanceMethod} setAttendanceMethod={setAttendanceMethod} scanLog={scanLog} actionLog={actionLog} settings={settings} onScan={handleScan} onFaceScanFile={handleFaceScanFile} onFaceScanDataUrl={handleFaceScanDataUrl} onCreateGateLink={handleCreateGateLink} onDeleteGateLink={handleDeleteGateLink} onUpdateGateLink={handleUpdateGateLink} onCreateScreenLink={handleCreateScreenLink} onDeleteScreenLink={handleDeleteScreenLink} onUpdateScreenLink={handleUpdateScreenLink} onSaveAttendanceBinding={handleSaveAttendanceBinding} />;
      case "actions":
        return <StudentActionsPage selectedSchool={selectedSchool} currentUser={currentUser} settings={settings} actionLog={actionLog} onResolveStudentByBarcode={resolveStudentByBarcode} onResolveStudentByManual={resolveStudentByManual} onResolveStudentByFaceFile={resolveStudentByFaceFile} onResolveStudentByFaceDataUrl={resolveStudentByFaceDataUrl} onApplyStudentAction={handleApplyStudentAction} onRecordProgramAction={handleRecordProgramExecution} />;
      case "points":
        return <PointsPage selectedSchool={selectedSchool} settings={settings} />;
      case "lessonAttendanceSessions":
        return <LessonAttendanceSessionsPage selectedSchool={selectedSchool} currentUser={currentUser} users={users} settings={selectedSchool?.settings} initialSessionId={lessonSessionIdFromUrl} onCreateSession={handleCreateLessonAttendanceSession} onCloseSession={handleUpdateLessonAttendanceSessionStatus} onDeleteSession={handleDeleteLessonAttendanceSession} onSubmitSession={handleSubmitLessonAttendanceSession} onSendSessionInvites={handleSendLessonAttendanceSessionInvites} onMarkSessionOpened={handleMarkLessonAttendanceSessionOpened} />;
      case "reports":
        return <ReportsPage schools={schools} scanLog={scanLog} actionLog={actionLog} gateSyncEvents={gateSyncEvents} selectedSchool={selectedSchool} settings={settings} executiveReport={executiveReport} onExportAttendance={exportAttendance} onExportStudents={exportStudents} onExportSchools={exportSchools} onExportBackup={exportBackup} />;
      case "deviceDisplays":
        return <DeviceDisplaysPage selectedSchool={selectedSchool} currentUser={currentUser} onCreateGateLink={handleCreateGateLink} onDeleteGateLink={handleDeleteGateLink} onUpdateGateLink={handleUpdateGateLink} onCreateScreenLink={handleCreateScreenLink} onDeleteScreenLink={handleDeleteScreenLink} onUpdateScreenLink={handleUpdateScreenLink} />;
      case "messages":
        return <MessagingCenterPage selectedSchool={selectedSchool} currentUser={currentUser} onSendMessage={handleSendSchoolMessage} onTestIntegration={handleTestMessagingIntegration} onSaveMessagingSettings={handleSaveMessagingSettings} onSaveMessageTemplate={handleSaveMessageTemplate} onDeleteMessageTemplate={handleDeleteMessageTemplate} onSaveMessageRule={handleSaveMessageRule} onToggleMessageRule={handleToggleMessageRule} />;
      case "leavePasses":
        return <LeavePassesPage selectedSchool={selectedSchool} currentUser={currentUser} users={users} initialPassId={leavePassIdFromUrl} onCreateLeavePass={handleCreateLeavePass} onSendLeavePass={handleSendLeavePass} onMarkViewed={handleMarkLeavePassViewed} onUpdateLeavePassStatus={handleUpdateLeavePassStatus} onAssignTeacher={handleAssignTeacherToPass} viewMode="main" />;
      case "leavePassAgentDesk":
        return <LeavePassesPage selectedSchool={selectedSchool} currentUser={currentUser} users={users} initialPassId={leavePassIdFromUrl} onCreateLeavePass={handleCreateLeavePass} onSendLeavePass={handleSendLeavePass} onMarkViewed={handleMarkLeavePassViewed} onUpdateLeavePassStatus={handleUpdateLeavePassStatus} onAssignTeacher={handleAssignTeacherToPass} viewMode="agent" />;
      case "leavePassCounselorDesk":
        return <LeavePassesPage selectedSchool={selectedSchool} currentUser={currentUser} users={users} initialPassId={leavePassIdFromUrl} onCreateLeavePass={handleCreateLeavePass} onSendLeavePass={handleSendLeavePass} onMarkViewed={handleMarkLeavePassViewed} onUpdateLeavePassStatus={handleUpdateLeavePassStatus} onAssignTeacher={handleAssignTeacherToPass} viewMode="counselor" />;
      case "securityDesk":
        return <SecurityDeskPage selectedSchool={selectedSchool} currentUser={currentUser} onUpdateLeavePassStatus={handleUpdateLeavePassStatus} />;
      case "leavePassGateDesk":
        return <LeavePassesPage selectedSchool={selectedSchool} currentUser={currentUser} users={users} initialPassId={leavePassIdFromUrl} onCreateLeavePass={handleCreateLeavePass} onSendLeavePass={handleSendLeavePass} onMarkViewed={handleMarkLeavePassViewed} onUpdateLeavePassStatus={handleUpdateLeavePassStatus} onAssignTeacher={handleAssignTeacherToPass} viewMode="gate" />;
      case "pointsRewards":
        return <PageErrorBoundary resetKey={`${selectedSchool?.id || 'none'}-pointsRewards`}><PointsRewardsConfigPage selectedSchool={selectedSchool} settings={settings} currentUser={currentUser} onSaveSettings={setSettings} /></PageErrorBoundary>;
      case "rewardStore":
        return <RewardStorePage selectedSchool={selectedSchool} currentUser={currentUser} onSaveItem={handleSaveRewardStoreItem} onDeleteItem={handleDeleteRewardStoreItem} onDecideProposal={handleDecideRewardStoreProposal} onCreateRedemptionRequest={handleCreateRewardRedemptionRequest} onDecideRedemption={handleDecideRewardRedemption} onActivateRewardItem={handleActivateRewardStoreItem} onUpdateRewardItemMeta={handleUpdateRewardStoreItemMeta} onEditItem={handleEditRewardStoreItem} />;
      case "schoolStructure":
        return <PageErrorBoundary resetKey={`${selectedSchool?.id || 'none'}-${activePage}`}><SchoolStructurePage selectedSchool={selectedSchool} schoolUsers={users.filter((user) => user.schoolId === selectedSchool?.id)} currentUser={currentUser} onSaveSchoolStructureProfile={handleSaveSchoolStructureProfile} onSaveSchoolStructureStageConfigs={handleSaveSchoolStructureStageConfigs} onGenerateSchoolStructureClassrooms={handleGenerateSchoolStructureClassrooms} onUpdateSchoolStructureClassroom={handleUpdateSchoolStructureClassroom} onDeleteSchoolStructureClassroom={handleDeleteSchoolStructureClassroom} onClearSchoolStructureClassroomStudents={handleClearSchoolStructureClassroomStudents} onAddStudentToSchoolStructureClassroom={handleAddStudentToSchoolStructureClassroom} onUpdateStudentInSchoolStructureClassroom={handleUpdateStudentInSchoolStructureClassroom} onArchiveStudentInSchoolStructureClassroom={handleArchiveStudentInSchoolStructureClassroom} onTransferStudentInSchoolStructureClassroom={handleTransferStudentInSchoolStructureClassroom} onImportStudentsToSchoolStructureClassroom={handleImportStudentsToSchoolStructureClassroom} onUpdateScreenLink={handleUpdateScreenLink} /></PageErrorBoundary>;
      case "users":
        return (
          <div className="space-y-6">
            <UsersPage users={users} schools={schools} currentUser={currentUser} selectedSchoolId={selectedSchool?.id} actionLog={actionLog} settings={settings} onAddUser={handleAddUser} onSelectForEdit={handleSelectUserForEdit} editingUserId={editingUserId} onToggleUserStatus={handleToggleUserStatus} onDeleteUser={handleDeleteUser} onUpdateSchoolAccess={handleUpdateSchoolAccess} onOpenAccountSecurity={() => setAccountSecurityOpen(true)} onOpenResetUserPassword={(user) => { setResetPasswordTargetUserId(user?.id || null); setResetUserPasswordOpen(true); }} />
            {editingUser && (
              <SectionCard title={`تحرير الحساب: ${editingUser.name}`} icon={Settings}>
                <UserEditor editingUser={editingUser} schools={schools} currentUser={currentUser} actionLog={actionLog} settings={settings} onSave={handleUpdateUser} onCancel={() => setEditingUserId(null)} />
              </SectionCard>
            )}
          </div>
        );
      case "parentsExecutive":
        return <ParentExecutiveSummaryPage currentUser={currentUser} selectedSchool={selectedSchool} onNavigate={setActivePage} />;
      case "nafisAnalytics":
        return <NafisDashboardPage selectedSchool={selectedSchool} currentUser={currentUser} />;
      case "nafisBank":
        return <NafisBankPage currentUser={currentUser} />;
      case "parentsAdmin":
        return <ParentAccountsPage currentUser={currentUser} selectedSchool={selectedSchool} onSendMessage={handleSendSchoolMessage} onNavigate={setActivePage} />;
      case "settings":
        return <SettingsPage selectedSchool={selectedSchool} settings={settings} attendanceMethod={attendanceMethod} users={users} schools={schools} currentUser={currentUser} onSaveSettings={setSettings} onRestoreBackup={restoreBackup} onResetData={resetData} onExportBackup={exportBackup} onImportStudents={handleImportStudentsFromExcel} onDownloadTemplate={downloadStudentImportTemplate} setAttendanceMethod={setAttendanceMethod} onUpdateSchoolBranding={handleUpdateSchoolBranding} />;
      case "platformAuth":
        return <PlatformAuthSettingsPage selectedSchool={selectedSchool} settings={settings} attendanceMethod={attendanceMethod} users={users} schools={schools} currentUser={currentUser} onSaveSettings={setSettings} onRestoreBackup={restoreBackup} onResetData={resetData} onExportBackup={exportBackup} onImportStudents={handleImportStudentsFromExcel} onDownloadTemplate={downloadStudentImportTemplate} setAttendanceMethod={setAttendanceMethod} />;
      case "classes":
        return <ClassesPage selectedSchool={selectedSchool} />;
      default:
        return <SchoolDashboard schools={schools} selectedSchool={selectedSchool} setSelectedSchoolId={setSelectedSchoolId} scanLog={scanLog} actionLog={actionLog} gateSyncEvents={gateSyncEvents} settings={settings} notifications={notifications} canSelectSchool={currentUser.role === "superadmin"} executiveReport={executiveReport} currentUser={currentUser} onCreateGateLink={handleCreateGateLink} onDeleteGateLink={handleDeleteGateLink} onCreateScreenLink={handleCreateScreenLink} onDeleteScreenLink={handleDeleteScreenLink} onUpdateScreenLink={handleUpdateScreenLink} onNavigate={setActivePage} />;
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
              <div className="flex h-14 w-14 items-center justify-center overflow-hidden rounded-3xl bg-white/20">
                {selectedSchool?.customBranding?.enabled && selectedSchool?.customBranding?.logoUrl
                  ? <img src={selectedSchool.customBranding.logoUrl} alt="شعار" className="h-full w-full object-contain p-1" />
                  : <Building2 className="h-7 w-7" />
                }
              </div>
              <Badge tone="blue">هيكل مؤسسي</Badge>
            </div>
            <div className="mt-4 text-2xl font-black leading-tight">
              {selectedSchool?.customBranding?.enabled && selectedSchool?.customBranding?.platformName
                ? selectedSchool.customBranding.platformName
                : settings.platformName
              }
            </div>
            <div className="mt-1.5 flex items-center gap-2">
              <span className="inline-flex items-center rounded-lg bg-white/15 px-2 py-0.5 font-mono text-[11px] font-bold text-white/90 ring-1 ring-white/20">
                {APP_VERSION}
              </span>
              <span className="text-[11px] text-white/60">{APP_VERSION_DATE}</span>
            </div>
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

          <nav className="mt-5 space-y-1">
            {(() => {
              // تجميع العناصر حسب المجموعة
              const rendered = [];
              let lastGroup = null;
              allowedNav.forEach((item) => {
                const currentGroup = item.group || null;
                // إضافة عنوان المجموعة عند التغيير
                if (currentGroup && currentGroup !== lastGroup) {
                  rendered.push(
                    <div key={"group-" + currentGroup} className="mt-4 mb-1 px-2">
                      <div className="flex items-center gap-2">
                        <div className="h-px flex-1 bg-slate-200" />
                        <span className="text-[11px] font-black tracking-wide text-slate-400">{currentGroup}</span>
                        <div className="h-px flex-1 bg-slate-200" />
                      </div>
                    </div>
                  );
                }
                lastGroup = currentGroup;
                const Icon = item.icon;
                const active = activePage === item.key;
                const badge = sidebarCounters?.[item.key];
                rendered.push(
                  <button key={item.key} onClick={() => setActivePage(item.key)} className={cx("flex w-full items-center justify-between rounded-2xl px-4 py-3 text-right transition", active ? "bg-sky-700 text-white shadow-sm" : "bg-white text-slate-700 ring-1 ring-slate-200 hover:bg-slate-50")}>
                    <div className="flex min-w-0 items-center gap-2">
                      <span className="font-bold">{item.label}</span>
                      {badge && !badge.hidden ? (
                        <span className={cx("inline-flex min-w-[1.75rem] items-center justify-center rounded-full px-2 py-0.5 text-[11px] font-black", badge.tone === 'rose' ? (active ? 'bg-white/20 text-white ring-1 ring-white/30' : 'bg-rose-100 text-rose-700 ring-1 ring-rose-200') : badge.tone === 'amber' ? (active ? 'bg-white/20 text-white ring-1 ring-white/30' : 'bg-amber-100 text-amber-700 ring-1 ring-amber-200') : badge.tone === 'green' ? (active ? 'bg-white/20 text-white ring-1 ring-white/30' : 'bg-emerald-100 text-emerald-700 ring-1 ring-emerald-200') : badge.tone === 'sky' ? (active ? 'bg-white/20 text-white ring-1 ring-white/30' : 'bg-sky-100 text-sky-700 ring-1 ring-sky-200') : (active ? 'bg-white/20 text-white ring-1 ring-white/30' : 'bg-slate-100 text-slate-600 ring-1 ring-slate-200'))}>{badge.value}</span>
                      ) : null}
                    </div>
                    <Icon className="h-5 w-5 shrink-0" />
                  </button>
                );
              });
              return rendered;
            })()}
          </nav>

          {currentUser && ["superadmin", "principal", "supervisor"].includes(currentUser.role) && (
            <div className="mt-4 rounded-3xl border border-slate-200 bg-white p-3">
              <div className="px-2 text-xs font-black text-slate-500">روابط تشغيل إضافية</div>
              <div className="mt-3 grid grid-cols-1 gap-2">
                <a href="/admin/parent-primary-requests" target="_blank" rel="noreferrer" className="inline-flex items-center justify-between rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-bold text-slate-700 transition hover:bg-slate-100">
                  <span className="inline-flex items-center gap-2"><span>طلبات أولياء الأمور</span>{(headerAlertsState?.pending || 0) > 0 ? <span className="inline-flex min-w-[1.75rem] items-center justify-center rounded-full bg-amber-100 px-2 py-0.5 text-[11px] font-black text-amber-700 ring-1 ring-amber-200">{headerAlertsState.pending > 99 ? '99+' : headerAlertsState.pending}</span> : null}</span>
                  <ExternalLink className="h-4 w-4" />
                </a>
                <a href="/parent" target="_blank" rel="noreferrer" className="inline-flex items-center justify-between rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-bold text-slate-700 transition hover:bg-slate-100">
                  <span>فتح بوابة ولي الأمر</span>
                  <ExternalLink className="h-4 w-4" />
                </a>
              </div>
            </div>
          )}

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
                      <Badge tone="violet">{getUnifiedSchoolStudents(selectedSchool, { includeArchived: false, preferStructure: true }).length} طالب</Badge>
                      <Badge tone="amber">{attendanceMethod === "barcode" ? "QR" : "بصمة وجه"}</Badge>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="text-sm text-slate-500">المدرسة الحالية</div>
                    <h1 className="mt-1 text-2xl font-black text-slate-800 md:text-3xl">{selectedSchool?.name || "—"}</h1>
                    <div className="mt-2 flex flex-wrap gap-2">
                      <Badge tone="green">{selectedSchool?.city || "—"}</Badge>
                      <Badge tone="blue">{getUnifiedSchoolStudents(selectedSchool, { includeArchived: false, preferStructure: true }).length} طالب</Badge>
                      <Badge tone="violet">{getUnifiedCompanyRows(selectedSchool, { preferStructure: true }).length} شركات</Badge>
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
                {canUseHeaderAlerts ? (
                  <div className="relative">
                    <button onClick={() => setHeaderAlertsOpen((value) => !value)} className="relative inline-flex items-center gap-2 rounded-2xl bg-slate-100 px-4 py-3 font-bold text-slate-700 ring-1 ring-slate-200 hover:bg-slate-200">
                      <Bell className="h-4 w-4" />
                      <span>الجرس</span>
                      {headerAlertsState.count > 0 ? <span className="inline-flex min-w-6 items-center justify-center rounded-full bg-rose-600 px-2 py-0.5 text-[11px] font-black text-white">{headerAlertsState.count > 99 ? '99+' : headerAlertsState.count}</span> : null}
                    </button>
                    {headerAlertsOpen ? (
                      <div className="absolute left-0 z-50 mt-3 w-[24rem] max-w-[88vw] overflow-hidden rounded-[1.75rem] border border-slate-200 bg-white shadow-2xl">
                        <div className="border-b border-slate-100 bg-slate-50 p-4">
                          <div className="flex items-center justify-between gap-3">
                            <div>
                              <div className="text-sm text-slate-500">{String(currentUser?.role || '') === 'teacher' ? 'تنبيهات المعلم' : 'تنبيهات الإدارة'}</div>
                              <div className="text-lg font-black text-slate-900">{String(currentUser?.role || '') === 'teacher' ? 'طلبات الاستئذان' : 'المتابعة السريعة'}</div>
                            </div>
                            <button onClick={() => setHeaderAlertsOpen(false)} className="rounded-2xl bg-white px-3 py-2 text-xs font-black text-slate-600 ring-1 ring-slate-200">إغلاق</button>
                          </div>
                          <div className="mt-3 grid grid-cols-3 gap-2 text-center text-xs font-bold">
                            <div className="rounded-2xl bg-white px-3 py-2 ring-1 ring-slate-200"><div className="text-slate-400">معلقة</div><div className="mt-1 text-slate-900">{headerAlertsState.pending}</div></div>
                            <div className="rounded-2xl bg-white px-3 py-2 ring-1 ring-slate-200"><div className="text-slate-400">تلقائي</div><div className="mt-1 text-slate-900">{headerAlertsState.autoApproved}</div></div>
                            <div className="rounded-2xl bg-white px-3 py-2 ring-1 ring-slate-200"><div className="text-slate-400">متعثر</div><div className="mt-1 text-slate-900">{headerAlertsState.failed}</div></div>
                          </div>
                        </div>
                        <div className="max-h-[26rem] overflow-y-auto p-4">
                          {headerAlertsState.loading ? <div className="rounded-2xl bg-slate-50 px-4 py-6 text-center text-sm font-bold text-slate-500">جارِ تحميل التنبيهات...</div> : null}
                          {!headerAlertsState.loading && headerAlertsState.error ? <div className="rounded-2xl bg-rose-50 px-4 py-4 text-sm font-bold text-rose-700 ring-1 ring-rose-100">{headerAlertsState.error}</div> : null}
                          {!headerAlertsState.loading && !headerAlertsState.error && !headerAlertsState.items.length ? <div className="rounded-2xl bg-slate-50 px-4 py-6 text-center text-sm font-bold text-slate-500">لا توجد تنبيهات جديدة الآن.</div> : null}
                          {!headerAlertsState.loading && !headerAlertsState.error ? (
                            <div className="space-y-3">
                              {headerAlertsState.items.map((item) => (
                                <button key={item.id} onClick={() => { setHeaderAlertsOpen(false); if (item.type === 'leavePass' || item.leavePassId) { setActivePage('leavePasses'); } else { setActivePage('leavePasses'); } }} className={cx('w-full rounded-2xl p-4 ring-1 text-right transition hover:brightness-95 cursor-pointer', item.tone === 'rose' ? 'bg-rose-50 text-rose-900 ring-rose-100' : item.tone === 'amber' ? 'bg-amber-50 text-amber-900 ring-amber-100' : 'bg-sky-50 text-sky-900 ring-sky-100')}>
                                  <div className="flex items-start justify-between gap-3">
                                    <div>
                                      <div className="font-black">{item.title}</div>
                                      <div className="mt-1 text-sm leading-7 opacity-90">{item.body}</div>
                                    </div>
                                    <Badge tone={item.tone === 'rose' ? 'rose' : item.tone === 'amber' ? 'amber' : 'blue'}>{item.time || 'الآن'}</Badge>
                                  </div>
                                </button>
                              ))}
                            </div>
                          ) : null}
                        </div>
                        <div className="border-t border-slate-100 bg-slate-50 p-3">
                          <div className="flex flex-wrap gap-2">
                            <button onClick={() => { setHeaderAlertsOpen(false); setActivePage('dashboard'); }} className="rounded-2xl bg-white px-4 py-2 text-sm font-bold text-slate-700 ring-1 ring-slate-200">فتح الرئيسية</button>
                            <button onClick={() => { setHeaderAlertsOpen(false); setActivePage('leavePasses'); }} className="rounded-2xl bg-emerald-600 px-4 py-2 text-sm font-bold text-white">فتح الاستئذان</button>
                            <button onClick={() => window.open('/admin/parent-primary-requests', '_blank', 'noopener,noreferrer')} className="rounded-2xl bg-sky-700 px-4 py-2 text-sm font-bold text-white">طلبات أولياء الأمور</button>
                          </div>
                        </div>
                      </div>
                    ) : null}
                  </div>
                ) : null}
                {canAccessPermission(currentUser, "settings") && <button onClick={() => setActivePage(currentUser.role === "superadmin" ? "platformAuth" : "settings")} className="inline-flex items-center gap-2 rounded-2xl bg-slate-100 px-4 py-3 font-bold text-slate-700"><BookOpen className="h-4 w-4" /> {currentUser.role === "superadmin" ? "الدخول والمصادقة" : "الإعدادات"}</button>}
                <button onClick={() => setHelpGuideOpen(true)} className="inline-flex items-center gap-2 rounded-2xl bg-amber-50 px-4 py-3 font-bold text-amber-800 ring-1 ring-amber-200 hover:bg-amber-100 transition" title="دليل الاستخدام">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4M12 8h.01"/></svg>
                  دليل الاستخدام
                </button>
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
      <HelpGuideModal open={helpGuideOpen} role={currentUser?.role} onClose={() => setHelpGuideOpen(false)} />
      </>
    </PageErrorBoundary>
  );
}




function UserEditor({ editingUser, schools, currentUser, actionLog, settings, onSave, onCancel }) {
  const canManageAll = currentUser?.role === "superadmin";
  const roleOptions = canManageAll ? roles : roles.filter((role) => principalDelegableRoles.includes(role.key));
  const [form, setForm] = useState({
    ...editingUser,
    permissions: clampDelegatedPermissions(currentUser, editingUser.role, buildRolePermissions(editingUser.role, editingUser.permissions)),
    subjects: parseTeacherSubjects(editingUser.subjects || []),
    specialItems: hydrateTeacherSpecialItems(editingUser.specialItems || []),
  });

  useEffect(() => {
    setForm({
      ...editingUser,
      permissions: clampDelegatedPermissions(currentUser, editingUser.role, buildRolePermissions(editingUser.role, editingUser.permissions)),
      subjects: parseTeacherSubjects(editingUser.subjects || []),
      specialItems: hydrateTeacherSpecialItems(editingUser.specialItems || []),
    });
  }, [editingUser]);

  const handleRoleChange = (role) => {
    setForm((prev) => ({
      ...prev,
      role,
      schoolId: role === "superadmin" ? null : (canManageAll ? (prev.schoolId || schools[0]?.id || 1) : (currentUser.schoolId || schools[0]?.id || 1)),
      permissions: clampDelegatedPermissions(currentUser, role, buildRolePermissions(role, prev.permissions)),
      subjects: role === 'teacher' ? parseTeacherSubjects(prev.subjects || []) : [],
      specialItems: role === 'teacher' ? hydrateTeacherSpecialItems(prev.specialItems || []) : [],
    }));
  };

  const teacherSpecialStats = useMemo(() => computeTeacherSpecialStats(actionLog, editingUser, settings), [actionLog, editingUser, settings]);
  const teacherSpecialItems = useMemo(() => hydrateTeacherSpecialItems(form.specialItems || []), [form.specialItems]);
  const teacherSpecialActiveItems = teacherSpecialItems.filter((item) => item.isActive !== false).length;
  const teacherSpecialSubjectsCount = new Set(teacherSpecialItems.map((item) => item.subject).filter(Boolean)).size;

  const [saveStatus, setSaveStatus] = useState('idle'); // idle | saving | saved | error
  const [saveMessage, setSaveMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaveStatus('saving');
    setSaveMessage('');
    try {
      await onSave(form);
      setSaveStatus('saved');
      setSaveMessage('تم حفظ التعديلات بنجاح');
      setTimeout(() => setSaveStatus('idle'), 3000);
    } catch (err) {
      setSaveStatus('error');
      setSaveMessage(err?.message || 'حدث خطأ أثناء الحفظ');
      setTimeout(() => setSaveStatus('idle'), 4000);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-4 md:grid-cols-2">
      <Input label="الاسم" value={form.name} onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))} />
      <Input label="البريد الإلكتروني" value={form.email || ''} onChange={(e) => setForm((prev) => ({ ...prev, email: e.target.value.toLowerCase() }))} />
      <Input label="رقم الجوال" value={form.mobile || ''} onChange={(e) => setForm((prev) => ({ ...prev, mobile: e.target.value }))} placeholder="9665XXXXXXXX" />
      <Input label="اسم الدخول" value={form.username} onChange={(e) => setForm((prev) => ({ ...prev, username: e.target.value.toLowerCase() }))} />
      <Input label="كلمة المرور" value={form.password} onChange={(e) => setForm((prev) => ({ ...prev, password: e.target.value }))} />
      <Select label="الدور" value={form.role} onChange={(e) => handleRoleChange(e.target.value)}>
        {roleOptions.map((role) => <option key={role.key} value={role.key}>{role.label}</option>)}
      </Select>
      {form.role !== "superadmin" && <Select label="المدرسة" value={form.schoolId || ""} onChange={(e) => setForm((prev) => ({ ...prev, schoolId: Number(e.target.value) }))} disabled={!canManageAll}>{schools.map((school) => <option key={school.id} value={school.id}>{school.name}</option>)}</Select>}
      {form.role === "teacher" ? (
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
      {!canManageAll ? <div className="rounded-2xl bg-amber-50 px-4 py-3 text-sm font-bold text-amber-900 ring-1 ring-amber-200 md:col-span-2">مدير المدرسة يحرر فقط حسابات مدرسته التشغيلية مثل الوكيل والمرشد والبوابة والمشرف والمعلم والطالب، ولا يستطيع تحويل أي مستخدم إلى مدير مدرسة أو أدمن عام أو منحه صلاحيات مركزية.</div> : null}
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
      {form.role === "teacher" ? (
        <div className="space-y-4 md:col-span-2">
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-4">
            <div className="rounded-3xl bg-violet-50 p-4 ring-1 ring-violet-100"><div className="text-xs font-bold text-violet-800">الرصيد التخصصي الحالي</div><div className="mt-2 text-3xl font-black text-slate-900">{teacherSpecialStats.score}</div><div className="mt-1 text-xs text-slate-500">يحتسب مرة واحدة لكل طالب على نفس البند خلال الفصل الحالي</div></div>
            <div className="rounded-3xl bg-sky-50 p-4 ring-1 ring-sky-100"><div className="text-xs font-bold text-sky-800">الإنجازات التخصصية</div><div className="mt-2 text-3xl font-black text-slate-900">{teacherSpecialStats.achievements}</div><div className="mt-1 text-xs text-slate-500">إجمالي مرات التفعيل في الفصل الحالي</div></div>
            <div className="rounded-3xl bg-emerald-50 p-4 ring-1 ring-emerald-100"><div className="text-xs font-bold text-emerald-800">البنود المفعلة</div><div className="mt-2 text-3xl font-black text-slate-900">{teacherSpecialActiveItems}</div><div className="mt-1 text-xs text-slate-500">من أصل {teacherSpecialItems.length} بند تخصصي</div></div>
            <div className="rounded-3xl bg-amber-50 p-4 ring-1 ring-amber-100"><div className="text-xs font-bold text-amber-800">المواد المفعلة</div><div className="mt-2 text-3xl font-black text-slate-900">{teacherSpecialSubjectsCount}</div><div className="mt-1 text-xs text-slate-500">عدد المواد التي تحتوي بنودًا تخصصية</div></div>
          </div>
          <TeacherSpecialItemsEditor subjects={form.subjects || []} items={form.specialItems || []} onChange={(items) => setForm((prev) => ({ ...prev, specialItems: items }))} />
        </div>
      ) : null}
      <div className="flex flex-wrap items-center gap-3 md:col-span-2">
        <button
          type="submit"
          disabled={saveStatus === 'saving'}
          className={`inline-flex items-center gap-2 rounded-2xl px-5 py-3 font-bold text-white transition-all duration-300 ${
            saveStatus === 'saved' ? 'bg-emerald-600 scale-105 shadow-lg shadow-emerald-200' :
            saveStatus === 'error' ? 'bg-rose-600' :
            saveStatus === 'saving' ? 'bg-sky-400 cursor-wait' :
            'bg-sky-700 hover:bg-sky-800 hover:scale-105'
          }`}
        >
          {saveStatus === 'saving' ? <><RefreshCw className="h-4 w-4 animate-spin" /> جارٍ الحفظ...</> :
           saveStatus === 'saved' ? <><CheckCircle className="h-4 w-4" /> تم الحفظ ✓</> :
           saveStatus === 'error' ? <><AlertCircle className="h-4 w-4" /> فشل الحفظ</> :
           <><Save className="h-4 w-4" /> حفظ التعديلات</>}
        </button>
        <button type="button" onClick={onCancel} className="inline-flex items-center gap-2 rounded-2xl bg-slate-100 px-5 py-3 font-bold text-slate-700"><RefreshCw className="h-4 w-4" /> إلغاء</button>
        {saveMessage && (
          <span className={`text-sm font-bold ${
            saveStatus === 'saved' || saveStatus === 'idle' && saveMessage.includes('نجاح') ? 'text-emerald-700' : 'text-rose-700'
          }`}>
            {saveMessage}
          </span>
        )}
      </div>
    </form>
  );
}
// build trigger Mon Mar 23 00:49:02 EDT 2026
// rebuild-1774242387

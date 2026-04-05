/**
 * ==========================================
 *  Type Definitions — تعريفات الأنواع
 * ==========================================
 *  أنواع TypeScript الأساسية للمنصة
 */

// === المدرسة ===
export interface School {
  id: number;
  name: string;
  city: string;
  code: string;
  manager: string;
  status: 'نشطة' | 'موقوفة';
  companies: Company[];
  students: Student[];
  structure?: SchoolStructure;
  smartLinks?: SmartLinks;
  access?: SchoolAccess;
  messaging?: MessagingCenter;
  teacherPointsCap?: TeacherPointsCap;
}

export interface Company {
  id: number;
  name: string;
  className: string;
  leader: string;
  points: number;
  early: number;
  behavior: number;
  initiatives: number;
}

export interface Student {
  id: number;
  name: string;
  nationalId: string;
  grade: string;
  companyId: number;
  barcode: string;
  faceReady: boolean;
  facePhoto?: string;
  faceSignature?: number[];
  status: 'مبكر' | 'في الوقت' | 'متأخر' | 'غائب';
  attendanceRate: number;
  points: number;
  source?: 'school' | 'structure';
  classroomId?: string;
  classroomName?: string;
  companyName?: string;
}

// === المستخدم ===
export interface User {
  id: number;
  name: string;
  username: string;
  email: string;
  mobile: string;
  password: string;
  role: UserRole;
  schoolId: number | null;
  studentId: number | null;
  status: 'نشط' | 'موقوف';
  permissions: Permissions;
}

export type UserRole = 'superadmin' | 'principal' | 'gate' | 'supervisor' | 'teacher' | 'student';

export interface Permissions {
  dashboard: boolean;
  schools: boolean;
  companies: boolean;
  students: boolean;
  attendance: boolean;
  actions: boolean;
  points: boolean;
  reports: boolean;
  settings: boolean;
  users: boolean;
  [key: string]: boolean;
}

// === الحضور ===
export interface ScanLogEntry {
  id: number;
  schoolId: number;
  studentId: number;
  companyId: number;
  classroomId?: string;
  gateId?: string;
  student: string;
  barcode: string;
  date: string;
  isoDate: string;
  time: string;
  method: 'QR' | 'face' | 'barcode' | 'يدوي';
  result: string;
  deltaPoints: number;
}

// === الإجراءات ===
export interface ActionLogEntry {
  id: number;
  schoolId: number;
  studentId: number;
  companyId: number;
  student: string;
  actorName: string;
  actorRole: string;
  method: string;
  actionType: 'reward' | 'violation' | 'program';
  actionTitle: string;
  note: string;
  evidence: Evidence[];
  date: string;
  isoDate: string;
  time: string;
  deltaPoints: number;
  points: number;
}

export interface Evidence {
  id: string;
  name: string;
  url: string;
  type: 'image' | 'video' | 'document';
}

// === الإعدادات ===
export interface Settings {
  platformName: string;
  academicYear: string;
  dayStart: string;
  adminName: string;
  policy: PolicySettings;
  points: PointSettings;
  devices: DeviceSettings;
  actions: ActionCatalog;
  auth: AuthSettings;
  parentPortal: ParentPortalSettings;
}

export interface PolicySettings {
  earlyEnd: string;
  onTimeEnd: string;
}

export interface PointSettings {
  early: number;
  onTime: number;
  late: number;
  initiative: number;
  behavior: number;
}

export interface DeviceSettings {
  barcodeEnabled: boolean;
  faceEnabled: boolean;
  duplicateScanBlocked: boolean;
}

export interface ActionCatalog {
  rewards: ActionItem[];
  violations: ActionItem[];
  programs: ActionItem[];
}

export interface ActionItem {
  id: number | string;
  title: string;
  points: number;
  description: string;
}

// === المصادقة ===
export interface AuthSettings {
  allowPasswordLogin: boolean;
  otpEnabled: boolean;
  passwordlessEnabled: boolean;
  identifierMode: 'username' | 'email_or_username' | 'any';
  otpExpiryMinutes: number;
  otpLength: number;
  delivery: { email: boolean; sms: boolean; whatsapp: boolean };
  security: SecuritySettings;
}

export interface SecuritySettings {
  enabled: boolean;
  applyToPassword: boolean;
  applyToOtp: boolean;
  trackWindowMinutes: number;
  maxFailedAttempts: number;
  lockoutMinutes: number;
  notifyAdminOnLock: boolean;
}

// === الحالة المشتركة ===
export interface SharedState {
  version: number;
  schools: School[];
  users: User[];
  scanLog: ScanLogEntry[];
  actionLog: ActionLogEntry[];
  gateSyncEvents: any[];
  settings: Settings;
  notifications: Notification[];
}

export interface Notification {
  id: number;
  title: string;
  body: string;
  time: string;
}

// === SmartLinks ===
export interface SmartLinks {
  gates: GateLink[];
  screens: ScreenLink[];
}

export interface GateLink {
  id: string;
  name: string;
  token: string;
  mode: 'qr' | 'face' | 'mixed';
  createdAt: string;
}

export interface ScreenLink {
  id: string;
  name: string;
  token: string;
  title: string;
  transition: string;
  rotateSeconds: number;
  theme: string;
  widgets: Record<string, boolean>;
  createdAt: string;
}

// === بنية المدرسة ===
export interface SchoolStructure {
  classrooms: Classroom[];
  attendanceBinding?: { sourceMode: string; linkedClassroomId: string };
}

export interface Classroom {
  id: string;
  stage: string;
  gradeKey: string;
  gradeLabel: string;
  section: string;
  name: string;
  companyName: string;
  students: Student[];
  status: 'active' | 'archived';
}

// === API Response ===
export interface ApiResponse<T = any> {
  ok: boolean;
  message?: string;
  state?: SharedState;
  sessionUser?: User | null;
  data?: T;
}

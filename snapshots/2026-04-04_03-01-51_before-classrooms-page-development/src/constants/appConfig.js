/**
 * ==========================================
 *  App Configuration Constants
 * ==========================================
 */
export const STORAGE_KEY = "ideal-company-platform-state-v8";
export const UI_STATE_KEY = "ideal-company-platform-ui-v8";
export const SERVER_CACHE_KEY = "ideal-company-platform-server-cache-v8";
export const SESSION_TOKEN_KEY = "ideal-company-platform-session-token-v8";
export const BACKUP_VERSION = 8;
export const APP_VERSION = "v1.8.1";
export const APP_VERSION_DATE = "2026-04-02";
export const GATE_OFFLINE_QUEUE_PREFIX = "ideal-company-platform-gate-offline-queue-v1";
export const GATE_SYNC_LOG_PREFIX = "ideal-company-platform-gate-sync-log-v1";

export const SCREEN_TRANSITION_OPTIONS = [
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

export const SCREEN_TRANSITION_KEYS = SCREEN_TRANSITION_OPTIONS.map(([key]) => key);
export const SCREEN_RANDOM_TRANSITIONS = SCREEN_TRANSITION_KEYS.filter((key) => key !== "random");

export const SCREEN_THEME_OPTIONS = [
  ["emerald-night", "ليلي زمردي"],
  ["blue-contrast", "أزرق عالي التباين"],
  ["violet-stage", "بنفسجي مسرحي"],
  ["sunrise", "شروق دافئ"],
  ["graphite", "رمادي احترافي"],
];

export const SCREEN_TEMPLATE_OPTIONS = [
  ["executive", "مؤشرات تنفيذية"],
  ["reception", "استقبال ولوبي"],
  ["leaderboard", "ترتيب ومنافسة"],
  ["news", "أخبار ونشاطات"],
];

export const TICKER_BG_OPTIONS = [
  ["amber", "ذهبي لافت"],
  ["navy", "كحلي رسمي"],
  ["emerald", "زمردي"],
  ["rose", "عنابي"],
  ["slate", "رمادي داكن"],
];

export const SCHOOL_STAGE_OPTIONS = [
  { key: "primary", label: "ابتدائي" },
  { key: "middle", label: "متوسط" },
  { key: "secondary", label: "ثانوي" },
];

export const SCHOOL_STAGE_GRADE_OPTIONS = {
  primary: [
    ["p1", "أول ابتدائي"], ["p2", "ثاني ابتدائي"], ["p3", "ثالث ابتدائي"],
    ["p4", "رابع ابتدائي"], ["p5", "خامس ابتدائي"], ["p6", "سادس ابتدائي"],
  ],
  middle: [
    ["m1", "أول متوسط"], ["m2", "ثاني متوسط"], ["m3", "ثالث متوسط"],
  ],
  secondary: [
    ["s1", "أول ثانوي"], ["s2", "ثاني ثانوي"], ["s3", "ثالث ثانوي"],
  ],
};

export const SCHOOL_GENDER_OPTIONS = [
  ["boys", "بنين"],
  ["girls", "بنات"],
  ["mixed", "مجمع"],
];

export const IMPORT_FIELD_LABELS = {
  fullName: "اسم الطالب",
  identityNumber: "رقم الهوية / الإقامة",
  guardianMobile: "رقم الجوال",
  guardianName: "اسم ولي الأمر",
  notes: "الملاحظات",
};

export const pieColors = ["#10b981", "#3b82f6", "#f59e0b", "#ef4444", "#94a3b8"];

export const roles = [
  { key: "superadmin", label: "الأدمن العام" },
  { key: "principal", label: "مدير المدرسة" },
  { key: "gate", label: "بوابة الحضور" },
  { key: "supervisor", label: "المشرف" },
  { key: "teacher", label: "المعلم" },
  { key: "student", label: "الطالب" },
];

export const schoolRoleDefinitions = [
  { key: "principal", label: "مدير المدرسة" },
  { key: "teacher", label: "المعلمون" },
  { key: "supervisor", label: "المشرفون" },
  { key: "gate", label: "بوابة الحضور" },
  { key: "student", label: "الطلاب" },
];

export const permissionDefinitions = [
  { key: "dashboard", label: "الرئيسية" },
  { key: "schools", label: "المدارس" },
  { key: "companies", label: "الشركات والفصول" },
  { key: "students", label: "الطلاب" },
  { key: "attendance", label: "الحضور الذكي" },
  { key: "actions", label: "إجراءات الطلاب" },
  { key: "points", label: "النقاط والترتيب" },
  { key: "reports", label: "التقارير" },
  { key: "settings", label: "الإعدادات" },
  { key: "users", label: "المستخدمون والصلاحيات" },
];

export const navItems = [
  { key: "dashboard", label: "الرئيسية", icon: "LayoutDashboard" },
  { key: "schools", label: "المدارس", icon: "School" },
  { key: "companies", label: "الشركات", icon: "Building2" },
  { key: "students", label: "الطلاب", icon: "GraduationCap" },
  { key: "attendance", label: "الحضور", icon: "ScanLine" },
  { key: "actions", label: "الإجراءات", icon: "ClipboardCheck" },
  { key: "points", label: "النقاط", icon: "Trophy" },
  { key: "reports", label: "التقارير", icon: "BarChart3" },
  { key: "settings", label: "الإعدادات", icon: "Settings" },
  { key: "users", label: "المستخدمون", icon: "Users" },
];


// === ثوابت إضافية ===
export const getAuthReasonLabel = (reason) => ({
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

export const REWARD_SUGGESTIONS_BANK = [
  { title: 'الانضباط والالتزام', points: 5, description: 'يستحق الطالب مكافأة على الانضباط والالتزام بالتعليمات.' },
  { title: 'حسن التعامل والاحترام', points: 5, description: 'مكافأة على الأدب واحترام الآخرين داخل المدرسة.' },
  { title: 'المبادرة والمساعدة', points: 6, description: 'مكافأة على المبادرة الإيجابية ومساعدة الزملاء.' },
  { title: 'المشاركة الصفية', points: 4, description: 'مكافأة على المشاركة الإيجابية داخل الحصة.' },
  { title: 'المحافظة على الممتلكات', points: 4, description: 'مكافأة على المحافظة على مرافق المدرسة وممتلكاتها.' },
  { title: 'التحسن الملحوظ', points: 6, description: 'مكافأة على وجود تحسن واضح في السلوك أو الأداء.' },
  { title: 'الالتزام بالزي', points: 4, description: 'مكافأة على الالتزام بالزي والنظام العام.' },
  { title: 'التعاون وروح الفريق', points: 5, description: 'مكافأة على التعاون الإيجابي والعمل بروح الفريق.' },
];

export const VIOLATION_SUGGESTIONS_BANK = [
  { title: 'التأخر عن الحصة', points: 3, description: 'خصم عند التأخر عن الحصة أو عدم الالتزام بالوقت.' },
  { title: 'إزعاج داخل الفصل', points: 3, description: 'خصم عند الإزعاج أو تعطيل سير الحصة.' },
  { title: 'عدم إحضار الأدوات', points: 2, description: 'خصم عند تكرار عدم إحضار الأدوات أو الدفتر.' },
  { title: 'ضعف الانضباط', points: 4, description: 'خصم عند ضعف الانضباط وعدم الالتزام بالتوجيهات.' },
  { title: 'العبث بالممتلكات', points: 5, description: 'خصم عند العبث بمرافق المدرسة أو ممتلكاتها.' },
  { title: 'عدم احترام الزملاء', points: 4, description: 'خصم عند وجود سلوك غير مناسب تجاه الزملاء.' },
  { title: 'عدم احترام المعلم', points: 5, description: 'خصم عند تجاوز حدود الاحترام مع المعلم.' },
  { title: 'تكرار المخالفة', points: 5, description: 'خصم إضافي عند تكرار نفس المخالفة.' },
];

export const PROGRAM_SUGGESTIONS_BANK = [
  { title: 'برنامج متابعة الانضباط', points: 10, description: 'برنامج علاجي أو تحفيزي لمتابعة الانضباط.' },
  { title: 'برنامج تحسين السلوك', points: 10, description: 'برنامج مقترح لتحسين السلوك ومتابعته.' },
  { title: 'برنامج تعزيز الحضور', points: 8, description: 'برنامج يهدف إلى رفع الالتزام بالحضور.' },
  { title: 'برنامج دعم التحصيل', points: 8, description: 'برنامج لمساندة الطالب أكاديميًا.' },
  { title: 'برنامج علاج التأخر', points: 8, description: 'برنامج للحد من التأخر المتكرر.' },
  { title: 'برنامج الشراكة الأسرية', points: 10, description: 'برنامج مقترح لتعزيز متابعة الأسرة.' },
  { title: 'برنامج الإرشاد الطلابي', points: 9, description: 'برنامج إرشادي لمعالجة حالة محددة.' },
  { title: 'برنامج الطالب المتميز', points: 12, description: 'برنامج تحفيزي للطلاب ذوي الأداء المتميز.' },
];

export const WEEK_DAYS = [
  { key: 'sunday', label: 'الأحد' },
  { key: 'monday', label: 'الاثنين' },
  { key: 'tuesday', label: 'الثلاثاء' },
  { key: 'wednesday', label: 'الأربعاء' },
  { key: 'thursday', label: 'الخميس' },
];







function getLessonSessionTeacherTargets(session, schoolUsers) {
  if (!session || !Array.isArray(schoolUsers)) return [];
  const teachers = schoolUsers.filter((user) => user.role === 'teacher' && String(user.status || 'نشط') === 'نشط');
  if (Array.isArray(session.targetTeacherIds) && session.targetTeacherIds.length > 0) {
    const ids = session.targetTeacherIds.map((id) => String(id));
    return teachers.filter((user) => ids.includes(String(user.id)));
  }
  return teachers;
}




export const BACKUP_VERSION = 8;

const SCREEN_TRANSITION_KEYS = ["fade","cut","slide-left","slide-right","slide-up","slide-down","zoom-in","zoom-out","flip-x","flip-y","rotate-soft","rotate-in","blur","bounce","scale-up","scale-down","swing","curtain","diagonal","pop","float","random"];
const SCREEN_THEME_KEYS = ["emerald-night","blue-contrast","violet-stage","sunrise","graphite"];
const TICKER_BG_KEYS = ["amber","navy","emerald","rose","slate"];

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

export const defaultSettings = {
  platformName: "منصة الشركة المثالية",
  academicYear: "1447",
  dayStart: "06:45",
  adminName: "الإدارة العامة",
  policy: { earlyEnd: "06:30", onTimeEnd: "06:45" },
  points: { early: 5, onTime: 3, late: -2, initiative: 10, behavior: 4 },
  devices: { barcodeEnabled: true, faceEnabled: true, duplicateScanBlocked: true },
  exportPrefix: "ideal-company-platform",
  branding: {
    ministryLogo: "",
    platformLogo: "",
  },
  actions: defaultActionCatalog,
  auth: {
    allowPasswordLogin: true,
    otpEnabled: false,
    passwordlessEnabled: false,
    identifierMode: "username",
    otpExpiryMinutes: 10,
    otpLength: 6,
    delivery: { email: true, sms: false, whatsapp: false },
    targeting: {
      applyScope: "all",
      selectedRoleKeys: [],
      selectedUserIds: [],
      excludedUserIds: [],
      forceForSelected: false,
    },
    email: {
      fromName: "منصة الشركة المثالية",
      fromEmail: "",
      smtpHost: "",
      smtpPort: 587,
      smtpSecure: false,
      smtpUsername: "",
      smtpPassword: "",
    },
    integrations: {
      sms: {
        providerName: "",
        senderId: "",
        apiUrl: "",
        apiKey: "",
        username: "",
        password: "",
        status: "غير مختبر",
        lastCheckedAt: "",
      },
      whatsapp: {
        phoneNumberId: "",
        businessAccountId: "",
        accessToken: "",
        webhookVerifyToken: "",
        status: "غير مختبر",
        lastCheckedAt: "",
      },
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

export const defaultPermissionsByRole = {
  superadmin: Object.fromEntries(permissionDefinitions.map((item) => [item.key, true])),
  principal: { dashboard: true, schools: false, companies: true, students: true, attendance: true, actions: true, points: true, reports: true, settings: true, users: true },
  gate: { dashboard: true, schools: false, companies: false, students: false, attendance: true, actions: false, points: true, reports: false, settings: false, users: false },
  supervisor: { dashboard: true, schools: false, companies: true, students: true, attendance: true, actions: true, points: true, reports: true, settings: false, users: false },
  teacher: { dashboard: false, schools: false, companies: false, students: false, attendance: false, actions: true, points: true, reports: false, settings: false, users: false },
  student: { dashboard: true, schools: false, companies: false, students: false, attendance: false, actions: false, points: true, reports: false, settings: false, users: false },
};

function safeNumber(value, fallback = 0) {
  const num = Number(value);
  return Number.isFinite(num) ? num : fallback;
}

function sanitizeBarcodeValue(value) {
  return String(value || "")
    .toUpperCase()
    .replace(/\s+/g, "")
    .replace(/[^A-Z0-9\-]/g, "");
}

function createBarcode(schoolCode, serial) {
  return `ST-${String(serial).padStart(4, "0")}-${schoolCode.split("-")[0]}`;
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

export function buildRolePermissions(role, overrides = {}) {
  return {
    ...(defaultPermissionsByRole[role] || defaultPermissionsByRole.teacher),
    ...(overrides || {}),
  };
}

export function createDefaultSchoolAccess() {
  return {
    roleAccess: Object.fromEntries(schoolRoleDefinitions.map((item) => [item.key, true])),
    principalPermissions: buildRolePermissions("principal"),
  };
}

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

export function createDefaultSmartLinks() {
  return { gates: [], screens: [] };
}

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
    theme: SCREEN_THEME_KEYS.includes(item?.theme) ? item.theme : "emerald-night",
    tickerEnabled: item?.tickerEnabled === true,
    tickerText: String(item?.tickerText || ""),
    tickerDir: item?.tickerDir === "ltr" ? "ltr" : "rtl",
    tickerBg: TICKER_BG_KEYS.includes(item?.tickerBg) ? item.tickerBg : "amber",
    tickerSeparator: String(item?.tickerSeparator || " ✦ "),
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

export function isRoleEnabledForSchool(role, school) {
  if (role === "superadmin") return true;
  return getSchoolAccess(school).roleAccess?.[role] !== false;
}

function schoolCodeSlug(code) {
  return String(code || "school").replace(/[^a-zA-Z0-9]+/g, "").toLowerCase() || "school";
}

function createSeedUsersForSchool(school, startId = 1) {
  const slug = schoolCodeSlug(school.code);
  const teacherPermissions = buildRolePermissions("teacher", { reports: true, actions: true });
  const schoolAccess = getSchoolAccess(school);
  return [
    { id: startId, name: school.manager || `مدير ${school.name}`, username: `${slug}.principal`, email: `${slug}.principal@school.local`, mobile: "", password: "123456", role: "principal", schoolId: school.id, studentId: null, status: "نشط", permissions: schoolAccess.principalPermissions },
    { id: startId + 1, name: `بوابة ${school.name}`, username: `${slug}.gate`, email: `${slug}.gate@school.local`, mobile: "", password: "123456", role: "gate", schoolId: school.id, studentId: null, status: "نشط", permissions: buildRolePermissions("gate") },
    { id: startId + 2, name: `معلم ${school.name}`, username: `${slug}.teacher`, email: `${slug}.teacher@school.local`, mobile: "", password: "123456", role: "teacher", schoolId: school.id, studentId: null, status: "نشط", permissions: teacherPermissions },
  ];
}

export function hydrateSchools(schools) {
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
    // معالجة structure.classrooms.students لضمان حفظ facePhoto و faceReady
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

export function hydrateUsers(users, schools) {
  const schoolIds = new Set((schools || []).map((school) => school.id));
  return ensureDemoUsers((users || [])
    .map((user, index) => {
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
    })
    .filter((user) => user.role === "superadmin" || user.schoolId !== null), schools);
}

export function hydrateActionCatalog(actions) {
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

export function hydrateScanLog(logs) {
  return (logs || []).map((item, index) => ({
    id: item.id || Date.now() + index,
    schoolId: item.schoolId,
    studentId: item.studentId || null,
    companyId: item.companyId || null,
    classroomId: item.classroomId || null,
    gateId: item.gateId || null,
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
    actionType: item.actionType === "violation" ? "violation" : item.actionType === "program" ? "program" : "reward",
    actionTitle: item.actionTitle || "إجراء",
    note: item.note || "",
    evidence: Array.isArray(item.evidence) ? item.evidence.map((evidence, evidenceIndex) => ({
      id: evidence?.id || `${item.id || Date.now() + index}-e${evidenceIndex + 1}`,
      name: evidence?.name || `شاهد ${evidenceIndex + 1}`,
      url: evidence?.url || "",
      type: evidence?.type || "image",
    })) : [],
    date: item.date || toArabicDate(new Date(item.isoDate || Date.now())),
    isoDate: item.isoDate || getTodayIso(),
    time: item.time || "00:00",
    deltaPoints: safeNumber(item.deltaPoints),
  }));
}

export function createDefaultUsers(schools) {
  const hydrated = hydrateSchools(schools || initialSchools);
  let nextId = 1;
  const users = [
    {
      id: nextId++,
      name: "الأدمن العام للمنصة",
      username: "admin",
      email: "admin@example.com",
      mobile: "",
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

export function createDefaultSharedState() {
  const schools = hydrateSchools(initialSchools);
  return {
    version: BACKUP_VERSION,
    schools,
    users: createDefaultUsers(schools),
    scanLog: hydrateScanLog(initialScanLog),
    actionLog: [],
    gateSyncEvents: [],
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
      { id: 1, title: "جاهزية النظام", body: "تم تأسيس المنصة على خادم مركزي مع جلسات دخول وصلاحيات متعددة المدارس.", time: "الآن" },
    ],
  };
}

export function hydrateSharedState(parsed = {}) {
  const defaults = createDefaultSharedState();
  const schools = hydrateSchools(parsed.schools?.length ? parsed.schools : defaults.schools);
  return {
    version: BACKUP_VERSION,
    schools,
    users: hydrateUsers(parsed.users?.length ? parsed.users : createDefaultUsers(schools), schools),
    scanLog: hydrateScanLog(parsed.scanLog?.length ? parsed.scanLog : defaults.scanLog),
    actionLog: hydrateActionLog(parsed.actionLog || defaults.actionLog),
    gateSyncEvents: Array.isArray(parsed.gateSyncEvents) ? parsed.gateSyncEvents : defaults.gateSyncEvents,
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
      },
    },
    notifications: Array.isArray(parsed.notifications) ? parsed.notifications : defaults.notifications,
  };
}

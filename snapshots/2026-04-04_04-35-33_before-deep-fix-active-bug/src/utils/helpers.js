/**
 * ==========================================
 *  Frontend Utility Helpers
 * ==========================================
 */

// === CSS Class Merger ===
export function cx(...classes) {
  return classes.filter(Boolean).join(' ');
}

// === Number Helpers ===
export function safeNumber(value, fallback = 0) {
  const num = Number(value);
  return Number.isFinite(num) ? num : fallback;
}

export function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

// === Date/Time Helpers ===
export function getTodayIso() {
  return new Date().toISOString().slice(0, 10);
}

export function toArabicDate(date = new Date()) {
  return new Intl.DateTimeFormat('ar-SA', {
    year: 'numeric', month: '2-digit', day: '2-digit',
  }).format(date);
}

export function parseTimeToMinutes(value) {
  const [h, m] = String(value || '').split(':').map((i) => Number(i));
  return (Number.isFinite(h) ? h : 0) * 60 + (Number.isFinite(m) ? m : 0);
}

export function formatDateTime(value) {
  if (!value) return '—';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '—';
  return new Intl.DateTimeFormat('ar-SA', {
    year: 'numeric', month: 'short', day: 'numeric',
    hour: 'numeric', minute: '2-digit',
  }).format(date);
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
  if (student.source === 'structure') {
    return student.companyName || student.classroomName || student.className || '';
  }
  return school?.companies?.find((item) => item.id === student.companyId)?.name || student.companyName || student.className || '';
}

export function getStudentGroupingLabel(student, school) {
  if (!student) return '—';
  if (student.source === 'structure') {
    return student.companyName || student.classroomName || student.className || '—';
  }
  return school?.companies?.find((item) => item.id === student.companyId)?.name || student.companyName || student.className || '—';
}

// === Barcode Helpers ===
export function createBarcode(schoolCode, serial) {
  return `ST-${String(serial).padStart(4, '0')}-${schoolCode.split('-')[0]}`;
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

// === Role Helpers ===
export function getRoleLabel(roleKey) {
  const map = { superadmin: 'الأدمن العام', principal: 'مدير المدرسة', gate: 'بوابة الحضور', supervisor: 'المشرف', teacher: 'المعلم', student: 'الطالب' };
  return map[roleKey] || roleKey;
}

export function canAccessPermission(user, permission) {
  if (!user) return false;
  if (user.role === 'superadmin') return true;
  return user.permissions?.[permission] === true;
}

// === LocalStorage Helpers ===
export function safeLocalStorageSetItem(key, value) {
  try {
    localStorage.setItem(key, value);
  } catch (e) {
    console.warn('LocalStorage full or unavailable:', e);
  }
}

export function safeLocalStorageGetItem(key) {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}

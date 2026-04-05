/**
 * ==========================================
 *  Input Validation Middleware - التحقق من المدخلات
 * ==========================================
 *  نظام تحقق خفيف بدون مكتبات خارجية
 *  يوفر validation schemas لكل نقطة API
 */

// === أنواع التحقق الأساسية ===
const validators = {
  string: (value, { min = 0, max = 10000, required = false } = {}) => {
    if (value == null || value === '') return required ? 'هذا الحقل مطلوب' : null;
    if (typeof value !== 'string') return 'يجب أن يكون نصاً';
    if (value.length < min) return `يجب ألا يقل عن ${min} حرف`;
    if (value.length > max) return `يجب ألا يزيد عن ${max} حرف`;
    return null;
  },

  number: (value, { min = -Infinity, max = Infinity, required = false } = {}) => {
    if (value == null || value === '') return required ? 'هذا الحقل مطلوب' : null;
    const num = Number(value);
    if (!Number.isFinite(num)) return 'يجب أن يكون رقماً صالحاً';
    if (num < min) return `يجب ألا يقل عن ${min}`;
    if (num > max) return `يجب ألا يزيد عن ${max}`;
    return null;
  },

  email: (value, { required = false } = {}) => {
    if (!value || value === '') return required ? 'البريد الإلكتروني مطلوب' : null;
    if (typeof value !== 'string') return 'بريد إلكتروني غير صالح';
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(value.trim())) return 'بريد إلكتروني غير صالح';
    return null;
  },

  phone: (value, { required = false } = {}) => {
    if (!value || value === '') return required ? 'رقم الجوال مطلوب' : null;
    const digits = String(value).replace(/\D/g, '');
    if (digits.length < 9 || digits.length > 15) return 'رقم جوال غير صالح';
    return null;
  },

  boolean: (value, { required = false } = {}) => {
    if (value == null) return required ? 'هذا الحقل مطلوب' : null;
    if (typeof value !== 'boolean') return 'يجب أن يكون قيمة منطقية (true/false)';
    return null;
  },

  array: (value, { min = 0, max = 1000, required = false } = {}) => {
    if (value == null) return required ? 'هذا الحقل مطلوب' : null;
    if (!Array.isArray(value)) return 'يجب أن يكون مصفوفة';
    if (value.length < min) return `يجب أن يحتوي على ${min} عنصر على الأقل`;
    if (value.length > max) return `يجب ألا يزيد عن ${max} عنصر`;
    return null;
  },

  oneOf: (value, { values = [], required = false } = {}) => {
    if (value == null || value === '') return required ? 'هذا الحقل مطلوب' : null;
    if (!values.includes(value)) return `قيمة غير صالحة. القيم المسموحة: ${values.join(', ')}`;
    return null;
  },
};

/**
 * التحقق من بيانات الجسم (body) مقابل schema
 * @param {Object} body - بيانات الطلب
 * @param {Object} schema - مخطط التحقق
 * @returns {{ valid: boolean, errors: Object|null }}
 */
export function validateBody(body, schema) {
  const errors = {};
  
  for (const [field, rules] of Object.entries(schema)) {
    const value = body?.[field];
    const { type, ...options } = rules;
    
    const validator = validators[type];
    if (!validator) continue;
    
    const error = validator(value, options);
    if (error) errors[field] = error;
  }
  
  const hasErrors = Object.keys(errors).length > 0;
  return { valid: !hasErrors, errors: hasErrors ? errors : null };
}

/**
 * إنشاء استجابة خطأ التحقق
 */
export function validationErrorResponse(res, errors) {
  const firstError = Object.values(errors)[0];
  const body = JSON.stringify({
    ok: false,
    message: firstError || 'بيانات غير صالحة',
    validationErrors: errors,
  });
  res.writeHead(400, {
    'Content-Type': 'application/json; charset=utf-8',
    // 'Access-Control-Allow-Origin': handled by security middleware,
    'Content-Length': Buffer.byteLength(body),
  });
  res.end(body);
}

// === Schemas لنقاط API الرئيسية ===

export const schemas = {
  login: {
    username: { type: 'string', required: true, min: 1, max: 100 },
    password: { type: 'string', required: true, min: 1, max: 200 },
  },

  requestOtp: {
    identifier: { type: 'string', required: true, min: 1, max: 200 },
    delivery: { type: 'oneOf', values: ['email', 'sms', 'whatsapp'] },
  },

  verifyOtp: {
    identifier: { type: 'string', required: true, min: 1, max: 200 },
    code: { type: 'string', required: true, min: 4, max: 10 },
  },

  changePassword: {
    currentPassword: { type: 'string', required: true, min: 1, max: 200 },
    newPassword: { type: 'string', required: true, min: 6, max: 200 },
  },

  adminResetPassword: {
    userId: { type: 'number', required: true, min: 1 },
    newPassword: { type: 'string', required: true, min: 6, max: 200 },
  },

  requestReset: {
    email: { type: 'email', required: true },
  },

  confirmReset: {
    email: { type: 'email', required: true },
    code: { type: 'string', required: true, min: 4, max: 10 },
    newPassword: { type: 'string', required: true, min: 6, max: 200 },
  },

  parentRequestOtp: {
    mobile: { type: 'phone', required: true },
  },

  parentVerifyOtp: {
    mobile: { type: 'phone', required: true },
    code: { type: 'string', required: true, min: 4, max: 10 },
  },

  addSchool: {
    name: { type: 'string', required: true, min: 2, max: 200 },
  },
};

/**
 * التحقق من المدخلات وإرجاع true إذا كانت غير صالحة (تم إرسال خطأ)
 */
export function validateAndReject(res, body, schemaName) {
  const schema = schemas[schemaName];
  if (!schema) return false;
  
  const { valid, errors } = validateBody(body, schema);
  if (!valid) {
    validationErrorResponse(res, errors);
    return true;
  }
  return false;
}

// === Sanitization (تنظيف المدخلات) ===

/**
 * تنظيف سلسلة نصية من أكواد HTML/XSS المحتملة
 */
export function sanitizeString(value) {
  if (typeof value !== 'string') return String(value || '');
  return value
    .replace(/[<>]/g, '')
    .replace(/javascript:/gi, '')
    .replace(/on\w+=/gi, '')
    .trim();
}

/**
 * تنظيف كائن كامل
 */
export function sanitizeObject(obj) {
  if (obj == null || typeof obj !== 'object') return obj;
  if (Array.isArray(obj)) return obj.map(sanitizeObject);
  
  const result = {};
  for (const [key, value] of Object.entries(obj)) {
    if (typeof value === 'string') {
      result[key] = sanitizeString(value);
    } else if (typeof value === 'object' && value !== null) {
      result[key] = sanitizeObject(value);
    } else {
      result[key] = value;
    }
  }
  return result;
}

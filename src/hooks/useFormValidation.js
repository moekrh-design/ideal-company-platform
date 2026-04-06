/**
 * useFormValidation — Hook موحّد للتحقق من صحة النماذج
 * الاستخدام:
 *   const { errors, validate, clearError, clearAll } = useFormValidation();
 *   const ok = validate(rules, formData);
 */
import { useState, useCallback } from 'react';

// ─── دوال التحقق الجاهزة ─────────────────────────────────────────────────────
export const validators = {
  required: (label) => (val) => !String(val || '').trim() ? `${label} مطلوب` : null,
  minLength: (label, min) => (val) => String(val || '').trim().length < min ? `${label} يجب أن يكون ${min} أحرف على الأقل` : null,
  maxLength: (label, max) => (val) => String(val || '').trim().length > max ? `${label} لا يتجاوز ${max} حرفاً` : null,
  username: (label) => (val) => {
    const v = String(val || '').trim();
    if (!v) return `${label} مطلوب`;
    if (!/^[a-z0-9._-]+$/.test(v)) return `${label} يحتوي أحرفاً غير مسموح بها (يُسمح: a-z 0-9 . _ -)`;
    if (v.length < 3) return `${label} يجب أن يكون 3 أحرف على الأقل`;
    return null;
  },
  password: (label) => (val) => {
    const v = String(val || '').trim();
    if (!v) return `${label} مطلوب`;
    if (v.length < 6) return `${label} يجب أن يكون 6 أحرف على الأقل`;
    return null;
  },
  email: (label) => (val) => {
    const v = String(val || '').trim();
    if (!v) return null; // البريد اختياري
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)) return `${label} بصيغة غير صحيحة`;
    return null;
  },
  mobile: (label) => (val) => {
    const v = String(val || '').trim();
    if (!v) return null; // الجوال اختياري
    if (!/^(05|9665|\+9665)[0-9]{8}$/.test(v.replace(/\s/g, ''))) return `${label} بصيغة غير صحيحة (مثال: 0512345678)`;
    return null;
  },
  nationalId: (label) => (val) => {
    const v = String(val || '').trim();
    if (!v) return null;
    if (!/^[12][0-9]{9}$/.test(v)) return `${label} يجب أن يكون 10 أرقام ويبدأ بـ 1 أو 2`;
    return null;
  },
  numeric: (label) => (val) => {
    const v = String(val || '').trim();
    if (v && isNaN(Number(v))) return `${label} يجب أن يكون رقماً`;
    return null;
  },
  positive: (label) => (val) => {
    const n = Number(val);
    if (isNaN(n) || n <= 0) return `${label} يجب أن يكون رقماً موجباً`;
    return null;
  },
  notExists: (label, existing, field = 'username') => (val) => {
    const v = String(val || '').trim().toLowerCase();
    if (!v) return null;
    if ((existing || []).some((item) => String(item[field] || '').toLowerCase() === v)) return `${label} مستخدم مسبقاً`;
    return null;
  },
  schoolCode: (label) => (val) => {
    const v = String(val || '').trim();
    if (!v) return `${label} مطلوب`;
    if (!/^[A-Za-z0-9\-]+$/.test(v)) return `${label} يحتوي أحرفاً غير مسموح بها`;
    return null;
  },
};

// ─── Hook الرئيسي ─────────────────────────────────────────────────────────────
export function useFormValidation() {
  const [errors, setErrors] = useState({});

  /**
   * تحقق من النموذج
   * @param {Object} rules - { fieldName: [validator1, validator2, ...] }
   * @param {Object} data  - { fieldName: value }
   * @returns {boolean} true إذا كل شيء صحيح
   */
  const validate = useCallback((rules, data) => {
    const newErrors = {};
    let isValid = true;
    for (const [field, fieldValidators] of Object.entries(rules)) {
      const value = data[field];
      for (const validator of (fieldValidators || [])) {
        const error = validator(value);
        if (error) {
          newErrors[field] = error;
          isValid = false;
          break; // أول خطأ فقط لكل حقل
        }
      }
    }
    setErrors(newErrors);
    return isValid;
  }, []);

  const clearError = useCallback((field) => {
    setErrors((prev) => {
      if (!prev[field]) return prev;
      const next = { ...prev };
      delete next[field];
      return next;
    });
  }, []);

  const clearAll = useCallback(() => setErrors({}), []);

  const setError = useCallback((field, message) => {
    setErrors((prev) => ({ ...prev, [field]: message }));
  }, []);

  return { errors, validate, clearError, clearAll, setError };
}

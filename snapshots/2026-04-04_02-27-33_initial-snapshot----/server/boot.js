/**
 * ==========================================
 *  Server Bootstrap - تهيئة الخادم
 * ==========================================
 *  يُستدعى في بداية index.js لتهيئة:
 *  - الحماية الأمنية (Rate Limiting + Security Headers)
 *  - التحقق من المدخلات
 *  - تسجيل الطلبات
 * 
 *  الاستخدام:
 *    import { applyServerMiddleware } from './boot.js';
 *    // داخل http.createServer callback:
 *    if (applyServerMiddleware(req, res)) return;
 */
import { addSecurityHeaders, addCorsHeaders } from './middleware/security.js';
import { applyRateLimit, apiLimiter, authLimiter, otpLimiter, stateSaveLimiter } from './middleware/rateLimiter.js';
import { validateAndReject, sanitizeObject } from './middleware/inputValidator.js';

/**
 * تطبيق الحماية الأمنية الأساسية على كل طلب
 * @returns {boolean} true = تم حظر الطلب
 */
export function applyServerMiddleware(req, res) {
  // 1. إضافة Security Headers لكل استجابة
  addSecurityHeaders(res);
  
  // 2. CORS Headers
  addCorsHeaders(res, req);
  
  // 3. Rate Limiting على مسارات API فقط
  const url = req.url || '';
  
  if (url.startsWith('/api/auth/login') || url.startsWith('/api/auth/change-password') || url.startsWith('/api/auth/admin-reset')) {
    if (applyRateLimit(authLimiter, req, res)) return true;
  }
  else if (url.startsWith('/api/auth/request-otp') || url.startsWith('/api/auth/verify-otp') || url.startsWith('/api/parent/request-otp') || url.startsWith('/api/parent/verify-otp')) {
    if (applyRateLimit(otpLimiter, req, res)) return true;
  }
  else if (url.startsWith('/api/state/save')) {
    if (applyRateLimit(stateSaveLimiter, req, res)) return true;
  }
  else if (url.startsWith('/api/')) {
    if (applyRateLimit(apiLimiter, req, res)) return true;
  }
  
  return false;
}

/**
 * تسجيل الطلبات (Logging)
 */
export function logApiRequest(req, startTime) {
  const url = req.url || '';
  if (!url.startsWith('/api/') && !url.startsWith('/ws/')) return;
  
  const duration = Date.now() - startTime;
  const method = req.method;
  const timestamp = new Date().toISOString().slice(11, 19);
  console.log(`[${timestamp}] ${method} ${url} ${duration}ms`);
}

// Re-export utilities for use in routes
export { validateAndReject, sanitizeObject };
export { addSecurityHeaders, addCorsHeaders };

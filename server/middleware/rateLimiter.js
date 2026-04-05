/**
 * ==========================================
 *  Rate Limiter Middleware - حماية من هجمات DoS
 * ==========================================
 *  يعمل كـ middleware على مستوى HTTP request handler
 *  يتتبع الطلبات لكل IP ويمنع الاستخدام المفرط
 */

const requestStore = new Map();

// تنظيف دوري للبيانات القديمة (كل 5 دقائق)
setInterval(() => {
  const now = Date.now();
  for (const [key, data] of requestStore.entries()) {
    if (now - data.windowStart > data.windowMs * 2) {
      requestStore.delete(key);
    }
  }
}, 5 * 60 * 1000);

/**
 * إنشاء rate limiter بإعدادات مخصصة
 * @param {Object} options
 * @param {number} options.windowMs - نافذة الوقت بالمللي ثانية (افتراضي: 15 دقيقة)
 * @param {number} options.maxRequests - الحد الأقصى للطلبات في النافذة (افتراضي: 100)
 * @param {string} options.message - رسالة الخطأ عند تجاوز الحد
 * @param {boolean} options.skipSuccessfulRequests - تجاوز الطلبات الناجحة
 * @returns {Function} middleware function
 */
export function createRateLimiter({
  windowMs = 15 * 60 * 1000,
  maxRequests = 100,
  message = 'تم تجاوز الحد الأقصى للطلبات. يرجى المحاولة لاحقاً.',
  keyGenerator = null,
} = {}) {
  return function rateLimitMiddleware(req, res) {
    const ip = req.headers['x-forwarded-for']?.split(',')[0]?.trim() 
      || req.socket?.remoteAddress 
      || 'unknown';
    
    const key = keyGenerator ? keyGenerator(req, ip) : ip;
    const now = Date.now();
    
    let record = requestStore.get(key);
    
    if (!record || (now - record.windowStart) > windowMs) {
      record = { count: 0, windowStart: now, windowMs };
      requestStore.set(key, record);
    }
    
    record.count++;
    
    // حساب الوقت المتبقي
    const remainingMs = windowMs - (now - record.windowStart);
    const remaining = Math.max(0, maxRequests - record.count);
    
    // إضافة headers معيارية
    res.setHeader('X-RateLimit-Limit', String(maxRequests));
    res.setHeader('X-RateLimit-Remaining', String(remaining));
    res.setHeader('X-RateLimit-Reset', String(Math.ceil((record.windowStart + windowMs) / 1000)));
    
    if (record.count > maxRequests) {
      res.setHeader('Retry-After', String(Math.ceil(remainingMs / 1000)));
      return { blocked: true, message, remainingMs };
    }
    
    return { blocked: false };
  };
}

// === Rate Limiters المُعدّة مسبقاً ===

// عام: 100 طلب كل 15 دقيقة
export const generalLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000,
  maxRequests: 100,
  message: 'تم تجاوز الحد الأقصى للطلبات. يرجى المحاولة بعد 15 دقيقة.',
});

// المصادقة: 20 محاولة كل 15 دقيقة (أكثر صرامة)
export const authLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000,
  maxRequests: 20,
  message: 'تم تجاوز الحد الأقصى لمحاولات تسجيل الدخول. يرجى المحاولة بعد 15 دقيقة.',
  keyGenerator: (req, ip) => `auth:${ip}`,
});

// OTP: 5 محاولات كل 10 دقائق (صارم جداً)
export const otpLimiter = createRateLimiter({
  windowMs: 10 * 60 * 1000,
  maxRequests: 5,
  message: 'تم تجاوز الحد الأقصى لطلبات رمز التحقق. يرجى المحاولة بعد 10 دقائق.',
  keyGenerator: (req, ip) => `otp:${ip}`,
});

// حفظ الحالة: 30 طلب كل 5 دقائق
export const stateSaveLimiter = createRateLimiter({
  windowMs: 5 * 60 * 1000,
  maxRequests: 30,
  message: 'تم تجاوز الحد الأقصى لعمليات الحفظ. يرجى المحاولة لاحقاً.',
  keyGenerator: (req, ip) => `save:${ip}`,
});

// API عام: 200 طلب كل 15 دقيقة
export const apiLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000,
  maxRequests: 200,
  message: 'تم تجاوز الحد الأقصى لطلبات API. يرجى المحاولة لاحقاً.',
  keyGenerator: (req, ip) => `api:${ip}`,
});

/**
 * تطبيق Rate Limiter وإرجاع true إذا تم حظر الطلب
 */
export function applyRateLimit(limiter, req, res) {
  const result = limiter(req, res);
  if (result.blocked) {
    const body = JSON.stringify({ ok: false, message: result.message });
    res.writeHead(429, {
      'Content-Type': 'application/json; charset=utf-8',
      // 'Access-Control-Allow-Origin': handled by security middleware,
      'Content-Length': Buffer.byteLength(body),
    });
    res.end(body);
    return true;
  }
  return false;
}

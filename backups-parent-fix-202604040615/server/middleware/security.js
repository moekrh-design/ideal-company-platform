/**
 * ==========================================
 *  Security Middleware - حماية أمنية
 * ==========================================
 *  Headers أمنية + حماية من الهجمات الشائعة
 */

/**
 * إضافة headers أمنية لجميع الاستجابات
 */
export function addSecurityHeaders(res) {
  // منع تضمين الصفحة في إطار (Clickjacking protection)
  res.setHeader('X-Frame-Options', 'SAMEORIGIN');
  
  // منع تخمين نوع المحتوى (MIME-type sniffing)
  res.setHeader('X-Content-Type-Options', 'nosniff');
  
  // إزالة X-XSS-Protection المهجور (يسبب ثغرات في المتصفحات القديمة)
  res.setHeader('X-XSS-Protection', '0');
  
  // HSTS - إجبار HTTPS لمدة سنة
  res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  
  // سياسة الأذونات - تقييد الوصول للكاميرا والميكروفون
  res.setHeader('Permissions-Policy', 'camera=(self), microphone=(), geolocation=(), payment=()');
  
  // سياسة الإحالة (Referrer Policy)
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  
  // سياسة أمان المحتوى (CSP) - مع السماح بـ CDN الخارجية المطلوبة
  res.setHeader('Content-Security-Policy', [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://cdn.jsdelivr.net https://cdnjs.cloudflare.com",
    "style-src 'self' 'unsafe-inline' https://cdn.jsdelivr.net https://cdnjs.cloudflare.com",
    "img-src 'self' data: blob: https:",
    "font-src 'self' data:",
    "connect-src 'self' ws: wss: https:",
    "frame-ancestors 'self'",
  ].join('; '));

  // إخفاء معلومات الخادم
  res.setHeader('X-Powered-By', '');
}

/**
 * CORS Headers
 */
const ALLOWED_ORIGINS = [
  'https://school.darh.net',
  'https://www.school.darh.net',
  'https://darh.net',
  'https://www.darh.net',
];

export function addCorsHeaders(res, req) {
  const origin = req?.headers?.origin || '';
  if (ALLOWED_ORIGINS.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
    res.setHeader('Access-Control-Allow-Credentials', 'true');
  } else {
    // للطلبات من نفس الموقع بدون origin header
    res.setHeader('Access-Control-Allow-Origin', 'https://school.darh.net');
  }
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Session-Token');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PATCH, DELETE, OPTIONS');
}

/**
 * التحقق من حجم الطلب (Request Size Limit)
 */
export function checkRequestSize(req, maxBytes = 50 * 1024 * 1024) {
  const contentLength = parseInt(req.headers['content-length'] || '0', 10);
  return contentLength <= maxBytes;
}

/**
 * تسجيل الطلبات (Request Logger)
 */
export function logRequest(req, startTime) {
  const duration = Date.now() - startTime;
  const method = req.method;
  const url = req.url;
  const status = req.statusCode || '—';
  
  // تسجيل فقط طلبات API (تجاهل الملفات الثابتة)
  if (url.startsWith('/api/') || url.startsWith('/ws/')) {
    console.log(`[${new Date().toISOString()}] ${method} ${url} - ${duration}ms`);
  }
}

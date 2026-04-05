/**
 * ==========================================
 *  Logger Service - نظام التسجيل المحترف
 * ==========================================
 *  بديل خفيف لـ pino يدعم:
 *  - مستويات تسجيل (debug, info, warn, error)
 *  - تنسيق JSON للإنتاج
 *  - تنسيق ملوّن للتطوير
 *  - تسجيل الطلبات مع المدة
 */

const LOG_LEVELS = { debug: 0, info: 1, warn: 2, error: 3 };
const LEVEL = LOG_LEVELS[process.env.LOG_LEVEL || 'info'] ?? 1;
const IS_PROD = process.env.NODE_ENV === 'production';

const COLORS = {
  debug: '\x1b[36m',  // cyan
  info: '\x1b[32m',   // green
  warn: '\x1b[33m',   // yellow
  error: '\x1b[31m',  // red
  reset: '\x1b[0m',
};

function formatTimestamp() {
  return new Date().toISOString();
}

function log(level, message, data = null) {
  if (LOG_LEVELS[level] < LEVEL) return;

  if (IS_PROD) {
    // JSON format for production (machine-readable)
    const entry = {
      timestamp: formatTimestamp(),
      level,
      message,
      ...(data ? { data } : {}),
    };
    console.log(JSON.stringify(entry));
  } else {
    // Colored format for development
    const color = COLORS[level] || '';
    const timestamp = formatTimestamp().slice(11, 23);
    const prefix = `${color}[${timestamp}] [${level.toUpperCase()}]${COLORS.reset}`;
    if (data) {
      console.log(`${prefix} ${message}`, data);
    } else {
      console.log(`${prefix} ${message}`);
    }
  }
}

export const logger = {
  debug: (msg, data) => log('debug', msg, data),
  info: (msg, data) => log('info', msg, data),
  warn: (msg, data) => log('warn', msg, data),
  error: (msg, data) => log('error', msg, data),

  /**
   * تسجيل طلب HTTP مع المدة
   */
  request(method, url, statusCode, durationMs) {
    const level = statusCode >= 500 ? 'error' : statusCode >= 400 ? 'warn' : 'info';
    log(level, `${method} ${url} ${statusCode} ${durationMs}ms`, {
      method, url, statusCode, durationMs,
    });
  },

  /**
   * تسجيل حدث أمني
   */
  security(event, details = {}) {
    log('warn', `🛡️ Security: ${event}`, details);
  },

  /**
   * تسجيل حدث قاعدة البيانات
   */
  db(action, details = {}) {
    log('debug', `💾 DB: ${action}`, details);
  },

  /**
   * تسجيل حدث مصادقة
   */
  auth(event, details = {}) {
    log('info', `🔐 Auth: ${event}`, details);
  },
};

export default logger;

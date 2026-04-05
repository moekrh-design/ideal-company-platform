/**
 * ==========================================
 *  Route Registry - تسجيل جميع المسارات
 * ==========================================
 *  يجمع كل مسارات API في مكان واحد
 *  ويوفر دالة واحدة لتوجيه الطلبات
 */
import { createHealthRoutes } from './health.js';
import { createAuthRoutes } from './auth.js';
import { createStateRoutes } from './state.js';
import { createAttendanceRoutes } from './attendance.js';
import { createBackupRoutes } from './backups.js';

/**
 * تسجيل جميع المسارات وإرجاع دالة التوجيه
 * @param {Object} ctx - سياق التطبيق (يحتوي على الدوال المشتركة)
 * @returns {Function} async (req, res, reqUrl) => boolean
 */
export function registerAllRoutes(ctx) {
  const routers = [
    createHealthRoutes(ctx),
    createAuthRoutes(ctx),
    createStateRoutes(ctx),
    createAttendanceRoutes(ctx),
    createBackupRoutes(ctx),
    // TODO: Add more route modules here as they are extracted:
    // createSchoolRoutes(ctx),
    // createParentRoutes(ctx),
    // createAdminRoutes(ctx),
    // createPublicRoutes(ctx),
  ];

  /**
   * محاولة توجيه الطلب عبر المسارات المسجلة
   * @returns {boolean} true إذا تم التعامل مع الطلب
   */
  return async function routeRequest(req, res, reqUrl) {
    for (const router of routers) {
      const handled = await router.handle(req, res, reqUrl);
      if (handled) return true;
    }
    return false;
  };
}

/**
 * قائمة بجميع المسارات المسجلة (للتوثيق)
 */
export const REGISTERED_ROUTES = {
  health: [
    'GET  /api/health',
    'GET  /api/bootstrap',
  ],
  auth: [
    'POST /api/auth/login',
    'POST /api/auth/request-otp',
    'POST /api/auth/verify-otp',
    'POST /api/auth/test-delivery',
    'POST /api/auth/test-otp-scenario',
    'GET  /api/auth/logs',
    'POST /api/auth/logout',
    'POST /api/auth/request-reset',
    'POST /api/auth/confirm-reset',
    'POST /api/auth/change-password',
    'POST /api/auth/admin-reset-password',
  ],
  state: [
    'POST /api/state/save',
    'POST /api/state/reset',
    'GET  /api/state/export',
  ],
  attendance: [
    'POST /api/attendance/scan',
  ],
  backups: [
    'GET  /api/backups/status',
    'POST /api/backups/create-now',
    'GET  /api/backups/list',
    'POST /api/backups/restore-from-upload',
    'POST /api/backups/restore/:type/:filename',
  ],
};

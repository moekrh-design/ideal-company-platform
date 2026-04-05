/**
 * ==========================================
 *  Auth Routes - مسارات المصادقة
 * ==========================================
 *  12 نقطة API للمصادقة وإدارة الجلسات
 */
import { createRouteGroup } from '../utils/router.js';
import { sendJson, readJsonBody, parseAuthToken, hashPassword, verifyPassword, generateOtpCode, maskEmail, maskPhone, normalizePhoneNumber, isHashedPassword } from '../utils/helpers.js';
import { validateAndReject } from '../middleware/inputValidator.js';
import { applyRateLimit, authLimiter, otpLimiter } from '../middleware/rateLimiter.js';

export function createAuthRoutes(ctx) {
  const router = createRouteGroup('/api/auth');

  // === POST /api/auth/login ===
  router.post('/login', async (req, res) => {
    if (applyRateLimit(authLimiter, req, res)) return;
    const body = await readJsonBody(req);
    if (validateAndReject(res, body, 'login')) return;

    const username = String(body.username || '').trim().toLowerCase();
    const password = String(body.password || '');
    const state = await ctx.getSharedState();
    const authSettings = ctx.hydrateAuthSettings(state.settings || {});

    if (authSettings.allowPasswordLogin === false) {
      ctx.auditAuthEvent('auth_login_blocked', { identifier: username, reason: 'password_login_disabled' });
      return sendJson(res, 403, { ok: false, message: 'تسجيل الدخول بكلمة المرور معطل من الإعدادات.' });
    }

    const matchedUser = state.users.find((item) => item.username.toLowerCase() === username);
    const activePasswordLock = matchedUser 
      ? ctx.getActiveAuthLockout(username, matchedUser.id, 'password') 
      : ctx.getActiveAuthLockout(username, null, 'password');
    
    if (activePasswordLock) {
      ctx.auditAuthEvent('auth_login_blocked', { 
        identifier: username, userId: matchedUser?.id || null, 
        reason: 'temporary_lockout', expiresAt: activePasswordLock.expires_at, 
        scope: activePasswordLock.scope 
      }, matchedUser ? { username: matchedUser.username, role: matchedUser.role } : null);
      return sendJson(res, 423, { ok: false, message: ctx.getAuthLockoutMessage(activePasswordLock), lockout: { expiresAt: activePasswordLock.expires_at, scope: activePasswordLock.scope } });
    }

    const matchedByUsername = state.users.filter((item) => item.username.toLowerCase() === username && item.status === 'نشط');
    let user = null;
    for (const candidate of matchedByUsername) {
      if (await verifyPassword(password, candidate.password)) { user = candidate; break; }
    }

    if (!user) {
      ctx.auditAuthEvent('auth_login_failed', { 
        identifier: username, 
        reason: matchedUser ? 'invalid_password_or_inactive' : 'user_not_found', 
        userId: matchedUser?.id || null, 
        role: matchedUser?.role || '' 
      }, matchedUser ? { username: matchedUser.username, role: matchedUser.role } : null);
      
      const lockResult = await ctx.registerAuthFailureAndMaybeLock(state, 'password', username, matchedUser || null, matchedUser ? { username: matchedUser.username, role: matchedUser.role } : null);
      if (lockResult.locked) {
        return sendJson(res, 423, { ok: false, message: ctx.getAuthLockoutMessage(lockResult.lockout), lockout: { expiresAt: lockResult.lockout.expires_at, scope: lockResult.lockout.scope } });
      }
      return sendJson(res, 401, { ok: false, message: 'بيانات الدخول غير صحيحة أو أن الحساب موقوف.' });
    }

    const school = state.schools.find((item) => item.id === user.schoolId);
    if (!ctx.isRoleEnabledForSchool(user.role, school)) {
      ctx.auditAuthEvent('auth_login_blocked', { identifier: username, userId: user.id, reason: 'role_disabled_for_school' }, { username: user.username, role: user.role });
      return sendJson(res, 403, { ok: false, message: 'هذا الدور غير مفعل لهذه المدرسة من قبل الأدمن العام.' });
    }

    if (!ctx.isPasswordLoginAllowedForUser(user, authSettings)) {
      ctx.auditAuthEvent('auth_login_blocked', { identifier: username, userId: user.id, reason: 'otp_only_user' }, { username: user.username, role: user.role });
      return sendJson(res, 403, { ok: false, message: 'هذا الحساب محدد للدخول بالرمز فقط حسب إعدادات الأدمن.' });
    }

    ctx.clearAuthLockouts(username, user.id, { username: user.username, role: user.role });
    const sessionToken = ctx.createSession(user);
    return sendJson(res, 200, { ok: true, token: sessionToken, user: ctx.sanitizeUser(user) });
  });

  // === POST /api/auth/request-otp ===
  router.post('/request-otp', async (req, res) => {
    if (applyRateLimit(otpLimiter, req, res)) return;
    const body = await readJsonBody(req);
    if (validateAndReject(res, body, 'requestOtp')) return;
    // Delegate to original handler in context
    await ctx.handleRequestOtp(req, res, body);
  });

  // === POST /api/auth/verify-otp ===
  router.post('/verify-otp', async (req, res) => {
    if (applyRateLimit(otpLimiter, req, res)) return;
    const body = await readJsonBody(req);
    if (validateAndReject(res, body, 'verifyOtp')) return;
    await ctx.handleVerifyOtp(req, res, body);
  });

  // === POST /api/auth/test-delivery ===
  router.post('/test-delivery', async (req, res) => {
    const actor = await ctx.getUserFromToken(parseAuthToken(req));
    if (!actor) return sendJson(res, 401, { ok: false, message: 'الجلسة منتهية أو غير صالحة.' });
    const body = await readJsonBody(req);
    await ctx.handleTestDelivery(req, res, body, actor);
  });

  // === POST /api/auth/test-otp-scenario ===
  router.post('/test-otp-scenario', async (req, res) => {
    const actor = await ctx.getUserFromToken(parseAuthToken(req));
    if (!actor) return sendJson(res, 401, { ok: false, message: 'الجلسة منتهية أو غير صالحة.' });
    const body = await readJsonBody(req);
    await ctx.handleTestOtpScenario(req, res, body, actor);
  });

  // === GET /api/auth/logs ===
  router.get('/logs', async (req, res, { query }) => {
    const actor = await ctx.getUserFromToken(parseAuthToken(req));
    if (!actor) return sendJson(res, 401, { ok: false, message: 'الجلسة منتهية أو غير صالحة.' });
    const limit = Number(query.get('limit')) || 200;
    const logs = ctx.readAuthLogs(limit);
    return sendJson(res, 200, { ok: true, logs });
  });

  // === POST /api/auth/logout ===
  router.post('/logout', async (req, res) => {
    const token = parseAuthToken(req);
    ctx.deleteSession(token);
    return sendJson(res, 200, { ok: true });
  });

  // === POST /api/auth/request-reset ===
  router.post('/request-reset', async (req, res) => {
    if (applyRateLimit(authLimiter, req, res)) return;
    const body = await readJsonBody(req);
    await ctx.handleRequestReset(req, res, body);
  });

  // === POST /api/auth/confirm-reset ===
  router.post('/confirm-reset', async (req, res) => {
    if (applyRateLimit(authLimiter, req, res)) return;
    const body = await readJsonBody(req);
    await ctx.handleConfirmReset(req, res, body);
  });

  // === POST /api/auth/change-password ===
  router.post('/change-password', async (req, res) => {
    const actor = await ctx.getUserFromToken(parseAuthToken(req));
    if (!actor) return sendJson(res, 401, { ok: false, message: 'الجلسة منتهية أو غير صالحة.' });
    const body = await readJsonBody(req);
    if (validateAndReject(res, body, 'changePassword')) return;
    await ctx.handleChangePassword(req, res, body, actor);
  });

  // === POST /api/auth/admin-reset-password ===
  router.post('/admin-reset-password', async (req, res) => {
    const actor = await ctx.getUserFromToken(parseAuthToken(req));
    if (!actor) return sendJson(res, 401, { ok: false, message: 'الجلسة منتهية أو غير صالحة.' });
    const body = await readJsonBody(req);
    if (validateAndReject(res, body, 'adminResetPassword')) return;
    await ctx.handleAdminResetPassword(req, res, body, actor);
  });

  return router;
}

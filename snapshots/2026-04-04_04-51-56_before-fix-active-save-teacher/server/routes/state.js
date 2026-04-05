/**
 * ==========================================
 *  State Routes - مسارات إدارة الحالة
 * ==========================================
 *  حفظ/إعادة/تصدير حالة المنصة
 */
import { createRouteGroup } from '../utils/router.js';
import { sendJson, readJsonBody, parseAuthToken } from '../utils/helpers.js';
import { applyRateLimit, stateSaveLimiter } from '../middleware/rateLimiter.js';

export function createStateRoutes(ctx) {
  const router = createRouteGroup('/api/state');

  // === POST /api/state/save ===
  router.post('/save', async (req, res) => {
    if (applyRateLimit(stateSaveLimiter, req, res)) return;
    const actor = await ctx.getUserFromToken(parseAuthToken(req));
    if (!actor) return sendJson(res, 401, { ok: false, message: 'الجلسة منتهية أو غير صالحة.' });
    if (actor.role === 'student') return sendJson(res, 403, { ok: false, message: 'هذا الحساب لا يملك صلاحية حفظ بيانات المنصة.' });
    
    const body = await readJsonBody(req);
    const incomingState = body.state || body;
    const currentState = await ctx.getSharedState();
    const merged = ctx.mergeStateByRole(currentState, incomingState, actor);
    const saved = await ctx.saveSharedState(merged, actor);
    return sendJson(res, 200, { ok: true, state: ctx.sanitizeStateForClient(saved), sessionUser: actor });
  });

  // === POST /api/state/reset ===
  router.post('/reset', async (req, res) => {
    const actor = await ctx.getUserFromToken(parseAuthToken(req));
    if (!actor || actor.role !== 'superadmin') return sendJson(res, 403, { ok: false, message: 'فقط الأدمن العام يمكنه إعادة تهيئة المنصة.' });
    
    const fresh = ctx.createDefaultSharedState();
    await ctx.saveSharedState(fresh, actor);
    return sendJson(res, 200, { ok: true, state: ctx.sanitizeStateForClient(fresh), sessionUser: actor });
  });

  // === GET /api/state/export ===
  router.get('/export', async (req, res) => {
    const actor = await ctx.getUserFromToken(parseAuthToken(req));
    if (!actor) return sendJson(res, 401, { ok: false, message: 'يلزم تسجيل الدخول أولاً.' });
    
    const state = await ctx.getSharedState();
    const payload = JSON.stringify(ctx.sanitizeStateForClient(state), null, 2);
    res.writeHead(200, {
      'Content-Type': 'application/json; charset=utf-8',
      'Content-Disposition': 'attachment; filename="platform-state-export.json"',
      'Content-Length': Buffer.byteLength(payload),
      // 'Access-Control-Allow-Origin': handled by security middleware,
    });
    res.end(payload);
  });

  return router;
}

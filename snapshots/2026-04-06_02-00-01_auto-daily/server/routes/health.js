/**
 * ==========================================
 *  Health & Bootstrap Routes
 * ==========================================
 */
import { createRouteGroup } from '../utils/router.js';
import { sendJson, parseAuthToken, nowIso } from '../utils/helpers.js';

export function createHealthRoutes(ctx) {
  const router = createRouteGroup('/api');

  // === GET /api/health ===
  router.get('/health', async (req, res) => {
    return sendJson(res, 200, { 
      ok: true, 
      service: 'ideal-company-platform-server', 
      time: nowIso(),
      version: 'v1.8.1',
    });
  });

  // === GET /api/bootstrap ===
  router.get('/bootstrap', async (req, res) => {
    const state = await ctx.getSharedState();
    const user = await ctx.getUserFromToken(parseAuthToken(req));
    return sendJson(res, 200, { ok: true, state: ctx.sanitizeStateForClient(state), sessionUser: user });
  });

  return router;
}

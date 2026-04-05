/**
 * ==========================================
 *  Attendance Routes - مسارات الحضور
 * ==========================================
 *  تسجيل الحضور عبر QR/بصمة الوجه/باركود
 */
import { createRouteGroup } from '../utils/router.js';
import { sendJson, readJsonBody, parseAuthToken } from '../utils/helpers.js';

export function createAttendanceRoutes(ctx) {
  const router = createRouteGroup('/api/attendance');

  // === POST /api/attendance/scan ===
  router.post('/scan', async (req, res) => {
    const actor = await ctx.getUserFromToken(parseAuthToken(req));
    if (!actor) return sendJson(res, 401, { ok: false, message: 'الجلسة منتهية أو غير صالحة.' });
    
    const body = await readJsonBody(req);
    const scanEntry = body.scanEntry;
    
    if (!scanEntry || !scanEntry.studentId || !scanEntry.schoolId) {
      return sendJson(res, 400, { ok: false, message: 'بيانات التحضير غير مكتملة.' });
    }
    
    const state = await ctx.getSharedState();
    
    // تحقق من عدم التكرار
    const alreadyExists = state.scanLog.some(
      (e) => String(e.studentId) === String(scanEntry.studentId)
        && Number(e.schoolId) === Number(scanEntry.schoolId)
        && e.isoDate === scanEntry.isoDate
    );
    
    if (alreadyExists) {
      return sendJson(res, 200, { ok: true, duplicate: true, message: 'تم تسجيل الحضور مسبقاً لهذا الطالب اليوم.' });
    }
    
    const next = structuredClone(state);
    next.scanLog = [scanEntry, ...next.scanLog];
    ctx.writeStateRow(next, actor);
    void ctx.ensureDailyBackups('save', next);
    ctx.broadcastAllLive(next);
    ctx.audit(actor, 'attendance_scan', { 
      studentId: scanEntry.studentId, 
      schoolId: scanEntry.schoolId, 
      method: scanEntry.method || 'يدوي' 
    });
    
    return sendJson(res, 200, { ok: true, message: 'تم تسجيل الحضور وحفظه فوراً.' });
  });

  return router;
}

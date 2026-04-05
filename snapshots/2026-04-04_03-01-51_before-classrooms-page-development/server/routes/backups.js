/**
 * ==========================================
 *  Backup Routes - مسارات النسخ الاحتياطي
 * ==========================================
 *  إنشاء/عرض/استعادة/حذف النسخ الاحتياطية
 */
import { existsSync, readFileSync } from 'node:fs';
import { readdir, stat, unlink, writeFile, mkdir } from 'node:fs/promises';
import path from 'node:path';
import { createRouteGroup } from '../utils/router.js';
import { sendJson, readJsonBody, parseAuthToken, nowIso, safeBackupSlug } from '../utils/helpers.js';
import { BACKUPS_DIR, GLOBAL_BACKUPS_DIR, SCHOOL_BACKUPS_DIR, BACKUP_RETENTION_DAYS } from '../config/constants.js';

export function createBackupRoutes(ctx) {
  const router = createRouteGroup('/api/backups');

  // === GET /api/backups/status ===
  router.get('/status', async (req, res) => {
    const actor = await ctx.getUserFromToken(parseAuthToken(req));
    if (!actor || actor.role !== 'superadmin') return sendJson(res, 403, { ok: false, message: 'فقط الأدمن العام يمكنه عرض حالة النسخ الاحتياطي.' });
    
    const latestPath = path.join(BACKUPS_DIR, 'latest.json');
    let latest = null;
    if (existsSync(latestPath)) {
      try { latest = JSON.parse(readFileSync(latestPath, 'utf8')); } catch {}
    }
    return sendJson(res, 200, { ok: true, backupsDir: BACKUPS_DIR, retentionDays: BACKUP_RETENTION_DAYS, latest });
  });

  // === POST /api/backups/create-now ===
  router.post('/create-now', async (req, res) => {
    const actor = await ctx.getUserFromToken(parseAuthToken(req));
    if (!actor || actor.role !== 'superadmin') return sendJson(res, 403, { ok: false, message: 'فقط الأدمن العام يمكنه إنشاء نسخة احتياطية.' });
    
    try {
      const currentState = await ctx.getSharedState();
      const now = new Date();
      const stamp = `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}-${String(now.getDate()).padStart(2,'0')}`;
      const timeStamp = `${String(now.getHours()).padStart(2,'0')}${String(now.getMinutes()).padStart(2,'0')}${String(now.getSeconds()).padStart(2,'0')}`;
      const uniqueStamp = `${stamp}-manual-${timeStamp}`;
      const globalJsonPath = path.join(GLOBAL_BACKUPS_DIR, `platform-${uniqueStamp}.json`);
      
      const globalPayload = {
        exportedAt: now.toISOString(),
        type: 'platform-manual-backup',
        reason: 'manual',
        createdBy: actor.username,
        state: ctx.sanitizeStateForClient(currentState),
      };
      
      await mkdir(GLOBAL_BACKUPS_DIR, { recursive: true });
      await mkdir(SCHOOL_BACKUPS_DIR, { recursive: true });
      await writeFile(globalJsonPath, JSON.stringify(globalPayload, null, 2), 'utf8');
      
      for (const school of currentState.schools || []) {
        const slug = safeBackupSlug(school.code || school.name || `school-${school.id}`);
        const schoolFile = path.join(SCHOOL_BACKUPS_DIR, `${uniqueStamp}-${slug}.json`);
        await writeFile(schoolFile, JSON.stringify(ctx.schoolBackupPayload(school, ctx.sanitizeStateForClient(currentState)), null, 2), 'utf8');
      }
      
      return sendJson(res, 200, {
        ok: true,
        message: `تم إنشاء نسخة احتياطية يدوية بنجاح (${uniqueStamp}).`,
        stamp: uniqueStamp,
        schoolsCount: currentState.schools?.length || 0,
      });
    } catch (err) {
      return sendJson(res, 500, { ok: false, message: 'تعذر إنشاء النسخة الاحتياطية: ' + (err?.message || '') });
    }
  });

  // === GET /api/backups/list ===
  router.get('/list', async (req, res) => {
    const actor = await ctx.getUserFromToken(parseAuthToken(req));
    if (!actor || actor.role !== 'superadmin') return sendJson(res, 403, { ok: false, message: 'فقط الأدمن العام يمكنه عرض النسخ الاحتياطية.' });
    
    try {
      const globalFiles = existsSync(GLOBAL_BACKUPS_DIR) ? await readdir(GLOBAL_BACKUPS_DIR) : [];
      const schoolFiles = existsSync(SCHOOL_BACKUPS_DIR) ? await readdir(SCHOOL_BACKUPS_DIR) : [];
      
      const globalList = [];
      for (const f of globalFiles.filter(f => f.endsWith('.json')).sort().reverse()) {
        try {
          const s = await stat(path.join(GLOBAL_BACKUPS_DIR, f));
          globalList.push({ name: f, size: s.size, mtime: s.mtime.toISOString(), type: 'global' });
        } catch {}
      }
      
      const schoolList = [];
      for (const f of schoolFiles.filter(f => f.endsWith('.json')).sort().reverse()) {
        try {
          const s = await stat(path.join(SCHOOL_BACKUPS_DIR, f));
          schoolList.push({ name: f, size: s.size, mtime: s.mtime.toISOString(), type: 'school' });
        } catch {}
      }
      
      return sendJson(res, 200, { ok: true, global: globalList, schools: schoolList, retentionDays: BACKUP_RETENTION_DAYS });
    } catch (err) {
      return sendJson(res, 500, { ok: false, message: 'تعذر قراءة قائمة النسخ الاحتياطية.' });
    }
  });

  // === POST /api/backups/restore-from-upload ===
  router.post('/restore-from-upload', async (req, res) => {
    const actor = await ctx.getUserFromToken(parseAuthToken(req));
    if (!actor || actor.role !== 'superadmin') return sendJson(res, 403, { ok: false, message: 'فقط الأدمن العام يمكنه استعادة النسخ الاحتياطية.' });
    
    try {
      const body = await readJsonBody(req);
      const stateToRestore = body.state || body;
      if (!stateToRestore || !Array.isArray(stateToRestore.schools)) {
        return sendJson(res, 400, { ok: false, message: 'بنية الملف غير صالحة. تأكد أن الملف نسخة احتياطية صحيحة من المنصة.' });
      }
      const saved = await ctx.saveSharedState(stateToRestore, actor);
      return sendJson(res, 200, { ok: true, message: 'تمت استعادة النسخة من الملف بنجاح.', state: ctx.sanitizeStateForClient(saved), sessionUser: actor });
    } catch (err) {
      return sendJson(res, 500, { ok: false, message: 'تعذر قراءة أو تطبيق الملف: ' + (err?.message || '') });
    }
  });

  // === Dynamic: restore/download/delete by type and filename ===
  // These use regex patterns from the original code
  router.route('POST', /^\/api\/backups\/restore\/(global|school)\/(.+)$/, async (req, res) => {
    const actor = await ctx.getUserFromToken(parseAuthToken(req));
    if (!actor || actor.role !== 'superadmin') return sendJson(res, 403, { ok: false, message: 'فقط الأدمن العام يمكنه استعادة النسخ الاحتياطية.' });
    
    const match = req.url.match(/^\/api\/backups\/restore\/(global|school)\/(.+)$/);
    if (!match) return sendJson(res, 400, { ok: false });
    
    const backupType = match[1];
    const safeName = path.basename(match[2]);
    if (!safeName.endsWith('.json')) return sendJson(res, 400, { ok: false, message: 'يمكن استعادة ملفات JSON فقط.' });
    
    const dir = backupType === 'global' ? GLOBAL_BACKUPS_DIR : SCHOOL_BACKUPS_DIR;
    const filePath = path.join(dir, safeName);
    if (!existsSync(filePath)) return sendJson(res, 404, { ok: false, message: 'ملف النسخة الاحتياطية غير موجود.' });
    
    try {
      const raw = readFileSync(filePath, 'utf8');
      const parsed = JSON.parse(raw);
      const stateToRestore = parsed.state || parsed;
      if (!stateToRestore || !Array.isArray(stateToRestore.schools)) {
        return sendJson(res, 400, { ok: false, message: 'بنية النسخة الاحتياطية غير صالحة.' });
      }
      const saved = await ctx.saveSharedState(stateToRestore, actor);
      return sendJson(res, 200, { ok: true, message: `تمت استعادة النسخة الاحتياطية "${safeName}" بنجاح.`, state: ctx.sanitizeStateForClient(saved), sessionUser: actor });
    } catch (err) {
      return sendJson(res, 500, { ok: false, message: 'تعذر تطبيق النسخة: ' + (err?.message || '') });
    }
  });

  return router;
}

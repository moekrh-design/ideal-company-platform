import http from 'node:http';
import { readFileSync, existsSync, createReadStream, mkdirSync, writeFileSync } from 'node:fs';
import { writeFile, mkdir } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import crypto from 'node:crypto';
import pg from 'pg';
const { Pool } = pg;
import { createDefaultSharedState, hydrateSharedState, isRoleEnabledForSchool, defaultSettings, ensureDemoUsers } from './state.js';
import { renderTeacherPortalHtml } from './teacher-portal.js';
import nodemailer from 'nodemailer';
import bcrypt from 'bcrypt';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, '..');
const DIST_DIR = path.join(ROOT_DIR, 'dist');
const DATA_DIR = path.join(ROOT_DIR, 'data');
const UPLOADS_DIR = path.join(DATA_DIR, 'uploads');
const FACE_UPLOADS_DIR = path.join(UPLOADS_DIR, 'faces');
const EVIDENCE_UPLOADS_DIR = path.join(UPLOADS_DIR, 'program-evidence');
const BACKUPS_DIR = path.join(DATA_DIR, 'backups');
const GLOBAL_BACKUPS_DIR = path.join(BACKUPS_DIR, 'global');
const SCHOOL_BACKUPS_DIR = path.join(BACKUPS_DIR, 'schools');
const BACKUP_RETENTION_DAYS = Number(process.env.BACKUP_RETENTION_DAYS || 30);
const PORT = Number(process.env.PORT || 4000);
const SESSION_DAYS = Number(process.env.SESSION_DAYS || 90);
const PARENT_SESSION_DAYS = Number(process.env.PARENT_SESSION_DAYS || 90);
const JSON_LIMIT_BYTES = 50 * 1024 * 1024;
const SCREEN_TRANSITION_KEYS = ["fade","cut","slide-left","slide-right","slide-up","slide-down","zoom-in","zoom-out","flip-x","flip-y","rotate-soft","rotate-in","blur","bounce","scale-up","scale-down","swing","curtain","diagonal","pop","float","random"];
const SCREEN_THEME_KEYS = ["emerald-night","blue-contrast","violet-stage","sunrise","graphite"];
const SCREEN_TEMPLATE_KEYS = ["executive","reception","leaderboard","news"];
const TICKER_BG_KEYS = ["amber","navy","emerald","rose","slate"];

// State cache (must be declared before any top-level await calls)
let _stateCache = null;const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DATABASE_URL ? { rejectUnauthorized: false } : false,
  max: 10,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 10000,
});

// Helper: run a queasync function dbQuery(text, params = []) {
  const client = await pool.connect();
  try {
    const res = await client.query(text, params);
    return res.rows;
  } finally {
    client.release();
  }
}per: run a query and return firstasync function dbQueryOne(text, params = []) {
  const rows = await dbQuery(text, params);
  return rows[0] || null;
}lper: run a query and return all rows (alias for dbQueryasync function dbQueryAll(text, params = []) {
  return dbQuery(text, params);
}lper: run a query with no returnasync function dbRun(text, params = []) {
  await dbQuery(text, params);ion initializeDatabase() {
  await dbRun(`
    CREATE TABLE IF NOT EXISTS app_meta (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL,
      updated_at TEXT NOT NULL
    )
  `);
  await dbRun(`
    CREATE TABLE IF NOT EXISTS sessions (
      token TEXT PRIMARY KEY,
      user_id INTEGER NOT NULL,
      username TEXT NOT NULL,
      role TEXT NOT NULL,
      school_id INTEGER,
      created_at TEXT NOT NULL,
      expires_at TEXT NOT NULL
    )
  `);
  await dbRun(`
    CREATE TABLE IF NOT EXISTS audit_log (
      id SERIAL PRIMARY KEY,
      actor_username TEXT,
      actor_role TEXT,
      action TEXT NOT NULL,
      created_at TEXT NOT NULL,
      details TEXT
    )
  `);
  await dbRun(`
    CREATE TABLE IF NOT EXISTS auth_otps (
      id TEXT PRIMARY KEY,
      user_id INTEGER NOT NULL,
      purpose TEXT NOT NULL,
      delivery TEXT NOT NULL,
      identifier TEXT NOT NULL,
      code_hash TEXT NOT NULL,
      destination_preview TEXT,
      created_at TEXT NOT NULL,
      expires_at TEXT NOT NULL,
      consumed_at TEXT
    )
  `);
  await dbRun(`
    CREATE TABLE IF NOT EXISTS auth_lockouts (
      id SERIAL PRIMARY KEY,
      identifier_key TEXT,
      user_id INTEGER,
      scope TEXT NOT NULL,
      reason TEXT,
      failure_count INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      expires_at TEXT NOT NULL,
      lifted_at TEXT
    )
  `);
}

function nowIso() {
  return new Date().toISOString();
}

function todayStamp() {
  return new Date().toISOString().slice(0, 10);
}

// alias for todayStamp
function todayIso() {
  return todayStamp();
}

function safeBackupSlug(value = 'school') {
  return String(value || 'school').trim().toLowerCase().replace(/[^a-z0-9؀-ۿ]+/g, '-').replace(/^-+|-+$/g, '') || 'school';
}

function schoolBackupPayload(school, state) {
  return {
    exportedAt: nowIso(),
    type: 'school-daily-backup',
    school,
    users: (state.users || []).filter((user) => Number(user.schoolId) === Number(school.id)),
    scanLog: (state.scanLog || []).filter((item) => Number(item.schoolId) === Number(school.id)),
    actionLog: (state.actionLog || []).filter((item) => Number(item.schoolId) === Number(school.id)),
    executiveReport: {
      ...(state.executiveReport || {}),
      schools: (state.executiveReport?.schools || []).filter((item) => Number(item.id) === Number(school.id)),
    },
  };
}


async function pruneBackupDirectory(dirPath, keepDays = BACKUP_RETENTION_DAYS) {
  try {
    const { readdir, rm, stat } = await import('node:fs/promises');
    const entries = await readdir(dirPath);
    const threshold = Date.now() - keepDays * 24 * 60 * 60 * 1000;
    await Promise.all(entries.map(async (name) => {
      const filePath = path.join(dirPath, name);
      try {
        const info = await stat(filePath);
        if (info.mtimeMs < threshold) {
          await rm(filePath, { force: true, recursive: true });
        }
      } catch {}
    }));
  } catch {}
}

async function writeJsonBackupIfMissing(filePath, payload) {
  if (existsSync(filePath)) return false;
  await writeFile(filePath, JSON.stringify(payload, null, 2), 'utf8');
  return true;
}

async function copyDbBackupIfMissing(filePath) {
  // PostgreSQL: no local DB file to copy
  return false;
}

async function ensureDailyBackups(reason = 'save', state = null) {
  try {
    const currentState = state || getSharedState();
    const stamp = todayStamp();
    const globalJsonPath = path.join(GLOBAL_BACKUPS_DIR, `platform-${stamp}.json`);
    const globalDbPath = path.join(GLOBAL_BACKUPS_DIR, `platform-${stamp}.db`);
    const globalPayload = {
      exportedAt: nowIso(),
      type: 'platform-daily-backup',
      reason,
      state: sanitizeStateForClient(currentState),
    };
    await writeJsonBackupIfMissing(globalJsonPath, globalPayload);
    await copyDbBackupIfMissing(globalDbPath);

    for (const school of currentState.schools || []) {
      const slug = safeBackupSlug(school.code || school.name || `school-${school.id}`);
      const schoolFile = path.join(SCHOOL_BACKUPS_DIR, `${stamp}-${slug}.json`);
      await writeJsonBackupIfMissing(schoolFile, schoolBackupPayload(school, sanitizeStateForClient(currentState)));
    }

    const latestMeta = {
      updatedAt: nowIso(),
      stamp,
      reason,
      globalJson: path.basename(globalJsonPath),
      globalDb: path.basename(globalDbPath),
      schools: (currentState.schools || []).map((school) => ({
        id: school.id,
        name: school.name,
        code: school.code,
        file: `${stamp}-${safeBackupSlug(school.code || school.name || `school-${school.id}`)}.json`,
      })),
    };
    await writeFile(path.join(BACKUPS_DIR, 'latest.json'), JSON.stringify(latestMeta, null, 2), 'utf8');
    await pruneBackupDirectory(GLOBAL_BACKUPS_DIR);
    await pruneBackupDirectory(SCHOOL_BACKUPS_DIR);
  } catch (error) {
    console.error('daily backup error', error);
  }
}

function daysFromNow(days) {
  return new Date(Date.now() + days * 24 * 60 * 60 * 1000).toISOString();
}
function isHashedPassword(password) {
  // bcrypt hashes start with $2a$, $2b$, $2y$
  return String(password || "").startsWith("$2a$") || String(password || "").startsWith("$2b$") || String(password || "").startsWith("$2y$");
}

async function hashPassword(password) {
  const plain = String(password || "");
  if (!plain) return "";
  const saltRounds = 10; // Cost factor for hashing
  return await bcrypt.hash(plain, saltRounds);
}

async function verifyPassword(plainPassword, storedPassword) {
  const plain = String(plainPassword || "");
  const stored = String(storedPassword || "");

  if (!stored) return false;

  // If the stored password is not a bcrypt hash, compare as plain text (for legacy passwords)
  if (!isHashedPassword(stored)) {
    return plain === stored;
  }

  // For bcrypt hashes, use bcrypt.compare
  try {
    return await bcrypt.compare(plain, stored);
  } catch (error) {
    console.error("Error comparing passwords:", error);
    return false;
  }
}

async function normalizeUsersForStorage(users = [], existingUsers = [], schools = []) {
  const preparedUsers = ensureDemoUsers(users || [], schools || []);
  const existingMap = new Map((existingUsers || []).map((user) => [user.id, user]));
  return await Promise.all(preparedUsers.map(async (user) => {
    const previous = existingMap.get(user.id);
    const incomingPassword = user.password;
    let password = incomingPassword;
    if (!String(incomingPassword || '').trim() && previous?.password) {
      password = previous.password;
    }

    if (String(password || '').trim() && !isHashedPassword(password)) {
      // This will be handled by the calling function (normalizeStateForStorage)
      // or should be awaited if this function becomes async.
      // For now, we'll assume it's handled by the caller or will be fixed.
      password = await hashPassword(password);
    }
    return { ...user, password: password || '' };
  }));
}

async function normalizeStateForStorage(state, existingState = null) {
  const hydrated = hydrateSharedState(state);
  return {
    ...hydrated,
    users: await normalizeUsersForStorage(hydrated.users, existingState?.users || hydrated.users, hydrated.schools),
  };
}

function sanitizeStateForClient(state) {
  return {
    ...state,
    users: (state.users || []).map((user) => ({ ...user, password: '' })),
  };
}

async function writeStateRow(state, actor = null) {
  await dbRun(
    'INSERT INTO app_meta (key, value, updated_at) VALUES ($1, $2, $3) ON CONFLICT(key) DO UPDATE SET value = EXCLUDED.value, updated_at = EXCLUDED.updated_at',
    ['shared_state', JSON.stringify(state), nowIso()]
  );
  if (actor) await audit(actor, 'save_state', { schools: state.schools.length, users: state.users.length });
}

async function audit(actor, action, details = {}) {
  try {
    await dbRun(
      'INSERT INTO audit_log (actor_username, actor_role, action, created_at, details) VALUES ($1, $2, $3, $4, $5)',
      [actor?.username || '', actor?.role || '', action, nowIso(), JSON.stringify(details)]
    );
  } catch (e) {
    console.error('audit error:', e.message);
  }
}

async function auditAuthEvent(action, details = {}, actor = null) {
  await audit(actor, action, details);
}

async function readAuthLogs(limit = 200) {
  const rows = await dbQuery(
    `SELECT id, actor_username, actor_role, action, created_at, details
     FROM audit_log
     WHERE action LIKE 'auth_%' OR action IN ('login', 'logout')
     ORDER BY id DESC
     LIMIT $1`,
    [Math.max(1, Math.min(500, Number(limit) || 200))]
  );
  return rows.map((row) => ({
    id: row.id,
    actorUsername: row.actor_username || '',
    actorRole: row.actor_role || '',
    action: row.action,
    createdAt: row.created_at,
    details: (() => {
      try {
        return row.details ? JSON.parse(row.details) : {};
      } catch {
        return {};
      }
    })(),
  }));
}

async function ensureStateSeeded() {
  const row = await dbQueryOne('SELECT value FROM app_meta WHERE key = $1', ['shared_state']);
  if (!row) {
    const state = await normalizeStateForStorage(createDefaultSharedState());
    await writeStateRow(state);
    await audit(null, 'seed_state', { schools: state.schools.length, users: state.users.length });
  }
}

async function ensureStateMigrations() {
  const row = await dbQueryOne('SELECT value FROM app_meta WHERE key = $1', ['shared_state']);
  if (!row?.value) return;
  try {
    const parsed = JSON.parse(row.value);
    const normalized = await normalizeStateForStorage(parsed, parsed);
    if (JSON.stringify(parsed) !== JSON.stringify(normalized)) {
      await writeStateRow(normalized);
      await audit(null, 'migrate_state', { users: normalized.users.length });
    }
  } catch {
    const state = await normalizeStateForStorage(createDefaultSharedState());
    await writeStateRow(state);
  }
}

async function getSharedStateAsync() {
  const row = await dbQueryOne('SELECT value FROM app_meta WHERE key = $1', ['shared_state']);  if (!row) return await normalizeStateForStorage(createDefaultSharedState()););
  try {
    return await normalizeStateForStorage(JSON.parse(row.value), JSON.parse(row.value));
  } catch {
    return await normalizeStateForStorage(createDefaultSharedState());
  }
}

function getSharedState() {
  if (!_stateCache) {
    throw new Error('State cache not initialized. Call await refreshStateCache();first.');
  }
  return _stateCache;
}

async function refreshStateCache() {
  _stateCache = await getSharedStateAsync();
  return _stateCache;
}

async function saveSharedState(state, actor = null) {
  const current = getSharedState();
  const hydrated = await normalizeStateForStorage(state, current);
  await writeStateRow(hydrated, actor);
  _stateCache = hydrated;
  void ensureDailyBackups('save', hydrated);
  broadcastAllLive(hydrated);
  return hydrated;
}

async function cleanupExpiredSessions() {
  await dbRun('DELETE FROM sessions WHERE expires_at <= $1', [nowIso()]);
}

async function cleanupExpiredAuthOtps() {
  await dbRun('DELETE FROM auth_otps WHERE expires_at <= $1 OR consumed_at IS NOT NULL', [nowIso()]);
}

async function cleanupExpiredAuthLockouts() {
  await dbRun('DELETE FROM auth_lockouts WHERE expires_at <= $1 OR lifted_at IS NOT NULL', [nowIso()]);
}

function normalizeIdentifierKey(identifier = '') {
  return String(identifier || '').trim().toLowerCase();
}

function getAuthFailureActionsForScope(scope = 'password') {
  return scope === 'otp' ? ['auth_verify_otp_failed'] : ['auth_login_failed'];
}

async function getRecentAuthFailures(scope = 'password', identifier = '', userId = null, windowMinutes = 15) {
  const since = new Date(Date.now() - Math.max(1, Number(windowMinutes) || 15) * 60 * 1000).toISOString();
  const actions = getAuthFailureActionsForScope(scope);
  const placeholders = actions.map((_, i) => `$${i + 2}`).join(',');
  const rows = await dbQuery(
    `SELECT action, created_at, details
     FROM audit_log
     WHERE created_at >= $1
       AND action IN (${placeholders})
     ORDER BY id DESC
     LIMIT 500`,
    [since, ...actions]
  );
  const key = normalizeIdentifierKey(identifier);
  return rows.filter((row) => {
    let details = {};
    try { details = row.details ? JSON.parse(row.details) : {}; } catch { details = {}; }
    const rowIdentifier = normalizeIdentifierKey(details.identifier || details.username || '');
    const rowUserId = details.userId != null ? Number(details.userId) : null;
    if (userId != null && rowUserId === Number(userId)) return true;
    if (key && rowIdentifier === key) return true;
    return false;
  });
}

async function getActiveAuthLockout(identifier = '', userId = null, scope = 'any') {
await cleanupExpiredAuthLockouts();  const key = normalizeIdentifierKey(identifier);
  const rows = await dbQuery(
    `SELECT *
     FROM auth_lockouts
     WHERE lifted_at IS NULL
       AND expires_at > $1
       AND ($2 = 'any' OR scope = $2)
       AND (($3 <> '' AND identifier_key = $3) OR ($4::integer IS NOT NULL AND user_id = $4::integer))
     ORDER BY updated_at DESC
     LIMIT 20`,
    [nowIso(), String(scope || 'any'), key, userId == null ? null : Number(userId)]
  );
  return rows[0] || null;
}

async function clearAuthLockouts(identifier = '', userId = null, actor = null) {
  const active = await getActiveAuthLockout(identifier, userId, 'any');
  if (!active) return null;
  const key = normalizeIdentifierKey(identifier);
  await dbRun(
    `UPDATE auth_lockouts
     SET lifted_at = $1, updated_at = $2
     WHERE lifted_at IS NULL
       AND (($3 <> '' AND identifier_key = $3) OR ($4::integer IS NOT NULL AND user_id = $4::integer))`,
    [nowIso(), nowIso(), key, userId == null ? null : Number(userId)]
  );
  await auditAuthEvent('auth_lockout_cleared', { identifier: key, userId: userId == null ? null : Number(userId), scope: active.scope }, actor);
  return active;
}

async function notifyAuthSecurityAlert(state, payload = {}) {
  const authSettings = hydrateAuthSettings(state.settings || {});
  const security = authSettings.security || defaultSettings.auth.security;
  if (!security.notifyAdminOnLock) return state;
  const channels = { ...defaultSettings.auth.security.notificationChannels, ...(security.notificationChannels || {}) };
  const message = payload.message || `تنبيه أمني: تم قفل محاولة الدخول مؤقتًا للحساب ${payload.identifier || payload.username || 'غير معروف'} بسبب كثرة المحاولات الفاشلة.`;
  const next = structuredClone(state);
  if (channels.internal) {
    next.notifications = Array.isArray(next.notifications) ? next.notifications : [];
    next.notifications = [{ id: Date.now(), title: 'تنبيه أمني للدخول', body: message, time: 'الآن' }, ...next.notifications].slice(0, 200);
  }
  const admins = (next.users || []).filter((user) => user.status === 'نشط' && user.role === 'superadmin');
  const integrations = authSettings.integrations || defaultSettings.auth.integrations;
  for (const admin of admins) {
    try {
      if (channels.email && admin.email) {
        await sendAuthEmail(authSettings.email || {}, admin.email, '000000', { customSubject: 'تنبيه أمني في منصة الشركة المثالية', customText: message });
      }
    } catch {}
    try {
      if (channels.sms && admin.mobile) {
        await sendSmsMessage(integrations.sms || {}, normalizePhoneNumber(admin.mobile), message);
      }
    } catch {}
    try {
      if (channels.whatsapp && admin.mobile) {
        await sendWhatsappCloudMessage(integrations.whatsapp || {}, normalizePhoneNumber(admin.mobile), message);
      }
    } catch {}
  }
  auditAuthEvent('auth_security_alert', { identifier: payload.identifier || '', userId: payload.userId || null, scope: payload.scope || '', message, channels }, payload.actor || null);
  return next;
}

async function registerAuthFailureAndMaybeLock(state, scope = 'password', identifier = '', user = null, actor = null) {
  const authSettings = hydrateAuthSettings(state.settings || {});
  const security = authSettings.security || defaultSettings.auth.security;
  const scopeEnabled = scope === 'otp' ? security.applyToOtp : security.applyToPassword;
  if (!security.enabled || !scopeEnabled) return { state, locked: false, failureCount: 0 };
  const failures = await getRecentAuthFailures(scope, identifier, user?.id ?? null, security.trackWindowMinutes || 15);
  const failureCount = failures.length;
  const maxFailedAttempts = Math.max(2, Number(security.maxFailedAttempts) || 5);
  if (failureCount < maxFailedAttempts) return { state, locked: false, failureCount };
  const existing = await getActiveAuthLockout(identifier, user?.id ?? null, scope);
  if (existing) return { state, locked: true, failureCount, lockout: existing };
  const createdAt = nowIso();
  const expiresAt = new Date(Date.now() + Math.max(1, Number(security.lockoutMinutes) || 15) * 60 * 1000).toISOString();
  await dbRun(
    'INSERT INTO auth_lockouts (identifier_key, user_id, scope, reason, failure_count, created_at, updated_at, expires_at, lifted_at) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NULL)',
    [normalizeIdentifierKey(identifier), user?.id == null ? null : Number(user.id), scope, 'too_many_failed_attempts', failureCount, createdAt, createdAt, expiresAt]
  );
  const alertMessage = `تم قفل ${scope === 'otp' ? 'التحقق بالرمز' : 'الدخول بكلمة المرور'} مؤقتًا لمدة ${Math.max(1, Number(security.lockoutMinutes) || 15)} دقيقة للحساب ${user?.username || normalizeIdentifierKey(identifier) || 'غير معروف'} بعد ${failureCount} محاولات فاشلة.`;
  let next = state;
  if (security.notifyAdminOnLock) {
    next = await notifyAuthSecurityAlert(state, { identifier: normalizeIdentifierKey(identifier), userId: user?.id ?? null, scope, message: alertMessage, actor });
    await await saveSharedState(next, actor);
  }
  return { state: next, locked: true, failureCount, lockout: { expires_at: expiresAt, scope, failure_count: failureCount } };
}

function getAuthLockoutMessage(lockout) {
  const expiry = lockout?.expires_at ? new Date(lockout.expires_at) : null;
  const when = expiry && !Number.isNaN(expiry.getTime()) ? new Intl.DateTimeFormat('ar-SA', { hour: 'numeric', minute: '2-digit', day: 'numeric', month: 'short' }).format(expiry) : 'لاحقًا';
  return `تم قفل هذه المحاولة مؤقتًا بسبب كثرة المحاولات الفاشلة. ينتهي القفل في ${when}.`;
}

function normalizeStringArray(values = []) {
  return Array.from(new Set((Array.isArray(values) ? values : []).map((value) => String(value).trim()).filter(Boolean)));
}

function hydrateAuthSettings(settings = {}) {
  return {
    ...defaultSettings.auth,
    ...(settings?.auth || {}),
    delivery: { ...defaultSettings.auth.delivery, ...(settings?.auth?.delivery || {}) },
    targeting: {
      ...defaultSettings.auth.targeting,
      ...(settings?.auth?.targeting || {}),
      selectedRoleKeys: normalizeStringArray(settings?.auth?.targeting?.selectedRoleKeys || defaultSettings.auth.targeting.selectedRoleKeys),
      selectedUserIds: normalizeStringArray(settings?.auth?.targeting?.selectedUserIds || defaultSettings.auth.targeting.selectedUserIds),
      excludedUserIds: normalizeStringArray(settings?.auth?.targeting?.excludedUserIds || defaultSettings.auth.targeting.excludedUserIds),
    },
    email: { ...defaultSettings.auth.email, ...(settings?.auth?.email || {}) },
    integrations: {
      sms: { ...defaultSettings.auth.integrations.sms, ...(settings?.auth?.integrations?.sms || {}) },
      whatsapp: { ...defaultSettings.auth.integrations.whatsapp, ...(settings?.auth?.integrations?.whatsapp || {}) },
    },
    security: {
      ...defaultSettings.auth.security,
      ...(settings?.auth?.security || {}),
      notificationChannels: { ...defaultSettings.auth.security.notificationChannels, ...(settings?.auth?.security?.notificationChannels || {}) },
    },
  };
}

function isUserSelectedForOtp(user, authSettings) {
  const targeting = authSettings?.targeting || defaultSettings.auth.targeting;
  const userId = String(user?.id || '');
  if (!userId) return false;
  if ((targeting.excludedUserIds || []).includes(userId)) return false;
  if (String(targeting.applyScope || 'all') !== 'selected') return true;
  if ((targeting.selectedUserIds || []).includes(userId)) return true;
  if ((targeting.selectedRoleKeys || []).includes(String(user?.role || ''))) return true;
  return false;
}

function isOtpAllowedForUser(user, authSettings) {
  if (!(authSettings?.otpEnabled || authSettings?.passwordlessEnabled)) return false;
  return isUserSelectedForOtp(user, authSettings);
}

function isPasswordLoginAllowedForUser(user, authSettings) {
  if (authSettings?.allowPasswordLogin === false) return false;
  if (!authSettings?.targeting?.forceForSelected) return true;
  return !isUserSelectedForOtp(user, authSettings);
}

function getUserPrimarySchool(state, user) {
  if (!user || user.role === 'superadmin') return null;
  return (state.schools || []).find((school) => Number(school.id) === Number(user.schoolId)) || null;
}

function findUserByIdentifier(state, identifier, identifierMode = 'username') {
  const probe = String(identifier || '').trim().toLowerCase();
  const mobileProbe = normalizePhoneNumber(probe);
  if (!probe) return null;
  return (state.users || []).find((user) => {
    const username = String(user.username || '').trim().toLowerCase();
    const email = String(user.email || '').trim().toLowerCase();
    const mobile = normalizePhoneNumber(user.mobile || '');
    if (identifierMode === 'username') return username === probe;
    if (identifierMode === 'email_or_username') return username === probe || email === probe;
    return username === probe || email === probe || (mobileProbe && mobile === mobileProbe);
  }) || null;
}

function generateOtpCode(length = 6) {
  const size = Math.max(4, Math.min(8, Number(length) || 6));
  const max = 10 ** size;
  return String(crypto.randomInt(0, max)).padStart(size, '0');
}

function maskEmail(email = '') {
  const value = String(email || '').trim();
  const [name, domain] = value.split('@');
  if (!name || !domain) return 'بريد غير صالح';
  if (name.length <= 2) return `${name[0] || '*'}***@${domain}`;
  return `${name.slice(0, 2)}***@${domain}`;
}

function maskPhone(phone = '') {
  const digits = normalizePhoneNumber(phone);
  if (!digits) return 'رقم غير صالح';
  return `${digits.slice(0, 3)}***${digits.slice(-2)}`;
}

async function sendAuthEmail(config, to, code, context = {}) {
  if (!config.smtpHost || !config.smtpPort || !config.smtpUsername || !config.smtpPassword || !config.fromEmail) {
    return { previewOnly: true, previewCode: code, destinationPreview: maskEmail(to) };
  }
  const transporter = nodemailer.createTransport({
    host: config.smtpHost,
    port: Number(config.smtpPort || 587),
    secure: Boolean(config.smtpSecure),
    auth: { user: config.smtpUsername, pass: config.smtpPassword },
  });
  await transporter.sendMail({
    from: `"${config.fromName || 'منصة الشركة المثالية'}" <${config.fromEmail}>`,
    to,
    subject: 'رمز التحقق لتسجيل الدخول',
    text: `رمز التحقق الخاص بك هو: ${code}
صالح لمدة ${context.expiryMinutes || 10} دقائق.`,
    html: `<div dir="rtl" style="font-family:Tahoma,Arial,sans-serif"><h2>رمز التحقق لتسجيل الدخول</h2><p>رمزك هو:</p><div style="font-size:32px;font-weight:700;letter-spacing:4px">${code}</div><p>الصلاحية: ${context.expiryMinutes || 10} دقائق.</p></div>`,
  });
  return { destinationPreview: maskEmail(to) };
}

async function dispatchAuthOtp(state, user, delivery, code, authSettings) {
  if (delivery === 'email') {
    const email = String(user.email || '').trim().toLowerCase();
    if (!email) throw new Error('هذا الحساب غير مرتبط ببريد إلكتروني.');
    return sendAuthEmail(authSettings.email || {}, email, code, { expiryMinutes: authSettings.otpExpiryMinutes });
  }
  if (delivery === 'sms') {
    const phone = normalizePhoneNumber(user.mobile || '');
    if (!phone) throw new Error('هذا الحساب غير مرتبط برقم جوال.');
    const integration = authSettings.integrations || defaultSettings.auth.integrations;
    await sendSmsMessage(integration.sms || {}, phone, `رمز التحقق للدخول: ${code}. صالح لمدة ${authSettings.otpExpiryMinutes || 10} دقائق.`);
    return { destinationPreview: maskPhone(phone) };
  }
  if (delivery === 'whatsapp') {
    const phone = normalizePhoneNumber(user.mobile || '');
    if (!phone) throw new Error('هذا الحساب غير مرتبط برقم جوال.');
    const integration = authSettings.integrations || defaultSettings.auth.integrations;
    await sendWhatsappCloudMessage(integration.whatsapp || {}, phone, `رمز التحقق للدخول: ${code}
الصلاحية: ${authSettings.otpExpiryMinutes || 10} دقائق.`);
    return { destinationPreview: maskPhone(phone) };
  }
  throw new Error('قناة التحقق غير مدعومة.');
}

async function runAuthDeliveryTest(state, actor, body = {}) {
  const delivery = String(body.delivery || '').trim().toLowerCase();
  const authSettings = hydrateAuthSettings(state.settings || {});
  if (!delivery) throw new Error('حدد قناة الاختبار أولاً.');
  if (!authSettings.delivery?.[delivery]) throw new Error('هذه القناة غير مفعلة حاليًا من إعدادات الدخول والتحقق.');
  if (delivery === 'email') {
    const targetEmail = String(body.target || '').trim().toLowerCase();
    if (!targetEmail) throw new Error('أدخل بريدًا إلكترونيًا لاختبار القناة.');
    const code = String(body.code || '246810');
    const result = await sendAuthEmail(authSettings.email || {}, targetEmail, code, { expiryMinutes: authSettings.otpExpiryMinutes });
    return { message: 'تم تنفيذ اختبار البريد بنجاح.', destinationPreview: result.destinationPreview || maskEmail(targetEmail), previewCode: result.previewCode };
  }
  const targetPhone = normalizePhoneNumber(body.target || '');
  if (!targetPhone) throw new Error('أدخل رقم جوال صالحًا لاختبار القناة.');
  const integration = authSettings.integrations || defaultSettings.auth.integrations;
  if (delivery === 'sms') {
    const sent = await sendSmsMessage(integration.sms || {}, targetPhone, `رسالة اختبار من منصة الشركة المثالية للتحقق من قناة OTP. الوقت: ${new Date().toLocaleString('ar-SA')}`);
    return { message: 'تم تنفيذ اختبار SMS بنجاح.', destinationPreview: maskPhone(targetPhone), providerMessageId: sent.providerMessageId || '' };
  }
  if (delivery === 'whatsapp') {
    const sent = await sendWhatsappCloudMessage(integration.whatsapp || {}, targetPhone, `رسالة اختبار من منصة الشركة المثالية للتحقق من قناة OTP.
الوقت: ${new Date().toLocaleString('ar-SA')}`);
    return { message: 'تم تنفيذ اختبار واتساب بنجاح.', destinationPreview: maskPhone(targetPhone), providerMessageId: sent.providerMessageId || '' };
  }
  throw new Error('قناة الاختبار غير مدعومة.');
}

async function runAuthOtpScenarioTest(state, actor, body = {}) {
  const delivery = String(body.delivery || '').trim().toLowerCase();
  const targetUserId = Number(body.userId || 0);
  if (!targetUserId) throw new Error('حدد المستخدم التجريبي أولاً.');
  const user = (state.users || []).find((item) => Number(item.id) === targetUserId);
  if (!user || user.status !== 'نشط') throw new Error('المستخدم التجريبي غير موجود أو غير نشط.');
  const authSettings = hydrateAuthSettings(state.settings || {});
  if (!(authSettings.otpEnabled || authSettings.passwordlessEnabled)) throw new Error('فعّل OTP أو Passwordless أولاً من الإعدادات.');
  if (!authSettings.delivery?.[delivery]) throw new Error('القناة المختارة غير مفعلة داخل إعدادات الدخول والتحقق.');
  const school = (state.schools || []).find((item) => Number(item.id) === Number(user.schoolId));
  if (!isRoleEnabledForSchool(user.role, school)) throw new Error('دور المستخدم غير مفعّل في مدرسته.');
  if (!isOtpAllowedForUser(user, authSettings)) throw new Error('هذا المستخدم غير مشمول بخدمة OTP حسب إعدادات الأدمن.');
  const identifier = delivery === 'email'
    ? String(user.email || '').trim().toLowerCase()
    : String(delivery === 'sms' || delivery === 'whatsapp' ? normalizePhoneNumber(user.mobile || '') : user.username || '').trim().toLowerCase();
  if (!identifier) throw new Error(delivery === 'email' ? 'هذا المستخدم لا يملك بريدًا إلكترونيًا.' : 'هذا المستخدم لا يملك رقم جوال.');
  const code = generateOtpCode(authSettings.otpLength || 6);
  const request = await createAuthOtpRequest(user, identifier, delivery, code, authSettings);
  const dispatchResult = await dispatchAuthOtp(state, user, delivery, code, authSettings);
  await finalizeAuthOtpDestination(request.id, dispatchResult.destinationPreview || '');
  auditAuthEvent('auth_scenario_test', { targetUserId: user.id, delivery }, { username: actor.username, role: actor.role });
  return {
    message: 'تم تنفيذ اختبار OTP على المستخدم المحدد بنجاح.',
    expiresAt: request.expiresAt,
    destinationPreview: dispatchResult.destinationPreview || '',
    previewCode: dispatchResult.previewCode,
    userName: user.name || user.username,
  };
}


async function createAuthOtpRequest(user, identifier, delivery, code, authSettings) {
  await cleanupExpiredAuthOtps();
  await dbRun('DELETE FROM auth_otps WHERE user_id = $1 AND purpose = $2', [Number(user.id), 'login']);
  const id = `otp_${crypto.randomBytes(10).toString('hex')}`;
  const createdAt = nowIso();
  const expiresAt = new Date(Date.now() + (Math.max(1, Number(authSettings.otpExpiryMinutes) || 10) * 60 * 1000)).toISOString();
  await dbRun(
    'INSERT INTO auth_otps (id, user_id, purpose, delivery, identifier, code_hash, destination_preview, created_at, expires_at, consumed_at) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, NULL)',
    [id, Number(user.id), 'login', delivery, String(identifier || '').trim().toLowerCase(), await hashPassword(code), '', createdAt, expiresAt]
  );
  return { id, expiresAt };
}

async function finalizeAuthOtpDestination(id, destinationPreview = '') {
  await dbRun('UPDATE auth_otps SET destination_preview = $1 WHERE id = $2', [destinationPreview, id]);
}

async function verifyAndConsumeAuthOtp(user, identifier, code) {
await cleanupExpiredAuthOtps();  const row = await dbQueryOne(
    'SELECT * FROM auth_otps WHERE user_id = $1 AND purpose = $2 AND identifier = $3 ORDER BY created_at DESC LIMIT 1',
    [Number(user.id), 'login', String(identifier || '').trim().toLowerCase()]
  );
  if (!row) return { ok: false, message: 'لا يوجد طلب رمز تحقق نشط لهذا الحساب.' };
  if (row.consumed_at) return { ok: false, message: 'تم استخدام الرمز مسبقًا.' };
  if (row.expires_at <= nowIso()) return { ok: false, message: 'انتهت صلاحية الرمز. اطلب رمزًا جديدًا.' };
  if (!verifyPassword(String(code || '').trim(), row.code_hash)) return { ok: false, message: 'رمز التحقق غير صحيح.' };
  await dbRun('UPDATE auth_otps SET consumed_at = $1 WHERE id = $2', [nowIso(), row.id]);
  return { ok: true, row };
}



function parentOtpKey(phone) {
  return `parent_otp_${normalizePhoneNumber(phone)}`;
}

function buildParentUsername(phone) {
  return `parent:${normalizePhoneNumber(phone)}`;
}

function extractClassLabelForParent(student) {
  return student.classroomName || student.className || student.companyName || '—';
}

function getParentLinkedStudents(state, phone) {
  const normalizedPhone = normalizePhoneNumber(phone);
  if (!normalizedPhone) return [];
  const rows = [];
  for (const school of state.schools || []) {
    const students = getUnifiedSchoolStudentsForServer(school, { includeArchived: false, preferStructure: true });
    for (const student of students) {
      if (normalizePhoneNumber(student.guardianMobile || '') !== normalizedPhone) continue;
      // مقارنة studentId مع دعم كلا الصيغتين: composite (structure-X-Y) والخام
      const studentRawId = String(student.rawId || student.id || '');
      const studentCompositeId = String(student.id || '');
      const matchesStudent = (itemStudentId) => {
        const sid = String(itemStudentId || '');
        return sid === studentCompositeId || sid === studentRawId;
      };
      const studentActions = (state.actionLog || []).filter((item) => Number(item.schoolId) === Number(school.id) && matchesStudent(item.studentId)).slice(0, 12);
      const studentScans = (state.scanLog || []).filter((item) => Number(item.schoolId) === Number(school.id) && matchesStudent(item.studentId)).slice(0, 20);
      const schoolLogs = Array.isArray(school.messaging?.logs) ? school.messaging.logs : [];
      const relatedLogs = schoolLogs.filter((item) => normalizePhoneNumber(item.recipient || '') === normalizedPhone && (!item.studentId || String(item.studentId) === String(student.id))).slice(0, 12);
      const lastScan = studentScans[0] || null;
      rows.push({
        id: `${school.id}:${student.id}`,
        schoolId: school.id,
        schoolName: school.name || 'المدرسة',
        schoolCode: school.code || '',
        studentId: student.id,
        name: student.fullName || student.name || 'طالب',
        guardianName: student.guardianName || '',
        className: extractClassLabelForParent(student),
        points: Number(student.points || 0),
        attendanceRate: Number(student.attendanceRate || 0),
        status: student.status || 'غير مسجل',
        studentNumber: String(student.studentNumber || '').trim(),
        nationalId: String(student.nationalId || '').trim(),
        barcode: String(student.barcode || '').trim(),
        lastAttendance: lastScan ? {
          time: lastScan.time || '',
          isoDate: lastScan.isoDate || '',
          method: lastScan.method || '',
          gateName: lastScan.gateName || '',
          result: lastScan.result || '',
        } : null,
        recentActions: studentActions.map((item) => ({
          id: item.id,
          actionType: item.actionType || '',
          title: item.definitionTitle || item.actionTitle || item.actionType || 'إجراء',
          note: item.note || '',
          points: Number(item.points || 0),
          createdAt: item.createdAt || '',
          actorName: item.actorName || '',
        })),
        recentMessages: relatedLogs.map((item) => ({
          id: item.id,
          title: item.templateName || item.eventType || item.channel || 'تنبيه',
          body: item.message || item.error || '',
          channel: item.channel || 'internal',
          recipient: item.recipient || '',
          sentAt: item.createdAt || item.sentAt || '',
          status: item.status || '',
        })),
      });
    }
  }
  return rows;
}

async function getParentExtraContacts(phone) {
  const normalizedPhone = normalizePhoneNumber(phone);
  if (!normalizedPhone) return [];
  const payload = await appMetaGetJson(`parent_contacts_${normalizedPhone}`);
  const contacts = Array.isArray(payload?.contacts) ? payload.contacts : [];
  return contacts
    .map((item) => ({
      mobile: normalizePhoneNumber(item.mobile || ''),
      channel: item.channel === 'sms' ? 'sms' : 'whatsapp',
      verifiedAt: String(item.verifiedAt || item.linkedAt || '').trim(),
      status: String(item.status || 'verified').trim() || 'verified',
      label: String(item.label || 'رقم إضافي').trim() || 'رقم إضافي',
    }))
    .filter((item) => item.mobile);
}

async function saveParentExtraContacts(phone, contacts) {
  const normalizedPhone = normalizePhoneNumber(phone);
  await appMetaSetJson(`parent_contacts_${normalizedPhone}`, {
    primaryMobile: normalizedPhone,
    contacts: (contacts || []).map((item) => ({
      mobile: normalizePhoneNumber(item.mobile || ''),
      channel: item.channel === 'sms' ? 'sms' : 'whatsapp',
      verifiedAt: String(item.verifiedAt || item.linkedAt || nowIso()).trim(),
      status: String(item.status || 'verified').trim() || 'verified',
      label: String(item.label || 'رقم إضافي').trim() || 'رقم إضافي',
    })).filter((item) => item.mobile),
    updatedAt: nowIso(),
  });
}


async function getParentAccountControl(phone) {
  const normalizedPhone = normalizePhoneNumber(phone);
  if (!normalizedPhone) return { suspended: false, note: '', updatedAt: '' };
  const payload = await appMetaGetJson(`parent_control_${normalizedPhone}`);
  return {
    suspended: !!payload?.suspended,
    note: String(payload?.note || '').trim(),
    updatedAt: String(payload?.updatedAt || '').trim(),
  };
}

async function setParentAccountSuspension(phone, suspended, note = '', actor = null) {
  const normalizedPhone = normalizePhoneNumber(phone);
  if (!normalizedPhone) return { suspended: false, note: '', updatedAt: '' };
  const payload = {
    suspended: !!suspended,
    note: String(note || '').trim(),
    updatedAt: nowIso(),
    actorName: String(actor?.name || actor?.username || '').trim(),
    actorRole: String(actor?.role || '').trim(),
  };
  await appMetaSetJson(`parent_control_${normalizedPhone}`, payload);
  return payload;
}


async function getParentAuditHistory(phone) {
  const normalizedPhone = normalizePhoneNumber(phone);
  if (!normalizedPhone) return [];
  const payload = await appMetaGetJson(`parent_audit_${normalizedPhone}`);
  const rows = Array.isArray(payload?.entries) ? payload.entries : [];
  return rows.sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
}

async function appendParentAuditHistory(phone, entry = {}) {
  const normalizedPhone = normalizePhoneNumber(phone);
  if (!normalizedPhone) return [];
  const existing = await getParentAuditHistory(normalizedPhone);
  const nextEntry = {
    id: entry.id || `audit_${Date.now()}_${Math.floor(Math.random() * 10000)}`,
    createdAt: entry.createdAt || nowIso(),
    action: String(entry.action || 'parent_update').trim() || 'parent_update',
    title: String(entry.title || 'تحديث على ملف ولي الأمر').trim() || 'تحديث على ملف ولي الأمر',
    note: String(entry.note || '').trim(),
    actorName: String(entry.actorName || entry.actor?.name || entry.actor?.username || '').trim(),
    actorRole: String(entry.actorRole || entry.actor?.role || '').trim(),
    schoolId: entry.schoolId ?? null,
    schoolName: String(entry.schoolName || '').trim(),
    studentId: entry.studentId ?? null,
    studentName: String(entry.studentName || '').trim(),
    meta: entry.meta && typeof entry.meta === 'object' ? entry.meta : {},
  };
  const payload = {
    phone: normalizedPhone,
    updatedAt: nowIso(),
    entries: [nextEntry, ...existing].slice(0, 250),
  };
  await appMetaSetJson(`parent_audit_${normalizedPhone}`, payload);
  return payload.entries;
}

async function appendParentAuditForPhones(phones = [], entry = {}) {
  const uniquePhones = [...new Set((phones || []).map((phone) => normalizePhoneNumber(phone)).filter(Boolean))];
  for (const phone of uniquePhones) {
    await appendParentAuditHistory(phone, entry);
  }
}

function defaultParentNotificationSettings() {
  return {
    preferredChannel: 'whatsapp',
    deliveryScope: 'primary_and_extra',
    events: {
      late: true,
      absent: true,
      positive: true,
      negative: true,
      announcements: true,
    },
    summaries: {
      daily: false,
      weekly: true,
    },
  };
}

async function getParentNotificationSettings(phone) {
  const normalizedPhone = normalizePhoneNumber(phone);
  if (!normalizedPhone) return defaultParentNotificationSettings();
  const payload = await appMetaGetJson(`parent_notification_settings_${normalizedPhone}`);
  const defaults = defaultParentNotificationSettings();
  return {
    preferredChannel: ['whatsapp', 'sms', 'both'].includes(String(payload?.preferredChannel || '').trim()) ? String(payload.preferredChannel).trim() : defaults.preferredChannel,
    deliveryScope: ['primary_only', 'primary_and_extra'].includes(String(payload?.deliveryScope || '').trim()) ? String(payload.deliveryScope).trim() : defaults.deliveryScope,
    events: {
      late: payload?.events?.late !== undefined ? !!payload.events.late : defaults.events.late,
      absent: payload?.events?.absent !== undefined ? !!payload.events.absent : defaults.events.absent,
      positive: payload?.events?.positive !== undefined ? !!payload.events.positive : defaults.events.positive,
      negative: payload?.events?.negative !== undefined ? !!payload.events.negative : defaults.events.negative,
      announcements: payload?.events?.announcements !== undefined ? !!payload.events.announcements : defaults.events.announcements,
    },
    summaries: {
      daily: payload?.summaries?.daily !== undefined ? !!payload.summaries.daily : defaults.summaries.daily,
      weekly: payload?.summaries?.weekly !== undefined ? !!payload.summaries.weekly : defaults.summaries.weekly,
    },
  };
}

async function saveParentNotificationSettings(phone, settings) {
  const normalizedPhone = normalizePhoneNumber(phone);
  const defaults = defaultParentNotificationSettings();
  const normalized = {
    preferredChannel: ['whatsapp', 'sms', 'both'].includes(String(settings?.preferredChannel || '').trim()) ? String(settings.preferredChannel).trim() : defaults.preferredChannel,
    deliveryScope: ['primary_only', 'primary_and_extra'].includes(String(settings?.deliveryScope || '').trim()) ? String(settings.deliveryScope).trim() : defaults.deliveryScope,
    events: {
      late: settings?.events?.late !== undefined ? !!settings.events.late : defaults.events.late,
      absent: settings?.events?.absent !== undefined ? !!settings.events.absent : defaults.events.absent,
      positive: settings?.events?.positive !== undefined ? !!settings.events.positive : defaults.events.positive,
      negative: settings?.events?.negative !== undefined ? !!settings.events.negative : defaults.events.negative,
      announcements: settings?.events?.announcements !== undefined ? !!settings.events.announcements : defaults.events.announcements,
    },
    summaries: {
      daily: settings?.summaries?.daily !== undefined ? !!settings.summaries.daily : defaults.summaries.daily,
      weekly: settings?.summaries?.weekly !== undefined ? !!settings.summaries.weekly : defaults.summaries.weekly,
    },
    updatedAt: nowIso(),
  };
  await appMetaSetJson(`parent_notification_settings_${normalizedPhone}`, normalized);
  return normalized;
}

function parentContactOtpKey(primaryPhone, targetPhone) {
  return `parent_contact_otp_${normalizePhoneNumber(primaryPhone)}_${normalizePhoneNumber(targetPhone)}`;
}

async function createParentContactOtpRequest(primaryPhone, targetPhone, channel, code) {
  const payload = {
    primaryPhone: normalizePhoneNumber(primaryPhone),
    targetPhone: normalizePhoneNumber(targetPhone),
    channel: channel === 'sms' ? 'sms' : 'whatsapp',
    codeHash: await hashPassword(String(code || ").trim()),
    codePreview: String(code || '').trim(),
    requestedAt: nowIso(),
    expiresAt: new Date(Date.now() + 10 * 60 * 1000).toISOString(),
    consumedAt: null,
  };
  await appMetaSetJson(parentContactOtpKey(primaryPhone, targetPhone), payload);
  return payload;
}

async function verifyAndConsumeParentContactOtp(primaryPhone, targetPhone, code) {
  const payload = await appMetaGetJson(parentContactOtpKey(primaryPhone, targetPhone));
  if (!payload) return { ok: false, message: 'لا يوجد طلب تحقق نشط لهذا الرقم.' };
  if (payload.consumedAt) return { ok: false, message: 'تم استخدام هذا الرمز مسبقًا.' };
  if (new Date(payload.expiresAt).getTime() < Date.now()) {
    await appMetaDelete(parentContactOtpKey(primaryPhone, targetPhone));
    return { ok: false, message: 'انتهت صلاحية الرمز. اطلب رمزًا جديدًا.' };
  }
  if (!verifyPassword(String(code || '').trim(), payload.codeHash)) {
    return { ok: false, message: 'رمز التحقق غير صحيح.' };
  }
  payload.consumedAt = nowIso();
  await appMetaSetJson(parentContactOtpKey(primaryPhone, targetPhone), payload);
  return { ok: true, payload };
}

async function getParentPrimaryChangeRequest(phone) {
  const normalizedPhone = normalizePhoneNumber(phone);
  if (!normalizedPhone) return null;
  const payload = await appMetaGetJson(`parent_primary_change_${normalizedPhone}`);
  if (!payload) return null;
  return {
    currentPhone: normalizedPhone,
    requestedMobile: normalizePhoneNumber(payload.requestedMobile || ''),
    requestedMobileMasked: maskPhone(payload.requestedMobile || ''),
    status: String(payload.status || 'pending').trim() || 'pending',
    requestedAt: String(payload.requestedAt || '').trim(),
    verifiedAt: String(payload.verifiedAt || '').trim(),
    note: String(payload.note || 'بانتظار اعتماد الإدارة لتحديث الرقم الأساسي.').trim(),
  };
}

async function saveParentPrimaryChangeRequest(phone, payload = {}) {
  const normalizedPhone = normalizePhoneNumber(phone);
  if (!normalizedPhone) return null;
  const record = {
    currentPhone: normalizedPhone,
    requestedMobile: normalizePhoneNumber(payload.requestedMobile || ''),
    status: String(payload.status || 'pending').trim() || 'pending',
    requestedAt: String(payload.requestedAt || nowIso()).trim() || nowIso(),
    verifiedAt: String(payload.verifiedAt || nowIso()).trim() || nowIso(),
    note: String(payload.note || 'بانتظار اعتماد الإدارة لتحديث الرقم الأساسي.').trim() || 'بانتظار اعتماد الإدارة لتحديث الرقم الأساسي.',
    updatedAt: nowIso(),
  };
  await appMetaSetJson(`parent_primary_change_${normalizedPhone}`, record);
  const log = await appMetaGetJson('parent_primary_change_log');
  const entries = Array.isArray(log?.entries) ? log.entries : [];
  const nextEntries = [record, ...entries.filter((item) => !(normalizePhoneNumber(item.currentPhone || '') === normalizedPhone && normalizePhoneNumber(item.requestedMobile || '') === record.requestedMobile && String(item.status || '') === record.status))].slice(0, 300);
  await appMetaSetJson('parent_primary_change_log', { updatedAt: nowIso(), entries: nextEntries });
  return record;
}

async function getParentPrimaryChangePolicy(schoolId) {
  const normalizedSchoolId = Number(schoolId) || 0;
  const payload = await appMetaGetJson(`parent_primary_change_policy_${normalizedSchoolId}`);
  return {
    schoolId: normalizedSchoolId,
    mode: String(payload?.mode || 'auto').trim() === 'manual' ? 'manual' : 'auto',
    updatedAt: String(payload?.updatedAt || '').trim(),
    updatedBy: payload?.updatedBy || null,
  };
}

async function saveParentPrimaryChangePolicy(schoolId, mode, actorUser = null) {
  const normalizedSchoolId = Number(schoolId) || 0;
  const record = {
    schoolId: normalizedSchoolId,
    mode: String(mode || 'auto').trim() === 'manual' ? 'manual' : 'auto',
    updatedAt: nowIso(),
    updatedBy: actorUser ? { id: actorUser.id, username: actorUser.username, fullName: actorUser.fullName, role: actorUser.role } : null,
  };
  await appMetaSetJson(`parent_primary_change_policy_${normalizedSchoolId}`, record);
  return record;
}

async function getParentPortalSettings(schoolId) {
  const normalizedSchoolId = Number(schoolId) || 0;
  const payload = await appMetaGetJson(`parent_portal_settings_${normalizedSchoolId}`);
  return {
    schoolId: normalizedSchoolId,
    enabled: payload?.enabled !== false,
    altLoginEnabled: payload?.altLoginEnabled !== false,
    updatedAt: String(payload?.updatedAt || '').trim(),
    updatedBy: payload?.updatedBy || null,
  };
}

async function saveParentPortalSettings(schoolId, enabled, actorUser = null, altLoginEnabled = null) {
  const normalizedSchoolId = Number(schoolId) || 0;
  // قراءة الإعدادات الحالية للحفاظ على القيم غير المُعدَّلة
  const existing = await appMetaGetJson(`parent_portal_settings_${normalizedSchoolId}`) || {};
  const record = {
    schoolId: normalizedSchoolId,
    enabled: enabled !== false,
    altLoginEnabled: altLoginEnabled !== null ? altLoginEnabled !== false : (existing.altLoginEnabled !== false),
    updatedAt: nowIso(),
    updatedBy: actorUser ? { id: actorUser.id, username: actorUser.username, fullName: actorUser.fullName, role: actorUser.role } : null,
  };
  await appMetaSetJson(`parent_portal_settings_${normalizedSchoolId}`, record);
  return record;
}

async function isParentPortalEnabledForProfile(profile) {
  const schoolIds = Array.isArray(profile?.students) ? [...new Set(profile.students.map((s) => Number(s.schoolId) || 0).filter(Boolean))] : [];
  if (!schoolIds.length) return true;
  for (const schoolId of schoolIds) {
    const settings = await getParentPortalSettings(schoolId);
    if (settings.enabled !== false) return true;
  }
  return false;
}


async function addParentPrimaryChangeAlert(schoolId, payload = {}) {
  const normalizedSchoolId = Number(schoolId) || 0;
  const key = `parent_primary_change_alerts_${normalizedSchoolId}`;
  const current = await appMetaGetJson(key);
  const items = Array.isArray(current?.items) ? current.items : [];
  const record = {
    id: `ppc_alert_${Date.now()}_${Math.random().toString(36).slice(2,8)}`,
    schoolId: normalizedSchoolId,
    type: String(payload.type || 'auto_approved').trim() || 'auto_approved',
    status: String(payload.status || 'info').trim() || 'info',
    currentPhone: normalizePhoneNumber(payload.currentPhone || ''),
    requestedMobile: normalizePhoneNumber(payload.requestedMobile || ''),
    guardianName: String(payload.guardianName || 'ولي الأمر').trim() || 'ولي الأمر',
    studentNames: Array.isArray(payload.studentNames) ? payload.studentNames : [],
    message: String(payload.message || '').trim(),
    createdAt: String(payload.createdAt || nowIso()).trim() || nowIso(),
    read: Boolean(payload.read),
  };
  await appMetaSetJson(key, { updatedAt: nowIso(), items: [record, ...items].slice(0, 80) });
  return record;
}

async function listParentPrimaryChangeAlerts(schoolId) {
  const normalizedSchoolId = Number(schoolId) || 0;
  const payload = await appMetaGetJson(`parent_primary_change_alerts_${normalizedSchoolId}`);
  return Array.isArray(payload?.items) ? payload.items : [];
}

// alias for listParentPrimaryChangeAlerts
async function getParentPrimaryChangeAlerts(schoolId) {
  return listParentPrimaryChangeAlerts(schoolId);
}

async function resolveParentPrimaryChangePolicyForProfile(profile) {
  const schoolId = Number(profile?.students?.[0]?.schoolId) || 0;
  return getParentPrimaryChangePolicy(schoolId);
}



async function listParentPrimaryChangeRequests(state, actorUser = null) {
  const log = await appMetaGetJson('parent_primary_change_log');
  const rows = Array.isArray(log?.entries) ? log.entries : [];
  const normalizedRole = String(actorUser?.role || '').trim().toLowerCase();
  return rows.map((item) => {
    const currentPhone = normalizePhoneNumber(item.currentPhone || '');
    const requestedMobile = normalizePhoneNumber(item.requestedMobile || '');
    const students = getParentLinkedStudents(state, currentPhone);
    const schoolIds = [...new Set(students.map((student) => Number(student.schoolId)).filter(Boolean))];
    const schoolNames = [...new Set(students.map((student) => String(student.schoolName || '').trim()).filter(Boolean))];
    const studentNames = students.map((student) => String(student.name || '').trim()).filter(Boolean);
    return {
      currentPhone,
      currentPhoneMasked: maskPhone(currentPhone),
      requestedMobile,
      requestedMobileMasked: maskPhone(requestedMobile),
      status: String(item.status || 'pending').trim() || 'pending',
      note: String(item.note || '').trim(),
      requestedAt: String(item.requestedAt || '').trim(),
      verifiedAt: String(item.verifiedAt || '').trim(),
      updatedAt: String(item.updatedAt || '').trim(),
      schoolsCount: schoolIds.length,
      schoolIds,
      schoolNames,
      studentsCount: students.length,
      studentNames,
      guardianName: students.find((student) => String(student.guardianName || '').trim())?.guardianName || 'ولي الأمر',
    };
  }).filter((item) => {
    if (normalizedRole === 'admin') return true;
    if (!actorUser) return false;
    if (normalizedRole === 'principal' || normalizedRole === 'supervisor') {
      return item.schoolIds.some((schoolId) => Number(schoolId) === Number(actorUser.schoolId));
    }
    return false;
  }).sort((a, b) => new Date(b.updatedAt || b.requestedAt || 0).getTime() - new Date(a.updatedAt || a.requestedAt || 0).getTime());
}

function applyGuardianMobileChange(value, fromPhone, toPhone, touched = new Set()) {
  if (!value) return 0;
  let count = 0;
  if (Array.isArray(value)) {
    for (const item of value) count += applyGuardianMobileChange(item, fromPhone, toPhone, touched);
    return count;
  }
  if (typeof value !== 'object') return 0;
  if (touched.has(value)) return 0;
  touched.add(value);
  if (typeof value.guardianMobile === 'string' && normalizePhoneNumber(value.guardianMobile) === fromPhone) {
    value.guardianMobile = toPhone;
    count += 1;
  }
  for (const key of Object.keys(value)) {
    count += applyGuardianMobileChange(value[key], fromPhone, toPhone, touched);
  }
  return count;
}

function reassignSingleStudentGuardian(value, criteria, update, touched = new Set()) {
  if (!value) return 0;
  let count = 0;
  if (Array.isArray(value)) {
    for (const item of value) count += reassignSingleStudentGuardian(item, criteria, update, touched);
    return count;
  }
  if (typeof value !== 'object') return 0;
  if (touched.has(value)) return 0;
  touched.add(value);
  const sameId = String(value.id || value.studentId || '') === String(criteria.studentId || '');
  const samePhone = normalizePhoneNumber(value.guardianMobile || '') === normalizePhoneNumber(criteria.currentMobile || '');
  if (sameId && samePhone) {
    value.guardianMobile = normalizePhoneNumber(update.newMobile || '');
    if (typeof update.guardianName === 'string' && String(update.guardianName || '').trim()) {
      value.guardianName = String(update.guardianName || '').trim();
    }
    count += 1;
  }
  for (const key of Object.keys(value)) {
    count += reassignSingleStudentGuardian(value[key], criteria, update, touched);
  }
  return count;
}

async function migrateParentMetadata(oldPhone, newPhone) {
  const oldNormalized = normalizePhoneNumber(oldPhone);
  const newNormalized = normalizePhoneNumber(newPhone);
  if (!oldNormalized || !newNormalized || oldNormalized === newNormalized) return;
  const extraContacts = await getParentExtraContacts(oldNormalized);
  if (extraContacts.length) {
    await saveParentExtraContacts(newNormalized, extraContacts);
    await appMetaDelete(`parent_contacts_${oldNormalized}`);
  }
  const settings = await getParentNotificationSettings(oldNormalized);
  await saveParentNotificationSettings(newNormalized, settings);
  await appMetaDelete(`parent_notification_settings_${oldNormalized}`);
  const history = await appMetaGetJson(`parent_history_${oldNormalized}`);
  if (history) {
    await appMetaSetJson(`parent_history_${newNormalized}`, { ...history, phone: newNormalized, updatedAt: nowIso() });
    await appMetaDelete(`parent_history_${oldNormalized}`);
  }
}

async function decideParentPrimaryChange(state, actorUser, currentPhone, requestedMobile, decision, note = '') {
  const normalizedCurrent = normalizePhoneNumber(currentPhone);
  const normalizedRequested = normalizePhoneNumber(requestedMobile);
  if (!normalizedCurrent || !normalizedRequested) {
    return { ok: false, statusCode: 400, message: 'بيانات الطلب غير مكتملة.' };
  }
  const requests = await listParentPrimaryChangeRequests(state, actorUser);
  const request = requests.find((item) => item.currentPhone === normalizedCurrent && item.requestedMobile === normalizedRequested);
  if (!request) {
    return { ok: false, statusCode: 404, message: 'لم يتم العثور على الطلب أو لا تملك صلاحية الوصول إليه.' };
  }
  const action = String(decision || '').trim().toLowerCase();
  if (action === 'approve') {
    const nextState = structuredClone(state);
    const updatedStudents = applyGuardianMobileChange(nextState.schools, normalizedCurrent, normalizedRequested);
    if (!updatedStudents) {
      return { ok: false, statusCode: 400, message: 'تعذر العثور على طلاب مرتبطين بالرقم الحالي لتحديثهم.' };
    }
    await saveSharedState(nextState, actorUser);
    await migrateParentMetadata(normalizedCurrent, normalizedRequested);
    await appMetaDelete(`parent_primary_change_${normalizedCurrent}`);
    await saveParentPrimaryChangeRequest(normalizedCurrent, {
      requestedMobile: normalizedRequested,
      status: 'approved',
      requestedAt: request.requestedAt || nowIso(),
      verifiedAt: request.verifiedAt || nowIso(),
      note: String(note || 'تم اعتماد الطلب وتحديث الرقم الأساسي في بيانات الطلاب.').trim(),
    });
    await audit(actorUser, 'approve_parent_primary_change', {
      currentPhone: normalizedCurrent,
      requestedMobile: normalizedRequested,
      updatedStudents,
      note: String(note || '').trim(),
    });
    return { ok: true, message: `تم اعتماد الطلب وتحديث الرقم الأساسي لـ ${updatedStudents} سجل/سجلات طالب.`, updatedStudents };
  }
  if (action === 'reject' && String(request.status || '') === 'approved') {
    const nextState = structuredClone(state);
    const updatedStudents = applyGuardianMobileChange(nextState.schools, normalizedRequested, normalizedCurrent);
    if (!updatedStudents) {
      return { ok: false, statusCode: 400, message: 'تعذر التراجع؛ لم يتم العثور على سجلات مرتبطة بالرقم الجديد.' };
    }
    await saveSharedState(nextState, actorUser);
    await migrateParentMetadata(normalizedRequested, normalizedCurrent);
    await saveParentPrimaryChangeRequest(normalizedCurrent, {
      requestedMobile: normalizedRequested,
      status: 'rejected',
      requestedAt: request.requestedAt || nowIso(),
      verifiedAt: request.verifiedAt || nowIso(),
      note: String(note || 'تم رفض الطلب لاحقًا والتراجع عن التحديث الآلي.').trim(),
    });
    await audit(actorUser, 'rollback_parent_primary_change', {
      currentPhone: normalizedCurrent,
      requestedMobile: normalizedRequested,
      updatedStudents,
      note: String(note || '').trim(),
    });
    return { ok: true, message: `تم رفض الطلب لاحقًا والتراجع عن التحديث لـ ${updatedStudents} سجل/سجلات طالب.`, updatedStudents };
  }
  await appMetaDelete(`parent_primary_change_${normalizedCurrent}`);
  await saveParentPrimaryChangeRequest(normalizedCurrent, {
    requestedMobile: normalizedRequested,
    status: 'rejected',
    requestedAt: request.requestedAt || nowIso(),
    verifiedAt: request.verifiedAt || nowIso(),
    note: String(note || 'تم رفض الطلب من قبل الإدارة.').trim(),
  });
  await audit(actorUser, 'reject_parent_primary_change', {
    currentPhone: normalizedCurrent,
    requestedMobile: normalizedRequested,
    note: String(note || '').trim(),
  });
  await appendParentAuditForPhones([normalizedCurrent], {
    action: 'reject_primary_change',
    title: 'رفض تحديث الرقم الأساسي',
    note: String(note || 'تم رفض الطلب من قبل الإدارة.').trim(),
    actor: actorUser,
    meta: { currentPhone: normalizedCurrent, requestedMobile: normalizedRequested },
  });
  return { ok: true, message: 'تم رفض الطلب وتثبيت الحالة في السجل.' };
}

function parentPrimaryChangeOtpKey(primaryPhone, targetPhone) {
  return `parent_primary_change_otp_${normalizePhoneNumber(primaryPhone)}_${normalizePhoneNumber(targetPhone)}`;
}

async function createParentPrimaryChangeOtpRequest(primaryPhone, targetPhone, code) {
  const payload = {
    primaryPhone: normalizePhoneNumber(primaryPhone),
    targetPhone: normalizePhoneNumber(targetPhone),
    codeHash: await hashPassword(String(code || '').trim()),
    codePreview: String(code || '').trim(),
    requestedAt: nowIso(),
    expiresAt: new Date(Date.now() + 10 * 60 * 1000).toISOString(),
    consumedAt: null,
  };
  await appMetaSetJson(parentPrimaryChangeOtpKey(primaryPhone, targetPhone), payload);
  return payload;
}

async function verifyAndConsumeParentPrimaryChangeOtp(primaryPhone, targetPhone, code) {
  const payload = await appMetaGetJson(parentPrimaryChangeOtpKey(primaryPhone, targetPhone));
  if (!payload) return { ok: false, message: 'لا يوجد طلب تحقق نشط لهذا الرقم.' };
  if (payload.consumedAt) return { ok: false, message: 'تم استخدام هذا الرمز مسبقًا.' };
  if (new Date(payload.expiresAt).getTime() < Date.now()) {
    await appMetaDelete(parentPrimaryChangeOtpKey(primaryPhone, targetPhone));
    return { ok: false, message: 'انتهت صلاحية الرمز. اطلب رمزًا جديدًا.' };
  }
  if (!verifyPassword(String(code || '').trim(), payload.codeHash)) {
    return { ok: false, message: 'رمز التحقق غير صحيح.' };
  }
  payload.consumedAt = nowIso();
  await appMetaSetJson(parentPrimaryChangeOtpKey(primaryPhone, targetPhone), payload);
  return { ok: true, payload };
}

async function getParentNotificationHistory(phone) {
  const normalizedPhone = normalizePhoneNumber(phone);
  if (!normalizedPhone) return [];
  const payload = await appMetaGetJson(`parent_history_${normalizedPhone}`);
  const rows = Array.isArray(payload?.entries) ? payload.entries : [];
  return rows.sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
}

async function appendParentNotificationHistory(phone, entry = {}) {
  const normalizedPhone = normalizePhoneNumber(phone);
  if (!normalizedPhone) return;
  const existing = await getParentNotificationHistory(normalizedPhone);
  const nextEntry = {
    id: entry.id || `${Date.now()}_${Math.floor(Math.random() * 10000)}`,
    createdAt: entry.createdAt || nowIso(),
    sentAt: entry.sentAt || entry.createdAt || nowIso(),
    title: String(entry.title || 'تنبيه').trim() || 'تنبيه',
    body: String(entry.body || '').trim(),
    studentId: entry.studentId ?? null,
    studentName: String(entry.studentName || '').trim(),
    schoolId: entry.schoolId ?? null,
    schoolName: String(entry.schoolName || '').trim(),
    channel: entry.channel === 'sms' ? 'sms' : entry.channel === 'internal' ? 'internal' : 'whatsapp',
    recipient: normalizePhoneNumber(entry.recipient || ''),
    recipientMasked: maskPhone(entry.recipient || ''),
    recipientType: String(entry.recipientType || 'primary').trim(),
    status: String(entry.status || 'نجاح').trim(),
    reason: String(entry.reason || '').trim(),
    eventType: String(entry.eventType || '').trim(),
    sourceType: String(entry.sourceType || '').trim() || 'manual',
    deltaPoints: entry.deltaPoints !== undefined ? Number(entry.deltaPoints) : null,
  };
  await appMetaSetJson(`parent_history_${normalizedPhone}`, {
    phone: normalizedPhone,
    updatedAt: nowIso(),
    entries: [nextEntry, ...existing].slice(0, 300),
  });
}

async function recordParentDeliveries(state, deliveries = [], context = {}) {
  for (const delivery of deliveries || []) {
    const recipient = normalizePhoneNumber(delivery?.recipient || '');
    if (!recipient) continue;
    const studentName = String(delivery?.studentName || context.studentName || '').trim();
    const schoolName = String(context.schoolName || '').trim();
    const schoolId = context.schoolId ?? null;
    let primaryPhone = recipient;
    let recipientType = String(delivery?.recipientType || 'primary').trim() || 'primary';
    if (recipientType !== 'primary') {
      for (const school of state.schools || []) {
        const students = getUnifiedSchoolStudentsForServer(school, { includeArchived: false, preferStructure: true });
        const matched = students.find((student) => String(student.id) === String(delivery?.studentId) && normalizePhoneNumber(student.guardianMobile || '') );
        if (matched) {
          primaryPhone = normalizePhoneNumber(matched.guardianMobile || '');
          break;
        }
      }
    }
    if (!primaryPhone) continue;
    await appendParentNotificationHistory(primaryPhone, {
      title: context.title,
      body: context.body,
      studentId: delivery?.studentId ?? context.studentId ?? null,
      studentName,
      schoolId,
      schoolName,
      channel: delivery?.channel || context.channel,
      recipient,
      recipientType,
      status: delivery?.status || 'نجاح',
      reason: delivery?.reason || '',
      eventType: context.eventType || delivery?.eventType || '',
      sourceType: context.sourceType || 'manual',
      createdAt: context.createdAt || nowIso(),
      sentAt: context.createdAt || nowIso(),
    });
  }
}

function getSchoolRewardStore(school) {
  return {
    items: Array.isArray(school?.rewardStore?.items) ? school.rewardStore.items : [],
    parentProposals: Array.isArray(school?.rewardStore?.parentProposals) ? school.rewardStore.parentProposals : [],
    redemptionRequests: Array.isArray(school?.rewardStore?.redemptionRequests) ? school.rewardStore.redemptionRequests : [],
  };
}

function normalizeRewardStoreItem(item = {}) {
  const quantity = Math.max(0, Number(item.quantity ?? item.stockQuantity ?? item.remainingQuantity ?? 0) || 0);
  const remainingQuantity = Math.max(0, Number(item.remainingQuantity ?? quantity) || 0);
  const sourceType = String(item.sourceType || item.source || 'school');
  const donorName = String(item.donorName || item.createdByName || '').trim();
  const approvalStatus = String(item.approvalStatus || item.status || (Number(item.pointsCost || 0) > 0 ? 'active' : 'awaiting_receipt'));
  return { ...item, quantity, remainingQuantity, sourceType, donorName, approvalStatus, showDonorName: item.showDonorName !== false, pointsCost: Number(item.pointsCost || 0) || 0, showOnScreens: item.showOnScreens !== false, featured: item.featured === true, displayPriority: Number(item.displayPriority || 0) || 0 };
}

function getRewardStoreDonorLabel(item = {}) {
  const normalized = normalizeRewardStoreItem(item);
  if (normalized.showDonorName && normalized.donorName) return normalized.donorName;
  if (normalized.sourceType === 'parent') return 'ولي أمر';
  if (normalized.sourceType === 'external') return 'متبرع خارجي';
  return 'إدارة المدرسة';
}


function getApprovedRewardStoreItemsForScreen(school, screenConfig = null) {
  const settings = screenConfig?.rewardStoreSettings || {};
  const mode = String(settings.mode || 'all');
  const sourceFilter = String(settings.sourceFilter || 'all');
  const maxItems = Math.max(1, Math.min(24, Number(settings.maxItems || 8) || 8));
  let items = getSchoolRewardStore(school).items.map((item) => normalizeRewardStoreItem(item)).filter((item) => item.approvalStatus === 'active' && item.remainingQuantity > 0 && item.showOnScreens !== false);
  if (sourceFilter !== 'all') items = items.filter((item) => String(item.sourceType || '') === sourceFilter);
  if (mode === 'featured') items = items.filter((item) => item.featured === true);
  if (mode === 'marked') items = items.filter((item) => item.showOnScreens !== false);
  return items.sort((a, b) => Number(b.featured === true) - Number(a.featured === true) || Number(b.displayPriority || 0) - Number(a.displayPriority || 0) || String(a.title || '').localeCompare(String(b.title || ''), 'ar')).slice(0, maxItems);
}

function buildRewardStoreExecutiveSummary(state, schoolId, screenConfig = null) {
  const school = (state.schools || []).find((item) => Number(item.id) === Number(schoolId));
  if (!school) return null;
  const store = getSchoolRewardStore(school);
  const items = store.items.map((item) => normalizeRewardStoreItem(item));
  const activeItems = items.filter((item) => item.approvalStatus === 'active' && item.remainingQuantity > 0);
  const donorNames = new Set(items.map((item) => getRewardStoreDonorLabel(item)).filter(Boolean));
  const redemptionRequests = Array.isArray(store.redemptionRequests) ? store.redemptionRequests : [];
  return {
    totalItems: items.length,
    activeItems: activeItems.length,
    pendingProposals: (Array.isArray(store.parentProposals) ? store.parentProposals : []).filter((item) => String(item.status || 'pending') === 'pending').length,
    donorCount: donorNames.size,
    remainingQuantity: items.reduce((sum, item) => sum + Number(item.remainingQuantity || 0), 0),
    pendingRedemptions: redemptionRequests.filter((item) => String(item.status || 'pending') === 'pending').length,
    approvedRedemptions: redemptionRequests.filter((item) => String(item.status || '') === 'approved').length,
    deliveredRedemptions: redemptionRequests.filter((item) => String(item.status || '') === 'delivered').length,
    approvedViaParents: items.filter((item) => String(item.sourceType || '') === 'parent').length,
    schoolSourceCount: items.filter((item) => String(item.sourceType || '') === 'school').reduce((sum, item) => sum + Number(item.quantity || 0), 0),
    parentSourceCount: items.filter((item) => String(item.sourceType || '') === 'parent').reduce((sum, item) => sum + Number(item.quantity || 0), 0),
    externalSourceCount: items.filter((item) => String(item.sourceType || '') === 'external').reduce((sum, item) => sum + Number(item.quantity || 0), 0),
    mode: String(screenConfig?.rewardStoreSettings?.mode || 'all'),
    sourceFilter: String(screenConfig?.rewardStoreSettings?.sourceFilter || 'all'),
    maxItems: Math.max(1, Math.min(24, Number(screenConfig?.rewardStoreSettings?.maxItems || 8) || 8)),
    items: getApprovedRewardStoreItemsForScreen(school, screenConfig).map((item) => ({
      id: item.id,
      title: item.title || 'جائزة',
      image: item.image || '',
      pointsCost: Number(item.pointsCost || 0),
      quantity: Number(item.quantity || 0),
      remainingQuantity: Number(item.remainingQuantity || 0),
      donorLabel: getRewardStoreDonorLabel(item),
      featured: item.featured === true,
      showOnScreens: item.showOnScreens !== false,
      displayPriority: Number(item.displayPriority || 0),
      sourceType: item.sourceType || 'school',
    })),
  };
}

async function attachRewardStoreSummaryToLive(state, schoolId, live, screenConfig = null) {
  try {
    const rewardStoreSummary = buildRewardStoreExecutiveSummary(state, schoolId, screenConfig);
    return { ...(live || {}), rewardStoreSummary };
  } catch {
    return live;
  }
}

async function buildParentProfile(state, phone) {
  const normalizedPhone = normalizePhoneNumber(phone);
  const students = getParentLinkedStudents(state, normalizedPhone);
  if (!students.length) return null;
  const guardianName = students.find((item) => String(item.guardianName || '').trim())?.guardianName || 'ولي الأمر';
  const totalPoints = students.reduce((sum, item) => sum + Number(item.points || 0), 0);
  const avgAttendance = students.length ? Math.round(students.reduce((sum, item) => sum + Number(item.attendanceRate || 0), 0) / students.length) : 0;
  const extraContacts = await getParentExtraContacts(normalizedPhone);
  const notificationSettings = await getParentNotificationSettings(normalizedPhone);
  const notificationHistory = await getParentNotificationHistory(normalizedPhone);
  const primaryChangeRequest = await getParentPrimaryChangeRequest(normalizedPhone);
  const accountControl = await getParentAccountControl(normalizedPhone);
  const auditHistory = await getParentAuditHistory(normalizedPhone);
  const linkedStudentIds = new Set(students.map((item) => String(item.studentId || item.id || '')));
  const latestMessages = notificationHistory
    .filter((item) => !item.studentId || linkedStudentIds.has(String(item.studentId)))
    .slice(0, 12);
  const schoolIds = [...new Set(students.map((item) => Number(item.schoolId)).filter(Boolean))];
  const rewardCatalog = schoolIds.flatMap((schoolId) => {
    const school = (state.schools || []).find((item) => Number(item.id) === Number(schoolId));
    const store = getSchoolRewardStore(school);
    return store.items.map((item) => normalizeRewardStoreItem(item)).filter((item) => item && item.isActive !== false && String(item.approvalStatus || '') === 'active' && Number(item.remainingQuantity || 0) > 0).map((item) => ({
      id: item.id,
      schoolId,
      schoolName: school?.name || '',
      title: item.title || 'جائزة',
      pointsCost: Number(item.pointsCost || 0),
      image: item.image || '',
      note: item.note || '',
      source: item.sourceType || 'school',
      donorName: getRewardStoreDonorLabel(item),
      quantity: Number(item.quantity || 0),
      remainingQuantity: Number(item.remainingQuantity || 0),
    }));
  });
  const rewardProposals = schoolIds.flatMap((schoolId) => {
    const school = (state.schools || []).find((item) => Number(item.id) === Number(schoolId));
    const store = getSchoolRewardStore(school);
    return store.parentProposals.filter((item) => normalizePhoneNumber(item.mobile || '') === normalizedPhone).map((item) => ({
      ...item,
      mobileMasked: maskPhone(item.mobile || normalizedPhone),
      schoolName: school?.name || '',
    }));
  });
  const rewardRedemptions = schoolIds.flatMap((schoolId) => {
    const school = (state.schools || []).find((item) => Number(item.id) === Number(schoolId));
    const store = getSchoolRewardStore(school);
    const studentIds = new Set(students.filter((entry) => Number(entry.schoolId) === Number(schoolId)).map((entry) => String(entry.studentId || entry.id || '')));
    return store.redemptionRequests.filter((item) => studentIds.has(String(item.studentId || '')) || normalizePhoneNumber(item.mobile || '') === normalizedPhone).map((item) => ({
      ...item,
      schoolName: school?.name || '',
    }));
  });
  return {
    mobile: normalizedPhone,
    mobileMasked: maskPhone(normalizedPhone),
    guardianName,
    studentsCount: students.length,
    totalPoints,
    avgAttendance,
    schoolsCount: new Set(students.map((item) => item.schoolId)).size,
    students,
    latestMessages,
    extraContacts: extraContacts.map((item) => ({
      ...item,
      mobileMasked: maskPhone(item.mobile),
    })),
    notificationSettings,
    notificationHistory,
    primaryChangeRequest,
    accountControl,
    auditHistory,
    rewardCatalog,
    rewardProposals,
    rewardRedemptions,
  };
}

async function createParentOtpRequest(phone, code) {
  const normalizedPhone = normalizePhoneNumber(phone);
  const payload = {
    phone: normalizedPhone,
    codeHash: await hashPassword(String(code || '').trim()),
    codePreview: String(code || '').trim(),
    requestedAt: nowIso(),
    expiresAt: new Date(Date.now() + 10 * 60 * 1000).toISOString(),
    consumedAt: null,
  };
  await appMetaSetJson(parentOtpKey(normalizedPhone), payload);
  return payload;
}

async function verifyAndConsumeParentOtp(phone, code) {
  const normalizedPhone = normalizePhoneNumber(phone);
  const payload = await appMetaGetJson(parentOtpKey(normalizedPhone));
  if (!payload) return { ok: false, message: 'لا يوجد طلب تحقق نشط لهذا الرقم.' };
  if (payload.consumedAt) return { ok: false, message: 'تم استخدام هذا الرمز مسبقًا.' };
  if (new Date(payload.expiresAt).getTime() < Date.now()) {
    await appMetaDelete(parentOtpKey(normalizedPhone));
    return { ok: false, message: 'انتهت صلاحية الرمز. اطلب رمزًا جديدًا.' };
  }
  if (!verifyPassword(String(code || '').trim(), payload.codeHash)) {
    return { ok: false, message: 'رمز التحقق غير صحيح.' };
  }
  payload.consumedAt = nowIso();
  await appMetaSetJson(parentOtpKey(normalizedPhone), payload);
  return { ok: true, payload };
}

async function createParentSession(phone, profile) {await cleanupExpiredSessions();
  const token = crypto.randomBytes(32).toString('hex');
  await dbRun('INSERT INTO sessions (token, user_id, username, role, school_id, created_at, expires_at) VALUES ($1, $2, $3, $4, $5, $6, $7)', [token, 0, buildParentUsername(phone), 'parent', profile?.students?.[0]?.schoolId ?? null, nowIso(), daysFromNow(PARENT_SESSION_DAYS)]);
  await audit({ username: buildParentUsername(phone), role: 'parent' }, 'parent_login', { mobile: normalizePhoneNumber(phone), studentsCount: profile?.studentsCount || 0 });
  return token;
}

async function getParentProfileFromToken(token) {
  const session = await getSession(token);
  if (!session || session.role !== 'parent' || !String(session.username || '').startsWith('parent:')) return null;
  const phone = String(session.username || '').replace(/^parent:/, '');
  const state = getSharedState();
  const profile = await buildParentProfile(state, phone);
  if (!profile) return null;
  return profile;
}

async function getParentLatestSessionInfo(phone) {
  const normalizedPhone = normalizePhoneNumber(phone);
  if (!normalizedPhone) return null;
  const row = await dbQueryOne(
    'SELECT created_at, expires_at FROM sessions WHERE role = $1 AND username = $2 ORDER BY created_at DESC LIMIT 1',
    ['parent', buildParentUsername(normalizedPhone)]
  );
  if (!row) return null;
  return {
    lastLoginAt: String(row.created_at || '').trim(),
    expiresAt: String(row.expires_at || '').trim(),
    active: row.expires_at ? new Date(String(row.expires_at)).getTime() > Date.now() : false,
  };
}



async function buildParentPortalExecutiveSummary(state, schoolId, actorUser = null) {
  const normalizedSchoolId = Number(schoolId);
  const scopedActor = actorUser || { role: 'principal', schoolId: normalizedSchoolId };
  const parents = (await listParentAccounts(state, scopedActor)).filter((parent) => (Array.isArray(parent.schoolIds) ? parent.schoolIds.map((value) => Number(value)).includes(normalizedSchoolId) : false));
  const schoolStudents = getUnifiedSchoolStudentsForServer((state.schools || []).find((item) => Number(item.id) === normalizedSchoolId) || {}, { includeArchived: false, preferStructure: true });
  const policy = await getParentPrimaryChangePolicy(normalizedSchoolId);
  const portal = await getParentPortalSettings(normalizedSchoolId);
  const alerts = await getParentPrimaryChangeAlerts(normalizedSchoolId);
  const linkedParents = parents.length;
  const activeParents = parents.filter((parent) => parent.latestSession?.active).length;
  const suspendedParents = parents.filter((parent) => parent.accountControl?.suspended).length;
  const pendingRequests = parents.filter((parent) => String(parent.primaryChangeRequest?.status || '').trim() === 'pending').length;
  const approvedToday = alerts.filter((entry) => {
    const eventType = String(entry.eventType || '').trim();
    const sameDay = String(entry.createdAt || '').slice(0, 10) === todayIso();
    return sameDay && ['parent_primary_auto_approved', 'parent_primary_approved'].includes(eventType);
  }).length;
  const failedDeliveries = alerts.filter((entry) => String(entry.eventType || '').trim() === 'parent_delivery_failed').length;
  const extraContacts = parents.reduce((total, parent) => total + Number(parent.extraContactsCount || (Array.isArray(parent.extraContacts) ? parent.extraContacts.length : 0) || 0), 0);
  const WhatsAppPreferred = parents.filter((parent) => ['whatsapp', 'both'].includes(String(parent.notificationSettings?.preferredChannel || '').trim())).length;
  const studentsWithGuardian = schoolStudents.filter((student) => normalizePhoneNumber(student.guardianMobile || '')).length;
  return {
    portalEnabled: portal.enabled !== false,
    approvalMode: policy.mode === 'manual' ? 'manual' : 'auto',
    linkedParents,
    activeParents,
    suspendedParents,
    pendingRequests,
    approvedToday,
    failedDeliveries,
    extraContacts,
    preferredWhatsappCount: WhatsAppPreferred,
    studentsWithGuardian,
    coverageRate: schoolStudents.length ? Math.round((linkedParents / schoolStudents.length) * 100) : 0,
    guardianCoverageRate: schoolStudents.length ? Math.round((studentsWithGuardian / schoolStudents.length) * 100) : 0,
    alertCount: alerts.length,
    lastAlertAt: alerts[0]?.createdAt || '',
  };
}
async function listParentAuditFeed(state, actorUser = null) {
  const parents = await listParentAccounts(state, actorUser);
  const rows = [];
  for (const parent of parents) {
    const entries = await getParentAuditHistory(parent.mobile);
    for (const entry of entries || []) {
      const schoolId = entry.schoolId == null ? null : Number(entry.schoolId);
      if (actorUser && ['principal', 'supervisor'].includes(String(actorUser.role || '').trim().toLowerCase())) {
        const actorSchoolId = Number(actorUser.schoolId);
        const linkedSchoolIds = Array.isArray(parent.schoolIds) ? parent.schoolIds.map((value) => Number(value)) : [];
        if (schoolId && schoolId !== actorSchoolId) continue;
        if (!schoolId && !linkedSchoolIds.includes(actorSchoolId)) continue;
      }
      rows.push({
        id: entry.id || `${parent.mobile}_${Date.now()}`,
        createdAt: entry.createdAt || '',
        action: String(entry.action || '').trim(),
        title: String(entry.title || '').trim(),
        note: String(entry.note || '').trim(),
        actorName: String(entry.actorName || '').trim(),
        actorRole: String(entry.actorRole || '').trim(),
        schoolId,
        schoolName: String(entry.schoolName || parent.schoolNames?.[0] || '').trim(),
        studentId: entry.studentId ?? null,
        studentName: String(entry.studentName || '').trim(),
        guardianName: String(parent.guardianName || '').trim() || 'ولي الأمر',
        mobile: parent.mobile,
        mobileMasked: parent.mobileMasked || maskPhone(parent.mobile),
        scope: 'parent',
      });
    }
  }
  const policyMeta = await getParentPortalPolicyMeta();
  const globalAlerts = Array.isArray(policyMeta?.alerts) ? policyMeta.alerts : [];
  for (const entry of globalAlerts) {
    if (actorUser && ['principal', 'supervisor'].includes(String(actorUser.role || '').trim().toLowerCase())) {
      const actorSchoolId = Number(actorUser.schoolId);
      const entrySchoolId = entry?.schoolId == null ? null : Number(entry.schoolId);
      if (entrySchoolId && entrySchoolId !== actorSchoolId) continue;
    }
    rows.push({
      id: entry.id || `school_alert_${Date.now()}`,
      createdAt: entry.createdAt || '',
      action: String(entry.action || 'policy_update').trim(),
      title: String(entry.message || entry.title || 'إجراء عام على بوابة ولي الأمر').trim(),
      note: String(entry.note || entry.message || '').trim(),
      actorName: String(entry.actorName || '').trim(),
      actorRole: String(entry.actorRole || '').trim(),
      schoolId: entry.schoolId == null ? null : Number(entry.schoolId),
      schoolName: String(entry.schoolName || '').trim(),
      studentId: null,
      studentName: '',
      guardianName: '',
      mobile: '',
      mobileMasked: '',
      scope: 'school',
    });
  }
  rows.sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
  const summary = {
    total: rows.length,
    parents: parents.length,
    schools: new Set(rows.map((item) => item.schoolId).filter((value) => value != null)).size,
    byAction: rows.reduce((acc, item) => {
      const key = String(item.action || 'other').trim() || 'other';
      acc[key] = Number(acc[key] || 0) + 1;
      return acc;
    }, {}),
  };
  return { entries: rows.slice(0, 1000), summary };
}

async function listParentAccounts(state, actorUser = null) {
  const normalizedRole = String(actorUser?.role || '').trim().toLowerCase();
  const scopedSchools = (state.schools || []).filter((school) => {
    if (normalizedRole === 'superadmin' || normalizedRole === 'admin') return true;
    if (!actorUser) return false;
    if (normalizedRole === 'principal' || normalizedRole === 'supervisor') return Number(school.id) === Number(actorUser.schoolId);
    return false;
  });
  const map = new Map();
  for (const school of scopedSchools) {
    const students = getUnifiedSchoolStudentsForServer(school, { includeArchived: false, preferStructure: true });
    for (const student of students) {
      const phone = normalizePhoneNumber(student.guardianMobile || '');
      if (!phone) continue;
      if (!map.has(phone)) {
        map.set(phone, {
          mobile: phone,
          mobileMasked: maskPhone(phone),
          guardianName: String(student.guardianName || '').trim() || 'ولي الأمر',
          schoolIds: new Set(),
          schoolNames: new Set(),
          students: [],
        });
      }
      const item = map.get(phone);
      item.schoolIds.add(Number(school.id));
      item.schoolNames.add(String(school.name || '').trim());
      item.students.push({
        schoolId: school.id,
        schoolName: school.name || 'المدرسة',
        studentId: student.id,
        name: student.fullName || student.name || 'طالب',
        className: extractClassLabelForParent(student),
        status: student.status || 'غير مسجل',
        points: Number(student.points || 0),
      });
      if (!String(item.guardianName || '').trim() && String(student.guardianName || '').trim()) item.guardianName = String(student.guardianName || '').trim();
    }
  }
  const rows = [];
  for (const entry of map.values()) {
    const extraContacts = await getParentExtraContacts(entry.mobile);
    const notificationSettings = await getParentNotificationSettings(entry.mobile);
    const latestSession = await getParentLatestSessionInfo(entry.mobile);
    const primaryChangeRequest = await getParentPrimaryChangeRequest(entry.mobile);
    const accountControl = await getParentAccountControl(entry.mobile);
    rows.push({
      mobile: entry.mobile,
      mobileMasked: entry.mobileMasked,
      guardianName: entry.guardianName,
      studentsCount: entry.students.length,
      schoolIds: [...entry.schoolIds],
      schoolNames: [...entry.schoolNames].filter(Boolean),
      studentNames: entry.students.map((student) => student.name),
      students: entry.students.slice(0, 12),
      extraContacts: extraContacts.map((contact) => ({ ...contact, mobileMasked: maskPhone(contact.mobile) })),
      extraContactsCount: extraContacts.length,
      notificationSettings,
      latestSession,
      primaryChangeRequest,
      accountControl,
      status: accountControl?.suspended ? 'suspended' : latestSession?.active ? 'active' : primaryChangeRequest?.status === 'pending' ? 'pending' : 'idle',
    });
  }
  return rows.sort((a, b) => {
    const aTime = new Date(a.latestSession?.lastLoginAt || a.primaryChangeRequest?.requestedAt || 0).getTime();
    const bTime = new Date(b.latestSession?.lastLoginAt || b.primaryChangeRequest?.requestedAt || 0).getTime();
    return bTime - aTime;
  });
}

async function createSession(user) {
  await cleanupExpiredSessions();
  const token = crypto.randomBytes(32).toString('hex');
  await dbRun(
    'INSERT INTO sessions (token, user_id, username, role, school_id, created_at, expires_at) VALUES ($1, $2, $3, $4, $5, $6, $7)',
    [token, user.id, user.username, user.role, user.schoolId ?? null, nowIso(), daysFromNow(SESSION_DAYS)]
  );
  await auditAuthEvent('login', { tokenPreview: token.slice(0, 8) }, user);
  return token;
}

async function appMetaGetJson(key) {
  const row = await dbQueryOne('SELECT value FROM app_meta WHERE key = $1', [key]);
  if (!row?.value) return null;
  try { return JSON.parse(row.value); } catch { return null; }
}

async function appMetaSetJson(key, value) {
  await dbRun(
    'INSERT INTO app_meta (key, value, updated_at) VALUES ($1, $2, $3) ON CONFLICT(key) DO UPDATE SET value = EXCLUDED.value, updated_at = EXCLUDED.updated_at',
    [key, JSON.stringify(value), nowIso()]
  );
}

async function appMetaDelete(key) {
  await dbRun('DELETE FROM app_meta WHERE key = $1', [key]);
}

function resetRequestKey(userId) {
  return `password_reset_${Number(userId)}`;
}

async function createPasswordResetRequest(user) {
  const code = String(Math.floor(100000 + Math.random() * 900000));
  const payload = {
    userId: Number(user.id),
    username: user.username,
    email: String(user.email || '').trim().toLowerCase(),
    code,
    requestedAt: nowIso(),
    expiresAt: new Date(Date.now() + 30 * 60 * 1000).toISOString(),
  };
  await appMetaSetJson(resetRequestKey(user.id), payload);
  await audit({ username: user.username, role: user.role }, 'request_password_reset', { userId: user.id, email: payload.email, delivery: process.env.SMTP_HOST ? 'email-ready' : 'manual-code' });
  return payload;
}

async function consumePasswordResetRequest(user, code) {
  const payload = await appMetaGetJson(resetRequestKey(user.id));
  if (!payload) return { ok: false, message: 'لا يوجد طلب نشط لإعادة التعيين لهذا الحساب.' };
  if (new Date(payload.expiresAt).getTime() < Date.now()) {
    await appMetaDelete(resetRequestKey(user.id));
    return { ok: false, message: 'انتهت صلاحية رمز إعادة التعيين. اطلب رمزًا جديدًا.' };
  }
  if (String(payload.code || '') !== String(code || '').trim()) {
    return { ok: false, message: 'رمز إعادة التعيين غير صحيح.' };
  }
  await appMetaDelete(resetRequestKey(user.id));
  return { ok: true, payload };
}

async function getSession(token) {
  if (!token) return null;
  await cleanupExpiredSessions();
  const row = await dbQueryOne('SELECT * FROM sessions WHERE token = $1', [token]);
  if (!row) return null;
  return row;
}

async function deleteSession(token) {
  if (!token) return;
  await dbRun('DELETE FROM sessions WHERE token = $1', [token]);
}

function sanitizeUser(user) {
  if (!user) return null;
  const { password, ...safe } = user;
  return safe;
}

// Helper: extract actor from HTTP request Authorization header
async function getActorFromRequest(req) {
  const token = parseAuthToken(req);
  if (!token) return null;
  return getUserFromToken(token);
}

async function getUserFromToken(token) {
  const session = await getSession(token);
  if (!session) return null;
  const state = getSharedState();
  const user = state.users.find((item) => item.id === session.user_id && item.username === session.username && item.status === 'نشط');
  if (!user) return null;
  const school = state.schools.find((item) => item.id === user.schoolId);
  if (!isRoleEnabledForSchool(user.role, school)) return null;
  return sanitizeUser(user);
}

function parseAuthToken(req) {
  const header = req.headers.authorization || '';
  if (header.startsWith('Bearer ')) return header.slice(7).trim();
  const alt = req.headers['x-session-token'];
  return typeof alt === 'string' ? alt.trim() : '';
}

function sendJson(res, statusCode, payload) {
  const body = JSON.stringify(payload);
  res.writeHead(statusCode, {
    'Content-Type': 'application/json; charset=utf-8',
    'Content-Length': Buffer.byteLength(body),
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Session-Token',
    'Access-Control-Allow-Methods': 'GET,POST,OPTIONS',
  });
  res.end(body);
}

function sendText(res, statusCode, text, contentType = 'text/plain; charset=utf-8') {
  res.writeHead(statusCode, {
    'Content-Type': contentType,
    'Content-Length': Buffer.byteLength(text),
    'Access-Control-Allow-Origin': '*',
  });
  res.end(text);
}

function notFound(res) {
  sendJson(res, 404, { ok: false, message: 'المسار غير موجود.' });
}

async function readJsonBody(req) {
  const chunks = [];
  let total = 0;
  for await (const chunk of req) {
    total += chunk.length;
    if (total > JSON_LIMIT_BYTES) {
      const error = new Error('payload_too_large');
      error.code = 413;
      throw error;
    }
    chunks.push(chunk);
  }
  const raw = Buffer.concat(chunks).toString('utf8');
  if (!raw) return {};
  try {
    return JSON.parse(raw);
  } catch {
    const error = new Error('invalid_json');
    error.code = 400;
    throw error;
  }
}

function mergeStateByRole(currentState, incomingState, actor) {
  const incoming = hydrateSharedState(incomingState);
  if (actor.role === 'superadmin') return incoming;

  const schoolId = actor.schoolId;
  const next = structuredClone(currentState);

  if (actor.role === 'principal') {
    const incomingSchool = incoming.schools.find((item) => item.id === schoolId);
    if (incomingSchool) {
      next.schools = next.schools.map((school) => school.id === schoolId ? incomingSchool : school);
    }
  }

  if (['principal', 'supervisor', 'teacher', 'gate'].includes(actor.role)) {
    next.scanLog = [
      ...currentState.scanLog.filter((item) => item.schoolId !== schoolId),
      ...incoming.scanLog.filter((item) => item.schoolId === schoolId),
    ];
    next.actionLog = [
      ...currentState.actionLog.filter((item) => item.schoolId !== schoolId),
      ...incoming.actionLog.filter((item) => item.schoolId === schoolId),
    ];
  }

  // السماح للمعلم والمشرف بتحديث lessonAttendanceSessions في مدرستهم
  if (['supervisor', 'teacher'].includes(actor.role)) {
    const incomingSchool = incoming.schools.find((item) => item.id === schoolId);
    if (incomingSchool) {
      next.schools = next.schools.map((school) => {
        if (school.id !== schoolId) return school;
        return {
          ...school,
          lessonAttendanceSessions: incomingSchool.lessonAttendanceSessions || school.lessonAttendanceSessions || [],
        };
      });
    }
  }

  if (actor.role === 'principal') {
    const incomingSchoolUsers = incoming.users.filter((item) => item.role !== 'superadmin' && item.schoolId === schoolId);
    next.users = [
      ...currentState.users.filter((item) => item.role === 'superadmin' || item.schoolId !== schoolId),
      ...incomingSchoolUsers,
    ];
    next.settings = incoming.settings;
  }

  if (actor.role === 'student') {
    return currentState;
  }

  return hydrateSharedState(next);
}

function parseTimeToMinutes(value = '00:00') {
  const [hours, minutes] = String(value || '').split(':').map((item) => Number(item));
  return (Number.isFinite(hours) ? hours : 0) * 60 + (Number.isFinite(minutes) ? minutes : 0);
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function toArabicDate(date = new Date()) {
  return new Intl.DateTimeFormat('ar-SA', { year: 'numeric', month: '2-digit', day: '2-digit' }).format(date);
}

function getTodayIso() {
  return new Date().toISOString().slice(0, 10);
}

function statusFromResult(result = '') {
  if (String(result).includes('مبكر')) return 'مبكر';
  if (String(result).includes('في الوقت')) return 'في الوقت';
  if (String(result).includes('تأخر')) return 'متأخر';
  return 'غير معروف';
}

function createPublicToken(prefix = 'lnk') {
  return `${prefix}_${crypto.randomBytes(10).toString('hex')}`;
}

function canManageSchoolDevices(actor, schoolId) {
  if (!actor) return false;
  if (actor.role === 'superadmin') return true;
  return Number(actor.schoolId) === Number(schoolId) && (actor.role === 'principal' || actor.permissions?.deviceDisplays === true);
}

function canReadSchoolReports(actor, schoolId) {
  if (!actor) return false;
  if (actor.role === 'superadmin') return true;
  return Number(actor.schoolId) === Number(schoolId) && ['principal', 'supervisor', 'teacher', 'gate'].includes(actor.role);
}

function canManageSchoolMessages(actor, schoolId) {
  if (!actor) return false;
  if (actor.role === 'superadmin') return true;
  return Number(actor.schoolId) === Number(schoolId) && (actor.role === 'principal' || actor.permissions?.messages === true);
}


function canManageParentPortal(actor, schoolId) {
  if (!actor) return false;
  if (actor.role === 'superadmin') return true;
  return Number(actor.schoolId) === Number(schoolId) && actor.role === 'principal';
}

function normalizePhoneNumber(value = '') {
  let digits = String(value || '').trim().replace(/[^\d+]/g, '');
  if (!digits) return '';
  if (digits.startsWith('+')) digits = digits.slice(1);
  if (digits.startsWith('00')) digits = digits.slice(2);
  if (digits.startsWith('0')) digits = `966${digits.slice(1)}`;
  return digits;
}

function maskSecret(value = '') {
  const raw = String(value || '');
  if (!raw) return '';
  if (raw.length <= 8) return '••••';
  return `${raw.slice(0, 4)}••••${raw.slice(-4)}`;
}

function hydrateMessagingSettings(school) {
  const settings = school?.messaging?.settings || {};
  const integration = settings.integration || {};
  return {
    channels: {
      whatsapp: settings.channels?.whatsapp !== false,
      sms: settings.channels?.sms === true,
      internal: settings.channels?.internal !== false,
    },
    operations: {
      instantSend: settings.operations?.instantSend !== false,
      scheduling: settings.operations?.scheduling !== false,
      batchLimit: Math.max(1, Math.min(1000, Number(settings.operations?.batchLimit) || 200)),
      delaySeconds: Math.max(0, Math.min(30, Number(settings.operations?.delaySeconds) || 0)),
      retryCount: Math.max(0, Math.min(5, Number(settings.operations?.retryCount) || 0)),
      retentionDays: Math.max(7, Math.min(365, Number(settings.operations?.retentionDays) || 90)),
    },
    integration: {
      whatsapp: {
        mode: integration.whatsapp?.mode || 'cloud',
        phoneNumberId: String(integration.whatsapp?.phoneNumberId || '').trim(),
        businessAccountId: String(integration.whatsapp?.businessAccountId || '').trim(),
        accessToken: String(integration.whatsapp?.accessToken || '').trim(),
        webhookVerifyToken: String(integration.whatsapp?.webhookVerifyToken || '').trim(),
        testRecipient: normalizePhoneNumber(integration.whatsapp?.testRecipient || ''),
        status: String(integration.whatsapp?.status || 'غير مرتبط'),
        lastCheckedAt: String(integration.whatsapp?.lastCheckedAt || ''),
      },
      sms: {
        provider: String(integration.sms?.provider || '').trim(),
        senderId: String(integration.sms?.senderId || '').trim(),
        apiUrl: String(integration.sms?.apiUrl || '').trim(),
        apiKey: String(integration.sms?.apiKey || '').trim(),
        username: String(integration.sms?.username || '').trim(),
        password: String(integration.sms?.password || '').trim(),
        testRecipient: normalizePhoneNumber(integration.sms?.testRecipient || ''),
        status: String(integration.sms?.status || 'غير مرتبط'),
        lastCheckedAt: String(integration.sms?.lastCheckedAt || ''),
      },
    },
  };
}

function getUnifiedSchoolStudentsForMessaging(school) {
  return getUnifiedSchoolStudentsForServer(school, { includeArchived: false, preferStructure: true }).map((student) => ({
    ...student,
    guardianMobile: normalizePhoneNumber(student.guardianMobile || student.mobile || ''),
  }));
}

function mapEventTypeToParentPreferenceKey(eventType = '') {
  switch (String(eventType || '').toLowerCase()) {
    case 'late':
      return 'late';
    case 'absence':
      return 'absent';
    case 'behavior':
      return 'negative';
    case 'positive':
      return 'positive';
    case 'announcement':
    case 'manual':
      return 'announcements';
    default:
      return '';
  }
}

function resolveParentPreferredChannels(requestedChannel, preferredChannel, integrations = {}) {
  const requested = requestedChannel === 'sms' ? 'sms' : requestedChannel === 'internal' ? 'internal' : 'whatsapp';
  if (requested === 'internal') return ['internal'];
  const allowWhatsApp = !!(integrations.whatsapp?.phoneNumberId && integrations.whatsapp?.accessToken);
  const allowSms = !!(integrations.sms?.apiUrl || integrations.sms?.provider);
  const preference = ['whatsapp', 'sms', 'both'].includes(String(preferredChannel || '').trim()) ? String(preferredChannel).trim() : requested;
  const channels = [];
  if (preference === 'both') {
    if (allowWhatsApp) channels.push('whatsapp');
    if (allowSms) channels.push('sms');
  } else if (preference === 'sms') {
    if (allowSms) channels.push('sms');
    else if (allowWhatsApp) channels.push('whatsapp');
  } else {
    if (allowWhatsApp) channels.push('whatsapp');
    else if (allowSms) channels.push('sms');
  }
  if (!channels.length) channels.push(requested);
  return [...new Set(channels)];
}

async function getStudentNotificationRecipients(student, channel, options = {}) {
  if (channel === 'internal') return [{ recipient: `student:${student.id}`, recipientType: 'internal', channel: 'internal' }];
  const primary = normalizePhoneNumber(student.guardianMobile || student.mobile || '');
  if (!primary) return [];
  const preferenceKey = mapEventTypeToParentPreferenceKey(options.eventType || '');
  const settings = await getParentNotificationSettings(primary);
  if (preferenceKey && settings?.events?.[preferenceKey] === false) return [];
  const extras = settings.deliveryScope === 'primary_and_extra' ? await getParentExtraContacts(primary) : [];
  const integrations = options.integrations || {};
  const primaryChannels = resolveParentPreferredChannels(channel, settings.preferredChannel, integrations);
  const rows = [];
  const seen = new Set();
  for (const preferredChannel of primaryChannels) {
    const key = `${primary}:${preferredChannel}`;
    if (seen.has(key)) continue;
    seen.add(key);
    rows.push({ recipient: primary, recipientType: 'primary', channel: preferredChannel });
  }
  for (const item of extras.filter((entry) => entry.status !== 'disabled')) {
    const mobile = normalizePhoneNumber(item.mobile || '');
    if (!mobile) continue;
    const extraChannel = item.channel === 'sms' ? 'sms' : 'whatsapp';
    const key = `${mobile}:${extraChannel}`;
    if (seen.has(key)) continue;
    seen.add(key);
    rows.push({ recipient: mobile, recipientType: 'extra', channel: extraChannel });
  }
  return rows;
}

function getMessageAudienceStudents(school, audience = 'allStudents') {
  const students = getUnifiedSchoolStudentsForMessaging(school);
  const audienceValue = String(audience || 'allStudents');
  if (audienceValue.startsWith('students:')) {
    const ids = new Set(audienceValue.replace(/^students:/, '').split(',').map((value) => String(value || '').trim()).filter(Boolean));
    return students.filter((student) => ids.has(String(student.id || '')));
  }
  if (audienceValue === 'lateToday') return students.filter((student) => String(student.status || '') === 'متأخر');
  if (audienceValue === 'positive') return students.filter((student) => Number(student.points || 0) >= 120);
  if (audienceValue === 'behavior') return students.filter((student) => Number(student.points || 0) < 100);
  return students;
}

function applyMessageVariablesServer(template, payload = {}) {
  const source = String(template || '');
  const values = {
    'اسم_الطالب': payload.studentName || 'الطالب',
    'الصف': payload.grade || '—',
    'الفصل': payload.className || payload.companyName || '—',
    'الشركة': payload.companyName || '—',
    'المدرسة': payload.schoolName || '—',
    'وقت_التأخر': payload.lateTime || payload.time || '—',
    'عدد_مرات_التأخر': payload.lateCount || '1',
    'نوع_المخالفة': payload.violationType || 'ملاحظة',
    'النقاط': payload.points ?? '0',
  };
  return source.replace(/\{([^}]+)\}/g, (_, key) => values[key] ?? `{${key}}`);
}

function getTemplateCategoriesForEvent(eventType) {
  switch (String(eventType || '').toLowerCase()) {
    case 'late':
      return ['تأخر', 'late'];
    case 'absence':
      return ['غياب', 'absence'];
    case 'behavior':
      return ['سلوك', 'مخالفة', 'behavior'];
    case 'positive':
      return ['إشادة', 'positive'];
    default:
      return [];
  }
}

function getDefaultTemplateForEvent(school, eventType, preferredChannel = '') {
  const templates = Array.isArray(school?.messaging?.templates) ? school.messaging.templates : [];
  const categories = getTemplateCategoriesForEvent(eventType);
  const normalizedChannel = String(preferredChannel || '').toLowerCase();
  const categoryMatches = templates.filter((item) => item?.active !== false).filter((item) => {
    const category = String(item?.category || '').trim().toLowerCase();
    return categories.some((candidate) => category.includes(String(candidate).toLowerCase()));
  });
  const ranked = [...categoryMatches].sort((a, b) => {
    const aScore = (a?.isDefault ? 4 : 0) + (normalizedChannel && String(a?.channel || '').toLowerCase() === normalizedChannel ? 2 : 0);
    const bScore = (b?.isDefault ? 4 : 0) + (normalizedChannel && String(b?.channel || '').toLowerCase() === normalizedChannel ? 2 : 0);
    return bScore - aScore;
  });
  return ranked[0] || null;
}

function getRuleMessageBody(school, rule) {
  const explicit = String(rule?.message || '').trim();
  if (explicit) return explicit;
  return String(getDefaultTemplateForEvent(school, rule?.eventType, rule?.channel)?.message || '').trim();
}

function getMessagingAutomationFlags(settings = {}) {
  return {
    enabled: settings.automation?.enabled !== false,
    lateAlerts: settings.automation?.lateAlerts !== false,
    absenceAlerts: settings.automation?.absenceAlerts === true,
    behaviorAlerts: settings.automation?.behaviorAlerts === true,
    checkTime: String(settings.automation?.checkTime || '06:50'),
  };
}

function getActiveMessagingRulesForEvent(school, eventType) {
  return (school?.messaging?.rules || []).filter((rule) => rule?.active !== false && String(rule?.eventType || '') === String(eventType || ''));
}

function hasAutomationDeliveryForToday(logs = [], ruleId, studentId, isoDate, eventType) {
  return (logs || []).some((log) => {
    if (log?.automationMeta?.ruleId && String(log.automationMeta.ruleId) === String(ruleId) && String(log.automationMeta.studentId) === String(studentId) && String(log.automationMeta.isoDate) === String(isoDate)) return true;
    return (log?.deliveries || []).some((delivery) => String(delivery?.ruleId || '') === String(ruleId) && String(delivery?.studentId || '') === String(studentId) && String(delivery?.eventType || '') === String(eventType || '') && String(delivery?.isoDate || '') === String(isoDate));
  });
}

async function appendAutomaticMessageLog(school, settings, rule, student, eventType, isoDate, text, lateTime, schoolName) {
  const logs = Array.isArray(school.messaging?.logs) ? school.messaging.logs : [];
  if (rule.preventDuplicates !== false && hasAutomationDeliveryForToday(logs, rule.id, student.id, isoDate, eventType)) {
    return { skipped: true, reason: 'duplicate' };
  }
  if (settings.channels?.[rule.channel] !== true) {
    return { skipped: true, reason: 'channel_disabled' };
  }
  const recipients = await getStudentNotificationRecipients(student, rule.channel, { eventType, integrations: settings.integration || {} });
  if (!recipients.length) {
    const failureLog = {
      id: Date.now() + Math.floor(Math.random() * 1000),
      createdAt: new Date().toISOString(),
      subject: rule.name || 'تنبيه تلقائي',
      type: 'تلقائي',
      audience: eventType === 'absence' ? 'طلاب غياب' : eventType === 'late' ? 'طلاب متأخرون' : eventType === 'behavior' ? 'طلاب سلوك / انضباط' : 'طلاب مستهدفون',
      channel: rule.channel || 'whatsapp',
      senderName: 'محرك التنبيهات',
      recipients: 0,
      successCount: 0,
      failedCount: 1,
      status: 'فشل',
      body: text,
      automationMeta: { ruleId: rule.id, eventType, studentId: student.id, isoDate },
      deliveries: [{ studentId: student.id, studentName: student.name || student.fullName, status: 'فشل', reason: 'لا يوجد رقم مستفيد صالح.', ruleId: rule.id, eventType, isoDate }],
    };
    school.messaging = school.messaging || {};
    school.messaging.logs = [failureLog, ...logs].slice(0, settings.operations?.retentionDays ? 500 : 200);
    await recordParentDeliveries({ schools: [school] }, failureLog.deliveries, {
      title: rule.name || 'تنبيه تلقائي',
      body: text,
      schoolId: school.id,
      schoolName: school.name || '',
      eventType,
      channel: rule.channel || 'whatsapp',
      sourceType: 'automation',
      createdAt: failureLog.createdAt,
    });
    return { ok: false, message: 'لا يوجد رقم مستفيد صالح.' };
  }
  let successCount = 0;
  let failedCount = 0;
  const deliveries = [];
  for (const recipientRow of recipients) {
    try {
      const effectiveChannel = recipientRow.channel || rule.channel;
      const dispatched = await dispatchChannelMessage(effectiveChannel, settings.integration, recipientRow.recipient, text);
      successCount += 1;
      deliveries.push({ studentId: student.id, studentName: student.name || student.fullName, status: 'نجاح', recipient: recipientRow.recipient, recipientType: recipientRow.recipientType, channel: effectiveChannel, providerMessageId: dispatched.providerMessageId || '', ruleId: rule.id, eventType, isoDate });
    } catch (error) {
      failedCount += 1;
      deliveries.push({ studentId: student.id, studentName: student.name || student.fullName, status: 'فشل', recipient: recipientRow.recipient, recipientType: recipientRow.recipientType, channel: effectiveChannel, reason: error?.message || 'تعذر الإرسال', ruleId: rule.id, eventType, isoDate });
    }
  }
  const eventLog = {
    id: Date.now() + Math.floor(Math.random() * 1000),
    createdAt: new Date().toISOString(),
    subject: rule.name || 'تنبيه تلقائي',
    type: 'تلقائي',
    audience: eventType === 'absence' ? 'طلاب غياب' : eventType === 'late' ? 'طلاب متأخرون' : eventType === 'behavior' ? 'طلاب سلوك / انضباط' : 'طلاب مستهدفون',
    channel: rule.channel || 'whatsapp',
    senderName: 'محرك التنبيهات',
    recipients: recipients.length,
    successCount,
    failedCount,
    status: failedCount && successCount ? 'جزئي' : failedCount ? 'فشل' : 'نجاح',
    body: text,
    automationMeta: { ruleId: rule.id, eventType, studentId: student.id, isoDate },
    deliveries,
  };
  school.messaging = school.messaging || {};
  school.messaging.logs = [eventLog, ...logs].slice(0, 500);
  await recordParentDeliveries({ schools: [school] }, deliveries, {
    title: rule.name || 'تنبيه تلقائي',
    body: text,
    schoolId: school.id,
    schoolName: school.name || '',
    eventType,
    channel: rule.channel || 'whatsapp',
    sourceType: 'automation',
    createdAt: eventLog.createdAt,
  });
  return { ok: failedCount === 0, message: failedCount ? 'تم الإرسال لبعض الجهات وتعذر على جهات أخرى.' : '', successCount, failedCount };
}

async function runAutomatedMessagingForSchool(state, schoolId, trigger = {}) {
  const next = structuredClone(state);
  const school = next.schools.find((item) => Number(item.id) === Number(schoolId));
  if (!school) return { ok: false, state };
  const settings = hydrateMessagingSettings(school);
  const automation = getMessagingAutomationFlags(settings);
  if (!automation.enabled) return { ok: true, state: hydrateSharedState(next), automationRuns: [] };
  school.messaging = school.messaging || {};
  school.messaging.logs = Array.isArray(school.messaging.logs) ? school.messaging.logs : [];
  const automationRuns = [];
  const isoDate = String(trigger.isoDate || getTodayIso());
  const students = getUnifiedSchoolStudentsForMessaging(school);

  if (trigger.eventType === 'late' && automation.lateAlerts) {
    const lateRules = getActiveMessagingRulesForEvent(school, 'late');
    const student = students.find((item) => String(item.id) === String(trigger.studentId));
    if (student && lateRules.length) {
      for (const rule of lateRules) {
        const text = applyMessageVariablesServer(getRuleMessageBody(school, rule), {
          studentName: student.name || student.fullName,
          grade: student.grade,
          className: student.className,
          companyName: student.companyName,
          schoolName: school.name,
          lateTime: trigger.lateTime || trigger.time || '—',
          points: student.points || 0,
        });
        const result = await appendAutomaticMessageLog(school, settings, rule, student, 'late', isoDate, text, trigger.lateTime || trigger.time || '—', school.name);
        automationRuns.push({ eventType: 'late', ruleId: rule.id, studentId: student.id, ...(result || {}) });
      }
    }
  }

  if (automation.absenceAlerts) {
    const absenceRules = getActiveMessagingRulesForEvent(school, 'absence');
    const checkMinutes = parseTimeToMinutes(automation.checkTime || '06:50');
    const now = trigger.now ? new Date(trigger.now) : new Date();
    const currentMinutes = now.getHours() * 60 + now.getMinutes();
    if (absenceRules.length && currentMinutes >= checkMinutes) {
      const presentIds = new Set((next.scanLog || []).filter((entry) => Number(entry.schoolId) === Number(schoolId) && String(entry.isoDate) === String(isoDate) && !String(entry.result || '').includes('فشل') && !String(entry.result || '').includes('مسبق')).map((entry) => String(entry.studentId)));
      const absentStudents = students.filter((student) => !presentIds.has(String(student.id))).slice(0, Number(settings.operations?.batchLimit || 200));
      for (const student of absentStudents) {
        for (const rule of absenceRules) {
          const text = applyMessageVariablesServer(getRuleMessageBody(school, rule), {
            studentName: student.name || student.fullName,
            grade: student.grade,
            className: student.className,
            companyName: student.companyName,
            schoolName: school.name,
            points: student.points || 0,
          });
          const result = await appendAutomaticMessageLog(school, settings, rule, student, 'absence', isoDate, text, automation.checkTime || '06:50', school.name);
          automationRuns.push({ eventType: 'absence', ruleId: rule.id, studentId: student.id, ...(result || {}) });
        }
      }
    }
  }

  if (trigger.eventType === 'behavior' && automation.behaviorAlerts) {
    const behaviorRules = getActiveMessagingRulesForEvent(school, 'behavior');
    const student = students.find((item) => String(item.id) === String(trigger.studentId));
    if (student && behaviorRules.length) {
      for (const rule of behaviorRules) {
        const text = applyMessageVariablesServer(getRuleMessageBody(school, rule), {
          studentName: student.name || student.fullName,
          grade: student.grade,
          className: student.className,
          companyName: student.companyName,
          schoolName: school.name,
          violationType: trigger.violationType || trigger.actionTitle || 'ملاحظة سلوكية',
          points: trigger.points ?? student.points ?? 0,
        });
        const result = await appendAutomaticMessageLog(school, settings, rule, student, 'behavior', isoDate, text, trigger.time || '—', school.name);
        automationRuns.push({ eventType: 'behavior', ruleId: rule.id, studentId: student.id, ...(result || {}) });
      }
    }
  }

  return { ok: true, state: hydrateSharedState(next), automationRuns };
}

async function sendWhatsappCloudMessage(config, to, text) {
  if (!config.phoneNumberId || !config.accessToken) throw new Error('بيانات واتساب غير مكتملة.');
  const response = await fetch(`https://graph.facebook.com/v22.0/${encodeURIComponent(config.phoneNumberId)}/messages`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${config.accessToken}`,
    },
    body: JSON.stringify({
      messaging_product: 'whatsapp',
      recipient_type: 'individual',
      to,
      type: 'text',
      text: { preview_url: false, body: String(text || '').slice(0, 4096) },
    }),
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data?.error?.message || 'فشل إرسال واتساب.');
  return { providerMessageId: data?.messages?.[0]?.id || '', raw: data };
}

async function sendSmsMessage(config, to, text) {
  if (!config.apiUrl || !config.senderId) throw new Error('بيانات SMS غير مكتملة.');
  const headers = { 'Content-Type': 'application/json' };
  if (config.apiKey) headers['X-API-Key'] = config.apiKey;
  if (config.username || config.password) headers.Authorization = `Basic ${Buffer.from(`${config.username || ''}:${config.password || ''}`).toString('base64')}`;
  const response = await fetch(config.apiUrl, {
    method: 'POST',
    headers,
    body: JSON.stringify({ to, sender: config.senderId, message: String(text || '') }),
  });
  const rawText = await response.text();
  let data = {};
  try { data = rawText ? JSON.parse(rawText) : {}; } catch { data = { rawText }; }
  if (!response.ok) throw new Error(data?.message || rawText || 'فشل إرسال SMS.');
  return { providerMessageId: data?.id || data?.messageId || '', raw: data };
}

// alias for readJsonBody
async function parseJsonBody(req) {
  return readJsonBody(req);
}

// Hydrate messaging center from school messaging config
function hydrateMessagingCenter(messaging) {
  if (!messaging) return { settings: { channels: {} }, integration: {} };
  return {
    settings: messaging.settings || { channels: {} },
    integration: messaging.integration || {},
  };
}

// Get parent portal policy meta (global alerts)
async function getParentPortalPolicyMeta() {
  const payload = await appMetaGetJson('parent_portal_policy_meta');
  return payload || { alerts: [] };
}

// Try to send OTP via a channel (SMS/WhatsApp)
async function trySendOtpToChannel({ channel, recipient, message }) {
  try {
    if (channel === 'sms') {
      // Try to find school messaging config
      const state = getSharedState();
      const school = (state.schools || [])[0];
      const messaging = hydrateMessagingCenter(school?.messaging);
      if (messaging?.settings?.channels?.sms && messaging?.integration?.sms) {
        await sendSmsMessage(messaging.integration.sms, recipient, message);
        return { ok: true };
      }
    } else if (channel === 'whatsapp') {
      const state = getSharedState();
      const school = (state.schools || [])[0];
      const messaging = hydrateMessagingCenter(school?.messaging);
      if (messaging?.settings?.channels?.whatsapp && messaging?.integration?.whatsapp) {
        await sendWhatsappCloudMessage(messaging.integration.whatsapp, recipient, message);
        return { ok: true };
      }
    }
    return { ok: false, reason: 'channel_not_configured' };
  } catch (error) {
    return { ok: false, reason: String(error?.message || 'send_failed') };
  }
}

// alias for generateOtpCode
function generateOtp(length = 6) {
  return generateOtpCode(length);
}

async function dispatchChannelMessage(channel, config, recipient, text) {
  if (channel === 'internal') return { providerMessageId: `internal-${Date.now()}`, raw: { ok: true } };
  if (channel === 'whatsapp') return sendWhatsappCloudMessage(config.whatsapp || {}, recipient, text);
  if (channel === 'sms') return sendSmsMessage(config.sms || {}, recipient, text);
  throw new Error('قناة غير مدعومة.');
}


function getSelectedTeacherAudience(school, state, recipientUserIds = []) {
  const wanted = Array.isArray(recipientUserIds) ? recipientUserIds.map((id) => Number(id)).filter(Boolean) : [];
  return (state.users || []).filter((user) => Number(user.schoolId) === Number(school?.id) && String(user.role || '') === 'teacher' && String(user.status || 'نشط') === 'نشط' && wanted.includes(Number(user.id))).map((user) => ({
    id: user.id,
    name: user.name || user.username || 'معلم',
    mobile: String(user.mobile || '').trim(),
    username: user.username || '',
  }));
}

async function processSchoolMessageSend(state, schoolId, actor, payload = {}) {
  const next = structuredClone(state);
  const school = next.schools.find((item) => Number(item.id) === Number(schoolId));
  if (!school) return { ok: false, message: 'المدرسة غير موجودة.' };
  const settings = hydrateMessagingSettings(school);
  const channel = payload.channel === 'sms' ? 'sms' : payload.channel === 'internal' ? 'internal' : 'whatsapp';
  const sendMode = payload.sendMode === 'scheduled' ? 'scheduled' : 'now';
  if (settings.channels?.[channel] !== true) return { ok: false, message: 'القناة المحددة غير مفعلة من الإعدادات.' };
  const audience = String(payload.audience || 'allStudents');
  const isTeacherAudience = audience === 'selectedTeachers';
  const targetedTeachers = isTeacherAudience ? getSelectedTeacherAudience(school, next, payload.recipientUserIds || []) : [];
  const targetedStudents = isTeacherAudience ? [] : getMessageAudienceStudents(school, audience).slice(0, settings.operations.batchLimit || 200);
  if (!targetedStudents.length && !targetedTeachers.length) return { ok: false, message: 'لا يوجد مستهدفون مطابقون لهذه العملية.' };
  const now = new Date();
  const log = {
    id: Date.now(),
    createdAt: now.toISOString(),
    subject: String(payload.subject || 'رسالة تشغيلية').trim() || 'رسالة تشغيلية',
    type: sendMode === 'scheduled' ? 'مجدولة' : 'يدوي',
    audience: String(payload.audienceLabel || audience || 'مستهدفات مخصصة'),
    channel,
    senderName: actor?.name || actor?.username || 'مستخدم النظام',
    recipients: isTeacherAudience ? targetedTeachers.length : targetedStudents.length,
    successCount: 0,
    failedCount: 0,
    status: sendMode === 'scheduled' ? 'مجدولة' : 'قيد التنفيذ',
    body: String(payload.message || ''),
    deliveries: [],
  };
  school.messaging = school.messaging || {};
  school.messaging.logs = Array.isArray(school.messaging.logs) ? school.messaging.logs : [];
  if (sendMode === 'scheduled') {
    log.status = 'مجدولة';
    school.messaging.logs = [log, ...school.messaging.logs].slice(0, 200);
    return { ok: true, state: hydrateSharedState(next), log, message: 'تم حفظ الرسالة كعملية مجدولة.' };
  }
  if (isTeacherAudience) {
    next.notifications = Array.isArray(next.notifications) ? next.notifications : [];
    for (const teacher of targetedTeachers) {
      const recipient = String(teacher.mobile || '').trim();
      const rendered = applyMessageVariablesServer(payload.message, { schoolName: school.name, teacherName: teacher.name });
      if (channel === 'internal') {
        // إضافة إشعار داخلي في state.notifications ليراه المعلم في تطبيقه
        const notifTime = new Date().toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' });
        next.notifications = [{
          id: Date.now() + Math.random(),
          title: String(payload.subject || 'رسالة من الإدارة'),
          body: rendered,
          time: notifTime,
          createdAt: new Date().toISOString(),
          recipientId: teacher.id,
          recipientUsername: teacher.username || '',
          schoolId: school.id,
          channel: 'internal',
          sourceType: 'system',
        }, ...next.notifications].slice(0, 300);
        log.successCount += 1;
        log.deliveries.push({ teacherId: teacher.id, teacherName: teacher.name, status: 'نجاح', recipient: `internal:${teacher.id}`, recipientType: 'teacher', channel: 'internal', providerMessageId: `internal-${Date.now()}` });
        continue;
      }
      if (!recipient) {
        log.failedCount += 1;
        log.deliveries.push({ teacherId: teacher.id, teacherName: teacher.name, status: 'فشل', reason: 'لا يوجد رقم جوال صالح للمعلم.' });
        continue;
      }
      try {
        const dispatched = await dispatchChannelMessage(channel, settings.integration, recipient, rendered);
        log.successCount += 1;
        log.deliveries.push({ teacherId: teacher.id, teacherName: teacher.name, status: 'نجاح', recipient, recipientType: 'teacher', channel, providerMessageId: dispatched.providerMessageId || '' });
      } catch (error) {
        log.failedCount += 1;
        log.deliveries.push({ teacherId: teacher.id, teacherName: teacher.name, status: 'فشل', recipient, recipientType: 'teacher', channel, reason: error?.message || 'تعذر الإرسال.' });
      }
    }
  } else {
    for (const student of targetedStudents) {
      const recipients = await getStudentNotificationRecipients(student, channel, { eventType: audience === 'allStudents' ? 'announcement' : 'manual', integrations: settings.integration || {} });
      const rendered = applyMessageVariablesServer(payload.message, {
        studentName: student.name || student.fullName,
        grade: student.grade,
        className: student.className,
        companyName: student.companyName,
        schoolName: school.name,
        lateTime: payload.lateTime || '06:52',
        points: student.points || 0,
      });
      if (!recipients.length) {
        log.failedCount += 1;
        log.deliveries.push({ studentId: student.id, studentName: student.name || student.fullName, status: 'فشل', reason: 'لا يوجد رقم مستفيد صالح.' });
        continue;
      }
      for (const recipientRow of recipients) {
        try {
          const effectiveChannel = recipientRow.channel || channel;
          const dispatched = await dispatchChannelMessage(effectiveChannel, settings.integration, recipientRow.recipient, rendered);
          log.successCount += 1;
          log.deliveries.push({ studentId: student.id, studentName: student.name || student.fullName, status: 'نجاح', recipient: recipientRow.recipient, recipientType: recipientRow.recipientType, channel: effectiveChannel, providerMessageId: dispatched.providerMessageId || '' });
        } catch (error) {
          log.failedCount += 1;
          log.deliveries.push({ studentId: student.id, studentName: student.name || student.fullName, status: 'فشل', recipient: recipientRow.recipient, recipientType: recipientRow.recipientType, channel: effectiveChannel, reason: error?.message || 'تعذر الإرسال.' });
        }
      }
    }
  }
  log.recipients = log.deliveries.length;
  log.status = log.failedCount && log.successCount ? 'جزئي' : log.failedCount ? 'فشل' : 'نجاح';
  school.messaging.logs = [log, ...school.messaging.logs].slice(0, 200);
  if (!isTeacherAudience) {
    await recordParentDeliveries(next, log.deliveries, {
      title: log.subject || 'رسالة تشغيلية',
      body: log.body || '',
      schoolId: school.id,
      schoolName: school.name || '',
      eventType: audience === 'allStudents' ? 'announcement' : 'manual',
      channel,
      sourceType: sendMode === 'scheduled' ? 'scheduled' : 'manual',
      createdAt: log.createdAt,
    });
  }
  return { ok: true, state: hydrateSharedState(next), log, message: `تمت معالجة ${isTeacherAudience ? targetedTeachers.length : targetedStudents.length} رسالة.` };
}

async function testSchoolMessagingIntegration(state, schoolId, channel, settingsOverride = null) {
  const next = structuredClone(state);
  const school = next.schools.find((item) => Number(item.id) === Number(schoolId));
  if (!school) return { ok: false, message: 'المدرسة غير موجودة.' };
  if (settingsOverride && typeof settingsOverride === 'object') {
    school.messaging = school.messaging || {};
    school.messaging.settings = { ...(school.messaging.settings || {}), ...settingsOverride, channels: { ...(school.messaging.settings?.channels || {}), ...(settingsOverride.channels || {}) }, operations: { ...(school.messaging.settings?.operations || {}), ...(settingsOverride.operations || {}) }, automation: { ...(school.messaging.settings?.automation || {}), ...(settingsOverride.automation || {}) }, privacy: { ...(school.messaging.settings?.privacy || {}), ...(settingsOverride.privacy || {}) }, integration: { whatsapp: { ...(school.messaging.settings?.integration?.whatsapp || {}), ...(settingsOverride.integration?.whatsapp || {}) }, sms: { ...(school.messaging.settings?.integration?.sms || {}), ...(settingsOverride.integration?.sms || {}) } } };
  }
  const settings = hydrateMessagingSettings(school);
  const now = nowIso();
  if (channel === 'whatsapp') {
    const cfg = settings.integration.whatsapp || {};
    if (!cfg.phoneNumberId || !cfg.accessToken || !cfg.testRecipient) return { ok: false, message: 'أكمل Phone Number ID وAccess Token ورقم الاختبار أولاً.' };
    try {
      const sent = await sendWhatsappCloudMessage(cfg, cfg.testRecipient, 'رسالة اختبار من منصة الشركة المثالية. تم التحقق من الربط بنجاح.');
      school.messaging.settings.integration.whatsapp.status = 'مرتبط';
      school.messaging.settings.integration.whatsapp.lastCheckedAt = now;
      return { ok: true, state: hydrateSharedState(next), message: 'تم إرسال رسالة اختبار واتساب بنجاح.', providerMessageId: sent.providerMessageId || '' };
    } catch (error) {
      school.messaging.settings.integration.whatsapp.status = 'فشل الاختبار';
      school.messaging.settings.integration.whatsapp.lastCheckedAt = now;
      return { ok: false, state: hydrateSharedState(next), message: error?.message || 'فشل اختبار واتساب.' };
    }
  }
  if (channel === 'sms') {
    const cfg = settings.integration.sms || {};
    if (!cfg.apiUrl || !cfg.senderId || !cfg.testRecipient || !(cfg.apiKey || (cfg.username && cfg.password))) return { ok: false, message: 'أكمل بيانات مزود SMS ورقم الاختبار أولاً.' };
    try {
      const sent = await sendSmsMessage(cfg, cfg.testRecipient, 'رسالة اختبار من منصة الشركة المثالية. تم التحقق من الربط بنجاح.');
      school.messaging.settings.integration.sms.status = 'مرتبط';
      school.messaging.settings.integration.sms.lastCheckedAt = now;
      return { ok: true, state: hydrateSharedState(next), message: 'تم إرسال رسالة اختبار SMS بنجاح.', providerMessageId: sent.providerMessageId || '' };
    } catch (error) {
      school.messaging.settings.integration.sms.status = 'فشل الاختبار';
      school.messaging.settings.integration.sms.lastCheckedAt = now;
      return { ok: false, state: hydrateSharedState(next), message: error?.message || 'فشل اختبار SMS.' };
    }
  }
  school.messaging = school.messaging || {};
  school.messaging.logs = Array.isArray(school.messaging.logs) ? school.messaging.logs : [];
  const log = { id: Date.now(), createdAt: now, subject: 'اختبار إشعار داخلي', type: 'يدوي', audience: 'النظام', channel: 'internal', senderName: 'النظام', recipients: 1, successCount: 1, failedCount: 0, status: 'نجاح', body: 'تم تنفيذ اختبار الإشعار الداخلي بنجاح.' };
  school.messaging.logs = [log, ...school.messaging.logs].slice(0, 200);
  return { ok: true, state: hydrateSharedState(next), message: 'تم تنفيذ اختبار الإشعار الداخلي بنجاح.', log };
}

async function attachParentPortalSummaryToLive(state, schoolId, live) {
  try {
    const parentPortalSummary = await buildParentPortalExecutiveSummary(state, schoolId, null);
    return { ...(live || {}), parentPortalSummary };
  } catch {
    return live;
  }
}

function summarizeSchoolLivePayload(state, schoolId, screenConfig = null) {
  const school = state.schools.find((item) => Number(item.id) === Number(schoolId));
  if (!school) return null;
  const today = getTodayIso();
  const unifiedStudents = getUnifiedSchoolStudentsForServer(school, { includeArchived: false, preferStructure: true });
  const companyRows = getUnifiedCompanyRowsForServer(school, { preferStructure: true });
  const scansToday = state.scanLog.filter((item) => Number(item.schoolId) === Number(schoolId) && item.isoDate === today && !String(item.result || '').includes('فشل') && !String(item.result || '').includes('مسبق'));
  const actionsToday = state.actionLog.filter((item) => Number(item.schoolId) === Number(schoolId) && item.isoDate === today);
  // إحصائيات خاصة بكل بوابة
  const gateStats = {};
  (school.smartLinks?.gates || []).forEach((gate) => {
    const gateScans = scansToday.filter((item) => item.gateId === gate.id);
    gateStats[gate.id] = {
      id: gate.id,
      name: gate.name,
      presentToday: new Set(gateScans.map((item) => item.studentId).filter(Boolean)).size,
      scansCount: gateScans.length,
    };
  });
  const presentToday = new Set(scansToday.map((item) => item.studentId).filter(Boolean)).size;
  const totalStudents = unifiedStudents.length;
  const attendanceRate = totalStudents ? Math.round((presentToday / totalStudents) * 100) : 0;
  const topStudents = [...unifiedStudents].sort((a, b) => Number(b.points || 0) - Number(a.points || 0)).slice(0, 5).map((student, index) => ({
    id: student.id,
    name: student.name,
    points: Number(student.points || 0),
    rank: index + 1,
    companyName: student.companyName || student.classroomName || '—',
  }));
  const topCompanies = [...companyRows].sort((a, b) => Number(b.points || 0) - Number(a.points || 0)).slice(0, 5).map((company, index) => ({
    id: company.id,
    name: company.name,
    className: company.className,
    points: Number(company.points || 0),
    rank: index + 1,
  }));
  const recentAttendance = scansToday.slice(0, 8);
  const attendanceMap = new Map();
  state.scanLog.filter((item) => Number(item.schoolId) === Number(schoolId)).forEach((item) => {
    const existing = attendanceMap.get(item.isoDate) || { day: item.date, attendance: 0, early: 0 };
    if (!String(item.result || '').includes('فشل') && !String(item.result || '').includes('مسبق')) {
      existing.attendance += 1;
      if (String(item.result || '').includes('مبكر')) existing.early += 1;
    }
    attendanceMap.set(item.isoDate, existing);
  });
  const attendanceTrend = [...attendanceMap.entries()].sort((a, b) => a[0].localeCompare(b[0])).slice(-7).map(([, value]) => value);
  const teacherActivity = Object.values(actionsToday.reduce((acc, item) => {
    const key = `${item.actorName || 'غير محدد'}|${item.actorRole || 'teacher'}`;
    const row = acc[key] || { actorName: item.actorName || 'غير محدد', actorRole: item.actorRole || 'teacher', count: 0, rewardCount: 0, violationCount: 0, programCount: 0 };
    row.count += 1;
    if (item.actionType === 'reward') row.rewardCount += 1;
    if (item.actionType === 'violation') row.violationCount += 1;
    if (item.actionType === 'program') row.programCount += 1;
    acc[key] = row;
    return acc;
  }, {})).sort((a, b) => b.count - a.count).slice(0, 5);

  let structureSpotlight = null;
  const linkedClassroomId = String(screenConfig?.linkedClassroomId || '');
  if (screenConfig?.sourceMode === 'classroom' && linkedClassroomId) {
    const classrooms = Array.isArray(school.structure?.classrooms) ? school.structure.classrooms : [];
    const classroom = classrooms.find((item) => String(item.id) === linkedClassroomId);
    if (classroom) {
      const students = Array.isArray(classroom.students) ? classroom.students : [];
      const activeStudents = students.filter((student) => student.status !== 'archived');
      const archivedStudents = students.filter((student) => student.status === 'archived');
      const transfers = (Array.isArray(school.structure?.transferLog) ? school.structure.transferLog : [])
        .filter((entry) => String(entry.fromClassroomId) === linkedClassroomId || String(entry.toClassroomId) === linkedClassroomId)
        .slice(-8)
        .reverse();
      const leaderName = classroom.leaderUserId ? (state.users.find((user) => Number(user.id) === Number(classroom.leaderUserId))?.name || '—') : '—';
      const importedCount = students.filter((student) => String(student.source || '').includes('excel') || String(student.source || '').includes('noor')).length;
      structureSpotlight = {
        id: String(classroom.id),
        headline: classroom.name || 'الفصل',
        subheadline: `${classroom.gradeLabel || classroom.stageLabel || ''}${classroom.companyName ? ` • ${classroom.companyName}` : ''}`.trim(),
        classroomName: classroom.name || '—',
        companyName: classroom.companyName || '—',
        leaderName,
        summary: {
          totalStudents: students.length,
          presentToday: activeStudents.length,
          attendanceRate: students.length ? Math.round((activeStudents.length / students.length) * 100) : 0,
          earlyToday: importedCount,
          rewardsToday: transfers.length,
          violationsToday: archivedStudents.length,
          programsToday: leaderName && leaderName !== '—' ? 1 : 0,
        },
        attendanceTrend: [
          { day: 'نشط', attendance: activeStudents.length, early: importedCount },
          { day: 'مؤرشف', attendance: archivedStudents.length, early: 0 },
          { day: 'منقول', attendance: transfers.length, early: 0 },
        ],
        students: activeStudents.slice(0, 8).map((student, index) => ({
          id: student.id,
          name: student.fullName || student.name || `طالب ${index + 1}`,
          points: Number(student.points || Math.max(1, 100 - index * 5)),
          rank: index + 1,
          companyName: classroom.name || 'الفصل',
        })),
        topCompanies: [
          { id: `${classroom.id}-1`, name: classroom.companyName || classroom.name || 'الفصل', className: 'اسم الشركة / الفصل', points: activeStudents.length, rank: 1 },
          { id: `${classroom.id}-2`, name: leaderName || 'غير محدد', className: 'رائد الفصل', points: Math.max(activeStudents.length - archivedStudents.length, 0), rank: 2 },
          { id: `${classroom.id}-3`, name: `النشطون ${activeStudents.length}`, className: 'حالة الطلاب', points: activeStudents.length, rank: 3 },
          { id: `${classroom.id}-4`, name: `أولياء الأمور ${students.filter((student) => String(student.guardianMobile || '').trim()).length}`, className: 'جهوزية التواصل', points: students.filter((student) => String(student.guardianMobile || '').trim()).length, rank: 4 },
        ],
        recentActivity: transfers.length ? transfers.map((entry, index) => ({
          id: entry.id || `${classroom.id}-t-${index}`,
          student: entry.studentName || 'طالب',
          time: String(entry.createdAt || '').slice(11, 16) || '—',
          result: `نقل ${String(entry.fromClassroomId) === linkedClassroomId ? 'من الفصل' : 'إلى الفصل'}`,
        })) : activeStudents.slice(0, 8).map((student, index) => ({
          id: `${classroom.id}-s-${student.id || index}`,
          student: student.fullName || student.name || `طالب ${index + 1}`,
          time: student.importedAt ? String(student.importedAt).slice(11, 16) : '—',
          result: student.source === 'manual' ? 'إضافة يدوية' : 'استيراد ملف',
        })),
      };
    }
  }

  // إحصائيات أصناف المكافآت والخصومات
  const rewardStatsMap = {};
  const violationStatsMap = {};
  state.actionLog.filter((item) => Number(item.schoolId) === Number(schoolId)).forEach((item) => {
    const title = item.actionTitle || item.definitionTitle || 'غير محدد';
    if (item.actionType === 'reward') {
      rewardStatsMap[title] = (rewardStatsMap[title] || 0) + 1;
    } else if (item.actionType === 'violation') {
      violationStatsMap[title] = (violationStatsMap[title] || 0) + 1;
    }
  });
  const rewardStats = Object.entries(rewardStatsMap).map(([title, count]) => ({ title, count })).sort((a, b) => b.count - a.count).slice(0, 6);
  const violationStats = Object.entries(violationStatsMap).map(([title, count]) => ({ title, count })).sort((a, b) => b.count - a.count).slice(0, 6);

  return {
    school: { id: school.id, name: school.name, city: school.city, code: school.code, manager: school.manager },
    summary: {
      totalStudents,
      presentToday,
      attendanceRate,
      earlyToday: scansToday.filter((item) => String(item.result).includes('مبكر')).length,
      ontimeToday: scansToday.filter((item) => String(item.result).includes('في الوقت')).length,
      lateToday: scansToday.filter((item) => String(item.result).includes('تأخر')).length,
      rewardsToday: actionsToday.filter((item) => item.actionType === 'reward').length,
      violationsToday: actionsToday.filter((item) => item.actionType === 'violation').length,
      programsToday: actionsToday.filter((item) => item.actionType === 'program').length,
    },
    topStudents,
    topCompanies,
    recentAttendance,
    attendanceTrend,
    teacherActivity,
    rewardStats,
    violationStats,
    structureSpotlight,
    gateStats,
    lessonAttendanceSummary: buildLessonAttendanceSummaryForServer(school),
    notifications: (state.notifications || []).filter((item) => Number(item.schoolId) === Number(schoolId)),
  };
}
function buildLessonAttendanceSummaryForServer(school) {
  const sessions = Array.isArray(school?.lessonAttendanceSessions) ? school.lessonAttendanceSessions : [];
  if (!sessions.length) return null;
  const sorted = [...sessions].sort((a, b) => String(b.createdAt || '').localeCompare(String(a.createdAt || '')));
  const session = sorted.find((s) => String(s.status || 'open') !== 'closed') || sorted[0];
  if (!session) return null;
  const submissions = Array.isArray(session.submissions) ? session.submissions : [];
  const invites = Array.isArray(session.teacherInvites) ? session.teacherInvites : [];
  const targetIds = Array.isArray(session.targetTeacherIds) ? session.targetTeacherIds : [];
  const expectedTeachers = targetIds.length || invites.length || 0;
  const sentTeachers = invites.filter((item) => item.sentAt).length;
  const openedTeachers = submissions.filter((item) => item.opened).length;
  const submittedTeachers = new Set(submissions.map((item) => String(item.teacherId || ''))).size;
  const totalPresent = submissions.reduce((sum, item) => sum + Number(item.presentCount || 0), 0);
  const totalAbsent = submissions.reduce((sum, item) => sum + Number(item.absentCount || 0), 0);
  const classRows = submissions.map((item) => ({
    name: item.className || '—',
    present: Number(item.presentCount || 0),
    absent: Number(item.absentCount || 0),
  }));
  const slotLabel = session.slotLabel || 'حصة';
  const dateIso = session.dateIso || '';
  const label = `${slotLabel}${dateIso ? ' — ' + dateIso.slice(0, 10) : ''}`;
  return {
    id: session.id,
    label,
    status: session.status || 'open',
    expectedTeachers,
    sentTeachers,
    openedTeachers,
    submittedTeachers,
    totalPresent,
    totalAbsent,
    classRows,
  };
}
function findGateConfigByToken(state, token) {
  for (const school of state.schools) {
    const gate = school.smartLinks?.gates?.find((item) => item.token === token);
    if (gate) return { school, gate };
  }
  return null;
}

function findScreenConfigByToken(state, token) {
  for (const school of state.schools) {
    const screen = school.smartLinks?.screens?.find((item) => item.token === token);
    if (screen) return { school, screen };
  }
  return null;
}

function getSchoolAttendanceBinding(school) {
  const hasStructure = Array.isArray(school?.structure?.classrooms) && school.structure.classrooms.length > 0;
  return {
    sourceMode: hasStructure ? 'structure' : (school?.structure?.attendanceBinding?.sourceMode === 'structure' ? 'structure' : 'school'),
    linkedClassroomId: school?.structure?.attendanceBinding?.linkedClassroomId ? String(school.structure.attendanceBinding.linkedClassroomId) : '',
  };
}

function getUnifiedSchoolStudentsForServer(school, { includeArchived = false, preferStructure = true } = {}) {
  if (!school) return [];
  const classrooms = Array.isArray(school?.structure?.classrooms) ? school.structure.classrooms : [];
  const structureStudents = classrooms.flatMap((classroom) => (Array.isArray(classroom.students) ? classroom.students : [])
    .filter((student) => includeArchived || String(student?.status || 'active') !== 'archived')
    .map((student) => ({
      id: `structure-${classroom.id}-${student.id}`,
      rawId: student.id,
      source: 'structure',
      name: student.fullName || student.name || 'طالب',
      fullName: student.fullName || student.name || 'طالب',
      studentNumber: String(student.studentNumber || student.id || '').trim(),
      nationalId: String(student.identityNumber || student.nationalId || '').trim(),
      guardianMobile: String(student.guardianMobile || '').trim(),
      barcode: buildStructureAttendanceBarcode(school, classroom, student),
      classroomId: String(classroom.id),
      classroomName: classroom.name || classroom.gradeLabel || 'فصل',
      companyName: classroom.companyName || classroom.name || '—',
      companyId: null,
      points: Number(student.points || 0),
      attendanceRate: Number(student.attendanceRate || 0),
      faceReady: Boolean(student.faceReady || student.facePhoto),
      faceSignature: Array.isArray(student.faceSignature) ? student.faceSignature : [],
      status: student.status === 'archived' ? 'مؤرشف' : (student.attendanceStatus || 'غير مسجل'),
    })));
  const baseStudents = Array.isArray(school.students) ? school.students.map((student) => ({ ...student, source: student.source || 'school', rawId: student.id })) : [];
  if (preferStructure && structureStudents.length) return structureStudents;
  return [...structureStudents, ...baseStudents];
}

function getUnifiedCompanyRowsForServer(school, { preferStructure = true } = {}) {
  if (!school) return [];
  const classrooms = Array.isArray(school?.structure?.classrooms) ? school.structure.classrooms : [];
  if (preferStructure && classrooms.length) {
    return classrooms.map((classroom, index) => {
      const students = Array.isArray(classroom.students) ? classroom.students : [];
      const activeStudents = students.filter((student) => String(student?.status || 'active') !== 'archived');
      return {
        id: `structure-company-${classroom.id}`,
        rawId: classroom.id,
        source: 'structure',
        name: classroom.companyName || classroom.name || `فصل ${index + 1}`,
        className: classroom.name || classroom.gradeLabel || 'فصل',
        points: activeStudents.reduce((sum, student) => sum + Number(student.points || 0), 0),
        studentsCount: activeStudents.length,
      };
    });
  }
  return Array.isArray(school.companies) ? school.companies.map((company) => ({ ...company, source: 'school' })) : [];
}

function buildStructureAttendanceBarcode(school, classroom, student) {
  const schoolCode = String(school?.code || 'SCH').replace(/[^A-Za-z0-9]/g, '').toUpperCase().slice(0, 6) || 'SCH';
  const classroomCode = String(classroom?.name || classroom?.gradeLabel || 'CLS').replace(/\s+/g, '').slice(0, 6).toUpperCase();
  const studentCode = String(student?.identityNumber || student?.id || Date.now()).replace(/[^A-Za-z0-9]/g, '').slice(-8);
  return String(`SS-${schoolCode}-${classroomCode}-${studentCode}`).toUpperCase();
}

function getAttendanceStudentsSourceForSchool(school) {
  const binding = getSchoolAttendanceBinding(school);
  if (binding.sourceMode !== 'structure') {
    return {
      sourceMode: 'school',
      linkedClassroomId: '',
      classrooms: [],
      students: school?.students || [],
      label: 'المدرسة كاملة',
    };
  }
  const classrooms = Array.isArray(school?.structure?.classrooms) ? school.structure.classrooms : [];
  const filteredClassrooms = binding.linkedClassroomId
    ? classrooms.filter((item) => String(item.id) === String(binding.linkedClassroomId))
    : classrooms;
  const students = filteredClassrooms.flatMap((classroom) => (Array.isArray(classroom.students) ? classroom.students : [])
    .filter((student) => String(student?.status || 'active') !== 'archived')
    .map((student) => ({
      id: `structure-${classroom.id}-${student.id}`,
      rawId: student.id,
      name: student.fullName || 'طالب',
      fullName: student.fullName || 'طالب',
      nationalId: String(student.identityNumber || '').trim(),
      guardianMobile: String(student.guardianMobile || '').trim(),
      barcode: buildStructureAttendanceBarcode(school, classroom, student),
      grade: classroom.gradeLabel || classroom.stageLabel || classroom.stage || '',
      className: classroom.name || classroom.gradeLabel || 'فصل',
      classroomId: String(classroom.id),
      classroomName: classroom.name || classroom.gradeLabel || 'فصل',
      companyName: classroom.companyName || '—',
      companyId: null,
      status: student.status === 'archived' ? 'مؤرشف' : (student.attendanceStatus || 'غير مسجل'),
      attendanceRate: Number(student.attendanceRate || 0),
      points: Number(student.points || 0),
      faceReady: Boolean(student.faceReady || student.facePhoto),
      faceSignature: student.faceSignature || [],
      source: 'structure',
    })));
  return {
    sourceMode: 'structure',
    linkedClassroomId: binding.linkedClassroomId,
    classrooms: filteredClassrooms,
    students,
    label: binding.linkedClassroomId ? (filteredClassrooms[0]?.name || 'فصل من الهيكل المدرسي') : 'جميع فصول الهيكل المدرسي',
  };
}

function applyAttendanceScanToState(state, schoolId, barcodeValue, method = 'QR', gateId = null, options = {}) {
  const next = structuredClone(state);
  const school = next.schools.find((item) => Number(item.id) === Number(schoolId));
  if (!school) return { ok: false, message: 'المدرسة غير موجودة.' };

  const rawValue = String(barcodeValue || '').trim();
  const normalizedValue = rawValue.toUpperCase();
  const attendanceSource = getAttendanceStudentsSourceForSchool(school);
  let student = null;
  let classroomRef = null;
  let company = null;

  if (attendanceSource.sourceMode === 'structure') {
    student = attendanceSource.students.find((item) =>
      String(item.barcode || '').toUpperCase() === normalizedValue
      || String(item.nationalId || '').trim() === rawValue
      || String(item.guardianMobile || '').replace(/\s+/g, '') === rawValue.replace(/\s+/g, '')
      || String(item.name || '').trim() === rawValue
    );
    if (!student) return { ok: false, message: 'لم يتم العثور على الطالب المرتبط بهذه البيانات داخل الهيكل المدرسي.' };
    classroomRef = (school.structure?.classrooms || []).find((item) => String(item.id) === String(student.classroomId));
    if (!classroomRef) return { ok: false, message: 'الفصل المرتبط بهذا الطالب غير موجود داخل الهيكل المدرسي.' };
  } else {
    student = school.students.find((item) => String(item.barcode || '').toUpperCase() === normalizedValue);
    if (!student) return { ok: false, message: 'لم يتم العثور على الطالب المرتبط بهذا الرمز.' };
    company = school.companies.find((item) => item.id === student.companyId);
  }

  const parsedCapturedAt = options?.capturedAt ? new Date(options.capturedAt) : null;
  const effectiveNow = parsedCapturedAt && !Number.isNaN(parsedCapturedAt.getTime()) ? parsedCapturedAt : new Date();
  const today = `${effectiveNow.getFullYear()}-${String(effectiveNow.getMonth() + 1).padStart(2, '0')}-${String(effectiveNow.getDate()).padStart(2, '0')}`;
  const clientOperationId = String(options?.clientOperationId || '').trim();

  if (clientOperationId) {
    const existingByOperation = next.scanLog.find((entry) => String(entry.clientOperationId || '') === clientOperationId);
    if (existingByOperation) {
      return {
        ok: true,
        duplicate: true,
        state: hydrateSharedState(next),
        logEntry: existingByOperation,
        student: { id: student.id, name: student.name || student.fullName, barcode: student.barcode || rawValue },
        message: 'تمت مزامنة هذه العملية سابقًا.',
      };
    }
  }

  if (next.settings.devices?.duplicateScanBlocked) {
    const already = next.scanLog.some((entry) => Number(entry.schoolId) === Number(schoolId) && String(entry.studentId) === String(student.id) && entry.isoDate === today);
    if (already) return { ok: false, message: 'تم تسجيل حضور هذا الطالب مسبقًا اليوم.' };
  }

  const currentMinutes = effectiveNow.getHours() * 60 + effectiveNow.getMinutes();
  const earlyCutoff = parseTimeToMinutes(next.settings.policy?.earlyEnd || '06:30');
  const onTimeCutoff = parseTimeToMinutes(next.settings.policy?.onTimeEnd || '06:45');
  let result = 'تم تسجيل تأخر';
  let deltaPoints = Number(next.settings.points?.late || -2);
  if (currentMinutes <= earlyCutoff) {
    result = 'تم تسجيل حضور مبكر';
    deltaPoints = Number(next.settings.points?.early || 5);
  } else if (currentMinutes <= onTimeCutoff) {
    result = 'تم تسجيل حضور في الوقت';
    deltaPoints = Number(next.settings.points?.onTime || 3);
  }

  if (attendanceSource.sourceMode === 'structure') {
    const targetStudent = classroomRef.students.find((item) => String(item.id) === String(student.rawId));
    if (!targetStudent) return { ok: false, message: 'تعذر تحديث سجل الطالب داخل الهيكل المدرسي.' };
    targetStudent.attendanceStatus = statusFromResult(result);
    targetStudent.attendanceRate = clamp(Number(targetStudent.attendanceRate || 100) + (result.includes('تأخر') ? -1 : 0.4), 0, 100);
    targetStudent.points = Number(targetStudent.points || 0) + deltaPoints;
    targetStudent.lastAttendanceAt = effectiveNow.toISOString();
  } else {
    student.status = statusFromResult(result);
    student.attendanceRate = clamp(Number(student.attendanceRate || 100) + (result.includes('تأخر') ? -1 : 0.4), 0, 100);
    student.points = Number(student.points || 0) + deltaPoints;
    student.lastAttendanceAt = effectiveNow.toISOString();
    if (company) {
      company.points = Number(company.points || 0) + deltaPoints;
      if (result.includes('مبكر')) company.early = Number(company.early || 0) + 1;
    }
  }

  const logEntry = {
    id: Date.now(),
    schoolId: school.id,
    studentId: student.id,
    companyId: attendanceSource.sourceMode === 'structure' ? null : student.companyId,
    classroomId: attendanceSource.sourceMode === 'structure' ? String(student.classroomId) : null,
    gateId: gateId || null,
    student: student.name || student.fullName,
    barcode: student.barcode || rawValue,
    date: toArabicDate(effectiveNow),
    isoDate: today,
    time: `${String(effectiveNow.getHours()).padStart(2, '0')}:${String(effectiveNow.getMinutes()).padStart(2, '0')}`,
    method: attendanceSource.sourceMode === 'structure' ? 'هيكل مدرسي' : method,
    result,
    deltaPoints,
    capturedAt: effectiveNow.toISOString(),
    capturedAtLocal: options?.capturedAtLocal || '',
    offlineQueued: Boolean(options?.offlineQueued),
    syncSource: options?.offlineQueued ? 'offline-queue' : 'live',
    clientOperationId: clientOperationId || '',
    syncedAt: options?.offlineQueued ? new Date().toISOString() : '',
  };
  next.scanLog = [logEntry, ...next.scanLog].slice(0, 800);
  return { ok: true, state: hydrateSharedState(next), logEntry, student: { id: student.id, name: student.name || student.fullName, barcode: student.barcode || rawValue }, message: result };
}


function appendGateSyncEventToState(state, schoolId, gateId, event = {}) {
  const next = structuredClone(state);
  const school = next.schools.find((item) => Number(item.id) === Number(schoolId));
  if (!school) return { ok: false, message: 'المدرسة غير موجودة.' };
  const gate = (school.smartLinks?.gates || []).find((item) => String(item.id) === String(gateId) || String(item.token || '') === String(event.gateToken || ''));
  const entry = {
    id: event.id || `gate-sync-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    schoolId: Number(schoolId),
    gateId: gate?.id || gateId || null,
    gateName: String(event.gateName || gate?.name || 'بوابة المدرسة').trim() || 'بوابة المدرسة',
    status: String(event.status || 'pending').trim().toLowerCase(),
    studentName: String(event.studentName || '').trim(),
    barcode: String(event.barcode || '').trim(),
    method: String(event.method || 'QR').trim() || 'QR',
    capturedAt: String(event.capturedAt || '').trim(),
    capturedAtLocal: String(event.capturedAtLocal || '').trim(),
    syncedAt: String(event.syncedAt || '').trim(),
    operationId: String(event.operationId || event.clientOperationId || '').trim(),
    message: String(event.message || '').trim(),
    createdAt: nowIso(),
    source: 'gate-device',
  };
  next.gateSyncEvents = [entry, ...(Array.isArray(next.gateSyncEvents) ? next.gateSyncEvents : [])].slice(0, 5000);
  return { ok: true, state: hydrateSharedState(next), event: entry };
}

function importStudentsIntoSchool(state, schoolId, rows = []) {
  const next = structuredClone(state);
  const school = next.schools.find((item) => Number(item.id) === Number(schoolId));
  if (!school) return { ok: false, message: 'المدرسة غير موجودة.' };
  const companies = [...school.companies];
  const students = [...school.students];
  const companyMap = new Map(companies.map((company) => [`${String(company.name || '').trim()}|${String(company.className || '').trim()}|${String(company.grade || '').trim()}`.toLowerCase(), company.id]));
  const companyByClass = new Map(companies.map((company) => [`${String(company.className || '').trim()}|${String(company.grade || '').trim()}`.toLowerCase(), company.id]));
  const existingNumbers = new Set(students.map((student) => String(student.studentNumber || '').trim()).filter(Boolean));
  const existingNationalIds = new Set(students.map((student) => String(student.nationalId || '').trim()).filter(Boolean));
  const existingNames = new Set(students.map((student) => String(student.name || '').trim()));
  let nextStudentId = Math.max(0, ...students.map((student) => Number(student.id) || 0)) + 1;
  let nextCompanyId = Math.max(0, ...companies.map((company) => Number(company.id) || 0)) + 1;
  const summary = { added: 0, skipped: 0, companiesCreated: 0 };
  const ensureCompany = (companyName, className, grade) => {
    const normalizedGrade = String(grade || 'غير محدد').trim();
    const normalizedClass = String(className || grade || 'غير مصنف').trim();
    const normalizedCompany = String(companyName || normalizedClass || `شركة ${normalizedGrade}`).trim();
    const pairKey = `${normalizedCompany}|${normalizedClass}|${normalizedGrade}`.toLowerCase();
    const classKey = `${normalizedClass}|${normalizedGrade}`.toLowerCase();
    if (companyMap.has(pairKey)) return companyMap.get(pairKey);
    if (companyByClass.has(classKey)) return companyByClass.get(classKey);
    const id = nextCompanyId++;
    companies.push({ id, name: normalizedCompany, className: normalizedClass, grade: normalizedGrade, leader: '—', points: 0, early: 0, behavior: 100, initiatives: 0 });
    companyMap.set(pairKey, id);
    companyByClass.set(classKey, id);
    summary.companiesCreated += 1;
    return id;
  };
  rows.forEach((row) => {
    const name = String(row.name || '').trim();
    if (!name) {
      summary.skipped += 1;
      return;
    }
    const nationalId = String(row.nationalId || '').trim();
    const studentNumber = String(row.studentNumber || '').trim() || `${school.code.split('-')[0]}-${String(nextStudentId).padStart(4, '0')}`;
    if ((nationalId && existingNationalIds.has(nationalId)) || (studentNumber && existingNumbers.has(studentNumber)) || existingNames.has(name)) {
      summary.skipped += 1;
      return;
    }
    const companyId = ensureCompany(row.companyName, row.className, row.grade);
    const id = nextStudentId++;
    students.push({
      id,
      name,
      nationalId: nationalId || `AUTO-${id}`,
      studentNumber,
      grade: String(row.grade || 'غير محدد').trim() || 'غير محدد',
      companyId,
      barcode: `ST-${String(id).padStart(4, '0')}-${school.code.split('-')[0]}`,
      faceReady: false,
      facePhoto: '',
      faceSignature: [],
      status: 'في الوقت',
      attendanceRate: 100,
      points: 0,
    });
    existingNumbers.add(studentNumber);
    if (nationalId) existingNationalIds.add(nationalId);
    existingNames.add(name);
    summary.added += 1;
  });
  school.companies = companies;
  school.students = students;
  return { ok: true, state: hydrateSharedState(next), ...summary };
}

function canManageSchoolContent(actor, schoolId) {
  if (!actor) return false;
  if (actor.role === 'superadmin') return true;
  return Number(actor.schoolId) === Number(schoolId) && ['principal', 'teacher', 'supervisor', 'gate'].includes(actor.role);
}

function canManageStudentActions(actor, schoolId) {
  if (!actor) return false;
  if (actor.role === 'superadmin') return true;
  return Number(actor.schoolId) === Number(schoolId) && ['principal', 'teacher', 'supervisor'].includes(actor.role);
}

function parseDataUrl(dataUrl = '') {
  const match = String(dataUrl || '').match(/^data:([^;]+);base64,(.+)$/);
  if (!match) return null;
  const mime = match[1] || 'application/octet-stream';
  const ext = mime.includes('png') ? 'png' : mime.includes('webp') ? 'webp' : mime.includes('gif') ? 'gif' : 'jpg';
  return { mime, ext, buffer: Buffer.from(match[2], 'base64') };
}

async function writeDataUrlToUploads(baseDir, segments, fileStem, dataUrl) {
  const parsed = parseDataUrl(dataUrl);
  if (!parsed) return '';
  const dirPath = path.join(baseDir, ...segments.map((item) => String(item)));
  await mkdir(dirPath, { recursive: true });
  const fileName = `${fileStem}.${parsed.ext}`;
  const filePath = path.join(dirPath, fileName);
  await writeFile(filePath, parsed.buffer);
  const relative = path.relative(UPLOADS_DIR, filePath).split(path.sep).join('/');
  return `/uploads/${relative}`;
}

function applyStudentActionToState(state, schoolId, payload, actor) {
  const next = structuredClone(state);
  const school = next.schools.find((item) => Number(item.id) === Number(schoolId));
  if (!school) return { ok: false, message: 'المدرسة غير موجودة.' };
  // دعم structure students: إذا كان studentId بصيغة structure-CLASSID-RAWID
  const rawStudentIdStr = String(payload.studentId || '');
  let student = null;
  let classroomRef = null;
  let isStructureStudent = false;
  let compositeStudentId = rawStudentIdStr;
  if (rawStudentIdStr.startsWith('structure-')) {
    const parts = rawStudentIdStr.split('-');
    // البنية: structure-{classroomId}-{studentRawId}
    // classroomId قد يحتوي على '-' (مثل "middle-m1-1") لذا نأخذ كل شيء بين structure- و آخر جزء
    const studentRawId = parts[parts.length - 1];
    const classroomId = parts.slice(1, -1).join('-');
    classroomRef = (school.structure?.classrooms || []).find((c) => String(c.id) === classroomId);
    if (classroomRef) {
      student = (classroomRef.students || []).find((s) => String(s.id) === studentRawId);
      if (student) { isStructureStudent = true; compositeStudentId = rawStudentIdStr; }
    }
    // إذا لم يُوجد classroom بالـ id الكامل، ابحث في كل classrooms
    if (!student) {
      for (const classroom of (school.structure?.classrooms || [])) {
        const found = (classroom.students || []).find((s) => String(s.id) === studentRawId);
        if (found) { student = found; classroomRef = classroom; isStructureStudent = true; compositeStudentId = rawStudentIdStr; break; }
      }
    }
  }
  if (!student) {
    student = school.students.find((item) => Number(item.id) === Number(payload.studentId));
    if (student) compositeStudentId = String(student.id);
  }
  if (!student) return { ok: false, message: 'الطالب غير موجود.' };
  const actionType = payload.actionType === 'violation' ? 'violation' : 'reward';
  const catalog = actionType === 'violation' ? next.settings.actions?.violations || [] : next.settings.actions?.rewards || [];
  const specialDefinition = payload.specialDefinition && payload.specialDefinition.scope === 'special' ? payload.specialDefinition : null;
  const definition = specialDefinition || catalog.find((item) => String(item.id) === String(payload.definitionId));
  if (!definition) return { ok: false, message: 'البند المحدد غير موجود.' };
  const deltaPoints = Number(definition.points || 0);
  // تحديث النقاط في الموضع الصحيح
  student.points = Number(student.points || 0) + deltaPoints;
  if (!isStructureStudent) {
    const company = school.companies.find((item) => item.id === student.companyId);
    if (company) {
      company.points = Number(company.points || 0) + deltaPoints;
      company.behavior = clamp(Number(company.behavior || 0) + (actionType === 'reward' ? 1 : -1), 0, 100);
    }
  }
  const now = new Date();
  const logEntry = {
    id: Date.now(),
    schoolId: school.id,
    studentId: compositeStudentId,
    classroomId: isStructureStudent ? String(classroomRef?.id || '') : null,
    companyId: isStructureStudent ? null : student.companyId,
    student: student.fullName || student.name,
    actorId: actor?.id || null,
    actorUsername: actor?.username || '',
    actorName: actor?.name || actor?.username || 'مستخدم النظام',
    actorRole: actor?.role || 'teacher',
    method: payload.method || 'يدوي',
    actionType,
    actionTitle: definition.title,
    definitionTitle: definition.title,
    specialDefinitionId: specialDefinition ? String(specialDefinition.id || payload.definitionId || '') : '',
    specialSubject: specialDefinition ? String(specialDefinition.subject || '') : '',
    specialTermId: specialDefinition ? `term-${String(next.settings?.academicYear || 'default').trim() || 'default'}` : '',
    note: String(payload.note || ''),
    evidence: [],
    date: toArabicDate(now),
    isoDate: getTodayIso(),
    time: `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`,
    createdAt: now.toISOString(),
    points: deltaPoints,
    deltaPoints,
  };
  next.actionLog = [logEntry, ...next.actionLog].slice(0, 1200);
  return { ok: true, state: hydrateSharedState(next), logEntry, student, message: `تم تنفيذ ${actionType === 'reward' ? 'المكافأة' : 'الخصم'} على ${student.fullName || student.name}.` };
}

async function applyProgramToState(state, schoolId, payload, actor) {
  const next = structuredClone(state);
  const school = next.schools.find((item) => Number(item.id) === Number(schoolId));
  if (!school) return { ok: false, message: 'المدرسة غير موجودة.' };
  const catalog = next.settings.actions?.programs || [];
  const definition = catalog.find((item) => String(item.id) === String(payload.definitionId));
  if (!definition) return { ok: false, message: 'نوع البرنامج غير موجود.' };
  const linkedStudent = payload.studentId ? school.students.find((item) => Number(item.id) === Number(payload.studentId)) : null;
  const resolvedCompanyId = linkedStudent?.companyId || (payload.companyId ? Number(payload.companyId) : null);
  const deltaPoints = Number(definition.points || 0);
  if (linkedStudent) linkedStudent.points = Number(linkedStudent.points || 0) + deltaPoints;
  const company = school.companies.find((item) => Number(item.id) === Number(resolvedCompanyId));
  if (company) {
    company.points = Number(company.points || 0) + deltaPoints;
    company.initiatives = Number(company.initiatives || 0) + 1;
  }
  const evidenceInput = Array.isArray(payload.evidence) ? payload.evidence : [];
  const evidence = [];
  for (let index = 0; index < evidenceInput.length; index += 1) {
    const item = evidenceInput[index];
    if (!item?.dataUrl) continue;
    const url = await writeDataUrlToUploads(EVIDENCE_UPLOADS_DIR, [String(school.id), String(Date.now())], `evidence-${index + 1}`, item.dataUrl);
    evidence.push({ id: `ev-${Date.now()}-${index + 1}`, name: item.name || `شاهد ${index + 1}`, url, type: item.type || 'image' });
  }
  const now = new Date();
  const targetTypeLabel = String(payload.targetType || 'عام');
  const targetLabel = String(payload.targetLabel || '');
  const targetCount = String(payload.targetCount || '');
  const noteLines = [
    `نوع البرنامج: ${definition.title}`,
    `المستهدفون: ${targetTypeLabel}`,
    targetLabel ? `التفصيل: ${targetLabel}` : '',
    targetCount ? `العدد: ${targetCount}` : '',
    payload.note ? `ملاحظات: ${payload.note}` : '',
  ].filter(Boolean);
  const logEntry = {
    id: Date.now(),
    schoolId: school.id,
    studentId: linkedStudent?.id || null,
    companyId: resolvedCompanyId,
    student: linkedStudent?.name || `برنامج: ${definition.title}`,
    actorId: actor?.id || null,
    actorUsername: actor?.username || '',
    actorName: actor?.name || actor?.username || 'مستخدم النظام',
    actorRole: actor?.role || 'teacher',
    method: 'نموذج برنامج',
    actionType: 'program',
    actionTitle: definition.title,
    note: noteLines.join(' • '),
    evidence,
    date: toArabicDate(now),
    isoDate: getTodayIso(),
    time: `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`,
    deltaPoints,
  };
  next.actionLog = [logEntry, ...next.actionLog].slice(0, 1200);
  return { ok: true, state: hydrateSharedState(next), logEntry, message: linkedStudent ? `تم اعتماد البرنامج وربطه بالطالب ${linkedStudent.name}.` : 'تم حفظ البرنامج في سجل المدرسة.' };
}

const wsClients = new Set();

function createWsAcceptValue(key) {
  return crypto.createHash('sha1').update(`${key}258EAFA5-E914-47DA-95CA-C5AB0DC85B11`).digest('base64');
}

function wsSend(socket, payload) {
  if (!socket || socket.destroyed || !payload) return;
  const text = typeof payload === 'string' ? payload : JSON.stringify(payload);
  const data = Buffer.from(text);
  let header;
  if (data.length < 126) {
    header = Buffer.from([0x81, data.length]);
  } else if (data.length < 65536) {
    header = Buffer.alloc(4);
    header[0] = 0x81; header[1] = 126; header.writeUInt16BE(data.length, 2);
  } else {
    header = Buffer.alloc(10);
    header[0] = 0x81; header[1] = 127; header.writeBigUInt64BE(BigInt(data.length), 2);
  }
  socket.write(Buffer.concat([header, data]));
}

function wsPong(socket, payload = Buffer.alloc(0)) {
  const header = Buffer.from([0x8A, payload.length]);
  socket.write(Buffer.concat([header, payload]));
}

function attachWsHeartbeat(socket) {
  socket.on('data', (buffer) => {
    if (!buffer?.length) return;
    const opcode = buffer[0] & 0x0f;
    if (opcode === 0x8) {
      try { socket.end(); } catch {}
    } else if (opcode === 0x9) {
      const secondByte = buffer[1] || 0;
      const masked = Boolean(secondByte & 0x80);
      let payloadLength = secondByte & 0x7f;
      let offset = 2;
      if (payloadLength === 126) { payloadLength = buffer.readUInt16BE(offset); offset += 2; }
      if (masked) { offset += 4; }
      const payload = buffer.slice(offset, offset + payloadLength);
      wsPong(socket, payload);
    }
  });
}

async function broadcastAllLive(state) {
  for (const client of wsClients) {
    if (!client.socket || client.socket.destroyed) continue;
    if (client.kind === 'screen') {
      const match = findScreenConfigByToken(state, client.token);
      if (!match) continue;
      const liveBase = summarizeSchoolLivePayload(state, match.school.id, match.screen);
      let live = await attachParentPortalSummaryToLive(state, match.school.id, liveBase);
      live = await attachRewardStoreSummaryToLive(state, match.school.id, live, match.screen);
      wsSend(client.socket, { type: 'live_update', kind: 'screen', screen: match.screen, live });
    } else if (client.kind === 'gate') {
      const match = findGateConfigByToken(state, client.token);
      if (!match) continue;
      const live = summarizeSchoolLivePayload(state, match.school.id);
      wsSend(client.socket, { type: 'live_update', kind: 'gate', gate: match.gate, live });
    }
  }
}

function mimeTypeFor(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  return {
    '.html': 'text/html; charset=utf-8',
    '.js': 'application/javascript; charset=utf-8',
    '.css': 'text/css; charset=utf-8',
    '.json': 'application/json; charset=utf-8',
    '.svg': 'image/svg+xml',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.webp': 'image/webp',
    '.gif': 'image/gif',
    '.woff': 'font/woff',
    '.woff2': 'font/woff2',
    '.ico': 'image/x-icon',
    '.webmanifest': 'application/manifest+json; charset=utf-8',
    '.wav': 'audio/wav',
    '.mp4': 'video/mp4',
  }[ext] || 'application/octet-stream';
}

const GITHUB_RAW_BASE = 'https://raw.githubusercontent.com/moekrh-design/ideal-company-platform/main/dist';

async function fetchFromGithub(urlPath) {
  const { default: https } = await import('https');
  return new Promise((resolve, reject) => {
    https.get(GITHUB_RAW_BASE + urlPath, (r) => {
      if (r.statusCode !== 200) { resolve(null); return; }
      const chunks = [];
      r.on('data', c => chunks.push(c));
      r.on('end', () => resolve(Buffer.concat(chunks)));
    }).on('error', reject);
  });
}


function renderParentPortalHtml() {
  return `<!doctype html>
<html lang="ar" dir="rtl">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
  <title>بوابة ولي الأمر</title>
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link href="https://fonts.googleapis.com/css2?family=Tajawal:wght@400;500;700;800;900&display=swap" rel="stylesheet" />
  <!-- Chart.js -->
  <script src="https://cdn.jsdelivr.net/npm/chart.js@4.4.0/dist/chart.umd.min.js"></script>
  <!-- PWA Meta Tags -->
  <link rel="manifest" href="/public/parent-manifest.json" />
  <meta name="theme-color" content="#0f766e" />
  <meta name="mobile-web-app-capable" content="yes" />
  <meta name="apple-mobile-web-app-capable" content="yes" />
  <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
  <meta name="apple-mobile-web-app-title" content="ولي الأمر" />
  <link rel="apple-touch-icon" href="/public/pwa-icon-192.png" />
  <link rel="apple-touch-startup-image" href="/public/pwa-splash.png" />
  <link rel="icon" type="image/png" href="/public/pwa-icon-192.png" />
  <style>
    /* ===== RESET & BASE ===== */
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    :root {
      --font: 'Tajawal', system-ui, sans-serif;
      --bg: #f0f4f8;
      --card: #ffffff;
      --border: #e2e8f0;
      --text: #0f172a;
      --muted: #64748b;
      --primary: #0f766e;
      --primary-light: #ccfbf1;
      --primary-dark: #0d5c56;
      --accent: #1d4ed8;
      --danger: #be123c;
      --danger-light: #fff1f2;
      --success: #15803d;
      --success-light: #dcfce7;
      --amber: #b45309;
      --amber-light: #fef3c7;
      --nav-h: 72px;
      --header-h: 64px;
      --radius: 20px;
      --radius-sm: 14px;
    }
    html, body {
      height: 100%;
      font-family: var(--font);
      background: linear-gradient(135deg, #f0f9ff 0%, #f0fdf4 40%, #faf5ff 100%);
      color: var(--text);
      -webkit-font-smoothing: antialiased;
    }

    /* ===== LAYOUT ===== */
    #app { display: flex; flex-direction: column; height: 100dvh; overflow: hidden; }

    /* ===== PWA INSTALL GATE ===== */
    #pwaGate {
      position: fixed;
      inset: 0;
      z-index: 9999;
      background: linear-gradient(160deg, #0f766e 0%, #1d4ed8 100%);
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 24px 20px;
      overflow-y: auto;
    }
    .pwa-gate-box {
      width: 100%;
      max-width: 400px;
      background: #fff;
      border-radius: 28px;
      padding: 32px 24px;
      box-shadow: 0 24px 64px rgba(0,0,0,.25);
      text-align: center;
    }
    .pwa-gate-icon {
      width: 80px;
      height: 80px;
      border-radius: 22px;
      margin: 0 auto 16px;
      box-shadow: 0 8px 24px rgba(15,118,110,.35);
    }
    .pwa-gate-title {
      font-size: 22px;
      font-weight: 900;
      color: #0f172a;
      margin-bottom: 6px;
    }
    .pwa-gate-subtitle {
      font-size: 14px;
      color: #64748b;
      margin-bottom: 24px;
      line-height: 1.6;
    }
    .pwa-steps {
      display: flex;
      flex-direction: column;
      gap: 14px;
      margin-bottom: 24px;
      text-align: right;
    }
    .pwa-step {
      display: flex;
      align-items: flex-start;
      gap: 12px;
      background: #f8fafc;
      border-radius: 14px;
      padding: 14px 16px;
      border: 1.5px solid #e2e8f0;
    }
    .pwa-step-num {
      width: 28px;
      height: 28px;
      border-radius: 50%;
      background: linear-gradient(135deg, #0f766e, #1d4ed8);
      color: #fff;
      font-weight: 900;
      font-size: 14px;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
      margin-top: 1px;
    }
    .pwa-step-text {
      flex: 1;
    }
    .pwa-step-text strong {
      display: block;
      font-size: 14px;
      font-weight: 800;
      color: #0f172a;
      margin-bottom: 2px;
    }
    .pwa-step-text span {
      font-size: 12px;
      color: #64748b;
      line-height: 1.5;
    }
    .pwa-step-icon {
      font-size: 22px;
      flex-shrink: 0;
      margin-top: 2px;
    }
    .pwa-gate-note {
      background: #fef3c7;
      border: 1.5px solid #f59e0b;
      border-radius: 12px;
      padding: 12px 14px;
      font-size: 12px;
      color: #92400e;
      line-height: 1.6;
      margin-bottom: 20px;
    }
    .pwa-gate-skip {
      font-size: 12px;
      color: #94a3b8;
      text-decoration: underline;
      cursor: pointer;
      background: none;
      border: none;
      font-family: inherit;
      margin-top: 8px;
    }
    .pwa-gate-skip:hover { color: #64748b; }

    /* ===== LOGIN SCREEN ===== */
    #loginScreen {
      flex: 1;
      overflow-y: auto;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 24px 20px;
      background: linear-gradient(160deg, #0f766e 0%, #1d4ed8 100%);
      min-height: 100dvh;
    }
    .login-box {
      width: 100%;
      max-width: 420px;
      background: #fff;
      border-radius: 28px;
      padding: 32px 28px;
      box-shadow: 0 32px 80px rgba(15,23,42,.25);
    }
    .login-logo {
      text-align: center;
      margin-bottom: 24px;
    }
    .login-logo .logo-icon {
      width: 64px; height: 64px;
      background: linear-gradient(135deg, #0f766e, #1d4ed8);
      border-radius: 20px;
      display: inline-flex; align-items: center; justify-content: center;
      font-size: 32px; margin-bottom: 12px;
    }
    .login-logo h1 { font-size: 22px; font-weight: 900; color: var(--text); }
    .login-logo p { font-size: 14px; color: var(--muted); margin-top: 4px; }

    /* ===== HEADER ===== */
    #mainHeader {
      height: var(--header-h);
      background: rgba(255,255,255,0.85);
      backdrop-filter: blur(20px);
      -webkit-backdrop-filter: blur(20px);
      border-bottom: 1px solid rgba(226,232,240,0.7);
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 0 20px;
      flex-shrink: 0;
      position: sticky;
      top: 0;
      z-index: 50;
      box-shadow: 0 2px 20px rgba(15,23,42,.06);
    }
    .header-user { display: flex; flex-direction: column; }
    .header-user .greeting { font-size: 11px; color: var(--muted); font-weight: 600; letter-spacing: .3px; }
    .header-user .name { font-size: 17px; font-weight: 900; color: var(--text); line-height: 1.2; }
    .header-actions { display: flex; gap: 8px; }
    .icon-btn {
      width: 40px; height: 40px;
      border: 1px solid rgba(226,232,240,0.8);
      border-radius: 14px;
      background: rgba(241,245,249,0.8);
      cursor: pointer;
      display: flex; align-items: center; justify-content: center;
      font-size: 18px;
      transition: all .2s;
      backdrop-filter: blur(8px);
    }
    .icon-btn:hover { background: rgba(226,232,240,0.9); transform: scale(1.05); }

    /* ===== PAGE CONTENT ===== */
    #pageContent {
      flex: 1;
      overflow-y: auto;
      padding: 20px 16px calc(var(--nav-h) + 16px);
      -webkit-overflow-scrolling: touch;
    }

    /* ===== BOTTOM NAV ===== */
    #bottomNav {
      height: var(--nav-h);
      background: rgba(255,255,255,0.9);
      backdrop-filter: blur(24px);
      -webkit-backdrop-filter: blur(24px);
      border-top: 1px solid rgba(226,232,240,0.6);
      display: flex;
      align-items: center;
      flex-shrink: 0;
      position: sticky;
      bottom: 0;
      z-index: 50;
      box-shadow: 0 -8px 32px rgba(15,23,42,.08);
      padding: 0 8px;
      gap: 4px;
    }
    .nav-item {
      flex: 1;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 3px;
      cursor: pointer;
      border: none;
      background: transparent;
      font-family: var(--font);
      color: var(--muted);
      font-size: 11px;
      font-weight: 700;
      transition: all .2s cubic-bezier(.34,1.56,.64,1);
      position: relative;
      padding: 8px 4px;
      border-radius: 16px;
    }
    .nav-item .nav-icon {
      display: flex; align-items: center; justify-content: center;
      width: 44px; height: 36px;
      border-radius: 14px;
      transition: all .25s cubic-bezier(.34,1.56,.64,1);
      color: var(--muted);
    }
    .nav-item .nav-icon svg {
      width: 22px; height: 22px;
      transition: all .25s cubic-bezier(.34,1.56,.64,1);
    }
    .nav-item.active { color: var(--primary); }
    .nav-item.active .nav-icon {
      background: var(--primary-light);
      color: var(--primary);
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(15,118,110,.2);
    }
    .nav-item.active .nav-icon svg {
      stroke-width: 2.5;
    }
    .nav-item:not(.active):hover .nav-icon {
      background: rgba(241,245,249,0.8);
      transform: translateY(-1px);
    }
    .nav-badge {
      position: absolute;
      top: 2px; left: calc(50% + 6px);
      background: linear-gradient(135deg, #ef4444, #dc2626);
      color: #fff;
      font-size: 10px;
      font-weight: 900;
      min-width: 18px; height: 18px;
      border-radius: 999px;
      display: flex; align-items: center; justify-content: center;
      padding: 0 5px;
      box-shadow: 0 2px 8px rgba(239,68,68,.5), 0 0 0 2px #fff;
      animation: badge-pulse 1.8s ease-in-out infinite;
      letter-spacing: -0.5px;
    }
    @keyframes badge-pulse {
      0%, 100% { transform: scale(1); box-shadow: 0 2px 8px rgba(239,68,68,.5), 0 0 0 2px #fff; }
      50% { transform: scale(1.15); box-shadow: 0 4px 14px rgba(239,68,68,.7), 0 0 0 2px #fff; }
    }

    /* ===== CARDS ===== */
    .card {
      background: rgba(255,255,255,0.9);
      backdrop-filter: blur(12px);
      -webkit-backdrop-filter: blur(12px);
      border: 1px solid rgba(226,232,240,0.8);
      border-radius: var(--radius);
      padding: 18px;
      margin-bottom: 14px;
      box-shadow: 0 4px 24px rgba(15,23,42,.05);
      transition: box-shadow .2s;
    }
    .card:hover { box-shadow: 0 8px 32px rgba(15,23,42,.08); }
    .card-title {
      font-size: 15px;
      font-weight: 800;
      color: var(--text);
      margin-bottom: 14px;
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .card-title .icon { font-size: 18px; }

    /* ===== STAT GRID ===== */
    .stat-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 10px;
      margin-bottom: 14px;
    }
    .stat-box {
      background: rgba(255,255,255,0.7);
      border: 1px solid rgba(226,232,240,0.6);
      border-radius: var(--radius-sm);
      padding: 14px 12px;
      text-align: center;
      backdrop-filter: blur(8px);
      -webkit-backdrop-filter: blur(8px);
      transition: transform .2s, box-shadow .2s;
    }
    .stat-box:hover { transform: translateY(-2px); box-shadow: 0 6px 20px rgba(15,23,42,.08); }
    .stat-box .stat-val { font-size: 26px; font-weight: 900; color: var(--text); line-height: 1; }
    .stat-box .stat-lbl { font-size: 12px; color: var(--muted); font-weight: 600; margin-top: 4px; }

    /* ===== STUDENT CARD ===== */
    .student-card {
      background: rgba(255,255,255,0.92);
      border: 1px solid rgba(226,232,240,0.7);
      border-radius: var(--radius);
      padding: 16px;
      margin-bottom: 12px;
      box-shadow: 0 4px 20px rgba(15,23,42,.05);
      backdrop-filter: blur(10px);
      -webkit-backdrop-filter: blur(10px);
      transition: transform .2s, box-shadow .2s;
    }
    .student-card:hover { transform: translateY(-2px); box-shadow: 0 8px 28px rgba(15,23,42,.1); }
    .student-header {
      display: flex;
      align-items: flex-start;
      justify-content: space-between;
      gap: 12px;
      margin-bottom: 12px;
    }
    .student-name { font-size: 17px; font-weight: 800; }
    .student-meta { font-size: 12px; color: var(--muted); margin-top: 2px; }
    .student-points-badge {
      background: linear-gradient(135deg, #0f766e, #1d4ed8);
      color: #fff;
      border-radius: 12px;
      padding: 8px 14px;
      text-align: center;
      flex-shrink: 0;
    }
    .student-points-badge .pts { font-size: 20px; font-weight: 900; line-height: 1; }
    .student-points-badge .pts-lbl { font-size: 10px; font-weight: 700; opacity: .85; }
    .student-stats { display: flex; gap: 8px; flex-wrap: wrap; margin-bottom: 12px; }
    .student-stat-chip {
      background: var(--bg);
      border: 1px solid var(--border);
      border-radius: 999px;
      padding: 5px 12px;
      font-size: 12px;
      font-weight: 700;
      color: var(--text);
    }

    /* ===== INNER TABS ===== */
    .inner-tabs {
      display: flex;
      gap: 6px;
      background: var(--bg);
      border-radius: 14px;
      padding: 4px;
      margin-bottom: 16px;
    }
    .inner-tab {
      flex: 1;
      text-align: center;
      padding: 8px 6px;
      border-radius: 10px;
      font-size: 13px;
      font-weight: 700;
      cursor: pointer;
      border: none;
      background: transparent;
      color: var(--muted);
      font-family: var(--font);
      transition: all .15s;
    }
    .inner-tab.active {
      background: var(--card);
      color: var(--primary);
      box-shadow: 0 2px 8px rgba(15,23,42,.08);
    }

    /* ===== TIME FILTER ===== */
    .time-filter {
      display: flex;
      gap: 6px;
      flex-wrap: wrap;
      margin-bottom: 16px;
    }
    .time-chip {
      padding: 6px 14px;
      border-radius: 999px;
      border: 1px solid var(--border);
      background: var(--card);
      font-size: 12px;
      font-weight: 700;
      cursor: pointer;
      font-family: var(--font);
      color: var(--muted);
      transition: all .15s;
    }
    .time-chip.active {
      background: var(--primary);
      border-color: var(--primary);
      color: #fff;
    }

    /* ===== ACTION ITEM ===== */
    .action-item {
      border: 1px solid var(--border);
      border-radius: var(--radius-sm);
      padding: 12px 14px;
      margin-bottom: 8px;
      display: flex;
      align-items: flex-start;
      justify-content: space-between;
      gap: 10px;
    }
    .action-item .action-title { font-size: 14px; font-weight: 700; }
    .action-item .action-meta { font-size: 12px; color: var(--muted); margin-top: 3px; }
    .action-item .action-pts {
      font-size: 15px;
      font-weight: 900;
      flex-shrink: 0;
    }
    .action-item .action-pts.positive { color: var(--success); }
    .action-item .action-pts.negative { color: var(--danger); }

    /* ===== PILL / BADGE ===== */
    .pill {
      display: inline-flex; align-items: center;
      padding: 4px 10px;
      border-radius: 999px;
      font-size: 12px;
      font-weight: 700;
    }
    .pill-green { background: var(--success-light); color: var(--success); }
    .pill-red { background: var(--danger-light); color: var(--danger); }
    .pill-amber { background: var(--amber-light); color: var(--amber); }
    .pill-blue { background: #eff6ff; color: #1d4ed8; }
    .pill-teal { background: var(--primary-light); color: var(--primary-dark); }
    .pill-slate { background: #f1f5f9; color: #475569; }
    /* ===== CHART ===== */
    .chart-section {
      background: rgba(255,255,255,0.92);
      backdrop-filter: blur(16px);
      -webkit-backdrop-filter: blur(16px);
      border-radius: var(--radius);
      padding: 20px;
      margin-bottom: 16px;
      box-shadow: 0 4px 20px rgba(15,23,42,.06);
      border: 1px solid rgba(255,255,255,0.7);
    }
    .chart-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 16px;
      gap: 12px;
    }
    .chart-title {
      font-size: 15px;
      font-weight: 800;
      color: var(--text);
    }
    .chart-legend {
      display: flex;
      gap: 12px;
      flex-wrap: wrap;
    }
    .chart-legend-item {
      display: flex;
      align-items: center;
      gap: 5px;
      font-size: 11px;
      font-weight: 600;
      color: var(--muted);
    }
    .chart-legend-dot {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      flex-shrink: 0;
    }
    .chart-container {
      position: relative;
      height: 180px;
    }
    /* ===== FORM ELEMENTS ===== */
    .form-group { margin-bottom: 14px; }
    .form-label {
      display: block;
      font-size: 13px;
      font-weight: 700;
      color: var(--muted);
      margin-bottom: 6px;
    }
    .form-input, .form-select, .form-textarea {
      width: 100%;
      border: 1px solid var(--border);
      border-radius: var(--radius-sm);
      padding: 12px 14px;
      font-size: 14px;
      font-family: var(--font);
      font-weight: 500;
      color: var(--text);
      background: var(--bg);
      outline: none;
      transition: border-color .15s, box-shadow .15s;
    }
    .form-input:focus, .form-select:focus, .form-textarea:focus {
      border-color: var(--primary);
      box-shadow: 0 0 0 3px rgba(15,118,110,.12);
      background: #fff;
    }
    .form-textarea { min-height: 90px; resize: vertical; }

    /* ===== BUTTONS ===== */
    .btn {
      display: inline-flex; align-items: center; justify-content: center; gap: 6px;
      padding: 12px 20px;
      border-radius: var(--radius-sm);
      font-size: 14px;
      font-weight: 700;
      font-family: var(--font);
      cursor: pointer;
      border: none;
      transition: opacity .15s, transform .1s;
    }
    .btn:active { transform: scale(.97); }
    .btn:disabled { opacity: .55; cursor: not-allowed; }
    .btn-primary { background: linear-gradient(135deg, var(--primary), #0ea5a4); color: #fff; }
    .btn-outline { background: var(--card); color: var(--text); border: 1px solid var(--border); }
    .btn-danger { background: var(--danger-light); color: var(--danger); border: 1px solid #fecdd3; }
    .btn-full { width: 100%; }
    .btn-row { display: flex; gap: 8px; flex-wrap: wrap; }

    /* ===== ALERT / MESSAGE ===== */
    .alert {
      padding: 12px 14px;
      border-radius: var(--radius-sm);
      font-size: 13px;
      font-weight: 600;
      margin-top: 10px;
      display: none;
    }
    .alert.show { display: block; }
    .alert-info { background: #eff6ff; color: #1d4ed8; border: 1px solid #bfdbfe; }
    .alert-success { background: var(--success-light); color: var(--success); border: 1px solid #86efac; }
    .alert-error { background: var(--danger-light); color: var(--danger); border: 1px solid #fecdd3; }

    /* ===== NOTIFICATION ITEM ===== */
    .notif-item {
      border: 1px solid var(--border);
      border-radius: var(--radius-sm);
      padding: 14px;
      margin-bottom: 8px;
      background: var(--card);
    }
    .notif-header { display: flex; align-items: flex-start; justify-content: space-between; gap: 8px; }
    .notif-title { font-size: 14px; font-weight: 800; }
    .notif-body { font-size: 13px; color: var(--muted); margin-top: 6px; line-height: 1.7; }
    .notif-meta { font-size: 11px; color: var(--muted); margin-top: 6px; }

    /* ===== REWARD ITEM ===== */
    .reward-item {
      border: 1px solid var(--border);
      border-radius: var(--radius-sm);
      overflow: hidden;
      margin-bottom: 10px;
      background: var(--card);
    }
    .reward-img { width: 100%; max-height: 160px; object-fit: cover; }
    .reward-body { padding: 12px 14px; }
    .reward-title { font-size: 15px; font-weight: 800; }
    .reward-meta { font-size: 12px; color: var(--muted); margin-top: 4px; }
    .reward-footer { display: flex; align-items: center; justify-content: space-between; margin-top: 10px; }

    /* ===== SETTINGS SECTION ===== */
    .settings-section {
      background: var(--card);
      border: 1px solid var(--border);
      border-radius: var(--radius);
      overflow: hidden;
      margin-bottom: 14px;
    }
    .settings-section-header {
      padding: 14px 18px;
      border-bottom: 1px solid var(--border);
      font-size: 14px;
      font-weight: 800;
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .settings-section-body { padding: 18px; }
    .settings-row {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 12px 0;
      border-bottom: 1px solid var(--border);
      gap: 12px;
    }
    .settings-row:last-child { border-bottom: none; }
    .settings-row-label { font-size: 14px; font-weight: 700; }
    .settings-row-sub { font-size: 12px; color: var(--muted); margin-top: 2px; }

    /* ===== TOGGLE ===== */
    .toggle-wrap { display: flex; align-items: center; gap: 10px; }
    .toggle {
      position: relative;
      width: 44px; height: 24px;
      flex-shrink: 0;
    }
    .toggle input { opacity: 0; width: 0; height: 0; }
    .toggle-slider {
      position: absolute; inset: 0;
      background: #cbd5e1;
      border-radius: 999px;
      cursor: pointer;
      transition: background .2s;
    }
    .toggle-slider::before {
      content: '';
      position: absolute;
      width: 18px; height: 18px;
      left: 3px; top: 3px;
      background: #fff;
      border-radius: 50%;
      transition: transform .2s;
      box-shadow: 0 1px 4px rgba(0,0,0,.2);
    }
    .toggle input:checked + .toggle-slider { background: var(--primary); }
    .toggle input:checked + .toggle-slider::before { transform: translateX(20px); }

    /* ===== CONTACT ROW ===== */
    .contact-row {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 10px;
      padding: 12px 14px;
      border: 1px solid var(--border);
      border-radius: var(--radius-sm);
      margin-bottom: 8px;
      background: var(--bg);
    }
    .contact-info .contact-num { font-size: 14px; font-weight: 700; }
    .contact-info .contact-meta { font-size: 12px; color: var(--muted); margin-top: 2px; }

    /* ===== EMPTY STATE ===== */
    .empty-state {
      text-align: center;
      padding: 40px 20px;
      color: var(--muted);
    }
    .empty-state .empty-icon { font-size: 40px; margin-bottom: 12px; }
    .empty-state p { font-size: 14px; font-weight: 600; }

    /* ===== HIDDEN ===== */
    .hidden { display: none !important; }

    /* ===== OTP STEP ===== */
    .otp-step { margin-top: 16px; }

    /* ===== DIVIDER ===== */
    .divider {
      height: 1px;
      background: var(--border);
      margin: 16px 0;
    }

    /* ===== PAGE TITLE ===== */
    .page-title {
      font-size: 20px;
      font-weight: 900;
      color: var(--text);
      margin-bottom: 16px;
    }

    /* ===== SCROLLABLE TABS (inner) ===== */
    .scroll-tabs {
      display: flex;
      gap: 6px;
      overflow-x: auto;
      padding-bottom: 4px;
      margin-bottom: 16px;
      scrollbar-width: none;
    }
    .scroll-tabs::-webkit-scrollbar { display: none; }
    .scroll-tab {
      flex-shrink: 0;
      padding: 7px 16px;
      border-radius: 999px;
      border: 1px solid var(--border);
      background: var(--card);
      font-size: 13px;
      font-weight: 700;
      cursor: pointer;
      font-family: var(--font);
      color: var(--muted);
      white-space: nowrap;
      transition: all .15s;
    }
    .scroll-tab.active {
      background: var(--primary);
      border-color: var(--primary);
      color: #fff;
    }

    /* ===== RESPONSIVE ===== */
    @media (min-width: 640px) {
      #pageContent { padding: 24px 24px calc(var(--nav-h) + 20px); max-width: 640px; margin: 0 auto; }
      #mainHeader { max-width: 640px; margin: 0 auto; }
      #bottomNav { max-width: 640px; margin: 0 auto; }
    }
  </style>
</head>
<body>
<!-- ===== PWA INSTALL BANNER ===== -->
<div id="installBanner" style="display:none;position:fixed;bottom:80px;left:12px;right:12px;z-index:200;background:linear-gradient(135deg,#0f766e,#1d4ed8);color:#fff;border-radius:20px;padding:14px 16px;align-items:center;gap:12px;box-shadow:0 8px 32px rgba(15,23,42,.25);">
  <img src="/public/pwa-icon-72.png" style="width:44px;height:44px;border-radius:12px;flex-shrink:0;" alt="" />
  <div style="flex:1;">
    <div style="font-weight:800;font-size:14px;">ثبّت التطبيق</div>
    <div style="font-size:12px;opacity:.85;margin-top:2px;">أضف بوابة ولي الأمر لشاشتك الرئيسية</div>
  </div>
  <button id="installBtn" style="background:rgba(255,255,255,.2);border:1px solid rgba(255,255,255,.4);color:#fff;border-radius:12px;padding:8px 14px;font-size:13px;font-weight:700;cursor:pointer;font-family:inherit;white-space:nowrap;">تثبيت</button>
  <button id="dismissInstallBtn" style="background:none;border:none;color:rgba(255,255,255,.7);font-size:20px;cursor:pointer;padding:4px;line-height:1;">×</button>
</div>

<!-- ===== PWA INSTALL GATE ===== -->
<div id="pwaGate" style="display:none;">
  <div class="pwa-gate-box">
    <img src="/public/pwa-icon-128.png" class="pwa-gate-icon" alt="بوابة ولي الأمر" />
    <div class="pwa-gate-title">ثبّت التطبيق أولاً</div>
    <div class="pwa-gate-subtitle" id="pwaGateSubtitle">لاستخدام بوابة ولي الأمر يجب تثبيتها على شاشتك الرئيسية</div>
    <div class="pwa-steps" id="pwaGateSteps">
      <!-- تُملأ بـ JavaScript حسب نوع الجهاز -->
    </div>
    <div class="pwa-gate-note" id="pwaGateNote">بعد التثبيت، افتح التطبيق من الأيقونة الجديدة على شاشتك الرئيسية</div>
    <button class="pwa-gate-skip" id="pwaGateSkipBtn" onclick="_pwaGateSkip()">تخطي مؤقتاً (مرة واحدة فقط)</button>
  </div>
</div>

<div id="app">
  <!-- ===== LOGIN SCREEN ===== -->
  <div id="loginScreen">
    <div class="login-box">
      <div class="login-logo">
        <img src="/public/pwa-icon-128.png" alt="بوابة ولي الأمر" style="width:72px;height:72px;border-radius:22px;margin-bottom:14px;box-shadow:0 8px 24px rgba(15,118,110,.3);" />
        <h1>بوابة ولي الأمر</h1>
        <p>دخول آمن برقم الجوال المسجل</p>
      </div>

      <div class="form-group">
        <label class="form-label">رقم الجوال الأساسي</label>
        <input id="mobileInput" class="form-input" placeholder="05xxxxxxxx أو 9665xxxxxxxx" type="tel" inputmode="numeric" />
      </div>
      <button class="btn btn-primary btn-full" id="requestOtpBtn">إرسال رمز التحقق</button>
      <div id="requestMsg" class="alert"></div>

      <div id="otpStep" class="otp-step hidden">
        <div class="divider"></div>
        <!-- مربع رمز التحقق التجريبي -->
        <div id="previewCodeBox" style="display:none;background:linear-gradient(135deg,#0f766e,#0891b2);border-radius:16px;padding:18px 20px;margin-bottom:14px;text-align:center;">
          <div style="color:rgba(255,255,255,0.8);font-size:12px;margin-bottom:6px;">رمز التحقق (وضع تجريبي)</div>
          <div id="previewCodeDisplay" style="color:#fff;font-size:36px;font-weight:900;letter-spacing:10px;font-family:monospace;">------</div>
          <div style="color:rgba(255,255,255,0.7);font-size:11px;margin-top:6px;">انسخ الرمز وأدخله في الحقل أدناه</div>
        </div>
        <div class="form-group">
          <label class="form-label">رمز التحقق</label>
          <input id="otpInput" class="form-input" placeholder="أدخل الرمز" maxlength="6" type="text" inputmode="numeric" />
        </div>
        <div class="btn-row">
          <button class="btn btn-primary" style="flex:1" id="verifyOtpBtn">دخول</button>
          <button class="btn btn-outline" id="resendOtpBtn">إعادة الإرسال</button>
        </div>
        <div id="verifyMsg" class="alert"></div>
      </div>
      <!-- ===== خيار تسجيل الدخول البديل ===== -->
      <div style="margin-top:20px;text-align:center;">
        <div style="display:flex;align-items:center;gap:8px;margin-bottom:14px;">
          <div style="flex:1;height:1px;background:#e2e8f0;"></div>
          <span style="font-size:12px;color:#94a3b8;white-space:nowrap;">أو استخدم طريقة بديلة</span>
          <div style="flex:1;height:1px;background:#e2e8f0;"></div>
        </div>
        <button id="showAltLoginBtn" style="background:none;border:1.5px solid #e2e8f0;border-radius:12px;padding:10px 16px;font-size:13px;color:#64748b;cursor:pointer;font-family:inherit;width:100%;font-weight:600;" onclick="toggleAltLogin()">
          دخول برقم الجوال + رقم هوية الطالب
        </button>
        <div id="altLoginSection" style="display:none;margin-top:14px;text-align:right;">
          <div style="background:#f0fdf4;border:1.5px solid #bbf7d0;border-radius:14px;padding:14px 16px;margin-bottom:14px;font-size:12px;color:#166534;line-height:1.6;">
            هذا الخيار للحالات الطارئة عند تعذر استلام رمز التحقق
          </div>
          <div class="form-group">
            <label class="form-label">رقم الجوال المسجل</label>
            <input id="altMobileInput" class="form-input" placeholder="05xxxxxxxx" type="tel" inputmode="numeric" />
          </div>
          <div class="form-group">
            <label class="form-label">رقم هوية أحد الأبناء المسجلين</label>
            <input id="altNationalIdInput" class="form-input" placeholder="أدخل رقم الهوية الوطنية" type="text" inputmode="numeric" />
          </div>
          <button class="btn btn-primary btn-full" id="altLoginBtn" onclick="doAltLogin()">
            تحقق والدخول
          </button>
          <div id="altLoginMsg" class="alert" style="margin-top:10px;"></div>
          <div id="altPreviewCodeBox" style="display:none;background:linear-gradient(135deg,#0f766e,#0891b2);border-radius:16px;padding:18px 20px;margin-top:14px;text-align:center;">
            <div style="color:rgba(255,255,255,0.8);font-size:12px;margin-bottom:6px;">رمز الدخول (وضع تجريبي)</div>
            <div id="altPreviewCodeDisplay" style="color:#fff;font-size:36px;font-weight:900;letter-spacing:10px;font-family:monospace;">------</div>
            <div style="color:rgba(255,255,255,0.7);font-size:11px;margin-top:6px;">انسخ الرمز وأدخله في الحقل أدناه</div>
          </div>
          <div id="altOtpStep" style="display:none;margin-top:14px;">
            <div class="form-group">
              <label class="form-label">رمز التحقق</label>
              <input id="altOtpInput" class="form-input" placeholder="أدخل الرمز" maxlength="6" type="text" inputmode="numeric" />
            </div>
            <button class="btn btn-primary btn-full" id="altVerifyBtn" onclick="doAltVerify()">
              دخول
            </button>
            <div id="altVerifyMsg" class="alert" style="margin-top:10px;"></div>
          </div>
        </div>
      </div>
    </div>
  </div>
  <!-- ===== MAIN APP ===== -->
  <div id="mainApp" class="hidden" style="display:flex;flex-direction:column;flex:1;overflow:hidden">

    <!-- Header -->
    <div id="mainHeader">
      <div class="header-user">
        <span class="greeting">مرحباً</span>
        <span class="name" id="headerName">ولي الأمر</span>
      </div>
      <div class="header-actions">
        <button class="icon-btn" id="refreshBtn" title="تحديث">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="23 4 23 10 17 10"/>
            <polyline points="1 20 1 14 7 14"/>
            <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/>
          </svg>
        </button>
        <button class="icon-btn" id="logoutBtn" title="خروج">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
            <polyline points="16 17 21 12 16 7"/>
            <line x1="21" y1="12" x2="9" y2="12"/>
          </svg>
        </button>
      </div>
    </div>

    <!-- Page Content -->
    <div id="pageContent">

      <!-- ===== PAGE: POINTS ===== -->
      <div id="pagePoints" class="page-section">
        <div class="page-title">نقاط الأبناء</div>

        <!-- Summary Stats -->
        <div class="stat-grid" id="pointsSummaryGrid">
          <div class="stat-box"><div class="stat-val" id="statTotalPoints">0</div><div class="stat-lbl">إجمالي النقاط</div></div>
          <div class="stat-box"><div class="stat-val" id="statAttendance">0%</div><div class="stat-lbl">متوسط الحضور</div></div>
          <div class="stat-box"><div class="stat-val" id="statStudents">0</div><div class="stat-lbl">عدد الأبناء</div></div>
          <div class="stat-box"><div class="stat-val" id="statSchools">0</div><div class="stat-lbl">المدارس</div></div>
        </div>
        <!-- Points Chart -->
        <div class="chart-section" id="pointsChartSection">
          <div class="chart-header">
            <div class="chart-title">تطور النقاط</div>
            <div class="chart-legend">
              <div class="chart-legend-item"><div class="chart-legend-dot" style="background:#0f766e"></div>مكافآت</div>
              <div class="chart-legend-item"><div class="chart-legend-dot" style="background:#ef4444"></div>خصومات</div>
            </div>
          </div>
          <div class="chart-container">
            <canvas id="pointsChart"></canvas>
          </div>
        </div>
        <!-- Inner Tabs: Rewards / Deductions -->
        <div class="inner-tabs">
          <button class="inner-tab active" data-ptab="rewards">المكافآت</button>
          <button class="inner-tab" data-ptab="deductions">الخصومات</button>
          <button class="inner-tab" data-ptab="attendance">الحضور</button>
        </div>

        <!-- Time Filter -->
        <div class="time-filter">
          <button class="time-chip active" data-days="0">الكل</button>
          <button class="time-chip" data-days="1">اليوم</button>
          <button class="time-chip" data-days="7">الأسبوع</button>
          <button class="time-chip" data-days="30">الشهر</button>
        </div>

        <!-- Students List -->
        <div id="studentsList"></div>
      </div>

      <!-- ===== PAGE: STORE ===== -->
      <div id="pageStore" class="page-section hidden">
        <div class="page-title">متجر النقاط</div>

        <!-- Store Tabs -->
        <div class="scroll-tabs">
          <button class="scroll-tab active" data-stab="catalog">الجوائز المتاحة</button>
          <button class="scroll-tab" data-stab="redeem">استبدال نقاط</button>
          <button class="scroll-tab" data-stab="propose">مقترح شراكة</button>
          <button class="scroll-tab" data-stab="history">السجل</button>
        </div>

        <!-- Catalog -->
        <div id="storeCatalog" class="store-tab-content">
          <div id="rewardCatalogList"></div>
        </div>

        <!-- Redeem -->
        <div id="storeRedeem" class="store-tab-content hidden">
          <div class="card">
            <div class="card-title"><span class="icon">🎁</span> طلب استبدال جائزة</div>
            <div class="form-group">
              <label class="form-label">المدرسة</label>
              <select id="rewardRedeemSchool" class="form-select"></select>
            </div>
            <div class="form-group">
              <label class="form-label">الطالب</label>
              <select id="rewardRedeemStudent" class="form-select"></select>
            </div>
            <div class="form-group">
              <label class="form-label">الجائزة</label>
              <select id="rewardRedeemItem" class="form-select"></select>
            </div>
            <div class="form-group">
              <label class="form-label">ملاحظة (اختياري)</label>
              <textarea id="rewardRedeemNote" class="form-textarea" placeholder="مثال: يرجى تسليم الجائزة في الطابور الصباحي"></textarea>
            </div>
            <button class="btn btn-primary btn-full" id="submitRewardRedeemBtn">إرسال طلب الاستبدال</button>
            <div id="rewardRedeemMsg" class="alert"></div>
          </div>
          <div id="rewardRedeemHistory"></div>
        </div>

        <!-- Propose -->
        <div id="storePropose" class="store-tab-content hidden">
          <div class="card">
            <div class="card-title"><span class="icon">🤝</span> إضافة جائزة بالشراكة</div>
            <div class="form-group">
              <label class="form-label">المدرسة</label>
              <select id="rewardProposalSchool" class="form-select"></select>
            </div>
            <div class="form-group">
              <label class="form-label">اسم الجائزة</label>
              <input id="rewardProposalTitle" class="form-input" placeholder="مثال: كوبون شراء أو هدية تحفيزية" />
            </div>
            <div class="form-group">
              <label class="form-label">الكمية</label>
              <input id="rewardProposalQuantity" class="form-input" type="number" min="1" value="1" />
            </div>
            <div class="form-group">
              <label class="form-label">اسم المتبرع الظاهر (اختياري)</label>
              <input id="rewardProposalDonorName" class="form-input" placeholder="اسمك أو اسم المتبرع" />
            </div>
            <div class="form-group toggle-wrap">
              <label class="toggle">
                <input type="checkbox" id="rewardProposalShowDonor" checked />
                <span class="toggle-slider"></span>
              </label>
              <span style="font-size:13px;font-weight:700">إظهار اسم المتبرع في المتجر بعد الاعتماد</span>
            </div>
            <div class="form-group">
              <label class="form-label">صورة الجائزة (اختياري)</label>
              <input id="rewardProposalImage" class="form-input" type="file" accept="image/*" />
            </div>
            <div class="form-group">
              <label class="form-label">وصف أو ملاحظة</label>
              <textarea id="rewardProposalNote" class="form-textarea" placeholder="وصف مختصر للجائزة أو طريقة تسليمها"></textarea>
            </div>
            <button class="btn btn-primary btn-full" id="submitRewardProposalBtn">إرسال المقترح</button>
            <div id="rewardProposalMsg" class="alert"></div>
          </div>
        </div>

        <!-- History -->
        <div id="storeHistory" class="store-tab-content hidden">
          <div class="card">
            <div class="card-title"><span class="icon">📋</span> مقترحاتي السابقة</div>
            <div id="rewardProposalHistory"></div>
          </div>
          <div class="card">
            <div class="card-title"><span class="icon">🔄</span> طلبات الاستبدال</div>
            <div id="rewardRedeemHistoryStore"></div>
          </div>
        </div>
      </div>

      <!-- ===== PAGE: NOTIFICATIONS ===== -->
      <div id="pageNotifications" class="page-section hidden">
        <div class="page-title">التنبيهات</div>

        <!-- Notif Tabs -->
        <div class="scroll-tabs">
          <button class="scroll-tab active" data-ntab="all">الكل</button>
          <button class="scroll-tab" data-ntab="whatsapp">واتساب</button>
          <button class="scroll-tab" data-ntab="sms">SMS</button>
          <button class="scroll-tab" data-ntab="internal">داخلي</button>
        </div>

        <!-- Filters -->
        <div style="display:flex;gap:8px;margin-bottom:14px;flex-wrap:wrap">
          <select id="historyFilterStatus" class="form-select" style="flex:1;min-width:140px">
            <option value="all">كل الحالات</option>
            <option value="success">الناجحة</option>
            <option value="failed">المتعثرة</option>
          </select>
          <select id="historyFilterStudent" class="form-select" style="flex:1;min-width:140px">
            <option value="all">كل الأبناء</option>
          </select>
        </div>

        <div id="notifList"></div>
      </div>

      <!-- ===== PAGE: SETTINGS ===== -->
      <div id="pageSettings" class="page-section hidden">
        <div class="page-title">الإعدادات</div>

        <!-- Settings Tabs -->
        <div class="inner-tabs" style="margin-bottom:16px">
          <button class="inner-tab active" data-settab="primary">الرقم الأساسي</button>
          <button class="inner-tab" data-settab="contacts">أرقام التنبيهات</button>
          <button class="inner-tab" data-settab="notifSettings">إعدادات التنبيهات</button>
        </div>

        <!-- Primary Number -->
        <div id="settingsPrimary" class="settings-tab-content">
          <div class="settings-section">
            <div class="settings-section-header">📱 تحديث الرقم الأساسي</div>
            <div class="settings-section-body">
              <div id="primaryChangeSummary" class="notif-item" style="margin-bottom:14px">لا يوجد طلب قائم حاليًا.</div>
              <div class="form-group">
                <label class="form-label">الرقم الأساسي الجديد</label>
                <input id="primaryNewMobileInput" class="form-input" placeholder="05xxxxxxxx أو 9665xxxxxxxx" type="tel" inputmode="numeric" />
              </div>
              <button class="btn btn-primary btn-full" id="requestPrimaryChangeOtpBtn">إرسال رمز التحقق</button>
              <div id="primaryChangeRequestMsg" class="alert"></div>
              <div id="primaryChangeOtpStep" class="otp-step hidden">
                <div class="divider"></div>
                <div class="form-group">
                  <label class="form-label">رمز تحقق الرقم الجديد</label>
                  <input id="primaryChangeOtpInput" class="form-input" placeholder="أدخل الرمز" maxlength="6" type="text" inputmode="numeric" />
                </div>
                <button class="btn btn-primary btn-full" id="verifyPrimaryChangeOtpBtn">تأكيد الطلب</button>
                <div id="primaryChangeVerifyMsg" class="alert"></div>
              </div>
            </div>
          </div>
        </div>

        <!-- Extra Contacts -->
        <div id="settingsContacts" class="settings-tab-content hidden">
          <div class="settings-section">
            <div class="settings-section-header">📲 أرقام التنبيهات المرتبطة</div>
            <div class="settings-section-body">
              <div id="extraContactsList"></div>
            </div>
          </div>
          <div class="settings-section">
            <div class="settings-section-header">➕ إضافة رقم تنبيهات إضافي</div>
            <div class="settings-section-body">
              <div class="form-group">
                <label class="form-label">رقم الجوال الإضافي</label>
                <input id="extraMobileInput" class="form-input" placeholder="05xxxxxxxx أو 9665xxxxxxxx" type="tel" inputmode="numeric" />
              </div>
              <div class="form-group">
                <label class="form-label">قناة الاستقبال المفضلة</label>
                <select id="extraChannelSelect" class="form-select">
                  <option value="whatsapp">واتساب</option>
                  <option value="sms">SMS</option>
                </select>
              </div>
              <button class="btn btn-primary btn-full" id="requestExtraOtpBtn">إرسال رمز التحقق</button>
              <div id="extraRequestMsg" class="alert"></div>
              <div id="extraOtpStep" class="otp-step hidden">
                <div class="divider"></div>
                <div class="form-group">
                  <label class="form-label">رمز تحقق الرقم الإضافي</label>
                  <input id="extraOtpInput" class="form-input" placeholder="أدخل الرمز" maxlength="6" type="text" inputmode="numeric" />
                </div>
                <button class="btn btn-primary btn-full" id="verifyExtraOtpBtn">تأكيد الربط</button>
                <div id="extraVerifyMsg" class="alert"></div>
              </div>
            </div>
          </div>
        </div>

        <!-- Notification Settings -->
        <div id="settingsNotif" class="settings-tab-content hidden">
          <div class="settings-section">
            <div class="settings-section-header">🔔 إعدادات التنبيهات</div>
            <div class="settings-section-body">
              <div class="form-group">
                <label class="form-label">القناة المفضلة</label>
                <select id="notifPreferredChannel" class="form-select">
                  <option value="whatsapp">واتساب</option>
                  <option value="sms">SMS</option>
                  <option value="both">كلاهما</option>
                </select>
              </div>
              <div class="form-group">
                <label class="form-label">نطاق الإرسال</label>
                <select id="notifDeliveryScope" class="form-select">
                  <option value="primary_and_extra">الرقم الأساسي + الأرقام الإضافية</option>
                  <option value="primary_only">الرقم الأساسي فقط</option>
                </select>
              </div>
              <div class="divider"></div>
              <div style="font-size:13px;font-weight:800;color:var(--muted);margin-bottom:10px">أنواع التنبيهات</div>
              <div class="settings-row">
                <div><div class="settings-row-label">تنبيهات التأخر الصباحي</div></div>
                <label class="toggle"><input type="checkbox" id="evtLate" /><span class="toggle-slider"></span></label>
              </div>
              <div class="settings-row">
                <div><div class="settings-row-label">تنبيهات الغياب</div></div>
                <label class="toggle"><input type="checkbox" id="evtAbsent" /><span class="toggle-slider"></span></label>
              </div>
              <div class="settings-row">
                <div><div class="settings-row-label">التنبيهات الإيجابية والتميز</div></div>
                <label class="toggle"><input type="checkbox" id="evtPositive" /><span class="toggle-slider"></span></label>
              </div>
              <div class="settings-row">
                <div><div class="settings-row-label">المخالفات والملاحظات السلوكية</div></div>
                <label class="toggle"><input type="checkbox" id="evtNegative" /><span class="toggle-slider"></span></label>
              </div>
              <div class="settings-row">
                <div><div class="settings-row-label">الإعلانات الرسمية للمدرسة</div></div>
                <label class="toggle"><input type="checkbox" id="evtAnnouncements" /><span class="toggle-slider"></span></label>
              </div>
              <div class="settings-row">
                <div><div class="settings-row-label">الملخص الأسبوعي</div></div>
                <label class="toggle"><input type="checkbox" id="sumWeekly" /><span class="toggle-slider"></span></label>
              </div>
              <div class="settings-row">
                <div><div class="settings-row-label">الملخص اليومي</div></div>
                <label class="toggle"><input type="checkbox" id="sumDaily" /><span class="toggle-slider"></span></label>
              </div>
              <div style="margin-top:16px">
                <button class="btn btn-primary btn-full" id="saveNotifSettingsBtn">حفظ الإعدادات</button>
                <div id="notifSettingsMsg" class="alert"></div>
              </div>
            </div>
          </div>
        </div>

      </div>
      <!-- end pageSettings -->

    </div>
    <!-- end pageContent -->

    <!-- Bottom Navigation -->
    <div id="bottomNav">
      <button class="nav-item active" data-page="points">
        <span class="nav-icon">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="12" cy="8" r="6"/>
            <path d="M15.477 12.89L17 22l-5-3-5 3 1.523-9.11"/>
          </svg>
        </span>
        <span>النقاط</span>
      </button>
      <button class="nav-item" data-page="store">
        <span class="nav-icon">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/>
            <line x1="3" y1="6" x2="21" y2="6"/>
            <path d="M16 10a4 4 0 0 1-8 0"/>
          </svg>
        </span>
        <span>المتجر</span>
      </button>
      <button class="nav-item" data-page="notifications">
        <span class="nav-icon">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
            <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
          </svg>
        </span>
        <span>التنبيهات</span>
        <span class="nav-badge hidden" id="notifBadge">0</span>
      </button>
      <button class="nav-item" data-page="settings">
        <span class="nav-icon">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="12" cy="12" r="3"/>
            <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>
          </svg>
        </span>
        <span>الإعدادات</span>
      </button>
    </div>

  </div>
  <!-- end mainApp -->

</div>
<!-- end app -->

<script>
'use strict';
/* ===== UTILITIES ===== */
const tokenKey = 'ideal_parent_token_v2';
const $ = (id) => document.getElementById(id);
const norm = (v) => String(v || '').trim();
function showAlert(id, text, type) {
  const el = $(id);
  if (!el) return;
  el.textContent = text || '';
  el.className = 'alert show alert-' + (type || 'info');
  if (!text) el.className = 'alert';
}
function clearAlert(id) { showAlert(id, '', ''); }
function saveToken(v) { localStorage.setItem(tokenKey, v || ''); }
function getToken() { return localStorage.getItem(tokenKey) || ''; }
function clearToken() { localStorage.removeItem(tokenKey); }

async function api(path, options) {
  options = options || {};
  const headers = Object.assign({ 'Content-Type': 'application/json' }, options.headers || {});
  const res = await fetch(path, Object.assign({}, options, { headers }));
  const data = await res.json().catch(() => ({ ok: false, message: 'تعذر قراءة الاستجابة.' }));
  if (!res.ok || data.ok === false) throw new Error(data.message || 'فشل الطلب');
  return data;
}

/* ===== STATE ===== */
let profileData = null;
let activeNavPage = 'points';
let activePointsTab = 'rewards';
let activeStoreTab = 'catalog';
let activeNotifTab = 'all';
let activeSettingsTab = 'primary';
let activeDaysFilter = 0;
let rewardProposalImageData = '';

/* ===== NAVIGATION ===== */
function navigateTo(page) {
  activeNavPage = page;
  document.querySelectorAll('.page-section').forEach(el => el.classList.add('hidden'));
  document.querySelectorAll('.nav-item').forEach(el => el.classList.remove('active'));
  const pageMap = { points: 'pagePoints', store: 'pageStore', notifications: 'pageNotifications', settings: 'pageSettings' };
  const pageEl = $(pageMap[page]);
  if (pageEl) pageEl.classList.remove('hidden');
  const navEl = document.querySelector('[data-page="' + page + '"]');
  if (navEl) navEl.classList.add('active');
  // عند فتح صفحة التنبيهات: تحديث وقت آخر قراءة وإخفاء الـ badge
  if (page === 'notifications') {
    try { localStorage.setItem('parent_notif_read_at', new Date().toISOString()); } catch(e) {}
    const notifBadge = $('notifBadge');
    if (notifBadge) notifBadge.classList.add('hidden');
  }
}

/* ===== RENDER HELPERS ===== */
function formatDate(str) {
  if (!str) return '—';
  try {
    const d = new Date(str);
    return d.toLocaleDateString('ar-SA', { year: 'numeric', month: 'short', day: 'numeric' });
  } catch(e) { return str; }
}

function filterByDays(items, dateKey, days) {
  if (!days) return items;
  const cutoff = Date.now() - days * 86400000;
  return items.filter(item => {
    const d = new Date(item[dateKey] || item.createdAt || 0);
    return d.getTime() >= cutoff;
  });
}

function renderStudentsList() {
  if (!profileData) return;
  const container = $('studentsList');
  if (!container) return;
  const students = profileData.students || [];
  if (!students.length) {
    container.innerHTML = '<div class="empty-state"><div class="empty-icon">👨‍👩‍👧</div><p>لا يوجد أبناء مرتبطون بهذا الرقم.</p></div>';
    return;
  }
  container.innerHTML = students.map(student => {
    const allActions = student.recentActions || [];
    let actions = allActions;
    if (activeDaysFilter > 0) {
      actions = filterByDays(allActions, 'createdAt', activeDaysFilter);
    }
    const rewards = actions.filter(a => (a.points || 0) > 0);
    const deductions = actions.filter(a => (a.points || 0) < 0);
    const attendance = student.lastAttendance;
    let tabContent = '';
    if (activePointsTab === 'rewards') {
      tabContent = rewards.length
        ? rewards.map(a => renderActionItem(a)).join('')
        : '<div class="empty-state" style="padding:20px"><p>لا توجد مكافآت في هذه الفترة.</p></div>';
    } else if (activePointsTab === 'deductions') {
      tabContent = deductions.length
        ? deductions.map(a => renderActionItem(a)).join('')
        : '<div class="empty-state" style="padding:20px"><p>لا توجد خصومات في هذه الفترة.</p></div>';
    } else {
      tabContent = attendance
        ? '<div class="action-item"><div><div class="action-title">آخر حضور</div><div class="action-meta">' + (attendance.isoDate || '') + ' ' + (attendance.time || '') + ' • ' + (attendance.result || '') + ' • ' + (attendance.gateName || '—') + '</div></div><span class="pill pill-teal">' + (student.attendanceRate || 0) + '%</span></div>'
        : '<div class="empty-state" style="padding:20px"><p>لا يوجد سجل حضور بعد.</p></div>';
    }
    return '<div class="student-card">'
      + '<div class="student-header">'
      + '<div><div class="student-name">' + (student.name || 'طالب') + '</div><div class="student-meta">' + (student.schoolName || '') + ' • ' + (student.className || '—') + '</div></div>'
      + '<div class="student-points-badge"><div class="pts">' + (student.points || 0) + '</div><div class="pts-lbl">نقطة</div></div>'
      + '</div>'
      + '<div class="student-stats">'
      + '<span class="student-stat-chip">الحضور: ' + (student.attendanceRate || 0) + '%</span>'
      + '<span class="student-stat-chip pill ' + (student.status === 'active' ? 'pill-green' : 'pill-slate') + '">' + (student.status || '—') + '</span>'
      + '</div>'
      + tabContent
      + '</div>';
  }).join('');
}

function renderActionItem(a) {
  const pts = a.points || 0;
  const ptsClass = pts > 0 ? 'positive' : 'negative';
  const ptsText = (pts > 0 ? '+' : '') + pts + ' نقطة';
  return '<div class="action-item">'
    + '<div><div class="action-title">' + (a.title || 'إجراء') + '</div>'
    + '<div class="action-meta">' + (a.actorName || '—') + ' • ' + formatDate(a.createdAt) + (a.note ? ' • ' + a.note : '') + '</div></div>'
    + '<span class="action-pts ' + ptsClass + '">' + ptsText + '</span>'
    + '</div>';
}

function renderRewardCatalog() {
  if (!profileData) return;
  const catalog = profileData.rewardCatalog || [];
  const schools = {};
  const studentsBySchool = {};
  (profileData.students || []).forEach(student => {
    const sid = String(student.schoolId || '');
    if (!sid) return;
    if (!schools[sid]) schools[sid] = student.schoolName || ('المدرسة ' + sid);
    if (!studentsBySchool[sid]) studentsBySchool[sid] = [];
    studentsBySchool[sid].push(student);
  });
  const schoolOptions = Object.keys(schools).map(id => '<option value="' + id + '">' + schools[id] + '</option>').join('');
  if ($('rewardProposalSchool')) $('rewardProposalSchool').innerHTML = schoolOptions || '<option value="">لا توجد مدرسة</option>';
  if ($('rewardRedeemSchool')) $('rewardRedeemSchool').innerHTML = schoolOptions || '<option value="">لا توجد مدرسة</option>';
  const catalogEl = $('rewardCatalogList');
  if (catalogEl) {
    catalogEl.innerHTML = catalog.length
      ? catalog.map(item => {
          const img = item.image ? '<img src="' + item.image + '" class="reward-img" alt="' + (item.title || '') + '" />' : '';
          return '<div class="reward-item">' + img
            + '<div class="reward-body">'
            + '<div class="reward-title">' + (item.title || 'جائزة') + '</div>'
            + '<div class="reward-meta">' + (item.schoolName || '') + ' • ' + (item.donorName || (item.source === 'parent' ? 'ولي أمر' : 'إدارة المدرسة')) + '</div>'
            + '<div class="reward-footer">'
            + '<span class="pill pill-teal">' + (item.pointsCost || 0) + ' نقطة</span>'
            + '<span class="pill pill-slate">متبقي: ' + (item.remainingQuantity || 0) + '/' + (item.quantity || 0) + '</span>'
            + '</div>'
            + (item.note ? '<div style="margin-top:8px;font-size:13px;color:var(--muted);line-height:1.7">' + item.note + '</div>' : '')
            + '</div></div>';
        }).join('')
      : '<div class="empty-state"><div class="empty-icon">🎁</div><p>لا توجد جوائز معتمدة في المتجر حتى الآن.</p></div>';
  }
  fillRedeemDropdowns(schools, studentsBySchool, catalog);
  renderStoreHistory();
}

function fillRedeemDropdowns(schools, studentsBySchool, catalog) {
  function fillStudents() {
    const schoolId = $('rewardRedeemSchool') ? $('rewardRedeemSchool').value : '';
    const students = studentsBySchool[schoolId] || [];
    if ($('rewardRedeemStudent')) {
      $('rewardRedeemStudent').innerHTML = students.map(s => '<option value="' + (s.studentId || s.id || '') + '">' + (s.name || 'طالب') + ' — ' + (s.points || 0) + ' نقطة</option>').join('') || '<option value="">لا يوجد طلاب</option>';
    }
    fillItems();
  }
  function fillItems() {
    const schoolId = $('rewardRedeemSchool') ? $('rewardRedeemSchool').value : '';
    const items = catalog.filter(item => String(item.schoolId || '') === String(schoolId || ''));
    if ($('rewardRedeemItem')) {
      $('rewardRedeemItem').innerHTML = items.map(item => '<option value="' + (item.id || '') + '">' + (item.title || 'جائزة') + ' — ' + (item.pointsCost || 0) + ' نقطة</option>').join('') || '<option value="">لا توجد جوائز معتمدة</option>';
    }
  }
  fillStudents();
  if ($('rewardRedeemSchool')) $('rewardRedeemSchool').onchange = fillStudents;
}

function renderStoreHistory() {
  if (!profileData) return;
  const proposals = profileData.rewardProposals || [];
  const redemptions = profileData.rewardRedemptions || [];
  const phEl = $('rewardProposalHistory');
  if (phEl) {
    phEl.innerHTML = proposals.length
      ? proposals.slice(0, 5).map(item => '<div class="notif-item"><div class="notif-header"><div class="notif-title">' + (item.title || 'جائزة') + '</div><span class="pill ' + (item.status === 'approved' ? 'pill-green' : item.status === 'rejected' ? 'pill-red' : 'pill-amber') + '">' + (item.status === 'approved' ? 'قُبل' : item.status === 'rejected' ? 'مرفوض' : 'بانتظار الاعتماد') + '</span></div><div class="notif-meta">' + (item.schoolName || '') + ' • ' + formatDate(item.createdAt) + ' • ' + (item.quantity || 1) + ' قطعة</div>' + (item.decisionNote || item.note ? '<div class="notif-body">' + (item.decisionNote || item.note) + '</div>' : '') + '</div>').join('')
      : '<div class="empty-state" style="padding:20px"><p>لم يتم إرسال مقترحات حتى الآن.</p></div>';
  }
  const rhEl = $('rewardRedeemHistory');
  const rhStoreEl = $('rewardRedeemHistoryStore');
  const redeemHtml = redemptions.length
    ? redemptions.slice(0, 5).map(item => '<div class="notif-item"><div class="notif-header"><div class="notif-title">' + (item.itemTitle || 'جائزة') + '</div><span class="pill ' + (item.status === 'approved' ? 'pill-green' : item.status === 'rejected' ? 'pill-red' : 'pill-amber') + '">' + (item.status === 'approved' ? 'معتمد' : item.status === 'rejected' ? 'مرفوض' : 'بانتظار الاعتماد') + '</span></div><div class="notif-meta">' + (item.studentName || 'طالب') + ' • ' + (item.schoolName || '') + ' • ' + formatDate(item.createdAt) + '</div>' + (item.decisionNote || item.note ? '<div class="notif-body">' + (item.decisionNote || item.note) + '</div>' : '') + '</div>').join('')
    : '<div class="empty-state" style="padding:20px"><p>لم يتم إرسال طلبات استبدال حتى الآن.</p></div>';
  if (rhEl) rhEl.innerHTML = redeemHtml;
  if (rhStoreEl) rhStoreEl.innerHTML = redeemHtml;
}

function renderNotifications() {
  if (!profileData) return;
  const history = profileData.notificationHistory || [];
  const statusFilter = $('historyFilterStatus') ? $('historyFilterStatus').value : 'all';
  const studentFilter = $('historyFilterStudent') ? $('historyFilterStudent').value : 'all';
  // Fill student filter
  const studentOptions = '<option value="all">كل الأبناء</option>' + (profileData.students || []).map(s => '<option value="' + String(s.studentId || s.id || '') + '">' + (s.name || 'طالب') + '</option>').join('');
  if ($('historyFilterStudent')) {
    const cur = $('historyFilterStudent').value;
    $('historyFilterStudent').innerHTML = studentOptions;
    $('historyFilterStudent').value = cur || 'all';
  }
  let filtered = history.filter(item => {
    if (statusFilter === 'success' && String(item.status || '') !== 'نجاح') return false;
    if (statusFilter === 'failed' && String(item.status || '') === 'نجاح') return false;
    if (studentFilter !== 'all' && String(item.studentId || '') !== String(studentFilter)) return false;
    if (activeNotifTab !== 'all' && String(item.channel || '') !== activeNotifTab) return false;
    return true;
  });
  const notifBadge = $('notifBadge');
  // حساب الإشعارات غير المقروءة بناءً على آخر وقت فتح صفحة التنبيهات
  let lastReadAt = '';
  try { lastReadAt = localStorage.getItem('parent_notif_read_at') || ''; } catch(e) {}
  const unread = lastReadAt
    ? history.filter(item => (item.createdAt || item.sentAt || '') > lastReadAt).length
    : history.length;
  if (notifBadge) {
    if (unread > 0 && activeNavPage !== 'notifications') { notifBadge.textContent = unread > 99 ? '99+' : unread; notifBadge.classList.remove('hidden'); }
    else notifBadge.classList.add('hidden');
  }
  const container = $('notifList');
  if (!container) return;
  container.innerHTML = filtered.length
    ? filtered.map(item => {
        // استخراج deltaPoints من body إذا لم يكن محفوظاً (للإشعارات القديمة)
        let effectiveDelta = item.deltaPoints;
        if ((effectiveDelta === null || effectiveDelta === undefined) && item.body) {
          // استخراج الرقم من النمط (+5 نقطة) أو (-3 نقطة) باستخدام split بدلاً من regex
          const _b = String(item.body);
          const _si = _b.indexOf('(');
          if (_si >= 0) {
            const _ei = _b.indexOf(' ', _si + 1);
            const _ns = _ei > _si ? _b.slice(_si + 1, _ei) : _b.slice(_si + 1, _si + 5);
            const _nv = parseFloat(_ns);
            if (!isNaN(_nv)) effectiveDelta = _nv;
          }
        }
        const isReward = String(item.eventType || '').includes('reward') || (effectiveDelta !== null && effectiveDelta !== undefined && Number(effectiveDelta) > 0);
        const isViolation = String(item.eventType || '').includes('violation') || (effectiveDelta !== null && effectiveDelta !== undefined && Number(effectiveDelta) < 0);
        const titleColor = isReward ? '#16a34a' : isViolation ? '#dc2626' : '#0f766e';
        // عرض قيمة النقاط بدلاً من "نجاح"
        let pointsBadge = '';
        if (effectiveDelta !== null && effectiveDelta !== undefined && effectiveDelta !== 0) {
          const pts = Number(effectiveDelta);
          const ptsText = pts > 0 ? '+' + pts : String(pts);
          const ptsColor = pts > 0 ? '#16a34a' : '#dc2626';
          const ptsBg = pts > 0 ? 'rgba(22,163,74,0.1)' : 'rgba(220,38,38,0.1)';
          pointsBadge = '<span style="background:' + ptsBg + ';color:' + ptsColor + ';font-weight:900;font-size:13px;padding:3px 10px;border-radius:999px;border:1.5px solid ' + ptsColor + ';">' + ptsText + '</span>';
        } else {
          const statusOk = item.status === 'نجاح';
          pointsBadge = '<span class="pill ' + (statusOk ? 'pill-green' : 'pill-red') + '">' + (statusOk ? 'نجاح' : (item.status || 'تعثر')) + '</span>';
        }
        return '<div class="notif-item">'
          + '<div class="notif-header">'
          + '<div class="notif-title" style="color:' + titleColor + ';">' + (item.title || 'تنبيه') + '</div>'
          + pointsBadge
          + '</div>'
          + '<div class="notif-body">' + (item.body || '—') + '</div>'
          + '<div class="notif-meta">' + [item.studentName, item.schoolName, item.channel, item.recipientMasked || item.recipient, formatDate(item.sentAt || item.createdAt)].filter(Boolean).join(' • ') + '</div>'
          + (item.reason ? '<div style="margin-top:6px;font-size:12px;color:var(--danger)">سبب التعثر: ' + item.reason + '</div>' : '')
          + '</div>';
      }).join('')
    : '<div class="empty-state"><div class="empty-icon">🔔</div><p>لا توجد تنبيهات مطابقة.</p></div>';
}

function renderExtraContacts() {
  if (!profileData) return;
  const contacts = profileData.extraContacts || [];
  const el = $('extraContactsList');
  if (!el) return;
  el.innerHTML = contacts.length
    ? contacts.map(item => '<div class="contact-row"><div class="contact-info"><div class="contact-num">' + (item.mobileMasked || item.mobile || '') + '</div><div class="contact-meta">' + (item.label || 'رقم إضافي') + ' • ' + (item.channel || 'whatsapp') + ' • ' + formatDate(item.verifiedAt) + '</div></div><span class="pill pill-teal">موثّق ✓</span></div>').join('')
    : '<div class="empty-state" style="padding:20px"><p>لا توجد أرقام إضافية مرتبطة حتى الآن.</p></div>';
}

function renderNotificationSettings() {
  if (!profileData) return;
  const settings = profileData.notificationSettings || {};
  const ch = $('notifPreferredChannel');
  const sc = $('notifDeliveryScope');
  if (ch) ch.value = settings.preferredChannel || 'whatsapp';
  if (sc) sc.value = settings.deliveryScope || 'primary_and_extra';
  const evts = settings.events || {};
  const sums = settings.summaries || {};
  ['evtLate','evtAbsent','evtPositive','evtNegative','evtAnnouncements'].forEach(id => {
    const el = $(id); if (el) el.checked = !!evts[id.replace('evt','').toLowerCase()];
  });
  const sumDaily = $('sumDaily'); if (sumDaily) sumDaily.checked = !!sums.daily;
  const sumWeekly = $('sumWeekly'); if (sumWeekly) sumWeekly.checked = !!sums.weekly;
}

function renderPrimaryChangeRequest() {
  if (!profileData) return;
  const req = profileData.primaryChangeRequest;
  const el = $('primaryChangeSummary');
  if (!el) return;
  if (!req) { el.innerHTML = 'لا يوجد طلب قائم حاليًا.'; return; }
  const statusText = req.status === 'pending' ? 'بانتظار الاعتماد' : (req.status || 'pending');
  el.innerHTML = '<div style="font-weight:800">' + (req.requestedMobileMasked || req.requestedMobile || '—') + '</div>'
    + '<div style="font-size:12px;color:var(--muted);margin-top:4px">الحالة: ' + statusText + ' • ' + formatDate(req.requestedAt) + '</div>'
    + (req.note ? '<div style="font-size:12px;margin-top:4px">' + req.note + '</div>' : '');
}

let _pointsChartInstance = null;
function renderPointsChart(profile) {
  const canvas = $('pointsChart');
  if (!canvas || typeof Chart === 'undefined') return;
  // جمع كل الإجراءات من جميع الأبناء
  const allActions = [];
  (profile.students || []).forEach(s => {
    (s.recentActions || []).forEach(a => allActions.push(a));
  });
  if (!allActions.length) {
    const section = $('pointsChartSection');
    if (section) section.style.display = 'none';
    return;
  }
  const section = $('pointsChartSection');
  if (section) section.style.display = '';
  // بناء بيانات آخر 7 أيام
  const days = 7;
  const labels = [];
  const rewardsData = [];
  const deductionsData = [];
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const dayStr = d.toISOString().slice(0, 10);
    const dayLabel = d.toLocaleDateString('ar-SA', { weekday: 'short', month: 'numeric', day: 'numeric' });
    labels.push(dayLabel);
    let rewards = 0, deductions = 0;
    allActions.forEach(a => {
      // استخدام createdAt أو isoDate كبديل
      const dateStr = (a.createdAt || a.isoDate || '').slice(0, 10);
      if (!dateStr || dateStr !== dayStr) return;
      const pts = Number(a.points || a.deltaPoints || 0);
      if (pts > 0) rewards += pts;
      else if (pts < 0) deductions += Math.abs(pts);
    });
    rewardsData.push(rewards);
    deductionsData.push(deductions);
  }
  if (_pointsChartInstance) { _pointsChartInstance.destroy(); _pointsChartInstance = null; }
  _pointsChartInstance = new Chart(canvas, {
    type: 'bar',
    data: {
      labels,
      datasets: [
        {
          label: 'مكافآت',
          data: rewardsData,
          backgroundColor: 'rgba(15,118,110,0.7)',
          borderRadius: 6,
          borderSkipped: false,
        },
        {
          label: 'خصومات',
          data: deductionsData,
          backgroundColor: 'rgba(239,68,68,0.65)',
          borderRadius: 6,
          borderSkipped: false,
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: {
          rtl: true,
          titleFont: { family: 'Tajawal', size: 12 },
          bodyFont: { family: 'Tajawal', size: 12 },
        }
      },
      scales: {
        x: {
          grid: { display: false },
          ticks: { font: { family: 'Tajawal', size: 10 }, color: '#94a3b8' }
        },
        y: {
          beginAtZero: true,
          grid: { color: 'rgba(148,163,184,0.15)' },
          ticks: { font: { family: 'Tajawal', size: 10 }, color: '#94a3b8', stepSize: 5 }
        }
      }
    }
  });
}
function renderProfile(profile) {
  profileData = profile;
  // Header
  const headerName = $('headerName');
  if (headerName) headerName.textContent = profile.guardianName || 'ولي الأمر';
  // Stats
  const sp = $('statTotalPoints'); if (sp) sp.textContent = profile.totalPoints || 0;
  const sa = $('statAttendance'); if (sa) sa.textContent = (profile.avgAttendance || 0) + '%';
  const ss = $('statStudents'); if (ss) ss.textContent = profile.studentsCount || 0;
  const sc = $('statSchools'); if (sc) sc.textContent = profile.schoolsCount || 0;
  // Render all sections
  renderStudentsList();
  renderRewardCatalog();
  renderNotifications();
  renderExtraContacts();
  renderNotificationSettings();
  renderPrimaryChangeRequest();
  renderPointsChart(profile);
  // Show main app
  $('loginScreen').classList.add('hidden');
  $('mainApp').classList.remove('hidden');
  $('mainApp').style.display = 'flex';
  // تشغيل فحص التنبيهات الفورية
  if (typeof startNotificationPolling === 'function') startNotificationPolling();
}

/* ===== BOOTSTRAP ===== */
async function bootstrapParent() {
  const token = getToken();
  if (!token) return;
  try {
    const data = await api('/api/parent/bootstrap', { headers: { 'X-Session-Token': token } });
    renderProfile(data.profile || {});
  } catch(e) {
    // لا نمسح التوكن إلا إذا كانت الجلسة منتهية فعلاً (401) وليس خطأ شبكة مؤقت
    const isAuthError = e && (String(e.message || '').includes('غير صالحة') || String(e.message || '').includes('منتهية') || String(e.message || '').includes('401'));
    if (isAuthError) {
      clearToken();
    }
    // في حالة خطأ الشبكة: نبقي التوكن ونعرض رسالة خطأ مؤقتة
  }
}

/* ===== LOGIN EVENTS ===== */
$('requestOtpBtn').onclick = async function() {
  const mobile = norm($('mobileInput').value);
  this.disabled = true;
  clearAlert('requestMsg');
  try {
    const data = await api('/api/parent/request-otp', { method: 'POST', body: JSON.stringify({ mobile }) });
    let msg = data.message || 'تم إرسال الرمز.';
    if (data.previewCode) {
      // عرض الرمز في المربع الكبير الواضح
      const box = $('previewCodeBox');
      const display = $('previewCodeDisplay');
      if (box && display) {
        display.textContent = data.previewCode;
        box.style.display = 'block';
      }
      // ملء حقل الإدخال تلقائياً
      const otpInput = $('otpInput');
      if (otpInput) otpInput.value = data.previewCode;
      msg = 'وضع تجريبي: الرمز يظهر أدناه مباشرة.';
    }
    showAlert('requestMsg', msg, 'success');
    $('otpStep').classList.remove('hidden');
  } catch(e) { showAlert('requestMsg', e.message || 'تعذر إرسال الرمز.', 'error'); }
  finally { this.disabled = false; }
};
$('resendOtpBtn').onclick = function() { $('requestOtpBtn').click(); };
$('verifyOtpBtn').onclick = async function() {
  const mobile = norm($('mobileInput').value);
  const code = norm($('otpInput').value);
  this.disabled = true;
  clearAlert('verifyMsg');
  try {
    const data = await api('/api/parent/verify-otp', { method: 'POST', body: JSON.stringify({ mobile, code }) });
    saveToken(data.token || '');
    renderProfile(data.profile || {});
  } catch(e) { showAlert('verifyMsg', e.message || 'تعذر التحقق.', 'error'); }
  finally { this.disabled = false; }
};

/* ===== HEADER EVENTS ===== */
$('refreshBtn').onclick = bootstrapParent;
$('logoutBtn').onclick = async function() {
  try { await api('/api/parent/logout', { method: 'POST', headers: { 'X-Session-Token': getToken() } }); } catch(e) {}
  clearToken();
  location.reload();
};

/* ===== BOTTOM NAV ===== */
document.querySelectorAll('.nav-item').forEach(btn => {
  btn.addEventListener('click', () => navigateTo(btn.dataset.page));
});

/* ===== POINTS INNER TABS ===== */
document.querySelectorAll('[data-ptab]').forEach(btn => {
  btn.addEventListener('click', () => {
    activePointsTab = btn.dataset.ptab;
    document.querySelectorAll('[data-ptab]').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    renderStudentsList();
  });
});

/* ===== TIME FILTER ===== */
document.querySelectorAll('[data-days]').forEach(btn => {
  btn.addEventListener('click', () => {
    activeDaysFilter = parseInt(btn.dataset.days, 10);
    document.querySelectorAll('[data-days]').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    renderStudentsList();
  });
});

/* ===== STORE TABS ===== */
document.querySelectorAll('[data-stab]').forEach(btn => {
  btn.addEventListener('click', () => {
    activeStoreTab = btn.dataset.stab;
    document.querySelectorAll('[data-stab]').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    document.querySelectorAll('.store-tab-content').forEach(el => el.classList.add('hidden'));
    const tabMap = { catalog: 'storeCatalog', redeem: 'storeRedeem', propose: 'storePropose', history: 'storeHistory' };
    const el = $(tabMap[activeStoreTab]);
    if (el) el.classList.remove('hidden');
  });
});

/* ===== NOTIF TABS ===== */
document.querySelectorAll('[data-ntab]').forEach(btn => {
  btn.addEventListener('click', () => {
    activeNotifTab = btn.dataset.ntab;
    document.querySelectorAll('[data-ntab]').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    renderNotifications();
  });
});
['historyFilterStatus','historyFilterStudent'].forEach(id => {
  const el = $(id);
  if (el) el.onchange = renderNotifications;
});

/* ===== SETTINGS TABS ===== */
document.querySelectorAll('[data-settab]').forEach(btn => {
  btn.addEventListener('click', () => {
    activeSettingsTab = btn.dataset.settab;
    document.querySelectorAll('[data-settab]').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    document.querySelectorAll('.settings-tab-content').forEach(el => el.classList.add('hidden'));
    const tabMap = { primary: 'settingsPrimary', contacts: 'settingsContacts', notifSettings: 'settingsNotif' };
    const el = $(tabMap[activeSettingsTab]);
    if (el) el.classList.remove('hidden');
  });
});

/* ===== EXTRA CONTACT ===== */
$('requestExtraOtpBtn').onclick = async function() {
  const mobile = norm($('extraMobileInput').value);
  const channel = $('extraChannelSelect').value;
  this.disabled = true;
  clearAlert('extraRequestMsg');
  try {
    const data = await api('/api/parent/add-contact/request-otp', { method: 'POST', headers: { 'X-Session-Token': getToken() }, body: JSON.stringify({ mobile, channel }) });
    let msg = data.message || 'تم إرسال الرمز.';
    if (data.previewCode) msg += ' (للاختبار: ' + data.previewCode + ')';
    showAlert('extraRequestMsg', msg, 'success');
    $('extraOtpStep').classList.remove('hidden');
  } catch(e) { showAlert('extraRequestMsg', e.message || 'تعذر إرسال الرمز.', 'error'); }
  finally { this.disabled = false; }
};
$('verifyExtraOtpBtn').onclick = async function() {
  const mobile = norm($('extraMobileInput').value);
  const code = norm($('extraOtpInput').value);
  const channel = $('extraChannelSelect').value;
  this.disabled = true;
  clearAlert('extraVerifyMsg');
  try {
    const data = await api('/api/parent/add-contact/verify-otp', { method: 'POST', headers: { 'X-Session-Token': getToken() }, body: JSON.stringify({ mobile, code, channel }) });
    showAlert('extraVerifyMsg', data.message || 'تم ربط الرقم الإضافي بنجاح.', 'success');
    if (data.profile) renderProfile(data.profile);
    $('extraMobileInput').value = '';
    $('extraOtpInput').value = '';
    $('extraOtpStep').classList.add('hidden');
  } catch(e) { showAlert('extraVerifyMsg', e.message || 'تعذر توثيق الرقم.', 'error'); }
  finally { this.disabled = false; }
};

/* ===== PRIMARY CHANGE ===== */
$('requestPrimaryChangeOtpBtn').onclick = async function() {
  const mobile = norm($('primaryNewMobileInput').value);
  this.disabled = true;
  clearAlert('primaryChangeRequestMsg');
  try {
    const data = await api('/api/parent/change-primary/request-otp', { method: 'POST', headers: { 'X-Session-Token': getToken() }, body: JSON.stringify({ mobile }) });
    let msg = data.message || 'تم إرسال الرمز للرقم الجديد.';
    if (data.previewCode) msg += ' (للاختبار: ' + data.previewCode + ')';
    showAlert('primaryChangeRequestMsg', msg, 'success');
    $('primaryChangeOtpStep').classList.remove('hidden');
  } catch(e) { showAlert('primaryChangeRequestMsg', e.message || 'تعذر إرسال الرمز.', 'error'); }
  finally { this.disabled = false; }
};
$('verifyPrimaryChangeOtpBtn').onclick = async function() {
  const mobile = norm($('primaryNewMobileInput').value);
  const code = norm($('primaryChangeOtpInput').value);
  this.disabled = true;
  clearAlert('primaryChangeVerifyMsg');
  try {
    const data = await api('/api/parent/change-primary/verify-otp', { method: 'POST', headers: { 'X-Session-Token': getToken() }, body: JSON.stringify({ mobile, code }) });
    showAlert('primaryChangeVerifyMsg', data.message || 'تم رفع الطلب بنجاح.', 'success');
    if (data.profile) renderProfile(data.profile);
    $('primaryChangeOtpInput').value = '';
    $('primaryChangeOtpStep').classList.add('hidden');
  } catch(e) { showAlert('primaryChangeVerifyMsg', e.message || 'تعذر توثيق الرقم الجديد.', 'error'); }
  finally { this.disabled = false; }
};

/* ===== NOTIFICATION SETTINGS ===== */
function collectNotificationSettings() {
  return {
    preferredChannel: $('notifPreferredChannel').value || 'whatsapp',
    deliveryScope: $('notifDeliveryScope').value || 'primary_and_extra',
    events: {
      late: !!$('evtLate').checked,
      absent: !!$('evtAbsent').checked,
      positive: !!$('evtPositive').checked,
      negative: !!$('evtNegative').checked,
      announcements: !!$('evtAnnouncements').checked,
    },
    summaries: { daily: !!$('sumDaily').checked, weekly: !!$('sumWeekly').checked }
  };
}
$('saveNotifSettingsBtn').onclick = async function() {
  this.disabled = true;
  clearAlert('notifSettingsMsg');
  try {
    const data = await api('/api/parent/notification-settings', { method: 'POST', headers: { 'X-Session-Token': getToken() }, body: JSON.stringify(collectNotificationSettings()) });
    showAlert('notifSettingsMsg', data.message || 'تم حفظ الإعدادات بنجاح.', 'success');
    if (data.profile) renderProfile(data.profile);
  } catch(e) { showAlert('notifSettingsMsg', e.message || 'تعذر حفظ الإعدادات.', 'error'); }
  finally { this.disabled = false; }
};

/* ===== REWARD PROPOSAL ===== */
$('rewardProposalImage').onchange = async function(e) {
  const file = e.target.files && e.target.files[0];
  if (!file) { rewardProposalImageData = ''; return; }
  rewardProposalImageData = await new Promise(resolve => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ''));
    reader.readAsDataURL(file);
  });
};
$('submitRewardProposalBtn').onclick = async function() {
  this.disabled = true;
  clearAlert('rewardProposalMsg');
  try {
    const data = await api('/api/parent/reward-proposals', { method: 'POST', headers: { 'X-Session-Token': getToken() }, body: JSON.stringify({
      schoolId: $('rewardProposalSchool').value,
      title: $('rewardProposalTitle').value,
      quantity: $('rewardProposalQuantity').value,
      donorName: $('rewardProposalDonorName').value,
      showDonorName: $('rewardProposalShowDonor').checked,
      note: $('rewardProposalNote').value,
      image: rewardProposalImageData
    })});
    showAlert('rewardProposalMsg', data.message || 'تم إرسال المقترح.', 'success');
    rewardProposalImageData = '';
    $('rewardProposalTitle').value = ''; $('rewardProposalQuantity').value = '1';
    $('rewardProposalDonorName').value = ''; $('rewardProposalShowDonor').checked = true;
    $('rewardProposalNote').value = ''; $('rewardProposalImage').value = '';
    if (data.profile) renderProfile(data.profile);
  } catch(e) { showAlert('rewardProposalMsg', e.message || 'تعذر إرسال المقترح.', 'error'); }
  finally { this.disabled = false; }
};

/* ===== REWARD REDEEM ===== */
$('submitRewardRedeemBtn').onclick = async function() {
  this.disabled = true;
  clearAlert('rewardRedeemMsg');
  try {
    const data = await api('/api/parent/reward-redemptions', { method: 'POST', headers: { 'X-Session-Token': getToken() }, body: JSON.stringify({
      schoolId: $('rewardRedeemSchool').value,
      studentId: $('rewardRedeemStudent').value,
      itemId: $('rewardRedeemItem').value,
      note: $('rewardRedeemNote').value
    })});
    showAlert('rewardRedeemMsg', data.message || 'تم إرسال طلب الاستبدال.', 'success');
    $('rewardRedeemNote').value = '';
    if (data.profile) renderProfile(data.profile);
  } catch(e) { showAlert('rewardRedeemMsg', e.message || 'تعذر إرسال طلب الاستبدال.', 'error'); }
  finally { this.disabled = false; }
};

/* ===== تسجيل الدخول البديل ===== */
function toggleAltLogin() {
  const sec = $('altLoginSection');
  const btn = $('showAltLoginBtn');
  if (sec.style.display === 'none') {
    sec.style.display = 'block';
    btn.textContent = 'إخفاء طريقة الدخول البديلة';
    btn.style.color = '#0f766e';
    btn.style.borderColor = '#0f766e';
  } else {
    sec.style.display = 'none';
    btn.textContent = 'دخول برقم الجوال + رقم هوية الطالب';
    btn.style.color = '#64748b';
    btn.style.borderColor = '#e2e8f0';
  }
}

async function doAltLogin() {
  const mobile = norm($('altMobileInput').value);
  const nationalId = String($('altNationalIdInput').value || '').trim();
  const btn = $('altLoginBtn');
  clearAlert('altLoginMsg');
  if (!mobile) return showAlert('altLoginMsg', 'أدخل رقم الجوال أولاً.', 'error');
  if (!nationalId) return showAlert('altLoginMsg', 'أدخل رقم هوية الطالب.', 'error');
  btn.disabled = true;
  try {
    const data = await api('/api/parent/alt-login/request', { method: 'POST', body: JSON.stringify({ mobile, nationalId }) });
    showAlert('altLoginMsg', data.message || 'تم التحقق بنجاح.', 'success');
    if (data.previewCode) {
      const box = $('altPreviewCodeBox');
      $('altPreviewCodeDisplay').textContent = data.previewCode.split('').join(' ');
      box.style.display = 'block';
      $('altOtpInput').value = data.previewCode;
    }
    $('altOtpStep').style.display = 'block';
    $('altOtpInput').focus();
  } catch(e) {
    showAlert('altLoginMsg', e.message || 'تعذر التحقق. تأكد من صحة البيانات.', 'error');
  } finally { btn.disabled = false; }
}

async function doAltVerify() {
  const mobile = norm($('altMobileInput').value);
  const code = String($('altOtpInput').value || '').trim();
  const btn = $('altVerifyBtn');
  clearAlert('altVerifyMsg');
  if (!code) return showAlert('altVerifyMsg', 'أدخل رمز التحقق.', 'error');
  btn.disabled = true;
  try {
    const data = await api('/api/parent/verify-otp', { method: 'POST', body: JSON.stringify({ mobile, code }) });
    saveToken(data.token);
    renderProfile(data.profile || {});
  } catch(e) {
    showAlert('altVerifyMsg', e.message || 'رمز غير صحيح أو منتهي الصلاحية.', 'error');
  } finally { btn.disabled = false; }
}

/* ===== PWA INSTALL GATE ===== */
(function() {
  // كشف ما إذا كان التطبيق مفتوحاً كـ standalone (من الشاشة الرئيسية)
  const isStandalone = window.matchMedia('(display-mode: standalone)').matches
    || window.navigator.standalone === true
    || document.referrer.includes('android-app://');

  // كشف نوع الجهاز والمتصفح
  const ua = navigator.userAgent || '';
  const isIOS = /iphone|ipad|ipod/i.test(ua);
  const isAndroid = /android/i.test(ua);
  const isMobile = isIOS || isAndroid;
  const isSafari = /^((?!chrome|android).)*safari/i.test(ua);
  const isChrome = /chrome/i.test(ua) && !/edge|opr/i.test(ua);

  // إذا كان على سطح المكتب أو مفتوحاً كـ standalone، لا نُظهر الشاشة
  if (isStandalone || !isMobile) return;

  // التحقق من أن المستخدم لم يتخطَّ الشاشة مسبقاً (تخطي مؤقت)
  const skipKey = 'pwa_gate_skipped';
  const skipped = sessionStorage.getItem(skipKey);
  if (skipped) return;

  // بناء الخطوات حسب نوع الجهاز
  const stepsContainer = document.getElementById('pwaGateSteps');
  const gateEl = document.getElementById('pwaGate');
  const noteEl = document.getElementById('pwaGateNote');

  let stepsHtml = '';
  if (isIOS) {
    stepsHtml = [
      { num: '1', icon: String.fromCodePoint(0x1F4E4), title: 'اضغط زر المشاركة', desc: 'الزر الموجود في شريط المتصفح أسفل الشاشة (مربع بسهم للأعلى)' },
      { num: '2', icon: String.fromCodePoint(0x2795), title: 'اختر "إضافة إلى الشاشة الرئيسية"', desc: 'مرر للأسفل في قائمة المشاركة حتى تجد هذا الخيار' },
      { num: '3', icon: String.fromCodePoint(0x1F3E0), title: 'افتح التطبيق من أيقونته', desc: 'ستجد أيقونة بوابة ولي الأمر على شاشتك الرئيسية' },
    ].map(s => '<div class="pwa-step"><div class="pwa-step-num">' + s.num + '</div><div class="pwa-step-text"><strong>' + s.title + '</strong><span>' + s.desc + '</span></div><div class="pwa-step-icon">' + s.icon + '</div></div>').join('');
    noteEl.textContent = 'يجب استخدام متصفح Safari لإضافة التطبيق للشاشة الرئيسية على iPhone/iPad';
    if (!isSafari) {
      noteEl.style.background = '#fff1f2';
      noteEl.style.borderColor = '#be123c';
      noteEl.style.color = '#9f1239';
      noteEl.textContent = String.fromCodePoint(0x26A0) + ' يجب فتح هذا الرابط في متصفح Safari (وليس Chrome أو غيره) لتتمكن من تثبيت التطبيق على iPhone/iPad';
    }
  } else if (isAndroid) {
    stepsHtml = [
      { num: '1', icon: String.fromCodePoint(0x22EE), title: 'افتح قائمة المتصفح', desc: 'اضغط على النقاط الثلاث في أعلى يمين المتصفح' },
      { num: '2', icon: String.fromCodePoint(0x2795), title: 'اختر "إضافة إلى الشاشة الرئيسية"', desc: 'أو "تثبيت التطبيق" إذا ظهر هذا الخيار' },
      { num: '3', icon: String.fromCodePoint(0x1F3E0), title: 'افتح التطبيق من أيقونته', desc: 'ستجد أيقونة بوابة ولي الأمر على شاشتك الرئيسية' },
    ].map(s => '<div class="pwa-step"><div class="pwa-step-num">' + s.num + '</div><div class="pwa-step-text"><strong>' + s.title + '</strong><span>' + s.desc + '</span></div><div class="pwa-step-icon">' + s.icon + '</div></div>').join('');
  }

  stepsContainer.innerHTML = stepsHtml;
  gateEl.style.display = 'flex';
})();

function _pwaGateSkip() {
  sessionStorage.setItem('pwa_gate_skipped', '1');
  document.getElementById('pwaGate').style.display = 'none';
}

/* ===== تحميل إعدادات البوابة لإخفاء/إظهار الدخول البديل ===== */
async function loadPortalConfig() {
  try {
    const data = await fetch('/api/parent/portal-config').then((r) => r.json());
    const altBtn = $('showAltLoginBtn');
    const altSep = altBtn ? altBtn.parentElement : null;
    if (altBtn && altSep) {
      if (data.altLoginEnabled === false) {
        altSep.style.display = 'none';
      } else {
        altSep.style.display = '';
      }
    }
  } catch(e) { /* في حال فشل التحميل نترك الزر ظاهراً */ }
}

/* ===== INIT ===== */
loadPortalConfig();
bootstrapParent();

/* ===== نظام الإشعارات الفورية مع صوت منبه احترافي ===== */
let _lastNotifTimestamp = null;
let _notifPollingInterval = null;
let _audioCtx = null;
function getAudioContext() {
  if (!_audioCtx) {
    try { _audioCtx = new (window.AudioContext || window.webkitAudioContext)(); } catch(e) {}
  }
  if (_audioCtx && _audioCtx.state === 'suspended') {
    _audioCtx.resume().catch(() => {});
  }
  return _audioCtx;
}
// تفعيل AudioContext عند أول تفاعل مع الصفحة مع تشغيل صوت صامت لفتح قناة الصوت
function _unlockAudio() {
  const ctx = getAudioContext();
  if (!ctx) return;
  // تشغيل نغمة صامتة جداً لـ "unlock" قناة الصوت في المتصفح
  try {
    const buf = ctx.createBuffer(1, 1, 22050);
    const src = ctx.createBufferSource();
    src.buffer = buf;
    src.connect(ctx.destination);
    src.start(0);
  } catch(e) {}
}
document.addEventListener('click', function initAudio() { _unlockAudio(); }, { once: true });
document.addEventListener('touchstart', function initAudioTouch() { _unlockAudio(); }, { once: true });
document.addEventListener('touchend', function initAudioTouchEnd() { _unlockAudio(); }, { once: true });

// صوت منبه احترافي ناعم بدون ملف خارجي
function playNotificationSound(type) {
  const ctx = getAudioContext();
  if (!ctx) return;
  // ضمان تشغيل الـ AudioContext إذا كان معلقاً
  const doPlay = () => {
    try {
      const now = ctx.currentTime;
      _playNotifSoundCore(ctx, type, now);
    } catch(e) {}
  };
  if (ctx.state === 'suspended') {
    ctx.resume().then(doPlay).catch(() => {});
  } else {
    doPlay();
  }
}
function _playNotifSoundCore(ctx, type, now) {
  try {
    const master = ctx.createGain();
    master.gain.setValueAtTime(0, now);
    master.gain.linearRampToValueAtTime(0.18, now + 0.01);
    master.gain.exponentialRampToValueAtTime(0.001, now + 1.2);
    master.connect(ctx.destination);
    if (type === 'reward') {
      // نغمتان متصاعدتان ناعمتان
      [523.25, 659.25].forEach((freq, i) => {
        const osc = ctx.createOscillator();
        const g = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now + i * 0.18);
        g.gain.setValueAtTime(0.6, now + i * 0.18);
        g.gain.exponentialRampToValueAtTime(0.001, now + i * 0.18 + 0.5);
        osc.connect(g);
        g.connect(master);
        osc.start(now + i * 0.18);
        osc.stop(now + i * 0.18 + 0.5);
      });
    } else {
      // نغمة واحدة هادئة
      const osc = ctx.createOscillator();
      const g = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(440, now);
      osc.frequency.exponentialRampToValueAtTime(330, now + 0.4);
      g.gain.setValueAtTime(0.5, now);
      g.gain.exponentialRampToValueAtTime(0.001, now + 0.8);
      osc.connect(g);
      g.connect(master);
      osc.start(now);
      osc.stop(now + 0.8);
    }
  } catch(e) {}
}

// عرض بانر إشعار فوري
function showInAppNotification(title, body, type) {
  let banner = document.getElementById('inAppNotifBanner');
  if (!banner) {
    banner = document.createElement('div');
    banner.id = 'inAppNotifBanner';
    banner.style.cssText = 'position:fixed;top:16px;right:16px;left:16px;z-index:9999;max-width:420px;margin:0 auto;background:linear-gradient(135deg,#0f766e,#0d9488);color:#fff;border-radius:20px;padding:16px 18px;box-shadow:0 8px 32px rgba(15,118,110,0.35);font-family:Tajawal,sans-serif;direction:rtl;display:none;transition:all 0.3s ease;';
    document.body.appendChild(banner);
  }
  const icon = type === 'reward' ? '⭐' : type === 'violation' ? '⚠️' : '🔔';
  banner.innerHTML = '<div style="display:flex;align-items:flex-start;gap:12px"><div style="font-size:24px;flex-shrink:0">' + icon + '</div><div style="flex:1"><div style="font-weight:800;font-size:15px;margin-bottom:4px">' + (title || 'تنبيه جديد') + '</div><div style="font-size:13px;opacity:0.9;line-height:1.5">' + (body || '') + '</div></div><button id="notifBannerClose" style="background:rgba(255,255,255,0.2);border:0;color:#fff;border-radius:50%;width:28px;height:28px;cursor:pointer;font-size:16px;flex-shrink:0">×</button></div>';
  const closeBtn = document.getElementById('notifBannerClose');
  if (closeBtn) closeBtn.onclick = function() { banner.style.display = 'none'; };
  if (type === 'violation') banner.style.background = 'linear-gradient(135deg,#be123c,#e11d48)';
  else banner.style.background = 'linear-gradient(135deg,#0f766e,#0d9488)';
  banner.style.display = 'block';
  banner.style.opacity = '0';
  banner.style.transform = 'translateY(-20px)';
  requestAnimationFrame(() => {
    banner.style.transition = 'all 0.4s cubic-bezier(0.34,1.56,0.64,1)';
    banner.style.opacity = '1';
    banner.style.transform = 'translateY(0)';
  });
  clearTimeout(banner._hideTimeout);
  banner._hideTimeout = setTimeout(() => {
    banner.style.opacity = '0';
    banner.style.transform = 'translateY(-20px)';
    setTimeout(() => { banner.style.display = 'none'; }, 400);
  }, 5000);
}

async function pollNewNotifications() {
  const token = getToken();
  if (!token || !profileData) return;
  try {
    const data = await api('/api/parent/bootstrap', { headers: { 'X-Session-Token': token } });
    const profile = data.profile || {};
    const history = profile.notificationHistory || [];
    if (history.length && _lastNotifTimestamp !== null) {
      const newest = history[0];
      const newestTime = newest?.createdAt || newest?.sentAt || '';
      if (newestTime && newestTime > _lastNotifTimestamp) {
        // تنبيهات جديدة
        const newOnes = history.filter(n => (n.createdAt || n.sentAt || '') > _lastNotifTimestamp);
        newOnes.forEach((n, i) => {
          setTimeout(() => {
            const type = String(n.eventType || '').includes('violation') ? 'violation' : String(n.eventType || '').includes('reward') ? 'reward' : 'info';
            playNotificationSound(type);
            showInAppNotification(n.title, n.body, type);
          }, i * 800);
        });
        // تحديث البيانات
        profileData = profile;
        renderNotifications();
        const sp = $('statTotalPoints'); if (sp) sp.textContent = profile.totalPoints || 0;
        renderPointsChart(profile);
        // تحديث شارة التنبيهات بناءً على آخر وقت قراءة
        const notifBadge = $('notifBadge');
        if (notifBadge) {
          let lastReadAt = '';
          try { lastReadAt = localStorage.getItem('parent_notif_read_at') || ''; } catch(e) {}
          const unread = lastReadAt
            ? history.filter(item => (item.createdAt || item.sentAt || '') > lastReadAt).length
            : history.length;
          if (unread > 0 && activeNavPage !== 'notifications') { notifBadge.textContent = unread > 99 ? '99+' : unread; notifBadge.classList.remove('hidden'); }
          else notifBadge.classList.add('hidden');
        }
      }
      _lastNotifTimestamp = newestTime || _lastNotifTimestamp;
    } else if (history.length && _lastNotifTimestamp === null) {
      _lastNotifTimestamp = history[0]?.createdAt || history[0]?.sentAt || new Date().toISOString();
    }
  } catch(e) {}
}

function startNotificationPolling() {
  if (_notifPollingInterval) clearInterval(_notifPollingInterval);
  _lastNotifTimestamp = null;
  // تهيئة الطابع الزمني الأول
  setTimeout(() => {
    const history = profileData?.notificationHistory || [];
    _lastNotifTimestamp = history[0]?.createdAt || history[0]?.sentAt || new Date().toISOString();
  }, 500);
  // فحص كل 10 ثوانٍ لتسريع التنبيهات
  _notifPollingInterval = setInterval(pollNewNotifications, 10000);
}

// تشغيل الفحص بعد تحميل البيانات - يُستدعى من داخل renderProfile الأصلية

/* ===== PWA: Service Worker Registration ===== */
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/public/parent-sw.js', { scope: '/parent' })
      .then(reg => console.log('[PWA] Service Worker registered:', reg.scope))
      .catch(err => console.warn('[PWA] SW registration failed:', err));
  });
}

/* ===== PWA: Install Banner ===== */
let deferredPrompt = null;
window.addEventListener('beforeinstallprompt', (e) => {
  e.preventDefault();
  deferredPrompt = e;
  // Show install banner
  const banner = document.getElementById('installBanner');
  if (banner) banner.style.display = 'flex';
});
document.addEventListener('click', (e) => {
  if (e.target && e.target.id === 'installBtn') {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      deferredPrompt.userChoice.then(() => { deferredPrompt = null; });
      const banner = document.getElementById('installBanner');
      if (banner) banner.style.display = 'none';
    }
  }
  if (e.target && e.target.id === 'dismissInstallBtn') {
    const banner = document.getElementById('installBanner');
    if (banner) banner.style.display = 'none';
  }
});
window.addEventListener('appinstalled', () => {
  const banner = document.getElementById('installBanner');
  if (banner) banner.style.display = 'none';
  deferredPrompt = null;
});
</script>
</body>
</html>
`;
}




function renderParentRequestsAdminHtml() {
  return `<!doctype html>
<html lang="ar" dir="rtl">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>اعتماد طلبات أولياء الأمور - منصة الشركة المثالية</title>
  <link href="https://fonts.googleapis.com/css2?family=Tajawal:wght@400;500;700;800;900&display=swap" rel="stylesheet" />
  <style>
    :root{--bg:#f8fafc;--card:#fff;--line:#e2e8f0;--text:#0f172a;--muted:#64748b;--primary:#0f766e;--danger:#be123c;--ok:#166534}
    *{box-sizing:border-box}body{margin:0;font-family:'Tajawal',system-ui,sans-serif;background:linear-gradient(180deg,#f8fafc,#eef6ff);color:var(--text)}
    .wrap{max-width:1180px;margin:0 auto;padding:24px}.hero{background:linear-gradient(135deg,#0f766e,#1d4ed8);color:#fff;border-radius:28px;padding:24px;box-shadow:0 20px 60px rgba(15,23,42,.12)}
    .hero h1{margin:0 0 8px;font-size:30px}.hero p{margin:0;color:#dbeafe;line-height:1.8}.toolbar,.filters{display:flex;gap:10px;flex-wrap:wrap;align-items:center}
    .card{margin-top:18px;background:var(--card);border:1px solid var(--line);border-radius:24px;padding:18px;box-shadow:0 10px 30px rgba(15,23,42,.05)}
    button,input,select,textarea{font-family:inherit}button{border:0;border-radius:14px;padding:12px 16px;font-size:14px;font-weight:700;cursor:pointer}.btn{background:linear-gradient(135deg,#0f766e,#0ea5a4);color:#fff}.btn.alt{background:#fff;color:#0f172a;border:1px solid var(--line)}.btn.reject{background:#fff1f2;color:#9f1239;border:1px solid #fecdd3}
    input,select,textarea{width:100%;border:1px solid #cbd5e1;border-radius:14px;padding:12px 14px;background:#fff}.muted{color:var(--muted)}
    .grid{display:grid;gap:14px}.grid-2{grid-template-columns:1fr 1fr}.item{border:1px solid var(--line);border-radius:18px;padding:16px;background:#fff}.pill{display:inline-flex;align-items:center;padding:6px 10px;border-radius:999px;font-size:12px;font-weight:700}.pill.pending{background:#fff7ed;color:#9a3412;border:1px solid #fdba74}.pill.approved{background:#ecfdf5;color:#166534;border:1px solid #86efac}.pill.rejected{background:#fff1f2;color:#9f1239;border:1px solid #fda4af}
    .msg{margin-top:12px;padding:12px 14px;border-radius:14px;background:#eff6ff;color:#1d4ed8;display:none}.msg.show{display:block}.msg.error{background:#fff1f2;color:#be123c}.small{font-size:12px}.chips{display:flex;flex-wrap:wrap;gap:8px;margin-top:10px}.chip{background:#f8fafc;border:1px solid var(--line);border-radius:999px;padding:8px 10px;font-size:12px}
    @media (max-width:900px){.grid-2{grid-template-columns:1fr}.wrap{padding:16px}.hero h1{font-size:24px}}
  </style>
</head>
<body>
  <div class="wrap">
    <div class="hero">
      <h1>اعتماد طلبات تحديث الرقم الأساسي</h1>
      <p>شاشة مستقلة خفيفة للإدارة ومدير المدرسة لمراجعة طلبات أولياء الأمور واعتمادها أو رفضها، مع دعم التفعيل التلقائي كخيار افتراضي أو التحويل إلى الاعتماد اليدوي.</p>
    </div>
    <div class="card">
      <div class="toolbar" style="justify-content:space-between">
        <div>
          <div id="actorName" style="font-size:22px;font-weight:800">—</div>
          <div id="actorMeta" class="muted">جاري التحقق من الجلسة...</div>
        </div>
        <div class="toolbar">
          <button class="btn alt" id="refreshBtn">تحديث</button>
          <button class="btn alt" id="openMainBtn">فتح المنصة الرئيسية</button>
        </div>
      </div>
      <div class="card" style="margin-top:14px"><div class="grid grid-2"><div><div class="toolbar" style="justify-content:space-between"><div><div style="font-weight:800;font-size:18px">سياسة تحديث الرقم الأساسي</div><div class="muted small" id="policyMeta">الوضع الافتراضي: تلقائي</div></div><div class="toolbar"><select id="policyMode" style="min-width:180px"><option value="auto">اعتماد تلقائي (افتراضي)</option><option value="manual">اعتماد يدوي</option></select><button class="btn" id="savePolicyBtn">حفظ السياسة</button></div></div></div><div><div class="toolbar" style="justify-content:space-between"><div><div style="font-weight:800;font-size:18px">بوابة ولي الأمر</div><div class="muted small" id="portalMeta">الحالة الحالية: مفعلة</div></div><div class="toolbar"><select id="portalEnabled" style="min-width:180px"><option value="enabled">مفعلة</option><option value="disabled">مقفلة</option></select><button class="btn" id="savePortalBtn">حفظ الحالة</button></div></div><div style="margin-top:10px;padding:10px 12px;background:#f8fafc;border:1px solid #e2e8f0;border-radius:12px"><div class="toolbar" style="justify-content:space-between"><div><div style="font-weight:700;font-size:14px">الدخول البديل برقم الهوية</div><div class="muted small" id="altLoginMeta">يسمح لولي الأمر بالدخول عبر رقم الجوال + رقم هوية الطالب</div></div><div class="toolbar"><select id="altLoginEnabled" style="min-width:160px"><option value="enabled">مفعّل</option><option value="disabled">معطّل</option></select><button class="btn" id="saveAltLoginBtn">حفظ</button></div></div></div></div></div><div id="alertsBox" class="muted" style="margin-top:10px;line-height:1.9">لا توجد إشعارات حديثة.</div></div><div class="filters" style="margin-top:12px">
        <div style="min-width:200px;flex:1"><select id="statusFilter"><option value="all">كل الحالات</option><option value="pending">بانتظار الاعتماد</option><option value="approved">المعتمدة</option><option value="rejected">المرفوضة</option></select></div>
        <div style="min-width:220px;flex:1"><input id="searchInput" placeholder="بحث باسم الطالب أو الرقم أو المدرسة" /></div>
      </div>
      <div id="pageMsg" class="msg"></div>
    </div>
    <div id="requestsList" class="grid" style="margin-top:18px"></div>
  </div>
<script>
const TOKEN_KEY='ideal-company-platform-session-token-v8';
function getToken(){try{return localStorage.getItem(TOKEN_KEY)||'';}catch(e){return'';}}
function $(id){return document.getElementById(id);} 
function setMessage(id,text,isError){var el=$(id);if(!el)return;el.textContent=text||'';el.className='msg'+(text?' show':'')+(isError?' error':'');}
async function api(path, options){var response=await fetch(path,{method:(options&&options.method)||'GET',headers:{'Content-Type':'application/json','X-Session-Token':getToken()},body:options&&options.body?JSON.stringify(options.body):undefined});var data=await response.json().catch(function(){return{};});if(!response.ok) throw new Error(data.message||'Request failed');return data;}
function statusClass(status){return status==='approved'?'approved':status==='rejected'?'rejected':'pending';}
function statusLabel(status){return status==='approved'?'معتمد':status==='rejected'?'مرفوض':'بانتظار الاعتماد';}
function matches(item){var status=$('statusFilter').value;var q=($('searchInput').value||'').trim().toLowerCase();if(status!=='all'&&item.status!==status)return false;if(!q)return true;var hay=[item.guardianName,item.currentPhone,item.requestedMobile,(item.schoolNames||[]).join(' '),(item.studentNames||[]).join(' ')].join(' ').toLowerCase();return hay.indexOf(q)!==-1;}
function render(list){var rows=(list||[]).filter(matches);$('requestsList').innerHTML=rows.map(function(item){
  var schools=(item.schoolNames||[]).join('، ')||'—';
  var students=(item.studentNames||[]).join('، ')||'—';
  return '<div class="item">'
  + '<div style="display:flex;justify-content:space-between;gap:12px;align-items:flex-start;flex-wrap:wrap">'
  + '<div><div style="font-size:20px;font-weight:800">'+(item.guardianName||'ولي الأمر')+'</div><div class="muted small">'+schools+' • '+(item.studentsCount||0)+' طالب/ـة</div></div>'
  + '<span class="pill '+statusClass(item.status)+'">'+statusLabel(item.status)+'</span></div>'
  + '<div class="chips"><span class="chip">الحالي: '+(item.currentPhoneMasked||item.currentPhone||'—')+'</span><span class="chip">الجديد: '+(item.requestedMobileMasked||item.requestedMobile||'—')+'</span><span class="chip">وقت الطلب: '+(item.requestedAt||'—')+'</span></div>'
  + '<div style="margin-top:12px;line-height:1.9"><b>الطلاب:</b> '+students+'</div>'
  + '<div class="muted" style="margin-top:8px">'+(item.note||'')+'</div>'
  + ((item.status==='pending'||item.status==='approved') ? '<div class="grid grid-2" style="margin-top:14px"><div><textarea id="note_'+item.currentPhone+'_'+item.requestedMobile+'" rows="3" placeholder="ملاحظة الإدارة (اختياري)"></textarea></div><div style="display:flex;gap:10px;flex-wrap:wrap;align-items:flex-start">'+(item.status==='pending'?'<button class="btn" onclick="decide(\''+item.currentPhone+'\',\''+item.requestedMobile+'\',\'approve\')">اعتماد وتحديث الرقم</button>':'')+'<button class="btn reject" onclick="decide(\''+item.currentPhone+'\',\''+item.requestedMobile+'\',\'reject\')">'+(item.status==='approved'?'رفض لاحق / تراجع':'رفض الطلب')+'</button></div></div>' : '')
  + '</div>';
}).join('') || '<div class="item">لا توجد طلبات مطابقة للفلترة الحالية.</div>';
}
async function bootstrap(){
  try{
    var data=await api('/api/admin/parent-primary-requests');
    $('actorName').textContent=(data.actor&&data.actor.fullName)||'المستخدم';
    $('actorMeta').textContent='الدور: '+((data.actor&&data.actor.role)||'—')+' • الطلبات: '+((data.requests&&data.requests.length)||0);
    window.__parentRequests=data.requests||[];
    var policy=(data.policy||{mode:'auto'}); $('policyMode').value=policy.mode||'auto'; $('policyMeta').textContent='الوضع الحالي: '+((policy.mode==='manual')?'يدوي':'تلقائي')+(policy.updatedAt?' • آخر تحديث: '+policy.updatedAt:'');
    var portal=(data.portalSettings||{enabled:true,altLoginEnabled:true}); $('portalEnabled').value=portal.enabled===false?'disabled':'enabled'; $('portalMeta').textContent='الحالة الحالية: '+(portal.enabled===false?'مقفلة':'مفعلة')+(portal.updatedAt?' • آخر تحديث: '+portal.updatedAt:''); $('altLoginEnabled').value=portal.altLoginEnabled===false?'disabled':'enabled'; $('altLoginMeta').textContent='الدخول البديل: '+(portal.altLoginEnabled===false?'معطّل ← لن يظهر زر الدخول البديل في البوابة':'مفعّل ← يمكن لولي الأمر الدخول برقم الجوال + رقم هوية الطالب');
    var alerts=(data.alerts||[]); $('alertsBox').innerHTML=alerts.length?alerts.slice(0,5).map(function(a){return '<div style="padding:10px 12px;border:1px solid #e2e8f0;border-radius:14px;margin-top:8px;background:#f8fafc"><b>'+(a.guardianName||'ولي الأمر')+'</b> • '+(a.message||'')+'<div class="small muted">'+(a.createdAt||'')+'</div></div>';}).join(''):'لا توجد إشعارات حديثة.';
    render(window.__parentRequests);
  }catch(e){
    setMessage('pageMsg',e.message||'تعذر تحميل الطلبات.',true);
    $('requestsList').innerHTML='<div class="item">تعذر تحميل الطلبات. تأكد من أنك مسجل الدخول في المنصة بنفس المتصفح ولديك صلاحية مناسبة.</div>';
  }
}
async function decide(currentPhone, requestedMobile, action){
  var noteEl=$('note_'+currentPhone+'_'+requestedMobile); var note=noteEl?noteEl.value:'';
  try{
    var data=await api('/api/admin/parent-primary-requests/decide',{method:'POST',body:{currentPhone:currentPhone,requestedMobile:requestedMobile,decision:action,note:note}});
    setMessage('pageMsg',data.message||'تم تحديث الطلب.',false);
    await bootstrap();
  }catch(e){ setMessage('pageMsg',e.message||'تعذر تحديث الطلب.',true); }
}
$('statusFilter').onchange=function(){render(window.__parentRequests||[])};
$('searchInput').oninput=function(){render(window.__parentRequests||[])};
$('refreshBtn').onclick=bootstrap;
$('savePolicyBtn').onclick=async function(){ try{ var data=await api('/api/admin/parent-primary-requests/policy',{method:'POST',body:{mode:$('policyMode').value}}); setMessage('pageMsg',data.message||'تم تحديث السياسة.',false); await bootstrap(); }catch(e){ setMessage('pageMsg',e.message||'تعذر تحديث السياسة.',true); } };
$('savePortalBtn').onclick=async function(){ try{ var data=await api('/api/admin/parent-primary-requests/portal-settings',{method:'POST',body:{enabled:$('portalEnabled').value!=='disabled'}}); setMessage('pageMsg',data.message||'تم تحديث حالة البوابة.',false); await bootstrap(); }catch(e){ setMessage('pageMsg',e.message||'تعذر تحديث حالة البوابة.',true); } };
$('saveAltLoginBtn').onclick=async function(){ try{ var data=await api('/api/admin/parent-primary-requests/portal-settings',{method:'POST',body:{altLoginEnabled:$('altLoginEnabled').value!=='disabled'}}); setMessage('pageMsg',data.message||'تم تحديث إعداد الدخول البديل.',false); await bootstrap(); }catch(e){ setMessage('pageMsg',e.message||'تعذر تحديث إعداد الدخول البديل.',true); } };
$('openMainBtn').onclick=function(){ location.href='/'; };
bootstrap();
</script>
</body>
</html>`;
}

const SERVER_PUBLIC_DIR = path.join(__dirname, 'public');

function serveStatic(req, res) {
  const reqUrl = new URL(req.url, `http://${req.headers.host}`);
  let pathname = decodeURIComponent(reqUrl.pathname);
  // خدمة ملفات /public/ من server/public/
  if (pathname.startsWith('/public/')) {
    const filePath = path.join(SERVER_PUBLIC_DIR, pathname.replace(/^\/public\//, ''));
    if (!filePath.startsWith(SERVER_PUBLIC_DIR) || !existsSync(filePath)) {
      sendText(res, 404, 'File not found');
      return;
    }
    const ct = mimeTypeFor(filePath);
    const headers = { 'Content-Type': ct, 'Cache-Control': 'public, max-age=86400' };
    // Service Worker يجب أن يُقدَّم بدون cache طويل
    if (filePath.endsWith('-sw.js')) {
      headers['Cache-Control'] = 'no-cache, no-store, must-revalidate';
      headers['Service-Worker-Allowed'] = '/';
    }
    res.writeHead(200, headers);
    createReadStream(filePath).pipe(res);
    return;
  }
  if (pathname.startsWith('/uploads/')) {
    const uploadPath = path.join(UPLOADS_DIR, pathname.replace(/^\/uploads\//, ''));
    if (!uploadPath.startsWith(UPLOADS_DIR) || !existsSync(uploadPath)) {
      sendText(res, 404, 'File not found');
      return;
    }
    res.writeHead(200, { 'Content-Type': mimeTypeFor(uploadPath) });
    createReadStream(uploadPath).pipe(res);
    return;
  }
  if (pathname === '/') pathname = '/index.html';
  let filePath = path.join(DIST_DIR, pathname);
  if (!filePath.startsWith(DIST_DIR)) {
    sendText(res, 403, 'Forbidden');
    return;
  }

  if (!existsSync(filePath) || pathname.endsWith('/')) {
    filePath = path.join(DIST_DIR, 'index.html');
  }

  if (existsSync(filePath)) {
    const ct = mimeTypeFor(filePath);
    const headers = { 'Content-Type': ct };
    // حقن إصلاح QuotaExceededError في index.html مباشرة عند تقديمه
    if (filePath.endsWith('index.html')) {
      headers['Cache-Control'] = 'no-cache, no-store, must-revalidate';
      try {
        let html = readFileSync(filePath, 'utf8');
        const quotaScript = `<script>\n    (function(){try{var t='__qt__';localStorage.setItem(t,'1');localStorage.removeItem(t);}catch(e){if(e&&(e.name==='QuotaExceededError'||e.code===22||e.code===1014)){try{localStorage.clear();}catch(e2){}}}})();\n    <\/script>`;
        if (!html.includes('__qt__')) {
          html = html.replace('<meta charset', quotaScript + '\n    <meta charset');
        }
        res.writeHead(200, headers);
        res.end(html);
        return;
      } catch(e) {
        // fallback to stream
      }
    }
    res.writeHead(200, headers);
    createReadStream(filePath).pipe(res);
    return;
  }

  // Fallback: fetch from GitHub if file not found locally
  const ghPath = pathname.startsWith('/assets/') ? pathname : '/index.html';
  fetchFromGithub(ghPath).then(buf => {
    if (!buf) {
      sendText(res, 404, 'File not found');
      return;
    }
    const ct = mimeTypeFor(ghPath);
    res.writeHead(200, { 'Content-Type': ct, 'X-Source': 'github-fallback' });
    res.end(buf);
  }).catch(() => sendText(res, 404, 'File not found'));
}

async function main() {
  await mkdir(DATA_DIR, { recursive: true });
  await mkdir(UPLOADS_DIR, { recursive: true });
  await mkdir(FACE_UPLOADS_DIR, { recursive: true });
  await mkdir(EVIDENCE_UPLOADS_DIR, { recursive: true });
  await mkdir(GLOBAL_BACKUPS_DIR, { recursive: true });
  await mkdir(SCHOOL_BACKUPS_DIR, { recursive: true });
  await initializeDatabase();
  await ensureStateSeeded();
  await ensureStateMigrations();
  await cleanupExpiredSessions();
  await cleanupExpiredAuthOtps();
  await cleanupExpiredAuthLockouts();
  // تهيئة cache الـ state قبل أي شيء
  await refreshStateCache();
  await ensureDailyBackups('startup');
  const server = http.createServer(async (req, res) => {
  if (req.method === 'OPTIONS') {
    res.writeHead(204, {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Session-Token',
      'Access-Control-Allow-Methods': 'GET,POST,OPTIONS',
    });
    res.end();
    return;
  }

  const reqUrl = new URL(req.url, `http://${req.headers.host}`);
  const token = parseAuthToken(req);

  try {
    if ((reqUrl.pathname === '/parent' || reqUrl.pathname === '/parent/') && req.method === 'GET') {
      res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-cache, no-store, must-revalidate' });
      res.end(renderParentPortalHtml());
      return;
    }

    // ===== بوابة المعلم المستقلة =====
    if ((reqUrl.pathname === '/teacher' || reqUrl.pathname === '/teacher/') && req.method === 'GET') {
      res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-cache, no-store, must-revalidate' });
      res.end(renderTeacherPortalHtml());
      return;
    }

    // endpoint تشخيصي لفحص إعدادات واتساب
    if (reqUrl.pathname === '/api/parent/debug-whatsapp' && req.method === 'POST') {
      const body = await readJsonBody(req);
      const mobile = normalizePhoneNumber(body.mobile || '');
      const state = getSharedState();
      const profile = await buildParentProfile(state, mobile);
      if (!profile) return sendJson(res, 404, { ok: false, message: 'رقم غير مرتبط' });
      const school = state.schools.find((item) => Number(item.id) === Number(profile.students?.[0]?.schoolId));
      const messaging = hydrateMessagingSettings(school || {});
      return sendJson(res, 200, {
        ok: true,
        schoolName: school?.name || 'غير معروف',
        channels: messaging.channels,
        hasWhatsappPhoneNumberId: Boolean(messaging.integration.whatsapp?.phoneNumberId),
        hasWhatsappAccessToken: Boolean(messaging.integration.whatsapp?.accessToken),
        phoneNumberIdPreview: messaging.integration.whatsapp?.phoneNumberId ? String(messaging.integration.whatsapp.phoneNumberId).slice(0, 6) + '...' : null,
        willSendVia: (messaging.channels.whatsapp && messaging.integration.whatsapp?.phoneNumberId && messaging.integration.whatsapp?.accessToken) ? 'whatsapp' : (messaging.channels.sms && (messaging.integration.sms?.apiUrl || messaging.integration.sms?.provider)) ? 'sms' : 'preview_only',
      });
    }
    // endpoint تشخيصي مؤقت لمعرفة أرقام الجوال المحفوظة
    if (reqUrl.pathname === '/api/parent/debug-phones' && req.method === 'POST') {
      const body = await readJsonBody(req);
      const inputMobile = String(body.mobile || '').trim();
      const normalizedInput = normalizePhoneNumber(inputMobile);
      const state = getSharedState();
      const allPhones = [];
      for (const school of state.schools || []) {
        const students = getUnifiedSchoolStudentsForServer(school, { includeArchived: false, preferStructure: true });
        for (const student of students) {
          const raw = String(student.guardianMobile || '').trim();
          const normalized = normalizePhoneNumber(raw);
          if (raw || normalized) {
            allPhones.push({ schoolName: school.name, studentName: student.name || student.fullName, raw, normalized, match: normalized === normalizedInput });
          }
        }
      }
      return sendJson(res, 200, { ok: true, inputMobile, normalizedInput, allPhones: allPhones.slice(0, 50) });
    }
    if (reqUrl.pathname === '/api/parent/request-otp' && req.method === 'POST') {
      const body = await readJsonBody(req);
      const mobile = normalizePhoneNumber(body.mobile || '');
      const state = getSharedState();
      const profile = await buildParentProfile(state, mobile);
      if (!mobile) return sendJson(res, 400, { ok: false, message: 'أدخل رقم الجوال أولاً.' });
      if (!profile) return sendJson(res, 404, { ok: false, message: 'هذا الرقم غير مرتبط بأي طالب حاليًا.' });
      const portalEnabled = await isParentPortalEnabledForProfile(profile);
      if (!portalEnabled) return sendJson(res, 403, { ok: false, message: 'بوابة ولي الأمر غير مفعلة حاليًا لهذه المدرسة. راجع إدارة المدرسة.' });
      const school = state.schools.find((item) => Number(item.id) === Number(profile.students?.[0]?.schoolId));
      const messaging = hydrateMessagingSettings(school || {});
      const code = generateOtpCode(6);
      await createParentOtpRequest(mobile, code);
      let deliveryUsed = 'preview';
      try {
        if (messaging.channels.whatsapp && messaging.integration.whatsapp?.phoneNumberId && messaging.integration.whatsapp?.accessToken) {
          await sendWhatsappCloudMessage(messaging.integration.whatsapp || {}, mobile, `رمز دخول ولي الأمر: ${code}\nالصلاحية: 10 دقائق.`);
          deliveryUsed = 'whatsapp';
        } else if (messaging.channels.sms && (messaging.integration.sms?.apiUrl || messaging.integration.sms?.provider)) {
          await sendSmsMessage(messaging.integration.sms || {}, mobile, `رمز دخول ولي الأمر: ${code}. الصلاحية 10 دقائق.`);
          deliveryUsed = 'sms';
        }
      } catch (error) {
        deliveryUsed = 'preview';
      }
      return sendJson(res, 200, { ok: true, message: deliveryUsed === 'preview' ? 'تم توليد الرمز. قناة الإرسال غير مكتملة لذلك أظهرناه للاختبار.' : `تم إرسال رمز التحقق عبر ${deliveryUsed === 'whatsapp' ? 'واتساب' : 'SMS'}.`, previewCode: deliveryUsed === 'preview' ? code : '' });
    }

    if (reqUrl.pathname === '/api/parent/verify-otp' && req.method === 'POST') {
      const body = await readJsonBody(req);
      const mobile = normalizePhoneNumber(body.mobile || '');
      const code = String(body.code || '').trim();
      if (!mobile || !code) return sendJson(res, 400, { ok: false, message: 'أدخل رقم الجوال والرمز.' });
      const verified = await verifyAndConsumeParentOtp(mobile, code);
      if (!verified.ok) return sendJson(res, 400, verified);
      const state = getSharedState();
      const profile = await buildParentProfile(state, mobile);
      if (!profile) return sendJson(res, 404, { ok: false, message: 'تعذر العثور على الطلاب المرتبطين بهذا الرقم.' });
      const portalEnabled = await isParentPortalEnabledForProfile(profile);
      if (!portalEnabled) return sendJson(res, 403, { ok: false, message: 'بوابة ولي الأمر موقفة حاليًا لهذه المدرسة.' });
      const sessionToken = await createParentSession(mobile, profile);
      return sendJson(res, 200, { ok: true, token: sessionToken, profile });
    }

    if (reqUrl.pathname === '/api/parent/alt-login/request' && req.method === 'POST') {
      const body = await readJsonBody(req);
      const mobile = normalizePhoneNumber(body.mobile || '');
      const nationalId = String(body.nationalId || '').trim();
      if (!mobile) return sendJson(res, 400, { ok: false, message: 'أدخل رقم الجوال أولاً.' });
      if (!nationalId) return sendJson(res, 400, { ok: false, message: 'أدخل رقم هوية الطالب.' });
      const state = getSharedState();
      // البحث عن طالب برقم هويته ورقم جوال ولي الأمر معاً
      let matchedPhone = null;
      for (const school of (state.schools || [])) {
        const classrooms = school?.structure?.classrooms || [];
        for (const cls of classrooms) {
          for (const student of (cls.students || [])) {
            const sNationalId = String(student.nationalId || student.identityNumber || '').trim();
            const sPhone = normalizePhoneNumber(student.guardianMobile || '');
            if (sNationalId && sNationalId === nationalId && sPhone === mobile) {
              matchedPhone = mobile;
              break;
            }
          }
          if (matchedPhone) break;
        }
        if (matchedPhone) break;
      }
      if (!matchedPhone) return sendJson(res, 404, { ok: false, message: 'لم يتطابق رقم الجوال مع رقم الهوية. تأكد من صحة البيانات.' });
      // التحقق من تفعيل البوابة
      const profile = await buildParentProfile(state, matchedPhone);
      if (!profile) return sendJson(res, 404, { ok: false, message: 'لم يتطابق رقم الجوال مع رقم الهوية. تأكد من صحة البيانات.' });
      const portalEnabled = await isParentPortalEnabledForProfile(profile);
      if (!portalEnabled) return sendJson(res, 403, { ok: false, message: 'بوابة ولي الأمر غير مفعلة حاليًا لهذه المدرسة.' });
      // التحقق من تفعيل الدخول البديل
      const matchedSchoolId = profile.students?.[0]?.schoolId;
      if (matchedSchoolId) {
        const portalSettingsForAlt = await getParentPortalSettings(matchedSchoolId);
        if (portalSettingsForAlt.altLoginEnabled === false) return sendJson(res, 403, { ok: false, message: 'الدخول البديل برقم الهوية غير مفعّل حاليًا في هذه المدرسة. تواصل مع إدارة المدرسة.' });
      }
      // توليد رمز OTP وإرساله
      const school = state.schools.find((item) => Number(item.id) === Number(profile.students?.[0]?.schoolId));
      const messaging = hydrateMessagingSettings(school || {});
      const code = generateOtpCode(6);
      await createParentOtpRequest(mobile, code);
      let deliveryUsed = 'preview';
      try {
        if (messaging.channels.whatsapp && messaging.integration.whatsapp?.phoneNumberId && messaging.integration.whatsapp?.accessToken) {
          await sendWhatsappCloudMessage(messaging.integration.whatsapp || {}, mobile, `\u0631مز دخول ولي الأمر: ${code}\nالصلاحية: 10 دقائق.`);
          deliveryUsed = 'whatsapp';
        } else if (messaging.channels.sms && (messaging.integration.sms?.apiUrl || messaging.integration.sms?.provider)) {
          await sendSmsMessage(messaging.integration.sms || {}, mobile, `\u0631مز دخول ولي الأمر: ${code}. الصلاحية 10 دقائق.`);
          deliveryUsed = 'sms';
        }
      } catch (err) { deliveryUsed = 'preview'; }
      return sendJson(res, 200, {
        ok: true,
        message: deliveryUsed === 'preview'
          ? 'تم التحقق بنجاح. قناة الإرسال غير مكتملة لذلك أظهرناه للاختبار.'
          : `\u062aم إرسال رمز التحقق عبر ${deliveryUsed === 'whatsapp' ? '\u0648اتساب' : 'SMS'}.`,
        previewCode: deliveryUsed === 'preview' ? code : ''
      });
    }

    if (reqUrl.pathname === '/api/parent/add-contact/request-otp' && req.method === 'POST') {
      const profile = await getParentProfileFromToken(token);
      if (!profile) return sendJson(res, 401, { ok: false, message: 'جلسة ولي الأمر غير صالحة أو منتهية.' });
      const body = await readJsonBody(req);
      const mobile = normalizePhoneNumber(body.mobile || '');
      const channel = body.channel === 'sms' ? 'sms' : 'whatsapp';
      if (!mobile) return sendJson(res, 400, { ok: false, message: 'أدخل الرقم الإضافي أولاً.' });
      if (mobile === normalizePhoneNumber(profile.mobile || '')) return sendJson(res, 400, { ok: false, message: 'هذا هو الرقم الأساسي بالفعل.' });
      const existing = await getParentExtraContacts(profile.mobile);
      if (existing.some((item) => normalizePhoneNumber(item.mobile) === mobile)) return sendJson(res, 400, { ok: false, message: 'هذا الرقم مرتبط مسبقًا.' });
      const state = getSharedState();
      const school = state.schools.find((item) => Number(item.id) === Number(profile.students?.[0]?.schoolId));
      const messaging = hydrateMessagingSettings(school || {});
      const code = generateOtpCode(6);
      await createParentContactOtpRequest(profile.mobile, mobile, channel, code);
      let deliveryUsed = 'preview';
      try {
        if (channel === 'whatsapp' && messaging.channels.whatsapp && messaging.integration.whatsapp?.phoneNumberId && messaging.integration.whatsapp?.accessToken) {
          await sendWhatsappCloudMessage(messaging.integration.whatsapp || {}, mobile, `رمز ربط رقم التنبيهات: ${code}
الصلاحية: 10 دقائق.`);
          deliveryUsed = 'whatsapp';
        } else if (channel === 'sms' && messaging.channels.sms && (messaging.integration.sms?.apiUrl || messaging.integration.sms?.provider)) {
          await sendSmsMessage(messaging.integration.sms || {}, mobile, `رمز ربط رقم التنبيهات: ${code}. الصلاحية 10 دقائق.`);
          deliveryUsed = 'sms';
        }
      } catch (error) {
        deliveryUsed = 'preview';
      }
      return sendJson(res, 200, { ok: true, message: deliveryUsed === 'preview' ? 'تم توليد الرمز للاختبار لأن قناة الإرسال غير مكتملة.' : `تم إرسال رمز التحقق عبر ${deliveryUsed === 'whatsapp' ? 'واتساب' : 'SMS'}.`, previewCode: deliveryUsed === 'preview' ? code : '' });
    }

    if (reqUrl.pathname === '/api/parent/add-contact/verify-otp' && req.method === 'POST') {
      const profile = await getParentProfileFromToken(token);
      if (!profile) return sendJson(res, 401, { ok: false, message: 'جلسة ولي الأمر غير صالحة أو منتهية.' });
      const body = await readJsonBody(req);
      const mobile = normalizePhoneNumber(body.mobile || '');
      const code = String(body.code || '').trim();
      const channel = body.channel === 'sms' ? 'sms' : 'whatsapp';
      if (!mobile || !code) return sendJson(res, 400, { ok: false, message: 'أدخل الرقم والرمز.' });
      const verified = await verifyAndConsumeParentContactOtp(profile.mobile, mobile, code);
      if (!verified.ok) return sendJson(res, 400, verified);
      const existing = await getParentExtraContacts(profile.mobile);
      if (!existing.some((item) => normalizePhoneNumber(item.mobile) === mobile)) {
        existing.push({ mobile, channel, verifiedAt: nowIso(), status: 'verified', label: 'رقم إضافي' });
        await saveParentExtraContacts(profile.mobile, existing);
      }
      const state = getSharedState();
      const updatedProfile = await buildParentProfile(state, profile.mobile);
      return sendJson(res, 200, { ok: true, message: 'تم ربط الرقم الإضافي وسيستقبل التنبيهات القادمة.', profile: updatedProfile });
    }

    if (reqUrl.pathname === '/api/parent/change-primary/request-otp' && req.method === 'POST') {
      const profile = await getParentProfileFromToken(token);
      if (!profile) return sendJson(res, 401, { ok: false, message: 'جلسة ولي الأمر غير صالحة.' });
      const body = await readJsonBody(req);
      const mobile = normalizePhoneNumber(body.mobile || '');
      if (!mobile) return sendJson(res, 400, { ok: false, message: 'أدخل الرقم الجديد بشكل صحيح.' });
      if (mobile === normalizePhoneNumber(profile.mobile || '')) return sendJson(res, 400, { ok: false, message: 'هذا الرقم هو الرقم الأساسي الحالي بالفعل.' });
      const code = generateOtp();
      await createParentPrimaryChangeOtpRequest(profile.mobile, mobile, code);
      const delivery = await trySendOtpToChannel({
        channel: 'sms',
        recipient: mobile,
        message: `رمز التحقق لتحديث الرقم الأساسي في منصة الشركة المثالية هو: ${code}`,
      });
      const response = { ok: true, message: delivery.ok ? 'تم إرسال رمز التحقق إلى الرقم الجديد.' : 'تم إنشاء طلب التحقق. أكمل بالرمز الظاهر للاختبار.' };
      if (!delivery.ok) response.previewCode = code;
      return sendJson(res, 200, response);
    }

    if (reqUrl.pathname === '/api/parent/change-primary/verify-otp' && req.method === 'POST') {
      const profile = await getParentProfileFromToken(token);
      if (!profile) return sendJson(res, 401, { ok: false, message: 'جلسة ولي الأمر غير صالحة.' });
      const body = await readJsonBody(req);
      const mobile = normalizePhoneNumber(body.mobile || '');
      const code = String(body.code || '').trim();
      if (!mobile) return sendJson(res, 400, { ok: false, message: 'أدخل الرقم الجديد بشكل صحيح.' });
      if (!code) return sendJson(res, 400, { ok: false, message: 'أدخل رمز التحقق.' });
      const verification = await verifyAndConsumeParentPrimaryChangeOtp(profile.mobile, mobile, code);
      if (!verification.ok) return sendJson(res, 400, verification);
      const policy = await resolveParentPrimaryChangePolicyForProfile(profile);
      const schoolId = Number(profile?.students?.[0]?.schoolId) || 0;
      const guardianName = String(profile.guardianName || profile.students?.[0]?.guardianName || 'ولي الأمر').trim() || 'ولي الأمر';
      const studentNames = Array.isArray(profile.students) ? profile.students.map((s) => String(s.name || '').trim()).filter(Boolean) : [];
      if (policy.mode === 'auto') {
        const state = getSharedState();
        const systemActor = { id: 'system', username: 'system', fullName: 'التنفيذ التلقائي', role: 'system', schoolId };
        const nextState = structuredClone(state);
        const updatedStudents = applyGuardianMobileChange(nextState.schools, normalizePhoneNumber(profile.mobile), mobile);
        if (!updatedStudents) return sendJson(res, 400, { ok: false, message: 'تعذر تحديث سجلات الطلاب المرتبطة بالرقم الحالي.' });
        await saveSharedState(nextState, systemActor);
        await migrateParentMetadata(normalizePhoneNumber(profile.mobile), mobile);
        await appMetaDelete(`parent_primary_change_${normalizePhoneNumber(profile.mobile)}`);
        await saveParentPrimaryChangeRequest(profile.mobile, {
          requestedMobile: mobile,
          status: 'approved',
          requestedAt: nowIso(),
          verifiedAt: nowIso(),
          note: 'تم اعتماد الطلب تلقائيًا حسب سياسة المدرسة، مع إشعار الإدارة وإمكانية الرفض لاحقًا.',
        });
        await addParentPrimaryChangeAlert(schoolId, { currentPhone: profile.mobile, requestedMobile: mobile, guardianName, studentNames, message: 'تم اعتماد طلب تحديث الرقم الأساسي تلقائيًا، ويمكن للإدارة مراجعته ورفضه لاحقًا عند الحاجة.', createdAt: nowIso(), type: 'auto_approved', status: 'info' });
        const refreshedProfile = await buildParentProfile(getSharedState(), mobile);
        const newToken = await createParentSession(mobile, refreshedProfile);
        return sendJson(res, 200, { ok: true, token: newToken, autoApproved: true, message: 'تم توثيق الرقم الجديد واعتماده تلقائيًا حسب سياسة المدرسة، مع إشعار الإدارة.', profile: refreshedProfile });
      }
      await saveParentPrimaryChangeRequest(profile.mobile, {
        requestedMobile: mobile,
        status: 'pending',
        requestedAt: nowIso(),
        verifiedAt: nowIso(),
        note: 'تم التحقق من الرقم الجديد، والطلب الآن بانتظار اعتماد الإدارة لتحديث الرقم الأساسي.',
      });
      await addParentPrimaryChangeAlert(schoolId, { currentPhone: profile.mobile, requestedMobile: mobile, guardianName, studentNames, message: 'هناك طلب جديد بانتظار اعتماد الإدارة لتحديث الرقم الأساسي.', createdAt: nowIso(), type: 'pending', status: 'warning' });
      const refreshed = await getParentProfileFromToken(token);
      return sendJson(res, 200, { ok: true, message: 'تم توثيق الرقم الجديد ورفع طلب التحديث بنجاح.', profile: refreshed });
    }

    if (reqUrl.pathname === '/api/parent/notification-settings' && req.method === 'POST') {
      const profile = await getParentProfileFromToken(token);
      if (!profile) return sendJson(res, 401, { ok: false, message: 'جلسة ولي الأمر غير صالحة أو منتهية.' });
      const body = await readJsonBody(req);
      await saveParentNotificationSettings(profile.mobile, body || {});
      const state = getSharedState();
      const updatedProfile = await buildParentProfile(state, profile.mobile);
      return sendJson(res, 200, { ok: true, message: 'تم حفظ إعدادات التنبيهات.', profile: updatedProfile });
    }


    if (reqUrl.pathname === '/api/parent/reward-proposals' && req.method === 'POST') {
      const profile = await getParentProfileFromToken(token);
      if (!profile) return sendJson(res, 401, { ok: false, message: 'جلسة ولي الأمر غير صالحة أو منتهية.' });
      const body = await parseJsonBody(req);
      const schoolId = Number(body?.schoolId || 0);
      const title = String(body?.title || '').trim();
      const quantity = Math.max(1, Number(body?.quantity || 1));
      const donorName = String(body?.donorName || '').trim();
      const showDonorName = body?.showDonorName !== false;
      const note = String(body?.note || '').trim();
      const image = String(body?.image || '').trim();
      if (!schoolId || !title || !quantity) return sendJson(res, 400, { ok: false, message: 'أكمل بيانات المقترح أولًا.' });
      const state = getSharedState();
      const school = (state.schools || []).find((item) => Number(item.id) === schoolId);
      if (!school) return sendJson(res, 404, { ok: false, message: 'المدرسة المحددة غير موجودة.' });
      const proposal = { id: `proposal-${Date.now()}`, schoolId, title, quantity, donorName, showDonorName, note, image, mobile: profile.mobile, guardianName: profile.guardianName, status: 'pending', createdAt: nowIso() };
      const nextState = { ...state, schools: (state.schools || []).map((item) => Number(item.id) !== schoolId ? item : ({ ...item, rewardStore: { ...getSchoolRewardStore(item), parentProposals: [proposal, ...getSchoolRewardStore(item).parentProposals] } })) };
      await saveSharedState(nextState, null);
      const nextProfile = await buildParentProfile(getSharedState(), profile.mobile);
      return sendJson(res, 200, { ok: true, message: 'تم إرسال مقترح الجائزة لمدير المدرسة لاعتماده.', profile: nextProfile });
    }

    if (reqUrl.pathname === '/api/parent/reward-redemptions' && req.method === 'POST') {
      const profile = await getParentProfileFromToken(token);
      if (!profile) return sendJson(res, 401, { ok: false, message: 'جلسة ولي الأمر غير صالحة أو منتهية.' });
      const body = await parseJsonBody(req);
      const schoolId = Number(body?.schoolId || 0);
      const studentId = String(body?.studentId || '').trim();
      const itemId = String(body?.itemId || '').trim();
      const note = String(body?.note || '').trim();
      if (!schoolId || !studentId || !itemId) return sendJson(res, 400, { ok: false, message: 'اختر المدرسة والطالب والجائزة أولًا.' });
      const state = getSharedState();
      const school = (state.schools || []).find((item) => Number(item.id) === schoolId);
      if (!school) return sendJson(res, 404, { ok: false, message: 'المدرسة المحددة غير موجودة.' });
      const linkedStudents = getParentLinkedStudents(state, profile.mobile).filter((item) => Number(item.schoolId) === schoolId);
      const student = linkedStudents.find((item) => String(item.studentId || item.id || '') === studentId);
      if (!student) return sendJson(res, 403, { ok: false, message: 'الطالب غير مرتبط بحساب ولي الأمر الحالي.' });
      const store = getSchoolRewardStore(school);
      const item = store.items.map((entry) => normalizeRewardStoreItem(entry)).find((entry) => String(entry.id) === itemId && entry.isActive !== false && String(entry.approvalStatus || '') === 'active' && Number(entry.remainingQuantity || 0) > 0);
      if (!item) return sendJson(res, 404, { ok: false, message: 'الجائزة المحددة غير متاحة حاليًا.' });
      if (Number(student.points || 0) < Number(item.pointsCost || 0)) return sendJson(res, 400, { ok: false, message: 'رصيد الطالب لا يكفي لطلب هذه الجائزة.' });
      const pointsCost = Number(item.pointsCost || 0);
      const request = { id: `redeem-${Date.now()}`, schoolId, studentId, studentName: student.name || 'طالب', itemId, itemTitle: item.title || 'جائزة', pointsCost, note, mobile: profile.mobile, guardianName: profile.guardianName, status: 'pending', createdAt: nowIso() };
      // خصم النقاط فوراً من الطالب الحقيقي في الـ state
      // استخراج rawId من studentId المركّب (مثل "structure-CLASSID-RAWID" أو "RAWID" مباشرة)
      // البنية: structure-{classroomId}-{studentRawId} حيث classroomId قد يحتوي على '-' (مثل "middle-m1-1")
      // لذا rawId هو آخر جزء فقط
      const _redeemParts = String(studentId).startsWith('structure-') ? String(studentId).split('-') : null;
      const rawStudentId = _redeemParts ? _redeemParts[_redeemParts.length - 1] : String(studentId);
      const nextState = structuredClone(state);
      const targetSchool = nextState.schools.find((s) => Number(s.id) === schoolId);
      if (targetSchool) {
        let deducted = false;
        // محاولة خصم من structure.classrooms أولاً (الأولوية)
        for (const classroom of (targetSchool.structure?.classrooms || [])) {
          if (deducted) break;
          const classStudent = (classroom.students || []).find(
            (s) => String(s.id) === rawStudentId || String(s.id) === studentId
          );
          if (classStudent) {
            classStudent.points = Math.max(0, Number(classStudent.points || 0) - pointsCost);
            deducted = true;
          }
        }
        // إذا لم يُوجد في structure، ابحث في school.students
        if (!deducted) {
          const directStudent = (targetSchool.students || []).find(
            (s) => String(s.id) === rawStudentId || String(s.id) === studentId
          );
          if (directStudent) {
            directStudent.points = Math.max(0, Number(directStudent.points || 0) - pointsCost);
            deducted = true;
          }
        }
        // تسجيل الطلب في rewardStore
        const store = getSchoolRewardStore(targetSchool);
        targetSchool.rewardStore = { ...store, redemptionRequests: [request, ...store.redemptionRequests] };
      }
      await saveSharedState(nextState, null);
      const nextProfile = await buildParentProfile(getSharedState(), profile.mobile);
      return sendJson(res, 200, { ok: true, message: `تم استبدال ${pointsCost} نقطة بنجاح! طلبك قيد المعالجة.`, profile: nextProfile });
    }

    if (reqUrl.pathname === '/api/parent/bootstrap' && req.method === 'GET') {
      const profile = await getParentProfileFromToken(token);
      if (!profile) return sendJson(res, 401, { ok: false, message: 'جلسة ولي الأمر غير صالحة أو منتهية.' });
      // تجديد تلقائي للجلسة (sliding session) — يمدد الجلسة عند كل bootstrap ناجح
      try {
        const newExpiry = daysFromNow(PARENT_SESSION_DAYS);
        await dbRun('UPDATE sessions SET expires_at = $1 WHERE token = $2 AND role = $3', [newExpiry, token, 'parent']);
      } catch(e) { /* لا نوقف الطلب إذا فشل التجديد */ }
      return sendJson(res, 200, { ok: true, profile });
    }

    if (reqUrl.pathname === '/api/parent/portal-config' && req.method === 'GET') {
      // إرجاع إعدادات البوابة العامة بدون الحاجة لتسجيل دخول
      // نبحث عن أول مدرسة نشطة لإرجاع إعداداتها
      const state = getSharedState();
      const firstSchool = (state.schools || []).find((s) => s && s.id);
      const schoolId = firstSchool ? Number(firstSchool.id) : 0;
      const settings = schoolId ? await getParentPortalSettings(schoolId) : { enabled: true, altLoginEnabled: true };
      return sendJson(res, 200, { ok: true, altLoginEnabled: settings.altLoginEnabled !== false });
    }


    if ((reqUrl.pathname === '/admin/parent-primary-requests' || reqUrl.pathname === '/admin/parent-primary-requests/') && req.method === 'GET') {
      // نعرض صفحة HTML دون التحقق من الـ token هنا
      // التحقق يتم في الـ API (/api/admin/parent-primary-requests) عند تحميل البيانات
      res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-cache, no-store, must-revalidate' });
      res.end(renderParentRequestsAdminHtml());
      return;
    }


    if (reqUrl.pathname === '/api/admin/parents' && req.method === 'GET') {
      const actor = await getActorFromRequest(req);
      if (!actor || !['superadmin','admin','principal','supervisor'].includes(String(actor.role || '').trim())) return sendJson(res, 403, { ok: false, message: 'غير مصرح لك بعرض أولياء الأمور.' });
      const state = getSharedState();
      const parents = await listParentAccounts(state, actor);
      const summary = {
        total: parents.length,
        active: parents.filter((item) => item.status === 'active').length,
        pending: parents.filter((item) => item.primaryChangeRequest?.status === 'pending').length,
        extraContacts: parents.reduce((sum, item) => sum + Number(item.extraContactsCount || 0), 0),
      };
      return sendJson(res, 200, { ok: true, parents, summary });
    }


    if (reqUrl.pathname === '/api/admin/parents/details' && req.method === 'GET') {
      const actor = await getActorFromRequest(req);
      if (!actor || !['superadmin','admin','principal','supervisor'].includes(String(actor.role || '').trim())) return sendJson(res, 403, { ok: false, message: 'غير مصرح لك بعرض تفاصيل ولي الأمر.' });
      const mobile = normalizePhoneNumber(reqUrl.searchParams.get('mobile') || '');
      if (!mobile) return sendJson(res, 400, { ok: false, message: 'رقم ولي الأمر مطلوب.' });
      const state = getSharedState();
      const profile = await buildParentProfile(state, mobile);
      if (!profile) return sendJson(res, 404, { ok: false, message: 'لا يوجد ولي أمر مرتبط بهذا الرقم.' });
      if (['principal','supervisor'].includes(String(actor.role || '').trim()) && !profile.students.some((student) => Number(student.schoolId) === Number(actor.schoolId))) {
        return sendJson(res, 403, { ok: false, message: 'لا يمكنك عرض تفاصيل ولي أمر خارج مدرستك.' });
      }
      const sessions = await dbQueryAll('SELECT created_at, expires_at FROM sessions WHERE role = $1 AND username = $2 ORDER BY created_at DESC LIMIT 15', ['parent', buildParentUsername(mobile)]);
      const detail = {
        ...profile,
        sessions: (sessions || []).map((row, index) => ({
          id: `${mobile}_${index}`,
          createdAt: String(row.created_at || '').trim(),
          expiresAt: String(row.expires_at || '').trim(),
          active: row.expires_at ? new Date(String(row.expires_at)).getTime() > Date.now() : false,
        })),
      };
      return sendJson(res, 200, { ok: true, parent: detail });
    }

    if (reqUrl.pathname === '/api/admin/parents/audit-feed' && req.method === 'GET') {
      const actor = await getActorFromRequest(req);
      if (!actor || !['superadmin','admin','principal','supervisor'].includes(String(actor.role || '').trim())) return sendJson(res, 403, { ok: false, message: 'غير مصرح لك بعرض السجل الرقابي المجمع.' });
      const state = getSharedState();
      const payload = await listParentAuditFeed(state, actor);
      return sendJson(res, 200, { ok: true, entries: payload.entries, summary: payload.summary });
    }

    if (reqUrl.pathname === '/api/admin/parents/audit' && req.method === 'GET') {
      const actor = await getActorFromRequest(req);
      if (!actor || !['superadmin','admin','principal','supervisor'].includes(String(actor.role || '').trim())) return sendJson(res, 403, { ok: false, message: 'غير مصرح لك بعرض سجل التغييرات.' });
      const mobile = normalizePhoneNumber(reqUrl.searchParams.get('mobile') || '');
      if (!mobile) return sendJson(res, 400, { ok: false, message: 'رقم ولي الأمر مطلوب.' });
      const state = getSharedState();
      const profile = await buildParentProfile(state, mobile);
      if (!profile) return sendJson(res, 404, { ok: false, message: 'لا يوجد ولي أمر مرتبط بهذا الرقم.' });
      if (String(actor.role || '').trim() === 'principal' && !profile.students.some((student) => Number(student.schoolId) === Number(actor.schoolId))) {
        return sendJson(res, 403, { ok: false, message: 'لا يمكنك عرض سجل ولي أمر خارج مدرستك.' });
      }
      const entries = await getParentAuditHistory(mobile);
      return sendJson(res, 200, { ok: true, entries });
    }

    if (reqUrl.pathname === '/api/admin/parents/reassign-student' && req.method === 'POST') {
      const actor = await getActorFromRequest(req);
      if (!actor || !['superadmin','admin','principal'].includes(String(actor.role || '').trim())) return sendJson(res, 403, { ok: false, message: 'فقط الأدمن العام أو مدير المدرسة يمكنه فك أو نقل الارتباط.' });
      const body = await parseJsonBody(req);
      const currentMobile = normalizePhoneNumber(body.mobile || '');
      const newMobile = normalizePhoneNumber(body.newMobile || '');
      const studentId = String(body.studentId || '').trim();
      const schoolId = Number(body.schoolId || 0);
      const guardianName = String(body.guardianName || '').trim();
      if (!currentMobile || !newMobile || !studentId || !schoolId) return sendJson(res, 400, { ok: false, message: 'بيانات النقل غير مكتملة.' });
      if (currentMobile === newMobile) return sendJson(res, 400, { ok: false, message: 'الرقم الجديد يجب أن يختلف عن الرقم الحالي.' });
      const state = getSharedState();
      const profile = await buildParentProfile(state, currentMobile);
      if (!profile) return sendJson(res, 404, { ok: false, message: 'لا يوجد ولي أمر مرتبط بهذا الرقم.' });
      const student = (profile.students || []).find((item) => Number(item.schoolId) === schoolId && String(item.studentId || item.id || '') === studentId);
      if (!student) return sendJson(res, 404, { ok: false, message: 'الطالب غير مرتبط حاليًا بهذا الحساب.' });
      if (String(actor.role || '').trim() === 'principal' && Number(actor.schoolId) !== schoolId) {
        return sendJson(res, 403, { ok: false, message: 'لا يمكنك تعديل طالب خارج مدرستك.' });
      }
      const next = JSON.parse(JSON.stringify(state));
      const school = (next.schools || []).find((item) => Number(item.id) === schoolId);
      if (!school) return sendJson(res, 404, { ok: false, message: 'تعذر تحديد المدرسة المرتبطة بالطالب.' });
      const changed = reassignSingleStudentGuardian(school, { studentId, currentMobile }, { newMobile, guardianName: guardianName || student.guardianName || profile.guardianName });
      if (!changed) return sendJson(res, 400, { ok: false, message: 'لم يتم العثور على سجل الطالب للتحديث.' });
      school.messaging = school.messaging || {};
      school.messaging.logs = Array.isArray(school.messaging.logs) ? school.messaging.logs : [];
      school.messaging.logs.unshift({
        id: `parent-reassign-${Date.now()}`,
        channel: 'internal',
        status: 'نجاح',
        templateName: 'نقل ارتباط ولي الأمر',
        eventType: 'parent_reassign_student',
        recipient: newMobile,
        createdAt: nowIso(),
        sentAt: nowIso(),
        studentId: studentId,
        message: `تم نقل ارتباط الطالب ${student.name || 'الطالب'} من ${maskPhone(currentMobile)} إلى ${maskPhone(newMobile)}.`,
        actorName: actor.name || actor.username || '',
      });
      const saved = await saveSharedState(next, actor);
      await audit(actor, 'parent_reassign_student', { schoolId, studentId, from: currentMobile, to: newMobile, changed });
      const movedStudent = (profile.students || []).find((item) => String(item.studentId) === String(studentId) || String(item.id) === String(studentId));
      const schoolName = movedStudent?.schoolName || ((state.schools || []).find((item) => Number(item.id) === Number(schoolId))?.name || '');
      await appendParentAuditForPhones([currentMobile, newMobile], {
        action: 'reassign_student',
        title: 'نقل ارتباط طالب بين أولياء الأمور',
        note: `تم نقل ${movedStudent?.name || 'الطالب'} من ${maskPhone(currentMobile)} إلى ${maskPhone(newMobile)}.`,
        actor,
        schoolId,
        schoolName,
        studentId,
        studentName: movedStudent?.name || '',
        meta: { from: currentMobile, to: newMobile, changed },
      });
      const updatedProfile = await buildParentProfile(saved, currentMobile);
      return sendJson(res, 200, { ok: true, message: 'تم نقل ارتباط الطالب إلى الرقم البديل بنجاح.', remainingStudents: updatedProfile?.studentsCount || 0 });
    }

    if (reqUrl.pathname === '/api/admin/parents/toggle-suspension' && req.method === 'POST') {
      const actor = await getActorFromRequest(req);
      if (!actor || !['superadmin','admin','principal'].includes(String(actor.role || '').trim())) return sendJson(res, 403, { ok: false, message: 'فقط الأدمن العام أو مدير المدرسة يمكنه تعليق أو إعادة تفعيل الحساب.' });
      const body = await parseJsonBody(req);
      const mobile = normalizePhoneNumber(body.mobile || '');
      const suspended = !!body.suspended;
      const note = String(body.note || '').trim();
      if (!mobile) return sendJson(res, 400, { ok: false, message: 'رقم ولي الأمر مطلوب.' });
      const state = getSharedState();
      const profile = await buildParentProfile(state, mobile);
      if (!profile) return sendJson(res, 404, { ok: false, message: 'لا يوجد ولي أمر مرتبط بهذا الرقم.' });
      if (['principal'].includes(String(actor.role || '').trim()) && !profile.students.some((student) => Number(student.schoolId) === Number(actor.schoolId))) {
        return sendJson(res, 403, { ok: false, message: 'لا يمكنك تعديل حساب ولي أمر خارج مدرستك.' });
      }
      const control = await setParentAccountSuspension(mobile, suspended, note, actor);
      await appendParentAuditHistory(mobile, {
        action: suspended ? 'suspend_account' : 'reactivate_account',
        title: suspended ? 'تعليق حساب ولي الأمر' : 'إعادة تفعيل حساب ولي الأمر',
        note: note || (suspended ? 'تم تعليق الحساب من لوحة الإدارة.' : 'تمت إعادة تفعيل الحساب من لوحة الإدارة.'),
        actor,
        schoolId: profile.students?.[0]?.schoolId || null,
        schoolName: profile.students?.[0]?.schoolName || '',
        studentId: profile.students?.[0]?.studentId || null,
        studentName: profile.students?.[0]?.name || '',
      });
      const schoolId = profile.students?.[0]?.schoolId ?? null;
      const school = (state.schools || []).find((item) => Number(item.id) === Number(schoolId));
      if (school) {
        school.messaging = school.messaging || {};
        school.messaging.logs = Array.isArray(school.messaging.logs) ? school.messaging.logs : [];
        school.messaging.logs = [{
          id: `parent-control-${Date.now()}`,
          channel: 'internal',
          status: 'نجاح',
          recipient: mobile,
          createdAt: nowIso(),
          templateName: suspended ? 'تعليق حساب ولي الأمر' : 'إعادة تفعيل حساب ولي الأمر',
          eventType: suspended ? 'parent_suspend' : 'parent_reactivate',
          message: note || (suspended ? 'تم تعليق الحساب من لوحة الإدارة.' : 'تمت إعادة تفعيل الحساب من لوحة الإدارة.'),
          studentId: profile.students?.[0]?.studentId || null,
        }, ...school.messaging.logs].slice(0, 200);
        await saveSharedState(state, actor);
      }
      return sendJson(res, 200, { ok: true, message: suspended ? 'تم تعليق حساب ولي الأمر.' : 'تمت إعادة تفعيل حساب ولي الأمر.', control });
    }

    if (reqUrl.pathname === '/api/admin/parents/send-access-code' && req.method === 'POST') {
      const actor = await getActorFromRequest(req);
      if (!actor || !['superadmin','admin','principal'].includes(String(actor.role || '').trim())) return sendJson(res, 403, { ok: false, message: 'فقط الأدمن العام أو مدير المدرسة يمكنه إرسال رمز دخول جديد.' });
      const body = await parseJsonBody(req);
      const mobile = normalizePhoneNumber(body.mobile || '');
      const channel = String(body.channel || 'whatsapp').trim() === 'sms' ? 'sms' : 'whatsapp';
      if (!mobile) return sendJson(res, 400, { ok: false, message: 'رقم الجوال مطلوب.' });
      const state = getSharedState();
      const profile = await buildParentProfile(state, mobile);
      if (!profile) return sendJson(res, 404, { ok: false, message: 'لا يوجد ولي أمر مرتبط بهذا الرقم.' });
      if (['principal'].includes(String(actor.role || '').trim()) && !profile.students.some((student) => Number(student.schoolId) === Number(actor.schoolId))) {
        return sendJson(res, 403, { ok: false, message: 'لا يمكنك إرسال رمز لولي أمر خارج مدرستك.' });
      }
      const school = (state.schools || []).find((item) => Number(item.id) === Number(profile.students?.[0]?.schoolId));
      const messaging = hydrateMessagingCenter(school?.messaging);
      const code = generateOtpCode(6);
      await createParentOtpRequest(mobile, code);
      let destinationPreview = maskPhone(mobile);
      let previewCode = code;
      try {
        if (channel === 'whatsapp' && messaging?.settings?.channels?.whatsapp) {
          await sendWhatsappCloudMessage(messaging.integration.whatsapp || {}, mobile, `رمز دخول ولي الأمر: ${code}
الصلاحية: 10 دقائق.`);
          previewCode = '';
        } else if (channel === 'sms' && messaging?.settings?.channels?.sms) {
          await sendSmsMessage(messaging.integration.sms || {}, mobile, `رمز دخول ولي الأمر: ${code}. الصلاحية 10 دقائق.`);
          previewCode = '';
        }
      } catch (error) {
        return sendJson(res, 200, { ok: true, fallback: true, message: `تعذر الإرسال عبر ${channel === 'sms' ? 'SMS' : 'واتساب'} وتم إنشاء رمز تجريبي.`, destinationPreview, previewCode, channel });
      }
      await appendParentAuditHistory(mobile, {
        action: 'send_access_code',
        title: 'إرسال رمز دخول جديد',
        note: `تم إرسال رمز دخول جديد عبر ${channel === 'sms' ? 'SMS' : 'واتساب'}.`,
        actor,
        schoolId: profile.students?.[0]?.schoolId || null,
        schoolName: profile.students?.[0]?.schoolName || '',
        studentId: profile.students?.[0]?.studentId || null,
        studentName: profile.students?.[0]?.name || '',
        meta: { channel },
      });
      return sendJson(res, 200, { ok: true, message: `تم إرسال رمز الدخول عبر ${channel === 'sms' ? 'SMS' : 'واتساب'}.`, destinationPreview, previewCode, channel });
    }
    // API: إنشاء رابط دخول مباشر لولي الأمر
    if (reqUrl.pathname === '/api/admin/parents/generate-link' && req.method === 'POST') {
      const actor = await getActorFromRequest(req);
      if (!actor || !['superadmin','admin','principal'].includes(String(actor.role || '').trim())) return sendJson(res, 403, { ok: false, message: 'غير مصرح.' });
      const body = await parseJsonBody(req);
      const mobile = normalizePhoneNumber(body.mobile || '');
      if (!mobile) return sendJson(res, 400, { ok: false, message: 'رقم الجوال مطلوب.' });
      const state = getSharedState();
      const profile = await buildParentProfile(state, mobile);
      if (!profile) return sendJson(res, 404, { ok: false, message: 'لا يوجد ولي أمر مرتبط بهذا الرقم.' });
      if (['principal'].includes(String(actor.role || '').trim()) && !profile.students.some((s) => Number(s.schoolId) === Number(actor.schoolId))) {
        return sendJson(res, 403, { ok: false, message: 'لا يمكنك إنشاء رابط لولي أمر خارج مدرستك.' });
      }
      const code = generateOtpCode(6);
      await createParentOtpRequest(mobile, code);
      // بناء الرابط المباشر
      const baseUrl = String(body.baseUrl || '').trim() || `${req.headers['x-forwarded-proto'] || 'https'}://${req.headers.host}`;
      const directLink = `${baseUrl}/parent?mobile=${encodeURIComponent(mobile)}&code=${code}`;
      await appendParentAuditHistory(mobile, {
        action: 'generate_direct_link',
        title: 'إنشاء رابط دخول مباشر',
        note: 'تم إنشاء رابط دخول مباشر لولي الأمر.',
        actor,
        schoolId: profile.students?.[0]?.schoolId || null,
        schoolName: profile.students?.[0]?.schoolName || '',
        studentId: profile.students?.[0]?.studentId || null,
        studentName: profile.students?.[0]?.name || '',
        meta: {},
      });
      return sendJson(res, 200, { ok: true, link: directLink, code, mobile, guardianName: profile.guardianName || '' });
    }
    if (reqUrl.pathname === '/api/admin/parent-primary-requests' && req.method === 'GET') {
      const actor = await getUserFromToken(token);
      if (!actor || !['superadmin','principal','supervisor'].includes(String(actor.role || '').trim())) return sendJson(res, 403, { ok: false, message: 'غير مصرح لك بعرض هذه الصفحة.' });
      const state = getSharedState();
      const schoolId = actor.role === 'superadmin' ? Number(reqUrl.searchParams.get('schoolId') || actor.schoolId || 0) : Number(actor.schoolId) || 0;
      const requests = await listParentPrimaryChangeRequests(state, actor);
      const alerts = schoolId ? await listParentPrimaryChangeAlerts(schoolId) : [];
      const policy = schoolId ? await getParentPrimaryChangePolicy(schoolId) : { schoolId: 0, mode: 'auto' };
      const portalSettings = schoolId ? await getParentPortalSettings(schoolId) : { schoolId: 0, enabled: true };
      return sendJson(res, 200, { ok: true, actor, requests, alerts, policy, portalSettings });
    }

    if (reqUrl.pathname === '/api/admin/parent-primary-requests/policy' && req.method === 'POST') {
      const actor = await getUserFromToken(token);
      if (!actor || !['superadmin','principal'].includes(String(actor.role || '').trim())) return sendJson(res, 403, { ok: false, message: 'فقط الأدمن العام أو مدير المدرسة يمكنه تعديل السياسة.' });
      const body = await readJsonBody(req);
      const schoolId = actor.role === 'superadmin' ? Number(body.schoolId || actor.schoolId || 0) : Number(actor.schoolId) || 0;
      if (!schoolId) return sendJson(res, 400, { ok: false, message: 'تعذر تحديد المدرسة المرتبطة بالسياسة.' });
      const policy = await saveParentPrimaryChangePolicy(schoolId, body.mode, actor);
      const school = (getSharedState().schools || []).find((item) => Number(item.id) === Number(schoolId));
      const linkedPhones = [...new Set(getParentLinkedStudents(getSharedState(), '').map((item) => null))];
      const schoolPhones = [...new Set((getSharedState().schools || []).flatMap((sch) => Number(sch.id) === Number(schoolId) ? getUnifiedSchoolStudentsForServer(sch, { includeArchived: false, preferStructure: true }).map((student) => normalizePhoneNumber(student.guardianMobile || '')).filter(Boolean) : []))];
      await appendParentAuditForPhones(schoolPhones, {
        action: 'policy_change',
        title: 'تحديث سياسة تغيير الرقم الأساسي',
        note: `تم ضبط سياسة المدرسة على ${policy.mode === 'manual' ? 'الاعتماد اليدوي' : 'الاعتماد التلقائي'}.`,
        actor,
        schoolId,
        schoolName: school?.name || '',
        meta: { mode: policy.mode },
      });
      return sendJson(res, 200, { ok: true, message: 'تم تحديث سياسة تحديث الرقم الأساسي.', policy });
    }

    if (reqUrl.pathname === '/api/admin/parent-primary-requests/portal-settings' && req.method === 'POST') {
      const actor = await getUserFromToken(token);
      if (!actor || !['superadmin','principal'].includes(String(actor.role || '').trim())) return sendJson(res, 403, { ok: false, message: 'فقط الأدمن العام أو مدير المدرسة يمكنه تفعيل أو إيقاف بوابة ولي الأمر.' });
      const body = await readJsonBody(req);
      const schoolId = actor.role === 'superadmin' ? Number(body.schoolId || actor.schoolId || 0) : Number(actor.schoolId) || 0;
      if (!schoolId) return sendJson(res, 400, { ok: false, message: 'تعذر تحديد المدرسة المرتبطة بإعداد البوابة.' });
      const altLoginEnabled = body.altLoginEnabled !== undefined ? body.altLoginEnabled !== false : null;
      // إذا لم يُرسل enabled في الطلب نحتفظ بالقيمة الحالية
      let enabledValue;
      if (body.enabled !== undefined) {
        enabledValue = body.enabled !== false;
      } else {
        const currentSettings = await getParentPortalSettings(schoolId);
        enabledValue = currentSettings.enabled !== false;
      }
      const portalSettings = await saveParentPortalSettings(schoolId, enabledValue, actor, altLoginEnabled);
      const school = (getSharedState().schools || []).find((item) => Number(item.id) === Number(schoolId));
      const schoolPhones = [...new Set((getSharedState().schools || []).flatMap((sch) => Number(sch.id) === Number(schoolId) ? getUnifiedSchoolStudentsForServer(sch, { includeArchived: false, preferStructure: true }).map((student) => normalizePhoneNumber(student.guardianMobile || '')).filter(Boolean) : []))];
      await appendParentAuditForPhones(schoolPhones, {
        action: portalSettings.enabled ? 'portal_enabled' : 'portal_disabled',
        title: portalSettings.enabled ? 'تفعيل بوابة ولي الأمر' : 'إيقاف بوابة ولي الأمر',
        note: portalSettings.enabled ? 'تم تفعيل البوابة لهذه المدرسة.' : 'تم إيقاف البوابة لهذه المدرسة.',
        actor,
        schoolId,
        schoolName: school?.name || '',
        meta: { enabled: portalSettings.enabled },
      });
      return sendJson(res, 200, { ok: true, message: portalSettings.enabled ? 'تم تفعيل بوابة ولي الأمر لهذه المدرسة.' : 'تم إيقاف بوابة ولي الأمر لهذه المدرسة.', portalSettings });
    }

    if (reqUrl.pathname === '/api/admin/parent-primary-requests/decide' && req.method === 'POST') {
      const actor = await getUserFromToken(token);
      if (!actor || !['superadmin','principal','supervisor'].includes(String(actor.role || '').trim())) return sendJson(res, 403, { ok: false, message: 'غير مصرح لك باتخاذ هذا الإجراء.' });
      const body = await readJsonBody(req);
      const state = getSharedState();
      const decision = String(body.decision || '').trim().toLowerCase();
      if (!['approve','reject','rollback'].includes(decision)) return sendJson(res, 400, { ok: false, message: 'قرار غير صالح.' });
      const result = await decideParentPrimaryChange(state, actor, body.currentPhone, body.requestedMobile, decision, body.note || '');
      return sendJson(res, 200, { ok: true, message: result.message || 'تم تنفيذ القرار بنجاح.', record: result.record || null });
    }

    if (reqUrl.pathname === '/api/parent/logout' && req.method === 'POST') {
      await deleteSession(token);
      return sendJson(res, 200, { ok: true });
    }

    if (reqUrl.pathname === '/api/health' && req.method === 'GET') {
      return sendJson(res, 200, { ok: true, service: 'ideal-company-platform-server', time: nowIso() });
    }

    if (reqUrl.pathname === '/test' && req.method === 'GET') {
      const html = `<!doctype html><html lang="ar" dir="rtl"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Test</title></head><body style="font-family:sans-serif;padding:20px;background:#f0f0f0">
<h2>اختبار المتصفح</h2>
<div id="out"></div>
<script>
var out = document.getElementById('out');
function log(msg, ok) {
  var d = document.createElement('div');
  d.style.cssText = 'padding:8px;margin:4px 0;border-radius:6px;background:' + (ok ? '#d4edda' : '#f8d7da') + ';color:' + (ok ? '#155724' : '#721c24');
  d.textContent = (ok ? '✓ ' : '✗ ') + msg;
  out.appendChild(d);
}
try { log('JavaScript يعمل', true); } catch(e) { log('خطأ: ' + e, false); }
try { var x = {}; x?.y; log('Optional chaining يعمل', true); } catch(e) { log('Optional chaining لا يعمل: ' + e, false); }
try { var y = null; var z = y ?? 'default'; log('Nullish coalescing يعمل', true); } catch(e) { log('Nullish coalescing لا يعمل: ' + e, false); }
try { (async function(){})(); log('Async/await يعمل', true); } catch(e) { log('Async/await لا يعمل: ' + e, false); }
try { var m = new Map(); log('Map يعمل', true); } catch(e) { log('Map لا يعمل: ' + e, false); }
try { var p = Promise.resolve(); log('Promise يعمل', true); } catch(e) { log('Promise لا يعمل: ' + e, false); }
try { var s = new Set(); log('Set يعمل', true); } catch(e) { log('Set لا يعمل: ' + e, false); }
try { fetch('/api/health').then(function(r){return r.json()}).then(function(d){log('Fetch API يعمل: ' + JSON.stringify(d), true)}).catch(function(e){log('Fetch خطأ: ' + e, false)}); } catch(e) { log('Fetch لا يعمل: ' + e, false); }
log('User Agent: ' + navigator.userAgent, true);
<\/script></body></html>`;
      res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
      res.end(html);
      return;
    }

    if (reqUrl.pathname === '/api/debug/dist' && req.method === 'GET') {
      const { readdirSync: rds } = await import('fs');
      let files = [];
      try { files = rds(path.join(DIST_DIR, 'assets')); } catch(e) { files = ['ERROR: ' + e.message]; }
      return sendJson(res, 200, { distDir: DIST_DIR, files, indexExists: existsSync(path.join(DIST_DIR, 'index.html')) });
    }

    if (reqUrl.pathname === '/api/bootstrap' && req.method === 'GET') {
      const state = getSharedState();
      const user = await getUserFromToken(token);
      return sendJson(res, 200, { ok: true, state: sanitizeStateForClient(state), sessionUser: user });
    }

    if (reqUrl.pathname === '/api/auth/login' && req.method === 'POST') {
      const body = await readJsonBody(req);
      const username = String(body.username || '').trim().toLowerCase();
      const password = String(body.password || '');
      const state = getSharedState();
      const authSettings = hydrateAuthSettings(state.settings || {});
      if (authSettings.allowPasswordLogin === false) {
        auditAuthEvent('auth_login_blocked', { identifier: username, reason: 'password_login_disabled' });
        return sendJson(res, 403, { ok: false, message: 'تسجيل الدخول بكلمة المرور معطل من الإعدادات.' });
      }
      const matchedUser = state.users.find((item) => item.username.toLowerCase() === username);
      const activePasswordLock = matchedUser ? await getActiveAuthLockout(username, matchedUser.id, 'password') : await getActiveAuthLockout(username, null, 'password');
      if (activePasswordLock) {
        auditAuthEvent('auth_login_blocked', { identifier: username, userId: matchedUser?.id || null, reason: 'temporary_lockout', expiresAt: activePasswordLock.expires_at, scope: activePasswordLock.scope }, matchedUser ? { username: matchedUser.username, role: matchedUser.role } : null);
        return sendJson(res, 423, { ok: false, message: getAuthLockoutMessage(activePasswordLock), lockout: { expiresAt: activePasswordLock.expires_at, scope: activePasswordLock.scope } });
      }
      const user = state.users.find((item) => item.username.toLowerCase() === username && verifyPassword(password, item.password) && item.status === 'نشط');
      if (!user) {
        auditAuthEvent('auth_login_failed', { identifier: username, reason: matchedUser ? 'invalid_password_or_inactive' : 'user_not_found', userId: matchedUser?.id || null, role: matchedUser?.role || '' }, matchedUser ? { username: matchedUser.username, role: matchedUser.role } : null);
        const lockResult = await registerAuthFailureAndMaybeLock(state, 'password', username, matchedUser || null, matchedUser ? { username: matchedUser.username, role: matchedUser.role } : null);
        if (lockResult.locked) {
          return sendJson(res, 423, { ok: false, message: getAuthLockoutMessage(lockResult.lockout), lockout: { expiresAt: lockResult.lockout.expires_at, scope: lockResult.lockout.scope } });
        }
        return sendJson(res, 401, { ok: false, message: 'بيانات الدخول غير صحيحة أو أن الحساب موقوف.' });
      }
      const school = state.schools.find((item) => item.id === user.schoolId);
      if (!isRoleEnabledForSchool(user.role, school)) {
        auditAuthEvent('auth_login_blocked', { identifier: username, userId: user.id, reason: 'role_disabled_for_school' }, { username: user.username, role: user.role });
        return sendJson(res, 403, { ok: false, message: 'هذا الدور غير مفعل لهذه المدرسة من قبل الأدمن العام.' });
      }
      if (!isPasswordLoginAllowedForUser(user, authSettings)) {
        auditAuthEvent('auth_login_blocked', { identifier: username, userId: user.id, reason: 'otp_only_user' }, { username: user.username, role: user.role });
        return sendJson(res, 403, { ok: false, message: 'هذا الحساب محدد للدخول بالرمز فقط حسب إعدادات الأدمن.' });
      }
      await clearAuthLockouts(username, user.id, { username: user.username, role: user.role });
      const sessionToken = await createSession(user);
      return sendJson(res, 200, { ok: true, token: sessionToken, user: sanitizeUser(user) });
    }

    if (reqUrl.pathname === '/api/auth/request-otp' && req.method === 'POST') {
      const body = await readJsonBody(req);
      const identifier = String(body.identifier || '').trim();
      const delivery = String(body.delivery || 'email').trim().toLowerCase();
      const state = getSharedState();
      const authSettings = hydrateAuthSettings(state.settings || {});
      if (!(authSettings.otpEnabled || authSettings.passwordlessEnabled)) {
        auditAuthEvent('auth_request_otp_blocked', { identifier, delivery, reason: 'otp_disabled' });
        return sendJson(res, 403, { ok: false, message: 'الدخول برمز التحقق غير مفعّل من الإعدادات.' });
      }
      if (!identifier) {
        auditAuthEvent('auth_request_otp_failed', { identifier, delivery, reason: 'missing_identifier' });
        return sendJson(res, 400, { ok: false, message: 'أدخل اسم المستخدم أو وسيلة التعريف أولاً.' });
      }
      if (!authSettings.delivery?.[delivery]) {
        auditAuthEvent('auth_request_otp_blocked', { identifier, delivery, reason: 'delivery_disabled' });
        return sendJson(res, 400, { ok: false, message: 'قناة التحقق المختارة غير مفعلة.' });
      }
      const preMatchedUser = findUserByIdentifier(state, identifier, authSettings.identifierMode || 'username');
      const activeOtpLock = await getActiveAuthLockout(identifier, preMatchedUser?.id ?? null, 'otp');
      if (activeOtpLock) {
        auditAuthEvent('auth_request_otp_blocked', { identifier, delivery, userId: preMatchedUser?.id || null, reason: 'temporary_lockout', expiresAt: activeOtpLock.expires_at, scope: activeOtpLock.scope }, preMatchedUser ? { username: preMatchedUser.username, role: preMatchedUser.role } : null);
        return sendJson(res, 423, { ok: false, message: getAuthLockoutMessage(activeOtpLock), lockout: { expiresAt: activeOtpLock.expires_at, scope: activeOtpLock.scope } });
      }
      const user = preMatchedUser;
      if (!user || user.status !== 'نشط') {
        auditAuthEvent('auth_request_otp_failed', { identifier, delivery, reason: 'user_not_found_or_inactive' });
        return sendJson(res, 400, { ok: false, message: 'تعذر العثور على حساب نشط بهذه البيانات.' });
      }
      if (!isOtpAllowedForUser(user, authSettings)) {
        auditAuthEvent('auth_request_otp_blocked', { identifier, delivery, userId: user.id, reason: 'user_not_eligible' }, { username: user.username, role: user.role });
        return sendJson(res, 403, { ok: false, message: 'هذا الحساب غير مشمول بخدمة OTP حسب إعدادات الأدمن.' });
      }
      const school = state.schools.find((item) => Number(item.id) === Number(user.schoolId));
      if (!isRoleEnabledForSchool(user.role, school)) {
        auditAuthEvent('auth_request_otp_blocked', { identifier, delivery, userId: user.id, reason: 'role_disabled_for_school' }, { username: user.username, role: user.role });
        return sendJson(res, 403, { ok: false, message: 'هذا الدور غير مفعل لهذه المدرسة من قبل الأدمن العام.' });
      }
      const code = generateOtpCode(authSettings.otpLength || 6);
      const request = await createAuthOtpRequest(user, identifier, delivery, code, authSettings);
      try {
        const dispatchResult = await dispatchAuthOtp(state, user, delivery, code, authSettings);
        await finalizeAuthOtpDestination(request.id, dispatchResult.destinationPreview || '');
        auditAuthEvent('auth_request_otp_success', { delivery, userId: user.id, identifier, destinationPreview: dispatchResult.destinationPreview || '' }, { username: user.username, role: user.role });
        return sendJson(res, 200, { ok: true, message: `تم إرسال رمز التحقق عبر ${delivery === 'email' ? 'البريد الإلكتروني' : delivery === 'sms' ? 'SMS' : 'واتساب'}.`, delivery, expiresAt: request.expiresAt, destinationPreview: dispatchResult.destinationPreview || '', previewCode: dispatchResult.previewCode });
      } catch (error) {
        auditAuthEvent('auth_request_otp_failed', { identifier, delivery, userId: user.id, reason: error?.message || 'dispatch_failed' }, { username: user.username, role: user.role });
        return sendJson(res, 400, { ok: false, message: error?.message || 'تعذر إرسال رمز التحقق.' });
      }
    }

    if (reqUrl.pathname === '/api/auth/verify-otp' && req.method === 'POST') {
      const body = await readJsonBody(req);
      const identifier = String(body.identifier || '').trim();
      const code = String(body.code || '').trim();
      const state = getSharedState();
      const authSettings = hydrateAuthSettings(state.settings || {});
      if (!(authSettings.otpEnabled || authSettings.passwordlessEnabled)) {
        auditAuthEvent('auth_verify_otp_blocked', { identifier, reason: 'otp_disabled' });
        return sendJson(res, 403, { ok: false, message: 'الدخول برمز التحقق غير مفعّل من الإعدادات.' });
      }
      if (!identifier || !code) {
        auditAuthEvent('auth_verify_otp_failed', { identifier, reason: 'missing_identifier_or_code' });
        return sendJson(res, 400, { ok: false, message: 'أدخل المعرّف والرمز أولاً.' });
      }
      const preMatchedUser = findUserByIdentifier(state, identifier, authSettings.identifierMode || 'username');
      const activeOtpLock = await getActiveAuthLockout(identifier, preMatchedUser?.id ?? null, 'otp');
      if (activeOtpLock) {
        auditAuthEvent('auth_verify_otp_blocked', { identifier, userId: preMatchedUser?.id || null, reason: 'temporary_lockout', expiresAt: activeOtpLock.expires_at, scope: activeOtpLock.scope }, preMatchedUser ? { username: preMatchedUser.username, role: preMatchedUser.role } : null);
        return sendJson(res, 423, { ok: false, message: getAuthLockoutMessage(activeOtpLock), lockout: { expiresAt: activeOtpLock.expires_at, scope: activeOtpLock.scope } });
      }
      const user = preMatchedUser;
      if (!user || user.status !== 'نشط') {
        auditAuthEvent('auth_verify_otp_failed', { identifier, reason: 'user_not_found_or_inactive' });
        return sendJson(res, 400, { ok: false, message: 'الحساب غير موجود أو غير نشط.' });
      }
      if (!isOtpAllowedForUser(user, authSettings)) {
        auditAuthEvent('auth_verify_otp_blocked', { identifier, userId: user.id, reason: 'user_not_eligible' }, { username: user.username, role: user.role });
        return sendJson(res, 403, { ok: false, message: 'هذا الحساب غير مشمول بخدمة OTP حسب إعدادات الأدمن.' });
      }
      const school = state.schools.find((item) => Number(item.id) === Number(user.schoolId));
      if (!isRoleEnabledForSchool(user.role, school)) {
        auditAuthEvent('auth_verify_otp_blocked', { identifier, userId: user.id, reason: 'role_disabled_for_school' }, { username: user.username, role: user.role });
        return sendJson(res, 403, { ok: false, message: 'هذا الدور غير مفعل لهذه المدرسة من قبل الأدمن العام.' });
      }
      const verified = await verifyAndConsumeAuthOtp(user, identifier, code);
      if (!verified.ok) {
        auditAuthEvent('auth_verify_otp_failed', { identifier, userId: user.id, reason: verified?.message || 'verification_failed' }, { username: user.username, role: user.role });
        const lockResult = await registerAuthFailureAndMaybeLock(state, 'otp', identifier, user, { username: user.username, role: user.role });
        if (lockResult.locked) {
          return sendJson(res, 423, { ok: false, message: getAuthLockoutMessage(lockResult.lockout), lockout: { expiresAt: lockResult.lockout.expires_at, scope: lockResult.lockout.scope } });
        }
        return sendJson(res, 400, verified);
      }
      await clearAuthLockouts(identifier, user.id, { username: user.username, role: user.role });
      const sessionToken = await createSession(user);
      auditAuthEvent('auth_verify_otp_success', { userId: user.id, delivery: verified.row.delivery }, { username: user.username, role: user.role });
      return sendJson(res, 200, { ok: true, token: sessionToken, user: sanitizeUser(user) });
    }

    if (reqUrl.pathname === '/api/auth/test-delivery' && req.method === 'POST') {
      const actor = await getUserFromToken(token);
      if (!actor || actor.role !== 'superadmin') return sendJson(res, 403, { ok: false, message: 'هذه الصفحة والصلاحية للأدمن الرئيسي فقط.' });
      const body = await readJsonBody(req);
      const state = getSharedState();
      try {
        const result = await runAuthDeliveryTest(state, actor, body);
        return sendJson(res, 200, { ok: true, ...result });
      } catch (error) {
        return sendJson(res, 400, { ok: false, message: error?.message || 'تعذر تنفيذ اختبار القناة.' });
      }
    }

    if (reqUrl.pathname === '/api/auth/test-otp-scenario' && req.method === 'POST') {
      const actor = await getUserFromToken(token);
      if (!actor || actor.role !== 'superadmin') return sendJson(res, 403, { ok: false, message: 'هذه الصفحة والصلاحية للأدمن الرئيسي فقط.' });
      const body = await readJsonBody(req);
      const state = getSharedState();
      try {
        const result = await runAuthOtpScenarioTest(state, actor, body);
        return sendJson(res, 200, { ok: true, ...result });
      } catch (error) {
        return sendJson(res, 400, { ok: false, message: error?.message || 'تعذر تنفيذ اختبار OTP.' });
      }
    }

    if (reqUrl.pathname === '/api/auth/logs' && req.method === 'GET') {
      const actor = await getUserFromToken(token);
      if (!actor || actor.role !== 'superadmin') return sendJson(res, 403, { ok: false, message: 'هذه الصفحة والصلاحية للأدمن الرئيسي فقط.' });
      const limit = Number(reqUrl.searchParams.get('limit') || 200);
      return sendJson(res, 200, { ok: true, logs: await readAuthLogs(limit) });
    }

    if (reqUrl.pathname === '/api/auth/logout' && req.method === 'POST') {
      const user = await getUserFromToken(token);
      await deleteSession(token);
      auditAuthEvent('logout', {}, user);
      return sendJson(res, 200, { ok: true });
    }

    if (reqUrl.pathname === '/api/auth/request-reset' && req.method === 'POST') {
      const body = await readJsonBody(req);
      const identifier = String(body.identifier || '').trim().toLowerCase();
      if (!identifier) {
        return sendJson(res, 400, { ok: false, message: 'أدخل اسم المستخدم أو البريد الإلكتروني.' });
      }
      const state = getSharedState();
      const user = (state.users || []).find((item) => String(item.username || '').toLowerCase() === identifier || String(item.email || '').toLowerCase() === identifier);
      if (!user || !String(user.email || '').trim()) {
        return sendJson(res, 200, { ok: true, delivery: 'generic', message: 'إذا كان الحساب موجودًا ومرتبطًا ببريد إلكتروني فسيتم تجهيز إعادة التعيين له.' });
      }
      const request = await createPasswordResetRequest(user);
      return sendJson(res, 200, { ok: true, delivery: process.env.SMTP_HOST ? 'email' : 'manual', message: process.env.SMTP_HOST ? 'تم تجهيز إعادة التعيين وإرسالها للبريد الإلكتروني المرتبط بالحساب.' : 'تم إنشاء رمز إعادة تعيين مؤقت لهذا الحساب في البيئة التجريبية.', previewCode: process.env.SMTP_HOST ? undefined : request.code, expiresAt: request.expiresAt });
    }

    if (reqUrl.pathname === '/api/auth/confirm-reset' && req.method === 'POST') {
      const body = await readJsonBody(req);
      const identifier = String(body.identifier || '').trim().toLowerCase();
      const code = String(body.code || '').trim();
      const newPassword = String(body.newPassword || '');
      if (!identifier || !code || !newPassword.trim()) {
        return sendJson(res, 400, { ok: false, message: 'أكمل بيانات إعادة التعيين.' });
      }
      if (newPassword.trim().length < 6) {
        return sendJson(res, 400, { ok: false, message: 'كلمة المرور الجديدة يجب ألا تقل عن 6 أحرف.' });
      }
      const state = getSharedState();
      const user = (state.users || []).find((item) => String(item.username || '').toLowerCase() === identifier || String(item.email || '').toLowerCase() === identifier);
      if (!user) {
        return sendJson(res, 400, { ok: false, message: 'الحساب المطلوب غير موجود.' });
      }
      const consumed = await consumePasswordResetRequest(user, code);
      if (!consumed.ok) {
        return sendJson(res, 400, consumed);
      }
      const next = structuredClone(state);
      next.users = (next.users || []).map((item) => Number(item.id) !== Number(user.id) ? item : { ...item, password: await hashPassword(newPassword.trim()) });
      await saveSharedState(next, { username: user.username, role: user.role, id: user.id, schoolId: user.schoolId ?? null });
      await audit({ username: user.username, role: user.role }, 'confirm_password_reset', { userId: user.id });
      return sendJson(res, 200, { ok: true, message: 'تم تحديث كلمة المرور بنجاح. يمكنك الدخول الآن.' });
    }

    if (reqUrl.pathname === '/api/auth/change-password' && req.method === 'POST') {
      const actor = await getUserFromToken(token);
      if (!actor) return sendJson(res, 401, { ok: false, message: 'الجلسة منتهية أو غير صالحة.' });
      const body = await readJsonBody(req);
      const currentPassword = String(body.currentPassword || '');
      const newPassword = String(body.newPassword || '').trim();
      const confirmPassword = String(body.confirmPassword || '').trim();
      if (!currentPassword || !newPassword || !confirmPassword) {
        return sendJson(res, 400, { ok: false, message: 'أكمل كلمة المرور الحالية والجديدة وتأكيدها.' });
      }
      if (newPassword.length < 6) {
        return sendJson(res, 400, { ok: false, message: 'كلمة المرور الجديدة يجب ألا تقل عن 6 أحرف.' });
      }
      if (newPassword !== confirmPassword) {
        return sendJson(res, 400, { ok: false, message: 'تأكيد كلمة المرور الجديدة غير متطابق.' });
      }
      const state = getSharedState();
      const user = (state.users || []).find((item) => Number(item.id) === Number(actor.id));
      if (!user) {
        return sendJson(res, 404, { ok: false, message: 'تعذر العثور على الحساب الحالي.' });
      }
      if (!(await verifyPassword(currentPassword, user.password))) {
        return sendJson(res, 400, { ok: false, message: 'كلمة المرور الحالية غير صحيحة.' });
      }
      const next = structuredClone(state);
      next.users = (next.users || []).map((item) => Number(item.id) !== Number(actor.id) ? item : { ...item, password: await hashPassword(newPassword.trim()) });
      await saveSharedState(next, { username: user.username, role: user.role, id: user.id, schoolId: user.schoolId ?? null });
      await audit({ username: user.username, role: user.role }, 'change_password', { userId: user.id });
      return sendJson(res, 200, { ok: true, message: 'تم تغيير كلمة المرور بنجاح.' });
    }

    if (reqUrl.pathname === '/api/schools' && req.method === 'POST') {
      const actor = await getUserFromToken(token);
      if (!actor || actor.role !== 'superadmin') return sendJson(res, 403, { ok: false, message: 'هذه الصلاحية للأدمن الرئيسي فقط.' });
      const body = await readJsonBody(req);
      const state = getSharedState();
      const newSchool = {
        id: Math.max(0, ...state.schools.map((s) => s.id)) + 1,
        name: String(body.name || '').trim(),
        city: String(body.city || '').trim(),
        code: String(body.code || '').trim(),
        manager: String(body.manager || '').trim(),
        status: 'نشطة',
        companies: [],
        students: [],
        principalProfile: {
          username: String(body.principalUsername || '').trim().toLowerCase(),
          email: String(body.principalEmail || '').trim().toLowerCase(),
          password: await hashPassword(String(body.principalPassword || '').trim()),
          mobile: String(body.principalPhone || '').trim(),
        },
      };

      if (!newSchool.name || !newSchool.city || !newSchool.code || !newSchool.principalProfile.username || !newSchool.principalProfile.email || !newSchool.principalProfile.password || !newSchool.principalProfile.mobile) {
        return sendJson(res, 400, { ok: false, message: 'يرجى إكمال جميع حقول المدرسة ومديرها.' });
      }

      if (state.schools.some((s) => s.code === newSchool.code)) {
        return sendJson(res, 400, { ok: false, message: 'الرقم الوزاري مستخدم بالفعل.' });
      }
      if (state.users.some((u) => u.username === newSchool.principalProfile.username)) {
        return sendJson(res, 400, { ok: false, message: 'اسم دخول المدير مستخدم بالفعل.' });
      }
      if (state.users.some((u) => u.email === newSchool.principalProfile.email)) {
        return sendJson(res, 400, { ok: false, message: 'البريد الإلكتروني للمدير مستخدم بالفعل.' });
      }

      const nextState = structuredClone(state);
      nextState.schools.push(newSchool);

      const nextUserId = Math.max(0, ...nextState.users.map((user) => user.id)) + 1;
      const seededUsers = createSeedUsersForSchool(newSchool, nextUserId);
      nextState.users.push(...seededUsers);

      const saved = await saveSharedState(nextState, actor);
      return sendJson(res, 200, { ok: true, message: 'تمت إضافة المدرسة بنجاح.', school: newSchool, state: sanitizeStateForClient(saved) });
    }

    const schoolUpdateMatch = reqUrl.pathname.match(/^\/api\/schools\/(\d+)$/);
    if (schoolUpdateMatch && req.method === 'PUT') {
      const actor = await getUserFromToken(token);
      if (!actor || actor.role !== 'superadmin') return sendJson(res, 403, { ok: false, message: 'هذه الصلاحية للأدمن الرئيسي فقط.' });
      const schoolId = Number(schoolUpdateMatch[1]);
      const body = await readJsonBody(req);
      const state = getSharedState();
      const schoolIndex = state.schools.findIndex((s) => s.id === schoolId);
      if (schoolIndex === -1) return sendJson(res, 404, { ok: false, message: 'المدرسة غير موجودة.' });

      const nextState = structuredClone(state);
      const existingSchool = nextState.schools[schoolIndex];

      const updatedSchool = {
        ...existingSchool,
        name: String(body.name || existingSchool.name).trim(),
        city: String(body.city || existingSchool.city).trim(),
        code: String(body.code || existingSchool.code).trim(),
        manager: String(body.manager || existingSchool.manager).trim(),
        status: String(body.status || existingSchool.status).trim(),
      };

      // تحديث بيانات مدير المدرسة إذا تم إرسالها
      if (body.principalUsername || body.principalEmail || body.principalPassword || body.principalPhone) {
        const principalUser = nextState.users.find(u => u.schoolId === schoolId && u.role === 'principal');
        if (principalUser) {
          principalUser.username = String(body.principalUsername || principalUser.username).trim().toLowerCase();
          principalUser.email = String(body.principalEmail || principalUser.email).trim().toLowerCase();
          principalUser.mobile = String(body.principalPhone || principalUser.mobile).trim();
          if (body.principalPassword) {
            principalUser.password = await hashPassword(String(body.principalPassword).trim());
          }
        }
        updatedSchool.principalProfile = {
          ...existingSchool.principalProfile,
          username: String(body.principalUsername || existingSchool.principalProfile?.username).trim().toLowerCase(),
          email: String(body.principalEmail || existingSchool.principalProfile?.email).trim().toLowerCase(),
          mobile: String(body.principalPhone || existingSchool.principalProfile?.mobile).trim(),
          password: body.principalPassword ? await hashPassword(String(body.principalPassword).trim()) : existingSchool.principalProfile?.password,
        };
      }

      nextState.schools[schoolIndex] = updatedSchool;

      const saved = await saveSharedState(nextState, actor);
      return sendJson(res, 200, { ok: true, message: 'تم تحديث بيانات المدرسة بنجاح.', school: updatedSchool, state: sanitizeStateForClient(saved) });
    }

    if (reqUrl.pathname === '/api/auth/admin-reset-password' && req.method === 'POST') {
      const actor = await getUserFromToken(token);
      if (!actor) return sendJson(res, 401, { ok: false, message: 'الجلسة منتهية أو غير صالحة.' });
      const body = await readJsonBody(req);
      const targetUserId = Number(body.userId || 0);
      const newPassword = String(body.newPassword || '').trim();
      const confirmPassword = String(body.confirmPassword || '').trim();
      if (!targetUserId || !newPassword || !confirmPassword) {
        return sendJson(res, 400, { ok: false, message: 'أكمل المستخدم المستهدف وكلمة المرور الجديدة وتأكيدها.' });
      }
      if (newPassword.length < 6) {
        return sendJson(res, 400, { ok: false, message: 'كلمة المرور الجديدة يجب ألا تقل عن 6 أحرف.' });
      }
      if (newPassword !== confirmPassword) {
        return sendJson(res, 400, { ok: false, message: 'تأكيد كلمة المرور الجديدة غير متطابق.' });
      }
      const state = getSharedState();
      const actorFull = (state.users || []).find((item) => Number(item.id) === Number(actor.id));
      const targetUser = (state.users || []).find((item) => Number(item.id) === targetUserId);
      if (!actorFull || !targetUser) {
        return sendJson(res, 404, { ok: false, message: 'تعذر العثور على الحساب المطلوب.' });
      }
      const actorCanManage = actorFull.role === 'superadmin' || (actorFull.role === 'principal' && actorFull.permissions?.users);
      if (!actorCanManage) {
        return sendJson(res, 403, { ok: false, message: 'ليس لديك صلاحية إعادة تعيين كلمات المرور.' });
      }
      if (Number(actorFull.id) === Number(targetUser.id)) {
        return sendJson(res, 400, { ok: false, message: 'استخدم شاشة أمان الحساب لتغيير كلمة مرورك الشخصية.' });
      }
      if (actorFull.role !== 'superadmin') {
        if (Number(actorFull.schoolId) !== Number(targetUser.schoolId)) {
          return sendJson(res, 403, { ok: false, message: 'يمكنك إعادة تعيين كلمات المرور داخل مدرستك فقط.' });
        }
        if (targetUser.role === 'superadmin') {
          return sendJson(res, 403, { ok: false, message: 'لا يمكن إعادة تعيين كلمة مرور الأدمن العام من هذا الحساب.' });
        }
      }
      if (verifyPassword(newPassword, targetUser.password)) {
        return sendJson(res, 400, { ok: false, message: 'كلمة المرور الجديدة مطابقة لكلمة المرور الحالية لهذا المستخدم.' });
      }
      const next = structuredClone(state);
      next.users = (next.users || []).map((item) => Number(item.id) !== Number(targetUser.id) ? item : { ...item, password: newPassword });
      await saveSharedState(next, { username: actorFull.username, role: actorFull.role, id: actorFull.id, schoolId: actorFull.schoolId ?? null });
      await audit({ username: actorFull.username, role: actorFull.role }, 'admin_reset_password', { targetUserId: targetUser.id, targetUsername: targetUser.username, targetRole: targetUser.role });
      return sendJson(res, 200, { ok: true, message: `تمت إعادة تعيين كلمة مرور المستخدم ${targetUser.name || targetUser.username} بنجاح.` });
    }

    if (reqUrl.pathname === '/api/state/save' && req.method === 'POST') {
      const actor = await getUserFromToken(token);
      if (!actor) return sendJson(res, 401, { ok: false, message: 'الجلسة منتهية أو غير صالحة.' });
      if (actor.role === 'student') return sendJson(res, 403, { ok: false, message: 'هذا الحساب لا يملك صلاحية حفظ بيانات المنصة.' });
      const body = await readJsonBody(req);
      const incomingState = body.state || body;
      const currentState = getSharedState();
      const merged = mergeStateByRole(currentState, incomingState, actor);
      const saved = await saveSharedState(merged, actor);
      return sendJson(res, 200, { ok: true, state: sanitizeStateForClient(saved), sessionUser: actor });
    }

    if (reqUrl.pathname === '/api/state/reset' && req.method === 'POST') {
      const actor = await getUserFromToken(token);
      if (!actor || actor.role !== 'superadmin') return sendJson(res, 403, { ok: false, message: 'فقط الأدمن العام يمكنه إعادة تهيئة المنصة.' });
      const fresh = createDefaultSharedState();
      await saveSharedState(fresh, actor);
      return sendJson(res, 200, { ok: true, state: sanitizeStateForClient(fresh), sessionUser: actor });
    }

    if (reqUrl.pathname === '/api/state/export' && req.method === 'GET') {
      const actor = await getUserFromToken(token);
      if (!actor) return sendJson(res, 401, { ok: false, message: 'يلزم تسجيل الدخول أولاً.' });
      const state = getSharedState();
      const payload = JSON.stringify(sanitizeStateForClient(state), null, 2);
      res.writeHead(200, {
        'Content-Type': 'application/json; charset=utf-8',
        'Content-Disposition': `attachment; filename="platform-state-export.json"`,
        'Content-Length': Buffer.byteLength(payload),
        'Access-Control-Allow-Origin': '*',
      });
      res.end(payload);
      return;
    }


    if (reqUrl.pathname === '/api/backups/status' && req.method === 'GET') {
      const actor = await getUserFromToken(token);
      if (!actor || actor.role !== 'superadmin') return sendJson(res, 403, { ok: false, message: 'فقط الأدمن العام يمكنه عرض حالة النسخ الاحتياطي.' });
      const latestPath = path.join(BACKUPS_DIR, 'latest.json');
      let latest = null;
      if (existsSync(latestPath)) {
        try { latest = JSON.parse(readFileSync(latestPath, 'utf8')); } catch {}
      }
      return sendJson(res, 200, { ok: true, backupsDir: BACKUPS_DIR, retentionDays: BACKUP_RETENTION_DAYS, latest });
    }

    const schoolDeviceMatch = reqUrl.pathname.match(/^\/api\/schools\/(\d+)\/device-links$/);
    if (schoolDeviceMatch && req.method === 'POST') {
      const actor = await getUserFromToken(token);
      const schoolId = Number(schoolDeviceMatch[1]);
      if (!canManageSchoolDevices(actor, schoolId)) return sendJson(res, 403, { ok: false, message: 'ليس لديك صلاحية إدارة روابط الأجهزة لهذه المدرسة.' });
      const body = await readJsonBody(req);
      const kind = body.kind === 'screen' ? 'screen' : 'gate';
      const current = getSharedState();
      const next = structuredClone(current);
      const school = next.schools.find((item) => Number(item.id) === schoolId);
      if (!school) return sendJson(res, 404, { ok: false, message: 'المدرسة غير موجودة.' });
      const smartLinks = school.smartLinks || { gates: [], screens: [] };
      if (kind === 'gate') {
        const gate = {
          id: `gate-${Date.now()}`,
          name: String(body.name || `بوابة ${smartLinks.gates.length + 1}`).trim(),
          token: createPublicToken('gate'),
          mode: ['qr', 'face', 'mixed'].includes(body.mode) ? body.mode : 'mixed',
          createdAt: nowIso(),
        };
        smartLinks.gates = [...(smartLinks.gates || []), gate];
        school.smartLinks = smartLinks;
        const saved = await await saveSharedState(next, actor);
        return sendJson(res, 200, { ok: true, link: gate, state: sanitizeStateForClient(saved) });
      }
      const screen = {
        id: `screen-${Date.now()}`,
        name: String(body.name || `شاشة ${smartLinks.screens.length + 1}`).trim(),
        token: createPublicToken('screen'),
        title: String(body.title || 'لوحة المدرسة الحية').trim(),
        transition: SCREEN_TRANSITION_KEYS.includes(body.transition) ? body.transition : 'fade',
        rotateSeconds: Math.max(4, Math.min(30, Number(body.rotateSeconds) || 8)),
        widgets: {
          metrics: body.widgets?.metrics !== false,
          topStudents: body.widgets?.topStudents !== false,
          topCompanies: body.widgets?.topCompanies !== false,
          attendanceChart: body.widgets?.attendanceChart !== false,
          recentActivity: body.widgets?.recentActivity !== false,
        },
        // خصائص الشريط الإخباري للشاشة
        tickerEnabled: body.tickerEnabled === true || body.tickerEnabled === 'true',
        tickerText: String(body.tickerText || ''),
        tickerDir: body.tickerDir === 'ltr' ? 'ltr' : 'rtl',
        theme: SCREEN_THEME_KEYS.includes(body.theme) ? body.theme : 'emerald-night',
        template: SCREEN_TEMPLATE_KEYS.includes(body.template) ? body.template : 'executive',
        tickerBg: TICKER_BG_KEYS.includes(body.tickerBg) ? body.tickerBg : 'amber',
        tickerSeparator: String(body.tickerSeparator || ' ✦ '),
        tickerFontSize: Math.max(18, Math.min(56, Number(body.tickerFontSize) || 28)),
        tickerShowLogo: body.tickerShowLogo !== false,
        tickerLayout: body.tickerLayout === 'stacked' ? 'stacked' : 'marquee',
        createdAt: nowIso(),
      };
      smartLinks.screens = [...(smartLinks.screens || []), screen];
      school.smartLinks = smartLinks;
      const saved = await await saveSharedState(next, actor);
      return sendJson(res, 200, { ok: true, link: screen, state: sanitizeStateForClient(saved) });
    }

    const schoolDeviceUpdateMatch = reqUrl.pathname.match(/^\/api\/schools\/(\d+)\/device-links\/screen\/([^/]+)$/);
    if (schoolDeviceUpdateMatch && req.method === 'PATCH') {
      const actor = await getUserFromToken(token);
      const schoolId = Number(schoolDeviceUpdateMatch[1]);
      const screenId = schoolDeviceUpdateMatch[2];
      if (!canManageSchoolDevices(actor, schoolId)) return sendJson(res, 403, { ok: false, message: 'ليس لديك صلاحية تعديل هذا الرابط.' });
      const body = await readJsonBody(req);
      const current = getSharedState();
      const next = structuredClone(current);
      const school = next.schools.find((item) => Number(item.id) === schoolId);
      if (!school) return sendJson(res, 404, { ok: false, message: 'المدرسة غير موجودة.' });
      const screen = (school.smartLinks?.screens || []).find((item) => item.id === screenId);
      if (!screen) return sendJson(res, 404, { ok: false, message: 'الرابط غير موجود.' });
      if (typeof body.name === 'string') screen.name = String(body.name).trim();
      if (typeof body.title === 'string') screen.title = String(body.title).trim();
      if (SCREEN_TRANSITION_KEYS.includes(body.transition)) screen.transition = body.transition;
      if (body.rotateSeconds !== undefined) {
        const r = Math.max(4, Math.min(30, Number(body.rotateSeconds) || 8));
        screen.rotateSeconds = r;
      }
      if (body.widgets && typeof body.widgets === 'object') {
        screen.widgets.metrics = body.widgets.metrics !== false;
        screen.widgets.topStudents = body.widgets.topStudents !== false;
        screen.widgets.topCompanies = body.widgets.topCompanies !== false;
        screen.widgets.attendanceChart = body.widgets.attendanceChart !== false;
        screen.widgets.recentActivity = body.widgets.recentActivity !== false;
      }
      if (body.tickerEnabled !== undefined) screen.tickerEnabled = body.tickerEnabled === true || body.tickerEnabled === 'true';
      if (typeof body.tickerText === 'string') screen.tickerText = body.tickerText;
      if (body.tickerDir === 'ltr' || body.tickerDir === 'rtl') screen.tickerDir = body.tickerDir;
      if (SCREEN_THEME_KEYS.includes(body.theme)) screen.theme = body.theme;
      if (SCREEN_TEMPLATE_KEYS.includes(body.template)) screen.template = body.template;
      if (TICKER_BG_KEYS.includes(body.tickerBg)) screen.tickerBg = body.tickerBg;
      if (typeof body.tickerSeparator === 'string') screen.tickerSeparator = String(body.tickerSeparator || ' ✦ ');
      if (body.tickerFontSize !== undefined) screen.tickerFontSize = Math.max(18, Math.min(56, Number(body.tickerFontSize) || 28));
      if (body.tickerShowLogo !== undefined) screen.tickerShowLogo = body.tickerShowLogo !== false;
      if (body.tickerLayout === 'stacked' || body.tickerLayout === 'marquee') screen.tickerLayout = body.tickerLayout;
      if (body.sourceMode === 'school' || body.sourceMode === 'classroom') screen.sourceMode = body.sourceMode;
      if (body.linkedClassroomId !== undefined) screen.linkedClassroomId = body.linkedClassroomId ? String(body.linkedClassroomId) : '';
      const saved = await await saveSharedState(next, actor);
      return sendJson(res, 200, { ok: true, link: screen, state: sanitizeStateForClient(saved) });
    }

    const schoolGateUpdateMatch = reqUrl.pathname.match(/^\/api\/schools\/(\d+)\/device-links\/gate\/([^/]+)$/);
    if (schoolGateUpdateMatch && req.method === 'PATCH') {
      const actor = await getUserFromToken(token);
      const schoolId = Number(schoolGateUpdateMatch[1]);
      const gateId = schoolGateUpdateMatch[2];
      if (!canManageSchoolDevices(actor, schoolId)) return sendJson(res, 403, { ok: false, message: 'ليس لديك صلاحية تعديل هذا الرابط.' });
      const body = await readJsonBody(req);
      const current = getSharedState();
      const next = structuredClone(current);
      const school = next.schools.find((item) => Number(item.id) === schoolId);
      if (!school) return sendJson(res, 404, { ok: false, message: 'المدرسة غير موجودة.' });
      const gate = (school.smartLinks?.gates || []).find((item) => item.id === gateId);
      if (!gate) return sendJson(res, 404, { ok: false, message: 'البوابة غير موجودة.' });
      if (typeof body.name === 'string') gate.name = String(body.name).trim();
      if (['qr', 'face', 'mixed'].includes(body.mode)) gate.mode = body.mode;
      const saved = await saveSharedState(next, actor);
      return sendJson(res, 200, { ok: true, link: gate, state: sanitizeStateForClient(saved) });
    }

    const schoolDeviceDeleteMatch = reqUrl.pathname.match(/^\/api\/schools\/(\d+)\/device-links\/(gate|screen)\/([^/]+)$/);
    if (schoolDeviceDeleteMatch && req.method === 'POST') {
      const actor = await getUserFromToken(token);
      const schoolId = Number(schoolDeviceDeleteMatch[1]);
      const kind = schoolDeviceDeleteMatch[2];
      const linkId = schoolDeviceDeleteMatch[3];
      if (!canManageSchoolDevices(actor, schoolId)) return sendJson(res, 403, { ok: false, message: 'ليس لديك صلاحية حذف هذا الرابط.' });
      const current = getSharedState();
      const next = structuredClone(current);
      const school = next.schools.find((item) => Number(item.id) === schoolId);
      if (!school) return sendJson(res, 404, { ok: false, message: 'المدرسة غير موجودة.' });
      if (kind === 'gate') school.smartLinks.gates = (school.smartLinks?.gates || []).filter((item) => item.id !== linkId);
      else school.smartLinks.screens = (school.smartLinks?.screens || []).filter((item) => item.id !== linkId);
      const saved = await await saveSharedState(next, actor);
      return sendJson(res, 200, { ok: true, state: sanitizeStateForClient(saved) });
    }

    const schoolImportMatch = reqUrl.pathname.match(/^\/api\/schools\/(\d+)\/students\/import$/);
    if (schoolImportMatch && req.method === 'POST') {
      const actor = await getUserFromToken(token);
      const schoolId = Number(schoolImportMatch[1]);
      if (!canManageSchoolDevices(actor, schoolId)) return sendJson(res, 403, { ok: false, message: 'ليس لديك صلاحية استيراد الطلاب لهذه المدرسة.' });
      const body = await readJsonBody(req);
      const imported = importStudentsIntoSchool(getSharedState(), schoolId, Array.isArray(body.rows) ? body.rows : []);
      if (!imported.ok) return sendJson(res, 400, imported);
      const saved = await await saveSharedState(imported.state, actor);
      return sendJson(res, 200, { ok: true, state: sanitizeStateForClient(saved), added: imported.added, skipped: imported.skipped, companiesCreated: imported.companiesCreated });
    }

    const schoolAttendanceBindingMatch = reqUrl.pathname.match(/^\/api\/schools\/(\d+)\/attendance-binding$/);
    if (schoolAttendanceBindingMatch && req.method === 'PATCH') {
      const actor = await getUserFromToken(token);
      const schoolId = Number(schoolAttendanceBindingMatch[1]);
      if (!canManageSchoolDevices(actor, schoolId)) return sendJson(res, 403, { ok: false, message: 'ليس لديك صلاحية تعديل مصدر الحضور لهذه المدرسة.' });
      const body = await readJsonBody(req);
      const current = getSharedState();
      const next = structuredClone(current);
      const school = next.schools.find((item) => Number(item.id) === schoolId);
      if (!school) return sendJson(res, 404, { ok: false, message: 'المدرسة غير موجودة.' });
      const hasStructure = Array.isArray(school?.structure?.classrooms) && school.structure.classrooms.length > 0;
      const sourceMode = hasStructure ? 'structure' : (body?.sourceMode === 'structure' ? 'structure' : 'school');
      const linkedClassroomId = sourceMode === 'structure' && body?.linkedClassroomId ? String(body.linkedClassroomId) : '';
      school.structure = school.structure || {};
      school.structure.attendanceBinding = { sourceMode, linkedClassroomId };
      const saved = await await saveSharedState(next, actor);
      return sendJson(res, 200, { ok: true, attendanceBinding: school.structure.attendanceBinding, state: sanitizeStateForClient(saved) });
    }

    const schoolReportMatch = reqUrl.pathname.match(/^\/api\/schools\/(\d+)\/reports\/executive$/);
    if (schoolReportMatch && req.method === 'GET') {
      const actor = await getUserFromToken(token);
      const schoolId = Number(schoolReportMatch[1]);
      if (!canReadSchoolReports(actor, schoolId)) return sendJson(res, 403, { ok: false, message: 'ليس لديك صلاحية عرض التقارير التنفيذية لهذه المدرسة.' });
      const payload = summarizeSchoolLivePayload(getSharedState(), schoolId);
      if (!payload) return sendJson(res, 404, { ok: false, message: 'المدرسة غير موجودة.' });
      payload.parentPortalSummary = await buildParentPortalExecutiveSummary(getSharedState(), schoolId, actor);
      return sendJson(res, 200, { ok: true, report: payload });
    }

    const schoolMessagingTestMatch = reqUrl.pathname.match(/^\/api\/schools\/(\d+)\/messages\/test$/);
    if (schoolMessagingTestMatch && req.method === 'POST') {
      const actor = await getUserFromToken(token);
      const schoolId = Number(schoolMessagingTestMatch[1]);
      if (!canManageSchoolMessages(actor, schoolId)) return sendJson(res, 403, { ok: false, message: 'ليس لديك صلاحية إدارة الرسائل لهذه المدرسة.' });
      const body = await readJsonBody(req);
      const tested = await testSchoolMessagingIntegration(getSharedState(), schoolId, body.channel === 'sms' ? 'sms' : body.channel === 'internal' ? 'internal' : 'whatsapp', body.settings || null);
      if (tested.state) {
        const saved = await saveSharedState(tested.state, actor);
        return sendJson(res, tested.ok ? 200 : 400, { ok: tested.ok, message: tested.message, providerMessageId: tested.providerMessageId || '', state: sanitizeStateForClient(saved) });
      }
      return sendJson(res, tested.ok ? 200 : 400, tested);
    }

    const schoolMessagingSendMatch = reqUrl.pathname.match(/^\/api\/schools\/(\d+)\/messages\/send$/);
    if (schoolMessagingSendMatch && req.method === 'POST') {
      const actor = await getUserFromToken(token);
      const schoolId = Number(schoolMessagingSendMatch[1]);
      if (!canManageSchoolMessages(actor, schoolId)) return sendJson(res, 403, { ok: false, message: 'ليس لديك صلاحية إدارة الرسائل لهذه المدرسة.' });
      const body = await readJsonBody(req);
      const processed = await processSchoolMessageSend(getSharedState(), schoolId, actor, body || {});
      if (!processed.ok) return sendJson(res, 400, processed);
      const saved = await saveSharedState(processed.state, actor);
      return sendJson(res, 200, { ok: true, message: processed.message, log: processed.log, state: sanitizeStateForClient(saved) });
    }

    const schoolMessagingSettingsMatch = reqUrl.pathname.match(/^\/api\/schools\/(\d+)\/messages\/settings$/);
    if (schoolMessagingSettingsMatch && req.method === 'PATCH') {
      const actor = await getUserFromToken(token);
      const schoolId = Number(schoolMessagingSettingsMatch[1]);
      if (!canManageSchoolMessages(actor, schoolId)) return sendJson(res, 403, { ok: false, message: 'ليس لديك صلاحية إدارة الرسائل لهذه المدرسة.' });
      const body = await readJsonBody(req);
      const current = getSharedState();
      const next = structuredClone(current);
      const school = next.schools.find((item) => Number(item.id) === schoolId);
      if (!school) return sendJson(res, 404, { ok: false, message: 'المدرسة غير موجودة.' });
      school.messaging = school.messaging || {};
      school.messaging.settings = {
        ...(school.messaging.settings || {}),
        ...(body || {}),
        channels: { ...(school.messaging.settings?.channels || {}), ...(body?.channels || {}) },
        operations: { ...(school.messaging.settings?.operations || {}), ...(body?.operations || {}) },
        automation: { ...(school.messaging.settings?.automation || {}), ...(body?.automation || {}) },
        privacy: { ...(school.messaging.settings?.privacy || {}), ...(body?.privacy || {}) },
        integration: {
          whatsapp: { ...(school.messaging.settings?.integration?.whatsapp || {}), ...(body?.integration?.whatsapp || {}) },
          sms: { ...(school.messaging.settings?.integration?.sms || {}), ...(body?.integration?.sms || {}) },
        },
      };
      const saved = await await saveSharedState(next, actor);
      return sendJson(res, 200, { ok: true, state: sanitizeStateForClient(saved) });
    }

    const schoolMessagingTemplateSaveMatch = reqUrl.pathname.match(/^\/api\/schools\/(\d+)\/messages\/templates\/save$/);
    if (schoolMessagingTemplateSaveMatch && req.method === 'POST') {
      const actor = await getUserFromToken(token);
      const schoolId = Number(schoolMessagingTemplateSaveMatch[1]);
      if (!canManageSchoolMessages(actor, schoolId)) return sendJson(res, 403, { ok: false, message: 'ليس لديك صلاحية إدارة الرسائل لهذه المدرسة.' });
      const body = await readJsonBody(req);
      const current = getSharedState();
      const next = structuredClone(current);
      const school = next.schools.find((item) => Number(item.id) === schoolId);
      if (!school) return sendJson(res, 404, { ok: false, message: 'المدرسة غير موجودة.' });
      school.messaging = school.messaging || {};
      school.messaging.templates = Array.isArray(school.messaging.templates) ? school.messaging.templates : [];
      const exists = school.messaging.templates.some((item) => String(item.id) === String(body?.id));
      school.messaging.templates = exists
        ? school.messaging.templates.map((item) => String(item.id) !== String(body?.id) ? item : { ...item, ...(body || {}) })
        : [{ ...(body || {}), id: body?.id || Date.now(), active: body?.active !== false }, ...school.messaging.templates];
      const saved = await await saveSharedState(next, actor);
      return sendJson(res, 200, { ok: true, state: sanitizeStateForClient(saved) });
    }

    const schoolMessagingTemplateDeleteMatch = reqUrl.pathname.match(/^\/api\/schools\/(\d+)\/messages\/templates\/([^/]+)\/delete$/);
    if (schoolMessagingTemplateDeleteMatch && req.method === 'POST') {
      const actor = await getUserFromToken(token);
      const schoolId = Number(schoolMessagingTemplateDeleteMatch[1]);
      const templateId = schoolMessagingTemplateDeleteMatch[2];
      if (!canManageSchoolMessages(actor, schoolId)) return sendJson(res, 403, { ok: false, message: 'ليس لديك صلاحية إدارة الرسائل لهذه المدرسة.' });
      const current = getSharedState();
      const next = structuredClone(current);
      const school = next.schools.find((item) => Number(item.id) === schoolId);
      if (!school) return sendJson(res, 404, { ok: false, message: 'المدرسة غير موجودة.' });
      school.messaging = school.messaging || {};
      school.messaging.templates = (school.messaging.templates || []).filter((item) => String(item.id) !== String(templateId));
      const saved = await await saveSharedState(next, actor);
      return sendJson(res, 200, { ok: true, state: sanitizeStateForClient(saved) });
    }

    const schoolMessagingRuleSaveMatch = reqUrl.pathname.match(/^\/api\/schools\/(\d+)\/messages\/rules\/save$/);
    if (schoolMessagingRuleSaveMatch && req.method === 'POST') {
      const actor = await getUserFromToken(token);
      const schoolId = Number(schoolMessagingRuleSaveMatch[1]);
      if (!canManageSchoolMessages(actor, schoolId)) return sendJson(res, 403, { ok: false, message: 'ليس لديك صلاحية إدارة الرسائل لهذه المدرسة.' });
      const body = await readJsonBody(req);
      const current = getSharedState();
      const next = structuredClone(current);
      const school = next.schools.find((item) => Number(item.id) === schoolId);
      if (!school) return sendJson(res, 404, { ok: false, message: 'المدرسة غير موجودة.' });
      school.messaging = school.messaging || {};
      school.messaging.rules = Array.isArray(school.messaging.rules) ? school.messaging.rules : [];
      const exists = school.messaging.rules.some((item) => String(item.id) === String(body?.id));
      school.messaging.rules = exists
        ? school.messaging.rules.map((item) => String(item.id) !== String(body?.id) ? item : { ...item, ...(body || {}) })
        : [{ ...(body || {}), id: body?.id || Date.now(), active: body?.active !== false }, ...school.messaging.rules];
      const saved = await await saveSharedState(next, actor);
      return sendJson(res, 200, { ok: true, state: sanitizeStateForClient(saved) });
    }

    const schoolMessagingRuleToggleMatch = reqUrl.pathname.match(/^\/api\/schools\/(\d+)\/messages\/rules\/([^/]+)\/toggle$/);
    if (schoolMessagingRuleToggleMatch && req.method === 'POST') {
      const actor = await getUserFromToken(token);
      const schoolId = Number(schoolMessagingRuleToggleMatch[1]);
      const ruleId = schoolMessagingRuleToggleMatch[2];
      if (!canManageSchoolMessages(actor, schoolId)) return sendJson(res, 403, { ok: false, message: 'ليس لديك صلاحية إدارة الرسائل لهذه المدرسة.' });
      const current = getSharedState();
      const next = structuredClone(current);
      const school = next.schools.find((item) => Number(item.id) === schoolId);
      if (!school) return sendJson(res, 404, { ok: false, message: 'المدرسة غير موجودة.' });
      school.messaging = school.messaging || {};
      school.messaging.rules = (school.messaging.rules || []).map((item) => String(item.id) !== String(ruleId) ? item : { ...item, active: item?.active === false });
      const saved = await await saveSharedState(next, actor);
      return sendJson(res, 200, { ok: true, state: sanitizeStateForClient(saved) });
    }

    const schoolStudentsMatch = reqUrl.pathname.match(/^\/api\/schools\/(\d+)\/students$/);
    if (schoolStudentsMatch && req.method === 'GET') {
      const actor = await getUserFromToken(token);
      const schoolId = Number(schoolStudentsMatch[1]);
      if (!canManageSchoolContent(actor, schoolId) && !canReadSchoolReports(actor, schoolId)) return sendJson(res, 403, { ok: false, message: 'ليس لديك صلاحية عرض الطلاب لهذه المدرسة.' });
      const state = getSharedState();
      const school = state.schools.find((item) => Number(item.id) === Number(schoolId));
      if (!school) return sendJson(res, 404, { ok: false, message: 'المدرسة غير موجودة.' });
      const q = String(reqUrl.searchParams.get('q') || '').trim().toLowerCase();
      const allStudents = getUnifiedSchoolStudentsForServer(school, { includeArchived: true, preferStructure: true });
      const students = !q ? allStudents : allStudents.filter((student) => [student.name, student.fullName, student.studentNumber, student.nationalId, student.guardianMobile, student.barcode].some((value) => String(value || '').toLowerCase().includes(q)));
      return sendJson(res, 200, { ok: true, students });
    }

    const schoolStudentFaceMatch = reqUrl.pathname.match(/^\/api\/schools\/(\d+)\/students\/(\d+)\/face$/);
    if (schoolStudentFaceMatch && req.method === 'POST') {
      const actor = await getUserFromToken(token);
      const schoolId = Number(schoolStudentFaceMatch[1]);
      const studentId = Number(schoolStudentFaceMatch[2]);
      if (!canManageStudentActions(actor, schoolId)) return sendJson(res, 403, { ok: false, message: 'ليس لديك صلاحية تعديل بصمة الوجه لهذه المدرسة.' });
      const body = await readJsonBody(req);
      const current = getSharedState();
      const next = structuredClone(current);
      const school = next.schools.find((item) => Number(item.id) === schoolId);
      if (!school) return sendJson(res, 404, { ok: false, message: 'المدرسة غير موجودة.' });

      // دعم structure students: البحث في school.students أولاً ثم في structure.classrooms
      const classroomId = body.classroomId ? Number(body.classroomId) : null;
      let student = school.students.find((item) => Number(item.id) === studentId);
      let structureStudent = null;
      let classroomRef = null;
      if (!student && classroomId && school.structure?.classrooms) {
        classroomRef = school.structure.classrooms.find((c) => Number(c.id) === classroomId);
        if (classroomRef?.students) {
          structureStudent = classroomRef.students.find((item) => Number(item.id) === studentId);
          student = structureStudent;
        }
      }
      // إذا لم يُعثر عليه بعد، ابحث في جميع فصول structure
      if (!student && school.structure?.classrooms) {
        for (const cls of school.structure.classrooms) {
          const found = cls.students?.find((item) => Number(item.id) === studentId);
          if (found) { structureStudent = found; classroomRef = cls; student = found; break; }
        }
      }
      if (!student) return sendJson(res, 404, { ok: false, message: 'الطالب غير موجود.' });

      const signature = Array.isArray(body.signature) ? body.signature : [];
      // تخزين الصورة مباشرة كـ data URL في قاعدة البيانات (دائم على Railway)
      // بدلاً من الـ filesystem الذي يُمسح عند كل إعادة نشر
      let imageUrl = student.facePhoto;
      if (body.imageData) {
        const dataUrl = String(body.imageData);
        if (dataUrl.startsWith('data:')) {
          // حفظ الصورة كـ data URL مباشرة في قاعدة البيانات
          imageUrl = dataUrl;
        } else {
          // محاولة الحفظ في الـ filesystem كـ fallback
          try {
            imageUrl = await writeDataUrlToUploads(FACE_UPLOADS_DIR, [String(schoolId), String(studentId)], `face-${Date.now()}`, body.imageData);
          } catch {
            imageUrl = student.facePhoto;
          }
        }
      }
      student.faceReady = Boolean(signature.length || imageUrl);
      student.faceSignature = signature;
      student.facePhoto = imageUrl || '';
      const saved = await saveSharedState(next, actor);
      const updatedSchool = saved.schools.find((item) => Number(item.id) === schoolId);
      // إرجاع الطالب المحدَّث سواء كان في students أو structure.classrooms
      let updatedStudent = updatedSchool?.students?.find((item) => Number(item.id) === studentId) || null;
      if (!updatedStudent && updatedSchool?.structure?.classrooms) {
        for (const cls of updatedSchool.structure.classrooms) {
          const found = cls.students?.find((item) => Number(item.id) === studentId);
          if (found) { updatedStudent = found; break; }
        }
      }
      return sendJson(res, 200, { ok: true, student: updatedStudent, state: sanitizeStateForClient(saved) });
    }

    const schoolActionApplyMatch = reqUrl.pathname.match(/^\/api\/schools\/(\d+)\/actions\/apply$/);
    if (schoolActionApplyMatch && req.method === 'POST') {
      const actor = await getUserFromToken(token);
      const schoolId = Number(schoolActionApplyMatch[1]);
      if (!canManageStudentActions(actor, schoolId)) return sendJson(res, 403, { ok: false, message: 'ليس لديك صلاحية تنفيذ إجراءات الطلاب لهذه المدرسة.' });
      const body = await readJsonBody(req);
      const applied = applyStudentActionToState(getSharedState(), schoolId, body, actor);
      if (!applied.ok) {
        // إرجاع live حتى عند الفشل لتحديث الإحصائيات في الـ frontend
        const liveOnFail = summarizeSchoolLivePayload(getSharedState(), schoolId);
        return sendJson(res, 400, { ...applied, live: liveOnFail });
      }
      let saved = await saveSharedState(applied.state, actor);
      // إرسال تنبيه داخلي فوري لولي الأمر عند كل إجراء
      try {
        const logEntry = applied.logEntry;
        const studentForNotif = applied.student;
        const guardianPhone = studentForNotif?.guardianMobile || '';
        if (guardianPhone && logEntry) {
          const school = saved.schools.find((s) => Number(s.id) === schoolId);
          const actionLabel = logEntry.actionType === 'violation' ? 'خصم نقاط' : 'مكافأة';
          const pointsSign = Number(logEntry.deltaPoints || 0) > 0 ? `+${logEntry.deltaPoints}` : String(logEntry.deltaPoints || 0);
          const notifTitle = `${actionLabel}: ${logEntry.actionTitle || 'إجراء'}`;
          const notifBody = `تم تطبيق ${actionLabel} على ${studentForNotif.fullName || studentForNotif.name} (${pointsSign} نقطة)${logEntry.note ? ` - الملاحظة: ${logEntry.note}` : ''}`;
          await appendParentNotificationHistory(guardianPhone, {
            title: notifTitle,
            body: notifBody,
            studentId: logEntry.studentId,
            studentName: studentForNotif.fullName || studentForNotif.name,
            schoolId,
            schoolName: school?.name || '',
            channel: 'internal',
            recipient: guardianPhone,
            recipientType: 'primary',
            status: 'نجاح',
            eventType: logEntry.actionType === 'violation' ? 'behavior_violation' : 'behavior_reward',
            sourceType: 'action',
            deltaPoints: Number(logEntry.deltaPoints || 0),
            createdAt: logEntry.createdAt || nowIso(),
          });
        }
      } catch (notifErr) {
        console.error('parent notif error:', notifErr.message);
      }
      if (applied.logEntry?.actionType === 'violation') {
        const automated = await runAutomatedMessagingForSchool(saved, schoolId, {
          eventType: 'behavior',
          studentId: body?.studentId,
          violationType: applied.logEntry?.actionTitle || '',
          actionTitle: applied.logEntry?.actionTitle || '',
          points: applied.student?.points || 0,
          isoDate: applied.logEntry?.isoDate || getTodayIso(),
          now: new Date().toISOString(),
          time: applied.logEntry?.time || '—',
        });
        if (automated?.state) saved = await saveSharedState(automated.state, actor);
      }
      return sendJson(res, 200, { ok: true, message: applied.message, logEntry: applied.logEntry, student: applied.student, state: sanitizeStateForClient(saved) });
    }

    const schoolProgramApplyMatch = reqUrl.pathname.match(/^\/api\/schools\/(\d+)\/programs\/apply$/);
    if (schoolProgramApplyMatch && req.method === 'POST') {
      const actor = await getUserFromToken(token);
      const schoolId = Number(schoolProgramApplyMatch[1]);
      if (!canManageStudentActions(actor, schoolId)) return sendJson(res, 403, { ok: false, message: 'ليس لديك صلاحية اعتماد البرامج لهذه المدرسة.' });
      const body = await readJsonBody(req);
      const applied = await applyProgramToState(getSharedState(), schoolId, body, actor);
      if (!applied.ok) {
        // إرجاع live حتى عند الفشل لتحديث الإحصائيات في الـ frontend
        const liveOnFail = summarizeSchoolLivePayload(getSharedState(), schoolId);
        return sendJson(res, 400, { ...applied, live: liveOnFail });
      }
      const saved = await saveSharedState(applied.state, actor);
      return sendJson(res, 200, { ok: true, message: applied.message, logEntry: applied.logEntry, state: sanitizeStateForClient(saved) });
    }

    const publicGateMatch = reqUrl.pathname.match(/^\/api\/public\/gate\/([^/]+)$/);
    if (publicGateMatch && req.method === 'GET') {
      const state = getSharedState();
      const match = findGateConfigByToken(state, publicGateMatch[1]);
      if (!match) return sendJson(res, 404, { ok: false, message: 'رابط البوابة غير صالح.' });
      const live = summarizeSchoolLivePayload(state, match.school.id);
      const attendanceSource = getAttendanceStudentsSourceForSchool(match.school);
      const students = attendanceSource.sourceMode === 'structure'
        ? attendanceSource.students.map((student) => ({
            id: student.id,
            name: student.name,
            studentNumber: '',
            nationalId: student.nationalId,
            barcode: student.barcode,
            companyId: null,
            companyName: student.companyName || '—',
            faceReady: Boolean(student.faceReady),
            faceSignature: student.faceSignature || [],
          }))
        : match.school.students.map((student) => ({
            id: student.id,
            name: student.name,
            studentNumber: student.studentNumber,
            nationalId: student.nationalId,
            barcode: student.barcode,
            companyId: student.companyId,
            companyName: match.school.companies.find((item) => item.id === student.companyId)?.name || '—',
            faceReady: Boolean(student.faceReady),
            faceSignature: student.faceSignature || [],
          }));
      return sendJson(res, 200, { ok: true, school: { id: match.school.id, name: match.school.name, city: match.school.city, attendanceSource: attendanceSource.label }, gate: match.gate, live, students });
    }

    const publicGateLiveMatch = reqUrl.pathname.match(/^\/api\/public\/gate\/([^/]+)\/live$/);
    if (publicGateLiveMatch && req.method === 'GET') {
      const state = getSharedState();
      const match = findGateConfigByToken(state, publicGateLiveMatch[1]);
      if (!match) return sendJson(res, 404, { ok: false, message: 'رابط البوابة غير صالح.' });
      const live = summarizeSchoolLivePayload(state, match.school.id);
      return sendJson(res, 200, { ok: true, live });
    }
    const publicGateScanMatch = reqUrl.pathname.match(/^\/api\/public\/gate\/([^/]+)\/scan$/);
    if (publicGateScanMatch && req.method === 'POST') {
      const state = getSharedState();
      const match = findGateConfigByToken(state, publicGateScanMatch[1]);
      if (!match) return sendJson(res, 404, { ok: false, message: 'رابط البوابة غير صالح.' });
      const body = await readJsonBody(req);
      const applied = applyAttendanceScanToState(state, match.school.id, body.barcode, body.method || 'QR', match.gate.id, {
        capturedAt: body.capturedAt,
        capturedAtLocal: body.capturedAtLocal,
        offlineQueued: body.offlineQueued,
        clientOperationId: body.clientOperationId,
      });
      if (!applied.ok) {
        // إرجاع live حتى عند الفشل لتحديث الإحصائيات في الـ frontend
        const liveOnFail = summarizeSchoolLivePayload(getSharedState(), schoolId);
        return sendJson(res, 400, { ...applied, live: liveOnFail });
      }
      let finalState = applied.state;
      if (String(applied.message || '').includes('تأخر')) {
        const automatedLate = await runAutomatedMessagingForSchool(finalState, match.school.id, { eventType: 'late', studentId: applied.student?.id, isoDate: applied.logEntry?.isoDate, lateTime: applied.logEntry?.time, time: applied.logEntry?.time, now: new Date().toISOString() });
        finalState = automatedLate.state || finalState;
      }
      const automatedAbsence = await runAutomatedMessagingForSchool(finalState, match.school.id, { eventType: 'absence', isoDate: applied.logEntry?.isoDate, now: new Date().toISOString() });
      finalState = automatedAbsence.state || finalState;
      const saved = await saveSharedState(finalState, { username: `public:${match.gate.name}`, role: 'gate' });
      const live = summarizeSchoolLivePayload(saved, match.school.id);
      return sendJson(res, 200, { ok: true, message: applied.message, logEntry: applied.logEntry, student: applied.student, live });
    }


    const publicGateSyncEventMatch = reqUrl.pathname.match(/^\/api\/public\/gate\/([^/]+)\/sync-event$/);
    if (publicGateSyncEventMatch && req.method === 'POST') {
      const state = getSharedState();
      const match = findGateConfigByToken(state, publicGateSyncEventMatch[1]);
      if (!match) return sendJson(res, 404, { ok: false, message: 'رابط البوابة غير صالح.' });
      const body = await readJsonBody(req);
      const appended = appendGateSyncEventToState(state, match.school.id, match.gate.id, {
        ...body,
        gateToken: publicGateSyncEventMatch[1],
        gateName: match.gate?.name || body?.gateName,
      });
      if (!appended.ok) return sendJson(res, 400, appended);
      const saved = await saveSharedState(appended.state, { username: `public:${match.gate.name}`, role: 'gate' });
      return sendJson(res, 200, { ok: true, event: appended.event, state: sanitizeStateForClient(saved) });
    }

    const publicScreenMatch = reqUrl.pathname.match(/^\/api\/public\/screen\/([^/]+)$/);
    if (publicScreenMatch && req.method === 'GET') {
      const state = getSharedState();
      const match = findScreenConfigByToken(state, publicScreenMatch[1]);
      if (!match) return sendJson(res, 404, { ok: false, message: 'رابط الشاشة غير صالح.' });
      const liveBase = summarizeSchoolLivePayload(state, match.school.id, match.screen);
      let live = await attachParentPortalSummaryToLive(state, match.school.id, liveBase);
      live = await attachRewardStoreSummaryToLive(state, match.school.id, live, match.screen);
      return sendJson(res, 200, { ok: true, screen: match.screen, live });
    }

    if (reqUrl.pathname.startsWith('/api/')) {
      return notFound(res);
    }

    return serveStatic(req, res);
  } catch (error) {
    if (error?.code === 400) return sendJson(res, 400, { ok: false, message: 'تعذر قراءة الطلب بصيغة JSON.' });
    if (error?.code === 413) return sendJson(res, 413, { ok: false, message: 'حجم الطلب كبير جدًا.' });
    console.error(error);
    return sendJson(res, 500, { ok: false, message: 'حدث خطأ داخلي في الخادم.' });
  }
});

server.on('upgrade', (req, socket) => {
  try {
    const reqUrl = new URL(req.url, `http://${req.headers.host}`);
    if (reqUrl.pathname !== '/ws/public') {
      socket.destroy();
      return;
    }
    const kind = reqUrl.searchParams.get('kind') === 'gate' ? 'gate' : 'screen';
    const token = String(reqUrl.searchParams.get('token') || '');
    const state = getSharedState();
    const match = kind === 'gate' ? findGateConfigByToken(state, token) : findScreenConfigByToken(state, token);
    if (!match) {
      socket.write('HTTP/1.1 404 Not Found\r\n\r\n');
      socket.destroy();
      return;
    }
    const wsKey = req.headers['sec-websocket-key'];
    if (!wsKey) {
      socket.write('HTTP/1.1 400 Bad Request\r\n\r\n');
      socket.destroy();
      return;
    }
    const acceptValue = createWsAcceptValue(wsKey);
    socket.write([
      'HTTP/1.1 101 Switching Protocols',
      'Upgrade: websocket',
      'Connection: Upgrade',
      `Sec-WebSocket-Accept: ${acceptValue}`,
      '\r\n',
    ].join('\r\n'));
    const client = { socket, kind, token };
    wsClients.add(client);
    attachWsHeartbeat(socket);
    socket.on('close', () => wsClients.delete(client));
    socket.on('end', () => wsClients.delete(client));
    socket.on('error', () => wsClients.delete(client));
    const sendInitialLive = async () => {
      if (kind === 'gate') {
        const live = summarizeSchoolLivePayload(state, match.school.id);
        wsSend(socket, { type: 'live_update', kind, gate: match.gate, live });
        return;
      }
      const liveBase = summarizeSchoolLivePayload(state, match.school.id, match.screen);
      let live = await attachParentPortalSummaryToLive(state, match.school.id, liveBase);
      live = await attachRewardStoreSummaryToLive(state, match.school.id, live, match.screen);
      wsSend(socket, { type: 'live_update', kind, screen: match.screen, live });
    };
    sendInitialLive().catch(() => {});
  } catch {
    try { socket.destroy(); } catch {}
  }
});

// تحديث index.html لإضافة إصلاح QuotaExceededError عند بدء التشغيل
(function patchIndexHtml() {
  const indexPath = path.join(DIST_DIR, 'index.html');
  if (!existsSync(indexPath)) return;
  try {
    const content = readFileSync(indexPath, 'utf8');
    const quotaFix = `<script>\n    (function() {\n      try {\n        var testKey = '__quota_test__';\n        localStorage.setItem(testKey, '1');\n        localStorage.removeItem(testKey);\n      } catch(e) {\n        if (e && (e.name === 'QuotaExceededError' || e.code === 22 || e.code === 1014)) {\n          try { localStorage.clear(); } catch(e2) {}\n        }\n      }\n    })();\n    <\/script>`;
    if (!content.includes('__quota_test__')) {
      const patched = content.replace('<meta name="viewport"', quotaFix + '\n    <meta name="viewport"');
      writeFileSync(indexPath, patched, 'utf8');
      console.log('index.html patched with QuotaExceededError fix');
    }
  } catch(e) {
    console.warn('Failed to patch index.html:', e.message);
  }
})();

  server.listen(PORT, () => {
    console.log(`ideal-company-platform server running on http://localhost:${PORT}`);
    console.log(`database: PostgreSQL (Neon)`);  // PostgreSQL
  });
}

main().catch(err => {
  console.error('Failed to start server:', err);
  process.exit(1);
});

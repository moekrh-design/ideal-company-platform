import http from 'node:http';
import { readFileSync, existsSync, createReadStream, mkdirSync, writeFileSync } from 'node:fs';
import { writeFile, mkdir } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import crypto from 'node:crypto';
import Database from 'better-sqlite3';
import { createDefaultSharedState, hydrateSharedState, isRoleEnabledForSchool, defaultSettings, ensureDemoUsers } from './state.js';
import nodemailer from 'nodemailer';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, '..');
const DIST_DIR = path.join(ROOT_DIR, 'dist');
const DATA_DIR = path.join(ROOT_DIR, 'data');
const DB_PATH = path.join(DATA_DIR, 'platform.db');
const UPLOADS_DIR = path.join(DATA_DIR, 'uploads');
const FACE_UPLOADS_DIR = path.join(UPLOADS_DIR, 'faces');
const EVIDENCE_UPLOADS_DIR = path.join(UPLOADS_DIR, 'program-evidence');
const BACKUPS_DIR = path.join(DATA_DIR, 'backups');
const GLOBAL_BACKUPS_DIR = path.join(BACKUPS_DIR, 'global');
const SCHOOL_BACKUPS_DIR = path.join(BACKUPS_DIR, 'schools');
const BACKUP_RETENTION_DAYS = Number(process.env.BACKUP_RETENTION_DAYS || 30);
const PORT = Number(process.env.PORT || 4000);
const SESSION_DAYS = Number(process.env.SESSION_DAYS || 7);
const JSON_LIMIT_BYTES = 50 * 1024 * 1024;
const SCREEN_TRANSITION_KEYS = ["fade","cut","slide-left","slide-right","slide-up","slide-down","zoom-in","zoom-out","flip-x","flip-y","rotate-soft","rotate-in","blur","bounce","scale-up","scale-down","swing","curtain","diagonal","pop","float","random"];
const SCREEN_THEME_KEYS = ["emerald-night","blue-contrast","violet-stage","sunrise","graphite"];
const SCREEN_TEMPLATE_KEYS = ["executive","reception","leaderboard","news"];
const TICKER_BG_KEYS = ["amber","navy","emerald","rose","slate"];

const TABLE_SCHEMAS = {
  app_meta: {
    required: ['key', 'value', 'updated_at'],
    sql: `
      CREATE TABLE IF NOT EXISTS app_meta (
        key TEXT PRIMARY KEY,
        value TEXT NOT NULL,
        updated_at TEXT NOT NULL
      );
    `,
  },
  sessions: {
    required: ['token', 'user_id', 'username', 'role', 'school_id', 'created_at', 'expires_at'],
    sql: `
      CREATE TABLE IF NOT EXISTS sessions (
        token TEXT PRIMARY KEY,
        user_id INTEGER NOT NULL,
        username TEXT NOT NULL,
        role TEXT NOT NULL,
        school_id INTEGER,
        created_at TEXT NOT NULL,
        expires_at TEXT NOT NULL
      );
    `,
  },
  audit_log: {
    required: ['id', 'actor_username', 'actor_role', 'action', 'created_at', 'details'],
    sql: `
      CREATE TABLE IF NOT EXISTS audit_log (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        actor_username TEXT,
        actor_role TEXT,
        action TEXT NOT NULL,
        created_at TEXT NOT NULL,
        details TEXT
      );
    `,
  },
  auth_otps: {
    required: ['id', 'user_id', 'purpose', 'delivery', 'identifier', 'code_hash', 'destination_preview', 'created_at', 'expires_at', 'consumed_at'],
    sql: `
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
      );
    `,
  },
  auth_lockouts: {
    required: ['id', 'identifier_key', 'user_id', 'scope', 'reason', 'failure_count', 'created_at', 'updated_at', 'expires_at', 'lifted_at'],
    sql: `
      CREATE TABLE IF NOT EXISTS auth_lockouts (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        identifier_key TEXT,
        user_id INTEGER,
        scope TEXT NOT NULL,
        reason TEXT,
        failure_count INTEGER NOT NULL DEFAULT 0,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL,
        expires_at TEXT NOT NULL,
        lifted_at TEXT
      );
    `,
  },
};

await mkdir(DATA_DIR, { recursive: true });
await mkdir(UPLOADS_DIR, { recursive: true });
await mkdir(FACE_UPLOADS_DIR, { recursive: true });
await mkdir(EVIDENCE_UPLOADS_DIR, { recursive: true });
await mkdir(GLOBAL_BACKUPS_DIR, { recursive: true });
await mkdir(SCHOOL_BACKUPS_DIR, { recursive: true });
const db = new Database(DB_PATH);
initializeDatabase();
ensureStateSeeded();
ensureStateMigrations();
cleanupExpiredSessions();
cleanupExpiredAuthOtps();
cleanupExpiredAuthLockouts();
await ensureDailyBackups('startup');

function tableExists(name) {
  const row = db.prepare("SELECT name FROM sqlite_master WHERE type = 'table' AND name = ?").get(name);
  return Boolean(row?.name);
}

function getTableColumns(name) {
  return db.prepare(`PRAGMA table_info(${name})`).all().map((item) => item.name);
}

function ensureTableSchema(name, schema) {
  if (!tableExists(name)) {
    db.exec(schema.sql);
    return;
  }
  const currentColumns = getTableColumns(name);
  const missingColumns = schema.required.filter((column) => !currentColumns.includes(column));
  if (!missingColumns.length) return;

  const backupName = `${name}_legacy_${Date.now()}`;
  db.exec(`ALTER TABLE ${name} RENAME TO ${backupName};`);
  db.exec(schema.sql);
}

function initializeDatabase() {
  Object.entries(TABLE_SCHEMAS).forEach(([name, schema]) => ensureTableSchema(name, schema));
}

function nowIso() {
  return new Date().toISOString();
}

function todayStamp() {
  return new Date().toISOString().slice(0, 10);
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
  if (existsSync(filePath) || !existsSync(DB_PATH)) return false;
  writeFileSync(filePath, readFileSync(DB_PATH));
  return true;
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

function isHashedPassword(value = '') {
  return String(value || '').startsWith('scrypt$');
}

function hashPassword(password) {
  const plain = String(password || '');
  if (!plain) return '';
  if (isHashedPassword(plain)) return plain;
  const salt = crypto.randomBytes(16).toString('hex');
  const derived = crypto.scryptSync(plain, salt, 64).toString('hex');
  return `scrypt$${salt}$${derived}`;
}

function verifyPassword(plainPassword, storedPassword) {
  const plain = String(plainPassword || '');
  const stored = String(storedPassword || '');
  if (!stored) return false;
  if (!isHashedPassword(stored)) return plain === stored;
  const [, salt, derived] = stored.split('$');
  if (!salt || !derived) return false;
  const calculated = crypto.scryptSync(plain, salt, 64).toString('hex');
  try {
    return crypto.timingSafeEqual(Buffer.from(calculated, 'hex'), Buffer.from(derived, 'hex'));
  } catch {
    return false;
  }
}

function normalizeUsersForStorage(users = [], existingUsers = [], schools = []) {
  const preparedUsers = ensureDemoUsers(users || [], schools || []);
  const existingMap = new Map((existingUsers || []).map((user) => [user.id, user]));
  return preparedUsers.map((user) => {
    const previous = existingMap.get(user.id);
    const incomingPassword = user.password;
    let password = incomingPassword;
    if (!String(incomingPassword || '').trim() && previous?.password) {
      password = previous.password;
    }

    if (String(password || '').trim() && !isHashedPassword(password)) {
      password = hashPassword(password);
    }
    return { ...user, password: password || '' };
  });
}

function normalizeStateForStorage(state, existingState = null) {
  const hydrated = hydrateSharedState(state);
  return {
    ...hydrated,
    users: normalizeUsersForStorage(hydrated.users, existingState?.users || hydrated.users, hydrated.schools),
  };
}

function sanitizeStateForClient(state) {
  return {
    ...state,
    users: (state.users || []).map((user) => ({ ...user, password: '' })),
  };
}

function writeStateRow(state, actor = null) {
  db.prepare('INSERT INTO app_meta (key, value, updated_at) VALUES (?, ?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value, updated_at = excluded.updated_at')
    .run('shared_state', JSON.stringify(state), nowIso());
  if (actor) audit(actor, 'save_state', { schools: state.schools.length, users: state.users.length });
}

function audit(actor, action, details = {}) {
  const stmt = db.prepare('INSERT INTO audit_log (actor_username, actor_role, action, created_at, details) VALUES (?, ?, ?, ?, ?)');
  stmt.run(actor?.username || '', actor?.role || '', action, nowIso(), JSON.stringify(details));
}

function auditAuthEvent(action, details = {}, actor = null) {
  audit(actor, action, details);
}

function readAuthLogs(limit = 200) {
  const rows = db.prepare(`
    SELECT id, actor_username, actor_role, action, created_at, details
    FROM audit_log
    WHERE action LIKE 'auth_%' OR action IN ('login', 'logout')
    ORDER BY id DESC
    LIMIT ?
  `).all(Math.max(1, Math.min(500, Number(limit) || 200)));
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

function ensureStateSeeded() {
  const row = db.prepare('SELECT value FROM app_meta WHERE key = ?').get('shared_state');
  if (!row) {
    const state = normalizeStateForStorage(createDefaultSharedState());
    writeStateRow(state);
    audit(null, 'seed_state', { schools: state.schools.length, users: state.users.length });
  }
}

function ensureStateMigrations() {
  const row = db.prepare('SELECT value FROM app_meta WHERE key = ?').get('shared_state');
  if (!row?.value) return;
  try {
    const parsed = JSON.parse(row.value);
    const normalized = normalizeStateForStorage(parsed, parsed);
    if (JSON.stringify(parsed) !== JSON.stringify(normalized)) {
      writeStateRow(normalized);
      audit(null, 'migrate_state', { users: normalized.users.length });
    }
  } catch {
    const state = normalizeStateForStorage(createDefaultSharedState());
    writeStateRow(state);
  }
}

function getSharedState() {
  const row = db.prepare('SELECT value FROM app_meta WHERE key = ?').get('shared_state');
  if (!row) return normalizeStateForStorage(createDefaultSharedState());
  try {
    return normalizeStateForStorage(JSON.parse(row.value), JSON.parse(row.value));
  } catch {
    return normalizeStateForStorage(createDefaultSharedState());
  }
}

function saveSharedState(state, actor = null) {
  const current = getSharedState();
  const hydrated = normalizeStateForStorage(state, current);
  writeStateRow(hydrated, actor);
  void ensureDailyBackups('save', hydrated);
  broadcastAllLive(hydrated);
  return hydrated;
}

function cleanupExpiredSessions() {
  db.prepare('DELETE FROM sessions WHERE expires_at <= ?').run(nowIso());
}


function cleanupExpiredAuthOtps() {
  db.prepare('DELETE FROM auth_otps WHERE expires_at <= ? OR consumed_at IS NOT NULL').run(nowIso());
}


function cleanupExpiredAuthLockouts() {
  db.prepare('DELETE FROM auth_lockouts WHERE expires_at <= ? OR lifted_at IS NOT NULL').run(nowIso());
}

function normalizeIdentifierKey(identifier = '') {
  return String(identifier || '').trim().toLowerCase();
}

function getAuthFailureActionsForScope(scope = 'password') {
  return scope === 'otp' ? ['auth_verify_otp_failed'] : ['auth_login_failed'];
}

function getRecentAuthFailures(scope = 'password', identifier = '', userId = null, windowMinutes = 15) {
  const since = new Date(Date.now() - Math.max(1, Number(windowMinutes) || 15) * 60 * 1000).toISOString();
  const actions = getAuthFailureActionsForScope(scope);
  const rows = db.prepare(`
    SELECT action, created_at, details
    FROM audit_log
    WHERE created_at >= ?
      AND action IN (${actions.map(() => '?').join(',')})
    ORDER BY id DESC
    LIMIT 500
  `).all(since, ...actions);
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

function getActiveAuthLockout(identifier = '', userId = null, scope = 'any') {
  cleanupExpiredAuthLockouts();
  const key = normalizeIdentifierKey(identifier);
  const rows = db.prepare(`
    SELECT *
    FROM auth_lockouts
    WHERE lifted_at IS NULL
      AND expires_at > ?
      AND (? = 'any' OR scope = ?)
      AND ((? <> '' AND identifier_key = ?) OR (? IS NOT NULL AND user_id = ?))
    ORDER BY updated_at DESC
    LIMIT 20
  `).all(nowIso(), String(scope || 'any'), String(scope || 'any'), key, key, userId == null ? null : Number(userId), userId == null ? null : Number(userId));
  return rows[0] || null;
}

function clearAuthLockouts(identifier = '', userId = null, actor = null) {
  const active = getActiveAuthLockout(identifier, userId, 'any');
  if (!active) return null;
  const key = normalizeIdentifierKey(identifier);
  db.prepare(`
    UPDATE auth_lockouts
    SET lifted_at = ?, updated_at = ?
    WHERE lifted_at IS NULL
      AND ((? <> '' AND identifier_key = ?) OR (? IS NOT NULL AND user_id = ?))
  `).run(nowIso(), nowIso(), key, key, userId == null ? null : Number(userId), userId == null ? null : Number(userId));
  auditAuthEvent('auth_lockout_cleared', { identifier: key, userId: userId == null ? null : Number(userId), scope: active.scope }, actor);
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
  const failures = getRecentAuthFailures(scope, identifier, user?.id ?? null, security.trackWindowMinutes || 15);
  const failureCount = failures.length;
  const maxFailedAttempts = Math.max(2, Number(security.maxFailedAttempts) || 5);
  if (failureCount < maxFailedAttempts) return { state, locked: false, failureCount };
  const existing = getActiveAuthLockout(identifier, user?.id ?? null, scope);
  if (existing) return { state, locked: true, failureCount, lockout: existing };
  const createdAt = nowIso();
  const expiresAt = new Date(Date.now() + Math.max(1, Number(security.lockoutMinutes) || 15) * 60 * 1000).toISOString();
  db.prepare('INSERT INTO auth_lockouts (identifier_key, user_id, scope, reason, failure_count, created_at, updated_at, expires_at, lifted_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, NULL)').run(normalizeIdentifierKey(identifier), user?.id == null ? null : Number(user.id), scope, 'too_many_failed_attempts', failureCount, createdAt, createdAt, expiresAt);
  const alertMessage = `تم قفل ${scope === 'otp' ? 'التحقق بالرمز' : 'الدخول بكلمة المرور'} مؤقتًا لمدة ${Math.max(1, Number(security.lockoutMinutes) || 15)} دقيقة للحساب ${user?.username || normalizeIdentifierKey(identifier) || 'غير معروف'} بعد ${failureCount} محاولات فاشلة.`;
  let next = state;
  if (security.notifyAdminOnLock) {
    next = await notifyAuthSecurityAlert(state, { identifier: normalizeIdentifierKey(identifier), userId: user?.id ?? null, scope, message: alertMessage, actor });
    saveSharedState(next, actor);
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
  const request = createAuthOtpRequest(user, identifier, delivery, code, authSettings);
  const dispatchResult = await dispatchAuthOtp(state, user, delivery, code, authSettings);
  finalizeAuthOtpDestination(request.id, dispatchResult.destinationPreview || '');
  auditAuthEvent('auth_scenario_test', { targetUserId: user.id, delivery }, { username: actor.username, role: actor.role });
  return {
    message: 'تم تنفيذ اختبار OTP على المستخدم المحدد بنجاح.',
    expiresAt: request.expiresAt,
    destinationPreview: dispatchResult.destinationPreview || '',
    previewCode: dispatchResult.previewCode,
    userName: user.name || user.username,
  };
}


function createAuthOtpRequest(user, identifier, delivery, code, authSettings) {
  cleanupExpiredAuthOtps();
  db.prepare('DELETE FROM auth_otps WHERE user_id = ? AND purpose = ?').run(Number(user.id), 'login');
  const id = `otp_${crypto.randomBytes(10).toString('hex')}`;
  const createdAt = nowIso();
  const expiresAt = new Date(Date.now() + (Math.max(1, Number(authSettings.otpExpiryMinutes) || 10) * 60 * 1000)).toISOString();
  db.prepare('INSERT INTO auth_otps (id, user_id, purpose, delivery, identifier, code_hash, destination_preview, created_at, expires_at, consumed_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, NULL)')
    .run(id, Number(user.id), 'login', delivery, String(identifier || '').trim().toLowerCase(), hashPassword(code), '', createdAt, expiresAt);
  return { id, expiresAt };
}

function finalizeAuthOtpDestination(id, destinationPreview = '') {
  db.prepare('UPDATE auth_otps SET destination_preview = ? WHERE id = ?').run(destinationPreview, id);
}

function verifyAndConsumeAuthOtp(user, identifier, code) {
  cleanupExpiredAuthOtps();
  const row = db.prepare('SELECT * FROM auth_otps WHERE user_id = ? AND purpose = ? AND identifier = ? ORDER BY created_at DESC LIMIT 1').get(Number(user.id), 'login', String(identifier || '').trim().toLowerCase());
  if (!row) return { ok: false, message: 'لا يوجد طلب رمز تحقق نشط لهذا الحساب.' };
  if (row.consumed_at) return { ok: false, message: 'تم استخدام الرمز مسبقًا.' };
  if (row.expires_at <= nowIso()) return { ok: false, message: 'انتهت صلاحية الرمز. اطلب رمزًا جديدًا.' };
  if (!verifyPassword(String(code || '').trim(), row.code_hash)) return { ok: false, message: 'رمز التحقق غير صحيح.' };
  db.prepare('UPDATE auth_otps SET consumed_at = ? WHERE id = ?').run(nowIso(), row.id);
  return { ok: true, row };
}


function createSession(user) {
  cleanupExpiredSessions();
  const token = crypto.randomBytes(32).toString('hex');
  db.prepare('INSERT INTO sessions (token, user_id, username, role, school_id, created_at, expires_at) VALUES (?, ?, ?, ?, ?, ?, ?)')
    .run(token, user.id, user.username, user.role, user.schoolId ?? null, nowIso(), daysFromNow(SESSION_DAYS));
  auditAuthEvent('login', { tokenPreview: token.slice(0, 8) }, user);
  return token;
}

function appMetaGetJson(key) {
  const row = db.prepare('SELECT value FROM app_meta WHERE key = ?').get(key);
  if (!row?.value) return null;
  try { return JSON.parse(row.value); } catch { return null; }
}

function appMetaSetJson(key, value) {
  db.prepare('INSERT INTO app_meta (key, value, updated_at) VALUES (?, ?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value, updated_at = excluded.updated_at')
    .run(key, JSON.stringify(value), nowIso());
}

function appMetaDelete(key) {
  db.prepare('DELETE FROM app_meta WHERE key = ?').run(key);
}

function resetRequestKey(userId) {
  return `password_reset_${Number(userId)}`;
}

function createPasswordResetRequest(user) {
  const code = String(Math.floor(100000 + Math.random() * 900000));
  const payload = {
    userId: Number(user.id),
    username: user.username,
    email: String(user.email || '').trim().toLowerCase(),
    code,
    requestedAt: nowIso(),
    expiresAt: new Date(Date.now() + 30 * 60 * 1000).toISOString(),
  };
  appMetaSetJson(resetRequestKey(user.id), payload);
  audit({ username: user.username, role: user.role }, 'request_password_reset', { userId: user.id, email: payload.email, delivery: process.env.SMTP_HOST ? 'email-ready' : 'manual-code' });
  return payload;
}

function consumePasswordResetRequest(user, code) {
  const payload = appMetaGetJson(resetRequestKey(user.id));
  if (!payload) return { ok: false, message: 'لا يوجد طلب نشط لإعادة التعيين لهذا الحساب.' };
  if (new Date(payload.expiresAt).getTime() < Date.now()) {
    appMetaDelete(resetRequestKey(user.id));
    return { ok: false, message: 'انتهت صلاحية رمز إعادة التعيين. اطلب رمزًا جديدًا.' };
  }
  if (String(payload.code || '') !== String(code || '').trim()) {
    return { ok: false, message: 'رمز إعادة التعيين غير صحيح.' };
  }
  appMetaDelete(resetRequestKey(user.id));
  return { ok: true, payload };
}

function getSession(token) {
  if (!token) return null;
  cleanupExpiredSessions();
  const row = db.prepare('SELECT * FROM sessions WHERE token = ?').get(token);
  if (!row) return null;
  return row;
}

function deleteSession(token) {
  if (!token) return;
  db.prepare('DELETE FROM sessions WHERE token = ?').run(token);
}

function sanitizeUser(user) {
  if (!user) return null;
  const { password, ...safe } = user;
  return safe;
}

function getUserFromToken(token) {
  const session = getSession(token);
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

function getMessageAudienceStudents(school, audience = 'allStudents') {
  const students = getUnifiedSchoolStudentsForMessaging(school);
  if (audience === 'lateToday') return students.filter((student) => String(student.status || '') === 'متأخر');
  if (audience === 'positive') return students.filter((student) => Number(student.points || 0) >= 120);
  if (audience === 'behavior') return students.filter((student) => Number(student.points || 0) < 100);
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
  const recipient = rule.channel === 'internal' ? `student:${student.id}` : normalizePhoneNumber(student.guardianMobile || student.mobile || '');
  if (!recipient) {
    const failureLog = {
      id: Date.now() + Math.floor(Math.random() * 1000),
      createdAt: new Date().toISOString(),
      subject: rule.name || 'تنبيه تلقائي',
      type: 'تلقائي',
      audience: eventType === 'absence' ? 'طلاب غياب' : eventType === 'late' ? 'طلاب متأخرون' : eventType === 'behavior' ? 'طلاب سلوك / انضباط' : 'طلاب مستهدفون',
      channel: rule.channel || 'whatsapp',
      senderName: 'محرك التنبيهات',
      recipients: 1,
      successCount: 0,
      failedCount: 1,
      status: 'فشل',
      body: text,
      automationMeta: { ruleId: rule.id, eventType, studentId: student.id, isoDate },
      deliveries: [{ studentId: student.id, studentName: student.name || student.fullName, status: 'فشل', reason: 'لا يوجد رقم مستفيد صالح.', ruleId: rule.id, eventType, isoDate }],
    };
    school.messaging = school.messaging || {};
    school.messaging.logs = [failureLog, ...logs].slice(0, settings.operations?.retentionDays ? 500 : 200);
    return { ok: false, message: 'لا يوجد رقم مستفيد صالح.' };
  }
  try {
    const dispatched = await dispatchChannelMessage(rule.channel, settings.integration, recipient, text);
    const successLog = {
      id: Date.now() + Math.floor(Math.random() * 1000),
      createdAt: new Date().toISOString(),
      subject: rule.name || 'تنبيه تلقائي',
      type: 'تلقائي',
      audience: eventType === 'absence' ? 'طلاب غياب' : eventType === 'late' ? 'طلاب متأخرون' : eventType === 'behavior' ? 'طلاب سلوك / انضباط' : 'طلاب مستهدفون',
      channel: rule.channel || 'whatsapp',
      senderName: 'محرك التنبيهات',
      recipients: 1,
      successCount: 1,
      failedCount: 0,
      status: 'نجاح',
      body: text,
      automationMeta: { ruleId: rule.id, eventType, studentId: student.id, isoDate },
      deliveries: [{ studentId: student.id, studentName: student.name || student.fullName, status: 'نجاح', recipient, providerMessageId: dispatched.providerMessageId || '', ruleId: rule.id, eventType, isoDate }],
    };
    school.messaging = school.messaging || {};
    school.messaging.logs = [successLog, ...logs].slice(0, 500);
    return { ok: true };
  } catch (error) {
    const errorLog = {
      id: Date.now() + Math.floor(Math.random() * 1000),
      createdAt: new Date().toISOString(),
      subject: rule.name || 'تنبيه تلقائي',
      type: 'تلقائي',
      audience: eventType === 'absence' ? 'طلاب غياب' : eventType === 'late' ? 'طلاب متأخرون' : eventType === 'behavior' ? 'طلاب سلوك / انضباط' : 'طلاب مستهدفون',
      channel: rule.channel || 'whatsapp',
      senderName: 'محرك التنبيهات',
      recipients: 1,
      successCount: 0,
      failedCount: 1,
      status: 'فشل',
      body: text,
      automationMeta: { ruleId: rule.id, eventType, studentId: student.id, isoDate },
      deliveries: [{ studentId: student.id, studentName: student.name || student.fullName, status: 'فشل', recipient, reason: error?.message || 'تعذر الإرسال', ruleId: rule.id, eventType, isoDate }],
    };
    school.messaging = school.messaging || {};
    school.messaging.logs = [errorLog, ...logs].slice(0, 500);
    return { ok: false, message: error?.message || 'تعذر الإرسال' };
  }
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

async function dispatchChannelMessage(channel, config, recipient, text) {
  if (channel === 'internal') return { providerMessageId: `internal-${Date.now()}`, raw: { ok: true } };
  if (channel === 'whatsapp') return sendWhatsappCloudMessage(config.whatsapp || {}, recipient, text);
  if (channel === 'sms') return sendSmsMessage(config.sms || {}, recipient, text);
  throw new Error('قناة غير مدعومة.');
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
  const targetedStudents = getMessageAudienceStudents(school, audience).slice(0, settings.operations.batchLimit || 200);
  if (!targetedStudents.length) return { ok: false, message: 'لا يوجد مستهدفون مطابقون لهذه العملية.' };
  const now = new Date();
  const log = {
    id: Date.now(),
    createdAt: now.toISOString(),
    subject: String(payload.subject || 'رسالة تشغيلية').trim() || 'رسالة تشغيلية',
    type: sendMode === 'scheduled' ? 'مجدولة' : 'يدوي',
    audience: String(payload.audienceLabel || audience || 'مستهدفات مخصصة'),
    channel,
    senderName: actor?.name || actor?.username || 'مستخدم النظام',
    recipients: targetedStudents.length,
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
  for (const student of targetedStudents) {
    const recipient = channel === 'internal' ? `student:${student.id}` : normalizePhoneNumber(student.guardianMobile || student.mobile || '');
    const rendered = applyMessageVariablesServer(payload.message, {
      studentName: student.name || student.fullName,
      grade: student.grade,
      className: student.className,
      companyName: student.companyName,
      schoolName: school.name,
      lateTime: payload.lateTime || '06:52',
      points: student.points || 0,
    });
    if (!recipient) {
      log.failedCount += 1;
      log.deliveries.push({ studentId: student.id, studentName: student.name || student.fullName, status: 'فشل', reason: 'لا يوجد رقم مستفيد صالح.' });
      continue;
    }
    try {
      const dispatched = await dispatchChannelMessage(channel, settings.integration, recipient, rendered);
      log.successCount += 1;
      log.deliveries.push({ studentId: student.id, studentName: student.name || student.fullName, status: 'نجاح', recipient, providerMessageId: dispatched.providerMessageId || '' });
    } catch (error) {
      log.failedCount += 1;
      log.deliveries.push({ studentId: student.id, studentName: student.name || student.fullName, status: 'فشل', recipient, reason: error?.message || 'تعذر الإرسال.' });
    }
  }
  log.status = log.failedCount && log.successCount ? 'جزئي' : log.failedCount ? 'فشل' : 'نجاح';
  school.messaging.logs = [log, ...school.messaging.logs].slice(0, 200);
  return { ok: true, state: hydrateSharedState(next), log, message: `تمت معالجة ${targetedStudents.length} رسالة.` };
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

function summarizeSchoolLivePayload(state, schoolId, screenConfig = null) {
  const school = state.schools.find((item) => Number(item.id) === Number(schoolId));
  if (!school) return null;
  const today = getTodayIso();
  const unifiedStudents = getUnifiedSchoolStudentsForServer(school, { includeArchived: false, preferStructure: true });
  const companyRows = getUnifiedCompanyRowsForServer(school, { preferStructure: true });
  const scansToday = state.scanLog.filter((item) => Number(item.schoolId) === Number(schoolId) && item.isoDate === today && !String(item.result || '').includes('فشل') && !String(item.result || '').includes('مسبق'));
  const actionsToday = state.actionLog.filter((item) => Number(item.schoolId) === Number(schoolId) && item.isoDate === today);
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
    structureSpotlight,
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
  // إذا كان الهيكل يحتوي على طلاب فعليين، استخدمه
  if (preferStructure && structureStudents.length) return structureStudents;
  // إذا لم يكن الهيكل يحتوي على طلاب، استخدم المصدر القديم (school.students)
  if (baseStudents.length) return baseStudents;
  return [];
}

function getUnifiedCompanyRowsForServer(school, { preferStructure = true } = {}) {
  if (!school) return [];
  const classrooms = Array.isArray(school?.structure?.classrooms) ? school.structure.classrooms : [];
  // استخدم الهيكل فقط إذا كان يحتوي على فصول فيها طلاب، أو إذا لم توجد شركات قديمة
  const hasStructureStudents = classrooms.some((c) => Array.isArray(c.students) && c.students.length > 0);
  const hasOldCompanies = Array.isArray(school.companies) && school.companies.length > 0;
  if (preferStructure && classrooms.length && (hasStructureStudents || !hasOldCompanies)) {
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

function applyAttendanceScanToState(state, schoolId, barcodeValue, method = 'QR') {
  const next = structuredClone(state);
  const school = next.schools.find((item) => Number(item.id) === Number(schoolId));
  if (!school) return { ok: false, message: 'المدرسة غير موجودة.' };

  const rawValue = String(barcodeValue || '').trim();
  const normalizedValue = rawValue.toUpperCase();
  const today = getTodayIso();
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

  if (next.settings.devices?.duplicateScanBlocked) {
    const already = next.scanLog.some((entry) => Number(entry.schoolId) === Number(schoolId) && String(entry.studentId) === String(student.id) && entry.isoDate === today);
    if (already) return { ok: false, message: 'تم تسجيل حضور هذا الطالب مسبقًا اليوم.' };
  }

  const now = new Date();
  const currentMinutes = now.getHours() * 60 + now.getMinutes();
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
    targetStudent.lastAttendanceAt = new Date().toISOString();
  } else {
    student.status = statusFromResult(result);
    student.attendanceRate = clamp(Number(student.attendanceRate || 100) + (result.includes('تأخر') ? -1 : 0.4), 0, 100);
    student.points = Number(student.points || 0) + deltaPoints;
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
    student: student.name || student.fullName,
    barcode: student.barcode || rawValue,
    date: toArabicDate(now),
    isoDate: today,
    time: `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`,
    method: attendanceSource.sourceMode === 'structure' ? 'هيكل مدرسي' : method,
    result,
    deltaPoints,
  };
  next.scanLog = [logEntry, ...next.scanLog].slice(0, 800);
  return { ok: true, state: hydrateSharedState(next), logEntry, student: { id: student.id, name: student.name || student.fullName, barcode: student.barcode || rawValue }, message: result };
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
  const student = school.students.find((item) => Number(item.id) === Number(payload.studentId));
  if (!student) return { ok: false, message: 'الطالب غير موجود.' };
  const actionType = payload.actionType === 'violation' ? 'violation' : 'reward';
  const catalog = actionType === 'violation' ? next.settings.actions?.violations || [] : next.settings.actions?.rewards || [];
  const definition = catalog.find((item) => String(item.id) === String(payload.definitionId));
  if (!definition) return { ok: false, message: 'البند المحدد غير موجود.' };
  const deltaPoints = Number(definition.points || 0);
  const company = school.companies.find((item) => item.id === student.companyId);
  student.points = Number(student.points || 0) + deltaPoints;
  if (company) {
    company.points = Number(company.points || 0) + deltaPoints;
    company.behavior = clamp(Number(company.behavior || 0) + (actionType === 'reward' ? 1 : -1), 0, 100);
  }
  const now = new Date();
  const logEntry = {
    id: Date.now(),
    schoolId: school.id,
    studentId: student.id,
    companyId: student.companyId,
    student: student.name,
    actorName: actor?.name || actor?.username || 'مستخدم النظام',
    actorRole: actor?.role || 'teacher',
    method: payload.method || 'يدوي',
    actionType,
    actionTitle: definition.title,
    note: String(payload.note || ''),
    evidence: [],
    date: toArabicDate(now),
    isoDate: getTodayIso(),
    time: `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`,
    deltaPoints,
  };
  next.actionLog = [logEntry, ...next.actionLog].slice(0, 1200);
  return { ok: true, state: hydrateSharedState(next), logEntry, student, message: `تم تنفيذ ${actionType === 'reward' ? 'المكافأة' : 'الخصم'} على ${student.name}.` };
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

function broadcastAllLive(state) {
  for (const client of wsClients) {
    if (!client.socket || client.socket.destroyed) continue;
    if (client.kind === 'screen') {
      const match = findScreenConfigByToken(state, client.token);
      if (!match) continue;
      const live = summarizeSchoolLivePayload(state, match.school.id, match.screen);
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
  }[ext] || 'application/octet-stream';
}

function serveStatic(req, res) {
  const reqUrl = new URL(req.url, `http://${req.headers.host}`);
  let pathname = decodeURIComponent(reqUrl.pathname);
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

  if (!existsSync(filePath)) {
    sendText(res, 404, 'Build not found. Run npm run build first.');
    return;
  }

  res.writeHead(200, { 'Content-Type': mimeTypeFor(filePath) });
  createReadStream(filePath).pipe(res);
}

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
    if (reqUrl.pathname === '/api/health' && req.method === 'GET') {
      return sendJson(res, 200, { ok: true, service: 'ideal-company-platform-server', time: nowIso() });
    }

    if (reqUrl.pathname === '/api/bootstrap' && req.method === 'GET') {
      const state = getSharedState();
      const user = getUserFromToken(token);
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
      const activePasswordLock = matchedUser ? getActiveAuthLockout(username, matchedUser.id, 'password') : getActiveAuthLockout(username, null, 'password');
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
      clearAuthLockouts(username, user.id, { username: user.username, role: user.role });
      const sessionToken = createSession(user);
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
      const activeOtpLock = getActiveAuthLockout(identifier, preMatchedUser?.id ?? null, 'otp');
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
      const request = createAuthOtpRequest(user, identifier, delivery, code, authSettings);
      try {
        const dispatchResult = await dispatchAuthOtp(state, user, delivery, code, authSettings);
        finalizeAuthOtpDestination(request.id, dispatchResult.destinationPreview || '');
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
      const activeOtpLock = getActiveAuthLockout(identifier, preMatchedUser?.id ?? null, 'otp');
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
      const verified = verifyAndConsumeAuthOtp(user, identifier, code);
      if (!verified.ok) {
        auditAuthEvent('auth_verify_otp_failed', { identifier, userId: user.id, reason: verified?.message || 'verification_failed' }, { username: user.username, role: user.role });
        const lockResult = await registerAuthFailureAndMaybeLock(state, 'otp', identifier, user, { username: user.username, role: user.role });
        if (lockResult.locked) {
          return sendJson(res, 423, { ok: false, message: getAuthLockoutMessage(lockResult.lockout), lockout: { expiresAt: lockResult.lockout.expires_at, scope: lockResult.lockout.scope } });
        }
        return sendJson(res, 400, verified);
      }
      clearAuthLockouts(identifier, user.id, { username: user.username, role: user.role });
      const sessionToken = createSession(user);
      auditAuthEvent('auth_verify_otp_success', { userId: user.id, delivery: verified.row.delivery }, { username: user.username, role: user.role });
      return sendJson(res, 200, { ok: true, token: sessionToken, user: sanitizeUser(user) });
    }

    if (reqUrl.pathname === '/api/auth/test-delivery' && req.method === 'POST') {
      const actor = getUserFromToken(token);
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
      const actor = getUserFromToken(token);
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
      const actor = getUserFromToken(token);
      if (!actor || actor.role !== 'superadmin') return sendJson(res, 403, { ok: false, message: 'هذه الصفحة والصلاحية للأدمن الرئيسي فقط.' });
      const limit = Number(reqUrl.searchParams.get('limit') || 200);
      return sendJson(res, 200, { ok: true, logs: readAuthLogs(limit) });
    }

    if (reqUrl.pathname === '/api/auth/logout' && req.method === 'POST') {
      const user = getUserFromToken(token);
      deleteSession(token);
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
      const request = createPasswordResetRequest(user);
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
      const consumed = consumePasswordResetRequest(user, code);
      if (!consumed.ok) {
        return sendJson(res, 400, consumed);
      }
      const next = structuredClone(state);
      next.users = (next.users || []).map((item) => Number(item.id) !== Number(user.id) ? item : { ...item, password: newPassword.trim() });
      saveSharedState(next, { username: user.username, role: user.role, id: user.id, schoolId: user.schoolId ?? null });
      audit({ username: user.username, role: user.role }, 'confirm_password_reset', { userId: user.id });
      return sendJson(res, 200, { ok: true, message: 'تم تحديث كلمة المرور بنجاح. يمكنك الدخول الآن.' });
    }

    if (reqUrl.pathname === '/api/auth/change-password' && req.method === 'POST') {
      const actor = getUserFromToken(token);
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
      if (!verifyPassword(currentPassword, user.password)) {
        return sendJson(res, 400, { ok: false, message: 'كلمة المرور الحالية غير صحيحة.' });
      }
      if (verifyPassword(newPassword, user.password)) {
        return sendJson(res, 400, { ok: false, message: 'اختر كلمة مرور جديدة مختلفة عن الحالية.' });
      }
      const next = structuredClone(state);
      const hashedNewPassword = hashPassword(newPassword);
      next.users = (next.users || []).map((item) => Number(item.id) !== Number(user.id) ? item : { ...item, password: hashedNewPassword });
      // نحفظ مباشرة باستخدام writeStateRow لتجنب إعادة تطبيع كلمة المرور المُشفَّرة
      writeStateRow(next, { username: user.username, role: user.role, id: user.id, schoolId: user.schoolId ?? null });
      void ensureDailyBackups('save', next);
      broadcastAllLive(next);
      audit({ username: user.username, role: user.role }, 'change_password', { userId: user.id });
      return sendJson(res, 200, { ok: true, message: 'تم تغيير كلمة المرور بنجاح.' });
    }

    if (reqUrl.pathname === '/api/auth/admin-reset-password' && req.method === 'POST') {
      const actor = getUserFromToken(token);
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
      const hashedResetPassword = hashPassword(newPassword);
      next.users = (next.users || []).map((item) => Number(item.id) !== Number(targetUser.id) ? item : { ...item, password: hashedResetPassword });
      // نحفظ مباشرة باستخدام writeStateRow لتجنب إعادة تطبيع كلمة المرور المُشفَّرة
      writeStateRow(next, { username: actorFull.username, role: actorFull.role, id: actorFull.id, schoolId: actorFull.schoolId ?? null });
      void ensureDailyBackups('save', next);
      broadcastAllLive(next);
      audit({ username: actorFull.username, role: actorFull.role }, 'admin_reset_password', { targetUserId: targetUser.id, targetUsername: targetUser.username, targetRole: targetUser.role });
      return sendJson(res, 200, { ok: true, message: `تمت إعادة تعيين كلمة مرور المستخدم ${targetUser.name || targetUser.username} بنجاح.` });
    }

    if (reqUrl.pathname === '/api/state/save' && req.method === 'POST') {
      const actor = getUserFromToken(token);
      if (!actor) return sendJson(res, 401, { ok: false, message: 'الجلسة منتهية أو غير صالحة.' });
      if (actor.role === 'student') return sendJson(res, 403, { ok: false, message: 'هذا الحساب لا يملك صلاحية حفظ بيانات المنصة.' });
      const body = await readJsonBody(req);
      const incomingState = body.state || body;
      const currentState = getSharedState();
      const merged = mergeStateByRole(currentState, incomingState, actor);
      const saved = saveSharedState(merged, actor);
      return sendJson(res, 200, { ok: true, state: sanitizeStateForClient(saved), sessionUser: actor });
    }

    if (reqUrl.pathname === '/api/state/reset' && req.method === 'POST') {
      const actor = getUserFromToken(token);
      if (!actor || actor.role !== 'superadmin') return sendJson(res, 403, { ok: false, message: 'فقط الأدمن العام يمكنه إعادة تهيئة المنصة.' });
      const fresh = createDefaultSharedState();
      saveSharedState(fresh, actor);
      return sendJson(res, 200, { ok: true, state: sanitizeStateForClient(fresh), sessionUser: actor });
    }

    if (reqUrl.pathname === '/api/state/export' && req.method === 'GET') {
      const actor = getUserFromToken(token);
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
      const actor = getUserFromToken(token);
      if (!actor || actor.role !== 'superadmin') return sendJson(res, 403, { ok: false, message: 'فقط الأدمن العام يمكنه عرض حالة النسخ الاحتياطي.' });
      const latestPath = path.join(BACKUPS_DIR, 'latest.json');
      let latest = null;
      if (existsSync(latestPath)) {
        try { latest = JSON.parse(readFileSync(latestPath, 'utf8')); } catch {}
      }
      return sendJson(res, 200, { ok: true, backupsDir: BACKUPS_DIR, retentionDays: BACKUP_RETENTION_DAYS, latest });
    }

    // أخذ نسخة احتياطية فورية الآن
    if (reqUrl.pathname === '/api/backups/create-now' && req.method === 'POST') {
      const actor = getUserFromToken(token);
      if (!actor || actor.role !== 'superadmin') return sendJson(res, 403, { ok: false, message: 'فقط الأدمن العام يمكنه إنشاء نسخة احتياطية.' });
      try {
        const currentState = getSharedState();
        const now = new Date();
        // استخدام طابع زمني دقيق يشمل الساعة والدقيقة لتمييز النسخ اليدوية
        const stamp = `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}-${String(now.getDate()).padStart(2,'0')}`;
        const timeStamp = `${String(now.getHours()).padStart(2,'0')}${String(now.getMinutes()).padStart(2,'0')}${String(now.getSeconds()).padStart(2,'0')}`;
        const uniqueStamp = `${stamp}-manual-${timeStamp}`;
        const globalJsonPath = path.join(GLOBAL_BACKUPS_DIR, `platform-${uniqueStamp}.json`);
        const globalPayload = {
          exportedAt: now.toISOString(),
          type: 'platform-manual-backup',
          reason: 'manual',
          createdBy: actor.username,
          state: sanitizeStateForClient(currentState),
        };
        const { writeFile: wf } = await import('node:fs/promises');
        await mkdir(GLOBAL_BACKUPS_DIR, { recursive: true });
        await mkdir(SCHOOL_BACKUPS_DIR, { recursive: true });
        await wf(globalJsonPath, JSON.stringify(globalPayload, null, 2), 'utf8');
        // نسخ لكل مدرسة
        for (const school of currentState.schools || []) {
          const slug = safeBackupSlug(school.code || school.name || `school-${school.id}`);
          const schoolFile = path.join(SCHOOL_BACKUPS_DIR, `${uniqueStamp}-${slug}.json`);
          await wf(schoolFile, JSON.stringify(schoolBackupPayload(school, sanitizeStateForClient(currentState)), null, 2), 'utf8');
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
    }

    // قائمة النسخ الاحتياطية التلقائية
    if (reqUrl.pathname === '/api/backups/list' && req.method === 'GET') {
      const actor = getUserFromToken(token);
      if (!actor || actor.role !== 'superadmin') return sendJson(res, 403, { ok: false, message: 'فقط الأدمن العام يمكنه عرض النسخ الاحتياطية.' });
      try {
        const { readdir, stat } = await import('node:fs/promises');
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
    }

    // استيراد (استعادة) نسخة احتياطية محددة من الخادم
    const backupRestoreMatch = reqUrl.pathname.match(/^\/api\/backups\/restore\/(global|school)\/(.+)$/);
    if (backupRestoreMatch && req.method === 'POST') {
      const actor = getUserFromToken(token);
      if (!actor || actor.role !== 'superadmin') return sendJson(res, 403, { ok: false, message: 'فقط الأدمن العام يمكنه استعادة النسخ الاحتياطية.' });
      const backupType = backupRestoreMatch[1];
      const fileName = backupRestoreMatch[2];
      const safeName = path.basename(fileName);
      if (!safeName.endsWith('.json')) return sendJson(res, 400, { ok: false, message: 'يمكن استعادة ملفات JSON فقط.' });
      const dir = backupType === 'global' ? GLOBAL_BACKUPS_DIR : SCHOOL_BACKUPS_DIR;
      const filePath = path.join(dir, safeName);
      if (!existsSync(filePath)) return sendJson(res, 404, { ok: false, message: 'ملف النسخة الاحتياطية غير موجود.' });
      try {
        const raw = readFileSync(filePath, 'utf8');
        const parsed = JSON.parse(raw);
        // النسخة الكاملة للمنصة تحتوي على .state
        const stateToRestore = parsed.state || parsed;
        if (!stateToRestore || !Array.isArray(stateToRestore.schools)) {
          return sendJson(res, 400, { ok: false, message: 'بنية النسخة الاحتياطية غير صالحة أو لا تحتوي على بيانات مدارس.' });
        }
        const saved = saveSharedState(stateToRestore, actor);
        return sendJson(res, 200, { ok: true, message: `تمت استعادة النسخة الاحتياطية "${safeName}" بنجاح.`, state: sanitizeStateForClient(saved), sessionUser: actor });
      } catch (err) {
        return sendJson(res, 500, { ok: false, message: 'تعذر قراءة أو تطبيق النسخة الاحتياطية: ' + (err?.message || '') });
      }
    }

    // تحميل نسخة احتياطية محددة
    const backupDownloadMatch = reqUrl.pathname.match(/^\/api\/backups\/download\/(global|school)\/(.+)$/);
    if (backupDownloadMatch && req.method === 'GET') {
      const actor = getUserFromToken(token);
      if (!actor || actor.role !== 'superadmin') return sendJson(res, 403, { ok: false, message: 'فقط الأدمن العام يمكنه تحميل النسخ الاحتياطية.' });
      const backupType = backupDownloadMatch[1];
      const fileName = backupDownloadMatch[2];
      // تأمين اسم الملف من path traversal
      const safeName = path.basename(fileName);
      if (!safeName.endsWith('.json') && !safeName.endsWith('.db')) return sendJson(res, 400, { ok: false, message: 'نوع الملف غير مدعوم.' });
      const dir = backupType === 'global' ? GLOBAL_BACKUPS_DIR : SCHOOL_BACKUPS_DIR;
      const filePath = path.join(dir, safeName);
      if (!existsSync(filePath)) return sendJson(res, 404, { ok: false, message: 'الملف غير موجود.' });
      try {
        const content = readFileSync(filePath);
        res.writeHead(200, {
          'Content-Type': safeName.endsWith('.db') ? 'application/octet-stream' : 'application/json; charset=utf-8',
          'Content-Disposition': `attachment; filename="${safeName}"`,
          'Content-Length': content.length,
        });
        res.end(content);
      } catch (err) {
        return sendJson(res, 500, { ok: false, message: 'تعذر تحميل الملف.' });
      }
      return;
    }

    // استعادة نسخة من ملف JSON مرفوع من الكمبيوتر
    if (reqUrl.pathname === '/api/backups/restore-from-upload' && req.method === 'POST') {
      const actor = getUserFromToken(token);
      if (!actor || actor.role !== 'superadmin') return sendJson(res, 403, { ok: false, message: 'فقط الأدمن العام يمكنه استعادة النسخ الاحتياطية.' });
      try {
        const body = await readJsonBody(req);
        const stateToRestore = body.state || body;
        if (!stateToRestore || !Array.isArray(stateToRestore.schools)) {
          return sendJson(res, 400, { ok: false, message: 'بنية الملف غير صالحة. تأكد أن الملف نسخة احتياطية صحيحة من المنصة.' });
        }
        const saved = saveSharedState(stateToRestore, actor);
        return sendJson(res, 200, { ok: true, message: 'تمت استعادة النسخة من الملف بنجاح.', state: sanitizeStateForClient(saved), sessionUser: actor });
      } catch (err) {
        return sendJson(res, 500, { ok: false, message: 'تعذر قراءة أو تطبيق الملف: ' + (err?.message || '') });
      }
    }

    // حذف نسخة احتياطية محددة
    const backupDeleteMatch = reqUrl.pathname.match(/^\/api\/backups\/delete\/(global|school)\/(.+)$/);
    if (backupDeleteMatch && req.method === 'DELETE') {
      const actor = getUserFromToken(token);
      if (!actor || actor.role !== 'superadmin') return sendJson(res, 403, { ok: false, message: 'فقط الأدمن العام يمكنه حذف النسخ الاحتياطية.' });
      const backupType = backupDeleteMatch[1];
      const fileName = backupDeleteMatch[2];
      const safeName = path.basename(fileName);
      if (!safeName.endsWith('.json')) return sendJson(res, 400, { ok: false, message: 'يمكن حذف ملفات JSON فقط.' });
      const dir = backupType === 'global' ? GLOBAL_BACKUPS_DIR : SCHOOL_BACKUPS_DIR;
      const filePath = path.join(dir, safeName);
      if (!existsSync(filePath)) return sendJson(res, 404, { ok: false, message: 'ملف النسخة الاحتياطية غير موجود.' });
      try {
        const { unlink } = await import('node:fs/promises');
        await unlink(filePath);
        return sendJson(res, 200, { ok: true, message: `تم حذف النسخة الاحتياطية "${safeName}" بنجاح.` });
      } catch (err) {
        return sendJson(res, 500, { ok: false, message: 'تعذر حذف الملف: ' + (err?.message || '') });
      }
    }
    // استيراد بيانات مدرسة كاملة من ملف JSON
    const schoolImportSnapshotMatch = reqUrl.pathname.match(/^\/api\/schools\/(\d+)\/import-snapshot$/);
    if (schoolImportSnapshotMatch && req.method === 'POST') {
      const actor = getUserFromToken(token);
      if (!actor || actor.role !== 'superadmin') return sendJson(res, 403, { ok: false, message: 'فقط الأدمن العام يمكنه استيراد بيانات المدرسة.' });
      const schoolId = Number(schoolImportSnapshotMatch[1]);
      try {
        const body = await readJsonBody(req);
        // يقبل كائن المدرسة مباشرةً أو مغلفاً في school: {...}
        const schoolData = body.school || body;
        if (!schoolData || typeof schoolData !== 'object' || !schoolData.name) {
          return sendJson(res, 400, { ok: false, message: 'بنية الملف غير صالحة. تأكد أنه ملف تصدير مدرسة صحيح.' });
        }
        const current = getSharedState();
        const next = structuredClone(current);
        const idx = next.schools.findIndex((item) => Number(item.id) === schoolId);
        if (idx === -1) return sendJson(res, 404, { ok: false, message: 'المدرسة غير موجودة.' });
        // احتفظ بالمعرف الحالي للمدرسة (الرقم والروابط والإعدادات)
        const existingId = next.schools[idx].id;
        const existingSmartLinks = next.schools[idx].smartLinks;
        const existingSettings = next.schools[idx].settings;
        next.schools[idx] = {
          ...schoolData,
          id: existingId,
          smartLinks: existingSmartLinks || schoolData.smartLinks,
          settings: existingSettings || schoolData.settings,
        };
        const saved = saveSharedState(next, actor);
        return sendJson(res, 200, {
          ok: true,
          message: `تم استيراد بيانات مدرسة "${schoolData.name}" بنجاح.`,
          state: sanitizeStateForClient(saved),
          sessionUser: actor,
        });
      } catch (err) {
        return sendJson(res, 500, { ok: false, message: 'تعذر قراءة أو تطبيق الملف: ' + (err?.message || '') });
      }
    }

    const schoolDeviceMatch = reqUrl.pathname.match(/^\/api\/schools\/(\d+)\/device-links$/);
    if (schoolDeviceMatch && req.method === 'POST') {
      const actor = getUserFromToken(token);
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
        const saved = saveSharedState(next, actor);
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
      const saved = saveSharedState(next, actor);
      return sendJson(res, 200, { ok: true, link: screen, state: sanitizeStateForClient(saved) });
    }

    const schoolDeviceUpdateMatch = reqUrl.pathname.match(/^\/api\/schools\/(\d+)\/device-links\/screen\/([^/]+)$/);
    if (schoolDeviceUpdateMatch && req.method === 'PATCH') {
      const actor = getUserFromToken(token);
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
      const saved = saveSharedState(next, actor);
      return sendJson(res, 200, { ok: true, link: screen, state: sanitizeStateForClient(saved) });
    }

    const schoolDeviceDeleteMatch = reqUrl.pathname.match(/^\/api\/schools\/(\d+)\/device-links\/(gate|screen)\/([^/]+)$/);
    if (schoolDeviceDeleteMatch && req.method === 'POST') {
      const actor = getUserFromToken(token);
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
      const saved = saveSharedState(next, actor);
      return sendJson(res, 200, { ok: true, state: sanitizeStateForClient(saved) });
    }

    const schoolImportMatch = reqUrl.pathname.match(/^\/api\/schools\/(\d+)\/students\/import$/);
    if (schoolImportMatch && req.method === 'POST') {
      const actor = getUserFromToken(token);
      const schoolId = Number(schoolImportMatch[1]);
      if (!canManageSchoolDevices(actor, schoolId)) return sendJson(res, 403, { ok: false, message: 'ليس لديك صلاحية استيراد الطلاب لهذه المدرسة.' });
      const body = await readJsonBody(req);
      const imported = importStudentsIntoSchool(getSharedState(), schoolId, Array.isArray(body.rows) ? body.rows : []);
      if (!imported.ok) return sendJson(res, 400, imported);
      const saved = saveSharedState(imported.state, actor);
      return sendJson(res, 200, { ok: true, state: sanitizeStateForClient(saved), added: imported.added, skipped: imported.skipped, companiesCreated: imported.companiesCreated });
    }

    const schoolAttendanceBindingMatch = reqUrl.pathname.match(/^\/api\/schools\/(\d+)\/attendance-binding$/);
    if (schoolAttendanceBindingMatch && req.method === 'PATCH') {
      const actor = getUserFromToken(token);
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
      const saved = saveSharedState(next, actor);
      return sendJson(res, 200, { ok: true, attendanceBinding: school.structure.attendanceBinding, state: sanitizeStateForClient(saved) });
    }

    const schoolReportMatch = reqUrl.pathname.match(/^\/api\/schools\/(\d+)\/reports\/executive$/);
    if (schoolReportMatch && req.method === 'GET') {
      const actor = getUserFromToken(token);
      const schoolId = Number(schoolReportMatch[1]);
      if (!canReadSchoolReports(actor, schoolId)) return sendJson(res, 403, { ok: false, message: 'ليس لديك صلاحية عرض التقارير التنفيذية لهذه المدرسة.' });
      const payload = summarizeSchoolLivePayload(getSharedState(), schoolId);
      if (!payload) return sendJson(res, 404, { ok: false, message: 'المدرسة غير موجودة.' });
      return sendJson(res, 200, { ok: true, report: payload });
    }

    const schoolMessagingTestMatch = reqUrl.pathname.match(/^\/api\/schools\/(\d+)\/messages\/test$/);
    if (schoolMessagingTestMatch && req.method === 'POST') {
      const actor = getUserFromToken(token);
      const schoolId = Number(schoolMessagingTestMatch[1]);
      if (!canManageSchoolMessages(actor, schoolId)) return sendJson(res, 403, { ok: false, message: 'ليس لديك صلاحية إدارة الرسائل لهذه المدرسة.' });
      const body = await readJsonBody(req);
      const tested = await testSchoolMessagingIntegration(getSharedState(), schoolId, body.channel === 'sms' ? 'sms' : body.channel === 'internal' ? 'internal' : 'whatsapp', body.settings || null);
      if (tested.state) {
        const saved = saveSharedState(tested.state, actor);
        return sendJson(res, tested.ok ? 200 : 400, { ok: tested.ok, message: tested.message, providerMessageId: tested.providerMessageId || '', state: sanitizeStateForClient(saved) });
      }
      return sendJson(res, tested.ok ? 200 : 400, tested);
    }

    const schoolMessagingSendMatch = reqUrl.pathname.match(/^\/api\/schools\/(\d+)\/messages\/send$/);
    if (schoolMessagingSendMatch && req.method === 'POST') {
      const actor = getUserFromToken(token);
      const schoolId = Number(schoolMessagingSendMatch[1]);
      if (!canManageSchoolMessages(actor, schoolId)) return sendJson(res, 403, { ok: false, message: 'ليس لديك صلاحية إدارة الرسائل لهذه المدرسة.' });
      const body = await readJsonBody(req);
      const processed = await processSchoolMessageSend(getSharedState(), schoolId, actor, body || {});
      if (!processed.ok) return sendJson(res, 400, processed);
      const saved = saveSharedState(processed.state, actor);
      return sendJson(res, 200, { ok: true, message: processed.message, log: processed.log, state: sanitizeStateForClient(saved) });
    }

    const schoolMessagingSettingsMatch = reqUrl.pathname.match(/^\/api\/schools\/(\d+)\/messages\/settings$/);
    if (schoolMessagingSettingsMatch && req.method === 'PATCH') {
      const actor = getUserFromToken(token);
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
      const saved = saveSharedState(next, actor);
      return sendJson(res, 200, { ok: true, state: sanitizeStateForClient(saved) });
    }

    const schoolMessagingTemplateSaveMatch = reqUrl.pathname.match(/^\/api\/schools\/(\d+)\/messages\/templates\/save$/);
    if (schoolMessagingTemplateSaveMatch && req.method === 'POST') {
      const actor = getUserFromToken(token);
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
      const saved = saveSharedState(next, actor);
      return sendJson(res, 200, { ok: true, state: sanitizeStateForClient(saved) });
    }

    const schoolMessagingTemplateDeleteMatch = reqUrl.pathname.match(/^\/api\/schools\/(\d+)\/messages\/templates\/([^/]+)\/delete$/);
    if (schoolMessagingTemplateDeleteMatch && req.method === 'POST') {
      const actor = getUserFromToken(token);
      const schoolId = Number(schoolMessagingTemplateDeleteMatch[1]);
      const templateId = schoolMessagingTemplateDeleteMatch[2];
      if (!canManageSchoolMessages(actor, schoolId)) return sendJson(res, 403, { ok: false, message: 'ليس لديك صلاحية إدارة الرسائل لهذه المدرسة.' });
      const current = getSharedState();
      const next = structuredClone(current);
      const school = next.schools.find((item) => Number(item.id) === schoolId);
      if (!school) return sendJson(res, 404, { ok: false, message: 'المدرسة غير موجودة.' });
      school.messaging = school.messaging || {};
      school.messaging.templates = (school.messaging.templates || []).filter((item) => String(item.id) !== String(templateId));
      const saved = saveSharedState(next, actor);
      return sendJson(res, 200, { ok: true, state: sanitizeStateForClient(saved) });
    }

    const schoolMessagingRuleSaveMatch = reqUrl.pathname.match(/^\/api\/schools\/(\d+)\/messages\/rules\/save$/);
    if (schoolMessagingRuleSaveMatch && req.method === 'POST') {
      const actor = getUserFromToken(token);
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
      const saved = saveSharedState(next, actor);
      return sendJson(res, 200, { ok: true, state: sanitizeStateForClient(saved) });
    }

    const schoolMessagingRuleToggleMatch = reqUrl.pathname.match(/^\/api\/schools\/(\d+)\/messages\/rules\/([^/]+)\/toggle$/);
    if (schoolMessagingRuleToggleMatch && req.method === 'POST') {
      const actor = getUserFromToken(token);
      const schoolId = Number(schoolMessagingRuleToggleMatch[1]);
      const ruleId = schoolMessagingRuleToggleMatch[2];
      if (!canManageSchoolMessages(actor, schoolId)) return sendJson(res, 403, { ok: false, message: 'ليس لديك صلاحية إدارة الرسائل لهذه المدرسة.' });
      const current = getSharedState();
      const next = structuredClone(current);
      const school = next.schools.find((item) => Number(item.id) === schoolId);
      if (!school) return sendJson(res, 404, { ok: false, message: 'المدرسة غير موجودة.' });
      school.messaging = school.messaging || {};
      school.messaging.rules = (school.messaging.rules || []).map((item) => String(item.id) !== String(ruleId) ? item : { ...item, active: item?.active === false });
      const saved = saveSharedState(next, actor);
      return sendJson(res, 200, { ok: true, state: sanitizeStateForClient(saved) });
    }

    const schoolStudentsMatch = reqUrl.pathname.match(/^\/api\/schools\/(\d+)\/students$/);
    if (schoolStudentsMatch && req.method === 'GET') {
      const actor = getUserFromToken(token);
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
      const actor = getUserFromToken(token);
      const schoolId = Number(schoolStudentFaceMatch[1]);
      const studentId = Number(schoolStudentFaceMatch[2]);
      if (!canManageStudentActions(actor, schoolId)) return sendJson(res, 403, { ok: false, message: 'ليس لديك صلاحية تعديل بصمة الوجه لهذه المدرسة.' });
      const body = await readJsonBody(req);
      const current = getSharedState();
      const next = structuredClone(current);
      const school = next.schools.find((item) => Number(item.id) === schoolId);
      if (!school) return sendJson(res, 404, { ok: false, message: 'المدرسة غير موجودة.' });
      // البحث في school.students أولاً (المصدر القديم)
      let student = school.students.find((item) => Number(item.id) === studentId);
      let studentSource = 'school';
      let classroomRef = null;

      // إذا لم يوجد في المصدر القديم، ابحث في الهيكل المدرسي (structure.classrooms)
      if (!student && Array.isArray(school?.structure?.classrooms)) {
        for (const classroom of school.structure.classrooms) {
          if (!Array.isArray(classroom.students)) continue;
          const found = classroom.students.find((item) => Number(item.id) === studentId);
          if (found) {
            student = found;
            classroomRef = classroom;
            studentSource = 'structure';
            break;
          }
        }
      }

      if (!student) return sendJson(res, 404, { ok: false, message: 'الطالب غير موجود.' });

      const signature = Array.isArray(body.signature) ? body.signature : [];
      const imageUrl = body.imageData ? await writeDataUrlToUploads(FACE_UPLOADS_DIR, [String(schoolId), String(studentId)], `face-${Date.now()}`, body.imageData) : student.facePhoto;
      student.faceReady = Boolean(signature.length || imageUrl);
      student.faceSignature = signature;
      student.facePhoto = imageUrl || '';

      const saved = saveSharedState(next, actor);
      const updatedSchool = saved.schools.find((item) => Number(item.id) === schoolId);
      // استرجاع الطالب المحدّث من المصدر الصحيح
      let updatedStudent = null;
      if (studentSource === 'structure' && classroomRef) {
        const updatedClassroom = updatedSchool?.structure?.classrooms?.find((c) => Number(c.id) === Number(classroomRef.id));
        updatedStudent = updatedClassroom?.students?.find((item) => Number(item.id) === studentId) || null;
      } else {
        updatedStudent = updatedSchool?.students?.find((item) => Number(item.id) === studentId) || null;
      }
      return sendJson(res, 200, { ok: true, student: updatedStudent, state: sanitizeStateForClient(saved) });
    }

    const schoolActionApplyMatch = reqUrl.pathname.match(/^\/api\/schools\/(\d+)\/actions\/apply$/);
    if (schoolActionApplyMatch && req.method === 'POST') {
      const actor = getUserFromToken(token);
      const schoolId = Number(schoolActionApplyMatch[1]);
      if (!canManageStudentActions(actor, schoolId)) return sendJson(res, 403, { ok: false, message: 'ليس لديك صلاحية تنفيذ إجراءات الطلاب لهذه المدرسة.' });
      const body = await readJsonBody(req);
      const applied = applyStudentActionToState(getSharedState(), schoolId, body, actor);
      if (!applied.ok) return sendJson(res, 400, applied);
      let saved = saveSharedState(applied.state, actor);
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
        if (automated?.state) saved = saveSharedState(automated.state, actor);
      }
      return sendJson(res, 200, { ok: true, message: applied.message, logEntry: applied.logEntry, student: applied.student, state: sanitizeStateForClient(saved) });
    }

    const schoolProgramApplyMatch = reqUrl.pathname.match(/^\/api\/schools\/(\d+)\/programs\/apply$/);
    if (schoolProgramApplyMatch && req.method === 'POST') {
      const actor = getUserFromToken(token);
      const schoolId = Number(schoolProgramApplyMatch[1]);
      if (!canManageStudentActions(actor, schoolId)) return sendJson(res, 403, { ok: false, message: 'ليس لديك صلاحية اعتماد البرامج لهذه المدرسة.' });
      const body = await readJsonBody(req);
      const applied = await applyProgramToState(getSharedState(), schoolId, body, actor);
      if (!applied.ok) return sendJson(res, 400, applied);
      const saved = saveSharedState(applied.state, actor);
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

    const publicGateScanMatch = reqUrl.pathname.match(/^\/api\/public\/gate\/([^/]+)\/scan$/);
    if (publicGateScanMatch && req.method === 'POST') {
      const state = getSharedState();
      const match = findGateConfigByToken(state, publicGateScanMatch[1]);
      if (!match) return sendJson(res, 404, { ok: false, message: 'رابط البوابة غير صالح.' });
      const body = await readJsonBody(req);
      const applied = applyAttendanceScanToState(state, match.school.id, body.barcode, body.method || 'QR');
      if (!applied.ok) return sendJson(res, 400, applied);
      let finalState = applied.state;
      if (String(applied.message || '').includes('تأخر')) {
        const automatedLate = await runAutomatedMessagingForSchool(finalState, match.school.id, { eventType: 'late', studentId: applied.student?.id, isoDate: applied.logEntry?.isoDate, lateTime: applied.logEntry?.time, time: applied.logEntry?.time, now: new Date().toISOString() });
        finalState = automatedLate.state || finalState;
      }
      const automatedAbsence = await runAutomatedMessagingForSchool(finalState, match.school.id, { eventType: 'absence', isoDate: applied.logEntry?.isoDate, now: new Date().toISOString() });
      finalState = automatedAbsence.state || finalState;
      const saved = saveSharedState(finalState, { username: `public:${match.gate.name}`, role: 'gate' });
      const live = summarizeSchoolLivePayload(saved, match.school.id);
      return sendJson(res, 200, { ok: true, message: applied.message, logEntry: applied.logEntry, student: applied.student, live });
    }

    const publicScreenMatch = reqUrl.pathname.match(/^\/api\/public\/screen\/([^/]+)$/);
    if (publicScreenMatch && req.method === 'GET') {
      const state = getSharedState();
      const match = findScreenConfigByToken(state, publicScreenMatch[1]);
      if (!match) return sendJson(res, 404, { ok: false, message: 'رابط الشاشة غير صالح.' });
      const live = summarizeSchoolLivePayload(state, match.school.id, match.screen);
      return sendJson(res, 200, { ok: true, screen: match.screen, live });
    }

    // ===== مسارات API بوابة ولي الأمر =====

    // جلب إعدادات البوابة والطلبات
    if (reqUrl.pathname === '/api/admin/parent-primary-requests' && req.method === 'GET') {
      const actor = getUserFromToken(token);
      if (!actor) return sendJson(res, 401, { ok: false, message: 'الجلسة منتهية أو غير صالحة.' });
      if (!['superadmin', 'principal', 'supervisor'].includes(actor.role)) return sendJson(res, 403, { ok: false, message: 'غير مصرح.' });
      const state = getSharedState();
      const portalSettings = state.settings?.parentPortal || {};
      return sendJson(res, 200, {
        ok: true,
        requests: [],
        alerts: [],
        policy: { mode: portalSettings.approvalMode || 'auto' },
        portalSettings: {
          enabled: portalSettings.enabled !== false,
          altLoginEnabled: portalSettings.loginMethods?.nationalId !== false,
          loginMethods: portalSettings.loginMethods || { nationalId: true, studentId: true, mobileNumber: true, email: false },
          allowRegistration: portalSettings.allowRegistration === true,
        },
      });
    }

    // حفظ سياسة البوابة
    if (reqUrl.pathname === '/api/admin/parent-primary-requests/policy' && req.method === 'POST') {
      const actor = getUserFromToken(token);
      if (!actor) return sendJson(res, 401, { ok: false, message: 'الجلسة منتهية أو غير صالحة.' });
      if (!['superadmin', 'principal'].includes(actor.role)) return sendJson(res, 403, { ok: false, message: 'غير مصرح.' });
      const body = await readJsonBody(req);
      const state = getSharedState();
      const updated = {
        ...state,
        settings: {
          ...state.settings,
          parentPortal: {
            ...(state.settings?.parentPortal || {}),
            approvalMode: body.mode || 'auto',
          },
        },
      };
      saveSharedState(updated, actor);
      return sendJson(res, 200, { ok: true });
    }

    // حفظ إعدادات البوابة (تفعيل/تعطيل، طرق الدخول)
    if (reqUrl.pathname === '/api/admin/parent-primary-requests/portal-settings' && req.method === 'POST') {
      const actor = getUserFromToken(token);
      if (!actor) return sendJson(res, 401, { ok: false, message: 'الجلسة منتهية أو غير صالحة.' });
      if (!['superadmin', 'principal'].includes(actor.role)) return sendJson(res, 403, { ok: false, message: 'غير مصرح.' });
      const body = await readJsonBody(req);
      const state = getSharedState();
      const currentPortal = state.settings?.parentPortal || {};
      const updatedPortal = { ...currentPortal };
      if (typeof body.enabled === 'boolean') updatedPortal.enabled = body.enabled;
      if (typeof body.altLoginEnabled === 'boolean') {
        updatedPortal.loginMethods = { ...(currentPortal.loginMethods || {}), nationalId: body.altLoginEnabled };
      }
      if (body.loginMethods && typeof body.loginMethods === 'object') {
        updatedPortal.loginMethods = { ...(currentPortal.loginMethods || {}), ...body.loginMethods };
      }
      if (typeof body.allowRegistration === 'boolean') updatedPortal.allowRegistration = body.allowRegistration;
      const updated = {
        ...state,
        settings: {
          ...state.settings,
          parentPortal: updatedPortal,
        },
      };
      saveSharedState(updated, actor);
      return sendJson(res, 200, { ok: true, portalSettings: updatedPortal });
    }

    // جلب قائمة أولياء الأمور
    if (reqUrl.pathname === '/api/admin/parents' && req.method === 'GET') {
      const actor = getUserFromToken(token);
      if (!actor) return sendJson(res, 401, { ok: false, message: 'الجلسة منتهية أو غير صالحة.' });
      if (!['superadmin', 'principal', 'supervisor'].includes(actor.role)) return sendJson(res, 403, { ok: false, message: 'غير مصرح.' });
      return sendJson(res, 200, { ok: true, parents: [] });
    }

    // سجل أولياء الأمور
    if (reqUrl.pathname === '/api/admin/parents/audit-feed' && req.method === 'GET') {
      const actor = getUserFromToken(token);
      if (!actor) return sendJson(res, 401, { ok: false, message: 'الجلسة منتهية أو غير صالحة.' });
      if (!['superadmin', 'principal', 'supervisor'].includes(actor.role)) return sendJson(res, 403, { ok: false, message: 'غير مصرح.' });
      return sendJson(res, 200, { ok: true, feed: [] });
    }

    // إرسال رمز الوصول لولي الأمر
    if (reqUrl.pathname === '/api/admin/parents/send-access-code' && req.method === 'POST') {
      const actor = getUserFromToken(token);
      if (!actor) return sendJson(res, 401, { ok: false, message: 'الجلسة منتهية أو غير صالحة.' });
      if (!['superadmin', 'principal'].includes(actor.role)) return sendJson(res, 403, { ok: false, message: 'غير مصرح.' });
      return sendJson(res, 200, { ok: true, message: 'تم إرسال رمز الوصول.' });
    }

    // توليد رابط الوصول
    if (reqUrl.pathname === '/api/admin/parents/generate-link' && req.method === 'POST') {
      const actor = getUserFromToken(token);
      if (!actor) return sendJson(res, 401, { ok: false, message: 'الجلسة منتهية أو غير صالحة.' });
      if (!['superadmin', 'principal'].includes(actor.role)) return sendJson(res, 403, { ok: false, message: 'غير مصرح.' });
      const body = await readJsonBody(req);
      const link = `${body.baseUrl || ''}/parent?token=demo`;
      return sendJson(res, 200, { ok: true, link });
    }

    // تفاصيل ولي الأمر
    if (reqUrl.pathname === '/api/admin/parents/details' && req.method === 'GET') {
      const actor = getUserFromToken(token);
      if (!actor) return sendJson(res, 401, { ok: false, message: 'الجلسة منتهية أو غير صالحة.' });
      if (!['superadmin', 'principal', 'supervisor'].includes(actor.role)) return sendJson(res, 403, { ok: false, message: 'غير مصرح.' });
      return sendJson(res, 200, { ok: true, parent: null });
    }

    // تعليق/رفع تعليق ولي الأمر
    if (reqUrl.pathname === '/api/admin/parents/toggle-suspension' && req.method === 'POST') {
      const actor = getUserFromToken(token);
      if (!actor) return sendJson(res, 401, { ok: false, message: 'الجلسة منتهية أو غير صالحة.' });
      if (!['superadmin', 'principal'].includes(actor.role)) return sendJson(res, 403, { ok: false, message: 'غير مصرح.' });
      return sendJson(res, 200, { ok: true });
    }

    // إعادة تعيين طالب لولي أمر
    if (reqUrl.pathname === '/api/admin/parents/reassign-student' && req.method === 'POST') {
      const actor = getUserFromToken(token);
      if (!actor) return sendJson(res, 401, { ok: false, message: 'الجلسة منتهية أو غير صالحة.' });
      if (!['superadmin', 'principal'].includes(actor.role)) return sendJson(res, 403, { ok: false, message: 'غير مصرح.' });
      return sendJson(res, 200, { ok: true });
    }

    // ===== إضافة مدرسة جديدة =====
    if (reqUrl.pathname === '/api/schools' && req.method === 'POST') {
      const actor = getUserFromToken(token);
      if (!actor) return sendJson(res, 401, { ok: false, message: 'الجلسة منتهية أو غير صالحة.' });
      if (actor.role !== 'superadmin') return sendJson(res, 403, { ok: false, message: 'فقط الأدمن العام يمكنه إضافة مدارس.' });
      const form = await readJsonBody(req);
      const currentState = getSharedState();
      // التحقق من البيانات المطلوبة
      const principalUsername = String(form.principalUsername || '').trim().toLowerCase();
      const principalEmail = String(form.principalEmail || '').trim().toLowerCase();
      const principalPassword = String(form.principalPassword || '').trim();
      if (!form.name || !principalUsername || !principalEmail || !principalPassword) {
        return sendJson(res, 400, { ok: false, message: 'بيانات المدرسة أو مدير المدرسة غير مكتملة.' });
      }
      if (currentState.users.some((u) => String(u.username || '').toLowerCase() === principalUsername)) {
        return sendJson(res, 400, { ok: false, message: 'اسم دخول مدير المدرسة مستخدم مسبقاً. اختر اسماً آخر.' });
      }
      if (currentState.users.some((u) => String(u.email || '').toLowerCase() === principalEmail)) {
        return sendJson(res, 400, { ok: false, message: 'البريد الإلكتروني مستخدم مسبقاً. اختر بريداً آخر.' });
      }
      const newId = Math.max(0, ...currentState.schools.map((s) => s.id)) + 1;
      const newSchool = {
        id: newId,
        name: String(form.name || '').trim(),
        city: String(form.city || '').trim(),
        code: String(form.code || '').trim(),
        manager: String(form.manager || '—').trim(),
        status: 'نشطة',
        companies: [],
        students: [],
        principalProfile: {
          username: principalUsername,
          email: principalEmail,
          password: principalPassword,
        },
      };
      const nextUserId = Math.max(0, ...currentState.users.map((u) => u.id)) + 1;
      const principalUser = {
        id: nextUserId,
        username: principalUsername,
        email: principalEmail,
        password: principalPassword,
        role: 'principal',
        schoolId: newId,
        active: true,
        permissions: {},
      };
      const nextState = hydrateSharedState({
        ...currentState,
        schools: [...currentState.schools, newSchool],
        users: [...currentState.users, principalUser],
      });
      const saved = saveSharedState(nextState, actor);
      return sendJson(res, 200, { ok: true, school: newSchool, state: sanitizeStateForClient(saved) });
    }
    // ===== نهاية إضافة مدرسة جديدة =====
    // ===== نهاية مسارات API بوابة ولي الأمر =====
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
    const live = summarizeSchoolLivePayload(state, match.school.id);
    wsSend(socket, kind === 'gate' ? { type: 'live_update', kind, gate: match.gate, live } : { type: 'live_update', kind, screen: match.screen, live });
  } catch {
    try { socket.destroy(); } catch {}
  }
});

server.listen(PORT, () => {
  console.log(`ideal-company-platform server running on http://localhost:${PORT}`);
  console.log(`sqlite db: ${DB_PATH}`);
});

// ===== جدول النسخ الاحتياطي اليومي الثابت (كل يوم الساعة 12:00 منتصف الليل) =====
function scheduleNextMidnightBackup() {
  const now = new Date();
  const next = new Date(now);
  next.setHours(0, 0, 0, 0); // منتصف الليل
  if (next <= now) {
    next.setDate(next.getDate() + 1); // إذا مرّ منتصف الليل اليوم، انتظر للغد
  }
  const msUntilMidnight = next.getTime() - now.getTime();
  console.log(`[backup] Next scheduled backup in ${Math.round(msUntilMidnight / 60000)} minutes (at midnight).`);
  setTimeout(async () => {
    console.log('[backup] Running scheduled midnight backup...');
    await ensureDailyBackups('scheduled-midnight');
    scheduleNextMidnightBackup(); // جدولة اليوم التالي
  }, msUntilMidnight);
}
scheduleNextMidnightBackup();

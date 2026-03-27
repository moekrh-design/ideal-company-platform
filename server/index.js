
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
const SCREEN_TRANSITION_KEYS = ['fade','cut','slide-left','slide-right','slide-up','slide-down','zoom-in','zoom-out','flip-x','flip-y','rotate-soft','rotate-in','blur','bounce','scale-up','scale-down','swing','curtain','diagonal','pop','float','random'];
const SCREEN_THEME_KEYS = ['emerald-night','blue-contrast','violet-stage','sunrise','graphite'];
const SCREEN_TEMPLATE_KEYS = ['executive','reception','leaderboard','news'];
const TICKER_BG_KEYS = ['amber','navy','emerald','rose','slate'];

// State cache (must be declared before any top-level await calls)
let _stateCache = null;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DATABASE_URL ? { rejectUnauthorized: false } : false,
  max: 10,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 10000,
});

// Helper: run a query
async function dbQuery(text, params = []) {
  const client = await pool.connect();
  try {
    const res = await client.query(text, params);
    return res.rows;
  } finally {
    client.release();
  }
}

// Helper: run a query and return first row
async function dbQueryOne(text, params = []) {
  const rows = await dbQuery(text, params);
  return rows[0] || null;
}

// Helper: run a query and return all rows (alias for dbQuery)
async function dbQueryAll(text, params = []) {
  return dbQuery(text, params);
}

// Helper: run a query with no return value
async function dbRun(text, params = []) {
  await dbQuery(text, params);
}

async function initializeDatabase() {
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
  return String(value || 'school').trim().toLowerCase().replace(/[^a-z0-9؀-ۿ]+/g, '-') .replace(/^-+|-+$/g, '') || 'school';
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

async function getSharedStateAsync() {
  if (_stateCache) return _stateCache;
  const row = await dbQueryOne("SELECT value FROM app_meta WHERE key = $1", ["shared_state"]); if (!row) {
    console.log('No shared state in DB, creating default');
    return await createDefaultSharedState(dbQueryOne, dbRun);
  }
  try {
    const state = JSON.parse(row.value);
    return hydrateSharedState(state, dbQueryOne, dbRun);
  } catch (error) {
    console.error('Error parsing shared state from DB', error);
    return await createDefaultSharedState(dbQueryOne, dbRun);
  }
}

function getSharedState() {
  return _stateCache;
}

async function refreshStateCache() {
  _stateCache = await getSharedStateAsync();
  return _stateCache;
}

async function updateSharedState(newState, actor) {
  const current = await getSharedStateAsync(); // Ensure we have the latest state
  const updated = { ...current, ...newState };
  const normalized = await normalizeStateForStorage(updated, current);
  await dbRun('UPDATE app_meta SET value = $1, updated_at = $2 WHERE key = $3', [JSON.stringify(normalized), nowIso(), 'shared_state']);
  _stateCache = normalized;
  if (actor) {
    await logAuditEvent(actor, 'update_shared_state', { keys: Object.keys(newState) });
  }
  return _stateCache;
}

async function ensureStateSeeded() {
  const row = await dbQueryOne('SELECT key FROM app_meta WHERE key = $1', ['shared_state']);
  if (row) return;
  console.log('Seeding database with default state');
  const defaultState = await createDefaultSharedState(dbQueryOne, dbRun);
  const normalized = await normalizeStateForStorage(defaultState);
  await dbRun('INSERT INTO app_meta (key, value, updated_at) VALUES ($1, $2, $3)', ['shared_state', JSON.stringify(normalized), nowIso()]);
  _stateCache = normalized;
}

async function ensureStateMigrations() {
  // Placeholder for future database schema migrations
}

async function cleanupExpiredSessions() {
  await dbRun('DELETE FROM sessions WHERE expires_at < $1', [nowIso()]);
}

async function cleanupExpiredAuthOtps() {
  await dbRun('DELETE FROM auth_otps WHERE expires_at < $1', [nowIso()]);
}

async function cleanupExpiredAuthLockouts() {
  await dbRun('DELETE FROM auth_lockouts WHERE expires_at < $1', [nowIso()]);
}

async function createSession(user) {
  const token = crypto.randomBytes(32).toString('hex');
  const createdAt = nowIso();
  const expiresAt = daysFromNow(SESSION_DAYS);
  await dbRun('INSERT INTO sessions (token, user_id, username, role, school_id, created_at, expires_at) VALUES ($1, $2, $3, $4, $5, $6, $7)', [token, user.id, user.username, user.role, user.schoolId, createdAt, expiresAt]);
  return { token, user, expiresAt };
}

async function getSession(token) {
  if (!token) return null;
  const row = await dbQueryOne('SELECT * FROM sessions WHERE token = $1 AND expires_at >= $2', [token, nowIso()]);
  if (!row) return null;
  const state = getSharedState();
  const user = state.users.find((u) => u.id === row.user_id);
  if (!user) return null;
  return { token: row.token, user, expiresAt: row.expires_at };
}

async function deleteSession(token) {
  await dbRun('DELETE FROM sessions WHERE token = $1', [token]);
}

async function logAuditEvent(actor, action, details) {
  const { username, role } = actor || {};
  await dbRun('INSERT INTO audit_log (actor_username, actor_role, action, created_at, details) VALUES ($1, $2, $3, $4, $5)', [username, role, action, nowIso(), JSON.stringify(details)]);
}

async function handleApiRequest(req, res) {
  const url = new URL(req.url, `http://${req.headers.host}`);
  const session = await getSession(req.headers.authorization?.split(' ')[1]);
  const user = session?.user;

  if (url.pathname === '/api/v1/health') {
    return sendJson(res, { status: 'ok' });
  }

  if (url.pathname === '/api/v1/state') {
    if (!user) return sendUnauthorized(res);
    const state = getSharedState();
    return sendJson(res, sanitizeStateForClient(state));
  }

  if (url.pathname === '/api/v1/login' && req.method === 'POST') {
    const { username, password } = await readJsonBody(req);
    const state = getSharedState();
    const user = state.users.find((u) => u.username === username);
    if (!user || !await verifyPassword(password, user.password)) {
      return sendUnauthorized(res, 'Invalid credentials');
    }
    const newSession = await createSession(user);
    await logAuditEvent(user, 'login_success');
    return sendJson(res, newSession);
  }

  if (url.pathname === '/api/v1/logout' && req.method === 'POST') {
    const token = req.headers.authorization?.split(' ')[1];
    if (token) await deleteSession(token);
    if (user) await logAuditEvent(user, 'logout');
    return sendJson(res, { success: true });
  }

  if (url.pathname === '/api/v1/save' && req.method === 'POST') {
    if (!user) return sendUnauthorized(res);
    const body = await readJsonBody(req);
    const updatedState = await updateSharedState(body, user);
    await ensureDailyBackups('save', updatedState);
    return sendJson(res, sanitizeStateForClient(updatedState));
  }

  return sendNotFound(res);
}

function sendJson(res, data, statusCode = 200) {
  res.writeHead(statusCode, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify(data));
}

function sendUnauthorized(res, message = 'Unauthorized') {
  sendJson(res, { error: message }, 401);
}

function sendNotFound(res, message = 'Not Found') {
  sendJson(res, { error: message }, 404);
}

async function readJsonBody(req) {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', (chunk) => {
      body += chunk.toString();
      if (body.length > JSON_LIMIT_BYTES) {
        req.connection.destroy();
        reject(new Error('Request body too large'));
      }
    });
    req.on('end', () => {
      try {
        resolve(JSON.parse(body));
      } catch (e) {
        reject(e);
      }
    });
    req.on('error', reject);
  });
}

const server = http.createServer(async (req, res) => {
    const url = new URL(req.url, `http://${req.headers.host}`);

    if (url.pathname.startsWith('/api/')) {
        return handleApiRequest(req, res);
    }

    if (url.pathname.startsWith('/teacher')) {
        const state = getSharedState();
        const html = renderTeacherPortalHtml(state);
        res.writeHead(200, { 'Content-Type': 'text/html' });
        return res.end(html);
    }

    let filePath = path.join(DIST_DIR, url.pathname);
    if (url.pathname.endsWith('/')) {
        filePath = path.join(filePath, 'index.html');
    }

    const extname = path.extname(filePath);
    let contentType = 'text/html';
    switch (extname) {
        case '.js':
            contentType = 'text/javascript';
            break;
        case '.css':
            contentType = 'text/css';
            break;
        case '.json':
            contentType = 'application/json';
            break;
        case '.png':
            contentType = 'image/png';
            break;
        case '.jpg':
            contentType = 'image/jpg';
            break;
    }

    if (existsSync(filePath)) {
        res.writeHead(200, { 'Content-Type': contentType });
        createReadStream(filePath).pipe(res);
    } else {
        sendNotFound(res);
    }
});

async function startServer() {
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
  // Initialize state cache before anything else
  await refreshStateCache();
  await ensureDailyBackups('startup');

  server.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
  });
}

startServer();


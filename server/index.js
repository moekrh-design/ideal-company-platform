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
  const row = await dbQueryOne('SELECT value FROM app_meta WHERE key = $1', ['shared_state']);
  if (!row) return await normalizeStateForStorage(createDefaultSharedState());
  try {
    return await normalizeStateForStorage(JSON.parse(row.value));
  } catch (error) {
    console.error("Error parsing shared state:", error);
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
  const now = nowIso();
  const nextState = await normalizeStateForStorage(state, _stateCache);
  const sanitizedState = sanitizeStateForClient(nextState);
  await dbRun(
    'INSERT INTO app_meta (key, value, updated_at) VALUES ($1, $2, $3) ON CONFLICT (key) DO UPDATE SET value = $2, updated_at = $3',
    ['shared_state', JSON.stringify(sanitizedState), now]
  );
  _stateCache = nextState;
  await ensureDailyBackups('save', nextState);
}

async function audit(actor, action, details = {}) {
  const now = nowIso();
  await dbRun(
    'INSERT INTO audit_log (actor_username, actor_role, action, created_at, details) VALUES ($1, $2, $3, $4, $5)',
    [actor?.username || null, actor?.role || null, action, now, JSON.stringify(details)]
  );
}

async function createSession(userId, username, role, schoolId = null) {
  const now = nowIso();
  const expires = daysFromNow(SESSION_DAYS);
  const token = crypto.randomBytes(32).toString('hex');
  await dbRun(
    'INSERT INTO sessions (token, user_id, username, role, school_id, created_at, expires_at) VALUES ($1, $2, $3, $4, $5, $6, $7)',
    [token, userId, username, role, schoolId, now, expires]
  );
  return token;
}

async function verifyAuth(token) {
  if (!token) return { ok: false };
  const now = nowIso();
  const session = await dbQueryOne('SELECT * FROM sessions WHERE token = $1 AND expires_at > $2', [token, now]);
  if (!session) return { ok: false };
  return { ok: true, user: { id: session.user_id, username: session.username, role: session.role, schoolId: session.school_id } };
}

async function deleteSession(token) {
  await dbRun('DELETE FROM sessions WHERE token = $1', [token]);
}

async function createOtp(userId, purpose, delivery, identifier, code, destinationPreview) {
  const now = nowIso();
  const expires = new Date(Date.now() + 10 * 60 * 1000).toISOString(); // 10 minutes
  const id = crypto.randomBytes(16).toString('hex');
  const codeHash = await bcrypt.hash(String(code), 10); // Hash the OTP code
  await dbRun(
    'INSERT INTO auth_otps (id, user_id, purpose, delivery, identifier, code_hash, destination_preview, created_at, expires_at) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)',
    [id, userId, purpose, delivery, identifier, codeHash, destinationPreview, now, expires]
  );
  return id;
}

async function verifyOtp(id, code) {
  const now = nowIso();
  const otp = await dbQueryOne('SELECT * FROM auth_otps WHERE id = $1 AND expires_at > $2 AND consumed_at IS NULL', [id, now]);
  if (!otp) return { ok: false, message: 'رمز التحقق غير صالح أو انتهت صلاحيته.' };

  const isMatch = await bcrypt.compare(String(code), otp.code_hash);
  if (!isMatch) return { ok: false, message: 'رمز التحقق غير صحيح.' };

  await dbRun('UPDATE auth_otps SET consumed_at = $1 WHERE id = $2', [now, id]);
  return { ok: true, userId: otp.user_id, identifier: otp.identifier };
}

async function createLockout(identifierKey, userId, scope, reason) {
  const now = nowIso();
  const expires = new Date(Date.now() + 15 * 60 * 1000).toISOString(); // 15 minutes
  await dbRun(
    'INSERT INTO auth_lockouts (identifier_key, user_id, scope, reason, failure_count, created_at, updated_at, expires_at) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)',
    [identifierKey, userId, scope, reason, 1, now, now, expires]
  );
}

async function recordFailedAttempt(identifierKey, scope) {
  const now = nowIso();
  const lockout = await dbQueryOne('SELECT * FROM auth_lockouts WHERE identifier_key = $1 AND scope = $2 AND expires_at > $3 AND lifted_at IS NULL', [identifierKey, scope, now]);

  if (lockout) {
    const newFailureCount = lockout.failure_count + 1;
    const newExpires = new Date(Date.now() + (15 * newFailureCount) * 60 * 1000).toISOString(); // Increase lockout time
    await dbRun('UPDATE auth_lockouts SET failure_count = $1, updated_at = $2, expires_at = $3 WHERE id = $4', [newFailureCount, now, newExpires, lockout.id]);
    return newFailureCount;
  } else {
    await createLockout(identifierKey, null, scope, 'failed_attempts');
    return 1;
  }
}

async function checkLockout(identifierKey, scope) {
  const now = nowIso();
  const lockout = await dbQueryOne('SELECT * FROM auth_lockouts WHERE identifier_key = $1 AND scope = $2 AND expires_at > $3 AND lifted_at IS NULL', [identifierKey, scope, now]);
  return lockout !== null;
}

async function liftLockout(identifierKey, scope) {
  const now = nowIso();
  await dbRun('UPDATE auth_lockouts SET lifted_at = $1 WHERE identifier_key = $2 AND scope = $3', [now, identifierKey, scope]);
}

async function sendEmail(to, subject, text, html) {
  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    secure: process.env.EMAIL_SECURE === 'true',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  await transporter.sendMail({
    from: process.env.EMAIL_FROM,
    to,
    subject,
    text,
    html,
  });
}

// Ensure directories exist
mkdirSync(DATA_DIR, { recursive: true });
mkdirSync(UPLOADS_DIR, { recursive: true });
mkdirSync(FACE_UPLOADS_DIR, { recursive: true });
mkdirSync(EVIDENCE_UPLOADS_DIR, { recursive: true });
mkdirSync(BACKUPS_DIR, { recursive: true });
mkdirSync(GLOBAL_BACKUPS_DIR, { recursive: true });
mkdirSync(SCHOOL_BACKUPS_DIR, { recursive: true });

// Initialize database and state cache
await initializeDatabase();
await refreshStateCache();

const server = http.createServer(async (req, res) => {
  const reqUrl = new URL(req.url, `http://${req.headers.host}`);

  const sendJson = (res, status, data) => {
    res.writeHead(status, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(data));
  };

  const readJsonBody = (req) => {
    return new Promise((resolve, reject) => {
      let body = '';
      req.on('data', (chunk) => {
        body += chunk.toString();
        if (body.length > JSON_LIMIT_BYTES) {
          res.writeHead(413, { 'Content-Type': 'text/plain' });
          res.end('Payload too large');
          req.destroy();
          return reject(new Error('Payload too large'));
        }
      });
      req.on('end', () => {
        try {
          resolve(body ? JSON.parse(body) : {});
        } catch (error) {
          reject(error);
        }
      });
      req.on('error', (error) => reject(error));
    });
  };

  // Serve static files
  if (reqUrl.pathname.startsWith('/assets/') || reqUrl.pathname === '/favicon.ico') {
    const filePath = path.join(DIST_DIR, reqUrl.pathname);
    if (existsSync(filePath)) {
      const ext = path.extname(filePath);
      let contentType = 'application/octet-stream';
      if (ext === '.js') contentType = 'text/javascript';
      else if (ext === '.css') contentType = 'text/css';
      else if (ext === '.html') contentType = 'text/html';
      else if (ext === '.png') contentType = 'image/png';
      else if (ext === '.jpg' || ext === '.jpeg') contentType = 'image/jpeg';
      else if (ext === '.gif') contentType = 'image/gif';
      else if (ext === '.svg') contentType = 'image/svg+xml';
      else if (ext === '.json') contentType = 'application/json';
      else if (ext === '.woff') contentType = 'font/woff';
      else if (ext === '.woff2') contentType = 'font/woff2';
      else if (ext === '.ttf') contentType = 'font/ttf';
      else if (ext === '.ico') contentType = 'image/x-icon';

      res.writeHead(200, { 'Content-Type': contentType });
      createReadStream(filePath).pipe(res);
      return;
    }
  }

  // API Endpoints
  if (reqUrl.pathname === '/api/login' && req.method === 'POST') {
    const { username, password } = await readJsonBody(req);
    const user = getSharedState().users.find((u) => u.username === username);

    if (!user) {
      return sendJson(res, 401, { ok: false, message: 'اسم المستخدم أو كلمة المرور غير صحيحة.' });
    }

    const isLockedOut = await checkLockout(username, 'login');
    if (isLockedOut) {
      return sendJson(res, 401, { ok: false, message: 'تم قفل حسابك مؤقتًا بسبب محاولات تسجيل دخول فاشلة متعددة. يرجى المحاولة لاحقًا.' });
    }

    const passwordMatch = await verifyPassword(password, user.password);

    if (!passwordMatch) {
      await recordFailedAttempt(username, 'login');
      return sendJson(res, 401, { ok: false, message: 'اسم المستخدم أو كلمة المرور غير صحيحة.' });
    }

    await liftLockout(username, 'login');
    const token = await createSession(user.id, user.username, user.role, user.schoolId);
    await audit({ username: user.username, role: user.role }, 'login', { userId: user.id });
    return sendJson(res, 200, { ok: true, token, user: sanitizeStateForClient({ users: [user] }).users[0] });
  }

  if (reqUrl.pathname === '/api/logout' && req.method === 'POST') {
    const { token } = await readJsonBody(req);
    await deleteSession(token);
    return sendJson(res, 200, { ok: true });
  }

  if (reqUrl.pathname === '/api/state' && req.method === 'GET') {
    const token = reqUrl.searchParams.get('token');
    const auth = await verifyAuth(token);
    if (!auth.ok) {
      return sendJson(res, 401, { ok: false, message: 'غير مصرح.' });
    }
    const state = getSharedState();
    return sendJson(res, 200, { ok: true, state: sanitizeStateForClient(state) });
  }

  if (reqUrl.pathname === '/api/schools' && req.method === 'GET') {
    const token = reqUrl.searchParams.get('token');
    const auth = await verifyAuth(token);
    if (!auth.ok) {
      return sendJson(res, 401, { ok: false, message: 'غير مصرح.' });
    }
    const state = getSharedState();
    return sendJson(res, 200, { ok: true, schools: state.schools });
  }

  if (reqUrl.pathname === '/api/schools/add' && req.method === 'POST') {
    const body = await readJsonBody(req);
    const { token, name, city, code, principalUsername, principalEmail, principalPassword, principalPhone } = body;
    const auth = await verifyAuth(token);
    if (!auth.ok || auth.user.role !== 'superadmin') {
      return sendJson(res, 401, { ok: false, message: 'غير مصرح لك بإضافة مدارس.' });
    }

    const state = getSharedState();

    // Validate new school data
    if (!name || !city || !code || !principalUsername || !principalEmail || !principalPassword || !principalPhone) {
      return sendJson(res, 400, { ok: false, message: 'يرجى إكمال جميع حقول المدرسة ومديرها.' });
    }

    // Check for duplicate school code
    if (state.schools.some((s) => s.code === code)) {
      return sendJson(res, 400, { ok: false, message: 'الرقم الوزاري مستخدم بالفعل.' });
    }

    // Check for duplicate principal username
    if (state.users.some((u) => u.username === principalUsername)) {
      return sendJson(res, 400, { ok: false, message: 'اسم دخول المدير مستخدم بالفعل.' });
    }

    // Check for duplicate principal email
    if (state.users.some((u) => u.email === principalEmail)) {
      return sendJson(res, 400, { ok: false, message: 'البريد الإلكتروني للمدير مستخدم بالفعل.' });
    }

    const hashedPassword = await hashPassword(principalPassword);

    const newPrincipalId = Math.max(0, ...state.users.map((u) => u.id)) + 1;
    const newSchoolId = Math.max(0, ...state.schools.map((s) => s.id)) + 1;

    const newPrincipal = {
      id: newPrincipalId,
      username: principalUsername,
      email: principalEmail,
      password: hashedPassword,
      role: 'principal',
      schoolId: newSchoolId,
      mobile: principalPhone,
    };

    const newSchool = {
      id: newSchoolId,
      name,
      city,
      code,
      principalProfile: {
        id: newPrincipalId,
        username: principalUsername,
        email: principalEmail,
        mobile: principalPhone,
        password: hashedPassword, // Store hashed password in school profile for consistency
      },
      teachers: [],
      students: [],
      classes: [],
      screens: [],
      settings: defaultSettings(),
    };

    const nextState = structuredClone(state);
    nextState.schools.push(newSchool);
    nextState.users.push(newPrincipal);

    await saveSharedState(nextState, auth.user);
    await audit(auth.user, 'add_school', { schoolId: newSchool.id, name: newSchool.name });
    return sendJson(res, 200, { ok: true, message: 'تم إضافة المدرسة بنجاح.' });
  }

  // Update school API endpoint
  if (reqUrl.pathname === '/api/schools/update' && req.method === 'POST') {
    const { token, schoolId, name, city, code, principalUsername, principalEmail, principalPassword, principalPhone } = await readJsonBody(req);
    const auth = await verifyAuth(token);
    if (!auth.ok || auth.user.role !== 'superadmin') {
      return sendJson(res, 401, { ok: false, message: 'غير مصرح لك بتعديل المدارس.' });
    }

    const state = getSharedState();
    const schoolIndex = state.schools.findIndex((s) => Number(s.id) === Number(schoolId));
    if (schoolIndex === -1) {
      return sendJson(res, 404, { ok: false, message: 'المدرسة غير موجودة.' });
    }

    const existingSchool = state.schools[schoolIndex];
    const existingPrincipalUser = state.users.find((u) => u.id === existingSchool.principalProfile.id);

    const updatedSchool = {
      ...existingSchool,
      name: String(name || '').trim(),
      city: String(city || '').trim(),
      code: String(code || '').trim(),
      principalProfile: {
        ...existingSchool.principalProfile,
        username: String(principalUsername || '').trim().toLowerCase(),
        email: String(principalEmail || '').trim().toLowerCase(),
        mobile: String(principalPhone || '').trim(),
      },
    };

    // Validate updated school data
    if (!updatedSchool.name || !updatedSchool.city || !updatedSchool.code || !updatedSchool.principalProfile.username || !updatedSchool.principalProfile.email || !updatedSchool.principalProfile.mobile) {
      return sendJson(res, 400, { ok: false, message: 'يرجى إكمال جميع حقول المدرسة ومديرها.' });
    }

    // Check for duplicate school code (excluding current school)
    if (state.schools.some((s) => s.code === updatedSchool.code && Number(s.id) !== Number(schoolId))) {
      return sendJson(res, 400, { ok: false, message: 'الرقم الوزاري مستخدم بالفعل لمدرسة أخرى.' });
    }

    // Check for duplicate principal username (excluding current principal)
    if (state.users.some((u) => u.username === updatedSchool.principalProfile.username && Number(u.id) !== Number(existingPrincipalUser?.id))) {
      return sendJson(res, 400, { ok: false, message: 'اسم دخول المدير مستخدم بالفعل لمستخدم آخر.' });
    }

    // Check for duplicate principal email (excluding current principal)
    if (state.users.some((u) => u.email === updatedSchool.principalProfile.email && Number(u.id) !== Number(existingPrincipalUser?.id))) {
      return sendJson(res, 400, { ok: false, message: 'البريد الإلكتروني للمدير مستخدم بالفعل لمستخدم آخر.' });
    }

    // Update principal user password if provided
    if (principalPassword) {
      updatedSchool.principalProfile.password = await hashPassword(String(principalPassword).trim());
    } else if (existingPrincipalUser?.password) {
      updatedSchool.principalProfile.password = existingPrincipalUser.password;
    }

    const nextState = structuredClone(state);
    nextState.schools[schoolIndex] = updatedSchool;

    // Update principal user in nextState.users
    if (existingPrincipalUser) {
      const principalUserIndex = nextState.users.findIndex((u) => u.id === existingPrincipalUser.id);
      if (principalUserIndex !== -1) {
        nextState.users[principalUserIndex] = {
          ...existingPrincipalUser,
          username: updatedSchool.principalProfile.username,
          email: updatedSchool.principalProfile.email,
          password: updatedSchool.principalProfile.password,
          mobile: updatedSchool.principalProfile.mobile,
        };
      }
    }

    await saveSharedState(nextState, auth.user);
    await audit(auth.user, 'update_school', { schoolId: schoolId, name: updatedSchool.name });
    return sendJson(res, 200, { ok: true, message: 'تم تحديث بيانات المدرسة بنجاح.' });
  }

  if (reqUrl.pathname === '/api/schools/delete' && req.method === 'POST') {
    const { token, schoolId } = await readJsonBody(req);
    const auth = await verifyAuth(token);
    if (!auth.ok || auth.user.role !== 'superadmin') {
      return sendJson(res, 401, { ok: false, message: 'غير مصرح لك بحذف المدارس.' });
    }

    const state = getSharedState();
    const schoolIndex = state.schools.findIndex((s) => Number(s.id) === Number(schoolId));
    if (schoolIndex === -1) {
      return sendJson(res, 404, { ok: false, message: 'المدرسة غير موجودة.' });
    }

    const schoolToDelete = state.schools[schoolIndex];
    const principalUserToDelete = state.users.find((u) => u.id === schoolToDelete.principalProfile.id);

    const nextState = structuredClone(state);
    nextState.schools.splice(schoolIndex, 1);
    nextState.users = nextState.users.filter((u) => u.id !== principalUserToDelete.id);

    await saveSharedState(nextState, auth.user);
    await audit(auth.user, 'delete_school', { schoolId: schoolToDelete.id, name: schoolToDelete.name });
    return sendJson(res, 200, { ok: true, message: 'تم حذف المدرسة بنجاح.' });
  }

  if (reqUrl.pathname === '/api/users' && req.method === 'GET') {
    const token = reqUrl.searchParams.get('token');
    const auth = await verifyAuth(token);
    if (!auth.ok || auth.user.role !== 'superadmin') {
      return sendJson(res, 401, { ok: false, message: 'غير مصرح.' });
    }
    const state = getSharedState();
    return sendJson(res, 200, { ok: true, users: state.users });
  }

  if (reqUrl.pathname === '/api/users/add' && req.method === 'POST') {
    const { token, username, email, password, role, schoolId, mobile } = await readJsonBody(req);
    const auth = await verifyAuth(token);
    if (!auth.ok || auth.user.role !== 'superadmin') {
      return sendJson(res, 401, { ok: false, message: 'غير مصرح لك بإضافة مستخدمين.' });
    }

    const state = getSharedState();

    if (!username || !email || !password || !role) {
      return sendJson(res, 400, { ok: false, message: 'يرجى إكمال جميع الحقول المطلوبة.' });
    }

    if (state.users.some((u) => u.username === username)) {
      return sendJson(res, 400, { ok: false, message: 'اسم المستخدم موجود بالفعل.' });
    }

    if (state.users.some((u) => u.email === email)) {
      return sendJson(res, 400, { ok: false, message: 'البريد الإلكتروني موجود بالفعل.' });
    }

    const hashedPassword = await hashPassword(password);
    const newUserId = Math.max(0, ...state.users.map((u) => u.id)) + 1;

    const newPrincipal = {
      id: newUserId,
      username,
      email,
      password: hashedPassword,
      role,
      schoolId: role === 'superadmin' ? null : schoolId,
      mobile: mobile || null,
    };

    const nextState = structuredClone(state);
    nextState.users.push(newPrincipal);

    await saveSharedState(nextState, auth.user);
    await audit(auth.user, 'add_user', { userId: newPrincipal.id, username: newPrincipal.username });
    return sendJson(res, 200, { ok: true, message: 'تم إضافة المستخدم بنجاح.' });
  }

  if (reqUrl.pathname === '/api/users/update' && req.method === 'POST') {
    const { token, userId, username, email, password, role, schoolId, mobile } = await readJsonBody(req);
    const auth = await verifyAuth(token);
    if (!auth.ok || auth.user.role !== 'superadmin') {
      return sendJson(res, 401, { ok: false, message: 'غير مصرح لك بتعديل المستخدمين.' });
    }

    const state = getSharedState();
    const userIndex = state.users.findIndex((u) => Number(u.id) === Number(userId));
    if (userIndex === -1) {
      return sendJson(res, 404, { ok: false, message: 'المستخدم غير موجود.' });
    }

    const existingUser = state.users[userIndex];

    const updatedUser = {
      ...existingUser,
      username: String(username || '').trim(),
      email: String(email || '').trim(),
      role: String(role || '').trim(),
      schoolId: String(role || '').trim() === 'superadmin' ? null : schoolId,
      mobile: String(mobile || '').trim(),
    };

    if (!updatedUser.username || !updatedUser.email || !updatedUser.role) {
      return sendJson(res, 400, { ok: false, message: 'يرجى إكمال جميع الحقول المطلوبة.' });
    }

    if (state.users.some((u) => u.username === updatedUser.username && Number(u.id) !== Number(userId))) {
      return sendJson(res, 400, { ok: false, message: 'اسم المستخدم موجود بالفعل لمستخدم آخر.' });
    }

    if (state.users.some((u) => u.email === updatedUser.email && Number(u.id) !== Number(userId))) {
      return sendJson(res, 400, { ok: false, message: 'البريد الإلكتروني موجود بالفعل لمستخدم آخر.' });
    }

    if (password) {
      updatedUser.password = await hashPassword(password);
    }

    const nextState = structuredClone(state);
    nextState.users[userIndex] = updatedUser;

    // If the user is a principal, update the profile in the school as well
    if (updatedUser.role === 'principal' && updatedUser.schoolId) {
      const schoolIndex = nextState.schools.findIndex((s) => s.id === updatedUser.schoolId);
      if (schoolIndex !== -1) {
        nextState.schools[schoolIndex].principalProfile = {
          ...nextState.schools[schoolIndex].principalProfile,
          username: updatedUser.username,
          email: updatedUser.email,
          mobile: updatedUser.mobile,
        };
      }
    }

    await saveSharedState(nextState, auth.user);
    await audit(auth.user, 'update_user', { userId: updatedUser.id, username: updatedUser.username });
    return sendJson(res, 200, { ok: true, message: 'تم تحديث المستخدم بنجاح.' });
  }

  if (reqUrl.pathname === '/api/users/delete' && req.method === 'POST') {
    const { token, userId } = await readJsonBody(req);
    const auth = await verifyAuth(token);
    if (!auth.ok || auth.user.role !== 'superadmin') {
      return sendJson(res, 401, { ok: false, message: 'غير مصرح لك بحذف المستخدمين.' });
    }

    const state = getSharedState();
    const userIndex = state.users.findIndex((u) => Number(u.id) === Number(userId));
    if (userIndex === -1) {
      return sendJson(res, 404, { ok: false, message: 'المستخدم غير موجود.' });
    }

    const nextState = structuredClone(state);
    nextState.users.splice(userIndex, 1);

    await saveSharedState(nextState, auth.user);
    await audit(auth.user, 'delete_user', { userId: userId });
    return sendJson(res, 200, { ok: true, message: 'تم حذف المستخدم بنجاح.' });
  }

  if (reqUrl.pathname === '/api/profile/change-password' && req.method === 'POST') {
    const { token, currentPassword, newPassword } = await readJsonBody(req);
    const auth = await verifyAuth(token);
    if (!auth.ok) {
      return sendJson(res, 401, { ok: false, message: 'غير مصرح.' });
    }

    const state = getSharedState();
    const user = state.users.find((u) => u.id === auth.user.id);

    if (!user) {
      return sendJson(res, 404, { ok: false, message: 'المستخدم غير موجود.' });
    }

    const passwordMatch = await verifyPassword(currentPassword, user.password);
    if (!passwordMatch) {
      return sendJson(res, 400, { ok: false, message: 'كلمة المرور الحالية غير صحيحة.' });
    }

    if (!newPassword || String(newPassword).trim().length < 6) {
      return sendJson(res, 400, { ok: false, message: 'يجب أن تتكون كلمة المرور الجديدة من 6 أحرف على الأقل.' });
    }

    const hashedPassword = await hashPassword(newPassword);

    const nextState = structuredClone(state);
    const userIndex = nextState.users.findIndex((u) => u.id === user.id);
    if (userIndex !== -1) {
      nextState.users[userIndex].password = hashedPassword;
    }

    // If the user is a principal, update the password in the school profile as well
    if (user.role === 'principal' && user.schoolId) {
      const schoolIndex = nextState.schools.findIndex((s) => s.id === user.schoolId);
      if (schoolIndex !== -1) {
        nextState.schools[schoolIndex].principalProfile.password = hashedPassword;
      }
    }

    await saveSharedState(nextState, auth.user);
    await audit(auth.user, 'change_password', { userId: user.id });
    return sendJson(res, 200, { ok: true, message: 'تم تغيير كلمة المرور بنجاح.' });
  }

  if (reqUrl.pathname === '/api/profile' && req.method === 'GET') {
    const token = reqUrl.searchParams.get('token');
    const auth = await verifyAuth(token);
    if (!auth.ok) {
      return sendJson(res, 401, { ok: false, message: 'غير مصرح.' });
    }
    const state = getSharedState();
    const user = state.users.find((u) => u.id === auth.user.id);
    if (!user) {
      return sendJson(res, 404, { ok: false, message: 'المستخدم غير موجود.' });
    }
    return sendJson(res, 200, { ok: true, user: sanitizeStateForClient({ users: [user] }).users[0] });
  }

  if (reqUrl.pathname === '/api/profile/update' && req.method === 'POST') {
    const { token, username, email, mobile } = await readJsonBody(req);
    const auth = await verifyAuth(token);
    if (!auth.ok) {
      return sendJson(res, 401, { ok: false, message: 'غير مصرح.' });
    }

    const state = getSharedState();
    const userIndex = state.users.findIndex((u) => u.id === auth.user.id);
    if (userIndex === -1) {
      return sendJson(res, 404, { ok: false, message: 'المستخدم غير موجود.' });
    }

    const existingUser = state.users[userIndex];

    const updatedUser = {
      ...existingUser,
      username: String(username || '').trim(),
      email: String(email || '').trim(),
      mobile: String(mobile || '').trim(),
    };

    if (!updatedUser.username || !updatedUser.email) {
      return sendJson(res, 400, { ok: false, message: 'يرجى إكمال جميع الحقول المطلوبة.' });
    }

    if (state.users.some((u) => u.username === updatedUser.username && u.id !== auth.user.id)) {
      return sendJson(res, 400, { ok: false, message: 'اسم المستخدم موجود بالفعل لمستخدم آخر.' });
    }

    if (state.users.some((u) => u.email === updatedUser.email && u.id !== auth.user.id)) {
      return sendJson(res, 400, { ok: false, message: 'البريد الإلكتروني موجود بالفعل لمستخدم آخر.' });
    }

    const nextState = structuredClone(state);
    nextState.users[userIndex] = updatedUser;

    // If the user is a principal, update the profile in the school as well
    if (updatedUser.role === 'principal' && updatedUser.schoolId) {
      const schoolIndex = nextState.schools.findIndex((s) => s.id === updatedUser.schoolId);
      if (schoolIndex !== -1) {
        nextState.schools[schoolIndex].principalProfile = {
          ...nextState.schools[schoolIndex].principalProfile,
          username: updatedUser.username,
          email: updatedUser.email,
          mobile: updatedUser.mobile,
        };
      }
    }

    await saveSharedState(nextState, auth.user);
    await audit(auth.user, 'update_profile', { userId: updatedUser.id, username: updatedUser.username });
    return sendJson(res, 200, { ok: true, message: 'تم تحديث الملف الشخصي بنجاح.' });
  }

  if (reqUrl.pathname === '/api/teacher-portal' && req.method === 'GET') {
    const token = reqUrl.searchParams.get('token');
    const auth = await verifyAuth(token);
    if (!auth.ok || auth.user.role !== 'teacher') {
      return sendJson(res, 401, { ok: false, message: 'غير مصرح.' });
    }
    const state = getSharedState();
    const teacher = state.users.find((u) => u.id === auth.user.id);
    if (!teacher || !teacher.schoolId) {
      return sendJson(res, 404, { ok: false, message: 'المعلم غير موجود أو لا ينتمي إلى مدرسة.' });
    }
    const school = state.schools.find((s) => s.id === teacher.schoolId);
    if (!school) {
      return sendJson(res, 404, { ok: false, message: 'المدرسة غير موجودة.' });
    }

    const teacherPortalHtml = renderTeacherPortalHtml(school, teacher);
    res.writeHead(200, { 'Content-Type': 'text/html' });
    res.end(teacherPortalHtml);
    return;
  }

  if (reqUrl.pathname === '/api/teacher-portal/notifications' && req.method === 'GET') {
    const token = reqUrl.searchParams.get('token');
    const auth = await verifyAuth(token);
    if (!auth.ok || auth.user.role !== 'teacher') {
      return sendJson(res, 401, { ok: false, message: 'غير مصرح.' });
    }
    const state = getSharedState();
    const teacher = state.users.find((u) => u.id === auth.user.id);
    if (!teacher || !teacher.schoolId) {
      return sendJson(res, 404, { ok: false, message: 'المعلم غير موجود أو لا ينتمي إلى مدرسة.' });
    }

    const schoolNotifications = (state.notifications || []).filter(n => Number(n.schoolId) === Number(teacher.schoolId));
    return sendJson(res, 200, { ok: true, notifications: schoolNotifications });
  }

  if (reqUrl.pathname === '/api/teacher-portal/notifications/mark-read' && req.method === 'POST') {
    const { token, notificationId } = await readJsonBody(req);
    const auth = await verifyAuth(token);
    if (!auth.ok || auth.user.role !== 'teacher') {
      return sendJson(res, 401, { ok: false, message: 'غير مصرح.' });
    }

    const state = getSharedState();
    const notificationIndex = state.notifications.findIndex((n) => Number(n.id) === Number(notificationId));
    if (notificationIndex === -1) {
      return sendJson(res, 404, { ok: false, message: 'الإشعار غير موجود.' });
    }

    const nextState = structuredClone(state);
    nextState.notifications[notificationIndex].read = true;

    await saveSharedState(nextState, auth.user);
    await audit(auth.user, 'mark_notification_read', { notificationId: notificationId });
    return sendJson(res, 200, { ok: true, message: 'تم وضع علامة ' });
  }
}
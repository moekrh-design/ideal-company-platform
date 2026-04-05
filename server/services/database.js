/**
 * ==========================================
 *  Database Service - خدمة قاعدة البيانات
 * ==========================================
 *  إدارة اتصال SQLite وعمليات CRUD الأساسية
 */
import Database from 'better-sqlite3';
import { DB_PATH, TABLE_SCHEMAS } from '../config/constants.js';
import { nowIso } from '../utils/helpers.js';

// === تهيئة قاعدة البيانات ===
let db = null;

export function initDb() {
  db = new Database(DB_PATH);
  initializeDatabase();
  return db;
}

export function getDb() {
  if (!db) throw new Error('Database not initialized. Call initDb() first.');
  return db;
}

// === Database Schema Management ===

function tableExists(name) {
  const row = getDb().prepare("SELECT name FROM sqlite_master WHERE type = 'table' AND name = ?").get(name);
  return Boolean(row?.name);
}

function getTableColumns(name) {
  return getDb().prepare(`PRAGMA table_info(${name})`).all().map((item) => item.name);
}

function ensureTableSchema(name, schema) {
  if (!tableExists(name)) {
    getDb().exec(schema.sql);
    return;
  }
  const currentColumns = getTableColumns(name);
  const missingColumns = schema.required.filter((column) => !currentColumns.includes(column));
  if (!missingColumns.length) return;

  const backupName = `${name}_legacy_${Date.now()}`;
  getDb().exec(`ALTER TABLE ${name} RENAME TO ${backupName};`);
  getDb().exec(schema.sql);
}

function initializeDatabase() {
  Object.entries(TABLE_SCHEMAS).forEach(([name, schema]) => ensureTableSchema(name, schema));
}

// === Session Management ===

export function createSessionRecord(token, user, expiresAt) {
  getDb().prepare(
    'INSERT INTO sessions (token, user_id, username, role, school_id, created_at, expires_at) VALUES (?, ?, ?, ?, ?, ?, ?)'
  ).run(token, user.id, user.username, user.role, user.schoolId ?? null, nowIso(), expiresAt);
}

export function getSessionByToken(token) {
  if (!token) return null;
  return getDb().prepare('SELECT * FROM sessions WHERE token = ? AND expires_at > ?').get(token, nowIso()) || null;
}

export function deleteSession(token) {
  getDb().prepare('DELETE FROM sessions WHERE token = ?').run(token);
}

export function cleanupExpiredSessions() {
  getDb().prepare('DELETE FROM sessions WHERE expires_at <= ?').run(nowIso());
}

// === Audit Log ===

export function audit(actor, action, details = {}) {
  getDb().prepare(
    'INSERT INTO audit_log (actor_username, actor_role, action, created_at, details) VALUES (?, ?, ?, ?, ?)'
  ).run(actor?.username || '', actor?.role || '', action, nowIso(), JSON.stringify(details));
}

export function auditAuthEvent(action, details = {}, actor = null) {
  audit(actor, action, details);
}

export function readAuthLogs(limit = 200) {
  const rows = getDb().prepare(`
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
      try { return row.details ? JSON.parse(row.details) : {}; }
      catch { return {}; }
    })(),
  }));
}

// === App Meta (Key-Value Store) ===

export function appMetaGetJson(key) {
  const row = getDb().prepare('SELECT value FROM app_meta WHERE key = ?').get(key);
  if (!row?.value) return null;
  try { return JSON.parse(row.value); } catch { return null; }
}

export function appMetaSetJson(key, value) {
  getDb().prepare(
    'INSERT INTO app_meta (key, value, updated_at) VALUES (?, ?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value, updated_at = excluded.updated_at'
  ).run(key, JSON.stringify(value), nowIso());
}

export function appMetaDelete(key) {
  getDb().prepare('DELETE FROM app_meta WHERE key = ?').run(key);
}

// === State Management ===

export function readStateRow() {
  return getDb().prepare('SELECT value FROM app_meta WHERE key = ?').get('shared_state');
}

export function writeStateRow(state, actor = null) {
  getDb().prepare(
    'INSERT INTO app_meta (key, value, updated_at) VALUES (?, ?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value, updated_at = excluded.updated_at'
  ).run('shared_state', JSON.stringify(state), nowIso());
  if (actor) audit(actor, 'save_state', { schools: state.schools.length, users: state.users.length });
}

// === Auth OTP Management ===

export function cleanupExpiredAuthOtps() {
  getDb().prepare('DELETE FROM auth_otps WHERE expires_at <= ? OR consumed_at IS NOT NULL').run(nowIso());
}

export function deleteOtpsByUser(userId, purpose = 'login') {
  getDb().prepare('DELETE FROM auth_otps WHERE user_id = ? AND purpose = ?').run(Number(userId), purpose);
}

export function insertOtp(params) {
  getDb().prepare(
    'INSERT INTO auth_otps (id, user_id, purpose, delivery, identifier, code_hash, destination_preview, created_at, expires_at, consumed_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, NULL)'
  ).run(params.id, params.userId, params.purpose, params.delivery, params.identifier, params.codeHash, '', params.createdAt, params.expiresAt);
}

export function getLatestOtp(userId, purpose, identifier) {
  return getDb().prepare(
    'SELECT * FROM auth_otps WHERE user_id = ? AND purpose = ? AND identifier = ? ORDER BY created_at DESC LIMIT 1'
  ).get(Number(userId), purpose, String(identifier || '').trim().toLowerCase());
}

export function consumeOtp(id) {
  getDb().prepare('UPDATE auth_otps SET consumed_at = ? WHERE id = ?').run(nowIso(), id);
}

export function updateOtpDestination(id, preview) {
  getDb().prepare('UPDATE auth_otps SET destination_preview = ? WHERE id = ?').run(preview, id);
}

// === Auth Lockouts ===

export function cleanupExpiredAuthLockouts() {
  getDb().prepare('DELETE FROM auth_lockouts WHERE expires_at <= ? OR lifted_at IS NOT NULL').run(nowIso());
}

export function getActiveLockoutRows(identifier, userId, scope) {
  const key = String(identifier || '').trim().toLowerCase();
  return getDb().prepare(`
    SELECT *
    FROM auth_lockouts
    WHERE lifted_at IS NULL
      AND expires_at > ?
      AND (? = 'any' OR scope = ?)
      AND ((? <> '' AND identifier_key = ?) OR (? IS NOT NULL AND user_id = ?))
    ORDER BY updated_at DESC
    LIMIT 20
  `).all(
    nowIso(),
    String(scope || 'any'), String(scope || 'any'),
    key, key,
    userId == null ? null : Number(userId),
    userId == null ? null : Number(userId)
  );
}

export function insertLockout(params) {
  getDb().prepare(
    'INSERT INTO auth_lockouts (identifier_key, user_id, scope, reason, failure_count, created_at, updated_at, expires_at, lifted_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, NULL)'
  ).run(params.identifierKey, params.userId, params.scope, params.reason, params.failureCount, params.createdAt, params.createdAt, params.expiresAt);
}

export function liftLockouts(identifier, userId) {
  const key = String(identifier || '').trim().toLowerCase();
  getDb().prepare(`
    UPDATE auth_lockouts
    SET lifted_at = ?, updated_at = ?
    WHERE lifted_at IS NULL
      AND ((? <> '' AND identifier_key = ?) OR (? IS NOT NULL AND user_id = ?))
  `).run(
    nowIso(), nowIso(),
    key, key,
    userId == null ? null : Number(userId),
    userId == null ? null : Number(userId)
  );
}

export function getRecentAuthFailureRows(actions, since) {
  return getDb().prepare(`
    SELECT action, created_at, details
    FROM audit_log
    WHERE created_at >= ?
      AND action IN (${actions.map(() => '?').join(',')})
    ORDER BY id DESC
    LIMIT 500
  `).all(since, ...actions);
}

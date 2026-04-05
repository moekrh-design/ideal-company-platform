/**
 * ==========================================
 *  ثوابت المنصة - Server Configuration
 * ==========================================
 */
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// === Directory Paths ===
export const ROOT_DIR = path.resolve(__dirname, '../..');
export const DIST_DIR = path.join(ROOT_DIR, 'dist');
export const DATA_DIR = path.join(ROOT_DIR, 'data');
export const DB_PATH = path.join(DATA_DIR, 'platform.db');
export const UPLOADS_DIR = path.join(DATA_DIR, 'uploads');
export const FACE_UPLOADS_DIR = path.join(UPLOADS_DIR, 'faces');
export const EVIDENCE_UPLOADS_DIR = path.join(UPLOADS_DIR, 'program-evidence');
export const BACKUPS_DIR = path.join(DATA_DIR, 'backups');
export const GLOBAL_BACKUPS_DIR = path.join(BACKUPS_DIR, 'global');
export const SCHOOL_BACKUPS_DIR = path.join(BACKUPS_DIR, 'schools');
export const SERVER_PUBLIC_DIR = path.join(ROOT_DIR, 'server', 'public');

// === Server Settings ===
export const PORT = Number(process.env.PORT || 4000);
export const BACKUP_RETENTION_DAYS = Number(process.env.BACKUP_RETENTION_DAYS || 30);
export const SESSION_DAYS = Number(process.env.SESSION_DAYS || 7);
export const PARENT_SESSION_DAYS = Number(process.env.PARENT_SESSION_DAYS || 30);
export const JSON_LIMIT_BYTES = 50 * 1024 * 1024;

// === Screen/Gate Configuration Keys ===
export const SCREEN_TRANSITION_KEYS = [
  "fade","cut","slide-left","slide-right","slide-up","slide-down",
  "zoom-in","zoom-out","flip-x","flip-y","rotate-soft","rotate-in",
  "blur","bounce","scale-up","scale-down","swing","curtain","diagonal",
  "pop","float","random"
];

export const SCREEN_THEME_KEYS = ["emerald-night","blue-contrast","violet-stage","sunrise","graphite"];
export const SCREEN_TEMPLATE_KEYS = ["executive","reception","leaderboard","news"];
export const TICKER_BG_KEYS = ["amber","navy","emerald","rose","slate"];

// === Database Table Schemas ===
export const TABLE_SCHEMAS = {
  app_meta: {
    required: ['key', 'value', 'updated_at'],
    sql: `CREATE TABLE IF NOT EXISTS app_meta (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );`,
  },
  sessions: {
    required: ['token', 'user_id', 'username', 'role', 'school_id', 'created_at', 'expires_at'],
    sql: `CREATE TABLE IF NOT EXISTS sessions (
      token TEXT PRIMARY KEY,
      user_id INTEGER NOT NULL,
      username TEXT NOT NULL,
      role TEXT NOT NULL,
      school_id INTEGER,
      created_at TEXT NOT NULL,
      expires_at TEXT NOT NULL
    );`,
  },
  audit_log: {
    required: ['id', 'actor_username', 'actor_role', 'action', 'created_at', 'details'],
    sql: `CREATE TABLE IF NOT EXISTS audit_log (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      actor_username TEXT,
      actor_role TEXT,
      action TEXT NOT NULL,
      created_at TEXT NOT NULL,
      details TEXT
    );`,
  },
  auth_otps: {
    required: ['id', 'user_id', 'purpose', 'delivery', 'identifier', 'code_hash', 'destination_preview', 'created_at', 'expires_at', 'consumed_at'],
    sql: `CREATE TABLE IF NOT EXISTS auth_otps (
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
    );`,
  },
  auth_lockouts: {
    required: ['id', 'identifier_key', 'user_id', 'scope', 'reason', 'failure_count', 'created_at', 'updated_at', 'expires_at', 'lifted_at'],
    sql: `CREATE TABLE IF NOT EXISTS auth_lockouts (
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
    );`,
  },
};

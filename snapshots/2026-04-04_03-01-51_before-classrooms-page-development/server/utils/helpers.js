/**
 * ==========================================
 *  دوال مساعدة عامة - Utility Helpers
 * ==========================================
 */
import crypto from 'node:crypto';
import path from 'node:path';
import { existsSync, createReadStream } from 'node:fs';

// === Date/Time Helpers ===
export function nowIso() {
  return new Date().toISOString();
}

export function todayStamp() {
  return new Date().toISOString().slice(0, 10);
}

export function daysFromNow(days) {
  return new Date(Date.now() + days * 24 * 60 * 60 * 1000).toISOString();
}

// === String Helpers ===
export function safeBackupSlug(value = 'school') {
  return String(value || 'school').trim().toLowerCase()
    .replace(/[^a-z0-9؀-ۿ]+/g, '-')
    .replace(/^-+|-+$/g, '') || 'school';
}

export function normalizeStringArray(values = []) {
  return Array.from(new Set(
    (Array.isArray(values) ? values : [])
      .map((value) => String(value).trim())
      .filter(Boolean)
  ));
}

export function normalizePhoneNumber(phone = '') {
  const digits = String(phone || '').replace(/\D/g, '');
  if (!digits) return '';
  if (digits.startsWith('966') && digits.length >= 12) return digits;
  if (digits.startsWith('05') && digits.length === 10) return `966${digits.slice(1)}`;
  if (digits.startsWith('5') && digits.length === 9) return `966${digits}`;
  return digits;
}

// === MIME Type Helper ===
export function mimeTypeFor(filePath) {
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

// === HTTP Helpers ===
export function sendJson(res, status, data) {
  const body = JSON.stringify(data);
  res.writeHead(status, {
    'Content-Type': 'application/json; charset=utf-8',
    'Content-Length': Buffer.byteLength(body),
    // 'Access-Control-Allow-Origin': handled by security middleware,
  });
  res.end(body);
}

export function sendText(res, status, text) {
  res.writeHead(status, {
    'Content-Type': 'text/plain; charset=utf-8',
    // 'Access-Control-Allow-Origin': handled by security middleware,
  });
  res.end(text);
}

export function sendHtml(res, status, html) {
  res.writeHead(status, {
    'Content-Type': 'text/html; charset=utf-8',
    // 'Access-Control-Allow-Origin': handled by security middleware,
  });
  res.end(html);
}

export async function readJsonBody(req, maxBytes = 50 * 1024 * 1024) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    let size = 0;
    req.on('data', (chunk) => {
      size += chunk.length;
      if (size > maxBytes) {
        req.destroy();
        reject(new Error('Request body too large'));
        return;
      }
      chunks.push(chunk);
    });
    req.on('end', () => {
      try {
        const raw = Buffer.concat(chunks).toString('utf8');
        resolve(raw ? JSON.parse(raw) : {});
      } catch (err) {
        reject(new Error('Invalid JSON body'));
      }
    });
    req.on('error', reject);
  });
}

// === Auth Token Parser ===
export function parseAuthToken(req) {
  const header = req.headers['x-session-token'] || req.headers['authorization'] || '';
  if (header.startsWith('Bearer ')) return header.slice(7).trim();
  return header.trim();
}

// === Password Hashing (scrypt + bcrypt support) ===
export function isHashedPassword(value = '') {
  const v = String(value || '');
  return v.startsWith('scrypt$') || v.startsWith('$2a$') || v.startsWith('$2b$') || v.startsWith('$2y$');
}

export async function hashPassword(password) {
  const plain = String(password || '');
  if (!plain) return '';
  if (isHashedPassword(plain)) return plain;
  const salt = crypto.randomBytes(16).toString('hex');
  const derived = crypto.scryptSync(plain, salt, 64).toString('hex');
  return `scrypt$${salt}$${derived}`;
}

export async function verifyPassword(plainPassword, storedPassword) {
  const plain = String(plainPassword || '');
  const stored = String(storedPassword || '');
  if (!stored) return false;
  if (!isHashedPassword(stored)) return plain === stored;
  // bcrypt hash
  if (stored.startsWith('$2a$') || stored.startsWith('$2b$') || stored.startsWith('$2y$')) {
    try {
      const { default: bcrypt } = await import('bcrypt');
      return await bcrypt.compare(plain, stored);
    } catch { return false; }
  }
  // scrypt hash
  const [, salt, derived] = stored.split('$');
  if (!salt || !derived) return false;
  const calculated = crypto.scryptSync(plain, salt, 64).toString('hex');
  try {
    return crypto.timingSafeEqual(Buffer.from(calculated, 'hex'), Buffer.from(derived, 'hex'));
  } catch {
    return false;
  }
}

// === OTP Code Generator ===
export function generateOtpCode(length = 6) {
  const size = Math.max(4, Math.min(8, Number(length) || 6));
  const max = 10 ** size;
  return String(crypto.randomInt(0, max)).padStart(size, '0');
}

// === Masking Helpers ===
export function maskEmail(email = '') {
  const value = String(email || '').trim();
  const [name, domain] = value.split('@');
  if (!name || !domain) return 'بريد غير صالح';
  if (name.length <= 2) return `${name[0] || '*'}***@${domain}`;
  return `${name.slice(0, 2)}***@${domain}`;
}

export function maskPhone(phone = '') {
  const digits = normalizePhoneNumber(phone);
  if (!digits) return 'رقم غير صالح';
  return `${digits.slice(0, 3)}***${digits.slice(-2)}`;
}

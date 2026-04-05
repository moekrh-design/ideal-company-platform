const Database = require('better-sqlite3');
const db = new Database('/var/www/systems/ideal-platform/data/platform.db');
const row = db.prepare("SELECT value FROM app_meta WHERE key = ?").get("shared_state");
const state = JSON.parse(row.value);
const user = state.users.find(u => String(u.username) === '1047362478');
if (user) {
  console.log('المستخدم:', JSON.stringify({
    id: user.id,
    username: user.username,
    role: user.role,
    status: user.status,
    active: user.active,
    schoolId: user.schoolId,
    hasPassword: !!user.password,
    passwordLength: (user.password || '').length,
    passwordStart: (user.password || '').substring(0, 10)
  }, null, 2));
} else {
  console.log('لم يُوجد المستخدم');
}

// نتحقق من auth_lockouts
const lockouts = db.prepare("SELECT * FROM auth_lockouts WHERE identifier = ? OR identifier LIKE ?").all('1047362478', '%1047362478%');
console.log('lockouts:', lockouts.length, lockouts);

db.close();

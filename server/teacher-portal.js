// teacher-portal.js
// بوابة المعلم - نسخة محسّنة مع إصلاح مشكلة تنفيذ الإجراءات وتحسين التصميم

export function renderTeacherPortalHtml() {
  return `<!doctype html>
<html lang="ar" dir="rtl">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
  <title>بوابة المعلم</title>
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link href="https://fonts.googleapis.com/css2?family=Tajawal:wght@300;400;500;700;800;900&display=swap" rel="stylesheet" />
  <link rel="manifest" href="/public/teacher-manifest.json" />
  <meta name="theme-color" content="#4f46e5" />
  <meta name="mobile-web-app-capable" content="yes" />
  <meta name="apple-mobile-web-app-capable" content="yes" />
  <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
  <meta name="apple-mobile-web-app-title" content="بوابة المعلم" />
  <link rel="apple-touch-icon" href="/public/pwa-icon-192.png" />
  <link rel="icon" type="image/png" href="/public/pwa-icon-192.png" />
  <style>
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    :root {
      --font: 'Tajawal', system-ui, sans-serif;
      --primary: #4f46e5;
      --primary-dark: #3730a3;
      --primary-light: #eef2ff;
      --primary-mid: #c7d2fe;
      --success: #059669;
      --success-light: #d1fae5;
      --danger: #dc2626;
      --danger-light: #fee2e2;
      --amber: #d97706;
      --amber-light: #fef3c7;
      --violet: #7c3aed;
      --violet-light: #ede9fe;
      --sky: #0284c7;
      --sky-light: #e0f2fe;
      --text: #111827;
      --text-muted: #6b7280;
      --text-light: #9ca3af;
      --bg: #f3f4f6;
      --card: #ffffff;
      --border: #e5e7eb;
      --border-focus: #4f46e5;
      --nav-h: 70px;
      --header-h: 64px;
      --radius: 20px;
      --radius-md: 14px;
      --radius-sm: 10px;
      --shadow: 0 1px 3px rgba(0,0,0,.08), 0 4px 16px rgba(0,0,0,.06);
      --shadow-lg: 0 8px 32px rgba(0,0,0,.12);
    }
    html, body {
      height: 100%;
      font-family: var(--font);
      background: var(--bg);
      color: var(--text);
      -webkit-font-smoothing: antialiased;
      -webkit-tap-highlight-color: transparent;
    }
    #app { display: flex; flex-direction: column; height: 100dvh; overflow: hidden; }

    /* ===== LOGIN ===== */
    #loginScreen {
      position: fixed; inset: 0; z-index: 9999;
      background: linear-gradient(160deg, #312e81 0%, #4f46e5 40%, #7c3aed 100%);
      display: flex; flex-direction: column; align-items: center; justify-content: center;
      padding: 24px 20px; overflow-y: auto;
    }
    .login-logo {
      width: 88px; height: 88px; border-radius: 26px;
      background: rgba(255,255,255,.15); backdrop-filter: blur(10px);
      border: 2px solid rgba(255,255,255,.25);
      display: flex; align-items: center; justify-content: center;
      font-size: 42px; margin-bottom: 20px;
      box-shadow: 0 8px 32px rgba(0,0,0,.2);
    }
    .login-heading { font-size: 28px; font-weight: 900; color: #fff; margin-bottom: 6px; text-align: center; }
    .login-sub-heading { font-size: 14px; color: rgba(255,255,255,.7); margin-bottom: 32px; text-align: center; }
    .login-card {
      width: 100%; max-width: 420px; background: #fff;
      border-radius: 28px; padding: 36px 28px;
      box-shadow: 0 24px 64px rgba(0,0,0,.25);
    }
    .login-field { margin-bottom: 18px; }
    .login-field label {
      display: block; font-size: 13px; font-weight: 700;
      color: var(--text-muted); margin-bottom: 8px; letter-spacing: .3px;
    }
    .login-field input {
      width: 100%; padding: 14px 16px; border: 2px solid var(--border);
      border-radius: var(--radius-md); font-family: var(--font); font-size: 15px;
      background: #fafafa; color: var(--text); outline: none; transition: all .2s;
      direction: ltr; text-align: right;
    }
    .login-field input:focus { border-color: var(--primary); background: #fff; box-shadow: 0 0 0 4px rgba(79,70,229,.1); }
    .login-btn {
      width: 100%; padding: 15px; background: linear-gradient(135deg, var(--primary), var(--violet));
      color: #fff; border: none; border-radius: var(--radius-md); font-family: var(--font);
      font-size: 16px; font-weight: 800; cursor: pointer; transition: all .2s;
      margin-top: 4px; box-shadow: 0 4px 16px rgba(79,70,229,.4);
    }
    .login-btn:hover { transform: translateY(-1px); box-shadow: 0 6px 20px rgba(79,70,229,.5); }
    .login-btn:active { transform: translateY(0); }
    .login-btn:disabled { opacity: .6; cursor: not-allowed; transform: none; }
    .login-err {
      background: var(--danger-light); border: 1.5px solid #fca5a5;
      border-radius: var(--radius-sm); padding: 11px 14px;
      font-size: 13px; color: var(--danger); margin-top: 14px; display: none;
      font-weight: 600;
    }
    .login-err.show { display: block; }

    /* ===== HEADER ===== */
    #header {
      height: var(--header-h);
      background: linear-gradient(135deg, var(--primary-dark), var(--primary));
      display: flex; align-items: center; justify-content: space-between;
      padding: 0 16px; flex-shrink: 0; position: relative; z-index: 10;
      box-shadow: 0 2px 12px rgba(79,70,229,.3);
    }
    .header-left { display: flex; align-items: center; gap: 12px; }
    .header-avatar {
      width: 40px; height: 40px; border-radius: 12px;
      background: rgba(255,255,255,.2); border: 2px solid rgba(255,255,255,.3);
      display: flex; align-items: center; justify-content: center;
      font-size: 18px; flex-shrink: 0;
    }
    .header-name { font-size: 16px; font-weight: 800; color: #fff; line-height: 1.2; }
    .header-school { font-size: 12px; color: rgba(255,255,255,.7); }
    .header-right { display: flex; align-items: center; gap: 8px; }
    .header-icon-btn {
      width: 38px; height: 38px; border-radius: 50%;
      background: rgba(255,255,255,.15); border: none; cursor: pointer;
      display: flex; align-items: center; justify-content: center;
      font-size: 18px; color: #fff; transition: background .2s; position: relative;
    }
    .header-icon-btn:hover { background: rgba(255,255,255,.25); }
    .notif-badge {
      position: absolute; top: -3px; right: -3px; min-width: 18px; height: 18px;
      background: #ef4444; border-radius: 9px; font-size: 10px; font-weight: 800;
      color: #fff; display: flex; align-items: center; justify-content: center;
      padding: 0 4px; border: 2px solid var(--primary);
    }
    .notif-badge.hidden { display: none; }
    .logout-btn {
      padding: 7px 14px; background: rgba(255,255,255,.15);
      border: 1.5px solid rgba(255,255,255,.3);
      border-radius: 20px; color: #fff; font-family: var(--font);
      font-size: 13px; font-weight: 700; cursor: pointer; transition: all .2s;
    }
    .logout-btn:hover { background: rgba(255,255,255,.25); }

    /* ===== MAIN CONTENT ===== */
    #mainContent {
      flex: 1; overflow-y: auto; padding: 16px;
      padding-bottom: calc(var(--nav-h) + 16px);
      scroll-behavior: smooth;
    }

    /* ===== BOTTOM NAV ===== */
    #bottomNav {
      height: var(--nav-h); background: #fff;
      border-top: 1px solid var(--border);
      display: flex; align-items: stretch; flex-shrink: 0;
      box-shadow: 0 -4px 24px rgba(0,0,0,.08);
      padding-bottom: env(safe-area-inset-bottom, 0);
    }
    .nav-item {
      flex: 1; display: flex; flex-direction: column; align-items: center;
      justify-content: center; gap: 4px; cursor: pointer; border: none;
      background: none; font-family: var(--font); color: var(--text-light);
      transition: color .2s; padding: 8px 4px; position: relative;
    }
    .nav-item.active { color: var(--primary); }
    .nav-item.active .nav-icon-wrap {
      background: var(--primary-light);
      border-radius: 12px;
    }
    .nav-icon-wrap {
      width: 44px; height: 28px; display: flex; align-items: center;
      justify-content: center; border-radius: 12px; transition: background .2s;
    }
    .nav-icon { font-size: 20px; line-height: 1; }
    .nav-label { font-size: 10px; font-weight: 700; letter-spacing: .2px; }
    .nav-badge {
      position: absolute; top: 4px; right: calc(50% - 20px);
      min-width: 16px; height: 16px; background: #ef4444;
      border-radius: 8px; font-size: 9px; font-weight: 800; color: #fff;
      display: flex; align-items: center; justify-content: center; padding: 0 3px;
    }
    .nav-badge.hidden { display: none; }

    /* ===== PAGE TITLE ===== */
    .page-header {
      display: flex; align-items: center; gap: 12px; margin-bottom: 18px;
    }
    .page-header-icon {
      width: 44px; height: 44px; border-radius: 14px;
      display: flex; align-items: center; justify-content: center;
      font-size: 22px; flex-shrink: 0;
    }
    .page-header-title { font-size: 20px; font-weight: 900; color: var(--text); }
    .page-header-sub { font-size: 13px; color: var(--text-muted); margin-top: 2px; }

    /* ===== CARDS ===== */
    .card {
      background: var(--card); border-radius: var(--radius);
      box-shadow: var(--shadow); padding: 20px; margin-bottom: 14px;
      border: 1px solid var(--border);
    }
    .card-title {
      font-size: 15px; font-weight: 800; color: var(--text);
      margin-bottom: 14px; display: flex; align-items: center; gap: 8px;
    }

    /* ===== DASHBOARD ===== */
    .welcome-banner {
      background: linear-gradient(135deg, var(--primary-dark) 0%, var(--primary) 50%, var(--violet) 100%);
      border-radius: var(--radius); padding: 22px 20px; margin-bottom: 16px;
      color: #fff; position: relative; overflow: hidden;
    }
    .welcome-banner::before {
      content: ''; position: absolute; top: -30px; left: -30px;
      width: 120px; height: 120px; border-radius: 50%;
      background: rgba(255,255,255,.07);
    }
    .welcome-banner::after {
      content: ''; position: absolute; bottom: -20px; right: -20px;
      width: 100px; height: 100px; border-radius: 50%;
      background: rgba(255,255,255,.05);
    }
    .welcome-greeting { font-size: 13px; opacity: .8; margin-bottom: 4px; }
    .welcome-name { font-size: 22px; font-weight: 900; line-height: 1.2; }
    .welcome-school { font-size: 13px; opacity: .75; margin-top: 4px; }
    .welcome-stats {
      display: flex; gap: 16px; margin-top: 18px; padding-top: 16px;
      border-top: 1px solid rgba(255,255,255,.2);
    }
    .welcome-stat { flex: 1; text-align: center; }
    .welcome-stat-val { font-size: 24px; font-weight: 900; }
    .welcome-stat-lbl { font-size: 11px; opacity: .75; margin-top: 2px; }

    .quick-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 12px; margin-bottom: 16px; }
    .quick-card {
      background: var(--card); border-radius: var(--radius-md); padding: 18px 14px;
      border: 1px solid var(--border); cursor: pointer; text-align: center;
      transition: all .2s; box-shadow: var(--shadow); position: relative; overflow: hidden;
    }
    .quick-card:hover { transform: translateY(-2px); box-shadow: var(--shadow-lg); border-color: var(--primary); }
    .quick-card:active { transform: translateY(0); }
    .quick-card-icon { font-size: 30px; margin-bottom: 10px; }
    .quick-card-label { font-size: 14px; font-weight: 800; color: var(--text); }
    .quick-card-sub { font-size: 12px; color: var(--text-muted); margin-top: 4px; }
    .quick-card-badge {
      position: absolute; top: 10px; left: 10px;
      min-width: 22px; height: 22px; background: #ef4444;
      border-radius: 11px; font-size: 11px; font-weight: 800; color: #fff;
      display: flex; align-items: center; justify-content: center; padding: 0 5px;
    }

    /* ===== STATS ROW ===== */
    .stats-row { display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; margin-bottom: 16px; }
    .stat-box {
      background: var(--card); border-radius: var(--radius-md); padding: 16px 10px;
      text-align: center; border: 1px solid var(--border); box-shadow: var(--shadow);
    }
    .stat-val { font-size: 26px; font-weight: 900; }
    .stat-lbl { font-size: 11px; color: var(--text-muted); margin-top: 3px; font-weight: 600; }

    /* ===== SEARCH ===== */
    .search-wrap { position: relative; margin-bottom: 12px; }
    .search-icon {
      position: absolute; top: 50%; transform: translateY(-50%);
      right: 14px; font-size: 16px; color: var(--text-muted); pointer-events: none;
    }
    .search-input {
      width: 100%; padding: 13px 44px 13px 16px; border: 2px solid var(--border);
      border-radius: var(--radius-md); font-family: var(--font); font-size: 14px;
      background: var(--card); color: var(--text); outline: none; transition: all .2s;
    }
    .search-input:focus { border-color: var(--primary); box-shadow: 0 0 0 4px rgba(79,70,229,.1); }

    /* ===== STUDENT LIST ===== */
    .student-list { display: flex; flex-direction: column; gap: 8px; max-height: 300px; overflow-y: auto; }
    .student-item {
      display: flex; align-items: center; gap: 12px;
      padding: 13px 14px; background: #fafafa; border-radius: var(--radius-md);
      border: 2px solid var(--border); cursor: pointer; transition: all .15s;
    }
    .student-item:hover { border-color: var(--primary); background: var(--primary-light); }
    .student-item.selected { border-color: var(--primary); background: var(--primary-light); }
    .student-avatar {
      width: 40px; height: 40px; border-radius: 12px;
      background: linear-gradient(135deg, var(--primary), var(--violet));
      display: flex; align-items: center; justify-content: center;
      font-size: 16px; font-weight: 800; color: #fff; flex-shrink: 0;
    }
    .student-info { flex: 1; min-width: 0; }
    .student-name { font-size: 14px; font-weight: 700; color: var(--text); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
    .student-class { font-size: 12px; color: var(--text-muted); margin-top: 2px; }
    .student-pts {
      font-size: 15px; font-weight: 900; color: var(--primary);
      background: var(--primary-light); padding: 4px 10px; border-radius: 20px;
      flex-shrink: 0;
    }

    /* ===== SELECTED STUDENT BANNER ===== */
    .selected-banner {
      background: linear-gradient(135deg, var(--primary), var(--violet));
      border-radius: var(--radius-md); padding: 14px 16px; margin-bottom: 16px;
      display: flex; align-items: center; justify-content: space-between; gap: 10px;
      color: #fff;
    }
    .selected-banner-name { font-size: 16px; font-weight: 800; }
    .selected-banner-info { font-size: 12px; opacity: .85; margin-top: 2px; }
    .change-btn {
      padding: 7px 14px; background: rgba(255,255,255,.2);
      border: 1.5px solid rgba(255,255,255,.35);
      border-radius: 20px; font-family: var(--font); font-size: 12px;
      font-weight: 700; color: #fff; cursor: pointer; transition: all .2s; white-space: nowrap;
    }
    .change-btn:hover { background: rgba(255,255,255,.3); }

    /* ===== ACTION TYPE TABS ===== */
    .type-tabs { display: flex; gap: 8px; margin-bottom: 16px; }
    .type-tab {
      flex: 1; padding: 11px 8px; border-radius: var(--radius-md);
      border: 2px solid var(--border); background: #fafafa; cursor: pointer;
      font-family: var(--font); font-size: 13px; font-weight: 700; color: var(--text-muted);
      text-align: center; transition: all .15s;
    }
    .type-tab.active-reward { border-color: var(--success); background: var(--success-light); color: var(--success); }
    .type-tab.active-violation { border-color: var(--danger); background: var(--danger-light); color: var(--danger); }
    .type-tab.active-program { border-color: var(--violet); background: var(--violet-light); color: var(--violet); }

    /* ===== ACTION ITEMS ===== */
    .action-items { display: flex; flex-direction: column; gap: 8px; max-height: 220px; overflow-y: auto; }
    .action-item {
      display: flex; align-items: center; justify-content: space-between;
      padding: 13px 14px; background: #fafafa; border-radius: var(--radius-md);
      border: 2px solid var(--border); cursor: pointer; transition: all .15s;
    }
    .action-item:hover { border-color: var(--primary); background: var(--primary-light); }
    .action-item.selected-reward { border-color: var(--success); background: var(--success-light); }
    .action-item.selected-violation { border-color: var(--danger); background: var(--danger-light); }
    .action-item.selected-program { border-color: var(--violet); background: var(--violet-light); }
    .action-item-left { display: flex; align-items: center; gap: 10px; flex: 1; min-width: 0; }
    .action-item-icon {
      width: 36px; height: 36px; border-radius: 10px;
      display: flex; align-items: center; justify-content: center;
      font-size: 18px; flex-shrink: 0;
    }
    .action-item-icon.reward { background: var(--success-light); }
    .action-item-icon.violation { background: var(--danger-light); }
    .action-item-icon.program { background: var(--violet-light); }
    .action-item-title { font-size: 14px; font-weight: 700; color: var(--text); }
    .action-item-desc { font-size: 12px; color: var(--text-muted); margin-top: 2px; }
    .action-pts {
      font-size: 15px; font-weight: 900; padding: 4px 10px;
      border-radius: 20px; flex-shrink: 0;
    }
    .pts-reward { color: var(--success); background: var(--success-light); }
    .pts-violation { color: var(--danger); background: var(--danger-light); }
    .pts-program { color: var(--violet); background: var(--violet-light); }

    /* ===== NOTE INPUT ===== */
    .note-input {
      width: 100%; padding: 13px 16px; border: 2px solid var(--border);
      border-radius: var(--radius-md); font-family: var(--font); font-size: 14px;
      background: #fafafa; color: var(--text); outline: none; resize: none;
      transition: all .2s; margin-top: 14px;
    }
    .note-input:focus { border-color: var(--primary); background: #fff; box-shadow: 0 0 0 4px rgba(79,70,229,.1); }

    /* ===== SUBMIT BUTTON ===== */
    .submit-btn {
      width: 100%; padding: 15px; border: none; border-radius: var(--radius-md);
      font-family: var(--font); font-size: 16px; font-weight: 800;
      cursor: pointer; transition: all .2s; margin-top: 14px;
      box-shadow: 0 4px 14px rgba(0,0,0,.15);
    }
    .submit-btn:hover { transform: translateY(-1px); box-shadow: 0 6px 20px rgba(0,0,0,.2); }
    .submit-btn:active { transform: translateY(0); }
    .submit-btn:disabled { opacity: .5; cursor: not-allowed; transform: none; box-shadow: none; }
    .submit-btn.reward { background: linear-gradient(135deg, #059669, #10b981); color: #fff; }
    .submit-btn.violation { background: linear-gradient(135deg, #dc2626, #ef4444); color: #fff; }
    .submit-btn.program { background: linear-gradient(135deg, #7c3aed, #8b5cf6); color: #fff; }
    .submit-btn.blue { background: linear-gradient(135deg, var(--primary-dark), var(--primary)); color: #fff; }

    /* ===== MSG BOX ===== */
    .msg-box {
      padding: 13px 16px; border-radius: var(--radius-md);
      font-size: 14px; font-weight: 700; margin-top: 12px; display: none;
      animation: slideIn .3s ease;
    }
    .msg-box.show { display: block; }
    .msg-box.success { background: var(--success-light); color: var(--success); border: 1.5px solid #6ee7b7; }
    .msg-box.error { background: var(--danger-light); color: var(--danger); border: 1.5px solid #fca5a5; }
    @keyframes slideIn { from { opacity: 0; transform: translateY(-8px); } to { opacity: 1; transform: translateY(0); } }

    /* ===== LEAVE PASS ===== */
    .leave-item {
      background: var(--card); border-radius: var(--radius-md); padding: 16px;
      border: 1px solid var(--border); margin-bottom: 10px; box-shadow: var(--shadow);
      transition: all .2s;
    }
    .leave-item:hover { box-shadow: var(--shadow-lg); }
    .leave-item-header { display: flex; justify-content: space-between; align-items: flex-start; gap: 10px; }
    .leave-student { font-size: 15px; font-weight: 800; color: var(--text); }
    .leave-class { font-size: 12px; color: var(--text-muted); margin-top: 2px; }
    .leave-status {
      padding: 5px 12px; border-radius: 20px; font-size: 12px; font-weight: 700;
      white-space: nowrap; flex-shrink: 0;
    }
    .status-new { background: var(--amber-light); color: var(--amber); }
    .status-viewed { background: var(--primary-light); color: var(--primary); }
    .status-completed { background: var(--success-light); color: var(--success); }
    .leave-reason { font-size: 13px; color: #374151; margin-top: 10px; line-height: 1.5; }
    .leave-time { font-size: 12px; color: var(--text-light); margin-top: 6px; }
    .leave-actions { display: flex; gap: 8px; margin-top: 12px; flex-wrap: wrap; }
    .leave-btn {
      padding: 8px 16px; border-radius: 20px; border: none; cursor: pointer;
      font-family: var(--font); font-size: 13px; font-weight: 700; transition: all .2s;
    }
    .leave-btn:hover { opacity: .85; transform: translateY(-1px); }
    .leave-btn.view { background: var(--primary-light); color: var(--primary); }
    .leave-btn.complete { background: var(--success-light); color: var(--success); }

    /* ===== LESSON ATTENDANCE ===== */
    .session-select, .class-select {
      width: 100%; padding: 13px 16px; border: 2px solid var(--border);
      border-radius: var(--radius-md); font-family: var(--font); font-size: 14px;
      background: var(--card); color: var(--text); outline: none; margin-bottom: 14px;
      transition: all .2s;
    }
    .session-select:focus, .class-select:focus { border-color: var(--primary); box-shadow: 0 0 0 4px rgba(79,70,229,.1); }
    .attendance-list { display: flex; flex-direction: column; gap: 8px; max-height: 340px; overflow-y: auto; }
    .attendance-item {
      display: flex; align-items: center; gap: 12px;
      padding: 13px 14px; background: #fafafa; border-radius: var(--radius-md);
      border: 2px solid var(--border); cursor: pointer; transition: all .15s;
    }
    .attendance-item.absent { background: var(--danger-light); border-color: #fca5a5; }
    .attendance-check {
      width: 24px; height: 24px; border-radius: 8px; border: 2px solid var(--border);
      display: flex; align-items: center; justify-content: center; flex-shrink: 0;
      font-size: 14px; transition: all .15s; background: #fff;
    }
    .attendance-item.absent .attendance-check { background: var(--danger); border-color: var(--danger); color: #fff; }
    .attendance-student-name { font-size: 14px; font-weight: 700; color: var(--text); flex: 1; }
    .attendance-student-num { font-size: 12px; color: var(--text-light); }
    .ack-row {
      display: flex; align-items: center; gap: 12px; margin-top: 14px;
      padding: 13px 14px; background: #fafafa; border-radius: var(--radius-md);
      border: 2px solid var(--border); cursor: pointer; transition: all .15s;
    }
    .ack-row.checked { background: var(--primary-light); border-color: var(--primary); }
    .ack-check {
      width: 24px; height: 24px; border-radius: 8px; border: 2px solid var(--border);
      display: flex; align-items: center; justify-content: center; flex-shrink: 0;
      font-size: 14px; transition: all .15s; background: #fff;
    }
    .ack-row.checked .ack-check { background: var(--primary); border-color: var(--primary); color: #fff; }
    .ack-label { font-size: 13px; font-weight: 700; color: var(--text); }
    .submitted-badge {
      background: var(--success-light); color: var(--success);
      border: 1.5px solid #6ee7b7; padding: 12px 16px;
      border-radius: var(--radius-md); font-size: 14px; font-weight: 700;
      margin-bottom: 12px; display: flex; align-items: center; gap: 8px;
    }

    /* ===== NOTIFICATIONS ===== */
    .notif-item {
      background: var(--card); border-radius: var(--radius-md); padding: 16px;
      border: 1px solid var(--border); margin-bottom: 10px; box-shadow: var(--shadow);
      transition: all .2s;
    }
    .notif-item.unread { border-color: var(--primary-mid); background: var(--primary-light); }
    .notif-item-header { display: flex; align-items: flex-start; gap: 12px; }
    .notif-icon {
      width: 40px; height: 40px; border-radius: 12px;
      display: flex; align-items: center; justify-content: center;
      font-size: 20px; flex-shrink: 0; background: var(--primary-light);
    }
    .notif-title { font-size: 14px; font-weight: 800; color: var(--text); }
    .notif-body { font-size: 13px; color: #374151; margin-top: 4px; line-height: 1.6; }
    .notif-time { font-size: 11px; color: var(--text-light); margin-top: 6px; }

    /* ===== EMPTY STATE ===== */
    .empty-state {
      text-align: center; padding: 48px 20px; color: var(--text-light);
    }
    .empty-icon { font-size: 52px; margin-bottom: 14px; opacity: .7; }
    .empty-text { font-size: 16px; font-weight: 700; color: var(--text-muted); }
    .empty-sub { font-size: 13px; margin-top: 6px; line-height: 1.5; }

    /* ===== LOADING ===== */
    .loading-wrap { display: flex; flex-direction: column; align-items: center; padding: 40px 20px; gap: 14px; }
    .loading-spinner {
      width: 40px; height: 40px; border: 3px solid var(--border);
      border-top-color: var(--primary); border-radius: 50%;
      animation: spin .7s linear infinite;
    }
    .loading-text { font-size: 14px; color: var(--text-muted); font-weight: 600; }
    @keyframes spin { to { transform: rotate(360deg); } }

    /* ===== STEP INDICATOR ===== */
    .step-label {
      font-size: 12px; font-weight: 700; color: var(--text-muted);
      text-transform: uppercase; letter-spacing: .5px; margin-bottom: 10px;
      display: flex; align-items: center; gap: 6px;
    }
    .step-num {
      width: 22px; height: 22px; border-radius: 50%;
      background: var(--primary); color: #fff;
      display: flex; align-items: center; justify-content: center;
      font-size: 11px; font-weight: 800;
    }

    /* ===== SUBJECT TABS ===== */
    .subject-tabs { display: flex; gap: 6px; overflow-x: auto; padding-bottom: 4px; margin-bottom: 12px; }
    .subject-tab {
      padding: 7px 14px; border-radius: 20px; border: 1.5px solid var(--border);
      background: #fafafa; font-family: var(--font); font-size: 13px; font-weight: 700;
      color: var(--text-muted); cursor: pointer; white-space: nowrap; transition: all .15s; flex-shrink: 0;
    }
    .subject-tab.active { background: var(--primary); border-color: var(--primary); color: #fff; }

    /* ===== RECENT ACTION ITEM ===== */
    .recent-action {
      display: flex; align-items: center; gap: 12px; padding: 12px 0;
      border-bottom: 1px solid var(--border);
    }
    .recent-action:last-child { border-bottom: none; }
    .recent-action-icon {
      width: 38px; height: 38px; border-radius: 12px;
      display: flex; align-items: center; justify-content: center;
      font-size: 18px; flex-shrink: 0;
    }
    .recent-action-info { flex: 1; min-width: 0; }
    .recent-action-title { font-size: 14px; font-weight: 700; color: var(--text); }
    .recent-action-sub { font-size: 12px; color: var(--text-muted); margin-top: 2px; }
    .recent-action-pts { font-size: 15px; font-weight: 900; flex-shrink: 0; }

    /* ===== SCROLLBAR ===== */
    ::-webkit-scrollbar { width: 4px; height: 4px; }
    ::-webkit-scrollbar-track { background: transparent; }
    ::-webkit-scrollbar-thumb { background: #d1d5db; border-radius: 2px; }

    /* ===== SECTION DIVIDER ===== */
    .section-divider {
      font-size: 12px; font-weight: 700; color: var(--text-muted);
      margin: 16px 0 10px; padding-bottom: 8px;
      border-bottom: 2px solid var(--border);
      display: flex; align-items: center; gap: 8px;
    }
  </style>
</head>
<body>
<div id="app">

  <!-- ===== LOGIN SCREEN ===== -->
  <div id="loginScreen">
    <div class="login-logo">🎓</div>
    <div class="login-heading">بوابة المعلم</div>
    <div class="login-sub-heading">منصة إدارة الطلاب والإجراءات</div>
    <div class="login-card">
      <div class="login-field">
        <label>اسم المستخدم</label>
        <input type="text" id="loginUsername" placeholder="أدخل اسم المستخدم" autocomplete="username" />
      </div>
      <div class="login-field">
        <label>كلمة المرور</label>
        <input type="password" id="loginPassword" placeholder="أدخل كلمة المرور" autocomplete="current-password" />
      </div>
      <button class="login-btn" id="loginBtn" onclick="doLogin()">🔐 تسجيل الدخول</button>
      <div class="login-err" id="loginErr"></div>
    </div>
  </div>

  <!-- ===== HEADER ===== -->
  <div id="header" style="display:none">
    <div class="header-left">
      <div class="header-avatar">👤</div>
      <div>
        <div class="header-name" id="headerName">المعلم</div>
        <div class="header-school" id="headerSchool">المدرسة</div>
      </div>
    </div>
    <div class="header-right">
      <button class="header-icon-btn" onclick="showPage('notifications')" title="التنبيهات">
        🔔
        <span class="notif-badge hidden" id="notifBadge">0</span>
      </button>
      <button class="logout-btn" onclick="doLogout()">خروج</button>
    </div>
  </div>

  <!-- ===== MAIN CONTENT ===== -->
  <div id="mainContent" style="display:none">

    <!-- DASHBOARD PAGE -->
    <div id="page-dashboard" class="page">
      <div class="welcome-banner">
        <div class="welcome-greeting">مرحباً بك 👋</div>
        <div class="welcome-name" id="dashName">المعلم</div>
        <div class="welcome-school" id="dashSchool">المدرسة</div>
        <div class="welcome-stats">
          <div class="welcome-stat">
            <div class="welcome-stat-val" id="dashRewards">0</div>
            <div class="welcome-stat-lbl">مكافآت</div>
          </div>
          <div class="welcome-stat">
            <div class="welcome-stat-val" id="dashViolations">0</div>
            <div class="welcome-stat-lbl">خصومات</div>
          </div>
          <div class="welcome-stat">
            <div class="welcome-stat-val" id="dashPrograms">0</div>
            <div class="welcome-stat-lbl">برامج</div>
          </div>
        </div>
      </div>

      <div class="quick-grid">
        <div class="quick-card" onclick="showPage('actions')">
          <div class="quick-card-icon">⚡</div>
          <div class="quick-card-label">إجراءات الطلاب</div>
          <div class="quick-card-sub">مكافأة • خصم • برنامج</div>
        </div>
        <div class="quick-card" onclick="showPage('leavePasses')">
          <div class="quick-card-icon">📋</div>
          <div class="quick-card-label">الاستئذانات</div>
          <div class="quick-card-sub" id="dashLeaveCount">لا يوجد طلبات</div>
          <div class="quick-card-badge hidden" id="dashLeaveBadge">0</div>
        </div>
        <div class="quick-card" onclick="showPage('lessonAttendance')">
          <div class="quick-card-icon">📚</div>
          <div class="quick-card-label">تحضير الحصص</div>
          <div class="quick-card-sub" id="dashSessionCount">لا توجد جلسات</div>
        </div>
        <div class="quick-card" onclick="showPage('notifications')">
          <div class="quick-card-icon">🔔</div>
          <div class="quick-card-label">التنبيهات</div>
          <div class="quick-card-sub" id="dashNotifCount">لا يوجد تنبيهات</div>
        </div>
      </div>

      <div class="card">
        <div class="card-title">📝 آخر الإجراءات</div>
        <div id="dashRecentActions">
          <div class="empty-state" style="padding:24px 0">
            <div class="empty-icon" style="font-size:36px">📝</div>
            <div class="empty-text">لا توجد إجراءات حديثة</div>
          </div>
        </div>
      </div>
    </div>

    <!-- STUDENT ACTIONS PAGE -->
    <div id="page-actions" class="page" style="display:none">
      <div class="page-header">
        <div class="page-header-icon" style="background:var(--primary-light)">⚡</div>
        <div>
          <div class="page-header-title">إجراءات الطلاب</div>
          <div class="page-header-sub">مكافأة • خصم • برنامج</div>
        </div>
      </div>

      <!-- Step 1: Select Student -->
      <div id="actionsStep1">
        <div class="step-label"><span class="step-num">١</span> اختر الطالب</div>
        <div class="search-wrap">
          <span class="search-icon">🔍</span>
          <input class="search-input" id="studentSearch" placeholder="ابحث باسم الطالب أو رقمه..." oninput="filterStudents()" />
        </div>
        <div class="student-list" id="studentList">
          <div class="loading-wrap"><div class="loading-spinner"></div><div class="loading-text">جارٍ التحميل...</div></div>
        </div>
      </div>

      <!-- Selected Student Banner -->
      <div class="selected-banner" id="selectedStudentBanner" style="display:none">
        <div>
          <div class="selected-banner-name" id="selectedStudentName">—</div>
          <div class="selected-banner-info" id="selectedStudentInfo">—</div>
        </div>
        <button class="change-btn" onclick="clearSelectedStudent()">تغيير الطالب</button>
      </div>

      <!-- Step 2: Action -->
      <div id="actionsStep2" style="display:none">
        <div class="step-label"><span class="step-num">٢</span> نوع الإجراء</div>
        <div class="type-tabs">
          <button class="type-tab active-reward" id="tabReward" onclick="setActionType('reward')">🏆 مكافأة</button>
          <button class="type-tab" id="tabViolation" onclick="setActionType('violation')">⚠️ خصم</button>
          <button class="type-tab" id="tabProgram" onclick="setActionType('program')">🎯 برنامج</button>
        </div>

        <div id="subjectTabsContainer" style="display:none">
          <div class="step-label">المادة الدراسية</div>
          <div class="subject-tabs" id="subjectTabs"></div>
        </div>

        <div class="step-label"><span class="step-num">٣</span> اختر البند</div>
        <div class="action-items" id="actionItemsList">
          <div class="loading-wrap"><div class="loading-spinner"></div></div>
        </div>

        <textarea class="note-input" id="actionNote" rows="2" placeholder="ملاحظة اختيارية..."></textarea>
        <button class="submit-btn reward" id="submitActionBtn" onclick="submitAction()" disabled>✅ تطبيق الإجراء</button>
        <div class="msg-box" id="actionMsg"></div>
      </div>
    </div>

    <!-- LEAVE PASSES PAGE -->
    <div id="page-leavePasses" class="page" style="display:none">
      <div class="page-header">
        <div class="page-header-icon" style="background:var(--amber-light)">📋</div>
        <div>
          <div class="page-header-title">الاستئذانات</div>
          <div class="page-header-sub">طلبات الاستئذان الموجهة إليك</div>
        </div>
      </div>
      <div id="leavePassesList">
        <div class="loading-wrap"><div class="loading-spinner"></div><div class="loading-text">جارٍ التحميل...</div></div>
      </div>
    </div>

    <!-- LESSON ATTENDANCE PAGE -->
    <div id="page-lessonAttendance" class="page" style="display:none">
      <div class="page-header">
        <div class="page-header-icon" style="background:var(--sky-light)">📚</div>
        <div>
          <div class="page-header-title">تحضير الحصص</div>
          <div class="page-header-sub">تسجيل حضور وغياب الطلاب</div>
        </div>
      </div>
      <div id="lessonAttendanceContent">
        <div class="loading-wrap"><div class="loading-spinner"></div><div class="loading-text">جارٍ التحميل...</div></div>
      </div>
    </div>

    <!-- NOTIFICATIONS PAGE -->
    <div id="page-notifications" class="page" style="display:none">
      <div class="page-header">
        <div class="page-header-icon" style="background:var(--violet-light)">🔔</div>
        <div>
          <div class="page-header-title">التنبيهات</div>
          <div class="page-header-sub">الإشعارات الموجهة إليك</div>
        </div>
      </div>
      <div id="notificationsList">
        <div class="loading-wrap"><div class="loading-spinner"></div><div class="loading-text">جارٍ التحميل...</div></div>
      </div>
    </div>

  </div>

  <!-- ===== BOTTOM NAV ===== -->
  <div id="bottomNav" style="display:none">
    <button class="nav-item active" id="nav-dashboard" onclick="showPage('dashboard')">
      <div class="nav-icon-wrap"><span class="nav-icon">🏠</span></div>
      <span class="nav-label">الرئيسية</span>
    </button>
    <button class="nav-item" id="nav-actions" onclick="showPage('actions')">
      <div class="nav-icon-wrap"><span class="nav-icon">⚡</span></div>
      <span class="nav-label">الإجراءات</span>
    </button>
    <button class="nav-item" id="nav-leavePasses" onclick="showPage('leavePasses')">
      <div class="nav-icon-wrap"><span class="nav-icon">📋</span></div>
      <span class="nav-label">الاستئذانات</span>
      <span class="nav-badge hidden" id="navLeaveBadge">0</span>
    </button>
    <button class="nav-item" id="nav-lessonAttendance" onclick="showPage('lessonAttendance')">
      <div class="nav-icon-wrap"><span class="nav-icon">📚</span></div>
      <span class="nav-label">التحضير</span>
      <span class="nav-badge hidden" id="navLessonBadge">0</span>
    </button>
    <button class="nav-item" id="nav-notifications" onclick="showPage('notifications')">
      <div class="nav-icon-wrap"><span class="nav-icon">🔔</span></div>
      <span class="nav-label">التنبيهات</span>
      <span class="nav-badge hidden" id="navNotifBadge">0</span>
    </button>
  </div>

</div>

<script>
// ===== STATE =====
const TOKEN_KEY = 'teacher-portal-token-v2';
const NOTIF_READ_KEY = 'teacher-portal-notif-read-v2';
let currentUser = null;
let sharedState = null;
let selectedSchool = null;
let activePage = 'dashboard';
let allStudents = [];
let filteredStudents = [];
let selectedStudent = null;
let actionType = 'reward';
let selectedActionItem = null;
let selectedSubject = null;
let pollingInterval = null;

// ===== HELPERS =====
function $(id) { return document.getElementById(id); }
function getToken() { try { return localStorage.getItem(TOKEN_KEY) || ''; } catch(e) { return ''; } }
function setToken(t) { try { localStorage.setItem(TOKEN_KEY, t); } catch(e) {} }
function clearToken() { try { localStorage.removeItem(TOKEN_KEY); } catch(e) {} }

async function api(path, options = {}) {
  const token = getToken();
  const headers = { 'Content-Type': 'application/json' };
  if (token) headers['X-Session-Token'] = token;
  if (options.headers) Object.assign(headers, options.headers);
  const res = await fetch(path, {
    method: options.method || 'GET',
    headers,
    body: options.body ? JSON.stringify(options.body) : undefined,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.message || 'Request failed');
  return data;
}

function showLoginError(msg) {
  const el = $('loginErr');
  el.textContent = msg;
  el.classList.add('show');
}
function hideLoginError() {
  const el = $('loginErr');
  el.classList.remove('show');
}

function showMsg(id, text, type = 'success') {
  const el = $(id);
  if (!el) return;
  el.textContent = text;
  el.className = 'msg-box show ' + type;
  setTimeout(() => { if (el) el.classList.remove('show'); }, 4000);
}

// ===== LOGIN =====
async function doLogin() {
  const username = $('loginUsername').value.trim();
  const password = $('loginPassword').value;
  if (!username || !password) { showLoginError('أدخل اسم المستخدم وكلمة المرور.'); return; }
  hideLoginError();
  const btn = $('loginBtn');
  btn.disabled = true;
  btn.textContent = '⏳ جارٍ الدخول...';
  try {
    const data = await api('/api/auth/login', { method: 'POST', body: { username, password } });
    setToken(data.token);
    await loadBootstrap();
  } catch(e) {
    showLoginError(e.message || 'بيانات الدخول غير صحيحة.');
  } finally {
    btn.disabled = false;
    btn.textContent = '🔐 تسجيل الدخول';
  }
}

$('loginPassword').addEventListener('keydown', (e) => { if (e.key === 'Enter') doLogin(); });
$('loginUsername').addEventListener('keydown', (e) => { if (e.key === 'Enter') $('loginPassword').focus(); });

// ===== LOGOUT =====
async function doLogout() {
  try { await api('/api/auth/logout', { method: 'POST' }); } catch(e) {}
  clearToken();
  currentUser = null; sharedState = null; selectedSchool = null;
  if (pollingInterval) clearInterval(pollingInterval);
  $('loginScreen').style.display = 'flex';
  $('header').style.display = 'none';
  $('mainContent').style.display = 'none';
  $('bottomNav').style.display = 'none';
  $('loginUsername').value = '';
  $('loginPassword').value = '';
}

// ===== BOOTSTRAP =====
async function loadBootstrap() {
  try {
    const data = await api('/api/bootstrap');
    if (!data.ok || !data.sessionUser) throw new Error('جلسة غير صالحة.');
    currentUser = data.sessionUser;
    sharedState = data.state;
    const allowedRoles = ['teacher', 'supervisor', 'principal', 'superadmin'];
    if (!allowedRoles.includes(currentUser.role)) {
      clearToken();
      showLoginError('هذه البوابة مخصصة للمعلمين فقط.');
      return;
    }
    selectedSchool = (sharedState.schools || []).find((s) => s.id === currentUser.schoolId) || sharedState.schools?.[0] || null;
    $('loginScreen').style.display = 'none';
    $('header').style.display = 'flex';
    $('mainContent').style.display = 'block';
    $('bottomNav').style.display = 'flex';
    $('headerName').textContent = currentUser.name || currentUser.username || 'المعلم';
    $('headerSchool').textContent = selectedSchool?.name || 'المدرسة';
    buildStudentList();
    renderDashboard();
    showPage('actions');
    startPolling();
  } catch(e) {
    clearToken();
    showLoginError(e.message || 'فشل تحميل البيانات.');
  }
}

// ===== POLLING =====
function startPolling() {
  if (pollingInterval) clearInterval(pollingInterval);
  pollingInterval = setInterval(async () => {
    try {
      const data = await api('/api/bootstrap');
      if (data.ok && data.state) {
        sharedState = data.state;
        selectedSchool = (sharedState.schools || []).find((s) => s.id === currentUser.schoolId) || sharedState.schools?.[0] || null;
        buildStudentList();
        updateBadges();
        if (activePage === 'leavePasses') renderLeavePasses();
        if (activePage === 'lessonAttendance') renderLessonAttendance();
        if (activePage === 'notifications') renderNotifications();
        if (activePage === 'dashboard') renderDashboard();
      }
    } catch(e) {}
  }, 20000);
}

// ===== PAGE NAVIGATION =====
function showPage(page) {
  activePage = page;
  document.querySelectorAll('.page').forEach((p) => p.style.display = 'none');
  const pageEl = $('page-' + page);
  if (pageEl) pageEl.style.display = 'block';
  document.querySelectorAll('.nav-item').forEach((n) => n.classList.remove('active'));
  const navEl = $('nav-' + page);
  if (navEl) navEl.classList.add('active');
  if (page === 'leavePasses') renderLeavePasses();
  if (page === 'lessonAttendance') renderLessonAttendance();
  if (page === 'notifications') { renderNotifications(); markNotifsRead(); }
  if (page === 'dashboard') renderDashboard();
  if (page === 'actions') renderActionItems();
  // Scroll to top
  const mc = $('mainContent');
  if (mc) mc.scrollTop = 0;
}

// ===== BUILD STUDENT LIST =====
function buildStudentList() {
  if (!selectedSchool) return;
  allStudents = getUnifiedStudents(selectedSchool);
  filterStudents();
}

function getUnifiedStudents(school) {
  if (!school) return [];
  const students = [];
  if (school.structure && Array.isArray(school.structure.classrooms)) {
    school.structure.classrooms.forEach((classroom) => {
      (classroom.students || []).forEach((student) => {
        students.push({
          id: 'structure-' + classroom.id + '-' + student.id,
          rawId: student.id,
          name: student.name || student.fullName || '—',
          studentNumber: student.studentNumber || '',
          className: classroom.name || classroom.className || '—',
          classroomId: classroom.id,
          points: student.points || 0,
          source: 'structure',
        });
      });
    });
  }
  // من students مباشرة
  if (Array.isArray(school.students)) {
    school.students.forEach((student) => {
      if (students.find((s) => String(s.rawId) === String(student.id))) return;
      students.push({
        id: String(student.id),
        rawId: student.id,
        name: student.name || student.fullName || '—',
        studentNumber: student.studentNumber || '',
        className: student.className || '—',
        companyId: student.companyId,
        points: student.points || 0,
        source: 'school',
      });
    });
  }
  return students.filter((s) => s.name && s.name !== '—');
}

function filterStudents() {
  const q = ($('studentSearch')?.value || '').trim().toLowerCase();
  filteredStudents = q
    ? allStudents.filter((s) => s.name.toLowerCase().includes(q) || (s.studentNumber || '').includes(q) || s.className.toLowerCase().includes(q))
    : allStudents.slice(0, 60);
  renderStudentList();
}

function getInitials(name) {
  if (!name) return '؟';
  const parts = name.trim().split(' ');
  return parts[0]?.[0] || '؟';
}

function renderStudentList() {
  const container = $('studentList');
  if (!container) return;
  if (!filteredStudents.length) {
    container.innerHTML = '<div class="empty-state" style="padding:24px 0"><div class="empty-icon" style="font-size:36px">🔍</div><div class="empty-text">لا توجد نتائج</div></div>';
    return;
  }
  container.innerHTML = filteredStudents.map((s) => \`
    <div class="student-item \${selectedStudent?.id === s.id ? 'selected' : ''}" onclick="selectStudent('\${s.id}')">
      <div class="student-avatar">\${getInitials(s.name)}</div>
      <div class="student-info">
        <div class="student-name">\${s.name}</div>
        <div class="student-class">\${s.className}\${s.studentNumber ? ' • ' + s.studentNumber : ''}</div>
      </div>
      <div class="student-pts">\${s.points || 0}</div>
    </div>
  \`).join('');
}

function selectStudent(id) {
  selectedStudent = allStudents.find((s) => String(s.id) === String(id)) || null;
  if (!selectedStudent) return;
  $('actionsStep1').style.display = 'none';
  $('selectedStudentBanner').style.display = 'flex';
  $('selectedStudentName').textContent = selectedStudent.name;
  $('selectedStudentInfo').textContent = selectedStudent.className + ' • ' + (selectedStudent.points || 0) + ' نقطة';
  $('actionsStep2').style.display = 'block';
  setActionType('reward');
}

function clearSelectedStudent() {
  selectedStudent = null;
  selectedActionItem = null;
  $('actionsStep1').style.display = 'block';
  $('selectedStudentBanner').style.display = 'none';
  $('actionsStep2').style.display = 'none';
  if ($('actionNote')) $('actionNote').value = '';
  const msg = $('actionMsg');
  if (msg) msg.classList.remove('show');
}

// ===== ACTION TYPE =====
function setActionType(type) {
  actionType = type;
  selectedActionItem = null;
  ['reward','violation','program'].forEach((t) => {
    const tab = $('tab' + t.charAt(0).toUpperCase() + t.slice(1));
    if (tab) tab.className = 'type-tab' + (t === type ? ' active-' + t : '');
  });
  const btn = $('submitActionBtn');
  if (btn) {
    btn.className = 'submit-btn ' + type;
    btn.textContent = type === 'reward' ? '✅ تطبيق المكافأة' : type === 'violation' ? '⚠️ تطبيق الخصم' : '🎯 اعتماد البرنامج';
    btn.disabled = true;
  }
  renderActionItems();
}

function getActionItems(type) {
  if (!sharedState) return [];
  const catalog = sharedState.settings?.actions || {};
  const mode = type === 'reward' ? 'rewards' : type === 'violation' ? 'violations' : 'programs';
  const globalItems = (catalog[mode] || []).map((item) => ({ ...item, scope: 'global' }));
  const specialItems = getTeacherSpecialItems(type);
  return [...specialItems, ...globalItems];
}

function getTeacherSubjects() {
  if (!currentUser) return [];
  const subjects = currentUser.subjects || currentUser.subjectAssignments || [];
  if (Array.isArray(subjects)) return subjects.filter(Boolean);
  if (typeof subjects === 'string') return subjects.split(',').map((s) => s.trim()).filter(Boolean);
  return [];
}

function getTeacherSpecialItems(type) {
  if (!currentUser?.specialItems) return [];
  const items = Array.isArray(currentUser.specialItems) ? currentUser.specialItems : [];
  return items
    .filter((item) => item.isActive !== false && item.title && item.subject)
    .filter((item) => {
      const t = item.type === 'violation' ? 'violation' : item.type === 'program' ? 'program' : 'reward';
      return t === type;
    })
    .map((item) => ({ ...item, scope: 'special' }));
}

function renderActionItems() {
  const container = $('actionItemsList');
  if (!container) return;
  const subjects = getTeacherSubjects();
  const specialItems = getTeacherSpecialItems(actionType);
  const hasSpecial = specialItems.length > 0 && subjects.length > 0;
  const subjectContainer = $('subjectTabsContainer');
  if (subjectContainer) {
    if (hasSpecial) {
      subjectContainer.style.display = 'block';
      if (!selectedSubject || !subjects.includes(selectedSubject)) selectedSubject = subjects[0];
      $('subjectTabs').innerHTML = subjects.map((s) => \`
        <button class="subject-tab \${s === selectedSubject ? 'active' : ''}" onclick="setSubject('\${s}')">\${s}</button>
      \`).join('');
    } else {
      subjectContainer.style.display = 'none';
      selectedSubject = null;
    }
  }
  const items = getActionItems(actionType);
  const displayItems = hasSpecial && selectedSubject
    ? items.filter((item) => item.scope !== 'special' || item.subject === selectedSubject)
    : items;
  if (!displayItems.length) {
    container.innerHTML = '<div class="empty-state" style="padding:24px 0"><div class="empty-icon" style="font-size:36px">📝</div><div class="empty-text">لا توجد بنود متاحة</div></div>';
    return;
  }
  const iconMap = { reward: '🏆', violation: '⚠️', program: '🎯' };
  const icon = iconMap[actionType] || '📌';
  container.innerHTML = displayItems.map((item) => {
    const pts = Number(item.points || 0);
    const ptsClass = actionType === 'reward' ? 'pts-reward' : actionType === 'violation' ? 'pts-violation' : 'pts-program';
    const ptsText = pts > 0 ? '+' + pts : String(pts);
    const isSelected = selectedActionItem && String(selectedActionItem.id) === String(item.id) && (selectedActionItem.scope || 'global') === (item.scope || 'global');
    const selClass = isSelected ? ('selected-' + actionType) : '';
    const scopeBadge = item.scope === 'special' ? '<span style="font-size:10px;background:var(--violet-light);color:var(--violet);padding:2px 7px;border-radius:10px;margin-right:6px;font-weight:700">تخصصي</span>' : '';
    return \`
      <div class="action-item \${selClass}" onclick="selectActionItem('\${item.id}', '\${item.scope || 'global'}')">
        <div class="action-item-left">
          <div class="action-item-icon \${actionType}">\${icon}</div>
          <div>
            <div class="action-item-title">\${scopeBadge}\${item.title}</div>
            \${item.description ? '<div class="action-item-desc">' + item.description + '</div>' : ''}
          </div>
        </div>
        <div class="action-pts \${ptsClass}">\${ptsText}</div>
      </div>
    \`;
  }).join('');
}

function setSubject(subject) {
  selectedSubject = subject;
  selectedActionItem = null;
  const btn = $('submitActionBtn');
  if (btn) btn.disabled = true;
  renderActionItems();
}

function selectActionItem(id, scope) {
  const items = getActionItems(actionType);
  selectedActionItem = items.find((item) => String(item.id) === String(id) && (item.scope || 'global') === scope) || null;
  if (!selectedActionItem) return;
  renderActionItems();
  const btn = $('submitActionBtn');
  if (btn) btn.disabled = false;
}

// ===== SUBMIT ACTION (FIXED: uses definitionId) =====
async function submitAction() {
  if (!selectedStudent || !selectedActionItem || !selectedSchool) return;
  const btn = $('submitActionBtn');
  btn.disabled = true;
  btn.textContent = '⏳ جارٍ التطبيق...';
  const note = $('actionNote')?.value?.trim() || '';
  try {
    const isSpecial = selectedActionItem.scope === 'special';
    const body = {
      studentId: selectedStudent.id,
      definitionId: String(selectedActionItem.id),
      actionType: actionType === 'reward' ? 'reward' : actionType === 'violation' ? 'violation' : 'program',
      note,
      actorName: currentUser.name || currentUser.username,
      actorRole: currentUser.role,
    };
    // للبنود التخصصية نضيف specialDefinition
    if (isSpecial) {
      body.specialDefinition = {
        ...selectedActionItem,
        scope: 'special',
      };
    }
    const data = await api('/api/schools/' + selectedSchool.id + '/actions/apply', { method: 'POST', body });
    if (data.ok) {
      sharedState = data.state || sharedState;
      selectedSchool = (sharedState.schools || []).find((s) => s.id === currentUser.schoolId) || selectedSchool;
      buildStudentList();
      showMsg('actionMsg', '✅ ' + (data.message || 'تم تطبيق الإجراء بنجاح.'), 'success');
      if ($('actionNote')) $('actionNote').value = '';
      selectedActionItem = null;
      btn.disabled = true;
      // تحديث نقاط الطالب
      const updatedStudent = allStudents.find((s) => String(s.id) === String(selectedStudent.id));
      if (updatedStudent && data.student) {
        updatedStudent.points = data.student.points || updatedStudent.points;
        if ($('selectedStudentInfo')) {
          $('selectedStudentInfo').textContent = updatedStudent.className + ' • ' + (updatedStudent.points || 0) + ' نقطة';
        }
      }
      renderActionItems();
    } else {
      showMsg('actionMsg', '❌ ' + (data.message || 'فشل تطبيق الإجراء.'), 'error');
    }
  } catch(e) {
    showMsg('actionMsg', '❌ ' + (e.message || 'حدث خطأ.'), 'error');
  } finally {
    const currentBtn = $('submitActionBtn');
    if (currentBtn) {
      currentBtn.className = 'submit-btn ' + actionType;
      currentBtn.textContent = actionType === 'reward' ? '✅ تطبيق المكافأة' : actionType === 'violation' ? '⚠️ تطبيق الخصم' : '🎯 اعتماد البرنامج';
    }
  }
}

// ===== LEAVE PASSES =====
function getLeavePasses() {
  if (!selectedSchool || !currentUser) return [];
  const passes = Array.isArray(selectedSchool.leavePasses) ? selectedSchool.leavePasses : [];
  return passes.filter((item) => {
    if (!item) return false;
    const teacherMatch = !item.teacherUserId || String(item.teacherUserId) === String(currentUser.id);
    return teacherMatch;
  });
}

function getLeaveStatusLabel(status) {
  const map = {
    'created': 'جديد', 'sent-system': 'جديد', 'sent-manual': 'جديد',
    'viewed': 'اطلع المعلم', 'approved-agent': 'معتمد', 'approved-counselor': 'معتمد',
    'released-guardian': 'مع ولي الأمر', 'completed': 'مكتمل', 'rejected': 'مرفوض',
  };
  return map[status] || status || '—';
}

function getLeaveStatusClass(status) {
  if (['created','sent-system','sent-manual'].includes(status)) return 'status-new';
  if (status === 'viewed') return 'status-viewed';
  if (['completed','approved-agent','approved-counselor'].includes(status)) return 'status-completed';
  return 'status-new';
}

function renderLeavePasses() {
  const container = $('leavePassesList');
  if (!container) return;
  const passes = getLeavePasses();
  if (!passes.length) {
    container.innerHTML = '<div class="empty-state"><div class="empty-icon">📋</div><div class="empty-text">لا توجد استئذانات</div><div class="empty-sub">ستظهر هنا طلبات الاستئذان المرسلة إليك</div></div>';
    return;
  }
  const sorted = [...passes].sort((a, b) => {
    const order = { 'created': 0, 'sent-system': 0, 'sent-manual': 0, 'viewed': 1 };
    return (order[a.status] ?? 2) - (order[b.status] ?? 2);
  });
  container.innerHTML = sorted.map((item) => {
    const isNew = ['created','sent-system','sent-manual'].includes(item.status);
    const createdAt = item.createdAt ? new Date(item.createdAt).toLocaleString('ar-SA', { hour: '2-digit', minute: '2-digit', month: 'short', day: 'numeric' }) : '—';
    return \`
      <div class="leave-item">
        <div class="leave-item-header">
          <div>
            <div class="leave-student">\${item.studentName || '—'}</div>
            <div class="leave-class">\${item.className || item.companyName || '—'}</div>
          </div>
          <span class="leave-status \${getLeaveStatusClass(item.status)}">\${getLeaveStatusLabel(item.status)}</span>
        </div>
        <div class="leave-reason">\${item.reason || 'لم يُذكر سبب'}</div>
        \${item.note ? '<div style="font-size:12px;color:var(--text-muted);margin-top:6px;padding:8px 12px;background:#f9fafb;border-radius:8px">📝 ' + item.note + '</div>' : ''}
        <div class="leave-time">⏰ \${createdAt}</div>
        <div class="leave-actions">
          \${isNew ? '<button class="leave-btn view" onclick="markLeaveViewed(&quot;' + item.id + '&quot;)">✅ اطلعت على الطلب</button>' : ''}
          \${item.passLink ? '<button class="leave-btn view" onclick="window.open(&quot;' + item.passLink + '&quot;, &quot;_blank&quot;)">🔗 رابط الاستئذان</button>' : ''}
        </div>
      </div>
    \`;
  }).join('');
}

async function markLeaveViewed(leavePassId) {
  if (!selectedSchool || !currentUser) return;
  const passes = Array.isArray(selectedSchool.leavePasses) ? selectedSchool.leavePasses : [];
  const updatedPasses = passes.map((item) => {
    if (String(item.id) !== String(leavePassId)) return item;
    if (String(item.teacherUserId || '') !== String(currentUser.id)) return item;
    const nextStatus = ['created','sent-system','sent-manual'].includes(item.status) ? 'viewed' : item.status;
    return { ...item, status: nextStatus, viewedAt: new Date().toISOString(), viewedByName: currentUser.name || currentUser.username };
  });
  selectedSchool = { ...selectedSchool, leavePasses: updatedPasses };
  sharedState = { ...sharedState, schools: (sharedState.schools || []).map((s) => s.id === selectedSchool.id ? selectedSchool : s) };
  try { await api('/api/state/save', { method: 'POST', body: { state: sharedState } }); } catch(e) {}
  renderLeavePasses();
  updateBadges();
}

// ===== LESSON ATTENDANCE =====
function getLessonSessions() {
  if (!selectedSchool) return [];
  return Array.isArray(selectedSchool.lessonAttendanceSessions) ? selectedSchool.lessonAttendanceSessions : [];
}

function getSessionsForTeacher() {
  const sessions = getLessonSessions();
  return sessions.filter((session) => {
    if (!session) return false;
    if (session.status === 'closed') return false;
    const invites = Array.isArray(session.teacherInvites) ? session.teacherInvites : [];
    if (!invites.length) return true;
    return invites.some((inv) => String(inv.teacherId) === String(currentUser.id));
  });
}

function getClassroomKey(row) {
  if (!row) return '';
  return String(row.source === 'structure' ? 'structure:' + (row.rawId || row.id) : 'school:' + (row.rawId || row.id));
}

function getClassrooms() {
  if (!selectedSchool) return [];
  const rows = [];
  if (selectedSchool.structure && Array.isArray(selectedSchool.structure.classrooms)) {
    selectedSchool.structure.classrooms.forEach((c) => {
      if ((c.students || []).length > 0) {
        rows.push({ id: c.id, rawId: c.id, name: c.name || c.className || '—', studentsCount: (c.students || []).length, source: 'structure' });
      }
    });
  }
  if (Array.isArray(selectedSchool.companies)) {
    selectedSchool.companies.forEach((c) => {
      if ((c.students || []).length > 0 && !rows.find((r) => r.name === c.name)) {
        rows.push({ id: c.id, rawId: c.id, name: c.name || '—', studentsCount: (c.students || []).length, source: 'company' });
      }
    });
  }
  return rows;
}

function getStudentsForClassroom(classroomKey) {
  if (!selectedSchool || !classroomKey) return [];
  const key = String(classroomKey);
  if (key.startsWith('structure:')) {
    const rawId = key.split(':')[1];
    if (selectedSchool.structure && Array.isArray(selectedSchool.structure.classrooms)) {
      const classroom = selectedSchool.structure.classrooms.find((c) => String(c.id) === String(rawId));
      return classroom ? (classroom.students || []) : [];
    }
  }
  if (key.startsWith('school:')) {
    const rawId = key.split(':')[1];
    if (Array.isArray(selectedSchool.companies)) {
      const company = selectedSchool.companies.find((c) => String(c.id) === String(rawId));
      return company ? (company.students || []) : [];
    }
  }
  return [];
}

let lessonState = { selectedSessionId: null, selectedClassKey: null, absentIds: new Set(), acknowledged: false, resubmit: false };

function renderLessonAttendance() {
  const container = $('lessonAttendanceContent');
  if (!container) return;
  const sessions = getSessionsForTeacher();
  if (!sessions.length) {
    container.innerHTML = '<div class="empty-state"><div class="empty-icon">📚</div><div class="empty-text">لا توجد جلسات تحضير</div><div class="empty-sub">ستظهر هنا جلسات التحضير التي يُطلب منك تعبئتها</div></div>';
    return;
  }
  if (!lessonState.selectedSessionId) lessonState.selectedSessionId = sessions[0]?.id;
  const selectedSession = sessions.find((s) => String(s.id) === String(lessonState.selectedSessionId)) || sessions[0];
  const classrooms = getClassrooms();
  if (!lessonState.selectedClassKey && classrooms[0]) lessonState.selectedClassKey = getClassroomKey(classrooms[0]);
  const existingSubmission = selectedSession ? (selectedSession.submissions || []).find((sub) => String(sub.teacherId) === String(currentUser.id) && String(sub.classKey) === String(lessonState.selectedClassKey)) : null;
  const students = getStudentsForClassroom(lessonState.selectedClassKey);
  let html = \`
    <div class="step-label">اختر الجلسة</div>
    <select class="session-select" id="sessionSelect" onchange="changeSession(this.value)">
      \${sessions.map((s) => '<option value="' + s.id + '"' + (String(s.id) === String(lessonState.selectedSessionId) ? ' selected' : '') + '>' + (s.label || s.subject || 'جلسة') + ' — ' + (s.date || '') + '</option>').join('')}
    </select>
    <div class="step-label">اختر الفصل</div>
    <select class="class-select" id="classSelect" onchange="changeClass(this.value)">
      \${classrooms.map((c) => '<option value="' + getClassroomKey(c) + '"' + (getClassroomKey(c) === lessonState.selectedClassKey ? ' selected' : '') + '>' + c.name + ' (' + c.studentsCount + ' طالب)</option>').join('')}
    </select>
  \`;
  if (existingSubmission && !lessonState.resubmit) {
    html += \`
      <div class="submitted-badge">✅ تم اعتماد التحضير لهذا الفصل</div>
      <div style="font-size:13px;color:var(--text-muted);margin-bottom:14px;padding:10px 14px;background:#f9fafb;border-radius:10px">
        الغائبون: <strong>\${existingSubmission.absentCount || 0}</strong> • الحاضرون: <strong>\${existingSubmission.presentCount || 0}</strong>
      </div>
      <button class="submit-btn blue" onclick="enableResubmit()">🔄 إعادة التحضير</button>
    \`;
  } else {
    if (!students.length) {
      html += '<div class="empty-state"><div class="empty-icon">👥</div><div class="empty-text">لا يوجد طلاب في هذا الفصل</div></div>';
    } else {
      html += \`
        <div class="step-label">الطلاب — انقر على الغائبين</div>
        <div class="attendance-list" id="attendanceList">
          \${students.map((student) => {
            const isAbsent = lessonState.absentIds.has(String(student.id));
            return \`<div class="attendance-item \${isAbsent ? 'absent' : ''}" onclick="toggleAbsent('\${student.id}')">
              <div class="attendance-check">\${isAbsent ? '✗' : ''}</div>
              <div class="attendance-student-name">\${student.name || student.fullName || '—'}</div>
              <div class="attendance-student-num">\${student.studentNumber || ''}</div>
            </div>\`;
          }).join('')}
        </div>
        <div class="ack-row \${lessonState.acknowledged ? 'checked' : ''}" id="ackRow" onclick="toggleAck()">
          <div class="ack-check">\${lessonState.acknowledged ? '✓' : ''}</div>
          <div class="ack-label">أقرّ بصحة بيانات التحضير</div>
        </div>
        <div style="font-size:13px;color:var(--text-muted);margin-top:10px;margin-bottom:4px;padding:10px 14px;background:#f9fafb;border-radius:10px">
          الغائبون: <strong>\${lessonState.absentIds.size}</strong> • الحاضرون: <strong>\${students.length - lessonState.absentIds.size}</strong>
        </div>
        <button class="submit-btn blue" id="submitLessonBtn" onclick="submitLessonAttendance()">📋 اعتماد التحضير</button>
        <div class="msg-box" id="lessonMsg"></div>
      \`;
    }
  }
  container.innerHTML = html;
}

function changeSession(id) { lessonState.selectedSessionId = id; lessonState.absentIds = new Set(); lessonState.acknowledged = false; lessonState.resubmit = false; renderLessonAttendance(); }
function changeClass(key) { lessonState.selectedClassKey = key; lessonState.absentIds = new Set(); lessonState.acknowledged = false; lessonState.resubmit = false; renderLessonAttendance(); }
function toggleAbsent(studentId) { const id = String(studentId); if (lessonState.absentIds.has(id)) lessonState.absentIds.delete(id); else lessonState.absentIds.add(id); renderLessonAttendance(); }
function toggleAck() { lessonState.acknowledged = !lessonState.acknowledged; renderLessonAttendance(); }
function enableResubmit() { lessonState.resubmit = true; lessonState.absentIds = new Set(); lessonState.acknowledged = false; renderLessonAttendance(); }

async function submitLessonAttendance() {
  if (!selectedSchool || !currentUser || !lessonState.selectedSessionId || !lessonState.selectedClassKey) return;
  const btn = $('submitLessonBtn');
  if (btn) { btn.disabled = true; btn.textContent = '⏳ جارٍ الاعتماد...'; }
  const sessions = getLessonSessions();
  const session = sessions.find((s) => String(s.id) === String(lessonState.selectedSessionId));
  if (!session) { showMsg('lessonMsg', '❌ الجلسة غير موجودة.', 'error'); if (btn) { btn.disabled = false; btn.textContent = '📋 اعتماد التحضير'; } return; }
  const classrooms = getClassrooms();
  const classRow = classrooms.find((c) => getClassroomKey(c) === lessonState.selectedClassKey);
  const students = getStudentsForClassroom(lessonState.selectedClassKey);
  if (!classRow || !students.length) { showMsg('lessonMsg', '❌ الفصل لا يحتوي طلاباً.', 'error'); if (btn) { btn.disabled = false; btn.textContent = '📋 اعتماد التحضير'; } return; }
  const absentStudents = students.filter((s) => lessonState.absentIds.has(String(s.id))).map((s) => ({ id: s.id, name: s.name || s.fullName || '—', studentNumber: s.studentNumber || '' }));
  const submission = {
    id: 'submission-' + Date.now(),
    teacherId: currentUser.id,
    teacherName: currentUser.name || currentUser.username || 'معلم',
    classKey: lessonState.selectedClassKey,
    className: classRow.name || '—',
    totalStudents: students.length,
    absentCount: absentStudents.length,
    presentCount: Math.max(students.length - absentStudents.length, 0),
    absentStudentIds: absentStudents.map((s) => s.id),
    absentStudents,
    submittedAt: new Date().toISOString(),
    acknowledged: Boolean(lessonState.acknowledged),
  };
  const updatedSessions = (selectedSchool.lessonAttendanceSessions || []).map((s) => {
    if (String(s.id) !== String(lessonState.selectedSessionId)) return s;
    const existing = (s.submissions || []).filter((sub) => !(String(sub.teacherId) === String(currentUser.id) && String(sub.classKey) === String(lessonState.selectedClassKey)));
    return { ...s, submissions: [submission, ...existing] };
  });
  selectedSchool = { ...selectedSchool, lessonAttendanceSessions: updatedSessions };
  sharedState = { ...sharedState, schools: (sharedState.schools || []).map((s) => s.id === selectedSchool.id ? selectedSchool : s) };
  try {
    await api('/api/state/save', { method: 'POST', body: { state: sharedState } });
    showMsg('lessonMsg', '✅ تم اعتماد التحضير بنجاح.', 'success');
    lessonState.resubmit = false;
    setTimeout(() => renderLessonAttendance(), 1500);
  } catch(e) {
    showMsg('lessonMsg', '❌ ' + (e.message || 'فشل الحفظ.'), 'error');
    if (btn) { btn.disabled = false; btn.textContent = '📋 اعتماد التحضير'; }
  }
}

// ===== NOTIFICATIONS =====
function getTeacherNotifications() {
  if (!sharedState || !currentUser) return [];
  const notifications = Array.isArray(sharedState.notifications) ? sharedState.notifications : [];
  return notifications.filter((note) => {
    if (!note?.forTeacherIds) return false;
    return note.forTeacherIds.map(String).includes(String(currentUser.id));
  });
}

function markNotifsRead() {
  try { localStorage.setItem(NOTIF_READ_KEY, new Date().toISOString()); } catch(e) {}
  const nb = $('notifBadge'); if (nb) nb.classList.add('hidden');
  const nnb = $('navNotifBadge'); if (nnb) nnb.classList.add('hidden');
}

function renderNotifications() {
  const container = $('notificationsList');
  if (!container) return;
  const notifs = getTeacherNotifications();
  let lastReadAt = '';
  try { lastReadAt = localStorage.getItem(NOTIF_READ_KEY) || ''; } catch(e) {}
  if (!notifs.length) {
    container.innerHTML = '<div class="empty-state"><div class="empty-icon">🔔</div><div class="empty-text">لا توجد تنبيهات</div><div class="empty-sub">ستظهر هنا التنبيهات الموجهة إليك</div></div>';
    return;
  }
  container.innerHTML = notifs.map((note) => {
    const isUnread = lastReadAt ? (note.time || '') > lastReadAt : true;
    return \`
      <div class="notif-item \${isUnread ? 'unread' : ''}">
        <div class="notif-item-header">
          <div class="notif-icon">🔔</div>
          <div style="flex:1">
            <div class="notif-title">\${note.title || 'تنبيه'}</div>
            <div class="notif-body">\${note.body || ''}</div>
            <div class="notif-time">\${note.time || ''}</div>
          </div>
        </div>
      </div>
    \`;
  }).join('');
}

// ===== DASHBOARD =====
function renderDashboard() {
  if (!currentUser || !sharedState) return;
  $('dashName').textContent = (currentUser.name || currentUser.username || 'المعلم');
  $('dashSchool').textContent = selectedSchool?.name || 'المدرسة';
  $('headerName').textContent = currentUser.name || currentUser.username || 'المعلم';
  $('headerSchool').textContent = selectedSchool?.name || 'المدرسة';
  const actionLog = Array.isArray(sharedState.actionLog) ? sharedState.actionLog : [];
  const myActions = actionLog.filter((item) => {
    return String(item.actorId || '') === String(currentUser.id || '') ||
           String(item.actorUsername || '') === String(currentUser.username || '') ||
           String(item.actorName || '') === String(currentUser.name || '');
  });
  const rewards = myActions.filter((item) => item.actionType === 'reward').length;
  const violations = myActions.filter((item) => item.actionType === 'violation').length;
  const programs = myActions.filter((item) => item.actionType === 'program').length;
  $('dashRewards').textContent = rewards;
  $('dashViolations').textContent = violations;
  $('dashPrograms').textContent = programs;
  const passes = getLeavePasses();
  const newPasses = passes.filter((p) => ['created','sent-system','sent-manual'].includes(p.status)).length;
  $('dashLeaveCount').textContent = newPasses > 0 ? newPasses + ' طلب جديد' : (passes.length > 0 ? passes.length + ' طلب' : 'لا يوجد طلبات');
  const leaveBadgeEl = $('dashLeaveBadge');
  if (leaveBadgeEl) { if (newPasses > 0) { leaveBadgeEl.textContent = newPasses; leaveBadgeEl.classList.remove('hidden'); } else leaveBadgeEl.classList.add('hidden'); }
  const sessions = getSessionsForTeacher();
  $('dashSessionCount').textContent = sessions.length > 0 ? sessions.length + ' جلسة نشطة' : 'لا توجد جلسات';
  const notifs = getTeacherNotifications();
  $('dashNotifCount').textContent = notifs.length > 0 ? notifs.length + ' تنبيه' : 'لا يوجد تنبيهات';
  const recentActions = myActions.slice(0, 5);
  const recentContainer = $('dashRecentActions');
  if (recentContainer) {
    if (!recentActions.length) {
      recentContainer.innerHTML = '<div class="empty-state" style="padding:20px 0"><div class="empty-icon" style="font-size:32px">📝</div><div class="empty-text" style="font-size:14px">لا توجد إجراءات حديثة</div></div>';
    } else {
      recentContainer.innerHTML = recentActions.map((item) => {
        const isReward = item.actionType === 'reward';
        const isProgram = item.actionType === 'program';
        const icon = isReward ? '🏆' : isProgram ? '🎯' : '⚠️';
        const bgColor = isReward ? 'var(--success-light)' : isProgram ? 'var(--violet-light)' : 'var(--danger-light)';
        const color = isReward ? 'var(--success)' : isProgram ? 'var(--violet)' : 'var(--danger)';
        const pts = Number(item.deltaPoints || 0);
        return \`<div class="recent-action">
          <div class="recent-action-icon" style="background:\${bgColor}">\${icon}</div>
          <div class="recent-action-info">
            <div class="recent-action-title">\${item.actionTitle || '—'}</div>
            <div class="recent-action-sub">\${item.student || item.studentName || '—'} • \${item.isoDate || ''}</div>
          </div>
          <div class="recent-action-pts" style="color:\${color}">\${pts > 0 ? '+' : ''}\${pts}</div>
        </div>\`;
      }).join('');
    }
  }
  updateBadges();
}

// ===== UPDATE BADGES =====
function updateBadges() {
  const passes = getLeavePasses();
  const newPasses = passes.filter((p) => ['created','sent-system','sent-manual'].includes(p.status)).length;
  const leaveBadge = $('navLeaveBadge');
  if (leaveBadge) { if (newPasses > 0) { leaveBadge.textContent = newPasses; leaveBadge.classList.remove('hidden'); } else leaveBadge.classList.add('hidden'); }
  const sessions = getSessionsForTeacher();
  const pendingSessions = sessions.filter((s) => {
    const mySubmission = (s.submissions || []).find((sub) => String(sub.teacherId) === String(currentUser.id));
    return !mySubmission;
  }).length;
  const lessonBadge = $('navLessonBadge');
  if (lessonBadge) { if (pendingSessions > 0) { lessonBadge.textContent = pendingSessions; lessonBadge.classList.remove('hidden'); } else lessonBadge.classList.add('hidden'); }
  const notifs = getTeacherNotifications();
  let lastReadAt = '';
  try { lastReadAt = localStorage.getItem(NOTIF_READ_KEY) || ''; } catch(e) {}
  const unreadNotifs = lastReadAt ? notifs.filter((n) => (n.time || '') > lastReadAt).length : notifs.length;
  const notifBadge = $('notifBadge');
  const navNotifBadge = $('navNotifBadge');
  if (notifBadge) { if (unreadNotifs > 0 && activePage !== 'notifications') { notifBadge.textContent = unreadNotifs > 99 ? '99+' : unreadNotifs; notifBadge.classList.remove('hidden'); } else notifBadge.classList.add('hidden'); }
  if (navNotifBadge) { if (unreadNotifs > 0 && activePage !== 'notifications') { navNotifBadge.textContent = unreadNotifs > 99 ? '99+' : unreadNotifs; navNotifBadge.classList.remove('hidden'); } else navNotifBadge.classList.add('hidden'); }
}

// ===== INIT =====
(async function init() {
  const token = getToken();
  if (token) {
    try { await loadBootstrap(); } catch(e) { clearToken(); }
  }
})();

// ===== PWA: Service Worker =====
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/public/teacher-sw.js', { scope: '/teacher' })
      .then(reg => console.log('[PWA] SW registered:', reg.scope))
      .catch(err => console.warn('[PWA] SW failed:', err));
  });
}

let deferredPrompt = null;
window.addEventListener('beforeinstallprompt', (e) => { e.preventDefault(); deferredPrompt = e; });
window.addEventListener('appinstalled', () => { deferredPrompt = null; });
</script>
</body>
</html>
`;
}

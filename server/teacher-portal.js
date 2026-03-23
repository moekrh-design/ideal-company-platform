// ===== بوابة المعلم المستقلة =====
// هذا الملف يحتوي على دالة renderTeacherPortalHtml التي تُولّد صفحة HTML كاملة لبوابة المعلم

export function renderTeacherPortalHtml() {
  return `<!doctype html>
<html lang="ar" dir="rtl">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
  <title>بوابة المعلم</title>
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link href="https://fonts.googleapis.com/css2?family=Tajawal:wght@400;500;700;800;900&display=swap" rel="stylesheet" />
  <!-- PWA Meta Tags -->
  <link rel="manifest" href="/public/teacher-manifest.json" />
  <meta name="theme-color" content="#1d4ed8" />
  <meta name="mobile-web-app-capable" content="yes" />
  <meta name="apple-mobile-web-app-capable" content="yes" />
  <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
  <meta name="apple-mobile-web-app-title" content="المعلم" />
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
      --primary: #1d4ed8;
      --primary-light: #dbeafe;
      --primary-dark: #1e3a8a;
      --success: #15803d;
      --success-light: #dcfce7;
      --danger: #be123c;
      --danger-light: #fff1f2;
      --amber: #b45309;
      --amber-light: #fef3c7;
      --violet: #7c3aed;
      --violet-light: #ede9fe;
      --nav-h: 68px;
      --header-h: 60px;
      --radius: 18px;
      --radius-sm: 12px;
    }
    html, body {
      height: 100%;
      font-family: var(--font);
      background: linear-gradient(135deg, #eff6ff 0%, #f0f9ff 50%, #f5f3ff 100%);
      color: var(--text);
      -webkit-font-smoothing: antialiased;
    }
    #app { display: flex; flex-direction: column; height: 100dvh; overflow: hidden; }

    /* ===== LOGIN SCREEN ===== */
    #loginScreen {
      position: fixed; inset: 0; z-index: 9999;
      background: linear-gradient(160deg, #1d4ed8 0%, #7c3aed 100%);
      display: flex; flex-direction: column; align-items: center; justify-content: center;
      padding: 24px 20px; overflow-y: auto;
    }
    .login-box {
      width: 100%; max-width: 400px; background: #fff;
      border-radius: 28px; padding: 36px 28px;
      box-shadow: 0 24px 64px rgba(0,0,0,.25); text-align: center;
    }
    .login-icon {
      width: 80px; height: 80px; border-radius: 22px;
      margin: 0 auto 16px; background: linear-gradient(135deg,#1d4ed8,#7c3aed);
      display: flex; align-items: center; justify-content: center;
      font-size: 36px; box-shadow: 0 8px 24px rgba(29,78,216,.35);
    }
    .login-title { font-size: 24px; font-weight: 900; color: #0f172a; margin-bottom: 6px; }
    .login-sub { font-size: 14px; color: #64748b; margin-bottom: 28px; line-height: 1.6; }
    .login-field { margin-bottom: 16px; text-align: right; }
    .login-field label { display: block; font-size: 13px; font-weight: 700; color: #374151; margin-bottom: 6px; }
    .login-field input {
      width: 100%; padding: 12px 16px; border: 2px solid #e2e8f0;
      border-radius: 14px; font-family: var(--font); font-size: 15px;
      background: #f8fafc; color: #0f172a; outline: none; transition: border-color .2s;
      direction: ltr; text-align: right;
    }
    .login-field input:focus { border-color: #1d4ed8; background: #fff; }
    .login-btn {
      width: 100%; padding: 14px; background: linear-gradient(135deg,#1d4ed8,#7c3aed);
      color: #fff; border: none; border-radius: 14px; font-family: var(--font);
      font-size: 16px; font-weight: 800; cursor: pointer; transition: opacity .2s;
      margin-top: 8px;
    }
    .login-btn:hover { opacity: .9; }
    .login-btn:disabled { opacity: .6; cursor: not-allowed; }
    .login-err {
      background: #fff1f2; border: 1.5px solid #fda4af; border-radius: 12px;
      padding: 10px 14px; font-size: 13px; color: #be123c; margin-top: 12px;
      display: none;
    }
    .login-err.show { display: block; }

    /* ===== HEADER ===== */
    #header {
      height: var(--header-h); background: linear-gradient(135deg,#1d4ed8,#7c3aed);
      display: flex; align-items: center; justify-content: space-between;
      padding: 0 16px; flex-shrink: 0; position: relative; z-index: 10;
    }
    .header-title { font-size: 17px; font-weight: 900; color: #fff; }
    .header-sub { font-size: 12px; color: rgba(255,255,255,.7); margin-top: 1px; }
    .header-right { display: flex; align-items: center; gap: 10px; }
    .header-notif-btn {
      position: relative; width: 40px; height: 40px; border-radius: 50%;
      background: rgba(255,255,255,.15); border: none; cursor: pointer;
      display: flex; align-items: center; justify-content: center; font-size: 20px;
      color: #fff; transition: background .2s;
    }
    .header-notif-btn:hover { background: rgba(255,255,255,.25); }
    .notif-badge {
      position: absolute; top: -2px; right: -2px; min-width: 18px; height: 18px;
      background: #ef4444; border-radius: 9px; font-size: 11px; font-weight: 800;
      color: #fff; display: flex; align-items: center; justify-content: center;
      padding: 0 4px; border: 2px solid #1d4ed8;
    }
    .notif-badge.hidden { display: none; }
    .logout-btn {
      padding: 6px 14px; background: rgba(255,255,255,.15); border: 1.5px solid rgba(255,255,255,.3);
      border-radius: 20px; color: #fff; font-family: var(--font); font-size: 13px;
      font-weight: 700; cursor: pointer; transition: background .2s;
    }
    .logout-btn:hover { background: rgba(255,255,255,.25); }

    /* ===== MAIN CONTENT ===== */
    #mainContent {
      flex: 1; overflow-y: auto; padding: 16px;
      padding-bottom: calc(var(--nav-h) + 16px);
    }

    /* ===== BOTTOM NAV ===== */
    #bottomNav {
      height: var(--nav-h); background: #fff;
      border-top: 1.5px solid #e2e8f0;
      display: flex; align-items: stretch; flex-shrink: 0;
      box-shadow: 0 -4px 20px rgba(0,0,0,.06);
    }
    .nav-item {
      flex: 1; display: flex; flex-direction: column; align-items: center;
      justify-content: center; gap: 3px; cursor: pointer; border: none;
      background: none; font-family: var(--font); color: #94a3b8;
      transition: color .2s; padding: 8px 4px; position: relative;
    }
    .nav-item.active { color: #1d4ed8; }
    .nav-item .nav-icon { font-size: 22px; line-height: 1; }
    .nav-item .nav-label { font-size: 11px; font-weight: 700; }
    .nav-item .nav-badge {
      position: absolute; top: 6px; right: calc(50% - 18px);
      min-width: 16px; height: 16px; background: #ef4444;
      border-radius: 8px; font-size: 10px; font-weight: 800; color: #fff;
      display: flex; align-items: center; justify-content: center; padding: 0 3px;
    }
    .nav-item .nav-badge.hidden { display: none; }

    /* ===== CARDS ===== */
    .card {
      background: #fff; border-radius: var(--radius);
      box-shadow: 0 2px 12px rgba(0,0,0,.06); padding: 20px;
      margin-bottom: 14px; border: 1.5px solid #e2e8f0;
    }
    .card-title { font-size: 16px; font-weight: 900; color: #0f172a; margin-bottom: 14px; }
    .card-sub { font-size: 13px; color: #64748b; margin-top: 4px; }

    /* ===== STATS ROW ===== */
    .stats-row { display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; margin-bottom: 16px; }
    .stat-box {
      background: #fff; border-radius: var(--radius-sm); padding: 14px 10px;
      text-align: center; border: 1.5px solid #e2e8f0;
      box-shadow: 0 1px 6px rgba(0,0,0,.04);
    }
    .stat-val { font-size: 22px; font-weight: 900; }
    .stat-lbl { font-size: 11px; color: #64748b; margin-top: 2px; font-weight: 600; }

    /* ===== STUDENT ACTION PAGE ===== */
    .section-title {
      font-size: 15px; font-weight: 900; color: #0f172a;
      margin-bottom: 12px; padding-bottom: 8px; border-bottom: 2px solid #e2e8f0;
    }
    .search-box {
      width: 100%; padding: 12px 16px; border: 2px solid #e2e8f0;
      border-radius: var(--radius-sm); font-family: var(--font); font-size: 14px;
      background: #f8fafc; color: #0f172a; outline: none; margin-bottom: 12px;
      transition: border-color .2s;
    }
    .search-box:focus { border-color: #1d4ed8; background: #fff; }
    .student-list { display: flex; flex-direction: column; gap: 8px; max-height: 280px; overflow-y: auto; }
    .student-item {
      display: flex; align-items: center; justify-content: space-between;
      padding: 12px 14px; background: #f8fafc; border-radius: var(--radius-sm);
      border: 1.5px solid #e2e8f0; cursor: pointer; transition: all .15s;
    }
    .student-item:hover { border-color: #1d4ed8; background: #eff6ff; }
    .student-item.selected { border-color: #1d4ed8; background: #dbeafe; }
    .student-name { font-size: 14px; font-weight: 700; color: #0f172a; }
    .student-class { font-size: 12px; color: #64748b; }
    .student-pts { font-size: 14px; font-weight: 800; color: #1d4ed8; }

    /* ===== ACTION TYPE TABS ===== */
    .type-tabs { display: flex; gap: 8px; margin-bottom: 14px; flex-wrap: wrap; }
    .type-tab {
      flex: 1; min-width: 80px; padding: 10px 8px; border-radius: var(--radius-sm);
      border: 2px solid #e2e8f0; background: #f8fafc; cursor: pointer;
      font-family: var(--font); font-size: 13px; font-weight: 700; color: #64748b;
      text-align: center; transition: all .15s;
    }
    .type-tab.active-reward { border-color: #15803d; background: #dcfce7; color: #15803d; }
    .type-tab.active-violation { border-color: #be123c; background: #fff1f2; color: #be123c; }
    .type-tab.active-program { border-color: #7c3aed; background: #ede9fe; color: #7c3aed; }

    /* ===== ACTION ITEMS ===== */
    .action-items { display: flex; flex-direction: column; gap: 8px; max-height: 200px; overflow-y: auto; }
    .action-item {
      display: flex; align-items: center; justify-content: space-between;
      padding: 12px 14px; background: #f8fafc; border-radius: var(--radius-sm);
      border: 1.5px solid #e2e8f0; cursor: pointer; transition: all .15s;
    }
    .action-item:hover { border-color: #1d4ed8; background: #eff6ff; }
    .action-item.selected { border-color: #1d4ed8; background: #dbeafe; }
    .action-item-title { font-size: 14px; font-weight: 700; color: #0f172a; }
    .action-pts { font-size: 14px; font-weight: 800; }
    .pts-reward { color: #15803d; }
    .pts-violation { color: #be123c; }
    .pts-program { color: #7c3aed; }

    /* ===== NOTE INPUT ===== */
    .note-input {
      width: 100%; padding: 12px 16px; border: 2px solid #e2e8f0;
      border-radius: var(--radius-sm); font-family: var(--font); font-size: 14px;
      background: #f8fafc; color: #0f172a; outline: none; resize: none;
      transition: border-color .2s; margin-top: 12px;
    }
    .note-input:focus { border-color: #1d4ed8; background: #fff; }

    /* ===== SUBMIT BTN ===== */
    .submit-btn {
      width: 100%; padding: 14px; border: none; border-radius: var(--radius-sm);
      font-family: var(--font); font-size: 15px; font-weight: 800;
      cursor: pointer; transition: opacity .2s; margin-top: 12px;
    }
    .submit-btn:disabled { opacity: .5; cursor: not-allowed; }
    .submit-btn.reward { background: #15803d; color: #fff; }
    .submit-btn.violation { background: #be123c; color: #fff; }
    .submit-btn.program { background: #7c3aed; color: #fff; }
    .submit-btn.blue { background: #1d4ed8; color: #fff; }

    /* ===== SUCCESS / ERROR MSG ===== */
    .msg-box {
      padding: 12px 16px; border-radius: var(--radius-sm);
      font-size: 14px; font-weight: 700; margin-top: 12px; display: none;
    }
    .msg-box.show { display: block; }
    .msg-box.success { background: #dcfce7; color: #15803d; border: 1.5px solid #86efac; }
    .msg-box.error { background: #fff1f2; color: #be123c; border: 1.5px solid #fda4af; }

    /* ===== LEAVE PASS PAGE ===== */
    .leave-item {
      background: #fff; border-radius: var(--radius-sm); padding: 16px;
      border: 1.5px solid #e2e8f0; margin-bottom: 10px;
      box-shadow: 0 1px 6px rgba(0,0,0,.04);
    }
    .leave-item-header { display: flex; justify-content: space-between; align-items: flex-start; gap: 10px; }
    .leave-student { font-size: 15px; font-weight: 800; color: #0f172a; }
    .leave-class { font-size: 12px; color: #64748b; margin-top: 2px; }
    .leave-status {
      padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: 700;
      white-space: nowrap; flex-shrink: 0;
    }
    .status-new { background: #fef3c7; color: #b45309; }
    .status-viewed { background: #dbeafe; color: #1d4ed8; }
    .status-completed { background: #dcfce7; color: #15803d; }
    .leave-reason { font-size: 13px; color: #374151; margin-top: 8px; }
    .leave-time { font-size: 12px; color: #94a3b8; margin-top: 6px; }
    .leave-actions { display: flex; gap: 8px; margin-top: 12px; flex-wrap: wrap; }
    .leave-btn {
      padding: 8px 16px; border-radius: 20px; border: none; cursor: pointer;
      font-family: var(--font); font-size: 13px; font-weight: 700; transition: opacity .2s;
    }
    .leave-btn:hover { opacity: .85; }
    .leave-btn.view { background: #dbeafe; color: #1d4ed8; }
    .leave-btn.complete { background: #dcfce7; color: #15803d; }
    .leave-btn.reject { background: #fff1f2; color: #be123c; }

    /* ===== LESSON ATTENDANCE PAGE ===== */
    .session-select {
      width: 100%; padding: 12px 16px; border: 2px solid #e2e8f0;
      border-radius: var(--radius-sm); font-family: var(--font); font-size: 14px;
      background: #f8fafc; color: #0f172a; outline: none; margin-bottom: 14px;
    }
    .session-select:focus { border-color: #1d4ed8; }
    .class-select {
      width: 100%; padding: 12px 16px; border: 2px solid #e2e8f0;
      border-radius: var(--radius-sm); font-family: var(--font); font-size: 14px;
      background: #f8fafc; color: #0f172a; outline: none; margin-bottom: 14px;
    }
    .class-select:focus { border-color: #1d4ed8; }
    .attendance-list { display: flex; flex-direction: column; gap: 8px; max-height: 320px; overflow-y: auto; }
    .attendance-item {
      display: flex; align-items: center; gap: 12px;
      padding: 12px 14px; background: #f8fafc; border-radius: var(--radius-sm);
      border: 1.5px solid #e2e8f0; cursor: pointer; transition: all .15s;
    }
    .attendance-item.absent { background: #fff1f2; border-color: #fda4af; }
    .attendance-check {
      width: 22px; height: 22px; border-radius: 6px; border: 2px solid #e2e8f0;
      display: flex; align-items: center; justify-content: center; flex-shrink: 0;
      font-size: 14px; transition: all .15s;
    }
    .attendance-item.absent .attendance-check { background: #be123c; border-color: #be123c; color: #fff; }
    .attendance-student-name { font-size: 14px; font-weight: 700; color: #0f172a; flex: 1; }
    .attendance-student-num { font-size: 12px; color: #94a3b8; }
    .ack-row { display: flex; align-items: center; gap: 10px; margin-top: 14px; padding: 12px 14px; background: #f8fafc; border-radius: var(--radius-sm); border: 1.5px solid #e2e8f0; cursor: pointer; }
    .ack-check { width: 22px; height: 22px; border-radius: 6px; border: 2px solid #e2e8f0; display: flex; align-items: center; justify-content: center; flex-shrink: 0; font-size: 14px; transition: all .15s; }
    .ack-row.checked .ack-check { background: #1d4ed8; border-color: #1d4ed8; color: #fff; }
    .ack-label { font-size: 13px; font-weight: 700; color: #374151; }
    .submitted-badge { background: #dcfce7; color: #15803d; border: 1.5px solid #86efac; padding: 10px 14px; border-radius: var(--radius-sm); font-size: 13px; font-weight: 700; margin-bottom: 12px; }

    /* ===== NOTIFICATIONS PAGE ===== */
    .notif-item {
      background: #fff; border-radius: var(--radius-sm); padding: 14px 16px;
      border: 1.5px solid #e2e8f0; margin-bottom: 8px;
      box-shadow: 0 1px 4px rgba(0,0,0,.04);
    }
    .notif-item.unread { border-color: #93c5fd; background: #eff6ff; }
    .notif-title { font-size: 14px; font-weight: 800; color: #0f172a; }
    .notif-body { font-size: 13px; color: #374151; margin-top: 4px; line-height: 1.5; }
    .notif-time { font-size: 11px; color: #94a3b8; margin-top: 6px; }

    /* ===== EMPTY STATE ===== */
    .empty-state {
      text-align: center; padding: 40px 20px; color: #94a3b8;
    }
    .empty-icon { font-size: 48px; margin-bottom: 12px; }
    .empty-text { font-size: 15px; font-weight: 700; }
    .empty-sub { font-size: 13px; margin-top: 6px; }

    /* ===== LOADING ===== */
    .loading-spinner {
      width: 36px; height: 36px; border: 3px solid #e2e8f0;
      border-top-color: #1d4ed8; border-radius: 50%;
      animation: spin .7s linear infinite; margin: 20px auto;
    }
    @keyframes spin { to { transform: rotate(360deg); } }

    /* ===== SELECTED STUDENT BANNER ===== */
    .selected-banner {
      background: #dbeafe; border: 1.5px solid #93c5fd; border-radius: var(--radius-sm);
      padding: 12px 16px; margin-bottom: 14px; display: flex; align-items: center;
      justify-content: space-between; gap: 10px;
    }
    .selected-banner-name { font-size: 15px; font-weight: 800; color: #1d4ed8; }
    .selected-banner-info { font-size: 12px; color: #3b82f6; }
    .clear-btn {
      padding: 6px 12px; background: #fff; border: 1.5px solid #93c5fd;
      border-radius: 20px; font-family: var(--font); font-size: 12px;
      font-weight: 700; color: #1d4ed8; cursor: pointer;
    }

    /* ===== DASHBOARD PAGE ===== */
    .welcome-card {
      background: linear-gradient(135deg,#1d4ed8,#7c3aed);
      border-radius: var(--radius); padding: 20px; margin-bottom: 16px;
      color: #fff;
    }
    .welcome-name { font-size: 20px; font-weight: 900; }
    .welcome-school { font-size: 13px; opacity: .8; margin-top: 3px; }
    .welcome-pts { font-size: 28px; font-weight: 900; margin-top: 12px; }
    .welcome-pts-lbl { font-size: 12px; opacity: .7; }

    .quick-actions { display: grid; grid-template-columns: repeat(2, 1fr); gap: 10px; margin-bottom: 16px; }
    .quick-action {
      background: #fff; border-radius: var(--radius-sm); padding: 16px;
      border: 1.5px solid #e2e8f0; cursor: pointer; text-align: center;
      transition: all .15s; box-shadow: 0 1px 6px rgba(0,0,0,.04);
    }
    .quick-action:hover { border-color: #1d4ed8; background: #eff6ff; }
    .quick-action-icon { font-size: 28px; margin-bottom: 8px; }
    .quick-action-label { font-size: 13px; font-weight: 800; color: #0f172a; }
    .quick-action-sub { font-size: 11px; color: #64748b; margin-top: 2px; }

    /* ===== SUBJECT TABS ===== */
    .subject-tabs { display: flex; gap: 6px; overflow-x: auto; padding-bottom: 4px; margin-bottom: 12px; }
    .subject-tab {
      padding: 7px 14px; border-radius: 20px; border: 1.5px solid #e2e8f0;
      background: #f8fafc; font-family: var(--font); font-size: 13px; font-weight: 700;
      color: #64748b; cursor: pointer; white-space: nowrap; transition: all .15s; flex-shrink: 0;
    }
    .subject-tab.active { background: #1d4ed8; border-color: #1d4ed8; color: #fff; }

    /* ===== SCROLLBAR ===== */
    ::-webkit-scrollbar { width: 4px; height: 4px; }
    ::-webkit-scrollbar-track { background: transparent; }
    ::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 2px; }
  </style>
</head>
<body>
<div id="app">

  <!-- ===== LOGIN SCREEN ===== -->
  <div id="loginScreen">
    <div class="login-box">
      <div class="login-icon">🎓</div>
      <div class="login-title">بوابة المعلم</div>
      <div class="login-sub">أدخل بيانات حسابك للدخول إلى بوابة المعلم</div>
      <div class="login-field">
        <label>اسم المستخدم</label>
        <input type="text" id="loginUsername" placeholder="اسم المستخدم" autocomplete="username" />
      </div>
      <div class="login-field">
        <label>كلمة المرور</label>
        <input type="password" id="loginPassword" placeholder="كلمة المرور" autocomplete="current-password" />
      </div>
      <button class="login-btn" id="loginBtn" onclick="doLogin()">دخول</button>
      <div class="login-err" id="loginErr"></div>
    </div>
  </div>

  <!-- ===== HEADER ===== -->
  <div id="header" style="display:none">
    <div>
      <div class="header-title" id="headerTitle">بوابة المعلم</div>
      <div class="header-sub" id="headerSub">جارٍ التحميل...</div>
    </div>
    <div class="header-right">
      <button class="header-notif-btn" onclick="showPage('notifications')" title="التنبيهات">
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
      <div class="welcome-card">
        <div class="welcome-name" id="dashName">أهلاً</div>
        <div class="welcome-school" id="dashSchool">المدرسة</div>
        <div class="welcome-pts" id="dashPoints">0</div>
        <div class="welcome-pts-lbl">نقطة تخصصية</div>
      </div>
      <div class="stats-row">
        <div class="stat-box">
          <div class="stat-val" style="color:#15803d" id="dashRewards">0</div>
          <div class="stat-lbl">مكافآت</div>
        </div>
        <div class="stat-box">
          <div class="stat-val" style="color:#be123c" id="dashViolations">0</div>
          <div class="stat-lbl">خصومات</div>
        </div>
        <div class="stat-box">
          <div class="stat-val" style="color:#7c3aed" id="dashPrograms">0</div>
          <div class="stat-lbl">برامج</div>
        </div>
      </div>
      <div class="quick-actions">
        <div class="quick-action" onclick="showPage('actions')">
          <div class="quick-action-icon">⚡</div>
          <div class="quick-action-label">إجراءات الطلاب</div>
          <div class="quick-action-sub">مكافأة • خصم • برنامج</div>
        </div>
        <div class="quick-action" onclick="showPage('leavePasses')">
          <div class="quick-action-icon">📋</div>
          <div class="quick-action-label">الاستئذانات</div>
          <div class="quick-action-sub" id="dashLeaveCount">لا يوجد طلبات</div>
        </div>
        <div class="quick-action" onclick="showPage('lessonAttendance')">
          <div class="quick-action-icon">📚</div>
          <div class="quick-action-label">تحضير الحصص</div>
          <div class="quick-action-sub" id="dashSessionCount">لا توجد جلسات</div>
        </div>
        <div class="quick-action" onclick="showPage('notifications')">
          <div class="quick-action-icon">🔔</div>
          <div class="quick-action-label">التنبيهات</div>
          <div class="quick-action-sub" id="dashNotifCount">لا يوجد تنبيهات</div>
        </div>
      </div>
      <div class="card">
        <div class="card-title">آخر الإجراءات</div>
        <div id="dashRecentActions">
          <div class="empty-state"><div class="empty-icon">📝</div><div class="empty-text">لا توجد إجراءات حديثة</div></div>
        </div>
      </div>
    </div>

    <!-- STUDENT ACTIONS PAGE -->
    <div id="page-actions" class="page" style="display:none">
      <div class="section-title">إجراءات الطلاب</div>

      <!-- Step 1: Select Student -->
      <div id="actionsStep1">
        <div class="card-title" style="font-size:14px;color:#64748b;margin-bottom:8px">① اختر الطالب</div>
        <input class="search-box" id="studentSearch" placeholder="ابحث باسم الطالب..." oninput="filterStudents()" />
        <div class="student-list" id="studentList">
          <div class="loading-spinner"></div>
        </div>
      </div>

      <!-- Selected Student Banner -->
      <div class="selected-banner" id="selectedStudentBanner" style="display:none">
        <div>
          <div class="selected-banner-name" id="selectedStudentName">—</div>
          <div class="selected-banner-info" id="selectedStudentInfo">—</div>
        </div>
        <button class="clear-btn" onclick="clearSelectedStudent()">تغيير</button>
      </div>

      <!-- Step 2: Action Type -->
      <div id="actionsStep2" style="display:none">
        <div class="card-title" style="font-size:14px;color:#64748b;margin-bottom:8px">② نوع الإجراء</div>
        <div class="type-tabs">
          <button class="type-tab active-reward" id="tabReward" onclick="setActionType('reward')">🏆 مكافأة</button>
          <button class="type-tab" id="tabViolation" onclick="setActionType('violation')">⚠️ خصم</button>
          <button class="type-tab" id="tabProgram" onclick="setActionType('program')">🎯 برنامج</button>
        </div>

        <!-- Subject Tabs (for special items) -->
        <div id="subjectTabsContainer" style="display:none">
          <div class="card-title" style="font-size:13px;color:#64748b;margin-bottom:8px">المادة</div>
          <div class="subject-tabs" id="subjectTabs"></div>
        </div>

        <div class="card-title" style="font-size:14px;color:#64748b;margin-bottom:8px">③ اختر البند</div>
        <div class="action-items" id="actionItemsList">
          <div class="loading-spinner"></div>
        </div>

        <textarea class="note-input" id="actionNote" rows="2" placeholder="ملاحظة (اختياري)..."></textarea>
        <button class="submit-btn reward" id="submitActionBtn" onclick="submitAction()" disabled>تطبيق الإجراء</button>
        <div class="msg-box" id="actionMsg"></div>
      </div>
    </div>

    <!-- LEAVE PASSES PAGE -->
    <div id="page-leavePasses" class="page" style="display:none">
      <div class="section-title">الاستئذانات</div>
      <div id="leavePassesList">
        <div class="loading-spinner"></div>
      </div>
    </div>

    <!-- LESSON ATTENDANCE PAGE -->
    <div id="page-lessonAttendance" class="page" style="display:none">
      <div class="section-title">تحضير الحصص</div>
      <div id="lessonAttendanceContent">
        <div class="loading-spinner"></div>
      </div>
    </div>

    <!-- NOTIFICATIONS PAGE -->
    <div id="page-notifications" class="page" style="display:none">
      <div class="section-title">التنبيهات</div>
      <div id="notificationsList">
        <div class="loading-spinner"></div>
      </div>
    </div>

  </div>

  <!-- ===== BOTTOM NAV ===== -->
  <div id="bottomNav" style="display:none">
    <button class="nav-item active" id="nav-dashboard" onclick="showPage('dashboard')">
      <span class="nav-icon">🏠</span>
      <span class="nav-label">الرئيسية</span>
    </button>
    <button class="nav-item" id="nav-actions" onclick="showPage('actions')">
      <span class="nav-icon">⚡</span>
      <span class="nav-label">الإجراءات</span>
    </button>
    <button class="nav-item" id="nav-leavePasses" onclick="showPage('leavePasses')">
      <span class="nav-icon">📋</span>
      <span class="nav-label">الاستئذانات</span>
      <span class="nav-badge hidden" id="navLeaveBadge">0</span>
    </button>
    <button class="nav-item" id="nav-lessonAttendance" onclick="showPage('lessonAttendance')">
      <span class="nav-icon">📚</span>
      <span class="nav-label">التحضير</span>
      <span class="nav-badge hidden" id="navLessonBadge">0</span>
    </button>
    <button class="nav-item" id="nav-notifications" onclick="showPage('notifications')">
      <span class="nav-icon">🔔</span>
      <span class="nav-label">التنبيهات</span>
      <span class="nav-badge hidden" id="navNotifBadge">0</span>
    </button>
  </div>

</div>

<script>
// ===== STATE =====
const TOKEN_KEY = 'teacher-portal-token-v1';
const NOTIF_READ_KEY = 'teacher-portal-notif-read-v1';
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
let lastNotifCount = 0;

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
  setTimeout(() => el.classList.remove('show'), 3500);
}

// ===== LOGIN =====
async function doLogin() {
  const username = $('loginUsername').value.trim();
  const password = $('loginPassword').value;
  if (!username || !password) { showLoginError('أدخل اسم المستخدم وكلمة المرور.'); return; }
  hideLoginError();
  const btn = $('loginBtn');
  btn.disabled = true;
  btn.textContent = 'جارٍ الدخول...';
  try {
    const data = await api('/api/auth/login', { method: 'POST', body: { username, password } });
    setToken(data.token);
    await loadBootstrap();
  } catch(e) {
    showLoginError(e.message || 'بيانات الدخول غير صحيحة.');
  } finally {
    btn.disabled = false;
    btn.textContent = 'دخول';
  }
}

$('loginPassword').addEventListener('keydown', (e) => { if (e.key === 'Enter') doLogin(); });
$('loginUsername').addEventListener('keydown', (e) => { if (e.key === 'Enter') $('loginPassword').focus(); });

// ===== LOGOUT =====
async function doLogout() {
  try { await api('/api/auth/logout', { method: 'POST' }); } catch(e) {}
  clearToken();
  currentUser = null;
  sharedState = null;
  selectedSchool = null;
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
    // التحقق من أن المستخدم معلم أو مشرف أو مدير
    const allowedRoles = ['teacher', 'supervisor', 'principal', 'superadmin'];
    if (!allowedRoles.includes(currentUser.role)) {
      clearToken();
      showLoginError('هذه البوابة مخصصة للمعلمين فقط.');
      return;
    }
    // اختيار المدرسة
    selectedSchool = (sharedState.schools || []).find((s) => s.id === currentUser.schoolId) || sharedState.schools?.[0] || null;
    // إخفاء شاشة الدخول وإظهار التطبيق
    $('loginScreen').style.display = 'none';
    $('header').style.display = 'flex';
    $('mainContent').style.display = 'block';
    $('bottomNav').style.display = 'flex';
    // تحديث الهيدر
    $('headerTitle').textContent = currentUser.name || currentUser.username || 'المعلم';
    $('headerSub').textContent = selectedSchool?.name || 'المدرسة';
    // تحميل البيانات
    buildStudentList();
    renderDashboard();
    showPage('dashboard');
    // بدء polling
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
  }, 15000);
}

// ===== PAGE NAVIGATION =====
function showPage(page) {
  activePage = page;
  // إخفاء كل الصفحات
  document.querySelectorAll('.page').forEach((p) => p.style.display = 'none');
  // إظهار الصفحة المطلوبة
  const pageEl = $('page-' + page);
  if (pageEl) pageEl.style.display = 'block';
  // تحديث الـ nav
  document.querySelectorAll('.nav-item').forEach((n) => n.classList.remove('active'));
  const navEl = $('nav-' + page);
  if (navEl) navEl.classList.add('active');
  // تحميل محتوى الصفحة
  if (page === 'leavePasses') renderLeavePasses();
  if (page === 'lessonAttendance') renderLessonAttendance();
  if (page === 'notifications') { renderNotifications(); markNotifsRead(); }
  if (page === 'dashboard') renderDashboard();
  if (page === 'actions') { renderActionItems(); }
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
  // من structure
  if (school.structure && Array.isArray(school.structure.classrooms)) {
    school.structure.classrooms.forEach((classroom) => {
      (classroom.students || []).forEach((student) => {
        students.push({
          id: student.id,
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
  // من companies
  if (Array.isArray(school.companies)) {
    school.companies.forEach((company) => {
      (company.students || []).forEach((student) => {
        if (students.find((s) => String(s.id) === String(student.id))) return; // تجنب التكرار
        students.push({
          id: student.id,
          name: student.name || student.fullName || '—',
          studentNumber: student.studentNumber || '',
          className: company.name || '—',
          companyId: company.id,
          points: student.points || 0,
          source: 'company',
        });
      });
    });
  }
  return students.filter((s) => s.name && s.name !== '—');
}

function filterStudents() {
  const q = ($('studentSearch')?.value || '').trim().toLowerCase();
  filteredStudents = q
    ? allStudents.filter((s) => s.name.toLowerCase().includes(q) || (s.studentNumber || '').includes(q) || s.className.toLowerCase().includes(q))
    : allStudents.slice(0, 50);
  renderStudentList();
}

function renderStudentList() {
  const container = $('studentList');
  if (!container) return;
  if (!filteredStudents.length) {
    container.innerHTML = '<div class="empty-state"><div class="empty-icon">🔍</div><div class="empty-text">لا توجد نتائج</div></div>';
    return;
  }
  container.innerHTML = filteredStudents.map((s) => \`
    <div class="student-item \${selectedStudent?.id === s.id ? 'selected' : ''}" onclick="selectStudent('\${s.id}')">
      <div>
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
  $('actionNote').value = '';
  $('actionMsg').classList.remove('show');
}

// ===== ACTION TYPE =====
function setActionType(type) {
  actionType = type;
  selectedActionItem = null;
  // تحديث الـ tabs
  ['reward','violation','program'].forEach((t) => {
    const tab = $('tab' + t.charAt(0).toUpperCase() + t.slice(1));
    if (tab) tab.className = 'type-tab' + (t === type ? ' active-' + t : '');
  });
  // تحديث زر الإرسال
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
  // البنود التخصصية للمعلم
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
  // إظهار/إخفاء تبويبات المواد
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
    container.innerHTML = '<div class="empty-state"><div class="empty-icon">📝</div><div class="empty-text">لا توجد بنود</div></div>';
    return;
  }
  container.innerHTML = displayItems.map((item) => {
    const pts = Number(item.points || 0);
    const ptsClass = actionType === 'reward' ? 'pts-reward' : actionType === 'violation' ? 'pts-violation' : 'pts-program';
    const ptsText = pts > 0 ? '+' + pts : String(pts);
    const scopeBadge = item.scope === 'special' ? '<span style="font-size:10px;background:#ede9fe;color:#7c3aed;padding:2px 6px;border-radius:10px;margin-right:6px">تخصصي</span>' : '';
    return \`
      <div class="action-item \${selectedActionItem?.id === item.id ? 'selected' : ''}" onclick="selectActionItem('\${item.id}', '\${item.scope || 'global'}')">
        <div>
          <div class="action-item-title">\${scopeBadge}\${item.title}</div>
          \${item.description ? '<div style="font-size:12px;color:#64748b;margin-top:2px">' + item.description + '</div>' : ''}
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
  // تحديث تبويبات المواد
  document.querySelectorAll('.subject-tab').forEach((tab) => {
    tab.classList.toggle('active', tab.textContent === subject);
  });
}

function selectActionItem(id, scope) {
  const items = getActionItems(actionType);
  selectedActionItem = items.find((item) => String(item.id) === String(id) && (item.scope || 'global') === scope) || null;
  if (!selectedActionItem) return;
  // تحديث UI
  document.querySelectorAll('.action-item').forEach((el) => el.classList.remove('selected'));
  event.currentTarget.classList.add('selected');
  const btn = $('submitActionBtn');
  if (btn) btn.disabled = false;
}

// ===== SUBMIT ACTION =====
async function submitAction() {
  if (!selectedStudent || !selectedActionItem || !selectedSchool) return;
  const btn = $('submitActionBtn');
  btn.disabled = true;
  btn.textContent = 'جارٍ التطبيق...';
  const note = $('actionNote')?.value?.trim() || '';
  try {
    const body = {
      studentId: selectedStudent.id,
      actionId: selectedActionItem.id,
      actionTitle: selectedActionItem.title,
      actionType: actionType === 'reward' ? 'reward' : actionType === 'violation' ? 'violation' : 'program',
      deltaPoints: Number(selectedActionItem.points || 0),
      note,
      actorName: currentUser.name || currentUser.username,
      actorRole: currentUser.role,
    };
    const data = await api('/api/schools/' + selectedSchool.id + '/actions/apply', { method: 'POST', body });
    if (data.ok) {
      sharedState = data.state || sharedState;
      selectedSchool = (sharedState.schools || []).find((s) => s.id === currentUser.schoolId) || selectedSchool;
      buildStudentList();
      showMsg('actionMsg', '✅ ' + (data.message || 'تم تطبيق الإجراء بنجاح.'), 'success');
      $('actionNote').value = '';
      selectedActionItem = null;
      btn.disabled = true;
      // تحديث نقاط الطالب في القائمة
      const updatedStudent = allStudents.find((s) => String(s.id) === String(selectedStudent.id));
      if (updatedStudent && data.student) {
        updatedStudent.points = data.student.points || updatedStudent.points;
        $('selectedStudentInfo').textContent = updatedStudent.className + ' • ' + (updatedStudent.points || 0) + ' نقطة';
      }
    } else {
      showMsg('actionMsg', '❌ ' + (data.message || 'فشل تطبيق الإجراء.'), 'error');
    }
  } catch(e) {
    showMsg('actionMsg', '❌ ' + (e.message || 'حدث خطأ.'), 'error');
  } finally {
    setActionType(actionType);
  }
}

// ===== LEAVE PASSES =====
function getLeavePasses() {
  if (!selectedSchool || !currentUser) return [];
  const passes = Array.isArray(selectedSchool.leavePasses) ? selectedSchool.leavePasses : [];
  // المعلم يرى فقط الاستئذانات المرسلة إليه
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
  // ترتيب: الجديدة أولاً
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
        \${item.note ? '<div style="font-size:12px;color:#64748b;margin-top:4px">ملاحظة: ' + item.note + '</div>' : ''}
        <div class="leave-time">⏰ \${createdAt}</div>
        <div class="leave-actions">
          \${isNew ? '<button class="leave-btn view" onclick="markLeaveViewed(&quot;' + item.id + '&quot;)">✅ اطلعت</button>' : ''}
          \${item.passLink ? '<button class="leave-btn view" onclick="window.open(&quot;' + item.passLink + '&quot;, &quot;_blank&quot;)">🔗 رابط الاستئذان</button>' : ''}
        </div>
      </div>
    \`;
  }).join('');
}

async function markLeaveViewed(leavePassId) {
  if (!selectedSchool || !currentUser) return;
  // تحديث محلي
  const passes = Array.isArray(selectedSchool.leavePasses) ? selectedSchool.leavePasses : [];
  const updatedPasses = passes.map((item) => {
    if (String(item.id) !== String(leavePassId)) return item;
    if (String(item.teacherUserId || '') !== String(currentUser.id)) return item;
    const nextStatus = ['created','sent-system','sent-manual'].includes(item.status) ? 'viewed' : item.status;
    return { ...item, status: nextStatus, viewedAt: new Date().toISOString(), viewedByName: currentUser.name || currentUser.username };
  });
  selectedSchool = { ...selectedSchool, leavePasses: updatedPasses };
  sharedState = {
    ...sharedState,
    schools: (sharedState.schools || []).map((s) => s.id === selectedSchool.id ? selectedSchool : s),
  };
  // حفظ على الخادم
  try {
    await api('/api/state/save', { method: 'POST', body: { state: sharedState } });
  } catch(e) {}
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
    // التحقق من أن المعلم مدعو أو أن الجلسة مفتوحة لجميع المعلمين
    const invites = Array.isArray(session.teacherInvites) ? session.teacherInvites : [];
    if (!invites.length) return true; // مفتوحة للجميع
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

let lessonState = { selectedSessionId: null, selectedClassKey: null, absentIds: new Set(), acknowledged: false };

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
  const sessionLabel = selectedSession ? (selectedSession.label || selectedSession.subject || 'جلسة تحضير') : '—';
  let html = \`
    <div class="card-title" style="font-size:14px;color:#64748b;margin-bottom:8px">اختر الجلسة</div>
    <select class="session-select" id="sessionSelect" onchange="changeSession(this.value)">
      \${sessions.map((s) => '<option value="' + s.id + '"' + (String(s.id) === String(lessonState.selectedSessionId) ? ' selected' : '') + '>' + (s.label || s.subject || 'جلسة') + ' — ' + (s.date || '') + '</option>').join('')}
    </select>
    <div class="card-title" style="font-size:14px;color:#64748b;margin-bottom:8px">اختر الفصل</div>
    <select class="class-select" id="classSelect" onchange="changeClass(this.value)">
      \${classrooms.map((c) => '<option value="' + getClassroomKey(c) + '"' + (getClassroomKey(c) === lessonState.selectedClassKey ? ' selected' : '') + '>' + c.name + ' (' + c.studentsCount + ' طالب)</option>').join('')}
    </select>
  \`;
  if (existingSubmission && !lessonState.resubmit) {
    html += \`
      <div class="submitted-badge">✅ تم اعتماد التحضير لهذا الفصل في هذه الجلسة</div>
      <div style="font-size:13px;color:#64748b;margin-bottom:12px">الغائبون: \${existingSubmission.absentCount || 0} • الحاضرون: \${existingSubmission.presentCount || 0}</div>
      <button class="submit-btn blue" onclick="enableResubmit()">إعادة التحضير</button>
    \`;
  } else {
    if (!students.length) {
      html += '<div class="empty-state"><div class="empty-icon">👥</div><div class="empty-text">لا يوجد طلاب في هذا الفصل</div></div>';
    } else {
      html += \`
        <div class="card-title" style="font-size:14px;color:#64748b;margin-bottom:8px">الطلاب (انقر على الغائبين)</div>
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
        <div style="font-size:13px;color:#64748b;margin-top:8px;margin-bottom:4px">
          الغائبون: <strong>\${lessonState.absentIds.size}</strong> • الحاضرون: <strong>\${students.length - lessonState.absentIds.size}</strong>
        </div>
        <button class="submit-btn blue" id="submitLessonBtn" onclick="submitLessonAttendance()">اعتماد التحضير</button>
        <div class="msg-box" id="lessonMsg"></div>
      \`;
    }
  }
  container.innerHTML = html;
}

function changeSession(id) {
  lessonState.selectedSessionId = id;
  lessonState.absentIds = new Set();
  lessonState.acknowledged = false;
  lessonState.resubmit = false;
  renderLessonAttendance();
}

function changeClass(key) {
  lessonState.selectedClassKey = key;
  lessonState.absentIds = new Set();
  lessonState.acknowledged = false;
  lessonState.resubmit = false;
  renderLessonAttendance();
}

function toggleAbsent(studentId) {
  const id = String(studentId);
  if (lessonState.absentIds.has(id)) lessonState.absentIds.delete(id);
  else lessonState.absentIds.add(id);
  renderLessonAttendance();
}

function toggleAck() {
  lessonState.acknowledged = !lessonState.acknowledged;
  renderLessonAttendance();
}

function enableResubmit() {
  lessonState.resubmit = true;
  lessonState.absentIds = new Set();
  lessonState.acknowledged = false;
  renderLessonAttendance();
}

async function submitLessonAttendance() {
  if (!selectedSchool || !currentUser || !lessonState.selectedSessionId || !lessonState.selectedClassKey) return;
  const btn = $('submitLessonBtn');
  if (btn) { btn.disabled = true; btn.textContent = 'جارٍ الاعتماد...'; }
  const sessions = getLessonSessions();
  const session = sessions.find((s) => String(s.id) === String(lessonState.selectedSessionId));
  if (!session) { showMsg('lessonMsg', '❌ الجلسة غير موجودة.', 'error'); if (btn) { btn.disabled = false; btn.textContent = 'اعتماد التحضير'; } return; }
  const classrooms = getClassrooms();
  const classRow = classrooms.find((c) => getClassroomKey(c) === lessonState.selectedClassKey);
  const students = getStudentsForClassroom(lessonState.selectedClassKey);
  if (!classRow || !students.length) { showMsg('lessonMsg', '❌ الفصل لا يحتوي طلاباً.', 'error'); if (btn) { btn.disabled = false; btn.textContent = 'اعتماد التحضير'; } return; }
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
  // تحديث الـ state محلياً
  const updatedSessions = (selectedSchool.lessonAttendanceSessions || []).map((s) => {
    if (String(s.id) !== String(lessonState.selectedSessionId)) return s;
    const existing = (s.submissions || []).filter((sub) => !(String(sub.teacherId) === String(currentUser.id) && String(sub.classKey) === String(lessonState.selectedClassKey)));
    return { ...s, submissions: [submission, ...existing] };
  });
  selectedSchool = { ...selectedSchool, lessonAttendanceSessions: updatedSessions };
  sharedState = { ...sharedState, schools: (sharedState.schools || []).map((s) => s.id === selectedSchool.id ? selectedSchool : s) };
  // حفظ على الخادم
  try {
    await api('/api/state/save', { method: 'POST', body: { state: sharedState } });
    showMsg('lessonMsg', '✅ تم اعتماد التحضير بنجاح.', 'success');
    lessonState.resubmit = false;
    setTimeout(() => renderLessonAttendance(), 1500);
  } catch(e) {
    showMsg('lessonMsg', '❌ ' + (e.message || 'فشل الحفظ.'), 'error');
    if (btn) { btn.disabled = false; btn.textContent = 'اعتماد التحضير'; }
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
  $('notifBadge').classList.add('hidden');
  $('navNotifBadge').classList.add('hidden');
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
        <div class="notif-title">\${note.title || 'تنبيه'}</div>
        <div class="notif-body">\${note.body || ''}</div>
        <div class="notif-time">\${note.time || ''}</div>
      </div>
    \`;
  }).join('');
}

// ===== DASHBOARD =====
function renderDashboard() {
  if (!currentUser || !sharedState) return;
  $('dashName').textContent = 'أهلاً، ' + (currentUser.name || currentUser.username || 'المعلم');
  $('dashSchool').textContent = selectedSchool?.name || 'المدرسة';
  // حساب الإجراءات
  const actionLog = Array.isArray(sharedState.actionLog) ? sharedState.actionLog : [];
  const myActions = actionLog.filter((item) => String(item.actorId || item.actorName || '') === String(currentUser.id || currentUser.name || ''));
  const rewards = myActions.filter((item) => item.actionType === 'reward').length;
  const violations = myActions.filter((item) => item.actionType === 'violation').length;
  const programs = myActions.filter((item) => item.actionType === 'program').length;
  const specialPoints = myActions.reduce((sum, item) => sum + (item.actionType !== 'violation' ? Math.abs(Number(item.deltaPoints || 0)) : 0), 0);
  $('dashPoints').textContent = specialPoints;
  $('dashRewards').textContent = rewards;
  $('dashViolations').textContent = violations;
  $('dashPrograms').textContent = programs;
  // الاستئذانات
  const passes = getLeavePasses();
  const newPasses = passes.filter((p) => ['created','sent-system','sent-manual'].includes(p.status)).length;
  $('dashLeaveCount').textContent = newPasses > 0 ? newPasses + ' طلب جديد' : (passes.length > 0 ? passes.length + ' طلب' : 'لا يوجد طلبات');
  // جلسات التحضير
  const sessions = getSessionsForTeacher();
  $('dashSessionCount').textContent = sessions.length > 0 ? sessions.length + ' جلسة نشطة' : 'لا توجد جلسات';
  // التنبيهات
  const notifs = getTeacherNotifications();
  $('dashNotifCount').textContent = notifs.length > 0 ? notifs.length + ' تنبيه' : 'لا يوجد تنبيهات';
  // آخر الإجراءات
  const recentActions = myActions.slice(-5).reverse();
  const recentContainer = $('dashRecentActions');
  if (recentContainer) {
    if (!recentActions.length) {
      recentContainer.innerHTML = '<div class="empty-state"><div class="empty-icon">📝</div><div class="empty-text">لا توجد إجراءات حديثة</div></div>';
    } else {
      recentContainer.innerHTML = recentActions.map((item) => {
        const icon = item.actionType === 'reward' ? '🏆' : item.actionType === 'violation' ? '⚠️' : '🎯';
        const color = item.actionType === 'reward' ? '#15803d' : item.actionType === 'violation' ? '#be123c' : '#7c3aed';
        return \`<div style="display:flex;align-items:center;gap:10px;padding:10px 0;border-bottom:1px solid #f1f5f9">
          <span style="font-size:20px">\${icon}</span>
          <div style="flex:1">
            <div style="font-size:14px;font-weight:700;color:#0f172a">\${item.actionTitle || '—'}</div>
            <div style="font-size:12px;color:#64748b">\${item.student || item.studentName || '—'} • \${item.isoDate || ''}</div>
          </div>
          <div style="font-size:14px;font-weight:800;color:\${color}">\${Number(item.deltaPoints || 0) > 0 ? '+' : ''}\${item.deltaPoints || 0}</div>
        </div>\`;
      }).join('');
    }
  }
  updateBadges();
}

// ===== UPDATE BADGES =====
function updateBadges() {
  // الاستئذانات
  const passes = getLeavePasses();
  const newPasses = passes.filter((p) => ['created','sent-system','sent-manual'].includes(p.status)).length;
  const leaveBadge = $('navLeaveBadge');
  if (leaveBadge) {
    if (newPasses > 0) { leaveBadge.textContent = newPasses; leaveBadge.classList.remove('hidden'); }
    else leaveBadge.classList.add('hidden');
  }
  // جلسات التحضير
  const sessions = getSessionsForTeacher();
  const pendingSessions = sessions.filter((s) => {
    const mySubmission = (s.submissions || []).find((sub) => String(sub.teacherId) === String(currentUser.id));
    return !mySubmission;
  }).length;
  const lessonBadge = $('navLessonBadge');
  if (lessonBadge) {
    if (pendingSessions > 0) { lessonBadge.textContent = pendingSessions; lessonBadge.classList.remove('hidden'); }
    else lessonBadge.classList.add('hidden');
  }
  // التنبيهات
  const notifs = getTeacherNotifications();
  let lastReadAt = '';
  try { lastReadAt = localStorage.getItem(NOTIF_READ_KEY) || ''; } catch(e) {}
  const unreadNotifs = lastReadAt ? notifs.filter((n) => (n.time || '') > lastReadAt).length : notifs.length;
  const notifBadge = $('notifBadge');
  const navNotifBadge = $('navNotifBadge');
  if (notifBadge) {
    if (unreadNotifs > 0 && activePage !== 'notifications') { notifBadge.textContent = unreadNotifs > 99 ? '99+' : unreadNotifs; notifBadge.classList.remove('hidden'); }
    else notifBadge.classList.add('hidden');
  }
  if (navNotifBadge) {
    if (unreadNotifs > 0 && activePage !== 'notifications') { navNotifBadge.textContent = unreadNotifs > 99 ? '99+' : unreadNotifs; navNotifBadge.classList.remove('hidden'); }
    else navNotifBadge.classList.add('hidden');
  }
}

// ===== INIT =====
(async function init() {
  const token = getToken();
  if (token) {
    try {
      await loadBootstrap();
    } catch(e) {
      clearToken();
    }
  }
})();

/* ===== PWA: Service Worker Registration ===== */
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/public/teacher-sw.js', { scope: '/teacher' })
      .then(reg => console.log('[PWA] Teacher SW registered:', reg.scope))
      .catch(err => console.warn('[PWA] Teacher SW registration failed:', err));
  });
}

/* ===== PWA: Install Banner ===== */
let deferredPrompt = null;
window.addEventListener('beforeinstallprompt', (e) => {
  e.preventDefault();
  deferredPrompt = e;
});
window.addEventListener('appinstalled', () => {
  deferredPrompt = null;
});
</script>
</body>
</html>
`;
}

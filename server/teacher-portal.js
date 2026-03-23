// teacher-portal.js
// بوابة المعلم - نسخة محسّنة بتصميم يتطابق مع الموقع الرئيسي

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
  <meta name="theme-color" content="#0369a1" />
  <meta name="mobile-web-app-capable" content="yes" />
  <meta name="apple-mobile-web-app-capable" content="yes" />
  <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
  <meta name="apple-mobile-web-app-title" content="بوابة المعلم" />
  <link rel="apple-touch-icon" href="/public/pwa-icon-192.png" />
  <link rel="icon" type="image/png" href="/public/pwa-icon-192.png" />
  <style>
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    html, body { height: 100%; font-family: 'Tajawal', system-ui, sans-serif; background: #f8fafc; color: #0f172a; -webkit-font-smoothing: antialiased; -webkit-tap-highlight-color: transparent; }
    #app { display: flex; flex-direction: column; min-height: 100dvh; }
    button, input, select, textarea { font: inherit; }

    /* ===== LOGIN ===== */
    #loginScreen {
      display: flex; flex-direction: column; align-items: center; justify-content: center;
      min-height: 100dvh; padding: 24px;
      background: linear-gradient(135deg, #0c4a6e 0%, #0369a1 50%, #0284c7 100%);
    }
    .login-card { background: white; border-radius: 28px; padding: 32px 24px; width: 100%; max-width: 400px; box-shadow: 0 25px 50px rgba(0,0,0,0.25); }
    .login-logo { text-align: center; margin-bottom: 24px; }
    .login-logo-icon { width: 64px; height: 64px; border-radius: 20px; background: linear-gradient(135deg, #0369a1, #0284c7); display: inline-flex; align-items: center; justify-content: center; font-size: 28px; margin-bottom: 12px; }
    .login-title { font-size: 22px; font-weight: 900; color: #0f172a; }
    .login-sub { font-size: 13px; color: #64748b; margin-top: 4px; }
    .form-group { margin-bottom: 16px; }
    .form-label { display: block; font-size: 13px; font-weight: 700; color: #374151; margin-bottom: 6px; }
    .form-input { width: 100%; padding: 12px 14px; border-radius: 14px; border: 1.5px solid #e2e8f0; background: #f8fafc; font-size: 14px; color: #0f172a; outline: none; transition: border-color 0.15s; }
    .form-input:focus { border-color: #0369a1; background: white; }
    .btn-login { width: 100%; padding: 14px; border-radius: 14px; border: none; cursor: pointer; background: #0369a1; color: white; font-size: 15px; font-weight: 800; transition: background 0.15s; display: flex; align-items: center; justify-content: center; gap: 8px; }
    .btn-login:hover { background: #075985; }
    .btn-login:disabled { background: #94a3b8; cursor: not-allowed; }
    .login-error { margin-top: 12px; padding: 10px 14px; border-radius: 12px; background: #fef2f2; border: 1px solid #fecaca; color: #dc2626; font-size: 13px; font-weight: 700; display: none; }

    /* ===== MAIN WRAPPER ===== */
    #mainWrapper { display: none; flex-direction: column; min-height: 100dvh; }

    /* ===== TOP BAR ===== */
    #topBar { position: sticky; top: 0; z-index: 50; background: white; border-bottom: 1px solid #e2e8f0; padding: 0 16px; height: 60px; display: flex; align-items: center; justify-content: space-between; gap: 12px; box-shadow: 0 1px 4px rgba(0,0,0,0.06); }
    .topbar-brand { display: flex; align-items: center; gap: 10px; }
    .topbar-icon { width: 36px; height: 36px; border-radius: 10px; background: linear-gradient(135deg, #0369a1, #0284c7); display: flex; align-items: center; justify-content: center; font-size: 16px; color: white; flex-shrink: 0; }
    .topbar-name { font-size: 14px; font-weight: 800; color: #0f172a; }
    .topbar-school { font-size: 11px; color: #64748b; }
    .topbar-actions { display: flex; align-items: center; gap: 8px; }
    .topbar-btn { padding: 7px 12px; border-radius: 10px; border: 1px solid #e2e8f0; background: #f8fafc; color: #374151; font-size: 13px; font-weight: 700; cursor: pointer; display: flex; align-items: center; gap: 4px; transition: all 0.15s; position: relative; }
    .topbar-btn:hover { background: #f1f5f9; }
    .topbar-badge { position: absolute; top: -4px; right: -4px; min-width: 16px; height: 16px; background: #dc2626; color: white; border-radius: 999px; font-size: 10px; font-weight: 800; display: flex; align-items: center; justify-content: center; padding: 0 4px; }
    .topbar-badge.hidden { display: none; }
    .logout-btn { padding: 7px 12px; border-radius: 10px; border: 1px solid #fecaca; background: #fef2f2; color: #dc2626; font-size: 12px; font-weight: 700; cursor: pointer; }

    /* ===== MAIN CONTENT ===== */
    #mainContent { flex: 1; overflow-y: auto; padding: 16px; padding-bottom: 80px; }

    /* ===== BOTTOM NAV ===== */
    #bottomNav { position: fixed; bottom: 0; left: 0; right: 0; z-index: 50; background: white; border-top: 1px solid #e2e8f0; display: flex; height: 64px; box-shadow: 0 -2px 12px rgba(0,0,0,0.06); }
    .nav-item { flex: 1; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 3px; border: none; background: transparent; cursor: pointer; padding: 8px 4px; color: #94a3b8; transition: color 0.15s; position: relative; }
    .nav-item.active { color: #0369a1; }
    .nav-icon { font-size: 20px; line-height: 1; }
    .nav-label { font-size: 10px; font-weight: 700; }
    .nav-badge { position: absolute; top: 6px; right: calc(50% - 16px); min-width: 16px; height: 16px; background: #dc2626; color: white; border-radius: 999px; font-size: 10px; font-weight: 800; display: flex; align-items: center; justify-content: center; padding: 0 4px; }
    .nav-badge.hidden { display: none; }

    /* ===== PAGES ===== */
    .page { display: none; }
    .page.active { display: block; }

    /* ===== CARDS ===== */
    .card { background: white; border-radius: 24px; padding: 20px; box-shadow: 0 1px 3px rgba(0,0,0,0.05); border: 1px solid #f1f5f9; margin-bottom: 12px; }
    .card-title { font-size: 15px; font-weight: 800; color: #0f172a; margin-bottom: 12px; }

    /* ===== BADGE ===== */
    .badge { display: inline-flex; align-items: center; padding: 3px 10px; border-radius: 999px; font-size: 11px; font-weight: 800; }
    .badge-green { background: #d1fae5; color: #065f46; }
    .badge-rose { background: #fee2e2; color: #9f1239; }
    .badge-sky { background: #e0f2fe; color: #0369a1; }
    .badge-amber { background: #fef3c7; color: #92400e; }
    .badge-slate { background: #f1f5f9; color: #334155; }

    /* ===== DASHBOARD ===== */
    .hero-card { background: linear-gradient(135deg, #0c4a6e 0%, #0369a1 60%, #0284c7 100%); border-radius: 28px; padding: 24px; color: white; margin-bottom: 12px; }
    .hero-greeting { font-size: 13px; font-weight: 700; opacity: 0.8; }
    .hero-name { font-size: 22px; font-weight: 900; margin-top: 4px; }
    .hero-school { font-size: 12px; opacity: 0.75; margin-top: 4px; }
    .hero-stats { display: flex; gap: 8px; margin-top: 16px; }
    .hero-stat { flex: 1; background: rgba(255,255,255,0.15); border-radius: 16px; padding: 12px; text-align: center; border: 1px solid rgba(255,255,255,0.1); }
    .hero-stat-val { font-size: 22px; font-weight: 900; }
    .hero-stat-lbl { font-size: 10px; opacity: 0.8; margin-top: 2px; font-weight: 700; }

    .points-card { background: linear-gradient(135deg, #1e1b4b 0%, #4c1d95 60%, #6d28d9 100%); border-radius: 24px; padding: 20px; color: white; margin-bottom: 12px; }
    .points-card-title { font-size: 12px; font-weight: 700; opacity: 0.8; margin-bottom: 12px; }
    .points-row { display: flex; gap: 8px; }
    .points-box { flex: 1; background: rgba(255,255,255,0.12); border-radius: 14px; padding: 12px; text-align: center; border: 1px solid rgba(255,255,255,0.1); }
    .points-box-val { font-size: 24px; font-weight: 900; }
    .points-box-lbl { font-size: 10px; opacity: 0.75; margin-top: 2px; font-weight: 700; }

    .company-card { background: linear-gradient(135deg, #064e3b 0%, #065f46 60%, #059669 100%); border-radius: 24px; padding: 20px; color: white; margin-bottom: 12px; }
    .company-card-title { font-size: 12px; font-weight: 700; opacity: 0.8; margin-bottom: 8px; }
    .company-name-big { font-size: 18px; font-weight: 900; }
    .company-stats { display: flex; gap: 8px; margin-top: 12px; }
    .company-stat { flex: 1; background: rgba(255,255,255,0.15); border-radius: 14px; padding: 10px; text-align: center; border: 1px solid rgba(255,255,255,0.1); }
    .company-stat-val { font-size: 20px; font-weight: 900; }
    .company-stat-lbl { font-size: 10px; opacity: 0.8; margin-top: 2px; font-weight: 700; }

    .quick-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 12px; }
    .quick-card { background: white; border-radius: 20px; padding: 16px; cursor: pointer; border: 1px solid #f1f5f9; transition: all 0.15s; position: relative; overflow: hidden; }
    .quick-card:hover { border-color: #bae6fd; background: #f0f9ff; }
    .quick-card:active { transform: scale(0.97); }
    .quick-card-icon { font-size: 24px; margin-bottom: 8px; }
    .quick-card-label { font-size: 13px; font-weight: 800; color: #0f172a; }
    .quick-card-sub { font-size: 11px; color: #64748b; margin-top: 3px; }
    .quick-card-badge { position: absolute; top: 10px; left: 10px; min-width: 20px; height: 20px; background: #dc2626; color: white; border-radius: 999px; font-size: 11px; font-weight: 800; display: flex; align-items: center; justify-content: center; padding: 0 5px; }
    .quick-card-badge.hidden { display: none; }

    .recent-action { display: flex; align-items: center; gap: 12px; padding: 12px; border-radius: 16px; background: #f8fafc; border: 1px solid #f1f5f9; margin-bottom: 8px; }
    .recent-action-icon { width: 40px; height: 40px; border-radius: 12px; display: flex; align-items: center; justify-content: center; font-size: 18px; flex-shrink: 0; }
    .recent-action-info { flex: 1; min-width: 0; }
    .recent-action-title { font-size: 13px; font-weight: 700; color: #0f172a; }
    .recent-action-sub { font-size: 11px; color: #64748b; margin-top: 2px; }
    .recent-action-pts { font-size: 14px; font-weight: 900; flex-shrink: 0; }

    /* ===== ACTIONS PAGE ===== */
    .page-header { margin-bottom: 16px; }
    .page-header-title { font-size: 20px; font-weight: 900; color: #0f172a; }
    .page-header-sub { font-size: 13px; color: #64748b; margin-top: 4px; }

    .steps-row { display: flex; align-items: center; gap: 6px; margin-bottom: 20px; }
    .step-dot { width: 28px; height: 28px; border-radius: 999px; border: 2px solid #e2e8f0; display: flex; align-items: center; justify-content: center; font-size: 11px; font-weight: 800; color: #94a3b8; flex-shrink: 0; }
    .step-dot.active { border-color: #0369a1; background: #0369a1; color: white; }
    .step-dot.done { border-color: #059669; background: #059669; color: white; }
    .step-line { flex: 1; height: 2px; background: #e2e8f0; }
    .step-line.done { background: #059669; }

    .action-type-grid { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 10px; margin-bottom: 16px; }
    .action-type-card { border-radius: 20px; padding: 20px 10px; cursor: pointer; border: 2px solid #e2e8f0; background: white; text-align: center; transition: all 0.15s; }
    .action-type-card:hover { transform: translateY(-2px); box-shadow: 0 4px 12px rgba(0,0,0,0.08); }
    .action-type-card.sel-reward { border-color: #059669; background: #d1fae5; }
    .action-type-card.sel-violation { border-color: #dc2626; background: #fee2e2; }
    .action-type-card.sel-program { border-color: #0369a1; background: #e0f2fe; }
    .action-type-icon { font-size: 32px; margin-bottom: 8px; }
    .action-type-label { font-size: 13px; font-weight: 800; color: #0f172a; }

    .identify-methods { display: flex; gap: 8px; margin-bottom: 16px; }
    .identify-btn { flex: 1; padding: 12px 8px; border-radius: 16px; border: 2px solid #e2e8f0; background: white; cursor: pointer; text-align: center; transition: all 0.15s; }
    .identify-btn.active { border-color: #0369a1; background: #e0f2fe; }
    .identify-btn-icon { font-size: 22px; margin-bottom: 4px; }
    .identify-btn-label { font-size: 11px; font-weight: 800; color: #374151; }

    .search-wrap { position: relative; margin-bottom: 10px; }
    .search-icon { position: absolute; right: 12px; top: 50%; transform: translateY(-50%); font-size: 16px; color: #94a3b8; }
    .search-input { width: 100%; padding: 11px 40px 11px 14px; border-radius: 14px; border: 1.5px solid #e2e8f0; background: #f8fafc; font-size: 14px; outline: none; transition: border-color 0.15s; }
    .search-input:focus { border-color: #0369a1; background: white; }

    .student-list { display: flex; flex-direction: column; gap: 6px; max-height: calc(100dvh - 360px); overflow-y: auto; }
    .student-item { display: flex; align-items: center; gap: 12px; padding: 12px 14px; border-radius: 16px; background: #f8fafc; border: 1.5px solid #f1f5f9; cursor: pointer; transition: all 0.15s; }
    .student-item:hover { border-color: #bae6fd; background: #f0f9ff; }
    .student-item.selected { border-color: #0369a1; background: #e0f2fe; }
    .student-avatar { width: 40px; height: 40px; border-radius: 12px; flex-shrink: 0; display: flex; align-items: center; justify-content: center; font-size: 15px; font-weight: 900; color: white; background: linear-gradient(135deg, #0369a1, #0284c7); }
    .student-info { flex: 1; min-width: 0; }
    .student-name { font-size: 13px; font-weight: 700; color: #0f172a; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
    .student-class { font-size: 11px; color: #64748b; margin-top: 2px; }
    .student-pts { font-size: 13px; font-weight: 900; color: #0369a1; background: #e0f2fe; padding: 4px 10px; border-radius: 999px; flex-shrink: 0; }

    .selected-banner { background: linear-gradient(135deg, #0c4a6e, #0369a1); border-radius: 20px; padding: 16px; color: white; margin-bottom: 16px; display: flex; align-items: center; justify-content: space-between; gap: 12px; }
    .selected-banner-avatar { width: 48px; height: 48px; border-radius: 14px; background: rgba(255,255,255,0.2); display: flex; align-items: center; justify-content: center; font-size: 18px; font-weight: 900; flex-shrink: 0; }
    .selected-banner-info { flex: 1; min-width: 0; }
    .selected-banner-name { font-size: 15px; font-weight: 900; }
    .selected-banner-meta { font-size: 11px; opacity: 0.8; margin-top: 3px; }
    .selected-banner-pts { font-size: 11px; opacity: 0.9; margin-top: 2px; font-weight: 700; }
    .change-btn { padding: 8px 14px; border-radius: 12px; border: 1px solid rgba(255,255,255,0.3); background: rgba(255,255,255,0.15); color: white; font-size: 12px; font-weight: 700; cursor: pointer; flex-shrink: 0; }

    .qr-scanner-wrap { background: #0f172a; border-radius: 20px; padding: 20px; margin-bottom: 12px; }
    .qr-input-wrap { display: flex; gap: 8px; }
    .qr-input { flex: 1; padding: 12px 14px; border-radius: 14px; border: 1.5px solid #334155; background: #1e293b; color: white; font-size: 14px; outline: none; }
    .qr-input::placeholder { color: #64748b; }
    .qr-input:focus { border-color: #38bdf8; }
    .qr-btn { padding: 12px 16px; border-radius: 14px; border: none; cursor: pointer; background: #0369a1; color: white; font-size: 13px; font-weight: 800; }
    .qr-hint { font-size: 12px; color: #64748b; margin-top: 10px; }

    .face-wrap { background: #0f172a; border-radius: 20px; padding: 20px; margin-bottom: 12px; }
    .face-title { font-size: 14px; font-weight: 800; color: white; margin-bottom: 12px; }
    .face-upload-label { display: inline-flex; align-items: center; gap: 8px; padding: 12px 16px; border-radius: 14px; background: #0369a1; color: white; font-size: 13px; font-weight: 800; cursor: pointer; }
    .face-preview { width: 100%; border-radius: 14px; margin-top: 12px; max-height: 200px; object-fit: cover; }
    .face-verify-btn { width: 100%; margin-top: 12px; padding: 12px; border-radius: 14px; border: none; cursor: pointer; background: #059669; color: white; font-size: 14px; font-weight: 800; }
    .face-verify-btn:disabled { background: #334155; color: #64748b; cursor: not-allowed; }

    .action-items-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin-bottom: 12px; }
    .action-item { border-radius: 20px; padding: 14px; cursor: pointer; border: 2px solid #e2e8f0; background: white; transition: all 0.15s; text-align: right; width: 100%; }
    .action-item:disabled { cursor: not-allowed; opacity: 0.5; }
    .action-item.reward { border-color: #a7f3d0; background: #f0fdf4; }
    .action-item.reward:hover:not(:disabled) { border-color: #059669; }
    .action-item.reward.selected { border-color: #059669; background: #d1fae5; box-shadow: 0 0 0 3px rgba(5,150,105,0.2); }
    .action-item.violation { border-color: #fecaca; background: #fff5f5; }
    .action-item.violation:hover:not(:disabled) { border-color: #dc2626; }
    .action-item.violation.selected { border-color: #dc2626; background: #fee2e2; box-shadow: 0 0 0 3px rgba(220,38,38,0.2); }
    .action-item.program { border-color: #bae6fd; background: #f0f9ff; }
    .action-item.program:hover:not(:disabled) { border-color: #0369a1; }
    .action-item.program.selected { border-color: #0369a1; background: #e0f2fe; box-shadow: 0 0 0 3px rgba(3,105,161,0.2); }
    .action-item-header { display: flex; align-items: flex-start; justify-content: space-between; gap: 8px; }
    .action-item-title { font-size: 13px; font-weight: 800; color: #0f172a; }
    .action-item-desc { font-size: 11px; color: #64748b; margin-top: 4px; line-height: 1.5; }
    .action-item-pts { font-size: 14px; font-weight: 900; padding: 4px 10px; border-radius: 999px; background: white; flex-shrink: 0; white-space: nowrap; }
    .action-item-pts.reward { color: #059669; }
    .action-item-pts.violation { color: #dc2626; }
    .action-item-pts.program { color: #0369a1; }

    .note-input { width: 100%; padding: 12px 14px; border-radius: 14px; border: 1.5px solid #e2e8f0; background: #f8fafc; font-size: 13px; color: #0f172a; outline: none; resize: none; margin-bottom: 12px; transition: border-color 0.15s; }
    .note-input:focus { border-color: #0369a1; background: white; }

    .submit-btn { width: 100%; padding: 16px; border-radius: 18px; border: none; cursor: pointer; font-size: 16px; font-weight: 900; transition: all 0.15s; display: flex; align-items: center; justify-content: center; gap: 8px; }
    .submit-btn.reward { background: #059669; color: white; }
    .submit-btn.reward:hover:not(:disabled) { background: #047857; }
    .submit-btn.violation { background: #dc2626; color: white; }
    .submit-btn.violation:hover:not(:disabled) { background: #b91c1c; }
    .submit-btn.program { background: #0369a1; color: white; }
    .submit-btn.program:hover:not(:disabled) { background: #075985; }
    .submit-btn:disabled { background: #e2e8f0; color: #94a3b8; cursor: not-allowed; }

    .msg-box { margin-top: 12px; padding: 12px 16px; border-radius: 16px; font-size: 14px; font-weight: 700; display: none; }
    .msg-box.success { background: #d1fae5; color: #065f46; border: 1px solid #a7f3d0; display: block; }
    .msg-box.error { background: #fee2e2; color: #9f1239; border: 1px solid #fecaca; display: block; }

    /* ===== LEAVE PASSES ===== */
    .leave-item { background: white; border-radius: 20px; padding: 16px; margin-bottom: 10px; border: 1px solid #f1f5f9; }
    .leave-header { display: flex; align-items: center; justify-content: space-between; gap: 8px; margin-bottom: 8px; }
    .leave-student { font-size: 15px; font-weight: 800; color: #0f172a; }
    .leave-info { font-size: 12px; color: #64748b; margin-top: 4px; }
    .leave-actions { display: flex; gap: 8px; margin-top: 12px; }
    .leave-btn { flex: 1; padding: 10px; border-radius: 12px; border: none; cursor: pointer; font-size: 13px; font-weight: 800; transition: all 0.15s; }
    .leave-btn.approve { background: #d1fae5; color: #065f46; }
    .leave-btn.approve:hover { background: #a7f3d0; }
    .leave-btn.reject { background: #fee2e2; color: #9f1239; }
    .leave-btn.reject:hover { background: #fecaca; }

    /* ===== LESSON ATTENDANCE ===== */
    .session-item { background: white; border-radius: 20px; padding: 16px; margin-bottom: 10px; border: 1px solid #f1f5f9; cursor: pointer; transition: all 0.15s; }
    .session-item:hover { border-color: #bae6fd; }
    .session-header { display: flex; align-items: center; justify-content: space-between; gap: 8px; }
    .session-title { font-size: 14px; font-weight: 800; color: #0f172a; }
    .session-info { font-size: 12px; color: #64748b; margin-top: 4px; }
    .attendance-list { margin-top: 12px; display: flex; flex-direction: column; gap: 6px; }
    .attendance-item { display: flex; align-items: center; gap: 10px; padding: 10px 12px; border-radius: 14px; background: #f8fafc; border: 1px solid #f1f5f9; }
    .attendance-student-name { flex: 1; font-size: 13px; font-weight: 700; color: #0f172a; }
    .attendance-toggle { display: flex; gap: 6px; }
    .att-btn { padding: 6px 12px; border-radius: 10px; border: none; cursor: pointer; font-size: 12px; font-weight: 800; transition: all 0.15s; }
    .att-btn.present { background: #d1fae5; color: #065f46; }
    .att-btn.present.active { background: #059669; color: white; }
    .att-btn.absent { background: #fee2e2; color: #9f1239; }
    .att-btn.absent.active { background: #dc2626; color: white; }
    .att-btn.late { background: #fef3c7; color: #92400e; }
    .att-btn.late.active { background: #d97706; color: white; }
    .save-attendance-btn { width: 100%; margin-top: 12px; padding: 14px; border-radius: 16px; border: none; cursor: pointer; background: #0369a1; color: white; font-size: 14px; font-weight: 800; }

    /* ===== NOTIFICATIONS ===== */
    .notif-item { background: white; border-radius: 20px; padding: 16px; margin-bottom: 10px; border: 1px solid #f1f5f9; }
    .notif-title { font-size: 14px; font-weight: 800; color: #0f172a; }
    .notif-body { font-size: 13px; color: #374151; margin-top: 6px; line-height: 1.6; }
    .notif-time { font-size: 11px; color: #94a3b8; margin-top: 6px; }

    /* ===== MISC ===== */
    .loading-wrap { display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 40px; gap: 12px; }
    .loading-spinner { width: 32px; height: 32px; border: 3px solid #e2e8f0; border-top-color: #0369a1; border-radius: 50%; animation: spin 0.8s linear infinite; }
    @keyframes spin { to { transform: rotate(360deg); } }
    .loading-text { font-size: 13px; color: #64748b; font-weight: 700; }
    .empty-state { display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 40px 20px; gap: 8px; }
    .empty-icon { font-size: 40px; }
    .empty-text { font-size: 14px; color: #64748b; font-weight: 700; text-align: center; }
    .section-label { font-size: 12px; font-weight: 800; color: #64748b; margin-bottom: 8px; text-transform: uppercase; letter-spacing: 0.5px; }
    .status-box { padding: 10px 14px; border-radius: 14px; font-size: 13px; font-weight: 700; margin-top: 8px; }
    .status-box.warn { background: #fef3c7; border: 1px solid #fde68a; color: #92400e; }
    .status-box.err { background: #fee2e2; border: 1px solid #fecaca; color: #9f1239; }
    .spin-inline { display: inline-block; width: 16px; height: 16px; border: 2px solid rgba(255,255,255,0.4); border-top-color: white; border-radius: 50%; animation: spin 0.8s linear infinite; vertical-align: middle; }
  </style>
</head>
<body>
<div id="app">

  <!-- ===== LOGIN SCREEN ===== -->
  <div id="loginScreen">
    <div class="login-card">
      <div class="login-logo">
        <div class="login-logo-icon">🏫</div>
        <div class="login-title">بوابة المعلم</div>
        <div class="login-sub">منصة الشركة المثالية</div>
      </div>
      <div class="form-group">
        <label class="form-label" for="loginUsername">اسم المستخدم</label>
        <input class="form-input" id="loginUsername" type="text" placeholder="teacher.demo" autocomplete="username" />
      </div>
      <div class="form-group">
        <label class="form-label" for="loginPassword">كلمة المرور</label>
        <input class="form-input" id="loginPassword" type="password" placeholder="••••••••" autocomplete="current-password" />
      </div>
      <button class="btn-login" id="loginBtn" onclick="doLogin()">
        <span id="loginBtnText">تسجيل الدخول</span>
      </button>
      <div class="login-error" id="loginError"></div>
    </div>
  </div>

  <!-- ===== MAIN WRAPPER ===== -->
  <div id="mainWrapper">

    <!-- TOP BAR -->
    <div id="topBar">
      <div class="topbar-brand">
        <div class="topbar-icon">🏫</div>
        <div>
          <div class="topbar-name" id="topbarName">المعلم</div>
          <div class="topbar-school" id="topbarSchool">المدرسة</div>
        </div>
      </div>
      <div class="topbar-actions">
        <button class="topbar-btn" onclick="showPage('notifications')">
          🔔
          <span class="topbar-badge hidden" id="notifBadge">0</span>
        </button>
        <button class="logout-btn" onclick="doLogout()">خروج</button>
      </div>
    </div>

    <!-- MAIN CONTENT -->
    <div id="mainContent">

      <!-- DASHBOARD PAGE -->
      <div id="page-dashboard" class="page active">
        <div class="hero-card">
          <div class="hero-greeting">مرحباً بك 👋</div>
          <div class="hero-name" id="dashName">المعلم</div>
          <div class="hero-school" id="dashSchool">المدرسة</div>
          <div class="hero-stats">
            <div class="hero-stat"><div class="hero-stat-val" id="dashRewards">0</div><div class="hero-stat-lbl">مكافآت</div></div>
            <div class="hero-stat"><div class="hero-stat-val" id="dashViolations">0</div><div class="hero-stat-lbl">خصومات</div></div>
            <div class="hero-stat"><div class="hero-stat-val" id="dashPrograms">0</div><div class="hero-stat-lbl">برامج</div></div>
          </div>
        </div>

        <div class="points-card">
          <div class="points-card-title">⭐ نقاط المعلم</div>
          <div class="points-row">
            <div class="points-box">
              <div class="points-box-val" id="dashPointsToday">0</div>
              <div class="points-box-lbl">اليوم</div>
            </div>
            <div class="points-box">
              <div class="points-box-val" id="dashPointsTotal">0</div>
              <div class="points-box-lbl">الإجمالي</div>
            </div>
          </div>
        </div>

        <div class="company-card" id="myCompanyCard" style="display:none">
          <div class="company-card-title">🏆 شركتي — رائد الصف</div>
          <div class="company-name-big" id="myCompanyName">—</div>
          <div class="company-stats">
            <div class="company-stat"><div class="company-stat-val" id="myCompanyPoints">0</div><div class="company-stat-lbl">النقاط</div></div>
            <div class="company-stat"><div class="company-stat-val" id="myCompanyClass">—</div><div class="company-stat-lbl">الفصل</div></div>
            <div class="company-stat"><div class="company-stat-val" id="myCompanyStudents">0</div><div class="company-stat-lbl">الطلاب</div></div>
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
            <div class="empty-state"><div class="empty-icon">📝</div><div class="empty-text">لا توجد إجراءات حديثة</div></div>
          </div>
        </div>
      </div>

      <!-- ACTIONS PAGE -->
      <div id="page-actions" class="page">
        <div class="page-header">
          <div class="page-header-title">⚡ إجراءات الطلاب</div>
          <div class="page-header-sub">مكافأة • خصم • برنامج</div>
        </div>

        <!-- Steps indicator -->
        <div class="steps-row">
          <div class="step-dot active" id="step1dot">١</div>
          <div class="step-line" id="stepLine1"></div>
          <div class="step-dot" id="step2dot">٢</div>
          <div class="step-line" id="stepLine2"></div>
          <div class="step-dot" id="step3dot">٣</div>
        </div>

        <!-- STEP 1: Action Type -->
        <div id="actionStep1">
          <div class="section-label">الخطوة الأولى — اختر نوع الإجراء</div>
          <div class="action-type-grid">
            <div class="action-type-card" id="typeCardReward" onclick="selectActionType('reward')">
              <div class="action-type-icon">🏆</div>
              <div class="action-type-label">مكافأة</div>
            </div>
            <div class="action-type-card" id="typeCardViolation" onclick="selectActionType('violation')">
              <div class="action-type-icon">⚠️</div>
              <div class="action-type-label">خصم</div>
            </div>
            <div class="action-type-card" id="typeCardProgram" onclick="selectActionType('program')">
              <div class="action-type-icon">🎯</div>
              <div class="action-type-label">برنامج</div>
            </div>
          </div>
        </div>

        <!-- STEP 2: Identify Student -->
        <div id="actionStep2" style="display:none">
          <div class="section-label">الخطوة الثانية — حدد الطالب</div>
          <div class="identify-methods">
            <div class="identify-btn active" id="methodManual" onclick="selectIdentifyMethod('manual')">
              <div class="identify-btn-icon">📋</div>
              <div class="identify-btn-label">يدوي</div>
            </div>
            <div class="identify-btn" id="methodBarcode" onclick="selectIdentifyMethod('barcode')">
              <div class="identify-btn-icon">📷</div>
              <div class="identify-btn-label">باركود</div>
            </div>
            <div class="identify-btn" id="methodFace" onclick="selectIdentifyMethod('face')">
              <div class="identify-btn-icon">🤳</div>
              <div class="identify-btn-label">بصمة الوجه</div>
            </div>
          </div>

          <!-- Manual -->
          <div id="identifyManual">
            <div class="search-wrap">
              <span class="search-icon">🔍</span>
              <input class="search-input" id="studentSearch" placeholder="ابحث باسم الطالب أو رقمه..." oninput="filterStudents()" />
            </div>
            <div class="student-list" id="studentList">
              <div class="loading-wrap"><div class="loading-spinner"></div><div class="loading-text">جارٍ التحميل...</div></div>
            </div>
          </div>

          <!-- Barcode -->
          <div id="identifyBarcode" style="display:none">
            <div class="qr-scanner-wrap">
              <div style="color:white;font-size:13px;font-weight:700;margin-bottom:12px;">📷 مسح باركود الطالب</div>
              <div class="qr-input-wrap">
                <input class="qr-input" id="barcodeInput" placeholder="امسح الباركود أو أدخله يدوياً..." onkeydown="if(event.key==='Enter')resolveBarcode()" />
                <button class="qr-btn" onclick="resolveBarcode()">بحث</button>
              </div>
              <div class="qr-hint">وجّه الكاميرا نحو باركود الطالب أو اكتب الرقم يدوياً</div>
            </div>
            <div id="barcodeStatus" style="display:none" class="status-box warn"></div>
          </div>

          <!-- Face -->
          <div id="identifyFace" style="display:none">
            <div class="face-wrap">
              <div class="face-title">🤳 بصمة الوجه</div>
              <label class="face-upload-label">
                📸 رفع صورة الوجه
                <input type="file" accept="image/*" capture="user" style="display:none" id="faceFileInput" onchange="handleFaceFile(this)" />
              </label>
              <img id="facePreview" class="face-preview" style="display:none" alt="معاينة" />
              <button class="face-verify-btn" id="faceVerifyBtn" onclick="verifyFace()" disabled>التحقق من الوجه</button>
            </div>
            <div id="faceStatus" style="display:none" class="status-box warn"></div>
          </div>
        </div>

        <!-- Selected Student Banner -->
        <div id="selectedStudentBanner" style="display:none">
          <div class="selected-banner">
            <div class="selected-banner-avatar" id="selectedAvatarText">—</div>
            <div class="selected-banner-info">
              <div class="selected-banner-name" id="selectedStudentName">—</div>
              <div class="selected-banner-meta" id="selectedStudentMeta">—</div>
              <div class="selected-banner-pts" id="selectedStudentPts">—</div>
            </div>
            <button class="change-btn" onclick="clearSelectedStudent()">تغيير</button>
          </div>
        </div>

        <!-- STEP 3: Action Items -->
        <div id="actionStep3" style="display:none">
          <div class="section-label">الخطوة الثالثة — اختر البند</div>
          <div class="action-items-grid" id="actionItemsList">
            <div class="loading-wrap" style="grid-column:1/-1"><div class="loading-spinner"></div></div>
          </div>
          <textarea class="note-input" id="actionNote" rows="2" placeholder="ملاحظة اختيارية..."></textarea>
          <button class="submit-btn reward" id="submitActionBtn" onclick="submitAction()" disabled>✅ تطبيق الإجراء</button>
          <div class="msg-box" id="actionMsg"></div>
        </div>
      </div>

      <!-- LEAVE PASSES PAGE -->
      <div id="page-leavePasses" class="page">
        <div class="page-header">
          <div class="page-header-title">📋 الاستئذانات</div>
          <div class="page-header-sub">طلبات الاستئذان الموجهة إليك</div>
        </div>
        <div id="leavePassesList">
          <div class="loading-wrap"><div class="loading-spinner"></div><div class="loading-text">جارٍ التحميل...</div></div>
        </div>
      </div>

      <!-- LESSON ATTENDANCE PAGE -->
      <div id="page-lessonAttendance" class="page">
        <div class="page-header">
          <div class="page-header-title">📚 تحضير الحصص</div>
          <div class="page-header-sub">تسجيل حضور وغياب الطلاب</div>
        </div>
        <div id="lessonAttendanceContent">
          <div class="loading-wrap"><div class="loading-spinner"></div><div class="loading-text">جارٍ التحميل...</div></div>
        </div>
      </div>

      <!-- NOTIFICATIONS PAGE -->
      <div id="page-notifications" class="page">
        <div class="page-header">
          <div class="page-header-title">🔔 التنبيهات</div>
          <div class="page-header-sub">الإشعارات الموجهة إليك</div>
        </div>
        <div id="notificationsList">
          <div class="loading-wrap"><div class="loading-spinner"></div><div class="loading-text">جارٍ التحميل...</div></div>
        </div>
      </div>

    </div><!-- end mainContent -->

    <!-- BOTTOM NAV -->
    <div id="bottomNav">
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

  </div><!-- end mainWrapper -->
</div><!-- end app -->

<script>
// ===== STATE =====
const TOKEN_KEY = 'teacher-portal-token-v4';
const NOTIF_READ_KEY = 'teacher-portal-notif-read-v4';
let currentUser = null;
let sharedState = null;
let selectedSchool = null;
let activePage = 'dashboard';
let pollingInterval = null;
let actionType = 'reward';
let identifyMethod = 'manual';
let allStudents = [];
let filteredStudents = [];
let selectedStudent = null;
let selectedActionItem = null;
let faceFile = null;
let activeSession = null;
let sessionAttendance = {};

// ===== UTILS =====
function $(id) { return document.getElementById(id); }
function getToken() { try { return localStorage.getItem(TOKEN_KEY) || ''; } catch(e) { return ''; } }
function setToken(t) { try { localStorage.setItem(TOKEN_KEY, t); } catch(e) {} }
function clearToken() { try { localStorage.removeItem(TOKEN_KEY); } catch(e) {} }
function getInitials(name) {
  if (!name) return '?';
  const p = name.trim().split(/\\s+/);
  return p.length >= 2 ? p[0][0] + p[1][0] : (p[0][0] || '?');
}

// ===== API =====
async function api(url, opts = {}) {
  const token = getToken();
  const headers = { 'Content-Type': 'application/json', ...(opts.headers || {}) };
  if (token) headers['X-Session-Token'] = token;
  const res = await fetch(url, { ...opts, headers, body: opts.body ? JSON.stringify(opts.body) : undefined });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'خطأ في الخادم');
  return data;
}

// ===== AUTH =====
async function doLogin() {
  const username = $('loginUsername').value.trim();
  const password = $('loginPassword').value.trim();
  if (!username || !password) { showLoginError('أدخل اسم المستخدم وكلمة المرور.'); return; }
  const btn = $('loginBtn');
  btn.disabled = true;
  $('loginBtnText').innerHTML = '<span class="spin-inline"></span> جارٍ الدخول...';
  $('loginError').style.display = 'none';
  try {
    const data = await api('/api/auth/login', { method: 'POST', body: { username, password } });
    if (!data.ok || !data.token) throw new Error(data.message || 'فشل تسجيل الدخول.');
    setToken(data.token);
    await loadBootstrap();
  } catch(e) {
    showLoginError(e.message || 'فشل تسجيل الدخول.');
  } finally {
    btn.disabled = false;
    $('loginBtnText').textContent = 'تسجيل الدخول';
  }
}
function showLoginError(msg) {
  const el = $('loginError');
  el.textContent = msg;
  el.style.display = 'block';
}
$('loginPassword').addEventListener('keydown', (e) => { if (e.key === 'Enter') doLogin(); });
$('loginUsername').addEventListener('keydown', (e) => { if (e.key === 'Enter') $('loginPassword').focus(); });

async function doLogout() {
  try { await api('/api/auth/logout', { method: 'POST' }); } catch(e) {}
  clearToken();
  currentUser = null; sharedState = null; selectedSchool = null;
  if (pollingInterval) clearInterval(pollingInterval);
  $('loginScreen').style.display = 'flex';
  $('mainWrapper').style.display = 'none';
  $('loginUsername').value = '';
  $('loginPassword').value = '';
}

async function loadBootstrap() {
  const data = await api('/api/bootstrap');
  if (!data.ok || !data.sessionUser) throw new Error('جلسة غير صالحة.');
  currentUser = data.sessionUser;
  sharedState = data.state;
  const allowed = ['teacher', 'supervisor', 'principal', 'superadmin'];
  if (!allowed.includes(currentUser.role)) {
    clearToken();
    showLoginError('هذه البوابة مخصصة للمعلمين فقط.');
    return;
  }
  selectedSchool = (sharedState.schools || []).find((s) => s.id === currentUser.schoolId) || sharedState.schools?.[0] || null;
  $('loginScreen').style.display = 'none';
  $('mainWrapper').style.display = 'flex';
  $('topbarName').textContent = currentUser.name || currentUser.username || 'المعلم';
  $('topbarSchool').textContent = selectedSchool?.name || 'المدرسة';
  buildStudentList();
  renderDashboard();
  showPage('dashboard');
  startPolling();
}

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
        if (activePage === 'dashboard') renderDashboard();
        if (activePage === 'leavePasses') renderLeavePasses();
        if (activePage === 'lessonAttendance') renderLessonAttendance();
        if (activePage === 'notifications') renderNotifications();
      }
    } catch(e) {}
  }, 120000);
}

// ===== NAVIGATION =====
function showPage(page) {
  activePage = page;
  document.querySelectorAll('.page').forEach((p) => { p.classList.remove('active'); p.style.display = 'none'; });
  const el = $('page-' + page);
  if (el) { el.classList.add('active'); el.style.display = 'block'; }
  document.querySelectorAll('.nav-item').forEach((n) => n.classList.remove('active'));
  const nav = $('nav-' + page);
  if (nav) nav.classList.add('active');
  if (page === 'leavePasses') renderLeavePasses();
  if (page === 'lessonAttendance') renderLessonAttendance();
  if (page === 'notifications') { renderNotifications(); markNotifsRead(); }
  if (page === 'dashboard') renderDashboard();
  if (page === 'actions') resetActionFlow();
  const mc = $('mainContent');
  if (mc) mc.scrollTop = 0;
}

// ===== STUDENTS =====
function getUnifiedStudents(school) {
  const students = [];
  const seen = new Set();
  for (const cls of (school?.structure?.classrooms || [])) {
    for (const st of (cls.students || [])) {
      if (st.status === 'archived') continue;
      if (!seen.has(st.id)) {
        seen.add(st.id);
        const compositeId = 'structure-' + cls.id + '-' + st.id;
        students.push({ ...st, id: compositeId, rawId: st.id, name: st.fullName || st.name || '—', companyName: cls.companyName || cls.name || '—', className: cls.name || '—' });
      }
    }
  }
  for (const st of (school.students || [])) {
    if (st.status === 'archived') continue;
    if (!seen.has(st.id)) {
      seen.add(st.id);
      const co = (school.companies || []).find((c) => c.id === st.companyId);
      students.push({ ...st, name: st.fullName || st.name || '—', companyName: co?.name || '—', className: co?.className || '—' });
    }
  }
  return students.sort((a, b) =>
    String(a.companyName || '').localeCompare(String(b.companyName || ''), 'ar') ||
    String(a.name || '').localeCompare(String(b.name || ''), 'ar')
  );
}

function buildStudentList() {
  if (!selectedSchool) return;
  allStudents = getUnifiedStudents(selectedSchool);
  filterStudents();
}

function filterStudents() {
  const q = ($('studentSearch')?.value || '').trim().toLowerCase();
  filteredStudents = q
    ? allStudents.filter((s) =>
        (s.name || '').toLowerCase().includes(q) ||
        (s.studentNumber || '').toLowerCase().includes(q) ||
        (s.nationalId || '').toLowerCase().includes(q) ||
        (s.barcode || '').toLowerCase().includes(q)
      )
    : allStudents;
  renderStudentList();
}

function renderStudentList() {
  const container = $('studentList');
  if (!container) return;
  if (!filteredStudents.length) {
    container.innerHTML = '<div class="empty-state"><div class="empty-icon">🔍</div><div class="empty-text">لا توجد نتائج</div></div>';
    return;
  }
  container.innerHTML = filteredStudents.map((s) => {
    const isSelected = selectedStudent && selectedStudent.id === s.id;
    return '<div class="student-item' + (isSelected ? ' selected' : '') + '" onclick="selectStudent(' + s.id + ')">' +
      '<div class="student-avatar">' + getInitials(s.name) + '</div>' +
      '<div class="student-info">' +
        '<div class="student-name">' + (s.name || '—') + '</div>' +
        '<div class="student-class">' + (s.companyName || s.className || '—') + '</div>' +
      '</div>' +
      '<div class="student-pts">' + (s.points ?? 0) + '</div>' +
      '</div>';
  }).join('');
}

function selectStudent(id) {
  selectedStudent = allStudents.find((s) => s.id === id) || null;
  if (selectedStudent) showSelectedStudentBanner();
  renderStudentList();
}

function showSelectedStudentBanner() {
  if (!selectedStudent) return;
  $('selectedStudentBanner').style.display = 'block';
  $('selectedAvatarText').textContent = getInitials(selectedStudent.name);
  $('selectedStudentName').textContent = selectedStudent.name || '—';
  $('selectedStudentMeta').textContent = (selectedStudent.companyName || selectedStudent.className || '—') + (selectedStudent.grade ? ' • ' + selectedStudent.grade : '');
  $('selectedStudentPts').textContent = 'النقاط الحالية: ' + (selectedStudent.points ?? 0);
  $('actionStep2').style.display = 'none';
  $('actionStep3').style.display = 'block';
  updateStepIndicators(3);
  renderActionItems();
}

function clearSelectedStudent() {
  selectedStudent = null;
  selectedActionItem = null;
  $('selectedStudentBanner').style.display = 'none';
  $('actionStep2').style.display = 'block';
  $('actionStep3').style.display = 'none';
  $('actionMsg').className = 'msg-box';
  $('actionMsg').textContent = '';
  updateStepIndicators(2);
  filterStudents();
}

// ===== ACTION FLOW =====
function resetActionFlow() {
  selectedStudent = null;
  selectedActionItem = null;
  actionType = 'reward';
  identifyMethod = 'manual';
  $('actionStep1').style.display = 'block';
  $('actionStep2').style.display = 'none';
  $('actionStep3').style.display = 'none';
  $('selectedStudentBanner').style.display = 'none';
  $('actionMsg').className = 'msg-box';
  $('actionMsg').textContent = '';
  ['Reward', 'Violation', 'Program'].forEach((t) => {
    const c = $('typeCard' + t);
    if (c) c.className = 'action-type-card';
  });
  updateStepIndicators(1);
}

function selectActionType(type) {
  actionType = type;
  const classMap = { reward: 'sel-reward', violation: 'sel-violation', program: 'sel-program' };
  ['reward', 'violation', 'program'].forEach((t) => {
    const c = $('typeCard' + t.charAt(0).toUpperCase() + t.slice(1));
    if (c) c.className = 'action-type-card' + (t === type ? ' ' + classMap[t] : '');
  });
  $('actionStep1').style.display = 'none';
  $('actionStep2').style.display = 'block';
  updateStepIndicators(2);
  selectIdentifyMethod('manual');
  buildStudentList();
}

function selectIdentifyMethod(method) {
  identifyMethod = method;
  ['manual', 'barcode', 'face'].forEach((m) => {
    const b = $('method' + m.charAt(0).toUpperCase() + m.slice(1));
    if (b) b.className = 'identify-btn' + (m === method ? ' active' : '');
  });
  $('identifyManual').style.display = method === 'manual' ? 'block' : 'none';
  $('identifyBarcode').style.display = method === 'barcode' ? 'block' : 'none';
  $('identifyFace').style.display = method === 'face' ? 'block' : 'none';
  if (method === 'barcode') {
    setTimeout(() => { const inp = $('barcodeInput'); if (inp) { inp.value = ''; inp.focus(); } }, 100);
  }
}

function updateStepIndicators(active) {
  const labels = ['١', '٢', '٣'];
  for (let i = 1; i <= 3; i++) {
    const dot = $('step' + i + 'dot');
    if (!dot) continue;
    if (i < active) { dot.className = 'step-dot done'; dot.textContent = '✓'; }
    else if (i === active) { dot.className = 'step-dot active'; dot.textContent = labels[i-1]; }
    else { dot.className = 'step-dot'; dot.textContent = labels[i-1]; }
  }
  const l1 = $('stepLine1');
  const l2 = $('stepLine2');
  if (l1) l1.className = 'step-line' + (active > 1 ? ' done' : '');
  if (l2) l2.className = 'step-line' + (active > 2 ? ' done' : '');
}

// ===== BARCODE =====
function resolveBarcode() {
  const input = $('barcodeInput');
  const barcode = (input?.value || '').trim();
  if (!barcode) return;
  const statusEl = $('barcodeStatus');
  const found = allStudents.find((s) =>
    (s.barcode || '').toLowerCase() === barcode.toLowerCase() ||
    (s.studentNumber || '').toLowerCase() === barcode.toLowerCase() ||
    (s.nationalId || '').toLowerCase() === barcode.toLowerCase()
  );
  if (found) {
    statusEl.style.display = 'none';
    selectStudent(found.id);
  } else {
    statusEl.style.display = 'block';
    statusEl.className = 'status-box err';
    statusEl.textContent = 'لم يتم العثور على طالب بهذا الرقم.';
  }
}

// ===== FACE =====
function handleFaceFile(input) {
  const file = input.files?.[0];
  if (!file) return;
  faceFile = file;
  const reader = new FileReader();
  reader.onload = (e) => {
    const preview = $('facePreview');
    preview.src = e.target.result;
    preview.style.display = 'block';
    $('faceVerifyBtn').disabled = false;
  };
  reader.readAsDataURL(file);
}

async function verifyFace() {
  if (!faceFile) return;
  const btn = $('faceVerifyBtn');
  const statusEl = $('faceStatus');
  btn.disabled = true;
  btn.textContent = 'جارٍ التحقق...';
  statusEl.style.display = 'block';
  statusEl.className = 'status-box warn';
  statusEl.textContent = 'جارٍ مطابقة الوجه...';
  try {
    const formData = new FormData();
    formData.append('image', faceFile);
    formData.append('schoolId', String(selectedSchool.id));
    const res = await fetch('/api/schools/' + selectedSchool.id + '/face/identify', {
      method: 'POST',
      headers: { 'X-Session-Token': getToken() },
      body: formData
    });
    const data = await res.json();
    if (data.ok && data.studentId) {
      const found = allStudents.find((s) => s.id === data.studentId);
      if (found) { statusEl.style.display = 'none'; selectStudent(found.id); return; }
    }
    statusEl.className = 'status-box err';
    statusEl.textContent = data.message || 'لم يتم التعرف على الطالب.';
  } catch(e) {
    statusEl.className = 'status-box err';
    statusEl.textContent = 'فشل التحقق من الوجه.';
  } finally {
    btn.disabled = false;
    btn.textContent = 'التحقق من الوجه';
  }
}

// ===== ACTION ITEMS =====
function getActionItems(type) {
  const settings = selectedSchool?.settings || sharedState?.settings || {};
  if (type === 'reward') return (settings.actions?.rewards || []).filter((item) => item.isActive !== false);
  if (type === 'violation') return (settings.actions?.violations || []).filter((item) => item.isActive !== false);
  if (type === 'program') return (settings.actions?.programs || []).filter((item) => item.isActive !== false);
  return [];
}

function renderActionItems() {
  const container = $('actionItemsList');
  if (!container) return;
  const items = getActionItems(actionType);
  if (!items.length) {
    container.innerHTML = '<div class="empty-state" style="grid-column:1/-1"><div class="empty-icon">📋</div><div class="empty-text">لا توجد بنود متاحة</div></div>';
    $('submitActionBtn').disabled = true;
    return;
  }
  container.innerHTML = items.map((item) => {
    const pts = Number(item.points || 0);
    const ptsStr = pts > 0 ? '+' + pts : String(pts);
    const isSelected = selectedActionItem && String(selectedActionItem.id) === String(item.id);
    const disabled = !selectedStudent ? 'disabled' : '';
    return '<button class="action-item ' + actionType + (isSelected ? ' selected' : '') + '" onclick="selectActionItem(&apos;' + item.id + '&apos;)" ' + disabled + '>' +
      '<div class="action-item-header">' +
        '<div class="action-item-title">' + (item.title || '—') + '</div>' +
        '<div class="action-item-pts ' + actionType + '">' + ptsStr + '</div>' +
      '</div>' +
      '<div class="action-item-desc">' + (item.description || '') + '</div>' +
      '</button>';
  }).join('');
  updateSubmitBtn();
}

function selectActionItem(id) {
  if (!selectedStudent) return;
  const items = getActionItems(actionType);
  selectedActionItem = items.find((item) => String(item.id) === String(id)) || null;
  renderActionItems();
  updateSubmitBtn();
}

function updateSubmitBtn() {
  const btn = $('submitActionBtn');
  if (!btn) return;
  btn.disabled = !selectedStudent || !selectedActionItem;
  const labels = { reward: '✅ تطبيق المكافأة', violation: '⚠️ تطبيق الخصم', program: '🎯 اعتماد البرنامج' };
  btn.className = 'submit-btn ' + actionType;
  btn.textContent = labels[actionType] || '✅ تطبيق';
  if (selectedActionItem) {
    const pts = Number(selectedActionItem.points || 0);
    btn.textContent += ' (' + (pts > 0 ? '+' : '') + pts + ' نقطة)';
  }
}

async function submitAction() {
  if (!selectedStudent || !selectedActionItem) return;
  const btn = $('submitActionBtn');
  const msgEl = $('actionMsg');
  const note = $('actionNote')?.value?.trim() || '';
  btn.disabled = true;
  btn.innerHTML = '<span class="spin-inline"></span> جارٍ التطبيق...';
  msgEl.className = 'msg-box';
  msgEl.textContent = '';
  try {
    const body = {
      studentId: selectedStudent.id,
      studentNumber: selectedStudent.studentNumber || selectedStudent.barcode || '',
      barcode: selectedStudent.barcode || '',
      definitionId: String(selectedActionItem.id),
      actionType: actionType,
      note: note,
      method: identifyMethod === 'face' ? 'بصمة وجه' : identifyMethod === 'barcode' ? 'QR مباشر' : 'إدخال يدوي',
    };
    const data = await api('/api/schools/' + selectedSchool.id + '/actions/apply', { method: 'POST', body });
    if (data.ok) {
      msgEl.className = 'msg-box success';
      msgEl.textContent = data.message || '✅ تم تنفيذ الإجراء بنجاح.';
      if (data.student) {
        const idx = allStudents.findIndex((s) => s.id === selectedStudent.id);
        if (idx !== -1) allStudents[idx].points = data.student.points ?? allStudents[idx].points;
        selectedStudent.points = data.student.points ?? selectedStudent.points;
        $('selectedStudentPts').textContent = 'النقاط الحالية: ' + (selectedStudent.points ?? 0);
      }
      selectedActionItem = null;
      if ($('actionNote')) $('actionNote').value = '';
      renderActionItems();
    } else {
      throw new Error(data.message || 'فشل تنفيذ الإجراء.');
    }
  } catch(e) {
    msgEl.className = 'msg-box error';
    msgEl.textContent = e.message || 'حدث خطأ أثناء تنفيذ الإجراء.';
  } finally {
    updateSubmitBtn();
  }
}

// ===== DASHBOARD =====
function getMyActions() {
  const log = sharedState?.actionLog || [];
  return log.filter((item) =>
    item.schoolId === selectedSchool?.id &&
    ((currentUser?.id && item.actorId != null && String(item.actorId) === String(currentUser.id)) ||
     (currentUser?.username && item.actorUsername && item.actorUsername === currentUser.username) ||
     (currentUser?.name && item.actorName && item.actorName === currentUser.name))
  );
}

function calcTeacherPoints(actions) {
  const tp = sharedState?.settings?.teacherPoints || { perReward: 5, perViolation: 2, perProgram: 10 };
  return actions.reduce((sum, item) => {
    if (item.actionType === 'reward') return sum + Number(tp.perReward ?? 5);
    if (item.actionType === 'violation') return sum + Number(tp.perViolation ?? 2);
    if (item.actionType === 'program') return sum + Number(tp.perProgram ?? 10);
    return sum;
  }, 0);
}

function getMyCompany() {
  if (!selectedSchool || !currentUser) return null;
  const name = (currentUser.name || '').trim();
  const firstName = name.split(/\\s+/)[0];
  // Search in companies array
  for (const co of (selectedSchool.companies || [])) {
    if (co.leader && (co.leader === name || (firstName && co.leader.startsWith(firstName)))) {
      const students = (selectedSchool.students || []).filter((s) => s.companyId === co.id && s.status !== 'archived');
      return { name: co.name, className: co.className || '—', points: co.points || 0, studentCount: students.length };
    }
  }
  // Search in structure.classrooms
  for (const cls of (selectedSchool?.structure?.classrooms || [])) {
    if (cls.leaderUserId && String(cls.leaderUserId) === String(currentUser.id)) {
      const students = (cls.students || []).filter((s) => s.status !== 'archived');
      return { name: cls.companyName || cls.name || '—', className: cls.name || '—', points: cls.points || 0, studentCount: students.length };
    }
  }
  return null;
}

function renderDashboard() {
  if (!currentUser || !selectedSchool) return;
  $('dashName').textContent = currentUser.name || currentUser.username || 'المعلم';
  $('dashSchool').textContent = selectedSchool.name || 'المدرسة';
  const myActions = getMyActions();
  $('dashRewards').textContent = myActions.filter((i) => i.actionType === 'reward').length;
  $('dashViolations').textContent = myActions.filter((i) => i.actionType === 'violation').length;
  $('dashPrograms').textContent = myActions.filter((i) => i.actionType === 'program').length;
  const todayIso = new Date().toISOString().slice(0, 10);
  const todayActions = myActions.filter((i) => (i.isoDate || '').slice(0, 10) === todayIso);
  $('dashPointsToday').textContent = calcTeacherPoints(todayActions);
  $('dashPointsTotal').textContent = calcTeacherPoints(myActions);
  // Company card
  const myCompany = getMyCompany();
  if (myCompany) {
    $('myCompanyCard').style.display = 'block';
    $('myCompanyName').textContent = myCompany.name || '—';
    $('myCompanyPoints').textContent = myCompany.points || 0;
    $('myCompanyClass').textContent = myCompany.className || '—';
    $('myCompanyStudents').textContent = myCompany.studentCount || 0;
  } else {
    $('myCompanyCard').style.display = 'none';
  }
  // Leave passes
  const passes = getLeavePasses();
  const newPasses = passes.filter((p) => ['created','sent-system','sent-manual'].includes(p.status)).length;
  $('dashLeaveCount').textContent = newPasses > 0 ? newPasses + ' طلب جديد' : (passes.length > 0 ? passes.length + ' طلب' : 'لا يوجد طلبات');
  const lb = $('dashLeaveBadge');
  if (lb) { if (newPasses > 0) { lb.textContent = newPasses; lb.classList.remove('hidden'); } else lb.classList.add('hidden'); }
  // Sessions
  const sessions = getSessionsForTeacher();
  $('dashSessionCount').textContent = sessions.length > 0 ? sessions.length + ' جلسة نشطة' : 'لا توجد جلسات';
  // Notifications
  const notifs = getTeacherNotifications();
  $('dashNotifCount').textContent = notifs.length > 0 ? notifs.length + ' تنبيه' : 'لا يوجد تنبيهات';
  // Recent actions
  const recentActions = myActions.slice(-5).reverse();
  const rc = $('dashRecentActions');
  if (rc) {
    if (!recentActions.length) {
      rc.innerHTML = '<div class="empty-state"><div class="empty-icon">📝</div><div class="empty-text">لا توجد إجراءات حديثة</div></div>';
    } else {
      rc.innerHTML = recentActions.map((item) => {
        const isR = item.actionType === 'reward';
        const isP = item.actionType === 'program';
        const icon = isR ? '🏆' : isP ? '🎯' : '⚠️';
        const bg = isR ? '#d1fae5' : isP ? '#e0f2fe' : '#fee2e2';
        const color = isR ? '#059669' : isP ? '#0369a1' : '#dc2626';
        const pts = Number(item.deltaPoints || 0);
        return '<div class="recent-action">' +
          '<div class="recent-action-icon" style="background:' + bg + '">' + icon + '</div>' +
          '<div class="recent-action-info">' +
            '<div class="recent-action-title">' + (item.actionTitle || item.definitionTitle || '—') + '</div>' +
            '<div class="recent-action-sub">' + (item.student || item.studentName || '—') + ' • ' + (item.isoDate || '') + '</div>' +
          '</div>' +
          '<div class="recent-action-pts" style="color:' + color + '">' + (pts > 0 ? '+' : '') + pts + '</div>' +
          '</div>';
      }).join('');
    }
  }
  updateBadges();
}

function updateBadges() {
  const passes = getLeavePasses();
  const newPasses = passes.filter((p) => ['created','sent-system','sent-manual'].includes(p.status)).length;
  const lb = $('navLeaveBadge');
  if (lb) { if (newPasses > 0) { lb.textContent = newPasses; lb.classList.remove('hidden'); } else lb.classList.add('hidden'); }
  const sessions = getSessionsForTeacher();
  const pending = sessions.filter((s) => !(s.submissions || []).find((sub) => String(sub.teacherId) === String(currentUser?.id))).length;
  const lessonBadge = $('navLessonBadge');
  if (lessonBadge) { if (pending > 0) { lessonBadge.textContent = pending; lessonBadge.classList.remove('hidden'); } else lessonBadge.classList.add('hidden'); }
  const notifs = getTeacherNotifications();
  let lastRead = '';
  try { lastRead = localStorage.getItem(NOTIF_READ_KEY) || ''; } catch(e) {}
  const unread = lastRead ? notifs.filter((n) => (n.time || '') > lastRead).length : notifs.length;
  const nb = $('notifBadge');
  const nnb = $('navNotifBadge');
  if (nb) { if (unread > 0 && activePage !== 'notifications') { nb.textContent = unread > 99 ? '99+' : unread; nb.classList.remove('hidden'); } else nb.classList.add('hidden'); }
  if (nnb) { if (unread > 0 && activePage !== 'notifications') { nnb.textContent = unread > 99 ? '99+' : unread; nnb.classList.remove('hidden'); } else nnb.classList.add('hidden'); }
}

// ===== LEAVE PASSES =====
function getLeavePasses() {
  if (!selectedSchool || !currentUser) return [];
  const passes = sharedState?.leavePasses || selectedSchool?.leavePasses || [];
  return passes.filter((p) => {
    if (p.schoolId && p.schoolId !== selectedSchool.id) return false;
    return (p.teacherId && String(p.teacherId) === String(currentUser.id)) ||
           (p.teacherUsername && p.teacherUsername === currentUser.username) ||
           (p.teacherName && p.teacherName === currentUser.name);
  });
}

function renderLeavePasses() {
  const container = $('leavePassesList');
  if (!container) return;
  const passes = getLeavePasses();
  if (!passes.length) {
    container.innerHTML = '<div class="empty-state"><div class="empty-icon">📋</div><div class="empty-text">لا توجد طلبات استئذان</div></div>';
    return;
  }
  const statusLabel = { created: 'جديد', 'sent-system': 'أُرسل', 'sent-manual': 'أُرسل يدوياً', approved: 'مقبول', rejected: 'مرفوض', cancelled: 'ملغي' };
  const statusColor = { created: 'badge-amber', 'sent-system': 'badge-sky', 'sent-manual': 'badge-sky', approved: 'badge-green', rejected: 'badge-rose', cancelled: 'badge-slate' };
  container.innerHTML = passes.map((p) => {
    const canAct = ['created','sent-system','sent-manual'].includes(p.status);
    return '<div class="leave-item">' +
      '<div class="leave-header">' +
        '<div class="leave-student">' + (p.studentName || '—') + '</div>' +
        '<span class="badge ' + (statusColor[p.status] || 'badge-slate') + '">' + (statusLabel[p.status] || p.status) + '</span>' +
      '</div>' +
      '<div class="leave-info">السبب: ' + (p.reason || '—') + '</div>' +
      '<div class="leave-info">الوقت: ' + (p.time || '—') + (p.date ? ' • ' + p.date : '') + '</div>' +
      (canAct ? '<div class="leave-actions"><button class="leave-btn approve" onclick="handleLeavePass(&apos;' + p.id + '&apos;, &apos;approved&apos;)">✅ قبول</button><button class="leave-btn reject" onclick="handleLeavePass(&apos;' + p.id + '&apos;, &apos;rejected&apos;)">❌ رفض</button></div>' : '') +
      '</div>';
  }).join('');
}

async function handleLeavePass(id, decision) {
  try {
    await api('/api/schools/' + selectedSchool.id + '/leave-passes/' + id + '/decide', { method: 'POST', body: { decision } });
    const data = await api('/api/bootstrap');
    if (data.ok && data.state) {
      sharedState = data.state;
      selectedSchool = (sharedState.schools || []).find((s) => s.id === currentUser.schoolId) || sharedState.schools?.[0] || null;
    }
    renderLeavePasses();
    updateBadges();
  } catch(e) {
    alert(e.message || 'فشل تحديث الطلب.');
  }
}

// ===== LESSON ATTENDANCE =====
function getSessionsForTeacher() {
  if (!selectedSchool || !currentUser) return [];
  const sessions = sharedState?.lessonSessions || selectedSchool?.lessonSessions || [];
  return sessions.filter((s) => {
    if (s.schoolId && s.schoolId !== selectedSchool.id) return false;
    return (s.teacherId && String(s.teacherId) === String(currentUser.id)) ||
           (s.teacherUsername && s.teacherUsername === currentUser.username) ||
           (s.teacherName && s.teacherName === currentUser.name);
  });
}

function renderLessonAttendance() {
  const container = $('lessonAttendanceContent');
  if (!container) return;
  if (activeSession) { renderSessionAttendance(); return; }
  const sessions = getSessionsForTeacher();
  if (!sessions.length) {
    container.innerHTML = '<div class="empty-state"><div class="empty-icon">📚</div><div class="empty-text">لا توجد جلسات نشطة</div></div>';
    return;
  }
  container.innerHTML = sessions.map((s) => {
    const submitted = Boolean((s.submissions || []).find((sub) => String(sub.teacherId) === String(currentUser?.id)));
    return '<div class="session-item" onclick="' + (submitted ? '' : 'openSession(&apos;' + s.id + '&apos;)') + '">' +
      '<div class="session-header">' +
        '<div><div class="session-title">' + (s.subject || s.title || 'حصة') + '</div><div class="session-info">' + (s.className || s.companyName || '—') + ' • ' + (s.date || '') + '</div></div>' +
        '<span class="badge ' + (submitted ? 'badge-green' : 'badge-amber') + '">' + (submitted ? 'مُسلَّمة' : 'بانتظار التسليم') + '</span>' +
      '</div></div>';
  }).join('');
}

function openSession(id) {
  activeSession = getSessionsForTeacher().find((s) => String(s.id) === String(id)) || null;
  if (!activeSession) return;
  sessionAttendance = {};
  (activeSession.students || []).forEach((s) => { sessionAttendance[s.id] = 'present'; });
  renderSessionAttendance();
}

function renderSessionAttendance() {
  const container = $('lessonAttendanceContent');
  if (!container || !activeSession) return;
  const students = activeSession.students || [];
  container.innerHTML =
    '<div class="card" style="margin-bottom:12px">' +
      '<div style="display:flex;align-items:center;justify-content:space-between;gap:8px">' +
        '<div><div class="card-title" style="margin-bottom:0">' + (activeSession.subject || 'الحصة') + '</div><div style="font-size:12px;color:#64748b">' + (activeSession.className || '—') + ' • ' + (activeSession.date || '') + '</div></div>' +
        '<button onclick="activeSession=null;renderLessonAttendance()" style="padding:8px 12px;border-radius:10px;border:1px solid #e2e8f0;background:#f8fafc;font-size:12px;font-weight:700;cursor:pointer">رجوع</button>' +
      '</div>' +
    '</div>' +
    '<div class="attendance-list">' +
    students.map((s) =>
      '<div class="attendance-item">' +
        '<div class="attendance-student-name">' + (s.name || '—') + '</div>' +
        '<div class="attendance-toggle">' +
          '<button class="att-btn present' + (sessionAttendance[s.id] === 'present' ? ' active' : '') + '" onclick="setAttendance(' + s.id + ',&apos;present&apos;)">حاضر</button>' +
          '<button class="att-btn absent' + (sessionAttendance[s.id] === 'absent' ? ' active' : '') + '" onclick="setAttendance(' + s.id + ',&apos;absent&apos;)">غائب</button>' +
          '<button class="att-btn late' + (sessionAttendance[s.id] === 'late' ? ' active' : '') + '" onclick="setAttendance(' + s.id + ',&apos;late&apos;)">متأخر</button>' +
        '</div>' +
      '</div>'
    ).join('') +
    '</div>' +
    '<button class="save-attendance-btn" onclick="saveAttendance()">💾 حفظ الحضور</button>' +
    '<div class="msg-box" id="attendanceMsg"></div>';
}

function setAttendance(studentId, status) {
  sessionAttendance[studentId] = status;
  renderSessionAttendance();
}

async function saveAttendance() {
  if (!activeSession) return;
  const btn = document.querySelector('.save-attendance-btn');
  if (btn) { btn.disabled = true; btn.textContent = 'جارٍ الحفظ...'; }
  try {
    await api('/api/schools/' + selectedSchool.id + '/lesson-sessions/' + activeSession.id + '/submit', {
      method: 'POST',
      body: { teacherId: currentUser.id, attendance: sessionAttendance }
    });
    const msgEl = $('attendanceMsg');
    if (msgEl) { msgEl.className = 'msg-box success'; msgEl.textContent = '✅ تم حفظ الحضور بنجاح.'; }
    setTimeout(() => { activeSession = null; renderLessonAttendance(); }, 1500);
  } catch(e) {
    const msgEl = $('attendanceMsg');
    if (msgEl) { msgEl.className = 'msg-box error'; msgEl.textContent = e.message || 'فشل حفظ الحضور.'; }
    if (btn) { btn.disabled = false; btn.textContent = '💾 حفظ الحضور'; }
  }
}

// ===== NOTIFICATIONS =====
function getTeacherNotifications() {
  if (!selectedSchool || !currentUser) return [];
  const notifs = sharedState?.notifications || selectedSchool?.notifications || [];
  return notifs.filter((n) => {
    if (n.schoolId && n.schoolId !== selectedSchool.id) return false;
    return (n.recipientId && String(n.recipientId) === String(currentUser.id)) ||
           (n.recipientUsername && n.recipientUsername === currentUser.username) ||
           n.recipientRole === currentUser.role ||
           n.recipientRole === 'all';
  }).sort((a, b) => (b.time || '').localeCompare(a.time || ''));
}

function markNotifsRead() {
  try { localStorage.setItem(NOTIF_READ_KEY, new Date().toISOString()); } catch(e) {}
  updateBadges();
}

function renderNotifications() {
  const container = $('notificationsList');
  if (!container) return;
  const notifs = getTeacherNotifications();
  if (!notifs.length) {
    container.innerHTML = '<div class="empty-state"><div class="empty-icon">🔔</div><div class="empty-text">لا توجد تنبيهات</div></div>';
    return;
  }
  container.innerHTML = notifs.map((n) =>
    '<div class="notif-item">' +
      '<div class="notif-title">' + (n.title || 'تنبيه') + '</div>' +
      '<div class="notif-body">' + (n.body || n.message || '—') + '</div>' +
      '<div class="notif-time">' + (n.time || n.createdAt || '') + '</div>' +
    '</div>'
  ).join('');
}

// ===== INIT =====
(async function init() {
  const token = getToken();
  if (token) {
    try { await loadBootstrap(); } catch(e) { clearToken(); }
  }
})();

// PWA
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

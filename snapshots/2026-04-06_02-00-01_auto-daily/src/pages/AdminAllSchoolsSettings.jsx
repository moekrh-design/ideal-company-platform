import { useState, useEffect } from 'react';
import { Settings, Globe, Shield, Users, Smartphone, BookOpen, Star, Bell, Clock, Save, RefreshCw, CheckCircle2, ChevronDown, ChevronUp, AlertTriangle } from 'lucide-react';
import { apiRequest, getSessionToken, defaultSettings, hydrateActionCatalog, buildHydratedClientState, loadUiState, saveServerCache } from '../utils/sharedFunctions.jsx';

// ======= مكون Toggle =======
function Toggle({ checked, onChange, disabled = false }) {
  return (
    <button
      type="button"
      onClick={() => !disabled && onChange(!checked)}
      disabled={disabled}
      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${checked ? 'bg-emerald-500' : 'bg-slate-300'} ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
    >
      <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${checked ? 'translate-x-6' : 'translate-x-1'}`} />
    </button>
  );
}

// ======= مكون SettingRow =======
function SettingRow({ label, description, checked, onChange, disabled = false, tone = 'default' }) {
  const toneClass = tone === 'warning' ? 'bg-amber-50 ring-amber-100' : tone === 'danger' ? 'bg-rose-50 ring-rose-100' : 'bg-white ring-slate-100';
  return (
    <div className={`flex items-center justify-between gap-4 rounded-2xl px-4 py-3 ring-1 ${toneClass}`}>
      <div className="flex-1 min-w-0">
        <div className="font-bold text-slate-800 text-sm">{label}</div>
        {description && <div className="mt-0.5 text-xs text-slate-500 leading-5">{description}</div>}
      </div>
      <Toggle checked={checked} onChange={onChange} disabled={disabled} />
    </div>
  );
}

// ======= مكون SectionGroup =======
function SectionGroup({ title, icon: Icon, color = 'blue', children, defaultOpen = true }) {
  const [open, setOpen] = useState(defaultOpen);
  const colorMap = {
    blue: 'bg-sky-50 text-sky-700 ring-sky-100',
    green: 'bg-emerald-50 text-emerald-700 ring-emerald-100',
    violet: 'bg-violet-50 text-violet-700 ring-violet-100',
    amber: 'bg-amber-50 text-amber-700 ring-amber-100',
    rose: 'bg-rose-50 text-rose-700 ring-rose-100',
    slate: 'bg-slate-50 text-slate-700 ring-slate-100',
  };
  return (
    <div className="rounded-3xl bg-white ring-1 ring-slate-200 overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between gap-3 px-5 py-4 text-right hover:bg-slate-50 transition"
      >
        <div className="flex items-center gap-3">
          <span className={`flex h-8 w-8 items-center justify-center rounded-xl ring-1 ${colorMap[color] || colorMap.blue}`}>
            <Icon className="h-4 w-4" />
          </span>
          <span className="font-black text-slate-900">{title}</span>
        </div>
        {open ? <ChevronUp className="h-4 w-4 text-slate-400" /> : <ChevronDown className="h-4 w-4 text-slate-400" />}
      </button>
      {open && <div className="px-5 pb-5 space-y-2">{children}</div>}
    </div>
  );
}

// ======= الصفحة الرئيسية =======
export default function AdminAllSchoolsSettings({ settings, schools, currentUser, onSaveSettings, onApplyServerState }) {
  const [localSettings, setLocalSettings] = useState(settings || defaultSettings);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [tab, setTab] = useState('features');

  useEffect(() => {
    setLocalSettings(settings || defaultSettings);
  }, [settings]);

  const updateSetting = (path, value) => {
    setLocalSettings((prev) => {
      const parts = path.split('.');
      if (parts.length === 1) return { ...prev, [parts[0]]: value };
      if (parts.length === 2) return { ...prev, [parts[0]]: { ...(prev[parts[0]] || {}), [parts[1]]: value } };
      if (parts.length === 3) return { ...prev, [parts[0]]: { ...(prev[parts[0]] || {}), [parts[1]]: { ...((prev[parts[0]] || {})[parts[1]] || {}), [parts[2]]: value } } };
      return prev;
    });
    setSaved(false);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const token = getSessionToken();
      const updatedSettings = {
        ...localSettings,
        actions: hydrateActionCatalog(localSettings.actions),
      };
      const response = await apiRequest('/api/state/save', {
        method: 'POST',
        token,
        body: { state: { settings: updatedSettings, schools } }
      });
      if (response?.state) {
        const next = buildHydratedClientState(response.state, loadUiState());
        saveServerCache(response.state);
        if (onApplyServerState) onApplyServerState(next);
      }
      onSaveSettings(updatedSettings);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (error) {
      window.alert('تعذر حفظ الإعدادات: ' + (error?.message || ''));
    } finally {
      setSaving(false);
    }
  };

  const tabs = [
    { key: 'features', label: 'الميزات والتشغيل', icon: Settings },
    { key: 'attendance', label: 'الحضور والأجهزة', icon: Smartphone },
    { key: 'points', label: 'النقاط والمكافآت', icon: Star },
    { key: 'auth', label: 'الدخول والأمان', icon: Shield },
    { key: 'portal', label: 'بوابة ولي الأمر', icon: Users },
  ];

  const s = localSettings;

  return (
    <div className="space-y-6 pb-10">
      {/* رأس الصفحة */}
      <div className="rounded-3xl bg-gradient-to-br from-slate-900 to-slate-700 p-6 text-white">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white/10">
                <Globe className="h-5 w-5 text-white" />
              </div>
              <div>
                <div className="text-xl font-black">إعدادات المنصة — جميع المدارس</div>
                <div className="mt-0.5 text-sm text-slate-400">التحكم المركزي في إعدادات وميزات جميع المدارس</div>
              </div>
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              {(schools || []).map((school) => (
                <span key={school.id} className="rounded-xl bg-white/10 px-3 py-1 text-xs font-bold text-white">{school.name}</span>
              ))}
            </div>
          </div>
          <button
            onClick={handleSave}
            disabled={saving}
            className={`flex items-center gap-2 rounded-2xl px-5 py-3 font-black text-sm transition ${saved ? 'bg-emerald-500 text-white' : 'bg-white text-slate-900 hover:bg-slate-100'} ${saving ? 'opacity-70 cursor-not-allowed' : ''}`}
          >
            {saving ? <RefreshCw className="h-4 w-4 animate-spin" /> : saved ? <CheckCircle2 className="h-4 w-4" /> : <Save className="h-4 w-4" />}
            {saving ? 'جاري الحفظ...' : saved ? 'تم الحفظ ✓' : 'حفظ الإعدادات'}
          </button>
        </div>
      </div>

      {/* تنبيه */}
      <div className="flex items-start gap-3 rounded-2xl bg-amber-50 px-4 py-3 ring-1 ring-amber-200">
        <AlertTriangle className="h-5 w-5 text-amber-600 mt-0.5 flex-shrink-0" />
        <div className="text-sm text-amber-800">
          <span className="font-black">تنبيه: </span>
          هذه الإعدادات تنطبق على <strong>جميع المدارس في المنصة</strong>. أي تغيير سيؤثر فوراً على جميع المدارس والمستخدمين.
        </div>
      </div>

      {/* تبويبات */}
      <div className="flex flex-wrap gap-2">
        {tabs.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`flex items-center gap-2 rounded-2xl px-4 py-2 text-sm font-bold transition ${tab === t.key ? 'bg-slate-900 text-white shadow' : 'bg-white text-slate-600 ring-1 ring-slate-200 hover:bg-slate-50'}`}
          >
            <t.icon className="h-4 w-4" />
            {t.label}
          </button>
        ))}
      </div>

      {/* ===== تبويب الميزات والتشغيل ===== */}
      {tab === 'features' && (
        <div className="space-y-4">
          <SectionGroup title="ميزات الحضور" icon={Clock} color="blue">
            <SettingRow
              label="نظام نقاط الحضور اليومي"
              description="منح نقاط للطلاب بناءً على حضورهم اليومي"
              checked={Boolean(s.attendancePointsSystem?.enabled)}
              onChange={(v) => updateSetting('attendancePointsSystem.enabled', v)}
            />
            <SettingRow
              label="تحضير الحصص"
              description="تفعيل ميزة تحضير الحصص للمعلمين"
              checked={Boolean(s.lessonAttendanceEnabled !== false)}
              onChange={(v) => updateSetting('lessonAttendanceEnabled', v)}
            />
          </SectionGroup>

          <SectionGroup title="الاستئذان والمغادرة" icon={Bell} color="green">
            <SettingRow
              label="ميزة الاستئذان"
              description="السماح بإنشاء وإدارة طلبات الاستئذان"
              checked={Boolean(s.leavePassEnabled !== false)}
              onChange={(v) => updateSetting('leavePassEnabled', v)}
            />
            <SettingRow
              label="استئذان ولي الأمر"
              description="السماح لولي الأمر بتقديم طلبات الاستئذان عبر البوابة"
              checked={Boolean(s.parentPortal?.allowParentLeavePass !== false)}
              onChange={(v) => updateSetting('parentPortal.allowParentLeavePass', v)}
            />
          </SectionGroup>

          <SectionGroup title="المكافآت والنقاط" icon={Star} color="amber">
            <SettingRow
              label="متجر النقاط"
              description="تفعيل متجر المكافآت حيث يمكن للطلاب استبدال نقاطهم"
              checked={Boolean(s.rewardStoreEnabled !== false)}
              onChange={(v) => updateSetting('rewardStoreEnabled', v)}
            />
            <SettingRow
              label="نقاط المعلمين"
              description="تفعيل نظام نقاط المعلمين على المكافآت والبرامج"
              checked={Boolean(s.teacherPointsEnabled !== false)}
              onChange={(v) => updateSetting('teacherPointsEnabled', v)}
            />
          </SectionGroup>

          <SectionGroup title="الشاشات والبوابات" icon={Smartphone} color="violet">
            <SettingRow
              label="بوابات الحضور الذكية"
              description="تفعيل بوابات الحضور الذكية عبر QR وبصمة الوجه"
              checked={Boolean(s.smartGatesEnabled !== false)}
              onChange={(v) => updateSetting('smartGatesEnabled', v)}
            />
            <SettingRow
              label="الشاشات الحية"
              description="تفعيل شاشات العرض الحية في المدارس"
              checked={Boolean(s.liveScreensEnabled !== false)}
              onChange={(v) => updateSetting('liveScreensEnabled', v)}
            />
          </SectionGroup>

          <SectionGroup title="لوحة نافس" icon={BookOpen} color="rose">
            <SettingRow
              label="لوحة نافس التجريبي"
              description="تفعيل لوحة نافس للمسابقات والاختبارات"
              checked={Boolean(s.nafisEnabled !== false)}
              onChange={(v) => updateSetting('nafisEnabled', v)}
            />
          </SectionGroup>
        </div>
      )}

      {/* ===== تبويب الحضور والأجهزة ===== */}
      {tab === 'attendance' && (
        <div className="space-y-4">
          <SectionGroup title="وسائل الحضور" icon={Smartphone} color="blue">
            <SettingRow
              label="قارئ QR / الباركود"
              description="السماح بتسجيل الحضور عبر مسح QR كود"
              checked={Boolean(s.devices?.barcodeEnabled)}
              onChange={(v) => updateSetting('devices.barcodeEnabled', v)}
            />
            <SettingRow
              label="بصمة الوجه"
              description="السماح بتسجيل الحضور عبر التعرف على الوجه"
              checked={Boolean(s.devices?.faceEnabled)}
              onChange={(v) => updateSetting('devices.faceEnabled', v)}
            />
            <SettingRow
              label="منع التكرار في اليوم نفسه"
              description="منع تسجيل حضور الطالب أكثر من مرة في اليوم الواحد"
              checked={Boolean(s.devices?.duplicateScanBlocked)}
              onChange={(v) => updateSetting('devices.duplicateScanBlocked', v)}
            />
          </SectionGroup>

          <SectionGroup title="نظام نقاط الحضور" icon={Star} color="green">
            <SettingRow
              label="تفعيل نظام نقاط الحضور"
              description="منح نقاط للطلاب بناءً على حضورهم وانضباطهم"
              checked={Boolean(s.attendancePointsSystem?.enabled)}
              onChange={(v) => updateSetting('attendancePointsSystem.enabled', v)}
            />
            {s.attendancePointsSystem?.enabled && (
              <div className="grid grid-cols-2 gap-3 mt-2">
                {[
                  { key: 'attendancePointsSystem.dailyPresencePoints', label: 'نقاط الحضور اليومي', val: s.attendancePointsSystem?.dailyPresencePoints ?? 5 },
                  { key: 'attendancePointsSystem.earlyBonusPoints', label: 'نقاط الحضور المبكر', val: s.attendancePointsSystem?.earlyBonusPoints ?? 3 },
                  { key: 'attendancePointsSystem.absentDeductPoints', label: 'خصم الغياب', val: s.attendancePointsSystem?.absentDeductPoints ?? 3 },
                  { key: 'attendancePointsSystem.lateDeductPoints', label: 'خصم التأخر', val: s.attendancePointsSystem?.lateDeductPoints ?? 3 },
                ].map(({ key, label, val }) => (
                  <div key={key} className="rounded-2xl bg-slate-50 px-3 py-2 ring-1 ring-slate-200">
                    <div className="text-xs font-bold text-slate-600">{label}</div>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={val}
                      onChange={(e) => updateSetting(key, Number(e.target.value))}
                      className="mt-1 w-full rounded-xl bg-white px-2 py-1 text-sm font-black text-slate-900 ring-1 ring-slate-200 focus:outline-none focus:ring-sky-400"
                    />
                  </div>
                ))}
              </div>
            )}
          </SectionGroup>
        </div>
      )}

      {/* ===== تبويب النقاط والمكافآت ===== */}
      {tab === 'points' && (
        <div className="space-y-4">
          <SectionGroup title="نقاط الطلاب" icon={Star} color="amber">
            <div className="grid grid-cols-2 gap-3">
              {[
                { key: 'points.early', label: 'نقاط الحضور المبكر', val: s.points?.early ?? 5 },
                { key: 'points.onTime', label: 'نقاط الحضور في الوقت', val: s.points?.onTime ?? 3 },
                { key: 'points.late', label: 'خصم التأخر', val: s.points?.late ?? -2 },
                { key: 'points.initiative', label: 'نقاط المبادرة', val: s.points?.initiative ?? 10 },
                { key: 'points.behavior', label: 'نقاط السلوك', val: s.points?.behavior ?? 4 },
              ].map(({ key, label, val }) => (
                <div key={key} className="rounded-2xl bg-slate-50 px-3 py-2 ring-1 ring-slate-200">
                  <div className="text-xs font-bold text-slate-600">{label}</div>
                  <input
                    type="number"
                    value={val}
                    onChange={(e) => updateSetting(key, Number(e.target.value))}
                    className="mt-1 w-full rounded-xl bg-white px-2 py-1 text-sm font-black text-slate-900 ring-1 ring-slate-200 focus:outline-none focus:ring-sky-400"
                  />
                </div>
              ))}
            </div>
          </SectionGroup>

          <SectionGroup title="نقاط المعلمين" icon={Users} color="violet">
            <SettingRow
              label="تفعيل نقاط المعلمين"
              description="منح نقاط للمعلمين على المكافآت والبرامج والمخالفات"
              checked={Boolean(s.teacherPointsEnabled !== false)}
              onChange={(v) => updateSetting('teacherPointsEnabled', v)}
            />
            <div className="grid grid-cols-3 gap-3 mt-2">
              {[
                { key: 'teacherPoints.perReward', label: 'نقاط لكل مكافأة', val: s.teacherPoints?.perReward ?? 5 },
                { key: 'teacherPoints.perViolation', label: 'خصم لكل مخالفة', val: s.teacherPoints?.perViolation ?? 2 },
                { key: 'teacherPoints.perProgram', label: 'نقاط لكل برنامج', val: s.teacherPoints?.perProgram ?? 10 },
              ].map(({ key, label, val }) => (
                <div key={key} className="rounded-2xl bg-slate-50 px-3 py-2 ring-1 ring-slate-200">
                  <div className="text-xs font-bold text-slate-600">{label}</div>
                  <input
                    type="number"
                    value={val}
                    onChange={(e) => updateSetting(key, Number(e.target.value))}
                    className="mt-1 w-full rounded-xl bg-white px-2 py-1 text-sm font-black text-slate-900 ring-1 ring-slate-200 focus:outline-none focus:ring-sky-400"
                  />
                </div>
              ))}
            </div>
          </SectionGroup>
        </div>
      )}

      {/* ===== تبويب الدخول والأمان ===== */}
      {tab === 'auth' && (
        <div className="space-y-4">
          <SectionGroup title="طرق الدخول" icon={Shield} color="blue">
            <SettingRow
              label="الدخول بكلمة المرور"
              description="السماح للمستخدمين بالدخول عبر اسم المستخدم وكلمة المرور"
              checked={Boolean(s.auth?.allowPasswordLogin !== false)}
              onChange={(v) => updateSetting('auth.allowPasswordLogin', v)}
            />
            <SettingRow
              label="تفعيل OTP (رمز التحقق)"
              description="إرسال رمز تحقق عبر البريد أو الجوال للدخول"
              checked={Boolean(s.auth?.otpEnabled)}
              onChange={(v) => updateSetting('auth.otpEnabled', v)}
            />
            <SettingRow
              label="الدخول بدون كلمة مرور"
              description="السماح بالدخول عبر رابط مباشر بدون كلمة مرور"
              checked={Boolean(s.auth?.passwordlessEnabled)}
              onChange={(v) => updateSetting('auth.passwordlessEnabled', v)}
            />
          </SectionGroup>

          <SectionGroup title="أمان الحساب" icon={Shield} color="rose">
            <SettingRow
              label="تفعيل قفل الحساب عند المحاولات الفاشلة"
              description="قفل الحساب تلقائياً بعد عدد محدد من المحاولات الفاشلة"
              checked={Boolean(s.auth?.security?.enabled)}
              onChange={(v) => updateSetting('auth.security.enabled', v)}
            />
            {s.auth?.security?.enabled && (
              <div className="grid grid-cols-2 gap-3 mt-2">
                <div className="rounded-2xl bg-slate-50 px-3 py-2 ring-1 ring-slate-200">
                  <div className="text-xs font-bold text-slate-600">عدد المحاولات قبل القفل</div>
                  <input
                    type="number"
                    min="1"
                    max="20"
                    value={s.auth?.security?.maxFailedAttempts ?? 5}
                    onChange={(e) => updateSetting('auth.security.maxFailedAttempts', Number(e.target.value))}
                    className="mt-1 w-full rounded-xl bg-white px-2 py-1 text-sm font-black text-slate-900 ring-1 ring-slate-200 focus:outline-none focus:ring-sky-400"
                  />
                </div>
                <div className="rounded-2xl bg-slate-50 px-3 py-2 ring-1 ring-slate-200">
                  <div className="text-xs font-bold text-slate-600">مدة القفل (دقيقة)</div>
                  <input
                    type="number"
                    min="1"
                    max="1440"
                    value={s.auth?.security?.lockoutMinutes ?? 15}
                    onChange={(e) => updateSetting('auth.security.lockoutMinutes', Number(e.target.value))}
                    className="mt-1 w-full rounded-xl bg-white px-2 py-1 text-sm font-black text-slate-900 ring-1 ring-slate-200 focus:outline-none focus:ring-sky-400"
                  />
                </div>
              </div>
            )}
            <SettingRow
              label="إشعار الأدمن عند قفل حساب"
              description="إرسال تنبيه داخلي للأدمن عند قفل أي حساب"
              checked={Boolean(s.auth?.security?.notifyAdminOnLock)}
              onChange={(v) => updateSetting('auth.security.notifyAdminOnLock', v)}
            />
          </SectionGroup>
        </div>
      )}

      {/* ===== تبويب بوابة ولي الأمر ===== */}
      {tab === 'portal' && (
        <div className="space-y-4">
          <SectionGroup title="بوابة ولي الأمر" icon={Users} color="green">
            <SettingRow
              label="تفعيل بوابة ولي الأمر"
              description="السماح لأولياء الأمور بالدخول وتتبع أبنائهم"
              checked={Boolean(s.parentPortal?.enabled !== false)}
              onChange={(v) => updateSetting('parentPortal.enabled', v)}
            />
            <SettingRow
              label="السماح بالتسجيل الذاتي"
              description="السماح لأولياء الأمور بتسجيل حساباتهم بأنفسهم"
              checked={Boolean(s.parentPortal?.allowRegistration)}
              onChange={(v) => updateSetting('parentPortal.allowRegistration', v)}
            />
            <SettingRow
              label="استئذان ولي الأمر"
              description="السماح لولي الأمر بتقديم طلبات استئذان لأبنائه"
              checked={Boolean(s.parentPortal?.allowParentLeavePass !== false)}
              onChange={(v) => updateSetting('parentPortal.allowParentLeavePass', v)}
            />
            <SettingRow
              label="الدخول البديل برقم الهوية"
              description="السماح لولي الأمر بالدخول برقم هوية الطالب"
              checked={Boolean(s.parentPortal?.altLoginEnabled)}
              onChange={(v) => updateSetting('parentPortal.altLoginEnabled', v)}
            />
          </SectionGroup>

          <SectionGroup title="إشعارات ولي الأمر" icon={Bell} color="amber">
            <SettingRow
              label="إشعار الحضور والغياب"
              description="إرسال إشعار لولي الأمر عند تسجيل حضور أو غياب الطالب"
              checked={Boolean(s.parentNotifications?.attendance !== false)}
              onChange={(v) => updateSetting('parentNotifications.attendance', v)}
            />
            <SettingRow
              label="إشعار المكافآت والخصومات"
              description="إرسال إشعار لولي الأمر عند منح مكافأة أو خصم"
              checked={Boolean(s.parentNotifications?.rewards !== false)}
              onChange={(v) => updateSetting('parentNotifications.rewards', v)}
            />
            <SettingRow
              label="إشعار الاستئذان"
              description="إرسال إشعار لولي الأمر عند الموافقة على طلب الاستئذان"
              checked={Boolean(s.parentNotifications?.leavePass !== false)}
              onChange={(v) => updateSetting('parentNotifications.leavePass', v)}
            />
          </SectionGroup>
        </div>
      )}

      {/* زر الحفظ السفلي */}
      <div className="flex justify-end gap-3 pt-4 border-t border-slate-200">
        <button
          onClick={() => { setLocalSettings(settings || defaultSettings); setSaved(false); }}
          className="rounded-2xl bg-slate-100 px-5 py-3 font-bold text-slate-700 hover:bg-slate-200 transition"
        >
          إلغاء التغييرات
        </button>
        <button
          onClick={handleSave}
          disabled={saving}
          className={`flex items-center gap-2 rounded-2xl px-6 py-3 font-black text-sm transition ${saved ? 'bg-emerald-600 text-white' : 'bg-slate-900 text-white hover:bg-slate-700'} ${saving ? 'opacity-70 cursor-not-allowed' : ''}`}
        >
          {saving ? <RefreshCw className="h-4 w-4 animate-spin" /> : saved ? <CheckCircle2 className="h-4 w-4" /> : <Save className="h-4 w-4" />}
          {saving ? 'جاري الحفظ...' : saved ? 'تم الحفظ بنجاح ✓' : 'حفظ جميع الإعدادات'}
        </button>
      </div>
    </div>
  );
}

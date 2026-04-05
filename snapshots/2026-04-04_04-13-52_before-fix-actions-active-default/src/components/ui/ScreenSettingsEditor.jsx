import React from 'react';
import { SCREEN_TRANSITION_OPTIONS, SCREEN_THEME_OPTIONS, SCREEN_TEMPLATE_OPTIONS, TICKER_BG_OPTIONS } from '../../constants/appConfig.js';
import { getTransitionLabel, getScreenTemplateLabel } from '../../utils/sharedFunctions.jsx';

/**
 * ScreenSettingsEditor - محرر إعدادات شاشات العرض (النسخة الكاملة)
 * Props: value (screen form object), onChange (setter), classrooms (array)
 */
export function ScreenSettingsEditor({ value, onChange, classrooms = [] }) {
  if (!value || !onChange) return null;

  const update = (patch) => onChange({ ...value, ...patch });
  const toggleWidget = (key) => onChange({ ...value, widgets: { ...value.widgets, [key]: !value.widgets?.[key] } });

  const widgetList = [
    { key: 'metrics', label: 'المؤشرات الرئيسية' },
    { key: 'topStudents', label: 'أفضل الطلاب' },
    { key: 'topCompanies', label: 'أفضل الشركات' },
    { key: 'attendanceChart', label: 'مخطط الحضور' },
    { key: 'recentActivity', label: 'آخر النشاطات' },
    { key: 'parentPortalSummary', label: 'ملخص بوابة الأهل' },
    { key: 'lessonAttendanceSummary', label: 'ملخص تحضير الحصص' },
    { key: 'rewardStoreSummary', label: 'ملخص متجر النقاط' },
    { key: 'actionStats', label: 'إحصائيات الإجراءات' },
    { key: 'teacherActivity', label: 'نشاط المعلمين' },
    { key: 'rewardCategoryBreakdown', label: 'توزيع المكافآت' },
    { key: 'topTeachers', label: 'أفضل المعلمين' },
    { key: 'nafisQuiz', label: 'اختبار نافس' },
    { key: 'nafisLeaderboard', label: 'ترتيب نافس' },
  ];

  return (
    <div className="space-y-5 rounded-3xl bg-white p-5 ring-1 ring-slate-200">

      {/* اسم الشاشة */}
      <div>
        <label className="mb-1 block text-sm font-bold text-slate-700">اسم الشاشة</label>
        <input
          value={value.name || ''}
          onChange={e => update({ name: e.target.value })}
          className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none"
          placeholder="مثال: شاشة المدخل الرئيسي"
        />
      </div>

      {/* القالب */}
      <div>
        <label className="mb-1 block text-sm font-bold text-slate-700">القالب</label>
        <div className="flex flex-wrap gap-2">
          {SCREEN_TEMPLATE_OPTIONS.map(([key, label]) => (
            <button
              key={key}
              onClick={() => update({ template: key })}
              className={`rounded-2xl px-4 py-2 text-sm font-bold transition ${
                value.template === key ? 'bg-sky-700 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* الانتقال */}
      <div>
        <label className="mb-1 block text-sm font-bold text-slate-700">نوع الانتقال</label>
        <select
          value={value.transition || 'fade'}
          onChange={e => update({ transition: e.target.value })}
          className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none"
        >
          {SCREEN_TRANSITION_OPTIONS.map(([key, label]) => (
            <option key={key} value={key}>{label}</option>
          ))}
        </select>
      </div>

      {/* سرعة التبديل */}
      <div>
        <label className="mb-1 block text-sm font-bold text-slate-700">سرعة التبديل (ثانية)</label>
        <input
          type="number"
          min="4"
          max="30"
          value={value.rotateSeconds || 8}
          onChange={e => update({ rotateSeconds: Number(e.target.value) || 8 })}
          className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none"
        />
      </div>

      {/* الثيم */}
      <div>
        <label className="mb-1 block text-sm font-bold text-slate-700">ثيم الشاشة</label>
        <div className="flex flex-wrap gap-2">
          {SCREEN_THEME_OPTIONS.map(([key, label]) => (
            <button
              key={key}
              onClick={() => update({ theme: key })}
              className={`rounded-2xl px-4 py-2 text-sm font-bold transition ${
                value.theme === key ? 'bg-emerald-700 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* مصدر البيانات */}
      <div>
        <label className="mb-1 block text-sm font-bold text-slate-700">مصدر البيانات</label>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => update({ sourceMode: 'school', linkedClassroomId: '' })}
            className={`rounded-2xl px-4 py-2 text-sm font-bold transition ${
              value.sourceMode !== 'classroom' ? 'bg-sky-700 text-white' : 'bg-slate-100 text-slate-700'
            }`}
          >
            المدرسة كاملة
          </button>
          {classrooms.length > 0 && (
            <button
              onClick={() => update({ sourceMode: 'classroom' })}
              className={`rounded-2xl px-4 py-2 text-sm font-bold transition ${
                value.sourceMode === 'classroom' ? 'bg-sky-700 text-white' : 'bg-slate-100 text-slate-700'
              }`}
            >
              فصل محدد
            </button>
          )}
        </div>
        {value.sourceMode === 'classroom' && classrooms.length > 0 && (
          <select
            value={value.linkedClassroomId || ''}
            onChange={e => update({ linkedClassroomId: e.target.value })}
            className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none"
          >
            <option value="">اختر الفصل...</option>
            {classrooms.map(c => (
              <option key={c.id} value={c.id}>{c.name || c.gradeLabel || 'فصل'}</option>
            ))}
          </select>
        )}
      </div>

      {/* شريط الأخبار */}
      <div className="rounded-3xl bg-amber-50 p-5 ring-1 ring-amber-200">
        <div className="flex items-center justify-between">
          <label className="text-sm font-bold text-amber-800">شريط الأخبار</label>
          <button
            onClick={() => update({ tickerEnabled: !value.tickerEnabled })}
            className={`rounded-xl px-4 py-2 text-xs font-bold transition ${
              value.tickerEnabled ? 'bg-amber-600 text-white' : 'bg-white text-slate-700 ring-1 ring-slate-200'
            }`}
          >
            {value.tickerEnabled ? 'مفعل ✓' : 'معطل'}
          </button>
        </div>
        {value.tickerEnabled && (
          <div className="mt-4 space-y-3">
            <div>
              <label className="mb-1 block text-xs font-bold text-amber-700">نص الشريط (سطر لكل خبر)</label>
              <textarea
                value={value.tickerText || ''}
                onChange={e => update({ tickerText: e.target.value })}
                rows={3}
                className="w-full rounded-2xl border border-amber-200 bg-white px-4 py-3 text-sm outline-none"
                placeholder="أدخل الأخبار... سطر لكل خبر"
              />
            </div>
            <div className="flex flex-wrap gap-3">
              <div className="flex-1">
                <label className="mb-1 block text-xs font-bold text-amber-700">الاتجاه</label>
                <select
                  value={value.tickerDir || 'rtl'}
                  onChange={e => update({ tickerDir: e.target.value })}
                  className="w-full rounded-2xl border border-amber-200 bg-white px-3 py-2 text-sm outline-none"
                >
                  <option value="rtl">يمين لليسار</option>
                  <option value="ltr">يسار لليمين</option>
                </select>
              </div>
              <div className="flex-1">
                <label className="mb-1 block text-xs font-bold text-amber-700">لون الخلفية</label>
                <select
                  value={value.tickerBg || 'amber'}
                  onChange={e => update({ tickerBg: e.target.value })}
                  className="w-full rounded-2xl border border-amber-200 bg-white px-3 py-2 text-sm outline-none"
                >
                  {TICKER_BG_OPTIONS.map(([key, label]) => (
                    <option key={key} value={key}>{label}</option>
                  ))}
                </select>
              </div>
              <div className="flex-1">
                <label className="mb-1 block text-xs font-bold text-amber-700">الفاصل</label>
                <input
                  value={value.tickerSeparator || ' ✦ '}
                  onChange={e => update({ tickerSeparator: e.target.value })}
                  className="w-full rounded-2xl border border-amber-200 bg-white px-3 py-2 text-sm outline-none"
                />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* لوحات العرض (Widgets) */}
      <div>
        <label className="mb-2 block text-sm font-bold text-slate-700">لوحات العرض</label>
        <div className="grid grid-cols-2 gap-2 md:grid-cols-3 lg:grid-cols-4">
          {widgetList.map(w => (
            <button
              key={w.key}
              onClick={() => toggleWidget(w.key)}
              className={`rounded-2xl px-3 py-2 text-xs font-bold transition ${
                value.widgets?.[w.key] ? 'bg-emerald-100 text-emerald-800 ring-1 ring-emerald-300' : 'bg-slate-50 text-slate-500 ring-1 ring-slate-200'
              }`}
            >
              {value.widgets?.[w.key] ? '✓ ' : ''}{w.label}
            </button>
          ))}
        </div>
        <div className="mt-2 flex flex-wrap gap-2">
          <button
            onClick={() => {
              const all = {};
              widgetList.forEach(w => all[w.key] = true);
              onChange({ ...value, widgets: all });
            }}
            className="rounded-xl bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700 ring-1 ring-emerald-200"
          >
            تفعيل الكل
          </button>
          <button
            onClick={() => {
              const none = {};
              widgetList.forEach(w => none[w.key] = false);
              onChange({ ...value, widgets: none });
            }}
            className="rounded-xl bg-rose-50 px-3 py-1 text-xs font-bold text-rose-700 ring-1 ring-rose-200"
          >
            إلغاء الكل
          </button>
        </div>
      </div>

    </div>
  );
}

export default ScreenSettingsEditor;

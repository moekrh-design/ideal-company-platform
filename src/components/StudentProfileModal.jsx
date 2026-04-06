/**
 * StudentProfileModal — ملف الطالب الشامل
 * يُعرض كـ modal من أي صفحة تحتاج تفاصيل الطالب
 */
import React, { useMemo } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  X, User, Trophy, Star, ShieldAlert, Rocket, BookOpen,
  Phone, QrCode, Clock, CheckCircle2, XCircle, AlertTriangle,
  Calendar, Gift, TrendingUp, LogIn, Printer, Award, MinusCircle,
  UserCheck, UserX, BarChart2, Layers
} from 'lucide-react';
import {
  cx, getLeavePasses, getLessonAttendanceSessions,
  getStudentGroupingLabel, getTodayIso, formatDateTime
} from '../utils/sharedFunctions.jsx';
import { Badge } from '../components/ui/FormElements';

// ─── بطاقة KPI كبيرة ──────────────────────────────────────────────────────────
function StatCard({ label, value, tone = 'slate', icon: Icon, sub }) {
  const tones = {
    green:  'bg-emerald-50 text-emerald-700 ring-emerald-200',
    rose:   'bg-rose-50   text-rose-700   ring-rose-200',
    amber:  'bg-amber-50  text-amber-700  ring-amber-200',
    blue:   'bg-blue-50   text-blue-700   ring-blue-200',
    violet: 'bg-violet-50 text-violet-700 ring-violet-200',
    slate:  'bg-slate-50  text-slate-700  ring-slate-200',
    sky:    'bg-sky-50    text-sky-700    ring-sky-200',
    orange: 'bg-orange-50 text-orange-700 ring-orange-200',
  };
  const iconBg = {
    green:  'bg-emerald-100 text-emerald-600',
    rose:   'bg-rose-100   text-rose-600',
    amber:  'bg-amber-100  text-amber-600',
    blue:   'bg-blue-100   text-blue-600',
    violet: 'bg-violet-100 text-violet-600',
    slate:  'bg-slate-100  text-slate-600',
    sky:    'bg-sky-100    text-sky-600',
    orange: 'bg-orange-100 text-orange-600',
  };
  return (
    <div className={cx('flex flex-col items-center gap-2 rounded-2xl p-4 ring-1 text-center', tones[tone] || tones.slate)}>
      {Icon && (
        <div className={cx('flex h-9 w-9 items-center justify-center rounded-xl', iconBg[tone] || iconBg.slate)}>
          <Icon className="h-5 w-5" />
        </div>
      )}
      <div className="text-2xl font-black tabular-nums leading-none">{value}</div>
      <div className="text-xs font-semibold opacity-80">{label}</div>
      {sub && <div className="text-xs opacity-60">{sub}</div>}
    </div>
  );
}

// ─── سجل نشاط مدمج ───────────────────────────────────────────────────────────
function ActivityRow({ icon: Icon, color, label, sub, time }) {
  return (
    <div className="flex items-center gap-3 rounded-xl bg-slate-50 px-3 py-2.5 ring-1 ring-slate-100">
      <div className={cx('flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full', color)}>
        <Icon className="h-3.5 w-3.5" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="truncate text-sm font-semibold text-slate-800">{label}</div>
        {sub && <div className="text-xs text-slate-400 truncate">{sub}</div>}
      </div>
      {time && <div className="flex-shrink-0 text-xs text-slate-400 whitespace-nowrap">{time}</div>}
    </div>
  );
}

// ─── شريط تقدم ───────────────────────────────────────────────────────────────
function ProgressBar({ value, max, color = 'bg-emerald-500' }) {
  const pct = max > 0 ? Math.min(100, Math.round((value / max) * 100)) : 0;
  return (
    <div className="h-2 w-full rounded-full bg-slate-200 overflow-hidden">
      <div className={cx('h-full rounded-full transition-all', color)} style={{ width: `${pct}%` }} />
    </div>
  );
}

// ─── المكوّن الرئيسي ─────────────────────────────────────────────────────────
export function StudentProfileModal({ student, school, scanLog = [], actionLog = [], isOpen, onClose }) {
  if (!isOpen || !student) return null;

  const studentId = String(student.id);

  // ─── حضور الطالب ─────────────────────────────────────────────────────────
  const studentScans = useMemo(() => {
    return (scanLog || [])
      .filter((s) => String(s.studentId) === studentId && String(s.schoolId) === String(school?.id))
      .sort((a, b) => `${b.isoDate} ${b.time}`.localeCompare(`${a.isoDate} ${a.time}`));
  }, [scanLog, studentId, school]);

  const todayIso = getTodayIso();
  const todayScan = studentScans.find((s) => s.isoDate === todayIso);
  const presentDays = new Set(studentScans.map((s) => s.isoDate)).size;
  const lateDays = studentScans.filter((s) => String(s.result || '').includes('تأخر')).length;
  const earlyDays = studentScans.filter((s) => String(s.result || '').includes('مبكر')).length;

  // ─── حساب أيام الغياب ────────────────────────────────────────────────────
  // الغياب = أيام الدراسة التي لم يُسجَّل فيها الطالب
  const absenceDays = useMemo(() => {
    // نحسب الغياب من سجل الحضور الكلي للمدرسة
    const allSchoolScans = (scanLog || []).filter((s) => String(s.schoolId) === String(school?.id));
    const allSchoolDays = new Set(allSchoolScans.map((s) => s.isoDate));
    const studentPresentDays = new Set(studentScans.map((s) => s.isoDate));
    let absent = 0;
    allSchoolDays.forEach((day) => {
      if (!studentPresentDays.has(day)) absent++;
    });
    return absent;
  }, [scanLog, studentScans, school]);

  // ─── إجراءات الطالب ──────────────────────────────────────────────────────
  const studentActions = useMemo(() => {
    return (actionLog || [])
      .filter((a) => String(a.studentId) === studentId && String(a.schoolId) === String(school?.id))
      .sort((a, b) => `${b.isoDate} ${b.time}`.localeCompare(`${a.isoDate} ${a.time}`));
  }, [actionLog, studentId, school]);

  const rewards = studentActions.filter((a) => a.actionType === 'reward').length;
  const violations = studentActions.filter((a) => a.actionType === 'violation').length;
  const programs = studentActions.filter((a) => a.actionType === 'program').length;
  const recentActions = studentActions.slice(0, 10);

  // ─── حساب النقاط الإجمالية ───────────────────────────────────────────────
  const totalPoints = student.points || 0;

  // ─── نسبة الحضور ─────────────────────────────────────────────────────────
  const totalDays = presentDays + absenceDays;
  const attendanceRate = totalDays > 0 ? Math.round((presentDays / totalDays) * 100) : 0;

  // ─── استئذانات الطالب ────────────────────────────────────────────────────
  const studentLeaves = useMemo(() => {
    return (getLeavePasses(school) || [])
      .filter((lp) => String(lp.studentId) === studentId)
      .sort((a, b) => String(b.createdAt || '').localeCompare(String(a.createdAt || '')))
      .slice(0, 5);
  }, [school, studentId]);

  // ─── غياب الحصص ──────────────────────────────────────────────────────────
  const lessonAbsences = useMemo(() => {
    const sessions = getLessonAttendanceSessions(school) || [];
    return sessions
      .flatMap((session) =>
        (session.submissions || [])
          .filter((sub) => (sub.absentStudentIds || []).map(String).includes(studentId))
          .map((sub) => ({
            id: `${session.id}-${sub.id}`,
            label: `${sub.className || 'فصل'} — ${session.slotLabel || 'حصة'}`,
            teacher: sub.teacherName || 'معلم',
            date: session.dateIso || '',
          }))
      )
      .sort((a, b) => b.date.localeCompare(a.date))
      .slice(0, 5);
  }, [school, studentId]);

  // ─── الحالة اليوم ────────────────────────────────────────────────────────
  const todayStatus = todayScan
    ? (String(todayScan.result || '').includes('مبكر') ? { label: 'مبكر', tone: 'green' }
      : String(todayScan.result || '').includes('تأخر') ? { label: 'متأخر', tone: 'amber' }
      : { label: 'حاضر', tone: 'green' })
    : { label: 'لم يُسجَّل', tone: 'slate' };

  // ─── طباعة ───────────────────────────────────────────────────────────────
  const handlePrint = () => {
    const w = window.open('', '_blank', 'width=800,height=600');
    const actionRows = recentActions.map((a) => `
      <tr>
        <td>${a.actionType === 'reward' ? '🏆 مكافأة' : a.actionType === 'violation' ? '⚠️ خصم' : '🚀 برنامج'}</td>
        <td>${a.actionTitle || '—'}</td>
        <td>${a.actorName || '—'}</td>
        <td>${a.isoDate || ''} ${a.time || ''}</td>
      </tr>`).join('');
    const attendRows = studentScans.slice(0, 15).map((s) => `
      <tr><td>${s.isoDate || ''}</td><td>${s.time || ''}</td><td>${s.result || ''}</td></tr>`).join('');
    w.document.write(`<!doctype html><html dir="rtl"><head><meta charset="utf-8">
      <title>ملف الطالب — ${student.name}</title>
      <style>
        body{font-family:Arial,sans-serif;padding:24px;color:#0f172a;direction:rtl}
        h1{font-size:22px;margin:0 0 4px;color:#0f172a}
        .meta{color:#64748b;margin-bottom:20px;font-size:14px}
        .stats{display:grid;grid-template-columns:repeat(5,1fr);gap:12px;margin-bottom:24px}
        .stat{background:#f8fafc;border:1px solid #e2e8f0;border-radius:12px;padding:12px;text-align:center}
        .stat .v{font-size:24px;font-weight:900}.stat .k{font-size:12px;color:#64748b;margin-top:4px}
        .stat.blue{background:#eff6ff;border-color:#bfdbfe}.stat.blue .v{color:#1d4ed8}
        .stat.green{background:#f0fdf4;border-color:#bbf7d0}.stat.green .v{color:#15803d}
        .stat.rose{background:#fff1f2;border-color:#fecdd3}.stat.rose .v{color:#be123c}
        .stat.amber{background:#fffbeb;border-color:#fde68a}.stat.amber .v{color:#b45309}
        .stat.orange{background:#fff7ed;border-color:#fed7aa}.stat.orange .v{color:#c2410c}
        table{width:100%;border-collapse:collapse;margin-top:8px}
        th{background:#f8fafc;border:1px solid #dbe3ef;padding:8px;text-align:right;font-size:12px}
        td{border:1px solid #e2e8f0;padding:8px;font-size:12px}
        h2{font-size:16px;margin:20px 0 8px;color:#0f172a;border-bottom:2px solid #e2e8f0;padding-bottom:6px}
        .header{display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:20px;padding-bottom:16px;border-bottom:2px solid #0f172a}
        .info-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:8px;margin-bottom:20px}
        .info-item{background:#f8fafc;border:1px solid #e2e8f0;border-radius:8px;padding:10px}
        .info-item .k{font-size:11px;color:#64748b}.info-item .v{font-size:13px;font-weight:700;margin-top:2px}
      </style></head><body>
      <div class="header">
        <div>
          <h1>ملف الطالب الشامل</h1>
          <div class="meta">${school?.name || ''} • ${student.companyName || student.className || getStudentGroupingLabel(student, school)}</div>
        </div>
        <div style="text-align:left;color:#64748b;font-size:13px">
          <div style="font-size:18px;font-weight:800;color:#0f172a">${student.name}</div>
          <div>رقم الطالب: ${student.studentNumber || student.id}</div>
          <div>تاريخ الطباعة: ${new Date().toLocaleDateString('ar-SA')}</div>
        </div>
      </div>
      <div class="info-grid">
        <div class="info-item"><div class="k">رقم الهوية</div><div class="v">${student.nationalId || '—'}</div></div>
        <div class="info-item"><div class="k">جوال ولي الأمر</div><div class="v">${student.guardianMobile || student.parentMobile || '—'}</div></div>
        <div class="info-item"><div class="k">الحالة اليوم</div><div class="v">${todayStatus.label}</div></div>
      </div>
      <div class="stats">
        <div class="stat blue"><div class="v">${totalPoints}</div><div class="k">النقاط الإجمالية</div></div>
        <div class="stat green"><div class="v">${presentDays}</div><div class="k">أيام الحضور</div></div>
        <div class="stat orange"><div class="v">${absenceDays}</div><div class="k">أيام الغياب</div></div>
        <div class="stat green"><div class="v">${rewards}</div><div class="k">المكافآت</div></div>
        <div class="stat rose"><div class="v">${violations}</div><div class="k">الخصومات</div></div>
      </div>
      <h2>آخر الإجراءات (${studentActions.length} إجراء)</h2>
      <table><thead><tr><th>النوع</th><th>البند</th><th>المنفذ</th><th>التاريخ</th></tr></thead>
      <tbody>${actionRows || '<tr><td colspan="4" style="text-align:center;color:#94a3b8">لا توجد إجراءات</td></tr>'}</tbody></table>
      <h2>آخر سجل الحضور (${studentScans.length} عملية)</h2>
      <table><thead><tr><th>التاريخ</th><th>الوقت</th><th>النتيجة</th></tr></thead>
      <tbody>${attendRows || '<tr><td colspan="3" style="text-align:center;color:#94a3b8">لا يوجد سجل</td></tr>'}</tbody></table>
    </body></html>`);
    w.document.close();
    w.print();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-end justify-center bg-slate-900/60 backdrop-blur-sm sm:items-center sm:p-4"
          onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
        >
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 40 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="relative w-full max-h-[92vh] overflow-y-auto rounded-t-3xl bg-white shadow-2xl sm:max-w-2xl sm:rounded-3xl"
          >
            {/* ── هيدر الملف ── */}
            <div className="sticky top-0 z-10 border-b border-slate-100 bg-white">
              {/* شريط اللون العلوي */}
              <div className="h-1.5 w-full rounded-t-3xl bg-gradient-to-r from-sky-500 via-blue-600 to-violet-600" />
              <div className="flex items-center justify-between gap-3 px-5 py-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-sky-500 to-blue-600 text-white shadow-sm">
                    <User className="h-5 w-5" />
                  </div>
                  <div>
                    <div className="font-black text-slate-800 text-base">{student.name}</div>
                    <div className="text-xs text-slate-500 mt-0.5">
                      {student.companyName || student.className || getStudentGroupingLabel(student, school)}
                      {' • '}
                      <span className="font-mono">{student.studentNumber || student.id}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={handlePrint}
                    className="flex items-center gap-1.5 rounded-xl bg-slate-100 px-3 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-200 transition-colors"
                  >
                    <Printer className="h-3.5 w-3.5" /> طباعة
                  </button>
                  <button
                    onClick={onClose}
                    className="flex h-9 w-9 items-center justify-center rounded-xl text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>
              </div>
            </div>

            <div className="p-5 space-y-5">

              {/* ── بيانات أساسية ── */}
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 text-sm">
                {[
                  { label: 'رقم الهوية', value: student.nationalId || '—' },
                  { label: 'جوال ولي الأمر', value: student.guardianMobile || student.parentMobile || '—' },
                  { label: 'بصمة الوجه', value: student.faceReady ? 'مسجّلة ✓' : 'غير مسجّلة' },
                  {
                    label: 'الحالة اليوم',
                    value: todayStatus.label,
                    tone: todayStatus.tone,
                  },
                ].map((item) => (
                  <div key={item.label} className="rounded-2xl bg-slate-50 p-3 ring-1 ring-slate-200">
                    <div className="text-xs text-slate-400 mb-1">{item.label}</div>
                    <div className={cx(
                      'font-bold truncate',
                      item.tone === 'green' ? 'text-emerald-700' :
                      item.tone === 'amber' ? 'text-amber-700' :
                      'text-slate-800'
                    )}>{item.value}</div>
                  </div>
                ))}
              </div>

              {/* ── الإحصائيات الرئيسية (5 بطاقات) ── */}
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <BarChart2 className="h-4 w-4 text-slate-400" />
                  <span className="font-bold text-slate-700 text-sm">الإحصائيات الإجمالية</span>
                </div>
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
                  <StatCard
                    label="النقاط الإجمالية"
                    value={totalPoints}
                    tone="blue"
                    icon={Trophy}
                  />
                  <StatCard
                    label="أيام الحضور"
                    value={presentDays}
                    tone="green"
                    icon={UserCheck}
                  />
                  <StatCard
                    label="أيام الغياب"
                    value={absenceDays}
                    tone="orange"
                    icon={UserX}
                  />
                  <StatCard
                    label="المكافآت"
                    value={rewards}
                    tone="violet"
                    icon={Award}
                  />
                  <StatCard
                    label="الخصومات"
                    value={violations}
                    tone="rose"
                    icon={MinusCircle}
                  />
                </div>
              </div>

              {/* ── نسبة الحضور ── */}
              {totalDays > 0 && (
                <div className="rounded-2xl bg-slate-50 p-4 ring-1 ring-slate-200">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-bold text-slate-700">نسبة الحضور</span>
                    <span className={cx(
                      'text-sm font-black',
                      attendanceRate >= 80 ? 'text-emerald-600' :
                      attendanceRate >= 60 ? 'text-amber-600' :
                      'text-rose-600'
                    )}>{attendanceRate}%</span>
                  </div>
                  <ProgressBar
                    value={presentDays}
                    max={totalDays}
                    color={attendanceRate >= 80 ? 'bg-emerald-500' : attendanceRate >= 60 ? 'bg-amber-500' : 'bg-rose-500'}
                  />
                  <div className="flex justify-between mt-2 text-xs text-slate-400">
                    <span>حضر {presentDays} يوم</span>
                    <span>غاب {absenceDays} يوم</span>
                    <span>إجمالي {totalDays} يوم</span>
                  </div>
                </div>
              )}

              {/* ── إحصائيات إضافية ── */}
              <div className="grid grid-cols-3 gap-3">
                <StatCard label="التأخر" value={lateDays} tone="amber" icon={Clock} />
                <StatCard label="الحضور المبكر" value={earlyDays} tone="sky" icon={CheckCircle2} />
                <StatCard label="البرامج" value={programs} tone="violet" icon={Rocket} />
              </div>

              {/* ── آخر الإجراءات ── */}
              <div className="rounded-2xl bg-white ring-1 ring-slate-200">
                <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
                  <div className="flex items-center gap-2 font-bold text-slate-700 text-sm">
                    <BookOpen className="h-4 w-4 text-slate-400" /> آخر الإجراءات
                  </div>
                  <span className="text-xs text-slate-400 bg-slate-100 rounded-lg px-2 py-1">{studentActions.length} إجراء</span>
                </div>
                <div className="p-3 space-y-2">
                  {recentActions.length ? recentActions.map((a, i) => (
                    <ActivityRow
                      key={a.id || i}
                      icon={a.actionType === 'reward' ? Award : a.actionType === 'violation' ? ShieldAlert : Rocket}
                      color={
                        a.actionType === 'reward' ? 'bg-violet-100 text-violet-700' :
                        a.actionType === 'violation' ? 'bg-rose-100 text-rose-700' :
                        'bg-sky-100 text-sky-700'
                      }
                      label={a.actionTitle || 'إجراء'}
                      sub={a.actorName}
                      time={`${a.isoDate || ''} ${a.time || ''}`.trim()}
                    />
                  )) : (
                    <div className="rounded-xl bg-slate-50 p-4 text-center text-sm text-slate-400">لا توجد إجراءات مسجّلة</div>
                  )}
                </div>
              </div>

              {/* ── آخر سجل الحضور ── */}
              <div className="rounded-2xl bg-white ring-1 ring-slate-200">
                <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
                  <div className="flex items-center gap-2 font-bold text-slate-700 text-sm">
                    <Calendar className="h-4 w-4 text-slate-400" /> آخر سجل الحضور
                  </div>
                  <span className="text-xs text-slate-400 bg-slate-100 rounded-lg px-2 py-1">{studentScans.length} عملية</span>
                </div>
                <div className="p-3 space-y-2">
                  {studentScans.length ? studentScans.slice(0, 8).map((s, i) => {
                    const isEarly = String(s.result || '').includes('مبكر');
                    const isLate = String(s.result || '').includes('تأخر');
                    return (
                      <ActivityRow
                        key={s.id || i}
                        icon={isLate ? AlertTriangle : CheckCircle2}
                        color={isEarly ? 'bg-emerald-100 text-emerald-700' : isLate ? 'bg-amber-100 text-amber-700' : 'bg-blue-100 text-blue-700'}
                        label={s.result || 'حضور'}
                        sub={s.method || s.gateName}
                        time={`${s.isoDate || ''} ${s.time || ''}`.trim()}
                      />
                    );
                  }) : (
                    <div className="rounded-xl bg-slate-50 p-4 text-center text-sm text-slate-400">لا يوجد سجل حضور</div>
                  )}
                </div>
              </div>

              {/* ── الاستئذانات ── */}
              {studentLeaves.length > 0 && (
                <div className="rounded-2xl bg-white ring-1 ring-slate-200">
                  <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
                    <div className="flex items-center gap-2 font-bold text-slate-700 text-sm">
                      <LogIn className="h-4 w-4 text-slate-400" /> الاستئذانات
                    </div>
                    <span className="text-xs text-slate-400 bg-slate-100 rounded-lg px-2 py-1">{studentLeaves.length}</span>
                  </div>
                  <div className="p-3 space-y-2">
                    {studentLeaves.map((lp, i) => (
                      <ActivityRow
                        key={lp.id || i}
                        icon={LogIn}
                        color="bg-amber-100 text-amber-700"
                        label={lp.destination === 'agent' ? 'الوكيل' : lp.destination === 'counselor' ? 'المرشد' : 'ولي الأمر'}
                        sub={lp.note || lp.guardianName}
                        time={lp.createdAt ? new Date(lp.createdAt).toLocaleDateString('ar-SA') : ''}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* ── غياب الحصص ── */}
              {lessonAbsences.length > 0 && (
                <div className="rounded-2xl bg-white ring-1 ring-slate-200">
                  <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
                    <div className="flex items-center gap-2 font-bold text-slate-700 text-sm">
                      <XCircle className="h-4 w-4 text-slate-400" /> غياب الحصص
                    </div>
                    <span className="text-xs text-slate-400 bg-slate-100 rounded-lg px-2 py-1">{lessonAbsences.length}</span>
                  </div>
                  <div className="p-3 space-y-2">
                    {lessonAbsences.map((ab) => (
                      <ActivityRow
                        key={ab.id}
                        icon={XCircle}
                        color="bg-rose-100 text-rose-700"
                        label={ab.label}
                        sub={ab.teacher}
                        time={ab.date}
                      />
                    ))}
                  </div>
                </div>
              )}

            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default StudentProfileModal;

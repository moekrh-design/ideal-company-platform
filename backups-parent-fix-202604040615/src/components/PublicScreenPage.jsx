/**
 * ==========================================
 *  PublicScreenPage Component
 *  تم استخراجه تلقائياً من App.jsx
 * ==========================================
 */
import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  BadgeCheck, BarChart3, Bell, BookOpen, CheckCircle, Building2, Camera,
  ClipboardCheck, ClipboardList, Copy, Database, ExternalLink, Download,
  Gift, FileClock, GraduationCap, Layers3, LayoutDashboard, LineChart,
  Maximize2, Plus, QrCode, RefreshCw, Rocket, Wifi, WifiOff, Clock3,
  Save, ScanLine, School, ShoppingCart, Search, Settings, Shield,
  ShieldAlert, ShieldCheck, Trash2, Trophy, Upload, UserCircle2, Users,
  Wand2, Pencil, Archive, ArrowRightLeft, MonitorSmartphone, Loader2,
  PackageCheck, Printer, Unlink2, UserCheck, Phone, RefreshCcw, School2,
  Sparkles, FolderOpen, Info, ChevronDown, AlertCircle
} from 'lucide-react';
import {
  Bar, BarChart, CartesianGrid, Cell, LabelList, Legend,
  Line, LineChart as RLineChart, Pie, PieChart, ResponsiveContainer,
  Tooltip, XAxis, YAxis
} from 'recharts';
// === الدوال المشتركة ===
import { buildWsUrl, canAccessPermission, clamp, cx, exportToExcel, formatDateTime, formatEnglishDigits, generateQrDataUrl, getAuthActionMeta, getDisplayMotionVariant, getRoleLabel, getScreenTemplateLabel, getScreenTheme, getShortStudentName, getStudentCompanyName, getStudentGroupingLabel, getTickerTheme, getTodayIso, getUnifiedSchoolStudents, parseTimeToMinutes, pieColors, resultTone, roles, safeNumber, schoolHasStructureClassrooms, splitTickerItems, statusFromResult, toArabicDate, apiRequest} from '../utils/sharedFunctions.jsx';


import { SchoolTickerLogo } from './ui/SchoolTickerLogo';
import { MiniAttendanceRing } from './ui/MiniAttendanceRing';
import { RenderErrorBoundary } from './ui/RenderErrorBoundary';
import { ScreenAxisTick, ScreenBarValueLabel } from './ui/ScreenChartComponents';
import { SCREEN_RANDOM_TRANSITIONS } from '../constants/appConfig.js';
function PublicScreenPage({ token }) {
  const [payload, setPayload] = useState(null);
  const [error, setError] = useState('');
  const [slideIndex, setSlideIndex] = useState(0);
  const [now, setNow] = useState(() => new Date());

  const loadScreen = useCallback(async () => {
    try {
      const response = await apiRequest(`/api/public/screen/${token}`);
      setPayload(response);
      setError('');
    } catch (err) {
      setError(err?.message || 'تعذر تحميل الشاشة.');
    }
  }, [token]);

  useEffect(() => {
    loadScreen();
    // إعادة المحاولة كل  30 ثانية لضمان استمرار الشاشة
    const refreshId = window.setInterval(() => loadScreen(), 30000);
    const socket = new WebSocket(buildWsUrl(`/ws/public?kind=screen&token=${encodeURIComponent(token)}`));
    socket.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data || '{}');
        if (data?.type === 'live_update') {
          // تحديث payload حتى لو كان null (لم يكتمل loadScreen بعد)
          setPayload((prev) => ({
            ...(prev || {}),
            screen: data.screen || prev?.screen || {},
            live: data.live || prev?.live || {},
          }));
          setError('');
        }
      } catch {}
    };
    socket.onerror = () => console.warn('WebSocket screen stream unavailable');
    socket.onclose = () => {
      // إعادة التحميل عند انقطاع الاتصال
      setTimeout(() => loadScreen(), 3000);
    };
    return () => {
      window.clearInterval(refreshId);
      socket.close();
    };
  }, [loadScreen, token]);

  useEffect(() => {
    const id = window.setInterval(() => setNow(new Date()), 1000);
    return () => window.clearInterval(id);
  }, []);

  const live = payload?.live || {};
  const screen = payload?.screen || {};
  const widgets = screen.widgets || {};
  const transition = screen.transition || 'fade';
  const effectiveTransition = transition === 'random' ? SCREEN_RANDOM_TRANSITIONS[slideIndex % SCREEN_RANDOM_TRANSITIONS.length] : transition;
  const motionVariant = getDisplayMotionVariant(effectiveTransition);
  const rotateSeconds = Math.max(4, Number(screen.rotateSeconds) || 8);
  const screenTheme = getScreenTheme(screen.theme || 'emerald-night');
  const tickerTheme = getTickerTheme(screen.tickerBg || 'amber');
  const screenTemplate = screen.template || 'executive';
  const heroCardClass = screenTemplate === 'reception'
    ? 'rounded-[2.2rem] bg-white/95 p-8 text-slate-950 shadow-2xl ring-1 ring-slate-200'
    : 'rounded-[2.2rem] bg-white p-8 text-slate-950 shadow-2xl ring-1 ring-slate-200';
  const structureSpotlight = live?.structureSpotlight && typeof live.structureSpotlight === 'object' ? live.structureSpotlight : null;
  const summaryView = structureSpotlight?.summary && typeof structureSpotlight.summary === 'object' ? structureSpotlight.summary : (live.summary || {});
  const topStudentsView = Array.isArray(structureSpotlight?.students) && structureSpotlight.students.length ? structureSpotlight.students : (Array.isArray(live.topStudents) ? live.topStudents : []);
  const topCompaniesView = Array.isArray(structureSpotlight?.topCompanies) && structureSpotlight.topCompanies.length ? structureSpotlight.topCompanies : (Array.isArray(live.topCompanies) ? live.topCompanies : []);
  const attendanceTrendView = Array.isArray(structureSpotlight?.attendanceTrend) && structureSpotlight.attendanceTrend.length ? structureSpotlight.attendanceTrend : (Array.isArray(live.attendanceTrend) ? live.attendanceTrend : []);
  const recentAttendanceView = Array.isArray(structureSpotlight?.recentActivity) && structureSpotlight.recentActivity.length ? structureSpotlight.recentActivity : (Array.isArray(live.recentAttendance) ? live.recentAttendance : []);
  const safeSchoolName = live?.school?.name || payload?.school?.name || 'المدرسة';
  const clockTime = now.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false });
  const parentPortalSummary = live?.parentPortalSummary || null;
  const lessonAttendanceSummary = live?.lessonAttendanceSummary || null;
  const rewardStoreSummary = live?.rewardStoreSummary || null;
  const topStudentsChartData = useMemo(() => (topStudentsView || []).slice(0, 6).map((item, index) => ({
    rank: index + 1,
    name: getShortStudentName(String(item?.name || item?.student || item?.title || `طالب ${index + 1}`)),
    points: Number(item?.points || 0),
  })).sort((a, b) => b.points - a.points), [topStudentsView]);
  const topCompaniesMax = Math.max(1, Math.min(10, Number(screen?.topCompaniesMax || 3)));
  const topCompaniesLayout = screen?.topCompaniesLayout || 'auto';
  const topCompaniesChartData = useMemo(() => (topCompaniesView || []).slice(0, 6).map((item, index) => {
    const companyName = String(item?.companyName || item?.name || item?.title || `شركة ${index + 1}`);
    const className = String(item?.className || '');
    // إذا كان اسم الشركة مختلفاً عن اسم الفصل، أضف اسم الفصل
    const displayName = (className && className !== companyName) ? `${companyName} - ${className}` : companyName;
    return {
      rank: index + 1,
      name: displayName,
      companyName,
      className,
      points: Number(item?.points || 0),
    };
  }).sort((a, b) => b.points - a.points), [topCompaniesView]);

  const slides = useMemo(() => {
    try {
    if (structureSpotlight) {
      const classStudents = topStudentsView || [];
      const classActivities = recentAttendanceView || [];
      const attendanceDonut = [
        { name: 'النشطون', value: Number(summaryView?.presentToday || 0) },
        { name: 'المؤرشفون', value: Math.max(Number(summaryView?.violationsToday || 0), 0) },
      ].filter((item) => item.value > 0);
      return [
        {
          key: 'class-overview',
          title: 'لوحة الفصل',
          render: () => (
            <div className="grid h-full gap-5 xl:grid-cols-[1.25fr_0.95fr]">
              <div className="grid gap-5">
                <div className="rounded-[2.2rem] bg-white p-8 text-slate-950 shadow-2xl ring-1 ring-slate-200">
                  <div className="text-lg font-bold text-slate-500">الفصل المرتبط بالشاشة</div>
                  <div className="mt-3 text-5xl font-black xl:text-6xl">{structureSpotlight.classroomName || structureSpotlight.headline || 'الفصل'}</div>
                  <div className="mt-4 flex flex-wrap gap-3 text-lg">
                    <span className="rounded-full bg-sky-100 px-4 py-2 font-bold text-sky-800">الشركة: {structureSpotlight.companyName || '—'}</span>
                    <span className="rounded-full bg-violet-100 px-4 py-2 font-bold text-violet-800">رائد الفصل: {structureSpotlight.leaderName || '—'}</span>
                  </div>
                  <div className="mt-6 grid grid-cols-2 gap-4 xl:grid-cols-4">
                    <div className="rounded-[1.7rem] bg-slate-950 p-5 text-white"><div className="text-base text-white/70">عدد الطلاب</div><div className="mt-3 text-6xl font-black">{summaryView?.totalStudents || 0}</div></div>
                    <div className="rounded-[1.7rem] bg-emerald-600 p-5 text-white"><div className="text-base text-white/75">النشطون</div><div className="mt-3 text-6xl font-black">{summaryView?.presentToday || 0}</div></div>
                    <div className="rounded-[1.7rem] bg-rose-600 p-5 text-white"><div className="text-base text-white/75">المؤرشفون</div><div className="mt-3 text-6xl font-black">{summaryView?.violationsToday || 0}</div></div>
                    <div className="rounded-[1.7rem] bg-amber-500 p-5 text-white"><div className="text-base text-white/75">نسبة الجاهزية</div><div className="mt-3 text-6xl font-black">{summaryView?.attendanceRate || 0}%</div></div>
                  </div>
                </div>
                <div className="rounded-[2.2rem] bg-white p-8 text-slate-950 shadow-2xl ring-1 ring-slate-200">
                  <div className="mb-5 text-3xl font-black">أسماء من الفصل</div>
                  <div className="grid gap-4 xl:grid-cols-2">
                    {classStudents.slice(0, 8).map((student, index) => (
                      <div key={student.id || index} className="rounded-[1.6rem] bg-slate-100 p-5 ring-1 ring-slate-200">
                        <div className="text-3xl font-black">{student.name}</div>
                        <div className="mt-2 text-lg text-slate-500">ترتيب العرض: {index + 1}</div>
                      </div>
                    ))}
                    {!classStudents.length ? <div className="rounded-[1.6rem] bg-slate-100 p-6 text-xl font-bold text-slate-500 ring-1 ring-slate-200">لا توجد أسماء معروضة لهذا الفصل حتى الآن.</div> : null}
                  </div>
                </div>
              </div>
              <div className="grid gap-5">
                <div className="rounded-[2.2rem] bg-white p-8 text-slate-950 shadow-2xl ring-1 ring-slate-200">
                  <div className="mb-5 text-3xl font-black">مؤشرات الفصل</div>
                  {attendanceDonut.length ? (
                    <ResponsiveContainer width="100%" height={300}>
                      <PieChart>
                        <Pie data={attendanceDonut} dataKey="value" nameKey="name" innerRadius={70} outerRadius={110} paddingAngle={6}>
                          {attendanceDonut.map((entry, index) => (
                            <Cell key={entry.name} fill={index === 0 ? '#10b981' : '#f43f5e'} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="rounded-[1.6rem] bg-slate-100 p-6 text-lg font-bold text-slate-500 ring-1 ring-slate-200">لا توجد بيانات كافية لعرض المؤشرات الدائرية.</div>
                  )}
                  <div className="mt-4 grid gap-3">
                    {attendanceDonut.map((item, index) => (
                      <div key={item.name} className="flex items-center justify-between rounded-2xl bg-slate-100 px-4 py-3 text-lg font-bold ring-1 ring-slate-200">
                        <span className="inline-flex items-center gap-3"><span className="h-4 w-4 rounded-full" style={{ backgroundColor: index === 0 ? '#10b981' : '#f43f5e' }} />{getShortStudentName(item.name)}</span>
                        <span>{item.value}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="rounded-[2.2rem] bg-white p-8 text-slate-950 shadow-2xl ring-1 ring-slate-200">
                  <div className="mb-5 text-3xl font-black">آخر النشاطات في الفصل</div>
                  <div className="grid gap-4">
                    {classActivities.slice(0, 6).map((item) => (
                      <div key={item.id} className="rounded-[1.5rem] bg-slate-100 p-5 ring-1 ring-slate-200">
                        <div className="text-2xl font-black">{getShortStudentName(item.student || item.name)}</div>
                        <div className="mt-2 text-lg text-slate-500">{item.result || 'نشاط'} {item.time ? `• ${item.time}` : ''}</div>
                      </div>
                    ))}
                    {!classActivities.length ? <div className="rounded-[1.6rem] bg-slate-100 p-6 text-lg font-bold text-slate-500 ring-1 ring-slate-200">لا توجد نشاطات حديثة لهذا الفصل.</div> : null}
                  </div>
                </div>
              </div>
            </div>
          ),
        },
        {
          key: 'class-chart',
          title: 'تحليل الفصل',
          render: () => (
            <div className="grid h-full gap-5 xl:grid-cols-[1.1fr_0.9fr]">
              <div className="rounded-[2.2rem] bg-white p-8 text-slate-950 shadow-2xl ring-1 ring-slate-200">
                <div className="mb-5 text-3xl font-black">المؤشرات البيانية للفصل</div>
                <ResponsiveContainer width="100%" height="86%">
                  <BarChart data={attendanceTrendView || []} margin={{ top: 20, right: 30, left: 10, bottom: 10 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="day" tick={{ fontSize: 18, fontWeight: 700 }} />
                    <YAxis tick={{ fontSize: 16, fontWeight: 700 }} />
                    <Tooltip />
                    <Bar dataKey="attendance" fill="#0ea5e9" radius={[12, 12, 0, 0]} />
                    <Bar dataKey="early" fill="#10b981" radius={[12, 12, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <div className="grid gap-5">
                <div className="rounded-[2.2rem] bg-white p-8 text-slate-950 shadow-2xl ring-1 ring-slate-200">
                  <div className="mb-5 text-3xl font-black">نبذة سريعة</div>
                  <div className="grid gap-4 text-xl">
                    <div className="rounded-[1.5rem] bg-slate-100 px-5 py-4 ring-1 ring-slate-200"><span className="font-black">الفصل:</span> {structureSpotlight.classroomName || '—'}</div>
                    <div className="rounded-[1.5rem] bg-slate-100 px-5 py-4 ring-1 ring-slate-200"><span className="font-black">الشركة:</span> {structureSpotlight.companyName || '—'}</div>
                    <div className="rounded-[1.5rem] bg-slate-100 px-5 py-4 ring-1 ring-slate-200"><span className="font-black">رائد الفصل:</span> {structureSpotlight.leaderName || '—'}</div>
                    <div className="rounded-[1.5rem] bg-slate-100 px-5 py-4 ring-1 ring-slate-200"><span className="font-black">الجاهزون للتواصل:</span> {topCompaniesView.find((item) => String(item.className || '').includes('جهوزية'))?.points || 0}</div>
                  </div>
                </div>
                <div className="rounded-[2.2rem] bg-white p-8 text-slate-950 shadow-2xl ring-1 ring-slate-200">
                  <div className="mb-5 text-3xl font-black">ملخص سريع</div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="rounded-[1.5rem] bg-emerald-50 p-5 text-center ring-1 ring-emerald-200"><div className="text-base font-bold text-emerald-700">النشطون</div><div className="mt-2 text-5xl font-black text-emerald-700">{summaryView?.presentToday || 0}</div></div>
                    <div className="rounded-[1.5rem] bg-rose-50 p-5 text-center ring-1 ring-rose-200"><div className="text-base font-bold text-rose-700">المؤرشفون</div><div className="mt-2 text-5xl font-black text-rose-700">{summaryView?.violationsToday || 0}</div></div>
                    <div className="rounded-[1.5rem] bg-sky-50 p-5 text-center ring-1 ring-sky-200"><div className="text-base font-bold text-sky-700">إجمالي الطلاب</div><div className="mt-2 text-5xl font-black text-sky-700">{summaryView?.totalStudents || 0}</div></div>
                    <div className="rounded-[1.5rem] bg-amber-50 p-5 text-center ring-1 ring-amber-200"><div className="text-base font-bold text-amber-700">نسبة الجاهزية</div><div className="mt-2 text-5xl font-black text-amber-700">{summaryView?.attendanceRate || 0}%</div></div>
                  </div>
                </div>
              </div>
            </div>
          ),
        },
      ];
    }

    const items = [];
    if (widgets.metrics !== false) {
      items.push({
        key: 'metrics',
        title: 'المؤشرات الرئيسية',
        render: () => (
          <div className="flex h-full items-center justify-center">
            <div className={cx('grid w-full max-w-[1500px] gap-6', screenTemplate === 'reception' ? 'grid-cols-1 xl:grid-cols-[1.15fr_1.2fr]' : 'grid-cols-1 xl:grid-cols-3')}>
              {screenTemplate === 'reception' ? (
                <div className={cx(heroCardClass, 'flex flex-col justify-between bg-gradient-to-l from-white to-sky-50')}>
                  <div>
                    <div className="text-xl font-bold text-slate-500">مرحبًا بكم في</div>
                    <div className="mt-3 text-5xl font-black leading-tight text-slate-950 xl:text-6xl">{live.school?.name || screen.title || 'لوحة المدرسة'}</div>
                    <div className="mt-4 text-2xl text-slate-600">عرض حي للحضور والانضباط والتميّز الطلابي</div>
                  </div>
                  <div className="grid grid-cols-2 gap-4 pt-6">
                    <div className="rounded-[1.7rem] bg-slate-950 p-6 text-white"><div className="text-lg text-white/70">الحاضرون الآن</div><div className="mt-3 text-7xl font-black">{formatEnglishDigits(summaryView?.presentToday || 0)}</div></div>
                    <div className="rounded-[1.7rem] bg-white p-3 text-slate-950 ring-1 ring-slate-200 flex flex-col items-center justify-center"><div className="text-center text-lg font-bold text-slate-500">نسبة الحضور</div><MiniAttendanceRing value={summaryView?.attendanceRate || 0} /></div>
                  </div>
                </div>
              ) : null}
              <div className={cx('grid gap-6', screenTemplate === 'reception' ? 'xl:col-span-1 grid-cols-2 xl:grid-cols-2' : 'grid-cols-2 xl:col-span-3 xl:grid-cols-3', screenTemplate === 'leaderboard' ? 'xl:col-span-3' : '')}>
                <div className="rounded-[2rem] bg-white p-7 text-center text-slate-950 shadow-2xl ring-1 ring-slate-200"><div className="text-2xl font-bold text-slate-500">الحاضرون اليوم</div><div className="mt-5 text-7xl font-black text-slate-900 xl:text-8xl">{formatEnglishDigits(summaryView?.presentToday || 0)}</div><div className="mt-4 text-2xl text-slate-500">من {formatEnglishDigits(summaryView?.totalStudents || 0)} طالب</div></div>
                <div className="rounded-[2rem] bg-white p-4 text-slate-950 shadow-2xl ring-1 ring-slate-200 flex flex-col items-center justify-center"><div className="text-center text-2xl font-bold text-slate-500">نسبة الحضور</div><MiniAttendanceRing value={summaryView?.attendanceRate || 0} /></div>
                <div className="rounded-[2rem] bg-white p-7 text-center text-slate-950 shadow-2xl ring-1 ring-slate-200"><div className="text-2xl font-bold text-slate-500">المبكرون</div><div className="mt-5 text-7xl font-black text-emerald-700 xl:text-8xl">{formatEnglishDigits(summaryView?.earlyToday || 0)}</div><div className="mt-4 text-2xl text-slate-500">اليوم</div></div>
                <div className="rounded-[2rem] bg-white p-7 text-center text-slate-950 shadow-2xl ring-1 ring-slate-200"><div className="text-2xl font-bold text-slate-500">المكافآت</div><div className="mt-5 text-7xl font-black text-violet-700 xl:text-8xl">{formatEnglishDigits(summaryView?.rewardsToday || 0)}</div><div className="mt-4 text-2xl text-slate-500">اليوم</div></div>
                <div className="rounded-[2rem] bg-white p-7 text-center text-slate-950 shadow-2xl ring-1 ring-slate-200"><div className="text-2xl font-bold text-slate-500">الخصومات</div><div className="mt-5 text-7xl font-black text-rose-700 xl:text-8xl">{formatEnglishDigits(summaryView?.violationsToday || 0)}</div><div className="mt-4 text-2xl text-slate-500">اليوم</div></div>
                <div className="rounded-[2rem] bg-white p-7 text-center text-slate-950 shadow-2xl ring-1 ring-slate-200"><div className="text-2xl font-bold text-slate-500">البرامج</div><div className="mt-5 text-7xl font-black text-amber-700 xl:text-8xl">{formatEnglishDigits(summaryView?.programsToday || 0)}</div><div className="mt-4 text-2xl text-slate-500">اليوم</div></div>
              </div>
            </div>
          </div>
        ),
      });
    }
    if (widgets.attendanceChart !== false) {
      items.push({
        key: 'attendanceChart',
        title: 'الرسم البياني للحضور',
        render: () => (
          <div className={cx('h-full rounded-[2.2rem] bg-white p-8 text-slate-950 shadow-2xl ring-1 ring-slate-200', screenTemplate === 'executive' ? 'border-2 border-sky-200' : '')}>
            <div className="mb-5 flex items-center justify-between">
              <div className="text-4xl font-black xl:text-5xl">الحضور خلال الأيام الأخيرة</div>
              <div className="flex items-center gap-3 text-lg font-bold">
                <span className="inline-flex items-center gap-2 rounded-full bg-sky-50 px-4 py-2 text-sky-700 ring-1 ring-sky-200"><span className="h-3.5 w-3.5 rounded-full bg-sky-500" />الحضور</span>
                <span className="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-4 py-2 text-emerald-700 ring-1 ring-emerald-200"><span className="h-3.5 w-3.5 rounded-full bg-emerald-500" />المبكر</span>
              </div>
            </div>
            <ResponsiveContainer width="100%" height="86%">
              <BarChart data={attendanceTrendView || []} margin={{ top: 30, right: 52, left: 26, bottom: 18 }} barCategoryGap={24}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#cbd5e1" />
                <XAxis dataKey="day" tick={{ fontSize: 22, fontWeight: 900, fill: '#0f172a' }} axisLine={false} tickLine={false} />
                <YAxis tickFormatter={(value) => formatEnglishDigits(value)} tick={{ fontSize: 20, fontWeight: 900, fill: '#334155' }} axisLine={false} tickLine={false} width={56} />
                <Tooltip contentStyle={{ borderRadius: '18px', border: '1px solid #cbd5e1', fontWeight: 800 }} formatter={(value) => formatEnglishDigits(value)} />
                <Bar dataKey="attendance" name="الحضور" fill="#0ea5e9" radius={[18, 18, 0, 0]} barSize={64}>
                  <LabelList dataKey="attendance" position="insideTop" offset={14} formatter={(value) => formatEnglishDigits(value)} style={{ fill: '#ffffff', fontSize: 26, fontWeight: 900 }} />
                </Bar>
                <Bar dataKey="early" name="المبكر" fill="#10b981" radius={[18, 18, 0, 0]} barSize={64}>
                  <LabelList dataKey="early" position="insideTop" offset={14} formatter={(value) => formatEnglishDigits(value)} style={{ fill: '#ffffff', fontSize: 26, fontWeight: 900 }} />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        ),
      });
    }
    if (widgets.topStudents !== false) {
      items.push({
        key: 'topStudents',
        title: 'الطلاب المتميزون',
        render: () => (
          <div className={cx('h-full rounded-[2.2rem] bg-white p-8 text-slate-950 shadow-2xl ring-1 ring-slate-200', screenTemplate === 'leaderboard' ? 'bg-gradient-to-l from-white to-amber-50' : '')}>
            <div className="mb-5 flex items-center justify-between text-3xl font-black xl:text-4xl"><span>أعلى الطلاب نقاطًا</span>{screenTemplate === 'leaderboard' ? <span className="rounded-full bg-amber-100 px-4 py-2 text-lg text-amber-800">قالب المنافسة</span> : null}</div>
            <ResponsiveContainer width="100%" height="86%">
              <BarChart data={topStudentsChartData} layout="vertical" margin={{ left: 320, right: 150, top: 12, bottom: 12 }} barCategoryGap={18}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e2e8f0" />
                <XAxis type="number" tickFormatter={(value) => formatEnglishDigits(value)} tick={{ fontSize: 20, fontWeight: 900, fill: '#334155' }} axisLine={false} tickLine={false} />
                <YAxis type="category" dataKey="name" width={310} axisLine={false} tickLine={false} tick={(props) => <ScreenAxisTick {...props} width={300} />} />
                <Tooltip contentStyle={{ borderRadius: '18px', border: '1px solid #cbd5e1', fontWeight: 800 }} formatter={(value) => [`${formatEnglishDigits(value)} نقطة`, 'النقاط']} />
                <Bar dataKey="points" fill="#10b981" radius={[0, 20, 20, 0]} barSize={48}>
                  <LabelList dataKey="points" content={(props) => <ScreenBarValueLabel {...props} suffix="" />} />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        ),
      });
    }
    if (widgets.topCompanies !== false) {
      const displayedCompanies = (topCompaniesChartData || []).slice(0, topCompaniesMax);
      const useGrid = topCompaniesLayout === 'grid' || (topCompaniesLayout === 'auto' && topCompaniesMax > 4);
      const rankGradients = [
        { grad: 'from-amber-400 to-yellow-300', text: 'text-amber-900', badge: 'bg-amber-500', barColor: '#f59e0b', medal: '🥇' },
        { grad: 'from-slate-300 to-slate-200', text: 'text-slate-700', badge: 'bg-slate-400', barColor: '#94a3b8', medal: '🥈' },
        { grad: 'from-orange-400 to-amber-300', text: 'text-orange-900', badge: 'bg-orange-500', barColor: '#f97316', medal: '🥉' },
        { grad: 'from-sky-400 to-blue-300', text: 'text-sky-900', badge: 'bg-sky-500', barColor: '#0ea5e9', medal: '4' },
        { grad: 'from-violet-400 to-purple-300', text: 'text-violet-900', badge: 'bg-violet-500', barColor: '#8b5cf6', medal: '5' },
        { grad: 'from-emerald-400 to-green-300', text: 'text-emerald-900', badge: 'bg-emerald-500', barColor: '#10b981', medal: '6' },
      ];
      const maxPoints = Math.max(...displayedCompanies.map(c => c.points || 0), 1);
      items.push({
        key: 'topCompanies',
        title: 'ترتيب الشركات',
        render: () => {
          // تحديد عدد الأعمدة بناءً على عدد الشركات
          const count = displayedCompanies.length;
          const cols = count <= 3 ? 1 : count <= 6 ? 2 : 3;
          const useColLayout = useGrid || (topCompaniesLayout === 'auto' && count > 3);
          return (
            <div className="flex h-full flex-col rounded-[2.2rem] bg-gradient-to-br from-[#0f172a] via-[#1e293b] to-[#0f172a] p-5 text-white shadow-2xl overflow-hidden">
              {/* Header مضغوط */}
              <div className="mb-4 flex items-center justify-between flex-shrink-0">
                <div className="flex items-center gap-4">
                  <div>
                    <div className="text-3xl font-black tracking-tight xl:text-4xl">ترتيب الشركات</div>
                    <div className="mt-0.5 text-sm font-bold text-slate-400">المؤشر التنافسي الحي</div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2 rounded-full bg-emerald-500/20 px-3 py-1.5 ring-1 ring-emerald-500/40">
                    <div className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse"></div>
                    <span className="text-xs font-black text-emerald-300">مباشر</span>
                  </div>
                  <div className="rounded-xl bg-white/10 px-3 py-1.5 text-center">
                    <div className="text-xs text-slate-400">الشركات</div>
                    <div className="text-xl font-black">{formatEnglishDigits(count)}</div>
                  </div>
                </div>
              </div>
              {/* قائمة الشركات */}
              <div
                className="flex-1 min-h-0 overflow-hidden"
                style={{
                  display: 'grid',
                  gap: '0.6rem',
                  gridTemplateColumns: useColLayout ? `repeat(${cols}, 1fr)` : '1fr',
                  alignContent: 'stretch',
                }}
              >
                {displayedCompanies.map((item, index) => {
                  const rank = rankGradients[index] || rankGradients[rankGradients.length - 1];
                  const pct = maxPoints > 0 ? Math.round((item.points / maxPoints) * 100) : 0;
                  const isTop3 = index < 3;
                  const medals = ['🥇', '🥈', '🥉'];
                  const rankColors = [
                    { bg: 'linear-gradient(135deg, #f59e0b 0%, #fbbf24 50%, #f59e0b 100%)', text: '#78350f', badge: '#d97706', bar: 'rgba(120,53,15,0.35)' },
                    { bg: 'linear-gradient(135deg, #94a3b8 0%, #cbd5e1 50%, #94a3b8 100%)', text: '#1e293b', badge: '#64748b', bar: 'rgba(30,41,59,0.25)' },
                    { bg: 'linear-gradient(135deg, #f97316 0%, #fb923c 50%, #f97316 100%)', text: '#7c2d12', badge: '#ea580c', bar: 'rgba(124,45,18,0.35)' },
                  ];
                  const rc = isTop3 ? rankColors[index] : null;
                  return (
                    <div
                      key={item.id || item.name || index}
                      className="relative flex items-center gap-3 overflow-hidden rounded-2xl px-4 py-3 ring-1 ring-white/10"
                      style={rc ? { background: rc.bg } : { background: 'rgba(255,255,255,0.07)', backdropFilter: 'blur(8px)' }}
                    >
                      {/* رقم الترتيب */}
                      <div
                        className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl text-2xl font-black shadow-md"
                        style={rc ? { background: rc.badge, color: '#fff' } : { background: 'rgba(255,255,255,0.15)', color: '#fff' }}
                      >
                        {isTop3 ? medals[index] : formatEnglishDigits(index + 1)}
                      </div>
                      {/* اسم الشركة */}
                      <div className="min-w-0 flex-1">
                        <div
                          className="truncate text-xl font-black leading-tight xl:text-2xl"
                          style={{ color: rc ? rc.text : '#fff' }}
                          title={item.companyName || item.name}
                        >
                          {item.companyName || item.name}
                        </div>
                        {item.className && item.className !== (item.companyName || item.name) && (
                          <div className="mt-0.5 truncate text-sm font-bold" style={{ color: rc ? rc.text + 'aa' : 'rgba(255,255,255,0.55)' }}>
                            {item.className}
                          </div>
                        )}
                        {/* شريط التقدم */}
                        <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full" style={{ background: rc ? 'rgba(0,0,0,0.15)' : 'rgba(255,255,255,0.12)' }}>
                          <div
                            className="h-full rounded-full transition-all duration-700"
                            style={{ width: `${pct}%`, background: rc ? rc.bar : 'rgba(255,255,255,0.5)' }}
                          />
                        </div>
                      </div>
                      {/* النقاط */}
                      <div
                        className="flex-shrink-0 rounded-xl px-3 py-2 text-center shadow-sm"
                        style={rc ? { background: 'rgba(0,0,0,0.18)' } : { background: 'rgba(255,255,255,0.12)' }}
                      >
                        <div
                          className="text-2xl font-black leading-none xl:text-3xl"
                          style={{ color: rc ? rc.text : '#fff' }}
                        >
                          {formatEnglishDigits(item.points)}
                        </div>
                        <div className="mt-0.5 text-xs font-bold" style={{ color: rc ? rc.text + '99' : 'rgba(255,255,255,0.55)' }}>نقطة</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        },
      });
    }


    if (widgets.lessonAttendanceSummary !== false && lessonAttendanceSummary && (screen.sourceMode || 'school') !== 'classroom') {
      const lessonBars = [
        { name: 'أرسل لهم', value: Number(lessonAttendanceSummary.sentTeachers || 0) },
        { name: 'فتحوا الرابط', value: Number(lessonAttendanceSummary.openedTeachers || 0) },
        { name: 'اعتمدوا', value: Number(lessonAttendanceSummary.submittedTeachers || 0) },
      ];
      items.push({
        key: 'lessonAttendanceSummary',
        title: 'تحضير الحصص',
        render: () => (
          <div className="grid h-full gap-4 xl:grid-cols-[1.15fr_0.85fr]" style={{ minHeight: 0 }}>
            {/* العمود الأيمن: الإحصائيات */}
            <div className="flex min-h-0 flex-col rounded-[2rem] bg-white p-5 text-slate-950 shadow-xl ring-1 ring-slate-200">
              {/* رأس القسم */}
              <div className="mb-3 flex flex-shrink-0 items-center justify-between">
                <div>
                  <div className="text-3xl font-black xl:text-4xl">تحضير الحصص</div>
                  <div className="mt-0.5 text-sm text-slate-500">{lessonAttendanceSummary.label || 'آخر جلسة تحضير'}</div>
                </div>
                <div className={cx('rounded-full px-4 py-2 text-base font-black', lessonAttendanceSummary.status === 'closed' ? 'bg-slate-100 text-slate-700' : 'bg-emerald-100 text-emerald-800')}>
                  {lessonAttendanceSummary.status === 'closed' ? 'مغلقة' : 'مفتوحة'}
                </div>
              </div>
              {/* إحصائيات رئيسية */}
              <div className="mb-3 grid flex-shrink-0 grid-cols-4 gap-2">
                {[
                  ['المستهدفون', lessonAttendanceSummary.expectedTeachers || 0, 'text-slate-900', 'bg-slate-50 ring-slate-200'],
                  ['المرسل لهم', lessonAttendanceSummary.sentTeachers || 0, 'text-violet-700', 'bg-violet-50 ring-violet-100'],
                  ['اعتمدوا', lessonAttendanceSummary.submittedTeachers || 0, 'text-emerald-700', 'bg-emerald-50 ring-emerald-100'],
                  ['الغائبون', lessonAttendanceSummary.totalAbsent || 0, 'text-rose-700', 'bg-rose-50 ring-rose-100'],
                ].map(([label, value, tone, box]) => (
                  <div key={label} className={cx('rounded-2xl p-3 text-center ring-1', box)}>
                    <div className="text-xs font-bold text-slate-500 leading-tight">{label}</div>
                    <div className={cx('mt-1 text-3xl font-black xl:text-4xl', tone)}>{formatEnglishDigits(value)}</div>
                  </div>
                ))}
              </div>
              {/* قائمة الفصول */}
              <div className="flex-1 min-h-0 overflow-auto">
                <div className="grid gap-2">
                  {(lessonAttendanceSummary.classRows || []).slice(0, 6).map((item) => (
                    <div key={item.name} className="flex items-center justify-between rounded-2xl bg-slate-50 px-4 py-3 ring-1 ring-slate-200">
                      <span className="font-black text-slate-900">{item.name}</span>
                      <span className="flex gap-2">
                        <span className="rounded-full bg-emerald-100 px-3 py-1 text-sm font-black text-emerald-800">{formatEnglishDigits(item.present)} حاضر</span>
                        <span className="rounded-full bg-rose-100 px-3 py-1 text-sm font-black text-rose-800">{formatEnglishDigits(item.absent)} غائب</span>
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            {/* العمود الأيسر: مراحل التنفيذ + ملخص */}
            <div className="flex min-h-0 flex-col gap-3">
              {/* مراحل التنفيذ */}
              <div className="flex-1 min-h-0 rounded-[2rem] bg-white p-5 text-slate-950 shadow-xl ring-1 ring-slate-200">
                <div className="mb-2 flex-shrink-0 text-xl font-black">مراحل التنفيذ</div>
                <div className="h-[calc(100%-2.5rem)] min-h-0">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={lessonBars} margin={{ top: 16, right: 8, left: 0, bottom: 8 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                      <XAxis dataKey="name" tick={{ fontSize: 13, fontWeight: 900, fill: '#0f172a' }} axisLine={false} tickLine={false} />
                      <YAxis allowDecimals={false} tick={{ fontSize: 12, fontWeight: 800, fill: '#334155' }} axisLine={false} tickLine={false} />
                      <Tooltip contentStyle={{ borderRadius: '14px', border: '1px solid #cbd5e1', fontWeight: 800 }} />
                      <Bar dataKey="value" fill="#0ea5e9" radius={[14, 14, 0, 0]}>
                        <LabelList dataKey="value" position="top" formatter={(value) => formatEnglishDigits(value)} style={{ fill: '#0f172a', fontSize: 16, fontWeight: 900 }} />
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
              {/* ملخص سريع */}
              <div className="flex-shrink-0 rounded-[2rem] bg-white p-5 text-slate-950 shadow-xl ring-1 ring-slate-200">
                <div className="mb-3 text-xl font-black">ملخص سريع</div>
                <div className="grid grid-cols-3 gap-2">
                  <div className="rounded-xl bg-sky-50 px-3 py-2 ring-1 ring-sky-200">
                    <div className="text-xs font-bold text-sky-700">فتحوا الرابط</div>
                    <div className="mt-1 text-3xl font-black text-sky-700">{formatEnglishDigits(lessonAttendanceSummary.openedTeachers || 0)}</div>
                  </div>
                  <div className="rounded-xl bg-emerald-50 px-3 py-2 ring-1 ring-emerald-200">
                    <div className="text-xs font-bold text-emerald-700">الحاضرون</div>
                    <div className="mt-1 text-3xl font-black text-emerald-700">{formatEnglishDigits(lessonAttendanceSummary.totalPresent || 0)}</div>
                  </div>
                  <div className="rounded-xl bg-rose-50 px-3 py-2 ring-1 ring-rose-200">
                    <div className="text-xs font-bold text-rose-700">الغائبون</div>
                    <div className="mt-1 text-3xl font-black text-rose-700">{formatEnglishDigits(lessonAttendanceSummary.totalAbsent || 0)}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ),

      });
    }


    if (widgets.rewardStoreSummary !== false && rewardStoreSummary && (screen.sourceMode || 'school') !== 'classroom') {
      const sourceRows = [
        { name: 'المدرسة', value: Number(rewardStoreSummary.schoolSourceCount || 0) },
        { name: 'أولياء الأمور', value: Number(rewardStoreSummary.parentSourceCount || 0) },
        { name: 'متبرعون', value: Number(rewardStoreSummary.externalSourceCount || 0) },
      ].filter((row) => row.value > 0);
      items.push({
        key: 'rewardStoreSummary',
        title: 'محتويات متجر النقاط',
        render: () => (
          <div className="grid h-full gap-4 xl:grid-cols-[1fr_0.28fr]" style={{ minHeight: 0 }}>
            {/* العمود الأيمن: قائمة الجوائز */}
            <div className="flex min-h-0 flex-col rounded-[2rem] bg-white p-5 text-slate-950 shadow-xl ring-1 ring-slate-200">
              {/* رأس القسم */}
              <div className="mb-3 flex flex-shrink-0 items-center justify-between">
                <div>
                  <div className="text-3xl font-black xl:text-4xl">متجر النقاط</div>
                  <div className="mt-0.5 text-sm text-slate-500">عرض الجوائز بحسب إعدادات هذه الشاشة</div>
                </div>
                <div className="rounded-full bg-violet-100 px-4 py-2 text-base font-black text-violet-800">{formatEnglishDigits(rewardStoreSummary.items?.length || 0)} جائزة</div>
              </div>
              {/* إحصائيات مضغوطة */}
              <div className="mb-3 grid flex-shrink-0 grid-cols-4 gap-2">
                {[
                  ['المعتمدة', rewardStoreSummary.activeItems || 0, 'text-emerald-700', 'bg-emerald-50 ring-emerald-100'],
                  ['المتبقي', rewardStoreSummary.remainingQuantity || 0, 'text-sky-700', 'bg-sky-50 ring-sky-100'],
                  ['طلبات التسليم', rewardStoreSummary.pendingRedemptions || 0, 'text-amber-700', 'bg-amber-50 ring-amber-100'],
                  ['المتبرعون', rewardStoreSummary.donorCount || 0, 'text-violet-700', 'bg-violet-50 ring-violet-100'],
                ].map(([label, value, tone, box]) => (
                  <div key={label} className={cx('rounded-2xl p-3 text-center ring-1', box)}>
                    <div className="text-xs font-bold text-slate-500 leading-tight">{label}</div>
                    <div className={cx('mt-1 text-3xl font-black xl:text-4xl', tone)}>{formatEnglishDigits(value)}</div>
                  </div>
                ))}
              </div>
              {/* قائمة الجوائز */}
              <div className="min-h-0 flex-1">
                <div className="grid gap-2" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))' }}>
                  {(rewardStoreSummary.items || []).slice(0, Number(rewardStoreSummary.maxItems || 20)).map((item) => (
                    <div key={item.id} className="flex flex-col items-center rounded-2xl bg-slate-50 p-2 ring-1 ring-slate-200 text-center">
                      <div className="relative h-12 w-full overflow-hidden rounded-xl bg-slate-100 mb-1">
                        {item.image ? <img src={item.image} alt={item.title} className="h-full w-full object-cover" /> : <div className="flex h-full items-center justify-center text-xl">🎁</div>}
                      </div>
                      <div className="w-full min-w-0">
                        <div className="truncate text-xs font-black text-slate-900 leading-tight">{item.title}</div>
                        <div className="text-xs text-slate-400">متبقي {formatEnglishDigits(item.remainingQuantity || 0)}</div>
                      </div>
                      <div className="mt-1 w-full rounded-lg bg-emerald-600 py-1 text-center shadow-sm">
                        <div className="text-sm font-black text-white leading-none">{formatEnglishDigits(item.pointsCost || 0)}</div>
                        <div className="text-xs font-bold text-emerald-100">نقطة</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            {/* العمود الأيسر: مصادر + إعدادات */}
            <div className="flex min-h-0 flex-col gap-3">
              {/* مصادر الجوائز */}
              <div className="flex-1 min-h-0 rounded-[2rem] bg-white p-5 text-slate-950 shadow-xl ring-1 ring-slate-200">
                <div className="mb-2 flex-shrink-0 text-xl font-black">مصادر الجوائز</div>
                <div className="h-[calc(100%-2.5rem)] min-h-0">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={(sourceRows.length ? sourceRows : [{ name: 'لا توجد بيانات', value: 1 }])} dataKey="value" nameKey="name" innerRadius="30%" outerRadius="60%" paddingAngle={3}>
                        {(sourceRows.length ? sourceRows : [{ name: 'لا توجد بيانات', value: 1 }]).map((_, index) => <Cell key={index} fill={["#10b981", "#0ea5e9", "#8b5cf6", "#f59e0b"][index % 4]} />)}
                      </Pie>
                      <Tooltip formatter={(value) => [formatEnglishDigits(value), 'الكمية']} />
                      <Legend wrapperStyle={{ fontSize: '12px', fontWeight: 800 }} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>
              {/* خيارات العرض */}
              <div className="flex-shrink-0 rounded-[2rem] bg-white p-5 text-slate-950 shadow-xl ring-1 ring-slate-200">
                <div className="mb-3 text-xl font-black">خيارات العرض</div>
                <div className="grid grid-cols-3 gap-2">
                  <div className="rounded-xl bg-slate-50 px-3 py-2 ring-1 ring-slate-200">
                    <div className="text-xs font-bold text-slate-500">وضع الشاشة</div>
                    <div className="mt-1 text-sm font-black text-slate-900">{rewardStoreSummary.mode === 'featured' ? 'المهمة فقط' : rewardStoreSummary.mode === 'marked' ? 'المعلّم' : 'كل الجوائز'}</div>
                  </div>
                  <div className="rounded-xl bg-slate-50 px-3 py-2 ring-1 ring-slate-200">
                    <div className="text-xs font-bold text-slate-500">المصدر</div>
                    <div className="mt-1 text-sm font-black text-slate-900">{rewardStoreSummary.sourceFilter === 'school' ? 'المدرسة' : rewardStoreSummary.sourceFilter === 'parent' ? 'أولياء الأمور' : rewardStoreSummary.sourceFilter === 'external' ? 'متبرعون' : 'الكل'}</div>
                  </div>
                  <div className="rounded-xl bg-slate-50 px-3 py-2 ring-1 ring-slate-200">
                    <div className="text-xs font-bold text-slate-500">المعروض</div>
                    <div className="mt-1 text-3xl font-black text-slate-900">{formatEnglishDigits(rewardStoreSummary.items?.length || 0)}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ),

      });
    }

    if (widgets.parentPortalSummary !== false && parentPortalSummary && (screen.sourceMode || 'school') !== 'classroom') {
      const portalStats = [
        { label: 'الأولياء المرتبطون', value: parentPortalSummary.linkedParents || 0, tone: 'text-sky-700', box: 'bg-sky-50 ring-sky-200' },
        { label: 'الأولياء النشطون', value: parentPortalSummary.activeParents || 0, tone: 'text-emerald-700', box: 'bg-emerald-50 ring-emerald-200' },
        { label: 'الطلبات المعلقة', value: parentPortalSummary.pendingRequests || 0, tone: 'text-amber-700', box: 'bg-amber-50 ring-amber-200' },
        { label: 'الحسابات المعلقة', value: parentPortalSummary.suspendedParents || 0, tone: 'text-rose-700', box: 'bg-rose-50 ring-rose-200' },
      ];
      const coverageData = [
        { name: 'تغطية أولياء الأمور', value: Number(parentPortalSummary.coverageRate || 0) },
        { name: 'تغطية الجوالات', value: Number(parentPortalSummary.guardianCoverageRate || 0) },
      ];
      items.push({
        key: 'parentPortalSummary',
        title: 'جاهزية أولياء الأمور',
        render: () => (
          <div className="grid h-full gap-4 xl:grid-cols-[1.15fr_0.85fr]" style={{ minHeight: 0 }}>
            {/* العمود الأيمن: الإحصائيات الرئيسية */}
            <div className="flex min-h-0 flex-col rounded-[2rem] bg-white p-5 text-slate-950 shadow-xl ring-1 ring-slate-200">
              {/* رأس القسم */}
              <div className="mb-3 flex flex-shrink-0 items-center justify-between">
                <div>
                  <div className="text-3xl font-black xl:text-4xl">جاهزية أولياء الأمور</div>
                  <div className="mt-0.5 text-sm text-slate-500">صورة تنفيذية مختصرة لبوابة ولي الأمر على هذه الشاشة</div>
                </div>
                <div className={cx('rounded-full px-4 py-2 text-base font-black', parentPortalSummary.portalEnabled ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800')}>
                  {parentPortalSummary.portalEnabled ? 'البوابة مفعلة' : 'البوابة معطلة'}
                </div>
              </div>
              {/* إحصائيات رئيسية */}
              <div className="mb-3 grid flex-shrink-0 grid-cols-4 gap-2">
                {portalStats.map((item) => (
                  <div key={item.label} className={cx('rounded-2xl p-3 text-center ring-1', item.box)}>
                    <div className="text-xs font-bold text-slate-500 leading-tight">{item.label}</div>
                    <div className={cx('mt-1 text-3xl font-black xl:text-4xl', item.tone)}>{formatEnglishDigits(item.value)}</div>
                  </div>
                ))}
              </div>
              {/* تفاصيل إضافية */}
              <div className="mb-3 grid flex-shrink-0 grid-cols-3 gap-2">
                <div className="rounded-xl bg-slate-50 px-3 py-2 ring-1 ring-slate-200">
                  <div className="text-xs font-bold text-slate-500">سياسة تحديث الرقم</div>
                  <div className="mt-1 text-base font-black text-slate-900">{parentPortalSummary.approvalMode === 'manual' ? 'يدوي' : 'تلقائي'}</div>
                </div>
                <div className="rounded-xl bg-slate-50 px-3 py-2 ring-1 ring-slate-200">
                  <div className="text-xs font-bold text-slate-500">الأرقام الإضافية</div>
                  <div className="mt-1 text-2xl font-black text-slate-900">{formatEnglishDigits(parentPortalSummary.extraContacts || 0)}</div>
                </div>
                <div className="rounded-xl bg-slate-50 px-3 py-2 ring-1 ring-slate-200">
                  <div className="text-xs font-bold text-slate-500">تفضيل واتساب</div>
                  <div className="mt-1 text-2xl font-black text-emerald-700">{formatEnglishDigits(parentPortalSummary.preferredWhatsappCount || 0)}</div>
                </div>
              </div>
              {/* نبض البوابة */}
              <div className="flex-1 min-h-0 grid grid-cols-3 gap-2">
                <div className="rounded-2xl bg-violet-50 p-3 ring-1 ring-violet-200 flex flex-col justify-between">
                  <div className="text-xs font-bold text-violet-700">تغطية أولياء الأمور</div>
                  <div className="text-4xl font-black text-violet-700 xl:text-5xl">{formatEnglishDigits(parentPortalSummary.coverageRate || 0)}%</div>
                </div>
                <div className="rounded-2xl bg-slate-50 p-3 ring-1 ring-slate-200 flex flex-col justify-between">
                  <div className="text-xs font-bold text-slate-500">تغطية أرقام الجوال</div>
                  <div className="text-4xl font-black text-slate-900 xl:text-5xl">{formatEnglishDigits(parentPortalSummary.guardianCoverageRate || 0)}%</div>
                </div>
                <div className="rounded-2xl bg-amber-50 p-3 ring-1 ring-amber-200 flex flex-col justify-between">
                  <div className="text-xs font-bold text-amber-700">آخر تنبيه إداري</div>
                  <div className="text-base font-black text-amber-800">{parentPortalSummary.lastAlertAt ? formatDateTime(parentPortalSummary.lastAlertAt) : 'لا يوجد'}</div>
                </div>
              </div>
            </div>
            {/* العمود الأيسر: نسب التغطية */}
            <div className="flex min-h-0 flex-col rounded-[2rem] bg-white p-5 text-slate-950 shadow-xl ring-1 ring-slate-200">
              <div className="mb-2 flex-shrink-0 text-xl font-black">نسب التغطية</div>
              <div className="flex-1 min-h-0">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={coverageData} margin={{ top: 16, right: 8, left: 0, bottom: 8 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                    <XAxis dataKey="name" tick={{ fontSize: 13, fontWeight: 900, fill: '#0f172a' }} axisLine={false} tickLine={false} />
                    <YAxis domain={[0, 100]} tickFormatter={(value) => formatEnglishDigits(value)} tick={{ fontSize: 12, fontWeight: 800, fill: '#334155' }} axisLine={false} tickLine={false} />
                    <Tooltip formatter={(value) => [`${formatEnglishDigits(value)}%`, 'النسبة']} contentStyle={{ borderRadius: '14px', border: '1px solid #cbd5e1', fontWeight: 800 }} />
                    <Bar dataKey="value" fill="#6366f1" radius={[14, 14, 0, 0]} barSize={56}>
                      <LabelList dataKey="value" position="insideTop" offset={10} formatter={(value) => `${formatEnglishDigits(value)}%`} style={{ fill: '#ffffff', fontSize: 18, fontWeight: 900 }} />
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        ),

      });
    }

    if (widgets.recentActivity !== false) {
      items.push({
        key: 'recentActivity',
        title: 'آخر النشاطات',
        render: () => (
          <div className={cx('grid h-full grid-cols-1 gap-4 overflow-hidden rounded-[2.2rem] bg-white p-8 text-slate-950 shadow-2xl ring-1 ring-slate-200', screenTemplate === 'news' ? 'xl:grid-cols-1 bg-gradient-to-l from-white to-slate-50' : 'xl:grid-cols-2')}>
            {recentAttendanceView.slice(0, 8).map((item) => (
              <div key={item.id} className="rounded-[1.75rem] bg-slate-100 p-5 ring-1 ring-slate-200">
                <div className="text-3xl font-black">{getShortStudentName(item.student)}</div>
                <div className="mt-3 text-xl text-slate-500">{item.time} • {item.result}</div>
              </div>
            ))}
          </div>
        ),
      });
    }
    // شريحة المعلمين الأبرز
    const teacherActivityForSlide = live?.teacherActivity || [];
    if (widgets.teacherActivity !== false && teacherActivityForSlide.length > 0) {
      items.push({
        key: 'teacherActivity',
        title: 'المعلمون الأبرز اليوم',
        render: () => (
          <div className="h-full rounded-[2.2rem] bg-gradient-to-br from-amber-50 to-white p-8 text-slate-950 shadow-2xl ring-1 ring-amber-200">
            <div className="mb-6 flex items-center gap-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-3xl bg-amber-400 shadow-lg">
                <span className="text-3xl">🏆</span>
              </div>
              <div>
                <div className="text-4xl font-black text-slate-900 xl:text-5xl">المعلمون الأبرز اليوم</div>
                <div className="mt-1 text-xl text-amber-700">{safeSchoolName}</div>
              </div>
            </div>
            <div className="grid gap-4 xl:grid-cols-2">
              {teacherActivityForSlide.slice(0, 6).map((teacher, index) => (
                <div key={`${teacher.actorName}-${index}`} className={`rounded-[1.75rem] p-5 ring-1 ${index === 0 ? 'bg-amber-100 ring-amber-300' : 'bg-white ring-slate-200'}`}>
                  <div className="flex items-center gap-3">
                    <span className={`flex h-10 w-10 items-center justify-center rounded-2xl text-xl font-black ${index === 0 ? 'bg-amber-400 text-white' : 'bg-slate-100 text-slate-700'}`}>{index + 1}</span>
                    <div className="text-2xl font-black text-slate-900">{teacher.actorName}</div>
                  </div>
                  <div className="mt-4 grid grid-cols-4 gap-2 text-center">
                    <div className="rounded-2xl bg-slate-50 p-3 ring-1 ring-slate-200">
                      <div className="text-2xl font-black text-slate-800">{formatEnglishDigits(teacher.count)}</div>
                      <div className="text-sm font-bold text-slate-500">إجمالي</div>
                    </div>
                    <div className="rounded-2xl bg-emerald-50 p-3 ring-1 ring-emerald-200">
                      <div className="text-2xl font-black text-emerald-700">{formatEnglishDigits(teacher.rewardCount)}</div>
                      <div className="text-sm font-bold text-emerald-600">مكافآت</div>
                    </div>
                    <div className="rounded-2xl bg-rose-50 p-3 ring-1 ring-rose-200">
                      <div className="text-2xl font-black text-rose-700">{formatEnglishDigits(teacher.violationCount)}</div>
                      <div className="text-sm font-bold text-rose-600">خصومات</div>
                    </div>
                    <div className="rounded-2xl bg-violet-50 p-3 ring-1 ring-violet-200">
                      <div className="text-2xl font-black text-violet-700">{formatEnglishDigits(teacher.programCount)}</div>
                      <div className="text-sm font-bold text-violet-600">برامج</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ),
      });
    }

    // شريحة أصناف المكافآت والخصومات
    if (widgets.actionStats !== false) {
      const rewardStats = (live?.rewardStats || []).slice(0, 6);
      const violationStats = (live?.violationStats || []).slice(0, 6);
      if (rewardStats.length > 0 || violationStats.length > 0) {
        items.push({
          key: 'actionStats',
          title: 'أصناف المكافآت والخصومات',
          render: () => (
            <div className="grid h-full gap-5 xl:grid-cols-2">
              {rewardStats.length > 0 && (
                <div className="rounded-[2.2rem] bg-white p-7 text-slate-950 shadow-2xl ring-1 ring-slate-200">
                  <div className="mb-5 flex items-center gap-3">
                    <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-100 text-2xl">🏆</span>
                    <div className="text-3xl font-black text-emerald-800">أعلى أصناف المكافآت</div>
                  </div>
                  <div className="space-y-3">
                    {rewardStats.map((item, index) => (
                      <div key={item.title || index} className="flex items-center justify-between rounded-[1.4rem] bg-emerald-50 px-5 py-4 ring-1 ring-emerald-200">
                        <div className="flex items-center gap-3">
                          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-200 text-lg font-black text-emerald-800">{index + 1}</span>
                          <div className="text-2xl font-black text-slate-900">{getShortStudentName(item.title || item.name)}</div>
                        </div>
                        <div className="rounded-xl bg-emerald-600 px-4 py-2 text-xl font-black text-white">{formatEnglishDigits(item.count)} مرة</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {violationStats.length > 0 && (
                <div className="rounded-[2.2rem] bg-white p-7 text-slate-950 shadow-2xl ring-1 ring-slate-200">
                  <div className="mb-5 flex items-center gap-3">
                    <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-rose-100 text-2xl">⚠️</span>
                    <div className="text-3xl font-black text-rose-800">أعلى أصناف الخصومات</div>
                  </div>
                  <div className="space-y-3">
                    {violationStats.map((item, index) => (
                      <div key={item.title || index} className="flex items-center justify-between rounded-[1.4rem] bg-rose-50 px-5 py-4 ring-1 ring-rose-200">
                        <div className="flex items-center gap-3">
                          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-rose-200 text-lg font-black text-rose-800">{index + 1}</span>
                          <div className="text-2xl font-black text-slate-900">{getShortStudentName(item.title || item.name)}</div>
                        </div>
                        <div className="rounded-xl bg-rose-600 px-4 py-2 text-xl font-black text-white">{formatEnglishDigits(item.count)} مرة</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ),
        });
      }
    }

    // شريحة اختبارات نافس التجريبي
    if (widgets.nafisQuiz) {
      const nafisData = live?.nafisData || {};
      const screenQs = nafisData.screenQuestions || [];
      if (screenQs.length > 0) {
        screenQs.forEach((q, qi) => {
          items.push({
            key: `nafisQuiz-${qi}`,
            title: `🏆 سؤال نافس ${qi + 1}/${screenQs.length}`,
            render: () => (
              <div className="flex h-full items-center justify-center p-6">
                <div className="w-full max-w-3xl">
                  <div className="mb-6 flex items-center gap-3">
                    <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-500 text-3xl">🏆</span>
                    <div>
                      <div className="text-2xl font-black text-white">نافس التجريبي</div>
                      <div className="text-base font-bold text-white/70">سؤال {qi + 1} من {screenQs.length}</div>
                    </div>
                  </div>
                  <div className="rounded-[2rem] bg-white p-8 shadow-2xl">
                    <div className="mb-6 text-2xl font-black text-slate-900 leading-relaxed">{q.question}</div>
                    <div className="grid grid-cols-2 gap-4">
                      {(q.options || []).map((opt, oi) => (
                        <div key={oi} className="rounded-[1.4rem] bg-slate-100 px-5 py-4 text-xl font-bold text-slate-800 ring-1 ring-slate-200">
                          <span className="ml-2 inline-flex h-8 w-8 items-center justify-center rounded-full bg-amber-500 text-sm font-black text-white">{['A','B','C','D'][oi]}</span>
                          {opt}
                        </div>
                      ))}
                    </div>
                    {q.skill && <div className="mt-4 text-sm font-bold text-slate-400">المهارة: {q.skill}</div>}
                  </div>
                </div>
              </div>
            ),
          });
        });
      }
    }

    // شريحة لوحة نافس التجريبي - محسّنة بإحصائيات ورسوم بيانية
    if (widgets.nafisLeaderboard) {
      const nafisData = live?.nafisData || {};
      const topNafis = nafisData.topStudentsNafis || [];
      const subjectData = nafisData.subjectChartData || [];
      const gradeData = nafisData.gradeChartData || [];
      const hasData = nafisData.totalAttempts > 0;
      // ألوان للرسوم البيانية
      const CHART_COLORS = ['#8b5cf6','#06b6d4','#10b981','#f59e0b','#ef4444','#3b82f6','#ec4899','#84cc16'];
      // أعلى قيمة لحساب نسبة العرض
      const maxSubjectCount = subjectData.length > 0 ? Math.max(...subjectData.map(s => s.count)) : 1;
      const maxGradeCount = gradeData.length > 0 ? Math.max(...gradeData.map(g => g.count)) : 1;
      items.push({
        key: 'nafisLeaderboard',
        title: '📊 لوحة نافس',
        render: () => (
          <div className="flex h-full flex-col p-5 gap-4" style={{ minHeight: '720px' }}>
            {/* العنوان */}
            <div className="flex items-center gap-3">
              <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-violet-500 text-2xl">🏆</span>
              <div>
                <div className="text-2xl font-black text-white">لوحة نافس التجريبي</div>
                <div className="text-sm font-bold text-white/60">إحصائيات مستمرة لجميع طلاب المدرسة</div>
              </div>
            </div>
            {/* بطاقات الإحصائيات السريعة */}
            <div className="grid grid-cols-4 gap-3">
              {[
                { label: 'الطلاب المشاركون', value: nafisData.uniqueStudents || 0, icon: '👥', color: 'bg-violet-500' },
                { label: 'الأسئلة المحلولة', value: nafisData.totalAnswered || 0, icon: '❓', color: 'bg-cyan-500' },
                { label: 'نسبة الصحة', value: `${nafisData.correctRate || 0}%`, icon: '✅', color: 'bg-emerald-500' },
                { label: 'إجمالي المحاولات', value: nafisData.totalAttempts || 0, icon: '🔄', color: 'bg-amber-500' },
              ].map((card, i) => (
                <div key={i} className="rounded-2xl bg-white/15 px-4 py-3 text-center backdrop-blur-sm">
                  <div className="text-2xl mb-1">{card.icon}</div>
                  <div className="text-2xl font-black text-white">{card.value}</div>
                  <div className="text-xs font-bold text-white/70 mt-1">{card.label}</div>
                </div>
              ))}
            </div>
            {hasData ? (
              <div className="grid grid-cols-2 gap-4 flex-1">
                {/* رسم بياني المواد */}
                <div className="rounded-2xl bg-white/10 p-4 backdrop-blur-sm">
                  <div className="text-sm font-black text-white mb-3">📚 عدد الأسئلة حسب المادة</div>
                  {subjectData.length > 0 ? (
                    <div className="space-y-2">
                      {subjectData.slice(0, 6).map((s, i) => (
                        <div key={s.subject}>
                          <div className="flex justify-between text-xs font-bold text-white/80 mb-1">
                            <span>{s.label}</span>
                            <span>{s.count}</span>
                          </div>
                          <div className="h-5 rounded-full bg-white/20 overflow-hidden">
                            <div
                              className="h-full rounded-full transition-all"
                              style={{ width: `${Math.round((s.count / maxSubjectCount) * 100)}%`, backgroundColor: CHART_COLORS[i % CHART_COLORS.length] }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : <div className="text-white/50 text-sm text-center mt-4">لا توجد بيانات</div>}
                </div>
                {/* رسم بياني المراحل */}
                <div className="rounded-2xl bg-white/10 p-4 backdrop-blur-sm">
                  <div className="text-sm font-black text-white mb-3">🏫 عدد الأسئلة حسب المرحلة</div>
                  {gradeData.length > 0 ? (
                    <div className="space-y-2">
                      {gradeData.slice(0, 6).map((g, i) => (
                        <div key={g.grade}>
                          <div className="flex justify-between text-xs font-bold text-white/80 mb-1">
                            <span>{g.label}</span>
                            <span>{g.count}</span>
                          </div>
                          <div className="h-5 rounded-full bg-white/20 overflow-hidden">
                            <div
                              className="h-full rounded-full transition-all"
                              style={{ width: `${Math.round((g.count / maxGradeCount) * 100)}%`, backgroundColor: CHART_COLORS[(i + 3) % CHART_COLORS.length] }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : <div className="text-white/50 text-sm text-center mt-4">لا توجد بيانات</div>}
                </div>
              </div>
            ) : (
              <div className="flex flex-1 items-center justify-center rounded-2xl bg-white/10 text-xl font-bold text-white/60">
                لا توجد نتائج بعد — شجع طلابك على المشاركة!
              </div>
            )}
            {/* لوحة المتصدرين */}
            {topNafis.length > 0 && (
              <div className="rounded-2xl bg-white/10 p-4 backdrop-blur-sm">
                <div className="text-sm font-black text-white mb-3">🏅 المتصدرون</div>
                <div className="grid grid-cols-4 gap-2">
                  {topNafis.slice(0, 4).map((s, index) => (
                    <div key={s.studentId} className="flex items-center gap-2 rounded-xl bg-white/15 px-3 py-2">
                      <span className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-sm font-black text-white ${index === 0 ? 'bg-amber-500' : index === 1 ? 'bg-slate-400' : index === 2 ? 'bg-amber-700' : 'bg-slate-500'}`}>{index + 1}</span>
                      <div className="min-w-0">
                        <div className="truncate text-sm font-black text-white">{s.studentName}</div>
                        <div className="text-xs font-bold text-violet-300">{s.points} نقطة</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ),
      });
    }

    if (!items.length) {
      return [{ key: 'empty', title: 'الشاشة', render: () => <div className="h-full rounded-[2rem] bg-white p-8 text-slate-950 ring-1 ring-slate-200">لا توجد عناصر مفعلة لهذه الشاشة.</div> }];
    }
    const priorityMap = {
      executive: ['metrics','attendanceChart','actionStats','teacherActivity','recentActivity','topStudents','topCompanies','nafisQuiz-0','nafisLeaderboard'],
      reception: ['metrics','recentActivity','actionStats','teacherActivity','topStudents','attendanceChart','topCompanies','nafisQuiz-0','nafisLeaderboard'],
      leaderboard: ['nafisLeaderboard','nafisQuiz-0','topStudents','topCompanies','teacherActivity','actionStats','metrics','attendanceChart','recentActivity'],
      news: ['recentActivity','nafisQuiz-0','nafisLeaderboard','metrics','actionStats','teacherActivity','attendanceChart','topStudents','topCompanies'],
    };
    const order = priorityMap[screenTemplate] || priorityMap.executive;
    return items.sort((a, b) => {
      const ai = order.findIndex(k => a.key.startsWith(k));
      const bi = order.findIndex(k => b.key.startsWith(k));
      return (ai === -1 ? 999 : ai) - (bi === -1 ? 999 : bi);
    });
    } catch (screenError) {
      console.error('failed to prepare screen slides', screenError);
      return [{
        key: 'screen-fallback',
        title: 'عرض بديل للشاشة',
        render: () => (
          <div className="h-full rounded-[2rem] bg-white p-8 text-slate-950 shadow-2xl ring-1 ring-slate-200">
            <div className="text-4xl font-black text-slate-900">{safeSchoolName}</div>
            <div className="mt-4 text-2xl text-slate-600">تعذر تجهيز قالب الشاشة المرتبطة، لذلك تم إظهار عرض بديل آمن.</div>
            <div className="mt-8 grid gap-4 xl:grid-cols-3">
              <div className="rounded-[1.5rem] bg-slate-100 p-5 ring-1 ring-slate-200"><div className="text-base font-bold text-slate-500">إجمالي الطلاب</div><div className="mt-3 text-5xl font-black">{summaryView?.totalStudents || 0}</div></div>
              <div className="rounded-[1.5rem] bg-emerald-50 p-5 ring-1 ring-emerald-200"><div className="text-base font-bold text-emerald-700">الحضور / النشطون</div><div className="mt-3 text-5xl font-black text-emerald-700">{summaryView?.presentToday || 0}</div></div>
              <div className="rounded-[1.5rem] bg-sky-50 p-5 ring-1 ring-sky-200"><div className="text-base font-bold text-sky-700">نسبة الجاهزية</div><div className="mt-3 text-5xl font-black text-sky-700">{summaryView?.attendanceRate || 0}%</div></div>
            </div>
          </div>
        )
      }];
    }
  }, [live, widgets, screenTemplate, structureSpotlight, summaryView, topStudentsView, topCompaniesView, topStudentsChartData, topCompaniesChartData, attendanceTrendView, recentAttendanceView, safeSchoolName, rewardStoreSummary, lessonAttendanceSummary, parentPortalSummary]);

  useEffect(() => {
    setSlideIndex(0);
  }, [screen.token, slides.length]);

  useEffect(() => {
    if (slides.length <= 1) return undefined;
    const id = window.setInterval(() => setSlideIndex((prev) => (prev + 1) % slides.length), rotateSeconds * 1000);
    return () => window.clearInterval(id);
  }, [slides.length, rotateSeconds]);

  if (error) return <div dir="rtl" className="flex min-h-screen items-center justify-center bg-slate-100 p-6"><div className="rounded-3xl bg-white p-8 ring-1 ring-slate-200">{error}</div></div>;
  if (!payload) return <div dir="rtl" className="flex min-h-screen items-center justify-center bg-slate-100 p-6"><div className="rounded-3xl bg-white p-8 ring-1 ring-slate-200">جارِ تحميل الشاشة...</div></div>;

  const currentSlide = slides[slideIndex] || slides[0];
  const tickerItems = splitTickerItems(screen.tickerText);
  const showTicker = Boolean(screen.tickerEnabled && tickerItems.length);
  const tickerFontSize = Math.max(18, Math.min(56, Number(screen.tickerFontSize) || 28));

  return (
    <div dir="rtl" className={cx("h-screen overflow-hidden text-white antialiased", screenTheme.shell)}>
      <div className="relative flex h-full flex-col overflow-hidden px-4 pb-4 pt-4 xl:px-6">
        <div className={cx("rounded-[2rem] border px-8 py-6 shadow-2xl backdrop-blur-xl", screenTheme.panel)}>
          <div className="grid items-center gap-5 xl:grid-cols-[1fr_auto]">
            <div className="text-center xl:text-right">
              <div className="text-5xl font-black tracking-tight sm:text-6xl xl:text-7xl">{safeSchoolName}</div>
            </div>
            <div className="flex items-center justify-center gap-3 xl:justify-end">
              <div className="min-w-[250px] rounded-[1.8rem] bg-white/10 px-8 py-5 text-center ring-1 ring-white/15">
                <div className="text-lg font-bold tracking-[0.22em] text-white/65">TIME</div>
                <div className="mt-2 text-5xl font-black tracking-[0.1em] text-white xl:text-7xl">{clockTime}</div>
              </div>
              <button
                onClick={async () => {
                  try {
                    if (!document.fullscreenElement) await document.documentElement.requestFullscreen();
                  } catch (error) {
                    console.warn('fullscreen failed', error);
                  }
                }}
                aria-label="ملء الشاشة"
                className="inline-flex h-18 w-18 items-center justify-center rounded-[1.4rem] bg-white/15 text-white ring-1 ring-white/20 transition hover:bg-white/20"
              >
                <Maximize2 className="h-8 w-8" />
              </button>
            </div>
          </div>
          <div className="mt-5 grid grid-cols-3 items-center text-xl font-bold text-white/85 xl:text-2xl">
            <span className="text-right">{formatEnglishDigits(slideIndex + 1)} / {formatEnglishDigits(slides.length)}</span>
            <span className="text-center">{currentSlide.title}</span>
            <span className="text-left">{getScreenTemplateLabel(screenTemplate)}</span>
          </div>
        </div>

        <div className={cx('relative mt-5 flex-1 overflow-hidden', showTicker ? 'pb-28' : '')}>
          <AnimatePresence mode="wait">
            <motion.div
              key={`${currentSlide.key}-${slideIndex}`}
              initial={motionVariant.initial}
              animate={motionVariant.animate}
              exit={motionVariant.exit}
              transition={{ duration: motionVariant.duration || 0.55, ease: motionVariant.ease || 'easeOut' }}
              className="absolute inset-0"
            >
              <RenderErrorBoundary resetKey={`${currentSlide.key}-${slideIndex}`}>{currentSlide.render()}</RenderErrorBoundary>
            </motion.div>
          </AnimatePresence>
        </div>

        <div className={cx('mt-4 flex items-center justify-center gap-3', showTicker ? 'mb-20' : '')}>
          {slides.map((item, index) => (
            <button
              key={item.key}
              onClick={() => setSlideIndex(index)}
              className={cx(
                'group relative overflow-hidden rounded-full ring-1 ring-white/15 transition-all',
                index === slideIndex ? 'h-4 w-16 bg-white shadow-[0_0_22px_rgba(255,255,255,0.3)]' : 'h-4 w-4 bg-white/35 hover:bg-white/50'
              )}
              aria-label={item.title}
            >
              {index === slideIndex ? <span className="absolute inset-y-0 left-0 w-1/2 rounded-full bg-sky-300/80" /> : null}
            </button>
          ))}
        </div>

        {showTicker ? (
          <div className="pointer-events-none absolute bottom-0 left-0 right-0 z-[80] px-4 pb-4 xl:px-6">
            <div className={cx('overflow-hidden rounded-[1.75rem] px-4 py-4 shadow-[0_-12px_30px_rgba(0,0,0,0.35)] ring-1 ring-white/20', tickerTheme.wrap)}>
              <div className="flex items-center gap-4">
                <div className={cx('shrink-0 rounded-xl px-4 py-2 text-lg font-black', tickerTheme.badge)}>شريط الأخبار</div>
                <div className="min-w-0 flex-1 overflow-hidden">
                  {screen.tickerLayout === 'stacked' ? (
                    <div className="grid gap-2">
                      {tickerItems.slice(0, 5).map((item, index) => (
                        <React.Fragment key={`${item}-${index}`}>
                          <div className="flex items-center gap-3 rounded-2xl bg-black/10 px-4 py-2 ring-1 ring-white/10" style={{ fontSize: `${tickerFontSize}px`, lineHeight: 1.35 }}>
                            <span className="font-black text-white">{item}</span>
                          </div>
                          {screen.tickerShowLogo !== false && index < Math.min(tickerItems.length, 5) - 1 ? (
                            <div className="flex justify-center py-1"><SchoolTickerLogo schoolName={safeSchoolName} className="px-5 py-1.5 text-base" /></div>
                          ) : null}
                        </React.Fragment>
                      ))}
                    </div>
                  ) : (
                    <div className="relative min-w-0 overflow-hidden" style={{ direction: 'ltr' }}>
                      <div className={cx('flex items-center gap-4 whitespace-nowrap font-black', screen.tickerDir === 'rtl' ? 'animate-marquee-rtl' : 'animate-marquee-ltr')} style={{ fontSize: `${tickerFontSize}px`, lineHeight: 1.3 }}>
                        {[0, 1].map((loop) => (
                          <React.Fragment key={loop}>
                            {tickerItems.map((item, index) => (
                              <span key={`${loop}-${index}`} className="inline-flex items-center gap-4 px-2">
                                <span>{item}</span>
                                {screen.tickerShowLogo !== false ? (
                                  <span className="inline-flex items-center gap-4 opacity-95">
                                    <SchoolTickerLogo schoolName={safeSchoolName} className="px-4 py-1.5" />
                                    <span className="opacity-80">{screen.tickerSeparator || ' ✦ '}</span>
                                  </span>
                                ) : (
                                  <span className="opacity-80 px-2">{screen.tickerSeparator || ' ✦ '}</span>
                                )}
                              </span>
                            ))}
                          </React.Fragment>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}

export default PublicScreenPage;

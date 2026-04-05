/**
 * ==========================================
 *  WeeklyTimetableEditor Component
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
import { cx, safeNumber, clamp, getTodayIso, toArabicDate, parseTimeToMinutes, formatDateTime, getShortStudentName, schoolHasStructureClassrooms, getStudentCompanyName, getStudentGroupingLabel, resultTone, statusFromResult, getRoleLabel, canAccessPermission, getUnifiedSchoolStudents, pieColors, roles, getAuthActionMeta, generateQrDataUrl, exportToExcel } from '../utils/sharedFunctions.jsx';
import { Input } from './ui/FormElements';
import { WEEK_DAYS } from '../constants/appConfig.js';


function WeeklyTimetableEditor({ timetable = [], slotDefinitions = [], teachers = [], classrooms = [], subjectBank = [], onChange, onChangeSlotDefs }) {
  // --- قسم 1: إدارة تعريفات الحصص والأوقات ---
  const [showSlotDefForm, setShowSlotDefForm] = useState(false);
  const [slotDefDraft, setSlotDefDraft] = useState({ slotNumber: 1, startTime: '07:00', endTime: '07:45' });
  const [editingSlotDef, setEditingSlotDef] = useState(null);

  const sortedSlotDefs = useMemo(() => [...slotDefinitions].sort((a, b) => Number(a.slotNumber) - Number(b.slotNumber)), [slotDefinitions]);

  const addSlotDef = () => {
    if (!slotDefDraft.startTime || !slotDefDraft.endTime) { window.alert('أدخل وقت البداية والنهاية.'); return; }
    const num = Number(slotDefDraft.slotNumber) || 1;
    if (slotDefinitions.some((s) => Number(s.slotNumber) === num)) { window.alert(`الحصة رقم ${num} موجودة بالفعل.`); return; }
    onChangeSlotDefs([...slotDefinitions, { id: `slotdef-${Date.now()}`, slotNumber: num, startTime: slotDefDraft.startTime, endTime: slotDefDraft.endTime }]);
    setSlotDefDraft({ slotNumber: num + 1, startTime: slotDefDraft.endTime, endTime: '' });
    setShowSlotDefForm(false);
  };

  const removeSlotDef = (id) => {
    onChangeSlotDefs(slotDefinitions.filter((s) => s.id !== id));
  };

  const saveSlotDefEdit = () => {
    if (!editingSlotDef) return;
    onChangeSlotDefs(slotDefinitions.map((s) => s.id === editingSlotDef.id ? { ...editingSlotDef, slotNumber: Number(editingSlotDef.slotNumber) } : s));
    setEditingSlotDef(null);
  };

  // --- قسم 2: إدارة خانات الجدول الأسبوعي ---
  const [selectedDay, setSelectedDay] = useState('sunday');
  const [showEntryForm, setShowEntryForm] = useState(false);
  const [editingEntry, setEditingEntry] = useState(null);
  const EMPTY_ENTRY = { day: 'sunday', slotDefId: '', subject: '', classroomId: '', teacherId: '' };
  const [draftEntry, setDraftEntry] = useState({ ...EMPTY_ENTRY });

  // تجميع الفصول حسب المرحلة
  const classroomsByGrade = useMemo(() => {
    const map = {};
    classrooms.forEach((c) => {
      const grade = c.gradeLabel || c.grade || c.stageLabel || 'أخرى';
      if (!map[grade]) map[grade] = [];
      map[grade].push(c);
    });
    return map;
  }, [classrooms]);

  const dayEntries = useMemo(() => timetable.filter((e) => e.day === selectedDay).sort((a, b) => {
    const defA = slotDefinitions.find((s) => s.id === a.slotDefId);
    const defB = slotDefinitions.find((s) => s.id === b.slotDefId);
    return (Number(defA?.slotNumber) || 99) - (Number(defB?.slotNumber) || 99);
  }), [timetable, selectedDay, slotDefinitions]);

  const addEntry = () => {
    if (!draftEntry.slotDefId) { window.alert('اختر رقم الحصة.'); return; }
    if (!draftEntry.subject) { window.alert('اختر المادة.'); return; }
    const slotDef = slotDefinitions.find((s) => s.id === draftEntry.slotDefId);
    const newEntry = {
      id: `entry-${Date.now()}-${Math.random().toString(36).slice(2)}`,
      day: selectedDay,
      slotDefId: draftEntry.slotDefId,
      slot: slotDef ? Number(slotDef.slotNumber) : 0,
      slotLabel: draftEntry.subject,
      startTime: slotDef?.startTime || '',
      endTime: slotDef?.endTime || '',
      subject: draftEntry.subject,
      classroomId: draftEntry.classroomId || '',
      teacherId: draftEntry.teacherId || '',
      teacherIds: draftEntry.teacherId ? [String(draftEntry.teacherId)] : [],
    };
    onChange([...timetable, newEntry]);
    setDraftEntry({ ...EMPTY_ENTRY, day: selectedDay, slotDefId: draftEntry.slotDefId });
    setShowEntryForm(false);
  };

  const removeEntry = (id) => onChange(timetable.filter((e) => e.id !== id));

  const saveEntryEdit = () => {
    if (!editingEntry) return;
    const slotDef = slotDefinitions.find((s) => s.id === editingEntry.slotDefId);
    const updated = {
      ...editingEntry,
      slot: slotDef ? Number(slotDef.slotNumber) : editingEntry.slot,
      slotLabel: editingEntry.subject || editingEntry.slotLabel,
      startTime: slotDef?.startTime || editingEntry.startTime,
      endTime: slotDef?.endTime || editingEntry.endTime,
      teacherIds: editingEntry.teacherId ? [String(editingEntry.teacherId)] : [],
    };
    onChange(timetable.map((e) => e.id === editingEntry.id ? updated : e));
    setEditingEntry(null);
  };

  const getClassroomName = (id) => {
    const c = classrooms.find((cl) => String(cl.id) === String(id));
    return c ? (c.name || c.gradeLabel || 'فصل') : '—';
  };

  const getTeacherName = (id) => {
    const t = teachers.find((tc) => String(tc.id) === String(id));
    return t ? (t.name || t.username || 'معلم') : '—';
  };

  const totalSlots = timetable.length;
  const totalDaysWithSlots = new Set(timetable.map((e) => e.day)).size;

  return (
    <div className="space-y-6">
      {/* ملخص */}
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
        <div className="rounded-3xl bg-violet-50 p-5 ring-1 ring-violet-100">
          <div className="text-sm font-bold text-violet-800">الحصص المعرّفة</div>
          <div className="mt-3 text-3xl font-black text-slate-900">{slotDefinitions.length}</div>
          <div className="mt-2 text-sm text-slate-600">حصة مع أوقاتها محددة</div>
        </div>
        <div className="rounded-3xl bg-sky-50 p-5 ring-1 ring-sky-100">
          <div className="text-sm font-bold text-sky-800">خانات الجدول</div>
          <div className="mt-3 text-3xl font-black text-slate-900">{totalSlots}</div>
          <div className="mt-2 text-sm text-slate-600">{totalDaysWithSlots} أيام مضبوطة من 5</div>
        </div>
        <div className="rounded-3xl bg-emerald-50 p-5 ring-1 ring-emerald-100">
          <div className="text-sm font-bold text-emerald-800">الاختيار التلقائي</div>
          <div className="mt-3 text-2xl font-black text-slate-900">{slotDefinitions.length > 0 ? 'مفعّل' : 'يحتاج إعداد'}</div>
          <div className="mt-2 text-sm text-slate-600">عند تحضير الحصص تُختار الحصة المناسبة للوقت تلقائيًا</div>
        </div>
      </div>

      {/* القسم الأول: تعريف الحصص والأوقات */}
      <div className="rounded-3xl bg-slate-50 p-5 ring-1 ring-slate-200">
        <div className="mb-4 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <div className="font-black text-slate-900">الحصص وأوقاتها</div>
            <div className="mt-1 text-sm text-slate-500">عرّف أرقام الحصص وأوقاتها مرة واحدة، ثم استخدمها في الجدول الأسبوعي.</div>
          </div>
          <button type="button" onClick={() => setShowSlotDefForm(true)} className="rounded-2xl bg-violet-700 px-4 py-2 text-sm font-bold text-white hover:bg-violet-800">+ إضافة حصة</button>
        </div>

        {showSlotDefForm && (
          <div className="mb-4 rounded-3xl bg-white p-5 ring-1 ring-violet-200">
            <div className="mb-3 font-black text-slate-900">تعريف حصة جديدة</div>
            <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
              <div>
                <label className="mb-1 block text-xs font-bold text-slate-600">رقم الحصة</label>
                <select value={slotDefDraft.slotNumber} onChange={(e) => setSlotDefDraft((prev) => ({ ...prev, slotNumber: Number(e.target.value) }))} className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-bold text-slate-700 outline-none focus:border-violet-400">
                  {[1,2,3,4,5,6,7,8,9,10].map((n) => <option key={n} value={n}>الحصة {n === 1 ? 'الأولى' : n === 2 ? 'الثانية' : n === 3 ? 'الثالثة' : n === 4 ? 'الرابعة' : n === 5 ? 'الخامسة' : n === 6 ? 'السادسة' : n === 7 ? 'السابعة' : n === 8 ? 'الثامنة' : n === 9 ? 'التاسعة' : 'العاشرة'}</option>)}
                </select>
              </div>
              <Input label="وقت البداية" type="time" value={slotDefDraft.startTime} onChange={(e) => setSlotDefDraft((prev) => ({ ...prev, startTime: e.target.value }))} />
              <Input label="وقت النهاية" type="time" value={slotDefDraft.endTime} onChange={(e) => setSlotDefDraft((prev) => ({ ...prev, endTime: e.target.value }))} />
            </div>
            <div className="mt-4 flex gap-2">
              <button type="button" onClick={addSlotDef} className="rounded-2xl bg-violet-700 px-4 py-2 text-sm font-bold text-white">حفظ</button>
              <button type="button" onClick={() => setShowSlotDefForm(false)} className="rounded-2xl bg-slate-100 px-4 py-2 text-sm font-bold text-slate-700">إلغاء</button>
            </div>
          </div>
        )}

        {sortedSlotDefs.length === 0 && !showSlotDefForm ? (
          <div className="rounded-3xl border border-dashed border-slate-300 p-6 text-center text-sm text-slate-500">لم تُعرَّف أي حصة بعد. اضغط "+ إضافة حصة" لتحديد الحصة الأولى ووقتها.</div>
        ) : (
          <div className="space-y-2">
            {sortedSlotDefs.map((slotDef) => (
              <div key={slotDef.id} className="flex items-center justify-between gap-3 rounded-2xl bg-white px-4 py-3 ring-1 ring-slate-200">
                {editingSlotDef?.id === slotDef.id ? (
                  <div className="flex flex-1 flex-wrap items-end gap-3">
                    <div className="w-32">
                      <label className="mb-1 block text-xs font-bold text-slate-600">رقم الحصة</label>
                      <select value={editingSlotDef.slotNumber} onChange={(e) => setEditingSlotDef((prev) => ({ ...prev, slotNumber: Number(e.target.value) }))} className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-bold text-slate-700 outline-none focus:border-violet-400">
                        {[1,2,3,4,5,6,7,8,9,10].map((n) => <option key={n} value={n}>الحصة {n === 1 ? 'الأولى' : n === 2 ? 'الثانية' : n === 3 ? 'الثالثة' : n === 4 ? 'الرابعة' : n === 5 ? 'الخامسة' : n === 6 ? 'السادسة' : n === 7 ? 'السابعة' : n === 8 ? 'الثامنة' : n === 9 ? 'التاسعة' : 'العاشرة'}</option>)}
                      </select>
                    </div>
                    <Input label="وقت البداية" type="time" value={editingSlotDef.startTime} onChange={(e) => setEditingSlotDef((prev) => ({ ...prev, startTime: e.target.value }))} />
                    <Input label="وقت النهاية" type="time" value={editingSlotDef.endTime} onChange={(e) => setEditingSlotDef((prev) => ({ ...prev, endTime: e.target.value }))} />
                    <div className="flex gap-2 pb-0.5">
                      <button type="button" onClick={saveSlotDefEdit} className="rounded-2xl bg-violet-700 px-3 py-2 text-xs font-bold text-white">حفظ</button>
                      <button type="button" onClick={() => setEditingSlotDef(null)} className="rounded-2xl bg-slate-100 px-3 py-2 text-xs font-bold text-slate-700">إلغاء</button>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-violet-100 text-sm font-black text-violet-700">{slotDef.slotNumber}</div>
                      <div>
                        <div className="font-black text-slate-900">{slotDef.slotNumber === 1 ? 'الحصة الأولى' : slotDef.slotNumber === 2 ? 'الحصة الثانية' : slotDef.slotNumber === 3 ? 'الحصة الثالثة' : slotDef.slotNumber === 4 ? 'الحصة الرابعة' : slotDef.slotNumber === 5 ? 'الحصة الخامسة' : slotDef.slotNumber === 6 ? 'الحصة السادسة' : slotDef.slotNumber === 7 ? 'الحصة السابعة' : slotDef.slotNumber === 8 ? 'الحصة الثامنة' : slotDef.slotNumber === 9 ? 'الحصة التاسعة' : 'الحصة العاشرة'}</div>
                        <div className="mt-0.5 text-xs text-slate-500">{slotDef.startTime} – {slotDef.endTime}</div>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button type="button" onClick={() => setEditingSlotDef({ ...slotDef })} className="rounded-2xl bg-slate-100 px-3 py-1.5 text-xs font-bold text-slate-600 hover:bg-slate-200">تعديل</button>
                      <button type="button" onClick={() => removeSlotDef(slotDef.id)} className="rounded-2xl bg-rose-50 px-3 py-1.5 text-xs font-bold text-rose-600 hover:bg-rose-100">حذف</button>
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* القسم الثاني: الجدول الأسبوعي */}
      <div className="rounded-3xl bg-slate-50 p-5 ring-1 ring-slate-200">
        <div className="mb-4 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <div className="font-black text-slate-900">الجدول الأسبوعي</div>
            <div className="mt-1 text-sm text-slate-500">أضف خانات الجدول: اليوم + الحصة + المادة + الفصل + المعلم.</div>
          </div>
          <button type="button" onClick={() => { setShowEntryForm(true); setDraftEntry({ ...EMPTY_ENTRY, day: selectedDay }); }} disabled={slotDefinitions.length === 0} className="rounded-2xl bg-sky-700 px-4 py-2 text-sm font-bold text-white hover:bg-sky-800 disabled:opacity-50 disabled:cursor-not-allowed">{slotDefinitions.length === 0 ? 'عرّف الحصص أولاً' : '+ إضافة خانة'}</button>
        </div>

        {/* أزرار الأيام */}
        <div className="mb-4 flex flex-wrap gap-2">
          {WEEK_DAYS.map((d) => (
            <button key={d.key} type="button" onClick={() => setSelectedDay(d.key)} className={`rounded-2xl px-4 py-2 text-sm font-bold transition ${selectedDay === d.key ? 'bg-sky-700 text-white shadow-sm' : 'bg-white text-slate-600 ring-1 ring-slate-200 hover:bg-slate-100'}`}>
              {d.label}
              {timetable.filter((e) => e.day === d.key).length > 0 && <span className="mr-2 rounded-full bg-white/20 px-1.5 text-xs">{timetable.filter((e) => e.day === d.key).length}</span>}
            </button>
          ))}
        </div>

        {/* نموذج إضافة خانة */}
        {showEntryForm && (
          <div className="mb-4 rounded-3xl bg-white p-5 ring-1 ring-sky-200">
            <div className="mb-3 font-black text-slate-900">إضافة خانة — {WEEK_DAYS.find((d) => d.key === selectedDay)?.label}</div>
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
              {/* الحصة */}
              <div>
                <label className="mb-1 block text-xs font-bold text-slate-600">الحصة</label>
                <select value={draftEntry.slotDefId} onChange={(e) => setDraftEntry((prev) => ({ ...prev, slotDefId: e.target.value }))} className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-bold text-slate-700 outline-none focus:border-sky-400">
                  <option value="">-- اختر الحصة --</option>
                  {sortedSlotDefs.map((s) => (
                    <option key={s.id} value={s.id}>{s.slotNumber === 1 ? 'الأولى' : s.slotNumber === 2 ? 'الثانية' : s.slotNumber === 3 ? 'الثالثة' : s.slotNumber === 4 ? 'الرابعة' : s.slotNumber === 5 ? 'الخامسة' : s.slotNumber === 6 ? 'السادسة' : s.slotNumber === 7 ? 'السابعة' : s.slotNumber === 8 ? 'الثامنة' : s.slotNumber === 9 ? 'التاسعة' : 'العاشرة'} ({s.startTime} – {s.endTime})</option>
                  ))}
                </select>
              </div>
              {/* المادة */}
              <div>
                <label className="mb-1 block text-xs font-bold text-slate-600">المادة</label>
                <select value={draftEntry.subject} onChange={(e) => setDraftEntry((prev) => ({ ...prev, subject: e.target.value }))} className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-bold text-slate-700 outline-none focus:border-sky-400">
                  <option value="">-- اختر المادة --</option>
                  {subjectBank.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              {/* الفصل */}
              <div>
                <label className="mb-1 block text-xs font-bold text-slate-600">الفصل</label>
                <select value={draftEntry.classroomId} onChange={(e) => setDraftEntry((prev) => ({ ...prev, classroomId: e.target.value }))} className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-bold text-slate-700 outline-none focus:border-sky-400">
                  <option value="">-- اختر الفصل --</option>
                  {Object.entries(classroomsByGrade).map(([grade, rooms]) => (
                    <optgroup key={grade} label={grade}>
                      {rooms.map((c) => <option key={c.id} value={c.id}>{c.name || c.gradeLabel || 'فصل'}</option>)}
                    </optgroup>
                  ))}
                </select>
              </div>
              {/* المعلم */}
              <div>
                <label className="mb-1 block text-xs font-bold text-slate-600">المعلم</label>
                <select value={draftEntry.teacherId} onChange={(e) => setDraftEntry((prev) => ({ ...prev, teacherId: e.target.value }))} className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-bold text-slate-700 outline-none focus:border-sky-400">
                  <option value="">-- اختر المعلم --</option>
                  {teachers.map((t) => <option key={t.id} value={t.id}>{t.name || t.username}</option>)}
                </select>
              </div>
            </div>
            <div className="mt-4 flex gap-2">
              <button type="button" onClick={addEntry} className="rounded-2xl bg-sky-700 px-4 py-2 text-sm font-bold text-white">حفظ الخانة</button>
              <button type="button" onClick={() => setShowEntryForm(false)} className="rounded-2xl bg-slate-100 px-4 py-2 text-sm font-bold text-slate-700">إلغاء</button>
            </div>
          </div>
        )}

        {/* قائمة الخانات */}
        {dayEntries.length === 0 && !showEntryForm ? (
          <div className="rounded-3xl border border-dashed border-slate-300 p-8 text-center text-sm text-slate-500">لا توجد خانات مسجلة ليوم {WEEK_DAYS.find((d) => d.key === selectedDay)?.label}. اضغط "+ إضافة خانة" للبدء.</div>
        ) : (
          <div className="space-y-3">
            {dayEntries.map((entry) => {
              const slotDef = slotDefinitions.find((s) => s.id === entry.slotDefId);
              const slotNum = slotDef?.slotNumber || entry.slot || '?';
              const slotName = slotNum === 1 ? 'الأولى' : slotNum === 2 ? 'الثانية' : slotNum === 3 ? 'الثالثة' : slotNum === 4 ? 'الرابعة' : slotNum === 5 ? 'الخامسة' : slotNum === 6 ? 'السادسة' : slotNum === 7 ? 'السابعة' : slotNum === 8 ? 'الثامنة' : slotNum === 9 ? 'التاسعة' : slotNum === 10 ? 'العاشرة' : String(slotNum);
              return (
                <div key={entry.id} className="rounded-3xl bg-white p-4 ring-1 ring-slate-200">
                  {editingEntry?.id === entry.id ? (
                    <div className="space-y-3">
                      <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                        <div>
                          <label className="mb-1 block text-xs font-bold text-slate-600">الحصة</label>
                          <select value={editingEntry.slotDefId} onChange={(e) => setEditingEntry((prev) => ({ ...prev, slotDefId: e.target.value }))} className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-bold text-slate-700 outline-none focus:border-sky-400">
                            <option value="">-- اختر الحصة --</option>
                            {sortedSlotDefs.map((s) => <option key={s.id} value={s.id}>{s.slotNumber === 1 ? 'الأولى' : s.slotNumber === 2 ? 'الثانية' : s.slotNumber === 3 ? 'الثالثة' : s.slotNumber === 4 ? 'الرابعة' : s.slotNumber === 5 ? 'الخامسة' : s.slotNumber === 6 ? 'السادسة' : s.slotNumber === 7 ? 'السابعة' : s.slotNumber === 8 ? 'الثامنة' : s.slotNumber === 9 ? 'التاسعة' : 'العاشرة'} ({s.startTime} – {s.endTime})</option>)}
                          </select>
                        </div>
                        <div>
                          <label className="mb-1 block text-xs font-bold text-slate-600">المادة</label>
                          <select value={editingEntry.subject || editingEntry.slotLabel} onChange={(e) => setEditingEntry((prev) => ({ ...prev, subject: e.target.value, slotLabel: e.target.value }))} className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-bold text-slate-700 outline-none focus:border-sky-400">
                            <option value="">-- اختر المادة --</option>
                            {subjectBank.map((s) => <option key={s} value={s}>{s}</option>)}
                          </select>
                        </div>
                        <div>
                          <label className="mb-1 block text-xs font-bold text-slate-600">الفصل</label>
                          <select value={editingEntry.classroomId || ''} onChange={(e) => setEditingEntry((prev) => ({ ...prev, classroomId: e.target.value }))} className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-bold text-slate-700 outline-none focus:border-sky-400">
                            <option value="">-- اختر الفصل --</option>
                            {Object.entries(classroomsByGrade).map(([grade, rooms]) => (
                              <optgroup key={grade} label={grade}>
                                {rooms.map((c) => <option key={c.id} value={c.id}>{c.name || c.gradeLabel || 'فصل'}</option>)}
                              </optgroup>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label className="mb-1 block text-xs font-bold text-slate-600">المعلم</label>
                          <select value={editingEntry.teacherId || ''} onChange={(e) => setEditingEntry((prev) => ({ ...prev, teacherId: e.target.value }))} className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-bold text-slate-700 outline-none focus:border-sky-400">
                            <option value="">-- اختر المعلم --</option>
                            {teachers.map((t) => <option key={t.id} value={t.id}>{t.name || t.username}</option>)}
                          </select>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button type="button" onClick={saveEntryEdit} className="rounded-2xl bg-sky-700 px-4 py-2 text-sm font-bold text-white">حفظ</button>
                        <button type="button" onClick={() => setEditingEntry(null)} className="rounded-2xl bg-slate-100 px-4 py-2 text-sm font-bold text-slate-700">إلغاء</button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start gap-3">
                        <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-2xl bg-violet-100 text-sm font-black text-violet-700">{slotNum}</div>
                        <div>
                          <div className="font-black text-slate-900">الحصة {slotName} — {entry.subject || entry.slotLabel || '—'}</div>
                          <div className="mt-0.5 text-xs text-slate-500">{slotDef ? `${slotDef.startTime} – ${slotDef.endTime}` : (entry.startTime ? `${entry.startTime} – ${entry.endTime}` : '—')}</div>
                          <div className="mt-1.5 flex flex-wrap gap-2">
                            {entry.classroomId && <span className="rounded-xl bg-sky-50 px-2.5 py-1 text-xs font-bold text-sky-700 ring-1 ring-sky-100">{getClassroomName(entry.classroomId)}</span>}
                            {entry.teacherId && <span className="rounded-xl bg-emerald-50 px-2.5 py-1 text-xs font-bold text-emerald-700 ring-1 ring-emerald-100">{getTeacherName(entry.teacherId)}</span>}
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button type="button" onClick={() => setEditingEntry({ ...entry, subject: entry.subject || entry.slotLabel || '' })} className="rounded-2xl bg-slate-100 px-3 py-1.5 text-xs font-bold text-slate-600 hover:bg-slate-200">تعديل</button>
                        <button type="button" onClick={() => removeEntry(entry.id)} className="rounded-2xl bg-rose-50 px-3 py-1.5 text-xs font-bold text-rose-600 hover:bg-rose-100">حذف</button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

export default WeeklyTimetableEditor;

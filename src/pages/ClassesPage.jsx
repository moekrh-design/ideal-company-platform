import React, { useState, useMemo, useRef } from 'react';
import { SectionCard } from '../components/ui/SectionCard';
import {
  School, Users, Search, Printer, Download, ChevronDown,
  Hash, CreditCard, Phone, Star, Filter, X, BookOpen
} from 'lucide-react';

/**
 * ClassesPage - صفحة الفصول الدراسية
 * Props: selectedSchool
 */
export default function ClassesPage({ selectedSchool }) {
  const [selectedClassroomId, setSelectedClassroomId] = useState('');
  const [searchText, setSearchText] = useState('');
  const [filterStatus, setFilterStatus] = useState('all'); // all | active | inactive
  const [sortBy, setSortBy] = useState('name'); // name | points | attendance
  const [sortDir, setSortDir] = useState('asc');
  const tableRef = useRef(null);

  // ── استخراج الفصول ──
  const classrooms = useMemo(() => {
    return Array.isArray(selectedSchool?.structure?.classrooms)
      ? selectedSchool.structure.classrooms
      : [];
  }, [selectedSchool]);

  // ── الفصل المختار ──
  const selectedClassroom = useMemo(() => {
    if (!selectedClassroomId) return null;
    return classrooms.find(c => String(c.id) === String(selectedClassroomId)) || null;
  }, [classrooms, selectedClassroomId]);

  // ── الطلاب مع الفلترة والترتيب ──
  const students = useMemo(() => {
    if (!selectedClassroom) return [];
    let list = Array.isArray(selectedClassroom.students) ? selectedClassroom.students : [];

    // فلتر الحالة
    if (filterStatus === 'active') list = list.filter(s => s.status !== 'archived');
    if (filterStatus === 'inactive') list = list.filter(s => s.status === 'archived');

    // فلتر البحث
    if (searchText.trim()) {
      const q = searchText.trim().toLowerCase();
      list = list.filter(s =>
        (s.fullName || '').toLowerCase().includes(q) ||
        (s.identityNumber || '').includes(q) ||
        (s.guardianMobile || '').includes(q)
      );
    }

    // الترتيب
    list = [...list].sort((a, b) => {
      let va, vb;
      if (sortBy === 'points') { va = a.points || 0; vb = b.points || 0; }
      else if (sortBy === 'attendance') { va = a.attendanceRate || 0; vb = b.attendanceRate || 0; }
      else { va = (a.fullName || '').toLowerCase(); vb = (b.fullName || '').toLowerCase(); }
      if (va < vb) return sortDir === 'asc' ? -1 : 1;
      if (va > vb) return sortDir === 'asc' ? 1 : -1;
      return 0;
    });

    return list;
  }, [selectedClassroom, searchText, filterStatus, sortBy, sortDir]);

  // ── إحصائيات الفصل ──
  const stats = useMemo(() => {
    if (!selectedClassroom) return null;
    const all = Array.isArray(selectedClassroom.students) ? selectedClassroom.students : [];
    const active = all.filter(s => s.status !== 'archived');
    const totalPoints = active.reduce((sum, s) => sum + (s.points || 0), 0);
    const avgPoints = active.length ? Math.round(totalPoints / active.length) : 0;
    const avgAttendance = active.length
      ? Math.round(active.reduce((sum, s) => sum + (s.attendanceRate || 0), 0) / active.length)
      : 0;
    return { total: all.length, active: active.length, totalPoints, avgPoints, avgAttendance };
  }, [selectedClassroom]);

  // ── الطباعة ──
  const handlePrint = () => {
    const printContent = `
      <html dir="rtl">
      <head>
        <meta charset="UTF-8">
        <title>فصل ${selectedClassroom?.name || ''} - ${selectedSchool?.name || ''}</title>
        <style>
          * { font-family: 'Segoe UI', Tahoma, Arial, sans-serif; }
          body { margin: 20px; color: #1e293b; }
          h1 { font-size: 18px; margin-bottom: 4px; }
          h2 { font-size: 14px; color: #64748b; margin-bottom: 16px; font-weight: normal; }
          table { width: 100%; border-collapse: collapse; font-size: 13px; }
          th { background: #1e40af; color: white; padding: 8px 10px; text-align: right; }
          td { padding: 7px 10px; border-bottom: 1px solid #e2e8f0; }
          tr:nth-child(even) td { background: #f8fafc; }
          .badge { display: inline-block; padding: 2px 8px; border-radius: 20px; font-size: 11px; }
          .active { background: #dcfce7; color: #166534; }
          .archived { background: #fee2e2; color: #991b1b; }
          .footer { margin-top: 20px; font-size: 11px; color: #94a3b8; text-align: center; }
        </style>
      </head>
      <body>
        <h1>📚 ${selectedClassroom?.name || ''} — ${selectedSchool?.name || ''}</h1>
        <h2>الشركة: ${selectedClassroom?.companyName || '—'} | المرحلة: ${selectedClassroom?.stageLabel || ''} | عدد الطلاب: ${students.length}</h2>
        <table>
          <thead>
            <tr>
              <th>#</th>
              <th>اسم الطالب</th>
              <th>رقم الهوية</th>
              <th>جوال ولي الأمر</th>
              <th>النقاط</th>
              <th>نسبة الحضور</th>
              <th>الحالة</th>
            </tr>
          </thead>
          <tbody>
            ${students.map((s, i) => `
              <tr>
                <td>${i + 1}</td>
                <td>${s.fullName || '—'}</td>
                <td>${s.identityNumber || '—'}</td>
                <td dir="ltr">${s.guardianMobile || '—'}</td>
                <td>${s.points || 0}</td>
                <td>${s.attendanceRate ? s.attendanceRate.toFixed(1) + '%' : '—'}</td>
                <td><span class="badge ${s.status === 'archived' ? 'archived' : 'active'}">${s.status === 'archived' ? 'محفوظ' : 'نشط'}</span></td>
              </tr>
            `).join('')}
          </tbody>
        </table>
        <div class="footer">تم الطباعة بتاريخ ${new Date().toLocaleDateString('ar-SA')} — منصة المدرسة المثالية</div>
      </body>
      </html>
    `;
    const win = window.open('', '_blank');
    win.document.write(printContent);
    win.document.close();
    win.print();
  };

  // ── التصدير CSV ──
  const handleExport = () => {
    const headers = ['#', 'اسم الطالب', 'رقم الهوية', 'جوال ولي الأمر', 'اسم ولي الأمر', 'النقاط', 'نسبة الحضور', 'حالة الحضور', 'الحالة'];
    const rows = students.map((s, i) => [
      i + 1,
      s.fullName || '',
      s.identityNumber || '',
      s.guardianMobile || '',
      s.guardianName || '',
      s.points || 0,
      s.attendanceRate ? s.attendanceRate.toFixed(1) + '%' : '',
      s.attendanceStatus || '',
      s.status === 'archived' ? 'محفوظ' : 'نشط'
    ]);
    const csv = [headers, ...rows].map(r => r.map(v => `"${String(v).replace(/"/g, '""')}"`).join(',')).join('\n');
    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `فصل-${selectedClassroom?.name || 'بيانات'}-${selectedSchool?.name || ''}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // ── تبديل الترتيب ──
  const toggleSort = (col) => {
    if (sortBy === col) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortBy(col); setSortDir('asc'); }
  };

  const SortIcon = ({ col }) => {
    if (sortBy !== col) return <span className="text-slate-300 text-xs">↕</span>;
    return <span className="text-blue-300 text-xs">{sortDir === 'asc' ? '↑' : '↓'}</span>;
  };

  // ── لا توجد مدرسة ──
  if (!selectedSchool) {
    return (
      <div className="flex flex-col gap-6 p-6">
        <SectionCard title="الفصول الدراسية" icon={School}>
          <div className="rounded-2xl bg-slate-50 p-10 text-center">
            <School className="mx-auto mb-3 h-10 w-10 text-slate-300" />
            <div className="text-sm font-bold text-slate-500">الرجاء اختيار مدرسة أولاً</div>
          </div>
        </SectionCard>
      </div>
    );
  }

  // ── لا توجد فصول ──
  if (classrooms.length === 0) {
    return (
      <div className="flex flex-col gap-6 p-6">
        <SectionCard title={`فصول ${selectedSchool.name}`} icon={School}>
          <div className="rounded-2xl bg-slate-50 p-10 text-center">
            <BookOpen className="mx-auto mb-3 h-10 w-10 text-slate-300" />
            <div className="text-sm font-bold text-slate-500">لا توجد فصول مُعرَّفة لهذه المدرسة</div>
            <div className="mt-1 text-xs text-slate-400">يمكن إضافة الفصول من إعدادات المدرسة</div>
          </div>
        </SectionCard>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-5 p-6">

      {/* ── رأس الصفحة ── */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-800">الفصول الدراسية</h1>
          <p className="text-sm text-slate-500 mt-0.5">{selectedSchool.name} — {classrooms.length} فصل</p>
        </div>
        {selectedClassroom && (
          <div className="flex gap-2">
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-600 hover:bg-slate-50 transition-colors"
            >
              <Printer className="h-4 w-4" />
              طباعة
            </button>
            <button
              onClick={handleExport}
              className="flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3 py-2 text-sm text-white hover:bg-emerald-700 transition-colors"
            >
              <Download className="h-4 w-4" />
              تصدير CSV
            </button>
          </div>
        )}
      </div>

      {/* ── اختيار الفصل ── */}
      <div className="rounded-2xl bg-white border border-slate-200 p-5 shadow-sm">
        <label className="block text-sm font-semibold text-slate-700 mb-2">
          <BookOpen className="inline h-4 w-4 ml-1 text-blue-500" />
          اختر الفصل
        </label>
        <div className="relative">
          <select
            value={selectedClassroomId}
            onChange={e => { setSelectedClassroomId(e.target.value); setSearchText(''); }}
            className="w-full appearance-none rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 pr-10 text-sm text-slate-800 focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-100 transition-all"
          >
            <option value="">— اختر الفصل —</option>
            {classrooms.map(c => (
              <option key={c.id} value={String(c.id)}>
                {c.name}
                {c.companyName ? ` (${c.companyName})` : ''}
                {' — '}
                {Array.isArray(c.students) ? c.students.length : 0} طالب
              </option>
            ))}
          </select>
          <ChevronDown className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
        </div>
      </div>

      {/* ── بطاقات إحصائيات الفصل ── */}
      {selectedClassroom && stats && (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {[
            { label: 'إجمالي الطلاب', value: stats.total, icon: Users, color: 'blue' },
            { label: 'الطلاب النشطون', value: stats.active, icon: Users, color: 'emerald' },
            { label: 'متوسط النقاط', value: stats.avgPoints, icon: Star, color: 'amber' },
            { label: 'متوسط الحضور', value: stats.avgAttendance + '%', icon: Hash, color: 'violet' },
          ].map(({ label, value, icon: Icon, color }) => (
            <div key={label} className={`rounded-2xl bg-${color}-50 border border-${color}-100 p-4`}>
              <div className={`flex items-center gap-2 text-${color}-600 mb-1`}>
                <Icon className="h-4 w-4" />
                <span className="text-xs font-medium">{label}</span>
              </div>
              <div className={`text-2xl font-bold text-${color}-700`}>{value}</div>
            </div>
          ))}
        </div>
      )}

      {/* ── جدول الطلاب ── */}
      {selectedClassroom && (
        <div className="rounded-2xl bg-white border border-slate-200 shadow-sm overflow-hidden">

          {/* شريط الفلترة */}
          <div className="flex flex-wrap items-center gap-3 border-b border-slate-100 bg-slate-50 px-5 py-3">
            {/* بحث */}
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                type="text"
                placeholder="بحث بالاسم أو الهوية أو الجوال..."
                value={searchText}
                onChange={e => setSearchText(e.target.value)}
                className="w-full rounded-lg border border-slate-200 bg-white py-2 pr-9 pl-3 text-sm text-slate-700 focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-100"
              />
              {searchText && (
                <button onClick={() => setSearchText('')} className="absolute left-3 top-1/2 -translate-y-1/2">
                  <X className="h-3.5 w-3.5 text-slate-400 hover:text-slate-600" />
                </button>
              )}
            </div>

            {/* فلتر الحالة */}
            <div className="flex items-center gap-1 rounded-lg border border-slate-200 bg-white p-1">
              {[
                { val: 'all', label: 'الكل' },
                { val: 'active', label: 'نشط' },
                { val: 'inactive', label: 'محفوظ' },
              ].map(({ val, label }) => (
                <button
                  key={val}
                  onClick={() => setFilterStatus(val)}
                  className={`rounded-md px-3 py-1 text-xs font-medium transition-colors ${
                    filterStatus === val
                      ? 'bg-blue-600 text-white'
                      : 'text-slate-500 hover:bg-slate-100'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>

            <span className="text-xs text-slate-400 mr-auto">
              <Filter className="inline h-3.5 w-3.5 ml-1" />
              {students.length} طالب
            </span>
          </div>

          {/* الجدول */}
          <div className="overflow-x-auto" ref={tableRef}>
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-800 text-white">
                  <th className="px-4 py-3 text-right font-semibold w-10">#</th>
                  <th
                    className="px-4 py-3 text-right font-semibold cursor-pointer hover:bg-slate-700 select-none"
                    onClick={() => toggleSort('name')}
                  >
                    اسم الطالب <SortIcon col="name" />
                  </th>
                  <th className="px-4 py-3 text-right font-semibold">
                    <CreditCard className="inline h-3.5 w-3.5 ml-1" />
                    رقم الهوية
                  </th>
                  <th className="px-4 py-3 text-right font-semibold">
                    <Phone className="inline h-3.5 w-3.5 ml-1" />
                    جوال ولي الأمر
                  </th>
                  <th className="px-4 py-3 text-right font-semibold">اسم ولي الأمر</th>
                  <th
                    className="px-4 py-3 text-right font-semibold cursor-pointer hover:bg-slate-700 select-none"
                    onClick={() => toggleSort('points')}
                  >
                    <Star className="inline h-3.5 w-3.5 ml-1" />
                    النقاط <SortIcon col="points" />
                  </th>
                  <th
                    className="px-4 py-3 text-right font-semibold cursor-pointer hover:bg-slate-700 select-none"
                    onClick={() => toggleSort('attendance')}
                  >
                    الحضور <SortIcon col="attendance" />
                  </th>
                  <th className="px-4 py-3 text-right font-semibold">الحالة</th>
                </tr>
              </thead>
              <tbody>
                {students.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-12 text-center text-slate-400 text-sm">
                      <Search className="mx-auto mb-2 h-8 w-8 text-slate-200" />
                      لا توجد نتائج مطابقة
                    </td>
                  </tr>
                ) : (
                  students.map((student, index) => (
                    <tr
                      key={student.id}
                      className={`border-b border-slate-100 transition-colors hover:bg-blue-50 ${
                        index % 2 === 0 ? 'bg-white' : 'bg-slate-50/50'
                      }`}
                    >
                      <td className="px-4 py-3 text-slate-400 text-xs font-mono">{index + 1}</td>
                      <td className="px-4 py-3">
                        <div className="font-semibold text-slate-800">{student.fullName || '—'}</div>
                        {student.attendanceStatus && (
                          <div className={`text-xs mt-0.5 ${
                            student.attendanceStatus === 'مبكر' ? 'text-emerald-600' :
                            student.attendanceStatus === 'متأخر' ? 'text-amber-600' :
                            'text-slate-400'
                          }`}>
                            {student.attendanceStatus}
                          </div>
                        )}
                      </td>
                      <td className="px-4 py-3 font-mono text-slate-600 text-xs">
                        {student.identityNumber || '—'}
                      </td>
                      <td className="px-4 py-3 font-mono text-slate-600 text-xs" dir="ltr">
                        {student.guardianMobile || '—'}
                      </td>
                      <td className="px-4 py-3 text-slate-600 text-xs">
                        {student.guardianName || '—'}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-bold ${
                          (student.points || 0) >= 50 ? 'bg-emerald-100 text-emerald-700' :
                          (student.points || 0) >= 20 ? 'bg-blue-100 text-blue-700' :
                          (student.points || 0) > 0 ? 'bg-amber-100 text-amber-700' :
                          'bg-slate-100 text-slate-500'
                        }`}>
                          <Star className="h-3 w-3" />
                          {student.points || 0}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        {student.attendanceRate != null ? (
                          <div className="flex items-center gap-2">
                            <div className="h-1.5 w-16 rounded-full bg-slate-200 overflow-hidden">
                              <div
                                className={`h-full rounded-full ${
                                  student.attendanceRate >= 90 ? 'bg-emerald-500' :
                                  student.attendanceRate >= 75 ? 'bg-amber-500' :
                                  'bg-rose-500'
                                }`}
                                style={{ width: `${Math.min(100, student.attendanceRate)}%` }}
                              />
                            </div>
                            <span className="text-xs text-slate-600 font-mono">
                              {student.attendanceRate.toFixed(1)}%
                            </span>
                          </div>
                        ) : (
                          <span className="text-xs text-slate-400">—</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${
                          student.status === 'archived'
                            ? 'bg-rose-100 text-rose-700'
                            : 'bg-emerald-100 text-emerald-700'
                        }`}>
                          {student.status === 'archived' ? 'محفوظ' : 'نشط'}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* تذييل الجدول */}
          {students.length > 0 && (
            <div className="flex items-center justify-between border-t border-slate-100 bg-slate-50 px-5 py-3">
              <span className="text-xs text-slate-500">
                إجمالي: <strong>{students.length}</strong> طالب
                {stats && ` | مجموع النقاط: ${students.reduce((s, st) => s + (st.points || 0), 0)}`}
              </span>
              <div className="flex gap-2">
                <button
                  onClick={handlePrint}
                  className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-100 transition-colors"
                >
                  <Printer className="h-3.5 w-3.5" /> طباعة
                </button>
                <button
                  onClick={handleExport}
                  className="flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3 py-1.5 text-xs text-white hover:bg-emerald-700 transition-colors"
                >
                  <Download className="h-3.5 w-3.5" /> تصدير
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

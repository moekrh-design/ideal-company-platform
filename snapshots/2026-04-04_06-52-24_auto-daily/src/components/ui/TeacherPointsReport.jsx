import React, { useMemo } from 'react';
import { SectionCard } from '../ui/SectionCard';
import { BarChart2 } from 'lucide-react';

/**
 * TeacherPointsReport - تقرير نقاط المعلمين
 * Props: schoolActions (array), settings (object)
 */
export function TeacherPointsReport({ schoolActions = [], settings }) {
  const teacherStats = useMemo(() => {
    const map = {};
    schoolActions.forEach(action => {
      if (!action.teacherId || !action.teacherName) return;
      if (!map[action.teacherId]) {
        map[action.teacherId] = { name: action.teacherName, count: 0, points: 0 };
      }
      map[action.teacherId].count++;
      map[action.teacherId].points += action.points || 0;
    });
    return Object.values(map).sort((a, b) => b.points - a.points);
  }, [schoolActions]);

  return (
    <SectionCard title="تقرير نقاط المعلمين" icon={BarChart2}>
      {teacherStats.length === 0 ? (
        <div className="rounded-2xl bg-slate-50 p-6 text-center text-sm text-slate-400">
          لا توجد بيانات لعرضها
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {teacherStats.map((t, i) => (
            <div key={t.name} className="flex items-center gap-3 rounded-2xl bg-white px-4 py-3 ring-1 ring-slate-200">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-sky-100 text-sm font-bold text-sky-700">
                {i + 1}
              </div>
              <div className="flex-1">
                <div className="text-sm font-bold text-slate-800">{t.name}</div>
                <div className="text-xs text-slate-500">{t.count} إجراء</div>
              </div>
              <div className="text-sm font-black text-emerald-600">{t.points} نقطة</div>
            </div>
          ))}
        </div>
      )}
    </SectionCard>
  );
}

export default TeacherPointsReport;

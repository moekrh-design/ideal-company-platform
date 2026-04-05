import React, { useState, useEffect } from 'react';
import { SectionCard } from '../ui/SectionCard';
import { User } from 'lucide-react';

/**
 * NafisStudentWidget - ويدجت بيانات الطالب من نافس
 * Props: studentId, schoolId, studentName
 */
export function NafisStudentWidget({ studentId, schoolId, studentName }) {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);

  useEffect(() => {
    if (!studentId) return;
    setLoading(true);
    // محاكاة تحميل البيانات
    const timer = setTimeout(() => {
      setLoading(false);
      setData(null); // لا بيانات متاحة في هذه النسخة
    }, 800);
    return () => clearTimeout(timer);
  }, [studentId, schoolId]);

  return (
    <SectionCard title={`بيانات نافس - ${studentName || ''}`} icon={User}>
      {loading ? (
        <div className="flex items-center justify-center p-8 text-sm text-slate-400">
          <div className="h-5 w-5 animate-spin rounded-full border-2 border-sky-500 border-t-transparent ml-2" />
          جارٍ التحميل...
        </div>
      ) : (
        <div className="rounded-2xl bg-slate-50 p-6 text-center text-sm text-slate-400">
          لا تتوفر بيانات نافس لهذا الطالب في الوقت الحالي
        </div>
      )}
    </SectionCard>
  );
}

export default NafisStudentWidget;

import React from 'react';
import { SectionCard } from '../components/ui/SectionCard';
import { School } from 'lucide-react';

/**
 * ClassesPage - صفحة الفصول الدراسية
 * Props: selectedSchool
 */
export default function ClassesPage({ selectedSchool }) {
  return (
    <div className="flex flex-col gap-6 p-6">
      <SectionCard title="الفصول الدراسية" icon={School}>
        <div className="rounded-2xl bg-slate-50 p-8 text-center">
          <School className="mx-auto mb-3 h-10 w-10 text-slate-300" />
          <div className="text-sm font-bold text-slate-500">
            {selectedSchool ? `فصول ${selectedSchool.name}` : 'الرجاء اختيار مدرسة'}
          </div>
          <div className="mt-2 text-xs text-slate-400">
            هذه الصفحة قيد التطوير
          </div>
        </div>
      </SectionCard>
    </div>
  );
}

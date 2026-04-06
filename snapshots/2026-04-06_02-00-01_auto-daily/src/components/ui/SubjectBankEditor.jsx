import React, { useState } from 'react';
import { SectionCard } from '../ui/SectionCard';
import { Button } from '../ui/FormElements';
import { Plus, Trash2, BookOpen } from 'lucide-react';

/**
 * SubjectBankEditor - محرر بنك المواد الدراسية
 * Props: subjects (array), onChange (function)
 */
export function SubjectBankEditor({ subjects = [], onChange }) {
  const [newSubject, setNewSubject] = useState('');

  const handleAdd = () => {
    if (!newSubject.trim()) return;
    const item = {
      id: Date.now().toString(),
      name: newSubject.trim(),
      active: true,
    };
    onChange([...subjects, item]);
    setNewSubject('');
  };

  const handleRemove = (id) => {
    onChange(subjects.filter(s => s.id !== id));
  };

  const handleToggle = (id) => {
    onChange(subjects.map(s => s.id === id ? { ...s, active: !s.active } : s));
  };

  return (
    <SectionCard title="بنك المواد الدراسية" icon={BookOpen}>
      <div className="mb-4 flex flex-col gap-2">
        {subjects.length === 0 && (
          <div className="rounded-2xl bg-slate-50 p-4 text-center text-sm text-slate-400">لا توجد مواد بعد</div>
        )}
        {subjects.map(s => (
          <div key={s.id} className="flex items-center gap-3 rounded-2xl bg-white px-4 py-3 ring-1 ring-slate-200">
            <button
              onClick={() => handleToggle(s.id)}
              className={`h-5 w-5 rounded-full border-2 flex-shrink-0 transition-colors ${s.active ? 'border-sky-500 bg-sky-500' : 'border-slate-300 bg-white'}`}
            />
            <span className={`flex-1 text-sm font-medium ${s.active ? 'text-slate-800' : 'text-slate-400 line-through'}`}>
              {s.name}
            </span>
            <button onClick={() => handleRemove(s.id)} className="text-rose-400 hover:text-rose-600">
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        ))}
      </div>
      <div className="flex gap-2">
        <input
          value={newSubject}
          onChange={e => setNewSubject(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleAdd()}
          placeholder="اسم المادة الجديدة"
          className="flex-1 rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm outline-none"
        />
        <Button onClick={handleAdd}>
          <Plus className="h-4 w-4" />
          إضافة
        </Button>
      </div>
    </SectionCard>
  );
}

export default SubjectBankEditor;

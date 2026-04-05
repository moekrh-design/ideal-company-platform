import React, { useState } from 'react';
import { SectionCard } from '../ui/SectionCard';
import { Button } from '../ui/FormElements';
import { Plus, Trash2, BookOpen } from 'lucide-react';

/**
 * ActionCatalogEditor - محرر بنك الإجراءات (مكافآت / خصومات / برامج)
 * Props: title, description, mode ('reward'|'violation'|'program'), items, suggestions, onChange
 */
export function ActionCatalogEditor({ title, description, mode = 'reward', items = [], suggestions = [], onChange }) {
  const [newLabel, setNewLabel] = useState('');
  const [newPoints, setNewPoints] = useState('');

  const handleAdd = () => {
    if (!newLabel.trim()) return;
    const item = {
      id: Date.now().toString(),
      label: newLabel.trim(), title: newLabel.trim(),
      points: mode !== 'program' ? (parseInt(newPoints) || 1) : undefined,
      active: true,
    };
    onChange([...items, item]);
    setNewLabel('');
    setNewPoints('');
  };

  const handleRemove = (id) => {
    onChange(items.filter(i => i.id !== id));
  };

  const handleToggle = (id) => {
    onChange(items.map(i => i.id === id ? { ...i, active: !i.active } : i));
  };

  const handleAddSuggestion = (s) => {
    if (items.find(i => (i.label || i.title) === (s.label || s.title))) return;
    onChange([...items, { ...s, id: Date.now().toString(), active: true }]);
  };

  const toneMap = { reward: 'emerald', violation: 'rose', program: 'sky' };

  return (
    <SectionCard title={title} icon={BookOpen}>
      {description && <p className="mb-4 text-sm text-slate-500">{description}</p>}

      {/* القائمة الحالية */}
      <div className="mb-4 flex flex-col gap-2">
        {items.length === 0 && (
          <div className="rounded-2xl bg-slate-50 p-4 text-center text-sm text-slate-400">لا توجد بنود بعد</div>
        )}
        {items.map(item => (
          <div key={item.id} className="flex items-center gap-3 rounded-2xl bg-white px-4 py-3 ring-1 ring-slate-200">
            <button
              onClick={() => handleToggle(item.id)}
              className={`h-5 w-5 rounded-full border-2 flex-shrink-0 transition-colors ${item.active ? 'border-emerald-500 bg-emerald-500' : 'border-slate-300 bg-white'}`}
            />
            <span className={`flex-1 text-sm font-medium ${item.active ? 'text-slate-800' : 'text-slate-400 line-through'}`}>
              {item.label || item.title}
            </span>
            {mode !== 'program' && item.points !== undefined && (
              <span className="text-xs font-bold text-slate-500">{item.points} نقطة</span>
            )}
            <button onClick={() => handleRemove(item.id)} className="text-rose-400 hover:text-rose-600">
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        ))}
      </div>

      {/* إضافة بند جديد */}
      <div className="flex gap-2 mb-4">
        <input
          value={newLabel}
          onChange={e => setNewLabel(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleAdd()}
          placeholder="اسم البند الجديد"
          className="flex-1 rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm outline-none"
        />
        {mode !== 'program' && (
          <input
            type="number"
            value={newPoints}
            onChange={e => setNewPoints(e.target.value)}
            placeholder="النقاط"
            className="w-24 rounded-2xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none"
          />
        )}
        <Button onClick={handleAdd} variant="primary">
          <Plus className="h-4 w-4" />
          إضافة
        </Button>
      </div>

      {/* اقتراحات */}
      {suggestions.length > 0 && (
        <div>
          <div className="mb-2 text-xs font-bold text-slate-500">اقتراحات سريعة:</div>
          <div className="flex flex-wrap gap-2">
            {suggestions.slice(0, 12).map((s, i) => (
              <button
                key={i}
                onClick={() => handleAddSuggestion(s)}
                disabled={!!items.find(item => item.label === s.label)}
                className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700 hover:bg-slate-200 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {s.label}
              </button>
            ))}
          </div>
        </div>
      )}
    </SectionCard>
  );
}

export default ActionCatalogEditor;

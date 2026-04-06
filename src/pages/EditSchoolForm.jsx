import React, { useState } from 'react';
import { useFormValidation, validators } from '../hooks/useFormValidation';
import { Input, FormError } from '../components/ui/FormElements';

function EditSchoolForm({ school, onSave, onCancel }) {
  const [form, setForm] = useState(school);
  const { errors, validate, clearError } = useFormValidation();

  const submit = (e) => {
    e.preventDefault();
    const ok = validate({
      name: [validators.required('اسم المدرسة')],
      city: [validators.required('المدينة')],
      code: [validators.required('الرقم الوزاري'), validators.schoolCode('الرقم الوزاري')],
      principalEmail: [validators.email('البريد الإلكتروني لمدير المدرسة')],
      principalPhone: [validators.mobile('رقم جوال مدير المدرسة')],
    }, form);
    if (!ok) return;
    onSave(form);
  };

  return (
    <form onSubmit={submit}>
      <div className="mb-4 rounded-2xl bg-sky-50 px-4 py-3 text-sm text-sky-800 ring-1 ring-sky-200">
        تعديل البيانات الأساسية للمدرسة. يمكنك تحديث جميع الحقول ثم الضغط على حفظ التغييرات.
      </div>
      <FormError errors={errors} />
      <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
        <Input required label="اسم المدرسة" value={form.name || ''} error={errors.name} onChange={(e) => { setForm({ ...form, name: e.target.value }); clearError('name'); }} placeholder="مثال: متوسطة الملك فهد" />
        <Input required label="المدينة" value={form.city || ''} error={errors.city} onChange={(e) => { setForm({ ...form, city: e.target.value }); clearError('city'); }} placeholder="مثال: الرياض" />
        <Input required label="الرقم الوزاري" value={form.code || ''} error={errors.code} onChange={(e) => { setForm({ ...form, code: e.target.value }); clearError('code'); }} placeholder="مثال: RYD-001" />
        <Input label="مدير المدرسة" value={form.manager || ''} onChange={(e) => setForm({ ...form, manager: e.target.value })} placeholder="اسم المدير" hint="اختياري" />
      </div>
      <div className="mt-4 border-t border-slate-200 pt-4">
        <div className="mb-3 text-sm font-bold text-slate-600">بيانات حساب مدير المدرسة</div>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <Input label="اسم دخول مدير المدرسة" value={form.principalUsername || ''} onChange={(e) => setForm({ ...form, principalUsername: e.target.value.trim().toLowerCase() })} placeholder="مثال: ryd001.principal" hint="اختياري" />
          <Input label="البريد الإلكتروني لمدير المدرسة" value={form.principalEmail || ''} error={errors.principalEmail} onChange={(e) => { setForm({ ...form, principalEmail: e.target.value.trim().toLowerCase() }); clearError('principalEmail'); }} placeholder="principal@example.com" hint="اختياري" />
          <Input label="رقم جوال مدير المدرسة" value={form.principalPhone || ''} error={errors.principalPhone} onChange={(e) => { setForm({ ...form, principalPhone: e.target.value }); clearError('principalPhone'); }} placeholder="مثال: 0512345678" type="tel" hint="اختياري" />
          <Input label="كلمة المرور الجديدة" value={form.principalPassword || ''} onChange={(e) => setForm({ ...form, principalPassword: e.target.value })} placeholder="اتركها فارغة للإبقاء على الحالية" hint="اختياري" />
        </div>
      </div>
      <div className="mt-6 flex justify-end gap-4">
        <button type="button" onClick={onCancel} className="rounded-xl bg-slate-100 px-4 py-2 font-bold text-slate-700">إلغاء</button>
        <button type="submit" className="rounded-xl bg-sky-700 px-4 py-2 font-bold text-white">حفظ التغييرات</button>
      </div>
    </form>
  );
}

export default EditSchoolForm;

import React from 'react';
import { SectionCard } from '../components/ui/SectionCard';
import { Shield } from 'lucide-react';

/**
 * PlatformAuthSettingsPage - صفحة إعدادات المصادقة والمنصة
 * Props: selectedSchool, settings, users, schools, currentUser, onSaveSettings, onRestoreBackup, onResetData, onExportBackup, onImportStudents, onDownloadTemplate, setAttendanceMethod, attendanceMethod
 */
export default function PlatformAuthSettingsPage({
  selectedSchool,
  settings,
  onSaveSettings,
  onRestoreBackup,
  onResetData,
  onExportBackup,
  onImportStudents,
  onDownloadTemplate,
  attendanceMethod,
  setAttendanceMethod,
}) {
  return (
    <div className="flex flex-col gap-6 p-6">
      <SectionCard title="إعدادات المنصة والمصادقة" icon={Shield}>
        <div className="flex flex-col gap-4">
          {/* طريقة الحضور */}
          <div>
            <div className="mb-2 text-sm font-bold text-slate-700">طريقة تسجيل الحضور</div>
            <div className="flex gap-3">
              {['qr', 'barcode', 'manual', 'face'].map(method => (
                <button
                  key={method}
                  onClick={() => setAttendanceMethod && setAttendanceMethod(method)}
                  className={`rounded-2xl px-4 py-2 text-sm font-bold transition-colors ${
                    attendanceMethod === method
                      ? 'bg-sky-600 text-white'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  {method === 'qr' ? 'QR Code' : method === 'barcode' ? 'باركود' : method === 'manual' ? 'يدوي' : 'التعرف على الوجه'}
                </button>
              ))}
            </div>
          </div>

          {/* النسخ الاحتياطي */}
          <div className="flex flex-wrap gap-3 pt-2">
            <button
              onClick={onExportBackup}
              className="rounded-2xl bg-emerald-100 px-4 py-2 text-sm font-bold text-emerald-700 hover:bg-emerald-200"
            >
              تصدير نسخة احتياطية
            </button>
            <button
              onClick={onRestoreBackup}
              className="rounded-2xl bg-sky-100 px-4 py-2 text-sm font-bold text-sky-700 hover:bg-sky-200"
            >
              استعادة نسخة احتياطية
            </button>
            <button
              onClick={onDownloadTemplate}
              className="rounded-2xl bg-slate-100 px-4 py-2 text-sm font-bold text-slate-700 hover:bg-slate-200"
            >
              تنزيل قالب استيراد الطلاب
            </button>
          </div>

          {/* تحذير إعادة التعيين */}
          <div className="rounded-2xl bg-rose-50 p-4 ring-1 ring-rose-200">
            <div className="text-sm font-bold text-rose-700 mb-2">منطقة الخطر</div>
            <button
              onClick={onResetData}
              className="rounded-2xl bg-rose-600 px-4 py-2 text-sm font-bold text-white hover:bg-rose-700"
            >
              إعادة تعيين جميع البيانات
            </button>
          </div>
        </div>
      </SectionCard>
    </div>
  );
}

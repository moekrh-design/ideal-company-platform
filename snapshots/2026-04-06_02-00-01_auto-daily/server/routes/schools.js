/**
 * ==========================================
 *  School Routes - مسارات إدارة المدارس
 * ==========================================
 *  إدارة المدارس، الأجهزة، الطلاب، التقارير
 *  ~25 نقطة API
 * 
 *  ملاحظة: هذا الملف يحدد التوقيعات (signatures) فقط
 *  التنفيذ الفعلي لا يزال في index.js الأصلي
 *  سيتم نقله تدريجياً بعد التحقق من التوافق
 * ==========================================
 */

/**
 * مسارات المدارس المتوفرة:
 * 
 * POST   /api/schools                              — إضافة مدرسة جديدة
 * POST   /api/schools/:id/import-snapshot           — استيراد بيانات مدرسة
 * POST   /api/schools/:id/device-links              — إنشاء رابط جهاز (بوابة/شاشة)
 * PATCH  /api/schools/:id/device-links/screen/:sid  — تعديل إعدادات شاشة
 * POST   /api/schools/:id/device-links/:kind/:lid   — حذف رابط جهاز
 * POST   /api/schools/:id/students/import           — استيراد طلاب من Excel
 * PATCH  /api/schools/:id/attendance-binding         — تعديل مصدر الحضور
 * GET    /api/schools/:id/reports/executive          — التقرير التنفيذي
 * POST   /api/schools/:id/messages/test              — اختبار الرسائل
 * POST   /api/schools/:id/messages/send              — إرسال رسالة
 * PATCH  /api/schools/:id/messages/settings           — إعدادات الرسائل
 * POST   /api/schools/:id/messages/templates/save     — حفظ قالب رسالة
 * POST   /api/schools/:id/messages/templates/:id/delete — حذف قالب
 * POST   /api/schools/:id/messages/rules/save         — حفظ قاعدة أتمتة
 * POST   /api/schools/:id/messages/rules/:id/toggle   — تفعيل/تعطيل قاعدة
 * GET    /api/schools/:id/students                    — قائمة الطلاب
 * POST   /api/schools/:id/students/:sid/face          — بصمة وجه
 * PATCH  /api/schools/:id/teacher-points-cap          — سقف نقاط المعلم
 * POST   /api/schools/:id/actions/apply               — تطبيق إجراء طالب
 * POST   /api/schools/:id/programs/apply              — تطبيق برنامج
 * GET    /api/public/gate/:token                      — بوابة عامة
 * POST   /api/public/gate/:token/scan                 — مسح بوابة عامة
 * GET    /api/public/screen/:token                    — شاشة عامة
 */

export const SCHOOL_ROUTES_REGISTRY = {
  total: 23,
  status: 'managed-in-index',
  note: 'المسارات تُدار حالياً من index.js وسيتم نقلها تدريجياً',
};

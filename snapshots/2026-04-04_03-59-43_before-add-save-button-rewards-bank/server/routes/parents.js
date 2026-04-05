/**
 * ==========================================
 *  Parent Portal Routes - مسارات بوابة ولي الأمر
 * ==========================================
 *  ~25 نقطة API لبوابة أولياء الأمور
 * 
 *  ملاحظة: هذا الملف يحدد التوقيعات (signatures) فقط
 *  التنفيذ الفعلي لا يزال في index.js الأصلي
 * ==========================================
 */

/**
 * مسارات بوابة ولي الأمر:
 * 
 * === المصادقة ===
 * POST   /api/parent/request-otp                    — طلب رمز تحقق
 * POST   /api/parent/verify-otp                     — تحقق من الرمز
 * POST   /api/parent/alt-login/request              — دخول بديل (هوية وطنية)
 * POST   /api/parent/logout                         — تسجيل خروج
 * GET    /api/parent/bootstrap                      — تهيئة البوابة
 * GET    /api/parent/portal-config                  — إعدادات البوابة
 * 
 * === إدارة الحساب ===
 * POST   /api/parent/add-contact/request-otp        — إضافة وسيلة اتصال
 * POST   /api/parent/add-contact/verify-otp         — تحقق إضافة وسيلة
 * POST   /api/parent/change-primary/request-otp     — تغيير الرقم الأساسي
 * POST   /api/parent/change-primary/verify-otp      — تحقق تغيير الرقم
 * POST   /api/parent/notification-settings           — إعدادات التنبيهات
 * 
 * === المكافآت ===
 * POST   /api/parent/reward-proposals               — اقتراح مكافأة
 * POST   /api/parent/reward-redemptions             — طلب استبدال نقاط
 * 
 * === نافس ===
 * GET    /api/parent/nafis/student-stats             — إحصائيات الطالب
 * GET    /api/parent/nafis/school-stats              — إحصائيات المدرسة
 * POST   /api/parent/nafis/start-quiz               — بدء اختبار
 * POST   /api/parent/nafis/submit-quiz              — تسليم اختبار
 * GET    /api/parent/nafis/subjects                  — المواد المتاحة
 * 
 * === التصحيح ===
 * POST   /api/parent/debug-whatsapp                 — اختبار واتساب
 * POST   /api/parent/debug-phones                   — اختبار أرقام
 * 
 * === إدارة (Admin) ===
 * GET    /api/admin/parent-primary-requests          — طلبات تغيير الرقم
 * POST   /api/admin/parent-primary-requests/policy   — سياسة الموافقة
 * POST   /api/admin/parent-primary-requests/portal-settings — إعدادات البوابة
 * GET    /api/admin/parents                          — قائمة أولياء الأمور
 * GET    /api/admin/parents/audit-feed               — سجل أولياء الأمور
 * POST   /api/admin/parents/send-access-code         — إرسال كود وصول
 * POST   /api/admin/parents/generate-link            — توليد رابط
 * GET    /api/admin/parents/details                  — تفاصيل ولي أمر
 * POST   /api/admin/parents/toggle-suspension        — إيقاف/تفعيل حساب
 * POST   /api/admin/parents/reassign-student         — نقل طالب
 */

export const PARENT_ROUTES_REGISTRY = {
  total: 30,
  status: 'managed-in-index',
  note: 'المسارات تُدار حالياً من index.js وسيتم نقلها تدريجياً',
};

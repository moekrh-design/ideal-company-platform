/**
 * ==========================================
 *  StudentRolePage Component
 *  تم استخراجه تلقائياً من App.jsx
 * ==========================================
 */
import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  BadgeCheck, BarChart3, Bell, BookOpen, CheckCircle, Building2, Camera,
  ClipboardCheck, ClipboardList, Copy, Database, ExternalLink, Download,
  Gift, FileClock, GraduationCap, Layers3, LayoutDashboard, LineChart,
  Maximize2, Plus, QrCode, RefreshCw, Rocket, Wifi, WifiOff, Clock3,
  Save, ScanLine, School, ShoppingCart, Search, Settings, Shield,
  ShieldAlert, ShieldCheck, Trash2, Trophy, Upload, UserCircle2, Users,
  Wand2, Pencil, Archive, ArrowRightLeft, MonitorSmartphone, Loader2,
  PackageCheck, Printer, Unlink2, UserCheck, Phone, RefreshCcw, School2,
  Sparkles, FolderOpen, Info, ChevronDown, AlertCircle
} from 'lucide-react';
import {
  Bar, BarChart, CartesianGrid, Cell, LabelList, Legend,
  Line, LineChart as RLineChart, Pie, PieChart, ResponsiveContainer,
  Tooltip, XAxis, YAxis
} from 'recharts';
// === الدوال المشتركة ===
import { SPECIAL_ITEM_TEMPLATES, appendGateSyncLog, applyMessageVariables, applyPointsToUnifiedStudent, applySchoolAccessToUser, buildCsv, buildHydratedClientState, buildLeavePassLink, buildLessonAttendanceSessionLabel, buildLessonSessionLink, buildPrintSummaryStats, buildPublicLink, buildRewardStoreScreenSummary, buildRewardStoreSummary, buildRolePermissions, buildStructureAttendanceBarcode, buildStudentNumberFromImport, buildTemplateStudentsCsv, buildWsUrl, canAccessPermission, canPrincipalManageUser, captureDataUrlFromVideo, clamp, clampDelegatedPermissions, clampScreenLabel, clearGateSyncLog, clearLeavePassParam, clearLessonSessionParam, clearSchoolStructureViewState, compareFaceSignatures, computeLessonAttendanceSessionSummary, computeTeacherSpecialScore, computeTeacherSpecialStats, createBarcode, createDefaultMessagingCenter, createDefaultSchoolAccess, createDefaultSmartLinks, createDefaultState, createDefaultUsers, createLeavePassEvent, createRewardStoreNotification, createSeedUsersForSchool, cx, defaultActionCatalog, defaultPermissionsByRole, defaultSettings, detectNoorOriginalRows, downloadFile, drawVisualSourceToCanvas, enhanceContrastForBarcode, enqueueGateOfflineScan, escapePrintHtml, exportRowsToWorkbook, exportToExcel, fileToDataUrl, findBestFaceMatch, findLabeledValueFromGrid, findStudentByKeyword, formatDateTime, formatEnglishDigits, formatLocalGateTimestamp, generateQrDataUrl, generateSchoolStructureClassrooms, getApprovedRewardStoreItems, getArabicDayKey, getAttendanceStudentsSource, getAuthActionMeta, getClassroomKeyFromCompanyRow, getCurrentAcademicTermId, getCurrentSlotFromTimetable, getDefaultLandingPage, getDefaultTemplateForEvent, getDisplayMotionVariant, getFaceProfileLabel, getFaceProfileState, getFaceProfileTone, getGateOfflineQueueKey, getGateOfflineQueueSummary, getGateSyncLogKey, getGateSyncLogSummary, getGateSyncStatusMeta, getLeavePassAgeMinutes, getLeavePassDestinationLabel, getLeavePassElapsedLabel, getLeavePassEventLabel, getLeavePassIdFromLocation, getLeavePassQueueMeta, getLeavePassStatusLabel, getLeavePassStatusTone, getLeavePassTimeline, getLeavePasses, getLessonAttendanceSessionStatusLabel, getLessonAttendanceSessionStatusTone, getLessonAttendanceSessions, getLessonSessionIdFromLocation, getLessonSessionTeacherTargets, getPublicModeFromLocation, getRewardStore, getRewardStoreDisplayItems, getRewardStoreDonorLabel, getRewardStoreStatusLabel, getRoleLabel, getSchoolAccess, getSchoolAttendanceBinding, getScreenTemplateLabel, getScreenTheme, getSessionToken, getShortStudentName, getStudentCompanyName, getStudentGroupingLabel, getStudentsForLessonClassroom, getTeacherSpecialItems, getTeacherSubjects, getTemplateCategoriesForEvent, getTickerTheme, getTodayIso, getTransitionLabel, getUnifiedCompanyRows, getUnifiedSchoolStudents, getVisualSourceSize, hydrateActionCatalog, hydrateActionLog, hydrateGateSyncCenterEvents, hydrateMessagingCenter, hydrateScanLog, hydrateSchools, hydrateTeacherSpecialItems, hydrateUsers, initialScanLog, initialSchools, isRoleEnabledForSchool, loadImageSource, loadPersistedState, loadServerCache, loadUiState, navItems, normalizeArabicHeader, normalizeImportRow, normalizePhoneNumber, normalizeRewardStoreItem, normalizeSearchDigits, normalizeSearchToken, normalizeSmartLinks, parseTeacherSubjects, parseTimeToMinutes, pickImportValue, pieColors, prependRewardStoreNotification, principalDelegableRoles, principalManageablePermissionKeys, printHtmlContent, readGateOfflineQueue, readGateSyncLog, readSchoolStructureViewState, removeGateOfflineQueueItem, removeGateSyncLogItem, resultTone, roles, safeLocalStorageGetItem, safeLocalStorageSetItem, safeNumber, sanitizeBarcodeValue, saveSchoolStructureViewState, saveServerCache, saveUiState, schoolCodeSlug, schoolHasStructureClassrooms, setSessionToken, sortUnifiedCompanyRows, splitTickerItems, statusFromResult, summarizeSchoolLiveState, toArabicDate, writeGateOfflineQueue, writeGateSyncLog } from '../utils/sharedFunctions.jsx';
import { Input } from '../components/ui/FormElements';
import { SectionCard } from '../components/ui/SectionCard';


import { Badge } from '../components/ui/FormElements';
import { BarcodeCard } from '../components/ui/BarcodeCard';
function StudentRolePage({ selectedSchool, currentUser, onCreateRewardRedemptionRequest }) {
  const forcedStudentId = currentUser?.studentId || null;
  const roleStudents = useMemo(() => getUnifiedSchoolStudents(selectedSchool, { includeArchived: false, preferStructure: true }), [selectedSchool]);
  const [studentId, setStudentId] = useState(forcedStudentId || roleStudents[0]?.id || null);
  const [selectedCatalogItemId, setSelectedCatalogItemId] = useState('');
  const [requestNote, setRequestNote] = useState('');
  const [requestStatus, setRequestStatus] = useState('');

  useEffect(() => {
    setStudentId(forcedStudentId || getUnifiedSchoolStudents(selectedSchool, { includeArchived: false, preferStructure: true })[0]?.id || null);
  }, [forcedStudentId, selectedSchool]);

  const student = roleStudents.find((item) => String(item.id) === String(forcedStudentId || studentId)) || roleStudents[0];
  const company = getUnifiedCompanyRows(selectedSchool, { preferStructure: true }).find((item) => (student?.source === 'structure' ? String(item.rawId || item.id) === String(student.classroomId) : String(item.id) === String(student?.companyId)));
  if (!student) return null;

  const store = getRewardStore(selectedSchool);
  const catalog = getApprovedRewardStoreItems(selectedSchool);
  const affordableCatalog = catalog.filter((item) => Number(student.points || 0) >= Number(item.pointsCost || 0));
  const selectedCatalogItem = catalog.find((item) => String(item.id) === String(selectedCatalogItemId)) || affordableCatalog[0] || catalog[0] || null;
  const myRequests = (store.redemptionRequests || []).filter((item) => String(item.studentId || '') === String(student.id));
  const studentStoreNotifications = (store.notifications || []).filter((item) => !item.studentId || String(item.studentId) === String(student.id)).slice(0, 4);

  useEffect(() => {
    if (!selectedCatalogItemId && selectedCatalogItem?.id) setSelectedCatalogItemId(selectedCatalogItem.id);
  }, [selectedCatalogItemId, selectedCatalogItem?.id]);

  const submitStudentRequest = (itemId, note = '') => {
    const result = onCreateRewardRedemptionRequest?.({ studentId: student.id, itemId, note: note || 'طلب من حساب الطالب' });
    setRequestStatus(result?.message || (result?.ok ? 'تم إرسال الطلب.' : 'تعذر إرسال الطلب.'));
    if (result?.ok) setRequestNote('');
    if (result?.message) window.alert(result.message);
  };

  return (
    <div className="space-y-6">
      <SectionCard
        title="واجهة الطالب"
        icon={UserCircle2}
        action={
          forcedStudentId ? <Badge tone="blue">حساب مرتبط بالطالب</Badge> : (
            <select value={student.id} onChange={(e) => setStudentId(e.target.value)} className="rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm font-bold outline-none">
              {roleStudents.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}
            </select>
          )
        }
      >
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <BarcodeCard student={student} companyName={company?.name || "—"} schoolName={selectedSchool?.name || "—"} />
          <div className="rounded-3xl bg-white p-5 ring-1 ring-slate-200">
            <div className="font-bold text-slate-800">أدائي</div>
            <div className="mt-4 grid grid-cols-2 gap-3">
              <div className="rounded-2xl bg-slate-50 p-4 ring-1 ring-slate-200"><div className="text-2xl font-black">{student.points}</div><div className="text-sm text-slate-500">نقاطي</div></div>
              <div className="rounded-2xl bg-slate-50 p-4 ring-1 ring-slate-200"><div className="text-2xl font-black">{student.attendanceRate}%</div><div className="text-sm text-slate-500">حضوري</div></div>
            </div>
            <div className="mt-4 rounded-2xl bg-slate-50 p-4 ring-1 ring-slate-200">
              <div className="text-sm text-slate-500">آخر حالة حضور</div>
              <div className="mt-2 text-lg font-black text-slate-800">{student.status}</div>
            </div>
          </div>
          <div className="rounded-3xl bg-white p-5 ring-1 ring-slate-200">
            <div className="font-bold text-slate-800">شركتي</div>
            <div className="mt-3 text-2xl font-black">{company?.name}</div>
            <div className="mt-2 text-sm text-slate-500">الفصل {company?.className}</div>
            <div className="mt-4 rounded-2xl bg-emerald-50 p-4 text-emerald-800 ring-1 ring-emerald-100">استمر في الحضور المبكر ورفع نقاط شركتك.</div>
          </div>
        </div>
      </SectionCard>

      <SectionCard title="متجر النقاط" icon={Gift}>
        <div className="grid gap-4 lg:grid-cols-[1.15fr,0.85fr]">
          <div className="space-y-4">
            <div className="grid gap-3 md:grid-cols-4">
              <div className="rounded-3xl bg-white p-4 ring-1 ring-slate-200"><div className="text-xs font-bold text-slate-500">رصيد الطالب</div><div className="mt-2 text-3xl font-black text-slate-900">{student.points}</div></div>
              <div className="rounded-3xl bg-white p-4 ring-1 ring-slate-200"><div className="text-xs font-bold text-slate-500">جوائز المتجر</div><div className="mt-2 text-3xl font-black text-sky-700">{catalog.length}</div></div>
              <div className="rounded-3xl bg-white p-4 ring-1 ring-slate-200"><div className="text-xs font-bold text-slate-500">جوائز ضمن الرصيد</div><div className="mt-2 text-3xl font-black text-emerald-700">{affordableCatalog.length}</div></div>
              <div className="rounded-3xl bg-white p-4 ring-1 ring-slate-200"><div className="text-xs font-bold text-slate-500">طلباتي</div><div className="mt-2 text-3xl font-black text-violet-700">{myRequests.length}</div></div>
            </div>

            {catalog.length ? (
              <>
                <div className="rounded-3xl bg-slate-50 p-4 ring-1 ring-slate-200">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <div className="text-sm font-black text-slate-800">اختيار الجائزة</div>
                      <div className="mt-1 text-xs text-slate-500">يمكنك طلب الجائزة بنفسك من هنا، أو من خلال ولي الأمر، أو من خلال إدارة المدرسة.</div>
                    </div>
                    <Badge tone={affordableCatalog.length ? 'green' : 'amber'}>{affordableCatalog.length ? `${affordableCatalog.length} جائزة ضمن الرصيد` : 'الرصيد الحالي لا يغطي أي جائزة'}</Badge>
                  </div>
                  <div className="mt-3 grid gap-3 md:grid-cols-[1fr,1fr]">
                    <select value={selectedCatalogItemId} onChange={(e) => setSelectedCatalogItemId(e.target.value)} className="rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm font-bold outline-none">
                      {catalog.map((item) => <option key={item.id} value={item.id}>{item.title} — {item.pointsCost} نقطة — المتبقي {item.remainingQuantity}</option>)}
                    </select>
                    <Input label="ملاحظة الطلب" value={requestNote} onChange={(e) => setRequestNote(e.target.value)} placeholder="اختياري: مثال تم اختياري لها من قبل المعلم" />
                  </div>
                  {selectedCatalogItem ? (
                    <div className="mt-4 overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
                      <div className="grid gap-0 lg:grid-cols-[1fr,1.1fr]">
                        <div className="aspect-[16/10] bg-slate-100">{selectedCatalogItem.image ? <img src={selectedCatalogItem.image} alt={selectedCatalogItem.title} className="h-full w-full object-cover" /> : <div className="flex h-full items-center justify-center text-slate-400">بدون صورة</div>}</div>
                        <div className="space-y-3 p-5">
                          <div className="flex flex-wrap items-start justify-between gap-3">
                            <div>
                              <div className="text-2xl font-black text-slate-900">{selectedCatalogItem.title}</div>
                              <div className="mt-1 text-sm text-slate-500">{getRewardStoreDonorLabel(selectedCatalogItem)} • المتبقي {selectedCatalogItem.remainingQuantity}/{selectedCatalogItem.quantity}</div>
                            </div>
                            <Badge tone={Number(student.points || 0) >= Number(selectedCatalogItem.pointsCost || 0) ? 'green' : 'rose'}>{selectedCatalogItem.pointsCost} نقطة</Badge>
                          </div>
                          <div className="rounded-2xl bg-slate-50 p-4 text-sm leading-7 text-slate-600 ring-1 ring-slate-200">{selectedCatalogItem.note || 'جائزة تحفيزية معتمدة في متجر المدرسة.'}</div>
                          <div className="grid gap-3 md:grid-cols-3">
                            <div className="rounded-2xl bg-slate-50 p-3 ring-1 ring-slate-200"><div className="text-xs font-bold text-slate-500">رصيدك الآن</div><div className="mt-1 text-xl font-black text-slate-900">{student.points}</div></div>
                            <div className="rounded-2xl bg-slate-50 p-3 ring-1 ring-slate-200"><div className="text-xs font-bold text-slate-500">قيمة الجائزة</div><div className="mt-1 text-xl font-black text-sky-700">{selectedCatalogItem.pointsCost}</div></div>
                            <div className="rounded-2xl bg-slate-50 p-3 ring-1 ring-slate-200"><div className="text-xs font-bold text-slate-500">بعد الاستبدال</div><div className="mt-1 text-xl font-black text-emerald-700">{Math.max(0, Number(student.points || 0) - Number(selectedCatalogItem.pointsCost || 0))}</div></div>
                          </div>
                          <div className="flex flex-wrap gap-2">
                            <button type="button" disabled={Number(student.points || 0) < Number(selectedCatalogItem.pointsCost || 0)} onClick={() => submitStudentRequest(selectedCatalogItem.id, requestNote)} className="rounded-2xl bg-sky-700 px-5 py-3 text-sm font-bold text-white disabled:cursor-not-allowed disabled:bg-slate-300">طلب هذه الجائزة</button>
                            <button type="button" onClick={() => { const first = affordableCatalog[0]; if (!first) { window.alert('لا توجد جائزة متاحة ضمن رصيد الطالب الحالي.'); return; } setSelectedCatalogItemId(first.id); submitStudentRequest(first.id, requestNote || 'طلب سريع من حساب الطالب'); }} className="rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-bold text-slate-700">طلب أسرع جائزة ضمن الرصيد</button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : null}
                  {requestStatus ? <div className="mt-3 rounded-2xl bg-sky-50 px-4 py-3 text-sm font-bold text-sky-800 ring-1 ring-sky-100">{requestStatus}</div> : null}
                </div>

                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                  {catalog.map((item) => {
                    const affordable = Number(student.points || 0) >= Number(item.pointsCost || 0);
                    return (
                      <button key={item.id} type="button" onClick={() => setSelectedCatalogItemId(item.id)} className={cx('overflow-hidden rounded-3xl border bg-white text-right shadow-sm transition', String(selectedCatalogItemId) === String(item.id) ? 'border-sky-300 ring-2 ring-sky-100' : 'border-slate-200 hover:border-sky-200')}>
                        <div className="aspect-[16/10] bg-slate-100">{item.image ? <img src={item.image} alt={item.title} className="h-full w-full object-cover" /> : <div className="flex h-full items-center justify-center text-slate-400">بدون صورة</div>}</div>
                        <div className="space-y-2 p-4">
                          <div className="flex items-start justify-between gap-2"><div><div className="font-black text-slate-900">{item.title}</div><div className="mt-1 text-xs text-slate-500">{getRewardStoreDonorLabel(item)}</div></div><Badge tone={affordable ? 'green' : 'rose'}>{item.pointsCost} نقطة</Badge></div>
                          <div className="text-xs text-slate-500">المتبقي {item.remainingQuantity}/{item.quantity}</div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </>
            ) : <div className="rounded-3xl border border-dashed border-slate-300 p-6 text-sm text-slate-500">لا توجد جوائز معتمدة حاليًا.</div>}
          </div>

          <div className="space-y-3 rounded-3xl bg-slate-50 p-5 ring-1 ring-slate-200">
            <div className="text-lg font-black text-slate-900">طلباتي الأخيرة</div>
            {myRequests.length ? myRequests.slice(0, 8).map((item) => (
              <div key={item.id} className="rounded-2xl bg-white p-3 ring-1 ring-slate-200">
                <div className="flex items-center justify-between gap-2"><div className="font-bold text-slate-800">{item.itemTitle}</div><Badge tone={item.status === 'delivered' ? 'violet' : item.status === 'approved' ? 'green' : item.status === 'rejected' ? 'rose' : 'amber'}>{item.status === 'delivered' ? 'تم التسليم' : item.status === 'approved' ? 'بانتظار التسليم' : item.status === 'rejected' ? 'مرفوض' : 'بانتظار الاعتماد'}</Badge></div>
                <div className="mt-1 text-xs text-slate-500">{item.pointsCost} نقطة • {formatDateTime(item.createdAt)}</div>
                {(item.decisionNote || item.deliveryNote || item.note) ? <div className="mt-2 text-xs leading-6 text-slate-500">{item.deliveryNote || item.decisionNote || item.note}</div> : null}
              </div>
            )) : <div className="rounded-2xl border border-dashed border-slate-300 p-4 text-sm text-slate-500">لا توجد طلبات استبدال بعد.</div>}
            <div className="rounded-2xl bg-white p-4 text-xs leading-7 text-slate-500 ring-1 ring-slate-200">يمكنك رؤية المتجر من حساب الطالب، أو من بوابة ولي الأمر، أو عبر المدرسة إذا ساعدك المدير أو الوكيل أو المرشد في تقديم الطلب.</div>
            <div className="rounded-3xl bg-white p-4 ring-1 ring-slate-200">
              <div className="text-sm font-black text-slate-900">آخر تنبيهات المتجر</div>
              <div className="mt-3 space-y-2">
                {studentStoreNotifications.length ? studentStoreNotifications.map((note) => (
                  <div key={note.id} className="rounded-2xl bg-slate-50 px-4 py-3 text-xs ring-1 ring-slate-200">
                    <div className="flex items-center justify-between gap-2"><div className="font-bold text-slate-800">{note.title}</div><span className="text-slate-400">{formatDateTime(note.createdAt)}</span></div>
                    <div className="mt-1 leading-6 text-slate-500">{note.body || 'تم تحديث حالة متعلقة بمتجر النقاط.'}</div>
                  </div>
                )) : <div className="rounded-2xl border border-dashed border-slate-300 p-4 text-xs text-slate-500">لا توجد تنبيهات حديثة للمتجر.</div>}
              </div>
            </div>
          </div>
        </div>
      </SectionCard>
    </div>
  );
}

export default StudentRolePage;

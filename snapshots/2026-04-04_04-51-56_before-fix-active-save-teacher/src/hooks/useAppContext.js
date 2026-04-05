/**
 * ==========================================
 *  App Context — سياق التطبيق المشترك
 * ==========================================
 *  يوفر الحالة المشتركة لجميع المكونات
 *  بديل عن prop drilling العميق
 * 
 *  الاستخدام:
 *    import { useApp } from '../hooks/useAppContext';
 *    const { currentUser, selectedSchool, settings } = useApp();
 */
import React, { createContext, useContext } from 'react';

/**
 * @typedef {Object} AppContextValue
 * @property {Object|null} currentUser - المستخدم الحالي
 * @property {Object|null} selectedSchool - المدرسة المحددة
 * @property {Object} settings - إعدادات المنصة
 * @property {Array} schools - قائمة المدارس
 * @property {Array} users - قائمة المستخدمين
 * @property {Array} scanLog - سجل الحضور
 * @property {Array} actionLog - سجل الإجراءات
 * @property {Array} notifications - التنبيهات
 * @property {Function} setActivePage - تغيير الصفحة النشطة
 * @property {Function} saveState - حفظ الحالة
 * @property {string} syncStatus - حالة المزامنة
 * @property {boolean} isOnline - حالة الاتصال
 */

const AppContext = createContext(null);

/**
 * مزود السياق — يُلف حول التطبيق في App.jsx
 */
export function AppProvider({ value, children }) {
  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
}

/**
 * Hook للوصول إلى السياق
 * @returns {AppContextValue}
 */
export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within AppProvider');
  }
  return context;
}

/**
 * Hook للوصول إلى المستخدم الحالي فقط
 */
export function useCurrentUser() {
  const { currentUser } = useApp();
  return currentUser;
}

/**
 * Hook للوصول إلى المدرسة المحددة فقط
 */
export function useSelectedSchool() {
  const { selectedSchool } = useApp();
  return selectedSchool;
}

/**
 * Hook للوصول إلى الإعدادات فقط
 */
export function useSettings() {
  const { settings } = useApp();
  return settings;
}

/**
 * Hook للتنقل بين الصفحات
 */
export function useNavigation() {
  const { setActivePage, activePage } = useApp();
  return { navigate: setActivePage, currentPage: activePage };
}

export default AppContext;

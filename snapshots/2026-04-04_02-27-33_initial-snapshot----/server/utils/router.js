/**
 * ==========================================
 *  Lightweight Router - موجه طلبات خفيف
 * ==========================================
 *  بديل خفيف عن Express لتنظيم المسارات
 *  يدعم الطرق الثابتة والديناميكية (مع معاملات)
 */

export class Router {
  constructor() {
    this.routes = [];
    this.middlewares = [];
  }

  /**
   * إضافة middleware عام
   */
  use(fn) {
    this.middlewares.push(fn);
    return this;
  }

  /**
   * تسجيل مسار جديد
   * @param {string} method - GET, POST, PATCH, DELETE, etc.
   * @param {string|RegExp} pattern - المسار (يدعم :param)
   * @param {Function} handler - async (req, res, params) => void
   */
  route(method, pattern, handler) {
    const { regex, paramNames } = this._compilePattern(pattern);
    this.routes.push({ method: method.toUpperCase(), regex, paramNames, handler, pattern });
    return this;
  }

  get(pattern, handler) { return this.route('GET', pattern, handler); }
  post(pattern, handler) { return this.route('POST', pattern, handler); }
  patch(pattern, handler) { return this.route('PATCH', pattern, handler); }
  delete(pattern, handler) { return this.route('DELETE', pattern, handler); }

  /**
   * البحث عن مسار مطابق وتنفيذه
   * @returns {boolean} true إذا تم العثور على مسار
   */
  async handle(req, res, reqUrl) {
    const pathname = reqUrl.pathname;
    const method = req.method;

    for (const route of this.routes) {
      if (route.method !== method) continue;
      const match = pathname.match(route.regex);
      if (!match) continue;

      // استخراج المعاملات من المسار
      const params = {};
      route.paramNames.forEach((name, i) => {
        params[name] = match[i + 1];
      });

      // تنفيذ middlewares أولاً
      for (const mw of this.middlewares) {
        const result = await mw(req, res, reqUrl);
        if (result === false) return true; // middleware أوقف التنفيذ
      }

      // تنفيذ handler المسار
      await route.handler(req, res, { params, query: reqUrl.searchParams, url: reqUrl });
      return true;
    }

    return false;
  }

  /**
   * تحويل نمط المسار إلى regex
   */
  _compilePattern(pattern) {
    if (pattern instanceof RegExp) {
      return { regex: pattern, paramNames: [] };
    }

    const paramNames = [];
    const regexStr = pattern
      .replace(/\/:(\w+)/g, (_, name) => {
        paramNames.push(name);
        return '/([^/]+)';
      })
      .replace(/\//g, '\\/');

    return {
      regex: new RegExp(`^${regexStr}$`),
      paramNames,
    };
  }
}

/**
 * إنشاء مجموعة مسارات مع بادئة
 */
export function createRouteGroup(prefix = '') {
  const router = new Router();
  const originalRoute = router.route.bind(router);
  
  router.route = function(method, pattern, handler) {
    const fullPattern = pattern instanceof RegExp 
      ? pattern 
      : `${prefix}${pattern}`;
    return originalRoute(method, fullPattern, handler);
  };

  // إعادة ربط الطرق المختصرة
  router.get = (pattern, handler) => router.route('GET', pattern, handler);
  router.post = (pattern, handler) => router.route('POST', pattern, handler);
  router.patch = (pattern, handler) => router.route('PATCH', pattern, handler);
  router.delete = (pattern, handler) => router.route('DELETE', pattern, handler);

  return router;
}

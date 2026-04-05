// Service Worker - بوابة المعلم PWA
const CACHE_NAME = 'teacher-portal-v1';
const OFFLINE_URL = '/teacher';

// الأصول التي تُخزَّن عند التثبيت
const PRECACHE_ASSETS = [
  '/teacher',
  '/public/pwa-icon-192.png',
  '/public/pwa-icon-512.png',
  'https://fonts.googleapis.com/css2?family=Tajawal:wght@400;500;700;800;900&display=swap',
];

// ===== Install Event =====
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(PRECACHE_ASSETS).catch(() => {
        // تجاهل أخطاء التخزين المسبق (مثل الـ fonts)
      });
    }).then(() => self.skipWaiting())
  );
});

// ===== Activate Event =====
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))
      )
    ).then(() => self.clients.claim())
  );
});

// ===== Fetch Event =====
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // API calls: Network First (لا نخزّن بيانات المستخدم)
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(
      fetch(request).catch(() => {
        return new Response(
          JSON.stringify({ ok: false, message: 'لا يوجد اتصال بالإنترنت حالياً' }),
          { status: 503, headers: { 'Content-Type': 'application/json' } }
        );
      })
    );
    return;
  }

  // الأصول الثابتة: Cache First
  if (
    url.pathname.startsWith('/public/') ||
    url.hostname === 'fonts.googleapis.com' ||
    url.hostname === 'fonts.gstatic.com'
  ) {
    event.respondWith(
      caches.match(request).then((cached) => cached || fetch(request).then((response) => {
        const clone = response.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
        return response;
      }))
    );
    return;
  }

  // صفحة /teacher: Network First مع Fallback للـ cache
  if (url.pathname === '/teacher' || url.pathname === '/teacher/') {
    event.respondWith(
      fetch(request)
        .then((response) => {
          const clone = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
          return response;
        })
        .catch(() => caches.match(OFFLINE_URL))
    );
    return;
  }

  // باقي الطلبات: Network First
  event.respondWith(fetch(request).catch(() => caches.match(request)));
});

// ===== Push Notifications =====
self.addEventListener('push', (event) => {
  let data = { title: 'بوابة المعلم', body: 'لديك إشعار جديد' };
  try {
    data = event.data.json();
  } catch {}

  event.waitUntil(
    self.registration.showNotification(data.title || 'بوابة المعلم', {
      body: data.body || '',
      icon: '/public/pwa-icon-192.png',
      badge: '/public/pwa-icon-72.png',
      dir: 'rtl',
      lang: 'ar',
      tag: data.tag || 'teacher-portal',
      data: data.url ? { url: data.url } : {},
      vibrate: [200, 100, 200],
    })
  );
});

// ===== Notification Click =====
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const targetUrl = (event.notification.data && event.notification.data.url) || '/teacher';
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if (client.url.includes('/teacher') && 'focus' in client) {
          return client.focus();
        }
      }
      if (clients.openWindow) return clients.openWindow(targetUrl);
    })
  );
});

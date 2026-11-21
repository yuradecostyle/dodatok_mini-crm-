/* Mini CRM service worker: push-нагадування + кеш статики */
const CACHE = 'minicrm-static-v2';

self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', (e) => {
  e.waitUntil(caches.keys().then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))).then(() => self.clients.claim()));
});

// Статика (/app/*, /icons/*) — кеш з оновленням у фоні. API та сторінки — лише мережа.
self.addEventListener('fetch', (e) => {
  const url = new URL(e.request.url);
  if (e.request.method !== 'GET' || url.origin !== location.origin) return;
  if (!/^\/(app|icons)\//.test(url.pathname)) return;
  e.respondWith(caches.open(CACHE).then(async (c) => {
    const hit = await c.match(e.request);
    const net = fetch(e.request).then((r) => { if (r.ok) c.put(e.request, r.clone()); return r; }).catch(() => hit);
    return hit || net;
  }));
});

self.addEventListener('push', (e) => {
  let d = {};
  try { d = e.data ? e.data.json() : {}; } catch (err) { d = { title: 'Mini CRM', body: e.data && e.data.text() }; }
  const opts = {
    body: d.body || '',
    tag: d.tag || 'minicrm',
    renotify: true,
    requireInteraction: true,
    icon: '/icons/icon-192.png',
    badge: '/icons/icon-192.png',
    vibrate: [250, 120, 250, 120, 400],
    timestamp: Date.now(),
    data: { url: d.url || '/', actions: d.actions || [] },
    actions: (d.actions || []).map((a) => ({ action: a.action, title: a.title })),
  };
  e.waitUntil(Promise.all([
    self.registration.showNotification(d.title || 'Mini CRM', opts),
    // відкритий застосунок програє вибраний звук і покаже банер
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((cs) => cs.forEach((c) => c.postMessage({ type: 'reminder', payload: d }))),
  ]));
});

self.addEventListener('notificationclick', (e) => {
  const n = e.notification;
  const data = n.data || {};
  n.close();
  const act = (data.actions || []).find((a) => a.action === e.action);
  if (act) {
    e.waitUntil(fetch(act.url, { credentials: 'omit' }).then(() =>
      self.clients.matchAll({ type: 'window' }).then((cs) => cs.forEach((c) => c.postMessage({ type: 'refresh' })))
    ).catch(() => {}));
    return;
  }
  e.waitUntil(self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((cs) => {
    for (const c of cs) {
      if ('focus' in c) { c.postMessage({ type: 'open', url: data.url }); return c.focus(); }
    }
    return self.clients.openWindow(data.url || '/');
  }));
});

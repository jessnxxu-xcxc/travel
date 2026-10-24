/* 旅行手帳 service worker: the page shell and libraries are cached so the notebook opens offline.
   Trip data itself comes from the page's own local cache; Supabase API calls are never cached here. */
const V = 'tn-v2';
const SHELL = ['./', './index.html', './manifest.webmanifest', './icon-192.png', './icon-512.png', './apple-touch-icon.png'];
self.addEventListener('install', e => { e.waitUntil(caches.open(V).then(c => c.addAll(SHELL)).then(() => self.skipWaiting())); });
self.addEventListener('activate', e => { e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== V).map(k => caches.delete(k)))).then(() => self.clients.claim())); });
const timeout = (p, ms) => Promise.race([p, new Promise((_, r) => setTimeout(() => r(new Error('timeout')), ms))]);
self.addEventListener('fetch', e => {
  const req = e.request, u = new URL(req.url);
  if (req.method !== 'GET') return;
  if (u.origin === location.origin) {
    if (req.mode === 'navigate') {
      // network first (so updates show up), fall back to the cached page when offline or very slow
      e.respondWith(timeout(fetch(req, { cache: 'no-cache' }), 4000).then(r => { const c = r.clone(); caches.open(V).then(x => x.put('./index.html', c)); return r; })
        .catch(() => caches.match('./index.html', { ignoreSearch: true })));
      return;
    }
    e.respondWith(caches.match(req).then(h => h || fetch(req).then(r => { if (r.ok) { const c = r.clone(); caches.open(V).then(x => x.put(req, c)); } return r; })));
    return;
  }
  if (/^(cdn\.jsdelivr\.net|fonts\.googleapis\.com|fonts\.gstatic\.com)$/.test(u.hostname)) {
    e.respondWith(caches.open(V).then(c => c.match(req).then(h => { const net = fetch(req).then(r => { if (r.ok || r.type === 'opaque') c.put(req, r.clone()); return r; }).catch(() => h); return h || net; })));
  }
});

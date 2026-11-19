/* 旅行手帳 service worker: the page shell and libraries are cached so the notebook opens offline.
   Trip data itself comes from the page's own local cache; Supabase API calls are never cached here.
   V and SHELL below are rewritten by build.py — do not edit them by hand. */
const V = 'tn-1ca9fff2';
const SHELL = ['./', './index.html', './manifest.webmanifest', './icon-192.png', './icon-512.png', './apple-touch-icon.png'
  , './app.css?v=b498f380', './themes.js?v=6b2c63e3', './trip.js?v=e7429b1e', './app.js?v=ccf82197'];
const PH = 'tn-ph', PH_MAX = 200;   // 看過的照片最多留 200 張，超過就丟最早看的那張

self.addEventListener('install', e => { e.waitUntil(caches.open(V).then(c => c.addAll(SHELL)).then(() => self.skipWaiting())); });
self.addEventListener('activate', e => { e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== V && k !== PH).map(k => caches.delete(k)))).then(() => self.clients.claim())); });
const timeout = (p, ms) => Promise.race([p, new Promise((_, r) => setTimeout(() => r(new Error('timeout')), ms))]);

// 照片快取有上限，滿了就從最舊的開始刪（Cache API 的 keys() 依放進去的順序）
async function phPut(c, key, res) {
  await c.put(key, res);
  const ks = await c.keys();
  if (ks.length > PH_MAX) for (const k of ks.slice(0, ks.length - PH_MAX)) await c.delete(k);
}

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
    // app.css / trip.js … 帶 ?v= 版本，內容一變網址就變，所以快取有就直接用，開啟不用等網路
    e.respondWith(caches.match(req).then(h => h || fetch(req).then(r => { if (r.ok) { const c = r.clone(); caches.open(V).then(x => x.put(req, c)); } return r; })));
    return;
  }
  // 照片（票券截圖等）：看過一次就存在手機裡，沒網路也打得開；簽名參數每次不同，所以只用路徑當鑰匙
  if (/\.supabase\.co$/.test(u.hostname) && u.pathname.includes('/storage/v1/object/sign/')) {
    const key = u.origin + u.pathname;
    e.respondWith(caches.open(PH).then(c => c.match(key).then(h => h || fetch(req).then(r => { if (r.ok || r.type === 'opaque') phPut(c, key, r.clone()); return r; }))));
    return;
  }
  if (/^(cdn\.jsdelivr\.net|fonts\.googleapis\.com|fonts\.gstatic\.com)$/.test(u.hostname)) {
    e.respondWith(caches.open(V).then(c => c.match(req).then(h => { const net = fetch(req).then(r => { if (r.ok || r.type === 'opaque') c.put(req, r.clone()); return r; }).catch(() => h); return h || net; })));
  }
});

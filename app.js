window.__BUILD='1.174';
/* Platform layer for the self-hosted travel notebook.
   - Google sign-in; only the admin and people invited to a trip get anything (enforced by Postgres RLS).
   - Without ?t= it shows the bookshelf of trips; with ?t=<id> it boots the trip page (window.__bootTrip)
     and provides window.claude.use(name) backed by Supabase so the trip page code runs unchanged. */
(function () {
  const SB_URL = 'https://lldplsrmkqynvqzviixh.supabase.co';
  const SB_KEY = 'sb_publishable_3FNQ4ecG07d1kagoRao-fA_ttaNsAwX';
  const sb = window.__sbClient || window.supabase.createClient(SB_URL, SB_KEY, { auth: { persistSession: true, detectSessionInUrl: true, flowType: 'pkce' } });
  window.__sb = sb;
  const $ = s => document.querySelector(s);
  const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const err = (code, message) => ({ code, message: message || code });
  const clone = v => JSON.parse(JSON.stringify(v));
  const rid = () => (crypto.randomUUID ? crypto.randomUUID().replace(/-/g, '').slice(0, 20) : Math.random().toString(36).slice(2, 12) + Date.now().toString(36));
  const TH = window.__THEMES || {};
  const art = k => (TH[k] || TH.travel || { svg: '' }).svg;
  const WK = '日一二三四五六';
  const tripId = new URLSearchParams(location.search).get('t');
  // the home-screen icon opens the trip list (no ?t=); with no network that list can't load, so jump to the last trip saved on this phone
  const lastTrip = (() => { try { return localStorage.getItem('tn-last-trip') || ''; } catch (e) { return ''; } })();
  const goLast = () => { if (!tripId && lastTrip && localStorage.getItem('trip-meta-' + lastTrip)) { location.replace('./?t=' + encodeURIComponent(lastTrip)); return true; } return false; };
  if (tripId) { try { localStorage.setItem('tn-last-trip', tripId); } catch (e) {} }
  // opened fresh from the home-screen icon (iOS remembers the trip URL it was added from): start at the trip list.
  // sessionStorage is empty only on a fresh launch, so moving around inside the app never bounces back here
  { let fresh = false; try { fresh = !sessionStorage.getItem('tn-open'); sessionStorage.setItem('tn-open', '1'); } catch (e) {}
    const pwa = navigator.standalone || matchMedia('(display-mode: standalone)').matches;
    if (fresh && pwa && tripId && navigator.onLine) { location.replace('./'); return; } }
  if (!tripId && !navigator.onLine && goLast()) return;
  // opened from the home screen: iOS fades whatever sits right under the status bar, so pages get extra top room
  if (navigator.standalone || matchMedia('(display-mode: standalone)').matches) document.documentElement.classList.add('pwa');
  let session = null, access = { admin: false, shared: 0 }, TRIP = null, role = 'view';

  /* ---------- small UI helpers (own sheet, styled by the page CSS) ---------- */
  function gate(html) {
    let g = $('#gate'); if (!g) { g = document.createElement('div'); g.id = 'gate'; document.body.appendChild(g); }
    g.innerHTML = html; g.hidden = false; document.body.classList.add('gated');
    const b = g.querySelector('[data-login]'); if (b) { b.onclick = oauthLogin; gisButton(b); }
    const o = g.querySelector('[data-logout]'); if (o) o.onclick = logout;
  }
  const GOOGLE_CLIENT = '517827834727-tjfrsspo0v3p6vcnquhhaksghlb602j3.apps.googleusercontent.com';
  // fallback: redirect sign-in through Supabase (Google's chooser then names the supabase.co domain)
  function oauthLogin() { sb.auth.signInWithOAuth({ provider: 'google', options: { redirectTo: location.origin + location.pathname + location.search, queryParams: { prompt: 'select_account' } } }); }
  // preferred: Google's own button, so the chooser says 「旅行手帳」; the ID token is handed to Supabase
  function gisButton(fallback) {
    if (window.__sbClient) return;
    const sc = document.createElement('script'); sc.src = 'https://accounts.google.com/gsi/client'; sc.async = true;
    sc.onload = async () => {
      if (!window.google || !google.accounts || !fallback.isConnected) return;
      const raw = rid() + rid(), hash = [...new Uint8Array(await crypto.subtle.digest('SHA-256', new TextEncoder().encode(raw)))].map(x => x.toString(16).padStart(2, '0')).join('');
      google.accounts.id.initialize({ client_id: GOOGLE_CLIENT, nonce: hash, ux_mode: 'popup', use_fedcm_for_button: true, callback: async r => {
        const { error } = await sb.auth.signInWithIdToken({ provider: 'google', token: r.credential, nonce: raw });
        if (error) { gate('<div class="gate-card">' + art('travel') + '<h1>還沒有被邀請</h1><p>這個 Google 帳號沒有被分享任何旅行，請請手帳主人邀請你。</p><button type="button" class="btn pri block" data-login>換帳號登入</button></div>'); return; }
        location.reload();
      } });
      // one button only: Google's button sits invisibly on top of ours, so the look stays ours but the
      // click goes through Google (chooser shows 「旅行手帳」). If Google's script never loads, our button
      // underneath falls back to the redirect sign-in.
      const wrap = document.createElement('div'); wrap.className = 'login-wrap'; fallback.parentNode.insertBefore(wrap, fallback); wrap.appendChild(fallback);
      const box = document.createElement('div'); box.className = 'gis-over'; wrap.appendChild(box);
      google.accounts.id.renderButton(box, { type: 'standard', theme: 'outline', size: 'large', shape: 'pill', text: 'signin_with', locale: 'zh-TW', width: Math.min(400, Math.max(200, wrap.clientWidth)) });
    };
    document.head.appendChild(sc);
  }
  async function logout() { try { window.google && google.accounts && google.accounts.id.disableAutoSelect(); } catch (e) {} await sb.auth.signOut(); try { Object.keys(localStorage).filter(k => /-cache-v1$/.test(k)).forEach(k => localStorage.removeItem(k)); } catch (e) {} location.href = location.pathname; }
  window.__logout = logout;
  function sheet(html, mount) {
    let L = $('#player'); if (!L) { L = document.createElement('div'); L.id = 'player'; document.body.appendChild(L); }
    L.innerHTML = '<div class="scrim" id="pscrim"><div class="sheet" role="dialog" aria-modal="true"><button type="button" class="sheet-x" aria-label="關閉">×</button>' + html + '</div></div>';
    const sc = $('#pscrim'), sh = sc.firstChild; const close = () => { L.innerHTML = ''; };
    sc.addEventListener('click', e => { if (e.target === sc) close(); }); sh.querySelector('.sheet-x').onclick = close;
    const bs = [...sh.children].filter(c => c.classList.contains('btns')); if (bs.length) bs[bs.length - 1].classList.add('foot');
    mount && mount(sh, close); return close;
  }
  function ptoast(msg) { let t = $('#ptoast'); if (t) t.remove(); t = document.createElement('div'); t.id = 'ptoast'; t.className = 'toast'; t.textContent = msg; document.body.appendChild(t); setTimeout(() => t.remove(), 3200); }
  const fmtDate = s => { const d = new Date(s + 'T00:00:00'); return (d.getMonth() + 1) + '/' + d.getDate() + '（' + WK[d.getDay()] + '）'; };
  const addDays = (s, n) => { const d = new Date(s + 'T00:00:00'); d.setDate(d.getDate() + n); return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0'); };
  const today0 = () => { const t = window.__NRT_NOW ? new Date(window.__NRT_NOW) : new Date(); t.setHours(0, 0, 0, 0); return t; };
  function tripStatus(T) {
    const s = new Date(T.start + 'T00:00:00'), n = Math.round((today0() - s) / 864e5) + 1;
    if (n < 1) return { k: 'soon', t: '還有 ' + (1 - n) + ' 天出發' };
    if (n <= T.days) return { k: 'now', t: '旅行中・Day ' + n };
    return { k: 'past', t: '已結束' };
  }

  /* ---------- auth ---------- */
  /* 登入時「問你是誰」和「拿行程」同時發出，不用等對方回來（兩邊都受資料庫權限保護，順序不影響安全） */
  let PRE = null;
  async function prefetch() {
    try { const { data } = await sb.auth.getSession(); if (!data.session) return; } catch (e) { return; }
    // .then() 才會真的送出去，順便把錯誤收成一般結果，免得沒人接的時候變成未處理的例外
    const go = q => q.then(r => r, e => ({ data: null, error: e }));
    PRE = tripId
      ? { trip: go(sb.from('trips').select('id,data').eq('id', tripId).maybeSingle()) }
      : { trips: go(sb.from('trips').select('id,data,created_at')) };
  }
  async function signIn() {
    try { const { data } = await sb.auth.getSession(); session = data.session; } catch (e) { session = null; }
    const hashErr = new URLSearchParams(location.hash.slice(1)).get('error_description') || new URLSearchParams(location.search).get('error_description');
    if (!session) {
      if (!navigator.onLine && tripId) return 'offline';
      if (!navigator.onLine && goLast()) return 'offline';
      gate('<div class="gate-card">' + art('travel') + '<h1>旅行手帳</h1><p>' + (hashErr ? '這個 Google 帳號還沒有被邀請。請用受邀的帳號登入，或請手帳主人邀請你。' : '這是私人的旅行手帳，只有受邀的人能看。') + '</p><button type="button" class="btn pri block" data-login>用 Google 登入</button></div>');
      return 'out';
    }
    let res; for (let i = 0; i < 3; i++) { try { res = await sb.rpc('my_access'); } catch (e) { res = { error: e }; } if (!res.error || !navigator.onLine) break; await new Promise(r => setTimeout(r, 1500 * (i + 1))); }
    const { data, error } = res;
    if (error) {
      if (tripId && localStorage.getItem('trip-meta-' + tripId)) return 'offline';
      if (goLast()) return 'offline';
      gate('<div class="gate-card">' + art('travel') + '<h1>連不上網路</h1><p>' + (tripId ? '這台裝置還沒存過這趟旅行，' : '') + '請確認網路後再試一次。</p><button type="button" class="btn pri block" onclick="location.reload()">重新整理</button></div>');
      return 'error';
    }
    access = data || access;
    if (!access.admin && !(access.shared > 0)) {
      gate('<div class="gate-card">' + art('travel') + '<h1>還沒有被邀請</h1><p>' + esc(session.user.email) + ' 目前沒有被分享任何旅行，請請手帳主人邀請你。</p><button type="button" class="btn block" data-logout>換帳號登入</button></div>');
      await sb.auth.signOut(); return 'denied';
    }
    return 'ok';
  }
  // who is signed in, always visible at the very top (switching accounts = 登出 then sign in again)
  function whoami() {
    if (!session || $('#whoami')) return;
    const w = document.createElement('div'); w.id = 'whoami'; w.className = 'whoami gut wrapc';
    w.innerHTML = '<span class="who-l">目前登入</span><b></b>' + (access.admin ? '<span class="who-r">管理者</span>' : (role === 'edit' && tripId ? '<span class="who-r">可編輯</span>' : (tripId ? '<span class="who-r">只能看</span>' : ''))) + '<button type="button">登出</button>';
    w.querySelector('b').textContent = session.user.email || '';
    w.querySelector('button').onclick = logout;
    // the sync status lives in this row instead of taking a line of its own under the title
    const sy = $('#sync'); if (sy) w.insertBefore(sy, w.querySelector('button'));
    document.body.insertBefore(w, document.body.firstChild);
  }
  /* ---------- backup: one readable .html file (itinerary, money, lists) with the raw data inside ---------- */
  async function exportBackup() {
    let rows = null;
    try { const r = await sb.from('docs').select('col,id,data').eq('trip_id', TRIP.id); if (!r.error) rows = r.data; } catch (e) {}
    if (!rows) { try { const c = JSON.parse(localStorage.getItem(TRIP.id + '-cache-v1') || 'null'); if (c) rows = [].concat((c.items || []).map(x => ({ col: 'items', id: x.id, data: x })), (c.days || []).map(([id, d]) => ({ col: 'days', id, data: d })), (c.lists || []).map(x => ({ col: 'lists', id: x.id, data: x })), (c.exps || []).map(x => ({ col: 'expenses', id: x.id, data: x }))); } catch (e) {} }
    if (!rows) { ptoast('目前拿不到資料，請連上網路再試'); return; }
    const by = c => rows.filter(r => r.col === c).map(r => Object.assign({ id: r.id }, r.data));
    const items = by('items'), days = {}, lists = by('lists'), exps = by('expenses');
    rows.filter(r => r.col === 'days').forEach(r => { days[r.id] = r.data; });
    const SL = { morning: '上午', breakfast: '早餐', lunch: '午餐', afternoon: '下午', dinner: '晚餐', night: '晚上' }, SO = ['breakfast', 'morning', 'lunch', 'afternoon', 'dinner', 'night'];
    const yen = n => '¥' + Math.round(+n || 0).toLocaleString();
    let h = '<!doctype html><html lang="zh-Hant"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>' + esc(TRIP.title) + ' 備份</title><style>body{font:15px/1.7 system-ui,"Noto Sans TC",sans-serif;max-width:760px;margin:24px auto;padding:0 16px;color:#3E3A39;background:#FFFCF6}h1{margin:0 0 4px}h2{margin:28px 0 8px;padding-bottom:4px;border-bottom:2px solid #3E3A39}h3{margin:16px 0 4px}ul{margin:0;padding-left:20px}.m{color:#77706D;font-size:13px}table{border-collapse:collapse;width:100%}td,th{border-bottom:1px solid #ddd;padding:4px 6px;text-align:left;font-size:14px}</style></head><body>';
    h += '<h1>' + esc(TRIP.title) + '</h1><div class="m">' + fmtDate(TRIP.start) + ' – ' + fmtDate(addDays(TRIP.start, TRIP.days - 1)) + '・' + TRIP.days + ' 天・備份時間 ' + new Date().toLocaleString('zh-TW') + '</div>';
    h += '<h2>行程</h2>';
    for (let n = 0; n <= TRIP.days; n++) {
      const its = items.filter(i => i.day === n).sort((a, b) => (SO.indexOf(a.slot) - SO.indexOf(b.slot)) || (a.order - b.order)); if (!its.length) continue;
      h += '<h3>' + (n ? 'Day ' + n + '・' + fmtDate(addDays(TRIP.start, n - 1)) + ((days['d' + n] || {}).title ? '・' + esc(days['d' + n].title) : '') : '還沒排日期') + '</h3><ul>' +
        its.map(i => '<li>' + (SL[i.slot] ? '<span class="m">' + SL[i.slot] + (i.time ? ' ' + esc(i.time) : '') + '</span> ' : '') + '<b>' + esc(i.title) + '</b>' + (i.area ? ' <span class="m">' + esc(i.area) + '</span>' : '') + (i.desc ? '<br><span class="m">' + esc(i.desc) + '</span>' : '') + (i.note ? '<br><span class="m">備註：' + esc(i.note) + '</span>' : '') + '</li>').join('') + '</ul>';
    }
    if (exps.length) h += '<h2>記帳</h2><table><tr><th>日</th><th>店／項目</th><th>金額</th><th>誰付</th></tr>' + exps.sort((a, b) => (a.day || 0) - (b.day || 0)).map(e => '<tr><td>' + (e.day ? 'Day ' + e.day : '') + '</td><td>' + esc(e.shop || '') + (e.what ? '・' + esc(e.what) : '') + '</td><td>' + yen(e.amt) + '</td><td>' + esc(e.payer || '') + '</td></tr>').join('') + '<tr><th></th><th>合計</th><th>' + yen(exps.reduce((s, e) => s + (+e.amt || 0), 0)) + '</th><th></th></tr></table>';
    const LT = { todo: '待辦', book: '訂位', ticket: '票券', buy: '購物', pack: '行李' };
    Object.keys(LT).forEach(t => { const ls = lists.filter(l => l.type === t); if (ls.length) h += '<h2>' + LT[t] + '</h2><ul>' + ls.map(l => '<li>' + (l.done ? '✓ ' : '') + esc(l.title || l.text || '') + (l.day ? ' <span class="m">Day ' + l.day + '</span>' : '') + '</li>').join('') + '</ul>'; });
    h += '<script type="application/json" id="backup-data">' + JSON.stringify({ trip: TRIP, rows }).replace(/</g, '\\u003c') + '<\/script></body></html>';
    const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([h], { type: 'text/html' }));
    a.download = TRIP.title.replace(/[\\/:*?"<>|]/g, '') + '-備份-' + new Date().toISOString().slice(0, 10) + '.html';
    document.body.appendChild(a); a.click(); setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 1000);
    ptoast('已下載備份檔');
  }
  function footer() {
    whoami();
    const f = $('#site-foot'); if (!f || !session) return;
    // who is signed in already shows at the top; the footer only keeps the backup
    f.innerHTML = '<div class="ver"><img src="icon-192.png?v=2" alt="" width="40" height="40"><b>旅行手帳</b><span>版本 ' + (window.__BUILD || '1.0') + '</span></div>';
    if (TRIP) { const x = document.createElement('button'); x.type = 'button'; x.textContent = '匯出備份'; x.onclick = exportBackup; f.insertBefore(x, f.firstChild); }
  }

  /* ---------- bookshelf ---------- */
  async function shelf() {
    document.title = '旅行手帳';
    const app = $('#app'); if (app) app.hidden = true;
    let el = $('#shelf'); if (!el) { el = document.createElement('main'); el.id = 'shelf'; el.className = 'shelf gut wrapc'; document.body.insertBefore(el, app); }
    const [{ data: trips }, { data: shares }] = await Promise.all([(PRE && PRE.trips) || sb.from('trips').select('id,data,created_at'), access.admin ? sb.from('trip_shares').select('trip_id,email,role') : Promise.resolve({ data: [] })]);
    const cnt = {}; (shares || []).forEach(s => { cnt[s.trip_id] = (cnt[s.trip_id] || 0) + 1; });
    const list = (trips || []).map(r => Object.assign({ id: r.id }, r.data)).filter(t => t.start);
    const order = { now: 0, soon: 1, past: 2 };
    // the app was closed and opened again: during a trip go straight to it (it opens on today); before / after a trip stay on this home page
    if (sessionStorage.getItem('tn-fresh')) { sessionStorage.removeItem('tn-fresh'); const on = list.filter(t => tripStatus(t).k === 'now'); if (on.length === 1) { location.replace('?t=' + encodeURIComponent(on[0].id)); return; } }
    list.sort((a, b) => { const sa = tripStatus(a), sb2 = tripStatus(b); return (order[sa.k] - order[sb2.k]) || (sa.k === 'past' ? b.start.localeCompare(a.start) : a.start.localeCompare(b.start)); });
    el.innerHTML = '<header class="shelf-h"><div class="hero-art">' + art('travel') + '</div><h1>旅行手帳</h1><p>' + (list.length ? '共 ' + list.length + ' 趟旅行' : (access.admin ? '還沒有旅行，建立第一本吧' : '目前沒有分享給你的旅行')) + '</p></header>' +
      '<div class="shelf-grid">' + list.map(t => { const st = tripStatus(t); return '<a class="tcard ' + st.k + '" href="?t=' + encodeURIComponent(t.id) + '"><div class="tcover">' + art(t.theme) + '</div><div class="tbody"><b>' + esc(t.title) + '</b><span>' + fmtDate(t.start) + ' – ' + fmtDate(addDays(t.start, t.days - 1)) + '・' + t.days + ' 天</span><span class="tst">' + st.t + (access.admin ? '・分享 ' + (cnt[t.id] || 0) + ' 人' : '') + '</span></div></a>'; }).join('') +
      (access.admin ? '<button type="button" class="tcard tnew" id="new-trip"><span class="plus">＋</span><b>新旅行</b></button>' : '') + '</div>' +
      '<footer class="site-foot" id="site-foot"></footer>';
    footer();
    const nb = $('#new-trip'); if (nb) nb.onclick = () => tripForm(null);
  }

  /* ---------- trip settings (create / edit / delete) ---------- */
  /* 住宿: tap the hotel on the boarding pass to change it — 中文名, 英文名, 備註 (many lines; the pass shows the first) */
  function hotelForm(T) {
    const h = T.hotel || {}, f = (id, label, val, ph) => '<div class="fld"><label for="' + id + '">' + label + '</label><input class="inp" id="' + id + '" value="' + esc(val || '') + '" placeholder="' + esc(ph) + '" autocomplete="off"></div>';
    sheet('<h2>🏨 住宿</h2>' + f('hf-n', '飯店', h.name, '例 大井町 TRACKS 大都會大飯店') + f('hf-en', '英文名稱', h.en, '例 Oimachi TRACKS Metropolitan Hotel') +
      '<div class="fld"><label for="hf-x">備註</label><textarea class="inp" id="hf-x" rows="5" placeholder="地址、電話、訂房編號、入住／退房時間…">' + esc(h.note || '') + '</textarea></div>' +
      '<div class="btns"><a class="btn" href="' + esc(h.map || 'https://www.google.com/maps/search/?api=1&query=' + encodeURIComponent(h.en || h.q || h.name || '')) + '" target="_blank" rel="noopener"><svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M8 14.5s4.5-4.2 4.5-7.7a4.5 4.5 0 0 0-9 0c0 3.5 4.5 7.7 4.5 7.7z"/><circle cx="8" cy="6.8" r="1.6"/></svg> Google 地圖</a><button type="button" class="btn pri" id="hf-ok" style="flex:1">儲存</button></div>',
      (root, close) => {
        const v = id => root.querySelector('#' + id).value.trim();
        root.querySelector('#hf-ok').onclick = async () => {
          const name = v('hf-n');
          if (!name) { root.querySelector('#hf-n').focus(); ptoast('請填飯店名稱'); return; }
          const hotel = Object.assign({}, h, { name, en: v('hf-en'), note: root.querySelector('#hf-x').value.trim() });
          const data = Object.assign({}, T, { hotel }); delete data.id;
          const { error } = await sb.from('trips').update({ data, updated_at: new Date().toISOString() }).eq('id', T.id);
          if (error) { ptoast('儲存失敗：' + error.message); return; }
          close(); location.reload();
        };
      });
  }
  document.addEventListener('click', e => { const b = e.target.closest && e.target.closest('.hotel-e'); if (!b || !TRIP) return; e.preventDefault(); if (role !== 'edit' && !access.admin) { ptoast('只有可編輯的人能改住宿'); return; } hotelForm(TRIP); });
  function tripForm(T) {
    const isNew = !T; T = T || { title: '', dest: '', theme: 'travel', start: addDays(today0().toISOString().slice(0, 10), 30), days: 5, out: {}, back: {}, hotel: {} };
    const f = (id, label, val, ph, type) => '<div class="fld"><label for="' + id + '">' + label + '</label><input class="inp" id="' + id + '" type="' + (type || 'text') + '" value="' + esc(val == null ? '' : val) + '" placeholder="' + esc(ph || '') + '" autocomplete="off"></div>';
    const themes = Object.keys(TH).map(k => '<button type="button" data-v="' + k + '" aria-pressed="' + (T.theme === k) + '" class="thbtn"><span class="thart">' + TH[k].svg + '</span>' + TH[k].label + '</button>').join('');
    sheet('<h2>' + (isNew ? '新旅行' : '旅行設定') + '</h2>' +
      '<div class="row2">' + f('tf-title', '旅行名稱', T.title, '例：27 京都賞楓') + f('tf-dest', '目的地', T.dest, '例：京都') + '</div>' +
      '<div class="row2">' + f('tf-start', '出發日', T.start, '', 'date') + f('tf-days', '天數', T.days, '例 5', 'number') + '</div>' +
      '<div class="fld"><span class="lbl">封面插圖</span><div class="seg thseg" id="tf-theme">' + themes + '</div></div>' +
      '<div class="tf-fly"><span class="lbl">航班<span class="opt">可之後再填</span></span>' +
      '<div class="row2">' + f('tf-on', '去程航班', T.out.no, '例 JX804') + f('tf-ot', '起飛 → 抵達', [T.out.dep, T.out.arr].filter(Boolean).join('-'), '例 15:00-19:00') + '</div>' +
      '<div class="row2">' + f('tf-of', '出發機場', T.out.fromCode ? T.out.fromCode + ' ' + (T.out.from || '') : '', '例 TPE 桃園 T1') + f('tf-oa', '抵達機場', T.out.toCode ? T.out.toCode + ' ' + (T.out.to || '') : '', '例 NRT 成田 T2') + '</div>' +
      '<div class="row2">' + f('tf-bn', '回程航班', T.back.no, '例 JX805') + f('tf-bt', '起飛 → 抵達', [T.back.dep, T.back.arr].filter(Boolean).join('-'), '例 20:10-23:20') + '</div>' +
      '</div>' + (isNew ? f('tf-hn', '住宿', T.hotel.name, '例 大井町 TRACKS 大都會大飯店') : '') +
      (isNew ? '' : '<button type="button" class="linkbtn tf-del" id="tf-del">刪除這趟旅行</button>') +
      '<div class="btns"><button type="button" class="btn pri block" id="tf-ok">' + (isNew ? '建立旅行' : '儲存') + '</button></div>',
      (root, close) => {
        let theme = T.theme;
        root.querySelector('#tf-theme').addEventListener('click', e => { const b = e.target.closest('button'); if (!b) return; theme = b.dataset.v; root.querySelectorAll('#tf-theme button').forEach(x => x.setAttribute('aria-pressed', String(x === b))); });
        const v = id => root.querySelector('#' + id).value.trim();
        const split = s => { const m = s.split(/[-~→]/).map(x => x.trim()); return [m[0] || '', m[1] || '']; };
        const ap = s => { const m = s.match(/^([A-Za-z]{3})\s*(.*)$/); return m ? [m[1].toUpperCase(), m[2]] : ['', s]; };
        const del = root.querySelector('#tf-del');
        if (del) del.onclick = async () => {
          if (!del.classList.contains('arm')) { del.classList.add('arm'); del.textContent = '再按一次確定刪除'; return; }
          await sb.from('docs').delete().eq('trip_id', T.id); const { error } = await sb.from('trips').delete().eq('id', T.id);
          if (error) { ptoast('刪除失敗：' + error.message); return; } location.href = location.pathname;
        };
        root.querySelector('#tf-ok').onclick = async () => {
          const title = v('tf-title'), start = v('tf-start'), days = parseInt(v('tf-days'), 10);
          if (!title) { root.querySelector('#tf-title').focus(); ptoast('請填旅行名稱'); return; }
          if (!/^\d{4}-\d{2}-\d{2}$/.test(start)) { ptoast('請選出發日'); return; }
          if (!(days >= 1 && days <= 60)) { ptoast('天數請填 1 到 60'); return; }
          const [od, oa] = split(v('tf-ot')), [bd, ba] = split(v('tf-bt')), [ofc, of] = ap(v('tf-of')), [oac, oaN] = ap(v('tf-oa'));
          const data = Object.assign({}, isNew ? {} : T, { title, dest: v('tf-dest'), theme, start, days,
            out: { no: v('tf-on'), dep: od, arr: oa, fromCode: ofc, from: of, toCode: oac, to: oaN },
            back: { no: v('tf-bn'), dep: bd, arr: ba, fromCode: oac, from: oaN, toCode: ofc, to: of },
            hotel: isNew ? { name: v('tf-hn') } : (T.hotel || {}) });  /* 住宿 is edited from the boarding pass */
          delete data.id;
          if (isNew) {
            const id = (title.replace(/[^a-zA-Z0-9]/g, '').toLowerCase().slice(0, 12) || 'trip') + '-' + rid().slice(0, 6);
            const { error } = await sb.from('trips').insert({ id, data });
            if (error) { ptoast('建立失敗：' + error.message); return; }
            location.href = '?t=' + encodeURIComponent(id);
          } else {
            const { error } = await sb.from('trips').update({ data, updated_at: new Date().toISOString() }).eq('id', T.id);
            if (error) { ptoast('儲存失敗：' + error.message); return; }
            close(); location.reload();
          }
        };
      });
  }

  /* ---------- sharing (admin) ---------- */
  async function shareSheet() {
    const draw = async (root) => {
      const { data } = await sb.from('trip_shares').select('email,role').eq('trip_id', TRIP.id).order('created_at');
      const list = root.querySelector('#sh-list');
      list.innerHTML = (data || []).length ? data.map(s => '<li class="crow shrow"><span class="cbody"><span class="ct">' + esc(s.email) + '</span></span><span class="seg shrole" data-email="' + esc(s.email) + '"><button type="button" data-v="edit" aria-pressed="' + (s.role === 'edit') + '">可編輯</button><button type="button" data-v="view" aria-pressed="' + (s.role === 'view') + '">只能看</button></span><button type="button" class="ibtn" data-rm="' + esc(s.email) + '" aria-label="移除 ' + esc(s.email) + '">×</button><button type="button" class="btn sm sh-send" data-send="' + esc(s.email) + '">傳邀請</button></li>').join('') : '<div class="empty">名單是空的，只有你看得到這趟旅行</div>';
    };
    /* one short line, one row to add (Gmail + 可編輯／只能看 + 加入), then the people; 傳邀請 on each person */
    sheet('<h2>分享</h2><p class="hint2">只有名單上的 Gmail 能打開這本手帳。</p>' +
      '<div class="shadd"><input class="inp" id="sh-email" type="email" inputmode="email" placeholder="對方的 Gmail" autocomplete="off" aria-label="對方的 Gmail"><button type="button" class="btn pri" id="sh-add">加入</button></div>' +
      '<div class="seg shrole-new" id="sh-role"><button type="button" data-v="edit" aria-pressed="true">可編輯</button><button type="button" data-v="view" aria-pressed="false">只能看</button></div><small class="rolehint" id="sh-rh" hidden></small><div class="invite" id="sh-inv" hidden></div>' +
      '<div class="fld"><span class="lbl">可以打開的人</span><ul class="clist shlist" id="sh-list"></ul></div>',
      (root, close) => {
        let r = 'edit';
        root.querySelector('#sh-role').addEventListener('click', e => { const b = e.target.closest('button'); if (!b) return; r = b.dataset.v; root.querySelector('#sh-rh').textContent = r === 'edit' ? '可以改行程、記帳、打勾清單' : '只能看行程和記帳，不能修改'; root.querySelectorAll('#sh-role button').forEach(x => x.setAttribute('aria-pressed', String(x === b))); });
        root.querySelector('#sh-add').onclick = async () => {
          const em = root.querySelector('#sh-email').value.trim().toLowerCase();
          if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(em)) { ptoast('請輸入正確的 Email'); return; }
          const { error } = await sb.from('trip_shares').upsert({ trip_id: TRIP.id, email: em, role: r });
          if (error) { ptoast('邀請失敗：' + error.message); return; }
          root.querySelector('#sh-email').value = ''; draw(root); showInvite(root, em);
        };
        root.querySelector('#sh-list').addEventListener('click', async e => {
          const sd = e.target.closest('[data-send]'); if (sd) { copyInvite(); return; }
          const rm = e.target.closest('[data-rm]');
          if (rm) { if (!rm.classList.contains('arm')) { rm.classList.add('arm'); rm.textContent = '確定'; return; } await sb.from('trip_shares').delete().eq('trip_id', TRIP.id).eq('email', rm.dataset.rm); ptoast('已移除'); draw(root); return; }
          const b = e.target.closest('.shrole button'); if (b) { const em = b.parentNode.dataset.email; await sb.from('trip_shares').update({ role: b.dataset.v }).eq('trip_id', TRIP.id).eq('email', em); ptoast('已更新權限'); draw(root); }
        });
        draw(root);
      });
  }

  function inviteText() {
    const url = location.origin + location.pathname + '?t=' + encodeURIComponent(TRIP.id);
    return ['邀請你一起看「' + TRIP.title + '」旅行手帳 ✈️', url, '', '打開後按「用 Google 登入」，選被邀請的這個 Gmail 就能進去。', '手機可以「加入主畫面」，之後像 App 一樣點開，沒網路也能看行程。'].join('\n');
  }
  async function copyInvite() {
    const t = inviteText();
    if (navigator.share && matchMedia('(pointer:coarse)').matches) { try { await navigator.share({ text: t }); return; } catch (e) { if (e && e.name === 'AbortError') return; } }
    try { await navigator.clipboard.writeText(t); ptoast('已複製邀請訊息，貼到 LINE 就好'); }
    catch (e) { const a = document.createElement('textarea'); a.value = t; document.body.appendChild(a); a.select(); document.execCommand('copy'); a.remove(); ptoast('已複製邀請訊息，貼到 LINE 就好'); }
  }
  function showInvite(root, em) {
    const box = root.querySelector('#sh-inv'); box.hidden = false; const h2 = root.querySelector('#sh-hint2'); if (h2) h2.hidden = true;
    box.innerHTML = '<b>✓ 已加入 <span></span></b><small>最後一步：把邀請訊息傳給對方（LINE 之類），他用這個 Gmail 登入就看得到。</small><button type="button" class="btn pri">傳邀請訊息</button>';
    box.querySelector('span').textContent = em;
    box.querySelector('button').onclick = copyInvite;
  }

  /* ---------- trip hero (built from the trip settings) ---------- */
  // which flight the ticket shows: 出發前 and day 1 → the flight out; from day 2 on → the flight home
  function showBack(T, day) { return day >= 2; }
  function hero(T, day) {
    const end = addDays(T.start, T.days - 1), h = T.hotel || {};
    const o0 = T.out || {}, b0 = T.back || {}, back = showBack(T, day == null ? Math.max(1, Math.round((today0() - new Date(T.start + 'T00:00:00')) / 864e5) + 1) : day);
    const o = back && (b0.no || b0.fromCode) ? b0 : o0, b = o === b0 ? o0 : b0, oDate = o === b0 ? end : T.start, bDate = o === b0 ? T.start : end, bLabel = o === b0 ? '去程 ' : '回程 ';
    const plane = '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M21 16v-2l-8-5V3.5a1.5 1.5 0 0 0-3 0V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5z"/></svg>';
    const hasFly = o.no || o.fromCode || o.toCode;
    return '<div class="hero-top"><div class="brand"><h1>' + esc(T.title) + '</h1><span class="sub">' + esc(T.dest || '') + ' ' + T.days + ' 天' + (T.days > 1 ? ' ' + (T.days - 1) + ' 夜' : '') + '</span></div>' +
      '<span class="sync" id="sync" data-s="wait"><i></i><span id="sync-t">連線中</span></span></div>' +
      '<div class="hero-art">' + art(T.theme) + '</div>' +
      '<div class="pass"><div class="pass-main">' +
      (hasFly ? '<div class="fly-row"><div class="ap"><b>' + esc(o.fromCode || '出發') + '</b><span>' + esc(o.from || '') + '</span></div><div class="fly"><span class="fn">' + esc(o.no || '') + '</span><span class="fline">' + plane + '</span><span class="ft">' + fmtDate(oDate) + (o.dep ? o.dep + (o.arr ? ' → ' + o.arr : '') : '') + '</span></div><div class="ap r"><b>' + esc(o.toCode || '抵達') + '</b><span>' + esc(o.to || '') + '</span></div></div>' +
        '<div class="ft-row">' + fmtDate(oDate) + ' ' + (o.dep ? o.dep + (o.arr ? ' → ' + o.arr : '') : '') + '</div>'
        : '<div class="fly-row"><div class="ap"><b>' + fmtDate(T.start) + '</b><span>出發</span></div><div class="fly"><span class="fline">' + plane + '</span></div><div class="ap r"><b>' + fmtDate(end) + '</b><span>回程</span></div></div>') +
      ((b.no || h.name) ? '<div class="pass-meta">' + (b.no ? '<div><span>' + bLabel + fmtDate(bDate) + '</span><b>' + esc(b.no) + '</b><small class="nb">' + esc([b.dep, b.arr].filter(Boolean).join(' → ')) + '</small></div>' : '<div></div>') +
        (h.name ? '<div><span>住宿 ' + (T.days - 1) + ' 晚</span><b>' + '<button type="button" class="hotel-e" aria-label="改住宿">' + esc(h.name) + (h.en ? '<span class="hotel-en">' + esc(h.en) + '</span>' : '') + '</button>' + ' <a class="hotel-map navpill hm-pill" href="' + esc(h.map || 'https://www.google.com/maps/search/?api=1&query=' + encodeURIComponent(h.en || h.q || h.name)) + '" target="_blank" rel="noopener"><svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M8 14.5s4.5-4.2 4.5-7.7a4.5 4.5 0 0 0-9 0c0 3.5 4.5 7.7 4.5 7.7z"/><circle cx="8" cy="6.8" r="1.6"/></svg>地圖</a>' + '</b><small class="nb hotel-note">' + esc(h.note || '') + '</small></div>' : '') + '</div>' : '') +
      (h.name ? '<div class="hotel-m"><button type="button" class="hotel-e"><span>🏨</span><b>' + esc(h.name) + (h.en ? '<span class="hotel-en">' + esc(h.en) + '</span>' : '') + (h.note ? '<span class="hotel-en hotel-note">' + esc(h.note) + '</span>' : '') + '</b></button><a class="hotel-map" href="' + esc(h.map || 'https://www.google.com/maps/search/?api=1&query=' + encodeURIComponent(h.en || h.q || h.name)) + '" target="_blank" rel="noopener"><em><svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M8 14.5s4.5-4.2 4.5-7.7a4.5 4.5 0 0 0-9 0c0 3.5 4.5 7.7 4.5 7.7z"/><circle cx="8" cy="6.8" r="1.6"/></svg>地圖</em></a></div>' : '') +
      '</div><div class="pass-stub"><span id="cd-l">出發倒數</span><b id="cd">–</b><span id="cd-u">天</span></div></div>';
  }

  /* ---------- db adapter (collection/doc API over docs table, scoped to one trip) ---------- */
  const cache = new Map(), colSubs = new Map(), docSubs = new Map(), loaded = new Map();
  const mapOf = c => { if (!cache.has(c)) cache.set(c, new Map()); return cache.get(c); };
  const qsnap = c => { const docs = [...mapOf(c).entries()].sort((a, b) => a[0] < b[0] ? -1 : 1).map(([id, v]) => ({ id, exists: true, data: () => clone(v), metadata: { fromCache: false, hasPendingWrites: false } })); return { docs, size: docs.length, empty: !docs.length, metadata: { fromCache: false, hasPendingWrites: false }, docChanges: () => [] }; };
  const dsnap = (c, id) => { const v = mapOf(c).get(id); return { id, exists: !!v, data: () => v && clone(v), metadata: { fromCache: false, hasPendingWrites: false } }; };
  function emit(c, id) { (colSubs.get(c) || []).forEach(fn => { try { fn(qsnap(c)); } catch (e) { console.error(e); } }); if (id != null) (docSubs.get(c + '/' + id) || []).forEach(fn => { try { fn(dsnap(c, id)); } catch (e) { console.error(e); } }); }
  function load(c) { if (!loaded.has(c)) loaded.set(c, (async () => { const { data, error } = await sb.from('docs').select('id,data').eq('trip_id', TRIP.id).eq('col', c); if (error) throw err('unavailable', error.message); const m = mapOf(c); m.clear(); for (const r of data) m.set(r.id, r.data); })()); return loaded.get(c); }
  let rt = null;
  function realtime() {
    if (rt) return;
    rt = sb.channel('docs-' + TRIP.id).on('postgres_changes', { event: '*', schema: 'public', table: 'docs', filter: 'trip_id=eq.' + TRIP.id }, p => {
      const row = p.eventType === 'DELETE' ? p.old : p.new; if (!row || !row.col || (row.trip_id && row.trip_id !== TRIP.id)) return;
      if (p.eventType === 'DELETE') mapOf(row.col).delete(row.id); else mapOf(row.col).set(row.id, row.data); emit(row.col, row.id);
    }).subscribe(st => { if (st === 'SUBSCRIBED') for (const c of colSubs.keys()) { loaded.delete(c); load(c).then(() => emit(c)).catch(() => {}); } });
  }
  async function write(fn) { const { error } = await fn(); if (error) throw err(/permission|policy|rls|42501/i.test(error.message + error.code) ? 'invalid_argument' : 'unavailable', error.message); }
  function docRef(c, id) {
    return { id, path: c + '/' + id,
      async get() { await load(c); return dsnap(c, id); },
      async set(data) { const v = clone(data); mapOf(c).set(id, v); emit(c, id); await write(() => sb.from('docs').upsert({ trip_id: TRIP.id, col: c, id, data: v, updated_at: new Date().toISOString() })); },
      async update(patch) { await load(c); const cur = mapOf(c).get(id); if (!cur) throw err('invalid_argument', 'missing'); const v = Object.assign({}, cur, clone(patch)); mapOf(c).set(id, v); emit(c, id); await write(() => sb.from('docs').update({ data: v, updated_at: new Date().toISOString() }).eq('trip_id', TRIP.id).eq('col', c).eq('id', id)); },
      async delete() { mapOf(c).delete(id); emit(c, id); await write(() => sb.from('docs').delete().eq('trip_id', TRIP.id).eq('col', c).eq('id', id)); },
      onSnapshot(next, onErr) { const k = c + '/' + id; if (!docSubs.has(k)) docSubs.set(k, new Set()); docSubs.get(k).add(next); if (!colSubs.has(c)) colSubs.set(c, new Set()); realtime(); load(c).then(() => next(dsnap(c, id))).catch(e => onErr && onErr(e)); return () => docSubs.get(k).delete(next); } };
  }
  const db = { collection(c) { return { path: c, doc(id) { return docRef(c, id || rid()); }, async add(d) { const r = docRef(c, rid()); await r.set(d); return r; }, onSnapshot(next, onErr) { if (!colSubs.has(c)) colSubs.set(c, new Set()); colSubs.get(c).add(next); realtime(); load(c).then(() => next(qsnap(c))).catch(e => onErr && onErr(e)); return () => colSubs.get(c).delete(next); } }; }, doc(p) { const [c, i] = p.split('/'); return docRef(c, i); } };

  const names = {}, nameOf = u => (u.user_metadata && (u.user_metadata.full_name || u.user_metadata.name)) || (u.email || '').split('@')[0];
  const user = { async can() { return role === 'edit'; }, async canEdit() { return role === 'edit'; }, async isOwner() { return access.admin; }, async id() { return session && session.user.id; }, async me() { return { id: session.user.id, name: nameOf(session.user), email: session.user.email }; }, async profiles(ids) { const o = {}; ids.forEach(i => { o[i] = Object.assign({ id: i, name: '', color: '' }, names[i] || {}); }); return o; } };
  let ch = null, myState = {};
  const room = { async presence(p) { myState = Object.assign({}, myState, p, { name: nameOf(session.user) }); if (ch) await ch.track(myState); },
    onPeers(fn) { ch = sb.channel('room-' + TRIP.id, { config: { presence: { key: session.user.id } } }); ch.on('presence', { event: 'sync' }, () => { const st = ch.presenceState(), peers = []; for (const k of Object.keys(st)) { const p = st[k][0] || {}; names[k] = { name: p.name || '', color: '' }; peers.push({ peer: k, by: k, isMe: k === session.user.id, sameTab: k === session.user.id, kind: 'viewer', guest: false, presence: p, updatedAt: Date.now() }); } fn({ peers, joined: [], left: [], updated: [] }); }).subscribe(s => { if (s === 'SUBSCRIBED') ch.track(myState); }); return () => sb.removeChannel(ch); } };
  const UK = 'tn-photo-urls', urls = (() => { try { const o = JSON.parse(localStorage.getItem(UK) || '{}'), r = {}, lim = Date.now() - 5 * 864e5; for (const k in o) if (o[k].at > lim) r[k] = o[k].u; return r; } catch (e) { return {}; } })(), pending = new Set(); let waiters = [];
  const warm = list => { if (navigator.onLine && 'serviceWorker' in navigator) list.forEach(u => fetch(u, { mode: 'no-cors' }).catch(() => {})); };
  setTimeout(() => warm(Object.values(urls)), 4000);
  const keepUrls = () => { try { const o = JSON.parse(localStorage.getItem(UK) || '{}'), now = Date.now(); for (const k in urls) if (!o[k] || o[k].u !== urls[k]) { o[k] = { u: urls[k], at: now }; warm([urls[k]]); } localStorage.setItem(UK, JSON.stringify(o)); } catch (e) {} };
  window.__photoUrl = (id, onReady) => { if (urls[id]) return urls[id]; if (onReady) waiters.push(onReady); if (!pending.has(id)) { pending.add(id); queueMicrotask(async () => { const ids = [...pending]; pending.clear(); const { data } = await sb.storage.from('photos').createSignedUrls(ids, 604800); (data || []).forEach(r => { if (r.signedUrl) urls[r.path] = r.signedUrl; }); keepUrls(); const w = waiters; waiters = []; w.forEach(f => f()); }); } return 'data:image/gif;base64,R0lGODlhAQABAAAAACw='; };
  const assets = { async upload(blob, opts) { const type = (opts && opts.contentType) || blob.type || 'image/jpeg', ext = (type.split('/')[1] || 'jpg').replace('jpeg', 'jpg'), path = TRIP.id + '/' + rid() + '.' + ext; const { error } = await sb.storage.from('photos').upload(path, blob, { contentType: type, upsert: false }); if (error) throw err(/quota|size/i.test(error.message) ? 'quota_exceeded' : 'unavailable', error.message); const { data } = await sb.storage.from('photos').createSignedUrl(path, 604800); urls[path] = data && data.signedUrl; return { id: path, url: urls[path], sizeBytes: blob.size, contentType: type }; }, async delete(id) { await sb.storage.from('photos').remove([id]); } };

  /* ---------- AI descriptions (Edge Function "describe" → Gemini; key stays server-side) ---------- */
  async function sample(input, opts) {
    opts = opts || {};
    const prompt = typeof input === 'string' ? input : (input[input.length - 1] || {}).content || '';
    const call = sb.functions.invoke('describe', { body: { trip: TRIP.id, prompt } });
    const aborted = new Promise((_, rej) => { if (opts.signal) opts.signal.addEventListener('abort', () => rej(Object.assign(new Error('aborted'), { name: 'AbortError', code: 'aborted' })), { once: true }); });
    const { data, error } = await Promise.race([call, aborted]);
    if (error || !data || !data.text) {
      let code = (data && data.code) || 'unavailable';
      try { const b = error && error.context && await error.context.json(); if (b && b.code) code = b.code; } catch (e) {}
      throw err(code, (error && error.message) || code);
    }
    if (opts.onText) opts.onText({ text: data.text, delta: data.text });
    return { text: data.text, truncated: false };
  }

  /* ---------- boot ---------- */
  (async () => {
    await prefetch();
    const st = await signIn();
    if (!tripId) { if (st === 'ok') { document.body.classList.remove('gated'); await shelf(); } return; }
    // trip page
    let ok = st === 'ok', data = null, ferr = null;
    if (ok) {
      for (let i = 0; i < 3; i++) { try { const r = await ((i === 0 && PRE && PRE.trip) || sb.from('trips').select('id,data').eq('id', tripId).maybeSingle()); data = r.data; ferr = r.error; } catch (e) { ferr = e; } if (!ferr || !navigator.onLine) break; await new Promise(r => setTimeout(r, 1500 * (i + 1))); }
      if (ferr && localStorage.getItem('trip-meta-' + tripId)) { ok = false; }
      else if (!data) { gate('<div class="gate-card">' + art('travel') + '<h1>找不到這趟旅行</h1><p>可能已被刪除，或還沒有分享給你。</p><a class="btn pri block" href="' + location.pathname + '">回我的旅行</a></div>'); return; }
    }
    if (ok) {
      TRIP = Object.assign({ id: data.id }, data.data);
      if (access.admin) role = 'edit'; else { const { data: sh } = await sb.from('trip_shares').select('role').eq('trip_id', tripId).eq('email', (session.user.email || '').toLowerCase()).maybeSingle(); role = sh && sh.role === 'edit' ? 'edit' : 'view'; }
      try { localStorage.setItem('trip-meta-' + tripId, JSON.stringify(TRIP)); } catch (e) {}
    }
    if (!ok && (st === 'offline' || st === 'ok')) {
      try { TRIP = JSON.parse(localStorage.getItem('trip-meta-' + tripId) || 'null'); } catch (e) {}
      if (!TRIP) { gate('<div class="gate-card"><h1>目前離線</h1><p>這台裝置還沒有存過這趟旅行，連上網路後再打開。</p></div>'); return; }
    }
    if (!TRIP) return;
    if (!ok) { const again = () => { const n = +(sessionStorage.getItem('tn-retry') || 0); if (n < 5) { sessionStorage.setItem('tn-retry', n + 1); location.reload(); } }; addEventListener('online', again, { once: true }); if (navigator.onLine) setTimeout(again, 8000); } else sessionStorage.removeItem('tn-retry');
    document.body.classList.remove('gated'); $('#app').hidden = false;
    document.title = TRIP.title + '｜旅行手帳';
    $('#trip-hero').innerHTML = hero(TRIP);
    const bar = $('.bar'); if (bar) {
      const back = document.createElement('a'); back.className = 'backlink'; back.href = location.pathname; back.innerHTML = '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 11.5 12 4l9 7.5"/><path d="M5.5 10v9.5h13V10"/><path d="M10 19.5v-5h4v5"/></svg><span>我的旅行</span>'; back.setAttribute('aria-label', '回我的旅行'); bar.insertBefore(back, bar.firstChild);
      if (ok && access.admin) {
        const s = document.createElement('button'); s.type = 'button'; s.className = 'icon-btn pill-btn'; s.textContent = '分享'; s.onclick = shareSheet; bar.appendChild(s);
        const g = document.createElement('button'); g.type = 'button'; g.className = 'icon-btn'; g.setAttribute('aria-label', '旅行設定'); g.textContent = '⚙'; g.onclick = () => tripForm(TRIP); bar.appendChild(g);
      }
    }
    window.claude = { use: async name => ok ? ({ db, user, room, assets, sample: role === 'edit' ? sample : null }[name] || null) : null };
    window.__bootTrip(TRIP);
    // the ticket follows the day you're looking at: tap the last day → the flight home
    let lastBack = null;
    window.__onDay = n => { if (window.__fabSync) window.__fabSync(); const back = showBack(TRIP, n); if (back === lastBack) return; lastBack = back;
      const tmp = document.createElement('div'); tmp.innerHTML = hero(TRIP, n);
      const cur = $('#trip-hero .pass-main'), nw = tmp.querySelector('.pass-main'); if (cur && nw) cur.replaceWith(nw); };
    { const ac = document.querySelector('.chip.active'); if (ac) window.__onDay(+ac.dataset.day); }
    footer();
  })();
})();

if('serviceWorker' in navigator&&location.protocol==='https:')addEventListener('load',()=>navigator.serviceWorker.register('sw.js').catch(()=>{}));

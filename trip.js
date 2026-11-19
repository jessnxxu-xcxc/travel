window.__bootTrip=function(T){
/* ---------- constants ---------- */
const SLOTS=[{k:'breakfast',l:'早餐',end:600},{k:'morning',l:'上午',end:690},{k:'lunch',l:'午餐',end:840},{k:'afternoon',l:'下午',end:1050},{k:'dinner',l:'晚餐',end:1230},{k:'evening',l:'晚上',end:1440}];
const SICO={breakfast:'<path d="M3 6h8v3.5a3.5 3.5 0 0 1-3.5 3.5h-1A3.5 3.5 0 0 1 3 9.5zM11 7h1a1.75 1.75 0 0 1 0 3.5h-1M5.5 2.5v1.5M8.5 2.5v1.5"/>',
  morning:'<path d="M2 12.5h12M4.5 12.5a3.5 3.5 0 0 1 7 0M8 3.5v2M3.6 6.6l1.2 1.2M12.4 6.6l-1.2 1.2"/>',
  lunch:'<path d="M2 8.5h12a6 6 0 0 1-12 0zM6 2.5l1.5 5M10.5 2.5L9 7.5"/>',
  afternoon:'<circle cx="8" cy="8" r="3"/><path d="M8 1.5V3M8 13v1.5M1.5 8H3M13 8h1.5M3.4 3.4l1 1M11.6 11.6l1 1M3.4 12.6l1-1M11.6 4.4l1-1"/>',
  dinner:'<path d="M4.5 2v4a1.75 1.75 0 0 0 3.5 0V2M6.25 7.75V14M12 2c-1.6 1-2.2 3-2.2 5.2h2.2V14"/>',
  evening:'<path d="M13 9.6A5.5 5.5 0 1 1 6.4 3a4.5 4.5 0 0 0 6.6 6.6z"/>'};
const sicon=k=>'<span class="sico"><svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">'+SICO[k]+'</svg></span>';
const PIN='<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M8 14.5s4.5-4.2 4.5-7.7a4.5 4.5 0 0 0-9 0c0 3.5 4.5 7.7 4.5 7.7z"/><circle cx="8" cy="6.8" r="1.6"/></svg>';
const SLOT_L={pool:'口袋名單'};SLOTS.forEach(s=>SLOT_L[s.k]=s.l);
const SLOT_I={};SLOTS.forEach((s,i)=>SLOT_I[s.k]=i);
const KINDS=[['food','美食'],['spot','景點'],['shop','購物'],['move','交通'],['stay','住宿'],['facility','設施'],['todo','待辦']];
const KIND_L=Object.fromEntries(KINDS);
const LTYPES=[{k:'todo',l:'行前待辦',ph:'例：買 eSIM、買迪士尼門票、換日幣',empty:'出發前要處理的事（買票、換錢、保險…），辦好就打勾'},{k:'book',l:'訂位',ph:'例：USHIGORO 銀座、燒肉 TAKEDA',empty:'要先預約的餐廳放這裡，訂好就打勾'},{k:'ticket',l:'票券',ph:'例：迪士尼門票、Skyliner、晴空塔展望台',empty:'門票、車票放這裡，QR code 或票券截圖可以一起存著'},{k:'pack',l:'行李',ph:'例：護照、行動電源',empty:'出發前要帶的東西，收進行李就打勾'},{k:'buy',l:'購物',ph:'例：藥妝、Tokyo Banana',empty:'購物的東西記在這裡，買到就打勾'}];
const LT_L=Object.fromEntries(LTYPES.map(t=>[t.k,t.l]));
const START=new Date(T.start+'T00:00:00'),NDAYS=T.days,WK='日一二三四五六';
const PLACE_KINDS=['food','spot','shop','facility'];
const CATS=[['food','餐飲'],['shop','購物'],['move','交通'],['ticket','門票'],['stay','住宿'],['other','雜支']];
const CAT_L=Object.fromEntries(CATS);
const CAT_C={food:'var(--coral)',shop:'var(--yellow)',move:'var(--green)',ticket:'var(--water)',stay:'#C9B6E4',other:'#D8D2CC'};
const KIND2CAT={food:'food',shop:'shop',spot:'ticket',move:'move',stay:'stay'};

/* ---------- helpers ---------- */
const $=s=>document.querySelector(s);
const esc=s=>String(s==null?'':s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
/* 只有 HTML 真的變了才寫進 DOM：省掉整頁重建，也保住捲動位置、輸入焦點和展開狀態 */
const _lastH=new WeakMap();
function setHTML(el,h){if(!el)return false;if(_lastH.get(el)===h)return false;_lastH.set(el,h);el.innerHTML=h;return true}
const safeUrl=u=>/^https?:\/\//i.test(u||'')?u:'';
const dayDate=n=>{const d=new Date(START);d.setDate(d.getDate()+n-1);return d};
const md=d=>(d.getMonth()+1)+'/'+d.getDate();
const dayLabel=n=>n===0?'口袋名單':'Day '+n+'（'+md(dayDate(n))+'）';
const yen=n=>'¥'+Math.round(n).toLocaleString('en-US');
const ntd=n=>'NT$'+Math.round(n).toLocaleString('en-US');
const ls={get(k){try{return localStorage.getItem(k)}catch(e){return null}},set(k,v){try{localStorage.setItem(k,v)}catch(e){}}};
const desk=matchMedia('(min-width:960px)');
const now=()=>window.__NRT_NOW?new Date(window.__NRT_NOW):new Date();
function todayN(){const t=now();t.setHours(0,0,0,0);return Math.round((t-START)/864e5)+1}
const placeQuery=it=>{if((it.q||'').trim())return it.q.trim();const t=(it.title||'').trim(),a=(it.area||'').trim();return a&&!t.includes(a)?t+' '+a:t};
const mapUrl=it=>safeUrl(it.map)||'https://www.google.com/maps/search/?api=1&query='+encodeURIComponent(placeQuery(it));

/* ---------- state ---------- */
const S={items:new Map(),days:new Map(),lists:new Map(),exps:new Map(),meta:{rate:0.21,people:[]},
  tab:'',mview:ls.get(T.id+'-mview')||'day',sub:ls.get(T.id+'-sub')||'book',active:1,
  db:null,assets:null,sample:null,room:null,user:null,peers:[],prof:{},assetUrl:{},
  canWrite:false,drag:null,dirty:false,q:{}};
if(!LT_L[S.sub])S.sub='book';
(function(){const n=todayN(),v=parseInt(ls.get(T.id+'-day'),10);if(v>=0&&v<=NDAYS)S.active=v;else if(n>=1&&n<=NDAYS)S.active=n;else if(n<1)S.active=0})();

function countdown(){const n=todayN();let l='出發倒數',v=1-n,u='天';
  if(n===1){l='';v='今天出發​🛫';u=''}else if(n===NDAYS){l='';v='今天回家​🛬';u=''}else if(n>=1&&n<=NDAYS){l='旅程進行中';v='Day '+n;u=md(dayDate(n))}else if(n>NDAYS){l='旅程結束';v='✓';u='回憶收藏中'}
  $('#cd-l').textContent=l;$('#cd').textContent=v;$('#cd').classList.toggle('sm',String(v).length>3);$('#cd').classList.toggle('words',/今天/.test(v));$('#cd-u').textContent=u}
function setSync(s,t){const el=$('#sync');el.dataset.s=s;$('#sync-t').textContent=t}
function notice(html){const n=$('#notice');if(!html){n.hidden=true;return}$('#notice-t').innerHTML=html;n.hidden=false}
const photoSrc=id=>S.assetUrl[id]||(window.__photoUrl?window.__photoUrl(id,()=>render()):'/_blob/'+id);

/* ---------- grouping ---------- */
function groups(){const g={};for(const it of S.items.values()){const k=it.day+'|'+it.slot;(g[k]=g[k]||[]).push(it)}
  for(const k in g)g[k].sort((a,b)=>(a.order-b.order)||a.id.localeCompare(b.id));return g}
function dayItems(n){return [...S.items.values()].filter(i=>i.day===n&&SLOT_I[i.slot]!=null).sort((a,b)=>(SLOT_I[a.slot]-SLOT_I[b.slot])||(a.order-b.order))}
function maxOrder(day,slot){let m=0;for(const it of S.items.values())if(it.day===day&&it.slot===slot&&it.order>m)m=it.order;return m}

/* ---------- render ---------- */
function render(){if(S.drag){S.dirty=true;return}S.dirty=false;fixTwd();
  document.body.classList.toggle('ro',!S.canWrite);
  renderPeers();renderStrip();renderNow();renderBoard();renderMbar();if($('#money'))renderMoney();saveCache()}
function peersOn(day){return S.peers.filter(p=>p.presence&&p.presence.tab==='plan'&&p.presence.day===day)}
function renderStrip(){const tn=todayN();let h='';
  const dots=n=>{const ps=peersOn(n);return ps.length?'<span class="pdots">'+ps.slice(0,3).map(p=>'<i style="background:'+esc(p.color)+'"></i>').join('')+'</span>':''};
  for(let n=0;n<=NDAYS;n++){
    if(n===0){const c=[...S.items.values()].filter(i=>i.day===0).length;
      const prep=[...S.lists.values()].filter(r=>!r.done&&(r.type==='pack'||r.type==='book'||r.type==='ticket'||!(r.day>0))).length+[...S.items.values()].filter(i=>i.day===0&&!i.done).length;
      h+='<button type="button" class="chip pool'+(S.active===0?' active':'')+'" data-day="0" aria-label="出發前準備，還有 '+prep+' 項">'+dots(0)+'<span class="c-w">出發前</span><span class="c-d"><svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="4" y="3" width="16" height="18" rx="3"/><path d="m8 9 2 2 4-4M8 15h8"/></svg></span><span class="c-left">'+(prep?'還有 '+prep+' 項':'都好了 ✓')+'</span></button><span class="c-month">'+(START.getMonth()+1)+'月</span>';continue}
    const d=dayDate(n),wd=d.getDay(),np=dayItems(n).filter(i=>PLACE_KINDS.includes(i.kind)).length;
    h+='<button type="button" class="chip'+(S.active===n?' active':'')+(tn===n?' today':'')+(tn>n&&tn>=1?' past':'')+(wd===0||wd===6?' wkend':'')+'" data-day="'+n+'" aria-label="'+md(d)+' 週'+WK[wd]+' Day '+n+'">'+dots(n)+'<span class="c-w">'+(tn===n?'今天':WK[wd])+'</span><span class="c-d">'+d.getDate()+'</span><span class="c-dots">'+'<i></i>'.repeat(Math.min(3,Math.ceil(np/2)))+'</span></button>'}
  const st=$('#strip'),sl=st.scrollLeft;if(setHTML(st,h))st.scrollLeft=sl;
  if(!S.stripInit&&st.clientWidth){S.stripInit=true;const c=st.querySelector('.chip.active');if(c)st.scrollLeft=c.offsetLeft-st.offsetLeft-st.clientWidth/2+c.offsetWidth/2}}

function thumbs(ids){if(!ids||!ids.length)return '';return '<span class="ithumbs" data-n="'+ids.length+'">'+ids.slice(0,3).map(id=>'<img src="'+esc(photoSrc(id))+'" alt="" loading="lazy" decoding="async">').join('')+(ids.length>3?'<span>+'+(ids.length-3)+'</span>':'')+'</span>'}
function itemHTML(it){
  const showMap=PLACE_KINDS.includes(it.kind)&&!!(it.area||it.q||it.title)||!!safeUrl(it.map);
  return '<div class="item is-'+esc(KIND_L[it.kind]?it.kind:'spot')+'" data-id="'+esc(it.id)+'">'+
   '<button type="button" class="grip" aria-label="拖曳移動 '+esc(it.title)+'"><svg width="12" height="20" viewBox="0 0 12 20" fill="currentColor"><circle cx="3" cy="4" r="1.6"/><circle cx="9" cy="4" r="1.6"/><circle cx="3" cy="10" r="1.6"/><circle cx="9" cy="10" r="1.6"/><circle cx="3" cy="16" r="1.6"/><circle cx="9" cy="16" r="1.6"/></svg></button>'+
   '<div class="ibody" role="button" tabindex="0"><span class="imeta">'+(it.must?'<span class="must">★ 必去</span>':'')+timeHTML(it)+
   kindTag(it)+(it.area?'<span class="nb">'+esc(it.area)+'</span>':'')+(spentOn(it)?'<span class="spent">'+yen(spentOn(it))+'</span>':'')+(showMap?'<a class="imap" href="'+esc(mapUrl(it))+'" target="_blank" rel="noopener" aria-label="'+esc(it.title)+' 的地圖">'+PIN+'地圖</a>':'')+'</span>'+
   '<span class="ititle">'+esc(it.title)+'</span>'+(it.note?'<span class="inote">'+esc(it.note)+'</span>':'')+(it.warn?'<span class="iwarn">⚠ '+esc(it.warn)+'</span>':'')+closedWarn(it)+thumbs(it.photos)+tdur(it)+goNext(it)+'</div>'+
   '<span class="iacts">'+
   picHTML(it)+'</span></div>'}
function slotHTML(day,s,list,cur){const em=!(list&&list.length);
  return '<section class="slot'+(s.k==='pool'?' pool-slot':'')+(em?' is-empty':'')+(cur?' cur':'')+'">'+(s.k==='pool'?'':'<div class="slot-h">'+sicon(s.k)+'<b>'+s.l+'</b><button type="button" class="slot-add" data-day="'+day+'" data-slot="'+s.k+'" aria-label="新增到'+s.l+'">＋</button></div>')+
   '<div class="list" data-day="'+day+'" data-slot="'+s.k+'">'+(list&&list.length?list.map(itemLegs).join(''):'<div class="empty">'+(s.k==='pool'?'還沒有備選地點':(S.canWrite?'拖到這裡或按＋':'—'))+'</div>')+'</div></section>'}
function curSlot(){const t=now(),m=t.getHours()*60+t.getMinutes();const i=SLOTS.findIndex(s=>m<s.end);return i<0?SLOTS.length-1:i}
function daySum(n){const it=dayItems(n),pl=it.filter(i=>PLACE_KINDS.includes(i.kind)),food=it.filter(i=>i.kind==='food').length,dn=it.filter(i=>i.done).length;
  if(!it.length)return '';return '<span class="slot-sum">'+pl.length+' 個地點'+(food?'・'+food+' 家吃的':'')+'</span>'}
function routeUrl(n){const ps=dayItems(n).filter(i=>PLACE_KINDS.includes(i.kind)).map(placeQuery).filter(Boolean);
  const seen=new Set(),u=ps.filter(p=>!seen.has(p)&&seen.add(p)).slice(0,10);
  if(!u.length)return '';if(u.length===1)return 'https://www.google.com/maps/search/?api=1&query='+encodeURIComponent(u[0]);
  return 'https://www.google.com/maps/dir/'+u.map(encodeURIComponent).join('/')}
function renderBoard(){const g=groups(),tn=todayN();let h='';buildNext();buildEst();
  for(let n=0;n<=NDAYS;n++){
    const act=S.active===n?' active':'';
    if(n===0){h+='<section class="col'+act+'" data-col="0"><header class="col-h"><div class="col-t"><span class="col-n">BEFORE</span><span class="col-title" style="cursor:default">出發前準備</span></div></header>'+preTabsHTML()+
      listBlock('todo','行前待辦',listRows('todo').sort(byDate),0)+listBlock('pack','行李清單',listRows('pack'),0)+listBlock('book','訂位',listRows('book').sort(byDate),0)+listBlock('ticket','票券',listRows('ticket').sort(byDate),0)+listBlock('buy','購物',listRows('buy').sort(byDate),0)+preMoneyHTML()+
      '<section class="dsec" data-sec="pool"><div class="dsec-h">'+dicon('pin')+'<b>口袋名單</b></div><p class="pool-help">還沒決定哪天去的店或景點先記在這裡（備選）。行程有空檔時，把它<b>拖到某一天</b>，或點開改「哪一天」。</p>'+slotHTML(0,{k:'pool',l:'口袋名單'},g['0|pool'])+(S.canWrite?'<form class="addrow pooladd"><input class="inp" id="add-pool-0" aria-label="新增到口袋名單" placeholder="＋ 新增：teamLab、阿美橫丁的某家店" autocomplete="off"><button class="btn pri" type="submit">加入</button></form>':'')+'</section></section>';continue}
    const d=dayDate(n),wd=d.getDay(),title=autoDayTitle(n)||(S.days.get('d'+n)||{}).title||'',ru=routeUrlH(n);
    h+='<section class="col'+act+'" data-col="'+n+'"><header class="col-h"><div class="col-date'+(wd===0||wd===6?' wkend':'')+'"><b>'+md(d)+'</b><span>週'+WK[wd]+'</span></div>'+
      '<div class="col-t"><span class="col-n">DAY '+n+(tn===n?'<em>・今天</em>':'')+'</span><button type="button" class="col-title'+(title?'':' ph-title')+'" data-edit-day="'+n+'">'+(title?esc(title):'點這裡寫今天去哪')+'</button>'+'<div class="col-sub">'+daySum(n)+dayTimeChip(n)+wxChip(n)+(ru?'<a class="route" data-rd="'+n+'" href="'+esc(ru)+'" target="_blank" rel="noopener" aria-label="用 Google 地圖開今天的路線"><svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="4" cy="12" r="2"/><circle cx="12" cy="4" r="2"/><path d="M6 12h3a3 3 0 0 0 0-6H7a3 3 0 0 1 0-6"/></svg><span class="rl">今日路線</span></a>':'')+'</div></div></header>'+
      (dayItems(n).length?'':'<div class="empty-day">這天還沒有排行程<br>按右下角「＋ 新增」→「行程」加第一個地點</div>')+'<div class="tl">'+SLOTS.map((s,i)=>slotHTML(n,s,g[n+'|'+s.k],tn===n&&i===curSlot())).join('')+'</div>'+daySections(n)+diaryHTML(n)+
      (n<NDAYS?(T.hotel&&T.hotel.name?'<div class="col-foot">住宿・'+esc(T.hotel.name)+'</div>':''):(T.back&&T.back.arr?'<div class="col-foot">'+esc(T.back.arr)+' 回到'+esc(T.back.to||'')+'</div>':''))+'</section>'}
  const b=$('#board'),sl=b.scrollLeft,a=document.activeElement,keep=a&&a.id&&a.id.startsWith('add-')&&b.contains(a)?a.id:'',val=keep&&a.value,ss=keep&&a.selectionStart;
  /* 一天一欄分開比對：只有內容真的變了的那一天才重畫，其他天的畫面原封不動（捲動位置、打到一半的字、展開狀態都留著） */
  const parts=h.split(/(?=<section class="col[ "])/).filter(Boolean),prev=b.__cols;let ch=false;
  if(!prev||prev.length!==parts.length||b.children.length!==parts.length){b.innerHTML=h;ch=true}
  else for(let i=0;i<parts.length;i++)if(prev[i]!==parts[i]){b.children[i].outerHTML=parts[i];ch=true}
  b.__cols=parts;if(ch)b.scrollLeft=sl;
  if(ch&&keep){const k=document.getElementById(keep);if(k){k.value=val;k.focus({preventScroll:true});try{k.setSelectionRange(ss,ss)}catch(e){}}}
  if(!S.boardInit&&desk.matches&&b.clientWidth){S.boardInit=true;const c=b.querySelector('.col.active');if(c)b.scrollLeft=c.offsetLeft-b.offsetLeft-16}}

const DICO={pin:'<path d="M8 14s4.5-4.2 4.5-7.5a4.5 4.5 0 0 0-9 0C3.5 9.8 8 14 8 14z"/><circle cx="8" cy="6.5" r="1.6"/>',money:'<path d="M3.5 2.5 8 8l4.5-5.5M8 8v5.5M5 8.5h6M5 11h6"/>',todo:'<rect x="2.5" y="2.5" width="11" height="11" rx="2"/><path d="m5.5 8 2 2 3.5-4"/>',pack:'<rect x="3" y="5" width="10" height="8.5" rx="1.5"/><path d="M6 5V3.5h4V5M3 9h10"/>'};
const dicon=k=>'<span class="sico"><svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">'+DICO[k]+'</svg></span>';
const LT_TAG={todo:['待辦','k-todo'],book:['訂位','k-spot'],ticket:['票券','k-food'],buy:['購物','k-shop'],pack:['行李','k-move']};
function rowHTML(r,withTag){return '<li class="crow'+(r.done?' done':'')+'" data-lid="'+esc(r.id)+'"><button type="button" class="ibtn chk lchk" aria-label="打勾" aria-pressed="'+(r.done?'true':'false')+'">✓</button>'+
  '<button type="button" class="cbody lbody">'+(withTag&&LT_TAG[r.type]?'<span class="kind ltype '+LT_TAG[r.type][1]+'">'+LT_TAG[r.type][0]+'</span>':'')+(!withTag&&r.day>0?'<span class="ldate">'+md(dayDate(r.day))+'（'+WK[dayDate(r.day).getDay()]+'）</span>':'')+'<span class="ct">'+esc(r.title)+'</span>'+dupHTML(r)+(r.note?'<span class="cn">'+esc(r.note)+'</span>':'')+thumbs(r.photos)+'</button>'+(!withTag&&S.canWrite&&!r.done?'<span class="lgrip" role="button" aria-label="拖曳調整順序"><svg viewBox="0 0 12 20" width="12" height="20" fill="currentColor" aria-hidden="true"><circle cx="3" cy="4" r="1.6"/><circle cx="9" cy="4" r="1.6"/><circle cx="3" cy="10" r="1.6"/><circle cx="9" cy="10" r="1.6"/><circle cx="3" cy="16" r="1.6"/><circle cx="9" cy="16" r="1.6"/></svg></span>':'<span></span>')+'</li>'}
function listBlock(type,title,rows,day){if(day===0&&(type==='todo'||type==='buy'))rows=rows.filter(r=>!(r.day>0));const t=LTYPES.find(x=>x.k===type),done=rows.filter(r=>r.done).length;
  return '<section class="dsec" data-sec="'+type+'">'+'<div class="dsec-h">'+dicon(type==='pack'?'pack':'todo')+'<b>'+title+'</b>'+(rows.length?'<small>'+done+' / '+rows.length+' 完成</small>':'')+'</div>'+
    (S.canWrite?'<form class="addrow" data-type="'+type+'" data-day="'+day+'"><input class="inp" id="add-'+type+'-'+day+'" aria-label="新增到'+title+'" placeholder="＋ 新增到'+esc(title)+'" autocomplete="off"><button class="btn pri" type="submit">加入</button></form>':'')+
    (rows.length?'<ul class="clist">'+rows.map(r=>rowHTML(r,false)).join('')+'</ul>':'<p class="pool-help">'+esc(t.empty)+'。</p>')+'</section>'}
function daySections(n,part){const rate=+S.meta.rate||0;
  const ex=[...S.exps.values()].filter(e=>(e.day||0)===n).sort((a,b)=>(a.ts||0)-(b.ts||0)),sum=ex.reduce((s,e)=>s+(+e.amount||0),0);
  const todo=[...S.lists.values()].filter(r=>(r.type==='todo'||r.type==='book'||r.type==='ticket'||r.type==='buy')&&r.day===n).sort((a,b)=>(a.done-b.done)||((a.ts||0)-(b.ts||0)));
  return (part==='money'?'':'<section class="dsec dsec-todo">'+'<div class="dsec-h">'+dicon('todo')+'<b>今日要辦</b><small>待辦・票券・訂位</small><button type="button" class="slot-add" data-todo-day="'+n+'">＋ 新增</button></div>'+
      (todo.length?'<ul class="clist">'+todo.map(r=>rowHTML(r,true)).join('')+'</ul>':'')+'</section>')+
    (part==='todo'?'':'<section class="dsec">'+'<div class="dsec-h">'+dicon('money')+'<b>今日花費</b>'+(sum?'<span class="dsum">'+ntd(sum*rate)+'</span><small>≈ '+yen(sum)+'</small>':'')+'<button type="button" class="slot-add" data-exp-day="'+n+'">＋ 記一筆</button></div>'+
      (ex.length?'<div class="drows">'+ex.map(e=>eRow(e,rate)).join('')+'</div>':'')+'</section>')}
function renderMbar(){const m=money(),el=$('#mbar');const tx=m.tx[0];
  setHTML(el,'<span>旅費 <b>'+ntd(m.total*(+S.meta.rate||0))+'</b>'+(m.total?(+S.meta.budget?' <small>剩 '+ntd(Math.max(0,+S.meta.budget-m.total)*(+S.meta.rate||0))+'</small>':''):' <small>還沒記帳</small>')+'</span>')}
function openMoney(){S.readSheet=false;
  openSheet('<h2>旅費總覽</h2><div id="money"></div>'+(S.canWrite?'<div class="btns"><button type="button" class="btn pri block" id="m-add">＋ 記一筆</button></div>':''),
  root=>{renderMoney();const a=root.querySelector('#m-add');if(a)a.onclick=()=>{closeSheet();openExp(null)};
    root.addEventListener('click',e=>{const t=e.target;let el;e.stopPropagation();
      if((el=t.closest('[data-mview]'))){S.mview=el.dataset.mview;ls.set(T.id+'-mview',S.mview);renderMoney();return}
      if((el=t.closest('.ebody'))){openExp(el.closest('.erow').dataset.eid);return}
      if((el=t.closest('[data-rm-person]'))){if(canWrite()){const p=el.dataset.rmPerson;saveMeta({people:S.meta.people.filter(x=>x!==p)});toast('已移除成員「'+p+'」',()=>saveMeta({people:S.meta.people.concat(p)}))}return}
      if(t.closest('#add-person')){if(canWrite())openPrompt('新增分帳成員','名字','','例：Jessica','',v=>{if(!v)return false;if(!S.meta.people.includes(v))saveMeta({people:S.meta.people.concat(v)});setTimeout(openMoney,0)});return}
      if(t.closest('#rate-btn')){if(canWrite())openPrompt('日圓匯率','1 日圓 = 多少台幣（留空＝自動用最新匯率）',S.meta.rateAuto===false?String(S.meta.rate):'','自動：'+(FX.rate||S.meta.rate),'decimal',v=>{if(!String(v).trim()){saveMeta({rateAuto:true});applyFx();render();toast('已改回自動匯率');setTimeout(openMoney,0);return}const r=parseFloat(v);if(!(r>0&&r<10)){toast('請輸入像 0.21 這樣的數字');return false}saveMeta({rate:r,rateAuto:false});setTimeout(openMoney,0)});return}})})}
function openTodoAdd(day){if(!canWrite())return;S.readSheet=false;const st={type:'todo'};
  openSheet('<h2>今日要辦・'+md(dayDate(day))+'</h2><div class="fld"><label for="t-title">要辦什麼？</label><input class="inp" id="t-title" placeholder="例：迪士尼門票、USHIGORO 訂位、Tokyo Banana" autocomplete="off"></div>'+
    '<div class="fld"><span class="lbl">種類</span><div class="seg" id="seg-ttype"><button type="button" data-v="todo" aria-pressed="true">待辦</button><button type="button" data-v="book" aria-pressed="false">訂位</button><button type="button" data-v="ticket" aria-pressed="false">票券</button><button type="button" data-v="buy" aria-pressed="false">購物</button></div></div>'+
    '<div class="btns"><button type="button" class="btn pri block" id="t-ok">加入</button></div>',
  root=>{const i=root.querySelector('#t-title');setTimeout(()=>i.focus(),50);bindSeg(root,'seg-ttype',v=>st.type=v);
    const go=()=>{const v=i.value.trim();if(!v){i.focus();return}create('lists',{type:st.type,title:v,note:'',done:false,day,photos:[],ts:Date.now()});closeSheet();render();toast('已加到 '+dayLabel(day))};
    root.querySelector('#t-ok').onclick=go;i.addEventListener('keydown',e=>{if(e.key==='Enter')go()})})}

/* ---------- now / next ---------- */
function renderNow(){const box=$('#now'),n=todayN();
  if(n<1||n>NDAYS||S.active!==n){box.hidden=true;return}
  const t=now(),mins=t.getHours()*60+t.getMinutes(),cur=curSlot();
  const toMin=s=>{const m=/^(\d{1,2}):(\d{2})$/.exec(s||'');return m?(+m[1])*60+(+m[2]):null};
  const list=dayItems(n);
  const ups=list.filter(i=>{const tm=toMin(i.time);return tm!=null?tm>=mins-60:SLOT_I[i.slot]>=cur});
  const nx=ups[0],after=ups[1];
  let h='<div class="nowcard"><div class="nl"><i></i>現在・'+SLOTS[cur].l+'時段</div>';
  if(!nx)h+='<div class="nowmain"><div class="nt"><b>今天的行程都走完了</b><span>好好休息，明天見</span></div></div>';
  else h+='<div class="nowmain" data-id="'+esc(nx.id)+'"><div class="nt"><span>下一站'+(nx.time?'・'+esc(nx.time):'・'+SLOT_L[nx.slot])+(nx.area?'・'+esc(nx.area):'')+'</span><b>'+esc(nx.title)+'</b>'+(nx.desc?'<span class="nd">'+esc(nx.desc)+'</span>':'')+'</div>'+
    (PLACE_KINDS.includes(nx.kind)||safeUrl(nx.map)?'<a class="ibtn map" href="'+esc(mapUrl(nx))+'" target="_blank" rel="noopener">'+PIN+'地圖</a>':'')+
    '</div>'+
    (after?'<div class="nownext">接著：<b>'+esc(after.title)+'</b>'+(after.area?'・'+esc(after.area):'')+'</div>':'');
  setHTML(box,h+'</div>');box.hidden=false}

/* ---------- presence ---------- */
function renderPeers(){const el=$('#peers');if(!S.room){el.hidden=true;return}
  const ps=S.peers;if(!ps.length){el.hidden=true;return}
  setHTML(el,'<span class="peers-l">'+ps.length+' 人在線上</span>'+ps.slice(0,4).map(p=>{const where=p.presence&&p.presence.tab==='lists'?'清單':p.presence&&p.presence.tab==='money'?'記帳':(p.presence&&p.presence.day!=null?dayLabel(p.presence.day):'');
    return '<span class="peer" style="background:'+esc(p.color)+'" title="'+esc(p.name+(where?' 在看 '+where:''))+'">'+esc((p.name||'?').trim().charAt(0).toUpperCase())+'</span>'}).join(''));
  el.hidden=false}
let presT=0;
function pushPresence(){if(!S.room)return;clearTimeout(presT);presT=setTimeout(()=>{S.room.presence({tab:S.tab||'plan',day:S.active}).catch(()=>{})},250)}
async function onPeersChange(ch){const seen=new Map();
  for(const p of ch.peers){if(p.isMe||p.kind!=='viewer')continue;const key=p.by||p.peer;if(!seen.has(key)||(p.updatedAt>(seen.get(key).updatedAt||0)))seen.set(key,p)}
  const ids=[...seen.values()].map(p=>p.by).filter(Boolean);
  if(ids.length&&S.user){try{const pr=await S.user.profiles(ids);Object.assign(S.prof,pr)}catch(e){}}
  const pal=['#D93A6E','#1F56B0','#7445C2','#0B7F72','#A0640C'];
  S.peers=[...seen.values()].map((p,i)=>{const pr=p.by&&S.prof[p.by];return{name:(pr&&pr.name)||'旅伴',color:(pr&&pr.color)||pal[i%pal.length],presence:p.presence||{},updatedAt:p.updatedAt}});
  renderPeers();if(!S.drag)renderStrip()}

/* ---------- lists tab ---------- */
function listRows(type){return [...S.lists.values()].filter(r=>r.type===type).sort((a,b)=>(a.done-b.done)||(lkey(a)-lkey(b))||a.id.localeCompare(b.id))}
function checkHTML(type){const t=LTYPES.find(x=>x.k===type),rows=listRows(type),done=rows.filter(r=>r.done).length;
  let h='<form class="addrow" data-type="'+type+'"><input class="inp" id="add-'+type+'" aria-label="新增到'+t.l+'" placeholder="'+esc(t.ph)+'" autocomplete="off"><button class="btn pri" type="submit">加入</button></form>';
  if(rows.length)h+='<div class="prog"><span class="bar2"><i style="width:'+(rows.length?done/rows.length*100:0)+'%"></i></span></div>';
  h+=rows.length?'<ul class="clist">'+rows.map(r=>'<li class="crow'+(r.done?' done':'')+'" data-lid="'+esc(r.id)+'"><button type="button" class="ibtn chk lchk" aria-label="打勾" aria-pressed="'+(r.done?'true':'false')+'">✓</button>'+
    '<button type="button" class="cbody lbody"><span class="ct">'+esc(r.title)+'</span>'+(r.note?'<span class="cn">'+esc(r.note)+'</span>':'')+thumbs(r.photos)+'</button>'+
    (r.day?'<span class="cday">D'+r.day+' '+md(dayDate(r.day))+'</span>':'<span></span>')+'</li>').join('')+'</ul>'
   :'<div class="empty">'+esc(t.empty)+'</div>';
  return h}
function people(){const set=[...S.meta.people];for(const e of S.exps.values())if(e.payer&&!set.includes(e.payer))set.push(e.payer);return set}
function spentOn(it){let s=0;for(const e of S.exps.values())if(e.itemId===it.id)s+=+e.amount||0;return s}
function money(){const ps=people(),ex=[...S.exps.values()];const paid={},spent={};ps.forEach(p=>{paid[p]=0;spent[p]=0});let total=0;
  for(const e of ex){const a=+e.amount||0;total+=a;if(e.payer)paid[e.payer]+=a;
    const cons=e.split==='self'?(e.payer?[e.payer]:[]):(S.meta.people.length?S.meta.people:(e.payer?[e.payer]:[]));
    cons.forEach(p=>spent[p]=(spent[p]||0)+a/cons.length)}
  const all=[...new Set([...ps,...Object.keys(spent)])];
  const bal=all.map(p=>({p,b:(paid[p]||0)-(spent[p]||0)}));
  const cr=bal.filter(x=>x.b>0.5).sort((a,b)=>b.b-a.b),dr=bal.filter(x=>x.b<-0.5).sort((a,b)=>a.b-b.b);const tx=[];
  let i=0,j=0;while(i<dr.length&&j<cr.length){const amt=Math.min(-dr[i].b,cr[j].b);tx.push({from:dr[i].p,to:cr[j].p,amt});dr[i].b+=amt;cr[j].b-=amt;if(-dr[i].b<0.5)i++;if(cr[j].b<0.5)j++}
  return{ps:all,total,paid,spent,tx,ex}}
function eRow(e,rate){const meta=[e.what&&e.shop?e.what:'',CAT_L[e.cat]&&CAT_L[e.cat]!==e.shop?CAT_L[e.cat]:'',e.split==='self'&&e.payer?e.payer+' 個人':'💰基金',PAY_L[e.pay]||'',e.cur==='TWD'&&e.orig?'台幣 NT$'+(+e.orig).toLocaleString():'',(e.photos||[]).length?'📎 收據':''].filter(Boolean).join('・');
  return '<div class="erow" data-eid="'+esc(e.id)+'"><button type="button" class="cbody ebody"><span class="ct">'+esc(e.shop||e.what||'（未填）')+'</span>'+(meta?'<span class="cn">'+esc(meta)+'</span>':'')+'</button><div class="eamt">'+(e.cur==='TWD'&&+e.orig>0?ntd(+e.orig)+'<small>≈ '+yen(+e.amount||0)+'</small>':ntd((+e.amount||0)*rate)+'<small>≈ '+yen(+e.amount||0)+'</small>')+'</div></div>'}
function aggHTML(groups,rate,max){return groups.map(g=>'<details class="agg"><summary><span class="cbody"><span class="ct">'+esc(g.label)+'</span><span class="cn">'+esc(g.sub)+'</span>'+(max?'<span class="abar"><i style="width:'+(g.sum/max*100).toFixed(1)+'%;--bc:'+(CAT_C[g.k]||'var(--sakura)')+'"></i></span>':'')+'</span><span class="eamt">'+ntd(g.sum*rate)+'<small>≈ '+yen(g.sum)+'</small></span></summary><div class="rows">'+g.rows.map(e=>eRow(e,rate)).join('')+'</div></details>').join('')}
function renderMoney0(){const el=$('#money'),m=money(),rate=+S.meta.rate||0,tn=todayN();
  const openKeys=[...el.querySelectorAll('details[open]')].map(d=>d.dataset.k);const hadAny=!!el.querySelector('details.agg');
  const byDay={};m.ex.forEach(e=>{byDay[e.day||0]=(byDay[e.day||0]||0)+(+e.amount||0)});
  const dayKeys=Object.keys(byDay).filter(d=>+d>0);
  const todaySum=tn>=1&&tn<=NDAYS?byDay[tn]||0:null;
  const topDay=dayKeys.length?dayKeys.sort((a,b)=>byDay[b]-byDay[a])[0]:null;
  let h='<div class="money-sec"><div class="sumcard"><div class="sumtop"><b>'+ntd(m.total*rate)+'</b><span>≈ '+yen(m.total)+'</span><button type="button" class="linkbtn" id="rate-btn">匯率 1 円 = NT$'+rate+fxLabel()+'</button></div>'+
    budgetHTML(m.total,rate)+'<div class="stats"><div><span>'+(todaySum!=null?'今天':'筆數')+'</span><b>'+(todaySum!=null?ntd(todaySum*rate):m.ex.length+' 筆')+'</b></div><div><span>平均每天</span><b>'+ntd((dayKeys.length?(m.total-(byDay[0]||0))/dayKeys.length:0)*rate)+'</b></div><div><span>花最多的一天</span><b>'+(topDay?md(dayDate(+topDay))+' '+ntd(byDay[topDay]*rate):'—')+'</b></div></div>';
  if(m.total){const bc={};m.ex.forEach(e=>{const c=CAT_L[e.cat]?e.cat:'other';bc[c]=(bc[c]||0)+(+e.amount||0)});const cs=CATS.map(c=>c[0]).filter(c=>bc[c]);
    h+='<div class="catbar" role="img" aria-label="各分類花費比例">'+cs.map(c=>'<i style="width:'+(bc[c]/m.total*100).toFixed(2)+'%;background:'+CAT_C[c]+'"></i>').join('')+'</div><div class="catleg">'+cs.map(c=>'<span><i style="background:'+CAT_C[c]+'"></i>'+CAT_L[c]+' '+Math.round(bc[c]/m.total*100)+'%</span>').join('')+'</div>'}
  {const own={};let fund=0;m.ex.forEach(e=>{const a=+e.amount||0;if(e.split==='self'&&e.payer)own[e.payer]=(own[e.payer]||0)+a;else fund+=a});
    if(m.total)h+='<div class="paid"><div><span>💰基金</span><b>'+ntd(fund*rate)+'</b><i>≈ '+yen(fund)+'</i></div>'+Object.keys(own).map(p=>'<div><span>'+esc(p)+' 個人</span><b>'+ntd(own[p]*rate)+'</b><i>≈ '+yen(own[p])+'</i></div>').join('')+'</div>'}
  h+='<div class="people"><span class="sec-l">個人購物的人</span>'+S.meta.people.map(p=>'<span class="pchip">'+esc(p)+'<button type="button" data-rm-person="'+esc(p)+'" aria-label="移除 '+esc(p)+'">×</button></span>').join('')+'<button type="button" class="btn sm" id="add-person">＋ 成員</button></div></div>';
  const V=[['day','依日期'],['shop','依店家'],['cat','依分類'],['pay','依付款'],['person','依歸屬']];
  h+='<div class="viewseg" role="group" aria-label="檢視方式">'+V.map(([k,l])=>'<button type="button" data-mview="'+k+'" aria-pressed="'+(S.mview===k)+'">'+l+'</button>').join('')+'</div>';
  if(!m.ex.length){h+='<div class="empty">還沒有花費紀錄。按右下角「＋」記一筆，或在行程裡點店家記帳</div></div>';setHTML(el,h);return}
  const ex=m.ex.slice().sort((a,b)=>((a.day||99)-(b.day||99))||((a.ts||0)-(b.ts||0)));
  const grp=(keyf,labelf,subf)=>{const g=new Map();ex.forEach(e=>{const k=keyf(e);if(!g.has(k))g.set(k,{k,rows:[],sum:0});const x=g.get(k);x.rows.push(e);x.sum+=+e.amount||0});
    return [...g.values()].map(x=>Object.assign(x,{label:labelf(x),sub:subf(x)}))};
  let groups,max=0;
  if(S.mview==='day')groups=grp(e=>e.day||0,x=>x.k?dayLabel(x.k):'出發前（機票、保險…）',x=>x.rows.length+' 筆'+(x.k&&(S.days.get('d'+x.k)||{}).title?'・'+S.days.get('d'+x.k).title:'')).sort((a,b)=>(a.k||99)-(b.k||99));
  else if(S.mview==='shop')groups=grp(e=>e.shop||'（未填店家）',x=>x.k,x=>x.rows.length+' 筆'+([...new Set(x.rows.map(e=>e.what).filter(Boolean))].join('、')?'・'+[...new Set(x.rows.map(e=>e.what).filter(Boolean))].join('、'):'')).sort((a,b)=>b.sum-a.sum);
  else if(S.mview==='cat'){groups=grp(e=>CAT_L[e.cat]?e.cat:'other',x=>CAT_L[x.k],x=>x.rows.length+' 筆・佔 '+(m.total?Math.round(x.sum/m.total*100):0)+'%').sort((a,b)=>b.sum-a.sum);max=groups.length?groups[0].sum:0}
  else if(S.mview==='pay')groups=grp(e=>PAY_L[e.pay]?e.pay:'cash',x=>PAY_L[x.k],x=>x.rows.length+' 筆・佔 '+(m.total?Math.round(x.sum/m.total*100):0)+'%').sort((a,b)=>b.sum-a.sum);
  else groups=grp(e=>e.split==='self'&&e.payer?e.payer:'💰基金',x=>x.k==='💰基金'?x.k:x.k+' 個人',x=>x.rows.length+' 筆').sort((a,b)=>b.sum-a.sum);
  h+=aggHTML(groups,rate,max)+'</div>';
  setHTML(el,h);
  const inTrip=tn>=1&&tn<=NDAYS;
  el.querySelectorAll('details.agg').forEach((d,i)=>{d.dataset.k=S.mview+':'+groups[i].k;
    if(openKeys.includes(d.dataset.k))d.open=true;
    else if(!hadAny&&S.mview==='day'&&(inTrip?groups[i].k===tn:i===groups.length-1))d.open=true})}

/* ---------- writes ---------- */
function canWrite(){if(!S.canWrite){toast('你目前只能檢視，請行程擁有者把你設為可編輯');return false}return true}
function queue(key,fn){const p=(S.q[key]||Promise.resolve()).then(fn).catch(onWriteErr);S.q[key]=p;return p}
function onWriteErr(e){const c=e&&e.code;
  if(c==='invalid_argument'){S.canWrite=false;setSync('ro','只能檢視');render();toast('你目前只能檢視，改動沒有存到')}
  else if(c==='quota_exceeded')toast('資料已滿，請先刪掉一些項目');
  else if(c==='revoked'){S.canWrite=false;setSync('off','已中斷');render()}
  else toast('同步失敗，請稍後再試一次')}
const COLS={items:'items',lists:'lists',exps:'expenses'};
function ref(store,id){return S.db.collection(COLS[store]).doc(id)}
function patch(store,id,p,undoMsg){const it=S[store].get(id);if(!it||!canWrite())return;p=Object.assign({},p,stampBy('edit'));
  const prev={};for(const k in p)prev[k]=it[k]===undefined?null:it[k];
  S[store].set(id,Object.assign({},it,p));render();
  queue(store+id,()=>ref(store,id).update(p));
  if(undoMsg)toast(undoMsg,()=>patch(store,id,prev))}
function create(store,data){data=Object.assign({},data,stampBy('add'));const r=S.db.collection(COLS[store]).doc();S[store].set(r.id,Object.assign({id:r.id},data));queue(store+r.id,()=>r.set(data));return r.id}
function remove(store,id,label){const it=S[store].get(id);if(!it||!canWrite())return;const data=Object.assign({},it);delete data.id;
  S[store].delete(id);render();queue(store+id,()=>ref(store,id).delete());
  toast('已刪除「'+label+'」',()=>{S[store].set(id,Object.assign({id},data));render();queue(store+id,()=>ref(store,id).set(data))})}
function moveItem(id,day,slot,order){const it=S.items.get(id);if(!it)return;
  if(it.day===day&&it.slot===slot&&it.order===order)return;
  patch('items',id,{day,slot,order},'已移到 '+dayLabel(day)+(day?'・'+SLOT_L[slot]:''))}
function addItems(rows){if(!canWrite()||!rows.length)return;const ids=[];
  for(const r of rows){const o=maxOrder(r.day,r.slot)+1000;
    ids.push(create('items',{day:r.day,slot:r.slot,order:o,kind:r.kind,time:r.time||'',title:r.title,area:r.area||'',note:r.note||'',desc:'',map:r.map||'',photos:[],done:false}))}
  render();const first=rows[0];setActive(first.day,{noScroll:true});
  toast('已新增 '+rows.length+' 項'+(rows.every(r=>r.day===first.day)?'到 '+dayLabel(first.day):''),()=>{ids.forEach(id=>{S.items.delete(id);queue('items'+id,()=>ref('items',id).delete())});render()});return ids}
function setDayTitle(n,title){if(!canWrite())return;{const nd=Object.assign({},S.days.get('d'+n),{title});S.days.set('d'+n,nd);render();queue('d'+n,()=>S.db.collection('days').doc('d'+n).set(nd))}}
function saveMeta(m){if(!canWrite())return;S.meta=Object.assign({},S.meta,m);render();const body={rate:+S.meta.rate||0,people:S.meta.people,rateAuto:S.meta.rateAuto!==false,budget:+S.meta.budget||0};queue('meta',()=>S.db.collection('meta').doc('settings').set(body))}

/* ---------- toast ---------- */
let toastT=0;
function toast(msg,undo,ms){clearTimeout(toastT);let t=$('#toast');if(t)t.remove();
  t=document.createElement('div');t.id='toast';t.className='toast';t.setAttribute('role','status');
  t.innerHTML='<span></span>'+(undo?'<button type="button">復原</button>':'');t.firstChild.textContent=msg;
  if(undo)t.querySelector('button').onclick=()=>{t.remove();undo()};
  document.body.appendChild(t);toastT=setTimeout(()=>t.remove(),ms||(undo?6000:3200))}

/* ---------- smart parse ---------- */
const KW_SLOT=[[/早午餐|早餐|breakfast/i,'breakfast'],[/午餐|中餐|午飯|lunch/i,'lunch'],[/晚餐|晚飯|dinner/i,'dinner'],[/宵夜|晚上|夜景/,'evening'],[/上午|早上/,'morning'],[/下午|下午茶/,'afternoon']];
const KW_KIND=[[/大浴場|置物櫃|投幣式|寄物|行李寄放|廁所|洗手間|休息室|休憩|哺乳|吸菸|健身房|游泳池|泳池|溫泉設施|充電站|設施/,'facility'],[/搭|機場|航班|JX\d|✈|新幹線|地鐵|電車|巴士|計程車|接機|出門|前往|轉車|Skyliner/i,'move'],[/check ?in|check ?out|入住|退房|飯店/i,'stay'],
  [/洗衣|採買|打包|訂位|換錢|領|買票|預約|記得/,'todo'],
  [/餐|吃|拉麵|燒肉|壽司|咖啡|cafe|café|coffee|pizza|漢堡|丼|咖哩|甜點|麵包|bread|bakery|食堂|居酒屋|牛排|豬排|鰻|蕎麥|烏龍|鬆餅|冰|酒|tully|starbucks|星巴克|doutor|羅多倫|komeda|客美多|blue bottle|藍瓶|喫茶|珈琲|カフェ|パン|ベーカリー|bistro|brunch|早午餐|麥當勞|マクドナルド|mcdonald|摩斯|モス|mos burger|肯德基|kfc|吉野家|松屋|すき家|食其家|一蘭|一風堂|壽司郎|スシロー|藏壽司|くら寿司|迴轉壽司|回転寿司|天丼|牛丼|居酒屋|定食|食堂/i,'food'],
  [/買|shop|store|商店|百貨|outlet|藥妝|唐吉|BEAMS|UNIQLO|GU|書店|玩具|loft|hands|無印|muji|ドン・キホーテ|don quijote|bic camera|ビックカメラ|yodobashi|ヨドバシ|parco|lumine|丸井|0101|3coins|daiso|大創|松本清|マツキヨ|matsukiyo|gallery|雜貨|雑貨|選物|古著|商場|mall|アウトレット/i,'shop']];
const AREAS='原宿 表參道 澀谷 新宿 池袋 上野 淺草 淺草橋 藏前 押上 兩國 秋葉原 銀座 築地 東京車站 丸之內 日本橋 六本木 麻布台 麻布十番 神樂坂 中目黑 代官山 惠比壽 下北澤 吉祥寺 高円寺 自由之丘 品川 大井町 台場 舞濱 橫濱 鎌倉 江之島 福生 湯島 谷中 月島 豐洲 二子玉川 晴空塔'.split(' ');
function guessSlot(kind,hour){if(hour==null)return null;
  if(kind==='food')return hour<10?'breakfast':hour<15?'lunch':hour<17?'afternoon':'dinner';
  return hour<12?'morning':hour<18?'afternoon':'evening'}
function parseLine(line,def){let s=line.trim();if(!s)return null;const r={day:def.day,slot:null,kind:null,time:'',title:'',area:'',note:'',map:''};
  const um=s.match(/https?:\/\/\S+/);if(um){r.map=um[0];s=s.replace(um[0],' ');
    const pm=r.map.match(/\/maps\/place\/([^/@?]+)/);if(pm&&!s.trim()){try{s=decodeURIComponent(pm[1].replace(/\+/g,' '))}catch(e){}}}
  let m=s.match(/(?:^|\s)(?:day|d)\s*(\d{1,2})(?=\s|$)/i);if(m&&+m[1]>=1&&+m[1]<=NDAYS){r.day=+m[1];s=s.replace(m[0],' ')}
  else{m=s.match(new RegExp('(?:^|\\s)'+(START.getMonth()+1)+'\\s*[\\/月]\\s*(\\d{1,2})\\s*日?'));if(m){const n=+m[1]-START.getDate()+1;if(n>=1&&n<=NDAYS){r.day=n;s=s.replace(m[0],' ')}}}
  let hour=null;m=s.match(/(\d{1,2})\s*[:：]\s*(\d{2})/);if(m&&+m[1]<24){hour=+m[1];r.time=String(+m[1]).padStart(2,'0')+':'+m[2];s=s.replace(m[0],' ')}
  for(const [re,k] of KW_SLOT){const mm=s.match(re);if(mm){r.slot=k;if(/^(早午餐|早餐|午餐|中餐|晚餐|上午|下午|晚上|早上|宵夜)$/.test(mm[0]))s=s.replace(mm[0],' ');break}}
  for(const [re,k] of KW_KIND)if(re.test(s+' '+line)){r.kind=k;break}
  if(!r.kind)r.kind=r.slot&&/breakfast|lunch|dinner/.test(r.slot)?'food':'spot';
  s=s.split(/\s+/).filter(w=>{if(!r.area&&AREAS.includes(w)){r.area=w;return false}return true}).join(' ');
  r.title=s.replace(/\s+/g,' ').replace(/^[\s,，、|｜\-–—]+|[\s,，、|｜\-–—]+$/g,'').trim();
  if(!r.title&&r.area)r.title=r.area;if(!r.title)r.title=r.map?'新地點（點進去改名）':'';
  if(!r.title)return null;
  if(r.day===0)r.slot='pool';
  else if(!r.slot)r.slot=guessSlot(r.kind,hour)||(def.slot&&def.slot!=='pool'?def.slot:(r.kind==='food'?'lunch':'afternoon'));
  return r}

/* ---------- sheets ---------- */
function openSheet(html,onMount){const L=$('#layer');L.innerHTML='<div class="scrim" id="scrim"><div class="sheet" role="dialog" aria-modal="true"><button type="button" class="sheet-x" aria-label="關閉">×</button>'+html+'</div></div>';
  const sc=$('#scrim'),sh=sc.firstChild;sc.addEventListener('click',e=>{if(e.target===sc)closeSheet()});sh.querySelector('.sheet-x').onclick=closeSheet;
  const bs=[...sh.children].filter(c=>c.classList.contains('btns'));if(bs.length)bs[bs.length-1].classList.add('foot');
  onMount&&onMount(sh);
  const pd=sh.querySelector('.dstrip [aria-pressed="true"]');if(pd){const st=pd.parentNode;st.scrollLeft=pd.offsetLeft-st.offsetLeft-st.clientWidth/2+pd.offsetWidth/2}}
function closeSheet(){if(S.aiCtl){S.aiCtl.abort();S.aiCtl=null}$('#layer').innerHTML=''}
function lightbox(src){const d=document.createElement('div');d.className='lb';d.innerHTML='<img alt=""><button type="button" aria-label="關閉">×</button>';d.querySelector('img').src=src;
  d.addEventListener('click',()=>d.remove());document.body.appendChild(d)}
document.addEventListener('keydown',e=>{if(e.key==='Escape'){const lb=$('.lb');if(lb){lb.remove();return}if(S.drag)endDrag(true);else closeSheet()}});
function daySeg(sel,withPool,poolLabel){let h='<div class="seg dstrip" id="seg-day">';for(let n=withPool?0:1;n<=NDAYS;n++){const d=n?dayDate(n):null,wd=d&&d.getDay();
  h+=n?'<button type="button" class="'+(wd===0||wd===6?'we':'')+'" data-v="'+n+'" aria-pressed="'+(sel===n)+'" aria-label="'+md(d)+' 週'+WK[wd]+'"><span class="w">'+WK[wd]+'</span><span class="n">'+d.getDate()+'</span></button>'
    :'<button type="button" class="pool" data-v="0" aria-pressed="'+(sel===0)+'"><span class="w">'+(poolLabel||'口袋')+'</span><span class="n">'+(poolLabel==='出發前'?'✈︎':'未定')+'</span></button>'}return h+'</div>'}
function slotSeg(sel,day){if(day===0)return '<div class="seg" id="seg-slot"><button type="button" data-v="pool" aria-pressed="true">口袋名單</button></div>';
  return '<div class="seg" id="seg-slot">'+SLOTS.map(s=>'<button type="button" data-v="'+s.k+'" aria-pressed="'+(sel===s.k)+'">'+s.l+'</button>').join('')+'</div>'}
function kindSeg(sel){return '<div class="seg" id="seg-kind">'+KINDS.map(([k,l])=>'<button type="button" data-v="'+k+'" aria-pressed="'+(sel===k)+'">'+l+'</button>').join('')+'</div>'}
function bindSeg(root,id,cb){const el=root.querySelector('#'+id);if(!el)return;el.addEventListener('click',e=>{const b=e.target.closest('button');if(!b||S.readSheet)return;
  el.querySelectorAll('button').forEach(x=>x.setAttribute('aria-pressed',String(x===b)));cb(b.dataset.v)})}

/* photos editor: works on a local array and calls onChange */
function photosHTML(ids,ro){return '<div class="photos" id="photos">'+(ids||[]).map(id=>'<span class="ph-t" data-pid="'+esc(id)+'"><img src="'+esc(photoSrc(id))+'" alt="照片" loading="lazy" decoding="async">'+(ro?'':'<button type="button" class="ph-rm" aria-label="移除照片">×</button>')+'</span>').join('')+
  (!ro&&S.assets?'<label class="ph-add">＋<br>加照片<input type="file" accept="image/*" multiple id="ph-file"></label>':'')+'</div>'}
function compress(file){return new Promise(res=>{if(!/^image\//.test(file.type)||file.type==='image/gif'||file.type==='image/svg+xml'){res(file);return}
  const url=URL.createObjectURL(file),img=new Image();img.onload=()=>{const M=1440,s=Math.min(1,M/Math.max(img.width,img.height));
    if(s===1&&file.size<4e5){URL.revokeObjectURL(url);res(file);return}
    const c=document.createElement('canvas');c.width=Math.round(img.width*s);c.height=Math.round(img.height*s);c.getContext('2d').drawImage(img,0,0,c.width,c.height);
    c.toBlob(b=>{URL.revokeObjectURL(url);res(b&&b.size<file.size?b:file)},'image/jpeg',.8)};img.onerror=()=>{URL.revokeObjectURL(url);res(file)};img.src=url})}
function bindPhotos(root,getIds,setIds){const box=root.querySelector('#photos');if(!box)return;
  box.addEventListener('click',e=>{const rm=e.target.closest('.ph-rm');
    if(rm){e.preventDefault();const t=rm.closest('.ph-t'),pid=t.dataset.pid;
      if(!rm.classList.contains('arm')){rm.classList.add('arm');rm.textContent='確定刪除';setTimeout(()=>{if(rm.isConnected){rm.classList.remove('arm');rm.textContent='×'}},3000);return}
      setIds(getIds().filter(x=>x!==pid));t.remove();if(S.assets)S.assets.delete(pid).catch(()=>{});toast('照片已刪除');return}
    const im=e.target.closest('.ph-t img');if(im)lightbox(im.src)});
  const inp=box.querySelector('#ph-file');if(!inp)return;
  inp.addEventListener('change',async()=>{const files=[...inp.files];inp.value='';if(!files.length)return;
    for(const f of files){const busy=document.createElement('span');busy.className='ph-busy';busy.textContent='上傳中…';box.insertBefore(busy,box.querySelector('.ph-add'));
      try{const blob=await compress(f);const r=await S.assets.upload(blob,{contentType:blob.type||f.type});S.assetUrl[r.id]=r.url;
        setIds(getIds().concat(r.id));const t=document.createElement('span');t.className='ph-t';t.dataset.pid=r.id;t.innerHTML='<img alt="照片"><button type="button" class="ph-rm" aria-label="移除照片">×</button>';t.querySelector('img').src=photoSrc(r.id);busy.replaceWith(t)}
      catch(e){busy.remove();const c=e&&e.code;toast(c==='quota_exceeded'?'空間滿了，先刪掉幾張照片':c==='not_granted'?'你沒有上傳權限':'照片上傳失敗，請再試一次')}}})}

function openEdit(id){const it=S.items.get(id);if(!it)return;const ro=!S.canWrite;S.readSheet=ro;
  const st={day:it.day,slot:it.slot,kind:it.kind||'spot',photos:(it.photos||[]).slice(),must:!!it.must};
  openSheet('<h2>'+(ro?'行程內容':'編輯行程')+'</h2>'+
    '<div class="fld"><label for="e-title">名稱</label><div class="togwrap"><input class="inp" id="e-title" value="'+esc(it.title)+'">'+(ro?'':'<button type="button" class="star-in" id="e-must" aria-pressed="'+st.must+'" aria-label="必去" title="必去">★</button>')+'</div></div>'+
    '<div class="fld"><label for="e-note">備註</label><textarea class="inp" id="e-note" style="min-height:64px">'+esc(it.note)+'</textarea></div>'+
    '<div class="fld"><span class="lbl">照片</span>'+photosHTML(st.photos,ro)+'</div>'+
    (ro?'':'<div class="fld"><span class="lbl">類型</span>'+kindSeg(st.kind)+'</div>')+
    '<div class="fld"><span class="lbl">哪一天</span>'+daySeg(st.day,true)+'</div>'+
    (ro?'':posField(it))+
    '<div class="fld"'+(st.day===0?' hidden':'')+'><span class="lbl">時段</span><div id="slot-wrap">'+slotSeg(st.slot,st.day,st.kind)+'</div></div>'+
    '<div class="fld"'+(st.day===0?' hidden':'')+'><label for="e-time">開始時間<span class="opt">選填</span></label><div class="trange"><input class="inp" id="e-time" inputmode="numeric" placeholder="'+(EST[it.id]!=null?'自動 約 '+tfmt(EST[it.id]):'開始 15:00')+'" value="'+esc(it.time)+'"><span>–</span><input class="inp" id="e-end" inputmode="numeric" placeholder="結束" value="'+esc(it.end||'')+'"></div></div>'+
    (ro?'':stayField(it))+
    (ro?'':modeField(it)+legFieldAll(it))+
    '<div class="more-flat"><div>'+
    (ro?'':recField(it))+
    aiInfoHTML(it,ro)+
    '<div class="fld"><label for="e-desc">簡介'+(S.sample&&!ro?'<button type="button" class="btn sm ai" id="e-ai">✨ AI 寫簡介</button>':'')+'</label><textarea class="inp" id="e-desc" placeholder="這個地方有什麼特色、必吃必買">'+esc(it.desc)+'</textarea></div>'+(picOf(it)&&!ro?'<div class="fld picfld"><label>小圖片<span class="opt">自動從維基百科找的</span></label><div class="picrow"><img src="'+esc(picOf(it))+'" alt="" loading="lazy" decoding="async" referrerpolicy="no-referrer"><button type="button" class="btn sm" id="e-pic-rm" data-id="'+esc(it.id)+'">不要這張</button></div></div>':'')+
    (it.warn?'<div class="iwarn">⚠ '+esc(it.warn)+'</div>':'')+
    '<div class="fld"><label for="e-area">地區</label><input class="inp" id="e-area" placeholder="例 澀谷" value="'+esc(it.area)+'"></div>'+
    (ro?'':ohField(it))+
    '<div class="fld"><label for="e-q">日文店名（地圖搜尋用）</label><input class="inp" id="e-q" placeholder="例：浅草今半 国際通り本店" value="'+esc(it.q)+'"></div>'+
    '<div class="fld"><label for="e-map">Google 地圖連結</label><input class="inp" id="e-map" inputmode="url" placeholder="貼上地圖分享連結" value="'+esc(it.map)+'"></div>'+
    '</div></div>'+
    cmHTML(it,ro)+
    '<div class="btns">'+(ro?'':'<button type="button" class="btn danger" id="e-del">刪除</button>')+'<span class="sp"></span><button type="button" class="btn" id="e-cancel">'+(ro?'關閉':'取消')+'</button>'+(ro?'':'<button type="button" class="btn pri" id="e-save">儲存</button>')+'</div>',
  root=>{
    if(ro)root.querySelectorAll('input,textarea').forEach(x=>x.readOnly=true);
    const rebindSlot=()=>bindSeg(root,'seg-slot',v=>st.slot=v);
    bindSeg(root,'seg-day',v=>{const n=+v;if(n===0)st.slot='pool';else if(st.slot==='pool')st.slot=st.kind==='food'?'lunch':'afternoon';st.day=n;
      root.querySelector('#slot-wrap').innerHTML=slotSeg(st.slot,n,st.kind);rebindSlot();root.querySelector('#slot-wrap').closest('.fld').hidden=n===0;root.querySelector('#e-time').closest('.fld').hidden=n===0});
    rebindSlot();bindLeg(root,st);bindSeg(root,'seg-kind',v=>{st.kind=v;if(st.day>0){st.slot=slotFit(st.slot,v);root.querySelector('#slot-wrap').innerHTML=slotSeg(st.slot,st.day,v);rebindSlot()}});{const mb=root.querySelector('#e-must');if(mb)mb.addEventListener('click',()=>{st.must=!st.must;mb.setAttribute('aria-pressed',st.must)})}
    root.querySelector('#e-cancel').onclick=closeSheet;
    const sf=root.querySelector('#e-staff');if(sf)sf.onclick=()=>showStaff(S.items.get(id)||it);
    const ex=root.querySelector('#e-exp');if(ex)ex.onclick=()=>{if(!canWrite())return;closeSheet();openExp(null,{shop:it.title,day:it.day,cat:KIND2CAT[it.kind]||'other',itemId:it.id})};
    if(ro)return;
    /* photos save immediately so an upload is never lost if the sheet is cancelled */
    bindPhotos(root,()=>st.photos,ids=>{st.photos=ids;const cur=S.items.get(id);if(cur){S.items.set(id,Object.assign({},cur,{photos:ids}));queue('items'+id,()=>ref('items',id).update({photos:ids}));render()}});
    const ai=root.querySelector('#e-ai');
    if(ai)ai.onclick=async()=>{const ta=root.querySelector('#e-desc'),t=root.querySelector('#e-title').value.trim(),a=root.querySelector('#e-area').value.trim();if(!t)return;
      if(S.aiCtl)S.aiCtl.abort();S.aiCtl=new AbortController();ai.disabled=true;ai.textContent='撰寫中…';const before=ta.value;
      try{await S.sample('請用繁體中文（台灣用語）寫一段 30 到 70 字的簡介，給去日本旅遊的人看。地點：「'+t+'」'+(a?'，位於'+(T.dest||'')+'的'+a:(T.dest?'，在'+T.dest+'一帶':''))+'。類型：'+(KIND_L[st.kind]||'景點')+'。說明它是什麼、以什麼出名（招牌菜或必看重點）。只寫你確定的事實；不確定的不要寫，也不要寫營業時間或價格。只回覆簡介本身，不要標題或引號。',
          {signal:S.aiCtl.signal,modelTier:'quick',onText:({text})=>{ta.value=text}})}
      catch(e){ta.value=before;if(e&&e.name!=='AbortError'&&e.code!=='aborted')toast(e&&e.code==='not_granted'?'需要先允許 AI 功能':'AI 暫時寫不出來，請再試一次')}
      finally{if(ai.isConnected){ai.disabled=false;ai.textContent='✨ AI 寫簡介'}}};
    root.querySelector('#e-del').onclick=()=>{closeSheet();remove('items',id,it.title)};
    root.querySelector('#e-save').onclick=()=>{const v=k=>root.querySelector('#e-'+k).value.trim();
      const p={};const f={title:v('title'),time:normT(v('time')),end:normT(v('end')),area:v('area'),desc:v('desc'),note:v('note'),q:v('q'),map:v('map'),kind:st.kind};
      if(!f.title){root.querySelector('#e-title').focus();return}
      for(const [k,el] of [['time','#e-time'],['end','#e-end']])if(f[k]&&tmin(f[k])==null){toast('時間請寫成 15:00 這樣');root.querySelector(el).focus();return}
      if(f.end&&tmin(f.time)!=null&&tmin(f.end)!=null&&tmin(f.end)<=tmin(f.time)){toast('結束時間要比開始晚');root.querySelector('#e-end').focus();return}
      const cur=S.items.get(id)||it;for(const k in f)if((cur[k]||'')!==f[k])p[k]=f[k];if('desc' in p)p.dq=1;
      if(st.must!==!!cur.must)p.must=st.must;if(!ro)legPatch(root,st,cur,p);
      if(st.day!==cur.day||st.slot!==cur.slot){p.day=st.day;p.slot=st.slot;p.order=maxOrder(st.day,st.slot)+1000}if(st.posOrder!=null){p.day=st.day;p.slot=st.slot;p.order=st.posOrder}
      closeSheet();if(Object.keys(p).length)patch('items',id,p,p.day!=null?'已移到 '+dayLabel(st.day)+(st.day?'・'+SLOT_L[st.slot]:''):'已儲存')}
  })}

function openAdd(def){if(!canWrite())return;const d={day:def.day,slot:def.slot&&def.slot!=='pool'?def.slot:null};S.readSheet=false;
  const slotChips=()=>d.day===0?'':'<div class="fld"><span class="lbl">時段</span><div class="seg" id="seg-aslot"><button type="button" data-v="" aria-pressed="'+(!d.slot)+'">自動</button>'+SLOTS.map(s=>'<button type="button" data-v="'+s.k+'" aria-pressed="'+(d.slot===s.k)+'">'+s.l+'</button>').join('')+'</div></div>';
  openSheet('<h2>新增行程</h2>'+
    '<div class="fld"><label for="a-text">去哪裡？</label><textarea class="inp grow" id="a-text" rows="1" placeholder="店名或地點，例：一蘭拉麵 澀谷"></textarea><span class="hint2">可以貼 Google 地圖連結・寫「12:30」或「午餐」會自動排時段・換行可以一次加很多個</span></div>'+
    '<div class="fld"><span class="lbl">哪一天</span>'+daySeg(d.day,true)+'</div>'+
    '<div id="a-slot">'+slotChips()+'</div>'+
    '<div class="preview" id="a-pv"></div>'+
    '<div class="btns"><button type="button" class="btn pri block" id="a-ok" disabled>加入行程</button></div>',
  root=>{const ta=root.querySelector('#a-text'),pv=root.querySelector('#a-pv'),ok=root.querySelector('#a-ok');let rows=[];
    const grow=()=>{ta.style.height='auto';ta.style.height=ta.scrollHeight+'px'};
    const upd=()=>{rows=ta.value.split(/\n+/).map(l=>parseLine(l,d)).filter(Boolean);if(d.slot)rows.forEach(r=>{if(r.day!==0)r.slot=d.slot});
      pv.innerHTML=rows.map(r=>'<div class="pvc"><b>'+esc(r.title)+'</b><span class="kind k-'+r.kind+'">'+KIND_L[r.kind]+'</span><span class="imeta">'+(r.time?'<span class="itime">'+r.time+'</span>':'')+
        '<span>'+(r.day?'Day '+r.day+'・'+md(dayDate(r.day))+'・'+SLOT_L[r.slot]:'口袋名單')+'</span>'+(r.area?'<span>'+esc(r.area)+'</span>':'')+(r.map?'<span class="mapl">'+PIN+'地圖</span>':'')+'</span></div>').join('');
      ok.disabled=!rows.length;ok.textContent=rows.length>1?'加入 '+rows.length+' 個行程':'加入行程'};
    const bindSlot=()=>bindSeg(root,'seg-aslot',v=>{d.slot=v||null;upd()});
    ta.addEventListener('input',()=>{grow();upd()});
    ta.addEventListener('keydown',e=>{if(e.key==='Enter'&&(e.metaKey||e.ctrlKey)){e.preventDefault();ok.click()}});
    bindSeg(root,'seg-day',v=>{const was=d.day;d.day=+v;if((was===0)!==(d.day===0)){if(d.day===0)d.slot=null;root.querySelector('#a-slot').innerHTML=slotChips();bindSlot()}upd()});
    bindSlot();
    ok.onclick=()=>{if(!rows.length)return;closeSheet();addItems(rows)};
    setTimeout(()=>ta.focus(),50)})}

function openDayTitle(n){if(!canWrite())return;const cur=(S.days.get('d'+n)||{}).title||'';S.readSheet=false;
  openSheet('<h2>Day '+n+'・'+md(dayDate(n))+'</h2><div class="fld"><label for="d-title">這天主要去哪</label><input class="inp" id="d-title" placeholder="例 上野・淺草" value="'+esc(cur)+'"></div>'+
   '<div class="btns"><span class="sp"></span><button type="button" class="btn" id="d-cancel">取消</button><button type="button" class="btn pri" id="d-ok">儲存</button></div>',
  root=>{const i=root.querySelector('#d-title');setTimeout(()=>i.focus(),50);root.querySelector('#d-cancel').onclick=closeSheet;
    const go=()=>{const v=i.value.trim();closeSheet();if(v!==cur)setDayTitle(n,v)};root.querySelector('#d-ok').onclick=go;i.addEventListener('keydown',e=>{if(e.key==='Enter')go()})})}

function openListEdit(id){const r=S.lists.get(id);if(!r)return;const ro=!S.canWrite;S.readSheet=ro;const st={day:r.day||0,type:r.type,photos:(r.photos||[]).slice()};
  openSheet('<h2>'+(r.type==='pack'?'行李':(r.nochk||r.type==='buy')&&!(r.day>0)?'口袋':r.type==='ticket'?'票券':r.type==='book'?'訂位':'待辦')+'</h2>'+
    '<div class="fld"><label for="l-title">名稱</label><input class="inp" id="l-title" value="'+esc(r.title)+'"></div>'+
    (r.type!=='pack'&&r.type!=='buy'&&!r.nochk&&!ro?'<div class="fld"><span class="lbl">類型</span><div class="seg" id="seg-ltype">'+[['todo','待辦'],['ticket','票券'],['book','訂位']].map(x=>'<button type="button" data-v="'+x[0]+'" aria-pressed="'+(r.type===x[0])+'">'+x[1]+'</button>').join('')+'</div></div>':'')+
    '<div class="fld"><label for="l-note">備註</label><textarea class="inp" id="l-note" style="min-height:64px" placeholder="'+(r.type==='book'||r.type==='ticket'?'確認碼、時間、人數':r.type==='buy'?'在哪買、幫誰買':'')+'">'+esc(r.note)+'</textarea></div>'+
    (r.type!=='pack'?'<div class="fld"><span class="lbl" id="l-dlbl">'+dateLbl(r.type)+'</span>'+daySeg(st.day,true,'不限')+'</div>':'')+
    (r.type!=='pack'?'<div class="fld"><span class="lbl">照片（票券截圖、商品照）</span>'+photosHTML(st.photos,ro)+'</div>':'')+
    '<div class="btns">'+(ro?'':'<button type="button" class="btn danger" id="l-del">刪除</button>')+'<span class="sp"></span><button type="button" class="btn" id="l-cancel">'+(ro?'關閉':'取消')+'</button>'+(ro?'':'<button type="button" class="btn pri" id="l-save">儲存</button>')+'</div>',
  root=>{if(ro)root.querySelectorAll('input,textarea').forEach(x=>x.readOnly=true);
    bindSeg(root,'seg-day',v=>st.day=+v);root.querySelector('#l-cancel').onclick=closeSheet;if(ro)return;st.nochk=!!r.nochk;bindSeg(root,'seg-chk',v=>st.nochk=v==='0');bindSeg(root,'seg-ltype',v=>{st.type=v;root.querySelector('#l-dlbl').innerHTML=dateLbl(v)});
    bindPhotos(root,()=>st.photos,ids=>{st.photos=ids;const cur=S.lists.get(id);if(cur){S.lists.set(id,Object.assign({},cur,{photos:ids}));queue('lists'+id,()=>ref('lists',id).update({photos:ids}));render()}});
    root.querySelector('#l-del').onclick=()=>{closeSheet();remove('lists',id,r.title)};
    root.querySelector('#l-save').onclick=()=>{const t=root.querySelector('#l-title').value.trim(),n=root.querySelector('#l-note').value.trim();if(!t){root.querySelector('#l-title').focus();return}
      const cur=S.lists.get(id)||r,p={};if(t!==cur.title)p.title=t;if(n!==(cur.note||''))p.note=n;if(r.type!=='pack'&&st.day!==(cur.day||0))p.day=st.day;if(r.type!=='pack'&&st.type&&st.type!==cur.type&&!0)p.type=st.type;if(r.type!=='pack'&&st.nochk!==!!cur.nochk)p.nochk=st.nochk;
      closeSheet();if(Object.keys(p).length)patch('lists',id,p,(p.day!=null||p.type)?'已移到'+listWhere(p.type||cur.type,p.day!=null?p.day:(cur.day||0)):'已儲存')}})}

function openExp(id,pre){const e=id?S.exps.get(id):null;if(id&&!e)return;const ro=!S.canWrite;if(!id&&!canWrite())return;S.readSheet=ro;
  const tn=todayN(),base=e||Object.assign({shop:'',what:'',amount:'',payer:ls.get(T.id+'-payer')||(S.meta.people[0]||''),split:'all',cat:pre&&pre.day===0?'other':'food',day:tn>=1&&tn<=NDAYS?tn:(S.active||0),itemId:''},pre||{});
  const st={day:base.day||0,cat:CAT_L[base.cat]?base.cat:'other',split:base.split==='self'?'self':'all',itemId:base.itemId||'',own:base.split==='self'&&base.payer?base.payer:'',pay:PAY_L[base.pay]?base.pay:(ls.get(T.id+'-pay')||'cash'),cur:base.cur==='TWD'?'TWD':'JPY',photos:(base.photos||[]).slice()};
  const shops=[...new Set([...[...S.items.values()].filter(i=>PLACE_KINDS.includes(i.kind)).map(i=>i.title),...[...S.exps.values()].map(x=>x.shop).filter(Boolean)])];
  const ps=people();
  openSheet('<h2>'+(id?'花費':'記一筆')+'</h2>'+
    '<div class="fld"><span class="lbl">金額</span><div class="seg cur-seg" id="seg-cur"><button type="button" data-v="JPY" aria-pressed="'+(st.cur==='JPY')+'">¥ 日圓</button><button type="button" data-v="TWD" aria-pressed="'+(st.cur==='TWD')+'">NT$ 台幣</button></div><input class="inp" id="x-amt" aria-label="金額" inputmode="decimal" placeholder="例 2400" value="'+esc(st.cur==='TWD'&&base.orig?base.orig:base.amount)+'" autocomplete="off"><span class="amt-hint" id="x-ntd"></span></div>'+
    '<div class="fld"><span class="lbl">分類</span><div class="seg" id="seg-cat">'+CATS.map(([k,l])=>'<button type="button" data-v="'+k+'" aria-pressed="'+(st.cat===k)+'">'+l+'</button>').join('')+'</div></div>'+
    '<div class="fld"><label for="x-shop">記什麼</label><input class="inp" id="x-shop" list="dl-shops" placeholder="例：機票、一蘭拉麵、BEAMS" value="'+esc(base.shop)+'" autocomplete="off"><datalist id="dl-shops">'+shops.map(x=>'<option value="'+esc(x)+'">').join('')+'</datalist></div>'+
    '<div class="fld"><label for="x-what">細節 <small class="opt">選填</small></label><input class="inp" id="x-what" placeholder="例：星宇來回兩人、拉麵兩碗" value="'+esc(base.what)+'" autocomplete="off"></div>'+
    
    '<div class="fld"><span class="lbl">怎麼付</span><div class="seg" id="seg-pay">'+PAYS.filter(([k])=>k!=='other'||st.pay==='other').map(([k,l])=>'<button type="button" data-v="'+k+'" aria-pressed="'+(st.pay===k)+'">'+l+'</button>').join('')+'</div></div>'+
    '<div class="fld"><span class="lbl">照片</span>'+photosHTML(st.photos,ro)+'</div>'+
    '<div class="fld"><span class="lbl">這筆是誰的</span><div class="seg" id="seg-own"><button type="button" data-v="" aria-pressed="'+(!st.own)+'">💰基金</button>'+[...new Set(S.meta.people.concat(st.own?[st.own]:[]))].map(p=>'<button type="button" data-v="'+esc(p)+'" aria-pressed="'+(st.own===p)+'">'+esc(p)+'</button>').join('')+''+'</div>'+(ro?'':'<input class="inp own-new" id="x-ownnew" placeholder="其他人：輸入名字（例：老公）" autocomplete="off">')+'<small class="rolehint">吃喝玩樂、門票、交通選「💰基金」；個人的購物選名字</small></div>'+
    (!id&&pre&&pre.day>0?'':'<div class="fld"><span class="lbl">哪一天</span>'+daySeg(st.day,true,'出發前')+'</div>')+
    '<div class="btns">'+(id&&!ro?'<button type="button" class="btn danger" id="x-del">刪除</button>':'')+'<span class="sp"></span><button type="button" class="btn" id="x-cancel">'+(ro?'關閉':'取消')+'</button>'+(ro?'':'<button type="button" class="btn pri" id="x-save">'+(id?'儲存':'記一筆')+'</button>')+'</div>',
  root=>{const q=k=>root.querySelector('#x-'+k);if(ro)root.querySelectorAll('input').forEach(x=>x.readOnly=true);
    const hint=()=>{const a=parseAmt(q('amt').value),r=+S.meta.rate||0;q('ntd').textContent=a>0?(st.cur==='TWD'?'≈ '+yen(r?a/r:0):'≈ '+ntd(a*r)):''};hint();q('amt').addEventListener('input',hint);
    const press=(sid,v)=>root.querySelectorAll('#'+sid+' button').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.v===String(v))));
    bindSeg(root,'seg-day',v=>st.day=+v);bindSeg(root,'seg-cat',v=>st.cat=v);bindSeg(root,'seg-split',v=>st.split=v);bindSeg(root,'seg-cur',v=>{st.cur=v;hint()});bindSeg(root,'seg-pay',v=>st.pay=v);bindSeg(root,'seg-own',v=>{st.own=v;const n=q('ownnew');if(n)n.value=''});bindPhotos(root,()=>st.photos,ids=>{st.photos=ids});
    const link=()=>{const it=[...S.items.values()].find(i=>i.title===q('shop').value.trim());
      if(it){st.itemId=it.id;const c=KIND2CAT[it.kind];if(c){st.cat=c;press('seg-cat',c)}if(it.day&&!id){st.day=it.day;press('seg-day',it.day)}}else st.itemId=''};
    q('shop').addEventListener('change',link);
    const pq=q('pq');if(pq&&!ro)pq.addEventListener('click',ev=>{const b=ev.target.closest('button');if(b)q('payer').value=b.dataset.p});
    q('cancel').onclick=closeSheet;if(ro)return;
    if(id)q('del').onclick=()=>{closeSheet();remove('exps',id,e.shop||e.what||'花費')};
    q('save').onclick=()=>{if(q('shop').value.trim()!==(base.shop||''))link();
      const what=q('what').value.trim(),shop=q('shop').value.trim()||(what?'':CAT_L[st.cat]||'花費'),a=parseAmt(q('amt').value),py=(q('ownnew')&&q('ownnew').value.trim())||st.own;
      if(!(a>0)){q('amt').focus();toast('請輸入金額');return}
      const r0=+S.meta.rate||0,yenAmt=st.cur==='TWD'?(r0?Math.round(a/r0):0):a;if(!(yenAmt>0)){toast('匯率還沒載入，請稍後再試');return}ls.set(T.id+'-pay',st.pay);const data={shop,what,amount:yenAmt,payer:py,split:py?'self':'all',cat:st.cat,day:st.day,itemId:st.itemId,pay:st.pay,cur:st.cur,orig:st.cur==='TWD'?a:0,photos:st.photos};
      closeSheet();if(py){ls.set(T.id+'-payer',py);if(!S.meta.people.includes(py))saveMeta({people:S.meta.people.concat(py)})}
      if(id){const cur=S.exps.get(id)||e,p={};for(const k in data)if((cur[k]==null?'':cur[k])!==data[k])p[k]=data[k];if(Object.keys(p).length)patch('exps',id,p,'已儲存')}
      else{create('exps',Object.assign(data,{ts:Date.now()}));render();toast('已記一筆 '+(st.cur==='TWD'?ntd(a):yen(data.amount))+(shop?'・'+shop:''))}};
    if(!id)setTimeout(()=>q(base.shop?'amt':'shop').focus(),50)})}
const parseAmt=s=>{const v=parseFloat(String(s).replace(/[,，¥円\s]/g,''));return isFinite(v)?Math.round(v):NaN};

function openPrompt(title,label,val,ph,mode,onOk){S.readSheet=false;
  openSheet('<h2>'+esc(title)+'</h2><div class="fld"><label for="p-in">'+esc(label)+'</label><input class="inp" id="p-in" '+(mode?'inputmode="'+mode+'" ':'')+'placeholder="'+esc(ph)+'" value="'+esc(val)+'"></div>'+
   '<div class="btns"><span class="sp"></span><button type="button" class="btn" id="p-cancel">取消</button><button type="button" class="btn pri" id="p-ok">確定</button></div>',
  root=>{const i=root.querySelector('#p-in');setTimeout(()=>i.focus(),50);root.querySelector('#p-cancel').onclick=closeSheet;
    const go=()=>{const v=i.value.trim();if(onOk(v)!==false)closeSheet()};root.querySelector('#p-ok').onclick=go;i.addEventListener('keydown',e=>{if(e.key==='Enter')go()})})}

/* ---------- search ---------- */
function openSearch(){S.readSheet=false;
  openSheet('<h2>搜尋</h2><div class="fld"><label for="s-in">店名、地區、清單、花費</label><input class="inp" id="s-in" type="search" placeholder="例：燒肉、淺草、護照" autocomplete="off"></div><div class="sres" id="s-res"></div>',
  root=>{const i=root.querySelector('#s-in'),out=root.querySelector('#s-res');setTimeout(()=>i.focus(),50);
    const hl=(s,q)=>{const t=esc(s);if(!q)return t;const eq=esc(q).replace(/[.*+?^${}()|[\]\\]/g,'\\$&');return t.replace(new RegExp(eq,'gi'),m=>'<mark>'+m+'</mark>')};
    const run=()=>{const q=i.value.trim().toLowerCase();if(!q){out.innerHTML=recentHTML();return}const res=[];
      const has=(...f)=>f.some(x=>String(x||'').toLowerCase().includes(q));
      for(const it of S.items.values())if(has(it.title,it.area,it.note,it.desc,it.q))res.push({k:'i',id:it.id,t:it.title,w:(it.day?dayLabel(it.day)+'・'+SLOT_L[it.slot]:'口袋名單')+(it.area?'・'+it.area:''),s:it.day*10+(SLOT_I[it.slot]||0)});
      for(const r of S.lists.values())if(has(r.title,r.note))res.push({k:'l',id:r.id,t:r.title,w:'清單・'+(LT_L[r.type]||''),s:900});
      for(const e of S.exps.values())if(has(e.shop,e.what,e.payer))res.push({k:'e',id:e.id,t:(e.shop||e.what)+(e.shop&&e.what?'・'+e.what:''),w:'記帳・'+yen(+e.amount||0)+(e.payer?'・'+e.payer+' 付':'')+(e.day?'・'+md(dayDate(e.day)):''),s:950});
      res.sort((a,b)=>a.s-b.s);
      out.innerHTML=res.length?res.slice(0,40).map(r=>'<button type="button" data-k="'+r.k+'" data-id="'+esc(r.id)+'"><b>'+hl(r.t,i.value.trim())+'</b><span>'+esc(r.w)+'</span></button>').join(''):'<div class="empty">找不到「'+esc(i.value.trim())+'」</div>'};
    i.addEventListener('input',run);run();
    out.addEventListener('click',e=>{const b=e.target.closest('button');if(!b)return;closeSheet();goTo(b.dataset.k,b.dataset.id)})})}
function goTo(k,id){let sel;
  if(k==='i'){const it=S.items.get(id);if(!it)return;setActive(it.day);sel='.item[data-id="'+CSS.escape(id)+'"]'}
  else if(k==='l'){const r=S.lists.get(id);if(!r)return;setActive(r.type==='pack'?0:(r.day||0));sel='[data-lid="'+CSS.escape(id)+'"]'}
  else{const r=S.exps.get(id);if(!r)return;setActive(r.day||0);
    sel='#board [data-eid="'+CSS.escape(id)+'"]'}
  setTimeout(()=>{const el=document.querySelector(sel);if(!el)return;
    if(desk.matches&&k==='i'){const col=el.closest('.col'),b=$('#board');if(col)b.scrollTo({left:col.offsetLeft-b.offsetLeft-16})}
    el.scrollIntoView({block:'center',behavior:'smooth'});el.classList.remove('flash');void el.offsetWidth;el.classList.add('flash')},120)}

function setActive(n,opt){S.active=n;if(window.__onDay)window.__onDay(n);if(window.__fabSync)window.__fabSync();ls.set(T.id+'-day',n);
  document.querySelectorAll('.chip').forEach(c=>c.classList.toggle('active',+c.dataset.day===n));
  document.querySelectorAll('.col').forEach(c=>c.classList.toggle('active',+c.dataset.col===n));
  const chip=document.querySelector('.chip[data-day="'+n+'"]'),st=$('#strip');
  if(chip){const target=chip.offsetLeft-st.offsetLeft-st.clientWidth/2+chip.offsetWidth/2;st.scrollTo({left:target,behavior:'smooth'})}
  if(desk.matches){const col=document.querySelector('.col[data-col="'+n+'"]'),b=$('#board');if(col&&!(opt&&opt.noScroll))b.scrollTo({left:col.offsetLeft-b.offsetLeft-16,behavior:'smooth'})}
  else if(!(opt&&opt.noScroll)){const y=$('.bar-wrap').getBoundingClientRect().top+scrollY-($('#now').hidden?0:0);const hy=$('#app .hero').offsetHeight;if(scrollY>hy)scrollTo({top:hy,behavior:'smooth'})}
  if(!S.drag)renderNow();pushPresence()}

/* ---------- drag & drop ---------- */
function startDrag(e,grip){if(!S.canWrite){toast('你目前只能檢視，不能移動');return}
  if(e.button!=null&&e.button!==0)return;e.preventDefault();if(S.drag)endDrag(true);
  const el=grip.closest('.item'),r=el.getBoundingClientRect();
  const ghost=el.cloneNode(true);ghost.classList.add('ghost');ghost.style.width=r.width+'px';ghost.style.left=r.left+'px';ghost.style.top=r.top+'px';document.body.appendChild(ghost);
  const ph=document.createElement('div');ph.className='ph';ph.style.height=r.height+'px';
  const op=sibItem(el,-1),on=sibItem(el,1);
  el.after(ph);el.classList.add('src');
  S.drag={id:el.dataset.id,el,ghost,ph,grip,pid:e.pointerId,list0:el.parentNode,prev0:op&&op.dataset.id,next0:on&&on.dataset.id,
    dx:e.clientX-r.left,dy:e.clientY-r.top,x:e.clientX,y:e.clientY,sx:e.clientX,sy:e.clientY,moved:false,chip:null,chipT:0,raf:0};
  try{grip.setPointerCapture(e.pointerId)}catch(_){}
  document.body.classList.add('dragging');
  window.addEventListener('pointermove',onDragMove,true);window.addEventListener('pointerup',onDragUp,true);window.addEventListener('pointercancel',onDragCancel,true);
  S.drag.raf=requestAnimationFrame(autoScroll)}
function onDragMove(e){const d=S.drag;if(!d||e.pointerId!==d.pid)return;e.preventDefault();d.x=e.clientX;d.y=e.clientY;
  if(!d.moved&&Math.hypot(d.x-d.sx,d.y-d.sy)>4)d.moved=true;
  d.ghost.style.left=(d.x-d.dx)+'px';d.ghost.style.top=(d.y-d.dy)+'px';hit()}
function hit(){const d=S.drag;const t=document.elementFromPoint(d.x,d.y);if(!t)return;
  const chip=t.closest('.chip');
  if(chip){if(d.chip!==chip){if(d.chip)d.chip.classList.remove('drop');d.chip=chip;chip.classList.add('drop');clearTimeout(d.chipT);
      d.chipT=setTimeout(()=>{if(S.drag&&S.drag.chip===chip){setActive(+chip.dataset.day,{noScroll:true})}},500)}return}
  if(d.chip){d.chip.classList.remove('drop');d.chip=null;clearTimeout(d.chipT)}
  const list=t.closest('.list');if(!list)return;
  const its=[...list.querySelectorAll('.item:not(.src)')];let before=null;
  for(const it of its){const rr=it.getBoundingClientRect();if(d.y<rr.top+rr.height/2){before=it;break}}
  if(before){if(d.ph.nextElementSibling!==before||d.ph.parentNode!==list)list.insertBefore(d.ph,before)}
  else if(d.ph.parentNode!==list||sibItem(d.ph,1))list.appendChild(d.ph)}
function autoScroll(){const d=S.drag;if(!d)return;let moved=false;
  const sb=$('.bar-wrap').getBoundingClientRect().bottom,H=innerHeight;
  if(d.y>sb&&d.y<sb+56&&scrollY>0){scrollBy(0,-12);moved=true}else if(d.y>H-72){scrollBy(0,12);moved=true}
  const st=$('#strip'),str=st.getBoundingClientRect();
  if(d.y>=str.top&&d.y<=str.bottom){if(d.x<str.left+48&&st.scrollLeft>0){st.scrollLeft-=10;moved=true}else if(d.x>str.right-48&&st.scrollLeft<st.scrollWidth-st.clientWidth){st.scrollLeft+=10;moved=true}}
  if(desk.matches){const b=$('#board'),br=b.getBoundingClientRect();
    if(d.x<br.left+64&&b.scrollLeft>0){b.scrollLeft-=16;moved=true}else if(d.x>br.right-64&&b.scrollLeft<b.scrollWidth-b.clientWidth){b.scrollLeft+=16;moved=true}}
  if(moved)hit();d.raf=requestAnimationFrame(autoScroll)}
function onDragUp(e){if(S.drag&&e.pointerId===S.drag.pid)endDrag(false)}
function onDragCancel(e){if(S.drag&&e.pointerId===S.drag.pid)endDrag(true)}
function sibItem(el,dir){let s=dir<0?el.previousElementSibling:el.nextElementSibling;while(s&&(!s.classList.contains('item')||s.classList.contains('src')))s=dir<0?s.previousElementSibling:s.nextElementSibling;return s}
function endDrag(cancel){const d=S.drag;if(!d)return;
  window.removeEventListener('pointermove',onDragMove,true);window.removeEventListener('pointerup',onDragUp,true);window.removeEventListener('pointercancel',onDragCancel,true);
  try{d.grip.releasePointerCapture(d.pid)}catch(_){}
  cancelAnimationFrame(d.raf);clearTimeout(d.chipT);
  let tgt=null;const it=S.items.get(d.id);
  if(!cancel&&d.moved&&it){
    if(d.chip){const day=+d.chip.dataset.day;const slot=day===0?'pool':(it.slot==='pool'?(it.kind==='food'?'lunch':'afternoon'):it.slot);
      tgt=day===it.day?null:{day,slot,order:maxOrder(day,slot)+1000}}
    else if(d.ph.parentNode&&d.ph.parentNode.classList.contains('list')){const list=d.ph.parentNode,day=+list.dataset.day,slot=list.dataset.slot;
      const p=sibItem(d.ph,-1),n=sibItem(d.ph,1);
      const same=list===d.list0&&(p&&p.dataset.id)===d.prev0&&(n&&n.dataset.id)===d.next0;
      if(!same){const pi=p&&S.items.get(p.dataset.id),ni=n&&S.items.get(n.dataset.id);const po=pi?pi.order:null,no=ni?ni.order:null;
        const order=po!=null&&no!=null?(po+no)/2:po!=null?po+1000:no!=null?no-1000:1000;tgt={day,slot,order}}}}
  if(d.chip)d.chip.classList.remove('drop');
  d.ghost.remove();d.ph.remove();d.el.classList.remove('src');document.body.classList.remove('dragging');
  S.drag=null;
  if(tgt)moveItem(d.id,tgt.day,tgt.slot,tgt.order);
  else if(S.dirty)render();
  else renderNow()}

/* ---------- events ---------- */
document.addEventListener('pointerdown',e=>{const g=e.target.closest('.grip');if(g)startDrag(e,g)});
document.addEventListener('click',e=>{const t=e.target;let el;
  if(S.lpFired){S.lpFired=false;e.preventDefault();return}
  if(S.drag||!t.isConnected||t.closest('#layer')||t.closest('a'))return;
  if(t.closest('#mbar')){openMoney();return}
  if((el=t.closest('[data-exp-day]'))){openExp(null,{day:+el.dataset.expDay});return}
  if((el=t.closest('[data-todo-day]'))){openTodoAdd(+el.dataset.todoDay);return}
  if(t.closest('#search-btn')){openSearch();return}
  if((el=t.closest('.chip'))){setActive(+el.dataset.day);return}
  if((el=t.closest('.now-done'))){const it=S.items.get(el.dataset.id);if(it)patch('items',it.id,{done:true},'已完成「'+it.title+'」');return}
  if((el=t.closest('.lchk'))){const id=el.closest('.crow').dataset.lid,r=S.lists.get(id);if(r)patch('lists',id,{done:!r.done});return}
  if((el=t.closest('.chk'))&&el.closest('.item')){const id=el.closest('.item').dataset.id,it=S.items.get(id);if(it)patch('items',id,{done:!it.done});return}
  if((el=t.closest('.ithumbs img'))){lightbox(el.src);return}
  if((el=t.closest('.ibody'))){openEdit(el.closest('.item').dataset.id);return}
  if((el=t.closest('.lbody'))){openListEdit(el.closest('.crow').dataset.lid);return}
  if((el=t.closest('.ebody'))){openExp(el.closest('.erow').dataset.eid);return}
  if((el=t.closest('.slot-add'))){openAdd({day:+el.dataset.day,slot:el.dataset.slot});return}
  if((el=t.closest('[data-edit-day]'))){openDayTitle(+el.dataset.editDay);return}
  if(t.closest('#fab')){if(S.tab==='money')openExp(null);else openAdd({day:S.active,slot:S.active===0?'pool':null});return}
  const c=t.closest('.col');if(c&&desk.matches&&+c.dataset.col!==S.active)setActive(+c.dataset.col,{noScroll:true})});
document.addEventListener('keydown',e=>{if((e.key==='Enter'||e.key===' ')&&e.target.classList&&e.target.classList.contains('ibody')){e.preventDefault();openEdit(e.target.closest('.item').dataset.id)}});
document.addEventListener('submit',e=>{const f=e.target;e.preventDefault();if(!canWrite())return;
  if(f.classList.contains('addrow')){const i=f.querySelector('input'),v=i.value.trim();if(!v)return;
    const lines=v.split(/[\n]+/).map(s=>s.trim()).filter(Boolean);const nids=lines.map((l,k)=>create('lists',{type:f.dataset.type,title:l,note:'',done:false,day:+f.dataset.day||0,photos:[],ts:Date.now()+k,order:Date.now()+k}));setTimeout(()=>flashNew(nids),0);
    const iid=i.id;i.value='';render();const ni=document.getElementById(iid);if(ni){ni.value='';ni.focus({preventScroll:true})}}
});
desk.addEventListener('change',()=>render());
$('#cam-file').addEventListener('change',async e=>{const inp=e.target,files=[...inp.files],id=S.camFor;inp.value='';if(!files.length||!id||!S.assets)return;
  toast('照片上傳中…');let n=0;
  for(const f of files){try{const blob=await compress(f);const r=await S.assets.upload(blob,{contentType:blob.type||f.type});S.assetUrl[r.id]=r.url;
      const cur=S.items.get(id);if(!cur)break;const ids=(cur.photos||[]).concat(r.id);S.items.set(id,Object.assign({},cur,{photos:ids}));queue('items'+id,()=>ref('items',id).update({photos:ids}));n++;render()}
    catch(err){const c=err&&err.code;toast(c==='quota_exceeded'?'空間滿了，先刪掉幾張照片':c==='not_granted'?'你沒有上傳權限':'照片上傳失敗，請再試一次');return}}
  if(n)toast('已加 '+n+' 張照片')});

/* ---------- quick actions (long-press / right-click) ---------- */
const AI={done:'<path d="m4 10 4 4 8-9"/>',map:'<path d="M10 18s6-5.6 6-10.3A6 6 0 0 0 4 7.7C4 12.4 10 18 10 18z"/><circle cx="10" cy="7.8" r="2.2"/>',staff:'<rect x="3" y="3" width="14" height="14" rx="2"/><path d="M7 8h6M7 12h4"/>',exp:'<path d="M5 3l5 6 5-6M10 9v8M6.5 10h7M6.5 13h7"/>',cam:'<path d="M3 7h3l1.5-2.5h5L14 7h3v9H3z"/><circle cx="10" cy="11" r="3"/>',edit:'<path d="M4 16h3l9-9-3-3-9 9zM11.5 5.5l3 3"/>',del:'<path d="M4 6h12M8 6V4h4v2M6 6l1 11h6l1-11"/>'};
const aico=k=>'<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">'+AI[k]+'</svg>';
function openActions(id){const it=S.items.get(id);if(!it)return;const place=PLACE_KINDS.includes(it.kind),w=S.canWrite;S.readSheet=!w;
  const b=(k,l,cls)=>'<button type="button" class="abtn'+(cls?' '+cls:'')+'" data-act="'+k+'">'+aico(k)+l+'</button>';
  openSheet('<h2>'+esc(it.title)+'</h2><div class="acts">'+
    (place||safeUrl(it.map)?'<a class="abtn" href="'+esc(mapUrl(it))+'" target="_blank" rel="noopener" data-act="map">'+aico('map')+'開 Google 地圖</a>':'')+
    (place?b('staff','給店員／司機看'):'')+
    (w&&place?b('exp','在這裡記一筆'):'')+(w&&place&&S.assets?b('cam','加照片'):'')+
    b('edit',w?'編輯詳細內容':'看詳細內容')+(w?b('del','刪除','danger'):'')+'</div>'+
    (w?'<div class="fld"><span class="lbl">移到別天</span>'+daySeg(it.day,true)+'</div>':''),
  root=>{root.addEventListener('click',e=>{const a=e.target.closest('[data-act]');if(!a)return;const k=a.dataset.act;if(k==='map'){closeSheet();return}e.stopPropagation();
      if(k==='done'){closeSheet();patch('items',id,{done:!it.done},it.done?'已取消完成':'已完成「'+it.title+'」')}
      else if(k==='staff'){closeSheet();showStaff(it)}
      else if(k==='exp'){closeSheet();openExp(null,{shop:it.title,day:it.day,cat:KIND2CAT[it.kind]||'other',itemId:it.id})}
      else if(k==='cam'){closeSheet();S.camFor=id;$('#cam-file').click()}
      else if(k==='edit'){openEdit(id)}
      else if(k==='del'){closeSheet();remove('items',id,it.title)}});
    bindSeg(root,'seg-day',v=>{const n=+v;if(n===it.day)return;const slot=n===0?'pool':(it.slot==='pool'?(it.kind==='food'?'lunch':'afternoon'):it.slot);closeSheet();moveItem(id,n,slot,maxOrder(n,slot)+1000)})})}
function showStaff(it){if(!it)return;const jp=(it.q||'').trim()||it.title;const d=document.createElement('div');d.className='staff';d.setAttribute('role','dialog');d.setAttribute('aria-label','給店員看');
  d.innerHTML='<span class="s-l">請帶我去這裡</span><div class="s-n"></div><div class="s-a"></div><div class="s-p">すみません、ここに行きたいです。</div><div class="btns"><a class="btn map-big" target="_blank" rel="noopener">'+PIN+'Google 地圖</a><button type="button" class="btn pri" id="staff-x">關閉</button></div>';
  d.querySelector('.s-n').textContent=jp;d.querySelector('.s-a').textContent=it.area||'';d.querySelector('a').href=mapUrl(it);
  d.querySelector('#staff-x').onclick=()=>d.remove();document.body.appendChild(d)}
/* long-press a card on touch screens */
let lp=null;
document.addEventListener('pointerdown',e=>{if(e.pointerType!=='touch'||S.drag)return;const it=e.target.closest('.item');if(!it||e.target.closest('.grip,a,button:not(.ibody)'))return;
  lp={id:it.dataset.id,x:e.clientX,y:e.clientY,t:setTimeout(()=>{if(!lp||$('#scrim'))return;S.lpFired=true;openActions(lp.id);lp=null},520)}},true);
const lpCancel=e=>{if(lp&&(e.type!=='pointermove'||Math.hypot(e.clientX-lp.x,e.clientY-lp.y)>10)){clearTimeout(lp.t);lp=null}};
['pointermove','pointerup','pointercancel'].forEach(t=>document.addEventListener(t,lpCancel,true));
document.addEventListener('contextmenu',e=>{const it=e.target.closest('.item');if(!it||e.target.closest('a'))return;e.preventDefault();if(lp){clearTimeout(lp.t);lp=null}if(!$('#scrim'))openActions(it.dataset.id)});
/* swipe left / right on the itinerary to change days */
let sw=null;
$('#board').addEventListener('touchstart',e=>{if(S.drag||e.touches.length!==1||e.target.closest('.grip,input,textarea,.pretabs,.viewseg,.ithumbs,.dstrip,.strip')||S.active===0)return;const t=e.touches[0];sw={x:t.clientX,y:t.clientY,at:Date.now()}},{passive:true});
$('#board').addEventListener('touchend',e=>{if(!sw||S.drag){sw=null;return}const t=e.changedTouches[0],dx=t.clientX-sw.x,dy=t.clientY-sw.y,dt=Date.now()-sw.at;sw=null;
  if(Math.abs(dx)>70&&Math.abs(dx)>2*Math.abs(dy)&&dt<700)stepDay(dx<0?1:-1)},{passive:true});
function stepDay(d){const n=Math.min(NDAYS,Math.max(0,S.active+d));if(n===S.active)return;setActive(n);
  const c=$('.col.active');if(c){c.classList.remove('slide-l','slide-r');void c.offsetWidth;c.classList.add(d>0?'slide-l':'slide-r')}}
/* keyboard: ← → change day, N add, / search */
document.addEventListener('keydown',e=>{if(e.defaultPrevented||e.metaKey||e.ctrlKey||e.altKey||$('#scrim')||$('.staff')||$('.lb'))return;const tg=e.target;if(tg&&(tg.isContentEditable||/^(INPUT|TEXTAREA|SELECT)$/.test(tg.tagName)))return;
  if(e.key==='ArrowRight'){e.preventDefault();stepDay(1)}else if(e.key==='ArrowLeft'){e.preventDefault();stepDay(-1)}
  else if(e.key==='n'||e.key==='N'){if(S.canWrite){e.preventDefault();openAdd({day:S.active,slot:S.active===0?'pool':null})}}
  else if(e.key==='/'){e.preventDefault();openSearch()}});
document.addEventListener('keydown',e=>{if(e.key==='Escape'){const st=$('.staff');if(st)st.remove()}});
/* offline: keep the last synced trip in this browser so it opens without signal */
const CK=T.id+'-cache-v1';let cacheT=0;
function saveCache(){if(!S.synced)return;clearTimeout(cacheT);cacheT=setTimeout(()=>{try{localStorage.setItem(CK,JSON.stringify({at:Date.now(),items:[...S.items.values()],days:[...S.days.entries()],lists:[...S.lists.values()],exps:[...S.exps.values()],meta:S.meta}))}catch(e){}},800)}
function loadCache(){try{const c=JSON.parse(localStorage.getItem(CK)||'null');if(!c||!Array.isArray(c.items))return null;
  S.items=new Map(c.items.map(x=>[x.id,x]));S.days=new Map(c.days||[]);S.lists=new Map((c.lists||[]).map(x=>[x.id,x]));S.exps=new Map((c.exps||[]).map(x=>[x.id,x]));if(c.meta)S.meta=c.meta;return c}catch(e){return null}}
addEventListener('offline',()=>{setSync('off','離線中');toast('沒有網路，先顯示上次的行程',null,4000)});
addEventListener('online',()=>{if(S.db)setSync(S.canWrite?'live':'ro',S.canWrite?'即時同步':'只能檢視')});

/* ---------- site extras: daily weather, live exchange rate, "how to get there" (runs inside __bootTrip) ---------- */
const XLS={get(k){try{return JSON.parse(localStorage.getItem(k)||'null')}catch(e){return null}},set(k,v){try{localStorage.setItem(k,JSON.stringify(v))}catch(e){}}};
const ymd=d=>d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0');

/* weather: Open-Meteo (free, no key). Within 16 days of today → forecast; otherwise → same dates last year as a hint. */
const WXI=c=>c===0?['☀️','晴']:c<=2?['🌤️','晴時多雲']:c===3?['☁️','陰']:c<=48?['🌫️','霧']:c<=57?['🌦️','毛毛雨']:c<=67?['🌧️','雨']:c<=77?['🌨️','雪']:c<=82?['🌧️','陣雨']:c<=86?['🌨️','陣雪']:['⛈️','雷雨'];
const WX={days:{},kind:''};
/* a forecast day that looks wet (rain/snow code, or ≥50% chance) says so: "☂ 70%・記得帶傘" */
const wxWet=w=>w&&w.kind!=='past'&&(w.c>=51||(w.p!=null&&w.p>=50));
function wxChip(n){const w=WX.days[ymd(dayDate(n))];if(!w)return '';const [ic,lb]=WXI(w.c),past=w.kind==='past',wet=wxWet(w);
  return '<span class="wx'+(past?' wx-past':' wx-fc')+(wet?' wx-wet':'')+'" title="'+(past?'去年同一天的天氣，僅供參考':'天氣預報（出發前 16 天內會自動更新）')+'"><small>'+(past?'去年':'預報')+'</small><i aria-hidden="true">'+ic+'</i>'+lb+' '+Math.round(w.hi)+'°/'+Math.round(w.lo)+'°'+
    (wet?' <b>☂'+(w.p!=null?' '+w.p+'%':'')+'・記得帶傘</b>':w.p!=null&&!past?' <small>☂'+w.p+'%</small>':'')+'</span>'}
async function loadWeather(){
  if(!T.dest&&!(T.lat&&T.lon))return;
  const key=T.id+'-wx2',c=XLS.get(key);if(c&&Date.now()-c.at<3*36e5){Object.assign(WX,c.wx);render();return}
  try{
    let lat=T.lat,lon=T.lon;
    if(!(lat&&lon)){const g=XLS.get(T.id+'-geo');if(g&&g.q===T.dest){lat=g.lat;lon=g.lon}else{
      const r=await (await fetch('https://geocoding-api.open-meteo.com/v1/search?count=1&language=zh&format=json&name='+encodeURIComponent(T.dest))).json();
      const p=r.results&&r.results[0];if(!p)return;lat=p.latitude;lon=p.longitude;XLS.set(T.id+'-geo',{q:T.dest,lat,lon})}}
    const first=dayDate(1),last=dayDate(NDAYS),t0=now();t0.setHours(0,0,0,0);const lim=new Date(t0);lim.setDate(lim.getDate()+15);
    if(last<t0)return;
    const q='latitude='+lat+'&longitude='+lon+'&timezone=auto&daily=weather_code,temperature_2m_max,temperature_2m_min';
    const days={},put=(d,shift,kind)=>{if(!d||!d.time)return;d.time.forEach((t,i)=>{if(d.temperature_2m_max[i]==null)return;let k=t;if(shift){const x=new Date(t+'T00:00:00');x.setFullYear(x.getFullYear()+1);k=ymd(x)}
      days[k]={c:d.weather_code[i],hi:d.temperature_2m_max[i],lo:d.temperature_2m_min[i],p:d.precipitation_probability_max?d.precipitation_probability_max[i]:null,kind}})};
    // last year's same dates for every day (a hint), then the real forecast on top for days within 16 days
    {const a=new Date(first),b=new Date(last);a.setFullYear(a.getFullYear()-1);b.setFullYear(b.getFullYear()-1);
      try{put((await (await fetch('https://archive-api.open-meteo.com/v1/archive?'+q+'&start_date='+ymd(a)+'&end_date='+ymd(b))).json()).daily,1,'past')}catch(e){}}
    if(first<=lim){const s0=first<t0?t0:first,e0=last<lim?last:lim;
      try{put((await (await fetch('https://api.open-meteo.com/v1/forecast?'+q+',precipitation_probability_max&start_date='+ymd(s0)+'&end_date='+ymd(e0))).json()).daily,0,'fc')}catch(e){}}
    WX.days=days;XLS.set(key,{at:Date.now(),wx:{days}});render();
  }catch(e){}
}

/* exchange rate: open.er-api.com (free, no key), refreshed at most every 6 hours. Manual rate wins when the trip turned auto off. */
const FX={rate:0,at:''};
function applyFx(){if(S.meta.rateAuto!==false&&FX.rate){S.meta.rate=FX.rate}}
async function loadFx(){
  const c=XLS.get('fx-JPY-TWD');if(c&&Date.now()-c.got<6*36e5){Object.assign(FX,c);applyFx();render();return}
  try{const r=await (await fetch('https://open.er-api.com/v6/latest/JPY')).json();const v=r&&r.rates&&r.rates.TWD;if(!(v>0))return;
    FX.rate=Math.round(v*10000)/10000;FX.at=new Date(r.time_last_update_unix*1000).toLocaleDateString('zh-TW',{month:'numeric',day:'numeric'});
    XLS.set('fx-JPY-TWD',{rate:FX.rate,at:FX.at,got:Date.now()});applyFx();render()}catch(e){}
}
const fxLabel=()=>S.meta.rateAuto!==false&&FX.rate?'（自動・'+FX.at+'）':(S.meta.rateAuto===false?'（手動）':'');

/* how to get there: link from each place to the next place of the same day (Google Maps transit directions) */
let NEXT={},FIRST=new Set();
// a stop needs a real location (area / map search / map link); things like 飛機餐 don't
const isStop=i=>PLACE_KINDS.includes(i.kind)&&!!(i.area||i.q||safeUrl(i.map))&&!!placeQuery(i);
const HOTEL=()=>T.hotel?(T.hotel.q||T.hotel.name||''):'';
const transit=(a,b)=>'https://www.google.com/maps/dir/?api=1&travelmode=transit&origin='+encodeURIComponent(a)+'&destination='+encodeURIComponent(b);
function buildNext(){NEXT={};FIRST=new Set();for(let n=1;n<=NDAYS;n++){const ps=dayItems(n).filter(isStop);if(ps[0]&&n>1&&HOTEL())FIRST.add(ps[0].id);for(let i=0;i<ps.length-1;i++)NEXT[ps[i].id]=ps[i+1]}}
function goNext(it){return ''}
/* today's route starts from the hotel (Google Maps can't do transit with several stops, so this one is the overview) */
function routeUrlH(n){const ps=dayItems(n).filter(isStop).map(placeQuery).filter(Boolean);
  const seen=new Set(),u=ps.filter(p=>!seen.has(p)&&seen.add(p)).slice(0,9);if(!u.length)return '';
  const all=(n>1&&HOTEL()?[HOTEL()]:[]).concat(u);if(all.length===1)return 'https://www.google.com/maps/search/?api=1&query='+encodeURIComponent(all[0]);
  return 'https://www.google.com/maps/dir/'+all.map(encodeURIComponent).join('/')}
/* 今日路線: a sheet with every leg of the day as a one-tap transit route, plus the whole-day overview */
function openRoute(n){
  const ps=dayItems(n).filter(isStop),seen=new Set(),stops=ps.filter(i=>{const q=placeQuery(i);return !seen.has(q)&&seen.add(q)});
  const H=n>1&&n<NDAYS+1&&HOTEL()?{title:'飯店',q:HOTEL()}:null,pts=stops.map(i=>({title:i.title,q:placeQuery(i)}));
  const legs=[];const seq=(H?[H]:[]).concat(pts).concat(H&&n<NDAYS?[{title:'回飯店',q:H.q}]:[]);
  for(let i=0;i<seq.length-1;i++)legs.push([seq[i],seq[i+1]]);
  const row=(a,b)=>'<a class="leg" href="'+esc(transit(a.q,b.q))+'" target="_blank" rel="noopener"><span class="leg-i">🚃</span><span class="leg-t"><b>'+esc(a.title)+'</b><span class="leg-a">→</span><b>'+esc(b.title)+'</b></span><span class="leg-go">路線</span></a>';
  openSheet('<h2>Day '+n+' 怎麼走</h2><p class="hint2">每一段點下去會打開 Google 地圖的電車路線。</p>'+
    (S.sample&&S.canWrite&&dayItems(n).filter(i=>PLACE_KINDS.includes(i.kind)).length>=3?'<button type="button" class="btn ai" id="ord-ai" data-day="'+n+'">✨ 幫我排順序</button><div id="ord-box"></div>':'')+
    (legs.length?'<div class="legs">'+legs.map(([a,b])=>row(a,b)).join('')+'</div>':'<div class="empty">這天還沒有地點</div>')+
    (routeUrlH(n)?'<a class="btn block leg-all" href="'+esc(routeUrlH(n))+'" target="_blank" rel="noopener">🗺️ 看整天全貌（多點地圖）</a>':''))}
document.addEventListener('click',e=>{const a=e.target.closest&&e.target.closest('a.route[data-rd]');if(!a)return;e.preventDefault();e.stopPropagation();openRoute(+a.dataset.rd)},true);

/* money extras: payment method + budget */
const PAYS=[['cash','現金'],['card','信用卡'],['ic','Suica／IC卡'],['other','其他']],PAY_L=Object.fromEntries(PAYS);
function budgetHTML(total,rate){const bud=+S.meta.budget||0,pre=[...S.exps.values()].filter(e=>!(e.day>0)).reduce((s,e)=>s+(+e.amount||0),0),split=pre&&total?'<div class="pre-split"><span>出發前 '+ntd(pre*rate)+'</span><span>旅途中 '+ntd((total-pre)*rate)+'</span></div>':'';
  return split}  /* 預算功能已移除（11/04 她說不需要） */
function budgetHTML0(total,rate,bud){
  if(!bud)return S.canWrite?'<button type="button" class="linkbtn budget-set" id="budget-btn">＋ 設定旅費預算</button>':'';
  const pct=Math.round(total/bud*100),left=bud-total;
  return '<div class="budget'+(pct>=100?' over':pct>=80?' warn':'')+'"><div class="bud-top"><span>預算 '+ntd(bud*rate)+'（'+yen(bud)+'）</span><button type="button" class="linkbtn" id="budget-btn">修改</button></div>'+
    '<div class="bud-bar"><i style="width:'+Math.min(100,pct)+'%"></i></div>'+
    '<div class="bud-sub">已用 '+pct+'%・'+(left>=0?'還剩 '+ntd(left*rate)+'（≈ '+yen(left)+'）':'超支 '+ntd(-left*rate))+'</div></div>'}
document.addEventListener('click',e=>{const b=e.target.closest&&e.target.closest('#budget-btn');if(!b)return;e.preventDefault();e.stopPropagation();if(!canWrite())return;
  openPrompt('旅費預算','整趟預算（日圓，留空＝不設）',S.meta.budget?String(S.meta.budget):'','例 300000','decimal',v=>{const t=String(v).trim();if(!t){saveMeta({budget:0});setTimeout(openMoney,0);return}
    const n=parseAmt(t);if(!(n>0)){toast('請輸入金額');return false}saveMeta({budget:Math.round(n)});toast('已設定預算 '+yen(Math.round(n)));setTimeout(openMoney,0)})},true);
window.__wxReload=()=>{try{localStorage.removeItem(T.id+'-wx2')}catch(e){}return loadWeather()};
/* add straight into 口袋名單 */
document.addEventListener('submit',e=>{const f=e.target.closest&&e.target.closest('form.pooladd');if(!f)return;e.preventDefault();e.stopPropagation();
  const i=f.querySelector('input'),t=i.value.trim();if(!t){i.focus();return}i.value='';
  addItems([{day:0,slot:'pool',kind:/餐|食|麵|丼|拉麵|咖啡|cafe|café|甜點|燒肉|壽司|bar/i.test(t)?'food':/店|買|shop|百貨|藥妝/i.test(t)?'shop':'spot',title:t}])},true);
/* 出發前花費: expenses with no trip day (day 0) — tickets, insurance, SIM… */
function preMoneyHTML(){const rate=+S.meta.rate||0,ex=[...S.exps.values()].filter(e=>!(e.day>0)).sort((a,b)=>(a.ts||0)-(b.ts||0)),sum=ex.reduce((s,e)=>s+(+e.amount||0),0);
  return '<section class="dsec" data-sec="money"><div class="dsec-h"><b>出發前花費</b>'+(sum?'<span class="dsum">'+ntd(sum*rate)+'</span><small>≈ '+yen(sum)+'</small>':'')+'<button type="button" class="slot-add" data-exp-day="0" aria-label="記一筆出發前花費">＋ 記一筆</button></div>'+
    (ex.length?'<div class="drows">'+ex.map(e=>eRow(e,rate)).join('')+'</div>':'<p class="pool-help">機票、住宿訂金、旅平險、網卡、門票…出國前先付的錢記在這裡，會一起算進總花費。可以直接記台幣。</p>')+'</section>'}
/* expenses entered in NT$ keep their NT$ amount; the yen figure is recomputed from today's rate */
function fixTwd(){const r=+S.meta.rate||0;if(!r)return;for(const e of S.exps.values())if(e.cur==='TWD'&&+e.orig>0)e.amount=Math.round(+e.orig/r)}
/* drag to reorder pre-trip checklist rows (grip on the right). Saves an `order` between the new neighbours. */
const lkey=r=>r.order!=null?+r.order:(+r.ts||0);
document.addEventListener('pointerdown',e=>{const g=e.target.closest&&e.target.closest('.lgrip');if(!g||!S.canWrite)return;
  const li=g.closest('.crow'),ul=li&&li.parentNode;if(!ul)return;e.preventDefault();e.stopPropagation();
  li.classList.add('ldrag');document.body.classList.add('ldragging');let lastY=e.clientY,raf=0;
  const rows=()=>[...ul.children].filter(x=>x.dataset.lid&&!x.classList.contains('done'));
  const move=ev=>{lastY=ev.clientY;ev.preventDefault();
    for(const o of rows()){if(o===li)continue;const r=o.getBoundingClientRect();
      if(lastY>r.top&&lastY<r.bottom){if(lastY<r.top+r.height/2)ul.insertBefore(li,o);else ul.insertBefore(li,o.nextSibling);break}}
    const vh=innerHeight;cancelAnimationFrame(raf);if(lastY<90||lastY>vh-90){const step=()=>{scrollBy(0,lastY<90?-10:10);raf=requestAnimationFrame(step)};raf=requestAnimationFrame(step)}};
  const up=()=>{removeEventListener('pointermove',move);removeEventListener('pointerup',up);removeEventListener('pointercancel',up);cancelAnimationFrame(raf);
    li.classList.remove('ldrag');document.body.classList.remove('ldragging');if(!li.isConnected)return;
    const rs=rows(),i=rs.indexOf(li),get=x=>x&&S.lists.get(x.dataset.lid),me=get(li),pv=get(rs[i-1]),nx=get(rs[i+1]);if(!me)return;
    const kp=pv?lkey(pv):null,kn=nx?lkey(nx):null,cur=lkey(me);
    if((kp==null||kp<cur)&&(kn==null||cur<kn))return;
    const order=kp!=null&&kn!=null?(kp+kn)/2:kp!=null?kp+1000:kn-1000;
    patch('lists',me.id,{order})};
  addEventListener('pointermove',move,{passive:false});addEventListener('pointerup',up);addEventListener('pointercancel',up)},true);
/* 出發前, like the Reminders app: a home page with smart lists (今天・有日期・全部・已完成) and 我的清單 (待辦・行李・口袋・花費).
   Tap one to open it; ‹ 出發前 goes back. 待辦 holds every to-do, booking, ticket and thing to buy (a small tag says which); 筆記 = a to-do that needs no tick.
   In 待辦／行李, tap ＋ 新增 at the bottom and type: Enter adds it and opens the next line. Details (date, note, photos) → tap the row. */
const PRE_VIEWS=['home','list','notes','bag','pool','money','s-today','s-dated','s-all','s-done'];
function preTab(){let v='';try{v=localStorage.getItem(T.id+'-pretab')||''}catch(e){}return v==='notes'?'pool':v==='money'?'list':PRE_VIEWS.includes(v)&&v!=='home'&&!v.startsWith('s-')?v:'list'}
function setPreTab(v){try{localStorage.setItem(T.id+'-pretab',v)}catch(x){}render();window.scrollTo&&setTimeout(()=>{const c=document.querySelector('.col[data-col="0"]');if(c&&c.getBoundingClientRect().top<0)c.scrollIntoView({block:'start'})},0)}
const TODO_TYPES=['todo','book','ticket','buy'];
const isTodoRow=r=>!r.nochk&&TODO_TYPES.includes(r.type)&&r.type!=='buy'&&(r.type==='book'||r.type==='ticket'||!(r.day>0));
const isNote=r=>(!!r.nochk||r.type==='buy')&&!(r.day>0);  /* 口袋 also holds 購物 (things to buy, no date yet) */
const ltag=r=>r.nochk?['筆記','k-note']:r.type==='buy'?['想'+'買','k-shop']:r.type==='ticket'?['票券','k-food']:r.type==='book'?['訂位','k-spot']:r.type==='todo'?['待辦','k-todo']:null;  /* same tags as 今日要辦 */  /* the tag says the 類型 picked in the sheet */  /* 購物 written in two parts: the build turns the literal word into 購物 */
function listRowX(r,showDate){const tg=ltag(r);return '<li class="crow'+(r.done?' done':'')+(r.nochk?' nochk':'')+'" data-lid="'+esc(r.id)+'">'+
  (r.nochk?'<span class="nochk-dot" aria-hidden="true"></span>':'<button type="button" class="ibtn chk lchk" aria-label="打勾" aria-pressed="'+(r.done?'true':'false')+'">✓</button>')+
  '<button type="button" class="cbody lbody lx">'+(tg?'<span class="kind ltype '+tg[1]+'">'+tg[0]+'</span>':'')+
  '<span class="ct">'+esc(r.title)+'</span>'+(()=>{const dt=showDate!==false&&r.day>0?md(dayDate(r.day))+'（'+WK[dayDate(r.day).getDay()]+'）':'',m=[dt,r.note||''].filter(Boolean).join('・');return m?'<span class="cn">'+esc(m)+'</span>':''})()+thumbs(r.photos)+'</button></li>'}  /* line 1: tag + name; line 2: date・note */
const rowSort=(a,b)=>(a.done-b.done)||((a.day>0?a.day:99)-(b.day>0?b.day:99))||((a.order||a.ts||0)-(b.order||b.ts||0));
/* one rule for adding: the floating ＋ only (she found three different 「＋ 新增」 rows confusing) — no add row inside the lists */
function addLine(where){return ''}
function smartRows(k){const tn=todayN(),all=[...S.lists.values()];
  return k==='s-today'?all.filter(r=>!r.done&&!r.nochk&&tn>=1&&r.day===tn):k==='s-dated'?all.filter(r=>!r.done&&!r.nochk&&r.day>0):k==='s-done'?all.filter(r=>r.done):all.filter(r=>!r.done&&!r.nochk)}
const SMART=[['s-today','今天','calendar'],['s-dated','有日期','calendar-event'],['s-all','全部','list'],['s-done','已完成','check']];
function preTabsHTML(){const cur=preTab();document.body.dataset.pt=cur;setTimeout(fabSync,0);
  const todos=[...S.lists.values()].filter(isTodoRow),pack=[...S.lists.values()].filter(r=>r.type==='pack'),pool=[...S.items.values()].filter(i=>i.day===0);
  const exN=[...S.exps.values()].filter(e=>!(e.day>0)).length;
  const notes=[...S.lists.values()].filter(isNote);
  /* by how often you use them before a trip: tick-off lists first, planning next, money, then reference notes */
  /* 口袋 = places you want to go (can be put on a day) + notes (no tick) — both are 'things noted for later' */
  const MY=[['list','待辦','green',todos.filter(r=>!r.done).length],['bag','行李','water',pack.filter(r=>!r.done).length],['pool','口袋','yellow',pool.length+notes.length]];  /* 花費 lives in 旅費 (the pill) now */
  const ICO={notes:PK_ICO.note,list:PK_ICO.todo,bag:PK_ICO.pack,pool:PK_ICO.pool,money:PK_ICO.money};
  const NAME={notes:'筆記',list:'待辦',bag:'行李',pool:'口袋名單',money:'出發前花費','s-today':'今天','s-dated':'有日期','s-all':'全部','s-done':'已完成'};
  /* one row of five tabs — tap to switch, nothing to go back from */
  let h='<div class="pretabs2" role="tablist">'+MY.map(([k,l,c,n])=>'<button type="button" role="tab" data-pre="'+k+'" aria-selected="'+(k===cur)+'">'+l+(n?'<i>'+n+'</i>':'')+'</button>').join('')+'</div>';
  h+='<section class="dsec" data-sec="list"><ul class="clist">'+todos.sort(rowSort).map(r=>listRowX(r)).join('')+addLine('list')+'</ul>'+(todos.length?'':'<p class="pool-help">要做的事、要訂的位、要買的東西、筆記，都放這裡。</p>')+'</section>';
  {const KT={food:'美食',spot:'景點',shop:'購物',fac:'設施',stay:'住宿',move:'交通'},key=x=>x.ts||x._at||x.order||0;
    const KO=['food','spot','shop','fac','stay','move'],kg=k=>{const n=KO.indexOf(k||'spot');return n<0?1:n};
    const rows=pool.map(i=>({g:kg(i.kind),t:key(i),h:'<li class="crow pk-item" data-iid="'+esc(i.id)+'"><span class="nochk-dot" aria-hidden="true"></span><button type="button" class="cbody lbody lx"><span class="kind ltype k-'+esc(i.kind||'spot')+'">'+(KT[i.kind]||'景點')+'</span>'+(i.must?'<span class="must">★</span>':'')+'<span class="ct">'+esc(i.title)+'</span>'+(i.note?'<span class="cn">'+esc(i.note)+'</span>':'')+thumbs(i.photos)+'</button></li>'}))
      .concat(notes.map(r=>({g:r.type==='buy'||r.kind==='buy'?10:11,t:r.order||r.ts||0,h:listRowX(r,false)})));
    h+='<section class="dsec" data-sec="pocket">'+(rows.length?'<ul class="clist">'+rows.sort((a,b)=>a.g-b.g||a.t-b.t).map(x=>x.h).join('')+'</ul>':'<p class="pool-help">想去的店、景點、購物的、要記的事，按 ＋ 加進來。</p>')+'</section>'}
  h+='<section class="dsec" data-sec="notes"><ul class="clist">'+notes.sort((a,b)=>(a.order||a.ts||0)-(b.order||b.ts||0)).map(r=>listRowX(r,false)).join('')+addLine('notes')+'</ul>'+''+'</section>';
  h+='<section class="dsec" data-sec="bag"><ul class="clist">'+pack.sort(rowSort).map(r=>listRowX(r,false)).join('')+addLine('bag')+'</ul></section>';
  if(cur.startsWith('s-')){const rows=smartRows(cur).sort(rowSort);h+='<section class="dsec" data-sec="smart">'+(rows.length?'<ul class="clist">'+rows.map(r=>listRowX(r)).join('')+'</ul>':'<p class="pool-help">這裡目前沒有東西。</p>')+'</section>'}
  return h}
document.addEventListener('click',e=>{const b=e.target.closest&&e.target.closest('[data-pre]');if(!b)return;e.preventDefault();e.stopPropagation();setPreTab(b.dataset.pre)},true);
/* typing straight into a list */
const guessListType=t=>/訂位|預約|門票|車票|入場|票|pass|reserve/i.test(t)?'book':/買|伴手禮|代購/.test(t)?'buy':'todo';
/* the typing line sits just above the keyboard (outside the board, so re-drawing the list never closes the keyboard):
   Enter adds it and clears the line for the next one; 完成 or tapping elsewhere closes it (anything still typed is added) */
let COMP=null;
function composer(){if(COMP)return COMP;COMP=document.createElement('div');COMP.id='composer';COMP.hidden=true;
  COMP.innerHTML='<input class="inp" id="comp-in" autocomplete="off" enterkeyhint="next" placeholder="打字，按 Enter 加下一筆"><button type="button" class="btn pri" id="comp-done">完成</button>';
  document.body.appendChild(COMP);const i=COMP.querySelector('#comp-in');
  const add=()=>{const v=i.value.trim();if(!v)return false;const w=COMP.dataset.where;
    create('lists',Object.assign({type:w==='bag'?'pack':w==='notes'?'todo':guessListType(v),title:v,note:'',done:false,day:0,photos:[],ts:Date.now(),order:Date.now()},w==='notes'?{nochk:true}:{}));i.value='';render();return true};
  const close=()=>{add();COMP.hidden=true;document.body.classList.remove('composing')};
  i.addEventListener('keydown',e=>{if(e.key==='Enter'&&!e.isComposing){e.preventDefault();add()}});
  COMP.querySelector('#comp-done').addEventListener('pointerdown',e=>e.preventDefault());
  COMP.querySelector('#comp-done').onclick=()=>{close();i.blur()};
  i.addEventListener('blur',()=>setTimeout(()=>{if(document.activeElement!==i&&!COMP.hidden)close()},120));
  const place=()=>{const vv=window.visualViewport;COMP.style.bottom=vv?Math.max(0,innerHeight-vv.height-vv.offsetTop)+'px':'0px'};
  if(window.visualViewport){visualViewport.addEventListener('resize',place);visualViewport.addEventListener('scroll',place)}COMP.place=place;
  return COMP}
document.addEventListener('click',e=>{const b=e.target.closest&&e.target.closest('.addtap');if(!b)return;e.preventDefault();e.stopPropagation();if(!canWrite())return;
  const c=composer(),i=c.querySelector('#comp-in');c.dataset.where=b.dataset.where;i.placeholder='加到'+(b.dataset.where==='bag'?'行李':b.dataset.where==='notes'?'筆記':'待辦')+'，按 Enter 加下一筆';
  c.hidden=false;document.body.classList.add('composing');c.place();i.focus()},true);
/* the floating ＋ is always 新增: it opens the chooser (openPicker) */
function fabSync(){const t=document.getElementById('fab-t');if(!t)return;t.textContent='新增';const f=document.getElementById('fab');if(f){f.setAttribute('aria-label',t.textContent);f.title=t.textContent}expSync()}
/* adding to a checklist: the same fields as editing it (name, note, date, photos) — name or a photo is enough (購物 is often just a screenshot).
   opt.day presets the date; opt.pick = a day's 今日要辦 ＋ (no 待辦／預約／購物 choice: it is just a 待辦) */
/* 待辦 類型: 待辦 or 票券／訂位 (票券／訂位 stays in 出發前 with its date and reminds you that day) — same 類型 row as 口袋 */
const TIX_OK=(type,opt)=>type==='todo'&&!(opt&&opt.note);
function quickAdd(type,opt){opt=opt||{};if(!canWrite())return;const st={photos:[],day:opt.day||0,type,note:!!opt.note},L=()=>LTYPES.find(x=>x.k===st.type)||{l:'清單',ph:''},full=type!=='pack';S.readSheet=false;
  const notePh=t=>t==='book'||t==='ticket'?'確認碼、時間、人數':t==='buy'?'在哪買、幫誰買、大概多少錢':'';
  openSheet('<h2>'+(opt.note?'新增筆記':opt.pick?'今日要辦・'+md(dayDate(st.day)):'新增'+esc(L().l))+'</h2>'+
    '<div class="fld"><label for="q-in">要加什麼'+(S.assets&&full?'<span class="opt">也可以只放照片</span>':'')+'</label><input class="inp" id="q-in" placeholder="'+esc(L().ph)+'" autocomplete="off"></div>'+
    '<div class="fld"><label for="q-note">備註<span class="opt">選填</span></label><textarea class="inp" id="q-note" style="min-height:64px" placeholder="'+esc(notePh(type))+'"></textarea></div>'+
    (S.assets&&full?'<div class="fld"><span class="lbl">照片</span>'+photosHTML([],false)+'</div>':'')+
    (TIX_OK(type,opt)?'<div class="fld"><span class="lbl">類型</span><div class="seg" id="seg-qtype"><button type="button" data-v="todo" aria-pressed="true">待辦</button><button type="button" data-v="ticket" aria-pressed="false">票券</button><button type="button" data-v="book" aria-pressed="false">訂位</button></div></div>':'')+
    (full&&!opt.pick?'<div class="fld"><span class="lbl" id="q-dlbl">'+dateLbl(type)+'</span>'+daySeg(st.day,true,'不限')+'</div>':'')+  /* 今日要辦: the day is already chosen */
    '<div class="btns"><span class="sp"></span><button type="button" class="btn" id="q-cancel">取消</button><button type="button" class="btn pri" id="q-ok">加入</button></div>',
  root=>{const i=root.querySelector('#q-in'),nt=root.querySelector('#q-note');if(type!=='buy')setTimeout(()=>i.focus(),50);
    if(full)bindSeg(root,'seg-day',v=>st.day=+v);
    bindSeg(root,'seg-qtype',v=>{st.type=v;i.placeholder=L().ph;nt.placeholder=notePh(v);const dl=root.querySelector('#q-dlbl');if(dl)dl.innerHTML=dateLbl(v)});
    bindPhotos(root,()=>st.photos,ids=>{st.photos=ids});root.querySelector('#q-cancel').onclick=closeSheet;
    const go=()=>{const t=i.value.trim(),n=nt.value.trim();if(!t&&!st.photos.length){toast(full?'寫個名字，或加一張照片':'寫個名字');return}
      if(root.querySelector('.ph-busy')){toast('照片還在上傳，等一下');return}
      create('lists',Object.assign({type:st.type,title:t||'照片',note:n,done:false,day:full&&!st.note?st.day:0,photos:st.photos.slice(),ts:Date.now(),order:Date.now()},st.note?{nochk:true}:{}));closeSheet();render();toast(st.note?'已加到筆記':'已加到'+listWhere(st.type,full?st.day:0))};
    root.querySelector('#q-ok').onclick=go;i.addEventListener('keydown',e=>{if(e.key==='Enter')go()})})}
/* a day's 今日要辦 ＋ uses the same sheet (this later declaration replaces the page's simpler one) */
function openTodoAdd(day){quickAdd('todo',{day,pick:true})}
/* ＋ always asks "新增什麼？" with every choice on one screen — no need to open the right tab first.
   出發前: the seven lists (the open tab is marked); a trip day: 行程, 今日待辦, 花費 (行程 and 待辦 are separate). */
/* line icons in the page's own style (16×16, 1.6 stroke), each on a theme-colour disc */
const PK_ICO={
  item:'<path d="M8 14.5s4.5-4.2 4.5-7.7a4.5 4.5 0 0 0-9 0c0 3.5 4.5 7.7 4.5 7.7z"/><circle cx="8" cy="6.8" r="1.6"/>',
  todo:'<rect x="2.5" y="2.5" width="11" height="11" rx="2.5"/><path d="M5.5 8.2l1.8 1.8 3.4-3.6"/>',
  pack:'<rect x="2.5" y="5" width="11" height="8.5" rx="1.8"/><path d="M6 5V3.5h4V5M2.5 9h11"/>',
  ticket:'<path d="M2.5 4.5h11v2.3a1.2 1.2 0 0 0 0 2.4v2.3h-11V9.2a1.2 1.2 0 0 0 0-2.4z"/><path d="M10 4.5v7" stroke-dasharray="1.2 1.4"/>',
  book:'<path d="M4.5 2v4a1.75 1.75 0 0 0 3.5 0V2M6.25 7.75V14M12 2c-1.6 1-2.2 3-2.2 5.2h2.2V14"/>',
  buy:'<path d="M3.5 5.5h9l-.8 8h-7.4z"/><path d="M6 5.5v-1a2 2 0 0 1 4 0v1"/>',
  pool:'<path d="M4.5 2.5h7v11l-3.5-2.6-3.5 2.6z"/>',
  note:'<path d="M4 2.5h8v11H4z"/><path d="M6 5.5h4M6 8h4M6 10.5h2.5"/>',
  money:'<circle cx="8" cy="8" r="5.8"/><path d="M5.9 5l2.1 2.9L10.1 5M8 7.9v3.6M6.2 8.5h3.6M6.2 10h3.6"/>'};
const pkIco=(k,c)=>'<span class="pk-i" style="background:var(--'+c+')"><svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">'+PK_ICO[k]+'</svg></span>';
/* ＋ = one box "想加什麼？". While you type, 會加到 shows where it goes (guessed from the words); tap another choice to change it.
   行程／口袋／花費 open their full form with what you typed; 待辦／行李 are added straight away (one per line).
   With nothing typed, tapping a choice opens that form directly. */
const MONEY_RE=/[¥￥]\s*\d|\d+\s*(円|日圓|日幣|元|塊)|NT\$?\s*\d/i;
const PACK_RE=/護照|充電|行動電源|轉接|插頭|衣服|上衣|褲|襪|鞋|外套|牙刷|牙膏|盥洗|保養|化妝|藥|雨傘|眼鏡|隱形|毛巾|內衣|睡衣|帽子|圍巾|手套|暖暖包|耳機|相機|錢包|行李/;
const TODO_RE=/買|訂|預約|換|辦|保險|網卡|esim|確認|記得|查|列印|下載|申請|兌換|寄|繳|門票|車票|票/i;
const PLACE_RE=/https?:\/\/|拉麵|咖啡|cafe|café|店|寺|神社|公園|塔|館|市場|樂園|迪士尼|百貨|商場|丼|燒肉|壽司|甜點|餐|食堂|居酒屋|hills|tower|park|museum|通り|商店街|橫丁|横丁|展望|美術/i;
function guessDest(t,trip){if(!t)return trip?'item':'list';if(MONEY_RE.test(t))return 'money';if(!trip&&PACK_RE.test(t))return 'pack';if(TODO_RE.test(t)&&!PLACE_RE.test(t))return 'todo';
  if(PLACE_RE.test(t))return trip?'item':'pool';return trip?'item':'todo'}
/* ＋ starts on what you're looking at: a trip day → 行程; 出發前 → the open tab (行李 tab → 行李, 筆記 tab → 筆記, …) */
const TAB_DEST={list:'todo',bag:'pack',pool:'pool'};
function openPicker(){if(!canWrite())return;openDest(S.active>0?'item':TAB_DEST[preTab()]||'todo','')}
/* every add form starts with the same switch row (like 類型 in 新增行程): change it and the form changes, keeping the name you typed */
function openDest(k,t){const n=S.active,trip=n>0;
  if(k==='diary'){openDiary(n);setTimeout(()=>{const q=document.getElementById('dy-in');if(q&&t)q.value=t},60)}
  else if(k==='money'){openExp(null,{day:n});setTimeout(()=>{const s=document.getElementById('x-shop');if(s&&t){s.value=t;s.dispatchEvent(new Event('change',{bubbles:true}))}const a=document.getElementById('x-amt');if(a)a.focus()},80)}
  else if(k==='item'||k==='pool'){openAdd(k==='pool'?{day:0,slot:'pool'}:{day:n,slot:null});if(t)setTimeout(()=>{const a=document.getElementById('a-text');if(a){a.value=t;a.dispatchEvent(new Event('input',{bubbles:true}))}},60)}
  else{if(k==='note')quickAdd('todo',{note:true});else if(k==='pack')quickAdd('pack');else if(trip)quickAdd('todo',{day:n,pick:true});else quickAdd('todo');if(t)setTimeout(()=>{const q=document.getElementById('q-in');if(q)q.value=t},60)}
  setTimeout(()=>addSwitch(k,trip),0)}
function addSwitch(cur,trip){const all=document.querySelectorAll('.sheet'),sh=all[all.length-1];  /* the newest sheet (the old one may still be closing) */if(!sh||sh.querySelector('#seg-addsw'))return;
  const CH=trip?[['item','📍 行程'],['todo','☑️ 待辦'],['pool','🔖 口袋']]:[['todo','☑️ 待辦'],['pack','🧳 行李'],['pool','🔖 口袋']]  /* 記帳 has its own 💰 button next to 旅費; same three as the 出發前 tabs; 行程 = the 口袋 form (pick a day), 筆記 = 📝 寫筆記 inside it */;
  const d=document.createElement('div');d.className='fld addsw';
  d.innerHTML='<div class="seg" id="seg-addsw">'+CH.map(([k,l])=>'<button type="button" id="pk-'+(k==='money'?'exp':k)+'" data-k="'+k+'" aria-pressed="'+(k===cur||cur==='note'&&k==='pool')+'">'+l+'</button>').join('')+'</div>';
  const h=sh.querySelector('h2');if(h)h.after(d);else sh.prepend(d);
  d.querySelectorAll('button').forEach(b=>b.onclick=()=>{if(b.dataset.k===cur)return;const f=sh.querySelector('#a-text,#q-in,#x-shop,#dy-in');const t=f?f.value.trim():'';closeSheet();setTimeout(()=>openDest(b.dataset.k,t),0)})}
document.addEventListener('click',e=>{const f=e.target.closest&&e.target.closest('#fab');if(!f)return;e.preventDefault();e.stopPropagation();openPicker()},true);
document.addEventListener('click',e=>{if(e.target.closest&&e.target.closest('.chip,[data-pre]'))setTimeout(fabSync,0)},false);
window.__fabSync=()=>setTimeout(fabSync,0);
/* transport steps: a coloured tag that says how you go (電車／公車／計程車…), and how long it takes when the note has both times */
const TMODES=[
  ['plane','飛機',/JX\d|航班|飛機|✈|flight/i,'<path d="M2 9.5l12-4.2a1 1 0 0 1 .6 1.9L4.5 11.4 2.6 10.6zM6 8l-1.6-3.6 1.4-.5 3.6 2.8M7.2 10.2l1.6 3.4 1.4-.5.2-4.4"/>'],
  ['taxi','計程車',/計程車|yoxi|taxi|uber|タクシー|\bGO\b/i,'<path d="M3 11V8.5l1.4-3.2A1 1 0 0 1 5.3 4.7h5.4a1 1 0 0 1 .9.6L13 8.5V11zM3 8.5h10M5 11v1.5M11 11v1.5"/><circle cx="5.5" cy="9.8" r=".5"/><circle cx="10.5" cy="9.8" r=".5"/>'],
  ['ship','船',/渡輪|水上巴士|遊船|船/,'<path d="M2.5 10.5h11l-1.6 2.5H4.1zM4.5 10.5V7h7v3.5M8 7V3.5M2 14.5c1.5 0 1.5-.8 3-.8s1.5.8 3 .8 1.5-.8 3-.8 1.5.8 3 .8"/>'],
  ['bus','公車',/公車|巴士|bus|バス|利木津/i,'<rect x="3.5" y="2.5" width="9" height="10" rx="2"/><path d="M3.5 8h9M5.5 12.5v1.5M10.5 12.5v1.5M6 5h4"/>'],
  ['walk','步行',/步行|走路|徒步|散步|walk/i,'<circle cx="8.5" cy="3" r="1.2"/><path d="M8 5.5l-1.5 4 2 1.5.5 3.5M6.5 9.5l-1.2 4.5M8 5.5l2 2 2 .5M8 5.5L5.5 7 5 9"/>'],
  ['train','電車',/地鐵|電車|JR|[^路]線|skyliner|機捷|捷運|metro|新幹線|ゆりかもめ|モノレール|轉乘|京急|京成|Narita Express|N'EX/i,'<rect x="4" y="2.5" width="8" height="9" rx="2"/><path d="M4 7.5h8M6 11.5l-1.5 2.5M10 11.5l1.5 2.5"/><circle cx="6.2" cy="9.5" r=".4"/><circle cx="9.8" cy="9.5" r=".4"/>'],
];
const TMODE_GO='<path d="M2.5 8h9.5M9 4.5L12.5 8 9 11.5"/>';
function tmode(it){if(it.tm){const m=TMODES.find(x=>x[0]===it.tm);if(m)return m}const s=[it.title,it.note,it.desc].filter(Boolean).join(' ');for(const m of TMODES)if(m[2].test(s))return m;return null}
function kindTag(it){
  if(it.kind!=='move')return '<span class="kind k-'+esc(KIND_L[it.kind]?it.kind:'spot')+'">'+esc(KIND_L[it.kind]||'景點')+'</span>';
  const m=tmode(it);return '<span class="kind tmode m-'+(m?m[0]:'go')+'"><svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">'+(m?m[3]:TMODE_GO)+'</svg>'+(m?m[1]:'交通')+'</span>'}
function tdur(it){if(it.kind!=='move')return '';const s=[it.time&&it.end?it.time+'–'+it.end:'',it.note,it.desc].filter(Boolean).join(' ');
  if(/約\s*\d|分鐘|小時/.test(s))return '';
  const r=s.match(/(\d{1,2}):(\d{2})\s*(?:[–\-~～→]|到)\s*(\d{1,2}):(\d{2})/);if(!r)return '';
  let d=(+r[3]*60+ +r[4])-(+r[1]*60+ +r[2]);if(d<0)d+=1440;if(!d||d>720)return '';
  return '<span class="tdur">約 '+(d>=60?Math.floor(d/60)+' 小時'+(d%60?' '+d%60+' 分':''):d+' 分鐘')+'</span>'}
/* small pictures: AI names the Wikipedia article for each place, that article's lead photo becomes the card's thumbnail.
   Looked up once per item and saved on it (pic = image URL, or 'none' when there is no good match / someone removed it). */
const PIC_OK=/^https:\/\/(upload|thumb)\.wikimedia\.org\//;
/* logos and location maps are SVG on Wikipedia — not a photo of the place, so they don't count; hotels get no picture (the match is too often a nearby building) */
function picOf(it){return it&&it.kind!=='stay'&&typeof it.pic==='string'&&PIC_OK.test(it.pic)&&!/\.svg/i.test(it.pic)?it.pic:''}
function picHTML(it){if(it.photos&&it.photos.length)return '';const u=picOf(it);return u?'<img class="ipic" src="'+esc(u)+'" alt="" loading="lazy" referrerpolicy="no-referrer">':''}
let PIC_BUSY=false;
async function wikiPics(titles){
  const u='https://ja.wikipedia.org/w/api.php?action=query&format=json&origin=*&redirects=1&prop=pageimages&piprop=thumbnail&pithumbsize=240&titles='+encodeURIComponent(titles.join('|'));
  const q=((await (await fetch(u)).json())||{}).query||{},fwd={};
  (q.normalized||[]).concat(q.redirects||[]).forEach(r=>{fwd[r.from]=r.to});
  const img={};Object.values(q.pages||{}).forEach(p=>{if(p.thumbnail&&p.thumbnail.source)img[p.title]=p.thumbnail.source});
  return t=>{let k=t,n=0;while(fwd[k]&&n++<3)k=fwd[k];return img[k]||''}}
async function findPics(){
  if(PIC_BUSY||!S.sample||!S.canWrite)return;
  const todo=[...S.items.values()].filter(it=>PLACE_KINDS.includes(it.kind)&&it.pic==null&&it.title&&(it.area||it.q||it.map||it.aq!=null)).slice(0,60);
  if(!todo.length)return;PIC_BUSY=true;
  try{for(let i=0;i<todo.length;i+=20){const part=todo.slice(i,i+20);
    const prompt='下面是'+(T.dest||'日本')+'旅行行程裡的地點。請替每一個找出最符合的日文維基百科條目標題（必須是確實存在的條目，例如「東京ディズニーシー」「浅草寺」）。餐廳、小店、咖啡廳，或找不到、不確定的，一律填空字串。只回覆 JSON 陣列，順序和編號一一對應，例如 ["浅草寺",""]。\n'+
      part.map((it,k)=>(k+1)+'. '+it.title.slice(0,30)+(it.area?'（'+String(it.area).slice(0,12)+'）':'')).join('\n');
    let names;try{const r=await S.sample(prompt);names=JSON.parse((r.text.match(/\[[\s\S]*\]/)||['[]'])[0])}catch(e){break}
    if(!Array.isArray(names)||names.length!==part.length)continue;
    const want=[...new Set(names.filter(n=>typeof n==='string'&&n.trim()).map(n=>n.trim()))];
    let get=()=>'';if(want.length){try{get=await wikiPics(want)}catch(e){break}}
    part.forEach((it,k)=>{const n=typeof names[k]==='string'?names[k].trim():'',src=n?get(n):'',pic=PIC_OK.test(src)&&!/\.svg/i.test(src)?src:'none';
      const cur=S.items.get(it.id);if(!cur||cur.pic!=null)return;S.items.set(it.id,Object.assign({},cur,{pic}));queue('items'+it.id,()=>ref('items',it.id).update({pic}))});
    render()}}
  finally{PIC_BUSY=false}}
/* places typed without an area (e.g. 小町通商店街) get one from AI, so they count as real places: framed card, tag and a Google Maps link.
   aq marks "already asked" so each item is asked once; '' back from AI = not a findable place (飛機餐) and it stays a plain row. */
let AREA_BUSY=false;
async function findAreas(){
  if(AREA_BUSY||!S.sample||!S.canWrite)return;
  const todo=[...S.items.values()].filter(it=>PLACE_KINDS.includes(it.kind)&&it.title&&!it.area&&!it.q&&!safeUrl(it.map)&&it.aq==null).slice(0,40);
  if(!todo.length)return;AREA_BUSY=true;
  try{for(let i=0;i<todo.length;i+=20){const part=todo.slice(i,i+20);
    const prompt='下面是'+(T.dest||'日本')+'旅行行程裡的項目，括號裡是那天的主要地區。請替每一項寫出它在 Google 地圖上所在的地區名稱（繁體中文，2 到 6 個字，例如「鎌倉」「澀谷」「江之島」）。如果不是一個找得到的實際地點（例如「飛機餐」「自由活動」），填空字串。只回覆 JSON 陣列，順序和編號一一對應，例如 ["鎌倉",""]。\n'+
      part.map((it,k)=>{const dt=it.day?(S.days.get('d'+it.day)||{}).title:'';return (k+1)+'. '+it.title.slice(0,30)+(dt?'（'+String(dt).slice(0,16)+'）':'')}).join('\n');
    let names;try{const r=await S.sample(prompt);names=JSON.parse((r.text.match(/\[[\s\S]*\]/)||['[]'])[0])}catch(e){break}
    if(!Array.isArray(names)||names.length!==part.length)continue;
    part.forEach((it,k)=>{const cur=S.items.get(it.id);if(!cur||cur.area||cur.aq!=null)return;
      const v=typeof names[k]==='string'?names[k].trim().slice(0,12):'',p=v?{area:v,aq:1}:{aq:1};
      S.items.set(it.id,Object.assign({},cur,p));queue('items'+it.id,()=>ref('items',it.id).update(p))});
    render()}}
  finally{AREA_BUSY=false}}
async function fillPlaces(){syncBookings();fixAreaFromTitle();await findAreas();await findCommutes();await findMoves();await findPics();await findDescs();await findClosed();await findHours();await findRecs();await findStays();await findDups()}
/* runs once the AI is ready, then every 30 s while the page is open (only asks when something new is missing an area or picture) */
function picsLater(){let n=0;(function go(){if(S.sample&&S.items.size){fillPlaces();setInterval(()=>{if(!document.hidden&&!window.__noAutoFill)fillPlaces()},30000)}else if(++n<20)setTimeout(go,1500)})()}
document.addEventListener('click',e=>{const b=e.target.closest&&e.target.closest('#e-pic-rm');if(!b)return;
  patch('items',b.dataset.id,{pic:'none'},'已拿掉圖片');const f=b.closest('.picfld');if(f)f.remove()});

/* 訂位／票券 in date order (undated last); same-day items keep their own order */
const byDate=(a,b)=>(a.done-b.done)||((a.day>0?a.day:99)-(b.day>0?b.day:99));
window.__fillPlaces=fillPlaces;
/* 新增行程: the place (several lines allowed) on top; for a single place its details — 類型、時間、備註、照片 — are right here too,
   so nothing has to be filled in afterwards. 地區 and the Google Maps link are filled in by AI (findAreas). Replaces the page's own openAdd. */
let ADD_MUST=false;
function openAdd(def){if(!canWrite())return;ADD_MUST=false;const d={day:def.day,slot:def.slot&&def.slot!=='pool'?def.slot:null,kind:'',photos:[]};S.readSheet=false;
  /* 待辦 has its own ＋ choice (今日待辦), so a 行程 is never a to-do */
  const kindList=()=>d.day===0?KINDS.filter(k=>PLACE_KINDS.includes(k[0])).concat([['buy','想'+'買']]):  /* 口袋 = her notebook: 筆記 is one of its types */KINDS.filter(k=>k[0]!=='todo');
  const kindChips=()=>'<div class="seg" id="seg-akind">'+kindList().map(k=>'<button type="button" data-v="'+k[0]+'" aria-pressed="'+(d.kind===k[0])+'">'+k[1]+'</button>').join('')+'</div>';
  const slotChips=()=>d.day===0?'':'<div class="fld"><span class="lbl">時段<span class="opt">不選就依時間排，再點一次取消</span></span><div class="seg" id="seg-aslot">'+slotKeys(d.sfam||'',d.slot).map(s=>'<button type="button" data-v="'+s.k+'" aria-pressed="'+(d.slot===s.k)+'">'+s.l+'</button>').join('')+'</div></div>';
  openSheet('<h2 id="a-h">'+(d.day===0?'新增到口袋':'新增行程')+'</h2>'+
    '<div class="fld"><label for="a-text">'+(d.day===0?'要加什麼':'去哪裡')+'</label><div class="togwrap"><textarea class="inp grow" id="a-text" rows="1" placeholder="'+(d.day===0?'店名、景點，或任何想記的事':'店名或景點，例：一蘭拉麵')+'"></textarea><button type="button" class="star-in" id="a-must" aria-pressed="false" aria-label="必去" title="必去">★</button></div><span class="hint2">地區、地圖會自動補上・可貼地圖連結・換行可一次加多個</span></div>'+
    '<div class="fld" id="a-notef"><label for="a-note">備註<span class="opt">選填</span></label><textarea class="inp" id="a-note" rows="1" placeholder="訂位資訊、想點什麼、要注意的事"></textarea></div>'+
    (S.assets?'<div class="fld" id="a-photof"><span class="lbl">照片<span class="opt">選填，IG、Google 地圖的截圖也可以</span></span>'+photosHTML([],false)+'</div>':'')+
    '<div class="fld" id="a-kindf"><span class="lbl">類型<span class="opt">打完名稱會先幫你選，不對再點</span></span><div id="a-kind">'+kindChips()+'</div></div>'+
    (def.day>0?'':'<div class="fld"><span class="lbl">哪一天</span>'+daySeg(d.day,true)+'</div>')+  /* added from a trip day: it goes on that day */
    '<div class="fld" id="a-posf"'+(d.day===0?' hidden':'')+'><label for="a-pos">排在哪裡<span class="opt">選了就不用再拖</span></label><select class="inp" id="a-pos">'+posOpts(d.day)+'</select></div>'+
    '<div id="a-slot">'+slotChips()+'</div>'+
    '<div id="a-extra">'+
      '<div class="fld" id="a-timef"'+(d.day===0?' hidden':'')+'><label for="a-time">開始時間<span class="opt">選填</span></label><div class="trange"><input class="inp" id="a-time" inputmode="numeric" placeholder="開始 15:00" autocomplete="off"><span>–</span><input class="inp" id="a-end" inputmode="numeric" placeholder="結束 19:00" autocomplete="off"></div></div>'+
      '<div class="fld" id="a-legf"'+(d.day===0?' hidden':'')+'><span class="lbl">交通方式<span class="opt">從上一站過來</span></span><div class="seg" id="seg-alg">'+TM_ORDER.map(k=>'<button type="button" data-v="'+k+'" aria-pressed="'+(k==='train')+'">'+TM_ICON[k]+' '+TMODES.find(x=>x[0]===k)[1]+'</button>').join('')+'</div></div>'+
      '<div class="fld" id="a-tmf" hidden><span class="lbl">交通方式<span class="opt">這段交通搭什麼</span></span><div class="seg" id="seg-atm">'+TM_ORDER.map(k=>'<button type="button" data-v="'+k+'" aria-pressed="false">'+TM_ICON[k]+' '+TMODES.find(x=>x[0]===k)[1]+'</button>').join('')+'</div></div>'+

    '</div><p class="hint2" id="a-multi" hidden>一次加很多個時，類型、時間、備註、照片請加完再點開個別填。</p>'+
    '<div class="preview" id="a-pv"></div>'+
    '<div class="btns"><button type="button" class="btn pri block" id="a-ok" disabled>'+(d.day===0?'加入口袋':'加入行程')+'</button></div>',
  root=>{const ta=root.querySelector('#a-text'),pv=root.querySelector('#a-pv'),ok=root.querySelector('#a-ok'),tm=root.querySelector('#a-time'),en=root.querySelector('#a-end'),nt=root.querySelector('#a-note');let rows=[],ends=[];
    const RANGE=/(\d{1,2}[:：]\d{2})\s*[-–~～到]\s*(\d{1,2}[:：]\d{2})/;
    const grow=()=>{ta.style.height='auto';ta.style.height=ta.scrollHeight+'px'};
    const timeOk=()=>tmin(normT(tm.value))!=null;
    const upd=()=>{const lines=ta.value.split(/\n+/).filter(l=>l.trim()),one=lines.length<=1,t=one&&timeOk()?normT(tm.value)+' ':'';
      ends=[];rows=lines.map(l=>{const m=l.match(RANGE);const r=parseLine(t+(m?l.replace(RANGE,'$1'):l),d);if(r)ends.push(m?normT(m[2]):'');return r}).filter(Boolean);
      if(one&&rows[0]&&/^\d{2}:\d{2}$/.test(normT(en.value)))ends[0]=normT(en.value);if(d.slot)rows.forEach(r=>{if(r.day!==0)r.slot=d.slot});
      if(d.day===0)rows.forEach(r=>{if(!PLACE_KINDS.includes(r.kind))r.kind='spot'});rows.forEach(r=>{if(r.kind==='todo')r.kind='spot'});
      {const g=d.kindPicked?d.kind:(one&&rows[0]?rows[0].kind:'');if(d.day>0&&(g||'')!==(d.sfam||'')){d.sfam=g||'';if(g&&d.slot){d.slot=slotFit(d.slot,g);rows.forEach(r=>{if(r.day!==0)r.slot=d.slot})}root.querySelector('#a-slot').innerHTML=slotChips();bindSlot()}}
      {const g=d.kindPicked?d.kind:(one&&rows[0]?rows[0].kind:'');root.querySelectorAll('#seg-akind button').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.v===g)));
       const tg=g==='move'?(d.tmPicked?d.tm:((tmode({title:ta.value,note:nt.value})||[])[0]||'')):'';root.querySelectorAll('#seg-atm button').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.v===tg)))}
      root.querySelector('#a-h').textContent=d.day===0?'新增到口袋':'新增行程';
      tm.placeholder=d.day>0&&ENDCUR[d.day]!=null?'自動 約 '+tfmt(ENDCUR[d.day]):'開始 15:00';
      {const g=d.kindPicked?d.kind:(one&&rows[0]?rows[0].kind:'');root.querySelector('#a-tmf').hidden=d.day===0||!one||g!=='move';root.querySelector('#a-legf').hidden=d.day===0||!one||g==='move'||g==='todo'}
      if(one&&rows[0]){if(d.kindPicked&&d.kind&&d.kind!=='note'&&d.kind!=='buy')rows[0].kind=d.kind;const n=nt.value.trim();if(n)rows[0].note=rows[0].note?rows[0].note+'・'+n:n}
      root.querySelector('#a-extra').hidden=!one;root.querySelector('#a-kindf').hidden=!one;root.querySelector('#a-notef').hidden=!one;{const pf=root.querySelector('#a-photof');if(pf)pf.hidden=!one}
      root.querySelector('#a-posf').hidden=d.day===0||!one;root.querySelector('#a-slot').hidden=!!(one&&d.pos&&d.day>0);root.querySelector('#a-multi').hidden=one;
      pv.innerHTML=rows.map(r=>'<div class="pvc"><b>'+esc(r.title)+'</b><span class="kind k-'+r.kind+'">'+KIND_L[r.kind]+'</span><span class="imeta">'+(r.time||ends[rows.indexOf(r)]?'<span class="itime">'+(r.time||'～')+(ends[rows.indexOf(r)]?(r.time?'–':'')+ends[rows.indexOf(r)]:'')+'</span>':'')+
        '<span>'+(r.day?'Day '+r.day+'・'+md(dayDate(r.day))+'・'+SLOT_L[r.slot]:'口袋名單')+'</span>'+(r.area?'<span>'+esc(r.area)+'</span>':'')+(r.map?'<span class="mapl">'+PIN+'地圖</span>':'')+'</span></div>').join('');
      const isTodo=d.day>0&&(d.kindPicked&&rows.length<=1?d.kind==='todo':rows.length>0&&rows.every(r=>r.kind==='todo'));d.isTodo=isTodo;
      const isNote=d.day===0&&d.kindPicked&&(d.kind==='note'||d.kind==='buy');d.isNote=isNote;pv.hidden=isNote;
      if(isTodo)root.querySelector('#a-slot').hidden=true;root.querySelector('#a-timef').hidden=isTodo||d.day===0;
      {const pl=one&&rows[0]&&d.day>0?placeFor(rows[0],d.pos,d.slot):null,ps=root.querySelector('#a-pos');if(ps&&ps.options[0])ps.options[0].textContent=pl&&pl.after?'自動：排在「'+pl.after.title.slice(0,14)+'」之後':'自動（依時間或時段）'}
      ok.disabled=!rows.length;ok.textContent=isNote?(d.kind==='buy'?'加入口袋':rows.length>1?'加入 '+rows.length+' 則筆記':'加入筆記'):isTodo?(rows.length>1?'加入 '+rows.length+' 個待辦':'加入待辦'):d.day===0?(rows.length>1?'加入 '+rows.length+' 個到口袋':'加入口袋'):(rows.length>1?'加入 '+rows.length+' 個行程':'加入行程')};
    const bindSlot=()=>{const g=root.querySelector('#seg-aslot');if(!g)return;g.addEventListener('click',e=>{const b=e.target.closest('button');if(!b)return;
      d.slot=d.slot===b.dataset.v?null:b.dataset.v;g.querySelectorAll('button').forEach(x=>x.setAttribute('aria-pressed',String(x.dataset.v===d.slot)));upd()})};
    ta.addEventListener('input',()=>{grow();upd()});tm.addEventListener('input',upd);en.addEventListener('input',upd);nt.addEventListener('input',upd);
    ta.addEventListener('keydown',e=>{if(e.key==='Enter'&&(e.metaKey||e.ctrlKey)){e.preventDefault();ok.click()}});
    root.querySelector('#a-pos').addEventListener('change',e=>{d.pos=e.target.value;upd()});
    bindSeg(root,'seg-day',v=>{const was=d.day;d.day=+v;d.pos='';root.querySelector('#a-pos').innerHTML=posOpts(d.day);if((was===0)!==(d.day===0)){if(d.day===0)d.slot=null;root.querySelector('#a-slot').innerHTML=slotChips();bindSlot();root.querySelector('#a-timef').hidden=d.day===0;
        if(d.day===0&&d.kind&&!PLACE_KINDS.includes(d.kind)){d.kind='';d.kindPicked=false}root.querySelector('#a-kind').innerHTML=kindChips();bindKind()}upd()});
    const bindKind=()=>bindSeg(root,'seg-akind',v=>{d.kind=v;d.kindPicked=true;d.tmPicked=false;upd()});bindKind();bindSeg(root,'seg-atm',v=>{d.tm=v;d.tmPicked=true;upd()});bindSeg(root,'seg-alg',v=>{d.leg=v});bindSlot();
    bindPhotos(root,()=>d.photos,ids=>{d.photos=ids});
    ok.onclick=()=>{if(!rows.length)return;
      if(d.isNote){if(root.querySelector('.ph-busy')){toast('照片還在上傳，等一下');return}const pics=rows.length===1?d.photos.slice():[],n=nt.value.trim();closeSheet();
        rows.forEach((r,i)=>create('lists',{type:d.kind==='buy'?'buy':'todo',nochk:d.kind!=='buy',title:r.title,note:rows.length===1?n:'',done:false,day:0,photos:i===0?pics:[],ts:Date.now()+i,order:Date.now()+i}));
        render();toast('已加到口袋');return}
      if(d.isTodo){if(root.querySelector('.ph-busy')){toast('照片還在上傳，等一下');return}const pics=rows.length===1?d.photos.slice():[];closeSheet();
        rows.forEach((r,i)=>create('lists',{type:'todo',title:r.title,note:r.note||'',done:false,day:d.day,photos:i===0?pics:[],ts:Date.now()+i,order:Date.now()+i}));
        render();toast('已加到'+listWhere('todo',d.day));return}if(tm.value.trim()&&!timeOk()){toast('時間請寫成 15:00 這樣');tm.focus();return}
      if(en.value.trim()&&tmin(normT(en.value))==null){toast('時間請寫成 15:00 這樣');en.focus();return}
      if(tm.value.trim()&&en.value.trim()&&tmin(normT(en.value))<=tmin(normT(tm.value))){toast('結束時間要比開始晚');en.focus();return}
      if(root.querySelector('.ph-busy')){toast('照片還在上傳，等一下');return}
      const pics=rows.length===1?d.photos.slice():[],endsNow=ends.slice(),pl=rows.length===1&&rows[0].day>0?placeFor(rows[0],d.pos,d.slot):null;closeSheet();const ids=addItems(rows);
      if(ids&&ids.length===1){const cur=S.items.get(ids[0]),p={};if(pl){p.slot=pl.slot;p.order=pl.order}if(ADD_MUST)p.must=true;if(cur&&cur.kind==='move'&&d.tmPicked&&d.tm)p.tm=d.tm;if(cur&&cur.kind!=='move'&&d.leg&&d.leg!=='train')p.cmMode=d.leg;
        if(cur&&Object.keys(p).length){S.items.set(ids[0],Object.assign({},cur,p));queue('items'+ids[0],()=>ref('items',ids[0]).update(p))}}
      if(ids)ids.forEach((id,i)=>{const e=endsNow[i],cur=S.items.get(id);if(e&&cur&&(!cur.time||tmin(e)>tmin(cur.time))){S.items.set(id,Object.assign({},cur,{end:e}));queue('items'+id,()=>ref('items',id).update({end:e}))}});render();
      if(pics.length&&ids&&ids[0]){const id=ids[0],cur=S.items.get(id);if(cur){S.items.set(id,Object.assign({},cur,{photos:pics}));queue('items'+id,()=>ref('items',id).update({photos:pics}));render()}}
      flashNew(ids)};
    setTimeout(()=>ta.focus(),50)})}
/* places without a 簡介 get one from AI (same rules as the ✨ AI 寫簡介 button); dq marks "already asked", '' back = AI wasn't sure, left empty */
let DESC_BUSY=false;
async function findDescs(){
  if(DESC_BUSY||!S.sample||!S.canWrite)return;
  const todo=[...S.items.values()].filter(it=>PLACE_KINDS.includes(it.kind)&&it.title&&!it.desc&&(it.area||it.q||safeUrl(it.map)||it.aq!=null)&&it.dq==null).slice(0,30);
  if(!todo.length)return;DESC_BUSY=true;
  try{for(let i=0;i<todo.length;i+=10){const part=todo.slice(i,i+10);
    const prompt='請替下面每一項寫一段簡介，用繁體中文（台灣用語），每段 30 到 70 字，給去'+(T.dest||'日本')+'旅遊的人看：說明它是什麼、以什麼出名（招牌菜或必看重點）。只寫你確定的事實，不要寫營業時間或價格；不確定是哪一間或不認識的，填空字串。只回覆 JSON 陣列，順序和編號一一對應。\n'+
      part.map((it,k)=>(k+1)+'. '+it.title.slice(0,40)+'（'+(KIND_L[it.kind]||'景點')+(it.area?'・'+String(it.area).slice(0,12):'')+'）').join('\n');
    let out;try{const r=await S.sample(prompt);out=JSON.parse((r.text.match(/\[[\s\S]*\]/)||['[]'])[0])}catch(e){break}
    if(!Array.isArray(out)||out.length!==part.length)continue;
    part.forEach((it,k)=>{const cur=S.items.get(it.id);if(!cur||cur.desc||cur.dq!=null)return;
      const v=typeof out[k]==='string'?out[k].trim().replace(/^["「『]|["」』]$/g,'').slice(0,120):'',p=v?{desc:v,dq:1}:{dq:1};
      S.items.set(it.id,Object.assign({},cur,p));queue('items'+it.id,()=>ref('items',it.id).update(p))});
    render()}}
  finally{DESC_BUSY=false}}

/* regular closing days: AI says which weekdays a place is usually closed (定休日); a card on such a day gets a gentle warning.
   closed = weekday characters like "三" or "一二", '' = open every day or not sure; cq marks "already asked". */
let CLOSED_BUSY=false;
async function findClosed(){
  if(CLOSED_BUSY||!S.sample||!S.canWrite)return;
  const todo=[...S.items.values()].filter(it=>PLACE_KINDS.includes(it.kind)&&it.title&&(it.area||it.q||safeUrl(it.map))&&it.cq==null).slice(0,40);
  if(!todo.length)return;CLOSED_BUSY=true;
  try{for(let i=0;i<todo.length;i+=20){const part=todo.slice(i,i+20);
    const prompt='下面是'+(T.dest||'日本')+'的店家和景點。請寫出每一個固定的每週公休日（定休日），用「一二三四五六日」裡的字表示，例如「三」或「一二」。全年無休、只有不定休、或你不確定的，一律填空字串，不要猜。只回覆 JSON 陣列，順序和編號一一對應。\n'+
      part.map((it,k)=>(k+1)+'. '+it.title.slice(0,40)+(it.area?'（'+String(it.area).slice(0,12)+'）':'')).join('\n');
    let out;try{const r=await S.sample(prompt);out=JSON.parse((r.text.match(/\[[\s\S]*\]/)||['[]'])[0])}catch(e){break}
    if(!Array.isArray(out)||out.length!==part.length)continue;
    part.forEach((it,k)=>{const cur=S.items.get(it.id);if(!cur||cur.cq!=null)return;
      const v=typeof out[k]==='string'?[...new Set(out[k].replace(/[^一二三四五六日]/g,''))].join(''):'',p={closed:v.length<7?v:'',cq:1};
      S.items.set(it.id,Object.assign({},cur,p));queue('items'+it.id,()=>ref('items',it.id).update(p))});
    render()}}
  finally{CLOSED_BUSY=false}}
function closedWarn(it){const c=[...new Set((it.closed||'')+noteClosed(it))].join('');if(!c||!(it.day>0))return '';const wd=WK[dayDate(it.day).getDay()];
  return c.includes(wd)?'<span class="iwarn">⚠ 這天是週'+wd+'，可能公休（定休日：週'+c.split('').join('、')+'），出發前再確認</span>':''}

/* checklist duplicates: AI groups items that mean the same thing (e.g. 「Disney Sea」 and 「迪士尼海洋門票」); each one gets a small hint.
   Only asked again when the list changes (cached per trip in this browser). */
let DUPS={},DUP_BUSY=false;
try{DUPS=(JSON.parse(localStorage.getItem(T.id+'-dups')||'{}').map)||{}}catch(e){DUPS={}}
async function findDups(){
  if(DUP_BUSY||!S.sample||!S.canWrite)return;
  const rows=[...S.lists.values()].filter(r=>['todo','book','ticket','buy'].includes(r.type)&&!r.done&&r.title).sort((a,b)=>a.id.localeCompare(b.id));
  const sig=rows.map(r=>r.id+':'+(r.day||0)+':'+r.title).join('|');let prev='';try{prev=JSON.parse(localStorage.getItem(T.id+'-dups')||'{}').sig||''}catch(e){}
  if(sig===prev)return;
  if(rows.length<2){DUPS={};try{localStorage.setItem(T.id+'-dups',JSON.stringify({sig,map:DUPS}))}catch(e){}return}
  DUP_BUSY=true;
  try{const part=rows.slice(0,60);
    const prompt='下面是出國旅行的待辦、訂位、票券和購物清單。請找出指的是同一件事、重複記了兩次的項目（例如「Disney Sea」和「迪士尼海洋門票」）。去程和回程、不同天的票、不同的店都不算重複。只回覆 JSON 陣列，每一組是編號陣列，例如 [[1,4]]；沒有重複就回 []。\n'+
      part.map((r,k)=>(k+1)+'. '+r.title.slice(0,40)+'（'+(LT_L[r.type]||'')+'）').join('\n');
    let out;try{const r=await S.sample(prompt);out=JSON.parse((r.text.match(/\[[\s\S]*\]/)||['[]'])[0])}catch(e){return}
    const map={};if(Array.isArray(out))out.forEach(g=>{if(!Array.isArray(g))return;const ids=g.map(x=>part[+x-1]).filter(Boolean);
      if(ids.length<2)return;ids.forEach(a=>{const o=ids.filter(b=>b!==a&&(b.day||0)===(a.day||0));if(o.length)map[a.id]=o.map(b=>b.title).join('、')})});
    DUPS=map;try{localStorage.setItem(T.id+'-dups',JSON.stringify({sig,map}))}catch(e){}render()}
  finally{DUP_BUSY=false}}
function dupHTML(r){return DUPS[r.id]&&!r.done?'<span class="ldup">可能和「'+esc(DUPS[r.id])+'」重複</span>':''}

/* 今日路線 → ✨ 幫我排順序: AI suggests a visiting order (順路、少走回頭路); places are only reordered inside their own time slot,
   transport and to-do rows keep their places. Nothing changes until 套用 is pressed. */
async function suggestOrder(n,box){
  const its=dayItems(n).filter(i=>PLACE_KINDS.includes(i.kind));if(its.length<3){box.innerHTML='<p class="hint2">這天地點不到 3 個，不用排。</p>';return}
  box.innerHTML='<p class="hint2">AI 排順序中…</p>';
  const prompt='下面是同一天在'+(T.dest||'日本')+'要去的地點（括號是地區和時段）。請以順路、少走回頭路為原則，建議參觀順序；時段不能變（早餐在前、晚餐和晚上在後）。'+(n>1&&HOTEL()?'這天從飯店（'+HOTEL()+'）出發。':'')+'只回覆 JSON 陣列，內容是編號的新順序，例如 [2,1,3]。\n'+
    its.map((it,k)=>(k+1)+'. '+it.title.slice(0,40)+'（'+(it.area||'')+'・'+SLOT_L[it.slot]+'）').join('\n');
  let ord;try{const r=await S.sample(prompt);ord=JSON.parse((r.text.match(/\[[\s\S]*\]/)||['[]'])[0]).map(x=>+x)}catch(e){box.innerHTML='<p class="hint2">AI 暫時沒有回應，等一下再試。</p>';return}
  if(!Array.isArray(ord)||ord.length!==its.length||new Set(ord).size!==its.length||ord.some(x=>!(x>=1&&x<=its.length))){box.innerHTML='<p class="hint2">AI 回的順序不完整，再按一次試試。</p>';return}
  const rank={};ord.forEach((x,i)=>{rank[its[x-1].id]=i});
  const now=dayItems(n),plan=[];
  SLOTS.forEach(s=>{const list=now.filter(i=>i.slot===s.k),pl=list.filter(i=>i.id in rank).sort((a,b)=>rank[a.id]-rank[b.id]);let k=0;
    list.forEach(i=>plan.push(i.id in rank?pl[k++]:i))});
  if(plan.every((p,i)=>p.id===now[i].id)){box.innerHTML='<p class="hint2">✓ 現在的順序已經很順，不用改。</p>';return}
  box.innerHTML='<div class="ord-plan"><b>建議順序</b><ol>'+plan.filter(i=>i.id in rank).map(i=>'<li>'+esc(i.title)+'<small>'+esc(SLOT_L[i.slot])+'</small></li>').join('')+'</ol>'+
    '<div class="btns"><span class="sp"></span><button type="button" class="btn" id="ord-no">不用了</button><button type="button" class="btn pri" id="ord-ok">套用</button></div></div>';
  box.querySelector('#ord-no').onclick=()=>{box.innerHTML=''};
  box.querySelector('#ord-ok').onclick=()=>{if(!canWrite())return;
    SLOTS.forEach(s=>{plan.filter(i=>i.slot===s.k).forEach((i,k)=>{const o=(k+1)*1000,cur=S.items.get(i.id);
      if(cur&&cur.order!==o){S.items.set(i.id,Object.assign({},cur,{order:o}));queue('items'+i.id,()=>ref('items',i.id).update({order:o}))}})});
    buildNext();render();closeSheet();toast('已照建議排好 Day '+n)}}
document.addEventListener('click',e=>{const b=e.target.closest&&e.target.closest('#ord-ai');if(!b)return;suggestOrder(+b.dataset.day,document.querySelector('#ord-box'))});

/* trip days: a second round button above the ＋ goes straight to 記一筆 for that day (amount first, keyboard up) */
function expSync(){let b=document.getElementById('fab-exp');
  if(!b){b=document.createElement('button');b.type='button';b.id='fab-exp';b.className='fab-exp';b.setAttribute('aria-label','記帳');b.title='記帳';b.innerHTML='<span aria-hidden="true">$</span>';document.body.appendChild(b);
    b.addEventListener('click',()=>{if(!canWrite())return;openExp(null,{day:S.active});setTimeout(()=>{const a=document.getElementById('x-amt');if(a)a.focus()},80)})}
  b.hidden=true}

/* no accidental zoom: iPhone ignores maximum-scale, so stop its pinch gesture (photos opened full screen can still be pinched) */
['gesturestart','gesturechange'].forEach(t=>document.addEventListener(t,e=>{if(!(e.target.closest&&e.target.closest('.lb')))e.preventDefault()},{passive:false}));

/* ---------- start / end times and the trip between stops ----------
   An item can have a start (time) and an end — neither is required. Both filled → the card also says how long you stay.
   Between two stops (NEXT/PREV, same as 下一站怎麼去) AI estimates minutes by 🚃 public transport and by 🚕 taxi;
   they live on the later stop: cmFrom (the stop before it), cmT, cmX, cmMode ('transit'|'taxi'), cmMan (minutes you typed).
   A stop with no start shows an estimate: the last end time before it + the trip from the previous stop. */
function normT(x){x=String(x||'').trim().replace('：',':');if(!x)return '';let m=x.match(/^(\d{1,2}):?(\d{2})$/)||x.match(/^(\d{1,2})$/);
  if(!m)return x;const h=+m[1],mi=m[2]===undefined?0:+m[2];if(h>23||mi>59)return x;return String(h).padStart(2,'0')+':'+String(mi).padStart(2,'0')}
const tmin=t=>{const m=/^(\d{2}):(\d{2})$/.exec(t||'');return m&&+m[1]<24&&+m[2]<60?+m[1]*60+ +m[2]:null};
const tfmt=n=>{n=((n%1440)+1440)%1440;return String(Math.floor(n/60)).padStart(2,'0')+':'+String(n%60).padStart(2,'0')};
const fmtDur=m=>m<60?m+' 分':Math.floor(m/60)+' 小時'+(m%60?' '+m%60+' 分':'');
let EST={},PREV={},EARLY={},ENDCUR={},ENDGUESS={};
const legKey=(a,b)=>[a.title,a.area,a.q,b.title,b.area,b.q].map(x=>x||'').join('|');
/* the stop before b, unless a transport row sits between them (that row is the trip) */
function legPrev(b){const a=PREV[b.id];if(!a)return null;const its=dayItems(b.day),i=its.findIndex(x=>x.id===a.id),j=its.findIndex(x=>x.id===b.id);
  return its.slice(i+1,j).some(x=>x.kind==='move')?null:a}
const HOTEL_STOP=()=>HOTEL()?{id:'hotel',title:'飯店',area:'',q:HOTEL(),kind:'stay'}:null;
function buildEst(){EST={};PREV={};EARLY={};for(const k in NEXT)PREV[NEXT[k].id]=S.items.get(k);
  const H=HOTEL_STOP();if(H)for(let n=2;n<=NDAYS;n++){const f=dayItems(n).find(isStop);if(f&&!PREV[f.id])PREV[f.id]=H}
  for(let n=1;n<=NDAYS;n++){let cur=tmin(dayDep(n)),last=null;
    /* cur = when you're free again (the last end time); anything without an end makes it unknown */
    for(const it of dayItems(n)){
      if(!it.time&&cur!=null){const l=leg(it),v=cur+(l&&l.min!=null?l.min:0);if(v<1440)EST[it.id]=v}
      const st=it.time?tmin(it.time):EST[it.id]!=null?EST[it.id]:null,e=tmin(it.end);
      if(it.time&&st!=null&&last!=null&&st<last)EARLY[it.id]=1;
      const pt=e!=null?e:st;if(pt!=null&&(last==null||pt>last))last=pt;
      /* no end time: assume the usual stay, so the stops after it still get a time (typed times always win and restart the chain) */
      cur=e!=null?e:st!=null&&dwell(it)!=null?st+dwell(it):null;
      if(it.kind==='move'&&e==null&&st!=null){const d=moveMin(it).min;if(d!=null)cur=st+d}}
    ENDCUR[n]=cur;
    /* no 出發時間 and no typed times: guess the day's end from 09:00 so a packed day still gets flagged */
    if(cur==null&&!dayDep(n)){let g=9*60,ok=false;for(const it of dayItems(n)){if(!isStop(it)&&it.kind!=='move')continue;const t=tmin(it.time);if(t!=null)g=Math.max(g,t);else{const l=leg(it);g+=l&&l.min!=null?l.min:20}
        const e=tmin(it.end),d=dwell(it);g=e!=null?Math.max(g,e):g+(d!=null?d:60);ok=true}ENDGUESS[n]=ok?g:null}else ENDGUESS[n]=null}}
/* usual time spent at a stop when no end time is typed: meals by 早/午/晚, sights and shops about an hour; hotel stops and todos break the chain */
function dwell(it){if(+it.stay>0&&STAY_KINDS.includes(it.kind))return +it.stay;if(it.kind==='food')return it.slot==='dinner'?90:it.slot==='breakfast'?45:60;
  if(it.kind==='spot')return 90;if(it.kind==='shop')return 60;return null}
function timeHTML(it){return timeHTML0(it)+ohWarn(it)}
function timeHTML0(it){const s=tmin(it.time),e=tmin(it.end),stay=s!=null&&e!=null&&e>s?'<small>・'+fmtDur(e-s)+'</small>':'';
  if(it.time)return '<span class="itime">'+esc(it.time)+(it.end?'–'+esc(it.end):'')+stay+'</span>'+(EARLY[it.id]?'<span class="tbad" title="這個時間比排在前面的行程早，可以拖曳調整順序">⚠ 比上一站早</span>':'');
  if(EST[it.id]!=null){const es=EST[it.id];return '<span class="itime est" title="依上一站結束時間＋交通推算">約 '+tfmt(es)+(it.end?'–'+esc(it.end):'')+(e!=null&&e>es?'<small>・'+fmtDur(e-es)+'</small>':'')+'</span>'}
  return it.end?'<span class="itime">～'+esc(it.end)+'</span>':''}
/* AI: minutes by public transport and by taxi for every pair of stops it hasn't seen yet */
let CM_BUSY=false;const CM_TRIED=new Set();
async function findCommutes(){
  if(CM_BUSY||!S.sample||!S.canWrite)return;buildNext();buildEst();
  const pairs=[];for(const it of S.items.values()){const a=legPrev(it);if(!a)continue;const k=legKey(a,it);
    if((it.cmFrom!==a.id||it.cmT==null||it.cmW==null||(it.cmK&&it.cmK!==k))&&!CM_TRIED.has(it.id+'>'+k))pairs.push([a,it])}
  if(!pairs.length)return;CM_BUSY=true;
  try{for(let i=0;i<pairs.length&&i<40;i+=20){const part=pairs.slice(i,i+20);part.forEach(([a,b])=>CM_TRIED.add(b.id+'>'+legKey(a,b)));
    const prompt='下面每一行是'+(T.dest||'日本')+'的兩個地點（括號是地區）。請估算從前一個到後一個大約要幾分鐘，給三個數字：①搭電車／地鐵／公車（含走到車站與轉乘；很近就直接走路的時間）②搭計程車 ③全程走路。只回覆 JSON 陣列，每一項是 [電車分鐘, 計程車分鐘, 走路分鐘]，順序和編號一一對應，例如 [[25,12,70],[8,5,10]]。\n'+
      part.map(([a,b],k)=>(k+1)+'. '+a.title.slice(0,30)+'（'+(a.area||'')+'）→ '+b.title.slice(0,30)+'（'+(b.area||'')+'）').join('\n');
    let out;try{const r=await S.sample(prompt);out=JSON.parse((r.text.match(/\[[\s\S]*\]/)||['[]'])[0])}catch(e){break}
    if(!Array.isArray(out)||out.length!==part.length)continue;
    part.forEach(([a,b],k)=>{const v=out[k];if(!Array.isArray(v))return;const t=Math.round(+v[0]),x=Math.round(+v[1]),wk=Math.round(+v[2]);if(!(t>=0&&t<=300&&x>=0&&x<=300))return;
      const cur=S.items.get(b.id);if(!cur)return;const lk=legKey(a,b),p={cmFrom:a.id,cmT:t,cmX:x,cmW:wk>=0&&wk<=600?wk:null,cmK:lk};if(cur.cmFrom!==a.id||(cur.cmK&&cur.cmK!==lk))p.cmMan=null;
      S.items.set(b.id,Object.assign({},cur,p));queue('items'+b.id,()=>ref('items',b.id).update(p))});
    render()}}
  finally{CM_BUSY=false}}

/* transport rows: how you go is chosen by hand (tm) — the guess from the name only fills in until you pick */
const TM_ORDER=['train','bus','taxi','walk','plane','ship'];
const TM_ICON={train:'🚃',bus:'🚌',taxi:'🚕',walk:'🚶',plane:'✈️',ship:'⛴️'};
function modeField(it){if(it.kind!=='move')return '';const cur=(tmode(it)||[])[0]||'';
  return '<div class="fld"><span class="lbl">交通方式<span class="opt">這段交通搭什麼</span></span><div class="seg" id="seg-tm">'+TM_ORDER.map(k=>{const m=TMODES.find(x=>x[0]===k);
    return '<button type="button" data-v="'+k+'" aria-pressed="'+(cur===k)+'">'+TM_ICON[k]+' '+m[1]+'</button>'}).join('')+'</div></div>'+moveMinField(it)}
document.addEventListener('click',e=>{const t=e.target.closest&&e.target.closest('.legbtn:not(.legnav),.legedit');if(!t)return;e.preventDefault();e.stopPropagation();openLeg(t.dataset.leg)},true);
/* the date strip gets its shadow only while it is stuck to the top */
(function(){const upd=()=>{const b=document.querySelector('.bar-wrap');if(!b)return;document.body.classList.toggle('bar-stuck',b.getBoundingClientRect().top<=1&&scrollY>0)};addEventListener('scroll',upd,{passive:true});addEventListener('resize',upd);setTimeout(upd,0)})();

/* "交通已經排在「…」" in an edit sheet opens that transport row */
document.addEventListener('click',e=>{const b=e.target.closest&&e.target.closest('[data-open-item]');if(!b)return;e.preventDefault();e.stopPropagation();const id=b.dataset.openItem;closeSheet();setTimeout(()=>openEdit(id),250)},true);

/* ---------- 交通 between two stops: one look, one way to change it ----------
   Shown as the last line of a card: "去下一站 🚃 電車・約 25 分 ›" (first stop of a day: "從飯店 …"). Tap it → 交通 sheet.
   交通方式 has the same six choices as a transport row. AI estimates minutes by train/bus (cmT), taxi (cmX) and on foot (cmW);
   the minutes you type (cmMan) win. Kept on the later stop: cmFrom, cmMode, cmT, cmX, cmW, cmMan, cmK. */
const LEG_MODE=b=>{const m=b.cmMode;if(m)return m==='transit'?'train':m;const n=noteLeg(b);return n?n.mode:'train'};
const legAi=(b,mode)=>mode==='taxi'?b.cmX:mode==='walk'?b.cmW:(mode==='train'||mode==='bus')?b.cmT:null;
function leg(b){const a=legPrev(b);if(!a)return null;const mode=LEG_MODE(b),nl=noteLeg(b),nm=nl&&nl.mode===mode?nl.min:null;
  if(b.cmFrom!==a.id||(b.cmK&&b.cmK!==legKey(a,b)))return {a,mode,min:nm,ai:null};
  const ai=legAi(b,mode);return {a,mode,min:b.cmMan!=null&&b.cmMan!==''?+b.cmMan:nm!=null?nm:(ai!=null?+ai:null),ai:ai!=null?+ai:null}}
const legUrl=(a,b,mode)=>'https://www.google.com/maps/dir/?api=1&travelmode='+(mode==='taxi'?'driving':mode==='walk'?'walking':'transit')+'&origin='+encodeURIComponent(placeQuery(a))+'&destination='+encodeURIComponent(placeQuery(b));
const legText=l=>{const m=TMODES.find(x=>x[0]===l.mode);return TM_ICON[l.mode]+' '+(m?m[1]:'')+(l.min!=null?'・約 '+l.min+' 分':'')};
const legTextW=l=>'<span class="legtx">'+legText(l)+'</span>';
function legLine(b,lead){const l=leg(b);if(!l)return '';const u=mapUrl(b);
  /* the mode and minutes are a button (change 步行→電車, the minutes, 出發時間); only 導航 opens Google Maps */
  return '<div class="gonext legnav"><button type="button" class="legedit" data-leg="'+esc(b.id)+'" aria-label="修改到「'+esc(b.title)+'」的交通"><span class="leglead">'+lead+'</span>'+legTextW(l)+'</button></div>'}
/* after the last stop of a day (not the last day): the way back to the hotel */
function backLine(it){const h=HOTEL();if(!h||!(it.day>0)||it.day>=NDAYS||!PLACE_KINDS.includes(it.kind))return '';
  /* only after the day's last place (a shop with no area yet still counts as a later stop) */
  {const its=dayItems(it.day),i=its.findIndex(x=>x.id===it.id);if(its.slice(i+1).some(x=>x.kind!=='todo'))return ''}
  return '<div class="gonext legnav back"><span class="leglead">🏨 回飯店</span><a class="navpill" href="https://www.google.com/maps/search/?api=1&query='+encodeURIComponent(h)+'" target="_blank" rel="noopener" aria-label="在 Google 地圖打開飯店">'+PIN+'地圖</a></div>'}
/* tap the line → Google Maps directions from where you are now (no origin = current location) */
const navUrl=(b,mode)=>'https://www.google.com/maps/dir/?api=1&travelmode='+(mode==='taxi'?'driving':mode==='walk'?'walking':'transit')+'&destination='+encodeURIComponent(placeQuery(b));
/* the last line of a card: how you get to the next stop */
function nextLink(it){const nx=NEXT[it.id];return nx?legLine(nx,'去下一站'):''}
/* 交通 sheet: 交通方式 (six choices), minutes, Google route */
function legField(b){const a=legPrev(b);if(!a)return '';const l=leg(b),mode=l.mode,same=b.cmFrom===a.id&&!(b.cmK&&b.cmK!==legKey(a,b));
  const ai={train:same?b.cmT:null,bus:same?b.cmT:null,taxi:same?b.cmX:null,walk:same?b.cmW:null},man=same&&b.cmMan!=null?b.cmMan:'';
  const ph=m=>ai[m]!=null?'約'+ai[m]+'（AI）':(m==='plane'||m==='ship'?'自己填':'AI 估算中');
  return '<div class="fld legf" data-from="'+esc(a.id)+'" data-ai=\''+esc(JSON.stringify(ai))+'\'><span class="lbl">交通方式<span class="opt">從「'+esc(a.title.slice(0,16))+'」過來</span></span>'+
    '<div class="seg" id="seg-leg">'+TM_ORDER.map(k=>'<button type="button" data-v="'+k+'" aria-pressed="'+(mode===k)+'">'+TM_ICON[k]+' '+TMODES.find(x=>x[0]===k)[1]+'</button>').join('')+'</div>'+
    '<div class="legmin"><label for="e-cm">要多久</label><input class="inp" id="e-cm" inputmode="numeric" placeholder="'+ph(mode)+'" value="'+esc(man)+'"><span>分鐘</span></div></div>'}
function bindLeg(root,st){const ps=root.querySelector('#e-pos');if(ps){const it0=ps.dataset.id,f0=root.querySelector('#e-posf');
    root.querySelector('#seg-day').addEventListener('click',()=>setTimeout(()=>{ps.innerHTML=posOpts(st.day,it0,1);f0.hidden=!(st.day>0)},0));
    ps.addEventListener('change',()=>{const sl=root.querySelector('#slot-wrap');if(sl)sl.closest('.fld').hidden=!!ps.value})}bindSeg(root,'seg-tm',v=>st.tm=v);const f=root.querySelector('.legf');if(!f)return;st.legMode=(root.querySelector('#seg-leg [aria-pressed="true"]')||{dataset:{v:'train'}}).dataset.v;
  const ai=JSON.parse(f.dataset.ai||'{}');
  bindSeg(root,'seg-leg',v=>{st.legMode=v;const cm=root.querySelector('#e-cm');if(cm)cm.placeholder=ai[v]!=null?'約'+ai[v]+'（AI）':(v==='plane'||v==='ship'?'自己填':'AI 估算中')})}
function legPatch(root,st,cur,p){if('title' in p&&p.title!==cur.title){const mv=root.querySelector('#e-map');if(!('map' in p)&&!(mv&&mv.value.trim()!==(cur.map||''))){p.map='';}if(!('q' in p)){p.q=''}if(!('desc' in p)){p.desc=''}{const ar=root.querySelector('#e-area');if(!('area' in p)&&!(ar&&ar.value.trim()!==(cur.area||'')))p.area=''}Object.assign(p,{aq:null,pic:null,oh:'',ol:'',ohq:null,cq:null,closed:'',rec:'',recq:null,dq:null,cmT:null,cmX:null,cmW:null,cmK:null},cur.stayq?{}:{stay:0,stayq:null,stayAi:false})}
  if(st.tm&&st.tm!==(cur.tm||''))p.tm=st.tm;
  const ps=root.querySelector('#e-pos');st.posOrder=null;if(ps&&ps.value&&st.day>0){const pl=placeFor({day:st.day,kind:st.kind,time:''},ps.value,null,cur.id);if(pl){st.slot=pl.slot;st.posOrder=pl.order}}
  {const si=root.querySelector('#e-stay'),sb=root.querySelector('#seg-stay button[aria-pressed="true"]'),tv=si?Math.max(0,Math.min(1440,Math.round(+si.value.replace(/[^\d.]/g,'')||0))):0,v=tv||(sb?+sb.dataset.v:0);if(root.querySelector('#seg-stay')&&v!==(+cur.stay||0)){p.stay=v;p.stayq=1;p.stayAi=false}}
  const rc=root.querySelector('#e-rec');if(rc){const v=rc.value.trim().slice(0,40);if(v!==(cur.rec||'')){p.rec=v;p.recq=1}}
  const oh=root.querySelector('#e-oh');if(oh){const v=oh.value.trim();if(v!==ohText(cur)){const m=ohParse(v);if(v===''){p.oh='';p.ol='';p.ohq=1;p.ohv=2}else if(m){p.oh=tfmt(m.o)+'-'+tfmt(m.c);p.ol=m.l!=null?tfmt(m.l):'';p.ohq=1;p.ohv=2}else toast('營業時間請寫成 10:00-21:00')}}
  const mv=root.querySelector('#e-mv');if(mv){const v=mv.value.trim(),man=v===''?null:Math.max(0,Math.round(+v.replace(/[^\d.]/g,'')||0)),was=cur.mvMan==null||cur.mvMan===''?null:+cur.mvMan;if(man!==was)p.mvMan=man}const f=root.querySelector('.legf');if(!f)return;const from=f.dataset.from;
  if(!from){if(LEG_MODE(cur)!==st.legMode)p.cmMode=st.legMode;return}const v=root.querySelector('#e-cm').value.trim();
  const man=v===''?null:Math.max(0,Math.round(+v.replace(/[^\d.]/g,'')||0)),same=cur.cmFrom===from;
  if(LEG_MODE(cur)!==st.legMode)p.cmMode=st.legMode;
  if(!same){p.cmFrom=from;p.cmT=null;p.cmX=null;p.cmW=null;p.cmK=null}
  if((same?cur.cmMan:null)!==man&&!(man==null&&cur.cmMan==null))p.cmMan=man}

function openLeg(bid){const b=S.items.get(bid);if(!b)return;const a=legPrev(b);if(!a)return;const ro=!S.canWrite;S.readSheet=ro;const st={};const l=leg(b);
  const first=FIRST.has(bid),dep=(S.days.get('d'+b.day)||{}).dep||'';
  openSheet('<h2>交通</h2><p class="legft">'+esc(first?'飯店':a.title)+'<span>→</span>'+esc(b.title)+'</p>'+
    (ro?'<p class="hint2">'+legText(l)+'</p>':first?legField(b).replace('<div class="legmin">','<div class="legmin depmin"><label for="lg-dep">出發</label><input class="inp" id="lg-dep" inputmode="numeric" placeholder="07:30" value="'+esc(dep)+'">'):legField(b))+
    '<div class="btns"><span class="sp"></span><button type="button" class="btn" id="leg-cancel">'+(ro?'關閉':'取消')+'</button>'+(ro?'':'<button type="button" class="btn pri" id="leg-save">儲存</button>')+'</div>',
  root=>{root.querySelector('#leg-cancel').onclick=closeSheet;if(ro)return;bindLeg(root,st);
    root.querySelector('#leg-save').onclick=()=>{const cur=S.items.get(bid)||b,p={};
      const di=root.querySelector('#lg-dep');if(di){const v=normT(di.value);if(v&&tmin(v)==null){toast('時間請寫成 07:30 這樣');di.focus();return}
        if(v!==dep){const dd=Object.assign({},S.days.get('d'+b.day),{dep:v});S.days.set('d'+b.day,dd);queue('d'+b.day,()=>S.db.collection('days').doc('d'+b.day).set(dd))}}
      legPatch(root,st,cur,p);closeSheet();if(Object.keys(p).length)patch('items',bid,p,'已儲存交通');else render()}})}

/* edit sheet of a place / food / …: 交通方式 is always there; 要多久 only when there is a stop before it */
function legFieldAll(it){if(it.kind==='move'||it.kind==='todo'||!(it.day>0))return '';if(legPrev(it))return legField(it);const mode=LEG_MODE(it);
  return '<div class="fld legf" data-from="" data-ai="{}"><span class="lbl">交通方式<span class="opt">從上一站過來</span></span><div class="seg" id="seg-leg">'+
    TM_ORDER.map(k=>'<button type="button" data-v="'+k+'" aria-pressed="'+(mode===k)+'">'+TM_ICON[k]+' '+TMODES.find(x=>x[0]===k)[1]+'</button>').join('')+'</div></div>'}
/* 待辦 lives in the to-do lists, not on the timeline: the edit sheet of a place doesn't offer it as a type */
function kindSeg(sel){return '<div class="seg" id="seg-kind">'+KINDS.filter(([k])=>k!=='todo'||sel==='todo').map(([k,l])=>'<button type="button" data-v="'+k+'" aria-pressed="'+(sel===k)+'">'+l+'</button>').join('')+'</div>'}

/* where a checklist item shows up, in words (for toasts) and what its date means (for the date field) */
function listWhere(type,day){const l=(LTYPES.find(x=>x.k===type)||{l:'清單'}).l;
  if(day>0&&(type==='todo'||type==='buy'))return ' '+md(dayDate(day))+' 的今日要辦';
  if(day>0)return l+'（'+md(dayDate(day))+'，當天也會提醒）';
  return type==='todo'?'行前待辦':l}
function dateLbl(type){return type==='todo'?'哪一天要做<span class="opt">不選＝出發前要做的</span>':type==='buy'?'哪一天買<span class="opt">不選＝出發前要買的</span>':'使用日期<span class="opt">選填</span>'}

/* 時段 follows 類型: 美食 → 早餐／早午餐／午餐／下午茶／晚餐; other types → 上午／下午／晚上; type not known yet → all six.
   A stored slot from the other family is shown as its nearest match (a 景點 saved at 午餐 shows 下午) */
const SLOT_MEAL={breakfast:'morning',lunch:'afternoon',dinner:'evening'},SLOT_PART={evening:'dinner'};
const FOOD_SLOTS=[['breakfast','早餐'],['morning','早午餐'],['lunch','午餐'],['afternoon','下午茶'],['dinner','晚餐']],PART_SLOTS=[['morning','上午'],['afternoon','下午'],['evening','晚上']];
function slotKeys(kind,sel){return (!kind?SLOTS.map(s=>[s.k,s.l]):kind==='food'?FOOD_SLOTS:PART_SLOTS).map(([k,l])=>({k,l}))}
function slotFit(slot,kind){if(!slot||slot==='pool'||!kind)return slot;if(kind==='food')return SLOT_PART[slot]||slot;return SLOT_MEAL[slot]||slot}
function slotSeg(sel,day,kind){if(day===0)return '<div class="seg" id="seg-slot"><button type="button" data-v="pool" aria-pressed="true">口袋名單</button></div>';
  return '<div class="seg" id="seg-slot">'+slotKeys(kind,sel).map(s=>'<button type="button" data-v="'+s.k+'" aria-pressed="'+(slotFit(sel,kind)===s.k)+'">'+s.l+'</button>').join('')+'</div>'}

/* ⑧ 交通 sits between two cards on the timeline (its own row, easy to tap), not inside a card */
const legc=h=>h?'<div class="legc">'+h+'</div>':'';
/* the day's 出發時間 and how you leave the hotel are one line: "05:00 出發 🚃 電車・約 25 分" (no time set: "從飯店 …") */
function itemLegs(it){return (FIRST.has(it.id)?legc(legLine(it,dayDep(it.day)?dayDep(it.day)+' 出發':'從飯店')):'')+(it.kind==='move'&&it.day>0?moveRowHTML(it):withCm(itemHTML(it),it))+legc(nextLink(it))+legc(backLine(it))}


/* ② on trip days (not the day you fly out or home) the boarding pass folds into one line that still shows the flight home */
function passMini(){const h=document.getElementById('trip-hero');if(!h)return;const n=todayN(),mid=n>=2&&n<=NDAYS-1;
  document.body.classList.toggle('trip-mid',mid);let b=h.querySelector('.pass-mini');
  if(!mid){if(b)b.remove();document.body.classList.remove('pass-open');return}
  if(!b){b=document.createElement('button');b.type='button';b.className='pass-mini';
    b.addEventListener('click',()=>{document.body.classList.toggle('pass-open');passMini()});h.insertBefore(b,h.querySelector('.pass'))}
  const k=T.back||{},end=dayDate(NDAYS),open=document.body.classList.contains('pass-open');
  b.setAttribute('aria-expanded',String(open));
  b.innerHTML='<span class="pm-l">✈️ 回程</span><b>'+md(end)+'（'+WK[end.getDay()]+'）'+esc(k.dep||'')+'</b><span class="pm-r">'+esc([k.from,k.to].filter(Boolean).join(' → '))+'</span><span class="pm-a">'+(open?'收起':'看機票 ›')+'</span>'}
{const r0=render;render=function(){r0();passMini()}}

/* ① a new version shows up by itself: checked when the app comes back to the screen; reloads only when nothing is being typed */
let UPD_T=0;
/* no automatic reload in the first minute after opening: the page just came from the network (the service worker fetches it first), and a reload right at launch is the one navigation that could be handed to another app */
const OPENED_AT=Date.now();
async function checkUpdate(){if(Date.now()-OPENED_AT<60000)return;if(Date.now()-UPD_T<60000)return;UPD_T=Date.now();
  try{const t=await (await fetch(location.pathname+'?v='+Date.now(),{cache:'no-store'})).text();const m=t.match(/__BUILD='([\d.]+)'/);
    if(!m||!window.__BUILD||m[1]===window.__BUILD)return;const k='tn-upd-'+m[1];if(sessionStorage.getItem(k))return;
    const a=document.activeElement;if(document.querySelector('.sheet')||S.drag||(a&&/^(INPUT|TEXTAREA)$/.test(a.tagName))){UPD_T=0;return}
    sessionStorage.setItem(k,'1');location.reload()}catch(e){}}
document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='visible')checkUpdate()});
setTimeout(checkUpdate,61000);setInterval(()=>{if(document.visibilityState==='visible')checkUpdate()},600000);

/* ---------- transport rows (交通 items) drawn like the "去下一站" line ----------
   "10:30 🚕 計程車 出門搭 Yoxi・約 40 分 ›" — tap opens the row (交通方式 + 要多久).
   Minutes: what you typed (mvMan) > from times (its own end, times in the note, or the next item's start) > AI (mvAi, valid while mvK matches). */
function moveNb(it){const its=dayItems(it.day),i=its.findIndex(x=>x.id===it.id);return {a:i>0?its[i-1]:null,b:i>=0?its[i+1]||null:null}}
const moveKey=it=>{const n=moveNb(it);return [it.title,n.a&&n.a.title,n.b&&n.b.title].map(x=>x||'').join('|')};
function moveMin(it){if(it.mvMan!=null&&it.mvMan!=='')return {min:+it.mvMan,src:'man'};
  const s=tmin(it.time),e=tmin(it.end);if(s!=null&&e!=null&&e>s)return {min:e-s,src:'time'};
  const r=[it.note,it.desc].filter(Boolean).join(' ').match(/(\d{1,2}):(\d{2})\s*(?:[–\-~～→]|到)\s*(\d{1,2}):(\d{2})/);
  if(r){let d=(+r[3]*60+ +r[4])-(+r[1]*60+ +r[2]);if(d<0)d+=1440;if(d>0&&d<=720)return {min:d,src:'time'}}
  const md=(tmode(it)||[])[0],b=moveNb(it).b,nt=b?tmin(b.time):null;if(md!=='plane'&&md!=='ship'&&s!=null&&nt!=null&&nt>s&&nt-s<=90)return {min:nt-s,src:'time'};
  if(it.mvAi!=null&&it.mvK===moveKey(it)&&mvOk(it,+it.mvAi))return {min:+it.mvAi,src:'ai'};return {min:null,src:''}}
/* a ground trip over 2½ hours is a bad guess (it counted the wait), so it is asked again */
const mvOk=(it,v)=>{const md=(tmode(it)||[])[0];return v>0&&v<=(md==='plane'||md==='ship'?900:150)};
const MV_GRIP='<svg width="12" height="20" viewBox="0 0 12 20" fill="currentColor"><circle cx="3" cy="4" r="1.6"/><circle cx="9" cy="4" r="1.6"/><circle cx="3" cy="10" r="1.6"/><circle cx="9" cy="10" r="1.6"/><circle cx="3" cy="16" r="1.6"/><circle cx="9" cy="16" r="1.6"/></svg>';
function moveRowHTML(it){const m=tmode(it),d=moveMin(it);
  return '<div class="item is-move mvrow" data-id="'+esc(it.id)+'"><button type="button" class="grip" aria-label="拖曳移動 '+esc(it.title)+'">'+MV_GRIP+'</button>'+
    '<div class="ibody" role="button" tabindex="0" aria-label="交通「'+esc(it.title)+'」">'+(it.time?'<span class="itime mvt">'+esc(it.time)+'</span>':'')+
    '<span class="mv-m">'+(m?TM_ICON[m[0]]+' '+m[1]:'🧭 交通')+'</span><span class="ititle mv-n">'+esc(it.title)+'</span>'+
    (d.min!=null?'<span class="mv-d">・約 '+fmtDur(d.min)+'</span>':'')+'<span class="legarr">›</span></div></div>'}
function moveMinField(it){const d=moveMin(it),man=it.mvMan!=null&&it.mvMan!==''?it.mvMan:'';
  const ph=d.min!=null&&d.src!=='man'?'約 '+d.min+(d.src==='ai'?'（AI）':'（依時間）'):(it.mvMan!=null&&it.mvMan!==''?'':'AI 估算中');
  return '<div class="fld"><label for="e-mv">要多久</label><div class="legmin"><input class="inp" id="e-mv" inputmode="numeric" placeholder="'+esc(ph)+'" value="'+esc(man)+'"><span>分鐘</span></div>'+
    '<span class="hint2">有填時間就自動算，沒有就交給 AI；也可以自己填，清空就交回自動。</span></div>'}
let MV_BUSY=false;const MV_TRIED=new Set();
async function findMoves(){if(MV_BUSY||!S.sample||!S.canWrite)return;
  const todo=[...S.items.values()].filter(it=>it.kind==='move'&&it.day>0&&it.title&&moveMin(it).min==null&&!MV_TRIED.has(it.id+'>'+moveKey(it))).slice(0,20);
  if(!todo.length)return;MV_BUSY=true;
  try{todo.forEach(it=>MV_TRIED.add(it.id+'>'+moveKey(it)));
    const prompt='下面是'+(T.dest||'日本')+'旅行裡的交通段落。每一行是交通內容，括號裡是行程上它的前一項和後一項（只是讓你知道大概從哪裡到哪裡，後一項的時間跟這段交通無關）。請估算每一段交通本身大約要花幾分鐘：只算坐車／走路的時間，不要算等待、排隊、提早到機場或候機的時間；飛機算起飛到降落。只回覆 JSON 數字陣列，順序和編號一一對應，例如 [40,15]。\n'+
      todo.map((it,k)=>{const n=moveNb(it);return (k+1)+'. '+it.title.slice(0,40)+'（前一項：'+(n.a?n.a.title.slice(0,24):'無')+'；後一項：'+(n.b?n.b.title.slice(0,24):'無')+'）'}).join('\n');
    let out;try{const r=await S.sample(prompt);out=JSON.parse((r.text.match(/\[[\s\S]*\]/)||['[]'])[0])}catch(e){return}
    if(!Array.isArray(out)||out.length!==todo.length)return;
    todo.forEach((it,k)=>{const v=Math.round(+out[k]);if(!mvOk(it,v))return;const cur=S.items.get(it.id);if(!cur)return;
      const p={mvAi:v,mvK:moveKey(cur)};S.items.set(it.id,Object.assign({},cur,p));queue('items'+it.id,()=>ref('items',it.id).update(p))});
    render()}
  finally{MV_BUSY=false}}

/* after adding: scroll to the new card and flash it, so you see where it landed (and which time it got) */
function flashNew(ids){if(!ids||!ids.length)return;setTimeout(()=>{const el=document.querySelector('.col.active .item[data-id="'+ids[0]+'"],.col.active .crow[data-lid="'+ids[0]+'"]')||document.querySelector('.item[data-id="'+ids[0]+'"],.crow[data-lid="'+ids[0]+'"]');if(!el)return;el.scrollIntoView({block:'center',behavior:'smooth'});el.classList.add('flash');setTimeout(()=>el.classList.remove('flash'),1800)},80)}

/* ---------- a start time for each day, and when the day ends ----------
   days/dN.dep = "07:30" (from the hotel). The first stop without a time is estimated from it; typed times still win.
   The day header shows "🏨 07:30 出發・預計 21:40 結束" (a day that runs past 22:00 is flagged). Tap it to change. */
const dayDep=n=>{const v=(S.days.get('d'+n)||{}).dep;return tmin(v)!=null?v:''};
function dayTimeChip(n){const dep=dayDep(n),e=ENDCUR[n],eg=ENDGUESS[n],late=n<NDAYS&&(e!=null?e>22*60:eg!=null&&eg>22*60);if(!dep&&e==null&&!S.canWrite)return '';
  const t=(dep?'🏨 '+dep+' 出發':'＋ 出發時間')+(e!=null&&e<1440?'・預計 '+tfmt(e)+' 結束':'');
  return '<button type="button" class="dtchip'+(late?' late':'')+(dep?'':' dim')+'" data-edit-day="'+n+'" aria-label="每天出發時間">'+t+(late?'・可能太滿':'')+'</button>'}
function openDayTitle(n){if(!canWrite())return;const d=S.days.get('d'+n)||{},cur=d.title||'';S.readSheet=false;
  openSheet('<h2>Day '+n+'・'+md(dayDate(n))+'</h2><div class="fld" hidden><label for="d-title">這天主要去哪</label><input class="inp" id="d-title" placeholder="例 上野・淺草" value="'+esc(cur)+'"></div>'+
   '<div class="fld"><label for="d-dep">幾點從飯店出發<span class="opt">選填，每天可以不一樣；沒填時間的行程會從這裡往後排</span></label><input class="inp" id="d-dep" inputmode="numeric" placeholder="例 07:30" value="'+esc(d.dep||'')+'"></div>'+
   '<div class="fld"><label for="d-swap">跟哪一天交換<span class="opt">整天的行程、待辦、標題一起換</span></label><div class="swaprow"><select class="inp" id="d-swap"><option value="">選一天</option>'+Array.from({length:NDAYS},(_,k)=>k+1).filter(k=>k!==n).map(k=>'<option value="'+k+'">Day '+k+'・'+md(dayDate(k))+((autoDayTitle(k)||(S.days.get('d'+k)||{}).title)?'・'+esc(String(autoDayTitle(k)||S.days.get('d'+k).title).slice(0,12)):'')+'</option>').join('')+'</select><button type="button" class="btn" id="d-swapgo">交換</button></div></div>'+
   '<div class="btns"><span class="sp"></span><button type="button" class="btn" id="d-cancel">取消</button><button type="button" class="btn pri" id="d-ok">儲存</button></div>',
  root=>{root.querySelector('#d-swapgo').onclick=()=>{const m=+root.querySelector('#d-swap').value;if(!m){toast('先選要交換的那一天');return}closeSheet();swapDays(n,m)};const i=root.querySelector('#d-title'),dp=root.querySelector('#d-dep');root.querySelector('#d-cancel').onclick=closeSheet;
    const go=()=>{const v=i.value.trim(),dv=normT(dp.value);if(dv&&tmin(dv)==null){toast('時間請寫成 07:30 這樣');dp.focus();return}
      closeSheet();if(v!==cur||dv!==(d.dep||'')){const nd=Object.assign({},d,{title:v,dep:dv});S.days.set('d'+n,nd);render();queue('d'+n,()=>S.db.collection('days').doc('d'+n).set(nd))}};
    root.querySelector('#d-ok').onclick=go;[i,dp].forEach(x=>x.addEventListener('keydown',e=>{if(e.key==='Enter')go()}))})}

/* ---------- opening hours ----------
   oh = "10:00-21:00" (closing past midnight is fine), ol = last entry/order "20:30", ohq = already asked (or typed by hand: then AI never touches it).
   A stop whose start time (typed or estimated) falls outside them gets a small warning next to the time. */
function ohParse(s){s=String(s||'');const m=s.match(/(\d{1,2})[:：](\d{2})\s*[-–~～到至]\s*(\d{1,2})[:：](\d{2})/);if(!m)return null;
  const o=+m[1]*60+ +m[2];let c=+m[3]*60+ +m[4];if(!(o<1440&&c<=2400&&+m[2]<60&&+m[4]<60))return null;if(c<=o)c+=1440;
  const l=s.match(/最後[^\d]{0,6}(\d{1,2})[:：](\d{2})/),lm=l?+l[1]*60+ +l[2]:null;return {o,c,l:lm!=null&&lm>=o?lm:null}}
/* 東京／日本 alone tells nothing on a Tokyo trip */
const areaShow=a=>String(a||'').split(/[,，、・\s]+/).filter(x=>x&&!/^(日本|東京都?|tokyo|japan|日本東京都?|東京都?日本)$/i.test(x)).join(' ');
const ohText=it=>it&&it.oh?it.oh+(it.ol?' 最後 '+it.ol:''):'';
function ohField(it){if(!PLACE_KINDS.includes(it.kind))return '';
  return '<div class="fld"><label for="e-oh">營業時間<span class="opt">AI 估的，不對就改；例 10:00-21:00，可加「最後 20:30」</span></label><input class="inp" id="e-oh" value="'+esc(ohText(it))+'" placeholder="'+(it.ohq?'不確定':'AI 估算中')+'" autocomplete="off"></div>'}
function ohWarn(it){if(!it||!it.oh||!PLACE_KINDS.includes(it.kind))return '';const h=ohParse(ohText(it));if(!h)return '';
  const st=it.time?tmin(it.time):EST[it.id]!=null?EST[it.id]:null;if(st==null)return '';
  const m=st<h.o?'⚠ '+tfmt(h.o)+' 才開':h.l!=null&&st>h.l?'⚠ 最後入場 '+tfmt(h.l):st>=h.c?'⚠ '+tfmt(h.c)+' 已打烊':'';
  return m?'<span class="tbad" title="營業時間 '+esc(ohText(it))+'（AI 估的，可能不準，點進去可以改）">'+m+'</span>':''}
let OH_BUSY=false;
async function findHours(){
  if(OH_BUSY||!S.sample||!S.canWrite)return;
  const todo=[...S.items.values()].filter(it=>PLACE_KINDS.includes(it.kind)&&it.title&&(it.area||it.q||safeUrl(it.map))&&(it.ohq==null||(it.ohq===1&&it.oh&&!it.ohv))).slice(0,40);
  if(!todo.length)return;OH_BUSY=true;
  try{for(let i=0;i<todo.length;i+=20){const part=todo.slice(i,i+20);
    const prompt='下面是'+(T.dest||'日本')+'的店家和景點。請寫出每一個「這間分店」實際的開門與關門時間（24 小時制，格式 10:00-21:00）。只有在你非常確定這間分店的時間時才填；同品牌不同分店時間常不同，不能拿別家分店或一般印象來猜，如果你確定有最後入場或最後點餐時間，加在後面，例如「10:00-21:00 最後 20:30」。每週各天不同、不確定、或需要預約時段的，填空字串，不要猜。只回覆 JSON 陣列，順序和編號一一對應。\n'+
      part.map((it,k)=>(k+1)+'. '+it.title.slice(0,40)+(it.area?'（'+String(it.area).slice(0,12)+'）':'')).join('\n');
    let out;try{const r=await S.sample(prompt);out=JSON.parse((r.text.match(/\[[\s\S]*\]/)||['[]'])[0])}catch(e){break}
    if(!Array.isArray(out)||out.length!==part.length)continue;
    part.forEach((it,k)=>{const cur=S.items.get(it.id);if(!cur||(cur.ohq!=null&&!(cur.ohq===1&&cur.oh&&!cur.ohv)))return;const h=typeof out[k]==='string'?ohParse(out[k]):null;
      const p=h?{oh:tfmt(h.o)+'-'+tfmt(h.c),ol:h.l!=null?tfmt(h.l):'',ohq:1,ohv:2}:{oh:'',ol:'',ohq:1,ohv:2};
      S.items.set(it.id,Object.assign({},cur,p));queue('items'+it.id,()=>ref('items',it.id).update(p))});
    render()}}
  finally{OH_BUSY=false}}

/* ---------- 新增: where the new stop goes, so it doesn't have to be dragged afterwards ----------
   排在哪裡: 自動 (a typed time puts it after the last stop that starts no later; no time → end of its 時段, as before),
   排在最前面, or 在「X」之後. The slot is the first one at or after X's that fits the type (美食 → meals, others → 上午／下午／晚上). */
const slotOk=(k,kind)=>kind==='food'?k in SLOT_MEAL:k in SLOT_PART;
function posOpts(day,skip,keep){if(!(day>0))return '<option value="">自動</option>';
  return '<option value="">'+(keep?'不動（目前的位置）':'自動（依時間或時段）')+'</option><option value="first">排在最前面</option>'+
    dayItems(day).filter(x=>x.id!==skip).map(x=>'<option value="'+esc(x.id)+'">在「'+esc(x.title.slice(0,16))+'」之後'+(x.time?'（'+esc(x.time)+'）':'')+'</option>').join('')}
function placeFor(r,pos,slot,skip){if(!r||!(r.day>0))return null;const its=dayItems(r.day).filter(x=>x.id!==skip),kind=r.kind;
  /* 排在最前面 = truly first of the day: it joins the first stop's 時段, just before it */
  if(pos==='first'){if(!its.length)return null;const f=its[0];return {slot:f.slot,order:f.order-1000,after:null}}let after=null;
  if(pos&&pos!=='first'){after=its.find(x=>x.id===pos)||null;if(!after)return null;
    /* picked by hand: right after that stop, in its 時段, whatever the type */
    const sm=its.filter(x=>x.slot===after.slot),nx=sm[sm.indexOf(after)+1];return {slot:after.slot,order:nx?(after.order+nx.order)/2:after.order+1000,after}}
  else if(!pos){if(slot)return null;const t=tmin(r.time);if(t==null)return null;let any=false;
    for(const x of its){const xt=x.time?tmin(x.time):EST[x.id]!=null?EST[x.id]:null;if(xt==null)continue;any=true;if(xt<=t)after=x}
    if(!any)return null}
  const ai=after?SLOT_I[after.slot]:0;let ts=SLOTS.find((s,i)=>i>=ai&&slotOk(s.k,kind)),tail=false;
  if(!ts){ts=[...SLOTS].reverse().find(s=>slotOk(s.k,kind));tail=true}if(!ts)return null;
  const inTs=its.filter(x=>x.slot===ts.k);let P=null,N=null;
  if(tail)P=inTs[inTs.length-1]||null;else if(after&&after.slot===ts.k){P=after;N=inTs[inTs.indexOf(after)+1]||null}else N=inTs[0]||null;
  const order=P&&N?(P.order+N.order)/2:P?P.order+1000:N?N.order-1000:1000;
  return {slot:ts.k,order,after}}

/* ---------- what you write in 備註 is used too ----------
   • how you get there: "搭中央線直達新宿（約 15 分）" → 🚃 電車・約 15 分 for the trip to this stop (what you pick or type still wins)
   • "要先訂位／建議訂位／要預約" → an entry in 訂位 (once per stop: bkq marks it, so deleting that entry is final)
   • "週一公休" → the same 公休 warning as the AI's 定休日 */
/* only real "how you get here" phrases count (搭／坐…線, 直達, 轉乘, 搭計程車, 走過去…), read clause by clause;
   a clause about leaving (走回銀座吃晚餐, 再去, 回飯店) is about the next trip, not this one */
const LEAVE=/走回|回到|再去|接著去|去吃|吃(?:午|晚)餐|回飯店/;
function noteLeg(b){const s=String(b&&b.note||'');if(!s)return null;
  for(const c of s.split(/[，。；;,：:\n]/)){if(!c.trim()||LEAVE.test(c))continue;
    const mode=/(?:搭|坐|叫)計程車|計程車過去|taxi|タクシー|uber|yoxi/i.test(c)?'taxi':/(?:搭|坐).{0,6}(?:公車|巴士|バス)/.test(c)?'bus':
      /(?:搭|坐).{0,10}(?:線|JR|電車|地鐵|捷運|新幹線|江之電|ゆりかもめ|京急|京王|小田急|東急|京成|Skyliner)|直達|轉乘/i.test(c)?'train':/走路|步行(?!者)|徒步|走過去|走到/.test(c)?'walk':null;
    if(!mode)continue;const m=c.match(/約\s*(\d+(?:\.\d+)?)\s*(小時|分)/),min=m?Math.round(m[2]==='小時'?+m[1]*60:+m[1]):null;
    return {mode,min:min>0&&min<=180?min:null}}
  return null}
function noteClosed(it){const s=String(it&&it.note||'').replace(/週末/g,'週六日');if(!s)return '';let out='',m;
  const re=/(?:週|星期|禮拜)([一二三四五六日天](?:[、,，／\/和及]?(?:週)?[一二三四五六日天])*)\s*(?:公休|休息|店休|定休|休館|不營業|沒開)|(?:公休|定休日?|休館日?)[：:\s]*(?:週|星期|禮拜)?([一二三四五六日天](?:[、,，／\/和及]?(?:週)?[一二三四五六日天])*)/g;
  while((m=re.exec(s)))out+=m[1]||m[2]||'';return [...new Set(out.replace(/天/g,'日').replace(/[^一二三四五六日]/g,''))].join('')}
const NEED_BOOK=/訂位|預約|要訂|先訂|需訂/,NO_BOOK=/不用訂|免訂|不必訂|不需訂|不需要訂|不收訂|不接受(?:訂位|預約)|不能(?:訂|預約)|無法(?:訂|預約)|不可(?:訂|預約)|不用預約|免預約|不需預約|已訂|訂好/;
/* 「燒肉亭 六歌仙」 and 「六歌仙 訂位」 are the same shop: any distinctive word of one appears in the other */
const SHOP_STOP=/^(燒肉|餐廳|本店|分店|訂位|預約|晚餐|午餐|早餐|門票|新宿|新宿店|銀座|澀谷|淺草|原宿|東京|日本)$/;
const shopWords=t=>String(t||'').split(/[\s・、,，（）()／\/：:]+/).filter(w=>w.length>=2&&!SHOP_STOP.test(w));
const sameShop=(a,b)=>shopWords(a).some(w=>String(b).includes(w))||shopWords(b).some(w=>String(a).includes(w));
const needBook=it=>PLACE_KINDS.includes(it.kind)&&NEED_BOOK.test(String(it.note||''))&&!NO_BOOK.test(String(it.note||''));
function syncBookings(){if(!S.canWrite)return;let n=0;
  for(const it of [...S.items.values()]){if(it.bkq!==undefined||!needBook(it))continue;
    const has=[...S.lists.values()].some(l=>(l.type==='book'||l.type==='ticket')&&sameShop(it.title,l.title));
    if(!has){create('lists',{type:'book',title:'訂位：'+it.title,note:it.note||'',done:false,day:it.day>0?it.day:0,photos:[],ts:Date.now()+n,order:Date.now()+n});n++}
    S.items.set(it.id,Object.assign({},it,{bkq:1}));queue('items'+it.id,()=>ref('items',it.id).update({bkq:1}))}
  if(n){render();toast('備註寫了要訂位的 '+n+' 個地方，已加到「訂位」')}}

/* during the trip, coming back after a while (30 min+) lands on today again — not after a short break, not while a sheet is open.
   tn-seen = when the page was last on screen; the start-up script in <head> uses it too, so an app the phone closed in the background
   and reopened within 30 min keeps the day you were looking at */
const seen=()=>{try{localStorage.setItem('tn-seen',String(Date.now()))}catch(e){}};seen();setInterval(()=>{if(!document.hidden)seen()},60000);addEventListener('pagehide',seen);
let AWAY_AT=0;
document.addEventListener('visibilitychange',()=>{if(document.hidden){AWAY_AT=Date.now();seen();return}
  if(!AWAY_AT||Date.now()-AWAY_AT<30*60e3||document.querySelector('.sheet'))return;AWAY_AT=0;const tn=todayN();if(tn>=1&&tn<=NDAYS&&S.active!==tn)setActive(tn)});

/* edit sheet: 排在哪裡 — move a stop anywhere (any day, after any stop) without dragging; 不動 keeps it where it is */
function posField(it){return '<div class="fld" id="e-posf"'+(it.day>0?'':' hidden')+'><label for="e-pos">排在哪裡<span class="opt">選了就不用拖</span></label><select class="inp" id="e-pos" data-id="'+esc(it.id)+'">'+posOpts(it.day,it.id,1)+'</select></div>'}

/* ---------- who changed what ---------- */
const myEmail=()=>((document.querySelector('#whoami b')||{}).textContent||'').trim();
function stampBy(act){return {_by:myEmail(),_at:Date.now(),_act:act}}
const whoName=e=>!e?'有人':e===myEmail()?'你':String(e).split('@')[0];
function ago(t){const m=Math.round((Date.now()-t)/60000);return m<1?'剛剛':m<60?m+' 分鐘前':m<1440?Math.round(m/60)+' 小時前':Math.round(m/1440)+' 天前'}
function recentHTML(){const rows=[];
  for(const it of S.items.values())if(it._at)rows.push({k:'i',id:it.id,t:it.title,w:it.day?dayLabel(it.day):'口袋名單',it});
  for(const r of S.lists.values())if(r._at)rows.push({k:'l',id:r.id,t:r.title,w:r.type==='diary'?md(dayDate(r.day))+' 日記':LT_L[r.type]||'清單',it:r});
  for(const e of S.exps.values())if(e._at)rows.push({k:'e',id:e.id,t:(e.shop||e.what||'花費')+'・'+yen(+e.amount||0),w:'花費',it:e});
  rows.sort((a,b)=>b.it._at-a.it._at);
  if(!rows.length)return '<div class="empty">打字搜尋店名、地區、清單、花費。之後誰加了或改了什麼，也會列在這裡。</div>';
  return '<div class="recent-h">最近更新</div>'+rows.slice(0,20).map(r=>'<button type="button" data-k="'+r.k+'" data-id="'+esc(r.id)+'"><b>'+esc(r.t)+'</b><span>'+esc(whoName(r.it._by))+(r.it._act==='add'?' 加了':r.it._act==='comment'?' 留言':' 改了')+'・'+ago(r.it._at)+'・'+esc(r.w)+'</span></button>').join('')}

/* ---------- 留言 on a trip card ----------
   it.cm = [{by, at, t}]. Card shows 💬 N; the card's sheet ends with the comments and a box to add one (saved right away, not with 儲存).
   You can delete your own. 最近更新 lists it as「留言」. */
const cmList=it=>Array.isArray(it&&it.cm)?it.cm:[];
function withCm(h,it){if(it&&it.oh&&PLACE_KINDS.includes(it.kind)){const k=h.indexOf('<span class="ititle"');if(k>7&&h.slice(k-7,k)==='</span>')h=h.slice(0,k-7)+'<span class="nb ioh" title="營業時間 '+esc(it.oh)+'">🕒'+esc(it.oh.replace('-','-'))+'</span>'+h.slice(k-7)}  /* 10:00-21:00 → 🕒10–21 */
  const n=cmList(it).length,rl=stayLine(it)+recLine(it);if(!n&&!rl)return h;const i=h.indexOf('class="ititle"');if(i<0)return h;const j=h.indexOf('</span>',i);if(j<0)return h;
  return h.slice(0,j+7)+(n?'<span class="cmcount" aria-label="'+n+' 則留言">💬 '+n+'</span>':'')+rl+h.slice(j+7)}
function cmWhen(t){const d=new Date(t);return (d.getMonth()+1)+'/'+d.getDate()+' '+String(d.getHours()).padStart(2,'0')+':'+String(d.getMinutes()).padStart(2,'0')}
function cmHTML(it,ro){const c=cmList(it),me=myEmail();
  return '<div class="fld cmbox" data-cm="'+esc(it.id)+'"><span class="lbl">留言'+(c.length?'<span class="opt">'+c.length+' 則</span>':'')+'</span>'+
    (c.length?'<ul class="cmlist">'+c.map((x,k)=>'<li><b>'+esc(whoName(x.by))+'</b><span class="cmt">'+esc(x.t)+'</span><small>'+cmWhen(x.at)+'</small>'+(!ro&&x.by&&x.by===me?'<button type="button" class="cmdel" data-k="'+k+'" aria-label="刪除這則留言">×</button>':'')+'</li>').join('')+'</ul>':'')+
    (ro?'':'<div class="cmadd"><input class="inp" id="cm-in" placeholder="寫給同行的人，例：這間要排隊，早點去" autocomplete="off" enterkeyhint="send"><button type="button" class="btn pri" id="cm-send">送出</button></div>')+'</div>'}
function cmPatch(id,list){const cur=S.items.get(id);if(!cur)return;const p=Object.assign({cm:list},stampBy('comment'));
  S.items.set(id,Object.assign({},cur,p));queue('items'+id,()=>ref('items',id).update(p));render();
  const box=document.querySelector('.cmbox[data-cm="'+CSS.escape(id)+'"]');if(box){const n=document.createElement('div');n.innerHTML=cmHTML(S.items.get(id),false);box.replaceWith(n.firstChild)}}
function cmSend(){const i=document.getElementById('cm-in');if(!i||!canWrite())return;const v=i.value.trim();if(!v){i.focus();return}const id=i.closest('.cmbox').dataset.cm;
  const cur=S.items.get(id);if(!cur)return;cmPatch(id,cmList(cur).concat({by:myEmail(),at:Date.now(),t:v.slice(0,500)}));const n=document.getElementById('cm-in');if(n)n.focus()}
document.addEventListener('click',e=>{const t=e.target;if(!t.closest)return;
  if(t.closest('#cm-send')){e.preventDefault();cmSend();return}
  const d=t.closest('.cmdel');if(d){e.preventDefault();if(!canWrite())return;const id=d.closest('.cmbox').dataset.cm,cur=S.items.get(id);if(!cur)return;
    if(!d.classList.contains('arm')){d.classList.add('arm');d.textContent='刪除？';setTimeout(()=>{if(d.isConnected){d.classList.remove('arm');d.textContent='×'}},3000);return}
    const k=+d.dataset.k,l=cmList(cur).slice();l.splice(k,1);cmPatch(id,l)}},true);
document.addEventListener('keydown',e=>{if(e.target&&e.target.id==='cm-in'&&e.key==='Enter'&&!e.isComposing){e.preventDefault();cmSend()}});

/* ---------- 今日日記: what happened that day, with photos ----------
   Kept as list rows of type 'diary' (day = that day), so sync, photos, search and 最近更新 work as for any list.
   Several entries a day, newest last; anyone on the trip can write. Tap an entry to edit or delete it. */
const diaryRows=n=>[...S.lists.values()].filter(r=>r.type==='diary'&&r.day===n).sort((a,b)=>(a.ts||0)-(b.ts||0));
function diaryHTML(n){const rows=diaryRows(n);if(!rows.length&&!S.canWrite)return '';
  return '<section class="dsec diary"><div class="dsec-h"><b>今日日記</b>'+(rows.length?'<small>'+rows.length+' 則</small>':'')+'</div>'+
    (rows.length?'<ul class="dlist">'+rows.map(r=>'<li><button type="button" class="dentry" data-diary="'+esc(r.id)+'"><span class="dmeta">'+cmWhen(r.ts||Date.now()).split(' ')[1]+'・'+esc(whoName(r._by))+'</span>'+
      (r.title&&r.title!=='照片'?'<span class="dtext">'+esc(r.title)+'</span>':'')+(r.note?'<span class="dtext">'+esc(r.note)+'</span>':'')+thumbs(r.photos)+'</button></li>').join('')+'</ul>':'')+
    (S.canWrite?'<button type="button" class="dadd" data-diary-day="'+n+'">＋ 寫日記</button>':'')+'</section>'}
function openDiary(n,id){const r=id?S.lists.get(id):null;if(id&&!r)return;const ro=!S.canWrite;if(!id&&!canWrite())return;S.readSheet=ro;const st={photos:r?(r.photos||[]).slice():[]};
  openSheet('<h2>'+(r?'日記・':'寫日記・')+md(dayDate(n))+'</h2>'+
    '<div class="fld"><label for="dy-in">今天的事</label><textarea class="inp" id="dy-in" rows="4" placeholder="例：一蘭排了 40 分鐘，但真的好吃！">'+esc(r?[r.title==='照片'?'':r.title,r.note].filter(Boolean).join('\n'):'')+'</textarea></div>'+
    (S.assets?'<div class="fld"><span class="lbl">照片</span>'+photosHTML(st.photos,ro)+'</div>':'')+
    '<div class="btns">'+(r&&!ro?'<button type="button" class="btn danger" id="dy-del">刪除</button>':'')+'<span class="sp"></span><button type="button" class="btn" id="dy-cancel">'+(ro?'關閉':'取消')+'</button>'+(ro?'':'<button type="button" class="btn pri" id="dy-ok">'+(r?'儲存':'記下來')+'</button>')+'</div>',
  root=>{const ta=root.querySelector('#dy-in');root.querySelector('#dy-cancel').onclick=closeSheet;if(ro){ta.readOnly=true;return}setTimeout(()=>ta.focus(),50);
    bindPhotos(root,()=>st.photos,ids=>{st.photos=ids});
    if(r)root.querySelector('#dy-del').onclick=()=>{closeSheet();remove('lists',r.id,'這則日記')};
    root.querySelector('#dy-ok').onclick=()=>{const v=ta.value.trim();if(!v&&!st.photos.length){toast('寫點什麼，或加一張照片');ta.focus();return}
      if(root.querySelector('.ph-busy')){toast('照片還在上傳，等一下');return}
      const lines=v.split('\n'),title=(lines.shift()||'').trim()||'照片',note=lines.join('\n').trim();closeSheet();
      if(r)patch('lists',r.id,{title,note,photos:st.photos.slice()},'已儲存');
      else{create('lists',{type:'diary',title,note,done:false,day:n,photos:st.photos.slice(),ts:Date.now(),order:Date.now()});render();toast('已記到 '+md(dayDate(n))+' 的日記')}}})}
document.addEventListener('click',e=>{const t=e.target.closest&&e.target.closest('[data-diary-day],[data-diary]');if(!t)return;e.preventDefault();e.stopPropagation();
  if(t.dataset.diaryDay)openDiary(+t.dataset.diaryDay);else{const r=S.lists.get(t.dataset.diary);if(r)openDiary(r.day,r.id)}},true);

/* ---------- AI 推薦: one line per place — 必吃 (food) / 必買 (shop) / 特色 (others) ----------
   it.rec (≤40 chars), it.recq = asked (or typed by hand: then AI never touches it). Shown on the card under the name; editable in the card's sheet. */
const recLine=it=>it&&it.rec&&PLACE_KINDS.includes(it.kind)?'<span class="irec">✨ '+esc(it.rec)+'</span>':'';
function recField(it){if(!PLACE_KINDS.includes(it.kind))return '';
  return '<div class="fld"><label for="e-rec">推薦<span class="opt">AI 整理的強項，不對就改</span></label><input class="inp" id="e-rec" value="'+esc(it.rec||'')+'" placeholder="'+(it.recq?'例：必吃 豚骨拉麵、溏心蛋':'AI 整理中')+'" autocomplete="off"></div>'}
/* ---------- 停留時間: it.stay (分鐘)；AI 先估 (stayAi=true)，她手改後 stayq=1 就不再動 ---------- */
const STAYS=[[30,'30分'],[60,'1小時'],[90,'90分'],[120,'2小時'],[180,'3小時'],[240,'4小時']];
const STAY_KINDS=['food','spot','shop','fac'];
const stayTxt=m=>m<60?m+' 分':(m%60?(m/60).toFixed(1).replace(/\.0$/,''):m/60)+' 小時';
const stayLine=it=>it&&+it.stay>0&&STAY_KINDS.includes(it.kind)?'<span class="istay">⏱ 停留 '+stayTxt(+it.stay)+(it.stayAi?'（AI）':'')+'</span>':'';
function stayField(it){if(!STAY_KINDS.includes(it.kind))return '';const v=+it.stay||0;
  return '<div class="fld"><span class="lbl">停留時間'+(it.stayAi&&v?'<span class="opt">AI 預估，不對就改</span>':'')+'</span><div class="seg" id="seg-stay">'+STAYS.map(([m,l])=>'<button type="button" data-v="'+m+'" aria-pressed="'+(m===v)+'">'+l+'</button>').join('')+'<input class="inp" id="e-stay" inputmode="numeric" placeholder="自填" aria-label="停留幾分鐘（自己填）" value="'+(v&&!STAYS.some(([m])=>m===v)?v:'')+'" autocomplete="off"></div></div>'}
document.addEventListener('click',e=>{const b=e.target.closest&&e.target.closest('#seg-stay button');if(!b)return;e.preventDefault();e.stopPropagation();const on=b.getAttribute('aria-pressed')!=='true';b.parentNode.querySelectorAll('button').forEach(x=>x.setAttribute('aria-pressed','false'));if(on)b.setAttribute('aria-pressed','true');const i=document.getElementById('e-stay');if(i)i.value=''},true);
document.addEventListener('input',e=>{if(!e.target||e.target.id!=='e-stay')return;const v=Math.round(+e.target.value.replace(/[^\d.]/g,'')||0);document.querySelectorAll('#seg-stay button').forEach(x=>x.setAttribute('aria-pressed',String(+x.dataset.v===v)))});
let STAY_BUSY=false;
async function findStays(){
  if(STAY_BUSY||!S.sample||!S.canWrite)return;
  const todo=[...S.items.values()].filter(it=>STAY_KINDS.includes(it.kind)&&it.title&&it.stayq==null&&!(+it.stay>0)).slice(0,30);
  if(!todo.length)return;STAY_BUSY=true;
  try{for(let i=0;i<todo.length;i+=10){const part=todo.slice(i,i+10);
    const prompt='下面是'+(T.dest||'日本')+'的店家和景點。請估計一般觀光客在每一項「停留多久」，單位分鐘，只能從 30、60、90、120、180、240 選一個最接近的。不確定就給 0。只回覆 JSON 數字陣列，例如 [60,90]。\n'+
      part.map((it,k)=>(k+1)+'. '+it.title.slice(0,40)+'（'+(KIND_L[it.kind]||'景點')+(it.area?'・'+String(it.area).slice(0,12):'')+'）').join('\n');
    let out;try{const r=await S.sample(prompt);out=JSON.parse((r.text.match(/\[[\s\S]*?\]/)||['[]'])[0])}catch(e){break}
    if(!Array.isArray(out)||out.length!==part.length)continue;
    part.forEach((it,k)=>{const cur=S.items.get(it.id);if(!cur||cur.stayq!=null||+cur.stay>0)return;
      const m=Math.round(+out[k]||0),ok=STAYS.some(([x])=>x===m),p=ok?{stay:m,stayAi:true,stayq:0}:{stayq:0};
      S.items.set(it.id,Object.assign({},cur,p));queue('items'+it.id,()=>ref('items',it.id).update(p))});
    render()}}
  finally{STAY_BUSY=false}}
let REC_BUSY=false;
async function findRecs(){
  if(REC_BUSY||!S.sample||!S.canWrite)return;
  const todo=[...S.items.values()].filter(it=>PLACE_KINDS.includes(it.kind)&&it.title&&it.recq==null&&(it.area||it.q||safeUrl(it.map)||it.aq!=null)).slice(0,30);
  if(!todo.length)return;REC_BUSY=true;
  try{for(let i=0;i<todo.length;i+=10){const part=todo.slice(i,i+10);
    const prompt='下面是'+(T.dest||'日本')+'的店家和景點。請替每一項整理一行「強項」，用繁體中文（台灣用語），20 字以內：餐廳寫「必吃：」加最有名的 1 到 2 道菜；商店寫「必買：」加最有名的 1 到 2 樣商品；其他寫「特色：」加最大的特色。只寫你確定的；不確定就給空字串，不要猜。只回覆 JSON 陣列，順序和編號一一對應。\n'+
      part.map((it,k)=>(k+1)+'. '+it.title.slice(0,40)+'（'+(KIND_L[it.kind]||'景點')+(it.area?'・'+String(it.area).slice(0,12):'')+'）').join('\n');
    let out;try{const r=await S.sample(prompt);out=JSON.parse((r.text.match(/\[[\s\S]*\]/)||['[]'])[0])}catch(e){break}
    if(!Array.isArray(out)||out.length!==part.length)continue;
    part.forEach((it,k)=>{const cur=S.items.get(it.id);if(!cur||cur.recq!=null)return;
      const v=typeof out[k]==='string'?out[k].trim().replace(/^["「『]|["」』]$/g,'').slice(0,40):'',p=v?{rec:v,recq:1}:{recq:1};
      S.items.set(it.id,Object.assign({},cur,p));queue('items'+it.id,()=>ref('items',it.id).update(p))});
    render()}}
  finally{REC_BUSY=false}}

/* 編輯行程: 地區・營業時間・簡介 shown as one short block of text (AI fills them); 修改 opens the three fields */
function aiInfoHTML(it,ro){if(!PLACE_KINDS.includes(it.kind))return '';
  const meta=[areaShow(it.area)?'📍 '+esc(areaShow(it.area)):'',it.oh?'🕒 '+esc(it.oh)+(it.ol?'（最後 '+esc(it.ol)+'）':''):''].filter(Boolean).join('　');
  return '<div class="fld aiinfo"><div class="aiinfo-h"><span class="lbl">資訊</span>'+(ro?'':'<button type="button" class="linkbtn aiinfo-edit">修改</button>')+'</div>'+
    (meta?'<div class="aiinfo-meta">'+meta+'</div>':'')+(it.desc?'<div class="aiinfo-desc">'+esc(it.desc)+'</div>':'')+(!meta&&!it.desc?'<div class="aiinfo-meta">AI 整理中</div>':'')+'</div>'}
document.addEventListener('click',e=>{const b=e.target.closest&&e.target.closest('.aiinfo-edit');if(!b)return;e.preventDefault();const s=b.closest('.sheet');const on=s.classList.toggle('ai-open');b.textContent=on?'收起':'修改';
  if(on){const a=s.querySelector('#e-area');if(a)a.closest('.fld').scrollIntoView({block:'nearest',behavior:'smooth'})}},true);
document.addEventListener('click',e=>{const b=e.target.closest&&e.target.closest('.own-add');if(!b)return;e.preventDefault();e.stopPropagation();const s=b.closest('.sheet');s.classList.add('own-open');const i=s.querySelector('.own-new');if(i)i.focus()},true);

/* 新增行程: ☆ 必去 right next to the name — mark it while adding, no extra row */
document.addEventListener('click',e=>{const b=e.target.closest&&e.target.closest('#a-must');if(!b)return;e.preventDefault();e.stopPropagation();const on=b.getAttribute('aria-pressed')!=='true';b.setAttribute('aria-pressed',String(on));
  ADD_MUST=on},true);

/* 旅費 pill: one number — everything spent, whoever paid (she mainly wants the total); 基金／each person is in 旅費總覽 */
function renderMbar(){const el=document.getElementById('mbar');if(!el)return;let t=0;for(const e of S.exps.values())t+=+e.amount||0;
  setHTML(el,'<span>旅費 <b>'+ntd(t*(+S.meta.rate||0))+'</b>'+(t?'':' <small>還沒記帳</small>')+'</span>');
  /* 快速記帳: its own 💰 button right after 旅費 (not inside ＋) */
  if(S.canWrite&&!document.getElementById('mb-add')){const b=document.createElement('button');b.type='button';b.id='mb-add';b.className='icon-btn mb-add';b.setAttribute('aria-label','記一筆');b.title='記一筆';b.innerHTML='<span class="mb-emo" aria-hidden="true">💰</span>';
    b.onclick=e=>{e.stopPropagation();openExp(null,{day:S.active>0?S.active:0,cat:'food'});quickExp()};el.after(b)}}
/* 旅費總覽, drawn in the trip's own style: a donut by 分類, a column per day, and who it belongs to (基金／each person).
   The list underneath (依日期／店家／分類／歸屬) is the page's own renderMoney0. */
const CAT_E={food:'🍜',shop:'🛍️',move:'🚃',ticket:'🎟️',stay:'🏨',other:'✨'};
function renderMoney(){renderMoney0();moneyViz()}
function moneyViz(){const el=document.getElementById('money');if(!el)return;const sc=el.querySelector('.sumcard');if(!sc)return;
  {const bs=sc.querySelector('.budget-set'),rb=sc.querySelector('#rate-btn');if(bs&&rb){bs.textContent='＋ 預算';rb.after(bs)}}  /* 設定預算 sits next to 匯率 instead of taking a row */
  const rate=+S.meta.rate||0,N=x=>ntd(x*rate),tn=todayN();let total=0;const bc={},bd={},who={};
  for(const e of S.exps.values()){const a=+e.amount||0;if(!a)continue;total+=a;const c=CAT_L[e.cat]?e.cat:'other';bc[c]=(bc[c]||0)+a;const d=+e.day||0;bd[d]=(bd[d]||0)+a;
    const k=e.split==='self'&&e.payer?e.payer:'基金';who[k]=(who[k]||0)+a}
  const old=el.querySelector('.mviz');if(old)old.remove();if(!total)return;
  /* donut: one ring segment per 分類 */
  const R=44,C=2*Math.PI*R,cs=CATS.map(c=>c[0]).filter(c=>bc[c]);let off=0;
  const ring=cs.map(c=>{const len=bc[c]/total*C,seg='<circle r="'+R+'" cx="60" cy="60" fill="none" stroke="'+CAT_C[c]+'" stroke-width="20" stroke-dasharray="'+len.toFixed(2)+' '+(C-len).toFixed(2)+'" stroke-dashoffset="'+(-off).toFixed(2)+'"/>';off+=len;return seg}).join('');
  const donut='<svg class="mv-donut" viewBox="0 0 120 120" role="img" aria-label="各分類花費比例"><g transform="rotate(-90 60 60)">'+ring+'</g><circle r="54" cx="60" cy="60" fill="none" stroke="var(--ink)" stroke-width="2"/><circle r="34" cx="60" cy="60" fill="#fff" stroke="var(--ink)" stroke-width="2"/></svg>';
  const leg='<ul class="mv-leg">'+cs.sort((a,b)=>bc[b]-bc[a]).map(c=>'<li><i style="background:'+CAT_C[c]+'"></i><span>'+CAT_E[c]+' '+CAT_L[c]+'</span><b>'+N(bc[c])+'</b><em>'+Math.round(bc[c]/total*100)+'%</em></li>').join('')+'</ul>';
  /* a column per day (出發前 first) */
  const days=[0];for(let n=1;n<=NDAYS;n++)days.push(n);const mx=Math.max(...days.map(d=>bd[d]||0))||1;
  const cols='<div class="mv-days" role="img" aria-label="每天花費">'+days.map(d=>{const v=bd[d]||0,h=v?Math.max(4,Math.round(v/mx*88)):0;
    return '<div class="mv-d'+(d===tn?' today':'')+'" title="'+(d?md(dayDate(d)):'出發前')+' '+N(v)+'"><span class="mv-bar" style="height:'+h+'px"></span><small>'+(d?String(dayDate(d).getDate()):'前')+'</small></div>'}).join('')+'</div>';
  /* who it belongs to */
  const ws=Object.entries(who).sort((a,b)=>(a[0]==='基金'?-1:b[0]==='基金'?1:b[1]-a[1]));
  const wb='<div class="mv-who">'+ws.map(([k,v])=>'<div class="mv-w"><span>'+(k==='基金'?'💰 基金':esc(k))+'</span><div class="mv-track"><i style="width:'+(v/total*100).toFixed(1)+'%;background:'+(k==='基金'?'var(--yellow)':'var(--water)')+'"></i></div><b>'+N(v)+'</b></div>').join('')+'</div>';
  const box=document.createElement('div');box.className='mviz';
  box.innerHTML='<div class="mv-card"><div class="mv-h">🧾 花在哪裡</div><div class="mv-cat">'+donut+leg+'</div></div>'+
    '<div class="mv-card"><div class="mv-h">📅 每天花多少</div>'+cols+'</div>'+
    '<div class="mv-card"><div class="mv-h">👛 誰的錢</div>'+wb+'</div>';
  sc.after(box)}

/* the sheet's title follows the 類型 you pick (待辦 ⇄ 票券／訂位) */
document.addEventListener('click',e=>{const b=e.target.closest&&e.target.closest('#seg-qtype button,#seg-ltype button');if(!b)return;const h=b.closest('.sheet')&&b.closest('.sheet').querySelector('h2');if(!h||/今日要辦/.test(h.textContent))return;
  const l=b.dataset.v==='ticket'?'票券':b.dataset.v==='book'?'訂位':'待辦';h.textContent=b.closest('#seg-qtype')?'新增'+l:l},true);

/* 口袋 rows of places open the place's own sheet */
document.addEventListener('click',e=>{const b=e.target.closest&&e.target.closest('.crow.pk-item .cbody');if(!b)return;e.preventDefault();e.stopPropagation();openEdit(b.closest('.crow').dataset.iid)},true);
// 日期列：滑鼠滾輪也能左右捲、可按住拖曳（手機本來就能滑）
document.addEventListener('wheel',e=>{const s=e.target.closest&&e.target.closest('.dstrip');if(!s||Math.abs(e.deltaX)>Math.abs(e.deltaY))return;if(s.scrollWidth<=s.clientWidth)return;s.scrollLeft+=e.deltaY;e.preventDefault()},{passive:false});
(()=>{let s=null,x0=0,l0=0,moved=false;document.addEventListener('pointerdown',e=>{if(e.pointerType!=='mouse')return;const t=e.target.closest&&e.target.closest('.dstrip');if(!t)return;s=t;x0=e.clientX;l0=t.scrollLeft;moved=false});
document.addEventListener('pointermove',e=>{if(!s)return;const dx=e.clientX-x0;if(Math.abs(dx)>4){moved=true;s.style.scrollSnapType='none';s.scrollLeft=l0-dx}});
document.addEventListener('pointerup',()=>{if(s){s.style.scrollSnapType='';if(moved){const b=e=>{e.stopPropagation();e.preventDefault()};document.addEventListener('click',b,{capture:true,once:true});setTimeout(()=>document.removeEventListener('click',b,true),50)}}s=null})})();

// 快速記帳：金額、類別排最上面，打開就能直接輸入金額
function quickExp(){setTimeout(()=>{const a=document.getElementById('x-amt');if(!a)return;const sh=a.closest('.sheet'),h=sh.querySelector('h2'),fa=a.closest('.fld'),fc=sh.querySelector('#seg-cat')&&sh.querySelector('#seg-cat').closest('.fld');if(h&&fa){h.after(fa);if(fc)fa.after(fc)}a.focus()},60)}
// 日期列：兩側淡出，看得出還能往旁邊滑
function dstripFade(){document.querySelectorAll('.dstrip').forEach(st=>{const l=st.scrollLeft>4,r=st.scrollLeft+st.clientWidth<st.scrollWidth-4;st.classList.toggle('fl',l);st.classList.toggle('fr',r)})}
document.addEventListener('scroll',e=>{if(e.target.classList&&e.target.classList.contains('dstrip'))dstripFade()},true);
new MutationObserver(()=>requestAnimationFrame(dstripFade)).observe(document.body,{childList:true,subtree:true});

/* ---------- 兩天交換: every stop and list row of day a goes to day b and back; title / 出發時間 too ---------- */
function swapDays(a,b){if(!canWrite()||!(a>0)||!(b>0)||a===b)return;let k=0;
  for(const st of ['items','lists'])for(const [id,it] of [...S[st].entries()]){if(it.day!==a&&it.day!==b)continue;const day=it.day===a?b:a;
    S[st].set(id,Object.assign({},it,{day}));queue(st+id,()=>ref(st,id).update({day}));k++}
  const da=S.days.get('d'+a)||{},db=S.days.get('d'+b)||{},na=Object.assign({},db),nb=Object.assign({},da);
  S.days.set('d'+a,na);S.days.set('d'+b,nb);queue('d'+a,()=>S.db.collection('days').doc('d'+a).set(na));queue('d'+b,()=>S.db.collection('days').doc('d'+b).set(nb));
  render();toast('Day '+a+' 和 Day '+b+' 已交換')}

/* ---------- 口袋 → 哪一天: suggest the day that already has stops in the same area (else the lightest day) ---------- */
function sugDay(it){if(!it||it.day!==0||!PLACE_KINDS.includes(it.kind))return null;const a=String(it.area||'').trim();let best=null;
  if(a){for(let n=1;n<=NDAYS;n++){const k=dayItems(n).filter(x=>x.area&&(String(x.area).includes(a)||a.includes(String(x.area)))).length;if(k&&(!best||k>best.k))best={n,k,why:'同在'+a}}}
  if(!best){for(let n=2;n<NDAYS;n++){const k=dayItems(n).filter(isStop).length;if(!best||k<best.k)best={n,k,why:'這天行程最少'}}}
  return best}
function sugField(it){const b=sugDay(it);if(!b)return '';
  return '<div class="fld sugf"><button type="button" class="btn sug" id="e-sug" data-day="'+b.n+'">📅 排進 Day '+b.n+'（'+md(dayDate(b.n))+'・'+esc(b.why)+'）</button></div>'}
document.addEventListener('click',e=>{const b=e.target.closest&&e.target.closest('#e-sug');if(!b)return;const sh=b.closest('.sheet'),db=sh&&sh.querySelector('#seg-day [data-v="'+b.dataset.day+'"]');if(db){db.click();b.closest('.fld').hidden=true;const p=sh.querySelector('#e-posf');(p||db).scrollIntoView({block:'center',behavior:'smooth'})}});

/* ---------- 每天的標題 = 當天行程的地區 (依順序、不重複、最多 4 個)，改行程就跟著變 ---------- */
function autoDayTitle(n){const seen=[];for(const it of dayItems(n)){if(!isStop(it))continue;const a=String(it.area||'').trim();if(a&&!seen.includes(a)&&!/^(日本|東京都?)$/.test(a))seen.push(a)}return seen.slice(0,4).join('・')}


/* ---------- 「GONZO 大井町店」: a branch name in the title wins over a wrong 地區 (so the trip there, the map and the day title follow) ---------- */
function fixAreaFromTitle(){if(!S.canWrite)return;let n=0;
  for(const it of [...S.items.values()]){if(!PLACE_KINDS.includes(it.kind))continue;const t=String(it.title||'');
    const hit=AREAS.filter(a=>new RegExp(a+'(?:本店|駅前店|站前店|店)').test(t)).sort((x,y)=>y.length-x.length)[0];
    if(!hit||it.area===hit)continue;const p={area:hit};S.items.set(it.id,Object.assign({},it,p));queue('items'+it.id,()=>ref('items',it.id).update(p));n++}
  if(n)render()}

/* 卡片上點 🕒 營業時間就能改；手改過的 AI 不再覆蓋 */
function openHours(id){const it=S.items.get(id);if(!it||!canWrite())return;S.readSheet=false;
  openSheet('<h2>營業時間</h2><div class="fld"><label for="oh-in">'+esc(String(it.title||'').slice(0,30))+'<span class="opt">例 08:00-20:00，可加「最後 19:30」；清空＝不顯示</span></label><input class="inp" id="oh-in" inputmode="text" placeholder="08:00-20:00" value="'+esc(ohText(it))+'"></div>'+
   '<div class="btns"><span class="sp"></span><button type="button" class="btn" id="oh-cancel">取消</button><button type="button" class="btn pri" id="oh-ok">儲存</button></div>',
  root=>{const i=root.querySelector('#oh-in');root.querySelector('#oh-cancel').onclick=closeSheet;
    const go=()=>{const v=i.value.trim();let p;if(!v)p={oh:'',ol:'',ohq:1,ohv:2};else{const m=ohParse(v);if(!m){toast('請寫成 08:00-20:00 這樣');i.focus();return}p={oh:tfmt(m.o)+'-'+tfmt(m.c),ol:m.l!=null?tfmt(m.l):'',ohq:1,ohv:2}}
      const cur=S.items.get(id);if(!cur){closeSheet();return}if((cur.oh||'')===p.oh&&(cur.ol||'')===p.ol){closeSheet();return}
      S.items.set(id,Object.assign({},cur,p));queue('items'+id,()=>ref('items',id).update(p));closeSheet();render();toast('已更新營業時間')};
    root.querySelector('#oh-ok').onclick=go;i.addEventListener('keydown',e=>{if(e.key==='Enter'){e.preventDefault();go()}})})}
document.addEventListener('click',e=>{const b=e.target.closest&&e.target.closest('.item .ioh');if(!b||!canWrite())return;const c=b.closest('.item');if(!c||!c.dataset.id)return;e.preventDefault();e.stopPropagation();openHours(c.dataset.id)},true);

/* ---------- boot ---------- */
const cached=loadCache();countdown();render();loadFx();loadWeather();picsLater();if(cached)setSync('wait','更新中');
(async function boot(){
  const C=window.claude,use=n=>C&&C.use?C.use(n).catch(()=>null):Promise.resolve(null);
  const db=await use('db');
  if(!db){if(cached){setSync('off','離線')}else{setSync('off','未連線');notice('<b>還看不到行程</b>這台裝置還沒存過這趟旅行，連上網路後重新整理。')}return}
  S.db=db;
  const u=await use('user');S.user=u;let can=null;try{if(u)can=await u.can('data.write')}catch(e){}
  S.canWrite=can!==false;setSync(S.canWrite?'wait':'ro',S.canWrite?'同步中':'只能檢視');
  let firstItems=true;
  db.collection('items').onSnapshot(snap=>{const m=new Map();for(const d of snap.docs)m.set(d.id,Object.assign({id:d.id},d.data()));S.items=m;
      if(!snap.metadata.fromCache){S.synced=true;setSync(S.canWrite?'live':'ro',S.canWrite?'即時同步':'只能檢視');notice(m.size?'':'<b>行程還是空的</b>按右下角「新增」加入第一個地點。')}
      render();if(firstItems&&m.size){firstItems=false;renderNow();if(!ls.get(T.id+'-tip1')){ls.set(T.id+'-tip1','1');setTimeout(()=>toast(matchMedia('(pointer:coarse)').matches?'小技巧：左右滑可以換天，長按行程有快捷選單':'小技巧：← → 換天、N 新增、在行程上按右鍵有快捷選單',null,6000),1200)}}},
    ()=>{setSync('off','已中斷');notice('<b>同步中斷了</b>重新整理頁面就會再連上。')});
  db.collection('days').onSnapshot(snap=>{const m=new Map();for(const d of snap.docs)m.set(d.id,d.data());S.days=m;render()},()=>{});
  db.collection('lists').onSnapshot(snap=>{const m=new Map();for(const d of snap.docs)m.set(d.id,Object.assign({id:d.id},d.data()));S.lists=m;render()},()=>{});
  db.collection('expenses').onSnapshot(snap=>{const m=new Map();for(const d of snap.docs)m.set(d.id,Object.assign({id:d.id},d.data()));S.exps=m;render()},()=>{});
  db.doc('meta/settings').onSnapshot(s=>{if(s.exists){const v=s.data();S.meta={rate:+v.rate||0.21,people:Array.isArray(v.people)?v.people.slice():[],rateAuto:v.rateAuto!==false,budget:+v.budget||0};applyFx();render()}},()=>{});
  use('assets').then(a=>{S.assets=a;if(a)render()});
  use('sample').then(s=>{S.sample=s});
  use('room').then(r=>{if(!r)return;S.room=r;try{r.onPeers(onPeersChange)}catch(e){}pushPresence()});
})();
setInterval(()=>{countdown();if(!S.drag)renderNow()},6e4);
/* 底部 3 個分頁：行程（每天的行程）／準備（待辦・行李・口袋）／旅費（旅費總覽）
   分頁狀態跟著日期列：選到「出發前」= 準備，選到某一天 = 行程 */
(function tabs(){
  const ICON={plan:'<path d="M9 4 3.5 6v14L9 18l6 2 5.5-2V4L15 6z"/><path d="M9 4v14M15 6v14"/>',prep:'<rect x="5" y="4" width="14" height="17" rx="3"/><path d="M9 4.5V3h6v1.5M8.5 11l2 2 4-4M8.5 17h7"/>',money:'<rect x="3" y="6" width="18" height="13" rx="3"/><path d="M3 10h18M16 14.5h2"/>'};
  const nav=document.createElement('nav');nav.id='tabs';nav.className='tabs';nav.setAttribute('aria-label','切換');
  nav.innerHTML=[['plan','行程'],['prep','準備'],['money','旅費']].map(([k,l])=>'<button type="button" data-tab="'+k+'" aria-pressed="false"><svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">'+ICON[k]+'</svg><span>'+l+'</span></button>').join('');
  let lastDay=null;
  const cur=()=>{const a=document.querySelector('#strip .chip.active');return a?+a.dataset.day:null};
  const sync=()=>{const d=cur();const t=d===0?'prep':'plan';if(d)lastDay=d;document.body.dataset.tab=t;nav.querySelectorAll('button').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.tab===t)))};
  const pickDay=()=>{if(lastDay)return lastDay;const n=todayN();return n>=1&&n<=NDAYS?n:1};
  nav.addEventListener('click',e=>{const b=e.target.closest('button');if(!b)return;const t=b.dataset.tab;
    if(t==='money'){const m=document.getElementById('mbar');if(m)m.click();return}
    const want=t==='prep'?0:pickDay();const c=document.querySelector('#strip .chip[data-day="'+want+'"]');
    if(c&&cur()!==want)c.click();scrollTo({top:0,behavior:'instant'});setTimeout(sync,0)});
  const start=()=>{if(!document.getElementById('strip')){setTimeout(start,200);return}
    if(!document.getElementById('tabs'))document.body.appendChild(nav);document.body.classList.add('has-tabs');
    new MutationObserver(sync).observe(document.getElementById('strip'),{subtree:true,attributes:true,attributeFilter:['class'],childList:true});sync()};
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start);else start();
})();
};

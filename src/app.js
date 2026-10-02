const T = ['19:30','20:40','21:50','23:00'];
const GROUPS = {
  A:['Cikcilli','Alara','Aliefendi','Gümüşkavak','Kızılcaşehir','İncekum'],
  B:['Çamlıca','Toslak','Tosmur','Mahmutlar','Kayabaşı','Tırılar'],
  C:['Başköy','Paşaköy','Sugözü','Sapadere','Hocalar','Yaylakonak'],
  D:['Saburlar','Süleymanlar','Kocaoğlanlı','Konaklı','Yeşilöz','Demirtaş'],
  E:['Yeniköy','Basırlı','Türkler','Gümüşgöze','Şıhlar'],
  F:['Keşefli','Güzelbağ','Obaalacami','Soğukpınar','Taşbaşı'],
  G:['Dim Alacami','Elikesik','Küçükhasbahçe','Dere','Yalçı'],
  H:['Değirmendere','Emisbeleni','Çıplaklı','Hacımehmetli','Fakırcalı']
};
// [tarih, [[ev, deplasman] x4 (19:30, 20:40, 21:50, 23:00)], saatler kura ile mi]
const ROUNDS = [
  {n:1, span:'1–5. maç günü', bye:['Yeniköy','Keşefli','Dim Alacami','Değirmendere'], days:[
    ['2026-10-04',[['Alara','Kızılcaşehir'],['Cikcilli','İncekum'],['Aliefendi','Gümüşkavak'],['Basırlı','Şıhlar']],true],
    ['2026-10-06',[['Toslak','Kayabaşı'],['Tosmur','Mahmutlar'],['Çamlıca','Tırılar'],['Güzelbağ','Taşbaşı']]],
    ['2026-10-07',[['Elikesik','Yalçı'],['Sugözü','Sapadere'],['Paşaköy','Hocalar'],['Başköy','Yaylakonak']]],
    ['2026-10-08',[['Kocaoğlanlı','Konaklı'],['Süleymanlar','Yeşilöz'],['Emisbeleni','Fakırcalı'],['Saburlar','Demirtaş']]],
    ['2026-10-09',[['Obaalacami','Soğukpınar'],['Çıplaklı','Hacımehmetli'],['Türkler','Gümüşgöze'],['Küçükhasbahçe','Dere']]]]},
  {n:2, span:'6–10. maç günü', bye:['Gümüşgöze','Soğukpınar','Dere','Hacımehmetli'], days:[
    ['2026-10-12',[['İncekum','Gümüşkavak'],['Alara','Aliefendi'],['Yeniköy','Şıhlar'],['Cikcilli','Kızılcaşehir']]],
    ['2026-10-13',[['Keşefli','Taşbaşı'],['Çamlıca','Kayabaşı'],['Tırılar','Mahmutlar'],['Toslak','Tosmur']]],
    ['2026-10-14',[['Paşaköy','Sugözü'],['Başköy','Hocalar'],['Dim Alacami','Yalçı'],['Yaylakonak','Sapadere']]],
    ['2026-10-15',[['Saburlar','Yeşilöz'],['Değirmendere','Fakırcalı'],['Demirtaş','Konaklı'],['Süleymanlar','Kocaoğlanlı']]],
    ['2026-10-16',[['Emisbeleni','Çıplaklı'],['Güzelbağ','Obaalacami'],['Elikesik','Küçükhasbahçe'],['Basırlı','Türkler']]]]},
  {n:3, span:'11–15. maç günü', bye:['Basırlı','Güzelbağ','Elikesik','Emisbeleni'], days:[
    ['2026-10-20',[['Cikcilli','Gümüşkavak'],['Kızılcaşehir','Aliefendi'],['İncekum','Alara'],['Yeniköy','Gümüşgöze']]],
    ['2026-10-21',[['Tırılar','Toslak'],['Keşefli','Soğukpınar'],['Kayabaşı','Tosmur'],['Çamlıca','Mahmutlar']]],
    ['2026-10-22',[['Başköy','Sapadere'],['Yaylakonak','Paşaköy'],['Dim Alacami','Dere'],['Hocalar','Sugözü']]],
    ['2026-10-27',[['Demirtaş','Süleymanlar'],['Saburlar','Konaklı'],['Yeşilöz','Kocaoğlanlı'],['Değirmendere','Hacımehmetli']]],
    ['2026-10-28',[['Şıhlar','Türkler'],['Yalçı','Küçükhasbahçe'],['Taşbaşı','Obaalacami'],['Fakırcalı','Çıplaklı']]]]},
  {n:4, span:'16–20. maç günü', bye:['Şıhlar','Taşbaşı','Yalçı','Fakırcalı'], days:[
    ['2026-10-29',[['Cikcilli','Aliefendi'],['Gümüşgöze','Basırlı'],['Kızılcaşehir','İncekum'],['Gümüşkavak','Alara']]],
    ['2026-10-30',[['Çamlıca','Tosmur'],['Kayabaşı','Tırılar'],['Soğukpınar','Güzelbağ'],['Mahmutlar','Toslak']]],
    ['2026-11-02',[['Hocalar','Yaylakonak'],['Dere','Elikesik'],['Sapadere','Paşaköy'],['Sugözü','Başköy']]],
    ['2026-11-03',[['Yeşilöz','Demirtaş'],['Saburlar','Kocaoğlanlı'],['Konaklı','Süleymanlar'],['Hacımehmetli','Emisbeleni']]],
    ['2026-11-04',[['Dim Alacami','Küçükhasbahçe'],['Yeniköy','Türkler'],['Çıplaklı','Değirmendere'],['Keşefli','Obaalacami']]]]},
  {n:5, span:'21–25. maç günü', bye:['Türkler','Obaalacami','Küçükhasbahçe','Çıplaklı'], days:[
    ['2026-11-05',[['Gümüşgöze','Şıhlar'],['Gümüşkavak','Kızılcaşehir'],['Cikcilli','Alara'],['Aliefendi','İncekum']]],
    ['2026-11-06',[['Mahmutlar','Kayabaşı'],['Tosmur','Tırılar'],['Çamlıca','Toslak'],['Soğukpınar','Taşbaşı']]],
    ['2026-11-09',[['Dere','Yalçı'],['Sugözü','Yaylakonak'],['Sapadere','Hocalar'],['Başköy','Paşaköy']]],
    ['2026-11-10',[['Hacımehmetli','Fakırcalı'],['Kocaoğlanlı','Demirtaş'],['Saburlar','Süleymanlar'],['Yeşilöz','Konaklı']]],
    ['2026-11-11',[['Yeniköy','Basırlı'],['Değirmendere','Emisbeleni'],['Keşefli','Güzelbağ'],['Dim Alacami','Elikesik']]]]}
];

const KO = {
  r16:[
    {id:'KO-M1',c:'M1',d:'2026-11-16',t:'20:00',h:'A1',a:'H2'},{id:'KO-M2',c:'M2',d:'2026-11-16',t:'21:30',h:'D1',a:'E2'},
    {id:'KO-M3',c:'M3',d:'2026-11-17',t:'20:00',h:'B1',a:'G2'},{id:'KO-M4',c:'M4',d:'2026-11-17',t:'21:30',h:'C1',a:'F2'},
    {id:'KO-M5',c:'M5',d:'2026-11-18',t:'20:00',h:'E1',a:'D2'},{id:'KO-M6',c:'M6',d:'2026-11-18',t:'21:30',h:'H1',a:'A2'},
    {id:'KO-M7',c:'M7',d:'2026-11-19',t:'20:00',h:'F1',a:'C2'},{id:'KO-M8',c:'M8',d:'2026-11-19',t:'21:30',h:'G1',a:'B2'}],
  qf:[
    {id:'KO-CF1',c:'ÇF1',d:'2026-11-23',t:'20:00',h:'M1',a:'M2'},{id:'KO-CF2',c:'ÇF2',d:'2026-11-23',t:'21:30',h:'M3',a:'M4'},
    {id:'KO-CF3',c:'ÇF3',d:'2026-11-24',t:'20:00',h:'M5',a:'M6'},{id:'KO-CF4',c:'ÇF4',d:'2026-11-24',t:'21:30',h:'M7',a:'M8'}],
  sf:[
    {id:'KO-YF1',c:'YF1',d:'2026-11-27',t:'20:00',h:'ÇF1',a:'ÇF2'},{id:'KO-YF2',c:'YF2',d:'2026-11-27',t:'21:30',h:'ÇF3',a:'ÇF4'}],
  f:[
    {id:'KO-F',c:'Büyük Final',d:'2026-12-01',t:'21:30',h:'YF1',a:'YF2',big:true},
    {id:'KO-3',c:'Üçüncülük',d:'2026-12-01',t:'20:00',h:'YF1',a:'YF2',lose:true}]
};
const KO_ALL=[...KO.r16,...KO.qf,...KO.sf,...KO.f];
const KO_BY_CODE=Object.fromEntries(KO_ALL.map(k=>[k.c,k]));
const KO_STAGE={r16:'Son 16',qf:'Çeyrek Final',sf:'Yarı Final',f:'Final'};

const MONTHS=['Ocak','Şubat','Mart','Nisan','Mayıs','Haziran','Temmuz','Ağustos','Eylül','Ekim','Kasım','Aralık'];
const WD=['Pazar','Pazartesi','Salı','Çarşamba','Perşembe','Cuma','Cumartesi'];
const ORD={1:'birincisi',2:'ikincisi'};
const $=s=>document.querySelector(s);
const $$=s=>[...document.querySelectorAll(s)];
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const low=s=>s.toLocaleLowerCase('tr');
const slug=s=>low(s).replace(/[çğıöşü]/g,c=>({ç:'c',ğ:'g',ı:'i',ö:'o',ş:'s',ü:'u'}[c])).replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'');
const pd=s=>{const[y,m,d]=s.split('-').map(Number);return new Date(y,m-1,d)};
const fmt=s=>{const d=pd(s);return {dm:`${d.getDate()} ${MONTHS[d.getMonth()]}`,wd:WD[d.getDay()]}};
const pad=n=>String(n).padStart(2,'0');
const now=new Date();
const todayKey=`${now.getFullYear()}-${pad(now.getMonth()+1)}-${pad(now.getDate())}`;
const dayDiff=s=>Math.round((pd(s)-pd(todayKey))/864e5);

const TEAM_G={}, TEAM_POS={}, TEAM_BY_SLUG={};
for(const[g,ts] of Object.entries(GROUPS)) ts.forEach((t,i)=>{TEAM_G[t]=g;TEAM_POS[t]=i+1;TEAM_BY_SLUG[slug(t)]=t});
const ALL=[];
ROUNDS.forEach(r=>r.days.forEach(([d,ms,tbd])=>ms.forEach(([h,a],i)=>ALL.push({id:`g-${d}-${i}`,tur:r.n,d,t:tbd?null:T[i],h,a,g:TEAM_G[h]}))));
const MATCH_BY_ID=Object.fromEntries(ALL.map(m=>[m.id,m]));
const KO_BY_ID=Object.fromEntries(KO_ALL.map(k=>[k.id,k]));

/* ---------- Canlı veri ---------- */
const DATA={players:{},matches:{},news:{},teams:{},requests:{},managers:{}};
let DB=null, IS_ADMIN=false, MY_TEAM=null, PENDING=null, openPlayerId=null, ROUTE_PLAYER=null;
const PHOTOS={}, LOGOS={}, MEDIA={};
let WEATHER={};
const status=id=>{const r=DATA.matches[id];if(!r)return '';return r.status||(r.played?'done':'')};
const res=id=>status(id)==='done'?DATA.matches[id]:null;
const sc=id=>{const r=res(id);return r?[r.hs,r.as]:null};
const shown=id=>{const s=status(id),r=DATA.matches[id];return (s==='done'||s==='live')&&r.hs!=null?[r.hs,r.as]:null};
const pName=id=>DATA.players[id]?.name||'Silinmiş oyuncu';

/* ---------- Eleme ağacı çözümü ---------- */
function groupDone(g){return ALL.filter(m=>m.g===g).every(m=>status(m.id)==='done')}
function koResult(k){
  const s=sc(k.id); if(!s) return null;
  const tm=koTeams(k), r=DATA.matches[k.id];
  let w=null;
  if(s[0]>s[1]) w='h'; else if(s[1]>s[0]) w='a'; else if(r.pen) w=r.pen;
  if(!w||!tm.h||!tm.a) return null;
  return {w:w==='h'?tm.h:tm.a, l:w==='h'?tm.a:tm.h};
}
function resolveRef(ref,lose){
  if(/^[A-H][12]$/.test(ref)){const g=ref[0];return groupDone(g)?standings(g)[+ref[1]-1].t:'';}
  const k=KO_BY_CODE[ref]; if(!k) return '';
  const r=koResult(k); return r?(lose?r.l:r.w):'';
}
function koTeams(k){const r=DATA.matches[k.id]||{};return {h:r.h||resolveRef(k.h,k.lose),a:r.a||resolveRef(k.a,k.lose)}}

/* Tüm maçlar tek listede (grup + eleme), takım adlarıyla */
function everyMatch(){
  const ko=KO_ALL.map(k=>{const tm=koTeams(k);return {id:k.id,d:k.d,t:k.t,h:tm.h,a:tm.a,ko:k}});
  return [...ALL,...ko];
}
function matchInfo(id){
  if(MATCH_BY_ID[id]) return MATCH_BY_ID[id];
  const k=KO_BY_ID[id]; if(!k) return null; const tm=koTeams(k);
  return {id,d:k.d,t:k.t,h:tm.h,a:tm.a,ko:k};
}

function computeStats(){
  const st={};
  const bump=(p,k)=>{if(!p)return;(st[p]||(st[p]={G:0,A:0,Y:0,R:0,MVP:0}))[k]++};
  for(const[id,r] of Object.entries(DATA.matches)){
    const s=status(id); if(s!=='done'&&s!=='live') continue;
    if(Array.isArray(r.ev)) for(const e of r.ev){
      if(e.t==='G'){bump(e.p,'G');bump(e.as,'A');}
      else if(e.t==='Y') bump(e.p,'Y');
      else if(e.t==='R') bump(e.p,'R');
    }
    if(s==='done'&&r.mvp) bump(r.mvp,'MVP');
  }
  return st;
}
function teamRecord(t){
  const rec={O:0,G:0,B:0,M:0,A:0,Y:0,SK:0,KK:0,form:[]};
  everyMatch().filter(m=>(m.h===t||m.a===t)).sort((x,y)=>(x.d+(x.t||'')).localeCompare(y.d+(y.t||''))).forEach(m=>{
    const s=sc(m.id); if(!s) return;
    const home=m.h===t, f=home?s[0]:s[1], a=home?s[1]:s[0];
    rec.O++;rec.A+=f;rec.Y+=a;
    let r=f>a?'w':f<a?'l':'d';
    if(r==='d'&&m.ko){const p=DATA.matches[m.id].pen;if(p)r=(p==='h')===home?'w':'l';}
    if(r==='w')rec.G++;else if(r==='l')rec.M++;else rec.B++;
    rec.form.push({r,id:m.id});
  });
  for(const[id,r] of Object.entries(DATA.matches)){
    if(!Array.isArray(r.ev)) continue;
    const m=matchInfo(id); if(!m||(m.h!==t&&m.a!==t)) continue;
    const side=m.h===t?'h':'a';
    r.ev.forEach(e=>{if(e.s===side){if(e.t==='Y')rec.SK++;if(e.t==='R')rec.KK++;}});
  }
  return rec;
}
const formHtml=f=>`<span class="form">${f.slice(-5).map(x=>`<i class="${x.r}" title="${{w:'Galibiyet',d:'Beraberlik',l:'Mağlubiyet'}[x.r]}">${{w:'G',d:'B',l:'M'}[x.r]}</i>`).join('')}</span>`;

/* ---------- Fotoğraflar ---------- */
const initials=n=>String(n||'?').trim().split(/\s+/).map(w=>w[0]).slice(0,2).join('').toLocaleUpperCase('tr');
function avatar(pid,name,cls=''){const src=PHOTOS[pid];return src?`<img class="av ${cls}" src="${src}" alt="" loading="lazy">`:`<span class="av ${cls}" aria-hidden="true">${esc(initials(name))}</span>`}
async function loadMedia(t){
  if(!DB||!t||MEDIA[t]) return; MEDIA[t]='loading';
  try{
    const [ph,lg]=await Promise.all([DB.where('photos','team',t),DB.get('logos',slug(t))]);
    ph.forEach(([id,d])=>{PHOTOS[id]=d.data}); if(lg) LOGOS[slug(t)]=lg.data;
    MEDIA[t]='done';
    if($('#teamSel').value===t) team();
    if(openPlayerId&&DATA.players[openPlayerId]?.team===t) renderPlayerModal();
    if(panelReady&&$('#pTeam').value===t) playerList();
    if(panelReady&&$('#tTeam').value===t&&LOGOS[slug(t)]&&!pendingLogo) $('#tLogoPrev').style.backgroundImage=`url("${LOGOS[slug(t)]}")`;
  }catch(e){MEDIA[t]=null;}
}

/* ---------- Alanya: hava durumu ve deniz suyu ---------- */
const WCODE=c=>c===0?'açık':c<=2?'az bulutlu':c===3?'kapalı':c<=48?'sisli':c<=57?'çiseleyen yağmur':c<=67?'yağmurlu':c<=77?'karlı':c<=82?'sağanak':'gök gürültülü';
function wx(d,t){const h=t?t.slice(0,2):'20';return WEATHER[`${d}T${h}:00`]||null}
const wxText=w=>`${Math.round(w.t)}° · ${WCODE(w.c)}${w.p!=null?` · yağış %${w.p}`:''} · rüzgâr ${Math.round(w.w)} km/s`;
async function loadWeather(){
  try{
    const r=await fetch('https://api.open-meteo.com/v1/forecast?latitude=36.5444&longitude=31.9954&hourly=temperature_2m,precipitation_probability,weather_code,wind_speed_10m&timezone=Europe%2FIstanbul&forecast_days=16');
    const H=(await r.json()).hourly;
    H.time.forEach((k,i)=>{WEATHER[k]={t:H.temperature_2m[i],p:H.precipitation_probability[i],c:H.weather_code[i],w:H.wind_speed_10m[i]}});
    board(); renderMatchModal();
  }catch(e){}
  try{
    const r=await fetch('https://marine-api.open-meteo.com/v1/marine?latitude=36.53&longitude=31.99&current=sea_surface_temperature&timezone=Europe%2FIstanbul');
    const v=(await r.json()).current?.sea_surface_temperature;
    if(typeof v==='number'){const el=$('#seaChip');el.innerHTML=`<i></i>Alanya'da deniz suyu ${v.toFixed(1).replace('.',',')}°C`;el.hidden=false;}
  }catch(e){}
}

/* ---------- Skorbord ve canlı şerit ---------- */
function board(){
  const days=[...new Set(ALL.map(m=>m.d))];
  let next=days.find(d=>d>=todayKey), list, ko=false;
  if(next) list=ALL.filter(m=>m.d===next);
  else{
    next=KO_ALL.map(k=>k.d).find(d=>d>=todayKey);
    if(next){ko=true;list=KO_ALL.filter(k=>k.d===next).sort((x,y)=>x.t.localeCompare(y.t)).map(k=>matchInfo(k.id));}
  }
  const el=$('#board');
  if(!next){
    const f=koResult(KO_BY_ID['KO-F']);
    el.innerHTML=`<div class="board-head"><span class="lbl">Sezon tamamlandı</span></div><div class="count"><b>ŞAMPİYON</b></div><p class="day" style="font-family:var(--f-display);font-weight:900;font-size:2.4rem;margin:0;color:var(--led)">${esc(f?f.w:'—')}</p><p class="note">1. Alanya Mahalle Ligi sona erdi. Gelecek sezonda görüşmek üzere.</p>`;return;}
  const n=dayDiff(next), f=fmt(next);
  const isOpen=next===ALL[0].d;
  const cnt=n===0?`<b>BUGÜN</b><span>maç günü</span>`:`<b class="num">${n}</b><span>gün ${isOpen?'kaldı · açılış':'sonra'}</span>`;
  const rows=list.map(m=>{
    const s=shown(m.id), st=status(m.id);
    const mid=s?s.join('–'):st==='post'?'ert.':ko?esc(m.ko.c):'vs';
    return `<li data-match="${m.id}" style="cursor:pointer"><span class="t num">${st==='live'?`<span class="badge live">${DATA.matches[m.id].minute?DATA.matches[m.id].minute+"'":'Canlı'}</span>`:(m.t||'—')}</span><span class="h">${esc(m.h||m.ko?.h||'')}</span><span class="v">${mid}</span><span class="a">${esc(m.a||m.ko?.a||'')}</span>${m.g?`<span class="gp" data-g="${m.g}">${m.g}</span>`:'<span></span>'}</li>`;}).join('');
  el.innerHTML=`<div class="board-head"><span class="lbl">Sıradaki maç günü</span><span class="day">${f.dm} ${f.wd}</span></div>
    <div class="count">${cnt}</div>${(()=>{const ft=list.find(m=>m.t)?.t||(ko?'20:00':'19:30'),w=wx(next,ft);return w?`<p class="wx">Alanya, ${list.some(m=>!m.t)?'maç akşamı':ft}: <b>${wxText(w)}</b></p>`:''})()}<ul>${rows}</ul>
    ${list.some(m=>!m.t)?'<p class="note">Açılış gecesinin maç saatleri kura ile belirlenecek.</p>':''}`;
}
function liveBar(){
  const live=everyMatch().filter(m=>status(m.id)==='live');
  const el=$('#liveBar');
  if(!live.length){el.hidden=true;return;}
  el.hidden=false;
  el.innerHTML=`<span class="badge live" style="background:#fff;color:#d7261e">Canlı</span>`+live.map(m=>{const r=DATA.matches[m.id];
    return `<span data-match="${m.id}">${esc(m.h)} ${r.hs??0}–${r.as??0} ${esc(m.a)}${r.minute?` · ${r.minute}'`:''}</span>`}).join('');
}
function facts(){
  let n=0,g=0;
  everyMatch().forEach(m=>{const s=sc(m.id);if(s){n++;g+=s[0]+s[1];}});
  $('#fPlayed').textContent=n; $('#fGoals').textContent=g; $('#fAvg').textContent=n?(g/n).toFixed(1).replace('.',','):'0';
}

/* ---------- Gündem ---------- */
function lastResults(){
  const done=everyMatch().filter(m=>sc(m.id)).sort((x,y)=>(y.d+(y.t||'')).localeCompare(x.d+(x.t||''))).slice(0,6);
  $('#lastResults').innerHTML=done.length?done.map(m=>{const s=sc(m.id),f=fmt(m.d);
    return `<div class="res" data-match="${m.id}" role="button" tabindex="0"><span class="d">${f.dm}<br>${m.ko?esc(m.ko.c):m.g+' Grubu'}</span><span class="h ${s[0]>s[1]?'win':s[0]<s[1]?'lose':''}">${esc(m.h)}</span><span class="s">${s.join('–')}</span><span class="a ${s[1]>s[0]?'win':s[1]<s[0]?'lose':''}">${esc(m.a)}</span></div>`}).join('')
    :'<div class="none">Henüz oynanmış maç yok. Lig 4 Ekim Pazar başlıyor.</div>';
}
function newsSorted(){
  return Object.entries(DATA.news).sort((a,b)=>(b[1].pinned?1:0)-(a[1].pinned?1:0)||String(b[1].date).localeCompare(String(a[1].date)));
}
const fmtDate=iso=>{const d=new Date(iso);return isNaN(d)?'':`${d.getDate()} ${MONTHS[d.getMonth()]} ${d.getFullYear()}`};
function news(){
  const list=newsSorted();
  $('#newsMini').innerHTML=list.length?list.slice(0,4).map(([id,n])=>`<div class="newsMini" data-news="${id}" role="button" tabindex="0"><b>${n.pinned?'<span class="badge post">Sabit</span> ':''}${esc(n.title)}</b><span>${fmtDate(n.date)}</span></div>`).join('')
    :'<div class="none">Henüz duyuru yok.</div>';
  $('#newsList').innerHTML=list.length?list.map(([id,n])=>`<article class="newsItem ${n.pinned?'pin':''}" id="duyuru-${id}"><time datetime="${esc(n.date)}">${n.pinned?'Sabit · ':''}${fmtDate(n.date)}</time><h3>${esc(n.title)}</h3><p>${esc(n.body)}</p></article>`).join('')
    :'<div class="empty">Lig yönetiminin duyuruları burada yayınlanacak.</div>';
}

/* ---------- Gruplar ---------- */
function standings(g){
  const rows=GROUPS[g].map((t,i)=>({t,i,O:0,G:0,B:0,M:0,A:0,Y:0,form:[]}));
  const by=Object.fromEntries(rows.map(r=>[r.t,r]));
  ALL.filter(m=>m.g===g).forEach(m=>{
    const s=sc(m.id); if(!s) return;
    const[x,y]=s,h=by[m.h],a=by[m.a];
    h.O++;a.O++;h.A+=x;h.Y+=y;a.A+=y;a.Y+=x;
    if(x>y){h.G++;a.M++;h.form.push({r:'w'});a.form.push({r:'l'})}
    else if(x<y){a.G++;h.M++;h.form.push({r:'l'});a.form.push({r:'w'})}
    else{h.B++;a.B++;h.form.push({r:'d'});a.form.push({r:'d'})}
  });
  rows.forEach(r=>{r.P=r.G*3+r.B;r.Av=r.A-r.Y});
  return rows.sort((p,q)=>q.P-p.P||q.Av-p.Av||q.A-p.A||p.i-q.i);
}
function groups(){
  $('#groups').innerHTML=Object.keys(GROUPS).map(g=>{
    const st=standings(g);
    return `<article class="gcard" data-g="${g}">
      <header><span class="letter">${g}</span><h3>Grubu</h3><small>${groupDone(g)?'Tamamlandı':GROUPS[g].length+' takım'}</small></header>
      <table class="st"><thead><tr><th>#</th><th>Takım</th><th title="Oynanan">O</th><th title="Galibiyet">G</th><th title="Beraberlik">B</th><th title="Mağlubiyet">M</th><th title="Averaj">Av</th><th title="Puan">P</th><th class="fm">Form</th></tr></thead>
      <tbody>${st.map((r,i)=>`<tr class="${i<2?'q':''}"><td>${i+1}</td><td class="tm"><button type="button" data-team="${esc(r.t)}">${esc(r.t)}</button></td><td>${r.O}</td><td>${r.G}</td><td>${r.B}</td><td>${r.M}</td><td>${r.Av>0?'+':''}${r.Av}</td><td class="p">${r.P}</td><td class="fm">${formHtml(r.form)}</td></tr>`).join('')}</tbody></table>
    </article>`;}).join('');
}

/* ---------- Olay satırı ---------- */
const IC={G:'<i class="ic g" title="Gol"></i>',OG:'<i class="ic og" title="Kendi kalesine"></i>',Y:'<i class="ic y" title="Sarı kart"></i>',R:'<i class="ic r" title="Kırmızı kart"></i>'};
const evTeam=e=>e.t==='OG'?(e.s==='h'?'a':'h'):e.s;
function evLine(id){
  const r=DATA.matches[id], s=status(id);
  if(!r||(s!=='done'&&s!=='live')||!Array.isArray(r.ev)||!r.ev.length) return '';
  const sorted=[...r.ev].filter(e=>e.t!=='Y').sort((x,y)=>(x.m||999)-(y.m||999));
  if(!sorted.length) return '';
  const side=sd=>sorted.filter(e=>evTeam(e)===sd)
    .map(e=>`<span>${IC[e.t]||''}${esc(pName(e.p))}${e.t==='OG'?' (k.k.)':''}${e.m?` ${e.m}'`:''}</span>`).join('');
  return `<div class="ev"><div>${side('h')}</div><div>${side('a')}</div></div>`;
}

/* ---------- Fikstür ---------- */
const state={tur:null,g:'',q:''};
{const nx=ALL.find(m=>m.d>=todayKey);state.tur=nx?nx.tur:0;}
function fixtureControls(){
  $('#turTabs').innerHTML=['Tümü',1,2,3,4,5,'Eleme'].map(n=>{const v=n==='Tümü'?0:n==='Eleme'?6:n;return `<button type="button" data-tur="${v}" aria-pressed="${state.tur===v}">${typeof n==='number'?n+'. Tur':n}</button>`}).join('');
  $('#gChips').innerHTML=['',...Object.keys(GROUPS)].map(g=>`<button type="button" data-g="${g}" data-gf="${g}" aria-pressed="${state.g===g}" title="${g?g+' Grubu':'Tüm gruplar'}">${g||'Tümü'}</button>`).join('');
}
function hl(name){
  if(!state.q||!name) return esc(name);
  const i=low(name).indexOf(state.q);
  if(i<0) return esc(name);
  return esc(name.slice(0,i))+'<mark>'+esc(name.slice(i,i+state.q.length))+'</mark>'+esc(name.slice(i+state.q.length));
}
function scoreCell(id){
  const st=status(id), s=shown(id);
  if(st==='live') return `<span class="s live">${s?s.join('–'):'0–0'}</span>`;
  if(st==='post') return `<span class="s post">ERT.</span>`;
  return `<span class="s">${s?s.join('–'):'–'}</span>`;
}
function matchRow(m){
  return `<div class="m" data-match="${m.id}" role="button" tabindex="0"><span class="t">${status(m.id)==='live'?`<span class="badge live">${DATA.matches[m.id].minute?DATA.matches[m.id].minute+"'":'Canlı'}</span>`:(m.t||'—')}</span><span class="h">${hl(m.h)}</span>${scoreCell(m.id)}<span class="a">${hl(m.a)}</span>${m.g?`<span class="gp" data-g="${m.g}">${m.g}</span>`:'<span></span>'}</div>${evLine(m.id)}`;
}
const matchFilter=m=>(!state.g||m.g===state.g)&&(!state.q||low(m.h||'').includes(state.q)||low(m.a||'').includes(state.q));
function dayCard(d,rows,tbd,title){
  const f=fmt(d),diff=dayDiff(d);
  const tag=diff===0?'Bugün':diff===1?'Yarın':'';
  return `<article class="daycard ${diff<0?'past':''} ${diff===0?'today':''}">
    <header><b>${f.dm}</b><span>${title||f.wd}</span>${tag?`<em>${tag}</em>`:''}</header>
    ${tbd?'<div class="tbd">Saatler kura ile belirlenecek</div>':''}
    ${rows.map(matchRow).join('')}
  </article>`;
}
function fixture(){
  let html='';
  const showGroups=state.tur!==6, showKo=state.tur===0||state.tur===6;
  if(showGroups){
    const rounds=state.tur?ROUNDS.filter(r=>r.n===state.tur):ROUNDS;
    rounds.forEach(r=>{
      const cards=r.days.map(([d,ms,tbd])=>{const rows=ALL.filter(m=>m.d===d).filter(matchFilter);return rows.length?dayCard(d,rows,tbd):''}).join('');
      const byes=r.bye.filter(t=>(!state.g||TEAM_G[t]===state.g)&&(!state.q||low(t).includes(state.q)));
      if(!cards&&!byes.length) return;
      html+=`${state.tur?'':`<h3 class="subhead" style="margin-top:${html?'34px':'0'}">${r.n}. Tur <span class="muted" style="font-size:1rem;font-family:var(--f-body);font-weight:600;text-transform:none">${r.span}</span></h3>`}
        ${cards?`<div class="days">${cards}</div>`:''}
        ${byes.length?`<div class="bye"><b>Bay geçen</b>${byes.map(t=>`<span><i class="gp" data-g="${TEAM_G[t]}">${TEAM_G[t]}</i>${hl(t)}</span>`).join('')}</div>`:''}`;
    });
  }
  if(showKo&&!state.g){
    const days=[...new Set(KO_ALL.map(k=>k.d))];
    const cards=days.map(d=>{const rows=KO_ALL.filter(k=>k.d===d).sort((x,y)=>x.t.localeCompare(y.t)).map(k=>{const m=matchInfo(k.id);return {...m,h:m.h||k.h,a:m.a||k.a}}).filter(matchFilter);
      return rows.length?dayCard(d,rows,false,KO_STAGE[Object.keys(KO).find(s=>KO[s].some(k=>k.d===d))]):''}).join('');
    if(cards) html+=`${state.tur===0?`<h3 class="subhead" style="margin-top:${html?'34px':'0'}">Eleme turları</h3>`:''}<div class="days">${cards}</div>`;
  }
  $('#fixture').innerHTML=html||'<div class="empty">Bu filtreyle eşleşen maç yok. Aramayı ya da grup seçimini değiştirin.</div>';
}

/* ---------- İstatistik ---------- */
function leaderCard(title,ic,rows,unit,valFn,subFn){
  const body=rows.length?`<ol>${rows.map((r,i)=>`<li><span class="rk">${i+1}</span><span class="nm">${r.name}<small>${subFn(r)}</small></span><span class="c">${valFn(r)}</span></li>`).join('')}</ol>`
    :`<div class="none">Henüz ${unit} kaydı yok. Maç sonuçları girildikçe liste dolacak.</div>`;
  return `<article class="lcard"><header>${ic}<h3>${title}</h3></header>${body}</article>`;
}
function leaders(){
  const st=computeStats();
  const pSub=pid=>{const p=DATA.players[pid]||{};const g=TEAM_G[p.team];return `${g?`<i class="gp" data-g="${g}">${g}</i>`:''}${esc(p.team||'')}`};
  const top=k=>Object.entries(st).filter(([,v])=>v[k]>0).sort((a,b)=>b[1][k]-a[1][k]||pName(a[0]).localeCompare(pName(b[0]),'tr')).slice(0,10)
    .map(([pid,v])=>({name:`<button type="button" class="plink" data-player="${pid}">${esc(pName(pid))}</button>`,pid,v:v[k]}));
  const card=(k,title,ic,unit)=>leaderCard(title,ic,top(k),unit,r=>r.v,r=>pSub(r.pid));
  const banned=Object.entries(DATA.players).filter(([,p])=>p.ban).map(([pid,p])=>({name:`<button type="button" class="plink" data-player="${pid}">${esc(p.name)}</button>`,pid,ban:p.ban}));
  $('#leaders').innerHTML=
    card('G','Gol krallığı','<i class="ic g"></i>','gol')+
    card('A','Asist krallığı','<i class="ic g"></i>','asist')+
    card('Y','Sarı kart','<i class="ic y" style="width:11px;height:15px"></i>','sarı kart')+
    card('R','Kırmızı kart','<i class="ic r" style="width:11px;height:15px"></i>','kırmızı kart')+
    card('MVP','Maçın oyuncusu','<span class="mvp">MVP</span>','maçın oyuncusu')+
    leaderCard('Cezalılar','<i class="ic r" style="width:11px;height:15px"></i>',banned,'ceza',r=>'',r=>`${pSub(r.pid)} · ${esc(r.ban)}`);
  // Takım tabloları
  const recs=Object.keys(TEAM_G).map(t=>({t,...teamRecord(t)})).filter(r=>r.O>0);
  const tSub=t=>`<i class="gp" data-g="${TEAM_G[t]}">${TEAM_G[t]}</i>${TEAM_G[t]} Grubu`;
  const tRow=(arr,val)=>arr.slice(0,8).map(r=>({name:`<button type="button" data-team="${esc(r.t)}" style="all:unset;cursor:pointer">${esc(r.t)}</button>`,t:r.t,v:val(r)}));
  $('#teamStats').innerHTML=
    leaderCard('En golcü takımlar','<i class="ic g"></i>',tRow([...recs].sort((a,b)=>b.A-a.A||a.O-b.O),r=>r.A),'gol',r=>r.v,r=>tSub(r.t))+
    leaderCard('En az gol yiyenler','<i class="ic g" style="background:var(--sea)"></i>',tRow([...recs].sort((a,b)=>a.Y/a.O-b.Y/b.O||b.O-a.O),r=>r.Y),'maç',r=>r.v,r=>`${tSub(r.t)} · ${recs.find(x=>x.t===r.t).O} maç`)+
    leaderCard('Fair play','<i class="ic y" style="width:11px;height:15px"></i>',tRow([...recs].sort((a,b)=>(a.SK+a.KK*3)/a.O-(b.SK+b.KK*3)/b.O),r=>r.SK+r.KK*3),'maç',r=>r.v,r=>{const x=recs.find(q=>q.t===r.t);return `${tSub(r.t)} · ${x.SK} sarı, ${x.KK} kırmızı`});
}

/* ---------- Takımlar ---------- */
const R16_OF={};KO.r16.forEach(k=>{R16_OF[k.h]=k;R16_OF[k.a]=k});
function teamOptions(sel,withEmpty){
  sel.innerHTML=(withEmpty?'<option value="">Seçilmedi</option>':'')+Object.entries(GROUPS).map(([g,ts])=>`<optgroup label="${g} Grubu">${ts.map(t=>`<option value="${esc(t)}">${esc(t)}</option>`).join('')}</optgroup>`).join('');
}
function teamSelect(){
  teamOptions($('#teamSel'));
  let saved=null;try{saved=localStorage.getItem('aml-team')}catch(e){}
  $('#teamSel').value=saved&&TEAM_G[saved]?saved:'Alara';
}
function squadOf(t){
  return Object.entries(DATA.players).filter(([,p])=>p.team===t)
    .sort((a,b)=>(a[1].no||999)-(b[1].no||999)||a[1].name.localeCompare(b[1].name,'tr'));
}
function teamMatches(t){
  return everyMatch().filter(m=>m.h===t||m.a===t).sort((x,y)=>(x.d+(x.t||'')).localeCompare(y.d+(y.t||'')));
}
function team(){
  const t=$('#teamSel').value,g=TEAM_G[t];
  try{localStorage.setItem('aml-team',t)}catch(e){}
  $('#teamGrid').innerHTML=Object.entries(GROUPS).map(([gg,ts])=>`<div class="col" data-g="${gg}"><b>${gg}</b>${ts.map(x=>`<button type="button" data-team="${esc(x)}" data-noscroll="1" aria-current="${x===t}">${esc(x)}</button>`).join('')}</div>`).join('');
  const rec=teamRecord(t), info=DATA.teams[slug(t)]||{};
  const rank=standings(g).findIndex(r=>r.t===t)+1;
  $('#teamId').innerHTML=`${LOGOS[slug(t)]?`<img class="teamLogo" src="${LOGOS[slug(t)]}" alt="${esc(t)} logosu">`:`<span class="gp" data-g="${g}" style="width:2.6rem;height:2.6rem;font-size:1.6rem">${g}</span>`}<div><div class="big">${esc(t)}</div><small>${g} Grubu · ${rec.O?`${rank}. sırada`:`kura no ${TEAM_POS[t]}`}</small></div>`;
  $('#teamTiles').innerHTML=[['Puan',rec.G*3+rec.B],['Maç',rec.O],['Atılan',rec.A],['Yenen',rec.Y]].map(([k,v])=>`<div class="tile"><b>${v}</b><span>${k}</span></div>`).join('');
  const cap=info.captain&&DATA.players[info.captain]?DATA.players[info.captain].name:'';
  const rows=[['Form',rec.form.length?formHtml(rec.form):'<span class="muted">Henüz maç yok</span>'],['Kaptan',esc(cap)],['Sorumlu',esc(info.coach)],['Renkler',esc(info.colors)]].filter(r=>r[1]);
  $('#teamInfo').innerHTML=rows.map(([k,v])=>`<dt>${k}</dt><dd>${v}</dd>`).join('')+(info.note?`<dt>Hakkında</dt><dd style="font-weight:500">${esc(info.note)}</dd>`:'');
  $('#teamPath').innerHTML=[1,2].map(p=>{const k=R16_OF[g+p],opp=k.h===g+p?k.a:k.h,f=fmt(k.d);
    return `<div><b>Grup ${ORD[p]} olursa</b>${k.c} · ${f.dm} ${f.wd} ${k.t} · rakip ${opp[0]} Grubu ${ORD[opp[1]]}</div>`}).join('');
  const lines=ROUNDS.map(r=>{
    if(r.bye.includes(t)) return `<li class="byeRow"><span class="tur">${r.n}. Tur<small>${r.span}</small></span><span class="vs muted">Bay haftası, maç yok</span><span class="when"></span></li>`;
    const m=ALL.find(x=>x.tur===r.n&&(x.h===t||x.a===t)); if(!m) return '';
    return timelineRow(m,`${r.n}. Tur`,m.h===t?'Ev sahibi':'Deplasman');
  });
  KO_ALL.forEach(k=>{const m=matchInfo(k.id);if(m.h===t||m.a===t) lines.push(timelineRow(m,k.c,KO_STAGE[Object.keys(KO).find(s=>KO[s].includes(k))]));});
  $('#teamLine').innerHTML=lines.join('');
  const st=computeStats(), sq=squadOf(t);
  $('#squad').innerHTML=`<header><h3>Kadro</h3><span class="muted" style="font-size:.82rem">${sq.length} oyuncu</span></header>`+
    (sq.length?`<div class="tw"><table><thead><tr><th>No</th><th>Oyuncu</th><th title="Gol">Gol</th><th title="Asist">Ast</th><th title="Sarı kart"><i class="ic y"></i></th><th title="Kırmızı kart"><i class="ic r"></i></th><th title="Maçın oyuncusu">MVP</th></tr></thead><tbody>${
      sq.map(([id,p])=>{const v=st[id]||{G:0,A:0,Y:0,R:0,MVP:0};return `<tr><td>${p.no||'–'}</td><td><span class="pcell">${avatar(id,p.name)}<span><button type="button" class="plink" data-player="${id}">${esc(p.name)}</button>${info.captain===id?' <b title="Kaptan" style="color:var(--accent)">(K)</b>':''}${p.ban?`<span class="ban" title="${esc(p.ban)}">CEZALI</span>`:''}${p.pos?`<small>${esc(p.pos)}</small>`:''}</span></span></td><td>${v.G}</td><td>${v.A}</td><td>${v.Y}</td><td>${v.R}</td><td>${v.MVP}</td></tr>`}).join('')}</tbody></table></div>`
    :`<div class="none">${esc(t)} kadrosu henüz girilmedi. Takım temsilcisi "Giriş" düğmesinden takım hesabı açıp kadroyu girebilir.</div>`);
  loadMedia(t);
}
function timelineRow(m,tur,sub){
  const f=fmt(m.d),s=shown(m.id),st=status(m.id);
  return `<li data-match="${m.id}" style="cursor:pointer"><span class="tur">${tur}<small>${sub}</small></span>
    <span class="vs">${esc(m.h)} <span>–</span> ${esc(m.a)}${s?`<span class="sc">${s.join('–')}</span>`:''}${st==='live'?' <span class="badge live">Canlı</span>':st==='post'?' <span class="badge post">Ertelendi</span>':''}</span>
    <span class="when"><b>${f.dm}</b>${f.wd} · ${m.t||'saat kura ile'}</span></li>`;
}

/* ---------- Final yolu ---------- */
function slot(ref,lose,name,goals,won){
  const g=goals!=null?`<span style="margin-left:auto;font-family:var(--f-display);font-weight:900;${won?'color:var(--accent)':''}">${goals}</span>`:'';
  if(name) return `<div class="slot"><span class="gp" data-g="${TEAM_G[name]||''}">${TEAM_G[name]||''}</span>${esc(name)}${g}</div>`;
  if(/^[A-H][12]$/.test(ref)) return `<div class="slot"><span class="gp" data-g="${ref[0]}">${ref[0]}</span>${ref[0]} Grubu ${ORD[ref[1]]}${g}</div>`;
  return `<div class="slot"><span class="ref">${ref}</span>${lose?'mağlubu':'galibi'}${g}</div>`;
}
function bracket(){
  const col=(title,sub,arr)=>`<div class="col"><h3>${title}</h3><div class="cd">${sub}</div><div class="stack">${arr.map(k=>{const f=fmt(k.d),r=DATA.matches[k.id]||{},s=shown(k.id),tm=koTeams(k);
    const hw=s&&status(k.id)==='done'&&(s[0]>s[1]||(s[0]===s[1]&&r.pen==='h')),aw=s&&status(k.id)==='done'&&(s[1]>s[0]||(s[0]===s[1]&&r.pen==='a'));
    return `<div class="ko ${k.big?'final':''}" data-match="${k.id}" style="cursor:pointer"><div class="meta"><b>${k.c}</b><span>${status(k.id)==='live'?'<span class="badge live">Canlı</span>':`${f.dm} · ${k.t}`}${s&&s[0]===s[1]&&r.pen?' · pen.':''}</span></div>${slot(k.h,k.lose,tm.h,s?s[0]:null,hw)}${slot(k.a,k.lose,tm.a,s?s[1]:null,aw)}</div>`}).join('')}</div></div>`;
  $('#bracket').innerHTML=col('Son 16','16–19 Kasım',KO.r16)+col('Çeyrek Final','23–24 Kasım',KO.qf)+col('Yarı Final','27 Kasım Cuma',KO.sf)+col('Final Gecesi','1 Aralık Salı',KO.f);
}

/* ---------- Maç penceresi ---------- */
let openMatchId=null;
function openMatch(id,push=true){
  const m=matchInfo(id); if(!m) return;
  openPlayerId=null; openMatchId=id; renderMatchModal();
  const d=$('#matchModal'); if(!d.open){try{d.showModal()}catch(e){d.setAttribute('open','')}}
  if(push) history.replaceState(null,'','#mac/'+id);
}
function renderMatchModal(){
  const id=openMatchId; if(!id) return;
  const m=matchInfo(id), r=DATA.matches[id]||{}, st=status(id), s=shown(id), f=fmt(m.d);
  const h=m.h||m.ko?.h, a=m.a||m.ko?.a;
  const stage=m.ko?`${KO_STAGE[Object.keys(KO).find(x=>KO[x].includes(m.ko))]} · ${m.ko.c}`:`${m.g} Grubu · ${m.tur}. Tur`;
  const stLabel=st==='live'?`<span class="badge live">Canlı${r.minute?' '+r.minute+"'":''}</span>`:st==='done'?'<span class="badge ft">Maç sonu</span>':st==='post'?'<span class="badge post">Ertelendi</span>':'';
  const ev=Array.isArray(r.ev)?[...r.ev].sort((x,y)=>(x.m||999)-(y.m||999)):[];
  const lbl={G:'Gol',OG:'Kendi kalesine',Y:'Sarı kart',R:'Kırmızı kart'};
  const evHtml=(st==='done'||st==='live')&&ev.length?`<ul class="tl">${ev.map(e=>{const team=e.t==='OG'?e.s:e.s;const txt=`${IC[e.t]}<span><button type="button" class="plink" data-player="${e.p}">${esc(pName(e.p))}</button>${e.as&&e.t==='G'?` <small>asist ${esc(pName(e.as))}</small>`:''}${e.t==='OG'?' <small>(k.k.)</small>':''}</span>`;
    return `<li title="${lbl[e.t]}"><span class="l">${team==='h'?txt:''}</span><span class="mn">${e.m?e.m+"'":'–'}</span><span class="r">${team==='a'?txt:''}</span></li>`}).join('')}</ul>`:'';
  const kv=[['Tarih',`${f.dm} ${pd(m.d).getFullYear()} ${f.wd}`],['Saat',m.t||'Kura ile belirlenecek'],['Saha',r.venue?`${esc(r.venue)} · <a href="https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(r.venue+' Alanya')}" target="_blank" rel="noopener">Haritada aç</a>`:''],
    ['Hava (tahmin)',st!=='done'&&wx(m.d,m.t)?esc(wxText(wx(m.d,m.t))):''],['Hakem',esc(r.ref)],
    ['Maçın oyuncusu',r.mvp&&DATA.players[r.mvp]?`<span class="mvp">MVP</span> <button type="button" class="plink" data-player="${r.mvp}">${esc(pName(r.mvp))}</button>`:''],['Penaltılar',st==='done'&&r.pen&&s&&s[0]===s[1]?`${esc(r.pen==='h'?h:a)} kazandı`:'']].filter(x=>x[1]);
  const video=/^https:\/\//.test(r.video||'')?`<a class="btn sm" href="${esc(r.video)}" target="_blank" rel="noopener">Maç videosunu izle</a>`:'';
  $('#matchModal').innerHTML=`<div class="mhead"><button type="button" class="close" data-close aria-label="Kapat">×</button>
      <div class="meta"><span>${stage}</span>${stLabel}</div>
      <div class="mscore" id="mTitle"><span class="tn">${esc(h)}</span><span class="sc">${s?s.join('–'):'vs'}${st==='done'&&r.pen&&s&&s[0]===s[1]?'<small>pen.</small>':''}</span><span class="tn">${esc(a)}</span></div></div>
    <div class="mbody">
      ${evHtml||(st==='done'?'<p class="hint">Bu maç için olay girilmedi.</p>':'')}
      ${r.note?`<p style="margin:0">${esc(r.note)}</p>`:''}
      <dl class="kv">${kv.map(([k,v])=>`<dt>${k}</dt><dd>${v}</dd>`).join('')}</dl>
      <div class="actions" style="margin-top:0">${video}
        <button type="button" class="btn sm line" data-ics="${id}">Takvime ekle</button>
        <button type="button" class="btn sm line" data-share="${id}">Paylaş</button></div>
    </div>`;
}
function openPlayer(pid,push=true){
  if(!DATA.players[pid]) return;
  openMatchId=null; openPlayerId=pid; loadMedia(DATA.players[pid].team); renderPlayerModal();
  const d=$('#matchModal'); if(!d.open){try{d.showModal()}catch(e){d.setAttribute('open','')}}
  if(push) history.replaceState(null,'','#oyuncu/'+pid);
}
function renderPlayerModal(){
  const pid=openPlayerId; if(!pid) return; const p=DATA.players[pid]; if(!p){closeMatch();return;}
  const g=TEAM_G[p.team], v=computeStats()[pid]||{G:0,A:0,Y:0,R:0,MVP:0}, info=DATA.teams[slug(p.team)]||{};
  const games=everyMatch().filter(m=>{const r=DATA.matches[m.id],s=status(m.id);return (s==='done'||s==='live')&&r&&((Array.isArray(r.ev)&&r.ev.some(e=>e.p===pid||e.as===pid))||r.mvp===pid)}).sort((x,y)=>y.d.localeCompare(x.d));
  const list=games.length?`<ul class="tl" style="gap:6px">${games.map(m=>{const r=DATA.matches[m.id],s=shown(m.id),f=fmt(m.d);
    const evs=(r.ev||[]).filter(e=>e.p===pid||e.as===pid).map(e=>`${e.as===pid&&e.p!==pid?'<small>asist</small>':IC[e.t]}${e.m?` ${e.m}'`:''}`).join(' ');
    return `<li data-match="${m.id}" style="grid-template-columns:4.4rem minmax(0,1fr) auto;cursor:pointer"><span class="mn" style="text-align:left">${f.dm}</span><span>${esc(m.h)} ${s?s.join('–'):''} ${esc(m.a)}${r.mvp===pid?' <span class="mvp">MVP</span>':''}</span><span class="r">${evs}</span></li>`}).join('')}</ul>`
    :'<p class="hint">Bu oyuncu için henüz maç istatistiği girilmedi.</p>';
  $('#matchModal').innerHTML=`<div class="mhead"><button type="button" class="close" data-close aria-label="Kapat">×</button>
      <div class="phead">${avatar(pid,p.name,'lg')}<div style="min-width:0"><div class="nm" id="mTitle">${esc(p.name)}</div>
      <div class="sub">${p.no?`#${p.no} · `:''}${esc(p.pos||'Mevki belirtilmedi')} · ${esc(p.team)} (${g} Grubu)${info.captain===pid?' · Kaptan':''}</div>
      ${p.ban?`<div style="margin-top:8px"><span class="badge post">Cezalı</span> <small style="color:var(--board-dim)">${esc(p.ban)}</small></div>`:''}</div></div></div>
    <div class="mbody">
      <div class="ptiles">${[['Gol',v.G],['Asist',v.A],['Sarı',v.Y],['Kırmızı',v.R],['MVP',v.MVP]].map(([k,x])=>`<div class="tile"><b>${x}</b><span>${k}</span></div>`).join('')}</div>
      ${list}
      <div class="actions" style="margin-top:0"><button type="button" class="btn sm line" data-team="${esc(p.team)}">${esc(p.team)} takım sayfası</button>
        <button type="button" class="btn sm line" data-pshare="${pid}">Paylaş</button></div>
    </div>`;
}
function closeMatch(){const d=$('#matchModal');if(d.open)d.close();}
$('#matchModal').addEventListener('close',()=>{openMatchId=null;openPlayerId=null;if(/^#(mac|oyuncu)\//.test(location.hash))history.replaceState(null,'',location.pathname+location.search);});
$('#matchModal').addEventListener('click',e=>{if(e.target===e.currentTarget||e.target.closest('[data-close]'))closeMatch();});

/* ---------- Takvim ve paylaşım ---------- */
function icsDate(d,t){return t?`;TZID=Europe/Istanbul:${d.replace(/-/g,'')}T${t.replace(':','')}00`:`;VALUE=DATE:${d.replace(/-/g,'')}`}
function icsEnd(d,t){
  if(!t){const x=pd(d);x.setDate(x.getDate()+1);return `;VALUE=DATE:${x.getFullYear()}${pad(x.getMonth()+1)}${pad(x.getDate())}`}
  const[hh,mm]=t.split(':').map(Number);const x=new Date(2000,0,1,hh,mm+70);let dd=d;
  if(x.getDate()!==1){const y=pd(d);y.setDate(y.getDate()+1);dd=`${y.getFullYear()}-${pad(y.getMonth()+1)}-${pad(y.getDate())}`}
  return `;TZID=Europe/Istanbul:${dd.replace(/-/g,'')}T${pad(x.getHours())}${pad(x.getMinutes())}00`;
}
function downloadIcs(ms,name){
  const ev=ms.map(m=>{const h=m.h||m.ko?.h||'',a=m.a||m.ko?.a||'',r=DATA.matches[m.id]||{};
    return ['BEGIN:VEVENT',`UID:${m.id}@alanyamahalleligi.github.io`,`DTSTAMP:${new Date().toISOString().replace(/[-:]/g,'').slice(0,15)}Z`,
      `DTSTART${icsDate(m.d,m.t)}`,`DTEND${icsEnd(m.d,m.t)}`,`SUMMARY:${h} - ${a} (Alanya Mahalle Ligi)`,
      r.venue?`LOCATION:${r.venue.replace(/[,;]/g,' ')}`:'',`DESCRIPTION:${m.ko?m.ko.c:m.g+' Grubu '+m.tur+'. Tur'} - TV82 YouTube kanalında canlı`,
      `URL:${location.origin}${location.pathname}#mac/${m.id}`,'END:VEVENT'].filter(Boolean).join('\r\n')});
  const txt=['BEGIN:VCALENDAR','VERSION:2.0','PRODID:-//Alanya Mahalle Ligi//TR','CALSCALE:GREGORIAN',
    'BEGIN:VTIMEZONE','TZID:Europe/Istanbul','BEGIN:STANDARD','DTSTART:19700101T000000','TZOFFSETFROM:+0300','TZOFFSETTO:+0300','TZNAME:+03','END:STANDARD','END:VTIMEZONE',
    ...ev,'END:VCALENDAR'].join('\r\n');
  const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([txt],{type:'text/calendar'}));a.download=name+'.ics';
  document.body.appendChild(a);a.click();setTimeout(()=>{URL.revokeObjectURL(a.href);a.remove()},1000);
  toast('Takvim dosyası indirildi');
}
async function share(title,hash){
  const url=`${location.origin}${location.pathname}${hash}`;
  try{if(navigator.share){await navigator.share({title,url});return;}}catch(e){if(e&&e.name==='AbortError')return;}
  try{await navigator.clipboard.writeText(url);toast('Bağlantı kopyalandı');}catch(e){toast(url);}
}

function renderAll(){board();liveBar();facts();lastResults();news();groups();fixture();leaders();team();bracket();renderMatchModal();renderPlayerModal();if(panelReady){if(IS_ADMIN){adminSides();renderDraft();newsAdminList();accountsList();}playerList();}
  if(ROUTE_PLAYER&&DATA.players[ROUTE_PLAYER]){const p=ROUTE_PLAYER;ROUTE_PLAYER=null;openPlayer(p,false);}}

/* ---------- Tema ---------- */
const THEMES=['system','light','dark'], THEME_LBL={system:'Tema: sistem',light:'Tema: açık',dark:'Tema: koyu'};
const THEME_IC={system:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="9"/><path d="M12 3a9 9 0 0 0 0 18z" fill="currentColor"/></svg>',
  light:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/></svg>',
  dark:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 13A9 9 0 1 1 11 3a7 7 0 0 0 10 10z"/></svg>'};
function applyTheme(t){
  if(t==='system') document.documentElement.removeAttribute('data-theme'); else document.documentElement.setAttribute('data-theme',t);
  $('#themeBtn').innerHTML=THEME_IC[t]; $('#themeBtn').setAttribute('aria-label',THEME_LBL[t]); $('#themeBtn').title=THEME_LBL[t];
}
let theme='system';try{theme=localStorage.getItem('aml-theme')||'system'}catch(e){}
applyTheme(theme);
$('#themeBtn').addEventListener('click',()=>{theme=THEMES[(THEMES.indexOf(theme)+1)%3];applyTheme(theme);try{localStorage.setItem('aml-theme',theme)}catch(e){}});

/* ---------- Panel (yönetici ve takım hesabı) ---------- */
const draft={id:null,ev:[]};
let editPlayer=null, editNews=null, panelReady=false, pendingPhoto=undefined, pendingLogo=null;
const PANEL_ON=()=>IS_ADMIN||!!MY_TEAM;
function toast(msg){
  let t=$('#toast'); if(!t){t=document.createElement('div');t.id='toast';t.className='toast';t.setAttribute('role','status');document.body.appendChild(t);}
  t.textContent=msg;t.hidden=false;clearTimeout(toast._t);toast._t=setTimeout(()=>{t.hidden=true},3200);
}
function errMsg(e){
  const c=e&&e.code||'';
  if(c==='quota_exceeded'||c==='resource-exhausted') return 'Kota doldu. Biraz sonra tekrar deneyin.';
  if(c==='permission-denied'||c==='invalid_argument') return 'Bu işlem için yetkiniz yok.';
  return 'Kaydedilemedi, bağlantıyı kontrol edip tekrar deneyin.';
}
function armButton(b,label,armedLabel){
  if(b.dataset.arm){b.dataset.arm='';b.textContent=label;return true;}
  b.dataset.arm='1';b.textContent=armedLabel;setTimeout(()=>{if(b.dataset.arm){b.dataset.arm='';b.textContent=label;}},4000);return false;
}
/* Görseli kare kırpıp küçültür, JPEG data URL döndürür */
function resizeImage(file,size=320){
  return new Promise((ok,fail)=>{
    if(!file||!/^image\//.test(file.type)){fail(new Error('type'));return;}
    const img=new Image(), url=URL.createObjectURL(file);
    img.onload=()=>{
      const s=Math.min(img.naturalWidth,img.naturalHeight), c=document.createElement('canvas');
      c.width=c.height=size; const x=c.getContext('2d');
      x.fillStyle='#fff';x.fillRect(0,0,size,size);
      x.drawImage(img,(img.naturalWidth-s)/2,(img.naturalHeight-s)/2,s,s,0,0,size,size);
      URL.revokeObjectURL(url);
      let q=.85,d=c.toDataURL('image/jpeg',q);
      while(d.length>140000&&q>.4){q-=.1;d=c.toDataURL('image/jpeg',q);}
      ok(d);
    };
    img.onerror=()=>{URL.revokeObjectURL(url);fail(new Error('decode'));};
    img.src=url;
  });
}
function matchOptions(){
  if(!IS_ADMIN) return;
  const lbl=id=>{const s=status(id);return s==='done'?' ✓':s==='live'?' ● canlı':s==='post'?' (ertelendi)':''};
  const cur=$('#aMatch').value;
  $('#aMatch').innerHTML=ROUNDS.map(r=>`<optgroup label="${r.n}. Tur">${ALL.filter(m=>m.tur===r.n).map(m=>{const f=fmt(m.d);
    return `<option value="${m.id}">${f.dm} ${m.t||''} · ${esc(m.h)} – ${esc(m.a)}${lbl(m.id)}</option>`}).join('')}</optgroup>`).join('')
    +`<optgroup label="Eleme turları">${KO_ALL.map(k=>{const tm=koTeams(k);return `<option value="${k.id}">${fmt(k.d).dm} ${k.t} · ${esc(k.c)} (${esc(tm.h||k.h)} – ${esc(tm.a||k.a)})${lbl(k.id)}</option>`}).join('')}</optgroup>`;
  if(cur) $('#aMatch').value=cur;
  else{const nx=ALL.find(m=>status(m.id)==='live')||ALL.find(m=>m.d>=todayKey&&status(m.id)!=='done')||ALL.find(m=>status(m.id)!=='done');if(nx)$('#aMatch').value=nx.id;}
}
function curTeams(){
  const id=$('#aMatch').value;
  if(MATCH_BY_ID[id]) return {h:MATCH_BY_ID[id].h,a:MATCH_BY_ID[id].a,ko:false};
  return {h:$('#aKoH').value,a:$('#aKoA').value,ko:true};
}
function loadMatch(){
  const id=$('#aMatch').value, r=DATA.matches[id]||{}, k=KO_BY_ID[id];
  draft.id=id; draft.ev=Array.isArray(r.ev)?r.ev.map(e=>({...e})):[];
  $('#koTeams').hidden=!k; $('#penWrap').hidden=!k;
  if(k){const tm=koTeams(k);$('#aKoH').value=tm.h||'';$('#aKoA').value=tm.a||'';}
  $('#aStatus').value=status(id);
  $('#aMinute').value=r.minute||'';
  $('#aHs').value=r.hs??''; $('#aAs').value=r.as??'';
  $('#aVenue').value=r.venue||''; $('#aRef').value=r.ref||''; $('#aVideo').value=r.video||''; $('#aNote').value=r.note||'';
  adminSides(); $('#aPen').value=r.pen||''; $('#aMvp').value=r.mvp||'';
  $('#aClear').dataset.arm=''; $('#aClear').textContent='Maç bilgisini sil';
  $('#aMinWrap').hidden=$('#aStatus').value!=='live';
  renderDraft();
}
const playerOpts=t=>squadOf(t).map(([id,p])=>`<option value="${id}">${p.no?p.no+' · ':''}${esc(p.name)}</option>`).join('');
function adminSides(){
  if(!IS_ADMIN) return;
  const tm=curTeams();
  $('#aHName').textContent=tm.h||'Ev sahibi'; $('#aAName').textContent=tm.a||'Deplasman';
  const sv=$('#eSide').value||'h';
  $('#eSide').innerHTML=`<option value="h">${esc(tm.h||'Ev sahibi')}</option><option value="a">${esc(tm.a||'Deplasman')}</option>`;
  $('#eSide').value=sv;
  const pv=$('#aPen').value;
  $('#aPen').innerHTML=`<option value="">Yok</option><option value="h">${esc(tm.h||'Ev sahibi')}</option><option value="a">${esc(tm.a||'Deplasman')}</option>`;
  $('#aPen').value=pv;
  const mv=$('#aMvp').value;
  $('#aMvp').innerHTML='<option value="">Seçilmedi</option>'+(tm.h?`<optgroup label="${esc(tm.h)}">${playerOpts(tm.h)}</optgroup>`:'')+(tm.a?`<optgroup label="${esc(tm.a)}">${playerOpts(tm.a)}</optgroup>`:'');
  $('#aMvp').value=mv;
  eventPlayers();
}
function eventPlayers(){
  const tm=curTeams(), side=$('#eSide').value, t=side==='a'?tm.a:tm.h, opts=t?playerOpts(t):'';
  const pv=$('#ePl').value, av=$('#eAs').value;
  $('#ePl').innerHTML=opts||'<option value="">Önce kadroya oyuncu ekleyin</option>';
  $('#eAs').innerHTML='<option value="">Asist yok</option>'+opts;
  if(pv&&DATA.players[pv]?.team===t) $('#ePl').value=pv;
  if(av&&DATA.players[av]?.team===t) $('#eAs').value=av;
  $('#eAsWrap').hidden=$('#eType').value!=='G';
}
function goalsFromEv(){
  let h=0,a=0;
  for(const e of draft.ev){ if(e.t==='G'){e.s==='h'?h++:a++} else if(e.t==='OG'){e.s==='h'?a++:h++} }
  return [h,a];
}
function renderDraft(){
  if(!draft.id||!IS_ADMIN) return;
  const tm=curTeams(); const ev=draft.ev.map((e,i)=>({...e,i})).sort((x,y)=>(x.m||999)-(y.m||999));
  const lbl={G:'Gol',OG:'Kendi kalesine',Y:'Sarı kart',R:'Kırmızı kart'};
  $('#aEvList').innerHTML=ev.length?ev.map(e=>`<li><span class="mn">${e.m?e.m+"'":'–'}</span>${IC[e.t]}<span class="who">${esc(pName(e.p))} <small>${lbl[e.t]} · ${esc(e.s==='h'?tm.h:tm.a)}${e.as?` · asist ${esc(pName(e.as))}`:''}</small></span><button type="button" data-delev="${e.i}" aria-label="Olayı kaldır">×</button></li>`).join('')
    :'<li><span class="who muted">Henüz olay eklenmedi.</span></li>';
  const [gh,ga]=goalsFromEv(), hs=$('#aHs').value, as=$('#aAs').value;
  const mismatch=draft.ev.some(e=>e.t==='G'||e.t==='OG')&&hs!==''&&as!==''&&(+hs!==gh||+as!==ga);
  const st=$('#aStatus').value;
  $('#aHint').innerHTML=mismatch?`<b>Dikkat:</b> olaylardaki goller ${gh}–${ga}, girilen skor ${hs}–${as}. Skoru gollerden hesaplatabilirsiniz.`
    :st==='live'?'Canlı maç sitede kırmızı "Canlı" etiketiyle görünür; puan tablosuna maç bitince işlenir. Gol girdikçe Kaydet\'e basmanız yeterli.'
    :st==='done'?'Biten maç puan tablosuna ve istatistiklere işlenir.'
    :'Durumu "Bitti" yapmadan skor puan tablosuna işlenmez.';
}
function playerList(){
  if(!panelReady) return;
  const t=$('#pTeam').value, sq=squadOf(t);
  loadMedia(t);
  $('#pList').innerHTML=sq.length?sq.map(([id,p])=>`<li>${avatar(id,p.name)}<b>${p.no||'–'}</b><span data-editp="${id}">${esc(p.name)}${p.pos?` <small class="muted">${esc(p.pos)}</small>`:''}${p.ban?' <small style="color:#ff7a70">cezalı</small>':''}</span><button type="button" data-delp="${id}">Sil</button></li>`).join('')
    :`<li><span class="muted">${esc(t)} için henüz oyuncu yok. Soldaki formdan ekleyin.</span></li>`;
}
function newsAdminList(){
  if(!IS_ADMIN) return;
  const list=newsSorted();
  $('#nList').innerHTML=list.length?list.map(([id,n])=>`<li><span>${n.pinned?'<span class="badge post">Sabit</span> ':''}<b>${esc(n.title)}</b> <small class="muted">${fmtDate(n.date)}</small></span><button type="button" data-editn="${id}">Düzenle</button><button type="button" data-deln="${id}">Sil</button></li>`).join('')
    :'<li><span class="muted">Henüz duyuru yok.</span></li>';
}
function teamInfoForm(){
  const t=$('#tTeam').value, info=DATA.teams[slug(t)]||{};
  loadMedia(t);
  $('#tCaptain').innerHTML='<option value="">Seçilmedi</option>'+playerOpts(t);
  $('#tCaptain').value=info.captain||''; $('#tCoach').value=info.coach||''; $('#tColors').value=info.colors||''; $('#tNote').value=info.note||'';
  pendingLogo=null; $('#tLogo').value='';
  const lg=LOGOS[slug(t)]; $('#tLogoPrev').style.backgroundImage=lg?`url("${lg}")`:'';
}
function accountsList(){
  if(!IS_ADMIN||!panelReady) return;
  const reqs=Object.entries(DATA.requests||{}).sort((a,b)=>String(a[1].created).localeCompare(String(b[1].created)));
  const opts=sel=>Object.entries(GROUPS).map(([g,ts])=>`<optgroup label="${g} Grubu">${ts.map(t=>`<option value="${esc(t)}"${t===sel?' selected':''}>${esc(t)}</option>`).join('')}</optgroup>`).join('');
  $('#reqList').innerHTML=reqs.length?reqs.map(([uid,r])=>`<li class="reqRow" style="display:grid"><span><b>${esc(r.name)}</b> · ${esc(r.email)}${r.phone?` · ${esc(r.phone)}`:''}<br><small class="muted">${fmtDate(r.created)} · başvurduğu mahalle: ${esc(r.team)}</small>${r.note?`<br><small>${esc(r.note)}</small>`:''}</span>
      <span class="row"><select data-reqteam="${uid}" aria-label="Onaylanacak mahalle">${opts(r.team)}</select><button type="button" class="btn sm" data-approve="${uid}">Onayla</button><button type="button" data-reject="${uid}">Reddet</button></span></li>`).join('')
    :'<li><span class="muted">Bekleyen başvuru yok.</span></li>';
  const mgrs=Object.entries(DATA.managers||{}).sort((a,b)=>a[1].team.localeCompare(b[1].team,'tr'));
  $('#mgrList').innerHTML=mgrs.length?mgrs.map(([uid,m])=>`<li><span><b>${esc(m.team)}</b> · ${esc(m.name||'')} <small class="muted">${esc(m.email||'')}</small></span><button type="button" data-unmgr="${uid}">Yetkiyi kaldır</button></li>`).join('')
    :'<li><span class="muted">Henüz onaylı takım hesabı yok.</span></li>';
}
function updateAdminBadge(){
  const n=IS_ADMIN?Object.keys(DATA.requests||{}).length:0;
  [$('#reqCount'),$('#reqCount2')].forEach(el=>{if(!el)return;el.hidden=!n;el.textContent=n;});
}
async function saveMatch(){
  const id=$('#aMatch').value, tm=curTeams(), hs=$('#aHs').value, as=$('#aAs').value, st=$('#aStatus').value;
  if(tm.ko&&(tm.h||tm.a)&&tm.h===tm.a){toast('Ev sahibi ve deplasman aynı takım olamaz.');return;}
  if(tm.ko&&(st==='done'||st==='live')&&(!tm.h||!tm.a)){toast('Eleme maçı için iki takımı da seçin.');return;}
  if((hs==='')!==(as==='')){toast('Skoru iki takım için de girin.');return;}
  if(st==='done'&&hs===''){toast('Biten maç için skoru girin.');return;}
  const video=$('#aVideo').value.trim();
  if(video&&!/^https:\/\//.test(video)){toast('Video bağlantısı https:// ile başlamalı.');return;}
  const num=v=>v===''?null:Math.max(0,parseInt(v,10)||0);
  const body={status:st,played:st==='done',ev:draft.ev,hs:st==='live'&&hs===''?0:num(hs),as:st==='live'&&as===''?0:num(as),
    minute:st==='live'?(parseInt($('#aMinute').value,10)||null):null,
    mvp:$('#aMvp').value||'',venue:$('#aVenue').value.trim(),ref:$('#aRef').value.trim(),video,note:$('#aNote').value.trim(),updated:new Date().toISOString()};
  if(tm.ko){body.h=$('#aKoH').value;body.a=$('#aKoA').value;body.pen=st==='done'&&body.hs===body.as?$('#aPen').value:'';
    if(st==='done'&&body.hs===body.as&&!body.pen){toast('Eleme maçı berabere bitti; penaltılarla kazananı seçin.');return;}}
  const btn=$('#aSave');btn.disabled=true;
  try{await DB.collection('matches').doc(id).set(body);toast(st==='done'?'Sonuç kaydedildi':st==='live'?'Canlı skor güncellendi':'Maç bilgisi kaydedildi');matchOptions();}
  catch(e){toast(errMsg(e));}
  finally{btn.disabled=false;}
}
async function clearMatch(){
  if(!armButton($('#aClear'),'Maç bilgisini sil','Silmek için tekrar tıklayın')) return;
  try{await DB.collection('matches').doc($('#aMatch').value).delete();toast('Maç bilgisi silindi');loadMatch();matchOptions();}
  catch(e){toast(errMsg(e));}
}
function setPhotoPrev(src){$('#pPhotoPrev').style.backgroundImage=src?`url("${src}")`:'';$('#pPhotoDel').hidden=!src;}
function resetPlayerForm(){
  editPlayer=null;pendingPhoto=undefined;$('#pName').value='';$('#pNo').value='';$('#pPos').value='';$('#pBan').value='';$('#pPhoto').value='';setPhotoPrev(null);
  $('#pFormTitle').textContent='Oyuncu ekle';$('#pAdd').textContent='Oyuncu ekle';$('#pCancel').hidden=true;
}
async function onSavePlayer(){
  const name=$('#pName').value.trim(); if(!name){toast('Oyuncunun adını yazın.');$('#pName').focus();return;}
  const tname=$('#pTeam').value, old=editPlayer?DATA.players[editPlayer]:null;
  const no=parseInt($('#pNo').value,10)||null;
  if(no&&squadOf(tname).some(([id,p])=>p.no===no&&id!==editPlayer)){toast(`${no} numara bu takımda başka bir oyuncuda. Farklı numara seçin.`);return;}
  const body={team:tname,name,no,pos:$('#pPos').value,ban:IS_ADMIN?$('#pBan').value.trim():(old?.ban||'')};
  const b=$('#pAdd');b.disabled=true;
  try{
    let id=editPlayer;
    if(id) await DB.collection('players').doc(id).set(body);
    else id=(await DB.collection('players').add(body)).id;
    if(pendingPhoto){await DB.collection('photos').doc(id).set({team:tname,data:pendingPhoto});PHOTOS[id]=pendingPhoto;}
    else if(pendingPhoto===null&&editPlayer){await DB.collection('photos').doc(id).delete();delete PHOTOS[id];}
    toast(editPlayer?`${name} güncellendi`:`${name} eklendi`);
    resetPlayerForm();$('#pName').focus();playerList();team();
  }catch(e){toast(errMsg(e));}finally{b.disabled=false;}
}
async function onBulk(){
  const lines=$('#pBulk').value.split('\n').map(s=>s.trim()).filter(Boolean);
  if(!lines.length){toast('Listeye en az bir oyuncu yazın.');return;}
  const b=$('#pBulkAdd');b.disabled=true;let n=0;
  try{for(const ln of lines){const m=ln.match(/^(\d{1,2})[\s.\-)]+(.+)$/);
      await DB.collection('players').add({team:$('#pTeam').value,name:(m?m[2]:ln).trim().slice(0,60),no:m?+m[1]:null,pos:'',ban:''});n++;}
    $('#pBulk').value='';toast(`${n} oyuncu eklendi`);}
  catch(e){toast(n?`${n} oyuncu eklendi, kalanlar eklenemedi.`:errMsg(e));}
  finally{b.disabled=false;}
}
async function saveNews(){
  const title=$('#nTitle').value.trim(), body=$('#nBody').value.trim();
  if(!title||!body){toast('Başlık ve metni yazın.');return;}
  const doc={title,body,pinned:$('#nPin').checked,date:editNews?(DATA.news[editNews]?.date||new Date().toISOString()):new Date().toISOString()};
  const b=$('#nSave');b.disabled=true;
  try{
    if(editNews) await DB.collection('news').doc(editNews).set(doc); else await DB.collection('news').add(doc);
    toast(editNews?'Duyuru güncellendi':'Duyuru yayınlandı');resetNewsForm();
  }catch(e){toast(errMsg(e));}finally{b.disabled=false;}
}
function resetNewsForm(){editNews=null;$('#nTitle').value='';$('#nBody').value='';$('#nPin').checked=false;$('#nFormTitle').textContent='Duyuru yayınla';$('#nSave').textContent='Yayınla';$('#nCancel').hidden=true;}
async function saveTeamInfo(){
  const t=$('#tTeam').value, b=$('#tSave');b.disabled=true;
  try{
    await DB.collection('teams').doc(slug(t)).set({team:t,captain:$('#tCaptain').value,coach:$('#tCoach').value.trim(),colors:$('#tColors').value.trim(),note:$('#tNote').value.trim()});
    if(pendingLogo){await DB.collection('logos').doc(slug(t)).set({team:t,data:pendingLogo});LOGOS[slug(t)]=pendingLogo;pendingLogo=null;}
    toast(`${t} bilgileri kaydedildi`);team();
  }catch(e){toast(errMsg(e));}finally{b.disabled=false;}
}
function showTab(name){
  $$('[data-atab]').forEach(x=>x.setAttribute('aria-pressed',x.dataset.atab===name));
  $$('[data-apane]').forEach(p=>p.hidden=p.dataset.apane!==name);
  if(name==='takimbilgi') teamInfoForm();
  if(name==='oyuncular') playerList();
  if(name==='hesaplar') accountsList();
}
function applyRole(){
  const allowed=IS_ADMIN?['maclar','oyuncular','duyurular','takimbilgi','hesaplar']:['oyuncular','takimbilgi'];
  $$('[data-atab]').forEach(b=>b.hidden=!allowed.includes(b.dataset.atab));
  ['#pTeam','#tTeam'].forEach(s=>{const el=$(s);if(MY_TEAM){el.value=MY_TEAM;el.disabled=true;}else el.disabled=false;});
  $('#pBanWrap').hidden=!IS_ADMIN;
  $('#panelEyebrow').textContent=IS_ADMIN?'Yönetim paneli':'Takım paneli';
  $('#panelTitle').textContent=IS_ADMIN?'Lig yönetimi':`${MY_TEAM} takım paneli`;
  const cur=$$('[data-atab]').find(b=>b.getAttribute('aria-pressed')==='true');
  showTab(cur&&allowed.includes(cur.dataset.atab)?cur.dataset.atab:allowed[0]);
}
function initPanel(){
  teamOptions($('#aKoH'),true);teamOptions($('#aKoA'),true);teamOptions($('#pTeam'));teamOptions($('#tTeam'));
  $('#pTeam').value=$('#teamSel').value;$('#tTeam').value=$('#teamSel').value;
  $$('[data-atab]').forEach(b=>b.addEventListener('click',()=>showTab(b.dataset.atab)));
  $('#aMatch').addEventListener('change',loadMatch);
  $('#aKoH').addEventListener('change',()=>{adminSides();renderDraft()});
  $('#aKoA').addEventListener('change',()=>{adminSides();renderDraft()});
  $('#aStatus').addEventListener('change',()=>{$('#aMinWrap').hidden=$('#aStatus').value!=='live';
    if($('#aStatus').value==='live'&&$('#aHs').value===''){$('#aHs').value=0;$('#aAs').value=0;}renderDraft();});
  $('#eSide').addEventListener('change',eventPlayers);
  $('#eType').addEventListener('change',eventPlayers);
  $('#aHs').addEventListener('input',renderDraft);$('#aAs').addEventListener('input',renderDraft);
  $('#eAdd').addEventListener('click',()=>{
    const p=$('#ePl').value; if(!p){toast('Önce bu takımın kadrosuna oyuncu ekleyin.');return;}
    const t=$('#eType').value, m=parseInt($('#eMin').value,10)||null;
    const e={t,s:$('#eSide').value,p,m}; if(t==='G'&&$('#eAs').value&&$('#eAs').value!==p) e.as=$('#eAs').value;
    draft.ev.push(e);$('#eMin').value='';
    if(t==='G'||t==='OG'){const[h,a]=goalsFromEv();$('#aHs').value=h;$('#aAs').value=a;}
    if(t==='R'){const pl=DATA.players[p];if(pl&&!pl.ban) toast(`${pl.name} kırmızı kart gördü. Ceza notunu Oyuncular sekmesinden ekleyebilirsiniz.`);}
    renderDraft();
  });
  $('#aEvList').addEventListener('click',e=>{const b=e.target.closest('[data-delev]');if(!b)return;draft.ev.splice(+b.dataset.delev,1);renderDraft();});
  $('#aCalc').addEventListener('click',()=>{const[h,a]=goalsFromEv();$('#aHs').value=h;$('#aAs').value=a;renderDraft();});
  $('#aSave').addEventListener('click',saveMatch);
  $('#aClear').addEventListener('click',clearMatch);
  $('#pTeam').addEventListener('change',()=>{resetPlayerForm();playerList();});
  $('#pAdd').addEventListener('click',onSavePlayer);
  $('#pCancel').addEventListener('click',resetPlayerForm);
  $('#pName').addEventListener('keydown',e=>{if(e.key==='Enter'){e.preventDefault();onSavePlayer();}});
  $('#pBulkAdd').addEventListener('click',onBulk);
  $('#pPhoto').addEventListener('change',async e=>{const f=e.target.files[0];if(!f)return;
    try{pendingPhoto=await resizeImage(f);setPhotoPrev(pendingPhoto);}catch(x){toast('Bu dosya açılamadı. JPG ya da PNG fotoğraf seçin.');e.target.value='';}});
  $('#pPhotoDel').addEventListener('click',()=>{pendingPhoto=null;$('#pPhoto').value='';setPhotoPrev(null);});
  $('#tLogo').addEventListener('change',async e=>{const f=e.target.files[0];if(!f)return;
    try{pendingLogo=await resizeImage(f,256);$('#tLogoPrev').style.backgroundImage=`url("${pendingLogo}")`;}catch(x){toast('Bu dosya açılamadı. JPG ya da PNG görsel seçin.');e.target.value='';}});
  $('#pList').addEventListener('click',async e=>{
    const ed=e.target.closest('[data-editp]');
    if(ed){const p=DATA.players[ed.dataset.editp];if(!p)return;editPlayer=ed.dataset.editp;pendingPhoto=undefined;$('#pPhoto').value='';
      $('#pName').value=p.name;$('#pNo').value=p.no||'';$('#pPos').value=p.pos||'';$('#pBan').value=p.ban||'';setPhotoPrev(PHOTOS[editPlayer]);
      $('#pFormTitle').textContent='Oyuncuyu düzenle';$('#pAdd').textContent='Güncelle';$('#pCancel').hidden=false;$('#pName').focus();return;}
    const b=e.target.closest('[data-delp]'); if(!b) return;
    if(!b.classList.contains('arm')){b.classList.add('arm');b.textContent='Emin misiniz?';setTimeout(()=>{b.classList.remove('arm');b.textContent='Sil'},4000);return;}
    const id=b.dataset.delp;
    try{if(PHOTOS[id]){await DB.collection('photos').doc(id).delete();delete PHOTOS[id];}
      await DB.collection('players').doc(id).delete();toast('Oyuncu silindi');if(editPlayer===id)resetPlayerForm();}catch(x){toast(errMsg(x));}
  });
  $('#nSave').addEventListener('click',saveNews);
  $('#nCancel').addEventListener('click',resetNewsForm);
  $('#nList').addEventListener('click',async e=>{
    const ed=e.target.closest('[data-editn]');
    if(ed){const n=DATA.news[ed.dataset.editn];if(!n)return;editNews=ed.dataset.editn;$('#nTitle').value=n.title;$('#nBody').value=n.body;$('#nPin').checked=!!n.pinned;
      $('#nFormTitle').textContent='Duyuruyu düzenle';$('#nSave').textContent='Güncelle';$('#nCancel').hidden=false;$('#nTitle').focus();return;}
    const b=e.target.closest('[data-deln]'); if(!b) return;
    if(!b.classList.contains('arm')){b.classList.add('arm');b.textContent='Emin misiniz?';setTimeout(()=>{b.classList.remove('arm');b.textContent='Sil'},4000);return;}
    try{await DB.collection('news').doc(b.dataset.deln).delete();toast('Duyuru silindi');if(editNews===b.dataset.deln)resetNewsForm();}catch(x){toast(errMsg(x));}
  });
  $('#tTeam').addEventListener('change',teamInfoForm);
  $('#tSave').addEventListener('click',saveTeamInfo);
  $('[data-apane="hesaplar"]').addEventListener('click',async e=>{
    const ap=e.target.closest('[data-approve]');
    if(ap){const uid=ap.dataset.approve,r=DATA.requests[uid],t=$(`[data-reqteam="${uid}"]`).value;ap.disabled=true;
      try{await DB.collection('managers').doc(uid).set({team:t,name:r.name,email:r.email,approved:new Date().toISOString()});
        await DB.collection('requests').doc(uid).delete();toast(`${r.name} artık ${t} takımını yönetebilir`);}
      catch(x){toast(errMsg(x));ap.disabled=false;}return;}
    const rj=e.target.closest('[data-reject]');
    if(rj){if(!rj.classList.contains('arm')){rj.classList.add('arm');rj.textContent='Emin misiniz?';setTimeout(()=>{rj.classList.remove('arm');rj.textContent='Reddet'},4000);return;}
      try{await DB.collection('requests').doc(rj.dataset.reject).delete();toast('Başvuru reddedildi');}catch(x){toast(errMsg(x));}return;}
    const um=e.target.closest('[data-unmgr]');
    if(um){if(!um.classList.contains('arm')){um.classList.add('arm');um.textContent='Emin misiniz?';setTimeout(()=>{um.classList.remove('arm');um.textContent='Yetkiyi kaldır'},4000);return;}
      try{await DB.collection('managers').doc(um.dataset.unmgr).delete();toast('Takım yetkisi kaldırıldı');}catch(x){toast(errMsg(x));}}
  });
  panelReady=true;
  if(IS_ADMIN){matchOptions();loadMatch();newsAdminList();}
}
function setRole(role){
  if(window.AML_SIGNING&&!role.admin&&!role.team&&!role.pending) return;
  IS_ADMIN=!!role.admin; MY_TEAM=role.team||null; PENDING=role.pending||null;
  const u=window.AML_AUTH?.user;
  $('#adminBtnLbl').textContent=IS_ADMIN?'Yönetim':MY_TEAM?'Takım paneli':u?'Hesabım':'Giriş';
  $('#adminBtn').classList.toggle('on',PANEL_ON());
  updateAdminBadge();
  if(PANEL_ON()){
    if(!panelReady) initPanel();
    else if(IS_ADMIN){matchOptions();loadMatch();newsAdminList();}
    applyRole();
    if(window.AML_JUST_LOGGED){$('#gateWrap').hidden=true;$('#yonetim').hidden=false;$('#yonetim').scrollIntoView();toast(IS_ADMIN?'Hoş geldiniz':`${MY_TEAM} takım paneline hoş geldiniz`);}
  }else{
    $('#yonetim').hidden=true;
    if(u&&window.AML_JUST_LOGGED) openAdmin();
  }
  window.AML_JUST_LOGGED=false;
}
const teamSelectHtml=(id,sel)=>`<select id="${id}" required><option value="">Mahalle seçin</option>${Object.entries(GROUPS).map(([g,ts])=>`<optgroup label="${g} Grubu">${ts.map(t=>`<option value="${esc(t)}"${t===sel?' selected':''}>${esc(t)}</option>`).join('')}</optgroup>`).join('')}</select>`;
let gateTab='login';
function openAdmin(){
  if(PANEL_ON()){
    const s=$('#yonetim'); s.hidden=!s.hidden; $('#gateWrap').hidden=true;
    if(!s.hidden) s.scrollIntoView();
    return;
  }
  renderGate();
  const w=$('#gateWrap'); w.hidden=false; w.scrollIntoView(); $('#gate input')?.focus();
}
function renderGate(){
  const g=$('#gate'), A=window.AML_AUTH;
  if(!A){g.innerHTML=`<h3>Bağlantı kurulamadı</h3><p>Hesap sistemine şu an ulaşılamıyor. Sayfayı yenileyip tekrar deneyin.</p>`;return;}
  if(A.user&&PENDING){
    g.innerHTML=`<h3>Başvurunuz inceleniyor</h3><p><b>${esc(PENDING.team)}</b> takım hesabı için başvurunuz lig yönetimine ulaştı. Onaylandığında bu sayfayı yenilediğinizde takım paneliniz açılacak.</p>
      <p class="hint" style="margin-top:8px">${esc(A.user.email||'')}</p><div class="row" style="margin-top:12px"><button type="button" class="btn ghost" id="gLogout">Çıkış yap</button></div>`;
    return;
  }
  if(A.user){
    g.innerHTML=`<h3>Takım hesabı başvurusu</h3><p>${esc(A.user.email||'')} hesabıyla giriş yaptınız ama henüz bir takıma bağlı değilsiniz. Hangi mahalleyi temsil ettiğinizi seçip başvurun.</p>
      <form id="applyForm" novalidate>
        <label class="fld"><span>Ad soyad</span><input id="aplName" type="text" maxlength="60" autocomplete="name" required></label>
        <label class="fld"><span>Mahalle</span>${teamSelectHtml('aplTeam')}</label>
        <label class="fld"><span>Telefon (isteğe bağlı)</span><input id="aplPhone" type="tel" maxlength="20" autocomplete="tel"></label>
        <button type="submit" class="btn" style="background:var(--ink);color:var(--bg)">Başvur</button>
      </form><p class="hint" id="gErr" style="margin-top:8px"></p>
      <div class="row" style="margin-top:8px"><button type="button" class="btn ghost sm" id="gLogout">Çıkış yap</button></div>`;
    return;
  }
  const tabs=`<div class="gtabs" role="group"><button type="button" data-gtab="login" aria-pressed="${gateTab==='login'}">Giriş yap</button><button type="button" data-gtab="signup" aria-pressed="${gateTab==='signup'}">Takım hesabı oluştur</button></div>`;
  if(gateTab==='login'){
    g.innerHTML=`<h3>Giriş</h3><p>Lig yönetimi ve onaylı takım temsilcileri buradan giriş yapar.</p>${tabs}
      <form id="loginForm" novalidate>
        <label class="fld"><span>E-posta</span><input id="lEmail" type="email" autocomplete="username" required></label>
        <label class="fld"><span>Şifre</span><input id="lPass" type="password" autocomplete="current-password" required></label>
        <button type="submit" class="btn" style="background:var(--ink);color:var(--bg)">Giriş yap</button>
      </form><p class="hint" id="gErr" style="margin-top:8px"></p>
      <p class="hint" style="margin-top:4px"><button type="button" id="lReset" style="all:unset;cursor:pointer;color:var(--sea);font-weight:600">Şifremi unuttum</button></p>`;
  }else{
    g.innerHTML=`<h3>Takım hesabı oluştur</h3><p>Mahallenizin kadrosunu, forma numaralarını, mevkilerini ve fotoğraflarını siz girin. Hesabınız lig yönetimi onayladıktan sonra açılır.</p>${tabs}
      <form id="signupForm" novalidate>
        <label class="fld"><span>Ad soyad</span><input id="sName" type="text" maxlength="60" autocomplete="name" required></label>
        <label class="fld"><span>Temsil ettiğiniz mahalle</span>${teamSelectHtml('sTeam',$('#teamSel').value)}</label>
        <label class="fld"><span>E-posta</span><input id="sEmail" type="email" autocomplete="email" required></label>
        <label class="fld"><span>Şifre (en az 6 karakter)</span><input id="sPass" type="password" autocomplete="new-password" minlength="6" required></label>
        <label class="fld"><span>Telefon (isteğe bağlı)</span><input id="sPhone" type="tel" maxlength="20" autocomplete="tel"></label>
        <label class="fld" style="flex-basis:100%"><span>Not (isteğe bağlı)</span><input id="sNote" type="text" maxlength="300" placeholder="Örn. Takım kaptanıyım"></label>
        <button type="submit" class="btn" style="background:var(--ink);color:var(--bg)">Hesap oluştur ve başvur</button>
      </form><p class="hint" id="gErr" style="margin-top:8px"></p>`;
  }
}
const AUTH_ERR={'auth/email-already-in-use':'Bu e-posta ile zaten bir hesap var. Giriş yap sekmesini kullanın.','auth/invalid-email':'E-posta adresi geçersiz.',
  'auth/weak-password':'Şifre en az 6 karakter olmalı.','auth/too-many-requests':'Çok fazla deneme yapıldı. Birkaç dakika sonra tekrar deneyin.',
  'auth/network-request-failed':'Bağlantı kurulamadı. İnternetinizi kontrol edin.','auth/operation-not-allowed':'Yeni hesap açma şu an kapalı. Lig yönetimiyle iletişime geçin.'};
async function submitRequest(uid,email,name,team,phone,note){
  const req={team,name,email,phone:phone||'',note:note||'',created:new Date().toISOString()};
  await DB.collection('requests').doc(uid).set(req);
  return req;
}
document.addEventListener('submit',async e=>{
  const id=e.target.id; if(!['loginForm','signupForm','applyForm'].includes(id)) return;
  e.preventDefault();
  const err=$('#gErr'), btn=e.target.querySelector('button[type=submit]');
  const A=window.AML_AUTH;
  if(id==='loginForm'){
    const em=$('#lEmail').value.trim(), pw=$('#lPass').value;
    if(!em||!pw){err.textContent='E-posta ve şifreyi girin.';return;}
    btn.disabled=true;err.textContent='Giriş yapılıyor…';
    try{window.AML_JUST_LOGGED=true;await A.login(em,pw);err.textContent='';}
    catch(x){window.AML_JUST_LOGGED=false;err.textContent=AUTH_ERR[x.code]||'E-posta ya da şifre hatalı.';}
    finally{btn.disabled=false;}
    return;
  }
  if(id==='signupForm'){
    const name=$('#sName').value.trim(), team=$('#sTeam').value, em=$('#sEmail').value.trim(), pw=$('#sPass').value;
    if(!name||!team||!em||!pw){err.textContent='Ad, mahalle, e-posta ve şifreyi doldurun.';return;}
    if(pw.length<6){err.textContent='Şifre en az 6 karakter olmalı.';return;}
    btn.disabled=true;err.textContent='Hesap oluşturuluyor…';window.AML_SIGNING=true;
    try{
      const cred=await A.signup(em,pw);
      const req=await submitRequest(cred.user.uid,em,name,team,$('#sPhone').value.trim(),$('#sNote').value.trim());
      window.AML_SIGNING=false;setRole({pending:req});renderGate();
    }catch(x){window.AML_SIGNING=false;err.textContent=AUTH_ERR[x.code]||'Hesap oluşturulamadı. Bilgileri kontrol edip tekrar deneyin.';}
    finally{btn.disabled=false;}
    return;
  }
  if(id==='applyForm'){
    const name=$('#aplName').value.trim(), team=$('#aplTeam').value;
    if(!name||!team){err.textContent='Adınızı ve mahallenizi seçin.';return;}
    btn.disabled=true;
    try{const req=await submitRequest(A.user.uid,A.user.email||'',name,team,$('#aplPhone').value.trim(),'');setRole({pending:req});renderGate();}
    catch(x){err.textContent=errMsg(x);}finally{btn.disabled=false;}
  }
});

/* ---------- Olaylar ---------- */
function goTeam(t,scroll){$('#teamSel').value=t;team();history.replaceState(null,'','#takim/'+slug(t));if(scroll)$('#takimlar').scrollIntoView();}
document.addEventListener('click',async e=>{
  if(e.target.id==='gLogout'||e.target.id==='adminLogout'){window.AML_AUTH?.logout();gateTab='login';$('#gateWrap').hidden=true;$('#yonetim').hidden=true;toast('Çıkış yapıldı');return;}
  if(e.target.id==='lReset'){const em=$('#lEmail').value.trim();if(!em){$('#gErr').textContent='Önce e-posta adresinizi yazın.';return;}
    try{await window.AML_AUTH.reset(em);$('#gErr').textContent='Şifre sıfırlama bağlantısı e-postanıza gönderildi.';}catch(x){$('#gErr').textContent='Bağlantı gönderilemedi. Adresi kontrol edin.';}return;}
  const gt=e.target.closest('[data-gtab]');
  if(gt){gateTab=gt.dataset.gtab;renderGate();$('#gate input')?.focus();return;}
  const pl=e.target.closest('[data-player]');
  if(pl&&!e.target.closest('#yonetim')){openPlayer(pl.dataset.player);return;}
  const ps=e.target.closest('[data-pshare]');
  if(ps){const p=DATA.players[ps.dataset.pshare];if(p)share(`${p.name} · ${p.team} · Alanya Mahalle Ligi`,'#oyuncu/'+ps.dataset.pshare);return;}
  const tb=e.target.closest('[data-tur]');
  if(tb){state.tur=+tb.dataset.tur;fixtureControls();fixture();return;}
  const gb=e.target.closest('[data-gf]');
  if(gb){state.g=gb.dataset.gf;fixtureControls();fixture();return;}
  const tm=e.target.closest('[data-team]');
  if(tm){closeMatch();goTeam(tm.dataset.team,!tm.dataset.noscroll);return;}
  const ics=e.target.closest('[data-ics]');
  if(ics){const m=matchInfo(ics.dataset.ics);downloadIcs([m],`${slug(m.h||'mac')}-${slug(m.a||'')}`);return;}
  const sh=e.target.closest('[data-share]');
  if(sh){const m=matchInfo(sh.dataset.share);share(`${m.h||m.ko?.h} - ${m.a||m.ko?.a} · Alanya Mahalle Ligi`,'#mac/'+m.id);return;}
  const nw=e.target.closest('[data-news]');
  if(nw){document.getElementById('duyuru-'+nw.dataset.news)?.scrollIntoView();return;}
  const mt=e.target.closest('[data-match]');
  if(mt&&!e.target.closest('#yonetim')){openMatch(mt.dataset.match);return;}
});
document.addEventListener('keydown',e=>{
  if((e.key==='Enter'||e.key===' ')&&e.target.matches('[data-match][role=button],[data-news][role=button]')){e.preventDefault();e.target.click();}
});
$('#q').addEventListener('input',e=>{state.q=low(e.target.value.trim());fixture();});
$('#teamSel').addEventListener('change',()=>goTeam($('#teamSel').value,false));
$('#teamIcs').addEventListener('click',()=>{const t=$('#teamSel').value;downloadIcs(teamMatches(t),`${slug(t)}-fikstur`);});
$('#teamShare').addEventListener('click',()=>{const t=$('#teamSel').value;share(`${t} · Alanya Mahalle Ligi`,'#takim/'+slug(t));});
$('#adminBtn').addEventListener('click',openAdmin);
$('#adminClose').addEventListener('click',()=>{$('#yonetim').hidden=true;});

function route(){
  const h=decodeURIComponent(location.hash.slice(1));
  if(h.startsWith('mac/')){const id=h.slice(4);if(matchInfo(id))openMatch(id,false);}
  else if(h.startsWith('oyuncu/')){const id=h.slice(7);if(DATA.players[id])openPlayer(id,false);else ROUTE_PLAYER=id;}
  else if(h.startsWith('takim/')){const t=TEAM_BY_SLUG[h.slice(6)];if(t){$('#teamSel').value=t;team();setTimeout(()=>$('#takimlar').scrollIntoView(),50);}}
}
window.addEventListener('hashchange',route);

fixtureControls();teamSelect();renderAll();route();loadWeather();

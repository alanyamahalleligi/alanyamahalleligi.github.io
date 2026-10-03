/* ===================== Maç durumu ===================== */
const status=id=>{const r=DATA.matches[id];if(!r)return '';return r.status||(r.played?'done':'')};
const res=id=>status(id)==='done'?DATA.matches[id]:null;
const sc=id=>{const r=res(id);return r?[r.hs,r.as]:null};
const shown=id=>{const s=status(id),r=DATA.matches[id];return (s==='done'||s==='live')&&r.hs!=null?[r.hs,r.as]:null};
const pName=id=>DATA.players[id]?.name||'Silinmiş oyuncu';

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
function everyMatch(){
  const ko=KO_ALL.map(k=>{const tm=koTeams(k);return {id:k.id,d:k.d,t:k.t,h:tm.h,a:tm.a,ko:k}});
  return [...ALL,...ko];
}
function matchInfo(id){
  if(MATCH_BY_ID[id]) return MATCH_BY_ID[id];
  const k=KO_BY_ID[id]; if(!k) return null; const tm=koTeams(k);
  return {id,d:k.d,t:k.t,h:tm.h,a:tm.a,ko:k};
}
const mLabel=m=>m.ko?`${koStage(m.ko)} · ${m.ko.c}`:`${m.g} Grubu · ${m.tur}. Tur`;
const hName=m=>m.h||m.ko?.h||'';
const aName=m=>m.a||m.ko?.a||'';
const byTime=(x,y)=>(x.d+(x.t||'19:30')).localeCompare(y.d+(y.t||'19:30'));

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
  everyMatch().filter(m=>(m.h===t||m.a===t)).sort(byTime).forEach(m=>{
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
const formHtml=f=>f.length?`<span class="form">${f.slice(-5).map(x=>`<i class="${x.r}" title="${{w:'Galibiyet',d:'Beraberlik',l:'Mağlubiyet'}[x.r]}">${{w:'G',d:'B',l:'M'}[x.r]}</i>`).join('')}</span>`:'<span class="muted">–</span>';
function standings(g){
  const rows=GROUPS[g].map((t,i)=>({t,i,O:0,G:0,B:0,M:0,A:0,Y:0,form:[]}));
  const by=Object.fromEntries(rows.map(r=>[r.t,r]));
  ALL.filter(m=>m.g===g).sort(byTime).forEach(m=>{
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
function squadOf(t){
  return Object.entries(DATA.players).filter(([,p])=>p.team===t)
    .sort((a,b)=>(a[1].no||999)-(b[1].no||999)||a[1].name.localeCompare(b[1].name,'tr'));
}
const teamMatches=t=>everyMatch().filter(m=>m.h===t||m.a===t).sort(byTime);
const nextMatchOf=t=>teamMatches(t).find(m=>status(m.id)!=='done');

/* ===================== Disiplin ===================== */
// Ayarlar: settings/discipline {yellowLimit: n (0 = kapalı), redBan: maç sayısı}
function disciplineRules(){const s=DATA.settings.discipline||{};return {y:+s.yellowLimit||0,r:+s.redBan||0}}
function suspensions(){
  const R=disciplineRules(), out=[];
  for(const[pid,p] of Object.entries(DATA.players)){
    if(p.ban) out.push({pid,why:p.ban,manual:true});
    if(!R.y&&!R.r) continue;
    const ms=teamMatches(p.team);
    let yel=0;
    ms.forEach((m,i)=>{
      if(status(m.id)!=='done') return;
      const ev=(DATA.matches[m.id].ev||[]).filter(e=>e.p===pid);
      const side=m.h===p.team?'h':'a';
      let n=0;
      ev.forEach(e=>{if(e.s!==side)return;
        if(e.t==='Y'&&R.y){yel++;if(yel%R.y===0)n=Math.max(n,1);}
        if(e.t==='R'&&R.r)n=Math.max(n,R.r);});
      if(!n) return;
      const after=ms.slice(i+1,i+1+n);
      const reason=ev.some(e=>e.t==='R')?'Kırmızı kart':`${yel}. sarı kart`;
      after.forEach(a=>out.push({pid,why:`${reason} (${fmt(m.d).dm})`,match:a.id,served:status(a.id)==='done'}));
    });
  }
  return out;
}
const activeBans=()=>suspensions().filter(s=>s.manual||!s.served);

/* ===================== Fotoğraflar ===================== */
function avatar(pid,name,cls=''){const src=cls==='xl'?(PHOTO_FULL[pid]||PHOTOS[pid]):PHOTOS[pid];return src?`<img class="av ${cls}" src="${src}" alt="" loading="lazy">`:`<span class="av ${cls}" aria-hidden="true">${esc(initials(name))}</span>`}
function teamBadge(t,cls=''){const lg=LOGOS[slug(t)],g=TEAM_G[t]||'';return lg?`<img class="tbadge ${cls}" src="${lg}" alt="">`:`<span class="tbadge gp ${cls}" data-g="${g}">${esc(initials(t))}</span>`}
async function loadMedia(t){
  if(!DB||!t||MEDIA[t]) return; MEDIA[t]='loading';
  try{
    const d=await DB.get('tphotos',t);   // takımın bütün küçük fotoğrafları tek belgede
    if(d&&d.p) Object.assign(PHOTOS,d.p);
    MEDIA[t]='done'; scheduleRender();
    if(typeof panelReady!=='undefined'&&panelReady){playerList();if($('#tTeam').value===t&&LOGOS[slug(t)]&&!pendingLogo)$('#tLogoPrev').style.backgroundImage=`url("${LOGOS[slug(t)]}")`;}
  }catch(e){MEDIA[t]=null;}
}
function loadAllLogos(){}   // logolar artık agg/logos belgesiyle açılışta gelir
async function loadFullPhoto(pid){
  if(!DB||pid in PHOTO_FULL) return; PHOTO_FULL[pid]=null;
  try{const d=await DB.get('photos',pid);if(d&&d.data){PHOTO_FULL[pid]=d.data;scheduleRender();}}catch(e){delete PHOTO_FULL[pid];}
}

/* ===================== Alanya: hava ve deniz ===================== */
const WCODE=c=>c===0?'açık':c<=2?'az bulutlu':c===3?'kapalı':c<=48?'sisli':c<=57?'çiseleyen yağmur':c<=67?'yağmurlu':c<=77?'karlı':c<=82?'sağanak':'gök gürültülü';
function wx(d,t){const h=t?t.slice(0,2):'20';return WEATHER[`${d}T${h}:00`]||null}
const wxText=w=>`${Math.round(w.t)}° · ${WCODE(w.c)}${w.p!=null?` · yağış %${w.p}`:''} · rüzgâr ${Math.round(w.w)} km/s`;
async function loadWeather(){
  try{
    const r=await fetch('https://api.open-meteo.com/v1/forecast?latitude=36.5444&longitude=31.9954&hourly=temperature_2m,precipitation_probability,weather_code,wind_speed_10m&timezone=Europe%2FIstanbul&forecast_days=16');
    const H=(await r.json()).hourly;
    H.time.forEach((k,i)=>{WEATHER[k]={t:H.temperature_2m[i],p:H.precipitation_probability[i],c:H.weather_code[i],w:H.wind_speed_10m[i]}});
    scheduleRender();
  }catch(e){}
  try{
    const r=await fetch('https://marine-api.open-meteo.com/v1/marine?latitude=36.53&longitude=31.99&current=sea_surface_temperature&timezone=Europe%2FIstanbul');
    const v=(await r.json()).current?.sea_surface_temperature;
    if(typeof v==='number'){SEA=v;scheduleRender();}
  }catch(e){}
}

/* ===================== Takvim, paylaşım, bildirim ===================== */
function icsDate(d,t){return t?`;TZID=Europe/Istanbul:${d.replace(/-/g,'')}T${t.replace(':','')}00`:`;VALUE=DATE:${d.replace(/-/g,'')}`}
function icsEnd(d,t){
  if(!t){const x=pd(d);x.setDate(x.getDate()+1);return `;VALUE=DATE:${x.getFullYear()}${pad(x.getMonth()+1)}${pad(x.getDate())}`}
  const[hh,mm]=t.split(':').map(Number);const x=new Date(2000,0,1,hh,mm+70);let dd=d;
  if(x.getDate()!==1){const y=pd(d);y.setDate(y.getDate()+1);dd=`${y.getFullYear()}-${pad(y.getMonth()+1)}-${pad(y.getDate())}`}
  return `;TZID=Europe/Istanbul:${dd.replace(/-/g,'')}T${pad(x.getHours())}${pad(x.getMinutes())}00`;
}
function downloadIcs(ms,name){
  const ev=ms.map(m=>{const r=DATA.matches[m.id]||{};
    return ['BEGIN:VEVENT',`UID:${m.id}@alanyamahalleligi.web.app`,`DTSTAMP:${new Date().toISOString().replace(/[-:]/g,'').slice(0,15)}Z`,
      `DTSTART${icsDate(m.d,m.t)}`,`DTEND${icsEnd(m.d,m.t)}`,`SUMMARY:${hName(m)} - ${aName(m)} (Alanya Mahalle Ligi)`,
      r.venue?`LOCATION:${r.venue.replace(/[,;]/g,' ')}`:'',`DESCRIPTION:${mLabel(m)} - TV82 YouTube kanalında canlı`,
      `URL:${location.origin}/mac/${m.id}`,'END:VEVENT'].filter(Boolean).join('\r\n')});
  const txt=['BEGIN:VCALENDAR','VERSION:2.0','PRODID:-//Alanya Mahalle Ligi//TR','CALSCALE:GREGORIAN',
    'BEGIN:VTIMEZONE','TZID:Europe/Istanbul','BEGIN:STANDARD','DTSTART:19700101T000000','TZOFFSETFROM:+0300','TZOFFSETTO:+0300','TZNAME:+03','END:STANDARD','END:VTIMEZONE',
    ...ev,'END:VCALENDAR'].join('\r\n');
  const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([txt],{type:'text/calendar'}));a.download=name+'.ics';
  document.body.appendChild(a);a.click();setTimeout(()=>{URL.revokeObjectURL(a.href);a.remove()},1000);
  toast('Takvim dosyası indirildi');
}
async function share(title,path){
  const url=`${location.origin}${path}`;
  try{if(navigator.share){await navigator.share({title,url});return;}}catch(e){if(e&&e.name==='AbortError')return;}
  try{await navigator.clipboard.writeText(url);toast('Bağlantı kopyalandı');}catch(e){toast(url);}
}
function toast(msg){
  let t=$('#toast'); if(!t){t=document.createElement('div');t.id='toast';t.className='toast';t.setAttribute('role','status');document.body.appendChild(t);}
  t.textContent=msg;t.hidden=false;clearTimeout(toast._t);toast._t=setTimeout(()=>{t.hidden=true},3200);
}

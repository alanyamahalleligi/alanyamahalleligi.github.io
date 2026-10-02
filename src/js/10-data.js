/* ===================== Lig verisi ===================== */
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
const koStage=k=>KO_STAGE[Object.keys(KO).find(s=>KO[s].includes(k))];
// Haftalık seçimler için dönemler: 1–5 grup turları, 6+ eleme turları
const PERIODS=[[1,'1. Tur'],[2,'2. Tur'],[3,'3. Tur'],[4,'4. Tur'],[5,'5. Tur'],[6,'Son 16'],[7,'Çeyrek Final'],[8,'Yarı Final'],[9,'Final']];

/* ===================== Yardımcılar ===================== */
const MONTHS=['Ocak','Şubat','Mart','Nisan','Mayıs','Haziran','Temmuz','Ağustos','Eylül','Ekim','Kasım','Aralık'];
const WD=['Pazar','Pazartesi','Salı','Çarşamba','Perşembe','Cuma','Cumartesi'];
const ORD={1:'birincisi',2:'ikincisi'};
const $=s=>document.querySelector(s);
const $$=s=>[...document.querySelectorAll(s)];
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const low=s=>String(s).toLocaleLowerCase('tr');
const slug=s=>low(s).replace(/[çğıöşü]/g,c=>({ç:'c',ğ:'g',ı:'i',ö:'o',ş:'s',ü:'u'}[c])).replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'');
const pd=s=>{const[y,m,d]=s.split('-').map(Number);return new Date(y,m-1,d)};
const fmt=s=>{const d=pd(s);return {dm:`${d.getDate()} ${MONTHS[d.getMonth()]}`,wd:WD[d.getDay()]}};
const pad=n=>String(n).padStart(2,'0');
const now=new Date();
const todayKey=`${now.getFullYear()}-${pad(now.getMonth()+1)}-${pad(now.getDate())}`;
const dayDiff=s=>Math.round((pd(s)-pd(todayKey))/864e5);
const fmtDate=iso=>{const d=new Date(iso);return isNaN(d)?'':`${d.getDate()} ${MONTHS[d.getMonth()]} ${d.getFullYear()}`};
const kickoff=m=>{const[y,mo,d]=m.d.split('-').map(Number);const[h,mi]=(m.t||'19:30').split(':').map(Number);return new Date(y,mo-1,d,h,mi)};
const initials=n=>String(n||'?').trim().split(/\s+/).map(w=>w[0]).slice(0,2).join('').toLocaleUpperCase('tr');

const TEAM_G={}, TEAM_POS={}, TEAM_BY_SLUG={};
for(const[g,ts] of Object.entries(GROUPS)) ts.forEach((t,i)=>{TEAM_G[t]=g;TEAM_POS[t]=i+1;TEAM_BY_SLUG[slug(t)]=t});
const ALL=[];
ROUNDS.forEach(r=>r.days.forEach(([d,ms,tbd])=>ms.forEach(([h,a],i)=>ALL.push({id:`g-${d}-${i}`,tur:r.n,d,t:tbd?null:T[i],h,a,g:TEAM_G[h]}))));
const MATCH_BY_ID=Object.fromEntries(ALL.map(m=>[m.id,m]));
const KO_BY_ID=Object.fromEntries(KO_ALL.map(k=>[k.id,k]));

/* ===================== Durum ===================== */
const DATA={players:{},matches:{},news:{},teams:{},sponsors:{},weekly:{},settings:{},requests:{},managers:{}};
let DB=null, IS_ADMIN=false, MY_TEAM=null, PENDING=null;
const PHOTOS={}, LOGOS={}, MEDIA={};
let WEATHER={}, SEA=null;

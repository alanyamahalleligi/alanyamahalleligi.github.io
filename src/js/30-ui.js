/* ===================== Ortak arayüz parçaları ===================== */
const IC={G:'<i class="ic g" title="Gol"></i>',OG:'<i class="ic og" title="Kendi kalesine"></i>',Y:'<i class="ic y" title="Sarı kart"></i>',R:'<i class="ic r" title="Kırmızı kart"></i>'};
const EV_LBL={G:'Gol',OG:'Kendi kalesine',Y:'Sarı kart',R:'Kırmızı kart'};
const evTeam=e=>e.t==='OG'?(e.s==='h'?'a':'h'):e.s;
const plink=(pid,name)=>`<a class="plink" href="/oyuncu/${pid}">${esc(name??pName(pid))}</a>`;
const tlink=t=>`<a class="plink" href="/takim/${slug(t)}">${esc(t)}</a>`;

function pageHead(eyebrow,title,desc='',actions=''){
  return `<div class="sec-head page-head"><div><div class="eyebrow">${eyebrow}</div><h1 class="ptitle">${title}</h1>${desc?`<p>${desc}</p>`:''}</div>${actions?`<div class="row no-print">${actions}</div>`:''}</div>`;
}
const printBtn=()=>`<button type="button" class="btn sm line" data-print>Yazdır / PDF</button>`;
function crumbs(items){return `<nav class="crumbs no-print" aria-label="Konum">${items.map(([href,l],i)=>i<items.length-1?`<a href="${href}">${esc(l)}</a>`:`<span>${esc(l)}</span>`).join('<i>/</i>')}</nav>`}

function evLine(id){
  const r=DATA.matches[id], s=status(id);
  if(!r||(s!=='done'&&s!=='live')||!Array.isArray(r.ev)||!r.ev.length) return '';
  const sorted=[...r.ev].filter(e=>e.t!=='Y').sort((x,y)=>(x.m||999)-(y.m||999));
  if(!sorted.length) return '';
  const side=sd=>sorted.filter(e=>evTeam(e)===sd)
    .map(e=>`<span>${IC[e.t]||''}${esc(pName(e.p))}${e.t==='OG'?' (k.k.)':''}${e.m?` ${e.m}'`:''}</span>`).join('');
  return `<div class="ev"><div>${side('h')}</div><div>${side('a')}</div></div>`;
}
function scoreCell(id){
  const st=status(id), s=shown(id);
  if(st==='live') return `<span class="s live">${s?s.join('–'):'0–0'}</span>`;
  if(st==='post') return `<span class="s post">ERT.</span>`;
  return `<span class="s">${s?s.join('–'):'–'}</span>`;
}
const liveBadge=id=>{const r=DATA.matches[id]||{};return `<span class="badge live">${r.minute?r.minute+"'":'Canlı'}</span>`};
function matchRow(m,hl=esc){
  return `<a class="m" href="/mac/${m.id}"><span class="t">${status(m.id)==='live'?liveBadge(m.id):(m.t||'—')}</span><span class="h">${hl(hName(m)||m.ko?.h||'')}</span>${scoreCell(m.id)}<span class="a">${hl(aName(m)||m.ko?.a||'')}</span>${m.g?`<span class="gp" data-g="${m.g}">${m.g}</span>`:'<span></span>'}</a>${evLine(m.id)}`;
}
function dayCard(d,rows,tbd,title,hl){
  const f=fmt(d),diff=dayDiff(d);
  const tag=diff===0?'Bugün':diff===1?'Yarın':'';
  return `<article class="daycard ${diff<0?'past':''} ${diff===0?'today':''}">
    <header><b>${f.dm}</b><span>${title||f.wd}</span>${tag?`<em>${tag}</em>`:''}</header>
    ${tbd?'<div class="tbd">Saatler kura ile belirlenecek</div>':''}
    ${rows.map(m=>matchRow(m,hl)).join('')}
  </article>`;
}
function leaderCard(title,ic,rows,unit,valFn,subFn,more){
  const body=rows.length?`<ol>${rows.map((r,i)=>`<li><span class="rk">${i+1}</span>${r.av||''}<span class="nm">${r.name}<small>${subFn(r)}</small></span><span class="c">${valFn(r)}</span></li>`).join('')}</ol>`
    :`<div class="none">Henüz ${unit} kaydı yok. Maç sonuçları girildikçe liste dolacak.</div>`;
  return `<article class="lcard"><header>${ic}<h3>${title}</h3>${more?`<a class="more no-print" href="${more}">Tümü</a>`:''}</header>${body}</article>`;
}
const pSub=pid=>{const p=DATA.players[pid]||{};const g=TEAM_G[p.team];return `${g?`<i class="gp" data-g="${g}">${g}</i>`:''}${esc(p.team||'')}`};
function topPlayers(k,n){
  const st=computeStats();
  return Object.entries(st).filter(([,v])=>v[k]>0).sort((a,b)=>b[1][k]-a[1][k]||pName(a[0]).localeCompare(pName(b[0]),'tr')).slice(0,n)
    .map(([pid,v])=>({name:plink(pid),av:avatar(pid,pName(pid)),pid,v:v[k]}));
}
function standingsTable(g,full){
  const st=standings(g);
  return `<table class="st ${full?'full':''}"><thead><tr><th>#</th><th>Takım</th><th title="Oynanan">O</th><th title="Galibiyet">G</th><th title="Beraberlik">B</th><th title="Mağlubiyet">M</th>${full?'<th title="Atılan">A</th><th title="Yenen">Y</th>':''}<th title="Averaj">Av</th><th title="Puan">P</th>${full?'<th>Form</th>':''}</tr></thead>
    <tbody>${st.map((r,i)=>`<tr class="${i<2?'q':''}"><td>${i+1}</td><td class="tm">${full?teamBadge(r.t,'sm'):''}${tlink(r.t)}</td><td>${r.O}</td><td>${r.G}</td><td>${r.B}</td><td>${r.M}</td>${full?`<td>${r.A}</td><td>${r.Y}</td>`:''}<td>${r.Av>0?'+':''}${r.Av}</td><td class="p">${r.P}</td>${full?`<td>${formHtml(r.form)}</td>`:''}</tr>`).join('')}</tbody></table>`;
}
function groupCard(g){
  return `<article class="gcard" data-g="${g}">
    <header><span class="letter">${g}</span><h3>Grubu</h3><small>${groupDone(g)?'Tamamlandı':GROUPS[g].length+' takım'}</small><a class="more no-print" href="/grup/${g.toLowerCase()}">Grup sayfası</a></header>
    ${standingsTable(g,false)}</article>`;
}
function slot(ref,lose,name,goals,won){
  const g=goals!=null?`<span style="margin-left:auto;font-family:var(--f-display);font-weight:900;${won?'color:var(--accent)':''}">${goals}</span>`:'';
  if(name) return `<div class="slot">${teamBadge(name,'xs')}${esc(name)}${g}</div>`;
  if(/^[A-H][12]$/.test(ref)) return `<div class="slot"><span class="gp" data-g="${ref[0]}">${ref[0]}</span>${ref[0]} Grubu ${ORD[ref[1]]}${g}</div>`;
  return `<div class="slot"><span class="ref">${ref}</span>${lose?'mağlubu':'galibi'}${g}</div>`;
}
function bracketHtml(){
  const col=(title,sub,arr)=>`<div class="col"><h3>${title}</h3><div class="cd">${sub}</div><div class="stack">${arr.map(k=>{const f=fmt(k.d),r=DATA.matches[k.id]||{},s=shown(k.id),tm=koTeams(k);
    const hw=s&&status(k.id)==='done'&&(s[0]>s[1]||(s[0]===s[1]&&r.pen==='h')),aw=s&&status(k.id)==='done'&&(s[1]>s[0]||(s[0]===s[1]&&r.pen==='a'));
    return `<a class="ko ${k.big?'final':''}" href="/mac/${k.id}"><div class="meta"><b>${k.c}</b><span>${status(k.id)==='live'?liveBadge(k.id):`${f.dm} · ${k.t}`}${s&&s[0]===s[1]&&r.pen?' · pen.':''}</span></div>${slot(k.h,k.lose,tm.h,s?s[0]:null,hw)}${slot(k.a,k.lose,tm.a,s?s[1]:null,aw)}</a>`}).join('')}</div></div>`;
  return `<div class="bracket-scroll"><div class="bracket">${col('Son 16','16–19 Kasım',KO.r16)+col('Çeyrek Final','23–24 Kasım',KO.qf)+col('Yarı Final','27 Kasım Cuma',KO.sf)+col('Final Gecesi','1 Aralık Salı',KO.f)}</div></div>`;
}
function timelineRow(m,tur,sub){
  const f=fmt(m.d),s=shown(m.id),st=status(m.id);
  return `<li><a class="tlrow" href="/mac/${m.id}"><span class="tur">${tur}<small>${sub}</small></span>
    <span class="vs">${esc(hName(m)||m.ko?.h)} <span>–</span> ${esc(aName(m)||m.ko?.a)}${s?`<span class="sc">${s.join('–')}</span>`:''}${st==='live'?' <span class="badge live">Canlı</span>':st==='post'?' <span class="badge post">Ertelendi</span>':''}</span>
    <span class="when"><b>${f.dm}</b>${f.wd} · ${m.t||'saat kura ile'}</span></a></li>`;
}
function sponsorStrip(){
  const list=Object.entries(DATA.sponsors).sort((a,b)=>(a[1].tier||9)-(b[1].tier||9)||String(a[1].name).localeCompare(b[1].name,'tr'));
  if(!list.length) return '';
  return `<div class="sponsors">${list.map(([id,s])=>{const inner=s.logo?`<img src="${s.logo}" alt="${esc(s.name)}">`:`<b>${esc(s.name)}</b>`;
    return /^https:\/\//.test(s.url||'')?`<a href="${esc(s.url)}" target="_blank" rel="noopener" title="${esc(s.name)}">${inner}</a>`:`<span title="${esc(s.name)}">${inner}</span>`}).join('')}</div>`;
}
const FOLLOW_KEY='aml-follow';
function followed(){try{return JSON.parse(localStorage.getItem(FOLLOW_KEY)||'[]')}catch(e){return []}}
const isFollowed=t=>followed().includes(t);

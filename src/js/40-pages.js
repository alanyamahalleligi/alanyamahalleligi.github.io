/* ===================== Sayfalar ===================== */
const PAGES={};

/* ---------- Ana sayfa ---------- */
function boardHtml(){
  const days=[...new Set(ALL.map(m=>m.d))];
  let next=days.find(d=>d>=todayKey), list, ko=false;
  if(next) list=ALL.filter(m=>m.d===next);
  else{
    next=KO_ALL.map(k=>k.d).find(d=>d>=todayKey);
    if(next){ko=true;list=KO_ALL.filter(k=>k.d===next).sort((x,y)=>x.t.localeCompare(y.t)).map(k=>matchInfo(k.id));}
  }
  if(!next){
    const f=koResult(KO_BY_ID['KO-F']);
    return `<div class="board-head"><span class="lbl">Sezon tamamlandı</span></div><div class="count"><b>ŞAMPİYON</b></div><p style="font-family:var(--f-display);font-weight:900;font-size:2.4rem;margin:0;color:var(--led)">${esc(f?f.w:'—')}</p>`;}
  const n=dayDiff(next), f=fmt(next), isOpen=next===ALL[0].d;
  const cnt=n===0?`<b>BUGÜN</b><span>maç günü</span>`:`<b class="num">${n}</b><span>gün ${isOpen?'kaldı · açılış':'sonra'}</span>`;
  const ft=list.find(m=>m.t)?.t||(ko?'20:00':'19:30'), w=wx(next,ft);
  const rows=list.map(m=>{
    const s=shown(m.id), st=status(m.id);
    const mid=s?s.join('–'):st==='post'?'ert.':ko?esc(m.ko.c):'vs';
    return `<li><a href="/mac/${m.id}"><span class="t num">${st==='live'?liveBadge(m.id):(m.t||'—')}</span><span class="h">${esc(hName(m))}</span><span class="v">${mid}</span><span class="a">${esc(aName(m))}</span>${m.g?`<span class="gp" data-g="${m.g}">${m.g}</span>`:'<span></span>'}</a></li>`;}).join('');
  return `<div class="board-head"><span class="lbl">Sıradaki maç günü</span><span class="day">${f.dm} ${f.wd}</span></div>
    <div class="count">${cnt}</div>${w?`<p class="wx">Alanya, ${list.some(m=>!m.t)?'maç akşamı':ft}: <b>${wxText(w)}</b></p>`:''}<ul>${rows}</ul>
    ${list.some(m=>!m.t)?'<p class="note">Açılış gecesinin maç saatleri kura ile belirlenecek.</p>':''}`;
}
function liveBarHtml(){
  const live=everyMatch().filter(m=>status(m.id)==='live');
  if(!live.length) return '';
  return `<div class="liveBar"><span class="badge live" style="background:#fff;color:#d7261e">Canlı</span>${live.map(m=>{const r=DATA.matches[m.id];
    return `<a href="/mac/${m.id}">${esc(m.h)} ${r.hs??0}–${r.as??0} ${esc(m.a)}${r.minute?` · ${r.minute}'`:''}</a>`}).join('')}</div>`;
}
const SKYLINE=`<svg class="skyline" viewBox="0 0 1200 110" preserveAspectRatio="none" aria-hidden="true">
  <path class="hill" d="M0 110V88C70 86 130 74 200 66C240 52 268 34 300 30C330 18 360 14 392 20C420 12 446 16 470 30L520 40C580 58 640 70 700 78C740 82 770 84 800 86C900 88 1050 86 1200 88V110Z"/>
  <path class="wall" d="M296 30h6v-6h6v6h8v-6h6v6h8v-8h6v8h10v-6h6v6h12v-8h6v8h12v-6h6v6h14v-6h6v6"/>
  <g class="kule"><path d="M738 82V56l6-6h20l6 6v26z"/><path d="M738 56v-6h4v3h4v-3h4v3h4v-3h4v3h4v-3h4v3h4v-3h4v6"/></g>
  <path class="wave" d="M0 98C40 94 80 102 120 98S200 94 240 98S320 102 360 98S440 94 480 98S560 102 600 98S680 94 720 98S800 102 840 98S920 94 960 98S1040 102 1080 98S1160 94 1200 98V110H0Z"/></svg>`;
PAGES.home=()=>{
  let n=0,g=0; everyMatch().forEach(m=>{const s=sc(m.id);if(s){n++;g+=s[0]+s[1];}});
  const done=everyMatch().filter(m=>sc(m.id)).sort(byTime).reverse().slice(0,6);
  const news=newsSorted().slice(0,4);
  const leadersMini=Object.keys(GROUPS).map(gg=>{const st=standings(gg);return `<a class="gl" href="/grup/${gg.toLowerCase()}" data-g="${gg}"><b>${gg}</b><span>${esc(st[0].t)} <small>${st[0].P}P</small></span><span>${esc(st[1].t)} <small>${st[1].P}P</small></span></a>`}).join('');
  const scorers=topPlayers('G',5);
  const fol=followed();
  return `<section class="hero"><div class="wrap">${liveBarHtml()}</div>
    <div class="wrap hero-grid"><div>
      <div class="eyebrow">T.C. Alanya Belediyesi sunar</div>
      <h1><span class="n">1.</span> Alanya<span class="l2">Mahalle Ligi</span></h1>
      <div class="season">Dr. Ali Nazım Köseoğlu Sezonu</div>
      <p class="lede">44 mahalle sahaya çıkıyor. Sekiz grupta oynanan 100 maçın ardından her grubun ilk iki takımı Son 16'ya kalıyor, kupa 1 Aralık'ta sahibini buluyor.</p>
      <div class="facts"><div class="fact"><b class="num">44</b><span>Mahalle</span></div><div class="fact"><b class="num">${n}</b><span>Oynanan maç</span></div><div class="fact"><b class="num">${g}</b><span>Gol</span></div><div class="fact"><b class="num">${n?(g/n).toFixed(1).replace('.',','):'0'}</b><span>Maç başı gol</span></div></div>
      <div class="chipsRow"><div class="live"><i></i>Tüm maçlar TV82 YouTube kanalında canlı</div>${SEA!=null?`<div class="live sea"><i></i>Alanya'da deniz suyu ${SEA.toFixed(1).replace('.',',')}°C</div>`:''}</div>
      <div class="live-note" id="dataNote">${DATA_NOTE}</div>
    </div><aside class="board" aria-live="polite">${boardHtml()}</aside></div>${SKYLINE}</section>
  <section class="block"><div class="wrap">
    <div class="gundem">
      <div class="panel"><header><h3>Son sonuçlar</h3><a href="/fikstur">Tüm fikstür</a></header>${done.length?done.map(m=>{const s=sc(m.id),f=fmt(m.d);
        return `<a class="res" href="/mac/${m.id}"><span class="d">${f.dm}<br>${m.ko?esc(m.ko.c):m.g+' Grubu'}</span><span class="h ${s[0]>s[1]?'win':s[0]<s[1]?'lose':''}">${esc(m.h)}</span><span class="s">${s.join('–')}</span><span class="a ${s[1]>s[0]?'win':s[1]<s[0]?'lose':''}">${esc(m.a)}</span></a>`}).join(''):'<div class="none">Henüz oynanmış maç yok. Lig 4 Ekim Pazar başlıyor.</div>'}</div>
      <div class="panel"><header><h3>Duyurular</h3><a href="/duyurular">Tümü</a></header>${news.length?news.map(([id,x])=>`<a class="newsMini" href="/duyuru/${id}"><b>${x.pinned?'<span class="badge post">Sabit</span> ':''}${esc(x.title)}</b><span>${fmtDate(x.date)}</span></a>`).join(''):'<div class="none">Henüz duyuru yok.</div>'}</div>
    </div>
    <h2 class="subhead">Grup liderleri</h2><div class="glead">${leadersMini}</div>
    <div class="homeGrid">
      ${leaderCard('Gol krallığı','<i class="ic g"></i>',scorers,'gol',r=>r.v,r=>pSub(r.pid),'/istatistik')}
      <article class="lcard cta"><header><h3>Tahmin oyunu</h3></header><p>Maç skorlarını önceden tahmin et, tam skor 3, doğru sonuç 1 puan. En iyi tahminciler listesine gir.</p><a class="btn sm" href="/tahmin">Tahmin yap</a></article>
      <article class="lcard cta"><header><h3>Takımını takip et</h3></header><p>${fol.length?`Takip ettiklerin: <b>${fol.map(esc).join(', ')}</b>. Maç başlayınca, gol olunca ve maç bitince bildirim alırsın.`:'Mahallenin sayfasında "Takip et"e dokun; maç başlayınca, gol olunca ve maç bitince bildirim al.'}</p><a class="btn sm line" href="/takimlar">Takımlar</a></article>
    </div>
    ${Object.keys(DATA.sponsors).length?`<h2 class="subhead">Destekçilerimiz</h2>${sponsorStrip()}`:''}
  </div></section>`;
};

/* ---------- Fikstür ---------- */
const fx={tur:null,g:'',q:''};
{const nx=ALL.find(m=>m.d>=todayKey);fx.tur=nx?nx.tur:0;}
function fxHl(name){
  if(!fx.q||!name) return esc(name);
  const i=low(name).indexOf(fx.q);
  if(i<0) return esc(name);
  return esc(name.slice(0,i))+'<mark>'+esc(name.slice(i,i+fx.q.length))+'</mark>'+esc(name.slice(i+fx.q.length));
}
const fxFilter=m=>(!fx.g||m.g===fx.g)&&(!fx.q||low(hName(m)).includes(fx.q)||low(aName(m)).includes(fx.q));
function fixtureList(){
  let html='';
  const showGroups=fx.tur!==6, showKo=fx.tur===0||fx.tur===6;
  if(showGroups){
    (fx.tur?ROUNDS.filter(r=>r.n===fx.tur):ROUNDS).forEach(r=>{
      const cards=r.days.map(([d,ms,tbd])=>{const rows=ALL.filter(m=>m.d===d).filter(fxFilter);return rows.length?dayCard(d,rows,tbd,null,fxHl):''}).join('');
      const byes=r.bye.filter(t=>(!fx.g||TEAM_G[t]===fx.g)&&(!fx.q||low(t).includes(fx.q)));
      if(!cards&&!byes.length) return;
      html+=`${fx.tur?'':`<h3 class="subhead" style="margin-top:${html?'34px':'0'}">${r.n}. Tur <span class="muted" style="font-size:1rem;font-family:var(--f-body);font-weight:600;text-transform:none">${r.span}</span></h3>`}
        ${cards?`<div class="days">${cards}</div>`:''}
        ${byes.length?`<div class="bye"><b>Bay geçen</b>${byes.map(t=>`<a href="/takim/${slug(t)}"><i class="gp" data-g="${TEAM_G[t]}">${TEAM_G[t]}</i>${fxHl(t)}</a>`).join('')}</div>`:''}`;
    });
  }
  if(showKo&&!fx.g){
    const days=[...new Set(KO_ALL.map(k=>k.d))];
    const cards=days.map(d=>{const rows=KO_ALL.filter(k=>k.d===d).sort((x,y)=>x.t.localeCompare(y.t)).map(k=>matchInfo(k.id)).filter(fxFilter);
      return rows.length?dayCard(d,rows,false,koStage(KO_ALL.find(k=>k.d===d)),fxHl):''}).join('');
    if(cards) html+=`${fx.tur===0?`<h3 class="subhead" style="margin-top:${html?'34px':'0'}">Eleme turları</h3>`:''}<div class="days">${cards}</div>`;
  }
  return html||'<div class="empty">Bu filtreyle eşleşen maç yok. Aramayı ya da grup seçimini değiştirin.</div>';
}
PAGES.fikstur=()=>`<div class="wrap page">${pageHead('4 Ekim – 1 Aralık 2026','Fikstür','Grup maçları 19:30, 20:40, 21:50 ve 23:00\'te, eleme maçları 20:00 ve 21:30\'da başlar. Ayrıntılar için maça dokunun.',printBtn())}
  <div class="controls no-print">
    <div class="tabs" role="group" aria-label="Tur seçimi">${['Tümü',1,2,3,4,5,'Eleme'].map(n=>{const v=n==='Tümü'?0:n==='Eleme'?6:n;return `<button type="button" data-tur="${v}" aria-pressed="${fx.tur===v}">${typeof n==='number'?n+'. Tur':n}</button>`}).join('')}</div>
    <div class="chips" role="group" aria-label="Grup filtresi">${['',...Object.keys(GROUPS)].map(g=>`<button type="button" data-g="${g}" data-gf="${g}" aria-pressed="${fx.g===g}" title="${g?g+' Grubu':'Tüm gruplar'}">${g||'Tümü'}</button>`).join('')}</div>
    <input class="search" id="q" type="search" placeholder="Mahalle ara…" aria-label="Mahalle ara" value="${esc(fx.q)}">
  </div><div id="fixture">${fixtureList()}</div>
  <div class="ko-note"><span><b>Maç oynanmayan günler:</b> 5 Ekim (A Milli Takım) · 19 Ekim (Trabzonspor – Beşiktaş) · 23 Ekim (Alanyaspor iç saha) · 26 Ekim (Galatasaray – Fenerbahçe)</span></div></div>`;

/* ---------- Gruplar ---------- */
PAGES.gruplar=()=>`<div class="wrap page">${pageHead('Grup aşaması','Gruplar ve puan durumu','Sıralama: puan, averaj, atılan gol. Her grubun ilk iki takımı Son 16\'ya yükselir.',printBtn())}
  <div class="groups">${Object.keys(GROUPS).map(groupCard).join('')}</div></div>`;
PAGES.grup=(gl)=>{
  const g=gl.toUpperCase(); if(!GROUPS[g]) return PAGES.notfound();
  const ms=ALL.filter(m=>m.g===g);
  const played=ms.filter(m=>sc(m.id)), goals=played.reduce((a,m)=>a+sc(m.id)[0]+sc(m.id)[1],0);
  const st=computeStats();
  const scorers=Object.entries(st).filter(([pid,v])=>v.G>0&&TEAM_G[DATA.players[pid]?.team]===g).sort((a,b)=>b[1].G-a[1].G).slice(0,8)
    .map(([pid,v])=>({name:plink(pid),av:avatar(pid,pName(pid)),pid,v:v.G}));
  const paths=[1,2].map(p=>{const k=KO.r16.find(x=>x.h===g+p||x.a===g+p),opp=k.h===g+p?k.a:k.h,f=fmt(k.d);return `<div><b>Grup ${ORD[p]}</b>${k.c} · ${f.dm} ${f.wd} ${k.t} · rakip ${opp[0]} Grubu ${ORD[opp[1]]}</div>`}).join('');
  return `<div class="wrap page" data-g="${g}">${crumbs([['/','Ana sayfa'],['/gruplar','Gruplar'],['',g+' Grubu']])}
  ${pageHead(`${GROUPS[g].length} takım · ${played.length}/${ms.length} maç oynandı`,`${g} Grubu`,groupDone(g)?'Grup tamamlandı; ilk iki takım Son 16\'da.':'',printBtn())}
  <div class="panel tablePanel">${standingsTable(g,true)}</div>
  <div class="twoCol">
    <div><h2 class="subhead">Maçlar</h2>${ROUNDS.map(r=>{const rows=ms.filter(m=>m.tur===r.n);const bye=r.bye.find(t=>TEAM_G[t]===g);
      return `<h3 class="minihead">${r.n}. Tur${bye?` <small>· bay: ${esc(bye)}</small>`:''}</h3><div class="panel">${rows.map(m=>`<div class="mline"><span class="d">${fmt(m.d).dm}</span>${matchRow(m)}</div>`).join('')}</div>`}).join('')}</div>
    <div><h2 class="subhead">Grup istatistikleri</h2>
      <div class="tiles t3"><div class="tile"><b>${played.length}</b><span>Maç</span></div><div class="tile"><b>${goals}</b><span>Gol</span></div><div class="tile"><b>${played.length?(goals/played.length).toFixed(1).replace('.',','):'0'}</b><span>Maç başı</span></div></div>
      <div style="margin-top:16px">${leaderCard(`${g} Grubu golcüleri`,'<i class="ic g"></i>',scorers,'gol',r=>r.v,r=>pSub(r.pid))}</div>
      <h2 class="subhead">Son 16 yolu</h2><div class="path">${paths}</div></div>
  </div></div>`;
};

/* ---------- İstatistik ---------- */
const statSort={k:'P',dir:-1};
PAGES.istatistik=()=>{
  const recs=Object.keys(TEAM_G).map(t=>{const r=teamRecord(t);return {t,...r,P:r.G*3+r.B,Av:r.A-r.Y,FP:r.SK+r.KK*3}});
  const k=statSort.k, sorted=[...recs].sort((a,b)=>(typeof a[k]==='string'?a[k].localeCompare(b[k],'tr'):(a[k]-b[k]))*statSort.dir||a.t.localeCompare(b.t,'tr'));
  const th=(key,l,title)=>`<th><button type="button" data-ssort="${key}" title="${title||l}">${l}${statSort.k===key?(statSort.dir<0?' ↓':' ↑'):''}</button></th>`;
  const tSub=t=>`<i class="gp" data-g="${TEAM_G[t]}">${TEAM_G[t]}</i>${TEAM_G[t]} Grubu`;
  const played=recs.filter(r=>r.O>0);
  const tRow=(arr,val)=>arr.slice(0,10).map(r=>({name:tlink(r.t),av:teamBadge(r.t,'sm'),t:r.t,v:val(r)}));
  return `<div class="wrap page">${pageHead('Oyuncu ve takım istatistikleri','İstatistik','Girilen maç olaylarından hesaplanır.',printBtn())}
  <div class="leaders">
    ${leaderCard('Gol krallığı','<i class="ic g"></i>',topPlayers('G',20),'gol',r=>r.v,r=>pSub(r.pid))}
    ${leaderCard('Asist krallığı','<i class="ic g"></i>',topPlayers('A',20),'asist',r=>r.v,r=>pSub(r.pid))}
    ${leaderCard('Maçın oyuncusu','<span class="mvp">MVP</span>',topPlayers('MVP',20),'maçın oyuncusu',r=>r.v,r=>pSub(r.pid))}
    ${leaderCard('Sarı kart','<i class="ic y" style="width:11px;height:15px"></i>',topPlayers('Y',20),'sarı kart',r=>r.v,r=>pSub(r.pid),'/disiplin')}
  </div>
  <h2 class="subhead">Takımlar</h2>
  <div class="teamStats">
    ${leaderCard('En golcü','<i class="ic g"></i>',tRow([...played].sort((a,b)=>b.A-a.A||a.O-b.O),r=>r.A),'gol',r=>r.v,r=>tSub(r.t))}
    ${leaderCard('En az gol yiyen','<i class="ic g" style="background:var(--sea)"></i>',tRow([...played].sort((a,b)=>a.Y/a.O-b.Y/b.O||b.O-a.O),r=>r.Y),'maç',r=>r.v,r=>tSub(r.t))}
    ${leaderCard('Fair play','<i class="ic y" style="width:11px;height:15px"></i>',tRow([...played].sort((a,b)=>a.FP/a.O-b.FP/b.O),r=>r.FP),'maç',r=>r.v,r=>{const x=recs.find(q=>q.t===r.t);return `${tSub(r.t)} · ${x.SK} sarı, ${x.KK} kırmızı`})}
  </div>
  <h2 class="subhead">Tüm takımlar</h2>
  <div class="panel tw"><table class="st full sortable"><thead><tr><th>#</th>${th('t','Takım')}${th('O','O','Oynanan')}${th('G','G','Galibiyet')}${th('B','B','Beraberlik')}${th('M','M','Mağlubiyet')}${th('A','A','Atılan')}${th('Y','Y','Yenen')}${th('Av','Av','Averaj')}${th('P','P','Puan (tüm maçlar)')}${th('SK','SK','Sarı kart')}${th('KK','KK','Kırmızı kart')}</tr></thead>
  <tbody>${sorted.map((r,i)=>`<tr><td>${i+1}</td><td class="tm">${teamBadge(r.t,'sm')}${tlink(r.t)}</td><td>${r.O}</td><td>${r.G}</td><td>${r.B}</td><td>${r.M}</td><td>${r.A}</td><td>${r.Y}</td><td>${r.Av>0?'+':''}${r.Av}</td><td class="p">${r.P}</td><td>${r.SK}</td><td>${r.KK}</td></tr>`).join('')}</tbody></table></div>
  <p class="hint" style="margin-top:8px">Fair play puanı: sarı kart 1, kırmızı kart 3; maç başına az olan önde.</p></div>`;
};

/* ---------- Takımlar ---------- */
PAGES.takimlar=()=>{
  loadAllLogos();
  return `<div class="wrap page">${pageHead('44 mahalle · 8 grup','Takımlar','Takımına dokun: kadro, fotoğraflar, form, maç takvimi ve Son 16 yolu.')}
  ${Object.entries(GROUPS).map(([g,ts])=>`<h2 class="subhead" data-g="${g}"><span class="gp" data-g="${g}" style="width:1.8rem;height:1.8rem">${g}</span> ${g} Grubu</h2>
    <div class="tcards">${ts.map(t=>{const st=standings(g),i=st.findIndex(r=>r.t===t),r=st[i];
      return `<a class="tcard" href="/takim/${slug(t)}" data-g="${g}">${teamBadge(t,'md')}<span class="tn">${esc(t)}</span><span class="tm2">${r.O?`${i+1}. sıra · ${r.P} puan`:'Henüz maç yok'}</span>${r.O?formHtml(r.form):''}${isFollowed(t)?'<span class="badge post">Takipte</span>':''}</a>`}).join('')}</div>`).join('')}</div>`;
};
PAGES.takim=(sl)=>{
  const t=TEAM_BY_SLUG[sl]; if(!t) return PAGES.notfound();
  loadMedia(t);
  const g=TEAM_G[t], rec=teamRecord(t), info=DATA.teams[slug(t)]||{}, st=standings(g), rank=st.findIndex(r=>r.t===t)+1;
  const cap=info.captain&&DATA.players[info.captain]?plink(info.captain):'';
  const sq=squadOf(t), stats=computeStats(), nx=nextMatchOf(t);
  const bans=new Set(activeBans().map(b=>b.pid));
  const lines=ROUNDS.map(r=>{
    if(r.bye.includes(t)) return `<li class="byeRow"><span class="tlrow"><span class="tur">${r.n}. Tur<small>${r.span}</small></span><span class="vs muted">Bay haftası, maç yok</span><span class="when"></span></span></li>`;
    const m=ALL.find(x=>x.tur===r.n&&(x.h===t||x.a===t)); return m?timelineRow(m,`${r.n}. Tur`,m.h===t?'Ev sahibi':'Deplasman'):'';
  });
  KO_ALL.forEach(k=>{const m=matchInfo(k.id);if(m.h===t||m.a===t) lines.push(timelineRow(m,k.c,koStage(k)));});
  const topS=sq.map(([id])=>[id,stats[id]?.G||0]).filter(x=>x[1]).sort((a,b)=>b[1]-a[1])[0];
  return `<div class="wrap page" data-g="${g}">${crumbs([['/','Ana sayfa'],['/takimlar','Takımlar'],['',t]])}
  <div class="teamHero">
    ${teamBadge(t,'xl')}
    <div style="min-width:0"><div class="eyebrow"><a href="/grup/${g.toLowerCase()}">${g} Grubu</a> · ${rec.O?`${rank}. sırada`:`kura no ${TEAM_POS[t]}`}</div>
      <h1 class="ptitle">${esc(t)}</h1>
      <div class="actions no-print">
        <button type="button" class="btn sm ${isFollowed(t)?'line':''}" data-follow="${esc(t)}">${isFollowed(t)?'Takipten çık':'Takip et'}</button>
        <button type="button" class="btn sm line" data-teamics="${esc(t)}">Takvime ekle</button>
        <button type="button" class="btn sm line" data-tshare="${esc(t)}">Paylaş</button>${printBtn()}
      </div></div>
  </div>
  <div class="tiles t6">${[['Puan',rec.G*3+rec.B],['Maç',rec.O],['Galibiyet',rec.G],['Atılan',rec.A],['Yenen',rec.Y],['Kart',`${rec.SK}/${rec.KK}`]].map(([k,v])=>`<div class="tile"><b>${v}</b><span>${k}</span></div>`).join('')}</div>
  <div class="twoCol">
    <div>
      ${nx?`<h2 class="subhead">Sıradaki maç</h2><div class="panel">${matchRow(nx)}${(()=>{const w=wx(nx.d,nx.t);return `<p class="hint" style="padding:0 14px 10px">${fmt(nx.d).dm} ${fmt(nx.d).wd} · ${mLabel(nx)}${w?` · ${wxText(w)}`:''}</p>`})()}</div>`:''}
      <h2 class="subhead">Kadro <small class="muted" style="font-size:1rem">${sq.length} oyuncu</small></h2>
      ${sq.length?`<div class="pgrid">${sq.map(([id,p])=>{const v=stats[id]||{};return `<a class="pcard" href="/oyuncu/${id}">${avatar(id,p.name,'md')}<span class="no">${p.no||''}</span><b>${esc(p.name)}</b><small>${esc(p.pos||'')}${info.captain===id?' · Kaptan':''}</small><span class="pst">${v.G?`${IC.G}${v.G}`:''}${v.A?` <small>A</small>${v.A}`:''}${v.Y?` ${IC.Y}${v.Y}`:''}${v.R?` ${IC.R}${v.R}`:''}${bans.has(id)?' <span class="ban">CEZALI</span>':''}</span></a>`}).join('')}</div>`
        :`<div class="empty">${esc(t)} kadrosu henüz girilmedi. Takım temsilcisi <a href="/giris">Giriş</a> sayfasından takım hesabı açıp kadroyu girebilir.</div>`}
      <h2 class="subhead">Maç takvimi</h2><ol class="timeline">${lines.join('')}</ol>
    </div>
    <div>
      <h2 class="subhead">Takım bilgileri</h2>
      <dl class="kv panel" style="padding:14px 16px">
        <dt>Form</dt><dd>${formHtml(rec.form)}</dd>
        ${cap?`<dt>Kaptan</dt><dd>${cap}</dd>`:''}${info.coach?`<dt>Sorumlu</dt><dd>${esc(info.coach)}</dd>`:''}${info.colors?`<dt>Renkler</dt><dd>${esc(info.colors)}</dd>`:''}
        ${topS?`<dt>En golcü</dt><dd>${plink(topS[0])} · ${topS[1]} gol</dd>`:''}
        ${info.note?`<dt>Hakkında</dt><dd style="font-weight:500">${esc(info.note)}</dd>`:''}
      </dl>
      <h2 class="subhead">${g} Grubu</h2><div class="panel">${standingsTable(g,false)}</div>
      <h2 class="subhead">Son 16 yolu</h2><div class="path">${[1,2].map(p=>{const k=KO.r16.find(x=>x.h===g+p||x.a===g+p),opp=k.h===g+p?k.a:k.h,f=fmt(k.d);return `<div><b>Grup ${ORD[p]} olursa</b>${k.c} · ${f.dm} ${f.wd} ${k.t} · rakip ${opp[0]} Grubu ${ORD[opp[1]]}</div>`}).join('')}</div>
    </div>
  </div></div>`;
};

/* ---------- Oyuncu ---------- */
PAGES.oyuncu=(pid)=>{
  const p=DATA.players[pid]; if(!p) return LOADED?PAGES.notfound():PAGES.loading();
  loadMedia(p.team);
  const g=TEAM_G[p.team], v=computeStats()[pid]||{G:0,A:0,Y:0,R:0,MVP:0}, info=DATA.teams[slug(p.team)]||{};
  const games=everyMatch().filter(m=>{const r=DATA.matches[m.id],s=status(m.id);return (s==='done'||s==='live')&&r&&((Array.isArray(r.ev)&&r.ev.some(e=>e.p===pid||e.as===pid))||r.mvp===pid)}).sort(byTime).reverse();
  const bans=activeBans().filter(b=>b.pid===pid);
  return `<div class="wrap page">${crumbs([['/','Ana sayfa'],['/takimlar','Takımlar'],[`/takim/${slug(p.team)}`,p.team],['',p.name]])}
  <div class="playerHero">${avatar(pid,p.name,'xl')}
    <div style="min-width:0"><div class="eyebrow">${tlink(p.team)} · ${g} Grubu</div><h1 class="ptitle">${esc(p.name)}</h1>
    <p class="muted" style="margin:6px 0 0;font-weight:600">${p.no?`#${p.no} · `:''}${esc(p.pos||'Mevki belirtilmedi')}${info.captain===pid?' · Kaptan':''}</p>
    ${bans.length?`<p style="margin:8px 0 0"><span class="badge live" style="animation:none">Cezalı</span> ${bans.map(b=>esc(b.why)+(b.match?` · ${esc(hName(matchInfo(b.match)))} – ${esc(aName(matchInfo(b.match)))} maçında oynayamaz`:'')).join('; ')}</p>`:''}
    <div class="actions no-print"><button type="button" class="btn sm line" data-pshare="${pid}">Paylaş</button></div></div></div>
  <div class="tiles t5">${[['Gol',v.G],['Asist',v.A],['Sarı kart',v.Y],['Kırmızı kart',v.R],['Maçın oyuncusu',v.MVP]].map(([k,x])=>`<div class="tile"><b>${x}</b><span>${k}</span></div>`).join('')}</div>
  <h2 class="subhead">Maçlardaki katkısı</h2>
  ${games.length?`<div class="panel">${games.map(m=>{const r=DATA.matches[m.id],s=shown(m.id),f=fmt(m.d);
    const evs=(r.ev||[]).filter(e=>e.p===pid||e.as===pid).map(e=>`<span class="evc">${e.as===pid&&e.p!==pid?'<small>Asist</small>':IC[e.t]+EV_LBL[e.t]}${e.m?` ${e.m}'`:''}</span>`).join('');
    return `<a class="res" href="/mac/${m.id}" style="grid-template-columns:4.8rem minmax(0,1fr) auto"><span class="d">${f.dm}<br>${m.ko?esc(m.ko.c):m.g+' Grubu'}</span><span style="font-weight:600">${esc(m.h)} ${s?s.join('–'):''} ${esc(m.a)}${r.mvp===pid?' <span class="mvp">MVP</span>':''}</span><span class="evs">${evs}</span></a>`}).join('')}</div>`
    :'<div class="empty">Bu oyuncu için henüz maç istatistiği girilmedi.</div>'}
  <h2 class="subhead">Takım arkadaşları</h2>
  <div class="pgrid">${squadOf(p.team).filter(([id])=>id!==pid).slice(0,12).map(([id,q])=>`<a class="pcard sm" href="/oyuncu/${id}">${avatar(id,q.name,'md')}<b>${esc(q.name)}</b><small>${q.no?'#'+q.no:''} ${esc(q.pos||'')}</small></a>`).join('')}</div></div>`;
};

/* ---------- Final yolu ---------- */
PAGES.final=()=>`<div class="wrap page">${pageHead('Son 16 → Büyük Final','Final yolu','Her maç gecesi iki karşılaşma oynanır: 20:00 ve 21:30. Grup maçları bittikçe eşleşmeler kendiliğinden dolar.',printBtn())}
  ${bracketHtml()}
  <div class="ko-note"><span><b>Beraberlikte:</b> 2×10 dk uzatma, ardından penaltılar</span><span><b>Dinlenme:</b> eleme turları arasında 3–7 gün</span></div>
  <h2 class="subhead">Eşleşme kuralı</h2>
  <div class="path" style="grid-template-columns:repeat(auto-fill,minmax(220px,1fr));display:grid">${KO.r16.map(k=>`<div><b>${k.c} · ${fmt(k.d).dm} ${k.t}</b>${k.h[0]} Grubu ${ORD[k.h[1]]} – ${k.a[0]} Grubu ${ORD[k.a[1]]}</div>`).join('')}</div></div>`;

/* ---------- Disiplin ---------- */
PAGES.disiplin=()=>{
  const R=disciplineRules(), bans=suspensions();
  const active=bans.filter(b=>b.manual||!b.served), past=bans.filter(b=>!b.manual&&b.served);
  const st=computeStats();
  const cards=Object.entries(st).filter(([,v])=>v.Y||v.R).sort((a,b)=>(b[1].R*3+b[1].Y)-(a[1].R*3+a[1].Y));
  const banRow=b=>{const p=DATA.players[b.pid]||{},m=b.match?matchInfo(b.match):null;return `<li>${avatar(b.pid,p.name)}<span class="nm">${plink(b.pid)}<small>${pSub(b.pid)} · ${esc(b.why)}</small></span><span class="c" style="font-size:.85rem;font-family:var(--f-body);font-weight:600">${m?`<a href="/mac/${m.id}">${fmt(m.d).dm} · ${esc(hName(m))} – ${esc(aName(m))}</a>`:'Lig kararı'}</span></li>`};
  return `<div class="wrap page">${pageHead('Kartlar ve cezalar','Disiplin',R.y||R.r?`Uygulanan kural: ${R.y?`${R.y} sarı kartta 1 maç ceza`:''}${R.y&&R.r?', ':''}${R.r?`kırmızı kartta ${R.r} maç ceza`:''}. Otomatik hesaplanır; lig yönetiminin kararları ayrıca eklenir.`:'Otomatik ceza hesaplaması lig yönetimi kuralı girene kadar kapalı. Aşağıda yalnızca lig yönetiminin girdiği cezalar ve kart sayıları görünür.',printBtn())}
  <div class="twoCol">
    <div><h2 class="subhead">Cezalı oyuncular</h2><article class="lcard">${active.length?`<ol>${active.map(banRow).join('')}</ol>`:'<div class="none">Şu an cezalı oyuncu yok.</div>'}</article>
      ${past.length?`<h2 class="subhead">Cezasını çekenler</h2><article class="lcard"><ol>${past.map(banRow).join('')}</ol></article>`:''}</div>
    <div><h2 class="subhead">Kart tablosu</h2><div class="panel tw"><table class="st full"><thead><tr><th>#</th><th>Oyuncu</th><th>Takım</th><th title="Sarı kart"><i class="ic y"></i></th><th title="Kırmızı kart"><i class="ic r"></i></th></tr></thead>
      <tbody>${cards.length?cards.map(([pid,v],i)=>`<tr><td>${i+1}</td><td class="tm">${plink(pid)}</td><td>${esc(DATA.players[pid]?.team||'')}</td><td>${v.Y}</td><td>${v.R}</td></tr>`).join(''):'<tr><td colspan="5" class="muted" style="text-align:center;padding:18px">Henüz kart görülmedi.</td></tr>'}</tbody></table></div></div>
  </div></div>`;
};

/* ---------- Duyurular ---------- */
function newsSorted(){return Object.entries(DATA.news).sort((a,b)=>(b[1].pinned?1:0)-(a[1].pinned?1:0)||String(b[1].date).localeCompare(String(a[1].date)))}
PAGES.duyurular=()=>{const list=newsSorted();return `<div class="wrap page">${pageHead('Lig yönetiminden','Duyurular')}
  <div class="news">${list.length?list.map(([id,n])=>`<a class="newsItem ${n.pinned?'pin':''}" href="/duyuru/${id}"><time datetime="${esc(n.date)}">${n.pinned?'Sabit · ':''}${fmtDate(n.date)}</time><h3>${esc(n.title)}</h3><p>${esc(n.body.length>260?n.body.slice(0,260)+'…':n.body)}</p></a>`).join(''):'<div class="empty">Lig yönetiminin duyuruları burada yayınlanacak.</div>'}</div></div>`};
PAGES.duyuru=(id)=>{const n=DATA.news[id];if(!n)return LOADED?PAGES.notfound():PAGES.loading();
  return `<div class="wrap page narrow">${crumbs([['/','Ana sayfa'],['/duyurular','Duyurular'],['',n.title]])}<article class="newsItem full"><time datetime="${esc(n.date)}">${fmtDate(n.date)}</time><h1 class="ptitle" style="font-size:clamp(2rem,5vw,3rem)">${esc(n.title)}</h1><p>${esc(n.body)}</p>
  <div class="actions no-print"><button type="button" class="btn sm line" data-nshare="${id}">Paylaş</button></div></article></div>`};

/* ---------- Sponsorlar ---------- */
PAGES.sponsorlar=()=>{
  const tiers=[[1,'Ana sponsor'],[2,'Sponsorlar'],[3,'Destekçiler']];
  const list=Object.entries(DATA.sponsors);
  return `<div class="wrap page">${pageHead('Ligi mümkün kılanlar','Sponsorlar ve destekçiler')}
  ${list.length?tiers.map(([n,l])=>{const xs=list.filter(([,s])=>(s.tier||3)===n);return xs.length?`<h2 class="subhead">${l}</h2><div class="spgrid tier${n}">${xs.map(([id,s])=>{const inner=`${s.logo?`<img src="${s.logo}" alt="">`:''}<b>${esc(s.name)}</b>`;return /^https:\/\//.test(s.url||'')?`<a class="spcard" href="${esc(s.url)}" target="_blank" rel="noopener">${inner}</a>`:`<div class="spcard">${inner}</div>`}).join('')}</div>`:''}).join('')
    :'<div class="empty">Sponsor ve destekçiler lig yönetimi tarafından eklenecek.</div>'}</div>`;
};

/* ---------- Bilgi ---------- */
PAGES.bilgi=()=>`<div class="wrap page">${pageHead('Turnuva rehberi','Bilmeniz gerekenler')}
  <div class="info">
    <article><h3>Format</h3><ul><li>A, B, C, D gruplarında 6; E, F, G, H gruplarında 5 takım.</li><li>5 takımlı gruplarda her turda bir takım bay geçer.</li><li>Her grubun ilk iki takımı Son 16'ya kalır.</li><li>Eleme turları tek maç üzerinden oynanır.</li></ul></article>
    <article><h3>Maç oynanmayan günler</h3><dl><dt>5 Ekim</dt><dd>A Milli Takım maçı</dd><dt>19 Ekim</dt><dd>Trabzonspor – Beşiktaş</dd><dt>23 Ekim</dt><dd>Alanyaspor iç saha maçı</dd><dt>26 Ekim</dt><dd>Galatasaray – Fenerbahçe</dd></dl></article>
    <article><h3>Canlı yayın</h3><p style="margin:0">Grup aşamasından Büyük Final'e kadar bütün maçlar <b>TV82</b> YouTube kanalında canlı yayınlanır.</p><p class="muted" style="margin:10px 0 0">Grup maçları: 19:30 · 20:40 · 21:50 · 23:00<br>Eleme maçları: 20:00 · 21:30</p></article>
  </div>
  <h2 class="subhead">Sıkça sorulan sorular</h2>
  <div class="faq">
    <details><summary>Puan eşitliğinde sıralama nasıl belirlenir?</summary><p>Sitedeki tablolar önce puana, sonra averaja (atılan eksi yenen gol), sonra atılan gole bakar. Resmi sıralama için lig yönetmeliği esastır.</p></details>
    <details><summary>Eleme maçında beraberlik olursa ne olur?</summary><p>Normal süre berabere biterse 2×10 dakika uzatma oynanır. Uzatmada da eşitlik bozulmazsa kazanan penaltılarla belirlenir.</p></details>
    <details><summary>Bay geçmek ne demek?</summary><p>E, F, G ve H gruplarında beş takım olduğu için her turda bir takım maç yapmaz. Bay geçen takım o tur puan almaz ve kaybetmez.</p></details>
    <details><summary>Maçları nereden izleyebilirim?</summary><p>Tüm maçlar TV82'nin YouTube kanalında canlı yayınlanır. Yayın bağlantısı eklenen maçlarda maç sayfasında videoya giden bir düğme görünür.</p></details>
    <details><summary>Takımımın maçlarını nasıl takip ederim?</summary><p>Takımın sayfasında "Takip et"e dokunun. Site açıkken (ya da telefona eklenmiş uygulama arka planda çalışırken) maç başlayınca, gol olunca ve maç bitince bildirim alırsınız. "Takvime ekle" ile bütün maçları telefon takviminize de ekleyebilirsiniz.</p></details>
    <details><summary>Tahmin oyunu nasıl puanlanır?</summary><p>Tam skoru bilen 3, sadece sonucu (galibiyet, beraberlik, mağlubiyet) bilen 1 puan alır. Tahminler maç başlayınca kilitlenir.</p></details>
    <details><summary>Takımımın kadrosunu kim giriyor?</summary><p>Her mahallenin temsilcisi Giriş sayfasından takım hesabı açar. Lig yönetimi onaylayınca temsilci kadroyu, forma numaralarını, fotoğrafları ve maç kadrolarını kendisi girer.</p></details>
  </div></div>`;

PAGES.notfound=()=>`<div class="wrap page">${pageHead('Sayfa bulunamadı','Aradığınız sayfa yok','Bağlantı hatalı olabilir ya da sayfa kaldırılmış olabilir.')}<a class="btn" href="/">Ana sayfaya dön</a></div>`;
PAGES.loading=()=>`<div class="wrap page"><div class="empty">Yükleniyor…</div></div>`;

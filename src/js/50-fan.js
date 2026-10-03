/* ===================== Taraftar özellikleri ===================== */
const LINEUPS={}, VOTES={};
let FAN=null, GALLERY=null, GAL_LAST=null, GAL_MORE=false;
const myUid=()=>window.AML_AUTH?.user?.uid||null;
async function ensureFan(){
  const A=window.AML_AUTH; if(!A) throw new Error('offline');
  if(!A.user) await A.anon();
  return A.user.uid;
}
async function loadFan(){
  const uid=myUid(); if(!uid||!DB) return;
  if(FAN&&FAN.uid===uid) return;
  try{const d=await DB.get('fans',uid);FAN={uid,nick:d?.nick||'',p:d?.p||{}};scheduleRender();}catch(e){}
}
async function loadLineups(id){
  if(!DB||LINEUPS[id]==='loading') return;
  const m=matchInfo(id); if(!m||!hName(m)||!aName(m)) return;
  LINEUPS[id]='loading';
  try{
    const [h,a]=await Promise.all([DB.get('lineups',`${id}__${m.h}`),DB.get('lineups',`${id}__${m.a}`)]);
    LINEUPS[id]={h,a}; loadMedia(m.h); loadMedia(m.a); scheduleRender();
  }catch(e){delete LINEUPS[id];}
}
async function loadVotes(id){
  if(!DB||VOTES[id]==='loading') return;
  VOTES[id]='loading';
  try{
    const d=await DB.get('mvpvotes',id), v=(d&&d.v)||{}, counts={}; const uid=myUid();
    Object.values(v).forEach(pid=>{counts[pid]=(counts[pid]||0)+1});
    VOTES[id]={counts,mine:uid?v[uid]||null:null,total:Object.keys(v).length}; scheduleRender();
  }catch(e){delete VOTES[id];}
}
const predPts=(p,s)=>!p||!s?null:(p[0]===s[0]&&p[1]===s[1])?3:(Math.sign(p[0]-p[1])===Math.sign(s[0]-s[1]))?1:0;

/* ---------- Maç sayfası ---------- */
function lineupCol(m,side){
  const L=LINEUPS[m.id], team=side==='h'?m.h:m.a, d=L&&L!=='loading'?L[side]:null;
  const row=pid=>{const p=DATA.players[pid];return p?`<li>${avatar(pid,p.name)}<span class="no">${p.no||''}</span>${plink(pid)}<small>${esc(p.pos||'')}</small></li>`:''};
  return `<div class="lineup"><h3>${teamBadge(team,'sm')}${esc(team)}</h3>${d?`<b class="lh">İlk kadro</b><ol>${d.start.map(row).join('')}</ol>${d.subs.length?`<b class="lh">Yedekler</b><ol>${d.subs.map(row).join('')}</ol>`:''}`
    :`<p class="hint">${L==='loading'||!L?'Yükleniyor…':'Kadro henüz girilmedi.'}</p>`}</div>`;
}
function voteBox(m){
  if(status(m.id)!=='done') return '';
  const V=VOTES[m.id]; if(!V||V==='loading'){loadVotes(m.id);return `<div class="panel pad"><h3 class="minihead">Taraftarın maçın oyuncusu</h3><p class="hint">Yükleniyor…</p></div>`;}
  const L=LINEUPS[m.id]&&LINEUPS[m.id]!=='loading'?LINEUPS[m.id]:null;
  const pool=[m.h,m.a].flatMap(t=>{const side=t===m.h?'h':'a',l=L?.[side];return l?[...l.start,...l.subs]:squadOf(t).map(([id])=>id)}).filter(pid=>DATA.players[pid]);
  if(!pool.length) return `<div class="panel pad"><h3 class="minihead">Taraftarın maçın oyuncusu</h3><p class="hint">Oylama için iki takımın kadrosunun girilmiş olması gerekiyor.</p></div>`;
  const top=Object.entries(V.counts).sort((a,b)=>b[1]-a[1]).slice(0,5);
  return `<div class="panel pad"><h3 class="minihead">Taraftarın maçın oyuncusu <small class="muted">${V.total} oy</small></h3>
    ${top.length?`<ul class="bars">${top.map(([pid,n])=>`<li><span>${plink(pid)} <small class="muted">${esc(DATA.players[pid]?.team||'')}</small></span><i style="--w:${Math.round(n/V.total*100)}%"></i><b>%${Math.round(n/V.total*100)}</b></li>`).join('')}</ul>`:'<p class="hint">İlk oyu sen ver.</p>'}
    <div class="row no-print" style="margin-top:10px"><label class="fld"><span>${V.mine?'Oyunu değiştir':'Oyunu ver'}</span><select id="voteSel">${[m.h,m.a].map(t=>`<optgroup label="${esc(t)}">${pool.filter(pid=>DATA.players[pid].team===t).map(pid=>`<option value="${pid}"${V.mine===pid?' selected':''}>${esc(pName(pid))}</option>`).join('')}</optgroup>`).join('')}</select></label>
      <button type="button" class="btn sm" data-vote="${m.id}">Oy ver</button></div></div>`;
}
function predictBox(m){
  if(status(m.id)==='done'||status(m.id)==='live'||kickoff(m)<=new Date()||!hName(m)||!aName(m)) return '';
  const p=FAN?.p?.[m.id];
  return `<div class="panel pad no-print"><h3 class="minihead">Skor tahminin</h3>
    ${FAN&&FAN.nick?`<div class="predRow" data-pm="${m.id}"><span class="tn">${esc(m.h)}</span><input type="number" min="0" max="20" inputmode="numeric" aria-label="${esc(m.h)} gol" value="${p?p[0]:''}"><span>–</span><input type="number" min="0" max="20" inputmode="numeric" aria-label="${esc(m.a)} gol" value="${p?p[1]:''}"><span class="tn">${esc(m.a)}</span><button type="button" class="btn sm" data-pred="${m.id}">${p?'Güncelle':'Kaydet'}</button></div><p class="hint">Maç başlayınca tahminler kilitlenir.</p>`
      :`<p class="hint">Tahmin yapmak için önce <a href="/tahmin">Tahmin oyunu</a> sayfasında bir takma ad seç.</p>`}</div>`;
}
PAGES.mac=(id)=>{
  const m=matchInfo(id); if(!m) return PAGES.notfound();
  const r=DATA.matches[id]||{}, st=status(id), s=shown(id), f=fmt(m.d), h=hName(m)||m.ko?.h, a=aName(m)||m.ko?.a;
  if(m.h&&m.a&&!LINEUPS[id]) loadLineups(id);
  if(myUid()&&!FAN) loadFan();
  const stLabel=st==='live'?`<span class="badge live">Canlı${r.minute?' '+r.minute+"'":''}</span>`:st==='done'?'<span class="badge ft">Maç sonu</span>':st==='post'?'<span class="badge post">Ertelendi</span>':'';
  const ev=Array.isArray(r.ev)?[...r.ev].sort((x,y)=>(x.m||999)-(y.m||999)):[];
  const evHtml=(st==='done'||st==='live')&&ev.length?`<ul class="tl">${ev.map(e=>{const txt=`${IC[e.t]}<span>${plink(e.p)}${e.as&&e.t==='G'?` <small>asist ${esc(pName(e.as))}</small>`:''}${e.t==='OG'?' <small>(k.k.)</small>':''}</span>`;
    return `<li title="${EV_LBL[e.t]}"><span class="l">${e.s==='h'?txt:''}</span><span class="mn">${e.m?e.m+"'":'–'}</span><span class="r">${e.s==='a'?txt:''}</span></li>`}).join('')}</ul>`:'';
  const w=st!=='done'?wx(m.d,m.t):null;
  const kv=[['Tarih',`${f.dm} ${pd(m.d).getFullYear()} ${f.wd}`],['Saat',m.t||'Kura ile belirlenecek'],
    ['Saha',r.venue?`${esc(r.venue)} · <a href="https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(r.venue+' Alanya')}" target="_blank" rel="noopener">Haritada aç</a>`:''],
    ['Hakem',esc(r.ref)],['Hava (tahmin)',w?esc(wxText(w)):''],
    ['Maçın oyuncusu',r.mvp&&DATA.players[r.mvp]?`<span class="mvp">MVP</span> ${plink(r.mvp)}`:''],
    ['Penaltılar',st==='done'&&r.pen&&s&&s[0]===s[1]?`${esc(r.pen==='h'?h:a)} kazandı`:''],['Yayın','TV82 YouTube kanalı']].filter(x=>x[1]);
  const video=/^https:\/\//.test(r.video||'')?`<a class="btn sm" href="${esc(r.video)}" target="_blank" rel="noopener">Maç videosunu izle</a>`:'';
  const same=(m.ko?KO_ALL.filter(k=>k.d===m.d).map(k=>matchInfo(k.id)):ALL.filter(x=>x.d===m.d)).filter(x=>x.id!==id);
  const bans=activeBans().filter(b=>b.match===id);
  return `<div class="wrap page">${crumbs([['/','Ana sayfa'],['/fikstur','Fikstür'],['',`${h} – ${a}`]])}
  <div class="matchHero">
    <div class="meta"><span>${mLabel(m)}</span>${stLabel}</div>
    <div class="mscore"><a class="tn" href="${m.h?`/takim/${slug(m.h)}`:'/final'}">${m.h?teamBadge(m.h,'lg'):''}<span>${esc(h)}</span></a>
      <span class="sc">${s?s.join('–'):m.t||'vs'}${st==='done'&&r.pen&&s&&s[0]===s[1]?'<small>pen.</small>':''}</span>
      <a class="tn" href="${m.a?`/takim/${slug(m.a)}`:'/final'}">${m.a?teamBadge(m.a,'lg'):''}<span>${esc(a)}</span></a></div>
    <div class="actions no-print" style="justify-content:center">${video}<button type="button" class="btn sm line" data-ics="${id}">Takvime ekle</button><button type="button" class="btn sm line" data-share="${id}">Paylaş</button></div>
  </div>
  <div class="twoCol">
    <div>
      ${evHtml?`<h2 class="subhead">Maç olayları</h2><div class="panel pad">${evHtml}</div>`:st==='done'?'<p class="hint">Bu maç için olay girilmedi.</p>':''}
      ${r.note?`<div class="panel pad" style="margin-top:14px"><p style="margin:0">${esc(r.note)}</p></div>`:''}
      ${m.h&&m.a?`<h2 class="subhead">Kadrolar</h2><div class="lineups">${lineupCol(m,'h')}${lineupCol(m,'a')}</div>`:''}
      ${bans.length?`<h2 class="subhead">Bu maçta cezalı</h2><div class="panel pad">${bans.map(b=>`<p style="margin:4px 0">${plink(b.pid)} <small class="muted">${esc(DATA.players[b.pid]?.team||'')} · ${esc(b.why)}</small></p>`).join('')}</div>`:''}
    </div>
    <div>
      <h2 class="subhead">Maç bilgisi</h2><dl class="kv panel pad">${kv.map(([k,v])=>`<dt>${k}</dt><dd>${v}</dd>`).join('')}</dl>
      <div class="stackGap">${predictBox(m)}${voteBox(m)}</div>
      ${same.length?`<h2 class="subhead">Aynı gün</h2><div class="panel">${same.map(x=>matchRow(x)).join('')}</div>`:''}
    </div>
  </div></div>`;
};

/* ---------- Tahmin oyunu ---------- */
PAGES.tahmin=()=>{
  if(myUid()&&!FAN) loadFan();
  const upcoming=everyMatch().filter(m=>hName(m)&&aName(m)&&status(m.id)===''&&kickoff(m)>new Date()).sort(byTime);
  const days=[...new Set(upcoming.map(m=>m.d))].slice(0,3);
  const mine=FAN?Object.entries(FAN.p).map(([mid,p])=>{const m=matchInfo(mid);return m?{m,p,pts:predPts(p,sc(mid))}:null}).filter(Boolean).sort((a,b)=>byTime(b.m,a.m)):[];
  const total=mine.reduce((s,x)=>s+(x.pts||0),0);
  const board=BOARD;
  return `<div class="wrap page">${pageHead('Taraftar oyunu','Tahmin oyunu','Maç skorlarını önceden tahmin et. Tam skor 3 puan, doğru sonuç 1 puan. Tahminler maç başlayınca kilitlenir.')}
  <div class="twoCol">
    <div>
      <div class="panel pad">
        <h3 class="minihead">Takma adın</h3>
        <div class="row"><label class="fld"><span>Sıralamada görünecek ad</span><input id="nickIn" type="text" minlength="2" maxlength="24" value="${esc(FAN?.nick||'')}" placeholder="Örn. Kızılkule Kartalı" autocomplete="nickname"></label>
        <button type="button" class="btn sm" id="nickSave">${FAN?.nick?'Değiştir':'Başla'}</button></div>
        ${FAN?.nick?`<p class="hint">${{ok:'<b>Takma adın onaylı</b>, sıralamada bu adla görünürsün.',bad:'<b>Takma adın uygun bulunmadı.</b> Başka bir ad seçene kadar sıralamada adın görünmez.',wait:'<b>Takma adın lig yönetiminin onayını bekliyor.</b> Onaylanana kadar sıralamada "'+anonName(FAN.uid)+'" olarak görünürsün; tahmin yapmaya şimdiden başlayabilirsin.'}[nickState(FAN.uid,FAN.nick)]}</p>`:''}
        <p class="hint">Hesap açman gerekmez; tahminlerin bu tarayıcıya bağlı kalır. Tarayıcı verilerini silersen tahminlerine yeniden ulaşamazsın.</p>
      </div>
      ${FAN?.nick?`<h2 class="subhead">Yaklaşan maçlar</h2>${days.length?days.map(d=>`<h3 class="minihead">${fmt(d).dm} ${fmt(d).wd}</h3><div class="panel">${upcoming.filter(m=>m.d===d).map(m=>{const p=FAN.p[m.id];
        return `<div class="predRow" data-pm="${m.id}"><span class="t muted">${m.t||'—'}</span><span class="tn r">${esc(m.h)}</span><input type="number" min="0" max="20" inputmode="numeric" aria-label="${esc(m.h)} gol" value="${p?p[0]:''}"><span>–</span><input type="number" min="0" max="20" inputmode="numeric" aria-label="${esc(m.a)} gol" value="${p?p[1]:''}"><span class="tn">${esc(m.a)}</span><button type="button" class="btn sm ${p?'line':''}" data-pred="${m.id}">${p?'Güncelle':'Kaydet'}</button></div>`}).join('')}</div>`).join(''):'<div class="empty">Tahmin yapılabilecek maç yok.</div>'}
        <h2 class="subhead">Tahminlerin <small class="muted" style="font-size:1rem">${total} puan</small></h2>
        ${mine.length?`<div class="panel">${mine.map(x=>{const s=sc(x.m.id);return `<a class="res" href="/mac/${x.m.id}" style="grid-template-columns:4.8rem minmax(0,1fr) auto"><span class="d">${fmt(x.m.d).dm}</span><span>${esc(x.m.h)} – ${esc(x.m.a)} <small class="muted">tahmin ${x.p.join('–')}${s?` · sonuç ${s.join('–')}`:''}</small></span><b class="${x.pts===3?'pt3':x.pts===1?'pt1':''}">${x.pts==null?'bekliyor':x.pts+' puan'}</b></a>`}).join('')}</div>`:'<p class="hint">Henüz tahmin yapmadın.</p>'}`:''}
    </div>
    <div><h2 class="subhead">Sıralama</h2>
      <article class="lcard">${board.length?`<ol>${board.map((f,i)=>`<li${f.uid===myUid()?' class="me"':''}><span class="rk">${i+1}</span><span class="nm">${esc(f.nick)}<small>${f.n} tahmin · ${f.exact} tam skor</small></span><span class="c">${f.pts}</span></li>`).join('')}</ol>`:`<div class="none">Sonuçlanan maç olunca sıralama oluşacak.</div>`}</article>${BOARD_AT?`<p class="hint" style="margin-top:8px">Sıralama her maç sonucu girildiğinde güncellenir. Son güncelleme: ${fmtDate(BOARD_AT)}</p>`:''}</div>
  </div></div>`;
};
// Sıralamayı yönetici hesaplar ve agg/board belgesine yazar; ziyaretçiler yalnızca o belgeyi okur.
async function rebuildBoard(){
  if(!IS_ADMIN) return;
  const fans=await DB.list('fans');
  const top=fans.map(([uid,f])=>{let pts=0,exact=0,n=0;for(const[mid,p] of Object.entries(f.p||{})){const x=predPts(p,sc(mid));if(x!=null){pts+=x;n++;if(x===3)exact++;}}return {uid,nick:nickState(uid,f.nick||'')==='ok'?f.nick:anonName(uid),pts,exact,n}})
    .filter(f=>f.n>0).sort((a,b)=>b.pts-a.pts||b.exact-a.exact||a.nick.localeCompare(b.nick,'tr')).slice(0,50);
  await DB.collection('agg').doc('board').set({top,updated:new Date().toISOString()});
}
async function saveNick(){
  const nick=$('#nickIn').value.trim();
  if(nick.length<2){toast('Takma ad en az 2 karakter olmalı.');return;}
  try{const uid=await ensureFan();await loadFan();
    await DB.collection('fans').doc(uid).set({nick,p:FAN?.p||{},updated:new Date().toISOString()});
    FAN={uid,nick,p:FAN?.p||{}};toast('Takma adın kaydedildi');render();}
  catch(e){toast('Kaydedilemedi. Bağlantını kontrol edip tekrar dene.');}
}
async function savePred(mid){
  const row=document.querySelector(`[data-pm="${mid}"]`), ins=row.querySelectorAll('input');
  const h=ins[0].value, a=ins[1].value;
  if(h===''||a===''){toast('İki takımın skorunu da yaz.');return;}
  const m=matchInfo(mid); if(kickoff(m)<=new Date()){toast('Bu maç başladı, tahmin kapandı.');return;}
  try{const uid=await ensureFan();
    const p={...(FAN?.p||{}),[mid]:[Math.min(20,Math.max(0,+h)),Math.min(20,Math.max(0,+a))]};
    await DB.collection('fans').doc(uid).set({nick:FAN.nick,p,k:mid,updated:new Date().toISOString()});
    FAN.p=p;toast(`Tahmin kaydedildi: ${m.h} ${p[mid][0]}–${p[mid][1]} ${m.a}`);render();}
  catch(e){toast(e&&e.code==='permission-denied'?'Bu maç için tahmin süresi doldu.':'Kaydedilemedi. Tekrar dene.');}
}
async function castVote(mid){
  const pid=$('#voteSel').value; if(!pid) return;
  try{const uid=await ensureFan();
    await DB.merge('mvpvotes',mid,{v:{[uid]:pid}});
    delete VOTES[mid];toast('Oyun kaydedildi');loadVotes(mid);}
  catch(e){toast('Oy kaydedilemedi. Tekrar dene.');}
}

/* ---------- Haftanın seçimleri ---------- */
let weekSel=null;
PAGES.haftanin=()=>{
  const avail=PERIODS.filter(([n])=>DATA.weekly[n]);
  if(weekSel==null) weekSel=avail.length?avail[avail.length-1][0]:1;
  const W=DATA.weekly[weekSel]||null;
  const team=(W?.team||[]).filter(pid=>DATA.players[pid]);
  team.forEach(pid=>loadMedia(DATA.players[pid].team));
  const goal=W?.goal&&DATA.players[W.goal.p]?W.goal:null, gm=goal?.match?matchInfo(goal.match):null;
  return `<div class="wrap page">${pageHead('Lig yönetiminin seçimi','Haftanın kadrosu ve golü')}
  <div class="tabs no-print" role="group" aria-label="Dönem" style="margin-bottom:20px">${PERIODS.map(([n,l])=>`<button type="button" data-week="${n}" aria-pressed="${weekSel===n}">${l}${DATA.weekly[n]?'':' ·'}</button>`).join('')}</div>
  ${W?`<div class="twoCol"><div><h2 class="subhead">Haftanın kadrosu</h2>
    ${team.length?`<div class="pgrid">${team.map(pid=>{const p=DATA.players[pid];return `<a class="pcard" href="/oyuncu/${pid}">${avatar(pid,p.name,'md')}<b>${esc(p.name)}</b><small>${esc(p.pos||'')} · ${esc(p.team)}</small></a>`}).join('')}</div>`:'<div class="empty">Bu dönem için kadro seçilmedi.</div>'}
    ${W.note?`<p style="margin-top:14px">${esc(W.note)}</p>`:''}</div>
    <div><h2 class="subhead">Haftanın golü</h2>${goal?`<div class="panel pad goalCard">${avatar(goal.p,pName(goal.p),'lg')}<div><b class="gname">${plink(goal.p)}</b><p class="muted" style="margin:4px 0">${esc(DATA.players[goal.p].team)}${goal.minute?` · ${goal.minute}. dakika`:''}</p>${gm?`<p style="margin:4px 0"><a href="/mac/${gm.id}">${esc(gm.h)} – ${esc(gm.a)} · ${fmt(gm.d).dm}</a></p>`:''}${goal.note?`<p style="margin:8px 0 0">${esc(goal.note)}</p>`:''}${/^https:\/\//.test(goal.video||'')?`<a class="btn sm" style="margin-top:10px" href="${esc(goal.video)}" target="_blank" rel="noopener">Golü izle</a>`:''}</div></div>`:'<div class="empty">Bu dönem için gol seçilmedi.</div>'}</div></div>`
    :`<div class="empty">${PERIODS.find(([n])=>n===weekSel)[1]} için seçim henüz yapılmadı. Lig yönetimi her turun sonunda haftanın kadrosunu ve golünü seçer.</div>`}</div>`;
};

/* ---------- Galeri ---------- */
let galAlbum='';
async function loadGallery(){
  if(!DB||GALLERY==='loading') return; GALLERY='loading';
  try{const r=await DB.page('gallery','date',24,null);GALLERY=r.rows;GAL_LAST=r.last;GAL_MORE=r.more;}catch(e){GALLERY='error';}scheduleRender();
}
PAGES.galeri=()=>{
  if(GALLERY==null) loadGallery();
  const list=Array.isArray(GALLERY)?GALLERY:[];
  const albums=[...new Set(list.map(([,g])=>g.album||'Genel'))];
  const shownL=list.filter(([,g])=>!galAlbum||(g.album||'Genel')===galAlbum);
  return `<div class="wrap page">${pageHead('Sahadan kareler','Galeri')}
  ${albums.length>1?`<div class="tabs no-print" style="margin-bottom:18px"><button type="button" data-album="" aria-pressed="${!galAlbum}">Tümü</button>${albums.map(a=>`<button type="button" data-album="${esc(a)}" aria-pressed="${galAlbum===a}">${esc(a)}</button>`).join('')}</div>`:''}
  ${GALLERY==='error'?'<div class="empty">Fotoğraflar yüklenemedi. <button type="button" class="btn sm line" data-galretry>Tekrar dene</button></div>':GALLERY==='loading'||GALLERY==null?'<div class="empty">Yükleniyor…</div>':shownL.length?`<div class="gallery">${shownL.map(([id,g])=>`<button type="button" class="gthumb" data-photo="${id}"><img src="${g.thumb}" alt="${esc(g.caption||'Maç fotoğrafı')}" loading="lazy">${g.caption?`<span>${esc(g.caption)}</span>`:''}</button>`).join('')}</div>${GAL_MORE?'<div class="row no-print" style="justify-content:center;margin-top:18px"><button type="button" class="btn line" data-galmore>Daha fazla göster</button></div>':''}`:'<div class="empty">Henüz fotoğraf eklenmedi.</div>'}</div>`;
};
async function moreGallery(){
  if(!GAL_MORE||!Array.isArray(GALLERY)) return;
  try{const r=await DB.page('gallery','date',24,GAL_LAST);GALLERY=GALLERY.concat(r.rows);GAL_LAST=r.last;GAL_MORE=r.more;render();}catch(e){toast('Fotoğraflar yüklenemedi. Tekrar deneyin.');}
}
async function openPhoto(id){
  const g=(Array.isArray(GALLERY)?GALLERY:[]).find(x=>x[0]===id)?.[1]; if(!g) return;
  const d=$('#lightbox');
  d.innerHTML=`<button type="button" class="close" data-close aria-label="Kapat">×</button><img src="${g.thumb}" alt="${esc(g.caption||'')}" class="lbimg"><p>${esc(g.caption||'')}${g.match&&matchInfo(g.match)?` · <a href="/mac/${g.match}">${esc(matchInfo(g.match).h)} – ${esc(matchInfo(g.match).a)}</a>`:''}</p>`;
  try{d.showModal()}catch(e){d.setAttribute('open','')}
  try{const full=await DB.get('galleryFull',id);if(full&&d.open)d.querySelector('.lbimg').src=full.data;}catch(e){}
}

/* ---------- Takip ve bildirimler ---------- */
async function toggleFollow(t){
  let f=followed();
  if(f.includes(t)){f=f.filter(x=>x!==t);toast(`${t} takipten çıkarıldı`);}
  else{
    f.push(t);
    if('Notification' in window&&Notification.permission==='default'){try{await Notification.requestPermission();}catch(e){}}
    toast('Notification' in window&&Notification.permission==='granted'?`${t} takip ediliyor. Maç başlayınca, gol olunca ve maç bitince haber vereceğiz.`:`${t} takip ediliyor. Bildirim izni verilmediği için haberler sadece sitede görünecek.`);
  }
  try{localStorage.setItem(FOLLOW_KEY,JSON.stringify(f))}catch(e){}
  render();
}
function notifyChanges(prev,next){
  const fol=followed(); if(!fol.length) return;
  for(const[id,r] of Object.entries(next)){
    const m=matchInfo(id); if(!m) continue;
    const teams=[m.h||r.h,m.a||r.a]; if(!teams.some(t=>fol.includes(t))) continue;
    const o=prev[id]||{}, os=o.status||(o.played?'done':''), ns=r.status||(r.played?'done':'');
    const title=`${teams[0]} ${r.hs??0}–${r.as??0} ${teams[1]}`;
    if(ns==='live'&&os!=='live') notify('Maç başladı',title,id);
    else if(ns==='done'&&os!=='done') notify('Maç sonu',title,id);
    else if(ns==='live'&&((r.hs??0)+(r.as??0))>((o.hs??0)+(o.as??0))) notify('GOL!',title+(r.minute?` · ${r.minute}'`:''),id);
  }
}
async function notify(head,body,id){
  toast(`${head} ${body}`);
  if(!('Notification' in window)||Notification.permission!=='granted') return;
  const opt={body,icon:'/icon-192.png',badge:'/icon-192.png',tag:id,data:{url:`/mac/${id}`}};
  try{const reg=await navigator.serviceWorker?.getRegistration();if(reg){reg.showNotification(head,opt);return;}}catch(e){}
  try{const n=new Notification(head,opt);n.onclick=()=>{window.focus();navigate(`/mac/${id}`);};}catch(e){}
}

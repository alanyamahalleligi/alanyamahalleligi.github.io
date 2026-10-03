/* ===================== Onay süreci ===================== */
// Takım hesapları doğrudan yayınlayamaz: değişiklik "pending" koleksiyonuna gider,
// yönetici Onaylar sekmesinden onaylayınca siteye işlenir.
let MY_PENDING=[];
const PEND_LBL={player:'Oyuncu',playerDel:'Oyuncu silme',team:'Takım bilgileri',lineup:'Maç kadrosu'};
async function submitPending(type,key,data){
  const A=window.AML_AUTH;
  await DB.collection('pending').add({type,key,data,team:MY_TEAM,by:A.user.uid,at:new Date().toISOString()});
  await loadMyPending();
}
async function loadMyPending(){
  if(!MY_TEAM||!DB) return;
  try{MY_PENDING=(await DB.where('pending','team',MY_TEAM)).sort((a,b)=>String(a[1].at).localeCompare(String(b[1].at)));}catch(e){MY_PENDING=[];}
  if(panelReady){playerList();pendingNote();}
}
function pendingNote(){
  const el=$('#myPending'); if(!el) return;
  el.hidden=IS_ADMIN||!MY_TEAM;
  if(el.hidden) return;
  el.innerHTML=MY_PENDING.length?`<b>${MY_PENDING.length} değişiklik lig yönetiminin onayını bekliyor.</b> Onaylanınca sitede görünür.<ul class="nlist" style="margin-top:8px">${MY_PENDING.map(([id,p])=>`<li><span>${pendSummary(p)}</span><button type="button" data-pcancel="${id}">Geri al</button></li>`).join('')}</ul>`
    :'Girdiğiniz bilgiler lig yönetimi onayladıktan sonra sitede görünür. Şu an onay bekleyen değişikliğiniz yok.';
}
function pendSummary(p){
  const d=p.data||{};
  if(p.type==='player'){const old=DATA.players[p.key];return `<b>${old?'Oyuncu düzenleme':'Yeni oyuncu'}:</b> ${d.no?'#'+d.no+' ':''}${esc(d.name)}${d.pos?' · '+esc(d.pos):''}${old&&old.name!==d.name?` <small class="muted">(eski: ${esc(old.name)})</small>`:''}${d.photo&&d.photo.thumb?' · fotoğraflı':d.photo==='remove'?' · fotoğraf kaldırılacak':''}`;}
  if(p.type==='playerDel') return `<b>Oyuncu silme:</b> ${esc(DATA.players[p.key]?.name||'silinmiş oyuncu')}`;
  if(p.type==='team') return `<b>Takım bilgileri:</b> ${[d.coach&&'sorumlu '+esc(d.coach),d.colors&&'renkler '+esc(d.colors),d.captain&&'kaptan '+esc(pName(d.captain)),d.note&&'tanıtım yazısı',d.logo&&'logo'].filter(Boolean).join(', ')||'boş'}`;
  if(p.type==='lineup'){const m=matchInfo(d.match);return `<b>Maç kadrosu:</b> ${m?esc(hName(m))+' – '+esc(aName(m)):''} · ${d.start.length} ilk, ${d.subs.length} yedek`;}
  return esc(p.type);
}

/* ---------- Yönetici: onay ekranı ---------- */
function approvalsList(){
  if(!IS_ADMIN||!panelReady) return;
  const list=Object.entries(DATA.pending||{}).sort((a,b)=>a[1].team.localeCompare(b[1].team,'tr')||String(a[1].at).localeCompare(String(b[1].at)));
  const teams=[...new Set(list.map(([,p])=>p.team))];
  $('#apList').innerHTML=list.length?teams.map(t=>`<li class="apTeam"><b>${esc(t)}</b><button type="button" class="btn sm" data-apall="${esc(t)}">Bu takımın hepsini onayla</button></li>`
      +list.filter(([,p])=>p.team===t).map(([id,p])=>`<li class="reqRow" style="display:grid">
        <span style="display:flex;gap:10px;align-items:center">${p.type==='player'&&p.data.photo&&p.data.photo.thumb?`<img src="${p.data.photo.thumb}" alt="" class="av" style="width:44px;height:44px">`:p.type==='team'&&p.data.logo?`<img src="${p.data.logo}" alt="" class="av" style="width:44px;height:44px;border-radius:8px">`:''}<span>${pendSummary(p)}<br><small class="muted">${fmtDate(p.at)}</small>${p.type==='lineup'?`<br><small>${p.data.start.map(x=>esc(pName(x))).join(', ')}</small>`:''}${p.type==='team'&&p.data.note?`<br><small>${esc(p.data.note)}</small>`:''}</span></span>
        <span class="row"><button type="button" class="btn sm" data-apok="${id}">Onayla</button><button type="button" data-apno="${id}">Reddet</button></span></li>`).join('')).join('')
    :'<li><span class="muted">Onay bekleyen değişiklik yok.</span></li>';
}
async function applyPending(id){
  const p=DATA.pending[id]; if(!p) return;
  const d=p.data||{}, t=p.team;
  if(p.type==='player'){
    const old=DATA.players[p.key];
    await DB.aggSetK('players','p',p.key,{team:t,name:String(d.name||'').slice(0,60),no:d.no||null,pos:d.pos||'',ban:old?.ban||''});
    if(d.photo&&d.photo.thumb){await DB.collection('photos').doc(p.key).set({team:t,data:d.photo.full});await DB.mapSet('tphotos',t,'p',p.key,d.photo.thumb);PHOTOS[p.key]=d.photo.thumb;PHOTO_FULL[p.key]=d.photo.full;}
    else if(d.photo==='remove'){await DB.collection('photos').doc(p.key).delete();await DB.mapDel('tphotos',t,'p',p.key);delete PHOTOS[p.key];delete PHOTO_FULL[p.key];}
  }else if(p.type==='playerDel'){
    if(DATA.players[p.key]?.team===t){await DB.collection('photos').doc(p.key).delete();await DB.mapDel('tphotos',t,'p',p.key);await DB.aggDelK('players','p',p.key);}
  }else if(p.type==='team'){
    await DB.aggSet('teams','t',t,{team:t,captain:d.captain||'',coach:d.coach||'',colors:d.colors||'',note:d.note||''});
    if(d.logo) await DB.aggSet('logos','l',t,d.logo);
  }else if(p.type==='lineup'){
    await DB.collection('lineups').doc(`${d.match}__${t}`).set({match:d.match,team:t,start:d.start||[],subs:d.subs||[],updated:new Date().toISOString()});
    delete LINEUPS[d.match];
  }
  await DB.collection('pending').doc(id).delete();
}

function initApprovals(){
  $('#apList').addEventListener('click',async e=>{
    const ok=e.target.closest('[data-apok]'), no=e.target.closest('[data-apno]'), all=e.target.closest('[data-apall]');
    try{
      if(ok){ok.disabled=true;await applyPending(ok.dataset.apok);toast('Onaylandı ve yayınlandı');scheduleRender();}
      else if(no){if(!armed(no,'Reddet'))return;await DB.collection('pending').doc(no.dataset.apno).delete();toast('Reddedildi');}
      else if(all){all.disabled=true;const ids=Object.entries(DATA.pending).filter(([,p])=>p.team===all.dataset.apall).sort((a,b)=>String(a[1].at).localeCompare(String(b[1].at))).map(([id])=>id);
        let n=0;for(const id of ids){await applyPending(id);n++;}toast(`${n} değişiklik onaylandı`);scheduleRender();}
    }catch(x){toast(errMsg(x));approvalsList();}
  });
  document.addEventListener('click',async e=>{
    const c=e.target.closest('[data-pcancel]'); if(!c) return;
    try{await DB.collection('pending').doc(c.dataset.pcancel).delete();toast('Değişiklik geri alındı');await loadMyPending();}catch(x){toast(errMsg(x));}
  });
}

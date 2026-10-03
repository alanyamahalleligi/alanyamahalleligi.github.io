/* ---------- Panel (yönetici ve takım hesabı) ---------- */
const draft={id:null,ev:[]};
let ROLE_KNOWN=false, editPlayer=null, editNews=null, panelReady=false, pendingPhoto=undefined, pendingLogo=null;
const PANEL_ON=()=>IS_ADMIN||!!MY_TEAM;
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
  const n=IS_ADMIN?Object.keys(DATA.requests||{}).length:0, pn=IS_ADMIN?Object.keys(DATA.pending||{}).length:0;
  [[$('#reqCount'),n+pn],[$('#reqCount2'),n],[$('#apCount'),pn]].forEach(([el,v])=>{if(!el)return;el.hidden=!v;el.textContent=v;});
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
  try{await DB.aggSet(mDoc(id),'m',id,body);toast(st==='done'?'Sonuç kaydedildi':st==='live'?'Canlı skor güncellendi':'Maç bilgisi kaydedildi');matchOptions();
    if(st==='done'){DATA.matches[id]=body;rebuildBoard().catch(()=>{});}}
  catch(e){toast(errMsg(e));}
  finally{btn.disabled=false;}
}
async function clearMatch(){
  if(!armButton($('#aClear'),'Maç bilgisini sil','Silmek için tekrar tıklayın')) return;
  try{const mid=$('#aMatch').value;await DB.aggDel(mDoc(mid),'m',mid);delete DATA.matches[mid];toast('Maç bilgisi silindi');loadMatch();matchOptions();rebuildBoard().catch(()=>{});}
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
  if(!IS_ADMIN){   // takım hesabı: onaya gönder
    try{await submitPending('player',editPlayer||DB.newId(),{name,no,pos:$('#pPos').value,photo:pendingPhoto?pendingPhoto:(pendingPhoto===null&&editPlayer?'remove':'keep')});
      toast(`${name} lig yönetiminin onayına gönderildi`);resetPlayerForm();$('#pName').focus();}
    catch(e){toast(errMsg(e));}finally{b.disabled=false;}
    return;
  }
  try{
    let id=editPlayer;
    if(!id) id=DB.newId();
    await DB.aggSetK('players','p',id,body);
    if(pendingPhoto){
      await DB.collection('photos').doc(id).set({team:tname,data:pendingPhoto.full});
      await DB.mapSet('tphotos',tname,'p',id,pendingPhoto.thumb);
      PHOTOS[id]=pendingPhoto.thumb;PHOTO_FULL[id]=pendingPhoto.full;
    }else if(pendingPhoto===null&&editPlayer){
      await DB.collection('photos').doc(id).delete();await DB.mapDel('tphotos',tname,'p',id);delete PHOTOS[id];delete PHOTO_FULL[id];
    }
    toast(editPlayer?`${name} güncellendi`:`${name} eklendi`);
    resetPlayerForm();$('#pName').focus();playerList();scheduleRender();
  }catch(e){toast(errMsg(e));}finally{b.disabled=false;}
}
async function onBulk(){
  const lines=$('#pBulk').value.split('\n').map(s=>s.trim()).filter(Boolean);
  if(!lines.length){toast('Listeye en az bir oyuncu yazın.');return;}
  const b=$('#pBulkAdd');b.disabled=true;let n=0;
  try{for(const ln of lines){const m=ln.match(/^(\d{1,2})[\s.\-)]+(.+)$/);
      const nm=(m?m[2]:ln).trim().slice(0,60), nn=m?+m[1]:null;
      if(IS_ADMIN) await DB.aggSetK('players','p',DB.newId(),{team:$('#pTeam').value,name:nm,no:nn,pos:'',ban:''});
      else await DB.collection('pending').add({type:'player',key:DB.newId(),data:{name:nm,no:nn,pos:'',photo:'keep'},team:MY_TEAM,by:window.AML_AUTH.user.uid,at:new Date().toISOString()});
      n++;}
    $('#pBulk').value='';toast(IS_ADMIN?`${n} oyuncu eklendi`:`${n} oyuncu lig yönetiminin onayına gönderildi`);if(!IS_ADMIN)loadMyPending();}
  catch(e){toast(n?`${n} oyuncu eklendi, kalanlar eklenemedi.`:errMsg(e));}
  finally{b.disabled=false;}
}
async function saveNews(){
  const title=$('#nTitle').value.trim(), body=$('#nBody').value.trim();
  if(!title||!body){toast('Başlık ve metni yazın.');return;}
  const doc={title,body,pinned:$('#nPin').checked,date:editNews?(DATA.news[editNews]?.date||new Date().toISOString()):new Date().toISOString()};
  const b=$('#nSave');b.disabled=true;
  try{
    await DB.aggSet('news','n',editNews||DB.newId(),doc);
    toast(editNews?'Duyuru güncellendi':'Duyuru yayınlandı');resetNewsForm();
  }catch(e){toast(errMsg(e));}finally{b.disabled=false;}
}
function resetNewsForm(){editNews=null;$('#nTitle').value='';$('#nBody').value='';$('#nPin').checked=false;$('#nFormTitle').textContent='Duyuru yayınla';$('#nSave').textContent='Yayınla';$('#nCancel').hidden=true;}
async function saveTeamInfo(){
  const t=$('#tTeam').value, b=$('#tSave');b.disabled=true;
  if(!IS_ADMIN){
    try{await submitPending('team',t,{captain:$('#tCaptain').value,coach:$('#tCoach').value.trim(),colors:$('#tColors').value.trim(),note:$('#tNote').value.trim(),logo:pendingLogo||''});pendingLogo=null;
      toast('Takım bilgileri lig yönetiminin onayına gönderildi');}
    catch(e){toast(errMsg(e));}finally{b.disabled=false;}
    return;
  }
  try{
    await DB.aggSet('teams','t',t,{team:t,captain:$('#tCaptain').value,coach:$('#tCoach').value.trim(),colors:$('#tColors').value.trim(),note:$('#tNote').value.trim()});
    if(pendingLogo){await DB.aggSet('logos','l',t,pendingLogo);LOGOS[slug(t)]=pendingLogo;pendingLogo=null;}
    toast(`${t} bilgileri kaydedildi`);scheduleRender();
  }catch(e){toast(errMsg(e));}finally{b.disabled=false;}
}
function showTab(name){
  $$('[data-atab]').forEach(x=>x.setAttribute('aria-pressed',x.dataset.atab===name));
  $$('[data-apane]').forEach(p=>p.hidden=p.dataset.apane!==name);
  if(name==='takimbilgi') teamInfoForm();
  if(name==='oyuncular') playerList();
  if(name==='hesaplar') accountsList();
  if(name==='onaylar'){approvalsList();nickAdminList(false);}
  if(name==='kadrolar') lineupMatches();
  if(name==='haftanin') weeklyForm();
  if(name==='galeri') galleryAdmin();
  if(name==='sponsorlar') sponsorList();
  if(name==='ayarlar'){const d=DATA.settings.discipline||{};$('#setY').value=d.yellowLimit??'';$('#setR').value=d.redBan??'';}
}
function applyRole(){
  const allowed=IS_ADMIN?['maclar','onaylar','kadrolar','oyuncular','takimbilgi','duyurular','haftanin','galeri','sponsorlar','hesaplar','ayarlar']:['oyuncular','kadrolar','takimbilgi'];
  $$('[data-atab]').forEach(b=>b.hidden=!allowed.includes(b.dataset.atab));
  ['#pTeam','#tTeam'].forEach(s=>{const el=$(s);if(MY_TEAM){el.value=MY_TEAM;el.disabled=true;}else el.disabled=false;});
  $('#pBanWrap').hidden=!IS_ADMIN;$('#lClear').hidden=!IS_ADMIN;pendingNote();
  $('#panelEyebrow').textContent=IS_ADMIN?'Yönetim paneli':'Takım paneli';
  $('#panelTitle').textContent=IS_ADMIN?'Lig yönetimi':`${MY_TEAM} takım paneli`;
  const cur=$$('[data-atab]').find(b=>b.getAttribute('aria-pressed')==='true');
  showTab(cur&&allowed.includes(cur.dataset.atab)?cur.dataset.atab:allowed[0]);
}
function initPanel(){
  teamOptions($('#aKoH'),true);teamOptions($('#aKoA'),true);teamOptions($('#pTeam'));teamOptions($('#tTeam'));
  $('#pTeam').value=MY_TEAM||'Alara';$('#tTeam').value=MY_TEAM||'Alara';initExtraPanel();initApprovals();
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
    try{const [full,thumb]=await Promise.all([resizeImage(f,320),resizeImage(f,96)]);pendingPhoto={full,thumb};setPhotoPrev(full);}catch(x){toast('Bu dosya açılamadı. JPG ya da PNG fotoğraf seçin.');e.target.value='';}});
  $('#pPhotoDel').addEventListener('click',()=>{pendingPhoto=null;$('#pPhoto').value='';setPhotoPrev(null);});
  $('#tLogo').addEventListener('change',async e=>{const f=e.target.files[0];if(!f)return;
    try{pendingLogo=await resizeImage(f,96);$('#tLogoPrev').style.backgroundImage=`url("${pendingLogo}")`;}catch(x){toast('Bu dosya açılamadı. JPG ya da PNG görsel seçin.');e.target.value='';}});
  $('#pList').addEventListener('click',async e=>{
    const ed=e.target.closest('[data-editp]');
    if(ed){const p=DATA.players[ed.dataset.editp];if(!p)return;editPlayer=ed.dataset.editp;pendingPhoto=undefined;$('#pPhoto').value='';
      $('#pName').value=p.name;$('#pNo').value=p.no||'';$('#pPos').value=p.pos||'';$('#pBan').value=p.ban||'';setPhotoPrev(PHOTOS[editPlayer]);
      $('#pFormTitle').textContent='Oyuncuyu düzenle';$('#pAdd').textContent='Güncelle';$('#pCancel').hidden=false;$('#pName').focus();return;}
    const b=e.target.closest('[data-delp]'); if(!b) return;
    if(!b.classList.contains('arm')){b.classList.add('arm');b.textContent='Emin misiniz?';setTimeout(()=>{b.classList.remove('arm');b.textContent='Sil'},4000);return;}
    const id=b.dataset.delp;
    if(!IS_ADMIN){try{await submitPending('playerDel',id,{});toast('Silme isteği lig yönetiminin onayına gönderildi');}catch(x){toast(errMsg(x));}return;}
    try{const pt=DATA.players[id]?.team;
      if(PHOTOS[id]&&pt){await DB.collection('photos').doc(id).delete();await DB.mapDel('tphotos',pt,'p',id);delete PHOTOS[id];delete PHOTO_FULL[id];}
      await DB.aggDelK('players','p',id);toast('Oyuncu silindi');if(editPlayer===id)resetPlayerForm();}catch(x){toast(errMsg(x));}
  });
  $('#nSave').addEventListener('click',saveNews);
  $('#nCancel').addEventListener('click',resetNewsForm);
  $('#nList').addEventListener('click',async e=>{
    const ed=e.target.closest('[data-editn]');
    if(ed){const n=DATA.news[ed.dataset.editn];if(!n)return;editNews=ed.dataset.editn;$('#nTitle').value=n.title;$('#nBody').value=n.body;$('#nPin').checked=!!n.pinned;
      $('#nFormTitle').textContent='Duyuruyu düzenle';$('#nSave').textContent='Güncelle';$('#nCancel').hidden=false;$('#nTitle').focus();return;}
    const b=e.target.closest('[data-deln]'); if(!b) return;
    if(!b.classList.contains('arm')){b.classList.add('arm');b.textContent='Emin misiniz?';setTimeout(()=>{b.classList.remove('arm');b.textContent='Sil'},4000);return;}
    try{await DB.aggDel('news','n',b.dataset.deln);toast('Duyuru silindi');if(editNews===b.dataset.deln)resetNewsForm();}catch(x){toast(errMsg(x));}
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
  const u=window.AML_AUTH?.user&&!window.AML_AUTH.user.isAnonymous?window.AML_AUTH.user:null;
  $('#adminBtnLbl').textContent=IS_ADMIN?'Yönetim':MY_TEAM?'Takım paneli':u?'Hesabım':'Giriş';
  $('#adminBtn').classList.toggle('on',PANEL_ON());
  updateAdminBadge();
  if(PANEL_ON()){
    if(!panelReady) initPanel();
    else if(IS_ADMIN){matchOptions();loadMatch();newsAdminList();}
    applyRole();
    if(window.AML_JUST_LOGGED){toast(IS_ADMIN?'Hoş geldiniz':`${MY_TEAM} takım paneline hoş geldiniz`);window.AML_JUST_LOGGED=false;ROLE_KNOWN=true;navigate('/yonetim');return;}
  }
  window.AML_JUST_LOGGED=false;
  ROLE_KNOWN=true;
  render();
}
const teamSelectHtml=(id,sel)=>`<select id="${id}" required><option value="">Mahalle seçin</option>${Object.entries(GROUPS).map(([g,ts])=>`<optgroup label="${g} Grubu">${ts.map(t=>`<option value="${esc(t)}"${t===sel?' selected':''}>${esc(t)}</option>`).join('')}</optgroup>`).join('')}</select>`;
let gateTab='login';
function openAdmin(){navigate(PANEL_ON()?'/yonetim':'/giris');}
function renderGate(){
  const g=$('#gate'), A=window.AML_AUTH; if(!g) return;
  if(!A){g.innerHTML=`<h3>Bağlantı kurulamadı</h3><p>Hesap sistemine şu an ulaşılamıyor. Sayfayı yenileyip tekrar deneyin.</p>`;return;}
  if(A.user&&!A.user.isAnonymous&&PANEL_ON()){g.innerHTML=`<h3>Giriş yapıldı</h3><p>${esc(A.user.email||'')} hesabıyla giriş yaptınız.</p><div class="row" style="margin-top:12px"><a class="btn" href="/yonetim">${IS_ADMIN?'Yönetim paneline git':'Takım paneline git'}</a><button type="button" class="btn ghost" id="gLogout">Çıkış yap</button></div>`;return;}
  if(A.user&&A.user.isAnonymous){/* taraftar oturumu: giriş formunu göster */}
  else if(A.user&&PENDING){
    g.innerHTML=`<h3>Başvurunuz inceleniyor</h3><p><b>${esc(PENDING.team)}</b> takım hesabı için başvurunuz lig yönetimine ulaştı. Onaylandığında bu sayfayı yenilediğinizde takım paneliniz açılacak.</p>
      <p class="hint" style="margin-top:8px">${esc(A.user.email||'')}</p><div class="row" style="margin-top:12px"><button type="button" class="btn ghost" id="gLogout">Çıkış yap</button></div>`;
    return;
  }
  if(A.user&&!A.user.isAnonymous){
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


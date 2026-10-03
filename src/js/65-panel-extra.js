/* ===================== Panel: yeni sekmeler ===================== */
function teamOptions(sel,withEmpty){
  sel.innerHTML=(withEmpty?'<option value="">Seçilmedi</option>':'')+Object.entries(GROUPS).map(([g,ts])=>`<optgroup label="${g} Grubu">${ts.map(t=>`<option value="${esc(t)}">${esc(t)}</option>`).join('')}</optgroup>`).join('');
}
/* En boy oranını koruyarak küçültür */
function resizeMax(file,max,limit){
  return new Promise((ok,fail)=>{
    if(!file||!/^image\//.test(file.type)){fail(new Error('type'));return;}
    const img=new Image(), url=URL.createObjectURL(file);
    img.onload=()=>{
      const k=Math.min(1,max/Math.max(img.naturalWidth,img.naturalHeight)), c=document.createElement('canvas');
      c.width=Math.round(img.naturalWidth*k);c.height=Math.round(img.naturalHeight*k);
      const x=c.getContext('2d');x.fillStyle='#fff';x.fillRect(0,0,c.width,c.height);x.drawImage(img,0,0,c.width,c.height);
      URL.revokeObjectURL(url);
      let q=.85,d=c.toDataURL('image/jpeg',q);
      while(d.length>limit&&q>.35){q-=.1;d=c.toDataURL('image/jpeg',q);}
      if(d.length>limit){fail(new Error('big'));return;}
      ok(d);
    };
    img.onerror=()=>{URL.revokeObjectURL(url);fail(new Error('decode'));};
    img.src=url;
  });
}
const armed=(b,label)=>{if(b.classList.contains('arm'))return true;b.classList.add('arm');b.textContent='Emin misiniz?';setTimeout(()=>{b.classList.remove('arm');b.textContent=label},4000);return false};

/* ---------- Maç kadroları ---------- */
let lineDraft={};
function lineupMatches(){
  const ms=everyMatch().filter(m=>m.h&&m.a&&(IS_ADMIN||m.h===MY_TEAM||m.a===MY_TEAM)).sort(byTime);
  const cur=$('#lMatch').value;
  $('#lMatch').innerHTML=ms.length?ms.map(m=>`<option value="${m.id}">${fmt(m.d).dm} ${m.t||''} · ${esc(m.h)} – ${esc(m.a)}${status(m.id)==='done'?' ✓':''}</option>`).join(''):'<option value="">Maç yok</option>';
  if(cur&&ms.some(m=>m.id===cur)) $('#lMatch').value=cur;
  else{const nx=ms.find(m=>status(m.id)!=='done');if(nx)$('#lMatch').value=nx.id;}
  lineupTeams();
}
function lineupTeams(){
  const m=matchInfo($('#lMatch').value);
  if(!m){$('#lTeam').innerHTML='';$('#lList').innerHTML='';return;}
  const opts=IS_ADMIN?[m.h,m.a]:[MY_TEAM];
  const cur=$('#lTeam').value;
  $('#lTeam').innerHTML=opts.map(t=>`<option value="${esc(t)}">${esc(t)}</option>`).join('');
  if(opts.includes(cur)) $('#lTeam').value=cur;
  loadLineupDraft();
}
async function loadLineupDraft(){
  const mid=$('#lMatch').value, t=$('#lTeam').value; if(!mid||!t) return;
  lineDraft={};
  try{const d=await DB.get('lineups',`${mid}__${t}`);if(d){d.start.forEach(p=>lineDraft[p]='start');d.subs.forEach(p=>lineDraft[p]='sub');}}catch(e){}
  lineupList();
}
function lineupList(){
  const t=$('#lTeam').value, sq=squadOf(t);
  const n=k=>Object.values(lineDraft).filter(v=>v===k).length;
  $('#lCount').textContent=sq.length?`İlk kadro: ${n('start')} · Yedek: ${n('sub')}`:'';
  $('#lList').innerHTML=sq.length?sq.map(([id,p])=>`<li><b>${p.no||'–'}</b><span>${esc(p.name)} <small class="muted">${esc(p.pos||'')}</small></span>
    <span class="seg" role="group" aria-label="${esc(p.name)}">${[['start','İlk'],['sub','Yedek'],['','Yok']].map(([v,l])=>`<button type="button" data-lp="${id}" data-lv="${v}" aria-pressed="${(lineDraft[id]||'')===v}">${l}</button>`).join('')}</span></li>`).join('')
    :`<li><span class="muted">${esc(t)} kadrosunda oyuncu yok. Önce Oyuncular sekmesinden ekleyin.</span></li>`;
}
async function saveLineup(){
  const mid=$('#lMatch').value, t=$('#lTeam').value; if(!mid||!t) return;
  const order=squadOf(t).map(([id])=>id);
  const start=order.filter(id=>lineDraft[id]==='start'), subs=order.filter(id=>lineDraft[id]==='sub');
  if(!start.length){toast('İlk kadroya en az bir oyuncu seçin.');return;}
  if(start.length>16||subs.length>20){toast('Kadro çok kalabalık: en fazla 16 ilk, 20 yedek.');return;}
  try{await DB.collection('lineups').doc(`${mid}__${t}`).set({match:mid,team:t,start,subs,updated:new Date().toISOString()});
    delete LINEUPS[mid];toast(`${t} kadrosu kaydedildi`);}catch(e){toast(errMsg(e));}
}

/* ---------- Haftanın ---------- */
let weekDraft={team:[]}, PL_BY_LABEL={};
const plLabel=(id,p)=>`${p.name} — ${p.team}${p.no?' #'+p.no:''}`;
function weeklyForm(){
  if(!$('#wPer').options.length) $('#wPer').innerHTML=PERIODS.map(([n,l])=>`<option value="${n}">${l}</option>`).join('');
  PL_BY_LABEL={};
  $('#wPlayers').innerHTML=Object.entries(DATA.players).map(([id,p])=>{const l=plLabel(id,p);PL_BY_LABEL[l]=id;return `<option value="${esc(l)}"></option>`}).join('');
  const W=DATA.weekly[$('#wPer').value]||{};
  weekDraft={team:[...(W.team||[])]};
  const g=W.goal||{};
  $('#wGoalP').value=g.p&&DATA.players[g.p]?plLabel(g.p,DATA.players[g.p]):'';
  $('#wGoalMin').value=g.minute||'';$('#wGoalVideo').value=g.video||'';$('#wGoalNote').value=g.note||'';$('#wNote').value=W.note||'';
  $('#wGoalM').innerHTML='<option value="">Seçilmedi</option>'+everyMatch().filter(m=>status(m.id)==='done').sort(byTime).reverse().map(m=>`<option value="${m.id}">${fmt(m.d).dm} · ${esc(m.h)} – ${esc(m.a)}</option>`).join('');
  $('#wGoalM').value=g.match||'';
  weekTeamList();
}
function weekTeamList(){
  $('#wTeam').innerHTML=weekDraft.team.length?weekDraft.team.map((id,i)=>`<li><span>${i+1}. <b>${esc(pName(id))}</b> <small class="muted">${esc(DATA.players[id]?.team||'')}</small></span><button type="button" data-wdel="${i}">Çıkar</button></li>`).join('')
    :'<li><span class="muted">Henüz oyuncu eklenmedi.</span></li>';
}
async function saveWeekly(){
  const n=$('#wPer').value, gp=PL_BY_LABEL[$('#wGoalP').value.trim()]||'';
  if($('#wGoalP').value.trim()&&!gp){toast('Golü atan oyuncuyu listeden seçin.');return;}
  const video=$('#wGoalVideo').value.trim(); if(video&&!/^https:\/\//.test(video)){toast('Video bağlantısı https:// ile başlamalı.');return;}
  const doc={team:weekDraft.team,note:$('#wNote').value.trim(),goal:gp?{p:gp,match:$('#wGoalM').value,minute:parseInt($('#wGoalMin').value,10)||null,video,note:$('#wGoalNote').value.trim()}:null,updated:new Date().toISOString()};
  try{await DB.aggSet('misc','weekly',String(n),doc);toast('Haftanın seçimleri kaydedildi');}catch(e){toast(errMsg(e));}
}

/* ---------- Galeri ---------- */
function galleryAdmin(){
  if(GALLERY==null||GALLERY==='error') loadGallery().then(()=>{if(!$('[data-apane="galeri"]').hidden)galleryAdmin();});
  const list=Array.isArray(GALLERY)?GALLERY:[];
  $('#gAlbums').innerHTML=[...new Set(list.map(([,g])=>g.album).filter(Boolean))].map(a=>`<option value="${esc(a)}"></option>`).join('');
  if(!$('#gMatch').options.length) $('#gMatch').innerHTML='<option value="">Seçilmedi</option>'+everyMatch().filter(m=>m.h&&m.a).sort(byTime).map(m=>`<option value="${m.id}">${fmt(m.d).dm} · ${esc(m.h)} – ${esc(m.a)}</option>`).join('');
  $('#gList').innerHTML=list.length?list.map(([id,g])=>`<figure><img src="${g.thumb}" alt=""><figcaption>${esc(g.album||'Genel')}${g.caption?' · '+esc(g.caption):''}</figcaption><button type="button" data-gdel="${id}">Sil</button></figure>`).join('')
    :`<p class="hint">${GALLERY==='loading'?'Yükleniyor…':'Henüz fotoğraf yok.'}</p>`;
}
async function uploadGallery(){
  const files=[...$('#gFiles').files]; if(!files.length){toast('Önce fotoğraf seçin.');return;}
  const b=$('#gUpload');b.disabled=true;let n=0;
  for(const f of files){
    $('#gProg').textContent=`${n+1}/${files.length} yükleniyor…`;
    try{
      const [full,thumb]=await Promise.all([resizeMax(f,1600,850000),resizeMax(f,480,55000)]);
      const ref=await DB.collection('gallery').add({thumb,album:$('#gAlbum').value.trim()||'Genel',caption:$('#gCaption').value.trim(),match:$('#gMatch').value,date:new Date().toISOString()});
      await DB.collection('galleryFull').doc(ref.id).set({data:full});n++;
    }catch(e){toast(`${f.name} yüklenemedi.`);}
  }
  $('#gProg').textContent=`${n} fotoğraf yüklendi.`;$('#gFiles').value='';b.disabled=false;GALLERY=null;galleryAdmin();
}

/* ---------- Sponsorlar ---------- */
let editSponsor=null, pendingSLogo=undefined;
function sponsorList(){
  const list=Object.entries(DATA.sponsors).sort((a,b)=>(a[1].tier||3)-(b[1].tier||3));
  $('#sList').innerHTML=list.length?list.map(([id,s])=>`<li>${s.logo?`<img src="${s.logo}" alt="" style="width:40px;height:28px;object-fit:contain;background:#fff;border-radius:4px">`:''}<span><b>${esc(s.name)}</b> <small class="muted">${['','Ana sponsor','Sponsor','Destekçi'][s.tier||3]}</small></span><button type="button" data-sedit="${id}">Düzenle</button><button type="button" data-sdel="${id}">Sil</button></li>`).join('')
    :'<li><span class="muted">Henüz sponsor yok.</span></li>';
}
function resetSponsor(){editSponsor=null;pendingSLogo=undefined;['#sName','#sUrl','#sLogo'].forEach(s=>$(s).value='');$('#sTier').value='3';$('#sLogoPrev').style.backgroundImage='';$('#sFormTitle').textContent='Sponsor ekle';$('#sCancel').hidden=true;}
async function saveSponsor(){
  const name=$('#sName').value.trim(), url=$('#sUrl').value.trim();
  if(!name){toast('Sponsor adını yazın.');return;}
  if(url&&!/^https:\/\//.test(url)){toast('Web sitesi https:// ile başlamalı.');return;}
  const old=editSponsor?DATA.sponsors[editSponsor]:{};
  const doc={name,url,tier:+$('#sTier').value,logo:pendingSLogo!==undefined?(pendingSLogo||''):(old.logo||'')};
  try{if(editSponsor)await DB.collection('sponsors').doc(editSponsor).set(doc);else await DB.collection('sponsors').add(doc);toast('Sponsor kaydedildi');resetSponsor();}catch(e){toast(errMsg(e));}
}

function initExtraPanel(){
  $('#lMatch').addEventListener('change',lineupTeams);
  $('#lTeam').addEventListener('change',loadLineupDraft);
  $('#lList').addEventListener('click',e=>{const b=e.target.closest('[data-lp]');if(!b)return;const v=b.dataset.lv;if(v)lineDraft[b.dataset.lp]=v;else delete lineDraft[b.dataset.lp];lineupList();});
  $('#lSave').addEventListener('click',saveLineup);
  $('#lClear').addEventListener('click',async e=>{if(!armed(e.target,'Kadroyu sil'))return;try{await DB.collection('lineups').doc(`${$('#lMatch').value}__${$('#lTeam').value}`).delete();delete LINEUPS[$('#lMatch').value];lineDraft={};lineupList();toast('Kadro silindi');}catch(x){toast(errMsg(x));}});
  $('#wPer').addEventListener('change',weeklyForm);
  const addW=()=>{const id=PL_BY_LABEL[$('#wAdd').value.trim()];if(!id){toast('Oyuncuyu listeden seçin.');return;}if(weekDraft.team.includes(id)){toast('Bu oyuncu zaten listede.');return;}if(weekDraft.team.length>=16){toast('En fazla 16 oyuncu ekleyebilirsiniz.');return;}weekDraft.team.push(id);$('#wAdd').value='';weekTeamList();};
  $('#wAddBtn').addEventListener('click',addW);
  $('#wAdd').addEventListener('keydown',e=>{if(e.key==='Enter'){e.preventDefault();addW();}});
  $('#wTeam').addEventListener('click',e=>{const b=e.target.closest('[data-wdel]');if(!b)return;weekDraft.team.splice(+b.dataset.wdel,1);weekTeamList();});
  $('#wSave').addEventListener('click',saveWeekly);
  $('#wClear').addEventListener('click',async e=>{if(!armed(e.target,'Bu dönemi sil'))return;try{await DB.aggDel('misc','weekly',String($('#wPer').value));toast('Silindi');weeklyForm();}catch(x){toast(errMsg(x));}});
  $('#gUpload').addEventListener('click',uploadGallery);
  $('#gList').addEventListener('click',async e=>{const b=e.target.closest('[data-gdel]');if(!b||!armed(b,'Sil'))return;const id=b.dataset.gdel;
    try{await DB.collection('galleryFull').doc(id).delete();await DB.collection('gallery').doc(id).delete();GALLERY=GALLERY.filter(x=>x[0]!==id);galleryAdmin();toast('Fotoğraf silindi');}catch(x){toast(errMsg(x));}});
  $('#sLogo').addEventListener('change',async e=>{const f=e.target.files[0];if(!f)return;try{pendingSLogo=await resizeMax(f,400,140000);$('#sLogoPrev').style.backgroundImage=`url("${pendingSLogo}")`;}catch(x){toast('Bu dosya açılamadı.');e.target.value='';}});
  $('#sSave').addEventListener('click',saveSponsor);
  $('#sCancel').addEventListener('click',resetSponsor);
  $('#sList').addEventListener('click',async e=>{
    const ed=e.target.closest('[data-sedit]');
    if(ed){const s=DATA.sponsors[ed.dataset.sedit];editSponsor=ed.dataset.sedit;pendingSLogo=undefined;$('#sName').value=s.name;$('#sUrl').value=s.url||'';$('#sTier').value=s.tier||3;$('#sLogoPrev').style.backgroundImage=s.logo?`url("${s.logo}")`:'';$('#sFormTitle').textContent='Sponsoru düzenle';$('#sCancel').hidden=false;return;}
    const b=e.target.closest('[data-sdel]');if(!b||!armed(b,'Sil'))return;
    try{await DB.collection('sponsors').doc(b.dataset.sdel).delete();toast('Sponsor silindi');if(editSponsor===b.dataset.sdel)resetSponsor();}catch(x){toast(errMsg(x));}
  });
  $('#setSave').addEventListener('click',async()=>{
    const y=Math.max(0,Math.min(10,parseInt($('#setY').value,10)||0)), r=Math.max(0,Math.min(5,parseInt($('#setR').value,10)||0));
    try{await DB.aggSet('misc','settings','discipline',{yellowLimit:y,redBan:r});toast('Disiplin kuralı kaydedildi');}catch(e){toast(errMsg(e));}
  });
}

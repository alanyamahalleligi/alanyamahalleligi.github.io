/* ===================== Yönlendirme ===================== */
let DATA_NOTE='Sonuçlar yükleniyor…', LOADED=false;
PAGES.giris=()=>`<div class="wrap page narrow"><div class="gate" id="gate"></div></div>`;
PAGES.yonetim=()=>ROLE_KNOWN?'':PAGES.loading();
const ROUTES=[
  [/^\/$/,'home','Alanya Mahalle Ligi'],
  [/^\/fikstur$/,'fikstur','Fikstür'],
  [/^\/gruplar$/,'gruplar','Gruplar'],
  [/^\/grup\/([a-h])$/i,'grup',m=>`${m[1].toUpperCase()} Grubu`],
  [/^\/istatistik$/,'istatistik','İstatistik'],
  [/^\/takimlar$/,'takimlar','Takımlar'],
  [/^\/takim\/([a-z0-9-]+)$/,'takim',m=>TEAM_BY_SLUG[m[1]]||'Takım'],
  [/^\/oyuncu\/([\w-]+)$/,'oyuncu',m=>DATA.players[m[1]]?.name||'Oyuncu'],
  [/^\/mac\/([\w-]+)$/,'mac',m=>{const x=matchInfo(m[1]);return x?`${hName(x)||x.ko?.h} – ${aName(x)||x.ko?.a}`:'Maç'}],
  [/^\/final$/,'final','Final yolu'],
  [/^\/tahmin$/,'tahmin','Tahmin oyunu'],
  [/^\/haftanin$/,'haftanin','Haftanın kadrosu ve golü'],
  [/^\/galeri$/,'galeri','Galeri'],
  [/^\/disiplin$/,'disiplin','Disiplin'],
  [/^\/duyurular$/,'duyurular','Duyurular'],
  [/^\/duyuru\/([\w-]+)$/,'duyuru',m=>DATA.news[m[1]]?.title||'Duyuru'],
  [/^\/sponsorlar$/,'sponsorlar','Sponsorlar'],
  [/^\/bilgi$/,'bilgi','Bilgi ve SSS'],
  [/^\/giris$/,'giris','Giriş'],
  [/^\/yonetim$/,'yonetim','Yönetim'],
];
let CUR={key:'home',args:[],path:'/'};
function matchRoute(path){
  path=path.replace(/\/+$/,'')||'/';
  for(const[re,key,title] of ROUTES){const m=path.match(re);if(m)return {key,args:m.slice(1),path,title:typeof title==='function'?title(m):title};}
  return {key:'notfound',args:[],path,title:'Sayfa bulunamadı'};
}
function render(){
  CUR=matchRoute(location.pathname);
  const view=$('#view'), panel=$('#yonetim');
  if(CUR.key==='yonetim'&&ROLE_KNOWN&&!PANEL_ON()){navigate('/giris',true);return;}
  const showPanel=CUR.key==='yonetim'&&PANEL_ON();
  panel.hidden=!showPanel;
  view.hidden=showPanel;
  if(!showPanel) view.innerHTML=(PAGES[CUR.key]||PAGES.notfound)(...CUR.args);
  document.title=CUR.key==='home'?'Alanya Mahalle Ligi':`${CUR.title} · Alanya Mahalle Ligi`;
  $$('nav.links a').forEach(a=>{const on=CUR.path===a.getAttribute('href')||CUR.path.startsWith(a.getAttribute('href')+'/')||(a.getAttribute('href')==='/gruplar'&&CUR.key==='grup')||(a.getAttribute('href')==='/takimlar'&&(CUR.key==='takim'||CUR.key==='oyuncu'))||(a.getAttribute('href')==='/duyurular'&&CUR.key==='duyuru')||(a.getAttribute('href')==='/fikstur'&&CUR.key==='mac');a.toggleAttribute('aria-current',on);if(on)a.setAttribute('aria-current','page');});
  if(CUR.key==='giris') renderGate();
  if(showPanel&&panelReady){if(IS_ADMIN){adminSides();renderDraft();newsAdminList();accountsList();}playerList();}
}
let renderT=null, renderPending=false;
function scheduleRender(){
  clearTimeout(renderT);
  renderT=setTimeout(()=>{
    const a=document.activeElement;
    if(a&&$('#view').contains(a)&&/^(INPUT|SELECT|TEXTAREA)$/.test(a.tagName)){renderPending=true;return;}
    renderPending=false; render();
  },40);
}
document.addEventListener('focusout',()=>{if(renderPending)setTimeout(()=>{const a=document.activeElement;if(!(a&&$('#view').contains(a)&&/^(INPUT|SELECT|TEXTAREA)$/.test(a.tagName))){renderPending=false;render();}},150);});
function navigate(path,replace){
  if(path!==location.pathname){replace?history.replaceState(null,'',path):history.pushState(null,'',path);}
  closeLightbox(); render(); window.scrollTo(0,0);
  $('#view').focus({preventScroll:true});
}
window.addEventListener('popstate',render);
function closeLightbox(){const d=$('#lightbox');if(d&&d.open)d.close();}

/* ===================== Tıklamalar ===================== */
document.addEventListener('click',async e=>{
  const a=e.target.closest('a[href]');
  if(a&&!a.target&&!e.ctrlKey&&!e.metaKey&&!e.shiftKey&&e.button===0){
    const href=a.getAttribute('href');
    if(href.startsWith('/')&&!href.startsWith('//')){e.preventDefault();navigate(href);return;}
  }
  const t=e.target;
  if(t.id==='gLogout'||t.id==='adminLogout'){await window.AML_AUTH?.logout();gateTab='login';toast('Çıkış yapıldı');navigate('/');return;}
  if(t.id==='lReset'){const em=$('#lEmail').value.trim();if(!em){$('#gErr').textContent='Önce e-posta adresinizi yazın.';return;}
    try{await window.AML_AUTH.reset(em);$('#gErr').textContent='Şifre sıfırlama bağlantısı e-postanıza gönderildi.';}catch(x){$('#gErr').textContent='Bağlantı gönderilemedi. Adresi kontrol edin.';}return;}
  if(t.id==='nickSave'){saveNick();return;}
  const q=(sel)=>t.closest(sel);
  let el;
  if(el=q('[data-gtab]')){gateTab=el.dataset.gtab;renderGate();$('#gate input')?.focus();return;}
  if(el=q('[data-tur]')){fx.tur=+el.dataset.tur;render();return;}
  if(el=q('[data-gf]')){fx.g=el.dataset.gf;render();return;}
  if(el=q('[data-print]')){window.print();return;}
  if(el=q('[data-follow]')){toggleFollow(el.dataset.follow);return;}
  if(el=q('[data-teamics]')){const tm=el.dataset.teamics;downloadIcs(teamMatches(tm).filter(m=>m.h&&m.a),`${slug(tm)}-fikstur`);return;}
  if(el=q('[data-tshare]')){share(`${el.dataset.tshare} · Alanya Mahalle Ligi`,`/takim/${slug(el.dataset.tshare)}`);return;}
  if(el=q('[data-pshare]')){const p=DATA.players[el.dataset.pshare];if(p)share(`${p.name} · ${p.team} · Alanya Mahalle Ligi`,`/oyuncu/${el.dataset.pshare}`);return;}
  if(el=q('[data-nshare]')){const n=DATA.news[el.dataset.nshare];share(`${n?.title||'Duyuru'} · Alanya Mahalle Ligi`,`/duyuru/${el.dataset.nshare}`);return;}
  if(el=q('[data-ics]')){const m=matchInfo(el.dataset.ics);downloadIcs([m],`${slug(hName(m)||'mac')}-${slug(aName(m)||'')}`);return;}
  if(el=q('[data-share]')){const m=matchInfo(el.dataset.share);share(`${hName(m)||m.ko?.h} - ${aName(m)||m.ko?.a} · Alanya Mahalle Ligi`,`/mac/${m.id}`);return;}
  if(el=q('[data-vote]')){castVote(el.dataset.vote);return;}
  if(el=q('[data-pred]')){savePred(el.dataset.pred);return;}
  if(el=q('[data-week]')){weekSel=+el.dataset.week;render();return;}
  if(el=q('[data-album]')){galAlbum=el.dataset.album;render();return;}
  if(el=q('[data-photo]')){openPhoto(el.dataset.photo);return;}
  if(el=q('[data-galretry]')){GALLERY=null;render();return;}
  if(el=q('[data-ssort]')){const k=el.dataset.ssort;statSort.dir=statSort.k===k?-statSort.dir:(k==='t'?1:-1);statSort.k=k;render();return;}
  if(el=q('[data-close]')){closeLightbox();return;}
});
$('#lightbox').addEventListener('click',e=>{if(e.target===e.currentTarget)closeLightbox();});
document.addEventListener('input',e=>{
  if(e.target.id==='q'){fx.q=low(e.target.value.trim());$('#fixture').innerHTML=fixtureList();}
});
$('#adminBtn').addEventListener('click',openAdmin);

/* ===================== Tema ===================== */
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

/* ===================== Açılış ===================== */
// Eski #mac/... bağlantılarını yeni adreslere çevir
{const h=decodeURIComponent(location.hash.slice(1));const m=h.match(/^(mac|takim|oyuncu)\/(.+)$/);
  if(m) history.replaceState(null,'',`/${m[1]}/${m[2]}`);
  else if(/^(gruplar|fikstur|istatistik|takimlar|final|duyurular|bilgi)$/.test(h)) history.replaceState(null,'',`/${h}`);}
render();
loadWeather();

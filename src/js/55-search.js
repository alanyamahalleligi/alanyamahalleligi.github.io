/* ===================== Site içi arama ===================== */
function searchResults(q){
  q=low(q.trim()); if(q.length<2) return '<p class="hint">En az 2 harf yazın: mahalle, oyuncu, maç ya da duyuru.</p>';
  const teams=Object.keys(TEAM_G).filter(t=>low(t).includes(q)).slice(0,6);
  const players=Object.entries(DATA.players).filter(([,p])=>low(p.name).includes(q)).slice(0,8);
  const matches=everyMatch().filter(m=>m.h&&m.a&&(low(m.h).includes(q)||low(m.a).includes(q))).sort(byTime).slice(0,8);
  const news=Object.entries(DATA.news).filter(([,n])=>low(n.title).includes(q)||low(n.body||'').includes(q)).slice(0,4);
  if(!teams.length&&!players.length&&!matches.length&&!news.length) return `<p class="hint">"${esc(q)}" için sonuç bulunamadı. Yazımı kontrol edin ya da daha kısa bir kelime deneyin.</p>`;
  const sec=(title,items)=>items.length?`<h3 class="minihead">${title}</h3><div class="sres">${items.join('')}</div>`:'';
  return sec('Takımlar',teams.map(t=>`<a href="/takim/${slug(t)}">${teamBadge(t,'sm')}<span>${esc(t)}<small>${TEAM_G[t]} Grubu</small></span></a>`))
    +sec('Oyuncular',players.map(([id,p])=>`<a href="/oyuncu/${id}">${avatar(id,p.name)}<span>${esc(p.name)}<small>${esc(p.team)}${p.no?' · #'+p.no:''}${p.pos?' · '+esc(p.pos):''}</small></span></a>`))
    +sec('Maçlar',matches.map(m=>{const s=shown(m.id);return `<a href="/mac/${m.id}"><span>${esc(m.h)} ${s?s.join('–'):'–'} ${esc(m.a)}<small>${fmt(m.d).dm} ${m.t||''} · ${mLabel(m)}</small></span></a>`}))
    +sec('Duyurular',news.map(([id,n])=>`<a href="/duyuru/${id}"><span>${esc(n.title)}<small>${fmtDate(n.date)}</small></span></a>`));
}
function openSearch(){
  const d=$('#searchBox'); if(d.open) return;
  d.innerHTML=`<div class="sbox"><label class="fld"><span>Sitede ara</span><input id="sq" type="search" placeholder="Mahalle, oyuncu ya da maç…" autocomplete="off"></label><button type="button" class="btn sm line" data-sclose>Kapat</button></div><div id="sres">${searchResults('')}</div>`;
  try{d.showModal()}catch(e){d.setAttribute('open','')}
  $('#sq').focus();
}
function closeSearch(){const d=$('#searchBox');if(d&&d.open)d.close();}

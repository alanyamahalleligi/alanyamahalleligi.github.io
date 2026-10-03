const B='https://www.gstatic.com/firebasejs/10.12.2/';
const C=window.AML_CONFIG||{};
if(!C.firebase||!C.firebase.apiKey){
  DATA_NOTE='Canlı sonuç sistemi henüz bağlanmadı.';scheduleRender();
}else{
  try{
    const [{initializeApp},F,Au]=await Promise.all([import(B+'firebase-app.js'),import(B+'firebase-firestore.js'),import(B+'firebase-auth.js')]);
    const app=initializeApp(C.firebase), fs=F.getFirestore(app), auth=Au.getAuth(app);
    auth.languageCode='tr';
    DB={collection:c=>({
      doc:id=>({set:d=>F.setDoc(F.doc(fs,c,id),d),delete:()=>F.deleteDoc(F.doc(fs,c,id))}),
      add:d=>F.addDoc(F.collection(fs,c),d),
      onSnapshot:(n,e)=>F.onSnapshot(F.collection(fs,c),n,e)}),
      get:async(c,id)=>{const s=await F.getDoc(F.doc(fs,c,id));return s.exists()?s.data():null},
      list:async c=>{const s=await F.getDocs(F.collection(fs,c));return s.docs.map(d=>[d.id,d.data()])},
      where:async(c,f,v)=>{const s=await F.getDocs(F.query(F.collection(fs,c),F.where(f,'==',v)));return s.docs.map(d=>[d.id,d.data()])},
      // Sayfalı okuma (galeri): en yeni önce, n belge
      page:async(c,field,n,after)=>{const q=after?F.query(F.collection(fs,c),F.orderBy(field,'desc'),F.startAfter(after),F.limit(n)):F.query(F.collection(fs,c),F.orderBy(field,'desc'),F.limit(n));
        const s=await F.getDocs(q);return {rows:s.docs.map(d=>[d.id,d.data()]),last:s.docs[s.docs.length-1]||null,more:s.docs.length===n}},
      // Bir belgenin içindeki haritada tek bir anahtarı yazar/siler (toplu belgeler)
      mapSet:(c,id,field,key,val)=>F.updateDoc(F.doc(fs,c,id),new F.FieldPath(field,key),val),
      mapDel:(c,id,field,key)=>F.updateDoc(F.doc(fs,c,id),new F.FieldPath(field,key),F.deleteField()),
      aggSet:(id,field,key,val)=>F.updateDoc(F.doc(fs,'agg',id),new F.FieldPath(field,key),val),
      aggDel:(id,field,key)=>F.updateDoc(F.doc(fs,'agg',id),new F.FieldPath(field,key),F.deleteField()),
      // Oyuncu yazarken kurallar için değişen anahtar "lk" alanına da yazılır
      aggSetK:(id,field,key,val)=>F.updateDoc(F.doc(fs,'agg',id),new F.FieldPath(field,key),val,'lk',key),
      aggDelK:(id,field,key)=>F.updateDoc(F.doc(fs,'agg',id),new F.FieldPath(field,key),F.deleteField(),'lk',key),
      merge:(c,id,data)=>F.setDoc(F.doc(fs,c,id),data,{merge:true}),
      newId:()=>F.doc(F.collection(fs,'_')).id};
    window.AML_AUTH={user:null,
      login:(e,p)=>Au.signInWithEmailAndPassword(auth,e,p),
      signup:(e,p)=>Au.createUserWithEmailAndPassword(auth,e,p),
      anon:async()=>{const c=await Au.signInAnonymously(auth);window.AML_AUTH.user=c.user;return c.user},
      logout:()=>Au.signOut(auth),
      reset:e=>Au.sendPasswordResetEmail(auth,e)};
    const admins=C.admins||[];
    let adminSubs=[];
    Au.onAuthStateChanged(auth,async u=>{
      window.AML_AUTH.user=u;
      adminSubs.forEach(f=>f());adminSubs=[];
      if(FAN&&(!u||FAN.uid!==u.uid)) FAN=null;
      let role={admin:false,team:null,pending:null};
      if(u&&!u.isAnonymous){
        if(admins.includes(u.uid)) role.admin=true;
        else{
          try{const m=await DB.get('managers',u.uid);if(m&&TEAM_G[m.team])role.team=m.team;}catch(e){}
          if(!role.team){try{role.pending=await DB.get('requests',u.uid);}catch(e){}}
        }
      }
      if(role.admin){
        ['requests','managers'].forEach(k=>adminSubs.push(DB.collection(k).onSnapshot(s=>{DATA[k]=Object.fromEntries(s.docs.map(d=>[d.id,d.data()]));if(panelReady)accountsList();updateAdminBadge();},()=>{})));
      }
      if(u) loadFan();
      setRole(role);
    });

    // Ziyaretçi başına okuma: agg koleksiyonundaki ~12 toplu belge + sponsorlar
    const loaded=new Set();
    const done=()=>{if(loaded.has('agg')&&loaded.has('sponsors')){LOADED=true;const n=Object.keys(DATA.matches).filter(id=>status(id)==='done').length;
      DATA_NOTE=n?`${n} maçın sonucu işlendi · canlı güncelleniyor`:'Sonuçlar maçlar oynandıkça burada canlı güncellenir';}};
    const fail=k=>err=>{console.error(k,err);DATA_NOTE='Veriler şu an alınamıyor. Sayfayı yenileyin.';scheduleRender();};
    let firstAgg=true;
    DB.collection('agg').onSnapshot(s=>{
      const matches={};
      s.docs.forEach(d=>{
        const x=d.data(), id=d.id;
        if(id.startsWith('m-')) Object.assign(matches,x.m||{});
        else if(id==='players') DATA.players=x.p||{};
        else if(id==='teams') DATA.teams=Object.fromEntries(Object.entries(x.t||{}).map(([name,v])=>[slug(name),v]));
        else if(id==='logos'){Object.keys(LOGOS).forEach(k=>delete LOGOS[k]);Object.entries(x.l||{}).forEach(([name,v])=>{LOGOS[slug(name)]=v});}
        else if(id==='news') DATA.news=x.n||{};
        else if(id==='misc'){DATA.weekly=x.weekly||{};DATA.settings=x.settings||{};}
        else if(id==='board'){BOARD=Array.isArray(x.top)?x.top:[];BOARD_AT=x.updated||'';}
      });
      if(!firstAgg) notifyChanges(DATA.matches,matches);
      firstAgg=false;
      DATA.matches=matches;loaded.add('agg');done();
      scheduleRender();
      if(IS_ADMIN&&panelReady)matchOptions();
    },fail('agg'));
    DB.collection('sponsors').onSnapshot(s=>{DATA.sponsors=Object.fromEntries(s.docs.map(d=>[d.id,d.data()]));loaded.add('sponsors');done();scheduleRender();},fail('sponsors'));
  }catch(e){
    console.error(e);
    DATA_NOTE='Canlı sonuç sistemine bağlanılamadı. Sayfayı yenileyin.';scheduleRender();
  }
}

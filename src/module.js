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
      where:async(c,f,v)=>{const s=await F.getDocs(F.query(F.collection(fs,c),F.where(f,'==',v)));return s.docs.map(d=>[d.id,d.data()])}};
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
    const loaded=new Set(), NEED=['players','matches','news','teams','sponsors','weekly','settings'];
    const done=()=>{if(NEED.every(k=>loaded.has(k))){LOADED=true;const n=Object.keys(DATA.matches).filter(id=>status(id)==='done').length;
      DATA_NOTE=n?`${n} maçın sonucu işlendi · canlı güncelleniyor`:'Sonuçlar maçlar oynandıkça burada canlı güncellenir';}};
    let firstMatches=true;
    NEED.forEach(k=>DB.collection(k).onSnapshot(s=>{
        const next=Object.fromEntries(s.docs.map(d=>[d.id,d.data()]));
        if(k==='matches'&&!firstMatches) notifyChanges(DATA.matches,next);
        if(k==='matches') firstMatches=false;
        DATA[k]=next;loaded.add(k);done();
        if(k==='matches'){Object.keys(VOTES).forEach(id=>{if(VOTES[id]!=='loading'&&status(id)==='done'&&!VOTES[id].total)delete VOTES[id];});}
        scheduleRender();
        if(IS_ADMIN&&panelReady&&k==='matches')matchOptions();
      },
      err=>{console.error(k,err);DATA_NOTE='Veriler şu an alınamıyor. Sayfayı yenileyin.';scheduleRender();}));
  }catch(e){
    console.error(e);
    DATA_NOTE='Canlı sonuç sistemine bağlanılamadı. Sayfayı yenileyin.';scheduleRender();
  }
}

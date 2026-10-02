const B='https://www.gstatic.com/firebasejs/10.12.2/';
const C=window.AML_CONFIG||{};
if(!C.firebase||!C.firebase.apiKey){
  $('#dataNote').textContent='Canlı sonuç sistemi henüz bağlanmadı.';
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
      where:async(c,f,v)=>{const s=await F.getDocs(F.query(F.collection(fs,c),F.where(f,'==',v)));return s.docs.map(d=>[d.id,d.data()])}};
    window.AML_AUTH={user:null,
      login:(e,p)=>Au.signInWithEmailAndPassword(auth,e,p),
      signup:(e,p)=>Au.createUserWithEmailAndPassword(auth,e,p),
      logout:()=>Au.signOut(auth),
      reset:e=>Au.sendPasswordResetEmail(auth,e)};
    const admins=C.admins||[];
    let adminSubs=[];
    Au.onAuthStateChanged(auth,async u=>{
      window.AML_AUTH.user=u;
      adminSubs.forEach(f=>f());adminSubs=[];
      let role={admin:false,team:null,pending:null};
      if(u){
        if(admins.includes(u.uid)) role.admin=true;
        else{
          try{const m=await DB.get('managers',u.uid);if(m&&TEAM_G[m.team])role.team=m.team;}catch(e){}
          if(!role.team){try{role.pending=await DB.get('requests',u.uid);}catch(e){}}
        }
      }
      if(role.admin){
        ['requests','managers'].forEach(k=>adminSubs.push(DB.collection(k).onSnapshot(s=>{DATA[k]=Object.fromEntries(s.docs.map(d=>[d.id,d.data()]));if(typeof accountsList==='function')accountsList();updateAdminBadge();},()=>{})));
      }
      setRole(role);
    });
    const loaded=new Set(), NEED=['players','matches','news','teams'];
    const done=()=>{if(NEED.every(k=>loaded.has(k))){const n=Object.keys(DATA.matches).filter(id=>status(id)==='done').length;
      $('#dataNote').textContent=n?`${n} maçın sonucu işlendi · canlı güncelleniyor`:'Sonuçlar maçlar oynandıkça burada canlı güncellenir';}};
    let t=null;
    const schedule=()=>{clearTimeout(t);t=setTimeout(()=>{renderAll();if(IS_ADMIN)matchOptions();done();},30)};
    NEED.forEach(k=>DB.collection(k).onSnapshot(s=>{DATA[k]=Object.fromEntries(s.docs.map(d=>[d.id,d.data()]));loaded.add(k);schedule();},
      err=>{console.error(k,err);$('#dataNote').textContent='Veriler şu an alınamıyor. Sayfayı yenileyin.';}));
  }catch(e){
    console.error(e);
    $('#dataNote').textContent='Canlı sonuç sistemine bağlanılamadı. Sayfayı yenileyin.';
  }
}

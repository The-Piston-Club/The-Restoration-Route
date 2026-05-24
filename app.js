
const DATA = window.RESTORATION_ROUTE_DATA;
const PUBLIC_BUILD = true;
(function clearPublicBuildEditorOverrides(){
  if(!PUBLIC_BUILD) return;
  try{
    [
      "restorationRouteFullAppLayoutDesign.v70",
      "restorationRoute8VenueState.finished.v1.layoutDraft.v70",
      "restorationRouteRepairUiDesign.v80",
      "restorationRouteRepairUiDesign.v79",
      "restorationRouteRepairUiDesign.v78",
      "restorationRouteRepairUiDesign.v76",
      "restorationRouteRepairUiDesign.v74",
      "restorationRouteRepairUiDesign.v63"
    ].forEach(k=>localStorage.removeItem(k));
  }catch(e){}
})();
const FULL_APP_LAYOUT_STORE_KEY="restorationRouteFullAppLayoutDesign.v70";
let CUSTOM_FULL_LAYOUT_LOADED=false;
function applyFullAppLayoutDesign(){
  if(PUBLIC_BUILD)return false;
  try{
    const saved=JSON.parse(localStorage.getItem(FULL_APP_LAYOUT_STORE_KEY)||"null");
    if(!saved||!saved.layout)return false;
    DATA.layout={...DATA.layout,...saved.layout};
    if(saved.repairUiDesign)DATA.repairUiDesign=saved.repairUiDesign;
    return true;
  }catch(e){return false;}
}
CUSTOM_FULL_LAYOUT_LOADED=applyFullAppLayoutDesign();
DATA.components = DATA.components || {};
DATA.components.vehicle = DATA.components.vehicle || {broken:"assets/vehicle_broken_placeholder.png",fixed:"assets/vehicle_fixed_placeholder.png"};
const homeRoot = document.getElementById("homeRoot");
const overlayRoot = document.getElementById("overlayRoot");
const scannerRoot = document.getElementById("scannerRoot");
const STORE_KEY = "restorationRoute8VenueState.finished.v1";
const LAYOUT_STORE_KEY = STORE_KEY+".layoutDraft.v70";
const COMPLETION_NOTICE_KEY = STORE_KEY+".completionNotice.v70";
const ADMIN_CODE = "Watson";
const IS_FILE_PREVIEW = location.protocol==="file:";
const LOCAL_TEST_MODE = IS_FILE_PREVIEW || new URLSearchParams(location.search).has("test");
const BAKED_LAYOUT_ADJUSTMENTS = (()=>{
  const venueIds=["piston-club","mr-watsons","gilks-garage","oily-rag","long-itch-diner","pats-baps","seven-mile","the-man-cave"];
  const venueMaster={
    "name":{"df":5},
    "opening:0":{"dx":33,"dy":1,"dw":-36},
    "opening:6":{"dx":34,"dy":2,"dw":-36},
    "website":{"dx":2,"dy":5},
    "phone":{"dx":5,"dy":5},
    "email":{"dx":6,"dy":5},
    "address:2":{"dy":1},
    "address:1":{"dy":1},
    "address:0":{"dy":1},
    "summary:2":{"dy":2},
    "summary:1":{"dy":2},
    "summary:0":{"dy":3},
    "food:0":{"dx":24,"dy":2,"dw":-20},
    "food:1":{"dx":25,"dy":2,"dw":-24},
    "food:2":{"dx":22,"dy":2,"dw":-20},
    "food:3":{"dx":22,"dy":2,"dw":-20},
    "food:4":{"dx":23,"dy":2,"dw":-20},
    "food:5":{"dx":23,"dy":2,"dw":-20},
    "food:6":{"dx":24,"dy":4,"dw":-20},
    "opening:2":{"dx":25,"dw":-35},
    "opening:1":{"dx":32,"dw":-36},
    "opening:3":{"dx":29,"dw":-35},
    "opening:4":{"dx":36,"dw":-36},
    "opening:5":{"dx":31,"dw":-36},
    "summary:3":{"dy":2}
  };
  const directoryMaster={
    "directory:mr-watsons:name":{"df":-2},
    "directory:piston-club:name":{"df":-2},
    "directory:gilks-garage:name":{"df":-2},
    "directory:oily-rag:name":{"df":-2},
    "directory:long-itch-diner:name":{"df":-2},
    "directory:pats-baps:name":{"df":-2},
    "directory:seven-mile:name":{"df":-2},
    "directory:the-man-cave:name":{"df":-2},
    "directory:the-man-cave:component:0":{"dx":-4,"dw":5,"df":-2.2},
    "directory:pats-baps:component:0":{"dx":-3,"dw":9,"df":-2.2},
    "directory:seven-mile:component:0":{"df":-2.2},
    "directory:long-itch-diner:component:0":{"df":-2.2},
    "directory:oily-rag:component:0":{"df":-2.2},
    "directory:gilks-garage:component:0":{"df":-2.2},
    "directory:mr-watsons:component:0":{"dx":-6,"dw":12,"df":-2.2},
    "directory:piston-club:component:0":{"df":-2.2}
  };
  const out={...directoryMaster};
  venueIds.forEach(id=>Object.entries(venueMaster).forEach(([key,adj])=>out[`venue:${id}:${key}`]={...adj}));
  return out;
})();

let auth=null, db=null, currentUser=null, firebaseReady=false, fb=null, authStateResolved=false;
function rememberedEmail(){return (state.email||storageGet("restorationRouteLastEmail","")).trim();}
function hasRememberedAccount(){return !!(state.uid && rememberedEmail() && state.username && state.termsAccepted);}
function appSessionActive(){return !!currentUser || hasRememberedAccount() || LOCAL_TEST_MODE;}
function defaultAuthMode(){return rememberedEmail()?"login":"register";}
let activeScannerStream=null, activeScannerTimer=null, scannerProcessing=false;
let hornTapTimes=[], hornHoldTimer=null, hornStopTimer=null, hornSource=null, hornGain=null, hornAudioContext=null, hornBuffer=null, hornFallbackAudio=null, hornPressStartedAt=0, hornPressed=false;
let layoutAdjustments=PUBLIC_BUILD?{...BAKED_LAYOUT_ADJUSTMENTS}:loadLayoutAdjustments(), selectedLayoutEl=null, layoutEditorReady=false, repairFlowActive=false;
let LIVE_EDITOR_READY=false, LIVE_EDITOR_SELECTED=null, LIVE_EDITOR_DRAG=null, ACTIVE_REPAIR_DESIGN=null;
const BOOK_ASPECT=1122/1402;
const BOOK_ART_FRAME={x:-32+(452-(493*BOOK_ASPECT))/2,y:183,w:493*BOOK_ASPECT,h:493};
const VENUE_SOURCE_FRAME={x:0,y:(844-(390/BOOK_ASPECT))/2,w:390,h:390/BOOK_ASPECT};
const TAB_ORDER=["directory","piston-club","mr-watsons","gilks-garage","oily-rag","long-itch-diner","pats-baps","seven-mile","the-man-cave"];
const VENUE_PAGE_BY_ID={"piston-club":"venue1","mr-watsons":"venue2","gilks-garage":"venue3","oily-rag":"venue4","long-itch-diner":"venue5","pats-baps":"venue6","seven-mile":"venue7","the-man-cave":"venue8"};

function baseRepaired(){ const r={}; DATA.venues.forEach(v=>r[v.id]=false); return r; }
function defaultState(){
  return { uid:"", email:"", username:"", termsAccepted:false, emailVerified:false,
    repaired:baseRepaired(), completedVehicles:0, prizeEntries:0, pendingPrizeEntries:0,
    totalPartsRestored:0, currentVehicle:1, routeCompleted:false, hornBroken:false, hornBrokenCount:0, hornRestoredCount:0, log:[] };
}
let state = loadLocal();
function storageGet(key,fallback="{}"){
  try{return localStorage.getItem(key)??fallback}catch{return fallback}
}
function storageSet(key,value){
  try{localStorage.setItem(key,value);return true}catch{return false}
}
function loadLocal(){
  try{
    const saved=JSON.parse(storageGet(STORE_KEY,"{}"));
    return {...defaultState(),...saved,repaired:{...baseRepaired(),...(saved.repaired||{})}};
  }catch{return defaultState();}
}
function saveLocal(){ storageSet(STORE_KEY, JSON.stringify(state)); }
function loadLayoutAdjustments(){try{return {...BAKED_LAYOUT_ADJUSTMENTS,...JSON.parse(storageGet(LAYOUT_STORE_KEY,"{}"))}}catch{return {...BAKED_LAYOUT_ADJUSTMENTS}}}
function saveLayoutAdjustments(){storageSet(LAYOUT_STORE_KEY,JSON.stringify(layoutAdjustments));}
function venueById(id){ return DATA.venues.find(v=>v.id===id); }
function routeVenues(){return TAB_ORDER.slice(1).map(venueById).filter(Boolean);}
function allRepaired(){ return DATA.venues.every(v=>state.repaired[v.id]); }
function repairedCount(){ return DATA.venues.filter(v=>state.repaired[v.id]).length; }

async function sha256(s){
  const d=await crypto.subtle.digest("SHA-256", new TextEncoder().encode(String(s||"")));
  return [...new Uint8Array(d)].map(b=>b.toString(16).padStart(2,"0")).join("");
}

async function initFirebase(){
  if(LOCAL_TEST_MODE){
    firebaseReady=false;
    currentUser={uid:"local-test-user",email:"local-test@restoration-route.local",emailVerified:true};
    state.uid=currentUser.uid;
    state.email=state.email||currentUser.email;
    state.username=state.username||"Local Tester";
    state.termsAccepted=true;
    state.emailVerified=true;
    saveLocal();
    renderHome();
    return;
  }
  try{
    const {initializeApp}=await import("https://www.gstatic.com/firebasejs/10.13.2/firebase-app.js");
    const authMod=await import("https://www.gstatic.com/firebasejs/10.13.2/firebase-auth.js");
    const fsMod=await import("https://www.gstatic.com/firebasejs/10.13.2/firebase-firestore.js");
    fb={...authMod,...fsMod};
    window.fb=fb;
    const app=initializeApp(DATA.firebaseConfig);
    if(IS_FILE_PREVIEW){
      auth=authMod.getAuth(app);
      await authMod.setPersistence(auth, authMod.inMemoryPersistence).catch(()=>{});
    }else{
      const persistenceList=[authMod.indexedDBLocalPersistence,authMod.browserLocalPersistence].filter(Boolean);
      try{
        auth=authMod.initializeAuth(app,{persistence:persistenceList});
      }catch(initErr){
        auth=authMod.getAuth(app);
        try{
          await authMod.setPersistence(auth, authMod.indexedDBLocalPersistence||authMod.browserLocalPersistence);
        }catch(persistErr){
          await authMod.setPersistence(auth, authMod.browserLocalPersistence).catch(()=>{});
        }
      }
    }
    db=fsMod.getFirestore(app); firebaseReady=true;
    authMod.onAuthStateChanged(auth, async user=>{
      authStateResolved=true;
      currentUser=user;
      if(user){
        await loadCloud(user);
        closeAuthPanel();
        renderHome();
        setTimeout(setScales,80);
        if(previewMode())openPreviewFromUrl();
        else if(!layoutMode()&&(!state.username||!state.termsAccepted)) openAuthPanel("complete");
      }else{
        renderHome();
        setTimeout(setScales,80);
        if(hasRememberedAccount()){
          closeAuthPanel();
          if(previewMode())openPreviewFromUrl();
          return;
        }
        if(previewMode())openPreviewFromUrl();
        else if(IS_FILE_PREVIEW)showFilePreviewNotice();
        else if(!layoutMode())openAuthPanel(defaultAuthMode());
      }
    });
  }catch(e){
    renderHome();
    setTimeout(setScales,80);
    if(hasRememberedAccount()){closeAuthPanel(); if(previewMode())openPreviewFromUrl(); return;}
    if(previewMode())openPreviewFromUrl();
    else if(IS_FILE_PREVIEW)showFilePreviewNotice();
    else if(!layoutMode())openAuthPanel(defaultAuthMode(),"Firebase could not load or could not enable remembered sign-in. Check Firebase setup/internet.");
  }
}
async function loadCloud(user){
  state.uid=user.uid; state.email=user.email||""; state.emailVerified=!!user.emailVerified;
  const ref=fb.doc(db,"userVisits",user.uid), snap=await fb.getDoc(ref);
  if(snap.exists()){
    const saved=snap.data();
    state={...defaultState(),...saved,uid:user.uid,email:user.email||saved.email||"",emailVerified:!!user.emailVerified,repaired:{...baseRepaired(),...(saved.repaired||{})}};
  }
  hornTapTimes=[];
  await saveCloud();
}
async function saveCloud(){
  saveLocal();
  if(!firebaseReady||!currentUser) return;
  const data={uid:currentUser.uid,email:currentUser.email||state.email||"",username:state.username||"",termsAccepted:!!state.termsAccepted,emailVerified:!!currentUser.emailVerified,
    repaired:state.repaired,completedVehicles:state.completedVehicles||0,prizeEntries:state.prizeEntries||0,pendingPrizeEntries:state.pendingPrizeEntries||0,totalPartsRestored:state.totalPartsRestored||0,
    currentVehicle:state.currentVehicle||1,routeCompleted:!!state.routeCompleted,hornBroken:!!state.hornBroken,hornBrokenCount:state.hornBrokenCount||0,hornRestoredCount:state.hornRestoredCount||0,updatedAt:fb.serverTimestamp()};
  await fb.setDoc(fb.doc(db,"userVisits",currentUser.uid),data,{merge:true});
  if(state.username) await fb.setDoc(fb.doc(db,"leaderboard",currentUser.uid),{uid:currentUser.uid,username:state.username,completedVehicles:state.completedVehicles||0,prizeEntries:state.prizeEntries||0,pendingPrizeEntries:state.pendingPrizeEntries||0,totalPartsRestored:state.totalPartsRestored||0,updatedAt:fb.serverTimestamp()},{merge:true}).catch(()=>{});
}

function stableSrc(src,name=""){if(DATA.tabAssetOverrides&&DATA.tabAssetOverrides[src])return DATA.tabAssetOverrides[src];
  if(!src||String(src).startsWith("blob:null/")){
    const n=name.toLowerCase();
    if(n.includes("garage directory"))return DATA.assets.serviceBook;
    if(n.includes("wall map"))return DATA.assets.wallMap;
    if(n.includes("scanner tool"))return DATA.assets.scannerTool;
    if(n.includes("scanner home"))return DATA.assets.scannerHomeButton;
    if(n.includes("man cave")&&n.includes("tab button"))return DATA.assets.manCaveTab;
    if(n.includes("engine_damaged"))return DATA.components.engine.broken;
    if(n.includes("engine_repaired"))return DATA.components.engine.fixed;
    if(n.includes("venue 1 ui"))return DATA.assets.venue1;
    if(n.includes("garage directory ui"))return DATA.assets.directory;
    return "";
  }
  const map={
    "assets/home_ui.webp":DATA.assets.home,"assets/menu_ui.webp":DATA.assets.menu,"assets/scanner_ui.webp":DATA.assets.scanner,"assets/banter_box.webp":DATA.assets.banterBox,
    "assets/component_assets_exhaust_broken.png":DATA.components.exhaust.broken,"assets/component_assets_exhaust_fixed.png":DATA.components.exhaust.fixed,
    "assets/component_assets_fuel_tank_broken.png":DATA.components.fuel_tank.broken,"assets/component_assets_fuel_tank_fixed.png":DATA.components.fuel_tank.fixed,
    "assets/component_assets_horn_fixed.png":DATA.components.horn.fixed,"assets/component_assets_horn_broken.png":DATA.components.horn.broken,
    "assets/component_assets_headlight_broken.png":DATA.components.headlight.broken,"assets/component_assets_headlight_fixed.png":DATA.components.headlight.fixed,
    "assets/component_assets_oil_filter_broken.webp":DATA.components.oil_filter.broken,"assets/component_assets_oil_filter_fixed.png":DATA.components.oil_filter.fixed,
    "assets/component_assets_radiator_broken.webp":DATA.components.radiator.broken,"assets/component_assets_radiator_fixed.webp":DATA.components.radiator.fixed,
    "assets/component_assets_wheel_broken.png":DATA.components.wheel.broken,"assets/component_assets_wheel_fixed.png":DATA.components.wheel.fixed,
    "assets/component_assets_gearbox_broken.webp":DATA.components.gearbox.broken,"assets/component_assets_gearbox_fixed.png":DATA.components.gearbox.fixed,
    "assets/garage_directory_assets_home_button.webp":DATA.assets.homeButton,"assets/garage_directory_assets_repaired_stamp.webp":DATA.assets.repairStamp,
    "assets/menu_buttons_restoration_route_button_issues_true_alpha.webp":DATA.assets.menuButtons?.issues,"assets/menu_buttons_restoration_route_button_profile_true_alpha.webp":DATA.assets.menuButtons?.profile,
    "assets/menu_buttons_restoration_route_button_leaderboard_true_alpha.webp":DATA.assets.menuButtons?.leaderboard,"assets/menu_buttons_restoration_route_button_log_out_true_alpha.webp":DATA.assets.menuButtons?.logout
  };
  return map[src]||src;
}

let LAST_STABLE_VIEWPORT_H=0;
function activeTextInput(){
  const el=document.activeElement;
  if(!el)return false;
  const tag=(el.tagName||"").toLowerCase();
  return tag==="input"||tag==="textarea"||tag==="select"||el.isContentEditable;
}
function setScales(){
  const vv=window.visualViewport;
  const rawW=Math.round((vv&&vv.width)||innerWidth);
  const rawH=Math.round((vv&&vv.height)||innerHeight);
  const w=Math.max(1,rawW),bw=390,bh=844;
  const mobile=w<=700&&w<rawH;
  if(mobile&&!activeTextInput())LAST_STABLE_VIEWPORT_H=Math.max(LAST_STABLE_VIEWPORT_H,rawH);
  const h=Math.max(1,(mobile&&activeTextInput()&&LAST_STABLE_VIEWPORT_H)?LAST_STABLE_VIEWPORT_H:rawH);

  // One stage rule for the public app: every full-screen app view uses the same 390x844 stage scale.
  // This stops scanner/directory/venue pages drifting or zooming differently from the home UI.
  const stageS=Math.min(w/bw,h/bh);
  const stageLeft=Math.max(0,(w-bw*stageS)/2);
  const stageTop=Math.max(0,(h-bh*stageS)/2);

  const popupScale=w/BOOK_ART_FRAME.w;
  const popupTop=BOOK_ART_FRAME.h*popupScale<h?(h-BOOK_ART_FRAME.h*popupScale)/2-BOOK_ART_FRAME.y*popupScale:-BOOK_ART_FRAME.y*popupScale;

  document.documentElement.style.setProperty("--homeScale",stageS);
  document.documentElement.style.setProperty("--popupScale",popupScale);
  document.documentElement.style.setProperty("--menuScale",stageS);
  document.documentElement.style.setProperty("--repairScale",stageS);
  document.documentElement.style.setProperty("--scannerScale",stageS);
  document.documentElement.style.setProperty("--homeLeft",stageLeft+"px");
  document.documentElement.style.setProperty("--homeTop",stageTop+"px");
  document.documentElement.style.setProperty("--stageLeft",stageLeft+"px");
  document.documentElement.style.setProperty("--stageTop",stageTop+"px");
  document.documentElement.style.setProperty("--repairLeft",stageLeft+"px");
  document.documentElement.style.setProperty("--repairTop",stageTop+"px");
  document.documentElement.style.setProperty("--popupLeft",(-BOOK_ART_FRAME.x*popupScale)+"px");
  document.documentElement.style.setProperty("--popupTop",popupTop+"px");
}
addEventListener("resize",setScales);
if(window.visualViewport)window.visualViewport.addEventListener("resize",()=>setTimeout(setScales,60));
document.addEventListener("focusout",()=>setTimeout(setScales,250),true);
function makeStage(c){const s=document.createElement("div");s.className="stage "+c;return s;}
function layoutMode(){return false;}
function editorMode(){return false;}
function previewMode(){return false;}
function fitFontSize(l,text,base){
  const value=String(text||"").trim();
  if(!value)return base;
  const lines=value.split(/\n/);
  const longest=lines.reduce((m,line)=>Math.max(m,line.length),0);
  const byWidth=longest?((l.w||1)*.94)/(longest*.56):base;
  const byHeight=(l.h||1)/(Math.max(lines.length,1)*1.06);
  return Math.max(5,Math.min(base,byWidth,byHeight));
}
function cleanLayoutAdjustment(adj){
  const out={};
  ["dx","dy","dw","dh","df"].forEach(k=>{
    const v=Number(adj[k]||0);
    if(Math.abs(v)>.001)out[k]=Math.round(v*10)/10;
  });
  return out;
}
function layoutBox(l,key){
  const adj=key&&layoutAdjustments[key]?layoutAdjustments[key]:{};
  const fontBase=Number(l.fontSize||12);
  return {
    ...l,
    x:Number(l.x||0)+Number(adj.dx||0),
    y:Number(l.y||0)+Number(adj.dy||0),
    w:Math.max(4,Number(l.w||0)+Number(adj.dw||0)),
    h:Math.max(4,Number(l.h||0)+Number(adj.dh||0)),
    fontSize:Math.max(3,fontBase+Number(adj.df||0))
  };
}
function layoutKeyFor(l,t){
  return l.layoutKey||`${l.name||"Text"}:${Math.round(l.x||0)}:${Math.round(l.y||0)}:${String(t||"").slice(0,32)}`;
}
function ensureLayoutEditor(){
  if(!layoutMode()||layoutEditorReady)return;
  layoutEditorReady=true;
  const d=document.createElement("div");
  d.className="layoutEditor";
  d.innerHTML=`<div class="layoutHeader"><strong>Text layout</strong><span data-selected>No text selected</span></div><div class="layoutViews" data-views></div><div class="layoutNudge"><button type="button" data-dy="-1">Up</button><button type="button" data-dx="-1">Left</button><button type="button" data-dx="1">Right</button><button type="button" data-dy="1">Down</button></div><div class="layoutNudge"><button type="button" data-dy="-5">Up 5</button><button type="button" data-dx="-5">Left 5</button><button type="button" data-dx="5">Right 5</button><button type="button" data-dy="5">Down 5</button></div><div class="layoutNudge"><button type="button" data-df="-0.2">Font -</button><button type="button" data-df="0.2">Font +</button><button type="button" data-dh="-1">Box H -</button><button type="button" data-dh="1">Box H +</button></div><div class="layoutNudge"><button type="button" data-dw="-1">Box W -</button><button type="button" data-dw="1">Box W +</button><button type="button" data-reset>Reset</button><button type="button" data-export>Export</button></div><textarea data-output readonly placeholder="Exported layout appears here"></textarea>`;
  document.body.appendChild(d);
  const views=d.querySelector("[data-views]");
  const addView=(label,fn)=>{const b=document.createElement("button");b.type="button";b.textContent=label;b.onclick=fn;views.appendChild(b);};
  addView("Directory",openDirectory);
  routeVenues().forEach((v,i)=>addView(String(i+1),()=>openVenue(v.id)));
  d.querySelectorAll("[data-dx],[data-dy],[data-dw],[data-dh],[data-df]").forEach(b=>b.onclick=()=>adjustLayoutSelection({
    dx:Number(b.dataset.dx||0),
    dy:Number(b.dataset.dy||0),
    dw:Number(b.dataset.dw||0),
    dh:Number(b.dataset.dh||0),
    df:Number(b.dataset.df||0)
  }));
  d.querySelector("[data-reset]").onclick=resetLayoutSelection;
  d.querySelector("[data-export]").onclick=exportLayoutAdjustments;
  addEventListener("keydown",layoutKeyHandler);
}
function selectLayoutText(el){
  document.querySelectorAll(".textLayer.isSelected").forEach(x=>x.classList.remove("isSelected"));
  selectedLayoutEl=el;
  el.classList.add("isSelected");
  updateLayoutEditor();
}
function selectedLayoutData(){
  if(!selectedLayoutEl)return null;
  const key=selectedLayoutEl.dataset.layoutKey;
  const base=JSON.parse(selectedLayoutEl.dataset.baseBox||"{}");
  const adj=layoutAdjustments[key]||{};
  return {key,base,adj};
}
function applyLayoutToElement(el){
  const data={key:el.dataset.layoutKey,base:JSON.parse(el.dataset.baseBox||"{}")};
  const box=layoutBox(data.base,data.key);
  const text=el.textContent||"";
  const fontSize=fitFontSize(box,text,box.fontSize||12);
  Object.assign(el.style,{left:box.x+"px",top:box.y+"px",width:box.w+"px",height:box.h+"px",fontSize:fontSize+"px"});
  el.title=`${el.dataset.layoutName||"Text"} x:${Math.round(box.x*10)/10} y:${Math.round(box.y*10)/10} w:${Math.round(box.w*10)/10} h:${Math.round(box.h*10)/10} size:${Math.round(fontSize*10)/10}`;
}
function updateLayoutEditor(){
  const editor=document.querySelector(".layoutEditor");
  if(!editor)return;
  const selected=editor.querySelector("[data-selected]");
  const data=selectedLayoutData();
  if(!data){
    selected.textContent="No text selected";
    return;
  }
  const box=layoutBox(data.base,data.key);
  selected.textContent=`${selectedLayoutEl.dataset.layoutName||data.key} | x ${Math.round(box.x*10)/10}, y ${Math.round(box.y*10)/10}, font ${Math.round((box.fontSize||0)*10)/10}`;
}
function adjustLayoutSelection(delta){
  const data=selectedLayoutData();
  if(!data)return;
  const next=cleanLayoutAdjustment({
    ...data.adj,
    dx:Number(data.adj.dx||0)+Number(delta.dx||0),
    dy:Number(data.adj.dy||0)+Number(delta.dy||0),
    dw:Number(data.adj.dw||0)+Number(delta.dw||0),
    dh:Number(data.adj.dh||0)+Number(delta.dh||0),
    df:Number(data.adj.df||0)+Number(delta.df||0)
  });
  if(Object.keys(next).length)layoutAdjustments[data.key]=next;
  else delete layoutAdjustments[data.key];
  saveLayoutAdjustments();
  applyLayoutToElement(selectedLayoutEl);
  updateLayoutEditor();
}
function resetLayoutSelection(){
  const data=selectedLayoutData();
  if(!data)return;
  delete layoutAdjustments[data.key];
  saveLayoutAdjustments();
  applyLayoutToElement(selectedLayoutEl);
  updateLayoutEditor();
}
function exportLayoutAdjustments(){
  const editor=document.querySelector(".layoutEditor");
  if(!editor)return;
  const output=editor.querySelector("[data-output]");
  output.value=JSON.stringify(layoutAdjustments,null,2);
  output.focus();
  output.select();
  navigator.clipboard?.writeText(output.value).catch(()=>{});
}
function layoutKeyHandler(e){
  if(!layoutMode()||!selectedLayoutEl)return;
  if(["INPUT","TEXTAREA"].includes(document.activeElement?.tagName))return;
  const step=e.shiftKey?5:1;
  const map={ArrowLeft:{dx:-step},ArrowRight:{dx:step},ArrowUp:{dy:-step},ArrowDown:{dy:step},"[":{df:-.2},"]":{df:.2}};
  if(!map[e.key])return;
  e.preventDefault();
  adjustLayoutSelection(map[e.key]);
}
function imgLayer(stage,l,override){
  const src=override||stableSrc(l.src,l.name); if(!src)return;
  const d=document.createElement("div");
  d.className="layer imageLayer";
  if(editorMode()){
    d.classList.add("liveEditableLayer");
    d.dataset.liveLayerId=l.id||"";
    d.dataset.liveLayerName=l.name||"Image";
    d.dataset.liveLayerType="image";
    d.dataset.liveLayerSource=l.src||src||"";
  }
  d.style.setProperty("--rotate",(l.r||0)+"deg");
  Object.assign(d.style,{left:l.x+"px",top:l.y+"px",width:l.w+"px",height:l.h+"px",opacity:l.opacity??1,zIndex:l.z??1,transform:"translateY(var(--lift, 0px)) rotate(var(--rotate, 0deg))"});
  const i=document.createElement("img");i.src=src;i.alt=l.name||"";d.appendChild(i);stage.appendChild(d);return d;
}
function textLayer(stage,l,t){
  const key=layoutKeyFor(l,t);
  const box=layoutBox(l,key);
  const d=document.createElement("div");
  d.className="textLayer"+(l.className?" "+l.className:"");
  const fontSize=fitFontSize(box,t,box.fontSize||12);
  Object.assign(d.style,{left:box.x+"px",top:box.y+"px",width:box.w+"px",height:box.h+"px",opacity:l.opacity??1,zIndex:l.z??10,fontSize:fontSize+"px",color:l.color||"#0a3156",transform:`rotate(${l.r||0}deg)`,textAlign:l.align||"center",justifyContent:l.align==="left"?"flex-start":"center",alignItems:l.valign||"center",fontWeight:l.fontWeight||800});
  if(layoutMode()){
    ensureLayoutEditor();
    d.classList.add("layoutGuide");
    d.dataset.layoutKey=key;
    d.dataset.layoutName=l.layoutName||l.name||"Text";
    d.dataset.baseBox=JSON.stringify({x:l.x,y:l.y,w:l.w,h:l.h,fontSize:l.fontSize||12});
    d.tabIndex=0;
    d.setAttribute("role","button");
    d.setAttribute("aria-label",d.dataset.layoutName);
    d.title=`${l.layoutName||l.name||"Text"} x:${Math.round(box.x*10)/10} y:${Math.round(box.y*10)/10} w:${Math.round(box.w*10)/10} h:${Math.round(box.h*10)/10} size:${Math.round(fontSize*10)/10}`;
    d.addEventListener("click",e=>{e.stopPropagation();selectLayoutText(d);});
    d.addEventListener("keydown",e=>{if(e.key==="Enter"||e.key===" "){e.preventDefault();selectLayoutText(d);}});
  }
  if(editorMode()){
    d.classList.add("liveEditableLayer");
    d.dataset.liveLayerId=l.id||"";
    d.dataset.liveLayerName=l.layoutName||l.name||"Text";
    d.dataset.liveLayerType="text";
    d.dataset.layoutKey=l.layoutKey||key||"";
    d.dataset.baseBox=JSON.stringify({x:l.x,y:l.y,w:l.w,h:l.h,fontSize:l.fontSize||12});
  }
  d.textContent=t||"";
  stage.appendChild(d);
  return d;
}
function hit(stage,x,y,w,h,fn,title="",hoverLayer=null){
  const b=document.createElement("button");
  b.className="hit";
  Object.assign(b.style,{left:x+"px",top:y+"px",width:w+"px",height:h+"px"});
  b.title=title;
  b.setAttribute("aria-label",title||"Open");
  if(hoverLayer){
    hoverLayer.classList.add("interactiveImage");
    const on=()=>hoverLayer.classList.add("isHover");
    const off=()=>hoverLayer.classList.remove("isHover");
    b.addEventListener("mouseenter",on);
    b.addEventListener("mouseleave",off);
    b.addEventListener("focus",on);
    b.addEventListener("blur",off);
    b.addEventListener("pointerdown",on);
    b.addEventListener("pointerup",off);
    b.addEventListener("pointercancel",off);
  }
  b.onclick=fn;
  stage.appendChild(b);
}
function mapVenueLayer(l){return {...l};}
function requireLogin(){ if(layoutMode()||previewMode()||LOCAL_TEST_MODE)return true; if(!appSessionActive()){openAuthPanel(defaultAuthMode());return false;} if(!state.username||!state.termsAccepted){openAuthPanel(currentUser?"complete":"login");return false;} return true; }
function homeLayer(l,n){
  if(CUSTOM_FULL_LAYOUT_LOADED)return {...l};
  const moved={...l};
  if(n.includes("scanner tool"))moved.x+=15;
  else if(["engine_damaged","exhaust","fuel tank","headlight","oil filter","radiator","wheel","gearbox","horn"].some(k=>n.includes(k)))moved.x+=14;
  return moved;
}

function renderHome(){
  setScales(); overlayRoot.innerHTML=""; scannerRoot.innerHTML=""; scannerRoot.style.display="none"; stopScanner(); homeRoot.innerHTML="";
  ensureLayoutEditor();
  const st=makeStage("homeStage");st.dataset.editorScreen="home";
  DATA.layout.home.layers.forEach(l=>{
    if(l.type!=="image")return; const n=l.name.toLowerCase(); l=homeLayer(l,n); let key=null,id=null,src=stableSrc(l.src,l.name);
    if(n.includes("engine_damaged")){key="engine";id="piston-club"} else if(n.includes("exhaust")){key="exhaust";id="long-itch-diner"} else if(n.includes("fuel tank")){key="fuel_tank";id="pats-baps"} else if(n.includes("headlight")){key="headlight";id="mr-watsons"} else if(n.includes("oil filter")){key="oil_filter";id="oily-rag"} else if(n.includes("radiator")){key="radiator";id="the-man-cave"} else if(n.includes("wheel")){key="wheel";id="seven-mile"} else if(n.includes("gearbox")){key="gearbox";id="gilks-garage"} else if(n.includes("horn")) src=state.hornBroken?DATA.components.horn.broken:DATA.components.horn.fixed;
    if(key){src=state.repaired[id]?DATA.components[key].fixed:DATA.components[key].broken;const layer=imgLayer(st,l,src);hit(st,l.x,l.y,l.w,l.h,()=>{if(requireLogin())openVenue(id)},id,layer);return;}
    const layer=imgLayer(st,l,src);
    if(n.includes("garage directory"))hit(st,l.x,l.y,l.w,l.h,()=>{if(requireLogin())openDirectory()},"Garage Directory",layer);
    if(n.includes("wall map"))hit(st,l.x,l.y,l.w,l.h,openMap,"Map",layer);
    if(n.includes("scanner tool"))hit(st,l.x,l.y,l.w,l.h,()=>{if(requireLogin())openScanner()},"Scanner",layer);
    if(n.includes("banter box"))hit(st,l.x,l.y,l.w,l.h,openBanter,"Banter",layer);
    if(n.includes("horn"))hornHit(st,l.x,l.y,l.w,l.h,layer);
  });
  hit(st,82,58,230,70,()=>{if(requireLogin())openMenu()},"Menu");
  homeRoot.appendChild(st);
  if(editorMode())setTimeout(ensureLiveEditor,0);
  setTimeout(maybeShowRouteComplete,80);
}
function popupStage(cls="popupStage"){overlayRoot.innerHTML="";const sh=document.createElement("div");sh.className="popupShell";const st=makeStage(cls);st.dataset.editorScreen=cls.includes("repairStage")?"repair":cls.includes("menuStage")?"menu":cls.includes("pageStage")?"page":"popup";sh.appendChild(st);overlayRoot.appendChild(sh);if(editorMode())setTimeout(ensureLiveEditor,0);return st;}
function closePopup(){overlayRoot.innerHTML="";}
function openMenu(){const st=popupStage("menuStage");st.dataset.editorScreen="menu";const menuLayers=new Map();DATA.layout.menu.layers.forEach(l=>{if(l.type==="image")menuLayers.set(l,imgLayer(st,l))});let taps=0;const x=document.createElement("button");x.className="closeX";x.textContent="×";x.onclick=()=>taps>=5?openAdmin():closePopup();st.appendChild(x);hit(st,82,58,230,70,()=>{taps++;setTimeout(()=>taps=0,1800)},"Admin tap");DATA.layout.menu.layers.filter(l=>l.type==="image"&&!l.name.toLowerCase().includes("menu ui")).forEach(l=>{const n=l.name.toLowerCase(),layer=menuLayers.get(l);if(n.includes("profile"))hit(st,l.x,l.y,l.w,l.h,openProfile,"Profile",layer);else if(n.includes("leaderboard"))hit(st,l.x,l.y,l.w,l.h,openLeaderboard,"Leaderboard",layer);else if(n.includes("issues"))hit(st,l.x,l.y,l.w,l.h,openIssues,"Issues",layer);else if(n.includes("log out"))hit(st,l.x,l.y,l.w,l.h,openLogout,"Logout",layer);});}
function bookHome(st){const r=DATA.layout.directory.layers.find(l=>l.name.toLowerCase().includes("home button")); if(r){imgLayer(st,r,DATA.assets.homeButton);hit(st,r.x,r.y,r.w,r.h,closePopup,"Home");}}
function tabLayerMap(){
  const layers=DATA.layout.directory.layers.filter(l=>l.type==="image"&&l.name.toLowerCase().includes("tab button"));
  const match={
    "directory":l=>l.includes("garage directory"),
    "piston-club":l=>l.includes("piston"),
    "mr-watsons":l=>l.includes("watson"),
    "gilks-garage":l=>l.includes("gilks"),
    "oily-rag":l=>l.includes("oily"),
    "long-itch-diner":l=>l.includes("long itch"),
    "pats-baps":l=>l.includes("pats"),
    "seven-mile":l=>l.includes("seven"),
    "the-man-cave":l=>l.includes("man cave")
  };
  const map=Object.fromEntries(Object.entries(match).map(([id,fn])=>[id,layers.find(l=>fn(l.name.toLowerCase()))]).filter(([,l])=>l));
  map["the-man-cave"]={...(map["the-man-cave"]||{}),type:"image",name:"The Man Cave Tab Button",src:DATA.assets.manCaveTab,x:355,y:588,w:27,h:53,r:0,opacity:1,z:30};
  return map;
}
function tabs(st,current="directory"){
  const layers=tabLayerMap(), start=Math.max(0,TAB_ORDER.indexOf(current));
  TAB_ORDER.slice(start).forEach(id=>{
    const l=layers[id];
    if(!l)return;
    imgLayer(st,l,stableSrc(l.src,l.name));
    hit(st,l.x-4,l.y-2,Math.max(l.w+10,34),Math.max(l.h+6,54),()=>id==="directory"?openDirectory():openVenue(id),id);
  });
}
function openDirectory(){const st=popupStage("pageStage");st.dataset.editorScreen="directory";const bg=DATA.layout.directory.layers.find(l=>l.name.toLowerCase().includes("garage directory ui"))||DATA.layout.directory.layers[0];const bgLayer=imgLayer(st,bg,DATA.assets.directory);if(bgLayer)bgLayer.classList.add("pageBackgroundLayer");drawDirectory(st);tabs(st,"directory");bookHome(st);}
function drawDirectory(st){
  const txt=DATA.layout.directory.layers.filter(l=>l.type==="text"),
    names=txt.filter(l=>l.x>=50&&l.x<=60&&l.fontSize===28).sort((a,b)=>a.y-b.y).slice(0,8),
    parts=txt.filter(l=>l.x>=160&&l.x<=180&&l.fontSize===20).sort((a,b)=>a.y-b.y).slice(0,16),
    desc=txt.filter(l=>l.x>=230&&l.x<=245&&l.fontSize===12).sort((a,b)=>a.y-b.y).slice(0,24),
    venues=routeVenues(),
    takeMeLinks=[];
  venues.forEach((v,i)=>{
    if(names[i])textLayer(st,{...names[i],fontSize:10,layoutKey:`directory:${v.id}:name`,layoutName:`Directory ${v.name} name`},shortName(v.name));
    wrap(v.component.toUpperCase(),10,1).forEach((t,j)=>parts[i*2+j]&&textLayer(st,{...parts[i*2+j],fontSize:10,layoutKey:`directory:${v.id}:component:${j}`,layoutName:`Directory ${v.name} component ${j+1}`},t));
    if(parts[i*2+1]){
      const l={...parts[i*2+1],x:parts[i*2+1].x-4,w:parts[i*2+1].w+8,fontSize:6,className:"directoryDirectionsText",layoutKey:`directory:${v.id}:directions`,layoutName:`Directory ${v.name} directions link`};
      textLayer(st,l,"TAKE ME THERE");
      takeMeLinks.push({v,l});
    }
    wrap(v.specialist,23,3).forEach((t,j)=>desc[i*3+j]&&textLayer(st,{...desc[i*3+j],fontSize:6,layoutKey:`directory:${v.id}:specialist:${j}`,layoutName:`Directory ${v.name} specialist ${j+1}`},t));
  });
  const comps=DATA.layout.directory.layers.filter(l=>l.type==="image"&&(l.name.toLowerCase().includes("fixed")||l.name.toLowerCase().includes("engine_repaired"))).sort((a,b)=>a.y-b.y).slice(0,8);
  venues.forEach((v,i)=>comps[i]&&imgLayer(st,comps[i],DATA.components[v.key].fixed));
  if(!layoutMode())[287,335,383,431,479,527,575,623].forEach((y,i)=>venues[i]&&hit(st,34,y,302,43,()=>openVenue(venues[i].id),venues[i].name));
  if(!layoutMode())takeMeLinks.forEach(({v,l})=>hit(st,l.x-2,l.y-2,l.w+4,l.h+8,()=>openDirections(v),`Directions to ${v.name}`));
}
function shortName(n){return n.replace("The Piston Club","PISTON\nCLUB").replace("Oily Rag","OILY\nRAG").replace("Seven Mile","SEVEN\nMILE").replace("Mr. Watson’s","MR.\nWATSON’S").replace("Gilks’ Garage","GILKS’\nGARAGE").replace("The Long Itch Diner","LONG ITCH\nDINER").replace("Pat’s Baps","PAT’S\nBAPS").replace("The Man Cave","MAN\nCAVE");}
function wrap(t,max,lines){const words=String(t).split(/\s+/),out=[];let line="";words.forEach(w=>{const test=line?line+" "+w:w;if(test.length>max&&line){out.push(line);line=w}else line=test});if(line)out.push(line);while(out.length<lines)out.push("");return out.slice(0,lines);}
function mapsDirectionsUrl(v){return `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent((v.address||[]).filter(Boolean).join(", ")||v.name)}`;}
function openDirections(v){window.open(mapsDirectionsUrl(v),"_blank","noopener");}
function openVenue(id){const v=venueById(id);if(!v)return;const st=popupStage("pageStage");st.dataset.editorScreen="venueTemplate";st.dataset.editorVenue=id;const bg={x:0,y:0,w:390,h:844,r:0,opacity:1,z:0,name:"Venue UI"};const bgLayer=imgLayer(st,bg,DATA.assets[VENUE_PAGE_BY_ID[id]||v.page]);if(bgLayer)bgLayer.classList.add("pageBackgroundLayer");drawVenue(st,v);bookHome(st);tabs(st,id);}
function drawVenue(st,v){
  const tl=DATA.layout.venueTemplate.layers.filter(l=>l.type==="text"),
    img=mapVenueLayer(DATA.layout.venueTemplate.layers.find(l=>l.type==="image"&&l.name.toLowerCase().includes("exhaust broken"))||{x:41,y:337,w:121,h:97,r:0,opacity:1,z:3}),
    stamp=mapVenueLayer(DATA.layout.venueTemplate.layers.find(l=>l.name.toLowerCase().includes("repaired stamp"))||{x:221,y:239,w:152,h:91,r:0,opacity:1,z:1});
  const title=tl.find(l=>l.name==="Venue Name");
  if(title)textLayer(st,{...mapVenueLayer(title),fontSize:18,layoutKey:`venue:${v.id}:name`,layoutName:`${v.name} venue name`},v.name);
  imgLayer(st,img,state.repaired[v.id]?DATA.components[v.key].fixed:DATA.components[v.key].broken);
  if(state.repaired[v.id])imgLayer(st,stamp,DATA.assets.repairStamp);
  const exact=n=>tl.filter(l=>l.name.startsWith(n)).sort((a,b)=>a.y-b.y);
  const line=l=>{const m=mapVenueLayer(l);return {...m,fontSize:Math.min(m.fontSize||7,4.8),align:"left",fontWeight:700};};
  exact("Summary Text Location").slice(0,4).forEach((l,i)=>textLayer(st,{...line(l),layoutKey:`venue:${v.id}:summary:${i}`,layoutName:`${v.name} summary ${i+1}`},v.summary[i]||""));
  exact("Address Text Location").slice(0,3).forEach((l,i)=>textLayer(st,{...line(l),layoutKey:`venue:${v.id}:address:${i}`,layoutName:`${v.name} address ${i+1}`},v.address[i]||""));
  exact("Food Hours").slice(0,7).forEach((l,i)=>textLayer(st,{...line(l),layoutKey:`venue:${v.id}:food:${i}`,layoutName:`${v.name} food ${i+1}`},v.food[i]||""));
  exact("Opening Hours").slice(0,7).forEach((l,i)=>textLayer(st,{...line(l),layoutKey:`venue:${v.id}:opening:${i}`,layoutName:`${v.name} opening ${i+1}`},v.opening[i]||""));
  exact("Notes Line").slice(0,3).forEach((l,i)=>textLayer(st,{...line(l),layoutKey:`venue:${v.id}:notes:${i}`,layoutName:`${v.name} notes ${i+1}`},v.notes[i]||""));
  const website=tl.find(l=>l.name==="Website Address"),phone=tl.find(l=>l.name==="Phone Number"),email=tl.find(l=>l.name==="Email Address");
  if(website)textLayer(st,{...line(website),layoutKey:`venue:${v.id}:website`,layoutName:`${v.name} website`},v.website||"To confirm");
  if(phone)textLayer(st,{...line(phone),layoutKey:`venue:${v.id}:phone`,layoutName:`${v.name} phone`},v.phone||"To confirm");
  if(email)textLayer(st,{...line(email),layoutKey:`venue:${v.id}:email`,layoutName:`${v.name} email`},v.email||"To confirm");
  hit(st,stamp.x,stamp.y,stamp.w,stamp.h,()=>state.repaired[v.id]?null:card(`<h2>Scan To Restore</h2><p>Scan this venue’s private route code to restore ${esc(v.component)}.</p><button data-close>Close</button>`),"Repair");
}

const REPAIR_UI_DESIGN_STORE_KEY="restorationRouteRepairUiDesign.v80";
function defaultRepairUiDesign(){
  return {
  "version": 80,
  "stage": {
    "w": 390,
    "h": 844,
    "background": "assets/repair_ui_background_v78.png",
    "backgroundBox": {
      "x": -0.209,
      "y": 0,
      "w": 390.419,
      "h": 844
    }
  },
  "timing": {
    "brokenFadeStartMs": 3000,
    "brokenFadeEndMs": 5000,
    "fixedFadeStartMs": 3000,
    "fixedFadeEndMs": 5000,
    "transitionFadeStartMs": 6000,
    "transitionFadeMs": 2000,
    "totalMs": 8000,
    "dotMs": 360,
    "crossfadeStartMs": 3000,
    "crossfadeMs": 2000
  },
  "layers": [
    {
      "id": "venueName",
      "type": "text",
      "name": "Venue name / Congratulations",
      "token": "venueName",
      "text": "Venue Name",
      "completionText": "Congratulations",
      "x": 20.7,
      "y": 161.9,
      "w": 170,
      "h": 92,
      "z": 20,
      "opacity": 1,
      "r": 0,
      "fontSize": 18,
      "fontWeight": 800,
      "color": "#0a3156",
      "readyColor": "#0a3156",
      "align": "center",
      "objectFit": "contain"
    },
    {
      "id": "componentName",
      "type": "text",
      "name": "Component / completion message",
      "token": "componentName",
      "text": "Component",
      "completionText": "You have fully restored a vehicle back to working order",
      "x": 206.5,
      "y": 163.7,
      "w": 149.1,
      "h": 95.5,
      "z": 20,
      "opacity": 1,
      "r": 0,
      "fontSize": 18,
      "fontWeight": 800,
      "color": "#0a3156",
      "readyColor": "#0a3156",
      "align": "center",
      "objectFit": "contain"
    },
    {
      "id": "statusText",
      "type": "text",
      "name": "Repair status",
      "token": "status",
      "text": "Repairing...",
      "repairingText": "Repairing",
      "repairedText": "Repaired",
      "x": 94.3,
      "y": 284,
      "w": 203.2,
      "h": 45,
      "z": 20,
      "opacity": 1,
      "r": 0,
      "fontSize": 23,
      "fontWeight": 900,
      "color": "#0a3156",
      "readyColor": "#237a35",
      "align": "center",
      "objectFit": "contain"
    },
    {
      "id": "takeHomeText",
      "type": "text",
      "name": "Action button text",
      "token": "takeHome",
      "text": "Take Component Home",
      "completionText": "Sell Vehicle and Start Again",
      "x": 76.2,
      "y": 744.5,
      "w": 237.9,
      "h": 47.2,
      "z": 20,
      "opacity": 1,
      "r": 0,
      "fontSize": 18,
      "fontWeight": 800,
      "color": "#8f8877",
      "readyColor": "#0a3156",
      "align": "center",
      "objectFit": "contain"
    },
    {
      "id": "brokenPart",
      "type": "component",
      "name": "Broken component",
      "componentState": "broken",
      "z": 10,
      "phase": "repairing",
      "x": 82.3,
      "y": 437.8,
      "w": 229.5,
      "h": 189,
      "opacity": 1,
      "r": 0,
      "objectFit": "contain"
    },
    {
      "id": "fixedPart",
      "type": "component",
      "name": "Fixed component",
      "componentState": "fixed",
      "z": 11,
      "phase": "repaired",
      "glow": true,
      "x": 82.3,
      "y": 437.8,
      "w": 229.5,
      "h": 189,
      "opacity": 1,
      "r": 0,
      "objectFit": "contain"
    },
    {
      "id": "repairTransitionWebM",
      "type": "video",
      "name": "Repair transition WebM",
      "x": -9.6,
      "y": 341.8,
      "w": 382.7,
      "h": 424.3,
      "z": 12,
      "opacity": 1,
      "r": 0,
      "src": "assets/Repair Transition Animation.webm",
      "objectFit": "contain",
      "loop": false,
      "muted": true,
      "playsInline": true,
      "text": "",
      "fontSize": 18,
      "fontWeight": 800,
      "color": "#0a3156",
      "readyColor": "#0a3156"
    }
  ]
};
}
function repairDesignHasUsableLayers(d){return d&&Array.isArray(d.layers)&&d.layers.length;}
function normalizeRepairDesign(d){
  const out=JSON.parse(JSON.stringify(repairDesignHasUsableLayers(d)?d:defaultRepairUiDesign()));
  const defaults=defaultRepairUiDesign();
  out.version=out.version||3;
  out.stage={...defaults.stage,...(out.stage||{}),backgroundBox:{...defaults.stage.backgroundBox,...((out.stage||{}).backgroundBox||{})}};
  out.timing={...defaults.timing,...(out.timing||{})};
  const existing=new Set((out.layers||[]).map(l=>l.id));
  defaults.layers.forEach(def=>{if(!existing.has(def.id))out.layers.push(JSON.parse(JSON.stringify(def)));});
  return out;
}
function getRepairUiDesign(){
  if(!PUBLIC_BUILD){
    try{const saved=JSON.parse(storageGet(REPAIR_UI_DESIGN_STORE_KEY,"null")); if(repairDesignHasUsableLayers(saved))return normalizeRepairDesign(saved);}catch{}
  }
  if(repairDesignHasUsableLayers(DATA.repairUiDesign))return normalizeRepairDesign(DATA.repairUiDesign);
  return defaultRepairUiDesign();
}
function repairTokenText(layer,v,phase,dots=3){
  const completion=!!(v&&v.isVehicleCompletion);
  const normalText=layer.text||"";
  const completionText=layer.completionText||normalText;
  if(layer.token==="venueName")return completion?completionText:(v.name||normalText);
  if(layer.token==="componentName")return completion?completionText:(v.component||normalText);
  if(layer.token==="status"){
    if(phase==="repaired")return layer.repairedText||"Repaired";
    const base=(layer.repairingText||"Repairing").replace(/\.*$/g,"");
    return base+".".repeat(dots||3);
  }
  if(layer.token==="takeHome")return completion?completionText:(normalText||"Take Component Home");
  return completion?completionText:normalText;
}
const REPAIR_TRANSITION_VIDEO="assets/Repair Transition Animation.webm";
const REPAIR_TIMING_DEFAULTS={crossfadeStartMs:3000,crossfadeMs:2000,transitionFadeStartMs:6000,transitionFadeMs:2000,totalMs:8000,dotMs:360};
function repairLayerSrc(layer,v){
  const component=DATA.components[v.key]||{};
  if(layer.type==="component")return layer.componentState==="fixed"?(component.fixed||component.broken||""):(component.broken||"");
  return layer.src||"";
}
function layerShouldShow(layer,phase,stage){
  let show=!layer.phase||layer.phase==="always"||layer.phase===phase;
  if(layer.type==="component"){
    if(phase==="repaired")show=layer.componentState==="fixed";
    else if(layer.componentState==="fixed")show=!!stage.__repairCrossfadeStarted;
    else show=true;
  }
  return show;
}
function setRepairPhase(stage,phase,dots=3){
  stage.querySelectorAll("[data-repair-layer]").forEach(el=>{
    const layer=JSON.parse(el.dataset.repairLayer);
    const show=layerShouldShow(layer,phase,stage);
    el.classList.toggle("repairPhaseHidden",!show);
    if(layer.type==="text"){
      el.textContent=repairTokenText(layer,stage.__repairVenue,phase,dots);
      if(layer.token==="status")el.style.color=phase==="repaired"?(layer.readyColor||"#237a35"):(layer.color||"#0a3156");
      if(layer.token==="takeHome"){
        el.style.color=phase==="repaired"?(layer.readyColor||"#0a3156"):(layer.color||"#8f8877");
        el.classList.toggle("isDisabled",phase!=="repaired");
        el.classList.toggle("isReady",phase==="repaired");
      }
    }
    if(layer.type==="component"&&layer.componentState==="fixed")el.classList.toggle("repairFixedGlow",phase==="repaired"&&!!layer.glow);
  });
}
function applyLayerBox(el,l){
  Object.assign(el.style,{left:(l.x||0)+"px",top:(l.y||0)+"px",width:(l.w||40)+"px",height:(l.h||40)+"px",zIndex:l.z??10,opacity:String(l.opacity??1),transform:`rotate(${l.r||0}deg)`});
}
function repairDesignLayer(stage,layer,v){
  const l={x:0,y:0,w:40,h:40,z:10,opacity:1,r:0,phase:"always",objectFit:"contain",...layer};
  const el=document.createElement("div");
  el.className="repairDesignLayer"+(l.type==="text"?" repairDesignText":" repairDesignImage")+(l.token==="takeHome"?" repairLayerTakeHome isDisabled":"")+(l.type==="component"?" repairComponentLayer":"");
  el.dataset.repairLayer=JSON.stringify(l);
  el.dataset.repairLayerId=l.id||"";
  if(editorMode()){el.classList.add("liveEditableLayer");el.dataset.liveLayerId=l.id||"";el.dataset.liveLayerName=l.name||l.id||"Repair layer";el.dataset.liveLayerType=l.type||"repair";}
  applyLayerBox(el,l);
  if(l.type==="text"){
    Object.assign(el.style,{fontFamily:l.fontFamily||"Georgia,'Times New Roman',serif",fontSize:(l.fontSize||18)+"px",fontWeight:l.fontWeight||800,color:l.color||"#0a3156",justifyContent:l.align==="left"?"flex-start":l.align==="right"?"flex-end":"center",textAlign:l.align||"center",lineHeight:l.lineHeight||"1.02"});
    el.textContent=repairTokenText(l,v,"repairing",3);
  }else if(l.type==="video"){
    const video=document.createElement("video");
    video.src=repairLayerSrc(l,v)||REPAIR_TRANSITION_VIDEO;
    video.autoplay=true;
    video.muted=l.muted!==false;
    video.playsInline=l.playsInline!==false;
    video.loop=!!l.loop;
    video.preload="auto";
    video.setAttribute("webkit-playsinline","true");
    Object.assign(video.style,{width:"100%",height:"100%",objectFit:l.objectFit||"contain",display:"block"});
    el.appendChild(video);
  }else{
    const img=document.createElement("img");
    img.alt=l.name||"Repair layer";
    img.src=repairLayerSrc(l,v);
    img.style.objectFit=l.objectFit||"contain";
    el.appendChild(img);
    if(l.type==="component"&&l.componentState==="fixed")el.style.opacity="0";
  }
  stage.appendChild(el);
  return el;
}

function componentFadeWindow(timing,state){
  const baseStart=timing.crossfadeStartMs||REPAIR_TIMING_DEFAULTS.crossfadeStartMs;
  const baseEnd=baseStart+(timing.crossfadeMs||REPAIR_TIMING_DEFAULTS.crossfadeMs);
  if(state==="broken")return [timing.brokenFadeStartMs??baseStart,timing.brokenFadeEndMs??baseEnd];
  return [timing.fixedFadeStartMs??baseStart,timing.fixedFadeEndMs??baseEnd];
}
function scheduleComponentOpacity(stage,timing,timers){
  stage.__repairCrossfadeStarted=true;
  stage.querySelectorAll('[data-repair-layer]').forEach(el=>{
    let layer;
    try{layer=JSON.parse(el.dataset.repairLayer)}catch{return}
    if(layer.type!=="component")return;
    const state=layer.componentState==="fixed"?"fixed":"broken";
    const [start,end]=componentFadeWindow(timing,state);
    const duration=Math.max(1,end-start);
    el.style.transition="none";
    el.style.opacity=state==="fixed"?"0":"1";
    timers.push(setTimeout(()=>{
      el.style.transition=`opacity ${duration}ms ease-in-out, filter .3s ease`;
      el.style.opacity=state==="fixed"?"1":"0";
    },Math.max(0,start)));
  });
}

function fadeComponentImages(stage,timing){
  if(stage.__repairCrossfadeStarted)return;
  stage.__repairCrossfadeStarted=true;
  setRepairPhase(stage,"repairing",3);
  const fadeMs=timing.crossfadeMs||REPAIR_TIMING_DEFAULTS.crossfadeMs;
  stage.querySelectorAll('[data-repair-layer]').forEach(el=>{
    const layer=JSON.parse(el.dataset.repairLayer);
    if(layer.type!=="component")return;
    el.style.transition=`opacity ${fadeMs}ms ease-in-out, filter .3s ease`;
    if(layer.componentState==="broken")el.style.opacity="0";
    if(layer.componentState==="fixed")el.style.opacity="1";
  });
}
function openPartRestoration(v,options={}){
  closePopup();
  const st=popupStage("repairStage");
  st.__repairVenue=v;
  st.__repairCrossfadeStarted=false;
  st.__repairOptions=options||{};
  const design=normalizeRepairDesign(getRepairUiDesign());
  const timing={...REPAIR_TIMING_DEFAULTS,...(design.timing||{})};
  const bgBox=design.stage?.backgroundBox||{x:0,y:-39,w:390,h:844};
  const repairBg=imgLayer(st,{...bgBox,name:"Repair UI background",z:0,opacity:1},design.stage?.background||"assets/repair_ui_background_v78.png");
  repairBg.classList.add("repairBackgroundLayer");
  const layers=[...(design.layers||[])].sort((a,b)=>(a.z||0)-(b.z||0));
  const rendered=layers.map(layer=>repairDesignLayer(st,layer,v));
  const transitionEls=rendered.filter(el=>{
    try{return JSON.parse(el.dataset.repairLayer).type==="video";}catch{return false;}
  });
  setRepairPhase(st,"repairing",3);

  let dots=0,done=false;
  const timers=[];
  const clearAll=()=>{while(timers.length)clearTimeout(timers.pop());};
  const dotTimer=setInterval(()=>{if(done)return;dots=(dots%3)+1;setRepairPhase(st,"repairing",dots);},timing.dotMs||360);
  const fadeTransition=()=>{
    if(done)return;
    transitionEls.forEach(el=>{el.style.transition=`opacity ${timing.transitionFadeMs||2000}ms linear`;el.style.opacity="0";});
  };
  const finish=()=>{
    if(done)return;
    done=true;
    clearInterval(dotTimer);
    clearAll();
    fadeComponentImages(st,timing);
    transitionEls.forEach(el=>{const v=el.querySelector("video"); if(v)try{v.pause();}catch{} el.style.opacity="0";});
    setRepairPhase(st,"repaired",3);
    st.querySelectorAll('[data-repair-layer]').forEach(el=>{
      const layer=JSON.parse(el.dataset.repairLayer);
      if(layer.type==="component"&&layer.componentState==="fixed")el.style.opacity="1";
      if(layer.type==="component"&&layer.componentState==="broken")el.style.opacity="0";
    });
    const takeLayer=layers.find(l=>l.token==="takeHome")||{x:47,y:418,w:296,h:50};
    if(v&&v.isVehicleCompletion){
      hit(st,takeLayer.x,takeLayer.y,takeLayer.w,takeLayer.h,()=>{sellVehicleAndStartAgain();},"Sell vehicle and start again");
    }else{
      hit(st,takeLayer.x,takeLayer.y,takeLayer.w,takeLayer.h,()=>{
        repairFlowActive=false;
        closePopup();
        renderHome();
        if(allRepaired()&&state.routeCompleted)openVehicleCompletionRestoration();
      },"Take component home");
    }
  };
  scheduleComponentOpacity(st,timing,timers);
  timers.push(setTimeout(fadeTransition,timing.transitionFadeStartMs||6000));
  timers.push(setTimeout(finish,timing.totalMs||8000));
  transitionEls.forEach(el=>{
    const vid=el.querySelector("video");
    if(!vid)return;
    vid.currentTime=0;
    vid.addEventListener("error",()=>{fadeComponentImages(st,timing);fadeTransition();finish();},{once:true});
    const playPromise=vid.play();
    if(playPromise&&typeof playPromise.catch==="function")playPromise.catch(()=>{});
  });
}

function openWebPopup(url,title,externalUrl=url){
  if(!url)return;
  closePopup();
  const d=document.createElement("div");
  d.className="webPanel";
  d.innerHTML=`<div class="webBar"><strong>${esc(title)}</strong><a href="${esc(externalUrl)}" target="_blank" rel="noopener">Open full page</a><button type="button" data-close aria-label="Close">×</button></div><div class="webFrameWrap"><iframe title="${esc(title)}" referrerpolicy="no-referrer-when-downgrade" allowfullscreen src="${esc(url)}"></iframe></div>`;
  overlayRoot.appendChild(d);
  d.querySelector("[data-close]").onclick=()=>d.remove();
}
function openMap(){openWebPopup(DATA.routeMapUrl||"https://www.google.com/maps","Route Map");}
function openBanter(){openWebPopup(DATA.banterWidgetUrl||"https://widgets.justgiving.com/crowdfunding-pledge-box/?id=burtonbanter&layout=large&showStory=true","Banter Box",DATA.banterUrl||DATA.banterWidgetUrl);}
function showFilePreviewNotice(){
  card(`<h2>Local Test Mode</h2><p>You can test the app from this file. Camera scanning still needs a proper local server or HTTPS, but the scanner-page test icons will work.</p><button data-close>Continue Testing</button>`);
}
function badUsername(name){const low=name.toLowerCase();if(!new RegExp(DATA.usernameRules.pattern).test(name))return"Username must be 3–20 characters using letters, numbers, underscore or hyphen.";if((DATA.usernameRules.blocked||[]).some(w=>low.includes(w)))return"That username is not allowed.";return"";}
function openAuthPanel(mode="login",msg=""){closeAuthPanel();const d=document.createElement("div");d.id="authPanel";d.className="authPanel";d.innerHTML=`<div class="authCard"><h2>${mode==="register"?"Create Account":mode==="complete"?"Complete Account":"Sign In"}</h2>${msg?`<p class="authError">${esc(msg)}</p>`:""}<div id="authFields"></div></div>`;document.body.appendChild(d);const f=d.querySelector("#authFields");if(mode==="register"||mode==="complete"){f.innerHTML=`<input id="authEmail" type="email" autocomplete="email" placeholder="Email address" value="${esc(state.email||storageGet('restorationRouteLastEmail',''))}"><input id="authPassword" type="password" autocomplete="${mode==="complete"?"current-password":"new-password"}" placeholder="Password"><input id="authUsername" autocomplete="username" placeholder="Public username" value="${esc(state.username||"")}"><label class="check"><input id="authTerms" type="checkbox" ${state.termsAccepted?"checked":""}> I agree to The Restoration Route storing my email, username and route progress for prize draw and app operation purposes. Organiser: ${esc(DATA.terms.organiser)}. Contact: ${esc(DATA.terms.contactEmail)}.</label><button id="createAccount">${mode==="complete"?"Save Account Details":"Create Account"}</button><button id="switchLogin">Already have an account? Sign in</button>`;document.getElementById("createAccount").onclick=()=>handleRegister(mode==="complete");document.getElementById("switchLogin").onclick=()=>openAuthPanel("login");}else{f.innerHTML=`<input id="authEmail" type="email" autocomplete="email" placeholder="Email address" value="${esc(state.email||storageGet('restorationRouteLastEmail',''))}"><input id="authPassword" type="password" autocomplete="current-password" placeholder="Password"><button id="loginButton">Sign In</button><button id="switchRegister">Create Account</button>`;document.getElementById("loginButton").onclick=handleLogin;document.getElementById("switchRegister").onclick=()=>openAuthPanel("register");}}
function closeAuthPanel(){document.querySelectorAll("#authPanel").forEach(x=>x.remove())}
async function reserveUsername(username,uid){const u=username.toLowerCase(),ref=fb.doc(db,"usernames",u),snap=await fb.getDoc(ref);if(snap.exists()&&snap.data().uid!==uid)throw new Error("That username is already taken.");await fb.setDoc(ref,{uid,username,usernameLower:u,updatedAt:fb.serverTimestamp()},{merge:true});}
async function handleRegister(updateOnly=false){const email=document.getElementById("authEmail").value.trim(),pass=document.getElementById("authPassword").value,user=document.getElementById("authUsername").value.trim(),terms=document.getElementById("authTerms").checked,bad=badUsername(user); if(email)storageSet("restorationRouteLastEmail",email);if(bad)return openAuthPanel(updateOnly?"complete":"register",bad);if(!terms)return openAuthPanel(updateOnly?"complete":"register","You need to accept the terms to use the app.");try{if(updateOnly&&currentUser){await reserveUsername(user,currentUser.uid);state.username=user;state.termsAccepted=true;await fb.updateProfile(currentUser,{displayName:user}).catch(()=>{});await saveCloud();closeAuthPanel();return}const cred=await fb.createUserWithEmailAndPassword(auth,email,pass);currentUser=cred.user;await reserveUsername(user,cred.user.uid);await fb.updateProfile(cred.user,{displayName:user}).catch(()=>{});await fb.sendEmailVerification(cred.user).catch(()=>{});state={...defaultState(),uid:cred.user.uid,email,username:user,termsAccepted:true,emailVerified:false};await saveCloud();closeAuthPanel();openProfile("Verification email sent. Progress saves now. Prize entries become eligible once your email is verified.");}catch(e){openAuthPanel(updateOnly?"complete":"register",e.message||"Could not create account.");}}
async function handleLogin(){try{const email=document.getElementById("authEmail").value.trim(); if(email)storageSet("restorationRouteLastEmail",email); await fb.signInWithEmailAndPassword(auth,email,document.getElementById("authPassword").value)}catch(e){openAuthPanel("login",e.message||"Could not sign in.")}}
function openProfile(msg=""){card(`<h2>Profile</h2>${msg?`<p>${esc(msg)}</p>`:""}<p>Email: ${esc(state.email||"")}</p><p>Username: ${esc(state.username||"")}</p><p>Email verified: ${state.emailVerified?"Yes":"No"}</p>${!state.emailVerified?'<button id="resendVerification">Resend Verification Email</button><button id="refreshVerification">I Verified It</button>':""}<button data-close>Close</button>`,()=>{const r=document.getElementById("resendVerification");if(r)r.onclick=()=>currentUser&&fb.sendEmailVerification(currentUser);const rf=document.getElementById("refreshVerification");if(rf)rf.onclick=async()=>{await fb.reload(currentUser);state.emailVerified=!!auth.currentUser.emailVerified;await saveCloud();closeCard();openProfile();}});}
function openLeaderboard(){card(`<h2>Vehicles Restored</h2><p>Completed vehicles: <strong>${state.completedVehicles}</strong></p><p>Prize entries: <strong>${state.prizeEntries}</strong></p><p>Pending entries until email verification: <strong>${state.pendingPrizeEntries}</strong></p><p>Total parts restored: <strong>${state.totalPartsRestored}</strong></p><button data-close>Close</button>`);}
function openIssues(){location.href=`mailto:${DATA.terms.contactEmail}?subject=The%20Restoration%20Route%20Issue&body=${encodeURIComponent("User: "+(state.username||"")+"\nEmail: "+(state.email||"")+"\n\nIssue:\n")}`;}
function openLogout(){card(`<h2>Log Out</h2><p>Progress is saved to your account if online sync has completed.</p><button id="logoutConfirm">Log Out</button><button data-close>Cancel</button>`,()=>{document.getElementById("logoutConfirm").onclick=async()=>{try{if(auth&&fb?.signOut)await fb.signOut(auth)}catch(e){} currentUser=null; state=defaultState(); try{localStorage.removeItem(STORE_KEY);localStorage.removeItem("restorationRouteLastEmail")}catch(e){} closeCard(); renderHome(); openAuthPanel("register")}});}
function openAdmin(){card(`<h2>Garage Admin</h2><input id="adminCode" placeholder="Code"><button id="adminUnlock">Unlock</button><button data-close>Close</button>`,()=>{document.getElementById("adminUnlock").onclick=()=>{if(document.getElementById("adminCode").value!==ADMIN_CODE)return;closeCard();card(`<h2>Chip’s Big Red Button</h2><button id="repairAll">Repair All Components</button><button id="completeVehicle">Complete Vehicle</button><button id="resetVehicle">Reset Current Vehicle</button><button data-close>Close</button>`,()=>{document.getElementById("repairAll").onclick=async()=>{DATA.venues.forEach(v=>state.repaired[v.id]=true);state.routeCompleted=true;await saveCloud();closeCard();renderHome();openVehicleCompletionRestoration()};document.getElementById("completeVehicle").onclick=async()=>{await completeVehicle("admin_complete");closeCard();renderHome()};document.getElementById("resetVehicle").onclick=async()=>{state.repaired=baseRepaired();state.hornBroken=false;state.routeCompleted=false;storageSet(COMPLETION_NOTICE_KEY,"");await saveCloud();closeCard();renderHome()};})}});}
function card(html,after){const d=document.createElement("div");d.className="popCard";d.innerHTML=html;overlayRoot.appendChild(d);d.querySelectorAll("[data-close]").forEach(b=>b.onclick=closeCard);if(after)after();}
function closeCard(){overlayRoot.querySelectorAll(".popCard").forEach(c=>c.remove())}
function esc(s){return String(s).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[c]))}
function hornHit(stage,x,y,w,h,hoverLayer=null){
  const b=document.createElement("button");
  b.className="hit hornHit";
  Object.assign(b.style,{left:x+"px",top:y+"px",width:w+"px",height:h+"px"});
  b.title="Horn";
  b.setAttribute("aria-label","Horn");
  if(hoverLayer){
    hoverLayer.classList.add("interactiveImage");
    const on=()=>hoverLayer.classList.add("isHover");
    const off=()=>hoverLayer.classList.remove("isHover");
    b.addEventListener("mouseenter",on);
    b.addEventListener("mouseleave",off);
    b.addEventListener("focus",on);
    b.addEventListener("blur",off);
    b.addEventListener("pointerdown",on);
    b.addEventListener("pointerup",off);
    b.addEventListener("pointercancel",off);
  }
  b.addEventListener("contextmenu",e=>e.preventDefault());
  b.addEventListener("pointerdown",e=>{e.preventDefault();try{b.setPointerCapture(e.pointerId)}catch{};startHornPress();});
  b.addEventListener("pointerup",e=>{e.preventDefault();stopHornPress(false);});
  b.addEventListener("pointercancel",()=>stopHornPress(true));
  b.addEventListener("pointerleave",e=>{if(e.buttons===0)stopHornPress(false);});
  stage.appendChild(b);
}
async function ensureHornAudio(){
  const src=DATA.assets?.audio?.horn||DATA.audio?.horn||"assets/horn_noise.mp3";
  try{
    if(!hornAudioContext)hornAudioContext=new (window.AudioContext||window.webkitAudioContext)();
    if(hornAudioContext.state==="suspended")await hornAudioContext.resume();
    if(!hornBuffer){
      const res=await fetch(src,{cache:"force-cache"});
      const arr=await res.arrayBuffer();
      hornBuffer=await hornAudioContext.decodeAudioData(arr.slice(0));
    }
    return "webAudio";
  }catch(e){
    if(!hornFallbackAudio){
      hornFallbackAudio=new Audio(src);
      hornFallbackAudio.loop=true;
      hornFallbackAudio.preload="auto";
    }
    return "htmlAudio";
  }
}
async function playHornLoop(){
  clearTimeout(hornStopTimer);
  hornStopTimer=null;
  const mode=await ensureHornAudio();
  if(!hornPressed&&Date.now()-hornPressStartedAt>260)return;
  if(mode==="webAudio"&&hornAudioContext&&hornBuffer){
    if(hornSource)return;
    hornGain=hornAudioContext.createGain();
    hornGain.gain.value=0.92;
    hornSource=hornAudioContext.createBufferSource();
    hornSource.buffer=hornBuffer;
    hornSource.loop=true;
    hornSource.connect(hornGain).connect(hornAudioContext.destination);
    hornSource.onended=()=>{hornSource=null;hornGain=null;};
    hornSource.start(0);
  }else if(hornFallbackAudio){
    hornFallbackAudio.currentTime=0;
    await hornFallbackAudio.play().catch(()=>{});
  }
}
function stopHornAudio(force=false){
  hornPressed=false;
  clearTimeout(hornHoldTimer); hornHoldTimer=null;
  const stopNow=()=>{
    clearTimeout(hornStopTimer); hornStopTimer=null;
    if(hornSource){try{hornSource.stop(0)}catch{} hornSource=null;}
    if(hornGain){try{hornGain.disconnect()}catch{} hornGain=null;}
    if(hornFallbackAudio){hornFallbackAudio.pause();hornFallbackAudio.currentTime=0;}
  };
  const elapsed=Date.now()-hornPressStartedAt;
  if(!force&&elapsed>0&&elapsed<230){
    clearTimeout(hornStopTimer);
    hornStopTimer=setTimeout(stopNow,230-elapsed);
  }else stopNow();
}
async function breakHorn(reason="misuse"){
  if(state.hornBroken)return;
  state.hornBroken=true;
  state.hornBrokenCount=(state.hornBrokenCount||0)+1;
  stopHornAudio(true);
  await saveCloud();
  renderHome();
  const detail=reason==="held"?"The horn has been held down for too long.":"The horn has been pressed too many times too quickly.";
  card(`<h2>Horn Broken</h2><p>${detail}</p><p>The horn is broken due to misuse. Maybe it could be repaired at a later date.</p><button data-close>Close</button>`);
}
function startHornPress(){
  if(!requireLogin())return;
  if(state.hornBroken){card(`<h2>Horn Broken</h2><p>The horn is already broken. Maybe it could be repaired at a later date.</p><button data-close>Close</button>`);return;}
  const now=Date.now();
  hornPressed=true;
  hornPressStartedAt=now;
  hornTapTimes=hornTapTimes.filter(t=>now-t<10000);
  hornTapTimes.push(now);
  if(hornTapTimes.length>7){breakHorn("rapid");return;}
  playHornLoop();
  clearTimeout(hornHoldTimer);
  hornHoldTimer=setTimeout(()=>breakHorn("held"),10000);
}
function stopHornPress(force=false){stopHornAudio(force);}

function completionNoticeId(){return `${state.uid||"local"}:${state.currentVehicle||1}:${repairedCount()}`;}
function completionNoticeSeen(){return storageGet(COMPLETION_NOTICE_KEY,"")===completionNoticeId();}
function markCompletionNoticeSeen(){storageSet(COMPLETION_NOTICE_KEY,completionNoticeId());}
function maybeShowRouteComplete(){
  if(repairFlowActive)return;
  if(!allRepaired())return;
  if(!state.routeCompleted)return;
  if(completionNoticeSeen())return;
  markCompletionNoticeSeen();
  openVehicleCompletionRestoration();
}
function routePrizeText(){
  if(state.emailVerified||auth?.currentUser?.emailVerified)return `You have earned a prize draw entry.`;
  return `Your prize draw entry is pending until your email address is verified.`;
}
function completionVehicleData(){
  return {
    id:"completed-vehicle",
    name:"Congratulations",
    component:"You have fully restored a vehicle back to working order",
    key:"vehicle",
    isVehicleCompletion:true
  };
}
function openVehicleCompletionRestoration(){
  closeCard();
  repairFlowActive=true;
  openPartRestoration(completionVehicleData(),{completion:true});
}
function openRouteCompleteCard(){openVehicleCompletionRestoration();}
async function sellVehicleAndStartAgain(){
  state.completedVehicles=(state.completedVehicles||0)+1;
  if(state.emailVerified||auth?.currentUser?.emailVerified)state.prizeEntries=(state.prizeEntries||0)+1;
  else state.pendingPrizeEntries=(state.pendingPrizeEntries||0)+1;
  state.currentVehicle=(state.currentVehicle||1)+1;
  state.repaired=baseRepaired();
  state.routeCompleted=false;
  state.hornBroken=false;
  state.hornRestoredCount=(state.hornRestoredCount||0)+1;
  state.log.push({type:"sell_vehicle_start_again",at:new Date().toISOString()});
  storageSet(COMPLETION_NOTICE_KEY,"");
  await saveCloud();
  repairFlowActive=false;
  closeCard();
  closePopup();
  renderHome();
}
async function resetRouteForNextVehicle(){return sellVehicleAndStartAgain();}


async function repairVenue(id,source="scan"){
  if(!requireLogin())return;
  const v=venueById(id);if(!v)return;
  const was=!!state.repaired[id];
  if(!was){state.repaired[id]=true;state.totalPartsRestored=(state.totalPartsRestored||0)+1;}
  await scanEvent(id,source,was);
  if(!was&&allRepaired()&&!state.routeCompleted){
    state.routeCompleted=true;
    state.log.push({type:"vehicle_ready_to_sell",at:new Date().toISOString()});
  }
  await saveCloud();
  repairFlowActive=!was;
  renderHome();
  if(was){repairFlowActive=false;openVenue(id);}else openPartRestoration(v);
}
async function scanEvent(id,source,dup){if(!firebaseReady||!currentUser)return;await fb.addDoc(fb.collection(db,"scanEvents"),{uid:currentUser.uid,email:currentUser.email||state.email||"",username:state.username||"",venueId:id,source,duplicate:dup,vehicleNumber:state.currentVehicle||1,accepted:true,createdAt:fb.serverTimestamp()}).catch(()=>{});}
async function completeVehicle(type){if(!allRepaired())return;state.log.push({type,at:new Date().toISOString()});await sellVehicleAndStartAgain();}
async function processScanToken(raw,source="qr_scan"){
  if(!requireLogin())return null;
  const v=await matchToken(raw);
  if(!v){card(`<h2>Route Code Not Recognised</h2><p>This code could not be recognised. Please centre the private route code in the scanner and try again.</p><button data-close>Close</button>`);return null;}
  await repairVenue(v.id,source);
  return v;
}
function openScanner(){
  if(!requireLogin())return;
  closePopup();scannerRoot.innerHTML="";scannerRoot.style.display="block";
  const st=makeStage("scannerStage");
  DATA.layout.scanner.layers.forEach(l=>{if(l.type==="image"&&!l.name.toLowerCase().includes("scanner home"))imgLayer(st,l)});
  const vp=document.createElement("div");vp.className="videoBox";Object.assign(vp.style,{left:"64px",top:"119px",width:"262px",height:"282px"});
  const video=document.createElement("video");video.setAttribute("playsinline","");video.muted=true;vp.appendChild(video);st.appendChild(vp);
  const h=DATA.layout.scanner.layers.find(l=>l.name.toLowerCase().includes("scanner home"));
  if(h){
    const buttonW=Math.round(h.h*997/649);
    const buttonLayer={...h,x:h.x+(h.w-buttonW)/2,w:buttonW,z:450};
    const homeLayer=imgLayer(st,buttonLayer,DATA.assets.scannerHomeButton);
    hit(st,buttonLayer.x,buttonLayer.y,buttonLayer.w,buttonLayer.h,closeScanner,"Home",homeLayer);
  }else hit(st,263,505,103,67,closeScanner,"Home");
  // Public build: scanner repair test buttons disabled.
  // addScannerRepairTestButtons(st);
  scannerRoot.appendChild(st);
  if(IS_FILE_PREVIEW){
    vp.classList.add("localCameraPlaceholder");
    vp.innerHTML=`<div class="localCameraMessage"><strong>Local file test mode</strong><br>Camera scanning needs Live Server/HTTPS.<br>Open the hosted GitHub Pages version to scan route QR codes.</div>`;
  }else{
    startScanner(video);
  }
}

// DEV TEST BUTTONS: remove this function call and function when the repair scan flow is fully tested.
function addScannerRepairTestButtons(st){
  const venues=DATA.venues||[];
  const size=28;
  const gap=7;
  const startX=28;
  const startY=584;
  venues.forEach((v,i)=>{
    const component=DATA.components[v.key]||{};
    const x=startX+(i%4)*(size+gap);
    const y=startY+Math.floor(i/4)*(size+gap);
    const layer={x,y,w:size,h:size,r:0,opacity:.9,z:470,name:`TEST restore ${v.component}`};
    const visual=imgLayer(st,layer,component.broken);
    if(visual)visual.classList.add("scannerTestRepairIcon");
    hit(st,x-3,y-3,size+6,size+6,async()=>{
      scannerProcessing=true;
      stopScanner();
      scannerRoot.style.display="none";
      await repairVenue(v.id,"scanner_test_button");
    },`Test restore ${v.component}`,visual);
  });
}
function closeScanner(){stopScanner();scannerRoot.style.display="none";scannerRoot.innerHTML="";renderHome()}
async function startScanner(video){
  try{
    scannerProcessing=false;
    activeScannerStream=await navigator.mediaDevices.getUserMedia({video:{facingMode:{ideal:"environment"}},audio:false});
    video.srcObject=activeScannerStream;
    await video.play();

    const canvas=document.createElement("canvas"),ctx=canvas.getContext("2d",{willReadFrequently:true});
    const barcodeDetector=("BarcodeDetector" in window)?new BarcodeDetector({formats:["qr_code"]}):null;

    activeScannerTimer=setInterval(async()=>{
      if(scannerProcessing||video.readyState<2)return;
      canvas.width=video.videoWidth;
      canvas.height=video.videoHeight;
      ctx.drawImage(video,0,0);
      try{
        if(barcodeDetector){
          const codes=await barcodeDetector.detect(canvas);
          if(codes&&codes[0]){
            scannerProcessing=true;
            stopScanner();
            scannerRoot.style.display="none";
            await processScanToken(codes[0].rawValue,"qr_scan");
            return;
          }
        }
        const privateVenueId=detectPrivateRouteCode(canvas,ctx);
        if(privateVenueId){
          scannerProcessing=true;
          stopScanner();
          scannerRoot.style.display="none";
          await repairVenue(privateVenueId,"private_route_code");
        }
      }catch(e){
        scannerProcessing=false;
      }
    },500);
  }catch(e){
    card(`<h2>Camera Not Available</h2><p>The app could not open the camera. Check camera permission for this site/app and try again.</p><button data-close>Close</button>`);
  }
}

function rotateMarkerBits(bits){
  const out=[];
  for(let r=0;r<7;r++)for(let c=0;c<7;c++)out.push(bits[(6-c)*7+r]);
  return out;
}
function markerDistance(a,b){let d=0;for(let i=0;i<49;i++)if(String(a[i])!==String(b[i]))d++;return d;}
function bestPrivateMarkerMatch(bits){
  const patterns=DATA.privateMarkerPatterns||{};
  let best=null,bestDist=99,current=bits;
  for(let rot=0;rot<4;rot++){
    const flat=current.join("");
    for(const [pattern,venueId] of Object.entries(patterns)){
      const d=markerDistance(flat,pattern);
      if(d<bestDist){bestDist=d;best=venueId;}
    }
    current=rotateMarkerBits(current);
  }
  return {venueId:best,distance:bestDist};
}
function readPrivateRouteGrid(canvas,ctx,scale){
  const w=canvas.width,h=canvas.height;
  const grid=7;
  const size=Math.floor(Math.min(w,h)*scale);
  const startX=Math.floor((w-size)/2),startY=Math.floor((h-size)/2);
  const cell=size/grid;
  const values=[];
  for(let r=0;r<grid;r++){
    for(let c=0;c<grid;c++){
      const sample=Math.max(5,Math.floor(cell*0.38));
      const sx=Math.floor(startX+c*cell+(cell-sample)/2);
      const sy=Math.floor(startY+r*cell+(cell-sample)/2);
      if(sx<0||sy<0||sx+sample>canvas.width||sy+sample>canvas.height)return null;
      const img=ctx.getImageData(sx,sy,sample,sample).data;
      let total=0,count=0;
      for(let i=0;i<img.length;i+=4){
        total+=(img[i]*0.2126+img[i+1]*0.7152+img[i+2]*0.0722);
        count++;
      }
      values.push(total/count);
    }
  }
  const lo=Math.min(...values),hi=Math.max(...values);
  if(hi-lo<75)return null;
  const threshold=(lo+hi)/2;
  return values.map(v=>v<threshold?"1":"0");
}
function detectPrivateRouteCode(canvas,ctx){
  let best=null;
  for(const scale of [0.98,0.92,0.86,0.80,0.74,0.68,0.62]){
    const bits=readPrivateRouteGrid(canvas,ctx,scale);
    if(!bits)continue;
    const match=bestPrivateMarkerMatch(bits);
    if(!best||match.distance<best.distance)best=match;
  }
  // The printed route markers differ by at least 18 cells, so 6 mismatches leaves a safe margin
  // while still allowing blur, camera noise, and slight print/lighting variation.
  return best&&best.distance<=6?best.venueId:null;
}

function stopScanner(){if(activeScannerTimer)clearInterval(activeScannerTimer);activeScannerTimer=null;if(activeScannerStream){activeScannerStream.getTracks().forEach(t=>t.stop());activeScannerStream=null}}
async function matchToken(raw){let s=String(raw||""),token=s;try{const u=new URL(s);token=u.searchParams.get("scan")||u.searchParams.get("code")||s}catch{}const id=DATA.scanTokenHashes[await sha256(token.trim())];return id?venueById(id):null}
async function handleUrlScan(){const p=new URLSearchParams(location.search),code=p.get("scan")||p.get("venue")||p.get("code");if(!code)return;history.replaceState(null,"",location.pathname);const wait=setInterval(async()=>{if(appSessionActive()&&state.username&&state.termsAccepted){clearInterval(wait);await processScanToken(code,"qr_deeplink")}},300)}
function openPreviewFromUrl(){
  const p=new URLSearchParams(location.search),view=p.get("preview");
  if(view==="directory")openDirectory();
  else if(view&&venueById(view))openVenue(view);
}
window.addEventListener("load",async()=>{setScales();renderHome();if(previewMode())openPreviewFromUrl();await 

function liveEditorActiveStage(){return document.querySelector('#overlayRoot .stage,#scannerRoot .stage,#homeRoot .stage');}
function liveEditorLayerObject(el){
  const st=el.closest('.stage');
  if(!st)return null;
  if(el.classList.contains('repairDesignLayer')){
    const id=el.dataset.repairLayerId||el.dataset.liveLayerId;
    const design=ACTIVE_REPAIR_DESIGN||DATA.repairUiDesign;
    const layer=(design?.layers||[]).find(l=>(l.id||'')===id);
    return {layer,kind:'repair',design,screen:'repair'};
  }
  const id=el.dataset.liveLayerId;
  const screen=st.dataset.editorScreen||'';
  let layer=null, kind='layout';
  if(id){
    if(screen==='home')layer=(DATA.layout.home.layers||[]).find(l=>l.id===id);
    else if(screen==='menu')layer=(DATA.layout.menu.layers||[]).find(l=>l.id===id);
    else if(screen==='directory')layer=(DATA.layout.directory.layers||[]).find(l=>l.id===id);
    else if(screen==='venueTemplate')layer=(DATA.layout.venueTemplate.layers||[]).find(l=>l.id===id);
  }
  if(!layer && el.classList.contains('textLayer') && el.dataset.layoutKey){
    kind='textAdjust';
    layer={layoutKey:el.dataset.layoutKey, name:el.dataset.liveLayerName||'Text', x:parseFloat(el.style.left)||0, y:parseFloat(el.style.top)||0, w:parseFloat(el.style.width)||0, h:parseFloat(el.style.height)||0, r:0, opacity:parseFloat(el.style.opacity)||1, z:parseInt(el.style.zIndex||10,10), text:el.textContent||'', fontSize:parseFloat(el.style.fontSize)||12};
  }
  return {layer,kind,screen};
}
function liveEditorStagePoint(e,stage){
  const r=stage.getBoundingClientRect();
  return {x:(e.clientX-r.left)/(r.width/390), y:(e.clientY-r.top)/(r.height/844)};
}
function ensureLiveEditor(){
  if(!editorMode())return;
  document.body.classList.add('liveEditorMode');
  if(LIVE_EDITOR_READY)return;
  LIVE_EDITOR_READY=true;
  const panel=document.createElement('div');
  panel.id='liveEditorPanel';
  panel.innerHTML=`<div class="liveEditorHead"><strong>LIVE APP EDITOR</strong><button type="button" data-hide>–</button></div>
  <div class="liveEditorNote">This edits the real rendered app screen, not a copied preview. Click a visible layer, drag it, resize it, then save.</div>
  <div class="liveEditorScreens"><button data-screen="home">Home</button><button data-screen="repair">Repair engine</button><button data-screen="final">Final repair</button><button data-screen="directory">Directory</button><button data-screen="menu">Menu</button><button data-screen="scanner">Scanner</button><button data-screen="venue">Venue 1</button></div>
  <div class="liveSelected" data-selected>No layer selected</div>
  <div class="liveGrid"><label>X<input data-prop="x" type="number"></label><label>Y<input data-prop="y" type="number"></label><label>W<input data-prop="w" type="number"></label><label>H<input data-prop="h" type="number"></label><label>Rot<input data-prop="r" type="number"></label><label>Z<input data-prop="z" type="number"></label></div>
  <label class="liveField">Text<textarea data-prop="text"></textarea></label>
  <label class="liveField">Source<input data-prop="src"></label>
  <div class="liveActions"><button data-save>Save to app</button><button data-export>Copy JSON</button><button data-clear>Clear saved layout</button></div>
  <textarea data-json readonly></textarea>`;
  document.body.appendChild(panel);
  panel.querySelector('[data-hide]').onclick=()=>panel.classList.toggle('collapsed');
  panel.querySelector('[data-save]').onclick=saveLiveEditorLayout;
  panel.querySelector('[data-export]').onclick=exportLiveEditorJson;
  panel.querySelector('[data-clear]').onclick=()=>{if(confirm('Clear saved editor layout for this browser?')){localStorage.removeItem(FULL_APP_LAYOUT_STORE_KEY);localStorage.removeItem(REPAIR_UI_DESIGN_STORE_KEY);localStorage.removeItem('restorationRouteRepairUiDesign.v79');localStorage.removeItem('restorationRouteRepairUiDesign.v78');localStorage.removeItem('restorationRouteRepairUiDesign.v76');localStorage.removeItem('restorationRouteRepairUiDesign.v74');localStorage.removeItem('restorationRouteRepairUiDesign.v63');location.reload();}};
  panel.querySelectorAll('[data-screen]').forEach(b=>b.onclick=()=>liveEditorOpenScreen(b.dataset.screen));
  panel.querySelectorAll('[data-prop]').forEach(inp=>inp.addEventListener('input',liveEditorInspectorChanged));
  document.addEventListener('pointerdown',liveEditorPointerDown,true);
  document.addEventListener('pointermove',liveEditorPointerMove,true);
  document.addEventListener('pointerup',liveEditorPointerUp,true);
  document.addEventListener('keydown',liveEditorKeyDown);
}
function liveEditorOpenScreen(screen){
  closePopup(); scannerRoot.style.display='none';
  if(screen==='home')renderHome();
  if(screen==='repair')openPartRestoration(venueById('piston-club'),{source:'editor'});
  if(screen==='final')openVehicleCompletionRestoration();
  if(screen==='directory')openDirectory();
  if(screen==='menu')openMenu();
  if(screen==='scanner')openScanner();
  if(screen==='venue')openVenue('piston-club');
}
function liveEditorPointerDown(e){
  if(!editorMode()||e.target.closest('#liveEditorPanel'))return;
  const el=e.target.closest('.liveEditableLayer');
  if(!el)return;
  e.preventDefault(); e.stopPropagation();
  liveEditorSelect(el);
  const st=el.closest('.stage');
  const p=liveEditorStagePoint(e,st);
  const box=liveEditorBox(el);
  const resize=(Math.abs(p.x-(box.x+box.w))<18 && Math.abs(p.y-(box.y+box.h))<18) || e.altKey;
  LIVE_EDITOR_DRAG={el,stage:st,start:p,orig:box,mode:resize?'resize':'move'};
}
function liveEditorPointerMove(e){
  if(!LIVE_EDITOR_DRAG)return;
  e.preventDefault(); e.stopPropagation();
  const d=LIVE_EDITOR_DRAG,p=liveEditorStagePoint(e,d.stage), next={...d.orig};
  if(d.mode==='resize'){
    next.w=Math.max(4,Math.round((d.orig.w+p.x-d.start.x)*10)/10);
    next.h=Math.max(4,Math.round((d.orig.h+p.y-d.start.y)*10)/10);
  }else{
    next.x=Math.round((d.orig.x+p.x-d.start.x)*10)/10;
    next.y=Math.round((d.orig.y+p.y-d.start.y)*10)/10;
  }
  liveEditorApplyBox(d.el,next,true);
}
function liveEditorPointerUp(){LIVE_EDITOR_DRAG=null;}
function liveEditorKeyDown(e){
  if(!editorMode()||!LIVE_EDITOR_SELECTED||['INPUT','TEXTAREA','SELECT'].includes(document.activeElement?.tagName))return;
  const step=e.shiftKey?10:1, box=liveEditorBox(LIVE_EDITOR_SELECTED);
  if(e.key==='ArrowLeft'){box.x-=step}else if(e.key==='ArrowRight'){box.x+=step}else if(e.key==='ArrowUp'){box.y-=step}else if(e.key==='ArrowDown'){box.y+=step}else return;
  e.preventDefault(); liveEditorApplyBox(LIVE_EDITOR_SELECTED,box,true);
}
function liveEditorBox(el){return {x:parseFloat(el.style.left)||0,y:parseFloat(el.style.top)||0,w:parseFloat(el.style.width)||0,h:parseFloat(el.style.height)||0,r:parseFloat((el.style.getPropertyValue('--rotate')||el.style.transform||'0').match(/-?\d+(\.\d+)?/)?.[0]||0),opacity:parseFloat(el.style.opacity)||1,z:parseInt(el.style.zIndex||10,10)};}
function liveEditorSelect(el){
  document.querySelectorAll('.liveEditorSelected').forEach(x=>x.classList.remove('liveEditorSelected'));
  LIVE_EDITOR_SELECTED=el; el.classList.add('liveEditorSelected'); liveEditorUpdateInspector();
}
function liveEditorUpdateInspector(){
  const panel=document.getElementById('liveEditorPanel'); if(!panel)return;
  const el=LIVE_EDITOR_SELECTED, selected=panel.querySelector('[data-selected]');
  if(!el){selected.textContent='No layer selected';return;}
  const info=liveEditorLayerObject(el), l=info?.layer||{}, b=liveEditorBox(el);
  selected.textContent=(el.dataset.liveLayerName||l.name||'Layer')+' — '+(info?.kind||'layer');
  ['x','y','w','h','r','z'].forEach(k=>{const input=panel.querySelector(`[data-prop="${k}"]`); if(input)input.value=Math.round((b[k]||0)*10)/10;});
  const text=panel.querySelector('[data-prop="text"]'); if(text)text.value=l.text||l.completionText||el.textContent||'';
  const src=panel.querySelector('[data-prop="src"]'); if(src)src.value=l.src||el.dataset.liveLayerSource||'';
  liveEditorUpdateJson();
}
function liveEditorInspectorChanged(e){
  if(!LIVE_EDITOR_SELECTED)return;
  const panel=document.getElementById('liveEditorPanel'), el=LIVE_EDITOR_SELECTED, box=liveEditorBox(el);
  ['x','y','w','h','r','z'].forEach(k=>{const input=panel.querySelector(`[data-prop="${k}"]`); if(input&&input.value!=='')box[k]=Number(input.value)||0;});
  const info=liveEditorLayerObject(el), l=info?.layer;
  const src=panel.querySelector('[data-prop="src"]')?.value||'';
  const text=panel.querySelector('[data-prop="text"]')?.value||'';
  if(l){ if('src' in l)l.src=src; if(info.kind==='repair'&&l.type==='text'){l.text=text;if(l.token==='status')l.repairingText=text.replace(/\.*$/,'')||l.repairingText;} else if(l.type==='text'||info.kind==='textAdjust'){l.text=text;} }
  if(el.classList.contains('textLayer')||el.classList.contains('repairDesignText'))el.textContent=text;
  if(src&&el.querySelector('img'))el.querySelector('img').src=stableSrc(src,el.dataset.liveLayerName||'');
  if(src&&el.querySelector('video'))el.querySelector('video').src=stableSrc(src,el.dataset.liveLayerName||'');
  liveEditorApplyBox(el,box,true);
}
function liveEditorApplyBox(el,box,updateData){
  Object.assign(el.style,{left:box.x+'px',top:box.y+'px',width:box.w+'px',height:box.h+'px',zIndex:box.z});
  el.style.setProperty('--rotate',(box.r||0)+'deg');
  if(el.classList.contains('repairDesignLayer'))el.style.transform=`rotate(${box.r||0}deg)`;
  if(updateData){
    const info=liveEditorLayerObject(el), l=info?.layer;
    if(l){l.x=box.x;l.y=box.y;l.w=box.w;l.h=box.h;l.r=box.r||0;l.z=box.z;}
    if(info?.kind==='textAdjust'&&el.dataset.layoutKey){
      const base=JSON.parse(el.dataset.baseBox||'{}');
      layoutAdjustments[el.dataset.layoutKey]=cleanLayoutAdjustment({dx:box.x-(base.x||0),dy:box.y-(base.y||0),dw:box.w-(base.w||0),dh:box.h-(base.h||0),df:0});
      saveLayoutAdjustments();
    }
  }
  liveEditorUpdateInspector();
}
function saveLiveEditorLayout(){
  CUSTOM_FULL_LAYOUT_LOADED=true;
  if(ACTIVE_REPAIR_DESIGN)DATA.repairUiDesign=ACTIVE_REPAIR_DESIGN;
  const payload={version:74,updatedAt:new Date().toISOString(),layout:DATA.layout,repairUiDesign:DATA.repairUiDesign};
  localStorage.setItem(FULL_APP_LAYOUT_STORE_KEY,JSON.stringify(payload));
  localStorage.setItem(REPAIR_UI_DESIGN_STORE_KEY,JSON.stringify(DATA.repairUiDesign));
  localStorage.setItem('restorationRouteRepairUiDesign.v63',JSON.stringify(DATA.repairUiDesign));
  const p=document.getElementById('liveEditorPanel'); p?.classList.add('savedFlash'); setTimeout(()=>p?.classList.remove('savedFlash'),900);
  liveEditorUpdateJson();
}
function exportLiveEditorJson(){liveEditorUpdateJson(); const out=document.querySelector('#liveEditorPanel [data-json]'); out.focus(); out.select(); navigator.clipboard?.writeText(out.value).catch(()=>{});}
function liveEditorUpdateJson(){const out=document.querySelector('#liveEditorPanel [data-json]'); if(!out)return; out.value=JSON.stringify({version:74,layout:DATA.layout,repairUiDesign:ACTIVE_REPAIR_DESIGN||DATA.repairUiDesign,layoutAdjustments},null,2);}

initFirebase();await handleUrlScan()});
if("serviceWorker"in navigator)window.addEventListener("load",()=>navigator.serviceWorker.register("service-worker.js").catch(()=>{}));

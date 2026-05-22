
const DATA = window.RESTORATION_ROUTE_DATA;
const homeRoot = document.getElementById("homeRoot");
const overlayRoot = document.getElementById("overlayRoot");
const scannerRoot = document.getElementById("scannerRoot");
const STORE_KEY = "restorationRoute8VenueState.finished.v1";
const LAYOUT_STORE_KEY = STORE_KEY+".layoutDraft.v1";
const ADMIN_CODE = "Watson";
const IS_FILE_PREVIEW = location.protocol==="file:";
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

let auth=null, db=null, currentUser=null, firebaseReady=false, fb=null;
let activeScannerStream=null, activeScannerTimer=null, scannerProcessing=false;
let hornTapTimes=[];
let layoutAdjustments=loadLayoutAdjustments(), selectedLayoutEl=null, layoutEditorReady=false;
const BOOK_ASPECT=1122/1402;
const BOOK_ART_FRAME={x:-32+(452-(493*BOOK_ASPECT))/2,y:183,w:493*BOOK_ASPECT,h:493};
const VENUE_SOURCE_FRAME={x:0,y:(844-(390/BOOK_ASPECT))/2,w:390,h:390/BOOK_ASPECT};
const TAB_ORDER=["directory","piston-club","mr-watsons","gilks-garage","oily-rag","long-itch-diner","pats-baps","seven-mile","the-man-cave"];
const VENUE_PAGE_BY_ID={"piston-club":"venue1","mr-watsons":"venue2","gilks-garage":"venue3","oily-rag":"venue4","long-itch-diner":"venue5","pats-baps":"venue6","seven-mile":"venue7","the-man-cave":"venue8"};

function baseRepaired(){ const r={}; DATA.venues.forEach(v=>r[v.id]=false); return r; }
function defaultState(){
  return { uid:"", email:"", username:"", termsAccepted:false, emailVerified:false,
    repaired:baseRepaired(), completedVehicles:0, prizeEntries:0, pendingPrizeEntries:0,
    totalPartsRestored:0, currentVehicle:1, hornBroken:false, hornBrokenCount:0, hornRestoredCount:0, log:[] };
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
    return {...defaultState(),...saved,hornBroken:false,repaired:{...baseRepaired(),...(saved.repaired||{})}};
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
  try{
    const {initializeApp}=await import("https://www.gstatic.com/firebasejs/10.13.2/firebase-app.js");
    const authMod=await import("https://www.gstatic.com/firebasejs/10.13.2/firebase-auth.js");
    const fsMod=await import("https://www.gstatic.com/firebasejs/10.13.2/firebase-firestore.js");
    fb={...authMod,...fsMod};
    window.fb=fb;
    const app=initializeApp(DATA.firebaseConfig);
    auth=authMod.getAuth(app);
    if(IS_FILE_PREVIEW) await authMod.setPersistence(auth, authMod.inMemoryPersistence).catch(()=>{});
    else await authMod.setPersistence(auth, authMod.browserLocalPersistence).catch(()=>authMod.setPersistence(auth, authMod.inMemoryPersistence).catch(()=>{}));
    db=fsMod.getFirestore(app); firebaseReady=true;
    authMod.onAuthStateChanged(auth, async user=>{
      currentUser=user;
      if(user){ await loadCloud(user); renderHome(); closeAuthPanel(); if(previewMode())openPreviewFromUrl(); else if(!layoutMode()&&(!state.username||!state.termsAccepted)) openAuthPanel("complete"); }
      else { renderHome(); if(previewMode())openPreviewFromUrl(); else if(IS_FILE_PREVIEW)showFilePreviewNotice(); else if(!layoutMode())openAuthPanel("register"); }
    });
  }catch(e){ renderHome(); if(previewMode())openPreviewFromUrl(); else if(IS_FILE_PREVIEW)showFilePreviewNotice(); else if(!layoutMode())openAuthPanel("register","Firebase could not load. Check Firebase setup/internet."); }
}
async function loadCloud(user){
  state.uid=user.uid; state.email=user.email||""; state.emailVerified=!!user.emailVerified;
  const ref=fb.doc(db,"userVisits",user.uid), snap=await fb.getDoc(ref);
  if(snap.exists()){
    const saved=snap.data();
    state={...defaultState(),...saved,uid:user.uid,email:user.email||saved.email||"",emailVerified:!!user.emailVerified,hornBroken:false,repaired:{...baseRepaired(),...(saved.repaired||{})}};
  }else state.hornBroken=false;
  hornTapTimes=[];
  await saveCloud();
}
async function saveCloud(){
  saveLocal();
  if(!firebaseReady||!currentUser) return;
  const data={uid:currentUser.uid,email:currentUser.email||state.email||"",username:state.username||"",termsAccepted:!!state.termsAccepted,emailVerified:!!currentUser.emailVerified,
    repaired:state.repaired,completedVehicles:state.completedVehicles||0,prizeEntries:state.prizeEntries||0,pendingPrizeEntries:state.pendingPrizeEntries||0,totalPartsRestored:state.totalPartsRestored||0,
    currentVehicle:state.currentVehicle||1,hornBroken:!!state.hornBroken,hornBrokenCount:state.hornBrokenCount||0,hornRestoredCount:state.hornRestoredCount||0,updatedAt:fb.serverTimestamp()};
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

function setScales(){
  const w=innerWidth,h=innerHeight,bw=390,bh=844;
  const mobile=w<=700&&w<h;
  const s=mobile?w/bw:Math.min(w/bw,h/bh);
  const homeS=mobile?Math.min(w/bw,h/bh):s;
  const left=Math.max(0,(w-bw*s)/2);
  const top=mobile?0:Math.max(0,(h-bh*s)/2);
  const homeLeft=Math.max(0,(w-bw*homeS)/2);
  const homeTop=Math.max(0,(h-bh*homeS)/2);
  const popupScale=w/BOOK_ART_FRAME.w;
  const popupTop=BOOK_ART_FRAME.h*popupScale<h?(h-BOOK_ART_FRAME.h*popupScale)/2-BOOK_ART_FRAME.y*popupScale:-BOOK_ART_FRAME.y*popupScale;
  document.documentElement.style.setProperty("--homeScale",homeS);
  document.documentElement.style.setProperty("--popupScale",popupScale);
  document.documentElement.style.setProperty("--menuScale",s);
  document.documentElement.style.setProperty("--scannerScale",s);
  document.documentElement.style.setProperty("--homeLeft",homeLeft+"px");
  document.documentElement.style.setProperty("--homeTop",homeTop+"px");
  document.documentElement.style.setProperty("--stageLeft",left+"px");
  document.documentElement.style.setProperty("--stageTop",top+"px");
  document.documentElement.style.setProperty("--popupLeft",(-BOOK_ART_FRAME.x*popupScale)+"px");
  document.documentElement.style.setProperty("--popupTop",popupTop+"px");
}
addEventListener("resize",setScales);
function makeStage(c){const s=document.createElement("div");s.className="stage "+c;return s;}
function layoutMode(){return new URLSearchParams(location.search).has("layout");}
function previewMode(){return new URLSearchParams(location.search).has("preview");}
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
function mapVenueLayer(l){const sx=BOOK_ART_FRAME.w/VENUE_SOURCE_FRAME.w,sy=BOOK_ART_FRAME.h/VENUE_SOURCE_FRAME.h;const avg=(sx+sy)/2;return {...l,x:BOOK_ART_FRAME.x+(l.x-VENUE_SOURCE_FRAME.x)*sx,y:BOOK_ART_FRAME.y+(l.y-VENUE_SOURCE_FRAME.y)*sy,w:l.w*sx,h:l.h*sy,fontSize:l.fontSize?l.fontSize*avg:l.fontSize};}
function requireLogin(){ if(layoutMode()||previewMode())return true; if(!currentUser){openAuthPanel("register");return false;} if(!state.username||!state.termsAccepted){openAuthPanel("complete");return false;} return true; }
function homeLayer(l,n){const moved={...l}; if(n.includes("scanner tool"))moved.x+=15; else if(["engine_damaged","exhaust","fuel tank","headlight","oil filter","radiator","wheel","gearbox","horn"].some(k=>n.includes(k)))moved.x+=14; return moved; }

function renderHome(){
  setScales(); overlayRoot.innerHTML=""; scannerRoot.innerHTML=""; scannerRoot.style.display="none"; stopScanner(); homeRoot.innerHTML="";
  ensureLayoutEditor();
  const st=makeStage("homeStage");
  DATA.layout.home.layers.forEach(l=>{
    if(l.type!=="image")return; const n=l.name.toLowerCase(); l=homeLayer(l,n); let key=null,id=null,src=stableSrc(l.src,l.name);
    if(n.includes("engine_damaged")){key="engine";id="piston-club"} else if(n.includes("exhaust")){key="exhaust";id="long-itch-diner"} else if(n.includes("fuel tank")){key="fuel_tank";id="pats-baps"} else if(n.includes("headlight")){key="headlight";id="mr-watsons"} else if(n.includes("oil filter")){key="oil_filter";id="oily-rag"} else if(n.includes("radiator")){key="radiator";id="the-man-cave"} else if(n.includes("wheel")){key="wheel";id="seven-mile"} else if(n.includes("gearbox")){key="gearbox";id="gilks-garage"} else if(n.includes("horn")) src=state.hornBroken?DATA.components.horn.broken:DATA.components.horn.fixed;
    if(key){src=state.repaired[id]?DATA.components[key].fixed:DATA.components[key].broken;const layer=imgLayer(st,l,src);hit(st,l.x,l.y,l.w,l.h,()=>{if(requireLogin())openVenue(id)},id,layer);return;}
    const layer=imgLayer(st,l,src);
    if(n.includes("garage directory"))hit(st,l.x,l.y,l.w,l.h,()=>{if(requireLogin())openDirectory()},"Garage Directory",layer);
    if(n.includes("wall map"))hit(st,l.x,l.y,l.w,l.h,openMap,"Map",layer);
    if(n.includes("scanner tool"))hit(st,l.x,l.y,l.w,l.h,()=>{if(requireLogin())openScanner()},"Scanner",layer);
    if(n.includes("banter box"))hit(st,l.x,l.y,l.w,l.h,openBanter,"Banter",layer);
    if(n.includes("horn"))hit(st,l.x,l.y,l.w,l.h,()=>{if(requireLogin())honkHorn()},"Horn",layer);
  });
  hit(st,82,58,230,70,()=>{if(requireLogin())openMenu()},"Menu");
  homeRoot.appendChild(st);
}
function popupStage(cls="popupStage"){overlayRoot.innerHTML="";const sh=document.createElement("div");sh.className="popupShell";const st=makeStage(cls);sh.appendChild(st);overlayRoot.appendChild(sh);return st;}
function closePopup(){overlayRoot.innerHTML="";}
function openMenu(){const st=popupStage("menuStage");const menuLayers=new Map();DATA.layout.menu.layers.forEach(l=>{if(l.type==="image")menuLayers.set(l,imgLayer(st,l))});let taps=0;const x=document.createElement("button");x.className="closeX";x.textContent="×";x.onclick=()=>taps>=5?openAdmin():closePopup();st.appendChild(x);hit(st,82,58,230,70,()=>{taps++;setTimeout(()=>taps=0,1800)},"Admin tap");DATA.layout.menu.layers.filter(l=>l.type==="image"&&!l.name.toLowerCase().includes("menu ui")).forEach(l=>{const n=l.name.toLowerCase(),layer=menuLayers.get(l);if(n.includes("profile"))hit(st,l.x,l.y,l.w,l.h,openProfile,"Profile",layer);else if(n.includes("leaderboard"))hit(st,l.x,l.y,l.w,l.h,openLeaderboard,"Leaderboard",layer);else if(n.includes("issues"))hit(st,l.x,l.y,l.w,l.h,openIssues,"Issues",layer);else if(n.includes("log out"))hit(st,l.x,l.y,l.w,l.h,openLogout,"Logout",layer);});}
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
function openDirectory(){const st=popupStage(),bg=DATA.layout.directory.layers.find(l=>l.name.toLowerCase().includes("garage directory ui"))||DATA.layout.directory.layers[0];imgLayer(st,bg,DATA.assets.directory);drawDirectory(st);tabs(st,"directory");bookHome(st);}
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
function openVenue(id){const v=venueById(id);if(!v)return;const st=popupStage(),bg={...BOOK_ART_FRAME,r:0,opacity:1,z:0,name:"Venue UI"};imgLayer(st,bg,DATA.assets[VENUE_PAGE_BY_ID[id]||v.page]);drawVenue(st,v);bookHome(st);tabs(st,id);}
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
  hit(st,stamp.x,stamp.y,stamp.w,stamp.h,()=>state.repaired[v.id]?null:card(`<h2>Scan To Restore</h2><p>Scan this venue’s QR code to restore ${esc(v.component)}.</p><button data-close>Close</button>`),"Repair");
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
  card(`<h2>Use Live Preview</h2><p>This file view cannot reliably sign in or remember progress. Open the live preview instead.</p><p><a class="livePreviewLink" href="http://127.0.0.1:5200/">Open live preview</a></p>`);
}
function badUsername(name){const low=name.toLowerCase();if(!new RegExp(DATA.usernameRules.pattern).test(name))return"Username must be 3–20 characters using letters, numbers, underscore or hyphen.";if((DATA.usernameRules.blocked||[]).some(w=>low.includes(w)))return"That username is not allowed.";return"";}
function openAuthPanel(mode="login",msg=""){closeAuthPanel();const d=document.createElement("div");d.id="authPanel";d.className="authPanel";d.innerHTML=`<div class="authCard"><h2>${mode==="register"?"Create Account":mode==="complete"?"Complete Account":"Sign In"}</h2>${msg?`<p class="authError">${esc(msg)}</p>`:""}<div id="authFields"></div></div>`;document.body.appendChild(d);const f=d.querySelector("#authFields");if(mode==="register"||mode==="complete"){f.innerHTML=`<input id="authEmail" type="email" autocomplete="email" placeholder="Email address" value="${esc(state.email||"")}"><input id="authPassword" type="password" autocomplete="${mode==="complete"?"current-password":"new-password"}" placeholder="Password"><input id="authUsername" autocomplete="username" placeholder="Public username" value="${esc(state.username||"")}"><label class="check"><input id="authTerms" type="checkbox" ${state.termsAccepted?"checked":""}> I agree to The Restoration Route storing my email, username and route progress for prize draw and app operation purposes. Organiser: ${esc(DATA.terms.organiser)}. Contact: ${esc(DATA.terms.contactEmail)}.</label><button id="createAccount">${mode==="complete"?"Save Account Details":"Create Account"}</button><button id="switchLogin">Already have an account? Sign in</button>`;document.getElementById("createAccount").onclick=()=>handleRegister(mode==="complete");document.getElementById("switchLogin").onclick=()=>openAuthPanel("login");}else{f.innerHTML=`<input id="authEmail" type="email" autocomplete="email" placeholder="Email address" value="${esc(state.email||"")}"><input id="authPassword" type="password" autocomplete="current-password" placeholder="Password"><button id="loginButton">Sign In</button><button id="switchRegister">Create Account</button>`;document.getElementById("loginButton").onclick=handleLogin;document.getElementById("switchRegister").onclick=()=>openAuthPanel("register");}}
function closeAuthPanel(){document.querySelectorAll("#authPanel").forEach(x=>x.remove())}
async function reserveUsername(username,uid){const u=username.toLowerCase(),ref=fb.doc(db,"usernames",u),snap=await fb.getDoc(ref);if(snap.exists()&&snap.data().uid!==uid)throw new Error("That username is already taken.");await fb.setDoc(ref,{uid,username,usernameLower:u,updatedAt:fb.serverTimestamp()},{merge:true});}
async function handleRegister(updateOnly=false){const email=document.getElementById("authEmail").value.trim(),pass=document.getElementById("authPassword").value,user=document.getElementById("authUsername").value.trim(),terms=document.getElementById("authTerms").checked,bad=badUsername(user);if(bad)return openAuthPanel(updateOnly?"complete":"register",bad);if(!terms)return openAuthPanel(updateOnly?"complete":"register","You need to accept the terms to use the app.");try{if(updateOnly&&currentUser){await reserveUsername(user,currentUser.uid);state.username=user;state.termsAccepted=true;await fb.updateProfile(currentUser,{displayName:user}).catch(()=>{});await saveCloud();closeAuthPanel();return}const cred=await fb.createUserWithEmailAndPassword(auth,email,pass);currentUser=cred.user;await reserveUsername(user,cred.user.uid);await fb.updateProfile(cred.user,{displayName:user}).catch(()=>{});await fb.sendEmailVerification(cred.user).catch(()=>{});state={...defaultState(),uid:cred.user.uid,email,username:user,termsAccepted:true,emailVerified:false};await saveCloud();closeAuthPanel();openProfile("Verification email sent. Progress saves now. Prize entries become eligible once your email is verified.");}catch(e){openAuthPanel(updateOnly?"complete":"register",e.message||"Could not create account.");}}
async function handleLogin(){try{await fb.signInWithEmailAndPassword(auth,document.getElementById("authEmail").value.trim(),document.getElementById("authPassword").value)}catch(e){openAuthPanel("login",e.message||"Could not sign in.")}}
function openProfile(msg=""){card(`<h2>Profile</h2>${msg?`<p>${esc(msg)}</p>`:""}<p>Email: ${esc(state.email||"")}</p><p>Username: ${esc(state.username||"")}</p><p>Email verified: ${state.emailVerified?"Yes":"No"}</p>${!state.emailVerified?'<button id="resendVerification">Resend Verification Email</button><button id="refreshVerification">I Verified It</button>':""}<button data-close>Close</button>`,()=>{const r=document.getElementById("resendVerification");if(r)r.onclick=()=>currentUser&&fb.sendEmailVerification(currentUser);const rf=document.getElementById("refreshVerification");if(rf)rf.onclick=async()=>{await fb.reload(currentUser);state.emailVerified=!!auth.currentUser.emailVerified;await saveCloud();closeCard();openProfile();}});}
function openLeaderboard(){card(`<h2>Vehicles Restored</h2><p>Completed vehicles: <strong>${state.completedVehicles}</strong></p><p>Prize entries: <strong>${state.prizeEntries}</strong></p><p>Pending entries until email verification: <strong>${state.pendingPrizeEntries}</strong></p><p>Total parts restored: <strong>${state.totalPartsRestored}</strong></p><button data-close>Close</button>`);}
function openIssues(){location.href=`mailto:${DATA.terms.contactEmail}?subject=The%20Restoration%20Route%20Issue&body=${encodeURIComponent("User: "+(state.username||"")+"\nEmail: "+(state.email||"")+"\n\nIssue:\n")}`;}
function openLogout(){card(`<h2>Log Out</h2><p>Progress is saved to your account if online sync has completed.</p><button id="logoutConfirm">Log Out</button><button data-close>Cancel</button>`,()=>{document.getElementById("logoutConfirm").onclick=async()=>{await fb.signOut(auth);closeCard();openAuthPanel("register")}});}
function openAdmin(){card(`<h2>Garage Admin</h2><input id="adminCode" placeholder="Code"><button id="adminUnlock">Unlock</button><button data-close>Close</button>`,()=>{document.getElementById("adminUnlock").onclick=()=>{if(document.getElementById("adminCode").value!==ADMIN_CODE)return;closeCard();card(`<h2>Chip’s Big Red Button</h2><button id="repairAll">Repair All Components</button><button id="completeVehicle">Complete Vehicle</button><button id="resetVehicle">Reset Current Vehicle</button><button data-close>Close</button>`,()=>{document.getElementById("repairAll").onclick=async()=>{DATA.venues.forEach(v=>state.repaired[v.id]=true);await saveCloud();closeCard();renderHome()};document.getElementById("completeVehicle").onclick=async()=>{await completeVehicle("admin_complete");closeCard();renderHome()};document.getElementById("resetVehicle").onclick=async()=>{state.repaired=baseRepaired();state.hornBroken=false;await saveCloud();closeCard();renderHome()};})}});}
function card(html,after){const d=document.createElement("div");d.className="popCard";d.innerHTML=html;overlayRoot.appendChild(d);d.querySelectorAll("[data-close]").forEach(b=>b.onclick=closeCard);if(after)after();}
function closeCard(){overlayRoot.querySelectorAll(".popCard").forEach(c=>c.remove())}
function esc(s){return String(s).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[c]))}
async function honkHorn(){const now=Date.now();hornTapTimes=hornTapTimes.filter(t=>now-t<4000);hornTapTimes.push(now);if(hornTapTimes.length>=5&&!state.hornBroken){state.hornBroken=true;state.hornBrokenCount=(state.hornBrokenCount||0)+1;await saveCloud();renderHome();}}
async function repairVenue(id,source="scan"){if(!requireLogin())return;const v=venueById(id);if(!v)return;const was=state.repaired[id];if(!was){state.repaired[id]=true;state.totalPartsRestored=(state.totalPartsRestored||0)+1}await scanEvent(id,source,was);await saveCloud();if(allRepaired())await completeVehicle("auto_complete");renderHome();openVenue(id);}
async function scanEvent(id,source,dup){if(!firebaseReady||!currentUser)return;await fb.addDoc(fb.collection(db,"scanEvents"),{uid:currentUser.uid,email:currentUser.email||state.email||"",username:state.username||"",venueId:id,source,duplicate:dup,vehicleNumber:state.currentVehicle||1,accepted:true,createdAt:fb.serverTimestamp()}).catch(()=>{});}
async function completeVehicle(type){if(!allRepaired())return;state.completedVehicles++;if(state.emailVerified||auth?.currentUser?.emailVerified)state.prizeEntries++;else state.pendingPrizeEntries++;state.currentVehicle++;state.repaired=baseRepaired();state.hornBroken=false;state.hornRestoredCount=(state.hornRestoredCount||0)+1;state.log.push({type,at:new Date().toISOString()});await saveCloud();}
async function processScanToken(raw,source="qr_scan"){
  if(!requireLogin())return null;
  const v=await matchToken(raw);
  if(!v){card(`<h2>QR Not Recognised</h2><p>This QR code could not be recognised. Please try again at the venue.</p><button data-close>Close</button>`);return null;}
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
  scannerRoot.appendChild(st);startScanner(video);
}
function closeScanner(){stopScanner();scannerRoot.style.display="none";scannerRoot.innerHTML="";renderHome()}
async function startScanner(video){try{scannerProcessing=false;activeScannerStream=await navigator.mediaDevices.getUserMedia({video:{facingMode:{ideal:"environment"}},audio:false});video.srcObject=activeScannerStream;await video.play();if(!("BarcodeDetector"in window))return;const det=new BarcodeDetector({formats:["qr_code"]}),canvas=document.createElement("canvas"),ctx=canvas.getContext("2d");activeScannerTimer=setInterval(async()=>{if(scannerProcessing||video.readyState<2)return;canvas.width=video.videoWidth;canvas.height=video.videoHeight;ctx.drawImage(video,0,0);try{const codes=await det.detect(canvas);if(codes&&codes[0]){scannerProcessing=true;stopScanner();scannerRoot.style.display="none";await processScanToken(codes[0].rawValue,"qr_scan")}}catch(e){scannerProcessing=false}},750)}catch(e){}}
function stopScanner(){if(activeScannerTimer)clearInterval(activeScannerTimer);activeScannerTimer=null;if(activeScannerStream){activeScannerStream.getTracks().forEach(t=>t.stop());activeScannerStream=null}}
async function matchToken(raw){let s=String(raw||""),token=s;try{const u=new URL(s);token=u.searchParams.get("scan")||u.searchParams.get("code")||s}catch{}const id=DATA.scanTokenHashes[await sha256(token.trim())];return id?venueById(id):null}
async function handleUrlScan(){const p=new URLSearchParams(location.search),code=p.get("scan")||p.get("venue")||p.get("code");if(!code)return;history.replaceState(null,"",location.pathname);const wait=setInterval(async()=>{if(currentUser&&state.username&&state.termsAccepted){clearInterval(wait);await processScanToken(code,"qr_deeplink")}},300)}
function openPreviewFromUrl(){
  const p=new URLSearchParams(location.search),view=p.get("preview");
  if(view==="directory")openDirectory();
  else if(view&&venueById(view))openVenue(view);
}
window.addEventListener("load",async()=>{setScales();renderHome();if(previewMode())openPreviewFromUrl();await initFirebase();await handleUrlScan()});
if("serviceWorker"in navigator)window.addEventListener("load",()=>navigator.serviceWorker.register("service-worker.js").catch(()=>{}));

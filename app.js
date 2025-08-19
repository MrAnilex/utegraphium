// Prototype JS for "Archive Liquide" blog expérimental
// Modules kept in single file for demo simplicity.

const posts = [
  {
    id: "a1",
    title: "Première lueur",
    excerpt: "Un prélude translucide. Lire pour débloquer un fragment.",
    body: `<p>Le verre respire. <span class="aside-word" data-aside="La première lueur est silencieuse.">Première</span> fois que la page se teinte.</p>
           <p>Les sons : souffle doux et cliquetis.</p>
           <p><em>Indice :</em> lire "Murmure" !</p>`,
    ambient: { type: "wind", intensity: 0.2 },
    artifact: { id: "star-frag", name: "Fragment d'étoile", desc: "Un éclat fragile."},
    unlock: { type: "none" }
  },
  {
    id: "b2",
    title: "Murmure",
    excerpt: "Un murmure qui révèle les routes secrètes.",
    body: `<p>Écoute le murmure sous la surface. Cliquer <span class="aside-word" data-aside="Les murmures sont des cartes.">murmure</span> pour révéler des notes.</p>
           <p>Ce fragment débloque un trésor caché après lecture.</p>`,
    ambient: { type: "water", intensity: 0.35 },
    artifact: { id: "key-curve", name: "Clé courbe", desc: "S'attrape dans le reflet."},
    unlock: { type: "none" }
  },
  {
    id: "c3",
    title: "Coffre lunaire (verrouillé)",
    excerpt: "Contenu caché — nécessite un artefact.",
    body: `<p>Dans le coffre, une phrase incomplète. Seuls deux artefacts assemblés la complètent.</p>`,
    ambient: { type: "drone", intensity: 0.4 },
    artifact: { id: "poem-frag", name: "Fragment poétique", desc: "Un vers qui attend."},
    unlock: { type: "requires", requires: ["star-frag","key-curve"] }
  },
  {
    id: "d4",
    title: "Sérénité horaire",
    excerpt: "Se dévoile seulement à partir d'une date précise.",
    body: `<p>Ceci est un journal temporel. Il s'ouvrira au crépuscule de la date.</p>`,
    ambient: { type: "bell", intensity: 0.15 },
    artifact: { id: "time-token", name: "Jeton temporel", desc: "Chiffre du temps."},
    unlock: { type: "date", timestamp: Date.now() + 1000*60*60*24 }
  }
];

// Simple state in localStorage
const STATE_KEY = "liquidArchive:v1";

function readState(){
  try{
    return JSON.parse(localStorage.getItem(STATE_KEY)) || { read:[], artifacts:[], comments: {}, mails: [] };
  }catch(e){ return { read:[], artifacts:[], comments: {}, mails: [] } }
}
function saveState(s){ localStorage.setItem(STATE_KEY, JSON.stringify(s)); }

let state = readState();

// Utilities
function el(tag, attrs={}, ...children){
  const d = document.createElement(tag);
  for(const k in attrs){
    if(k.startsWith("on") && typeof attrs[k] === "function") d.addEventListener(k.slice(2), attrs[k]);
    else if(k === "html") d.innerHTML = attrs[k];
    else d.setAttribute(k, attrs[k]);
  }
  for(const c of children) if(typeof c === "string") d.appendChild(document.createTextNode(c)); else if(c) d.appendChild(c);
  return d;
}

function formatDate(ts){ return new Date(ts).toLocaleString(); }

// UI elements
const postList = document.getElementById("postList");
const artifactCount = document.getElementById("artifactCount");
const artifactShelf = document.getElementById("artifactShelf");
const unlockNotice = document.getElementById("unlockNotice");
const articleInner = document.getElementById("articleInner");
const reader = document.getElementById("reader");
const closeReader = document.getElementById("closeReader");
const playAmbience = document.getElementById("playAmbience");
const collectArtifact = document.getElementById("collectArtifact");
const openComments = document.getElementById("openComments");
const commentsModal = document.getElementById("commentsModal");
const commentForm = document.getElementById("commentForm");
const commentList = document.getElementById("commentList");
const mailbox = document.getElementById("mailbox");
const mailboxBtn = document.getElementById("mailboxBtn");
const mailForm = document.getElementById("mailForm");
const sentMails = document.getElementById("sentMails");
const artifactsModal = document.getElementById("artifacts");
const artifactsBtn = document.getElementById("artifactsBtn");
const closeArtifacts = document.getElementById("closeArtifacts");
const closeComments = document.getElementById("closeComments");
const closeMailbox = document.getElementById("closeMailbox");

function renderPosts(){
  postList.innerHTML = "";
  posts.forEach(p=>{
    const card = el("div",{class:"post",tabindex:0});
    const title = el("div",{},p.title);
    const meta = el("div",{class:"meta"}, el("span",{},p.excerpt), 
      (function(){
        const lock = checkUnlock(p);
        if(!lock.unlocked) return el("span",{class:"lock"},"🔒");
        if(state.read.includes(p.id)) return el("span",{class:"lock"},"✓ lu");
        return el("span",{class:"lock"},"→ ouvrir");
      })()
    );
    card.appendChild(title);
    card.appendChild(meta);
    card.addEventListener("click",()=>openPost(p));
    postList.appendChild(card);
  });
  renderCollection();
}

function checkUnlock(post){
  if(post.unlock.type === "none") return { unlocked: true };
  if(post.unlock.type === "date"){
    const now = Date.now();
    if(now >= post.unlock.timestamp) return { unlocked:true };
    return { unlocked:false, reason: "date", until: post.unlock.timestamp };
  }
  if(post.unlock.type === "requires"){
    const need = post.unlock.requires || [];
    const got = state.artifacts || [];
    const missing = need.filter(n=>!got.includes(n));
    return { unlocked: missing.length===0, missing };
  }
  return { unlocked:true };
}

let currentPost = null;
function openPost(p){
  const unlock = checkUnlock(p);
  if(!unlock.unlocked){
    if(unlock.missing) alert("Contenu verrouillé. Artefacts manquants : " + unlock.missing.join(", "));
    if(unlock.reason === "date") alert("Contenu disponible le : " + formatDate(unlock.until));
    return;
  }
  currentPost = p;
  articleInner.innerHTML = `<h2>${p.title}</h2><div class="article-body">${p.body}</div>`;
  articleInner.querySelectorAll(".aside-word").forEach(w=>{
    w.addEventListener("click", (ev)=>{
      showAsidePopup(w.dataset.aside, ev.clientX, ev.clientY);
    });
  });
  if(!state.read.includes(p.id)){
    state.read.push(p.id);
    saveState(state);
  }
  updateArtifactButton();
  startAmbienceFor(p);
}
function closeReaderFn(){
  stopAmbience();
  reader.classList.add("hidden");
  currentPost = null;
}
closeReader.addEventListener("click", closeReaderFn);

function updateArtifactButton(){
  const p = currentPost;
  if(!p) return;
  const has = state.artifacts.includes(p.artifact.id);
  collectArtifact.textContent = has ? "Artefact acquis" : "Recevoir artefact";
  collectArtifact.disabled = has;
}
collectArtifact.addEventListener("click", ()=>{
  if(!currentPost) return;
  const art = currentPost.artifact;
  if(!state.artifacts.includes(art.id)){
    state.artifacts.push(art.id);
    saveState(state);
    renderCollection();
    updateArtifactButton();
    checkUnlocksAfterArtifact();
    alert(`Tu as reçu : ${art.name}`);
  }
});

function renderCollection(){
  artifactCount.textContent = (state.artifacts||[]).length;
  artifactShelf && (artifactShelf.innerHTML = "");
  const shelf = document.getElementById("artifactShelf");
  if(!shelf) return;
  shelf.innerHTML = "";
  (state.artifacts||[]).forEach(id=>{
    const meta = posts.map(p=>p.artifact).find(a=>a && a.id===id);
    const elc = document.createElement("div"); elc.className="artifact"; elc.textContent = meta ? meta.name : id;
    shelf.appendChild(elc);
  });
}

function checkUnlocksAfterArtifact(){
  const newly = posts.filter(p => p.unlock.type === "requires" && checkUnlock(p).unlocked && !state.read.includes(p.id));
  if(newly.length){
    unlockNotice.textContent = "Nouveau contenu déverrouillé : " + newly.map(n=>n.title).join(", ");
    setTimeout(()=> unlockNotice.textContent = "", 6000);
    renderPosts();
  }
}

// Simple generative ambience
let audioCtx = null;
let ambienceNodes = [];
function ensureAudio(){
  if(!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
}
function startAmbienceFor(post){
  ensureAudio();
  stopAmbience();
  const ctx = audioCtx;
  const master = ctx.createGain(); master.gain.value = 0.12; master.connect(ctx.destination);
  ambienceNodes.push(master);
  const type = post.ambient?.type || "wind";
  if(type === "wind" || type === "water"){
    const bufferSize = ctx.sampleRate * 2;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for(let i=0;i<bufferSize;i++) data[i] = (Math.random()*2-1) * (type==="water" ? 0.3 : 0.1);
    const src = ctx.createBufferSource(); src.buffer = buffer; src.loop = true;
    const filter = ctx.createBiquadFilter(); filter.type = "lowpass"; filter.frequency.value = type==="water" ? 1200 : 800;
    src.connect(filter); filter.connect(master); src.start();
    ambienceNodes.push(src, filter);
  }
  if(type === "drone" || type === "bell"){
    const osc = ctx.createOscillator(); osc.type = "sine";
    const g = ctx.createGain(); g.gain.value = 0.02;
    osc.frequency.value = type==="drone" ? 80 + Math.random()*20 : 220 + Math.random()*40;
    osc.connect(g); g.connect(master); osc.start();
    ambienceNodes.push(osc,g);
  }
  playAmbience.textContent = "⏸ Ambiance";
}
function stopAmbience(){
  if(!audioCtx) return;
  ambienceNodes.forEach(n=>{
    try{ if(n.stop) n.stop(); if(n.disconnect) n.disconnect(); }catch(e){}
  });
  ambienceNodes = [];
  playAmbience.textContent = "▶ Ambiance";
}
playAmbience.addEventListener("click", ()=>{
  if(!currentPost) return;
  if(ambienceNodes.length) stopAmbience();
  else startAmbienceFor(currentPost);
});

// Aside popup
function showAsidePopup(text,x,y){
  const pop = document.createElement("div"); pop.className="aside-popup";
  pop.innerHTML = `<div style="font-size:13px;color:var(--muted)">${text}</div>`;
  document.body.appendChild(pop);
  pop.style.left = (x+8) + "px";
  pop.style.top = (y+8) + "px";
  setTimeout(()=> pop.style.opacity = 1, 10);
  setTimeout(()=>{ if(pop) pop.remove(); }, 6000);
  pop.addEventListener("click", ()=> pop.remove());
}

// Comments
openComments.addEventListener("click", ()=>{
  commentsModal.classList.remove("hidden");
  loadCommentsFor(currentPost?.id);
});
closeComments.addEventListener("click", ()=> commentsModal.classList.add("hidden"));
commentForm.addEventListener("submit", (ev)=>{
  ev.preventDefault();
  const author = document.getElementById("author").value || "Anonyme";
  const body = document.getElementById("body").value || "";
  const id = currentPost?.id;
  if(!id) return;
  state.comments[id] = state.comments[id] || [];
  state.comments[id].push({author, body, date: Date.now()});
  saveState(state);
  commentForm.reset();
  loadCommentsFor(id);
});
function loadCommentsFor(id){
  commentList.innerHTML = "";
  const arr = (state.comments[id] || []).slice().reverse();
  if(!arr.length) commentList.innerHTML = "<em>Aucun message. Sois le premier.</em>";
  arr.forEach(c=>{
    const d = el("div",{class:"comment"}, el("strong",{},c.author), el("div":{"style":"font-size:13px;color:var(--muted)"}, new Date(c.date).toLocaleString()), el("p",{},c.body));
    commentList.appendChild(d);
  });
}

// Mailbox
mailboxBtn.addEventListener("click", ()=> mailbox.classList.remove("hidden"));
closeMailbox.addEventListener("click", ()=> mailbox.classList.add("hidden"));
mailForm.addEventListener("submit", (ev)=>{
  ev.preventDefault();
  const from = document.getElementById("mailFrom").value || "Anonyme";
  const body = document.getElementById("mailBody").value || "";
  state.mails = state.mails || [];
  state.mails.push({from, body, date: Date.now()});
  saveState(state);
  mailForm.reset();
  renderSentMails();
  alert("Merci — message déposé dans la boîte locale.");
});
function renderSentMails(){
  sentMails.innerHTML = "";
  (state.mails||[]).slice().reverse().forEach(m=>{
    const el = document.createElement("div"); el.style.marginBottom="8px";
    el.innerHTML = `<strong>${m.from}</strong> <div style="color:var(--muted);font-size:12px">${new Date(m.date).toLocaleString()}</div><div style="margin-top:6px">${m.body}</div>`;
    sentMails.appendChild(el);
  });
}
renderSentMails();

// Artifacts modal
artifactsBtn.addEventListener("click", ()=> artifactsModal.classList.remove("hidden"));
closeArtifacts.addEventListener("click", ()=> artifactsModal.classList.add("hidden"));

// Sky blobs animation
function seedBlobs(){
  const g = document.getElementById("blobGroup");
  g.innerHTML = "";
  for(let i=0;i<6;i++){
    const c = document.createElementNS("http://www.w3.org/2000/svg","path");
    c.setAttribute("fill", i%2? "rgba(123,227,255,0.05)" : "rgba(255,150,200,0.03)");
    const rx = 120 + Math.random()*240;
    const ry = 80 + Math.random()*220;
    const x = Math.random()*800; const y = Math.random()*600;
    const d = `M ${x} ${y} q ${rx} ${-ry} ${rx*1.4} ${ry*0.2} q ${-rx*0.6} ${ry*0.6} ${-rx*1.8} ${0} z`;
    c.setAttribute("d", d);
    c.style.transition = "transform 8s ease-in-out";
    g.appendChild(c);
    setInterval(()=>{
      const s = 0.9 + Math.random()*0.2;
      c.style.transform = `translate(${Math.random()*30-15}px, ${Math.random()*20-10}px) scale(${s}) rotate(${(Math.random()*8-4)}deg)`;
    }, 2500 + Math.random()*2500);
  }
}
seedBlobs();

// Weather & time-based theming
const weatherEl = document.getElementById("weather");
const nowEl = document.getElementById("now");
function setThemeFrom(data){
  const hour = data.hour;
  if(hour >= 6 && hour < 12){
    document.documentElement.style.setProperty("--bg1","#071c2f");
    document.documentElement.style.setProperty("--bg2","#083a56");
    document.documentElement.style.setProperty("--accent","#9be9ff");
  }else if(hour >=12 && hour < 18){
    document.documentElement.style.setProperty("--bg1","#061427");
    document.documentElement.style.setProperty("--bg2","#05263f");
    document.documentElement.style.setProperty("--accent","#ffd1e9");
  }else{
    document.documentElement.style.setProperty("--bg1","#030416");
    document.documentElement.style.setProperty("--bg2","#071029");
    document.documentElement.style.setProperty("--accent","#7be3ff");
  }

  if(data.weathercode >= 60){
    document.documentElement.style.setProperty("--accent","#8fd4ff");
  }
  weatherEl.textContent = `Heure locale : ${String(data.hour).padStart(2,"0")}h — météo : ${data.desc||"inconnue"}`;
  nowEl.textContent = new Date().toLocaleString();
}

function fetchWeatherAndTheme(){
  if(!navigator.geolocation) {
    setThemeFrom({hour: new Date().getHours()});
    return;
  }
  navigator.geolocation.getCurrentPosition(async pos=>{
    try{
      const lat = pos.coords.latitude, lon = pos.coords.longitude;
      const res = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&hourly=weathercode,temperature_2m&current_weather=true&timezone=auto`);
      const j = await res.json();
      const hour = new Date().getHours();
      const code = (j.current_weather && j.current_weather.weathercode) || (j.hourly && j.hourly.weathercode && j.hourly.weathercode[0]) || 0;
      const desc = code >= 80 ? "Pluie" : code >=60 ? "Neige/Pluie" : code >= 50 ? "Bruine" : code >= 30 ? "Nuageux" : "Clair";
      setThemeFrom({hour, weathercode: code, desc});
    }catch(e){
      setThemeFrom({hour: new Date().getHours()});
    }
  }, err=>{
    setThemeFrom({hour: new Date().getHours()});
  }, {timeout:4000});
}
fetchWeatherAndTheme();

// initial render
renderPosts();
renderCollection();
renderSentMails();
checkUnlocksAfterArtifact();

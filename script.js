const articles = [
  {
    id: 'a1',
    title: 'Aurore fluide',
    content: "L'univers <span class=\"secret\" data-secret=\"Un murmure luminescent te répond.\">écoute</span> tes pas.",
    audio: 'sine',
    artifact: 'clé',
    requires: [],
    availableOn: '2020-01-01'
  },
  {
    id: 'a2',
    title: 'Verre stellaire',
    content: "Des reflets <span class=\"secret\" data-secret=\"La vitre se liquéfie en constellations.\">vibrent</span> autour.",
    audio: 'chord',
    artifact: 'étoile',
    requires: ['a1'],
    availableOn: '2020-01-01'
  },
  {
    id: 'a3',
    title: 'Nocturne différé',
    content: 'Ce texte se dévoile à une date précise.',
    audio: 'noise',
    artifact: 'fragment poétique',
    requires: [],
    availableOn: '2100-01-01'
  },
  {
    id: 'a4',
    title: 'Chambre des artefacts',
    content: 'Un lieu secret réservé aux collectionneurs.',
    audio: 'sine',
    artifact: 'météorite',
    requires: [],
    availableOn: '2020-01-01',
    unlockWithArtifacts: 2
  }
];

let audioCtx;
let currentOscillators = [];

function applyTheme() {
  const hour = new Date().getHours();
  let hue;
  if (hour < 6) hue = 260; // nuit
  else if (hour < 12) hue = 200; // matin
  else if (hour < 18) hue = 140; // après-midi
  else hue = 320; // soir
  document.documentElement.style.setProperty('--hue', hue);
}

applyTheme();
setInterval(applyTheme, 60000);

function getStorage(key, fallback) {
  return JSON.parse(localStorage.getItem(key)) || fallback;
}

function setStorage(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

function renderArtifacts() {
  const container = document.getElementById('artifact-display');
  const artifacts = getStorage('artifacts', []);
  container.innerHTML = artifacts.map(a => `<span>${a}</span>`).join('');
}

function isUnlocked(article) {
  const now = new Date();
  if (new Date(article.availableOn) > now) return false;
  const read = getStorage('read', []);
  if (article.requires.some(r => !read.includes(r))) return false;
  const artifacts = getStorage('artifacts', []);
  if (article.unlockWithArtifacts && artifacts.length < article.unlockWithArtifacts) return false;
  return true;
}

function renderArticleList() {
  const list = document.getElementById('article-list');
  list.innerHTML = '';
  articles.forEach(a => {
    const div = document.createElement('div');
    if (isUnlocked(a)) {
      div.textContent = a.title;
      div.addEventListener('click', () => openArticle(a.id));
    } else {
      div.textContent = '???';
    }
    div.className = 'glass';
    list.appendChild(div);
  });
}

function stopAmbient() {
  if (audioCtx) {
    currentOscillators.forEach(o => o.stop());
    audioCtx.close();
    audioCtx = null;
    currentOscillators = [];
  }
}

function playAmbient(type) {
  stopAmbient();
  audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  if (type === 'sine') {
    const osc = audioCtx.createOscillator();
    osc.type = 'sine';
    osc.frequency.value = 220 + Math.random()*220;
    osc.connect(audioCtx.destination);
    osc.start();
    currentOscillators.push(osc);
  } else if (type === 'chord') {
    [261.6, 329.6, 392].forEach(f => {
      const osc = audioCtx.createOscillator();
      osc.type = 'sine';
      osc.frequency.value = f;
      osc.connect(audioCtx.destination);
      osc.start();
      currentOscillators.push(osc);
    });
  } else if (type === 'noise') {
    const bufferSize = 2 * audioCtx.sampleRate;
    const noiseBuffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      output[i] = Math.random() * 2 - 1;
    }
    const whiteNoise = audioCtx.createBufferSource();
    whiteNoise.buffer = noiseBuffer;
    whiteNoise.loop = true;
    const filter = audioCtx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = 1000;
    whiteNoise.connect(filter).connect(audioCtx.destination);
    whiteNoise.start();
    currentOscillators.push(whiteNoise);
  }
}

function openArticle(id) {
  const article = articles.find(a => a.id === id);
  if (!article) return;
  document.getElementById('article-list').classList.add('hidden');
  const view = document.getElementById('article-view');
  view.classList.remove('hidden');
  document.getElementById('article-title').textContent = article.title;
  const contentDiv = document.getElementById('article-content');
  contentDiv.innerHTML = article.content;
  attachSecrets(contentDiv);
  playAmbient(article.audio);
  markRead(article);
  renderArtifacts();
  loadComments(id);
  document.getElementById('submit-comment').onclick = () => submitComment(id);
}

function attachSecrets(container) {
  container.querySelectorAll('.secret').forEach(span => {
    span.addEventListener('click', () => {
      if (span.nextSibling && span.nextSibling.classList && span.nextSibling.classList.contains('secret-reveal')) {
        span.nextSibling.classList.toggle('visible');
      } else {
        const reveal = document.createElement('div');
        reveal.className = 'secret-reveal visible';
        reveal.textContent = span.dataset.secret;
        span.after(reveal);
      }
    });
  });
}

function markRead(article) {
  const read = getStorage('read', []);
  if (!read.includes(article.id)) {
    read.push(article.id);
    setStorage('read', read);
    const artifacts = getStorage('artifacts', []);
    artifacts.push(article.artifact);
    setStorage('artifacts', artifacts);
  }
}

function loadComments(articleId) {
  const comments = getStorage('comments_' + articleId, []);
  const container = document.getElementById('comments');
  container.innerHTML = comments.map(c => `<div class="comment">${c}</div>`).join('');
}

function submitComment(articleId) {
  const text = document.getElementById('comment-text');
  if (!text.value.trim()) return;
  const comments = getStorage('comments_' + articleId, []);
  comments.push(text.value.trim());
  setStorage('comments_' + articleId, comments);
  text.value = '';
  loadComments(articleId);
}

function setupNavigation() {
  document.getElementById('back').addEventListener('click', () => {
    stopAmbient();
    document.getElementById('article-view').classList.add('hidden');
    document.getElementById('article-list').classList.remove('hidden');
    renderArticleList();
  });
}

function setupMailbox() {
  const modal = document.getElementById('mailbox-modal');
  document.getElementById('mailbox').onclick = () => {
    modal.classList.remove('hidden');
  };
  document.getElementById('close-mailbox').onclick = () => {
    modal.classList.add('hidden');
  };
  document.getElementById('send-mail').onclick = () => {
    const msg = document.getElementById('mailbox-text').value.trim();
    if (!msg) return;
    const msgs = getStorage('mailbox', []);
    msgs.push({ msg, date: new Date().toISOString() });
    setStorage('mailbox', msgs);
    document.getElementById('mailbox-text').value = '';
    modal.classList.add('hidden');
  };
}

renderArtifacts();
renderArticleList();
setupNavigation();
setupMailbox();

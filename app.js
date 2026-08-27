// ===================== UI =====================
// Usa CONTENT/CATEGORY_META (data.js) e o motor de aprendizagem (engine.js). Não guarda estado próprio
// de progresso — só estado de navegação/tela.

function renderMedia(item) {
  if (item.image) return `<img class="word-photo" src="${item.image}" alt="${item.en}" />`;
  return item.emoji;
}

// ===================== Ícones de interface (SVG, substituem emoji de UI) =====================
// Emoji continua sendo usado como CONTEÚDO pedagógico (a carinha de cada palavra); isso aqui é só
// pra cromo de interface (botões de voltar, configurações, tocar som, etc.), pra não depender de
// como cada aparelho desenha emoji.
const ICONS = {
  back: '<path d="M15 5L8 12l7 7" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>',
  close: '<path d="M6 6l12 12M18 6L6 18" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"/>',
  settings: '<circle cx="12" cy="12" r="3" fill="none" stroke="currentColor" stroke-width="2.2"/><path d="M19.4 13a1.7 1.7 0 000-2l1.2-1.6-2-2L17 8.6a1.7 1.7 0 00-2 0l-.6-1.9h-2.8L11 8.6a1.7 1.7 0 00-2 0L7.4 7.4l-2 2L6.6 11a1.7 1.7 0 000 2l-1.2 1.6 2 2L9 15.4a1.7 1.7 0 002 0l.6 1.9h2.8l.6-1.9a1.7 1.7 0 002 0l1.6 1.2 2-2z" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"/>',
  sound: '<path d="M4 9v6h4l5 4V5L8 9H4z" fill="currentColor"/><path d="M16.5 9a4 4 0 010 6M19 6.5a8 8 0 010 11" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"/>',
  mic: '<rect x="9" y="3" width="6" height="11" rx="3" fill="currentColor"/><path d="M6 11a6 6 0 0012 0M12 19v2" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"/>',
  play: '<path d="M7 4l13 8-13 8V4z" fill="currentColor"/>',
  check: '<path d="M5 13l5 5L20 7" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>',
  lock: '<rect x="5" y="11" width="14" height="9" rx="2.5" fill="currentColor"/><path d="M8 11V8a4 4 0 018 0v3" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"/>',
  star: '<path d="M12 3l2.6 5.6 6.1.6-4.6 4.1 1.3 6-5.4-3.1L6.6 19.3l1.3-6-4.6-4.1 6.1-.6L12 3z" fill="currentColor"/>',
  home: '<path d="M4 11l8-7 8 7v8a1 1 0 01-1 1h-4v-6H9v6H5a1 1 0 01-1-1v-8z" fill="currentColor"/>',
};
function icon(name, extraClass) {
  return `<span class="icon${extraClass ? " " + extraClass : ""}"><svg viewBox="0 0 24 24">${ICONS[name] || ""}</svg></span>`;
}

// Pontinhos de progresso. Pra totais grandes (>maxDots), escala proporcionalmente em vez de
// desenhar um pontinho por item — evita virar uma fileira ilegível numa categoria com 10+ palavras.
function renderDots(current, total, cls, maxDots) {
  maxDots = maxDots || 8;
  const shown = Math.min(total, maxDots);
  const filled = total > 0 ? Math.round((current / total) * shown) : 0;
  let html = `<div class="progress-dots${cls ? " " + cls : ""}">`;
  for (let i = 0; i < shown; i++) html += `<span class="dot${i < filled ? " filled" : ""}"></span>`;
  return html + "</div>";
}

// Troca o cromo de interface estático (voltar, engrenagem, som, play) pelos ícones SVG.
// Emoji temático/decorativo (🌏 no mundo, 🎯 na missão, carinhas de conteúdo) fica como está.
function initIcons() {
  const settingsBtn = document.getElementById("btn-settings");
  if (settingsBtn) {
    settingsBtn.innerHTML = icon("settings");
    settingsBtn.setAttribute("aria-label", "Configurações");
  }
  document.querySelectorAll(".back-btn").forEach((el) => {
    const isVoltar = el.textContent.trim().includes("Voltar");
    el.innerHTML = isVoltar ? icon("back") + " Voltar" : icon("back");
    if (!isVoltar) el.setAttribute("aria-label", "Voltar");
  });
  const repeatBtn = document.getElementById("btn-repeat-word");
  if (repeatBtn) repeatBtn.innerHTML = icon("sound") + " Ouvir de novo";
  const testVoiceBtn = document.getElementById("btn-test-voice");
  if (testVoiceBtn) testVoiceBtn.innerHTML = icon("sound") + " Testar voz";
  const playQuizBtn = document.getElementById("btn-play-quiz");
  if (playQuizBtn) playQuizBtn.innerHTML = icon("play") + " Jogar";
  const playPill = document.querySelector(".play-pill");
  if (playPill) playPill.innerHTML = icon("play") + " JOGAR";
}
initIcons();

// ===================== Mascote (quokka) e avatar (voxel customizável) — SVG original =====================
function mascotSVG() {
  return `<svg class="quokka" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
    <ellipse class="ear" cx="24" cy="26" rx="14" ry="16"/>
    <ellipse class="ear" cx="76" cy="26" rx="14" ry="16"/>
    <ellipse class="ear-inner" cx="24" cy="28" rx="7" ry="9"/>
    <ellipse class="ear-inner" cx="76" cy="28" rx="7" ry="9"/>
    <circle class="body" cx="50" cy="56" r="38"/>
    <ellipse class="belly" cx="50" cy="66" rx="22" ry="18"/>
    <circle class="eye" cx="38" cy="48" r="4.5"/>
    <circle class="eye" cx="62" cy="48" r="4.5"/>
    <path d="M35 62 Q50 74 65 62" stroke="#3A2E2A" stroke-width="3.5" fill="none" stroke-linecap="round"/>
  </svg>`;
}

let avatarState = (() => {
  try {
    return JSON.parse(localStorage.getItem("meuIngles_avatar_v1")) || { shirt: "coral", hat: "none", backpack: "none" };
  } catch (e) {
    return { shirt: "coral", hat: "none", backpack: "none" };
  }
})();
function saveAvatarState() {
  localStorage.setItem("meuIngles_avatar_v1", JSON.stringify(avatarState));
}

function svgHat(item) {
  if (!item || !item.type) return "";
  if (item.type === "cap") return `<path d="M30 16 Q50 -2 70 16 L70 22 L30 22 Z" fill="${item.color}"/><rect x="26" y="20" width="48" height="6" rx="3" fill="${item.color}"/>`;
  if (item.type === "party") return `<path d="M50 -4 L68 20 L32 20 Z" fill="${item.color}"/><circle cx="50" cy="-4" r="4" fill="#fff"/>`;
  return "";
}
// Ícone de cada item de avatar no seletor/celebração — cada categoria tem seu próprio símbolo,
// "sem item" (hat:none / backpack:none) fica só com a cor, sem ícone confuso.
function avatarItemIcon(cat, item) {
  if (cat === "shirt") return "👕";
  if (cat === "hat") return item.type === "cap" ? "🧢" : item.type === "party" ? "🎉" : "";
  if (cat === "backpack") return item.color ? "🎒" : "";
  return "";
}
function svgBackpack(item) {
  if (!item || !item.color) return "";
  return `<rect x="6" y="62" width="14" height="32" rx="5" fill="${item.color}"/>`;
}
function avatarSVG(state) {
  const shirt = AVATAR_ITEMS.shirt.find((i) => i.id === state.shirt);
  const hat = AVATAR_ITEMS.hat.find((i) => i.id === state.hat);
  const backpack = AVATAR_ITEMS.backpack.find((i) => i.id === state.backpack);
  return `<svg class="voxel-avatar" viewBox="0 0 100 130" xmlns="http://www.w3.org/2000/svg">
    ${svgBackpack(backpack)}
    <rect x="34" y="96" width="14" height="28" rx="3" fill="#4A3F3A"/>
    <rect x="52" y="96" width="14" height="28" rx="3" fill="#4A3F3A"/>
    <rect x="14" y="60" width="14" height="34" rx="5" fill="${shirt.color}"/>
    <rect x="72" y="60" width="14" height="34" rx="5" fill="${shirt.color}"/>
    <rect x="26" y="58" width="48" height="42" rx="6" fill="${shirt.color}"/>
    <rect x="30" y="14" width="40" height="40" rx="8" fill="#F3C79A"/>
    <circle cx="42" cy="34" r="3.2" fill="#3A2E2A"/>
    <circle cx="58" cy="34" r="3.2" fill="#3A2E2A"/>
    <path d="M40 42 Q50 48 60 42" stroke="#3A2E2A" stroke-width="2.6" fill="none" stroke-linecap="round"/>
    ${svgHat(hat)}
  </svg>`;
}
function renderAllAvatarMounts() {
  ["avatar-hero-mount", "home-avatar-mount"].forEach((id) => {
    const el = document.getElementById(id);
    if (el) el.innerHTML = avatarSVG(avatarState);
  });
}

function renderAvatarScreen() {
  let totalUnlocked = 0, totalItems = 0;
  Object.keys(AVATAR_ITEMS).forEach((cat) => {
    const row = document.getElementById("row-" + cat);
    row.innerHTML = "";
    AVATAR_ITEMS[cat].forEach((item) => {
      totalItems++;
      const unlocked = isCategoryUnlockThresholdMet(item.unlockedBy);
      if (unlocked) totalUnlocked++;
      const btn = document.createElement("button");
      btn.className = "item-swatch" + (unlocked ? "" : " locked") + (avatarState[cat] === item.id ? " selected" : "");
      btn.style.background = item.color || "#EFE7DF";
      btn.innerHTML = avatarItemIcon(cat, item);
      if (!unlocked) btn.innerHTML += `<span class="lock-badge">${icon("lock")}</span>`;
      btn.addEventListener("click", () => {
        const hintEl = document.getElementById("avatar-unlock-hint");
        if (!unlocked) {
          const catMeta = CATEGORY_META[item.unlockedBy];
          hintEl.textContent = `🔒 Continue praticando "${catMeta ? catMeta.namePt : item.unlockedBy}" pra desbloquear!`;
          btn.style.animation = "none";
          void btn.offsetWidth;
          btn.style.animation = "shake 0.4s";
          return;
        }
        avatarState[cat] = item.id;
        saveAvatarState();
        hintEl.textContent = "";
        renderAvatarScreen();
        renderAllAvatarMounts();
      });
      row.appendChild(btn);
    });
  });
  document.getElementById("avatar-unlocked-count").textContent = `${totalUnlocked}/${totalItems} itens desbloqueados`;
  const homeHint = document.getElementById("avatar-unlock-hint-home");
  if (homeHint) homeHint.textContent = `${totalUnlocked}/${totalItems} itens`;
}

document.getElementById("btn-avatar-hero").addEventListener("click", () => {
  renderAvatarScreen();
  showScreen("avatar");
});

// ===================== My English World (mapa de situações + explorar por categoria) =====================
function renderWorldMap() {
  const pinsWrap = document.getElementById("world-pins");
  pinsWrap.innerHTML = "";
  renderCategoryGrid();
  SITUATIONS.forEach((situation) => {
    const ratio = getSituationProgressRatio(situation);
    const pin = document.createElement("button");
    pin.className = "pin";
    pin.style.top = situation.mapPos.top;
    pin.style.left = situation.mapPos.left;
    pin.innerHTML = `<div class="pin-badge">${situation.icon}${ratio >= UNLOCK_THRESHOLD ? '<div class="ring"></div>' : ""}</div><div class="label">${situation.namePt}</div>`;
    pin.addEventListener("click", () => goToSituation(situation));
    pinsWrap.appendChild(pin);
  });
  document.getElementById("world-avatar").innerHTML = avatarSVG(avatarState);
  const hintEl = document.querySelector("#world-map .world-hint");
  if (hintEl) {
    const anyIntroduced = CONTENT.some((it) => getState(it.id).introduced);
    hintEl.textContent = anyIntroduced ? "👉 Toque num lugar pra ir e jogar lá!" : "🌱 Sua aventura começa aqui — toque num lugar!";
  }
}

function goToSituation(situation) {
  speakPT(situation.namePt, situation.id);
  const avatarEl = document.getElementById("world-avatar");
  avatarEl.style.top = situation.mapPos.top;
  avatarEl.style.left = situation.mapPos.left;
  avatarEl.classList.add("walking");
  setTimeout(() => {
    avatarEl.classList.remove("walking");
    const items = getSituationItems(situation);
    const queue = shuffle(items).slice(0, 7).map((it) => ({ item: it, roundType: getState(it.id).introduced ? "choice" : "intro" }));
    // se esse lugar tem um cenário de problem-posing, ele abre a visita — o resto do vocabulário
    // do lugar vem depois, como prática complementar.
    const scenario = getScenarioForSituation(situation.id);
    if (scenario) {
      queue.unshift({ item: CONTENT_BY_ID[scenario.correctId], roundType: "situation", scenario });
    }
    quizReturnScreen = "world";
    startQuiz(queue);
  }, 900);
}

document.getElementById("btn-world-banner").addEventListener("click", () => {
  renderWorldMap();
  showScreen("world");
});

// ===================== Voz (TTS) =====================
let voices = [];
let chosenVoiceURI = localStorage.getItem("meuIngles_voice") || null;
let speechRate = parseFloat(localStorage.getItem("meuIngles_rate") || "0.85");

function loadVoices() {
  voices = window.speechSynthesis ? window.speechSynthesis.getVoices() : [];
  populateVoiceSelect();
}
if (window.speechSynthesis) {
  window.speechSynthesis.onvoiceschanged = loadVoices;
  loadVoices();
}

function pickDefaultVoice() {
  if (chosenVoiceURI) {
    const v = voices.find((v) => v.voiceURI === chosenVoiceURI);
    if (v) return v;
  }
  const enVoices = voices.filter((v) => v.lang && v.lang.toLowerCase().startsWith("en"));
  return (
    enVoices.find((v) => /AU/i.test(v.lang)) ||
    enVoices.find((v) => /GB/i.test(v.lang)) ||
    enVoices.find((v) => /US/i.test(v.lang)) ||
    enVoices[0] ||
    voices[0]
  );
}

// Voz neural pré-gravada (edge-tts, Natasha) quando o item tem id — muito mais natural que o TTS ao
// vivo do navegador. Cai pro TTS ao vivo se não tiver id, se o arquivo não existir, ou se der erro.
// Tenta algumas extensões em sequência: todo conteúdo gerado por TTS é .mp3 (acha de primeira,
// sem custo), mas um áudio gravado pela família no estúdio de conteúdo (review/upload.html) vem
// do microfone do navegador em .webm — sem isso, essas gravações nunca tocariam.
const AUDIO_EXT_FALLBACKS = ["mp3", "webm", "ogg", "m4a", "wav"];
let currentAudio = null;
function speak(text, itemId) {
  if (currentAudio) {
    currentAudio.pause();
    currentAudio = null;
  }
  if (itemId) {
    playAudioWithFallback(`assets/audio/en/${itemId}`, 0, text);
    return;
  }
  speakLive(text);
}
function playAudioWithFallback(basePath, i, text) {
  if (i >= AUDIO_EXT_FALLBACKS.length) {
    speakLive(text);
    return;
  }
  const audio = new Audio(`${basePath}.${AUDIO_EXT_FALLBACKS[i]}`);
  audio.playbackRate = speechRate / 0.85; // 0.85 é o ritmo natural gravado; ajusta proporcional ao slider
  audio.addEventListener("error", () => playAudioWithFallback(basePath, i + 1, text), { once: true });
  audio.play().catch(() => playAudioWithFallback(basePath, i + 1, text));
  currentAudio = audio;
}

function speakLive(text, lang) {
  if (!window.speechSynthesis) return;
  window.speechSynthesis.cancel();
  const utter = new SpeechSynthesisUtterance(text);
  if (lang === "pt") {
    const ptVoice = voices.find((v) => v.lang && v.lang.toLowerCase().startsWith("pt"));
    if (ptVoice) utter.voice = ptVoice;
    utter.lang = ptVoice ? ptVoice.lang : "pt-BR";
  } else {
    const voice = pickDefaultVoice();
    if (voice) utter.voice = voice;
    utter.lang = voice ? voice.lang : "en-US";
  }
  utter.rate = speechRate;
  utter.pitch = 1.05;
  window.speechSynthesis.speak(utter);
}
// Narração em português (nomes de lugar, instrução) — nunca é o conteúdo-alvo em inglês.
// Mesmo padrão de speak(): voz neural pré-gravada (edge-tts, Antônio) quando tem id, senão TTS
// ao vivo do navegador (só ficava no TTS ao vivo até aqui — daí a voz robótica em PT).
function speakPT(text, id) {
  if (currentAudio) {
    currentAudio.pause();
    currentAudio = null;
  }
  if (id) {
    const audio = new Audio(`assets/audio/pt/${id}.mp3`);
    audio.playbackRate = speechRate / 0.85;
    audio.addEventListener("error", () => speakLive(text, "pt"), { once: true });
    audio.play().catch(() => speakLive(text, "pt"));
    currentAudio = audio;
    return;
  }
  speakLive(text, "pt");
}

function populateVoiceSelect() {
  const sel = document.getElementById("voice-select");
  const enVoices = voices.filter((v) => v.lang && v.lang.toLowerCase().startsWith("en"));
  sel.innerHTML = "";
  enVoices.forEach((v) => {
    const opt = document.createElement("option");
    opt.value = v.voiceURI;
    opt.textContent = `${v.name} (${v.lang})`;
    sel.appendChild(opt);
  });
  const def = pickDefaultVoice();
  if (def) sel.value = def.voiceURI;
}

// ===================== Sons (Web Audio, sem precisar de arquivos) =====================
let audioCtx = null;
function getAudioCtx() {
  if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  return audioCtx;
}
function playTone(freq, duration, delay) {
  const ctx = getAudioCtx();
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = "sine";
  osc.frequency.value = freq;
  gain.gain.setValueAtTime(0.15, ctx.currentTime + delay);
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + delay + duration);
  osc.connect(gain).connect(ctx.destination);
  osc.start(ctx.currentTime + delay);
  osc.stop(ctx.currentTime + delay + duration);
}
function playCheer() {
  playTone(523.25, 0.15, 0);
  playTone(659.25, 0.15, 0.12);
  playTone(783.99, 0.25, 0.24);
}
function playGentle() {
  playTone(392, 0.2, 0);
}
function playUnlock() {
  playTone(659.25, 0.12, 0);
  playTone(880, 0.12, 0.1);
  playTone(1046.5, 0.3, 0.2);
}
// Confete leve em CSS puro (sem lib) — só no acerto, função clara de recompensa, não decoração gratuita.
const CONFETTI_COLORS = ["#FF6B5B", "#FFB648", "#5FC98D", "#3FB6C9"];
function spawnConfetti(anchorEl) {
  const rect = anchorEl.getBoundingClientRect();
  const layer = document.createElement("div");
  layer.className = "confetti-layer";
  for (let i = 0; i < 10; i++) {
    const piece = document.createElement("span");
    piece.className = "confetti-piece";
    piece.style.left = rect.left + rect.width / 2 + "px";
    piece.style.top = rect.top + rect.height / 2 + "px";
    piece.style.background = CONFETTI_COLORS[i % CONFETTI_COLORS.length];
    piece.style.setProperty("--dx", (Math.random() * 160 - 80) + "px");
    piece.style.setProperty("--dy", (Math.random() * -120 - 40) + "px");
    piece.style.setProperty("--rot", Math.round(Math.random() * 360) + "deg");
    layer.appendChild(piece);
  }
  document.body.appendChild(layer);
  setTimeout(() => layer.remove(), 900);
}

function playFanfare() {
  playTone(523.25, 0.13, 0);
  playTone(659.25, 0.13, 0.11);
  playTone(783.99, 0.13, 0.22);
  playTone(1046.5, 0.4, 0.33);
}

// ===================== Navegação de telas =====================
const screens = document.querySelectorAll(".screen");
function showScreen(id) {
  screens.forEach((s) => s.classList.toggle("active", s.id === "screen-" + id));
}
document.querySelectorAll("[data-back]").forEach((btn) => {
  btn.addEventListener("click", () => showScreen(btn.dataset.back));
});
document.getElementById("btn-settings").addEventListener("click", () => {
  renderSettings();
  showScreen("settings");
});

// O quiz é aberto de 3 lugares (missão do Home, Categoria, situação do Mapa) — "voltar" precisa
// lembrar de onde veio, senão cai numa tela de Categoria vazia quando não veio de lá (bug real,
// achado na auditoria de navegação). Setado em cada um dos 3 pontos de entrada do quiz.
let quizReturnScreen = "home";
function goToQuizReturnScreen() {
  if (quizReturnScreen === "world") {
    renderWorldMap();
    showScreen("world");
  } else if (quizReturnScreen === "category") {
    showScreen("category");
  } else {
    renderHome();
    showScreen("home");
  }
}
document.getElementById("btn-quiz-back").addEventListener("click", goToQuizReturnScreen);
document.getElementById("btn-result-back").addEventListener("click", goToQuizReturnScreen);

// ===================== Home =====================
function renderHome() {
  document.getElementById("home-mascot").innerHTML = mascotSVG();
  renderAllAvatarMounts();
  renderAvatarScreen();

  // streak
  const streak = touchStreak();
  document.getElementById("streak-badge").innerHTML = streak.count > 0 ? `🔥 ${streak.count}` : "👋";
  document.getElementById("home-greeting").textContent = streak.count > 1 ? `${streak.count} dias seguidos!` : "Olá! 👋";

  // missão do dia (sessão adaptativa, com carinha de missão)
  const session = buildSession();
  const catCounts = {};
  session.forEach((r) => { catCounts[r.item.category] = (catCounts[r.item.category] || 0) + 1; });
  const topCatId = Object.keys(catCounts).sort((a, b) => catCounts[b] - catCounts[a])[0];
  const topCat = topCatId ? CATEGORY_META[topCatId] : null;
  const estMinutes = Math.max(1, Math.round(session.length / 3));
  document.getElementById("mission-title").textContent = topCat ? `${topCat.icon} ${topCat.namePt}` : "🎉 Tudo em dia!";
  document.getElementById("mission-meta").textContent = session.length ? `⏱ ~${estMinutes} min · ${session.length} atividades` : "Volta mais tarde pra revisar!";

  // prévia de Quokka Bay: 3 lugares com menos progresso, como sugestão do que explorar a seguir
  const nextSituations = [...SITUATIONS].sort((a, b) => getSituationProgressRatio(a) - getSituationProgressRatio(b)).slice(0, 3);
  document.getElementById("world-banner-preview").innerHTML = nextSituations
    .map((s) => `<div class="chip"><span class="chip-ic">${s.icon}</span>${s.namePt}</div>`)
    .join("");
}

// Grade de categorias (explorar livre) — mora dentro de Adventure/My English World, não na Home.
function renderCategoryGrid() {
  const grid = document.getElementById("category-grid");
  if (!grid) return;
  grid.innerHTML = "";
  Object.keys(CATEGORY_META).forEach((catId) => {
    const meta = CATEGORY_META[catId];
    const items = CONTENT.filter((it) => it.category === catId);
    const masteredCount = items.filter((it) => getLearningStage(it.id) === "mastered").length;
    const btn = document.createElement("button");
    btn.className = "cat-card";
    btn.style.background = meta.color;
    btn.innerHTML = `<span class="cat-icon">${meta.icon}</span><span>${meta.namePt}</span>${renderDots(masteredCount, items.length, "sm cat-progress")}`;
    btn.addEventListener("click", () => openCategory(catId));
    grid.appendChild(btn);
  });
}

// ===================== Categoria (explorar) =====================
let currentCategoryId = null;
function openCategory(catId) {
  currentCategoryId = catId;
  const meta = CATEGORY_META[catId];
  document.getElementById("category-title").textContent = meta.namePt;
  const wordGrid = document.getElementById("word-grid");
  wordGrid.innerHTML = "";
  CONTENT.filter((it) => it.category === catId).forEach((item) => {
    const card = document.createElement("button");
    card.className = "word-card";
    card.innerHTML = `<span class="word-emoji">${renderMedia(item)}</span><span class="word-en">${item.en}</span><span class="word-pt">${item.pt}</span>`;
    card.addEventListener("click", () => {
      speak(item.en, item.id);
      markIntroduced(item.id);
      renderHome();
    });
    wordGrid.appendChild(card);
  });
  showScreen("category");
}

document.getElementById("btn-play-quiz").addEventListener("click", () => {
  const items = CONTENT.filter((it) => it.category === currentCategoryId);
  quizReturnScreen = "category";
  startQuiz(shuffle(items).slice(0, 10).map((it) => ({ item: it, roundType: "choice" })));
});

document.getElementById("btn-session").addEventListener("click", () => {
  quizReturnScreen = "home";
  startQuiz(buildSession());
});

// ===================== Quiz =====================
let quizQueue = [];
let quizIndex = 0;
let quizScore = { correct: 0, total: 0 };
let choiceLocked = false;
let wrongAttemptsThisRound = 0;

// Itens de avatar desbloqueados agora (usado pra detectar desbloqueios novos ao fim da sessão).
function getUnlockedAvatarItemIds() {
  const ids = [];
  Object.keys(AVATAR_ITEMS).forEach((cat) => {
    AVATAR_ITEMS[cat].forEach((item) => {
      if (isCategoryUnlockThresholdMet(item.unlockedBy)) ids.push(cat + ":" + item.id);
    });
  });
  return ids;
}

let unlockedSnapshotAtSessionStart = [];

function startQuiz(queue) {
  quizQueue = queue;
  quizIndex = 0;
  quizScore = { correct: 0, total: 0 };
  unlockedSnapshotAtSessionStart = getUnlockedAvatarItemIds();
  showScreen("quiz");
  renderRound();
}

document.getElementById("btn-repeat-word").addEventListener("click", () => {
  const round = quizQueue[quizIndex];
  if (round) speak(round.item.en, round.item.id);
});

function renderRound() {
  if (quizIndex >= quizQueue.length) {
    finishQuiz();
    return;
  }
  const round = quizQueue[quizIndex];
  document.getElementById("quiz-progress").innerHTML = renderDots(quizIndex, quizQueue.length, "", quizQueue.length);
  const container = document.getElementById("quiz-options");
  const repeatBtn = document.getElementById("btn-repeat-word");
  container.innerHTML = "";
  container.classList.remove("enter");
  void container.offsetWidth;
  container.classList.add("enter");
  choiceLocked = false;

  if (round.roundType === "intro") {
    repeatBtn.style.display = "none";
    container.innerHTML = `
      <div class="intro-card">
        <span class="word-emoji-big">${renderMedia(round.item)}</span>
        <span class="word-en">${round.item.en}</span>
        <button class="word-pt-btn" id="intro-pt">${icon("sound")}<span class="word-pt">${round.item.pt}</span></button>
        <span class="intro-hint">toque na imagem pra ouvir em inglês · toque na tradução pra ouvir em português</span>
        <button class="big-btn" id="intro-next">Já sei! →</button>
      </div>`;
    speak(round.item.en, round.item.id);
    container.querySelector(".word-emoji-big").addEventListener("click", () => speak(round.item.en, round.item.id));
    container.querySelector("#intro-pt").addEventListener("click", () => speakPT(round.item.pt));
    container.querySelector("#intro-next").addEventListener("click", () => {
      markIntroduced(round.item.id);
      quizIndex++;
      renderRound();
    });
    return;
  }

  if (round.roundType === "speak") {
    repeatBtn.style.display = "";
    container.innerHTML = `
      <div class="speak-round">
        <span class="word-emoji-big">${renderMedia(round.item)}</span>
        <button class="mic-btn" id="mic-btn" aria-label="Falar">${icon("mic")}</button>
        <span class="speak-status" id="speak-status">Toque no microfone e fale: "${round.item.en}"</span>
        <span class="speak-note">É só uma brincadeira de praticar a fala — não avalia a pronúncia dele.</span>
      </div>`;
    speak(round.item.en, round.item.id);
    document.getElementById("mic-btn").addEventListener("click", () => startSpeakAttempt(round.item));
    return;
  }

  if (round.roundType === "situation") {
    repeatBtn.style.display = "none";
    wrongAttemptsThisRound = 0;
    const scenario = round.scenario;
    container.innerHTML = `
      <div class="situation-card">
        <div class="scenario-emoji">${round.item.emoji}</div>
        <div class="scenario-bubble">
          <span class="avatar">👩‍🏫</span>
          <span class="txt">"${scenario.promptPt}"</span>
          <button class="speaker" id="scenario-replay" aria-label="Ouvir de novo">${icon("sound")}</button>
        </div>
      </div>
      <div class="prompt-line">O que você fala? 🇬🇧</div>
      <div class="situation-options" id="situation-options"></div>`;
    const optionsWrap = document.getElementById("situation-options");
    const options = shuffle([round.item, ...scenario.distractorIds.map((id) => CONTENT_BY_ID[id])]);
    options.forEach((opt) => {
      const btn = document.createElement("button");
      btn.className = "quiz-option situation-option";
      btn.innerHTML = `<span class="opt-emoji">${opt.emoji}</span><span class="opt-text">${opt.en}</span>`;
      btn.dataset.itemId = opt.id;
      btn.addEventListener("click", () => handleChoice(btn, opt, round.item, optionsWrap));
      optionsWrap.appendChild(btn);
    });
    document.getElementById("scenario-replay").addEventListener("click", () => speakPT(scenario.promptPt, scenario.id));
    speakPT(scenario.promptPt, scenario.id);
    options.forEach((opt, i) => {
      setTimeout(() => {
        const btn = optionsWrap.children[[...optionsWrap.children].findIndex((b) => b.dataset.itemId === opt.id)];
        optionsWrap.querySelectorAll(".situation-option").forEach((b) => b.classList.remove("reading"));
        if (btn) btn.classList.add("reading");
        speak(opt.en, opt.id);
      }, 2200 + i * 2000);
    });
    setTimeout(() => optionsWrap.querySelectorAll(".situation-option").forEach((b) => b.classList.remove("reading")), 2200 + options.length * 2000);
    return;
  }

  // choice
  repeatBtn.style.display = "";
  wrongAttemptsThisRound = 0;
  const distractors = getDistractors(round.item, 2);
  const options = shuffle([round.item, ...distractors]);
  options.forEach((opt) => {
    const btn = document.createElement("button");
    btn.className = "quiz-option";
    btn.innerHTML = renderMedia(opt);
    btn.dataset.itemId = opt.id;
    btn.addEventListener("click", () => handleChoice(btn, opt, round.item, container));
    container.appendChild(btn);
  });
  speak(round.item.en, round.item.id);
}

function handleChoice(btn, opt, target, container) {
  if (choiceLocked) return;
  if (opt.id === target.id) {
    choiceLocked = true;
    btn.classList.add("correct");
    playCheer();
    spawnConfetti(btn);
    recordResult(target.id, wrongAttemptsThisRound === 0);
    quizScore.correct++;
    quizScore.total++;
    setTimeout(() => {
      quizIndex++;
      renderRound();
    }, 900);
  } else {
    btn.classList.add("wrong");
    btn.disabled = true;
    playGentle();
    wrongAttemptsThisRound++;
    quizScore.total++;
    if (wrongAttemptsThisRound >= 2) {
      choiceLocked = true;
      recordResult(target.id, false);
      const correctBtn = [...container.querySelectorAll(".quiz-option")].find((b) => b.dataset.itemId === target.id);
      if (correctBtn) correctBtn.classList.add("correct");
      speak(target.en, target.id);
      setTimeout(() => {
        quizIndex++;
        renderRound();
      }, 1400);
    }
  }
}

// ---- Speaking: correção de integridade — só conta como resultado quando reconhece de verdade ----
function startSpeakAttempt(item) {
  const statusEl = document.getElementById("speak-status");
  const micBtn = document.getElementById("mic-btn");
  if (!speechRecognitionAvailable()) {
    statusEl.textContent = "Reconhecimento de voz não disponível neste navegador.";
    return;
  }
  const Recognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  const rec = new Recognition();
  rec.lang = "en-US";
  rec.maxAlternatives = 3;
  micBtn.classList.add("listening");
  statusEl.textContent = "Ouvindo...";

  rec.onresult = (e) => {
    const alts = Array.from(e.results[0]).map((r) => r.transcript);
    const matched = alts.some((a) => matchesAcceptedAnswer(item, a));
    micBtn.classList.remove("listening");
    recordSpeechAttempt(item.id, matched);
    if (matched) {
      statusEl.textContent = "Arrasou! 🎉";
      playCheer();
    } else {
      statusEl.textContent = "Legal! Vamos ouvir de novo.";
      speak(item.en, item.id);
    }
    setTimeout(() => {
      quizIndex++;
      renderRound();
    }, 1400);
  };
  rec.onerror = () => {
    micBtn.classList.remove("listening");
    statusEl.textContent = "Sem problemas, vamos seguir!";
    // erro técnico de reconhecimento não é uma tentativa real -> não registra nada no progresso
    setTimeout(() => {
      quizIndex++;
      renderRound();
    }, 1200);
  };
  rec.onend = () => micBtn.classList.remove("listening");
  try {
    rec.start();
  } catch (e) {
    statusEl.textContent = "Não consegui acessar o microfone.";
  }
}

function finishQuiz() {
  const newUnlockIds = getUnlockedAvatarItemIds().filter((id) => !unlockedSnapshotAtSessionStart.includes(id));
  if (newUnlockIds.length > 0) {
    showUnlockCelebration(newUnlockIds, showResultScreen);
  } else {
    showResultScreen();
  }
}

function showResultScreen() {
  showScreen("result");
  playFanfare();
  const pct = quizScore.total ? quizScore.correct / quizScore.total : 1;
  const starCount = pct >= 0.85 ? 3 : pct >= 0.5 ? 2 : 1;
  document.getElementById("result-stars").textContent = "⭐".repeat(starCount) + "☆".repeat(3 - starCount);
  document.getElementById("result-text").textContent = `Você brincou com ${quizQueue.length} palavras!`;
  renderHome();
}

// Momento de celebração: 🔒 → ✨ → item revelado. Só aparece quando algo é desbloqueado de verdade
// nesta sessão (loop LEARN → COMPLETE → REWARD do LEARNING_PHILOSOPHY.md, seção 28).
function showUnlockCelebration(newUnlockIds, onDone) {
  const [cat, itemId] = newUnlockIds[0].split(":");
  const item = AVATAR_ITEMS[cat].find((i) => i.id === itemId);
  const catLabel = { shirt: "Camiseta", hat: "Chapéu", backpack: "Mochila" }[cat] || cat;
  showScreen("unlock");
  const lockEl = document.getElementById("unlock-lock-icon");
  const revealEl = document.getElementById("unlock-reveal");
  lockEl.style.display = "";
  revealEl.style.display = "none";
  lockEl.innerHTML = icon("lock");
  lockEl.classList.remove("sparkle");
  void lockEl.offsetWidth;
  lockEl.classList.add("sparkle");

  const btn = document.getElementById("btn-unlock-continue");
  btn.textContent = newUnlockIds.length > 1 ? `Continuar (+${newUnlockIds.length - 1})` : "Continuar";
  btn.onclick = () => {
    if (newUnlockIds.length > 1) {
      showUnlockCelebration(newUnlockIds.slice(1), onDone);
    } else {
      onDone();
    }
  };

  setTimeout(() => {
    playUnlock();
    lockEl.style.display = "none";
    revealEl.style.display = "";
    document.getElementById("unlock-item-preview").innerHTML =
      `<div class="item-swatch selected" style="background:${item.color || "#EFE7DF"}">${avatarItemIcon(cat, item)}</div>`;
    document.getElementById("unlock-item-name").textContent = `Novo item de ${catLabel.toLowerCase()} desbloqueado!`;
  }, 900);
}
document.getElementById("btn-play-again").addEventListener("click", () => startQuiz(buildSession()));

// ===================== Configurações + progresso =====================
document.getElementById("voice-select").addEventListener("change", (e) => {
  chosenVoiceURI = e.target.value;
  localStorage.setItem("meuIngles_voice", chosenVoiceURI);
});
document.getElementById("rate-slider").addEventListener("input", (e) => {
  speechRate = parseFloat(e.target.value);
  localStorage.setItem("meuIngles_rate", String(speechRate));
});
document.getElementById("btn-test-voice").addEventListener("click", () => speak("Hello! This is my voice."));

document.getElementById("btn-reset-progress").addEventListener("click", () => {
  if (confirm("Tem certeza que quer zerar todo o progresso?")) {
    learningState = {};
    saveLearningState();
    renderSettings();
    renderHome();
  }
});

// "há quanto tempo" em texto — usa streakAtLoad (foto de antes desta sessão tocar o streak), não
// loadStreak() direto, senão a resposta seria sempre "hoje" só por causa de alguém checando.
function formatLastActive(dateStr) {
  if (!dateStr) return "ainda não abriu o app";
  const today = todayStr();
  const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
  if (dateStr === today) return "hoje";
  if (dateStr === yesterday) return "ontem";
  const [y, m, d] = dateStr.split("-");
  const days = Math.round((Date.parse(today) - Date.parse(dateStr)) / 86400000);
  return `${d}/${m}/${y} (${days} dias atrás)`;
}

function buildProgressSummary() {
  const lastActiveLine = `📅 Última vez que abriu: ${formatLastActive(streakAtLoad.lastActiveDate)}`;
  const lines = Object.keys(CATEGORY_META).map((catId) => {
    const meta = CATEGORY_META[catId];
    const items = CONTENT.filter((it) => it.category === catId);
    const introduced = items.filter((it) => getState(it.id).introduced).length;
    const mastered = items.filter((it) => getLearningStage(it.id) === "mastered").length;
    return `${meta.icon} ${meta.namePt}: ${mastered}/${items.length} dominadas (${introduced} vistas)`;
  });
  const struggling = CONTENT.map((it) => ({ it, st: getState(it.id) }))
    .filter((x) => x.st.introduced && x.st.wrongCount >= 2 && x.st.box <= 1)
    .sort((a, b) => b.st.wrongCount - a.st.wrongCount)
    .slice(0, 8)
    .map((x) => x.it.en);
  let text = lastActiveLine + "\n\n" + lines.join("\n");
  if (struggling.length) text += `\n\nCom mais dificuldade: ${struggling.join(", ")}`;
  return text;
}

// Dados estruturados por trás do relatório em texto — não aparecem na tela, só vão junto do
// compartilhamento, pra quem colar isso numa conversa com o Claude consiga pedir gráficos de
// evolução (streak, atividade por dia, palavras dominadas por categoria) sem precisar de nenhum
// servidor: tudo já mora no localStorage do aparelho, isso só empacota pra exportar.
function buildStructuredReportData() {
  const streak = streakAtLoad;
  const byCategory = Object.keys(CATEGORY_META).map((catId) => {
    const meta = CATEGORY_META[catId];
    const items = CONTENT.filter((it) => it.category === catId);
    return {
      id: catId,
      namePt: meta.namePt,
      total: items.length,
      introduced: items.filter((it) => getState(it.id).introduced).length,
      mastered: items.filter((it) => getLearningStage(it.id) === "mastered").length,
    };
  });
  const totals = { new: 0, learning: 0, consolidating: 0, mastered: 0 };
  CONTENT.forEach((it) => { totals[getLearningStage(it.id)]++; });
  const struggling = CONTENT.map((it) => ({ it, st: getState(it.id) }))
    .filter((x) => x.st.introduced && x.st.wrongCount >= 2 && x.st.box <= 1)
    .sort((a, b) => b.st.wrongCount - a.st.wrongCount)
    .slice(0, 8)
    .map((x) => ({ id: x.it.id, en: x.it.en, wrongCount: x.st.wrongCount }));
  return {
    exportedAt: todayStr(),
    totalContentItems: CONTENT.length,
    stageTotals: totals,
    streak: { current: streak.count, lastActiveDate: streak.lastActiveDate },
    byCategory,
    dailyActivity: loadActivityLog(), // { "YYYY-MM-DD": { seen, correct, wrong, speech } } — até 60 dias
    strugglingTop: struggling,
  };
}

document.getElementById("btn-check-update").addEventListener("click", checkForUpdate);

document.getElementById("btn-share-report").addEventListener("click", () => {
  const today = new Date().toLocaleDateString("pt-BR");
  const dataBlock = JSON.stringify(buildStructuredReportData());
  const text =
    `📚 Relatório do Meu Inglês — ${today}\n\n${buildProgressSummary()}\n\n` +
    `— \n📊 Cole este bloco numa conversa com o Claude pra ele gerar gráficos de evolução:\n` +
    "```json\n" + dataBlock + "\n```";
  if (navigator.share) {
    navigator.share({ title: "Relatório - Meu Inglês", text }).catch(() => {});
  } else if (navigator.clipboard) {
    navigator.clipboard.writeText(text);
    alert("Relatório copiado! Cole onde quiser compartilhar.\n\n" + text);
  } else {
    alert(text);
  }
});

// ---- Debug do motor adaptativo ----
function renderAdaptationLog() {
  const el = document.getElementById("adaptation-log");
  if (!adaptationLog.length) {
    el.innerHTML = `<div class="empty">Nada registrado ainda — a decomposição aparece aqui quando um item falha ${FAILURE_THRESHOLD}x seguidas sem sair da caixa 0.</div>`;
    return;
  }
  el.innerHTML = adaptationLog
    .map(
      (e) => `
      <div class="entry">
        <div class="when">${e.at}</div>
        <div><strong>${e.itemEn}</strong> (${e.item}) — ${e.reason}</div>
        <div>→ inseriu: ${e.insertedPrerequisites.join(", ")}</div>
      </div>`
    )
    .join("");
}

document.getElementById("btn-simulate-difficulty").addEventListener("click", () => {
  const id = "phrase_bathroom_please";
  markIntroduced(id);
  recordResult(id, false);
  recordResult(id, false);
  buildSession(); // dispara a checagem de decomposição e loga se aplicável
  renderAdaptationLog();
  renderHome();
});

document.getElementById("btn-clear-log").addEventListener("click", () => {
  adaptationLog = [];
  try {
    sessionStorage.removeItem(ADAPTATION_LOG_KEY);
  } catch (e) {}
  renderAdaptationLog();
});

function renderSettings() {
  populateVoiceSelect();
  document.getElementById("rate-slider").value = speechRate;
  document.getElementById("progress-summary").textContent = buildProgressSummary();
  renderAdaptationLog();
}

// ===================== Service Worker (offline + atualização) =====================
// sw.js já usa skipWaiting()/clients.claim() (assume controle rápido), mas isso sozinho não
// recarrega a PÁGINA já aberta — sem isso, quem já tinha o app aberto ficava preso na versão
// antiga até fechar e abrir de novo na mão. Aqui: assim que o novo SW assume o controle, recarrega
// a página uma vez automaticamente (silencioso — não interrompe uma rodada com um popup).
let swRegistration = null;
if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("sw.js").then((reg) => { swRegistration = reg; }).catch(() => {});
  });
  let reloadedForUpdate = false;
  navigator.serviceWorker.addEventListener("controllerchange", () => {
    if (reloadedForUpdate) return;
    reloadedForUpdate = true;
    window.location.reload();
  });
}
// Botão manual em Configurações — força checar agora (sem esperar o navegador checar sozinho),
// útil antes de mostrar o app pro João sem depender de fechar/abrir.
function checkForUpdate() {
  const statusEl = document.getElementById("update-status");
  if (!swRegistration) {
    if (statusEl) statusEl.textContent = "Service worker não disponível.";
    return;
  }
  if (statusEl) statusEl.textContent = "Verificando...";
  swRegistration
    .update()
    .then(() => {
      if (statusEl) statusEl.textContent = swRegistration.waiting || swRegistration.installing
        ? "Atualização encontrada — aplicando..."
        : "Já está na versão mais recente.";
    })
    .catch(() => {
      if (statusEl) statusEl.textContent = "Não consegui verificar (sem internet?).";
    });
}

// ===================== Boas-vindas (só na primeira abertura) =====================
const ONBOARDED_KEY = "meuIngles_onboarded_v1";
document.getElementById("onboarding-mascot").innerHTML = mascotSVG();
document.getElementById("btn-onboarding-start").addEventListener("click", () => {
  localStorage.setItem(ONBOARDED_KEY, "1");
  renderHome();
  showScreen("home");
});

// ===================== Início =====================
if (localStorage.getItem(ONBOARDED_KEY)) {
  renderHome();
  showScreen("home");
} else {
  speakPT("Oi! Eu sou o Quokka! Vamos aprender inglês brincando?", "onboarding_greeting");
}

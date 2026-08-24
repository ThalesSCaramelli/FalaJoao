// ===================== Preparação dos dados =====================
function slug(s) {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, "_").replace(/^_+|_+$/g, "");
}

const GROUPS = [
  { id: "tier0", tier: 0, namePt: "Sobrevivência", icon: "🚸", color: "#FF8FA3", words: TIER0_SURVIVAL },
  ...CATEGORIES.map((c) => ({ ...c, tier: 1 })),
  { id: "tier2", tier: 2, namePt: "Combinações", icon: "🧩", color: "#C9A7EB", words: TIER2_COMBOS },
  { id: "tier3", tier: 3, namePt: "Frases do dia a dia", icon: "💬", color: "#8AC6D1", words: TIER3_SENTENCES },
];

const ALL_ITEMS = [];
GROUPS.forEach((group) => {
  group.words.forEach((w) => {
    ALL_ITEMS.push({
      id: `${group.id}_${slug(w.en)}`,
      groupId: group.id,
      tier: group.tier,
      en: w.en,
      pt: w.pt,
      emoji: w.emoji,
      image: w.image || null,
    });
  });
});
const ITEM_BY_ID = Object.fromEntries(ALL_ITEMS.map((i) => [i.id, i]));

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function renderMedia(item) {
  if (item.image) return `<img class="word-photo" src="${item.image}" alt="${item.en}" />`;
  return item.emoji;
}

// ===================== Repetição espaçada (Leitner simplificado) =====================
const SRS_KEY = "meuIngles_srs_v1";
const BOX_INTERVAL_DAYS = [0, 1, 3, 7, 21];

function loadSRS() {
  try {
    return JSON.parse(localStorage.getItem(SRS_KEY)) || {};
  } catch (e) {
    return {};
  }
}
let srsState = loadSRS();
function saveSRS() {
  localStorage.setItem(SRS_KEY, JSON.stringify(srsState));
}

function getItemState(id) {
  return (
    srsState[id] || {
      box: 0,
      introduced: false,
      nextDue: 0,
      correctStreak: 0,
      wrongCount: 0,
      correctCount: 0,
      lastSeen: null,
    }
  );
}

function markIntroduced(id) {
  const st = getItemState(id);
  if (!st.introduced) {
    st.introduced = true;
    st.nextDue = Date.now();
    st.lastSeen = Date.now();
    srsState[id] = st;
    saveSRS();
  }
}

function recordResult(id, correct) {
  const st = getItemState(id);
  st.introduced = true;
  st.lastSeen = Date.now();
  if (correct) {
    st.box = Math.min(st.box + 1, BOX_INTERVAL_DAYS.length - 1);
    st.correctStreak = (st.correctStreak || 0) + 1;
    st.correctCount = (st.correctCount || 0) + 1;
  } else {
    st.box = Math.max(st.box - 1, 0);
    st.correctStreak = 0;
    st.wrongCount = (st.wrongCount || 0) + 1;
  }
  st.nextDue = Date.now() + BOX_INTERVAL_DAYS[st.box] * 86400000;
  srsState[id] = st;
  saveSRS();
}

function getDueItems() {
  const now = Date.now();
  return ALL_ITEMS.filter((it) => {
    const st = getItemState(it.id);
    return st.introduced && st.nextDue <= now;
  });
}

function getNewCandidates(limit) {
  const notIntroduced = ALL_ITEMS.filter((it) => !getItemState(it.id).introduced);
  notIntroduced.sort((a, b) => a.tier - b.tier);
  return notIntroduced.slice(0, limit);
}

function speechRecognitionAvailable() {
  return !!(window.SpeechRecognition || window.webkitSpeechRecognition);
}

function pickRoundType(item) {
  const st = getItemState(item.id);
  if (!st.introduced) return "intro";
  if (st.box >= 3 && speechRecognitionAvailable() && navigator.onLine && Math.random() < 0.3) return "speak";
  return "choice";
}

// Monta a sessão do dia: revisões vencidas (prioridade pra Camada 0) + palavras novas, sempre misturado.
function buildSession() {
  const maxSession = 14;
  const due = getDueItems().sort((a, b) => {
    if (a.tier !== b.tier) return a.tier - b.tier;
    return (getItemState(b.id).wrongCount || 0) - (getItemState(a.id).wrongCount || 0);
  });
  const dueSlice = due.slice(0, Math.max(0, maxSession - 3));
  const newNeeded = Math.min(4, maxSession - dueSlice.length);
  const newItems = getNewCandidates(Math.max(2, newNeeded));
  let session = [...dueSlice, ...newItems].slice(0, maxSession);
  if (session.length === 0) {
    const introduced = ALL_ITEMS.filter((it) => getItemState(it.id).introduced);
    session = shuffle(introduced).slice(0, 10);
  }
  session = shuffle(session);
  return session.map((it) => ({ item: it, roundType: pickRoundType(it) }));
}

function getDistractors(item, count) {
  const sameGroup = ALL_ITEMS.filter((it) => it.groupId === item.groupId && it.id !== item.id);
  const pool = sameGroup.length >= count ? sameGroup : ALL_ITEMS.filter((it) => it.id !== item.id);
  return shuffle(pool).slice(0, count);
}

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

function speak(text) {
  if (!window.speechSynthesis) return;
  window.speechSynthesis.cancel();
  const utter = new SpeechSynthesisUtterance(text);
  const voice = pickDefaultVoice();
  if (voice) utter.voice = voice;
  utter.lang = voice ? voice.lang : "en-US";
  utter.rate = speechRate;
  utter.pitch = 1.05;
  window.speechSynthesis.speak(utter);
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

// ===================== Home =====================
function renderHome() {
  const grid = document.getElementById("category-grid");
  grid.innerHTML = "";
  GROUPS.forEach((group) => {
    const total = group.words.length;
    const introducedCount = group.words.filter((w) => getItemState(`${group.id}_${slug(w.en)}`).introduced).length;
    const btn = document.createElement("button");
    btn.className = "cat-card";
    btn.style.background = group.color;
    btn.innerHTML = `<span class="cat-icon">${group.icon}</span><span>${group.namePt}</span><span class="cat-progress">${introducedCount}/${total}</span>`;
    btn.addEventListener("click", () => openCategory(group.id));
    grid.appendChild(btn);
  });
  const dueCount = getDueItems().length;
  document.getElementById("session-badge").textContent = dueCount > 0 ? `${dueCount} pra revisar` : "vamos começar!";
}

// ===================== Categoria (explorar) =====================
let currentGroupId = null;
function openCategory(groupId) {
  currentGroupId = groupId;
  const group = GROUPS.find((g) => g.id === groupId);
  document.getElementById("category-title").textContent = group.namePt;
  const wordGrid = document.getElementById("word-grid");
  wordGrid.innerHTML = "";
  group.words.forEach((w) => {
    const id = `${group.id}_${slug(w.en)}`;
    const card = document.createElement("button");
    card.className = "word-card";
    card.innerHTML = `<span class="word-emoji">${renderMedia({ en: w.en, image: w.image, emoji: w.emoji })}</span><span class="word-en">${w.en}</span><span class="word-pt">${w.pt}</span>`;
    card.addEventListener("click", () => {
      speak(w.en);
      markIntroduced(id);
      renderHome();
    });
    wordGrid.appendChild(card);
  });
  showScreen("category");
}

document.getElementById("btn-play-quiz").addEventListener("click", () => {
  const group = GROUPS.find((g) => g.id === currentGroupId);
  const items = group.words.map((w) => ITEM_BY_ID[`${group.id}_${slug(w.en)}`]);
  startQuiz(shuffle(items).slice(0, 10).map((it) => ({ item: it, roundType: "choice" })));
});

document.getElementById("btn-session").addEventListener("click", () => {
  startQuiz(buildSession());
});

// ===================== Quiz =====================
let quizQueue = [];
let quizIndex = 0;
let quizScore = { correct: 0, total: 0 };
let choiceLocked = false;
let wrongAttemptsThisRound = 0;

function startQuiz(queue) {
  quizQueue = queue;
  quizIndex = 0;
  quizScore = { correct: 0, total: 0 };
  showScreen("quiz");
  renderRound();
}

document.getElementById("btn-repeat-word").addEventListener("click", () => {
  const round = quizQueue[quizIndex];
  if (round) speak(round.item.en);
});

function renderRound() {
  if (quizIndex >= quizQueue.length) {
    finishQuiz();
    return;
  }
  const round = quizQueue[quizIndex];
  document.getElementById("quiz-progress").textContent = `${quizIndex + 1} / ${quizQueue.length}`;
  const container = document.getElementById("quiz-options");
  const repeatBtn = document.getElementById("btn-repeat-word");
  container.innerHTML = "";
  choiceLocked = false;

  if (round.roundType === "intro") {
    repeatBtn.style.display = "none";
    container.innerHTML = `
      <div class="intro-card">
        <span class="word-emoji-big">${renderMedia(round.item)}</span>
        <span class="word-en">${round.item.en}</span>
        <span class="word-pt">${round.item.pt}</span>
        <span class="intro-hint">toque na imagem pra ouvir de novo</span>
        <button class="big-btn" id="intro-next">Já sei! →</button>
      </div>`;
    speak(round.item.en);
    container.querySelector(".word-emoji-big").addEventListener("click", () => speak(round.item.en));
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
        <button class="mic-btn" id="mic-btn">🎤</button>
        <span class="speak-status" id="speak-status">Toque no microfone e fale: "${round.item.en}"</span>
        <span class="speak-note">É só uma brincadeira de praticar a fala — não avalia a pronúncia dele.</span>
      </div>`;
    speak(round.item.en);
    document.getElementById("mic-btn").addEventListener("click", () => startSpeakAttempt(round.item));
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
  speak(round.item.en);
}

function handleChoice(btn, opt, target, container) {
  if (choiceLocked) return;
  if (opt.id === target.id) {
    choiceLocked = true;
    btn.classList.add("correct");
    playCheer();
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
      speak(target.en);
      setTimeout(() => {
        quizIndex++;
        renderRound();
      }, 1400);
    }
  }
}

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
    const alts = Array.from(e.results[0]).map((r) => r.transcript.toLowerCase().trim());
    const target = item.en.toLowerCase();
    const matched = alts.some((a) => a.includes(target) || target.includes(a));
    micBtn.classList.remove("listening");
    recordResult(item.id, true);
    if (matched) {
      statusEl.textContent = "Arrasou! 🎉";
      playCheer();
    } else {
      statusEl.textContent = "Legal! Vamos ouvir de novo.";
      speak(item.en);
    }
    setTimeout(() => {
      quizIndex++;
      renderRound();
    }, 1400);
  };
  rec.onerror = () => {
    micBtn.classList.remove("listening");
    statusEl.textContent = "Sem problemas, vamos seguir!";
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
  showScreen("result");
  const pct = quizScore.total ? quizScore.correct / quizScore.total : 1;
  const starCount = pct >= 0.85 ? 3 : pct >= 0.5 ? 2 : 1;
  document.getElementById("result-stars").textContent = "⭐".repeat(starCount) + "☆".repeat(3 - starCount);
  document.getElementById("result-text").textContent = `Você brincou com ${quizQueue.length} palavras!`;
  renderHome();
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
    srsState = {};
    saveSRS();
    renderSettings();
    renderHome();
  }
});

function buildProgressSummary() {
  const lines = GROUPS.map((g) => {
    const total = g.words.length;
    const states = g.words.map((w) => getItemState(`${g.id}_${slug(w.en)}`));
    const introduced = states.filter((s) => s.introduced).length;
    const mastered = states.filter((s) => s.box >= 3).length;
    return `${g.icon} ${g.namePt}: ${mastered}/${total} dominadas (${introduced} vistas)`;
  });
  const struggling = ALL_ITEMS.map((it) => ({ it, st: getItemState(it.id) }))
    .filter((x) => x.st.introduced && x.st.wrongCount >= 2 && x.st.box <= 1)
    .sort((a, b) => b.st.wrongCount - a.st.wrongCount)
    .slice(0, 8)
    .map((x) => x.it.en);
  let text = lines.join("\n");
  if (struggling.length) text += `\n\nCom mais dificuldade: ${struggling.join(", ")}`;
  return text;
}

document.getElementById("btn-share-report").addEventListener("click", () => {
  const today = new Date().toLocaleDateString("pt-BR");
  const text = `📚 Relatório do Meu Inglês — ${today}\n\n${buildProgressSummary()}`;
  if (navigator.share) {
    navigator.share({ title: "Relatório - Meu Inglês", text }).catch(() => {});
  } else if (navigator.clipboard) {
    navigator.clipboard.writeText(text);
    alert("Relatório copiado! Cole onde quiser compartilhar.\n\n" + text);
  } else {
    alert(text);
  }
});

function renderSettings() {
  populateVoiceSelect();
  document.getElementById("rate-slider").value = speechRate;
  document.getElementById("progress-summary").textContent = buildProgressSummary();
}

// ===================== Service Worker (offline) =====================
if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("sw.js").catch(() => {});
  });
}

// ===================== Início =====================
renderHome();

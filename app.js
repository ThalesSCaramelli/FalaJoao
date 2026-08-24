// ===================== UI =====================
// Usa CONTENT/CATEGORY_META (data.js) e o motor de aprendizagem (engine.js). Não guarda estado próprio
// de progresso — só estado de navegação/tela.

function renderMedia(item) {
  if (item.image) return `<img class="word-photo" src="${item.image}" alt="${item.en}" />`;
  return item.emoji;
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
  Object.keys(CATEGORY_META).forEach((catId) => {
    const meta = CATEGORY_META[catId];
    const items = CONTENT.filter((it) => it.category === catId);
    const introducedCount = items.filter((it) => getState(it.id).introduced).length;
    const btn = document.createElement("button");
    btn.className = "cat-card";
    btn.style.background = meta.color;
    btn.innerHTML = `<span class="cat-icon">${meta.icon}</span><span>${meta.namePt}</span><span class="cat-progress">${introducedCount}/${items.length}</span>`;
    btn.addEventListener("click", () => openCategory(catId));
    grid.appendChild(btn);
  });
  const dueCount = getDueItems().length;
  document.getElementById("session-badge").textContent = dueCount > 0 ? `${dueCount} pra revisar` : "vamos começar!";
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
      speak(item.en);
      markIntroduced(item.id);
      renderHome();
    });
    wordGrid.appendChild(card);
  });
  showScreen("category");
}

document.getElementById("btn-play-quiz").addEventListener("click", () => {
  const items = CONTENT.filter((it) => it.category === currentCategoryId);
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
    learningState = {};
    saveLearningState();
    renderSettings();
    renderHome();
  }
});

function buildProgressSummary() {
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

// ===================== Service Worker (offline) =====================
if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("sw.js").catch(() => {});
  });
}

// ===================== Início =====================
renderHome();

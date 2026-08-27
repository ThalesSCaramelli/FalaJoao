// ===================== LEARNING ENGINE =====================
// Learning State: o que o app sabe sobre o progresso do aluno em cada item de conteúdo.
// Não confundir com Content (data.js, estático) nem com User State (futuro: perfil agregado).
// learningStage é DERIVADO daqui, não é salvo em nenhum lugar — é sempre uma função da caixa/estado atual.

const CONTENT_BY_ID = Object.fromEntries(CONTENT.map((it) => [it.id, it]));

// ===================== Perfis (João + André) =====================
// Lista fixa de propósito (só 2 pessoas usam o app hoje) — ver PROCESS.md pra decisão completa.
// `mode` decide como o motor escolhe roundType (pickRoundType, mais abaixo): "oral" é o
// comportamento original (intro/situation/speak/choice); "literacy" usa read/write.
const PROFILES = [
  { id: "joao", name: "João", emoji: "🐨", mode: "oral" },
  { id: "andre", name: "André", emoji: "🦘", mode: "literacy" },
];
const ACTIVE_PROFILE_KEY = "meuIngles_active_profile";
// As 6 chaves que existiam antes de perfis existirem — viram `<chave>::joao` na primeira carga
// depois desse update, pra não perder o progresso real do João (ver migrateToProfiles abaixo).
const LEGACY_KEYS = [
  "meuIngles_learning_v2",
  "meuIngles_streak_v1",
  "meuIngles_activity_v1",
  "meuIngles_avatar_v1",
  "meuIngles_voice",
  "meuIngles_rate",
];
function migrateToProfiles() {
  if (localStorage.getItem(ACTIVE_PROFILE_KEY)) return; // já migrado
  LEGACY_KEYS.forEach((key) => {
    const value = localStorage.getItem(key);
    if (value !== null) {
      localStorage.setItem(`${key}::joao`, value);
      localStorage.removeItem(key);
    }
  });
  localStorage.setItem(ACTIVE_PROFILE_KEY, "joao");
}
migrateToProfiles();
function getActiveProfileId() {
  return localStorage.getItem(ACTIVE_PROFILE_KEY) || "joao";
}
function setActiveProfileId(id) {
  localStorage.setItem(ACTIVE_PROFILE_KEY, id);
}
function getActiveProfile() {
  return PROFILES.find((p) => p.id === getActiveProfileId()) || PROFILES[0];
}
// Toda chave por-perfil passa por aqui — nunca usar `meuIngles_xxx` puro pra dado de aluno.
function profileKey(base) {
  return `${base}::${getActiveProfileId()}`;
}

const BOX_INTERVAL_DAYS = [0, 1, 3, 7, 21];

function loadLearningState() {
  try {
    return JSON.parse(localStorage.getItem(profileKey("meuIngles_learning_v2"))) || {};
  } catch (e) {
    return {};
  }
}
let learningState = loadLearningState();
function saveLearningState() {
  localStorage.setItem(profileKey("meuIngles_learning_v2"), JSON.stringify(learningState));
}

function getState(id) {
  return (
    learningState[id] || {
      box: 0,
      introduced: false,
      nextDue: 0,
      correctCount: 0,
      wrongCount: 0,
      correctStreak: 0,
      lastSeen: null,
      speech: { attemptCount: 0, matchedCount: 0, lastResult: null },
    }
  );
}

// learningStage: new -> learning -> consolidating -> mastered. Puramente derivado da caixa Leitner —
// não é um novo conceito de dado, é só um rótulo pedagógico mais honesto sobre o que já tínhamos.
function getLearningStage(id) {
  const st = getState(id);
  if (!st.introduced) return "new";
  if (st.box <= 1) return "learning";
  if (st.box <= 3) return "consolidating";
  return "mastered";
}

function markIntroduced(id) {
  const st = getState(id);
  if (!st.introduced) {
    st.introduced = true;
    st.nextDue = Date.now();
    st.lastSeen = Date.now();
    learningState[id] = st;
    saveLearningState();
    logActivity("seen");
  }
}

function recordResult(id, correct) {
  const st = getState(id);
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
  learningState[id] = st;
  saveLearningState();
  logActivity(correct ? "correct" : "wrong");
}

// ---- Integridade do speaking (correção do bug apontado: falar qualquer coisa não pode contar como acerto) ----
// matched: o reconhecimento de fala bateu com uma resposta aceita -> conta como recordResult(true).
// inconclusive: não bateu ou não reconheceu nada -> NÃO mexe na caixa. Não é erro, é "não sei dizer" —
// o reconhecimento de fala de criança pequena não é confiável o suficiente pra virar um "errado".
function recordSpeechAttempt(id, matched) {
  const st = getState(id);
  st.speech = st.speech || { attemptCount: 0, matchedCount: 0, lastResult: null };
  st.speech.attemptCount = (st.speech.attemptCount || 0) + 1;
  st.speech.lastResult = matched ? "matched" : "inconclusive";
  if (matched) st.speech.matchedCount = (st.speech.matchedCount || 0) + 1;
  learningState[id] = st;
  saveLearningState();
  if (matched) recordResult(id, true);
  else logActivity("speech"); // inconclusive não mexe na caixa (ver PROCESS.md), mas ainda é engajamento real
}

function matchesAcceptedAnswer(item, transcript) {
  const accepted = item.acceptedAnswers || [item.en.toLowerCase()];
  const t = transcript.toLowerCase().trim();
  return accepted.some((a) => t.includes(a) || a.includes(t));
}

function getDueItems() {
  const now = Date.now();
  return CONTENT.filter((it) => {
    const st = getState(it.id);
    return st.introduced && st.nextDue <= now;
  });
}

// Prioriza survival, depois por dificuldade (não existe mais "tier" como campo — isso é só uma
// heurística de ORDEM de introdução, reaproveitando category+difficulty que já existem).
function getNewCandidates(limit) {
  const notIntroduced = CONTENT.filter((it) => !getState(it.id).introduced);
  notIntroduced.sort((a, b) => {
    const aPriority = a.category === "survival" ? 0 : 1;
    const bPriority = b.category === "survival" ? 0 : 1;
    if (aPriority !== bPriority) return aPriority - bPriority;
    return a.difficulty - b.difficulty;
  });
  return notIntroduced.slice(0, limit);
}

function getDistractors(item, count) {
  const sameCategory = CONTENT.filter((it) => it.category === item.category && it.id !== item.id);
  const pool = sameCategory.length >= count ? sameCategory : CONTENT.filter((it) => it.id !== item.id);
  return shuffle(pool).slice(0, count);
}

// ===================== Telemetria local de adaptação =====================
// Log visível (console + tela de Configurações) pra comprovar que a decomposição por pré-requisito
// está realmente mudando a sessão, e não é só um "devia estar funcionando".
const ADAPTATION_LOG_KEY = "meuIngles_adaptationLog_v1";
let adaptationLog = (() => {
  try {
    return JSON.parse(sessionStorage.getItem(ADAPTATION_LOG_KEY)) || [];
  } catch (e) {
    return [];
  }
})();
function logAdaptation(entry) {
  const withTime = { ...entry, at: new Date().toLocaleString("pt-BR") };
  adaptationLog.unshift(withTime);
  if (adaptationLog.length > 30) adaptationLog.length = 30;
  try {
    sessionStorage.setItem(ADAPTATION_LOG_KEY, JSON.stringify(adaptationLog));
  } catch (e) {}
  console.info("[adaptação]", withTime);
}

// ===================== Sessão adaptativa (due + novo + decomposição por pré-requisito) =====================
const FAILURE_THRESHOLD = 2; // erros seguidos sem sair da caixa 0 -> considerar decompor
const MAX_SESSION = 14;

function needsDecomposition(item) {
  const st = getState(item.id);
  return (
    st.introduced &&
    st.box === 0 &&
    (st.wrongCount || 0) >= FAILURE_THRESHOLD &&
    item.prerequisites &&
    item.prerequisites.length > 0
  );
}

function buildSession() {
  const due = getDueItems().sort((a, b) => {
    const aPriority = a.category === "survival" ? 0 : 1;
    const bPriority = b.category === "survival" ? 0 : 1;
    if (aPriority !== bPriority) return aPriority - bPriority;
    return (getState(b.id).wrongCount || 0) - (getState(a.id).wrongCount || 0);
  });
  const dueSlice = due.slice(0, Math.max(0, MAX_SESSION - 3));
  const newNeeded = Math.min(4, MAX_SESSION - dueSlice.length);
  const newItems = getNewCandidates(Math.max(2, newNeeded));
  let session = [...dueSlice, ...newItems].slice(0, MAX_SESSION);

  if (session.length === 0) {
    const introduced = CONTENT.filter((it) => getState(it.id).introduced);
    session = shuffle(introduced).slice(0, 10);
  }

  // Decomposição: se um item da sessão está travado (falhou muito, não sai da caixa 0), troca ele
  // pelos pré-requisitos que ainda não estão consolidados, em vez de insistir na mesma frase difícil.
  const expanded = [];
  session.forEach((item) => {
    if (needsDecomposition(item)) {
      const prereqs = (item.prerequisites || [])
        .map((pid) => CONTENT_BY_ID[pid])
        .filter((p) => p && getLearningStage(p.id) !== "mastered");
      if (prereqs.length > 0) {
        logAdaptation({
          type: "decompose",
          item: item.id,
          itemEn: item.en,
          reason: `errou ${getState(item.id).wrongCount}x sem sair da caixa 0`,
          insertedPrerequisites: prereqs.map((p) => p.id),
        });
        prereqs.forEach((p) => expanded.push(p));
        return; // não inclui o item difícil nesta sessão — volta depois que os pré-requisitos evoluírem
      }
    }
    expanded.push(item);
  });

  const seen = new Set();
  const deduped = expanded.filter((it) => (seen.has(it.id) ? false : (seen.add(it.id), true)));

  return shuffle(deduped).map((it) => {
    const roundType = pickRoundType(it);
    const round = { item: it, roundType };
    if (roundType === "situation") round.scenario = SCENARIO_BY_CORRECT_ID[it.id];
    return round;
  });
}

function speechRecognitionAvailable() {
  return !!(window.SpeechRecognition || window.webkitSpeechRecognition);
}

// Cenário associado a um item, quando ele é a resposta "certa" de algum problem-posing
// (SCENARIOS em data.js). Um item pode ter no máximo um cenário como alvo principal.
const SCENARIO_BY_CORRECT_ID = Object.fromEntries((typeof SCENARIOS !== "undefined" ? SCENARIOS : []).map((s) => [s.correctId, s]));
function getScenarioForSituation(situationId) {
  return (typeof SCENARIOS !== "undefined" ? SCENARIOS : []).find((s) => s.situationId === situationId);
}

function pickRoundType(item) {
  const st = getState(item.id);
  if (getActiveProfile().mode === "literacy") {
    // Nunca "intro" pro André: "não introduzido nesse perfil" != "desconhecido pela criança" — ele
    // já fala inglês, mostrar a tela de "palavra nova" seria condescendente. Todo item novo já
    // entra direto como leitura ou escrita (e funciona como teste de nível: se ele acerta de cara,
    // o SRS avança normalmente, sem precisar de um conceito de diagnóstico separado).
    return Math.random() < 0.5 ? "read" : "write";
  }
  if (!st.introduced) return "intro";
  // já foi visto ao menos uma vez com sucesso -> às vezes vira um cenário de verdade em vez de
  // só reconhecer a imagem (problem-posing, LEARNING_PHILOSOPHY.md seção 2/5)
  if (st.box >= 1 && SCENARIO_BY_CORRECT_ID[item.id] && Math.random() < 0.4) return "situation";
  if (st.box >= 3 && speechRecognitionAvailable() && navigator.onLine && Math.random() < 0.3) return "speak";
  return "choice";
}

// ===================== Streak (dias seguidos de uso) =====================
function loadStreak() {
  try {
    return JSON.parse(localStorage.getItem(profileKey("meuIngles_streak_v1"))) || { count: 0, lastActiveDate: null };
  } catch (e) {
    return { count: 0, lastActiveDate: null };
  }
}
// Snapshot ANTES de qualquer touchStreak() nesta sessão — é o que responde "quando foi a última
// vez que abriu o app" de verdade. touchStreak() sempre marca o dia de hoje assim que a Home
// renderiza, então se a gente perguntasse a mesma coisa DEPOIS do touch, a resposta seria sempre
// "hoje" (mesmo quando é só alguém checando o relatório em Configurações, não o João praticando).
// `let`, não `const` — precisa ser recarregável ao trocar de perfil (reloadProfileState em app.js).
let streakAtLoad = loadStreak();
function todayStr() {
  return new Date().toISOString().slice(0, 10);
}
// Chamar uma vez quando o app abre. Não pune se o dia pular — só reseta pra 1, sem culpa/pressão.
function touchStreak() {
  const s = loadStreak();
  const today = todayStr();
  if (s.lastActiveDate === today) return s;
  const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
  s.count = s.lastActiveDate === yesterday ? s.count + 1 : 1;
  s.lastActiveDate = today;
  localStorage.setItem(profileKey("meuIngles_streak_v1"), JSON.stringify(s));
  return s;
}

// ===================== Atividade diária (engajamento — usado só pro relatório) =====================
// Guarda contagem por dia, não por evento (leve, não precisa de nenhum servidor). É o que dá pro
// relatório mostrar EVOLUÇÃO ao longo do tempo, não só a foto de hoje — igual a streak resolve
// "quantos dias seguidos" mas nada mais.
const ACTIVITY_LOG_MAX_DAYS = 60;
function loadActivityLog() {
  try {
    return JSON.parse(localStorage.getItem(profileKey("meuIngles_activity_v1"))) || {};
  } catch (e) {
    return {};
  }
}
// kind: "seen" (palavra nova introduzida) | "correct" | "wrong" | "speech" (tentativa de fala inconclusiva)
function logActivity(kind) {
  const log = loadActivityLog();
  const today = todayStr();
  const day = log[today] || { seen: 0, correct: 0, wrong: 0, speech: 0 };
  day[kind] = (day[kind] || 0) + 1;
  log[today] = day;
  const days = Object.keys(log).sort();
  while (days.length > ACTIVITY_LOG_MAX_DAYS) {
    delete log[days.shift()];
  }
  localStorage.setItem(profileKey("meuIngles_activity_v1"), JSON.stringify(log));
}

// ===================== Progresso por categoria (usado na jornada + desbloqueio do avatar) =====================
function getCategoryProgressRatio(categoryId) {
  const items = CONTENT.filter((it) => it.category === categoryId);
  if (!items.length) return 0;
  const progressed = items.filter((it) => ["consolidating", "mastered"].includes(getLearningStage(it.id))).length;
  return progressed / items.length;
}
const UNLOCK_THRESHOLD = 0.4; // 40% da categoria consolidada/dominada já libera o item de avatar ligado a ela
function isCategoryUnlockThresholdMet(categoryId) {
  if (!categoryId) return true; // itens sem categoria de desbloqueio ficam livres desde o início
  return getCategoryProgressRatio(categoryId) >= UNLOCK_THRESHOLD;
}

// ===================== Situações (My English World) =====================
function getSituationItems(situation) {
  return situation.categoryId ? CONTENT.filter((it) => it.category === situation.categoryId) : situation.itemIds.map((id) => CONTENT_BY_ID[id]).filter(Boolean);
}
function getSituationProgressRatio(situation) {
  const items = getSituationItems(situation);
  if (!items.length) return 0;
  const progressed = items.filter((it) => ["consolidating", "mastered"].includes(getLearningStage(it.id))).length;
  return progressed / items.length;
}

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

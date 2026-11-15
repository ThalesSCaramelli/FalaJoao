// ===================== LEARNING ENGINE =====================
// Learning State: o que o app sabe sobre o progresso do aluno em cada item de conteúdo.
// Não confundir com Content (data.js, estático) nem com User State (futuro: perfil agregado).
// learningStage é DERIVADO daqui, não é salvo em nenhum lugar — é sempre uma função da caixa/estado atual.

const CONTENT_BY_ID = Object.fromEntries(CONTENT.map((it) => [it.id, it]));

// ===================== Perfis (João + André + Thales) =====================
// Lista fixa de propósito (só 3 pessoas usam o app hoje) — ver PROCESS.md pra decisão completa.
// `mode` decide como o motor escolhe roundType (pickRoundType, mais abaixo): "oral" é o
// comportamento original (intro/situation/speak/choice); "literacy" usa read/write; "adult"
// mistura tudo (intro → situation/read/write/meaning/speak), com frases longas.
// `tracks` decide QUAL conteúdo o perfil enxerga (ver profileContent): "kids" é todo item sem
// campo `track` em data.js; "adult" e "spelling" só os itens marcados com esse `track`. O João
// nunca vê "Would it be possible to extend the deadline?", o adulto não vê "red"/"dog", e as
// palavras de ortografia por padrão de som (phonics) são só do André.
// `focusTrack`: trilha cujos itens novos entram primeiro (getNewCandidates) — pro André, a
// ortografia é o objetivo; o vocabulário infantil ele já sabe e só serve de revisão/teste.
const PROFILES = [
  { id: "joao", name: "João", emoji: "🐨", mode: "oral", tracks: ["kids"] },
  { id: "andre", name: "André", emoji: "🦘", mode: "literacy", tracks: ["kids", "spelling"], focusTrack: "spelling" },
  { id: "thales", name: "Thales", emoji: "🦜", mode: "adult", tracks: ["adult"] },
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

// ---- Trilha de conteúdo do perfil ativo ----
// Item sem `track` = "kids" (todo o conteúdo que já existia, sem precisar mexer nele).
// Sempre calculado na hora (não cacheado): o perfil pode trocar sem recarregar a página.
function itemTrack(obj) {
  return obj.track || "kids";
}
function profileContent() {
  const tracks = getActiveProfile().tracks;
  return CONTENT.filter((it) => tracks.includes(itemTrack(it)));
}
function profileSituations() {
  const tracks = getActiveProfile().tracks;
  return SITUATIONS.filter((s) => tracks.includes(itemTrack(s)));
}
// Só as categorias que têm algum item na trilha do perfil (mantém a ordem de CATEGORY_META).
function profileCategoryIds() {
  const used = new Set(profileContent().map((it) => it.category));
  return Object.keys(CATEGORY_META).filter((catId) => used.has(catId));
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
  if (!t) return false;
  // Trilha adulta: frase longa não pode bater com um pedaço solto ("i", "the deadline") — o
  // `a.includes(t)` generoso é de propósito pras crianças (communication before perfection:
  // "bathroom" já comunica), mas pro adulto a frase inteira é o objetivo. Exige ~70% do tamanho.
  if (itemTrack(item) === "adult") return accepted.some((a) => t.includes(a) || (a.includes(t) && t.length >= a.length * 0.7));
  return accepted.some((a) => t.includes(a) || a.includes(t));
}

function getDueItems() {
  const now = Date.now();
  return profileContent().filter((it) => {
    const st = getState(it.id);
    return st.introduced && st.nextDue <= now;
  });
}

// Prioriza a trilha de foco do perfil (se tiver), depois survival, depois por dificuldade (não
// existe mais "tier" como campo — isso é só uma heurística de ORDEM de introdução).
function getNewCandidates(limit) {
  const notIntroduced = profileContent().filter((it) => !getState(it.id).introduced);
  const focusTrack = getActiveProfile().focusTrack;
  const priority = (it) => (focusTrack && itemTrack(it) === focusTrack ? 0 : it.category === "survival" ? 1 : 2);
  notIntroduced.sort((a, b) => {
    const aPriority = priority(a);
    const bPriority = priority(b);
    if (aPriority !== bPriority) return aPriority - bPriority;
    return a.difficulty - b.difficulty;
  });
  return notIntroduced.slice(0, limit);
}

function getDistractors(item, count) {
  const sameCategory = CONTENT.filter((it) => it.category === item.category && it.id !== item.id);
  const pool = sameCategory.length >= count ? sameCategory : profileContent().filter((it) => it.id !== item.id);
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
    const introduced = profileContent().filter((it) => getState(it.id).introduced);
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

  return shuffle(deduped).map(makeRound);
}

function makeRound(it) {
  const roundType = pickRoundType(it);
  const round = { item: it, roundType };
  if (roundType === "situation") round.scenario = SCENARIO_BY_CORRECT_ID[it.id];
  return round;
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
    return pickLiteracyRoundType(item);
  }
  if (getActiveProfile().mode === "adult") return pickAdultRoundType(item, st);
  if (!st.introduced) return "intro";
  // já foi visto ao menos uma vez com sucesso -> às vezes vira um cenário de verdade em vez de
  // só reconhecer a imagem (problem-posing, LEARNING_PHILOSOPHY.md seção 2/5)
  if (st.box >= 1 && SCENARIO_BY_CORRECT_ID[item.id] && Math.random() < 0.4) return "situation";
  if (st.box >= 3 && speechRecognitionAvailable() && navigator.onLine && Math.random() < 0.3) return "speak";
  return "choice";
}

// André (tudo em inglês, foco em ESCREVER CERTO): o round principal é o ditado — ouve a palavra
// que ele já conhece de ouvido e escreve. É exatamente a lacuna dele ("school" → "scull": o som
// ele tem, a grafia não). "write" só quando o item tem cenário (a situação em inglês diz o que
// escrever); sem cenário, imagem sozinha é ambígua demais pra pedir escrita ("sunny" ou "summer"?)
// e a tradução em português saiu de propósito (imersão). Palavras da trilha de ortografia pesam
// mais pro ditado; "read" continua pra leitura (ler a palavra/frase e escolher a imagem/frase).
function pickLiteracyRoundType(item) {
  const options = itemTrack(item) === "spelling" ? ["dictation", "dictation", "read"] : ["dictation", "read"];
  if (SCENARIO_BY_CORRECT_ID[item.id]) options.push("write");
  return options[Math.floor(Math.random() * options.length)];
}

// Adulto: item novo passa pela tela de "palavra nova" (vocabulário complexo é novo de verdade, ao
// contrário do André). Depois, varia a atividade em cima do MESMO item (repetition without
// monotony, LEARNING_PHILOSOPHY.md seção 12): cenário (ouvir/ler + escolher), escrever a frase a
// partir do português, entender o sentido (inglês → escolher a tradução) e, mais pra frente, falar.
// Sem "choice" por imagem: pra "nevertheless" ou "I'd rather not commit to that yet" um emoji não
// carrega o significado — o round de sentido ("meaning") faz esse papel.
function pickAdultRoundType(item, st) {
  if (!st.introduced) return "intro";
  const options = ["meaning", "write"];
  if (SCENARIO_BY_CORRECT_ID[item.id]) options.push("situation", "read");
  if (st.box >= 2 && speechRecognitionAvailable() && navigator.onLine) options.push("speak");
  // Na caixa 0/1 (acabou de conhecer), reconhecer vem antes de produzir: tira a escrita.
  const pool = st.box <= 1 ? options.filter((t) => t !== "write") : options;
  return pool[Math.floor(Math.random() * pool.length)];
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

// ===================== Ortografia (André): onde errou + qual padrão de som ensinar =====================
// Alfabetização em inglês é por phonics: cada SOM tem algumas grafias possíveis (/oo/ = "oo" em
// school/moon; /k/ = "c", "k", "ck" e às vezes "ch"). "scull" pra "school" não é falta de ouvido —
// ele acertou os sons — é não saber QUAL grafia aquele som usa naquela palavra. Por isso o feedback
// aponta (1) quais letras dele estão certas/erradas e (2) a regra do pedaço que errou, com outras
// palavras do app que seguem a mesma regra. Tudo determinístico (LEARNING_PHILOSOPHY.md seção 39).

// Mesma normalização do round de escrita: sem caixa, pontuação nem apóstrofo (reto ou curvo).
function normalizeAnswer(s) {
  return s.toLowerCase().trim().replace(/[.,!?;:'’]/g, "").replace(/\s+/g, " ").trim();
}

// Alinhamento letra a letra (Levenshtein com caminho de volta). Devolve a lista de operações na
// ordem do texto: {op: "ok"|"sub"|"del"|"ins", t: letra do alvo, y: letra digitada, ti: índice no
// alvo}. "del" = letra do alvo que faltou; "ins" = letra a mais que ele digitou.
function alignSpelling(typed, target) {
  const n = typed.length, m = target.length;
  const d = Array.from({ length: n + 1 }, () => new Array(m + 1).fill(0));
  for (let i = 0; i <= n; i++) d[i][0] = i;
  for (let j = 0; j <= m; j++) d[0][j] = j;
  for (let i = 1; i <= n; i++) {
    for (let j = 1; j <= m; j++) {
      const cost = typed[i - 1] === target[j - 1] ? 0 : 1;
      d[i][j] = Math.min(d[i - 1][j] + 1, d[i][j - 1] + 1, d[i - 1][j - 1] + cost);
    }
  }
  const ops = [];
  let i = n, j = m;
  while (i > 0 || j > 0) {
    if (i > 0 && j > 0 && d[i][j] === d[i - 1][j - 1] + (typed[i - 1] === target[j - 1] ? 0 : 1)) {
      ops.unshift({ op: typed[i - 1] === target[j - 1] ? "ok" : "sub", y: typed[i - 1], t: target[j - 1], ti: j - 1 });
      i--; j--;
    } else if (j > 0 && d[i][j] === d[i][j - 1] + 1) {
      ops.unshift({ op: "del", t: target[j - 1], ti: j - 1 });
      j--;
    } else {
      ops.unshift({ op: "ins", y: typed[i - 1], ti: j }); // letra a mais: conta como erro perto de j
      i--;
    }
  }
  return { distance: d[n][m], ops };
}

// Entre as respostas aceitas, a mais parecida com o que ele digitou (é contra ela que o erro é
// mostrado — "can i have water please" e "can i have some water please" são ambas certas).
function closestAccepted(item, typedNorm) {
  const accepted = (item.acceptedAnswers && item.acceptedAnswers.length ? item.acceptedAnswers : [item.en]).map(normalizeAnswer);
  let best = accepted[0], bestDist = Infinity;
  accepted.forEach((a) => {
    const { distance } = alignSpelling(typedNorm, a);
    if (distance < bestDist) { best = a; bestDist = distance; }
  });
  return best;
}

// Padrões de grafia (phonics) — ordem importa: os mais longos primeiro ("igh" antes de "gh").
// `re` roda sobre a resposta normalizada; `tip` é em inglês (o André usa o app em imersão);
// `labelPt` é o nome do padrão no relatório dos pais (Configurações / compartilhar relatório).
const PHONICS_PATTERNS = [
  { id: "igh", labelPt: "'igh' (night)", re: /igh/g, tip: "'igh' says /eye/" },
  { id: "tion", labelPt: "'tion'", re: /tion/g, tip: "'tion' says /shun/" },
  { id: "magic_e", labelPt: "magic e (bike, cake)", re: /(?<![aeiou])[aeiou][^aeiou\s]e(?= |$)/g, except: ["one", "some", "come", "done", "have", "give", "love", "gone", "were", "there", "where"], tip: "Magic e: the 'e' at the end is silent and makes the vowel say its name" },
  { id: "ch_k", labelPt: "'ch' com som de /k/ (school)", re: /(?<=s)ch|ch(?=r)/g, tip: "Here 'ch' says /k/, like in school and Christmas" },
  { id: "ch", labelPt: "'ch'", re: /ch/g, tip: "'ch' usually says /ch/ (lunch) — but in some words it says /k/ (school)" },
  { id: "sh", labelPt: "'sh'", re: /sh/g, tip: "'sh' says /sh/ — two letters, one sound" },
  { id: "th", labelPt: "'th'", re: /th/g, tip: "'th' — put your tongue between your teeth" },
  { id: "ph", labelPt: "'ph' com som de /f/", re: /ph/g, tip: "'ph' says /f/" },
  { id: "wh", labelPt: "'wh'", re: /wh/g, tip: "'wh' says /w/" },
  { id: "ck", labelPt: "'ck'", re: /ck/g, tip: "'ck' says /k/ — it comes right after a short vowel" },
  { id: "silent", labelPt: "letra muda (kn, wr, mb)", re: /kn|wr|mb(?= |$)/g, tip: "There's a silent letter here — you write it but don't say it" },
  { id: "oo", labelPt: "'oo' (moon, school)", re: /oo/g, tip: "'oo' says /oo/" },
  { id: "ee", labelPt: "'ee' (tree)", re: /ee/g, tip: "'ee' says /ee/" },
  { id: "ea", labelPt: "'ea' (beach)", re: /ea/g, tip: "'ea' often says /ee/" },
  { id: "ai", labelPt: "'ai' (rain)", re: /ai/g, tip: "'ai' says /ay/ in the middle of a word" },
  { id: "ay", labelPt: "'ay' (day)", re: /ay/g, tip: "'ay' says /ay/ at the end of a word" },
  { id: "oa", labelPt: "'oa'", re: /oa/g, tip: "'oa' says /oh/" },
  { id: "ow", labelPt: "'ow' (snow, cow)", re: /ow/g, tip: "'ow' can say /oh/ (snow) or /ow/ (cow)" },
  { id: "ou", labelPt: "'ou' (house)", re: /ou/g, tip: "'ou' often says /ow/ (house)" },
  { id: "oi_oy", labelPt: "'oi' / 'oy'", re: /oi|oy/g, tip: "'oi' and 'oy' say /oy/" },
  { id: "ar", labelPt: "'ar' (park)", re: /ar/g, tip: "'ar' says /ar/ (car, park)" },
  { id: "or", labelPt: "'or' (storm)", re: /or/g, tip: "'or' says /or/ (fork, storm)" },
  { id: "er_ir_ur", labelPt: "'er' / 'ir' / 'ur' (girl, nurse)", re: /er|ir|ur/g, tip: "'er', 'ir' and 'ur' all say /er/ — you have to learn which one each word uses" },
  { id: "double", labelPt: "letra dobrada (ll, ss...)", re: /([bdfglmnprstz])\1/g, tip: "This word has a double letter" },
  { id: "y_end", labelPt: "'y' no final", re: /(?<=[^aeiou ])y(?= |$)/g, tip: "'y' at the end can say /ee/ (happy) or /eye/ (my)" },
];

// Palavras do app (da trilha do perfil) que usam o mesmo padrão — "like moon, food, pool". As da
// trilha de ortografia vêm primeiro (foram escolhidas justamente como exemplos limpos do padrão).
function phonicsExamples(pattern, excludeNorm) {
  const out = [];
  const pool = [...profileContent()].sort((a, b) => (itemTrack(b) === "spelling") - (itemTrack(a) === "spelling"));
  for (const it of pool) {
    if (it.contentType !== "word" || it.spellingTip) continue; // tricky words não são exemplo de regra
    const w = normalizeAnswer(it.en);
    if (w === excludeNorm || out.includes(w) || (pattern.except || []).includes(w)) continue;
    pattern.re.lastIndex = 0;
    if (pattern.re.test(w)) out.push(w);
    if (out.length >= 3) break;
  }
  pattern.re.lastIndex = 0;
  return out;
}

// Analisa uma tentativa errada: alinhamento, quais posições do alvo erraram, e quais padrões de
// grafia cobrem essas posições (no máximo 2 dicas — mais que isso vira texto demais pra criança).
function analyzeSpelling(item, typed) {
  const typedNorm = normalizeAnswer(typed);
  const target = closestAccepted(item, typedNorm);
  const { ops } = alignSpelling(typedNorm, target);
  const wrongIdx = new Set();
  ops.forEach((o) => {
    if (o.op === "sub" || o.op === "del") wrongIdx.add(o.ti);
    if (o.op === "ins") { wrongIdx.add(Math.max(0, o.ti - 1)); wrongIdx.add(Math.min(target.length - 1, o.ti)); }
  });
  const tips = [];
  const patternIds = [];
  const covered = new Set();
  PHONICS_PATTERNS.forEach((p) => {
    p.re.lastIndex = 0;
    let m;
    while ((m = p.re.exec(target)) !== null) {
      const start = m.index, end = m.index + m[0].length;
      let hit = false;
      for (let k = start; k < end; k++) if (wrongIdx.has(k) && !covered.has(k)) hit = true;
      if (hit && !patternIds.includes(p.id)) {
        for (let k = start; k < end; k++) covered.add(k);
        patternIds.push(p.id);
        tips.push({ pattern: p, range: [start, end], examples: phonicsExamples(p, target) });
      }
      if (m[0].length === 0) p.re.lastIndex++;
    }
    p.re.lastIndex = 0;
  });
  return { typedNorm, target, ops, wrongIdx, tips: tips.slice(0, 2), patternIds };
}

// Registro por perfil dos padrões em que ele erra — vai pro relatório dos pais ("pratique 'oo':
// school → scull"). Lido direto do localStorage quando precisa (sem variável em memória, então
// não precisa entrar em reloadProfileState).
function loadSpellingLog() {
  try {
    return JSON.parse(localStorage.getItem(profileKey("meuIngles_spelling_v1"))) || {};
  } catch (e) {
    return {};
  }
}
function logSpellingMistake(analysis, item) {
  const log = loadSpellingLog();
  const keys = analysis.patternIds.length ? analysis.patternIds : item.spellingTip ? ["tricky"] : ["other"];
  keys.forEach((k) => {
    const entry = log[k] || { count: 0, examples: [] };
    entry.count++;
    const example = `${analysis.target} → ${analysis.typedNorm}`;
    entry.examples = [example, ...entry.examples.filter((e) => e !== example)].slice(0, 3);
    log[k] = entry;
  });
  localStorage.setItem(profileKey("meuIngles_spelling_v1"), JSON.stringify(log));
}

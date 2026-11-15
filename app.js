// ===================== UI =====================
// Usa CONTENT/CATEGORY_META (data.js) e o motor de aprendizagem (engine.js). Não guarda estado próprio
// de progresso — só estado de navegação/tela.

// ===================== Emoji de conteúdo (Fluent 3D, PNG local) =====================
// Emoji de texto muda de aparelho pra aparelho; o PNG Fluent (assets/emoji, licença MIT) é igual em
// todos. EMOJI_ASSETS (data.js, gerado por scripts/fetch_fluent_emoji.py) lista as sequências que
// têm PNG; as outras caem no emoji de texto.
const EMOJI_PNG = new Set((typeof EMOJI_ASSETS !== "undefined" ? EMOJI_ASSETS : []).map(emojiKey));
// Sequência de emoji: bandeira (2 indicadores), keycap, ou pictograma + variação/tom de pele,
// encadeado por ZWJ.
const EMOJI_SEQ_RE = /\p{Regional_Indicator}{2}|[0-9#*]\uFE0F?\u20E3|\p{Extended_Pictographic}(?:\uFE0F|[\u{1F3FB}-\u{1F3FF}])*(?:\u200D\p{Extended_Pictographic}(?:\uFE0F|[\u{1F3FB}-\u{1F3FF}])*)*/gu;

// Codepoints em hex (sem FE0F) separados por "-": é o nome do arquivo em assets/emoji.
function emojiKey(seq) {
  return Array.from(seq).filter((c) => c !== "\uFE0F").map((c) => c.codePointAt(0).toString(16)).join("-");
}

// Troca cada emoji da string por <img class="emo"> (quando há PNG) ou deixa o texto. Texto que
// não é emoji passa direto.
function emojiHtml(str) {
  return String(str || "").replace(EMOJI_SEQ_RE, (seq) => {
    const key = emojiKey(seq);
    return EMOJI_PNG.has(key)
      ? `<img class="emo" src="assets/emoji/${key}.png" alt="${seq}" draggable="false" />`
      : seq;
  });
}

function renderMedia(item) {
  // Foto só quando existe e não está na lista PHOTO_SKIP (data.js) — e, se pulada, só se o emoji
  // tem PNG Fluent (senão a foto continua sendo melhor que um emoji de texto).
  if (item.image && !(PHOTO_SKIP.has(item.id) && emojiHtml(item.emoji).includes("<img"))) {
    return `<img class="word-photo" src="${item.image}" alt="${item.en}" />`;
  }
  return emojiHtml(item.emoji);
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
  // Fase 1 (acabamento): ícones que ainda eram emoji de cromo (cronômetro, ›, →, controle, livro...)
  clock: '<circle cx="12" cy="13" r="8" fill="none" stroke="currentColor" stroke-width="2.2"/><path d="M12 8.5V13l3 2M9.5 3h5" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/>',
  chevron: '<path d="M9 5l7 7-7 7" fill="none" stroke="currentColor" stroke-width="2.8" stroke-linecap="round" stroke-linejoin="round"/>',
  arrow: '<path d="M5 12h14M13 6l6 6-6 6" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/>',
  gamepad: '<path d="M7.5 6.5h9a5 5 0 014.9 4l.8 4.2a3 3 0 01-5.2 2.4L15 15.5H9l-2 1.6a3 3 0 01-5.2-2.4l.8-4.2a5 5 0 014.9-4z" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/><path d="M7.5 10v3M6 11.5h3" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><circle cx="16" cy="10.5" r="1.2" fill="currentColor"/><circle cx="18.5" cy="12.8" r="1.2" fill="currentColor"/>',
  book: '<path d="M12 6.5C10 5 7 4.5 4 5v13c3-.5 6 0 8 1.5 2-1.5 5-2 8-1.5V5c-3-.5-6 0-8 1.5zM12 6.5v13" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linejoin="round" stroke-linecap="round"/>',
  blocks: '<rect x="3" y="13" width="8" height="7" rx="1.5" fill="none" stroke="currentColor" stroke-width="2.2"/><rect x="13" y="13" width="8" height="7" rx="1.5" fill="none" stroke="currentColor" stroke-width="2.2"/><rect x="8" y="4" width="8" height="7" rx="1.5" fill="none" stroke="currentColor" stroke-width="2.2"/>',
  search: '<circle cx="10.5" cy="10.5" r="6.5" fill="none" stroke="currentColor" stroke-width="2.4"/><path d="M15.5 15.5L21 21" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round"/>',
  gap: '<path d="M8 8a4 4 0 118 0c0 2.6-4 3-4 6M12 17.4v.2" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round"/><path d="M4 21h4M10 21h4M16 21h4" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"/>',
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

// Barra de progresso do quiz com "3 / 8" (a rodada em andamento conta como atual).
function renderQuizProgress(index, total) {
  const current = Math.min(index + 1, total);
  const pct = total > 0 ? Math.round((index / total) * 100) : 0;
  return `<div class="quiz-bar" role="progressbar" aria-valuemin="0" aria-valuemax="${total}" aria-valuenow="${current}"><span class="quiz-bar-fill" style="width:${pct}%"></span></div><span class="quiz-count">${current} / ${total}</span>`;
}

// Troca o cromo de interface estático (voltar, engrenagem, som, play) pelos ícones SVG.
// Emoji temático/decorativo (🌏 no mundo, 🎯 na missão, carinhas de conteúdo) fica como está.
function initIcons() {
  const settingsBtn = document.getElementById("btn-settings");
  if (settingsBtn) {
    settingsBtn.innerHTML = icon("settings");
    settingsBtn.setAttribute("aria-label", "Área dos pais");
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
  // Banners da Home e cabeçalhos de Word Games / Dictionary: o "›" e os emoji de cromo viram SVG.
  document.querySelectorAll(".world-banner-head > span:last-child").forEach((el) => {
    el.innerHTML = icon("chevron", "banner-chevron");
  });
  const gamesIc = document.querySelector("#btn-games .ic");
  if (gamesIc) gamesIc.innerHTML = icon("gamepad");
  const dictIc = document.querySelector("#btn-dictionary .ic");
  if (dictIc) dictIc.innerHTML = icon("book");
  const gamesTitle = document.querySelector("#screen-games h2");
  if (gamesTitle) gamesTitle.innerHTML = icon("gamepad") + " Word Games";
  const dictTitle = document.querySelector("#screen-dictionary h2");
  if (dictTitle) dictTitle.innerHTML = icon("book") + " Dictionary";
}
initIcons();

// ===================== Mascote (quokka) e avatar (voxel customizável) — SVG original =====================
// Quokka de verdade (não um urso genérico): cabeça larga de bochechas cheias, orelhinhas redondas
// no alto, focinho claro com nariz escuro e o sorriso famoso, patinhas no peito segurando uma
// folha, pés grandes de canguruzinho e rabo grosso. Cores fixas dentro do desenho; a animação
// (piscar + orelha) fica no CSS (.quokka) e respeita prefers-reduced-motion.
function mascotSVG() {
  return `<svg class="quokka" viewBox="0 0 120 132" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Quokka">
    <ellipse cx="60" cy="124" rx="36" ry="6" fill="#3A2E27" opacity="0.12"/>
    <path d="M78 102 C94 114 111 110 112 91 C112 87 106 87 105.5 91 C104 101 94 103 84 96Z" fill="#9C6B47"/>
    <ellipse cx="41" cy="119" rx="15" ry="7" fill="#9C6B47"/>
    <ellipse cx="79" cy="119" rx="15" ry="7" fill="#9C6B47"/>
    <path d="M60 68 C82 68 90 84 88 100 C86 114 76 122 60 122 C44 122 34 114 32 100 C30 84 38 68 60 68Z" fill="#BE8A60"/>
    <ellipse cx="60" cy="102" rx="17" ry="17" fill="#F6E1C5"/>
    <g class="q-ear q-ear-l"><circle cx="31" cy="24" r="10.5" fill="#BE8A60"/><circle cx="32" cy="25" r="5.6" fill="#E3A189"/></g>
    <g class="q-ear q-ear-r"><circle cx="89" cy="24" r="10.5" fill="#BE8A60"/><circle cx="88" cy="25" r="5.6" fill="#E3A189"/></g>
    <path d="M60 11 C79 11 92 24 96 42 C102 66 85 81 60 81 C35 81 18 66 24 42 C28 24 41 11 60 11Z" fill="#BE8A60"/>
    <path d="M53 12.5 Q56 6 60 11 Q64 5 67 12.5Z" fill="#BE8A60"/>
    <path d="M60 47 C72 47 81 55 80 65 C79 74 71 78.5 60 78.5 C49 78.5 41 74 40 65 C39 55 48 47 60 47Z" fill="#F6E1C5"/>
    <ellipse cx="32" cy="59" rx="6" ry="4" fill="#F0907C" opacity="0.5"/>
    <ellipse cx="88" cy="59" rx="6" ry="4" fill="#F0907C" opacity="0.5"/>
    <g class="q-eye"><circle cx="42.5" cy="42.5" r="4.6" fill="#3A2E27"/><circle cx="44.2" cy="40.8" r="1.7" fill="#fff"/></g>
    <g class="q-eye"><circle cx="77.5" cy="42.5" r="4.6" fill="#3A2E27"/><circle cx="79.2" cy="40.8" r="1.7" fill="#fff"/></g>
    <path d="M52.5 51.5 Q60 47 67.5 51.5 Q68 58 60 60.5 Q52 58 52.5 51.5Z" fill="#3A2E27"/>
    <ellipse cx="57.5" cy="52.5" rx="2.4" ry="1.2" fill="#fff" opacity="0.55"/>
    <path d="M60 60.5 V64 M45 61.5 Q52 73.5 60 64 Q68 73.5 75 61.5" fill="none" stroke="#3A2E27" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/>
    <path d="M60 104 C50 98 50 86 60 80 C70 86 70 98 60 104Z" fill="#6FBF73"/>
    <path d="M60 83 V101" stroke="#4E9A58" stroke-width="1.6" stroke-linecap="round"/>
    <ellipse cx="47" cy="95" rx="6.5" ry="9" transform="rotate(-38 47 95)" fill="#9C6B47"/>
    <ellipse cx="73" cy="95" rx="6.5" ry="9" transform="rotate(38 73 95)" fill="#9C6B47"/>
  </svg>`;
}

function loadAvatarState() {
  try {
    return JSON.parse(localStorage.getItem(profileKey("meuIngles_avatar_v1"))) || { shirt: "coral", hat: "none", backpack: "none" };
  } catch (e) {
    return { shirt: "coral", hat: "none", backpack: "none" };
  }
}
let avatarState = loadAvatarState();
function saveAvatarState() {
  localStorage.setItem(profileKey("meuIngles_avatar_v1"), JSON.stringify(avatarState));
}

// ---- Kit voxel: cada peça do avatar (e cada item colecionável) é um bloquinho com 3 faces ----
// Mistura duas cores hex (t = 0..1) — dá a face clara (topo) e a escura (lado) a partir da cor do item.
function mixHex(hex, target, t) {
  const a = parseInt(hex.slice(1), 16), b = parseInt(target.slice(1), 16);
  const ch = (sh) => Math.round(((a >> sh) & 255) * (1 - t) + ((b >> sh) & 255) * t);
  return "#" + ((1 << 24) | (ch(16) << 16) | (ch(8) << 8) | ch(0)).toString(16).slice(1);
}
const voxLight = (c, t) => mixHex(c, "#FFFFFF", t == null ? 0.3 : t);
const voxDark = (c, t) => mixHex(c, "#3A2E27", t == null ? 0.24 : t);
// Um bloco em projeção oblíqua: frente (cor cheia), topo (mais claro) e lado direito (mais escuro).
// (x, y, w, h) = face da frente; (dx, dy) = profundidade. Cantos levemente arredondados pelo stroke.
function voxBox(x, y, w, h, color, dx, dy) {
  dx = dx == null ? 8 : dx;
  dy = dy == null ? 6 : dy;
  const top = voxLight(color), side = voxDark(color);
  const j = 'stroke-width="1.6" stroke-linejoin="round"';
  return (
    `<polygon points="${x + w},${y} ${x + w + dx},${y - dy} ${x + w + dx},${y + h - dy} ${x + w},${y + h}" fill="${side}" stroke="${side}" ${j}/>` +
    `<polygon points="${x},${y} ${x + dx},${y - dy} ${x + w + dx},${y - dy} ${x + w},${y}" fill="${top}" stroke="${top}" ${j}/>` +
    `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="1.2" fill="${color}" stroke="${color}" ${j}/>`
  );
}

function svgHat(item) {
  if (!item || !item.type) return "";
  const c = item.color;
  // boné: copa em cima do cabelo + aba pra frente
  if (item.type === "cap") {
    return voxBox(25, 16, 66, 14, c, 11, 8) + voxBox(21, 30, 62, 5, voxDark(c, 0.16), 5, 3.5) +
      voxBox(55, 13.5, 8, 3, voxLight(c, 0.45), 4, 3);
  }
  // chapéu de festa: pirâmide em degraus (voxel) com pompom
  if (item.type === "party") {
    const alt = voxLight(c, 0.62);
    return voxBox(40, 10, 36, 13, c, 7, 5) + voxBox(46, 0, 24, 10, alt, 6, 4.5) +
      voxBox(52, -8, 12, 8, c, 5, 3.5) + voxBox(55.5, -13, 5.5, 5, "#FFFFFF", 3, 2.2);
  }
  return "";
}
function svgBackpack(item) {
  if (!item || !item.color) return "";
  // mochila grandona atrás do corpo: sobra dos dois lados (as alças entram depois, por cima da camiseta)
  return `<rect x="24" y="86" width="8" height="25" rx="2" fill="${voxDark(item.color, 0.12)}"/>` + voxBox(44, 80, 53, 32, item.color, 8, 6);
}
function svgBackpackStraps(item) {
  if (!item || !item.color) return "";
  const c = voxDark(item.color, 0.1);
  return `<rect x="45" y="85" width="5.5" height="27" fill="${c}"/><rect x="68" y="85" width="5.5" height="27" fill="${c}"/>` +
    `<rect x="50.5" y="96" width="17.5" height="3" fill="${c}"/><rect x="56.5" y="95" width="5" height="5" rx="1" fill="${voxLight(item.color, 0.55)}"/>`;
}

// Avatar voxel "chibi": cabeção em bloco com volume (3 faces), olhos com brilho, bochechas,
// corpinho pequeno e sombra no chão. Mesmo `state` de sempre ({ shirt, hat, backpack }), viewBox
// fixo (o chapéu não faz o boneco pular de lugar) — funciona de 44px (mapa) a 150px (tela do avatar).
// Idle (respirar + piscar) é CSS: .av-bob / .av-eye / .av-shadow.
function avatarSVG(state) {
  const find = (cat) => AVATAR_ITEMS[cat].find((i) => i.id === state[cat]) || AVATAR_ITEMS[cat][0];
  const shirt = find("shirt"), hat = find("hat"), backpack = find("backpack");
  const SKIN = "#F8CFA6", HAIR = "#7A4A2B", PANTS = "#51609A", SHOE = "#2F3857", INK = "#3A2E27";
  const sc = shirt.color;
  const eye = (x) =>
    `<g class="av-eye"><rect x="${x}" y="52" width="8.5" height="11" rx="2.6" fill="${INK}"/>` +
    `<rect x="${x + 4.6}" y="53.6" width="2.7" height="3.4" rx="0.9" fill="#fff"/>` +
    `<rect x="${x + 1.5}" y="59" width="1.6" height="1.6" rx="0.5" fill="#fff" opacity="0.7"/></g>`;
  return `<svg class="voxel-avatar" viewBox="0 0 124 168" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Avatar">
    <ellipse class="av-shadow" cx="63" cy="158" rx="33" ry="7" fill="${INK}" opacity="0.16"/>
    <g transform="translate(0 20)">
      ${voxBox(44, 114, 13, 15, PANTS, 5, 3.8)}${voxBox(61, 114, 13, 15, PANTS, 5, 3.8)}
      ${voxBox(43, 128, 15, 8, SHOE, 5, 3.8)}${voxBox(60, 128, 15, 8, SHOE, 5, 3.8)}
      <g class="av-bob">
        ${svgBackpack(backpack)}
        ${voxBox(29, 88, 11, 12, sc, 6, 4.5)}${voxBox(29, 100, 11, 11, SKIN, 6, 4.5)}
        ${voxBox(40, 84, 38, 32, sc)}
        <rect x="40" y="111.5" width="38" height="4.5" fill="${voxDark(sc, 0.14)}"/>
        ${svgBackpackStraps(backpack)}
        ${voxBox(78, 100, 11, 11, SKIN, 6, 4.5)}${voxBox(78, 88, 11, 12, sc, 6, 4.5)}
        ${voxBox(27, 30, 62, 54, SKIN, 10, 7.5)}
        ${voxBox(27, 24, 62, 27, HAIR, 10, 7.5)}
        <path d="M33 51.8 V39 H54 V36 H83 V51.8Z" fill="${SKIN}"/>
        ${eye(41.5)}${eye(66)}
        <rect x="33" y="65.5" width="8.5" height="5" rx="2.5" fill="#FF8F80" opacity="0.75"/>
        <rect x="74.5" y="65.5" width="8.5" height="5" rx="2.5" fill="#FF8F80" opacity="0.75"/>
        <path d="M52 67.5 h12 a6 6 0 0 1 -12 0z" fill="#7A2E2A"/>
        <ellipse cx="58" cy="72" rx="3.2" ry="1.5" fill="#F58A84"/>
        ${svgHat(hat)}
      </g>
    </g>
  </svg>`;
}

// Desenho de cada item de avatar (cartão do seletor + celebração): o item em si, em voxel, na cor
// dele — não um emoji genérico. "Sem item" (hat:none / backpack:none) vira um vazio discreto.
function avatarItemIcon(cat, item) {
  const wrap = (inner) => `<svg class="item-art" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">${inner}</svg>`;
  const c = item && item.color;
  if (cat === "shirt") {
    return wrap(
      voxBox(4, 14, 10, 11, c, 4, 3) + voxBox(14, 13, 20, 26, c, 5, 3.8) + voxBox(34, 14, 9, 11, c, 4, 3) +
      `<rect x="19.5" y="12.5" width="9" height="3.5" rx="1" fill="${voxDark(c, 0.2)}"/><rect x="14" y="35.5" width="20" height="3.5" fill="${voxDark(c, 0.14)}"/>`
    );
  }
  if (cat === "hat" && item.type === "cap") {
    return wrap(voxBox(10, 15, 25, 14, c, 7, 5) + voxBox(5, 29, 27, 4.5, voxDark(c, 0.16), 4, 2.8) + voxBox(21, 13, 4, 2, voxLight(c, 0.45), 2.5, 1.8));
  }
  if (cat === "hat" && item.type === "party") {
    return wrap(voxBox(9, 29, 26, 11, c, 5, 3.8) + voxBox(14, 19, 16, 10, voxLight(c, 0.62), 4.5, 3.4) +
      voxBox(18, 11, 8, 8, c, 4, 3) + voxBox(20, 5.5, 4, 4, "#FFFFFF", 2.5, 1.9));
  }
  if (cat === "backpack" && c) {
    return wrap(
      `<path d="M18 11 v-3.5 a3 3 0 0 1 3 -3 h6 a3 3 0 0 1 3 3 V11" fill="none" stroke="${voxDark(c, 0.3)}" stroke-width="2.6" stroke-linecap="round"/>` +
      voxBox(10, 12, 25, 28, c, 6, 4.5) +
      `<rect x="10" y="12" width="25" height="9.5" rx="1.2" fill="${voxLight(c, 0.22)}"/>` +
      `<rect x="14" y="26.5" width="17" height="9.5" rx="2" fill="${voxDark(c, 0.16)}"/>` +
      `<rect x="20.5" y="19" width="4" height="5" rx="1" fill="${voxLight(c, 0.6)}"/>`
    );
  }
  // "sem item": contorno tracejado com um traço — lê como "nada", sem ícone confuso
  return wrap('<circle cx="24" cy="24" r="13" fill="none" stroke="currentColor" stroke-width="2.6" stroke-dasharray="4.5 4.5" stroke-linecap="round" opacity="0.55"/><path d="M16 32 L32 16" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" opacity="0.55"/>');
}
function renderAllAvatarMounts() {
  ["avatar-hero-mount", "home-avatar-mount"].forEach((id) => {
    const el = document.getElementById(id);
    if (el) el.innerHTML = avatarSVG(avatarState);
  });
}

// Só os itens que o perfil ativo consegue desbloquear: um item ligado a uma categoria de outra
// trilha (ex. "spell_oo", do André) ficaria trancado pra sempre na tela do João.
function avatarItemVisible(item) {
  return !item.unlockedBy || profileCategoryIds().includes(item.unlockedBy);
}

// Cartão colecionável de um item: o desenho do item sobre um fundo tingido com a cor dele
// (--item-color; "sem item" não tem cor e fica neutro). Usado no seletor e na celebração.
function avatarItemCardHTML(cat, item, opts) {
  opts = opts || {};
  return avatarItemIcon(cat, item) +
    (opts.locked ? `<span class="lock-badge">${icon("lock")}</span>` : "") +
    (opts.selected ? `<span class="check-badge">${icon("check")}</span>` : "");
}

function renderAvatarScreen() {
  let totalUnlocked = 0, totalItems = 0;
  const catLabels = { shirt: "Camiseta", hat: "Chapéu", backpack: "Mochila" };
  Object.keys(AVATAR_ITEMS).forEach((cat) => {
    const row = document.getElementById("row-" + cat);
    row.innerHTML = "";
    let catUnlocked = 0, catTotal = 0;
    AVATAR_ITEMS[cat].filter(avatarItemVisible).forEach((item) => {
      totalItems++;
      catTotal++;
      const unlocked = isCategoryUnlockThresholdMet(item.unlockedBy);
      if (unlocked) { totalUnlocked++; catUnlocked++; }
      const selected = avatarState[cat] === item.id;
      const btn = document.createElement("button");
      btn.className = "item-swatch" + (unlocked ? "" : " locked") + (selected ? " selected" : "") + (item.color ? "" : " is-none");
      if (item.color) btn.style.setProperty("--item-color", item.color);
      btn.setAttribute("aria-label", `${catLabels[cat] || cat}: ${item.id}${unlocked ? "" : " (trancado)"}`);
      btn.setAttribute("aria-pressed", selected ? "true" : "false");
      btn.innerHTML = avatarItemCardHTML(cat, item, { locked: !unlocked, selected });
      btn.addEventListener("click", () => {
        const hintEl = document.getElementById("avatar-unlock-hint");
        if (!unlocked) {
          const catMeta = CATEGORY_META[item.unlockedBy];
          const catName = catMeta ? displayName(catMeta) : item.unlockedBy;
          hintEl.textContent = tr(`Keep practising "${catName}" to unlock it!`, `Continue praticando "${catName}" pra desbloquear!`);
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
    const countEl = document.getElementById("count-" + cat);
    if (countEl) countEl.textContent = `${catUnlocked}/${catTotal}`;
  });
  document.getElementById("avatar-unlocked-count").textContent = `${totalUnlocked}/${totalItems} itens desbloqueados`;
}

document.getElementById("btn-avatar-hero").addEventListener("click", () => {
  renderAvatarScreen();
  showScreen("avatar");
});

// ===================== My English World (mapa de situações + explorar por categoria) =====================
// Trilha do mapa: liga os lugares do perfil ativo por uma árvore geradora mínima (os caminhos mais
// curtos, sem cruzar) — funciona pra qualquer conjunto de `mapPos`, sem desenhar rota à mão por
// perfil. Só decoração: não tem ordem nem bloqueio (todo lugar continua tocável a qualquer hora).
// Coordenadas em % (viewBox 0..100, esticado pro tamanho do mapa; o traço não escala).
function worldTrailPath(situations) {
  const pts = situations.map((s) => ({ x: parseFloat(s.mapPos.left), y: parseFloat(s.mapPos.top) }));
  if (pts.length < 2) return "";
  // o mapa é mais alto que largo (3:5): distância medida na proporção real, não em % cru
  const dist = (p, q) => Math.hypot((p.x - q.x) * 3, (p.y - q.y) * 5);
  const inTree = [0];
  const rest = pts.map((_, i) => i).slice(1);
  let d = "";
  let k = 0;
  while (rest.length) {
    let best = null;
    inTree.forEach((i) => rest.forEach((j) => {
      const dd = dist(pts[i], pts[j]);
      if (!best || dd < best.dd) best = { i, j, dd };
    }));
    const p = pts[best.i], q = pts[best.j];
    // curva leve (alternando o lado) pra trilha parecer desenhada à mão, não uma régua
    const bend = (k++ % 2 ? 1 : -1) * 0.12;
    const cx = (p.x + q.x) / 2 - (q.y - p.y) * bend, cy = (p.y + q.y) / 2 + (q.x - p.x) * bend * 0.36;
    d += `M${p.x} ${p.y} Q${cx.toFixed(1)} ${cy.toFixed(1)} ${q.x} ${q.y} `;
    inTree.push(best.j);
    rest.splice(rest.indexOf(best.j), 1);
  }
  return d;
}

function renderWorldMap() {
  const pinsWrap = document.getElementById("world-pins");
  pinsWrap.innerHTML = "";
  renderCategoryGrid();
  const situations = profileSituations();
  const trailEl = document.getElementById("world-trail-path");
  if (trailEl) trailEl.setAttribute("d", worldTrailPath(situations));
  situations.forEach((situation) => {
    const ratio = getSituationProgressRatio(situation);
    const done = ratio >= UNLOCK_THRESHOLD;
    // Nó de aventura em 3 estados: novo (anel vazio), em andamento (anel enchendo até o limiar de
    // desbloqueio) e conquistado (anel dourado + estrela). O ícone é só o conteúdo do .pin-badge.
    const pin = document.createElement("button");
    pin.className = "pin " + (done ? "is-done" : ratio > 0 ? "is-progress" : "is-new");
    pin.style.top = situation.mapPos.top;
    pin.style.left = situation.mapPos.left;
    pin.style.setProperty("--pin-progress", Math.round(Math.min(1, ratio / UNLOCK_THRESHOLD) * 100) + "%");
    pin.innerHTML = `<div class="pin-badge">${emojiHtml(situation.icon)}${done ? `<div class="ring">${icon("star")}</div>` : ""}</div><div class="label">${displayName(situation)}</div>`;
    pin.addEventListener("click", () => goToSituation(situation));
    pinsWrap.appendChild(pin);
  });
  // O avatar sempre começa "em pé" num lugar do perfil ativo (o primeiro, se ainda não visitou
  // nenhum ou se o perfil mudou) — nunca solto no meio do mapa, por cima de um nó de outro perfil.
  const avatarEl = document.getElementById("world-avatar");
  avatarEl.innerHTML = avatarSVG(avatarState);
  const here = (s) => s.mapPos.top === avatarEl.style.top && s.mapPos.left === avatarEl.style.left;
  if (situations.length && !situations.some(here)) {
    avatarEl.style.top = situations[0].mapPos.top;
    avatarEl.style.left = situations[0].mapPos.left;
  }
  const hintEl = document.querySelector("#screen-world .world-hint");
  if (hintEl) {
    const anyIntroduced = profileContent().some((it) => getState(it.id).introduced);
    hintEl.textContent = anyIntroduced
      ? tr("Tap a place to go and play there!", "Toque num lugar pra ir e jogar lá!")
      : tr("Your adventure starts here — tap a place!", "Sua aventura começa aqui — toque num lugar!");
  }
}

function goToSituation(situation) {
  // André (imersão) ouve o nome do lugar em inglês; os outros, em português.
  if (isImmersion() && situation.nameEn) speak(situation.nameEn, `place_${situation.id}`);
  else speakPT(situation.namePt, situation.id);
  const avatarEl = document.getElementById("world-avatar");
  avatarEl.style.top = situation.mapPos.top;
  avatarEl.style.left = situation.mapPos.left;
  avatarEl.classList.add("walking");
  setTimeout(() => {
    avatarEl.classList.remove("walking");
    startSituationQuiz(situation, "world");
  }, 900);
}

// Monta e começa a visita a um lugar (o mesmo sorteio de sempre). Separado do goToSituation pra
// lista de situações da Home do adulto abrir o lugar direto, sem a caminhada do avatar no mapa.
function startSituationQuiz(situation, returnTo) {
  const items = getSituationItems(situation);
  // Adulto/André: usa o mesmo sorteio de atividade da sessão (pickRoundType, engine.js) — "choice"
  // por imagem não carrega o sentido de uma frase longa, e "intro" seria condescendente pro André.
  const queue = shuffle(items)
    .slice(0, 7)
    .map((it) => (getActiveProfile().mode !== "oral" ? makeRound(it) : { item: it, roundType: getState(it.id).introduced ? "choice" : "intro" }));
  // se esse lugar tem um cenário de problem-posing, ele abre a visita — o resto do vocabulário
  // do lugar vem depois, como prática complementar.
  const scenario = getScenarioForSituation(situation.id);
  // André: o cenário de abertura vira escrita (o foco dele), não o round "situation" de ouvir.
  if (scenario) {
    queue.unshift({ item: CONTENT_BY_ID[scenario.correctId], roundType: isImmersion() ? "write" : "situation", scenario });
  }
  quizReturnScreen = returnTo;
  startQuiz(queue);
}

document.getElementById("btn-world-banner").addEventListener("click", () => {
  renderWorldMap();
  showScreen("world");
});

// ===================== Voz (TTS) =====================
let voices = [];
let chosenVoiceURI = localStorage.getItem(profileKey("meuIngles_voice")) || null;
let speechRate = parseFloat(localStorage.getItem(profileKey("meuIngles_rate")) || "0.85");

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
  if (!enVoices.length) {
    sel.innerHTML = `<option value="">Voz padrão do aparelho</option>`;
    sel.disabled = true;
    return;
  }
  sel.disabled = false;
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
// Vibração leve junto com o som (só onde existe navigator.vibrate): acerto = toque curto,
// erro = toque curtíssimo e suave (sem punição — "errar faz parte do jogo").
function haptic(kind) {
  try {
    if (navigator.vibrate) navigator.vibrate(kind === "ok" ? [18, 40, 18] : 25);
  } catch (e) {}
}
function playCheer() {
  haptic("ok");
  playTone(523.25, 0.15, 0);
  playTone(659.25, 0.15, 0.12);
  playTone(783.99, 0.25, 0.24);
}
function playGentle() {
  haptic("err");
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
  // A entrada suave (fade + slide curto) é uma animação CSS em .screen.active: ao trocar o display
  // de none para flex ela reinicia sozinha; prefers-reduced-motion desliga no CSS.
  screens.forEach((s) => s.classList.toggle("active", s.id === "screen-" + id));
  const target = document.getElementById("screen-" + id);
  if (target) target.scrollTop = 0;
}
document.querySelectorAll("[data-back]").forEach((btn) => {
  btn.addEventListener("click", () => showScreen(btn.dataset.back));
});
// A engrenagem passa pelo portão dos pais (openParentGate) antes de abrir a Área dos pais.
document.getElementById("btn-settings").addEventListener("click", () => openParentGate());

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
  } else if (quizReturnScreen === "games") {
    renderHome();
    showScreen("games");
  } else {
    renderHome();
    showScreen("home");
  }
}
document.getElementById("btn-quiz-back").addEventListener("click", goToQuizReturnScreen);
document.getElementById("btn-result-back").addEventListener("click", goToQuizReturnScreen);

// ===================== Home =====================
// Uma Home por perfil (redesign onda 2, fase 2). A estrutura do index.html é a mesma; cada bloco
// diz em `data-modes` onde aparece e o tema (tokens em body[data-mode]) dá a cara de cada um:
// João = aventura colorida, André = arcade em inglês, Thales = app de produtividade sóbrio.
// Ícones de interface que só a Home usa (somados ao ICONS sem mexer na lista principal).
Object.assign(ICONS, {
  flame: '<path d="M12.5 1.5c1 4.2 7 6.4 7 13.2a7.5 7.5 0 01-15 0c0-3.6 1.9-5.9 3.8-7.6.1 2.5 1.2 4.1 2.7 4.6-.8-3.9-.1-7.3 1.5-10.2z" fill="currentColor"/><path d="M12 13.2c.4 1.9 3 2.8 3 5.4a3 3 0 01-6 0c0-1.9 1.4-3.3 3-5.4z" fill="#fff" opacity=".45"/>',
  gift: '<rect x="3.5" y="9" width="17" height="11.5" rx="2" fill="none" stroke="currentColor" stroke-width="2.2"/><path d="M2.5 9h19M12 9v11.5M12 9c-2-4-6.5-4.2-6.5-1.6C5.5 9 9 9 12 9zm0 0c2-4 6.5-4.2 6.5-1.6C18.5 9 15 9 12 9z" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linejoin="round"/>',
  map: '<path d="M3.5 6.5l5.5-2.5 6 2.5 5.5-2.5v13.5l-5.5 2.5-6-2.5-5.5 2.5V6.5zM9 4v13.5M15 6.5V20" fill="none" stroke="currentColor" stroke-width="2.1" stroke-linejoin="round"/>',
});

// Saudação por hora do dia (só o adulto; criança recebe um "Oi" simples). Sem emoji.
function homeGreeting(mode) {
  if (mode === "oral") return "Oi,";
  if (mode === "literacy") return "Hey,";
  const h = new Date().getHours();
  return h < 12 ? "Bom dia," : h < 18 ? "Boa tarde," : "Boa noite,";
}

// Próximo item do avatar a destravar: entre os trancados do perfil, o que falta MENOS pra chegar
// no limiar (UNLOCK_THRESHOLD, a mesma regra de isCategoryUnlockThresholdMet — só leitura).
// Responde "o que eu ganho se praticar X, e quanto falta" em vez de "3/13 itens".
function nextAvatarUnlock() {
  let best = null;
  Object.keys(AVATAR_ITEMS).forEach((cat) => {
    AVATAR_ITEMS[cat].filter(avatarItemVisible).forEach((item) => {
      if (isCategoryUnlockThresholdMet(item.unlockedBy)) return;
      const items = CONTENT.filter((it) => it.category === item.unlockedBy);
      const progressed = items.filter((it) => ["consolidating", "mastered"].includes(getLearningStage(it.id))).length;
      // -1e-9: 0.4 * 15 dá 6.000000000000001 em ponto flutuante
      const needed = Math.max(1, Math.ceil(UNLOCK_THRESHOLD * items.length - 1e-9));
      const left = Math.max(1, needed - progressed);
      if (!best || left < best.left || (left === best.left && progressed > best.progressed)) {
        best = { cat, item, catId: item.unlockedBy, progressed, needed, left };
      }
    });
  });
  return best;
}

function renderAvatarNext() {
  const el = document.getElementById("avatar-next");
  if (!el) return;
  const next = nextAvatarUnlock();
  if (!next) {
    el.innerHTML = `<span class="an-eyebrow">${icon("star")} ${tr("Collection complete!", "Coleção completa!")}</span>
      <span class="an-txt"><b>${tr("You unlocked every item", "Você ganhou todos os itens")}</b><small>${tr("Tap to dress up your avatar", "Toque pra vestir seu avatar")}</small></span>`;
    return;
  }
  const meta = CATEGORY_META[next.catId];
  const pct = Math.round((next.progressed / next.needed) * 100);
  const color = next.item.color ? ` style="--item-color:${next.item.color}"` : "";
  el.innerHTML = `<span class="an-eyebrow">${icon("gift")} ${tr("Next reward", "Próximo prêmio")}</span>
    <span class="an-row">
      <span class="an-item${next.item.color ? "" : " is-none"}"${color}>${avatarItemIcon(next.cat, next.item)}</span>
      <span class="an-txt"><b>${meta ? emojiHtml(meta.icon) + " " + displayName(meta) : ""}</b>
        <small>${next.left === 1 ? tr("1 more to unlock!", "Falta só 1!") : tr(`${next.left} more to unlock`, `Faltam ${next.left} pra ganhar`)}</small></span>
    </span>
    <span class="an-bar" role="progressbar" aria-valuemin="0" aria-valuemax="${next.needed}" aria-valuenow="${next.progressed}"><span style="width:${Math.max(6, pct)}%"></span></span>`;
}

// Últimos 7 dias do log de atividade (loadActivityLog, engine.js) — total de interações por dia.
function homeWeekDays() {
  const log = loadActivityLog();
  return lastNDays(7).map((date) => {
    const d = log[date] || {};
    const total = (d.seen || 0) + (d.correct || 0) + (d.wrong || 0) + (d.speech || 0);
    return { date, total, dow: new Date(date + "T12:00:00Z").getUTCDay() };
  });
}

// André: a sequência como 7 "fichas" da semana (acesas = praticou; hoje com contorno).
function renderStreakWeek(streak) {
  const days = homeWeekDays();
  const letters = ["S", "M", "T", "W", "T", "F", "S"];
  const today = days[days.length - 1];
  const cells = days.map((d, i) => `<span class="wk-day${d.total ? " on" : ""}${i === days.length - 1 ? " today" : ""}">
      <span class="wk-dot">${d.total ? icon("check") : ""}</span><span class="wk-l">${letters[d.dow]}</span></span>`).join("");
  return `<div class="wk-head">
      <span class="wk-flame">${icon("flame")}</span>
      <span class="wk-title"><b>${streak.count}-day streak</b><small>${today.total ? "Great job today!" : "Play today to keep it going!"}</small></span>
    </div>
    <div class="wk-days" role="img" aria-label="${days.filter((d) => d.total).length} of the last 7 days played">${cells}</div>`;
}

// Thales: mini gráfico de barras dos 7 dias (SVG à mão, cor por classe → token), com a mesma
// informação em texto no aria-label. Sem porcentagem nem acerto/erro: só "praticou quanto".
function renderWeekChart(streak) {
  const days = homeWeekDays();
  const letters = ["D", "S", "T", "Q", "Q", "S", "S"];
  const W = 280, H = 92, top = 16, bottom = 20;
  const plotH = H - top - bottom;
  const slot = W / days.length;
  const barW = 22;
  const max = Math.max(5, ...days.map((d) => d.total));
  let bars = "";
  days.forEach((d, i) => {
    const x = i * slot + (slot - barW) / 2;
    const isToday = i === days.length - 1;
    const h = d.total ? Math.max(4, (d.total / max) * plotH) : 3;
    bars += `<rect class="wc-bar${d.total ? "" : " empty"}${isToday ? " today" : ""}" x="${x}" y="${top + plotH - h}" width="${barW}" height="${h}" rx="4"/>`;
    if (d.total) bars += `<text class="wc-val" x="${x + barW / 2}" y="${top + plotH - h - 4}" text-anchor="middle">${d.total}</text>`;
    bars += `<text class="wc-x${isToday ? " today" : ""}" x="${x + barW / 2}" y="${H - 4}" text-anchor="middle">${letters[d.dow]}</text>`;
  });
  const sum = days.reduce((a, d) => a + d.total, 0);
  const active = days.filter((d) => d.total).length;
  const desc = `Últimos 7 dias: praticou em ${active} dias, ${sum} interações. ` + days.map((d) => `${d.date.slice(8, 10)}/${d.date.slice(5, 7)}: ${d.total}`).join("; ");
  return `<div class="wc-head">
      <span class="home-card-txt"><b>Sua semana</b><small>${sum ? `${sum} interações em ${active} ${active === 1 ? "dia" : "dias"}` : "Nenhuma prática ainda esta semana"}</small></span>
      <span class="wc-streak">${icon("flame")} ${streak.count === 1 ? "1º dia" : `${streak.count} dias seguidos`}</span>
    </div>
    <svg class="wc-chart" viewBox="0 0 ${W} ${H}" role="img" aria-label="${escapeHtml(desc)}"><title>${escapeHtml(desc)}</title>
      <line class="wc-base" x1="0" x2="${W}" y1="${top + plotH + 0.5}" y2="${top + plotH + 0.5}"/>${bars}</svg>`;
}

// Thales: os lugares do mapa como "situações" — primeiro os começados (mais perto de concluir),
// depois os novos; tocar abre a prática daquele lugar (startSituationQuiz) e volta pra Home.
function renderHomeSituations() {
  const el = document.getElementById("home-situations");
  if (!el) return;
  const all = profileSituations().map((s) => ({ s, ratio: getSituationProgressRatio(s), n: getSituationItems(s).length }));
  const order = (r) => (r.ratio >= UNLOCK_THRESHOLD ? 2 : r.ratio > 0 ? 0 : 1);
  const list = [...all].sort((a, b) => order(a) - order(b) || b.ratio - a.ratio).slice(0, 4);
  el.innerHTML = `<div class="sit-head">
      <span class="home-card-txt"><b>Situações</b><small>Pratique o inglês de cada lugar</small></span>
      <button class="sit-map-btn" id="btn-home-map">${icon("map")} Mapa</button>
    </div>
    <div class="sit-list">${list.map(({ s, ratio, n }) => {
      const done = Math.round(ratio * n);
      return `<button class="sit-row" data-situation="${s.id}">
        <span class="sit-ic">${emojiHtml(s.icon)}</span>
        <span class="sit-main"><span class="sit-name">${escapeHtml(displayName(s))}</span>
          <span class="sit-meter"><span style="width:${Math.round(Math.min(1, ratio) * 100)}%"></span></span></span>
        <span class="sit-num">${done}/${n}</span>
        ${icon("chevron", "sit-chev")}
      </button>`;
    }).join("")}</div>`;
  el.querySelectorAll(".sit-row").forEach((row) =>
    row.addEventListener("click", () => {
      const s = profileSituations().find((x) => x.id === row.dataset.situation);
      if (s) startSituationQuiz(s, "home");
    })
  );
  document.getElementById("btn-home-map").addEventListener("click", () => {
    renderWorldMap();
    showScreen("world");
  });
}

// Thales: Dictionary em destaque, com um "termo do dia" (fixo no dia, muda à meia-noite UTC).
function renderDictCard() {
  const dict = typeof ADULT_DICTIONARY !== "undefined" ? ADULT_DICTIONARY : [];
  document.getElementById("dict-card-sub").textContent = `${dict.length} termos explicados, com exemplo`;
  const wordEl = document.getElementById("dict-card-word");
  if (!dict.length) { wordEl.innerHTML = ""; return; }
  const e = dict[Math.floor(Date.now() / 86400000) % dict.length];
  wordEl.innerHTML = `<span class="dw-label">Termo do dia</span><span class="dw-term">${escapeHtml(e.term)}</span><span class="dw-pt">${escapeHtml(e.pt)}</span>`;
}

// Quokka Bay (crianças): os 3 lugares com menos progresso como uma mini trilha de nós (mesmo
// anel de progresso dos pinos do mapa), sugestão do que explorar a seguir.
function renderBayPreview() {
  const next = profileSituations().sort((a, b) => getSituationProgressRatio(a) - getSituationProgressRatio(b)).slice(0, 3);
  document.getElementById("world-banner-preview").innerHTML = next
    .map((s) => {
      const p = Math.round(Math.min(1, getSituationProgressRatio(s) / UNLOCK_THRESHOLD) * 100);
      return `<span class="bay-node"><span class="bay-node-badge" style="--pin-progress:${p}%">${emojiHtml(s.icon)}</span><span class="bay-node-label">${escapeHtml(displayName(s))}</span></span>`;
    })
    .join("");
}

function renderHome() {
  // Tema e Home por modo: os tokens de cor/radius/sombra/fonte trocam em body[data-mode] (style.css).
  const profile = getActiveProfile();
  const mode = profile.mode;
  document.body.dataset.mode = mode;
  // barra do sistema (PWA) na cor do fundo do tema
  const themeMeta = document.querySelector('meta[name="theme-color"]');
  if (themeMeta) themeMeta.setAttribute("content", getComputedStyle(document.body).getPropertyValue("--color-theme-bar").trim() || "#FDF3E1");
  document.getElementById("home-mascot").innerHTML = mode === "oral" ? mascotSVG() : "";
  document.getElementById("home-avatar-badge").innerHTML = mode === "literacy" ? avatarSVG(avatarState) : "";
  document.getElementById("home-monogram").textContent = mode === "adult" ? profile.name.charAt(0) : "";
  renderAllAvatarMounts();
  renderAvatarScreen();

  // cabeçalho: saudação + nome + sequência (touchStreak marca o dia de hoje — mesma lógica de antes)
  const streak = touchStreak();
  document.getElementById("home-greeting").textContent = homeGreeting(mode);
  document.getElementById("home-name").textContent = profile.name;
  const badge = document.getElementById("streak-badge");
  const days = streak.count === 1 ? tr("day", "dia") : tr("days", "dias");
  badge.innerHTML = `${icon("flame")}<b>${streak.count}</b>${mode === "adult" ? `<span>${days}</span>` : ""}`;
  badge.setAttribute("aria-label", tr(`${streak.count} ${days} in a row`, `${streak.count} ${days} seguidos`));
  badge.setAttribute("role", "img");
  renderHomeStaticTexts();

  // missão do dia (sessão adaptativa): o tema que mais aparece na sessão vira o título
  const session = buildSession();
  const catCounts = {};
  session.forEach((r) => { catCounts[r.item.category] = (catCounts[r.item.category] || 0) + 1; });
  const topCatId = Object.keys(catCounts).sort((a, b) => catCounts[b] - catCounts[a])[0];
  const topCat = topCatId ? CATEGORY_META[topCatId] : null;
  const estMinutes = Math.max(1, Math.round(session.length / 3));
  const reviews = session.filter((r) => getState(r.item.id).introduced).length;
  const fresh = session.length - reviews;
  document.getElementById("mission-art").innerHTML = topCat && mode !== "adult" ? emojiHtml(topCat.icon) : "";
  if (mode === "adult") {
    document.getElementById("mission-title").textContent = session.length ? "Sessão do dia" : "Tudo em dia";
    document.getElementById("mission-meta").textContent = session.length && topCat ? `Foco: ${topCat.namePt}` : "Volte mais tarde pra revisar.";
    document.getElementById("mission-stats").innerHTML = session.length
      ? `<span class="ms"><b>${reviews}</b>${reviews === 1 ? "revisão" : "revisões"}</span><span class="ms"><b>${fresh}</b>${fresh === 1 ? "nova" : "novas"}</span><span class="ms"><b>~${estMinutes}</b>min</span>`
      : "";
  } else {
    document.getElementById("mission-title").innerHTML = topCat ? displayName(topCat) : tr("All done!", "Tudo em dia!");
    document.getElementById("mission-meta").innerHTML = session.length
      ? icon("clock") + " " + tr(`${session.length} rounds · ~${estMinutes} min`, `~${estMinutes} min · ${session.length} atividades`)
      : tr("Come back later to review!", "Volta mais tarde pra revisar!");
    document.getElementById("mission-stats").innerHTML = "";
  }

  // blocos por perfil
  const week = document.getElementById("home-week");
  week.innerHTML = mode === "literacy" ? renderStreakWeek(streak) : mode === "adult" ? renderWeekChart(streak) : "";
  if (mode !== "adult") renderAvatarNext();
  if (mode === "literacy") {
    document.getElementById("games-card-chips").innerHTML = SPELLING_GAMES.map((g) => `<span>${icon(g.icon)}</span>`).join("");
  }
  if (mode === "adult") {
    renderDictCard();
    renderHomeSituations();
  } else {
    renderBayPreview();
  }
}

// Grade de categorias (explorar livre) — mora dentro de Adventure/My English World, não na Home.
function renderCategoryGrid() {
  const grid = document.getElementById("category-grid");
  if (!grid) return;
  grid.innerHTML = "";
  profileCategoryIds().forEach((catId) => {
    const meta = CATEGORY_META[catId];
    const items = CONTENT.filter((it) => it.category === catId);
    const masteredCount = items.filter((it) => getLearningStage(it.id) === "mastered").length;
    const btn = document.createElement("button");
    btn.className = "cat-card";
    btn.style.background = meta.color;
    btn.innerHTML = `<span class="cat-icon">${emojiHtml(meta.icon)}</span><span>${displayName(meta)}</span>${renderDots(masteredCount, items.length, "sm cat-progress")}`;
    btn.addEventListener("click", () => openCategory(catId));
    grid.appendChild(btn);
  });
}

// ===================== Categoria (explorar) =====================
let currentCategoryId = null;
function openCategory(catId) {
  currentCategoryId = catId;
  const meta = CATEGORY_META[catId];
  document.getElementById("category-title").textContent = displayName(meta);
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
      // Adulto: tocar numa palavra/expressão que é verbete abre a explicação também.
      if (getActiveProfile().mode === "adult") {
        const hit = findDictionaryTerms(item.en).find((f) => f.start === 0 && f.end >= item.en.replace(/[.!?]+$/, "").length);
        if (hit) openDictionaryEntry(hit.entry, item.id, false);
      }
    });
    wordGrid.appendChild(card);
  });
  showScreen("category");
}

document.getElementById("btn-play-quiz").addEventListener("click", () => {
  const items = CONTENT.filter((it) => it.category === currentCategoryId);
  quizReturnScreen = "category";
  startQuiz(shuffle(items).slice(0, 10).map((it) => (getActiveProfile().mode !== "oral" ? makeRound(it) : { item: it, roundType: "choice" })));
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
    AVATAR_ITEMS[cat].filter(avatarItemVisible).forEach((item) => {
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
  document.getElementById("quiz-progress").innerHTML = renderQuizProgress(quizIndex, quizQueue.length);
  const container = document.getElementById("quiz-options");
  const repeatBtn = document.getElementById("btn-repeat-word");
  repeatBtn.innerHTML = icon("sound") + " " + tr("Listen again", "Ouvir de novo");
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
        <span class="word-en">${dictLinkedHtml(round.item.en)}</span>
        <button class="word-pt-btn" id="intro-pt">${icon("sound")}<span class="word-pt">${round.item.pt}</span></button>
        <span class="intro-hint">toque na imagem pra ouvir em inglês · toque na tradução pra ouvir em português</span>
        <button class="big-btn" id="intro-next">${tr("Got it!", "Já sei!")} ${icon("arrow")}</button>
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
        <span class="speak-note">${
          getActiveProfile().mode === "adult"
            ? "Prática de fala — conta se a frase inteira for reconhecida; não avalia sotaque."
            : "É só uma brincadeira de praticar a fala — não avalia a pronúncia dele."
        }</span>
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
        <div class="scenario-emoji">${emojiHtml(round.item.emoji)}</div>
        <div class="scenario-bubble">
          <span class="avatar">${emojiHtml(scenario.speaker || "👩‍🏫")}</span>
          <span class="txt">"${scenarioPrompt(scenario)}"</span>
          <button class="speaker" id="scenario-replay" aria-label="Ouvir de novo">${icon("sound")}</button>
        </div>
      </div>
      <div class="prompt-line">${tr("What do you say?", "O que você fala?")} 🇬🇧</div>
      <div class="situation-status" id="situation-status">${icon("sound")} ${tr("listening to the options... tap a card to hear it again", "ouvindo as opções... toque numa carta pra ouvir de novo")}</div>
      <div class="situation-options" id="situation-options"></div>`;
    const optionsWrap = document.getElementById("situation-options");
    const statusEl = document.getElementById("situation-status");
    // Trava a resposta até acabar de ler as 3 opções em voz alta — sem isso ele saía clicando em
    // tudo antes de ouvir (achado ao vivo, LEARNING_PHILOSOPHY.md é sobre ENTENDER, não adivinhar).
    // Enquanto travado, tocar numa carta só repete o áudio dela — não conta como resposta.
    choiceLocked = true;
    const options = shuffle([round.item, ...scenario.distractorIds.map((id) => CONTENT_BY_ID[id])]);
    options.forEach((opt) => {
      const btn = document.createElement("button");
      btn.className = "quiz-option situation-option locked";
      btn.innerHTML = `<span class="opt-emoji">${emojiHtml(opt.emoji)}</span><span class="opt-text">${opt.en}</span>`;
      btn.dataset.itemId = opt.id;
      btn.addEventListener("click", () => {
        if (choiceLocked) {
          speak(opt.en, opt.id);
          return;
        }
        handleChoice(btn, opt, round.item, optionsWrap);
      });
      optionsWrap.appendChild(btn);
    });
    const playPrompt = () =>
      isImmersion() && scenario.promptEn ? speak(scenario.promptEn, scenario.id) : speakPT(scenario.promptPt, scenario.id);
    document.getElementById("scenario-replay").addEventListener("click", playPrompt);
    playPrompt();
    options.forEach((opt, i) => {
      setTimeout(() => {
        const btn = optionsWrap.children[[...optionsWrap.children].findIndex((b) => b.dataset.itemId === opt.id)];
        optionsWrap.querySelectorAll(".situation-option").forEach((b) => b.classList.remove("reading"));
        if (btn) btn.classList.add("reading");
        speak(opt.en, opt.id);
      }, 2200 + i * 2000);
    });
    setTimeout(() => {
      optionsWrap.querySelectorAll(".situation-option").forEach((b) => b.classList.remove("reading", "locked"));
      choiceLocked = false;
      statusEl.textContent = tr("👉 tap the right one!", "👉 toque na certa!");
    }, 2200 + options.length * 2000);
    return;
  }

  if (round.roundType === "read") {
    repeatBtn.style.display = "none";
    wrongAttemptsThisRound = 0;
    const scenario = SCENARIO_BY_CORRECT_ID[round.item.id];
    if (scenario) {
      // Com cenário: lê a situação (texto, não narrado) e escolhe a FRASE certa entre 3 — mesmo
      // problem-posing do round "situation" do João, só que lendo em vez de ouvir.
      container.innerHTML = `
        <div class="situation-card">
          <div class="scenario-emoji">${emojiHtml(round.item.emoji)}</div>
          <div class="scenario-bubble">
            <span class="avatar">${emojiHtml(scenario.speaker || "👩‍🏫")}</span>
            <span class="txt">"${scenarioPrompt(scenario)}"</span>
          </div>
        </div>
        <div class="prompt-line">${tr("Read and choose what you say", "Leia e escolha o que você fala")} 🇬🇧</div>
        <div class="situation-options" id="situation-options"></div>`;
      const optionsWrap = document.getElementById("situation-options");
      const options = shuffle([round.item, ...scenario.distractorIds.map((id) => CONTENT_BY_ID[id])]);
      options.forEach((opt) => {
        const btn = document.createElement("button");
        btn.className = "quiz-option situation-option";
        btn.innerHTML = `<span class="opt-emoji">${emojiHtml(opt.emoji)}</span><span class="opt-text">${opt.en}</span>`;
        btn.dataset.itemId = opt.id;
        btn.addEventListener("click", () => handleChoice(btn, opt, round.item, optionsWrap));
        optionsWrap.appendChild(btn);
      });
      return;
    }
    // Sem cenário: mostra a palavra escrita e escolhe a imagem certa entre 3. Imersão: a ajuda é
    // OUVIR a palavra em inglês (sob demanda — o desafio é ler), não a tradução em português.
    container.innerHTML = `
      <div class="read-card">
        <span class="read-word">${round.item.en}</span>
        <button class="word-pt-btn" id="read-help">${icon("sound")}<span class="word-pt">${tr("hear it", "ouvir")}</span></button>
        <span class="intro-hint">${tr("Read the word and tap the right picture", "Leia e escolha a imagem certa")}</span>
      </div>
      <div class="read-image-options" id="read-image-options"></div>`;
    document.getElementById("read-help").addEventListener("click", () => speak(round.item.en, round.item.id));
    const optionsWrap = document.getElementById("read-image-options");
    const distractors = getDistractors(round.item, 2);
    const options = shuffle([round.item, ...distractors]);
    options.forEach((opt) => {
      const btn = document.createElement("button");
      btn.className = "quiz-option";
      btn.innerHTML = renderMedia(opt);
      btn.dataset.itemId = opt.id;
      btn.addEventListener("click", () => handleChoice(btn, opt, round.item, optionsWrap));
      optionsWrap.appendChild(btn);
    });
    return;
  }

  if (round.roundType === "write" || round.roundType === "dictation") {
    // write: escreve a partir da situação (com cenário) ou da tradução (adulto, sem cenário).
    // dictation (André): ouve a palavra/frase — que ele já conhece de ouvido — e escreve. É o
    // treino de ortografia propriamente dito: som → grafia.
    repeatBtn.style.display = "none";
    wrongAttemptsThisRound = 0;
    const isDictation = round.roundType === "dictation";
    const scenario = isDictation ? null : SCENARIO_BY_CORRECT_ID[round.item.id];
    let head;
    if (isDictation) {
      head = `<span class="word-emoji-big dictation-media">${renderMedia(round.item)}</span>
              <button class="big-btn listen-btn" id="write-listen">${icon("sound")} ${tr("Listen", "Ouvir")}</button>
              <span class="intro-hint">${tr("Listen and write what you hear", "Ouça e escreva o que ouviu")}</span>`;
    } else if (scenario) {
      head = `<div class="scenario-emoji">${emojiHtml(round.item.emoji)}</div>
              <div class="scenario-bubble"><span class="avatar">${emojiHtml(scenario.speaker || "👩‍🏫")}</span><span class="txt">"${scenarioPrompt(scenario)}"</span>
                ${isImmersion() ? `<button class="speaker" id="write-listen" aria-label="Listen">${icon("sound")}</button>` : ""}</div>
              ${isImmersion() ? `<span class="intro-hint">What do you say? Write it.</span>` : ""}`;
    } else {
      head = `<span class="word-emoji-big">${renderMedia(round.item)}</span>
              <button class="word-pt-btn" id="write-pt">${icon("sound")}<span class="word-pt">${round.item.pt}</span></button>`;
    }
    container.innerHTML = `
      <div class="write-card">
        ${head}
        <input type="text" id="write-input" class="write-input" inputmode="text" autocapitalize="off"
               autocomplete="off" autocorrect="off" spellcheck="false" placeholder="${tr("write it in English...", "escreva em inglês...")}" />
        <button class="big-btn" id="write-submit">${tr("Check", "Confirmar")}</button>
        <div class="write-feedback" id="write-feedback"></div>
      </div>`;
    const listenBtn = document.getElementById("write-listen");
    if (listenBtn) {
      listenBtn.addEventListener("click", () =>
        isDictation ? speak(round.item.en, round.item.id) : speak(scenario.promptEn, scenario.id)
      );
    }
    const ptBtn = document.getElementById("write-pt");
    if (ptBtn) ptBtn.addEventListener("click", () => speakPT(round.item.pt));
    if (isDictation) speak(round.item.en, round.item.id);
    // Imersão: a situação em inglês toca sozinha (é contexto, não a resposta — ele ainda precisa
    // saber O QUE dizer e COMO se escreve).
    else if (scenario && isImmersion() && scenario.promptEn) speak(scenario.promptEn, scenario.id);
    setupTypingCheck(round, isDictation);
    return;
  }

  if (round.roundType === "sentence_build" || round.roundType === "cloze") {
    renderSentenceRound(round, container, repeatBtn);
    return;
  }

  if (round.roundType === "build" || round.roundType === "pick_spelling" || round.roundType === "missing_sound") {
    renderSpellingGameRound(round, container, repeatBtn);
    return;
  }

  if (round.roundType === "meaning") {
    // Trilha adulta: mostra (e toca) a frase em inglês e pede o SENTIDO — escolher a tradução
    // certa entre 3 da mesma categoria. É o "understand" antes do "produce" (write/speak):
    // pra "It depends on the circumstances" o que importa é entender, não reconhecer um emoji.
    repeatBtn.style.display = "";
    wrongAttemptsThisRound = 0;
    container.innerHTML = `
      <div class="read-card">
        <span class="read-word">${dictLinkedHtml(round.item.en)}</span>
        <span class="intro-hint">o que isso quer dizer?${findDictionaryTerms(round.item.en).length ? " · toque numa palavra sublinhada pra ver o significado" : ""}</span>
      </div>
      <div class="situation-options" id="meaning-options"></div>`;
    const optionsWrap = document.getElementById("meaning-options");
    // Distratores do mesmo tipo (sentença contra sentença): frase longa contra "disponibilidade"
    // entrega a resposta pelo tamanho, sem precisar entender nada.
    const sameType = profileContent().filter((it) => it.id !== round.item.id && it.contentType === round.item.contentType);
    const sameTypeAndCategory = sameType.filter((it) => it.category === round.item.category);
    const distractors = shuffle(sameTypeAndCategory.length >= 2 ? sameTypeAndCategory : sameType).slice(0, 2);
    const options = shuffle([round.item, ...distractors]);
    options.forEach((opt) => {
      const btn = document.createElement("button");
      btn.className = "quiz-option situation-option";
      btn.innerHTML = `<span class="opt-text">${opt.pt}</span>`;
      btn.dataset.itemId = opt.id;
      btn.addEventListener("click", () => handleChoice(btn, opt, round.item, optionsWrap));
      optionsWrap.appendChild(btn);
    });
    speak(round.item.en, round.item.id);
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

// ---- Imersão (André, modo "literacy"): tudo do quiz em inglês ----
function isImmersion() {
  return getActiveProfile().mode === "literacy";
}
// Texto de interface: inglês no perfil em imersão, português nos outros.
function tr(en, pt) {
  return isImmersion() ? en : pt;
}
// Nome de lugar/categoria: `nameEn` no perfil em imersão (quando existe), senão `namePt`.
function displayName(obj) {
  return isImmersion() && obj.nameEn ? obj.nameEn : obj.namePt;
}
// Textos fixos da Home e do mapa (index.html) — trocados aqui pra seguir o idioma do perfil.
function renderHomeStaticTexts() {
  const set = (sel, text) => {
    const el = document.querySelector(sel);
    if (el) el.textContent = text;
  };
  const adult = getActiveProfile().mode === "adult";
  // eyebrow da ação principal: missão (João), desafio do dia (André), "Hoje" (Thales)
  set("#mission-eyebrow", adult ? "Hoje" : tr("Today's challenge", "Sua missão"));
  set("#btn-world-banner .txt small", tr("Explore places and practise there", "Explore lugares e pratique lá"));
  set("#games-card-sub", "3 games · build, find and fix words");
  set("#screen-world .section-title", tr("Explore by category", "Explorar por categoria"));
  const pill = document.getElementById("mission-cta");
  if (pill) pill.innerHTML = adult ? "Começar sessão " + icon("arrow") : icon("play") + " " + tr("PLAY", "JOGAR");
  const gamesIc = document.querySelector("#btn-games .games-card-ic");
  if (gamesIc) gamesIc.innerHTML = icon("gamepad");
  const dictIc = document.querySelector("#btn-dictionary .dict-card-ic");
  if (dictIc) dictIc.innerHTML = icon("book");
  const dictChev = document.querySelector("#btn-dictionary .dict-card-chev");
  if (dictChev) dictChev.innerHTML = icon("chevron");
  const bayIc = document.querySelector("#btn-world-banner .ic");
  if (bayIc) bayIc.innerHTML = icon("map");
  // mapa: título e dica no idioma do perfil (o título tinha emoji de cromo 🏝️)
  const worldTitle = document.querySelector("#screen-world .sub-header h2");
  if (worldTitle) worldTitle.innerHTML = icon("map") + " Quokka Bay";
  const playQuizBtn = document.getElementById("btn-play-quiz");
  if (playQuizBtn) playQuizBtn.innerHTML = icon("play") + " " + tr("Play", "Jogar");
}
function scenarioPrompt(scenario) {
  return isImmersion() && scenario.promptEn ? scenario.promptEn : scenario.promptPt;
}

// ---- Escrita: corrige mostrando ONDE errou e QUAL regra de grafia (engine.js, analyzeSpelling) ----
// 1º erro: as letras dele em verde/vermelho (faltou = "_", sobrou = riscado) + a dica do padrão de
//   som daquele pedaço — sem entregar a palavra (scaffolding: o menor passo pra ele acertar sozinho).
// 2º erro: conta como erro no SRS, mostra a grafia certa com o padrão destacado, e pede pra ele
//   digitar certo uma vez antes de seguir (copiar já é praticar a grafia; não pontua de novo).
// Erro nunca é punição (LEARNING_PHILOSOPHY.md seção 35): texto gentil, som gentil, sempre dá pra seguir.
function escapeHtml(s) {
  return s.replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]);
}
function renderAttemptHtml(analysis) {
  return analysis.ops
    .map((o) => {
      if (o.op === "ok") return `<span class="sp-ok">${o.y === " " ? "&nbsp;" : escapeHtml(o.y)}</span>`;
      if (o.op === "sub") return `<span class="sp-bad">${o.y === " " ? "&nbsp;" : escapeHtml(o.y)}</span>`;
      if (o.op === "ins") return `<span class="sp-extra">${o.y === " " ? "&nbsp;" : escapeHtml(o.y)}</span>`;
      return `<span class="sp-missing">_</span>`;
    })
    .join("");
}
function renderTargetHtml(analysis) {
  const inPattern = new Set();
  analysis.tips.forEach((t) => {
    for (let k = t.range[0]; k < t.range[1]; k++) inPattern.add(k);
  });
  return [...analysis.target]
    .map((ch, k) => {
      const txt = ch === " " ? "&nbsp;" : escapeHtml(ch);
      if (inPattern.has(k)) return `<span class="sp-pattern">${txt}</span>`;
      if (analysis.wrongIdx.has(k)) return `<span class="sp-fix">${txt}</span>`;
      return txt;
    })
    .join("");
}
function renderTipsHtml(analysis, item) {
  const lines = [];
  if (item.spellingTip) lines.push(item.spellingTip);
  analysis.tips.forEach((t) => {
    lines.push(t.pattern.tip + (t.examples.length ? ` — like ${t.examples.join(", ")}` : ""));
  });
  if (!isImmersion()) return ""; // dicas de phonics são em inglês e pensadas pra alfabetização (André)
  return lines.slice(0, 2).map((l) => `<div class="sp-tip">💡 ${escapeHtml(l)}</div>`).join("");
}

function setupTypingCheck(round, isDictation) {
  const item = round.item;
  const input = document.getElementById("write-input");
  const feedback = document.getElementById("write-feedback");
  const submitBtn = document.getElementById("write-submit");
  const accepted = (item.acceptedAnswers && item.acceptedAnswers.length ? item.acceptedAnswers : [item.en]).map(normalizeAnswer);
  let copyMode = false; // depois de revelar: ele digita a grafia certa uma vez, sem valer ponto
  const goNext = (delay) => {
    choiceLocked = true;
    setTimeout(() => {
      quizIndex++;
      renderRound();
    }, delay);
  };
  const check = () => {
    if (choiceLocked) return;
    const typed = normalizeAnswer(input.value);
    if (!typed) return;
    if (accepted.includes(typed)) {
      feedback.innerHTML = copyMode ? tr("👍 Now you've got it!", "👍 Agora sim!") : tr("🌟 Great job!", "🌟 Isso aí!");
      playCheer();
      if (!copyMode) {
        recordResult(item.id, wrongAttemptsThisRound === 0);
        quizScore.correct++;
        quizScore.total++;
      }
      goNext(900);
      return;
    }
    const analysis = analyzeSpelling(item, input.value);
    playGentle();
    if (copyMode) {
      feedback.innerHTML = `<div class="sp-line">${renderAttemptHtml(analysis)}</div><div>${tr("Look again and copy it:", "Olhe de novo e copie:")} <span class="sp-target">${renderTargetHtml(analysis)}</span></div>`;
      return;
    }
    wrongAttemptsThisRound++;
    quizScore.total++;
    if (isImmersion()) logSpellingMistake(analysis, item);
    if (wrongAttemptsThisRound >= 2) {
      recordResult(item.id, false);
      copyMode = true;
      feedback.innerHTML = `
        <div>${tr("This is how you spell it:", "O jeito certo é:")}</div>
        <div class="sp-target sp-big">${renderTargetHtml(analysis)}</div>
        ${renderTipsHtml(analysis, item)}
        <div>${tr("Now type it the right way 👇", "Agora digite do jeito certo 👇")}</div>
        <button class="skip-btn" id="write-skip">${tr("Next", "Próxima")} ${icon("arrow")}</button>`;
      document.getElementById("write-skip").addEventListener("click", () => goNext(0));
      input.value = "";
      input.focus();
      speak(item.en, item.id);
    } else {
      feedback.innerHTML = `
        <div>${tr("Almost! Look at the red letters:", "Quase! Olha as letras em vermelho:")}</div>
        <div class="sp-line">${renderAttemptHtml(analysis)}</div>
        ${renderTipsHtml(analysis, item)}`;
      if (isDictation) speak(item.en, item.id);
    }
  };
  submitBtn.addEventListener("click", check);
  input.addEventListener("keydown", (e) => {
    if (e.key === "Enter") check();
  });
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
  document.getElementById("result-text").textContent = tr(`You practised ${quizQueue.length} words!`, `Você brincou com ${quizQueue.length} palavras!`);
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
    // recompensa concreta: o avatar aparece já vestindo o item novo (só na prévia — não troca o
    // avatarState salvo), com o cartão do item ao lado
    const previewState = Object.assign({}, avatarState, { [cat]: item.id });
    document.getElementById("unlock-item-preview").innerHTML =
      `<div class="unlock-burst"></div><div class="unlock-avatar">${avatarSVG(previewState)}</div>` +
      `<div class="item-swatch${item.color ? "" : " is-none"}" style="${item.color ? `--item-color:${item.color}` : ""}">${avatarItemCardHTML(cat, item)}</div>`;
    document.getElementById("unlock-item-name").textContent = `Novo item de ${catLabel.toLowerCase()} desbloqueado!`;
  }, 900);
}
document.getElementById("btn-play-again").addEventListener("click", () => startQuiz(buildSession()));

// ===================== Portão dos pais =====================
// A engrenagem fica na Home, ao alcance das crianças. Antes dela abrir a Área dos pais, um portão
// simples: SEGURAR um botão por 3 segundos, com um anel que vai se fechando.
// Por que segurar e não uma continha:
// - criança de 4 anos toca, não segura — um toque curto nunca passa, e não há nada pra "acertar
//   no chute" (uma continha com alternativas passa por sorte 1 vez em 3 ou 4);
// - a instrução é TEXTO ("segure por 3 segundos") — quem ainda não lê não descobre sozinho;
// - continha vira jogo pro André (8 anos, faz conta) e exige teclado/opções; segurar é um gesto
//   só, rápido pro adulto, sem nada pra digitar com uma mão segurando o celular.
// Não é segurança de verdade (não guarda segredo nenhum) — é só pra ninguém zerar o progresso ou
// trocar de perfil sem querer.
const PARENT_GATE_HOLD_MS = 3000;
const GATE_RING_LEN = 2 * Math.PI * 52; // circunferência do anel (r=52 no index.html)
let gateHoldStart = 0;
let gateRaf = null;
let gateReturnFocus = null;

function setGateRing(progress) {
  const fill = document.getElementById("parent-gate-ring-fill");
  fill.style.strokeDasharray = String(GATE_RING_LEN);
  fill.style.strokeDashoffset = String(GATE_RING_LEN * (1 - Math.max(0, Math.min(1, progress))));
}
function openParentGate() {
  const gate = document.getElementById("parent-gate");
  gateReturnFocus = document.activeElement;
  gate.hidden = false;
  gate.classList.remove("holding");
  document.getElementById("parent-gate-icon").innerHTML = icon("lock");
  document.getElementById("parent-gate-status").textContent = "";
  setGateRing(0);
  document.getElementById("parent-gate-hold").focus();
}
function closeParentGate() {
  stopGateHold(false);
  document.getElementById("parent-gate").hidden = true;
  if (gateReturnFocus && gateReturnFocus.focus) gateReturnFocus.focus();
}
function startGateHold(e) {
  if (e) e.preventDefault();
  if (gateRaf) return;
  gateHoldStart = performance.now();
  document.getElementById("parent-gate").classList.add("holding");
  document.getElementById("parent-gate-status").textContent = "Continue segurando…";
  const tick = (now) => {
    const p = (now - gateHoldStart) / PARENT_GATE_HOLD_MS;
    setGateRing(p);
    if (p >= 1) {
      gateRaf = null;
      passParentGate();
      return;
    }
    gateRaf = requestAnimationFrame(tick);
  };
  gateRaf = requestAnimationFrame(tick);
}
// Soltou antes da hora: o anel volta e explica — sem bronca, só a instrução de novo.
function stopGateHold(showHint) {
  if (!gateRaf) return;
  cancelAnimationFrame(gateRaf);
  gateRaf = null;
  document.getElementById("parent-gate").classList.remove("holding");
  setGateRing(0);
  if (showHint) document.getElementById("parent-gate-status").textContent = "Segure até o círculo fechar.";
}
function passParentGate() {
  document.getElementById("parent-gate").hidden = true;
  document.getElementById("parent-gate").classList.remove("holding");
  renderSettings();
  showScreen("settings");
  document.getElementById("screen-settings").scrollTop = 0;
  document.getElementById("parents-title").focus({ preventScroll: true });
}
(function initParentGate() {
  const hold = document.getElementById("parent-gate-hold");
  hold.addEventListener("pointerdown", (e) => {
    if (e.button !== undefined && e.button > 0) return;
    try { hold.setPointerCapture(e.pointerId); } catch (err) {}
    startGateHold(e);
  });
  ["pointerup", "pointercancel", "lostpointercapture"].forEach((ev) => hold.addEventListener(ev, () => stopGateHold(true)));
  hold.addEventListener("contextmenu", (e) => e.preventDefault()); // toque longo no iOS/Android abre menu
  hold.addEventListener("click", (e) => e.preventDefault()); // clique sozinho não faz nada
  // Teclado: segurar Espaço/Enter (sem contar o auto-repeat) — mesmo gesto, acessível sem toque.
  hold.addEventListener("keydown", (e) => {
    if ((e.key === " " || e.key === "Enter") && !e.repeat) startGateHold(e);
    else if (e.key === " " || e.key === "Enter") e.preventDefault();
  });
  hold.addEventListener("keyup", (e) => {
    if (e.key === " " || e.key === "Enter") stopGateHold(true);
  });
  document.querySelectorAll("[data-gate-close]").forEach((el) => el.addEventListener("click", closeParentGate));
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && !document.getElementById("parent-gate").hidden) closeParentGate();
  });
})();

// ===================== Área dos pais (antes "Configurações") =====================
// Velocidade da voz em 3 botões em vez de slider: os valores são os mesmos de speechRate (0.85 é
// o ritmo natural do áudio gravado). Valor antigo salvo fora desses 3 (do slider) continua
// valendo — só destaca o botão mais próximo até alguém escolher outro.
const RATE_PRESETS = [
  { id: "slow", label: "Devagar", value: 0.65 },
  { id: "normal", label: "Normal", value: 0.85 },
  { id: "fast", label: "Rápido", value: 1.05 },
];
function renderRateSegmented() {
  const el = document.getElementById("rate-segmented");
  const nearest = RATE_PRESETS.reduce((a, b) => (Math.abs(b.value - speechRate) < Math.abs(a.value - speechRate) ? b : a));
  el.innerHTML = RATE_PRESETS.map(
    (p) => `<button class="pa-seg${p.id === nearest.id ? " active" : ""}" role="radio" aria-checked="${p.id === nearest.id}" data-rate="${p.value}">${p.label}</button>`
  ).join("");
  el.querySelectorAll(".pa-seg").forEach((btn) => {
    btn.addEventListener("click", () => {
      speechRate = parseFloat(btn.dataset.rate);
      localStorage.setItem(profileKey("meuIngles_rate"), String(speechRate));
      renderRateSegmented();
    });
  });
}
document.getElementById("voice-select").addEventListener("change", (e) => {
  if (!e.target.value) return;
  chosenVoiceURI = e.target.value;
  localStorage.setItem(profileKey("meuIngles_voice"), chosenVoiceURI);
});
document.getElementById("btn-test-voice").addEventListener("click", () => speak("Hello! This is my voice."));

// ---- Zerar progresso: zona de perigo, confirmação digitando o nome do perfil ----
// (antes era um confirm() nativo — um toque a mais e ia tudo embora). Sem acento e sem
// maiúscula, pra "joao" valer por "João". O que é apagado não mudou: só o learningState.
function normalizeName(s) {
  return String(s || "").normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim().toLowerCase();
}
function resetConfirmMatches() {
  return normalizeName(document.getElementById("reset-confirm-input").value) === normalizeName(getActiveProfile().name);
}
function closeResetConfirm() {
  document.getElementById("reset-confirm").hidden = true;
  document.getElementById("btn-reset-progress").hidden = false;
  document.getElementById("reset-confirm-input").value = "";
  document.getElementById("btn-reset-confirm").disabled = true;
}
document.getElementById("btn-reset-progress").addEventListener("click", () => {
  const name = getActiveProfile().name;
  document.getElementById("reset-confirm-label").innerHTML = `Para confirmar, digite <strong>${escapeHtml(name)}</strong>:`;
  document.getElementById("reset-confirm-input").placeholder = name;
  document.getElementById("reset-confirm").hidden = false;
  document.getElementById("btn-reset-progress").hidden = true;
  document.getElementById("reset-confirm-input").focus();
});
document.getElementById("reset-confirm-input").addEventListener("input", () => {
  document.getElementById("btn-reset-confirm").disabled = !resetConfirmMatches();
});
document.getElementById("reset-confirm-input").addEventListener("keydown", (e) => {
  if (e.key === "Enter" && resetConfirmMatches()) document.getElementById("btn-reset-confirm").click();
});
document.getElementById("btn-reset-cancel").addEventListener("click", closeResetConfirm);
document.getElementById("btn-reset-confirm").addEventListener("click", () => {
  if (!resetConfirmMatches()) return;
  learningState = {};
  saveLearningState();
  closeResetConfirm();
  renderSettings();
  renderHome();
  document.getElementById("update-status").textContent = "";
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

// Padrões de grafia em que mais errou (engine.js, logSpellingMistake) — é o dado mais útil pros
// pais de uma criança em alfabetização: não "errou 12 palavras", mas "confunde 'oo' (school → scull)".
const SPELLING_PATTERN_LABELS = { tricky: "tricky words (decorar)", other: "outras letras" };
function topSpellingPatterns() {
  const log = loadSpellingLog();
  return Object.keys(log)
    .map((id) => {
      const p = PHONICS_PATTERNS.find((x) => x.id === id);
      return { id, label: SPELLING_PATTERN_LABELS[id] || (p ? p.labelPt : id), count: log[id].count, examples: log[id].examples };
    })
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);
}

// "Com mais dificuldade": mesmo critério em todo lugar (texto, JSON do relatório, painel) — errou
// 2+ vezes e ainda não saiu das caixas 0/1.
function getStrugglingItems(limit) {
  return profileContent().map((it) => ({ it, st: getState(it.id) }))
    .filter((x) => x.st.introduced && x.st.wrongCount >= 2 && x.st.box <= 1)
    .sort((a, b) => b.st.wrongCount - a.st.wrongCount)
    .slice(0, limit || 8);
}

function buildProgressSummary() {
  const lastActiveLine = `📅 Última vez que abriu: ${formatLastActive(streakAtLoad.lastActiveDate)}`;
  const lines = profileCategoryIds().map((catId) => {
    const meta = CATEGORY_META[catId];
    const items = CONTENT.filter((it) => it.category === catId);
    const introduced = items.filter((it) => getState(it.id).introduced).length;
    const mastered = items.filter((it) => getLearningStage(it.id) === "mastered").length;
    return `${meta.icon} ${meta.namePt}: ${mastered}/${items.length} dominadas (${introduced} vistas)`;
  });
  const struggling = getStrugglingItems(8).map((x) => x.it.en);
  let text = lastActiveLine + "\n\n" + lines.join("\n");
  if (struggling.length) text += `\n\nCom mais dificuldade: ${struggling.join(", ")}`;
  const spelling = topSpellingPatterns();
  if (spelling.length) {
    text += "\n\n✏️ Padrões de grafia pra praticar:\n" + spelling.map((p) => `• ${p.label} (${p.count}x) — ex.: ${p.examples.join("; ")}`).join("\n");
  }
  return text;
}

// Dados estruturados por trás do relatório em texto — não aparecem na tela, só vão junto do
// compartilhamento, pra quem colar isso numa conversa com o Claude consiga pedir gráficos de
// evolução (streak, atividade por dia, palavras dominadas por categoria) sem precisar de nenhum
// servidor: tudo já mora no localStorage do aparelho, isso só empacota pra exportar.
function buildStructuredReportData() {
  const streak = streakAtLoad;
  const byCategory = profileCategoryIds().map((catId) => {
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
  profileContent().forEach((it) => { totals[getLearningStage(it.id)]++; });
  const struggling = getStrugglingItems(8).map((x) => ({ id: x.it.id, en: x.it.en, wrongCount: x.st.wrongCount }));
  return {
    exportedAt: todayStr(),
    profile: getActiveProfile().id,
    totalContentItems: profileContent().length,
    stageTotals: totals,
    streak: { current: streak.count, lastActiveDate: streak.lastActiveDate },
    byCategory,
    dailyActivity: loadActivityLog(), // { "YYYY-MM-DD": { seen, correct, wrong, speech } } — até 60 dias
    strugglingTop: struggling,
    spellingPatterns: topSpellingPatterns(), // só tem dado no perfil do André (escrita em imersão)
  };
}

document.getElementById("btn-check-update").addEventListener("click", checkForUpdate);

document.getElementById("btn-share-report").addEventListener("click", () => {
  const today = new Date().toLocaleDateString("pt-BR");
  const dataBlock = JSON.stringify(buildStructuredReportData());
  const theme = getCurrentFamilyTheme();
  const themeBlock = theme ? `${theme.icon} Tema do mês: ${theme.namePt}\n🏠 Pra fazer em casa:\n${theme.homeTipsPt.map((t) => `• ${t}`).join("\n")}\n\n` : "";
  const text =
    `📚 Relatório do Meu Inglês — ${today} (${getActiveProfile().name})\n\n${buildProgressSummary()}\n\n` +
    themeBlock +
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

// ---- Debug do motor adaptativo (seção "Avançado", recolhida) ----
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

// Troca de perfil: reatribui a chave ativa e recarrega TODO estado de módulo que depende de
// perfil (não basta trocar a chave do localStorage — cada variável já carregada em memória
// precisa ser relida, senão a tela continua mostrando dado do perfil anterior até um F5).
// Lista auditada (grep em todo *.js por localStorage/sessionStorage): learningState, streakAtLoad,
// avatarState, chosenVoiceURI, speechRate, adaptationLog. buildProgressSummary/
// buildStructuredReportData/reset-progress/desbloqueio de avatar não precisam de correção própria
// — todos leem só essas variáveis, não chaves diretamente.
function reloadProfileState() {
  learningState = loadLearningState();
  streakAtLoad = loadStreak();
  avatarState = loadAvatarState();
  chosenVoiceURI = localStorage.getItem(profileKey("meuIngles_voice")) || null;
  speechRate = parseFloat(localStorage.getItem(profileKey("meuIngles_rate")) || "0.85");
  adaptationLog = [];
  try {
    sessionStorage.removeItem(ADAPTATION_LOG_KEY);
  } catch (e) {}
}

function switchProfile(id) {
  if (id === getActiveProfileId()) return;
  setActiveProfileId(id);
  reloadProfileState();
  closeResetConfirm();
  renderSettings();
  renderHome();
}

// Rótulo de cada perfil nos cartões (por modo, não por id — o modo é o que muda a experiência).
const PROFILE_BLURBS = { oral: "4 anos · ouvir e falar", literacy: "8 anos · ler e escrever", adult: "Adulto · trilha própria" };
function renderProfileSwitcher() {
  const el = document.getElementById("profile-switcher");
  const activeId = getActiveProfileId();
  el.innerHTML = PROFILES.map((p) => {
    const active = p.id === activeId;
    return `<button class="profile-btn pa-profile${active ? " active" : ""}" role="radio" aria-checked="${active}" data-profile-id="${p.id}">
      <span class="pa-profile-emoji" aria-hidden="true">${p.emoji}</span>
      <span class="pa-profile-name">${escapeHtml(p.name)}</span>
      <span class="pa-profile-blurb">${PROFILE_BLURBS[p.mode] || ""}</span>
      ${active ? `<span class="pa-profile-check" aria-hidden="true">${icon("check")}</span>` : ""}
    </button>`;
  }).join("");
  el.querySelectorAll(".profile-btn").forEach((btn) => {
    btn.addEventListener("click", () => switchProfile(btn.dataset.profileId));
  });
}

// ---- Tema da família do mês (FAMILY_THEMES, data.js; CONTENT_PLAN.md seção 2) ----
// O do mês atual, ou o último que já começou (se o plano atrasar, a dica antiga continua valendo).
function getCurrentFamilyTheme() {
  const month = todayStr().slice(0, 7);
  const started = (typeof FAMILY_THEMES !== "undefined" ? FAMILY_THEMES : []).filter((t) => t.id <= month);
  return started.length ? started[started.length - 1] : null;
}
function monthNamePt(themeId) {
  const [y, m] = themeId.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, 15)).toLocaleDateString("pt-BR", { month: "long", timeZone: "UTC" });
}
// Sem tema começado ainda (antes do plano), mostra o próximo como prévia — o relatório
// compartilhado continua só com o tema atual (getCurrentFamilyTheme), sem mudança.
function renderFamilyTheme() {
  const el = document.getElementById("family-theme");
  if (!el) return;
  const all = typeof FAMILY_THEMES !== "undefined" ? FAMILY_THEMES : [];
  const current = getCurrentFamilyTheme();
  const theme = current || all.find((t) => t.id > todayStr().slice(0, 7));
  if (!theme) {
    el.innerHTML = "";
    el.parentElement.hidden = true;
    return;
  }
  el.parentElement.hidden = false;
  const eyebrow = current ? `Tema do mês · ${monthNamePt(theme.id)}` : `Próximo tema · começa em ${monthNamePt(theme.id)}`;
  el.innerHTML = `
    <div class="family-theme-head">
      <span class="family-theme-icon" aria-hidden="true">${theme.icon}</span>
      <div>
        <p class="family-theme-eyebrow">${eyebrow}</p>
        <p class="family-theme-title">${escapeHtml(theme.namePt)}</p>
      </div>
    </div>
    <p class="family-theme-sub">Pra fazer em casa</p>
    <ul class="family-theme-tips">${theme.homeTipsPt.map((t) => `<li>${escapeHtml(t)}</li>`).join("")}</ul>`;
}

// ===================== Painel do perfil ativo (gráficos) =====================
// Pais como parceiros, não fiscais (LEARNING_PHILOSOPHY.md §32-34): nada de nota nem "% de
// acerto" — o painel mostra o que foi praticado, o que já está firme e onde dá pra ajudar em
// casa. Acerto e erro não aparecem separados no gráfico de atividade de propósito: viram
// "respostas" (praticar é o que importa). Gráficos em SVG feito à mão, cores dos tokens via
// classe CSS, cada um com <title>/aria-label descrevendo o mesmo dado em texto.
// A barra mostra só o que já foi visto — a trilha inteira (centenas de itens) afogaria o que
// importa; o que falta descobrir vira uma nota ao lado.
const STAGE_META = [
  { id: "mastered", label: "Já sabe" },
  { id: "consolidating", label: "Firmando" },
  { id: "learning", label: "Aprendendo" },
];

function lastNDays(n) {
  const out = [];
  for (let i = n - 1; i >= 0; i--) out.push(new Date(Date.now() - i * 86400000).toISOString().slice(0, 10));
  return out;
}

function activityChartSVG(days) {
  const W = 340, H = 150, top = 18, bottom = 24, left = 4, right = 4;
  const plotH = H - top - bottom;
  const slot = (W - left - right) / days.length;
  const barW = Math.min(16, slot * 0.62);
  const max = Math.max(4, ...days.map((d) => d.total));
  const y = (v) => (v / max) * plotH;
  const base = top + plotH;
  let bars = "";
  days.forEach((d, i) => {
    const x = left + i * slot + (slot - barW) / 2;
    const isToday = i === days.length - 1;
    if (!d.total) {
      bars += `<rect class="ac-empty" x="${x}" y="${base - 3}" width="${barW}" height="3" rx="1.5"/>`;
    } else {
      // empilha de baixo pra cima: respostas, novas, fala
      let yy = base;
      [["answers", "ac-answers"], ["seen", "ac-seen"], ["speech", "ac-speech"]].forEach(([k, cls]) => {
        if (!d[k]) return;
        const h = Math.max(2, y(d[k]));
        yy -= h;
        bars += `<rect class="${cls}" x="${x}" y="${yy}" width="${barW}" height="${h}"/>`;
      });
      bars += `<text class="ac-val" x="${x + barW / 2}" y="${yy - 4}" text-anchor="middle">${d.total}</text>`;
    }
    const day = d.date.slice(8, 10).replace(/^0/, "");
    if (isToday || i % 2 === 1) {
      bars += `<text class="ac-x${isToday ? " today" : ""}" x="${x + barW / 2}" y="${H - 6}" text-anchor="middle">${isToday ? "hoje" : day}</text>`;
    }
  });
  const active = days.filter((d) => d.total).length;
  const sum = days.reduce((a, d) => a + d.total, 0);
  const desc = `Atividade dos últimos ${days.length} dias: praticou em ${active} dias, ${sum} interações no total. ` +
    days.filter((d) => d.total).map((d) => `${d.date.slice(8, 10)}/${d.date.slice(5, 7)}: ${d.answers} respostas, ${d.seen} novas, ${d.speech} de fala`).join("; ");
  return `<svg class="pa-chart" viewBox="0 0 ${W} ${H}" role="img" aria-label="${escapeHtml(desc)}">
    <title>${escapeHtml(desc)}</title>
    <line class="ac-base" x1="0" x2="${W}" y1="${base + 0.5}" y2="${base + 0.5}"/>
    ${bars}
  </svg>`;
}

function stageBarSVG(totals, all) {
  const W = 340, H = 22;
  let x = 0, rects = "";
  STAGE_META.forEach((s) => {
    const w = all ? (totals[s.id] / all) * W : 0;
    if (w > 0) rects += `<rect class="st-${s.id}" x="${x}" y="0" width="${w}" height="${H}"/>`;
    x += w;
  });
  const desc = STAGE_META.map((s) => `${s.label}: ${totals[s.id]}`).join(", ") + ` (das ${all} já vistas)`;
  return `<svg class="pa-chart pa-stagebar" viewBox="0 0 ${W} ${H}" preserveAspectRatio="none" role="img" aria-label="${escapeHtml(desc)}">
    <title>${escapeHtml(desc)}</title>
    <defs><clipPath id="stage-clip"><rect x="0" y="0" width="${W}" height="${H}" rx="${H / 2}"/></clipPath></defs>
    <g clip-path="url(#stage-clip)"><rect class="st-new" x="0" y="0" width="${W}" height="${H}"/>${rects}</g>
  </svg>`;
}

// Barrinha de uma categoria: já sabe (cheio) + já viu (claro) sobre o total.
function categoryMeterSVG(mastered, introduced, total, label) {
  const W = 100, H = 8;
  const wm = total ? (mastered / total) * W : 0;
  const wi = total ? (introduced / total) * W : 0;
  const desc = `${label}: já sabe ${mastered}, já viu ${introduced}, de ${total}`;
  return `<svg class="pa-meter" viewBox="0 0 ${W} ${H}" preserveAspectRatio="none" role="img" aria-label="${escapeHtml(desc)}">
    <rect class="mt-track" x="0" y="0" width="${W}" height="${H}" rx="${H / 2}"/>
    ${wi ? `<rect class="mt-seen" x="0" y="0" width="${wi}" height="${H}" rx="${H / 2}"/>` : ""}
    ${wm ? `<rect class="mt-mastered" x="0" y="0" width="${wm}" height="${H}" rx="${H / 2}"/>` : ""}
  </svg>`;
}

function itemLabel(it) {
  return it.en.length > 34 ? it.en.slice(0, 32) + "…" : it.en;
}

function renderParentDashboard() {
  const el = document.getElementById("parent-dashboard");
  const profile = getActiveProfile();
  const name = escapeHtml(profile.name);
  const isAdult = profile.mode === "adult";
  const content = profileContent();
  const introducedItems = content.filter((it) => getState(it.id).introduced);
  const log = loadActivityLog();
  const days = lastNDays(14).map((date) => {
    const d = log[date] || {};
    const answers = (d.correct || 0) + (d.wrong || 0);
    return { date, seen: d.seen || 0, answers, speech: d.speech || 0, total: (d.seen || 0) + answers + (d.speech || 0) };
  });
  const title = `<h3 class="pa-section-title" id="pa-dash-title">${isAdult ? "Seu progresso" : `Como ${name} está indo`}</h3>`;

  // Estado vazio (DESIGN_BRIEF §34): sem "sem dados" — o começo da aventura, com uma ação clara.
  if (!introducedItems.length && !days.some((d) => d.total)) {
    el.innerHTML = `${title}
      <div class="pa-card pa-empty">
        <div class="pa-empty-mascot" aria-hidden="true">${mascotSVG()}</div>
        <p class="pa-empty-title">${isAdult ? "Sua trilha começa aqui!" : `A aventura do ${name} começa aqui!`}</p>
        <p class="pa-empty-text">${isAdult
          ? "Depois da primeira missão, aqui aparecem os dias em que você praticou, as expressões que já estão firmes e as que pedem mais revisão."
          : `Quando ${name} jogar a primeira missão, aqui aparecem os dias em que praticou, as palavras que já sabe e ideias pra usar o inglês em casa.`}</p>
        <button class="pa-btn pa-btn-primary" id="btn-empty-go-home">Ir para a missão</button>
      </div>`;
    document.getElementById("btn-empty-go-home").addEventListener("click", () => {
      renderHome();
      showScreen("home");
    });
    return;
  }

  // ---- Números de cabeçalho (streakAtLoad, nunca loadStreak() — ver PROCESS.md) ----
  const s = streakAtLoad;
  const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
  const streakAlive = s.lastActiveDate === todayStr() || s.lastActiveDate === yesterday;
  const lastActive = formatLastActive(s.lastActiveDate).replace(/ \((\d+) dias atrás\)/, "");
  const daysAgo = s.lastActiveDate ? Math.round((Date.parse(todayStr()) - Date.parse(s.lastActiveDate)) / 86400000) : null;
  const lastActiveSub = daysAgo && daysAgo > 1 ? `${daysAgo} dias atrás` : "abriu o app";
  const activeDays = days.filter((d) => d.total).length;

  // ---- Estágios ----
  const totals = { new: 0, learning: 0, consolidating: 0, mastered: 0 };
  content.forEach((it) => { totals[getLearningStage(it.id)]++; });

  // ---- Praticou por último (ponte pro mundo real, §33-34) ----
  const recent = introducedItems.slice().sort((a, b) => (getState(b.id).lastSeen || 0) - (getState(a.id).lastSeen || 0)).slice(0, 6);

  // ---- Categorias: as já exploradas primeiro; as intocadas resumidas numa linha ----
  const cats = profileCategoryIds().map((catId) => {
    const meta = CATEGORY_META[catId];
    const items = CONTENT.filter((it) => it.category === catId);
    return {
      meta,
      total: items.length,
      introduced: items.filter((it) => getState(it.id).introduced).length,
      mastered: items.filter((it) => getLearningStage(it.id) === "mastered").length,
    };
  });
  const explored = cats.filter((c) => c.introduced).sort((a, b) => b.introduced / b.total - a.introduced / a.total);
  const untouched = cats.filter((c) => !c.introduced);

  const struggling = getStrugglingItems(6);
  const spelling = profile.mode === "literacy" ? topSpellingPatterns() : [];
  const maxSpell = spelling.length ? spelling[0].count : 1;

  el.innerHTML = `${title}
    <div class="pa-stats">
      <div class="pa-stat"><span class="pa-stat-label">Última vez</span><span class="pa-stat-value">${escapeHtml(lastActive)}</span><span class="pa-stat-sub">${lastActiveSub}</span></div>
      <div class="pa-stat"><span class="pa-stat-label">Sequência</span><span class="pa-stat-value">${streakAlive ? `${s.count} ${s.count === 1 ? "dia" : "dias"}` : "—"}</span><span class="pa-stat-sub">${streakAlive ? "seguidos" : "recomeça na próxima"}</span></div>
      <div class="pa-stat"><span class="pa-stat-label">Já sabe</span><span class="pa-stat-value">${totals.mastered}</span><span class="pa-stat-sub">${introducedItems.length ? `de ${introducedItems.length} já vistas` : "nenhuma vista ainda"}</span></div>
    </div>

    <div class="pa-card">
      <div class="pa-card-head">
        <p class="pa-card-title">Últimos 14 dias</p>
        <p class="pa-card-note">Praticou em ${activeDays} ${activeDays === 1 ? "dia" : "dias"}</p>
      </div>
      ${activityChartSVG(days)}
      <ul class="pa-legend" aria-hidden="true">
        <li><span class="sw ac-answers"></span>Respostas</li>
        <li><span class="sw ac-seen"></span>Palavras novas</li>
        <li><span class="sw ac-speech"></span>Tentou falar</li>
      </ul>
    </div>

    <div class="pa-card">
      <div class="pa-card-head">
        <p class="pa-card-title">Em que pé ${isAdult ? "estão" : "estão as palavras"}</p>
        <p class="pa-card-note">${introducedItems.length} já ${isAdult ? "vistos" : "vistas"} · ${totals.new} por descobrir</p>
      </div>
      ${introducedItems.length ? `${stageBarSVG(totals, introducedItems.length)}
      <ul class="pa-stage-legend">
        ${STAGE_META.map((st) => `<li><span class="lbl"><span class="sw st-${st.id}" aria-hidden="true"></span>${st.label}</span><span class="num">${totals[st.id]}</span></li>`).join("")}
      </ul>` : `<p class="pa-card-text">Ainda nenhuma ${isAdult ? "expressão" : "palavra"} vista neste perfil — elas aparecem aqui conforme a próxima missão for jogada.</p>`}
    </div>

    ${recent.length ? `
    <div class="pa-card pa-tip-card">
      <p class="pa-card-title">${isAdult ? "Praticou por último" : "Pra usar em casa"}</p>
      <p class="pa-card-text">${isAdult ? "Tente usar uma destas hoje, numa conversa de verdade." : `${name} praticou estas por último. Que tal usar no dia a dia — no jantar, no caminho, brincando?`}</p>
      <div class="pa-chips">${recent.map((it) => `<span class="pa-chip">${escapeHtml(itemLabel(it))}</span>`).join("")}</div>
    </div>` : ""}

    ${struggling.length ? `
    <div class="pa-card">
      <p class="pa-card-title">Onde dá pra ajudar</p>
      <p class="pa-card-text">${isAdult ? "Estas ainda escapam — vale revisar com calma." : "Estas ainda estão difíceis. Sem pressão: ouvir e usar em casa ajuda mais que repetir."}</p>
      <div class="pa-chips">${struggling.map((x) => `<span class="pa-chip pa-chip-soft">${escapeHtml(itemLabel(x.it))}</span>`).join("")}</div>
    </div>` : ""}

    ${spelling.length ? `
    <div class="pa-card">
      <p class="pa-card-title">Padrões de grafia pra praticar</p>
      <p class="pa-card-text">Os sons ${name} já acerta; o que confunde é como se escreve cada um.</p>
      <ul class="pa-spell">
        ${spelling.map((p) => `<li>
          <div class="pa-spell-top"><span class="pa-spell-label">${escapeHtml(p.label)}</span><span class="pa-spell-count">${p.count}×</span></div>
          ${categoryMeterSVG(0, p.count, maxSpell, p.label).replace("mt-seen", "mt-spell")}
          <div class="pa-spell-ex">${p.examples.map((e) => `<span>${escapeHtml(e)}</span>`).join("")}</div>
        </li>`).join("")}
      </ul>
    </div>` : ""}

    <div class="pa-card">
      <div class="pa-card-head">
        <p class="pa-card-title">Por tema</p>
        <ul class="pa-legend pa-legend-inline" aria-hidden="true"><li><span class="sw mt-mastered"></span>já sabe</li><li><span class="sw mt-seen"></span>já viu</li></ul>
      </div>
      <ul class="pa-cats">
        ${explored.map((c) => `<li>
          <span class="pa-cat-icon" aria-hidden="true">${c.meta.icon}</span>
          <div class="pa-cat-main">
            <div class="pa-cat-top"><span class="pa-cat-name">${escapeHtml(c.meta.namePt)}</span><span class="pa-cat-num">${c.mastered} de ${c.total}</span></div>
            ${categoryMeterSVG(c.mastered, c.introduced, c.total, c.meta.namePt)}
          </div>
        </li>`).join("")}
      </ul>
      ${untouched.length ? `<p class="pa-card-note pa-cats-more">${untouched.length} ${untouched.length === 1 ? "tema" : "temas"} por explorar <span class="pa-cats-icons" aria-label="${escapeHtml(untouched.map((c) => c.meta.namePt).join(", "))}">${untouched.map((c) => c.meta.icon).join(" ")}</span></p>` : ""}
    </div>`;
}

function renderSettings() {
  renderProfileSwitcher();
  renderParentDashboard();
  renderFamilyTheme();
  populateVoiceSelect();
  renderRateSegmented();
  document.getElementById("reset-title").textContent = `Zerar progresso de ${getActiveProfile().name}`;
  renderAdaptationLog();
}

// ===================== Montar a frase / completar a frase (jan/2027) =====================
// sentence_build: blocos de palavras (+2 distratores de outras frases). André ouve a frase
// (imersão); adulto vê a tradução. É também o apoio automático quando uma frase trava
// (isStuckSentence, engine.js). cloze: a frase com uma palavra faltando — o André DIGITA (mesma
// correção letra por letra do ditado), o adulto escolhe entre 3 (vocabulário no contexto).
function renderSentenceRound(round, container, repeatBtn) {
  const item = round.item;
  repeatBtn.style.display = "none";
  wrongAttemptsThisRound = 0;
  choiceLocked = false;
  const listenHead = `<span class="word-emoji-big dictation-media">${emojiHtml(item.emoji)}</span>
    <button class="big-btn listen-btn" id="game-listen">${icon("sound")} ${tr("Listen", "Ouvir")}</button>`;
  const ptHead = `<span class="word-emoji-big dictation-media">${emojiHtml(item.emoji)}</span>
    <div class="sentence-pt">🇧🇷 ${escapeHtml(item.pt)}</div>`;

  if (round.roundType === "sentence_build") {
    const { tokens, distractors, ending } = sentenceBuildPuzzle(item);
    container.innerHTML = `
      <div class="write-card">
        ${isImmersion() ? listenHead : ptHead}
        <span class="intro-hint">${tr("Build the sentence", "Monte a frase em inglês")}</span>
        <div class="sentence-line" id="sentence-line"></div>
        <div class="build-tiles" id="build-tiles"></div>
        <div class="write-feedback" id="game-feedback"></div>
      </div>`;
    const line = document.getElementById("sentence-line");
    const tilesWrap = document.getElementById("build-tiles");
    const feedback = document.getElementById("game-feedback");
    let next = 0;
    const renderLine = () => {
      line.innerHTML = tokens.map((t, i) => (i < next ? `<span class="sl-word">${escapeHtml(t)}</span>` : `<span class="sl-blank"></span>`)).join(" ");
    };
    renderLine();
    shuffle([...tokens, ...distractors]).forEach((t) => {
      const btn = document.createElement("button");
      btn.className = "build-tile word-tile";
      btn.textContent = t;
      btn.addEventListener("click", () => {
        if (choiceLocked || btn.disabled) return;
        if (normalizeAnswer(t) === normalizeAnswer(tokens[next]) && t === tokens[next]) {
          btn.disabled = true;
          next++;
          renderLine();
          feedback.textContent = "";
          if (next === tokens.length) {
            line.innerHTML = `<span class="sl-word">${escapeHtml(item.en)}</span>`;
            feedback.textContent = tr("🌟 You built it!", "🌟 Montou!");
            speak(item.en, item.id);
            finishGameRound(item);
          }
        } else {
          wrongAttemptsThisRound++;
          playGentle();
          shakeEl(btn);
          if (wrongAttemptsThisRound >= 2) {
            const right = [...tilesWrap.children].find((b) => !b.disabled && b.textContent === tokens[next]);
            if (right) right.classList.add("hint");
            feedback.textContent = tr(`The next word is "${tokens[next]}"`, `A próxima palavra é "${tokens[next]}"`);
          } else {
            feedback.textContent = tr("Almost! Listen again.", "Quase! Qual palavra vem agora?");
          }
          if (isImmersion()) speak(item.en, item.id);
        }
      });
      tilesWrap.appendChild(btn);
    });
    const lb = document.getElementById("game-listen");
    if (lb) lb.addEventListener("click", () => speak(item.en, item.id));
    if (isImmersion()) speak(item.en, item.id);
    return;
  }

  // cloze
  const { tokens, gapIndex, answer, options } = clozePuzzle(item);
  const withGap = (fill) =>
    tokens.map((t, i) => (i === gapIndex ? `<span class="gap${fill ? " filled" : ""}">${fill ? escapeHtml(fill) : "____"}</span>${escapeHtml(t.slice(answer.length))}` : escapeHtml(t))).join(" ") +
    escapeHtml((item.en.trim().match(/[.!?]+$/) || [""])[0]);
  if (isImmersion()) {
    container.innerHTML = `
      <div class="write-card">
        ${listenHead}
        <span class="intro-hint">Listen and write the missing word</span>
        <div class="cloze-sentence" id="cloze-sentence">${withGap("")}</div>
        <input type="text" id="write-input" class="write-input" inputmode="text" autocapitalize="off"
               autocomplete="off" autocorrect="off" spellcheck="false" placeholder="the missing word..." />
        <button class="big-btn" id="write-submit">Check</button>
        <div class="write-feedback" id="write-feedback"></div>
      </div>`;
    document.getElementById("game-listen").addEventListener("click", () => speak(item.en, item.id));
    speak(item.en, item.id);
    // Mesma correção do ditado, mas o alvo é só a palavra que falta (o progresso continua sendo
    // registrado na frase — mesmo id).
    setupTypingCheck({ item: { ...item, en: answer, acceptedAnswers: [answer.toLowerCase()] } }, true);
    return;
  }
  container.innerHTML = `
    <div class="write-card">
      <span class="word-emoji-big dictation-media">${emojiHtml(item.emoji)}</span>
      <span class="intro-hint">Complete a frase</span>
      <div class="cloze-sentence" id="cloze-sentence">${withGap("")}</div>
      <div class="build-tiles" id="cloze-options"></div>
      <div class="write-feedback" id="game-feedback"></div>
    </div>`;
  const wrap = document.getElementById("cloze-options");
  const feedback = document.getElementById("game-feedback");
  options.forEach((opt) => {
    const btn = document.createElement("button");
    btn.className = "build-tile word-tile";
    btn.textContent = opt;
    btn.addEventListener("click", () => {
      if (choiceLocked || btn.disabled) return;
      if (opt === answer) {
        document.getElementById("cloze-sentence").innerHTML = withGap(answer);
        feedback.textContent = "🌟 Isso!";
        speak(item.en, item.id);
        finishGameRound(item);
      } else {
        wrongAttemptsThisRound++;
        btn.disabled = true;
        playGentle();
        shakeEl(btn);
        // Depois do erro, a tradução da frase aparece como apoio (o sentido ajuda a achar a palavra).
        feedback.innerHTML = `Quase! A frase quer dizer: <i>${escapeHtml(item.pt)}</i>`;
      }
    });
    wrap.appendChild(btn);
  });
}

// ===================== Minigames do André (engine.js: segmentGraphemes, misspellingsFor...) =====================
// Três jogos de ortografia por som, em inglês. Contam como prática no SRS (acerto de primeira =
// recordResult(true)); erro nunca pune além disso, sempre dá pra terminar (scaffolding). Sem
// pontos/XP (LEARNING_PHILOSOPHY.md §29, §46) — a recompensa é a palavra montada + as estrelas do
// fim, iguais às do resto do app.
function gameHead(item) {
  return `<span class="word-emoji-big dictation-media">${emojiHtml(item.emoji)}</span>
          <button class="big-btn listen-btn" id="game-listen">${icon("sound")} Listen</button>`;
}
function finishGameRound(item) {
  choiceLocked = true;
  playCheer();
  recordResult(item.id, wrongAttemptsThisRound === 0);
  if (wrongAttemptsThisRound === 0) quizScore.correct++;
  quizScore.total++;
  setTimeout(() => {
    quizIndex++;
    renderRound();
  }, 1100);
}
function shakeEl(el) {
  el.style.animation = "none";
  void el.offsetWidth;
  el.style.animation = "shake 0.4s";
}

function renderSpellingGameRound(round, container, repeatBtn) {
  const item = round.item;
  const word = normalizeAnswer(item.en);
  repeatBtn.style.display = "none";
  wrongAttemptsThisRound = 0;
  choiceLocked = false;

  if (round.roundType === "build") {
    // 🧱 Build it: blocos de SOM (s·ch·oo·l), misturados com as grafias que soam igual (u, k).
    const gs = segmentGraphemes(word);
    const distractors = [];
    shuffle(gs.filter((g) => alternatesFor(g).length)).forEach((g) => {
      alternatesFor(g).forEach((alt) => {
        if (distractors.length < 3 && !gs.includes(alt) && !distractors.includes(alt)) distractors.push(alt);
      });
    });
    const tiles = shuffle([...gs.map((g, i) => ({ g, i })), ...distractors.map((g) => ({ g, i: -1 }))]);
    container.innerHTML = `
      <div class="write-card">
        ${gameHead(item)}
        <span class="intro-hint">Build the word with sound blocks</span>
        <div class="build-slots" id="build-slots">${gs.map(() => `<span class="build-slot"></span>`).join("")}</div>
        <div class="build-tiles" id="build-tiles"></div>
        <div class="write-feedback" id="game-feedback"></div>
      </div>`;
    let next = 0;
    const slots = document.getElementById("build-slots").children;
    const tilesWrap = document.getElementById("build-tiles");
    const feedback = document.getElementById("game-feedback");
    tiles.forEach((t) => {
      const btn = document.createElement("button");
      btn.className = "build-tile";
      btn.textContent = t.g;
      btn.addEventListener("click", () => {
        if (choiceLocked || btn.disabled) return;
        if (t.g === gs[next]) {
          slots[next].textContent = t.g;
          slots[next].classList.add("filled");
          btn.disabled = true;
          next++;
          feedback.textContent = "";
          if (next === gs.length) {
            feedback.textContent = "🌟 You built it!";
            speak(item.en, item.id);
            finishGameRound(item);
          }
        } else {
          wrongAttemptsThisRound++;
          playGentle();
          shakeEl(btn);
          // Não vai pro registro de erros de grafia: tocar num bloco errado é muitas vezes só um
          // toque ao acaso, não uma grafia que ele acredita ser a certa (poluiria o relatório dos
          // pais e as opções do "Which one is right?").
          // Depois de 2 erros no mesmo pedaço, o bloco certo pisca (menor passo pra seguir).
          if (wrongAttemptsThisRound >= 2) {
            const right = [...tilesWrap.children].find((b) => !b.disabled && b.textContent === gs[next]);
            if (right) right.classList.add("hint");
            feedback.textContent = `Listen again: the next sound is spelled "${gs[next]}"`;
          } else {
            feedback.textContent = "Almost! Listen again and try another block.";
          }
          speak(item.en, item.id);
        }
      });
      tilesWrap.appendChild(btn);
    });
  } else if (round.roundType === "pick_spelling") {
    // 🔍 Which one is right?: a certa + erros REAIS dele (ou trocas plausíveis de um som).
    const options = shuffle([word, ...misspellingsFor(item, 2)]);
    container.innerHTML = `
      <div class="write-card">
        ${gameHead(item)}
        <span class="intro-hint">Which one is spelled right?</span>
        <div class="situation-options" id="pick-options"></div>
        <div class="write-feedback" id="game-feedback"></div>
      </div>`;
    const wrap = document.getElementById("pick-options");
    const feedback = document.getElementById("game-feedback");
    options.forEach((opt) => {
      const btn = document.createElement("button");
      btn.className = "quiz-option situation-option spelling-option";
      btn.textContent = opt;
      btn.addEventListener("click", () => {
        if (choiceLocked || btn.disabled) return;
        if (opt === word) {
          btn.classList.add("correct");
          feedback.textContent = "🌟 Yes!";
          finishGameRound(item);
        } else {
          wrongAttemptsThisRound++;
          btn.classList.add("wrong");
          btn.disabled = true;
          playGentle();
          const analysis = analyzeSpelling(item, opt);
          if (isImmersion()) logSpellingMistake(analysis, item);
          feedback.innerHTML = renderTipsHtml(analysis, item) || "Almost! Try again.";
        }
      });
      wrap.appendChild(btn);
    });
  } else {
    // 🕳️ Missing sound: a palavra com um pedaço faltando (de preferência um padrão em que ele erra).
    const { graphemes, gapIndex, options } = missingSoundPuzzle(item);
    const renderWord = (fill) =>
      graphemes.map((g, i) => (i === gapIndex ? `<span class="gap${fill ? " filled" : ""}">${fill || "?"}</span>` : escapeHtml(g))).join("");
    container.innerHTML = `
      <div class="write-card">
        ${gameHead(item)}
        <span class="intro-hint">Which sound is missing?</span>
        <div class="gap-word" id="gap-word">${renderWord("")}</div>
        <div class="build-tiles" id="gap-options"></div>
        <div class="write-feedback" id="game-feedback"></div>
      </div>`;
    const wrap = document.getElementById("gap-options");
    const feedback = document.getElementById("game-feedback");
    options.forEach((opt) => {
      const btn = document.createElement("button");
      btn.className = "build-tile";
      btn.textContent = opt;
      btn.addEventListener("click", () => {
        if (choiceLocked || btn.disabled) return;
        if (opt === graphemes[gapIndex]) {
          document.getElementById("gap-word").innerHTML = renderWord(opt);
          feedback.textContent = "🌟 That's it!";
          speak(item.en, item.id);
          finishGameRound(item);
        } else {
          wrongAttemptsThisRound++;
          btn.disabled = true;
          playGentle();
          shakeEl(btn);
          const typed = graphemes.map((g, i) => (i === gapIndex ? opt : g)).join("");
          const analysis = analyzeSpelling(item, typed);
          if (isImmersion()) logSpellingMistake(analysis, item);
          feedback.innerHTML = renderTipsHtml(analysis, item) || "Almost! Listen again.";
          speak(item.en, item.id);
        }
      });
      wrap.appendChild(btn);
    });
  }
  document.getElementById("game-listen").addEventListener("click", () => speak(item.en, item.id));
  speak(item.en, item.id);
}

// Tela "Word Games" (Home do André): cada jogo é uma rodada curta de 8 palavras, escolhidas pelo
// motor (as que ele mais erra / estão vencidas / têm os padrões em que mais erra).
const SPELLING_GAMES = [
  { type: "build", icon: "blocks", name: "Build it", desc: "Listen and build the word with sound blocks" },
  { type: "pick_spelling", icon: "search", name: "Which one is right?", desc: "Find the word that is spelled right" },
  { type: "missing_sound", icon: "gap", name: "Missing sound", desc: "Choose the sound that is missing" },
];
function renderGamesScreen() {
  const el = document.getElementById("games-list");
  el.innerHTML = SPELLING_GAMES.map(
    (g) => `<button class="game-card" data-game="${g.type}">
      <span class="game-icon">${icon(g.icon)}</span>
      <span class="game-txt"><b>${g.name}</b><small>${g.desc}</small></span>
      ${icon("play")}
    </button>`
  ).join("");
  el.querySelectorAll(".game-card").forEach((btn) =>
    btn.addEventListener("click", () => {
      const type = btn.dataset.game;
      const items = selectGameItems(8, type !== "pick_spelling");
      if (!items.length) return;
      quizReturnScreen = "games";
      startQuiz(items.map((it) => ({ item: it, roundType: type })));
    })
  );
}
document.getElementById("btn-games").addEventListener("click", () => {
  renderGamesScreen();
  showScreen("games");
});

// ===================== Dicionário do adulto (ADULT_DICTIONARY, data.js) =====================
// Palavras difíceis ficam sublinhadas nas frases (intro e "meaning"); tocar abre o verbete:
// definição em inglês simples + tradução + áudio + uma frase da própria trilha como exemplo.
// Também tem a tela "Dictionary" (Home do adulto) com tudo em ordem alfabética e busca.
// Consultar não mexe no SRS: é apoio pra entender (scaffolding), não resposta avaliada.
function dictLinkedHtml(text) {
  if (getActiveProfile().mode !== "adult") return escapeHtml(text);
  const hits = findDictionaryTerms(text);
  let html = "", pos = 0;
  hits.forEach((h) => {
    html += escapeHtml(text.slice(pos, h.start));
    html += `<button type="button" class="dict-word" data-term="${escapeHtml(h.entry.term)}">${escapeHtml(text.slice(h.start, h.end))}</button>`;
    pos = h.end;
  });
  return html + escapeHtml(text.slice(pos));
}
function dictEntryByTerm(term) {
  return ADULT_DICTIONARY.find((e) => e.term === term);
}
function openDictionaryEntry(entry, excludeItemId, speakTerm = true) {
  // Se a única frase de exemplo é a própria frase da rodada, não mostra: a tradução dela entregaria
  // a resposta do round "meaning".
  let example = dictionaryExample(entry, excludeItemId);
  if (example && excludeItemId && example.id === excludeItemId) example = null;
  document.getElementById("dict-sheet-body").innerHTML = `
    <div class="dict-head">
      <span class="dict-term" id="dict-sheet-term">${escapeHtml(entry.term)}</span>
      <button class="dict-audio" id="dict-say" aria-label="Ouvir">${icon("sound")}</button>
    </div>
    <div class="dict-pos">${escapeHtml(entry.pos)}</div>
    <p class="dict-def">${escapeHtml(entry.def)}</p>
    <p class="dict-pt">🇧🇷 ${escapeHtml(entry.pt)}</p>
    ${
      example
        ? `<button class="dict-example" id="dict-example">
             <span class="dict-example-label">${icon("sound")} Exemplo</span>
             <span class="dict-example-en">${escapeHtml(example.en)}</span>
             <span class="dict-example-pt">${escapeHtml(example.pt)}</span>
           </button>`
        : ""
    }`;
  const sayTerm = () => speak(entry.term, `dict_${dictSlug(entry.term)}`);
  document.getElementById("dict-say").addEventListener("click", sayTerm);
  if (example) document.getElementById("dict-example").addEventListener("click", () => speak(example.en, example.id));
  document.getElementById("dict-sheet").hidden = false;
  if (speakTerm) sayTerm();
}
function closeDictionaryEntry() {
  document.getElementById("dict-sheet").hidden = true;
}
document.querySelectorAll("[data-dict-close]").forEach((el) => el.addEventListener("click", closeDictionaryEntry));
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") closeDictionaryEntry();
});
// Delegação: as palavras sublinhadas são recriadas a cada rodada.
document.addEventListener("click", (e) => {
  const btn = e.target.closest(".dict-word");
  if (!btn) return;
  e.stopPropagation();
  const entry = dictEntryByTerm(btn.dataset.term);
  const round = quizQueue[quizIndex];
  if (entry) openDictionaryEntry(entry, round ? round.item.id : null);
});

function renderDictionaryList() {
  const q = normalizeAnswer(document.getElementById("dict-search").value || "");
  const entries = [...ADULT_DICTIONARY]
    .sort((a, b) => a.term.localeCompare(b.term, "en", { sensitivity: "base" }))
    .filter((e) => !q || normalizeAnswer(e.term).includes(q) || normalizeAnswer(e.pt).includes(q) || (e.forms || []).some((f) => normalizeAnswer(f).includes(q)));
  const list = document.getElementById("dict-list");
  list.innerHTML = entries.length
    ? entries
        .map(
          (e) => `<button class="dict-row" data-term="${escapeHtml(e.term)}">
            <span class="dict-row-term">${escapeHtml(e.term)}</span>
            <span class="dict-row-pt">${escapeHtml(e.pt)}</span>
          </button>`
        )
        .join("")
    : `<div class="empty">Nenhuma palavra encontrada.</div>`;
  list.querySelectorAll(".dict-row").forEach((row) =>
    row.addEventListener("click", () => openDictionaryEntry(dictEntryByTerm(row.dataset.term), null))
  );
}
document.getElementById("dict-search").addEventListener("input", renderDictionaryList);
document.getElementById("btn-dictionary").addEventListener("click", () => {
  document.getElementById("dict-search").value = "";
  renderDictionaryList();
  showScreen("dictionary");
});

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

// Vocabulário do app - currículo em camadas
// emoji = "imagem", en = palavra/frase em inglês (o que a criança ouve), pt = apoio para os pais
//
// Camada 0: sobrevivência escolar (prioridade máxima na repetição espaçada)
// Camada 1: vocabulário receptivo por categoria (CATEGORIES)
// Camada 2: combinações curtas de 2-3 palavras, reaproveitando vocabulário já visto
// Camada 3: frases funcionais mais completas para a sala de aula

const TIER0_SURVIVAL = [
  { en: "hello", pt: "olá", emoji: "👋" },
  { en: "bye bye", pt: "tchau", emoji: "👋" },
  { en: "please", pt: "por favor", emoji: "🙏" },
  { en: "thank you", pt: "obrigado", emoji: "🙏" },
  { en: "yes", pt: "sim", emoji: "👍" },
  { en: "no", pt: "não", emoji: "👎" },
  { en: "help", pt: "ajuda", emoji: "🆘" },
  { en: "bathroom", pt: "banheiro", emoji: "🚻" },
  { en: "water", pt: "água", emoji: "💧" },
  { en: "my name is", pt: "meu nome é", emoji: "🙋" },
];

const CATEGORIES = [
  {
    id: "colors",
    namePt: "Cores",
    icon: "🎨",
    color: "#FF6B6B",
    words: [
      { en: "red", pt: "vermelho", emoji: "🔴" },
      { en: "blue", pt: "azul", emoji: "🔵" },
      { en: "yellow", pt: "amarelo", emoji: "🟡" },
      { en: "green", pt: "verde", emoji: "🟢" },
      { en: "orange", pt: "laranja", emoji: "🟠" },
      { en: "purple", pt: "roxo", emoji: "🟣" },
      { en: "black", pt: "preto", emoji: "⚫" },
      { en: "white", pt: "branco", emoji: "⚪" },
      { en: "brown", pt: "marrom", emoji: "🟤" },
      { en: "pink", pt: "rosa", emoji: "💗" },
    ],
  },
  {
    id: "numbers",
    namePt: "Números",
    icon: "🔢",
    color: "#4ECDC4",
    words: [
      { en: "one", pt: "um", emoji: "1️⃣" },
      { en: "two", pt: "dois", emoji: "2️⃣" },
      { en: "three", pt: "três", emoji: "3️⃣" },
      { en: "four", pt: "quatro", emoji: "4️⃣" },
      { en: "five", pt: "cinco", emoji: "5️⃣" },
      { en: "six", pt: "seis", emoji: "6️⃣" },
      { en: "seven", pt: "sete", emoji: "7️⃣" },
      { en: "eight", pt: "oito", emoji: "8️⃣" },
      { en: "nine", pt: "nove", emoji: "9️⃣" },
      { en: "ten", pt: "dez", emoji: "🔟" },
    ],
  },
  {
    id: "shapes",
    namePt: "Formas",
    icon: "🔺",
    color: "#FFD93D",
    words: [
      { en: "circle", pt: "círculo", emoji: "⭕" },
      { en: "square", pt: "quadrado", emoji: "⬛" },
      { en: "triangle", pt: "triângulo", emoji: "🔺" },
      { en: "star", pt: "estrela", emoji: "⭐" },
      { en: "heart", pt: "coração", emoji: "❤️" },
      { en: "diamond", pt: "losango", emoji: "🔶" },
    ],
  },
  {
    id: "animals",
    namePt: "Animais",
    icon: "🐶",
    color: "#95E1D3",
    words: [
      { en: "dog", pt: "cachorro", emoji: "🐶" },
      { en: "cat", pt: "gato", emoji: "🐱" },
      { en: "bird", pt: "pássaro", emoji: "🐦" },
      { en: "fish", pt: "peixe", emoji: "🐟" },
      { en: "rabbit", pt: "coelho", emoji: "🐰" },
      { en: "lion", pt: "leão", emoji: "🦁" },
      { en: "elephant", pt: "elefante", emoji: "🐘" },
      { en: "bear", pt: "urso", emoji: "🐻" },
      { en: "duck", pt: "pato", emoji: "🦆" },
      { en: "frog", pt: "sapo", emoji: "🐸" },
    ],
  },
  {
    id: "food",
    namePt: "Comida",
    icon: "🍎",
    color: "#F38181",
    words: [
      { en: "apple", pt: "maçã", emoji: "🍎" },
      { en: "banana", pt: "banana", emoji: "🍌" },
      { en: "milk", pt: "leite", emoji: "🥛" },
      { en: "bread", pt: "pão", emoji: "🍞" },
      { en: "water", pt: "água", emoji: "💧" },
      { en: "egg", pt: "ovo", emoji: "🥚" },
      { en: "cheese", pt: "queijo", emoji: "🧀" },
      { en: "grapes", pt: "uvas", emoji: "🍇" },
      { en: "cookie", pt: "biscoito", emoji: "🍪" },
      { en: "orange", pt: "laranja (fruta)", emoji: "🍊" },
    ],
  },
  {
    id: "body",
    namePt: "Corpo",
    icon: "🧑",
    color: "#AA96DA",
    words: [
      { en: "eyes", pt: "olhos", emoji: "👀" },
      { en: "nose", pt: "nariz", emoji: "👃" },
      { en: "mouth", pt: "boca", emoji: "👄" },
      { en: "ear", pt: "orelha", emoji: "👂" },
      { en: "hand", pt: "mão", emoji: "✋" },
      { en: "foot", pt: "pé", emoji: "🦶" },
      { en: "hair", pt: "cabelo", emoji: "💇" },
      { en: "tooth", pt: "dente", emoji: "🦷" },
    ],
  },
  {
    id: "family",
    namePt: "Família",
    icon: "👨‍👩‍👧",
    color: "#FCBAD3",
    words: [
      { en: "mom", pt: "mãe", emoji: "👩" },
      { en: "dad", pt: "pai", emoji: "👨" },
      { en: "baby", pt: "bebê", emoji: "👶" },
      { en: "sister", pt: "irmã", emoji: "👧" },
      { en: "brother", pt: "irmão", emoji: "👦" },
      { en: "grandma", pt: "vovó", emoji: "👵" },
      { en: "grandpa", pt: "vovô", emoji: "👴" },
    ],
  },
  {
    id: "clothes",
    namePt: "Roupas",
    icon: "👕",
    color: "#A8D8EA",
    words: [
      { en: "shirt", pt: "camiseta", emoji: "👕" },
      { en: "pants", pt: "calça", emoji: "👖" },
      { en: "shoes", pt: "sapatos", emoji: "👟" },
      { en: "socks", pt: "meias", emoji: "🧦" },
      { en: "hat", pt: "boné", emoji: "🧢" },
      { en: "jacket", pt: "jaqueta", emoji: "🧥" },
    ],
  },
  {
    id: "school",
    namePt: "Escola",
    icon: "🎒",
    color: "#FFAAA6",
    words: [
      { en: "book", pt: "livro", emoji: "📖" },
      { en: "pencil", pt: "lápis", emoji: "✏️" },
      { en: "backpack", pt: "mochila", emoji: "🎒" },
      { en: "scissors", pt: "tesoura", emoji: "✂️" },
      { en: "crayon", pt: "giz de cera", emoji: "🖍️" },
      { en: "chair", pt: "cadeira", emoji: "🪑" },
      { en: "ball", pt: "bola", emoji: "⚽" },
      { en: "glue", pt: "cola", emoji: "🧴" },
    ],
  },
];

// Camada 2 — combinações curtas, curadas à mão (evita frases estranhas de geração automática).
// Reaproveita só vocabulário que já existe em CATEGORIES/TIER0, para reforçar o que já foi visto.
const TIER2_COMBOS = [
  { en: "red apple", pt: "maçã vermelha", emoji: "🔴🍎" },
  { en: "blue shoes", pt: "sapatos azuis", emoji: "🔵👟" },
  { en: "green shirt", pt: "camiseta verde", emoji: "🟢👕" },
  { en: "yellow banana", pt: "banana amarela", emoji: "🟡🍌" },
  { en: "black cat", pt: "gato preto", emoji: "⚫🐱" },
  { en: "white rabbit", pt: "coelho branco", emoji: "⚪🐰" },
  { en: "brown bear", pt: "urso marrom", emoji: "🟤🐻" },
  { en: "purple grapes", pt: "uvas roxas", emoji: "🟣🍇" },
  { en: "orange fish", pt: "peixe laranja", emoji: "🟠🐟" },
  { en: "I want water", pt: "eu quero água", emoji: "🙋💧" },
  { en: "I want milk", pt: "eu quero leite", emoji: "🙋🥛" },
  { en: "I like dogs", pt: "eu gosto de cachorros", emoji: "❤️🐶" },
  { en: "I like cats", pt: "eu gosto de gatos", emoji: "❤️🐱" },
  { en: "thank you mom", pt: "obrigado mãe", emoji: "🙏👩" },
  { en: "thank you dad", pt: "obrigado pai", emoji: "🙏👨" },
];

// Camada 3 — frases funcionais completas para o dia a dia escolar.
const TIER3_SENTENCES = [
  { en: "Can I go to the bathroom, please?", pt: "posso ir ao banheiro, por favor?", emoji: "🚻🙏" },
  { en: "Can you help me, please?", pt: "você pode me ajudar, por favor?", emoji: "🆘🙏" },
  { en: "I don't understand", pt: "eu não entendo", emoji: "🤷" },
  { en: "What is your name?", pt: "qual é o seu nome?", emoji: "🙋❓" },
  { en: "I am hungry", pt: "eu estou com fome", emoji: "🍽️" },
  { en: "I am thirsty", pt: "eu estou com sede", emoji: "🥤" },
  { en: "Excuse me", pt: "com licença", emoji: "🙋" },
  { en: "Can I have some water, please?", pt: "posso tomar água, por favor?", emoji: "💧🙏" },
];

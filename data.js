// ===================== CONTENT (dados puros, sem estado de aprendizagem) =====================
// Cada item: id estável, contentType (word|phrase|sentence), en/pt, imagem, category (pra navegação
// livre), difficulty (1-5, intrínseco ao conteúdo) e prerequisites (outros ids que ajudam a "decompor"
// o item quando ele está sendo difícil demais). learningStage NÃO mora aqui — é derivado do progresso
// (engine.js), porque é sobre o aluno, não sobre o conteúdo.

const CATEGORY_META = {
  survival: { namePt: "Sobrevivência", icon: "🚸", color: "#FF8FA3" },
  colors: { namePt: "Cores", icon: "🎨", color: "#FF6B6B" },
  numbers: { namePt: "Números", icon: "🔢", color: "#4ECDC4" },
  shapes: { namePt: "Formas", icon: "🔺", color: "#FFD93D" },
  animals: { namePt: "Animais", icon: "🐶", color: "#95E1D3" },
  food: { namePt: "Comida", icon: "🍎", color: "#F38181" },
  body: { namePt: "Corpo", icon: "🧑", color: "#AA96DA" },
  family: { namePt: "Família", icon: "👨‍👩‍👧", color: "#FCBAD3" },
  clothes: { namePt: "Roupas", icon: "👕", color: "#A8D8EA" },
  school: { namePt: "Escola", icon: "🎒", color: "#FFAAA6" },
  combos: { namePt: "Combinações", icon: "🧩", color: "#C9A7EB" },
  phrases: { namePt: "Frases do dia a dia", icon: "💬", color: "#8AC6D1" },
};

const CONTENT = [
  // ---- survival (sobrevivência escolar) ----
  { id: "survival_hello", contentType: "word", en: "hello", pt: "olá", emoji: "👋", category: "survival", difficulty: 1, prerequisites: [] },
  { id: "survival_bye_bye", contentType: "phrase", en: "bye bye", pt: "tchau", emoji: "👋", category: "survival", difficulty: 2, prerequisites: [] },
  { id: "survival_please", contentType: "word", en: "please", pt: "por favor", emoji: "🙏", category: "survival", difficulty: 1, prerequisites: [] },
  { id: "survival_thank_you", contentType: "phrase", en: "thank you", pt: "obrigado", emoji: "🙏", category: "survival", difficulty: 2, prerequisites: [] },
  { id: "survival_yes", contentType: "word", en: "yes", pt: "sim", emoji: "👍", category: "survival", difficulty: 1, prerequisites: [] },
  { id: "survival_no", contentType: "word", en: "no", pt: "não", emoji: "👎", category: "survival", difficulty: 1, prerequisites: [] },
  { id: "survival_help", contentType: "word", en: "help", pt: "ajuda", emoji: "🆘", category: "survival", difficulty: 1, prerequisites: [] },
  { id: "survival_bathroom", contentType: "word", en: "bathroom", pt: "banheiro", emoji: "🚻", category: "survival", difficulty: 1, prerequisites: [] },
  { id: "survival_water", contentType: "word", en: "water", pt: "água", emoji: "💧", category: "survival", difficulty: 1, prerequisites: [] },
  { id: "survival_my_name_is", contentType: "phrase", en: "my name is", pt: "meu nome é", emoji: "🙋", category: "survival", difficulty: 2, prerequisites: [] },
  { id: "survival_go_to_the_bathroom", contentType: "phrase", en: "go to the bathroom", pt: "ir ao banheiro", emoji: "🚻", category: "survival", difficulty: 2, prerequisites: ["survival_bathroom"] },

  // ---- colors ----
  { id: "colors_red", contentType: "word", en: "red", pt: "vermelho", emoji: "🔴", category: "colors", difficulty: 1, prerequisites: [] },
  { id: "colors_blue", contentType: "word", en: "blue", pt: "azul", emoji: "🔵", category: "colors", difficulty: 1, prerequisites: [] },
  { id: "colors_yellow", contentType: "word", en: "yellow", pt: "amarelo", emoji: "🟡", category: "colors", difficulty: 1, prerequisites: [] },
  { id: "colors_green", contentType: "word", en: "green", pt: "verde", emoji: "🟢", category: "colors", difficulty: 1, prerequisites: [] },
  { id: "colors_orange", contentType: "word", en: "orange", pt: "laranja", emoji: "🟠", category: "colors", difficulty: 1, prerequisites: [] },
  { id: "colors_purple", contentType: "word", en: "purple", pt: "roxo", emoji: "🟣", category: "colors", difficulty: 1, prerequisites: [] },
  { id: "colors_black", contentType: "word", en: "black", pt: "preto", emoji: "⚫", category: "colors", difficulty: 1, prerequisites: [] },
  { id: "colors_white", contentType: "word", en: "white", pt: "branco", emoji: "⚪", category: "colors", difficulty: 1, prerequisites: [] },
  { id: "colors_brown", contentType: "word", en: "brown", pt: "marrom", emoji: "🟤", category: "colors", difficulty: 1, prerequisites: [] },
  { id: "colors_pink", contentType: "word", en: "pink", pt: "rosa", emoji: "💗", category: "colors", difficulty: 1, prerequisites: [] },

  // ---- numbers ----
  { id: "numbers_one", contentType: "word", en: "one", pt: "um", emoji: "1️⃣", category: "numbers", difficulty: 1, prerequisites: [] },
  { id: "numbers_two", contentType: "word", en: "two", pt: "dois", emoji: "2️⃣", category: "numbers", difficulty: 1, prerequisites: [] },
  { id: "numbers_three", contentType: "word", en: "three", pt: "três", emoji: "3️⃣", category: "numbers", difficulty: 1, prerequisites: [] },
  { id: "numbers_four", contentType: "word", en: "four", pt: "quatro", emoji: "4️⃣", category: "numbers", difficulty: 1, prerequisites: [] },
  { id: "numbers_five", contentType: "word", en: "five", pt: "cinco", emoji: "5️⃣", category: "numbers", difficulty: 1, prerequisites: [] },
  { id: "numbers_six", contentType: "word", en: "six", pt: "seis", emoji: "6️⃣", category: "numbers", difficulty: 1, prerequisites: [] },
  { id: "numbers_seven", contentType: "word", en: "seven", pt: "sete", emoji: "7️⃣", category: "numbers", difficulty: 1, prerequisites: [] },
  { id: "numbers_eight", contentType: "word", en: "eight", pt: "oito", emoji: "8️⃣", category: "numbers", difficulty: 1, prerequisites: [] },
  { id: "numbers_nine", contentType: "word", en: "nine", pt: "nove", emoji: "9️⃣", category: "numbers", difficulty: 1, prerequisites: [] },
  { id: "numbers_ten", contentType: "word", en: "ten", pt: "dez", emoji: "🔟", category: "numbers", difficulty: 1, prerequisites: [] },

  // ---- shapes ----
  { id: "shapes_circle", contentType: "word", en: "circle", pt: "círculo", emoji: "⭕", category: "shapes", difficulty: 1, prerequisites: [] },
  { id: "shapes_square", contentType: "word", en: "square", pt: "quadrado", emoji: "⬛", category: "shapes", difficulty: 1, prerequisites: [] },
  { id: "shapes_triangle", contentType: "word", en: "triangle", pt: "triângulo", emoji: "🔺", category: "shapes", difficulty: 1, prerequisites: [] },
  { id: "shapes_star", contentType: "word", en: "star", pt: "estrela", emoji: "⭐", category: "shapes", difficulty: 1, prerequisites: [] },
  { id: "shapes_heart", contentType: "word", en: "heart", pt: "coração", emoji: "❤️", category: "shapes", difficulty: 1, prerequisites: [] },
  { id: "shapes_diamond", contentType: "word", en: "diamond", pt: "losango", emoji: "🔶", category: "shapes", difficulty: 1, prerequisites: [] },

  // ---- animals ----
  { id: "animals_dog", contentType: "word", image: "assets/images/animals_dog.jpg", en: "dog", pt: "cachorro", emoji: "🐶", category: "animals", difficulty: 1, prerequisites: [] },
  { id: "animals_cat", contentType: "word", image: "assets/images/animals_cat.jpg", en: "cat", pt: "gato", emoji: "🐱", category: "animals", difficulty: 1, prerequisites: [] },
  { id: "animals_bird", contentType: "word", image: "assets/images/animals_bird.jpg", en: "bird", pt: "pássaro", emoji: "🐦", category: "animals", difficulty: 1, prerequisites: [] },
  { id: "animals_fish", contentType: "word", image: "assets/images/animals_fish.jpg", en: "fish", pt: "peixe", emoji: "🐟", category: "animals", difficulty: 1, prerequisites: [] },
  { id: "animals_rabbit", contentType: "word", image: "assets/images/animals_rabbit.jpg", en: "rabbit", pt: "coelho", emoji: "🐰", category: "animals", difficulty: 1, prerequisites: [] },
  { id: "animals_lion", contentType: "word", image: "assets/images/animals_lion.jpg", en: "lion", pt: "leão", emoji: "🦁", category: "animals", difficulty: 1, prerequisites: [] },
  { id: "animals_elephant", contentType: "word", image: "assets/images/animals_elephant.jpg", en: "elephant", pt: "elefante", emoji: "🐘", category: "animals", difficulty: 1, prerequisites: [] },
  { id: "animals_bear", contentType: "word", image: "assets/images/animals_bear.jpg", en: "bear", pt: "urso", emoji: "🐻", category: "animals", difficulty: 1, prerequisites: [] },
  { id: "animals_duck", contentType: "word", image: "assets/images/animals_duck.jpg", en: "duck", pt: "pato", emoji: "🦆", category: "animals", difficulty: 1, prerequisites: [] },
  { id: "animals_frog", contentType: "word", image: "assets/images/animals_frog.jpg", en: "frog", pt: "sapo", emoji: "🐸", category: "animals", difficulty: 1, prerequisites: [] },

  // ---- food ----
  { id: "food_apple", contentType: "word", image: "assets/images/food_apple.jpg", en: "apple", pt: "maçã", emoji: "🍎", category: "food", difficulty: 1, prerequisites: [] },
  { id: "food_banana", contentType: "word", image: "assets/images/food_banana.jpg", en: "banana", pt: "banana", emoji: "🍌", category: "food", difficulty: 1, prerequisites: [] },
  { id: "food_milk", contentType: "word", image: "assets/images/food_milk.jpg", en: "milk", pt: "leite", emoji: "🥛", category: "food", difficulty: 1, prerequisites: [] },
  { id: "food_bread", contentType: "word", image: "assets/images/food_bread.jpg", en: "bread", pt: "pão", emoji: "🍞", category: "food", difficulty: 1, prerequisites: [] },
  { id: "food_water", contentType: "word", image: "assets/images/food_water.jpg", en: "water", pt: "água", emoji: "💧", category: "food", difficulty: 1, prerequisites: [] },
  { id: "food_egg", contentType: "word", image: "assets/images/food_egg.jpg", en: "egg", pt: "ovo", emoji: "🥚", category: "food", difficulty: 1, prerequisites: [] },
  { id: "food_cheese", contentType: "word", image: "assets/images/food_cheese.jpg", en: "cheese", pt: "queijo", emoji: "🧀", category: "food", difficulty: 1, prerequisites: [] },
  { id: "food_grapes", contentType: "word", image: "assets/images/food_grapes.jpg", en: "grapes", pt: "uvas", emoji: "🍇", category: "food", difficulty: 1, prerequisites: [] },
  { id: "food_cookie", contentType: "word", image: "assets/images/food_cookie.jpg", en: "cookie", pt: "biscoito", emoji: "🍪", category: "food", difficulty: 1, prerequisites: [] },
  { id: "food_orange", contentType: "word", image: "assets/images/food_orange.jpg", en: "orange", pt: "laranja (fruta)", emoji: "🍊", category: "food", difficulty: 1, prerequisites: [] },

  // ---- body ----
  { id: "body_eyes", contentType: "word", image: "assets/images/body_eyes.jpg", en: "eyes", pt: "olhos", emoji: "👀", category: "body", difficulty: 1, prerequisites: [] },
  { id: "body_nose", contentType: "word", image: "assets/images/body_nose.jpg", en: "nose", pt: "nariz", emoji: "👃", category: "body", difficulty: 1, prerequisites: [] },
  { id: "body_mouth", contentType: "word", image: "assets/images/body_mouth.jpg", en: "mouth", pt: "boca", emoji: "👄", category: "body", difficulty: 1, prerequisites: [] },
  { id: "body_ear", contentType: "word", en: "ear", pt: "orelha", emoji: "👂", category: "body", difficulty: 1, prerequisites: [] },
  { id: "body_hand", contentType: "word", en: "hand", pt: "mão", emoji: "✋", category: "body", difficulty: 1, prerequisites: [] },
  { id: "body_foot", contentType: "word", en: "foot", pt: "pé", emoji: "🦶", category: "body", difficulty: 1, prerequisites: [] },
  { id: "body_hair", contentType: "word", en: "hair", pt: "cabelo", emoji: "💇", category: "body", difficulty: 1, prerequisites: [] },
  { id: "body_tooth", contentType: "word", image: "assets/images/body_tooth.jpg", en: "tooth", pt: "dente", emoji: "🦷", category: "body", difficulty: 1, prerequisites: [] },

  // ---- family ----
  { id: "family_mom", contentType: "word", en: "mom", pt: "mãe", emoji: "👩", category: "family", difficulty: 1, prerequisites: [] },
  { id: "family_dad", contentType: "word", en: "dad", pt: "pai", emoji: "👨", category: "family", difficulty: 1, prerequisites: [] },
  { id: "family_baby", contentType: "word", en: "baby", pt: "bebê", emoji: "👶", category: "family", difficulty: 1, prerequisites: [] },
  { id: "family_sister", contentType: "word", en: "sister", pt: "irmã", emoji: "👧", category: "family", difficulty: 1, prerequisites: [] },
  { id: "family_brother", contentType: "word", en: "brother", pt: "irmão", emoji: "👦", category: "family", difficulty: 1, prerequisites: [] },
  { id: "family_grandma", contentType: "word", en: "grandma", pt: "vovó", emoji: "👵", category: "family", difficulty: 1, prerequisites: [] },
  { id: "family_grandpa", contentType: "word", image: "assets/images/family_grandpa.jpg", en: "grandpa", pt: "vovô", emoji: "👴", category: "family", difficulty: 1, prerequisites: [] },

  // ---- clothes ----
  { id: "clothes_shirt", contentType: "word", image: "assets/images/clothes_shirt.jpg", en: "shirt", pt: "camiseta", emoji: "👕", category: "clothes", difficulty: 1, prerequisites: [] },
  { id: "clothes_pants", contentType: "word", en: "pants", pt: "calça", emoji: "👖", category: "clothes", difficulty: 1, prerequisites: [] },
  { id: "clothes_shoes", contentType: "word", en: "shoes", pt: "sapatos", emoji: "👟", category: "clothes", difficulty: 1, prerequisites: [] },
  { id: "clothes_socks", contentType: "word", image: "assets/images/clothes_socks.jpg", en: "socks", pt: "meias", emoji: "🧦", category: "clothes", difficulty: 1, prerequisites: [] },
  { id: "clothes_hat", contentType: "word", en: "hat", pt: "boné", emoji: "🧢", category: "clothes", difficulty: 1, prerequisites: [] },
  { id: "clothes_jacket", contentType: "word", en: "jacket", pt: "jaqueta", emoji: "🧥", category: "clothes", difficulty: 1, prerequisites: [] },

  // ---- school ----
  { id: "school_book", contentType: "word", en: "book", pt: "livro", emoji: "📖", category: "school", difficulty: 1, prerequisites: [] },
  { id: "school_pencil", contentType: "word", image: "assets/images/school_pencil.jpg", en: "pencil", pt: "lápis", emoji: "✏️", category: "school", difficulty: 1, prerequisites: [] },
  { id: "school_backpack", contentType: "word", image: "assets/images/school_backpack.jpg", en: "backpack", pt: "mochila", emoji: "🎒", category: "school", difficulty: 1, prerequisites: [] },
  { id: "school_scissors", contentType: "word", image: "assets/images/school_scissors.jpg", en: "scissors", pt: "tesoura", emoji: "✂️", category: "school", difficulty: 1, prerequisites: [] },
  { id: "school_crayon", contentType: "word", image: "assets/images/school_crayon.jpg", en: "crayon", pt: "giz de cera", emoji: "🖍️", category: "school", difficulty: 1, prerequisites: [] },
  { id: "school_chair", contentType: "word", image: "assets/images/school_chair.jpg", en: "chair", pt: "cadeira", emoji: "🪑", category: "school", difficulty: 1, prerequisites: [] },
  { id: "school_ball", contentType: "word", en: "ball", pt: "bola", emoji: "⚽", category: "school", difficulty: 1, prerequisites: [] },
  { id: "school_glue", contentType: "word", image: "assets/images/school_glue.jpg", en: "glue", pt: "cola", emoji: "🧴", category: "school", difficulty: 1, prerequisites: [] },

  // ---- combos (combinações curtas, 2-3 palavras) ----
  { id: "combo_red_apple", contentType: "phrase", en: "red apple", pt: "maçã vermelha", emoji: "🔴🍎", category: "combos", difficulty: 2, prerequisites: ["colors_red", "food_apple"] },
  { id: "combo_blue_shoes", contentType: "phrase", en: "blue shoes", pt: "sapatos azuis", emoji: "🔵👟", category: "combos", difficulty: 2, prerequisites: ["colors_blue", "clothes_shoes"] },
  { id: "combo_green_shirt", contentType: "phrase", en: "green shirt", pt: "camiseta verde", emoji: "🟢👕", category: "combos", difficulty: 2, prerequisites: ["colors_green", "clothes_shirt"] },
  { id: "combo_yellow_banana", contentType: "phrase", en: "yellow banana", pt: "banana amarela", emoji: "🟡🍌", category: "combos", difficulty: 2, prerequisites: ["colors_yellow", "food_banana"] },
  { id: "combo_black_cat", contentType: "phrase", en: "black cat", pt: "gato preto", emoji: "⚫🐱", category: "combos", difficulty: 2, prerequisites: ["colors_black", "animals_cat"] },
  { id: "combo_white_rabbit", contentType: "phrase", en: "white rabbit", pt: "coelho branco", emoji: "⚪🐰", category: "combos", difficulty: 2, prerequisites: ["colors_white", "animals_rabbit"] },
  { id: "combo_brown_bear", contentType: "phrase", en: "brown bear", pt: "urso marrom", emoji: "🟤🐻", category: "combos", difficulty: 2, prerequisites: ["colors_brown", "animals_bear"] },
  { id: "combo_purple_grapes", contentType: "phrase", en: "purple grapes", pt: "uvas roxas", emoji: "🟣🍇", category: "combos", difficulty: 2, prerequisites: ["colors_purple", "food_grapes"] },
  { id: "combo_orange_fish", contentType: "phrase", en: "orange fish", pt: "peixe laranja", emoji: "🟠🐟", category: "combos", difficulty: 2, prerequisites: ["colors_orange", "animals_fish"] },
  { id: "combo_i_want_water", contentType: "sentence", en: "I want water", pt: "eu quero água", emoji: "🙋💧", category: "combos", difficulty: 3, prerequisites: ["survival_water"] },
  { id: "combo_i_want_milk", contentType: "sentence", en: "I want milk", pt: "eu quero leite", emoji: "🙋🥛", category: "combos", difficulty: 3, prerequisites: ["food_milk"] },
  { id: "combo_i_like_dogs", contentType: "sentence", en: "I like dogs", pt: "eu gosto de cachorros", emoji: "❤️🐶", category: "combos", difficulty: 3, prerequisites: ["animals_dog"] },
  { id: "combo_i_like_cats", contentType: "sentence", en: "I like cats", pt: "eu gosto de gatos", emoji: "❤️🐱", category: "combos", difficulty: 3, prerequisites: ["animals_cat"] },
  { id: "combo_thank_you_mom", contentType: "phrase", en: "thank you mom", pt: "obrigado mãe", emoji: "🙏👩", category: "combos", difficulty: 2, prerequisites: ["survival_thank_you", "family_mom"] },
  { id: "combo_thank_you_dad", contentType: "phrase", en: "thank you dad", pt: "obrigado pai", emoji: "🙏👨", category: "combos", difficulty: 2, prerequisites: ["survival_thank_you", "family_dad"] },

  // ---- phrases (frases funcionais completas) ----
  {
    id: "phrase_bathroom_please", contentType: "sentence",
    en: "Can I go to the bathroom, please?", pt: "posso ir ao banheiro, por favor?", emoji: "🚻🙏",
    category: "phrases", difficulty: 4,
    prerequisites: ["survival_bathroom", "survival_please", "survival_go_to_the_bathroom"],
    acceptedAnswers: ["can i go to the bathroom please", "can i go to the bathroom"],
  },
  {
    id: "phrase_help_please", contentType: "sentence",
    en: "Can you help me, please?", pt: "você pode me ajudar, por favor?", emoji: "🆘🙏",
    category: "phrases", difficulty: 4,
    prerequisites: ["survival_help", "survival_please"],
    acceptedAnswers: ["can you help me please", "can you help me"],
  },
  { id: "phrase_dont_understand", contentType: "sentence", en: "I don't understand", pt: "eu não entendo", emoji: "🤷", category: "phrases", difficulty: 3, prerequisites: [] },
  { id: "phrase_your_name", contentType: "sentence", en: "What is your name?", pt: "qual é o seu nome?", emoji: "🙋❓", category: "phrases", difficulty: 3, prerequisites: ["survival_my_name_is"] },
  { id: "phrase_hungry", contentType: "sentence", en: "I am hungry", pt: "eu estou com fome", emoji: "🍽️", category: "phrases", difficulty: 2, prerequisites: [] },
  { id: "phrase_thirsty", contentType: "sentence", en: "I am thirsty", pt: "eu estou com sede", emoji: "🥤", category: "phrases", difficulty: 2, prerequisites: [] },
  { id: "phrase_excuse_me", contentType: "phrase", en: "Excuse me", pt: "com licença", emoji: "🙋", category: "phrases", difficulty: 2, prerequisites: [] },
  {
    id: "phrase_water_please", contentType: "sentence",
    en: "Can I have some water, please?", pt: "posso tomar água, por favor?", emoji: "💧🙏",
    category: "phrases", difficulty: 4,
    prerequisites: ["survival_water", "survival_please"],
    acceptedAnswers: ["can i have some water please", "can i have water please", "can i have some water"],
  },
];

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
  seasons: { namePt: "Estações e Clima", icon: "🌤️", color: "#A0D2EB" },
};

// Itens de customização do avatar — desbloqueados por progresso em categoria (ver engine.js,
// isCategoryUnlockThresholdMet). Não depende de skills/situations (isso ainda não existe no motor real).
const AVATAR_ITEMS = {
  shirt: [
    { id: "coral", color: "#FF6B5B", unlockedBy: null },
    { id: "teal", color: "#3FB6C9", unlockedBy: "survival" },
    { id: "yellow", color: "#FFB648", unlockedBy: "colors" },
    { id: "green", color: "#5FC98D", unlockedBy: "animals" },
    { id: "purple", color: "#B18CD9", unlockedBy: "school" },
  ],
  hat: [
    { id: "none", type: null, unlockedBy: null },
    { id: "cap", type: "cap", color: "#FF6B5B", unlockedBy: "numbers" },
    { id: "party", type: "party", color: "#FFB648", unlockedBy: "phrases" },
  ],
  backpack: [
    { id: "none", color: null, unlockedBy: null },
    { id: "red", color: "#FF6B5B", unlockedBy: "food" },
  ],
};

// Situações — "My English World". Cada uma reaproveita conteúdo que já existe (categoria inteira ou
// uma lista de ids específica pra grupos temáticos que cruzam categorias, tipo "banheiro" que usa
// survival + phrases). Nada de currículo novo, só uma segunda forma de agrupar o que já foi curado.
const SITUATIONS = [
  { id: "greetings", namePt: "Se Apresentar", icon: "👋", mapPos: { top: "15%", left: "20%" }, itemIds: ["survival_hello", "survival_bye_bye", "survival_my_name_is", "phrase_your_name"] },
  { id: "help", namePt: "Pedir Ajuda", icon: "🆘", mapPos: { top: "15%", left: "75%" }, itemIds: ["survival_help", "phrase_help_please"] },
  { id: "bathroom", namePt: "Banheiro", icon: "🚻", mapPos: { top: "40%", left: "12%" }, itemIds: ["survival_bathroom", "survival_please", "survival_go_to_the_bathroom", "phrase_bathroom_please"] },
  { id: "water", namePt: "Água", icon: "💧", mapPos: { top: "38%", left: "50%" }, itemIds: ["survival_water", "combo_i_want_water", "phrase_water_please"] },
  { id: "cafeteria", namePt: "Lanche", icon: "🍎", mapPos: { top: "40%", left: "85%" }, categoryId: "food" },
  { id: "classroom", namePt: "Sala de Aula", icon: "🎒", mapPos: { top: "68%", left: "25%" }, categoryId: "school" },
  { id: "family", namePt: "Família", icon: "👨‍👩‍👧", mapPos: { top: "70%", left: "60%" }, categoryId: "family" },
  { id: "animals", namePt: "Bichinhos", icon: "🐶", mapPos: { top: "85%", left: "85%" }, categoryId: "animals" },
  { id: "friends", namePt: "Fazer Amigos", icon: "🤝", mapPos: { top: "15%", left: "48%" }, itemIds: ["phrase_play_with_you", "phrase_lets_play", "phrase_my_turn", "phrase_your_turn"] },
  { id: "sharing", namePt: "Dividir e Emprestar", icon: "🧸", mapPos: { top: "58%", left: "15%" }, itemIds: ["phrase_can_i_have_this", "phrase_can_i_borrow", "phrase_my_turn", "phrase_your_turn"] },
  { id: "teacher_tell", namePt: "Avisar a Professora", icon: "🙋", mapPos: { top: "58%", left: "78%" }, itemIds: ["phrase_im_hurt", "phrase_help_please", "phrase_dont_understand"] },
  { id: "goodbye", namePt: "Hora de ir Embora", icon: "👋", mapPos: { top: "85%", left: "45%" }, itemIds: ["survival_bye_bye", "phrase_see_you_later"] },
];

// Cenários de "problem-posing": a professora/situação apresenta um problema em português (ele
// ainda não entende inglês, então o contexto é dado na língua dele), e ele escolhe a frase certa
// em inglês pra resolver — a atividade central do LEARNING_PHILOSOPHY.md ("learn through doing",
// seção 2/5/9.2). correctId/distractorIds sempre apontam pra itens reais de CONTENT (mesmo áudio,
// mesmo registro de progresso — não é conteúdo paralelo).
const SCENARIOS = [
  { id: "scn_bathroom", situationId: "bathroom", promptPt: "Você não sabe onde fica o banheiro.", correctId: "phrase_bathroom_please", distractorIds: ["phrase_water_please", "phrase_help_please"] },
  { id: "scn_water", situationId: "water", promptPt: "Você está com muita sede.", correctId: "phrase_water_please", distractorIds: ["phrase_bathroom_please", "phrase_help_please"] },
  { id: "scn_help", situationId: "help", promptPt: "Você não está conseguindo fazer uma atividade sozinho.", correctId: "phrase_help_please", distractorIds: ["phrase_bathroom_please", "phrase_water_please"] },
  { id: "scn_greetings", situationId: "greetings", promptPt: "Uma criança nova pergunta seu nome.", correctId: "survival_my_name_is", distractorIds: ["phrase_your_name", "phrase_excuse_me"] },
  { id: "scn_friends", situationId: "friends", promptPt: "Você quer brincar com uma criança no playground.", correctId: "phrase_play_with_you", distractorIds: ["phrase_can_i_borrow", "phrase_can_i_have_this"] },
  { id: "scn_sharing", situationId: "sharing", promptPt: "Você quer brincar com o brinquedo de um amigo.", correctId: "phrase_can_i_borrow", distractorIds: ["phrase_can_i_have_this", "phrase_play_with_you"] },
  { id: "scn_teacher_tell", situationId: "teacher_tell", promptPt: "Você se machucou no playground.", correctId: "phrase_im_hurt", distractorIds: ["phrase_help_please", "phrase_dont_understand"] },
  { id: "scn_goodbye", situationId: "goodbye", promptPt: "A aula acabou e seus pais chegaram.", correctId: "phrase_see_you_later", distractorIds: ["survival_hello", "phrase_help_please"] },
  { id: "scn_animals", situationId: "animals", promptPt: "Seu amigo pergunta qual bicho de estimação você gosta mais.", correctId: "combo_i_like_dogs", distractorIds: ["combo_i_like_cats", "phrase_i_dont_like_it"] },
];

const CONTENT = [
  // ---- survival (sobrevivência escolar) ----
  { id: "survival_hello", contentType: "word", en: "hello", pt: "olá", emoji: "👋", category: "survival", difficulty: 1, prerequisites: [] },
  { id: "survival_bye_bye", contentType: "phrase", en: "bye bye", pt: "tchau", emoji: "🚶", category: "survival", difficulty: 2, prerequisites: [] },
  { id: "survival_please", contentType: "word", en: "please", pt: "por favor", emoji: "🥺", category: "survival", difficulty: 1, prerequisites: [] },
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
  { id: "numbers_eleven", contentType: "word", en: "eleven", pt: "onze", emoji: "1️⃣1️⃣", category: "numbers", difficulty: 2, prerequisites: [] },
  { id: "numbers_twelve", contentType: "word", en: "twelve", pt: "doze", emoji: "1️⃣2️⃣", category: "numbers", difficulty: 2, prerequisites: [] },
  { id: "numbers_thirteen", contentType: "word", en: "thirteen", pt: "treze", emoji: "1️⃣3️⃣", category: "numbers", difficulty: 2, prerequisites: [] },
  { id: "numbers_fourteen", contentType: "word", en: "fourteen", pt: "quatorze", emoji: "1️⃣4️⃣", category: "numbers", difficulty: 2, prerequisites: [] },
  { id: "numbers_fifteen", contentType: "word", en: "fifteen", pt: "quinze", emoji: "1️⃣5️⃣", category: "numbers", difficulty: 2, prerequisites: [] },
  { id: "numbers_sixteen", contentType: "word", en: "sixteen", pt: "dezesseis", emoji: "1️⃣6️⃣", category: "numbers", difficulty: 2, prerequisites: [] },
  { id: "numbers_seventeen", contentType: "word", en: "seventeen", pt: "dezessete", emoji: "1️⃣7️⃣", category: "numbers", difficulty: 2, prerequisites: [] },
  { id: "numbers_eighteen", contentType: "word", en: "eighteen", pt: "dezoito", emoji: "1️⃣8️⃣", category: "numbers", difficulty: 2, prerequisites: [] },
  { id: "numbers_nineteen", contentType: "word", en: "nineteen", pt: "dezenove", emoji: "1️⃣9️⃣", category: "numbers", difficulty: 2, prerequisites: [] },
  { id: "numbers_twenty", contentType: "word", en: "twenty", pt: "vinte", emoji: "2️⃣0️⃣", category: "numbers", difficulty: 2, prerequisites: [] },

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
  { id: "animals_horse", contentType: "word", en: "horse", pt: "cavalo", emoji: "🐴", category: "animals", difficulty: 1, prerequisites: [] },
  { id: "animals_cow", contentType: "word", en: "cow", pt: "vaca", emoji: "🐮", category: "animals", difficulty: 1, prerequisites: [] },
  { id: "animals_pig", contentType: "word", en: "pig", pt: "porco", emoji: "🐷", category: "animals", difficulty: 1, prerequisites: [] },
  { id: "animals_sheep", contentType: "word", en: "sheep", pt: "ovelha", emoji: "🐑", category: "animals", difficulty: 1, prerequisites: [] },
  { id: "animals_monkey", contentType: "word", en: "monkey", pt: "macaco", emoji: "🐵", category: "animals", difficulty: 1, prerequisites: [] },
  { id: "animals_butterfly", contentType: "word", en: "butterfly", pt: "borboleta", emoji: "🦋", category: "animals", difficulty: 1, prerequisites: [] },
  { id: "animals_snake", contentType: "word", en: "snake", pt: "cobra", emoji: "🐍", category: "animals", difficulty: 1, prerequisites: [] },
  { id: "animals_turtle", contentType: "word", en: "turtle", pt: "tartaruga", emoji: "🐢", category: "animals", difficulty: 1, prerequisites: [] },
  { id: "animals_kangaroo", contentType: "word", en: "kangaroo", pt: "canguru", emoji: "🦘", category: "animals", difficulty: 1, prerequisites: [] },
  { id: "animals_koala", contentType: "word", en: "koala", pt: "coala", emoji: "🐨", category: "animals", difficulty: 1, prerequisites: [] },

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
  { id: "body_ear", contentType: "word", image: "assets/images/body_ear.jpg", en: "ear", pt: "orelha", emoji: "👂", category: "body", difficulty: 1, prerequisites: [] },
  { id: "body_hand", contentType: "word", image: "assets/images/body_hand.jpg", en: "hand", pt: "mão", emoji: "✋", category: "body", difficulty: 1, prerequisites: [] },
  { id: "body_foot", contentType: "word", image: "assets/images/body_foot.jpg", en: "foot", pt: "pé", emoji: "🦶", category: "body", difficulty: 1, prerequisites: [] },
  { id: "body_hair", contentType: "word", image: "assets/images/body_hair.jpg", en: "hair", pt: "cabelo", emoji: "💇", category: "body", difficulty: 1, prerequisites: [] },
  { id: "body_tooth", contentType: "word", image: "assets/images/body_tooth.jpg", en: "tooth", pt: "dente", emoji: "🦷", category: "body", difficulty: 1, prerequisites: [] },

  // ---- family ----
  { id: "family_mom", contentType: "word", image: "assets/images/family_mom.jpg", en: "mom", pt: "mãe", emoji: "👩", category: "family", difficulty: 1, prerequisites: [] },
  { id: "family_dad", contentType: "word", image: "assets/images/family_dad.jpg", en: "dad", pt: "pai", emoji: "👨", category: "family", difficulty: 1, prerequisites: [] },
  { id: "family_baby", contentType: "word", image: "assets/images/family_baby.jpg", en: "baby", pt: "bebê", emoji: "👶", category: "family", difficulty: 1, prerequisites: [] },
  { id: "family_sister", contentType: "word", image: "assets/images/family_sister.jpg", en: "sister", pt: "irmã", emoji: "👧", category: "family", difficulty: 1, prerequisites: [] },
  { id: "family_brother", contentType: "word", image: "assets/images/family_brother.jpg", en: "brother", pt: "irmão", emoji: "👦", category: "family", difficulty: 1, prerequisites: [] },
  { id: "family_grandma", contentType: "word", image: "assets/images/family_grandma.jpg", en: "grandma", pt: "vovó", emoji: "👵", category: "family", difficulty: 1, prerequisites: [] },
  { id: "family_grandpa", contentType: "word", image: "assets/images/family_grandpa.jpg", en: "grandpa", pt: "vovô", emoji: "👴", category: "family", difficulty: 1, prerequisites: [] },

  // ---- clothes ----
  { id: "clothes_shirt", contentType: "word", image: "assets/images/clothes_shirt.jpg", en: "shirt", pt: "camiseta", emoji: "👕", category: "clothes", difficulty: 1, prerequisites: [] },
  { id: "clothes_pants", contentType: "word", image: "assets/images/clothes_pants.jpg", en: "pants", pt: "calça", emoji: "👖", category: "clothes", difficulty: 1, prerequisites: [] },
  { id: "clothes_shoes", contentType: "word", image: "assets/images/clothes_shoes.jpg", en: "shoes", pt: "sapatos", emoji: "👟", category: "clothes", difficulty: 1, prerequisites: [] },
  { id: "clothes_socks", contentType: "word", image: "assets/images/clothes_socks.jpg", en: "socks", pt: "meias", emoji: "🧦", category: "clothes", difficulty: 1, prerequisites: [] },
  { id: "clothes_hat", contentType: "word", image: "assets/images/clothes_hat.jpg", en: "hat", pt: "boné", emoji: "🧢", category: "clothes", difficulty: 1, prerequisites: [] },
  { id: "clothes_jacket", contentType: "word", image: "assets/images/clothes_jacket.jpg", en: "jacket", pt: "jaqueta", emoji: "🧥", category: "clothes", difficulty: 1, prerequisites: [] },

  // ---- school ----
  { id: "school_book", contentType: "word", image: "assets/images/school_book.jpg", en: "book", pt: "livro", emoji: "📖", category: "school", difficulty: 1, prerequisites: [] },
  { id: "school_pencil", contentType: "word", image: "assets/images/school_pencil.jpg", en: "pencil", pt: "lápis", emoji: "✏️", category: "school", difficulty: 1, prerequisites: [] },
  { id: "school_backpack", contentType: "word", image: "assets/images/school_backpack.jpg", en: "backpack", pt: "mochila", emoji: "🎒", category: "school", difficulty: 1, prerequisites: [] },
  { id: "school_scissors", contentType: "word", image: "assets/images/school_scissors.jpg", en: "scissors", pt: "tesoura", emoji: "✂️", category: "school", difficulty: 1, prerequisites: [] },
  { id: "school_crayon", contentType: "word", image: "assets/images/school_crayon.jpg", en: "crayon", pt: "giz de cera", emoji: "🖍️", category: "school", difficulty: 1, prerequisites: [] },
  { id: "school_chair", contentType: "word", image: "assets/images/school_chair.jpg", en: "chair", pt: "cadeira", emoji: "🪑", category: "school", difficulty: 1, prerequisites: [] },
  { id: "school_ball", contentType: "word", image: "assets/images/school_ball.jpg", en: "ball", pt: "bola", emoji: "⚽", category: "school", difficulty: 1, prerequisites: [] },
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
  { id: "combo_brown_horse", contentType: "phrase", en: "brown horse", pt: "cavalo marrom", emoji: "🟤🐴", category: "combos", difficulty: 2, prerequisites: ["colors_brown", "animals_horse"] },
  { id: "combo_pink_pig", contentType: "phrase", en: "pink pig", pt: "porco rosa", emoji: "💗🐷", category: "combos", difficulty: 2, prerequisites: ["colors_pink", "animals_pig"] },
  { id: "combo_black_sheep", contentType: "phrase", en: "black sheep", pt: "ovelha preta", emoji: "⚫🐑", category: "combos", difficulty: 2, prerequisites: ["colors_black", "animals_sheep"] },
  { id: "combo_green_snake", contentType: "phrase", en: "green snake", pt: "cobra verde", emoji: "🟢🐍", category: "combos", difficulty: 2, prerequisites: ["colors_green", "animals_snake"] },
  { id: "combo_orange_butterfly", contentType: "phrase", en: "orange butterfly", pt: "borboleta laranja", emoji: "🟠🦋", category: "combos", difficulty: 2, prerequisites: ["colors_orange", "animals_butterfly"] },
  { id: "combo_green_turtle", contentType: "phrase", en: "green turtle", pt: "tartaruga verde", emoji: "🟢🐢", category: "combos", difficulty: 2, prerequisites: ["colors_green", "animals_turtle"] },
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
  { id: "phrase_excuse_me", contentType: "phrase", en: "Excuse me", pt: "com licença", emoji: "🙇", category: "phrases", difficulty: 2, prerequisites: [] },
  {
    id: "phrase_water_please", contentType: "sentence",
    en: "Can I have some water, please?", pt: "posso tomar água, por favor?", emoji: "💧🙏",
    category: "phrases", difficulty: 4,
    prerequisites: ["survival_water", "survival_please"],
    acceptedAnswers: ["can i have some water please", "can i have water please", "can i have some water"],
  },

  // ---- situações sociais do dia a dia (fazer amigos, dividir, avisar a professora, se despedir) ----
  {
    id: "phrase_play_with_you", contentType: "sentence",
    en: "Can I play with you?", pt: "posso brincar com você?", emoji: "🤝",
    category: "phrases", difficulty: 3, prerequisites: [],
    acceptedAnswers: ["can i play with you", "can i play"],
  },
  { id: "phrase_lets_play", contentType: "phrase", en: "Let's play!", pt: "vamos brincar!", emoji: "🎮", category: "phrases", difficulty: 2, prerequisites: [] },
  { id: "phrase_my_turn", contentType: "phrase", en: "My turn!", pt: "minha vez!", emoji: "☝️", category: "phrases", difficulty: 2, prerequisites: [] },
  { id: "phrase_your_turn", contentType: "phrase", en: "Your turn!", pt: "sua vez!", emoji: "👉", category: "phrases", difficulty: 2, prerequisites: [] },
  {
    id: "phrase_can_i_have_this", contentType: "sentence",
    en: "Can I have this?", pt: "posso ficar com isso?", emoji: "🙏🧸",
    category: "phrases", difficulty: 3, prerequisites: [],
    acceptedAnswers: ["can i have this"],
  },
  {
    id: "phrase_can_i_borrow", contentType: "sentence",
    en: "Can I borrow this, please?", pt: "posso pegar isso emprestado, por favor?", emoji: "🔄🧸",
    category: "phrases", difficulty: 4, prerequisites: ["survival_please"],
    acceptedAnswers: ["can i borrow this please", "can i borrow this"],
  },
  { id: "phrase_im_hurt", contentType: "sentence", en: "I'm hurt", pt: "eu me machuquei", emoji: "🤕", category: "phrases", difficulty: 2, prerequisites: [] },
  { id: "phrase_see_you_later", contentType: "phrase", en: "See you later!", pt: "até mais!", emoji: "🏠", category: "phrases", difficulty: 2, prerequisites: ["survival_bye_bye"] },
  {
    id: "phrase_whats_this", contentType: "sentence",
    en: "What's this?", pt: "o que é isso?", emoji: "🤔",
    category: "phrases", difficulty: 3, prerequisites: [],
    acceptedAnswers: ["whats this", "what is this"],
  },

  // ---- evolução natural (mesma função comunicativa, registro mais avançado — o item simples
  // vira prerequisite soft do mais evoluído, e difficulty mais alta já garante que ele só aparece
  // pro João depois, via getNewCandidates em engine.js; sem mudança nenhuma de engine) ----
  {
    id: "phrase_water_glass_please", contentType: "sentence",
    en: "Can I have a glass of water, please?", pt: "posso tomar um copo de água, por favor?", emoji: "🥛🙏",
    category: "phrases", difficulty: 5, prerequisites: ["phrase_water_please"],
    acceptedAnswers: ["can i have a glass of water please", "can i have a glass of water"],
  },
  { id: "phrase_good_morning", contentType: "phrase", en: "Good morning", pt: "bom dia", emoji: "🌅", category: "phrases", difficulty: 2, prerequisites: ["survival_hello"] },
  {
    id: "phrase_hi_mate_how_you_going", contentType: "sentence",
    en: "Hi mate, how's it going?", pt: "oi, e aí, tudo bem?", emoji: "🤙",
    category: "phrases", difficulty: 5, prerequisites: ["phrase_good_morning"],
    acceptedAnswers: ["hi mate hows it going", "hi mate how is it going", "hows it going"],
  },

  // ==================== AUTONOMIA NA ESCOLA (lote grande, 2026-08-26) ====================
  // Curadoria do usuário: comandos da professora, o que fazer quando não entende, interação com
  // colegas, gostos/vontades, limites, dor/emergência, necessidades pessoais. Deduplicado contra
  // o que já existia (bathroom/water/help/play/turn/thank you etc. não repetidos aqui).

  // ---- comandos da professora (school) ----
  { id: "school_come_here", contentType: "phrase", image: "assets/images/school_come_here.jpg", en: "Come here", pt: "vem aqui", emoji: "📍", category: "school", difficulty: 2, prerequisites: [] },
  { id: "school_sit_down", contentType: "phrase", image: "assets/images/school_sit_down.jpg", en: "Sit down", pt: "senta", emoji: "⬇️", category: "school", difficulty: 2, prerequisites: [] },
  { id: "school_stand_up", contentType: "phrase", image: "assets/images/school_stand_up.jpg", en: "Stand up", pt: "levanta", emoji: "⬆️", category: "school", difficulty: 2, prerequisites: [] },
  { id: "school_line_up", contentType: "phrase", image: "assets/images/school_line_up.jpg", en: "Line up", pt: "faz fila", emoji: "🧍‍♂️🧍‍♀️", category: "school", difficulty: 2, prerequisites: [] },
  { id: "school_wait", contentType: "word", image: "assets/images/school_wait.jpg", en: "Wait", pt: "espera", emoji: "⏳", category: "school", difficulty: 1, prerequisites: [] },
  { id: "school_stop", contentType: "word", image: "assets/images/school_stop.jpg", en: "Stop", pt: "para", emoji: "🛑", category: "school", difficulty: 1, prerequisites: [] },
  { id: "school_listen", contentType: "word", image: "assets/images/school_listen.jpg", en: "Listen", pt: "escuta", emoji: "🎧", category: "school", difficulty: 1, prerequisites: [] },
  { id: "school_look", contentType: "word", image: "assets/images/school_look.jpg", en: "Look", pt: "olha", emoji: "🔍", category: "school", difficulty: 1, prerequisites: [] },
  { id: "school_be_quiet", contentType: "phrase", image: "assets/images/school_be_quiet.jpg", en: "Be quiet", pt: "fica quietinho", emoji: "🤫", category: "school", difficulty: 2, prerequisites: [] },
  { id: "school_lets_go", contentType: "phrase", image: "assets/images/school_lets_go.jpg", en: "Let's go", pt: "vamos", emoji: "🏃", category: "school", difficulty: 2, prerequisites: [] },
  { id: "school_follow_me", contentType: "phrase", image: "assets/images/school_follow_me.jpg", en: "Follow me", pt: "me segue", emoji: "➡️", category: "school", difficulty: 2, prerequisites: [] },
  { id: "school_open_your_book", contentType: "sentence", image: "assets/images/school_open_your_book.jpg", en: "Open your book", pt: "abre o livro", emoji: "📖✅", category: "school", difficulty: 3, prerequisites: ["school_book"] },
  { id: "school_close_your_book", contentType: "sentence", image: "assets/images/school_close_your_book.jpg", en: "Close your book", pt: "fecha o livro", emoji: "📕", category: "school", difficulty: 3, prerequisites: ["school_book"] },
  { id: "school_put_it_away", contentType: "sentence", image: "assets/images/school_put_it_away.jpg", en: "Put it away", pt: "guarda isso", emoji: "📦", category: "school", difficulty: 3, prerequisites: [] },
  { id: "school_clean_up", contentType: "phrase", image: "assets/images/school_clean_up.jpg", en: "Clean up", pt: "arruma", emoji: "🧹", category: "school", difficulty: 2, prerequisites: [] },
  { id: "school_pack_your_bag", contentType: "sentence", image: "assets/images/school_pack_your_bag.jpg", en: "Pack your bag", pt: "arruma a mochila", emoji: "🧳", category: "school", difficulty: 3, prerequisites: ["school_backpack"] },

  // ---- quando não entende (phrases) ----
  { id: "phrase_i_dont_know", contentType: "sentence", en: "I don't know", pt: "eu não sei", emoji: "❓", category: "phrases", difficulty: 2, prerequisites: [] },
  { id: "phrase_what_do_i_do", contentType: "sentence", en: "What do I do?", pt: "o que eu faço?", emoji: "🧐", category: "phrases", difficulty: 3, prerequisites: ["phrase_dont_understand"] },
  { id: "phrase_can_you_show_me", contentType: "sentence", en: "Can you show me?", pt: "você pode me mostrar?", emoji: "👆", category: "phrases", difficulty: 3, prerequisites: ["phrase_help_please"] },
  { id: "phrase_can_you_say_it_again", contentType: "sentence", en: "Can you say it again?", pt: "pode falar de novo?", emoji: "🔁", category: "phrases", difficulty: 4, prerequisites: ["phrase_dont_understand"] },

  // ---- brincar e compartilhar (phrases) ----
  { id: "phrase_can_i_play_too", contentType: "sentence", en: "Can I play too?", pt: "posso brincar também?", emoji: "🙋🎮", category: "phrases", difficulty: 3, prerequisites: ["phrase_play_with_you"] },
  { id: "phrase_do_you_want_to_play", contentType: "sentence", en: "Do you want to play?", pt: "você quer brincar?", emoji: "🎲", category: "phrases", difficulty: 3, prerequisites: ["phrase_lets_play"] },
  { id: "phrase_come_play_with_me", contentType: "sentence", en: "Come play with me", pt: "vem brincar comigo", emoji: "🤗", category: "phrases", difficulty: 3, prerequisites: ["phrase_lets_play"] },
  { id: "phrase_lets_do_it_together", contentType: "sentence", en: "Let's do it together", pt: "vamos fazer juntos", emoji: "👫", category: "phrases", difficulty: 3, prerequisites: [] },
  { id: "phrase_can_i_use_it", contentType: "sentence", en: "Can I use it?", pt: "posso usar?", emoji: "🔧", category: "phrases", difficulty: 3, prerequisites: ["phrase_can_i_borrow"] },
  { id: "phrase_can_i_have_a_turn", contentType: "sentence", en: "Can I have a turn?", pt: "posso ter uma vez?", emoji: "🔄", category: "phrases", difficulty: 3, prerequisites: ["phrase_my_turn"] },
  { id: "phrase_here_you_go", contentType: "phrase", en: "Here you go", pt: "aqui está", emoji: "🎁", category: "phrases", difficulty: 2, prerequisites: [] },
  { id: "phrase_youre_welcome", contentType: "phrase", en: "You're welcome", pt: "de nada", emoji: "😊", category: "phrases", difficulty: 2, prerequisites: ["survival_thank_you"] },

  // ---- gostos e vontades (phrases) ----
  { id: "phrase_i_like_it", contentType: "sentence", en: "I like it", pt: "eu gosto", emoji: "😍", category: "phrases", difficulty: 2, prerequisites: [] },
  { id: "phrase_i_dont_like_it", contentType: "sentence", en: "I don't like it", pt: "eu não gosto", emoji: "😕", category: "phrases", difficulty: 2, prerequisites: [] },
  { id: "phrase_i_love_it", contentType: "sentence", en: "I love it!", pt: "eu adoro!", emoji: "🥰", category: "phrases", difficulty: 2, prerequisites: ["phrase_i_like_it"] },
  { id: "phrase_its_fun", contentType: "sentence", en: "It's fun!", pt: "é divertido!", emoji: "🎉", category: "phrases", difficulty: 2, prerequisites: [] },
  { id: "phrase_its_boring", contentType: "sentence", en: "It's boring", pt: "é chato", emoji: "🥱", category: "phrases", difficulty: 2, prerequisites: [] },
  { id: "phrase_i_want_this", contentType: "sentence", en: "I want this", pt: "eu quero isso", emoji: "🫵", category: "phrases", difficulty: 2, prerequisites: [] },
  { id: "phrase_i_dont_want_this", contentType: "sentence", en: "I don't want this", pt: "eu não quero isso", emoji: "🙅", category: "phrases", difficulty: 2, prerequisites: [] },
  { id: "phrase_i_want_to_play", contentType: "sentence", en: "I want to play", pt: "eu quero brincar", emoji: "🛝", category: "phrases", difficulty: 3, prerequisites: ["phrase_i_want_this"] },
  { id: "phrase_this_one_please", contentType: "phrase", en: "This one, please", pt: "este, por favor", emoji: "👇", category: "phrases", difficulty: 2, prerequisites: [] },
  { id: "phrase_which_one", contentType: "phrase", en: "Which one?", pt: "qual?", emoji: "🤷‍♀️", category: "phrases", difficulty: 2, prerequisites: [] },

  // ---- limites (phrases) ----
  { id: "phrase_no_thank_you", contentType: "phrase", en: "No, thank you", pt: "não, obrigado", emoji: "🙅‍♀️", category: "phrases", difficulty: 2, prerequisites: ["survival_no"] },
  { id: "phrase_dont_touch_me", contentType: "sentence", en: "Don't touch me", pt: "não toca em mim", emoji: "🚫", category: "phrases", difficulty: 3, prerequisites: [] },
  { id: "phrase_thats_mine", contentType: "sentence", en: "That's mine", pt: "isso é meu", emoji: "🔒", category: "phrases", difficulty: 2, prerequisites: [] },
  { id: "phrase_i_was_using_it", contentType: "sentence", en: "I was using it", pt: "eu estava usando isso", emoji: "🖐️", category: "phrases", difficulty: 4, prerequisites: ["phrase_thats_mine"] },
  { id: "phrase_i_dont_want_to_play", contentType: "sentence", en: "I don't want to play", pt: "eu não quero brincar", emoji: "🚫🎮", category: "phrases", difficulty: 3, prerequisites: ["phrase_i_dont_want_this"] },

  // ---- dor e emergência (phrases) ----
  { id: "phrase_it_hurts", contentType: "sentence", en: "It hurts", pt: "está doendo", emoji: "😖", category: "phrases", difficulty: 2, prerequisites: ["phrase_im_hurt"] },
  { id: "phrase_my_tummy_hurts", contentType: "sentence", en: "My tummy hurts", pt: "minha barriga dói", emoji: "🤢", category: "phrases", difficulty: 3, prerequisites: ["phrase_it_hurts"] },
  { id: "phrase_i_fell", contentType: "sentence", en: "I fell", pt: "eu caí", emoji: "😵", category: "phrases", difficulty: 2, prerequisites: [] },
  { id: "phrase_i_need_help", contentType: "sentence", en: "I need help", pt: "eu preciso de ajuda", emoji: "😰", category: "phrases", difficulty: 2, prerequisites: ["survival_help"] },
  { id: "phrase_i_need_the_teacher", contentType: "sentence", en: "I need the teacher", pt: "eu preciso da professora", emoji: "🙏🧑‍🏫", category: "phrases", difficulty: 3, prerequisites: ["school_teacher"] },
  { id: "phrase_i_cant_find_my_bag", contentType: "sentence", en: "I can't find my bag", pt: "não acho minha mochila", emoji: "😟", category: "phrases", difficulty: 4, prerequisites: [] },
  { id: "phrase_where_is_my_teacher", contentType: "sentence", en: "Where is my teacher?", pt: "onde está minha professora?", emoji: "🧑‍🏫❓", category: "phrases", difficulty: 3, prerequisites: ["school_teacher"] },

  // ---- necessidades pessoais (phrases) ----
  { id: "phrase_can_i_have_some_food", contentType: "sentence", en: "Can I have some food?", pt: "posso comer alguma coisa?", emoji: "🍱", category: "phrases", difficulty: 4, prerequisites: ["phrase_hungry"] },
  { id: "phrase_i_need_a_tissue", contentType: "sentence", en: "I need a tissue", pt: "eu preciso de um lenço", emoji: "🤧", category: "phrases", difficulty: 3, prerequisites: [] },
  { id: "phrase_im_cold", contentType: "sentence", en: "I'm cold", pt: "estou com frio", emoji: "🥶", category: "phrases", difficulty: 2, prerequisites: [] },
  { id: "phrase_im_hot", contentType: "sentence", en: "I'm hot", pt: "estou com calor", emoji: "🥵", category: "phrases", difficulty: 2, prerequisites: [] },
  { id: "phrase_im_tired", contentType: "sentence", en: "I'm tired", pt: "estou cansado", emoji: "😴", category: "phrases", difficulty: 2, prerequisites: [] },
  { id: "phrase_i_need_a_break", contentType: "sentence", en: "I need a break", pt: "eu preciso de uma pausa", emoji: "🛋️", category: "phrases", difficulty: 3, prerequisites: [] },

  // ---- objetos novos de sala (school) ----
  { id: "school_teacher", contentType: "word", image: "assets/images/school_teacher.jpg", en: "teacher", pt: "professora", emoji: "🧑‍🏫", category: "school", difficulty: 1, prerequisites: [] },
  { id: "school_paper", contentType: "word", image: "assets/images/school_paper.jpg", en: "paper", pt: "papel", emoji: "📄", category: "school", difficulty: 1, prerequisites: [] },
  { id: "school_pen", contentType: "word", image: "assets/images/school_pen.jpg", en: "pen", pt: "caneta", emoji: "🖊️", category: "school", difficulty: 1, prerequisites: [] },
  { id: "school_toy", contentType: "word", image: "assets/images/school_toy.jpg", en: "toy", pt: "brinquedo", emoji: "🧸", category: "school", difficulty: 1, prerequisites: [] },
  { id: "school_door", contentType: "word", image: "assets/images/school_door.jpg", en: "door", pt: "porta", emoji: "🚪", category: "school", difficulty: 1, prerequisites: [] },
  { id: "school_window", contentType: "word", image: "assets/images/school_window.jpg", en: "window", pt: "janela", emoji: "🪟", category: "school", difficulty: 1, prerequisites: [] },

  // ---- estações e clima ----
  { id: "seasons_summer", contentType: "word", en: "summer", pt: "verão", emoji: "🏖️", category: "seasons", difficulty: 1, prerequisites: [] },
  { id: "seasons_winter", contentType: "word", en: "winter", pt: "inverno", emoji: "⛄", category: "seasons", difficulty: 1, prerequisites: [] },
  { id: "seasons_spring", contentType: "word", en: "spring", pt: "primavera", emoji: "🌷", category: "seasons", difficulty: 1, prerequisites: [] },
  { id: "seasons_autumn", contentType: "word", en: "autumn", pt: "outono", emoji: "🍂", category: "seasons", difficulty: 1, prerequisites: [] },
  { id: "seasons_sunny", contentType: "word", en: "sunny", pt: "ensolarado", emoji: "☀️", category: "seasons", difficulty: 1, prerequisites: [] },
  { id: "seasons_rainy", contentType: "word", en: "rainy", pt: "chuvoso", emoji: "🌧️", category: "seasons", difficulty: 1, prerequisites: [] },
  { id: "seasons_cloudy", contentType: "word", en: "cloudy", pt: "nublado", emoji: "☁️", category: "seasons", difficulty: 1, prerequisites: [] },
  { id: "seasons_windy", contentType: "word", en: "windy", pt: "ventando", emoji: "💨", category: "seasons", difficulty: 1, prerequisites: [] },
  { id: "seasons_snowy", contentType: "word", en: "snowy", pt: "nevando", emoji: "🌨️", category: "seasons", difficulty: 1, prerequisites: [] },

  // ---- evolução natural: palavra de clima/estação -> frase funcional de verdade (mesmo padrão
  // documentado em CONTENT_GUIDE.md seção 8 -- difficulty mais alta + prerequisites soft) ----
  { id: "seasons_its_sunny", contentType: "sentence", en: "It's sunny", pt: "está ensolarado", emoji: "☀️👉", category: "seasons", difficulty: 2, prerequisites: ["seasons_sunny"] },
  { id: "seasons_its_cold", contentType: "sentence", en: "It's cold", pt: "está frio", emoji: "🥶👉", category: "seasons", difficulty: 2, prerequisites: ["seasons_winter"] },
  { id: "seasons_i_like_summer", contentType: "sentence", en: "I like summer", pt: "eu gosto do verão", emoji: "❤️🏖️", category: "seasons", difficulty: 2, prerequisites: ["seasons_summer"] },
];

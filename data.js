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
  home: { namePt: "Casa", icon: "🏠", color: "#FFCF9C" },
  toys: { namePt: "Brinquedos", icon: "🧸", color: "#B5EAD7" },
  // ---- trilha adulta (perfil Thales) — só aparecem pra perfis com track "adult" (engine.js) ----
  adult_work: { namePt: "Trabalho", icon: "💼", color: "#9FB7E8" },
  adult_health: { namePt: "Saúde e Médico", icon: "🩺", color: "#F2A7A7" },
  adult_housing: { namePt: "Aluguel e Consertos", icon: "🔧", color: "#F6C98F" },
  adult_parenting: { namePt: "Escola dos Filhos", icon: "🏫", color: "#B8DDB0" },
  adult_social: { namePt: "Conversa e Small Talk", icon: "☕", color: "#D9B99B" },
  adult_opinion: { namePt: "Opinião e Argumento", icon: "🗣️", color: "#C3B1E1" },
  adult_connectors: { namePt: "Conectores", icon: "🔗", color: "#A7D8DE" },
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
  { id: "home", namePt: "Casa", icon: "🏠", mapPos: { top: "50%", left: "30%" }, categoryId: "home" },
  { id: "toys", namePt: "Brinquedos", icon: "🧸", mapPos: { top: "85%", left: "15%" }, categoryId: "toys" },
  // ---- trilha adulta: mesmo mapa, outros lugares (profileSituations em engine.js filtra por track) ----
  { id: "work", track: "adult", namePt: "Trabalho", icon: "💼", mapPos: { top: "18%", left: "22%" }, categoryId: "adult_work" },
  { id: "doctor", track: "adult", namePt: "Médico", icon: "🩺", mapPos: { top: "18%", left: "72%" }, categoryId: "adult_health" },
  { id: "rental", track: "adult", namePt: "Imobiliária", icon: "🔑", mapPos: { top: "45%", left: "15%" }, categoryId: "adult_housing" },
  { id: "parent_teacher", track: "adult", namePt: "Reunião na Escola", icon: "🏫", mapPos: { top: "45%", left: "58%" }, categoryId: "adult_parenting" },
  { id: "small_talk", track: "adult", namePt: "Papo com Vizinhos", icon: "☕", mapPos: { top: "72%", left: "28%" }, categoryId: "adult_social" },
  { id: "discussion", track: "adult", namePt: "Discussão e Opinião", icon: "🗣️", mapPos: { top: "75%", left: "75%" }, categoryId: "adult_opinion" },
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
  { id: "scn_home", situationId: "home", promptPt: "Você terminou a lição de casa e quer relaxar. O que você pergunta pros seus pais?", correctId: "home_can_i_watch_tv", distractorIds: ["phrase_can_i_have_this", "phrase_help_please"] },
  { id: "scn_toys", situationId: "toys", promptPt: "Você quer brincar com o brinquedo do seu amigo.", correctId: "phrase_can_i_borrow", distractorIds: ["phrase_can_i_have_this", "phrase_my_turn"] },
  { id: "scn_classroom", situationId: "classroom", promptPt: "A professora falou rápido demais e você não entendeu.", correctId: "phrase_dont_understand", distractorIds: ["phrase_help_please", "phrase_im_hurt"] },

  // ---- trilha adulta: vários cenários por lugar (o primeiro de cada situationId abre a visita no
  // mapa; os outros entram nas rodadas situation/read/write via SCENARIO_BY_CORRECT_ID). `speaker`
  // troca o 👩‍🏫 do balão — no trabalho quem fala é um colega, no médico a recepção, etc.
  { id: "scn_work_deadline", situationId: "work", speaker: "🧑‍💼", promptPt: "O projeto atrasou e você precisa avisar o seu chefe que a entrega não vai sair a tempo.", correctId: "adult_work_wont_meet_deadline", distractorIds: ["adult_work_postpone_meeting", "adult_work_whats_your_availability"] },
  { id: "scn_work_extend", situationId: "work", speaker: "🧑‍💼", promptPt: "Você precisa de mais alguns dias para terminar o relatório e quer pedir isso com educação.", correctId: "adult_work_extend_deadline", distractorIds: ["adult_work_ill_follow_up", "adult_work_clarify"] },
  { id: "scn_work_clarify", situationId: "work", speaker: "🧑‍💼", promptPt: "Na reunião, um colega usou um termo que você não entendeu direito.", correctId: "adult_work_clarify", distractorIds: ["adult_work_whats_your_availability", "adult_work_postpone_meeting"] },
  { id: "scn_work_postpone", situationId: "work", speaker: "🧑‍💼", promptPt: "Surgiu um imprevisto e você não vai conseguir ir à reunião de amanhã.", correctId: "adult_work_postpone_meeting", distractorIds: ["adult_work_ill_follow_up", "adult_work_whats_your_availability"] },
  { id: "scn_health_book", situationId: "doctor", speaker: "👩‍⚕️", promptPt: "Você liga para a clínica porque quer ser atendido por um clínico geral.", correctId: "adult_health_id_like_to_book", distractorIds: ["adult_health_repeat_prescription", "adult_health_side_effects"] },
  { id: "scn_health_symptoms", situationId: "doctor", speaker: "👩‍⚕️", promptPt: "O médico pergunta o que você está sentindo. Sua garganta está doendo há três dias.", correctId: "adult_health_sore_throat", distractorIds: ["adult_health_allergic", "adult_health_anything_earlier"] },
  { id: "scn_health_earlier", situationId: "doctor", speaker: "👩‍⚕️", promptPt: "A recepcionista oferece um horário só para daqui a duas semanas, mas você precisava antes.", correctId: "adult_health_anything_earlier", distractorIds: ["adult_health_side_effects", "adult_health_repeat_prescription"] },
  { id: "scn_health_side_effects", situationId: "doctor", speaker: "👩‍⚕️", promptPt: "O médico receitou um remédio novo e você quer saber se ele pode causar alguma reação.", correctId: "adult_health_side_effects", distractorIds: ["adult_health_repeat_prescription", "adult_health_anything_earlier"] },
  { id: "scn_housing_repair", situationId: "rental", speaker: "🧑‍💼", promptPt: "O chuveiro está só com água fria desde ontem. Você liga para a imobiliária.", correctId: "adult_housing_stopped_working", distractorIds: ["adult_housing_rent_due", "adult_housing_give_notice"] },
  { id: "scn_housing_send", situationId: "rental", speaker: "🧑‍💼", promptPt: "A imobiliária anotou o problema. Agora você quer que alguém venha consertar.", correctId: "adult_housing_send_someone", distractorIds: ["adult_housing_renew_lease", "adult_housing_get_bond_back"] },
  { id: "scn_housing_renew", situationId: "rental", speaker: "🧑‍💼", promptPt: "O contrato está acabando e vocês querem continuar morando na casa.", correctId: "adult_housing_renew_lease", distractorIds: ["adult_housing_give_notice", "adult_housing_rent_due"] },
  { id: "scn_housing_moving", situationId: "rental", speaker: "🧑‍💼", promptPt: "Vocês decidiram se mudar e precisam avisar a imobiliária.", correctId: "adult_housing_give_notice", distractorIds: ["adult_housing_renew_lease", "adult_housing_leaking"] },
  { id: "scn_parent_meeting", situationId: "parent_teacher", speaker: "👩‍🏫", promptPt: "Na reunião de pais, você quer saber como seu filho está indo nas primeiras semanas de aula.", correctId: "adult_parenting_settling_in", distractorIds: ["adult_parenting_absent", "adult_parenting_pick_up_early"] },
  { id: "scn_parent_home", situationId: "parent_teacher", speaker: "👩‍🏫", promptPt: "A professora contou que seu filho está com dificuldade. Você quer ajudar em casa.", correctId: "adult_parenting_support_at_home", distractorIds: ["adult_parenting_absent", "adult_parenting_pick_up_early"] },
  { id: "scn_parent_context", situationId: "parent_teacher", speaker: "👩‍🏫", promptPt: "A professora pergunta se o seu filho fala inglês em casa.", correctId: "adult_parenting_bilingual", distractorIds: ["adult_parenting_struggling", "adult_parenting_settling_in"] },
  { id: "scn_parent_early", situationId: "parent_teacher", speaker: "👩‍🏫", promptPt: "Seu filho tem médico às duas da tarde e você precisa buscá-lo antes do horário.", correctId: "adult_parenting_pick_up_early", distractorIds: ["adult_parenting_absent", "adult_parenting_settling_in"] },
  { id: "scn_social_origin", situationId: "small_talk", speaker: "🧑", promptPt: "Um vizinho percebe o seu sotaque e pergunta de onde você é.", correctId: "adult_social_originally_from", distractorIds: ["adult_social_what_do_you_do", "adult_social_looking_forward"] },
  { id: "scn_social_work_q", situationId: "small_talk", speaker: "🧑", promptPt: "Numa festa de aniversário, você quer puxar conversa com outro pai sobre o trabalho dele.", correctId: "adult_social_what_do_you_do", distractorIds: ["adult_social_originally_from", "adult_social_long_time"] },
  { id: "scn_social_catch_up", situationId: "small_talk", speaker: "🧑", promptPt: "Você encontra um amigo no supermercado, mas está com pressa. Quer marcar de conversar outro dia.", correctId: "adult_social_we_should_catch_up", distractorIds: ["adult_social_looking_forward", "adult_social_what_do_you_do"] },
  { id: "scn_opinion_disagree", situationId: "discussion", speaker: "🧑‍💼", promptPt: "Um colega apresenta uma ideia. Você reconhece que faz sentido, mas ainda tem dúvidas.", correctId: "adult_opinion_see_your_point", distractorIds: ["adult_opinion_agree_to_disagree", "adult_opinion_rather_not"] },
  { id: "scn_opinion_end", situationId: "discussion", speaker: "🧑‍💼", promptPt: "A discussão não chega a lugar nenhum e vocês querem encerrar o assunto numa boa.", correctId: "adult_opinion_agree_to_disagree", distractorIds: ["adult_opinion_fair_point", "adult_opinion_what_do_you_think"] },
  { id: "scn_opinion_commit", situationId: "discussion", speaker: "🧑‍💼", promptPt: "Pedem pra você assumir um projeto novo, mas você ainda não tem certeza se consegue.", correctId: "adult_opinion_rather_not", distractorIds: ["adult_opinion_agree_to_disagree", "adult_opinion_what_do_you_think"] },
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

  // ---- evolução natural: número solto -> frase funcional (mesma pergunta que toda criança
  // ouve na escola) ----
  { id: "numbers_how_old_are_you", contentType: "phrase", en: "How old are you?", pt: "quantos anos você tem?", emoji: "🎂❓", category: "numbers", difficulty: 2, prerequisites: [] },
  { id: "numbers_im_four", contentType: "sentence", en: "I am four", pt: "eu tenho quatro anos", emoji: "🙋4️⃣", category: "numbers", difficulty: 3, prerequisites: ["numbers_four", "numbers_how_old_are_you"] },

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
  { id: "phrase_i_need_a_break", contentType: "sentence", en: "I need a break", pt: "eu preciso de uma pausa", emoji: "🧘", category: "phrases", difficulty: 3, prerequisites: [] },

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

  // ---- objetos de casa ----
  { id: "home_bed", contentType: "word", en: "bed", pt: "cama", emoji: "🛏️", category: "home", difficulty: 1, prerequisites: [] },
  { id: "home_sofa", contentType: "word", en: "sofa", pt: "sofá", emoji: "🛋️", category: "home", difficulty: 1, prerequisites: [] },
  { id: "home_tv", contentType: "word", en: "TV", pt: "TV", emoji: "📺", category: "home", difficulty: 1, prerequisites: [] },
  { id: "home_phone", contentType: "word", en: "phone", pt: "telefone", emoji: "📱", category: "home", difficulty: 1, prerequisites: [] },
  { id: "home_cup", contentType: "word", en: "cup", pt: "copo", emoji: "🥃", category: "home", difficulty: 1, prerequisites: [] },
  { id: "home_plate", contentType: "word", en: "plate", pt: "prato", emoji: "🥣", category: "home", difficulty: 1, prerequisites: [] },
  { id: "home_spoon", contentType: "word", en: "spoon", pt: "colher", emoji: "🥄", category: "home", difficulty: 1, prerequisites: [] },
  { id: "home_fork", contentType: "word", en: "fork", pt: "garfo", emoji: "🍴", category: "home", difficulty: 1, prerequisites: [] },
  { id: "home_lamp", contentType: "word", en: "lamp", pt: "luminária", emoji: "💡", category: "home", difficulty: 1, prerequisites: [] },
  { id: "home_key", contentType: "word", en: "key", pt: "chave", emoji: "🔑", category: "home", difficulty: 1, prerequisites: [] },
  { id: "home_clock", contentType: "word", en: "clock", pt: "relógio", emoji: "🕐", category: "home", difficulty: 1, prerequisites: [] },
  { id: "home_trash", contentType: "word", en: "trash", pt: "lixo", emoji: "🗑️", category: "home", difficulty: 1, prerequisites: [] },
  { id: "home_toothbrush", contentType: "word", en: "toothbrush", pt: "escova de dente", emoji: "🪥", category: "home", difficulty: 1, prerequisites: [] },
  { id: "home_soap", contentType: "word", en: "soap", pt: "sabonete", emoji: "🧼", category: "home", difficulty: 1, prerequisites: [] },
  { id: "home_toilet_paper", contentType: "word", en: "toilet paper", pt: "papel higiênico", emoji: "🧻", category: "home", difficulty: 1, prerequisites: [] },
  { id: "home_bathtub", contentType: "word", en: "bathtub", pt: "banheira", emoji: "🛁", category: "home", difficulty: 1, prerequisites: [] },
  { id: "home_shower", contentType: "word", en: "shower", pt: "chuveiro", emoji: "🚿", category: "home", difficulty: 1, prerequisites: [] },

  // ---- evolução natural: objeto de casa -> pedido de verdade (mesmo padrão de CONTENT_GUIDE.md
  // seção 8) ----
  { id: "home_can_i_watch_tv", contentType: "sentence", en: "Can I watch TV?", pt: "posso assistir TV?", emoji: "📺❓", category: "home", difficulty: 3, prerequisites: ["home_tv"] },

  // ---- brinquedos (teddy bear fica de fora -- já existe school_toy genérico com o mesmo emoji) ----
  { id: "toys_blocks", contentType: "word", en: "blocks", pt: "blocos", emoji: "🧱", category: "toys", difficulty: 1, prerequisites: [] },
  { id: "toys_puzzle", contentType: "word", en: "puzzle", pt: "quebra-cabeça", emoji: "🧩", category: "toys", difficulty: 1, prerequisites: [] },
  { id: "toys_car", contentType: "word", en: "car", pt: "carrinho", emoji: "🚗", category: "toys", difficulty: 1, prerequisites: [] },
  { id: "toys_train", contentType: "word", en: "train", pt: "trenzinho", emoji: "🚂", category: "toys", difficulty: 1, prerequisites: [] },
  { id: "toys_kite", contentType: "word", en: "kite", pt: "pipa", emoji: "🪁", category: "toys", difficulty: 1, prerequisites: [] },
  { id: "toys_balloon", contentType: "word", en: "balloon", pt: "balão", emoji: "🎈", category: "toys", difficulty: 1, prerequisites: [] },
  { id: "toys_robot", contentType: "word", en: "robot", pt: "robô", emoji: "🤖", category: "toys", difficulty: 1, prerequisites: [] },

  // ---- mais objetos de sala de aula ----
  { id: "school_ruler", contentType: "word", en: "ruler", pt: "régua", emoji: "📏", category: "school", difficulty: 1, prerequisites: [] },
  { id: "school_globe", contentType: "word", en: "globe", pt: "globo", emoji: "🌍", category: "school", difficulty: 1, prerequisites: [] },
  { id: "school_calendar", contentType: "word", en: "calendar", pt: "calendário", emoji: "📅", category: "school", difficulty: 1, prerequisites: [] },

  // ======================================================================================
  // ---- TRILHA ADULTA (perfil Thales) ----
  // `track: "adult"` tira esses itens da trilha das crianças (engine.js, profileContent). Mesma
  // metodologia do resto: palavra (1) → chunk (2) → sentença curta (3) → sentença completa (4) →
  // versão mais natural/complexa (5), ligadas por `prerequisites` (cadeias de evolução,
  // CONTENT_GUIDE.md seção 8), e cada lugar do mapa abre com um cenário de problem-posing.
  // acceptedAnswers sempre presentes nas sentenças (sem pontuação, com e sem contração).
  // ======================================================================================

  // ---- trabalho ----
  { id: "adult_work_deadline", track: "adult", contentType: "word", en: "deadline", pt: "prazo", emoji: "⏰", category: "adult_work", difficulty: 1, prerequisites: [] },
  { id: "adult_work_meet_the_deadline", track: "adult", contentType: "phrase", en: "meet the deadline", pt: "cumprir o prazo", emoji: "⏰✅", category: "adult_work", difficulty: 2, prerequisites: ["adult_work_deadline"] },
  {
    id: "adult_work_wont_meet_deadline", track: "adult", contentType: "sentence",
    en: "I'm afraid we won't meet the deadline.", pt: "infelizmente não vamos conseguir cumprir o prazo.", emoji: "⚠️⏰",
    category: "adult_work", difficulty: 4, prerequisites: ["adult_work_meet_the_deadline"],
    acceptedAnswers: ["i'm afraid we won't meet the deadline", "i am afraid we will not meet the deadline", "i'm afraid we will not meet the deadline"],
  },
  {
    id: "adult_work_extend_deadline", track: "adult", contentType: "sentence",
    en: "Would it be possible to extend the deadline until Friday?", pt: "seria possível estender o prazo até sexta?", emoji: "📅🙏",
    category: "adult_work", difficulty: 5, prerequisites: ["adult_work_wont_meet_deadline"],
    acceptedAnswers: ["would it be possible to extend the deadline until friday", "would it be possible to extend the deadline to friday"],
  },
  { id: "adult_work_postpone", track: "adult", contentType: "word", en: "postpone", pt: "adiar", emoji: "⏸️", category: "adult_work", difficulty: 1, prerequisites: [] },
  {
    id: "adult_work_postpone_meeting", track: "adult", contentType: "sentence",
    en: "Could we postpone the meeting to next week?", pt: "podemos adiar a reunião para a semana que vem?", emoji: "⏸️📆",
    category: "adult_work", difficulty: 4, prerequisites: ["adult_work_postpone"],
    acceptedAnswers: ["could we postpone the meeting to next week", "could we postpone the meeting until next week"],
  },
  { id: "adult_work_follow_up", track: "adult", contentType: "phrase", en: "follow up", pt: "dar um retorno", emoji: "🔁", category: "adult_work", difficulty: 2, prerequisites: [] },
  {
    id: "adult_work_ill_follow_up", track: "adult", contentType: "sentence",
    en: "I'll follow up with an email this afternoon.", pt: "vou dar um retorno por e-mail hoje à tarde.", emoji: "📧🔁",
    category: "adult_work", difficulty: 4, prerequisites: ["adult_work_follow_up"],
    acceptedAnswers: ["i'll follow up with an email this afternoon", "i will follow up with an email this afternoon"],
  },
  { id: "adult_work_availability", track: "adult", contentType: "word", en: "availability", pt: "disponibilidade", emoji: "🗓️", category: "adult_work", difficulty: 1, prerequisites: [] },
  {
    id: "adult_work_whats_your_availability", track: "adult", contentType: "sentence",
    en: "What's your availability later this week?", pt: "qual é a sua disponibilidade no fim desta semana?", emoji: "🗓️❓",
    category: "adult_work", difficulty: 4, prerequisites: ["adult_work_availability"],
    acceptedAnswers: ["what's your availability later this week", "what is your availability later this week"],
  },
  { id: "adult_work_workload", track: "adult", contentType: "word", en: "workload", pt: "carga de trabalho", emoji: "📚", category: "adult_work", difficulty: 1, prerequisites: [] },
  {
    id: "adult_work_overwhelmed", track: "adult", contentType: "sentence",
    en: "I'm a bit overwhelmed with my workload at the moment.", pt: "estou um pouco sobrecarregado com o trabalho no momento.", emoji: "😵📚",
    category: "adult_work", difficulty: 4, prerequisites: ["adult_work_workload"],
    acceptedAnswers: ["i'm a bit overwhelmed with my workload at the moment", "i am a bit overwhelmed with my workload at the moment"],
  },
  {
    id: "adult_work_clarify", track: "adult", contentType: "sentence",
    en: "Could you clarify what you mean by that?", pt: "você pode esclarecer o que quer dizer com isso?", emoji: "🤔",
    category: "adult_work", difficulty: 4, prerequisites: [],
    acceptedAnswers: ["could you clarify what you mean by that", "could you clarify what you mean"],
  },
  {
    id: "adult_work_same_page", track: "adult", contentType: "sentence",
    en: "Let me make sure we're on the same page.", pt: "deixa eu garantir que estamos alinhados.", emoji: "🤝📄",
    category: "adult_work", difficulty: 5, prerequisites: ["adult_work_clarify"],
    acceptedAnswers: ["let me make sure we're on the same page", "let me make sure we are on the same page"],
  },

  // ---- saúde e médico ----
  { id: "adult_health_appointment", track: "adult", contentType: "word", en: "appointment", pt: "consulta (horário marcado)", emoji: "📋", category: "adult_health", difficulty: 1, prerequisites: [] },
  { id: "adult_health_book_appointment", track: "adult", contentType: "phrase", en: "book an appointment", pt: "marcar uma consulta", emoji: "📋✍️", category: "adult_health", difficulty: 2, prerequisites: ["adult_health_appointment"] },
  {
    id: "adult_health_id_like_to_book", track: "adult", contentType: "sentence",
    en: "I'd like to book an appointment with a GP, please.", pt: "eu gostaria de marcar uma consulta com um clínico geral, por favor.", emoji: "☎️🩺",
    category: "adult_health", difficulty: 4, prerequisites: ["adult_health_book_appointment"],
    acceptedAnswers: ["i'd like to book an appointment with a gp please", "i would like to book an appointment with a gp please", "i'd like to book an appointment with a gp", "i would like to book an appointment with a gp"],
  },
  {
    id: "adult_health_anything_earlier", track: "adult", contentType: "sentence",
    en: "Is there anything available earlier this week?", pt: "tem algum horário disponível mais cedo nesta semana?", emoji: "⏪🗓️",
    category: "adult_health", difficulty: 5, prerequisites: ["adult_health_id_like_to_book"],
    acceptedAnswers: ["is there anything available earlier this week"],
  },
  { id: "adult_health_symptoms", track: "adult", contentType: "word", en: "symptoms", pt: "sintomas", emoji: "🤒", category: "adult_health", difficulty: 1, prerequisites: [] },
  {
    id: "adult_health_sore_throat", track: "adult", contentType: "sentence",
    en: "I've had a sore throat for three days.", pt: "estou com dor de garganta há três dias.", emoji: "🤒🗣️",
    category: "adult_health", difficulty: 4, prerequisites: ["adult_health_symptoms"],
    acceptedAnswers: ["i've had a sore throat for three days", "i have had a sore throat for three days"],
  },
  { id: "adult_health_prescription", track: "adult", contentType: "word", en: "prescription", pt: "receita médica", emoji: "💊📝", category: "adult_health", difficulty: 1, prerequisites: [] },
  {
    id: "adult_health_repeat_prescription", track: "adult", contentType: "sentence",
    en: "Could I get a repeat prescription, please?", pt: "posso pegar uma nova receita do mesmo remédio, por favor?", emoji: "💊🔁",
    category: "adult_health", difficulty: 4, prerequisites: ["adult_health_prescription"],
    acceptedAnswers: ["could i get a repeat prescription please", "could i get a repeat prescription"],
  },
  {
    id: "adult_health_allergic", track: "adult", contentType: "sentence",
    en: "I'm allergic to penicillin.", pt: "sou alérgico a penicilina.", emoji: "🚫💉",
    category: "adult_health", difficulty: 3, prerequisites: [],
    acceptedAnswers: ["i'm allergic to penicillin", "i am allergic to penicillin"],
  },
  {
    id: "adult_health_side_effects", track: "adult", contentType: "sentence",
    en: "Are there any side effects I should be aware of?", pt: "tem algum efeito colateral que eu deveria saber?", emoji: "💊❓",
    category: "adult_health", difficulty: 5, prerequisites: ["adult_health_prescription"],
    acceptedAnswers: ["are there any side effects i should be aware of", "are there any side effects"],
  },

  // ---- aluguel e consertos ----
  { id: "adult_housing_landlord", track: "adult", contentType: "word", en: "landlord", pt: "proprietário do imóvel", emoji: "🏠🔑", category: "adult_housing", difficulty: 1, prerequisites: [] },
  { id: "adult_housing_lease", track: "adult", contentType: "word", en: "lease", pt: "contrato de aluguel", emoji: "📄", category: "adult_housing", difficulty: 1, prerequisites: [] },
  { id: "adult_housing_bond", track: "adult", contentType: "word", en: "bond", pt: "caução do aluguel", emoji: "💰", category: "adult_housing", difficulty: 1, prerequisites: [] },
  {
    id: "adult_housing_rent_due", track: "adult", contentType: "sentence",
    en: "When is the rent due?", pt: "quando vence o aluguel?", emoji: "📅💵",
    category: "adult_housing", difficulty: 3, prerequisites: [],
    acceptedAnswers: ["when is the rent due"],
  },
  {
    id: "adult_housing_stopped_working", track: "adult", contentType: "sentence",
    en: "The hot water system has stopped working.", pt: "o aquecedor de água parou de funcionar.", emoji: "🚿❄️",
    category: "adult_housing", difficulty: 4, prerequisites: [],
    acceptedAnswers: ["the hot water system has stopped working", "the hot water system stopped working"],
  },
  {
    id: "adult_housing_send_someone", track: "adult", contentType: "sentence",
    en: "Could you send someone to take a look at it?", pt: "você pode mandar alguém para dar uma olhada?", emoji: "🔧👷",
    category: "adult_housing", difficulty: 5, prerequisites: ["adult_housing_stopped_working"],
    acceptedAnswers: ["could you send someone to take a look at it", "could you send someone to have a look at it"],
  },
  {
    id: "adult_housing_leaking", track: "adult", contentType: "sentence",
    en: "There's a leak under the kitchen sink.", pt: "tem um vazamento embaixo da pia da cozinha.", emoji: "💧🚰",
    category: "adult_housing", difficulty: 4, prerequisites: [],
    acceptedAnswers: ["there's a leak under the kitchen sink", "there is a leak under the kitchen sink"],
  },
  {
    id: "adult_housing_get_bond_back", track: "adult", contentType: "sentence",
    en: "When will we get our bond back?", pt: "quando vamos receber a caução de volta?", emoji: "💰🔙",
    category: "adult_housing", difficulty: 4, prerequisites: ["adult_housing_bond"],
    acceptedAnswers: ["when will we get our bond back"],
  },
  {
    id: "adult_housing_renew_lease", track: "adult", contentType: "sentence",
    en: "We'd like to renew the lease for another twelve months.", pt: "gostaríamos de renovar o contrato por mais doze meses.", emoji: "📄🔁",
    category: "adult_housing", difficulty: 5, prerequisites: ["adult_housing_lease"],
    acceptedAnswers: ["we'd like to renew the lease for another twelve months", "we would like to renew the lease for another twelve months", "we'd like to renew the lease for another 12 months", "we would like to renew the lease for another 12 months"],
  },
  {
    id: "adult_housing_give_notice", track: "adult", contentType: "sentence",
    en: "I'm calling to give notice that we're moving out.", pt: "estou ligando para avisar que vamos sair do imóvel.", emoji: "📦🚚",
    category: "adult_housing", difficulty: 5, prerequisites: ["adult_housing_landlord"],
    acceptedAnswers: ["i'm calling to give notice that we're moving out", "i am calling to give notice that we are moving out"],
  },

  // ---- escola dos filhos ----
  {
    id: "adult_parenting_settling_in", track: "adult", contentType: "sentence",
    en: "How is he settling in?", pt: "como ele está se adaptando?", emoji: "🏫🙂",
    category: "adult_parenting", difficulty: 3, prerequisites: [],
    acceptedAnswers: ["how is he settling in", "how's he settling in"],
  },
  { id: "adult_parenting_permission_slip", track: "adult", contentType: "phrase", en: "permission slip", pt: "autorização (bilhete da escola)", emoji: "📝✍️", category: "adult_parenting", difficulty: 2, prerequisites: [] },
  {
    id: "adult_parenting_absent", track: "adult", contentType: "sentence",
    en: "He'll be absent tomorrow because he's unwell.", pt: "ele vai faltar amanhã porque não está bem.", emoji: "🤒🏠",
    category: "adult_parenting", difficulty: 4, prerequisites: [],
    acceptedAnswers: ["he'll be absent tomorrow because he's unwell", "he will be absent tomorrow because he is unwell"],
  },
  {
    id: "adult_parenting_struggling", track: "adult", contentType: "sentence",
    en: "He's been struggling to follow the instructions in class.", pt: "ele tem tido dificuldade para acompanhar as instruções na sala.", emoji: "😕📋",
    category: "adult_parenting", difficulty: 4, prerequisites: [],
    acceptedAnswers: ["he's been struggling to follow the instructions in class", "he has been struggling to follow the instructions in class"],
  },
  {
    id: "adult_parenting_support_at_home", track: "adult", contentType: "sentence",
    en: "Is there anything we can do at home to support his learning?", pt: "tem algo que a gente possa fazer em casa para apoiar o aprendizado dele?", emoji: "🏠📚",
    category: "adult_parenting", difficulty: 5, prerequisites: ["adult_parenting_struggling"],
    acceptedAnswers: ["is there anything we can do at home to support his learning"],
  },
  {
    id: "adult_parenting_pick_up_early", track: "adult", contentType: "sentence",
    en: "I need to pick him up early today because of a medical appointment.", pt: "preciso buscá-lo mais cedo hoje por causa de uma consulta médica.", emoji: "🚗🩺",
    category: "adult_parenting", difficulty: 5, prerequisites: ["adult_health_appointment"],
    acceptedAnswers: ["i need to pick him up early today because of a medical appointment", "i need to pick him up early today"],
  },
  {
    id: "adult_parenting_bilingual", track: "adult", contentType: "sentence",
    en: "We speak Portuguese at home, so English is still new for him.", pt: "falamos português em casa, então o inglês ainda é novo para ele.", emoji: "🇧🇷🇦🇺",
    category: "adult_parenting", difficulty: 5, prerequisites: [],
    acceptedAnswers: ["we speak portuguese at home so english is still new for him", "we speak portuguese at home so english is still new to him"],
  },

  // ---- conversa e small talk ----
  {
    id: "adult_social_hows_your_week", track: "adult", contentType: "sentence",
    en: "How's your week been so far?", pt: "como está sendo a sua semana?", emoji: "☕🙂",
    category: "adult_social", difficulty: 3, prerequisites: [],
    acceptedAnswers: ["how's your week been so far", "how has your week been so far", "how's your week been"],
  },
  {
    id: "adult_social_what_do_you_do", track: "adult", contentType: "sentence",
    en: "What do you do for a living?", pt: "você trabalha com o quê?", emoji: "💼❓",
    category: "adult_social", difficulty: 3, prerequisites: [],
    acceptedAnswers: ["what do you do for a living"],
  },
  {
    id: "adult_social_originally_from", track: "adult", contentType: "sentence",
    en: "I'm originally from Brazil.", pt: "eu sou do Brasil, originalmente.", emoji: "🇧🇷",
    category: "adult_social", difficulty: 3, prerequisites: [],
    acceptedAnswers: ["i'm originally from brazil", "i am originally from brazil"],
  },
  {
    id: "adult_social_been_living_here", track: "adult", contentType: "sentence",
    en: "We've been living here for about two years.", pt: "moramos aqui há mais ou menos dois anos.", emoji: "🏡⏳",
    category: "adult_social", difficulty: 4, prerequisites: ["adult_social_originally_from"],
    acceptedAnswers: ["we've been living here for about two years", "we have been living here for about two years", "we've been living here for about 2 years", "we have been living here for about 2 years"],
  },
  { id: "adult_social_catch_up", track: "adult", contentType: "phrase", en: "catch up", pt: "colocar o papo em dia", emoji: "🤝", category: "adult_social", difficulty: 2, prerequisites: [] },
  {
    id: "adult_social_we_should_catch_up", track: "adult", contentType: "sentence",
    en: "We should catch up for a coffee sometime.", pt: "a gente devia marcar um café qualquer dia.", emoji: "☕🤝",
    category: "adult_social", difficulty: 4, prerequisites: ["adult_social_catch_up"],
    acceptedAnswers: ["we should catch up for a coffee sometime", "we should catch up for coffee sometime"],
  },
  {
    id: "adult_social_long_time", track: "adult", contentType: "sentence",
    en: "It's been ages since we last saw each other!", pt: "faz séculos que a gente não se vê!", emoji: "⌛😄",
    category: "adult_social", difficulty: 5, prerequisites: ["adult_social_we_should_catch_up"],
    acceptedAnswers: ["it's been ages since we last saw each other", "it has been ages since we last saw each other"],
  },
  {
    id: "adult_social_looking_forward", track: "adult", contentType: "sentence",
    en: "I'm really looking forward to the weekend.", pt: "estou muito animado para o fim de semana.", emoji: "🎉📅",
    category: "adult_social", difficulty: 4, prerequisites: [],
    acceptedAnswers: ["i'm really looking forward to the weekend", "i am really looking forward to the weekend"],
  },

  // ---- opinião e argumento ----
  { id: "adult_opinion_in_my_opinion", track: "adult", contentType: "phrase", en: "in my opinion", pt: "na minha opinião", emoji: "💭", category: "adult_opinion", difficulty: 2, prerequisites: [] },
  { id: "adult_opinion_to_be_honest", track: "adult", contentType: "phrase", en: "to be honest", pt: "pra ser sincero", emoji: "🙂", category: "adult_opinion", difficulty: 2, prerequisites: [] },
  {
    id: "adult_opinion_what_do_you_think", track: "adult", contentType: "sentence",
    en: "What do you think about it?", pt: "o que você acha disso?", emoji: "🤔💬",
    category: "adult_opinion", difficulty: 3, prerequisites: [],
    acceptedAnswers: ["what do you think about it", "what do you think"],
  },
  {
    id: "adult_opinion_fair_point", track: "adult", contentType: "sentence",
    en: "That's a fair point.", pt: "é um argumento válido.", emoji: "👍💬",
    category: "adult_opinion", difficulty: 3, prerequisites: [],
    acceptedAnswers: ["that's a fair point", "that is a fair point"],
  },
  {
    id: "adult_opinion_depends", track: "adult", contentType: "sentence",
    en: "It depends on the circumstances.", pt: "depende das circunstâncias.", emoji: "⚖️",
    category: "adult_opinion", difficulty: 3, prerequisites: [],
    acceptedAnswers: ["it depends on the circumstances"],
  },
  {
    id: "adult_opinion_see_your_point", track: "adult", contentType: "sentence",
    en: "I see your point, but I'm not entirely convinced.", pt: "entendo o seu ponto, mas não estou totalmente convencido.", emoji: "🤨💬",
    category: "adult_opinion", difficulty: 5, prerequisites: ["adult_opinion_fair_point"],
    acceptedAnswers: ["i see your point but i'm not entirely convinced", "i see your point but i am not entirely convinced"],
  },
  {
    id: "adult_opinion_agree_to_disagree", track: "adult", contentType: "sentence",
    en: "Let's agree to disagree.", pt: "vamos concordar em discordar.", emoji: "🤝🙃",
    category: "adult_opinion", difficulty: 4, prerequisites: [],
    acceptedAnswers: ["let's agree to disagree", "let us agree to disagree"],
  },
  {
    id: "adult_opinion_rather_not", track: "adult", contentType: "sentence",
    en: "To be honest, I'd rather not commit to that yet.", pt: "pra ser sincero, prefiro não me comprometer com isso ainda.", emoji: "✋⏳",
    category: "adult_opinion", difficulty: 5, prerequisites: ["adult_opinion_to_be_honest"],
    acceptedAnswers: ["to be honest i'd rather not commit to that yet", "to be honest i would rather not commit to that yet", "i'd rather not commit to that yet"],
  },

  // ---- conectores (palavra isolada → a mesma palavra fazendo trabalho numa frase de verdade) ----
  { id: "adult_conn_however", track: "adult", contentType: "word", en: "however", pt: "no entanto", emoji: "↔️", category: "adult_connectors", difficulty: 1, prerequisites: [] },
  { id: "adult_conn_although", track: "adult", contentType: "word", en: "although", pt: "embora", emoji: "🌦️", category: "adult_connectors", difficulty: 1, prerequisites: [] },
  { id: "adult_conn_therefore", track: "adult", contentType: "word", en: "therefore", pt: "portanto", emoji: "➡️", category: "adult_connectors", difficulty: 1, prerequisites: [] },
  { id: "adult_conn_unless", track: "adult", contentType: "word", en: "unless", pt: "a menos que", emoji: "🚧", category: "adult_connectors", difficulty: 1, prerequisites: [] },
  { id: "adult_conn_meanwhile", track: "adult", contentType: "word", en: "meanwhile", pt: "enquanto isso", emoji: "⏱️", category: "adult_connectors", difficulty: 1, prerequisites: [] },
  { id: "adult_conn_nevertheless", track: "adult", contentType: "word", en: "nevertheless", pt: "mesmo assim", emoji: "💪", category: "adult_connectors", difficulty: 1, prerequisites: [] },
  { id: "adult_conn_whereas", track: "adult", contentType: "word", en: "whereas", pt: "ao passo que", emoji: "⚖️", category: "adult_connectors", difficulty: 1, prerequisites: [] },
  { id: "adult_conn_furthermore", track: "adult", contentType: "word", en: "furthermore", pt: "além disso", emoji: "➕", category: "adult_connectors", difficulty: 1, prerequisites: [] },
  {
    id: "adult_conn_although_sentence", track: "adult", contentType: "sentence",
    en: "Although it was raining, we went to the beach.", pt: "embora estivesse chovendo, fomos à praia.", emoji: "🌧️🏖️",
    category: "adult_connectors", difficulty: 4, prerequisites: ["adult_conn_although"],
    acceptedAnswers: ["although it was raining we went to the beach"],
  },
  {
    id: "adult_conn_unless_sentence", track: "adult", contentType: "sentence",
    en: "I'll be there on time unless the train is late.", pt: "vou chegar na hora, a menos que o trem atrase.", emoji: "🚆⏰",
    category: "adult_connectors", difficulty: 4, prerequisites: ["adult_conn_unless"],
    acceptedAnswers: ["i'll be there on time unless the train is late", "i will be there on time unless the train is late"],
  },
  {
    id: "adult_conn_however_sentence", track: "adult", contentType: "sentence",
    en: "The plan is good; however, it's too expensive.", pt: "o plano é bom; no entanto, é caro demais.", emoji: "📝💸",
    category: "adult_connectors", difficulty: 4, prerequisites: ["adult_conn_however"],
    acceptedAnswers: ["the plan is good however it's too expensive", "the plan is good however it is too expensive"],
  },
  {
    id: "adult_conn_therefore_sentence", track: "adult", contentType: "sentence",
    en: "The flight was cancelled; therefore, we stayed another night.", pt: "o voo foi cancelado; portanto, ficamos mais uma noite.", emoji: "✈️🏨",
    category: "adult_connectors", difficulty: 5, prerequisites: ["adult_conn_therefore"],
    acceptedAnswers: ["the flight was cancelled therefore we stayed another night", "the flight was canceled therefore we stayed another night"],
  },
  {
    id: "adult_conn_whereas_sentence", track: "adult", contentType: "sentence",
    en: "I prefer working from home, whereas my colleague prefers the office.", pt: "eu prefiro trabalhar de casa, ao passo que meu colega prefere o escritório.", emoji: "🏠🏢",
    category: "adult_connectors", difficulty: 5, prerequisites: ["adult_conn_whereas"],
    acceptedAnswers: ["i prefer working from home whereas my colleague prefers the office"],
  },
];

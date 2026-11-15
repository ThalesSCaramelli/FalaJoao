# FalaJoao — Plano de conteúdo (dez/2026 → mai/2027)

> O que vamos escrever, em que ordem e por quê. `LEARNING_PHILOSOPHY.md` é o *porquê* pedagógico;
> `CONTENT_GUIDE.md` é o *como* técnico (formato de item, ids, áudio); este arquivo é o *o quê* e o
> *quando*. É horizonte, não contrato: no fim de cada mês o plano é revisto com base no relatório
> (seção 6) — a criança real manda mais que o planejamento.

---

## 1. Ponto de partida (inventário em 15/11/2026)

| Trilha | Itens | Como está distribuído | O que isso diz |
|---|---|---|---|
| **kids** (João, 4 anos; revisão do André) | 251 | 138 em difficulty 1, só 10 em 4–5. Cores, animais, comida, corpo, roupas, família e brinquedos são **só palavras soltas**. | Risco de "content dump" (LEARNING_PHILOSOPHY.md §54). Quase não há cadeias palavra → frase → comunicação (§10, §23). O lugar "Família" não tem cenário. |
| **spelling** (André, 8 anos) | 60 | 8 grupos de som com 6 palavras + 1–2 frases cada. | Base boa. Falta frase por grupo, leitura de texto corrido e os padrões seguintes da sequência de phonics. |
| **adult** (Thales) | 70 | 7 categorias, 22 cenários, cadeias bem formadas. | Saudável. Expandir para novas áreas da vida, sem mudar o formato. |

Conclusão: **o próximo semestre não é "mais palavras"**. Para o João, é transformar as palavras que
já existem em frases e situações. Para o André, é avançar na sequência de phonics e começar a ler
textos. Para o adulto, é abrir áreas novas da vida.

---

## 2. A ideia que deixa o plano interessante: um tema da família por mês

Todo mês tem **um tema comum às três trilhas**, alinhado com o calendário real da família na
Austrália (verão em dezembro, volta às aulas no fim de janeiro, Páscoa em abril...). Cada um
aprende o tema no seu nível, e o assunto vira conversa em casa:

```text
Tema do mês: "Praia e verão"
  João   → "Can I go swimming?"            (pedir, na situação)
  André  → beach, shell, sunscreen          (escrever certo; ler uma historinha da praia)
  Thales → "We're heading to the coast for the long weekend." (planejar, conversar)
  Em casa → no jantar, cada um conta uma coisa do tema em inglês
```

Isso não é enfeite, é a metodologia:
- **Diálogo e pais como parceiros** (§6, §32, §34): o tema comum é o que cria conversa entre pais e filhos.
- **Do digital ao mundo real** (§33, §49): o tema é a vida daquele mês, então o app prepara para o
  que vai acontecer de verdade (a praia, a volta às aulas).
- **Mesmo mundo, tarefa diferente** (§25): a mesma praia é ouvida pelo João, escrita pelo André e
  conversada pelo pai.

---

## 3. Regras de qualidade (valem para todo item novo)

Antes de entrar no `data.js`, todo item novo precisa responder "sim":

1. **Tem uso?** Está numa situação de verdade, ou é a resposta de um cenário, ou é degrau de uma
   cadeia. Palavra solta "porque é do tema" não entra.
2. **Faz parte de uma cadeia?** Palavra nova (difficulty 1) só entra se, no mesmo mês, aparecer
   também numa expressão ou frase (2–5) com `prerequisites` apontando para ela.
3. **Proporção para crianças**: no máximo **40% de palavras soltas** por mês na trilha kids; o
   resto são expressões, frases e cenários.
4. **Todo lugar tem cenário**: lugar novo no mapa já nasce com pelo menos um cenário
   problema → frase.
5. **Cenário infantil sempre com `promptPt` e `promptEn`** (o João ouve em português, o André lê
   em inglês).
6. **Ortografia**: palavra da trilha spelling tem que ser exemplo **limpo** do padrão do grupo; as
   exceções vão para tricky words, com `spellingTip`.
7. **Sem gíria pesada** ("arvo", "barbie", "snag") até as cadeias "naturais" rodarem um tempo,
   como já foi decidido em 2026-08-26 (CONTENT_GUIDE.md §8). Inglês australiano neutro pode
   ("Mum", "lunchbox", "sunscreen", "footy" não).
8. **Checklist técnico** do CONTENT_GUIDE.md §9: id estável, `acceptedAnswers` nas frases,
   áudio gerado (ambiente FalaJoao), `sw.js` atualizado, teste no navegador.

---

## 4. Calendário

Tamanho de cada mês (para caber na rotina e manter qualidade):

| Trilha | Por mês |
|---|---|
| João (kids) | ~15 itens: no máximo 6 palavras + ~9 expressões/frases, com 2 cadeias de evolução e 2 cenários |
| André (spelling) | 1–2 grupos de som (6 palavras + 2 frases cada) + 4 tricky words + 1 cenário; a partir de fevereiro, 1 historinha |
| Thales (adult) | 1 categoria (~12 itens: palavras → frases nível 4–5) + 3–4 cenários |

### Dezembro — ☀️ Praia, verão e Natal
Férias de verão; Natal e Ano-Novo.

> ✅ **Feito em 15/11/2026.** João: categoria e lugar "Praia" (5 palavras + 7 frases, 3 cenários),
> Natal na família (3 itens, 2 cenários; o lugar "Família" ganhou seu primeiro cenário). O "I'm
> hot" que já existia (`phrase_im_hot`) foi reaproveitado como degrau, em vez de duplicado.
> André: `spell_ck_ng_nk` (6 palavras + 2 frases, 1 cenário) + 4 tricky words (Christmas,
> holiday, family, laugh, no lugar de friend/people, que já existiam); dicas de phonics novas para
> 'ng' e 'nk'. Thales: `adult_travel` (14 itens, lugar "Viagem", 5 cenários). Dica "em casa":
> `FAMILY_THEMES` (aparece em Configurações e no relatório a partir de 1/12). Avatar: camiseta
> "sand" (Praia) e mochilas "blue"/"lime" (ortografia), e cada perfil só vê os itens da sua trilha.

- **João**: categoria nova `beach` (o lugar "Praia" vai para o mapa): sand, sunscreen, hat, swim,
  shade. Cadeias: `swim` → "Can I go swimming?" → "Can I go swimming with Dad, please?";
  `hot` → "I'm hot" → "I'm hot, can I have some water?". Cenários: "O sol está muito forte e você
  está sem chapéu"; "Você quer entrar no mar". **Pendência antiga**: cenário para o lugar
  "Família" ("Seu avô chegou para o Natal").
- **André**: grupo `ck / ng / nk` (duck, sock, sing, swing, think, pink) + frase "We swing at the
  park in the sun." Tricky words: Christmas, holiday, friend, people. Cenário: "Your cousin asks
  what you did at the beach."
- **Thales**: `adult_travel`: book, check in, delay, luggage; "Our flight has been delayed by two
  hours."; "Is there anywhere nearby you'd recommend?"; "Could we get a late check-out?". Cenários
  no hotel, no aeroporto e no aluguel de carro.
- **Em casa**: no fim do dia, cada um diz uma coisa que gostou: "I liked the beach!"

### Janeiro — 🎒 Pronto para a escola
O Term 1 começa no fim de janeiro, e este é o mês em que o app mais se paga.
- **João**: rotina da escola em frases (tudo vira frase; quase nenhuma palavra solta nova): "Where
  do I put my bag?", "I need to wash my hands.", "I'm finished!", "Can I sit here?". Sentimentos
  com pedido: `sad` → "I'm sad" → "I'm sad, I miss Mum." (comunicar a emoção para a professora é
  o objetivo). Cenários: "Você terminou a atividade antes dos outros"; "Você está com saudade da
  mamãe".
- **André**: grupo `-ed / -ing` com a regra de dobrar a consoante (play → played, swim →
  swimming, stop → stopped). Trazer frases que ele escreve na escola: "Yesterday I played with my
  friends." Tricky words: were, where, there, does.
- **Thales**: `adult_school_admin`: enrolment, uniform, lunch order, pupil-free day, newsletter;
  "Does he need to bring anything on the first day?"; "I'd like to update our emergency contact
  details.".
- **Em casa**: ensaiar o primeiro dia (o pai é a professora, a criança pede para ir ao banheiro).

### Fevereiro — 🤝 Amigos e sentimentos
Primeiras semanas de aula; é quando surgem os conflitos no pátio.
- **João**: resolver conflito: "Stop, I don't like that.", "Can I have a turn?", "That's mine,
  please give it back.", "Are you okay?". Cadeias a partir de `my_turn` / `your_turn`, que já
  existem.
- **André**: grupo `oa / ow / oi / oy` (boat, coat, snow, coin, toy, boy). **Primeira historinha**
  (depende do modo história, ver seção 5): 5–6 frases curtas usando só palavras dos grupos que ele
  já viu, com 1 pergunta de compreensão.
- **Thales**: trabalho avançado: e-mail e reunião ("I'll loop you in.", "Let's circle back to this
  next week.", "Could you walk me through it?"), com cenários de reunião difícil.
- **Em casa**: "Who did you play with today?", em inglês.

### Março — 🛒 Comida e mercado
- **João**: comida passa de palavra a pedido, juntando com números e cores (CONCEPT →
  COMMUNICATION, §10): "two red apples", "Can I have a banana, please?", "I don't like it." →
  "I don't like it, can I have something else?". Lugar novo "Mercado" com missão (§26): pegar 3
  coisas da lista.
- **André**: plurais `-s / -es / -ies` (apples, boxes, berries). Historinha 2: "Shopping with Dad".
- **Thales**: `adult_money`: bank, receipt, refund; "I'd like to return this, it's faulty."; "Is
  there a fee for that?". Cenários de devolução e de banco.
- **Em casa**: a criança faz a lista do mercado em inglês (o André escreve, o João fala).

### Abril — 🏃 Parque, esporte e Páscoa
Feriado de Páscoa e férias de outono.
- **João**: verbos de ação com pedido de permissão (run, jump, climb, kick) → "Can I climb the
  tree?" → "Watch me!". Cenário: "Você quer brincar de pega-pega".
- **André**: letras mudas e grafias alternativas (`kn / wr / mb / ph / wh`: knee, write, climb,
  phone, whale). Historinha 3: "The Easter egg hunt".
- **Thales**: `adult_car_community`: mechanic, rego, service; "There's a strange noise when I
  brake."; conversa com o treinador do esporte das crianças.
- **Em casa**: caça aos ovos com pistas escritas em inglês (o André lê, o João procura).

### Maio — 🩺 Corpo, saúde e cuidado
O inverno começa; temporada de resfriados.
- **João**: corpo vira comunicação: "My tummy hurts.", "I feel sick.", "I need a tissue.", "I'm
  cold, can I have my jacket?". Usa `body_*`, que hoje são só palavras.
- **André**: sufixos e homófonos: `-ful / -ly / -tion` e **there / their / they're, to / too /
  two** (erro clássico do Year 3; tem que ser frase, porque sozinho não dá para saber qual é).
- **Thales**: `adult_opinion_2`: notícias e conversa mais longa, com phrasal verbs ("figure out",
  "run out of", "put up with").
- **Revisão do semestre** (ver seção 6) e decisão sobre o próximo.

**Fim do semestre (estimativa):** João com ~90 itens novos, quase todos expressões e frases, e
~12 cenários novos; André com ~10 grupos de som novos, ~25 tricky words e 4 historinhas; Thales
com 6 categorias novas e ~20 cenários.

---

## 5. O que precisa de código (fora do conteúdo)

O conteúdo acima é quase todo `data.js`. Só três peças exigem programação, na ordem em que o
calendário precisa:

| Quando | O quê | Por quê |
|---|---|---|
| Dez ✅ | **"Em casa"**: dicas para os pais por tema (`FAMILY_THEMES` em data.js), mostradas em Configurações e no relatório | Ponte com o mundo real (§33, §34); é texto, mas precisa de lugar na tela |
| Jan | **Montar a frase** com blocos de palavras + **completar a frase** (`I want ___`) | Apoio quando a frase longa trava (§17); já estava na lista de pendências do André |
| Fev | **Modo história**: uma sequência de frases + pergunta de compreensão, reaproveitando os rounds que já existem | Historinhas são o próximo passo de leitura do André (§24, §25) e servem para o João ouvir |

Além disso, a cada categoria nova: **itens de avatar** com `unlockedBy` nela (recompensa visível
ao abrir conteúdo novo, §28), inclusive para as trilhas adult e spelling, que hoje não desbloqueiam nada.

---

## 6. Revisão mensal (o plano se adapta à criança, e não o contrário)

No fim de cada mês, com o relatório compartilhado em Configurações:

- **André**: os "padrões de grafia pra praticar" do relatório decidem o grupo do mês seguinte. Se
  'oo' ainda aparece no topo, o próximo mês traz mais palavras com 'oo' antes de avançar.
- **João**: itens "com mais dificuldade" que são frases → conferir se os `prerequisites` estão
  certos (a decomposição precisa ter onde descer).
- **Engajamento** (`dailyActivity`): caiu → o mês seguinte puxa mais situação e história, menos
  item novo.
- **Mundo real**: perguntar em casa: "usou alguma frase do app sem ninguém pedir?" É a métrica
  que mais importa (§49, §50).
- Atualizar este arquivo (o que foi feito, o que mudou de ordem) e registrar no PROCESS.md
  qualquer decisão nova.

---

## 7. Fora deste semestre (de propósito)

- Gíria australiana pesada (decisão de 2026-08-26).
- Gramática explícita para o João ("present simple"): contexto antes da abstração (§7).
- Conteúdo gerado por IA sem revisão: a IA pode **rascunhar** frases e histórias, mas todo item
  passa pelas regras da seção 3 e por revisão humana (§40: "AI must augment, not become").
- Volume pelo volume: nenhuma meta de "500 palavras". A meta é cenário resolvido e frase usada.

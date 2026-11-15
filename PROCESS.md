# FalaJoao — Processo de trabalho

> Formato leve pra registrar decisões e reportar auditorias/propostas. Extraído de uma análise
> externa trazida pelo usuário (a maior parte do conteúdo dela já estava coberta por
> `LEARNING_PHILOSOPHY.md`/`DESIGN_BRIEF.md` — isto aqui é só a parte operacional, nova).

---

## Decision Log

Decisões arquiteturais/pedagógicas importantes ficam registradas aqui, pra não reabrir debate
sobre algo já decidido sem motivo novo.

### Speaking scoring: matched / inconclusive (não matched/partial/failed)

- **Contexto**: reconhecimento de fala de criança de 4 anos é ruidoso (microfone, pronúncia
  infantil, distração).
- **Alternativas consideradas**: escala de 3 graus (matched/partial/failed) parecia mais rica.
- **Escolha**: só dois estados — `matched` / `inconclusive`.
- **Porquê**: um terceiro grau ("partial") seria precisão artificial que o reconhecimento de fala
  não sustenta nessa idade — a mesma armadilha que já evitamos ao não avaliar pronúncia.
- **Consequência**: `inconclusive` nunca mexe na caixa do SRS (nem pune, nem premia).

### Ids estáveis em vez de gerados por slug

- **Contexto**: ids do conteúdo eram gerados em runtime (`${categoria}_${slug(en)}`).
- **Escolha**: ids viraram texto fixo escrito à mão em `data.js`.
- **Porquê**: sem isso, qualquer mudança de texto/categoria quebraria o progresso salvo do
  usuário silenciosamente.
- **Consequência**: ao adicionar item novo, o id nunca muda depois de criado (ver `CONTENT_GUIDE.md`).

### Voz neural pré-gravada em vez de TTS ao vivo

- **Contexto**: `speechSynthesis` ao vivo do navegador soou "muito robótico" no teste real.
- **Escolha**: áudio pré-gerado (edge-tts, voz Natasha pro inglês / Antônio pro português) por item,
  com fallback pro TTS ao vivo. Cobre tanto o conteúdo-alvo (inglês) quanto a narração (português).
- **Porquê**: qualidade muito superior, gratuito, continua funcionando offline (arquivo cacheado).
- **Consequência**: todo item novo de conteúdo-alvo (inglês) precisa rodar `scripts/generate_audio.py`;
  toda fala nova em português (situação/cenário/narração avulsa) precisa rodar
  `scripts/generate_pt_audio.py`.

### `prerequisites` é soft link, não gate de progresso

- **Contexto**: um feedback externo apontou que `prerequisites` em `CONTENT` podia ser lido como
  "o aluno tem que dominar isso antes" (gate) ou como "isso ajuda a decompor/entender aquilo"
  (building block) — o campo hoje mistura as duas leituras sem deixar explícito qual é.
- **Escolha**: `prerequisites` significa building block, não gate. O único lugar do engine que lê
  esse campo é `needsDecomposition`/`buildSession` (engine.js) — e só entra em ação **depois** que
  o aluno já errou o item repetidamente (`FAILURE_THRESHOLD`), nunca antes de introduzi-lo.
- **Porquê**: um gate de verdade (não introduzir X até dominar Y) exigiria lógica nova em
  `getNewCandidates`; o padrão atual já resolve o caso real (item difícil → decompõe) sem isso.
- **Consequência**: ao criar uma "cadeia de evolução" (ex. `phrase_water_please` →
  `phrase_water_glass_please`), o item mais avançado não fica bloqueado até o simples ser
  dominado — ele só aparece **depois** na prática porque tem `difficulty` mais alta, e
  `getNewCandidates` já ordena por difficulty ascendente. Ver `CONTENT_GUIDE.md` seção 8.

### Atualização do app: recarrega sozinho, sem exigir fechar/abrir

- **Contexto**: `sw.js` já usava `skipWaiting()`/`clients.claim()`, mas isso só faz o novo Service
  Worker assumir o controle — não recarrega a página já aberta. Quem já tinha o app aberto ficava
  preso na versão antiga até fechar e abrir de novo na mão (achado durante a demo pro João).
- **Escolha**: um listener de `controllerchange` recarrega a página automaticamente, uma vez, assim
  que o novo SW assume — silencioso, sem popup interrompendo uma rodada. Além disso, um botão em
  Configurações (`checkForUpdate`) força checar agora, sem esperar o navegador checar sozinho.
- **Porquê**: simples — é o padrão já esperado de PWA, não precisa de nada novo (nem push
  notification, nem polling).

### Relatório de progresso: continua manual (compartilhar), sem backend — mas agora com dados estruturados

- **Contexto**: usuário perguntou se já crescemos a ponto de precisar de um banco de dados remoto
  pra acompanhar o aprendizado do João. Decidiu não construir backend agora — quer continuar usando
  o botão "Compartilhar relatório" que já existia — mas quer conseguir pedir pro Claude interpretar
  esse relatório e gerar gráficos de evolução, e perguntou se dá pra medir engajamento.
- **Escolha**: dois pedaços, nenhum precisa de servidor:
  1. `engine.js`: log diário leve de atividade (`ACTIVITY_LOG_KEY`, função `logActivity(kind)`),
     guardado por data (`{seen, correct, wrong, speech}` por dia, até 60 dias), alimentado pelos
     pontos que já existem — `markIntroduced`, `recordResult`, `recordSpeechAttempt` (fala
     inconclusiva também conta como engajamento, mesmo não mexendo na caixa do SRS). É o que faltava
     pra "evolução ao longo do tempo" — antes só existia a foto do momento atual e o streak (dias
     seguidos), sem histórico de volume por dia.
  2. `app.js`: `buildStructuredReportData()` empacota esse log + contagens por categoria/estágio +
     streak + itens com mais dificuldade num JSON, anexado ao texto do relatório compartilhado (o
     texto legível continua igual, o JSON vem depois, delimitado). Quem colar o relatório inteiro
     numa conversa com o Claude ganha os dados pra pedir gráfico sem precisar exportar nada à parte.
- **Porquê**: o mecanismo de compartilhamento manual já resolve o caso real (relatório sob demanda,
  quando o usuário quiser mostrar pra alguém ou analisar) — um backend real só valeria a pena se
  precisássemos de histórico centralizado entre aparelhos ou notificação automática, que não é o
  pedido de hoje.
- **Consequência**: tudo continua 100% local (localStorage), nada sai do aparelho a menos que o
  próprio usuário compartilhe. Se um dia quisermos gráfico dentro do próprio app (sem depender do
  Claude), o dado já está no formato certo — só falta a UI.

### "Última vez que abriu o app" não pode ser a própria checagem

- **Contexto**: usuário perguntou se dá pra saber quando o João abriu o app pela última vez.
  `touchStreak()` já existia e marca o dia de hoje sempre que a Home renderiza — inclusive quando é
  o próprio usuário (pai) abrindo o app só pra checar Configurações. Se a resposta lesse
  `loadStreak()` depois desse touch, ia sempre mostrar "hoje", mesmo quando o João não abriu.
- **Escolha**: `engine.js` tira uma foto (`streakAtLoad`) do streak assim que o script carrega, antes
  de qualquer `touchStreak()` rodar nessa sessão. `buildProgressSummary()` (tela de Configurações) e
  `buildStructuredReportData()` (relatório compartilhado) usam essa foto, não o valor ao vivo.
- **Porquê**: sem isso, o próprio ato de checar corrompe a resposta — o dado vira mentiroso bem no
  caso de uso que o motivou.
- **Consequência**: `streakAtLoad` é a fonte certa pra "quando foi a última vez" em qualquer UI
  futura; `loadStreak()`/`touchStreak()` continuam sendo pra lógica de streak em si (badge da Home).

### Segundo perfil (André, 8 anos): lista fixa de 2, não um sistema geral de N perfis

- **Contexto**: o irmão mais velho do João (8 anos, já fala/entende bastante inglês) quis algo pra
  ajudá-lo a ler e escrever. Precisava separar o estado de aprendizagem de cada criança — até então
  tudo (`learningState`, streak, activity, avatar, voz/velocidade) era um único blob global em
  `localStorage`, sem noção de "de quem" era o progresso.
- **Escolha**: `PROFILES` em engine.js é uma lista fixa de exatamente 2 (`joao`/`oral`,
  `andre`/`literacy`) — não uma tela de "criar perfil". `profileKey(base)` sufixa toda chave
  por-perfil (`<base>::<id>`); `meuIngles_active_profile` guarda qual está ativo. Migração automática
  na primeira carga move as 6 chaves antigas sem sufixo pra `::joao`, preservando o progresso real
  dele. Campo chamado `mode` (não `focus`) de propósito — deixa a porta aberta pra um perfil ter mais
  de uma habilidade um dia, sem forçar isso agora.
- **Ponto que exigiu mais cuidado**: não basta trocar a chave lida por `localStorage.getItem` — cada
  variável de módulo já carregada em memória (`learningState`, `streakAtLoad`, `avatarState`,
  `chosenVoiceURI`, `speechRate`, `adaptationLog`) precisa ser recarregada explicitamente ao trocar
  de perfil (`reloadProfileState()`, app.js), senão a tela mostra dado do perfil errado até um F5.
  `adaptationLog` (o único que vive em `sessionStorage`, não `localStorage` — achado só grepando os
  dois) é só zerado em memória ao trocar, sem chave por perfil própria (é debug, não dado real).
- **`pickRoundType` (engine.js)**: pro modo `literacy`, nunca escolhe `intro` — "não introduzido
  nesse perfil" não é o mesmo que "desconhecido pela criança" (o André já fala inglês; mostrar a
  tela de "palavra nova" pra ele seria condescendente). Todo item novo já entra direto como `read`
  ou `write`; se ele acerta de cara, o SRS avança normalmente — funciona como teste de nível de
  graça, sem precisar de um conceito de diagnóstico separado.
- **`read`/`write` (app.js)**: quando o item tem `SCENARIO_BY_CORRECT_ID[item.id]`, usam o
  `promptPt` do cenário como abertura comunicativa (ex. "você está com sede" → ler/escrever "Can I
  have some water, please?") em vez de pedir a palavra isolada — mesmo princípio de problem-posing
  que já rege o round `situation` do João, só que lendo/escrevendo em vez de ouvir/reconhecer.
  Zero conteúdo novo em `CONTENT` pra essa leva — reaproveita os itens e cenários que já existiam.
- **Porquê não um sistema geral de perfis**: só 2 pessoas usam o app hoje; construir criação/gestão
  de N perfis seria complexidade sem necessidade real (mesmo princípio de "deterministic first, não
  implementar antes de ter evidência" do `LEARNING_PHILOSOPHY.md`).
- **Fica pra depois** (não esquecido, ver plano da sessão): progressão de leitura em mais níveis
  (associação, compreensão narrativa) e escrita tipo "completar a frase" (`I want ___`) — exigem
  conteúdo novo, não só motor; adaptação automática read↔write por desempenho do André.

### Terceiro perfil (Thales, adulto): trilha de conteúdo separada, não "dificuldade 6+"

- **Contexto**: o usuário (pai) quis uma trilha pra ele mesmo — vocabulário mais complexo e frases
  longas, seguindo a mesma metodologia. Até aqui todo `CONTENT` era visto por todos os perfis
  (André e João só mudavam o *tipo* de rodada, não o conteúdo).
- **Escolha**: campo opcional `track` em `CONTENT`/`SITUATIONS` (ausente = `"kids"`, então nenhum
  item antigo precisou mudar) e `track` no perfil. `profileContent()`/`profileSituations()`/
  `profileCategoryIds()` (engine.js) filtram tudo que monta sessão, mapa, grade de categorias e
  relatório. Categorias adultas têm prefixo `adult_` e ids de item também (`adult_work_deadline`).
- **Porquê não só `difficulty` mais alta**: `getNewCandidates` ordena por difficulty — o João
  acabaria recebendo "Would it be possible to extend the deadline?" depois de dominar o básico, e
  o adulto teria que atravessar "red"/"dog" antes de chegar no que interessa. É outro público, não
  o próximo degrau.
- **Modo `adult`** (`pickAdultRoundType`): item novo passa pelo `intro` (vocabulário complexo é
  novo de verdade, diferente do André); depois sorteia entre `meaning` (novo: frase em inglês →
  escolher o sentido em português, distratores do mesmo contentType), `write`, e — quando o item
  tem cenário — `situation`/`read`; `speak` a partir da caixa 2. Sem `choice` por imagem: emoji
  não carrega o sentido de "nevertheless". Na caixa 0/1 não tem `write` (reconhecer antes de
  produzir). Mesmos degraus 1→5 e cadeias de evolução por `prerequisites` do resto do conteúdo.
- **Speaking do adulto**: `matchesAcceptedAnswer` exige ~70% do tamanho da frase aceita pra
  trilha adulta (um "the deadline" solto não conta como a frase inteira); pras crianças continua
  generoso de propósito (communication before perfection).
- **Escrita**: `normalize` do round `write` agora também tira apóstrofo (reto e curvo) — o teclado
  do iPhone troca `'` por `’` sozinho; vale pro André também (só fica mais tolerante).
- **Cenários**: vários por lugar (o primeiro de cada `situationId` abre a visita no mapa); campo
  opcional `speaker` troca o 👩‍🏫 do balão (colega, recepção da clínica, imobiliária, vizinho).
- **Fica pra depois**: avatar não desbloqueia nada na trilha adulta (`unlockedBy` aponta pra
  categorias infantis) — não parece fazer falta pra adulto; se fizer, é só apontar itens de
  `AVATAR_ITEMS` pra categorias `adult_*`. Áudio neural dos 70 itens/22 cenários/6 lugares novos
  ainda não gerado (ver checklist em `CONTENT_GUIDE.md`) — até lá cai no TTS do navegador.

### André: imersão em inglês + ditado + correção por padrão de som (phonics)

- **Contexto**: o usuário contou que o André (8 anos) tem muita dificuldade de escrever certo —
  "school" vira "scull". Ele já fala e entende inglês; o round `write` pedia a palavra a partir da
  tradução em português e, no erro, só dizia "Quase!". Pedido: foco em escrever certo, tudo em inglês.
- **Diagnóstico**: "scull" acerta os SONS (s-k-oo-l) e erra a GRAFIA de dois deles ("ch" com som
  de /k/, "oo"). Alfabetização em inglês é ensinada assim (phonics): cada som tem algumas grafias e
  a criança aprende os padrões. Então o app precisa ensinar o padrão, não só marcar errado.
- **Escolha** (4 peças, todas determinísticas):
  1. **Imersão** (`isImmersion`/`tr`, app.js): no modo `literacy` todo texto do quiz é em inglês;
     cenários ganharam `promptEn` (com áudio em inglês); a ajuda é ouvir em inglês, não traduzir.
     João e Thales não mudam.
  2. **Ditado** (`roundType: "dictation"`): ouve e escreve. Vira o round principal do André
     (`pickLiteracyRoundType`, engine.js). `write` só com cenário — sem a tradução, imagem sozinha
     é ambígua demais pra pedir escrita.
  3. **Correção que ensina** (`analyzeSpelling`, engine.js; `setupTypingCheck`, app.js): 1º erro
     mostra as letras dele (verde/vermelho/riscado/"_") + a dica do padrão de som do pedaço que
     errou, com outras palavras do app que seguem a regra ("'oo' says /oo/ — like moon, food,
     pool"), sem entregar a palavra. 2º erro conta no SRS, mostra a grafia certa com o padrão
     destacado e pede pra digitar certo uma vez (não pontua; dá pra pular).
  4. **Trilha `spelling`** (60 itens): palavras agrupadas por padrão (oo, sh/ch/th, ee/ea, ai/ay,
     magic e, igh/ow/ou, ar/or/ir/ur, tricky words com `spellingTip`), cada grupo com frase(s) que
     usam as palavras e 4 cenários. Perfil passa a ter `tracks` (lista) e `focusTrack` (o que entra
     primeiro como novo); o André vê `["kids", "spelling"]`.
- **Relatório dos pais**: `logSpellingMistake` guarda por perfil quais padrões ele erra, com
  exemplo ("'ch' com som de /k/: school → scull") — aparece em Configurações e no relatório
  compartilhado (`spellingPatterns` no JSON). É o dado mais útil pra ajudar em casa.
- **Porquê assim**: scaffolding em vez de punição (LEARNING_PHILOSOPHY.md seções 16, 35, 36): o
  menor passo que deixa ele acertar sozinho é ver QUAIS letras e QUAL regra. Regra por regex, sem
  "IA" (seção 39) — dá pra explicar exatamente por que cada dica apareceu.
- **Correção (15/11/2026, feedback do usuário: "muito áudio em português")**: sobravam dois
  caminhos com narração em PT pro André — o nome do lugar ao tocar no mapa e o cenário que abre
  cada visita (round `situation`, que ainda não olhava o modo). Agora: lugares e categorias têm
  `nameEn` (mostrado e falado em inglês, áudio `place_<id>`); o cenário de abertura vira `write`
  pra ele (foco em escrita) com a situação em inglês tocando sozinha; o round `situation` também
  respeita a imersão; textos da Home e do mapa seguem o idioma do perfil (`renderHomeStaticTexts`).
  Regra daqui pra frente: **nada falado em português no perfil do André** — todo `speakPT` novo
  precisa de um caminho em inglês quando `isImmersion()`.
- **Fica pra depois**: montar a frase com blocos de palavras (apoio quando ele trava numa frase
  longa) e completar a frase (`I want ___`); historinhas curtas com pergunta de compreensão;
  mais grupos de padrão conforme o relatório mostrar onde ele mais erra.

### Dicionário do adulto: definição em inglês simples, achada no próprio texto

- **Contexto**: o usuário pediu, no perfil adulto, um dicionário explicando o significado das
  palavras.
- **Escolha**: `ADULT_DICTIONARY` (data.js) com 83 verbetes: `term`, `pos`, definição em inglês
  simples (estilo dicionário pra quem aprende), tradução em português como apoio, e `forms` (outras
  formas que aparecem nas frases: settling in, sorted out). Cobre também palavras que só aparecem
  DENTRO das frases (overwhelmed, circumstances), não só os itens. `findDictionaryTerms`
  (engine.js) acha os termos no texto: do mais longo pro mais curto, sem sobrepor, só em fronteira
  de palavra ("lease" não casa em "please"). Três pontos de uso: palavras sublinhadas no `intro` e
  no `meaning`, a tela "Dictionary" (Home do adulto, com busca em inglês ou português) e a grade da
  categoria (tocar num item que é verbete abre a explicação).
- **Exemplo do verbete não é escrito à mão**: é uma frase da própria trilha que usa o termo
  (`dictionaryExample`) — contexto real, com áudio que já existe. Se a única frase de exemplo é a
  própria frase da rodada, o exemplo some: a tradução dela entregaria a resposta do `meaning`.
- **Consultar não mexe no SRS** — é scaffolding pra entender, não resposta avaliada.
- **Regra daqui pra frente**: frase adulta nova com palavra difícil pede verbete novo no
  `ADULT_DICTIONARY` (ver CONTENT_GUIDE.md).

---

## Arquitetura de conteúdo (5 camadas)

Cada camada responde uma pergunta diferente. Útil pra decidir "isso é dado de `CONTENT`, ou é
`SITUATION`, ou é lógica de `engine.js`?" sem reabrir a discussão toda vez.

| Camada | Pergunta que responde | Vive em |
|---|---|---|
| **Content** | Qual é a unidade linguística? (palavra/frase/sentença, en/pt, dificuldade) | `data.js`, array `CONTENT` |
| **Category** | Sobre o quê? (tema — animais, comida, cores) | `data.js`, `CATEGORY_META` |
| **Situation** | Onde/quando isso é usado? (lugar do mapa — banheiro, se apresentar) | `data.js`, `SITUATIONS` |
| **Scenario** | Qual problema comunicativo o aluno precisa resolver? (problem-posing) | `data.js`, `SCENARIOS` |
| **Engine** | O que este aluno já sabe, e qual é a próxima melhor experiência pra ele? | `engine.js` |

Category é pra **explorar** conteúdo (menu livre); Situation/Scenario são pra **usar** inglês de
verdade (uma necessidade comunicativa, não um tema). Por isso Situation pesa mais que Category na
Home/Adventure — é o que está mais perto do objetivo real de aprender a língua.

---

## Formato de auditoria (pra propostas grandes)

Quando eu (Claude) analisar o repositório antes de uma mudança grande, reporto assim:

- **A. Já alinhado** — o que já está de acordo, preservar.
- **B. Parcialmente alinhado** — funciona, mas podia melhorar.
- **C. Conflitante** — o que vai contra a direção desejada.
- **D. Faltando** — sistemas importantes que não existem ainda.
- **E. Dívida técnica** — problema técnico real (não estético).
- **F. Complexidade prematura** — coisa que pareceria sofisticada mas não deveria ser construída ainda.

Cada mudança proposta é classificada:

```text
Impacto:    Alto / Médio / Baixo
Esforço:    Alto / Médio / Baixo
Risco:      Alto / Médio / Baixo
Prioridade: P0 (integridade/correção) / P1 (aprendizagem/produto core) / P2 (qualidade) / P3 (futuro)
```

---

## Roadmap (horizonte, não cronograma)

- **NOW**: o que está em andamento ou é o próximo passo natural.
- **NEXT**: já claro que vem, mas não é urgente.
- **LATER**: direção conhecida, sem detalhe ainda.
- **FUTURE**: mencionado no LEARNING_PHILOSOPHY/DESIGN_BRIEF, mas explicitamente não priorizado agora (IA adaptativa, backend, learner model complexo, FSRS).

### NOW

- Pendência técnica pequena: nunca confirmei com 100% de certeza que o Service Worker está
  guardando os áudios/assets mais recentes offline (v14+) — o navegador de teste deu sinais
  inconsistentes depois de muitos ciclos de registro/cancelamento na mesma sessão. Reproduzi a
  lista exata de arquivos manualmente e funcionou, então é bem provável que seja só o ambiente de
  teste, não o código — mas vale um teste calmo num aparelho de verdade antes de confiar 100%.

### NEXT

- **Plano de conteúdo dez/2026 → mai/2027** em `CONTENT_PLAN.md`: um tema da família por mês
  (as três trilhas no mesmo assunto), regras de qualidade para item novo e revisão mensal guiada
  pelo relatório. As pendências de conteúdo abaixo (cadeias de evolução, cenário do lugar
  "Família") estão encaixadas nele.
- Mais cadeias de "evolução natural" além de água/saudação (padrão documentado em
  `CONTENT_GUIDE.md` seção 8, pronto pra reaproveitar).
- 4 `SITUATIONS` ainda sem `SCENARIO` de problem-posing: `cafeteria`, `classroom`, `family`,
  `animals` — hoje só vocabulário solto nelas, sem a abertura "professora pergunta X".
- Curadoria de imagens de verdade (`scripts/curate_images.py`): revisar fotos já aplicadas que
  possam estar fora de contexto (usuário mencionou isso, nunca chegamos a fazer a revisão
  completa — só corrigimos `animals_bird.jpg` pontualmente) + buscar fotos pra `hello`/`bye_bye`/
  `see_you_later` (hoje só emoji, a solução definitiva é foto contextual) e `school_glue`.
- Telas "menos glamurosas" (Configurações, Resultado, celebração de desbloqueio) ainda não
  receberam nenhum tratamento visual da paleta/identidade Quokka Bay — continuam com a cara
  antiga (sliders/combobox padrão de navegador).

### LATER

- **Quokka como companion de aprendizagem reativo** — não só um avatar customizável: comemora
  acerto, reage a erro, aparece nas situações, eventualmente dá dicas. A tela "Companheiro &
  Adesivos" (aposentar o boneco voxel, reaproveitar `AVATAR_ITEMS` como stickers do Quokka) é o
  primeiro passo disso, validado só como mockup até agora.
- **Modo história** — encadear vários `SCENARIOS` numa sequência narrativa (ex. "Um dia na
  escola"), com o Quokka guiando entre as cenas. Mecânica é barata (reaproveita `CONTENT`,
  `SCENARIOS`, `startQuiz`, os dois sistemas de voz); o trabalho real é escrever uma história boa.
  Pedido em 2026-08-26, registrado pra depois do vocabulário atual rodar um pouco com o João.
- Gírias australianas (snag, barbie, arvo etc.) — só depois que as cadeias de evolução "natural"
  já estiverem rodando com o João por um tempo (decisão do usuário, 2026-08-26).

### FUTURE (do feedback externo sobre `data.js` — nenhum tem consumidor hoje no engine)

- `function`/taxonomia comunicativa por item (greet/request/help/permission/social).
- Contexto rico em `SCENARIO` (location/speaker/target/goal/feedback object).
- Distractors tipados (semantic/functional/visual/linguistic).
- `difficulty` multidimensional (lexical/listening/speaking/production/grammar) em vez de um
  número só.
- `visual` estruturado (`{type, src}`) em vez de `emoji`/`image` soltos.
- **Exposure modalities** (see/hear/say/recognize/use rastreados por item) — o mais interessante
  dessa lista pra "adaptação de verdade", mas é uma reforma grande do motor, não uma tarde de
  trabalho.

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

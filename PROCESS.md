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
- **Escolha**: áudio pré-gerado (edge-tts, voz Natasha) por item, com fallback pro TTS ao vivo.
- **Porquê**: qualidade muito superior, gratuito, continua funcionando offline (arquivo cacheado).
- **Consequência**: todo item novo de conteúdo-alvo (inglês) precisa rodar `scripts/generate_audio.py`.

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

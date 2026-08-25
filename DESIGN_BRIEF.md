# FalaJoao / Meu Inglês — Visual & UX Design Brief

**Objetivo deste documento**: definir a direção visual, UX e Design System do FalaJoao antes de qualquer grande alteração no layout.

Este documento não é uma ordem para reescrever toda a interface imediatamente. Primeiro analise o projeto atual, compare-o com estas diretrizes e proponha as mudanças necessárias. Depois implemente de forma incremental.

---

## 1. Visão do produto

O FalaJoao começou como um MVP de aprendizado de inglês e está evoluindo para um sistema adaptativo de aprendizagem.

O usuário principal é: **uma criança de 4 anos.**

O objetivo é que a experiência não pareça uma aula tradicional de inglês. Também não queremos simplesmente criar um "flashcard app infantil".

A direção desejada é: **Um jogo de aventura infantil que ensina inglês.**

A criança deve sentir que está: explorando; cumprindo desafios; desbloqueando coisas; evoluindo seu personagem; descobrindo novos lugares; conquistando recompensas.

O aprendizado deve acontecer naturalmente dentro dessa experiência.

## 2. Sensação desejada

A sensação ideal ao abrir o aplicativo é: **"Legal, vou desbloquear mais um item para meu avatar se eu fizer esse desafio!"**

Essa frase representa melhor a motivação que queremos do que "Preciso estudar inglês." ou "Preciso completar minha lição."

O produto deve criar curiosidade e vontade de continuar. A criança deve pensar "O que eu vou desbloquear agora?" e não "Quantas palavras ainda preciso estudar?"

## 3. Personalidade visual

A personalidade principal deve combinar: 🎮 Game, 🗺️ Aventura, 🌈 Infantil, ✨ Divertido, 🧸 Lúdico, ⚡ Energético, 🏆 Recompensador.

A intensidade infantil desejada é alta. Não queremos uma interface corporativa, minimalista ou "educacional séria". Queremos algo próximo de: desenho infantil + videogame de aventura + app educacional — mas sem parecer uma cópia de nenhum produto existente.

## 4. Público

Primário: crianças pequenas, especialmente em torno de 4 anos. Isso implica: elementos grandes; poucos elementos simultâneos; navegação extremamente simples; textos curtos; muito apoio visual; ícones reconhecíveis; feedback imediato; áreas de toque grandes; pouca necessidade de leitura; áudio como parte importante da experiência.

A criança não deve precisar entender menus complexos.

## 5. Princípio fundamental: a interface deve ensinar sem explicar

Uma criança de 4 anos não deveria precisar entender: SRS; revisão; domínio; dificuldade; skills; learning stage; XP; algoritmo adaptativo.

Tudo isso deve existir por trás da interface. A criança deve perceber apenas: "Tenho uma missão." "Vou fazer uma atividade." "Consegui!" "Ganhei alguma coisa!" "Vamos continuar?"

## 6. Avatar

O avatar é um elemento **CENTRAL** da experiência. O avatar representa a própria criança. A direção atual de avatar voxel deve ser mantida, mas melhorada significativamente.

Queremos que o avatar pareça: simpático; expressivo; personalizável; colecionável; recompensador; parte da identidade da criança.

O avatar deve evoluir junto com o aprendizado:
```text
Começo → avatar básico → faz desafios → desbloqueia roupas → desbloqueia acessórios
  → desbloqueia itens especiais → desbloqueia ambientes → avatar cada vez mais personalizado
```

A recompensa deve ser visual e concreta.

## 7. Recompensas

A recompensa principal não deve ser simplesmente "+10 XP". XP pode existir internamente, mas não deve ser a estrela.

Preferimos: roupa nova; chapéu; mochila; óculos; tênis; acessório; item especial; decoração; cenário; companion/pet futuramente; elementos do mundo.

A criança deve conseguir visualizar o que conquistou.

## 8. Gamificação

Nível desejado: **4/5**. Queremos uma experiência bastante gamificada. Mas existe uma regra: **gamificação deve reforçar aprendizagem, não substituir aprendizagem.**

Não queremos: `Clique 100 vezes → ganhe XP`

Queremos: `Aprenda/pratique → complete desafio → conquiste recompensa`

A recompensa deve estar ligada à realização de atividades de aprendizagem.

## 9. Aventura

A jornada atual deve evoluir para algo mais próximo de um mapa de aventura. Não precisa ser um mapa extremamente complexo:
```text
🏠 My World
     │
     ● Greetings ─ ● Family ─ ● Food ─ ● Supermarket ─ ● School ─ ● Playground
```

Cada local pode representar um conjunto de experiências. Exemplo — Supermarket: food; fruits; colors; numbers; shopping phrases; questions; listening; speaking.

Assim, o conteúdo linguístico fica associado a um contexto de aventura.

## 10. Não expor a complexidade da arquitetura

O sistema atual possui conceitos como: skills; situations; content types; learning state; SRS; prerequisites; adaptive session. Tudo isso deve permanecer invisível para a criança.

A UI deve transformar "Adaptive Learning Engine" em "🎯 Your next challenge".

## 11. Home / Tela inicial

A Home deve ser extremamente orientada à ação. A primeira coisa que a criança deve ver não deve ser uma lista de categorias. Deve ser **o desafio atual**:
```text
┌─────────────────────────────┐
│        👤 Avatar             │
│   🎯 SUA MISSÃO              │
│   At the Supermarket         │
│   Let's learn some words!    │
│      [ START! ]              │
└─────────────────────────────┘
```

A ação principal deve ser extremamente evidente.

## 12. Navegação

A criança não deve precisar navegar por uma estrutura complexa. A preferência é: **o aplicativo decide o que mostrar.** O Learning Engine deve selecionar a próxima atividade. A criança não deveria precisar escolher qual skill, qual SRS, qual revisão, qual dificuldade, qual conteúdo.

Estrutura futura possível: `Home → Challenge → Adventure → Avatar`. A navegação não deve dominar a interface — preferir grandes áreas clicáveis, ícones, poucas opções, contexto visual.

## 13. Categorias

Não eliminar categorias, mas reduzir a importância delas. Não queremos que a Home pareça um catálogo (Animals, Food, Colors, Family, Body, School...). Categorias devem ficar dentro de "Explore" ou aparecer naturalmente dentro da aventura.

## 14. Tela de desafio

Experiência muito focada — nada deve competir com a atividade:
```text
        3 / 8
          🔊
         APPLE
    ┌───────────────┐
    │      🍎        │
    └───────────────┘
     What is this?
  ┌─────────────────┐
  │      APPLE       │
  └─────────────────┘
  ┌─────────────────┐
  │      DOG         │
  └─────────────────┘
```

Para uma criança de 4 anos: imagens grandes; áudio; botões grandes; pouco texto; feedback visual; animações; sons.

## 15. Feedback

Feedback deve ser emocional.

**Acerto**: animação; som; avatar comemora; progresso; pequena recompensa.

**Erro**: não usar linguagem punitiva; não mostrar "YOU FAILED"; não criar sensação de fracasso. Preferimos "Let's try again!" ou "Almost!" ou simplesmente uma dica visual. O sistema deve ensinar a criança que errar faz parte do jogo.

## 16. Animações

Nível desejado: **4/5** — bastante animação. A interface deve parecer viva: botões respondendo ao toque; cards entrando suavemente; avatar reagindo; confetti em conquistas; progressão animada; desbloqueios; pequenos efeitos; transições entre atividades.

Porém: não usar animação apenas por decoração. Toda animação deve ter uma função: feedback; orientação; recompensa; transição; descoberta.

## 17. Microinterações

**Acerto**: ✓ → bounce → sparkles → + progress

**Item desbloqueado**: 🔒 → ✨ → 🎒 NEW ITEM!

**Final da sessão**: Challenge Complete! → Avatar receives reward → "Let's see what you unlocked!"

## 18. Avatar como sistema de progressão

```text
LEARN → COMPLETE → REWARD → CUSTOMIZE → EXPLORE → LEARN
```

Esse loop é mais importante visualmente do que `study → score → study`.

## 19. Design System

Não quero que cada tela invente seu próprio estilo. Precisamos criar um Design System consistente, com tokens (variáveis CSS) para cores — `--color-primary`, `--color-primary-dark`, `--color-secondary`, `--color-accent`, `--color-success`, `--color-warning`, `--color-error`, `--color-background`, `--color-surface`, `--color-surface-elevated`, `--color-text`, `--color-text-secondary`, `--color-border`. Não espalhar hexadecimais arbitrariamente pelo CSS.

## 20. Paleta

Não abandonar as cores atuais — refinar a paleta atual e transformá-la em um sistema coerente. As cores atuais já possuem personalidade. Reduzir cores competindo simultaneamente; estabelecer uma cor primária; uma cor de CTA; cores de feedback; cores das habilidades; tons neutros. O resultado deve ser colorido, mas não visualmente caótico.

## 21. Cores por habilidade

O conceito atual de habilidades pode continuar (Understand, Say, Read, Communicate), cada uma com identidade visual própria — mas consistente em cards, ícones, progresso, exercícios, mapa, estatísticas. Não escolher cores diferentes em cada tela.

## 22. Tipografia

Evitar `"Comic Sans MS"` como fonte principal. Precisamos de uma fonte arredondada, infantil, muito legível, amigável, adequada para telas, com boa aparência em letras grandes. Avaliar famílias como Nunito, Quicksand, Baloo 2, Plus Jakarta Sans ou equivalentes. Não escolher apenas pela aparência — considerar legibilidade para crianças.

## 23. Hierarquia tipográfica

Níveis claros: Display, Heading, Subheading, Body, Caption, Button, Label. O inglês pode ter tratamento visual especial — "APPLE" pode ser visualmente mais forte do que "maçã", dependendo do exercício.

## 24. Cards

Diferenciar: Hero Card (principal ação da tela); Learning Card (conteúdo pedagógico); Reward Card (desbloqueio/recompensa); Adventure Card (local/situação); Avatar Card (personalização); Progress Card (progresso). Cada um pode compartilhar a mesma linguagem visual sem ser idêntico.

## 25. Border radius

Usar bastante arredondamento, mas evitar que absolutamente tudo seja `border-radius: 999px`. Precisamos de uma escala: small, medium, large, extra-large, pill.

## 26. Sombras

Manter sombras mais fortes para botões principais, elementos interativos, recompensas, elementos de jogo. Usar sombras suaves para cards, containers, áreas de conteúdo. Não aplicar a mesma sombra em tudo.

## 27. Iconografia

Não depender de emojis como sistema de ícones da interface. Emojis podem continuar existindo dentro do conteúdo pedagógico. Mas a interface deve preferencialmente usar SVG, ícones consistentes, mesma espessura, mesma linguagem visual — para: play, sound, microphone, check, close, back, home, settings, lock, unlock, star, reward, progress.

## 28. Desktop

O produto deve continuar sendo mobile-first, mas não deve parecer quebrado no desktop. No desktop podemos ter uma app shell mais ampla (nav lateral + conteúdo). Não implementar necessariamente agora — o Design System deve apenas permitir isso.

## 29. Responsividade

Prioridade: 1. Smartphone, 2. Tablet, 3. Desktop. Para uma criança de 4 anos: touch targets grandes; distância adequada entre elementos; evitar controles pequenos; evitar texto pequeno; evitar ações dependentes de precisão.

## 30. Acessibilidade

Mesmo sendo um game infantil: contraste adequado; não depender somente de cor; botões grandes; feedback visual + sonoro; textos legíveis; estados de foco; animações que não prejudiquem usabilidade.

## 31. Som

Som deve ser considerado parte do design: click; success; failure/gentle retry; unlock; reward; level completion. Sons devem ser curtos e agradáveis. Não transformar tudo em barulho constante.

## 32. Estados

Cada componente importante deve considerar: default, hover, pressed, focus, disabled, loading, success, error, locked, unlocked, completed. Especialmente: buttons, cards, rewards, adventure nodes, avatar items.

## 33. Loading

Nunca mostrar simplesmente uma tela vazia. Criar estados visuais coerentes com o universo — por exemplo, avatar fazendo uma pequena animação, ou elementos da aventura aparecendo.

## 34. Empty states

Se ainda não há progresso, não mostrar "No data." Mostrar algo como "Your adventure starts here!" com uma ação clara.

## 35. Progress

Progresso deve ser visual. Evitar excesso de "73.4%". Preferir "● ● ● ● ○ ○" ou "██████░░░░" ou elementos do mundo sendo desbloqueados.

## 36. O que NÃO queremos

Visual corporativo; excesso de branco sem personalidade; dashboards; tabelas; gráficos complexos; excesso de texto; menus complexos; excesso de badges; excesso de XP; excesso de números; estética "school worksheet"; excesso de emojis como UI; cores aleatórias; sombras pesadas em todos os elementos; cada tela parecer feita por uma pessoa diferente; gamificação que não tenha relação com aprendizagem.

## 37. O que queremos

Mundo; aventura; descoberta; avatar; desbloqueios; desafios; animações; som; recompensas; progressão; personalidade; consistência.

## 38. Arquitetura CSS

O projeto não usa React e não precisamos introduzir React apenas por causa do Design System. Podemos criar um sistema baseado em: CSS variables → base styles → components → utilities → page-specific styles. Evitar duplicação. Evitar estilos específicos demais. Preferir componentes reutilizáveis.

## 39. Importante: preservar a arquitetura funcional

Este ciclo é principalmente visual. Não alterar desnecessariamente: Learning Engine; SRS; Content; Learning State; Session Engine; adaptive logic; prerequisite logic. Se alguma mudança visual exigir alteração estrutural, primeiro explique o motivo.

## 40. Ordem recomendada de implementação

Não tente remodelar tudo de uma vez.

- **Fase Visual 1**: Design Tokens — cores, tipografia, espaçamento, radius, shadows, buttons, cards, icons, progress, badges.
- **Fase Visual 2**: Home, Header, Challenge Card, Progress, Avatar preview.
- **Fase Visual 3**: Learning Session, Quiz, Listening, Speaking, Feedback.
- **Fase Visual 4**: Adventure/Journey, Avatar, Unlock/rewards.
- **Fase Visual 5**: animations, sound feedback, responsive, accessibility, polish.

## 41. Processo obrigatório antes de implementar

1. Analise o layout atual. 2. Analise o CSS atual. 3. Identifique componentes existentes. 4. Identifique o que pode ser reutilizado. 5. Identifique inconsistências visuais. 6. Compare com este brief. 7. Proponha um plano de alteração. 8. Só depois implemente.

Não quero uma reescrita indiscriminada.

## 42. Entregável da análise

Antes da implementação: Current Visual Audit; What Works; What Needs Improvement; Design System Proposal; Information Architecture; Home Redesign; Challenge Redesign; Avatar/Reward Redesign; Adventure Redesign; Responsive Strategy; Implementation Plan.

## 43. Regra de ouro

Sempre que houver dúvida entre "mais bonito" e "mais fácil para uma criança de 4 anos entender" → escolher **mais fácil para a criança entender**.

Sempre que houver dúvida entre "mais gamificado" e "mais focado na aprendizagem" → escolher **aprendizagem**.

Sempre que houver dúvida entre "mais features" e "mais polimento" → escolher **polimento**.

## 44. Visão final

O objetivo visual não é criar simplesmente um aplicativo bonito. Queremos construir uma identidade que possa crescer.

Hoje: `FalaJoao → criança de 4 anos → avatar → desafios → inglês`

No futuro: `Meu Inglês → Learning / Adventure / Avatar / Rewards / Listening / Speaking / Reading / Communication / Stories / AI Tutor`

Tudo deve parecer parte do mesmo universo.

## 45. Critério final de sucesso

Se uma criança olhar para a Home e pensar "Legal, vou desbloquear mais um item para meu avatar se eu fizer esse desafio!" — então a identidade visual está cumprindo seu papel.

Se ela olhar e pensar "Preciso estudar inglês." — a experiência ainda está parecendo uma plataforma educacional tradicional.

**A meta é: Aprender inglês deve parecer uma aventura.**

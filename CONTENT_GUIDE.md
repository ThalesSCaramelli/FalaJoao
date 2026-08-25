# FalaJoao — Guia de conteúdo

> Como adicionar palavras, frases, categorias, situações e itens de avatar novos, na prática.
> `LEARNING_PHILOSOPHY.md` explica o *porquê*; `DESIGN_BRIEF.md` explica a *aparência*; isto aqui
> é o *como*, neste código específico.

---

## 1. Adicionar uma palavra/frase/sentença nova

Edite `data.js`, array `CONTENT`, adicionando um objeto:

```js
{
  id: "food_pizza",              // estável — nunca muda depois de criado (ver seção 5)
  contentType: "word",           // word | phrase | sentence
  en: "pizza",
  pt: "pizza",
  emoji: "🍕",                   // sempre presente, é o fallback
  image: null,                   // opcional — só depois da curadoria (seção 3)
  category: "food",              // categoria existente, ou nova (seção 2)
  difficulty: 1,                 // 1 (palavra simples) a 5 (frase longa/composta)
  prerequisites: [],             // ids de itens que ajudam a "decompor" este se ele for difícil
  // acceptedAnswers: [...]      // opcional, só pra sentenças — variantes aceitas na fala
}
```

**Guia rápido de `contentType`**: uma palavra = `word`. Duas ou três palavras sem verbo
conjugado ("red apple", "thank you mom") = `phrase`. Frase com sujeito+verbo ("I want water",
"Can I go to the bathroom, please?") = `sentence`.

**Guia rápido de `difficulty`**: 1 = palavra isolada comum. 2 = combinação curta ou frase social
simples. 3 = sentença curta (I am hungry). 4 = pedido educado completo (Can I have..., please?).
5 = reservado pra algo mais complexo ainda (não usado hoje).

**`prerequisites`**: só preencha se o item for difícil o bastante pra fazer sentido decompor
(ver `engine.js`, `needsDecomposition`/`buildSession`). Exemplo real:
`survival_go_to_the_bathroom` tem `prerequisites: ["survival_bathroom"]`.

Depois de adicionar, rode:
```bash
python scripts/generate_audio.py
```
Isso gera `assets/audio/en/food_pizza.mp3` automaticamente (voz Natasha) — o script já ignora
itens que já têm áudio, então é seguro rodar de novo a qualquer momento.

## 2. Adicionar uma categoria nova

Edite `data.js`, objeto `CATEGORY_META`:
```js
drinks: { namePt: "Bebidas", icon: "🥤", color: "#7ED6C0" },
```
A categoria aparece automaticamente em "Explorar por categoria" (dentro da tela Adventure/My
English World) assim que algum item de `CONTENT` referenciar `category: "drinks"`.

## 3. Curar uma foto real pra um item (opcional)

Regra de imagem (`DESIGN_BRIEF.md`): objeto/animal/comida → foto real; pessoa/emoção/situação →
ilustração; conceito abstrato (cor/número/forma) → fica em emoji, nem vale a pena buscar foto.

1. Crie um arquivo de lista, ex. `minha_lista.py`:
   ```python
   ITEMS = [("food_pizza", "pizza slice food")]
   ```
2. `python scripts/curate_images.py fetch minha_lista.py` — baixa candidatas CC0 do Openverse
   pra `review/images/`.
3. Sirva a raiz do projeto (`python -m http.server 8080`) e abra `http://localhost:8080/review/index.html`
   — escolha a foto de cada item (ou deixe "manter emoji"), clique em "Gerar resultado", copie o
   JSON.
4. Cole esse JSON num arquivo `selecao.json` e rode:
   `python scripts/curate_images.py apply selecao.json` — otimiza e copia pra
   `assets/images/<id>.jpg`, e imprime a linha `image: "assets/images/<id>.jpg",` pronta pra
   colar no item em `data.js` (o script não edita `data.js` sozinho, de propósito).

**Nunca** aplique uma imagem sem passar pela revisão — resultado automático de busca já trouxe
coisa inadequada antes (ver histórico do projeto).

## 4. Adicionar uma situação nova (mapa "My English World")

Edite `data.js`, array `SITUATIONS`:
```js
{ id: "bedtime", namePt: "Hora de Dormir", icon: "🛏️", mapPos: { top: "30%", left: "60%" },
  itemIds: ["survival_..."] }   // ou categoryId: "..." pra reaproveitar uma categoria inteira
```
`mapPos` é só posição visual no mapa (percentual). Prefira `itemIds` quando a situação cruza
categorias (como "banheiro" usa `survival` + `phrases`); use `categoryId` quando ela é
essencialmente uma categoria só (como "Lanche" = `food`).

## 5. Regra de ouro dos ids

**Um id, uma vez criado, nunca muda.** O progresso do jogador (Learning State, em
`localStorage`) é indexado por id. Trocar um id existente apaga o progresso daquele item pra
quem já jogou — só faça isso de propósito, sabendo a consequência (e nunca em produção sem
avisar).

## 6. Itens de avatar (recompensas)

Edite `data.js`, `AVATAR_ITEMS` — cada item tem `unlockedBy: "<categoryId>"` (desbloqueia quando
essa categoria atinge o limiar de `engine.js`/`UNLOCK_THRESHOLD`, hoje 40% consolidado/dominado).
Categorias existentes valem; para desbloqueio ligado a uma situação específica em vez de
categoria, seria preciso estender `isCategoryUnlockThresholdMet` — não implementado ainda
(complexidade prematura, ver `PROCESS.md`).

## 7. Checklist antes de publicar conteúdo novo

- [ ] Item(ns) adicionados em `CONTENT` com id estável e único
- [ ] `python scripts/generate_audio.py` rodado (sem itens faltando)
- [ ] Imagem curada e revisada manualmente, se aplicável (não automática)
- [ ] `sw.js`: `CACHE_NAME` incrementado, e novos arquivos de áudio/imagem adicionados ao
      `APP_SHELL` se quiser que fiquem disponíveis offline desde a instalação
- [ ] Testado localmente (categoria abre, palavra toca áudio, sem erro no console)
- [ ] `git add` + commit + push

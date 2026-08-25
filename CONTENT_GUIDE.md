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
5 = versão mais evoluída/natural de um item que já existe em difficulty menor (ver seção 8).

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
coisa inadequada antes (ver histórico do projeto). Na prática, o banco gratuito (Openverse) veio
bem ruidoso pra várias buscas (fotos etiquetadas errado, esculturas de museu, etc.) — de um lote
de 25 buscados em 2026-08-26, só 6 tinham candidata boa. Pra quem prefere escolher a própria foto
em vez de depender da busca automática, tem duas opções diretas (sem passar pelo Openverse):

- **Página de upload**: `python scripts/review_server.py` (porta 8090 por padrão), abra
  `http://localhost:8090/review/upload.html` — lista os itens pendentes, envia arquivo do
  computador ou cola um link, salva direto em `assets/images/<id>.jpg` já otimizado. Não mexe em
  `data.js` (mesma regra de sempre — isso continua manual).
- **Linha de comando**: `python scripts/curate_images.py add <item_id> <url_ou_caminho_local>` —
  mesmo resultado, sem servidor.

## 4. Adicionar uma situação nova (mapa "My English World")

Edite `data.js`, array `SITUATIONS`:
```js
{ id: "bedtime", namePt: "Hora de Dormir", icon: "🛏️", mapPos: { top: "30%", left: "60%" },
  itemIds: ["survival_..."] }   // ou categoryId: "..." pra reaproveitar uma categoria inteira
```
`mapPos` é só posição visual no mapa (percentual). Prefira `itemIds` quando a situação cruza
categorias (como "banheiro" usa `survival` + `phrases`); use `categoryId` quando ela é
essencialmente uma categoria só (como "Lanche" = `food`).

Depois de adicionar uma situação (ou um cenário novo em `SCENARIOS`, com seu `promptPt`), rode:
```bash
python scripts/generate_pt_audio.py
```
Gera o áudio em `assets/audio/pt/<id>.mp3` (voz neural Antônio, edge-tts) pra `namePt`/`promptPt`
— sem isso, aquele texto cai no TTS ao vivo do navegador (mais robótico) até rodar o script.
Mesma lógica do `generate_audio.py`: idempotente, só gera o que falta.

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

## 8. Evolução natural de frases (mesma função, registro mais avançado)

Ideia: em vez de só ensinar palavras/frases soltas, algumas seguem uma "cadeia de evolução" —
a mesma função comunicativa, ficando mais natural/específica a cada passo. Exemplo real
(`survival_water` → `phrase_water_please` → `phrase_water_glass_please`):

```
water                                    (difficulty 1, sem prerequisites)
  → Can I have some water, please?       (difficulty 4, prerequisites: ["survival_water", "survival_please"])
    → Can I have a glass of water, please? (difficulty 5, prerequisites: ["phrase_water_please"])
```

**Não existe campo `evolvesTo` nem lógica nova no engine pra isso** — de propósito (ver
`PROCESS.md`, decisão "`prerequisites` é soft link, não gate"). O item mais evoluído só usa:
- `difficulty` mais alta que o item anterior da cadeia (5 = o topo hoje);
- `prerequisites: ["id_do_item_anterior_da_cadeia"]` — soft link, documenta a relação, e entra em
  jogo se o item mais evoluído acabar sendo difícil demais (decomposição).

Isso já basta: `getNewCandidates` (engine.js) ordena novidades por `difficulty` ascendente, então
o item mais evoluído naturalmente só aparece pro João depois do simples, sem nenhum código novo.

Registro mais avançado pode incluir fala natural do inglês australiano (ex. "Hi mate, how's it
going?" em vez de só "Hello") — **gírias mais pesadas (comida/eventos: "snag", "barbie", "arvo"
etc.) ficam de fora por enquanto**, só entram depois que as cadeias de evolução "natural" já
estiverem rodando com o João por um tempo (decisão do usuário, 2026-08-26).

## 9. Checklist antes de publicar conteúdo novo

- [ ] Item(ns) adicionados em `CONTENT` com id estável e único
- [ ] `python scripts/generate_audio.py` rodado (sem itens faltando)
- [ ] Imagem curada e revisada manualmente, se aplicável (não automática)
- [ ] `sw.js`: `CACHE_NAME` incrementado, e novos arquivos de áudio/imagem adicionados ao
      `APP_SHELL` se quiser que fiquem disponíveis offline desde a instalação
- [ ] Testado localmente (categoria abre, palavra toca áudio, sem erro no console)
- [ ] `git add` + commit + push

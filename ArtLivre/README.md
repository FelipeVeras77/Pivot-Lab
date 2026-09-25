# ArtLivre

**Vitrine & apoio a artistas independentes** — protótipo de front-end para uma
plataforma de *Creator Economy / CultTech*: portfólio visual e sonoro num só
lugar, com financiamento coletivo **recorrente** (assinatura mensal por níveis)
e **pontual** (doação via Pix simulado).

100% front-end: **HTML + CSS + JavaScript puro**, sem framework e sem build.
Dados são mocks (`js/data.js`, espelhados em `data/*.json`); curtidas, apoios,
tema e obras enviadas ficam em `localStorage`.

---

## Como rodar

### Opção 1 — abrir direto (mais rápido)
Dois cliques em **`index.html`**. Os scripts são clássicos (sem `import`), então
funciona por `file://` sem servidor. Os dados vêm embutidos em `js/data.js`.

### Opção 2 — servidor local (recomendado para editar)
```powershell
# a partir da pasta ArtLivre/
python -m http.server 8000
# ou
npx serve
```
Acesse `http://localhost:8000/`. Servido por http, o app tenta ler
`data/*.json`; se falhar, usa a cópia de `js/data.js`.

> Imagens de exemplo vêm de `picsum.photos` e os ícones do Font Awesome via CDN —
> é preciso estar **online** na primeira vez.

---

## Estrutura

```
ArtLivre/
├── index.html                Página única (SPA). Carrega os scripts na ordem certa.
├── BACKEND_INTEGRATION.md     Contratos de API que um backend real deve implementar.
├── data/
│   ├── artists.json           Perfis, metas financeiras e tiers de assinatura.
│   ├── artworks.json          Acervo de obras (imagem e áudio).
│   └── supporters.json        Apoiadores + séries de desempenho do painel.
├── css/
│   ├── base.css               Tokens, reset, tipografia, atmosfera, tema claro/escuro.
│   ├── layout.css             Rail lateral de vidro, tabbar flutuante, topbar, grades.
│   ├── components.css         Botões, chips, cards, mural, régua de apoio, player,
│   │                          modal, fluxo de apoio, selo, toast.
│   └── screens.css            Estilos de Explorar, Perfil, Painel e Publicar.
└── js/
    ├── data.js                Mocks + App.data.load() (tenta os .json em http).   → App.data
    ├── state.js               App.util (helpers) + App.store + App.state + App.query
    ├── player.js              Player de áudio SIMULADO (transporte encenado).      → App.player
    ├── checkout.js            Fluxo de apoio em 4 passos + Pix fake + selo.        → App.checkout
    └── app.js                 Rotas (hash), render das telas, eventos, uploads.    → App.render
```

### Como funciona

- Tudo vive num objeto global **`App`**. Cada arquivo acrescenta sua parte.
- **Sem framework.** `App.render()` reconstrói `#app` para a rota atual. Ações de
  alta frequência (busca, curtir, player) atualizam só o trecho necessário do
  DOM, para o campo não perder o foco.
- Rotas por hash: `#/explorar`, `#/artista/:id?aba=projetos|sobre|niveis`,
  `#/painel`, `#/publicar`, `#/obra/:id` (abre o modal por cima do Explorar).
- Trocar mocks por API real = reimplementar `App.data.load()` e as funções de
  `App.query` como chamadas assíncronas (ver `BACKEND_INTEGRATION.md`).

---

## Telas

| Tela | O que tem |
|---|---|
| **Explorar** | Hero, busca + ordenação, chips de categoria, mural *masonry* (2–5 colunas), card com curtir e player inline para áudio. |
| **Modal de obra** | Mídia ampliada (ou player), descrição, tags, curtidas/apoiadores, comentários simulados, "Apoiar este artista". |
| **Perfil do artista** | Capa, avatar, bio em serifada, especialidades, redes, régua da meta. Abas **Projetos**, **Sobre** (storytelling + trajetória + meta), **Níveis de apoio**. |
| **Fluxo de apoio** | 1) pontual ou mensal → 2) valor livre/rápido ou card de nível → 3) **Pix**: QR fake + copia-e-cola → 4) sucesso com **selo de apoiador** carimbado. |
| **Painel do criador** | KPIs (arrecadado no mês, apoiadores ativos, visitas, curtidas), **gráfico SVG** de 6 meses (arrecadação em linha + visitas em barras), apoiadores recentes. |
| **Publicar** | Título, descrição, categoria, tags, tipo (imagem/áudio), **dropzone** com arrastar-soltar e prévia em tempo real. A obra entra no mural na hora. |

Tema **escuro por padrão** (é onde o visual foi desenhado); o botão na barra
lateral alterna entre Claro e Escuro e guarda a escolha. O padrão vive em
`js/state.js` (`tema: App.store.get("tema", "escuro")`).

---

## Decisões de design — "holo lab"

- **Superfícies de vidro** (`--papel-2` translúcido + hairline + `backdrop-filter`)
  flutuando sobre um fundo profundo. O fundo é feito de duas camadas fixas em
  `body::before` (aurora que respira em 26s) e `body::after` (malha técnica com
  vinheta) — nenhum nó extra no DOM.
- **Acento em degradê**: `--grad-marca` vai de teal → ciano → violeta e é o único
  jeito de marcar ação primária, item ativo e dado em destaque. Verde (`--ok`)
  segue só semântico (apoio confirmado / meta batida).
- Tipografia: **Space Grotesk** (títulos e números), **Inter** (corpo/UI),
  **JetBrains Mono** para todo rótulo técnico — subtítulos, legendas de métrica,
  abas, categorias, tempo e código Pix — sempre em caixa-alta com tracking largo.
  É o principal sinal de "interface de instrumento".
- **Forma travada**: botões, chips e campos 11px; cartões 16px; painéis 22px.
  Pílula só em avatares, selos e trilhos.
- **Brilho no lugar de sombra**: estados de foco e hover usam `box-shadow`
  colorido derivado do acento (`color-mix`), não sombra cinza.
- **Movimento contido** (~200ms, easing iOS-like) + entrada escalonada dos cards
  do mural; tudo zera com `prefers-reduced-motion`.
- **Elemento-assinatura**: a *régua de apoio* virou uma barra segmentada tipo
  medidor de energia (traços verticais, preenchimento em degradê com varredura de
  luz e faixa hachurada de excedente); e o *selo de apoiador* que carimba na
  confirmação, agora com halo neon.

---

## Limitações do protótipo

- Nenhum pagamento real: o Pix (QR + código) é gerado localmente e a confirmação
  é um botão. Ver `POST /donations` no `BACKEND_INTEGRATION.md`.
- O player não toca som — o transporte (play/pause/progresso/seek) é encenado
  por um timer.
- Uploads de imagem são guardados como *data URL* no `localStorage` e podem não
  persistir se estourarem a cota do navegador (a sessão continua funcionando).
- Sem contas nem login: o "dono" do Painel é sempre a artista de demonstração
  (Marina Tôrres).

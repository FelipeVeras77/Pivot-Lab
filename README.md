# ArtLivre

Vitrine de portfólios e apoio financeiro a artistas independentes brasileiros.

> **Status do projeto:** Protótipo funcional de front-end (MVP) — sem backend e sem pagamento real.

---

## Identificação Acadêmica

| Item | Descrição |
|---|---|
| Instituição | Uniceplac |
| Curso | Engenharia De Software |
| Disciplina | Gerenciamento de Projetos |
| Professor(a) | Hudson Neves |
| Semestre / Turma | 2 semestre Turma B Matutino |

---

## Descrição

O **ArtLivre** é uma plataforma de *Creator Economy / CultTech* que reúne, em um
único lugar, o portfólio visual e sonoro de artistas independentes e os meios de
apoiá-los financeiramente:

- **Apoio recorrente** — assinatura mensal por níveis (*tiers*) definidos pelo próprio artista.
- **Apoio pontual** — doação avulsa via Pix (simulado no protótipo).

A entrega atual é **100% front-end**: HTML, CSS e JavaScript puro, sem framework
e sem etapa de build. Os dados são *mocks* (`js/data.js`, espelhados em
`data/*.json`) e as interações do usuário (curtidas, apoios, tema e obras
publicadas) são persistidas no `localStorage` do navegador.

### Problema que o sistema resolve

O artista independente hoje precisa espalhar seu trabalho e sua monetização por
várias ferramentas diferentes: uma rede social para mostrar o portfólio, outra
para divulgar áudio, um link externo para receber doações e ainda outra
plataforma para gerenciar assinantes. O ArtLivre concentra portfólio,
relacionamento com o público e financiamento (recorrente e pontual) em uma única
interface, com um painel que mostra ao criador o retorno do que ele publica.

### Público-alvo

| Perfil | Uso principal |
|---|---|
| **Artistas independentes** (ilustração, música, fotografia, artesanato, design, literatura) | Publicar obras, definir meta financeira e níveis de apoio, acompanhar o painel de desempenho |
| **Apoiadores / público em geral** | Explorar o acervo, curtir, comentar e apoiar artistas de forma pontual ou mensal |

---

## Objetivos

### Objetivo geral

Desenvolver a interface de uma plataforma que dê ao artista independente
brasileiro uma vitrine própria e um caminho direto de financiamento pelo seu
público, sem depender de múltiplos serviços desconectados.

### Objetivos específicos

- Construir uma SPA navegável apenas com HTML, CSS e JavaScript puro (sem framework e sem build).
- Modelar as telas essenciais do produto: descoberta, perfil do artista, apoio, painel do criador e publicação.
- Simular ponta a ponta o fluxo de apoio, incluindo Pix e confirmação, para validar a experiência antes de existir backend.
- Documentar os contratos de API necessários para que um backend real substitua os *mocks* sem reescrever a interface (ver `BACKEND_INTEGRATION.md`).
- Garantir tema claro/escuro, responsividade e respeito a `prefers-reduced-motion`.

---

## Funcionalidades

| # | Funcionalidade | Descrição |
|---|---|---|
| 1 | **Explorar** | Mural *masonry* de 2 a 5 colunas com hero, busca textual, ordenação (recentes, curtidas, apoiadores) e filtro por chips de categoria |
| 2 | **Curtir obras** | Curtida por obra, persistida em `localStorage` |
| 3 | **Player de áudio** | Reprodução inline no card e no modal (transporte simulado: play/pause, progresso e *seek*) |
| 4 | **Modal de obra** | Mídia ampliada, descrição, tags, contagem de curtidas e apoiadores, comentários simulados e atalho para apoiar |
| 5 | **Perfil do artista** | Capa, avatar, bio, especialidades, redes sociais e régua de meta, com abas **Projetos**, **Sobre** e **Níveis de apoio** |
| 6 | **Fluxo de apoio em 4 passos** | (1) pontual ou mensal → (2) valor livre/rápido ou card de nível → (3) Pix com QR e copia-e-cola simulados → (4) sucesso com selo de apoiador |
| 7 | **Painel do criador** | KPIs (arrecadado no mês, apoiadores ativos, visitas, curtidas), gráfico SVG de 6 meses (arrecadação em linha + visitas em barras) e apoiadores recentes |
| 8 | **Publicar obra** | Formulário com título, descrição, categoria, tags, tipo de mídia (imagem ou áudio) e *dropzone* com arrastar-soltar e prévia em tempo real; a obra entra no mural imediatamente |
| 9 | **Tema claro/escuro** | Alternância Automático → Claro → Escuro, com a escolha salva no navegador |
| 10 | **Roteamento por hash** | Navegação sem recarregar a página: `#/explorar`, `#/artista/:id`, `#/painel`, `#/publicar`, `#/obra/:id` |

**Categorias suportadas no acervo:** ilustração, música, fotografia, artesanato, design e literatura.

---

## Tecnologias Utilizadas

### Linguagens e base

| Tecnologia | Uso no projeto |
|---|---|
| **HTML5** | Página única (`index.html`) que carrega os scripts na ordem correta |
| **CSS3** | Tokens de design, tema claro/escuro, *glassmorphism*, `backdrop-filter`, grades e animações |
| **JavaScript (ES5/ES6, sem módulos)** | Toda a renderização, roteamento, estado e interações |
| **JSON** | Base de dados *mock* em `data/*.json` |
| **Web Storage API (`localStorage`)** | Persistência local de curtidas, apoios, tema e obras publicadas |
| **SVG** | Gráfico de desempenho do painel do criador, gerado por código |

### Frameworks e bibliotecas

O projeto **não utiliza framework de front-end nem gerenciador de pacotes**. As
únicas dependências são recursos externos carregados via CDN:

| Recurso | Origem | Uso |
|---|---|---|
| **Font Awesome 6.7.2 (free)** | `cdnjs.cloudflare.com` | Ícones de interface e marcas de redes sociais |
| **Google Fonts** | `fonts.googleapis.com` | Tipografia: Space Grotesk (títulos e números), Inter (corpo/UI) e JetBrains Mono (rótulos técnicos, métricas e código Pix) |
| **Picsum Photos** | `picsum.photos` | Imagens de exemplo do acervo |

---

## Arquitetura da Solução

### Visão geral

Aplicação de página única (SPA) executada inteiramente no navegador. Não há
servidor de aplicação: os *mocks* fazem o papel da camada de dados e o
`localStorage` faz o papel da persistência.

```
┌─────────────────────────── Navegador ───────────────────────────┐
│                                                                 │
│  index.html  →  <div id="app">                                  │
│                      ▲                                          │
│                      │ render                                   │
│  ┌───────────────────┴───────────────────────────────────────┐  │
│  │                    objeto global  App                     │  │
│  │                                                           │  │
│  │  data.js      App.data      mocks + load() dos .json      │  │
│  │  state.js     App.util / App.store / App.state / App.query│  │
│  │  player.js    App.player    player de áudio simulado      │  │
│  │  checkout.js  App.checkout  fluxo de apoio + Pix + selo   │  │
│  │  app.js       App.render    rotas, telas, eventos, upload │  │
│  └───────────────────────────────────────────────────────────┘  │
│                      │                        │                 │
│                      ▼                        ▼                 │
│              data/*.json (http)         localStorage            │
└─────────────────────────────────────────────────────────────────┘
```

### Decisões de arquitetura

- **Namespace único.** Tudo vive no objeto global `App`; cada arquivo acrescenta a sua parte, na ordem de carregamento `data → state → player → checkout → app`.
- **Scripts clássicos** (sem `import`/`export`), o que permite abrir o projeto por `file://` sem servidor local.
- **Renderização manual.** `App.render()` reconstrói `#app` para a rota atual; ações de alta frequência (busca, curtir, player) atualizam apenas o trecho necessário do DOM para não perder o foco do campo.
- **Roteamento por hash**, ouvindo o evento `hashchange`. A rota `#/obra/:id` abre o modal por cima da tela Explorar.
- **Carga de dados tolerante a falha.** `App.data.load()` tenta ler `data/*.json` quando servido por HTTP; se falhar (ex.: `file://`), usa a cópia embutida em `js/data.js`.
- **Camada de consulta isolada.** As funções de `App.query` concentram os acessos aos dados — trocar os *mocks* por uma API real significa reimplementar `App.data.load()` e `App.query` como chamadas assíncronas.

### Camadas de estilo

| Arquivo | Responsabilidade |
|---|---|
| `css/base.css` | Tokens, reset, tipografia, atmosfera de fundo, tema claro/escuro |
| `css/layout.css` | Rail lateral, tabbar flutuante, topbar e grades |
| `css/components.css` | Botões, chips, cards, mural, régua de apoio, player, modal, fluxo de apoio, selo e toast |
| `css/screens.css` | Estilos específicos de Explorar, Perfil, Painel e Publicar |

---

## Modelagem do Banco de Dados

**O protótipo não utiliza banco de dados.** A persistência atual é feita por
arquivos JSON estáticos (`data/artists.json`, `data/artworks.json`,
`data/supporters.json`) e pelo `localStorage` do navegador.

O modelo abaixo está documentado em `BACKEND_INTEGRATION.md` como referência para
a futura implementação do backend:

```
Artist(id, nome, usuario, avatar, banner, categoria, cidade, bio, sobre,
       especialidades[], trajetoria[], redes{}, entrouEm)
FinancialGoal(artistId, alvo, moeda, descricao, ciclo)          // 1:1 por ciclo
Tier(id, artistId, nome, preco, moeda, periodicidade, cor, beneficios[])
Artwork(id, artistId, titulo, descricao, categoria, tipoMidia,
        urlMidia, thumb, duracao, dataCriacao, tags[])
ArtworkStat(artworkId, curtidas, apoiadores)                    // desnormalizado
Comment(id, artworkId, autorId, texto, data)
Like(userId, artworkId, data)                                   // PK composta
User(id, nome, email, avatar, papel)                            // papel: apoiador | criador
Donation(id, artistId, userId?, contato{}, tipo, tierId?, valor, moeda,
         status, metodo, mensagem, anonimo, criadaEm, confirmadaEm)
Subscription(id, donationId, artistId, userId, tierId, status,
             proximaCobranca, canceladaEm)
ProfileView(artistId, data, origem)                             // agregável por dia/mês
```

**SGBD definitivo:** A ser definido pela equipe.

---

## Pré-requisitos

- Navegador moderno com suporte a `backdrop-filter` e `localStorage` (Chrome, Edge, Firefox ou Safari em versão atual).
- Conexão com a internet no primeiro acesso, para baixar as fontes, os ícones e as imagens de exemplo servidos por CDN.
- **Opcional (recomendado para desenvolvimento):** Python 3 ou Node.js instalado, para subir um servidor local estático.

Não é necessário instalar dependências, compilar ou configurar variáveis de ambiente.

---

## Instalação

1. Obtenha os arquivos do projeto:

   ```bash
   git clone <url-do-repositorio>
   ```

   Ou extraia o arquivo `.zip` do projeto em uma pasta de sua preferência.

2. Acesse a pasta do projeto:

   ```bash
   cd ArtLivre
   ```

3. Pronto. Não há `npm install` nem etapa de build.

---

## Como Executar

### Opção 1 — Abrir diretamente (mais rápido)

Dê dois cliques em **`index.html`**. Como os scripts são clássicos (sem
`import`), a aplicação funciona por `file://` sem servidor — nesse modo os dados
vêm embutidos em `js/data.js`.

### Opção 2 — Servidor local (recomendado para editar)

A partir da pasta do projeto:

```bash
# com Python
python -m http.server 8000

# ou com Node.js
npx serve
```

Acesse `http://localhost:8000/`. Servido por HTTP, o app tenta ler `data/*.json`
e, se falhar, usa a cópia embutida em `js/data.js`.

> Ao editar CSS ou JS, incremente o parâmetro `?v=` nas tags de `index.html` para
> furar o cache do navegador.

### Rotas disponíveis

| Rota | Tela |
|---|---|
| `#/explorar` | Mural de obras (rota padrão) |
| `#/artista/:id?aba=projetos\|sobre\|niveis` | Perfil do artista |
| `#/obra/:id` | Modal da obra sobre o Explorar |
| `#/painel` | Painel do criador |
| `#/publicar` | Publicação de nova obra |

---

## Estrutura do Projeto

```
ArtLivre/
├── index.html                 Página única (SPA); carrega os scripts na ordem correta
├── README.md                  Este arquivo
├── BACKEND_INTEGRATION.md     Contratos de API que um backend real deve implementar
├── .gitignore
├── data/
│   ├── artists.json           Perfis, metas financeiras e níveis de assinatura
│   ├── artworks.json          Acervo de obras (imagem e áudio)
│   └── supporters.json        Apoiadores e séries de desempenho do painel
├── css/
│   ├── base.css               Tokens, reset, tipografia, atmosfera, tema claro/escuro
│   ├── layout.css             Rail lateral, tabbar flutuante, topbar, grades
│   ├── components.css         Botões, chips, cards, mural, régua, player, modal, selo, toast
│   └── screens.css            Estilos de Explorar, Perfil, Painel e Publicar
└── js/
    ├── data.js                Mocks + App.data.load()                      → App.data
    ├── state.js               Helpers, storage, estado e consultas         → App.util / App.store / App.state / App.query
    ├── player.js              Player de áudio simulado                     → App.player
    ├── checkout.js            Fluxo de apoio em 4 passos + Pix + selo      → App.checkout
    └── app.js                 Rotas, render das telas, eventos e uploads   → App.render
```

---

## Exemplos de Uso

### 1. Descobrir e curtir uma obra

1. Abra a aplicação — a tela **Explorar** é carregada por padrão.
2. Filtre pelos chips de categoria (ex.: *música*) ou use a busca por título, descrição, tags ou nome do artista.
3. Ordene por *recentes*, *curtidas* ou *apoiadores*.
4. Clique no coração do card para curtir; a curtida permanece após recarregar a página.

### 2. Apoiar um artista

1. Abra o perfil de um artista ou o modal de uma obra e clique em **Apoiar este artista**.
2. **Passo 1:** escolha entre apoio *pontual* ou *mensal*.
3. **Passo 2:** informe um valor livre, escolha um valor rápido ou selecione um card de nível.
4. **Passo 3:** a tela do Pix exibe o QR Code e o código copia-e-cola (simulados).
5. **Passo 4:** confirme e receba o **selo de apoiador**, que passa a aparecer no perfil do artista.

### 3. Publicar uma obra

1. Acesse **Publicar** (`#/publicar`).
2. Preencha título, descrição, categoria e tags, e escolha o tipo de mídia (imagem ou áudio).
3. Arraste o arquivo para a *dropzone* — a prévia aparece em tempo real.
4. Ao enviar, a obra entra imediatamente no mural do Explorar.

### 4. Acompanhar o desempenho

Acesse **Painel** (`#/painel`) para ver os KPIs do mês, o gráfico SVG de seis
meses (arrecadação em linha e visitas em barras) e a lista de apoiadores
recentes.

---

## API

O protótipo **não consome nenhuma API**. Os contratos abaixo estão especificados
em detalhe (parâmetros, exemplos de resposta e códigos de erro) no arquivo
**`BACKEND_INTEGRATION.md`**, para que um backend real substitua os *mocks* sem
alterar a interface.

### Convenções propostas

- Base sugerida: `https://api.artlivre.com.br/api/v1`
- Formato: JSON, `Content-Type: application/json; charset=utf-8`
- Datas em ISO 8601; valores monetários em **BRL** (campo `moeda: "BRL"`)
- Autenticação: `Authorization: Bearer <jwt>` nos endpoints privados
- Erros: `{ "erro": { "codigo": "STRING_MAIUSCULA", "mensagem": "..." } }`

### Endpoints previstos

| # | Método e rota | Descrição | Consumido em |
|---|---|---|---|
| 1 | `GET /artworks` | Lista paginada de obras, com busca, filtro e ordenação | `js/data.js` → `App.data.load()` / `js/state.js` → `App.query.feed()` |
| 2 | `GET /artworks/{id}` | Detalhe de uma obra | `js/app.js` (modal de obra) |
| 3 | `GET /artists/{id}` | Perfil do artista, meta e níveis | `js/app.js` → `telaArtista()` |
| 4 | `POST /donations` | Criação de apoio pontual ou assinatura (Pix) | `js/checkout.js` → `confirmar()` |
| 5 | `POST /artworks` | Upload de obra (`multipart/form-data`, autenticado) | `js/app.js` → `ligarUpload()` |
| 6 | `GET /artists/{id}/dashboard` | KPIs e séries do painel (autenticado, dono do perfil) | `js/app.js` → `telaPainel()` |

O documento também mapeia os **serviços externos** a integrar (gateway de
pagamento com Pix e split, assinatura recorrente, webhooks, storage e CDN de
mídia, transcodificação de áudio, e-mail transacional, antifraude e busca).

---

## Capturas de Tela

> Insira aqui as imagens do sistema. Sugestão: criar a pasta `docs/screenshots/`
> na raiz do projeto e referenciar os arquivos conforme o modelo abaixo.

### Explorar

![Tela Explorar](docs/screenshots/explorar.png)

### Perfil do artista

![Perfil do artista](docs/screenshots/perfil-artista.png)

### Fluxo de apoio (Pix e selo)

![Fluxo de apoio](docs/screenshots/fluxo-apoio.png)

### Painel do criador

![Painel do criador](docs/screenshots/painel.png)

### Publicar obra

![Publicar obra](docs/screenshots/publicar.png)

---

## Equipe do Projeto

| Nome | Função | Contato |
|---|---|---|
| A ser definido pela equipe | A ser definido pela equipe | A ser definido pela equipe |

---

## Melhorias Futuras

As limitações atuais do protótipo definem o roteiro de evolução:

- [ ] **Backend real**, implementando os contratos de `BACKEND_INTEGRATION.md` e substituindo os *mocks* por chamadas assíncronas.
- [ ] **Pagamento real** — hoje o Pix (QR Code e código) é gerado localmente e a confirmação é apenas um botão.
- [ ] **Player com áudio real** — atualmente o transporte (play/pause, progresso e *seek*) é encenado por um temporizador.
- [ ] **Contas e autenticação** — não há login; o "dono" do Painel é sempre a artista de demonstração.
- [ ] **Storage de mídia** — os uploads de imagem são guardados como *data URL* no `localStorage` e podem não persistir se estourarem a cota do navegador.
- [ ] **Banco de dados e persistência de verdade**, conforme o modelo de dados documentado.
- [ ] **Comentários funcionais** — os comentários exibidos hoje são simulados.

---

## Licença

A ser definido pela equipe.

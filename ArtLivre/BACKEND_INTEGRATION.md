# ArtLivre — Integração com Backend

Este projeto é **100% front-end**. Toda persistência hoje é mock (`js/data.js`,
espelhado em `data/*.json`) + `localStorage`. Este documento descreve os
contratos de API que um backend real deve implementar para substituir os mocks
sem reescrever a interface.

Convenções:

- Base sugerida: `https://api.artlivre.com.br/api/v1`
- Formato: JSON, `Content-Type: application/json; charset=utf-8`
- Datas: ISO 8601 (`YYYY-MM-DD` ou `YYYY-MM-DDTHH:mm:ssZ`)
- Valores monetários: número inteiro/decimal em **BRL** (campo `moeda: "BRL"`)
- Autenticação: `Authorization: Bearer <jwt>` nos endpoints privados
- Erros: `{ "erro": { "codigo": "STRING_MAIUSCULA", "mensagem": "..." } }` +
  status HTTP apropriado (400, 401, 403, 404, 409, 422, 500)

Onde cada contrato é consumido no front:

| Front | Arquivo | Função |
|---|---|---|
| Lista/feed do Explorar | `js/data.js` → `App.data.load()` / `js/state.js` → `App.query.feed()` | troca o array local por `GET /artworks` |
| Perfil do artista | `js/app.js` → `telaArtista()` | `GET /artists/{id}` |
| Fluxo de apoio (Pix) | `js/checkout.js` → `confirmar()` | `POST /donations` |
| Upload de obra | `js/app.js` → `ligarUpload()` | `POST /artworks` (multipart) |
| Painel do criador | `js/app.js` → `telaPainel()` | `GET /artists/{id}/dashboard` |

---

## 1. `GET /artworks`

Lista paginada de obras para o mural do Explorar. Busca textual e filtro por
categoria.

### Query params

| Param | Tipo | Padrão | Descrição |
|---|---|---|---|
| `pagina` | int | `1` | página (1-based) |
| `porPagina` | int | `24` | itens por página (máx. 60) |
| `categoria` | string | — | `ilustracao \| musica \| fotografia \| artesanato \| design \| literatura`. Ausente = todas |
| `q` | string | — | busca em título, descrição, tags e nome do artista |
| `ordenar` | string | `recentes` | `recentes \| curtidas \| apoiadores` |
| `artistId` | string | — | restringe a um artista (usado na aba "Projetos" do perfil) |

### 200 OK

```json
{
  "pagina": 1,
  "porPagina": 24,
  "total": 137,
  "totalPaginas": 6,
  "itens": [
    {
      "id": "obra-marina-01",
      "artistId": "marina-torres",
      "artista": { "id": "marina-torres", "nome": "Marina Tôrres", "avatar": "https://..." },
      "titulo": "Santa do Quintal",
      "descricao": "Estudo em risografia de duas cores...",
      "categoria": "ilustracao",
      "tipoMidia": "imagem",
      "urlMidia": "https://cdn.artlivre.com.br/obras/marina-01-full.webp",
      "thumb": "https://cdn.artlivre.com.br/obras/marina-01-600.webp",
      "duracao": null,
      "curtidas": 412,
      "curtidaPeloUsuario": false,
      "apoiadores": 31,
      "dataCriacao": "2026-08-14",
      "tags": ["risografia", "folk", "duas cores", "capa"]
    }
  ]
}
```

- `tipoMidia: "audio"` → `urlMidia` aponta para o arquivo de áudio (mp3/aac) e
  `duracao` (segundos) é obrigatório; `thumb` é a capa.
- `curtidaPeloUsuario` só vem preenchido em requisição autenticada.
- Comentários **não** vêm nesta lista (ver `GET /artworks/{id}`).

---

## 2. `GET /artworks/{id}`

Detalhe de uma obra (modal). Igual ao item acima **mais**:

```json
{
  "comentarios": [
    {
      "id": "cmt-1",
      "autor": { "nome": "Renata Alvim", "avatar": "https://..." },
      "texto": "A textura do azul ficou linda...",
      "data": "2026-08-15T10:22:00Z"
    }
  ]
}
```

### `POST /artworks/{id}/comentarios` (autenticado)

```json
// req
{ "texto": "string, 1..240" }
// 201
{ "id": "cmt-42", "autor": { "nome": "...", "avatar": "..." }, "texto": "...", "data": "2026-08-28T12:00:00Z" }
```

### `POST /artworks/{id}/curtidas` / `DELETE /artworks/{id}/curtidas` (autenticado)

```json
// 200
{ "curtidas": 413, "curtidaPeloUsuario": true }
```

---

## 3. `GET /artists/{id}`

Perfil completo: dados públicos, especialidades, redes, meta financeira, tiers e
(opcionalmente) as primeiras obras.

### 200 OK

```json
{
  "id": "marina-torres",
  "nome": "Marina Tôrres",
  "usuario": "marinatorres",
  "avatar": "https://...",
  "banner": "https://...",
  "categoria": "ilustracao",
  "cidade": "São Paulo, SP",
  "bio": "Ilustro histórias que misturam...",
  "sobre": "Comecei desenhando nas margens...",
  "especialidades": ["Ilustração editorial", "Folk-futurismo", "Risografia"],
  "trajetoria": [{ "ano": "2016", "fato": "Primeira fanzine vendida na Feira Plana" }],
  "redes": { "instagram": "https://...", "twitter": "https://...", "behance": "https://..." },
  "meta": {
    "alvo": 6000,
    "atual": 4120,
    "moeda": "BRL",
    "descricao": "Meta mensal para dedicar 4 dias por semana...",
    "cicloReferencia": "2026-08"
  },
  "metricasPublicas": {
    "apoiadoresAtivos": 148,
    "visualizacoesPerfil": 9240,
    "curtidasTotais": 1230
  },
  "entrouEm": "2023-02-11",
  "tiers": [
    {
      "id": "marina-bronze",
      "nome": "Caderno de rascunhos",
      "preco": 10,
      "moeda": "BRL",
      "periodicidade": "mensal",
      "cor": "#B8895B",
      "beneficios": ["Acesso antecipado a rascunhos e estudos de cor", "Feed exclusivo de bastidores toda semana"]
    }
  ],
  "obras": [ /* mesmos objetos de GET /artworks, primeiros 12 */ ]
}
```

`404 ARTISTA_NAO_ENCONTRADO` quando o id não existe.

---

## 4. `POST /donations`

Cria uma doação pontual **ou** assinatura mensal. Vincula doador (usuário
autenticado ou anônimo com contato) ao criador. Retorna dados para renderizar o
Pix (QR + copia e cola) e acompanhar a confirmação.

### Requisição (autenticado ou com `contato` para anônimo)

```json
{
  "artistId": "marina-torres",
  "tipo": "mensal",                 // "mensal" | "pontual"
  "tierId": "marina-prata",         // obrigatório se tipo = "mensal"; null se pontual
  "valor": 25.00,                   // obrigatório se pontual; validado == tier.preco se mensal
  "moeda": "BRL",
  "metodo": "pix",
  "contato": {                      // opcional; só para doador não logado
    "nome": "Fulano de Tal",
    "email": "fulano@exemplo.com"
  },
  "mensagem": "Continuem o trabalho incrível!",   // opcional, exibida ao criador
  "anonimo": false
}
```

### 201 Created

```json
{
  "id": "don_8f2a…",
  "status": "pendente",             // pendente | confirmada | falha | cancelada
  "tipo": "mensal",
  "valor": 25.00,
  "moeda": "BRL",
  "artistId": "marina-torres",
  "tierId": "marina-prata",
  "criadaEm": "2026-08-28T12:00:00Z",
  "pix": {
    "txid": "artlivre8f2a1c",
    "copiaECola": "00020126...6304ABCD",
    "qrcodeBase64": "data:image/png;base64,iVBOR...",
    "expiraEm": "2026-08-28T12:30:00Z"
  },
  "assinatura": {                   // presente quando tipo = "mensal"
    "id": "sub_1a2b…",
    "proximaCobranca": "2026-09-28",
    "gerenciarUrl": "https://artlivre.com.br/conta/assinaturas/sub_1a2b"
  }
}
```

### Confirmação

- **Preferencial:** webhook do gateway → backend marca `status: "confirmada"` e
  emite evento; o front consulta `GET /donations/{id}` (polling curto) ou escuta
  via WebSocket/SSE `GET /donations/{id}/eventos`.
- O botão **"Simular confirmação de pagamento"** do protótipo corresponde a
  receber esse webhook. Em produção **não** existe endpoint público para forçar
  confirmação.

```json
// GET /donations/{id} → 200
{ "id": "don_8f2a…", "status": "confirmada", "confirmadaEm": "2026-08-28T12:03:11Z" }
```

### Erros

| Status | codigo | Quando |
|---|---|---|
| 422 | `VALOR_INVALIDO` | pontual sem `valor` ou `valor < 1` |
| 422 | `TIER_OBRIGATORIO` | `tipo: "mensal"` sem `tierId` |
| 409 | `ASSINATURA_JA_ATIVA` | usuário já assina esse tier do artista |
| 404 | `ARTISTA_NAO_ENCONTRADO` | — |
| 402 | `PAGAMENTO_RECUSADO` | gateway recusou |

---

## 5. `POST /artworks` (autenticado, `multipart/form-data`)

Upload de obra nova pelo criador. Campos:

| Campo | Tipo | Obrigatório | Notas |
|---|---|---|---|
| `titulo` | text | sim | 1..80 |
| `descricao` | text | não | 0..600 |
| `categoria` | text | sim | enum de categorias |
| `tags` | text | não | separadas por vírgula; máx. 8 |
| `tipoMidia` | text | sim | `imagem \| audio` |
| `arquivo` | file | sim | `image/png,image/jpeg,image/webp` (≤ 8 MB) ou `audio/mpeg,audio/wav,audio/ogg` (≤ 30 MB) |
| `capa` | file | se `tipoMidia=audio` | imagem da capa |

### 201 Created

Retorna o objeto de obra já com `id`, `urlMidia`/`thumb` (pós-processados no
storage) e `dataCriacao`. O front insere imediatamente no mural local.

---

## 6. `GET /artists/{id}/dashboard` (autenticado, dono do perfil)

Alimenta o Painel do Criador: KPIs do mês + séries dos últimos 6 meses +
apoiadores recentes.

### 200 OK

```json
{
  "ciclo": "2026-08",
  "kpis": {
    "arrecadadoMes": 4120.00,
    "apoiadoresAtivos": 148,
    "visualizacoesPerfil": 2260,
    "curtidasTotais": 1230,
    "variacao": { "arrecadado": 0.062, "visitas": 0.202, "novosApoiadores": 21 }
  },
  "series": {
    "meses": ["Mar", "Abr", "Mai", "Jun", "Jul", "Ago"],
    "arrecadacao": [2380, 2610, 3050, 3420, 3880, 4120],
    "visitas": [1120, 1340, 1610, 1490, 1880, 2260],
    "novosApoiadores": [9, 12, 15, 11, 18, 21]
  },
  "apoiadoresRecentes": [
    {
      "id": "sup-001",
      "nome": "Renata Alvim",
      "avatar": "https://...",
      "tipo": "mensal",
      "tierId": "marina-ouro",
      "tierNome": "Print do mês",
      "valor": 50.00,
      "data": "2026-08-02"
    }
  ]
}
```

### `GET /artists/{id}/repasses` (autenticado)

Extrato financeiro / repasses ao criador (não usado na tela atual, mas previsto):
`{ "saldoDisponivel": 3120.00, "emLiberacao": 900.00, "proximoRepasse": "2026-09-05", "historico": [...] }`

---

## 7. Serviços externos a mapear

| Necessidade | Serviço sugerido | Integração |
|---|---|---|
| **Split de pagamento** (plataforma + criador) | Mercado Pago *Marketplace* / Stripe *Connect* | criar `application_fee` / `transfer_data`; criador tem conta conectada. Pix nativo via Mercado Pago ou PSP (Gerencianet/Efí, Asaas). |
| **Assinatura recorrente** | Mercado Pago *Preapproval* / Stripe *Billing* | webhook `preapproval`/`invoice.paid` → confirma ciclo; retries e dunning no gateway. |
| **Webhook de pagamento** | do próprio gateway | endpoint `POST /webhooks/pagamento` com verificação de assinatura HMAC; idempotência por `event.id`. |
| **Storage de mídia** | Amazon S3 + CloudFront (ou Firebase Storage) | upload via URL pré-assinada (`PUT`); pós-processamento (resize/transcode) por Lambda/worker; servir por CDN. |
| **Transcode de áudio** | AWS MediaConvert / ffmpeg worker | normalizar loudness, gerar `mp3 128k` + `aac`, extrair forma de onda (peaks JSON) para o player. |
| **Imagens responsivas** | CloudFront + Lambda@Edge ou Imgix/Cloudinary | gerar `thumb` (600px), `full` (1600px), `webp/avif`. |
| **Compartilhamento social** | Open Graph + `POST /share/intents` | gerar cards OG por obra/perfil; deep links `artlivre.com.br/o/{id}`. |
| **E-mail transacional** | Resend / Amazon SES | recibo de doação, boas-vindas de assinatura, aviso de cobrança, falha de pagamento. |
| **Antifraude** | do gateway + regras próprias | limites por IP/cartão, verificação de e-mail em doação anônima. |
| **Busca** | Postgres `tsvector` (início) → OpenSearch/Meilisearch (escala) | indexar título, descrição, tags, artista. |

---

## 8. Modelo de dados (resumo)

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

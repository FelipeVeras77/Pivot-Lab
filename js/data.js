/* =============================================================================
   ArtLivre · data.js
   -----------------------------------------------------------------------------
   Mocks de artistas, obras e apoiadores. Estes objetos são a MESMA coisa que os
   arquivos em /data/*.json — ficam embutidos aqui para o protótipo rodar por
   file:// (dois cliques no index.html) sem servidor nem CORS.

   App.data.load() ainda tenta buscar os .json quando a página é servida por
   http(s); se conseguir, usa a versão do arquivo. Se falhar, cai nestes dados.

   Trocar por backend real depois = reimplementar App.data.load() para bater na
   API (ver BACKEND_INTEGRATION.md) e devolver o mesmo formato.
   ========================================================================== */
(function (App) {
  "use strict";

  /* ---- Categorias oficiais (id + rótulo + ícone Font Awesome) -------------- */
  var CATEGORIAS = [
    { id: "todas",      rotulo: "Todas",             icone: "fa-border-all" },
    { id: "ilustracao", rotulo: "Ilustração",        icone: "fa-pen-nib" },
    { id: "musica",     rotulo: "Música",            icone: "fa-headphones" },
    { id: "fotografia", rotulo: "Fotografia",        icone: "fa-camera-retro" },
    { id: "artesanato", rotulo: "Artesanato",        icone: "fa-hand-sparkles" },
    { id: "design",     rotulo: "Design",            icone: "fa-shapes" },
    { id: "literatura", rotulo: "Literatura",        icone: "fa-book-open" }
  ];

  var ARTISTS = [
    {
      id: "marina-torres", nome: "Marina Tôrres", usuario: "marinatorres",
      avatar: "https://picsum.photos/seed/artlivre-marina-avatar/240/240",
      banner: "https://picsum.photos/seed/artlivre-marina-banner/1600/520",
      categoria: "ilustracao", cidade: "São Paulo, SP",
      especialidades: ["Ilustração editorial", "Folk-futurismo", "Risografia"],
      bio: "Ilustro histórias que misturam santeiro de barro, ficção científica e o verde do quintal da minha avó.",
      sobre: "Comecei desenhando nas margens dos cadernos da escola em Sorocaba e nunca parei. Hoje trabalho com risografia e pintura digital, atendendo revistas independentes, selos de música e editoras pequenas. A ArtLivre é onde publico o processo inteiro: os rabiscos ruins, as paletas descartadas e as peças que só existem porque alguém aqui decidiu bancar um mês de trabalho tranquilo. Minha meta é fechar 2026 vivendo só de ilustração autoral, sem depender de freela corporativo.",
      trajetoria: [
        { ano: "2016", fato: "Primeira fanzine vendida na Feira Plana" },
        { ano: "2019", fato: "Capa para a revista Piseagrama" },
        { ano: "2022", fato: "Residência de risografia no Ateliê Fidalga" },
        { ano: "2025", fato: "Primeiro livro-ilustrado autoral, esgotado em 3 semanas" }
      ],
      redes: { instagram: "https://instagram.com/marinatorres", twitter: "https://twitter.com/marinatorres", behance: "https://behance.net/marinatorres" },
      meta: { alvo: 6000, atual: 4120, moeda: "BRL", descricao: "Meta mensal para dedicar 4 dias por semana só à ilustração autoral." },
      apoiadoresAtivos: 148, visualizacoesPerfil: 9240, entrouEm: "2023-02-11",
      tiers: [
        { id: "marina-bronze", nome: "Caderno de rascunhos", preco: 10, cor: "#B8895B", beneficios: ["Acesso antecipado a rascunhos e estudos de cor", "Feed exclusivo de bastidores toda semana"] },
        { id: "marina-prata", nome: "Nome na tiragem", preco: 25, cor: "#8A8F9A", beneficios: ["Tudo do nível anterior", "Seu nome nos créditos das próximas risografias", "Canal fechado no Discord com lives de processo"] },
        { id: "marina-ouro", nome: "Print do mês", preco: 50, cor: "#C9A227", beneficios: ["Tudo dos níveis anteriores", "Uma arte digital exclusiva em alta resolução por mês", "Bilhete escrito à mão no fim do trimestre"] }
      ]
    },
    {
      id: "beto-cravo", nome: "Beto Cravo", usuario: "betocravo",
      avatar: "https://picsum.photos/seed/artlivre-beto-avatar/240/240",
      banner: "https://picsum.photos/seed/artlivre-beto-banner/1600/520",
      categoria: "musica", cidade: "Recife, PE",
      especialidades: ["Produção musical", "Manguebeat", "Trilha para dança"],
      bio: "Produtor e multi-instrumentista. Faço beats que cheiram a maresia, alfaia e circuito integrado.",
      sobre: "Cresci ouvindo maracatu de baque virado no Alto José do Pinho e estudando síntese modular pela madrugada. Produzo para artistas do Norte e Nordeste e componho trilha para companhias de dança contemporânea. Aqui na ArtLivre eu solto faixa nova todo mês antes de qualquer plataforma, mando os stems para quem quer remixar e explico a engenharia por trás de cada mixagem. O apoio recorrente é o que me deixa dizer não para job publicitário que não tem a ver comigo.",
      trajetoria: [
        { ano: "2015", fato: "Primeiro EP lançado em CD-R na Rua da Moeda" },
        { ano: "2018", fato: "Trilha para o espetáculo 'Cais' (Grupo Experimental)" },
        { ano: "2021", fato: "Produção do disco 'Enseada', indicado ao Prêmio da Música PE" },
        { ano: "2024", fato: "Turnê por 6 cidades com banda de 7 pessoas" }
      ],
      redes: { instagram: "https://instagram.com/betocravo", spotify: "https://open.spotify.com/artist/betocravo", twitter: "https://twitter.com/betocravo" },
      meta: { alvo: 8000, atual: 6570, moeda: "BRL", descricao: "Meta mensal para manter o estúdio caseiro e pagar cachê justo à banda nas gravações." },
      apoiadoresAtivos: 213, visualizacoesPerfil: 15120, entrouEm: "2022-09-03",
      tiers: [
        { id: "beto-bronze", nome: "Ouvinte de primeira mão", preco: 10, cor: "#B8895B", beneficios: ["Faixa nova todo mês antes das plataformas", "Playlist de referências comentada"] },
        { id: "beto-prata", nome: "Sala de controle", preco: 25, cor: "#8A8F9A", beneficios: ["Tudo do nível anterior", "Stems e projeto para remix", "Live mensal de mixagem com perguntas ao vivo"] },
        { id: "beto-ouro", nome: "Ficha técnica", preco: 50, cor: "#C9A227", beneficios: ["Tudo dos níveis anteriores", "Seu nome na ficha técnica dos próximos lançamentos", "Uma dedicatória em áudio por trimestre"] }
      ]
    },
    {
      id: "lia-santanna", nome: "Lia Sant'Anna", usuario: "liasantanna",
      avatar: "https://picsum.photos/seed/artlivre-lia-avatar/240/240",
      banner: "https://picsum.photos/seed/artlivre-lia-banner/1600/520",
      categoria: "fotografia", cidade: "Salvador, BA",
      especialidades: ["Retrato documental", "Fotografia de rua", "Analógico 35mm"],
      bio: "Fotógrafa documental. Passo os dias no Centro Histórico atrás de luz difícil e gente que ninguém fotografa.",
      sobre: "Trabalho com filme desde 2013 porque ele me obriga a esperar. Documento festas populares, feiras e as pessoas que sustentam o Centro de Salvador quando os turistas vão embora. Já expus em coletivas na Bahia e em Portugal, mas o que me interessa mesmo é entregar retrato impresso na mão de quem foi fotografado. O apoio da ArtLivre paga filme, revelação e as viagens curtas para o Recôncavo.",
      trajetoria: [
        { ano: "2013", fato: "Primeiro laboratório caseiro montado no banheiro" },
        { ano: "2017", fato: "Ensaio 'Ganhadeiras' publicado na revista ZUM" },
        { ano: "2020", fato: "Exposição individual 'Depois do Coreto'" },
        { ano: "2023", fato: "Livro-objeto artesanal com 40 cópias numeradas" }
      ],
      redes: { instagram: "https://instagram.com/liasantanna", behance: "https://behance.net/liasantanna" },
      meta: { alvo: 4500, atual: 2280, moeda: "BRL", descricao: "Meta mensal para cobrir filme, revelação e o projeto de retrato itinerante no Recôncavo." },
      apoiadoresAtivos: 74, visualizacoesPerfil: 5380, entrouEm: "2023-06-19",
      tiers: [
        { id: "lia-bronze", nome: "Contato ampliado", preco: 10, cor: "#B8895B", beneficios: ["Uma folha de contato comentada por mês", "Diário de campo com áudios curtos"] },
        { id: "lia-prata", nome: "Cópia de leitura", preco: 25, cor: "#8A8F9A", beneficios: ["Tudo do nível anterior", "Uma cópia digital em alta a cada mês", "Voto na próxima série documental"] },
        { id: "lia-ouro", nome: "Prova de arquivo", preco: 50, cor: "#C9A227", beneficios: ["Tudo dos níveis anteriores", "Uma cópia impressa fine art por trimestre, enviada pelo correio", "Nome no colofão dos próximos fotolivros"] }
      ]
    },
    {
      id: "oficina-carua", nome: "Oficina Caruá", usuario: "oficinacarua",
      avatar: "https://picsum.photos/seed/artlivre-carua-avatar/240/240",
      banner: "https://picsum.photos/seed/artlivre-carua-banner/1600/520",
      categoria: "artesanato", cidade: "Belém, PA",
      especialidades: ["Cerâmica marajoara contemporânea", "Fibra de tucumã", "Engobe natural"],
      bio: "Ateliê de duas ceramistas amazônidas. Barro do baixo Tocantins, formas que conversam com a arte marajoara.",
      sobre: "A Oficina Caruá é a Dora e a Preta, duas ceramistas que dividem um galpão em Icoaraci. Trabalhamos com barro coletado de forma responsável e pigmentos de terra da região. Reinterpretamos grafismos marajoaras em peças utilitárias: canecas, alguidares, luminárias. Cada apoio mensal vira hora de forno e material para as oficinas gratuitas que damos para adolescentes do bairro.",
      trajetoria: [
        { ano: "2017", fato: "Primeiro forno a gás construído no quintal" },
        { ano: "2019", fato: "Participação no Salão do Artesanato do Pará" },
        { ano: "2022", fato: "Linha de luminárias em fibra de tucumã esgotada na pré-venda" },
        { ano: "2025", fato: "Oficina gratuita formou a primeira turma de 12 jovens" }
      ],
      redes: { instagram: "https://instagram.com/oficinacarua" },
      meta: { alvo: 5500, atual: 3960, moeda: "BRL", descricao: "Meta mensal para bancar as oficinas gratuitas do bairro e a queima coletiva mensal." },
      apoiadoresAtivos: 96, visualizacoesPerfil: 4110, entrouEm: "2023-11-02",
      tiers: [
        { id: "carua-bronze", nome: "Diário do forno", preco: 10, cor: "#B8895B", beneficios: ["Registro em vídeo de cada queima", "Ficha técnica das misturas de engobe"] },
        { id: "carua-prata", nome: "Roda de barro", preco: 25, cor: "#8A8F9A", beneficios: ["Tudo do nível anterior", "Aula gravada de técnica por mês", "Prioridade na lista de espera das peças"] },
        { id: "carua-ouro", nome: "Peça da estante", preco: 50, cor: "#C9A227", beneficios: ["Tudo dos níveis anteriores", "Uma peça pequena feita à mão por trimestre", "Seu nome gravado no mural do ateliê"] }
      ]
    },
    {
      id: "nuno-prado", nome: "Nuno Prado", usuario: "nunoprado",
      avatar: "https://picsum.photos/seed/artlivre-nuno-avatar/240/240",
      banner: "https://picsum.photos/seed/artlivre-nuno-banner/1600/520",
      categoria: "design", cidade: "Porto Alegre, RS",
      especialidades: ["Tipografia de exibição", "Cartaz cultural", "Identidade visual"],
      bio: "Designer gráfico e desenhista de tipos. Faço cartaz de show, fonte de encomenda e sistema visual para gente pequena.",
      sobre: "Trabalho sozinho num escritório de 9 m² no bairro Cidade Baixa. Metade do meu tempo é cartaz para casas de show independentes; a outra metade é desenho de tipos por encomenda. Publico aqui os arquivos-fonte, os specimens em progresso e os cartazes em resolução de impressão para quem quiser pregar na parede. O apoio recorrente me deixa cobrar preço honesto de coletivo cultural sem passar aperto no fim do mês.",
      trajetoria: [
        { ano: "2014", fato: "Primeira fonte publicada, a 'Guaíba Grotesk'" },
        { ano: "2018", fato: "Cartazes para o festival Nthrop, 3 edições seguidas" },
        { ano: "2021", fato: "Identidade visual da editora Arquipélago" },
        { ano: "2024", fato: "Specimen impresso 'Minuano', 200 cópias risografadas" }
      ],
      redes: { instagram: "https://instagram.com/nunoprado", behance: "https://behance.net/nunoprado", twitter: "https://twitter.com/nunoprado" },
      meta: { alvo: 5000, atual: 5230, moeda: "BRL", descricao: "Meta mensal batida: agora o excedente vira bolsa de impressão para cartaz de coletivo sem verba." },
      apoiadoresAtivos: 121, visualizacoesPerfil: 7890, entrouEm: "2022-12-08",
      tiers: [
        { id: "nuno-bronze", nome: "Prova de página", preco: 10, cor: "#B8895B", beneficios: ["Specimens e estudos de letra em PDF toda semana", "Wallpaper tipográfico mensal"] },
        { id: "nuno-prata", nome: "Arquivo aberto", preco: 25, cor: "#8A8F9A", beneficios: ["Tudo do nível anterior", "Cartaz do mês em resolução de impressão (CMYK)", "Licença de uso pessoal das fontes em beta"] },
        { id: "nuno-ouro", nome: "Mesa de luz", preco: 50, cor: "#C9A227", beneficios: ["Tudo dos níveis anteriores", "Um cartaz risografado enviado pelo correio por trimestre", "Uma hora de consultoria de tipografia por semestre"] }
      ]
    },
    {
      id: "clarice-vidal", nome: "Clarice Vidal", usuario: "claricevidal",
      avatar: "https://picsum.photos/seed/artlivre-clarice-avatar/240/240",
      banner: "https://picsum.photos/seed/artlivre-clarice-banner/1600/520",
      categoria: "literatura", cidade: "Belo Horizonte, MG",
      especialidades: ["Ficção seriada", "Conto fantástico", "Fanzine literária"],
      bio: "Escritora. Publico um conto por quinzena e monto zines literárias que ninguém pediu, mas todo mundo acaba querendo.",
      sobre: "Sou escritora e trabalho de manhã cedo, antes de todo mundo acordar. Escrevo ficção fantástica ambientada numa Belo Horizonte que quase existe: linhas de ônibus que somem, prédios que trocam de endereço. Aqui na ArtLivre publico um conto novo a cada quinze dias, mando o processo de revisão comentado e imprimo uma zine física por trimestre. O apoio mensal é o que substitui o emprego das 9 às 18 que larguei em 2023.",
      trajetoria: [
        { ano: "2018", fato: "Primeiro conto premiado no concurso da Biblioteca Pública" },
        { ano: "2020", fato: "Coletânea 'Linhas Mortas' publicada por editora independente" },
        { ano: "2023", fato: "Larguei o emprego CLT para escrever em tempo integral" },
        { ano: "2025", fato: "Série 'O Bairro que Anda' passou de 2.000 leitores por capítulo" }
      ],
      redes: { instagram: "https://instagram.com/claricevidal", twitter: "https://twitter.com/claricevidal" },
      meta: { alvo: 4000, atual: 1740, moeda: "BRL", descricao: "Meta mensal para manter a rotina de escrita integral e a impressão trimestral das zines." },
      apoiadoresAtivos: 58, visualizacoesPerfil: 3620, entrouEm: "2024-01-27",
      tiers: [
        { id: "clarice-bronze", nome: "Assinante da série", preco: 10, cor: "#B8895B", beneficios: ["Um conto novo a cada quinzena, em PDF e ePub", "Bastidores do processo de escrita por e-mail"] },
        { id: "clarice-prata", nome: "Mesa de revisão", preco: 25, cor: "#8A8F9A", beneficios: ["Tudo do nível anterior", "Versão comentada mostrando o que foi cortado", "Voto no rumo da série a cada arco"] },
        { id: "clarice-ouro", nome: "Tiragem de papel", preco: 50, cor: "#C9A227", beneficios: ["Tudo dos níveis anteriores", "A zine impressa enviada pelo correio a cada trimestre", "Uma personagem secundária batizada com o nome que você escolher"] }
      ]
    }
  ];

  var ARTWORKS = [
    { id: "obra-marina-01", artistId: "marina-torres", titulo: "Santa do Quintal", descricao: "Estudo em risografia de duas cores para a capa de uma fanzine sobre religiosidade popular no interior paulista. A auréola é um prato de esmalte descascado.", categoria: "ilustracao", tipoMidia: "imagem", urlMidia: "https://picsum.photos/seed/artlivre-marina-01/1000/1300", thumb: "https://picsum.photos/seed/artlivre-marina-01/600/780", curtidas: 412, apoiadores: 31, dataCriacao: "2026-08-14", tags: ["risografia", "folk", "duas cores", "capa"], comentarios: [
      { autor: "Renata Alvim", avatar: "https://picsum.photos/seed/artlivre-c-renata/80/80", texto: "A textura do azul ficou linda, parece parede de igreja de roça.", data: "2026-08-15" },
      { autor: "Design Coletivo Sul", avatar: "https://picsum.photos/seed/artlivre-c-dcs/80/80", texto: "Usaríamos numa camiseta na hora. Vende o arquivo?", data: "2026-08-16" }
    ] },
    { id: "obra-marina-02", artistId: "marina-torres", titulo: "Rota da Feira", descricao: "Mapa ilustrado de uma feira livre imaginária. Cada barraca é uma vinheta com cheiro próprio. Feito para um projeto editorial que não saiu do papel, agora liberado aqui.", categoria: "ilustracao", tipoMidia: "imagem", urlMidia: "https://picsum.photos/seed/artlivre-marina-02/1200/900", thumb: "https://picsum.photos/seed/artlivre-marina-02/700/525", curtidas: 287, apoiadores: 22, dataCriacao: "2026-07-30", tags: ["mapa ilustrado", "editorial", "vinhetas"], comentarios: [
      { autor: "João Bteshe", avatar: "https://picsum.photos/seed/artlivre-c-joao/80/80", texto: "O detalhe do carrinho de milho no canto me pegou.", data: "2026-07-31" }
    ] },
    { id: "obra-marina-03", artistId: "marina-torres", titulo: "Antena e Jabuticaba", descricao: "Pintura digital da série folk-futurismo: uma torre de transmissão brotando de um pé de jabuticaba. Print exclusivo do mês para o nível Ouro.", categoria: "ilustracao", tipoMidia: "imagem", urlMidia: "https://picsum.photos/seed/artlivre-marina-03/1000/1250", thumb: "https://picsum.photos/seed/artlivre-marina-03/600/750", curtidas: 531, apoiadores: 44, dataCriacao: "2026-08-02", tags: ["folk-futurismo", "pintura digital", "print do mês"], comentarios: [] },

    { id: "obra-beto-01", artistId: "beto-cravo", titulo: "Maré de Sizígia", descricao: "Faixa do mês. Alfaia gravada na laje, sintetizador modular e um sample de rádio pesqueiro de Brasília Teimosa. Stems disponíveis para o nível Sala de Controle.", categoria: "musica", tipoMidia: "audio", urlMidia: "", thumb: "https://picsum.photos/seed/artlivre-beto-01/700/700", duracao: 214, curtidas: 689, apoiadores: 73, dataCriacao: "2026-08-20", tags: ["manguebeat", "modular", "faixa do mês"], comentarios: [
      { autor: "DJ Aurora", avatar: "https://picsum.photos/seed/artlivre-c-aurora/80/80", texto: "Esse kick com a alfaia por cima é um crime (elogio). Já quero remixar.", data: "2026-08-21" },
      { autor: "Cais Companhia", avatar: "https://picsum.photos/seed/artlivre-c-cais/80/80", texto: "Serviria demais pra abertura do próximo espetáculo.", data: "2026-08-22" }
    ] },
    { id: "obra-beto-02", artistId: "beto-cravo", titulo: "Estudo de Alfaia nº 4", descricao: "Esboço rítmico de 90 segundos. Só percussão e um pad. Publico esses estudos crus para quem acompanha o processo.", categoria: "musica", tipoMidia: "audio", urlMidia: "", thumb: "https://picsum.photos/seed/artlivre-beto-02/700/700", duracao: 92, curtidas: 176, apoiadores: 12, dataCriacao: "2026-08-05", tags: ["estudo", "percussão", "bastidor"], comentarios: [
      { autor: "Marina Tôrres", avatar: "https://picsum.photos/seed/artlivre-marina-avatar/80/80", texto: "Desenhei ouvindo isso em loop. Combina com barro.", data: "2026-08-06" }
    ] },
    { id: "obra-beto-03", artistId: "beto-cravo", titulo: "Enseada (Ao Vivo no Estúdio)", descricao: "Regravação ao vivo, banda de sete pessoas amontoada na sala. Um take só, com o erro do baixo no minuto 2 que a gente decidiu manter.", categoria: "musica", tipoMidia: "audio", urlMidia: "", thumb: "https://picsum.photos/seed/artlivre-beto-03/700/700", duracao: 268, curtidas: 344, apoiadores: 39, dataCriacao: "2026-07-18", tags: ["ao vivo", "banda", "take único"], comentarios: [] },

    { id: "obra-lia-01", artistId: "lia-santanna", titulo: "Depois do Coreto, 6h47", descricao: "Praça Municipal vazia antes do sol subir. Filme vencido, revelado empurrando dois pontos. A varredora entrou no quadro sem eu pedir.", categoria: "fotografia", tipoMidia: "imagem", urlMidia: "https://picsum.photos/seed/artlivre-lia-01/1100/1400", thumb: "https://picsum.photos/seed/artlivre-lia-01/620/790", curtidas: 298, apoiadores: 18, dataCriacao: "2026-08-11", tags: ["35mm", "filme vencido", "Salvador", "amanhecer"], comentarios: [
      { autor: "Coletivo Analógico", avatar: "https://picsum.photos/seed/artlivre-c-analogico/80/80", texto: "O grão nessa foto vale mais que qualquer filtro.", data: "2026-08-12" }
    ] },
    { id: "obra-lia-02", artistId: "lia-santanna", titulo: "Ganhadeira, Feira de São Joaquim", descricao: "Retrato de Dona Nici entre os balaios. Fiz três cópias impressas: uma pra ela, uma pro arquivo, essa é a digital que fica pros apoiadores.", categoria: "fotografia", tipoMidia: "imagem", urlMidia: "https://picsum.photos/seed/artlivre-lia-02/1000/1250", thumb: "https://picsum.photos/seed/artlivre-lia-02/600/750", curtidas: 461, apoiadores: 27, dataCriacao: "2026-07-25", tags: ["retrato", "feira", "documental"], comentarios: [] },
    { id: "obra-lia-03", artistId: "lia-santanna", titulo: "Recôncavo, Janela do Ferry", descricao: "Travessia Salvador–Mar Grande. A mão no vidro é de um menino que passou a viagem inteira contando os barcos.", categoria: "fotografia", tipoMidia: "imagem", urlMidia: "https://picsum.photos/seed/artlivre-lia-03/1200/860", thumb: "https://picsum.photos/seed/artlivre-lia-03/700/500", curtidas: 209, apoiadores: 14, dataCriacao: "2026-08-18", tags: ["travessia", "Recôncavo", "35mm"], comentarios: [
      { autor: "Nuno Prado", avatar: "https://picsum.photos/seed/artlivre-nuno-avatar/80/80", texto: "Essa luz na água é de encomenda. Quero num cartaz.", data: "2026-08-19" }
    ] },

    { id: "obra-carua-01", artistId: "oficina-carua", titulo: "Alguidar com Grafismo de Onça", descricao: "Peça utilitária de 28 cm, engobe preto de manganês sobre barro claro. O grafismo é releitura de um padrão marajoara de cerâmica funerária.", categoria: "artesanato", tipoMidia: "imagem", urlMidia: "https://picsum.photos/seed/artlivre-carua-01/1000/1000", thumb: "https://picsum.photos/seed/artlivre-carua-01/620/620", curtidas: 377, apoiadores: 29, dataCriacao: "2026-08-09", tags: ["cerâmica", "marajoara", "engobe", "utilitário"], comentarios: [
      { autor: "Casa Terra", avatar: "https://picsum.photos/seed/artlivre-c-casaterra/80/80", texto: "Entra na lista de espera de quantas peças?", data: "2026-08-10" }
    ] },
    { id: "obra-carua-02", artistId: "oficina-carua", titulo: "Luminária Tucumã nº 12", descricao: "Fibra de tucumã trançada sobre estrutura de metal, soquete E27. A sombra que ela joga na parede é metade do trabalho.", categoria: "artesanato", tipoMidia: "imagem", urlMidia: "https://picsum.photos/seed/artlivre-carua-02/1000/1300", thumb: "https://picsum.photos/seed/artlivre-carua-02/600/780", curtidas: 512, apoiadores: 41, dataCriacao: "2026-07-21", tags: ["fibra", "tucumã", "luminária", "trançado"], comentarios: [] },
    { id: "obra-carua-03", artistId: "oficina-carua", titulo: "Turma de Oficina, Queima nº 30", descricao: "Registro da queima coletiva com a primeira turma de adolescentes do bairro. Cada um fez a própria caneca. Nenhuma quebrou no forno.", categoria: "artesanato", tipoMidia: "imagem", urlMidia: "https://picsum.photos/seed/artlivre-carua-03/1200/900", thumb: "https://picsum.photos/seed/artlivre-carua-03/700/525", curtidas: 244, apoiadores: 33, dataCriacao: "2026-08-17", tags: ["oficina", "comunidade", "forno", "Icoaraci"], comentarios: [
      { autor: "Clarice Vidal", avatar: "https://picsum.photos/seed/artlivre-clarice-avatar/80/80", texto: "Isso aqui é o melhor uso possível do dinheiro de apoio.", data: "2026-08-18" }
    ] },

    { id: "obra-nuno-01", artistId: "nuno-prado", titulo: "Cartaz: Nthrop Festival, Noite 2", descricao: "Cartaz A2 risografado em três cores. A tipografia é a Minuano em peso experimental, ainda não lançada. Arquivo CMYK para o nível Arquivo Aberto.", categoria: "design", tipoMidia: "imagem", urlMidia: "https://picsum.photos/seed/artlivre-nuno-01/1000/1414", thumb: "https://picsum.photos/seed/artlivre-nuno-01/600/848", curtidas: 466, apoiadores: 52, dataCriacao: "2026-08-13", tags: ["cartaz", "risografia", "tipografia", "festival"], comentarios: [
      { autor: "Nthrop", avatar: "https://picsum.photos/seed/artlivre-c-nthrop/80/80", texto: "Terceira edição seguida e ainda melhora. Já pregamos na porta.", data: "2026-08-14" }
    ] },
    { id: "obra-nuno-02", artistId: "nuno-prado", titulo: "Specimen Minuano, Prova 07", descricao: "Página de specimen mostrando a Minuano do peso Fino ao Preto. Ainda ajustando o 'g' de descida e o espaçamento do versalete.", categoria: "design", tipoMidia: "imagem", urlMidia: "https://picsum.photos/seed/artlivre-nuno-02/1200/900", thumb: "https://picsum.photos/seed/artlivre-nuno-02/700/525", curtidas: 189, apoiadores: 24, dataCriacao: "2026-07-28", tags: ["specimen", "type design", "processo"], comentarios: [] },
    { id: "obra-nuno-03", artistId: "nuno-prado", titulo: "Wallpaper Tipográfico: Agosto", descricao: "Composição só com a palavra 'teimosia' repetida em três pesos. Wallpaper do mês para todos os níveis, em resoluções de desktop e celular.", categoria: "design", tipoMidia: "imagem", urlMidia: "https://picsum.photos/seed/artlivre-nuno-03/1400/900", thumb: "https://picsum.photos/seed/artlivre-nuno-03/700/450", curtidas: 301, apoiadores: 61, dataCriacao: "2026-08-01", tags: ["wallpaper", "lettering", "brinde mensal"], comentarios: [
      { autor: "Beto Cravo", avatar: "https://picsum.photos/seed/artlivre-beto-avatar/80/80", texto: "Botei no telefone e no laptop. Combina com o disco novo.", data: "2026-08-02" }
    ] },

    { id: "obra-clarice-01", artistId: "clarice-vidal", titulo: "O Bairro que Anda — Capítulo 9", descricao: "A linha 9201 muda de itinerário toda vez que chove. Nesse capítulo, a Bete descobre por quê. Conto de 3.400 palavras, PDF e ePub.", categoria: "literatura", tipoMidia: "imagem", urlMidia: "https://picsum.photos/seed/artlivre-clarice-01/1000/1300", thumb: "https://picsum.photos/seed/artlivre-clarice-01/600/780", curtidas: 254, apoiadores: 47, dataCriacao: "2026-08-19", tags: ["ficção seriada", "fantástico", "Belo Horizonte"], comentarios: [
      { autor: "Livraria da Esquina", avatar: "https://picsum.photos/seed/artlivre-c-livraria/80/80", texto: "Cada capítulo desses pede uma edição impressa. Segura essa série.", data: "2026-08-20" }
    ] },
    { id: "obra-clarice-02", artistId: "clarice-vidal", titulo: "Zine 'Linhas Mortas' — Miolo", descricao: "Spread do miolo da zine trimestral, diagramado à mão sobre papel pólen. Quatro contos curtos e um mapa dobrável de ônibus fantasma.", categoria: "literatura", tipoMidia: "imagem", urlMidia: "https://picsum.photos/seed/artlivre-clarice-02/1200/850", thumb: "https://picsum.photos/seed/artlivre-clarice-02/700/495", curtidas: 167, apoiadores: 19, dataCriacao: "2026-07-15", tags: ["zine", "impresso", "diagramação"], comentarios: [] },
    { id: "obra-clarice-03", artistId: "clarice-vidal", titulo: "Versão Comentada — Conto 'Endereço Novo'", descricao: "O mesmo conto com as marcas de revisão à vista: o que foi cortado, o parágrafo que mudou de lugar três vezes, a frase que a editora odiou.", categoria: "literatura", tipoMidia: "imagem", urlMidia: "https://picsum.photos/seed/artlivre-clarice-03/1000/1200", thumb: "https://picsum.photos/seed/artlivre-clarice-03/600/720", curtidas: 142, apoiadores: 26, dataCriacao: "2026-08-04", tags: ["processo", "revisão", "bastidor"], comentarios: [
      { autor: "Oficina de Escrita BH", avatar: "https://picsum.photos/seed/artlivre-c-oficina/80/80", texto: "Uso esses comentados na aula. Melhor material sobre revisão que existe.", data: "2026-08-05" }
    ] }
  ];

  var SUPPORTERS = [
    { id: "sup-001", nome: "Renata Alvim", avatar: "https://picsum.photos/seed/artlivre-s-renata/80/80", artistId: "marina-torres", tipo: "mensal", tierId: "marina-ouro", valor: 50, data: "2026-08-02" },
    { id: "sup-002", nome: "João Bteshe", avatar: "https://picsum.photos/seed/artlivre-s-joao/80/80", artistId: "marina-torres", tipo: "mensal", tierId: "marina-prata", valor: 25, data: "2026-08-03" },
    { id: "sup-003", nome: "Coletivo Sul", avatar: "https://picsum.photos/seed/artlivre-s-sul/80/80", artistId: "marina-torres", tipo: "mensal", tierId: "marina-prata", valor: 25, data: "2026-08-05" },
    { id: "sup-004", nome: "Priscila Nery", avatar: "https://picsum.photos/seed/artlivre-s-priscila/80/80", artistId: "marina-torres", tipo: "mensal", tierId: "marina-bronze", valor: 10, data: "2026-08-06" },
    { id: "sup-005", nome: "Editora Arquipélago", avatar: "https://picsum.photos/seed/artlivre-s-arqui/80/80", artistId: "marina-torres", tipo: "pontual", tierId: null, valor: 120, data: "2026-08-08" },
    { id: "sup-006", nome: "Tiago Menezes", avatar: "https://picsum.photos/seed/artlivre-s-tiago/80/80", artistId: "marina-torres", tipo: "mensal", tierId: "marina-bronze", valor: 10, data: "2026-08-09" },
    { id: "sup-007", nome: "Ana Clara Pó", avatar: "https://picsum.photos/seed/artlivre-s-anaclara/80/80", artistId: "marina-torres", tipo: "mensal", tierId: "marina-ouro", valor: 50, data: "2026-08-12" },
    { id: "sup-008", nome: "Zine Club BH", avatar: "https://picsum.photos/seed/artlivre-s-zineclub/80/80", artistId: "marina-torres", tipo: "pontual", tierId: null, valor: 35, data: "2026-08-14" },
    { id: "sup-009", nome: "Marcos Vinícius", avatar: "https://picsum.photos/seed/artlivre-s-marcos/80/80", artistId: "marina-torres", tipo: "mensal", tierId: "marina-prata", valor: 25, data: "2026-08-16" },
    { id: "sup-010", nome: "Luiza Sampaio", avatar: "https://picsum.photos/seed/artlivre-s-luiza/80/80", artistId: "marina-torres", tipo: "mensal", tierId: "marina-bronze", valor: 10, data: "2026-08-19" },
    { id: "sup-011", nome: "Estúdio Lampião", avatar: "https://picsum.photos/seed/artlivre-s-lampiao/80/80", artistId: "marina-torres", tipo: "mensal", tierId: "marina-ouro", valor: 50, data: "2026-08-22" },
    { id: "sup-012", nome: "Bruna Tavares", avatar: "https://picsum.photos/seed/artlivre-s-bruna/80/80", artistId: "marina-torres", tipo: "pontual", tierId: null, valor: 25, data: "2026-08-24" },
    { id: "sup-020", nome: "DJ Aurora", avatar: "https://picsum.photos/seed/artlivre-s-aurora/80/80", artistId: "beto-cravo", tipo: "mensal", tierId: "beto-prata", valor: 25, data: "2026-08-04" },
    { id: "sup-021", nome: "Cais Companhia", avatar: "https://picsum.photos/seed/artlivre-s-cais/80/80", artistId: "beto-cravo", tipo: "mensal", tierId: "beto-ouro", valor: 50, data: "2026-08-07" },
    { id: "sup-022", nome: "Rádio Frevo Web", avatar: "https://picsum.photos/seed/artlivre-s-radiofrevo/80/80", artistId: "beto-cravo", tipo: "mensal", tierId: "beto-bronze", valor: 10, data: "2026-08-10" },
    { id: "sup-023", nome: "Helena Rios", avatar: "https://picsum.photos/seed/artlivre-s-helena/80/80", artistId: "beto-cravo", tipo: "pontual", tierId: null, valor: 40, data: "2026-08-15" },
    { id: "sup-024", nome: "Coletivo Baque", avatar: "https://picsum.photos/seed/artlivre-s-baque/80/80", artistId: "beto-cravo", tipo: "mensal", tierId: "beto-prata", valor: 25, data: "2026-08-18" },
    { id: "sup-030", nome: "Coletivo Analógico", avatar: "https://picsum.photos/seed/artlivre-s-analogico/80/80", artistId: "lia-santanna", tipo: "mensal", tierId: "lia-prata", valor: 25, data: "2026-08-03" },
    { id: "sup-031", nome: "Galeria Ladeira", avatar: "https://picsum.photos/seed/artlivre-s-ladeira/80/80", artistId: "lia-santanna", tipo: "mensal", tierId: "lia-ouro", valor: 50, data: "2026-08-09" },
    { id: "sup-032", nome: "Pedro Sacramento", avatar: "https://picsum.photos/seed/artlivre-s-pedro/80/80", artistId: "lia-santanna", tipo: "mensal", tierId: "lia-bronze", valor: 10, data: "2026-08-13" },
    { id: "sup-033", nome: "Revista ZUM (leitor)", avatar: "https://picsum.photos/seed/artlivre-s-zum/80/80", artistId: "lia-santanna", tipo: "pontual", tierId: null, valor: 30, data: "2026-08-20" },
    { id: "sup-040", nome: "Casa Terra", avatar: "https://picsum.photos/seed/artlivre-s-casaterra/80/80", artistId: "oficina-carua", tipo: "mensal", tierId: "carua-ouro", valor: 50, data: "2026-08-05" },
    { id: "sup-041", nome: "Escola Vila do Barro", avatar: "https://picsum.photos/seed/artlivre-s-vila/80/80", artistId: "oficina-carua", tipo: "mensal", tierId: "carua-prata", valor: 25, data: "2026-08-11" },
    { id: "sup-042", nome: "Dora Antunes", avatar: "https://picsum.photos/seed/artlivre-s-dora/80/80", artistId: "oficina-carua", tipo: "mensal", tierId: "carua-bronze", valor: 10, data: "2026-08-17" },
    { id: "sup-050", nome: "Nthrop", avatar: "https://picsum.photos/seed/artlivre-s-nthrop/80/80", artistId: "nuno-prado", tipo: "mensal", tierId: "nuno-ouro", valor: 50, data: "2026-08-02" },
    { id: "sup-051", nome: "Editora Arquipélago", avatar: "https://picsum.photos/seed/artlivre-s-arqui2/80/80", artistId: "nuno-prado", tipo: "mensal", tierId: "nuno-prata", valor: 25, data: "2026-08-08" },
    { id: "sup-052", nome: "Casa de Show Ocidente", avatar: "https://picsum.photos/seed/artlivre-s-ocidente/80/80", artistId: "nuno-prado", tipo: "mensal", tierId: "nuno-prata", valor: 25, data: "2026-08-16" },
    { id: "sup-060", nome: "Livraria da Esquina", avatar: "https://picsum.photos/seed/artlivre-s-livraria/80/80", artistId: "clarice-vidal", tipo: "mensal", tierId: "clarice-ouro", valor: 50, data: "2026-08-06" },
    { id: "sup-061", nome: "Oficina de Escrita BH", avatar: "https://picsum.photos/seed/artlivre-s-oficina/80/80", artistId: "clarice-vidal", tipo: "mensal", tierId: "clarice-prata", valor: 25, data: "2026-08-12" },
    { id: "sup-062", nome: "Camila Drummond", avatar: "https://picsum.photos/seed/artlivre-s-camila/80/80", artistId: "clarice-vidal", tipo: "mensal", tierId: "clarice-bronze", valor: 10, data: "2026-08-21" }
  ];

  var DESEMPENHO = {
    "marina-torres": { meses: ["Mar", "Abr", "Mai", "Jun", "Jul", "Ago"], arrecadacao: [2380, 2610, 3050, 3420, 3880, 4120], visitas: [1120, 1340, 1610, 1490, 1880, 2260], novosApoiadores: [9, 12, 15, 11, 18, 21] },
    "beto-cravo": { meses: ["Mar", "Abr", "Mai", "Jun", "Jul", "Ago"], arrecadacao: [4900, 5200, 5400, 5850, 6100, 6570], visitas: [2600, 2810, 3050, 2990, 3400, 3720], novosApoiadores: [14, 16, 11, 19, 17, 24] },
    "lia-santanna": { meses: ["Mar", "Abr", "Mai", "Jun", "Jul", "Ago"], arrecadacao: [1450, 1560, 1720, 1900, 2080, 2280], visitas: [720, 810, 940, 880, 1050, 1180], novosApoiadores: [5, 7, 6, 8, 9, 11] },
    "oficina-carua": { meses: ["Mar", "Abr", "Mai", "Jun", "Jul", "Ago"], arrecadacao: [2600, 2850, 3100, 3400, 3700, 3960], visitas: [620, 690, 780, 810, 900, 1010], novosApoiadores: [7, 9, 8, 10, 12, 13] },
    "nuno-prado": { meses: ["Mar", "Abr", "Mai", "Jun", "Jul", "Ago"], arrecadacao: [3900, 4200, 4400, 4650, 4900, 5230], visitas: [1400, 1520, 1680, 1610, 1820, 1990], novosApoiadores: [11, 13, 9, 15, 14, 18] },
    "clarice-vidal": { meses: ["Mar", "Abr", "Mai", "Jun", "Jul", "Ago"], arrecadacao: [780, 940, 1120, 1300, 1520, 1740], visitas: [430, 510, 600, 640, 730, 860], novosApoiadores: [4, 6, 5, 7, 8, 10] }
  };

  /* ---- API interna --------------------------------------------------------- */
  App.data = {
    categorias: CATEGORIAS,
    // Preenchidos por load(); começam com a cópia embutida.
    artists: ARTISTS,
    artworks: ARTWORKS,
    supporters: SUPPORTERS,
    desempenho: DESEMPENHO,

    /* Tenta ler os .json quando servido por http(s). Silencioso em file://. */
    load: function () {
      var base = "data/";
      function pull(nome) {
        return fetch(base + nome, { cache: "no-store" })
          .then(function (r) { if (!r.ok) throw new Error(r.status); return r.json(); })
          .catch(function () { return null; });
      }
      if (location.protocol === "file:") {
        return Promise.resolve(false); // dados embutidos já servem
      }
      return Promise.all([pull("artists.json"), pull("artworks.json"), pull("supporters.json")])
        .then(function (res) {
          if (res[0] && res[0].artists) App.data.artists = res[0].artists;
          if (res[1] && res[1].artworks) App.data.artworks = res[1].artworks;
          if (res[2] && res[2].supporters) {
            App.data.supporters = res[2].supporters;
            if (res[2].desempenho) App.data.desempenho = res[2].desempenho;
          }
          return true;
        })
        .catch(function () { return false; });
    }
  };
})(window.App = window.App || {});

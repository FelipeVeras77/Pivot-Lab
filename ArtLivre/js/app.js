/* =============================================================================
   ArtLivre · app.js
   -----------------------------------------------------------------------------
   Roteamento (hash), renderização das telas e tratamento de eventos.

   Telas: Explorar · Perfil do Artista · Painel do Criador · Publicar
   Sobreposições: Modal de Obra · Fluxo de Apoio (checkout.js) · Player (player.js)

   Estratégia de render: App.render() reconstrói #app inteiro para a rota atual.
   Interações de alta frequência (busca, player, curtir) atualizam só o pedaço
   necessário do DOM, sem re-render geral — assim o input não perde o foco.
   ========================================================================== */
(function (App) {
  "use strict";

  var U = App.util;
  var raiz = document.getElementById("app");

  /* ======================================================================= */
  /*  ROTEADOR                                                                */
  /* ======================================================================= */
  function parseHash() {
    var h = (location.hash || "#/").replace(/^#/, "");
    var q = {};
    var qi = h.indexOf("?");
    if (qi >= 0) {
      h.slice(qi + 1).split("&").forEach(function (par) {
        var kv = par.split("="); if (kv[0]) q[decodeURIComponent(kv[0])] = decodeURIComponent(kv[1] || "");
      });
      h = h.slice(0, qi);
    }
    var seg = h.split("/").filter(Boolean); // ['artista','id']
    if (!seg.length || seg[0] === "explorar") return { name: "explorar", params: {}, query: q };
    if (seg[0] === "artista" && seg[1]) return { name: "artista", params: { id: seg[1] }, query: q };
    if (seg[0] === "obra" && seg[1]) return { name: "obra", params: { id: seg[1] }, query: q };
    if (seg[0] === "painel") return { name: "painel", params: {}, query: q };
    if (seg[0] === "publicar") return { name: "publicar", params: {}, query: q };
    if (seg[0] === "favoritos") return { name: "favoritos", params: {}, query: q };
    if (seg[0] === "mensagens") return { name: "mensagens", params: {}, query: q };
    return { name: "explorar", params: {}, query: q };
  }

  function irPara(hash) { location.hash = hash; }

  window.addEventListener("hashchange", function () {
    var rotaAnterior = App.state.route;
    App.state.route = parseHash();
    // rota /obra/:id abre modal por cima do Explorar
    if (App.state.route.name === "obra") {
      App.state.modal = { tipo: "obra", id: App.state.route.params.id };
    }
    App.render();
    // Trocar só uma aba do mesmo perfil não deve devolver a pessoa ao topo.
    var mesmaTela = rotaAnterior.name === App.state.route.name &&
      rotaAnterior.params.id === App.state.route.params.id;
    if (!mesmaTela) {
      window.scrollTo({ top: 0, behavior: U.prefersReducedMotion() ? "auto" : "smooth" });
    }
  });

  /* ======================================================================= */
  /*  TEMA                                                                    */
  /* ======================================================================= */
  function aplicarTema() {
    var t = App.state.tema;
    var el = document.documentElement;
    el.setAttribute("data-theme", t === "escuro" ? "dark" : "light");
    var meta = document.querySelector('meta[name="theme-color"]');
    if (meta) {
      var escuro = t === "escuro";
      meta.setAttribute("content", escuro ? "#05070E" : "#EAEEF7");
    }
  }
  function ciclarTema() {
    App.state.tema = App.state.tema === "escuro" ? "claro" : "escuro";
    App.store.set("tema", App.state.tema);
    aplicarTema();
    App.render();
  }

  /* ======================================================================= */
  /*  PEÇAS REUTILIZÁVEIS                                                      */
  /* ======================================================================= */

  function iconeTipo(cat) {
    var c = (App.data.categorias.filter(function (x) { return x.id === cat; })[0]) || {};
    return c.icone || "fa-circle";
  }
  function rotuloCat(cat) {
    var c = (App.data.categorias.filter(function (x) { return x.id === cat; })[0]) || {};
    return c.rotulo || cat;
  }

  /* Chip de artista (avatar + nome), leva ao perfil. */
  function artistaChip(art, extra) {
    if (!art) return "";
    return '<a class="autor" href="#/artista/' + art.id + '" data-link>' +
      '<img src="' + U.esc(art.avatar) + '" alt="" width="28" height="28" loading="lazy">' +
      '<span>' + U.esc(art.nome) + (extra ? ' <small>' + U.esc(extra) + '</small>' : "") + '</span>' +
    '</a>';
  }

  /* A "régua de apoio" — elemento-assinatura. progresso 0..1.35 */
  function meterHTML(artistId, op) {
    op = op || {};
    var art = App.query.artistById(artistId);
    if (!art) return "";
    var atual = App.query.arrecadadoMes(artistId);
    var alvo = art.meta.alvo;
    var frac = App.query.progressoMeta(artistId);
    var pct = Math.round((atual / alvo) * 100);
    var batida = atual >= alvo;
    return '<div class="meter ' + (batida ? "meter--batida" : "") + '">' +
      '<div class="meter__linha">' +
        '<span class="meter__valor">' + U.fmtBRL(atual) + '</span>' +
        '<span class="meter__de">de ' + U.fmtBRL(alvo) + ' / mês</span>' +
        '<span class="meter__pct">' + pct + '%</span>' +
      '</div>' +
      '<div class="meter__trilho" role="progressbar" aria-valuemin="0" aria-valuemax="100" aria-valuenow="' + Math.min(pct, 100) + '" aria-label="Progresso da meta mensal">' +
        '<div class="meter__fill" style="width:' + Math.min(frac, 1) * 100 + '%"></div>' +
        (frac > 1 ? '<div class="meter__excedente" style="width:' + Math.min((frac - 1) / 0.35, 1) * 100 + '%"></div>' : "") +
      '</div>' +
      '<p class="meter__emocao"><i class="fa-solid fa-sparkles"></i> ' + (batida ? 'A comunidade já financia o próximo projeto.' : 'Faltam ' + U.fmtBRL(Math.max(0, alvo - atual)) + ' para financiar o próximo projeto.') + '</p>' +
      (op.descricao ? '<p class="meter__nota">' + U.esc(art.meta.descricao) + '</p>' : "") +
    '</div>';
  }

  /* Card de obra para o mural. */
  function cardObra(obra) {
    var art = App.query.artistById(obra.artistId);
    var curtido = App.query.isLiked(obra.id);
    var likes = App.query.likeCount(obra);
    var favorita = App.query.isFavorite(obra.id);
    var ehAudio = obra.tipoMidia === "audio";
    var midia = ehAudio
      ? '<div class="card__audio">' +
          '<img src="' + U.esc(obra.thumb) + '" alt="Capa de ' + U.esc(obra.titulo) + '" loading="lazy">' +
          '<span class="card__selo"><i class="fa-solid fa-headphones"></i> ' + U.fmtDuracao(obra.duracao) + '</span>' +
        '</div>'
      : '<img class="card__img" src="' + U.esc(obra.thumb) + '" alt="' + U.esc(obra.titulo) + ' — ' + U.esc(art ? art.nome : "") + '" loading="lazy">';

    return '<article class="card" data-obra-card="' + obra.id + '">' +
      '<button class="card__abrir" data-act="abrir-obra" data-obra="' + obra.id + '" aria-label="Abrir ' + U.esc(obra.titulo) + '">' +
        midia +
        '<span class="tag tag--cat card__cat"><i class="fa-solid ' + iconeTipo(obra.categoria) + '"></i>' + U.esc(rotuloCat(obra.categoria)) + '</span>' +
        '<span class="card__apoios" title="' + U.fmtNum(obra.apoiadores || 0) + ' apoiadores desta obra"><i class="fa-solid fa-hand-holding-heart"></i>' + U.fmtNum(obra.apoiadores || 0) + '</span>' +
      '</button>' +
      '<div class="card__corpo">' +
        '<h3 class="card__titulo"><button data-act="abrir-obra" data-obra="' + obra.id + '">' + U.esc(obra.titulo) + '</button></h3>' +
        '<p class="card__processo"><i class="fa-solid fa-wand-magic-sparkles"></i> ' + U.esc(obra.processo || 'Processo, referências e bastidores compartilhados pela artista.') + '</p>' +
        (ehAudio ? App.player.inlineHTML(obra.id, "card") : "") +
        '<div class="card__pe">' +
          artistaChip(art) +
          '<div class="card__interacoes"><button class="salvar ' + (favorita ? "is-on" : "") + '" data-act="favoritar" data-obra="' + obra.id + '" aria-pressed="' + favorita + '" aria-label="Salvar nos favoritos"><i class="' + (favorita ? "fa-solid" : "fa-regular") + ' fa-bookmark"></i></button>' +
          '<button class="curtir ' + (curtido ? "is-on" : "") + '" data-act="curtir" data-obra="' + obra.id + '" aria-pressed="' + curtido + '" aria-label="Curtir">' +
            '<i class="' + (curtido ? "fa-solid" : "fa-regular") + ' fa-heart"></i><span data-like-count="' + obra.id + '">' + U.fmtNum(likes) + '</span>' +
          '</button><button class="comentario-atalho" data-act="abrir-obra" data-obra="' + obra.id + '" aria-label="Ver comentários"><i class="fa-regular fa-comment"></i>' + (obra.comentarios || []).length + '</button></div>' +
        '</div>' +
      '</div>' +
    '</article>';
  }

  function muralHTML(lista) {
    if (!lista.length) {
      return '<div class="vazio">' +
        '<i class="fa-regular fa-compass"></i>' +
        '<p><strong>Nada por aqui com esse filtro.</strong></p>' +
        '<p>Tente outra categoria ou limpe a busca.</p>' +
        '<button class="btn btn--ghost" data-act="limpar-filtros">Limpar filtros</button>' +
      '</div>';
    }
    return '<div class="mural">' + lista.map(cardObra).join("") + '</div>';
  }

  /* ======================================================================= */
  /*  CASCA (sidebar / topbar / tabbar)                                       */
  /* ======================================================================= */
  function navItens() {
    var r = App.state.route.name;
    var eu = App.state.usuarioAtualId;
    return [
      { href: "#/explorar", ic: "fa-compass", txt: "Explorar", on: r === "explorar" || r === "obra" },
      { href: "#/mensagens", ic: "fa-paper-plane", txt: "Mensagens", on: r === "mensagens" },
      { href: "#/favoritos", ic: "fa-bookmark", txt: "Favoritos", on: r === "favoritos", mobileOculto: true },
      { href: "#/artista/" + eu, ic: "fa-user", txt: "Meu perfil", on: r === "artista" && App.state.route.params.id === eu },
      { href: "#/painel", ic: "fa-chart-line", txt: "Painel", on: r === "painel" },
      { href: "#/publicar", ic: "fa-plus", txt: "Publicar", on: r === "publicar", destaque: true }
    ];
  }

  function sidebarHTML() {
    var itens = navItens().map(function (i) {
      return '<a class="side__item ' + (i.on ? "is-on" : "") + (i.destaque ? " side__item--cta" : "") + '" href="' + i.href + '" data-link>' +
        '<i class="fa-solid ' + i.ic + '"></i><span>' + i.txt + '</span></a>';
    }).join("");
    var temaIc = App.state.tema === "escuro" ? "fa-moon" : "fa-sun";
    var temaTxt = App.state.tema === "escuro" ? "Escuro" : "Claro";
    return '<aside class="side">' +
      '<a class="side__marca" href="#/explorar" data-link aria-label="ArtLivre — início">' +
        '<span class="side__logo">A<span>rt</span>L<span>ivre</span></span>' +
      '</a>' +
      '<nav class="side__nav">' + itens + '</nav>' +
      '<button class="side__tema" data-act="tema-toggle"><i class="fa-solid ' + temaIc + '"></i><span>' + temaTxt + '</span></button>' +
    '</aside>';
  }

  function tabbarHTML() {
    var itens = navItens().filter(function (i) { return !i.mobileOculto; });
    // No celular, a ação principal fica no centro e o perfil no canto direito.
    itens = [itens[0], itens[1], itens[4], itens[3], itens[2]];
    return '<nav class="tabbar">' + itens.map(function (i) {
      return '<a class="tabbar__item ' + (i.on ? "is-on" : "") + (i.destaque ? " tabbar__item--cta" : "") + '" href="' + i.href + '" data-link aria-label="' + i.txt + '">' +
        '<i class="fa-solid ' + i.ic + '"></i><span>' + i.txt + '</span></a>';
    }).join("") + '</nav>';
  }

  function topbarHTML(titulo, sub) {
    var naoLidas = App.query.unreadNotifications();
    return '<header class="topbar">' +
      '<div class="topbar__tit"><h1>' + U.esc(titulo) + '</h1>' + (sub ? '<p>' + U.esc(sub) + '</p>' : "") + '</div>' +
      '<div class="topbar__acoes"><button class="topbar__notif" data-act="notificacoes" aria-label="Notificações"><i class="fa-regular fa-bell"></i>' + (naoLidas ? '<b>' + naoLidas + '</b>' : '') + '</button><a class="topbar__eu" href="#/artista/' + App.state.usuarioAtualId + '" data-link>' +
        '<img src="' + U.esc((App.query.artistById(App.state.usuarioAtualId) || {}).avatar) + '" alt="Meu perfil" width="34" height="34">' +
      '</a></div>' +
    '</header>';
  }

  /* ======================================================================= */
  /*  TELA · EXPLORAR                                                         */
  /* ======================================================================= */
  function telaExplorar() {
    var s = App.state;
    var abaFeed = s.feedAba || "para-voce";
    var obraSemana = App.state.artworks.slice().sort(function (a, b) { return App.query.likeCount(b) - App.query.likeCount(a); })[0];
    var artistaSemana = obraSemana && App.query.artistById(obraSemana.artistId);
    var destaques = App.state.artists.slice().sort(function (a, b) { return b.apoiadoresAtivos - a.apoiadoresAtivos; }).slice(0, 3);
    var chips = App.data.categorias.map(function (c) {
      return '<button class="chip ' + (s.categoria === c.id ? "is-on" : "") + '" data-act="cat" data-cat="' + c.id + '">' +
        '<i class="fa-solid ' + c.icone + '"></i>' + U.esc(c.rotulo) + '</button>';
    }).join("");

    return sidebarHTML() +
      '<main class="tela tela--explorar">' +
        topbarHTML("Explorar", "Vitrine de artistas independentes e apoio recorrente") +
        '<section class="editorial">' +
          '<div class="editorial__foto" style="background-image:url(' + U.esc(obraSemana ? obraSemana.thumb : "") + ')"></div>' +
          '<div class="editorial__texto"><p class="hero__olho">Obra em destaque · semana</p><h2>' + U.esc(obraSemana ? obraSemana.titulo : "") + '</h2><p>' + U.esc(obraSemana ? obraSemana.descricao : "") + '</p><div class="editorial__rodape">' + artistaChip(artistaSemana) + '<button class="btn btn--principal" data-act="abrir-obra" data-obra="' + (obraSemana ? obraSemana.id : "") + '">Ver obra <i class="fa-solid fa-arrow-right"></i></button></div></div>' +
        '</section>' +
        '<section class="hero hero--compact">' +
          '<div class="hero__tx">' +
            '<p class="hero__olho">CultTech · Creator Economy</p>' +
            '<h2>Banque o trabalho de quem faz arte fora do circuito.</h2>' +
            '<p class="hero__lead">Portfólio visual e sonoro em um lugar só, com assinatura mensal que paga o mês do artista — não o algoritmo.</p>' +
          '</div>' +
          '<div class="hero__num">' +
            '<div><strong>' + App.state.artists.length + '</strong><span>artistas</span></div>' +
            '<div><strong>' + App.state.artworks.length + '</strong><span>obras</span></div>' +
            '<div><strong>' + U.fmtNum(App.state.artists.reduce(function (t, a) { return t + a.apoiadoresAtivos; }, 0)) + '</strong><span>apoiadores</span></div>' +
          '</div>' +
        '</section>' +
        '<section class="em-destaque"><div class="secao__cab"><div><p class="olho">Para descobrir</p><h2>Artistas em destaque</h2></div><span>Escolhidos pela comunidade</span></div><div class="artistas-destaque">' + destaques.map(function (art) {
          var seguindo = App.query.isFollowing(art.id);
          return '<article class="artista-destaque"><a href="#/artista/' + art.id + '" data-link><img src="' + U.esc(art.avatar) + '" alt=""><div><h3>' + U.esc(art.nome) + '</h3><p>' + U.esc(art.bio) + '</p></div></a><button class="seguir ' + (seguindo ? 'is-on' : '') + '" data-act="seguir" data-artista="' + art.id + '"><i class="fa-solid ' + (seguindo ? 'fa-check' : 'fa-plus') + '"></i> ' + (seguindo ? 'Seguindo' : 'Seguir') + '</button></article>';
        }).join('') + '</div></section>' +
        '<div class="filtros">' +
          '<div class="filtros__busca">' +
            '<i class="fa-solid fa-magnifying-glass"></i>' +
            '<input type="search" id="busca" placeholder="Buscar obra, artista ou tag…" value="' + U.esc(s.busca) + '" aria-label="Buscar">' +
          '</div>' +
          '<label class="filtros__ordem"><span>Ordenar</span>' +
            '<select id="ordenar" aria-label="Ordenar por">' +
              '<option value="recentes"' + (s.ordenacao === "recentes" ? " selected" : "") + '>Mais recentes</option>' +
              '<option value="curtidas"' + (s.ordenacao === "curtidas" ? " selected" : "") + '>Mais curtidas</option>' +
              '<option value="apoiadores"' + (s.ordenacao === "apoiadores" ? " selected" : "") + '>Mais apoiadas</option>' +
              '<option value="comentadas"' + (s.ordenacao === "comentadas" ? " selected" : "") + '>Mais comentadas</option>' +
            '</select>' +
          '</label>' +
        '</div>' +
        '<div class="chips" role="tablist" aria-label="Categorias">' + chips + '</div>' +
        '<div class="feed-tabs" role="tablist"><button class="feed-tabs__item ' + (abaFeed === 'para-voce' ? 'is-on' : '') + '" data-act="feed-aba" data-aba="para-voce"><i class="fa-solid fa-sparkles"></i> Para você</button><button class="feed-tabs__item ' + (abaFeed === 'seguindo' ? 'is-on' : '') + '" data-act="feed-aba" data-aba="seguindo"><i class="fa-solid fa-user-group"></i> Seguindo</button></div>' +
        '<div id="mural-slot">' + muralHTML(abaFeed === 'seguindo' ? App.query.feedSeguindo() : App.query.feed()) + '</div>' +
      '</main>';
  }

  /* Atualiza só o mural (usado por busca / categoria / ordenação). */
  App.refreshGallery = function () {
    var slot = document.getElementById("mural-slot");
    if (slot) slot.innerHTML = muralHTML(App.state.feedAba === 'seguindo' ? App.query.feedSeguindo() : App.query.feed());
    document.querySelectorAll(".chip[data-cat]").forEach(function (b) {
      b.classList.toggle("is-on", b.getAttribute("data-cat") === App.state.categoria);
    });
  };

  function telaFavoritos() {
    var obras = App.query.favoriteArtworks();
    return sidebarHTML() +
      '<main class="tela tela--favoritos">' +
        topbarHTML("Meus favoritos", "Obras que você salvou para revisitar") +
        '<section class="favoritos__intro"><i class="fa-solid fa-bookmark"></i><div><p class="olho">Sua curadoria</p><h2>' + obras.length + (obras.length === 1 ? ' obra salva' : ' obras salvas') + '</h2><p>Guarde referências, processos e artistas que você quer acompanhar.</p></div><a class="btn btn--ghost" href="#/explorar" data-link>Explorar obras</a></section>' +
        muralHTML(obras) +
      '</main>';
  }

  function telaMensagens() {
    var contatos = App.state.artists.filter(function (art) { return art.id !== App.state.usuarioAtualId; }).slice(0, 5);
    var ativo = App.state.conversaAtiva;
    if (!App.query.artistById(ativo)) ativo = contatos[0] && contatos[0].id;
    var mensagens = App.state.mensagens[ativo] || [];
    var contato = App.query.artistById(ativo);
    return sidebarHTML() +
      '<main class="tela tela--mensagens">' +
        topbarHTML("Mensagens", "Conversas diretas com a sua comunidade") +
        '<section class="mensagens"><aside class="mensagens__lista"><div class="mensagens__lista-cab"><h2>Conversas</h2><span>' + contatos.length + '</span></div>' + contatos.map(function (art) {
          var listaMensagens = App.state.mensagens[art.id] || [];
          var ultima = listaMensagens[listaMensagens.length - 1] || {};
          return '<button class="conversa ' + (art.id === ativo ? 'is-on' : '') + '" data-act="abrir-conversa" data-artista="' + art.id + '"><img src="' + U.esc(art.avatar) + '" alt=""><span><strong>' + U.esc(art.nome) + '</strong><small>' + U.esc(ultima.texto || 'Envie uma mensagem') + '</small></span></button>';
        }).join('') + '</aside><section class="mensagens__chat">' +
          '<header class="chat__cab">' + (contato ? '<img src="' + U.esc(contato.avatar) + '" alt=""><div><h2>' + U.esc(contato.nome) + '</h2><p><i class="fa-solid fa-circle"></i> disponível para conversar</p></div>' : '') + '</header>' +
          '<div class="chat__avis"><i class="fa-solid fa-lock"></i> Conversas salvas somente neste navegador.</div>' +
          '<div class="chat__mensagens">' + mensagens.map(function (m) { return '<div class="msg ' + (m.de === 'eu' ? 'msg--eu' : '') + '"><p>' + U.esc(m.texto) + '</p><small>' + U.esc(m.hora) + '</small></div>'; }).join('') + '</div>' +
          '<form class="chat__form" data-act="mensagem-enviar" data-artista="' + U.esc(ativo || '') + '"><input name="mensagem" maxlength="400" required placeholder="Escreva uma mensagem…" aria-label="Mensagem"><button class="btn btn--principal" type="submit" aria-label="Enviar"><i class="fa-solid fa-paper-plane"></i><span>Enviar</span></button></form>' +
        '</section></section>' +
      '</main>';
  }

  /* ======================================================================= */
  /*  TELA · PERFIL DO ARTISTA                                                */
  /* ======================================================================= */
  function telaArtista() {
    var art = App.query.artistById(App.state.route.params.id);
    if (!art) return sidebarHTML() + '<main class="tela"><div class="vazio"><i class="fa-regular fa-face-frown"></i><p><strong>Artista não encontrado.</strong></p><a class="btn btn--ghost" href="#/explorar" data-link>Voltar</a></div></main>';

    var aba = App.state.route.query.aba || "projetos";
    var obras = App.query.artworksByArtist(art.id);
    var apoia = App.query.apoiaArtista(art.id);
    var seguindo = App.query.isFollowing(art.id);
    var redes = Object.keys(art.redes || {}).map(function (k) {
      var ic = { instagram: "fa-instagram", twitter: "fa-x-twitter", behance: "fa-behance", spotify: "fa-spotify" }[k] || "fa-link";
      return '<a class="rede" href="' + U.esc(art.redes[k]) + '" target="_blank" rel="noopener" aria-label="' + k + '"><i class="fa-brands ' + ic + '"></i></a>';
    }).join("");

    var abas = [["projetos", "Projetos"], ["colecoes", "Coleções"], ["curtidos", "Curtidos"], ["sobre", "Sobre"], ["niveis", "Níveis de apoio"]].map(function (a) {
      return '<a class="perfil__aba ' + (aba === a[0] ? "is-on" : "") + '" href="#/artista/' + art.id + '?aba=' + a[0] + '" data-link role="tab" aria-selected="' + (aba === a[0]) + '">' + a[1] + '</a>';
    }).join("");

    var conteudo;
    if (aba === "curtidos") {
      var curtidas = App.query.likedArtworks();
      conteudo = curtidas.length
        ? '<div class="perfil__seletor"><p class="olho">Sua curadoria</p><h2>Obras que você curtiu</h2></div><div class="mural mural--perfil">' + curtidas.map(cardObra).join("") + '</div>'
        : '<div class="vazio"><i class="fa-regular fa-heart"></i><p><strong>Você ainda não curtiu nenhuma obra.</strong></p><p>Explore o mural e curta os trabalhos que falarem com você.</p><a class="btn btn--ghost" href="#/explorar" data-link>Explorar obras</a></div>';
    } else if (aba === "colecoes") {
      var temas = ["Processos & estudos", "Obras para escutar", "Arquivo recente"];
      conteudo = '<div class="colecoes">' + temas.map(function (tema, i) {
        var grupo = obras.filter(function (o) { return i === 0 ? /estudo|processo|rascunho|bastidor/i.test((o.tags || []).join(' ')) : i === 1 ? o.tipoMidia === 'audio' : true; }).slice(0, 3);
        if (!grupo.length) grupo = obras.slice(0, 3);
        return '<article class="colecao"><div class="colecao__capas">' + grupo.map(function (o) { return '<img src="' + U.esc(o.thumb) + '" alt="">'; }).join('') + '</div><div><p class="olho">Série temática</p><h3>' + tema + '</h3><p>' + grupo.length + ' obras reunidas para acompanhar um mesmo gesto criativo.</p><button data-act="colecao-ver" data-artista="' + art.id + '" data-colecao="' + i + '">Ver obras <i class="fa-solid fa-arrow-right"></i></button></div></article>';
      }).join('') + '</div>';
    } else if (aba === "sobre") {
      conteudo =
        '<div class="sobre">' +
          '<p class="sobre__story">' + U.esc(art.sobre) + '</p>' +
          '<div class="sobre__meta">' +
            '<h3>Meta da comunidade</h3>' + meterHTML(art.id, { descricao: true }) +
          '</div>' +
          '<h3>Trajetória</h3>' +
          '<ol class="trajet">' + art.trajetoria.map(function (t) {
            return '<li><span class="trajet__ano">' + U.esc(t.ano) + '</span><span class="trajet__fato">' + U.esc(t.fato) + '</span></li>';
          }).join("") + '</ol>' +
        '</div>';
    } else if (aba === "niveis") {
      conteudo =
        '<div class="niveis">' + art.tiers.map(function (t) {
          return '<article class="nivel">' +
            '<span class="nivel__faixa" style="background:' + t.cor + '"></span>' +
            '<header><h3>' + U.esc(t.nome) + '</h3><p class="nivel__preco">' + U.fmtBRL(t.preco) + '<span>/mês</span></p></header>' +
            '<ul>' + t.beneficios.map(function (b) { return '<li><i class="fa-solid fa-check"></i>' + U.esc(b) + '</li>'; }).join("") + '</ul>' +
            '<button class="btn btn--principal btn--bloco" data-act="apoiar" data-artista="' + art.id + '">Apoiar neste nível</button>' +
          '</article>';
        }).join("") + '</div>';
    } else {
      conteudo = obras.length
        ? '<div class="mural mural--perfil">' + obras.map(cardObra).join("") + '</div>'
        : '<div class="vazio"><i class="fa-regular fa-folder-open"></i><p><strong>Sem obras publicadas ainda.</strong></p></div>';
    }
    var atividade = obras.slice(0, 2).map(function (o) {
      return '<li><i class="fa-solid fa-sparkles"></i><span><strong>Nova obra:</strong> ' + U.esc(o.titulo) + '</span><small>' + U.fmtDataRel(o.dataCriacao) + '</small></li>';
    }).join('');
    var proximas = art.categoria === 'musica' ? ['Prévia da faixa do mês', 'Live de processo no estúdio'] : ['Bastidores do próximo projeto', 'Nova publicação para a comunidade'];

    return sidebarHTML() +
      '<main class="tela tela--perfil">' +
        '<div class="capa" style="background-image:url(' + U.esc(art.banner) + ')"><span class="capa__fade"></span>' +
          (art.id === App.state.usuarioAtualId ? '<button class="perfil__config" data-act="abrir-configuracoes" aria-label="Abrir configurações"><i class="fa-solid fa-gear"></i><span>Configurações</span></button>' : '') +
        '</div>' +
        '<header class="perfil__cab">' +
          '<img class="perfil__avatar" src="' + U.esc(art.avatar) + '" alt="' + U.esc(art.nome) + '" width="120" height="120">' +
          '<div class="perfil__id">' +
            '<h1>' + U.esc(art.nome) + '</h1>' +
            (art.id === App.state.usuarioAtualId ? '<a class="perfil__favoritos" href="#/favoritos" data-link><i class="fa-solid fa-bookmark"></i> Ver favoritos</a>' : '') +
            '<p class="perfil__local"><i class="fa-solid fa-location-dot"></i> ' + U.esc(art.cidade) + ' · ' + U.esc(rotuloCat(art.categoria)) + '</p>' +
            '<p class="perfil__bio">' + U.esc(art.bio) + '</p>' +
            '<div class="perfil__tags">' + art.especialidades.map(function (e) { return '<span class="tag">' + U.esc(e) + '</span>'; }).join("") + '</div>' +
            '<div class="perfil__redes">' + redes + '</div>' +
          '</div>' +
          '<div class="perfil__acao">' +
            (art.id === App.state.usuarioAtualId ? '<a class="btn btn--ghost btn--favoritos" href="#/favoritos" data-link><i class="fa-solid fa-bookmark"></i> Meus favoritos</a>' : '') +
            (art.id !== App.state.usuarioAtualId ? '<button class="seguir seguir--perfil ' + (seguindo ? 'is-on' : '') + '" data-act="seguir" data-artista="' + art.id + '"><i class="fa-solid ' + (seguindo ? 'fa-check' : 'fa-plus') + '"></i> ' + (seguindo ? 'Seguindo' : 'Seguir artista') + '</button>' : '') +
            '<button class="btn btn--principal btn--grande" data-act="apoiar" data-artista="' + art.id + '">' +
              '<i class="fa-solid fa-hand-holding-heart"></i> ' + (apoia ? "Você apoia" : "Apoiar artista") +
              '<span class="btn__bolha"><i class="fa-solid fa-arrow-right"></i></span>' +
            '</button>' +
            '<div class="perfil__stats">' +
              '<div><strong>' + U.fmtNum(App.query.apoiadoresAtivos(art.id)) + '</strong><span>apoiadores</span></div>' +
              '<div><strong>' + U.fmtNum(art.visualizacoesPerfil) + '</strong><span>visitas</span></div>' +
              '<div><strong>' + U.fmtNum(App.query.curtidasTotaisArtista(art.id)) + '</strong><span>curtidas</span></div>' +
            '</div>' +
          '</div>' +
        '</header>' +
        '<div class="perfil__meta-mini">' + meterHTML(art.id, {}) + '</div>' +
        '<section class="perfil__ritmo"><div class="atividade"><p class="olho">Atividade recente</p><ul>' + atividade + '</ul></div><div class="agenda"><p class="olho">Próximos passos</p><ul><li><span>Em breve</span>' + proximas[0] + '</li><li><span>Este mês</span>' + proximas[1] + '</li></ul></div></section>' +
        '<nav class="perfil__abas" role="tablist">' + abas + '</nav>' +
        '<section class="perfil__conteudo">' + conteudo + '</section>' +
      '</main>';
  }

  /* ======================================================================= */
  /*  TELA · PAINEL DO CRIADOR                                                */
  /* ======================================================================= */
  function chartSVG(serie) {
    var W = 720, H = 260, pl = 46, pr = 14, pt = 18, pb = 30;
    var n = serie.meses.length;
    if (!n) return "";
    var iw = W - pl - pr, ih = H - pt - pb;
    var maxA = Math.max.apply(null, serie.arrecadacao) * 1.1;
    var maxV = Math.max.apply(null, serie.visitas) * 1.15;
    var x = function (i) { return pl + (n === 1 ? iw / 2 : (iw * i) / (n - 1)); };
    var yA = function (v) { return pt + ih - (v / maxA) * ih; };
    var bw = iw / n * 0.44;

    var grid = "";
    for (var g = 0; g <= 3; g++) {
      var gy = pt + (ih * g) / 3;
      grid += '<line x1="' + pl + '" y1="' + gy + '" x2="' + (W - pr) + '" y2="' + gy + '" class="cx__grid"/>';
      grid += '<text x="' + (pl - 8) + '" y="' + (gy + 4) + '" class="cx__ylabel">' + U.fmtNum(Math.round(maxA - (maxA / 3) * g)) + '</text>';
    }
    var barras = serie.visitas.map(function (v, i) {
      var h = (v / maxV) * ih, bx = x(i) - bw / 2, by = pt + ih - h;
      return '<rect x="' + bx + '" y="' + by + '" width="' + bw + '" height="' + h + '" rx="4" class="cx__bar" fill="url(#cxBarra)"/>';
    }).join("");
    var linha = serie.arrecadacao.map(function (v, i) { return (i ? "L" : "M") + x(i) + " " + yA(v); }).join(" ");
    var area = "M" + x(0) + " " + (pt + ih) + " " + serie.arrecadacao.map(function (v, i) { return "L" + x(i) + " " + yA(v); }).join(" ") + " L" + x(n - 1) + " " + (pt + ih) + " Z";
    var pontos = serie.arrecadacao.map(function (v, i) { return '<circle cx="' + x(i) + '" cy="' + yA(v) + '" r="4" class="cx__dot"/>'; }).join("");
    var xlab = serie.meses.map(function (m, i) { return '<text x="' + x(i) + '" y="' + (H - 8) + '" class="cx__xlabel">' + U.esc(m) + '</text>'; }).join("");

    // defs: degradê da marca na linha/área + brilho suave sob a curva
    var defs =
      '<defs>' +
        // as cores dos stops vêm do CSS (.cx__g-*), o atributo é só fallback
        '<linearGradient id="cxLinha" x1="0" y1="0" x2="1" y2="0">' +
          '<stop class="cx__g-a3" offset="0%" stop-color="#3ee0bf"/>' +
          '<stop class="cx__g-a1" offset="55%" stop-color="#4fdcff"/>' +
          '<stop class="cx__g-a2" offset="100%" stop-color="#a97cff"/>' +
        '</linearGradient>' +
        '<linearGradient id="cxArea" x1="0" y1="0" x2="0" y2="1">' +
          '<stop class="cx__g-a1" offset="0%" stop-color="#4fdcff" stop-opacity=".34"/>' +
          '<stop class="cx__g-a1" offset="100%" stop-color="#4fdcff" stop-opacity="0"/>' +
        '</linearGradient>' +
        '<linearGradient id="cxBarra" x1="0" y1="0" x2="0" y2="1">' +
          '<stop class="cx__g-a2" offset="0%" stop-color="#a97cff" stop-opacity=".45"/>' +
          '<stop class="cx__g-a2" offset="100%" stop-color="#a97cff" stop-opacity=".08"/>' +
        '</linearGradient>' +
        '<filter id="cxBrilho" x="-20%" y="-40%" width="140%" height="200%">' +
          '<feGaussianBlur stdDeviation="4" result="b"/>' +
          '<feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>' +
        '</filter>' +
      '</defs>';

    return '<svg class="cx" viewBox="0 0 ' + W + ' ' + H + '" role="img" aria-label="Evolução de arrecadação e visitas nos últimos 6 meses">' +
      defs + grid + barras +
      '<path d="' + area + '" class="cx__area" fill="url(#cxArea)"/>' +
      '<path d="' + linha + '" class="cx__line" stroke="url(#cxLinha)" filter="url(#cxBrilho)"/>' +
      pontos + xlab +
    '</svg>';
  }

  function telaPainel() {
    var art = App.query.artistById(App.state.usuarioAtualId);
    var serie = App.query.serie(art.id);
    var apoiadores = App.query.supportersByArtist(art.id);
    var arreMes = App.query.arrecadadoMes(art.id);
    var kpis = [
      { ic: "fa-sack-dollar", val: U.fmtBRL(arreMes), lab: "Arrecadado no mês", delta: "+" + Math.round(((serie.arrecadacao[5] - serie.arrecadacao[4]) / serie.arrecadacao[4]) * 100) + "%" },
      { ic: "fa-users", val: U.fmtNum(App.query.apoiadoresAtivos(art.id)), lab: "Apoiadores ativos", delta: "+" + serie.novosApoiadores[5] + " novos" },
      { ic: "fa-eye", val: U.fmtNum(serie.visitas[5]), lab: "Visitas ao perfil", delta: "+" + Math.round(((serie.visitas[5] - serie.visitas[4]) / serie.visitas[4]) * 100) + "%" },
      { ic: "fa-heart", val: U.fmtNum(App.query.curtidasTotaisArtista(art.id)), lab: "Curtidas totais", delta: U.fmtNum(App.query.artworksByArtist(art.id).length) + " obras" }
    ];

    return sidebarHTML() +
      '<main class="tela tela--painel">' +
        topbarHTML("Painel do criador", "Visão de " + art.nome) +
        '<section class="kpis">' + kpis.map(function (k) {
          return '<article class="kpi">' +
            '<span class="kpi__ic"><i class="fa-solid ' + k.ic + '"></i></span>' +
            '<strong class="kpi__val">' + k.val + '</strong>' +
            '<span class="kpi__lab">' + k.lab + '</span>' +
            '<span class="kpi__delta">' + k.delta + '</span>' +
          '</article>';
        }).join("") + '</section>' +

        '<section class="painel__grid">' +
          '<article class="painel__box painel__box--chart">' +
            '<header class="painel__boxcab"><h2>Arrecadação e visitas · 6 meses</h2>' +
              '<div class="cx__leg"><span class="cx__leg--line">Arrecadação (R$)</span><span class="cx__leg--bar">Visitas</span></div>' +
            '</header>' +
            chartSVG(serie) +
          '</article>' +
          '<article class="painel__box painel__box--meta">' +
            '<header class="painel__boxcab"><h2>Meta mensal</h2></header>' +
            meterHTML(art.id, { descricao: true }) +
            '<a class="btn btn--ghost btn--bloco" href="#/artista/' + art.id + '?aba=niveis" data-link>Ver meus níveis</a>' +
          '</article>' +
        '</section>' +

        '<section class="painel__box">' +
          '<header class="painel__boxcab"><h2>Apoiadores recentes</h2><span class="painel__cont">' + apoiadores.length + '</span></header>' +
          '<ul class="apoiadores">' + apoiadores.slice(0, 8).map(function (sp) {
            var tier = App.query.tierById(sp.tierId);
            return '<li>' +
              '<img src="' + U.esc(sp.avatar) + '" alt="" width="36" height="36" loading="lazy">' +
              '<span class="apoiadores__nome">' + U.esc(sp.nome) + '</span>' +
              '<span class="apoiadores__tipo">' + (sp.tipo === "mensal" ? (tier ? U.esc(tier.nome) : "Mensal") : "Pontual") + '</span>' +
              '<span class="apoiadores__valor">' + U.fmtBRL(sp.valor) + (sp.tipo === "mensal" ? "/mês" : "") + '</span>' +
              '<span class="apoiadores__data">' + U.fmtDataRel(sp.data) + '</span>' +
            '</li>';
          }).join("") + '</ul>' +
        '</section>' +

        '<section class="painel__box painel__box--cta">' +
          '<div><h2>Publicar uma obra nova</h2><p>Suba imagem ou áudio e ela entra no mural na hora.</p></div>' +
          '<a class="btn btn--principal" href="#/publicar" data-link><i class="fa-solid fa-plus"></i> Nova obra</a>' +
        '</section>' +
      '</main>';
  }

  /* ======================================================================= */
  /*  TELA · PUBLICAR (upload)                                                */
  /* ======================================================================= */
  var rascunho = { tipoMidia: "imagem", dataUrl: "", nomeArquivo: "" };

  function telaPublicar() {
    var cats = App.data.categorias.filter(function (c) { return c.id !== "todas"; });
    return sidebarHTML() +
      '<main class="tela tela--publicar">' +
        topbarHTML("Publicar", "Nova obra no seu portfólio") +
        '<form id="form-obra" class="fpub" novalidate>' +
          '<div class="fpub__col">' +
            '<div class="campo">' +
              '<label for="f-titulo">Título da obra</label>' +
              '<input id="f-titulo" name="titulo" type="text" maxlength="80" required placeholder="Ex.: Estudo de cor nº 3">' +
            '</div>' +
            '<div class="campo">' +
              '<label for="f-desc">Descrição</label>' +
              '<textarea id="f-desc" name="descricao" rows="4" maxlength="600" placeholder="Conte o processo, o contexto, o que os apoiadores recebem…"></textarea>' +
            '</div>' +
            '<div class="campo campo--dupla">' +
              '<div>' +
                '<label for="f-cat">Categoria</label>' +
                '<select id="f-cat" name="categoria">' + cats.map(function (c) { return '<option value="' + c.id + '">' + U.esc(c.rotulo) + '</option>'; }).join("") + '</select>' +
              '</div>' +
              '<div>' +
                '<label for="f-tags">Tags <small>(separadas por vírgula)</small></label>' +
                '<input id="f-tags" name="tags" type="text" placeholder="risografia, folk, processo">' +
              '</div>' +
            '</div>' +
            '<div class="campo">' +
              '<span class="campo__rot">Tipo de mídia</span>' +
              '<div class="segmento" role="radiogroup" aria-label="Tipo de mídia">' +
                '<button type="button" class="segmento__op is-on" data-act="pub-tipo" data-tipo="imagem"><i class="fa-solid fa-image"></i> Imagem</button>' +
                '<button type="button" class="segmento__op" data-act="pub-tipo" data-tipo="audio"><i class="fa-solid fa-music"></i> Áudio</button>' +
              '</div>' +
            '</div>' +
          '</div>' +

          '<div class="fpub__col">' +
            '<div class="dropzone" id="dropzone" tabindex="0" role="button" aria-label="Enviar arquivo de mídia">' +
              '<div class="dropzone__vazio" data-dz-vazio>' +
                '<i class="fa-solid fa-cloud-arrow-up"></i>' +
                '<p><strong>Arraste o arquivo aqui</strong></p>' +
                '<p>ou <span class="link">escolha do computador</span></p>' +
                '<p class="dropzone__hint" data-dz-hint>PNG, JPG ou WEBP até ~4 MB</p>' +
              '</div>' +
              '<div class="dropzone__preview" data-dz-preview hidden></div>' +
              '<input type="file" id="f-arquivo" accept="image/*" hidden>' +
            '</div>' +
            '<div class="fpub__acoes">' +
              '<button type="button" class="btn btn--ghost" data-act="pub-limpar">Limpar</button>' +
              '<button type="submit" class="btn btn--principal">Publicar obra <span class="btn__bolha"><i class="fa-solid fa-arrow-right"></i></span></button>' +
            '</div>' +
          '</div>' +
        '</form>' +
      '</main>';
  }

  /* ======================================================================= */
  /*  MODAIS                                                                  */
  /* ======================================================================= */
  function modalObraHTML(obra) {
    var art = App.query.artistById(obra.artistId);
    var ehAudio = obra.tipoMidia === "audio";
    var curtido = App.query.isLiked(obra.id);
    var likes = App.query.likeCount(obra);
    var favorita = App.query.isFavorite(obra.id);
    return '<div class="obra">' +
      '<div class="obra__midia">' +
        (ehAudio
          ? '<img src="' + U.esc(obra.thumb) + '" alt="Capa de ' + U.esc(obra.titulo) + '">' + App.player.inlineHTML(obra.id, "modal")
          : '<img src="' + U.esc(obra.urlMidia) + '" alt="' + U.esc(obra.titulo) + '">') +
      '</div>' +
      '<div class="obra__lado">' +
        '<span class="tag tag--cat"><i class="fa-solid ' + iconeTipo(obra.categoria) + '"></i>' + U.esc(rotuloCat(obra.categoria)) + '</span>' +
        '<h2 class="obra__titulo">' + U.esc(obra.titulo) + '</h2>' +
        '<div class="obra__autor">' + artistaChip(art, art ? art.cidade : "") + '</div>' +
        '<p class="obra__desc">' + U.esc(obra.descricao) + '</p>' +
        '<aside class="processo"><p class="olho">Por trás da obra</p><p>' + U.esc(obra.processo || ('Esta publicação nasceu de anotações, testes e conversas que ' + (art ? art.nome : 'a artista') + ' decidiu dividir com a comunidade.')) + '</p></aside>' +
        '<div class="obra__tags">' + (obra.tags || []).map(function (t) { return '<span class="tag">#' + U.esc(t) + '</span>'; }).join("") + '</div>' +
        '<div class="obra__acoes">' +
          '<button class="curtir curtir--grande ' + (curtido ? "is-on" : "") + '" data-act="curtir" data-obra="' + obra.id + '" aria-pressed="' + curtido + '">' +
            '<i class="' + (curtido ? "fa-solid" : "fa-regular") + ' fa-heart"></i><span data-like-count="' + obra.id + '">' + U.fmtNum(likes) + '</span> curtidas' +
          '</button>' +
          '<button class="salvar salvar--grande ' + (favorita ? "is-on" : "") + '" data-act="favoritar" data-obra="' + obra.id + '" aria-pressed="' + favorita + '"><i class="' + (favorita ? "fa-solid" : "fa-regular") + ' fa-bookmark"></i> ' + (favorita ? 'Salva' : 'Salvar') + '</button>' +
          '<button class="salvar salvar--grande" data-act="compartilhar" data-obra="' + obra.id + '"><i class="fa-solid fa-arrow-up-from-bracket"></i> Compartilhar</button>' +
          '<span class="obra__apoios"><i class="fa-solid fa-hand-holding-heart"></i> ' + U.fmtNum(obra.apoiadores || 0) + ' apoiadores</span>' +
        '</div>' +
        '<button class="btn btn--principal btn--bloco" data-act="apoiar" data-artista="' + obra.artistId + '">' +
          '<i class="fa-solid fa-hand-holding-heart"></i> Apoiar este artista<span class="btn__bolha"><i class="fa-solid fa-arrow-right"></i></span>' +
        '</button>' +
        '<div class="coment">' +
          '<h3>' + (obra.comentarios || []).length + ' comentários</h3>' +
          '<ul class="coment__lista">' + (obra.comentarios || []).map(function (c) {
            return '<li><img src="' + U.esc(c.avatar) + '" alt="" width="30" height="30" loading="lazy">' +
              '<div><strong>' + U.esc(c.autor) + '</strong> <small>' + U.fmtDataRel(c.data) + '</small>' +
              '<p>' + U.esc(c.texto) + '</p></div></li>';
          }).join("") + '</ul>' +
          '<form class="coment__form" data-act="coment-enviar" data-obra="' + obra.id + '">' +
            '<input type="text" name="txt" placeholder="Escreva um comentário…" aria-label="Comentário" maxlength="240" required>' +
            '<button class="btn btn--ghost" type="submit">Enviar</button>' +
          '</form>' +
        '</div>' +
      '</div>' +
    '</div>';
  }

  function modalHTML() {
    var m = App.state.modal;
    if (!m) return "";
    var interno, classe = "";
    if (m.tipo === "obra") {
      var obra = App.query.artworkById(m.id);
      if (!obra) return "";
      interno = modalObraHTML(obra);
      classe = "modal--obra";
    } else if (m.tipo === "apoio") {
      interno = App.checkout.html();
      classe = "modal--apoio";
    } else if (m.tipo === "notificacoes") {
      interno = '<section class="notificacoes"><div class="notificacoes__cab"><div><p class="olho">Sua comunidade</p><h2>Notificações</h2></div><button data-act="notificacoes-lidas">Marcar todas como lidas</button></div><ul>' + App.state.notificacoes.map(function (n) {
        var ic = { apoio: 'fa-hand-holding-heart', curtida: 'fa-heart', comentario: 'fa-comment' }[n.tipo] || 'fa-bell';
        return '<li class="' + (!n.lida ? 'is-new' : '') + '"><i class="fa-solid ' + ic + '"></i><div><p>' + U.esc(n.texto) + '</p><small>' + U.esc(n.tempo) + '</small></div></li>';
      }).join('') + '</ul></section>';
      classe = "modal--notificacoes";
    } else if (m.tipo === "configuracoes") {
      interno = '<section class="configuracoes"><header class="configuracoes__cab"><p class="olho">Preferências</p><h2>Configurações</h2><p>Escolha a aparência que fica mais confortável para você.</p></header>' +
        '<div class="configuracoes__grupo"><h3>Modo de visualização</h3><div class="configuracoes__modos" role="radiogroup" aria-label="Modo de visualização">' +
          '<button class="configuracoes__modo ' + (App.state.tema === 'claro' ? 'is-on' : '') + '" data-act="tema-selecionar" data-tema="claro" role="radio" aria-checked="' + (App.state.tema === 'claro') + '"><i class="fa-solid fa-sun"></i><span><strong>Claro</strong><small>Fundo luminoso</small></span><i class="fa-solid fa-check"></i></button>' +
          '<button class="configuracoes__modo ' + (App.state.tema === 'escuro' ? 'is-on' : '') + '" data-act="tema-selecionar" data-tema="escuro" role="radio" aria-checked="' + (App.state.tema === 'escuro') + '"><i class="fa-solid fa-moon"></i><span><strong>Escuro</strong><small>Mais confortável à noite</small></span><i class="fa-solid fa-check"></i></button>' +
        '</div></div></section>';
      classe = "modal--configuracoes";
    } else return "";

    return '<div class="modal ' + classe + '" data-act="modal-overlay">' +
      '<div class="modal__caixa" role="dialog" aria-modal="true" tabindex="-1">' +
        '<button class="modal__x" data-act="fechar-modal" aria-label="Fechar"><i class="fa-solid fa-xmark"></i></button>' +
        '<div class="modal__conteudo">' + interno + '</div>' +
      '</div>' +
    '</div>';
  }

  App.refreshModal = function () {
    var alvo = document.querySelector(".modal__conteudo");
    if (!alvo || !App.state.modal) return;
    if (App.state.modal.tipo === "apoio") alvo.innerHTML = App.checkout.html();
    else if (App.state.modal.tipo === "obra") {
      var obra = App.query.artworkById(App.state.modal.id);
      if (obra) alvo.innerHTML = modalObraHTML(obra);
    } else if (App.state.modal.tipo === "notificacoes") {
      App.render();
    }
  };

  App.fecharModal = function () {
    App.state.modal = null;
    if (App.state.route.name === "obra") { history.replaceState(null, "", "#/explorar"); App.state.route = parseHash(); }
    App.render();
  };

  /* ======================================================================= */
  /*  TOAST                                                                   */
  /* ======================================================================= */
  var toastTimer = null;
  App.toast = function (msg, tipo) {
    var reg = document.getElementById("toast-slot");
    if (!reg) return;
    reg.innerHTML = '<div class="toast toast--' + (tipo || "ok") + '" role="status">' +
      '<i class="fa-solid ' + (tipo === "erro" ? "fa-triangle-exclamation" : "fa-circle-check") + '"></i>' + U.esc(msg) + '</div>';
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { reg.innerHTML = ""; }, 3200);
  };

  /* ======================================================================= */
  /*  PLAYER · refresh pontual (sem re-render geral)                          */
  /* ======================================================================= */
  App.refreshPlayer = function () {
    var slot = document.getElementById("player-slot");
    if (slot) slot.innerHTML = App.player.barraHTML();
    document.body.classList.toggle("tem-player", !!App.state.player.obraId);

    var p = App.state.player;
    // players inline (cards / modal / perfil)
    document.querySelectorAll("[data-aplayer]").forEach(function (el) {
      var id = el.getAttribute("data-aplayer");
      var ativo = p.obraId === id;
      var frac = ativo && p.duracao ? p.progresso / p.duracao : 0;
      el.classList.toggle("is-playing", ativo && p.tocando);
      var fill = el.querySelector("[data-aplayer-progress]"); if (fill) fill.style.width = (frac * 100).toFixed(1) + "%";
      var at = el.querySelector("[data-aplayer-atual]"); if (at) at.textContent = U.fmtDuracao(ativo ? p.progresso : 0);
      var ic = el.querySelector(".aplayer__toggle i");
      if (ic) ic.className = "fa-solid " + (ativo && p.tocando ? "fa-pause" : "fa-play");
    });
  };

  /* ======================================================================= */
  /*  RENDER PRINCIPAL                                                        */
  /* ======================================================================= */
  App.render = function () {
    aplicarTema();
    var tela;
    switch (App.state.route.name) {
      case "artista": tela = telaArtista(); break;
      case "favoritos": tela = telaFavoritos(); break;
      case "mensagens": tela = telaMensagens(); break;
      case "painel": tela = telaPainel(); break;
      case "publicar": tela = telaPublicar(); break;
      default: tela = telaExplorar();
    }
    raiz.innerHTML =
      '<div class="app ' + (App.state.modal ? "tem-modal" : "") + '">' +
        tela +
        tabbarHTML() +
      '</div>' +
      '<div id="player-slot">' + App.player.barraHTML() + '</div>' +
      '<div id="modal-slot">' + modalHTML() + '</div>' +
      '<div id="toast-slot" aria-live="polite"></div>';

    document.body.classList.toggle("tem-player", !!App.state.player.obraId);
    document.body.classList.toggle("trava-scroll", !!App.state.modal);

    ligarEventosPorRender();
    if (App.state.modal) {
      var caixa = document.querySelector(".modal__caixa");
      if (caixa) caixa.focus();
    }
  };

  /* ======================================================================= */
  /*  EVENTOS                                                                 */
  /* ======================================================================= */

  /* Listeners que dependem de nós recém-criados (inputs, form, dropzone). */
  function ligarEventosPorRender() {
    var busca = document.getElementById("busca");
    if (busca) {
      busca.addEventListener("input", U.debounce(function (e) {
        App.state.busca = e.target.value;
        App.refreshGallery();
      }, 180));
    }
    var ordenar = document.getElementById("ordenar");
    if (ordenar) ordenar.addEventListener("change", function (e) {
      App.state.ordenacao = e.target.value; App.refreshGallery();
    });

    var form = document.getElementById("form-obra");
    if (form) ligarUpload(form);
  }

  /* --- Upload / dropzone --- */
  function ligarUpload(form) {
    var dz = document.getElementById("dropzone");
    var input = document.getElementById("f-arquivo");
    var prev = dz.querySelector("[data-dz-preview]");
    var vazio = dz.querySelector("[data-dz-vazio]");

    function aceitar(file) {
      if (!file) return;
      var ehImg = /^image\//.test(file.type);
      var ehAudio = /^audio\//.test(file.type);
      if (rascunho.tipoMidia === "imagem" && !ehImg) { App.toast("Selecione um arquivo de imagem.", "erro"); return; }
      if (rascunho.tipoMidia === "audio" && !ehAudio) { App.toast("Selecione um arquivo de áudio.", "erro"); return; }
      rascunho.nomeArquivo = file.name;
      if (ehImg) {
        var fr = new FileReader();
        fr.onload = function () {
          rascunho.dataUrl = fr.result;
          prev.innerHTML = '<img src="' + rascunho.dataUrl + '" alt="Prévia da imagem"><button type="button" class="dropzone__trocar" data-act="pub-trocar">Trocar</button>';
          prev.hidden = false; vazio.hidden = true;
        };
        fr.readAsDataURL(file);
      } else {
        rascunho.dataUrl = "";
        var barras = "";
        for (var i = 0; i < 48; i++) barras += '<span style="height:' + (20 + Math.round(Math.random() * 70)) + '%"></span>';
        prev.innerHTML = '<div class="ondafake">' + barras + '</div><p class="dropzone__nome"><i class="fa-solid fa-music"></i> ' + U.esc(file.name) + '</p><button type="button" class="dropzone__trocar" data-act="pub-trocar">Trocar</button>';
        prev.hidden = false; vazio.hidden = true;
      }
    }

    dz.addEventListener("click", function (e) {
      if (e.target.closest("[data-act=pub-trocar]")) { input.value = ""; input.click(); return; }
      if (!prev.hidden) return;
      input.click();
    });
    dz.addEventListener("keydown", function (e) { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); input.click(); } });
    input.addEventListener("change", function () { aceitar(input.files[0]); });
    ["dragenter", "dragover"].forEach(function (ev) {
      dz.addEventListener(ev, function (e) { e.preventDefault(); dz.classList.add("is-drag"); });
    });
    ["dragleave", "drop"].forEach(function (ev) {
      dz.addEventListener(ev, function (e) { e.preventDefault(); dz.classList.remove("is-drag"); });
    });
    dz.addEventListener("drop", function (e) {
      var f = e.dataTransfer && e.dataTransfer.files[0]; aceitar(f);
    });

    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var fd = new FormData(form);
      var titulo = (fd.get("titulo") || "").trim();
      if (!titulo) { App.toast("Dê um título à obra.", "erro"); form.querySelector("#f-titulo").focus(); return; }
      if (rascunho.tipoMidia === "imagem" && !rascunho.dataUrl) { App.toast("Envie a imagem da obra.", "erro"); return; }
      if (rascunho.tipoMidia === "audio" && !rascunho.nomeArquivo) { App.toast("Envie o arquivo de áudio.", "erro"); return; }

      var nova = {
        id: U.uid("obra"),
        artistId: App.state.usuarioAtualId,
        titulo: titulo,
        descricao: (fd.get("descricao") || "").trim() || "Sem descrição.",
        categoria: fd.get("categoria") || "ilustracao",
        tipoMidia: rascunho.tipoMidia,
        urlMidia: rascunho.tipoMidia === "imagem" ? rascunho.dataUrl : "",
        thumb: rascunho.tipoMidia === "imagem" ? rascunho.dataUrl : "https://picsum.photos/seed/artlivre-" + U.slug(titulo) + "/700/700",
        duracao: rascunho.tipoMidia === "audio" ? 150 + Math.floor(Math.random() * 120) : undefined,
        curtidas: 0, apoiadores: 0,
        dataCriacao: new Date().toISOString().slice(0, 10),
        tags: (fd.get("tags") || "").split(",").map(function (t) { return t.trim(); }).filter(Boolean),
        comentarios: []
      };
      App.state.uploads.unshift(nova);
      App.state.artworks.unshift(nova);
      // tenta persistir; imagem grande pode estourar cota (ok, segue sem persistir)
      App.store.set("uploads", App.state.uploads);
      rascunho = { tipoMidia: "imagem", dataUrl: "", nomeArquivo: "" };
      App.toast("Obra publicada no seu portfólio.");
      irPara("#/artista/" + App.state.usuarioAtualId + "?aba=projetos");
    });
  }

  /* --- Clique global delegado (data-act) --- */
  document.addEventListener("click", function (e) {
    var alvo = e.target.closest("[data-act]");

    // fechar modal ao clicar no fundo
    if (alvo && alvo.getAttribute("data-act") === "modal-overlay" && e.target === alvo) {
      App.fecharModal(); return;
    }
    if (!alvo) return;
    var act = alvo.getAttribute("data-act");
    var obraId = alvo.getAttribute("data-obra");
    var artistaId = alvo.getAttribute("data-artista");

    switch (act) {
      case "tema-toggle": ciclarTema(); break;

      case "abrir-configuracoes":
        App.state.modal = { tipo: "configuracoes" };
        App.render();
        break;

      case "tema-selecionar": {
        var tema = alvo.getAttribute("data-tema");
        if (tema === "claro" || tema === "escuro") {
          App.state.tema = tema;
          App.store.set("tema", tema);
          aplicarTema();
          App.render();
        }
        break;
      }

      case "cat":
        App.state.categoria = alvo.getAttribute("data-cat");
        App.refreshGallery();
        break;

      case "limpar-filtros":
        App.state.categoria = "todas"; App.state.busca = ""; App.state.ordenacao = "recentes";
        App.render();
        break;

      case "feed-aba":
        App.state.feedAba = alvo.getAttribute("data-aba");
        document.querySelectorAll('.feed-tabs__item').forEach(function (b) { b.classList.toggle('is-on', b.getAttribute('data-aba') === App.state.feedAba); });
        App.refreshGallery();
        break;

      case "abrir-conversa":
        App.state.conversaAtiva = artistaId;
        App.render();
        break;

      case "seguir": {
        var seguindo = App.query.isFollowing(artistaId);
        if (seguindo) delete App.state.seguindo[artistaId]; else App.state.seguindo[artistaId] = true;
        App.store.set("seguindo", App.state.seguindo);
        App.toast(seguindo ? "Você deixou de seguir este artista." : "Agora você recebe obras deste artista no feed Seguindo.");
        App.render();
        break;
      }

      case "favoritar": {
        var salvo = App.query.isFavorite(obraId);
        if (salvo) delete App.state.favoritos[obraId]; else App.state.favoritos[obraId] = true;
        App.store.set("favoritos", App.state.favoritos);
        document.querySelectorAll('.salvar[data-obra="' + obraId + '"]').forEach(function (b) {
          var on = App.query.isFavorite(obraId); b.classList.toggle('is-on', on); b.setAttribute('aria-pressed', on);
          var ic = b.querySelector('i'); if (ic) ic.className = (on ? 'fa-solid' : 'fa-regular') + ' fa-bookmark';
        });
        App.toast(salvo ? "Obra removida dos favoritos." : "Obra salva nos favoritos.");
        break;
      }

      case "compartilhar":
        U.copy(location.href.split("#")[0] + "#/obra/" + obraId).then(function () {
          App.toast("Link da obra copiado. Compartilhe com quem ama arte independente.");
        });
        break;

      case "notificacoes":
        App.state.modal = { tipo: "notificacoes" };
        App.render();
        break;

      case "notificacoes-lidas":
        App.state.notificacoes.forEach(function (n) { n.lida = true; });
        App.store.set("notificacoes", App.state.notificacoes);
        App.refreshModal();
        break;

      case "colecao-ver":
        location.hash = '#/artista/' + artistaId + '?aba=projetos';
        break;

      case "curtir": {
        var jaCurtiu = App.query.isLiked(obraId);
        if (jaCurtiu) delete App.state.curtidas[obraId];
        else App.state.curtidas[obraId] = true;
        App.store.set("curtidas", App.state.curtidas);
        // atualiza todos os botões/contadores dessa obra no DOM
        var novo = App.query.likeCount(obraId);
        document.querySelectorAll('[data-like-count="' + obraId + '"]').forEach(function (n) { n.textContent = U.fmtNum(novo); });
        document.querySelectorAll('.curtir[data-obra="' + obraId + '"]').forEach(function (b) {
          var on = App.query.isLiked(obraId);
          b.classList.toggle("is-on", on);
          b.setAttribute("aria-pressed", on);
          var ic = b.querySelector("i"); if (ic) ic.className = (on ? "fa-solid" : "fa-regular") + " fa-heart";
        });
        if (!jaCurtiu) pulinhoCoracao(alvo);
        break;
      }

      case "abrir-obra":
        App.state.modal = { tipo: "obra", id: obraId };
        history.replaceState(null, "", "#/obra/" + obraId);
        App.state.route = parseHash();
        App.render();
        break;

      case "fechar-modal":
        App.fecharModal();
        break;

      case "apoiar":
        App.checkout.abrir(artistaId);
        break;

      /* ---- checkout ---- */
      case "apoio-tipo": App.checkout.setApoioTipo(alvo.getAttribute("data-tipo")); break;
      case "apoio-valor": App.checkout.setValor(alvo.getAttribute("data-valor")); break;
      case "apoio-tier": App.checkout.setTier(alvo.getAttribute("data-tier")); break;
      case "apoio-avancar": App.checkout.avancar(); break;
      case "apoio-voltar": App.checkout.voltar(); break;
      case "apoio-copiar": App.checkout.copiarPix(); break;
      case "apoio-confirmar": App.checkout.confirmar(); break;

      /* ---- player fixo ---- */
      case "player-toggle": App.player.alternar(); break;
      case "player-close": App.player.fechar(); break;
      case "player-seek": {
        var r = alvo.getBoundingClientRect();
        App.player.buscar((e.clientX - r.left) / r.width);
        break;
      }

      /* ---- player inline ---- */
      case "aplayer-toggle": App.player.alternar(alvo.getAttribute("data-obra")); break;
      case "aplayer-seek": {
        var rr = alvo.getBoundingClientRect();
        var oid = alvo.getAttribute("data-obra");
        if (App.state.player.obraId !== oid) App.player.carregar(oid);
        App.player.buscar((e.clientX - rr.left) / rr.width);
        break;
      }

      /* ---- publicar ---- */
      case "pub-tipo": {
        var t = alvo.getAttribute("data-tipo");
        rascunho.tipoMidia = t; rascunho.dataUrl = ""; rascunho.nomeArquivo = "";
        document.querySelectorAll(".segmento__op").forEach(function (b) { b.classList.toggle("is-on", b.getAttribute("data-tipo") === t); });
        var inp = document.getElementById("f-arquivo");
        inp.value = ""; inp.setAttribute("accept", t === "audio" ? "audio/*" : "image/*");
        var dz = document.getElementById("dropzone");
        dz.querySelector("[data-dz-preview]").hidden = true;
        dz.querySelector("[data-dz-preview]").innerHTML = "";
        dz.querySelector("[data-dz-vazio]").hidden = false;
        dz.querySelector("[data-dz-hint]").textContent = t === "audio" ? "MP3, WAV ou OGG — o áudio é simulado no protótipo" : "PNG, JPG ou WEBP até ~4 MB";
        break;
      }
      case "pub-limpar": {
        rascunho = { tipoMidia: rascunho.tipoMidia, dataUrl: "", nomeArquivo: "" };
        document.getElementById("form-obra").reset();
        var dz2 = document.getElementById("dropzone");
        dz2.querySelector("[data-dz-preview]").hidden = true;
        dz2.querySelector("[data-dz-preview]").innerHTML = "";
        dz2.querySelector("[data-dz-vazio]").hidden = false;
        break;
      }
    }
  });

  /* Envio de comentário (submit delegado). */
  document.addEventListener("submit", function (e) {
    var formMensagem = e.target.closest('[data-act="mensagem-enviar"]');
    if (formMensagem) {
      e.preventDefault();
      var destino = formMensagem.getAttribute("data-artista");
      var campoMensagem = formMensagem.querySelector('[name="mensagem"]');
      var textoMensagem = (campoMensagem.value || "").trim();
      if (!destino || !textoMensagem) return;
      App.state.mensagens[destino] = App.state.mensagens[destino] || [];
      App.state.mensagens[destino].push({ de: "eu", texto: textoMensagem, hora: new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" }) });
      App.store.set("mensagens", App.state.mensagens);
      App.render();
      return;
    }
    var f = e.target.closest('[data-act="coment-enviar"]');
    if (!f) return;
    e.preventDefault();
    var obra = App.query.artworkById(f.getAttribute("data-obra"));
    var campo = f.querySelector('input[name="txt"]');
    var txt = (campo.value || "").trim();
    if (!obra || !txt) return;
    obra.comentarios = obra.comentarios || [];
    obra.comentarios.push({
      autor: (App.query.artistById(App.state.usuarioAtualId) || {}).nome || "Você",
      avatar: (App.query.artistById(App.state.usuarioAtualId) || {}).avatar,
      texto: txt, data: new Date().toISOString().slice(0, 10)
    });
    App.refreshModal();
  });

  /* Esc fecha modal. */
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && App.state.modal) App.fecharModal();
  });

  /* Microanimação: coração ao curtir (respeitando reduced-motion). */
  function pulinhoCoracao(btn) {
    if (U.prefersReducedMotion()) return;
    btn.classList.remove("curtiu-agora");
    void btn.offsetWidth;
    btn.classList.add("curtiu-agora");
  }

  /* ======================================================================= */
  /*  BOOT                                                                    */
  /* ======================================================================= */
  App.data.load().then(function () {
    App.state.init();
    App.state.route = parseHash();
    if (App.state.route.name === "obra") App.state.modal = { tipo: "obra", id: App.state.route.params.id };
    aplicarTema();
    App.render();
  });

})(window.App = window.App || {});

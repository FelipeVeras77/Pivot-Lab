/* =============================================================================
   ArtLivre · player.js
   -----------------------------------------------------------------------------
   Player de áudio SIMULADO. Não existe arquivo de som no protótipo: o transporte
   (play / pause / progresso / seek / volume) é encenado com um timer. A régua de
   progresso anda em tempo real e pode ser arrastada; o volume é visual.

   Trocar por áudio real depois = criar um <audio> por faixa e ligar estes
   métodos aos eventos nativos (timeupdate, ended, etc.).
   ========================================================================== */
(function (App) {
  "use strict";

  var TICK_MS = 250;                 // resolução do "relógio" do player
  var timer = null;

  function estado() { return App.state.player; }

  function iniciarTimer() {
    pararTimer();
    timer = setInterval(function () {
      var p = estado();
      if (!p.tocando) return;
      p.progresso += TICK_MS / 1000;
      if (p.progresso >= p.duracao) {
        p.progresso = p.duracao;
        p.tocando = false;
        pararTimer();
      }
      App.refreshPlayer();
    }, TICK_MS);
  }
  function pararTimer() { if (timer) { clearInterval(timer); timer = null; } }

  App.player = {
    /* Carrega uma obra no transporte sem começar a tocar. */
    carregar: function (obraId) {
      var obra = App.query.artworkById(obraId);
      if (!obra) return;
      var p = estado();
      p.obraId = obraId;
      p.duracao = obra.duracao || 180;
      p.progresso = 0;
      p.tocando = false;
      App.refreshPlayer();
    },

    /* Play/pause inteligente: clica na mesma faixa = alterna; em outra = troca. */
    alternar: function (obraId) {
      var p = estado();
      if (obraId && obraId !== p.obraId) {
        App.player.carregar(obraId);
        p.tocando = true;
        iniciarTimer();
      } else if (p.tocando) {
        p.tocando = false;
        pararTimer();
      } else {
        if (p.progresso >= p.duracao) p.progresso = 0;
        p.tocando = true;
        iniciarTimer();
      }
      App.refreshPlayer();
    },

    pausar: function () {
      estado().tocando = false;
      pararTimer();
      App.refreshPlayer();
    },

    /* Fração 0..1 vinda de clique/arraste na barra. */
    buscar: function (frac) {
      var p = estado();
      p.progresso = App.util.clamp(frac, 0, 1) * p.duracao;
      App.refreshPlayer();
    },

    volume: function (v) {
      estado().volume = App.util.clamp(v, 0, 1);
      App.refreshPlayer();
    },

    fechar: function () {
      pararTimer();
      App.state.player = { obraId: null, tocando: false, progresso: 0, duracao: 0, volume: estado().volume };
      App.refreshPlayer();
    },

    /* HTML da barra fixa inferior (só aparece com faixa carregada). */
    barraHTML: function () {
      var p = estado();
      if (!p.obraId) return "";
      var obra = App.query.artworkById(p.obraId);
      if (!obra) return "";
      var art = App.query.artistById(obra.artistId);
      var frac = p.duracao ? p.progresso / p.duracao : 0;
      var u = App.util;
      return '' +
        '<div class="player" role="region" aria-label="Player de áudio">' +
          '<button class="player__toggle" data-act="player-toggle" aria-label="' + (p.tocando ? "Pausar" : "Tocar") + '">' +
            '<i class="fa-solid ' + (p.tocando ? "fa-pause" : "fa-play") + '"></i>' +
          '</button>' +
          '<img class="player__capa" src="' + u.esc(obra.thumb) + '" alt="" width="44" height="44" loading="lazy">' +
          '<div class="player__meta">' +
            '<a class="player__titulo" href="#/obra/' + obra.id + '" data-link>' + u.esc(obra.titulo) + '</a>' +
            '<a class="player__artista" href="#/artista/' + obra.artistId + '" data-link>' + u.esc(art ? art.nome : "") + '</a>' +
          '</div>' +
          '<div class="player__tempo" data-player-atual>' + u.fmtDuracao(p.progresso) + '</div>' +
          '<div class="player__barra" data-act="player-seek" role="slider" tabindex="0" aria-label="Progresso da faixa"' +
               ' aria-valuemin="0" aria-valuemax="100" aria-valuenow="' + Math.round(frac * 100) + '">' +
            '<div class="player__preenchido" data-player-progress style="width:' + (frac * 100).toFixed(1) + '%"></div>' +
          '</div>' +
          '<div class="player__tempo player__tempo--total">' + u.fmtDuracao(p.duracao) + '</div>' +
          '<div class="player__volume" role="group" aria-label="Volume">' +
            '<i class="fa-solid ' + (p.volume === 0 ? "fa-volume-xmark" : p.volume < 0.5 ? "fa-volume-low" : "fa-volume-high") + '"></i>' +
            '<input type="range" min="0" max="1" step="0.05" value="' + p.volume + '" data-act="player-volume" aria-label="Volume">' +
          '</div>' +
          '<button class="player__fechar" data-act="player-close" aria-label="Fechar player"><i class="fa-solid fa-xmark"></i></button>' +
        '</div>';
    },

    /* Player embutido (card de obra de áudio, modal, perfil). */
    inlineHTML: function (obraId, variante) {
      var obra = App.query.artworkById(obraId);
      if (!obra) return "";
      var p = estado();
      var ativo = p.obraId === obraId;
      var frac = ativo && p.duracao ? p.progresso / p.duracao : 0;
      var tocando = ativo && p.tocando;
      var u = App.util;
      var barras = "";
      for (var i = 0; i < 40; i++) {
        var h = 22 + Math.round(Math.abs(Math.sin(i * 1.7 + App.util.hashStr(obraId) % 10)) * 60);
        barras += '<span style="height:' + h + '%"></span>';
      }
      return '' +
        '<div class="aplayer ' + (variante ? "aplayer--" + variante : "") + (tocando ? " is-playing" : "") + '" data-aplayer="' + obraId + '">' +
          '<button class="aplayer__toggle" data-act="aplayer-toggle" data-obra="' + obraId + '" aria-label="' + (tocando ? "Pausar" : "Tocar") + '">' +
            '<i class="fa-solid ' + (tocando ? "fa-pause" : "fa-play") + '"></i>' +
          '</button>' +
          '<div class="aplayer__onda" data-act="aplayer-seek" data-obra="' + obraId + '" aria-hidden="true">' +
            '<div class="aplayer__ondafill" data-aplayer-progress style="width:' + (frac * 100).toFixed(1) + '%"></div>' +
            barras +
          '</div>' +
          '<div class="aplayer__tempo"><span data-aplayer-atual>' + u.fmtDuracao(ativo ? p.progresso : 0) + '</span> / ' + u.fmtDuracao(obra.duracao || 0) + '</div>' +
        '</div>';
    }
  };
})(window.App = window.App || {});

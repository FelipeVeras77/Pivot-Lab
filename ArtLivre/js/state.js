/* =============================================================================
   ArtLivre · state.js
   -----------------------------------------------------------------------------
   - App.util  : helpers puros (formatação, escape, clipboard, debounce...)
   - App.store : leitura/escrita em localStorage com prefixo "artlivre:"
   - App.state : estado da aplicação em memória
   - App.query : consultas derivadas (não guardam estado, só leem)

   Nada aqui desenha tela. O app.js observa esse estado e re-renderiza.
   ========================================================================== */
(function (App) {
  "use strict";

  /* ------------------------------------------------------------------ util -- */
  var util = {
    esc: function (s) {
      return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) {
        return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
      });
    },
    fmtBRL: function (n) {
      try {
        return (n || 0).toLocaleString("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 });
      } catch (e) { return "R$ " + Math.round(n || 0); }
    },
    fmtBRLcent: function (n) {
      try {
        return (n || 0).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
      } catch (e) { return "R$ " + (n || 0).toFixed(2); }
    },
    fmtNum: function (n) {
      try { return (n || 0).toLocaleString("pt-BR"); } catch (e) { return String(n || 0); }
    },
    fmtDuracao: function (seg) {
      seg = Math.max(0, Math.round(seg || 0));
      var m = Math.floor(seg / 60), s = seg % 60;
      return m + ":" + (s < 10 ? "0" : "") + s;
    },
    fmtDataRel: function (iso) {
      var d = new Date(iso + "T12:00:00");
      if (isNaN(d)) return iso || "";
      var dias = Math.round((Date.now() - d.getTime()) / 86400000);
      if (dias <= 0) return "hoje";
      if (dias === 1) return "ontem";
      if (dias < 7) return "há " + dias + " dias";
      if (dias < 30) return "há " + Math.round(dias / 7) + " sem";
      if (dias < 365) return "há " + Math.round(dias / 30) + " meses";
      return "há " + Math.round(dias / 365) + " ano(s)";
    },
    slug: function (s) {
      return String(s || "").toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "")
        .replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
    },
    uid: function (p) { return (p || "id") + "-" + Date.now().toString(36) + Math.random().toString(36).slice(2, 7); },
    clamp: function (n, a, b) { return Math.min(b, Math.max(a, n)); },
    debounce: function (fn, ms) {
      var t; return function () {
        var ctx = this, args = arguments;
        clearTimeout(t); t = setTimeout(function () { fn.apply(ctx, args); }, ms || 200);
      };
    },
    /* Hash inteiro estável (para gerar o QR fake determinístico). */
    hashStr: function (s) {
      var h = 2166136261 >>> 0;
      for (var i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619) >>> 0; }
      return h >>> 0;
    },
    prefersReducedMotion: function () {
      return window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    },
    /* Copia texto com fallback para file:// (sem navigator.clipboard). */
    copy: function (texto) {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        return navigator.clipboard.writeText(texto).catch(function () { return legado(texto); });
      }
      return Promise.resolve(legado(texto));
      function legado(t) {
        try {
          var ta = document.createElement("textarea");
          ta.value = t; ta.setAttribute("readonly", "");
          ta.style.position = "fixed"; ta.style.opacity = "0";
          document.body.appendChild(ta); ta.select();
          document.execCommand("copy"); document.body.removeChild(ta);
          return true;
        } catch (e) { return false; }
      }
    }
  };
  App.util = util;

  /* ----------------------------------------------------------------- store -- */
  var PFX = "artlivre:";
  App.store = {
    get: function (k, fallback) {
      try {
        var raw = localStorage.getItem(PFX + k);
        return raw == null ? fallback : JSON.parse(raw);
      } catch (e) { return fallback; }
    },
    set: function (k, v) {
      try { localStorage.setItem(PFX + k, JSON.stringify(v)); return true; }
      catch (e) { return false; } // cota estourada, modo privado, etc.
    },
    del: function (k) { try { localStorage.removeItem(PFX + k); } catch (e) {} }
  };

  /* ----------------------------------------------------------------- state -- */
  App.state = {
    route: { name: "explorar", params: {}, query: {} },
    tema: App.store.get("tema", "escuro"),      // 'claro' | 'escuro' (escuro = visual padrão)
    categoria: "todas",
    busca: "",
    ordenacao: "recentes",                       // 'recentes' | 'curtidas' | 'apoiadores'

    // Coleções (podem crescer com uploads locais).
    artists: [],
    artworks: [],
    supporters: [],
    desempenho: {},

    // Dados do visitante (persistidos).
    curtidas: {},                                // { [artworkId]: true }
    favoritos: {},                               // obras salvas pelo visitante
    seguindo: {},                                 // artistas acompanhados pelo visitante
    notificacoes: [],
    mensagens: {},
    conversaAtiva: "beto-cravo",
    apoios: [],                                  // [{id,artistId,tipo,tierId,valor,data}]
    uploads: [],                                 // obras adicionadas localmente

    // Quem é o "dono" do painel (protótipo: sempre a Marina).
    usuarioAtualId: "marina-torres",

    modal: null,                                 // {tipo:'obra', id} | {tipo:'apoio', artistId, ...}
    toast: null,

    player: { obraId: null, tocando: false, progresso: 0, duracao: 0, volume: 0.8 },

    /* Hidrata estado a partir de App.data + localStorage. */
    init: function () {
      var s = App.state;
      // Compatibilidade com preferências salvas em versões anteriores.
      if (s.tema !== "claro" && s.tema !== "escuro") {
        s.tema = "escuro";
        App.store.set("tema", s.tema);
      }
      s.curtidas = App.store.get("curtidas", {}) || {};
      s.favoritos = App.store.get("favoritos", {}) || {};
      s.seguindo = App.store.get("seguindo", {
        "beto-cravo": true, "lia-santanna": true, "oficina-carua": true
      }) || {};
      s.notificacoes = App.store.get("notificacoes", [
        { id: "n1", tipo: "apoio", texto: "Renata começou a apoiar seu trabalho.", tempo: "agora", lida: false },
        { id: "n2", tipo: "curtida", texto: "Sua obra Antena e Jabuticaba recebeu uma curtida.", tempo: "há 18 min", lida: false },
        { id: "n3", tipo: "comentario", texto: "João comentou em Rota da Feira.", tempo: "há 2 h", lida: true }
      ]) || [];
      s.mensagens = App.store.get("mensagens", {
        "beto-cravo": [
          { de: "beto-cravo", texto: "Oi, Marina! Obrigado por acompanhar os estudos de alfaia.", hora: "10:24" },
          { de: "eu", texto: "Estou adorando ouvir os bastidores. Ansiosa pela próxima faixa!", hora: "10:31" }
        ],
        "lia-santanna": [
          { de: "lia-santanna", texto: "A nova série de retratos sai no fim da semana.", hora: "ontem" }
        ]
      }) || {};
      s.apoios = App.store.get("apoios", []) || [];
      s.uploads = App.store.get("uploads", []) || [];
      // uploads locais entram na frente do acervo
      s.artists = App.data.artists.slice();
      s.artworks = s.uploads.concat(App.data.artworks);
      s.supporters = App.data.supporters.slice();
      s.desempenho = App.data.desempenho;
    }
  };

  /* ----------------------------------------------------------------- query -- */
  var Q = {
    artistById: function (id) {
      return App.state.artists.filter(function (a) { return a.id === id; })[0] || null;
    },
    tierById: function (id) {
      var t = null;
      App.state.artists.forEach(function (a) {
        (a.tiers || []).forEach(function (x) { if (x.id === id) t = x; });
      });
      return t;
    },
    artworkById: function (id) {
      return App.state.artworks.filter(function (o) { return o.id === id; })[0] || null;
    },
    artworksByArtist: function (id) {
      return App.state.artworks.filter(function (o) { return o.artistId === id; })
        .sort(function (a, b) { return (b.dataCriacao || "").localeCompare(a.dataCriacao || ""); });
    },
    supportersByArtist: function (id) {
      return App.state.supporters.filter(function (s) { return s.artistId === id; })
        .sort(function (a, b) { return (b.data || "").localeCompare(a.data || ""); });
    },

    /* Feed do Explorar: aplica categoria + busca + ordenação. */
    feed: function () {
      var s = App.state;
      var termo = s.busca.trim().toLowerCase();
      var lista = s.artworks.filter(function (o) {
        if (s.categoria !== "todas" && o.categoria !== s.categoria) return false;
        if (!termo) return true;
        var art = Q.artistById(o.artistId);
        var alvo = [o.titulo, o.descricao, (o.tags || []).join(" "), art && art.nome].join(" ").toLowerCase();
        return alvo.indexOf(termo) !== -1;
      });
      lista.sort(function (a, b) {
        if (s.ordenacao === "curtidas") return Q.likeCount(b) - Q.likeCount(a);
        if (s.ordenacao === "apoiadores") return (b.apoiadores || 0) - (a.apoiadores || 0);
        if (s.ordenacao === "comentadas") return (b.comentarios || []).length - (a.comentarios || []).length;
        return (b.dataCriacao || "").localeCompare(a.dataCriacao || "");
      });
      return lista;
    },
    feedSeguindo: function () {
      return Q.feed().filter(function (o) { return !!App.state.seguindo[o.artistId]; });
    },
    isFavorite: function (obraId) { return !!App.state.favoritos[obraId]; },
    favoriteArtworks: function () {
      return App.state.artworks.filter(function (o) { return Q.isFavorite(o.id); })
        .sort(function (a, b) { return (b.dataCriacao || "").localeCompare(a.dataCriacao || ""); });
    },
    likedArtworks: function () {
      return App.state.artworks.filter(function (o) { return Q.isLiked(o.id); })
        .sort(function (a, b) { return (b.dataCriacao || "").localeCompare(a.dataCriacao || ""); });
    },
    isFollowing: function (artistId) { return !!App.state.seguindo[artistId]; },
    unreadNotifications: function () {
      return App.state.notificacoes.filter(function (n) { return !n.lida; }).length;
    },

    /* Curtidas: número base + curtida local do visitante. */
    isLiked: function (obraId) { return !!App.state.curtidas[obraId]; },
    likeCount: function (obra) {
      if (typeof obra === "string") obra = Q.artworkById(obra);
      if (!obra) return 0;
      return (obra.curtidas || 0) + (App.state.curtidas[obra.id] ? 1 : 0);
    },

    /* Apoios do visitante a um artista (ou todos). */
    meusApoios: function (artistId) {
      return App.state.apoios.filter(function (a) { return !artistId || a.artistId === artistId; });
    },
    apoiaArtista: function (artistId) {
      return Q.meusApoios(artistId).some(function (a) { return a.tipo === "mensal"; });
    },

    /* Meta: arrecadado do mês = base do mock + apoios feitos agora no protótipo. */
    arrecadadoMes: function (artistId) {
      var art = Q.artistById(artistId);
      var base = art ? (art.meta.atual || 0) : 0;
      var extra = Q.meusApoios(artistId).reduce(function (t, a) { return t + (a.valor || 0); }, 0);
      return base + extra;
    },
    progressoMeta: function (artistId) {
      var art = Q.artistById(artistId);
      if (!art || !art.meta.alvo) return 0;
      return App.util.clamp(Q.arrecadadoMes(artistId) / art.meta.alvo, 0, 1.35);
    },
    apoiadoresAtivos: function (artistId) {
      var art = Q.artistById(artistId);
      var base = art ? (art.apoiadoresAtivos || 0) : 0;
      return base + Q.meusApoios(artistId).filter(function (a) { return a.tipo === "mensal"; }).length;
    },
    curtidasTotaisArtista: function (artistId) {
      return Q.artworksByArtist(artistId).reduce(function (t, o) { return t + Q.likeCount(o); }, 0);
    },

    /* Séries do painel do criador. */
    serie: function (artistId) {
      return App.state.desempenho[artistId] || { meses: [], arrecadacao: [], visitas: [], novosApoiadores: [] };
    }
  };
  App.query = Q;
})(window.App = window.App || {});

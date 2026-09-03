/* =============================================================================
   ArtLivre · checkout.js
   -----------------------------------------------------------------------------
   Fluxo de apoio SIMULADO, em 4 passos dentro de um modal:
     1. Tipo de apoio ....... Doação pontual  ou  Assinatura mensal
     2. Valor / Nível ....... botões rápidos + valor livre  ou  cards de tier
     3. Pix ................. QR fake determinístico + "copia e cola"
     4. Sucesso ............. selo de apoiador (elemento-assinatura da ArtLivre)

   Nenhuma cobrança acontece. "Simular confirmação de pagamento" só grava o
   apoio no estado local (localStorage). Ver POST /api/v1/donations no
   BACKEND_INTEGRATION.md para o contrato real.
   ========================================================================== */
(function (App) {
  "use strict";

  var VALORES_RAPIDOS = [10, 25, 50, 100];

  function modal() { return App.state.modal; }
  function artista() { return App.query.artistById(modal().artistId); }

  /* ---- QR fake: grid determinístico a partir do payload ------------------- */
  function qrSVG(payload) {
    var N = 29, cell = 8, quiet = 2, dim = (N + quiet * 2) * cell;
    var seed = App.util.hashStr(payload || "artlivre");
    // LCG simples só para o padrão visual
    function rnd() { seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0; return seed / 4294967296; }
    var isFinder = function (r, c) {
      var inBox = function (br, bc) { return r >= br && r < br + 7 && c >= bc && c < bc + 7; };
      return inBox(0, 0) || inBox(0, N - 7) || inBox(N - 7, 0);
    };
    var finderOn = function (r, c) {
      var f = function (br, bc) {
        if (!(r >= br && r < br + 7 && c >= bc && c < bc + 7)) return null;
        var rr = r - br, cc = c - bc;
        var borda = rr === 0 || rr === 6 || cc === 0 || cc === 6;
        var miolo = rr >= 2 && rr <= 4 && cc >= 2 && cc <= 4;
        return borda || miolo;
      };
      return f(0, 0) || f(0, N - 7) || f(N - 7, 0);
    };
    var d = "";
    for (var r = 0; r < N; r++) {
      for (var c = 0; c < N; c++) {
        var on;
        if (isFinder(r, c)) { on = finderOn(r, c); }
        else if ((r === 6 || c === 6)) { on = (r + c) % 2 === 0; }         // timing
        else { on = rnd() > 0.52; }
        if (on) {
          var x = (c + quiet) * cell, y = (r + quiet) * cell;
          d += "M" + x + " " + y + "h" + cell + "v" + cell + "h-" + cell + "z";
        }
      }
    }
    return '<svg class="pix__qr" viewBox="0 0 ' + dim + ' ' + dim + '" role="img" aria-label="QR Code Pix (simulado)" shape-rendering="crispEdges">' +
      '<rect width="' + dim + '" height="' + dim + '" fill="#ffffff"/>' +
      '<path d="' + d + '" fill="#111111"/></svg>';
  }

  /* ---- "Copia e cola" no formato EMV (fake, só para demonstração) --------- */
  function gerarPixCode(m) {
    var art = App.query.artistById(m.artistId);
    var ref = "ARTLIVRE" + App.util.slug(art ? art.nome : "artista").replace(/-/g, "").toUpperCase().slice(0, 12);
    var txid = App.util.hashStr(m.artistId + m.apoioTipo + m.valor + Date.now()).toString(16).toUpperCase();
    var valor = (m.valor || 0).toFixed(2);
    var payload = "00020126" +
      "0014BR.GOV.BCB.PIX" +
      "0136" + "artlivre-" + App.util.slug(art ? art.nome : "artista") + "@pix.exemplo" +
      "52040000" +
      "5303986" +
      "54" + String(valor.length).padStart(2, "0") + valor +
      "5802BR" +
      "5913ArtLivre Apoio" +
      "6009SAO PAULO" +
      "62" + String(("05" + String(txid.length).padStart(2, "0") + txid).length).padStart(2, "0") + "05" + String(txid.length).padStart(2, "0") + txid +
      "6304";
    // CRC fake de 4 hex (não é o CRC16 real — protótipo)
    var crc = (App.util.hashStr(payload) & 0xffff).toString(16).toUpperCase().padStart(4, "0");
    return payload + crc;
  }

  App.checkout = {
    valoresRapidos: VALORES_RAPIDOS,

    abrir: function (artistId) {
      App.state.modal = {
        tipo: "apoio", artistId: artistId, passo: 1,
        apoioTipo: "mensal", valor: 25, tierId: null, pixCode: ""
      };
      App.render();
    },

    setApoioTipo: function (t) {
      var m = modal(); m.apoioTipo = t;
      if (t === "mensal") {
        var tiers = artista().tiers || [];
        var atual = tiers.filter(function (x) { return x.id === m.tierId; })[0];
        if (!atual) { m.tierId = tiers[1] ? tiers[1].id : (tiers[0] && tiers[0].id); }
        var t2 = App.query.tierById(m.tierId); if (t2) m.valor = t2.preco;
      } else {
        m.tierId = null; if (!m.valor) m.valor = 25;
      }
      App.refreshModal();
    },

    setValor: function (v) {
      var m = modal();
      v = Math.max(0, Math.round(Number(v) || 0));
      m.valor = v;
      App.refreshModal();
    },

    setTier: function (id) {
      var m = modal(); m.tierId = id;
      var t = App.query.tierById(id); if (t) m.valor = t.preco;
      App.refreshModal();
    },

    voltar: function () {
      var m = modal();
      if (m.passo <= 1) { App.fecharModal(); return; }
      m.passo -= 1;
      App.refreshModal();
    },

    avancar: function () {
      var m = modal();
      if (m.passo === 1) { m.passo = 2; }
      else if (m.passo === 2) {
        if (!m.valor || m.valor < 1) { App.toast("Escolha um valor para continuar.", "erro"); return; }
        m.pixCode = gerarPixCode(m);
        m.passo = 3;
      }
      App.refreshModal();
    },

    copiarPix: function () {
      var m = modal();
      App.util.copy(m.pixCode).then(function (ok) {
        App.toast(ok ? "Código Pix copiado." : "Não foi possível copiar — selecione o texto manualmente.", ok ? "ok" : "erro");
      });
    },

    /* Grava o apoio localmente e vai para a tela de sucesso. */
    confirmar: function () {
      var m = modal();
      var registro = {
        id: App.util.uid("apoio"),
        artistId: m.artistId,
        tipo: m.apoioTipo,
        tierId: m.apoioTipo === "mensal" ? m.tierId : null,
        valor: m.valor,
        data: new Date().toISOString().slice(0, 10)
      };
      App.state.apoios.push(registro);
      App.store.set("apoios", App.state.apoios);
      m.passo = 4;
      App.render();
    },

    /* HTML interno do modal conforme o passo. */
    html: function () {
      var m = modal(), art = artista(), u = App.util;
      if (!art) return "";
      var passos = ["Tipo", "Valor", "Pix", "Feito"];
      var trilha = '<ol class="apoio__trilha" aria-label="Etapas do apoio">' + passos.map(function (p, i) {
        var n = i + 1, estado = n < m.passo ? "feito" : n === m.passo ? "ativo" : "";
        return '<li class="' + estado + '"><span>' + n + '</span>' + p + '</li>';
      }).join("") + "</ol>";

      var corpo = "";
      if (m.passo === 1) {
        corpo =
          '<h2 class="apoio__titulo">Apoiar ' + u.esc(art.nome) + '</h2>' +
          '<p class="apoio__sub">Escolha como quer apoiar. Você pode mudar ou cancelar quando quiser.</p>' +
          '<div class="apoio__tipos">' +
            botaoTipo("mensal", "fa-repeat", "Assinatura mensal", "Recompensas contínuas e seu nome nos créditos.", m.apoioTipo === "mensal") +
            botaoTipo("pontual", "fa-bolt", "Doação pontual", "Uma contribuição única, sem compromisso.", m.apoioTipo === "pontual") +
          '</div>';
      } else if (m.passo === 2 && m.apoioTipo === "pontual") {
        corpo =
          '<h2 class="apoio__titulo">Quanto você quer doar?</h2>' +
          '<p class="apoio__sub">100% vai para ' + u.esc(art.nome) + ' neste protótipo.</p>' +
          '<div class="apoio__rapidos">' + VALORES_RAPIDOS.map(function (v) {
            return '<button type="button" class="chipvalor ' + (m.valor === v ? "is-on" : "") + '" data-act="apoio-valor" data-valor="' + v + '">' + u.fmtBRL(v) + '</button>';
          }).join("") + '</div>' +
          '<label class="apoio__livre"><span>Outro valor</span>' +
            '<div class="apoio__inputmoney"><i>R$</i>' +
              '<input type="number" min="1" step="1" inputmode="numeric" value="' + (m.valor || "") + '" data-act="apoio-valor-livre" aria-label="Valor livre em reais">' +
            '</div>' +
          '</label>';
      } else if (m.passo === 2) {
        corpo =
          '<h2 class="apoio__titulo">Escolha seu nível</h2>' +
          '<p class="apoio__sub">Cobrança mensal. Cancele quando quiser.</p>' +
          '<div class="apoio__tiers">' + (art.tiers || []).map(function (t) {
            var on = m.tierId === t.id;
            return '<button type="button" class="tiercard ' + (on ? "is-on" : "") + '" data-act="apoio-tier" data-tier="' + t.id + '" aria-pressed="' + on + '">' +
              '<span class="tiercard__faixa" style="background:' + t.cor + '"></span>' +
              '<span class="tiercard__topo"><strong>' + u.esc(t.nome) + '</strong><em>' + u.fmtBRL(t.preco) + '<i>/mês</i></em></span>' +
              '<ul class="tiercard__lista">' + t.beneficios.map(function (b) { return "<li>" + u.esc(b) + "</li>"; }).join("") + '</ul>' +
            '</button>';
          }).join("") + '</div>';
      } else if (m.passo === 3) {
        var resumo = (m.apoioTipo === "mensal"
          ? "Assinatura " + (App.query.tierById(m.tierId) || {}).nome + " · " + u.fmtBRL(m.valor) + "/mês"
          : "Doação pontual · " + u.fmtBRL(m.valor));
        corpo =
          '<h2 class="apoio__titulo">Pague com Pix</h2>' +
          '<p class="apoio__sub">' + u.esc(resumo) + '</p>' +
          '<div class="pix">' +
            '<div class="pix__qrwrap">' + qrSVG(m.pixCode) + '</div>' +
            '<div class="pix__lado">' +
              '<p class="pix__inst">Abra o app do seu banco, escolha <strong>Pix Copia e Cola</strong> e cole o código:</p>' +
              '<code class="pix__code" data-pix-code>' + u.esc(m.pixCode) + '</code>' +
              '<button type="button" class="btn btn--bloco" data-act="apoio-copiar"><i class="fa-regular fa-copy"></i> Copiar código Pix</button>' +
              '<p class="pix__nota">Protótipo: nenhum valor é cobrado de verdade.</p>' +
            '</div>' +
          '</div>';
      } else {
        var tierNome = m.apoioTipo === "mensal" ? (App.query.tierById(m.tierId) || {}).nome : null;
        corpo =
          '<div class="selo" role="status" aria-live="polite">' +
            '<svg viewBox="0 0 120 120" aria-hidden="true">' +
              '<circle cx="60" cy="60" r="54" class="selo__anel"/>' +
              '<circle cx="60" cy="60" r="44" class="selo__anel selo__anel--fino"/>' +
              '<path id="seloCurva" d="M60,18 a42,42 0 1,1 -0.1,0" fill="none"/>' +
              '<text class="selo__texto"><textPath href="#seloCurva" startOffset="0">APOIADOR OFICIAL · ARTLIVRE · APOIADOR OFICIAL · ARTLIVRE · </textPath></text>' +
              '<text x="60" y="66" text-anchor="middle" class="selo__marca">AL</text>' +
            '</svg>' +
          '</div>' +
          '<h2 class="apoio__titulo apoio__titulo--sucesso">Obrigado pelo apoio!</h2>' +
          '<p class="apoio__sub">Você agora é apoiador' + (tierNome ? ' <strong>' + u.esc(tierNome) + '</strong>' : "") +
            ' de <strong>' + u.esc(art.nome) + '</strong>. ' +
            (m.apoioTipo === "mensal" ? "A próxima cobrança seria daqui a 30 dias." : "Sua doação de " + u.fmtBRL(m.valor) + " foi registrada.") + '</p>' +
          '<div class="apoio__acoes">' +
            '<a class="btn btn--principal" href="#/artista/' + art.id + '?aba=projetos" data-link data-act="fechar-modal">Ver o perfil</a>' +
            '<button type="button" class="btn btn--ghost" data-act="fechar-modal">Voltar à galeria</button>' +
          '</div>';
      }

      var rodape = "";
      if (m.passo === 1 || m.passo === 2) {
        rodape =
          '<div class="apoio__rodape">' +
            '<button type="button" class="btn btn--ghost" data-act="apoio-voltar">' + (m.passo === 1 ? "Cancelar" : "Voltar") + '</button>' +
            '<button type="button" class="btn btn--principal" data-act="apoio-avancar">Continuar <span class="btn__bolha"><i class="fa-solid fa-arrow-right"></i></span></button>' +
          '</div>';
      } else if (m.passo === 3) {
        rodape =
          '<div class="apoio__rodape">' +
            '<button type="button" class="btn btn--ghost" data-act="apoio-voltar">Voltar</button>' +
            '<button type="button" class="btn btn--principal" data-act="apoio-confirmar"><i class="fa-solid fa-circle-check"></i> Simular confirmação de pagamento</button>' +
          '</div>';
      }

      return (m.passo < 4 ? trilha : "") + '<div class="apoio__corpo">' + corpo + "</div>" + rodape;
    }
  };

  function botaoTipo(id, icone, titulo, texto, on) {
    return '<button type="button" class="tipoapoio ' + (on ? "is-on" : "") + '" data-act="apoio-tipo" data-tipo="' + id + '" aria-pressed="' + on + '">' +
      '<span class="tipoapoio__ic"><i class="fa-solid ' + icone + '"></i></span>' +
      '<span class="tipoapoio__tx"><strong>' + App.util.esc(titulo) + '</strong><small>' + App.util.esc(texto) + '</small></span>' +
      '<span class="tipoapoio__check"><i class="fa-solid fa-check"></i></span>' +
    '</button>';
  }
})(window.App = window.App || {});

/* CCA Contabilidade — Almanaque Fiscal Vivo
   Interações: marca .js, menu, ano, reveal, próximo vencimento, rail do ano. */
(function () {
  "use strict";
  var root = document.documentElement;
  root.classList.add("js");

  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var MESES = ["jan","fev","mar","abr","mai","jun","jul","ago","set","out","nov","dez"];
  var MESES_LONGOS = ["Janeiro","Fevereiro","Março","Abril","Maio","Junho","Julho","Agosto","Setembro","Outubro","Novembro","Dezembro"];

  /* ------------------------------------------------------------- ano atual */
  var hoje = new Date();
  var ano = hoje.getFullYear();
  document.querySelectorAll("[data-year]").forEach(function (el) { el.textContent = ano; });

  /* -------------------------------------------------------------- menu */
  var menuBtn = document.querySelector(".menu-btn");
  var nav = document.getElementById("nav");
  if (menuBtn && nav) {
    menuBtn.addEventListener("click", function () {
      var open = nav.classList.toggle("open");
      menuBtn.setAttribute("aria-expanded", open ? "true" : "false");
    });
    nav.querySelectorAll("a").forEach(function (a) {
      a.addEventListener("click", function () {
        nav.classList.remove("open");
        menuBtn.setAttribute("aria-expanded", "false");
      });
    });
  }

  /* --------------------------------------------- marca a página na navegação */
  var page = document.body.getAttribute("data-page");
  var mapa = { home: "index.html", servicos: "servicos.html", sobre: "sobre.html", contato: "contato.html" };
  if (mapa[page]) {
    document.querySelectorAll('.nav a[href="' + mapa[page] + '"]').forEach(function (a) {
      if (!a.classList.contains("btn")) a.setAttribute("aria-current", "page");
    });
  }

  /* -------------------------------------------------------------- reveal */
  var revs = document.querySelectorAll(".reveal");
  if (reduce || !("IntersectionObserver" in window)) {
    revs.forEach(function (el) { el.classList.add("in"); });
  } else {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e, i) {
        if (e.isIntersecting) {
          var el = e.target;
          setTimeout(function () { el.classList.add("in"); }, Math.min(i * 80, 240));
          io.unobserve(el);
        }
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -8% 0px" });
    revs.forEach(function (el) { io.observe(el); });
  }

  /* ------------------------------------------ próximo vencimento (ilustrativo) */
  // Dias recorrentes comuns do mês e o tributo tipicamente associado.
  var RECORRENTES = [
    { dia: 7,  nome: "FGTS · eSocial" },
    { dia: 20, nome: "DAS · Simples Nacional" },
    { dia: 25, nome: "PIS / COFINS" }
  ];
  function proximoVencimento(base) {
    for (var add = 0; add < 2; add++) {
      var m = base.getMonth() + add;
      var y = base.getFullYear() + (m > 11 ? 1 : 0);
      m = m % 12;
      for (var i = 0; i < RECORRENTES.length; i++) {
        var d = new Date(y, m, RECORRENTES[i].dia);
        if (d >= stripTime(base)) return { data: d, nome: RECORRENTES[i].nome };
      }
    }
    return { data: new Date(base.getFullYear(), base.getMonth() + 1, RECORRENTES[0].dia), nome: RECORRENTES[0].nome };
  }
  function stripTime(d) { return new Date(d.getFullYear(), d.getMonth(), d.getDate()); }

  var box = document.querySelector("[data-next-due]");
  if (box) {
    var pv = proximoVencimento(hoje);
    var dias = Math.round((stripTime(pv.data) - stripTime(hoje)) / 86400000);
    var quando = dias === 0 ? "é <strong>hoje</strong>" : dias === 1 ? "<strong>amanhã</strong>" : "em <strong>" + dias + "</strong> dias";
    box.innerHTML =
      '<p class="ticket-date num">' + pad(pv.data.getDate()) + '<span class="ticket-mo">/' + MESES[pv.data.getMonth()] + '</span></p>' +
      '<p class="ticket-name">' + pv.nome + '</p>' +
      '<p class="ticket-in num">' + quando + '</p>';
  }
  function pad(n) { return n < 10 ? "0" + n : "" + n; }

  /* ------------------------------------------------------- rail do ano fiscal */
  var DADOS = [
    ["DAS · dia 20", "FGTS · dia 7", "13º e férias em folha"],
    ["DAS · dia 20", "DIRF", "eSocial · dia 7"],
    ["DAS · dia 20", "DEFIS (Simples)", "FGTS · dia 7"],
    ["DAS · dia 20", "IRPF pessoa física", "DCTF"],
    ["DAS · dia 20", "IRPF · prazo final", "FGTS · dia 7"],
    ["DAS · dia 20", "ECF em curso", "eSocial · dia 7"],
    ["DAS · dia 20", "ECF · entrega", "FGTS · dia 7"],
    ["DAS · dia 20", "INSS · dia 20", "DCTF"],
    ["DAS · dia 20", "FGTS · dia 7", "PIS / COFINS"],
    ["DAS · dia 20", "eSocial · dia 7", "INSS · dia 20"],
    ["DAS · dia 20", "FGTS · dia 7", "13º · 1ª parcela"],
    ["DAS · dia 20", "13º · 2ª parcela", "Encerramento do ano"]
  ];
  var rail = document.querySelector("[data-rail]");
  if (rail) {
    var mesAtual = hoje.getMonth();
    var html = "";
    for (var m = 0; m < 12; m++) {
      var hojeCls = m === mesAtual ? " is-today" : "";
      var flag = m === mesAtual ? '<span class="mo-flag">hoje</span>' : "";
      var itens = DADOS[m].map(function (t) { return '<li>' + t + '</li>'; }).join("");
      html +=
        '<div class="rail-mo' + hojeCls + '" role="listitem">' +
          flag +
          '<span class="mo-name">' + MESES_LONGOS[m] + '</span>' +
          '<span class="mo-num num">' + pad(m + 1) + '</span>' +
          '<ul class="mo-list">' + itens + '</ul>' +
        '</div>';
    }
    rail.innerHTML = html;

    // centraliza o mês de hoje no rail ao carregar
    var alvo = rail.querySelector(".is-today");
    if (alvo && !reduce) {
      var outer = rail.closest(".rail-outer");
      if (outer) {
        var left = alvo.offsetLeft - (outer.clientWidth / 2) + (alvo.clientWidth / 2);
        requestAnimationFrame(function () { outer.scrollTo({ left: Math.max(0, left), behavior: "smooth" }); });
      }
    }
  }

  /* ---------------------------------------------- formulário de contato */
  var form = document.getElementById("contato-form");
  if (form) {
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      if (!form.reportValidity()) return;
      var v = function (id) { var el = document.getElementById(id); return el ? el.value.trim() : ""; };
      var nome = v("nome"), empresa = v("empresa"), email = v("email"), tel = v("telefone"), msg = v("mensagem");
      var assunto = "Contato pelo site" + (empresa ? " · " + empresa : (nome ? " · " + nome : ""));
      var corpo =
        "Nome: " + nome + "\n" +
        (empresa ? "Empresa: " + empresa + "\n" : "") +
        "E-mail: " + email + "\n" +
        (tel ? "Telefone: " + tel + "\n" : "") +
        "\n" + msg + "\n";
      var href = "mailto:cca@ccasc.com.br?subject=" + encodeURIComponent(assunto) + "&body=" + encodeURIComponent(corpo);
      var ok = document.getElementById("form-ok");
      if (ok) { ok.classList.add("show"); ok.scrollIntoView({ block: "nearest", behavior: reduce ? "auto" : "smooth" }); }
      window.location.href = href;
    });
  }
})();

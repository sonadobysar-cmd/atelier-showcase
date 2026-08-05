/* Vini d'Elite — Wine Finder (interní profil vín, parametry mimo e-shop) */
(function () {
  var WINES = window.WINES;
  if (!WINES) return;

  var WF_STEPS = [
    {
      key: "type",
      q: "Jaké víno dnes otevřete?",
      hint: "Začneme barvou — stejně jako u italského menu: antipasto, primi nebo grigliata.",
      opts: [
        { b: "Červené", s: "Struktura, tanin, večerní charakter", v: "red" },
        { b: "Bílé", s: "Svěžest, lehkost, k moři i k jídlu", v: "white" },
        { b: "Šumivé", s: "Jemné perlení, aperitiv a radost", v: "sparkling" },
      ],
    },
    {
      key: "moment",
      q: "V jaké chvíli ho vypijete?",
      hint: "Stejná láhev jinak sedí k aperitivu, večeři i dárku pro blízkého.",
      opts: [
        { b: "Před jídlem", s: "Aperitiv, první sklenka u stolu", v: "aperitiv" },
        { b: "U večeře", s: "K jídlu, dlouhý rozhovor, společnost", v: "dinner" },
        { b: "Na oslavu", s: "Slavnostní večer, něco výjimečného", v: "celebration" },
        { b: "Jako dárek", s: "Láhev s příběhem a respektem k vinaři", v: "gift" },
      ],
    },
    {
      key: "pairing",
      q: "Co bude na talíři?",
      hint: "Italské víno se rodí u jídla — párování je polovina doporučení.",
      opts: [
        { b: "Maso a gril", s: "Steak, zvěřina, ragù, pečeně", v: "maso" },
        { b: "Ryby a moře", s: "Ryby, plody moře, lehčí chody", v: "ryba" },
        { b: "Sýry a pasty", s: "Parmigiano, uzeniny, těstoviny", v: "syr" },
        { b: "Předkrmy", s: "Prosciutto, antipasti, první chod", v: "aperitiv" },
        { b: "Bez jídla", s: "Chci si ho vychutnat samotné", v: "solo" },
      ],
    },
    {
      key: "sweet",
      q: "Jak suché má být?",
      hint: "Suchost není jen chuť — je to dojem po doušku. Většina našich vín je suchá.",
      opts: [
        { b: "Úplně suché", s: "Bez zbytkového cukru, čistá chuť", v: 0 },
        { b: "S náznakem sladka", s: "Polosuché, kulatější a hebké", v: 1 },
        { b: "Sladší profil", s: "Ovocně hřejivé — Moscato, Dolce…", v: 2 },
      ],
    },
    {
      key: "body",
      q: "Jak plné má být v ústech?",
      hint: "Tělo popisuje váhu vína v ústech — od vzdušného Grignolina po archivní cuvée.",
      opts: [
        { b: "Lehké a hebké", s: "Pití bez námahy, jemný tanin", v: 0 },
        { b: "Středně plné", s: "Vyvážené, univerzální k jídlu", v: 1 },
        { b: "Mohutné a strukturované", s: "Tanin, hloubka, dlouhý závěr", v: 2 },
      ],
    },
    {
      key: "fruit",
      q: "Jaké ovoce v něm chcete cítit?",
      hint: "Čerstvé bobule, zralé třešně nebo koncentrované sušené ovoce vedou k jiné lahvi.",
      opts: [
        { b: "Čerstvé", s: "Citrus, jablko, jahoda, granátové jablko", v: "fresh" },
        { b: "Zralé", s: "Třešeň, broskev, švestka, fík", v: "ripe" },
        { b: "Sušené", s: "Rozinka, povidla, kakao, koncentrace", v: "dried" },
      ],
    },
    {
      key: "aroma",
      q: "Co má dominovat ve vůni?",
      hint: "Vůně zpřesní doporučení mezi odrůdou, půdou a způsobem zrání.",
      opts: [
        { b: "Ovoce", s: "Třešeň, švestka, lesní plody", v: "fruity" },
        { b: "Květiny a byliny", s: "Fialka, růže, balsamické byliny", v: "floral" },
        { b: "Dub a koření", s: "Vanilka, pepř, čokoláda, sud", v: "woody" },
        { b: "Minerál a kámen", s: "Mořská sůl, křída, sopečná půda", v: "mineral" },
      ],
    },
    {
      key: "acidity",
      q: "Jak živá má být kyselina?",
      hint: "Kyselina probouzí chuť — u bílých ji cítíte nejvíc, u červených ji vyvažuje tanin.",
      opts: [
        { b: "Měkká a kulatá", s: "Hřejivé, bez ostření", v: 0 },
        { b: "Vyvážená", s: "Svěží, ale ne řezavá", v: 1 },
        { b: "Výrazná", s: "Citrus, salinita, tah — Gavi, Etna…", v: 2 },
      ],
    },
    {
      key: "tannin",
      q: "Jak výraznou chcete tříslovinu?",
      hint: "Tříslovina je svíravý pocit na dásních — drží strukturu červeného vína a pomáhá mu s jídlem.",
      opts: [
        { b: "Téměř žádnou", s: "Jemné, hladké, bez svírání", v: 0 },
        { b: "Příjemně znatelnou", s: "Drží víno, ale nepřebíjí ho", v: 1 },
        { b: "Pevnou a výraznou", s: "Struktura pro steak, zvěřinu a archivaci", v: 2 },
      ],
    },
    {
      key: "adventure",
      q: "Co od lahve očekáváte?",
      hint: "Poslední otázka — od bezstarostné lahve po archivní víno, které vyžaduje čas.",
      opts: [
        { b: "Bezstarostnou klasiku", s: "Přístupné víno pro společný stůl", v: 0 },
        { b: "Autentický objev", s: "Méně známá odrůda s příběhem", v: 1 },
        { b: "Výjimečnou láhev", s: "Hloubka, archivní charakter, dlouhý závěr", v: 2 },
      ],
    },
  ];

  var elQ = document.getElementById("wfQuestion");
  var elHint = document.getElementById("wfHint");
  var elO = document.getElementById("wfOptions");
  var elBack = document.getElementById("wfBack");
  var elNum = document.getElementById("wfStepNum");
  var elProg = document.getElementById("wfProgress");
  var elQuiz = document.getElementById("wfQuiz");
  var elRes = document.getElementById("wfResult");
  var elTotal = document.getElementById("wfTotal");
  if (!elQ || !elO) return;

  var wfStep = 0;
  var wfAns = {};
  elTotal.textContent = WF_STEPS.length;

  function wineProfile(w) {
    return w.p || {};
  }

  function wimg(id) {
    if (typeof window.wimg === "function") return window.wimg(id);
    return "img/w" + id + ".jpg";
  }

  function typeScore(w) {
    var weight = 38;
    if (w.type === wfAns.type) return { s: weight, r: "přesná barva" };
    if (
      (wfAns.type === "red" && w.type === "rose") ||
      (wfAns.type === "rose" && w.type === "red")
    )
      return { s: 16, r: "blízká barva" };
    if (
      (wfAns.type === "white" && w.type === "sparkling") ||
      (wfAns.type === "sparkling" && w.type === "white")
    )
      return { s: 18, r: "blízká barva" };
    return { s: 0, r: null };
  }

  function numScore(user, val, weight, labels) {
    if (typeof val !== "number" || typeof user !== "number") return { s: 0, r: null };
    var d = Math.abs(user - val);
    var s = Math.max(0, weight - (weight / 2) * d);
    return { s: s, r: d === 0 && labels ? labels[val] : d <= 0.5 ? labels && labels[val] : null };
  }

  function scoreWine(w) {
    var p = wineProfile(w);
    var max = 0;
    var sc = 0;
    var why = [];

    function add(block, reason) {
      max += block.weight;
      sc += block.s;
      if (reason && block.s >= block.weight * 0.75) why.push(reason);
    }

    var t = typeScore(w);
    add({ weight: 38, s: t.s }, t.r);

    add(
      {
        weight: 10,
        s:
          p.mood && p.mood.indexOf(wfAns.moment) > -1
            ? 10
            : wfAns.moment === "dinner" && p.mood && p.mood.indexOf("solo") > -1
              ? 5
              : 0,
      },
      wfAns.moment === "aperitiv"
        ? "aperitivní profil"
        : wfAns.moment === "celebration"
          ? "slavnostní charakter"
          : wfAns.moment === "gift"
            ? "dárková láhev"
            : "večerní společník"
    );

    add(
      {
        weight: 8,
        s:
          wfAns.pairing && w.pairing.indexOf(wfAns.pairing) > -1
            ? 8
            : wfAns.pairing === "solo" && p.mood && p.mood.indexOf("solo") > -1
              ? 6
              : wfAns.pairing === "maso" && w.pairing.indexOf("syr") > -1
                ? 4
                : 0,
      },
      wfAns.pairing === "solo" ? "víno na samotné vychutnání" : "ladí se k jídlu"
    );

    add(
      {
        weight: 12,
        s:
          p.fr === wfAns.fruit
            ? 12
            : (p.fr === "ripe" && wfAns.fruit === "fresh") || (p.fr === "fresh" && wfAns.fruit === "ripe")
              ? 6
              : 0,
      },
      { fresh: "čerstvé ovoce", ripe: "zralé ovoce", dried: "sušené ovoce" }[p.fr]
    );

    var sweet = numScore(wfAns.sweet, w.sweet, 12, ["suché", "polosuché", "sladší"]);
    add({ weight: 12, s: sweet.s }, sweet.r);

    var body = numScore(wfAns.body, w.body, 12, ["jemné tělo", "vyvážené tělo", "plné tělo"]);
    add({ weight: 12, s: body.s }, body.r);

    var ac = numScore(wfAns.acidity, p.ac, 10, ["měkká kyselina", "vyvážená kyselina", "živá kyselina"]);
    add({ weight: 10, s: ac.s }, ac.r);

    var aromaWeight = 12;
    var aromaHit = 0;
    if (w.aromas && w.aromas.indexOf(wfAns.aroma) > -1) aromaHit = aromaWeight;
    else if (wfAns.aroma === "floral" && w.aromas && w.aromas.indexOf("herbal") > -1) aromaHit = aromaWeight * 0.8;
    else if (wfAns.aroma === "woody" && w.aromas && w.aromas.indexOf("spicy") > -1) aromaHit = aromaWeight * 0.8;
    else if (wfAns.aroma === "mineral" && p.mn >= 1) aromaHit = aromaWeight;
    else if (wfAns.aroma === "woody" && p.ok >= 1) aromaHit = aromaWeight * 0.7;
    add(
      { weight: aromaWeight, s: aromaHit },
      wfAns.aroma === "fruity"
        ? "ovocná aromatika"
        : wfAns.aroma === "floral"
        ? "květinové tóny"
        : wfAns.aroma === "woody"
          ? "dřevo a koření"
          : "minerální čistota"
    );

    var tannin = numScore(wfAns.tannin, p.tn, 12, [
      "jemná tříslovina",
      "vyvážená tříslovina",
      "pevná tříslovina",
    ]);
    add({ weight: 12, s: tannin.s }, tannin.r);

    var adv = numScore(wfAns.adventure, p.adv, 10, [
      "klasická italská volba",
      "objevná láhev",
      "výrazná hloubka",
    ]);
    add({ weight: 10, s: adv.s }, adv.r);

    var cx = numScore(wfAns.adventure, p.cx, 6, null);
    add({ weight: 6, s: cx.s }, wfAns.adventure >= 2 && p.cx >= 2 ? "komplexní závěr" : null);

    var pct = max ? Math.round((sc / max) * 100) : 0;
    why = why.filter(function (x, i, a) {
      return x && a.indexOf(x) === i;
    }).slice(0, 4);
    return { pct: pct, why: why, p: p };
  }

  function bar(v, max) {
    max = max || 2;
    return '<div class="tr"><i style="width:' + Math.round(((v + 1) / (max + 1)) * 100) + '%"></i></div>';
  }

  function tasteBars(w, p) {
    return (
      '<div class="wfr-taste">' +
      '<div class="wfr-bar"><span>Sladkost</span>' +
      bar(w.sweet) +
      "</div>" +
      '<div class="wfr-bar"><span>Tělo</span>' +
      bar(w.body) +
      "</div>" +
      '<div class="wfr-bar"><span>Kyselina</span>' +
      bar(p.ac || 0) +
      "</div>" +
      '<div class="wfr-bar"><span>Tanin</span>' +
      bar(p.tn || 0) +
      "</div>" +
      '<div class="wfr-bar"><span>Dub</span>' +
      bar(p.ok || 0) +
      "</div>" +
      '<div class="wfr-bar"><span>Minerál</span>' +
      bar(p.mn || 0) +
      "</div>" +
      "</div>"
    );
  }

  function renderStep() {
    var s = WF_STEPS[wfStep];
    elQ.textContent = s.q;
    if (elHint) elHint.textContent = s.hint || "";
    elO.innerHTML = "";
    elO.className = "wf-opts" + (s.opts.length === 3 ? " wf-opts-3" : "");
    s.opts.forEach(function (o) {
      var b = document.createElement("button");
      b.className = "wf-opt";
      b.innerHTML = "<span><b>" + o.b + "</b><small>" + o.s + "</small></span>";
      b.addEventListener("click", function () {
        wfAns[s.key] = o.v;
        next();
      });
      elO.appendChild(b);
    });
    elNum.textContent = wfStep + 1;
    elProg.style.width = Math.round((wfStep / WF_STEPS.length) * 100 + 6) + "%";
    elBack.hidden = wfStep === 0;
    elQuiz.classList.remove("wf-done");
  }

  function next() {
    if (wfStep < WF_STEPS.length - 1) {
      wfStep++;
      renderStep();
    } else finish();
  }

  elBack.addEventListener("click", function () {
    if (wfStep > 0) {
      wfStep--;
      renderStep();
    }
  });

  function finish() {
    var eligible = WINES.filter(function (w) { return w.type === wfAns.type; });
    if (!eligible.length) eligible = WINES;
    var ranked = eligible.map(function (w) {
      var r = scoreWine(w);
      return { w: w, pct: r.pct, why: r.why, p: r.p };
    }).sort(function (a, b) {
      return b.pct - a.pct;
    });

    var top = ranked[0];
    var alts = ranked.slice(1, 3);
    var w = top.w;
    var whyTxt = top.why.length
      ? "<span>" + top.why.join(" · ") + "</span>"
      : "<span>profil vyladěný na vaše odpovědi</span>";

    elQuiz.hidden = true;
    elRes.hidden = false;
    elRes.innerHTML =
      '<div class="wf-result-head">' +
      '<div class="wf-match-ring">' +
      top.pct +
      "<small>%</small></div>" +
      '<div class="match">Chuťový profil · shoda s vašimi odpověďmi</div>' +
      "</div>" +
      '<div class="wfr-card">' +
      '<div class="wfr-bottle"><div class="ph"><span class="ph-tag">' +
      (window.VINI_IMAGES && window.VINI_IMAGES[w.id] ? "Produktová fotografie" : "Fotografii připravujeme") +
      '</span></div><img class="rimg" src="' +
      wimg(w.id) +
      '" alt="" onerror="this.remove()"></div>' +
      '<div class="wfr-info">' +
      "<h3>" +
      w.name +
      "</h3>" +
      '<div class="reg">' +
      w.region +
      " · " +
      w.grape +
      "</div>" +
      tasteBars(w, top.p) +
      '<div class="wfr-why">Proč sedí: ' +
      whyTxt +
      "</div>" +
      '<p class="wfr-desc">' +
      w.desc +
      "</p>" +
      '<div class="wfr-foot"><span class="wfr-price">Cena na dotaz</span>' +
      '<a class="btn btn-gold" style="padding:13px 24px" href="' +
      window.viniContactHref(w) +
      '">Mám zájem</a></div>' +
      "</div>" +
      "</div>" +
      '<div class="wfr-alts-label">Další blízké shody</div>' +
      '<div class="wfr-alts">' +
      alts
        .map(function (a) {
          return (
            '<button class="wfr-alt" type="button" data-wid="' +
            a.w.id +
            '"><b>' +
            a.w.name +
            "</b><small>shoda " +
            a.pct +
            " % · " +
            a.w.region +
            "</small></button>"
          );
        })
        .join("") +
      "</div>" +
      '<button class="wf-restart" id="wfRestart" type="button">Projít znovu — jiná nálada, jiná láhev</button>';

    elRes.querySelectorAll(".wfr-alt").forEach(function (btn) {
      btn.addEventListener("click", function () {
        var id = +btn.getAttribute("data-wid");
        var pick = ranked.filter(function (x) {
          return x.w.id === id;
        })[0];
        if (!pick) return;
        wfAns._preview = id;
        showPick(pick, ranked);
      });
    });

    document.getElementById("wfRestart").addEventListener("click", restart);
  }

  function showPick(pick, ranked) {
    var w = pick.w;
    var whyTxt = pick.why.length
      ? "<span>" + pick.why.join(" · ") + "</span>"
      : "<span>profil vyladěný na vaše odpovědi</span>";
    elRes.querySelector(".wf-match-ring").innerHTML = pick.pct + "<small>%</small>";
    elRes.querySelector(".wfr-card").outerHTML =
      '<div class="wfr-card">' +
      '<div class="wfr-bottle"><div class="ph"><span class="ph-tag">' +
      (window.VINI_IMAGES && window.VINI_IMAGES[w.id] ? "Produktová fotografie" : "Fotografii připravujeme") +
      '</span></div><img class="rimg" src="' +
      wimg(w.id) +
      '" alt="" onerror="this.remove()"></div>' +
      '<div class="wfr-info">' +
      "<h3>" +
      w.name +
      "</h3>" +
      '<div class="reg">' +
      w.region +
      " · " +
      w.grape +
      "</div>" +
      tasteBars(w, pick.p) +
      '<div class="wfr-why">Proč sedí: ' +
      whyTxt +
      "</div>" +
      '<p class="wfr-desc">' +
      w.desc +
      "</p>" +
      '<div class="wfr-foot"><span class="wfr-price">Cena na dotaz</span>' +
      '<a class="btn btn-gold" style="padding:13px 24px" href="' +
      window.viniContactHref(w) +
      '">Mám zájem</a></div>' +
      "</div>" +
      "</div>";
  }

  function restart() {
    wfStep = 0;
    wfAns = {};
    elRes.hidden = true;
    elQuiz.hidden = false;
    renderStep();
  }

  renderStep();
})();

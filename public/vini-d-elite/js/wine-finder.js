/* Vini d'Elite — Wine Finder (interní profil vín, parametry mimo e-shop) */
(function () {
  var WINES = window.WINES;
  if (!WINES) return;

  var WF_STEPS = [
    {
      key: "type",
      q: "Jakou barvu dnes máte chuť?",
      hint: "První krok — barva určuje směr celého profilu.",
      opts: [
        { b: "Červené", s: "Struktura, tanin, hloubka", v: "red" },
        { b: "Bílé", s: "Svěžest, lehkost, minerál", v: "white" },
        { b: "Růžové", s: "Šťavnaté a společenské", v: "rose" },
        { b: "Šumivé", s: "Perlivost a slavnostní nálada", v: "sparkling" },
      ],
    },
    {
      key: "moment",
      q: "Kdy a proč ho otevřete?",
      hint: "Stejné víno jinak sedí k večeru, dárku i aperitivu.",
      opts: [
        { b: "Aperitiv", s: "Před jídlem, lehká konverzace", v: "aperitiv" },
        { b: "Večeře u stolu", s: "K jídlu a dlouhému rozhovoru", v: "dinner" },
        { b: "Oslava", s: "Slavnostní večer, něco výjimečného", v: "celebration" },
        { b: "Dárek / sbírka", s: "Láhev s příběhem a charakterem", v: "gift" },
      ],
    },
    {
      key: "pairing",
      q: "K čemu ho ladíte?",
      hint: "Párování je polovina chuti — stejně důležité jako barva.",
      opts: [
        { b: "K masu", s: "Steak, zvěřina, gril", v: "maso" },
        { b: "K rybě", s: "Ryby, mořské plody", v: "ryba" },
        { b: "K sýru", s: "Sýry, uzeniny, tapas", v: "syr" },
        { b: "Jen tak", s: "Sólo, bez jídla", v: "solo" },
      ],
    },
    {
      key: "fruit",
      q: "Jaké ovoce v něm hledáte?",
      hint: "Čerstvé třešně, zralé broskve nebo sušené fíky — to je zásadní rozdíl.",
      opts: [
        { b: "Čerstvé a svěží", s: "Citrus, jablko, jahoda", v: "fresh" },
        { b: "Zralé a šťavnaté", s: "Broskev, třešeň, švestka", v: "ripe" },
        { b: "Sušené a koncentrované", s: "Fík, rozinka, povidla", v: "dried" },
      ],
    },
    {
      key: "sweet",
      q: "Jak sladké?",
      hint: "Suchost není jen chuť — je to pocit v ústech po doušku.",
      opts: [
        { b: "Suché", s: "Bez zbytkového cukru", v: 0 },
        { b: "Polosuché", s: "Jemný náznak sladka", v: 1 },
        { b: "Sladší", s: "Výrazně ovocné a hřejivé", v: 2 },
      ],
    },
    {
      key: "body",
      q: "Jaký charakter v ústech?",
      hint: "Tělo a tanin — lehkost hedvábí, nebo struktura, která drží jídlo.",
      opts: [
        { b: "Jemné a hebké", s: "Kulaté, bez výrazného taninu", v: 0 },
        { b: "Vyvážené", s: "Tak akorát — nic nepřebíjí", v: 1 },
        { b: "Plné a strukturované", s: "Tanin, hloubka, síla", v: 2 },
      ],
    },
    {
      key: "acidity",
      q: "Jakou svěžest hledáte?",
      hint: "Kyselina probouzí chuť — od jemné po ostře živou.",
      opts: [
        { b: "Měkká a kulatá", s: "Hřejivé, bez ostření", v: 0 },
        { b: "Vyvážená", s: "Svěží, ale ne řezavá", v: 1 },
        { b: "Živá a mineralní", s: "Citrus, salinita, tah", v: 2 },
      ],
    },
    {
      key: "aroma",
      q: "Co vás v aromatu láká nejvíc?",
      hint: "Květiny, koření nebo dub — každé víno má svůj jazyk.",
      opts: [
        { b: "Květiny a byliny", s: "Fialky, heřmánek, svěžest", v: "floral" },
        { b: "Koření a dřevo", s: "Cedr, tabák, vanilka", v: "woody" },
        { b: "Minerál a čistota", s: "Křída, mořská sůl, kámen", v: "mineral" },
      ],
    },
    {
      key: "intensity",
      q: "Spíš světlé, nebo hluboké?",
      hint: "Intenzita barvy často odráží koncentraci chuti.",
      opts: [
        { b: "Světlé a lehké", s: "Pití bez námahy", v: 0 },
        { b: "Uprostřed", s: "Vyvážená hloubka", v: 1 },
        { b: "Tmavé a koncentrované", s: "Sytost, vrstvy, dlouhý závěr", v: 2 },
      ],
    },
    {
      key: "adventure",
      q: "Co od vína dnes chcete?",
      hint: "Poslední otázka — od klasiky po odvážný objev.",
      opts: [
        { b: "Jistotu a klasiku", s: "Osvědčené oblasti a odrůdy", v: 0 },
        { b: "Něco nového", s: "Zajímavá oblast, nový profil", v: 1 },
        { b: "Odvahu a hloubku", s: "Výrazné, pamětihodné lahve", v: 2 },
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
        s: wfAns.pairing && w.pairing.indexOf(wfAns.pairing) > -1 ? 8 : wfAns.pairing === "solo" ? 3 : 0,
      },
      "ladí se k jídlu"
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

    var aromaMap = { floral: "floral", woody: "woody", mineral: "mn" };
    var aromaWeight = 12;
    var aromaHit = 0;
    if (wfAns.aroma === "floral" && w.tone === "floral") aromaHit = aromaWeight;
    else if (wfAns.aroma === "woody" && w.tone === "woody") aromaHit = aromaWeight;
    else if (wfAns.aroma === "mineral" && p.mn >= 1) aromaHit = aromaWeight;
    else if (wfAns.aroma === "woody" && p.ok >= 1) aromaHit = aromaWeight * 0.7;
    else if (wfAns.aroma === "floral" && p.sp === 0 && w.tone === "fruity") aromaHit = aromaWeight * 0.45;
    add(
      { weight: aromaWeight, s: aromaHit },
      wfAns.aroma === "floral"
        ? "květinové tóny"
        : wfAns.aroma === "woody"
          ? "dřevo a koření"
          : "minerální čistota"
    );

    var intensity = numScore(wfAns.intensity, w.intensity, 10, ["světlá intenzita", "střední intenzita", "hluboká intenzita"]);
    add({ weight: 10, s: intensity.s }, intensity.r);

    var adv = numScore(wfAns.adventure, p.adv, 10, ["klasický profil", "objevná láhev", "výrazná hloubka"]);
    add({ weight: 10, s: adv.s }, adv.r);

    var tannin = numScore(wfAns.body, p.tn, 8, null);
    add({ weight: 8, s: tannin.s }, wfAns.body >= 2 && p.tn >= 2 ? "tanin, který drží" : null);

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
    var ranked = WINES.map(function (w) {
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
      '<div class="wfr-bottle"><img class="rimg" src="' +
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
      '<div class="wfr-foot"><span class="wfr-price">' +
      w.price.toLocaleString("cs-CZ") +
      " Kč</span>" +
      '<button class="btn btn-gold" style="padding:13px 24px" onclick="addToCart(' +
      w.id +
      ');openCart()">Přidat do košíku</button></div>' +
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
      '<div class="wfr-bottle"><img class="rimg" src="' +
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
      '<div class="wfr-foot"><span class="wfr-price">' +
      w.price.toLocaleString("cs-CZ") +
      " Kč</span>" +
      '<button class="btn btn-gold" style="padding:13px 24px" onclick="addToCart(' +
      w.id +
      ');openCart()">Přidat do košíku</button></div>' +
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

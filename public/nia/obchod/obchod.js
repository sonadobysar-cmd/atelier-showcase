(function () {
  var state = { industries: [], products: [], type: "template", industry: "" };

  var tabs = document.getElementById("shopTabs");
  var filters = document.getElementById("shopFilters");
  var grid = document.getElementById("shopGrid");
  var empty = document.getElementById("shopEmpty");
  if (!tabs || !grid) return;

  function industryLabel(id) {
    for (var i = 0; i < state.industries.length; i++) {
      if (state.industries[i].id === id) return state.industries[i].label;
    }
    return id;
  }

  function renderFilters() {
    if (!filters) return;
    var html = '<button type="button" class="pill on" data-industry="">Vše</button>';
    state.industries.forEach(function (ind) {
      var has = state.products.some(function (p) {
        return p.industryId === ind.id;
      });
      if (!has) return;
      html +=
        '<button type="button" class="pill" data-industry="' +
        ind.id +
        '">' +
        ind.label +
        "</button>";
    });
    filters.innerHTML = html;
    filters.querySelectorAll(".pill").forEach(function (btn) {
      btn.addEventListener("click", function () {
        state.industry = btn.getAttribute("data-industry") || "";
        filters.querySelectorAll(".pill").forEach(function (b) {
          b.classList.toggle("on", b === btn);
        });
        renderGrid();
      });
    });
  }

  function renderGrid() {
    var list = state.products.filter(function (p) {
      return p.type === state.type && (!state.industry || p.industryId === state.industry);
    });
    if (!list.length) {
      grid.innerHTML = "";
      if (empty) empty.hidden = false;
      return;
    }
    if (empty) empty.hidden = true;
    grid.innerHTML = list
      .map(function (p) {
        return (
          '<article class="card">' +
          '<div class="card-img"><img src="' +
          p.imageUrl +
          '" alt="' +
          p.name +
          '" loading="lazy" width="400" height="500"></div>' +
          '<div class="card-body">' +
          '<span class="tag">' +
          industryLabel(p.industryId) +
          "</span>" +
          "<h3>" +
          p.name +
          "</h3>" +
          (p.description ? "<p>" + p.description + "</p>" : "") +
          (p.priceLabel ? '<b class="price">' + p.priceLabel + "</b>" : "") +
          '<a href="/nia#kontakt" class="card-btn">Mám zájem</a>' +
          "</div></article>"
        );
      })
      .join("");
  }

  function load() {
    fetch("/api/nia/cms?type=" + encodeURIComponent(state.type), { cache: "no-store" })
      .then(function (r) {
        return r.json();
      })
      .then(function (d) {
        if (!d.ok) throw new Error("load failed");
        state.industries = d.industries || [];
        state.products = d.products || [];
        renderFilters();
        renderGrid();
      })
      .catch(function () {
        if (empty) {
          empty.hidden = false;
          empty.textContent = "Katalog se nepodařilo načíst. Obnov stránku.";
        }
      });
  }

  tabs.querySelectorAll("[data-type]").forEach(function (btn) {
    btn.addEventListener("click", function () {
      state.type = btn.getAttribute("data-type") || "template";
      state.industry = "";
      tabs.querySelectorAll("[data-type]").forEach(function (b) {
        b.classList.toggle("on", b === btn);
      });
      load();
    });
  });

  load();
})();

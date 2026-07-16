(function () {
  var state = { industries: [], products: [], type: "template", industry: "", buying: null };

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

  function priceText(p) {
    if (typeof p.priceCzk === "number" && p.priceCzk > 0) {
      return p.priceCzk.toLocaleString("cs-CZ") + " Kč";
    }
    return p.priceLabel || "Na dotaz";
  }

  function esc(s) {
    return String(s || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function buyProduct(productId, btn) {
    if (state.buying) return;
    state.buying = productId;
    if (btn) {
      btn.disabled = true;
      btn.textContent = "Přesměrování…";
    }
    fetch("/api/nia/shop/checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ productId: productId }),
    })
      .then(function (r) {
        return r.json();
      })
      .then(function (d) {
        if (d.ok && d.url) {
          window.location.href = d.url;
          return;
        }
        throw new Error(d.error || "Platbu se nepodařilo spustit.");
      })
      .catch(function (err) {
        alert(err.message || "Chyba. Zkus to znovu nebo napiš přes kontakt.");
        state.buying = null;
        if (btn) {
          btn.disabled = false;
          btn.textContent = "Koupit";
        }
      });
  }

  function renderFilters() {
    if (!filters) return;
    var html = '<button type="button" class="shop-pill on" data-industry="">Vše</button>';
    state.industries.forEach(function (ind) {
      var has = state.products.some(function (p) {
        return p.industryId === ind.id;
      });
      if (!has) return;
      html +=
        '<button type="button" class="shop-pill" data-industry="' +
        esc(ind.id) +
        '">' +
        esc(ind.label) +
        "</button>";
    });
    filters.innerHTML = html;
    filters.querySelectorAll(".shop-pill").forEach(function (btn) {
      btn.addEventListener("click", function () {
        state.industry = btn.getAttribute("data-industry") || "";
        filters.querySelectorAll(".shop-pill").forEach(function (b) {
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
      .map(function (p, i) {
        var price = priceText(p);
        var cta = p.purchasable
          ? '<button type="button" class="shop-btn" data-buy="' + esc(p.id) + '">Koupit</button>'
          : '<a href="/nia#kontakt" class="shop-btn shop-btn--ghost">Mám zájem</a>';
        return (
          '<article class="shop-card reveal" style="transition-delay:' +
          Math.min(i * 0.06, 0.36) +
          's">' +
          '<div class="shop-card-visual">' +
          '<span class="shop-card-shine"></span>' +
          '<span class="shop-card-tag">' +
          esc(industryLabel(p.industryId)) +
          "</span>" +
          '<img src="' +
          esc(p.imageUrl) +
          '" alt="' +
          esc(p.name) +
          '" loading="lazy" width="400" height="500">' +
          "</div>" +
          '<div class="shop-card-body">' +
          "<h3>" +
          esc(p.name) +
          "</h3>" +
          (p.description ? "<p>" + esc(p.description) + "</p>" : "<p>&nbsp;</p>") +
          '<div class="shop-card-foot">' +
          '<span class="shop-price">' +
          esc(price) +
          "</span>" +
          cta +
          "</div></div></article>"
        );
      })
      .join("");

    grid.querySelectorAll("[data-buy]").forEach(function (btn) {
      btn.addEventListener("click", function () {
        buyProduct(btn.getAttribute("data-buy"), btn);
      });
    });

    if (window.IntersectionObserver) {
      var obs = new IntersectionObserver(
        function (es) {
          es.forEach(function (e) {
            if (e.isIntersecting) e.target.classList.add("in");
          });
        },
        { threshold: 0.08, rootMargin: "0px 0px -30px 0px" },
      );
      grid.querySelectorAll(".shop-card.reveal").forEach(function (el) {
        obs.observe(el);
      });
    } else {
      grid.querySelectorAll(".shop-card.reveal").forEach(function (el) {
        el.classList.add("in");
      });
    }
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
          empty.querySelector("span").textContent =
            "Katalog se nepodařilo načíst. Obnov stránku nebo napiš mi.";
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

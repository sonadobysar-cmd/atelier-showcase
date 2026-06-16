(function () {
  var nav = document.getElementById("nav");
  var navLinks = document.getElementById("navLinks");
  var burger = document.getElementById("burger");
  var navScrim = document.getElementById("navScrim");
  if (!navLinks || !burger) return;

  var style = document.createElement("style");
  style.textContent =
    "@media(max-width:980px){" +
    "html.nav-open,body.nav-open{overflow:hidden}" +
    ".nav-links.open{z-index:300!important;pointer-events:auto!important;touch-action:manipulation}" +
    ".nav-scrim{z-index:290!important;touch-action:manipulation}" +
    ".burger.open{z-index:301!important}" +
    ".nav-links.open a{display:flex;align-items:center;min-height:44px;width:100%;" +
    "pointer-events:auto;touch-action:manipulation;-webkit-tap-highlight-color:transparent;cursor:pointer}" +
    "}";
  document.head.appendChild(style);

  function normalizePath(path) {
    var p = String(path || "").split("#")[0].split("?")[0];
    p = p.replace(/\/index\.html$/i, "");
    if (!p || p === "/") return "/nia";
    return p.replace(/\/$/, "") || "/nia";
  }

  function currentPath() {
    return normalizePath(location.pathname);
  }

  function scrollToHash(id) {
    if (!id) return;
    var el = document.getElementById(id);
    if (!el) return;
    var navH = nav ? nav.offsetHeight : 72;
    var top = el.getBoundingClientRect().top + window.pageYOffset - navH - 12;
    window.scrollTo({ top: Math.max(0, top), behavior: "auto" });
  }

  function setMenuOpen(on) {
    navLinks.classList.toggle("open", on);
    burger.classList.toggle("open", on);
    document.documentElement.classList.toggle("nav-open", on);
    document.body.classList.toggle("nav-open", on);
    burger.setAttribute("aria-expanded", on ? "true" : "false");
    burger.setAttribute("aria-label", on ? "Zavřít menu" : "Otevřít menu");
    if (navScrim) {
      navScrim.hidden = !on;
      navScrim.style.display = on ? "block" : "";
    }
  }

  window.setNavOpen = setMenuOpen;

  function parseLink(href) {
    var h = (href || "").trim();
    if (!h || h === "#") return null;
    if (h.charAt(0) === "#") {
      return { path: currentPath(), hash: h.slice(1), external: false };
    }
    var i = h.indexOf("#");
    if (i > -1) {
      return {
        path: normalizePath(h.slice(0, i)),
        hash: h.slice(i + 1),
        external: normalizePath(h.slice(0, i)) !== currentPath(),
      };
    }
    return { path: normalizePath(h), hash: "", external: normalizePath(h) !== currentPath() };
  }

  function followLink(a) {
    var href = (a.getAttribute("href") || "").trim();
    var dest = parseLink(href);
    if (!dest) return;

    var wasOpen = navLinks.classList.contains("open");
    if (wasOpen) setMenuOpen(false);

    if (dest.path === currentPath() && dest.hash) {
      setTimeout(function () {
        scrollToHash(dest.hash);
        if (history.replaceState) {
          history.replaceState(null, "", "#" + dest.hash);
        } else {
          location.hash = dest.hash;
        }
      }, wasOpen ? 60 : 0);
      return;
    }

    if (dest.external || dest.path !== currentPath()) {
      var target = a.href;
      if (wasOpen) {
        setTimeout(function () {
          window.location.assign(target);
        }, 40);
      } else {
        window.location.assign(target);
      }
      return;
    }
  }

  if (nav) {
    window.addEventListener(
      "scroll",
      function () {
        if (document.body.classList.contains("nav-open")) return;
        nav.classList.toggle("scrolled", window.scrollY > 40);
      },
      { passive: true },
    );
  }

  burger.addEventListener("click", function (e) {
    e.preventDefault();
    setMenuOpen(!navLinks.classList.contains("open"));
  });

  if (navScrim) {
    navScrim.addEventListener("click", function () {
      setMenuOpen(false);
    });
  }

  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && navLinks.classList.contains("open")) setMenuOpen(false);
  });

  function onNavLinkActivate(e) {
    var a = e.target.closest("a[href]");
    if (!a || !navLinks.contains(a)) return;
    var href = (a.getAttribute("href") || "").trim();
    var dest = parseLink(href);
    if (!dest) return;
    e.preventDefault();
    followLink(a);
  }

  navLinks.addEventListener("click", onNavLinkActivate, false);

  if (location.hash.length > 1) {
    var runHash = function () {
      setTimeout(function () {
        scrollToHash(location.hash.slice(1));
      }, 80);
    };
    if (document.readyState === "complete") runHash();
    else window.addEventListener("load", runHash);
  }
})();

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
  /* scrim must stay BELOW the open drawer — drawer lives inside .nav (z-index 200) */
    "body.nav-open .nav{z-index:320!important}" +
    "body.nav-open .nav-scrim{z-index:310!important;display:block!important}" +
    ".nav-links.open{z-index:321!important;pointer-events:auto!important;touch-action:manipulation}" +
    ".burger.open{z-index:322!important;position:relative}" +
    ".nav-links.open a{display:flex;align-items:center;min-height:44px;width:100%;" +
    "position:relative;z-index:1;pointer-events:auto;touch-action:manipulation;" +
    "-webkit-tap-highlight-color:rgba(255,255,255,.12);cursor:pointer}" +
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
    if (typeof window.niaRevealSection === "function") {
      window.niaRevealSection(id);
    }
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
      return { path: currentPath(), hash: h.slice(1), samePage: true };
    }
    var i = h.indexOf("#");
    if (i > -1) {
      var path = normalizePath(h.slice(0, i));
      return {
        path: path,
        hash: h.slice(i + 1),
        samePage: path === currentPath(),
      };
    }
    var pathOnly = normalizePath(h);
    return { path: pathOnly, hash: "", samePage: pathOnly === currentPath() };
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

  navLinks.addEventListener(
    "click",
    function (e) {
      var a = e.target.closest("a[href]");
      if (!a || !navLinks.contains(a)) return;

      var dest = parseLink((a.getAttribute("href") || "").trim());
      if (!dest) return;

      var menuWasOpen = navLinks.classList.contains("open");
      if (menuWasOpen) setMenuOpen(false);

      if (dest.samePage && dest.hash) {
        e.preventDefault();
        scrollToHash(dest.hash);
        if (history.replaceState) {
          history.replaceState(null, "", "#" + dest.hash);
        } else {
          location.hash = dest.hash;
        }
        return;
      }

      if (dest.samePage && !dest.hash) {
        e.preventDefault();
        return;
      }

      /* cross-page: native <a> navigation — most reliable on iOS Safari */
    },
    false,
  );

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

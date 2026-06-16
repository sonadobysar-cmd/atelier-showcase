(function () {
  var nav = document.getElementById("nav");
  var navLinks = document.getElementById("navLinks");
  var burger = document.getElementById("burger");
  var navScrim = document.getElementById("navScrim");
  if (!navLinks || !burger) return;

  var isMobile = window.matchMedia("(max-width:980px)").matches;
  var navScrollY = 0;

  var style = document.createElement("style");
  style.textContent =
    "@media(max-width:980px){" +
    "html.nav-open,body.nav-open{overflow:hidden;height:100%}" +
    ".nav-links.open{z-index:300!important;pointer-events:auto!important}" +
    ".nav-scrim{z-index:290!important}" +
    ".burger.open{z-index:301!important;position:relative}" +
    ".nav-links.open a{display:flex;align-items:center;min-height:44px;width:100%;pointer-events:auto;-webkit-tap-highlight-color:transparent}" +
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
    window.scrollTo({ top: Math.max(0, top), behavior: isMobile ? "auto" : "smooth" });
  }

  function lockScroll() {
    navScrollY = window.pageYOffset || document.documentElement.scrollTop || 0;
    document.documentElement.classList.add("nav-open");
    document.body.classList.add("nav-open");
  }

  function unlockScroll() {
    document.documentElement.classList.remove("nav-open");
    document.body.classList.remove("nav-open");
    document.body.style.position = "";
    document.body.style.top = "";
    document.body.style.left = "";
    document.body.style.right = "";
    document.body.style.width = "";
  }

  function setMenuOpen(on) {
    if (on) {
      lockScroll();
      navLinks.classList.add("open");
      burger.classList.add("open");
      burger.setAttribute("aria-expanded", "true");
      burger.setAttribute("aria-label", "Zavřít menu");
      if (navScrim) {
        navScrim.hidden = false;
        navScrim.style.display = "block";
      }
      return;
    }
    navLinks.classList.remove("open");
    burger.classList.remove("open");
    burger.setAttribute("aria-expanded", "false");
    burger.setAttribute("aria-label", "Otevřít menu");
    if (navScrim) {
      navScrim.hidden = true;
      navScrim.style.display = "";
    }
    unlockScroll();
  }

  window.setNavOpen = setMenuOpen;

  function parseHref(href) {
    var h = (href || "").trim();
    if (!h || h === "#") return null;
    if (h.charAt(0) === "#") {
      return { path: currentPath(), hash: h.slice(1), raw: h };
    }
    var hashIdx = h.indexOf("#");
    if (hashIdx > -1) {
      return {
        path: normalizePath(h.slice(0, hashIdx) || location.pathname),
        hash: h.slice(hashIdx + 1),
        raw: h,
      };
    }
    return { path: normalizePath(h), hash: "", raw: h };
  }

  function goHref(raw) {
    if (!raw) return;
    setMenuOpen(false);
    if (raw.charAt(0) === "#") {
      scrollToHash(raw.slice(1));
      return;
    }
    var dest = parseHref(raw);
    if (!dest) return;
    if (dest.path === currentPath() && dest.hash) {
      scrollToHash(dest.hash);
      return;
    }
    window.location.href = raw;
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

  function onBurger(e) {
    e.preventDefault();
    e.stopPropagation();
    setMenuOpen(!navLinks.classList.contains("open"));
  }

  var burgerTouched = false;
  burger.addEventListener("touchend", function (e) {
    burgerTouched = true;
    onBurger(e);
  }, { passive: false });
  burger.addEventListener("click", function (e) {
    if (burgerTouched) {
      burgerTouched = false;
      return;
    }
    onBurger(e);
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
      var a = e.target.closest("a");
      if (!a || !navLinks.contains(a)) return;

      var href = (a.getAttribute("href") || "").trim();
      if (!href || href === "#") return;

      if (!navLinks.classList.contains("open")) {
        var dest = parseHref(href);
        if (dest && dest.path === currentPath() && dest.hash) {
          e.preventDefault();
          scrollToHash(dest.hash);
        }
        return;
      }

      e.preventDefault();
      e.stopPropagation();
      goHref(href);
    },
    false,
  );

  if (location.hash.length > 1) {
    window.addEventListener("load", function () {
      setTimeout(function () {
        scrollToHash(location.hash.slice(1));
      }, 120);
    });
  }
})();

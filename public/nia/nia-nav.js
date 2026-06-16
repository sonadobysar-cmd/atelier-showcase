(function () {
  var nav = document.getElementById("nav");
  var navLinks = document.getElementById("navLinks");
  var burger = document.getElementById("burger");
  var navScrim = document.getElementById("navScrim");
  if (!navLinks || !burger) return;

  var navScrollY = 0;
  var linkTouched = false;

  var style = document.createElement("style");
  style.textContent =
    "@media(max-width:980px){" +
    ".nav-links.open{z-index:220!important}" +
    ".burger.open{z-index:221}" +
    ".nav-links.open a{display:flex;align-items:center;min-height:44px;width:100%;-webkit-tap-highlight-color:transparent}" +
    "}";
  document.head.appendChild(style);

  function unlockBody() {
    document.body.style.position = "";
    document.body.style.top = "";
    document.body.style.left = "";
    document.body.style.right = "";
    document.body.style.width = "";
    document.body.classList.remove("nav-open");
  }

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
    window.scrollTo({ top: Math.max(0, top), behavior: "smooth" });
  }

  function closeMenu() {
    if (!navLinks.classList.contains("open")) return;
    navLinks.classList.remove("open");
    burger.classList.remove("open");
    burger.setAttribute("aria-expanded", "false");
    burger.setAttribute("aria-label", "Otevřít menu");
    if (navScrim) navScrim.hidden = true;
    unlockBody();
    window.scrollTo(0, navScrollY);
  }

  window.setNavOpen = function (on) {
    if (on) {
      navScrollY = window.pageYOffset || document.documentElement.scrollTop || 0;
      navLinks.classList.add("open");
      burger.classList.add("open");
      document.body.classList.add("nav-open");
      burger.setAttribute("aria-expanded", "true");
      burger.setAttribute("aria-label", "Zavřít menu");
      if (navScrim) navScrim.hidden = false;
      document.body.style.position = "fixed";
      document.body.style.top = "-" + navScrollY + "px";
      document.body.style.left = "0";
      document.body.style.right = "0";
      document.body.style.width = "100%";
      return;
    }
    closeMenu();
  };

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

  function followNav(href, e) {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    var dest = parseHref(href);
    if (!dest) return;

    var samePage = dest.path === currentPath();
    var wasOpen = navLinks.classList.contains("open");

    if (samePage && dest.hash) {
      if (wasOpen) closeMenu();
      setTimeout(function () {
        scrollToHash(dest.hash);
      }, wasOpen ? 100 : 0);
      return;
    }

    if (samePage) {
      if (wasOpen) closeMenu();
      return;
    }

    if (wasOpen) {
      navLinks.classList.remove("open");
      burger.classList.remove("open");
      burger.setAttribute("aria-expanded", "false");
      burger.setAttribute("aria-label", "Otevřít menu");
      if (navScrim) navScrim.hidden = true;
      unlockBody();
    }
    window.location.assign(dest.raw);
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
    setNavOpen(!navLinks.classList.contains("open"));
  }

  var burgerTouched = false;
  burger.addEventListener(
    "touchend",
    function (e) {
      burgerTouched = true;
      onBurger(e);
    },
    { passive: false },
  );
  burger.addEventListener("click", function (e) {
    if (burgerTouched) {
      burgerTouched = false;
      return;
    }
    onBurger(e);
  });

  if (navScrim) navScrim.addEventListener("click", closeMenu);
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && navLinks.classList.contains("open")) closeMenu();
  });

  navLinks.querySelectorAll("a").forEach(function (a) {
    function onLink(e) {
      if (linkTouched && e.type === "click") {
        linkTouched = false;
        return;
      }
      if (e.type === "touchend") linkTouched = true;
      followNav(a.getAttribute("href"), e);
    }
    a.addEventListener("touchend", onLink, { passive: false });
    a.addEventListener("click", onLink);
  });

  if (location.hash.length > 1) {
    window.addEventListener("load", function () {
      setTimeout(function () {
        scrollToHash(location.hash.slice(1));
      }, 200);
    });
  }
})();

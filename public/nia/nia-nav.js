(function () {
  var nav = document.getElementById("nav");
  var navLinks = document.getElementById("navLinks");
  var burger = document.getElementById("burger");
  var navScrim = document.getElementById("navScrim");
  if (!navLinks || !burger) return;

  var navScrollY = 0;

  function unlockBody() {
    document.body.style.position = "";
    document.body.style.top = "";
    document.body.style.left = "";
    document.body.style.right = "";
    document.body.style.width = "";
  }

  function normalizePath(path) {
    var p = (path || "").split("#")[0].replace(/\/index\.html$/i, "");
    if (!p || p === "/") return "/nia";
    return p.replace(/\/$/, "") || "/nia";
  }

  function currentPath() {
    return normalizePath(location.pathname);
  }

  function scrollToHash(id) {
    if (!id) return;
    requestAnimationFrame(function () {
      requestAnimationFrame(function () {
        var el = document.getElementById(id);
        if (!el) return;
        var navH = nav ? nav.offsetHeight : 80;
        var top = el.getBoundingClientRect().top + window.pageYOffset - navH - 12;
        window.scrollTo({ top: Math.max(0, top), behavior: "smooth" });
      });
    });
  }

  function closeMenuUI() {
    navLinks.classList.remove("open");
    burger.classList.remove("open");
    document.body.classList.remove("nav-open");
    burger.setAttribute("aria-expanded", "false");
    burger.setAttribute("aria-label", "Otevřít menu");
    if (navScrim) navScrim.hidden = true;
  }

  window.setNavOpen = function (on, opts) {
    opts = opts || {};
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

    closeMenuUI();
    unlockBody();
    window.scrollTo(0, navScrollY);
    if (opts.hash) scrollToHash(opts.hash);
  };

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

  function onBurgerTap(e) {
    e.preventDefault();
    e.stopPropagation();
    setNavOpen(!navLinks.classList.contains("open"));
  }

  var burgerTouched = false;
  burger.addEventListener(
    "touchend",
    function (e) {
      burgerTouched = true;
      onBurgerTap(e);
    },
    { passive: false },
  );
  burger.addEventListener("click", function (e) {
    if (burgerTouched) {
      burgerTouched = false;
      return;
    }
    onBurgerTap(e);
  });

  if (navScrim) navScrim.addEventListener("click", function () { setNavOpen(false); });
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && document.body.classList.contains("nav-open")) setNavOpen(false);
  });

  navLinks.querySelectorAll("a").forEach(function (a) {
    a.addEventListener("click", function (e) {
      var href = (a.getAttribute("href") || "").trim();
      if (!href || href === "#") return;

      var menuOpen = document.body.classList.contains("nav-open");

      if (href.charAt(0) === "#" && href.length > 1) {
        e.preventDefault();
        var id = href.slice(1);
        if (menuOpen) setNavOpen(false, { skipRestore: true, hash: id });
        else scrollToHash(id);
        return;
      }

      var hashIdx = href.indexOf("#");
      if (hashIdx > -1) {
        var pathPart = href.substring(0, hashIdx);
        var hash = href.substring(hashIdx + 1);
        var targetPath = normalizePath(pathPart || location.pathname);

        if (targetPath === currentPath() && hash) {
          e.preventDefault();
          if (menuOpen) setNavOpen(false, { skipRestore: true, hash: hash });
          else scrollToHash(hash);
          return;
        }

        e.preventDefault();
        closeMenuUI();
        unlockBody();
        window.location.href = href;
        return;
      }

      if (normalizePath(href) === currentPath()) {
        if (menuOpen) {
          e.preventDefault();
          setNavOpen(false);
        }
        return;
      }

      if (menuOpen) {
        e.preventDefault();
        closeMenuUI();
        unlockBody();
        window.location.href = href;
      }
    });
  });

  if (location.hash.length > 1) {
    window.addEventListener("load", function () {
      setTimeout(function () { scrollToHash(location.hash.slice(1)); }, 150);
    });
  }
})();

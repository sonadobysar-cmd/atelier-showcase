/* Sdílené mobilní menu — všechny stránky */
(function () {
  var b = document.getElementById('burger');
  var h = document.querySelector('.hd');
  if (!b || !h) return;

  var navScrollY = 0;

  function setNav(on) {
    h.classList.toggle('navopen', on);
    document.body.classList.toggle('navopen', on);
    b.setAttribute('aria-expanded', on ? 'true' : 'false');
    b.setAttribute('aria-label', on ? 'Zavřít menu' : 'Menu');
    if (on) {
      navScrollY = window.scrollY;
      document.body.style.position = 'fixed';
      document.body.style.top = '-' + navScrollY + 'px';
      document.body.style.left = '0';
      document.body.style.right = '0';
    } else {
      document.body.style.position = '';
      document.body.style.top = '';
      document.body.style.left = '';
      document.body.style.right = '';
      window.scrollTo(0, navScrollY);
    }
  }

  b.addEventListener('click', function (e) {
    e.stopPropagation();
    setNav(!h.classList.contains('navopen'));
  });

  document.addEventListener('click', function (e) {
    if (!h.classList.contains('navopen')) return;
    if (h.contains(e.target)) return;
    setNav(false);
  });

  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && h.classList.contains('navopen')) setNav(false);
  });

  Array.prototype.forEach.call(h.querySelectorAll('.hd-nav a'), function (a) {
    a.addEventListener('click', function () {
      setNav(false);
    });
  });
})();

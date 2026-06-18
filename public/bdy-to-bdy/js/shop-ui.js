/* BDY to BDY — UI: vyhledávání, účet, Bodyna, výběr velikosti, hotspoty */
(function (global) {
  var CSS =
    '.ui-scrim{position:fixed;inset:0;background:rgba(13,13,12,.42);backdrop-filter:blur(3px);z-index:200;opacity:0;pointer-events:none;transition:opacity .3s}' +
    '.ui-scrim.open{opacity:1;pointer-events:auto}' +
    '.ui-panel{position:fixed;z-index:201;background:var(--bg,#F6F6F4);box-shadow:0 24px 80px rgba(0,0,0,.18);transition:transform .35s cubic-bezier(.4,0,.2,1),opacity .35s}' +
    '.ui-panel--right{top:0;right:0;bottom:0;width:min(400px,94vw);transform:translateX(100%)}.ui-panel--right.open{transform:none}' +
    '.ui-panel--center{left:50%;top:50%;transform:translate(-50%,-46%) scale(.96);width:min(480px,92vw);max-height:min(86vh,640px);opacity:0;pointer-events:none;display:flex;flex-direction:column}' +
    '.ui-panel--center.open{transform:translate(-50%,-50%) scale(1);opacity:1;pointer-events:auto}' +
    '.ui-ph{padding:20px 22px;border-bottom:1px solid var(--line,#E5E5E2);display:flex;justify-content:space-between;align-items:center;gap:12px}' +
    '.ui-ph h3{font-family:var(--serif,Bodoni Moda,serif);font-size:1.25rem;font-weight:500;color:var(--ink,#0D0D0C)}' +
    '.ui-x{background:none;border:none;font-size:1.45rem;cursor:pointer;color:var(--ink,#0D0D0C);line-height:1;min-width:40px;min-height:40px}' +
    '.ui-body{padding:20px 22px;overflow-y:auto;flex:1}' +
    '.ui-inp{width:100%;font-family:var(--sans,Manrope,sans-serif);font-size:.95rem;padding:14px 14px;border:1px solid var(--line,#E5E5E2);background:#fff;color:var(--ink,#0D0D0C)}' +
    '.ui-inp:focus{outline:none;border-color:var(--ink,#0D0D0C)}' +
    '.srch-list{margin-top:16px;display:flex;flex-direction:column;gap:10px}' +
    '.srch-item{display:flex;gap:12px;align-items:center;padding:10px;border:1px solid var(--line,#E5E5E2);cursor:pointer;transition:border-color .2s,background .2s;text-align:left;background:#fff}' +
    '.srch-item:hover{border-color:var(--ink,#0D0D0C);background:#fafaf8}' +
    '.srch-thumb{width:52px;height:68px;flex:none;background:var(--card,#EFEFED);position:relative;overflow:hidden}' +
    '.srch-thumb img{position:absolute;inset:0;width:100%;height:100%;object-fit:cover}' +
    '.srch-item b{font-family:var(--sans);font-size:.9rem;color:var(--ink,#0D0D0C)}' +
    '.srch-item span{font-size:.78rem;color:var(--mut,#8E8E88)}' +
    '.srch-empty{color:var(--mut,#8E8E88);font-size:.9rem;padding:24px 0;text-align:center}' +
    '.acct-demo{background:var(--card,#EFEFED);padding:16px;margin-bottom:18px}' +
    '.acct-demo b{display:block;font-size:.95rem;color:var(--ink,#0D0D0C);margin-bottom:4px}' +
    '.acct-demo span{font-size:.82rem;color:var(--mut,#8E8E88)}' +
    '.acct-row{display:flex;justify-content:space-between;padding:12px 0;border-bottom:1px solid var(--line,#E5E5E2);font-size:.88rem}' +
    '.acct-note{font-size:.78rem;color:var(--mut,#8E8E88);margin-top:16px;line-height:1.5}' +
    '.size-grid{display:flex;flex-wrap:wrap;gap:8px;margin:16px 0 20px}' +
    '.size-opt{min-width:46px;padding:11px 14px;border:1px solid var(--line,#E5E5E2);background:#fff;font-family:var(--sans);font-size:.82rem;font-weight:600;cursor:pointer;transition:all .2s}' +
    '.size-opt:hover,.size-opt.on{border-color:var(--ink,#0D0D0C);background:var(--ink,#0D0D0C);color:var(--bg,#F6F6F4)}' +
    '.size-prod{display:flex;gap:12px;align-items:center;margin-bottom:8px}' +
    '.size-prod img{width:56px;height:72px;object-fit:cover;background:var(--card,#EFEFED)}' +
    '.size-prod h4{font-family:var(--sans);font-size:.92rem;font-weight:600}' +
    '.size-prod p{font-size:.8rem;color:var(--mut,#8E8E88)}' +
    '.bodyna-fab{position:fixed;right:22px;bottom:22px;z-index:180;width:58px;height:58px;border-radius:50%;border:none;cursor:pointer;background:var(--ink,#0D0D0C);color:#fff;box-shadow:0 10px 32px rgba(0,0,0,.28);font-family:var(--sans);font-size:.62rem;font-weight:700;letter-spacing:.04em;line-height:1.1;padding:0 6px;transition:transform .25s}' +
    '.bodyna-fab:hover{transform:scale(1.05)}' +
    '.bodyna-panel{position:fixed;right:22px;bottom:90px;z-index:181;width:min(360px,calc(100vw - 44px));height:min(480px,70vh);background:#fff;border:1px solid var(--line,#E5E5E2);box-shadow:0 20px 60px rgba(0,0,0,.2);display:flex;flex-direction:column;transform:translateY(12px) scale(.98);opacity:0;pointer-events:none;transition:opacity .3s,transform .3s}' +
    '.bodyna-panel.open{transform:none;opacity:1;pointer-events:auto}' +
    '.bodyna-h{padding:14px 16px;background:var(--ink,#0D0D0C);color:#fff;display:flex;justify-content:space-between;align-items:center}' +
    '.bodyna-h b{font-family:var(--serif);font-weight:500;font-size:1.05rem}' +
    '.bodyna-h small{display:block;font-size:.68rem;opacity:.7;font-family:var(--sans);font-weight:400;margin-top:2px}' +
    '.bodyna-msgs{flex:1;overflow-y:auto;padding:14px;display:flex;flex-direction:column;gap:10px;background:#fafaf8}' +
    '.bodyna-msg{max-width:88%;padding:10px 12px;font-size:.84rem;line-height:1.45;border-radius:2px}' +
    '.bodyna-msg.bot{background:#fff;border:1px solid var(--line,#E5E5E2);color:var(--ink2,#2A2A28);align-self:flex-start}' +
    '.bodyna-msg.user{background:var(--ink,#0D0D0C);color:#fff;align-self:flex-end}' +
    '.bodyna-in{display:flex;gap:8px;padding:12px;border-top:1px solid var(--line,#E5E5E2)}' +
    '.bodyna-in input{flex:1;border:1px solid var(--line,#E5E5E2);padding:10px 12px;font-family:var(--sans);font-size:.88rem}' +
    '.bodyna-in button{border:none;background:var(--ink,#0D0D0C);color:#fff;padding:10px 14px;font-size:.72rem;font-weight:600;letter-spacing:.08em;text-transform:uppercase;cursor:pointer}' +
    '.contact-servis{margin:28px auto 0;max-width:520px;padding-top:24px;border-top:1px solid rgba(255,255,255,.14)}' +
    '.contact-servis h3{font-family:var(--serif);font-size:1.15rem;color:#fff;font-weight:500;margin-bottom:10px}' +
    '.contact-servis p{font-size:.9rem;color:rgba(255,255,255,.72);line-height:1.7}' +
    '.contact-servis a{color:#fff;text-decoration:underline;text-underline-offset:3px}' +
    '.col{position:relative}.col .cc{position:relative;z-index:3;display:block}.col .spot{z-index:7}';

  function injectCSS() {
    if (document.getElementById('bdy-ui-css')) return;
    var s = document.createElement('style');
    s.id = 'bdy-ui-css';
    s.textContent = CSS;
    document.head.appendChild(s);
  }

  function czk(n) {
    return n.toLocaleString('cs-CZ') + ' Kč';
  }

  function find(id) {
    return global.BDY ? global.BDY.find(id) : null;
  }

  function img(id) {
    return global.IMG && global.IMG[id] ? global.IMG[id] : '';
  }

  var onAddToCart = null;
  var sizeCallback = null;
  var pickedSize = null;

  function ensureShell() {
    if (document.getElementById('bdyUiRoot')) return;
    injectCSS();
    var root = document.createElement('div');
    root.id = 'bdyUiRoot';
    root.innerHTML =
      '<div class="ui-scrim" id="uiScrim"></div>' +
      '<aside class="ui-panel ui-panel--right" id="searchPanel" aria-label="Vyhledávání">' +
      '<div class="ui-ph"><h3>Hledat</h3><button class="ui-x" data-close aria-label="Zavřít">×</button></div>' +
      '<div class="ui-body"><input class="ui-inp" id="searchInp" placeholder="Legíny, mikina, podprsenka…" autocomplete="off"><div class="srch-list" id="searchList"></div></div>' +
      '</aside>' +
      '<aside class="ui-panel ui-panel--right" id="accountPanel" aria-label="Můj účet">' +
      '<div class="ui-ph"><h3>Můj účet</h3><button class="ui-x" data-close aria-label="Zavřít">×</button></div>' +
      '<div class="ui-body">' +
      '<div class="acct-demo"><b>Demo účet</b><span>petra@email.cz · přihlášena</span></div>' +
      '<div class="acct-row"><span>Objednávky</span><span>2 aktivní</span></div>' +
      '<div class="acct-row"><span>Věrnostní body</span><span>340 BDY</span></div>' +
      '<div class="acct-row"><span>Velikostní profil</span><span>M / 168 cm</span></div>' +
      '<a class="btn btn-dark" href="kosik.html" style="width:100%;margin-top:18px">Moje objednávky</a>' +
      '<p class="acct-note">Ukázkový náhled účtu pro demo e-shop. V produkci zde bude přihlášení a historie nákupů.</p>' +
      '</div></aside>' +
      '<div class="ui-panel ui-panel--center" id="sizePanel" role="dialog" aria-label="Vyber velikost">' +
      '<div class="ui-ph"><h3>Vyber velikost</h3><button class="ui-x" data-close-size aria-label="Zavřít">×</button></div>' +
      '<div class="ui-body" id="sizeBody"></div>' +
      '</div>' +
      '<button type="button" class="bodyna-fab" id="bodynaFab" aria-label="Bodyna asistentka">Bodyna</button>' +
      '<div class="bodyna-panel" id="bodynaPanel" aria-label="Bodyna chat">' +
      '<div class="bodyna-h"><div><b>Bodyna</b><small>AI asistentka · demo</small></div><button class="ui-x" id="bodynaClose" style="color:#fff" aria-label="Zavřít">×</button></div>' +
      '<div class="bodyna-msgs" id="bodynaMsgs"></div>' +
      '<div class="bodyna-in"><input id="bodynaInp" placeholder="Zeptej se na velikost, reklamaci…"><button type="button" id="bodynaSend">Odeslat</button></div>' +
      '</div>';
    document.body.appendChild(root);
    bindShell();
  }

  function closeAll() {
    ['searchPanel', 'accountPanel'].forEach(function (id) {
      var el = document.getElementById(id);
      if (el) el.classList.remove('open');
    });
    document.getElementById('uiScrim').classList.remove('open');
    document.body.style.overflow = '';
  }

  function closeSize() {
    document.getElementById('sizePanel').classList.remove('open');
    document.getElementById('uiScrim').classList.remove('open');
    if (!document.getElementById('searchPanel').classList.contains('open') &&
        !document.getElementById('accountPanel').classList.contains('open') &&
        !document.getElementById('bodynaPanel').classList.contains('open')) {
      document.body.style.overflow = '';
    }
    sizeCallback = null;
    pickedSize = null;
  }

  function openPanel(id) {
    ensureShell();
    closeAll();
    document.getElementById('uiScrim').classList.add('open');
    document.getElementById(id).classList.add('open');
    document.body.style.overflow = 'hidden';
    if (id === 'searchPanel') {
      var inp = document.getElementById('searchInp');
      inp.focus();
      renderSearch(inp.value);
    }
  }

  function bindShell() {
    var scrim = document.getElementById('uiScrim');
    scrim.addEventListener('click', function () {
      closeAll();
      closeSize();
      document.getElementById('bodynaPanel').classList.remove('open');
    });
    document.querySelectorAll('[data-close]').forEach(function (b) {
      b.addEventListener('click', closeAll);
    });
    document.querySelector('[data-close-size]').addEventListener('click', closeSize);

    document.getElementById('searchInp').addEventListener('input', function (e) {
      renderSearch(e.target.value);
    });

    var fab = document.getElementById('bodynaFab');
    var bp = document.getElementById('bodynaPanel');
    fab.addEventListener('click', function () {
      bp.classList.toggle('open');
      if (bp.classList.contains('open') && !document.getElementById('bodynaMsgs').children.length) {
        bodynaSay('bot', 'Ahoj! Jsem Bodyna — poradím s velikostí, produkty i reklamací. Zkus: „Jaká velikost při obvodu pasu 68?“ nebo „Legíny Sculpt“.');
      }
    });
    document.getElementById('bodynaClose').addEventListener('click', function () {
      bp.classList.remove('open');
    });
    function sendBodyna() {
      var inp = document.getElementById('bodynaInp');
      var t = (inp.value || '').trim();
      if (!t) return;
      bodynaSay('user', t);
      inp.value = '';
      setTimeout(function () {
        bodynaSay('bot', bodynaReply(t));
      }, 400);
    }
    document.getElementById('bodynaSend').addEventListener('click', sendBodyna);
    document.getElementById('bodynaInp').addEventListener('keydown', function (e) {
      if (e.key === 'Enter') sendBodyna();
    });
  }

  function renderSearch(q) {
    var list = document.getElementById('searchList');
    q = (q || '').trim().toLowerCase();
    var items = (global.PRODUCTS || []).filter(function (p) {
      if (!q) return true;
      return (
        p.name.toLowerCase().indexOf(q) >= 0 ||
        p.cat.toLowerCase().indexOf(q) >= 0
      );
    });
    if (!items.length) {
      list.innerHTML = '<div class="srch-empty">Nic jsme nenašli. Zkus jiný výraz.</div>';
      return;
    }
    list.innerHTML = items
      .map(function (p) {
        return (
          '<button type="button" class="srch-item" data-goto="' +
          p.id +
          '"><div class="srch-thumb"><img src="' +
          img(p.id) +
          '" alt=""></div><div><b>' +
          p.name +
          '</b><br><span>' +
          p.cat +
          ' · ' +
          czk(p.price) +
          '</span></div></button>'
        );
      })
      .join('');
    list.querySelectorAll('[data-goto]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        location.href = 'produkt.html?id=' + btn.getAttribute('data-goto');
      });
    });
  }

  function bodynaSay(role, text) {
    var box = document.getElementById('bodynaMsgs');
    var d = document.createElement('div');
    d.className = 'bodyna-msg ' + role;
    d.textContent = text;
    box.appendChild(d);
    box.scrollTop = box.scrollHeight;
  }

  function recommendSize(text) {
    var nums = text.match(/\d+/g);
    if (!nums || !nums.length) return null;
    var n = parseInt(nums[0], 10);
    if (/pas|bok/i.test(text)) {
      if (n < 64) return 'XS';
      if (n < 70) return 'S';
      if (n < 76) return 'M';
      if (n < 82) return 'L';
      return 'XL';
    }
    if (/prsa|podprsí|hrud/i.test(text)) {
      if (n < 82) return 'XS';
      if (n < 86) return 'S';
      if (n < 90) return 'M';
      if (n < 94) return 'L';
      return 'XL';
    }
    if (n < 160) return 'XS';
    if (n < 168) return 'S';
    if (n < 174) return 'M';
    if (n < 180) return 'L';
    return 'XL';
  }

  function bodynaReply(text) {
    var t = text.toLowerCase();
    if (/reklamac|vrácen|reklam/i.test(t)) {
      return 'Reklamace: napiš na servis@bdytobdy.cz nebo volej +420 608 123 456. Vrácení do 30 dnů v původním stavu. V demu stačí vyplnit formulář v pokladně.';
    }
    if (/velikost|rozměr|pas|prsa|výška|cm/i.test(t)) {
      var sz = recommendSize(text);
      if (sz) {
        return 'Podle zadaných rozměrů bych doporučila velikost ' + sz + '. U legín zvaž o číslo menší, pokud chceš extra kompresi. Konkrétní produkt si ověř v detailu — každý střih sedí trochu jinak.';
      }
      return 'Pošli mi obvod pasu nebo prsou v cm (např. „pas 68“) a doporučím velikost. Tabulku najdeš u každého produktu v obchodě.';
    }
    if (/doprav|doruč/i.test(t)) {
      return 'Doprava zdarma nad 1 500 Kč. Standard 2–4 pracovní dny, expres +149 Kč. Sledování zásilky přijde e-mailem po odeslání.';
    }
    var hit = (global.PRODUCTS || []).find(function (p) {
      return t.indexOf(p.name.toLowerCase()) >= 0 || t.indexOf(p.cat.toLowerCase()) >= 0;
    });
    if (!hit) {
      if (/legín/i.test(t)) hit = find(1);
      else if (/podprs/i.test(t)) hit = find(2);
      else if (/mikin/i.test(t)) hit = find(5);
      else if (/kraťas/i.test(t)) hit = find(4);
    }
    if (hit) {
      return hit.name + ' — ' + czk(hit.price) + '. Velikosti: ' + hit.sizes.join(', ') + '. Podívej se na detail: produkt.html?id=' + hit.id;
    }
    return 'Jsem tu pro produkty, velikosti a reklamace. Zkus se zeptat konkrétněji — třeba „Podprsenka Air velikost“ nebo „reklamace“.';
  }

  function showSizePicker(productId, callback) {
    ensureShell();
    var p = find(productId);
    if (!p) return;
    sizeCallback = callback;
    pickedSize = p.sizes[0];
    var body = document.getElementById('sizeBody');
    body.innerHTML =
      '<div class="size-prod"><img src="' +
      img(p.id) +
      '" alt=""><div><h4>' +
      p.name +
      '</h4><p>' +
      czk(p.price) +
      '</p></div></div>' +
      '<p style="font-size:.82rem;color:var(--mut,#8E8E88)">Vyber velikost před přidáním do košíku.</p>' +
      '<div class="size-grid" id="sizeGrid"></div>' +
      '<button type="button" class="btn btn-dark" id="sizeConfirm" style="width:100%">Přidat do košíku</button>';
    var grid = document.getElementById('sizeGrid');
    p.sizes.forEach(function (sz) {
      var b = document.createElement('button');
      b.type = 'button';
      b.className = 'size-opt' + (sz === pickedSize ? ' on' : '');
      b.textContent = sz;
      b.addEventListener('click', function () {
        pickedSize = sz;
        grid.querySelectorAll('.size-opt').forEach(function (o) {
          o.classList.toggle('on', o.textContent === sz);
        });
      });
      grid.appendChild(b);
    });
    document.getElementById('sizeConfirm').onclick = function () {
      if (sizeCallback && pickedSize) sizeCallback(pickedSize);
      closeSize();
    };
    document.getElementById('uiScrim').classList.add('open');
    document.getElementById('sizePanel').classList.add('open');
    document.body.style.overflow = 'hidden';
  }

  function popHTML(p) {
    return (
      '<div class="spot-pop"><div class="thumb"><div class="ph"></div><img class="rimg" src="' +
      img(p.id) +
      '" alt="" onerror="this.remove()"></div><div class="info"><h5>' +
      p.name +
      '</h5><div class="pp">' +
      czk(p.price) +
      '</div><button type="button" class="btn btn-dark spot-add" data-id="' +
      p.id +
      '">Přidat do košíku</button><a href="produkt.html?id=' +
      p.id +
      '" class="btn btn-line" style="width:100%;margin-top:6px;font-size:.58rem;padding:9px">Detail</a></div></div>'
    );
  }

  function initSpots(root, addFn) {
    var scope = root ? document.querySelector(root) : document;
    if (!scope) return;
    Array.prototype.forEach.call(scope.querySelectorAll('.spot'), function (sp) {
      if (sp.dataset.bound) return;
      sp.dataset.bound = '1';
      var p = find(+sp.dataset.pid);
      if (!p) return;
      if (!sp.querySelector('.spot-pop')) sp.insertAdjacentHTML('beforeend', popHTML(p));
      sp.addEventListener('click', function (e) {
        var add = e.target.closest('.spot-add');
        if (add) {
          e.preventDefault();
          e.stopPropagation();
          showSizePicker(+add.dataset.id, function (sz) {
            if (addFn) addFn(+add.dataset.id, sz);
          });
          return;
        }
        if (e.target.closest('a')) return;
        Array.prototype.forEach.call(document.querySelectorAll('.spot.open'), function (o) {
          if (o !== sp) o.classList.remove('open');
        });
        sp.classList.toggle('open');
      });
    });
    document.addEventListener('click', function (e) {
      if (!e.target.closest('.spot')) {
        document.querySelectorAll('.spot.open').forEach(function (s) {
          s.classList.remove('open');
        });
      }
    });
  }

  function init(opts) {
    opts = opts || {};
    onAddToCart = opts.onAddToCart || null;
    ensureShell();
    var searchBtn = document.getElementById('searchBtn');
    var accountBtn = document.getElementById('accountBtn');
    if (searchBtn) searchBtn.addEventListener('click', function () { openPanel('searchPanel'); });
    if (accountBtn) accountBtn.addEventListener('click', function () { openPanel('accountPanel'); });
    if (opts.spots !== false) {
      initSpots(opts.spotsRoot || null, onAddToCart);
    }
  }

  global.BDY_UI = {
    init: init,
    showSizePicker: showSizePicker,
    initSpots: initSpots,
    openSearch: function () { openPanel('searchPanel'); },
    openAccount: function () { openPanel('accountPanel'); },
  };
})(typeof window !== 'undefined' ? window : this);

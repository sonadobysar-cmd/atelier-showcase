(function () {
  var KEY = "nia_cookie_consent";
  if (localStorage.getItem(KEY)) return;

  var css =
    ".nia-cookie{position:fixed;left:0;right:0;bottom:0;z-index:320;padding:12px 12px calc(12px + env(safe-area-inset-bottom,0));pointer-events:none;opacity:0;transform:translateY(110%);transition:opacity .5s cubic-bezier(.16,1,.3,1),transform .55s cubic-bezier(.16,1,.3,1)}" +
    ".nia-cookie.is-visible{opacity:1;transform:translateY(0);pointer-events:auto}" +
    ".nia-cookie__panel{max-width:1180px;margin:0 auto;display:flex;align-items:flex-start;gap:clamp(16px,3vw,28px);padding:clamp(18px,3.5vw,24px) clamp(20px,4vw,28px);background:rgba(255,255,255,.94);backdrop-filter:blur(18px) saturate(1.15);-webkit-backdrop-filter:blur(18px) saturate(1.15);border:1px solid rgba(26,10,16,.1);border-radius:clamp(20px,4vw,28px);box-shadow:0 -8px 48px -12px rgba(8,6,6,.18),0 24px 64px -32px rgba(8,6,6,.22)}" +
    ".nia-cookie__mark{flex:none;width:42px;height:42px;border-radius:50%;display:grid;place-items:center;background:linear-gradient(145deg,#5c2a3e,#7a3d54);color:#fff;font-size:1.1rem;box-shadow:0 8px 20px -8px rgba(92,42,62,.55)}" +
    ".nia-cookie__body{flex:1;min-width:0}" +
    ".nia-cookie__eyebrow{font-family:'Bodoni Moda',Georgia,serif;font-size:.58rem;letter-spacing:.38em;text-transform:uppercase;color:#7a3d54;margin-bottom:6px;font-weight:500}" +
    ".nia-cookie__text{font-family:'Outfit',system-ui,sans-serif;font-size:clamp(.84rem,2.6vw,.92rem);line-height:1.65;color:#5a4a52;font-weight:300}" +
    ".nia-cookie__text a{color:#5c2a3e;text-decoration:underline;text-underline-offset:3px;font-weight:400}" +
    ".nia-cookie__text a:hover{color:#7a3d54}" +
    ".nia-cookie__actions{flex:none;display:flex;align-items:center;gap:10px;align-self:center}" +
    ".nia-cookie__btn{font-family:'Outfit',system-ui,sans-serif;border:none;cursor:pointer;border-radius:999px;transition:transform .3s cubic-bezier(.16,1,.3,1),background .3s,box-shadow .3s;-webkit-tap-highlight-color:transparent;appearance:none;-webkit-appearance:none;white-space:nowrap}" +
    ".nia-cookie__btn--primary{background:#5c2a3e;color:#fff;font-size:.62rem;letter-spacing:.22em;text-transform:uppercase;font-weight:400;padding:14px 24px;min-height:44px;box-shadow:0 10px 28px -10px rgba(92,42,62,.55)}" +
    ".nia-cookie__btn--primary:hover{background:#7a3d54;transform:translateY(-1px)}" +
    ".nia-cookie__btn--primary:active{transform:translateY(0)}" +
    ".nia-cookie__btn--ghost{background:transparent;color:#5c2a3e;font-size:.58rem;letter-spacing:.18em;text-transform:uppercase;padding:12px 14px;min-height:44px;border:1px solid rgba(26,10,16,.14)}" +
    ".nia-cookie__btn--ghost:hover{border-color:rgba(92,42,62,.35);background:rgba(92,42,62,.04)}" +
    "@media(max-width:680px){.nia-cookie__panel{flex-direction:column;align-items:stretch;gap:14px}.nia-cookie__mark{display:none}.nia-cookie__actions{width:100%;flex-direction:column-reverse}.nia-cookie__btn{width:100%;justify-content:center;display:inline-flex;align-items:center}}";

  var style = document.createElement("style");
  style.textContent = css;
  document.head.appendChild(style);

  var root = document.createElement("div");
  root.id = "niaCookie";
  root.className = "nia-cookie";
  root.setAttribute("role", "dialog");
  root.setAttribute("aria-label", "Informace o cookies");
  root.setAttribute("aria-live", "polite");
  root.innerHTML =
    '<div class="nia-cookie__panel">' +
    '<span class="nia-cookie__mark" aria-hidden="true">✦</span>' +
    '<div class="nia-cookie__body">' +
    '<p class="nia-cookie__eyebrow">Cookies</p>' +
    '<p class="nia-cookie__text">Používáme jen nezbytné cookies, aby web běžel hladce. Žádné sledování bez tvého souhlasu. ' +
    '<a href="/nia/bezpecnost#cookies">Více v zásadách ochrany</a>.</p>' +
    "</div>" +
    '<div class="nia-cookie__actions">' +
    '<button type="button" class="nia-cookie__btn nia-cookie__btn--ghost" id="niaCookieMore">Zásady</button>' +
    '<button type="button" class="nia-cookie__btn nia-cookie__btn--primary" id="niaCookieAccept">Rozumím ✦</button>' +
    "</div></div>";

  document.body.appendChild(root);

  function accept() {
    localStorage.setItem(KEY, "1");
    root.classList.remove("is-visible");
    setTimeout(function () {
      root.remove();
      style.remove();
    }, 520);
  }

  document.getElementById("niaCookieAccept").addEventListener("click", accept);
  document.getElementById("niaCookieMore").addEventListener("click", function () {
    window.location.href = "/nia/bezpecnost#cookies";
  });

  requestAnimationFrame(function () {
    requestAnimationFrame(function () {
      root.classList.add("is-visible");
    });
  });
})();

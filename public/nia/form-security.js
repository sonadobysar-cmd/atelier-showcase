(function () {
  var TURNSTILE_SRC = "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";
  var config = null;
  var widgets = {};
  var pending = {};
  var scriptLoading = false;

  function loadScript() {
    return new Promise(function (resolve, reject) {
      if (window.turnstile) {
        resolve();
        return;
      }
      if (scriptLoading) {
        var t = setInterval(function () {
          if (window.turnstile) {
            clearInterval(t);
            resolve();
          }
        }, 40);
        setTimeout(function () {
          clearInterval(t);
          reject(new Error("turnstile timeout"));
        }, 12000);
        return;
      }
      scriptLoading = true;
      var s = document.createElement("script");
      s.src = TURNSTILE_SRC;
      s.async = true;
      s.defer = true;
      s.onload = function () {
        resolve();
      };
      s.onerror = function () {
        reject(new Error("turnstile load failed"));
      };
      document.head.appendChild(s);
    });
  }

  function fetchConfig() {
    return fetch("/api/nia/form-config", { cache: "no-store" })
      .then(function (r) {
        return r.json();
      })
      .then(function (data) {
        if (!data.ok) throw new Error("config");
        config = data;
        return data;
      });
  }

  function ensureWidget(key, container) {
    if (!config || !window.turnstile) return null;
    if (widgets[key]) return widgets[key];
    var id = window.turnstile.render(container, {
      sitekey: config.turnstileSiteKey,
      size: "invisible",
      callback: function (token) {
        var p = pending[key];
        if (p) {
          pending[key] = null;
          p.resolve(token);
        }
      },
      "error-callback": function () {
        var p = pending[key];
        if (p) {
          pending[key] = null;
          p.reject(new Error("turnstile error"));
        }
      },
      "expired-callback": function () {
        var p = pending[key];
        if (p) {
          pending[key] = null;
          p.reject(new Error("turnstile expired"));
        }
      },
    });
    widgets[key] = id;
    return id;
  }

  function getTurnstileToken(key) {
    return new Promise(function (resolve, reject) {
      var id = widgets[key];
      if (!id || !window.turnstile) {
        reject(new Error("widget missing"));
        return;
      }
      pending[key] = { resolve: resolve, reject: reject };
      try {
        window.turnstile.execute(id);
      } catch (e) {
        pending[key] = null;
        reject(e);
      }
      setTimeout(function () {
        if (pending[key]) {
          pending[key] = null;
          reject(new Error("turnstile timeout"));
        }
      }, 15000);
    });
  }

  function refreshFormToken() {
    return fetchConfig().then(function (c) {
      return c.formToken;
    });
  }

  function init() {
    var hosts = document.querySelectorAll("[data-nia-form]");
    if (!hosts.length) return Promise.resolve();

    return fetchConfig()
      .then(function () {
        return loadScript();
      })
      .then(function () {
        hosts.forEach(function (host) {
          var key = host.getAttribute("data-nia-form") || "default";
          var box = host.querySelector(".nia-turnstile-host");
          if (!box) {
            box = document.createElement("div");
            box.className = "nia-turnstile-host";
            box.setAttribute("aria-hidden", "true");
            box.style.cssText = "position:absolute;left:-9999px;width:1px;height:1px;overflow:hidden;";
            host.appendChild(box);
          }
          ensureWidget(key, box);
        });
      })
      .catch(function () {
        /* tiché — submit pak spadne na serveru */
      });
  }

  window.NiaFormSecurity = {
    init: init,
    getPayloadExtras: function (formKey) {
      return refreshFormToken()
        .then(function (formToken) {
          return getTurnstileToken(formKey).then(function (turnstileToken) {
            return { formToken: formToken, turnstileToken: turnstileToken };
          });
        });
    },
    rateLimitMessage: "Zkuste to prosím později nebo mi napište na niadobysar@gmail.com.",
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();

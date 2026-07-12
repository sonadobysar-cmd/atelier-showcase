(function () {
  var TURNSTILE_SRC = "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";
  var config = null;
  var widgets = {};
  var pending = {};
  var scriptLoading = false;
  var initDone = false;
  var initPromise = null;

  function log() {
    if (typeof console !== "undefined" && console.log) {
      console.log.apply(console, ["[NiaFormSecurity]"].concat([].slice.call(arguments)));
    }
  }

  function warn() {
    if (typeof console !== "undefined" && console.warn) {
      console.warn.apply(console, ["[NiaFormSecurity]"].concat([].slice.call(arguments)));
    }
  }

  function userError(code, detail) {
    warn(code, detail || "");
    var err = new Error(
      code === "config"
        ? detail === "invalid turnstile site key"
          ? "Formulář není správně nastavený na serveru (Turnstile). Napiš na niadobysar@gmail.com."
          : "Formulář se nepodařilo připravit. Obnov stránku — pokud problém přetrvává, napiš na niadobysar@gmail.com."
        : code === "turnstile"
          ? "Ověření proti robotům selhalo. Obnov stránku a zkus to znovu."
          : "Odeslání se nepodařilo. Obnov stránku a zkus to znovu.",
    );
    err.code = code;
    return err;
  }

  function isValidSiteKey(key) {
    if (!key || typeof key !== "string") return false;
    if (key === "TURNSTILE_SITE_KEY" || key === "TURNSTILE_SECRET_KEY") return false;
    if (/TURNSTILE_|SECRET_KEY|SITE_KEY/i.test(key)) return false;
    if (key.length < 20) return false;
    return key.indexOf("0x") === 0;
  }

  function loadScript() {
    return new Promise(function (resolve, reject) {
      if (window.turnstile) {
        resolve();
        return;
      }

      var existing = document.querySelector('script[src*="challenges.cloudflare.com/turnstile"]');
      if (existing) {
        if (window.turnstile) {
          resolve();
          return;
        }
        existing.addEventListener("load", function () {
          resolve();
        });
        existing.addEventListener("error", function () {
          reject(new Error("turnstile script load failed"));
        });
        var waited = setInterval(function () {
          if (window.turnstile) {
            clearInterval(waited);
            resolve();
          }
        }, 40);
        setTimeout(function () {
          clearInterval(waited);
          if (!window.turnstile) reject(new Error("turnstile script timeout"));
        }, 15000);
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
          if (!window.turnstile) reject(new Error("turnstile script timeout"));
        }, 15000);
        return;
      }

      scriptLoading = true;
      var s = document.createElement("script");
      s.src = TURNSTILE_SRC;
      s.async = false;
      s.onload = function () {
        log("turnstile script loaded");
        resolve();
      };
      s.onerror = function () {
        reject(new Error("turnstile script load failed"));
      };
      document.head.appendChild(s);
    });
  }

  function fetchConfig() {
    return fetch("/api/nia/form-config", { cache: "no-store", credentials: "same-origin" })
      .then(function (r) {
        return r.json().then(function (data) {
          if (!r.ok || !data.ok) {
            throw userError("config", data && data.error);
          }
          config = data;
          if (!isValidSiteKey(data.turnstileSiteKey)) {
            throw userError("config", "invalid turnstile site key");
          }
          log("config loaded, site key present:", Boolean(data.turnstileSiteKey));
          return data;
        });
      });
  }

  function whenTurnstileReady() {
    return new Promise(function (resolve) {
      if (!window.turnstile) {
        resolve();
        return;
      }
      if (typeof window.turnstile.ready === "function") {
        window.turnstile.ready(resolve);
      } else {
        resolve();
      }
    });
  }

  function ensureWidget(key, container) {
    if (!config || !window.turnstile) return null;
    if (widgets[key]) return widgets[key];
    try {
      var id = window.turnstile.render(container, {
        sitekey: config.turnstileSiteKey,
        size: "invisible",
        callback: function (token) {
          log("turnstile token for", key);
          var p = pending[key];
          if (p) {
            pending[key] = null;
            p.resolve(token);
          }
        },
        "error-callback": function () {
          warn("turnstile error-callback", key);
          var p = pending[key];
          if (p) {
            pending[key] = null;
            p.reject(userError("turnstile", "error-callback"));
          }
        },
        "expired-callback": function () {
          warn("turnstile expired", key);
          var p = pending[key];
          if (p) {
            pending[key] = null;
            p.reject(userError("turnstile", "expired"));
          }
        },
      });
      widgets[key] = id;
      log("widget rendered", key, id);
      return id;
    } catch (e) {
      warn("turnstile render failed", key, e);
      return null;
    }
  }

  function getTurnstileToken(key) {
    return new Promise(function (resolve, reject) {
      var id = widgets[key];
      if (!id || !window.turnstile) {
        reject(userError("turnstile", "widget missing"));
        return;
      }
      pending[key] = { resolve: resolve, reject: reject };
      try {
        window.turnstile.execute(id);
      } catch (e) {
        pending[key] = null;
        reject(userError("turnstile", e && e.message));
      }
      setTimeout(function () {
        if (pending[key]) {
          pending[key] = null;
          reject(userError("turnstile", "execute timeout"));
        }
      }, 20000);
    });
  }

  function refreshFormToken() {
    return fetchConfig().then(function (c) {
      return c.formToken;
    });
  }

  function init() {
    if (initPromise) return initPromise;

    var hosts = document.querySelectorAll("[data-nia-form]");
    if (!hosts.length) {
      initDone = true;
      initPromise = Promise.resolve();
      return initPromise;
    }

    initPromise = fetchConfig()
      .then(function () {
        return loadScript();
      })
      .then(function () {
        return whenTurnstileReady();
      })
      .then(function () {
        hosts.forEach(function (host) {
          var key = host.getAttribute("data-nia-form") || "default";
          var box = host.querySelector(".nia-turnstile-host");
          if (!box) {
            box = document.createElement("div");
            box.className = "nia-turnstile-host";
            box.setAttribute("aria-hidden", "true");
            box.style.cssText =
              "position:fixed;right:0;bottom:0;width:1px;height:1px;opacity:0;pointer-events:none;overflow:hidden;";
            host.appendChild(box);
          }
          ensureWidget(key, box);
        });
        initDone = true;
        log("init complete, widgets:", Object.keys(widgets).join(", "));
      })
      .catch(function (err) {
        initDone = false;
        initPromise = null;
        warn("init failed", err);
        throw err;
      });

    return initPromise;
  }

  window.NiaFormSecurity = {
    init: init,
    ready: function () {
      return init();
    },
    getPayloadExtras: function (formKey) {
      return init()
        .then(function () {
          if (!widgets[formKey]) {
            var host = document.querySelector('[data-nia-form="' + formKey + '"]');
            if (host) {
              var box = host.querySelector(".nia-turnstile-host");
              if (box && config && window.turnstile) {
                ensureWidget(formKey, box);
              }
            }
          }
          if (!widgets[formKey]) {
            throw userError("turnstile", "widget not ready");
          }
          return refreshFormToken().then(function (formToken) {
            return getTurnstileToken(formKey).then(function (turnstileToken) {
              return { formToken: formToken, turnstileToken: turnstileToken };
            });
          });
        })
        .catch(function (err) {
          if (err && err.code) throw err;
          throw userError("config", err && err.message);
        });
    },
    rateLimitMessage: "Zkuste to prosím později nebo mi napište na niadobysar@gmail.com.",
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", function () {
      init().catch(function () {});
    });
  } else {
    init().catch(function () {});
  }
})();

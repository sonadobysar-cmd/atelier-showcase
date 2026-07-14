(function () {
  var TURNSTILE_SRC = "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";
  var SCRIPT_VERSION = "20260714a";
  var config = null;
  var widgetId = null;
  var sharedContainer = null;
  var pending = null;
  var inFlight = null;
  var scriptLoading = false;
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
          ? detail === "blocked"
            ? "Ověření proti robotům blokuje prohlížeč nebo doplněk (AdBlock). Zkus ho vypnout pro tento web, obnov stránku a zkus znovu."
            : "Ověření proti robotům selhalo. Obnov stránku a zkus to znovu."
          : "Odeslání se nepodařilo. Obnov stránku a zkus to znovu.",
    );
    err.code = code;
    err.detail = detail || "";
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
      if (existing || scriptLoading) {
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

      scriptLoading = true;
      var s = document.createElement("script");
      s.src = TURNSTILE_SRC;
      s.async = false;
      s.onload = function () {
        log("turnstile script loaded", SCRIPT_VERSION);
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

  function ensureSharedContainer() {
    if (sharedContainer) return sharedContainer;
    sharedContainer = document.createElement("div");
    sharedContainer.className = "nia-turnstile-host";
    sharedContainer.setAttribute("aria-hidden", "true");
    sharedContainer.style.cssText =
      "position:fixed;left:0;bottom:0;width:304px;height:78px;opacity:0;pointer-events:none;overflow:hidden;z-index:-1;";
    document.body.appendChild(sharedContainer);
    return sharedContainer;
  }

  function destroyWidget() {
    if (widgetId && window.turnstile && typeof window.turnstile.remove === "function") {
      try {
        window.turnstile.remove(widgetId);
      } catch (e) {
        warn("turnstile remove failed", e);
      }
    }
    widgetId = null;
    pending = null;
    if (sharedContainer) {
      sharedContainer.innerHTML = "";
    }
  }

  function renderFreshWidget() {
    if (!config || !window.turnstile) return null;

    destroyWidget();
    var container = ensureSharedContainer();

    try {
      widgetId = window.turnstile.render(container, {
        sitekey: config.turnstileSiteKey,
        size: "invisible",
        callback: function (token) {
          log("turnstile token received");
          if (pending) {
            var p = pending;
            pending = null;
            p.resolve(token);
          }
        },
        "error-callback": function () {
          warn("turnstile error-callback");
          if (!pending) return;
          var p = pending;
          pending = null;
          p.reject(userError("turnstile", "blocked"));
        },
        "expired-callback": function () {
          warn("turnstile expired");
          if (!pending) return;
          var p = pending;
          pending = null;
          destroyWidget();
          p.reject(userError("turnstile", "expired"));
        },
      });
      log("widget rendered", widgetId);
      return widgetId;
    } catch (e) {
      warn("turnstile render failed", e);
      widgetId = null;
      return null;
    }
  }

  function waitMs(ms) {
    return new Promise(function (resolve) {
      setTimeout(resolve, ms);
    });
  }

  function getTurnstileToken(retryLeft) {
    return whenTurnstileReady()
      .then(function () {
        return waitMs(50);
      })
      .then(function () {
        return new Promise(function (resolve, reject) {
          if (!window.turnstile) {
            reject(userError("turnstile", "turnstile missing"));
            return;
          }

          var id = renderFreshWidget();
          if (!id) {
            reject(userError("turnstile", "widget not ready"));
            return;
          }

          pending = {
            resolve: resolve,
            reject: reject,
            retryLeft: retryLeft,
          };

          function retryOrReject(err) {
            if (retryLeft > 0) {
              log("turnstile retry", retryLeft, err.detail || err.message);
              getTurnstileToken(retryLeft - 1).then(resolve).catch(reject);
              return;
            }
            reject(err);
          }

          try {
            window.turnstile.execute(id);
          } catch (e) {
            pending = null;
            retryOrReject(userError("turnstile", e && e.message));
            return;
          }

          setTimeout(function () {
            if (!pending) return;
            pending = null;
            destroyWidget();
            retryOrReject(userError("turnstile", "execute timeout"));
          }, 25000);
        });
      });
  }

  function init() {
    if (initPromise) return initPromise;

    if (!document.querySelector("[data-nia-form]")) {
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
        log("init complete", SCRIPT_VERSION);
      })
      .catch(function (err) {
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
    getPayloadExtras: function () {
      if (inFlight) return inFlight;

      inFlight = init()
        .then(function () {
          return fetchConfig();
        })
        .then(function (c) {
          return getTurnstileToken(2).then(function (turnstileToken) {
            return { formToken: c.formToken, turnstileToken: turnstileToken };
          });
        })
        .catch(function (err) {
          if (err && err.code) throw err;
          throw userError("config", err && err.message);
        })
        .finally(function () {
          inFlight = null;
        });

      return inFlight;
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

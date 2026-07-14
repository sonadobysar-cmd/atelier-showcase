(function () {
  var TURNSTILE_SRC = "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";
  var SCRIPT_VERSION = "20260714c";
  var config = null;
  var widgets = {};
  var scriptLoading = false;
  var initPromise = null;
  var inFlight = null;

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
            : detail === "missing"
              ? "Potvrď ověření proti robotům (zaškrtnutí nad tlačítkem) a zkus odeslat znovu."
              : detail === "expired"
                ? "Ověření proti robotům vypršelo. Obnov stránku a zkus to znovu."
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

  function formMount(formKey) {
    var form = document.querySelector('[data-nia-form="' + formKey + '"]');
    if (!form) return null;
    var mount = form.querySelector(".nia-turnstile-mount");
    if (mount) return mount;
    mount = document.createElement("div");
    mount.className = "nia-turnstile-mount";
    mount.setAttribute("aria-label", "Ověření proti robotům");
    var btn = form.querySelector('button[type="submit"]');
    if (btn) {
      form.insertBefore(mount, btn);
    } else {
      form.appendChild(mount);
    }
    return mount;
  }

  function resolvePending(state, token) {
    if (!state.pending) return;
    var p = state.pending;
    state.pending = null;
    clearTimeout(state.pendingTimer);
    state.pendingTimer = null;
    p.resolve(token);
  }

  function rejectPending(state, err) {
    if (!state.pending) return;
    var p = state.pending;
    state.pending = null;
    clearTimeout(state.pendingTimer);
    state.pendingTimer = null;
    p.reject(err);
  }

  function renderWidget(formKey) {
    if (!config || !window.turnstile) return null;

    var mount = formMount(formKey);
    if (!mount) return null;

    var state = widgets[formKey];
    if (state && state.widgetId != null) {
      try {
        window.turnstile.remove(state.widgetId);
      } catch (e) {
        warn("turnstile remove failed", formKey, e);
      }
    }

    mount.innerHTML = "";
    state = {
      widgetId: null,
      token: null,
      pending: null,
      pendingTimer: null,
      mount: mount,
    };
    widgets[formKey] = state;

    try {
      state.widgetId = window.turnstile.render(mount, {
        sitekey: config.turnstileSiteKey,
        size: "compact",
        theme: "light",
        callback: function (token) {
          log("turnstile token received", formKey);
          state.token = token;
          resolvePending(state, token);
        },
        "error-callback": function () {
          warn("turnstile error-callback", formKey);
          state.token = null;
          rejectPending(state, userError("turnstile", "blocked"));
        },
        "expired-callback": function () {
          warn("turnstile expired", formKey);
          state.token = null;
          rejectPending(state, userError("turnstile", "expired"));
        },
      });
      log("widget rendered", formKey, state.widgetId);
      return state.widgetId;
    } catch (e) {
      warn("turnstile render failed", formKey, e);
      return null;
    }
  }

  function renderAllWidgets() {
    document.querySelectorAll("[data-nia-form]").forEach(function (form) {
      var formKey = form.getAttribute("data-nia-form");
      if (formKey) renderWidget(formKey);
    });
  }

  function waitForToken(formKey, timeoutMs) {
    return new Promise(function (resolve, reject) {
      var state = widgets[formKey];
      if (!state || state.widgetId == null) {
        reject(userError("turnstile", "widget not ready"));
        return;
      }

      if (state.token) {
        resolve(state.token);
        return;
      }

      state.pending = { resolve: resolve, reject: reject };
      state.pendingTimer = setTimeout(function () {
        if (!state.pending) return;
        rejectPending(state, userError("turnstile", "missing"));
      }, timeoutMs || 45000);
    });
  }

  function getTurnstileToken(formKey) {
    return whenTurnstileReady().then(function () {
      if (!window.turnstile) {
        throw userError("turnstile", "turnstile missing");
      }

      var state = widgets[formKey];
      if (!state || state.widgetId == null) {
        if (!renderWidget(formKey)) {
          throw userError("turnstile", "widget not ready");
        }
        state = widgets[formKey];
      }

      if (state.token) {
        return state.token;
      }

      try {
        window.turnstile.reset(state.widgetId);
      } catch (e) {
        warn("turnstile reset failed", formKey, e);
      }

      return waitForToken(formKey, 45000);
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
        renderAllWidgets();
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
    resetTurnstile: function (formKey) {
      var state = widgets[formKey];
      if (!state || state.widgetId == null || !window.turnstile) return;
      state.token = null;
      try {
        window.turnstile.reset(state.widgetId);
      } catch (e) {
        warn("turnstile reset failed", formKey, e);
      }
    },
    getPayloadExtras: function (formKey) {
      if (inFlight) return inFlight;

      var key = formKey || "konzultace";

      inFlight = init()
        .then(function () {
          return fetchConfig();
        })
        .then(function (c) {
          return getTurnstileToken(key).then(function (turnstileToken) {
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

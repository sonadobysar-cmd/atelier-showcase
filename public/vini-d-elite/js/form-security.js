(function () {
  "use strict";
  var tokenPromise;
  function prepare(force) {
    if (!tokenPromise || force) tokenPromise = fetch("/api/vini/form-config", { credentials: "same-origin", headers: { Accept: "application/json" } }).then(function (response) { return response.json().then(function (data) { if (!response.ok || !data.formToken) throw new Error(data.error || "Bezpečnostní ověření formuláře není dostupné."); return new Promise(function (resolve) { window.setTimeout(function () { resolve(data.formToken); }, 2700); }); }); });
    return tokenPromise;
  }
  window.ViniFormSecurity = { token: function () { return prepare(false); }, renew: function () { return prepare(true); } };
  prepare(false).catch(function () { /* chyba se zobrazí až při odeslání */ });
})();


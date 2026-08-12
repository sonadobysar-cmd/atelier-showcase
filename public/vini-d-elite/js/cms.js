(function () {
  "use strict";
  function title(node, value) {
    node.textContent = "";
    String(value).split(/(\*[^*]+\*)/g).filter(Boolean).forEach(function (part) {
      if (part.charAt(0) === "*" && part.charAt(part.length - 1) === "*") {
        var em = document.createElement("em");
        em.textContent = part.slice(1, -1);
        node.appendChild(em);
      } else node.appendChild(document.createTextNode(part));
    });
  }
  function legal(node, value) {
    node.textContent = "";
    String(value).split(/\n\s*\n/g).map(function (part) { return part.trim(); }).filter(Boolean).forEach(function (part) {
      var element;
      if (part.indexOf("## ") === 0) { element = document.createElement("h2"); element.textContent = part.slice(3).trim(); }
      else { element = document.createElement("p"); element.textContent = part.replace(/\n/g, " "); }
      node.appendChild(element);
    });
  }
  function imageAllowed(value) {
    return typeof value === "string" && (value.indexOf("/images/") === 0 || /^https:\/\/[a-z0-9.-]+\.blob\.vercel-storage\.com\//i.test(value));
  }
  function apply(content) {
    document.querySelectorAll("[data-cms-text]").forEach(function (node) { var key = node.getAttribute("data-cms-text"); if (key && content.texts && content.texts[key]) node.textContent = content.texts[key]; });
    document.querySelectorAll("[data-cms-title]").forEach(function (node) { var key = node.getAttribute("data-cms-title"); if (key && content.texts && content.texts[key]) title(node, content.texts[key]); });
    document.querySelectorAll("[data-cms-image]").forEach(function (node) { var key = node.getAttribute("data-cms-image"), value = key && content.images && content.images[key]; if (imageAllowed(value)) node.setAttribute("src", value); });
    Object.keys(content.images || {}).forEach(function (key) {
      if (key.indexOf("wine.") !== 0 || !imageAllowed(content.images[key])) return;
      var id = key.slice(5), value = content.images[key];
      window.VINI_IMAGES = window.VINI_IMAGES || {};
      var previous = window.VINI_IMAGES[id];
      window.VINI_IMAGES[id] = value;
      document.querySelectorAll("img").forEach(function (image) {
        var source = image.getAttribute("src");
        if (previous && (source === previous || source === "/" + previous)) image.setAttribute("src", value);
      });
      document.querySelectorAll('[data-vini-image="' + id + '"]').forEach(function (image) {
        image.setAttribute("src", value);
        var frame = image.closest && image.closest(".wcard-img");
        if (frame) frame.style.setProperty("--wine-photo", 'url("' + value.replace(/["\\]/g, "") + '")');
      });
    });
    document.querySelectorAll("[data-cms-legal]").forEach(function (node) { var key = node.getAttribute("data-cms-legal"); if (key && content.legal && content.legal[key]) legal(node, content.legal[key]); });
    window.dispatchEvent(new CustomEvent("vini:content-ready", { detail: content }));
  }
  fetch("/api/vini/content", { credentials: "same-origin", headers: { Accept: "application/json" } }).then(function (response) { return response.ok ? response.json() : Promise.reject(); }).then(function (data) { if (data && data.content) apply(data.content); }).catch(function () { /* bezpečný statický obsah zůstává */ });
})();

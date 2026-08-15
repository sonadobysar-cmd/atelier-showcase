(function () {
  "use strict";

  var PAGE_BY_PATH = {
    "": "home", index: "home", "index.html": "home",
    obchod: "collection", "obchod.html": "collection", collection: "collection", collezione: "collection",
    vino: "wine", "vino.html": "wine", wine: "wine",
    "degustacni-set": "tasting", "degustacni-set.html": "tasting", "tasting-set": "tasting", "set-degustazione": "tasting",
    "la-cantina": "prive", "la-cantina.html": "prive", prive: "prive",
    b2b: "b2b", "b2b.html": "b2b", kontakt: "contact", "kontakt.html": "contact", contact: "contact", contatti: "contact",
    gdpr: "privacy", "gdpr.html": "privacy", privacy: "privacy", cookies: "cookies", "cookies.html": "cookies", cookie: "cookies",
    "obchodni-podminky": "terms", "obchodni-podminky.html": "terms", terms: "terms", condizioni: "terms",
    "reklamacni-rad": "complaints", "reklamacni-rad.html": "complaints", complaints: "complaints", reclami: "complaints",
    doprava: "shipping", "doprava.html": "shipping", delivery: "shipping", consegna: "shipping"
  };
  var contentState = null;
  var applying = false;
  var observerTimer = 0;
  var editorMode = new URLSearchParams(location.search).get("viniEditor") === "1";
  var editorDraftReady = false;

  function pageKey() {
    var bits = location.pathname.split("/").filter(Boolean);
    if (bits[0] === "vini-d-elite") bits.shift();
    if (bits[0] === "en" || bits[0] === "it") bits.shift();
    var page = PAGE_BY_PATH[bits[0] || ""] || "home";
    if (page === "wine") page += "-" + (new URLSearchParams(location.search).get("id") || "1").replace(/[^0-9]/g, "");
    return page;
  }

  function locale() {
    return window.VINI_I18N && window.VINI_I18N.locale || document.documentElement.lang || "cs";
  }

  function title(node, value) {
    node.textContent = "";
    String(value).split(/(\*[^*]+\*)/g).filter(Boolean).forEach(function (part) {
      if (part.charAt(0) === "*" && part.charAt(part.length - 1) === "*") {
        var em = document.createElement("em"); em.textContent = part.slice(1, -1); node.appendChild(em);
      } else node.appendChild(document.createTextNode(part));
    });
  }

  function legal(node, value) {
    node.textContent = "";
    var paragraph = [];
    function flush() { if (!paragraph.length) return; var p = document.createElement("p"); p.textContent = paragraph.join(" "); node.appendChild(p); paragraph = []; }
    String(value).replace(/\r/g, "").split("\n").forEach(function (line) {
      var trimmed = line.trim();
      if (!trimmed) { flush(); return; }
      if (trimmed.indexOf("## ") === 0) { flush(); var h = document.createElement("h2"); h.textContent = trimmed.slice(3).trim(); node.appendChild(h); }
      else paragraph.push(trimmed);
    });
    flush();
  }

  function imageAllowed(value) {
    return typeof value === "string" && (value.indexOf("/images/") === 0 || /^https:\/\/[a-z0-9.-]+\.blob\.vercel-storage\.com\//i.test(value));
  }

  function selectorPath(element) {
    if (!element || element.nodeType !== 1) return "";
    var parts = [];
    while (element && element.nodeType === 1 && element !== document.documentElement) {
      var tag = element.tagName.toLowerCase();
      if (element === document.body || element === document.head) { parts.unshift(tag); break; }
      if (element.id && /^[A-Za-z][A-Za-z0-9_-]*$/.test(element.id) && document.querySelectorAll("#" + element.id).length === 1) { parts.unshift("#" + element.id); break; }
      var index = 1, sibling = element;
      while ((sibling = sibling.previousElementSibling)) if (sibling.tagName === element.tagName) index++;
      parts.unshift(tag + ":nth-of-type(" + index + ")");
      element = element.parentElement;
    }
    return parts.join(">");
  }

  function decodePart(value) { try { return decodeURIComponent(value); } catch (ignore) { return ""; } }

  function setOverride(key, value) {
    var parts = String(key).split("|");
    var kind = parts[0], selector = decodePart(parts[1] || ""), node;
    if (kind === "attr" && selector === "document" && parts[2] === "title") {
      if (document.title !== value) document.title = value;
      return;
    }
    try { node = document.querySelector(selector); } catch (ignore) { return; }
    if (!node) return;
    if (kind === "text") {
      var child = node.childNodes[Number(parts[2])];
      if (child && child.nodeType === 3 && child.nodeValue !== value) child.nodeValue = value;
    } else if (kind === "attr") {
      var attribute = parts[2];
      if (attribute && node.getAttribute(attribute) !== value) node.setAttribute(attribute, value);
    } else if (kind === "image" && imageAllowed(value)) {
      if (node.getAttribute("src") !== value) node.setAttribute("src", value);
    } else if (kind === "background" && imageAllowed(value)) {
      var background = 'url("' + value.replace(/["\\]/g, "") + '")';
      var current = getComputedStyle(node).backgroundImage;
      if (/url\([^)]+\)/.test(current)) background = current.replace(/url\([^)]+\)/, background);
      if (node.style.backgroundImage !== background) node.style.backgroundImage = background;
    }
  }

  function applyVisual(content) {
    if (!content || !content.visual) return;
    var page = pageKey(), lang = locale();
    var texts = content.visual.texts && content.visual.texts[lang] && content.visual.texts[lang][page] || {};
    var images = content.visual.images && content.visual.images[page] || {};
    applying = true;
    Object.keys(texts).forEach(function (key) { setOverride(key, texts[key]); });
    Object.keys(images).forEach(function (key) { setOverride(key, images[key]); });
    applying = false;
  }

  function apply(content, includeVisual) {
    contentState = content;
    document.querySelectorAll("[data-cms-text]").forEach(function (node) { var key = node.getAttribute("data-cms-text"); if (key && content.texts && content.texts[key]) node.textContent = content.texts[key]; });
    document.querySelectorAll("[data-cms-title]").forEach(function (node) { var key = node.getAttribute("data-cms-title"); if (key && content.texts && content.texts[key]) title(node, content.texts[key]); });
    document.querySelectorAll("[data-cms-image]").forEach(function (node) { var key = node.getAttribute("data-cms-image"), value = key && content.images && content.images[key]; if (imageAllowed(value)) node.setAttribute("src", value); });
    Object.keys(content.images || {}).forEach(function (key) {
      if (key.indexOf("wine.") !== 0 || !imageAllowed(content.images[key])) return;
      var id = key.slice(5), value = content.images[key]; window.VINI_IMAGES = window.VINI_IMAGES || {};
      var previous = window.VINI_IMAGES[id]; window.VINI_IMAGES[id] = value;
      document.querySelectorAll("img").forEach(function (image) { var source = image.getAttribute("src"); if (previous && (source === previous || source === "/" + previous)) image.setAttribute("src", value); });
      document.querySelectorAll('[data-vini-image="' + id + '"]').forEach(function (image) { image.setAttribute("src", value); var frame = image.closest && image.closest(".wcard-img"); if (frame) frame.style.setProperty("--wine-photo", 'url("' + value.replace(/["\\]/g, "") + '")'); });
    });
    document.querySelectorAll("[data-cms-legal]").forEach(function (node) { var key = node.getAttribute("data-cms-legal"); if (key && content.legal && content.legal[key]) legal(node, content.legal[key]); });
    if (window.VINI_I18N && typeof window.VINI_I18N.translate === "function") window.VINI_I18N.translate(document.body);
    if (includeVisual !== false) applyVisual(content);
    window.dispatchEvent(new CustomEvent("vini:content-ready", { detail: content }));
  }

  function contextLabel(element, value) {
    var section = element.closest && element.closest("section,article,header,footer,nav,form,main");
    var heading = section && section.querySelector("h1,h2,h3");
    var prefix = heading && heading.textContent && heading !== element ? heading.textContent.trim().slice(0, 55) + " · " : "";
    return prefix + element.tagName.toLowerCase() + " · " + String(value).trim().replace(/\s+/g, " ").slice(0, 90);
  }

  function localImage(value) {
    if (!value) return "";
    if (/^data:image\/(?:jpeg|png|webp);base64,/i.test(value)) return value;
    try { var url = new URL(value, location.href); if ((url.origin === location.origin || /(^|\.)vinidelite\.cz$/i.test(url.hostname)) && url.pathname.indexOf("/images/") === 0) return url.pathname; } catch (ignore) {}
    return imageAllowed(value) ? value : "";
  }

  function scan() {
    var texts = [], images = [], seen = {};
    texts.push({ key: "attr|document|title", type: "text", value: document.title, label: "SEO · titulek stránky" });
    var description = document.querySelector('meta[name="description"]');
    if (description) {
      var ds = selectorPath(description), dk = "attr|" + encodeURIComponent(ds) + "|content";
      texts.push({ key: dk, type: "text", value: description.getAttribute("content") || "", label: "SEO · popis stránky" }); seen[dk] = true;
    }
    var walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, {
      acceptNode: function (node) {
        var parent = node.parentElement;
        if (!parent || /^(SCRIPT|STYLE|NOSCRIPT|TEMPLATE)$/.test(parent.tagName) || parent.closest("[data-vini-editor-ignore]")) return NodeFilter.FILTER_REJECT;
        return node.nodeValue && node.nodeValue.trim() ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_REJECT;
      }
    });
    var textNode;
    while ((textNode = walker.nextNode())) {
      var parent = textNode.parentElement, selector = selectorPath(parent), index = Array.prototype.indexOf.call(parent.childNodes, textNode);
      if (!selector || index < 0) continue;
      var key = "text|" + encodeURIComponent(selector) + "|" + index;
      if (seen[key]) continue; seen[key] = true;
      texts.push({ key: key, type: "text", value: textNode.nodeValue, label: contextLabel(parent, textNode.nodeValue) });
    }
    ["placeholder", "aria-label", "title", "alt"].forEach(function (attribute) {
      document.querySelectorAll("[" + attribute + "]").forEach(function (node) {
        var selector = selectorPath(node), value = node.getAttribute(attribute) || "";
        if (!selector || !value.trim()) return;
        var key = "attr|" + encodeURIComponent(selector) + "|" + attribute;
        if (seen[key]) return; seen[key] = true;
        texts.push({ key: key, type: "text", value: value, label: (attribute === "alt" ? "Popis fotografie" : "Pomocný text") + " · " + value.slice(0, 90) });
      });
    });
    document.querySelectorAll("img[src]").forEach(function (node) {
      var selector = selectorPath(node), value = localImage(node.currentSrc || node.getAttribute("src"));
      if (!selector || !value) return;
      var key = "image|" + encodeURIComponent(selector);
      if (seen[key]) return; seen[key] = true;
      images.push({ key: key, type: "image", value: value, label: "Fotografie · " + (node.getAttribute("alt") || selector).slice(0, 100) });
    });
    document.querySelectorAll('video[poster],meta[property="og:image"]').forEach(function (node) {
      var attribute = node.tagName === "VIDEO" ? "poster" : "content";
      var selector = selectorPath(node), value = localImage(node.getAttribute(attribute));
      if (!selector || !value) return;
      var key = "attr|" + encodeURIComponent(selector) + "|" + attribute;
      if (seen[key]) return; seen[key] = true;
      images.push({ key: key, type: "image", value: value, label: node.tagName === "VIDEO" ? "Úvodní obrázek videa" : "SEO · obrázek pro sdílení" });
    });
    document.querySelectorAll("body *").forEach(function (node) {
      if (node.tagName === "IMG") return;
      var computed = getComputedStyle(node).backgroundImage;
      if (!computed || computed === "none") return;
      var match = computed.match(/url\(["']?([^"')]+)["']?\)/); if (!match) return;
      var value = localImage(match[1]), selector = selectorPath(node); if (!selector || !value) return;
      var key = "background|" + encodeURIComponent(selector); if (seen[key]) return; seen[key] = true;
      images.push({ key: key, type: "image", value: value, label: "Obrázek v pozadí · " + contextLabel(node, node.getAttribute("aria-label") || node.className || node.tagName) });
    });
    return { page: pageKey(), locale: locale(), texts: texts, images: images };
  }

  window.VINI_CMS_EDITOR = {
    scan: scan,
    preview: function (key, value) { setOverride(key, value); },
    setContent: function (content) { contentState = content; editorDraftReady = true; applyVisual(content); },
    refresh: function () { if (contentState) applyVisual(contentState); }
  };

  var observer = new MutationObserver(function () {
    if (applying || !contentState || (editorMode && !editorDraftReady)) return;
    clearTimeout(observerTimer);
    observerTimer = setTimeout(function () { applyVisual(contentState); }, 60);
  });
  observer.observe(document.documentElement, { childList: true, subtree: true });

  fetch("/api/vini/content", { credentials: "same-origin", headers: { Accept: "application/json" } })
    .then(function (response) { return response.ok ? response.json() : Promise.reject(); })
    .then(function (data) { if (data && data.content) apply(data.content, !editorMode); })
    .catch(function () { /* bezpečný statický obsah zůstává */ });
})();

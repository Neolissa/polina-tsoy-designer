;(function () {
  var LOCALES = ["ru", "en", "es"];
  var PUBLIC_PAGES = ["index.html", "docsbird.html", "wuw.html", "relaunch.html", "tvip.html", "privacy.html", "404.html"];

  function currentLangFromPath() {
    var match = window.location.pathname.match(/\/(ru|en|es)\//);
    return match ? match[1] : "ru";
  }

  function toLangUrl(lang) {
    var path = window.location.pathname;
    var file = path.substring(path.lastIndexOf("/") + 1) || "index.html";
    var target = PUBLIC_PAGES.indexOf(file) === -1 ? "index.html" : file;
    var nested = /\/(ru|en|es)\//.test(path);
    return (nested ? "../" : "") + lang + "/" + target;
  }

  function ariaLabel(lang) {
    if (lang === "ru") return "Выбор языка";
    if (lang === "es") return "Seleccionar idioma";
    return "Select language";
  }

  function ensureStyles() {
    if (document.getElementById("portfolio-lang-switch-style")) return;
    var style = document.createElement("style");
    style.id = "portfolio-lang-switch-style";
    style.textContent =
      ".lang-switch{display:inline-flex;align-items:center;border:1px solid #e5e7eb;background:#f3f4f6;border-radius:999px;padding:2px;gap:2px}" +
      ".lang-switch__btn{display:inline-flex;text-decoration:none;background:transparent;color:#6b7280;font-size:.72rem;font-weight:700;letter-spacing:.03em;padding:.28rem .55rem;border-radius:999px;line-height:1}" +
      ".lang-switch__btn.is-active{background:#fff;color:#111827;box-shadow:0 1px 2px rgba(0,0,0,.08)}" +
      ".lang-switch__btn:focus-visible{outline:2px solid #4f46e5;outline-offset:2px}" +
      "@media (max-width:640px){.lang-switch__btn{font-size:.56rem;padding:.16rem .34rem}}";
    document.head.appendChild(style);
  }

  function mountOne(dropdown) {
    if (!dropdown || dropdown.dataset.langSwitchMounted === "1") return;
    dropdown.dataset.langSwitchMounted = "1";
    ensureStyles();

    var lang = currentLangFromPath();
    var switcher = document.createElement("nav");
    switcher.className = "lang-switch";
    switcher.setAttribute("aria-label", ariaLabel(lang));
    dropdown.replaceChildren(switcher);

    LOCALES.forEach(function (btnLang) {
      var link = document.createElement("a");
      link.className = "lang-switch__btn";
      link.href = toLangUrl(btnLang);
      link.dataset.langSwitch = btnLang;
      link.textContent = btnLang.toUpperCase();
      switcher.appendChild(link);
    });

    dropdown.querySelectorAll("[data-lang-switch]").forEach(function (btn) {
      var btnLang = btn.getAttribute("data-lang-switch");
      var isActive = btnLang === lang;
      btn.classList.toggle("is-active", isActive);
      if (isActive) btn.setAttribute("aria-current", "page");
    });
  }

  function init() {
    document.querySelectorAll("[data-lang-dropdown]").forEach(mountOne);
  }

  window.initPortfolioLangSwitch = init;

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();

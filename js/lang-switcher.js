;(function () {
  function toLangUrl(lang) {
    var p = window.location.pathname;
    var file = p.substring(p.lastIndexOf("/") + 1) || "index.html";
    return "../" + lang + "/" + file;
  }

  function currentLangFromPath() {
    return window.location.pathname.indexOf("/en/") !== -1 ? "en" : "ru";
  }

  function ensureStyles() {
    if (document.getElementById("portfolio-lang-switch-style")) return;
    var style = document.createElement("style");
    style.id = "portfolio-lang-switch-style";
    style.textContent =
      ".lang-switch{display:inline-flex;align-items:center;border:1px solid #e5e7eb;background:#f3f4f6;border-radius:999px;padding:2px;gap:2px}" +
      ".lang-switch__btn{border:0;background:transparent;color:#6b7280;font-size:.72rem;font-weight:700;letter-spacing:.03em;padding:.28rem .6rem;border-radius:999px;cursor:pointer;line-height:1}" +
      ".lang-switch__btn.is-active{background:#fff;color:#111827;box-shadow:0 1px 2px rgba(0,0,0,.08)}" +
      "@media (max-width:640px){.lang-switch__btn{font-size:.58rem;padding:.16rem .42rem}}";
    document.head.appendChild(style);
  }

  function mountOne(dropdown) {
    if (!dropdown || dropdown.dataset.langSwitchMounted === "1") return;
    dropdown.dataset.langSwitchMounted = "1";
    ensureStyles();

    var lang = currentLangFromPath();
    dropdown.innerHTML =
      '<div class="lang-switch" role="group" aria-label="Language">' +
      '<button type="button" class="lang-switch__btn" data-lang-switch="ru">RU</button>' +
      '<button type="button" class="lang-switch__btn" data-lang-switch="en">EN</button>' +
      "</div>";

    dropdown.querySelectorAll("[data-lang-switch]").forEach(function (btn) {
      var btnLang = btn.getAttribute("data-lang-switch");
      var isActive = btnLang === lang;
      btn.classList.toggle("is-active", isActive);
      btn.setAttribute("aria-pressed", isActive ? "true" : "false");
      btn.addEventListener("click", function () {
        if (btnLang === lang) return;
        window.location.href = toLangUrl(btnLang);
      });
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

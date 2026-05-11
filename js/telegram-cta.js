(function () {
  function getLabel(lang) {
    return lang === "en" ? "Write to Telegram" : "Написать в Telegram";
  }

  function resolveLang(container) {
    var explicit = container.getAttribute("data-telegram-lang");
    if (explicit === "en" || explicit === "ru") return explicit;
    return (document.documentElement.lang || "ru").toLowerCase().indexOf("en") === 0 ? "en" : "ru";
  }

  function createMarkup(lang) {
    var label = getLabel(lang);
    return (
      '<a href="https://t.me/ewersawers" target="_blank" rel="noopener noreferrer" ' +
      'class="btn-primary bg-[#8b5cf6] text-white px-8 py-4 rounded-full text-lg font-semibold hover:bg-[#7c3aed] flex items-center gap-2">' +
      '<svg class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24" aria-hidden="true">' +
      '<path stroke-linecap="round" stroke-linejoin="round" d="M22 2 11 13"></path>' +
      '<path stroke-linecap="round" stroke-linejoin="round" d="m22 2-7 20-4-9-9-4 20-7Z"></path>' +
      "</svg>" +
      label +
      "</a>"
    );
  }

  document.addEventListener("DOMContentLoaded", function () {
    var containers = document.querySelectorAll("[data-telegram-cta]");
    containers.forEach(function (container) {
      container.innerHTML = createMarkup(resolveLang(container));
    });
  });
})();

(function () {
  var STORAGE_KEY = "portfolioConsentState";
  var OPEN_EVENT = "portfolio:consent-open";
  var CHANGE_EVENT = "portfolio:consent-change";
  var validStates = { accepted: true, rejected: true };

  function getStoredConsent() {
    try {
      var value = localStorage.getItem(STORAGE_KEY);
      return validStates[value] ? value : "unset";
    } catch (error) {
      return "unset";
    }
  }

  function saveConsent(state) {
    if (!validStates[state]) return;
    try {
      localStorage.setItem(STORAGE_KEY, state);
    } catch (error) {
      return;
    }
  }

  function dispatchConsentChange(state) {
    window.dispatchEvent(
      new CustomEvent(CHANGE_EVENT, {
        detail: { state: state }
      })
    );
  }

  function getCopy() {
    var isEn = document.documentElement.lang === "en";
    if (isEn) {
      return {
        description:
          "We use cookies and analytics (PostHog + Clarity) to improve the portfolio and validate hypotheses. Choose whether to allow analytics cookies.",
        onlyNecessary: "Only necessary",
        allowAnalytics: "Allow analytics",
        settingsLabel: "Cookie settings"
      };
    }
    return {
      description:
        "Мы используем cookies и аналитику (PostHog + Clarity), чтобы улучшать сайт и проверять продуктовые гипотезы. Выберите, разрешить ли аналитические cookies.",
      onlyNecessary: "Только необходимые",
      allowAnalytics: "Разрешить аналитику",
      settingsLabel: "Настройки cookies"
    };
  }

  function createBanner() {
    var copy = getCopy();
    var banner = document.createElement("div");
    banner.id = "consent-banner";
    banner.className =
      "fixed bottom-4 left-1/2 z-[120] w-[min(960px,calc(100%-2rem))] -translate-x-1/2 rounded-2xl border border-gray-200 bg-white p-4 shadow-2xl";
    banner.innerHTML =
      '<div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">' +
      '<p class="text-sm text-gray-700">' + copy.description + "</p>" +
      '<div class="flex shrink-0 gap-2">' +
      '<button type="button" data-consent-action="rejected" class="rounded-full border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-700">' + copy.onlyNecessary + "</button>" +
      '<button type="button" data-consent-action="accepted" class="rounded-full bg-black px-4 py-2 text-sm font-semibold text-white">' + copy.allowAnalytics + "</button>" +
      "</div>" +
      "</div>";
    document.body.appendChild(banner);
    return banner;
  }

  function openBanner() {
    var banner = document.getElementById("consent-banner") || createBanner();
    banner.classList.remove("hidden");
  }

  function closeBanner() {
    var banner = document.getElementById("consent-banner");
    if (banner) banner.classList.add("hidden");
  }

  function setConsent(state) {
    if (!validStates[state]) return;
    saveConsent(state);
    closeBanner();
    dispatchConsentChange(state);
  }

  function wireBannerEvents() {
    document.body.addEventListener("click", function (event) {
      var action = event.target && event.target.getAttribute("data-consent-action");
      if (action) {
        setConsent(action);
      }

      var openButton = event.target && event.target.closest("[data-open-consent-settings]");
      if (openButton) {
        openBanner();
      }
    });
  }

  function injectSettingsButtons() {
    var copy = getCopy();
    var footers = document.querySelectorAll("footer .border-t .flex.gap-6, footer .border-t .flex");
    footers.forEach(function (container) {
      if (container.querySelector("[data-open-consent-settings]")) return;
      var button = document.createElement("button");
      button.type = "button";
      button.setAttribute("data-open-consent-settings", "true");
      button.className = "hover:text-white transition-colors text-sm";
      button.textContent = copy.settingsLabel;
      container.appendChild(button);
    });
  }

  window.portfolioConsent = {
    getState: getStoredConsent,
    setState: setConsent,
    openSettings: openBanner,
    changeEvent: CHANGE_EVENT,
    openEvent: OPEN_EVENT
  };

  document.addEventListener("DOMContentLoaded", function () {
    wireBannerEvents();
    injectSettingsButtons();
    if (getStoredConsent() === "unset") {
      openBanner();
    }

    window.addEventListener(OPEN_EVENT, openBanner);
  });
})();

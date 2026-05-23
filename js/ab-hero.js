(function () {
  var STORAGE_KEY = "portfolioHeroVariant";

  function getExperimentConfig() {
    var cfg = window.PORTFOLIO_CONFIG || {};
    return cfg.experiments || {};
  }

  function getVariant() {
    try {
      var existing = localStorage.getItem(STORAGE_KEY);
      if (existing === "A" || existing === "B") return existing;
      var variants = getExperimentConfig().heroVariants || ["A", "B"];
      var selected = variants[Math.floor(Math.random() * variants.length)] || "A";
      localStorage.setItem(STORAGE_KEY, selected);
      return selected;
    } catch (error) {
      return "A";
    }
  }

  function applyHeroVariant(variant) {
    var title = document.querySelector("[data-hero-title]");
    var subtitle = document.querySelector("[data-hero-subtitle]");
    if (!title || !subtitle || variant !== "B") return;

    if (document.documentElement.lang === "en") {
      title.innerHTML =
        'UX|UI Product designer<br><span class="gradient-text">hypothesis → interface → outcome</span>';
      subtitle.innerHTML =
        "Research, design systems, and clear logic for B2C and complex B2B — so products grow through understandable UX.";
      return;
    }

    title.innerHTML =
      'Дизайнер интерфейсов в продукте<br><span class="gradient-text">гипотеза → интерфейс → результат</span>';
    subtitle.innerHTML =
      "Исследования, системы и ясная логика для B2C и сложных B2B — чтобы продукт рос через понятный UX.";
  }

  function trackExposure(variant) {
    if (!window.portfolioAnalytics) return;
    window.portfolioAnalytics.capture("hero_ab_exposed", {
      experiment_key: (getExperimentConfig().heroExperimentKey || "hero-headline-v1"),
      variant: variant
    });
  }

  document.addEventListener("DOMContentLoaded", function () {
    if (!document.querySelector("[data-hero-title]")) return;
    var variant = getVariant();
    applyHeroVariant(variant);
    trackExposure(variant);
    document.documentElement.setAttribute("data-hero-variant", variant);
  });
})();

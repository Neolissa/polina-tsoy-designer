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
        'I increase product metrics<br><span class="gradient-text">through system UX/UI design</span>';
      subtitle.innerHTML =
        "I help teams cut delivery time, increase conversion and retention, and build scalable B2C/B2B interfaces.";
      return;
    }

    title.innerHTML =
      'Увеличиваю продуктовые метрики<br><span class="gradient-text">через системный UX/UI дизайн</span>';
    subtitle.innerHTML =
      "Помогаю командам ускорять релизы, поднимать конверсию и удержание, и строить масштабируемые B2C/B2B интерфейсы.";
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

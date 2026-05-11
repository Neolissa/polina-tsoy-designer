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
        'I turn UX into measurable growth<br><span class="gradient-text">for product teams and founders</span>';
      subtitle.innerHTML =
        "I help teams increase conversion and retention, speed up delivery, and launch scalable B2C/B2B interfaces with fewer risks.";
      return;
    }

    title.innerHTML =
      'Превращаю UX в рост метрик<br><span class="gradient-text">для продуктовых команд и стартапов</span>';
    subtitle.innerHTML =
      "Помогаю командам повышать конверсию и удержание, ускорять релизы и строить масштабируемые B2C/B2B интерфейсы без лишнего техдолга.";
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

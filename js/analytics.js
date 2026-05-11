(function () {
  var SCROLL_MARKS = [25, 50, 75, 90];
  var LOCAL_EVENTS_KEY = "portfolioAnalyticsEvents";
  var MAX_LOCAL_EVENTS = 500;
  var reachedMarks = {};
  var loaded = false;
  var posthogReady = false;

  function getLang() {
    return document.documentElement.lang || "ru";
  }

  function getConsentState() {
    if (!window.portfolioConsent) return "unset";
    return window.portfolioConsent.getState();
  }

  function getConfig() {
    var cfg = window.PORTFOLIO_CONFIG || {};
    return cfg.analytics || {};
  }

  function loadScript(src, id, onLoad) {
    if (id && document.getElementById(id)) {
      if (typeof onLoad === "function") onLoad();
      return;
    }
    var script = document.createElement("script");
    script.src = src;
    script.async = true;
    if (id) script.id = id;
    if (typeof onLoad === "function") script.onload = onLoad;
    document.head.appendChild(script);
  }

  function initPosthog() {
    var cfg = getConfig();
    if (!cfg.posthogApiKey || !cfg.posthogHost || posthogReady) return;
    loadScript("https://cdn.jsdelivr.net/npm/posthog-js@1.154.0/dist/module.no-external.js", "posthog-sdk", function () {
      if (!window.posthog || posthogReady) return;
      window.posthog.init(cfg.posthogApiKey, {
        api_host: cfg.posthogHost,
        person_profiles: "identified_only",
        capture_pageview: true,
        persistence: "localStorage+cookie"
      });
      posthogReady = true;
      captureEvent("case_page_viewed", {
        page: window.location.pathname
      });
    });
  }

  function initClarity() {
    var projectId = getConfig().clarityProjectId;
    if (!projectId || window.clarity) return;
    (function (c, l, a, r, i, t, y) {
      c[a] =
        c[a] ||
        function () {
          (c[a].q = c[a].q || []).push(arguments);
        };
      t = l.createElement(r);
      t.async = 1;
      t.src = "https://www.clarity.ms/tag/" + i;
      y = l.getElementsByTagName(r)[0];
      y.parentNode.insertBefore(t, y);
    })(window, document, "clarity", "script", projectId);
  }

  function loadTrackersIfAllowed() {
    if (loaded) return;
    if (getConsentState() !== "accepted") return;
    initPosthog();
    initClarity();
    loaded = true;
  }

  function captureEvent(name, props) {
    if (getConsentState() !== "accepted") return;
    persistLocalEvent(name, props || {});
    if (window.posthog && typeof window.posthog.capture === "function") {
      window.posthog.capture(name, props || {});
    }
  }

  function persistLocalEvent(name, props) {
    try {
      var events = JSON.parse(localStorage.getItem(LOCAL_EVENTS_KEY) || "[]");
      events.push({
        name: name,
        props: props,
        ts: Date.now()
      });
      if (events.length > MAX_LOCAL_EVENTS) {
        events = events.slice(events.length - MAX_LOCAL_EVENTS);
      }
      localStorage.setItem(LOCAL_EVENTS_KEY, JSON.stringify(events));
    } catch (error) {
      return;
    }
  }

  function addBaseProps(props) {
    return Object.assign(
      {
        lang: getLang(),
        path: window.location.pathname
      },
      props || {}
    );
  }

  function wireClicks() {
    document.body.addEventListener("click", function (event) {
      var heroButton = event.target.closest('a[href="#cases"], a[data-track="hero-cta"]');
      if (heroButton) {
        captureEvent("hero_cta_clicked", addBaseProps({ location: "hero" }));
      }

      var caseCard = event.target.closest('a[href$="wuw.html"],a[href$="tvip.html"],a[href$="relaunch.html"],a[href$="docsbird.html"]');
      if (caseCard) {
        var href = caseCard.getAttribute("href") || "";
        var slug = href.replace(".html", "").split("/").pop();
        captureEvent("case_card_clicked", addBaseProps({ case_slug: slug }));
      }

      var tg = event.target.closest('a[href*="t.me/"]');
      if (tg) captureEvent("contact_click_telegram", addBaseProps());

      var mail = event.target.closest('a[href^="mailto:"]');
      if (mail) captureEvent("contact_click_email", addBaseProps());
    });
  }

  function wireScrollDepth() {
    window.addEventListener(
      "scroll",
      function () {
        var doc = document.documentElement;
        var scrollTop = doc.scrollTop || document.body.scrollTop;
        var maxScroll = doc.scrollHeight - doc.clientHeight;
        if (maxScroll <= 0) return;
        var depth = Math.round((scrollTop / maxScroll) * 100);

        SCROLL_MARKS.forEach(function (mark) {
          if (depth >= mark && !reachedMarks[mark]) {
            reachedMarks[mark] = true;
            captureEvent("scroll_depth_reached", addBaseProps({ depth_percent: mark }));
          }
        });
      },
      { passive: true }
    );
  }

  window.portfolioAnalytics = {
    capture: function (name, props) {
      captureEvent(name, addBaseProps(props));
    },
    getLocalEvents: function () {
      try {
        return JSON.parse(localStorage.getItem(LOCAL_EVENTS_KEY) || "[]");
      } catch (error) {
        return [];
      }
    }
  };

  document.addEventListener("DOMContentLoaded", function () {
    wireClicks();
    wireScrollDepth();
    loadTrackersIfAllowed();
    window.addEventListener("portfolio:consent-change", loadTrackersIfAllowed);
  });
})();

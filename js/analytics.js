(function () {
  var SCROLL_MARKS = [25, 50, 75, 90];
  var LOCAL_EVENTS_KEY = "portfolioAnalyticsEvents";
  var MAX_LOCAL_EVENTS = 500;
  var VISITOR_ID_KEY = "portfolioVisitorId";
  var POSTHOG_SCRIPT = "https://cdn.jsdelivr.net/npm/posthog-js@1.257.2/dist/array.full.js";
  var reachedMarks = {};
  var loaded = false;
  var posthogReady = false;
  var pendingEvents = [];
  var posthogOutboundQueue = [];

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

  function loadScript(src, id, onLoad, onError) {
    var existing = id ? document.getElementById(id) : null;
    if (existing) {
      if (existing.getAttribute("src") !== src) {
        existing.remove();
      } else if (existing.getAttribute("data-loaded") === "true") {
        if (typeof onLoad === "function") onLoad();
        return;
      } else {
        existing.addEventListener("load", function () {
          if (typeof onLoad === "function") onLoad();
        });
        existing.addEventListener("error", function () {
          if (typeof onError === "function") onError();
        });
        return;
      }
    }

    var script = document.createElement("script");
    script.src = src;
    script.async = true;
    if (id) script.id = id;
    script.onload = function () {
      script.setAttribute("data-loaded", "true");
      if (typeof onLoad === "function") onLoad();
    };
    if (typeof onError === "function") script.onerror = onError;
    document.head.appendChild(script);
  }

  function flushPosthogOutboundQueue() {
    if (!posthogReady || !window.posthog || typeof window.posthog.capture !== "function") return;
    if (!posthogOutboundQueue.length) return;
    var queue = posthogOutboundQueue.slice();
    posthogOutboundQueue = [];
    queue.forEach(function (item) {
      window.posthog.capture(item.name, item.props);
    });
  }

  function initPosthog() {
    var cfg = getConfig();
    if (!cfg.posthogApiKey || !cfg.posthogHost || posthogReady) return;
    loadScript(
      POSTHOG_SCRIPT,
      "posthog-sdk",
      function () {
        if (posthogReady) return;
        if (!window.posthog || typeof window.posthog.init !== "function") {
          console.warn("[portfolioAnalytics] PostHog SDK loaded but global is unavailable");
          return;
        }
        window.posthog.init(cfg.posthogApiKey, {
          api_host: cfg.posthogHost,
          person_profiles: "identified_only",
          capture_pageview: false,
          persistence: "localStorage+cookie"
        });
        posthogReady = true;
        flushPosthogOutboundQueue();
      },
      function () {
        console.warn("[portfolioAnalytics] PostHog SDK failed to load");
      }
    );
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
    if (getConsentState() !== "accepted") return;
    if (!loaded) {
      initPosthog();
      initClarity();
      loaded = true;
    }
    flushPendingEvents();
  }

  function sendToPosthog(name, props) {
    if (posthogReady && window.posthog && typeof window.posthog.capture === "function") {
      window.posthog.capture(name, props || {});
      return;
    }
    posthogOutboundQueue.push({ name: name, props: props || {} });
  }

  function sendEvent(name, props) {
    persistLocalEvent(name, props || {});
    if (getConsentState() === "accepted") {
      sendToPosthog(name, props);
    }
  }

  function captureEvent(name, props) {
    var payload = addBaseProps(props);
    if (getConsentState() !== "accepted") {
      pendingEvents.push({ name: name, props: payload });
      return;
    }
    sendEvent(name, payload);
  }

  function flushPendingEvents() {
    if (getConsentState() !== "accepted" || !pendingEvents.length) return;
    var queue = pendingEvents.slice();
    pendingEvents = [];
    queue.forEach(function (item) {
      sendEvent(item.name, item.props);
    });
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
        path: window.location.pathname,
        visitor_id: getVisitorId()
      },
      props || {}
    );
  }

  function getVisitorId() {
    try {
      var existing = localStorage.getItem(VISITOR_ID_KEY);
      if (existing) return existing;
      var generated = "v_" + Date.now().toString(36) + "_" + Math.random().toString(36).slice(2, 10);
      localStorage.setItem(VISITOR_ID_KEY, generated);
      return generated;
    } catch (error) {
      return "v_fallback";
    }
  }

  function extractCaseSlug(href) {
    if (!href) return "";
    var file = href.split("/").pop() || "";
    return file.replace(".html", "");
  }

  function wireClicks() {
    document.body.addEventListener("click", function (event) {
      var heroButton = event.target.closest('a[href="#cases"], a[data-track="hero-cta"]');
      if (heroButton) {
        captureEvent("hero_cta_clicked", {
          location: "hero",
          variant: document.documentElement.getAttribute("data-hero-variant") || "A"
        });
      }

      var caseCard = event.target.closest(
        'a[href*="wuw.html"],a[href*="tvip.html"],a[href*="relaunch.html"],a[href*="docsbird.html"],a[href*="ai-cases.html"]'
      );
      if (caseCard) {
        captureEvent("case_card_clicked", {
          case_slug: extractCaseSlug(caseCard.getAttribute("href") || "")
        });
      }

      var tg = event.target.closest('a[href*="t.me/"]');
      if (tg) captureEvent("contact_click_telegram", {});

      var mail = event.target.closest('a[href^="mailto:"]');
      if (mail) captureEvent("contact_click_email", {});
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
            captureEvent("scroll_depth_reached", { depth_percent: mark });
          }
        });
      },
      { passive: true }
    );
  }

  function capturePageView() {
    captureEvent("page_viewed", {
      page: window.location.pathname
    });
  }

  function onConsentChange() {
    loadTrackersIfAllowed();
    if (getConsentState() === "accepted") {
      capturePageView();
    }
  }

  window.portfolioAnalytics = {
    capture: function (name, props) {
      captureEvent(name, props);
    },
    getLocalEvents: function () {
      try {
        return JSON.parse(localStorage.getItem(LOCAL_EVENTS_KEY) || "[]");
      } catch (error) {
        return [];
      }
    },
    getPendingCount: function () {
      return pendingEvents.length;
    }
  };

  document.addEventListener("DOMContentLoaded", function () {
    wireClicks();
    wireScrollDepth();
    loadTrackersIfAllowed();
    if (getConsentState() === "accepted") capturePageView();
    window.addEventListener("portfolio:consent-change", onConsentChange);
  });
})();

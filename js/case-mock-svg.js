(function () {
  var MOCKS = "images/case-mocks/";

  function isLocalizedPage() {
    var path = window.location.pathname || "";
    return /\/ru\//.test(path) || /\/en\//.test(path);
  }

  function mocksPrefix() {
    return isLocalizedPage() ? "../" + MOCKS : MOCKS;
  }

  function assetUrl(relativePath) {
    var parts = String(relativePath).replace(/^\//, "").split("/");
    return mocksPrefix() + parts.map(encodeURIComponent).join("/");
  }

  var TVIP_SCREENS = {
    login: {
      night: { file: "tvip/login-night.webp", w: 1920, h: 935 },
      day: { file: "tvip/login-day.webp", w: 1920, h: 935 }
    },
    home: {
      night: { file: "tvip/home-night.webp", w: 1921, h: 1082, scroll: true },
      day: { file: "tvip/home-day.webp", w: 1920, h: 935, scroll: true }
    },
    detail: {
      night: { file: "tvip/home-night.webp", w: 1921, h: 1082, scroll: true },
      day: { file: "tvip/home-day.webp", w: 1920, h: 935, scroll: true }
    },
    "t-login": {
      night: { file: "tvip/tablet-onboarding.webp", w: 1025, h: 750 },
      day: { file: "tvip/tablet-onboarding.webp", w: 1025, h: 750 }
    },
    "t-home": {
      night: { file: "tvip/tablet-series.webp", w: 1024, h: 1122, scroll: true },
      day: { file: "tvip/tablet-series.webp", w: 1024, h: 1122, scroll: true }
    },
    "t-detail": {
      night: { file: "tvip/tablet-film.webp", w: 1024, h: 1070, scroll: true },
      day: { file: "tvip/tablet-film.webp", w: 1024, h: 1070, scroll: true }
    },
    "m-home": {
      night: { file: "tvip/mobile-home.webp", w: 360, h: 926 },
      day: { file: "tvip/mobile-home.webp", w: 360, h: 926 }
    },
    "m-filter": {
      night: { file: "tvip/mobile-filter.webp", w: 360, h: 1319, scroll: true },
      day: { file: "tvip/mobile-filter.webp", w: 360, h: 1319, scroll: true }
    }
  };

  function resolveTvipsScreen(screenId, appearance) {
    var group = TVIP_SCREENS[screenId];
    if (!group) return null;
    return group[appearance] || group.night || group.day;
  }

  function bindSmartScroll(el) {
    if (!el || el.dataset.scrollBound) return;
    el.dataset.scrollBound = "1";
    function sync() {
      var needs = el.scrollHeight > el.clientHeight + 2 || el.scrollWidth > el.clientWidth + 2;
      el.classList.toggle("case-mock-scroll--active", needs);
    }
    sync();
    el.addEventListener("scroll", sync);
    if (typeof ResizeObserver !== "undefined") {
      var ro = new ResizeObserver(sync);
      ro.observe(el);
    }
    window.addEventListener("resize", sync);
  }

  function appendClouds(layer) {
    var sky = document.createElement("div");
    sky.className = "tvip-mock-clouds";
    sky.setAttribute("aria-hidden", "true");
    for (var i = 0; i < 5; i++) {
      var c = document.createElement("span");
      c.className = "tvip-mock-cloud";
      c.style.setProperty("--i", String(i));
      sky.appendChild(c);
    }
    layer.appendChild(sky);
  }

  function appendOverlayItems(layer, config, onNavigate, isEn) {
    if (!config) return;
    if (config.clouds) appendClouds(layer);

    (config.items || []).forEach(function (item) {
      if (item.type === "row") {
        var row = document.createElement("div");
        row.className = "tvip-mock-row case-mock-scroll";
        row.style.left = item.x + "%";
        row.style.top = item.y + "%";
        row.style.width = item.w + "%";
        row.style.height = item.h + "%";
        var track = document.createElement("div");
        track.className = "tvip-mock-row__track";
        for (var n = 0; n < (item.count || 4); n++) {
          var card = document.createElement("button");
          card.type = "button";
          card.className = "tvip-mock-row__card";
          card.setAttribute("aria-label", (isEn ? "Title " : "Постер ") + (n + 1));
          if (n === 0 && onNavigate) {
            card.addEventListener("click", function () {
              onNavigate("detail");
            });
          }
          track.appendChild(card);
        }
        row.appendChild(track);
        layer.appendChild(row);
        bindSmartScroll(row);
        return;
      }

      if (item.type === "chips") {
        var wrap = document.createElement("div");
        wrap.className = "tvip-mock-chips";
        wrap.style.top = (item.y || 42) + "%";
        item.items.forEach(function (chip) {
          var b = document.createElement("button");
          b.type = "button";
          b.className = "tvip-mock-chip" + (chip.active ? " is-active" : "");
          b.textContent = chip.label;
          b.addEventListener("click", function () {
            wrap.querySelectorAll(".tvip-mock-chip").forEach(function (c) {
              c.classList.remove("is-active");
            });
            b.classList.add("is-active");
          });
          wrap.appendChild(b);
        });
        layer.appendChild(wrap);
        return;
      }

      if (item.type === "button") {
        var btn = document.createElement("button");
        btn.type = "button";
        btn.className = "tvip-mock-ui-btn tvip-mock-ui-btn--" + (item.variant || "primary");
        btn.style.left = item.x + "%";
        btn.style.top = item.y + "%";
        btn.style.width = item.w + "%";
        btn.style.height = item.h + "%";
        btn.textContent = item.label || "";
        if (!item.label) btn.classList.add("tvip-mock-ui-btn--icon");
        if (item.goto && onNavigate) {
          btn.addEventListener("click", function () {
            onNavigate(item.goto);
          });
        } else if (!item.goto) {
          btn.addEventListener("click", function () {
            btn.classList.add("is-pressed");
            setTimeout(function () {
              btn.classList.remove("is-pressed");
            }, 180);
          });
        }
        layer.appendChild(btn);
      }
    });
  }

  function buildMockStage(screen, onNavigate, overlayConfig, isEn) {
    var stage = document.createElement("div");
    stage.className = "case-mock-svg-stage";
    if (screen.scroll || (overlayConfig && overlayConfig.scroll)) {
      stage.classList.add("case-mock-svg-stage--scroll", "case-mock-scroll");
    }
    stage.style.setProperty("--mock-svg-ratio", screen.w + " / " + screen.h);

    var img = document.createElement("img");
    img.className = "case-mock-svg-img";
    img.alt = screen.alt || "";
    img.decoding = "async";
    img.loading = "eager";
    img.width = screen.w;
    img.height = screen.h;

    var loading = document.createElement("div");
    loading.className = "case-mock-svg-loading";
    loading.setAttribute("aria-hidden", "true");
    loading.textContent = isEn ? "Loading mock…" : "Загрузка макета…";

    stage.appendChild(loading);
    stage.appendChild(img);

    var layer = document.createElement("div");
    layer.className = "case-mock-svg-overlays";
    appendOverlayItems(layer, overlayConfig, onNavigate, isEn);
    stage.appendChild(layer);

    img.addEventListener("load", function () {
      stage.classList.add("is-loaded");
      loading.remove();
      bindSmartScroll(stage);
    });
    img.addEventListener("error", function () {
      loading.textContent = isEn ? "Failed to load mock." : "Не удалось загрузить макет.";
      stage.classList.add("is-error");
    });

    img.src = assetUrl(screen.file);
    return stage;
  }

  function mountTvipsScreen(host, screenId, appearance, onNavigate, isEn) {
    var screen = resolveTvipsScreen(screenId, appearance);
    if (!screen) return;
    var overlayConfig =
      window.TvipMockOverlays && window.TvipMockOverlays.get(screenId, appearance);
    host.innerHTML = "";
    host.classList.add("tvip-device-screen--svg");
    host.appendChild(buildMockStage(screen, onNavigate, overlayConfig, isEn));
  }

  window.CaseMockSvg = {
    assetUrl: assetUrl,
    TVIP_SCREENS: TVIP_SCREENS,
    mountTvipsScreen: mountTvipsScreen,
    bindSmartScroll: bindSmartScroll
  };
})();

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
      night: {
        file: "tvip/login-night.webp",
        w: 1920,
        h: 935,
        hotspots: [
          { x: 38, y: 68, w: 24, h: 12, goto: "home", label: "Войти" }
        ]
      },
      day: {
        file: "tvip/login-day.webp",
        w: 1920,
        h: 935,
        hotspots: [
          { x: 38, y: 68, w: 24, h: 12, goto: "home", label: "Sign in" }
        ]
      }
    },
    home: {
      night: {
        file: "tvip/home-night.webp",
        w: 1921,
        h: 1082,
        hotspots: []
      },
      day: {
        file: "tvip/home-day.webp",
        w: 1920,
        h: 935,
        hotspots: []
      }
    },
    "m-home": {
      night: {
        file: "tvip/mobile-home.webp",
        w: 360,
        h: 926,
        hotspots: [
          { x: 78, y: 4, w: 18, h: 8, goto: "m-filter", label: "Фильтр" },
          { x: 6, y: 28, w: 28, h: 18, goto: "m-filter", label: "Каталог" }
        ]
      },
      day: {
        file: "tvip/mobile-home.webp",
        w: 360,
        h: 926,
        hotspots: [
          { x: 78, y: 4, w: 18, h: 8, goto: "m-filter", label: "Filter" },
          { x: 6, y: 28, w: 28, h: 18, goto: "m-filter", label: "Catalog" }
        ]
      }
    },
    "m-filter": {
      night: {
        file: "tvip/mobile-filter.webp",
        w: 360,
        h: 1319,
        hotspots: [{ x: 4, y: 2, w: 14, h: 6, goto: "m-home", label: "Назад" }]
      },
      day: {
        file: "tvip/mobile-filter.webp",
        w: 360,
        h: 1319,
        hotspots: [{ x: 4, y: 2, w: 14, h: 6, goto: "m-home", label: "Back" }]
      }
    }
  };

  var COIN_SCREENS = {
    home: {
      file: "coin/home.webp",
      w: 1920,
      h: 2029,
      scroll: true,
      hotspots: [
        { x: 0, y: 12, w: 11, h: 10, goto: "profile", label: "Профиль" },
        { x: 12, y: 14, w: 8, h: 5, goto: "profile", label: "Аватар" }
      ]
    },
    profile: {
      file: "coin/profile.webp",
      w: 1920,
      h: 963,
      hotspots: [
        { x: 0, y: 4, w: 11, h: 8, goto: "home", label: "Главная" },
        { x: 0, y: 14, w: 11, h: 8, goto: "home", label: "Лента" }
      ]
    }
  };

  var DOCSBIRD_SCREENS = {
    agreement: {
      file: "docsbird/agreement.webp",
      w: 1371,
      h: 826,
      hotspots: [
        { x: 62, y: 78, w: 22, h: 12, goto: "dashboard", label: "Продолжить" }
      ]
    },
    dashboard: {
      file: "docsbird/dashboard.webp",
      w: 1440,
      h: 970,
      hotspots: [
        { x: 0, y: 18, w: 14, h: 10, goto: "agreement", label: "Соглашения" }
      ]
    }
  };

  function resolveTvipsScreen(screenId, appearance) {
    var group = TVIP_SCREENS[screenId];
    if (!group) return null;
    return group[appearance] || group.night || group.day;
  }

  function buildMockStage(screen, onNavigate) {
    var stage = document.createElement("div");
    stage.className = "case-mock-svg-stage";
    if (screen.scroll) stage.classList.add("case-mock-svg-stage--scroll");
    stage.style.setProperty("--mock-svg-ratio", screen.w + " / " + screen.h);

    var img = document.createElement("img");
    img.className = "case-mock-svg-img";
    img.alt = screen.alt || "";
    img.decoding = "async";
    img.loading = "lazy";
    img.width = screen.w;
    img.height = screen.h;

    var loading = document.createElement("div");
    loading.className = "case-mock-svg-loading";
    loading.setAttribute("aria-hidden", "true");
    loading.textContent = "Загрузка макета…";

    stage.appendChild(loading);
    stage.appendChild(img);

    var layer = document.createElement("div");
    layer.className = "case-mock-svg-hotspots";
    (screen.hotspots || []).forEach(function (h) {
      var btn = document.createElement("button");
      btn.type = "button";
      btn.className = "case-mock-hotspot";
      btn.style.left = h.x + "%";
      btn.style.top = h.y + "%";
      btn.style.width = h.w + "%";
      btn.style.height = h.h + "%";
      btn.setAttribute("aria-label", h.label || "Далее");
      btn.addEventListener("click", function () {
        if (h.goto && onNavigate) onNavigate(h.goto);
      });
      layer.appendChild(btn);
    });
    stage.appendChild(layer);

    img.addEventListener("load", function () {
      stage.classList.add("is-loaded");
      loading.remove();
    });
    img.addEventListener("error", function () {
      loading.textContent = "Не удалось загрузить макет.";
      stage.classList.add("is-error");
    });

    img.src = assetUrl(screen.file);
    return stage;
  }

  function mountTvipsScreen(host, screenId, appearance, onNavigate) {
    var screen = resolveTvipsScreen(screenId, appearance);
    if (!screen) return;
    host.innerHTML = "";
    host.classList.add("tvip-device-screen--svg");
    host.appendChild(buildMockStage(screen, onNavigate));
  }

  function mountSimpleMock(root, registry, initialId) {
    if (!root || root.dataset.svgMockReady === "1") return;

    var state = { screen: initialId || Object.keys(registry)[0] };

    var viewport = document.createElement("div");
    viewport.className = "case-mock-svg-viewport";
    root.appendChild(viewport);
    root.dataset.svgMockReady = "1";
    root.classList.add("case-mock-svg-root");

    function render() {
      var screen = registry[state.screen];
      if (!screen) return;
      viewport.innerHTML = "";
      viewport.appendChild(
        buildMockStage(screen, function (next) {
          if (registry[next]) {
            state.screen = next;
            render();
          }
        })
      );
    }

    root.__caseMockSvgReset = function () {
      state.screen = initialId || Object.keys(registry)[0];
      render();
    };

    render();
  }

  function mountCoinMock(root) {
    mountSimpleMock(root, COIN_SCREENS, "home");
  }

  function mountDocsbirdMock(root) {
    mountSimpleMock(root, DOCSBIRD_SCREENS, "agreement");
  }

  function resetMock(root) {
    if (root && typeof root.__caseMockSvgReset === "function") {
      root.__caseMockSvgReset();
      return;
    }
    if (root && root.dataset.tvipMockReady === "1" && typeof root.__tvipMockReset === "function") {
      root.__tvipMockReset();
    }
  }

  window.CaseMockSvg = {
    assetUrl: assetUrl,
    TVIP_SCREENS: TVIP_SCREENS,
    mountTvipsScreen: mountTvipsScreen,
    mountCoinMock: mountCoinMock,
    mountDocsbirdMock: mountDocsbirdMock,
    resetMock: resetMock
  };
})();

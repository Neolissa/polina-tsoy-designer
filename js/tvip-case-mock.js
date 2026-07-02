(function () {
  function resolveMockPath(root) {
    var base = root.getAttribute("data-mock-base");
    if (base) return base.replace(/\/?$/, "/") + "tvip-screens.html";
    var path = window.location.pathname || "";
    if (/\/ru\//.test(path) || /\/en\//.test(path)) {
      return "../components/case-mocks/tvip-screens.html";
    }
    return "components/case-mocks/tvip-screens.html";
  }

  function resolveAssetBase(root) {
    var custom = root.getAttribute("data-asset-base");
    if (custom) return custom.replace(/\/?$/, "/");
    var path = window.location.pathname || "";
    if (/\/ru\//.test(path) || /\/en\//.test(path)) {
      return "../images/case-mocks/tvip/";
    }
    return "images/case-mocks/tvip/";
  }

  function applyAssets(root, host) {
    var base = resolveAssetBase(root);
    host.querySelectorAll("[data-tvip-src]").forEach(function (el) {
      var rel = el.getAttribute("data-tvip-src");
      if (rel) el.src = base + rel;
    });
  }

  function buildControls(isEn) {
    var controls = document.createElement("aside");
    controls.className = "tvip-interactive-mock__controls";
    controls.innerHTML =
      '<div><p class="tvip-mock-label">' +
      (isEn ? "Device" : "Устройство") +
      '</p><div class="tvip-mock-segmented" role="group">' +
      '<button type="button" class="tvip-mock-segment active" data-tvip-device="desktop">Desktop</button>' +
      '<button type="button" class="tvip-mock-segment" data-tvip-device="tablet">Tablet</button>' +
      '<button type="button" class="tvip-mock-segment" data-tvip-device="mobile">Mobile</button>' +
      "</div></div>" +
      '<div><p class="tvip-mock-label">' +
      (isEn ? "Theme" : "Тема") +
      '</p><div class="tvip-mock-theme-toggle" role="group">' +
      '<button type="button" class="tvip-mock-theme-btn" data-tvip-appearance="day">' +
      (isEn ? "Day" : "День") +
      '</button><button type="button" class="tvip-mock-theme-btn active" data-tvip-appearance="night">' +
      (isEn ? "Night" : "Ночь") +
      "</button></div></div>" +
      '<p class="tvip-mock-hint">' +
      (isEn
        ? "Single-screen demo: switch device, day/night theme, and Movie/Channel tab."
        : "Одноэкранный демо-режим: меняйте девайс, тему день/ночь и таб Фильм/Канал.") +
      "</p>";
    return controls;
  }

  function buildShell() {
    var wrap = document.createElement("div");
    wrap.className = "tvip-interactive-mock__device";
    wrap.innerHTML =
      '<div class="tvip-device-frame"><div class="tvip-device-chrome"><div class="tvip-device-bar" aria-hidden="true"></div><div class="tvip-device-screen tvip-device-screen--html" data-tvip-screen-host></div></div></div>';
    return wrap;
  }

  function setContentTab(app, contentType) {
    app.querySelectorAll("[data-tvip-home-panel]").forEach(function (panel) {
      var match = panel.getAttribute("data-tvip-home-panel") === contentType;
      panel.classList.toggle("is-active", match);
      panel.hidden = !match;
    });
    app.querySelectorAll("[data-tvip-content]").forEach(function (btn) {
      var active = btn.getAttribute("data-tvip-content") === contentType;
      btn.classList.toggle("active", active);
      btn.setAttribute("aria-selected", active ? "true" : "false");
    });
  }

  function mountTvips(root) {
    if (!root || root.querySelector(".tvip-interactive-mock__device")) return;

    var isEn = (root.getAttribute("data-lang") || "").indexOf("en") === 0;
    var state = {
      device: root.getAttribute("data-device") || "desktop",
      appearance: root.getAttribute("data-appearance") || "night",
      contentType: "movie"
    };

    root.classList.add("tvip-interactive-mock");
    root.dataset.device = state.device;
    root.dataset.appearance = state.appearance;

    var shell = buildShell();
    var host = shell.querySelector("[data-tvip-screen-host]");
    var controls = buildControls(isEn);
    root.appendChild(shell);
    root.appendChild(controls);

    function syncControls() {
      controls.querySelectorAll("[data-tvip-device]").forEach(function (b) {
        b.classList.toggle("active", b.getAttribute("data-tvip-device") === state.device);
      });
      controls.querySelectorAll("[data-tvip-appearance]").forEach(function (b) {
        b.classList.toggle("active", b.getAttribute("data-tvip-appearance") === state.appearance);
      });
    }

    function bindUi() {
      var app = host.querySelector("[data-tvip-app]");
      if (!app || app.dataset.tvipBound === "1") return;
      app.dataset.tvipBound = "1";
      setContentTab(app, state.contentType);
      app.addEventListener("click", function (e) {
        var tab = e.target.closest("[data-tvip-content]");
        if (!tab) return;
        state.contentType = tab.getAttribute("data-tvip-content") || "movie";
        setContentTab(app, state.contentType);
      });
    }

    function load() {
      return fetch(resolveMockPath(root))
        .then(function (r) {
          if (!r.ok) throw new Error("tvip-screens");
          return r.text();
        })
        .then(function (html) {
          host.innerHTML = html;
          applyAssets(root, host);
          bindUi();
        });
    }

    controls.addEventListener("click", function (e) {
      var deviceBtn = e.target.closest("[data-tvip-device]");
      if (deviceBtn) {
        state.device = deviceBtn.getAttribute("data-tvip-device");
        root.dataset.device = state.device;
        syncControls();
      }
      var themeBtn = e.target.closest("[data-tvip-appearance]");
      if (themeBtn) {
        state.appearance = themeBtn.getAttribute("data-tvip-appearance");
        root.dataset.appearance = state.appearance;
        syncControls();
      }
    });

    root.__tvipMockReset = function () {
      state.device = root.getAttribute("data-device") || "desktop";
      state.appearance = root.getAttribute("data-appearance") || "night";
      state.contentType = "movie";
      root.dataset.device = state.device;
      root.dataset.appearance = state.appearance;
      load().then(syncControls);
    };

    load()
      .then(syncControls)
      .catch(function () {
        host.innerHTML =
          '<p style="padding:1rem;text-align:center;color:#6b7280;font-size:0.8rem">Не удалось загрузить демо.</p>';
      });
  }

  window.mountTvipsCaseMock = mountTvips;

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", function () {
      document.querySelectorAll("[data-tvip-case-mock]").forEach(mountTvips);
    });
  } else {
    document.querySelectorAll("[data-tvip-case-mock]").forEach(mountTvips);
  }
})();

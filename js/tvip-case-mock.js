(function () {
  var DEVICE_ENTRY = {
    desktop: "login",
    tablet: "login",
    mobile: "m-home"
  };

  var DEVICE_DEFAULT = {
    desktop: "login",
    tablet: "login",
    mobile: "m-home"
  };

  function buildControls(root, labels) {
    labels = labels || {};
    var deviceLabel = labels.device || "Устройство";
    var themeLabel = labels.theme || "Тема";
    var hint =
      labels.hint ||
      "Макеты из Figma. На экране входа нажмите «Войти»; на мобилке — каталог и фильтр.";
    var themeAutoTitle = labels.themeAutoTitle || "Автоматическое переключение";
    var themePaletteTitle = labels.themePaletteTitle || "Единая палитра";
    var themeAuto =
      labels.themeAuto ||
      "Тема меняется автоматически в зависимости от времени суток или системы освещения устройства";
    var themePalette =
      labels.themePalette ||
      "Обе темы используют одинаковые базовые цвета, подобранные для контрастности";

    var controls = document.createElement("aside");
    controls.className = "tvip-interactive-mock__controls";
    controls.setAttribute("aria-label", "Настройки демо TVIP");

    controls.innerHTML =
      '<div><p class="tvip-mock-label">' +
      deviceLabel +
      '</p><div class="tvip-mock-segmented" data-tvip-device-group role="group">' +
      '<button type="button" class="tvip-mock-segment active" data-tvip-device="desktop"><span class="tvip-mock-segment__icon">🖥</span> Desktop</button>' +
      '<button type="button" class="tvip-mock-segment" data-tvip-device="tablet"><span class="tvip-mock-segment__icon">📱</span> Tablet</button>' +
      '<button type="button" class="tvip-mock-segment" data-tvip-device="mobile"><span class="tvip-mock-segment__icon">📲</span> Mobile</button>' +
      "</div></div>" +
      '<div><p class="tvip-mock-label">' +
      themeLabel +
      '</p><div class="tvip-mock-theme-toggle" role="group">' +
      '<button type="button" class="tvip-mock-theme-btn" data-tvip-appearance="day">☀️ День</button>' +
      '<button type="button" class="tvip-mock-theme-btn active" data-tvip-appearance="night">🌙 Ночь</button>' +
      "</div>" +
      '<div class="tvip-mock-theme-notes">' +
      '<p class="tvip-mock-theme-note"><span class="tvip-mock-theme-note__title">' +
      themeAutoTitle +
      "</span> " +
      themeAuto +
      "</p>" +
      '<p class="tvip-mock-theme-note"><span class="tvip-mock-theme-note__title">' +
      themePaletteTitle +
      "</span> " +
      themePalette +
      "</p></div></div>" +
      '<p class="tvip-mock-hint">' +
      hint +
      "</p>";

    return controls;
  }

  function buildDeviceShell() {
    var wrap = document.createElement("div");
    wrap.className = "tvip-interactive-mock__device";
    wrap.innerHTML =
      '<div class="tvip-device-frame">' +
      '<div class="tvip-device-chrome">' +
      '<div class="tvip-device-bar" aria-hidden="true"></div>' +
      '<div class="tvip-device-screen" data-tvip-screen-host></div>' +
      "</div></div>";
    return wrap;
  }

  function screenForState(state) {
    if (state.device === "mobile") return state.screen;
    if (state.screen === "m-home" || state.screen === "m-filter") {
      return "login";
    }
    return state.screen;
  }

  function mountTvips(root) {
    if (!root || root.dataset.tvipMockReady === "1") return;
    if (!window.CaseMockSvg) return;

    var appearance = root.getAttribute("data-appearance") || "night";
    var device = root.getAttribute("data-device") || "desktop";
    var isEn = (root.getAttribute("data-lang") || "").indexOf("en") === 0;

    root.classList.add("tvip-interactive-mock");
    root.dataset.appearance = appearance;
    root.dataset.device = device;

    var deviceWrap = buildDeviceShell();
    var screenHost = deviceWrap.querySelector("[data-tvip-screen-host]");
    var controls = buildControls(root, {
      device: isEn ? "Device" : "Устройство",
      theme: isEn ? "Theme" : "Тема",
      hint: isEn
        ? "Figma mocks. Tap Sign in on login; on mobile — catalog and filter."
        : undefined,
      themeAutoTitle: isEn ? "Automatic switching" : undefined,
      themePaletteTitle: isEn ? "Single palette" : undefined,
      themeAuto: isEn
        ? "Theme switches automatically based on time of day or device lighting."
        : undefined,
      themePalette: isEn
        ? "Both themes share the same base colors tuned for contrast."
        : undefined
    });

    root.appendChild(deviceWrap);
    root.appendChild(controls);
    root.dataset.tvipMockReady = "1";

    var state = {
      device: device,
      appearance: appearance,
      screen: DEVICE_ENTRY[device] || "login",
      backStack: []
    };

    function syncControls() {
      controls.querySelectorAll("[data-tvip-device]").forEach(function (b) {
        b.classList.toggle("active", b.getAttribute("data-tvip-device") === state.device);
      });
      controls.querySelectorAll("[data-tvip-appearance]").forEach(function (b) {
        b.classList.toggle("active", b.getAttribute("data-tvip-appearance") === state.appearance);
      });
    }

    function renderScreen() {
      var id = screenForState(state);
      state.screen = id;
      root.dataset.device = state.device;
      root.dataset.appearance = state.appearance;
      window.CaseMockSvg.mountTvipsScreen(screenHost, id, state.appearance, function (next) {
        state.backStack.push(state.screen);
        state.screen = next;
        renderScreen();
      });
    }

    root.__tvipMockReset = function () {
      state.device = root.getAttribute("data-device") || "desktop";
      state.appearance = root.getAttribute("data-appearance") || "night";
      state.screen = DEVICE_ENTRY[state.device] || "login";
      state.backStack = [];
      syncControls();
      renderScreen();
    };

    renderScreen();
    syncControls();

    controls.addEventListener("click", function (e) {
      var devBtn = e.target.closest("[data-tvip-device]");
      if (devBtn) {
        state.device = devBtn.getAttribute("data-tvip-device");
        state.backStack = [];
        state.screen = DEVICE_ENTRY[state.device] || "login";
        renderScreen();
        syncControls();
        return;
      }

      var themeBtn = e.target.closest("[data-tvip-appearance]");
      if (themeBtn) {
        state.appearance = themeBtn.getAttribute("data-tvip-appearance");
        renderScreen();
        syncControls();
      }
    });
  }

  window.mountTvipsCaseMock = mountTvips;

  function autoMount() {
    document.querySelectorAll("[data-tvip-case-mock]").forEach(mountTvips);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", autoMount);
  } else {
    autoMount();
  }
})();

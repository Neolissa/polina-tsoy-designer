(function () {
  var ONB_STEPS = [
    { title: "Разные профили для разных людей", desc: "Каждый член семьи получает персональные рекомендации" },
    { title: "Безопасный режим и гибкая настройка детских профилей", desc: "Контроль контента и времени просмотра для детей" },
    { title: "С заботой о старшем поколении", desc: "Простой интерфейс и крупный шрифт" }
  ];

  var ONB_STEPS_EN = [
    { title: "Different profiles for different people", desc: "Each family member gets personal recommendations" },
    { title: "Safe mode for kids' profiles", desc: "Flexible content and screen time settings" },
    { title: "Caring for the older generation", desc: "Simple interface and large fonts" }
  ];

  var DEVICE_ENTRY = {
    desktop: "start",
    tablet: "tablet-profile",
    mobile: "m-home"
  };

  var SCREEN_ANNOUNCE = {
    ru: {
      start: "Экран приветствия",
      login: "Вход в аккаунт",
      "logged-in": "Успешный вход",
      profile: "Новый профиль",
      onboarding: "Зачем нужен профиль",
      home: "Главная — Телевидение",
      detail: "Карточка",
      "tablet-profile": "Первый вход",
      "tablet-survey": "Выбор жанров",
      "home-tablet": "Фильмы",
      "series-tablet": "Сериалы — Инспектор Купер",
      "tv-tablet": "ТВ шоу — По ту сторону",
      "detail-tablet": "Дом 2",
      "m-home": "Главная на телефоне",
      "m-filter": "Фильтры",
      "m-detail": "Карточка на телефоне",
      player: "Плеер",
      "player-tablet": "Плеер на планшете",
      "m-player": "Плеер на телефоне",
      "m-profile": "Профиль",
      settings: "Настройки профиля"
    },
    en: {
      start: "Welcome screen",
      login: "Sign in",
      "logged-in": "Signed in",
      profile: "New profile",
      onboarding: "Why profiles",
      home: "Home — Television",
      detail: "Title details",
      "tablet-profile": "First login",
      "tablet-survey": "Genre selection",
      "home-tablet": "Movies",
      "series-tablet": "Series — Inspector Cooper",
      "tv-tablet": "TV shows — The Other Side",
      "detail-tablet": "Dom 2",
      "m-home": "Mobile home",
      "m-filter": "Filters",
      "m-detail": "Title on mobile",
      player: "Player",
      "player-tablet": "Tablet player",
      "m-player": "Mobile player",
      "m-profile": "Profile",
      settings: "Profile settings"
    }
  };

  var NAV_TO_PANEL = {
    tv: "tv",
    cinema: "cinema",
    cctv: "cctv",
    "Телевидение": "tv",
    "Кино": "cinema",
    "Видеонаблюдение": "cctv"
  };

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

  function applyTvipAssets(root, screenHost) {
    var base = resolveAssetBase(root);
    screenHost.querySelectorAll("[data-tvip-src]").forEach(function (el) {
      var rel = el.getAttribute("data-tvip-src");
      if (rel) el.src = base + rel;
    });
  }

  function showToast(app, message, duration) {
    if (!app) return;
    duration = duration || 2000;
    var container = app.querySelector("[data-tvip-toast-container]");
    if (!container) return;
    var toast = document.createElement("div");
    toast.className = "tvip-toast";
    toast.textContent = message;
    container.appendChild(toast);
    requestAnimationFrame(function () {
      toast.classList.add("is-visible");
    });
    setTimeout(function () {
      toast.classList.remove("is-visible");
      setTimeout(function () { toast.remove(); }, 260);
    }, duration);
  }

  function buildControls(root, labels) {
    labels = labels || {};
    var controls = document.createElement("aside");
    controls.className = "tvip-interactive-mock__controls";
    controls.setAttribute("aria-label", labels.controlsAria || "Настройки демо TVIP");

    controls.innerHTML =
      '<div><p class="tvip-mock-label">' +
      (labels.device || "Устройство") +
      '</p><div class="tvip-mock-segmented" role="group">' +
      '<button type="button" class="tvip-mock-segment active" data-tvip-device="desktop"><span class="tvip-mock-segment__icon"><svg width="16" height="16" viewBox="0 0 16 16" fill="none"><rect x="1" y="2" width="14" height="10" rx="1.5" stroke="currentColor" stroke-width="1.3"/><path d="M5 14h6M8 12v2" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"/></svg></span> Desktop</button>' +
      '<button type="button" class="tvip-mock-segment" data-tvip-device="tablet"><span class="tvip-mock-segment__icon"><svg width="16" height="16" viewBox="0 0 16 16" fill="none"><rect x="3" y="1" width="10" height="14" rx="1.5" stroke="currentColor" stroke-width="1.3"/><circle cx="8" cy="13" r="0.8" fill="currentColor"/></svg></span> Tablet</button>' +
      '<button type="button" class="tvip-mock-segment" data-tvip-device="mobile"><span class="tvip-mock-segment__icon"><svg width="16" height="16" viewBox="0 0 16 16" fill="none"><rect x="4" y="1" width="8" height="14" rx="1.5" stroke="currentColor" stroke-width="1.3"/><path d="M7 12.5h2" stroke="currentColor" stroke-width="1" stroke-linecap="round"/></svg></span> Mobile</button>' +
      "</div></div>" +
      '<div><p class="tvip-mock-label">' +
      (labels.theme || "Тема") +
      '</p><div class="tvip-mock-theme-toggle" role="group">' +
      '<button type="button" class="tvip-mock-theme-btn" data-tvip-appearance="day"><svg width="16" height="16" viewBox="0 0 16 16" fill="none"><circle cx="8" cy="8" r="3.5" stroke="currentColor" stroke-width="1.3"/><path d="M8 1.5v1.5M8 13v1.5M1.5 8H3M13 8h1.5M3.4 3.4l1 1M11.6 11.6l1 1M3.4 12.6l1-1M11.6 4.4l1-1" stroke="currentColor" stroke-width="1.2" stroke-linecap="round"/></svg> День</button>' +
      '<button type="button" class="tvip-mock-theme-btn active" data-tvip-appearance="night"><svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M13.5 9.5A6 6 0 016.5 2.5 6 6 0 1013.5 9.5z" stroke="currentColor" stroke-width="1.3"/></svg> Ночь</button>' +
      "</div>" +
      '<div class="tvip-mock-theme-notes">' +
      '<p class="tvip-mock-theme-note"><span class="tvip-mock-theme-note__title">' +
      (labels.themeAutoTitle || "Автоматическое переключение") +
      "</span> " +
      (labels.themeAuto ||
        "Тема меняется автоматически в зависимости от времени суток или системы освещения устройства") +
      "</p>" +
      '<p class="tvip-mock-theme-note"><span class="tvip-mock-theme-note__title">' +
      (labels.themePaletteTitle || "Единая палитра") +
      "</span> " +
      (labels.themePalette ||
        "Обе темы используют одинаковые базовые цвета, подобранные для контрастности") +
      "</p></div></div>" +
      '<p class="tvip-mock-hint">' +
      (labels.hint ||
        "Живой прототип: приветствие → вход → профиль → онбординг → главная → карточка. Все кнопки кликабельны.") +
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
      '<div class="tvip-device-screen tvip-device-screen--html" data-tvip-screen-host></div>' +
      "</div></div>";
    return wrap;
  }

  function screensForDevice(app, device) {
    return Array.prototype.filter.call(app.querySelectorAll("[data-tvip-screen]"), function (s) {
      var devices = (s.getAttribute("data-tvip-devices") || "").split(",");
      return devices.indexOf(device) !== -1;
    });
  }

  function showScreen(app, id, device) {
    app.querySelectorAll("[data-tvip-screen]").forEach(function (s) {
      var devices = (s.getAttribute("data-tvip-devices") || "").split(",");
      var matchDevice = devices.indexOf(device) !== -1;
      var active = matchDevice && s.getAttribute("data-tvip-screen") === id;
      s.classList.toggle("is-active", active);
      s.hidden = !active;
    });
  }

  function announceScreen(app, state, isEn) {
    if (!app) return;
    var announcer = app.querySelector("[data-tvip-announcer]");
    if (!announcer) return;
    var map = isEn ? SCREEN_ANNOUNCE.en : SCREEN_ANNOUNCE.ru;
    var text = map[state.screen] || "";
    if (text) announcer.textContent = text;
  }

  function syncMobileNav(app, screenId) {
    if (!app) return;
    var tabByScreen = {
      "m-home": "home",
      "m-filter": "catalog",
      "m-detail": "catalog",
      "m-player": "catalog",
      "m-profile": "profile"
    };
    var activeTab = tabByScreen[screenId] || "home";
    app.querySelectorAll("[data-tvip-mobile-nav]").forEach(function (nav) {
      nav.querySelectorAll("button[data-tvip-mobile-tab]").forEach(function (btn) {
        var tab = btn.getAttribute("data-tvip-mobile-tab");
        var isToastOnly = tab === "tv" || tab === "downloads";
        btn.classList.toggle("active", tab === activeTab && !isToastOnly && !btn.disabled);
      });
    });
  }

  function syncTabletSections(app, screenId) {
    if (!app) return;
    var sectionByScreen = {
      "home-tablet": "home-tablet",
      "series-tablet": "series-tablet",
      "tv-tablet": "tv-tablet",
      "detail-tablet": "home-tablet",
      "player-tablet": "home-tablet"
    };
    var activeTarget = sectionByScreen[screenId];
    if (!activeTarget) return;
    app.querySelectorAll(".tvip-tablet-section[data-tvip-goto]").forEach(function (btn) {
      var target = btn.getAttribute("data-tvip-goto");
      btn.classList.toggle("active", target === activeTarget);
    });
  }

  function setHomePanel(app, panelId) {
    var home = app.querySelector('[data-tvip-screen="home"]');
    if (!home) return;
    home.querySelectorAll("[data-tvip-home-panel]").forEach(function (panel) {
      var match = panel.getAttribute("data-tvip-home-panel") === panelId;
      panel.classList.toggle("is-active", match);
      panel.hidden = !match;
    });
    home.querySelectorAll("[data-tvip-nav]").forEach(function (btn) {
      var nav = btn.getAttribute("data-tvip-nav");
      btn.classList.toggle("active", nav === panelId);
    });
  }

  function applyDevice(state, screenHost, controls, isEn) {
    var app = screenHost.querySelector("[data-tvip-app]");
    if (!app) return;
    var allowed = screensForDevice(app, state.device);
    var validIds = allowed.map(function (s) {
      return s.getAttribute("data-tvip-screen");
    });
    if (validIds.indexOf(state.screen) === -1) {
      state.screen = DEVICE_ENTRY[state.device] || validIds[0];
    }
    showScreen(app, state.screen, state.device);
    syncMobileNav(app, state.screen);
    syncTabletSections(app, state.screen);
    if (state.screen === "home" && state.homePanel) {
      setHomePanel(app, state.homePanel);
    }
    bindSmartScroll(screenHost);
    announceScreen(app, state, isEn);
  }

  function bindSmartScroll(host) {
    if (!host || host.dataset.scrollBound) return;
    host.dataset.scrollBound = "1";
    host.querySelectorAll(
      ".tvip-body, .tvip-home-main, .tvip-poster-row, .tvip-body--mobile, .tvip-mob-filter-body, .tvip-channel-list, .tvip-survey-scene"
    ).forEach(function (el) {
      function sync() {
        var needs =
          el.scrollHeight > el.clientHeight + 2 || el.scrollWidth > el.clientWidth + 2;
        el.classList.toggle("case-mock-scroll--active", needs);
        el.classList.toggle("tvip-poster-row--overflow", needs && el.classList.contains("tvip-poster-row"));
      }
      el.classList.add("case-mock-scroll");
      sync();
      if (typeof ResizeObserver !== "undefined") {
        var ro = new ResizeObserver(sync);
        ro.observe(el);
      }
    });
  }

  function updateOnboarding(app, state, isEn, assetRoot) {
    if (!app) return;
    var panel = app.querySelector('[data-tvip-screen="onboarding"]');
    if (!panel) return;
    var steps = isEn ? ONB_STEPS_EN : ONB_STEPS;
    var step = steps[state.onbStep];
    var title = panel.querySelector("[data-tvip-onb-title]");
    var desc = panel.querySelector("[data-tvip-onb-desc]");
    var btn = panel.querySelector("[data-tvip-onb-next]");
    var dots = panel.querySelectorAll(".tvip-onb-dot");
    if (title) title.textContent = step.title;
    if (desc) desc.textContent = step.desc;
    if (btn) {
      btn.textContent =
        state.onbStep === steps.length - 1
          ? isEn
            ? "Create profile"
            : "Создать профиль"
          : isEn
            ? "Next"
            : "Далее";
    }
    dots.forEach(function (d, i) {
      d.classList.toggle("active", i === state.onbStep);
    });

    var onbImg = panel.querySelector("[data-tvip-onb-img]");
    if (onbImg) {
      var stepNum = state.onbStep + 1;
      var theme = state.appearance === "day" ? "day" : "night";
      onbImg.setAttribute("data-tvip-src", "onboarding/onb-" + stepNum + "-" + theme + ".svg");
      var base = assetRoot || resolveAssetBase(panel.closest("[data-tvip-case-mock]"));
      onbImg.src = base + "onboarding/onb-" + stepNum + "-" + theme + ".svg";
    }
  }

  function navigateTo(state, screenHost, controls, isEn, nextScreen, options) {
    options = options || {};
    if (!options.replace && state.screen !== nextScreen) {
      state.backStack.push(state.screen);
    }
    state.screen = nextScreen;
    if (options.homePanel) state.homePanel = options.homePanel;
    applyDevice(state, screenHost, controls, isEn);
  }

  function navigateBack(state, screenHost, controls, isEn, fallbackTarget) {
    if (fallbackTarget) {
      state.screen = fallbackTarget;
    } else if (state.backStack.length) {
      state.screen = state.backStack.pop();
    } else {
      state.screen = DEVICE_ENTRY[state.device] || "start";
    }
    applyDevice(state, screenHost, controls, isEn);
  }

  function bindTvips(root, screenHost, state, isEn, controls) {
    var app = screenHost.querySelector("[data-tvip-app]");
    if (!app || app.dataset.tvipBound) return;
    app.dataset.tvipBound = "1";

    app.addEventListener("click", function (e) {
      var watchBtn = e.target.closest("[data-tvip-watch]");
      if (watchBtn) {
        var playerScreen = state.device === "tablet" ? "player-tablet" : state.device === "mobile" ? "m-player" : "player";
        navigateTo(state, screenHost, controls, isEn, playerScreen);
        return;
      }

      var link = e.target.closest("a[href]");
      if (link && link.getAttribute("href") === "#") {
        e.preventDefault();
        var gotoFromLink = link.getAttribute("data-tvip-goto");
        if (gotoFromLink) {
          navigateTo(state, screenHost, controls, isEn, resolveGoto(gotoFromLink, state.device));
          return;
        }
        var linkText = (link.textContent || "").trim();
        if (linkText === "Забыли пароль?") {
          showToast(app, "Ссылка отправлена на email");
          return;
        }
        if (linkText === "Скачать") {
          showToast(app, "Загрузка началась");
          return;
        }
        if (linkText === "Трейлер") {
          showToast(app, "Трейлер загружается...");
          return;
        }
        if (linkText === "В плейлист") {
          showToast(app, "Добавлено в плейлист");
          return;
        }
      }

      var goto = e.target.closest("[data-tvip-goto]");
      if (goto && !goto.disabled) {
        var next = resolveGoto(goto.getAttribute("data-tvip-goto"), state.device);
        var replace = goto.hasAttribute("data-tvip-goto-replace");
        navigateTo(state, screenHost, controls, isEn, next, { replace: replace });
        return;
      }

      var back = e.target.closest("[data-tvip-back]");
      if (back) {
        var target = back.getAttribute("data-tvip-back-target");
        navigateBack(state, screenHost, controls, isEn, target || null);
        return;
      }

      var onbNext = e.target.closest("[data-tvip-onb-next]");
      if (onbNext) {
        var steps = isEn ? ONB_STEPS_EN : ONB_STEPS;
        if (state.onbStep < steps.length - 1) {
          state.onbStep += 1;
          updateOnboarding(app, state, isEn, resolveAssetBase(root));
        } else {
          state.onbStep = 0;
          navigateTo(state, screenHost, controls, isEn, "profile", { replace: true });
        }
        return;
      }

      var navBtn = e.target.closest("[data-tvip-nav]");
      if (navBtn && !navBtn.disabled) {
        var panelId = navBtn.getAttribute("data-tvip-nav") || NAV_TO_PANEL[navBtn.textContent.trim()];
        if (panelId) {
          state.homePanel = panelId;
          if (state.screen !== "home") {
            navigateTo(state, screenHost, controls, isEn, "home", { replace: true });
          } else {
            setHomePanel(app, panelId);
          }
        }
        return;
      }

      var chip = e.target.closest("[data-tvip-chip]");
      if (chip && !chip.disabled) {
        var group = chip.closest(".tvip-chips, .tvip-filter-grid, .tvip-detail-seasons, .tvip-tv-dropdown");
        if (group) {
          group.querySelectorAll(".tvip-chip, .tvip-filter-item").forEach(
            function (c) { c.classList.remove("active"); }
          );
        }
        chip.classList.add("active");
        return;
      }

      var filterItem = e.target.closest(".tvip-filter-item");
      if (filterItem) {
        var grid = filterItem.closest("[data-tvip-filter-grid]");
        if (grid) {
          grid.querySelectorAll(".tvip-filter-item").forEach(function (i) {
            i.classList.remove("active");
          });
          filterItem.classList.add("active");
        }
        return;
      }

      var surveyCard = e.target.closest("[data-tvip-survey-card]");
      if (surveyCard) {
        surveyCard.classList.toggle("active");
        return;
      }

      var avatarBtn = e.target.closest("[data-tvip-avatar]");
      if (avatarBtn) {
        var picker = avatarBtn.closest("[data-tvip-avatar-picker]");
        if (picker) {
          picker.querySelectorAll("[data-tvip-avatar]").forEach(function (a) {
            a.classList.remove("active");
          });
          avatarBtn.classList.add("active");
        }
        return;
      }

      var profilePill = e.target.closest(".tvip-profile-pill, .tvip-profile-rail__item");
      if (profilePill) {
        if (profilePill.hasAttribute("data-tvip-goto")) return;
        var pg = profilePill.closest(".tvip-profile-switch, .tvip-profile-rail");
        if (pg) {
          pg.querySelectorAll(".tvip-profile-pill, .tvip-profile-rail__item").forEach(function (p) {
            p.classList.remove("active");
          });
          profilePill.classList.add("active");
          var name = profilePill.getAttribute("aria-label") || "";
          if (name) showToast(app, "Профиль: " + name);
        }
        return;
      }

      var mobTab = e.target.closest(".tvip-mob-tab");
      if (mobTab) {
        mobTab.closest(".tvip-mob-tabs").querySelectorAll(".tvip-mob-tab").forEach(function (t) {
          t.classList.remove("active");
        });
        mobTab.classList.add("active");
        return;
      }

      var btnText = e.target.closest(".tvip-btn");
      if (btnText && !btnText.hasAttribute("data-tvip-goto") && !btnText.hasAttribute("data-tvip-back") && !btnText.hasAttribute("data-tvip-onb-next")) {
        var txt = (btnText.textContent || "").trim();
        if (txt === "В плейлист") {
          showToast(app, "Добавлено в плейлист");
          return;
        }
      }

      var toastEl = e.target.closest("[data-tvip-toast]");
      if (toastEl) {
        var msg = toastEl.getAttribute("data-tvip-toast");
        if (msg) showToast(app, msg);
        return;
      }

      var langToggle = e.target.closest("[data-tvip-lang-toggle]");
      if (langToggle) {
        var lang = langToggle.getAttribute("data-tvip-lang-toggle");
        var group = langToggle.parentElement;
        if (group) {
          group.querySelectorAll("[data-tvip-lang-toggle]").forEach(function (b) {
            b.classList.remove("active");
          });
          langToggle.classList.add("active");
        }
        showToast(app, lang === "ru" ? "Язык: Русский" : "Language: English");
        return;
      }
    });
  }

  function resolveGoto(target, device) {
    if (target === "home") {
      if (device === "tablet") return "home-tablet";
      if (device === "mobile") return "m-home";
      return "home";
    }
    return target;
  }

  function mountTvips(root) {
    if (!root || root.querySelector(".tvip-interactive-mock__device")) return;

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
      controlsAria: isEn ? "TVIP demo settings" : "Настройки демо TVIP",
      hint: isEn
        ? "Live prototype: welcome → sign in → profile → onboarding → home → title. Every control is clickable."
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

    var state = {
      device: device,
      appearance: appearance,
      screen: DEVICE_ENTRY[device] || "start",
      onbStep: 0,
      backStack: [],
      homePanel: "tv"
    };

    function syncControls() {
      controls.querySelectorAll("[data-tvip-device]").forEach(function (b) {
        b.classList.toggle("active", b.getAttribute("data-tvip-device") === state.device);
      });
      controls.querySelectorAll("[data-tvip-appearance]").forEach(function (b) {
        b.classList.toggle("active", b.getAttribute("data-tvip-appearance") === state.appearance);
      });
    }

    function loadScreens() {
      return fetch(resolveMockPath(root))
        .then(function (r) {
          if (!r.ok) throw new Error("tvip-screens");
          return r.text();
        })
        .then(function (html) {
          screenHost.innerHTML = html;
          applyTvipAssets(root, screenHost);
          bindTvips(root, screenHost, state, isEn, controls);
          applyDevice(state, screenHost, controls, isEn);
          updateOnboarding(
            screenHost.querySelector("[data-tvip-app]"),
            state,
            isEn,
            resolveAssetBase(root)
          );
        });
    }

    root.__tvipMockReset = function () {
      state.device = root.getAttribute("data-device") || "desktop";
      state.appearance = root.getAttribute("data-appearance") || "night";
      state.screen = DEVICE_ENTRY[state.device] || "start";
      state.onbStep = 0;
      state.backStack = [];
      state.homePanel = "tv";
      root.dataset.appearance = state.appearance;
      root.dataset.device = state.device;
      var app = screenHost.querySelector("[data-tvip-app]");
      if (app) delete app.dataset.tvipBound;
      screenHost.dataset.scrollBound = "";
      loadScreens().then(syncControls);
    };

    loadScreens()
      .then(function () {
        root.dataset.tvipMockReady = "1";
        syncControls();
      })
      .catch(function () {
        screenHost.innerHTML =
          '<p style="padding:1rem;text-align:center;color:#6b7280;font-size:0.8rem">Не удалось загрузить демо.</p>';
      });

    controls.addEventListener("click", function (e) {
      var devBtn = e.target.closest("[data-tvip-device]");
      if (devBtn) {
        state.device = devBtn.getAttribute("data-tvip-device");
        state.backStack = [];
        state.onbStep = 0;
        state.homePanel = "tv";
        state.screen = DEVICE_ENTRY[state.device] || "start";
        root.dataset.device = state.device;
        applyDevice(state, screenHost, controls, isEn);
        syncControls();
        return;
      }

      var themeBtn = e.target.closest("[data-tvip-appearance]");
      if (themeBtn) {
        state.appearance = themeBtn.getAttribute("data-tvip-appearance");
        root.dataset.appearance = state.appearance;
        updateOnboarding(
          screenHost.querySelector("[data-tvip-app]"),
          state,
          isEn,
          resolveAssetBase(root)
        );
        syncControls();
      }
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

(function () {
  var PALETTE = [
    { id: "wuw-blue", hex: "#0788FF", label: "WUW Blue" },
    { id: "brand-blue", hex: "#2971DC", label: "Brand Blue" },
    { id: "sky", hex: "#0EA5E9", label: "Sky" },
    { id: "cyan", hex: "#3ADCFF", label: "Cyan" },
    { id: "teal", hex: "#14B8A6", label: "Teal" },
    { id: "indigo", hex: "#6366F1", label: "Indigo" },
    { id: "purple", hex: "#853AFF", label: "Purple" },
    { id: "violet", hex: "#A855F7", label: "Violet" },
    { id: "magenta", hex: "#D946EF", label: "Magenta" },
    { id: "rose", hex: "#F43F5E", label: "Rose" },
    { id: "coral", hex: "#FB7185", label: "Coral" },
    { id: "orange", hex: "#F97316", label: "Orange" },
    { id: "amber", hex: "#F59E0B", label: "Amber" },
    { id: "lime", hex: "#84CC16", label: "Lime" },
    { id: "emerald", hex: "#10B981", label: "Emerald" }
  ];

  var DEFAULT_ACCENT = "#0788FF";
  var SVG_PATH = "images/wuw/dashboard-mock.svg";
  var ACCENT_ROW_CHIPS = ["fuel", "memoirs", "person2", "declare"];

  function resolveSvgPath(root) {
    var base = root.getAttribute("data-svg-base");
    if (base) {
      return base.replace(/\/?$/, "/") + "dashboard-mock.svg";
    }
    var path = window.location.pathname || "";
    if (/\/ru\//.test(path) || /\/en\//.test(path)) {
      return "../" + SVG_PATH;
    }
    return SVG_PATH;
  }

  function mountMock(root) {
    if (!root || root.dataset.wuwMockReady === "1") return;

    var svgUrl = resolveSvgPath(root);
    root.classList.add("is-loading");
    root.dataset.appearance = root.dataset.appearance || "night";
    root.style.setProperty("--wuw-accent", DEFAULT_ACCENT);

    var board = document.createElement("div");
    board.className = "wuw-whitelabel-mock__board";

    var viewport = document.createElement("div");
    viewport.className = "wuw-whitelabel-mock__viewport";
    viewport.setAttribute("data-wuw-dashboard", "");
    viewport.textContent = "Загрузка макета…";
    board.appendChild(viewport);

    var controls = buildControls(root);
    root.appendChild(board);
    root.appendChild(controls);
    root.dataset.wuwMockReady = "1";

    fetch(svgUrl)
      .then(function (res) {
        if (!res.ok) throw new Error("SVG " + res.status);
        return res.text();
      })
      .then(function (svg) {
        viewport.innerHTML = svg;
        initStackChips(root, viewport);
        fitDashboardViewport(viewport);
        root.classList.remove("is-loading");
      })
      .catch(function () {
        viewport.innerHTML =
          '<p style="padding:1.5rem;text-align:center;color:#6b7280;font-size:0.85rem">Не удалось загрузить макет дашборда.</p>';
        root.classList.remove("is-loading");
      });
  }

  function fitDashboardViewport(viewport) {
    var svg = viewport.querySelector("svg");
    if (!svg) return;

    var board = viewport.closest(".wuw-whitelabel-mock__board");

    svg.removeAttribute("height");
    svg.style.width = "100%";
    svg.style.height = "auto";
    svg.style.display = "block";

    viewport.style.height = "auto";
    viewport.style.minHeight = "0";
    viewport.style.aspectRatio = "auto";

    function syncHeights() {
      var svgHeight = svg.getBoundingClientRect().height;
      if (!svgHeight) return;
      viewport.style.height = svgHeight + "px";
      if (board) {
        board.style.height = svgHeight + "px";
      }
    }

    syncHeights();
    if (typeof ResizeObserver !== "undefined") {
      var ro = new ResizeObserver(syncHeights);
      ro.observe(svg);
    } else {
      window.addEventListener("resize", syncHeights);
    }
  }

  function buildControls(root) {
    var controls = document.createElement("aside");
    controls.className = "wuw-whitelabel-mock__controls";
    controls.setAttribute("aria-label", "Настройки White Label");

    var paletteTitle = document.createElement("p");
    paletteTitle.className = "wuw-whitelabel-mock__label";
    paletteTitle.textContent = "Акцентный цвет";

    var palette = document.createElement("div");
    palette.className = "wuw-whitelabel-mock__palette";
    palette.setAttribute("role", "list");
    palette.setAttribute("aria-label", "Палитра бренда");

    var hexOut = document.createElement("p");
    hexOut.className = "wuw-whitelabel-mock__hex";
    hexOut.setAttribute("data-wuw-hex", "");
    hexOut.textContent = DEFAULT_ACCENT;

    PALETTE.forEach(function (item, index) {
      var btn = document.createElement("button");
      btn.type = "button";
      btn.className = "wuw-whitelabel-mock__swatch" + (index === 0 ? " is-active" : "");
      btn.style.backgroundColor = item.hex;
      btn.style.color = item.hex;
      btn.setAttribute("data-wuw-color", item.hex);
      btn.setAttribute("aria-label", item.label + " " + item.hex);
      btn.setAttribute("aria-pressed", index === 0 ? "true" : "false");
      btn.addEventListener("click", function () {
        setAccent(root, item.hex, palette, hexOut);
      });
      palette.appendChild(btn);
    });

    var themeTitle = document.createElement("p");
    themeTitle.className = "wuw-whitelabel-mock__label";
    themeTitle.textContent = "Тема";

    var theme = document.createElement("div");
    theme.className = "wuw-whitelabel-mock__theme";
    theme.setAttribute("role", "group");
    theme.setAttribute("aria-label", "Дневная или ночная тема");

    var nightBtn = document.createElement("button");
    nightBtn.type = "button";
    nightBtn.className = "wuw-whitelabel-mock__theme-btn is-active";
    nightBtn.setAttribute("data-appearance", "night");
    nightBtn.textContent = "Ночная";

    var dayBtn = document.createElement("button");
    dayBtn.type = "button";
    dayBtn.className = "wuw-whitelabel-mock__theme-btn";
    dayBtn.setAttribute("data-appearance", "day");
    dayBtn.textContent = "Дневная";

    function setTheme(mode) {
      root.dataset.appearance = mode;
      var isNight = mode === "night";
      nightBtn.classList.toggle("is-active", isNight);
      dayBtn.classList.toggle("is-active", !isNight);
      nightBtn.setAttribute("aria-pressed", isNight ? "true" : "false");
      dayBtn.setAttribute("aria-pressed", isNight ? "false" : "true");
      refreshAllChips(root);
    }

    nightBtn.addEventListener("click", function () {
      setTheme("night");
    });
    dayBtn.addEventListener("click", function () {
      setTheme("day");
    });

    theme.appendChild(nightBtn);
    theme.appendChild(dayBtn);

    var hint = document.createElement("p");
    hint.className = "wuw-whitelabel-mock__hint";
    hint.textContent =
      "Один токен акцента перекрашивает кнопки, графики, активные вкладки и подсветку в дашборде — как в White Label.";

    controls.appendChild(paletteTitle);
    controls.appendChild(palette);
    controls.appendChild(hexOut);
    controls.appendChild(themeTitle);
    controls.appendChild(theme);
    controls.appendChild(hint);

    return controls;
  }

  function isChipActive(chip) {
    return chip.getAttribute("data-wuw-chip-active") === "1";
  }

  function chipLabel(viewport, chipId) {
    return viewport.querySelector('[data-wuw-chip-label="' + chipId + '"]');
  }

  function inactiveLabelFill(chipId, appearance) {
    if (appearance === "day") {
      return "var(--wuw-chip-text-day)";
    }
    if (ACCENT_ROW_CHIPS.indexOf(chipId) >= 0) {
      return "var(--wuw-on-accent)";
    }
    return "var(--wuw-text)";
  }

  function applyChipState(root, chip, active) {
    var chipId = chip.getAttribute("data-wuw-chip");
    var appearance = root.dataset.appearance || "night";
    var viewport = root.querySelector("[data-wuw-dashboard]");
    var label = viewport ? chipLabel(viewport, chipId) : null;

    chip.setAttribute("fill", active ? "var(--wuw-accent)" : "var(--wuw-panel)");
    if (active) {
      chip.setAttribute("data-wuw-chip-active", "1");
    } else {
      chip.removeAttribute("data-wuw-chip-active");
    }

    if (!label) return;

    if (active) {
      label.setAttribute("fill", "var(--wuw-on-accent)");
      return;
    }

    if (appearance === "day") {
      label.setAttribute("fill", "var(--wuw-chip-text-day)");
    } else {
      label.setAttribute("fill", inactiveLabelFill(chipId, appearance));
    }
  }

  function refreshAllChips(root) {
    var viewport = root.querySelector("[data-wuw-dashboard]");
    if (!viewport) return;
    viewport.querySelectorAll("[data-wuw-chip]").forEach(function (chip) {
      applyChipState(root, chip, isChipActive(chip));
    });
  }

  function initStackChips(root, viewport) {
    var svg = viewport.querySelector("svg");
    if (!svg) return;

    var hitsLayer = document.createElementNS("http://www.w3.org/2000/svg", "g");
    hitsLayer.setAttribute("id", "wuw-chip-hits");

    var labelsLayer = document.createElementNS("http://www.w3.org/2000/svg", "g");
    labelsLayer.setAttribute("id", "wuw-chip-labels");

    var chips = Array.prototype.slice.call(viewport.querySelectorAll("[data-wuw-chip]"));
    chips.forEach(function (chip) {
      hitsLayer.appendChild(chip);
    });

    Array.prototype.slice.call(viewport.querySelectorAll("[data-wuw-chip-label]")).forEach(function (label) {
      labelsLayer.appendChild(label);
    });

    svg.appendChild(hitsLayer);
    svg.appendChild(labelsLayer);

    chips.forEach(function (chip) {
      var chipId = chip.getAttribute("data-wuw-chip");
      var label = chipLabel(viewport, chipId);
      var title = label ? chipId.replace(/(\d+)/, " $1") : chipId;

      chip.setAttribute("role", "button");
      chip.setAttribute("tabindex", "0");
      chip.setAttribute("aria-pressed", isChipActive(chip) ? "true" : "false");
      chip.setAttribute("aria-label", title);

      function toggleChip() {
        var next = !isChipActive(chip);
        applyChipState(root, chip, next);
        chip.setAttribute("aria-pressed", next ? "true" : "false");
      }

      chip.addEventListener("click", toggleChip);
      chip.addEventListener("keydown", function (event) {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          toggleChip();
        }
      });
    });

    refreshAllChips(root);
  }

  function setAccent(root, hex, palette, hexOut) {
    root.style.setProperty("--wuw-accent", hex);
    hexOut.textContent = hex.toUpperCase();
    palette.querySelectorAll(".wuw-whitelabel-mock__swatch").forEach(function (sw) {
      var active = sw.getAttribute("data-wuw-color").toLowerCase() === hex.toLowerCase();
      sw.classList.toggle("is-active", active);
      sw.setAttribute("aria-pressed", active ? "true" : "false");
    });
  }

  function init() {
    document.querySelectorAll("[data-wuw-whitelabel-mock]").forEach(mountMock);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();

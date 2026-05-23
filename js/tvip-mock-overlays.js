(function () {
  function btn(x, y, w, h, label, goto, variant) {
    return { type: "button", x: x, y: y, w: w, h: h, label: label, goto: goto, variant: variant || "primary" };
  }

  function chips(items, y) {
    return { type: "chips", y: y || 42, items: items };
  }

  var OVERLAYS = {
    "login-night": {
      clouds: true,
      items: [btn(38, 66, 24, 11, "Войти", "home", "primary")]
    },
    "login-day": {
      items: [btn(38, 66, 24, 11, "Sign in", "home", "primary")]
    },
    "m-home-day": {
      items: [
        btn(78, 3, 18, 7, "☰", "m-filter", "ghost"),
        { type: "row", x: 4, y: 48, w: 92, h: 22, count: 3 }
      ]
    },
    "m-filter-day": {
      scroll: true,
      items: [btn(2, 2, 14, 5, "←", "m-home", "ghost")]
    },
    "home-night": {
      scroll: true,
      items: [
        btn(14, 38, 22, 22, "Смотреть", "detail", "primary"),
        { type: "row", x: 10, y: 58, w: 82, h: 16, count: 6 }
      ]
    },
    "detail-night": {
      scroll: true,
      items: [
        btn(2, 3, 10, 5, "← Назад", "home", "ghost"),
        btn(14, 72, 20, 10, "▶ Смотреть", null, "primary")
      ]
    },
    "home-day": {
      scroll: true,
      items: [btn(38, 62, 20, 10, "Продолжить", null, "primary")]
    },
    "t-login-night": {
      items: [
        chips(
          [
            { label: "Семья", active: true },
            { label: "Дети" },
            { label: "Кино" },
            { label: "Сериалы" }
          ],
          48
        ),
        btn(32, 72, 36, 10, "Далее", "t-home", "primary")
      ]
    },
    "t-login-day": {
      items: [
        chips(
          [
            { label: "Family", active: true },
            { label: "Kids" },
            { label: "Movies" }
          ],
          48
        ),
        btn(32, 72, 36, 10, "Next", "t-home", "primary")
      ]
    },
    "t-home-night": {
      scroll: true,
      items: [
        btn(4, 12, 14, 5, "Фильмы", null, "chip"),
        btn(20, 12, 14, 5, "Сериалы", null, "chip"),
        { type: "row", x: 6, y: 22, w: 88, h: 28, count: 4 },
        btn(6, 55, 42, 28, "", "t-detail", "card")
      ]
    },
    "t-detail-night": {
      items: [btn(4, 4, 12, 6, "← Назад", "t-home", "ghost"), btn(28, 78, 44, 10, "▶ Смотреть", null, "primary")]
    },
    "m-home-night": {
      items: [
        btn(78, 3, 18, 7, "☰", "m-filter", "ghost"),
        btn(6, 28, 30, 16, "Каталог", "m-filter", "ghost"),
        { type: "row", x: 4, y: 48, w: 92, h: 22, count: 3 }
      ]
    },
    "m-filter-night": {
      scroll: true,
      items: [btn(2, 2, 14, 5, "←", "m-home", "ghost")]
    }
  };

  function overlayKey(screenId, appearance) {
    var key = screenId + "-" + appearance;
    if (OVERLAYS[key]) return key;
    if (OVERLAYS[screenId + "-night"]) return screenId + "-night";
    return null;
  }

  window.TvipMockOverlays = {
    get: function (screenId, appearance) {
      var key = overlayKey(screenId, appearance);
      return key ? OVERLAYS[key] : { items: [] };
    }
  };
})();

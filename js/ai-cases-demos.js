(function () {
  var REFRESH_ICON =
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/><path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16"/><path d="M16 16h5v5"/></svg>';

  var DAY_LABELS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  var WEEK_LABELS = ["W1", "W2", "W3", "W4", "W5", "W6", "W7"];
  var SCORE_LABELS = ["0-20", "21-40", "41-60", "61-80", "81-100"];

  function formatUsers(n) {
    if (n >= 1000) {
      var k = n / 1000;
      return (k >= 10 ? k.toFixed(1) : k.toFixed(2)).replace(/\.0$/, "") + "k";
    }
    return String(Math.round(n));
  }

  function buildTrendPaths(values, w, h) {
    var pad = 4;
    var min = Math.min.apply(null, values);
    var max = Math.max.apply(null, values);
    var range = max - min || 1;
    var n = values.length;
    var coords = values.map(function (v, i) {
      var x = n > 1 ? (i / (n - 1)) * w : 0;
      var y = h - pad - ((v - min) / range) * (h - pad * 2);
      return [x, y];
    });
    var linePts = coords
      .map(function (c) {
        return Math.round(c[0]) + "," + Math.round(c[1]);
      })
      .join(" ");
    var fillPts =
      "0," +
      h +
      " 0," +
      Math.round(coords[0][1]) +
      " " +
      linePts +
      " " +
      w +
      "," +
      h;
    return { line: linePts, fill: fillPts, min: min, max: max };
  }

  function yAxisLabels(min, max) {
    var steps = 3;
    var out = [];
    for (var i = 0; i <= steps; i++) {
      var v = max - ((max - min) * i) / steps;
      out.push(formatUsers(v));
    }
    return out;
  }

  function ensureChartOverlay(host) {
    var overlay = host.querySelector("[data-chart-overlay]");
    if (!overlay) {
      overlay = document.createElement("div");
      overlay.className = "mock-chart-overlay";
      overlay.setAttribute("data-chart-overlay", "");
      overlay.innerHTML =
        '<div class="mock-chart-guide hidden"></div><div class="mock-chart-hover-dot hidden"></div><div class="mock-chart-tooltip hidden"></div>';
      host.appendChild(overlay);
    }
    return {
      guide: overlay.querySelector(".mock-chart-guide"),
      dot: overlay.querySelector(".mock-chart-hover-dot"),
      tooltip: overlay.querySelector(".mock-chart-tooltip")
    };
  }

  function showChartTip(ui, x, y, text) {
    ui.guide.classList.remove("hidden");
    ui.dot.classList.remove("hidden");
    ui.tooltip.classList.remove("hidden");
    ui.guide.style.left = x + "px";
    ui.dot.style.left = x + "px";
    ui.dot.style.top = y + "px";
    ui.tooltip.style.left = x + "px";
    ui.tooltip.style.top = y + "px";
    ui.tooltip.textContent = text;
  }

  function hideChartTip(ui) {
    ui.guide.classList.add("hidden");
    ui.dot.classList.add("hidden");
    ui.tooltip.classList.add("hidden");
  }

  function renderBarColumns(container, labels, heights, opts) {
    opts = opts || {};
    container.innerHTML = heights
      .map(function (h, i) {
        var opacity = opts.weekend && i >= 5 ? " opacity-40" : "";
        var peak = opts.peakDay === i;
        var labelClass = peak ? "text-[8px] font-semibold" : "text-[8px]";
        var labelStyle = peak ? "color:var(--mock-accent)" : "color:var(--mock-muted)";
        return (
          '<div class="mock-bar-col">' +
          '<div class="mock-bar' +
          opacity +
          '" style="height:' +
          h +
          '%" data-chart-bar data-bar-index="' +
          i +
          '"></div>' +
          '<span class="' +
          labelClass +
          '" style="' +
          labelStyle +
          '">' +
          labels[i] +
          "</span></div>"
        );
      })
      .join("");
  }

  function bindBarChart(panel, getTip) {
    if (!panel || panel.dataset.barChartBound) return;
    panel.dataset.barChartBound = "1";
    var ui = ensureChartOverlay(panel);
    panel.addEventListener("mouseover", function (e) {
      var bar = e.target.closest("[data-chart-bar]");
      if (!bar || !panel.contains(bar)) return;
      var i = parseInt(bar.getAttribute("data-bar-index"), 10);
      var pr = panel.getBoundingClientRect();
      var br = bar.getBoundingClientRect();
      showChartTip(ui, br.left + br.width / 2 - pr.left, br.top - pr.top, getTip(i));
    });
    panel.addEventListener("mouseleave", function (e) {
      if (!panel.contains(e.relatedTarget)) hideChartTip(ui);
    });
  }

  function bindLineChart(panel, bodySel, getLabels, getValues, tipFn, svgH) {
    var body = panel && panel.querySelector(bodySel);
    if (!body || body.dataset.lineBound) return;
    body.dataset.lineBound = "1";
    var ui = ensureChartOverlay(body);
    var hit = document.createElement("div");
    hit.className = "mock-line-hit";
    hit.setAttribute("data-line-hit", "");
    body.appendChild(hit);
    var w = 200;
    var h = svgH || 48;

    hit.addEventListener("mousemove", function (e) {
      var values = getValues();
      var labels = getLabels();
      if (!values.length) return;
      var rect = body.getBoundingClientRect();
      var x = e.clientX - rect.left;
      var ratio = Math.max(0, Math.min(1, x / rect.width));
      var idx = Math.round(ratio * (values.length - 1));
      var paths = buildTrendPaths(values, w, h);
      var min = paths.min;
      var max = paths.max;
      var range = max - min || 1;
      var pad = 4;
      var yVal = values[idx];
      var ySvg = h - pad - ((yVal - min) / range) * (h - pad * 2);
      var sx = (idx / (values.length - 1)) * rect.width;
      var sy = (ySvg / h) * rect.height;
      showChartTip(ui, sx, sy, tipFn(idx, yVal, labels[idx]));
    });
    hit.addEventListener("mouseleave", function () {
      hideChartTip(ui);
    });
  }

  var WUW_DONUT_SEGMENTS = [
    { label: "Organic", pct: 42 },
    { label: "Partners", pct: 31 },
    { label: "Paid", pct: 19 },
    { label: "Direct", pct: 8 }
  ];

  function donutSegmentAtAngle(deg) {
    var acc = 0;
    for (var i = 0; i < WUW_DONUT_SEGMENTS.length; i++) {
      var seg = WUW_DONUT_SEGMENTS[i];
      var start = (acc / 100) * 360;
      acc += seg.pct;
      var end = (acc / 100) * 360;
      if (deg >= start && deg < end) return seg;
    }
    return WUW_DONUT_SEGMENTS[0];
  }

  function bindDonutChart(panel, donutEl) {
    if (!panel || !donutEl || panel.dataset.donutBound) return;
    panel.dataset.donutBound = "1";
    var ui = ensureChartOverlay(panel);
    var wrap = donutEl.closest(".mock-donut-wrap") || donutEl.parentElement;

    function onMove(e) {
      var rect = donutEl.getBoundingClientRect();
      var cx = rect.left + rect.width / 2;
      var cy = rect.top + rect.height / 2;
      var dx = e.clientX - cx;
      var dy = e.clientY - cy;
      var dist = Math.sqrt(dx * dx + dy * dy);
      var outer = rect.width / 2;
      var inner = outer * 0.4;
      if (dist < inner || dist > outer) {
        hideChartTip(ui);
        return;
      }
      var deg = ((Math.atan2(dx, -dy) * 180) / Math.PI + 360) % 360;
      var seg = donutSegmentAtAngle(deg);
      var pr = panel.getBoundingClientRect();
      var wr = wrap.getBoundingClientRect();
      showChartTip(
        ui,
        wr.left + wr.width / 2 - pr.left,
        wr.top + wr.height / 2 - pr.top,
        seg.label + " · " + seg.pct + "%"
      );
    }

    donutEl.addEventListener("mousemove", onMove);
    donutEl.addEventListener("mouseleave", function () {
      hideChartTip(ui);
    });
  }

  function applyTrendChart(panel, yAxisEl, fillEl, lineEl, xAxisEl, values, xLabels, svgH) {
    var h = svgH || 48;
    var paths = buildTrendPaths(values, 200, h);
    if (fillEl) fillEl.setAttribute("points", paths.fill);
    if (lineEl) lineEl.setAttribute("points", paths.line);
    if (yAxisEl) {
      yAxisEl.innerHTML = yAxisLabels(paths.min, paths.max)
        .map(function (l) {
          return "<span>" + l + "</span>";
        })
        .join("");
    }
    if (xAxisEl && xLabels.length) {
      var first = xLabels[0];
      var last = xLabels[xLabels.length - 1];
      xAxisEl.innerHTML = "<span>" + first + "</span><span>" + last + "</span>";
    }
    return values;
  }

  function loadAiCaseMock(node) {
    var path = node.getAttribute("data-mock");
    if (!path) return Promise.resolve();
    return fetch(path)
      .then(function (r) {
        if (!r.ok) throw new Error(path);
        return r.text();
      })
      .then(function (html) {
        node.innerHTML = html;
        if (window.initAiCaseDemo) window.initAiCaseDemo(node);
        if (window.mockObserver) window.mockObserver.observe(node);
      });
  }

  window.loadAiCaseMock = loadAiCaseMock;

  function initWuw(root) {
    var pages = root.querySelectorAll("[data-page]");
    var navItems = root.querySelectorAll("[data-nav-page]");
    var mobileNav = root.querySelector("[data-wuw-mobile-nav]");
    var segments = root.querySelectorAll("[data-segment]");
    var dateFrom = root.querySelector("[data-wuw-date-from]");
    var dateTo = root.querySelector("[data-wuw-date-to]");
    var presets = root.querySelectorAll("[data-wuw-preset]");
    var periodLabel = root.querySelector("[data-wuw-period-label]");

    var kpiEls = {
      mau: root.querySelector("[data-kpi-mau]"),
      dau: root.querySelector("[data-kpi-dau]"),
      session: root.querySelector("[data-kpi-session]"),
      lesson: root.querySelector("[data-kpi-lesson]"),
      churn: root.querySelector("[data-kpi-retention]"),
      partners: root.querySelector("[data-kpi-partners]")
    };
    var sparkFill = root.querySelector("[data-wuw-spark-fill]");
    var sparkLine = root.querySelector("[data-wuw-spark-line]");
    var sparkYaxis = root.querySelector("[data-wuw-spark-yaxis]");
    var engagementPanel = root.querySelector("[data-wuw-engagement-panel]");
    var signupPanel = root.querySelector("[data-wuw-signup-panel]");
    var signupBars = root.querySelector("[data-wuw-signup-bars]");
    var scorePanel = root.querySelector("[data-wuw-score-panel]");
    var scoreBars = root.querySelector("[data-wuw-score-bars]");
    var trafficMix = root.querySelector("[data-wuw-traffic-mix]");
    var funnelBody = root.querySelector("[data-wuw-funnel-tbody]");

    var activeSegment = "b2c";
    var activePeriod = "30d";
    var lastSparkVals = [];
    var lastSignupVals = [];

    var periodBase = {
      "7d": {
        mau: "41.1k",
        dau: "10.2k",
        session: "12m",
        lesson: "62%",
        churn: "4.8%",
        partners: "16",
        traffic: "Organic 38% · Partners 28%",
        sparkValues: [10200, 10450, 10100, 10600, 10800, 10500, 10200],
        bars: [35, 52, 48, 62, 78, 55, 38],
        signupValues: [420, 640, 580, 720, 890, 610, 410],
        funnels: [
          ["Onboarding → 1st lesson", "3,120", "74%", "0,13 10,10 20,11 30,8 40,9"],
          ["Gamification reward", "2,010", "58%", "0,11 10,9 20,10 30,7 40,6"],
          ["WL custom branding", "720", "41%", "0,9 10,11 20,10 30,12 40,13"],
          ["Partner invite", "480", "49%", "0,14 10,13 20,10 30,8 40,7"],
          ["Stack completion", "890", "51%", "0,12 10,10 20,9 30,9 40,7"]
        ]
      },
      "30d": {
        mau: "48.2k",
        dau: "12.4k",
        session: "14m",
        lesson: "67%",
        churn: "4.2%",
        partners: "18",
        traffic: "Organic 42% · Partners 31%",
        sparkValues: [11200, 11500, 11800, 12100, 11900, 12300, 12400, 12200, 12500, 12700, 12600, 12800],
        bars: [40, 65, 55, 80, 100, 70, 45],
        signupValues: [520, 840, 710, 980, 1240, 860, 540],
        funnels: [
          ["Onboarding → 1st lesson", "4,240", "78%", "0,12 10,8 20,10 30,4 40,6"],
          ["Gamification reward", "2,810", "61%", "0,10 10,6 20,8 30,5 40,3"],
          ["WL custom branding", "890", "44%", "0,8 10,10 20,9 30,11 40,12"],
          ["Partner invite", "620", "52%", "0,14 10,12 20,8 30,6 40,4"],
          ["Stack completion", "1,120", "55%", "0,11 10,9 20,7 30,8 40,5"]
        ]
      },
      "90d": {
        mau: "52.8k",
        dau: "13.1k",
        session: "15m",
        lesson: "71%",
        churn: "3.9%",
        partners: "22",
        traffic: "Organic 45% · Partners 34%",
        sparkValues: [10800, 11200, 11600, 11900, 12200, 12500, 12800, 13000, 13100, 12900, 13200, 13400],
        bars: [48, 72, 68, 88, 95, 78, 52],
        signupValues: [610, 920, 880, 1050, 1180, 940, 620],
        funnels: [
          ["Onboarding → 1st lesson", "5,180", "81%", "0,14 10,11 20,9 30,5 40,4"],
          ["Gamification reward", "3,240", "64%", "0,12 10,8 20,7 30,4 40,3"],
          ["WL custom branding", "1,040", "47%", "0,10 10,9 20,8 30,9 40,10"],
          ["Partner invite", "780", "55%", "0,15 10,13 20,9 30,5 40,3"],
          ["Stack completion", "1,380", "58%", "0,12 10,10 20,6 30,7 40,4"]
        ]
      }
    };

    var scoreHeights = [30, 50, 75, 100, 60];
    var scoreValues = [1200, 2100, 3800, 5200, 2400];

    var segmentMult = {
      b2c: { dau: 1, churn: 1, partners: 1 },
      wl: { dau: 0.31, churn: 1.12, partners: 1.33 }
    };

    function formatDau(base, seg) {
      var n = parseFloat(String(base).replace(/k$/, "")) * segmentMult[seg].dau;
      return (n >= 10 ? n.toFixed(1) : n.toFixed(2)) + "k";
    }

    function formatPartners(base, seg) {
      return String(Math.round(parseInt(base, 10) * segmentMult[seg].partners));
    }

    function formatChurn(base, seg) {
      var n = parseFloat(String(base).replace("%", "")) * segmentMult[seg].churn;
      return n.toFixed(1) + "%";
    }

    function formatDateShort(d) {
      return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
    }

    function setPresetActive(key) {
      presets.forEach(function (btn) {
        btn.classList.toggle("active", btn.getAttribute("data-wuw-preset") === key);
      });
    }

    function setDatesForPreset(key) {
      var end = new Date();
      var start = new Date();
      var days = key === "7d" ? 7 : key === "90d" ? 90 : 30;
      start.setDate(end.getDate() - days);
      if (dateFrom) dateFrom.value = start.toISOString().slice(0, 10);
      if (dateTo) dateTo.value = end.toISOString().slice(0, 10);
      if (periodLabel) {
        periodLabel.textContent =
          key === "7d" ? "Last 7 days" : key === "90d" ? "Last 90 days" : "Last 30 days";
      }
    }

    function updatePeriodLabelFromDates() {
      if (!periodLabel || !dateFrom || !dateTo || !dateFrom.value || !dateTo.value) return;
      periodLabel.textContent =
        formatDateShort(new Date(dateFrom.value)) +
        " – " +
        formatDateShort(new Date(dateTo.value));
    }

    function applyPeriodMetrics(key) {
      var data = periodBase[key];
      if (!data) return;
      var seg = activeSegment;
      if (kpiEls.mau) kpiEls.mau.textContent = data.mau;
      if (kpiEls.dau) kpiEls.dau.textContent = formatDau(data.dau, seg);
      if (kpiEls.session) kpiEls.session.textContent = data.session;
      if (kpiEls.lesson) kpiEls.lesson.textContent = data.lesson;
      if (kpiEls.churn) kpiEls.churn.textContent = formatChurn(data.churn, seg);
      if (kpiEls.partners) kpiEls.partners.textContent = formatPartners(data.partners, seg);
      if (trafficMix) trafficMix.textContent = data.traffic;

      lastSparkVals = data.sparkValues.map(function (v) {
        return Math.round(v * (seg === "wl" ? 0.35 : 1));
      });
      lastSignupVals = data.signupValues;
      applyTrendChart(engagementPanel, sparkYaxis, sparkFill, sparkLine, null, lastSparkVals, [], 40);

      if (signupBars) {
        renderBarColumns(signupBars, WEEK_LABELS, data.bars);
      }

      if (scoreBars) {
        renderBarColumns(scoreBars, SCORE_LABELS, scoreHeights);
      }

      if (funnelBody) {
        funnelBody.innerHTML = data.funnels
          .map(function (row) {
            var isLow = parseInt(row[2], 10) < 50;
            var convAttr = isLow
              ? ' style="color:var(--mock-warning)"'
              : ' class="mock-kpi-delta"';
            return (
              "<tr><td>" +
              row[0] +
              "</td><td>" +
              row[1] +
              "</td><td" +
              convAttr +
              ">" +
              row[2] +
              '</td><td><svg class="mock-mini-spark" viewBox="0 0 40 16"><polyline fill="none" stroke="var(--mock-chart)" stroke-width="1.5" points="' +
              row[3] +
              '"/></svg></td></tr>'
            );
          })
          .join("");
      }
    }

    function applyPeriod(key, opts) {
      opts = opts || {};
      activePeriod = key;
      if (opts.fromPreset !== false) {
        setDatesForPreset(key);
        setPresetActive(key);
      } else {
        updatePeriodLabelFromDates();
        setPresetActive(key);
      }
      applyPeriodMetrics(key);
    }

    function showPage(id) {
      pages.forEach(function (p) {
        p.classList.toggle("hidden", p.getAttribute("data-page") !== id);
      });
      navItems.forEach(function (btn) {
        var active = btn.getAttribute("data-nav-page") === id;
        btn.classList.toggle("active", active);
        btn.setAttribute("aria-current", active ? "page" : "false");
      });
      if (mobileNav && mobileNav.value !== id) mobileNav.value = id;
    }

    applyPeriod("30d", { fromPreset: true });

    if (engagementPanel) {
      bindLineChart(
        engagementPanel,
        "[data-wuw-spark-body]",
        function () {
          return lastSparkVals.map(function (_, i) {
            return "Day " + (i + 1);
          });
        },
        function () {
          return lastSparkVals;
        },
        function (i, val, label) {
          return label + " · " + formatUsers(val) + " users";
        },
        40
      );
    }
    if (signupPanel) {
      bindBarChart(signupPanel, function (i) {
        return WEEK_LABELS[i] + " · " + lastSignupVals[i].toLocaleString() + " signups";
      });
    }
    if (scorePanel) {
      bindBarChart(scorePanel, function (i) {
        return SCORE_LABELS[i] + " · " + scoreValues[i].toLocaleString() + " users";
      });
    }

    var donutPanel = root.querySelector("[data-wuw-donut-panel]");
    var donutEl = root.querySelector("[data-wuw-donut]");
    if (donutPanel && donutEl) bindDonutChart(donutPanel, donutEl);

    root.addEventListener("click", function (e) {
      var nav = e.target.closest("[data-nav-page]");
      if (nav) {
        showPage(nav.getAttribute("data-nav-page"));
        return;
      }
      var toggle = e.target.closest("[data-settings-toggle]");
      if (toggle) {
        var on = toggle.getAttribute("aria-checked") !== "true";
        toggle.setAttribute("aria-checked", on ? "true" : "false");
        return;
      }
      var seg = e.target.closest("[data-segment]");
      if (seg) {
        activeSegment = seg.getAttribute("data-segment");
        segments.forEach(function (s) {
          s.classList.toggle("active", s === seg);
        });
        applyPeriodMetrics(activePeriod);
        return;
      }
      var preset = e.target.closest("[data-wuw-preset]");
      if (preset) {
        applyPeriod(preset.getAttribute("data-wuw-preset"), { fromPreset: true });
      }
    });

    if (mobileNav) {
      mobileNav.addEventListener("change", function () {
        showPage(mobileNav.value);
      });
    }

    function onDateChange() {
      if (!dateFrom || !dateTo || !dateFrom.value || !dateTo.value) return;
      var from = new Date(dateFrom.value);
      var to = new Date(dateTo.value);
      var diff = Math.max(1, Math.round((to - from) / 86400000));
      var key = diff <= 10 ? "7d" : diff <= 45 ? "30d" : "90d";
      applyPeriod(key, { fromPreset: false });
    }

    if (dateFrom) dateFrom.addEventListener("change", onDateChange);
    if (dateTo) dateTo.addEventListener("change", onDateChange);
  }

  function initMockPointerHint(stageWrap, app, demo) {
    if (!stageWrap || !app) return;
    if (stageWrap._pointerTimer) {
      clearInterval(stageWrap._pointerTimer);
      stageWrap._pointerTimer = null;
    }
    var old = stageWrap.querySelector(".mock-pointer-hint");
    if (old) old.remove();

    var selectorsByDemo = {
      coin: ["[data-coin-period]", '[data-tab="behavior"]', "[data-coin-dept]"],
      wuw: ["[data-wuw-preset=\"30d\"]", "[data-segment=\"b2c\"]", "[data-wuw-date-from]"],
      docsbird: [
        "[data-ai-action=\"template\"]",
        "[data-docsbird-check]",
        "[data-docsbird-save-draft]",
        "[data-docsbird-send-wrap]"
      ]
    };
    var selectors = selectorsByDemo[demo];
    if (!selectors || !selectors.length) return;

    var hint = document.createElement("div");
    hint.className = "mock-pointer-hint";
    hint.setAttribute("aria-hidden", "true");
    hint.innerHTML = '<span class="mock-pointer-finger" role="presentation">👆</span>';
    stageWrap.appendChild(hint);

    var index = 0;

    function place() {
      var tries = 0;
      while (tries < selectors.length) {
        var el = app.querySelector(selectors[index % selectors.length]);
        index += 1;
        tries += 1;
        if (!el || el.disabled || el.offsetParent === null) continue;
        var wr = stageWrap.getBoundingClientRect();
        var er = el.getBoundingClientRect();
        var x = er.left - wr.left + Math.min(er.width * 0.75, er.width - 8);
        var y = er.top - wr.top + er.height * 0.45;
        hint.style.transform = "translate(" + Math.round(x) + "px," + Math.round(y) + "px)";
        return;
      }
    }

    place();
    stageWrap._pointerTimer = setInterval(place, 3200);
  }

  function initDocsbird(root) {
    var checkBtn = root.querySelector("[data-docsbird-check]");
    var spinner = root.querySelector("[data-check-spinner]");
    var checkLabel = root.querySelector("[data-check-label]");
    var statusEl = root.querySelector("[data-ai-status]");
    var hintEl = root.querySelector("[data-ai-hint]");
    var toast = root.querySelector("[data-draft-toast]");
    var complianceBadge = root.querySelector("[data-compliance-badge]");
    var gdprBtn = root.querySelector("[data-gdpr-btn]");
    var sendWrap = root.querySelector("[data-docsbird-send-wrap]");
    var shareWrap = root.querySelector("[data-docsbird-share-wrap]");
    var sendMenu = root.querySelector("[data-docsbird-send-menu]");
    var shareMenu = root.querySelector("[data-docsbird-share-menu]");
    var previewStatus = root.querySelector("[data-preview-status]");
    var toastTimer;
    var docPhase = "editing";
    var gdprPhase = "idle";
    var checkedSnapshot = null;

    var fields = {
      counterparty: root.querySelector('[data-field="counterparty"]'),
      amount: root.querySelector('[data-field="amount"]'),
      purpose: root.querySelector('[data-field="purpose"]'),
      term: root.querySelector('[data-field="term"]')
    };

    var preview = {
      counterparty: root.querySelector("[data-preview-counterparty]"),
      amount: root.querySelector("[data-preview-amount]"),
      term: root.querySelector("[data-preview-term]"),
      status: previewStatus
    };

    var suggestValues = {
      amount: "12 450,00",
      purpose: "Consulting services Q1 2026 per agreement §4.2 (EN/LV)",
      term: "14 days"
    };

    var templateValues = {
      counterparty: "SIA Baltic Trade Ltd",
      amount: "12 450,00",
      purpose: "Consulting services Q1 2026 per agreement §4.2",
      term: "14 days"
    };

    var gdprFixValues = {
      counterparty: "SIA Baltic Trade Ltd",
      amount: "12 450,00",
      purpose: "Consulting services Q1 2026 per agreement §4.2 (EN/LV)",
      term: "14 days"
    };

    function parseAmount(str) {
      var s = String(str || "")
        .replace(/\s/g, "")
        .replace(",", ".");
      var n = parseFloat(s);
      return isNaN(n) ? null : n;
    }

    function validators() {
      return {
        counterparty: function () {
          var v = (fields.counterparty && fields.counterparty.value.trim()) || "";
          if (!v) return { ok: false, msg: "Select a company from the list" };
          return { ok: true };
        },
        amount: function () {
          var n = fields.amount ? parseAmount(fields.amount.value) : null;
          if (!n || n <= 0) return { ok: false, msg: "Enter amount > 0 (e.g. 1 234,56)" };
          return { ok: true };
        },
        purpose: function () {
          var v = (fields.purpose && fields.purpose.value.trim()) || "";
          if (v.length < 10) return { ok: false, msg: "At least 10 characters required" };
          return { ok: true };
        },
        term: function () {
          var v = (fields.term && fields.term.value.trim()) || "";
          var m = v.match(/^(\d+)\s*days?$/i);
          if (m) {
            var n = parseInt(m[1], 10);
            if (n >= 1 && n <= 90) return { ok: true };
          }
          return { ok: false, msg: "Use 14 days or a number from 1 to 90" };
        }
      };
    }

    function validateAll() {
      var v = validators();
      return v.counterparty().ok && v.amount().ok && v.purpose().ok && v.term().ok;
    }

    function setFieldError(name, show, msg) {
      var el = fields[name];
      var err = root.querySelector('[data-field-error="' + name + '"]');
      if (el) el.classList.toggle("mock-field-invalid", show);
      if (err) {
        err.classList.toggle("hidden", !show);
        if (show && msg) err.textContent = msg;
      }
    }

    function updatePreview() {
      if (preview.counterparty) {
        preview.counterparty.textContent = fields.counterparty && fields.counterparty.value.trim() ? fields.counterparty.value.trim() : "—";
      }
      if (preview.amount) {
        var amt = fields.amount && fields.amount.value.trim();
        preview.amount.textContent = amt ? "EUR " + amt : "—";
      }
      if (preview.term) {
        preview.term.textContent = fields.term && fields.term.value.trim() ? "Due: " + fields.term.value.trim() : "—";
      }
    }

    function updateCompliance() {
      if (!complianceBadge) return;
      var show = validateAll() && docPhase !== "sent" && docPhase !== "signed";
      complianceBadge.classList.toggle("hidden", !show);
    }

    function closeMenus() {
      if (sendMenu) sendMenu.classList.add("hidden");
      if (shareMenu) shareMenu.classList.add("hidden");
      root.querySelectorAll("[data-docsbird-send-caret],[data-docsbird-share-caret]").forEach(function (b) {
        b.setAttribute("aria-expanded", "false");
      });
    }

    function setFormLocked(locked) {
      Object.keys(fields).forEach(function (name) {
        if (fields[name]) fields[name].disabled = locked;
      });
      root.querySelectorAll("[data-suggest],[data-accept],[data-ai-action],[data-gdpr-btn]").forEach(function (btn) {
        btn.disabled = locked || (btn === gdprBtn && gdprPhase === "fixed");
      });
      if (checkBtn && locked) checkBtn.disabled = true;
    }

    function updatePreviewStatus() {
      if (!preview.status) return;
      var labels = { editing: "Draft", checked: "Draft", sent: "Sent", signed: "Signed" };
      preview.status.textContent = labels[docPhase] || "Draft";
      preview.status.style.color =
        docPhase === "sent" || docPhase === "signed" ? "var(--mock-success)" : "var(--mock-muted)";
    }

    function getFormSnapshot() {
      return Object.keys(fields)
        .map(function (k) {
          return k + ":" + (fields[k] ? fields[k].value : "");
        })
        .join("|");
    }

    function isFormDirty() {
      if (!checkedSnapshot) return false;
      return getFormSnapshot() !== checkedSnapshot;
    }

    function saveCheckedSnapshot() {
      checkedSnapshot = getFormSnapshot();
    }

    function handleFormEdited() {
      if (docPhase === "checked" && isFormDirty()) {
        docPhase = "editing";
        checkedSnapshot = null;
        closeMenus();
        if (statusEl) {
          statusEl.textContent = "Changes detected — check again";
          statusEl.classList.remove("mock-status-success");
        }
        if (hintEl) hintEl.textContent = "Fields updated. Run Check document before sending.";
        updateToolbar();
      }
      refreshValidation(gdprPhase === "checked");
    }

    function updateToolbar() {
      var showCheck =
        docPhase !== "sent" && docPhase !== "signed" && (docPhase === "editing" || isFormDirty());
      var showSend = docPhase === "checked" && !isFormDirty();
      if (checkBtn) {
        checkBtn.classList.toggle("hidden", !showCheck);
        if (showCheck) checkBtn.disabled = false;
      }
      if (sendWrap) sendWrap.classList.toggle("hidden", !showSend);
      if (shareWrap) shareWrap.classList.toggle("hidden", docPhase !== "sent" && docPhase !== "signed");
      updatePreviewStatus();
    }

    function refreshValidation(showErrors) {
      if (docPhase === "sent" || docPhase === "signed") return;
      var v = validators();
      Object.keys(v).forEach(function (name) {
        var r = v[name]();
        if (showErrors || gdprPhase === "checked") setFieldError(name, !r.ok, r.msg);
        else if (r.ok) setFieldError(name, false);
      });
      updatePreview();
      updateCompliance();
      if (statusEl && docPhase === "editing" && !statusEl.classList.contains("mock-status-success")) {
        statusEl.textContent = validateAll() ? "Ready to check" : "Awaiting input";
      }
    }

    function pendingFixCount() {
      return root.querySelectorAll(".mock-fix-pending").length;
    }

    function setFixState(key, state) {
      var item = root.querySelector('[data-fix="' + key + '"]');
      if (!item) return;
      item.classList.remove("mock-fix-pending", "mock-fix-fixed");
      item.classList.add(state === "fixed" ? "mock-fix-fixed" : "mock-fix-pending");
      var icon = item.querySelector(".mock-fix-icon");
      var label = item.querySelector(".mock-fix-label");
      if (icon) icon.textContent = state === "fixed" ? "✓" : "○";
      if (label && state === "fixed" && key === "vat") label.textContent = "VAT rate matches LV region";
      if (label && state === "fixed" && key === "purpose") label.textContent = "Payment purpose validated";
      if (label && state === "pending" && key === "vat") label.textContent = "VAT rate — will verify on check";
      if (label && state === "pending" && key === "purpose") label.textContent = "Payment purpose — will verify on check";
    }

    function setSuggestField(name, on) {
      var el = fields[name];
      if (!el) return;
      el.classList.toggle("mock-field-ai", on);
      var chip = root.querySelector("[data-chip-" + name + "]");
      if (chip) chip.classList.toggle("hidden", !on);
      var accept = root.querySelector('[data-accept="' + name + '"]');
      var suggest = root.querySelector('[data-suggest="' + name + '"]');
      if (accept) accept.classList.toggle("hidden", !on);
      if (suggest) suggest.classList.toggle("hidden", on);
    }

    function applyPatch(patch, useSuggest) {
      Object.keys(patch).forEach(function (k) {
        if (!fields[k]) return;
        fields[k].value = patch[k];
        if (useSuggest) setSuggestField(k, true);
      });
    }

    function hasInvalidFields() {
      var v = validators();
      return Object.keys(v).some(function (name) {
        return !v[name]().ok;
      });
    }

    function applyGdprFixes() {
      Object.keys(gdprFixValues).forEach(function (k) {
        if (!fields[k]) return;
        var v = validators()[k]();
        if (!v.ok) fields[k].value = gdprFixValues[k];
      });
      Object.keys(fields).forEach(function (name) {
        setFieldError(name, false);
      });
    }

    function showToast() {
      if (!toast) return;
      toast.classList.add("visible");
      clearTimeout(toastTimer);
      toastTimer = setTimeout(function () {
        toast.classList.remove("visible");
      }, 3000);
    }

    setFixState("vat", "pending");
    setFixState("purpose", "pending");
    updateToolbar();
    refreshValidation(false);

    Object.keys(fields).forEach(function (name) {
      var el = fields[name];
      if (!el) return;
      el.addEventListener("change", handleFormEdited);
      el.addEventListener("input", handleFormEdited);
      el.addEventListener("blur", function () {
        handleFormEdited();
        refreshValidation(true);
      });
    });

    root.addEventListener("click", function (e) {
      if (!e.target.closest(".mock-split-btn")) closeMenus();

      var suggestBtn = e.target.closest("[data-suggest]");
      if (suggestBtn && !suggestBtn.disabled) {
        var sName = suggestBtn.getAttribute("data-suggest");
        if (suggestValues[sName] !== undefined) {
          fields[sName].value = suggestValues[sName];
          setSuggestField(sName, true);
          if (sName === "purpose") setFixState("purpose", "pending");
          handleFormEdited();
        }
        return;
      }

      var accept = e.target.closest("[data-accept]");
      if (accept && !accept.disabled) {
        var aName = accept.getAttribute("data-accept");
        setSuggestField(aName, false);
        if (aName === "purpose") setFixState("purpose", "fixed");
        if (aName === "amount") setFixState("vat", "fixed");
        handleFormEdited();
        return;
      }

      if (e.target.closest("[data-ai-action=\"template\"]") && docPhase !== "sent" && docPhase !== "signed") {
        applyPatch(templateValues, false);
        setFixState("vat", "pending");
        setFixState("purpose", "pending");
        if (hintEl) hintEl.textContent = "Template applied. Run Check document when ready.";
        handleFormEdited();
        return;
      }

      if (e.target.closest("[data-gdpr-btn]") && gdprBtn && !gdprBtn.disabled) {
        if (gdprPhase === "idle") {
          gdprPhase = "checked";
          refreshValidation(true);
          if (hasInvalidFields()) {
            gdprBtn.textContent = "Fix issues";
            if (hintEl) hintEl.textContent = "GDPR check: fix highlighted fields, then click Fix issues.";
          } else {
            gdprPhase = "fixed";
            gdprBtn.disabled = true;
            if (hintEl) hintEl.textContent = "GDPR check: all fields compliant.";
          }
        } else if (gdprPhase === "checked") {
          applyGdprFixes();
          gdprPhase = "fixed";
          gdprBtn.textContent = "Fix issues";
          gdprBtn.disabled = true;
          if (hintEl) hintEl.textContent = "GDPR issues fixed. Run Check document to continue.";
          handleFormEdited();
        }
        return;
      }

      if (e.target.closest("[data-docsbird-save-draft]")) {
        showToast();
        return;
      }

      if (
        docPhase === "checked" &&
        (e.target.closest("[data-docsbird-send-caret]") || e.target.closest("[data-docsbird-send-toggle]"))
      ) {
        if (sendMenu) {
          var opening = sendMenu.classList.contains("hidden");
          closeMenus();
          if (opening) {
            sendMenu.classList.remove("hidden");
            root.querySelectorAll("[data-docsbird-send-toggle],[data-docsbird-send-caret]").forEach(function (b) {
              b.setAttribute("aria-expanded", "true");
            });
          }
        }
        return;
      }

      if (
        e.target.closest("[data-docsbird-share-caret]") ||
        e.target.closest("[data-docsbird-share-toggle]")
      ) {
        if (shareMenu) shareMenu.classList.toggle("hidden");
        return;
      }

      var sendAction = e.target.closest("[data-send-action]");
      if (sendAction && docPhase === "checked") {
        closeMenus();
        var mode = sendAction.getAttribute("data-send-action");
        docPhase = mode === "sign-send" ? "signed" : "sent";
        setFixState("vat", "fixed");
        setFixState("purpose", "fixed");
        if (statusEl) {
          statusEl.textContent = docPhase === "signed" ? "Signed" : "Sent";
          statusEl.classList.add("mock-status-success");
        }
        if (hintEl) {
          hintEl.textContent =
            docPhase === "signed"
              ? "Document signed and sent. Share or download below."
              : "Document sent. Share link or download PDF.";
        }
        setFormLocked(true);
        updateToolbar();
        updateCompliance();
        return;
      }

      var shareAction = e.target.closest("[data-share-action]");
      if (shareAction) {
        closeMenus();
        if (toast) {
          toast.textContent =
            shareAction.getAttribute("data-share-action") === "pdf"
              ? "PDF download started"
              : "Link copied to clipboard";
          showToast();
          toastTimer = setTimeout(function () {
            toast.classList.remove("visible");
            toast.textContent = "Draft saved";
          }, 3000);
        }
        return;
      }

      if (e.target.closest("[data-docsbird-check]") && checkBtn && !checkBtn.disabled) {
        refreshValidation(true);
        if (!validateAll()) {
          if (statusEl) {
            statusEl.textContent = "Complete required fields";
            statusEl.classList.remove("mock-status-success");
          }
          if (hintEl) hintEl.textContent = "Select counterparty and fill all fields before checking.";
          return;
        }

        var pending = pendingFixCount();
        checkBtn.disabled = true;
        if (spinner) spinner.classList.remove("hidden");
        if (checkLabel) checkLabel.textContent = "Checking…";
        if (statusEl) {
          statusEl.textContent = "Analyzing document…";
          statusEl.classList.remove("mock-status-success");
        }
        setTimeout(function () {
          if (spinner) spinner.classList.add("hidden");
          if (checkLabel) checkLabel.textContent = "Check document";

          refreshValidation(true);
          if (!validateAll()) {
            checkBtn.disabled = false;
            if (statusEl) statusEl.textContent = "Complete required fields";
            if (hintEl) hintEl.textContent = "Fix highlighted fields, then run Check again.";
            updateCompliance();
            updateToolbar();
            return;
          }

          if (pending > 0) {
            setFixState("vat", "fixed");
            setFixState("purpose", "fixed");
          }
          docPhase = "checked";
          saveCheckedSnapshot();
          if (statusEl) {
            statusEl.textContent = pending
              ? pending + " issue" + (pending === 1 ? "" : "s") + " fixed · ready to send"
              : "0 issues found · check complete";
            statusEl.classList.add("mock-status-success");
          }
          if (hintEl) hintEl.textContent = "Open Send and choose Send or Sign and send.";
          updateCompliance();
          updateToolbar();
        }, 1200);
      }
    });
  }

  function initCoin(root) {
    var tabs = root.querySelectorAll("[data-tab]");
    var panels = root.querySelectorAll("[data-tab-panel]");
    var periodSelect = root.querySelector("[data-coin-period]");
    var deptSelect = root.querySelector("[data-coin-dept]");

    var kpiVisits = root.querySelector("[data-kpi-visits]");
    var kpiTime = root.querySelector("[data-kpi-time]");
    var kpiDepth = root.querySelector("[data-kpi-depth]");
    var kpiDau = root.querySelector("[data-kpi-dau]");
    var kpiCsat = root.querySelector("[data-kpi-csat]");
    var kpiNps = root.querySelector("[data-kpi-nps]");
    var weekdayBars = root.querySelector("[data-weekday-bars]");
    var weekdayPanel = root.querySelector("[data-coin-weekday-panel]");
    var trendPanel = root.querySelector("[data-coin-trend-panel]");
    var trendFill = root.querySelector("[data-trend-fill]");
    var trendLine = root.querySelector("[data-trend-line]");
    var trendYaxis = root.querySelector("[data-trend-yaxis]");
    var trendXaxis = root.querySelector("[data-trend-xaxis]");
    var trendTitle = root.querySelector("[data-trend-title]");
    var peakNote = root.querySelector("[data-peak-note]");
    var mobileNote = root.querySelector("[data-mobile-note]");
    var sectionsBars = root.querySelector("[data-sections-bars]");
    var sectionsTable = root.querySelector("[data-sections-table]");
    var surveyCsat = root.querySelector("[data-survey-csat]");
    var surveyNps = root.querySelector("[data-survey-nps]");
    var surveyRate = root.querySelector("[data-survey-rate]");
    var surveysBody = root.querySelector("[data-surveys-tbody]");

    var lastCoinWeekdayVals = [];
    var lastCoinTrendVals = [];
    var lastCoinTrendLabels = [];

    var coinDatasets = {
      "30d": {
        all: {
          visits: "3.2",
          time: "18m",
          depth: "4.6",
          dau: "2.8k",
          csat: "4.2",
          nps: "+24",
          weekdayBars: [42, 68, 55, 85, 100, 22, 12],
          weekdayValues: [820, 1240, 980, 1180, 1420, 310, 180],
          trendValues: [2380, 2450, 2510, 2560, 2620, 2680, 2740, 2800],
          trendLabels: ["Week 1", "Week 2", "Week 3", "Week 4"],
          peak: "Peak: Friday · 1,420 visits",
          mobile: "Mobile sessions: 62% · Desktop: 38%",
          sections: [
            ["Feed", 92],
            ["Learning", 68],
            ["Gamification", 54],
            ["Shop", 41],
            ["Surveys", 36],
            ["Profile", 78]
          ],
          table: [
            ["Feed", "4m 12s", "12%"],
            ["Learning", "6m 40s", "18%"],
            ["Gamification", "2m 05s", "24%"]
          ],
          responseRate: "68%",
          surveys: [
            ["Mobile app usability", "412", "4.4"],
            ["News feed relevance", "287", "4.1"],
            ["Rewards system", "198", "3.8"],
            ["HR onboarding", "156", "4.5"],
            ["Learning content", "134", "4.0"]
          ]
        },
        engineering: {
          visits: "4.1",
          time: "22m",
          depth: "5.8",
          dau: "1.1k",
          csat: "4.4",
          nps: "+31",
          weekdayBars: [55, 78, 72, 92, 100, 18, 8],
          weekdayValues: [620, 980, 890, 1080, 1180, 210, 95],
          trendValues: [980, 1010, 1040, 1060, 1080, 1100, 1120, 1140],
          trendLabels: ["Week 1", "Week 2", "Week 3", "Week 4"],
          peak: "Peak: Thursday standup · 1,180 visits",
          mobile: "Mobile: 48% · Desktop: 52%",
          sections: [
            ["Feed", 78],
            ["Learning", 88],
            ["Gamification", 62],
            ["Shop", 35],
            ["Surveys", 28],
            ["Profile", 71]
          ],
          table: [
            ["Learning", "8m 20s", "14%"],
            ["Feed", "3m 40s", "15%"],
            ["Gamification", "2m 50s", "20%"]
          ],
          responseRate: "74%",
          surveys: [
            ["Dev tooling survey", "186", "4.6"],
            ["News feed relevance", "142", "4.2"],
            ["Rewards system", "98", "4.0"],
            ["HR onboarding", "64", "4.3"],
            ["Learning content", "210", "4.5"]
          ]
        },
        hr: {
          visits: "2.6",
          time: "14m",
          depth: "3.9",
          dau: "640",
          csat: "4.0",
          nps: "+18",
          weekdayBars: [38, 52, 48, 62, 88, 28, 15],
          weekdayValues: [410, 560, 520, 640, 920, 280, 150],
          trendValues: [520, 535, 548, 560, 572, 585, 598, 610],
          trendLabels: ["Week 1", "Week 2", "Week 3", "Week 4"],
          peak: "Peak: Tuesday morning · 920 visits",
          mobile: "Mobile: 71% · Desktop: 29%",
          sections: [
            ["Feed", 95],
            ["Learning", 52],
            ["Gamification", 38],
            ["Shop", 48],
            ["Surveys", 58],
            ["Profile", 82]
          ],
          table: [
            ["Surveys", "5m 10s", "10%"],
            ["Feed", "5m 02s", "9%"],
            ["Profile", "3m 18s", "11%"]
          ],
          responseRate: "81%",
          surveys: [
            ["HR onboarding", "312", "4.6"],
            ["Benefits feedback", "198", "3.9"],
            ["Mobile app usability", "124", "4.1"],
            ["News feed relevance", "88", "3.7"],
            ["Learning content", "76", "4.0"]
          ]
        }
      },
      "7d": {
        all: {
          visits: "2.8",
          time: "15m",
          depth: "4.1",
          dau: "2.4k",
          csat: "4.1",
          nps: "+21",
          weekdayBars: [48, 72, 58, 90, 95, 18, 10],
          weekdayValues: [760, 1120, 910, 1080, 1140, 220, 120],
          trendValues: [2580, 2520, 2640, 2610, 2720, 2680, 2800],
          trendLabels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
          peak: "Peak: Wed–Thu lunch · 1,140 visits",
          mobile: "Mobile sessions: 65% · Desktop: 35%",
          sections: [
            ["Feed", 88],
            ["Learning", 62],
            ["Gamification", 48],
            ["Shop", 38],
            ["Surveys", 32],
            ["Profile", 74]
          ],
          table: [
            ["Feed", "3m 48s", "14%"],
            ["Learning", "5m 55s", "20%"],
            ["Gamification", "1m 52s", "26%"]
          ],
          responseRate: "61%",
          surveys: [
            ["Mobile app usability", "98", "4.2"],
            ["News feed relevance", "72", "4.0"],
            ["Rewards system", "54", "3.6"],
            ["HR onboarding", "41", "4.4"],
            ["Learning content", "38", "3.9"]
          ]
        },
        engineering: {
          visits: "3.5",
          time: "19m",
          depth: "5.2",
          dau: "980",
          csat: "4.3",
          nps: "+28",
          weekdayBars: [60, 82, 75, 95, 92, 12, 6],
          weekdayValues: [540, 880, 810, 1020, 990, 130, 65],
          trendValues: [940, 920, 980, 960, 1010, 990, 1050],
          trendLabels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
          peak: "Peak: Thursday 11am · 1,020 visits",
          mobile: "Mobile: 51% · Desktop: 49%",
          sections: [
            ["Feed", 72],
            ["Learning", 84],
            ["Gamification", 55],
            ["Shop", 30],
            ["Surveys", 22],
            ["Profile", 68]
          ],
          table: [
            ["Learning", "7m 40s", "16%"],
            ["Feed", "3m 10s", "17%"],
            ["Gamification", "2m 20s", "22%"]
          ],
          responseRate: "69%",
          surveys: [
            ["Dev tooling survey", "62", "4.5"],
            ["News feed relevance", "48", "4.1"],
            ["Learning content", "88", "4.4"]
          ]
        },
        hr: {
          visits: "2.2",
          time: "12m",
          depth: "3.5",
          dau: "520",
          csat: "3.9",
          nps: "+15",
          weekdayBars: [40, 48, 52, 58, 82, 22, 12],
          weekdayValues: [320, 380, 410, 460, 650, 175, 95],
          trendValues: [500, 490, 510, 505, 530, 525, 545],
          trendLabels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
          peak: "Peak: Tuesday 9am · 650 visits",
          mobile: "Mobile: 74% · Desktop: 26%",
          sections: [
            ["Feed", 90],
            ["Learning", 45],
            ["Gamification", 32],
            ["Shop", 42],
            ["Surveys", 62],
            ["Profile", 78]
          ],
          table: [
            ["Surveys", "4m 40s", "11%"],
            ["Feed", "4m 30s", "10%"],
            ["Profile", "2m 50s", "12%"]
          ],
          responseRate: "76%",
          surveys: [
            ["HR onboarding", "124", "4.5"],
            ["Benefits feedback", "86", "3.8"],
            ["Mobile app usability", "42", "4.0"]
          ]
        }
      }
    };

    function showTab(id) {
      tabs.forEach(function (tab) {
        var active = tab.getAttribute("data-tab") === id;
        tab.classList.toggle("active", active);
        tab.setAttribute("aria-selected", active ? "true" : "false");
      });
      panels.forEach(function (panel) {
        panel.classList.toggle("hidden", panel.getAttribute("data-tab-panel") !== id);
      });
    }

    function applyCoinData() {
      var period = periodSelect ? periodSelect.value : "30d";
      var dept = deptSelect ? deptSelect.value : "all";
      var periodSet = coinDatasets[period] || coinDatasets["30d"];
      var data = periodSet[dept] || periodSet.all;
      if (!data) return;

      if (kpiVisits) kpiVisits.textContent = data.visits;
      if (kpiTime) kpiTime.textContent = data.time;
      if (kpiDepth) kpiDepth.textContent = data.depth;
      if (kpiDau) kpiDau.textContent = data.dau;
      if (kpiCsat) kpiCsat.textContent = data.csat;
      if (kpiNps) kpiNps.textContent = data.nps;
      if (trendTitle) trendTitle.textContent = period === "7d" ? "Active users (7d)" : "Active users (30d)";
      if (peakNote) peakNote.textContent = data.peak;
      if (mobileNote) mobileNote.textContent = data.mobile;
      if (surveyCsat) surveyCsat.textContent = data.csat;
      if (surveyNps) surveyNps.textContent = data.nps;
      if (surveyRate) surveyRate.textContent = "Response rate " + data.responseRate;

      lastCoinWeekdayVals = data.weekdayValues;
      lastCoinTrendVals = data.trendValues;
      lastCoinTrendLabels = data.trendLabels;

      if (weekdayBars) {
        renderBarColumns(weekdayBars, DAY_LABELS, data.weekdayBars, {
          weekend: true,
          peakDay: 4
        });
      }

      applyTrendChart(
        trendPanel,
        trendYaxis,
        trendFill,
        trendLine,
        trendXaxis,
        data.trendValues,
        data.trendLabels,
        48
      );

      if (sectionsBars) {
        sectionsBars.innerHTML = data.sections
          .map(function (row) {
            return (
              '<div class="flex items-center gap-2 text-[10px]"><span class="w-20 shrink-0">' +
              row[0] +
              '</span><div class="mock-progress-inline"><span style="width:' +
              row[1] +
              '%"></span></div><span class="w-8 text-right">' +
              row[1] +
              "%</span></div>"
            );
          })
          .join("");
      }

      if (sectionsTable) {
        sectionsTable.innerHTML = data.table
          .map(function (row) {
            return "<tr><td>" + row[0] + "</td><td>" + row[1] + "</td><td>" + row[2] + "</td></tr>";
          })
          .join("");
      }

      if (surveysBody) {
        surveysBody.innerHTML = data.surveys
          .map(function (row) {
            var isLow = parseFloat(row[2]) < 4;
            var scoreAttr = isLow
              ? ' style="color:var(--mock-warning)"'
              : ' class="mock-kpi-delta"';
            return (
              "<tr><td>" +
              row[0] +
              "</td><td>" +
              row[1] +
              "</td><td" +
              scoreAttr +
              ">" +
              row[2] +
              "</td></tr>"
            );
          })
          .join("");
      }
    }

    applyCoinData();

    if (weekdayPanel) {
      bindBarChart(weekdayPanel, function (i) {
        return DAY_LABELS[i] + " · " + lastCoinWeekdayVals[i].toLocaleString() + " visits";
      });
    }
    if (trendPanel) {
      bindLineChart(
        trendPanel,
        "[data-trend-body]",
        function () {
          return lastCoinTrendLabels;
        },
        function () {
          return lastCoinTrendVals;
        },
        function (i, val, label) {
          return (label || "Point " + (i + 1)) + " · " + formatUsers(val) + " active users";
        },
        48
      );
    }

    root.addEventListener("click", function (e) {
      var tab = e.target.closest("[data-tab]");
      if (tab) showTab(tab.getAttribute("data-tab"));
    });

    if (periodSelect) periodSelect.addEventListener("change", applyCoinData);
    if (deptSelect) deptSelect.addEventListener("change", applyCoinData);
  }

  window.initAiCaseDemo = function (container) {
    if (!container) return;
    var demo = container.getAttribute("data-demo");
    var app = container.querySelector(".mock-app");
    var stageWrap = container.closest(".mock-stage-wrap");
    if (!app) return;
    if (demo === "wuw") initWuw(app);
    else if (demo === "docsbird") initDocsbird(app);
    else if (demo === "coin") initCoin(app);
    if (stageWrap) initMockPointerHint(stageWrap, app, demo);
  };

  function initResetButtons() {
    document.querySelectorAll("[data-mock-reset]").forEach(function (btn) {
      if (!btn.querySelector("svg")) btn.innerHTML = REFRESH_ICON;
      if (btn.dataset.resetBound) return;
      btn.dataset.resetBound = "1";
      btn.addEventListener("click", function () {
        var wrap = btn.closest(".mock-stage-wrap");
        var node = wrap && wrap.querySelector("[data-mock]");
        if (!node || btn.disabled) return;
        if (wrap && wrap._pointerTimer) {
          clearInterval(wrap._pointerTimer);
          wrap._pointerTimer = null;
        }
        btn.disabled = true;
        loadAiCaseMock(node)
          .catch(function (err) {
            console.error("Mock reset failed:", err);
            node.innerHTML = '<p class="text-sm text-gray-500 p-4">Не удалось загрузить демо.</p>';
          })
          .finally(function () {
            btn.disabled = false;
          });
      });
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initResetButtons);
  } else {
    initResetButtons();
  }
})();

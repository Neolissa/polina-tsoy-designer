(function () {
  var isRendered = false;
  var charts = [];

  function getEvents() {
    if (!window.portfolioAnalytics || typeof window.portfolioAnalytics.getLocalEvents !== "function") {
      return [];
    }
    return window.portfolioAnalytics.getLocalEvents();
  }

  function toCountMap(events) {
    return events.reduce(function (acc, event) {
      acc[event.name] = (acc[event.name] || 0) + 1;
      return acc;
    }, {});
  }

  function toCaseMap(events) {
    return events
      .filter(function (event) {
        return event.name === "case_card_clicked" && event.props && event.props.case_slug;
      })
      .reduce(function (acc, event) {
        var slug = event.props.case_slug;
        acc[slug] = (acc[slug] || 0) + 1;
        return acc;
      }, {});
  }

  function toScrollMap(events) {
    var map = { 25: 0, 50: 0, 75: 0, 90: 0 };
    events.forEach(function (event) {
      if (event.name === "scroll_depth_reached" && event.props && event.props.depth_percent) {
        var depth = String(event.props.depth_percent);
        if (map.hasOwnProperty(depth)) map[depth] += 1;
      }
    });
    return map;
  }

  function destroyCharts() {
    charts.forEach(function (chart) {
      chart.destroy();
    });
    charts = [];
  }

  function setKpis(events, countMap) {
    var heroExposed = countMap.hero_ab_exposed || 0;
    var heroClicks = countMap.hero_cta_clicked || 0;
    var heroCtr = heroExposed ? ((heroClicks / heroExposed) * 100).toFixed(1) + "%" : "—";
    var total = events.length;
    var contacts = (countMap.contact_click_email || 0) + (countMap.contact_click_telegram || 0);
    var cases = countMap.case_card_clicked || 0;

    var heroEl = document.querySelector("[data-kpi-hero-ctr]");
    var totalEl = document.querySelector("[data-kpi-total-events]");
    var casesEl = document.querySelector("[data-kpi-case-clicks]");
    var contactsEl = document.querySelector("[data-kpi-contact-clicks]");
    if (heroEl) heroEl.textContent = heroCtr;
    if (totalEl) totalEl.textContent = String(total);
    if (casesEl) casesEl.textContent = String(cases);
    if (contactsEl) contactsEl.textContent = String(contacts);
    setAbKpis(events);
  }

  function setAbKpis(events) {
    var exposedA = 0;
    var exposedB = 0;
    var clickA = 0;
    var clickB = 0;
    var minSample = 20;

    events.forEach(function (event) {
      var variant = event.props && event.props.variant ? String(event.props.variant).toUpperCase() : "";
      if (!variant) return;
      if (event.name === "hero_ab_exposed") {
        if (variant === "A") exposedA += 1;
        if (variant === "B") exposedB += 1;
      }
      if (event.name === "hero_cta_clicked") {
        if (variant === "A") clickA += 1;
        if (variant === "B") clickB += 1;
      }
    });

    var ctrA = exposedA > 0 ? ((clickA / exposedA) * 100).toFixed(1) + "%" : "—";
    var ctrB = exposedB > 0 ? ((clickB / exposedB) * 100).toFixed(1) + "%" : "—";
    var elCtrA = document.querySelector("[data-kpi-ctr-a]");
    var elCtrB = document.querySelector("[data-kpi-ctr-b]");
    var elExpA = document.querySelector("[data-kpi-exp-a]");
    var elExpB = document.querySelector("[data-kpi-exp-b]");
    var badge = document.querySelector("[data-ab-winner-badge]");

    if (elCtrA) elCtrA.textContent = ctrA;
    if (elCtrB) elCtrB.textContent = ctrB;
    if (elExpA) elExpA.textContent = "exposures: " + exposedA + ", clicks: " + clickA;
    if (elExpB) elExpB.textContent = "exposures: " + exposedB + ", clicks: " + clickB;

    if (!badge) return;
    badge.className = "rounded-full px-3 py-1 text-xs font-semibold";

    if (exposedA < minSample || exposedB < minSample) {
      badge.textContent = "no winner yet";
      badge.classList.add("bg-gray-100", "text-gray-700");
      return;
    }

    var rateA = exposedA ? clickA / exposedA : 0;
    var rateB = exposedB ? clickB / exposedB : 0;
    if (rateA === rateB) {
      badge.textContent = "tie";
      badge.classList.add("bg-amber-100", "text-amber-800");
      return;
    }

    var winner = rateA > rateB ? "A" : "B";
    badge.textContent = "winner: variant " + winner;
    badge.classList.add("bg-emerald-100", "text-emerald-800");
  }

  function renderEventsChart(countMap) {
    var canvas = document.getElementById("eventsChart");
    if (!canvas || !window.Chart) return;
    var labels = Object.keys(countMap);
    var values = labels.map(function (label) {
      return countMap[label];
    });

    charts.push(
      new window.Chart(canvas, {
        type: "bar",
        data: {
          labels: labels,
          datasets: [{
            label: "Количество событий",
            data: values,
            backgroundColor: "rgba(99, 102, 241, 0.5)",
            borderColor: "rgba(99, 102, 241, 1)",
            borderWidth: 1
          }]
        },
        options: {
          responsive: true,
          plugins: { legend: { display: false } }
        }
      })
    );
  }

  function renderCaseChart(caseMap) {
    var canvas = document.getElementById("caseChart");
    if (!canvas || !window.Chart) return;
    var labels = Object.keys(caseMap);
    var values = labels.map(function (label) {
      return caseMap[label];
    });
    charts.push(
      new window.Chart(canvas, {
        type: "doughnut",
        data: {
          labels: labels.length ? labels : ["Нет данных"],
          datasets: [{
            data: values.length ? values : [1],
            backgroundColor: ["#6366f1", "#8b5cf6", "#ec4899", "#14b8a6", "#f59e0b"]
          }]
        },
        options: {
          responsive: true
        }
      })
    );
  }

  function renderScrollChart(scrollMap) {
    var canvas = document.getElementById("scrollChart");
    if (!canvas || !window.Chart) return;
    var labels = Object.keys(scrollMap).map(function (depth) {
      return depth + "%";
    });
    var values = Object.keys(scrollMap).map(function (depth) {
      return scrollMap[depth];
    });

    charts.push(
      new window.Chart(canvas, {
        type: "line",
        data: {
          labels: labels,
          datasets: [{
            label: "Срабатывания по глубине скролла",
            data: values,
            borderColor: "#a855f7",
            backgroundColor: "rgba(168, 85, 247, 0.2)",
            fill: true,
            tension: 0.3
          }]
        },
        options: {
          responsive: true
        }
      })
    );
  }

  function renderEventsTable(events) {
    var tbody = document.querySelector("[data-events-table]");
    if (!tbody) return;
    tbody.innerHTML = "";

    events
      .slice(-10)
      .reverse()
      .forEach(function (event) {
        var row = document.createElement("tr");
        row.className = "border-b border-gray-100";
        row.innerHTML =
          "<td class=\"p-2 font-medium\">" + event.name + "</td>" +
          "<td class=\"p-2 text-xs text-gray-600\">" + new Date(event.ts).toLocaleString() + "</td>" +
          "<td class=\"p-2 text-xs text-gray-600\">" + JSON.stringify(event.props || {}) + "</td>";
        tbody.appendChild(row);
      });
  }

  function renderDashboard() {
    var events = getEvents();
    var countMap = toCountMap(events);
    var caseMap = toCaseMap(events);
    var scrollMap = toScrollMap(events);

    destroyCharts();
    setKpis(events, countMap);
    renderEventsChart(countMap);
    renderCaseChart(caseMap);
    renderScrollChart(scrollMap);
    renderEventsTable(events);
  }

  function watchAdminUnlock() {
    var content = document.querySelector("[data-admin-content]");
    if (!content) return;
    var observer = new MutationObserver(function () {
      var unlocked = !content.classList.contains("hidden");
      if (unlocked) {
        renderDashboard();
        isRendered = true;
      }
    });
    observer.observe(content, { attributes: true, attributeFilter: ["class"] });
  }

  document.addEventListener("DOMContentLoaded", function () {
    watchAdminUnlock();
    var refreshButton = document.querySelector("[data-refresh-dashboard]");
    if (refreshButton) {
      refreshButton.addEventListener("click", renderDashboard);
    }

    var content = document.querySelector("[data-admin-content]");
    if (content && !content.classList.contains("hidden") && !isRendered) {
      renderDashboard();
      isRendered = true;
    }
  });
})();

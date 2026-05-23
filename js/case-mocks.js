(function () {
  var REFRESH_ICON =
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/><path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16"/><path d="M16 16h5v5"/></svg>';

  function resolveMockPath(node) {
    var path = node.getAttribute("data-mock");
    if (!path) return null;
    if (/^https?:\/\//.test(path) || path.charAt(0) === "/") return path;
    return path;
  }

  function loadCaseMock(node) {
    var path = resolveMockPath(node);
    if (!path) return Promise.resolve();
    return fetch(path)
      .then(function (r) {
        if (!r.ok) throw new Error(path);
        return r.text();
      })
      .then(function (html) {
        node.innerHTML = html;
        var demo = node.getAttribute("data-demo");
        if (demo === "coin-social") initCoinSocial(node);
        else if (window.initAiCaseDemo) window.initAiCaseDemo(node);
        if (window.mockObserver) window.mockObserver.observe(node);
      });
  }

  window.loadCaseMock = loadCaseMock;

  function initCoinSocial(container) {
    var root = container.querySelector(".mock-app");
    if (!root || root.dataset.coinSocialBound) return;
    root.dataset.coinSocialBound = "1";

    var panels = root.querySelectorAll("[data-coin-panel]");
    var navItems = root.querySelectorAll("[data-coin-nav]");
    var filters = root.querySelectorAll("[data-coin-filter]");
    var rain = root.querySelector("[data-coin-rain]");
    var thanksBtn = root.querySelector("[data-coin-thanks]");
    var composeBtn = root.querySelector("[data-coin-compose]");
    var composePanel = root.querySelector("[data-coin-compose-panel]");
    var publishBtn = root.querySelector("[data-coin-publish]");

    function showPanel(id) {
      panels.forEach(function (p) {
        p.classList.toggle("hidden", p.getAttribute("data-coin-panel") !== id);
      });
      navItems.forEach(function (n) {
        n.classList.toggle("active", n.getAttribute("data-coin-nav") === id);
      });
    }

    function spawnCoins() {
      if (!rain) return;
      rain.innerHTML = "";
      for (var i = 0; i < 14; i++) {
        var coin = document.createElement("span");
        coin.textContent = "🪙";
        coin.style.left = 8 + Math.random() * 84 + "%";
        coin.style.animationDelay = Math.random() * 0.35 + "s";
        rain.appendChild(coin);
      }
      setTimeout(function () {
        rain.innerHTML = "";
      }, 1400);
    }

    root.addEventListener("click", function (e) {
      var nav = e.target.closest("[data-coin-nav]");
      if (nav) {
        showPanel(nav.getAttribute("data-coin-nav"));
        return;
      }

      var filter = e.target.closest("[data-coin-filter]");
      if (filter) {
        filters.forEach(function (f) {
          f.classList.toggle("active", f === filter);
        });
        var key = filter.getAttribute("data-coin-filter");
        var photoPost = root.querySelector('[data-coin-post-filter="photo"]');
        if (photoPost) {
          photoPost.classList.toggle("hidden", key !== "photo");
        }
        return;
      }

      if (e.target.closest("[data-coin-thanks]")) {
        spawnCoins();
        var label = root.querySelector("[data-coin-thanks-label]");
        if (label) label.textContent = "🪙 +50 отправлено";
        if (thanksBtn) thanksBtn.disabled = true;
        return;
      }

      if (e.target.closest("[data-coin-compose]") && composePanel) {
        composePanel.classList.toggle("hidden");
        return;
      }

      if (e.target.closest("[data-coin-publish]") && composePanel) {
        composePanel.classList.add("hidden");
        var list = root.querySelector("[data-coin-articles-list]");
        if (list) {
          var item = document.createElement("button");
          item.type = "button";
          item.className =
            "w-full text-left p-2 rounded-md border transition-colors";
          item.style.borderColor = "var(--mock-border)";
          item.innerHTML =
            '<div class="text-[10px] font-semibold">Черновик: UX чеклист</div>' +
            '<div class="text-[8px]" style="color:var(--mock-muted)">Вы · только что</div>';
          list.insertBefore(item, list.firstChild);
        }
      }

      var like = e.target.closest("[data-coin-like]");
      if (like && !like.dataset.liked) {
        like.dataset.liked = "1";
        like.textContent = "👍 13";
      }
    });

    showPanel("feed");
  }

  function initResetButtons() {
    document.querySelectorAll("[data-case-mock-reset]").forEach(function (btn) {
      if (!btn.querySelector("svg")) btn.innerHTML = REFRESH_ICON;
      if (btn.dataset.resetBound) return;
      btn.dataset.resetBound = "1";
      btn.addEventListener("click", function () {
        var wrap = btn.closest(".case-mock-stage-wrap, .case-mock-block");
        var svgNode = wrap && wrap.querySelector("[data-case-mock-svg]");
        var tvipRoot = wrap && wrap.querySelector("[data-tvip-case-mock]");
        var node = wrap && wrap.querySelector("[data-mock]");
        if (btn.disabled) return;
        btn.disabled = true;

        if (svgNode && window.CaseMockSvg) {
          window.CaseMockSvg.resetMock(svgNode);
          btn.disabled = false;
          return;
        }
        if (tvipRoot && tvipRoot.__tvipMockReset) {
          tvipRoot.__tvipMockReset();
          btn.disabled = false;
          return;
        }
        if (!node) {
          btn.disabled = false;
          return;
        }
        loadCaseMock(node)
          .catch(function (err) {
            console.error("Case mock reset failed:", err);
            node.innerHTML =
              '<p class="text-sm text-gray-500 p-4">Не удалось загрузить демо.</p>';
          })
          .finally(function () {
            btn.disabled = false;
          });
      });
    });
  }

  function bootSvgMocks() {
    if (!window.CaseMockSvg) return;
    document.querySelectorAll('[data-case-mock-svg="coin"]').forEach(function (node) {
      window.CaseMockSvg.mountCoinMock(node);
    });
    document.querySelectorAll('[data-case-mock-svg="docsbird"]').forEach(function (node) {
      window.CaseMockSvg.mountDocsbirdMock(node);
    });
  }

  function bootMocks() {
    bootSvgMocks();
    document.querySelectorAll("[data-mock][data-demo]").forEach(function (node) {
      if (node.closest("[data-tvip-case-mock]")) return;
      loadCaseMock(node).catch(function (err) {
        console.error("Case mock load failed:", err);
        node.innerHTML =
          '<p class="text-sm text-gray-500 p-4">Не удалось загрузить демо.</p>';
      });
    });
    initResetButtons();
    if (window.mountTvipsCaseMock) {
      document.querySelectorAll("[data-tvip-case-mock]").forEach(window.mountTvipsCaseMock);
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", bootMocks);
  } else {
    bootMocks();
  }
})();

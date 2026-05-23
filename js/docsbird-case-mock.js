(function () {
  function resolveMockPath() {
    var path = window.location.pathname || "";
    if (/\/ru\//.test(path) || /\/en\//.test(path)) {
      return "../components/case-mocks/docsbird-flow.html";
    }
    return "components/case-mocks/docsbird-flow.html";
  }

  function showScreen(root, id) {
    root.querySelectorAll("[data-docsbird-screen]").forEach(function (s) {
      var on = s.getAttribute("data-docsbird-screen") === id;
      s.classList.toggle("is-active", on);
      s.hidden = !on;
    });
    root.querySelectorAll("[data-docsbird-goto]").forEach(function (tab) {
      if (tab.getAttribute("data-docsbird-goto") === id && tab.classList.contains("docsbird-flow__tab")) {
        tab.classList.add("is-active");
      } else if (tab.classList.contains("docsbird-flow__tab")) {
        tab.classList.remove("is-active");
      }
    });
  }

  function bindFlyout(root) {
    var trigger = root.querySelector("[data-docsbird-menu-trigger]");
    var menu = root.querySelector("[data-docsbird-menu]");
    var flyout = root.querySelector("[data-docsbird-flyout]");
    if (!trigger || !menu || !flyout) return;

    flyout.addEventListener("mouseenter", function () {
      flyout.classList.add("is-open");
      trigger.setAttribute("aria-expanded", "true");
    });
    flyout.addEventListener("mouseleave", function () {
      flyout.classList.remove("is-open");
      trigger.setAttribute("aria-expanded", "false");
    });
    trigger.addEventListener("focus", function () {
      flyout.classList.add("is-open");
    });
  }

  function bindNavigation(root) {
    root.addEventListener("click", function (e) {
      var goto = e.target.closest("[data-docsbird-goto]");
      if (goto) {
        var id = goto.getAttribute("data-docsbird-goto");
        if (id) showScreen(root, id);
      }
    });
  }

  function mountDocsbirdFlow(container) {
    if (!container || container.dataset.docsbirdFlowReady === "1") return Promise.resolve();

    return fetch(resolveMockPath())
      .then(function (r) {
        if (!r.ok) throw new Error("docsbird-flow");
        return r.text();
      })
      .then(function (html) {
        container.innerHTML = html;
        var root = container.querySelector("[data-docsbird-flow]");
        if (!root) return;
        container.dataset.docsbirdFlowReady = "1";
        bindNavigation(root);
        bindFlyout(root);
        showScreen(root, "agreements");

        var formHost = root.querySelector("[data-docsbird-form-host]");
        if (formHost && window.initAiCaseDemo) {
          formHost.setAttribute("data-demo", "docsbird");
          window.initAiCaseDemo(formHost);
        }

        container.__docsbirdFlowReset = function () {
          container.dataset.docsbirdFlowReady = "0";
          container.innerHTML = "";
          mountDocsbirdFlow(container);
        };
      });
  }

  window.mountDocsbirdCaseMock = mountDocsbirdFlow;
})();

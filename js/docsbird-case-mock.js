(function () {
  function resolveMockPath() {
    var path = window.location.pathname || "";
    if (/\/ru\//.test(path) || /\/en\//.test(path)) {
      return "../components/case-mocks/docsbird-flow.html";
    }
    return "components/case-mocks/docsbird-flow.html";
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
        container.dataset.docsbirdFlowReady = "1";
        container.__docsbirdFlowReset = function () {
          container.dataset.docsbirdFlowReady = "0";
          container.innerHTML = "";
          mountDocsbirdFlow(container);
        };
      });
  }

  window.mountDocsbirdCaseMock = mountDocsbirdFlow;
})();

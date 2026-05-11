(function () {
  var AUTH_KEY = "portfolioAdminUnlocked";

  function getPassword() {
    var cfg = window.PORTFOLIO_CONFIG || {};
    return cfg.admin && cfg.admin.password;
  }

  function isUnlocked() {
    try {
      return localStorage.getItem(AUTH_KEY) === "yes";
    } catch (error) {
      return false;
    }
  }

  function setUnlocked() {
    try {
      localStorage.setItem(AUTH_KEY, "yes");
    } catch (error) {
      return;
    }
  }

  function lock() {
    try {
      localStorage.removeItem(AUTH_KEY);
    } catch (error) {
      return;
    }
  }

  function showPanel(unlocked) {
    var login = document.querySelector("[data-admin-login]");
    var content = document.querySelector("[data-admin-content]");
    if (!login || !content) return;
    login.classList.toggle("hidden", unlocked);
    content.classList.toggle("hidden", !unlocked);
  }

  function wireForm() {
    var form = document.querySelector("[data-admin-form]");
    var input = document.querySelector("[data-admin-password]");
    var error = document.querySelector("[data-admin-error]");
    var logout = document.querySelector("[data-admin-logout]");
    if (!form || !input || !error || !logout) return;

    form.addEventListener("submit", function (event) {
      event.preventDefault();
      var pass = input.value.trim();
      if (pass && pass === getPassword()) {
        setUnlocked();
        error.classList.add("hidden");
        showPanel(true);
      } else {
        error.classList.remove("hidden");
      }
    });

    logout.addEventListener("click", function () {
      lock();
      showPanel(false);
      input.value = "";
    });
  }

  document.addEventListener("DOMContentLoaded", function () {
    showPanel(isUnlocked());
    wireForm();
  });
})();

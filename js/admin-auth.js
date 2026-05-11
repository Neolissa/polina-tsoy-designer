(function () {
  var AUTH_KEY = "portfolioAdminUnlocked";
  var ADMIN_USER_KEY = "portfolioAdminUser";

  function getAdminConfig() {
    var cfg = window.PORTFOLIO_CONFIG || {};
    return cfg.admin || {};
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
      localStorage.setItem(ADMIN_USER_KEY, JSON.stringify({
        email: getAdminConfig().email || "",
        role: getAdminConfig().role || "ADMIN"
      }));
    } catch (error) {
      return;
    }
  }

  function lock() {
    try {
      localStorage.removeItem(AUTH_KEY);
      localStorage.removeItem(ADMIN_USER_KEY);
    } catch (error) {
      return;
    }
  }

  function getUser() {
    try {
      return JSON.parse(localStorage.getItem(ADMIN_USER_KEY) || "{}");
    } catch (error) {
      return {};
    }
  }

  function updateUserBadge() {
    var badge = document.querySelector("[data-admin-user]");
    if (!badge) return;
    var user = getUser();
    var email = user.email || getAdminConfig().email || "admin";
    var role = user.role || getAdminConfig().role || "ADMIN";
    badge.textContent = email + " • " + role;
  }

  function showPanel(unlocked) {
    var login = document.querySelector("[data-admin-login]");
    var content = document.querySelector("[data-admin-content]");
    var topLogout = document.querySelector("[data-admin-logout-top]");
    if (!login || !content) return;
    login.classList.toggle("hidden", unlocked);
    content.classList.toggle("hidden", !unlocked);
    if (topLogout) {
      topLogout.classList.toggle("hidden", !unlocked);
    }
    if (unlocked) updateUserBadge();
  }

  function wireForm() {
    var form = document.querySelector("[data-admin-form]");
    var emailInput = document.querySelector("[data-admin-email]");
    var passwordInput = document.querySelector("[data-admin-password]");
    var error = document.querySelector("[data-admin-error]");
    var logout = document.querySelector("[data-admin-logout]");
    var topLogout = document.querySelector("[data-admin-logout-top]");
    if (!form || !emailInput || !passwordInput || !error || !logout) return;

    form.addEventListener("submit", function (event) {
      event.preventDefault();
      var email = emailInput.value.trim().toLowerCase();
      var pass = passwordInput.value.trim();
      var adminCfg = getAdminConfig();

      if (email === String(adminCfg.email || "").toLowerCase() && pass && pass === adminCfg.password) {
        setUnlocked();
        error.classList.add("hidden");
        showPanel(true);
      } else {
        error.classList.remove("hidden");
      }
    });

    function doLogout() {
      lock();
      showPanel(false);
      emailInput.value = "";
      passwordInput.value = "";
    }

    logout.addEventListener("click", doLogout);
    if (topLogout) {
      topLogout.addEventListener("click", doLogout);
    }
  }

  document.addEventListener("DOMContentLoaded", function () {
    var unlocked = isUnlocked();
    showPanel(unlocked);
    wireForm();
    if (unlocked) {
      updateUserBadge();
    }
  });
})();

// Load shared nav/footer components
document.addEventListener('DOMContentLoaded', function() {
    var localeMatch = window.location.pathname.match(/\/(ru|en|es)\//);
    var locale = localeMatch ? localeMatch[1] : 'ru';
    var isNestedLocale = Boolean(localeMatch);
    var basePrefix = isNestedLocale ? '../' : '';
    var isProjectWork = document.documentElement.getAttribute('data-page') === 'project-work';

    function homeHref() {
        if (isNestedLocale) return 'index.html';
        return locale + '/index.html';
    }

    function applyHome(html) {
        var projectHref = isNestedLocale ? 'project-work.html' : 'ru/project-work.html';
        var contactHref = isProjectWork ? '#cta' : homeHref() + '#cta';
        return html.split('{{HOME}}').join(homeHref())
            .split('{{PROJECT_WORK}}').join(projectHref)
            .split('{{CONTACT}}').join(contactHref);
    }

    function loadInto(containerId, relativePath, fallbackHtml) {
        var container = document.getElementById(containerId);
        if (!container) return Promise.resolve(false);

        return fetch(basePrefix + relativePath)
            .then(function(response) {
                if (!response.ok) throw new Error('Failed to load ' + relativePath);
                return response.text();
            })
            .then(function(html) {
                container.innerHTML = applyHome(html);
                return true;
            })
            .catch(function(error) {
                console.error('Error loading component:', error);
                if (fallbackHtml) container.innerHTML = fallbackHtml;
                return false;
            });
    }

    var navPath = 'components/nav-' + locale + '.html';
    var footerPath = 'components/footer-' + locale + '.html';

    var navFallback = '<nav class="fixed top-0 left-0 right-0 bg-white/90 backdrop-blur-md z-50 border-b border-gray-100"><div class="max-w-6xl mx-auto px-4 sm:px-6 py-3 sm:py-4"><a href="' + homeHref() + '" class="text-lg sm:text-xl font-bold text-gray-900">Polina Tsoy</a></div></nav>';

    var footerCopy = {
        ru: '© 2026 Polina Tsoy. Всё продумано.',
        en: '© 2026 Polina Tsoy. Designed with intent.',
        es: '© 2026 Polina Tsoy. Diseño con intención.'
    };
    var footerFallback = '<footer class="py-12 bg-gray-900 text-gray-400"><div class="max-w-6xl mx-auto px-6 text-center"><p>' + footerCopy[locale] + '</p></div></footer>';

    loadInto('nav-container', navPath, navFallback).then(function() {
        if (isProjectWork) {
            var nav = document.getElementById('nav-container');
            var languageSwitch = nav && nav.querySelector('[data-lang-dropdown]');
            // This page currently exists only in Russian; do not imply translations.
            if (languageSwitch) languageSwitch.remove();
            var projectLink = nav && nav.querySelector('[data-project-work-link]');
            if (projectLink) projectLink.setAttribute('aria-current', 'page');
        }
        if (typeof window.initPortfolioLangSwitch === 'function') {
            window.initPortfolioLangSwitch();
        }
    });

    loadInto('footer-container', footerPath, footerFallback);
});

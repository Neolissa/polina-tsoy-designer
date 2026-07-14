// Load shared nav/footer components
document.addEventListener('DOMContentLoaded', function() {
    var isEn = window.location.pathname.indexOf('/en/') !== -1;
    var isNestedLocale = window.location.pathname.indexOf('/en/') !== -1
        || window.location.pathname.indexOf('/ru/') !== -1;
    var basePrefix = isNestedLocale ? '../' : '';

    function homeHref() {
        if (isNestedLocale) return 'index.html';
        return isEn ? 'en/index.html' : 'ru/index.html';
    }

    function applyHome(html) {
        return html.split('{{HOME}}').join(homeHref());
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

    var navPath = isEn ? 'components/nav-en.html' : 'components/nav-ru.html';
    var footerPath = isEn ? 'components/footer-en.html' : 'components/footer-ru.html';

    var navFallback = '<nav class="fixed top-0 left-0 right-0 bg-white/90 backdrop-blur-md z-50 border-b border-gray-100"><div class="max-w-6xl mx-auto px-4 sm:px-6 py-3 sm:py-4"><a href="' + homeHref() + '" class="text-lg sm:text-xl font-bold text-gray-900">Polina Tsoy</a></div></nav>';

    var footerFallback = isEn
        ? '<footer class="py-12 bg-gray-900 text-gray-400"><div class="max-w-6xl mx-auto px-6 text-center"><p>© 2026 Polina Tsoy. Designed with intent.</p></div></footer>'
        : '<footer class="py-12 bg-gray-900 text-gray-400"><div class="max-w-6xl mx-auto px-6 text-center"><p>© 2026 Polina Tsoy. Всё продумано.</p></div></footer>';

    loadInto('nav-container', navPath, navFallback).then(function() {
        if (typeof window.initPortfolioLangSwitch === 'function') {
            window.initPortfolioLangSwitch();
        }
    });

    loadInto('footer-container', footerPath, footerFallback);
});

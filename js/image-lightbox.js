/**
 * Лайтбокс для изображений: клик по элементу с data-lightbox (обычно <img>).
 * Требует в документе #image-lightbox-overlay с <img> внутри.
 */
(function () {
    function getOverlay() {
        return document.getElementById('image-lightbox-overlay');
    }

    function openLightbox(src, alt) {
        var overlay = getOverlay();
        if (!overlay) return;
        var img = overlay.querySelector('img');
        if (!img) return;
        img.src = src;
        img.alt = alt || '';
        overlay.classList.remove('hidden');
        overlay.setAttribute('aria-hidden', 'false');
        document.body.style.overflow = 'hidden';
    }

    function closeLightbox() {
        var overlay = getOverlay();
        if (!overlay) return;
        overlay.classList.add('hidden');
        overlay.setAttribute('aria-hidden', 'true');
        document.body.style.overflow = '';
    }

    document.addEventListener('DOMContentLoaded', function () {
        document.querySelectorAll('img[data-lightbox]').forEach(function (el) {
            el.classList.add('cursor-zoom-in');
            var label = el.alt ? 'Увеличить: ' + el.alt : 'Увеличить изображение';
            el.addEventListener('click', function () {
                openLightbox(el.currentSrc || el.src, el.alt);
            });
            el.addEventListener('keydown', function (e) {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    openLightbox(el.currentSrc || el.src, el.alt);
                }
            });
            el.setAttribute('tabindex', '0');
            el.setAttribute('role', 'button');
            el.setAttribute('aria-label', label);
        });

        var overlay = getOverlay();
        if (!overlay) return;

        overlay.addEventListener('click', function (e) {
            if (e.target === overlay || e.target.closest('[data-lightbox-close]')) {
                closeLightbox();
            }
        });

        document.addEventListener('keydown', function (e) {
            if (e.key === 'Escape' && !overlay.classList.contains('hidden')) {
                closeLightbox();
            }
        });
    });
})();

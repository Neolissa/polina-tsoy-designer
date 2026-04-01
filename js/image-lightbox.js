/**
 * Image lightbox: click an element with data-lightbox (usually <img>).
 * Requires #image-lightbox-overlay with nested <img>.
 */
(function () {
    function ensureOverlay() {
        var overlay = document.getElementById('image-lightbox-overlay');
        if (overlay) return overlay;

        overlay = document.createElement('div');
        overlay.id = 'image-lightbox-overlay';
        overlay.className = 'fixed inset-0 z-[200] hidden bg-black/85 flex items-center justify-center p-4';
        overlay.setAttribute('role', 'dialog');
        overlay.setAttribute('aria-modal', 'true');
        overlay.setAttribute('aria-hidden', 'true');
        overlay.innerHTML =
            '<button type="button" data-lightbox-close class="absolute top-4 right-4 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-2xl text-white hover:bg-white/20" aria-label="Close">×</button>' +
            '<img src="" alt="" class="max-h-[min(90vh,920px)] max-w-full w-auto rounded-lg shadow-2xl" width="1200" height="800">';
        document.body.appendChild(overlay);
        return overlay;
    }

    function getOverlay() {
        return ensureOverlay();
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
        var isEn = window.location.pathname.indexOf('/en/') !== -1;
        document.querySelectorAll('img[data-lightbox]').forEach(function (el) {
            el.classList.add('cursor-zoom-in');
            var label = isEn
                ? (el.alt ? 'Zoom: ' + el.alt : 'Zoom image')
                : (el.alt ? 'Увеличить: ' + el.alt : 'Увеличить изображение');
            el.addEventListener('click', function (e) {
                e.preventDefault();
                e.stopPropagation();
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

<script>
    // Load footer component
    document.addEventListener('DOMContentLoaded', function() {
        var footerContainer = document.getElementById('footer-container');
        
        if (footerContainer) {
            var isEn = window.location.pathname.indexOf('/en/') !== -1;
            var isNestedLocale = window.location.pathname.indexOf('/en/') !== -1 || window.location.pathname.indexOf('/ru/') !== -1;
            var basePrefix = isNestedLocale ? '../' : '';
            var footerPath = isEn ? 'components/footer-en.html' : 'components/footer-ru.html';

            // Fetch localized footer component
            fetch(basePrefix + footerPath)
                .then(function(response) {
                    if (!response.ok) {
                        throw new Error('Failed to load footer component');
                    }
                    return response.text();
                })
                .then(function(html) {
                    // Insert the footer HTML into the container
                    footerContainer.innerHTML = html;
                })
                .catch(function(error) {
                    console.error('Error loading footer component:', error);
                    // Fallback: show a simple localized footer if loading fails
                    footerContainer.innerHTML = isEn
                        ? '<footer class="py-12 bg-gray-900 text-gray-400"><div class="max-w-6xl mx-auto px-6 text-center"><p>© 2026 Polina Tsoy. Designed with intent.</p></div></footer>'
                        : '<footer class="py-12 bg-gray-900 text-gray-400"><div class="max-w-6xl mx-auto px-6 text-center"><p>© 2026 Polina Tsoy. Всё продумано.</p></div></footer>';
                });
        }
    });
</script>
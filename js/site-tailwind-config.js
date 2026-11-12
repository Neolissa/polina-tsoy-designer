/* One Tailwind extension for every public content page.
   This file must follow the local Play CDN runtime and precede page markup. */
(function configurePortfolioTailwind() {
    if (!window.tailwind) return;

    window.tailwind.config = {
        theme: {
            extend: {
                colors: {
                    primary: 'var(--text-strong)',
                    secondary: 'var(--text-muted)',
                    accent: 'var(--accent)',
                    indigo: {
                        50: 'var(--surface-accent)',
                        100: 'var(--surface-accent-strong)',
                        200: 'var(--accent-pale)',
                        300: 'var(--accent-muted)',
                        400: 'var(--accent-border)',
                        500: 'var(--accent)',
                        600: 'var(--accent-link)',
                        700: 'var(--accent-strong)'
                    },
                    'site-ink': 'var(--text-primary)',
                    'site-page': 'var(--surface-page)'
                },
                fontFamily: {
                    sans: ['var(--font-sans)']
                },
                fontSize: {
                    xs: ['var(--font-size-xs)', { lineHeight: '1rem' }],
                    sm: ['var(--type-supporting-size)', { lineHeight: '1.25rem' }],
                    base: ['var(--type-body-size)', { lineHeight: '1.5rem' }],
                    lg: ['var(--font-size-lg)', { lineHeight: '1.75rem' }],
                    xl: ['var(--font-size-xl)', { lineHeight: '1.75rem' }],
                    '2xl': ['var(--font-size-2xl)', { lineHeight: '2rem' }],
                    '3xl': ['var(--type-section-size)', { lineHeight: '2.25rem' }],
                    '4xl': ['var(--type-section-size-wide)', { lineHeight: '2.5rem' }],
                    '5xl': ['var(--type-title-size)', { lineHeight: '1' }],
                    '6xl': ['var(--font-size-6xl)', { lineHeight: '1' }],
                    '7xl': ['var(--type-title-size-wide)', { lineHeight: '1' }]
                },
                maxWidth: {
                    '6xl': 'var(--layout-page-max)',
                    '3xl': 'var(--layout-reading-max)'
                },
                spacing: {
                    1: 'var(--space-1)',
                    2: 'var(--space-2)',
                    3: 'var(--space-3)',
                    4: 'var(--space-4)',
                    5: 'var(--space-5)',
                    6: 'var(--space-6)',
                    7: 'var(--space-7)',
                    8: 'var(--space-8)',
                    10: 'var(--space-10)',
                    12: 'var(--space-12)',
                    16: 'var(--space-16)',
                    20: 'var(--space-20)',
                    24: 'var(--space-24)',
                    28: 'var(--space-28)',
                    'site-gutter': 'var(--space-page-gutter)',
                    'site-panel': 'var(--space-panel-inset)',
                    'site-section': 'var(--space-section)'
                },
                borderRadius: {
                    lg: 'var(--radius-sm)',
                    '2xl': 'var(--radius-card)',
                    '3xl': 'var(--radius-media)',
                    full: 'var(--radius-pill)',
                    'site-card': 'var(--radius-card)',
                    'site-media': 'var(--radius-media)',
                    'site-pill': 'var(--radius-pill)'
                },
                backgroundImage: {
                    'site-hero': 'var(--gradient-hero)'
                },
                boxShadow: {
                    'site-card-hover': 'var(--shadow-card-hover)',
                    'site-accent-hover': 'var(--shadow-accent-hover)'
                }
            }
        }
    };
}());

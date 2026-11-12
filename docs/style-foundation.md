# Public portfolio style foundation

The public portfolio uses one small style foundation instead of per-locale Tailwind configuration.

## Dependency order

`css/site-tokens.css` defines primitive values, semantic roles, and shared component rules. `js/site-tailwind-config.js` maps the same semantic roles into the local Tailwind Play CDN configuration. Every tracked public content page loads that script immediately after the local runtime.

## Real consumers

- `--font-sans`, `--text-primary`, and `--surface-page` → `font-sans text-site-ink bg-site-page` on the 17 public page `<body>` elements. This also gives Spanish pages the same Inter role as Russian and English pages.
- `--gradient-hero` → `bg-site-hero` on the shared two-stop case heroes.
- `--accent`, `--focus-ring`, and `--border-subtle` → `.nav-link`, localized language controls, DocsBird process steps, and WUW architecture steps.
- `--space-panel-inset`, `--space-panel-compact`, and `--space-panel-spacious` → `.site-panel` and its compact/spacious variants on real content cards. Padding variants retain the approved 20/24/28px values.
- `--radius-card`, `--surface-raised`, and `--border-subtle` → the shared `.site-panel` anatomy. Existing `rounded-2xl` utilities also consume the same radius through Tailwind.
- `--layout-page-max`, `--space-page-gutter` → `.site-container`; `--layout-reading-max` → existing `max-w-3xl` readable columns.
- `--space-section` / `--space-section-wide` → `.site-section`, retaining the existing 80/96px rhythm at the 768px breakpoint.
- `--font-size-*` primitives and `--type-*` roles → the shared Tailwind type scale. Existing headings, body and supporting copy use the same source; individual purposeful size variants remain supported.
- `--space-*` primitives → the existing Tailwind spacing scale, so ordinary gaps and utility-based layout also respond to the shared source.
- `--shadow-card-hover` and `--shadow-accent-hover` → `.card-hover` and `.btn-primary`.

Use a case-specific CSS file or a local documented variant for demo-brand colors. Do not remap Coin, TVIP, or DocsBird product-demo palettes into the portfolio palette.

## Preservation rule

The semantic aliases retain the approved values. The `--gradient-hero` token is only the existing two-stop portfolio hero gradient; intentionally different three-stop Coin/TVIP hero gradients and the Russian/English DocsBird hero variants remain local.

The six privacy/404 HTML sources and unpublished story pages are outside this migration. Tailwind neutral utilities remain a valid primitive palette; do not force product-demo colors into semantic site roles. Shared cards and layout roles use explicit hooks rather than broad overrides of every `div` or every white surface.

## Regression checks

Shared CSS and Tailwind configuration URLs carry the same content fingerprint: the first 12 hexadecimal characters of SHA-256 over `site-tokens.css` bytes followed by `site-tailwind-config.js` bytes. After changing either asset, update both `?v=` references on all 17 content pages. This prevents an existing browser cache from mixing old token definitions with a new configuration. Run `python scripts/check-style-cache.py`; it reports the required fingerprint if the references are stale. For the browser regression, add `--legacy-css PATH` pointing at an immutable pre-migration stylesheet: the test replays that response only at the obsolete unversioned URL and requires the new page to remain correctly styled.

`python scripts/check-design-foundation.py` exercises all 17 public content routes at 1366, 768 and 390px. It checks rendering, Inter, loaded images, overflow, and shared-token propagation. The propagation test changes the loaded `:root` rule in an isolated localhost browser, checks real consumers on multiple pages, and restores the original values; it never writes source files or production state.

For a migration comparison, supply `--reference-dir` with a pre-edit source snapshot and `--compare` with a prior computed-style capture. The checker additionally asserts unchanged editorial copy, links, media and metadata, unchanged auxiliary HTML, and matching layout/computed styles. The Spanish font correction is the explicit exception. Use `--screenshots` for focused DocsBird visual evidence. This is a focused regression check, not full accessibility certification or visual approval.

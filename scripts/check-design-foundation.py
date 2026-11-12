#!/usr/bin/env python3
"""Focused portfolio style regression checks; not a full visual/accessibility audit.

Requires the same Python Playwright installation as check-portfolio-preview.py.
Use --reference-dir for a pre-edit source snapshot and --capture to save computed
styles. --compare reads an earlier capture. Never changes source or production.
"""
import argparse
import json
from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import urlparse

LOCALES = ('ru', 'en', 'es')
PAGES = [f'{locale}/{name}.html' for locale in LOCALES
         for name in ('index', 'docsbird', 'relaunch', 'wuw', 'tvip')]
PAGES += ['ru/project-work.html', 'en/project-work.html']
ROOT = Path(__file__).resolve().parents[1]
PROPERTIES = ['fontFamily', 'fontSize', 'fontWeight', 'lineHeight', 'color',
              'backgroundColor', 'backgroundImage', 'borderRadius',
              'paddingTop', 'paddingRight', 'paddingBottom', 'paddingLeft',
              'gap', 'maxWidth']


class Content(HTMLParser):
    """Exclude style/config implementation, preserve editorial and media data."""
    def __init__(self, source):
        super().__init__(convert_charrefs=True)
        self.hidden = 0
        self.copy = []
        self.references = []
        self.feed(source)

    def handle_starttag(self, tag, attrs):
        if tag in ('script', 'style'):
            self.hidden += 1
        if tag in ('a', 'img', 'video', 'source', 'track', 'meta'):
            self.references.append((tag, [(k, v) for k, v in attrs
                                         if k not in ('class', 'style')]))

    def handle_endtag(self, tag):
        if tag in ('script', 'style'):
            self.hidden -= 1

    def handle_data(self, data):
        if not self.hidden and data.strip():
            self.copy.append(' '.join(data.split()))


def check_content(reference):
    for route in PAGES:
        old = Content((reference / route).read_text(encoding='utf-8'))
        new = Content((ROOT / route).read_text(encoding='utf-8'))
        assert old.copy == new.copy, f'{route}: editorial content changed'
        assert old.references == new.references, f'{route}: media/link/metadata changed'
    for locale in LOCALES:
        for name in ('privacy', '404'):
            route = f'{locale}/{name}.html'
            assert (reference / route).read_bytes() == (ROOT / route).read_bytes(), route
    print('PASS source preservation: copy, media, links, metadata; auxiliary HTML unchanged')


def check_token_propagation(page):
    """Mutate the loaded source rule in an isolated browser, then restore it.

    No inline per-instance overrides and no source-file or production writes.
    Multiple pages prove that these are real shared consumers, not test fixtures.
    """
    return page.evaluate('''() => {
        const sheet = [...document.styleSheets].find(s=>s.href?.includes('site-tokens.css'));
        const root = [...sheet.cssRules].find(r=>r.selectorText===':root');
        const probes = [
            ['--font-sans','body','fontFamily','Georgia, serif'],
            ['--text-primary','body','color','rgb(5, 30, 60)'],
            ['--accent','.nav-link','backgroundColor','rgb(5, 30, 60)','::after'],
            ['--accent-link','.text-indigo-600','color','rgb(5, 30, 60)'],
            ['--layout-page-max','.site-container','maxWidth','1100px'],
            ['--space-page-gutter','.site-container','paddingLeft','37px'],
            ['--type-section-size-wide','h2[class~="md:text-4xl"]','fontSize','41px'],
            ['--type-title-size-wide','h1[class~="md:text-7xl"],h1[class~="lg:text-7xl"]','fontSize','76px'],
            ['--space-panel-inset','.site-panel:not(.site-panel--compact):not(.site-panel--spacious),.process-step,.case-card','paddingLeft','37px'],
            ['--radius-card','.site-panel','borderTopLeftRadius','23px'],
            ['--surface-raised','.site-panel','backgroundColor','rgb(230, 240, 250)'],
            ['--border-subtle','.site-panel','borderTopColor','rgb(5, 30, 60)']
        ];
        const completed=[];
        const still=document.createElement('style');
        still.textContent='*,*::before,*::after{transition:none!important}';
        document.head.append(still);
        try {
        for (const [token,selector,prop,value,pseudo] of probes) {
          for (const element of document.querySelectorAll(selector)) {
            const original=root.style.getPropertyValue(token);
            const before=getComputedStyle(element,pseudo)[prop];
            let changed;
            try {
                root.style.setProperty(token,value);
                changed=getComputedStyle(element,pseudo)[prop];
            } finally {
                root.style.setProperty(token,original);
            }
            if(changed!==value) throw new Error(`${token} -> ${selector}.${prop}: expected ${value}, got ${changed}`);
            if(getComputedStyle(element,pseudo)[prop]!==before) throw new Error(`Restoration failed: ${token}`);
            completed.push(token);
          }
        }
        } finally { still.remove(); }
        return completed;
    }''')


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--base-url', default='http://localhost:8765/')
    parser.add_argument('--reference-dir', type=Path)
    parser.add_argument('--baseline', action='store_true', help='Serve original HTML/CSS from reference-dir in this isolated browser only')
    parser.add_argument('--capture', type=Path)
    parser.add_argument('--compare', type=Path)
    parser.add_argument('--screenshots', type=Path)
    parser.add_argument('--widths', type=int, nargs='+', default=[1366, 768, 390])
    args = parser.parse_args()
    assert urlparse(args.base_url).hostname in ('localhost', '127.0.0.1'), 'Loopback preview only'
    if args.baseline:
        assert args.reference_dir, '--baseline requires --reference-dir'
    elif args.reference_dir:
        check_content(args.reference_dir)
    previous = json.loads(args.compare.read_text(encoding='utf-8')) if args.compare else {}
    results = {}
    failures = []
    propagation = {}
    from playwright.sync_api import sync_playwright

    with sync_playwright() as pw:
        browser = pw.chromium.launch(channel='chrome')
        try:
            for route in PAGES:
                for width in args.widths:
                    context = browser.new_context(viewport={'width': width, 'height': 900}, reduced_motion='reduce')
                    context.add_init_script('localStorage.setItem("portfolioConsentState", "rejected")')
                    if args.baseline:
                        def original(request):
                            relative = urlparse(request.request.url).path.lstrip('/')
                            path = args.reference_dir / relative
                            if path.is_file():
                                request.fulfill(status=200, content_type='text/css' if relative.endswith('.css') else 'text/html', body=path.read_bytes())
                            else:
                                request.continue_()
                        context.route(args.base_url.rstrip('/') + '/**', original)
                    page = context.new_page()
                    errors = []
                    page.on('pageerror', lambda error: errors.append(str(error)))
                    try:
                        response = page.goto(args.base_url.rstrip('/') + '/' + route, wait_until='domcontentloaded')
                        assert response and response.status == 200, 'Page HTTP status'
                        count = 2 if route.endswith('project-work.html') else 3
                        page.wait_for_function('(n)=>document.querySelectorAll("[data-lang-switch]").length===n', arg=count)
                        # The optional Google stylesheet loads asynchronously: an early
                        # fonts.ready can resolve before Inter is even registered.
                        page.wait_for_function('[...document.fonts].some(f=>f.family.includes("Inter"))')
                        page.evaluate('''async()=>{
                            await Promise.all([400,500,600,700].map(w=>document.fonts.load(`${w} 16px Inter`, 'Portfolio Пример Español')));
                            await document.fonts.ready;
                        }''')
                        page.evaluate('''async()=>{
                            document.documentElement.style.scrollBehavior='auto';
                            for(let y=0;y<document.documentElement.scrollHeight;y+=650){
                                scrollTo(0,y); await new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r)));
                            }
                        }''')
                        page.wait_for_function('''[...document.images].filter(i=>i.getAttribute('src')).every(i=>i.complete)''')
                        page.wait_for_timeout(800)
                        assert not errors, errors
                        assert page.evaluate('document.documentElement.scrollWidth<=innerWidth'), 'Horizontal overflow'
                        broken = page.evaluate('''[...document.images].filter(i=>i.getAttribute('src')&&!i.naturalWidth).map(i=>i.src)''')
                        assert not broken, broken
                        state = page.evaluate('''props=>({
                            tokens: !![...document.styleSheets].find(s=>s.href?.includes('site-tokens.css')),
                            elements: [...document.querySelectorAll('h1,h2,section[id],article')].map(e=>{
                                const s=getComputedStyle(e),r=e.getBoundingClientRect();
                                return {tag:e.tagName,id:e.id,style:Object.fromEntries(props.map(p=>[p,s[p]])),
                                    box:{x:r.x,width:r.width,height:r.height}};
                            })
                        })''', PROPERTIES)
                        assert state['tokens'], 'Shared stylesheet not loaded'
                        if not args.baseline:
                            assert 'Inter' in page.evaluate('getComputedStyle(document.body).fontFamily'), 'Shared font missing'
                            if width == max(args.widths):
                                for token in check_token_propagation(page):
                                    propagation.setdefault(token, []).append(route)
                        key = f'{route}@{width}'
                        results[key] = state
                        if key in previous:
                            old = previous[key]['elements']
                            assert len(old) == len(state['elements']), 'Changed structural element count'
                            for before, after in zip(old, state['elements']):
                                assert (before['tag'], before['id']) == (after['tag'], after['id']), 'Changed reading structure'
                                for prop in PROPERTIES:
                                    # ES intentionally gains Inter; text wrapping can change its geometry.
                                    if route.startswith('es/') and prop == 'fontFamily':
                                        continue
                                    assert before['style'][prop] == after['style'][prop], f"{after['tag']}#{after['id']} {prop}: {before['style'][prop]} -> {after['style'][prop]}"
                                if not route.startswith('es/'):
                                    for prop in ('x', 'width', 'height'):
                                        assert abs(before['box'][prop] - after['box'][prop]) <= 1, f"{after['tag']}#{after['id']} box.{prop} drift"
                        if args.screenshots and route == 'ru/docsbird.html':
                            args.screenshots.mkdir(parents=True, exist_ok=True)
                            for name, selector in [('context', '#context'), ('ai', 'article[aria-labelledby="ai-work-title"]')]:
                                loc = page.locator(selector)
                                loc.scroll_into_view_if_needed()
                                loc.screenshot(path=str(args.screenshots / f'docsbird-{name}-{width}.png'))
                        print(f'PASS {key}', flush=True)
                    except Exception as error:
                        failures.append(f'{route}@{width}: {error}')
                        print('FAIL ' + failures[-1], flush=True)
                    finally:
                        context.close()
        finally:
            browser.close()
    if args.capture:
        args.capture.parent.mkdir(parents=True, exist_ok=True)
        args.capture.write_text(json.dumps(results, ensure_ascii=False, indent=2), encoding='utf-8')
    if not args.baseline:
        required = ['--font-sans', '--text-primary', '--accent', '--layout-page-max',
                    '--space-page-gutter', '--space-panel-inset', '--radius-card',
                    '--surface-raised', '--border-subtle', '--type-section-size-wide',
                    '--type-title-size-wide', '--accent-link']
        for token in required:
            routes = propagation.get(token, [])
            if len(routes) < 2:
                failures.append(f'{token}: expected at least two real consumers, got {routes}')
        print('Token propagation and restoration:', json.dumps({
            token: {'instances': len(routes), 'pages': len(set(routes))}
            for token, routes in propagation.items()
        }))
    print(f'Checked {len(PAGES) * len(args.widths)} route/viewports; failures: {len(failures)}')
    for error in failures:
        print(error)
    raise SystemExit(bool(failures))


if __name__ == '__main__':
    main()

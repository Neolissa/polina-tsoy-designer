#!/usr/bin/env python3
"""Read-only smoke checks for the local portfolio preview (not visual approval)."""
from html.parser import HTMLParser
import argparse
import asyncio
import re
import sys
from urllib.parse import parse_qs, urlparse, unquote, urljoin


def source_errors(html):
    """Catch known copy/truncation damage before HTML parser error recovery hides it."""
    errors = []
    if re.search(r'\bclass\s*\.\.\.|\[truncated\]', html, re.I):
        errors.append('source: truncated markup marker')

    class LinkBoundaryParser(HTMLParser):
        in_link = False

        def handle_starttag(self, tag, attrs):
            if tag == 'a':
                self.in_link = True
            elif tag in ('section', 'main', 'footer') and self.in_link:
                errors.append(f'source: {tag} nested inside a link')

        def handle_endtag(self, tag):
            if tag == 'a':
                self.in_link = False

    LinkBoundaryParser().feed(html)
    return errors


async def check_page(browser, url, width=1440, timeout_ms=10000):
    """Inspect one isolated browser session; only GETs and local lightbox clicks."""
    from playwright.async_api import Error, TimeoutError as BrowserTimeout

    context = await browser.new_context(viewport={'width': width, 'height': 900 if width > 600 else 844})
    page = await context.new_page()
    page.set_default_timeout(timeout_ms)
    errors = []
    page.on('pageerror', lambda error: errors.append('javascript: ' + str(error)))
    parsed = urlparse(url)
    route = parsed.path
    slug = route.rsplit('/', 1)[-1] or 'index.html'
    locale = re.search(r'/(ru|en|es)/', route)

    async def ready(expression, label):
        try:
            await page.wait_for_function(expression, timeout=timeout_ms)
            return True
        except BrowserTimeout:
            errors.append(label + ': readiness timeout')
            return False

    try:
        response = await page.goto(url, wait_until='domcontentloaded', timeout=timeout_ms)
        if response is None or response.status != 200:
            errors.append(f'http: expected 200, got {response.status if response else "no response"}')
            return errors
        errors.extend(source_errors(await response.text()))
        if urlparse(page.url).path != route:
            errors.append('navigation: unexpected redirect to ' + page.url)
        await ready('document.querySelectorAll("[data-lang-switch]").length === 3', 'language')
        # IntersectionObserver/lazy media require real scroll, not a full-page screenshot.
        await page.evaluate('''async () => {
            document.documentElement.style.scrollBehavior = 'auto';
            const end = Math.min(document.documentElement.scrollHeight, 60000);
            for (let y=0; y<end; y+=600) {
                scrollTo(0,y);
                await new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r)));
            }
        }''')
        await ready('''[...document.images].filter(i=>i.getAttribute('src') || i.getAttribute('srcset')).every(i=>i.complete)''', 'image')
        await ready('''[...document.querySelectorAll('video')].every(v=>v.error || v.readyState >= 1)''', 'video')
        state = await page.evaluate('''() => ({
            headings:[...document.querySelectorAll('h1')].map(e=>({text:e.textContent.trim(),visible:e.getBoundingClientRect().height>0 && getComputedStyle(e).visibility!=='hidden' && getComputedStyle(e).opacity!=='0'})),
            cta:[...document.querySelectorAll('#cta')].map(e=>({linked:!!e.closest('a'),action:!!e.querySelector('a[href],button'),visible:e.getBoundingClientRect().height>0 && getComputedStyle(e).display!=='none'})),
            nested:document.querySelectorAll('a section,a main,a footer').length,
            overflow:document.documentElement.scrollWidth>innerWidth,
            broken:[...document.images].filter(i=>(i.getAttribute('src')||i.getAttribute('srcset')) && !i.naturalWidth).map(i=>i.currentSrc||i.src),
            video:[...document.querySelectorAll('video')].filter(v=>v.error).map(v=>v.currentSrc+': '+v.error.message),
            langs:[...document.querySelectorAll('[data-lang-switch]')].map(a=>({lang:a.dataset.langSwitch,href:a.href,active:a.getAttribute('aria-current')})),
            hero:document.querySelector('#docsbird-hero-visual')?.currentSrc
        })''')
        if len(state['headings']) != 1 or not all(h['text'] and h['visible'] for h in state['headings']):
            errors.append('heading: expected one nonempty visible H1')
        if len(state['cta']) != 1 or not all(c['action'] and c['visible'] and not c['linked'] for c in state['cta']):
            errors.append('cta: expected one visible contact section with an action, outside links')
        if state['nested']:
            errors.append('structure: a section is nested inside a link')
        if state['overflow']:
            errors.append('overflow: horizontal document overflow')
        errors.extend('image: failed to load ' + src for src in state['broken'])
        errors.extend('video: ' + text for text in state['video'])
        if locale:
            prefix = route[:locale.start()]
            if sorted(a['lang'] for a in state['langs']) != ['en','es','ru']:
                errors.append('language: expected RU/EN/ES links exactly once')
            for link in state['langs']:
                target = urlparse(link['href'])
                expected = prefix + '/' + link['lang'] + '/' + slug
                if target.netloc != parsed.netloc or target.scheme != parsed.scheme or target.path != expected:
                    errors.append('language: wrong equivalent page ' + link['href'])
                    continue
                if (link['active'] == 'page') != (link['lang'] == locale[1]):
                    errors.append('language: incorrect active locale')
                result = await context.request.get(link['href'], timeout=timeout_ms)
                if result.status != 200 or urlparse(result.url).path != expected:
                    errors.append('language: destination unavailable ' + link['href'])
                await result.dispose()
        if slug == 'docsbird.html' and locale and locale[1] in ('en','ru'):
            variant = parse_qs(parsed.query).get('hero',['a'])[0]
            expected = 'docsbird-hero-visual-4.jpg' if variant in ('b','4') else 'docsbird-hero-visual.jpg'
            # Localized text overlays use lossless PNG; the A/B identity stays the same.
            allowed = (expected, expected.replace('.jpg', '.png'))
            if not state['hero'] or unquote(urlparse(state['hero']).path).rsplit('/',1)[-1] not in allowed:
                errors.append('hero: incorrect DocsBird A/B asset, expected ' + expected)
        if slug == 'relaunch.html':
            # Prefer the transparent growth asset; fixture/future pages may use another asset.
            images = page.locator('img[data-lightbox][src*="personal"]')
            if not await images.count():
                images = page.locator('img[data-lightbox]')
            if not await images.count():
                errors.append('lightbox: no evidence image found')
            else:
                await images.first.scroll_into_view_if_needed()
                await images.first.click()
                overlay = page.locator('#image-lightbox-overlay')
                await overlay.wait_for(state='visible')
                await ready('''(()=>{const i=document.querySelector('#image-lightbox-overlay img');return i && i.complete && i.naturalWidth>0})()''', 'lightbox image')
                view = await overlay.evaluate('''e=>{
                    const i=e.querySelector('img'),b=e.querySelector('[data-lightbox-close]');
                    const r=b?.getBoundingClientRect();
                    return {bg:getComputedStyle(i).backgroundColor,close:!!r && r.width>0 && r.height>0 && r.left>=0 && r.top>=0 && r.right<=innerWidth && r.bottom<=innerHeight};
                }''')
                channels = [float(v) for v in re.findall(r'[\d.]+', view['bg'])]
                if len(channels) < 3 or min(channels[:3]) < 200 or (len(channels)>3 and channels[3]<0.99):
                    errors.append('lightbox: expected opaque light image background')
                if not view['close']:
                    errors.append('lightbox: close button outside viewport or hidden')
                await page.keyboard.press('Escape')
                try:
                    await overlay.wait_for(state='hidden')
                except BrowserTimeout:
                    errors.append('lightbox: Escape did not close overlay')
    except Error as error:
        errors.append('browser: ' + str(error).split('Call log:')[0].strip())
    finally:
        await context.close()
    return list(dict.fromkeys(errors))


def page_urls(base_url, pages):
    """Keep explicit preview checks on a loopback origin, preserving a Pages subpath."""
    base = urlparse(base_url)
    if (base.scheme not in ('http','https') or base.hostname not in ('localhost','127.0.0.1','::1')
            or base.username or base.password or base.query or base.fragment):
        raise ValueError('base-url must be an HTTP(S) loopback URL without credentials, query or fragment')
    urls = []
    for route in pages:
        parsed = urlparse(route)
        if (parsed.scheme or parsed.netloc or route.startswith('/') or '\\' in route
                or '..' in unquote(parsed.path).split('/') or parsed.fragment):
            raise ValueError('pages must be relative paths below base-url (no traversal or external URLs)')
        urls.append(urljoin(base_url.rstrip('/')+'/', route))
    return urls


async def run(args, urls):
    from playwright.async_api import async_playwright

    failures = 0
    async with async_playwright() as playwright:
        options = {} if args.browser == 'chromium' else {'channel': args.browser}
        browser = await playwright.chromium.launch(**options)
        try:
            for url in urls:
                for width in args.widths:
                    errors = await check_page(browser, url, width, args.timeout_ms)
                    print(f'{"FAIL" if errors else "PASS"} {width}px {url}', flush=True)
                    for error in errors:
                        print('  - ' + error, flush=True)
                    failures += bool(errors)
        finally:
            await browser.close()
    total = len(urls) * len(args.widths)
    print(f'PREVIEW CHECK: {total - failures}/{total} passed. Not visual approval or a full site audit.')
    return 1 if failures else 0


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--base-url', default='http://localhost:8765/', help='Running loopback server, optionally with a project subpath')
    parser.add_argument('--pages', nargs='+', default=['en/','en/docsbird.html','en/docsbird.html?hero=a','en/docsbird.html?hero=b','en/docsbird.html?hero=4','en/relaunch.html','en/wuw.html','en/tvip.html'])
    parser.add_argument('--widths', nargs='+', type=int, default=[1440,390])
    parser.add_argument('--timeout-ms', type=int, default=15000, help='Maximum wait per navigation/readiness step')
    parser.add_argument('--browser', choices=['chromium','msedge','chrome'], default='chromium')
    args = parser.parse_args()
    if args.timeout_ms <= 0 or any(width <= 0 for width in args.widths):
        parser.error('widths and timeout-ms must be positive')
    try:
        urls = page_urls(args.base_url, args.pages)
    except ValueError as error:
        parser.error(str(error))
    try:
        return asyncio.run(run(args, urls))
    except ImportError:
        print('SETUP ERROR: install playwright in this Python environment; see scripts/preview-check.md', file=sys.stderr)
        return 2
    except Exception as error:
        print('SETUP/RUNTIME ERROR: ' + str(error), file=sys.stderr)
        return 2


if __name__ == '__main__':
    sys.exit(main())

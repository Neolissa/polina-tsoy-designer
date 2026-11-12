#!/usr/bin/env python3
"""Verify shared CSS/config cache identity and replay an optional legacy CSS response.

Pass --legacy-css with an immutable pre-migration site-tokens.css snapshot.
Only the obsolete unversioned URL is intercepted, as in a stale browser cache.
"""
import argparse
import hashlib
import importlib.util
from pathlib import Path
from urllib.parse import urlparse

ROOT = Path(__file__).resolve().parents[1]
spec = importlib.util.spec_from_file_location('foundation', ROOT / 'scripts/check-design-foundation.py')
foundation = importlib.util.module_from_spec(spec)
spec.loader.exec_module(foundation)


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--base-url', default='http://localhost:8765/')
    parser.add_argument('--legacy-css', type=Path)
    args = parser.parse_args()
    assert urlparse(args.base_url).hostname in ('localhost', '127.0.0.1'), 'Loopback only'
    if args.legacy_css:
        from playwright.sync_api import sync_playwright
        legacy = args.legacy_css.read_bytes()
        with sync_playwright() as pw:
            browser = pw.chromium.launch(channel='chrome')
            try:
                page = browser.new_page(viewport={'width': 1366, 'height': 900})
                page.route('**/css/site-tokens.css', lambda route: route.fulfill(
                    status=200, content_type='text/css', body=legacy))
                page.goto(args.base_url.rstrip('/') + '/ru/docsbird.html', wait_until='domcontentloaded')
                page.wait_for_function('document.querySelectorAll("[data-lang-switch]").length===3')
                state = page.evaluate('''()=>({
                    title:getComputedStyle(document.querySelector('h1')).fontSize,
                    font:getComputedStyle(document.body).fontFamily,
                    gutter:getComputedStyle(document.querySelector('.site-container')).paddingLeft
                })''')
                assert state['title'] == '72px' and state['gutter'] == '24px' and 'Inter' in state['font'], f'Stale CSS broke rendering: {state}'
                print('PASS legacy-cache replay: heading 72px, gutter 24px, Inter')
            finally:
                browser.close()
    assets = ['css/site-tokens.css', 'js/site-tailwind-config.js']
    revision = hashlib.sha256(b''.join((ROOT / p).read_bytes() for p in assets)).hexdigest()[:12]
    for route in foundation.PAGES:
        source = (ROOT / route).read_text(encoding='utf-8')
        for asset in assets:
            expected = f'../{asset}?v={revision}'
            assert f'"{expected}"' in source, f'{route}: expected versioned asset {expected}'
    print(f'PASS {len(foundation.PAGES)} pages use matching content fingerprint: {revision}')


if __name__ == '__main__':
    main()

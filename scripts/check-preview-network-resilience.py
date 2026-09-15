"""Read-only localhost regression: stalled fonts/CDN must not block the page.

Run against an already running preview:
  uv run --with playwright python scripts/check-preview-network-resilience.py
No form submissions or analytics consent changes. External font/CDN requests are
intentionally held until assertions finish; no synthetic CSS/JS is supplied.
"""
import argparse
from urllib.parse import urlparse
from playwright.sync_api import sync_playwright


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--base-url', default='http://localhost:8765/')
    parser.add_argument('--browser', default='msedge', choices=['msedge', 'chrome', 'chromium'])
    args = parser.parse_args()
    target = urlparse(args.base_url)
    if target.scheme not in ('http', 'https') or target.hostname not in ('localhost', '127.0.0.1', '::1') or target.username or target.password or target.query or target.fragment:
        parser.error('base-url must be a loopback URL without credentials/query/fragment')
    with sync_playwright() as p:
        opts = {} if args.browser == 'chromium' else {'channel': args.browser}
        browser = p.chromium.launch(headless=True, **opts)
        try:
            for route in ['ru/', 'en/', 'es/', 'en/docsbird.html', 'es/docsbird.html']:
                page = browser.new_page(viewport={'width': 1440, 'height': 950})
                held = []
                page.route('https://fonts.googleapis.com/**', lambda request: held.append(request))
                page.route('https://cdn.tailwindcss.com/**', lambda request: held.append(request))
                try:
                    page.goto(args.base_url.rstrip('/') + '/' + route, wait_until='domcontentloaded', timeout=10000)
                    page.locator('#nav-container a').first.wait_for(state='visible', timeout=5000)
                    page.wait_for_function("parseFloat(getComputedStyle(document.querySelector('h1')).fontSize) >= 36", timeout=5000)
                    assert page.locator('h1').is_visible()
                    print('PASS stalled third parties:', route)
                finally:
                    for request in held:
                        request.abort()
                    page.close()
        finally:
            browser.close()


if __name__ == '__main__':
    main()

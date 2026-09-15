#!/usr/bin/env python3
"""Regression tests for the portfolio checker; never edit real site pages."""
import importlib.util
from pathlib import Path
import unittest
import asyncio
import functools
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
import os
import tempfile
import threading
import sys


SVG = '<svg xmlns="http://www.w3.org/2000/svg" width="120" height="80"><rect width="120" height="80" fill="green"/></svg>'
STYLE = '<style>body{margin:0}h1{font-size:40px}img{max-width:100%}.hidden{display:none!important}#image-lightbox-overlay{position:fixed;inset:0;background:#222;display:flex;align-items:center;justify-content:center}#image-lightbox-overlay img{background:white;padding:12px}button{position:absolute;top:8px;right:8px}</style>'


def fixture(body='', script='', title='<h1>Portfolio</h1>', cta='<section id="cta"><a href="mailto:test@example.com">Contact</a></section>'):
    nav = ''.join(f'<a data-lang-switch="{lang}" href="/{lang}/index.html"'+(' aria-current="page"' if lang=='en' else '')+f'>{lang}</a>' for lang in ['ru','en','es'])
    return '<!doctype html><html lang="en"><head>'+STYLE+'</head><body><nav>'+nav+'</nav>'+title+body+cta+'<script>'+script+'</script></body></html>'


class QuietHandler(SimpleHTTPRequestHandler):
    def guess_type(self, path):
        # SVG fixtures deliberately use the production hero filenames.
        return 'image/svg+xml' if path.endswith(('.jpg', '.png')) else super().guess_type(path)

    def do_GET(self):
        if self.path == '/stream':
            self.send_response(200)
            self.send_header('Content-Type','text/plain')
            self.end_headers()
            self.wfile.flush()
            self.server.stop_stream.wait(10)
            return
        super().do_GET()

    def log_message(self, *args):
        pass


class BrowserTests(unittest.IsolatedAsyncioTestCase):
    async def asyncSetUp(self):
        self.checker = load_checker()
        if not hasattr(self.checker, 'check_page'):
            self.fail('Browser check_page has not been implemented')
        from playwright.async_api import async_playwright
        self.temp = tempfile.TemporaryDirectory(prefix='portfolio-fixtures-')
        self.root = Path(self.temp.name)
        for lang in ['ru','en','es']:
            (self.root/lang).mkdir()
            (self.root/lang/'index.html').write_text(fixture(), encoding='utf-8')
        (self.root/'ok.svg').write_text(SVG, encoding='utf-8')
        handler = functools.partial(QuietHandler, directory=self.temp.name)
        self.server = ThreadingHTTPServer(('127.0.0.1',0), handler)
        self.server.stop_stream = threading.Event()
        self.thread = threading.Thread(target=self.server.serve_forever, daemon=True)
        self.thread.start()
        self.base = f'http://127.0.0.1:{self.server.server_port}/'
        self.pw = await async_playwright().start()
        channel = os.environ.get('PORTFOLIO_BROWSER','chromium')
        self.browser = await self.pw.chromium.launch(**({} if channel=='chromium' else {'channel':channel}))

    async def asyncTearDown(self):
        if hasattr(self,'browser'):
            await self.browser.close()
            await self.pw.stop()
        if hasattr(self,'server'):
            self.server.stop_stream.set()
            await asyncio.to_thread(self.server.shutdown)
            self.server.server_close()
            self.thread.join()
        if hasattr(self,'temp'):
            self.temp.cleanup()

    async def check(self, html, route='en/index.html'):
        (self.root/route.split('?')[0]).write_text(html, encoding='utf-8')
        return await self.checker.check_page(self.browser, self.base+route, 390, 2000)

    async def test_real_browser_catches_regressions(self):
        self.assertEqual(await self.check(fixture('<img src="/ok.svg">')), [])
        cases = [
            (fixture(title=''), 'heading'),
            (fixture(title='<h1>A</h1><h1>B</h1>'), 'heading'),
            (fixture(cta=''), 'cta'),
            (fixture('<a href="#"><section>Broken boundary</section></a>'), 'source'),
            (fixture('<img src="/missing.svg">'), 'image'),
            (fixture('<video src="/missing.mp4" preload="metadata"></video>'), 'video'),
            (fixture('<div style="width:900px">Wide</div>'), 'overflow'),
            (fixture(script='throw new Error("fixture exception")'), 'javascript'),
            (fixture().replace('/es/index.html','/es/wrong.html'), 'language'),
        ]
        for html, expected in cases:
            with self.subTest(expected=expected):
                errors = await self.check(html)
                self.assertTrue(any(expected in e.lower() for e in errors), errors)

    async def test_delayed_media_does_not_require_network_idle(self):
        html = fixture('<img id="late" src="/ok.svg">', 'fetch("/stream");setTimeout(()=>document.querySelector("#late").src="/ok.svg?loaded",100)')
        self.assertEqual(await self.check(html), [])

    async def test_cli_reports_pass_and_failure(self):
        args = [sys.executable, str(SCRIPT), '--base-url', self.base, '--pages', 'en/index.html', '--widths', '390', '--timeout-ms', '2000', '--browser', os.environ.get('PORTFOLIO_BROWSER','chromium')]
        for html, code, marker in [(fixture(),0,'PASS'),(fixture(cta=''),1,'FAIL')]:
            (self.root/'en/index.html').write_text(html,encoding='utf-8')
            proc = await asyncio.create_subprocess_exec(*args,stdout=asyncio.subprocess.PIPE,stderr=asyncio.subprocess.STDOUT)
            output,_ = await proc.communicate()
            self.assertEqual(proc.returncode,code,output.decode())
            self.assertIn(marker,output.decode())

    async def test_docsbird_variant_is_checked(self):
        for name in ['docsbird-hero-visual.jpg','docsbird-hero-visual-4.jpg']:
            (self.root/name).write_text(SVG,encoding='utf-8')
        html = fixture('<img id="docsbird-hero-visual" src="/ok.svg">')
        html = html.replace('index.html','docsbird.html')
        errors = await self.check(html,'en/docsbird.html')
        self.assertTrue(any('hero' in e.lower() for e in errors),errors)
        html = fixture('<img id="docsbird-hero-visual" src="/docsbird-hero-visual.jpg">', '''if(['b','4'].includes(new URLSearchParams(location.search).get('hero')))document.querySelector('img').src='/docsbird-hero-visual-4.jpg';''').replace('index.html','docsbird.html')
        for lang in ['ru','es']:
            (self.root/lang/'docsbird.html').write_text(html,encoding='utf-8')
        for query in ['', '?hero=a','?hero=b','?hero=4']:
            self.assertEqual(await self.check(html,'en/docsbird.html'+query),[],query)
        broken = html.replace("['b','4']", "['b']")
        errors = await self.check(broken,'en/docsbird.html?hero=4')
        self.assertTrue(any('hero' in e.lower() for e in errors),errors)
        for name in ['docsbird-hero-visual.png', 'docsbird-hero-visual-4.png']:
            (self.root/name).write_text(SVG, encoding='utf-8')
        localized = html.replace('.jpg', '.png')
        for query in ['', '?hero=b', '?hero=4']:
            self.assertEqual(await self.check(localized, 'en/docsbird.html'+query), [], query)

    async def test_transparent_lightbox_is_rejected(self):
        body = '<img data-lightbox src="/ok.svg"><div id="image-lightbox-overlay" class="hidden"><button data-lightbox-close>Close</button><img src=""></div>'
        script = '''const o=document.querySelector('#image-lightbox-overlay');document.querySelector('[data-lightbox]').onclick=()=>{o.classList.remove('hidden');o.querySelector('img').src='/ok.svg'};document.addEventListener('keydown',e=>{if(e.key==='Escape')o.classList.add('hidden')});document.querySelector('button').onclick=()=>o.classList.add('hidden');'''
        html = fixture(body,script).replace('index.html','relaunch.html')
        for lang in ['ru','es']:
            (self.root/lang/'relaunch.html').write_text(html,encoding='utf-8')
        self.assertEqual(await self.check(html,'en/relaunch.html'),[])
        broken_close = html.replace("e.key==='Escape'", "e.key==='Enter'")
        errors = await self.check(broken_close,'en/relaunch.html')
        self.assertTrue(any('Escape' in e for e in errors),errors)
        offscreen = html.replace('right:8px','right:-100px')
        errors = await self.check(offscreen,'en/relaunch.html')
        self.assertTrue(any('close button' in e for e in errors),errors)
        html = html.replace('background:white;padding:12px','background:transparent;padding:12px')
        errors = await self.check(html,'en/relaunch.html')
        self.assertTrue(any('lightbox' in e.lower() for e in errors),errors)

SCRIPT = Path(__file__).with_name('check-portfolio-preview.py')


def load_checker():
    spec = importlib.util.spec_from_file_location('preview_check', SCRIPT)
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    return module


class SourceTests(unittest.TestCase):
    def test_local_url_scope_and_subpath(self):
        checker = load_checker()
        self.assertTrue(hasattr(checker,'page_urls'), 'CLI URL validation is not implemented')
        self.assertEqual(checker.page_urls('http://localhost:8765/portfolio/', ['en/index.html','en/docsbird.html?hero=b']), ['http://localhost:8765/portfolio/en/index.html','http://localhost:8765/portfolio/en/docsbird.html?hero=b'])
        for base,pages in [('https://example.com/',['en/']),('http://localhost:8765/', ['https://example.com/']),('http://localhost:8765/', ['../en/']),('http://localhost:8765/', ['%2e%2e/en/'])]:
            with self.subTest(base=base,pages=pages), self.assertRaises(ValueError):
                checker.page_urls(base,pages)

    def test_truncated_markup_and_nested_section(self):
        self.assertTrue(SCRIPT.exists(), 'Preview checker has not been implemented')
        checker = load_checker()
        for text in ['<a class...', '<div>[truncated]</div>', '<a href="#"><section id="cta">Contact</section></a>']:
            with self.subTest(text=text):
                self.assertTrue(checker.source_errors(text))
        self.assertEqual(checker.source_errors('<h1>Work</h1><section id="cta"><a href="mailto:a@b.test">Contact</a></section>'), [])


if __name__ == '__main__':
    unittest.main()

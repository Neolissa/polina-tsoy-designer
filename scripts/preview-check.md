# Portfolio preview smoke-check

Небольшая техническая проверка работающего localhost. Не меняет страницы, не отправляет формы, не запускает/останавливает сервер, не делает commit/push. Browser context изолирован; действия ограничены загрузкой страниц, прокруткой и открытием/закрытием lightbox. Сам сайт по-прежнему может загружать внешние CDN-ресурсы.

## Запуск

Требуются Python 3.10+, Playwright и Chromium либо установленный Chrome/Edge. Новых npm-зависимостей нет.

Из корня репозитория, если Playwright уже установлен в активном Python:

```bash
python scripts/check-portfolio-preview.py --base-url http://localhost:8765/
```

Или через отдельное окружение uv:

```bash
uv run --with playwright python -m playwright install chromium
uv run --with playwright python scripts/check-portfolio-preview.py --base-url http://localhost:8765/
```

На Linux, если не хватает системных библиотек Chromium, выполнить предлагаемые Playwright шаги установки в своей среде; сам checker ничего не устанавливает и не использует sudo.

Для установленного Edge на Windows:

```bash
uv run --with playwright python scripts/check-portfolio-preview.py --browser msedge
```

Выбранные страницы (пути относительно `base-url`, без начального `/`):

```bash
uv run --with playwright python scripts/check-portfolio-preview.py --browser msedge \
  --pages en/index.html en/relaunch.html 'en/docsbird.html?hero=b' \
  --widths 1440 390 --timeout-ms 15000
```

`base-url` может включать подкаталог GitHub Pages, если локальный сервер действительно обслуживает такую структуру: `http://localhost:8765/polina-tsoy-designer/`. Разрешены только loopback origins: localhost, 127.0.0.1, ::1. Переданный hostname не подменяется автоматически. Скрипт предназначен для доверенного локального сайта, не является сетевой песочницей для непроверенного HTML.

## Windows + WSL

Сервер и Git проверять в нативном WSL, браузер запускается в той ОС, где запущен Python. Не делать вывод о доступности Windows localhost только по выводу WSL-сервера.

Проверка рабочего каталога из Git Bash:

```bash
MSYS_NO_PATHCONV=1 MSYS2_ARG_CONV_EXCL='*' wsl.exe -d Ubuntu \
  --cd /home/polina/hobby/portfolio2 -- git status -sb
```

Если Windows Python не читает UNC-путь, скопировать **только** два проверочных Python-файла из `scripts/` в новую временную папку Windows, используя нативный WSL `cp` в `/mnt/c/...`. Сверить содержимое с репозиторием, запустить Windows Python/Edge против точного `http://localhost:8765/`, затем удалить временную папку. Страницы сайта не копировать: проверяться должен действующий сервер репозитория, а не зеркало сайта. Этот путь не требует новых настроек Hermes или перезапуска Desktop.

Проверенный запуск Windows Python/Edge прямо из WSL-репозитория, не зависящий от текущего каталога:

```bash
uv run --with playwright python '//wsl.localhost/Ubuntu/home/polina/hobby/portfolio2/scripts/check-portfolio-preview.py' --browser msedge
```

## По умолчанию

- EN home, DocsBird default/A/B/4, Relaunch, WUW, TVIP.
- Ширины 1440 и 390 px.
- Один видимый непустой H1 и один контактный `#cta` с действием.
- Следы обрезанного вывода `class...`, `[truncated]`; крупные секции внутри `<a>`.
- Реальная прокрутка для lazy images/fade-in, загрузка изображений, ошибки/metadata видео, JS exceptions.
- Горизонтальное переполнение.
- RU/EN/ES ссылки на соответствующую страницу, active locale, HTTP 200 и отсутствие подмены маршрута redirect-ом.
- Для RU/EN DocsBird — фактический hero asset соответствует query-параметру. Чтобы проверить все варианты при собственном `--pages`, перечислить их явно.
- Для Relaunch — открытие увеличенного изображения, его загрузка, непрозрачный светлый фон, кнопка закрытия в пределах viewport и закрытие по Escape. Предпочтительно проверяется PNG personal growth.

Используется `domcontentloaded` и ограниченные ожидания конкретных элементов, **не networkidle**: незавершающийся video/fetch не должен блокировать проверку готовой страницы. `--timeout-ms` — предел отдельного ожидания, не всего запуска. Ошибка CDN/сети может дать честный FAIL готовности, а не обязательно дефект HTML.

## Выход

- `0`: все выбранные страницы/ширины прошли перечисленные проверки.
- `1`: обнаружены дефекты страниц или недоступен выбранный URL.
- `2`: неправильные аргументы, нет зависимости/браузера или ошибка среды выполнения.

Вывод — строка PASS/FAIL для каждого URL/viewport, причины ошибок и общий итог. Проверка не выбирает визуал A/B за автора.

## Проверка самого checker

```bash
uv run --with playwright python scripts/test-check-portfolio-preview.py
```

Windows / Git Bash с установленным Edge:

```bash
PORTFOLIO_BROWSER=msedge uv run --with playwright python scripts/test-check-portfolio-preview.py
```

Тесты создают временный HTTP-сервер на свободном loopback-порту и синтетические HTML/SVG-страницы. Вносят дефекты только туда: CTA/H1, nested link, media, overflow, JS, language route, wrong hero/alias, transparent lightbox, Escape и close geometry. Есть положительные примеры, CLI exit-code tests и незавершающийся fetch. Временные файлы/сервер убираются тестами.

## Границы

Не проверяет: художественное качество, достоверность метрик, английскую редактуру, тексты внутри изображений, полную доступность, весь сайт, внешние ссылки, PDF, отправку форм, все состояния media player или production-деплой. `privacy.html` и `404.html` не входят в этот сценарий: отсутствие CTA там может быть намеренным.

RU/ES Relaunch ещё могут не иметь светлой подложки. Если выбрать их явно, checker должен показать проблему; он не исправляет её и не пропускает ради зелёного результата.

После PASS всё равно нужен визуальный просмотр. Публикация — отдельное решение пользователя.

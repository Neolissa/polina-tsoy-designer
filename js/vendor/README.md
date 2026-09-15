# Vendored Tailwind Play CDN

`tailwind-play-cdn.js` is an unmodified snapshot of https://cdn.tailwindcss.com/3.4.17.

SHA-256: `176e894661aa9cdc9a5cba6c720044cbbf7b8bd80d1c9a142a7c24b1b6c50d15`.

The cached file was compared byte-for-byte with that endpoint before copying. Its upstream MIT license is included as `tailwind-LICENSE.txt` (source: https://raw.githubusercontent.com/tailwindlabs/tailwindcss/v3.4.17/LICENSE).

The existing static portfolio compiles utility classes in the browser. Self-hosting this same script removes the blocking CDN dependency without changing its version or the page configuration. This does not migrate the project to a build-time Tailwind pipeline. Google Fonts remains optional and loads without blocking document initialization.

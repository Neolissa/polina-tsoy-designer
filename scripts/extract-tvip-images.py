#!/usr/bin/env python3
"""Extract embedded base64 images from TVIP SVG mockups."""

import base64
import os
import re
import sys
import xml.etree.ElementTree as ET
from pathlib import Path

SVG_DIR = Path("images-originals/tvip styles")
OUT_DIR = Path("images/case-mocks/tvip/extracted")

NS = {
    "svg": "http://www.w3.org/2000/svg",
    "xlink": "http://www.w3.org/1999/xlink",
}

MIME_EXT = {
    "image/jpeg": ".jpg",
    "image/png": ".png",
    "image/webp": ".webp",
    "image/gif": ".gif",
}

MIN_DATA_LEN = 500  # skip tiny transparent placeholders


def slugify(name: str) -> str:
    s = name.lower().replace(".svg", "")
    s = re.sub(r"[^\w\s-]", "", s)
    s = re.sub(r"[\s]+", "-", s.strip())
    s = re.sub(r"-+", "-", s)
    return s


def extract_from_svg(svg_path: Path, out_dir: Path) -> list[dict]:
    tree = ET.parse(svg_path)
    root = tree.getroot()

    images = root.findall(".//svg:image", NS)
    if not images:
        images = root.findall(".//{http://www.w3.org/2000/svg}image")

    results = []
    for i, img in enumerate(images):
        href = img.get("{http://www.w3.org/1999/xlink}href") or img.get("href", "")
        if not href.startswith("data:"):
            continue

        if len(href) < MIN_DATA_LEN:
            continue

        match = re.match(r"data:(image/\w+);base64,(.*)", href, re.DOTALL)
        if not match:
            continue

        mime = match.group(1)
        b64data = match.group(2)
        ext = MIME_EXT.get(mime, ".bin")

        raw = base64.b64decode(b64data)

        rel = svg_path.relative_to(SVG_DIR)
        parts = list(rel.parts)
        if len(parts) > 1:
            prefix = slugify(parts[0]) + "--" + slugify(parts[-1])
        else:
            prefix = slugify(parts[0])

        w = img.get("width", "0")
        h = img.get("height", "0")

        fname = f"{prefix}--{i}--{w}x{h}{ext}"
        out_path = out_dir / fname
        out_path.write_bytes(raw)
        results.append({
            "svg": str(svg_path),
            "index": i,
            "size": f"{w}x{h}",
            "mime": mime,
            "bytes": len(raw),
            "out": str(out_path),
        })

    return results


def main():
    if not SVG_DIR.exists():
        print(f"ERROR: {SVG_DIR} not found", file=sys.stderr)
        sys.exit(1)

    OUT_DIR.mkdir(parents=True, exist_ok=True)

    svgs = sorted(SVG_DIR.rglob("*.svg"))
    print(f"Found {len(svgs)} SVG files\n")

    total = 0
    for svg in svgs:
        items = extract_from_svg(svg, OUT_DIR)
        if items:
            rel = svg.relative_to(SVG_DIR)
            print(f"  {rel}: {len(items)} images")
            for it in items:
                print(f"    -> {Path(it['out']).name}  ({it['size']}, {it['bytes']//1024}KB)")
            total += len(items)

    print(f"\nTotal: {total} images extracted to {OUT_DIR}/")


if __name__ == "__main__":
    main()

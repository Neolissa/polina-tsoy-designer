#!/usr/bin/env python3
"""Organize extracted TVIP images into proper asset directories."""

import shutil
from pathlib import Path
import subprocess

SRC = Path("images/case-mocks/tvip/extracted")
DST = Path("images/case-mocks/tvip")

EXISTING_ONBOARDING = [
    "onboarding/onb-1-day.webp", "onboarding/onb-1-night.webp",
    "onboarding/onb-2-day.webp", "onboarding/onb-2-night.webp",
    "onboarding/onb-3-day.webp", "onboarding/onb-3-night.webp",
]

ASSET_MAP = {
    # Channel thumbnails from Main page SVG (178x100 = TV channel previews)
    "channels/ch-1.webp": "main-page--2--178x100.png",   # Первый канал
    "channels/ch-2.webp": "main-page--3--178x100.png",   # Россия 1
    "channels/ch-3.webp": "main-page--4--178x100.png",   # Матч ТВ
    "channels/ch-4.webp": "main-page--5--178x100.png",   # НТВ (using larger)
    "channels/ch-5.webp": "main-page--6--178x100.png",   # Пятый канал
    "channels/ch-6.webp": "main-page--7--178x100.png",   # Карусель

    # Mobile channel tiles (from Android-5)
    "channels/mob-ch-1.webp": "mobile--android-5--0--640x360.png",
    "channels/mob-ch-2.webp": "mobile--android-5--1--640x360.png",
    "channels/mob-ch-3.webp": "mobile--android-5--2--640x360.png",
    "channels/mob-ch-4.webp": "mobile--android-5--3--640x360.png",
    "channels/mob-ch-5.webp": "mobile--android-5--4--640x360.png",
    "channels/mob-ch-6.webp": "mobile--android-5--5--640x360.png",

    # Movie posters from tablet Фильмы главная (vertical posters)
    "posters/bloodshot-hero.webp": "tablet--фильмы-главная--0--2160x1080.jpg",  # hero carousel
    "posters/marathon-vert.webp": "tablet--фильмы-главная--3--1050x1544.jpg",
    "posters/odin-vdoh-vert.webp": "tablet--фильмы-главная--4--1336x1900.jpg",
    "posters/quiet-place-vert.webp": "tablet--фильмы-главная--5--1000x1471.jpg",
    "posters/pushki-vert.webp": "tablet--фильмы-главная--6--782x1200.jpg",
    "posters/bogatyr-vert.webp": "tablet--фильмы-главная--7--1575x2362.jpg",
    "posters/invisible-vert.webp": "tablet--фильмы-главная--8--1282x1900.jpg",

    # Landscape poster cards from Main page (500x375)
    "posters/bloodshot.webp": "main-page--14--500x375.png",
    "posters/marathon.webp": "main-page--16--500x375.png",
    "posters/odin-vdoh.webp": "main-page--17--500x375.png",
    "posters/quiet-place.webp": "main-page--18--500x375.png",
    "posters/pushki.webp": "main-page--19--500x375.png",
    "posters/bogatyr.webp": "main-page--20--500x375.png",
    "posters/khmurov.webp": "main-page--21--500x375.png",
    "posters/invisible.webp": "main-page--22--178x100.png",

    # Tablet detail posters
    "posters/khmurov-wide.webp": "tablet--сериалы--0--562x315.png",
    "posters/dance-wide.webp": "tablet--тв-шоу--1--1922x1082.jpg",
    "posters/marathon-wide.webp": "tablet--фильм--7--1908x804.png",

    # Detail posters
    "posters/detail-khmurov.webp": "tablet--сериалы--6--1005x1403.jpg",

    # Mobile detail
    "posters/marathon-detail-mob.webp": "tablet--фильмы-главная--15--2867x4096.jpg",
    "posters/marathon-mob.webp": "mobile--фильтр--0--1050x1544.jpg",
    "posters/odin-vdoh-mob.webp": "mobile--фильтр--1--1336x1900.jpg",
    "posters/quiet-place-mob.webp": "mobile--фильтр--2--782x1200.jpg",
    "posters/pushki-mob.webp": "mobile--фильтр--3--1000x1471.jpg",

    # Episodes from Сериалы SVG
    "episodes/ep-1.webp": "tablet--сериалы--1--562x317.png",
    "episodes/ep-2.webp": "tablet--сериалы--2--558x317.png",

    # CCTV placeholder — use channel thumbnails as stand-ins
    "cctv/cam-1.webp": "main-page--10--178x100.png",
    "cctv/cam-2.webp": "main-page--11--178x100.png",
    "cctv/cam-3.webp": "main-page--12--178x100.png",

    # Start / login BGs
    "bg/start-bg.webp": "desktop-start--0--1920x935.jpg",

    # Family illustration from Desktop start SVG
    "illus/family.webp": "desktop-start--4--552x333.png",

    # TVIP logo
    "logo/tvip-logo.webp": "main-page--1--308x57.png",

    # Avatars (use the profile-related images)
    "profiles/avatar-1.webp": "main-page--9--250x250.png",
    "profiles/avatar-2.webp": "main-page--8--178x100.png",
    "profiles/avatar-3.webp": "main-page--13--178x100.png",
    "profiles/avatar-4.webp": "main-page--10--178x100.png",
}


def convert_to_webp(src_path: Path, dst_path: Path, quality: int = 80, max_dim: int = 800):
    """Convert image to webp with resize if too large."""
    dst_path.parent.mkdir(parents=True, exist_ok=True)

    if dst_path.suffix != ".webp":
        shutil.copy2(src_path, dst_path)
        return

    try:
        result = subprocess.run(
            ["cwebp", "-q", str(quality), "-resize", str(max_dim), "0",
             str(src_path), "-o", str(dst_path)],
            capture_output=True, timeout=30
        )
        if result.returncode == 0:
            return
    except (FileNotFoundError, subprocess.TimeoutExpired):
        pass

    try:
        from PIL import Image
        with Image.open(src_path) as img:
            w, h = img.size
            if max(w, h) > max_dim:
                ratio = max_dim / max(w, h)
                img = img.resize((int(w * ratio), int(h * ratio)), Image.LANCZOS)
            if img.mode in ("RGBA", "P"):
                img = img.convert("RGB")
            img.save(dst_path, "WEBP", quality=quality)
        return
    except ImportError:
        pass

    shutil.copy2(src_path, dst_path.with_suffix(src_path.suffix))
    print(f"  WARNING: could not convert to webp, copied as-is")


def main():
    created = 0
    skipped = 0
    failed = 0

    for dst_rel, src_name in ASSET_MAP.items():
        src_path = SRC / src_name
        dst_path = DST / dst_rel

        if dst_path.exists():
            print(f"  SKIP (exists): {dst_rel}")
            skipped += 1
            continue

        if not src_path.exists():
            print(f"  FAIL (missing src): {src_name}")
            failed += 1
            continue

        dst_path.parent.mkdir(parents=True, exist_ok=True)
        convert_to_webp(src_path, dst_path)
        size_kb = dst_path.stat().st_size // 1024 if dst_path.exists() else 0
        print(f"  OK: {dst_rel} ({size_kb}KB)")
        created += 1

    print(f"\nDone: {created} created, {skipped} skipped, {failed} failed")


if __name__ == "__main__":
    main()

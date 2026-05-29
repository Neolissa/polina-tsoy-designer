#!/usr/bin/env node
/**
 * Crop poster / profile images from Figma SVGs for TVIP HTML mocks.
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { Resvg } from "@resvg/resvg-js";
import sharp from "sharp";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, "..");
const ORIGINALS = path.join(ROOT, "images-originals");
const OUT = path.join(ROOT, "images", "case-mocks", "tvip");

/** @type {{ src: string; out: string; w: number; crops: { name: string; left: number; top: number; width: number; height: number }[] }[]} */
const SOURCES = [
  {
    src: "tvip styles/Main page.svg",
    w: 1921,
    crops: [
      { name: "continue-1", left: 444, top: 233, width: 329, height: 178 },
      { name: "continue-2", left: 793, top: 233, width: 329, height: 178 },
      { name: "land-1", left: 426, top: 652, width: 347, height: 178 },
      { name: "land-2", left: 793, top: 652, width: 329, height: 178 },
      { name: "land-3", left: 1142, top: 652, width: 329, height: 178 },
      { name: "profile-top-1", left: 805, top: 184, width: 60, height: 36 },
      { name: "profile-top-2", left: 1153, top: 184, width: 60, height: 36 },
      { name: "profile-top-3", left: 1502, top: 184, width: 60, height: 36 },
      { name: "profile-side-1", left: 39, top: 323, width: 60, height: 35 },
      { name: "profile-side-2", left: 39, top: 396, width: 60, height: 35 }
    ]
  },
  {
    src: "tvip styles/tablet/Сериалы.svg",
    w: 1024,
    crops: [
      { name: "vert-1", left: 62, top: 160, width: 125, height: 180 },
      { name: "vert-2", left: 73, top: 878, width: 120, height: 153 },
      { name: "vert-3", left: 228, top: 882, width: 120, height: 153 },
      { name: "vert-4", left: 383, top: 882, width: 120, height: 153 }
    ]
  },
  {
    src: "tvip styles/mobile/Android - 5.svg",
    w: 360,
    crops: [
      { name: "mob-1", left: 19, top: 154, width: 150, height: 100 },
      { name: "mob-2", left: 190, top: 154, width: 150, height: 100 },
      { name: "mob-3", left: 19, top: 389, width: 150, height: 100 },
      { name: "mob-4", left: 190, top: 389, width: 150, height: 100 },
      { name: "mob-5", left: 19, top: 626, width: 150, height: 100 },
      { name: "mob-6", left: 190, top: 626, width: 150, height: 100 }
    ]
  },
  {
    src: "tvip styles/tablet/Фильм.svg",
    w: 1024,
    crops: [{ name: "detail", left: 120, top: 80, width: 420, height: 620 }]
  },
  {
    src: "tvip styles/mobile/Android - 8.svg",
    w: 360,
    crops: [{ name: "m-detail", left: 0, top: 56, width: 360, height: 420 }]
  }
];

async function renderPng(svgPath, width) {
  const svg = fs.readFileSync(svgPath);
  const resvg = new Resvg(svg, { fitTo: { mode: "width", value: width } });
  return resvg.render().asPng();
}

async function main() {
  fs.mkdirSync(path.join(OUT, "posters"), { recursive: true });
  fs.mkdirSync(path.join(OUT, "profiles"), { recursive: true });

  for (const job of SOURCES) {
    const input = path.join(ORIGINALS, job.src);
    if (!fs.existsSync(input)) {
      console.warn("Skip missing", job.src);
      continue;
    }
    const png = await renderPng(input, job.w);
    const meta = await sharp(png).metadata();
    const scale = meta.width / job.w;

    for (const c of job.crops) {
      const left = Math.max(0, Math.round(c.left * scale));
      const top = Math.max(0, Math.round(c.top * scale));
      const width = Math.min(meta.width - left, Math.round(c.width * scale));
      const height = Math.min(meta.height - top, Math.round(c.height * scale));
      const sub = c.name.startsWith("profile")
        ? path.join(OUT, "profiles", `${c.name}.webp`)
        : path.join(OUT, "posters", `${c.name}.webp`);

      await sharp(png).extract({ left, top, width, height }).webp({ quality: 86 }).toFile(sub);
      console.log("✓", path.relative(ROOT, sub));
    }
  }
  console.log("\nDone.");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});

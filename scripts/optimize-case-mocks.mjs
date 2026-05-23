#!/usr/bin/env node
/**
 * Renders Figma SVG mocks to WebP for fast portfolio loading.
 * Source: images-originals/{tvip,coin,docsbird} styles/
 * Output: images/case-mocks/
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { Resvg } from "@resvg/resvg-js";
import sharp from "sharp";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, "..");
const ORIGINALS = path.join(ROOT, "images-originals");
const OUT = path.join(ROOT, "images", "case-mocks");

/** @type {{ id: string, src: string, out: string, width: number }[]} */
const ASSETS = [
  {
    id: "tvip-login-night",
    src: "tvip styles/Dark Desktop login.svg",
    out: "tvip/login-night.webp",
    width: 1920
  },
  {
    id: "tvip-login-day",
    src: "tvip styles/Desktop login.svg",
    out: "tvip/login-day.webp",
    width: 1920
  },
  {
    id: "tvip-home-night",
    src: "tvip styles/Main page.svg",
    out: "tvip/home-night.webp",
    width: 1921
  },
  {
    id: "tvip-home-day",
    src: "tvip styles/Desktop loggeg in.svg",
    out: "tvip/home-day.webp",
    width: 1920
  },
  {
    id: "tvip-mobile-home",
    src: "tvip styles/mobile/Android - 5.svg",
    out: "tvip/mobile-home.webp",
    width: 360
  },
  {
    id: "tvip-mobile-filter",
    src: "tvip styles/mobile/Фильтр.svg",
    out: "tvip/mobile-filter.webp",
    width: 360
  },
  {
    id: "coin-home",
    src: "coin styles/Главная страница - Фильтры - Фото.svg",
    out: "coin/home.webp",
    width: 1920
  },
  {
    id: "coin-profile",
    src: "coin styles/Профиль.svg",
    out: "coin/profile.webp",
    width: 1920
  },
  {
    id: "docsbird-agreement",
    src: "docsbird styles/Agreement.svg",
    out: "docsbird/agreement.webp",
    width: 1371
  },
  {
    id: "docsbird-dashboard",
    src: "docsbird styles/dashboard.svg",
    out: "docsbird/dashboard.webp",
    width: 1440
  }
];

const WEBP_QUALITY = 84;

async function renderAsset({ id, src, out, width }) {
  const inputPath = path.join(ORIGINALS, src);
  const outputPath = path.join(OUT, out);

  if (!fs.existsSync(inputPath)) {
    throw new Error(`Missing source: ${inputPath}`);
  }

  fs.mkdirSync(path.dirname(outputPath), { recursive: true });

  const svg = fs.readFileSync(inputPath);
  const t0 = Date.now();
  const resvg = new Resvg(svg, {
    fitTo: { mode: "width", value: width }
  });
  const png = resvg.render().asPng();
  await sharp(png).webp({ quality: WEBP_QUALITY, effort: 4 }).toFile(outputPath);

  const inKb = (fs.statSync(inputPath).size / 1024).toFixed(0);
  const outKb = (fs.statSync(outputPath).size / 1024).toFixed(0);
  console.log(
    `✓ ${id}: ${inKb}KB svg → ${outKb}KB webp (${Date.now() - t0}ms)`
  );
}

async function main() {
  console.log("Optimizing case mock assets → WebP\n");
  for (const asset of ASSETS) {
    await renderAsset(asset);
  }
  console.log("\nDone.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

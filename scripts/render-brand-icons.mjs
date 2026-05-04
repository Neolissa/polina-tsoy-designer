/**
 * Собирает favicon, Apple Touch и Open Graph из исходника в images-originals.
 * JPG — основной вход (EPS здесь не поддерживается без Ghostscript/Inkscape).
 * Запуск: node scripts/render-brand-icons.mjs
 */
import sharp from "sharp";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");
const images = join(root, "images");
const source = join(root, "images-originals", "8674975.jpg");

const base = sharp(source).rotate();

await base
  .clone()
  .resize(32, 32, { fit: "cover", position: "centre" })
  .png()
  .toFile(join(images, "favicon-32.png"));

await base
  .clone()
  .resize(180, 180, { fit: "cover", position: "centre" })
  .png()
  .toFile(join(images, "apple-touch-icon.png"));

await base
  .clone()
  .resize(1200, 630, { fit: "cover", position: "centre" })
  .png({ compressionLevel: 9 })
  .toFile(join(images, "og-portfolio.png"));

console.log("OK from images-originals/8674975.jpg -> favicon-32.png, apple-touch-icon.png, og-portfolio.png");

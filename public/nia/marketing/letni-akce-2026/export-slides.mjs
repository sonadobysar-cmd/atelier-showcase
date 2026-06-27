#!/usr/bin/env node
/**
 * Export IG carousel slides to PNG (1080×1350).
 * Usage: node export-slides.mjs
 */
import { chromium } from 'playwright';
import { fileURLToPath } from 'url';
import path from 'path';
import fs from 'fs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const outDir = path.join(__dirname, 'slides');
const htmlPath = path.join(__dirname, 'carousel.html');

fs.mkdirSync(outDir, { recursive: true });

const browser = await chromium.launch({
  channel: 'chrome',
  headless: true,
});
const page = await browser.newPage({ viewport: { width: 1080, height: 1350 } });
await page.goto(`file://${htmlPath}`, { waitUntil: 'networkidle' });
await page.waitForTimeout(1200);

const count = await page.locator('.slide').count();
for (let i = 0; i < count; i++) {
  const slide = page.locator('.slide').nth(i);
  const num = String(i + 1).padStart(2, '0');
  const file = path.join(outDir, `${num}-letni-akce.png`);
  await slide.screenshot({ path: file, type: 'png' });
  console.log('✓', file);
}

await browser.close();
console.log(`\nHotovo — ${count} slidů v ${outDir}`);

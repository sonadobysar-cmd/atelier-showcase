#!/usr/bin/env node
/** Export Reels as WebM (1080×1920, ~12 s loop). */
import { chromium } from 'playwright';
import { fileURLToPath } from 'url';
import path from 'path';
import fs from 'fs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const htmlPath = path.join(__dirname, 'reels.html');
const outDir = path.join(__dirname, 'video');
fs.mkdirSync(outDir, { recursive: true });

const browser = await chromium.launch({ channel: 'chrome', headless: true });
const context = await browser.newContext({
  viewport: { width: 1080, height: 1920 },
  recordVideo: { dir: outDir, size: { width: 1080, height: 1920 } },
});
const page = await context.newPage();
await page.goto(`file://${htmlPath}`, { waitUntil: 'networkidle' });
await page.waitForTimeout(12000);
await context.close();
await browser.close();

const webm = fs.readdirSync(outDir).find((f) => f.endsWith('.webm'));
if (webm) {
  const src = path.join(outDir, webm);
  const dest = path.join(outDir, 'letni-akce-reels.webm');
  fs.renameSync(src, dest);
  console.log('✓', dest);
} else {
  console.log('Video se nepodařilo uložit.');
}

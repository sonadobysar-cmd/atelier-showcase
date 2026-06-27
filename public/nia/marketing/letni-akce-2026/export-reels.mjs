#!/usr/bin/env node
/** Export Reels as WebM (1080×1920, ~14 s). Vyžaduje: npm i -D playwright && npx playwright install chromium */
import { chromium } from 'playwright';
import { fileURLToPath } from 'url';
import path from 'path';
import fs from 'fs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const htmlPath = path.join(__dirname, 'reels.html');
const outDir = path.join(__dirname, 'video');
fs.mkdirSync(outDir, { recursive: true });

const DURATION_MS = 14000;

const browser = await chromium.launch({ channel: 'chrome', headless: true });
const context = await browser.newContext({
  viewport: { width: 1080, height: 1920 },
  deviceScaleFactor: 1,
  recordVideo: { dir: outDir, size: { width: 1080, height: 1920 } },
});
const page = await context.newPage();
await page.setViewportSize({ width: 1080, height: 1920 });
await page.goto(`file://${htmlPath}`, { waitUntil: 'networkidle' });
await page.waitForTimeout(800);
await page.waitForTimeout(DURATION_MS);
await context.close();
await browser.close();

const dest = path.join(outDir, 'letni-akce-reels.webm');
const webm = fs.readdirSync(outDir).find((f) => f.endsWith('.webm') && f !== 'letni-akce-reels.webm');
if (webm) {
  const src = path.join(outDir, webm);
  if (fs.existsSync(dest)) fs.unlinkSync(dest);
  fs.renameSync(src, dest);
  const stat = fs.statSync(dest);
  console.log('✓', dest);
  console.log(`  ${(stat.size / 1024 / 1024).toFixed(2)} MB · ${DURATION_MS / 1000}s · 1080×1920`);

  try {
    const ffmpegPath = (await import('ffmpeg-static')).default;
    const mp4 = path.join(outDir, 'letni-akce-reels.mp4');
    const { spawnSync } = await import('child_process');
    const r = spawnSync(ffmpegPath, [
      '-y', '-i', dest,
      '-c:v', 'libx264', '-pix_fmt', 'yuv420p', '-movflags', '+faststart',
      mp4,
    ], { stdio: 'pipe' });
    if (r.status === 0) {
      const mp4Stat = fs.statSync(mp4);
      console.log('✓', mp4);
      console.log(`  ${(mp4Stat.size / 1024 / 1024).toFixed(2)} MB · MP4 pro Instagram`);
    }
  } catch {
    console.log('  (MP4: npm i -D ffmpeg-static)');
  }
} else {
  console.error('Video se nepodařilo uložit.');
  process.exit(1);
}

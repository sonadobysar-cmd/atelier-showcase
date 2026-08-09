import { cpSync, mkdirSync, readFileSync, readdirSync, rmSync, writeFileSync } from 'node:fs';

const output = new URL('./dist/', import.meta.url);
const excluded = new Set(['dist', 'build.mjs', 'package.json']);

rmSync(output, { recursive: true, force: true });
mkdirSync(output, { recursive: true });

for (const entry of readdirSync(new URL('./', import.meta.url))) {
  if (excluded.has(entry)) continue;
  cpSync(new URL(`./${entry}`, import.meta.url), new URL(`./dist/${entry}`, import.meta.url), {
    recursive: true,
  });
}

// Keep the catalogue available even when a CDN or browser blocks a standalone
// JavaScript asset. The shop can then render immediately from one HTML file.
const shopFile = new URL('./dist/obchod.html', import.meta.url);
const catalogue = readFileSync(new URL('./js/catalog.js', import.meta.url), 'utf8');
const shop = readFileSync(shopFile, 'utf8').replace(
  '<script src="js/catalog.js"></script>',
  `<script>${catalogue}</script>`,
);
writeFileSync(shopFile, shop);

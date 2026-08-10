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
// JavaScript asset. Catalogue pages can then render immediately from one file.
const catalogue = readFileSync(new URL('./js/catalog.js', import.meta.url), 'utf8');
for (const page of ['index.html', 'obchod.html']) {
  const file = new URL(`./dist/${page}`, import.meta.url);
  const html = readFileSync(file, 'utf8').replace(
    '<script src="js/catalog.js"></script>',
    `<script>${catalogue}</script>`,
  );
  writeFileSync(file, html);
}

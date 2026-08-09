import { cpSync, mkdirSync, readdirSync, rmSync } from 'node:fs';

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

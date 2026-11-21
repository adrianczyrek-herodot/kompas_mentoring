// Copies the prototype build into the built Storybook, so it is served at
// /prototypes/kompas-flow/index.html next to the design system (Storybook has no staticDirs and
// packages/ui must not change). Run after `pnpm build` here and `pnpm build-storybook` in packages/ui.
import { cpSync, existsSync, rmSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const dist = resolve(here, '../dist');
const storybook = resolve(here, '../../../packages/ui/storybook-static');
const target = resolve(storybook, 'prototypes/kompas-flow');

if (!existsSync(resolve(dist, 'index.html'))) {
  throw new Error('No prototype build: run `pnpm --filter @kompas/prototype-kompas-flow build` first.');
}
if (!existsSync(resolve(storybook, 'index.html'))) {
  throw new Error('No built Storybook: run `pnpm --filter @kompas/ui build-storybook` first.');
}
rmSync(target, { recursive: true, force: true });
cpSync(dist, target, { recursive: true });
process.stdout.write(`Copied the prototype to ${target}\n`);

#!/usr/bin/env node
/**
 * Every class name used in `src/` must produce CSS. Tailwind silently ignores classes that do not
 * map to a design token (`bg-surface-primary`, `text-heading-md`), so the screen renders unstyled
 * and no other check notices. Run after `vite build`:
 *
 *   node scripts/check-classes.mjs [file-or-dir …]     default: src
 *
 * Exits with 1 and lists file:line class for every class that is not in dist/assets/*.css.
 */
import { readdirSync, readFileSync, statSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const assets = path.join(root, 'dist/assets');

/** Hooks for the review engine and plain markers; they carry no Tailwind CSS on purpose. */
const ALLOWED = new Set(['screen', 'is-current', 'screen-meta', 'screen-refs', 'frame', 'notes', 'group', 'peer', 'sr-only']);

let css = '';
try {
  css = readdirSync(assets)
    .filter((f) => f.endsWith('.css'))
    .map((f) => readFileSync(path.join(assets, f), 'utf8'))
    .join('\n');
} catch {
  console.error('Brak dist/assets — najpierw `pnpm --filter @kompas/prototype-kompas-flow build`.');
  process.exit(2);
}

function files(target) {
  const stat = statSync(target);
  if (stat.isFile()) return target.endsWith('.tsx') || target.endsWith('.ts') ? [target] : [];
  return readdirSync(target).flatMap((name) => files(path.join(target, name)));
}

/** Tailwind escapes `:` `/` `.` `[` `]` `%` `(` `)` `!` in selectors. */
function selector(cls) {
  return `.${cls.replace(/([:/.[\]%()!&>*+~#,=])/g, '\\$1')}`;
}

const CLASS_ATTR = /className=(?:"([^"]*)"|\{`([^`]*)`\}|\{cn\(([^)]*)\)\})/g;
const STRINGS_IN_EXPR = /'([^']*)'|`([^`]*)`|"([^"]*)"/g;

const problems = [];
const targets = process.argv.slice(2);
for (const file of (targets.length > 0 ? targets : ['src']).flatMap((t) => files(path.resolve(root, t)))) {
  const lines = readFileSync(file, 'utf8').split('\n');
  lines.forEach((line, index) => {
    for (const match of line.matchAll(CLASS_ATTR)) {
      const chunks = [];
      if (match[1] !== undefined) chunks.push(match[1]);
      for (const raw of [match[2], match[3]]) {
        if (raw === undefined) continue;
        // Template literal or cn(…): take the static text and the string literals inside ${…}.
        chunks.push(raw.replace(/\$\{[^}]*\}/g, ' '));
        for (const inner of raw.matchAll(STRINGS_IN_EXPR)) chunks.push(inner[1] ?? inner[2] ?? inner[3] ?? '');
      }
      for (const cls of chunks.join(' ').split(/\s+/).filter(Boolean)) {
        if (ALLOWED.has(cls) || cls.startsWith('${') || /[{}$'"`]/.test(cls)) continue;
        if (!css.includes(selector(cls))) {
          problems.push(`${path.relative(root, file)}:${String(index + 1)}  ${cls}`);
        }
      }
    }
  });
}

if (problems.length > 0) {
  console.error(`Klasy bez CSS (nie istnieją w design systemie): ${String(problems.length)}`);
  for (const p of [...new Set(problems)]) console.error(`  ${p}`);
  process.exit(1);
}
console.log('check-classes: każda klasa ma CSS.');

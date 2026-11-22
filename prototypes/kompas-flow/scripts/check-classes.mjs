#!/usr/bin/env node
/**
 * Every class name used in `src/` must produce CSS. Tailwind silently ignores classes that do not
 * map to a design token (`bg-surface-primary`, `text-heading-md`), so the screen renders unstyled
 * and no other check notices. Run after `vite build`:
 *
 *   node scripts/check-classes.mjs [file-or-dir …]     default: src
 *
 * Exits with 1 and lists file:line class for every class that is not in dist/assets/*.css.
 *
 * The whole file is scanned (not line by line), so a `className={cn(…)}` spread over several lines
 * is checked too. Only string literals and template-literal text count as classes — a bare
 * identifier inside a condition (`open && '…'`) is not a class and must not be reported.
 */
import { readdirSync, readFileSync, statSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const assets = path.join(root, 'dist/assets');

/** Hooks for the review engine and plain markers; they carry no Tailwind CSS on purpose. */
const ALLOWED = new Set([
  'screen',
  'is-current',
  'screen-meta',
  'screen-refs',
  'frame',
  'notes',
  'group',
  'peer',
  'sr-only',
]);

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

const QUOTES = new Set(['"', "'", '`']);

/** Skip a balanced `${ … }` starting at `i` (which points at `$`); returns the index after `}`. */
function skipInterpolation(src, i) {
  let depth = 1;
  i += 2; // past `${`
  while (i < src.length && depth > 0) {
    const c = src[i];
    if (c === '{') depth += 1;
    else if (c === '}') depth -= 1;
    else if (QUOTES.has(c)) {
      const q = c;
      i += 1;
      while (i < src.length && src[i] !== q) {
        if (src[i] === '\\') i += 1;
        i += 1;
      }
    }
    i += 1;
  }
  return i;
}

/** Read a quoted string starting at `i`; returns the index after the closing quote. */
function skipString(src, i) {
  const q = src[i];
  i += 1;
  while (i < src.length && src[i] !== q) {
    if (src[i] === '\\') i += 1;
    i += 1;
  }
  return i + 1;
}

/** True when the literal at `i` directly follows a comparison operator, so it is a value, not a class. */
function isComparedValue(src, i) {
  let j = i - 1;
  while (j >= 0 && /\s/.test(src[j])) j -= 1;
  return j >= 0 && '=!<>'.includes(src[j]);
}

/**
 * Class tokens found in a className expression: text of template literals outside `${…}`, and
 * every string literal anywhere inside (including nested template literals in `${…}`). A literal
 * right after a comparison operator (`status === 'default'`) is a value, not a class, and skipped.
 */
function tokensFromExpression(src) {
  const tokens = [];
  let i = 0;
  while (i < src.length) {
    const c = src[i];
    if (!QUOTES.has(c)) {
      i += 1;
      continue;
    }
    if (isComparedValue(src, i)) {
      i = skipString(src, i);
      continue;
    }
    i += 1;
    let text = '';
    while (i < src.length && src[i] !== c) {
      if (c === '`' && src[i] === '$' && src[i + 1] === '{') {
        i = skipInterpolation(src, i);
        continue;
      }
      if (src[i] === '\\') i += 1;
      text += src[i];
      i += 1;
    }
    i += 1; // closing quote
    for (const token of text.split(/\s+/)) if (token) tokens.push(token);
  }
  return tokens;
}

/** Find every `className=` value with its source fragment and offset (handles multi-line values). */
function classNameValues(src) {
  const found = [];
  const re = /className\s*=/g;
  let match;
  while ((match = re.exec(src)) !== null) {
    let i = re.lastIndex;
    while (i < src.length && /\s/.test(src[i])) i += 1;
    const first = src[i];
    if (QUOTES.has(first)) {
      const end = skipString(src, i);
      found.push({ fragment: src.slice(i + 1, end - 1), offset: match.index, plain: true });
    } else if (first === '{') {
      let depth = 0;
      let j = i;
      while (j < src.length) {
        const c = src[j];
        if (QUOTES.has(c)) {
          j = skipString(src, j);
          continue;
        }
        if (c === '{') depth += 1;
        else if (c === '}') {
          depth -= 1;
          if (depth === 0) {
            j += 1;
            break;
          }
        }
        j += 1;
      }
      found.push({ fragment: src.slice(i + 1, j - 1), offset: match.index, plain: false });
    }
  }
  return found;
}

function lineOf(src, offset) {
  let line = 1;
  for (let i = 0; i < offset && i < src.length; i += 1) if (src[i] === '\n') line += 1;
  return line;
}

const problems = [];
const targets = process.argv.slice(2);
for (const file of (targets.length > 0 ? targets : ['src']).flatMap((t) => files(path.resolve(root, t)))) {
  const src = readFileSync(file, 'utf8');
  for (const { fragment, offset, plain } of classNameValues(src)) {
    const line = lineOf(src, offset);
    const tokens = plain ? fragment.split(/\s+/) : tokensFromExpression(fragment);
    for (const cls of tokens) {
      if (ALLOWED.has(cls) || cls.startsWith('${') || /[{}$'"`]/.test(cls)) continue;
      if (!css.includes(selector(cls))) {
        problems.push(`${path.relative(root, file)}:${String(line)}  ${cls}`);
      }
    }
  }
}

if (problems.length > 0) {
  console.error(`Klasy bez CSS (nie istnieją w design systemie): ${String(problems.length)}`);
  for (const p of [...new Set(problems)]) console.error(`  ${p}`);
  process.exit(1);
}
console.log('check-classes: każda klasa ma CSS.');

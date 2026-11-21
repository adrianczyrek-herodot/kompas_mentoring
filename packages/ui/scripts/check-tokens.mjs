#!/usr/bin/env node
/**
 * Finds values that bypass the design tokens and exits with code 1 (usable in CI).
 *
 *   node scripts/check-tokens.mjs [path …]     default: src .storybook
 *
 * Reports, with file:line:column:
 *   colour      hex / rgb() / hsl() / oklch() / color-mix() … outside src/styles/tokens.css
 *   palette     Tailwind palette classes (bg-zinc-900, text-white …)
 *   arbitrary   Tailwind arbitrary values and properties (p-[13px], [--x:4px]); arbitrary
 *               variants such as data-[state=open]: are allowed
 *   raw-token   var(--raw-*) outside the tokens file (layer 1 is private to it)
 *   dark-variant  `dark:` in components — the dark theme lives in tokens.css
 *
 * Ignored: comments, and inline code / code fences in MDX (docs quote bad examples there).
 */
import { readdirSync, readFileSync, statSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const TOKENS_FILE = path.join(root, 'src/styles/tokens.css');
const EXTENSIONS = new Set(['.ts', '.tsx', '.css', '.mdx']);
const SKIP_DIRS = new Set(['node_modules', 'storybook-static', 'dist']);

const PALETTE =
  'slate|gray|zinc|neutral|stone|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose';
const COLOR_UTILITIES =
  'bg|text|border(?:-[trblxyse])?|ring|ring-offset|outline|fill|stroke|from|via|to|shadow|inset-shadow|drop-shadow|decoration|divide|placeholder|accent|caret';

const rules = [
  {
    id: 'colour',
    re: /(?<![\w&/-])#(?:[0-9a-fA-F]{8}|[0-9a-fA-F]{6}|[0-9a-fA-F]{3,4})\b/g,
    skipTokensFile: true,
  },
  {
    id: 'colour',
    re: /\b(?:rgba?|hsla?|hwb|lab|lch|oklab|oklch|color-mix)\(/gi,
    skipTokensFile: true,
  },
  {
    id: 'palette',
    re: new RegExp(
      `(?<![\\w-])(?:${COLOR_UTILITIES})-(?:(?:${PALETTE})-\\d{2,3}|white|black)(?:\\/\\d+)?(?![\\w-])`,
      'g',
    ),
  },
  { id: 'raw-token', re: /var\(--raw-[\w-]+\)/g, skipTokensFile: true },
  { id: 'dark-variant', re: /(?<![\w-])dark:[^\s'"`]+/g, onlyComponents: true },
];

function* walk(target) {
  const stat = statSync(target);
  if (stat.isFile()) {
    if (EXTENSIONS.has(path.extname(target))) yield target;
    return;
  }
  for (const entry of readdirSync(target)) {
    if (SKIP_DIRS.has(entry)) continue;
    yield* walk(path.join(target, entry));
  }
}

/** Blanks out comments but keeps line/column positions. */
function stripComments(text, ext) {
  const blank = (match) => match.replace(/[^\n]/g, ' ');
  let out = text.replace(/\/\*[\s\S]*?\*\//g, blank);
  if (ext !== '.css') {
    out = out.replace(/(^|[^:\\])\/\/[^\n]*/g, (m, p1) => p1 + blank(m.slice(p1.length)));
    out = out.replace(/\{\/\*[\s\S]*?\*\/\}/g, blank);
  }
  if (ext === '.mdx') {
    // Docs may quote bad examples as code (`bg-zinc-900`, ```fences```); prose code is not styling.
    out = out.replace(/```[\s\S]*?```/g, blank).replace(/`[^`\n]*`/g, blank);
  }
  return out;
}

/** Tailwind arbitrary values: `utility-[…]` or `[prop:value]` not followed by `:` (a variant). */
function findArbitrary(text) {
  const hits = [];
  for (let i = 0; i < text.length; i++) {
    if (text[i] !== '[') continue;
    const prev = text[i - 1] ?? '';
    const isValue = prev === '-' && /[a-z0-9]/i.test(text[i - 2] ?? '');
    const isProperty =
      (prev === '' || /[\s'"`:{(]/.test(prev)) &&
      /^\[-{0,2}[a-z][\w-]*:/i.test(text.slice(i, i + 64));
    if (!isValue && !isProperty) continue;
    let depth = 0;
    let end = -1;
    for (let j = i; j < text.length && j < i + 200; j++) {
      if (text[j] === '[') depth++;
      else if (text[j] === ']') {
        depth--;
        if (depth === 0) {
          end = j;
          break;
        }
      } else if (/[\s'"`]/.test(text[j])) break;
    }
    // a variant (data-[state=open]:, group-has-[>svg]/alert:) is fine; only values are reported
    if (end === -1 || /^(?:\/[\w-]+)?:/.test(text.slice(end + 1, end + 40))) continue;
    let start = i;
    while (
      start > 0 &&
      /[\w\-:/.*&>[\]=]/.test(text[start - 1]) &&
      !/[\s'"`]/.test(text[start - 1])
    )
      start--;
    hits.push({ index: start, match: text.slice(start, end + 1) });
  }
  return hits;
}

const position = (text, index) => {
  const before = text.slice(0, index);
  const line = before.split('\n').length;
  return { line, column: index - before.lastIndexOf('\n') };
};

const targets = (process.argv.slice(2).length ? process.argv.slice(2) : ['src', '.storybook']).map(
  (t) => path.resolve(root, t),
);
const findings = [];

for (const target of targets) {
  for (const file of walk(target)) {
    const ext = path.extname(file);
    const isTokensFile = file === TOKENS_FILE;
    const isComponent = file.includes(`${path.sep}src${path.sep}components${path.sep}`);
    const text = stripComments(readFileSync(file, 'utf8'), ext);
    for (const rule of rules) {
      if (rule.skipTokensFile && isTokensFile) continue;
      if (rule.onlyComponents && !isComponent) continue;
      for (const m of text.matchAll(rule.re)) {
        findings.push({ file, rule: rule.id, match: m[0], ...position(text, m.index) });
      }
    }
    if (ext !== '.css' || /@apply/.test(text)) {
      const source =
        ext === '.css' ? text.replace(/^(?!\s*@apply).*$/gm, (l) => ' '.repeat(l.length)) : text;
      for (const hit of findArbitrary(source)) {
        findings.push({
          file,
          rule: 'arbitrary',
          match: hit.match,
          ...position(source, hit.index),
        });
      }
    }
  }
}

findings.sort((a, b) => a.file.localeCompare(b.file) || a.line - b.line || a.column - b.column);
for (const f of findings) {
  console.log(
    `${path.relative(process.cwd(), f.file)}:${f.line}:${f.column}  ${f.rule.padEnd(12)} ${f.match}`,
  );
}
if (findings.length) {
  const byRule = Object.entries(Object.groupBy(findings, (f) => f.rule))
    .map(([rule, list]) => `${rule}: ${list.length}`)
    .join(', ');
  console.error(`\n✗ ${findings.length} value(s) outside the design tokens (${byRule}).`);
  process.exit(1);
}
console.log('✓ No values outside the design tokens.');

// Fails when a path routed from the root AGENTS.md does not exist, when a lesson
// area file (.ai/lessons/areas/*.md) is not routed, when an AGENTS.md exceeds its line budget, or when a nested AGENTS.md has no CLAUDE.md
// importing it (Claude Code reads only CLAUDE.md in subdirectories).
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { join, relative } from 'node:path';

const root = process.cwd();
const ROOT_BUDGET = 150;
const UNIT_BUDGET = 120;
const IGNORED_DIRS = new Set([
  'node_modules',
  '.git',
  '.ai',
  'dist',
  '.next',
  '.turbo',
  'storybook-static',
]);

const errors = [];

function findInstructionFiles(dir) {
  const found = [];
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    if (entry.isDirectory()) {
      if (!IGNORED_DIRS.has(entry.name)) found.push(...findInstructionFiles(join(dir, entry.name)));
    } else if (entry.name === 'AGENTS.md') {
      found.push(join(dir, entry.name));
    }
  }
  return found;
}

const rootFile = join(root, 'AGENTS.md');
const rootText = readFileSync(rootFile, 'utf8');
const routerSection = rootText.split('## Router zadań')[1]?.split('\n## ')[0];
if (!routerSection) errors.push('AGENTS.md: missing "## Router zadań" section');

let routes = 0;
for (const line of (routerSection ?? '').split('\n')) {
  const cells = line.split('|');
  if (cells.length < 4 || line.startsWith('|---') || line.includes('| Zadanie |')) continue;
  for (const [, path] of cells[2].matchAll(/`([^`]+)`/g)) {
    routes += 1;
    if (!existsSync(join(root, path))) errors.push(`AGENTS.md router: "${path}" does not exist`);
  }
}

const lessonAreasDir = join(root, '.ai/lessons/areas');
if (existsSync(lessonAreasDir)) {
  for (const name of readdirSync(lessonAreasDir).filter((entry) => entry.endsWith('.md'))) {
    const path = `.ai/lessons/areas/${name}`;
    if (!routerSection?.includes(`\`${path}\``)) {
      errors.push(`AGENTS.md router: lesson area "${path}" is not routed`);
    }
  }
}

for (const file of findInstructionFiles(root)) {
  const rel = relative(root, file);
  const lines = readFileSync(file, 'utf8').split('\n').length;
  const budget = file === rootFile ? ROOT_BUDGET : UNIT_BUDGET;
  if (lines > budget) errors.push(`${rel}: ${lines} lines exceeds budget ${budget}`);
  const claude = join(file, '..', 'CLAUDE.md');
  if (!existsSync(claude) || !readFileSync(claude, 'utf8').includes('@AGENTS.md')) {
    errors.push(`${rel}: no CLAUDE.md importing @AGENTS.md next to it`);
  }
}

if (errors.length > 0) {
  for (const error of errors) console.error(`✗ ${error}`);
  process.exit(1);
}
console.log(`✓ task router: ${routes} routed paths exist, instruction files within budget`);

// Runs the Storybook story tests (a11y + interactions) once per theme; fails if either run fails.
import { spawnSync } from 'node:child_process';

let failed = false;
for (const theme of ['light', 'dark']) {
  console.log(`\n▶ Story tests — ${theme} theme`);
  const result = spawnSync('vitest', ['run', ...process.argv.slice(2)], {
    stdio: 'inherit',
    shell: process.platform === 'win32',
    env: { ...process.env, KOMPAS_THEME: theme },
  });
  if (result.status !== 0) {
    failed = true;
  }
}
process.exit(failed ? 1 : 0);

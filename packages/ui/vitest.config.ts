import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { storybookTest } from '@storybook/addon-vitest/vitest-plugin';
import { playwright } from '@vitest/browser-playwright';
import { defineConfig } from 'vitest/config';

const dirname = path.dirname(fileURLToPath(import.meta.url));
// `KOMPAS_THEME=dark` runs every story in the dark theme (see scripts/test-stories-themes.mjs).
const theme = process.env['KOMPAS_THEME'] === 'dark' ? 'dark' : 'light';

export default defineConfig({
  define: { __KOMPAS_TEST_THEME__: JSON.stringify(theme) },
  // Pre-bundle every dependency the stories import before tests start; otherwise Vite discovers
  // a new one mid-run (e.g. a new @base-ui/react part), reloads, and every suite fails to import.
  // `entries` is only scanned when the cache is rebuilt, so `force` rebuilds it on every start.
  optimizeDeps: { entries: ['src/**/*.stories.tsx', '.storybook/**/*.tsx'], force: true },
  test: {
    projects: [
      {
        extends: true,
        plugins: [storybookTest({ configDir: path.join(dirname, '.storybook') })],
        test: {
          name: `storybook-${theme}`,
          browser: {
            enabled: true,
            headless: true,
            provider: playwright(),
            instances: [{ browser: 'chromium' }],
          },
        },
      },
    ],
  },
});

import { integrationTestInclude, unitTestInclude, vitestPreset } from '@kompas/config/vitest';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    ...vitestPreset,
    projects: [
      {
        extends: true,
        test: { name: 'unit', include: unitTestInclude, exclude: integrationTestInclude },
      },
      {
        extends: true,
        test: {
          name: 'integration',
          include: integrationTestInclude,
          sequence: { shuffle: false },
          testTimeout: 120_000,
          hookTimeout: 120_000,
        },
      },
    ],
  },
});

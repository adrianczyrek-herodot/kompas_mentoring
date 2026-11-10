// Shared Vitest defaults. Tests must not depend on real time or order (spec §9).

export const vitestPreset = {
  environment: 'node',
  sequence: { shuffle: true },
  restoreMocks: true,
  unstubEnvs: true,
  unstubGlobals: true,
};

export const unitTestInclude = ['src/**/*.test.ts'];
export const integrationTestInclude = ['src/**/*.int.test.ts'];

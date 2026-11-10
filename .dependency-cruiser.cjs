// Architecture checks (spec §2.4): cycles and module privacy. Run with `pnpm lint:deps`.
/** @type {import('dependency-cruiser').IConfiguration} */
module.exports = {
  forbidden: [
    {
      name: 'no-circular',
      severity: 'error',
      comment:
        'Circular dependency. Fix: when module A needs a reaction from module B, publish a domain event instead of calling back (spec §2.4 rule 5).',
      from: {},
      to: { circular: true },
    },
    {
      name: 'module-private',
      severity: 'error',
      comment:
        'Another module may be imported only through its index.ts (spec §2.4 rule 3). Fix: export what you need from modules/<x>/index.ts.',
      from: { path: '^packages/core/src/modules/([^/]+)/' },
      to: {
        path: '^packages/core/src/modules/([^/]+)/.+',
        pathNot: ['^packages/core/src/modules/$1/', '^packages/core/src/modules/[^/]+/index\\.ts$'],
      },
    },
    {
      name: 'apps-use-public-api',
      severity: 'error',
      comment:
        'Apps import only @kompas/core, module index.ts files, contracts and ui (spec §2.4 rule 4). Fix: export the needed command/query from modules/<x>/index.ts.',
      from: { path: '^apps/' },
      to: {
        path: '^packages/core/src/',
        pathNot: ['^packages/core/src/index\\.ts$', '^packages/core/src/modules/[^/]+/index\\.ts$'],
      },
    },
    {
      name: 'domain-is-pure',
      severity: 'error',
      comment:
        'domain/ must not depend on application/, infrastructure/ or platform code (spec §2.4 rule 1). Fix: define a port in domain/ and implement it in infrastructure/.',
      from: { path: '^packages/core/src/(modules/[^/]+|shared)/domain/' },
      to: {
        path: '^packages/core/src/',
        pathNot: ['^packages/core/src/(modules/[^/]+|shared)/domain/'],
      },
    },
    {
      name: 'not-to-unresolvable',
      severity: 'error',
      from: {},
      to: { couldNotResolve: true },
    },
  ],
  options: {
    doNotFollow: { path: ['node_modules'] },
    exclude: { path: ['\\.next/', 'node_modules/', 'dist/', 'e2e/'] },
    tsPreCompilationDeps: true,
    tsConfig: { fileName: 'tsconfig.depcruise.json' },
    enhancedResolveOptions: {
      exportsFields: ['exports'],
      conditionNames: ['import', 'require', 'node', 'default', 'types'],
      mainFields: ['module', 'main', 'types', 'typings'],
      extensions: ['.ts', '.tsx', '.js', '.mjs', '.cjs', '.d.ts'],
    },
    combinedDependencies: true,
  },
};

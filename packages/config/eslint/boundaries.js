// Module boundaries from spec §2.4, enforced with eslint-plugin-boundaries.
// Every message tells the author (human or agent) how to fix the violation.

const CORE = 'packages/core/src';
const MODULES = `${CORE}/modules`;

/** Elements are folders; the first matching descriptor wins. */
/** @type {import('eslint-plugin-boundaries').ElementDescriptor[]} */
export const elements = [
  {
    type: 'module-layer',
    partialMatch: false,
    pattern: `${MODULES}/*/*`,
    capture: ['module', 'layer'],
  },
  // Files in a module root: index.ts (public API) and di.ts (wiring).
  { type: 'module', partialMatch: false, pattern: `${MODULES}/*`, capture: ['module'] },
  { type: 'shared-domain', partialMatch: false, pattern: `${CORE}/shared/domain` },
  { type: 'core-platform', partialMatch: false, pattern: 'packages/core' },
  { type: 'contracts', partialMatch: false, pattern: 'packages/contracts' },
  { type: 'ui', partialMatch: false, pattern: 'packages/ui' },
  { type: 'testing', partialMatch: false, pattern: 'packages/testing' },
  { type: 'config', partialMatch: false, pattern: 'packages/config' },
  { type: 'web', partialMatch: false, pattern: 'apps/web' },
  { type: 'worker', partialMatch: false, pattern: 'apps/worker' },
];

/** File categories accumulate; every source file gets `source` so `noneOf` queries work. */
/** @type {import('eslint-plugin-boundaries').FileDescriptor[]} */
export const files = [
  { category: 'source', pattern: '**/*.{ts,tsx,js,mjs}' },
  { category: 'test', pattern: '**/*.test.ts' },
  { category: 'test', pattern: '**/e2e/**' },
  { category: 'module-index', pattern: `${MODULES}/*/index.ts` },
  { category: 'module-di', pattern: `${MODULES}/*/di.ts` },
  { category: 'core-entry', pattern: `${CORE}/index.ts` },
];

const sameModule = { module: '{{ from.element.captured.module }}' };
const layer = (name) => ({
  element: { type: 'module-layer', captured: { ...sameModule, layer: name } },
});
const anyLayerOfSameModule = { element: { type: 'module-layer', captured: sameModule } };
const sameModuleDi = {
  element: { type: 'module', captured: sameModule },
  file: { categories: 'module-di' },
};
const sharedDomain = { element: { type: 'shared-domain' } };
const corePlatform = { element: { type: 'core-platform' } };
const coreEntry = { element: { type: 'core-platform' }, file: { categories: 'core-entry' } };
const moduleIndex = { element: { type: 'module' }, file: { categories: 'module-index' } };
const moduleDi = { element: { type: 'module' }, file: { categories: 'module-di' } };

const anything = { element: { type: '*' } };

/**
 * A zone: everything from `from` is denied with a "how to fix" message, then `allow` re-opens
 * the permitted targets. The last matching policy wins, so a violation reports this message.
 * @returns {import('eslint-plugin-boundaries').DependenciesPolicy[]}
 */
const zone = (from, allow, message) => [
  { from, disallow: { to: anything }, message },
  { from, allow: allow.map((to) => ({ to })) },
];

/** @type {import('eslint-plugin-boundaries').DependenciesPolicy[]} */
export const policies = [
  // shared/domain is the bottom layer: pure primitives (Money, Clock, Result, IDs).
  ...zone(
    sharedDomain,
    [sharedDomain],
    'shared/domain must stay pure and depend only on shared/domain. Fix: move the code that needs "{{ to.element.types.[0] }}" out of shared/domain (e.g. to shared/infrastructure).',
  ),

  // Rule 1: domain/ imports only its own domain/ and shared/domain.
  ...zone(
    layer('domain'),
    [layer('domain'), sharedDomain],
    'domain/ of module "{{ from.element.captured.module }}" may import only its own domain/ and packages/core/src/shared/domain (spec §2.4 rule 1); this import reaches "{{ to.element.types.[0] }}". ' +
      'Fix: keep domain pure — take values (e.g. `now: Temporal.Instant`) as parameters, define a port (interface) in domain/ and implement it in infrastructure/, or move this logic to application/.',
  ),

  // Rule 2: application/ imports domain/ (including ports), never adapters.
  ...zone(
    layer('application'),
    [layer('domain'), layer('application'), sharedDomain, moduleIndex],
    'application/ of module "{{ from.element.captured.module }}" may import only its domain/ (incl. ports), shared/domain and other modules\' index.ts — never infrastructure/ adapters or platform code (spec §2.4 rule 2). ' +
      'Fix: depend on a port interface from domain/ and let di.ts inject the adapter.',
  ),

  // Adapters and entry points of a module.
  ...zone(
    [layer('infrastructure'), layer('jobs'), layer('api'), layer('migrations')],
    [
      anyLayerOfSameModule,
      sharedDomain,
      corePlatform,
      moduleIndex,
      { element: { type: 'contracts' } },
    ],
    'Module "{{ from.element.captured.module }}" internals may import their own module, shared code, contracts and other modules\' index.ts only (spec §2.4 rule 3). ' +
      'Fix: import other modules through modules/<module>/index.ts.',
  ),

  // index.ts exposes the module, di.ts wires it.
  ...zone(
    { element: { type: 'module' } },
    [anyLayerOfSameModule, sameModuleDi, sharedDomain, corePlatform, moduleIndex],
    'Module "{{ from.element.captured.module }}" root files may import only their own module, shared code and other modules\' index.ts. Fix: import other modules through modules/<module>/index.ts.',
  ),

  // Rule 3: another module's internals are never reachable.
  {
    from: { element: { types: { anyOf: ['module', 'module-layer'] } } },
    disallow: {
      to: {
        element: {
          type: 'module-layer',
          captured: { module: '!{{ from.element.captured.module }}' },
        },
      },
    },
    message:
      'Module "{{ from.element.captured.module }}" must not reach into module "{{ to.element.captured.module }}" internals (spec §2.4 rule 3). ' +
      'Fix: import from modules/{{ to.element.captured.module }}/index.ts, or react to its domain event instead of calling it.',
  },

  // Core platform code (container, config, logger, db) wires modules together.
  ...zone(
    corePlatform,
    [corePlatform, sharedDomain, moduleIndex, moduleDi],
    'Core platform code may use module public APIs (index.ts) and di.ts only (spec §2.4 rule 3). Fix: export what you need from modules/{{ to.element.captured.module }}/index.ts.',
  ),

  // Rule 4: apps use only module public APIs, the core entry, contracts and ui.
  ...zone(
    { element: { types: { anyOf: ['web', 'worker'] } } },
    [
      { element: { type: '{{ from.element.types.[0] }}' } },
      coreEntry,
      moduleIndex,
      { element: { type: 'contracts' } },
      { element: { type: 'ui' } },
    ],
    'Apps may import only @kompas/core, module public APIs (@kompas/core/<module> = modules/<module>/index.ts), @kompas/contracts and @kompas/ui (spec §2.4 rule 4). ' +
      'This import reaches "{{ to.element.types.[0] }}" internals ({{ to.element.fileInternalPath }}). ' +
      'Fix: export the command, query or type you need from modules/<module>/index.ts and import it via @kompas/core/<module>. Never touch entities or the EntityManager from apps.',
  ),

  ...zone(
    { element: { type: 'contracts' } },
    [{ element: { type: 'contracts' } }],
    'packages/contracts holds only zod schemas and oRPC contracts and must not depend on "{{ to.element.types.[0] }}". Fix: move shared schemas into contracts instead of importing implementation code.',
  ),
  ...zone(
    { element: { type: 'ui' } },
    [{ element: { type: 'ui' } }],
    'packages/ui contains presentational components only and must not depend on "{{ to.element.types.[0] }}". Fix: pass data in through props from apps/web.',
  ),

  // Tooling presets (tsconfig, Vitest) are available to every package.
  { allow: { to: { element: { type: 'config' } } } },

  // Tests may import anything, including @kompas/testing.
  { from: { file: { categories: 'test' } }, allow: { to: anything } },

  // Production code never imports tests or the testing package.
  {
    from: { element: { type: '!testing' }, file: { categories: { noneOf: ['test'] } } },
    disallow: [{ to: { file: { categories: 'test' } } }, { to: { element: { type: 'testing' } } }],
    message:
      'Production code must not import tests or @kompas/testing. Fix: move the helper into the package that needs it, or use it only in *.test.ts files.',
  },
];

export const defaultMessage =
  'Import from "{{ from.element.types.[0] }}" to "{{ to.element.types.[0] }}" breaks the module rules of spec §2.4. ' +
  'Fix: import other modules through their public index.ts (@kompas/core/<module>), keep domain/ pure, and wire adapters in di.ts.';

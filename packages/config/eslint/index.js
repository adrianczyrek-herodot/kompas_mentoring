// Shared ESLint flat config for the Kompas monorepo (spec §2.4, §6.1).
import js from '@eslint/js';
import nextPlugin from '@next/eslint-plugin-next';
import { defineConfig } from 'eslint/config';
import boundaries from 'eslint-plugin-boundaries';
import reactHooks from 'eslint-plugin-react-hooks';
import globals from 'globals';
import tseslint from 'typescript-eslint';
import { defaultMessage, elements, files, policies } from './boundaries.js';

const DOMAIN_FILES = ['**/domain/**/*.ts'];

/** Bans non-deterministic APIs in domain code: time and randomness come from Clock / ports (§4.1). */
const domainPurity = [
  {
    selector: "NewExpression[callee.name='Date']",
    message:
      'new Date() is banned in domain/** (spec §4.1). Fix: accept `now: Temporal.Instant` as a parameter, or inject Clock in application/.',
  },
  {
    selector: "CallExpression[callee.object.name='Date'][callee.property.name='now']",
    message:
      'Date.now() is banned in domain/** (spec §4.1). Fix: accept `now: Temporal.Instant` as a parameter, or inject Clock in application/.',
  },
  {
    selector: "CallExpression[callee.object.name='Math'][callee.property.name='random']",
    message:
      'Math.random() is banned in domain/** — domain must be deterministic. Fix: inject the random source through a port.',
  },
  {
    selector: "MemberExpression[object.name='Temporal'][property.name='Now']",
    message:
      'Temporal.Now is banned in domain/** (spec §4.10). Fix: accept `now: Temporal.Instant` as a parameter, or inject Clock in application/.',
  },
  {
    selector: "VariableDeclarator[init.name='Temporal'] > ObjectPattern > Property[key.name='Now']",
    message:
      'Destructuring Temporal.Now is banned in domain/** (spec §4.10). Fix: accept `now: Temporal.Instant` as a parameter, or inject Clock in application/.',
  },
  {
    selector: "CallExpression[callee.object.name='performance'][callee.property.name='now']",
    message:
      'performance.now() is banned in domain/** — domain must be deterministic. Fix: accept time as a parameter or inject Clock in application/.',
  },
  {
    selector:
      "CallExpression[callee.object.name='crypto'][callee.property.name=/^(randomUUID|getRandomValues)$/]",
    message:
      'crypto randomness is banned in domain/** — domain must be deterministic. Fix: pass IDs in from application/ (newId) or inject a random source through a port.',
  },
];

/** Money amounts are never plain numbers inside core (spec §6.1, §6.3). */
const moneyAsNumber = [
  {
    selector:
      'TSPropertySignature[key.name=/(amount|price)$/i] > TSTypeAnnotation > TSNumberKeyword, PropertyDefinition[key.name=/(amount|price)$/i] > TSTypeAnnotation > TSNumberKeyword',
    message:
      'Money fields must not be typed as number (spec §6.3). Fix: use the Money type from shared/domain (bigint grosze); convert to number only in packages/contracts.',
  },
];

/**
 * @param {{ tsconfigRootDir: string }} options
 * @returns {import('eslint').Linter.Config[]}
 */
export function kompasEslintConfig({ tsconfigRootDir }) {
  return defineConfig(
    {
      ignores: [
        '**/node_modules/**',
        '**/.next/**',
        '**/.turbo/**',
        '**/dist/**',
        '**/coverage/**',
        '**/playwright-report/**',
        '**/test-results/**',
        '**/next-env.d.ts',
        'packages/config/**/*.d.ts',
        'kompas-mentoring/**',
        '.ai/**',
      ],
    },
    js.configs.recommended,
    {
      files: ['**/*.{ts,tsx}'],
      extends: [...tseslint.configs.strictTypeChecked, ...tseslint.configs.stylisticTypeChecked],
      languageOptions: {
        parserOptions: { projectService: true, tsconfigRootDir },
      },
      rules: {
        '@typescript-eslint/no-explicit-any': 'error',
        '@typescript-eslint/no-floating-promises': 'error',
        '@typescript-eslint/no-misused-promises': 'error',
        '@typescript-eslint/switch-exhaustiveness-check': [
          'error',
          { considerDefaultExhaustiveForUnions: false, requireDefaultForNonUnion: true },
        ],
        '@typescript-eslint/consistent-type-imports': [
          'error',
          { prefer: 'type-imports', fixStyle: 'separate-type-imports' },
        ],
        '@typescript-eslint/consistent-type-definitions': 'off',
        '@typescript-eslint/restrict-template-expressions': ['error', { allowNumber: true }],
        'no-console': 'error',
        'no-empty': ['error', { allowEmptyCatch: false }],
        'max-lines': ['warn', { max: 300, skipBlankLines: true, skipComments: true }],
        'max-lines-per-function': ['warn', { max: 40, skipBlankLines: true, skipComments: true }],
      },
    },
    {
      // Plain JS config files are not part of any tsconfig project.
      files: ['**/*.{js,mjs,cjs}'],
      extends: [tseslint.configs.disableTypeChecked],
      languageOptions: { globals: globals.node },
    },
    {
      files: ['**/*.test.ts', '**/e2e/**/*.ts'],
      rules: { 'max-lines-per-function': 'off' },
    },

    // --- Architecture (spec §2.4) ---
    {
      files: ['apps/**/*.{ts,tsx}', 'packages/**/*.{ts,tsx}'],
      plugins: { boundaries },
      settings: {
        'import/resolver': {
          typescript: {
            alwaysTryTypes: true,
            noWarnOnMultipleProjects: true,
            project: ['apps/*/tsconfig.json', 'packages/*/tsconfig.json'],
          },
        },
        'boundaries/elements': elements,
        'boundaries/files': files,
        'boundaries/include': ['apps/**/*', 'packages/**/*'],
      },
      rules: {
        'boundaries/dependencies': [
          'error',
          { default: 'disallow', message: defaultMessage, policies },
        ],
      },
    },
    {
      // Deep imports into core bypass package exports; catch them even when they do not resolve.
      files: ['apps/**/*.{ts,tsx}', 'packages/{contracts,ui,testing}/**/*.{ts,tsx}'],
      rules: {
        'no-restricted-imports': [
          'error',
          {
            patterns: [
              {
                regex: '(^@kompas/core/(src|modules)/|packages/core/src/)',
                message:
                  'Deep imports into packages/core are forbidden (spec §2.4 rule 4). Fix: import from "@kompas/core" or a module public API "@kompas/core/<module>" (modules/<module>/index.ts); add the export there if it is missing.',
              },
            ],
          },
        ],
      },
    },
    {
      files: ['packages/core/src/**/*.ts'],
      rules: { 'no-restricted-syntax': ['error', ...moneyAsNumber] },
    },
    {
      files: DOMAIN_FILES,
      ignores: ['**/*.test.ts'],
      rules: {
        'no-restricted-syntax': ['error', ...moneyAsNumber, ...domainPurity],
        'no-restricted-imports': [
          'error',
          {
            patterns: [
              {
                // Domain may use only pure libraries; everything else is I/O or framework code.
                regex: '^(?!\\.|temporal-polyfill$|neverthrow$|zod$|dinero\\.js(/.*)?$|uuid$)',
                message:
                  'domain/** may import only relative domain files and pure libraries (temporal-polyfill, neverthrow, zod, dinero.js, uuid) — spec §2.4 rule 1. Fix: define a port in domain/ and implement it in infrastructure/.',
              },
            ],
          },
        ],
      },
    },

    // --- Next.js app ---
    {
      files: ['apps/web/**/*.{ts,tsx}', 'packages/ui/**/*.{ts,tsx}'],
      plugins: { '@next/next': nextPlugin, 'react-hooks': reactHooks },
      settings: { next: { rootDir: 'apps/web/' } },
      rules: {
        ...nextPlugin.configs.recommended.rules,
        ...nextPlugin.configs['core-web-vitals'].rules,
        'react-hooks/rules-of-hooks': 'error',
        'react-hooks/exhaustive-deps': 'error',
      },
    },
  );
}

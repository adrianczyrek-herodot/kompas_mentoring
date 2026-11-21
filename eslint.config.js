import { kompasEslintConfig } from '@kompas/config/eslint';

export default [
  ...kompasEslintConfig({ tsconfigRootDir: import.meta.dirname }),
  // Review engine vendored from om-ux-design and the comments.js it exports: browser scripts kept
  // as delivered (reviewers replace comments.js wholesale), not project code.
  { ignores: ['prototypes/*/public/review/**'] },
];

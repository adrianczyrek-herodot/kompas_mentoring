import { create } from 'storybook/theming';

// Storybook chrome shows only the product name (rule 10). Colours of the chrome itself are
// Storybook UI, not product UI, so they live here and not in tokens.css.
export const kompasTheme = create({
  base: 'light',
  brandTitle: 'Kompas — system projektowy',
  brandTarget: '_self',
  fontBase: '"IBM Plex Sans", system-ui, sans-serif',
  fontCode: '"IBM Plex Mono", ui-monospace, monospace',
});

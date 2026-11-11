import type { Decorator, Preview } from '@storybook/react-vite';
import { GLOBALS_UPDATED, SET_GLOBALS } from 'storybook/internal/core-events';
import { addons } from 'storybook/preview-api';
import './storybook.css';
import './preview.css';

type Theme = 'light' | 'dark';

// Set by vitest.config.ts so the story tests run once per theme (`test:stories:themes`).
declare const __KOMPAS_TEST_THEME__: string | undefined;
const testTheme: Theme | undefined =
  typeof __KOMPAS_TEST_THEME__ === 'string' && __KOMPAS_TEST_THEME__ === 'dark'
    ? 'dark'
    : typeof __KOMPAS_TEST_THEME__ === 'string' && __KOMPAS_TEST_THEME__ === 'light'
      ? 'light'
      : undefined;

// Rule 9: the theme lives on <html>, so portalled dialogs, menus and popovers inherit it.
function applyTheme(value: unknown): void {
  const theme: Theme = testTheme ?? (value === 'dark' ? 'dark' : 'light');
  const root = document.documentElement;
  root.classList.toggle('dark', theme === 'dark');
  root.dataset['theme'] = theme;
}

// MDX pages without stories never run decorators, so follow the toolbar through the channel too.
type GlobalsEvent = { globals?: Record<string, unknown> };
const channel = addons.getChannel();
const onGlobals = (event: GlobalsEvent): void => {
  applyTheme(event.globals?.['theme']);
};
channel.on(SET_GLOBALS, onGlobals);
channel.on(GLOBALS_UPDATED, onGlobals);

const withTheme: Decorator = (Story, context) => {
  applyTheme(context.globals['theme']);
  return <Story />;
};

const preview: Preview = {
  globalTypes: {
    theme: {
      description: 'Motyw',
      toolbar: {
        title: 'Motyw',
        icon: 'contrast',
        items: [
          { value: 'light', title: 'Jasny', icon: 'sun' },
          { value: 'dark', title: 'Ciemny', icon: 'moon' },
        ],
        dynamicTitle: true,
      },
    },
  },
  initialGlobals: { theme: testTheme ?? 'light' },
  decorators: [withTheme],
  parameters: {
    layout: 'padded',
    // Accessibility violations fail the story tests (prompt, stage 1).
    a11y: { test: 'error' },
    controls: { expanded: true, sort: 'requiredFirst' },
    docs: { toc: { headingSelector: 'h2, h3' } },
    viewport: {
      options: {
        mobile320: { name: 'Telefon 320 px', styles: { width: '320px', height: '640px' } },
        tablet768: { name: 'Tablet 768 px', styles: { width: '768px', height: '1024px' } },
        desktop1440: { name: 'Komputer 1440 px', styles: { width: '1440px', height: '900px' } },
      },
    },
    options: {
      storySort: {
        order: [
          'System projektowy',
          [
            'Zacznij tutaj',
            'Komponenty',
            'Jak wybrać',
            'Użycie i dostępność',
            'Treść',
            'Czego unikać',
            'Czego brakuje',
            'Jak zmieniać system',
          ],
          'Podstawy',
          ['Kolor', 'Typografia', 'Odstępy i układ', 'Kształt i głębia', 'Ruch', 'Ikony', 'Motywy'],
          'Komponenty bazowe',
          'Produkt',
          'Wzorce',
        ],
      },
    },
  },
};

export default preview;

import type { Decorator } from '@storybook/react-vite';
import { ToastProvider } from '../../src/index';

/** Toast region for pattern and screen stories (labels come from messages/pl.json in the app). */
export const withToasts: Decorator = (Story) => (
  <ToastProvider closeLabel="Zamknij powiadomienie" regionLabel="Powiadomienia">
    {Story()}
  </ToastProvider>
);

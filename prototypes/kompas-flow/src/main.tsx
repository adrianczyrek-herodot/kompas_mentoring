import { ToastProvider, TooltipProvider } from '@kompas/ui';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { App } from './app';
import { interceptAppLinks } from './lib/router';
import { installEngineAdapter } from './review/engine-adapter';
import { DemoProvider } from './state/demo-context';
import './styles.css';

installEngineAdapter();

const container = document.getElementById('root');
if (!container) throw new Error('#root missing in index.html');
interceptAppLinks(document.body);

createRoot(container).render(
  <StrictMode>
    <DemoProvider>
      <TooltipProvider>
        <ToastProvider closeLabel="Zamknij powiadomienie" regionLabel="Powiadomienia">
          <App />
        </ToastProvider>
      </TooltipProvider>
    </DemoProvider>
  </StrictMode>,
);

import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

// Initialize demo "now" time
const DEMO_NOW = new Date('2026-10-20T14:00:00+02:00');

// Expose for debugging (components import DEMO_NOW from utils/types)
(window as any).__DEMO_NOW__ = DEMO_NOW;

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

// Initialize demo "now" time
const DEMO_NOW = new Date('2026-10-20T14:00:00+02:00');

// Mock Date.now for consistent demo time (only for prototype)
const originalDateNow = Date.now;
const originalDate = global.Date;
const originalSetTimeout = global.setTimeout;
const originalSetInterval = global.setInterval;

(global as any).__DEMO_NOW__ = DEMO_NOW;

// We don't actually override Date.now globally as it breaks React internals
// Instead, components import DEMO_NOW from utils/types

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
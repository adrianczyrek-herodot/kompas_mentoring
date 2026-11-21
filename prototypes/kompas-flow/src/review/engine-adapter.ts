/**
 * Bridge between the vendored review engine (public/review/prototype.js, DOM-based) and this
 * single-page app. The engine expects every screen as a `.screen` section; here only the current
 * screen is mounted, so it asks the host how to navigate, go back and name unmounted screens.
 */
import { canGoBack, goBack, navigate } from '../lib/router';
import { screenById } from '../screens/registry';

type EngineAdapter = {
  hasScreen: (id: string) => boolean;
  screenTitle: (id: string) => string;
  navigate: (id: string) => void;
  back: () => void;
  canGoBack: () => boolean;
};

declare global {
  interface Window {
    __OM_PROTOTYPE_ADAPTER__?: EngineAdapter;
    __OM_PROTOTYPE__?: { refresh: () => void };
  }
}

export function installEngineAdapter(): void {
  window.__OM_PROTOTYPE_ADAPTER__ = {
    hasScreen: (id) => screenById(id) !== undefined,
    screenTitle: (id) => {
      const screen = screenById(id);
      return screen ? `${screen.id} · ${screen.name}` : id;
    },
    navigate: (id) => {
      const screen = screenById(id);
      if (screen) navigate(screen.sample);
    },
    back: goBack,
    canGoBack,
  };
}

/** Re-draws comment pins and the „Back” state after React has painted a new screen. */
export function refreshEngine(): void {
  window.requestAnimationFrame(() => {
    window.__OM_PROTOTYPE__?.refresh();
  });
}

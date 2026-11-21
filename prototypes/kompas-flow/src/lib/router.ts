/**
 * Hash router (`#/mentorzy/m1?temat=React`). Hash routes work both from `vite dev` and from the
 * static copy inside the built Storybook, where there is no server-side fallback.
 */
import { useSyncExternalStore } from 'react';
import { SCREENS, type ScreenDef } from '../screens/registry';

export type Route = {
  path: string;
  query: URLSearchParams;
  screen: ScreenDef | undefined;
  params: Record<string, string>;
};

function currentHash(): string {
  return window.location.hash.replace(/^#/, '') || '/';
}

function match(pattern: string, path: string): Record<string, string> | null {
  const want = pattern.split('/').filter(Boolean);
  const got = path.split('/').filter(Boolean);
  if (want.length !== got.length) return null;
  const params: Record<string, string> = {};
  for (const [index, part] of want.entries()) {
    const value = got[index] ?? '';
    if (part.startsWith(':')) params[part.slice(1)] = decodeURIComponent(value);
    else if (part !== value) return null;
  }
  return params;
}

export function parseRoute(hash: string): Route {
  const [rawPath = '/', rawQuery = ''] = hash.split('?');
  const path = rawPath || '/';
  for (const screen of SCREENS) {
    for (const pattern of screen.paths) {
      const params = match(pattern, path);
      if (params) return { path, query: new URLSearchParams(rawQuery), screen, params };
    }
  }
  return { path, query: new URLSearchParams(rawQuery), screen: undefined, params: {} };
}

// Visited hashes, so „Back” knows whether there is somewhere to go (browser history.length counts
// pages from before the prototype too).
const visited: string[] = [currentHash()];
const listeners = new Set<() => void>();

window.addEventListener('hashchange', () => {
  const hash = currentHash();
  if (visited.at(-2) === hash) visited.pop();
  else visited.push(hash);
  for (const listener of listeners) listener();
});

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function useHash(): string {
  return useSyncExternalStore(subscribe, currentHash);
}

export function navigate(to: string): void {
  const target = to.startsWith('#') ? to : `#${to}`;
  if (window.location.hash !== target) window.location.hash = target;
}

/** Same screen, new query (filters): replaces the history entry instead of adding one. */
export function replace(to: string): void {
  const target = to.startsWith('#') ? to : `#${to}`;
  window.history.replaceState(null, '', target);
  visited[visited.length - 1] = currentHash();
  for (const listener of listeners) listener();
}

export function canGoBack(): boolean {
  return visited.length > 1;
}

export function goBack(): void {
  if (canGoBack()) window.history.back();
}

/** Hash href for an app path: `href('/sesje')` → `#/sesje`. */
export function href(path: string): string {
  return `#${path}`;
}

/** Path with a query string, skipping empty values. */
export function withQuery(path: string, query: Record<string, string | undefined>): string {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(query)) if (value) params.set(key, value);
  const text = params.toString();
  return text ? `${path}?${text}` : path;
}

/**
 * @kompas/ui renders some links with app paths (`AppHeader`: `href="/sesje"`) and no render prop.
 * Inside the prototype those clicks are turned into hash navigation instead of a page load.
 */
export function interceptAppLinks(root: HTMLElement): () => void {
  const onClick = (event: MouseEvent) => {
    if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey) return;
    const anchor = (event.target as Element | null)?.closest('a');
    const target = anchor?.getAttribute('href');
    if (!target?.startsWith('/') || target.startsWith('//')) return;
    event.preventDefault();
    navigate(target);
  };
  root.addEventListener('click', onClick);
  return () => {
    root.removeEventListener('click', onClick);
  };
}

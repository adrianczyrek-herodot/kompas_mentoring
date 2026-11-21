// Hash-based router for the prototype

import type { ScreenDefinition, ScreenId, Role } from './types';
import { SCREENS, DEFAULT_ROUTE } from './types';

export interface RouteMatch {
  screen: ScreenDefinition;
  params: Record<string, string>;
  query: URLSearchParams;
}

export function parseHash(): { path: string; query: URLSearchParams } {
  const raw = window.location.hash.replace(/^#/, '') || '/';
  const [path, qs] = raw.split('?');
  return { path: path || '/', query: new URLSearchParams(qs ?? '') };
}

export function matchRoute(path: string): RouteMatch | null {
  const parts = path.split('/').filter(Boolean);
  
  for (const screen of SCREENS) {
    const patternParts = screen.pattern.split('/').filter(Boolean);
    if (patternParts.length !== parts.length) continue;
    
    const params: Record<string, string> = {};
    let matched = true;
    
    for (let i = 0; i < patternParts.length; i++) {
      const pattern = patternParts[i];
      const part = parts[i];
      
      if (pattern.startsWith(':')) {
        params[pattern.slice(1)] = decodeURIComponent(part);
      } else if (pattern !== part) {
        matched = false;
        break;
      }
    }
    
    if (matched) {
      return { screen, params, query: new URLSearchParams() };
    }
  }
  
  return null;
}

export function canAccess(screen: ScreenDefinition, role: Role): boolean {
  if (screen.access === 'public') return true;
  if (screen.access === 'auth') return role !== 'guest';
  return screen.access === role;
}

export function getRedirectPath(screen: ScreenDefinition, role: Role): string {
  if (role === 'guest') {
    return `#/logowanie?returnTo=${encodeURIComponent(`#${screen.path}`)}`;
  }
  if (screen.access !== 'public' && screen.access !== 'auth' && screen.access !== role) {
    return DEFAULT_ROUTE[role];
  }
  return `#${screen.path}`;
}

export function navigate(path: string): void {
  window.location.hash = path;
}

export function goBack(): void {
  window.history.back();
}

export function getCurrentScreenId(): ScreenId | null {
  const { path } = parseHash();
  const match = matchRoute(path);
  return match?.screen.id ?? null;
}

export function buildPath(screenId: ScreenId, params: Record<string, string> = {}): string {
  const screen = SCREENS.find(s => s.id === screenId);
  if (!screen) return '/';
  
  let path = screen.pattern;
  for (const [key, value] of Object.entries(params)) {
    path = path.replace(`:${key}`, encodeURIComponent(value));
  }
  return `#${path}`;
}
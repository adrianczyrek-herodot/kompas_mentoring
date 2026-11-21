/**
 * Review-bar controls (outside the product, task rule 5): screen picker and demo account switch.
 * Rendered through a portal into #review-controls of index.html, next to the engine's own modes.
 */
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@kompas/ui';
import { useEffect, useId } from 'react';
import { createPortal } from 'react-dom';
import { ACCOUNTS, NEW_STUDENT } from '../data/accounts';
import { navigate } from '../lib/router';
import { SCREENS, type ScreenDef } from '../screens/registry';
import { useDemo } from '../state/demo-context';
import { ScenarioMenu } from './scenario-menu';

function useThemeToggle() {
  useEffect(() => {
    const button = document.getElementById('theme-toggle');
    if (!button) return;
    const root = document.documentElement;
    const sync = () => {
      button.textContent = root.classList.contains('dark') ? 'Motyw: ciemny' : 'Motyw: jasny';
      button.setAttribute('aria-pressed', String(root.classList.contains('dark')));
    };
    const toggle = () => {
      root.classList.toggle('dark');
      sync();
    };
    sync();
    button.addEventListener('click', toggle);
    return () => {
      button.removeEventListener('click', toggle);
    };
  }, []);
}

function ScreenPicker({ current }: { current: ScreenDef | undefined }) {
  const id = useId();
  const items = SCREENS.map((screen) => ({
    value: screen.id,
    label: `${screen.id} · ${screen.name}`,
  }));
  return (
    <div className="flex items-center gap-tight">
      <label htmlFor={id} className="text-label text-text-muted">
        Ekran
      </label>
      <Select
        items={items}
        value={current?.id ?? null}
        onValueChange={(value) => {
          const screen = SCREENS.find((s) => s.id === value);
          if (screen) navigate(screen.sample);
        }}
      >
        <SelectTrigger id={id} className="min-h-control-sm w-56">
          <SelectValue placeholder="Nieznany adres" />
        </SelectTrigger>
        <SelectContent>
          {items.map((item) => (
            <SelectItem key={item.value} value={item.value}>
              {item.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}

function AccountPicker() {
  const id = useId();
  const { state, dispatch } = useDemo();
  const accounts = state.accountId === 'new' ? [...ACCOUNTS, NEW_STUDENT] : ACCOUNTS;
  const items = accounts.map((account) => ({
    value: account.id,
    label: account.id === 'new' ? state.newStudentName : account.name,
  }));
  return (
    <div className="flex items-center gap-tight">
      <label htmlFor={id} className="text-label text-text-muted">
        Konto demo
      </label>
      <Select
        items={items}
        value={state.accountId}
        onValueChange={(value) => {
          if (value) dispatch({ type: 'switch-account', accountId: value });
        }}
      >
        <SelectTrigger id={id} className="min-h-control-sm w-60">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {accounts.map((account) => (
            <SelectItem key={account.id} value={account.id}>
              {account.id === 'new' ? state.newStudentName : account.name} — {account.purpose}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}

export function ReviewBar({ current }: { current: ScreenDef | undefined }) {
  useThemeToggle();
  const host = document.getElementById('review-controls');
  if (!host) return null;
  return createPortal(
    <>
      <ScreenPicker current={current} />
      <AccountPicker />
      <ScenarioMenu />
    </>,
    host,
  );
}

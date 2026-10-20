// Widoki mockupu jako stringi HTML (warstwa przejściowa — ekrany są stopniowo przepisywane na React).
import { DEMO_NOW as NOW } from '@devmentor/db/fixtures';
import { initials } from '@devmentor/ui/lib/format';
import { ICON_PATHS } from '@devmentor/ui/lib/icons';

export { dayShort, fmtDate, fmtDateLong, fmtTime, initials, money, weekday } from '@devmentor/ui/lib/format';

export type ViewState = 'success' | 'loading' | 'empty' | 'error';

export interface Ctx {
  params: Record<string, string>;
  query: URLSearchParams;
  state: ViewState;
  rerender: () => void;
}

export interface View {
  html: string;
  bind?: (root: HTMLElement) => void;
}

export const esc = (s: unknown): string =>
  String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]!));

export const hoursUntil = (iso: string): number => (new Date(iso).getTime() - NOW.getTime()) / 36e5;

export const avatar = (name: string, hue: number, size = 44): string =>
  `<span class="avatar" style="--h:${hue};--s:${size}px" aria-hidden="true">${esc(initials(name))}</span>`;

export const stars = (r: number): string =>
  r > 0 ? `<span class="rating"><span class="star">★</span> ${r.toFixed(1)}</span>` : `<span class="badge badge--new">Nowy</span>`;

export const icon = (name: string): string =>
  `<svg class="ic" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${ICON_PATHS[name] ?? ''}</svg>`;

// ---- Stany ekranu ----------------------------------------------------------

export const skeleton = (rows = 3, kind: 'card' | 'line' = 'card'): string =>
  `<div class="skeleton-wrap" aria-busy="true" aria-label="Wczytywanie">${Array.from({ length: rows },
    () => (kind === 'card' ? '<div class="sk sk--card"></div>' : '<div class="sk sk--line"></div>')).join('')}</div>`;

export const emptyState = (title: string, text: string, cta = ''): string =>
  `<div class="state state--empty">${icon('target')}<h3>${esc(title)}</h3><p>${esc(text)}</p>${cta}</div>`;

export const errorState = (text = 'Nie udało się wczytać danych.'): string =>
  `<div class="state state--error" role="alert">${icon('alert')}<h3>Coś poszło nie tak</h3><p>${esc(text)}</p>
   <button class="btn btn--ghost" data-retry>Spróbuj ponownie</button></div>`;

export function states(
  ctx: Ctx,
  v: { success: () => string; loading?: () => string; empty?: () => string; error?: () => string },
): string {
  switch (ctx.state) {
    case 'loading': return v.loading ? v.loading() : skeleton(3);
    case 'empty': return v.empty ? v.empty() : v.success();
    case 'error': return v.error ? v.error() : errorState();
    default: return v.success();
  }
}

// ---- Toast i modal ---------------------------------------------------------

export function toast(msg: string, kind: 'ok' | 'err' = 'ok'): void {
  const el = document.createElement('div');
  el.className = `toast toast--${kind}`;
  el.setAttribute('role', 'status');
  el.textContent = msg;
  document.body.appendChild(el);
  setTimeout(() => el.classList.add('toast--out'), 2600);
  setTimeout(() => el.remove(), 3000);
}

export function openModal(html: string, bind?: (m: HTMLElement) => void): HTMLElement {
  closeModal();
  const wrap = document.createElement('div');
  wrap.className = 'modal-backdrop';
  wrap.innerHTML = `<div class="modal" role="dialog" aria-modal="true">
    <button class="modal__close" data-close aria-label="Zamknij">${icon('x')}</button>${html}</div>`;
  wrap.addEventListener('click', (e) => {
    const t = e.target as HTMLElement;
    if (t === wrap || t.closest('[data-close]')) closeModal();
  });
  document.body.appendChild(wrap);
  bind?.(wrap.querySelector('.modal') as HTMLElement);
  (wrap.querySelector('input,textarea,button:not([data-close])') as HTMLElement | null)?.focus();
  return wrap;
}

export function closeModal(): void {
  document.querySelector('.modal-backdrop')?.remove();
}

// ---- Walidacja formularzy --------------------------------------------------

export type Rule = (value: string, form: HTMLFormElement) => string | null;

export const req = (msg = 'To pole jest wymagane.'): Rule => (v) => (v.trim() ? null : msg);
export const len = (min: number, max: number): Rule => (v) => {
  const n = v.trim().length;
  if (n < min) return `Wpisz co najmniej ${min} znaków (teraz: ${n}).`;
  if (n > max) return `Maksymalnie ${max} znaków (teraz: ${n}).`;
  return null;
};
export const emailRule: Rule = (v) => (/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.trim()) ? null : 'Podaj poprawny adres e-mail.');
export const range = (min: number, max: number, unit = ''): Rule => (v) => {
  const n = Number(v);
  return Number.isFinite(n) && v !== '' && n >= min && n <= max ? null : `Podaj wartość od ${min} do ${max}${unit}.`;
};

export function validate(form: HTMLFormElement, rules: Record<string, Rule[]>): boolean {
  let ok = true;
  let first: HTMLElement | null = null;
  for (const [name, list] of Object.entries(rules)) {
    const field = form.elements.namedItem(name) as HTMLInputElement | HTMLTextAreaElement | RadioNodeList | null;
    let value = '';
    if (field instanceof RadioNodeList) value = field.value;
    else if (field && 'type' in field && field.type === 'checkbox') value = (field as HTMLInputElement).checked ? 'on' : '';
    else if (field) value = (field as HTMLInputElement).value;
    const err = list.map((r) => r(value, form)).find(Boolean) ?? null;
    const slot = form.querySelector(`[data-err="${name}"]`);
    if (slot) slot.textContent = err ?? '';
    const input = form.querySelector(`[name="${name}"]`) as HTMLElement | null;
    input?.setAttribute('aria-invalid', err ? 'true' : 'false');
    if (err) {
      ok = false;
      if (!first) first = input;
    }
  }
  (first as HTMLElement | null)?.focus();
  return ok;
}

export const field = (o: {
  name: string; label: string; type?: string; value?: string; placeholder?: string; hint?: string;
  textarea?: boolean; rows?: number; counter?: number; attrs?: string;
}): string => {
  const id = `f-${o.name}`;
  const control = o.textarea
    ? `<textarea id="${id}" name="${o.name}" rows="${o.rows ?? 4}" placeholder="${esc(o.placeholder ?? '')}" ${o.counter ? `data-counter="${o.counter}"` : ''} ${o.attrs ?? ''}>${esc(o.value ?? '')}</textarea>`
    : `<input id="${id}" name="${o.name}" type="${o.type ?? 'text'}" value="${esc(o.value ?? '')}" placeholder="${esc(o.placeholder ?? '')}" ${o.attrs ?? ''}/>`;
  return `<div class="field"><label for="${id}">${esc(o.label)}</label>${control}
    <div class="field__meta"><span class="field__err" data-err="${o.name}" aria-live="polite"></span>
    ${o.counter ? `<span class="field__count" data-count-for="${o.name}">${(o.value ?? '').length}/${o.counter}</span>` : o.hint ? `<span class="field__hint">${esc(o.hint)}</span>` : ''}</div></div>`;
};

export function bindCounters(root: HTMLElement): void {
  root.querySelectorAll<HTMLTextAreaElement>('[data-counter]').forEach((ta) => {
    const out = root.querySelector(`[data-count-for="${ta.name}"]`);
    const upd = () => { if (out) out.textContent = `${ta.value.length}/${ta.dataset.counter}`; };
    ta.addEventListener('input', upd);
    upd();
  });
}

export const go = (hash: string): void => { location.hash = hash; };

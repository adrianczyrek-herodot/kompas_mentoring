import { NOW } from './mocks';

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

const DAYS = ['pon', 'wt', 'śr', 'czw', 'pt', 'sob', 'nd'];
const DAYS_LONG = ['poniedziałek', 'wtorek', 'środa', 'czwartek', 'piątek', 'sobota', 'niedziela'];
const MONTHS = ['sty', 'lut', 'mar', 'kwi', 'maj', 'cze', 'lip', 'sie', 'wrz', 'paź', 'lis', 'gru'];

export const weekday = (d: Date): number => (d.getDay() + 6) % 7;
export const dayShort = (i: number): string => DAYS[i];
export const fmtDate = (iso: string | Date): string => {
  const d = new Date(iso);
  return `${DAYS[weekday(d)]}, ${d.getDate()} ${MONTHS[d.getMonth()]}`;
};
export const fmtDateLong = (iso: string | Date): string => {
  const d = new Date(iso);
  return `${DAYS_LONG[weekday(d)]}, ${d.getDate()} ${MONTHS[d.getMonth()]} ${d.getFullYear()}`;
};
export const fmtTime = (iso: string | Date): string => {
  const d = new Date(iso);
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
};
export const money = (n: number): string => `${n.toLocaleString('pl-PL')} zł`;
export const hoursUntil = (iso: string): number => (new Date(iso).getTime() - NOW.getTime()) / 36e5;

export const initials = (name: string): string =>
  name.split(/\s+/).map((p) => p[0]).slice(0, 2).join('').toUpperCase();

export const avatar = (name: string, hue: number, size = 44): string =>
  `<span class="avatar" style="--h:${hue};--s:${size}px" aria-hidden="true">${esc(initials(name))}</span>`;

export const stars = (r: number): string =>
  r > 0 ? `<span class="rating"><span class="star">★</span> ${r.toFixed(1)}</span>` : `<span class="badge badge--new">Nowy</span>`;

export const icon = (name: string): string => {
  const p: Record<string, string> = {
    search: '<circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/>',
    cal: '<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 10h18M8 3v4M16 3v4"/>',
    chat: '<path d="M4 5h16v11H8l-4 4z"/>',
    user: '<circle cx="12" cy="8" r="4"/><path d="M4 21c1-4 4-6 8-6s7 2 8 6"/>',
    chart: '<path d="M4 20V10M10 20V4M16 20v-7M22 20H2"/>',
    home: '<path d="M3 11 12 4l9 7v9h-6v-6H9v6H3z"/>',
    users: '<circle cx="9" cy="8" r="3.5"/><path d="M2 20c.8-3.5 3.4-5 7-5s6.2 1.5 7 5"/><path d="M16 4.5a3.5 3.5 0 0 1 0 7M18 15c2 .6 3.3 2.2 4 5"/>',
    wallet: '<rect x="3" y="6" width="18" height="14" rx="2"/><path d="M3 10h18M16 15h2"/>',
    bell: '<path d="M6 16V11a6 6 0 0 1 12 0v5l2 2H4z"/><path d="M10 20a2 2 0 0 0 4 0"/>',
    play: '<path d="M8 5v14l11-7z" fill="currentColor"/>',
    check: '<path d="m5 12 5 5L20 7"/>',
    shield: '<path d="M12 3 4 6v6c0 5 3.5 8 8 9 4.5-1 8-4 8-9V6z"/><path d="m9 12 2 2 4-4"/>',
    alert: '<path d="M12 3 2 21h20z"/><path d="M12 10v5M12 18h.01"/>',
    target: '<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1"/>',
    mic: '<rect x="9" y="3" width="6" height="11" rx="3"/><path d="M5 11a7 7 0 0 0 14 0M12 18v3"/>',
    cam: '<rect x="3" y="6" width="13" height="12" rx="2"/><path d="m16 10 5-3v10l-5-3"/>',
    screen: '<rect x="3" y="4" width="18" height="12" rx="2"/><path d="M8 20h8M12 16v4"/>',
    x: '<path d="M6 6l12 12M18 6 6 18"/>',
    arrow: '<path d="M5 12h14M13 6l6 6-6 6"/>',
    back: '<path d="M19 12H5M11 6l-6 6 6 6"/>',
    flag: '<path d="M5 21V4M5 4h11l-2 4 2 4H5"/>',
    map: '<path d="M9 4 3 6v14l6-2 6 2 6-2V4l-6 2z"/><path d="M9 4v14M15 6v14"/>',
  };
  return `<svg class="ic" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${p[name] ?? ''}</svg>`;
};

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

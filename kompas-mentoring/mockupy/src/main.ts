import { Role } from './mocks';
import { DEFAULT_ROUTE, applyDemoStudent, store } from './store';
import { Ctx, View, ViewState, closeModal, esc, icon } from './ui';
import { auth, home, profile, search } from './screens/public';
import { checkout, confirmation, pickSlot, plans, progress, review, room, sessionDetail, sessions } from './screens/student';
import { earnings, mentorCalendar, mentorDashboard, mentorStudent, mentorStudents, onboarding } from './screens/mentor';
import { disputes, verification } from './screens/admin';
import { account, messages, notifications, screenMap } from './screens/shared';

type Screen = (ctx: Ctx) => View;
type Access = 'public' | 'auth' | Role;

interface Route { pattern: string; id: string; title: string; access: Access; screen: Screen; bare?: boolean; }

const ROUTES: Route[] = [
  { pattern: '/', id: 'P1', title: 'Strona główna', access: 'public', screen: home },
  { pattern: '/mentorzy', id: 'P2', title: 'Wyszukiwarka mentorów', access: 'public', screen: search },
  { pattern: '/mentorzy/:id', id: 'P3', title: 'Profil mentora', access: 'public', screen: profile },
  { pattern: '/logowanie', id: 'P4', title: 'Logowanie', access: 'public', screen: (c) => auth({ ...c, params: { mode: 'logowanie' } }) },
  { pattern: '/rejestracja', id: 'P4', title: 'Rejestracja', access: 'public', screen: (c) => auth({ ...c, params: { mode: 'rejestracja' } }) },
  { pattern: '/rezerwacja/:mentorId', id: 'U1', title: 'Wybór terminu', access: 'public', screen: pickSlot },
  { pattern: '/rezerwacja/:mentorId/platnosc', id: 'U2', title: 'Checkout', access: 'student', screen: checkout },
  { pattern: '/potwierdzenie/:id', id: 'U3', title: 'Potwierdzenie rezerwacji', access: 'student', screen: confirmation },
  { pattern: '/sesje', id: 'U4', title: 'Moje sesje', access: 'student', screen: sessions },
  { pattern: '/sesje/:id', id: 'U5', title: 'Szczegóły sesji', access: 'student', screen: sessionDetail },
  { pattern: '/sesje/:id/pokoj', id: 'U6', title: 'Pokój sesji', access: 'auth', screen: room, bare: true },
  { pattern: '/sesje/:id/ocena', id: 'U7', title: 'Ocena sesji', access: 'student', screen: review },
  { pattern: '/plany', id: 'U8', title: 'Plany i saldo', access: 'student', screen: plans },
  { pattern: '/postepy', id: 'U9', title: 'Postępy', access: 'student', screen: progress },
  { pattern: '/wiadomosci', id: 'S1', title: 'Wiadomości', access: 'auth', screen: messages },
  { pattern: '/wiadomosci/:id', id: 'S1', title: 'Wiadomości', access: 'public', screen: messages },
  { pattern: '/powiadomienia', id: 'S2', title: 'Powiadomienia', access: 'auth', screen: notifications },
  { pattern: '/konto', id: 'S3', title: 'Konto i ustawienia', access: 'auth', screen: account },
  { pattern: '/mentor/onboarding/:step', id: 'M1', title: 'Onboarding mentora', access: 'public', screen: onboarding },
  { pattern: '/mentor', id: 'M2', title: 'Panel mentora', access: 'mentor', screen: mentorDashboard },
  { pattern: '/mentor/kalendarz', id: 'M3', title: 'Kalendarz i dostępność', access: 'mentor', screen: mentorCalendar },
  { pattern: '/mentor/uczniowie', id: 'M4', title: 'Uczniowie', access: 'mentor', screen: mentorStudents },
  { pattern: '/mentor/uczniowie/:id', id: 'M4', title: 'Uczeń', access: 'mentor', screen: mentorStudent },
  { pattern: '/mentor/zarobki', id: 'M5', title: 'Zarobki i wypłaty', access: 'mentor', screen: earnings },
  { pattern: '/admin/weryfikacja', id: 'A1', title: 'Weryfikacja mentorów', access: 'admin', screen: verification },
  { pattern: '/admin/spory', id: 'A2', title: 'Spory i zwroty', access: 'admin', screen: disputes },
  { pattern: '/mapa', id: '—', title: 'Mapa ekranów', access: 'public', screen: screenMap },
];

const ROLE_LABEL: Record<Role, string> = { guest: 'Gość', student: 'Uczeń', mentor: 'Mentor', admin: 'Admin' };

const NAV: Record<Role, [string, string, string][]> = {
  guest: [['#/mentorzy', 'Znajdź mentora', 'search'], ['#/mentor/onboarding/1', 'Zostań mentorem', 'user']],
  student: [['#/mentorzy', 'Szukaj', 'search'], ['#/sesje', 'Sesje', 'cal'], ['#/wiadomosci', 'Wiadomości', 'chat'], ['#/postepy', 'Postępy', 'target'], ['#/plany', 'Plany', 'wallet']],
  mentor: [['#/mentor', 'Panel', 'home'], ['#/mentor/kalendarz', 'Kalendarz', 'cal'], ['#/mentor/uczniowie', 'Uczniowie', 'users'], ['#/wiadomosci', 'Wiadomości', 'chat'], ['#/mentor/zarobki', 'Zarobki', 'wallet']],
  admin: [['#/admin/weryfikacja', 'Weryfikacja', 'shield'], ['#/admin/spory', 'Spory', 'flag']],
};

function match(path: string): { route: Route; params: Record<string, string> } | null {
  const parts = path.split('/').filter(Boolean);
  for (const route of ROUTES) {
    const rp = route.pattern.split('/').filter(Boolean);
    if (rp.length !== parts.length) continue;
    const params: Record<string, string> = {};
    if (rp.every((p, i) => (p.startsWith(':') ? ((params[p.slice(1)] = decodeURIComponent(parts[i])), true) : p === parts[i]))) return { route, params };
  }
  return null;
}

function parseHash(): { path: string; query: URLSearchParams } {
  const raw = location.hash.replace(/^#/, '') || '/';
  const [path, qs] = raw.split('?');
  const query = new URLSearchParams(qs ?? '');
  // ?state= w zwykłym adresie (index.html?state=error) też działa
  const outer = new URLSearchParams(location.search).get('state');
  if (outer && !query.get('state')) query.set('state', outer);
  return { path: path || '/', query };
}

const app = document.getElementById('app')!;
let navToken = 0;

function header(route: Route): string {
  const r = store.role;
  const unread = store.notifications.filter((n) => n.unread).length;
  const cur = location.hash.split('?')[0] || '#/';
  const navLinks = NAV[r].map(([href, label, ic]) =>
    `<a href="${href}" class="${cur === href || (href !== '#/mentor' && cur.startsWith(href)) ? 'is-active' : ''}">${icon(ic)}<span>${label}</span></a>`).join('');
  return `
  <div class="mockbar" role="region" aria-label="Pasek mockupu">
    <span class="mockbar__tag">MOCKUP</span>
    <span class="mockbar__screen"><b>${esc(route.id)}</b> ${esc(route.title)}</span>
    <label>Rola <select data-role>${(Object.keys(ROLE_LABEL) as Role[]).map((k) => `<option value="${k}" ${k === r ? 'selected' : ''}>${ROLE_LABEL[k]}</option>`).join('')}</select></label>
    <span class="mockbar__states" role="group" aria-label="Stan ekranu">${(['success', 'loading', 'empty', 'error'] as ViewState[]).map((s) =>
      `<button data-state="${s}" class="${(parseHash().query.get('state') ?? 'success') === s ? 'is-on' : ''}">${s === 'success' ? 'domyślny' : s}</button>`).join('')}</span>
    <a href="#/mapa">${icon('map')} Mapa ekranów</a>
  </div>
  <header class="topbar">
    <a href="${DEFAULT_ROUTE[r]}" class="logo" aria-label="Kompas — strona główna"><span class="logo__mark">✦</span>kompas</a>
    <nav class="topnav" aria-label="Główna">${navLinks}</nav>
    <div class="topbar__right">
      ${r === 'guest' ? '<a class="btn btn--ghost btn--s" href="#/logowanie">Zaloguj</a><a class="btn btn--primary btn--s hide-s" href="#/rejestracja">Załóż konto</a>'
        : `<a href="#/powiadomienia" class="iconbtn" aria-label="Powiadomienia">${icon('bell')}${unread ? `<span class="dot">${unread}</span>` : ''}</a>
           <a href="#/konto" class="avatar avatar--me" style="--h:${r === 'mentor' ? 168 : r === 'admin' ? 0 : 12};--s:34px" aria-label="Konto">${r === 'mentor' ? 'KN' : r === 'admin' ? 'AD' : 'AC'}</a>`}
    </div>
  </header>
  ${r !== 'guest' ? `<nav class="bottomnav" aria-label="Główna (mobile)">${navLinks}</nav>` : ''}`;
}

function guard(route: Route): string | null {
  const a = route.access;
  if (a === 'public') return null;
  if (store.role === 'guest') {
    store.returnTo = location.hash;
    return `<div class="narrow card stack center">${icon('user')}<h1 class="h2">Zaloguj się, żeby kontynuować</h1>
      <p class="muted">Ten ekran wymaga konta.</p><div class="row gap-s center-row"><a class="btn btn--primary" href="#/logowanie">Zaloguj</a><a class="btn btn--ghost" href="#/rejestracja">Załóż konto</a></div></div>`;
  }
  if (a !== 'auth' && a !== store.role) {
    return `<div class="narrow card stack center">${icon('alert')}<h1 class="h2">Ten ekran jest dla roli: ${ROLE_LABEL[a]}</h1>
      <p class="muted">W mockupie możesz przełączyć rolę.</p><button class="btn btn--primary" data-switch="${a}">Przełącz na: ${ROLE_LABEL[a]}</button></div>`;
  }
  return null;
}

function render(fresh: boolean): void {
  closeModal();
  const { path, query } = parseHash();
  const m = match(path);
  const route = m?.route ?? ROUTES.find((r) => r.pattern === '/mapa')!;
  const forced = query.get('state') as ViewState | null;
  const token = ++navToken;

  const draw = (state: ViewState) => {
    if (token !== navToken) return;
    const blocked = guard(route);
    const ctx: Ctx = { params: m?.params ?? {}, query, state, rerender: () => render(false) };
    const view: View = blocked ? { html: blocked } : !m ? { html: `<div class="narrow">${'<h1>404</h1><p>Nie ma takiej strony.</p>'}</div>` } : route.screen(ctx);
    document.title = `${route.title} · Kompas (mockup)`;
    app.innerHTML = `${header(route)}<main class="main ${route.bare ? 'main--bare' : ''} ${store.role !== 'guest' ? 'has-bottomnav' : ''}" id="main">${view.html}</main>
      ${route.bare ? '' : `<footer class="footer"><span>Kompas · mockup koncepcji · dane fikcyjne</span><a href="#/mapa">Mapa ekranów</a></footer>`}`;
    bindChrome();
    const main = app.querySelector<HTMLElement>('#main')!;
    view.bind?.(main);
    main.querySelectorAll('[data-retry]').forEach((b) => b.addEventListener('click', () => setState('success')));
  };

  if (fresh) window.scrollTo(0, 0);
  if (fresh && !forced && m && !guard(route)) {
    draw('loading');
    setTimeout(() => draw('success'), 280);
  } else draw(forced ?? 'success');
}

function setState(s: ViewState): void {
  const { path, query } = parseHash();
  if (s === 'success') query.delete('state'); else query.set('state', s);
  const qs = query.toString();
  history.replaceState(null, '', `${location.pathname}#${path}${qs ? `?${qs}` : ''}`);
  render(false);
}

function bindChrome(): void {
  app.querySelector<HTMLSelectElement>('[data-role]')!.addEventListener('change', (e) => {
    const r = (e.target as HTMLSelectElement).value as Role;
    if (r === 'student') applyDemoStudent();
    store.role = r;
    store.loggedIn = r !== 'guest';
    location.hash = DEFAULT_ROUTE[r];
  });
  app.querySelectorAll<HTMLElement>('[data-state]').forEach((b) => b.addEventListener('click', () => setState(b.dataset.state as ViewState)));
  app.querySelectorAll<HTMLElement>('[data-switch]').forEach((b) => b.addEventListener('click', () => {
    store.role = b.dataset.switch as Role;
    store.loggedIn = true;
    render(false);
  }));
  app.querySelector('[data-become-mentor]')?.addEventListener('click', () => { if (store.role === 'student') store.role = 'mentor'; });
}

window.addEventListener('hashchange', () => render(true));
render(true);

import { NOW } from '../mocks';
import { applyDemoStudent, mentorById, store } from '../store';
import { OFF_PLATFORM } from '../domain';
import { Ctx, View, avatar, emptyState, errorState, esc, field, fmtDate, fmtTime, go, icon, len, req, skeleton, states, toast, validate } from '../ui';

// ---------------------------------------------------------------- S1 Wiadomości

export function messages(ctx: Ctx): View {
  let threadId = ctx.params.id;
  if (threadId === 'nowa') {
    const m = mentorById(ctx.query.get('m') ?? '');
    if (m) {
      let t = store.threads.find((x) => x.withName === m.name);
      if (!t) {
        t = { id: `t-${m.id}`, withName: m.name, hue: m.hue, unread: 0, messages: [] };
        store.threads.unshift(t);
      }
      if (!store.loggedIn) {
        store.returnTo = `#/wiadomosci/${t.id}`;
        toast('Zaloguj się, aby napisać do mentora');
        go('#/logowanie');
        return { html: '' };
      }
      history.replaceState(null, '', `#/wiadomosci/${t.id}`);
      threadId = t.id;
    }
  }
  const threads = ctx.state === 'empty' ? [] : store.threads;
  const t = threads.find((x) => x.id === threadId);
  if (t) t.unread = 0;

  const listHtml = `<div class="list threads">${threads.map((x) => `<a class="list-item ${x === t ? 'is-active' : ''}" href="#/wiadomosci/${x.id}">${avatar(x.withName, x.hue, 44)}
    <div class="grow min0"><div class="row between"><strong>${esc(x.withName)}</strong><span class="muted small">${x.messages.length ? fmtDate(x.messages[x.messages.length - 1].at) : ''}</span></div>
    <span class="muted small ellipsis">${esc(x.messages[x.messages.length - 1]?.text ?? 'Nowa rozmowa')}</span></div>${x.unread ? `<span class="count">${x.unread}</span>` : ''}</a>`).join('')}</div>`;

  const upcoming = t ? store.sessions.find((s) => mentorById(s.mentorId)?.name === t.withName && s.status === 'scheduled') : undefined;
  const threadHtml = t ? `
    <div class="thread">
      <div class="thread__head"><a href="#/wiadomosci" class="only-mobile back-ic" aria-label="Wróć">${icon('back')}</a>${avatar(t.withName, t.hue, 36)}<strong>${esc(t.withName)}</strong></div>
      ${upcoming ? `<a class="context-card" href="#/sesje/${upcoming.id}">${icon('cal')} Najbliższa sesja: ${fmtDate(upcoming.startsAt)}, ${fmtTime(upcoming.startsAt)}</a>` : ''}
      <div class="thread__body" data-body>${t.messages.length ? t.messages.map((m) => `<div class="bubble ${m.me ? 'bubble--me' : ''}">${esc(m.text)}<span class="bubble__t">${fmtTime(m.at)}</span></div>`).join('')
        : '<p class="muted center pad">Przedstaw się i napisz, z czym przychodzisz. Mentorzy odpowiadają zwykle w ciągu kilku godzin.</p>'}</div>
      <p class="notice notice--warn small" data-warn hidden>${icon('shield')} Dla Twojego bezpieczeństwa rozliczaj się tylko przez Kompas — poza platformą nie działa gwarancja ani zwroty.</p>
      <form class="composer" data-form="msg" novalidate>
        <textarea name="text" rows="1" placeholder="Napisz wiadomość…" aria-label="Wiadomość"></textarea>
        <button class="btn btn--primary" aria-label="Wyślij">${icon('arrow')}</button>
      </form>
      <div class="field__err pad-x" data-err="text"></div>
    </div>` : `<div class="thread thread--empty only-desktop">${emptyState('Wybierz rozmowę', 'Wiadomości z mentorami i uczniami są tutaj.')}</div>`;

  const html = `
  <div class="page-head ${t ? 'hide-mobile' : ''}"><h1>Wiadomości</h1></div>
  ${states(ctx, {
    loading: () => skeleton(4, 'line'),
    error: () => errorState('Nie udało się wczytać wiadomości.'),
    empty: () => emptyState('Brak wiadomości', 'Napisz do mentora z jego profilu, żeby zapytać o szczegóły przed rezerwacją.', '<a class="btn btn--primary" href="#/mentorzy">Przeglądaj mentorów</a>'),
    success: () => `<div class="messages ${t ? 'has-thread' : ''}">${listHtml}${threadHtml}</div>`,
  })}`;

  return {
    html,
    bind(root) {
      const f = root.querySelector<HTMLFormElement>('[data-form=msg]');
      if (!f || !t) return;
      const ta = f.elements.namedItem('text') as HTMLTextAreaElement;
      const body = root.querySelector('[data-body]')!;
      body.scrollTop = body.scrollHeight;
      ta.addEventListener('input', () => { root.querySelector<HTMLElement>('[data-warn]')!.hidden = !OFF_PLATFORM.test(ta.value); });
      ta.addEventListener('keydown', (e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); f.requestSubmit(); } });
      f.addEventListener('submit', (e) => {
        e.preventDefault();
        if (!validate(f, { text: [req('Wiadomość nie może być pusta.'), len(1, 2000)] })) return;
        const text = ta.value.trim();
        // Mockup: wiadomość zawierająca słowo „błąd” symuluje nieudane wysłanie.
        if (text.toLowerCase().includes('błąd')) {
          body.insertAdjacentHTML('beforeend', `<div class="bubble bubble--me bubble--failed">${esc(text)}<button class="link small" data-resend>Nie wysłano · Ponów</button></div>`);
          body.querySelector('[data-resend]')!.addEventListener('click', () => { t.messages.push({ me: true, text, at: NOW.toISOString() }); ctx.rerender(); });
          ta.value = '';
          return;
        }
        t.messages.push({ me: true, text, at: NOW.toISOString() });
        ctx.rerender();
      });
    },
  };
}

// ---------------------------------------------------------------- S2 Powiadomienia

export function notifications(ctx: Ctx): View {
  const list = ctx.state === 'empty' ? [] : store.notifications;
  const html = `
  <div class="page-head"><h1>Powiadomienia</h1>${list.some((n) => n.unread) ? '<button class="btn btn--ghost btn--s" data-read>Oznacz wszystkie jako przeczytane</button>' : ''}</div>
  ${states(ctx, {
    loading: () => skeleton(4, 'line'),
    error: () => errorState(),
    empty: () => emptyState('Wszystko przeczytane', 'Tutaj pojawią się przypomnienia o sesjach, wiadomości i zmiany w planie.'),
    success: () => `<div class="list">${list.map((n) => `<a class="list-item ${n.unread ? 'is-unread' : ''}" href="${n.link}">${icon('bell')}<div class="grow">${esc(n.text)}<br><span class="muted small">${fmtDate(n.at)}, ${fmtTime(n.at)}</span></div></a>`).join('')}</div>`,
  })}`;
  return { html, bind: (r) => r.querySelector('[data-read]')?.addEventListener('click', () => { store.notifications.forEach((n) => { n.unread = false; }); ctx.rerender(); }) };
}

// ---------------------------------------------------------------- S3 Konto

export function account(ctx: Ctx): View {
  if (ctx.state === 'loading') return { html: skeleton(3) };
  if (ctx.state === 'error') return { html: errorState('Nie udało się wczytać ustawień konta.') };
  const html = `
  <div class="page-head"><h1>Konto i ustawienia</h1></div>
  <div class="narrow stack-l">
    <form class="card stack" data-form="profile" novalidate><h2 class="h3">Profil</h2>
      ${field({ name: 'name', label: 'Imię', value: 'Adrian' })}
      ${field({ name: 'email', label: 'E-mail', value: 'adrian@example.com', type: 'email' })}
      <div class="row gap-s"><div class="field grow"><label for="f-tz">Strefa czasowa</label><select id="f-tz"><option>Europe/Warsaw</option><option>Europe/London</option></select></div>
      <div class="field grow"><label for="f-cur">Waluta</label><select id="f-cur"><option>PLN</option><option>EUR</option></select></div></div>
      <button class="btn btn--primary">Zapisz</button></form>
    <section class="card stack"><h2 class="h3">Metody płatności</h2>
      <div class="row between"><span>Visa •••• 4242 · ważna do 10/26</span><span class="badge badge--cancelled">wygasa</span></div>
      <button class="btn btn--ghost btn--s" data-card>Dodaj kartę</button></section>
    <section class="card stack"><h2 class="h3">Powiadomienia</h2>
      <table class="table"><thead><tr><th></th><th>E-mail</th><th>Push</th></tr></thead><tbody>
        ${['Przypomnienia o sesjach', 'Wiadomości', 'Zmiany w rezerwacjach', 'Wskazówki i oferty'].map((n, i) => `<tr><td>${n}</td><td><input type="checkbox" ${i < 3 ? 'checked' : ''} aria-label="${n} e-mail"/></td><td><input type="checkbox" ${i < 2 ? 'checked' : ''} aria-label="${n} push"/></td></tr>`).join('')}
      </tbody></table></section>
    <section class="card stack"><h2 class="h3">Prywatność</h2>
      <div class="row wrap gap-s"><button class="btn btn--ghost btn--s" data-export>Pobierz moje dane</button><button class="btn btn--danger-ghost btn--s" data-del>Usuń konto</button></div></section>
  </div>`;
  return {
    html,
    bind(root) {
      const f = root.querySelector<HTMLFormElement>('[data-form=profile]')!;
      f.addEventListener('submit', (e) => { e.preventDefault(); if (validate(f, { name: [req(), len(2, 50)], email: [req(), (v) => (/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v) ? null : 'Podaj poprawny adres e-mail.')] })) toast('Zapisano'); });
      root.querySelector('[data-card]')!.addEventListener('click', () => toast('Otwieramy bezpieczny formularz operatora płatności…'));
      root.querySelector('[data-export]')!.addEventListener('click', () => toast('Przygotujemy eksport i wyślemy link e-mailem (do 24 h)'));
      root.querySelector('[data-del]')!.addEventListener('click', () => toast('Usunięcie wymaga potwierdzenia e-mailem. Aktywny plan zostanie anulowany.', 'err'));
    },
  };
}

// ---------------------------------------------------------------- Mapa ekranów (pomoc do przeglądu mockupów)

export const SCREEN_MAP: { group: string; items: [string, string, string, string][] }[] = [
  { group: 'Publiczne', items: [
    ['P1', 'Strona główna', '#/', 'guest'], ['P2', 'Wyszukiwarka mentorów', '#/mentorzy', 'guest'], ['P3', 'Profil mentora', '#/mentorzy/m1', 'guest'],
    ['P4', 'Logowanie / rejestracja', '#/rejestracja', 'guest']] },
  { group: 'Uczeń', items: [
    ['U1', 'Wybór terminu', '#/rezerwacja/m5', 'student'], ['U2', 'Checkout', '#/rezerwacja/m5/platnosc', 'student'], ['U3', 'Potwierdzenie', '#/potwierdzenie/s3', 'student'],
    ['U4', 'Moje sesje', '#/sesje', 'student'], ['U5', 'Szczegóły sesji', '#/sesje/s2', 'student'], ['U6', 'Pokój sesji', '#/sesje/s1/pokoj', 'student'],
    ['U7', 'Ocena sesji (po próbnej)', '#/sesje/s5/ocena', 'student'], ['U8', 'Plany i saldo', '#/plany', 'student'], ['U9', 'Postępy', '#/postepy', 'student'],
    ['S1', 'Wiadomości', '#/wiadomosci/t1', 'student'], ['S2', 'Powiadomienia', '#/powiadomienia', 'student'], ['S3', 'Konto', '#/konto', 'student']] },
  { group: 'Mentor', items: [
    ['M1', 'Onboarding (6 kroków)', '#/mentor/onboarding/1', 'mentor'], ['M2', 'Panel mentora', '#/mentor', 'mentor'], ['M3', 'Kalendarz i dostępność', '#/mentor/kalendarz', 'mentor'],
    ['M4', 'Uczniowie i notatki', '#/mentor/uczniowie/st1', 'mentor'], ['M5', 'Zarobki i wypłaty', '#/mentor/zarobki', 'mentor']] },
  { group: 'Admin', items: [['A1', 'Weryfikacja mentorów', '#/admin/weryfikacja', 'admin'], ['A2', 'Spory i zwroty', '#/admin/spory', 'admin']] },
];

export const FLOWS: { name: string; steps: string }[] = [
  { name: 'F1 Wyszukanie → sesja próbna', steps: 'Gość: Strona główna → szukaj „React” → profil Kasi → wybierz termin → rejestracja → płatność (kod KOMPAS10) → potwierdzenie' },
  { name: 'F2 Sesja → ocena → plan', steps: 'Uczeń: Moje sesje → Dołącz (sesja o 14:05) → test sprzętu → pokój → Zakończ → ocena (sesja próbna z 9 paź) → wybór planu' },
  { name: 'F3 Przełożenie i anulowanie', steps: 'Uczeń: Moje sesje → sesja 23 paź → Przełóż / Anuluj (bezpłatnie) · sesja dziś 14:05 → Anuluj (ostrzeżenie: przepada)' },
  { name: 'F4 Onboarding mentora', steps: 'Gość: „Zostań mentorem” → 6 kroków z walidacją → wysłano → Admin: Weryfikacja → zatwierdź' },
  { name: 'F5 Praca mentora', steps: 'Mentor: Panel → akceptuj/odrzuć prośby → Kalendarz (przeciągnij po siatce) → Uczniowie → notatka → Zarobki → wypłata' },
  { name: 'F6 Spór i zwrot', steps: 'Uczeń: sesja z 18 paź → Zgłoś problem · Admin: Spory → rozstrzygnij' },
];

export function screenMap(): View {
  const html = `
  <div class="page-head"><h1>Mapa ekranów</h1></div>
  <p class="muted">Kliknięcie ustawia odpowiednią rolę i otwiera ekran. Każdy ekran ma podgląd stanów w pasku mockupu na dole.</p>
  <section class="card"><h2 class="h3">Ścieżki do przejścia</h2><ol class="flows">${FLOWS.map((f) => `<li><strong>${esc(f.name)}</strong><br><span class="small">${esc(f.steps)}</span></li>`).join('')}</ol></section>
  <div class="grid-2">${SCREEN_MAP.map((g) => `<section class="card"><h2 class="h3">${g.group}</h2><ul class="map-list">${g.items.map(([id, name, href, role]) =>
    `<li><a href="${href}" data-role-go="${role}"><span class="map-id">${id}</span>${esc(name)}</a></li>`).join('')}</ul></section>`).join('')}</div>`;
  return {
    html,
    bind(root) {
      root.querySelectorAll<HTMLAnchorElement>('[data-role-go]').forEach((a) => a.addEventListener('click', () => {
        const r = a.dataset.roleGo as typeof store.role;
        if (r === 'student' && store.role !== 'student') applyDemoStudent();
        store.role = r;
        store.loggedIn = r !== 'guest';
        if (a.getAttribute('href') === '#/rezerwacja/m5/platnosc') store.draft = { mentorId: 'm5', startsAt: '2026-10-22T09:00:00.000Z', durationMin: 30, type: 'trial' };
      }));
    },
  };
}


import { CATEGORIES, type Mentor, weekSlots } from '@devmentor/core/domain';
import { DEMO_NOW as NOW, MENTORS } from '@devmentor/db/fixtures';
import { applyDemoStudent, applyFreshStudent, mentorById, store } from '../store';
import {
  Ctx, Rule, View, avatar, bindCounters, emailRule, emptyState, errorState, esc, field, fmtDate, fmtTime, go, icon,
  len, money, req, skeleton, states, stars, toast, validate, dayShort,
} from '../ui';

// ---------------------------------------------------------------- P1 Strona główna

export function home(ctx: Ctx): View {
  const featured = MENTORS.filter((m) => m.verified).slice(0, 4);
  const html = `
  <section class="hero">
    <p class="eyebrow">Mentoring 1:1 online</p>
    <h1>Rozwijaj się szybciej z mentorem, który już przeszedł tę drogę</h1>
    <p class="lead">Zweryfikowani praktycy z IT, produktu i designu. Zacznij od 30-minutowej sesji próbnej — jeśli nie zaiskrzy, zmienisz mentora za darmo.</p>
    <form class="searchbar" data-form="search" role="search">
      ${icon('search')}
      <input name="q" list="topics" placeholder="Czego chcesz się nauczyć? np. React, awans na lidera" aria-label="Temat" />
      <datalist id="topics">${CATEGORIES.map((c) => `<option value="${esc(c)}">`).join('')}</datalist>
      <button class="btn btn--primary">Szukaj</button>
    </form>
    <div class="field__err" data-err="q"></div>
    <div class="chips">${CATEGORIES.map((c) => `<a class="chip" href="#/mentorzy?topic=${encodeURIComponent(c)}">${esc(c)}</a>`).join('')}</div>
  </section>

  <section class="steps">
    <div><span class="steps__n">1</span><h3>Znajdź mentora</h3><p>Filtruj po temacie, budżecie i godzinach. Obejrzyj wideo i opinie.</p></div>
    <div><span class="steps__n">2</span><h3>Sesja próbna</h3><p>30 minut na poznanie się i ustalenie celu. Gwarancja zamiany lub zwrotu.</p></div>
    <div><span class="steps__n">3</span><h3>Plan i postępy</h3><p>Stały rytm sesji, notatki i zadania po każdym spotkaniu.</p></div>
  </section>

  <section>
    <div class="section-head"><h2>Polecani mentorzy</h2><a href="#/mentorzy" class="link">Wszyscy mentorzy ${icon('arrow')}</a></div>
    ${states(ctx, {
      loading: () => skeleton(4),
      empty: () => '',
      error: () => '',
      success: () => `<div class="grid-4">${featured.map(miniCard).join('')}</div>`,
    })}
  </section>

  <section class="cta-band">
    <div><h2>Masz doświadczenie, którym chcesz się dzielić?</h2><p>Ustal własną stawkę i godziny. Płatności i rozliczenia bierzemy na siebie.</p></div>
    <a class="btn btn--light" href="#/mentor/onboarding/1" data-become-mentor>Zostań mentorem</a>
  </section>`;
  return {
    html,
    bind(root) {
      root.querySelector<HTMLFormElement>('[data-form=search]')!.addEventListener('submit', (e) => {
        e.preventDefault();
        const f = e.target as HTMLFormElement;
        const q = (f.elements.namedItem('q') as HTMLInputElement).value.trim();
        if (q.length === 1) { validate(f, { q: [len(2, 80)] }); return; }
        go(q ? `#/mentorzy?topic=${encodeURIComponent(q)}` : '#/mentorzy');
      });
    },
  };
}

const miniCard = (m: Mentor): string => `
  <a class="card card--mini" href="#/mentorzy/${m.id}">
    ${avatar(m.name, m.hue, 56)}
    <strong>${esc(m.name)}</strong>
    <span class="muted small">${esc(m.headline.split('·')[0])}</span>
    <span class="row gap-s">${stars(m.rating)}<span class="muted small">${money(m.rate60)}/h</span></span>
  </a>`;

// ---------------------------------------------------------------- P2 Wyszukiwarka

interface Filters { topic: string; priceMax: number; verified: boolean; sort: string; time: string; }

function readFilters(q: URLSearchParams): Filters {
  return {
    topic: q.get('topic') ?? '',
    priceMax: Number(q.get('priceMax') ?? 300),
    verified: q.get('verified') === '1',
    sort: q.get('sort') ?? 'trafnosc',
    time: q.get('time') ?? '',
  };
}

function applyFilters(f: Filters): Mentor[] {
  const t = f.topic.toLowerCase();
  let list = MENTORS.filter((m) =>
    (!t || [m.name, m.headline, ...m.categories, ...m.tags].join(' ').toLowerCase().includes(t)) &&
    m.rate60 <= f.priceMax && (!f.verified || m.verified) &&
    (!f.time || Object.values(m.availability).flat().some((h) =>
      f.time === 'rano' ? h < 12 : f.time === 'popoludnie' ? h >= 12 && h < 17 : h >= 17)));
  const by: Record<string, (a: Mentor, b: Mentor) => number> = {
    'cena-rosnaco': (a, b) => a.rate60 - b.rate60,
    'cena-malejaco': (a, b) => b.rate60 - a.rate60,
    ocena: (a, b) => b.rating - a.rating,
    sesje: (a, b) => b.sessions - a.sessions,
  };
  if (by[f.sort]) list = [...list].sort(by[f.sort]);
  return list;
}

export function search(ctx: Ctx): View {
  const f = readFilters(ctx.query);
  const list = ctx.state === 'empty' ? [] : applyFilters(f);
  const active = [
    f.topic && ['topic', `Temat: ${f.topic}`],
    f.priceMax < 300 && ['priceMax', `Do ${f.priceMax} zł`],
    f.verified && ['verified', 'Zweryfikowani'],
    f.time && ['time', `Pora: ${f.time}`],
  ].filter(Boolean) as [string, string][];

  const filtersForm = `
  <form class="filters" data-form="filters">
    <div class="field"><label for="f-topic">Temat</label><input id="f-topic" name="topic" value="${esc(f.topic)}" list="topics2" placeholder="np. React"/>
      <datalist id="topics2">${CATEGORIES.map((c) => `<option value="${esc(c)}">`).join('')}</datalist></div>
    <div class="field"><label for="f-price">Cena za 60 min: do <output id="price-out">${f.priceMax}</output> zł</label>
      <input id="f-price" type="range" name="priceMax" min="50" max="300" step="10" value="${f.priceMax}"/></div>
    <div class="field"><label for="f-time">Dostępność</label><select id="f-time" name="time">
      ${[['', 'Dowolna pora'], ['rano', 'Rano (do 12)'], ['popoludnie', 'Popołudnie (12–17)'], ['wieczor', 'Wieczór (od 17)']]
        .map(([v, l]) => `<option value="${v}" ${f.time === v ? 'selected' : ''}>${l}</option>`).join('')}</select></div>
    <label class="check"><input type="checkbox" name="verified" ${f.verified ? 'checked' : ''}/> Tylko zweryfikowani</label>
    <div class="field"><label for="f-sort">Sortuj</label><select id="f-sort" name="sort">
      ${[['trafnosc', 'Trafność'], ['cena-rosnaco', 'Cena rosnąco'], ['cena-malejaco', 'Cena malejąco'], ['ocena', 'Ocena'], ['sesje', 'Liczba sesji']]
        .map(([v, l]) => `<option value="${v}" ${f.sort === v ? 'selected' : ''}>${l}</option>`).join('')}</select></div>
  </form>`;

  const narrowest = active[0];
  const html = `
  <div class="page-head"><h1>Mentorzy</h1>
    <button class="btn btn--ghost only-mobile" data-toggle-filters>Filtry${active.length ? ` (${active.length})` : ''}</button></div>
  <div class="layout-side">
    <aside class="side" data-filters-panel>${filtersForm}</aside>
    <div>
      ${active.length ? `<div class="chips chips--active">${active.map(([k, l]) => `<button class="chip chip--on" data-clear="${k}">${esc(l)} ${icon('x')}</button>`).join('')}</div>` : ''}
      ${states(ctx, {
        loading: () => skeleton(4),
        error: () => errorState('Nie udało się wczytać listy mentorów.'),
        empty: () => emptyState('Brak mentorów dla tych filtrów', 'Spróbuj poluzować filtry — najbardziej zawęża wynik filtr poniżej.',
          narrowest ? `<button class="btn btn--primary" data-clear="${narrowest[0]}">Wyczyść: ${esc(narrowest[1])}</button>` : `<a class="btn btn--primary" href="#/mentorzy">Pokaż wszystkich</a>`),
        success: () => list.length === 0
          ? emptyState('Brak mentorów dla tych filtrów', 'Spróbuj poluzować filtry.', narrowest ? `<button class="btn btn--primary" data-clear="${narrowest[0]}">Wyczyść: ${esc(narrowest[1])}</button>` : '')
          : `<p class="muted small">${list.length} ${list.length === 1 ? 'mentor' : list.length < 5 ? 'mentorów' : 'mentorów'}</p>
             <div class="stack">${list.map(mentorCard).join('')}</div>`,
      })}
    </div>
  </div>`;

  return {
    html,
    bind(root) {
      const form = root.querySelector<HTMLFormElement>('[data-form=filters]')!;
      const push = () => {
        const fd = new FormData(form);
        const q = new URLSearchParams();
        const topic = String(fd.get('topic') ?? '').trim();
        if (topic) q.set('topic', topic);
        if (Number(fd.get('priceMax')) < 300) q.set('priceMax', String(fd.get('priceMax')));
        if (fd.get('verified')) q.set('verified', '1');
        if (fd.get('time')) q.set('time', String(fd.get('time')));
        if (fd.get('sort') !== 'trafnosc') q.set('sort', String(fd.get('sort')));
        history.replaceState(null, '', `#/mentorzy${q.toString() ? `?${q}` : ''}`);
        ctx.rerender();
      };
      form.addEventListener('change', push);
      form.querySelector('#f-price')!.addEventListener('input', (e) => {
        root.querySelector('#price-out')!.textContent = (e.target as HTMLInputElement).value;
      });
      form.addEventListener('submit', (e) => { e.preventDefault(); push(); });
      root.querySelectorAll<HTMLElement>('[data-clear]').forEach((b) => b.addEventListener('click', () => {
        const q = new URLSearchParams(ctx.query);
        q.delete(b.dataset.clear!);
        q.delete('state');
        history.replaceState(null, '', `#/mentorzy${q.toString() ? `?${q}` : ''}`);
        ctx.rerender();
      }));
      root.querySelector('[data-toggle-filters]')?.addEventListener('click', () =>
        root.querySelector('[data-filters-panel]')!.classList.toggle('side--open'));
      bindFavorites(root);
    },
  };
}

const mentorCard = (m: Mentor): string => `
  <article class="card mentor-card">
    <a href="#/mentorzy/${m.id}" class="mentor-card__media" aria-label="Profil: ${esc(m.name)}">
      ${avatar(m.name, m.hue, 88)}<span class="play-dot">${icon('play')}</span>
    </a>
    <div class="mentor-card__body">
      <div class="row between">
        <a href="#/mentorzy/${m.id}" class="h3link">${esc(m.name)} ${m.verified ? `<span class="verified" title="Zweryfikowany">${icon('shield')}</span>` : ''}</a>
        <button class="fav ${store.favorites.has(m.id) ? 'fav--on' : ''}" data-fav="${m.id}" aria-pressed="${store.favorites.has(m.id)}" aria-label="Ulubiony">♥</button>
      </div>
      <p class="mentor-card__headline">${esc(m.headline)}</p>
      <div class="tags">${m.tags.slice(0, 4).map((t) => `<span class="tag">${esc(t)}</span>`).join('')}</div>
      <p class="muted small clamp">${esc(m.bio)}</p>
      <div class="row wrap gap-s small muted">${stars(m.rating)}${m.reviewsCount ? `<span>${m.reviewsCount} opinii</span>` : ''}<span>${m.sessions} sesji</span><span>Odpowiada zwykle w ${m.responseHours} h</span></div>
    </div>
    <div class="mentor-card__aside">
      <div><strong class="price">${money(m.rate60)}</strong><span class="muted small"> / 60 min</span></div>
      ${m.acceptingNew
        ? `<a class="btn btn--primary" href="#/rezerwacja/${m.id}">Sesja próbna${m.trialPrice ? ` · ${money(m.trialPrice)}` : ''}</a>`
        : '<span class="badge">Nie przyjmuje nowych</span>'}
      <a class="btn btn--ghost" href="#/wiadomosci/nowa?m=${m.id}">Napisz</a>
    </div>
  </article>`;

function bindFavorites(root: HTMLElement): void {
  root.querySelectorAll<HTMLButtonElement>('[data-fav]').forEach((b) => b.addEventListener('click', () => {
    const id = b.dataset.fav!;
    if (store.favorites.has(id)) store.favorites.delete(id); else store.favorites.add(id);
    b.classList.toggle('fav--on');
    b.setAttribute('aria-pressed', String(store.favorites.has(id)));
    toast(store.favorites.has(id) ? 'Dodano do ulubionych' : 'Usunięto z ulubionych');
  }));
}

// ---------------------------------------------------------------- P3 Profil mentora

export function profile(ctx: Ctx): View {
  const m = mentorById(ctx.params.id);
  if (!m || ctx.state === 'error') {
    return { html: `<div class="narrow">${errorState('Ten profil jest niedostępny — mógł zostać zawieszony lub usunięty.')}
      <h2>Podobni mentorzy</h2><div class="grid-4">${MENTORS.slice(0, 4).map(miniCard).join('')}</div></div>` };
  }
  if (ctx.state === 'loading') return { html: `<div class="sk sk--hero"></div>${skeleton(2)}` };
  const empty = ctx.state === 'empty' || m.reviews.length === 0;
  const week = weekSlots(m, 0, NOW);
  const anySlot = week.some((d) => d.slots.length);
  const similar = MENTORS.filter((x) => x.id !== m.id && x.categories.some((c) => m.categories.includes(c))).slice(0, 3);

  const html = `
  <a href="#/mentorzy" class="back">${icon('back')} Wróć do wyników</a>
  <div class="layout-profile">
    <div class="stack-l">
      <section class="profile-hero card">
        ${avatar(m.name, m.hue, 96)}
        <div>
          <h1>${esc(m.name)} ${m.verified ? `<span class="verified" title="Zweryfikowany">${icon('shield')}</span>` : ''}</h1>
          <p class="lead">${esc(m.headline)}</p>
          <p class="muted small">${esc(m.country)} · ${m.languages.map(esc).join(', ')} · ${m.yearsExp} lat doświadczenia · ${m.companies.map(esc).join(', ')}</p>
        </div>
      </section>
      <div class="video-ph" role="img" aria-label="Wideo powitalne">${icon('play')}<span>Wideo powitalne · 1:42</span></div>
      <div class="stats">
        <div><strong>${m.rating ? m.rating.toFixed(1) : '—'}</strong><span>ocena</span></div>
        <div><strong>${m.sessions}</strong><span>sesji</span></div>
        <div><strong>${m.returningPct ? `${m.returningPct}%` : '—'}</strong><span>wraca po próbnej</span></div>
        <div><strong>${m.responseHours} h</strong><span>czas odpowiedzi</span></div>
      </div>
      <section><h2>O mnie</h2><p>${esc(m.bio)}</p><div class="tags">${m.tags.map((t) => `<span class="tag">${esc(t)}</span>`).join('')}</div></section>
      <section>
        <div class="section-head"><h2>Dostępność w tym tygodniu</h2><span class="muted small">Twoja strefa: Europe/Warsaw</span></div>
        ${anySlot ? `<div class="week">${week.map((d, i) => `<div class="week__day"><span class="week__label">${dayShort(i)} ${d.day.getDate()}</span>
          ${d.slots.length ? d.slots.map((s) => `<span class="week__slot ${s.taken ? 'is-taken' : ''}">${fmtTime(s.iso)}</span>`).join('') : '<span class="muted small">—</span>'}</div>`).join('')}</div>`
          : emptyState('Brak wolnych terminów w tym tygodniu', 'Napisz do mentora, żeby ustalić termin, albo sprawdź kolejny tydzień przy rezerwacji.')}
      </section>
      <section>
        <h2>Opinie${m.reviewsCount ? ` (${m.reviewsCount})` : ''}</h2>
        ${empty ? emptyState('Nowy mentor', 'Ten mentor nie ma jeszcze opinii. Zweryfikowaliśmy jego doświadczenie i tożsamość.')
          : `<div class="rating-break">${[5, 4, 3, 2, 1].map((r) => {
              const pct = r === 5 ? 86 : r === 4 ? 11 : r === 3 ? 3 : 0;
              return `<div class="row gap-s small"><span>${r}★</span><span class="bar"><span style="width:${pct}%"></span></span><span class="muted">${pct}%</span></div>`;
            }).join('')}</div>
            <div class="stack">${m.reviews.map((r) => `<article class="review"><div class="row between"><strong>${esc(r.author)}</strong><span class="muted small">${fmtDate(r.date)}</span></div>
              <div class="stars-line">${'★'.repeat(r.rating)}${'☆'.repeat(5 - r.rating)}</div><p>${esc(r.text)}</p>
              <div class="tags">${r.tags.map((t) => `<span class="tag tag--soft">${esc(t)}</span>`).join('')}</div></article>`).join('')}</div>`}
      </section>
      ${similar.length ? `<section><h2>Podobni mentorzy</h2><div class="grid-3">${similar.map(miniCard).join('')}</div></section>` : ''}
    </div>
    <aside class="booking-box card">
      <div><strong class="price">${money(m.rate60)}</strong><span class="muted"> / 60 min</span></div>
      <p class="small muted">Sesja próbna 30 min: <strong>${m.trialPrice ? money(m.trialPrice) : 'bezpłatna'}</strong></p>
      ${m.acceptingNew
        ? `<a class="btn btn--primary btn--block" href="#/rezerwacja/${m.id}">Zarezerwuj sesję próbną</a>`
        : `<button class="btn btn--primary btn--block" disabled>Nie przyjmuje nowych uczniów</button>`}
      <a class="btn btn--ghost btn--block" href="#/wiadomosci/nowa?m=${m.id}">Napisz wiadomość</a>
      <p class="guarantee">${icon('shield')} Jeśli sesja próbna nie spełni oczekiwań, zmienisz mentora za darmo albo odzyskasz pieniądze.</p>
    </aside>
  </div>
  <div class="sticky-bar only-mobile">
    <div><strong>${money(m.rate60)}</strong><span class="muted small"> / 60 min</span></div>
    ${m.acceptingNew ? `<a class="btn btn--primary" href="#/rezerwacja/${m.id}">Sesja próbna</a>` : '<span class="badge">Nie przyjmuje nowych</span>'}
  </div>`;
  return { html };
}

// ---------------------------------------------------------------- P4 Logowanie / rejestracja

export function auth(ctx: Ctx): View {
  const mode = ctx.params.mode === 'rejestracja' ? 'register' : 'login';
  const asMentor = ctx.query.get('jako') === 'mentor';
  const html = `
  <div class="narrow card auth">
    <div class="tabs" role="tablist">
      <a role="tab" class="tab ${mode === 'login' ? 'is-active' : ''}" href="#/logowanie${location.hash.includes('?') ? location.hash.slice(location.hash.indexOf('?')) : ''}">Logowanie</a>
      <a role="tab" class="tab ${mode === 'register' ? 'is-active' : ''}" href="#/rejestracja${location.hash.includes('?') ? location.hash.slice(location.hash.indexOf('?')) : ''}">Rejestracja</a>
    </div>
    ${store.returnTo.startsWith('#/rezerwacja') ? `<p class="notice">${icon('cal')} Twój wybrany termin jest zachowany — po zalogowaniu wrócisz do płatności.</p>` : ''}
    ${ctx.state === 'error' ? `<p class="notice notice--err" role="alert">Za dużo nieudanych prób. Spróbuj ponownie za 5 minut.</p>` : ''}
    <div class="stack">
      <button class="btn btn--social" data-social>Kontynuuj z Google</button>
      <button class="btn btn--social" data-social>Kontynuuj z LinkedIn</button>
    </div>
    <div class="divider"><span>lub e-mailem</span></div>
    <form data-form="auth" novalidate>
      ${mode === 'register' ? field({ name: 'name', label: 'Imię', placeholder: 'np. Adrian' }) : ''}
      ${field({ name: 'email', label: 'E-mail', type: 'email', placeholder: 'ty@firma.pl', attrs: 'autocomplete="email"' })}
      ${field({ name: 'password', label: 'Hasło', type: 'password', hint: mode === 'register' ? 'Min. 10 znaków' : '', attrs: 'autocomplete="current-password"' })}
      ${mode === 'register' ? `
        <fieldset class="segmented"><legend>Chcę</legend>
          <label><input type="radio" name="as" value="student" ${asMentor ? '' : 'checked'}/> się uczyć</label>
          <label><input type="radio" name="as" value="mentor" ${asMentor ? 'checked' : ''}/> mentorować</label>
        </fieldset>
        <label class="check"><input type="checkbox" name="terms"/> Akceptuję regulamin i politykę prywatności</label>
        <div class="field__err" data-err="terms"></div>
        <label class="check"><input type="checkbox" name="marketing"/> Chcę dostawać wskazówki i oferty (opcjonalnie)</label>` : '<a class="link small" href="#/logowanie" data-reset>Nie pamiętasz hasła?</a>'}
      <button class="btn btn--primary btn--block" type="submit">${mode === 'register' ? 'Załóż konto' : 'Zaloguj się'}</button>
      <p class="muted small">Podpowiedź do mockupu: e-mail <code>zajety@kompas.pl</code> symuluje błąd.</p>
    </form>
  </div>`;
  return {
    html,
    bind(root) {
      bindCounters(root);
      const finish = (role: 'student' | 'mentor', fresh: boolean) => {
        if (fresh) applyFreshStudent(); else applyDemoStudent();
        store.loggedIn = true;
        store.role = role;
        const back = store.returnTo;
        store.returnTo = '';
        toast('Zalogowano');
        go(back || (role === 'mentor' ? '#/mentor/onboarding/1' : '#/sesje'));
      };
      root.querySelectorAll('[data-social]').forEach((b) => b.addEventListener('click', () => finish('student', false)));
      root.querySelector('[data-reset]')?.addEventListener('click', (e) => { e.preventDefault(); toast('Wysłaliśmy link do zmiany hasła (jeśli konto istnieje).'); });
      const form = root.querySelector<HTMLFormElement>('[data-form=auth]')!;
      form.addEventListener('submit', (e) => {
        e.preventDefault();
        const rules: Record<string, Rule[]> = mode === 'register'
          ? { name: [req(), len(2, 50)], email: [req(), emailRule], password: [req(), len(10, 128)], terms: [req('Akceptacja regulaminu jest wymagana.')] }
          : { email: [req(), emailRule], password: [req()] };
        if (!validate(form, rules)) return;
        const email = (form.elements.namedItem('email') as HTMLInputElement).value.trim();
        const btn = form.querySelector('button[type=submit]') as HTMLButtonElement;
        btn.disabled = true;
        btn.textContent = 'Chwileczkę…';
        setTimeout(() => {
          btn.disabled = false;
          btn.textContent = mode === 'register' ? 'Załóż konto' : 'Zaloguj się';
          if (email === 'zajety@kompas.pl') {
            form.querySelector('[data-err=email]')!.innerHTML = mode === 'register'
              ? 'To konto już istnieje. <a class="link" href="#/logowanie">Zaloguj się</a>'
              : 'Nieprawidłowy e-mail lub hasło.';
            return;
          }
          const as = mode === 'register' ? ((form.elements.namedItem('as') as RadioNodeList).value as 'student' | 'mentor') : 'student';
          finish(as, mode === 'register');
        }, 500);
      });
    },
  };
}

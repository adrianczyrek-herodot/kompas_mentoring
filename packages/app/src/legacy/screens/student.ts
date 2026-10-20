import { PLAN_OPTIONS, type Session } from '@devmentor/core/domain';
import { DEMO_NOW as NOW, MENTORS } from '@devmentor/db/fixtures';
import { mentorById, sessionById, store } from '../store';
import {
  FREE_CANCEL_HOURS, HOLD_MINUTES, canCancelFree, canJoin, hasStarted, nextFreeWeek, planPrice, transferSessions, weekSlots,
} from '@devmentor/core/domain';
import {
  Ctx, View, avatar, bindCounters, closeModal, dayShort, emptyState, errorState, esc, field, fmtDate, fmtDateLong, fmtTime,
  go, hoursUntil, icon, len, money, openModal, req, skeleton, states, toast, validate,
} from '../ui';

const statusLabel: Record<string, string> = {
  scheduled: 'Zaplanowana', completed: 'Odbyta', cancelled: 'Anulowana', no_show: 'Nieobecność', disputed: 'Zgłoszony problem', requested: 'Oczekuje na mentora',
};

const typeLabel = (s: Session) => (s.type === 'trial' ? 'Sesja próbna' : 'Sesja z planu');

// ---------------------------------------------------------------- U1 Wybór terminu

export function pickSlot(ctx: Ctx): View {
  const m = mentorById(ctx.params.mentorId);
  if (!m) return { html: errorState('Nie znaleziono mentora.') };
  const w = Number(ctx.query.get('w') ?? 0);
  const fromBalance = store.loggedIn && (store.balances[m.id] ?? 0) > 0;
  const type: 'trial' | 'plan' = fromBalance ? 'plan' : 'trial';
  const duration = type === 'trial' ? 30 : Number(ctx.query.get('d') ?? 60);
  const week = ctx.state === 'empty' ? weekSlots(m, w, NOW).map((d) => ({ ...d, slots: [] })) : weekSlots(m, w, NOW);
  const hasFree = week.some((d) => d.slots.some((s) => !s.taken));
  const next = hasFree ? null : nextFreeWeek(m, w, NOW);
  const sel = store.draft?.mentorId === m.id ? store.draft.startsAt : undefined;

  const grid = `
    <div class="row between week-nav">
      <a class="btn btn--ghost btn--s ${w <= 0 ? 'is-disabled' : ''}" href="#/rezerwacja/${m.id}?w=${Math.max(0, w - 1)}" aria-disabled="${w <= 0}">${icon('back')}</a>
      <strong>${fmtDate(week[0]!.day)} – ${fmtDate(week[6]!.day)}</strong>
      <a class="btn btn--ghost btn--s" href="#/rezerwacja/${m.id}?w=${w + 1}">${icon('arrow')}</a>
    </div>
    ${hasFree ? `<div class="slot-grid">${week.map((d, i) => `
      <div class="slot-col"><span class="slot-col__head">${dayShort(i)}<b>${d.day.getDate()}</b></span>
        ${d.slots.map((s) => `<button class="slot ${s.iso === sel ? 'is-selected' : ''}" data-slot="${s.iso}" ${s.taken ? 'disabled aria-label="zajęte"' : ''}>${fmtTime(s.iso)}</button>`).join('') || '<span class="slot-none">—</span>'}
      </div>`).join('')}</div>`
      : emptyState('Brak wolnych terminów w tym tygodniu', next !== null ? 'Najbliższe wolne terminy są w kolejnym tygodniu.' : 'Mentor nie ma wolnych terminów w najbliższych tygodniach.',
          next !== null ? `<a class="btn btn--primary" href="#/rezerwacja/${m.id}?w=${next}">Przejdź do najbliższego terminu</a>` : `<a class="btn btn--primary" href="#/wiadomosci/nowa?m=${m.id}">Napisz do mentora</a>`)}`;

  const html = `
  <a href="#/mentorzy/${m.id}" class="back">${icon('back')} ${esc(m.name)}</a>
  <div class="steps-bar"><span class="is-active">1 Termin</span><span>2 Płatność</span><span>3 Gotowe</span></div>
  <div class="layout-checkout">
    <section class="card">
      <h1 class="h2">${type === 'trial' ? 'Wybierz termin sesji próbnej' : 'Zarezerwuj sesję z salda'}</h1>
      <div class="row between wrap gap-s">
        ${type === 'trial' ? '<span class="badge">30 min · sesja próbna</span>'
          : `<div class="segmented segmented--inline" role="radiogroup">${[30, 60].map((d) => `<a role="radio" aria-checked="${d === duration}" class="${d === duration ? 'is-on' : ''}" href="#/rezerwacja/${m.id}?w=${w}&d=${d}">${d} min</a>`).join('')}</div>`}
        <label class="small muted">Strefa czasowa <select class="select-s" aria-label="Strefa czasowa"><option>Europe/Warsaw (UTC+2)</option><option>Europe/London (UTC+1)</option><option>America/New_York (UTC−4)</option></select></label>
      </div>
      ${states(ctx, { loading: () => skeleton(5, 'line'), error: () => errorState('Nie udało się pobrać dostępności mentora.'), success: () => grid, empty: () => grid })}
      <p class="muted small">${icon('cal')} Przełożenie lub anulowanie jest bezpłatne do ${FREE_CANCEL_HOURS} h przed sesją. Rezerwacja możliwa najpóźniej 6 h przed terminem.</p>
    </section>
    <aside class="card summary">
      <div class="row gap-s">${avatar(m.name, m.hue, 48)}<div><strong>${esc(m.name)}</strong><br><span class="muted small">${esc(m.headline.split('·')[0])}</span></div></div>
      <dl class="dl">
        <dt>Termin</dt><dd data-sel-label>${sel ? `${fmtDate(sel)}, ${fmtTime(sel)}` : '—'}</dd>
        <dt>Czas</dt><dd>${duration} min</dd>
        <dt>Koszt</dt><dd>${type === 'trial' ? money(m.trialPrice) : '1 sesja z salda'}</dd>
      </dl>
      <button class="btn btn--primary btn--block" data-continue ${sel ? '' : 'disabled'}>Dalej</button>
      <button class="link small" data-sim409>Mockup: symuluj zajęcie terminu (409)</button>
    </aside>
  </div>`;

  return {
    html,
    bind(root) {
      root.querySelectorAll<HTMLButtonElement>('[data-slot]').forEach((b) => b.addEventListener('click', () => {
        store.draft = { mentorId: m.id, startsAt: b.dataset.slot, durationMin: duration, type };
        root.querySelectorAll('.slot.is-selected').forEach((x) => x.classList.remove('is-selected'));
        b.classList.add('is-selected');
        root.querySelector('[data-sel-label]')!.textContent = `${fmtDate(b.dataset.slot!)}, ${fmtTime(b.dataset.slot!)}`;
        (root.querySelector('[data-continue]') as HTMLButtonElement).disabled = false;
      }));
      root.querySelector('[data-continue]')?.addEventListener('click', () => {
        if (!store.draft?.startsAt) return;
        store.draft.holdExpires = Date.now() + HOLD_MINUTES * 6e4;
        const target = `#/rezerwacja/${m.id}/platnosc`;
        if (!store.loggedIn) {
          store.returnTo = target;
          toast('Zaloguj się, aby dokończyć rezerwację');
          go('#/rejestracja');
        } else go(target);
      });
      root.querySelector('[data-sim409]')?.addEventListener('click', () => {
        const selBtn = root.querySelector<HTMLButtonElement>('.slot.is-selected');
        if (!selBtn) { toast('Najpierw wybierz termin', 'err'); return; }
        selBtn.classList.remove('is-selected');
        selBtn.disabled = true;
        store.draft = null;
        root.querySelector('[data-sel-label]')!.textContent = '—';
        (root.querySelector('[data-continue]') as HTMLButtonElement).disabled = true;
        toast('Ten termin został właśnie zajęty. Wybierz inny.', 'err');
      });
    },
  };
}

// ---------------------------------------------------------------- U2 Checkout

export function checkout(ctx: Ctx): View {
  const m = mentorById(ctx.params.mentorId);
  const d = store.draft;
  if (!m) return { html: errorState('Nie znaleziono mentora.') };
  if (!d?.startsAt || d.mentorId !== m.id) {
    return { html: `<div class="narrow">${emptyState('Nie wybrano terminu', 'Wróć do kalendarza mentora i wybierz termin.', `<a class="btn btn--primary" href="#/rezerwacja/${m.id}">Wybierz termin</a>`)}</div>` };
  }
  if (!d.holdExpires) d.holdExpires = Date.now() + HOLD_MINUTES * 6e4;
  const isTrial = d.type === 'trial';
  const price = isTrial ? m.trialPrice : 0;
  const fee = isTrial && price > 0 ? 3 : 0;

  const html = `
  <a href="#/rezerwacja/${m.id}" class="back">${icon('back')} Zmień termin</a>
  <div class="steps-bar"><span class="is-done">1 Termin</span><span class="is-active">2 ${isTrial ? 'Płatność' : 'Potwierdzenie'}</span><span>3 Gotowe</span></div>
  ${ctx.state === 'error' ? `<p class="notice notice--err" role="alert">Płatność odrzucona przez bank: niewystarczające środki. Termin jest nadal zablokowany — spróbuj inną metodą.</p>` : ''}
  <form class="layout-checkout" data-form="checkout" novalidate>
    <section class="card stack">
      <h1 class="h2">${isTrial ? 'Opłać sesję próbną' : 'Potwierdź rezerwację z salda'}</h1>
      ${field({ name: 'goal', label: isTrial ? 'Z czym przychodzisz? (mentor zobaczy to przed sesją)' : 'Temat sesji (opcjonalnie)', textarea: true, rows: 4, counter: 500,
        placeholder: 'np. Uczę się Reacta od pół roku, chcę wiedzieć, czy mój projekt nadaje się do portfolio i co poprawić.' })}
      ${isTrial ? `
      <fieldset class="pay-methods"><legend>Metoda płatności</legend>
        ${[['card', 'Karta płatnicza'], ['blik', 'BLIK'], ['p24', 'Przelewy24']].map(([v, l], i) =>
          `<label class="pay-method"><input type="radio" name="method" value="${v}" ${i === 0 ? 'checked' : ''}/> <span>${l}</span></label>`).join('')}
        <div class="field__err" data-err="method"></div>
      </fieldset>
      <div class="pay-embed" data-pay-embed>
        <div class="field"><label>Numer karty</label><input name="card" inputmode="numeric" placeholder="4242 4242 4242 4242" autocomplete="cc-number"/><div class="field__meta"><span class="field__err" data-err="card"></span></div></div>
        <div class="row gap-s"><div class="field grow"><label>Ważna do</label><input name="exp" placeholder="MM/RR"/><div class="field__meta"><span class="field__err" data-err="exp"></span></div></div>
        <div class="field grow"><label>CVC</label><input name="cvc" inputmode="numeric" placeholder="123"/><div class="field__meta"><span class="field__err" data-err="cvc"></span></div></div></div>
        <p class="muted small">Pola karty osadza operator płatności — nie przechowujemy danych karty.</p>
      </div>
      <div class="row gap-s align-end">
        <div class="field grow"><label for="f-promo">Kod rabatowy</label><input id="f-promo" name="promo" placeholder="np. KOMPAS10"/><div class="field__meta"><span class="field__err" data-err="promo"></span></div></div>
        <button type="button" class="btn btn--ghost" data-promo>Zastosuj</button>
      </div>
      <label class="check small"><input type="checkbox" name="simDecline"/> Mockup: symuluj odrzuconą płatność</label>` : ''}
    </section>
    <aside class="card summary">
      <div class="hold" data-hold>${icon('cal')} Termin zarezerwowany dla Ciebie przez <b data-countdown>10:00</b></div>
      <div class="row gap-s">${avatar(m.name, m.hue, 48)}<div><strong>${esc(m.name)}</strong><br><span class="muted small">${isTrial ? 'Sesja próbna' : 'Sesja z planu'} · ${d.durationMin} min</span></div></div>
      <dl class="dl">
        <dt>Termin</dt><dd>${fmtDateLong(d.startsAt)}, ${fmtTime(d.startsAt)}</dd>
        ${isTrial ? `<dt>Sesja</dt><dd>${money(price)}</dd><dt>Opłata serwisowa</dt><dd>${money(fee)}</dd><dt data-disc-l hidden>Rabat</dt><dd data-disc hidden></dd>
        <dt class="total">Razem</dt><dd class="total" data-total>${money(price + fee)}</dd>` : `<dt>Saldo po rezerwacji</dt><dd>${(store.balances[m.id] ?? 0) - 1} sesji</dd>`}
      </dl>
      <button class="btn btn--primary btn--block" type="submit">${isTrial ? `Zapłać ${money(price + fee)}` : 'Zarezerwuj'}</button>
      <p class="guarantee">${icon('shield')} Gwarancja sesji próbnej: zamiana mentora albo zwrot.</p>
      <button type="button" class="link small" data-expire>Mockup: symuluj wygaśnięcie blokady</button>
    </aside>
  </form>`;

  return {
    html,
    bind(root) {
      bindCounters(root);
      const form = root.querySelector<HTMLFormElement>('[data-form=checkout]')!;
      let discount = 0;
      const total = () => Math.max(0, Math.round((price - discount) + fee));

      const cd = root.querySelector('[data-countdown]')!;
      const tick = () => {
        if (!document.body.contains(cd)) { clearInterval(timer); return; }
        const left = Math.max(0, (d.holdExpires ?? 0) - Date.now());
        cd.textContent = `${String(Math.floor(left / 6e4)).padStart(2, '0')}:${String(Math.floor((left % 6e4) / 1000)).padStart(2, '0')}`;
        if (left === 0) {
          clearInterval(timer);
          root.innerHTML = `<div class="narrow">${emptyState('Blokada terminu wygasła', `Termin ${fmtDate(d.startsAt!)}, ${fmtTime(d.startsAt!)} mógł zostać zajęty. Wybierz go ponownie.`,
            `<a class="btn btn--primary" href="#/rezerwacja/${m.id}">Wróć do kalendarza</a>`)}</div>`;
        }
      };
      const timer = setInterval(tick, 1000);
      tick();
      root.querySelector('[data-expire]')!.addEventListener('click', () => { d.holdExpires = Date.now(); tick(); });

      const methods = form.querySelectorAll<HTMLInputElement>('input[name=method]');
      methods.forEach((r) => r.addEventListener('change', () => {
        root.querySelector<HTMLElement>('[data-pay-embed]')!.hidden = r.value !== 'card' || !r.checked;
      }));

      root.querySelector('[data-promo]')?.addEventListener('click', () => {
        const input = form.elements.namedItem('promo') as HTMLInputElement;
        const err = form.querySelector('[data-err=promo]')!;
        if (input.value.trim().toUpperCase() === 'KOMPAS10') {
          discount = Math.round(price * 0.1);
          err.textContent = '';
          root.querySelector<HTMLElement>('[data-disc-l]')!.hidden = false;
          const dd = root.querySelector<HTMLElement>('[data-disc]')!;
          dd.hidden = false;
          dd.textContent = `−${money(discount)}`;
          root.querySelector('[data-total]')!.textContent = money(total());
          form.querySelector('button[type=submit]')!.textContent = `Zapłać ${money(total())}`;
          toast('Kod zastosowany: −10%');
        } else err.textContent = 'Ten kod jest nieprawidłowy lub wygasł.';
      });

      form.addEventListener('submit', (e) => {
        e.preventDefault();
        const method = (form.elements.namedItem('method') as RadioNodeList | null)?.value;
        const rules: Parameters<typeof validate>[1] = { goal: isTrial ? [req('Opisz krótko cel sesji.'), len(20, 500)] : [len(0, 500)] };
        if (isTrial && method === 'card') {
          rules.card = [(v) => (/^\d{16}$/.test(v.replace(/\s/g, '')) ? null : 'Podaj 16 cyfr numeru karty.')];
          rules.exp = [(v) => (/^(0[1-9]|1[0-2])\/\d{2}$/.test(v.trim()) ? null : 'Format MM/RR.')];
          rules.cvc = [(v) => (/^\d{3,4}$/.test(v.trim()) ? null : '3 lub 4 cyfry.')];
        }
        if (!validate(form, rules)) return;
        const btn = form.querySelector('button[type=submit]') as HTMLButtonElement;
        btn.disabled = true;
        btn.innerHTML = '<span class="spinner"></span> Przetwarzamy płatność…';
        const decline = (form.elements.namedItem('simDecline') as HTMLInputElement | null)?.checked;
        setTimeout(() => {
          if (decline) {
            btn.disabled = false;
            btn.textContent = `Zapłać ${money(total())}`;
            toast('Płatność odrzucona: bank odmówił autoryzacji. Spróbuj inną metodą.', 'err');
            return;
          }
          const id = `s${++store.bookingSeq}`;
          store.sessions.push({
            id, mentorId: m.id, student: 'Ty', startsAt: d.startsAt!, durationMin: d.durationMin, type: d.type,
            status: d.type === 'trial' ? 'requested' : 'scheduled',
            goal: (form.elements.namedItem('goal') as HTMLTextAreaElement).value.trim() || 'Sesja z planu',
          });
          if (!isTrial) store.balances[m.id] = (store.balances[m.id] ?? 1) - 1;
          store.draft = null;
          clearInterval(timer);
          go(`#/potwierdzenie/${id}`);
        }, 1100);
      });
    },
  };
}

// ---------------------------------------------------------------- U3 Potwierdzenie

export function confirmation(ctx: Ctx): View {
  const s = sessionById(ctx.params.id);
  if (ctx.state === 'loading') {
    return { html: `<div class="narrow card center stack">${'<span class="spinner spinner--l"></span>'}<h1 class="h2">Potwierdzamy płatność…</h1><p class="muted">To zwykle trwa kilka sekund. Jeśli potrwa dłużej, potwierdzimy rezerwację e-mailem.</p></div>` };
  }
  if (!s || ctx.state === 'error') {
    return { html: `<div class="narrow">${errorState('Nie mamy jeszcze potwierdzenia płatności. Nie płać ponownie — skontaktuj się z pomocą, jeśli status nie zmieni się w ciągu 5 minut.')}</div>` };
  }
  const m = mentorById(s.mentorId)!;
  const html = `
  <div class="steps-bar"><span class="is-done">1 Termin</span><span class="is-done">2 Płatność</span><span class="is-active">3 Gotowe</span></div>
  <div class="narrow stack-l">
    <div class="success-head">${icon('check')}<h1>Sesja zarezerwowana</h1>
      <p class="muted">${s.status === 'requested' ? `${esc(m.name.split(' ')[0])} potwierdzi termin w ciągu 24 h. Jeśli odrzuci — zwrócimy pieniądze automatycznie.` : 'Mentor dostał powiadomienie.'}</p></div>
    <div class="card booking-card">
      <div class="row gap-s">${avatar(m.name, m.hue, 48)}<div><strong>${esc(m.name)}</strong><br><span class="muted small">${typeLabel(s)} · ${s.durationMin} min</span></div></div>
      <p class="big">${fmtDateLong(s.startsAt)} · ${fmtTime(s.startsAt)}</p>
      <div class="row wrap gap-s">
        <button class="btn btn--ghost btn--s" data-cal>Google Calendar</button><button class="btn btn--ghost btn--s" data-cal>Outlook</button><button class="btn btn--ghost btn--s" data-cal>Pobierz .ics</button>
      </div>
    </div>
    <div class="card"><h2 class="h3">Jak się przygotować</h2>
      <ul class="checklist"><li>Sprawdź kamerę i mikrofon — test jest przed wejściem do pokoju.</li><li>Przygotuj link do kodu lub dokumentu, który chcesz omówić.</li><li>Zapisz 2–3 pytania, na które chcesz poznać odpowiedź.</li></ul></div>
    <div class="row wrap gap-s"><a class="btn btn--primary" href="#/sesje/${s.id}">Szczegóły sesji</a><a class="btn btn--ghost" href="#/wiadomosci/nowa?m=${m.id}">Napisz do mentora</a></div>
  </div>`;
  return { html, bind: (r) => r.querySelectorAll('[data-cal]').forEach((b) => b.addEventListener('click', () => toast('Dodano do kalendarza'))) };
}

// ---------------------------------------------------------------- U4 Moje sesje

export function sessions(ctx: Ctx): View {
  const tab = ctx.query.get('tab') === 'minione' ? 'past' : 'upcoming';
  const all = ctx.state === 'empty' ? [] : store.sessions;
  const upcoming = all.filter((s) => (s.status === 'scheduled' || s.status === 'requested') && new Date(s.startsAt).getTime() + s.durationMin * 6e4 > NOW.getTime())
    .sort((a, b) => a.startsAt.localeCompare(b.startsAt));
  const past = all.filter((s) => !upcoming.includes(s)).sort((a, b) => b.startsAt.localeCompare(a.startsAt));
  const next = upcoming[0];
  const list = tab === 'upcoming' ? upcoming.slice(next ? 1 : 0) : past;

  const item = (s: Session) => {
    const m = mentorById(s.mentorId)!;
    const toReview = s.status === 'completed' && !s.reviewed;
    return `<a class="list-item" href="#/sesje/${s.id}">
      <div class="date-tile"><b>${new Date(s.startsAt).getDate()}</b><span>${fmtDate(s.startsAt).split(',')[0]}</span></div>
      <div class="grow"><strong>${esc(m.name)}</strong><br><span class="muted small">${fmtTime(s.startsAt)} · ${s.durationMin} min · ${typeLabel(s)}</span></div>
      ${toReview ? '<span class="badge badge--accent">Oceń</span>' : `<span class="badge badge--${s.status}">${statusLabel[s.status]}</span>`}
    </a>`;
  };

  const html = `
  <div class="page-head"><h1>Moje sesje</h1><a class="btn btn--primary btn--s" href="#/mentorzy">Znajdź mentora</a></div>
  ${states(ctx, {
    loading: () => `<div class="sk sk--hero"></div>${skeleton(3, 'line')}`,
    error: () => errorState('Nie udało się wczytać sesji.'),
    empty: () => emptyState('Nie masz jeszcze sesji', 'Zacznij od sesji próbnej — 30 minut, żeby poznać mentora i ustalić cel.', '<a class="btn btn--primary" href="#/mentorzy">Znajdź mentora</a>'),
    success: () => `
      ${Object.entries(store.balances).filter(([, n]) => n > 0).length ? `<div class="chips">${Object.entries(store.balances).filter(([, n]) => n > 0)
        .map(([id, n]) => `<a class="chip" href="#/plany">${esc(mentorById(id)!.name)}: saldo ${n} ${n === 1 ? 'sesja' : n < 5 ? 'sesje' : 'sesji'}</a>`).join('')}</div>` : ''}
      ${next && tab === 'upcoming' ? `<section class="card next-session">
        <span class="eyebrow">Najbliższa sesja</span>
        <div class="row between wrap gap-s"><div class="row gap-s">${avatar(mentorById(next.mentorId)!.name, mentorById(next.mentorId)!.hue, 52)}
          <div><strong>${esc(mentorById(next.mentorId)!.name)}</strong><br><span class="muted small">${fmtDateLong(next.startsAt)} · ${fmtTime(next.startsAt)} · ${next.durationMin} min</span></div></div>
          ${canJoin(next, NOW) ? `<a class="btn btn--primary" href="#/sesje/${next.id}/pokoj">${icon('cam')} Dołącz</a>`
            : `<span class="muted small">Dołączenie możliwe 10 min przed startem (za ${Math.max(0, Math.round(hoursUntil(next.startsAt)))} h)</span>`}
        </div>
        <p class="small">${icon('target')} ${esc(next.goal)}</p>
        <div class="row gap-s"><a class="link small" href="#/sesje/${next.id}">Przełóż lub anuluj</a></div>
      </section>` : ''}
      <div class="tabs" role="tablist"><a role="tab" class="tab ${tab === 'upcoming' ? 'is-active' : ''}" href="#/sesje">Nadchodzące (${upcoming.length})</a>
        <a role="tab" class="tab ${tab === 'past' ? 'is-active' : ''}" href="#/sesje?tab=minione">Minione (${past.length})</a></div>
      <div class="list">${list.length ? list.map(item).join('') : `<p class="muted center pad">${tab === 'upcoming' ? 'Brak kolejnych zaplanowanych sesji.' : 'Brak minionych sesji.'}</p>`}</div>`,
  })}`;
  return { html };
}

// ---------------------------------------------------------------- U5 Szczegóły sesji

export function sessionDetail(ctx: Ctx): View {
  const s = sessionById(ctx.params.id);
  if (ctx.state === 'loading') return { html: skeleton(3) };
  if (!s || ctx.state === 'error') return { html: `<div class="narrow">${errorState('Ta sesja nie istnieje albo nie masz do niej dostępu.')}</div>` };
  const m = mentorById(s.mentorId)!;
  const upcoming = s.status === 'scheduled' || s.status === 'requested';
  const started = hasStarted(s, NOW);
  const free = canCancelFree(s, NOW);
  const hoursAfter = -hoursUntil(s.startsAt) - s.durationMin / 60;
  const canReport = s.status === 'completed' && hoursAfter <= 72;

  const html = `
  <a href="#/sesje" class="back">${icon('back')} Moje sesje</a>
  <div class="narrow stack-l">
    <section class="card stack">
      <div class="row between wrap gap-s"><span class="badge badge--${s.status}">${statusLabel[s.status]}</span><span class="muted small">${typeLabel(s)}</span></div>
      <div class="row gap-s">${avatar(m.name, m.hue, 56)}<div><h1 class="h2">${esc(m.name)}</h1><span class="muted">${fmtDateLong(s.startsAt)} · ${fmtTime(s.startsAt)} · ${s.durationMin} min</span></div></div>
      <p>${icon('target')} <strong>Cel:</strong> ${esc(s.goal)}</p>
      ${upcoming ? `
        <p class="notice ${free ? '' : 'notice--warn'}">${free
          ? `Możesz bezpłatnie przełożyć lub anulować sesję do ${FREE_CANCEL_HOURS} h przed startem.`
          : started ? 'Sesja już się rozpoczęła — przełożenie i anulowanie nie są możliwe.' : `Do sesji zostało mniej niż ${FREE_CANCEL_HOURS} h. Anulowanie teraz oznacza utratę sesji.`}</p>
        <div class="row wrap gap-s">
          ${canJoin(s, NOW) ? `<a class="btn btn--primary" href="#/sesje/${s.id}/pokoj">${icon('cam')} Dołącz</a>` : ''}
          <button class="btn btn--ghost" data-reschedule ${started || !free ? 'disabled' : ''}>Przełóż</button>
          <button class="btn btn--danger-ghost" data-cancel ${started ? 'disabled' : ''}>Anuluj sesję</button>
          <a class="btn btn--ghost" href="#/wiadomosci/nowa?m=${m.id}">Napisz</a>
        </div>` : ''}
      ${s.status === 'completed' && !s.reviewed ? `<a class="btn btn--primary" href="#/sesje/${s.id}/ocena">Oceń sesję</a>` : ''}
    </section>
    ${s.note ? `<section class="card stack"><h2 class="h3">Notatka mentora</h2><p>${esc(s.note)}</p>
      ${s.actionItems?.length ? `<h3 class="h4">Zadania</h3><ul class="todo">${s.actionItems.map((a, i) => `<li><label class="check"><input type="checkbox" data-ai="${i}" ${a.done ? 'checked' : ''}/> ${esc(a.text)}</label></li>`).join('')}</ul>` : ''}</section>`
      : s.status === 'completed' ? `<section class="card">${emptyState('Brak notatki', 'Mentor zwykle dodaje notatkę do 24 h po sesji.')}</section>` : ''}
    ${s.status === 'completed' ? `<section class="card"><h2 class="h3">Coś poszło nie tak?</h2>
      ${canReport ? `<p class="muted small">Możesz zgłosić problem do 72 h po sesji.</p><button class="btn btn--ghost" data-report>${icon('flag')} Zgłoś problem</button>`
        : '<p class="muted small">Termin zgłoszenia problemu (72 h po sesji) minął. W razie wątpliwości napisz do pomocy.</p>'}</section>` : ''}
  </div>`;

  return {
    html,
    bind(root) {
      root.querySelectorAll<HTMLInputElement>('[data-ai]').forEach((c) => c.addEventListener('change', () => {
        s.actionItems![Number(c.dataset.ai)]!.done = c.checked;
        toast(c.checked ? 'Zadanie wykonane' : 'Zadanie otwarte');
      }));
      root.querySelector('[data-cancel]')?.addEventListener('click', () => {
        openModal(`<h2 class="h3">Anulować sesję?</h2>
          <p>${free ? `Sesja wróci do salda u ${esc(m.name.split(' ')[0])}${s.type === 'trial' ? ' — za sesję próbną zwrócimy pieniądze' : ''}.`
            : `<strong>Do sesji zostało mniej niż ${FREE_CANCEL_HOURS} h.</strong> Sesja przepadnie i nie wróci do salda.`}</p>
          <div class="field"><label for="f-why">Powód (opcjonalnie, widzi mentor)</label><select id="f-why"><option>Zmiana planów</option><option>Choroba</option><option>Inny</option></select></div>
          <div class="row gap-s end"><button class="btn btn--ghost" data-close>Nie anuluj</button><button class="btn btn--danger" data-confirm>${free ? 'Anuluj sesję' : 'Anuluj mimo to'}</button></div>`,
        (mod) => mod.querySelector('[data-confirm]')!.addEventListener('click', () => {
          s.status = 'cancelled';
          if (free && s.type === 'plan') store.balances[m.id] = (store.balances[m.id] ?? 0) + 1;
          closeModal();
          toast(free ? 'Sesja anulowana, wróciła do salda' : 'Sesja anulowana');
          ctx.rerender();
        }));
      });
      root.querySelector('[data-reschedule]')?.addEventListener('click', () => {
        const slots = [...weekSlots(m, 0, NOW), ...weekSlots(m, 1, NOW)].flatMap((d) => d.slots).filter((x) => !x.taken).slice(0, 12);
        openModal(`<h2 class="h3">Wybierz nowy termin</h2>
          ${slots.length ? `<div class="slot-list">${slots.map((x) => `<button class="slot" data-new="${x.iso}">${fmtDate(x.iso)} · ${fmtTime(x.iso)}</button>`).join('')}</div>`
            : emptyState('Brak wolnych terminów w 14 dni', 'Napisz do mentora, żeby ustalić termin.', `<a class="btn btn--primary" href="#/wiadomosci/nowa?m=${m.id}">Napisz</a>`)}`,
        (mod) => mod.querySelectorAll<HTMLElement>('[data-new]').forEach((b) => b.addEventListener('click', () => {
          s.startsAt = b.dataset.new!;
          closeModal();
          toast(`Przełożono na ${fmtDate(s.startsAt)}, ${fmtTime(s.startsAt)}. Mentor został powiadomiony.`);
          ctx.rerender();
        })));
      });
      root.querySelector('[data-report]')?.addEventListener('click', () => {
        openModal(`<h2 class="h3">Zgłoś problem z sesją</h2>
          <form data-form="report" novalidate class="stack">
            <div class="field"><label for="f-reason">Powód</label><select id="f-reason" name="reason"><option value="">Wybierz…</option>
              <option>Mentor się nie pojawił</option><option>Problemy techniczne</option><option>Sesja niezgodna z opisem</option><option>Niewłaściwe zachowanie</option></select>
              <div class="field__meta"><span class="field__err" data-err="reason"></span></div></div>
            ${field({ name: 'desc', label: 'Opisz, co się stało', textarea: true, counter: 1000 })}
            <p class="muted small">Druga strona ma 48 h na odpowiedź. Decyzję podejmie zespół Kompasu.</p>
            <div class="row gap-s end"><button type="button" class="btn btn--ghost" data-close>Anuluj</button><button class="btn btn--primary">Wyślij zgłoszenie</button></div>
          </form>`,
        (mod) => {
          bindCounters(mod);
          const f = mod.querySelector<HTMLFormElement>('form')!;
          f.addEventListener('submit', (e) => {
            e.preventDefault();
            if (!validate(f, { reason: [req('Wybierz powód.')], desc: [req(), len(30, 1000)] })) return;
            s.status = 'disputed';
            closeModal();
            toast('Zgłoszenie wysłane. Odpowiemy w ciągu 2 dni roboczych.');
            ctx.rerender();
          });
        });
      });
    },
  };
}

// ---------------------------------------------------------------- U6 Pokój sesji

export function room(ctx: Ctx): View {
  const s = sessionById(ctx.params.id);
  if (!s) return { html: errorState('Nie znaleziono sesji.') };
  const m = mentorById(s.mentorId)!;
  const phase = ctx.query.get('krok') === 'pokoj' ? 'room' : 'check';

  if (ctx.state === 'error') {
    return { html: `<div class="narrow card stack">${icon('alert')}<h1 class="h2">Brak dostępu do kamery i mikrofonu</h1>
      <p>Przeglądarka zablokowała dostęp. Kliknij ikonę kłódki obok adresu strony, zezwól na kamerę i mikrofon, a potem odśwież.</p>
      <div class="row gap-s"><a class="btn btn--primary" href="#/sesje/${s.id}/pokoj">Spróbuj ponownie</a><a class="btn btn--ghost" href="#/sesje/${s.id}/pokoj?krok=pokoj">Wejdź tylko z czatem</a></div></div>` };
  }
  if (ctx.state === 'loading') return { html: `<div class="room room--loading"><span class="spinner spinner--l"></span><p>Łączenie z pokojem…</p></div>` };

  if (phase === 'check') {
    const html = `
    <a href="#/sesje/${s.id}" class="back">${icon('back')} Szczegóły sesji</a>
    <div class="layout-checkout">
      <section class="card stack">
        <h1 class="h2">Test sprzętu</h1>
        <div class="video-ph video-ph--self">${avatar('Ty', 12, 80)}<span>Podgląd kamery</span></div>
        <div class="stack-s">
          <div class="row between"><span>${icon('cam')} Kamera</span><span class="ok">${icon('check')} działa</span></div>
          <div class="row between"><span>${icon('mic')} Mikrofon</span><span class="meter"><span></span></span></div>
          <div class="row between"><span>Połączenie</span><span class="ok">${icon('check')} dobre (38 ms)</span></div>
        </div>
      </section>
      <aside class="card summary">
        <div class="row gap-s">${avatar(m.name, m.hue, 48)}<div><strong>${esc(m.name)}</strong><br><span class="muted small">${fmtTime(s.startsAt)} · ${s.durationMin} min</span></div></div>
        <p class="small">${icon('target')} ${esc(s.goal)}</p>
        ${canJoin(s, NOW) ? `<a class="btn btn--primary btn--block" href="#/sesje/${s.id}/pokoj?krok=pokoj">Dołącz do sesji</a>`
          : `<button class="btn btn--primary btn--block" disabled>Pokój otworzy się 10 min przed startem</button>`}
      </section>
    </div>`;
    return { html };
  }

  const waiting = ctx.state === 'empty';
  const html = `
  <div class="room">
    <div class="room__top"><strong>${esc(m.name)}</strong><span class="timer" data-timer>00:00 / ${s.durationMin}:00</span></div>
    <div class="room__stage">
      <div class="tile tile--main">${waiting ? `<div class="center stack-s"><span class="spinner"></span><p>${esc(m.name.split(' ')[0])} jeszcze nie dołączyła</p>
        <button class="btn btn--light btn--s" data-noshow>Mentor się nie pojawił</button><span class="small muted-inv">Przycisk aktywny po 10 min oczekiwania</span></div>`
        : `${avatar(m.name, m.hue, 120)}<span class="tile__name">${esc(m.name)}</span>`}</div>
      <div class="tile tile--self">${avatar('Ty', 12, 48)}<span class="tile__name">Ty</span></div>
    </div>
    <div class="room__controls">
      <button class="ctrl is-on" data-toggle aria-pressed="true" aria-label="Mikrofon">${icon('mic')}</button>
      <button class="ctrl is-on" data-toggle aria-pressed="true" aria-label="Kamera">${icon('cam')}</button>
      <button class="ctrl" data-toggle aria-pressed="false" aria-label="Udostępnij ekran">${icon('screen')}</button>
      <button class="ctrl" data-panel aria-label="Czat i notatki">${icon('chat')}</button>
      <button class="ctrl ctrl--end" data-end aria-label="Zakończ">Zakończ</button>
    </div>
    <aside class="room__panel" data-room-panel>
      <div class="tabs"><button class="tab is-active" data-rtab="chat">Czat</button><button class="tab" data-rtab="notes">Wspólne notatki</button></div>
      <div data-rpane="chat" class="stack-s"><div class="bubble">Hej! Wrzuć link do repo, przejrzymy na ekranie.</div>
        <form class="row gap-s" data-form="rchat"><input name="msg" placeholder="Wiadomość…" aria-label="Wiadomość"/><button class="btn btn--primary btn--s">Wyślij</button></form></div>
      <div data-rpane="notes" hidden><textarea rows="8" aria-label="Wspólne notatki">- Rozdzielić walidację od komponentu formularza\n- </textarea><p class="muted small">Zapisuje się automatycznie.</p></div>
    </aside>
  </div>`;
  return {
    html,
    bind(root) {
      let sec = 0;
      const t = root.querySelector('[data-timer]')!;
      const iv = setInterval(() => {
        if (!document.body.contains(t)) { clearInterval(iv); return; }
        sec++;
        t.textContent = `${String(Math.floor(sec / 60)).padStart(2, '0')}:${String(sec % 60).padStart(2, '0')} / ${s.durationMin}:00`;
      }, 1000);
      root.querySelectorAll<HTMLButtonElement>('[data-toggle]').forEach((b) => b.addEventListener('click', () => {
        const on = b.getAttribute('aria-pressed') !== 'true';
        b.setAttribute('aria-pressed', String(on));
        b.classList.toggle('is-on', on);
      }));
      root.querySelector('[data-panel]')!.addEventListener('click', () => root.querySelector('[data-room-panel]')!.classList.toggle('is-open'));
      root.querySelectorAll<HTMLElement>('[data-rtab]').forEach((b) => b.addEventListener('click', () => {
        root.querySelectorAll('[data-rtab]').forEach((x) => x.classList.toggle('is-active', x === b));
        root.querySelectorAll<HTMLElement>('[data-rpane]').forEach((p) => { p.hidden = p.dataset.rpane !== b.dataset.rtab; });
      }));
      root.querySelector<HTMLFormElement>('[data-form=rchat]')!.addEventListener('submit', (e) => {
        e.preventDefault();
        const f = e.target as HTMLFormElement;
        const input = f.elements.namedItem('msg') as HTMLInputElement;
        if (!input.value.trim()) return;
        f.insertAdjacentHTML('beforebegin', `<div class="bubble bubble--me">${esc(input.value)}</div>`);
        input.value = '';
      });
      root.querySelector('[data-noshow]')?.addEventListener('click', () => {
        clearInterval(iv);
        s.status = 'no_show';
        if (s.type === 'plan') store.balances[m.id] = (store.balances[m.id] ?? 0) + 1;
        toast('Zgłoszono nieobecność mentora. Sesja wróciła do salda.');
        go(`#/sesje/${s.id}`);
      });
      root.querySelector('[data-end]')!.addEventListener('click', () => {
        clearInterval(iv);
        s.status = 'completed';
        go(`#/sesje/${s.id}/ocena`);
      });
    },
  };
}

// ---------------------------------------------------------------- U7 Ocena

export function review(ctx: Ctx): View {
  const s = sessionById(ctx.params.id);
  if (!s) return { html: errorState('Nie znaleziono sesji.') };
  const m = mentorById(s.mentorId)!;
  const tags = ['konkretny/a', 'dobrze przygotowany/a', 'cierpliwy/a', 'praktyczne przykłady', 'jasne zadania'];
  const html = `
  <div class="narrow stack-l">
    <div class="center stack-s">${avatar(m.name, m.hue, 72)}<h1 class="h2">Jak minęła sesja z ${esc(m.name.split(' ')[0])}?</h1><span class="muted small">${fmtDateLong(s.startsAt)} · ${typeLabel(s)}</span></div>
    ${ctx.state === 'error' ? '<p class="notice notice--err" role="alert">Nie udało się zapisać oceny. Twoje odpowiedzi są zachowane — spróbuj ponownie.</p>' : ''}
    <form class="card stack" data-form="review" novalidate>
      <fieldset class="star-input"><legend>Ocena</legend>
        ${[5, 4, 3, 2, 1].map((r) => `<input type="radio" id="r${r}" name="rating" value="${r}"/><label for="r${r}" title="${r}">★</label>`).join('')}
      </fieldset>
      <div class="field__err" data-err="rating"></div>
      <fieldset><legend class="small">Co wyróżniało tę sesję? (opcjonalnie)</legend><div class="chips">${tags.map((t) => `<label class="chip chip--check"><input type="checkbox" name="tag" value="${t}"/> ${t}</label>`).join('')}</div></fieldset>
      ${field({ name: 'public', label: 'Opinia publiczna (widoczna na profilu)', textarea: true, rows: 3, counter: 1000, placeholder: 'Co pomogło Ci najbardziej?' })}
      ${field({ name: 'private', label: 'Uwaga tylko dla mentora (opcjonalnie)', textarea: true, rows: 2, counter: 500 })}
      ${s.type === 'trial' ? `<fieldset class="choice"><legend>Co dalej?</legend>
        <label class="choice__opt"><input type="radio" name="next" value="continue" checked/><span><strong>Kontynuuję z ${esc(m.name.split(' ')[0])}</strong><br><span class="muted small">Wybierzesz plan sesji tygodniowo.</span></span></label>
        <label class="choice__opt"><input type="radio" name="next" value="swap"/><span><strong>Chcę spróbować z innym mentorem</strong><br><span class="muted small">Kolejna sesja próbna na nasz koszt.</span></span></label>
      </fieldset>` : ''}
      <button class="btn btn--primary btn--block">Wyślij ocenę</button>
    </form>
  </div>`;
  return {
    html,
    bind(root) {
      bindCounters(root);
      const f = root.querySelector<HTMLFormElement>('[data-form=review]')!;
      f.addEventListener('submit', (e) => {
        e.preventDefault();
        const rating = Number((f.elements.namedItem('rating') as RadioNodeList).value || 0);
        const ok = validate(f, {
          rating: [req('Wybierz ocenę od 1 do 5.')],
          public: [(v) => (v.trim() && v.trim().length < 20 ? 'Opinia publiczna: minimum 20 znaków lub zostaw puste.' : null),
            (v, form) => (rating > 0 && rating <= 2 && !v.trim() && !(form.elements.namedItem('private') as HTMLTextAreaElement).value.trim()
              ? 'Przy ocenie 1–2 napisz, co poszło nie tak (publicznie lub tylko do mentora).' : null)],
        });
        if (!ok) return;
        s.reviewed = true;
        const next = (f.elements.namedItem('next') as RadioNodeList | null)?.value;
        toast('Dziękujemy za ocenę!');
        if (next === 'continue') go(`#/plany?m=${m.id}`);
        else if (next === 'swap') { toast('Następna sesja próbna jest na nasz koszt'); go('#/mentorzy'); }
        else go('#/postepy');
      });
    },
  };
}

// ---------------------------------------------------------------- U8 Plany i saldo

export function plans(ctx: Ctx): View {
  const pickFor = ctx.query.get('m');
  const pm = pickFor ? mentorById(pickFor) : undefined;
  const sub = ctx.state === 'empty' ? null : store.subscription;

  if (pm) {
    const html = `
    <a href="#/sesje" class="back">${icon('back')} Moje sesje</a>
    <div class="narrow stack-l">
      <div class="row gap-s">${avatar(pm.name, pm.hue, 56)}<div><h1 class="h2">Wybierz plan z ${esc(pm.name.split(' ')[0])}</h1><span class="muted small">Rozliczenie co 4 tygodnie · zmiana lub anulowanie w dowolnym momencie</span></div></div>
      <form class="card stack" data-form="plan">
        <div class="segmented segmented--inline" role="radiogroup" aria-label="Długość sesji">
          <label><input type="radio" name="dur" value="60" checked/> 60 min</label><label><input type="radio" name="dur" value="30"/> 30 min</label></div>
        <div class="plan-grid">${PLAN_OPTIONS.map((n, i) => `
          <label class="plan-opt"><input type="radio" name="per" value="${n}" ${i === 0 ? 'checked' : ''}/>
            <span><strong>${n}×</strong> w tygodniu<br><span class="muted small" data-price="${n}">${money(planPrice(pm.rate60, n, 60))} / 4 tyg.</span>${n === 2 ? '<span class="badge badge--accent">najczęściej wybierany</span>' : ''}</span></label>`).join('')}</div>
        <p class="muted small">Opłacone sesje trafiają do salda. Nie wykorzystałeś sesji? Zostają w saldzie, a plan możesz zmniejszyć od kolejnego okresu.</p>
        <button class="btn btn--primary btn--block" data-plan-pay>Opłać plan</button>
      </form>
    </div>`;
    return {
      html,
      bind(root) {
        const f = root.querySelector<HTMLFormElement>('[data-form=plan]')!;
        const upd = () => {
          const dur = Number((f.elements.namedItem('dur') as RadioNodeList).value);
          const per = Number((f.elements.namedItem('per') as RadioNodeList).value);
          f.querySelectorAll<HTMLElement>('[data-price]').forEach((el) => { el.textContent = `${money(planPrice(pm.rate60, Number(el.dataset.price), dur))} / 4 tyg.`; });
          f.querySelector('[data-plan-pay]')!.textContent = `Opłać plan · ${money(planPrice(pm.rate60, per, dur))}`;
        };
        f.addEventListener('change', upd);
        upd();
        f.addEventListener('submit', (e) => {
          e.preventDefault();
          const dur = Number((f.elements.namedItem('dur') as RadioNodeList).value);
          const per = Number((f.elements.namedItem('per') as RadioNodeList).value);
          const btn = f.querySelector('[data-plan-pay]') as HTMLButtonElement;
          btn.disabled = true;
          btn.innerHTML = '<span class="spinner"></span> Przetwarzamy…';
          setTimeout(() => {
            store.subscription = { mentorId: pm.id, perWeek: per, durationMin: dur, renewsOn: '2026-11-17', status: 'active' };
            store.balances[pm.id] = (store.balances[pm.id] ?? 0) + per * 4;
            toast(`Plan aktywny. Dodano ${per * 4} sesji do salda.`);
            go(`#/rezerwacja/${pm.id}`);
          }, 900);
        });
      },
    };
  }

  const sm = sub ? mentorById(sub.mentorId)! : null;
  const html = `
  <div class="page-head"><h1>Plany i saldo</h1></div>
  ${ctx.state === 'error' ? `<p class="notice notice--err" role="alert">${icon('alert')} Nie udało się odnowić planu — karta wygasła. Zaktualizuj metodę płatności do 27 października, inaczej plan zostanie wstrzymany. Twoje saldo pozostaje. <a class="link" href="#/konto">Zaktualizuj</a></p>` : ''}
  ${ctx.state === 'loading' ? skeleton(3) : `
  ${sub && sm ? `<section class="card stack">
    <div class="row between wrap gap-s"><div class="row gap-s">${avatar(sm.name, sm.hue, 48)}<div><strong>${esc(sm.name)}</strong><br>
      <span class="muted small">${sub.perWeek}× ${sub.durationMin} min tygodniowo · ${money(planPrice(sm.rate60, sub.perWeek, sub.durationMin))} / 4 tyg.</span></div></div>
      <span class="badge badge--${sub.status === 'active' ? 'scheduled' : 'cancelled'}">${sub.status === 'active' ? 'Aktywny' : 'Wstrzymany'}</span></div>
    <p class="small">${sub.status === 'active' ? `Następne odnowienie: <strong>${fmtDateLong(sub.renewsOn)}</strong>` : 'Plan wstrzymany — nie pobieramy opłat, saldo zostaje.'}</p>
    <div class="row wrap gap-s"><a class="btn btn--ghost btn--s" href="#/plany?m=${sm.id}">Zmień plan</a>
      <button class="btn btn--ghost btn--s" data-pause>${sub.status === 'active' ? 'Wstrzymaj' : 'Wznów'}</button>
      <button class="btn btn--danger-ghost btn--s" data-cancel-sub>Anuluj plan</button></div>
  </section>` : emptyState('Nie masz aktywnego planu', 'Plan dobierzesz po sesji próbnej z wybranym mentorem.', '<a class="btn btn--primary" href="#/mentorzy">Znajdź mentora</a>')}
  <section class="card"><h2 class="h3">Saldo sesji</h2>
    <table class="table"><thead><tr><th>Mentor</th><th>Sesje</th><th></th></tr></thead><tbody>
    ${Object.entries(store.balances).map(([id, n]) => `<tr><td>${esc(mentorById(id)!.name)}</td><td>${n}</td>
      <td class="right">${n > 0 ? `<button class="link small" data-transfer="${id}">Przenieś do innego mentora</button>` : ''}</td></tr>`).join('')}
    </tbody></table></section>
  <section class="card"><h2 class="h3">Historia płatności</h2>
    <table class="table"><thead><tr><th>Data</th><th>Opis</th><th class="right">Kwota</th><th></th></tr></thead><tbody>
      <tr><td>6 paź</td><td>Plan 1×60 min · Kasia Nowicka</td><td class="right">${money(720)}</td><td class="right"><button class="link small" data-inv>Faktura</button></td></tr>
      <tr><td>9 paź</td><td>Sesja próbna · Kasia Nowicka</td><td class="right">${money(52)}</td><td class="right"><button class="link small" data-inv>Faktura</button></td></tr>
      <tr><td>18 paź</td><td>Sesja próbna · Ewa Sadowska</td><td class="right">${money(52)}</td><td class="right"><button class="link small" data-inv>Faktura</button></td></tr>
    </tbody></table></section>`}`;
  return {
    html,
    bind(root) {
      root.querySelectorAll('[data-inv]').forEach((b) => b.addEventListener('click', () => toast('Pobieranie faktury PDF…')));
      root.querySelector('[data-pause]')?.addEventListener('click', () => {
        store.subscription!.status = store.subscription!.status === 'active' ? 'paused' : 'active';
        toast(store.subscription!.status === 'paused' ? 'Plan wstrzymany' : 'Plan wznowiony');
        ctx.rerender();
      });
      root.querySelector('[data-cancel-sub]')?.addEventListener('click', () => openModal(`<h2 class="h3">Anulować plan?</h2>
        <p>Plan nie odnowi się ${fmtDateLong(store.subscription!.renewsOn)}. Sesje w saldzie (${store.balances[store.subscription!.mentorId]}) możesz wykorzystać do końca okresu.</p>
        <div class="row gap-s end"><button class="btn btn--ghost" data-close>Zostaw plan</button><button class="btn btn--danger" data-ok>Anuluj plan</button></div>`,
        (mod) => mod.querySelector('[data-ok]')!.addEventListener('click', () => { store.subscription = null; closeModal(); toast('Plan anulowany'); ctx.rerender(); })));
      root.querySelectorAll<HTMLElement>('[data-transfer]').forEach((b) => b.addEventListener('click', () => {
        const from = mentorById(b.dataset.transfer!)!;
        const n = store.balances[from.id] ?? 0;
        const others = MENTORS.filter((x) => x.id !== from.id && x.acceptingNew);
        openModal(`<h2 class="h3">Przenieś saldo</h2><p class="small muted">Wartość sesji przeliczamy według stawki nowego mentora.</p>
          <div class="field"><label for="f-to">Do mentora</label><select id="f-to">${others.map((o) => `<option value="${o.id}">${esc(o.name)} · ${money(o.rate60)}/h</option>`).join('')}</select></div>
          <p class="notice" data-calc></p>
          <div class="row gap-s end"><button class="btn btn--ghost" data-close>Anuluj</button><button class="btn btn--primary" data-ok>Przenieś</button></div>`,
        (mod) => {
          const sel = mod.querySelector<HTMLSelectElement>('#f-to')!;
          const calc = () => {
            const to = mentorById(sel.value)!;
            mod.querySelector('[data-calc]')!.textContent = `${n} ${n === 1 ? 'sesja' : 'sesje'} u ${from.name} (${money(from.rate60)}/h) → ${transferSessions(n, from.rate60, to.rate60)} u ${to.name} (${money(to.rate60)}/h)`;
          };
          sel.addEventListener('change', calc);
          calc();
          mod.querySelector('[data-ok]')!.addEventListener('click', () => {
            const to = mentorById(sel.value)!;
            store.balances[to.id] = (store.balances[to.id] ?? 0) + transferSessions(n, from.rate60, to.rate60);
            store.balances[from.id] = 0;
            closeModal();
            toast('Saldo przeniesione');
            ctx.rerender();
          });
        });
      }));
    },
  };
}

// ---------------------------------------------------------------- U9 Postępy

export function progress(ctx: Ctx): View {
  const g = ctx.state === 'empty' ? null : store.goal;
  const done = store.sessions.filter((s) => s.note);
  const items = done.flatMap((s) => (s.actionItems ?? []).map((a, i) => ({ s, a, i })));
  const html = `
  <div class="page-head"><h1>Postępy</h1></div>
  ${states(ctx, {
    loading: () => skeleton(3),
    error: () => errorState('Nie udało się wczytać postępów.'),
    empty: () => `<section class="card stack">${emptyState('Ustal swój cel', 'Cel pomaga mentorowi zaplanować sesje. Zwykle ustalacie go razem na sesji próbnej.')}
      <form data-form="goal" class="stack" novalidate>${field({ name: 'goal', label: 'Mój cel', placeholder: 'np. Pierwsza praca jako frontend developer' })}
      ${field({ name: 'target', label: 'Termin', type: 'date' })}<button class="btn btn--primary">Zapisz cel</button></form></section>`,
    success: () => {
      const pct = Math.round((g!.milestones.filter((x) => x.done).length / g!.milestones.length) * 100);
      return `
      <section class="card goal">
        <span class="eyebrow">${icon('target')} Mój cel</span>
        <h2>${esc(g!.text)}</h2>
        <p class="muted small">Termin: ${fmtDateLong(g!.target)}</p>
        <div class="progress" role="progressbar" aria-valuenow="${pct}" aria-valuemin="0" aria-valuemax="100"><span style="width:${pct}%"></span></div>
        <ul class="todo">${g!.milestones.map((x, i) => `<li><label class="check"><input type="checkbox" data-ms="${i}" ${x.done ? 'checked' : ''}/> ${esc(x.text)}</label></li>`).join('')}</ul>
      </section>
      <div class="grid-2">
        <section class="card"><h2 class="h3">Zadania od mentorów</h2>
          ${items.length ? `<ul class="todo">${items.map(({ s, a, i }) => `<li><label class="check"><input type="checkbox" data-s="${s.id}" data-i="${i}" ${a.done ? 'checked' : ''}/> ${esc(a.text)}</label><span class="muted small"> · ${fmtDate(s.startsAt)}</span></li>`).join('')}</ul>`
            : '<p class="muted">Brak zadań.</p>'}</section>
        <section class="card"><h2 class="h3">Notatki z sesji</h2>
          <ol class="timeline">${done.sort((a, b) => b.startsAt.localeCompare(a.startsAt)).map((s) => `<li><a href="#/sesje/${s.id}"><strong>${fmtDate(s.startsAt)}</strong> · ${esc(mentorById(s.mentorId)!.name)}</a><p class="small">${esc(s.note!)}</p></li>`).join('')}</ol></section>
      </div>`;
    },
  })}`;
  return {
    html,
    bind(root) {
      root.querySelectorAll<HTMLInputElement>('[data-ms]').forEach((c) => c.addEventListener('change', () => { store.goal.milestones[Number(c.dataset.ms)]!.done = c.checked; ctx.rerender(); }));
      root.querySelectorAll<HTMLInputElement>('[data-s]').forEach((c) => c.addEventListener('change', () => { sessionById(c.dataset.s!)!.actionItems![Number(c.dataset.i)]!.done = c.checked; }));
      const f = root.querySelector<HTMLFormElement>('[data-form=goal]');
      f?.addEventListener('submit', (e) => {
        e.preventDefault();
        if (!validate(f, {
          goal: [req(), len(10, 200)],
          target: [req('Podaj termin.'), (v) => (new Date(v) > NOW ? null : 'Termin musi być w przyszłości.')],
        })) return;
        toast('Cel zapisany');
      });
    },
  };
}

import { CATEGORIES, EARNINGS, STUDENTS } from '../mocks';
import { store } from '../store';
import { commissionRate, nextTier } from '../domain';
import {
  Ctx, View, avatar, bindCounters, closeModal, dayShort, emptyState, errorState, esc, field, fmtDate, fmtDateLong, fmtTime,
  go, icon, len, money, openModal, range, req, skeleton, states, toast, validate,
} from '../ui';

const HOURS = Array.from({ length: 15 }, (_, i) => i + 7); // 7–21

// ---------------------------------------------------------------- M1 Onboarding

const STEPS = ['O mnie', 'Kompetencje', 'Opis i wideo', 'Stawka', 'Dostępność', 'Weryfikacja'];

export function onboarding(ctx: Ctx): View {
  const ob = store.onboarding;
  const step = Math.min(6, Math.max(1, Number(ctx.params.step) || 1));
  const d = ob.data;

  if (ob.status === 'submitted' || ctx.params.step === 'wyslano') {
    return { html: `<div class="narrow stack-l"><div class="success-head">${icon('check')}<h1>Profil wysłany do weryfikacji</h1>
      <p class="muted">Zwykle sprawdzamy zgłoszenia w ciągu 2 dni roboczych. Damy znać e-mailem — jeśli czegoś zabraknie, wskażemy konkretne pola.</p></div>
      <div class="card"><h2 class="h3">Status</h2><ol class="status-steps"><li class="is-done">Szkic</li><li class="is-active">Weryfikacja</li><li>Profil publiczny</li></ol></div>
      <p class="muted small">Mockup: zatwierdź zgłoszenie jako admin (przełącz rolę) albo <a class="link" href="#/mentor" data-skip>przejdź do panelu mentora</a>.</p></div>`,
      bind: (r) => r.querySelector('[data-skip]')?.addEventListener('click', () => { store.role = 'mentor'; }) };
  }

  const body: Record<number, string> = {
    1: `<div class="row gap-m"><div class="photo-up">${d.name ? avatar(d.name, 168, 88) : `<span class="photo-up__ph">${icon('user')}</span>`}
          <button type="button" class="btn btn--ghost btn--s" data-photo>Dodaj zdjęcie</button><span class="field__err" data-err="photo"></span></div>
        <div class="grow stack">${field({ name: 'name', label: 'Imię i nazwisko', value: d.name })}
        ${field({ name: 'country', label: 'Kraj', value: d.country ?? 'Polska' })}</div></div>
        <fieldset><legend class="small">Języki sesji</legend><div class="chips">${['polski', 'angielski', 'niemiecki', 'ukraiński'].map((l) =>
          `<label class="chip chip--check"><input type="checkbox" name="lang" value="${l}" ${(d.lang ?? 'polski').split(',').includes(l) ? 'checked' : ''}/> ${l}</label>`).join('')}</div>
          <div class="field__err" data-err="lang"></div></fieldset>
        <p class="muted small">Zdjęcie: JPG/PNG, min. 400×400 px, do 5 MB, wyraźnie widoczna twarz.</p>`,
    2: `<fieldset><legend class="small">Kategorie (1–5)</legend><div class="chips">${CATEGORIES.map((c) =>
          `<label class="chip chip--check"><input type="checkbox" name="cat" value="${c}" ${(d.cat ?? '').split(',').includes(c) ? 'checked' : ''}/> ${c}</label>`).join('')}</div>
          <div class="field__err" data-err="cat"></div></fieldset>
        ${field({ name: 'tags', label: 'Umiejętności (3–15, oddziel przecinkami)', value: d.tags, placeholder: 'np. React, TypeScript, Code review' })}
        <div class="row gap-s">${field({ name: 'years', label: 'Lata doświadczenia', type: 'number', value: d.years, attrs: 'min="1" max="50"' })}
        ${field({ name: 'companies', label: 'Firmy (opcjonalnie)', value: d.companies })}</div>`,
    3: `${field({ name: 'headline', label: 'Nagłówek profilu', value: d.headline, placeholder: 'np. Senior Frontend Engineer · React i architektura UI', counter: 80 })}
        ${field({ name: 'bio', label: 'Opis: z czym pomagasz i jak pracujesz', textarea: true, rows: 7, counter: 2000, value: d.bio })}
        <div class="stack-s"><span class="label">Wideo powitalne</span>
          <div class="upload" data-video>${icon('play')}<span>${d.video ? `Dodano: ${esc(d.video)}` : 'Przeciągnij plik MP4/MOV (30 s – 3 min, do 200 MB)'}</span><button type="button" class="btn btn--ghost btn--s" data-video-btn>Wybierz plik</button></div>
          ${field({ name: 'videoUrl', label: 'albo link YouTube / Vimeo', value: d.videoUrl, placeholder: 'https://youtu.be/…' })}</div>`,
    4: `${field({ name: 'rate', label: 'Stawka za 60 min (zł)', type: 'number', value: d.rate ?? '180', attrs: 'min="40" max="1000" step="5"' })}
        <div class="earn-preview" data-earn></div>
        <p class="muted small">Sesja 30 min kosztuje połowę stawki. Prowizja maleje z liczbą przepracowanych godzin: 33% → 28% → 20% → 18%. Sesja próbna w całości jest prowizją platformy.</p>`,
    5: `<p class="small">Zaznacz godziny, w których uczniowie mogą rezerwować sesje (Twoja strefa: Europe/Warsaw). Minimum 3 h tygodniowo.</p>
        ${availabilityEditor(ob.availability)}<div class="field__err" data-err="avail"></div>`,
    6: `<div class="verify-list">
          <div class="verify-item"><span>${icon('user')} Profil LinkedIn</span>${field({ name: 'linkedin', label: 'Link do profilu', value: d.linkedin, placeholder: 'https://linkedin.com/in/…' })}</div>
          <div class="verify-item"><span>${icon('shield')} Weryfikacja tożsamości</span><button type="button" class="btn btn--ghost btn--s" data-kyc>${d.kyc ? `${icon('check')} Zweryfikowano` : 'Rozpocznij (u operatora, ok. 3 min)'}</button><span class="field__err" data-err="kyc"></span></div>
          <div class="verify-item"><span>${icon('wallet')} Dane do wypłat</span>${field({ name: 'iban', label: 'Numer konta (IBAN)', value: d.iban, placeholder: 'PL00 0000 0000 0000 0000 0000 0000' })}</div>
        </div>
        <label class="check"><input type="checkbox" name="terms" ${d.terms ? 'checked' : ''}/> Akceptuję regulamin dla mentorów (m.in. zakaz rozliczeń poza platformą)</label><div class="field__err" data-err="terms"></div>`,
  };

  const html = `
  <div class="narrow stack-l">
    <div><span class="eyebrow">Zostań mentorem · krok ${step} z 6</span><h1 class="h2">${STEPS[step - 1]}</h1>
      <div class="progress"><span style="width:${(step / 6) * 100}%"></span></div>
      <ol class="stepper">${STEPS.map((s, i) => `<li class="${i + 1 < step ? 'is-done' : i + 1 === step ? 'is-active' : ''}">${i + 1 < step ? `<a href="#/mentor/onboarding/${i + 1}">${s}</a>` : s}</li>`).join('')}</ol></div>
    ${ctx.state === 'error' ? '<p class="notice notice--err" role="alert">Nie udało się zapisać kroku. Twoje dane są w formularzu — spróbuj ponownie.</p>' : ''}
    <form class="card stack" data-form="ob" novalidate>
      ${ctx.state === 'loading' ? skeleton(3, 'line') : body[step]}
      <div class="row between">
        ${step > 1 ? `<a class="btn btn--ghost" href="#/mentor/onboarding/${step - 1}">Wstecz</a>` : '<span></span>'}
        <div class="row gap-s">${step === 3 ? '<button type="button" class="btn btn--ghost" data-preview>Podgląd profilu</button>' : ''}
        <button class="btn btn--primary">${step === 6 ? 'Wyślij do weryfikacji' : 'Zapisz i dalej'}</button></div>
      </div>
    </form>
    <p class="muted small center">Szkic zapisuje się po każdym kroku — możesz wrócić później.</p>
  </div>`;

  return {
    html,
    bind(root) {
      bindCounters(root);
      const f = root.querySelector<HTMLFormElement>('[data-form=ob]')!;
      const vals = (name: string) => [...f.querySelectorAll<HTMLInputElement>(`input[name=${name}]:checked`)].map((x) => x.value);
      root.querySelector('[data-photo]')?.addEventListener('click', () => { d.photo = 'zdjecie.jpg'; toast('Dodano zdjęcie (400×400)'); });
      root.querySelector('[data-video-btn]')?.addEventListener('click', () => { d.video = 'powitanie.mp4 · 1:42'; ctx.rerender(); });
      root.querySelector('[data-kyc]')?.addEventListener('click', () => { d.kyc = '1'; toast('Tożsamość zweryfikowana przez operatora'); ctx.rerender(); });
      root.querySelector('[data-preview]')?.addEventListener('click', () => openModal(`<h2 class="h3">Podgląd karty w wynikach</h2>
        <div class="card"><div class="row gap-s">${avatar(d.name || 'Nowy Mentor', 168, 56)}<div><strong>${esc(d.name || 'Twoje imię')}</strong><br><span class="small">${esc((f.elements.namedItem('headline') as HTMLInputElement).value || 'Twój nagłówek')}</span></div></div>
        <p class="small muted">${esc(((f.elements.namedItem('bio') as HTMLTextAreaElement).value || 'Twój opis…').slice(0, 180))}</p></div>`));
      const earn = root.querySelector('[data-earn]');
      if (earn) {
        const rate = f.elements.namedItem('rate') as HTMLInputElement;
        const upd = () => {
          const r = Number(rate.value) || 0;
          earn.innerHTML = `<div><span class="muted small">Zarobisz za 60 min (na start, prowizja 33%)</span><strong>${money(Math.round(r * 0.67))}</strong></div>
            <div><span class="muted small">Po 200 h (prowizja 18%)</span><strong>${money(Math.round(r * 0.82))}</strong></div>`;
        };
        rate.addEventListener('input', upd);
        upd();
      }
      bindAvailabilityEditor(root, ob.availability);

      f.addEventListener('submit', (e) => {
        e.preventDefault();
        const rules: Record<number, Parameters<typeof validate>[1]> = {
          1: { name: [req(), len(2, 60)], country: [req()], lang: [() => (vals('lang').length ? null : 'Wybierz co najmniej jeden język.')] },
          2: { cat: [() => { const n = vals('cat').length; return n >= 1 && n <= 5 ? null : 'Wybierz od 1 do 5 kategorii.'; }],
            tags: [(v) => { const n = v.split(',').map((x) => x.trim()).filter(Boolean).length; return n >= 3 && n <= 15 ? null : `Podaj 3–15 umiejętności (teraz: ${n}).`; }],
            years: [range(1, 50, ' lat')] },
          3: { headline: [req(), len(20, 80)], bio: [req(), len(300, 2000)],
            videoUrl: [(v) => (!v.trim() || /^https:\/\/(www\.)?(youtube\.com|youtu\.be|vimeo\.com)\//.test(v.trim()) ? null : 'Link musi prowadzić do YouTube lub Vimeo.'),
              (v) => (v.trim() || d.video ? null : 'Dodaj wideo albo link — profile z wideo mają wyraźnie więcej rezerwacji.')] },
          4: { rate: [req(), range(40, 1000, ' zł')] },
          5: { avail: [() => (ob.availability.size >= 3 ? null : `Zaznacz co najmniej 3 godziny (teraz: ${ob.availability.size}).`)] },
          6: { linkedin: [req(), (v) => (/linkedin\.com\/in\//.test(v) ? null : 'Podaj link w formacie linkedin.com/in/…')],
            kyc: [() => (d.kyc ? null : 'Zweryfikuj tożsamość, zanim wyślesz profil.')],
            iban: [req(), (v) => (/^PL\d{26}$/.test(v.replace(/\s/g, '').toUpperCase()) ? null : 'Polski IBAN: PL + 26 cyfr.')],
            terms: [req('Akceptacja regulaminu jest wymagana.')] },
        };
        if (step === 1 && !d.photo) { f.querySelector('[data-err=photo]')!.textContent = 'Dodaj zdjęcie.'; }
        if (!validate(f, rules[step]) || (step === 1 && !d.photo)) return;
        new FormData(f).forEach((v, k) => { if (!['lang', 'cat'].includes(k)) d[k] = String(v); });
        if (step === 1) d.lang = vals('lang').join(',');
        if (step === 2) d.cat = vals('cat').join(',');
        if (step === 6) {
          ob.status = 'submitted';
          store.applications.unshift({ id: 'a-new', name: d.name, headline: d.headline ?? '', submitted: '2026-10-20', kyc: 'zweryfikowano', linkedin: true, hue: 168, categories: (d.cat ?? '').split(',') });
          go('#/mentor/onboarding/wyslano');
        } else {
          toast('Zapisano szkic');
          go(`#/mentor/onboarding/${step + 1}`);
        }
      });
    },
  };
}

function availabilityEditor(set: Set<string>): string {
  return `<div class="avail" role="grid" aria-label="Dostępność tygodniowa">
    <div class="avail__row avail__head"><span></span>${[0, 1, 2, 3, 4, 5, 6].map((d) => `<span>${dayShort(d)}</span>`).join('')}</div>
    ${HOURS.map((h) => `<div class="avail__row"><span class="avail__h">${h}:00</span>${[0, 1, 2, 3, 4, 5, 6].map((d) =>
      `<button type="button" class="avail__cell ${set.has(`${d}-${h}`) ? 'is-on' : ''}" data-cell="${d}-${h}" aria-pressed="${set.has(`${d}-${h}`)}" aria-label="${dayShort(d)} ${h}:00"></button>`).join('')}</div>`).join('')}
  </div><p class="muted small" data-avail-sum>${set.size} h tygodniowo</p>`;
}

let painting: boolean | null = null;
window.addEventListener('pointerup', () => { painting = null; });

function bindAvailabilityEditor(root: HTMLElement, set: Set<string>, onChange?: () => void): void {
  const apply = (b: HTMLElement) => {
    const k = b.dataset.cell!;
    if (painting) set.add(k); else set.delete(k);
    b.classList.toggle('is-on', !!painting);
    b.setAttribute('aria-pressed', String(!!painting));
    const sum = root.querySelector('[data-avail-sum]');
    if (sum) sum.textContent = `${set.size} h tygodniowo`;
    onChange?.();
  };
  root.querySelectorAll<HTMLElement>('[data-cell]').forEach((b) => {
    b.addEventListener('pointerdown', (e) => { e.preventDefault(); painting = !set.has(b.dataset.cell!); apply(b); });
    b.addEventListener('pointerenter', () => { if (painting !== null) apply(b); });
    b.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); painting = !set.has(b.dataset.cell!); apply(b); painting = null; } });
  });
}

// ---------------------------------------------------------------- M2 Panel mentora

export function mentorDashboard(ctx: Ctx): View {
  const today = STUDENTS.filter((s) => s.nextSession?.startsWith('2026-10-20'));
  const reqs = ctx.state === 'empty' ? [] : store.requests;
  const html = `
  <div class="page-head"><div><span class="eyebrow">Wtorek, 20 października</span><h1>Dzień dobry, Kasia</h1></div></div>
  ${ctx.state === 'error' ? errorState('Nie udało się wczytać panelu.') : ctx.state === 'loading' ? `<div class="grid-4">${skeleton(4)}</div>${skeleton(2)}` : `
  <div class="kpis">
    <div class="kpi"><span>Godziny w tym tygodniu</span><strong>9</strong><em class="up">+2 vs poprz.</em></div>
    <div class="kpi"><span>Przychód (paź)</span><strong>${money(3240)}</strong><em class="up">+12%</em></div>
    <div class="kpi"><span>Próbne → plan (90 dni)</span><strong>64%</strong><em>14 z 22</em></div>
    <div class="kpi"><span>Ocena</span><strong>4,9</strong><em>87 opinii</em></div>
  </div>
  <div class="grid-2">
    <section class="card"><div class="section-head"><h2 class="h3">Dziś</h2><a class="link small" href="#/mentor/kalendarz">Kalendarz</a></div>
      ${ctx.state === 'empty' || !today.length ? emptyState('Brak sesji dzisiaj', 'Dodaj wieczorne godziny dostępności — to najczęściej wyszukiwana pora.', '<a class="btn btn--ghost" href="#/mentor/kalendarz">Edytuj dostępność</a>')
        : `<div class="list">${today.map((s) => `<div class="list-item"><div class="date-tile"><b>${fmtTime(s.nextSession!)}</b></div>
            <div class="grow"><strong>${esc(s.name)}</strong><br><span class="muted small">${esc(s.goal)}</span></div>
            ${fmtTime(s.nextSession!) === '14:05' ? '<button class="btn btn--primary btn--s" data-join>Dołącz</button>' : '<span class="badge">Za 3 h</span>'}</div>`).join('')}</div>`}
    </section>
    <section class="card"><div class="section-head"><h2 class="h3">Prośby o sesję próbną ${reqs.length ? `<span class="count">${reqs.length}</span>` : ''}</h2></div>
      <p class="muted small">Odpowiedz w 24 h — potem zaakceptujemy automatycznie, jeśli termin jest wolny.</p>
      ${reqs.length ? `<div class="stack">${reqs.map((r) => `<article class="request" data-req="${r.id}">
          <div class="row gap-s">${avatar(r.student, r.hue, 40)}<div><strong>${esc(r.student)}</strong><br><span class="muted small">${fmtDate(r.startsAt)}, ${fmtTime(r.startsAt)} · 30 min</span></div></div>
          <p class="small">„${esc(r.goal)}”</p>
          <div class="row gap-s"><button class="btn btn--primary btn--s" data-accept="${r.id}">Akceptuj</button><button class="btn btn--ghost btn--s" data-decline="${r.id}">Odrzuć</button></div>
        </article>`).join('')}</div>` : emptyState('Brak nowych próśb', 'Nowe prośby o sesję próbną pojawią się tutaj.')}
    </section>
  </div>
  <section class="card"><h2 class="h3">Do zrobienia</h2><ul class="todo">
    <li><a class="link" href="#/mentor/uczniowie/st1">Dodaj notatkę po sesji z Adrianem C. (18 paź)</a></li>
    <li><a class="link" href="#/wiadomosci">Odpowiedz na 1 wiadomość</a></li>
    <li><a class="link" href="#/mentor/kalendarz">Brak dostępności w weekend 31 paź – 1 lis — uzupełnij lub oznacz urlop</a></li>
  </ul></section>`}`;
  return {
    html,
    bind(root) {
      root.querySelector('[data-join]')?.addEventListener('click', () => go('#/sesje/s1/pokoj'));
      root.querySelectorAll<HTMLElement>('[data-accept]').forEach((b) => b.addEventListener('click', () => {
        store.requests = store.requests.filter((r) => r.id !== b.dataset.accept);
        toast('Sesja próbna potwierdzona. Uczeń dostał powiadomienie.');
        ctx.rerender();
      }));
      root.querySelectorAll<HTMLElement>('[data-decline]').forEach((b) => b.addEventListener('click', () => {
        openModal(`<h2 class="h3">Odrzuć prośbę</h2><form class="stack" novalidate>
          <fieldset><legend class="small">Powód (uczeń go zobaczy)</legend>
            ${['Termin mi nie pasuje', 'Temat poza moimi kompetencjami', 'Nie przyjmuję nowych uczniów', 'Inny'].map((r) => `<label class="check"><input type="radio" name="why" value="${r}"/> ${r}</label>`).join('')}
            <div class="field__err" data-err="why"></div></fieldset>
          ${field({ name: 'other', label: 'Wyjaśnienie', textarea: true, rows: 2, counter: 300 })}
          <p class="muted small">Uczeń dostanie automatyczny zwrot i propozycję 3 podobnych mentorów.</p>
          <div class="row gap-s end"><button type="button" class="btn btn--ghost" data-close>Anuluj</button><button class="btn btn--danger">Odrzuć</button></div></form>`,
        (mod) => {
          bindCounters(mod);
          const f = mod.querySelector('form')!;
          f.addEventListener('submit', (e) => {
            e.preventDefault();
            if (!validate(f, {
              why: [req('Wybierz powód.')],
              other: [(v, form) => ((form.elements.namedItem('why') as RadioNodeList).value === 'Inny' ? len(10, 300)(v, form) : null)],
            })) return;
            store.requests = store.requests.filter((r) => r.id !== b.dataset.decline);
            closeModal();
            toast('Prośba odrzucona, uczeń dostanie zwrot.');
            ctx.rerender();
          });
        });
      }));
    },
  };
}

// ---------------------------------------------------------------- M3 Kalendarz

export function mentorCalendar(ctx: Ctx): View {
  const set = store.mentorTemplate;
  const booked: Record<string, string> = { '1-17': 'Julia M.', '1-14': 'Adrian C.', '3-18': 'Adrian C.', '2-9': 'Paweł R. (próbna)', '4-10': 'Iga T. (próbna)' };
  const html = `
  <div class="page-head"><h1>Kalendarz i dostępność</h1><span class="muted small">Europe/Warsaw</span></div>
  ${ctx.state === 'empty' ? `<p class="notice notice--warn">${icon('alert')} Nie masz ustawionej dostępności — uczniowie nie mogą cię zarezerwować.</p>` : ''}
  ${ctx.state === 'error' ? `<p class="notice notice--err" role="alert">Synchronizacja z Google Calendar przestała działać. <button class="link" data-resync>Połącz ponownie</button></p>` : ''}
  <div class="layout-side layout-side--right">
    <section class="card">
      <div class="row between wrap gap-s"><h2 class="h3">Tydzień 19–25 paź</h2>
        <div class="legend small"><span class="lg lg--free"></span>dostępne <span class="lg lg--booked"></span>sesja <span class="lg lg--off"></span>niedostępne</div></div>
      <p class="muted small">Kliknij lub przeciągnij po siatce, żeby zmienić szablon tygodniowy.</p>
      ${ctx.state === 'loading' ? skeleton(6, 'line') : `<div class="avail avail--cal">
        <div class="avail__row avail__head"><span></span>${[0, 1, 2, 3, 4, 5, 6].map((d) => `<span>${dayShort(d)} ${19 + d}</span>`).join('')}</div>
        ${HOURS.map((h) => `<div class="avail__row"><span class="avail__h">${h}:00</span>${[0, 1, 2, 3, 4, 5, 6].map((d) => {
          const k = `${d}-${h}`;
          if (booked[k]) return `<span class="avail__cell is-booked" title="${esc(booked[k])}">${esc(booked[k].split(' ')[0])}</span>`;
          const on = ctx.state !== 'empty' && set.has(k);
          return `<button type="button" class="avail__cell ${on ? 'is-on' : ''}" data-cell="${k}" aria-pressed="${on}" aria-label="${dayShort(d)} ${h}:00"></button>`;
        }).join('')}</div>`).join('')}
      </div><p class="muted small" data-avail-sum>${set.size} h tygodniowo</p>`}
      <div class="row gap-s"><button class="btn btn--primary" data-save>Zapisz szablon</button><span class="muted small" data-dirty></span></div>
    </section>
    <aside class="stack">
      <section class="card stack"><h2 class="h3">Ustawienia rezerwacji</h2>
        <form class="stack" data-form="cal-settings" novalidate>
          ${field({ name: 'notice', label: 'Minimalne wyprzedzenie (h)', type: 'number', value: '6', attrs: 'min="2" max="48"' })}
          ${field({ name: 'buffer', label: 'Przerwa między sesjami (min)', type: 'number', value: '10', attrs: 'min="0" max="30"' })}
          <label class="check"><input type="checkbox" name="accepting" checked/> Przyjmuję nowych uczniów</label>
          <button class="btn btn--ghost">Zapisz ustawienia</button>
        </form></section>
      <section class="card stack"><h2 class="h3">Wyjątki</h2>
        <ul class="todo"><li>31 paź – 2 lis · urlop</li></ul>
        <button class="btn btn--ghost btn--s" data-exception>Dodaj wyjątek</button></section>
      <section class="card stack"><h2 class="h3">Google Calendar</h2>
        <p class="small">${ctx.state === 'error' ? '<span class="err">Rozłączono</span>' : `${icon('check')} Połączono · zajęte terminy z kalendarza są automatycznie niedostępne`}</p></section>
    </aside>
  </div>`;
  return {
    html,
    bind(root) {
      bindAvailabilityEditor(root, set, () => { root.querySelector('[data-dirty]')!.textContent = 'Niezapisane zmiany'; });
      root.querySelector('[data-save]')!.addEventListener('click', () => { root.querySelector('[data-dirty]')!.textContent = ''; toast('Szablon dostępności zapisany'); });
      root.querySelector('[data-resync]')?.addEventListener('click', () => toast('Przekierowanie do Google…'));
      const f = root.querySelector<HTMLFormElement>('[data-form=cal-settings]')!;
      f.addEventListener('submit', (e) => {
        e.preventDefault();
        if (validate(f, { notice: [range(2, 48, ' h')], buffer: [range(0, 30, ' min')] })) toast('Ustawienia zapisane');
      });
      root.querySelector('[data-exception]')!.addEventListener('click', () => openModal(`<h2 class="h3">Dodaj wyjątek</h2>
        <form class="stack" novalidate>
          <div class="segmented"><label><input type="radio" name="type" value="off" checked/> Niedostępność</label><label><input type="radio" name="type" value="extra"/> Dodatkowe godziny</label></div>
          <div class="row gap-s">${field({ name: 'from', label: 'Od', type: 'date' })}${field({ name: 'to', label: 'Do', type: 'date' })}</div>
          <div class="row gap-s end"><button type="button" class="btn btn--ghost" data-close>Anuluj</button><button class="btn btn--primary">Dodaj</button></div></form>`,
      (mod) => {
        const mf = mod.querySelector('form')!;
        mf.addEventListener('submit', (e) => {
          e.preventDefault();
          if (!validate(mf, { from: [req('Podaj datę.')], to: [req('Podaj datę.'), (v, form) => (v >= (form.elements.namedItem('from') as HTMLInputElement).value ? null : 'Data końca nie może być wcześniejsza.')] })) return;
          closeModal();
          toast('Wyjątek dodany. 1 sesja w tym okresie wymaga przełożenia — wysłaliśmy uczniowi prośbę.');
        });
      }));
    },
  };
}

// ---------------------------------------------------------------- M4 Uczniowie

export function mentorStudents(ctx: Ctx): View {
  const filter = ctx.query.get('f') ?? 'wszyscy';
  const list = ctx.state === 'empty' ? [] : STUDENTS.filter((s) => filter === 'wszyscy' || s.status === filter);
  const html = `
  <div class="page-head"><h1>Uczniowie</h1></div>
  <div class="chips">${['wszyscy', 'aktywny', 'próbny', 'nieaktywny'].map((f) => `<a class="chip ${f === filter ? 'chip--on' : ''}" href="#/mentor/uczniowie?f=${encodeURIComponent(f)}">${f === 'wszyscy' ? 'Wszyscy' : f[0].toUpperCase() + f.slice(1)}</a>`).join('')}</div>
  ${states(ctx, {
    loading: () => skeleton(4, 'line'),
    error: () => errorState(),
    empty: () => emptyState('Nie masz jeszcze uczniów', 'Pierwsi uczniowie pojawią się po zaakceptowaniu sesji próbnej.'),
    success: () => `<div class="list">${list.map((s) => `<a class="list-item" href="#/mentor/uczniowie/${s.id}">${avatar(s.name, s.hue, 44)}
      <div class="grow"><strong>${esc(s.name)}</strong> <span class="badge badge--${s.status === 'aktywny' ? 'scheduled' : s.status === 'próbny' ? 'requested' : 'cancelled'}">${s.status}</span><br>
      <span class="muted small">${esc(s.goal)}</span></div>
      <div class="right small muted hide-s">${s.sessions} sesji<br>${s.nextSession ? `Następna: ${fmtDate(s.nextSession)}` : '—'}</div></a>`).join('')}</div>`,
  })}`;
  return { html };
}

export function mentorStudent(ctx: Ctx): View {
  const s = STUDENTS.find((x) => x.id === ctx.params.id);
  if (!s || ctx.state === 'error') return { html: errorState('Nie znaleziono ucznia.') };
  const past = s.id === 'st1' ? store.sessions.filter((x) => x.mentorId === 'm1' && x.status === 'completed') : [];
  const html = `
  <a href="#/mentor/uczniowie" class="back">${icon('back')} Uczniowie</a>
  <div class="layout-side layout-side--right">
    <div class="stack-l">
      <section class="card row gap-m wrap">${avatar(s.name, s.hue, 64)}<div class="grow"><h1 class="h2">${esc(s.name)}</h1>
        <p>${icon('target')} ${esc(s.goal)}</p><p class="muted small">Plan: ${esc(s.plan)} · saldo: ${s.balance} · ${s.sessions} sesji</p></div>
        <a class="btn btn--ghost btn--s" href="#/wiadomosci/t1">Napisz</a></section>
      <section class="card stack"><h2 class="h3">Notatka po sesji · 18 paź</h2>
        <form class="stack" data-form="note" novalidate>
          ${field({ name: 'covered', label: 'Co omówiliśmy', textarea: true, rows: 3, counter: 3000, placeholder: 'np. Rozdzielenie logiki formularza od prezentacji…' })}
          <div class="stack-s"><span class="label">Zadania dla ucznia</span><div data-items class="stack-s">
            <div class="row gap-s"><input name="item" placeholder="np. Dodaj testy do walidacji" aria-label="Zadanie"/><input name="due" type="date" class="w-date" aria-label="Termin"/></div></div>
            <button type="button" class="link small" data-add-item>+ Dodaj zadanie</button><span class="field__err" data-err="item"></span></div>
          ${field({ name: 'next', label: 'Na następną sesję (opcjonalnie)', textarea: true, rows: 2 })}
          <button class="btn btn--primary">Wyślij notatkę uczniowi</button>
        </form></section>
      <section class="card"><h2 class="h3">Historia</h2>
        ${past.length ? `<ol class="timeline">${past.map((p) => `<li><strong>${fmtDateLong(p.startsAt)}</strong> · ${esc(p.goal)}${p.note ? `<p class="small">${esc(p.note)}</p>` : '<p class="small err">Brak notatki</p>'}</li>`).join('')}</ol>` : '<p class="muted">Brak odbytych sesji.</p>'}</section>
    </div>
    <aside class="card stack"><h2 class="h3">Prywatne notatki</h2><p class="muted small">Widzisz tylko Ty.</p>
      <textarea rows="6" aria-label="Prywatne notatki">Mocny w CSS, słabszy w testach. Motywuje go konkretny termin.</textarea>
      <button class="btn btn--ghost btn--s" data-priv>Zapisz</button></aside>
  </div>`;
  return {
    html,
    bind(root) {
      bindCounters(root);
      root.querySelector('[data-priv]')!.addEventListener('click', () => toast('Zapisano'));
      root.querySelector('[data-add-item]')!.addEventListener('click', () => root.querySelector('[data-items]')!.insertAdjacentHTML('beforeend',
        '<div class="row gap-s"><input name="item" placeholder="Zadanie" aria-label="Zadanie"/><input name="due" type="date" class="w-date" aria-label="Termin"/></div>'));
      const f = root.querySelector<HTMLFormElement>('[data-form=note]')!;
      f.addEventListener('submit', (e) => {
        e.preventDefault();
        const items = [...f.querySelectorAll<HTMLInputElement>('input[name=item]')].map((i) => i.value.trim()).filter(Boolean);
        const okCovered = validate(f, { covered: [req(), len(20, 3000)] });
        const bad = items.find((i) => i.length < 3 || i.length > 200);
        f.querySelector('[data-err=item]')!.textContent = bad ? 'Zadanie: 3–200 znaków.' : '';
        if (!okCovered || bad) return;
        toast(`Notatka wysłana${items.length ? ` z ${items.length} zadaniem/ami` : ''}`);
        f.reset();
      });
    },
  };
}

// ---------------------------------------------------------------- M5 Zarobki

export function earnings(ctx: Ctx): View {
  const hours = 176;
  const rate = commissionRate(hours);
  const nt = nextTier(hours);
  const avail = store.payoutDone ? 0 : EARNINGS.filter((e) => e.status === 'dostępne').reduce((a, e) => a + e.gross - e.fee, 0);
  const pending = EARNINGS.filter((e) => e.status === 'oczekujące').reduce((a, e) => a + e.gross - e.fee, 0);
  const list = ctx.state === 'empty' ? [] : EARNINGS;
  const html = `
  <div class="page-head"><h1>Zarobki i wypłaty</h1><button class="btn btn--ghost btn--s" data-csv>Eksport CSV</button></div>
  ${ctx.state === 'error' ? `<p class="notice notice--err" role="alert">${icon('alert')} Ostatnia wypłata nie powiodła się: bank odrzucił przelew (nieprawidłowy IBAN). <a class="link" href="#/konto">Zaktualizuj dane do wypłat</a></p>` : ''}
  ${ctx.state === 'loading' ? `<div class="grid-3">${skeleton(3)}</div>` : `
  <div class="grid-3">
    <div class="card kpi kpi--big"><span>Dostępne do wypłaty</span><strong>${money(avail)}</strong>
      <button class="btn btn--primary btn--s" data-payout ${avail < 100 ? 'disabled' : ''}>Wypłać</button>${avail < 100 ? '<em>Minimum wypłaty: 100 zł</em>' : ''}</div>
    <div class="card kpi kpi--big"><span>Oczekujące</span><strong>${money(pending)}</strong><em>Dostępne 48 h po sesji, jeśli nie ma zgłoszenia</em></div>
    <div class="card kpi kpi--big"><span>Twoja prowizja</span><strong>${Math.round(rate * 100)}%</strong>
      ${nt ? `<div class="progress"><span style="width:${(hours / nt) * 100}%"></span></div><em>${hours} h z ${nt} h do progu ${Math.round(commissionRate(nt) * 100)}%</em>` : '<em>Najniższy próg</em>'}</div>
  </div>`}
  <section class="card"><h2 class="h3">Historia</h2>
    ${list.length ? `<div class="table-wrap"><table class="table"><thead><tr><th>Data</th><th>Uczeń</th><th>Typ</th><th class="right">Brutto</th><th class="right">Prowizja</th><th class="right">Netto</th><th>Status</th></tr></thead><tbody>
      ${list.map((e) => `<tr><td>${fmtDate(e.date)}</td><td>${esc(e.student)}</td><td>${esc(e.type)}</td><td class="right">${money(e.gross)}</td><td class="right">−${money(e.fee)}</td>
        <td class="right"><strong>${money(e.gross - e.fee)}</strong></td><td><span class="badge badge--${e.status === 'dostępne' ? 'scheduled' : e.status === 'oczekujące' ? 'requested' : 'completed'}">${store.payoutDone && e.status === 'dostępne' ? 'w drodze' : e.status}</span></td></tr>`).join('')}
    </tbody></table></div>` : emptyState('Brak zarobków', 'Twoje rozliczone sesje pojawią się tutaj.')}
  </section>`;
  return {
    html,
    bind(root) {
      root.querySelector('[data-csv]')!.addEventListener('click', () => toast('Pobieranie zarobki-2026-10.csv'));
      root.querySelector('[data-payout]')?.addEventListener('click', () => openModal(`<h2 class="h3">Wypłata ${money(avail)}</h2>
        <p>Na konto PL61 •••• •••• 4420. Środki zwykle docierają w 1–2 dni robocze.</p><p class="muted small">Limit: 1 ręczna wypłata na dobę.</p>
        <div class="row gap-s end"><button class="btn btn--ghost" data-close>Anuluj</button><button class="btn btn--primary" data-ok>Zleć wypłatę</button></div>`,
      (mod) => mod.querySelector('[data-ok]')!.addEventListener('click', () => { store.payoutDone = true; closeModal(); toast('Wypłata zlecona'); ctx.rerender(); })));
    },
  };
}

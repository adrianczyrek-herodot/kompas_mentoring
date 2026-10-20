import { store } from '../../demo/store';
import { Ctx, View, avatar, bindCounters, emptyState, errorState, esc, field, fmtDate, icon, len, money, req, skeleton, states, toast, validate } from '../ui';

// ---------------------------------------------------------------- A1 Weryfikacja mentorów

export function verification(ctx: Ctx): View {
  const list = ctx.state === 'empty' ? [] : store.applications;
  const sel = list.find((a) => a.id === ctx.query.get('id')) ?? list[0]!;
  const kycBadge = (k: string) => `<span class="badge badge--${k === 'zweryfikowano' ? 'scheduled' : k === 'oczekuje' ? 'requested' : 'cancelled'}">KYC: ${k}</span>`;
  const html = `
  <div class="page-head"><h1>Weryfikacja mentorów</h1><span class="muted small">SLA: 2 dni robocze</span></div>
  ${states(ctx, {
    loading: () => skeleton(3, 'line'),
    error: () => errorState('Nie udało się wczytać kolejki.'),
    empty: () => emptyState('Kolejka pusta', 'Wszystkie zgłoszenia zostały rozpatrzone.'),
    success: () => `<div class="layout-side">
      <aside class="side side--static"><div class="list">${list.map((a) => `<a class="list-item ${a === sel ? 'is-active' : ''}" href="#/admin/weryfikacja?id=${a.id}">${avatar(a.name, a.hue, 40)}
        <div class="grow"><strong>${esc(a.name)}</strong><br><span class="muted small">${fmtDate(a.submitted)}</span></div>${a.kyc !== 'zweryfikowano' ? icon('alert') : ''}</a>`).join('')}</div></aside>
      <section class="card stack">
        <div class="row gap-m wrap">${avatar(sel.name, sel.hue, 72)}<div class="grow"><h2>${esc(sel.name)}</h2><p>${esc(sel.headline)}</p>
          <div class="row gap-s wrap">${kycBadge(sel.kyc)}<span class="badge">${sel.linkedin ? 'LinkedIn podany' : 'Brak LinkedIn'}</span>${sel.categories.map((c) => `<span class="tag">${esc(c)}</span>`).join('')}</div></div></div>
        <div class="video-ph video-ph--s">${icon('play')}<span>Wideo powitalne</span></div>
        <fieldset class="stack-s"><legend class="h4">Checklista</legend>
          ${['Zdjęcie przedstawia twarz, bez logo i tekstu', 'Opis bez danych kontaktowych i linków do płatności', 'Doświadczenie zgodne z LinkedIn', 'Wideo: dobra jakość dźwięku, ten sam człowiek co na zdjęciu', 'Stawka w widełkach kategorii'].map((c) => `<label class="check"><input type="checkbox" data-chk/> ${c}</label>`).join('')}
        </fieldset>
        <form class="stack" data-form="decision" novalidate>
          <fieldset class="segmented"><legend class="small">Decyzja</legend>
            <label><input type="radio" name="decision" value="approve"/> Zatwierdź</label><label><input type="radio" name="decision" value="changes"/> Poproś o zmiany</label><label><input type="radio" name="decision" value="reject"/> Odrzuć</label></fieldset>
          <div class="field__err" data-err="decision"></div>
          <div data-fields hidden><fieldset><legend class="small">Pola do poprawy</legend><div class="chips">${['Zdjęcie', 'Nagłówek', 'Opis', 'Wideo', 'Stawka', 'Dokument'].map((p) => `<label class="chip chip--check"><input type="checkbox" name="fieldsToFix" value="${p}"/> ${p}</label>`).join('')}</div>
            <div class="field__err" data-err="fieldsToFix"></div></fieldset></div>
          ${field({ name: 'comment', label: 'Komentarz dla kandydata', textarea: true, rows: 3, counter: 1000 })}
          <button class="btn btn--primary">Zapisz decyzję</button>
        </form>
        <p class="muted small">${icon('shield')} Każda decyzja trafia do dziennika audytu.</p>
      </section></div>`,
  })}`;
  return {
    html,
    bind(root) {
      bindCounters(root);
      const f = root.querySelector<HTMLFormElement>('[data-form=decision]');
      if (!f || !sel) return;
      f.addEventListener('change', () => {
        root.querySelector<HTMLElement>('[data-fields]')!.hidden = (f.elements.namedItem('decision') as RadioNodeList).value !== 'changes';
      });
      f.addEventListener('submit', (e) => {
        e.preventDefault();
        const dec = (f.elements.namedItem('decision') as RadioNodeList).value;
        const ok = validate(f, {
          decision: [req('Wybierz decyzję.'), (v) => (v === 'approve' && sel.kyc !== 'zweryfikowano' ? 'Nie można zatwierdzić bez pozytywnej weryfikacji KYC.' : null),
            (v) => (v === 'approve' && root.querySelectorAll('[data-chk]:not(:checked)').length ? 'Odhacz całą checklistę przed zatwierdzeniem.' : null)],
          fieldsToFix: [() => (dec === 'changes' && !f.querySelectorAll('input[name=fieldsToFix]:checked').length ? 'Wskaż co najmniej jedno pole.' : null)],
          comment: [(v) => (dec !== 'approve' ? (req('Komentarz jest wymagany.')(v, f) ?? len(10, 1000)(v, f)) : null)],
        });
        if (!ok) return;
        store.applications = store.applications.filter((a) => a.id !== sel.id);
        toast(dec === 'approve' ? `${sel.name}: profil opublikowany` : dec === 'changes' ? 'Wysłano prośbę o zmiany' : 'Zgłoszenie odrzucone');
        history.replaceState(null, '', '#/admin/weryfikacja');
        ctx.rerender();
      });
    },
  };
}

// ---------------------------------------------------------------- A2 Spory i zwroty

export function disputes(ctx: Ctx): View {
  const list = ctx.state === 'empty' ? [] : store.disputes;
  const sel = list.find((d) => d.id === ctx.query.get('id')) ?? list[0]!;
  const html = `
  <div class="page-head"><h1>Spory i zwroty</h1></div>
  ${states(ctx, {
    loading: () => skeleton(3, 'line'),
    error: () => errorState('Nie udało się wczytać sporów.'),
    empty: () => emptyState('Brak otwartych sporów', 'Nowe zgłoszenia problemów pojawią się tutaj.'),
    success: () => `<div class="layout-side">
      <aside class="side side--static"><div class="list">${list.map((d) => `<a class="list-item ${d === sel ? 'is-active' : ''}" href="#/admin/spory?id=${d.id}">
        <div class="grow"><strong>${esc(d.reason)}</strong><br><span class="muted small">${esc(d.student)} ↔ ${esc(d.mentor)} · ${fmtDate(d.opened)}</span></div></a>`).join('')}</div></aside>
      <section class="card stack">
        <div class="row between wrap"><h2>${esc(sel.reason)}</h2><span class="badge badge--requested">Otwarty</span></div>
        <p class="muted small">Sesja ${esc(sel.sessionId)} · wartość ${money(sel.amount)}</p>
        <h3 class="h4">Oś zdarzeń pokoju</h3><ol class="timeline timeline--mono">${sel.events.map((e) => `<li>${esc(e)}</li>`).join('')}</ol>
        <div class="grid-2"><div class="quote"><span class="eyebrow">Uczeń · ${esc(sel.student)}</span><p>${esc(sel.studentSays)}</p></div>
          <div class="quote"><span class="eyebrow">Mentor · ${esc(sel.mentor)}</span><p>${esc(sel.mentorSays)}</p></div></div>
        <form class="stack" data-form="resolve" novalidate>
          <fieldset class="stack-s"><legend class="h4">Rozstrzygnięcie</legend>
            ${[['balance', 'Zwrot do salda ucznia'], ['card', 'Zwrot na kartę'], ['partial', 'Zwrot częściowy'], ['none', 'Bez zwrotu']].map(([v, l]) => `<label class="check"><input type="radio" name="res" value="${v}"/> ${l}</label>`).join('')}
            <div class="field__err" data-err="res"></div></fieldset>
          <div data-partial hidden>${field({ name: 'amount', label: `Kwota zwrotu (maks. ${sel.amount} zł)`, type: 'number' })}</div>
          ${field({ name: 'why', label: 'Uzasadnienie (otrzymają obie strony)', textarea: true, rows: 3, counter: 1000 })}
          <button class="btn btn--primary">Rozstrzygnij spór</button>
        </form>
      </section></div>`,
  })}`;
  return {
    html,
    bind(root) {
      bindCounters(root);
      const f = root.querySelector<HTMLFormElement>('[data-form=resolve]');
      if (!f || !sel) return;
      f.addEventListener('change', () => { root.querySelector<HTMLElement>('[data-partial]')!.hidden = (f.elements.namedItem('res') as RadioNodeList).value !== 'partial'; });
      f.addEventListener('submit', (e) => {
        e.preventDefault();
        const res = (f.elements.namedItem('res') as RadioNodeList).value;
        if (!validate(f, {
          res: [req('Wybierz rozstrzygnięcie.')],
          amount: [(v) => (res === 'partial' ? (Number(v) > 0 && Number(v) <= sel.amount ? null : `Kwota od 1 do ${sel.amount} zł.`) : null)],
          why: [req(), len(20, 1000)],
        })) return;
        store.disputes = store.disputes.filter((x) => x.id !== sel.id);
        toast('Spór rozstrzygnięty. Obie strony dostały powiadomienie.');
        history.replaceState(null, '', '#/admin/spory');
        ctx.rerender();
      });
    },
  };
}


// Zmiany stanu demo — jedyne miejsce, w którym ekrany React modyfikują `store`.
// Każda akcja kończy się `notify()`. W fazie 5 akcje zastąpią wywołania serwisów (server actions + DI) o tych samych nazwach.
import { HOLD_MINUTES, cancellationPolicy, transferSessions, type Mentor, type Role, type Session, type Thread } from '@devmentor/core/domain';
import { applyDemoStudent, applyFreshStudent, mentorById, notify, store, type BookingDraft } from './store';

// ---- Rola i logowanie ----------------------------------------------------------

/** Przełączenie roli z paska mockupu (uczeń dostaje personę demo). */
export function switchRole(role: Role): void {
  if (role === 'student') applyDemoStudent();
  store.role = role;
  store.loggedIn = role !== 'guest';
  notify();
}

/** Przełączenie roli ze strażnika dostępu — bez zmiany danych ucznia (jak w mockupie). */
export function assumeRole(role: Role): void {
  store.role = role;
  store.loggedIn = true;
  notify();
}

/** Zapamiętanie trasy, na którą wrócimy po zalogowaniu. */
export function rememberReturnTo(route: string): void {
  store.returnTo = route;
}

/** Logowanie/rejestracja; zwraca trasę mockupu, na którą przejść. */
export function logIn(role: 'student' | 'mentor', fresh: boolean): string {
  if (fresh) applyFreshStudent(); else applyDemoStudent();
  store.loggedIn = true;
  store.role = role;
  const back = store.returnTo;
  store.returnTo = '';
  notify();
  return back || (role === 'mentor' ? '#/mentor/onboarding/1' : '#/sesje');
}

// ---- Rezerwacja (U1–U3) ---------------------------------------------------------

export function selectSlot(draft: BookingDraft): void {
  store.draft = draft;
  notify();
}

export function clearDraft(): void {
  store.draft = null;
  notify();
}

/** Blokada wybranego terminu na `HOLD_MINUTES` (liczona zegarem przeglądarki — odliczanie w checkoutcie). */
export function holdDraft(): void {
  if (store.draft) store.draft.holdExpires = Date.now() + HOLD_MINUTES * 6e4;
  notify();
}

export function expireHold(): void {
  if (store.draft) store.draft.holdExpires = Date.now();
  notify();
}

/** Zapis rezerwacji z bieżącego szkicu; zwraca id nowej sesji. */
export function confirmBooking(mentor: Mentor, goal: string): string {
  const d = store.draft!;
  const id = `s${++store.bookingSeq}`;
  store.sessions.push({
    id, mentorId: mentor.id, student: 'Ty', startsAt: d.startsAt!, durationMin: d.durationMin, type: d.type,
    status: d.type === 'trial' ? 'requested' : 'scheduled',
    goal: goal.trim() || 'Sesja z planu',
  });
  if (d.type === 'plan') store.balances[mentor.id] = (store.balances[mentor.id] ?? 1) - 1;
  store.draft = null;
  notify();
  return id;
}

// ---- Sesje (U4–U7) ---------------------------------------------------------------

export function cancelSession(s: Session, now: Date): void {
  const { refundsBalance } = cancellationPolicy(s, now);
  s.status = 'cancelled';
  if (refundsBalance) store.balances[s.mentorId] = (store.balances[s.mentorId] ?? 0) + 1;
  notify();
}

export function rescheduleSession(s: Session, startsAt: string): void {
  s.startsAt = startsAt;
  notify();
}

export function reportProblem(s: Session): void {
  s.status = 'disputed';
  notify();
}

/** Mentor się nie pojawił — sesja z planu wraca do salda. */
export function markNoShow(s: Session): void {
  s.status = 'no_show';
  if (s.type === 'plan') store.balances[s.mentorId] = (store.balances[s.mentorId] ?? 0) + 1;
  notify();
}

export function completeSession(s: Session): void {
  s.status = 'completed';
  notify();
}

export function submitReview(s: Session): void {
  s.reviewed = true;
  notify();
}

export function setActionItem(s: Session, index: number, done: boolean): void {
  const item = s.actionItems?.[index];
  if (item) item.done = done;
  notify();
}

// ---- Plany i saldo (U8), postępy (U9) ----------------------------------------------

export function buyPlan(mentorId: string, perWeek: number, durationMin: number): void {
  store.subscription = { mentorId, perWeek, durationMin, renewsOn: '2026-11-17', status: 'active' };
  store.balances[mentorId] = (store.balances[mentorId] ?? 0) + perWeek * 4;
  notify();
}

export function togglePlanPause(): void {
  if (store.subscription) store.subscription.status = store.subscription.status === 'active' ? 'paused' : 'active';
  notify();
}

export function cancelPlan(): void {
  store.subscription = null;
  notify();
}

/** Przeniesienie całego salda do innego mentora z przeliczeniem po stawkach. */
export function transferBalance(fromId: string, toId: string): void {
  const from = mentorById(fromId)!;
  const to = mentorById(toId)!;
  store.balances[to.id] = (store.balances[to.id] ?? 0) + transferSessions(store.balances[from.id] ?? 0, from.rate60, to.rate60);
  store.balances[from.id] = 0;
  notify();
}

export function setMilestone(index: number, done: boolean): void {
  const m = store.goal.milestones[index];
  if (m) m.done = done;
  notify();
}

// ---- Wiadomości i powiadomienia (S1–S2) ------------------------------------------------

/** Rozmowa z mentorem — istniejąca albo nowa (na początku listy). */
export function threadWith(m: Mentor): Thread {
  let t = store.threads.find((x) => x.withName === m.name);
  if (!t) {
    t = { id: `t-${m.id}`, withName: m.name, hue: m.hue, unread: 0, messages: [] };
    store.threads.unshift(t);
    notify();
  }
  return t;
}

export function markThreadRead(t: Thread): void {
  if (t.unread === 0) return;
  t.unread = 0;
  notify();
}

export function sendMessage(t: Thread, text: string, at: Date): void {
  t.messages.push({ me: true, text, at: at.toISOString() });
  notify();
}

export function markAllNotificationsRead(): void {
  store.notifications.forEach((n) => { n.unread = false; });
  notify();
}

// ---- Strony publiczne (P1–P3) ----------------------------------------------------------

/** Przełącza ulubionego mentora; zwraca nowy stan. */
export function toggleFavorite(mentorId: string): boolean {
  if (store.favorites.has(mentorId)) store.favorites.delete(mentorId); else store.favorites.add(mentorId);
  notify();
  return store.favorites.has(mentorId);
}

/** „Zostań mentorem” — zalogowany uczeń przechodzi w mockupie na rolę mentora. */
export function startMentorOnboarding(): void {
  if (store.role === 'student') store.role = 'mentor';
  notify();
}

// ---- Panel mentora (M1–M5) -----------------------------------------------------------------

/** Zapis kroku onboardingu (pola formularza) i flag spoza formularza (zdjęcie, wideo, KYC). */
export function saveOnboarding(values: Record<string, string>): void {
  Object.assign(store.onboarding.data, values);
  notify();
}

/** Wysłanie profilu do weryfikacji — zgłoszenie trafia na początek kolejki admina. */
export function submitOnboarding(): void {
  const d = store.onboarding.data;
  store.onboarding.status = 'submitted';
  store.applications.unshift({
    id: 'a-new', name: d.name ?? '', headline: d.headline ?? '', submitted: '2026-10-20', kyc: 'zweryfikowano', linkedin: true, hue: 168,
    categories: (d.cat ?? '').split(','),
  });
  notify();
}

/** „Przejdź do panelu mentora” po wysłaniu profilu (w mockupie bez weryfikacji). */
export function enterMentorPanel(): void {
  store.role = 'mentor';
  notify();
}

/** Godzina w siatce dostępności (`dzień-godzina`): onboarding albo szablon tygodniowy mentora. */
export function setAvailability(which: 'onboarding' | 'template', key: string, on: boolean): void {
  const set = which === 'onboarding' ? store.onboarding.availability : store.mentorTemplate;
  if (on) set.add(key); else set.delete(key);
  notify();
}

/** Akceptacja albo odrzucenie prośby o sesję próbną — znika z listy. */
export function answerTrialRequest(id: string): void {
  store.requests = store.requests.filter((r) => r.id !== id);
  notify();
}

export function requestPayout(): void {
  store.payoutDone = true;
  notify();
}

// ---- Panel admina (A1–A2) ------------------------------------------------------------------

/** Decyzja w sprawie zgłoszenia mentora (każda zdejmuje je z kolejki). */
export function decideApplication(id: string): void {
  store.applications = store.applications.filter((a) => a.id !== id);
  notify();
}

export function resolveDispute(id: string): void {
  store.disputes = store.disputes.filter((d) => d.id !== id);
  notify();
}

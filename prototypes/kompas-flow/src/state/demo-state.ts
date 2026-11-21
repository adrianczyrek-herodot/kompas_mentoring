/**
 * In-memory demo state: who is signed in, bookings, balances, the booking draft with its 10-minute
 * hold, and the review-bar scenarios. Nothing is persisted or sent anywhere; a reload starts over.
 */
import {
  type Account,
  ACCOUNTS,
  type AccountId,
  type Booking,
  INITIAL_BALANCES,
  INITIAL_BOOKINGS,
  NEW_STUDENT,
  type StudentId,
} from '../data/accounts';
import { addMinutes, DEMO_NOW, TZ } from '../lib/clock';

const HOLD_SECONDS = 600;

export type PaymentMethod = 'card' | 'blik' | 'p24';

export type Draft = {
  mentorId: string;
  type: 'trial' | 'plan';
  durationMin: 30 | 60;
  week: number;
  timeZone: string;
  slotId?: string;
  startsAt?: string;
  /** Hold created when entering checkout (brief rule 5). */
  hold?: { expiresAt: string; secondsLeft: number };
  goal: string;
  method: PaymentMethod;
  promoApplied: boolean;
};

export type PaymentOutcome = 'success' | 'declined' | '3ds-cancelled' | 'webhook-delayed';
export type FailNext = 'none' | 'network' | 'server';
export type DataState = 'default' | 'loading' | 'empty' | 'error';

export type Scenarios = {
  payment: PaymentOutcome;
  /** The next hold answers 409 „slot taken”. */
  slotConflict: boolean;
  /** The next request (form submit or action) fails once. */
  failNext: FailNext;
  /** The next action of a signed-in user finds the session expired → P4 with returnTo. */
  sessionExpired: boolean;
  /** Forces the data state of the current screen. */
  dataState: DataState;
  /** Minutes added to the fixed demo „now”. */
  clockOffset: number;
  mentorNoShow: boolean;
  trialAnswer: 'accept' | 'decline';
};

export const DEFAULT_SCENARIOS: Scenarios = {
  payment: 'success',
  slotConflict: false,
  failNext: 'none',
  sessionExpired: false,
  dataState: 'default',
  clockOffset: 0,
  mentorNoShow: false,
  trialAnswer: 'accept',
};

export type DemoState = {
  accountId: AccountId;
  newStudentName: string;
  bookings: Booking[];
  balances: Record<StudentId, Record<string, number>>;
  favorites: string[];
  /** Slots taken by other people during the demo (409 scenario). */
  takenSlots: string[];
  draft: Draft | null;
  seq: number;
  scenarios: Scenarios;
};

export const INITIAL_STATE: DemoState = {
  accountId: 'guest',
  newStudentName: NEW_STUDENT.name,
  bookings: INITIAL_BOOKINGS,
  balances: INITIAL_BALANCES,
  favorites: [],
  takenSlots: [],
  draft: null,
  seq: 0,
  scenarios: DEFAULT_SCENARIOS,
};

export type Action =
  | { type: 'switch-account'; accountId: AccountId }
  | { type: 'register'; name: string }
  | { type: 'toggle-favorite'; mentorId: string }
  | { type: 'start-draft'; draft: Pick<Draft, 'mentorId' | 'type' | 'durationMin'> }
  | { type: 'update-draft'; patch: Partial<Draft> }
  | { type: 'create-hold'; now: string }
  | { type: 'tick-hold' }
  | { type: 'expire-hold' }
  | { type: 'release-hold' }
  | { type: 'confirm-booking'; id: string; studentId: StudentId }
  | { type: 'cancel-booking'; id: string; refundToBalance: boolean }
  | { type: 'reschedule-booking'; id: string; startsAt: string }
  | { type: 'report-problem'; id: string }
  | { type: 'remove-slot'; slotId: string }
  | { type: 'set-scenarios'; patch: Partial<Scenarios> };

function emptyDraft(base: Pick<Draft, 'mentorId' | 'type' | 'durationMin'>): Draft {
  return { ...base, week: 0, timeZone: TZ, goal: '', method: 'card', promoApplied: false };
}

function changeBalance(state: DemoState, studentId: StudentId, mentorId: string, delta: number) {
  const current = state.balances[studentId][mentorId] ?? 0;
  return {
    ...state.balances,
    [studentId]: { ...state.balances[studentId], [mentorId]: current + delta },
  };
}

function updateBooking(state: DemoState, id: string, patch: Partial<Booking>): Booking[] {
  return state.bookings.map((booking) => (booking.id === id ? { ...booking, ...patch } : booking));
}

function confirm(state: DemoState, id: string, studentId: StudentId): DemoState {
  const draft = state.draft;
  if (!draft?.startsAt) return state;
  const booking: Booking = {
    id,
    mentorId: draft.mentorId,
    studentId,
    startsAt: draft.startsAt,
    durationMin: draft.durationMin,
    type: draft.type,
    // A trial waits for the mentor (KONCEPCJA F1, E3-S7); a plan session is booked from balance.
    status: draft.type === 'trial' ? 'requested' : 'scheduled',
    goal: draft.goal.trim() || 'Sesja z planu',
  };
  return {
    ...state,
    bookings: [...state.bookings, booking],
    balances:
      draft.type === 'plan' ? changeBalance(state, studentId, draft.mentorId, -1) : state.balances,
    draft: null,
    seq: state.seq + 1,
  };
}

function cancel(state: DemoState, id: string, refundToBalance: boolean): DemoState {
  const booking = state.bookings.find((b) => b.id === id);
  if (!booking) return state;
  const refund = refundToBalance && booking.type === 'plan';
  return {
    ...state,
    bookings: updateBooking(state, id, { status: 'cancelled' }),
    balances: refund
      ? changeBalance(state, booking.studentId, booking.mentorId, 1)
      : state.balances,
  };
}

type DraftAction = Extract<
  Action,
  { type: 'start-draft' | 'update-draft' | 'create-hold' | 'tick-hold' | 'expire-hold' | 'release-hold' }
>;

function draftReducer(state: DemoState, action: DraftAction): DemoState {
  const draft = state.draft;
  switch (action.type) {
    case 'start-draft':
      return {
        ...state,
        draft:
          draft?.mentorId === action.draft.mentorId && draft.type === action.draft.type
            ? draft
            : emptyDraft(action.draft),
      };
    case 'update-draft':
      return draft ? { ...state, draft: { ...draft, ...action.patch } } : state;
    case 'create-hold':
      return draft
        ? {
            ...state,
            draft: {
              ...draft,
              hold: {
                expiresAt: addMinutes(action.now, HOLD_SECONDS / 60),
                secondsLeft: HOLD_SECONDS,
              },
            },
          }
        : state;
    case 'tick-hold':
      return draft?.hold && draft.hold.secondsLeft > 0
        ? {
            ...state,
            draft: { ...draft, hold: { ...draft.hold, secondsLeft: draft.hold.secondsLeft - 1 } },
          }
        : state;
    case 'expire-hold':
      return draft?.hold ? { ...state, draft: { ...draft, hold: { ...draft.hold, secondsLeft: 0 } } } : state;
    case 'release-hold': {
      if (!draft) return state;
      const rest = { ...draft };
      delete rest.hold;
      delete rest.slotId;
      delete rest.startsAt;
      return { ...state, draft: rest };
    }
  }
}

export function reducer(state: DemoState, action: Action): DemoState {
  switch (action.type) {
    case 'start-draft':
    case 'update-draft':
    case 'create-hold':
    case 'tick-hold':
    case 'expire-hold':
    case 'release-hold':
      return draftReducer(state, action);
    case 'switch-account':
      return { ...state, accountId: action.accountId };
    case 'register':
      return { ...state, accountId: 'new', newStudentName: action.name };
    case 'toggle-favorite':
      return {
        ...state,
        favorites: state.favorites.includes(action.mentorId)
          ? state.favorites.filter((id) => id !== action.mentorId)
          : [...state.favorites, action.mentorId],
      };
    case 'confirm-booking':
      return confirm(state, action.id, action.studentId);
    case 'cancel-booking':
      return cancel(state, action.id, action.refundToBalance);
    case 'reschedule-booking':
      return { ...state, bookings: updateBooking(state, action.id, { startsAt: action.startsAt }) };
    case 'report-problem':
      return { ...state, bookings: updateBooking(state, action.id, { status: 'disputed' }) };
    case 'remove-slot':
      // 409: someone else took the slot; the grid refreshes without it (KONCEPCJA §U1 Er).
      return { ...state, takenSlots: [...state.takenSlots, action.slotId] };
    case 'set-scenarios':
      return { ...state, scenarios: { ...state.scenarios, ...action.patch } };
  }
}

const GUEST: Account = { id: 'guest', role: 'guest', name: 'Gość', purpose: '' };

export function accountOf(state: DemoState): Account {
  if (state.accountId === 'new') return { ...NEW_STUDENT, name: state.newStudentName };
  return ACCOUNTS.find((account) => account.id === state.accountId) ?? GUEST;
}

export function nowOf(state: DemoState): string {
  return state.scenarios.clockOffset === 0
    ? DEMO_NOW
    : addMinutes(DEMO_NOW, state.scenarios.clockOffset);
}

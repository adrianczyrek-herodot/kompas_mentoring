/**
 * Stage 2 demo data that changes while clicking: goals, plans, payments, messages, notifications,
 * mentor work and the trust team's queues. Actions that touch bookings or balances get them as
 * `Core` and return the updated core, so one click updates every role's screens (e.g. a dispute
 * reported in U5 appears in A2; A1 approving Adam opens his M2).
 */
import {
  type AccountId,
  type ActionItem,
  type Booking,
  type Review,
  STUDENT_NAMES,
  type StudentId,
} from '../data/accounts';
import { INITIAL_NOTIFICATIONS, INITIAL_THREADS, type Notification, type Thread } from '../data/inbox';
import {
  commissionPercent,
  type AvailabilityException,
  type Earning,
  INITIAL_EARNINGS,
  INITIAL_MENTOR_NOTES,
  initialSettings,
  KASIA_HOURS,
  type MentorSettings,
  PAYOUT_MINIMUM,
  type Payout,
} from '../data/mentor-work';
import { type Mentor, mentorById, TRIAL_SERVICE_FEE } from '../data/mentors';
import {
  type Goal,
  INITIAL_GOALS,
  INITIAL_PAYMENTS,
  INITIAL_SUBSCRIPTIONS,
  type Payment,
  type PlanStatus,
  planPrice,
  type Subscription,
  transferSessions,
} from '../data/progress';
import {
  type Application,
  type AuditEntry,
  type Dispute,
  type DisputeOutcome,
  INITIAL_APPLICATIONS,
  INITIAL_DISPUTES,
} from '../data/trust';
import type { SlotRules } from '../data/slots';
import { addMinutes, toMs } from '../lib/clock';

export type Profile = {
  name?: string;
  timeZone?: string;
  /** S3 notification preferences: key → on/off. */
  notify?: Record<string, boolean>;
};

export type World = {
  goals: Partial<Record<StudentId, Goal>>;
  subscriptions: Subscription[];
  payments: Payment[];
  threads: Thread[];
  notifications: Notification[];
  mentorNotes: Partial<Record<StudentId, string>>;
  earnings: Earning[];
  payouts: Payout[];
  mentorSettings: Record<string, MentorSettings>;
  applications: Application[];
  disputes: Dispute[];
  audit: AuditEntry[];
  /** M1 draft of the signed-in mentor candidate, saved after every step (KONCEPCJA F4). */
  onboardingDraft: Record<string, string>;
  /** Room events per booking (U6) — the evidence shown in A2. */
  roomEvents: Record<string, string[]>;
  profiles: Partial<Record<AccountId, Profile>>;
  /** „Wygaśnięcie sesji” fired: the re-login dialog is open, the screen keeps its data. */
  reauth: boolean;
};

export const INITIAL_WORLD: World = {
  goals: INITIAL_GOALS,
  subscriptions: INITIAL_SUBSCRIPTIONS,
  payments: INITIAL_PAYMENTS,
  threads: INITIAL_THREADS,
  notifications: INITIAL_NOTIFICATIONS,
  mentorNotes: INITIAL_MENTOR_NOTES,
  earnings: INITIAL_EARNINGS,
  payouts: [],
  mentorSettings: { m1: initialSettings('m1'), m6: initialSettings('m6') },
  applications: INITIAL_APPLICATIONS,
  disputes: INITIAL_DISPUTES,
  audit: [],
  onboardingDraft: {},
  roomEvents: {},
  profiles: {},
  reauth: false,
};

type RoomAction =
  | { type: 'log-room-event'; bookingId: string; text: string }
  | { type: 'end-session'; id: string }
  | { type: 'report-no-show'; id: string }
  | { type: 'report-problem'; id: string; reason: string; description: string }
  | { type: 'submit-review'; id: string; review: Review; replacement: boolean }
  | { type: 'toggle-action-item'; bookingId: string; index: number }
  | { type: 'answer-trial'; id: string; accept: boolean; reason?: string }
  | { type: 'add-session-note'; bookingId: string; note: string; actionItems: ActionItem[] };

type PlanAction =
  | { type: 'set-goal'; studentId: StudentId; text: string; targetDate?: string }
  | { type: 'toggle-milestone'; studentId: StudentId; index: number }
  | { type: 'start-plan'; studentId: StudentId; mentorId: string; perWeek: number; durationMin: 30 | 60 }
  | { type: 'change-plan'; id: string; perWeek: number; durationMin: 30 | 60 }
  | { type: 'set-plan-status'; id: string; status: PlanStatus }
  | { type: 'transfer-balance'; studentId: StudentId; fromMentorId: string; toMentorId: string };

type InboxAction =
  | { type: 'open-thread'; studentId: StudentId; mentorId: string }
  | { type: 'send-message'; threadId: string; from: 'student' | 'mentor'; text: string; failed: boolean }
  | { type: 'retry-message'; threadId: string; messageId: string }
  | { type: 'read-thread'; threadId: string; side: 'student' | 'mentor' }
  | { type: 'read-notification'; id: string }
  | { type: 'read-all-notifications'; accountId: AccountId }
  | { type: 'update-profile'; accountId: AccountId; patch: Profile }
  | { type: 'set-reauth'; value: boolean };

type MentorAction =
  | { type: 'set-mentor-note'; studentId: StudentId; text: string }
  | { type: 'update-mentor-settings'; mentorId: string; patch: Partial<Omit<MentorSettings, 'exceptions'>> }
  | { type: 'add-exception'; mentorId: string; exception: AvailabilityException }
  | { type: 'remove-exception'; mentorId: string; id: string }
  | { type: 'request-payout'; mentorId: string }
  | { type: 'save-onboarding'; patch: Record<string, string> }
  | { type: 'submit-application'; accountId: AccountId };

type TrustAction =
  | { type: 'decide-application'; id: string; decision: 'approve' | 'changes' | 'reject'; fields: string[]; comment: string }
  | { type: 'resolve-dispute'; id: string; outcome: DisputeOutcome; refund: bigint; message: string };

export type WorldAction = RoomAction | PlanAction | InboxAction | MentorAction | TrustAction;

/** Every type of an action group, checked both ways by the compiler. */
function typesOf<A extends { type: string }>() {
  return <const T extends readonly A['type'][]>(list: T & ([Exclude<A['type'], T[number]>] extends [never] ? unknown : never)) =>
    new Set<A['type']>(list);
}

const ROOM = typesOf<RoomAction>()(['log-room-event', 'end-session', 'report-no-show', 'report-problem', 'submit-review', 'toggle-action-item', 'answer-trial', 'add-session-note']);
const PLAN = typesOf<PlanAction>()(['set-goal', 'toggle-milestone', 'start-plan', 'change-plan', 'set-plan-status', 'transfer-balance']);
const INBOX = typesOf<InboxAction>()(['open-thread', 'send-message', 'retry-message', 'read-thread', 'read-notification', 'read-all-notifications', 'update-profile', 'set-reauth']);
const MENTOR = typesOf<MentorAction>()(['set-mentor-note', 'update-mentor-settings', 'add-exception', 'remove-exception', 'request-payout', 'save-onboarding', 'submit-application']);

const WORLD_TYPES = new Set<string>([...ROOM, ...PLAN, ...INBOX, ...MENTOR, 'decide-application', 'resolve-dispute']);

export function isWorldAction(action: { type: string }): action is WorldAction {
  return WORLD_TYPES.has(action.type);
}

/** Bookings and balances live in the core demo state; world actions may change them. */
export type Core = {
  bookings: Booking[];
  balances: Record<StudentId, Record<string, number>>;
  newStudentName: string;
};

type Step = { world: World; core: Core };

const MENTOR_ACCOUNTS: Partial<Record<string, AccountId>> = { m1: 'kasia', m6: 'adam' };
const STUDENT_ACCOUNTS: Partial<Record<StudentId, AccountId>> = {
  adrian: 'adrian',
  julia: 'julia',
  pawel: 'pawel',
  new: 'new',
};

export function mentorAccountOf(mentorId: string): AccountId | undefined {
  return MENTOR_ACCOUNTS[mentorId];
}

export function studentNameOf(core: Pick<Core, 'newStudentName'>, studentId: StudentId): string {
  return studentId === 'new' ? core.newStudentName : STUDENT_NAMES[studentId];
}

/** Value of one session: the trial price, or the 60-minute rate (half for 30 min). */
export function sessionValue(booking: Booking): bigint {
  const mentor = mentorById(booking.mentorId);
  if (!mentor) return 0n;
  if (booking.type === 'trial') return mentor.trialPrice;
  return booking.durationMin === 60 ? mentor.rate60 : mentor.rate60 / 2n;
}

function clockTime(iso: string): string {
  return new Intl.DateTimeFormat('pl-PL', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    timeZone: 'Europe/Warsaw',
  }).format(toMs(iso));
}

export function notify(world: World, accountId: AccountId | undefined, text: string, link: string, now: string): World {
  if (!accountId) return world;
  const id = `n-${String(world.notifications.length + 1)}`;
  return { ...world, notifications: [{ id, accountId, text, at: now, link, read: false }, ...world.notifications] };
}

function audit(world: World, actor: string, action: string, subject: string, now: string): World {
  return { ...world, audit: [{ at: now, actor, action, subject }, ...world.audit] };
}

function patchBooking(core: Core, id: string, patch: Partial<Booking>): Core {
  return { ...core, bookings: core.bookings.map((b) => (b.id === id ? { ...b, ...patch } : b)) };
}

function addBalance(core: Core, studentId: StudentId, mentorId: string, delta: number): Core {
  const current = core.balances[studentId][mentorId] ?? 0;
  return {
    ...core,
    balances: { ...core.balances, [studentId]: { ...core.balances[studentId], [mentorId]: current + delta } },
  };
}

function addPayment(world: World, payment: Omit<Payment, 'id'>): World {
  return { ...world, payments: [...world.payments, { ...payment, id: `pay-${String(world.payments.length + 1)}` }] };
}

function bookingStep(step: Step, action: RoomAction, now: string): Step {
  const { world, core } = step;
  const find = (id: string) => core.bookings.find((b) => b.id === id);
  switch (action.type) {
    case 'log-room-event': {
      const list = world.roomEvents[action.bookingId] ?? [];
      const line = `${clockTime(now)} — ${action.text}`;
      return { core, world: { ...world, roomEvents: { ...world.roomEvents, [action.bookingId]: [...list, line] } } };
    }
    case 'end-session': {
      const booking = find(action.id);
      if (!booking) return step;
      const gross = sessionValue(booking);
      const fee = booking.type === 'trial' ? gross : (gross * BigInt(commissionPercent(KASIA_HOURS))) / 100n;
      const earning: Earning = {
        id: `e-${booking.id}`,
        mentorId: booking.mentorId,
        bookingId: booking.id,
        date: booking.startsAt.slice(0, 10),
        studentName: studentNameOf(core, booking.studentId),
        type: booking.type === 'trial' ? 'Sesja próbna' : booking.durationMin === 60 ? 'Plan 60 min' : 'Plan 30 min',
        gross,
        fee,
        status: 'pending',
      };
      const logged = bookingStep(step, { type: 'log-room-event', bookingId: booking.id, text: 'koniec sesji' }, now);
      return {
        core: patchBooking(core, booking.id, { status: 'completed' }),
        world: { ...logged.world, earnings: [earning, ...world.earnings] },
      };
    }
    case 'report-no-show': {
      const booking = find(action.id);
      if (!booking) return step;
      const logged = bookingStep(step, { type: 'log-room-event', bookingId: booking.id, text: 'uczeń kliknął „Mentor się nie pojawił”' }, now);
      let next: Step = {
        core: patchBooking(core, booking.id, { status: 'no_show' }),
        world: logged.world,
      };
      // KONCEPCJA F2: the session returns to the balance automatically; a paid trial is refunded.
      if (booking.type === 'plan') next = { ...next, core: addBalance(next.core, booking.studentId, booking.mentorId, 1) };
      else next = { ...next, world: addPayment(next.world, { studentId: booking.studentId, at: now, description: `Zwrot · sesja próbna (${mentorById(booking.mentorId)?.name ?? ''})`, amount: sessionValue(booking) + TRIAL_SERVICE_FEE, kind: 'refund' }) };
      return openDispute(next, booking, 'Mentor się nie pojawił', 'Mentor nie dołączył do pokoju w ciągu 10 minut od startu.', now);
    }
    case 'report-problem': {
      const booking = find(action.id);
      if (!booking) return step;
      const next = { ...step, core: patchBooking(core, booking.id, { status: 'disputed' }) };
      return openDispute(next, booking, action.reason, action.description, now);
    }
    case 'submit-review':
      return {
        world,
        core: patchBooking(core, action.id, {
          reviewed: true,
          review: action.review,
          ...(action.replacement ? { replacementRequested: true } : {}),
        }),
      };
    case 'toggle-action-item': {
      const booking = find(action.bookingId);
      if (!booking?.actionItems) return step;
      const actionItems = booking.actionItems.map((item, i) => (i === action.index ? { ...item, done: !item.done } : item));
      return { world, core: patchBooking(core, booking.id, { actionItems }) };
    }
    case 'answer-trial': {
      const booking = find(action.id);
      if (booking?.status !== 'requested') return step;
      const mentor = mentorById(booking.mentorId)?.name ?? 'Mentor';
      const student = STUDENT_ACCOUNTS[booking.studentId];
      if (action.accept) {
        return {
          core: patchBooking(core, booking.id, { status: 'scheduled' }),
          world: notify(world, student, `${mentor} potwierdza sesję próbną`, `/sesje/${booking.id}`, now),
        };
      }
      const refunded = addPayment(world, { studentId: booking.studentId, at: now, description: `Zwrot · sesja próbna (${mentor})`, amount: sessionValue(booking) + TRIAL_SERVICE_FEE, kind: 'refund' });
      return {
        core: patchBooking(core, booking.id, { status: 'cancelled', declineReason: action.reason ?? '' }),
        world: notify(refunded, student, `${mentor} nie może poprowadzić sesji próbnej — zwracamy 100% płatności`, `/sesje/${booking.id}`, now),
      };
    }
    case 'add-session-note': {
      const booking = find(action.bookingId);
      if (!booking) return step;
      const actionItems = [...(booking.actionItems ?? []), ...action.actionItems];
      return {
        core: patchBooking(core, booking.id, { note: action.note, actionItems }),
        world: notify(world, STUDENT_ACCOUNTS[booking.studentId], `${mentorById(booking.mentorId)?.name ?? 'Mentor'} dodaje notatkę po sesji`, '/postepy', now),
      };
    }
  }
}

function openDispute(step: Step, booking: Booking, reason: string, description: string, now: string): Step {
  const mentor = mentorById(booking.mentorId)?.name ?? 'Mentor';
  const student = studentNameOf(step.core, booking.studentId);
  const dispute: Dispute = {
    id: `d-${booking.id}`,
    bookingId: booking.id,
    sessionLabel: booking.id,
    studentName: student,
    mentorName: mentor,
    reason,
    opened: now,
    amount: sessionValue(booking),
    events: [...(step.world.roomEvents[booking.id] ?? []), `${clockTime(now)} — uczeń zgłosił problem`],
    studentSays: description,
    status: 'open',
  };
  let world: World = { ...step.world, disputes: [dispute, ...step.world.disputes.filter((d) => d.id !== dispute.id)] };
  world = notify(world, 'admin', `Nowy spór: ${student} — „${reason}”`, '/admin/spory', now);
  world = notify(world, mentorAccountOf(booking.mentorId), `${student} zgłasza problem z sesją — masz 48 h na odpowiedź`, '/mentor', now);
  return { core: step.core, world };
}

function planStep(step: Step, action: PlanAction, now: string): Step {
  const { world, core } = step;
  switch (action.type) {
    case 'set-goal': {
      const previous = world.goals[action.studentId];
      const goal: Goal = {
        text: action.text,
        ...(action.targetDate ? { targetDate: action.targetDate } : {}),
        milestones: previous?.milestones ?? [],
      };
      return { core, world: { ...world, goals: { ...world.goals, [action.studentId]: goal } } };
    }
    case 'toggle-milestone': {
      const goal = world.goals[action.studentId];
      if (!goal) return step;
      const milestones = goal.milestones.map((m, i) => (i === action.index ? { ...m, done: !m.done } : m));
      return { core, world: { ...world, goals: { ...world.goals, [action.studentId]: { ...goal, milestones } } } };
    }
    case 'start-plan': {
      const mentor = mentorById(action.mentorId);
      if (!mentor) return step;
      const sessions = action.perWeek * 4;
      const subscription: Subscription = {
        id: `sub-${action.studentId}-${action.mentorId}`,
        studentId: action.studentId,
        mentorId: action.mentorId,
        perWeek: action.perWeek,
        durationMin: action.durationMin,
        renewsOn: addMinutes(now, 28 * 24 * 60).slice(0, 10),
        status: 'active',
      };
      const others = world.subscriptions.filter((s) => s.id !== subscription.id);
      const paid = addPayment(
        { ...world, subscriptions: [...others, subscription] },
        {
          studentId: action.studentId,
          at: now,
          description: `Plan ${String(action.perWeek)}×${String(action.durationMin)} min · ${mentor.name}`,
          amount: planPrice(mentor.rate60, action.perWeek, action.durationMin),
          kind: 'payment',
        },
      );
      return { world: paid, core: addBalance(core, action.studentId, action.mentorId, sessions) };
    }
    case 'change-plan':
      return {
        core,
        world: {
          ...world,
          subscriptions: world.subscriptions.map((s) =>
            s.id === action.id ? { ...s, nextPeriod: { perWeek: action.perWeek, durationMin: action.durationMin } } : s,
          ),
        },
      };
    case 'set-plan-status':
      return {
        core,
        world: {
          ...world,
          subscriptions: world.subscriptions.map((s) => (s.id === action.id ? { ...s, status: action.status } : s)),
        },
      };
    case 'transfer-balance': {
      const sessions = core.balances[action.studentId][action.fromMentorId] ?? 0;
      const moved = transferSessions(sessions, action.fromMentorId, action.toMentorId);
      const emptied = addBalance(core, action.studentId, action.fromMentorId, -sessions);
      return { world, core: addBalance(emptied, action.studentId, action.toMentorId, moved) };
    }
  }
}

function threadIdFor(studentId: StudentId, mentorId: string, threads: Thread[]): string {
  return threads.find((t) => t.studentId === studentId && t.mentorId === mentorId)?.id ?? `t-${studentId}-${mentorId}`;
}

export function findThreadId(world: World, studentId: StudentId, mentorId: string): string {
  return threadIdFor(studentId, mentorId, world.threads);
}

/** A message reached the other side: their unread count and a notification. */
function delivered(world: World, core: Core, thread: Thread, from: 'student' | 'mentor', now: string): World {
  const other = from === 'student' ? 'mentor' : 'student';
  const bumped: World = {
    ...world,
    threads: world.threads.map((t) => (t.id === thread.id ? { ...t, unread: { ...t.unread, [other]: t.unread[other] + 1 } } : t)),
  };
  const sender = from === 'student' ? studentNameOf(core, thread.studentId) : (mentorById(thread.mentorId)?.name ?? 'Mentor');
  const to = from === 'student' ? mentorAccountOf(thread.mentorId) : STUDENT_ACCOUNTS[thread.studentId];
  return notify(bumped, to, `Nowa wiadomość od: ${sender}`, `/wiadomosci/${thread.id}`, now);
}

function inboxStep(step: Step, action: InboxAction, now: string): Step {
  const { world, core } = step;
  const mapThread = (id: string, fn: (t: Thread) => Thread): World => ({
    ...world,
    threads: world.threads.map((t) => (t.id === id ? fn(t) : t)),
  });
  switch (action.type) {
    case 'open-thread': {
      const id = threadIdFor(action.studentId, action.mentorId, world.threads);
      if (world.threads.some((t) => t.id === id)) return step;
      const thread: Thread = { id, studentId: action.studentId, mentorId: action.mentorId, messages: [], unread: { student: 0, mentor: 0 } };
      return { core, world: { ...world, threads: [...world.threads, thread] } };
    }
    case 'send-message': {
      const thread = world.threads.find((t) => t.id === action.threadId);
      if (!thread) return step;
      const message = { id: `${thread.id}-${String(thread.messages.length + 1)}`, from: action.from, text: action.text, at: now, ...(action.failed ? { failed: true } : {}) };
      const added = mapThread(thread.id, (t) => ({ ...t, messages: [...t.messages, message] }));
      return { core, world: action.failed ? added : delivered(added, core, thread, action.from, now) };
    }
    case 'retry-message': {
      const thread = world.threads.find((t) => t.id === action.threadId);
      const message = thread?.messages.find((m) => m.id === action.messageId);
      if (!thread || !message?.failed) return step;
      const resent = mapThread(thread.id, (t) => ({
        ...t,
        messages: t.messages.map((m) => {
          if (m.id !== message.id) return m;
          const sent = { ...m, at: now };
          delete sent.failed;
          return sent;
        }),
      }));
      return { core, world: delivered(resent, core, thread, message.from, now) };
    }
    case 'read-thread':
      return { core, world: mapThread(action.threadId, (t) => ({ ...t, unread: { ...t.unread, [action.side]: 0 } })) };
    case 'read-notification':
      return { core, world: { ...world, notifications: world.notifications.map((n) => (n.id === action.id ? { ...n, read: true } : n)) } };
    case 'read-all-notifications':
      return {
        core,
        world: { ...world, notifications: world.notifications.map((n) => (n.accountId === action.accountId ? { ...n, read: true } : n)) },
      };
    case 'update-profile':
      return {
        core,
        world: { ...world, profiles: { ...world.profiles, [action.accountId]: { ...world.profiles[action.accountId], ...action.patch } } },
      };
    case 'set-reauth':
      return { core, world: { ...world, reauth: action.value } };
  }
}

function mentorStep(step: Step, action: MentorAction, now: string): Step {
  const { world, core } = step;
  const settingsOf = (mentorId: string) => world.mentorSettings[mentorId] ?? initialSettings(mentorId);
  const withSettings = (mentorId: string, settings: MentorSettings): World => ({
    ...world,
    mentorSettings: { ...world.mentorSettings, [mentorId]: settings },
  });
  switch (action.type) {
    case 'set-mentor-note':
      return { core, world: { ...world, mentorNotes: { ...world.mentorNotes, [action.studentId]: action.text } } };
    case 'update-mentor-settings':
      return { core, world: withSettings(action.mentorId, { ...settingsOf(action.mentorId), ...action.patch }) };
    case 'add-exception': {
      const settings = settingsOf(action.mentorId);
      return { core, world: withSettings(action.mentorId, { ...settings, exceptions: [...settings.exceptions, action.exception] }) };
    }
    case 'remove-exception': {
      const settings = settingsOf(action.mentorId);
      return {
        core,
        world: withSettings(action.mentorId, { ...settings, exceptions: settings.exceptions.filter((e) => e.id !== action.id) }),
      };
    }
    case 'request-payout': {
      const available = world.earnings.filter((e) => e.mentorId === action.mentorId && e.status === 'available');
      const amount = available.reduce((sum, e) => sum + e.gross - e.fee, 0n);
      const today = now.slice(0, 10);
      const alreadyToday = world.payouts.some((p) => p.mentorId === action.mentorId && p.at.slice(0, 10) === today);
      // KONCEPCJA §M5: minimum 100 zł, at most one manual payout a day.
      if (amount < PAYOUT_MINIMUM || alreadyToday) return step;
      return {
        core,
        world: {
          ...world,
          payouts: [{ id: `po-${String(world.payouts.length + 1)}`, mentorId: action.mentorId, at: now, amount }, ...world.payouts],
          earnings: world.earnings.map((e) => (available.includes(e) ? { ...e, status: 'in-transit' } : e)),
        },
      };
    }
    case 'save-onboarding':
      return { core, world: { ...world, onboardingDraft: { ...world.onboardingDraft, ...action.patch } } };
    case 'submit-application': {
      const application = world.applications.find((a) => a.accountId === action.accountId);
      if (!application) return step;
      const rest = { ...application };
      delete rest.decision;
      const updated: Application = { ...rest, status: 'submitted', submitted: now.slice(0, 10) };
      let next: World = { ...world, applications: world.applications.map((a) => (a.id === application.id ? updated : a)) };
      next = audit(next, application.name, 'wysłał wniosek do weryfikacji', application.name, now);
      next = notify(next, 'admin', `Wniosek mentora po poprawkach: ${application.name}`, '/admin/weryfikacja', now);
      return { core, world: next };
    }
  }
}

const DECISION_TEXT = {
  approve: { status: 'approved', audit: 'zatwierdził wniosek', candidate: 'Twój profil mentora został zatwierdzony i jest publiczny', link: '/mentor' },
  changes: { status: 'changes_requested', audit: 'poprosił o zmiany', candidate: 'Zespół zaufania prosi o poprawki we wniosku', link: '/mentor/onboarding/1' },
  reject: { status: 'rejected', audit: 'odrzucił wniosek', candidate: 'Twój wniosek mentora został odrzucony', link: '/mentor/onboarding/6' },
} as const;

const OUTCOME_TEXT: Record<DisputeOutcome, string> = {
  balance: 'zwrot sesji do salda',
  card: 'zwrot na kartę',
  partial: 'częściowy zwrot na kartę',
  none: 'brak zwrotu',
};

function trustStep(step: Step, action: TrustAction, now: string): Step {
  const { world, core } = step;
  switch (action.type) {
    case 'decide-application': {
      const application = world.applications.find((a) => a.id === action.id);
      if (!application) return step;
      const text = DECISION_TEXT[action.decision];
      const updated: Application = {
        ...application,
        status: text.status,
        decision: { fields: action.fields, comment: action.comment },
      };
      let next: World = { ...world, applications: world.applications.map((a) => (a.id === application.id ? updated : a)) };
      next = audit(next, 'Zespół zaufania', text.audit, application.name, now);
      next = notify(next, application.accountId, text.candidate, text.link, now);
      return { core, world: next };
    }
    case 'resolve-dispute': {
      const dispute = world.disputes.find((d) => d.id === action.id);
      if (dispute?.status !== 'open') return step;
      const resolved: Dispute = { ...dispute, status: 'resolved', resolution: { outcome: action.outcome, refund: action.refund, message: action.message } };
      let next: World = { ...world, disputes: world.disputes.map((d) => (d.id === dispute.id ? resolved : d)) };
      next = audit(next, 'Zespół zaufania', `rozstrzygnął spór: ${OUTCOME_TEXT[action.outcome]}`, `${dispute.studentName} ↔ ${dispute.mentorName}`, now);
      let nextCore = core;
      const booking = dispute.bookingId ? core.bookings.find((b) => b.id === dispute.bookingId) : undefined;
      if (booking) {
        if (action.outcome === 'balance' && booking.type === 'plan') nextCore = addBalance(core, booking.studentId, booking.mentorId, 1);
        if ((action.outcome === 'card' || action.outcome === 'partial') && action.refund > 0n) {
          next = addPayment(next, { studentId: booking.studentId, at: now, description: `Zwrot po sporze · ${dispute.mentorName}`, amount: action.refund, kind: 'refund' });
        }
        const message = `Spór rozstrzygnięty: ${OUTCOME_TEXT[action.outcome]}`;
        next = notify(next, STUDENT_ACCOUNTS[booking.studentId], message, `/sesje/${booking.id}`, now);
        next = notify(next, mentorAccountOf(booking.mentorId), message, '/mentor/zarobki', now);
      }
      return { core: nextCore, world: next };
    }
  }
}

function is<A extends WorldAction>(types: ReadonlySet<A['type']>, action: WorldAction): action is A {
  return types.has(action.type);
}

export function worldReducer(step: Step, action: WorldAction, now: string): Step {
  if (is<RoomAction>(ROOM, action)) return bookingStep(step, action, now);
  if (is<PlanAction>(PLAN, action)) return planStep(step, action, now);
  if (is<InboxAction>(INBOX, action)) return inboxStep(step, action, now);
  if (is<MentorAction>(MENTOR, action)) return mentorStep(step, action, now);
  return trustStep(step, action, now);
}

/** Application of a mentor account (Adam), if any. */
export function applicationOf(world: World, accountId: AccountId): Application | undefined {
  return world.applications.find((a) => a.accountId === accountId);
}

/** Free slots use the mentor's current weekly template (M3 edits show up in P3, U1 and U5). */
export function liveMentor(world: World, mentor: Mentor): Mentor {
  const template = world.mentorSettings[mentor.id]?.template;
  return template ? { ...mentor, availability: template } : mentor;
}

/** M3 booking settings as slot rules for P3, U1 and U5. */
export function slotRulesOf(world: World, mentorId: string): SlotRules {
  const settings = world.mentorSettings[mentorId];
  if (!settings) return { minNoticeHours: 6, bufferMin: 0, daysOff: [] };
  return {
    minNoticeHours: settings.minNoticeHours,
    bufferMin: settings.bufferMin,
    daysOff: settings.exceptions.filter((e) => e.type === 'off').map(({ from, to }) => ({ from, to })),
  };
}

/** Unread notifications of an account (header bell). */
export function unreadCount(world: World, accountId: AccountId): number {
  return world.notifications.filter((n) => n.accountId === accountId && !n.read).length;
}

/** Earliest ISO first. */
export function byTime<T extends { at: string }>(a: T, b: T): number {
  return toMs(a.at) - toMs(b.at);
}

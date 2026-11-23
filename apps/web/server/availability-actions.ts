'use server';

import {
  AddAvailabilityExceptionInput,
  AvailabilityExceptionId,
  type MentorCalendarView,
  SaveAvailabilityTemplateInput,
  UpdateMentorSettingsInput,
} from '@kompas/contracts/scheduling';
import type { Result } from '@kompas/core';
import { createRequestScope } from '@kompas/core';
import {
  type BookingError,
  toExceptionInput,
  toMentorCalendarView,
  toRuleInput,
} from '@kompas/core/scheduling';
import { revalidatePath } from 'next/cache';
import { getContainer } from './runtime.ts';
import { getCurrentUser } from './session.ts';

interface AvailabilityIssueView {
  readonly field: string;
  readonly problem: string;
}

export type AvailabilityActionResult =
  | { readonly ok: true; readonly calendar: MentorCalendarView }
  | {
      readonly ok: false;
      readonly kind: 'invalid' | 'conflict' | 'forbidden' | 'not_found';
      readonly issues?: readonly AvailabilityIssueView[];
      readonly bookingIds?: readonly string[];
    };

const invalid = (issues: readonly AvailabilityIssueView[]): AvailabilityActionResult => ({
  ok: false,
  kind: 'invalid',
  issues,
});

const toFailure = (error: BookingError): AvailabilityActionResult => {
  switch (error.code) {
    case 'scheduling.invalid_availability':
      return invalid(error.issues);
    case 'scheduling.availability_conflicts':
      return { ok: false, kind: 'conflict', bookingIds: error.bookingIds };
    case 'scheduling.version_conflict':
      return { ok: false, kind: 'conflict' };
    case 'scheduling.forbidden':
      return { ok: false, kind: 'forbidden' };
    case 'scheduling.not_found':
    case 'scheduling.mentor_unavailable':
      return { ok: false, kind: 'not_found' };
    case 'scheduling.email_not_verified':
      return { ok: false, kind: 'forbidden' };
    case 'scheduling.invalid_goal':
      return invalid([{ field: 'goal', problem: error.issue }]);
    case 'scheduling.slot_taken':
    case 'scheduling.student_busy':
    case 'scheduling.trial_already_used':
    case 'scheduling.hold_expired':
    case 'scheduling.not_accepting_new':
    case 'scheduling.insufficient_credit':
    case 'scheduling.hold_rate_limited':
    case 'booking.invalid_transition':
      return { ok: false, kind: 'conflict' };
  }
};

/** The signed-in mentor's own calendar (M3) — the owner comes from the session, never the body. */
export const loadMentorCalendar = async (): Promise<MentorCalendarView | null> => {
  const actor = await getCurrentUser();
  if (actor === null) return null;
  const scope = createRequestScope(getContainer(), { requestId: crypto.randomUUID() });
  const result = await scope.cradle.getMentorCalendar(actor);
  return result.isErr() ? null : toMentorCalendarView(result.value);
};

/** Every mutation returns the fresh calendar, so M3 can re-render without a second round trip. */
const finish = async (
  scope: ReturnType<typeof createRequestScope>,
  actor: NonNullable<Awaited<ReturnType<typeof getCurrentUser>>>,
  result: Result<unknown, BookingError>,
): Promise<AvailabilityActionResult> => {
  if (result.isErr()) return toFailure(result.error);
  const calendar = await scope.cradle.getMentorCalendar(actor);
  if (calendar.isErr()) return toFailure(calendar.error);
  revalidatePath('/mentor/kalendarz');
  return { ok: true, calendar: toMentorCalendarView(calendar.value) };
};

/** M3 "Zapisz": replaces the whole weekly template (requirement 1, Q11). */
export async function saveAvailabilityTemplateAction(
  input: unknown,
): Promise<AvailabilityActionResult> {
  const parsed = SaveAvailabilityTemplateInput.safeParse(input);
  if (!parsed.success) {
    return invalid(
      parsed.error.issues.map((i) => ({ field: i.path.join('.'), problem: i.message })),
    );
  }
  const actor = await getCurrentUser();
  if (actor === null) return { ok: false, kind: 'forbidden' };
  const scope = createRequestScope(getContainer(), { requestId: crypto.randomUUID() });
  const result = await scope.cradle.saveAvailabilityTemplate(actor, {
    rules: parsed.data.rules.map(toRuleInput),
    expectedVersion: parsed.data.expectedVersion,
    acknowledgeConflicts: parsed.data.acknowledgeConflicts ?? false,
  });
  return finish(scope, actor, result);
}

/** M3: adds an `off`/`extra` exception (requirement 1, Q10). */
export async function addAvailabilityExceptionAction(
  input: unknown,
): Promise<AvailabilityActionResult> {
  const parsed = AddAvailabilityExceptionInput.safeParse(input);
  if (!parsed.success) {
    return invalid(
      parsed.error.issues.map((i) => ({ field: i.path.join('.'), problem: i.message })),
    );
  }
  const actor = await getCurrentUser();
  if (actor === null) return { ok: false, kind: 'forbidden' };
  const scope = createRequestScope(getContainer(), { requestId: crypto.randomUUID() });
  const result = await scope.cradle.addAvailabilityException(actor, toExceptionInput(parsed.data));
  return finish(scope, actor, result);
}

/** M3: removes the mentor's own exception; someone else's → 404. */
export async function deleteAvailabilityExceptionAction(
  id: unknown,
): Promise<AvailabilityActionResult> {
  const parsed = AvailabilityExceptionId.safeParse(id);
  if (!parsed.success) return { ok: false, kind: 'not_found' };
  const actor = await getCurrentUser();
  if (actor === null) return { ok: false, kind: 'forbidden' };
  const scope = createRequestScope(getContainer(), { requestId: crypto.randomUUID() });
  const result = await scope.cradle.deleteAvailabilityException(actor, parsed.data);
  return finish(scope, actor, result);
}

/** M3 settings: notice 2–48 h (Q9), buffer 0–30 min, IANA time zone (Q12). */
export async function updateMentorSettingsAction(
  input: unknown,
): Promise<AvailabilityActionResult> {
  const parsed = UpdateMentorSettingsInput.safeParse(input);
  if (!parsed.success) {
    return invalid(
      parsed.error.issues.map((i) => ({ field: i.path.join('.'), problem: i.message })),
    );
  }
  const actor = await getCurrentUser();
  if (actor === null) return { ok: false, kind: 'forbidden' };
  const scope = createRequestScope(getContainer(), { requestId: crypto.randomUUID() });
  const result = await scope.cradle.updateMentorSettings(actor, parsed.data);
  return finish(scope, actor, result);
}

import { err, ok, type Result } from '../../../shared/domain/index.ts';
import type { InvalidProfileTransition } from './catalog.errors.ts';
import type { MentorProfileEvent, MentorProfileStatus } from './mentor-profile.status.ts';

export type { MentorProfileEvent, MentorProfileStatus } from './mentor-profile.status.ts';

/**
 * Transition table from the F2 spec ("Model domeny") — the single source of truth for the profile
 * lifecycle. `withdrawn` is the "Wycofaj wniosek" action of Q6 (submitted → draft).
 */
const transitions = {
  draft: { submitted: 'submitted' },
  submitted: {
    withdrawn: 'draft',
    approved: 'approved',
    changes_requested: 'changes_requested',
    rejected: 'rejected',
  },
  changes_requested: { submitted: 'submitted' },
  approved: { suspended: 'suspended' }, // suspension by admin_trust (Q8)
  suspended: { reinstated: 'approved' },
  rejected: {}, // a new application after 30 days (Q7) arrives with E2-S4
} as const satisfies Record<
  MentorProfileStatus,
  Partial<Record<MentorProfileEvent, MentorProfileStatus>>
>;

export const transition = (
  from: MentorProfileStatus,
  event: MentorProfileEvent,
): Result<MentorProfileStatus, InvalidProfileTransition> => {
  const allowed: Partial<Record<MentorProfileEvent, MentorProfileStatus>> = transitions[from];
  const to = allowed[event];
  return to === undefined ? err({ code: 'catalog.invalid_transition', from, event }) : ok(to);
};

/** Only an approved profile is public (brief rule 8); every other status is "profile unavailable". */
export const isPublic = (status: MentorProfileStatus): boolean => status === 'approved';

/**
 * Q13/Q5: only an approved mentor may be booked. A suspended profile stays public-facing as
 * "unavailable" but never takes new bookings, so `scheduling` learns both states through one flag.
 */
export const isBookable = (status: MentorProfileStatus): boolean => status === 'approved';

/** The mentor may edit the profile only while no one is reviewing it and it is not closed (Q6). */
export const isEditable = (status: MentorProfileStatus): boolean =>
  status === 'draft' || status === 'changes_requested' || status === 'approved';

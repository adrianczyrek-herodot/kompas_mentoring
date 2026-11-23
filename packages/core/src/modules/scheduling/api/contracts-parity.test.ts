import * as contracts from '@kompas/contracts/scheduling';
import { describe, expect, it } from 'vitest';
import { AVAILABILITY, GOAL, HOLD } from '../domain/policies/config.ts';
import { toSchedulingProblem } from './availability.api.ts';

describe('contracts mirror the scheduling availability rules', () => {
  it('uses the same limits as the domain config', () => {
    expect(contracts.SCHEDULING_LIMITS).toEqual({
      rule: { minMinutes: AVAILABILITY.minRuleMinutes, gridMinutes: AVAILABILITY.gridMinutes },
      weeklyMinimumMinutes: AVAILABILITY.weeklyMinimumMinutes,
      notice: {
        minMinutes: AVAILABILITY.notice.minMinutes,
        maxMinutes: AVAILABILITY.notice.maxMinutes,
        stepMinutes: AVAILABILITY.notice.stepMinutes,
      },
      buffer: {
        minMinutes: AVAILABILITY.buffer.minMinutes,
        maxMinutes: AVAILABILITY.buffer.maxMinutes,
        stepMinutes: AVAILABILITY.buffer.stepMinutes,
      },
      exceptionNoteMaxLength: 300,
      goal: { minLength: GOAL.minLength, maxLength: GOAL.maxLength },
      hold: { minutes: HOLD.durationMinutes, maxPerHour: HOLD.maxPerHour },
    });
  });
});

describe('scheduling API mapping', () => {
  it('maps expected failures to RFC 9457 statuses', () => {
    expect(toSchedulingProblem({ code: 'scheduling.forbidden' }).status).toBe(403);
    expect(toSchedulingProblem({ code: 'scheduling.not_found' }).status).toBe(404);
    expect(toSchedulingProblem({ code: 'scheduling.mentor_unavailable' }).status).toBe(404);
    expect(
      toSchedulingProblem({ code: 'scheduling.version_conflict', expected: 1, actual: 2 }).status,
    ).toBe(409);
    expect(
      toSchedulingProblem({ code: 'scheduling.availability_conflicts', bookingIds: ['b1'] })
        .bookingIds,
    ).toEqual(['b1']);
    expect(
      toSchedulingProblem({
        code: 'scheduling.invalid_availability',
        issues: [{ field: 'rules.0', problem: 'overlap' }],
      }),
    ).toEqual({
      status: 422,
      code: 'scheduling.invalid_availability',
      issues: [{ field: 'rules.0', problem: 'overlap' }],
    });
  });
});

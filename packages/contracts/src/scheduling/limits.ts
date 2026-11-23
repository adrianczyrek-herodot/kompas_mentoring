// Limits of the scheduling contracts. `packages/core` mirrors them in
// `scheduling/domain/policies/config.ts`; `contracts-parity.test.ts` keeps both in step.

export const SCHEDULING_LIMITS = {
  rule: { minMinutes: 30, gridMinutes: 30 },
  /** Weekly template below this is not enough to submit the M1 application (F2). */
  weeklyMinimumMinutes: 180,
  /** Q9: booking notice — 2 h to 48 h, 1 h steps. */
  notice: { minMinutes: 120, maxMinutes: 2_880, stepMinutes: 60 },
  /** M3: buffer after a session — 0–30 min every 5 min. */
  buffer: { minMinutes: 0, maxMinutes: 30, stepMinutes: 5 },
  exceptionNoteMaxLength: 300,
} as const;

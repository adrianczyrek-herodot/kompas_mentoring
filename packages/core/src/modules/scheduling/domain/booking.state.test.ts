import { describe, expect, it } from 'vitest';
import { transition } from './booking.state.ts';

describe('booking state machine', () => {
  it('follows the trial path from hold to scheduled', () => {
    const status = transition('hold', 'checkout_started')
      .andThen((s) => transition(s, 'payment_succeeded'))
      .andThen((s) => transition(s, 'mentor_accepted'));
    expect(status._unsafeUnwrap()).toBe('scheduled');
  });

  it('rejects transitions missing from the table', () => {
    expect(transition('cancelled', 'started')._unsafeUnwrapErr()).toEqual({
      code: 'booking.invalid_transition',
      from: 'cancelled',
      event: 'started',
    });
  });
});

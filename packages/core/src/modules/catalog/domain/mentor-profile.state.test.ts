import { describe, expect, it } from 'vitest';
import {
  isEditable,
  isPublic,
  type MentorProfileEvent,
  type MentorProfileStatus,
  transition,
} from './mentor-profile.state.ts';

const STATUSES: MentorProfileStatus[] = [
  'draft',
  'submitted',
  'changes_requested',
  'approved',
  'suspended',
  'rejected',
];
const EVENTS: MentorProfileEvent[] = [
  'submitted',
  'withdrawn',
  'approved',
  'changes_requested',
  'rejected',
  'suspended',
  'reinstated',
];

const ALLOWED: [MentorProfileStatus, MentorProfileEvent, MentorProfileStatus][] = [
  ['draft', 'submitted', 'submitted'],
  ['submitted', 'withdrawn', 'draft'],
  ['submitted', 'approved', 'approved'],
  ['submitted', 'changes_requested', 'changes_requested'],
  ['submitted', 'rejected', 'rejected'],
  ['changes_requested', 'submitted', 'submitted'],
  ['approved', 'suspended', 'suspended'],
  ['suspended', 'reinstated', 'approved'],
];

describe('mentor profile state machine', () => {
  it.each(ALLOWED)('%s --%s--> %s', (from, event, to) => {
    expect(transition(from, event)._unsafeUnwrap()).toBe(to);
  });

  it('rejects every transition missing from the table with catalog.invalid_transition', () => {
    const allowed = new Set(ALLOWED.map(([from, event]) => `${from}:${event}`));
    for (const from of STATUSES) {
      for (const event of EVENTS.filter((e) => !allowed.has(`${from}:${e}`))) {
        expect(transition(from, event)._unsafeUnwrapErr()).toEqual({
          code: 'catalog.invalid_transition',
          from,
          event,
        });
      }
    }
  });

  it('makes only approved profiles public (brief rule 8)', () => {
    expect(STATUSES.filter(isPublic)).toEqual(['approved']);
  });

  it('locks the profile while under review or closed (Q6)', () => {
    expect(STATUSES.filter(isEditable)).toEqual(['draft', 'changes_requested', 'approved']);
  });
});

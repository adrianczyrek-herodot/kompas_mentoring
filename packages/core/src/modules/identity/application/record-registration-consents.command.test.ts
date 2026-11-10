import { FakeClock, MOCKUP_NOW } from '@kompas/testing';
import { describe, expect, it } from 'vitest';
import { UserId } from '../../../shared/domain/index.ts';
import type { Consent } from '../domain/consent.entity.ts';
import { makeRecordRegistrationConsents } from './record-registration-consents.command.ts';

const userId = UserId.parse('0193a1f2-7b2c-7d3e-9f40-5a6b7c8d9e0f');

const setup = () => {
  const saved: Consent[] = [];
  const clock = new FakeClock(MOCKUP_NOW);
  const record = makeRecordRegistrationConsents({
    clock,
    consentRepository: {
      saveAll: (consents) => {
        saved.push(...consents);
        return Promise.resolve();
      },
    },
  });
  return { record, saved, clock };
};

describe('recordRegistrationConsents (P4, Q6)', () => {
  it('stores terms and privacy with versions and the clock time; marketing only when given', async () => {
    const { record, saved, clock } = setup();
    const result = await record(userId, { terms: true, privacy: true, marketing: false });
    expect(result.isOk()).toBe(true);
    expect(saved.map((c) => c.document)).toEqual(['terms', 'privacy']);
    expect(saved.every((c) => c.version === '2026-11-10' && c.givenAt.equals(clock.now()))).toBe(
      true,
    );
  });

  it('stores the optional marketing consent', async () => {
    const { record, saved } = setup();
    await record(userId, { terms: true, privacy: true, marketing: true });
    expect(saved.map((c) => c.document)).toContain('marketing');
  });

  it('refuses registration without the required terms and saves nothing', async () => {
    const { record, saved } = setup();
    const result = await record(userId, { terms: false, privacy: true, marketing: true });
    expect(result._unsafeUnwrapErr()).toEqual({
      code: 'identity.required_consent_missing',
      document: 'terms',
    });
    expect(saved).toHaveLength(0);
  });

  it('refuses registration without the privacy policy', async () => {
    const { record } = setup();
    const result = await record(userId, { terms: true, privacy: false, marketing: false });
    expect(result._unsafeUnwrapErr().document).toBe('privacy');
  });
});
